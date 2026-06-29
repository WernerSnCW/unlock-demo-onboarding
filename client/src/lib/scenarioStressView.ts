import type { StressScenario } from '../data/stressScenarios';
import type { ScenarioStressResult } from './scenarioStress';

export interface StressNarrative {
  scenarioId: string;
  title: string;
  anchor: string;
  blurb: string;
  headline: string;
  contributors: string[];
}

function signedPct(n: number): string {
  const v = Math.round(n * 100);
  const sign = v > 0 ? '+' : v < 0 ? '−' : ''; // U+2212 minus, matching existing copy
  return `${sign}${Math.abs(v)}%`;
}

function absPct(n: number): string {
  return `${Math.abs(Math.round(n * 100))}%`;
}

export function buildStressNarrative(result: ScenarioStressResult, scenario: StressScenario): StressNarrative {
  const headline =
    `Illustrative impact: about ${signedPct(result.centralImpactPct)} ` +
    `(range ${signedPct(result.rangePct.mild)} to ${signedPct(result.rangePct.severe)})`;
  const contributors = result.topContributors.map(
    (c) => `${c.label} — ${absPct(c.pctOfLoss)} of the move`,
  );
  return {
    scenarioId: result.scenarioId,
    title: scenario.name,
    anchor: scenario.historicalAnchor,
    blurb: scenario.blurb,
    headline,
    contributors,
  };
}
