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

export type TraitIntensity = 'Light' | 'Moderate' | 'High';

export interface PortfolioTrait {
  name: string;
  intensity: TraitIntensity;
  detail: string;
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
}

export interface AnalysisResult {
  safety_lights: SafetyLightsResult;
  persona: PersonaResult | null;
}

export type AnalysisStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface AnalysisState {
  status: AnalysisStatus;
  result: AnalysisResult | null;
  error: string | null;
}

interface OnboardingV2State {
  intake: IntakeData;
  holdings: Holding[];
  summary: PortfolioSummary;
  analysis: AnalysisState;
  
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

      resetOnboarding: () => {
        set({
          intake: initialIntake,
          holdings: [createEmptyHolding()],
          summary: initialSummary,
          analysis: initialAnalysis,
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
