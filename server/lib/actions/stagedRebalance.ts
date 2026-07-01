export interface StagedRebalanceParams {
  buckets: string[];
  current: Record<string, number>;
  target: Record<string, number>;
  portfolioValueGBP: number;
  liquidityBuckets: string[];
  liquidityFloorPct: number;
  donorOrder: string[];
  minTradePct: number;
  maxMoves: number;
  illiquidBuckets: string[];
  frictionRate: Record<string, number>;
  stageIlliquids: boolean;
}

export interface RebalanceAction {
  type: "TRIM" | "ADD" | "TRANSFER";
  bucket: string;
  deltaPct: number;
  amountGBP: number;
  rationale: string;
  stage: 1 | 2;
  estCostPct?: number;
}

export interface StagedRebalanceResult {
  summary: {
    totalAbsChangePp: number;
    estTurnoverPp: number;
    estCostPct: number;
    liquidityNowPct: number;
    liquidityTargetPct: number;
    liquidityFixPp?: number;
  };
  staged: { stage1: RebalanceAction[]; stage2: RebalanceAction[] };
  playbook: string[];
}

const pct = (x: number) => +(x * 100).toFixed(1);

/** Generic staged-rebalance algorithm extracted from the original buildActions() (spec §7's
 *  "algorithm-generic, just needs a bucket list" — including the liquidity-bucket names, which
 *  were hardcoded to CASH/BILLS_SHORT_GILTS in the original and are now parametrized). */
export function computeStagedRebalance(p: StagedRebalanceParams): StagedRebalanceResult {
  const {
    buckets: BUCKETS, current, target, portfolioValueGBP: pv, liquidityBuckets,
    liquidityFloorPct: liqFloor, donorOrder: donors, minTradePct: minTrade, maxMoves,
    illiquidBuckets, frictionRate, stageIlliquids: stageIlliq,
  } = p;

  const need: Record<string, number> = {};
  let totalAbsNeed = 0;
  for (const b of BUCKETS) {
    need[b] = (target[b] ?? 0) - (current[b] ?? 0);
    totalAbsNeed += Math.abs(need[b]);
  }

  const stage1Draft: Array<{ bucket: string; deltaPct: number }> = [];
  const stage2Draft: Array<{ bucket: string; deltaPct: number }> = [];

  const liqNow = liquidityBuckets.reduce((s, b) => s + (current[b] ?? 0), 0);
  const needLiq = Math.max(0, liqFloor - liqNow);

  if (needLiq > 1e-6) {
    let remaining = needLiq;
    for (const d of donors) {
      if (remaining <= 1e-6) break;
      const canGive = Math.min(current[d] ?? 0, remaining);
      if (canGive <= 1e-6) continue;
      stage1Draft.push({ bucket: d, deltaPct: -canGive });
      remaining -= canGive;
    }
    // Receive into liquidity buckets in order, each filled to 1.0 before moving to the next
    // (generalises the original's "Bills first, then Cash" two-bucket rule to N buckets).
    let toDistribute = needLiq - Math.max(0, remaining);
    for (const b of liquidityBuckets) {
      if (toDistribute <= 1e-6) break;
      const room = Math.max(0, 1 - (current[b] ?? 0));
      const give = Math.min(toDistribute, room);
      if (give > 1e-6) { stage1Draft.push({ bucket: b, deltaPct: give }); toDistribute -= give; }
    }
  }

  const order = [...BUCKETS].sort((a, b) => Math.abs(need[b]) - Math.abs(need[a]));
  let moves = 0;
  for (const b of order) {
    const n = need[b];
    if (Math.abs(n) < minTrade) continue;
    const isIlliq = stageIlliq && illiquidBuckets.includes(b);
    if (!isIlliq && moves < maxMoves) { stage1Draft.push({ bucket: b, deltaPct: n }); moves++; }
    else if (isIlliq) { stage2Draft.push({ bucket: b, deltaPct: n }); }
  }

  const draft1: Record<string, number> = {};
  stage1Draft.forEach((a) => { draft1[a.bucket] = (draft1[a.bucket] ?? 0) + a.deltaPct; });
  const draft2: Record<string, number> = {};
  stage2Draft.forEach((a) => { draft2[a.bucket] = (draft2[a.bucket] ?? 0) + a.deltaPct; });

  const s1: Record<string, number> = {};
  for (const b of BUCKETS) {
    const n = need[b], d = draft1[b] ?? 0;
    s1[b] = n >= 0 ? Math.min(Math.max(0, d), n) : Math.max(Math.min(0, d), n);
  }
  for (const b of illiquidBuckets) s1[b] = 0;

  const adds = BUCKETS.reduce((s, b) => s + Math.max(0, s1[b]), 0);
  const trims = BUCKETS.reduce((s, b) => s - Math.min(0, s1[b]), 0);
  const EPS = 0.003;
  if (adds > trims + EPS) { const k = trims / adds; for (const b of BUCKETS) if (s1[b] > 0) s1[b] *= k; }
  if (trims > adds + EPS) { const k = adds / trims; for (const b of BUCKETS) if (s1[b] < 0) s1[b] *= k; }

  const s2: Record<string, number> = {};
  for (const b of BUCKETS) s2[b] = need[b] - s1[b];

  console.assert(
    BUCKETS.every((b) => Math.abs((s1[b] + s2[b]) - need[b]) <= 0.001),
    'stagedRebalance: net mismatch on at least one bucket',
  );
  console.assert(
    Math.abs(BUCKETS.reduce((s, b) => s + s1[b], 0)) <= 0.003,
    'stagedRebalance: Stage-1 not self-funded',
  );

  const stage1: RebalanceAction[] = [];
  const stage2: RebalanceAction[] = [];
  for (const b of BUCKETS) {
    const v1 = s1[b];
    if (Math.abs(v1) > 1e-6) {
      const isLiquidityBucket = liquidityBuckets.includes(b);
      stage1.push({
        type: v1 > 0 ? "ADD" : "TRIM", bucket: b, deltaPct: v1, amountGBP: Math.abs(v1) * pv,
        estCostPct: (frictionRate[b] ?? 0) * Math.abs(v1),
        rationale: isLiquidityBucket ? (v1 > 0 ? "Raise liquidity" : "Reduce liquidity")
          : (v1 > 0 ? "Increase allocation towards target" : "Reduce allocation towards target"),
        stage: 1,
      });
    }
    const v2 = s2[b];
    if (Math.abs(v2) > 1e-6) {
      stage2.push({
        type: v2 > 0 ? "ADD" : "TRIM", bucket: b, deltaPct: v2, amountGBP: Math.abs(v2) * pv,
        estCostPct: (frictionRate[b] ?? 0) * Math.abs(v2),
        rationale: v2 > 0 ? "Increase allocation towards target" : "Reduce allocation towards target",
        stage: 2,
      });
    }
  }

  const estTurnoverPp = +(0.5 * totalAbsNeed * 100).toFixed(1);
  let estCostPct = 0;
  for (const a of [...stage1, ...stage2]) estCostPct += a.estCostPct || 0;
  estCostPct = +estCostPct.toFixed(4);

  const bullets: string[] = [];
  const currentLiquidity = liqNow;
  const afterStage1 = currentLiquidity + liquidityBuckets.reduce((s, b) => s + (s1[b] ?? 0), 0);
  const topUpPp = Math.max(0, liqFloor - currentLiquidity);
  bullets.push(
    topUpPp > 1e-6
      ? `Top up liquidity by ~${pct(topUpPp)} pp (from ${pct(currentLiquidity)}% to ${pct(afterStage1)}%) before other moves.`
      : `Liquidity already meets the floor (${pct(currentLiquidity)}%).`,
  );
  const addActions = stage1.filter((a) => a.type === "ADD").slice(0, 3).map((a) => `add **${a.bucket.replace(/_/g, " ")}** ~${pct(a.deltaPct)} pp`);
  const trimActions = stage1.filter((a) => a.type === "TRIM").slice(0, 3).map((a) => `trim **${a.bucket.replace(/_/g, " ")}** ~${pct(Math.abs(a.deltaPct))} pp`);
  if (trimActions.length) bullets.push(`Largest reductions now: ${trimActions.join("; ")}.`);
  if (addActions.length) bullets.push(`Largest additions now: ${addActions.join("; ")}.`);
  if (stage2.some((a) => illiquidBuckets.includes(a.bucket))) bullets.push(`Defer illiquid changes to **Stage 2** or next review.`);
  bullets.push(`Keep individual trades above ${pct(minTrade)} pp to avoid noise.`);
  bullets.push(`Estimated turnover: ~${estTurnoverPp} pp; indicative cost: ~${(estCostPct * 100).toFixed(2)}% of portfolio.`);

  return {
    summary: {
      totalAbsChangePp: +(totalAbsNeed * 100).toFixed(1),
      estTurnoverPp, estCostPct,
      liquidityNowPct: +(currentLiquidity * 100).toFixed(1),
      liquidityTargetPct: +(liquidityBuckets.reduce((s, b) => s + (target[b] ?? 0), 0) * 100).toFixed(1),
      liquidityFixPp: topUpPp > 1e-6 ? +(topUpPp * 100).toFixed(1) : undefined,
    },
    staged: { stage1, stage2 },
    playbook: bullets,
  };
}
