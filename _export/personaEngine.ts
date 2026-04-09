export type AgeBand = '25_34' | '35_44' | '45_54' | '55_64' | '65_plus' | null;
export type PortfolioStage = 'ACCUMULATING' | 'STARTING_DRAWDOWN' | 'PRIMARILY_DRAWDOWN' | null;
export type InvestingFocus = 'FUNDS_ETFS' | 'INDIVIDUAL_SHARES' | 'PROPERTY_BTL' | 'PRIVATE_BUSINESS' | 'CRYPTO' | 'OTHER';
export type AdviserUsage = 'SELF_DIRECTED' | 'SOMETIMES_ADVISED' | 'FULL_SERVICE_ADVISER' | 'I_AM_AN_ADVISER' | null;
export type SafetyStatus = 'GREEN' | 'AMBER' | 'RED';

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

export type TraitIntensity = 'Light' | 'Moderate' | 'Strong';

export interface PortfolioTrait {
  name: string;
  intensity: TraitIntensity;
  detail: string;
}

export interface PersonaTraits {
  risk_appetite: number;
  alternatives_bias: number;
  property_bias: number;
  liquidity_comfort: number;
  income_orientation: number;
  complexity_proxy: number;
}

export interface RiskToWatch {
  code: string;
  text: string;
}

export interface ProfileIndicator {
  name: string;
  value: number;
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
  match_score: number;
  match_confidence: number;
}

type PrimaryPersonaCode =
  | 'CORE_GROWTH'
  | 'SELF_DIRECTED_GROWTH'
  | 'BALANCED_ALLOCATOR'
  | 'INCOME_STABILITY'
  | 'CAPITAL_PRESERVATION'
  | 'FOUNDER_ENTREPRENEUR'
  | 'PROPERTY_LED'
  | 'ALTERNATIVES_FOCUSED';

interface PrimaryPersona {
  code: PrimaryPersonaCode;
  label: string;
  one_liner: string;
  plan_focus_bullets: string[];
  risks_bullets: string[];
}

export const PRIMARY_PERSONAS: Record<PrimaryPersonaCode, PrimaryPersona> = {
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
  ALTERNATIVES_FOCUSED: {
    code: 'ALTERNATIVES_FOCUSED',
    label: 'Alternatives Focused',
    one_liner: 'Meaningful allocation to alternatives alongside traditional assets.',
    plan_focus_bullets: [
      'Monitoring alternatives exposure within overall portfolio risk budget',
      'Tax treatment of crypto and alternative gains',
      'Balancing alternative holdings with liquid, diversified assets',
    ],
    risks_bullets: [
      'Alternatives can be volatile and harder to sell quickly',
      'Regulatory and tax treatment may change over time',
    ],
  },
};

type PersonaWeights = {
  risk_appetite: number;
  alternatives_bias: number;
  property_bias: number;
  liquidity_comfort: number;
  income_orientation: number;
  complexity_proxy: number;
};

const PERSONA_WEIGHT_TABLE: Record<PrimaryPersonaCode, PersonaWeights> = {
  CORE_GROWTH: {
    risk_appetite: 0.28, alternatives_bias: 0.05, property_bias: 0.05,
    liquidity_comfort: 0.15, income_orientation: 0.12, complexity_proxy: 0.35,
  },
  SELF_DIRECTED_GROWTH: {
    risk_appetite: 0.44, alternatives_bias: 0.14, property_bias: 0.05,
    liquidity_comfort: 0.05, income_orientation: 0.03, complexity_proxy: 0.29,
  },
  BALANCED_ALLOCATOR: {
    risk_appetite: 0.22, alternatives_bias: 0.05, property_bias: 0.05,
    liquidity_comfort: 0.32, income_orientation: 0.14, complexity_proxy: 0.22,
  },
  INCOME_STABILITY: {
    risk_appetite: 0.05, alternatives_bias: 0.00, property_bias: 0.05,
    liquidity_comfort: 0.28, income_orientation: 0.52, complexity_proxy: 0.10,
  },
  CAPITAL_PRESERVATION: {
    risk_appetite: 0.05, alternatives_bias: 0.00, property_bias: 0.05,
    liquidity_comfort: 0.36, income_orientation: 0.44, complexity_proxy: 0.10,
  },
  FOUNDER_ENTREPRENEUR: {
    risk_appetite: 0.16, alternatives_bias: 0.08, property_bias: 0.05,
    liquidity_comfort: 0.05, income_orientation: 0.08, complexity_proxy: 0.58,
  },
  PROPERTY_LED: {
    risk_appetite: 0.10, alternatives_bias: 0.00, property_bias: 0.70,
    liquidity_comfort: 0.10, income_orientation: 0.05, complexity_proxy: 0.05,
  },
  ALTERNATIVES_FOCUSED: {
    risk_appetite: 0.24, alternatives_bias: 0.56, property_bias: 0.00,
    liquidity_comfort: 0.08, income_orientation: 0.06, complexity_proxy: 0.06,
  },
};

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
    'LT_10': 0.05, '10_25': 0.175, '25_50': 0.375, 'GT_50': 0.60, 'NOT_SURE': 0.25,
  };
  return bandScore[band || ''] || 0.25;
}

function getCryptoAllocPct(profile: InvestorProfile): number {
  if (!profile.personaCues.has_crypto) return 0;
  const band = profile.personaCues.crypto_alloc_band;
  const bandMidpoint: Record<string, number> = {
    'LT_5': 0.025, '5_10': 0.075, '10_25': 0.175, 'GT_25': 0.30, 'NOT_SURE': 0.075,
  };
  return bandMidpoint[band || ''] || 0.075;
}

function hasAlternativesDominance(profile: InvestorProfile): boolean {
  return profile.personaCues.has_crypto === true &&
         profile.personaCues.crypto_alloc_band === 'GT_25';
}

function isLongHorizon(profile: InvestorProfile): boolean {
  const horizon = profile.time_horizon || '';
  const numericYears = parseInt(horizon, 10);
  if (!isNaN(numericYears) && numericYears >= 10) {
    return true;
  }
  const horizonLower = horizon.toLowerCase();
  return horizonLower.includes('10') || horizonLower.includes('15') || horizonLower.includes('20') ||
         horizonLower.includes('long') || horizonLower === '10_plus' || horizonLower === '10+';
}

function isDrawdownPhase(profile: InvestorProfile): boolean {
  return profile.portfolio_stage === 'STARTING_DRAWDOWN' ||
         profile.portfolio_stage === 'PRIMARILY_DRAWDOWN';
}

interface WeightedMatchResult {
  code: PrimaryPersonaCode;
  score: number;
}

interface PersonaMatchOutput {
  code: PrimaryPersonaCode;
  match_score: number;
  match_confidence: number;
  was_hard_override: boolean;
}

function computeWeightedMatches(traits: PersonaTraits): WeightedMatchResult[] {
  const personaCodes = Object.keys(PERSONA_WEIGHT_TABLE) as PrimaryPersonaCode[];

  const results: WeightedMatchResult[] = personaCodes.map(code => {
    const weights = PERSONA_WEIGHT_TABLE[code];
    const score =
      traits.risk_appetite * weights.risk_appetite +
      traits.alternatives_bias * weights.alternatives_bias +
      traits.property_bias * weights.property_bias +
      traits.liquidity_comfort * weights.liquidity_comfort +
      traits.income_orientation * weights.income_orientation +
      traits.complexity_proxy * weights.complexity_proxy;

    return { code, score };
  });

  results.sort((a, b) => b.score - a.score);

  return results;
}

function assignPrimaryPersonaWithMatching(profile: InvestorProfile, traits: PersonaTraits): PersonaMatchOutput {
  const businessDominance = getBusinessDominance(profile);
  const propertyDominance = getPropertyDominance(profile);

  if (businessDominance >= 0.25) {
    return { code: 'FOUNDER_ENTREPRENEUR', match_score: 1.0, match_confidence: 1.0, was_hard_override: true };
  }

  if (propertyDominance >= 0.30) {
    return { code: 'PROPERTY_LED', match_score: 1.0, match_confidence: 1.0, was_hard_override: true };
  }

  if (hasAlternativesDominance(profile)) {
    return { code: 'ALTERNATIVES_FOCUSED', match_score: 1.0, match_confidence: 1.0, was_hard_override: true };
  }

  let matches = computeWeightedMatches(traits);

  if (profile.personaCues.adviser_usage === 'FULL_SERVICE_ADVISER') {
    matches = matches.filter(m => m.code !== 'SELF_DIRECTED_GROWTH');
  }

  const topMatch = matches[0];
  const secondMatch = matches[1];

  const normalizedScore = Math.min(1, Math.max(0, topMatch.score));
  const rawConfidence = topMatch.score - secondMatch.score;
  const matchConfidence = Math.min(1, Math.max(0, rawConfidence));

  return {
    code: topMatch.code,
    match_score: normalizedScore,
    match_confidence: matchConfidence,
    was_hard_override: false,
  };
}

function derivePortfolioTraits(profile: InvestorProfile): PortfolioTrait[] {
  const traits: PortfolioTrait[] = [];
  const formatPct = (n: number) => `${(n * 100).toFixed(0)}%`;

  const cryptoBand = profile.personaCues.crypto_alloc_band;
  const showCrypto = profile.personaCues.has_crypto && cryptoBand && cryptoBand !== 'LT_5';
  if (showCrypto) {
    const bandLabel: Record<string, string> = { '5_10': '5\u201310%', '10_25': '10\u201325%', 'GT_25': '>25%', 'NOT_SURE': 'undisclosed %' };
    let intensity: TraitIntensity;
    if (cryptoBand === 'GT_25') { intensity = 'Strong'; }
    else if (cryptoBand === '10_25') { intensity = 'Moderate'; }
    else { intensity = 'Light'; }
    traits.push({ name: 'Crypto Allocation', intensity, detail: `${bandLabel[cryptoBand || 'NOT_SURE']} of portfolio` });
  }

  const altsPct = normalizeToFraction(profile.asset_class_breakdown.alts_pct);
  if (altsPct >= 0.05) {
    const intensity: TraitIntensity = altsPct < 0.10 ? 'Light' : altsPct < 0.20 ? 'Moderate' : 'Strong';
    traits.push({ name: 'Alternatives Exposure', intensity, detail: `${formatPct(altsPct)} in alternatives` });
  }

  const runwayMonths = profile.cash_runway_months;
  if (runwayMonths !== undefined && runwayMonths >= 0) {
    let intensity: TraitIntensity;
    let detail: string;
    if (runwayMonths >= 12) { intensity = 'Strong'; detail = `${runwayMonths.toFixed(0)}+ months runway`; }
    else if (runwayMonths >= 6) { intensity = 'Moderate'; detail = `${runwayMonths.toFixed(0)} months runway`; }
    else if (runwayMonths >= 3) { intensity = 'Light'; detail = `${runwayMonths.toFixed(0)} months runway`; }
    else { intensity = 'Light'; detail = runwayMonths > 0 ? `Only ${runwayMonths.toFixed(0)} months runway` : 'Minimal cash buffer'; }
    traits.push({ name: 'Liquidity Resilience', intensity, detail });
  }

  const largestPct = profile.largest_line_pct;
  if (largestPct >= 0.10) {
    const intensity: TraitIntensity = largestPct >= 0.20 ? 'Strong' : largestPct >= 0.15 ? 'Moderate' : 'Light';
    traits.push({ name: 'Concentration', intensity, detail: `Largest position: ${formatPct(largestPct)}` });
  }

  const propertyPct = normalizeToFraction(profile.asset_class_breakdown.property_pct);
  if (propertyPct >= 0.05) {
    const intensity: TraitIntensity = propertyPct >= 0.30 ? 'Strong' : propertyPct >= 0.15 ? 'Moderate' : 'Light';
    traits.push({ name: 'Property Tilt', intensity, detail: `${formatPct(propertyPct)} in property` });
  }

  if (profile.personaCues.has_employer_stock) {
    const band = profile.personaCues.employer_stock_alloc_band;
    const bandLabel: Record<string, string> = { 'LT_5': '<5%', '5_15': '5\u201315%', '15_30': '15\u201330%', 'GT_30': '>30%', 'NOT_SURE': 'undisclosed %' };
    const intensity: TraitIntensity = band === 'GT_30' ? 'Strong' : band === '15_30' ? 'Moderate' : 'Light';
    traits.push({ name: 'Employer Stock', intensity, detail: `${bandLabel[band || 'NOT_SURE']} in company stock/RSUs` });
  }

  const illiquidPct = profile.illiquid_pct;
  if (illiquidPct >= 0.03) {
    const intensity: TraitIntensity = illiquidPct >= 0.15 ? 'Strong' : illiquidPct >= 0.07 ? 'Moderate' : 'Light';
    traits.push({ name: 'Illiquids Exposure', intensity, detail: `${formatPct(illiquidPct)} in illiquid assets` });
  }

  if (profile.personaCues.has_defined_benefit_pension) {
    const band = profile.personaCues.db_income_coverage_band;
    const bandLabel: Record<string, string> = { 'LT_25': '<25%', '25_50': '25\u201350%', '50_75': '50\u201375%', 'GT_75': '>75%', 'NOT_SURE': 'declared' };
    let intensity: TraitIntensity;
    if (band === 'GT_75') { intensity = 'Strong'; }
    else if (band === '50_75') { intensity = 'Moderate'; }
    else { intensity = 'Light'; }
    traits.push({ name: 'DB Pension Context', intensity, detail: band === 'NOT_SURE' ? 'DB pension declared' : `Covers ${bandLabel[band || 'NOT_SURE']} of essential spending` });
  }

  if (profile.personaCues.is_cross_border) {
    traits.push({ name: 'Cross-border Complexity', intensity: 'Light', detail: 'International tax/residency considerations' });
  }

  if (profile.personaCues.owns_business) {
    const band = profile.personaCues.private_business_wealth_band;
    const bandLabel: Record<string, string> = { 'LT_10': '<10%', '10_25': '10\u201325%', '25_50': '25\u201350%', 'GT_50': '>50%', 'NOT_SURE': 'undisclosed %' };
    let intensity: TraitIntensity;
    if (band === 'GT_50' || band === '25_50') { intensity = 'Strong'; }
    else if (band === '10_25') { intensity = 'Moderate'; }
    else { intensity = 'Light'; }
    traits.push({ name: 'Private Business Exposure', intensity, detail: `${bandLabel[band || 'NOT_SURE']} of net worth` });
  }

  return traits;
}

function computeRiskAppetite(profile: InvestorProfile): number {
  const riskMap: Record<string, number> = { very_low: 0.1, low: 0.25, moderate: 0.5, medium: 0.5, high: 0.75, very_high: 0.9 };
  const riskBase = riskMap[(profile.risk_comfort || '').toLowerCase()] ?? 0.5;

  const horizonScalar = isLongHorizon(profile) ? 1.0 : profile.time_horizon === '5_9' ? 0.6 : 0.3;

  const equityPct = normalizeToFraction(profile.asset_class_breakdown.equity_pct);
  const altsPctVal = normalizeToFraction(profile.asset_class_breakdown.alts_pct) +
                normalizeToFraction(profile.asset_class_breakdown.crypto_pct);
  const allocationTerm = Math.min(1, equityPct + altsPctVal);

  const rawScore = 0.35 * riskBase + 0.20 * horizonScalar + 0.45 * allocationTerm;

  const adviserMultiplier: Record<string, number> = {
    'SELF_DIRECTED': 1.12, 'SOMETIMES_ADVISED': 1.03, 'FULL_SERVICE_ADVISER': 0.88,
  };
  const multiplier = adviserMultiplier[profile.personaCues.adviser_usage || ''] ?? 1.0;

  return Math.min(1, Math.max(0, rawScore * multiplier));
}

function computeAlternativesBias(profile: InvestorProfile): number {
  const altsPctVal = normalizeToFraction(profile.asset_class_breakdown.alts_pct);
  const cryptoPctVal = normalizeToFraction(profile.asset_class_breakdown.crypto_pct);
  let score = altsPctVal + cryptoPctVal;

  if (profile.personaCues.has_crypto) {
    score = Math.min(1, score + getCryptoAllocPct(profile));
  }

  if (profile.personaCues.investing_focus?.includes('CRYPTO')) {
    score = Math.min(1, score + 0.15);
  }

  return Math.min(1, Math.max(0, score));
}

function computePropertyBias(profile: InvestorProfile): number {
  let score = normalizeToFraction(profile.asset_class_breakdown.property_pct);
  if (profile.personaCues.investing_focus?.includes('PROPERTY_BTL')) {
    score = Math.min(1, score + 0.3);
  }
  return Math.min(1, Math.max(0, score));
}

function computeLiquidityComfort(profile: InvestorProfile): number {
  const runwayMonths = profile.cash_runway_months;
  const runwayScore = runwayMonths === -1 ? 1 : Math.min(1, runwayMonths / 12);

  const cashPct = normalizeToFraction(profile.asset_class_breakdown.cash_pct);
  const cashScore = Math.min(1, cashPct * 5);

  const illiquidPenalty = profile.illiquid_pct * 0.5;

  return Math.min(1, Math.max(0, runwayScore * 0.5 + cashScore * 0.25 - illiquidPenalty * 0.25));
}

function computeIncomeOrientation(profile: InvestorProfile): number {
  let score = 0;

  if (profile.portfolio_stage === 'PRIMARILY_DRAWDOWN') { score += 0.4; }
  else if (profile.portfolio_stage === 'STARTING_DRAWDOWN') { score += 0.25; }

  const goal = (profile.primary_goal || '').toLowerCase();
  if (goal.includes('income') || goal.includes('drawdown') || goal.includes('retire')) { score += 0.35; }

  const riskComfort = (profile.risk_comfort || '').toLowerCase();
  if (riskComfort === 'low' || riskComfort === 'very_low') { score += 0.25; }
  else if (riskComfort === 'moderate' || riskComfort === 'medium') { score += 0.1; }

  return Math.min(1, Math.max(0, score));
}

function computeComplexityProxy(profile: InvestorProfile): number {
  let score = 0;

  const value = profile.total_portfolio_value_gbp;
  if (value > 2000000) { score += 0.3; }
  else if (value > 1000000) { score += 0.2; }
  else if (value > 500000) { score += 0.1; }

  if (profile.personaCues.has_defined_benefit_pension) { score += 0.15; }

  if (profile.personaCues.owns_business) {
    const band = profile.personaCues.private_business_wealth_band;
    const bandScore: Record<string, number> = { 'LT_10': 0.1, '10_25': 0.15, '25_50': 0.2, 'GT_50': 0.2, 'NOT_SURE': 0.15 };
    score += bandScore[band || 'NOT_SURE'] || 0.1;
  }

  if (profile.personaCues.has_employer_stock) { score += 0.15; }
  if (profile.personaCues.is_cross_border) { score += 0.2; }

  return Math.min(1, Math.max(0, score));
}

export function computeTraitScores(profile: InvestorProfile): PersonaTraits {
  return {
    risk_appetite: computeRiskAppetite(profile),
    alternatives_bias: computeAlternativesBias(profile),
    property_bias: computePropertyBias(profile),
    liquidity_comfort: computeLiquidityComfort(profile),
    income_orientation: computeIncomeOrientation(profile),
    complexity_proxy: computeComplexityProxy(profile),
  };
}

export const computeTraits = computeTraitScores;

interface SignalCandidate {
  priority: number;
  bullet: string;
  source: string;
}

export function buildWhyFitsBullets(profile: InvestorProfile, traitScores: PersonaTraits): string[] {
  const candidates: SignalCandidate[] = [];
  const formatPct = (n: number) => `${(n * 100).toFixed(0)}%`;
  const formatGbp = (n: number) => n >= 1000000 ? `\u00a3${(n / 1000000).toFixed(1)}m` : `\u00a3${(n / 1000).toFixed(0)}k`;

  if (profile.personaCues.adviser_usage === 'SELF_DIRECTED') {
    candidates.push({ priority: 0.8, bullet: 'You indicated you manage your investments without a financial adviser.', source: 'adviser_usage' });
  } else if (profile.personaCues.adviser_usage === 'FULL_SERVICE_ADVISER') {
    candidates.push({ priority: 0.6, bullet: 'You indicated you work with a full-service financial adviser.', source: 'adviser_usage' });
  }

  if (isLongHorizon(profile)) {
    candidates.push({ priority: 0.75 + traitScores.risk_appetite * 0.1, bullet: 'Your stated investment horizon is 10+ years.', source: 'time_horizon' });
  } else if (profile.time_horizon) {
    const horizonClean = profile.time_horizon.replace(/_/g, ' ').replace('plus', '+');
    candidates.push({ priority: 0.5, bullet: `Your stated investment horizon is ${horizonClean}.`, source: 'time_horizon' });
  }

  if (profile.portfolio_stage === 'ACCUMULATING') {
    candidates.push({ priority: 0.7, bullet: 'Your portfolio stage is accumulating (building wealth).', source: 'portfolio_stage' });
  } else if (profile.portfolio_stage === 'PRIMARILY_DRAWDOWN') {
    candidates.push({ priority: 0.85 + traitScores.income_orientation * 0.1, bullet: 'Your portfolio stage is primarily drawdown.', source: 'portfolio_stage' });
  } else if (profile.portfolio_stage === 'STARTING_DRAWDOWN') {
    candidates.push({ priority: 0.75 + traitScores.income_orientation * 0.1, bullet: 'Your portfolio stage is starting drawdown.', source: 'portfolio_stage' });
  }

  if (profile.risk_comfort) {
    const riskLabel = profile.risk_comfort.charAt(0).toUpperCase() + profile.risk_comfort.slice(1).toLowerCase();
    candidates.push({ priority: 0.65, bullet: `Your stated risk comfort level is ${riskLabel}.`, source: 'risk_comfort' });
  }

  if (profile.primary_goal) {
    const goalClean = profile.primary_goal.toLowerCase().replace(/_/g, ' ');
    const goalLabel = goalClean.charAt(0).toUpperCase() + goalClean.slice(1);
    const isIncomeRelated = goalClean.includes('income') || goalClean.includes('drawdown');
    candidates.push({ priority: isIncomeRelated ? 0.75 : 0.6, bullet: `Your stated primary goal is "${goalLabel}".`, source: 'primary_goal' });
  }

  if (profile.personaCues.has_crypto && profile.personaCues.crypto_alloc_band === 'GT_25') {
    candidates.push({ priority: 0.9 + traitScores.alternatives_bias * 0.1, bullet: 'You indicated your crypto allocation is greater than 25% of your portfolio.', source: 'crypto_alloc_band' });
  } else if (profile.personaCues.has_crypto && profile.personaCues.crypto_alloc_band === '10_25') {
    candidates.push({ priority: 0.6 + traitScores.alternatives_bias * 0.1, bullet: 'You indicated your crypto allocation is 10\u201325% of your portfolio.', source: 'crypto_alloc_band' });
  }

  if (profile.personaCues.investing_focus?.includes('CRYPTO')) {
    candidates.push({ priority: 0.7 + traitScores.alternatives_bias * 0.1, bullet: 'You identified crypto/alternatives as a primary investment focus.', source: 'investing_focus_crypto' });
  }

  if (profile.personaCues.investing_focus?.includes('PROPERTY_BTL')) {
    candidates.push({ priority: 0.75 + traitScores.property_bias * 0.1, bullet: 'You identified property/BTL as a primary investment focus.', source: 'investing_focus_property' });
  }

  const propPct = normalizeToFraction(profile.asset_class_breakdown.property_pct);
  if (propPct >= 0.20) {
    candidates.push({ priority: 0.7 + traitScores.property_bias * 0.1, bullet: `Property makes up ${formatPct(propPct)} of your stated portfolio allocation.`, source: 'property_pct' });
  }

  const altsAlloc = normalizeToFraction(profile.asset_class_breakdown.alts_pct);
  if (altsAlloc >= 0.15) {
    candidates.push({ priority: 0.6 + traitScores.alternatives_bias * 0.1, bullet: `Alternatives make up ${formatPct(altsAlloc)} of your stated portfolio allocation.`, source: 'alts_pct' });
  }

  const equityPct = normalizeToFraction(profile.asset_class_breakdown.equity_pct);
  if (equityPct >= 0.50) {
    candidates.push({ priority: 0.55 + traitScores.risk_appetite * 0.1, bullet: `Equities make up ${formatPct(equityPct)} of your portfolio.`, source: 'equity_pct' });
  }

  if (profile.cash_runway_months >= 12) {
    candidates.push({ priority: 0.7 + traitScores.liquidity_comfort * 0.1, bullet: `Your cash runway is ${profile.cash_runway_months.toFixed(0)} months.`, source: 'cash_runway' });
  }

  if (profile.personaCues.owns_business) {
    const band = profile.personaCues.private_business_wealth_band;
    const bandLabel: Record<string, string> = { 'LT_10': 'under 10%', '10_25': '10\u201325%', '25_50': '25\u201350%', 'GT_50': 'over 50%', 'NOT_SURE': 'a significant portion' };
    candidates.push({ priority: 0.85 + traitScores.complexity_proxy * 0.1, bullet: `You indicated your private business represents ${bandLabel[band || 'NOT_SURE']} of your wealth.`, source: 'owns_business' });
  }

  if (profile.personaCues.has_defined_benefit_pension) {
    const band = profile.personaCues.db_income_coverage_band;
    const bandLabel: Record<string, string> = { 'LT_25': 'under 25%', '25_50': '25\u201350%', '50_75': '50\u201375%', 'GT_75': 'over 75%', 'NOT_SURE': 'an undisclosed portion' };
    candidates.push({ priority: 0.7 + traitScores.income_orientation * 0.1, bullet: `You have a defined benefit pension covering ${bandLabel[band || 'NOT_SURE']} of retirement income.`, source: 'db_pension' });
  }

  if (profile.personaCues.is_cross_border) {
    candidates.push({ priority: 0.75 + traitScores.complexity_proxy * 0.1, bullet: 'You indicated cross-border or international tax considerations.', source: 'cross_border' });
  }

  if (profile.total_portfolio_value_gbp >= 1000000) {
    candidates.push({ priority: 0.6, bullet: `Your stated portfolio value is ${formatGbp(profile.total_portfolio_value_gbp)}.`, source: 'portfolio_value' });
  }

  candidates.sort((a, b) => b.priority - a.priority);

  const selected = candidates.slice(0, 3).map(c => c.bullet);

  if (selected.length < 2 && profile.age_band) {
    const ageLabels: Record<string, string> = { '25_34': '25\u201334', '35_44': '35\u201344', '45_54': '45\u201354', '55_64': '55\u201364', '65_plus': '65+' };
    selected.push(`Your age band (${ageLabels[profile.age_band]}) influences your planning focus.`);
  }

  if (selected.length < 2) {
    selected.push(`Your portfolio value is ${formatGbp(profile.total_portfolio_value_gbp)}.`);
  }

  return selected.slice(0, 3);
}

function generateRisksToWatch(profile: InvestorProfile): RiskToWatch[] {
  const risks: RiskToWatch[] = [];

  if (profile.largest_line_pct >= 0.15 || profile.concentration_status === 'AMBER' || profile.concentration_status === 'RED') {
    risks.push({ code: 'CONCENTRATION', text: 'Concentration risk: one holding exceeds diversification guardrails.' });
  }

  if (profile.liquidity_status === 'AMBER' || profile.liquidity_status === 'RED' || profile.cash_runway_months < 3) {
    risks.push({ code: 'LIQUIDITY', text: 'Liquidity risk: cash runway is below recommended buffer.' });
  }

  if (profile.illiquid_pct >= 0.07 || profile.illiquids_status === 'AMBER' || profile.illiquids_status === 'RED') {
    risks.push({ code: 'ILLIQUIDS', text: 'Illiquidity risk: a portion of assets may be harder to sell quickly.' });
  }

  const empStockBand = profile.personaCues.employer_stock_alloc_band;
  if (profile.personaCues.has_employer_stock && (empStockBand === '15_30' || empStockBand === 'GT_30')) {
    risks.push({ code: 'EMPLOYER_STOCK', text: 'Employer stock risk: portfolio outcomes may be linked to employment income.' });
  }

  const cryptoBandVal = profile.personaCues.crypto_alloc_band;
  if (profile.personaCues.has_crypto && (cryptoBandVal === '10_25' || cryptoBandVal === 'GT_25')) {
    risks.push({ code: 'CRYPTO_VOLATILITY', text: 'Crypto volatility: high price swings can materially affect portfolio value.' });
  }

  return risks.slice(0, 3);
}

function generateProfileIndicators(profile: InvestorProfile): ProfileIndicator[] {
  const indicators: ProfileIndicator[] = [];

  const riskComfortMap: Record<string, number> = { 'very_low': 20, 'low': 30, 'moderate': 55, 'high': 75, 'very_high': 90 };
  let riskScore = riskComfortMap[profile.risk_comfort?.toLowerCase() || ''] ?? 50;
  if (isLongHorizon(profile)) riskScore = Math.min(100, riskScore + 10);
  if (!isLongHorizon(profile) && profile.time_horizon) riskScore = Math.max(0, riskScore - 10);
  if (isDrawdownPhase(profile)) riskScore = Math.max(0, riskScore - 15);

  indicators.push({ name: 'Risk Orientation', value: Math.round(Math.max(0, Math.min(100, riskScore))), tooltip: 'Based on stated risk comfort, time horizon, and life stage' });

  let liquidityScore: number;
  const runwayMonths = profile.cash_runway_months;
  if (runwayMonths <= 0) { liquidityScore = 0; }
  else if (runwayMonths <= 6) { liquidityScore = (runwayMonths / 6) * 50; }
  else if (runwayMonths <= 12) { liquidityScore = 50 + ((runwayMonths - 6) / 6) * 25; }
  else { liquidityScore = Math.min(100, 75 + ((runwayMonths - 12) / 6) * 15); }

  indicators.push({ name: 'Liquidity Resilience', value: Math.round(Math.max(0, Math.min(100, liquidityScore))), tooltip: `Based on ${runwayMonths.toFixed(0)} months cash runway` });

  const altsVal = normalizeToFraction(profile.asset_class_breakdown.alts_pct);
  const cryptoPctVal = getCryptoAllocPct(profile);
  const altsScore = (altsVal + cryptoPctVal) * 200;

  indicators.push({ name: 'Alternatives Exposure', value: Math.round(Math.max(0, Math.min(100, altsScore))), tooltip: cryptoPctVal > 0 ? 'Based on portfolio alternatives and declared crypto allocation' : 'Based on portfolio alternatives allocation' });

  const propertyPct = normalizeToFraction(profile.asset_class_breakdown.property_pct);
  let propertyScore = propertyPct * 200;
  if (profile.personaCues.investing_focus?.includes('PROPERTY_BTL')) {
    propertyScore = Math.min(100, propertyScore + 20);
  }

  indicators.push({ name: 'Property Tilt', value: Math.round(Math.max(0, Math.min(100, propertyScore))), tooltip: propertyPct > 0 ? `Based on ${(propertyPct * 100).toFixed(0)}% property allocation` : 'Based on stated investment focus' });

  return indicators;
}

export function computePersona(profile: InvestorProfile): PersonaResult {
  const traits = computeTraits(profile);

  const matchResult = assignPrimaryPersonaWithMatching(profile, traits);
  const persona = PRIMARY_PERSONAS[matchResult.code];

  const portfolioTraits = derivePortfolioTraits(profile);
  const whyFitsBullets = buildWhyFitsBullets(profile, traits);
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
    match_score: matchResult.match_score,
    match_confidence: matchResult.match_confidence,
  };
}
