type Row = { bucket: string; currentPct: number; targetPct: number; deltaPct: number; flags: string[] };
type GapResponse = {
  rows: Row[];
  totals: { absGapSum: number; cashBillsNow: number; cashBillsTarget: number };
  headlineFlags: string[];
  beliefAlignmentNow?: number;
  beliefAlignmentTarget?: number;
};

export interface WhyContext {
  personaLabel: string;      // e.g., "Retirement Planner"
  scenarioLabel?: string;    // e.g., "60% S007 / 40% S009"
}

const BUCKET_REASON: Record<string, string> = {
  CASH: "keeps money instantly available for spend and shocks",
  BILLS_SHORT_GILTS: "adds liquidity with low interest-rate sensitivity",
  GILTS_LONG: "adds duration exposure which can be volatile when yields move",
  IG_CREDIT: "adds income and quality credit exposure",
  GLOBAL_EQUITY: "diversifies across world markets",
  UK_EQUITY_VALUE: "tilts to cheaper, more defensive UK shares",
  GROWTH_TECH: "adds innovation and tech exposure (higher volatility)",
  PROPERTY_UK_RESI: "is illiquid and concentrated in UK housing",
  COMMODITIES: "adds real-asset inflation protection",
  GOLD: "adds crisis and inflation hedge",
  ALTERNATIVES: "broadens diversification beyond listed markets",
  CRYPTO_BTC: "is highly volatile and speculative",
  CRYPTO_ETH: "is highly volatile and speculative",
  COLLECTIBLES_ART: "is niche and illiquid",
  COLLECTIBLES_WINE: "is niche and illiquid"
};

function topMoves(rows: Row[], sign: "ADD" | "TRIM", max = 3) {
  const filtered = rows
    .filter(r => (sign === "ADD" ? r.deltaPct > 0 : r.deltaPct < 0))
    .sort((a,b) => Math.abs(b.deltaPct) - Math.abs(a.deltaPct))
    .slice(0, max);
  return filtered.map(r => ({ bucket: r.bucket, pp: +(r.deltaPct*100).toFixed(1) }));
}

export function buildWhy(gap: GapResponse, ctx: WhyContext): string[] {
  const bullets: string[] = [];

  // Belief alignment (if present)
  if (typeof gap.beliefAlignmentNow === "number" && typeof gap.beliefAlignmentTarget === "number") {
    const delta = gap.beliefAlignmentTarget - gap.beliefAlignmentNow;
    const arrow = delta > 0 ? ` (↑ +${delta})` : delta < 0 ? ` (↓ ${delta})` : "";
    bullets.push(
      `Aligns with your outlook${ctx.scenarioLabel ? ` **${ctx.scenarioLabel}**` : ""}: `
      + `Belief alignment **${gap.beliefAlignmentNow}/100 → ${gap.beliefAlignmentTarget}/100**${arrow}.`
    );
  }

  // Liquidity story (always relevant)
  const now = +(gap.totals.cashBillsNow*100).toFixed(1);
  const tgt = +(gap.totals.cashBillsTarget*100).toFixed(1);
  bullets.push(`Liquidity shifts from **${now}% → ${tgt}%** (cash + short gilts) for more flexibility in drawdowns.`);

  // Top trims / adds with plain reasons
  const trims = topMoves(gap.rows, "TRIM");
  const adds  = topMoves(gap.rows, "ADD");
  if (trims.length) {
    const t = trims.map(x => `trim **${x.bucket.replace(/_/g," ")}** (~${x.pp} pp: ${BUCKET_REASON[x.bucket] || "right-size exposure"})`);
    bullets.push(`Largest reductions: ${t.join("; ")}.`);
  }
  if (adds.length) {
    const a = adds.map(x => `add **${x.bucket.replace(/_/g," ")}** (~${x.pp} pp: ${BUCKET_REASON[x.bucket] || "strengthen balance"})`);
    bullets.push(`Largest additions: ${a.join("; ")}.`);
  }

  // Surface any headline flags as reassurance
  for (const f of gap.headlineFlags || []) {
    if (/Liquidity floor/i.test(f)) bullets.push(`Meets the liquidity floor requirement once changes are applied.`);
    if (/Concentration/i.test(f))  bullets.push(`Reduces single-bucket concentration risk.`);
  }

  return bullets.slice(0, 6); // keep it tight
}