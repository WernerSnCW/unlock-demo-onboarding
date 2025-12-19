import { useState } from 'react';
import OnboardingLayout from '@/components/onboarding-v2/OnboardingLayout';
import { 
  useOnboardingV2Store,
  SafetyStatus,
  AppliedTiltEntry,
  AxisCode,
  TiltApplicationStatus,
} from '@/state/onboardingV2Store';
import { useLocation } from 'wouter';
import { 
  Info,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lock,
  Check,
  ShieldCheck,
  ShieldAlert,
  Droplets,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  RefreshCw,
  Eye,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';

const ALL_AXES: AxisCode[] = [
  'QUALITY_TILT', 'VALUE_TILT', 'TECH_TILT', 'UK_BIAS',
  'ESG_TILT', 'INFLATION_HEDGE_TILT', 'SMALL_CAP_TILT', 'VOLATILITY_AVERSION'
];

const AXIS_LABELS: Record<AxisCode, string> = {
  VOLATILITY_AVERSION: 'Volatility Comfort',
  QUALITY_TILT: 'Quality Tilt',
  VALUE_TILT: 'Value Tilt',
  TECH_TILT: 'Tech Tilt',
  UK_BIAS: 'UK Bias',
  ESG_TILT: 'ESG Tilt',
  INFLATION_HEDGE_TILT: 'Inflation Protection',
  SMALL_CAP_TILT: 'Small Cap Tilt',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: typeof Check }> = {
  APPLIED: { label: 'Applied', color: 'text-[#10A957]', bgColor: 'bg-[#10A957]/10', icon: Check },
  PARTIALLY_APPLIED: { label: 'Partially applied', color: 'text-[#13683B]', bgColor: 'bg-[#13683B]/10', icon: Check },
  CONSTRAINED: { label: 'Constrained', color: 'text-[#FE9239]', bgColor: 'bg-[#FE9239]/10', icon: Lock },
  LOCKED: { label: 'Locked', color: 'text-[#DC2626]', bgColor: 'bg-[#DC2626]/10', icon: Lock },
  NOT_APPLIED: { label: 'Not applied', color: 'text-[#64748B]', bgColor: 'bg-slate-100 dark:bg-slate-800', icon: Minus },
};

const DIRECTION_ICONS: Record<string, typeof TrendingUp> = {
  TOWARDS: TrendingUp,
  AWAY: TrendingDown,
  NEUTRAL: Minus,
};

const DIRECTION_COLORS: Record<string, string> = {
  TOWARDS: 'text-[#10A957]',
  AWAY: 'text-[#FE9239]',
  NEUTRAL: 'text-[#64748B]',
};

const LIGHT_CONFIG: Record<string, { icon: typeof Droplets; label: string; whyItMatters: string }> = {
  liquidity: {
    icon: Droplets,
    label: 'Liquidity',
    whyItMatters: 'Liquidity provides resilience for unexpected spending needs.',
  },
  concentration: {
    icon: Target,
    label: 'Concentration',
    whyItMatters: 'High single-holding exposure can dominate outcomes and reduce diversification.',
  },
  illiquids: {
    icon: Lock,
    label: 'Illiquids',
    whyItMatters: 'Illiquid assets may be harder to sell quickly during stress.',
  },
};

const STATUS_ICON_CONFIG: Record<SafetyStatus, { icon: typeof CheckCircle2; color: string; bgColor: string }> = {
  GREEN: { icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-500/10' },
  AMBER: { icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-500/10' },
  RED: { icon: XCircle, color: 'text-rose-600 dark:text-rose-400', bgColor: 'bg-rose-500/10' },
};

interface LightItem {
  key: 'liquidity' | 'concentration' | 'illiquids';
  status: SafetyStatus;
  metric: string;
}

interface TranslationPayload {
  overall_status: string;
  top_constraints: { name: string; status: string; metric_label: string; metric_value_text: string }[];
  preference_signals_state: string;
  signals_summary: { axis: string; direction: string; intensity: string; status: string; reason_if_any: string | null }[];
  next_step_text: string;
}

const FORBIDDEN_WORDS = [
  'should', 'recommend', 'buy', 'sell', 'allocate', 'rebalance', 
  'increase', 'decrease', 'switch', 'guarantee', 'will', 'expect', 
  'predict', 'outperform', 'return', 'alpha'
];

const COMPLIANCE_LINE = 'Illustrative only. Not financial advice.';

function validateAIOutputClient(text: string): { valid: boolean; reason?: string } {
  const lowerText = text.toLowerCase();
  
  for (const word of FORBIDDEN_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(lowerText)) {
      return { valid: false, reason: `Contains forbidden word: "${word}"` };
    }
  }
  
  // Check compliance line appears at the end
  const trimmedText = text.trim();
  if (!trimmedText.endsWith(COMPLIANCE_LINE)) {
    return { valid: false, reason: 'Compliance line must appear at the end' };
  }
  
  // Ensure compliance line appears exactly once
  const escapedLine = COMPLIANCE_LINE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const occurrences = (text.match(new RegExp(escapedLine, 'g')) || []).length;
  if (occurrences !== 1) {
    return { valid: false, reason: 'Compliance line must appear exactly once' };
  }
  
  return { valid: true };
}

export default function NextSteps() {
  const { analysis, beliefs, scenario, completeNextStepsStep } = useOnboardingV2Store();
  const [, navigate] = useLocation();

  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showPromptInputs, setShowPromptInputs] = useState(false);

  const safetyLights = analysis.result?.safety_lights;
  const overallStatus = safetyLights?.overall_status ?? 'GREEN';

  const handleContinue = () => {
    completeNextStepsStep();
    navigate('/onboarding-v2/plan/transition');
  };

  const handleBack = () => {
    navigate('/onboarding-v2/target');
  };

  const getPositionContent = () => {
    switch (overallStatus) {
      case 'GREEN':
        return {
          headline: "You're within guardrails",
          sentence: "Your portfolio is within Unlock's guardrails for liquidity, concentration, and illiquid exposure. Preference signals are enabled.",
          icon: ShieldCheck,
          bgColor: 'bg-emerald-500/5 border-emerald-500/30',
          iconColor: 'text-emerald-600 dark:text-emerald-400',
        };
      case 'AMBER':
        return {
          headline: "Caution flags present",
          sentence: "Some guardrails are close to limits. Preference signals may be applied, but changes should stay modest until the amber flags improve.",
          icon: ShieldAlert,
          bgColor: 'bg-amber-500/5 border-amber-500/30',
          iconColor: 'text-amber-600 dark:text-amber-400',
        };
      case 'RED':
        return {
          headline: "Action required before preferences can be applied",
          sentence: "One or more red flags are present. Preference signals are recorded but locked until these constraints are addressed.",
          icon: XCircle,
          bgColor: 'bg-rose-500/5 border-rose-500/30',
          iconColor: 'text-rose-600 dark:text-rose-400',
        };
    }
  };

  const positionContent = getPositionContent();
  const PositionIcon = positionContent.icon;

  const getOrderedLights = (): LightItem[] => {
    if (!safetyLights) return [];
    
    const lights: LightItem[] = [
      {
        key: 'liquidity',
        status: safetyLights.liquidity,
        metric: `${safetyLights.metrics.cash_runway_months.toFixed(1)} months cash runway`,
      },
      {
        key: 'concentration',
        status: safetyLights.concentration,
        metric: `${safetyLights.metrics.largest_line_pct.toFixed(1)}% largest holding`,
      },
      {
        key: 'illiquids',
        status: safetyLights.illiquids,
        metric: `${safetyLights.metrics.illiquid_pct.toFixed(1)}% illiquid`,
      },
    ];

    return lights.sort((a, b) => {
      const order: Record<SafetyStatus, number> = { RED: 0, AMBER: 1, GREEN: 2 };
      return order[a.status] - order[b.status];
    });
  };

  const orderedLights = getOrderedLights();

  const getPreferenceLeaningTilts = (): AppliedTiltEntry[] => {
    const preferenceLeaningScenario = scenario.computed && scenario.scenarios.length > 0
      ? scenario.scenarios.find(s => s.scenario_type === 'PREFERENCE_LEANING')
      : null;
    const scenarioTilts = preferenceLeaningScenario?.applied_tilts ?? [];
    
    return ALL_AXES.map(axisCode => {
      const scenarioTilt = scenarioTilts.find(t => t.axis_code === axisCode);
      if (scenarioTilt) {
        return scenarioTilt;
      }
      return {
        axis_code: axisCode,
        axis_label: AXIS_LABELS[axisCode],
        status: 'NOT_APPLIED' as TiltApplicationStatus,
        constraint_reason: null,
      };
    });
  };

  const appliedTilts = getPreferenceLeaningTilts();
  const hasScenarioData = scenario.computed && scenario.scenarios.length > 0;

  const buildTranslationPayload = (): TranslationPayload => {
    const tiltsAllowed = beliefs.tilts_allowed;
    
    const topConstraints = orderedLights.map(light => ({
      name: LIGHT_CONFIG[light.key].label,
      status: light.status,
      metric_label: light.key === 'liquidity' ? 'Cash runway' : light.key === 'concentration' ? 'Largest holding' : 'Illiquid %',
      metric_value_text: light.metric,
    }));
    
    const signalsSummary = appliedTilts.map(tilt => {
      const tiltEntry = beliefs.tilt_profile.find(t => t.axis_code === tilt.axis_code);
      return {
        axis: AXIS_LABELS[tilt.axis_code] || tilt.axis_label,
        direction: tiltEntry?.direction ?? 'NEUTRAL',
        intensity: tiltEntry?.intensity ?? 'WEAK',
        status: tilt.status,
        reason_if_any: tilt.constraint_reason ?? null,
      };
    });
    
    return {
      overall_status: overallStatus,
      top_constraints: topConstraints,
      preference_signals_state: tiltsAllowed ? 'enabled' : 'locked',
      signals_summary: signalsSummary,
      next_step_text: "Next, we'll show an illustrative view of wrappers and transition considerations, and then generate your snapshot report.",
    };
  };

  const handleGenerateSummary = async () => {
    setAiLoading(true);
    setAiError(null);
    setAiSummary(null);
    
    try {
      const payload = buildTranslationPayload();
      const response = await apiRequest('POST', '/api/translate/next-steps', { payload });
      
      if (!response.ok) {
        setAiError("Couldn't generate summary.");
        return;
      }
      
      const data = await response.json() as {
        success?: boolean;
        validated?: boolean;
        text?: string;
        fallback?: string;
        error?: string;
      };
      
      if (!data.success || !data.validated) {
        setAiError(data.fallback || "We couldn't generate a compliant summary. Please use the summary above.");
        return;
      }
      
      if (!data.text) {
        setAiError("We couldn't generate a compliant summary. Please use the summary above.");
        return;
      }
      
      // Client-side validation (defence in depth)
      const clientValidation = validateAIOutputClient(data.text);
      if (!clientValidation.valid) {
        setAiError("We couldn't generate a compliant summary. Please use the summary above.");
        return;
      }
      
      setAiSummary(data.text);
    } catch (err) {
      setAiError("Couldn't generate summary.");
    } finally {
      setAiLoading(false);
    }
  };

  const translationPayload = buildTranslationPayload();

  return (
    <OnboardingLayout
      stepId="next-steps"
      title="Next steps"
      description="Review your current position and what matters most"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Intro Box */}
        <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-2xl p-6 border border-[var(--border)] shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <Info className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--foreground)] mb-2">What this page shows</h3>
              <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-[var(--primary)] flex-shrink-0 mt-0.5" />
                  <span>This page summarises what matters most right now, based on your Safety Lights and preference signals.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-[var(--primary)] flex-shrink-0 mt-0.5" />
                  <span>It does not instruct you to buy or sell any asset, and it is not financial advice.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-[var(--primary)] flex-shrink-0 mt-0.5" />
                  <span>It shows what is blocking flexibility (if anything) and what you can review next.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Your Current Position */}
        <div className={`rounded-2xl p-6 border ${positionContent.bgColor}`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${positionContent.iconColor}`}>
              <PositionIcon className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--foreground)] mb-1" data-testid="position-headline">
                {positionContent.headline}
              </h2>
              <p className="text-[var(--muted-foreground)]" data-testid="position-sentence">
                {positionContent.sentence}
              </p>
            </div>
          </div>
        </div>

        {/* What Matters Most Now */}
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-[var(--border)] shadow-sm">
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">What matters most now</h2>
          <div className="space-y-4">
            {orderedLights.map((light) => {
              const config = LIGHT_CONFIG[light.key];
              const statusConfig = STATUS_ICON_CONFIG[light.status];
              const LightIcon = config.icon;
              const StatusIcon = statusConfig.icon;
              
              return (
                <div 
                  key={light.key}
                  className="flex items-start gap-4 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-[var(--border)]"
                  data-testid={`light-item-${light.key}`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusConfig.bgColor}`}>
                    <LightIcon className={`w-5 h-5 ${statusConfig.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-[var(--foreground)]">{config.label}</span>
                      <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                      <span className={`text-xs font-medium ${statusConfig.color}`}>{light.status}</span>
                    </div>
                    <div className="text-sm text-[var(--muted-foreground)] mb-1">
                      {light.metric}
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)] italic">
                      {config.whyItMatters}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Preference Signals Status */}
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-[var(--border)] shadow-sm">
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">Preference signals status</h2>
          
          {!hasScenarioData && (
            <div className="mb-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-[var(--border)]">
              <p className="text-xs text-[var(--muted-foreground)]">
                Signals captured. Scenario application details will appear once Step 7 has been generated.
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {appliedTilts.map((tilt) => {
              const statusConf = STATUS_CONFIG[tilt.status] || STATUS_CONFIG.NOT_APPLIED;
              const StatusIcon = statusConf.icon;
              const tiltEntry = beliefs.tilt_profile.find(t => t.axis_code === tilt.axis_code);
              const direction = tiltEntry?.direction ?? 'NEUTRAL';
              const intensity = tiltEntry?.intensity ?? 'WEAK';
              const DirectionIcon = DIRECTION_ICONS[direction] || Minus;
              const dirColor = DIRECTION_COLORS[direction] || DIRECTION_COLORS.NEUTRAL;
              
              return (
                <div 
                  key={tilt.axis_code}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 dark:bg-slate-900/50 border border-[var(--border)]"
                  data-testid={`tilt-status-${tilt.axis_code}`}
                >
                  <div className="flex items-center gap-2">
                    <DirectionIcon className={`w-4 h-4 ${dirColor}`} />
                    <span className="text-sm font-medium text-[var(--foreground)]">
                      {AXIS_LABELS[tilt.axis_code] || tilt.axis_label}
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      ({intensity.toLowerCase()})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConf.bgColor} ${statusConf.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusConf.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          
          {appliedTilts.some(t => t.status === 'CONSTRAINED' || t.status === 'LOCKED') && (
            <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Some preferences are constrained or locked due to Safety Light guardrails. Address the underlying constraints to enable full application.
              </p>
            </div>
          )}
        </div>

        {/* What Happens Next */}
        <div className="bg-gradient-to-br from-[var(--primary)]/5 to-[var(--primary)]/10 rounded-2xl p-6 border border-[var(--primary)]/20">
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-2">What happens next</h2>
          <p className="text-[var(--muted-foreground)]">
            Next, we'll show an illustrative view of wrappers and transition considerations, and then generate your snapshot report.
          </p>
        </div>

        {/* AI Translation Layer */}
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-[var(--border)] shadow-sm" data-testid="ai-translation-layer">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--foreground)]">Plain-English summary (AI-assisted)</h2>
              <p className="text-sm text-[var(--muted-foreground)]">A short translation of the summary above. Illustrative only.</p>
            </div>
          </div>

          {/* Generate / Regenerate Buttons */}
          <div className="flex items-center gap-3 mb-4">
            <Button
              onClick={handleGenerateSummary}
              disabled={aiLoading}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
              data-testid="generate-summary-button"
            >
              {aiLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating summary…
                </>
              ) : aiSummary ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate summary
                </>
              )}
            </Button>
            
            <button
              onClick={() => setShowPromptInputs(!showPromptInputs)}
              className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              data-testid="show-prompt-inputs-toggle"
            >
              <Eye className="w-4 h-4" />
              Show prompt inputs
              <ChevronDown className={`w-4 h-4 transition-transform ${showPromptInputs ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Prompt Inputs (Collapsible) */}
          {showPromptInputs && (
            <div className="mb-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-[var(--border)]" data-testid="prompt-inputs-panel">
              <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Structured inputs sent to AI:</h4>
              <pre className="text-xs text-[var(--foreground)] whitespace-pre-wrap font-mono bg-slate-100 dark:bg-slate-800 p-3 rounded overflow-x-auto">
                {JSON.stringify(translationPayload, null, 2)}
              </pre>
            </div>
          )}

          {/* AI Output or Error */}
          {aiError && (
            <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700" data-testid="ai-error">
              <p className="text-sm text-rose-700 dark:text-rose-300">{aiError}</p>
            </div>
          )}

          {aiSummary && !aiError && (
            <div className="space-y-3" data-testid="ai-summary-output">
              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-700">
                <p className="text-sm text-[var(--foreground)] leading-relaxed">{aiSummary}</p>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] italic">
                This is a wording aid. The figures and statuses above are the source of truth.
              </p>
            </div>
          )}

          {!aiSummary && !aiError && !aiLoading && (
            <p className="text-sm text-[var(--muted-foreground)]">
              Click "Generate summary" to create a plain-English explanation of your current position.
            </p>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-[var(--border)]">
          <Button
            variant="outline"
            onClick={handleBack}
            className="px-6 py-2.5 border-2 border-[var(--border)] bg-white dark:bg-slate-800 text-[var(--foreground)] hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-[var(--primary)] transition-all duration-300"
            data-testid="nextsteps-back-button"
          >
            Back to scenarios
          </Button>
          <Button
            onClick={handleContinue}
            className="px-8 py-2.5 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 hover:from-[var(--primary)]/90 hover:to-[var(--primary)]/70 shadow-lg shadow-[var(--primary)]/25 transition-all duration-300"
            data-testid="nextsteps-continue-button"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
