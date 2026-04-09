import type { Policy } from './policyDefaults';
import { POLICY_DEFAULTS } from './policyDefaults';

export type SafetyStatus = 'GREEN' | 'AMBER' | 'RED';
export type OverallStatusCode = 'ALL_CLEAR' | 'CAUTION' | 'ACTION_REQUIRED';

export interface Intake {
  cash: number;
  spend: number;
  largest_line_pct: number;
  illiquid_pct: number;
}

export interface SafetyLightsMetrics {
  cash_runway_months: number;
  largest_line_pct: number;
  illiquid_pct: number;
}

export interface SafetyLightsResult {
  liquidity: SafetyStatus;
  concentration: SafetyStatus;
  illiquids: SafetyStatus;
  overall_status: SafetyStatus;
  overall_status_code: OverallStatusCode;
  overall_status_label: string;
  overall_status_message: string;
  tilts_allowed: boolean;
  metrics: SafetyLightsMetrics;
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
  const pol = policy || POLICY_DEFAULTS;
  const { projection, collectibles } = pol;

  const monthlySpend = intake.spend / 12;
  let cashRunwayMonths: number;

  if (monthlySpend <= 0) {
    cashRunwayMonths = Number.MAX_SAFE_INTEGER;
  } else {
    cashRunwayMonths = intake.cash / monthlySpend;
  }

  const minCashMonths = projection.min_cash_months;
  const amberThreshold = minCashMonths * projection.cash_amber_multiple;

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

  let illiquids: SafetyStatus;
  if (intake.illiquid_pct > maxIlliquid) {
    illiquids = 'RED';
  } else if (intake.illiquid_pct > illiquidsAmberThreshold) {
    illiquids = 'AMBER';
  } else {
    illiquids = 'GREEN';
  }

  const overall_status = getWorstStatus([liquidity, concentration, illiquids]);
  const tilts_allowed = overall_status !== 'RED';

  let overall_status_code: OverallStatusCode;
  let overall_status_label: string;
  let overall_status_message: string;

  if (overall_status === 'RED') {
    overall_status_code = 'ACTION_REQUIRED';
    overall_status_label = 'Action required: red flags present';
    overall_status_message = 'One or more Safety Lights are red. We will not recommend risk-increasing moves until these issues are addressed.';
  } else if (overall_status === 'AMBER') {
    overall_status_code = 'CAUTION';
    overall_status_label = 'Caution: amber flags present';
    overall_status_message = 'One or more Safety Lights are amber. We recommend addressing these areas before significantly increasing risk.';
  } else {
    overall_status_code = 'ALL_CLEAR';
    overall_status_label = 'Within guardrails';
    overall_status_message = "All Safety Lights are green. Your portfolio is currently within Unlock's guardrails for liquidity, concentration and illiquid exposure.";
  }

  const cashRunwayRounded = cashRunwayMonths === Number.MAX_SAFE_INTEGER ? -1 : Math.round(cashRunwayMonths * 10) / 10;

  return {
    liquidity,
    concentration,
    illiquids,
    overall_status,
    overall_status_code,
    overall_status_label,
    overall_status_message,
    tilts_allowed,
    metrics: {
      cash_runway_months: cashRunwayRounded,
      largest_line_pct: intake.largest_line_pct,
      illiquid_pct: intake.illiquid_pct,
    },
    details: {
      cash_runway_months: cashRunwayRounded,
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
