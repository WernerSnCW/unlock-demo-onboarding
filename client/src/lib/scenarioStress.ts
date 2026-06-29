import type { StressScenario } from '../data/stressScenarios';
import { rankContributors, type StressContributor } from './portfolioMath';

/** Minimal holdings shape the engine needs - decoupled from the store's Holding. */
export interface StressHolding {
  instrument_name: string;
  asset_class: string;
  region: string;
  value_gbp: number;
}

export type { StressContributor }; // re-export to keep existing import sites working

export interface ScenarioStressResult {
  scenarioId: string;
  centralImpactGbp: number;
  centralImpactPct: number;
  rangeGbp: { mild: number; severe: number };
  rangePct: { mild: number; severe: number };
  topContributors: StressContributor[];
}

/** Look up the shock for an (asset_class, region) pair, case-insensitive, with fallback. */
export function shockFor(scenario: StressScenario, assetClass: string, region: string): number {
  const ac = assetClass.toLowerCase();
  const rg = region.toLowerCase();
  const byRegion = scenario.shocks[ac];
  if (byRegion && typeof byRegion[rg] === 'number') return byRegion[rg];
  const dflt = scenario.defaultShockByAssetClass[ac];
  return typeof dflt === 'number' ? dflt : 0;
}

export function computeScenarioStress(
  holdings: StressHolding[],
  scenarios: StressScenario[],
): ScenarioStressResult[] {
  const valid = holdings.filter((h) => h.value_gbp > 0);
  const total = valid.reduce((sum, h) => sum + h.value_gbp, 0);

  return scenarios.map((scenario) => {
    const perHolding = valid.map((h) => ({
      label: h.instrument_name,
      impactGbp: h.value_gbp * shockFor(scenario, h.asset_class, h.region),
    }));
    const centralImpactGbp = perHolding.reduce((sum, c) => sum + c.impactGbp, 0);
    const centralImpactPct = total > 0 ? centralImpactGbp / total : 0;
    const { mildMultiplier, severeMultiplier } = scenario.severityRange;

    const topContributors = rankContributors(
      perHolding.map((c) => ({ label: c.label, impactGbp: c.impactGbp })),
      3,
    );

    return {
      scenarioId: scenario.id,
      centralImpactGbp,
      centralImpactPct,
      rangeGbp: { mild: centralImpactGbp * mildMultiplier, severe: centralImpactGbp * severeMultiplier },
      rangePct: { mild: centralImpactPct * mildMultiplier, severe: centralImpactPct * severeMultiplier },
      topContributors,
    };
  });
}
