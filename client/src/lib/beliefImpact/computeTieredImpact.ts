import { EPISODES, BUCKETS, bucketFor, type Bucket } from '../../data/episodeLibrary';
import { STRESS_SCENARIOS } from '../../data/stressScenarios';
import { shockFor } from '../scenarioStress';
import type { Mix } from '../portfolioMix';
import {
  BUCKET_TIER, BELIEF_SCENARIO_MAPPING, type BeliefScenarioName, type ImpactTier,
} from '../../data/beliefImpactTaxonomy';
import { renormaliseOverModelledBuckets } from './computeAlignment';

export interface CitedSource {
  id: string;
  name: string;
  troughPct: number;
  recoveryLabel: string;
}

export interface BucketImpactRow {
  bucket: Bucket;
  tier: ImpactTier;
  weightPct: number;
  citedSources: CitedSource[];
}

export interface UnmodelledEntry {
  name: string;
  valueGbp: number;
}

export interface TieredImpactResult {
  rows: BucketImpactRow[];
  unmodelledSharePct: number;
  unmodelledBreakdown: UnmodelledEntry[];
}

interface HoldingForBreakdown { asset_class: string; region: string; value_gbp: number; }

const MODELLED_BUCKETS: Bucket[] = BUCKETS.filter((b) => BUCKET_TIER[b] !== 'UNMODELLED');

const BUCKET_TO_ASSET_REGION: Record<Bucket, [string, string]> = {
  'uk-equity': ['equity', 'uk'], 'us-equity': ['equity', 'us'],
  'europe-equity': ['equity', 'europe'], 'emerging-equity': ['equity', 'emerging'],
  'global-equity': ['equity', 'global'], 'govt-bonds': ['bond', 'global'],
  'property': ['property', 'uk'], 'cash': ['cash', 'uk'],
};

/** Spec §1/§4/§8: per-bucket tiered impact narrative. Reads cited episode paths directly (tier 1)
 *  and `shockFor` (tier 2) — this function only wires belief scenarios to the buckets the user
 *  holds, which is the genuinely new part per spec §4. `mix` is renormalised over modelled buckets
 *  before use so rows and weightPct never include UNMODELLED-tier (europe/emerging-equity) mass;
 *  that mass is folded into `unmodelledBreakdown` instead. */
export function computeTieredImpact(
  mix: Mix,
  holdings: HoldingForBreakdown[],
  scenarioWeights: Partial<Record<BeliefScenarioName, number>>,
  portfolioValueGBP: number,
): TieredImpactResult {
  const topScenarios = (Object.entries(scenarioWeights) as [BeliefScenarioName, number][])
    .filter(([name, w]) => w > 0.05 && !BELIEF_SCENARIO_MAPPING[name].isUpside)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const normalisedMix = renormaliseOverModelledBuckets(mix);

  const rows: BucketImpactRow[] = [];
  for (const bucket of MODELLED_BUCKETS) {
    const weightPct = normalisedMix[bucket] * 100;
    if (weightPct <= 0) continue;
    const tier = BUCKET_TIER[bucket];
    const citedSourcesById = new Map<string, CitedSource>();

    for (const [scenarioName] of topScenarios) {
      const mapping = BELIEF_SCENARIO_MAPPING[scenarioName];
      if (mapping.isUpside) continue;

      if (tier === 'EPISODE_REPLAY') {
        for (const epId of mapping.episodeIds) {
          const episode = EPISODES.find((e) => e.id === epId);
          if (!episode) continue;
          const path = episode.paths[bucket];
          if (path === null) continue;
          const troughPct = path.points[path.troughIndex];
          if (Math.abs(troughPct) < 0.01) continue; // held steady in this episode — not worth citing as an impact
          const stepsFromTrough = path.recoveryIndex === -1 ? null : path.recoveryIndex - path.troughIndex;
          citedSourcesById.set(episode.id, {
            id: episode.id,
            name: episode.name,
            troughPct,
            recoveryLabel: stepsFromTrough === null
              ? 'not recovered within the recorded window'
              : `${stepsFromTrough} ${episode.granularity === 'annual' ? 'year' : 'month'}${stepsFromTrough === 1 ? '' : 's'}`,
          });
        }
      } else if (tier === 'MODERN_ANCHOR') {
        for (const ssId of mapping.stressScenarioIds) {
          const stressScenario = STRESS_SCENARIOS.find((s) => s.id === ssId);
          if (!stressScenario) continue;
          const [assetClass, region] = BUCKET_TO_ASSET_REGION[bucket];
          citedSourcesById.set(stressScenario.id, {
            id: stressScenario.id,
            name: stressScenario.name,
            troughPct: shockFor(stressScenario, assetClass, region),
            recoveryLabel: 'illustrative, not a cited recovery period',
          });
        }
      }
    }
    // Multiple top-weighted scenarios can map to the same underlying episode/stress-scenario id
    // (e.g. Stagflation, Debt Spiral, and Sterling Devaluation all cite STAGFLATION_1973) — dedupe
    // by id so a single citation isn't repeated verbatim once per scenario that references it.
    const citedSources = Array.from(citedSourcesById.values());
    rows.push({ bucket, tier, weightPct: Math.round(weightPct * 10) / 10, citedSources });
  }

  const validHoldings = holdings.filter((h) => h.value_gbp > 0);
  const totalValue = validHoldings.reduce((s, h) => s + h.value_gbp, 0);

  const byKey = new Map<string, number>();
  for (const h of validHoldings) {
    const bucket = bucketFor(h.asset_class, h.region);
    if (bucket === null) {
      byKey.set(h.asset_class, (byKey.get(h.asset_class) ?? 0) + h.value_gbp);
    } else if (BUCKET_TIER[bucket] === 'UNMODELLED') {
      byKey.set(bucket, (byKey.get(bucket) ?? 0) + h.value_gbp);
    }
  }
  const unmodelledValue = Array.from(byKey.values()).reduce((s, v) => s + v, 0);
  const unmodelledSharePct = totalValue > 0 ? Math.round((unmodelledValue / totalValue) * 1000) / 10 : 0;
  const unmodelledBreakdown: UnmodelledEntry[] = Array.from(byKey.entries())
    .map(([name, valueGbp]) => ({ name, valueGbp }))
    .sort((a, b) => b.valueGbp - a.valueGbp);

  return { rows, unmodelledSharePct, unmodelledBreakdown };
}
