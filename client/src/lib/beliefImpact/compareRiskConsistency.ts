import type { BeliefResponse } from '../../state/onboardingV2Store';

export type RiskConsistencyVerdict =
  | 'CONSISTENT'
  | 'MORE_CAUTIOUS'
  | 'MORE_RISK_TOLERANT'
  | 'INSUFFICIENT_DATA';

export interface RiskConsistencyResult {
  verdict: RiskConsistencyVerdict;
  note: string;
}

// Same midpoints as personaEngine.ts's computeRiskAppetite riskMap, rescaled from [0,1] to
// [-1,+1] to match BeliefResponse.normalised's scale.
const RISK_COMFORT_SCALE: Record<string, number> = {
  very_low: -0.8,
  low: -0.5,
  moderate: 0,
  medium: 0,
  high: 0.5,
  very_high: 0.8,
};

const MISMATCH_THRESHOLD = 0.4;

export function compareRiskConsistency(
  riskComfort: string,
  volatilityResponse: BeliefResponse | undefined,
): RiskConsistencyResult {
  const riskScaled = RISK_COMFORT_SCALE[(riskComfort || '').toLowerCase()];
  if (riskScaled === undefined || !volatilityResponse) {
    return { verdict: 'INSUFFICIENT_DATA', note: '' };
  }

  const gap = riskScaled - volatilityResponse.normalised;

  if (gap > MISMATCH_THRESHOLD) {
    return {
      verdict: 'MORE_CAUTIOUS',
      note: 'Your answer here reads as more cautious than your Step 3 risk answer — both are noted; neither overrides the other.',
    };
  }

  if (gap < -MISMATCH_THRESHOLD) {
    return {
      verdict: 'MORE_RISK_TOLERANT',
      note: 'Your answer here reads as more risk-tolerant than your Step 3 risk answer — both are noted; neither overrides the other.',
    };
  }

  return {
    verdict: 'CONSISTENT',
    note: 'Your answer here reads as consistent with your Step 3 risk answer.',
  };
}
