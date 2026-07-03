import { getPolicy } from '../services/policy';
import { PERSONA_WEIGHT_TABLE } from '../services/personaEngine';

export interface ExplainerData {
  safetyLights: {
    liquidity: { redBelowMonths: number; amberBelowMonths: number };
    concentration: { redAboveFraction: number; amberAboveFraction: number };
    illiquids: { redAboveFraction: number; amberAboveFraction: number };
  };
  personaWeights: typeof PERSONA_WEIGHT_TABLE;
}

/**
 * Every number here is re-derived from the live policy/persona-engine config,
 * never hand-typed — this is what keeps the methodology explainer from
 * drifting out of sync with the actual product logic. See
 * explainerContent.test.ts for the assertions that enforce this.
 */
export function getExplainerData(): ExplainerData {
  const policy = getPolicy();
  return {
    safetyLights: {
      liquidity: {
        redBelowMonths: policy.projection.min_cash_months,
        amberBelowMonths: policy.projection.min_cash_months * policy.projection.cash_amber_multiple,
      },
      concentration: {
        redAboveFraction: policy.projection.max_single_name_pct,
        amberAboveFraction: policy.projection.max_single_name_pct * policy.projection.concentration_amber_fraction,
      },
      illiquids: {
        redAboveFraction: policy.collectibles.max_weight_pct,
        amberAboveFraction: policy.collectibles.max_weight_pct * policy.collectibles.amber_fraction,
      },
    },
    personaWeights: PERSONA_WEIGHT_TABLE,
  };
}
