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

  // 1) Calculate exact need for each bucket (target - current)
  const need: Record<Bucket, number> = {} as any;
  let totalAbsNeed = 0;
  for (const b of CANONICAL_BUCKETS) {
    need[b] = +(target[b] - current[b]).toFixed(6);
    totalAbsNeed += Math.abs(need[b]);
  }

  // 2) liquidity analysis
  const liqNow = current.CASH + current.BILLS_SHORT_GILTS;
  const liqTgt = target.CASH + target.BILLS_SHORT_GILTS;
  const needLiq = Math.max(0, liqFloor - liqNow);

  // 3) Build preliminary stage1 actions as if we had unlimited moves
  // Create initial draft actions (both liquidity and rebalancing needs)
  const stage1Draft: Action[] = [];

  // 3a) Liquidity fix actions (if needed)
  if (needLiq > 1e-6) {
    let remaining = needLiq;
    for (const d of donors) {
      if (remaining <= 1e-6) break;
      const canGive = Math.min(current[d], remaining);
      if (canGive <= 1e-6) continue;
      stage1Draft.push({
        type: "TRIM", bucket: d, deltaPct: -canGive, amountGBP: canGive * pv,
        estCostPct: (FRICTION_RATE[d] ?? 0) * canGive,
        rationale: "Raise liquidity to reach floor", stage: 1
      });
      remaining -= canGive;
    }
    // receive into Bills first, then Cash
    const recvEach = needLiq - Math.max(0, remaining);
    const toBills = Math.min(recvEach, 1 - current.BILLS_SHORT_GILTS);
    const toCash  = Math.max(0, recvEach - toBills);
    if (toBills > 1e-6) stage1Draft.push({
      type: "ADD", bucket: "BILLS_SHORT_GILTS", deltaPct: toBills, amountGBP: toBills*pv,
      rationale: "Raise liquidity (short gilts)", stage: 1
    });
    if (toCash > 1e-6) stage1Draft.push({
      type: "ADD", bucket: "CASH", deltaPct: toCash, amountGBP: toCash*pv,
      rationale: "Raise liquidity (cash)", stage: 1
    });
  }

  // 3b) Rebalancing actions for biggest gaps
  const order = [...CANONICAL_BUCKETS].sort((a,b)=>Math.abs(need[b]) - Math.abs(need[a]));
  let moves = 0;
  for (const b of order) {
    const n = need[b];
    if (Math.abs(n) < minTrade) continue;
    const isIlliq = stageIlliq && ILLIQUID_BUCKETS.includes(b);
    if (!isIlliq && moves < maxMoves) {
      stage1Draft.push({
        type: n > 0 ? "ADD" : "TRIM", bucket: b, deltaPct: n, amountGBP: Math.abs(n) * pv,
        estCostPct: (FRICTION_RATE[b] ?? 0) * Math.abs(n),
        rationale: n > 0 ? "Increase allocation towards target" : "Reduce allocation towards target",
        stage: 1
      });
      moves++;
    }
  }

  // 4) Aggregate preliminary actions to one row per bucket (your exact spec)
  const draft: Record<string, number> = {};
  for (const a of stage1Draft) {
    draft[a.bucket] = (draft[a.bucket] ?? 0) + a.deltaPct;
  }

  // 5) Clamp to exact need (no overshoot, no wrong sign) - your exact spec
  const s1: Record<string, number> = {};
  for (const b of CANONICAL_BUCKETS) {
    const needForBucket = need[b];
    const draftForBucket = draft[b] ?? 0;
    s1[b] = needForBucket >= 0
      ? Math.min(Math.max(0, draftForBucket), needForBucket)     // adds: 0..need
      : Math.max(Math.min(0, draftForBucket), needForBucket);    // trims: need..0
  }

  // 6) Optionally zero illiquids in Stage-1 (defer to Stage-2) - your exact spec
  if (stageIlliq) {
    for (const b of ILLIQUID_BUCKETS) {
      s1[b] = 0;
    }
  }

  // 7) Self-fund Stage-1 (adds ≈ trims within 0.3 pp) - your exact spec
  let adds  = CANONICAL_BUCKETS.reduce((s,b)=> s + Math.max(0, s1[b]), 0);
  let trims = CANONICAL_BUCKETS.reduce((s,b)=> s - Math.min(0, s1[b]), 0);
  const EPS = 0.003; // 0.3 pp
  
  if (adds > trims + EPS) { 
    const k = trims / adds; 
    for (const b of CANONICAL_BUCKETS) if (s1[b] > 0) s1[b] *= k; 
  }
  if (trims > adds + EPS) { 
    const k = adds / trims; 
    for (const b of CANONICAL_BUCKETS) if (s1[b] < 0) s1[b] *= k; 
  }

  // Use s1 as our stage1Net for consistency with rest of code
  const stage1Net: Record<Bucket, number> = {} as any;
  for (const b of CANONICAL_BUCKETS) {
    stage1Net[b] = s1[b];
  }

  // 8) Everything not done in Stage-1 goes to Stage-2
  const stage2Net: Record<Bucket, number> = {} as any;
  for (const b of CANONICAL_BUCKETS) {
    stage2Net[b] = need[b] - stage1Net[b];
  }

  // 9) Final guardrails (assertions) - catch issues early
  for (const b of CANONICAL_BUCKETS) {
    const total = stage1Net[b] + stage2Net[b];
    if (Math.abs(total - need[b]) > 1e-6) {
      console.warn(`Net mismatch ${b}: Stage1+Stage2 (${total.toFixed(6)}) != need (${need[b].toFixed(6)})`);
    }
  }

  const stage1Sum = CANONICAL_BUCKETS.reduce((s,b)=> s + stage1Net[b], 0);
  if (Math.abs(stage1Sum) > EPS) {
    console.warn(`Stage-1 not self-funded: net = ${stage1Sum.toFixed(6)} (should be ~0)`);
  }

  for (const b of CANONICAL_BUCKETS) {
    const s1 = stage1Net[b], n = need[b];
    if (n >= 0 && (s1 > n + 1e-6 || s1 < -1e-6)) {
      console.warn(`Overshoot add ${b}: stage1=${s1.toFixed(6)}, need=${n.toFixed(6)}`);
    }
    if (n < 0 && (s1 < n - 1e-6 || s1 > 1e-6)) {
      console.warn(`Overshoot trim ${b}: stage1=${s1.toFixed(6)}, need=${n.toFixed(6)}`);
    }
  }

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
  
  // Calculate current and after-stage-1 liquidity (same calculation as Gap Analysis)
  const currentLiquidity = current.CASH + current.BILLS_SHORT_GILTS;
  const topUpPp = Math.max(0, liqFloor - currentLiquidity);
  const afterStage1Liquidity = currentLiquidity + (stage1Net.CASH || 0) + (stage1Net.BILLS_SHORT_GILTS || 0);
  
  bullets.push(
    topUpPp > 1e-6
      ? `Top up liquidity by ~${pct(topUpPp)} pp (from ${pct(currentLiquidity)}% to ${pct(afterStage1Liquidity)}%) before other moves.`
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
      liquidityNowPct: +(liqNow*100).toFixed(1),
      liquidityTargetPct: +(liqTgt*100).toFixed(1),
      liquidityFixPp: needLiq > 1e-6 ? +(needLiq*100).toFixed(1) : undefined,
    },
    staged: { stage1, stage2 },
    playbook: bullets
  };
}