// Deterministic commentary builder for the Portfolio Recommendations screen.
// Inputs are the TargetResponse you already return from /api/target.

import { CANONICAL_BUCKETS } from "../../config/buckets";
import { SCENARIO_LABELS } from "../../config/scenarios";

export type Bucket = typeof CANONICAL_BUCKETS[number];

export interface TargetResponse {
  personaId: string;
  scenarioWeights: Record<string, number>;     // normalised 0..1 in your engine
  tiltStrength: number;                        // 0..1
  baseMix: Record<string, number>;
  scenarioBlend: Record<string, number>;
  preRulesMix: Record<string, number>;
  targetMix: Record<string, number>;
  flags: string[];
  adjustments: string[];
}

export interface Narrative {
  overview: string;        // single sentence
  bullets: string[];       // 3–6 human-readable bullets
  topAdds: { bucket: string; pp: number }[];     // for UI chips if desired
  topTrims: { bucket: string; pp: number }[];
}

function pct(x: number) { return +(x * 100).toFixed(1); }
function sortByAbsDelta(d: Record<string, number>) {
  return [...CANONICAL_BUCKETS].sort((a,b)=>Math.abs(d[b]) - Math.abs(d[a]));
}

function scenarioLabelString(weights: Record<string, number>) {
  const parts = Object.entries(weights)
    .filter(([,w])=>w>0)
    .sort((a,b)=>b[1]-a[1])
    .map(([k,w]) => `${(w*100).toFixed(1)}% ${SCENARIO_LABELS[k] || k}`);
  return parts.join(" • ");
}

function formatBucketName(bucket: string): string {
  const bucketNames: Record<string, string> = {
    CASH: "Cash",
    BILLS_SHORT_GILTS: "Short Gilts",
    GILTS_LONG: "Long Gilts", 
    IG_CREDIT: "Investment Grade Credit",
    GLOBAL_EQUITY: "Global Equity",
    UK_EQUITY_VALUE: "UK Equity Value",
    GROWTH_TECH: "Growth Tech",
    PROPERTY_UK_RESI: "UK Property",
    COMMODITIES: "Commodities",
    GOLD: "Gold",
    ALTERNATIVES: "Alternatives",
    CRYPTO_BTC: "Bitcoin",
    CRYPTO_ETH: "Ethereum",
    COLLECTIBLES_ART: "Art",
    COLLECTIBLES_WINE: "Wine"
  };
  
  return bucketNames[bucket] || bucket.replace(/_/g, " ");
}

export function buildNarrative(t: TargetResponse): Narrative {
  // 1) deltas vs base (pre-rules insight optional, final target for display)
  const deltaBase: Record<string, number> = {};
  for (const b of CANONICAL_BUCKETS) {
    deltaBase[b] = (t.targetMix[b] ?? 0) - (t.baseMix[b] ?? 0);
  }
  const ordered = sortByAbsDelta(deltaBase);
  const adds = ordered.filter(b => deltaBase[b] > 0).slice(0,3).map(b => ({ bucket: b, pp: pct(deltaBase[b]) }));
  const trims= ordered.filter(b => deltaBase[b] < 0).slice(0,3).map(b => ({ bucket: b, pp: pct(Math.abs(deltaBase[b])) }));

  // 2) liquidity story
  const liqBase   = (t.baseMix.CASH || 0) + (t.baseMix.BILLS_SHORT_GILTS || 0);
  const liqTarget = (t.targetMix.CASH || 0) + (t.targetMix.BILLS_SHORT_GILTS || 0);

  // 3) scenario headline
  const sceno = scenarioLabelString(t.scenarioWeights);

  // 4) overview sentence (no promises)
  const overview =
    `Built from your persona and tilted ${pct(t.tiltStrength)}% towards your scenarios ` +
    `(${sceno}). The mix aims to balance resilience and opportunity while keeping sensible liquidity and diversification.`;

  // 5) bullets – deterministic, UK English, no new numbers
  const bullets: string[] = [];

  // Tilt + biggest narrative
  if (adds.length) {
    bullets.push(`Largest additions: ${adds.map(a => `**${formatBucketName(a.bucket)}** (~${a.pp} pp)`).join("; ")}.`);
  }
  if (trims.length) {
    bullets.push(`Largest reductions: ${trims.map(a => `**${formatBucketName(a.bucket)}** (~${a.pp} pp)`).join("; ")}.`);
  }

  // Liquidity change
  bullets.push(`Liquidity (cash + short gilts) shifts from **${pct(liqBase)}% → ${pct(liqTarget)}%** to support flexibility in drawdowns.`);

  // Rules applied
  if (t.adjustments.length > 0) {
    bullets.push(`Applied house rules: ${t.adjustments.slice(0,3).join("; ")}${t.adjustments.length>3 ? " …" : ""}.`);
  }

  // Any headline flags (surface, but do not restate numbers)
  for (const f of t.flags) {
    if (/Liquidity floor/i.test(f)) bullets.push(`Meets the liquidity floor after adjustments.`);
    if (/cap/i.test(f)) bullets.push(`Caps prevent over-concentration in a single bucket.`);
    if (/S007/i.test(f)) bullets.push(`Kept the real-asset hedge for stagflation risk.`);
    if (/S009/i.test(f)) bullets.push(`Avoided adding long-duration exposure under gilt sell-off views.`);
  }

  // Keep it tight
  return { overview, bullets: bullets.slice(0,6), topAdds: adds, topTrims: trims };
}