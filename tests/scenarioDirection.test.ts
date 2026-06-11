/**
 * D2: canonical scenario system — declared fears map to matching downside
 * scenarios.
 *
 * Review finding D2 (2026-06-11, Critical): the wizard mapped belief fear
 * keys to S-coded shock templates with INVERTED signs — "recession" → S002
 * (equity +12%), "tech_correction" → S006 (tech +20%). Tom's decision
 * (2026-06-11): the correct-direction system wins. That system is
 * server/data/scenarios.ts + LEGACY_SCENARIO_IDS, consumed by
 * /api/scenario-impact. These tests pin its direction integrity, and pin
 * that legacy belief keys no longer reach the S-coded simulation shocks.
 */
import { describe, it, expect } from 'vitest';
import { scenarios, LEGACY_SCENARIO_IDS } from '../server/data/scenarios';
import { simulateV2 } from '../server/lib/simulate/engine_v2';

describe('D2: canonical belief→scenario mapping is correct-direction', () => {
  it('every legacy belief key maps to an existing canonical scenario', () => {
    for (const [legacyKey, scenarioName] of Object.entries(LEGACY_SCENARIO_IDS)) {
      expect(scenarios[scenarioName], `${legacyKey} → ${scenarioName}`).toBeDefined();
      expect(scenarios[scenarioName].mu).toBeDefined();
    }
  });

  it('a declared fear maps to a scenario that moves the feared asset DOWN', () => {
    const mu = (legacyKey: string) => scenarios[LEGACY_SCENARIO_IDS[legacyKey]].mu;

    // The headline case from the review: tech-correction fear must map to a
    // tech-DOWNSIDE scenario (the inverted system sent it to +20% tech).
    expect(mu('tech_correction').GROWTH_TECH).toBeLessThan(0);
    expect(mu('tech_correction').CRYPTO_BTC).toBeLessThan(0);

    expect(mu('recession').GLOBAL_EQUITY).toBeLessThan(0);
    expect(mu('property_down').PROPERTY_UK_RESI).toBeLessThan(0);
    expect(mu('gilt_selloff').GILTS_LONG).toBeLessThan(0);

    // Stagflation: bonds and equities fall together, real assets rise.
    expect(mu('stagflation').GILTS_LONG).toBeLessThan(0);
    expect(mu('stagflation').GLOBAL_EQUITY).toBeLessThan(0);
    expect(mu('stagflation').COMMODITIES).toBeGreaterThan(0);

    // Energy spike: commodities up, equities down.
    expect(mu('energy_spike').COMMODITIES).toBeGreaterThan(0);
    expect(mu('energy_spike').GLOBAL_EQUITY).toBeLessThan(0);

    // Sterling devaluation: gold up, UK assets down.
    expect(mu('devaluation').GOLD).toBeGreaterThan(0);
    expect(mu('devaluation').UK_EQUITY_VALUE).toBeLessThan(0);

    // Reflation is the one upside scenario in the set.
    expect(mu('reflation').GLOBAL_EQUITY).toBeGreaterThan(0);
  });

  it('legacy belief keys no longer reach the S-coded simulation shocks (belief-neutral, not inverted)', () => {
    // The wizard used to remap "recession"→S002 / "tech_correction"→S006,
    // tilting the simulation TOWARDS the feared outcome's opposite. With the
    // mapping deleted, legacy keys are unknown to the S-coded engine and the
    // simulation runs belief-neutral: identical to empty weights.
    const base = {
      currentMix: { GLOBAL_EQUITY: 0.6, CASH: 0.4 },
      targetMix: { GLOBAL_EQUITY: 0.4, GILTS_LONG: 0.3, CASH: 0.3 },
      horizonMonths: 12,
    };

    const withLegacyKeys = simulateV2({ ...base, scenarioWeights: { recession: 0.6, tech_correction: 0.4 } });
    const withEmpty = simulateV2({ ...base, scenarioWeights: {} });

    expect(withLegacyKeys.expectedReturnCurrent).toBeCloseTo(withEmpty.expectedReturnCurrent, 10);
    expect(withLegacyKeys.expectedReturnTarget).toBeCloseTo(withEmpty.expectedReturnTarget, 10);
    expect(withLegacyKeys.fan[withLegacyKeys.fan.length - 1].current.p50)
      .toBeCloseTo(withEmpty.fan[withEmpty.fan.length - 1].current.p50, 10);
  });

  it('documents the inversion the deleted mapping caused (engine fixture, consume-only)', () => {
    // Under the old mapping a user fearing a tech correction was tilted to
    // S006, whose 12m shock vector is GROWTH_TECH +20%: an all-tech portfolio
    // gained from the feared crash. The parity-locked engine is unchanged —
    // this pins WHY the mapping had to go, so it cannot quietly come back.
    const allTech = {
      currentMix: { GROWTH_TECH: 1 },
      targetMix: { GROWTH_TECH: 1 },
      horizonMonths: 12,
    };
    const inverted = simulateV2({ ...allTech, scenarioWeights: { S006: 1 } });
    expect(inverted.expectedReturnCurrent).toBeGreaterThan(0); // "Tech Crash" label, bullish maths

    const canonicalTechBurst = scenarios[LEGACY_SCENARIO_IDS['tech_correction']];
    expect(canonicalTechBurst.mu.GROWTH_TECH).toBeLessThan(0); // canonical system: downside
  });
});
