import OpenAI from 'openai';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { URL } from 'url';

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface FactCheckOptions {
  maxClaims?: number;
  crawlDepth?: number;
  newsTimeWindow?: number; // months
  marketsFocus?: string;
  languageFilter?: string;
}

export interface Claim {
  id: string;
  type: 'Entity fact' | 'Event/time' | 'Quantity/metric' | 'Financial' | 'Award/ranking' | 'Capability/feature' | 'Promise/forecast';
  text: string;
  entities: Array<{
    kind: 'company' | 'person' | 'brand' | 'place' | 'product';
    name: string;
    country_code?: string;
    extra?: any;
  }>;
  dates: string[];
  metrics: Array<{
    name: string;
    value: number;
    unit: string;
  }>;
  is_forecast: boolean;
}

export interface Evidence {
  newsapi: Array<{
    title: string;
    source: string;
    url: string;
    publishedAt: string;
    snippet?: string;
  }>;
  companies_house?: {
    company_number: string;
    profile_endpoint: string;
    fields_checked: string[];
    data?: any;
  };
}

export interface Verdict {
  claim_id: string;
  verdict: 'Verified' | 'Partially verified' | 'Contradicted' | 'Unverifiable';
  confidence: number;
  rationale: string;
  evidence_used: {
    companies_house_fields: string[];
    newsapi_urls: string[];
  };
  notes: string[];
}

export interface FactCheckResult {
  url: string;
  extracted_on: string;
  claims: Array<Claim & {
    evidence: Evidence;
    verdict: string;
    confidence: number;
    rationale: string;
    notes: string[];
  }>;
}

export class PageFetcher {
  static async fetchPage(url: string): Promise<{ content: string; title: string; publishDate?: string }> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Remove script and style elements
      $('script, style, nav, footer, header, .cookie-banner, .advertisement').remove();
      
      // Extract title
      const title = $('title').text().trim() || $('h1').first().text().trim() || '';
      
      // Extract publish date from meta tags
      const publishDate = $('meta[property="article:published_time"]').attr('content') ||
                         $('meta[name="date"]').attr('content') ||
                         $('time[datetime]').attr('datetime');
      
      // Extract main content
      const content = $('main, article, .content, #content, .post, .article').first().text() || 
                     $('body').text();
      
      // Clean up whitespace
      const cleanContent = content.replace(/\s+/g, ' ').trim();
      
      return {
        content: cleanContent,
        title,
        publishDate: publishDate || undefined
      };
    } catch (error) {
      throw new Error(`Failed to fetch page: ${error.message}`);
    }
  }
}

export class ClaimMiner {
  static async extractClaims(
    url: string,
    title: string,
    content: string,
    publishDate?: string,
    maxClaims = 25
  ): Promise<Claim[]> {
    const prompt = `WEBPAGE_CONTEXT:
- url: ${url}
- title: ${title}
- published_or_updated: ${publishDate || null}

FULL_TEXT:
${content.substring(0, 8000)} // Truncate for token limits

INSTRUCTIONS:
1) Extract up to ${maxClaims} factual claims that could plausibly be verified with public sources (news reports, Companies House for UK companies, official stats).
2) Keep each claim atomic (one assertion per claim). If a sentence has multiple assertions, split them.
3) For each claim, identify entities (company/person/brand/place), dates/timeframes, quantities/metrics/currencies, and any awards/rankings.
4) If a claim is a forecast/promise/target, set \`is_forecast:true\` and include the target date/metric.
5) Use British English and ISO 8601 dates.
6) Output STRICT JSON matching the schema below. Do not include any commentary.

SCHEMA:
{
  "claims": [
    {
      "id": "c_0001",
      "type": "Entity fact | Event/time | Quantity/metric | Financial | Award/ranking | Capability/feature | Promise/forecast",
      "text": "<short atomic claim>",
      "entities": [
        {"kind":"company|person|brand|place|product","name":"<as written or normalised>","country_code":"GB|...","extra":{}}
      ],
      "dates": ["YYYY-MM-DD", "..."],
      "metrics": [{"name":"<e.g., revenue, users>","value":1234,"unit":"GBP|%|users|..."}],
      "is_forecast": false
    }
  ]
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are a careful fact-checking assistant. Your job is to read webpage text and extract atomic, verifiable claims as structured JSON. Each claim must be concise, specific, and tied to identifiable entities, timeframes, and units where applicable. Exclude pure opinions and vague marketing claims unless they include measurable targets (then mark is_forecast:true)."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content);
      return result.claims || [];
    } catch (error) {
      console.error('Error extracting claims:', error);
      throw new Error('Failed to extract claims from content');
    }
  }
}

export class EvidenceFetcher {
  static async fetchNewsEvidence(claim: Claim, timeWindowMonths = 24): Promise<Evidence['newsapi']> {
    if (!process.env.NEWS_API_KEY) {
      console.log('No NEWS_API_KEY found, skipping news evidence collection');
      return [];
    }

    try {
      // Try the free tier endpoint first (top-headlines)
      const entityNames = claim.entities.map(e => e.name);
      const mainEntity = entityNames[0] || '';
      
      // For free tier, try top-headlines endpoint which is usually available
      const headlinesParams = new URLSearchParams({
        q: mainEntity,
        language: 'en',
        pageSize: '10',
        apiKey: process.env.NEWS_API_KEY
      });

      const headlinesResponse = await fetch(`https://newsapi.org/v2/top-headlines?${headlinesParams}`);
      
      if (headlinesResponse.ok) {
        const headlinesData = await headlinesResponse.json();
        
        if (headlinesData.status === 'ok' && headlinesData.articles) {
          console.log(`Found ${headlinesData.articles.length} news articles via top-headlines`);
          return headlinesData.articles.map((article: any) => ({
            title: article.title,
            source: article.source.name,
            url: article.url,
            publishedAt: article.publishedAt.split('T')[0],
            snippet: article.description
          }));
        }
      }

      // If top-headlines failed, try everything endpoint (requires paid tier)
      const keyTerms = claim.text.split(' ').filter(word => 
        word.length > 3 && 
        !['the', 'and', 'was', 'were', 'has', 'have', 'will', 'been'].includes(word.toLowerCase())
      ).slice(0, 3).join(' ');
      
      const query = mainEntity || keyTerms;
      const fromDate = new Date();
      fromDate.setMonth(fromDate.getMonth() - timeWindowMonths);
      
      const searchParams = new URLSearchParams({
        q: query,
        from: fromDate.toISOString().split('T')[0],
        language: 'en',
        sortBy: 'relevancy',
        pageSize: '5',
        apiKey: process.env.NEWS_API_KEY
      });

      const response = await fetch(`https://newsapi.org/v2/everything?${searchParams}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`NewsAPI error: ${response.status} - ${errorText}`);
        
        // Handle common NewsAPI issues
        if (response.status === 426) {
          console.error('NewsAPI 426: Free tier API key - upgrade required for /everything endpoint');
        } else if (response.status === 401) {
          console.error('NewsAPI 401: Invalid API key');
        } else if (response.status === 429) {
          console.error('NewsAPI 429: Rate limit exceeded');
        }
        
        // Return empty array but don't fail the whole process
        return [];
      }

      const data = await response.json();
      
      // Check for API-level errors
      if (data.status === 'error') {
        console.error(`NewsAPI API error: ${data.code} - ${data.message}`);
        return [];
      }
      
      console.log(`Found ${data.articles?.length || 0} news articles via everything endpoint`);
      return (data.articles || []).map((article: any) => ({
        title: article.title,
        source: article.source.name,
        url: article.url,
        publishedAt: article.publishedAt.split('T')[0],
        snippet: article.description
      }));
    } catch (error) {
      console.error('Error fetching news evidence:', error);
      return [];
    }
  }

  static async fetchCompaniesHouseEvidence(claim: Claim): Promise<Evidence['companies_house'] | undefined> {
    if (!process.env.COMPANIES_HOUSE_API_KEY) {
      return undefined;
    }

    // Look for company entities
    const companyEntity = claim.entities.find(e => e.kind === 'company');
    if (!companyEntity) {
      return undefined;
    }

    try {
      // Search for company
      const searchResponse = await fetch(
        `https://api.company-information.service.gov.uk/search/companies?q=${encodeURIComponent(companyEntity.name)}`,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(process.env.COMPANIES_HOUSE_API_KEY + ':').toString('base64')}`
          }
        }
      );

      if (!searchResponse.ok) {
        return undefined;
      }

      const searchData = await searchResponse.json();
      const company = searchData.items?.[0];
      
      if (!company) {
        return undefined;
      }

      // Fetch company profile
      const profileResponse = await fetch(
        `https://api.company-information.service.gov.uk/company/${company.company_number}`,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(process.env.COMPANIES_HOUSE_API_KEY + ':').toString('base64')}`
          }
        }
      );

      if (!profileResponse.ok) {
        return undefined;
      }

      const profileData = await profileResponse.json();

      return {
        company_number: company.company_number,
        profile_endpoint: `/company/${company.company_number}`,
        fields_checked: ['date_of_creation', 'registered_office_address', 'company_status', 'sic_codes'],
        data: profileData
      };
    } catch (error) {
      console.error('Error fetching Companies House evidence:', error);
      return undefined;
    }
  }
}

export class Verifier {
  static async verifyClaim(claim: Claim, evidence: Evidence): Promise<Verdict> {
    const prompt = `CLAIM:
{id: "${claim.id}", type: "${claim.type}", text: "${claim.text}", entities: ${JSON.stringify(claim.entities)}, dates: ${JSON.stringify(claim.dates)}, metrics: ${JSON.stringify(claim.metrics)}, is_forecast: ${claim.is_forecast}}

EVIDENCE:
- COMPANIES_HOUSE_JSON: ${evidence.companies_house ? JSON.stringify(evidence.companies_house.data) : null}
- NEWSAPI_ARTICLES: ${JSON.stringify(evidence.newsapi)}
- BACKGROUND_NOTES: ${null}

TASK:
1) Compare the claim precisely with evidence (entities, numbers, dates, locations).
2) If CH data conclusively matches company facts, treat as strong evidence.
3) For news, require ≥2 independent reputable sources for "Verified" unless CH suffices.
4) If some details match but others are missing or slightly different (±15% or adjacent dates/places), choose "Partially verified".
5) If reliable sources contradict the claim or CH disproves it, choose "Contradicted".
6) If evidence is insufficient or claim is opinion/ambiguous, choose "Unverifiable".
7) Output STRICT JSON only.

OUTPUT SCHEMA:
{
  "claim_id": "${claim.id}",
  "verdict": "Verified | Partially verified | Contradicted | Unverifiable",
  "confidence": 0.0,
  "rationale": "<2-4 sentence explanation citing which evidence matched or conflicted>",
  "evidence_used": {
    "companies_house_fields": ["date_of_creation","registered_office_address", "..."],
    "newsapi_urls": ["...", "..."]
  },
  "notes": []
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You verify a single claim using supplied evidence. You must decide: Verified | Partially verified | Contradicted | Unverifiable. Prefer official records (Companies House) and multiple independent reputable news sources. Treat the LLM's own knowledge as context only—never sufficient alone for \"Verified\"."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content);
      return result;
    } catch (error) {
      console.error('Error verifying claim:', error);
      return {
        claim_id: claim.id,
        verdict: 'Unverifiable',
        confidence: 0.0,
        rationale: 'Error occurred during verification process',
        evidence_used: {
          companies_house_fields: [],
          newsapi_urls: []
        },
        notes: ['Verification failed due to technical error']
      };
    }
  }
}

export class FactChecker {
  static async checkFacts(url: string, options: FactCheckOptions = {}): Promise<FactCheckResult> {
    const {
      maxClaims = 25,
      newsTimeWindow = 24,
    } = options;

    try {
      // Step 1: Fetch and extract content
      const { content, title, publishDate } = await PageFetcher.fetchPage(url);
      
      // Step 2: Extract claims
      const claims = await ClaimMiner.extractClaims(url, title, content, publishDate, maxClaims);
      
      // Step 3: Gather evidence and verify each claim
      const verifiedClaims = await Promise.all(
        claims.map(async (claim) => {
          // Gather evidence
          const [newsEvidence, companiesHouseEvidence] = await Promise.all([
            EvidenceFetcher.fetchNewsEvidence(claim, newsTimeWindow),
            EvidenceFetcher.fetchCompaniesHouseEvidence(claim)
          ]);

          const evidence: Evidence = {
            newsapi: newsEvidence,
            companies_house: companiesHouseEvidence
          };

          // Verify claim
          const verdict = await Verifier.verifyClaim(claim, evidence);

          return {
            ...claim,
            evidence,
            verdict: verdict.verdict,
            confidence: verdict.confidence,
            rationale: verdict.rationale,
            notes: verdict.notes
          };
        })
      );

      return {
        url,
        extracted_on: new Date().toISOString(),
        claims: verifiedClaims
      };
    } catch (error) {
      throw new Error(`Fact checking failed: ${error.message}`);
    }
  }
}