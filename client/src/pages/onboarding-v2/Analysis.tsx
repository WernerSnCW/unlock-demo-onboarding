import { useEffect } from 'react';
import OnboardingLayout from '@/components/onboarding-v2/OnboardingLayout';
import { Shield, Droplets, Target, Lock, CheckCircle2, AlertTriangle, XCircle, Loader2, User } from 'lucide-react';
import { useOnboardingV2Store, SafetyStatus } from '@/state/onboardingV2Store';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';

const statusConfig: Record<SafetyStatus, { color: string; icon: typeof CheckCircle2; bgColor: string; borderColor: string }> = {
  GREEN: {
    color: 'text-[var(--success)]',
    icon: CheckCircle2,
    bgColor: 'bg-[var(--success)]/10',
    borderColor: 'border-[var(--success)]/30',
  },
  AMBER: {
    color: 'text-[var(--warning)]',
    icon: AlertTriangle,
    bgColor: 'bg-[var(--warning)]/10',
    borderColor: 'border-[var(--warning)]/30',
  },
  RED: {
    color: 'text-[var(--destructive)]',
    icon: XCircle,
    bgColor: 'bg-[var(--destructive)]/10',
    borderColor: 'border-[var(--destructive)]/30',
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

export default function Analysis() {
  const { intake, summary, analysis, setAnalysisLoading, setAnalysisResult, setAnalysisError } = useOnboardingV2Store();
  const [, navigate] = useLocation();

  const hasValidData = summary.total_investable_value > 0 && intake.annual_essential_spend_gbp > 0;

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
      const payload = {
        intake: {
          cash: intake.liquid_cash_gbp,
          spend: intake.annual_essential_spend_gbp,
          largest_line_pct: summary.largest_line_pct / 100,
          illiquid_pct: summary.illiquid_pct / 100,
        },
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
  const { liquidity, concentration, illiquids, tilts_allowed, details } = safety_lights;

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
      <div className="space-y-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Shield className="w-6 h-6 text-[var(--primary)]" />
          <h3 className="text-lg font-semibold text-[var(--foreground)]">Safety Lights</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {lights.map((light) => {
            const config = statusConfig[light.status];
            const Icon = light.icon;
            const StatusIcon = config.icon;

            return (
              <div
                key={light.key}
                className={`p-5 border rounded-lg ${config.bgColor} ${config.borderColor}`}
                data-testid={`safety-light-${light.key}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${config.color}`} />
                    <span className="font-semibold text-[var(--foreground)]">{light.label}</span>
                  </div>
                  <StatusIcon className={`w-6 h-6 ${config.color}`} />
                </div>
                <p className="text-sm text-[var(--foreground)] mb-2">{light.description}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{light.detail}</p>
              </div>
            );
          })}
        </div>

        <div
          className={`p-5 rounded-lg border ${
            tilts_allowed
              ? 'bg-[var(--success)]/5 border-[var(--success)]/30'
              : 'bg-[var(--destructive)]/5 border-[var(--destructive)]/30'
          }`}
          data-testid="tilts-banner"
        >
          <div className="flex items-start gap-3">
            {tilts_allowed ? (
              <CheckCircle2 className="w-6 h-6 text-[var(--success)] flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-[var(--destructive)] flex-shrink-0" />
            )}
            <div>
              <h4 className="font-semibold text-[var(--foreground)] mb-1">
                {tilts_allowed ? 'Belief Tilts Enabled' : 'Belief Tilts Locked'}
              </h4>
              <p className="text-sm text-[var(--muted-foreground)]">
                {tilts_allowed
                  ? 'No red flags detected. You can customise your portfolio with belief-based tilts and optimisation within our guardrails.'
                  : 'One or more Safety Lights are Red. Unlock will not recommend moves that increase overall risk until these red flags are addressed. Focus on improving your liquidity, reducing concentration, or lowering illiquid exposure first.'}
              </p>
            </div>
          </div>
        </div>

        {persona.id === null && (
          <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--muted)]/20">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-[var(--muted-foreground)]" />
              <span className="text-sm text-[var(--muted-foreground)]">
                <strong>Persona insights</strong> coming in the next iteration.
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-6 border-t border-[var(--border)]">
          <Button
            variant="outline"
            onClick={() => navigate('/onboarding-v2/holdings')}
            className="text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
            data-testid="button-back"
          >
            Back
          </Button>
          <Button
            onClick={() => navigate('/onboarding-v2/beliefs')}
            className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white"
            data-testid="button-next"
          >
            Continue to Beliefs
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
