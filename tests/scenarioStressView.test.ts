import { describe, it, expect } from 'vitest';
import { buildStressNarrative } from '../client/src/lib/scenarioStressView';
import { STRESS_SCENARIOS } from '../client/src/data/stressScenarios';
import type { ScenarioStressResult } from '../client/src/lib/scenarioStress';

const BANNED_VERBS = ['should','must','buy','sell','optimise','optimize','improve','save'];
const result: ScenarioStressResult = {
  scenarioId: 'EQUITY_DRAWDOWN',
  centralImpactGbp: -180000,
  centralImpactPct: -0.18,
  rangeGbp: { mild: -126000, severe: -252000 },
  rangePct: { mild: -0.126, severe: -0.252 },
  topContributors: [{ label: 'Tech Fund', impactGbp: -120000, pctOfLoss: 0.667 }],
};
const scenario = STRESS_SCENARIOS.find((s) => s.id === 'EQUITY_DRAWDOWN')!;

describe('buildStressNarrative', () => {
  it('renders a signed, conditional, illustrative headline with the range', () => {
    const n = buildStressNarrative(result, scenario);
    expect(n.headline).toContain('18%');
    expect(n.headline).toContain('13%');
    expect(n.headline).toContain('25%');
    expect(n.title).toBe(scenario.name);
    expect(n.anchor).toContain('Illustrative');
  });
  it('lists top contributors with their share of the move', () => {
    const n = buildStressNarrative(result, scenario);
    expect(n.contributors[0]).toContain('Tech Fund');
    expect(n.contributors[0]).toContain('67%');
  });
  it('contains no advice verbs anywhere', () => {
    const n = buildStressNarrative(result, scenario);
    const text = `${n.title} ${n.blurb} ${n.headline} ${n.contributors.join(' ')}`.toLowerCase();
    BANNED_VERBS.forEach((v) => expect(new RegExp(`\\b${v}\\b`).test(text)).toBe(false));
  });
});
