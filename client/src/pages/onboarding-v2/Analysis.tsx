import { useEffect, useMemo } from 'react';
import OnboardingLayout from '@/components/onboarding-v2/OnboardingLayout';
import PortfolioSnapshot from '@/components/onboarding-v2/PortfolioSnapshot';
import PersonaCard from '@/components/onboarding-v2/PersonaCard';
import ScenarioStressSection from '@/components/onboarding-v2/ScenarioStressSection';
import { Shield, Droplets, Target, Lock, CheckCircle2, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { useOnboardingV2Store, SafetyStatus, computePortfolioBreakdowns, DBIncomeCoverageBand, PrivateBusinessWealthBand, EmployerStockAllocBand, CryptoAllocBand } from '@/state/onboardingV2Store';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';

const statusConfig: Record<SafetyStatus, { color: string; icon: typeof CheckCircle2; bgColor: string; borderColor: string; gradient: string; iconBg: string }> = {
  GREEN: {
    color: 'text-emerald-600 dark:text-emerald-400',
    icon: CheckCircle2,
    bgColor: 'bg-emerald-500/5',
    borderColor: 'border-emerald-500/30',
    gradient: 'bg-gradient-to-br from-emerald-500/10 via-white to-emerald-500/5 dark:from-emerald-500/15 dark:via-gray-900 dark:to-emerald-500/5',
    iconBg: 'bg-emerald-500/10',
  },
  AMBER: {
    color: 'text-amber-600 dark:text-amber-400',
    icon: AlertTriangle,
    bgColor: 'bg-amber-500/5',
    borderColor: 'border-amber-500/30',
    gradient: 'bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 dark:from-amber-500/15 dark:via-gray-900 dark:to-amber-500/5',
    iconBg: 'bg-amber-500/10',
  },
  RED: {
    color: 'text-rose-600 dark:text-rose-400',
    icon: XCircle,
    bgColor: 'bg-rose-500/5',
    borderColor: 'border-rose-500/30',
    gradient: 'bg-gradient-to-br from-rose-500/10 via-white to-rose-500/5 dark:from-rose-500/15 dark:via-gray-900 dark:to-rose-500/5',
    iconBg: 'bg-rose-500/10',
  },
};

const lightDescriptions = {
  liquidity: {
    GREEN: 'Your cash runway exceeds our recommended threshold. You have a healthy emergency buffer.',
    AMBER: 'Your cash runway is below our ideal threshold but above the minimum. Consider building more buffer.',
    RED: 'Your cash runway is below the minimum recommended level. We recommend building an emergency fund before taking investment risk.',
  },
  concentration: {
    GREEN: 'Your largest holding is within healthy diversification limits.',
    AMBER: 'Your largest holding is moderately concentrated. Consider diversifying to reduce single-name risk.',
    RED: 'Your largest holding exceeds safe concentration limits. High single-name exposure increases portfolio risk.',
  },
  illiquids: {
    GREEN: 'Your illiquid asset allocation is within recommended limits.',
    AMBER: 'Your illiquid allocation is approaching the upper limit. Consider your liquidity needs.',
    RED: 'Your illiquid allocation exceeds recommended limits. You may face challenges accessing funds when needed.',
  },
};

// Helper functions to format band values for display
const formatDBCoverageBand = (band: DBIncomeCoverageBand): string => {
  const labels: Record<string, string> = {
    'LT_25': '~less than 25%',
    '25_50': '~25–50%',
    '50_75': '~50–75%',
    'GT_75': '~more than 75%',
    'NOT_SURE': 'Not sure',
  };
  return band ? labels[band] || 'Unknown' : '';
};

const formatBusinessWealthBand = (band: PrivateBusinessWealthBand): string => {
  const labels: Record<string, string> = {
    'LT_10': '~less than 10%',
    '10_25': '~10–25%',
    '25_50': '~25–50%',
    'GT_50': '~more than 50%',
    'NOT_SURE': 'Not sure',
  };
  return band ? labels[band] || 'Unknown' : '';
};

const formatEmployerStockBand = (band: EmployerStockAllocBand): string => {
  const labels: Record<string, string> = {
    'LT_5': '~less than 5%',
    '5_15': '~5–15%',
    '15_30': '~15–30%',
    'GT_30': '~more than 30%',
    'NOT_SURE': 'Not sure',
  };
  return band ? labels[band] || 'Unknown' : '';
};

const formatCryptoBand = (band: CryptoAllocBand): string => {
  const labels: Record<string, string> = {
    'LT_5': '~less than 5%',
    '5_10': '~5–10%',
    '10_25': '~10–25%',
    'GT_25': '~more than 25%',
    'NOT_SURE': 'Not sure',
  };
  return band ? labels[band] || 'Unknown' : '';
};

export default function Analysis() {
  const { intake, holdings, summary, analysis, setAnalysisLoading, setAnalysisResult, setAnalysisError } = useOnboardingV2Store();
  const [, navigate] = useLocation();

  const hasValidData = summary.total_investable_value > 0 && intake.annual_essential_spend_gbp > 0;

  const breakdowns = useMemo(() => computePortfolioBreakdowns(holdings), [holdings]);

  const computeAssetClassBreakdown = () => {
    const result = { equity_pct: 0, bond_pct: 0, property_pct: 0, cash_pct: 0, alts_pct: 0, crypto_pct: 0 };
    for (const item of breakdowns.by_asset_class) {
      const name = item.name.toLowerCase();
      if (name.includes('equity') || name.includes('share') || name.includes('stock')) {
        result.equity_pct += item.weight_pct;
      } else if (name.includes('bond') || name.includes('fixed')) {
        result.bond_pct += item.weight_pct;
      } else if (name.includes('property') || name.includes('real estate')) {
        result.property_pct += item.weight_pct;
      } else if (name.includes('cash') || name.includes('money market')) {
        result.cash_pct += item.weight_pct;
      } else if (name.includes('crypto') || name.includes('digital')) {
        result.crypto_pct += item.weight_pct;
      } else {
        result.alts_pct += item.weight_pct;
      }
    }
    return result;
  };

  useEffect(() => {
    if (!hasValidData) {
      return;
    }

    if (analysis.status === 'idle') {
      runAnalysis();
    }
  }, [hasValidData, analysis.status]);

  const runAnalysis = async () => {
    setAnalysisLoading();

    try {
      const assetBreakdown = computeAssetClassBreakdown();
      
      const payload = {
        intake: {
          cash: intake.liquid_cash_gbp,
          spend: intake.annual_essential_spend_gbp,
          largest_line_pct: summary.largest_line_pct / 100,
          illiquid_pct: summary.illiquid_pct / 100,
          total_portfolio_value_gbp: summary.total_investable_value,
          primary_goal: intake.primary_goal,
          time_horizon: intake.time_horizon_years,
          risk_comfort: intake.risk_comfort,
          personaCues: intake.personaCues,
          asset_class_breakdown: assetBreakdown,
        },
        holdings: holdings.filter(h => h.value_gbp > 0).map(h => ({
          id: h.id,
          instrument_name: h.instrument_name,
          ticker: h.ticker,
          wrapper: h.wrapper,
          asset_class: h.asset_class,
          region: h.region,
          value_gbp: h.value_gbp,
          illiquid: h.illiquid,
          currency: h.currency,
          instrument_type: h.instrument_type,
          isin: h.isin,
          cost_basis_gbp: h.cost_basis_gbp,
          acquisition_date: h.acquisition_date,
          notes: h.notes,
        })),
      };

      const response = await apiRequest('POST', '/api/onboarding-v2/analyse', payload);
      const result = await response.json();
      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisError(error instanceof Error ? error.message : 'Analysis failed');
    }
  };

  if (!hasValidData) {
    return (
      <OnboardingLayout
        stepId="analysis"
        title="Portfolio Analysis"
        description="We need your information to analyse your portfolio."
        hideNav
      >
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-[var(--warning)] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">Missing Information</h3>
          <p className="text-[var(--muted-foreground)] mb-6">
            We need your financial details and holdings to perform the analysis.
          </p>
          <div className="flex justify-center gap-4">
            {intake.annual_essential_spend_gbp === 0 && (
              <Button
                variant="outline"
                onClick={() => navigate('/onboarding-v2/intake')}
                data-testid="button-go-intake"
              >
                Complete Intake
              </Button>
            )}
            {summary.total_investable_value === 0 && (
              <Button
                variant="outline"
                onClick={() => navigate('/onboarding-v2/holdings')}
                data-testid="button-go-holdings"
              >
                Add Holdings
              </Button>
            )}
          </div>
        </div>
      </OnboardingLayout>
    );
  }

  if (analysis.status === 'loading') {
    return (
      <OnboardingLayout
        stepId="analysis"
        title="Analysing Your Portfolio"
        description="Please wait while we assess your portfolio against our Safety Lights framework."
        hideNav
      >
        <div className="text-center py-16">
          <Loader2 className="w-16 h-16 text-[var(--primary)] mx-auto mb-4 animate-spin" />
          <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">Running Analysis...</h3>
          <p className="text-[var(--muted-foreground)]">
            Checking liquidity, concentration, and illiquids.
          </p>
        </div>
      </OnboardingLayout>
    );
  }

  if (analysis.status === 'error') {
    return (
      <OnboardingLayout
        stepId="analysis"
        title="Analysis Error"
        description="We encountered an issue analysing your portfolio."
        hideNav
      >
        <div className="text-center py-12">
          <XCircle className="w-16 h-16 text-[var(--destructive)] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">Something went wrong</h3>
          <p className="text-[var(--muted-foreground)] mb-6">{analysis.error}</p>
          <Button
            onClick={runAnalysis}
            className="bg-[var(--primary)] hover:bg-[var(--primary)]/90"
            data-testid="button-retry"
          >
            Try Again
          </Button>
        </div>
      </OnboardingLayout>
    );
  }

  const result = analysis.result;
  if (!result) {
    return null;
  }

  const { safety_lights, persona } = result;
  const { liquidity, concentration, illiquids, tilts_allowed, details, overall_status, overall_status_code, overall_status_label, overall_status_message, metrics } = safety_lights;

  const overallStatusConfig = statusConfig[overall_status];
  const OverallStatusIcon = overallStatusConfig.icon;

  const lights = [
    {
      key: 'liquidity',
      label: 'Liquidity',
      status: liquidity,
      icon: Droplets,
      description: lightDescriptions.liquidity[liquidity],
      detail: `Cash runway: ${details.cash_runway_months === -1 ? '∞' : details.cash_runway_months.toFixed(1)} months (min: ${details.liquidity_thresholds.red_below}, ideal: ${details.liquidity_thresholds.amber_below}+ months)`,
    },
    {
      key: 'concentration',
      label: 'Concentration',
      status: concentration,
      icon: Target,
      description: lightDescriptions.concentration[concentration],
      detail: `Largest position: ${summary.largest_line_pct.toFixed(1)}% (amber: >${(details.concentration_thresholds.amber_above * 100).toFixed(0)}%, red: >${(details.concentration_thresholds.red_above * 100).toFixed(0)}%)`,
    },
    {
      key: 'illiquids',
      label: 'Illiquids',
      status: illiquids,
      icon: Lock,
      description: lightDescriptions.illiquids[illiquids],
      detail: `Illiquid allocation: ${summary.illiquid_pct.toFixed(1)}% (amber: >${(details.illiquids_thresholds.amber_above * 100).toFixed(0)}%, red: >${(details.illiquids_thresholds.red_above * 100).toFixed(0)}%)`,
    },
  ];

  return (
    <OnboardingLayout
      stepId="analysis"
      title="Portfolio Analysis"
      description="We've analysed your portfolio against our Safety Lights framework. Here's what we found."
      hideNav
    >
      <div className="space-y-8 pt-6">
        {/* Overall Status Banner */}
        <div className="group relative">
          <div className={`absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
            overall_status === 'GREEN' ? 'bg-gradient-to-br from-emerald-500/30 to-transparent' :
            overall_status === 'AMBER' ? 'bg-gradient-to-br from-amber-500/30 to-transparent' :
            'bg-gradient-to-br from-rose-500/30 to-transparent'
          }`} />
          <div
            className={`relative bg-white dark:bg-slate-800/80 rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 p-6 pt-10 ${overallStatusConfig.borderColor}`}
            data-testid="overall-status-banner"
            aria-label={`Overall status: ${overall_status_label}. ${overall_status_message}`}
          >
            <div className="absolute -top-5 left-6 z-10">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg rotate-3 group-hover:rotate-0 transition-transform duration-300 ${
                overall_status === 'GREEN' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/25' :
                overall_status === 'AMBER' ? 'bg-gradient-to-br from-amber-500 to-amber-600 shadow-amber-500/25' :
                'bg-gradient-to-br from-rose-500 to-rose-600 shadow-rose-500/25'
              }`}>
                <OverallStatusIcon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className={`text-xl font-bold ${overallStatusConfig.color} mb-2 tracking-tight`} data-testid="overall-status-label">
                {overall_status_label}
              </h3>
              <p className="text-sm text-[var(--foreground)] leading-relaxed" data-testid="overall-status-message">
                {overall_status_message}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-[var(--primary)]/10">
            <Shield className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <h3 className="text-xl font-bold text-[var(--foreground)] tracking-tight">Safety Lights</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-6 pt-4">
          {lights.map((light) => {
            const config = statusConfig[light.status];
            const Icon = light.icon;
            const StatusIcon = config.icon;

            return (
              <div key={light.key} className="group relative h-full">
                <div className={`absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                  light.status === 'GREEN' ? 'bg-gradient-to-br from-emerald-500/20 to-transparent' :
                  light.status === 'AMBER' ? 'bg-gradient-to-br from-amber-500/20 to-transparent' :
                  'bg-gradient-to-br from-rose-500/20 to-transparent'
                }`} />
                <div
                  className="relative h-full flex flex-col bg-white dark:bg-slate-800/80 rounded-2xl border border-[var(--border)] shadow-lg hover:shadow-xl transition-all duration-300 p-5 pt-10"
                  data-testid={`safety-light-${light.key}`}
                  aria-label={`${light.label} status: ${light.status}. ${light.description}`}
                >
                  <div className="absolute -top-4 left-4 z-10">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg rotate-3 group-hover:rotate-0 transition-transform duration-300 ${
                      light.status === 'GREEN' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/25' :
                      light.status === 'AMBER' ? 'bg-gradient-to-br from-amber-500 to-amber-600 shadow-amber-500/25' :
                      'bg-gradient-to-br from-rose-500 to-rose-600 shadow-rose-500/25'
                    }`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-[var(--foreground)] tracking-tight">{light.label}</span>
                    <StatusIcon className={`w-6 h-6 ${config.color}`} aria-hidden="true" />
                  </div>
                  <p className="text-sm text-[var(--foreground)] mb-3 leading-relaxed flex-1">{light.description}</p>
                  <p className="text-xs text-[var(--muted-foreground)] font-medium mt-auto">{light.detail}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Key Metrics Section */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative bg-white dark:bg-slate-800/80 rounded-2xl border border-[var(--border)] shadow-lg hover:shadow-xl transition-all duration-300 p-5 pt-10" data-testid="key-metrics-section">
            <div className="absolute -top-4 left-4 z-10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/70 flex items-center justify-center shadow-lg shadow-[var(--primary)]/25 -rotate-3 group-hover:rotate-0 transition-transform duration-300">
                <Target className="w-5 h-5 text-white" />
              </div>
            </div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-4">Key Metrics</h4>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <div className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Cash Runway</div>
                <div className="text-lg font-bold text-[var(--foreground)]">
                  {metrics.cash_runway_months === -1 ? '∞' : metrics.cash_runway_months.toFixed(1)} months
                </div>
                <div className="text-xs text-[var(--muted-foreground)]">
                  Min: {details.liquidity_thresholds.red_below} | Ideal: {details.liquidity_thresholds.amber_below}+
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Largest Holding</div>
                <div className="text-lg font-bold text-[var(--foreground)]">
                  {(metrics.largest_line_pct * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-[var(--muted-foreground)]">
                  Amber: &gt;{(details.concentration_thresholds.amber_above * 100).toFixed(0)}% | Red: &gt;{(details.concentration_thresholds.red_above * 100).toFixed(0)}%
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Illiquid Allocation</div>
                <div className="text-lg font-bold text-[var(--foreground)]">
                  {(metrics.illiquid_pct * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-[var(--muted-foreground)]">
                  Amber: &gt;{(details.illiquids_thresholds.amber_above * 100).toFixed(0)}% | Red: &gt;{(details.illiquids_thresholds.red_above * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Self-Reported Context Section */}
        {(intake.personaCues?.has_defined_benefit_pension || 
          intake.personaCues?.owns_business || 
          intake.personaCues?.has_employer_stock || 
          intake.personaCues?.has_crypto) && (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4" data-testid="context-section">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Self-reported context from Intake
            </h4>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {intake.personaCues?.has_defined_benefit_pension && (
                <div className="flex items-start gap-2" data-testid="context-db-pension">
                  <span className="text-slate-400">•</span>
                  <span>
                    Defined Benefit pension: Yes (covers {formatDBCoverageBand(intake.personaCues.db_income_coverage_band)} of retirement income)
                  </span>
                </div>
              )}
              {intake.personaCues?.owns_business && (
                <div className="flex items-start gap-2" data-testid="context-business">
                  <span className="text-slate-400">•</span>
                  <span>
                    Private business / PE: Yes ({formatBusinessWealthBand(intake.personaCues.private_business_wealth_band)} of net worth)
                  </span>
                </div>
              )}
              {intake.personaCues?.has_employer_stock && (
                <div className="flex items-start gap-2" data-testid="context-employer-stock">
                  <span className="text-slate-400">•</span>
                  <span>
                    Employer stock exposure: Yes ({formatEmployerStockBand(intake.personaCues.employer_stock_alloc_band)} of investable assets)
                  </span>
                </div>
              )}
              {intake.personaCues?.has_crypto && (
                <div className="flex items-start gap-2" data-testid="context-crypto">
                  <span className="text-slate-400">•</span>
                  <span>
                    Crypto exposure: Yes ({formatCryptoBand(intake.personaCues.crypto_alloc_band)} of portfolio)
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <PortfolioSnapshot />

        {/* Investor Persona Card */}
        {persona && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Investor Persona
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] -mt-1">
              From your answers and current portfolio, here's the investing stance we heard:
            </p>
            <PersonaCard persona={persona} />
          </div>
        )}

        <ScenarioStressSection />

        {/* Tilts Banner */}
        <div className="group relative">
          <div className={`absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
            tilts_allowed ? 'bg-gradient-to-br from-emerald-500/20 to-transparent' : 'bg-gradient-to-br from-rose-500/20 to-transparent'
          }`} />
          <div
            className={`relative bg-white dark:bg-slate-800/80 rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300 p-5 pt-10 ${
              tilts_allowed ? 'border-emerald-500/30' : 'border-rose-500/30'
            }`}
            data-testid="tilts-banner"
          >
            <div className="absolute -top-4 left-4 z-10">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg rotate-3 group-hover:rotate-0 transition-transform duration-300 ${
                tilts_allowed 
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/25' 
                  : 'bg-gradient-to-br from-rose-500 to-rose-600 shadow-rose-500/25'
              }`}>
                {tilts_allowed ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-white" />
                )}
              </div>
            </div>
            <div>
              <h4 className={`font-bold text-[var(--foreground)] mb-1 tracking-tight ${tilts_allowed ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                {tilts_allowed ? 'Preference Signals Enabled' : 'Preference Signals Locked'}
              </h4>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                {tilts_allowed
                  ? 'No red flags detected. Your preference signals can inform the illustrative scenarios in Step 7, within our guardrails.'
                  : 'One or more Safety Lights are Red. Unlock will not recommend moves that increase overall risk until these red flags are addressed. Focus on improving your liquidity, reducing concentration, or lowering illiquid exposure first.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-8 border-t border-[var(--border)]">
          <Button
            variant="outline"
            onClick={() => navigate('/onboarding-v2/holdings')}
            className="text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all duration-200"
            data-testid="button-back"
          >
            Back
          </Button>
          <Button
            onClick={() => navigate('/onboarding-v2/beliefs')}
            className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 hover:from-[var(--primary)]/90 hover:to-[var(--primary)]/70 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium"
            data-testid="button-next"
          >
            Continue to Beliefs
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
