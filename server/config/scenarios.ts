import { CANONICAL_BUCKETS, Bucket } from "./buckets";

// Scenario templates (IDs S001..S010). These are priors by bucket.
// Note: buckets not listed are implicitly 0 for that scenario.
export const SCENARIO_PRIORS: Record<string, Partial<Record<Bucket, number>>> = {
  S001: { CASH:0.10, GILTS_LONG:0.10, IG_CREDIT:0.15, GLOBAL_EQUITY:0.50, UK_EQUITY_VALUE:0.15 },
  S002: { CASH:0.15, BILLS_SHORT_GILTS:0.20, IG_CREDIT:0.20, GLOBAL_EQUITY:0.35, UK_EQUITY_VALUE:0.10 },
  S003: { CASH:0.10, IG_CREDIT:0.10, GLOBAL_EQUITY:0.30, UK_EQUITY_VALUE:0.15, COMMODITIES:0.15, GOLD:0.20 },
  S004: { BILLS_SHORT_GILTS:0.15, GILTS_LONG:0.15, IG_CREDIT:0.20, GLOBAL_EQUITY:0.35, UK_EQUITY_VALUE:0.15 },
  S005: { CASH:0.10, GILTS_LONG:0.15, IG_CREDIT:0.15, GLOBAL_EQUITY:0.40, UK_EQUITY_VALUE:0.20 },
  S006: { CASH:0.05, GILTS_LONG:0.15, IG_CREDIT:0.10, GLOBAL_EQUITY:0.45, UK_EQUITY_VALUE:0.10, GROWTH_TECH:0.15 },
  S007: { CASH:0.10, BILLS_SHORT_GILTS:0.10, IG_CREDIT:0.08, GLOBAL_EQUITY:0.25, UK_EQUITY_VALUE:0.15, COMMODITIES:0.20, GOLD:0.12 },
  S008: { CASH:0.10, BILLS_SHORT_GILTS:0.05, IG_CREDIT:0.10, GLOBAL_EQUITY:0.40, UK_EQUITY_VALUE:0.10, COMMODITIES:0.10, GOLD:0.15 },
  S009: { CASH:0.15, BILLS_SHORT_GILTS:0.20, GILTS_LONG:0.05, IG_CREDIT:0.10, GLOBAL_EQUITY:0.35, UK_EQUITY_VALUE:0.10, COMMODITIES:0.05 },
  S010:{ CASH:0.07, BILLS_SHORT_GILTS:0.05, IG_CREDIT:0.08, GLOBAL_EQUITY:0.22, UK_EQUITY_VALUE:0.18, COMMODITIES:0.25, GOLD:0.15 },
} as const;

// Optional UI labels if you want friendlier names (display only)
export const SCENARIO_LABELS: Record<string, string> = {
  S001:"Base Growth", S002:"Policy Support", S003:"Inflation Hedges", S004:"Rates Normalisation",
  S005:"Quality Growth", S006:"Tech-led Growth", S007:"Stagflation Tilt", S008:"Soft-ish Inflation",
  S009:"Gilt Sell-off", S010:"Commodity Upswing",
};

// Blend a user-selected mix of scenario IDs into one bucket vector
export function blendScenarioTemplates(
  weights: Record<string, number>
): Record<Bucket, number> {
  const total = Object.values(weights || {}).reduce((a,b)=>a+b,0) || 0;
  const norm  = Object.fromEntries(Object.entries(weights||{}).map(([k,v])=>[k, total ? v/total : 0]));
  const out: Record<Bucket, number> = Object.fromEntries(CANONICAL_BUCKETS.map(b => [b, 0])) as any;
  for (const [sid, w] of Object.entries(norm)) {
    const prior = SCENARIO_PRIORS[sid]; if (!prior || w <= 0) continue;
    for (const [b, p] of Object.entries(prior)) out[b as Bucket] += (p as number) * w;
  }
  return out;
}