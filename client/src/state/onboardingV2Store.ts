import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type IntakeMethod = 'manual' | 'upload' | 'connect' | 'advisor';

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
}

export interface PortfolioSummary {
  total_investable_value: number;
  largest_line_pct: number;
  illiquid_pct: number;
  holding_count: number;
}

export type SafetyStatus = 'GREEN' | 'AMBER' | 'RED';

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

export interface AnalysisResult {
  safety_lights: SafetyLightsResult;
  persona: {
    id: string | null;
    name: string | null;
  };
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
});

const initialSummary: PortfolioSummary = {
  total_investable_value: 0,
  largest_line_pct: 0,
  illiquid_pct: 0,
  holding_count: 0,
};

const initialAnalysis: AnalysisState = {
  status: 'idle',
  result: null,
  error: null,
};

function computeSummaryFromHoldings(holdings: Holding[]): PortfolioSummary {
  const validHoldings = holdings.filter((h) => h.value_gbp > 0);
  const total = validHoldings.reduce((sum, h) => sum + h.value_gbp, 0);
  const largestValue = validHoldings.length > 0
    ? Math.max(...validHoldings.map((h) => h.value_gbp))
    : 0;
  const illiquidValue = validHoldings
    .filter((h) => h.illiquid)
    .reduce((sum, h) => sum + h.value_gbp, 0);

  return {
    total_investable_value: total,
    largest_line_pct: total > 0 ? (largestValue / total) * 100 : 0,
    illiquid_pct: total > 0 ? (illiquidValue / total) * 100 : 0,
    holding_count: validHoldings.length,
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

      setHoldings: (holdings) => {
        set({
          holdings,
          summary: computeSummaryFromHoldings(holdings),
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
            h.id === id ? { ...h, ...partial } : h
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
    }
  )
);
