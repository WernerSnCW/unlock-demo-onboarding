import { computeStagedRebalance, type StagedRebalanceResult } from "./stagedRebalance";

export const BELIEF_MODELLED_BUCKETS = ['uk-equity', 'us-equity', 'global-equity', 'govt-bonds', 'property', 'cash'];
export const BELIEF_LIQUIDITY_BUCKETS = ['cash'];
export const BELIEF_ILLIQUID_BUCKETS = ['property'];
export const BELIEF_DONOR_ORDER = ['global-equity', 'us-equity', 'uk-equity', 'property'];

/** Illustrative round-trip cost assumptions for the 8-bucket episode taxonomy, same order of
 *  magnitude as the original FRICTION_RATE table (frictions.ts) mapped onto this taxonomy's buckets. */
export const BELIEF_FRICTION_RATE: Record<string, number> = {
  'uk-equity': 0.0015, 'us-equity': 0.0015, 'global-equity': 0.0015,
  'govt-bonds': 0.0006, 'property': 0.0100, 'cash': 0,
};

export interface BeliefActionsRequest {
  currentMix: Record<string, number>;
  targetMix: Record<string, number>;
  portfolioValueGBP: number;
  liquidityFloorPct?: number;
  minTradePct?: number;
  maxMoves?: number;
}

/** Spec §7: "new target-mix-construction logic driven by belief-weighted tier-1/2 exposure" —
 *  the target mix itself is `blendBeliefAllocation()`'s output (client/src/lib/beliefImpact/
 *  computeAlignment.ts); this function only stages the moves from current to that target,
 *  reusing the same generic algorithm the original /api/actions endpoint uses (Task 8). */
export function buildBeliefActions(req: BeliefActionsRequest): StagedRebalanceResult {
  return computeStagedRebalance({
    buckets: BELIEF_MODELLED_BUCKETS,
    current: req.currentMix,
    target: req.targetMix,
    portfolioValueGBP: Math.max(0, req.portfolioValueGBP || 0),
    liquidityBuckets: BELIEF_LIQUIDITY_BUCKETS,
    liquidityFloorPct: req.liquidityFloorPct ?? 0.10,
    donorOrder: BELIEF_DONOR_ORDER,
    minTradePct: req.minTradePct ?? 0.005,
    maxMoves: req.maxMoves ?? 6,
    illiquidBuckets: BELIEF_ILLIQUID_BUCKETS,
    frictionRate: BELIEF_FRICTION_RATE,
    stageIlliquids: true,
  });
}
