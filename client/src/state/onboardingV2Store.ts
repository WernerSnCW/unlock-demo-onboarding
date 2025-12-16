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

export interface PersonaTraits {
  risk: number;
  property_bias: number;
  alts_bias: number;
  liquidity_comfort: number;
  tax_complexity: number;
  cross_border_complexity: number;
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
export type TiltApplicationStatus = 'APPLIED' | 'PARTIALLY_APPLIED' | 'CONSTRAINED' | 'NOT_APPLIED';

export interface AllocationBand {
  sleeve: string;
  current_pct: number;
  illustrative_low_pct: number;
  illustrative_high_pct: number;
  direction: DirectionalDelta;
  midpoint_pct: number;
  pressure: number; // Directional pressure from beliefs [-1, +1]
  clamped: boolean; // True if range was constrained by Safety Light budgets
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
  return (answer - 3) / 2;
}

// Compute direction from score
function computeDirection(score: number): TiltDirection {
  if (score >= 0.20) return 'TOWARDS';
  if (score <= -0.20) return 'AWAY';
  return 'NEUTRAL';
}

// Compute intensity from absolute score
function computeIntensity(score: number): TiltIntensity {
  const abs = Math.abs(score);
  if (abs >= 0.80) return 'STRONG';
  if (abs >= 0.50) return 'MODERATE';
  if (abs >= 0.20) return 'LIGHT';
  return 'NEUTRAL';
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
        // 1) SCENARIO MOVEMENT CAPS
        // ============================================
        const MOVEMENT_CAPS: Record<ScenarioType, number> = {
          NEUTRAL_BASELINE: 2,      // ±2 percentage points
          GUARDRAIL_FIRST: 3.5,     // ±3-4 percentage points
          PREFERENCE_LEANING: 10,   // ±8-12 percentage points
        };
        
        const SKEW_STRENGTH: Record<ScenarioType, number> = {
          NEUTRAL_BASELINE: 0,      // No skew
          GUARDRAIL_FIRST: 0.3,     // Small skew
          PREFERENCE_LEANING: 0.7,  // Larger skew
        };
        
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
        // 3) COMPUTE DIRECTIONAL PRESSURE FROM BELIEFS
        // ============================================
        const axisScores = beliefs.axis_scores;
        
        // Normalize to [-1, +1] range (axis_scores are already in [-1, +1] from step 6)
        const clampPressure = (val: number) => Math.max(-1, Math.min(1, val));
        
        // Quality, Value, Tech, SmallCap all push towards equity
        const qualityScore = axisScores.QUALITY_TILT ?? 0;
        const valueScore = axisScores.VALUE_TILT ?? 0;
        const techScore = axisScores.TECH_TILT ?? 0;
        const smallCapScore = axisScores.SMALL_CAP_TILT ?? 0;
        const esgScore = axisScores.ESG_TILT ?? 0;
        const inflationScore = axisScores.INFLATION_HEDGE_TILT ?? 0;
        const volatilityAversion = axisScores.VOLATILITY_AVERSION ?? 0; // Higher = more averse to volatility
        const ukBias = axisScores.UK_BIAS ?? 0;
        
        // Equity pressure: positive scores from quality/value/tech/small cap increase it
        // Volatility aversion ALWAYS reduces equity pressure (positive vol aversion = less equity)
        const equityBaseScore = (qualityScore + valueScore + techScore + smallCapScore) / 4;
        const equityPressure = clampPressure(equityBaseScore - volatilityAversion * 0.5);
        
        // Bond pressure: 
        // - Inversely related to equity pressure (less equity = more bonds)
        // - Positive volatility aversion increases bond pressure
        // - Negative volatility aversion (vol-seeking) decreases bond pressure
        const bondPressure = clampPressure(-equityPressure * 0.4 + volatilityAversion * 0.35);
        
        // Cash pressure:
        // - Positive volatility aversion increases cash pressure (safety seeking)
        // - Negative volatility aversion decreases cash pressure (risk seeking)
        const cashPressure = clampPressure(volatilityAversion * 0.3 - equityBaseScore * 0.15);
        
        // Property/Alternatives pressure: inflation hedge increases it
        const propertyPressure = clampPressure(inflationScore * 0.6);
        const alternativesPressure = clampPressure(inflationScore * 0.4 + esgScore * 0.2);
        
        // Regional pressure
        const ukPressure = clampPressure(ukBias);
        const globalPressure = clampPressure(-ukBias * 0.5);
        
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
        // 4) SAFETY LIGHT BUDGET CONSTRAINTS
        // ============================================
        const liquidityIsConstrained = safetyLights.liquidity === 'RED' || safetyLights.liquidity === 'AMBER';
        const concentrationIsConstrained = safetyLights.concentration === 'RED' || safetyLights.concentration === 'AMBER';
        const illiquidsIsConstrained = safetyLights.illiquids === 'RED' || safetyLights.illiquids === 'AMBER';
        
        // ============================================
        // 5) CREATE ALLOCATION BANDS WITH FEASIBILITY + SKEW
        // ============================================
        const createBands = (
          current: Record<string, number>,
          scenarioType: ScenarioType,
          isRegional: boolean = false
        ): AllocationBand[] => {
          const cap = MOVEMENT_CAPS[scenarioType];
          const skewStrength = SKEW_STRENGTH[scenarioType];
          
          return Object.entries(current).map(([sleeve, currentPct]) => {
            // Get pressure for this sleeve
            const pressureKey = getSleeveKey(sleeve);
            const pressure = pressureKey ? sleevePressures[pressureKey] : 0;
            
            // ============================================
            // ASYMMETRIC RANGE GENERATION
            // Compute directional deltas based on pressure
            // Positive pressure = expand upward, contract downward
            // Negative pressure = expand downward, contract upward
            // ============================================
            
            // Base asymmetric deltas: pressure shifts the range direction
            // When pressure > 0: upside delta is larger, downside delta is smaller
            // When pressure < 0: downside delta is larger, upside delta is smaller
            const asymmetryFactor = pressure * skewStrength;
            
            // Upside delta: base cap + asymmetry contribution (positive pressure increases upside)
            let upsideDelta = cap * (1 + asymmetryFactor * 0.6);
            // Downside delta: base cap - asymmetry contribution (positive pressure decreases downside)
            let downsideDelta = cap * (1 - asymmetryFactor * 0.6);
            
            // Ensure deltas stay within reasonable bounds
            upsideDelta = Math.max(0.5, Math.min(cap * 1.8, upsideDelta));
            downsideDelta = Math.max(0.5, Math.min(cap * 1.8, downsideDelta));
            
            // Initial range: asymmetric around current
            let lowPct = currentPct - downsideDelta;
            let highPct = currentPct + upsideDelta;
            
            // Track if we clamped this band
            let clamped = false;
            
            // ============================================
            // APPLY SAFETY LIGHT BUDGET CLAMPS
            // ============================================
            const lowerSleeve = sleeve.toLowerCase();
            
            // Liquidity constraint: don't allow cash to fall below current if liquidity is amber/red
            if (liquidityIsConstrained && (lowerSleeve.includes('cash') || lowerSleeve.includes('money market'))) {
              if (lowPct < currentPct) {
                lowPct = currentPct;
                clamped = true;
              }
            }
            
            // Illiquids constraint: don't allow illiquid sleeves to increase beyond current
            if (illiquidsIsConstrained && (lowerSleeve.includes('property') || lowerSleeve.includes('alternative') || lowerSleeve.includes('private'))) {
              if (highPct > currentPct) {
                highPct = currentPct;
                clamped = true;
              }
            }
            
            // Concentration constraint: cap equity increase to avoid worsening concentration
            if (concentrationIsConstrained && (lowerSleeve.includes('equity') || lowerSleeve.includes('stock'))) {
              const maxEquityIncrease = cap * 0.5; // Only allow half the normal increase
              if (highPct > currentPct + maxEquityIncrease) {
                highPct = currentPct + maxEquityIncrease;
                clamped = true;
              }
            }
            
            // Clamp to valid percentage range [0, 100]
            lowPct = Math.max(0, lowPct);
            highPct = Math.min(100, highPct);
            
            // Ensure low <= high
            if (lowPct > highPct) {
              lowPct = highPct;
              clamped = true;
            }
            
            // Compute midpoint after clamping (preserves asymmetry)
            const midpoint = (lowPct + highPct) / 2;
            
            // Determine direction based on midpoint vs current
            // Tighter threshold for detecting direction
            let direction: DirectionalDelta = 'NEUTRAL';
            if (midpoint > currentPct + 0.3) direction = 'INCREASE';
            else if (midpoint < currentPct - 0.3) direction = 'DECREASE';
            
            return {
              sleeve,
              current_pct: Math.round(currentPct * 10) / 10,
              illustrative_low_pct: Math.round(lowPct * 10) / 10,
              illustrative_high_pct: Math.round(highPct * 10) / 10,
              direction,
              midpoint_pct: Math.round(midpoint * 10) / 10,
              pressure: Math.round(pressure * 100) / 100,
              clamped,
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
              status = 'CONSTRAINED';
              constraintReason = 'Safety Lights guardrails prevent preference reflection.';
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
            scenario_description: 'Prioritises bringing Safety Lights to green. Belief axes partially reflected within tight constraints.',
            asset_class_bands: createBands(currentAssetClass, 'GUARDRAIL_FIRST'),
            region_bands: createBands(currentRegion, 'GUARDRAIL_FIRST', true),
            wrapper_bands: createBands(currentWrapper, 'GUARDRAIL_FIRST'),
            applied_tilts: computeAppliedTilts('GUARDRAIL_FIRST'),
            binding_constraints: computeBindingConstraints(),
            tilts_applied_count: computeAppliedTilts('GUARDRAIL_FIRST').filter(t => t.status === 'APPLIED' || t.status === 'PARTIALLY_APPLIED').length,
            tilts_constrained_count: computeAppliedTilts('GUARDRAIL_FIRST').filter(t => t.status === 'CONSTRAINED').length,
          },
          {
            scenario_type: 'PREFERENCE_LEANING',
            scenario_label: 'Preference-leaning',
            scenario_description: 'Reflects belief axes as far as guardrail budgets allow. Wider ranges with directional skew.',
            asset_class_bands: createBands(currentAssetClass, 'PREFERENCE_LEANING'),
            region_bands: createBands(currentRegion, 'PREFERENCE_LEANING', true),
            wrapper_bands: createBands(currentWrapper, 'PREFERENCE_LEANING'),
            applied_tilts: computeAppliedTilts('PREFERENCE_LEANING'),
            binding_constraints: computeBindingConstraints(),
            tilts_applied_count: computeAppliedTilts('PREFERENCE_LEANING').filter(t => t.status === 'APPLIED' || t.status === 'PARTIALLY_APPLIED').length,
            tilts_constrained_count: computeAppliedTilts('PREFERENCE_LEANING').filter(t => t.status === 'CONSTRAINED').length,
          },
          {
            scenario_type: 'NEUTRAL_BASELINE',
            scenario_label: 'Neutral baseline',
            scenario_description: 'Minimal deviation from current allocation. No belief axes incorporated.',
            asset_class_bands: createBands(currentAssetClass, 'NEUTRAL_BASELINE'),
            region_bands: createBands(currentRegion, 'NEUTRAL_BASELINE', true),
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
