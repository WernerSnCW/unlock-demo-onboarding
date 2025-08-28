/**
 * Pitch Deck Valuation Engine — Drop-in for Replit
 * ------------------------------------------------
 * What this adds:
 *  - Funding extraction w/ JSON schema (robust types, no stringly-typed JSON)
 *  - Instrument-aware terms (priced equity, SAFE [pre/post], convertibles)
 *  - Number + currency normalisation (k/m/bn, EU decimals, symbols)
 *  - ARR inference from unit economics / projections
 *  - Range-based EV/ARR multiples (low/mid/high) adjusted by quality
 *  - EBITDA logic (skip when negative), SAFE/Note valuation boundaries
 *  - Provenance hooks & confidence flags
 *
 * How to integrate (minimal):
 *  1) import {
 *       extractFundingDetailsEnhanced,
 *       computeDeterministicValuationsEnhanced,
 *       inferARR,
 *       revenueMultipleBand
 *     } from "./valuation_engine";
 *  2) Replace your calls to extractFundingDetails(...) with extractFundingDetailsEnhanced(...)
 *  3) Replace computeDeterministicValuations(...) with computeDeterministicValuationsEnhanced(...)
 *  4) (Optional) Use extractTextFromPDFEnhanced(...) if some PDFs are image-only
 */

import OpenAI from "openai";

// Helper function to discount future values to present value
function discountToPresent(futureValue: number, years?: number | null, rate?: number | null) {
  if (!futureValue || !years || years <= 0 || !rate || rate <= 0) return Math.round(futureValue);
  return Math.round(futureValue / Math.pow(1 + rate, years));
}

// -----------------------------
// Types you already use or extend
// -----------------------------

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

    // Funding/terms
    raise_amount?: number | null;
    equity_offered_pct?: number | null;
    instrument?: string | null; // legacy
    stated_pre_money?: number | null;
    stated_post_money?: number | null;
    use_of_funds?: string | null;

    // New richer funding fields
    funding_terms?: {
      round_type?: "Pre-Seed" | "Seed" | "Series A" | "Bridge" | "Equity Crowdfunding" | string;
      instrument?: "priced_equity" | "safe_pre" | "safe_post" | "convertible_note" | "debt" | "grant" | string;
      safe_cap?: number | null;
      safe_discount_pct?: number | null; // e.g., 0.2 for 20%
      safe_post_money?: boolean | null;
      note_cap?: number | null;
      note_discount_pct?: number | null;
      note_interest_pct?: number | null;
      note_maturity_months?: number | null;
    } | null;

    // Named comps
    comparables: Array<{
      name: string;
      metric: string;
      multiple: number;
    }>;

    // Optional provenance hooks
    provenance?: Array<{
      field: string;
      slides: number[];
      raw: string;
      confidence: number; // 0..1
    }> | null;

    // If multiple currencies appear
    currency_all_seen?: string[] | null;
  };
  inconsistencies: Array<{
    field: string;
    slides: number[];
    values: string[];
  }>;
}

// Stage/Sector benchmark scaffold (use your existing DEFAULT_BENCHMARKS)
export type Benchmarks = {
  [stage: string]: {
    [sector: string]: { revenue: number[]; ebitda: number[] };
  };
};

// -----------------------------
// Currency / Percent Parsers
// -----------------------------

const UNIT_MAP: Record<string, number> = {
  k: 1e3, K: 1e3,
  m: 1e6, M: 1e6, mn: 1e6,
  b: 1e9, B: 1e9, bn: 1e9, Bn: 1e9,
};

const CURRENCY_MAP: Record<string, string> = {
  "£": "GBP", "GBP": "GBP",
  "$": "USD", "USD": "USD", "US$": "USD",
  "€": "EUR", "EUR": "EUR",
};

export function parseMoney(raw: string): { value?: number; currency?: string } {
  if (!raw) return {};
  let s = raw.trim().replace(/\s+/g, " ");

  // Convert EU decimals "1,2m" -> "1.2m"
  s = s.replace(/(\d),(\d{1,2})(?=[^\d]|$)/g, "$1.$2");

  const currMatch = s.match(/(GBP|EUR|USD|US\$|£|\$|€)/i);
  const currency = currMatch
    ? CURRENCY_MAP[(currMatch[0].toUpperCase() as keyof typeof CURRENCY_MAP)] || currMatch[0].replace(/[^A-Z]/g, "")
    : undefined;

  const numMatch = s.match(/(\d{1,3}(?:[,.\s]\d{3})*|\d+(?:[.,]\d+)?)/);
  if (!numMatch) return { currency };
  const numStr = numMatch[1].replace(/[,\s]/g, "");
  const num = parseFloat(numStr);

  const unitMatch = s.match(/\b(k|K|m|M|mn|bn|Bn|b)\b/);
  const unit = unitMatch ? UNIT_MAP[unitMatch[1]] : 1;

  const value = isNaN(num) ? undefined : num * unit;
  return { value, currency };
}

export function parsePercent(raw: string): number | undefined {
  if (!raw) return undefined;
  const s = raw.toLowerCase();
  const m = s.match(/(\d+(?:[.,]\d+)?)\s*(%|percent|pct)/);
  if (m) return parseFloat(m[1].replace(",", ".")) / 100;
  const f = parseFloat(s.replace(",", "."));
  if (!isNaN(f) && f <= 1) return f;
  return undefined;
}

// Simple currency conversion hook — pass fx rates optionally
// fx example: { USD: 0.78, EUR: 0.85, GBP: 1 } meaning 1 unit * rate = GBP
export function toPrimaryCurrency(
  value: number,
  from: string | undefined,
  primary: string,
  fx?: Record<string, number>,
): number {
  if (!from || from === primary) return value;
  if (!fx || !fx[from]) return value; // fallback: no conversion if rates missing
  return value * fx[from];
}

// -----------------------------
// ARR Inference & Multiple Bands
// -----------------------------

export function inferARR(k: ExtractedData["kpis"]): number | null {
  if (k.arr) return k.arr;
  if (k.mrr) return k.mrr * 12;
  if ((k as any).arpu && (k as any).customers) {
    const arpu = (k as any).arpu as number;
    const customers = (k as any).customers as number;
    return Math.round(arpu * customers * 12);
  }
  if ((k as any).arpu && (k as any).users) {
    const arpu = (k as any).arpu as number;
    const users = (k as any).users as number;
    return Math.round(arpu * users * 12);
  }
  // If current revenue proxy + growth, project 12 months forward
  const rev = (k as any).revenue_current as number | undefined;
  const g = k.growth_rate_pct ?? undefined;
  if (rev && typeof g === "number") {
    const monthly = Math.pow(1 + g / 100, 1 / 12) - 1;
    const projected = rev * Math.pow(1 + monthly, 12);
    return Math.round(projected);
  }
  return null;
}

export function revenueMultipleBand(input: {
  stage: string; sector: string; geography: string;
  baseBenchmarks: Benchmarks;
  growth_rate_pct?: number | null;
  gross_margin_pct?: number | null;
  arr?: number | null;
  churn_pct?: number | null;
}): { low: number; mid: number; high: number } {
  const stageData = input.baseBenchmarks[input.stage] || input.baseBenchmarks["Seed"];
  const sectorData = stageData?.[input.sector] || stageData?.["General"];
  let [low, high] = sectorData?.revenue || [6, 10];

  const g = input.growth_rate_pct ?? 0;
  if (g >= 100) { low += 3; high += 6; }
  else if (g >= 50) { low += 2; high += 4; }
  else if (g >= 25) { low += 1; high += 2; }
  else if (g < 0) { low -= 2; high -= 3; }

  const gm = input.gross_margin_pct ?? 0;
  if (gm >= 80) { low += 1; high += 2; }
  else if (gm < 50) { low -= 1; }

  const churn = input.churn_pct ?? 0;
  if (churn > 5) { low -= 1; high -= 1; }

  if (/europe|uk|nl|de|fr|eu/i.test(input.geography)) {
    low -= 0.5; high -= 0.5; // light geography discount
  }

  low = Math.max(2, low);
  const mid = (low + high) / 2;
  return { low, mid, high };
}

// -----------------------------
// Terms → Implied Valuation
// -----------------------------

export function impliedFromTerms(k: ExtractedData["kpis"]) {
  const out: any = {};
  const eq = k.equity_offered_pct ?? undefined;
  const raise = k.raise_amount ?? undefined;

  if (typeof raise === "number" && typeof eq === "number" && eq > 0) {
    const post = raise / eq;
    const pre = post - raise;
    out.implied_from_terms = {
      pre_money: Math.round(pre),
      post_money: Math.round(post),
      raise,
      equity_pct: eq,
    };
  } else if (typeof k.stated_pre_money === "number" && typeof eq === "number" && eq > 0 && eq < 1) {
    // raise = pre * eq / (1 - eq)
    const raise2 = (k.stated_pre_money * eq) / (1 - eq);
    out.implied_from_terms = {
      pre_money: k.stated_pre_money,
      post_money: Math.round(k.stated_pre_money + raise2),
      raise: Math.round(raise2),
      equity_pct: eq,
    };
  } else if (typeof k.stated_pre_money === "number" && typeof raise === "number") {
    const post = k.stated_pre_money + raise;
    out.implied_from_terms = {
      pre_money: k.stated_pre_money,
      post_money: post,
      raise,
      equity_pct: raise / post,
    };
  }

  // SAFE / Note boundaries (no single "valuation", but caps/discounts)
  const ft = k.funding_terms;
  if (ft?.instrument?.startsWith("safe") && (ft.safe_cap || ft.safe_discount_pct)) {
    out.safe_implied = {
      post_money_cap: ft.safe_post_money ? ft.safe_cap ?? null : null,
      pre_money_cap: ft.safe_post_money ? null : ft.safe_cap ?? null,
      discount_applies: (ft.safe_discount_pct ?? 0) > 0,
      notes: "SAFE terms indicate a cap/discount boundary; conversion depends on next priced round."
    };
  } else if (ft?.instrument === "convertible_note" && (ft.note_cap || ft.note_discount_pct)) {
    out.note_implied = {
      cap: ft.note_cap ?? null,
      discount: ft.note_discount_pct ?? null,
      interest_pct: ft.note_interest_pct ?? null,
      maturity_months: ft.note_maturity_months ?? null
    };
  }

  return out;
}

// -----------------------------
// Enhanced Deterministic Valuations
// -----------------------------

export async function computeDeterministicValuationsEnhanced(
  openai: OpenAI,
  extracted: ExtractedData,
  stage: string,
  sector: string,
  geography: string,
  DEFAULT_BENCHMARKS: Benchmarks,
) {
  const kpis = extracted.kpis;
  const results: any = {};

  // Implied from terms (priced equity / SAFE / note)
  Object.assign(results, impliedFromTerms(kpis));

  // Read horizon & discount from extracted KPIs; default discount 25% if deck supplies none
  const arrHorizon = extracted.kpis.arr_horizon_years ?? 0;
  const ebitdaHorizon = extracted.kpis.ebitda_horizon_years ?? 0;
  const dRate = (typeof extracted.kpis.discount_rate_pct === "number") 
    ? extracted.kpis.discount_rate_pct 
    : 0.25; // sensible default

  // ARR (inferred if needed)
  let arr = inferARR(kpis);

  // If still no ARR but stated valuations exist, back-solve using mid multiple
  if (!arr && (kpis.stated_pre_money || kpis.stated_post_money)) {
    const band = revenueMultipleBand({
      stage, sector, geography,
      baseBenchmarks: DEFAULT_BENCHMARKS,
      growth_rate_pct: kpis.growth_rate_pct,
      gross_margin_pct: kpis.gross_margin_pct,
      arr: null,
      churn_pct: kpis.churn_pct,
    });
    const stated = kpis.stated_pre_money || kpis.stated_post_money || null;
    if (stated) arr = Math.round(stated / band.mid);
  }

  // Revenue multiple range with discounting
  if (arr) {
    const band = revenueMultipleBand({
      stage, sector, geography,
      baseBenchmarks: DEFAULT_BENCHMARKS,
      growth_rate_pct: kpis.growth_rate_pct,
      gross_margin_pct: kpis.gross_margin_pct,
      arr,
      churn_pct: kpis.churn_pct,
    });
    const impliedFwdLow = Math.round(arr * band.low);   // forward (e.g., Year-5) EV
    const impliedFwdMid = Math.round(arr * band.mid);
    const impliedFwdHigh = Math.round(arr * band.high);
    const impliedPVLow = discountToPresent(impliedFwdLow, arrHorizon, dRate);   // present value (PV)
    const impliedPVMid = discountToPresent(impliedFwdMid, arrHorizon, dRate);
    const impliedPVHigh = discountToPresent(impliedFwdHigh, arrHorizon, dRate);

    results.revenue_multiple = {
      arr,
      multiple_low: band.low,
      multiple_mid: band.mid,
      multiple_high: band.high,
      implied_forward_low: impliedFwdLow,
      implied_forward_mid: impliedFwdMid,
      implied_forward_high: impliedFwdHigh,
      implied_low: impliedPVLow,          // <- use PV everywhere you compare to DCF/stated pre
      implied_mid: impliedPVMid,
      implied_high: impliedPVHigh,
      horizon_years: arrHorizon,
      discounted: arrHorizon > 0,
      confidence: ((kpis.arr ? 1 : 0) + (kpis.growth_rate_pct ? 1 : 0) + (kpis.gross_margin_pct ? 1 : 0)) >= 2 ? "High" : ((kpis.arr || kpis.growth_rate_pct || kpis.gross_margin_pct) ? "Medium" : "Low"),
    };
  }

  // EBITDA multiple (only if positive) with discounting
  let ebitda = kpis.ebitda;
  if (typeof ebitda === "number" && ebitda >= 0) {
    const stageData = DEFAULT_BENCHMARKS[stage] || DEFAULT_BENCHMARKS["Seed"];
    const sectorData = stageData?.[sector] || stageData?.["General"];
    const [eLow, eHigh] = sectorData?.ebitda || [10, 16];
    const eMid = (eLow + eHigh) / 2;
    const impliedFwdLow = Math.round(ebitda * eLow);
    const impliedFwdMid = Math.round(ebitda * eMid);
    const impliedFwdHigh = Math.round(ebitda * eHigh);
    const impliedPVLow = discountToPresent(impliedFwdLow, ebitdaHorizon, dRate);
    const impliedPVMid = discountToPresent(impliedFwdMid, ebitdaHorizon, dRate);
    const impliedPVHigh = discountToPresent(impliedFwdHigh, ebitdaHorizon, dRate);

    results.ebitda_multiple = {
      ebitda,
      multiple_low: eLow,
      multiple_mid: eMid,
      multiple_high: eHigh,
      implied_forward_low: impliedFwdLow,
      implied_forward_mid: impliedFwdMid,
      implied_forward_high: impliedFwdHigh,
      implied_low: impliedPVLow,
      implied_mid: impliedPVMid,
      implied_high: impliedPVHigh,
      horizon_years: ebitdaHorizon,
      discounted: ebitdaHorizon > 0,
    };
  }

  // Stated/post-money passthrough
  if (kpis.stated_post_money && !results.implied_from_terms?.post_money) {
    results.implied_from_post_money = { post_money: kpis.stated_post_money, method: "stated_post_money" };
  }

  if (kpis.stated_pre_money && !results.implied_from_terms?.pre_money) {
    results.implied_from_stated = { 
      pre_money: kpis.stated_pre_money, 
      post_money: kpis.stated_pre_money + (kpis.raise_amount || 0),
      method: "stated_pre_money" 
    };
  }

  // ROI projections with ranges
  const implied_mid = results.revenue_multiple?.implied_mid || results.ebitda_multiple?.implied_mid || kpis.stated_pre_money || 0;
  const raise = kpis.raise_amount || 0;
  const equity = kpis.equity_offered_pct || 0;
  
  if (implied_mid > 0 && raise > 0 && equity > 0) {
    // Conservative exit multiple range
    const exitMultipleLow = 3;
    const exitMultipleMid = 5;
    const exitMultipleHigh = 8;
    
    // Project 5-year revenue growth
    const currentArr = arr || implied_mid / 8; // Back-solve if needed
    const growthRate = (kpis.growth_rate_pct || 50) / 100;
    const projectedRevenue = currentArr * Math.pow(1 + growthRate, 5);
    
    results.roi_estimated = {
      equity_pct: equity / 100,
      current_valuation: implied_mid,
      projected_revenue_5y: Math.round(projectedRevenue),
      exit_value_low: Math.round(projectedRevenue * exitMultipleLow),
      exit_value_mid: Math.round(projectedRevenue * exitMultipleMid),
      exit_value_high: Math.round(projectedRevenue * exitMultipleHigh),
      investor_return_low: Math.round((projectedRevenue * exitMultipleLow) * (equity / 100)),
      investor_return_mid: Math.round((projectedRevenue * exitMultipleMid) * (equity / 100)),
      investor_return_high: Math.round((projectedRevenue * exitMultipleHigh) * (equity / 100)),
      roi_multiple_low: Math.round(((projectedRevenue * exitMultipleLow) * (equity / 100)) / raise),
      roi_multiple_mid: Math.round(((projectedRevenue * exitMultipleMid) * (equity / 100)) / raise),
      roi_multiple_high: Math.round(((projectedRevenue * exitMultipleHigh) * (equity / 100)) / raise),
      irr_low: Math.round((Math.pow(((projectedRevenue * exitMultipleLow) * (equity / 100)) / raise, 1/5) - 1) * 100),
      irr_mid: Math.round((Math.pow(((projectedRevenue * exitMultipleMid) * (equity / 100)) / raise, 1/5) - 1) * 100),
      irr_high: Math.round((Math.pow(((projectedRevenue * exitMultipleHigh) * (equity / 100)) / raise, 1/5) - 1) * 100),
    };
  }

  // LLM-powered peer valuation analysis
  if (kpis.stated_pre_money || kpis.stated_post_money) {
    try {
      const peerAnalysis = await analyzePeerValuation(openai, {
        sector,
        stage,
        arr: kpis.arr,
        mrr: kpis.mrr,
        revenue: kpis.arr || (kpis.mrr ? kpis.mrr * 12 : null),
        ebitda: kpis.ebitda,
        growth_rate: kpis.growth_rate_pct,
        customers: kpis.customers,
        raise_amount: kpis.raise_amount,
        stated_valuation: kpis.stated_pre_money || kpis.stated_post_money || 0,
        currency: kpis.currency_primary || 'GBP'
      });
      
      results.peer_analysis = peerAnalysis;
      results.peer_gap_pct = peerAnalysis.valuation_gap_pct;
      console.log('✅ LLM Peer Analysis Success:', {
        gap_pct: peerAnalysis.valuation_gap_pct,
        reasonableness_score: peerAnalysis.assessment.reasonableness_score,
        similar_companies: peerAnalysis.peer_comparison.similar_companies.length,
        methodology: peerAnalysis.methodology_note
      });
    } catch (error) {
      console.error('❌ LLM Peer Analysis Failed:', error);
      console.log('⚠️  Using fallback hardcoded benchmark comparison instead of real peer analysis');
      // Fallback to basic comparison if LLM analysis fails - use present values only
      // Choose a comparable base (PV mid) for gap calculation
      const base = results.revenue_multiple?.implied_mid || results.ebitda_multiple?.implied_mid || null;

      // Stated "deck" valuation: prefer explicit DCF PV, else pre/post, else implied_from_terms
      const stated = extracted.kpis.valuation_dcf_present
        || extracted.kpis.stated_pre_money
        || extracted.kpis.stated_post_money
        || results.implied_from_terms?.post_money
        || null;

      if (stated && base) {
        results.peer_gap_pct = Math.round(((stated - base) / base) * 100) / 100;
      }
    }
  }

  return results;
}

// -----------------------------
// LLM-Powered Peer Valuation Analysis
// -----------------------------

interface PeerValuationRequest {
  sector: string;
  stage: string;
  arr?: number | null;
  mrr?: number | null;
  revenue?: number | null;
  ebitda?: number | null;
  growth_rate?: number | null;
  customers?: number | null;
  raise_amount?: number | null;
  stated_valuation: number;
  currency: string;
}

interface PeerValuationAnalysis {
  valuation_gap_pct: number;
  peer_comparison: {
    similar_companies: string[];
    typical_multiples: {
      revenue_multiple_range: [number, number];
      ebitda_multiple_range?: [number, number];
    };
    market_context: string;
  };
  assessment: {
    reasonableness_score: number; // 1-10 scale
    key_factors: string[];
    justification: string;
    red_flags?: string[];
    positive_signals?: string[];
  };
  methodology_note: string;
}

export async function analyzePeerValuation(
  openai: OpenAI,
  request: PeerValuationRequest
): Promise<PeerValuationAnalysis> {
  const prompt = `You are a senior venture capital analyst with deep knowledge of startup valuations across sectors and stages. Analyze this startup's valuation against realistic peer benchmarks.

STARTUP PROFILE:
- Sector: ${request.sector}
- Stage: ${request.stage}
- Currency: ${request.currency}
- Annual Revenue (ARR): ${request.arr ? `${request.currency}${(request.arr / 1000000).toFixed(1)}M` : 'Not provided'}
- Monthly Revenue (MRR): ${request.mrr ? `${request.currency}${(request.mrr / 1000).toFixed(0)}k` : 'Not provided'}
- EBITDA: ${request.ebitda ? `${request.currency}${(request.ebitda / 1000000).toFixed(1)}M` : 'Not provided'}
- Growth Rate: ${request.growth_rate ? `${(request.growth_rate * 100).toFixed(0)}%` : 'Not provided'}
- Customers: ${request.customers || 'Not provided'}
- Raise Amount: ${request.raise_amount ? `${request.currency}${(request.raise_amount / 1000000).toFixed(1)}M` : 'Not provided'}
- Stated Valuation: ${request.currency}${(request.stated_valuation / 1000000).toFixed(1)}M

ANALYSIS REQUIREMENTS:

1. **Peer Identification**: Based on your knowledge of the ${request.sector} sector at ${request.stage} stage, identify 3-5 similar companies that have raised funding recently (2022-2025). Focus on companies with similar business models, revenue scale, and market positioning.

2. **Market Multiple Analysis**: Provide typical revenue and EBITDA multiples for this sector/stage based on recent market transactions and funding rounds you're aware of.

3. **Valuation Gap Calculation**: Calculate how much the stated valuation deviates from peer benchmarks. Express as a percentage: (stated_valuation - peer_median) / peer_median.

4. **Contextual Assessment**: Consider market conditions, growth trajectory, competitive positioning, and any unique factors that might justify premium/discount valuations.

5. **Red Flags & Positive Signals**: Identify any concerning or encouraging aspects of the valuation relative to fundamentals.

Respond with a JSON object matching this exact structure:

{
  "valuation_gap_pct": 0.15,
  "peer_comparison": {
    "similar_companies": ["Company A", "Company B", "Company C"],
    "typical_multiples": {
      "revenue_multiple_range": [8, 12],
      "ebitda_multiple_range": [15, 25]
    },
    "market_context": "Brief explanation of current market conditions for this sector/stage"
  },
  "assessment": {
    "reasonableness_score": 7,
    "key_factors": ["Factor 1 affecting valuation", "Factor 2", "Factor 3"],
    "justification": "Detailed explanation of whether valuation is reasonable",
    "red_flags": ["Any concerning aspects"],
    "positive_signals": ["Any encouraging aspects"]
  },
  "methodology_note": "Explanation of how you arrived at this analysis"
}

Base your analysis on real market knowledge and recent funding trends. If data is insufficient, clearly note limitations in your methodology_note.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a senior VC analyst with comprehensive knowledge of startup valuations, recent funding rounds, and market multiples across all sectors. Provide detailed, accurate analysis based on real market data and trends."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_completion_tokens: 1500
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    // Validate and sanitize the response
    return {
      valuation_gap_pct: typeof result.valuation_gap_pct === 'number' ? result.valuation_gap_pct : 0,
      peer_comparison: {
        similar_companies: Array.isArray(result.peer_comparison?.similar_companies) 
          ? result.peer_comparison.similar_companies 
          : [],
        typical_multiples: {
          revenue_multiple_range: Array.isArray(result.peer_comparison?.typical_multiples?.revenue_multiple_range)
            ? result.peer_comparison.typical_multiples.revenue_multiple_range
            : [8, 12],
          ebitda_multiple_range: Array.isArray(result.peer_comparison?.typical_multiples?.ebitda_multiple_range)
            ? result.peer_comparison.typical_multiples.ebitda_multiple_range
            : undefined
        },
        market_context: result.peer_comparison?.market_context || 'Market analysis not available'
      },
      assessment: {
        reasonableness_score: typeof result.assessment?.reasonableness_score === 'number' 
          ? Math.max(1, Math.min(10, result.assessment.reasonableness_score))
          : 5,
        key_factors: Array.isArray(result.assessment?.key_factors) ? result.assessment.key_factors : [],
        justification: result.assessment?.justification || 'Analysis not available',
        red_flags: Array.isArray(result.assessment?.red_flags) ? result.assessment.red_flags : undefined,
        positive_signals: Array.isArray(result.assessment?.positive_signals) ? result.assessment.positive_signals : undefined
      },
      methodology_note: result.methodology_note || 'LLM-based analysis using market knowledge and recent funding trends'
    };
  } catch (error) {
    console.error('Failed to analyze peer valuation:', error);
    throw new Error('Peer valuation analysis failed');
  }
}

// -----------------------------
// Enhanced KPI Extraction
// -----------------------------

export async function extractFundingDetailsEnhanced(
  openai: OpenAI,
  slides: string[]
): Promise<ExtractedData["kpis"]> {
  const prompt = `Extract funding/financial details from this pitch deck text. Focus on precision and context.

SLIDES:
${slides.join("\n\n---\n\n")}

Extract these fields with high precision:

FINANCIAL METRICS:
- arr (Annual Recurring Revenue)
- mrr (Monthly Recurring Revenue)  
- revenue_current (Current revenue)
- ebitda (Earnings before interest, taxes, depreciation, amortization)
- gross_margin_pct (Gross margin percentage, 0-1 scale)
- growth_rate_pct (Growth rate percentage)
- burn (Monthly burn rate)
- runway_months (Cash runway in months)

UNIT ECONOMICS:
- cac (Customer Acquisition Cost)
- ltv (Lifetime Value)
- churn_pct (Churn rate percentage, 0-1 scale)
- arpu (Average Revenue Per User)
- customers (Number of customers)
- users (Number of users)

MARKET SIZE:
- tam (Total Addressable Market)
- sam (Serviceable Addressable Market) 
- som (Serviceable Obtainable Market)

FUNDING TERMS:
- raise_amount (Amount seeking to raise)
- equity_offered_pct (Equity percentage offered, 0-1 scale)
- stated_pre_money (Stated pre-money valuation)
- stated_post_money (Stated post-money valuation)
- use_of_funds (How funds will be used)

ENHANCED FUNDING TERMS:
- funding_terms object with:
  - round_type (Pre-Seed, Seed, Series A, etc.)
  - instrument (priced_equity, safe_pre, safe_post, convertible_note, debt, grant)
  - safe_cap (SAFE cap amount if applicable)
  - safe_discount_pct (SAFE discount percentage if applicable)
  - safe_post_money (boolean - true if post-money SAFE)
  - note_cap, note_discount_pct, note_interest_pct, note_maturity_months for convertible notes

CURRENCY:
- currency_primary (Primary currency: GBP, USD, EUR)

COMPARABLES:
Array of comparable companies with name, metric, and multiple.

Return JSON only. Use null for missing values. Convert percentages to 0-1 scale (e.g., 20% = 0.2).
Parse currency symbols and units (k, m, bn) accurately.

Examples:
- "£1.5M" → 1500000
- "20%" → 0.2  
- "Seeking £2M for 15% equity" → raise_amount: 2000000, equity_offered_pct: 0.15
- "Post-money valuation £15M" → stated_post_money: 15000000`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a financial data extraction expert. Return precise JSON data only." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const extracted = JSON.parse(response.choices[0].message.content || "{}");
    
    // Ensure proper structure and defaults
    return {
      currency_primary: extracted.currency_primary || "GBP",
      arr: extracted.arr || null,
      mrr: extracted.mrr || null,
      growth_rate_pct: extracted.growth_rate_pct || null,
      ebitda: extracted.ebitda || null,
      gross_margin_pct: extracted.gross_margin_pct || null,
      burn: extracted.burn || null,
      runway_months: extracted.runway_months || null,
      cac: extracted.cac || null,
      ltv: extracted.ltv || null,
      churn_pct: extracted.churn_pct || null,
      arpu: extracted.arpu || null,
      customers: extracted.customers || null,
      users: extracted.users || null,
      pricing_note: extracted.pricing_note || null,
      tam: extracted.tam || null,
      sam: extracted.sam || null,
      som: extracted.som || null,
      tam_source: extracted.tam_source || null,
      raise_amount: extracted.raise_amount || null,
      equity_offered_pct: extracted.equity_offered_pct || null,
      instrument: extracted.instrument || null,
      stated_pre_money: extracted.stated_pre_money || null,
      stated_post_money: extracted.stated_post_money || null,
      use_of_funds: extracted.use_of_funds || null,
      funding_terms: extracted.funding_terms || null,
      comparables: extracted.comparables || [],
      provenance: extracted.provenance || null,
      currency_all_seen: extracted.currency_all_seen || null,
    };
  } catch (error) {
    console.error("Enhanced KPI extraction failed:", error);
    // Return basic structure with nulls
    return {
      currency_primary: "GBP",
      arr: null,
      mrr: null,
      growth_rate_pct: null,
      ebitda: null,
      gross_margin_pct: null,
      burn: null,
      runway_months: null,
      cac: null,
      ltv: null,
      churn_pct: null,
      arpu: null,
      customers: null,
      users: null,
      pricing_note: null,
      tam: null,
      sam: null,
      som: null,
      tam_source: null,
      raise_amount: null,
      equity_offered_pct: null,
      instrument: null,
      stated_pre_money: null,
      stated_post_money: null,
      use_of_funds: null,
      funding_terms: null,
      comparables: [],
      provenance: null,
      currency_all_seen: null,
    };
  }
}

// Optional: Enhanced PDF text extraction for image-heavy decks
export async function extractTextFromPDFEnhanced(buffer: Buffer): Promise<string> {
  // This would use OCR libraries like Tesseract.js for image-only PDFs
  // For now, return empty string as fallback
  console.log("Enhanced PDF extraction would use OCR for image-only PDFs");
  return "";
}