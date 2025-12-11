import { Policy, getPolicy, applyPolicyOverrides } from './policy';

export type SafetyStatus = 'GREEN' | 'AMBER' | 'RED';

export interface Intake {
  cash: number;
  spend: number;
  largest_line_pct: number;
  illiquid_pct: number;
}

export interface SafetyLightsResult {
  liquidity: SafetyStatus;
  concentration: SafetyStatus;
  illiquids: SafetyStatus;
  overall_status: SafetyStatus;
  tilts_allowed: boolean;
  details: {
    cash_runway_months: number;
    liquidity_thresholds: {
      red_below: number;
      amber_below: number;
    };
    concentration_thresholds: {
      amber_above: number;
      red_above: number;
    };
    illiquids_thresholds: {
      amber_above: number;
      red_above: number;
    };
  };
}

function getWorstStatus(statuses: SafetyStatus[]): SafetyStatus {
  if (statuses.includes('RED')) return 'RED';
  if (statuses.includes('AMBER')) return 'AMBER';
  return 'GREEN';
}

export function computeSafetyLights(intake: Intake, policy?: Policy): SafetyLightsResult {
  const pol = policy || getPolicy();
  const { projection, collectibles } = pol;

  // Cash runway rule: intake.spend is ANNUAL spend in GBP
  // We convert to monthly spend to calculate runway in months
  // Example: £60,000/year = £5,000/month, £10,000 cash = 2 months runway
  const monthlySpend = intake.spend / 12;
  let cashRunwayMonths: number;
  
  if (monthlySpend <= 0) {
    // Handle zero/negative spend: treat as infinite runway
    cashRunwayMonths = Number.MAX_SAFE_INTEGER;
  } else {
    cashRunwayMonths = intake.cash / monthlySpend;
  }

  const minCashMonths = projection.min_cash_months;
  const amberThreshold = minCashMonths * projection.cash_amber_multiple;

  // Liquidity classification:
  // RED: runway < min_cash_months (e.g., < 6 months)
  // AMBER: min_cash_months <= runway < amber_threshold (e.g., 6-9 months)
  // GREEN: runway >= amber_threshold (e.g., >= 9 months)
  let liquidity: SafetyStatus;
  if (cashRunwayMonths < minCashMonths) {
    liquidity = 'RED';
  } else if (cashRunwayMonths < amberThreshold) {
    liquidity = 'AMBER';
  } else {
    liquidity = 'GREEN';
  }

  const maxSingleName = projection.max_single_name_pct;
  const concentrationAmberThreshold = maxSingleName * projection.concentration_amber_fraction;

  // Concentration classification:
  // RED: largest holding > max_single_name_pct (e.g., > 20%)
  // AMBER: concentration_amber_threshold < holding <= max (e.g., 15-20%)
  // GREEN: holding <= amber_threshold (e.g., <= 15%)
  let concentration: SafetyStatus;
  if (intake.largest_line_pct > maxSingleName) {
    concentration = 'RED';
  } else if (intake.largest_line_pct > concentrationAmberThreshold) {
    concentration = 'AMBER';
  } else {
    concentration = 'GREEN';
  }

  const maxIlliquid = collectibles.max_weight_pct;
  const illiquidsAmberThreshold = maxIlliquid * collectibles.amber_fraction;

  // Illiquids classification:
  // RED: illiquid_pct > max_weight_pct (e.g., > 10%)
  // AMBER: amber_threshold < illiquid_pct <= max (e.g., 7-10%)
  // GREEN: illiquid_pct <= amber_threshold (e.g., <= 7%)
  let illiquids: SafetyStatus;
  if (intake.illiquid_pct > maxIlliquid) {
    illiquids = 'RED';
  } else if (intake.illiquid_pct > illiquidsAmberThreshold) {
    illiquids = 'AMBER';
  } else {
    illiquids = 'GREEN';
  }

  const overall_status = getWorstStatus([liquidity, concentration, illiquids]);
  // "Any Red ⇒ tilts disabled" rule
  const tilts_allowed = overall_status !== 'RED';

  return {
    liquidity,
    concentration,
    illiquids,
    overall_status,
    tilts_allowed,
    details: {
      cash_runway_months: cashRunwayMonths === Number.MAX_SAFE_INTEGER ? -1 : Math.round(cashRunwayMonths * 10) / 10,
      liquidity_thresholds: {
        red_below: minCashMonths,
        amber_below: amberThreshold,
      },
      concentration_thresholds: {
        amber_above: concentrationAmberThreshold,
        red_above: maxSingleName,
      },
      illiquids_thresholds: {
        amber_above: illiquidsAmberThreshold,
        red_above: maxIlliquid,
      },
    },
  };
}

export interface OnboardingAnalysisResult {
  safety_lights: SafetyLightsResult;
  persona: {
    id: string | null;
    name: string | null;
  };
}

export function analyzeOnboarding(intake: Intake, policyOverrides?: Partial<Policy>): OnboardingAnalysisResult {
  let policy = getPolicy();
  
  if (policyOverrides) {
    policy = applyPolicyOverrides(policy, policyOverrides);
  }

  const safetyLights = computeSafetyLights(intake, policy);

  return {
    safety_lights: safetyLights,
    persona: {
      id: null,
      name: null,
    },
  };
}
