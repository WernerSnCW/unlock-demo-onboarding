// src/valuation_engine.ts
import OpenAI from "openai";
import {
  ValuationConfig,
  getDiscountRate,
  computePVMultipleBlock,
  roundTo,
} from "../valuation_config";

/* ---------- Money & percent parsers (generic) ---------- */

const UNIT_MAP: Record<string, number> = {
  k: 1e3,
  K: 1e3,
  m: 1e6,
  M: 1e6,
  mn: 1e6,
  b: 1e9,
  B: 1e9,
  bn: 1e9,
  Bn: 1e9,
};

const CURRENCY_MAP: Record<string, string> = {
  "£": "GBP",
  GBP: "GBP",
  $: "USD",
  USD: "USD",
  US$: "USD",
  "€": "EUR",
  EUR: "EUR",
};

// NORMALISES EU comma decimals + units + currency
export function parseMoney(raw: string): { value?: number; currency?: string } {
  if (!raw) return {};
  let s = raw.trim()
    .replace(/[~≈≃]/g, "")            // remove approx marks
    .replace(/\s+/g, " ");             // normalise spaces
  // turn 20,5m -> 20.5m  (but keep 20,000,000)
  s = s.replace(/(\d),(\d{1,2})(?=[^\d]|$)/g, "$1.$2");

  const currencyMatch = s.match(/(GBP|EUR|USD|US\$|£|\$|€)/i);
  const currency = currencyMatch ? currencyMatch[0].toUpperCase().replace(/[^\w£$€]/g, "") : undefined;

  const numMatch = s.match(/(\d{1,3}(?:[,\s]\d{3})+|\d+(?:[.,]\d+)?)/);
  if (!numMatch) return { currency };
  const num = parseFloat(numMatch[1].replace(/[,\s]/g, ""));
  const unitMatch = s.match(/\b(k|m|mn|bn)\b/i);
  const unit = unitMatch ? ({k:1e3,m:1e6,mn:1e6,bn:1e9} as any)[unitMatch[1].toLowerCase()] : 1;

  return { value: Number.isFinite(num) ? num * unit : undefined, currency };
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

/* ---------- ARR inference (now safe for non-SaaS) ---------- */

export interface ExtractedKPIs {
  currency_primary: string;
  arr?: number | null;
  mrr?: number | null;
  revenue_current?: number | null;
  growth_rate_pct?: number | null;
  ebitda?: number | null;
  gross_margin_pct?: number | null;
  churn_pct?: number | null;
  raise_amount?: number | null;
  equity_offered_pct?: number | null;
  stated_pre_money?: number | null;
  stated_post_money?: number | null;
  discount_rate_pct?: number | null;
  arr_horizon_years?: number | null;
  ebitda_horizon_years?: number | null;
  funding_terms?: {
    instrument?: string | null;
    // optional SAFE/note fields unchanged…
  } | null;
  // optional extras omitted for brevity
}

export function inferARR(k: ExtractedKPIs): number | null {
  if (k.arr) return k.arr;
  if (k.mrr) return k.mrr * 12;

  // NEW: if no ARR/MRR but revenue exists, use revenue as base (non-SaaS)
  if (typeof k.revenue_current === "number") {
    return Math.round(k.revenue_current);
  }

  // If you want to project revenue using growth you can add it here; left out to avoid guessing
  return null;
}

/* ---------- Revenue band helper (uses your DEFAULT_BENCHMARKS) ---------- */

export type Benchmarks = {
  [stage: string]: {
    [sector: string]: { revenue: [number, number]; ebitda: [number, number] };
  };
};

function revenueBand(
  DEFAULT_BENCHMARKS: Benchmarks,
  stage: string,
  sector: string,
) {
  const s = DEFAULT_BENCHMARKS[stage] || DEFAULT_BENCHMARKS["Seed"];
  const sec = (s && (s as any)[sector]) || (s && (s as any)["General"]);
  const [low, high] = (sec?.revenue as [number, number]) || [6, 10];
  const mid = (low + high) / 2;
  return { low, mid, high };
}

/* ---------- Main valuation function (present-value aware) ---------- */

export function computeDeterministicValuationsEnhanced(
  kpis: ExtractedKPIs,
  stage: string,
  sector: string,
  geography: string, // kept for compatibility (not used here)
  DEFAULT_BENCHMARKS: Benchmarks,
) {
  const results: any = {};
  const rate = getDiscountRate(kpis);

  // 1) Revenue multiple (now uses ARR if present, else revenue)
  const base = inferARR(kpis);
  const arrYears = kpis.arr_horizon_years ?? 0;
  if (base) {
    const band = revenueBand(DEFAULT_BENCHMARKS, stage, sector);
    const blk = computePVMultipleBlock(
      base,
      band.low,
      band.mid,
      band.high,
      arrYears,
      rate,
    );
    if (blk) {
      blk.base_label = kpis.arr ? "ARR" : "Revenue";
      // round present values for display
      blk.implied_low = roundTo(
        blk.implied_low,
        ValuationConfig.roundToNearest,
      );
      blk.implied_mid = roundTo(
        blk.implied_mid,
        ValuationConfig.roundToNearest,
      );
      blk.implied_high = roundTo(
        blk.implied_high,
        ValuationConfig.roundToNearest,
      );
      results.revenue_multiple = blk;
    }
  }

  // 2) EBITDA multiple (only if >= 0)
  if (typeof kpis.ebitda === "number" && kpis.ebitda >= 0) {
    const s = DEFAULT_BENCHMARKS[stage] || DEFAULT_BENCHMARKS["Seed"];
    const sec = (s && (s as any)[sector]) || (s && (s as any)["General"]);
    const [eLow, eHigh] = (sec?.ebitda as [number, number]) || [10, 16];
    const eMid = (eLow + eHigh) / 2;

    const years = kpis.ebitda_horizon_years ?? 0;
    const blk = computePVMultipleBlock(
      kpis.ebitda,
      eLow,
      eMid,
      eHigh,
      years,
      rate,
    );
    if (blk) {
      blk.base_label = "EBITDA";
      blk.implied_low = roundTo(
        blk.implied_low,
        ValuationConfig.roundToNearest,
      );
      blk.implied_mid = roundTo(
        blk.implied_mid,
        ValuationConfig.roundToNearest,
      );
      blk.implied_high = roundTo(
        blk.implied_high,
        ValuationConfig.roundToNearest,
      );
      results.ebitda_multiple = blk;
    }
  }

  // 3) Implied from priced terms (only when BOTH present)
  if (kpis.raise_amount && kpis.equity_offered_pct) {
    const eq = kpis.equity_offered_pct; // decimal, e.g. 0.18
    const post = kpis.raise_amount / eq;
    const pre = post - kpis.raise_amount;
    results.implied_from_terms = {
      pre_money: Math.round(pre),
      post_money: Math.round(post),
      raise: kpis.raise_amount,
      equity_pct: eq, // keep as decimal (UI multiplies by 100)
    };
  }

  // 4) Pass through stated values if present
  if (kpis.stated_post_money) {
    results.implied_from_post_money = { post_money: kpis.stated_post_money };
  }
  if (kpis.stated_pre_money) {
    results.implied_from_pre_money = { pre_money: kpis.stated_pre_money };
  }

  // 5) Peer gap (PV mid vs deck/stated)
  const basePV = ((): number | null => {
    for (const key of ValuationConfig.peerBasisOrder) {
      const mid = (results as any)[key]?.implied_mid;
      if (typeof mid === "number") return mid;
    }
    return null;
  })();

  const deckPV =
    (kpis as any).valuation_dcf_present ??
    kpis.stated_pre_money ??
    kpis.stated_post_money ??
    results.implied_from_terms?.post_money ??
    null;

  if (deckPV && basePV) {
    results.peer_gap_pct = Math.round(((deckPV - basePV) / basePV) * 100) / 100;
  }

  return results;
}

/* ---------- LLM extractor (unchanged shape; schema-enforced) ---------- */

const fundingExtractionSchema = {
  name: "FundingExtraction",
  schema: {
    type: "object",
    properties: {
      raise_amount: { type: ["number", "null"] },
      equity_offered_pct: { type: ["number", "null"] },
      stated_pre_money: { type: ["number", "null"] },
      stated_post_money: { type: ["number", "null"] },
      revenue_current: { type: ["number", "null"] },
      revenue_projected: { type: ["number", "null"] },
      ebitda_or_profit: { type: ["number", "null"] },
      other_financials: { type: "array", items: { type: "string" } },
      funding_terms: { type: ["object", "null"], additionalProperties: true },
      discount_rate_pct: { type: ["number", "null"] },
      arr_horizon_years: { type: ["number", "null"] },
      ebitda_horizon_years: { type: ["number", "null"] },
      valuation_dcf_present: { type: ["number", "null"] },
    },
    required: [
      "raise_amount",
      "equity_offered_pct",
      "stated_pre_money",
      "stated_post_money",
      "other_financials",
    ],
    additionalProperties: true,
  },
};

export async function extractFundingDetailsEnhanced(
  openai: OpenAI,
  slides: string[],
) {
  const fundingKeywords = [
    "ask",
    "funding",
    "raise",
    "equity",
    "valuation",
    "investment",
    "terms",
    "SAFE",
    "convertible",
    "cap",
    "discount",
    "note",
    "interest",
    "maturity",
    "pre-money",
    "post-money",
    "DCF",
  ];
  const relevantSlides = slides.filter((s) =>
    fundingKeywords.some((kw) => s.toLowerCase().includes(kw.toLowerCase())),
  );
  const slidesText = (relevantSlides.length ? relevantSlides : slides)
    .join("\n\n")
    .slice(0, 50000);

  const prompt = `Extract funding- and valuation-related details in STRICT JSON.
Return raise_amount, equity_offered_pct (decimal), stated_pre_money, stated_post_money,
revenue_current (if any), ebitda_or_profit, discount_rate_pct (decimal),
arr_horizon_years, ebitda_horizon_years, valuation_dcf_present if stated,
funding_terms (instrument/caps/discounts if present), and other_financials[].
If a field is not present in the text, return null. Do NOT guess.

Text:
${slidesText}`;

  try {
    const resp = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Output only valid JSON per the schema." },
        { role: "user", content: prompt },
      ],
      // @ts-ignore newer clients: json_schema
      response_format: {
        type: "json_schema",
        json_schema: fundingExtractionSchema,
      },
      temperature: 0,
    });
    return JSON.parse(resp.choices?.[0]?.message?.content || "{}");
  } catch {
    const resp = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Output only valid JSON." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0,
    });
    return JSON.parse(resp.choices?.[0]?.message?.content || "{}");
  }
}
