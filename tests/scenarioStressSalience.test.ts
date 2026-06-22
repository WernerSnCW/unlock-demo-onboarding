import { describe, it, expect } from 'vitest';
import { orderBySalience, isSalient } from '../client/src/lib/scenarioStressSalience';
import { STRESS_SCENARIOS } from '../client/src/data/stressScenarios';
import type { ScenarioStressResult } from '../client/src/lib/scenarioStress';

function resultFor(id: string): ScenarioStressResult {
  return {
    scenarioId: id, centralImpactGbp: -1, centralImpactPct: -0.1,
    rangeGbp: { mild: 0, severe: 0 }, rangePct: { mild: 0, severe: 0 }, topContributors: [],
  };
}
const results = STRESS_SCENARIOS.map((s) => resultFor(s.id));

describe('isSalient', () => {
  it('is true when a beliefSalience axis has a TOWARDS-strength score (> 0.2)', () => {
    const inflation = STRESS_SCENARIOS.find((s) => s.id === 'RATE_INFLATION_SHOCK')!;
    expect(isSalient(inflation, { axisScores: { INFLATION_HEDGE_TILT: 0.8 } })).toBe(true);
  });
  it('is false when the axis score is below the 0.2 threshold', () => {
    const inflation = STRESS_SCENARIOS.find((s) => s.id === 'RATE_INFLATION_SHOCK')!;
    expect(isSalient(inflation, { axisScores: { INFLATION_HEDGE_TILT: 0.1 } })).toBe(false);
  });
});

describe('orderBySalience', () => {
  it('surfaces the belief-relevant scenario first without dropping any', () => {
    const ordered = orderBySalience(results, STRESS_SCENARIOS, { axisScores: { INFLATION_HEDGE_TILT: 0.9 } });
    expect(ordered[0].scenarioId).toBe('RATE_INFLATION_SHOCK');
    expect(ordered.length).toBe(results.length);
    expect(new Set(ordered.map((r) => r.scenarioId)).size).toBe(results.length);
  });
  it('preserves original order when no concern is salient', () => {
    const ordered = orderBySalience(results, STRESS_SCENARIOS, { axisScores: {} });
    expect(ordered.map((r) => r.scenarioId)).toEqual(results.map((r) => r.scenarioId));
  });
});
