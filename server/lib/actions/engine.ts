import { CANONICAL_BUCKETS, Bucket } from "../../config/buckets";
import { FRICTION_RATE, ILLIQUID_BUCKETS } from "./frictions";

export interface ActionsRequest {
  currentMix: Record<string, number>;
  targetMix:  Record<string, number>;
  portfolioValueGBP: number;
  liquidityFloorPct?: number;
  donorOrder?: string[];
  minTradePct?: number;
  maxMoves?: number;
  stageIlliquids?: boolean;
}

export interface Action {
  type: "TRIM" | "ADD" | "TRANSFER";
  bucket: string;
  deltaPct: number;   // fraction of portfolio (pp/100)
  amountGBP: number;
  rationale: string;
  stage: 1 | 2;
  estCostPct?: number;
}

export interface ActionsResponse {
  summary: {
    totalAbsChangePp: number;
    estTurnoverPp: number;
    estCostPct: number;
    liquidityNowPct: number;
    liquidityTargetPct: number;
    liquidityFixPp?: number;
  };
  staged: { stage1: Action[]; stage2: Action[] };
  playbook: string[];
}

function harmonise(m: Partial<Record<string, number>>): Record<Bucket, number> {
  const out = {} as Record<Bucket, number>;
  for (const b of CANONICAL_BUCKETS) out[b] = Number(m[b] ?? 0);
  return out;
}

const pct = (x:number)=> +(x*100).toFixed(1);

export function buildActions(req: ActionsRequest): ActionsResponse {
  const current = harmonise(req.currentMix);
  const target  = harmonise(req.targetMix);
  const pv      = Math.max(0, req.portfolioValueGBP || 0);

  const minTrade = req.minTradePct ?? 0.005;           // 0.5 pp
  const maxMoves = req.maxMoves ?? 8;
  const liqFloor = req.liquidityFloorPct ?? 0.10;
  const donorsDefault: Bucket[] = [
    "GROWTH_TECH","GLOBAL_EQUITY","ALTERNATIVES","PROPERTY_UK_RESI",
    "COMMODITIES","GOLD","UK_EQUITY_VALUE","IG_CREDIT","GILTS_LONG",
    "CRYPTO_BTC","CRYPTO_ETH","COLLECTIBLES_ART","COLLECTIBLES_WINE"
  ];
  const donors = (req.donorOrder as Bucket[] | undefined) ?? donorsDefault;
  const stageIlliq = req.stageIlliquids ?? true;

  // YOUR EXACT IMPLEMENTATION BRIEF - Deterministic procedure (generic)
  const BUCKETS = CANONICAL_BUCKETS;
  
  // 1) Need per bucket
  const need: Record<string, number> = {};
  let totalAbsNeed = 0;
  for (const b of BUCKETS) {
    need[b] = (target[b] ?? 0) - (current[b] ?? 0);
    totalAbsNeed += Math.abs(need[b]);
  }

  // Build preliminary actions first (for aggregation)
  const stage1Draft: Array<{bucket: string, deltaPct: number}> = [];
  const stage2Draft: Array<{bucket: string, deltaPct: number}> = [];

  // Liquidity fix actions (if needed)
  const liqNow = current.CASH + current.BILLS_SHORT_GILTS;
  const needLiq = Math.max(0, liqFloor - liqNow);
  
  if (needLiq > 1e-6) {
    let remaining = needLiq;
    for (const d of donors) {
      if (remaining <= 1e-6) break;
      const canGive = Math.min(current[d], remaining);
      if (canGive <= 1e-6) continue;
      stage1Draft.push({ bucket: d, deltaPct: -canGive });
      remaining -= canGive;
    }
    // receive into Bills first, then Cash
    const recvEach = needLiq - Math.max(0, remaining);
    const toBills = Math.min(recvEach, 1 - current.BILLS_SHORT_GILTS);
    const toCash  = Math.max(0, recvEach - toBills);
    if (toBills > 1e-6) stage1Draft.push({ bucket: "BILLS_SHORT_GILTS", deltaPct: toBills });
    if (toCash > 1e-6) stage1Draft.push({ bucket: "CASH", deltaPct: toCash });
  }

  // Rebalancing actions for biggest gaps
  const order = [...BUCKETS].sort((a,b)=>Math.abs(need[b]) - Math.abs(need[a]));
  let moves = 0;
  for (const b of order) {
    const n = need[b];
    if (Math.abs(n) < minTrade) continue;
    const isIlliq = stageIlliq && ILLIQUID_BUCKETS.includes(b);
    if (!isIlliq && moves < maxMoves) {
      stage1Draft.push({ bucket: b, deltaPct: n });
      moves++;
    } else if (isIlliq) {
      stage2Draft.push({ bucket: b, deltaPct: n });
    }
  }

  // 2) Aggregate preliminary Stage-1 and Stage-2
  const draft1: Record<string, number> = {};
  stage1Draft.forEach(a => draft1[a.bucket] = (draft1[a.bucket] ?? 0) + a.deltaPct);

  const draft2: Record<string, number> = {};
  stage2Draft.forEach(a => draft2[a.bucket] = (draft2[a.bucket] ?? 0) + a.deltaPct);

  // 3) Clamp Stage-1 to the required need (no wrong-way, no overshoot)
  const s1: Record<string, number> = {};
  for (const b of BUCKETS) {
    const n = need[b], d = draft1[b] ?? 0;
    s1[b] = n >= 0 ? Math.min(Math.max(0, d), n)
                   : Math.max(Math.min(0, d), n);
  }

  // 4) Defer illiquids in Stage-1
  for (const b of ILLIQUID_BUCKETS) {
    s1[b] = 0;
  }

  // 5) Self-fund Stage-1 (adds ≈ trims, tolerance 0.3 pp)
  let adds  = BUCKETS.reduce((s,b)=> s + Math.max(0, s1[b]), 0);
  let trims = BUCKETS.reduce((s,b)=> s - Math.min(0, s1[b]), 0);
  const EPS = 0.003;
  if (adds > trims + EPS) { const k = trims / adds; for (const b of BUCKETS) if (s1[b] > 0) s1[b] *= k; }
  if (trims > adds + EPS){ const k = adds / trims; for (const b of BUCKETS) if (s1[b] < 0) s1[b] *= k; }

  // 6) Stage-2 is the exact remainder to land on target
  const s2: Record<string, number> = {};
  for (const b of BUCKETS) {
    const d2 = draft2[b] ?? 0;              // optional: use as a hint
    const rem = need[b] - s1[b];
    // clamp Stage-2 to the remainder (sign-correct)
    s2[b] = rem >= 0 ? Math.min(Math.max(0, d2), rem)
                     : Math.max(Math.min(0, d2), rem);
    // ensure exact landing (force any residual rounding)
    s2[b] = rem;
  }

  // Use s1/s2 for stage1Net/stage2Net
  const stage1Net: Record<Bucket, number> = {} as any;
  const stage2Net: Record<Bucket, number> = {} as any;
  for (const b of BUCKETS) {
    stage1Net[b] = s1[b];
    stage2Net[b] = s2[b];
  }

  // YOUR EXACT GUARDRAILS from Implementation Brief (keep these assertions)
  // Exact landing per bucket
  for (const b of BUCKETS) {
    const n = need[b], d = (s1[b] ?? 0) + (s2[b] ?? 0);
    console.assert(Math.abs(d - n) <= 0.001, `Net mismatch: ${b}`);
    if (n >= 0) console.assert(d >= -1e-6 && d <= n + 1e-6, `Overshoot add: ${b}`);
    else        console.assert(d <=  1e-6 && d >= n - 1e-6, `Overshoot trim: ${b}`);
  }

  // Stage-1 self-funded
  const netS1 = BUCKETS.reduce((s,b)=> s + (s1[b] ?? 0), 0);
  console.assert(Math.abs(netS1) <= 0.003, "Stage-1 not self-funded");

  // 10) Rebuild actions table from stage1Net (single row per bucket)
  const stage1: Action[] = [];
  const stage2: Action[] = [];

  for (const b of CANONICAL_BUCKETS) {
    const s1 = stage1Net[b];
    if (Math.abs(s1) > 1e-6) {
      const isLiquidityBucket = (b === "CASH" || b === "BILLS_SHORT_GILTS");
      stage1.push({
        type: s1 > 0 ? "ADD" : "TRIM",
        bucket: b,
        deltaPct: s1,
        amountGBP: Math.abs(s1) * pv,
        estCostPct: (FRICTION_RATE[b] ?? 0) * Math.abs(s1),
        rationale: isLiquidityBucket 
          ? (s1 > 0 ? "Raise liquidity (short gilts)" : "Reduce liquidity")
          : (s1 > 0 ? "Increase allocation towards target" : "Reduce allocation towards target"),
        stage: 1
      });
    }

    const s2 = stage2Net[b];
    if (Math.abs(s2) > 1e-6) {
      stage2.push({
        type: s2 > 0 ? "ADD" : "TRIM",
        bucket: b,
        deltaPct: s2,
        amountGBP: Math.abs(s2) * pv,
        estCostPct: (FRICTION_RATE[b] ?? 0) * Math.abs(s2),
        rationale: s2 > 0 ? "Increase allocation towards target" : "Reduce allocation towards target",
        stage: 2
      });
    }
  }

  // 11) Totals / turnover / cost
  const estTurnoverPp = +(0.5 * totalAbsNeed * 100).toFixed(1);
  let estCostPct = 0;
  for (const a of [...stage1, ...stage2]) estCostPct += (a.estCostPct || 0);
  estCostPct = +estCostPct.toFixed(4);

  // 12) Playbook bullets
  const bullets: string[] = [];
  
  // YOUR EXACT RENDERING RULES - Liquidity copy must be computed from currentMix
  const currentLiquidity = current.CASH + current.BILLS_SHORT_GILTS;
  const afterStage1 = currentLiquidity + (s1.CASH ?? 0) + (s1.BILLS_SHORT_GILTS ?? 0);
  const topUpPp = Math.max(0, liqFloor - currentLiquidity);
  
  bullets.push(
    topUpPp > 1e-6
      ? `Top up liquidity by ~${pct(topUpPp)} pp (from ${pct(currentLiquidity)}% to ${pct(afterStage1)}%) before other moves.`
      : `Liquidity already meets the floor (${pct(currentLiquidity)}%).`
  );
  const addActions = stage1.filter(a=>a.type==="ADD").slice(0,3).map(a=>`add **${a.bucket.replace(/_/g," ")}** ~${pct(a.deltaPct)} pp`);
  const trimActions = stage1.filter(a=>a.type==="TRIM").slice(0,3).map(a=>`trim **${a.bucket.replace(/_/g," ")}** ~${pct(Math.abs(a.deltaPct))} pp`);
  if (trimActions.length) bullets.push(`Largest reductions now: ${trimActions.join("; ")}.`);
  if (addActions.length)  bullets.push(`Largest additions now: ${addActions.join("; ")}.`);
  if (stage2.some(a=>ILLIQUID_BUCKETS.includes(a.bucket as Bucket))) bullets.push(`Defer illiquid changes (property/alternatives/collectibles) to **Stage 2** or next review.`);
  bullets.push(`Keep individual trades above ${pct(minTrade)} pp to avoid noise.`);
  bullets.push(`Estimated turnover: ~${estTurnoverPp} pp; indicative cost: ~${(estCostPct*100).toFixed(2)}% of portfolio.`);

  return {
    summary: {
      totalAbsChangePp: +(totalAbsNeed*100).toFixed(1),
      estTurnoverPp,
      estCostPct,
      liquidityNowPct: +(currentLiquidity*100).toFixed(1),
      liquidityTargetPct: +((target.CASH + target.BILLS_SHORT_GILTS)*100).toFixed(1),
      liquidityFixPp: topUpPp > 1e-6 ? +(topUpPp*100).toFixed(1) : undefined,
    },
    staged: { stage1, stage2 },
    playbook: bullets
  };
}