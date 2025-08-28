// src/pitchDeckAnalyzer.ts

import OpenAI from "openai";
import multer from "multer";
import {
  computeDeterministicValuationsEnhanced,
  extractFundingDetailsEnhanced,
  parseMoney, // exported by valuation_engine if you want to reuse
  parsePercent,
  type Benchmarks as EngineBenchmarks,
} from "./valuation_engine";
import { ValuationConfig } from "../valuation_config";

/* =========================================================
   Reliable PDF parsing using pdfjs-dist (unchanged)
========================================================= */
async function safePdfParse(buffer: Buffer) {
  try {
    console.log(
      "Attempting PDF parsing with pdfjs-dist - buffer size:",
      buffer.length,
    );

    // Import pdfjs-dist
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
      verbosity: 0, // Suppress console logs
    });

    const pdfDocument = await loadingTask.promise;
    const numPages = pdfDocument.numPages;
    console.log("PDF loaded successfully. Pages:", numPages);

    let fullText = "";

    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Combine all text items from the page
      const pageText = textContent.items
        .filter((item) => "str" in item)
        .map((item) => (item as any).str)
        .join(" ");

      fullText += pageText + "\n\n";
    }

    console.log(
      "PDF parsing successful - extracted text length:",
      fullText.length,
    );
    console.log("PDF text preview:", fullText.substring(0, 300));

    return {
      text: fullText,
      numpages: numPages,
      info: {},
      metadata: {},
      version: "1.0.0",
    };
  } catch (error: any) {
    console.error("PDF parsing failed with error:", error.message);
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* =========================================================
   Benchmarks & Taxonomy (your original values)
========================================================= */

export type Benchmarks = EngineBenchmarks;

export const DEFAULT_BENCHMARKS: Benchmarks = {
  "Pre-Seed": {
    SaaS: { revenue: [6, 10], ebitda: [8, 14] },
    FinTech: { revenue: [8, 12], ebitda: [10, 16] },
    HealthTech: { revenue: [6, 10], ebitda: [8, 14] },
    Consumer: { revenue: [4, 8], ebitda: [6, 12] },
    DeepTech: { revenue: [6, 10], ebitda: [8, 14] },
    General: { revenue: [6, 10], ebitda: [8, 14] },
  },
  Seed: {
    SaaS: { revenue: [8, 12], ebitda: [10, 16] },
    FinTech: { revenue: [10, 14], ebitda: [12, 18] },
    HealthTech: { revenue: [8, 12], ebitda: [10, 16] },
    Consumer: { revenue: [6, 10], ebitda: [8, 14] },
    DeepTech: { revenue: [8, 12], ebitda: [10, 16] },
    General: { revenue: [8, 12], ebitda: [10, 16] },
  },
  "Series A": {
    SaaS: { revenue: [10, 16], ebitda: [12, 20] },
    FinTech: { revenue: [12, 18], ebitda: [15, 24] },
    HealthTech: { revenue: [10, 16], ebitda: [12, 20] },
    Consumer: { revenue: [8, 12], ebitda: [10, 16] },
    DeepTech: { revenue: [10, 16], ebitda: [12, 20] },
    General: { revenue: [10, 16], ebitda: [12, 20] },
  },
};

const SECTION_TAXONOMY = [
  "Problem",
  "Solution",
  "Product",
  "Market Size",
  "Go-to-Market",
  "Traction",
  "Business Model",
  "Competition",
  "Team",
  "Financials",
  "Moat/IP",
  "Roadmap/Milestones",
  "Ask/Use of Funds",
  "Terms/Valuation",
  "Appendix",
];

/* =========================================================
   Types (same as your originals, with a few new optional keys)
========================================================= */

export interface ExtractedData {
  sections: Array<{
    name: string;
    present: boolean;
    slide_indices: number[];
    quote: string;
  }>;
  kpis: {
    currency_primary: string;
    arr?: number | null;
    mrr?: number | null;
    revenue_current?: number | null;

    growth_rate_pct?: number | null;
    ebitda?: number | null;
    gross_margin_pct?: number | null;
    burn?: number | null;
    runway_months?: number | null;
    cac?: number | null;
    ltv?: number | null;
    churn_pct?: number | null;
    arpu?: number | null;
    customers?: number | null;
    users?: number | null;
    pricing_note?: string | null;

    tam?: number | null;
    sam?: number | null;
    som?: number | null;
    tam_source?: string | null;

    raise_amount?: number | null;
    equity_offered_pct?: number | null; // decimal 0.18 = 18%
    instrument?: string | null;
    stated_pre_money?: number | null;
    stated_post_money?: number | null;
    use_of_funds?: string | null;

    // New optional keys for PV-aware valuation
    valuation_dcf_present?: number | null;
    discount_rate_pct?: number | null; // decimal (e.g., 0.25)
    exit_multiple?: number | null;
    arr_horizon_years?: number | null; // 0 = current, >0 = forecast horizon
    ebitda_horizon_years?: number | null;

    comparables: Array<{
      name: string;
      metric: string;
      multiple: number;
    }>;

    // Optional provenance list
    provenance?: Array<{
      field: string;
      slides: number[];
      raw: string;
      confidence: number; // 0..1
    }>;
    currency_all_seen?: string[] | null;
  };
  inconsistencies: Array<{
    field: string;
    slides: number[];
    values: string[];
  }>;
}

export interface AnalysisResult {
  executive_summary: {
    scores: {
      completeness: number;
      clarity: number;
      valuation_reality: number;
    };
    strengths: string[];
    weaknesses: string[];
  };
  valuation_commentary: string[];
  key_questions: {
    valuation: string[];
    general: string[];
  };
  sections: Array<{
    name: string;
    strengths: string[];
    gaps: string[];
    benchmark: string;
    suggested_questions: string[];
  }>;
  risks: Array<{
    level: "High" | "Medium" | "Low";
    label: string;
  }>;
}

/* =========================================================
   Analyzer
========================================================= */

export class PitchDeckAnalyzer {
  /* -------- helper: safe merge (no overwrites) -------- */
  private static mergeFundingIntoKPIs(target: ExtractedData["kpis"], src: any) {
    if (!src) return;
    const set = (k: keyof ExtractedData["kpis"]) => {
      if (
        src[k] !== undefined &&
        src[k] !== null &&
        (target as any)[k] == null
      ) {
        (target as any)[k] = src[k];
      }
    };

    // Core funding + valuation context
    [
      "raise_amount",
      "equity_offered_pct",
      "stated_pre_money",
      "stated_post_money",
      "revenue_current",
      "discount_rate_pct",
      "arr_horizon_years",
      "ebitda_horizon_years",
      "valuation_dcf_present",
      "instrument",
      "use_of_funds",
    ].forEach((k) => set(k as any));

    // Nested terms if present
    if (src.funding_terms) {
      (target as any).funding_terms = {
        ...((target as any).funding_terms || {}),
        ...src.funding_terms,
      };
    }
  }

  /* -------- PDF → text -------- */
  static async extractTextFromPDF(buffer: Buffer): Promise<string[]> {
    const data = await safePdfParse(buffer);
    console.log("Extracted PDF text preview:", data.text.substring(0, 500));
    console.log("Total extracted text length:", data.text.length);

    // Try multiple page splitting methods
    let pages = data.text.split("\f"); // Form feed character
    if (pages.length === 1) {
      pages = data.text.split(/\n\s*(?:Page|Slide)\s+\d+/i);
    }
    if (pages.length === 1) {
      pages = data.text.split(/\n\s*\n\s*\n/);
    }
    if (pages.length === 1) {
      const chunkSize = Math.max(1000, Math.floor(data.text.length / 10));
      pages = [];
      for (let i = 0; i < data.text.length; i += chunkSize) {
        pages.push(data.text.substring(i, i + chunkSize));
      }
    }

    const cleanPages = pages
      .map((page: string) => page.trim())
      .filter((page: string) => page.length > 20);
    console.log("Number of pages extracted:", cleanPages.length);
    console.log(
      "Page lengths:",
      cleanPages.map((p) => p.length),
    );
    return cleanPages;
  }

  /* -------- Funding-only extractor (kept for compatibility) -------- */
  static async extractFundingDetails(slides: string[]): Promise<{
    raise_amount?: number;
    equity_offered_pct?: number;
    stated_pre_money?: number;
    stated_post_money?: number;
    revenue_current?: number;
    revenue_projected?: number;
    ebitda_or_profit?: number;
    other_financials?: string[];
    funding_terms?: any;
    discount_rate_pct?: number | null;
    arr_horizon_years?: number | null;
    ebitda_horizon_years?: number | null;
    valuation_dcf_present?: number | null;
  }> {
    // Use the enhanced extractor under the hood for robustness
    try {
      return await extractFundingDetailsEnhanced(openai, slides);
    } catch (e) {
      console.warn(
        "Enhanced funding extraction failed, returning empty set:",
        e,
      );
      return {};
    }
  }

  /* -------- Sections & KPI extraction (prompt broadened) -------- */
  static async extractSectionsAndKPIs(
    slides: string[],
    sector: string,
    stage: string,
    geography: string,
  ): Promise<ExtractedData> {
    const maxChars = 100000;
    let slidesText = slides
      .map((slide, index) => `[Slide ${index + 1}]\nText: ${slide}\n`)
      .join("\n");

    if (slidesText.length > maxChars) {
      console.log(
        `Text too long (${slidesText.length} chars), truncating to ${maxChars} chars`,
      );
      slidesText =
        slidesText.substring(0, maxChars) +
        "\n\n[TRUNCATED - processing first portion of deck]";
    }

    console.log(
      `Sending ${slidesText.length} characters to LLM for extraction`,
    );

    const systemPrompt = `You extract sections and KPIs from a startup pitch deck. Output STRICT JSON only. Be thorough and flexible in finding financial details - look for funding asks, equity stakes, and valuations in any format or phrasing. Do not guess numbers; if absent, use null. Standardise currencies (GBP/USD/EUR) and numbers (e.g., "£250k" → 250000). Map each slide to one of the known sections when possible. Use British English for labels.`;

    const userPrompt = `DECK_META:
- sector: ${sector}
- stage: ${stage}
- geography: ${geography}

SLIDES:
${slidesText}

TASKS:
1) Detect which of these sections are present per slide:
   ${SECTION_TAXONOMY.join(" | ")}.
2) Extract KPIs anywhere they appear (be very thorough; consider various phrasings):
   - Revenue metrics: ARR, MRR, revenue, growth_rate
   - Profitability: EBITDA, gross_margin, burn, runway
   - Unit economics: CAC, LTV, churn, ARPU
   - Scale metrics: customers, users, pricing
   - Market sizing: TAM, SAM, SOM (with source if cited)
   - FUNDING DETAILS (search across ALL slides):
     * raise_amount (seeking/raising/ask/investment needed)
     * equity_offered_pct (decimal)
     * stated_pre_money / stated_post_money (valuations in any phrasing)
     * instrument and use_of_funds if stated
   - Valuation context:
     * valuation_dcf_present (if the deck states a present-value DCF)
     * discount_rate_pct (decimal; e.g., 0.25)
     * exit_multiple (if mentioned)
     * arr_horizon_years / ebitda_horizon_years (0 = current, N if "Year N" or "in N years")
   - named_comparables (array of {name, metric, multiple})
3) For each detected section, provide a 1–2 sentence representative quote from the deck (do not paraphrase).
4) Output STRICT JSON with this schema:

{
  "sections":[
    {"name":"Problem","present":true,"slide_indices":[1,2],"quote":"<short excerpt>"}
  ],
  "kpis":{
    "currency_primary":"GBP",
    "arr":null,
    "mrr":null,
    "revenue_current":null,
    "growth_rate_pct":null,
    "ebitda":null,
    "gross_margin_pct":null,
    "burn":null,
    "runway_months":null,
    "cac":null,
    "ltv":null,
    "churn_pct":null,
    "arpu":null,
    "customers":null,
    "users":null,
    "pricing_note":null,
    "tam":null,
    "sam":null,
    "som":null,
    "tam_source":null,
    "raise_amount":null,
    "equity_offered_pct":null,
    "instrument":null,
    "stated_pre_money":null,
    "stated_post_money":null,
    "use_of_funds":null,
    "valuation_dcf_present":null,
    "discount_rate_pct":null,
    "exit_multiple":null,
    "arr_horizon_years":null,
    "ebitda_horizon_years":null,
    "comparables":[]
  },
  "inconsistencies":[]
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      });

      const extracted = JSON.parse(response.choices[0].message.content || "{}");
      return extracted as ExtractedData;
    } catch (error) {
      console.error("Error extracting sections and KPIs:", error);
      // Minimal safe fallback
      return {
        sections: [],
        kpis: {
          currency_primary: "GBP",
          comparables: [],
        },
        inconsistencies: [],
      } as ExtractedData;
    }
  }

  /* -------- Scoring (unchanged aside from safety clamps) -------- */
  static computeScores(
    extracted: ExtractedData,
    valuations: any,
  ): { completeness: number; clarity: number; valuation_reality: number } {
    let completeness = 10;
    let clarity = 10;
    let valuationReality = 10;

    const requiredSections = [
      "Problem",
      "Solution",
      "Market Size",
      "Business Model",
      "Competition",
      "Team",
      "Financials",
      "Ask/Use of Funds",
    ];
    const presentSections = extracted.sections
      .filter((s) => s.present)
      .map((s) => s.name);

    for (const required of requiredSections) {
      if (!presentSections.includes(required)) {
        completeness -= 1;
      }
    }

    const importantKPIs: (keyof ExtractedData["kpis"])[] = [
      "arr",
      "mrr",
      "revenue_current",
      "tam",
      "sam",
      "som",
      "raise_amount",
    ];
    for (const kpi of importantKPIs) {
      if (!extracted.kpis[kpi]) {
        completeness -= 0.5;
      }
    }
    completeness = Math.max(0, Math.min(10, completeness));

    if (extracted.inconsistencies.length > 0) {
      clarity -= extracted.inconsistencies.length;
    }
    clarity = Math.max(0, Math.min(10, clarity));

    if (typeof valuations?.peer_gap_pct === "number") {
      const gap = Math.abs(valuations.peer_gap_pct);
      if (gap <= 0.1) {
        // no penalty
      } else if (gap <= 0.25) {
        valuationReality -= 2;
      } else if (gap <= 0.5) {
        valuationReality -= 4;
      } else {
        valuationReality -= 6;
      }
    } else if (
      !extracted.kpis.stated_pre_money &&
      !extracted.kpis.valuation_dcf_present
    ) {
      valuationReality = 5;
    }
    valuationReality = Math.max(0, Math.min(10, valuationReality));

    return {
      completeness: Math.round(completeness * 10) / 10,
      clarity: Math.round(clarity * 10) / 10,
      valuation_reality: Math.round(valuationReality * 10) / 10,
    };
  }

  /* -------- Analysis write-up (unchanged) -------- */
  static async generateAnalysis(
    extracted: ExtractedData,
    valuations: any,
    scores: any,
  ): Promise<AnalysisResult> {
    const systemPrompt = `You are a disciplined investment analyst. Given extracted sections/KPIs and pre-computed valuations/scores, produce concise, actionable findings. Do not invent numbers. Keep British English. Output STRICT JSON only.`;

    const userPrompt = `INPUTS:
- EXTRACTED (from Pass #1):
${JSON.stringify(extracted, null, 2)}
- DETERMINISTIC_VALUATIONS (computed in code):
${JSON.stringify(valuations, null, 2)}
- SCORES (computed in code): ${JSON.stringify(scores, null, 2)}

TASKS:
1) Executive Summary: list top 3 strengths and top 3 weaknesses drawn from sections/KPIs and inconsistencies.
2) Valuation Commentary: one sentence per method explaining the result (no new numbers).
3) Key Questions: a) 5 valuation questions; b) 5 general questions.
4) Section-by-Section: For each section present, add strengths/gaps/benchmark (High|Medium|Low — reason)/suggested questions.
5) Risks: up to 5 labelled risks.

OUTPUT SCHEMA:
{
  "executive_summary":{"scores":{"completeness":7.2,"clarity":6.8,"valuation_reality":5.4},"strengths":["..."],"weaknesses":["..."]},
  "valuation_commentary":["..."],
  "key_questions":{"valuation":["...x5"],"general":["...x5"]},
  "sections":[{"name":"Problem","strengths":["..."],"gaps":["..."],"benchmark":"Medium — reason","suggested_questions":["...","..."]}],
  "risks":[{"level":"High","label":"Missing exit strategy"}]
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      });

      const analysis = JSON.parse(response.choices[0].message.content || "{}");
      return analysis as AnalysisResult;
    } catch (error) {
      console.error("Error generating analysis:", error);
      // Safe minimal fallback
      return {
        executive_summary: {
          scores: { completeness: 6, clarity: 6, valuation_reality: 6 },
          strengths: [],
          weaknesses: [],
        },
        valuation_commentary: [],
        key_questions: { valuation: [], general: [] },
        sections: [],
        risks: [],
      } as AnalysisResult;
    }
  }

  /* -------- Main entry point -------- */
  static async analyzePitchDeck(
    fileBuffer: Buffer,
    fileName: string,
    sector: string,
    stage: string,
    geography: string,
  ) {
    try {
      console.log("Starting PDF text extraction for file:", fileName);
      const slides = await this.extractTextFromPDF(fileBuffer);
      console.log("PDF extraction complete. Processing with LLM...");

      // Pass #1 — sections & KPIs
      const extracted = await this.extractSectionsAndKPIs(
        slides,
        sector,
        stage,
        geography,
      );

      console.log(
        "LLM extraction complete. KPIs found:",
        Object.keys(extracted.kpis).filter(
          (k) => (extracted.kpis as any)[k] !== null,
        ),
      );
      console.log("Critical KPIs:", {
        raise_amount: extracted.kpis.raise_amount,
        equity_offered_pct: extracted.kpis.equity_offered_pct,
        stated_pre_money: extracted.kpis.stated_pre_money,
        stated_post_money: extracted.kpis.stated_post_money,
        valuation_dcf_present: (extracted.kpis as any).valuation_dcf_present,
      });

      // Targeted funding re-scan (non-destructive merge; also brings in revenue_current, discount rate, horizons)
      try {
        const fundingExtraction = await extractFundingDetailsEnhanced(
          new (await import("openai")).default({ apiKey: process.env.OPENAI_API_KEY }),
          slides
        );
        console.log("Targeted funding extraction:", fundingExtraction);
        // Merge funding extraction results, prioritizing enhanced extraction for valuation_dcf_present
        const set = (k: keyof typeof extracted.kpis) => {
          if ((fundingExtraction as any)[k] !== undefined && (fundingExtraction as any)[k] !== null) {
            // For valuation_dcf_present, always use the enhanced extraction result
            if (k === "valuation_dcf_present" || (extracted.kpis as any)[k] == null) {
              (extracted.kpis as any)[k] = (fundingExtraction as any)[k];
            }
          }
        };
        ["valuation_dcf_present","stated_pre_money","stated_post_money","raise_amount","equity_offered_pct",
         "revenue_current","discount_rate_pct","arr_horizon_years","ebitda_horizon_years"].forEach(k => set(k as any));
      } catch (e) {
        console.warn("Funding re-scan skipped:", e);
      }

      // Debug KPIs before valuation computation
      console.log("KPIs passed to valuation engine:", {
        arr: extracted.kpis.arr,
        mrr: extracted.kpis.mrr,
        revenue_current: (extracted.kpis as any).revenue_current,
        ebitda: extracted.kpis.ebitda,
        valuation_dcf_present: (extracted.kpis as any).valuation_dcf_present,
        stated_pre_money: extracted.kpis.stated_pre_money,
        stated_post_money: extracted.kpis.stated_post_money,
      });

      // Deterministic valuations — PV-aware and ARR/Revenue safe fallback
      const valuations = computeDeterministicValuationsEnhanced(
        {
          currency_primary: extracted.kpis.currency_primary,
          arr: extracted.kpis.arr ?? null,
          mrr: extracted.kpis.mrr ?? null,
          revenue_current: (extracted.kpis as any).revenue_current ?? null,

          growth_rate_pct: extracted.kpis.growth_rate_pct ?? null,
          ebitda: extracted.kpis.ebitda ?? null,
          gross_margin_pct: extracted.kpis.gross_margin_pct ?? null,
          churn_pct: extracted.kpis.churn_pct ?? null,

          raise_amount: extracted.kpis.raise_amount ?? null,
          equity_offered_pct: extracted.kpis.equity_offered_pct ?? null,
          stated_pre_money: extracted.kpis.stated_pre_money ?? null,
          stated_post_money: extracted.kpis.stated_post_money ?? null,
          valuation_dcf_present: (extracted.kpis as any).valuation_dcf_present ?? null,

          discount_rate_pct: extracted.kpis.discount_rate_pct ?? null,
          arr_horizon_years: extracted.kpis.arr_horizon_years ?? 0,
          ebitda_horizon_years: extracted.kpis.ebitda_horizon_years ?? 0,
        },
        stage,
        sector,
        geography,
        DEFAULT_BENCHMARKS,
      );
      console.log("Computed valuations:", JSON.stringify(valuations, null, 2));
      
      // Debug the final declared valuation
      const finalDeclaredPV = (extracted.kpis as any).valuation_dcf_present ??
        extracted.kpis.stated_pre_money ??
        extracted.kpis.stated_post_money ??
        null;
      console.log("Final declared PV for result:", finalDeclaredPV);

      // Scores
      const scores = this.computeScores(extracted, valuations);
      console.log("Computed scores:", scores);

      // Analysis write-up
      const analysis = await this.generateAnalysis(
        extracted,
        valuations,
        scores,
      );

      // UI flags
      const hasTerms = !!(
        extracted.kpis.raise_amount && extracted.kpis.equity_offered_pct
      );
      const headlineLabel = hasTerms
        ? "Pre-Money Valuation"
        : ValuationConfig.labelWhenNoTerms;

      // Transform for frontend
      const result = {
        id: Date.now().toString(),
        fileName,
        overallScore: {
          completeness: scores.completeness,
          clarity: scores.clarity,
          valuationPlausibility: scores.valuation_reality,
        },
        executiveSummary: {
          topStrengths: analysis.executive_summary?.strengths || [],
          topWeaknesses: analysis.executive_summary?.weaknesses || [],
          investorQuestions: [
            ...(analysis.key_questions?.valuation || []).slice(0, 3),
            ...(analysis.key_questions?.general || []).slice(0, 2),
          ],
        },
        sections: (analysis.sections || []).map((section) => {
          const extractedSection = extracted.sections.find(
            (s) => s.name === section.name,
          );
          return {
            name: section.name,
            status: extractedSection?.present
              ? ("Present" as const)
              : ("Missing" as const),
            extracted: extractedSection?.quote || "No content found",
            strengths: section.strengths,
            weaknesses: section.gaps,
            questions: section.suggested_questions,
            benchmark: section.benchmark,
          };
        }),
        valuation: {
          declared:
            (extracted.kpis as any).valuation_dcf_present ??
            extracted.kpis.stated_pre_money ??
            extracted.kpis.stated_post_money ??
            null,
          assessment: (() => {
            const declaredPV = (extracted.kpis as any).valuation_dcf_present ??
              extracted.kpis.stated_pre_money ??
              extracted.kpis.stated_post_money ??
              null;
            const basePV = valuations.revenue_multiple?.implied_mid ??
              valuations.ebitda_multiple?.implied_mid ??
              null;
            return (declaredPV != null && basePV != null)
              ? `Gap vs peers: ${Math.round(((declaredPV - basePV) / basePV) * 100)}%`
              : "Gap vs peers: not enough data";
          })(),
          methods: {
            preMoney: hasTerms
              ? valuations.implied_from_terms?.pre_money ||
                extracted.kpis.stated_pre_money ||
                0
              : 0,
            postMoney: hasTerms
              ? valuations.implied_from_terms?.post_money ||
                valuations.implied_from_post_money?.post_money ||
                extracted.kpis.stated_post_money ||
                0
              : 0,
            revenueMultiple: {
              base: valuations.revenue_multiple?.base || 0, // ARR if present, else Revenue
              baseLabel: valuations.revenue_multiple?.base_label || "Revenue",
              horizonYears: valuations.revenue_multiple?.horizon_years ?? 0,
              multiple: valuations.revenue_multiple?.multiple_mid || 0,
              impliedValue: valuations.revenue_multiple?.implied_mid || 0, // PV mid
            },
            ebitdaMultiple: {
              ebitda: valuations.ebitda_multiple?.base || 0,
              baseLabel: valuations.ebitda_multiple?.base_label || "EBITDA",
              horizonYears: valuations.ebitda_multiple?.horizon_years ?? 0,
              multiple: valuations.ebitda_multiple?.multiple_mid || 0,
              impliedValue: valuations.ebitda_multiple?.implied_mid || 0, // PV mid
            },
            // ROI card will be hidden if terms are missing (below)
          },
          // include all computed valuation sources for frontend fallback
          ...valuations,
          suggestedQuestions: analysis.key_questions?.valuation || [],
          headlineLabel,
        },
        riskFlags: analysis.risks || [],
      };

      // Hide ROI card if terms are missing
      if (!hasTerms) {
        if ((result.valuation as any).methods) {
          ((result.valuation as any).methods as any).roiProjection = undefined;
        }
      }

      return result;
    } catch (error) {
      console.error("Pitch deck analysis failed:", error);
      throw new Error(
        `Failed to analyse pitch deck: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }
}

/* =========================================================
   Upload config (unchanged)
========================================================= */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and PowerPoint files are allowed"));
    }
  },
});
