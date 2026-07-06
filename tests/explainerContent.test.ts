import { describe, it, expect } from 'vitest';
import { getExplainerData } from '../server/content/explainerContent';
import { getPolicy } from '../server/services/policy';
import { PERSONA_WEIGHT_TABLE } from '../server/services/personaEngine';

describe('getExplainerData', () => {
  it('mirrors the live Safety Lights thresholds — never a hand-copied number', () => {
    const policy = getPolicy();
    const data = getExplainerData();
    expect(data.safetyLights.liquidity.redBelowMonths).toBe(policy.projection.min_cash_months);
    expect(data.safetyLights.liquidity.amberBelowMonths).toBe(
      policy.projection.min_cash_months * policy.projection.cash_amber_multiple,
    );
    expect(data.safetyLights.concentration.redAboveFraction).toBe(policy.projection.max_single_name_pct);
    expect(data.safetyLights.concentration.amberAboveFraction).toBe(
      policy.projection.max_single_name_pct * policy.projection.concentration_amber_fraction,
    );
    expect(data.safetyLights.illiquids.redAboveFraction).toBe(policy.collectibles.max_weight_pct);
    expect(data.safetyLights.illiquids.amberAboveFraction).toBe(
      policy.collectibles.max_weight_pct * policy.collectibles.amber_fraction,
    );
  });

  it('mirrors the live persona weight table exactly', () => {
    const data = getExplainerData();
    expect(data.personaWeights).toEqual(PERSONA_WEIGHT_TABLE);
  });
});
