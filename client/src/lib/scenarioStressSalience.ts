import type { AxisCode } from '../state/onboardingV2Store';
import type { StressScenario } from '../data/stressScenarios';
import type { ScenarioStressResult } from './scenarioStress';

export interface SalienceInput {
  axisScores: Partial<Record<AxisCode, number>>;
}

/** Threshold matches the store's TOWARDS direction cutoff (score > 0.20). */
const TOWARDS_THRESHOLD = 0.2;

export function isSalient(scenario: StressScenario, input: SalienceInput): boolean {
  return scenario.beliefSalience.some((axis) => (input.axisScores[axis] ?? 0) > TOWARDS_THRESHOLD);
}

/** Stable partition: salient scenarios first, original order preserved within each group. No scenario is dropped. */
export function orderBySalience(
  results: ScenarioStressResult[],
  scenarios: StressScenario[],
  input: SalienceInput,
): ScenarioStressResult[] {
  const byId = new Map(scenarios.map((s) => [s.id, s]));
  const salient: ScenarioStressResult[] = [];
  const rest: ScenarioStressResult[] = [];
  for (const r of results) {
    const scenario = byId.get(r.scenarioId);
    if (scenario && isSalient(scenario, input)) salient.push(r);
    else rest.push(r);
  }
  return [...salient, ...rest];
}
