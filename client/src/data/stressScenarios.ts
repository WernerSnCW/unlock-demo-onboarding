import type { AxisCode } from '../state/onboardingV2Store';

/**
 * Deterministic stress-scenario library for the Onboarding-v2 stress lens.
 * Shocks are ILLUSTRATIVE but historically calibrated to real episodes
 * (dot-com 2000-02, GFC 2007-09, COVID 2020, the 2022 rate/inflation repricing),
 * and labelled as such on screen. Each scenario's `historicalAnchor` cites the basis.
 * Keys use v2's own taxonomy: asset_class and region are the lowercase string
 * values stored on Holding (e.g. 'equity', 'global'). The central shock reflects a
 * serious-but-representative episode; the severeMultiplier reaches toward the deepest
 * historical figure for that bucket. No probabilities, no forecasts.
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
    historicalAnchor: 'Illustrative — calibrated to MSCI World −34% (Feb–Mar 2020) and −54% peak-to-trough (2007–09); severe end ≈ GFC',
    shocks: {
      equity: { global: -0.34, us: -0.36, uk: -0.32, europe: -0.36, emerging: -0.40, other: -0.34 },
      bond: { global: 0.04, uk: 0.05, us: 0.05 },
      property: { uk: -0.12, global: -0.15 },
      alternatives: { global: -0.15 },
    },
    defaultShockByAssetClass: { equity: -0.34, bond: 0.03, property: -0.14, alternatives: -0.15, cash: 0.0, other: -0.12 },
    severityRange: RANGE,
    beliefSalience: ['VOLATILITY_AVERSION'],
  },
  {
    id: 'RATE_INFLATION_SHOCK',
    name: 'Rates & inflation shock',
    blurb: 'A jump in interest rates and inflation that weighs on both shares and bonds at the same time.',
    historicalAnchor: 'Illustrative — calibrated to 2022: Bloomberg Global Aggregate −16%, UK gilts −20%, world equities −18%, UK large-cap ~flat',
    shocks: {
      equity: { global: -0.18, us: -0.20, uk: -0.02, europe: -0.15, emerging: -0.20, other: -0.18 },
      bond: { global: -0.16, uk: -0.20, us: -0.13 },
      property: { uk: -0.20, global: -0.24 },
      alternatives: { global: -0.02 },
    },
    defaultShockByAssetClass: { equity: -0.18, bond: -0.16, property: -0.22, alternatives: -0.02, cash: 0.0, other: -0.10 },
    severityRange: RANGE,
    beliefSalience: ['INFLATION_HEDGE_TILT'],
  },
  {
    id: 'TECH_CORRECTION',
    name: 'Technology correction',
    blurb: 'A sharp repricing of technology and growth shares, felt most in US-heavy and tech-tilted portfolios.',
    historicalAnchor: 'Illustrative — calibrated to Nasdaq Composite −33% (2022); the −78% peak-to-trough (2000–02) was concentrated tech, so the broad US bucket here is less severe; US/growth-tilted',
    shocks: {
      equity: { us: -0.30, global: -0.20, uk: -0.08, europe: -0.14, emerging: -0.24, other: -0.18 },
      alternatives: { global: -0.10 },
      property: { uk: -0.05, global: -0.05 },
    },
    defaultShockByAssetClass: { equity: -0.20, bond: 0.0, property: -0.05, alternatives: -0.10, cash: 0.0, other: -0.10 },
    severityRange: RANGE,
    beliefSalience: ['TECH_TILT'],
  },
  {
    id: 'PROPERTY_DOWNTURN',
    name: 'Property downturn',
    blurb: 'A fall in property values, concentrated in UK residential and commercial holdings.',
    historicalAnchor: 'Illustrative — calibrated to UK commercial property −44% peak-to-trough (2007–09, MSCI/IPD) and UK house prices −19% (2007–09), −20% (early-1990s)',
    shocks: {
      property: { uk: -0.28, global: -0.22, other: -0.25 },
      equity: { uk: -0.10, global: -0.08 },
      alternatives: { global: -0.08 },
    },
    defaultShockByAssetClass: { property: -0.26, equity: -0.08, bond: 0.0, alternatives: -0.08, cash: 0.0, other: -0.12 },
    severityRange: RANGE,
    beliefSalience: [],
  },
];
