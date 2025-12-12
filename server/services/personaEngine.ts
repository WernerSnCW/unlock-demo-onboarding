/**
 * Persona Engine Module
 * 
 * Computes investor personas based on intake data, holdings summary, and safety lights.
 * Uses a config-driven approach with 8 persona families and trait-based scoring.
 */

// ============================================
// Type Definitions
// ============================================

export type AgeBand = '25_34' | '35_44' | '45_54' | '55_64' | '65_plus' | null;
export type PortfolioStage = 'ACCUMULATING' | 'STARTING_DRAWDOWN' | 'PRIMARILY_DRAWDOWN' | null;
export type InvestingFocus = 'FUNDS_ETFS' | 'INDIVIDUAL_SHARES' | 'PROPERTY_BTL' | 'PRIVATE_BUSINESS' | 'CRYPTO' | 'OTHER';
export type AdviserUsage = 'SELF_DIRECTED' | 'SOMETIMES_ADVISED' | 'FULL_SERVICE_ADVISER' | 'I_AM_AN_ADVISER' | null;
export type SafetyStatus = 'GREEN' | 'AMBER' | 'RED';

export interface PersonaCues {
  age_band: AgeBand;
  portfolio_stage: PortfolioStage;
  investing_focus: InvestingFocus[];
  has_defined_benefit_pension: boolean | null;
  owns_business: boolean | null;
  has_employer_stock: boolean | null;
  has_meaningful_crypto: boolean | null;
  adviser_usage: AdviserUsage;
  is_cross_border: boolean | null;
}

export interface AssetClassBreakdown {
  equity_pct: number;
  bond_pct: number;
  property_pct: number;
  cash_pct: number;
  alts_pct: number;
  crypto_pct: number;
}

export interface InvestorProfile {
  // From Intake
  age_band: AgeBand;
  portfolio_stage: PortfolioStage;
  primary_goal: string;
  time_horizon: string;
  risk_comfort: string;
  personaCues: PersonaCues;

  // From Holdings Summary
  total_portfolio_value_gbp: number;
  cash_runway_months: number;
  largest_line_pct: number;
  illiquid_pct: number;
  asset_class_breakdown: AssetClassBreakdown;

  // From Safety Lights
  liquidity_status: SafetyStatus;
  concentration_status: SafetyStatus;
  illiquids_status: SafetyStatus;
}

export interface PersonaTraits {
  risk: number;
  property_bias: number;
  alts_bias: number;
  liquidity_comfort: number;
  tax_complexity: number;
  cross_border_complexity: number;
}

export interface PersonaResult {
  code: string;
  label: string;
  one_liner: string;
  plan_focus_bullets: string[];
  risks_bullets: string[];
  traits: PersonaTraits;
  why_fits_bullets: string[];
}

interface TraitWeights {
  risk: number;
  property_bias: number;
  alts_bias: number;
  liquidity_comfort: number;
  tax_complexity: number;
  cross_border_complexity: number;
  drawdown_focus: number;
  wealth_level: number;
  concentration: number;
}

interface PersonaFamily {
  code: string;
  label: string;
  one_liner: string;
  plan_focus_bullets: string[];
  risks_bullets: string[];
  trait_weights: Partial<TraitWeights>;
}

// ============================================
// Persona Families Configuration
// ============================================

const PERSONA_FAMILIES: PersonaFamily[] = [
  {
    code: 'YOUNG_ACCUMULATOR',
    label: 'Young Accumulator',
    one_liner: 'Still in the early build-up phase with decades to compound and recover from market dips.',
    plan_focus_bullets: [
      'Maximising long-term growth through diversified equity exposure',
      'Regular contributions and pound-cost averaging into the market',
      'Tax-efficient wrapper utilisation: ISA allowances and early pension contributions',
    ],
    risks_bullets: [
      'Behavioural risk: selling during downturns instead of staying the course',
      'Lifestyle inflation reducing savings capacity as income grows',
    ],
    trait_weights: {
      risk: 1.5,
      drawdown_focus: -2.0,
      wealth_level: -1.0,
    },
  },
  {
    code: 'MID_CAREER_BALANCED',
    label: 'Mid-Career Balanced',
    one_liner: 'Balancing growth ambitions with emerging responsibilities and a medium-term horizon.',
    plan_focus_bullets: [
      'Balanced asset allocation blending growth and stability',
      'Maximising pension contributions and employer matching',
      'Building emergency reserves while maintaining investment momentum',
    ],
    risks_bullets: [
      'Over-caution may limit long-term wealth accumulation',
      'Major life events (house, family) may disrupt investment plans',
    ],
    trait_weights: {
      risk: 0.5,
      drawdown_focus: -0.5,
      liquidity_comfort: 0.5,
    },
  },
  {
    code: 'PROPERTY_LED',
    label: 'Property-Led Investor',
    one_liner: 'A large share of your wealth and attention is focused on property and rental income.',
    plan_focus_bullets: [
      'Portfolio rebalancing to reduce property concentration risk',
      'Rental yield optimisation and tax-efficient property structures',
      'Diversification into liquid assets for flexibility and emergency buffers',
    ],
    risks_bullets: [
      'Illiquidity: property is hard to sell quickly if you need cash',
      'Concentration risk: property market downturns could significantly impact wealth',
    ],
    trait_weights: {
      property_bias: 2.5,
      concentration: 1.0,
      liquidity_comfort: -1.0,
    },
  },
  {
    code: 'ESG_CONSCIOUS',
    label: 'ESG-Conscious Investor',
    one_liner: 'Values-aligned investing is important to you, balancing returns with impact.',
    plan_focus_bullets: [
      'Screening investments for ESG criteria and impact alignment',
      'Balancing ethical preferences with diversification needs',
      'Monitoring greenwashing risks in fund selection',
    ],
    risks_bullets: [
      'Potential performance drag from excluding certain sectors',
      'Complexity in defining and measuring "impact"',
    ],
    trait_weights: {
      risk: 0.3,
      liquidity_comfort: 0.5,
    },
  },
  {
    code: 'CRYPTO_ALTS_ADVENTURER',
    label: 'Crypto & Alternatives Adventurer',
    one_liner: 'You embrace higher-risk, higher-reward assets like crypto and alternatives.',
    plan_focus_bullets: [
      'Position sizing: ensuring alternatives don\'t overwhelm your core portfolio',
      'Tax planning for crypto gains and losses across multiple exchanges',
      'Risk-adjusted rebalancing to lock in gains and manage volatility',
    ],
    risks_bullets: [
      'Extreme volatility: crypto and alts can lose 50%+ in short periods',
      'Regulatory uncertainty and custody risks',
    ],
    trait_weights: {
      alts_bias: 2.5,
      risk: 1.5,
      tax_complexity: 1.0,
    },
  },
  {
    code: 'NEAR_RETIREMENT_CAUTIOUS',
    label: 'Near-Retirement Cautious',
    one_liner: 'Approaching retirement, shifting focus from growth to capital preservation.',
    plan_focus_bullets: [
      'De-risking strategies: gradually shifting from equities to bonds and cash',
      'Sequencing risk management before retirement begins',
      'Planning for sustainable withdrawal rates',
    ],
    risks_bullets: [
      'Market downturn just before retirement could significantly impact plans',
      'Being too conservative may limit long-term purchasing power',
    ],
    trait_weights: {
      drawdown_focus: 1.5,
      risk: -1.0,
      liquidity_comfort: 1.0,
    },
  },
  {
    code: 'RETIREMENT_DRAWDOWN',
    label: 'Retirement & Drawdown Planner',
    one_liner: 'Focused on funding retirement sustainably and not running out of money.',
    plan_focus_bullets: [
      'Sustainable withdrawal strategies to preserve capital over a long retirement',
      'Sequencing risk management: protecting against market downturns in early retirement',
      'Tax-efficient drawdown order across ISA, SIPP, and GIA wrappers',
    ],
    risks_bullets: [
      'Longevity risk: outliving your assets if withdrawal rate is too high',
      'Inflation eroding purchasing power over time',
    ],
    trait_weights: {
      drawdown_focus: 2.0,
      liquidity_comfort: 1.5,
      risk: -0.5,
    },
  },
  {
    code: 'WEALTH_PRESERVATION',
    label: 'Wealth Preservation & Legacy',
    one_liner: 'With substantial wealth, your focus is on preservation, tax efficiency, and legacy planning.',
    plan_focus_bullets: [
      'Estate planning and inheritance tax mitigation strategies',
      'Multi-generational wealth transfer structures',
      'Capital preservation with modest real returns',
    ],
    risks_bullets: [
      'Estate complexity: poor planning could result in significant IHT liability',
      'Being too conservative may erode wealth in real terms',
    ],
    trait_weights: {
      wealth_level: 2.5,
      tax_complexity: 1.5,
      risk: -0.5,
    },
  },
];

// ============================================
// Trait Computation Helpers
// ============================================

/**
 * Normalize a percentage value to 0-1 range.
 * Handles both 0-1 (already normalized) and 0-100 (percentage) inputs.
 */
function normalizeToFraction(value: number): number {
  // If value > 1, assume it's a percentage (0-100) and divide by 100
  if (value > 1) {
    return value / 100;
  }
  return value;
}

function computeRiskScore(profile: InvestorProfile): number {
  const riskMap: Record<string, number> = {
    very_low: 0.1,
    low: 0.3,
    moderate: 0.5,
    high: 0.7,
    very_high: 0.9,
  };
  return riskMap[profile.risk_comfort] ?? 0.5;
}

function computeDrawdownScore(profile: InvestorProfile): number {
  const stageMap: Record<string, number> = {
    ACCUMULATING: 0.1,
    STARTING_DRAWDOWN: 0.6,
    PRIMARILY_DRAWDOWN: 1.0,
  };
  
  let score = stageMap[profile.portfolio_stage || ''] ?? 0.3;
  
  // Boost for older age bands
  const ageBoost: Record<string, number> = {
    '25_34': 0,
    '35_44': 0,
    '45_54': 0.1,
    '55_64': 0.2,
    '65_plus': 0.3,
  };
  score += ageBoost[profile.age_band || ''] ?? 0;
  
  return Math.min(1, score);
}

function computePropertyBias(profile: InvestorProfile): number {
  // Normalize asset class percentage to 0-1 range (handles both 0-1 and 0-100 inputs)
  let score = normalizeToFraction(profile.asset_class_breakdown.property_pct);
  
  // Boost if property is marked as a focus area
  if (profile.personaCues.investing_focus?.includes('PROPERTY_BTL')) {
    score = Math.min(1, score + 0.3);
  }
  
  return score;
}

function computeAltsBias(profile: InvestorProfile): number {
  // Normalize asset class percentages to 0-1 range
  const altsPct = normalizeToFraction(profile.asset_class_breakdown.alts_pct) + 
                  normalizeToFraction(profile.asset_class_breakdown.crypto_pct);
  let score = altsPct;
  
  if (profile.personaCues.investing_focus?.includes('CRYPTO')) {
    score = Math.min(1, score + 0.2);
  }
  if (profile.personaCues.investing_focus?.includes('PRIVATE_BUSINESS')) {
    score = Math.min(1, score + 0.15);
  }
  if (profile.personaCues.has_meaningful_crypto) {
    score = Math.min(1, score + 0.2);
  }
  
  return score;
}

function computeLiquidityComfort(profile: InvestorProfile): number {
  // Higher runway = higher comfort
  const runwayScore = Math.min(1, profile.cash_runway_months / 24);
  
  // Penalise for high illiquidity
  const illiquidPenalty = profile.illiquid_pct * 0.5;
  
  return Math.max(0, runwayScore - illiquidPenalty);
}

function computeTaxComplexity(profile: InvestorProfile): number {
  let score = 0;
  
  // High wealth increases tax complexity
  if (profile.total_portfolio_value_gbp > 500000) score += 0.2;
  if (profile.total_portfolio_value_gbp > 1000000) score += 0.2;
  if (profile.total_portfolio_value_gbp > 2000000) score += 0.2;
  
  // Owning a business adds complexity
  if (profile.personaCues.owns_business) score += 0.2;
  
  // Employer stock/RSUs add complexity
  if (profile.personaCues.has_employer_stock) score += 0.15;
  
  // Crypto adds tax complexity
  if (profile.personaCues.has_meaningful_crypto) score += 0.15;
  
  return Math.min(1, score);
}

function computeCrossBorderComplexity(profile: InvestorProfile): number {
  return profile.personaCues.is_cross_border ? 1.0 : 0;
}

function computeWealthLevel(profile: InvestorProfile): number {
  // Normalise wealth on a 0-1 scale
  // <100k = 0.1, 100k-500k = 0.3, 500k-1m = 0.5, 1m-2m = 0.7, 2m+ = 0.9
  const v = profile.total_portfolio_value_gbp;
  if (v < 100000) return 0.1;
  if (v < 500000) return 0.3;
  if (v < 1000000) return 0.5;
  if (v < 2000000) return 0.7;
  return 0.9;
}

function computeConcentrationScore(profile: InvestorProfile): number {
  // Higher concentration = higher score
  return profile.largest_line_pct;
}

export function computeTraits(profile: InvestorProfile): PersonaTraits {
  return {
    risk: computeRiskScore(profile),
    property_bias: computePropertyBias(profile),
    alts_bias: computeAltsBias(profile),
    liquidity_comfort: computeLiquidityComfort(profile),
    tax_complexity: computeTaxComplexity(profile),
    cross_border_complexity: computeCrossBorderComplexity(profile),
  };
}

// ============================================
// Persona Scoring & Selection
// ============================================

interface NumericFeatures {
  risk: number;
  property_bias: number;
  alts_bias: number;
  liquidity_comfort: number;
  tax_complexity: number;
  cross_border_complexity: number;
  drawdown_focus: number;
  wealth_level: number;
  concentration: number;
}

function computeNumericFeatures(profile: InvestorProfile): NumericFeatures {
  return {
    risk: computeRiskScore(profile),
    property_bias: computePropertyBias(profile),
    alts_bias: computeAltsBias(profile),
    liquidity_comfort: computeLiquidityComfort(profile),
    tax_complexity: computeTaxComplexity(profile),
    cross_border_complexity: computeCrossBorderComplexity(profile),
    drawdown_focus: computeDrawdownScore(profile),
    wealth_level: computeWealthLevel(profile),
    concentration: computeConcentrationScore(profile),
  };
}

function scorePersonaFamily(family: PersonaFamily, features: NumericFeatures): number {
  let score = 0;
  const weights = family.trait_weights;
  
  for (const [trait, weight] of Object.entries(weights)) {
    const featureValue = features[trait as keyof NumericFeatures] ?? 0;
    score += featureValue * (weight as number);
  }
  
  return score;
}

function selectBestPersona(profile: InvestorProfile): PersonaFamily {
  const features = computeNumericFeatures(profile);
  
  let bestFamily = PERSONA_FAMILIES[0];
  let bestScore = -Infinity;
  
  for (const family of PERSONA_FAMILIES) {
    const score = scorePersonaFamily(family, features);
    if (score > bestScore) {
      bestScore = score;
      bestFamily = family;
    }
  }
  
  return bestFamily;
}

// ============================================
// Dynamic "Why Fits You" Bullets
// ============================================

function generateWhyFitsBullets(profile: InvestorProfile, family: PersonaFamily): string[] {
  const bullets: string[] = [];
  const formatPct = (n: number) => `${n.toFixed(0)}%`;
  const formatGbp = (n: number) => n >= 1000000 ? `£${(n / 1000000).toFixed(1)}m` : `£${(n / 1000).toFixed(0)}k`;
  
  // Property-related bullets
  if (family.code === 'PROPERTY_LED' || profile.asset_class_breakdown.property_pct > 20) {
    bullets.push(`Property makes up ${formatPct(profile.asset_class_breakdown.property_pct)} of your portfolio.`);
  }
  if (profile.personaCues.investing_focus?.includes('PROPERTY_BTL')) {
    bullets.push('You selected Property / BTL as one of your main focus areas.');
  }
  
  // Concentration bullets
  if (profile.largest_line_pct > 0.15) {
    bullets.push(`Your largest single position is ${formatPct(profile.largest_line_pct * 100)} of your portfolio.`);
  }
  
  // Drawdown bullets
  if (profile.portfolio_stage === 'PRIMARILY_DRAWDOWN' || profile.portfolio_stage === 'STARTING_DRAWDOWN') {
    bullets.push(`You're in the ${profile.portfolio_stage === 'PRIMARILY_DRAWDOWN' ? 'drawdown' : 'early drawdown'} phase of your investment journey.`);
  }
  
  // Age-related bullets
  if (profile.age_band === '55_64' || profile.age_band === '65_plus') {
    bullets.push('Your age band suggests retirement planning is a priority.');
  } else if (profile.age_band === '25_34') {
    bullets.push('With decades ahead, you have time to recover from market volatility.');
  } else if (profile.age_band === '35_44') {
    bullets.push('You\'re in a prime wealth-building phase of your career.');
  }
  
  // Crypto/alternatives bullets
  if (profile.personaCues.has_meaningful_crypto || profile.personaCues.investing_focus?.includes('CRYPTO')) {
    bullets.push('Crypto and digital assets are a meaningful part of your investment strategy.');
  }
  if (profile.asset_class_breakdown.alts_pct > 10) {
    bullets.push(`Alternative investments make up ${formatPct(profile.asset_class_breakdown.alts_pct)} of your portfolio.`);
  }
  
  // Wealth-related bullets
  if (profile.total_portfolio_value_gbp > 1000000) {
    bullets.push(`Your portfolio value of ${formatGbp(profile.total_portfolio_value_gbp)} puts you in the high-net-worth category.`);
  } else if (profile.total_portfolio_value_gbp > 500000) {
    bullets.push(`Your portfolio of ${formatGbp(profile.total_portfolio_value_gbp)} is substantial and benefits from structured planning.`);
  }
  
  // Cross-border bullets
  if (profile.personaCues.is_cross_border) {
    bullets.push('You have cross-border complexity spanning multiple countries.');
  }
  
  // Business ownership bullets
  if (profile.personaCues.owns_business) {
    bullets.push('Your private business is a significant part of your wealth picture.');
  }
  
  // Risk comfort bullets
  if (profile.risk_comfort === 'very_high' || profile.risk_comfort === 'high') {
    bullets.push('You indicated a higher comfort level with investment risk and volatility.');
  } else if (profile.risk_comfort === 'very_low' || profile.risk_comfort === 'low') {
    bullets.push('You prefer stability and capital preservation over aggressive growth.');
  }
  
  // Liquidity bullets
  if (profile.illiquid_pct > 0.15) {
    bullets.push(`${formatPct(profile.illiquid_pct * 100)} of your portfolio is in illiquid assets.`);
  }
  
  // Portfolio stage bullets
  if (profile.portfolio_stage === 'ACCUMULATING') {
    bullets.push('You\'re in the accumulation phase, focused on building wealth over time.');
  }
  
  // Equity-focused bullets
  if (profile.asset_class_breakdown.equity_pct > 60) {
    bullets.push(`Equities make up ${formatPct(profile.asset_class_breakdown.equity_pct)} of your portfolio, indicating a growth focus.`);
  }
  
  // Return top 3 most relevant bullets, or generate defaults if empty
  if (bullets.length === 0) {
    bullets.push('Your portfolio characteristics match this investor profile.');
    bullets.push(`You have a total portfolio value of ${formatGbp(profile.total_portfolio_value_gbp)}.`);
    bullets.push('Your responses indicate this planning focus would be most relevant.');
  }
  
  return bullets.slice(0, 3);
}

// ============================================
// Main Persona Computation
// ============================================

export function computePersona(profile: InvestorProfile): PersonaResult {
  const family = selectBestPersona(profile);
  const traits = computeTraits(profile);
  const whyFitsBullets = generateWhyFitsBullets(profile, family);
  
  return {
    code: family.code,
    label: family.label,
    one_liner: family.one_liner,
    plan_focus_bullets: family.plan_focus_bullets,
    risks_bullets: family.risks_bullets,
    traits,
    why_fits_bullets: whyFitsBullets,
  };
}

// Export for testing
export { PERSONA_FAMILIES };
