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

  // 1) deltas
  const deltas: Record<Bucket, number> = {} as any;
  let abs = 0;
  for (const b of CANONICAL_BUCKETS) {
    deltas[b] = +(target[b] - current[b]).toFixed(6);
    abs += Math.abs(deltas[b]);
  }

  // 2) liquidity
  const liqNow = current.CASH + current.BILLS_SHORT_GILTS;
  const liqTgt = target.CASH + target.BILLS_SHORT_GILTS;
  const needLiq = Math.max(0, liqFloor - liqNow); // how much floor requires right now

  // 3) stage 1 priorities
  const stage1: Action[] = [];
  const stage2: Action[] = [];
  let moves = 0;

  // 3a) Liquidity fix first (if needed)
  if (needLiq > 1e-6) {
    let remaining = needLiq;
    for (const d of donors) {
      if (remaining <= 1e-6) break;
      const canGive = Math.min(current[d], remaining);
      if (canGive <= 1e-6) continue;
      const gbp = canGive * pv;
      const cost = (FRICTION_RATE[d] ?? 0) * canGive;
      stage1.push({
        type: "TRIM", bucket: d, deltaPct: -canGive, amountGBP: gbp,
        estCostPct: cost,
        rationale: "Raise liquidity to reach floor",
        stage: 1
      });
      remaining -= canGive; moves++;
      if (moves >= maxMoves) break;
    }
    // receive into Bills first, then Cash
    const recvEach = Math.max(0, needLiq - Math.max(0, remaining));
    const toBills = Math.min(recvEach, 1 - current.BILLS_SHORT_GILTS);
    const toCash  = Math.max(0, recvEach - toBills);
    if (toBills > 1e-6) stage1.push({
      type: "ADD", bucket: "BILLS_SHORT_GILTS", deltaPct: toBills, amountGBP: toBills*pv,
      rationale: "Raise liquidity (short gilts)", stage: 1
    });
    if (toCash > 1e-6) stage1.push({
      type: "ADD", bucket: "CASH", deltaPct: toCash, amountGBP: toCash*pv,
      rationale: "Raise liquidity (cash)", stage: 1
    });
  }

  // 3b) Biggest gaps next (ignoring tiny trades)
  const order = [...CANONICAL_BUCKETS].sort((a,b)=>Math.abs(deltas[b]) - Math.abs(deltas[a]));
  for (const b of order) {
    const d = deltas[b];
    if (Math.abs(d) < minTrade) continue;
    const isIlliq = stageIlliq && ILLIQUID_BUCKETS.includes(b);
    const action: Action = {
      type: d > 0 ? "ADD" : "TRIM",
      bucket: b,
      deltaPct: d,
      amountGBP: Math.abs(d) * pv,
      estCostPct: (FRICTION_RATE[b] ?? 0) * Math.abs(d),
      rationale: d > 0
        ? "Increase allocation towards target"
        : "Reduce allocation towards target",
      stage: isIlliq ? 2 : 1
    };
    if (!isIlliq && moves < maxMoves) { stage1.push(action); moves++; }
    else { stage2.push(action); }
  }

  // 4) Totals / turnover / cost
  const estTurnoverPp = +(0.5 * abs * 100).toFixed(1);
  let estCostPct = 0;
  for (const a of [...stage1, ...stage2]) estCostPct += (a.estCostPct || 0);
  estCostPct = +estCostPct.toFixed(4);

  // 5) Tiny playbook (5–7 bullets)
  const bullets: string[] = [];
  
  // Calculate after-stage-1 liquidity for bullet 1
  let stage1LiquidityDelta = 0;
  for (const action of stage1) {
    if (action.bucket === "CASH" || action.bucket === "BILLS_SHORT_GILTS") {
      stage1LiquidityDelta += action.deltaPct;
    }
  }
  const afterStage1Liquidity = liqNow + stage1LiquidityDelta;
  
  bullets.push(
    needLiq > 1e-6
      ? `Top up liquidity by ~${pct(needLiq)} pp (from ${pct(liqNow)}% to ${pct(afterStage1Liquidity)}%) before other moves.`
      : `Liquidity already meets the floor (${pct(liqNow)}%).`
  );
  const adds = stage1.filter(a=>a.type==="ADD").slice(0,3).map(a=>`add **${a.bucket.replace(/_/g," ")}** ~${pct(a.deltaPct)} pp`);
  const trims= stage1.filter(a=>a.type==="TRIM").slice(0,3).map(a=>`trim **${a.bucket.replace(/_/g," ")}** ~${pct(Math.abs(a.deltaPct))} pp`);
  if (trims.length) bullets.push(`Largest reductions now: ${trims.join("; ")}.`);
  if (adds.length)  bullets.push(`Largest additions now: ${adds.join("; ")}.`);
  if (stage2.some(a=>ILLiq(a.bucket))) bullets.push(`Defer illiquid changes (property/alternatives/collectibles) to **Stage 2** or next review.`);
  bullets.push(`Keep individual trades above ${pct(minTrade)} pp to avoid noise.`);
  bullets.push(`Estimated turnover: ~${estTurnoverPp} pp; indicative cost: ~${(estCostPct*100).toFixed(2)}% of portfolio.`);

  function ILLiq(b: string){ return ILLIQUID_BUCKETS.includes(b as Bucket); }

  return {
    summary: {
      totalAbsChangePp: +(abs*100).toFixed(1),
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