import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type IntakeMethod = 'manual' | 'upload' | 'connect' | 'advisor';

export type AgeBand = '25_34' | '35_44' | '45_54' | '55_64' | '65_plus' | null;
export type PortfolioStage = 'ACCUMULATING' | 'STARTING_DRAWDOWN' | 'PRIMARILY_DRAWDOWN' | null;
export type InvestingFocus = 'FUNDS_ETFS' | 'INDIVIDUAL_SHARES' | 'PROPERTY_BTL' | 'PRIVATE_BUSINESS' | 'CRYPTO' | 'OTHER';
export type AdviserUsage = 'SELF_DIRECTED' | 'SOMETIMES_ADVISED' | 'FULL_SERVICE_ADVISER' | 'I_AM_AN_ADVISER' | null;

// Structural cue band types for deterministic inputs
export type DBIncomeCoverageBand = 'LT_25' | '25_50' | '50_75' | 'GT_75' | 'NOT_SURE' | null;
export type PrivateBusinessWealthBand = 'LT_10' | '10_25' | '25_50' | 'GT_50' | 'NOT_SURE' | null;
export type EmployerStockAllocBand = 'LT_5' | '5_15' | '15_30' | 'GT_30' | 'NOT_SURE' | null;
export type CryptoAllocBand = 'LT_5' | '5_10' | '10_25' | 'GT_25' | 'NOT_SURE' | null;

export interface PersonaCues {
  age_band: AgeBand;
  portfolio_stage: PortfolioStage;
  investing_focus: InvestingFocus[];
  // Defined Benefit pension
  has_defined_benefit_pension: boolean | null;
  db_income_coverage_band: DBIncomeCoverageBand;
  // Private business / PE
  owns_business: boolean | null;
  private_business_wealth_band: PrivateBusinessWealthBand;
  // Employer stock / RSUs
  has_employer_stock: boolean | null;
  employer_stock_alloc_band: EmployerStockAllocBand;
  // Crypto / digital assets (renamed from has_meaningful_crypto)
  has_crypto: boolean | null;
  crypto_alloc_band: CryptoAllocBand;
  // Other cues
  adviser_usage: AdviserUsage;
  is_cross_border: boolean | null;
}

export interface IntakeData {
  intake_method: IntakeMethod;
  full_name: string;
  email: string;
  investor_type: string;
  region: string;
  annual_income_gbp: number;
  annual_essential_spend_gbp: number;
  liquid_cash_gbp: number;
  total_investable_assets_gbp: number;
  regular_monthly_contribution_gbp: number;
  primary_goal: string;
  time_horizon_years: string;
  risk_comfort: string;
  personaCues: PersonaCues;
}

export interface Holding {
  id: string;
  instrument_name: string;
  ticker: string;
  wrapper: string;
  asset_class: string;
  region: string;
  value_gbp: number;
  illiquid: boolean;
  // Advanced fields
  currency: string;
  instrument_type: string;
  isin: string | null;
  cost_basis_gbp: number | null;
  acquisition_date: string | null;
  notes: string | null;
  // Computed unrealized gain (derived)
  unrealised_gain_gbp?: number | null;
  unrealised_gain_pct?: number | null;
}

export interface PortfolioSummary {
  total_investable_value: number;
  largest_line_pct: number;
  illiquid_pct: number;
  holding_count: number;
  total_unrealised_gain_gbp: number;
  holdings_with_cost_basis: number;
}

export interface AllocationBreakdown {
  name: string;
  value_gbp: number;
  weight_pct: number;
}

export interface TopHoldingEntry {
  name: string;
  wrapper: string;
  asset_class: string;
  region: string;
  value_gbp: number;
  weight_pct: number;
  illiquid: boolean;
}

export interface PortfolioBreakdowns {
  total_value: number;
  by_asset_class: AllocationBreakdown[];
  by_wrapper: AllocationBreakdown[];
  top_holdings: TopHoldingEntry[];
}

export type SafetyStatus = 'GREEN' | 'AMBER' | 'RED';
export type OverallStatusCode = 'ALL_CLEAR' | 'CAUTION' | 'ACTION_REQUIRED';

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

/**
 * T1-T6 Trait Scores (0.0-1.0 scale)
 * All traits are deterministic and derived from Step 3 + Step 4 inputs.
 */
export interface PersonaTraits {
  // T1: Risk appetite - from risk_comfort, time_horizon, equity_pct, alts_pct
  risk_appetite: number;
  // T2: Alternatives bias - from crypto_alloc_band, alts_pct, crypto_pct, investing_focus CRYPTO
  alternatives_bias: number;
  // T3: Property bias - from property_pct, investing_focus PROPERTY_BTL
  property_bias: number;
  // T4: Liquidity comfort - from cash_runway_months, cash_pct, illiquid_pct
  liquidity_comfort: number;
  // T5: Income orientation - from portfolio_stage (drawdown), primary_goal (income), risk_comfort
  income_orientation: number;
  // T6: Complexity proxy - DB pension, business, employer stock, cross-border, portfolio value
  complexity_proxy: number;
}

export type TraitIntensity = 'Light' | 'Moderate' | 'Strong';

export interface PortfolioTrait {
  name: string;
  intensity: TraitIntensity;
  detail: string;
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

export interface AnalysisResult {
  safety_lights: SafetyLightsResult;
  persona: PersonaResult | null;
}

export type AnalysisStatus = 'idle' | 'loading' | 'ready' | 'error';

// ============================================
// Step 6: Beliefs Data Contract
// ============================================

export type BeliefQuestionId = 
  | 'Q_VOLATILITY_COMFORT'
  | 'Q_QUALITY'
  | 'Q_VALUE'
  | 'Q_TECH'
  | 'Q_UK_BIAS'
  | 'Q_ESG'
  | 'Q_INFLATION'
  | 'Q_SMALL_CAP';

export type AxisCode = 
  | 'QUALITY_TILT'
  | 'VALUE_TILT'
  | 'TECH_TILT'
  | 'UK_BIAS'
  | 'ESG_TILT'
  | 'INFLATION_HEDGE_TILT'
  | 'SMALL_CAP_TILT'
  | 'VOLATILITY_AVERSION';

export type TiltDirection = 'TOWARDS' | 'AWAY' | 'NEUTRAL';
export type TiltIntensity = 'NEUTRAL' | 'LIGHT' | 'MODERATE' | 'STRONG';
export type TiltsGateReason = 
  | 'NO_RED_FLAGS'
  | 'RED_LIQUIDITY'
  | 'RED_CONCENTRATION'
  | 'RED_ILLIQUIDS'
  | 'MULTIPLE_RED_FLAGS';

export interface BeliefResponse {
  answer: 1 | 2 | 3 | 4 | 5;
  normalised: number; // -1 to +1
  label: string;
}

export interface AxisIntensity {
  direction: TiltDirection;
  intensity: TiltIntensity;
}

export interface TiltProfileEntry {
  axis_code: AxisCode;
  direction: TiltDirection;
  intensity: TiltIntensity;
  score: number;
  description: string;
}

export interface BeliefsState {
  version: string;
  completed: boolean;
  completed_at: string | null;
  responses: Partial<Record<BeliefQuestionId, BeliefResponse>>;
  axis_scores: Partial<Record<AxisCode, number>>;
  axis_intensities: Partial<Record<AxisCode, AxisIntensity>>;
  tilt_profile: TiltProfileEntry[];
  tilts_allowed: boolean;
  tilts_gate_reason: TiltsGateReason;
}

export interface AnalysisState {
  status: AnalysisStatus;
  result: AnalysisResult | null;
  error: string | null;
}

// ============================================
// Step 7: Illustrative Scenario Data Contract
// ============================================

export type ScenarioType = 'GUARDRAIL_FIRST' | 'PREFERENCE_LEANING' | 'NEUTRAL_BASELINE';
export type DirectionalDelta = 'INCREASE' | 'DECREASE' | 'NEUTRAL';
export type TiltApplicationStatus = 'APPLIED' | 'PARTIALLY_APPLIED' | 'CONSTRAINED' | 'LOCKED' | 'NOT_APPLIED';

export interface AllocationBandDebug {
  scenarioStrength: number;      // Scenario strength multiplier (0, 0.25, or 0.6)
  maxShift: number;              // Maximum shift in pp for this scenario
  halfWidth: number;             // Half-width for symmetric range
  rawPressure: number;           // Raw pressure from beliefs [-1, +1]
  centreShift: number;           // pressure * scenarioStrength * maxShift
  unclampedCentre: number;       // current + centreShift (before clamps)
  clampedCentre: number;         // centre after constraint clamping
  unclampedMin: number;          // centre - halfWidth (before clamps)
  unclampedMax: number;          // centre + halfWidth (before clamps)
  bindingConstraints: string[];  // Which constraints were binding
}

export interface AllocationBand {
  sleeve: string;
  current_pct: number;
  illustrative_low_pct: number;
  illustrative_high_pct: number;
  direction: DirectionalDelta;
  midpoint_pct: number;
  pressure: number; // Scaled pressure used for display
  clamped: boolean; // True if range was constrained by Safety Light budgets
  debug: AllocationBandDebug; // Detailed debug info for verification
}

// Sleeve pressure scores derived from belief axes
export interface SleevePressures {
  equity: number;
  bond: number;
  cash: number;
  property: number;
  alternatives: number;
  uk: number;
  global: number;
}

export interface AppliedTiltEntry {
  axis_code: AxisCode;
  axis_label: string;
  status: TiltApplicationStatus;
  constraint_reason: string | null;
}

export interface BindingConstraint {
  constraint_type: 'LIQUIDITY' | 'CONCENTRATION' | 'ILLIQUIDS';
  description: string;
  current_value: number;
  threshold: number;
}

export interface IllustrativeScenario {
  scenario_type: ScenarioType;
  scenario_label: string;
  scenario_description: string;
  asset_class_bands: AllocationBand[];
  region_bands: AllocationBand[];
  wrapper_bands: AllocationBand[];
  applied_tilts: AppliedTiltEntry[];
  binding_constraints: BindingConstraint[];
  tilts_applied_count: number;
  tilts_constrained_count: number;
}

export interface ScenarioState {
  version: string;
  computed: boolean;
  computed_at: string | null;
  active_scenario: ScenarioType;
  scenarios: IllustrativeScenario[];
  guardrails_binding: boolean;
  tilts_locked_banner: boolean;
  sleeve_pressures: SleevePressures | null; // Persisted for UI display
}

interface OnboardingV2State {
  intake: IntakeData;
  holdings: Holding[];
  summary: PortfolioSummary;
  analysis: AnalysisState;
  beliefs: BeliefsState;
  scenario: ScenarioState;
  
  updateIntake: (partial: Partial<IntakeData>) => void;
  updatePersonaCues: (partial: Partial<PersonaCues>) => void;
  setHoldings: (holdings: Holding[]) => void;
  addHolding: () => void;
  updateHolding: (id: string, partial: Partial<Holding>) => void;
  removeHolding: (id: string) => void;
  recalculateSummary: () => void;
  
  setAnalysisLoading: () => void;
  setAnalysisResult: (result: AnalysisResult) => void;
  setAnalysisError: (error: string) => void;
  resetAnalysis: () => void;
  
  // Beliefs actions
  setBeliefResponse: (questionId: BeliefQuestionId, answer: 1 | 2 | 3 | 4 | 5) => void;
  computeBeliefsScores: () => void;
  completeBeliefsStep: () => void;
  resetBeliefs: () => void;
  
  // Scenario actions
  computeScenarios: () => void;
  setActiveScenario: (scenarioType: ScenarioType) => void;
  completeScenarioStep: () => void;
  resetScenario: () => void;
  
  resetOnboarding: () => void;
}

const generateId = () => `holding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const initialPersonaCues: PersonaCues = {
  age_band: null,
  portfolio_stage: null,
  investing_focus: [],
  has_defined_benefit_pension: null,
  db_income_coverage_band: null,
  owns_business: null,
  private_business_wealth_band: null,
  has_employer_stock: null,
  employer_stock_alloc_band: null,
  has_crypto: null,
  crypto_alloc_band: null,
  adviser_usage: null,
  is_cross_border: null,
};

const initialIntake: IntakeData = {
  intake_method: 'manual',
  full_name: '',
  email: '',
  investor_type: '',
  region: '',
  annual_income_gbp: 0,
  annual_essential_spend_gbp: 0,
  liquid_cash_gbp: 0,
  total_investable_assets_gbp: 0,
  regular_monthly_contribution_gbp: 0,
  primary_goal: '',
  time_horizon_years: '',
  risk_comfort: '',
  personaCues: initialPersonaCues,
};

const createEmptyHolding = (): Holding => ({
  id: generateId(),
  instrument_name: '',
  ticker: '',
  wrapper: '',
  asset_class: '',
  region: '',
  value_gbp: 0,
  illiquid: false,
  currency: 'GBP',
  instrument_type: 'Fund',
  isin: null,
  cost_basis_gbp: null,
  acquisition_date: null,
  notes: null,
});

const initialSummary: PortfolioSummary = {
  total_investable_value: 0,
  largest_line_pct: 0,
  illiquid_pct: 0,
  holding_count: 0,
  total_unrealised_gain_gbp: 0,
  holdings_with_cost_basis: 0,
};

const initialAnalysis: AnalysisState = {
  status: 'idle',
  result: null,
  error: null,
};

const initialBeliefs: BeliefsState = {
  version: '1.0',
  completed: false,
  completed_at: null,
  responses: {},
  axis_scores: {},
  axis_intensities: {},
  tilt_profile: [],
  tilts_allowed: true,
  tilts_gate_reason: 'NO_RED_FLAGS',
};

const initialScenario: ScenarioState = {
  version: '1.0',
  computed: false,
  computed_at: null,
  active_scenario: 'GUARDRAIL_FIRST',
  scenarios: [],
  guardrails_binding: false,
  tilts_locked_banner: false,
  sleeve_pressures: null,
};

// Axis labels for display
const AXIS_LABELS: Record<AxisCode, string> = {
  QUALITY_TILT: 'Quality Tilt',
  VALUE_TILT: 'Value Tilt',
  TECH_TILT: 'Technology Tilt',
  UK_BIAS: 'UK Bias',
  ESG_TILT: 'ESG/Sustainability Tilt',
  INFLATION_HEDGE_TILT: 'Inflation Hedge Tilt',
  SMALL_CAP_TILT: 'Small Cap Tilt',
  VOLATILITY_AVERSION: 'Volatility Aversion',
};

// Belief question answer labels
const ANSWER_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: 'Strongly disagree',
  2: 'Disagree',
  3: 'Neutral',
  4: 'Agree',
  5: 'Strongly agree',
};

// Axis descriptions
const AXIS_DESCRIPTIONS: Record<AxisCode, string> = {
  QUALITY_TILT: 'Shifts exposure towards financially strong, profitable companies.',
  VALUE_TILT: 'Shifts exposure towards cheaper, out-of-favour companies.',
  TECH_TILT: 'Shifts exposure towards technology relative to a neutral baseline.',
  UK_BIAS: 'Shifts exposure towards UK-listed assets relative to global neutral.',
  ESG_TILT: 'Incorporates sustainability criteria into investment selection.',
  INFLATION_HEDGE_TILT: 'Shifts exposure towards inflation-hedging assets.',
  SMALL_CAP_TILT: 'Shifts exposure towards smaller companies for growth potential.',
  VOLATILITY_AVERSION: 'Favors smoother risk profiles over higher volatility.',
};

// Compute normalised score from answer (1-5) -> (-1 to +1)
function normaliseAnswer(answer: 1 | 2 | 3 | 4 | 5): number {
  // 1 (Strongly disagree) → -1.0
  // 2 (Disagree) → -0.5
  // 3 (Neutral) → 0.0
  // 4 (Agree) → +0.5
  // 5 (Strongly agree) → +1.0
  return (answer - 3) / 2;
}

// Compute direction from score (per spec: score > 0.20 → TOWARDS, score < -0.20 → AWAY)
// Boundaries (exactly ±0.20) are classified as NEUTRAL per spec
export function computeDirection(score: number): TiltDirection {
  if (score > 0.20) return 'TOWARDS';
  if (score < -0.20) return 'AWAY';
  return 'NEUTRAL';
}

// Compute intensity from absolute score (per spec)
// |score| < 0.20 → NEUTRAL
// 0.20 ≤ |score| < 0.50 → LIGHT
// 0.50 ≤ |score| < 0.80 → MODERATE
// |score| ≥ 0.80 → STRONG
function computeIntensity(score: number): TiltIntensity {
  const abs = Math.abs(score);
  if (abs >= 0.80) return 'STRONG';
  if (abs >= 0.50) return 'MODERATE';
  if (abs >= 0.20) return 'LIGHT';
  return 'NEUTRAL';
}

// ============================================
// TEST HARNESS: Verify axis scoring is correct
// ============================================
interface TestResult {
  axis: AxisCode;
  expectedScore: number;
  actualScore: number;
  expectedDirection: TiltDirection;
  actualDirection: TiltDirection;
  expectedIntensity: TiltIntensity;
  actualIntensity: TiltIntensity;
  pass: boolean;
}

export function runBeliefScoringTest(): { passed: boolean; results: TestResult[] } {
  // Test Case Inputs (exact from spec):
  // Volatility comfort = Strongly disagree → −1.00
  // Quality preference = Strongly agree → +1.00
  // Value preference = Disagree → −0.50
  // Tech belief = Disagree → −0.50
  // UK tilt = Neutral → 0.00
  // ESG = Disagree → −0.50
  // Inflation concern = Strongly agree → +1.00
  // Small cap comfort = Strongly disagree → −1.00
  
  const testInputs: Record<BeliefQuestionId, 1 | 2 | 3 | 4 | 5> = {
    Q_VOLATILITY_COMFORT: 1, // Strongly disagree → -1.0
    Q_QUALITY: 5,            // Strongly agree → +1.0
    Q_VALUE: 2,              // Disagree → -0.5
    Q_TECH: 2,               // Disagree → -0.5
    Q_UK_BIAS: 3,            // Neutral → 0.0
    Q_ESG: 2,                // Disagree → -0.5
    Q_INFLATION: 5,          // Strongly agree → +1.0
    Q_SMALL_CAP: 1,          // Strongly disagree → -1.0
  };
  
  // Expected Axis Outputs (from spec):
  const expectedOutputs: Record<AxisCode, { score: number; direction: TiltDirection; intensity: TiltIntensity }> = {
    QUALITY_TILT: { score: 1.00, direction: 'TOWARDS', intensity: 'STRONG' },
    VALUE_TILT: { score: -0.50, direction: 'AWAY', intensity: 'MODERATE' },
    TECH_TILT: { score: -0.50, direction: 'AWAY', intensity: 'MODERATE' },
    UK_BIAS: { score: 0.00, direction: 'NEUTRAL', intensity: 'NEUTRAL' },
    ESG_TILT: { score: -0.50, direction: 'AWAY', intensity: 'MODERATE' },
    INFLATION_HEDGE_TILT: { score: 1.00, direction: 'TOWARDS', intensity: 'STRONG' },
    SMALL_CAP_TILT: { score: -1.00, direction: 'AWAY', intensity: 'STRONG' },
    VOLATILITY_AVERSION: { score: 1.00, direction: 'TOWARDS', intensity: 'STRONG' }, // Inverted from -1.0 comfort
  };
  
  // Compute normalised responses
  const normalisedResponses: Record<BeliefQuestionId, number> = {} as Record<BeliefQuestionId, number>;
  for (const [qId, answer] of Object.entries(testInputs)) {
    normalisedResponses[qId as BeliefQuestionId] = normaliseAnswer(answer as 1 | 2 | 3 | 4 | 5);
  }
  
  // Compute axis scores (same logic as computeBeliefsScores)
  const axisScores: Record<AxisCode, number> = {
    QUALITY_TILT: normalisedResponses.Q_QUALITY,
    VALUE_TILT: normalisedResponses.Q_VALUE,
    TECH_TILT: normalisedResponses.Q_TECH,
    UK_BIAS: normalisedResponses.Q_UK_BIAS,
    ESG_TILT: normalisedResponses.Q_ESG,
    INFLATION_HEDGE_TILT: normalisedResponses.Q_INFLATION,
    SMALL_CAP_TILT: normalisedResponses.Q_SMALL_CAP,
    VOLATILITY_AVERSION: -normalisedResponses.Q_VOLATILITY_COMFORT, // INVERTED
  };
  
  // Run comparisons
  const results: TestResult[] = [];
  const allAxes: AxisCode[] = [
    'QUALITY_TILT', 'VALUE_TILT', 'TECH_TILT', 'UK_BIAS',
    'ESG_TILT', 'INFLATION_HEDGE_TILT', 'SMALL_CAP_TILT', 'VOLATILITY_AVERSION'
  ];
  
  for (const axis of allAxes) {
    const expected = expectedOutputs[axis];
    const actualScore = axisScores[axis];
    const actualDirection = computeDirection(actualScore);
    const actualIntensity = computeIntensity(actualScore);
    
    const pass = 
      Math.abs(actualScore - expected.score) < 0.001 &&
      actualDirection === expected.direction &&
      actualIntensity === expected.intensity;
    
    results.push({
      axis,
      expectedScore: expected.score,
      actualScore,
      expectedDirection: expected.direction,
      actualDirection,
      expectedIntensity: expected.intensity,
      actualIntensity,
      pass,
    });
  }
  
  const passed = results.every(r => r.pass);
  
  // Log results to console for debugging
  console.log('=== BELIEF SCORING TEST ===');
  console.log(`Overall: ${passed ? 'PASSED ✓' : 'FAILED ✗'}`);
  for (const r of results) {
    const status = r.pass ? '✓' : '✗';
    console.log(`${status} ${r.axis}: score=${r.actualScore} (expected ${r.expectedScore}), dir=${r.actualDirection} (expected ${r.expectedDirection}), int=${r.actualIntensity} (expected ${r.expectedIntensity})`);
  }
  
  return { passed, results };
}

function computeHoldingWithGains(holding: Holding): Holding {
  if (holding.value_gbp > 0 && holding.cost_basis_gbp != null && holding.cost_basis_gbp > 0) {
    const gain = holding.value_gbp - holding.cost_basis_gbp;
    const gainPct = (gain / holding.cost_basis_gbp) * 100;
    return {
      ...holding,
      unrealised_gain_gbp: gain,
      unrealised_gain_pct: gainPct,
    };
  }
  return {
    ...holding,
    unrealised_gain_gbp: null,
    unrealised_gain_pct: null,
  };
}

function computeSummaryFromHoldings(holdings: Holding[]): PortfolioSummary {
  const validHoldings = holdings.filter((h) => h.value_gbp > 0);
  const total = validHoldings.reduce((sum, h) => sum + h.value_gbp, 0);
  const largestValue = validHoldings.length > 0
    ? Math.max(...validHoldings.map((h) => h.value_gbp))
    : 0;
  const illiquidValue = validHoldings
    .filter((h) => h.illiquid)
    .reduce((sum, h) => sum + h.value_gbp, 0);

  // Compute unrealized gains for holdings with cost basis
  const holdingsWithCostBasis = validHoldings.filter(
    (h) => h.cost_basis_gbp != null && h.cost_basis_gbp > 0
  );
  const totalUnrealisedGain = holdingsWithCostBasis.reduce((sum, h) => {
    const gain = h.value_gbp - (h.cost_basis_gbp || 0);
    return sum + gain;
  }, 0);

  return {
    total_investable_value: total,
    largest_line_pct: total > 0 ? (largestValue / total) * 100 : 0,
    illiquid_pct: total > 0 ? (illiquidValue / total) * 100 : 0,
    holding_count: validHoldings.length,
    total_unrealised_gain_gbp: totalUnrealisedGain,
    holdings_with_cost_basis: holdingsWithCostBasis.length,
  };
}

function normalizeKey(value: string | undefined | null): string {
  if (!value || value.trim() === '') return 'Other';
  const trimmed = value.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

function normalizeWrapper(value: string | undefined | null): string {
  if (!value || value.trim() === '') return 'Other';
  const trimmed = value.trim().toUpperCase();
  const wrapperMap: Record<string, string> = {
    'ISA': 'ISA',
    'SIPP': 'SIPP',
    'GIA': 'GIA',
    'CASH': 'Cash',
    'EIS': 'EIS/SEIS',
    'SEIS': 'EIS/SEIS',
    'EIS/SEIS': 'EIS/SEIS',
    'VCT': 'VCT',
  };
  return wrapperMap[trimmed] || (trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase());
}

export function computePortfolioBreakdowns(holdings: Holding[]): PortfolioBreakdowns {
  const validHoldings = holdings.filter((h) => h.value_gbp > 0);
  const total = validHoldings.reduce((sum, h) => sum + h.value_gbp, 0);

  if (total <= 0) {
    return {
      total_value: 0,
      by_asset_class: [],
      by_wrapper: [],
      top_holdings: [],
    };
  }

  // Group by asset class with normalization
  const assetClassMap = new Map<string, number>();
  validHoldings.forEach((h) => {
    const key = normalizeKey(h.asset_class);
    assetClassMap.set(key, (assetClassMap.get(key) || 0) + h.value_gbp);
  });
  const byAssetClass: AllocationBreakdown[] = Array.from(assetClassMap.entries())
    .map(([name, value_gbp]) => ({
      name,
      value_gbp,
      weight_pct: (value_gbp / total) * 100,
    }))
    .sort((a, b) => b.value_gbp - a.value_gbp);

  // Group by wrapper with normalization
  const wrapperMap = new Map<string, number>();
  validHoldings.forEach((h) => {
    const key = normalizeWrapper(h.wrapper);
    wrapperMap.set(key, (wrapperMap.get(key) || 0) + h.value_gbp);
  });
  const byWrapper: AllocationBreakdown[] = Array.from(wrapperMap.entries())
    .map(([name, value_gbp]) => ({
      name,
      value_gbp,
      weight_pct: (value_gbp / total) * 100,
    }))
    .sort((a, b) => b.value_gbp - a.value_gbp);

  // Top 5 holdings with normalized display values
  const topHoldings: TopHoldingEntry[] = [...validHoldings]
    .sort((a, b) => b.value_gbp - a.value_gbp)
    .slice(0, 5)
    .map((h) => ({
      name: h.instrument_name || h.ticker || 'Unnamed',
      wrapper: normalizeWrapper(h.wrapper),
      asset_class: normalizeKey(h.asset_class),
      region: normalizeKey(h.region),
      value_gbp: h.value_gbp,
      weight_pct: (h.value_gbp / total) * 100,
      illiquid: h.illiquid,
    }));

  return {
    total_value: total,
    by_asset_class: byAssetClass,
    by_wrapper: byWrapper,
    top_holdings: topHoldings,
  };
}

export const useOnboardingV2Store = create<OnboardingV2State>()(
  persist(
    (set, get) => ({
      intake: initialIntake,
      holdings: [createEmptyHolding()],
      summary: initialSummary,
      analysis: initialAnalysis,
      beliefs: initialBeliefs,
      scenario: initialScenario,

      updateIntake: (partial) => {
        set((state) => ({
          intake: { ...state.intake, ...partial },
        }));
      },

      updatePersonaCues: (partial) => {
        set((state) => ({
          intake: {
            ...state.intake,
            personaCues: { ...state.intake.personaCues, ...partial },
          },
        }));
      },

      setHoldings: (holdings) => {
        const holdingsWithGains = holdings.map(computeHoldingWithGains);
        set({
          holdings: holdingsWithGains,
          summary: computeSummaryFromHoldings(holdingsWithGains),
        });
      },

      addHolding: () => {
        set((state) => ({
          holdings: [...state.holdings, createEmptyHolding()],
        }));
      },

      updateHolding: (id, partial) => {
        set((state) => {
          const newHoldings = state.holdings.map((h) =>
            h.id === id ? computeHoldingWithGains({ ...h, ...partial }) : h
          );
          return {
            holdings: newHoldings,
            summary: computeSummaryFromHoldings(newHoldings),
          };
        });
      },

      removeHolding: (id) => {
        set((state) => {
          const newHoldings = state.holdings.filter((h) => h.id !== id);
          return {
            holdings: newHoldings,
            summary: computeSummaryFromHoldings(newHoldings),
          };
        });
      },

      recalculateSummary: () => {
        set((state) => ({
          summary: computeSummaryFromHoldings(state.holdings),
        }));
      },

      setAnalysisLoading: () => {
        set({
          analysis: {
            status: 'loading',
            result: null,
            error: null,
          },
        });
      },

      setAnalysisResult: (result) => {
        set({
          analysis: {
            status: 'ready',
            result,
            error: null,
          },
        });
        // Immediately compute beliefs gate status from new safety lights
        const safetyLights = result?.safety_lights;
        if (safetyLights) {
          let tiltsAllowed = true;
          let gateReason: TiltsGateReason = 'NO_RED_FLAGS';
          const redFlags: string[] = [];
          if (safetyLights.liquidity === 'RED') redFlags.push('RED_LIQUIDITY');
          if (safetyLights.concentration === 'RED') redFlags.push('RED_CONCENTRATION');
          if (safetyLights.illiquids === 'RED') redFlags.push('RED_ILLIQUIDS');
          if (redFlags.length >= 2) {
            tiltsAllowed = false;
            gateReason = 'MULTIPLE_RED_FLAGS';
          } else if (redFlags.length === 1) {
            tiltsAllowed = false;
            gateReason = redFlags[0] as TiltsGateReason;
          }
          set((state) => ({
            beliefs: {
              ...state.beliefs,
              tilts_allowed: tiltsAllowed,
              tilts_gate_reason: gateReason,
            },
          }));
        }
      },

      setAnalysisError: (error) => {
        set({
          analysis: {
            status: 'error',
            result: null,
            error,
          },
        });
      },

      resetAnalysis: () => {
        set({ analysis: initialAnalysis });
      },

      // Beliefs actions
      setBeliefResponse: (questionId, answer) => {
        const normalised = normaliseAnswer(answer);
        const label = ANSWER_LABELS[answer];
        set((state) => ({
          beliefs: {
            ...state.beliefs,
            responses: {
              ...state.beliefs.responses,
              [questionId]: { answer, normalised, label },
            },
          },
        }));
      },

      computeBeliefsScores: () => {
        const state = get();
        const responses = state.beliefs.responses;
        const safetyLights = state.analysis.result?.safety_lights;

        // Compute tilts_allowed and gate_reason from safety lights
        let tiltsAllowed = true;
        let gateReason: TiltsGateReason = 'NO_RED_FLAGS';
        if (safetyLights) {
          const redFlags: string[] = [];
          if (safetyLights.liquidity === 'RED') redFlags.push('RED_LIQUIDITY');
          if (safetyLights.concentration === 'RED') redFlags.push('RED_CONCENTRATION');
          if (safetyLights.illiquids === 'RED') redFlags.push('RED_ILLIQUIDS');
          if (redFlags.length >= 2) {
            tiltsAllowed = false;
            gateReason = 'MULTIPLE_RED_FLAGS';
          } else if (redFlags.length === 1) {
            tiltsAllowed = false;
            gateReason = redFlags[0] as TiltsGateReason;
          }
        }

        // Compute axis scores
        const axisScores: Partial<Record<AxisCode, number>> = {};
        const getResponse = (qId: BeliefQuestionId) => responses[qId]?.normalised ?? 0;

        axisScores.QUALITY_TILT = getResponse('Q_QUALITY');
        axisScores.VALUE_TILT = getResponse('Q_VALUE');
        axisScores.TECH_TILT = getResponse('Q_TECH');
        axisScores.UK_BIAS = getResponse('Q_UK_BIAS');
        axisScores.ESG_TILT = getResponse('Q_ESG');
        axisScores.INFLATION_HEDGE_TILT = getResponse('Q_INFLATION');
        axisScores.SMALL_CAP_TILT = getResponse('Q_SMALL_CAP');
        axisScores.VOLATILITY_AVERSION = -getResponse('Q_VOLATILITY_COMFORT'); // Inverse

        // Compute axis intensities
        const axisIntensities: Partial<Record<AxisCode, AxisIntensity>> = {};
        const allAxes: AxisCode[] = [
          'QUALITY_TILT', 'VALUE_TILT', 'TECH_TILT', 'UK_BIAS',
          'ESG_TILT', 'INFLATION_HEDGE_TILT', 'SMALL_CAP_TILT', 'VOLATILITY_AVERSION'
        ];
        for (const axis of allAxes) {
          const score = axisScores[axis] ?? 0;
          axisIntensities[axis] = {
            direction: computeDirection(score),
            intensity: computeIntensity(score),
          };
        }

        // Build tilt profile
        const tiltProfile: TiltProfileEntry[] = allAxes.map((axis) => ({
          axis_code: axis,
          direction: axisIntensities[axis]!.direction,
          intensity: axisIntensities[axis]!.intensity,
          score: axisScores[axis] ?? 0,
          description: AXIS_DESCRIPTIONS[axis],
        }));

        set((state) => ({
          beliefs: {
            ...state.beliefs,
            axis_scores: axisScores,
            axis_intensities: axisIntensities,
            tilt_profile: tiltProfile,
            tilts_allowed: tiltsAllowed,
            tilts_gate_reason: gateReason,
          },
        }));
      },

      completeBeliefsStep: () => {
        const state = get();
        state.computeBeliefsScores();
        set((state) => ({
          beliefs: {
            ...state.beliefs,
            completed: true,
            completed_at: new Date().toISOString(),
          },
        }));
      },

      resetBeliefs: () => {
        set({ beliefs: initialBeliefs });
      },

      // Scenario actions
      computeScenarios: () => {
        const state = get();
        const beliefs = state.beliefs;
        const analysis = state.analysis.result;
        const holdings = state.holdings;
        
        if (!analysis) return;
        
        const safetyLights = analysis.safety_lights;
        const tiltsAllowed = beliefs.tilts_allowed;
        
        // ============================================
        // 1) SCENARIO PARAMETERS (per new spec)
        // ============================================
        // Scenario strength multiplier for centre shift
        const SCENARIO_STRENGTH: Record<ScenarioType, number> = {
          NEUTRAL_BASELINE: 0,      // No centre shift
          GUARDRAIL_FIRST: 0.25,    // 25% of max shift
          PREFERENCE_LEANING: 0.6,  // 60% of max shift
        };
        
        // Maximum shift in percentage points
        const MAX_SHIFT: Record<ScenarioType, number> = {
          NEUTRAL_BASELINE: 0,      // No shift
          GUARDRAIL_FIRST: 4,       // Up to 4pp shift
          PREFERENCE_LEANING: 10,   // Up to 10pp shift
        };
        
        // Half-width for symmetric range around centre
        const HALF_WIDTH: Record<ScenarioType, number> = {
          NEUTRAL_BASELINE: 2,      // ±2pp range
          GUARDRAIL_FIRST: 3,       // ±3pp range  
          PREFERENCE_LEANING: 6,    // ±6pp range
        };
        
        // Minimum meaningful range width (pp) - ensures ranges are visually meaningful
        // Applied only to GUARDRAIL_FIRST and PREFERENCE_LEANING (not NEUTRAL_BASELINE)
        const MIN_RANGE_WIDTH_PP = 2.0;
        
        // ============================================
        // 2) COMPUTE CURRENT ALLOCATIONS
        // ============================================
        const validHoldings = holdings.filter(h => h.value_gbp > 0);
        const totalValue = validHoldings.reduce((sum, h) => sum + h.value_gbp, 0);
        
        const computeCurrentAllocation = (groupByKey: keyof Holding): Record<string, number> => {
          const groups: Record<string, number> = {};
          validHoldings.forEach(h => {
            const key = String(h[groupByKey] || 'Other');
            groups[key] = (groups[key] || 0) + h.value_gbp;
          });
          const result: Record<string, number> = {};
          Object.entries(groups).forEach(([k, v]) => {
            result[k] = totalValue > 0 ? (v / totalValue) * 100 : 0;
          });
          return result;
        };
        
        const currentAssetClass = computeCurrentAllocation('asset_class');
        const currentRegion = computeCurrentAllocation('region');
        const currentWrapper = computeCurrentAllocation('wrapper');
        
        // ============================================
        // 3) COMPUTE RAW DIRECTIONAL PRESSURE FROM BELIEFS (per spec 2.2)
        // ============================================
        const axisScores = beliefs.axis_scores;
        
        // Clamp to [-1, +1]
        const clampPressure = (val: number) => Math.max(-1, Math.min(1, val));
        
        // Extract axis scores
        const qualityScore = axisScores.QUALITY_TILT ?? 0;
        const valueScore = axisScores.VALUE_TILT ?? 0;
        const techScore = axisScores.TECH_TILT ?? 0;
        const smallCapScore = axisScores.SMALL_CAP_TILT ?? 0;
        const esgScore = axisScores.ESG_TILT ?? 0;
        const inflationScore = axisScores.INFLATION_HEDGE_TILT ?? 0;
        const volatilityAversion = axisScores.VOLATILITY_AVERSION ?? 0;
        const ukBias = axisScores.UK_BIAS ?? 0;
        
        // Safety Light constraint flags
        const liquidityIsConstrained = safetyLights.liquidity === 'RED' || safetyLights.liquidity === 'AMBER';
        const concentrationIsConstrained = safetyLights.concentration === 'RED' || safetyLights.concentration === 'AMBER';
        const illiquidsIsConstrained = safetyLights.illiquids === 'RED' || safetyLights.illiquids === 'AMBER';
        
        // Equity pressure: smallCap(+), tech(+), value(+small), quality(+small), volatilityAversion(−)
        const equityPressure = clampPressure(
          smallCapScore * 0.3 + techScore * 0.3 + valueScore * 0.15 + qualityScore * 0.15 - volatilityAversion * 0.4
        );
        
        // Bond pressure: volatilityAversion(+), inflationHedge influence
        const bondPressure = clampPressure(
          volatilityAversion * 0.4 + inflationScore * 0.2
        );
        
        // Cash pressure: volatilityAversion(+), plus liquidity guardrail needs
        let cashPressure = clampPressure(volatilityAversion * 0.3);
        // Boost cash pressure if liquidity is amber (runway protection)
        if (liquidityIsConstrained) {
          cashPressure = clampPressure(cashPressure + 0.3);
        }
        
        // Property pressure: inflation hedge(+), reduced to 0 if illiquids is amber/red
        let propertyPressure = clampPressure(inflationScore * 0.5);
        if (illiquidsIsConstrained) {
          propertyPressure = 0; // Cannot increase property exposure
        }
        
        // Alternatives pressure: esg(+), inflation(+), reduced if illiquids constrained
        let alternativesPressure = clampPressure(inflationScore * 0.3 + esgScore * 0.2);
        if (illiquidsIsConstrained) {
          alternativesPressure = Math.min(0, alternativesPressure); // Can only decrease
        }
        
        // Regional pressures: UK bias axis only
        const ukPressure = clampPressure(ukBias);
        const globalPressure = clampPressure(-ukBias); // Inverse for coherence
        
        const sleevePressures: SleevePressures = {
          equity: equityPressure,
          bond: bondPressure,
          cash: cashPressure,
          property: propertyPressure,
          alternatives: alternativesPressure,
          uk: ukPressure,
          global: globalPressure,
        };
        
        // Map sleeve names to pressure keys
        const getSleeveKey = (sleeve: string): keyof SleevePressures | null => {
          const lowerSleeve = sleeve.toLowerCase();
          if (lowerSleeve.includes('equity') || lowerSleeve.includes('stock')) return 'equity';
          if (lowerSleeve.includes('bond') || lowerSleeve.includes('fixed')) return 'bond';
          if (lowerSleeve.includes('cash') || lowerSleeve.includes('money market')) return 'cash';
          if (lowerSleeve.includes('property') || lowerSleeve.includes('real estate')) return 'property';
          if (lowerSleeve.includes('alternative') || lowerSleeve.includes('commodity') || lowerSleeve.includes('hedge')) return 'alternatives';
          if (lowerSleeve.includes('uk') || lowerSleeve.includes('united kingdom')) return 'uk';
          if (lowerSleeve.includes('global') || lowerSleeve.includes('international') || lowerSleeve.includes('us') || lowerSleeve.includes('emerging')) return 'global';
          return null;
        };
        
        // ============================================
        // 4) CREATE ALLOCATION BANDS (centre-shifting model)
        // Formula: centre = current + (pressure * scenario_strength * max_shift)
        //          min = centre - half_width
        //          max = centre + half_width
        // ============================================
        const createBands = (
          current: Record<string, number>,
          scenarioType: ScenarioType
        ): AllocationBand[] => {
          const scenarioStrength = SCENARIO_STRENGTH[scenarioType];
          const maxShift = MAX_SHIFT[scenarioType];
          const halfWidth = HALF_WIDTH[scenarioType];
          
          return Object.entries(current).map(([sleeve, currentPct]) => {
            // Get raw pressure for this sleeve [-1, +1]
            const pressureKey = getSleeveKey(sleeve);
            const rawPressure = pressureKey ? sleevePressures[pressureKey] : 0;
            
            // ============================================
            // 1) COMPUTE CENTRE SHIFT
            // centre = current + (pressure * scenario_strength * max_shift)
            // ============================================
            const centreShift = rawPressure * scenarioStrength * maxShift;
            let unclampedCentre = currentPct + centreShift;
            let clampedCentre = unclampedCentre;
            
            const bindingConstraints: string[] = [];
            const lowerSleeve = sleeve.toLowerCase();
            
            // ============================================
            // 2) APPLY CENTRE CONSTRAINTS (before building range)
            // Concentration: do not allow equity centre to move UP
            // Liquidity: do not allow cash centre to move DOWN
            // Illiquids: do not allow property centre to move UP
            // ============================================
            if (concentrationIsConstrained && (lowerSleeve.includes('equity') || lowerSleeve.includes('stock'))) {
              // Do not allow equity centre to move up
              if (clampedCentre > currentPct) {
                clampedCentre = currentPct;
                bindingConstraints.push('concentration');
              }
            }
            
            if (liquidityIsConstrained && (lowerSleeve.includes('cash') || lowerSleeve.includes('money market'))) {
              // Do not allow cash centre to move down
              if (clampedCentre < currentPct) {
                clampedCentre = currentPct;
                bindingConstraints.push('liquidity');
              }
            }
            
            if (illiquidsIsConstrained && (lowerSleeve.includes('property') || lowerSleeve.includes('alternative') || lowerSleeve.includes('private'))) {
              // Do not allow property/alternatives centre to move up
              if (clampedCentre > currentPct) {
                clampedCentre = currentPct;
                bindingConstraints.push('illiquids');
              }
            }
            
            // ============================================
            // 3) BUILD SYMMETRIC RANGE AROUND (CLAMPED) CENTRE
            // min = centre - half_width
            // max = centre + half_width
            // ============================================
            const unclampedMin = unclampedCentre - halfWidth;
            const unclampedMax = unclampedCentre + halfWidth;
            
            let lowPct = clampedCentre - halfWidth;
            let highPct = clampedCentre + halfWidth;
            
            // ============================================
            // 3b) APPLY MINIMUM RANGE WIDTH (non-neutral scenarios only)
            // Ensures ranges are visually meaningful even for tiny pressures
            // ============================================
            if (scenarioType !== 'NEUTRAL_BASELINE') {
              const currentWidth = highPct - lowPct;
              if (currentWidth < MIN_RANGE_WIDTH_PP) {
                const expansionNeeded = (MIN_RANGE_WIDTH_PP - currentWidth) / 2;
                lowPct = lowPct - expansionNeeded;
                highPct = highPct + expansionNeeded;
              }
            }
            
            // Global percentage clamps [0, 100]
            lowPct = Math.max(0, lowPct);
            highPct = Math.min(100, highPct);
            
            // Ensure low <= high
            if (lowPct > highPct) {
              lowPct = highPct;
            }
            
            const clamped = bindingConstraints.length > 0;
            
            // Compute midpoint (should equal clampedCentre unless edge-clamped)
            const midpoint = (lowPct + highPct) / 2;
            
            // Determine direction based on raw pressure sign
            let direction: DirectionalDelta = 'NEUTRAL';
            if (rawPressure > 0.05) direction = 'INCREASE';
            else if (rawPressure < -0.05) direction = 'DECREASE';
            
            return {
              sleeve,
              current_pct: Math.round(currentPct * 10) / 10,
              illustrative_low_pct: Math.round(lowPct * 10) / 10,
              illustrative_high_pct: Math.round(highPct * 10) / 10,
              direction,
              midpoint_pct: Math.round(midpoint * 10) / 10,
              pressure: Math.round(rawPressure * 1000) / 1000, // Display raw pressure
              clamped,
              debug: {
                scenarioStrength,
                maxShift,
                halfWidth,
                rawPressure: Math.round(rawPressure * 1000) / 1000,
                centreShift: Math.round(centreShift * 100) / 100,
                unclampedCentre: Math.round(unclampedCentre * 10) / 10,
                clampedCentre: Math.round(clampedCentre * 10) / 10,
                unclampedMin: Math.round(unclampedMin * 10) / 10,
                unclampedMax: Math.round(unclampedMax * 10) / 10,
                bindingConstraints,
              },
            };
          }).sort((a, b) => b.current_pct - a.current_pct);
        };
        
        // ============================================
        // 6) COMPUTE APPLIED TILTS STATUS
        // ============================================
        const computeAppliedTilts = (scenarioType: ScenarioType): AppliedTiltEntry[] => {
          return beliefs.tilt_profile.map(tilt => {
            let status: TiltApplicationStatus = 'NOT_APPLIED';
            let constraintReason: string | null = null;
            
            if (!tiltsAllowed) {
              status = 'LOCKED';
              constraintReason = 'Locked due to Safety Lights (RED).';
            } else if (scenarioType === 'NEUTRAL_BASELINE') {
              status = 'NOT_APPLIED';
              constraintReason = 'Neutral baseline does not incorporate belief axes.';
            } else if (tilt.intensity === 'NEUTRAL') {
              status = 'NOT_APPLIED';
              constraintReason = null;
            } else if (scenarioType === 'GUARDRAIL_FIRST') {
              // Guardrail-first: partially applied with constraints
              if (safetyLights.concentration === 'RED' || safetyLights.illiquids === 'RED') {
                status = 'CONSTRAINED';
                constraintReason = 'Constrained to avoid worsening Safety Lights.';
              } else {
                status = 'PARTIALLY_APPLIED';
                constraintReason = 'Reflected within guardrail constraints.';
              }
            } else {
              // Preference-leaning: fully applied
              status = 'APPLIED';
              constraintReason = null;
            }
            
            return {
              axis_code: tilt.axis_code,
              axis_label: AXIS_LABELS[tilt.axis_code],
              status,
              constraint_reason: constraintReason,
            };
          });
        };
        
        // ============================================
        // 7) COMPUTE BINDING CONSTRAINTS
        // ============================================
        const computeBindingConstraints = (): BindingConstraint[] => {
          const constraints: BindingConstraint[] = [];
          
          if (liquidityIsConstrained) {
            constraints.push({
              constraint_type: 'LIQUIDITY',
              description: 'Cash runway constraint prevents reducing liquidity allocation.',
              current_value: safetyLights.metrics.cash_runway_months,
              threshold: 3,
            });
          }
          
          if (concentrationIsConstrained) {
            constraints.push({
              constraint_type: 'CONCENTRATION',
              description: 'Concentration constraint limits equity allocation increases.',
              current_value: safetyLights.metrics.largest_line_pct,
              threshold: 15,
            });
          }
          
          if (illiquidsIsConstrained) {
            constraints.push({
              constraint_type: 'ILLIQUIDS',
              description: 'Illiquidity constraint prevents increasing illiquid allocations.',
              current_value: safetyLights.metrics.illiquid_pct,
              threshold: 20,
            });
          }
          
          return constraints;
        };
        
        // ============================================
        // 8) BUILD ALL THREE SCENARIOS
        // ============================================
        const scenarios: IllustrativeScenario[] = [
          {
            scenario_type: 'GUARDRAIL_FIRST',
            scenario_label: 'Guardrail-first',
            scenario_description: 'Slight directional pressure reflected, prioritising stability.',
            asset_class_bands: createBands(currentAssetClass, 'GUARDRAIL_FIRST'),
            region_bands: createBands(currentRegion, 'GUARDRAIL_FIRST'),
            wrapper_bands: createBands(currentWrapper, 'GUARDRAIL_FIRST'),
            applied_tilts: computeAppliedTilts('GUARDRAIL_FIRST'),
            binding_constraints: computeBindingConstraints(),
            tilts_applied_count: computeAppliedTilts('GUARDRAIL_FIRST').filter(t => t.status === 'APPLIED' || t.status === 'PARTIALLY_APPLIED').length,
            tilts_constrained_count: computeAppliedTilts('GUARDRAIL_FIRST').filter(t => t.status === 'CONSTRAINED' || t.status === 'LOCKED').length,
          },
          {
            scenario_type: 'PREFERENCE_LEANING',
            scenario_label: 'Preference-leaning',
            scenario_description: 'Directional pressure reflected within constraints, illustrating how preferences could shape allocation.',
            asset_class_bands: createBands(currentAssetClass, 'PREFERENCE_LEANING'),
            region_bands: createBands(currentRegion, 'PREFERENCE_LEANING'),
            wrapper_bands: createBands(currentWrapper, 'PREFERENCE_LEANING'),
            applied_tilts: computeAppliedTilts('PREFERENCE_LEANING'),
            binding_constraints: computeBindingConstraints(),
            tilts_applied_count: computeAppliedTilts('PREFERENCE_LEANING').filter(t => t.status === 'APPLIED' || t.status === 'PARTIALLY_APPLIED').length,
            tilts_constrained_count: computeAppliedTilts('PREFERENCE_LEANING').filter(t => t.status === 'CONSTRAINED' || t.status === 'LOCKED').length,
          },
          {
            scenario_type: 'NEUTRAL_BASELINE',
            scenario_label: 'Neutral baseline',
            scenario_description: 'Centred on your current allocation. No directional preferences reflected.',
            asset_class_bands: createBands(currentAssetClass, 'NEUTRAL_BASELINE'),
            region_bands: createBands(currentRegion, 'NEUTRAL_BASELINE'),
            wrapper_bands: createBands(currentWrapper, 'NEUTRAL_BASELINE'),
            applied_tilts: computeAppliedTilts('NEUTRAL_BASELINE'),
            binding_constraints: computeBindingConstraints(),
            tilts_applied_count: 0,
            tilts_constrained_count: 0,
          },
        ];
        
        set({
          scenario: {
            version: '1.0',
            computed: true,
            computed_at: new Date().toISOString(),
            active_scenario: 'GUARDRAIL_FIRST',
            scenarios,
            guardrails_binding: !tiltsAllowed || computeBindingConstraints().length > 0,
            tilts_locked_banner: !tiltsAllowed,
            sleeve_pressures: sleevePressures,
          },
        });
      },

      setActiveScenario: (scenarioType) => {
        set((state) => ({
          scenario: {
            ...state.scenario,
            active_scenario: scenarioType,
          },
        }));
      },

      completeScenarioStep: () => {
        const state = get();
        if (!state.scenario.computed) {
          state.computeScenarios();
        }
      },

      resetScenario: () => {
        set({ scenario: initialScenario });
      },

      resetOnboarding: () => {
        set({
          intake: initialIntake,
          holdings: [createEmptyHolding()],
          summary: initialSummary,
          analysis: initialAnalysis,
          beliefs: initialBeliefs,
          scenario: initialScenario,
        });
      },
    }),
    {
      name: 'onboarding-v2-storage',
      onRehydrateStorage: () => (state) => {
        // Recompute gains for all holdings after rehydrating from localStorage
        if (state && state.holdings) {
          const holdingsWithGains = state.holdings.map(computeHoldingWithGains);
          state.holdings = holdingsWithGains;
          state.summary = computeSummaryFromHoldings(holdingsWithGains);
        }
        // Backward compatibility: migrate old personaCues fields
        if (state && state.intake?.personaCues) {
          const cues = state.intake.personaCues as PersonaCues & { has_meaningful_crypto?: boolean | null };
          // Migrate has_meaningful_crypto to has_crypto
          if ('has_meaningful_crypto' in cues && cues.has_crypto === undefined) {
            cues.has_crypto = cues.has_meaningful_crypto ?? null;
            delete cues.has_meaningful_crypto;
          }
          // Initialize new band fields if missing (set to NOT_SURE if toggle is true, otherwise null)
          if (cues.db_income_coverage_band === undefined) {
            cues.db_income_coverage_band = cues.has_defined_benefit_pension ? 'NOT_SURE' : null;
          }
          if (cues.private_business_wealth_band === undefined) {
            cues.private_business_wealth_band = cues.owns_business ? 'NOT_SURE' : null;
          }
          if (cues.employer_stock_alloc_band === undefined) {
            cues.employer_stock_alloc_band = cues.has_employer_stock ? 'NOT_SURE' : null;
          }
          if (cues.crypto_alloc_band === undefined) {
            cues.crypto_alloc_band = cues.has_crypto ? 'NOT_SURE' : null;
          }
        }
      },
    }
  )
);
