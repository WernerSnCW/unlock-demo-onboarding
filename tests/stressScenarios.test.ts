import { describe, it, expect } from 'vitest';
import { STRESS_SCENARIOS, type StressScenario } from '../client/src/data/stressScenarios';

const VALID_AXES = [
  'QUALITY_TILT','VALUE_TILT','TECH_TILT','UK_BIAS','ESG_TILT',
  'INFLATION_HEDGE_TILT','SMALL_CAP_TILT','VOLATILITY_AVERSION',
];
const BANNED_VERBS = ['should','must','buy','sell','optimise','optimize','improve','save'];

describe('STRESS_SCENARIOS library', () => {
  it('has at least 4 scenarios with unique ids', () => {
    expect(STRESS_SCENARIOS.length).toBeGreaterThanOrEqual(4);
    const ids = STRESS_SCENARIOS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every scenario is structurally complete and compliance-safe', () => {
    STRESS_SCENARIOS.forEach((s: StressScenario) => {
      expect(s.name.length).toBeGreaterThan(0);
      expect(s.blurb.length).toBeGreaterThan(0);
      expect(s.historicalAnchor.length).toBeGreaterThan(0);
      expect(s.severityRange.mildMultiplier).toBeLessThan(s.severityRange.severeMultiplier);
      const text = `${s.name} ${s.blurb}`.toLowerCase();
      BANNED_VERBS.forEach((v) => expect(new RegExp(`\\b${v}\\b`).test(text)).toBe(false));
      s.beliefSalience.forEach((axis) => expect(VALID_AXES).toContain(axis));
    });
  });

  it('every shock value is a signed decimal in [-1, 1]', () => {
    STRESS_SCENARIOS.forEach((s) => {
      Object.values(s.shocks).forEach((byRegion) =>
        Object.values(byRegion).forEach((v) => {
          expect(v).toBeGreaterThanOrEqual(-1);
          expect(v).toBeLessThanOrEqual(1);
        }),
      );
      Object.values(s.defaultShockByAssetClass).forEach((v) => {
        expect(v).toBeGreaterThanOrEqual(-1);
        expect(v).toBeLessThanOrEqual(1);
      });
    });
  });
});
