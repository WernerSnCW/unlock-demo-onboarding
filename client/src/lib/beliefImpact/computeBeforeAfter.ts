import { EPISODES, type Bucket, type Episode } from '../../data/episodeLibrary';
import type { Mix } from '../portfolioMix';
import { replayEpisode, type EpisodeReplay } from '../empiricalEngine';
import { BELIEF_SCENARIO_MAPPING, type BeliefScenarioName } from '../../data/beliefImpactTaxonomy';
import { renormaliseOverModelledBuckets, MODELLED_BUCKETS, computeAlignment, blendBeliefAllocation } from './computeAlignment';
import { computeIncomeRunway, type IncomeRunwayResult } from './computeIncomeRunway';

export interface MixDiffRow {
  bucket: Bucket;
  beforePct: number; // 0-100, 1dp, renormalised over modelled buckets
  afterPct: number;
  deltaPp: number;   // signed, 1dp
}

/** Per-bucket now -> after rows. "After" is the full target mix — stage-1 + stage-2 deltas sum
 *  exactly to target − current (stagedRebalance.ts assertion), so applying all staged moves lands
 *  on targetMix. Rows where both sides are 0 are dropped.
 *  targetMix is assumed to already sum to 1 over modelled buckets (e.g. the output of
 *  blendBeliefAllocation), which is why only currentMix is renormalised. */
export function computeMixDiff(currentMix: Mix, targetMix: Mix): MixDiffRow[] {
  const before = renormaliseOverModelledBuckets(currentMix);
  const rows: MixDiffRow[] = [];
  for (const b of MODELLED_BUCKETS) {
    const beforePct = Math.round(before[b] * 1000) / 10;
    const afterPct = Math.round(targetMix[b] * 1000) / 10;
    if (beforePct <= 0 && afterPct <= 0) continue;
    rows.push({ bucket: b, beforePct, afterPct, deltaPp: Math.round((targetMix[b] - before[b]) * 1000) / 10 });
  }
  return rows;
}

export interface EpisodeComparison {
  episodeId: string;
  episodeName: string;
  beforeTroughPct: number; // fraction, e.g. -0.21
  afterTroughPct: number;
  beforeRecoveryLabel: string;
  afterRecoveryLabel: string;
}

const TOP_SCENARIOS = 3;
const MIN_SCENARIO_WEIGHT = 0.05;

/** Same selection rule as computeTieredImpact (top 3 non-upside, weight > 0.05) so the compared
 *  episode is always one the previous page already cited. */
function citedEpisodes(scenarioWeights: Partial<Record<BeliefScenarioName, number>>): Episode[] {
  const top = (Object.entries(scenarioWeights) as [BeliefScenarioName, number][])
    .filter(([name, w]) => w > MIN_SCENARIO_WEIGHT && !BELIEF_SCENARIO_MAPPING[name].isUpside)
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_SCENARIOS);
  const ids = new Set<string>();
  for (const [name] of top) for (const id of BELIEF_SCENARIO_MAPPING[name].episodeIds) ids.add(id);
  return EPISODES.filter((e) => ids.has(e.id));
}

function recoveryLabel(replay: EpisodeReplay): string {
  if (replay.recoverySteps === null) return 'not recovered within the recorded window';
  const unit = replay.granularity === 'annual' ? 'year' : 'month';
  return `${replay.recoverySteps} ${unit}${replay.recoverySteps === 1 ? '' : 's'} from the trough`;
}

/** Portfolio-level worst cited episode, replayed on both mixes. Picking by BEFORE drawdown and
 *  reporting the SAME episode's after keeps the comparison apples-to-apples.
 *  targetMix is assumed to already sum to 1 over modelled buckets (e.g. the output of
 *  blendBeliefAllocation); only currentMix is renormalised. */
export function computeWorstEpisodeComparison(
  currentMix: Mix,
  targetMix: Mix,
  scenarioWeights: Partial<Record<BeliefScenarioName, number>>,
  portfolioValueGBP: number,
): EpisodeComparison | null {
  const before = renormaliseOverModelledBuckets(currentMix);
  let worst: EpisodeComparison | null = null;
  let worstDrawdown = Infinity;
  for (const episode of citedEpisodes(scenarioWeights)) {
    const beforeReplay = replayEpisode(before, episode, portfolioValueGBP);
    if (beforeReplay.drawdown >= worstDrawdown) continue;
    const afterReplay = replayEpisode(targetMix, episode, portfolioValueGBP);
    worstDrawdown = beforeReplay.drawdown;
    worst = {
      episodeId: episode.id,
      episodeName: episode.name,
      beforeTroughPct: beforeReplay.drawdown,
      afterTroughPct: afterReplay.drawdown,
      beforeRecoveryLabel: recoveryLabel(beforeReplay),
      afterRecoveryLabel: recoveryLabel(afterReplay),
    };
  }
  return worst;
}

export interface RunwayComparison {
  episodeName: string;
  unit: 'year' | 'month';
  before: IncomeRunwayResult;
  after: IncomeRunwayResult;
}

/** Selling-into-the-trough verdict, before vs after, on ONE named episode. Note: the
 *  buffer-exhaustion step is mix-independent — only the recovery timing changes with the mix —
 *  so the comparison is the verdict, never a "runway months" uplift number.
 *  Returns null when spend is unset: computeIncomeRunway's documented precondition — a zero
 *  spend always reports "survives", which would be a false reassurance.
 *  targetMix is assumed to already sum to 1 over modelled buckets (e.g. blendBeliefAllocation
 *  output); only currentMix is renormalised. */
export function computeRunwayComparison(
  currentMix: Mix,
  targetMix: Mix,
  episodeId: string,
  portfolioValueGBP: number,
  annualEssentialSpendGbp: number,
  liquidCashGbp: number,
): RunwayComparison | null {
  if (annualEssentialSpendGbp <= 0) return null;
  const episode = EPISODES.find((e) => e.id === episodeId);
  if (!episode) return null;
  const before = replayEpisode(renormaliseOverModelledBuckets(currentMix), episode, portfolioValueGBP);
  const after = replayEpisode(targetMix, episode, portfolioValueGBP);
  return {
    episodeName: episode.name,
    unit: episode.granularity === 'annual' ? 'year' : 'month',
    before: computeIncomeRunway(before, annualEssentialSpendGbp, liquidCashGbp, episode.name),
    after: computeIncomeRunway(after, annualEssentialSpendGbp, liquidCashGbp, episode.name),
  };
}

export interface BeforeAfterInputs {
  currentMix: Mix;
  targetMix: Mix;
  scenarioWeights: Partial<Record<BeliefScenarioName, number>>;
  riskComfort: string;
  portfolioValueGBP: number;
  annualEssentialSpendGbp: number;
  liquidCashGbp: number;
}

export interface BeforeAfterResult {
  alignment: { before: number; after: number };
  mixDiff: MixDiffRow[];
  worstEpisode: EpisodeComparison | null;
  runway: RunwayComparison | null;
}

/** The full step-5 payload: every number is a re-run of an engine the previous page already
 *  used, on the same inputs, with only the mix swapped current -> target. After-alignment is
 *  100 by construction (the target IS the blended outlook ideal) — callers must caption it as
 *  definitional, not present it as an uplift. */
export function computeBeforeAfter(i: BeforeAfterInputs): BeforeAfterResult {
  const alignment = {
    before: computeAlignment(i.currentMix, i.scenarioWeights, i.riskComfort).score,
    after: computeAlignment(i.targetMix, i.scenarioWeights, i.riskComfort).score,
  };
  const mixDiff = computeMixDiff(i.currentMix, i.targetMix);
  const worstEpisode = computeWorstEpisodeComparison(
    i.currentMix, i.targetMix, i.scenarioWeights, i.portfolioValueGBP,
  );
  const runway = worstEpisode
    ? computeRunwayComparison(
        i.currentMix, i.targetMix, worstEpisode.episodeId,
        i.portfolioValueGBP, i.annualEssentialSpendGbp, i.liquidCashGbp,
      )
    : null;
  return { alignment, mixDiff, worstEpisode, runway };
}
