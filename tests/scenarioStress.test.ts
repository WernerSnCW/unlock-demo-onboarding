import { describe, it, expect } from 'vitest';
import { computeScenarioStress, shockFor, type StressHolding } from '../client/src/lib/scenarioStress';
import type { StressScenario } from '../client/src/data/stressScenarios';

const SCN: StressScenario = {
  id: 'TEST',
  name: 'Test',
  blurb: 'test',
  historicalAnchor: 'test',
  shocks: { equity: { global: -0.25, us: -0.40 }, bond: { global: 0.05 } },
  defaultShockByAssetClass: { equity: -0.20, bond: 0.0, cash: 0.0 },
  severityRange: { mildMultiplier: 0.7, severeMultiplier: 1.4 },
  beliefSalience: [],
};

function holding(over: Partial<StressHolding>): StressHolding {
  return { instrument_name: 'X', asset_class: 'equity', region: 'global', value_gbp: 100000, ...over };
}

describe('shockFor', () => {
  it('matches asset_class + region (case-insensitive)', () => {
    expect(shockFor(SCN, 'Equity', 'US')).toBe(-0.40);
  });
  it('falls back to defaultShockByAssetClass when region is absent', () => {
    expect(shockFor(SCN, 'equity', 'mars')).toBe(-0.20);
  });
  it('returns 0 when asset_class is unmapped and has no default', () => {
    expect(shockFor(SCN, 'collectibles', 'uk')).toBe(0);
  });
});

describe('computeScenarioStress', () => {
  it('returns zero impact and no NaN for empty holdings', () => {
    const [r] = computeScenarioStress([], [SCN]);
    expect(r.centralImpactGbp).toBe(0);
    expect(r.centralImpactPct).toBe(0);
    expect(Number.isNaN(r.centralImpactPct)).toBe(false);
    expect(r.topContributors).toEqual([]);
  });

  it('applies the matched shock to a single holding', () => {
    const [r] = computeScenarioStress([holding({ value_gbp: 100000 })], [SCN]);
    expect(r.centralImpactGbp).toBe(-25000);
    expect(r.centralImpactPct).toBeCloseTo(-0.25, 10);
  });

  it('value-weights across buckets (golden)', () => {
    const holdings = [
      holding({ instrument_name: 'A', asset_class: 'equity', region: 'us', value_gbp: 50000 }),
      holding({ instrument_name: 'B', asset_class: 'equity', region: 'global', value_gbp: 30000 }),
      holding({ instrument_name: 'C', asset_class: 'bond', region: 'global', value_gbp: 20000 }),
    ];
    const [r] = computeScenarioStress(holdings, [SCN]);
    expect(r.centralImpactGbp).toBe(-26500);
    expect(r.centralImpactPct).toBeCloseTo(-0.265, 10);
  });

  it('derives a transparent range from the multipliers', () => {
    const [r] = computeScenarioStress([holding({ value_gbp: 100000 })], [SCN]);
    expect(r.rangePct.mild).toBeCloseTo(-0.175, 10);
    expect(r.rangePct.severe).toBeCloseTo(-0.35, 10);
  });

  it('ranks top contributors by absolute GBP impact, top 3', () => {
    const holdings = [
      holding({ instrument_name: 'big', asset_class: 'equity', region: 'us', value_gbp: 50000 }),
      holding({ instrument_name: 'mid', asset_class: 'equity', region: 'global', value_gbp: 30000 }),
      holding({ instrument_name: 'small', asset_class: 'equity', region: 'global', value_gbp: 1000 }),
      holding({ instrument_name: 'flat', asset_class: 'cash', region: 'uk', value_gbp: 9000 }),
    ];
    const [r] = computeScenarioStress(holdings, [SCN]);
    expect(r.topContributors.map((c) => c.label)).toEqual(['big', 'mid', 'small']);
    expect(r.topContributors[0].pctOfLoss).toBeGreaterThan(r.topContributors[1].pctOfLoss);
  });

  it('ignores non-positive holdings', () => {
    const [r] = computeScenarioStress([holding({ value_gbp: 0 }), holding({ value_gbp: -5 })], [SCN]);
    expect(r.centralImpactGbp).toBe(0);
  });

  it('excludes protective (opposite-sign) holdings from contributors', () => {
    const holdings = [
      holding({ instrument_name: 'eq', asset_class: 'equity', region: 'global', value_gbp: 100000 }), // -0.25 -> -25000
      holding({ instrument_name: 'bond', asset_class: 'bond', region: 'global', value_gbp: 100000 }), // +0.05 -> +5000 (protective)
    ];
    const [r] = computeScenarioStress(holdings, [SCN]);
    expect(r.centralImpactGbp).toBe(-20000);
    expect(r.topContributors.map((c) => c.label)).toEqual(['eq']);     // bond excluded
    expect(r.topContributors[0].pctOfLoss).toBeCloseTo(1, 10);          // 100% of the same-direction move
  });
});
