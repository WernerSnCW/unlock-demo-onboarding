import type { Mix } from '../portfolioMix';
import { BUCKETS, type Bucket } from '../../data/episodeLibrary';
import {
  BUCKET_TIER, BELIEF_SCENARIO_ALLOCATION_PRIORS, BELIEF_SCENARIO_NAMES, type BeliefScenarioName,
} from '../../data/beliefImpactTaxonomy';

export type AlignmentBand = 'BROADLY_ALIGNED' | 'PARTIALLY_ALIGNED' | 'MISALIGNED';

export interface AlignmentResult {
  score: number;
  band: AlignmentBand;
  concentrationFlag: string | null;
  hhi: number;
  nEff: number;
  mismatchFlag: string | null;
}

const MODELLED_BUCKETS: Bucket[] = BUCKETS.filter((b) => BUCKET_TIER[b] !== 'UNMODELLED');

/** Blend belief scenario weights into an 8-bucket "ideal allocation" vector (spec §5 substrate) —
 *  same pattern as computeGap.ts's blendScenarioTemplates, applied to the real-data taxonomy.
 *  Also serves as the alternatives target mix (spec §7) — see the alternatives engine task. */
export function blendBeliefAllocation(weights: Partial<Record<BeliefScenarioName, number>>): Mix {
  const total = BELIEF_SCENARIO_NAMES.reduce((s, name) => s + (weights[name] ?? 0), 0);
  const out = Object.fromEntries(BUCKETS.map((b) => [b, 0])) as Mix;
  if (total <= 0) return out;
  for (const name of BELIEF_SCENARIO_NAMES) {
    const w = (weights[name] ?? 0) / total;
    if (w <= 0) continue;
    const prior = BELIEF_SCENARIO_ALLOCATION_PRIORS[name];
    for (const [bucket, p] of Object.entries(prior)) {
      out[bucket as Bucket] += (p as number) * w;
    }
  }
  return out;
}

function l1Modelled(a: Mix, b: Mix): number {
  return MODELLED_BUCKETS.reduce((sum, k) => sum + Math.abs(a[k] - b[k]), 0);
}

function bandFor(score: number): AlignmentBand {
  if (score >= 70) return 'BROADLY_ALIGNED';
  if (score >= 40) return 'PARTIALLY_ALIGNED';
  return 'MISALIGNED';
}

/** Same predicate as computeGap.ts's isCautious(), ported (that file is keyed to the old
 *  16-bucket taxonomy's request shape and not reused directly here). */
function isCautious(riskComfort: string, drawdownCap?: number): boolean {
  const s = (riskComfort || '').toLowerCase();
  return s.includes('conservative') || s.includes('income') || s.includes('defensive')
    || (typeof drawdownCap === 'number' && drawdownCap <= 0.20);
}

/** Spec §5: reuses computeGap.ts's alignment/HHI/concentration/isCautious formulas, recomputed
 *  over the real 8-bucket episodeLibrary taxonomy. `mix` is expected to already come normalised-
 *  over-modelled-buckets-only from `mixFromHoldings` (portfolioMix.ts), so tier-3 buckets are
 *  already excluded before this function runs. */
export function computeAlignment(
  mix: Mix,
  scenarioWeights: Partial<Record<BeliefScenarioName, number>>,
  riskComfort: string,
  drawdownCap?: number,
): AlignmentResult {
  const idealAllocation = blendBeliefAllocation(scenarioWeights);
  const distance = l1Modelled(mix, idealAllocation);
  const score = Math.round(100 * (1 - distance / 2));

  const hhi = MODELLED_BUCKETS.reduce((s, b) => s + mix[b] * mix[b], 0);
  const nEff = hhi > 0 ? 1 / hhi : 0;

  let concentrationFlag: string | null = null;
  for (const b of MODELLED_BUCKETS) {
    if (mix[b] > 0.35) { concentrationFlag = `Concentration: ${b} is over 35% of your modelled portfolio.`; break; }
  }

  const cautious = isCautious(riskComfort, drawdownCap);
  const mismatchFlag = (cautious && concentrationFlag !== null)
    ? 'You described yourself as cautious, but your holdings are concentrated — a mismatch worth a closer look.'
    : null;

  return { score, band: bandFor(score), concentrationFlag, hhi, nEff, mismatchFlag };
}
