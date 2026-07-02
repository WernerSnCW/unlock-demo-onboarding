import { BELIEF_QUESTIONS } from '../../data/beliefQuestions';
import { BELIEF_SCENARIO_NAMES, type BeliefScenarioName } from '../../data/beliefImpactTaxonomy';

export type OutlookAnswer = 1 | 2 | 3 | 4 | 5;

export interface ScoreOutlookResult {
  scenarioWeights: Record<BeliefScenarioName, number>;
  insufficientSignal: boolean;
}

function normaliseOutlookAnswer(answer: OutlookAnswer): number {
  return (answer - 3) / 2;
}

function directionSign(direction: string): 1 | -1 {
  return direction.trim().toLowerCase().startsWith('lower') ? -1 : 1;
}

function zeroedScenarios(): Record<BeliefScenarioName, number> {
  return Object.fromEntries(BELIEF_SCENARIO_NAMES.map((s) => [s, 0])) as Record<BeliefScenarioName, number>;
}

/** Spec §3: sum signed contributions WITHIN each scenario first, THEN clamp at zero, THEN
 *  normalise across scenarios. Supersedes an earlier per-question clamp (audit fix) which let one
 *  agreed-with question fully drive a scenario while a contradicting answer to the SAME scenario
 *  contributed nothing. */
export function scoreOutlookBeliefs(
  responses: Partial<Record<string, OutlookAnswer>>,
): ScoreOutlookResult {
  const totals = zeroedScenarios();

  for (const q of BELIEF_QUESTIONS) {
    const answer = responses[q.id];
    if (answer === undefined) continue;
    const signedScore = normaliseOutlookAnswer(answer) * directionSign(q.direction);
    for (const [scenarioName, weight] of Object.entries(q.weights)) {
      totals[scenarioName as BeliefScenarioName] += signedScore * weight;
    }
  }

  const clamped = Object.fromEntries(
    BELIEF_SCENARIO_NAMES.map((s) => [s, Math.max(0, totals[s])]),
  ) as Record<BeliefScenarioName, number>;
  const sum = BELIEF_SCENARIO_NAMES.reduce((s, name) => s + clamped[name], 0);

  if (sum <= 1e-9) {
    return { scenarioWeights: zeroedScenarios(), insufficientSignal: true };
  }

  return {
    scenarioWeights: Object.fromEntries(
      BELIEF_SCENARIO_NAMES.map((s) => [s, clamped[s] / sum]),
    ) as Record<BeliefScenarioName, number>,
    insufficientSignal: false,
  };
}
