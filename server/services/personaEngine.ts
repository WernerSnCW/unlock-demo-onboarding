/**
 * Persona Engine Module v2
 * 
 * Computes investor personas using a Primary Persona + Portfolio Traits model.
 * Uses deterministic rules for persona assignment and banded traits derived from intake/holdings.
 */

// ============================================
// Type Definitions
// ============================================

export type AgeBand = '25_34' | '35_44' | '45_54' | '55_64' | '65_plus' | null;
export type PortfolioStage = 'ACCUMULATING' | 'STARTING_DRAWDOWN' | 'PRIMARILY_DRAWDOWN' | null;
export type InvestingFocus = 'FUNDS_ETFS' | 'INDIVIDUAL_SHARES' | 'PROPERTY_BTL' | 'PRIVATE_BUSINESS' | 'CRYPTO' | 'OTHER';
export type AdviserUsage = 'SELF_DIRECTED' | 'SOMETIMES_ADVISED' | 'FULL_SERVICE_ADVISER' | 'I_AM_AN_ADVISER' | null;
export type SafetyStatus = 'GREEN' | 'AMBER' | 'RED';

// Band types for structural cues
export type DBIncomeCoverageBand = 'LT_25' | '25_50' | '50_75' | 'GT_75' | 'NOT_SURE' | null;
export type PrivateBusinessWealthBand = 'LT_10' | '10_25' | '25_50' | 'GT_50' | 'NOT_SURE' | null;
export type EmployerStockAllocBand = 'LT_5' | '5_15' | '15_30' | 'GT_30' | 'NOT_SURE' | null;
export type CryptoAllocBand = 'LT_5' | '5_10' | '10_25' | 'GT_25' | 'NOT_SURE' | null;

export interface PersonaCues {
  age_band: AgeBand;
  portfolio_stage: PortfolioStage;
  investing_focus: InvestingFocus[];
  has_defined_benefit_pension: boolean | null;
  db_income_coverage_band: DBIncomeCoverageBand;
  owns_business: boolean | null;
  private_business_wealth_band: PrivateBusinessWealthBand;
  has_employer_stock: boolean | null;
  employer_stock_alloc_band: EmployerStockAllocBand;
  has_crypto: boolean | null;
  crypto_alloc_band: CryptoAllocBand;
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
  age_band: AgeBand;
  portfolio_stage: PortfolioStage;
  primary_goal: string;
  time_horizon: string;
  risk_comfort: string;
  personaCues: PersonaCues;
  total_portfolio_value_gbp: number;
  cash_runway_months: number;
  largest_line_pct: number;
  illiquid_pct: number;
  asset_class_breakdown: AssetClassBreakdown;
  liquidity_status: SafetyStatus;
  concentration_status: SafetyStatus;
  illiquids_status: SafetyStatus;
}

// Trait intensity bands (Light = low presence, Moderate = medium, Strong = high presence)
export type TraitIntensity = 'Light' | 'Moderate' | 'Strong';

export interface PortfolioTrait {
  name: string;
  intensity: TraitIntensity;
  detail: string;
}

export interface PersonaTraits {
  risk: number;
  property_bias: number;
  alts_bias: number;
  liquidity_comfort: number;
  tax_complexity: number;
  cross_border_complexity: number;
}

export interface RiskToWatch {
  code: string;
  text: string;
}

export interface ProfileIndicator {
  name: string;
  value: number; // 0-100
  tooltip: string;
}

export interface PersonaResult {
  code: string;
  label: string;
  one_liner: string;
  plan_focus_bullets: string[];
  risks_bullets: string[];
  traits: PersonaTraits;
  why_fits_bullets: string[];
  portfolio_traits: PortfolioTrait[];
  risks_to_watch: RiskToWatch[];
  profile_indicators: ProfileIndicator[];
}

// ============================================
// Primary Persona Definitions
// ============================================

type PrimaryPersonaCode = 
  | 'CORE_GROWTH'
  | 'SELF_DIRECTED_GROWTH'
  | 'BALANCED_ALLOCATOR'
  | 'INCOME_STABILITY'
  | 'CAPITAL_PRESERVATION'
  | 'FOUNDER_ENTREPRENEUR'
  | 'PROPERTY_LED';

interface PrimaryPersona {
  code: PrimaryPersonaCode;
  label: string;
  one_liner: string;
  plan_focus_bullets: string[];
  risks_bullets: string[];
}

const PRIMARY_PERSONAS: Record<PrimaryPersonaCode, PrimaryPersona> = {
  CORE_GROWTH: {
    code: 'CORE_GROWTH',
    label: 'Core Growth Investor',
    one_liner: 'Building wealth through diversified, long-term equity exposure with a focus on compounding returns.',
    plan_focus_bullets: [
      'Maximising long-term growth through diversified equity exposure',
      'Tax-efficient wrapper utilisation: ISA and pension allowances',
      'Regular contributions and pound-cost averaging',
    ],
    risks_bullets: [
      'Behavioural risk: selling during market downturns',
      'Lifestyle inflation reducing savings capacity over time',
    ],
  },
  SELF_DIRECTED_GROWTH: {
    code: 'SELF_DIRECTED_GROWTH',
    label: 'Self-Directed Growth Investor',
    one_liner: 'Taking an active role in portfolio construction with a long horizon and accumulation focus.',
    plan_focus_bullets: [
      'Building a diversified portfolio aligned with your investment thesis',
      'Monitoring and rebalancing to maintain target allocations',
      'Leveraging tax-efficient wrappers for long-term compounding',
    ],
    risks_bullets: [
      'Over-trading or chasing performance in individual positions',
      'Concentration risk from conviction-led stock selection',
    ],
  },
  BALANCED_ALLOCATOR: {
    code: 'BALANCED_ALLOCATOR',
    label: 'Balanced Allocator',
    one_liner: 'Balancing growth and stability across asset classes for steady, risk-adjusted returns.',
    plan_focus_bullets: [
      'Strategic asset allocation blending equities, bonds, and alternatives',
      'Risk-adjusted portfolio construction based on your comfort level',
      'Periodic rebalancing to maintain target exposures',
    ],
    risks_bullets: [
      'Over-caution may limit long-term wealth accumulation',
      'Rebalancing discipline required during volatile markets',
    ],
  },
  INCOME_STABILITY: {
    code: 'INCOME_STABILITY',
    label: 'Income & Stability Investor',
    one_liner: 'Focused on generating reliable income streams while preserving capital.',
    plan_focus_bullets: [
      'Sustainable withdrawal strategies to preserve capital',
      'Income-generating assets: dividends, bonds, and rental yields',
      'Tax-efficient drawdown ordering across wrappers',
    ],
    risks_bullets: [
      'Longevity risk: outliving your assets if withdrawal rate is too high',
      'Inflation eroding purchasing power over time',
    ],
  },
  CAPITAL_PRESERVATION: {
    code: 'CAPITAL_PRESERVATION',
    label: 'Capital Preservation Investor',
    one_liner: 'Prioritising protection of wealth with modest real returns and legacy planning.',
    plan_focus_bullets: [
      'Capital preservation with modest real returns',
      'Estate planning and inheritance tax mitigation',
      'Multi-generational wealth transfer considerations',
    ],
    risks_bullets: [
      'Being too conservative may erode wealth in real terms',
      'Estate complexity without proper planning',
    ],
  },
  FOUNDER_ENTREPRENEUR: {
    code: 'FOUNDER_ENTREPRENEUR',
    label: 'Founder / Entrepreneur',
    one_liner: 'Your private business or equity stake is a significant portion of your wealth.',
    plan_focus_bullets: [
      'Diversification strategy for concentrated business wealth',
      'Liquidity planning for business exit or liquidity events',
      'Tax-efficient structuring for business income and capital gains',
    ],
    risks_bullets: [
      'Concentration risk: business value tied to a single venture',
      'Illiquidity: private equity is hard to sell quickly',
    ],
  },
  PROPERTY_LED: {
    code: 'PROPERTY_LED',
    label: 'Property-Led Investor',
    one_liner: 'Property forms a dominant share of your wealth and investment strategy.',
    plan_focus_bullets: [
      'Portfolio rebalancing to reduce property concentration',
      'Rental yield optimisation and tax-efficient structures',
      'Diversification into liquid assets for flexibility',
    ],
    risks_bullets: [
      'Illiquidity: property is hard to sell quickly if cash is needed',
      'Concentration risk from property market exposure',
    ],
  },
};

// ============================================
// Deterministic Persona Assignment Rules
// ============================================

function normalizeToFraction(value: number): number {
  if (value > 1) {
    return value / 100;
  }
  return value;
}

function getPropertyDominance(profile: InvestorProfile): number {
  const propertyPct = normalizeToFraction(profile.asset_class_breakdown.property_pct);
  const hasBTLFocus = profile.personaCues.investing_focus?.includes('PROPERTY_BTL');
  return propertyPct + (hasBTLFocus ? 0.15 : 0);
}

function getBusinessDominance(profile: InvestorProfile): number {
  if (!profile.personaCues.owns_business) return 0;
  const band = profile.personaCues.private_business_wealth_band;
  const bandScore: Record<string, number> = {
    'LT_10': 0.05,
    '10_25': 0.175,
    '25_50': 0.375,
    'GT_50': 0.60,
    'NOT_SURE': 0.25,
  };
  return bandScore[band || ''] || 0.25;
}

function getCryptoAllocPct(profile: InvestorProfile): number {
  if (!profile.personaCues.has_crypto) return 0;
  const band = profile.personaCues.crypto_alloc_band;
  const bandMidpoint: Record<string, number> = {
    'LT_5': 0.025,
    '5_10': 0.075,
    '10_25': 0.175,
    'GT_25': 0.30,
    'NOT_SURE': 0.075,
  };
  return bandMidpoint[band || ''] || 0.075;
}

function isLongHorizon(profile: InvestorProfile): boolean {
  const horizon = profile.time_horizon || '';
  // Try parsing as numeric years first
  const numericYears = parseInt(horizon, 10);
  if (!isNaN(numericYears) && numericYears >= 10) {
    return true;
  }
  // Fallback to text-based checks
  const horizonLower = horizon.toLowerCase();
  return horizonLower.includes('10') || horizonLower.includes('15') || horizonLower.includes('20') || 
         horizonLower.includes('long') || horizonLower === '10_plus' || horizonLower === '10+';
}

function isSelfDirected(profile: InvestorProfile): boolean {
  return profile.personaCues.adviser_usage === 'SELF_DIRECTED';
}

function isAccumulating(profile: InvestorProfile): boolean {
  return profile.portfolio_stage === 'ACCUMULATING';
}

function isDrawdownPhase(profile: InvestorProfile): boolean {
  return profile.portfolio_stage === 'STARTING_DRAWDOWN' || 
         profile.portfolio_stage === 'PRIMARILY_DRAWDOWN';
}

function isIncomeGoal(profile: InvestorProfile): boolean {
  const goal = profile.primary_goal?.toLowerCase() || '';
  return goal.includes('income') || goal.includes('retire') || goal.includes('drawdown');
}

function assignPrimaryPersona(profile: InvestorProfile): PrimaryPersonaCode {
  const businessDominance = getBusinessDominance(profile);
  const propertyDominance = getPropertyDominance(profile);
  const cryptoAlloc = getCryptoAllocPct(profile);

  // Rule 1: Significant private business (>25% of wealth)
  if (businessDominance >= 0.25) {
    return 'FOUNDER_ENTREPRENEUR';
  }

  // Rule 2: Property dominant (>30% of portfolio or >40% with BTL focus)
  if (propertyDominance >= 0.30) {
    return 'PROPERTY_LED';
  }

  // Rule P2: Income & stability (per spec - multiple triggers)
  const isPrimarilyDrawdown = profile.portfolio_stage === 'PRIMARILY_DRAWDOWN';
  const isIncomeWithShortHorizon = isIncomeGoal(profile) && !isLongHorizon(profile);
  const isLowRiskNonGrowth = (profile.risk_comfort?.toLowerCase() === 'low') && !profile.primary_goal?.toLowerCase().includes('growth');
  if (isPrimarilyDrawdown || isIncomeWithShortHorizon || isLowRiskNonGrowth) {
    return 'INCOME_STABILITY';
  }

  // Rule P3: Capital preservation (per spec)
  const riskLow = profile.risk_comfort?.toLowerCase() === 'low';
  const cashHigh = (profile.cash_runway_months >= 12) || (normalizeToFraction(profile.asset_class_breakdown.cash_pct) >= 0.20);
  if (riskLow && cashHigh && !isAccumulating(profile)) {
    return 'CAPITAL_PRESERVATION';
  }

  // Rule P4: Self-directed growth (per spec)
  const riskMedOrHigh = profile.risk_comfort?.toLowerCase() === 'moderate' || 
                        profile.risk_comfort?.toLowerCase() === 'medium' || 
                        profile.risk_comfort?.toLowerCase() === 'high';
  if (isSelfDirected(profile) && isAccumulating(profile) && isLongHorizon(profile) && riskMedOrHigh) {
    return 'SELF_DIRECTED_GROWTH';
  }

  // Rule P5: Core growth (per spec)
  if (isAccumulating(profile) && isLongHorizon(profile) && !isSelfDirected(profile)) {
    return 'CORE_GROWTH';
  }

  // Rule 7: Moderate risk / balanced approach
  const riskComfort = profile.risk_comfort?.toLowerCase() || '';
  if (riskComfort === 'moderate' || riskComfort === 'medium') {
    return 'BALANCED_ALLOCATOR';
  }

  // Default fallback
  return 'BALANCED_ALLOCATOR';
}

// ============================================
// Portfolio Traits Derivation
// ============================================

function derivePortfolioTraits(profile: InvestorProfile): PortfolioTrait[] {
  const traits: PortfolioTrait[] = [];
  const formatPct = (n: number) => `${(n * 100).toFixed(0)}%`;

  // Crypto allocation trait (per spec T4: omit if <5%, 5-10% = Light, 10-25% = Moderate, >25% = Strong)
  const cryptoAlloc = getCryptoAllocPct(profile);
  const cryptoBand = profile.personaCues.crypto_alloc_band;
  // Only show crypto trait if band is 5% or higher (not LT_5)
  const showCrypto = profile.personaCues.has_crypto && cryptoBand && cryptoBand !== 'LT_5';
  if (showCrypto) {
    const bandLabel: Record<string, string> = {
      '5_10': '5–10%',
      '10_25': '10–25%',
      'GT_25': '>25%',
      'NOT_SURE': 'undisclosed %',
    };
    // Thresholds: 5-10% = Light, 10-25% = Moderate, >25% = Strong
    let intensity: TraitIntensity;
    if (cryptoBand === 'GT_25') {
      intensity = 'Strong';
    } else if (cryptoBand === '10_25') {
      intensity = 'Moderate';
    } else {
      intensity = 'Light';
    }
    traits.push({
      name: 'Crypto Allocation',
      intensity,
      detail: `${bandLabel[cryptoBand || 'NOT_SURE']} of portfolio`,
    });
  }

  // Alternatives exposure (per spec T5: 5-10% = Light, 10-20% = Moderate, >20% = Strong)
  const altsPct = normalizeToFraction(profile.asset_class_breakdown.alts_pct);
  if (altsPct >= 0.05) {
    const intensity: TraitIntensity = altsPct < 0.10 ? 'Light' : altsPct < 0.20 ? 'Moderate' : 'Strong';
    traits.push({
      name: 'Alternatives Exposure',
      intensity,
      detail: `${formatPct(altsPct)} in alternatives`,
    });
  }

  // Liquidity resilience (per spec T1: Strong = >=12mo, Moderate = 6-12mo, Light = 3-6mo)
  const runwayMonths = profile.cash_runway_months;
  if (runwayMonths !== undefined && runwayMonths >= 0) {
    let intensity: TraitIntensity;
    let detail: string;
    if (runwayMonths >= 12) {
      intensity = 'Strong';
      detail = `${runwayMonths.toFixed(0)}+ months runway`;
    } else if (runwayMonths >= 6) {
      intensity = 'Moderate';
      detail = `${runwayMonths.toFixed(0)} months runway`;
    } else if (runwayMonths >= 3) {
      intensity = 'Light';
      detail = `${runwayMonths.toFixed(0)} months runway`;
    } else {
      // <3 months still shown but triggers risk
      intensity = 'Light';
      detail = runwayMonths > 0 ? `Only ${runwayMonths.toFixed(0)} months runway` : 'Minimal cash buffer';
    }
    traits.push({
      name: 'Liquidity Resilience',
      intensity,
      detail,
    });
  }

  // Concentration (per spec T2: Strong = >=20%, Moderate = 15-20%, Light = 10-15%)
  const largestPct = profile.largest_line_pct;
  if (largestPct >= 0.10) {
    const intensity: TraitIntensity = largestPct >= 0.20 ? 'Strong' : largestPct >= 0.15 ? 'Moderate' : 'Light';
    traits.push({
      name: 'Concentration',
      intensity,
      detail: `Largest position: ${formatPct(largestPct)}`,
    });
  }

  // Property tilt
  const propertyPct = normalizeToFraction(profile.asset_class_breakdown.property_pct);
  if (propertyPct >= 0.05) {
    const intensity: TraitIntensity = propertyPct >= 0.30 ? 'Strong' : propertyPct >= 0.15 ? 'Moderate' : 'Light';
    traits.push({
      name: 'Property Tilt',
      intensity,
      detail: `${formatPct(propertyPct)} in property`,
    });
  }

  // Employer stock concentration (per spec T6: Strong = >=30%, Moderate = 15-30%, Light = 5-15%)
  if (profile.personaCues.has_employer_stock) {
    const band = profile.personaCues.employer_stock_alloc_band;
    const bandLabel: Record<string, string> = {
      'LT_5': '<5%',
      '5_15': '5–15%',
      '15_30': '15–30%',
      'GT_30': '>30%',
      'NOT_SURE': 'undisclosed %',
    };
    const intensity: TraitIntensity = 
      band === 'GT_30' ? 'Strong' : 
      band === '15_30' ? 'Moderate' : 'Light';
    traits.push({
      name: 'Employer Stock',
      intensity,
      detail: `${bandLabel[band || 'NOT_SURE']} in company stock/RSUs`,
    });
  }

  // Illiquids exposure (per spec T3: Strong = >=15%, Moderate = 7-15%, Light = 3-7%)
  const illiquidPct = profile.illiquid_pct;
  if (illiquidPct >= 0.03) {
    const intensity: TraitIntensity = illiquidPct >= 0.15 ? 'Strong' : illiquidPct >= 0.07 ? 'Moderate' : 'Light';
    traits.push({
      name: 'Illiquids Exposure',
      intensity,
      detail: `${formatPct(illiquidPct)} in illiquid assets`,
    });
  }

  // DB Pension Context (per spec T7)
  if (profile.personaCues.has_defined_benefit_pension) {
    const band = profile.personaCues.db_income_coverage_band;
    const bandLabel: Record<string, string> = {
      'LT_25': '<25%',
      '25_50': '25–50%',
      '50_75': '50–75%',
      'GT_75': '>75%',
      'NOT_SURE': 'declared',
    };
    let intensity: TraitIntensity;
    if (band === 'GT_75') {
      intensity = 'Strong';
    } else if (band === '50_75') {
      intensity = 'Moderate';
    } else {
      intensity = 'Light';
    }
    traits.push({
      name: 'DB Pension Context',
      intensity,
      detail: band === 'NOT_SURE' ? 'DB pension declared' : `Covers ${bandLabel[band || 'NOT_SURE']} of essential spending`,
    });
  }

  // Cross-border Complexity (per spec T8)
  if (profile.personaCues.is_cross_border) {
    traits.push({
      name: 'Cross-border Complexity',
      intensity: 'Light',
      detail: 'International tax/residency considerations',
    });
  }

  // Private Business Exposure (separate from alternatives per spec T5 note)
  if (profile.personaCues.owns_business) {
    const band = profile.personaCues.private_business_wealth_band;
    const bandLabel: Record<string, string> = {
      'LT_10': '<10%',
      '10_25': '10–25%',
      '25_50': '25–50%',
      'GT_50': '>50%',
      'NOT_SURE': 'undisclosed %',
    };
    let intensity: TraitIntensity;
    if (band === 'GT_50' || band === '25_50') {
      intensity = 'Strong';
    } else if (band === '10_25') {
      intensity = 'Moderate';
    } else {
      intensity = 'Light';
    }
    traits.push({
      name: 'Private Business Exposure',
      intensity,
      detail: `${bandLabel[band || 'NOT_SURE']} of net worth`,
    });
  }

  return traits;
}

// ============================================
// Numeric Trait Computation (for bars)
// ============================================

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

function computePropertyBias(profile: InvestorProfile): number {
  let score = normalizeToFraction(profile.asset_class_breakdown.property_pct);
  if (profile.personaCues.investing_focus?.includes('PROPERTY_BTL')) {
    score = Math.min(1, score + 0.3);
  }
  return score;
}

function computeAltsBias(profile: InvestorProfile): number {
  const altsPct = normalizeToFraction(profile.asset_class_breakdown.alts_pct) + 
                  normalizeToFraction(profile.asset_class_breakdown.crypto_pct);
  let score = altsPct;
  if (profile.personaCues.investing_focus?.includes('CRYPTO')) {
    score = Math.min(1, score + 0.15);
  }
  if (profile.personaCues.has_crypto) {
    score = Math.min(1, score + getCryptoAllocPct(profile));
  }
  return Math.min(1, score);
}

function computeLiquidityComfort(profile: InvestorProfile): number {
  const runwayScore = profile.cash_runway_months === -1 ? 1 : Math.min(1, profile.cash_runway_months / 24);
  const illiquidPenalty = profile.illiquid_pct * 0.5;
  return Math.max(0, runwayScore - illiquidPenalty);
}

function computeTaxComplexity(profile: InvestorProfile): number {
  let score = 0;
  if (profile.total_portfolio_value_gbp > 500000) score += 0.2;
  if (profile.total_portfolio_value_gbp > 1000000) score += 0.2;
  if (profile.total_portfolio_value_gbp > 2000000) score += 0.2;
  if (profile.personaCues.owns_business) score += 0.2;
  if (profile.personaCues.has_employer_stock) score += 0.15;
  if (profile.personaCues.has_crypto) score += 0.15;
  return Math.min(1, score);
}

function computeCrossBorderComplexity(profile: InvestorProfile): number {
  return profile.personaCues.is_cross_border ? 1.0 : 0;
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
// "Why Fits You" Bullets Generation
// ============================================

function generateWhyFitsBullets(profile: InvestorProfile, persona: PrimaryPersona): string[] {
  const bullets: string[] = [];
  const formatPct = (n: number) => `${(n * 100).toFixed(0)}%`;
  const formatGbp = (n: number) => n >= 1000000 ? `£${(n / 1000000).toFixed(1)}m` : `£${(n / 1000).toFixed(0)}k`;

  switch (persona.code) {
    case 'SELF_DIRECTED_GROWTH':
      if (isSelfDirected(profile)) {
        bullets.push('You manage your investments without a financial adviser.');
      }
      if (isLongHorizon(profile)) {
        bullets.push('Your investment horizon is 10+ years, allowing time to ride out volatility.');
      }
      if (isAccumulating(profile)) {
        bullets.push('You are in the wealth accumulation phase of your journey.');
      }
      break;

    case 'CORE_GROWTH':
      if (isLongHorizon(profile)) {
        bullets.push('Your long time horizon supports a growth-focused strategy.');
      }
      if (isAccumulating(profile)) {
        bullets.push('You are focused on building wealth over time.');
      }
      if (profile.asset_class_breakdown.equity_pct > 50) {
        bullets.push(`Equities make up ${formatPct(normalizeToFraction(profile.asset_class_breakdown.equity_pct))} of your portfolio.`);
      }
      break;

    case 'FOUNDER_ENTREPRENEUR':
      if (profile.personaCues.owns_business) {
        const band = profile.personaCues.private_business_wealth_band;
        const bandLabel: Record<string, string> = {
          'LT_10': 'under 10%',
          '10_25': '10–25%',
          '25_50': '25–50%',
          'GT_50': 'over 50%',
          'NOT_SURE': 'a significant portion',
        };
        bullets.push(`Your private business represents ${bandLabel[band || 'NOT_SURE']} of your wealth.`);
      }
      bullets.push('Concentrated business ownership creates unique planning needs.');
      break;

    case 'PROPERTY_LED':
      const propPct = normalizeToFraction(profile.asset_class_breakdown.property_pct);
      bullets.push(`Property makes up ${formatPct(propPct)} of your portfolio.`);
      if (profile.personaCues.investing_focus?.includes('PROPERTY_BTL')) {
        bullets.push('You identified property/BTL as a primary investment focus.');
      }
      break;

    case 'INCOME_STABILITY':
      if (isDrawdownPhase(profile)) {
        bullets.push(`You are in the ${profile.portfolio_stage === 'PRIMARILY_DRAWDOWN' ? 'drawdown' : 'early drawdown'} phase.`);
      }
      if (isIncomeGoal(profile)) {
        bullets.push('Generating income is one of your primary investment goals.');
      }
      break;

    case 'CAPITAL_PRESERVATION':
      if (profile.total_portfolio_value_gbp >= 1000000) {
        bullets.push(`Your portfolio of ${formatGbp(profile.total_portfolio_value_gbp)} benefits from preservation-focused planning.`);
      }
      if (profile.age_band === '55_64' || profile.age_band === '65_plus') {
        bullets.push('Your life stage suggests wealth protection is a priority.');
      }
      break;

    case 'BALANCED_ALLOCATOR':
      bullets.push('Your risk profile and goals suggest a balanced approach.');
      if (profile.risk_comfort === 'moderate') {
        bullets.push('You indicated a moderate comfort level with investment risk.');
      }
      break;
  }

  // Add fallbacks if we don't have enough bullets
  if (bullets.length < 2) {
    bullets.push(`Your portfolio value is ${formatGbp(profile.total_portfolio_value_gbp)}.`);
  }
  if (bullets.length < 3 && profile.age_band) {
    const ageLabels: Record<string, string> = {
      '25_34': '25–34',
      '35_44': '35–44',
      '45_54': '45–54',
      '55_64': '55–64',
      '65_plus': '65+',
    };
    bullets.push(`Your age band (${ageLabels[profile.age_band]}) influences your planning focus.`);
  }

  return bullets.slice(0, 5);
}

// ============================================
// Data-Triggered Risks to Watch (R1-R5)
// ============================================

function generateRisksToWatch(profile: InvestorProfile): RiskToWatch[] {
  const risks: RiskToWatch[] = [];
  
  // R1 — Concentration risk (largest holding >= amber threshold ~15%)
  if (profile.largest_line_pct >= 0.15 || profile.concentration_status === 'AMBER' || profile.concentration_status === 'RED') {
    risks.push({
      code: 'CONCENTRATION',
      text: 'Concentration risk: one holding exceeds diversification guardrails.',
    });
  }
  
  // R2 — Liquidity shortfall (liquidity Safety Light is Amber or Red, or <3 months runway)
  if (profile.liquidity_status === 'AMBER' || profile.liquidity_status === 'RED' || profile.cash_runway_months < 3) {
    risks.push({
      code: 'LIQUIDITY',
      text: 'Liquidity risk: cash runway is below recommended buffer.',
    });
  }
  
  // R3 — High illiquids (illiquid_pct >= amber threshold ~7%)
  if (profile.illiquid_pct >= 0.07 || profile.illiquids_status === 'AMBER' || profile.illiquids_status === 'RED') {
    risks.push({
      code: 'ILLIQUIDS',
      text: 'Illiquidity risk: a portion of assets may be harder to sell quickly.',
    });
  }
  
  // R4 — Employer stock coupling (employer stock band >= 15-30 or above)
  const empStockBand = profile.personaCues.employer_stock_alloc_band;
  if (profile.personaCues.has_employer_stock && (empStockBand === '15_30' || empStockBand === 'GT_30')) {
    risks.push({
      code: 'EMPLOYER_STOCK',
      text: 'Employer stock risk: portfolio outcomes may be linked to employment income.',
    });
  }
  
  // R5 — Crypto volatility (crypto band >= 10-25 or above)
  const cryptoBand = profile.personaCues.crypto_alloc_band;
  if (profile.personaCues.has_crypto && (cryptoBand === '10_25' || cryptoBand === 'GT_25')) {
    risks.push({
      code: 'CRYPTO_VOLATILITY',
      text: 'Crypto volatility: high price swings can materially affect portfolio value.',
    });
  }
  
  return risks.slice(0, 3); // Max 3 risks per spec
}

// ============================================
// Profile Indicators (I1-I4)
// ============================================

function generateProfileIndicators(profile: InvestorProfile): ProfileIndicator[] {
  const indicators: ProfileIndicator[] = [];
  
  // I1 — Risk Orientation (0-100)
  const riskComfortMap: Record<string, number> = {
    'very_low': 20,
    'low': 30,
    'moderate': 55,
    'high': 75,
    'very_high': 90,
  };
  let riskScore = riskComfortMap[profile.risk_comfort?.toLowerCase() || ''] ?? 50;
  // Time horizon adjustments
  if (isLongHorizon(profile)) riskScore = Math.min(100, riskScore + 10);
  if (!isLongHorizon(profile) && profile.time_horizon) riskScore = Math.max(0, riskScore - 10);
  // Portfolio stage adjustments
  if (isDrawdownPhase(profile)) riskScore = Math.max(0, riskScore - 15);
  
  indicators.push({
    name: 'Risk Orientation',
    value: Math.round(Math.max(0, Math.min(100, riskScore))),
    tooltip: 'Based on stated risk comfort, time horizon, and life stage',
  });
  
  // I2 — Liquidity Resilience (0-100)
  // Map: 0mo → 0, 6mo → 50, 12mo → 75, 18+mo → 90
  let liquidityScore: number;
  const runwayMonths = profile.cash_runway_months;
  if (runwayMonths <= 0) {
    liquidityScore = 0;
  } else if (runwayMonths <= 6) {
    liquidityScore = (runwayMonths / 6) * 50;
  } else if (runwayMonths <= 12) {
    liquidityScore = 50 + ((runwayMonths - 6) / 6) * 25;
  } else {
    liquidityScore = Math.min(100, 75 + ((runwayMonths - 12) / 6) * 15);
  }
  
  indicators.push({
    name: 'Liquidity Resilience',
    value: Math.round(Math.max(0, Math.min(100, liquidityScore))),
    tooltip: `Based on ${runwayMonths.toFixed(0)} months cash runway`,
  });
  
  // I3 — Alternatives Exposure (0-100)
  const altsPct = normalizeToFraction(profile.asset_class_breakdown.alts_pct);
  const cryptoPct = getCryptoAllocPct(profile);
  let altsScore = (altsPct + cryptoPct) * 200; // 50% total → 100
  
  indicators.push({
    name: 'Alternatives Exposure',
    value: Math.round(Math.max(0, Math.min(100, altsScore))),
    tooltip: cryptoPct > 0 ? 'Based on portfolio alternatives and declared crypto allocation' : 'Based on portfolio alternatives allocation',
  });
  
  // I4 — Property Tilt (0-100)
  const propertyPct = normalizeToFraction(profile.asset_class_breakdown.property_pct);
  let propertyScore = propertyPct * 200; // 50% property → 100
  // Boost if property is in investing focus
  if (profile.personaCues.investing_focus?.includes('PROPERTY_BTL')) {
    propertyScore = Math.min(100, propertyScore + 20);
  }
  
  indicators.push({
    name: 'Property Tilt',
    value: Math.round(Math.max(0, Math.min(100, propertyScore))),
    tooltip: propertyPct > 0 ? `Based on ${(propertyPct * 100).toFixed(0)}% property allocation` : 'Based on stated investment focus',
  });
  
  return indicators;
}

// ============================================
// Main Persona Computation
// ============================================

export function computePersona(profile: InvestorProfile): PersonaResult {
  const personaCode = assignPrimaryPersona(profile);
  const persona = PRIMARY_PERSONAS[personaCode];
  const traits = computeTraits(profile);
  const portfolioTraits = derivePortfolioTraits(profile);
  const whyFitsBullets = generateWhyFitsBullets(profile, persona);
  const risksToWatch = generateRisksToWatch(profile);
  const profileIndicators = generateProfileIndicators(profile);

  return {
    code: persona.code,
    label: persona.label,
    one_liner: persona.one_liner,
    plan_focus_bullets: persona.plan_focus_bullets,
    risks_bullets: persona.risks_bullets,
    traits,
    why_fits_bullets: whyFitsBullets,
    portfolio_traits: portfolioTraits,
    risks_to_watch: risksToWatch,
    profile_indicators: profileIndicators,
  };
}

// Export for testing
export { PRIMARY_PERSONAS };

// Legacy compatibility - still export old type name
export type { PersonaCues as PersonaCuesLegacy };
