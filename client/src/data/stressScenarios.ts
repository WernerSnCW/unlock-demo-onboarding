import type { AxisCode } from '../state/onboardingV2Store';

/**
 * Deterministic stress-scenario library for the Onboarding-v2 stress lens.
 * Shocks are ILLUSTRATIVE, loosely anchored to historical episodes, and labelled
 * as such on screen. Keys use v2's own taxonomy: asset_class and region are the
 * lowercase string values stored on Holding (e.g. 'equity', 'global').
 * Historical calibration of these numbers is a separate, non-blocking research task.
 */
export interface StressScenario {
  id: string;
  name: string;
  blurb: string;
  historicalAnchor: string;
  /** shocks[asset_class][region] -> signed decimal move, e.g. -0.25 = -25% */
  shocks: Record<string, Record<string, number>>;
  /** fallback when a holding's region is not in `shocks[asset_class]` */
  defaultShockByAssetClass: Record<string, number>;
  /** multipliers applied to the central impact to express a transparent range */
  severityRange: { mildMultiplier: number; severeMultiplier: number };
  /** belief axes whose stated concern surfaces this scenario first (salience only) */
  beliefSalience: AxisCode[];
}

const RANGE = { mildMultiplier: 0.7, severeMultiplier: 1.4 };

export const STRESS_SCENARIOS: StressScenario[] = [
  {
    id: 'EQUITY_DRAWDOWN',
    name: 'Global equity drawdown',
    blurb: 'A broad fall in global share prices, with riskier regions falling furthest and high-quality bonds holding up.',
    historicalAnchor: 'Illustrative - scale of the 2008 and 2020 equity selloffs',
    shocks: {
      equity: { global: -0.30, us: -0.32, uk: -0.28, europe: -0.30, emerging: -0.38, other: -0.30 },
      bond: { global: 0.02, uk: 0.02 },
      property: { uk: -0.10, global: -0.10 },
      alternatives: { global: -0.15 },
    },
    defaultShockByAssetClass: { equity: -0.30, bond: 0.0, property: -0.10, alternatives: -0.15, cash: 0.0, other: -0.10 },
    severityRange: RANGE,
    beliefSalience: ['VOLATILITY_AVERSION'],
  },
  {
    id: 'RATE_INFLATION_SHOCK',
    name: 'Rates & inflation shock',
    blurb: 'A jump in interest rates and inflation that weighs on both shares and bonds at the same time.',
    historicalAnchor: 'Illustrative - scale of the 2022 rate/inflation repricing',
    shocks: {
      equity: { global: -0.15, us: -0.16, uk: -0.12, europe: -0.15, emerging: -0.18, other: -0.15 },
      bond: { global: -0.15, uk: -0.15 },
      property: { uk: -0.12, global: -0.12 },
      alternatives: { global: -0.05 },
    },
    defaultShockByAssetClass: { equity: -0.15, bond: -0.15, property: -0.12, alternatives: -0.05, cash: 0.0, other: -0.08 },
    severityRange: RANGE,
    beliefSalience: ['INFLATION_HEDGE_TILT'],
  },
  {
    id: 'TECH_CORRECTION',
    name: 'Technology correction',
    blurb: 'A sharp repricing of technology and growth shares, felt most in US-heavy and tech-tilted portfolios.',
    historicalAnchor: 'Illustrative - scale of the 2000 and 2022 tech corrections',
    shocks: {
      equity: { us: -0.25, global: -0.18, uk: -0.08, europe: -0.12, emerging: -0.20, other: -0.18 },
      alternatives: { global: -0.10 },
      property: { uk: -0.05, global: -0.05 },
    },
    defaultShockByAssetClass: { equity: -0.18, bond: 0.0, property: -0.05, alternatives: -0.10, cash: 0.0, other: -0.08 },
    severityRange: RANGE,
    beliefSalience: ['TECH_TILT'],
  },
  {
    id: 'PROPERTY_DOWNTURN',
    name: 'Property downturn',
    blurb: 'A fall in property values, concentrated in UK residential and commercial holdings.',
    historicalAnchor: 'Illustrative - scale of the early-1990s and 2008 UK property falls',
    shocks: {
      property: { uk: -0.25, global: -0.18, other: -0.20 },
      equity: { uk: -0.08, global: -0.06 },
      alternatives: { global: -0.08 },
    },
    defaultShockByAssetClass: { property: -0.22, equity: -0.06, bond: 0.0, alternatives: -0.08, cash: 0.0, other: -0.10 },
    severityRange: RANGE,
    beliefSalience: [],
  },
];
