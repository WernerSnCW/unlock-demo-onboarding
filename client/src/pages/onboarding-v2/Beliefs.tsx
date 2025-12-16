import OnboardingLayout from '@/components/onboarding-v2/OnboardingLayout';
import { 
  useOnboardingV2Store, 
  BeliefQuestionId, 
  AxisCode,
  TiltDirection,
  TiltIntensity,
  TiltsGateReason 
} from '@/state/onboardingV2Store';
import { useLocation } from 'wouter';
import { useState, useEffect, useMemo } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Minus,
  Lock,
  Info,
  Sparkles,
  Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface BeliefQuestion {
  id: BeliefQuestionId;
  text: string;
}

const BELIEF_QUESTIONS: BeliefQuestion[] = [
  { id: 'Q_VOLATILITY_COMFORT', text: "I'm comfortable with my portfolio fluctuating significantly in the short term if long-term returns are higher." },
  { id: 'Q_QUALITY', text: "I prefer financially strong, profitable companies even if they are more expensive." },
  { id: 'Q_VALUE', text: "I prefer cheaper companies that may be out of favour if the long-term case is sound." },
  { id: 'Q_TECH', text: "I believe technology will outperform the broader market over the next decade." },
  { id: 'Q_UK_BIAS', text: "I want a deliberate tilt towards UK-listed assets." },
  { id: 'Q_ESG', text: "Sustainability should be a deciding factor in what I invest in." },
  { id: 'Q_INFLATION', text: "Inflation is one of my biggest concerns for my investments." },
  { id: 'Q_SMALL_CAP', text: "I'm comfortable allocating to smaller companies in pursuit of higher growth." },
];

const ANSWER_OPTIONS: { value: 1 | 2 | 3 | 4 | 5; label: string; shortLabel: string }[] = [
  { value: 1, label: 'Strongly disagree', shortLabel: 'SD' },
  { value: 2, label: 'Disagree', shortLabel: 'D' },
  { value: 3, label: 'Neutral', shortLabel: 'N' },
  { value: 4, label: 'Agree', shortLabel: 'A' },
  { value: 5, label: 'Strongly agree', shortLabel: 'SA' },
];

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

const DIRECTION_CONFIG: Record<TiltDirection, { label: string; icon: typeof TrendingUp; color: string; bgGradient: string }> = {
  TOWARDS: { label: 'Lean towards', icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bgGradient: 'from-emerald-500 to-emerald-600' },
  AWAY: { label: 'Lean away', icon: TrendingDown, color: 'text-rose-600 dark:text-rose-400', bgGradient: 'from-rose-500 to-rose-600' },
  NEUTRAL: { label: 'Neutral', icon: Minus, color: 'text-slate-500 dark:text-slate-400', bgGradient: 'from-slate-400 to-slate-500' },
};

const INTENSITY_CONFIG: Record<TiltIntensity, { color: string; bgColor: string; borderColor: string }> = {
  NEUTRAL: { color: 'text-slate-500 dark:text-slate-400', bgColor: 'bg-slate-100 dark:bg-slate-800', borderColor: 'border-slate-200 dark:border-slate-700' },
  LIGHT: { color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/30', borderColor: 'border-blue-200 dark:border-blue-800' },
  MODERATE: { color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-900/30', borderColor: 'border-amber-200 dark:border-amber-800' },
  STRONG: { color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-900/30', borderColor: 'border-emerald-200 dark:border-emerald-800' },
};

const GATE_REASON_MESSAGES: Record<TiltsGateReason, string> = {
  NO_RED_FLAGS: 'Tilts are available and can be applied in the next step.',
  RED_LIQUIDITY: 'Liquidity concerns detected. Build your emergency buffer before applying tilts.',
  RED_CONCENTRATION: 'Concentration risk detected. Diversify before applying tilts.',
  RED_ILLIQUIDS: 'Illiquids allocation too high. Improve liquidity before applying tilts.',
  MULTIPLE_RED_FLAGS: 'Multiple safety concerns detected. Address these before applying tilts.',
};

export default function Beliefs() {
  const [, navigate] = useLocation();
  const { beliefs, analysis, setBeliefResponse, computeBeliefsScores, completeBeliefsStep } = useOnboardingV2Store();
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [transparencyOpen, setTransparencyOpen] = useState(false);

  const safetyLights = analysis.result?.safety_lights;

  const responseCount = Object.keys(beliefs.responses).length;
  useEffect(() => {
    computeBeliefsScores();
  }, [analysis.result, responseCount, computeBeliefsScores]);

  const allAnswered = useMemo(() => {
    return BELIEF_QUESTIONS.every(q => beliefs.responses[q.id] !== undefined);
  }, [beliefs.responses]);

  const unansweredQuestions = useMemo(() => {
    return BELIEF_QUESTIONS.filter(q => beliefs.responses[q.id] === undefined).map(q => q.id);
  }, [beliefs.responses]);

  const hasAnyRed = safetyLights && (
    safetyLights.liquidity === 'RED' || 
    safetyLights.concentration === 'RED' || 
    safetyLights.illiquids === 'RED'
  );
  const hasAnyAmber = safetyLights && !hasAnyRed && (
    safetyLights.liquidity === 'AMBER' || 
    safetyLights.concentration === 'AMBER' || 
    safetyLights.illiquids === 'AMBER'
  );
  const allGreen = safetyLights && !hasAnyRed && !hasAnyAmber;

  const handleContinue = () => {
    setAttemptedSubmit(true);
    if (!allAnswered) {
      return;
    }
    completeBeliefsStep();
    navigate('/onboarding-v2/target');
  };

  const handleBack = () => {
    navigate('/onboarding-v2/analysis');
  };

  return (
    <OnboardingLayout
      stepId="beliefs"
      title="Beliefs"
      description="These preferences influence how Unlock proposes a target portfolio — within your Safety Lights guardrails."
      hideNav={true}
    >
      <div className="space-y-8 pt-6">
        {/* Gate Status Banner */}
        {hasAnyRed && (
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-white dark:bg-slate-800/80 rounded-2xl border-2 border-rose-500/30 shadow-lg hover:shadow-xl transition-all duration-300 p-5 pt-10">
              <div className="absolute -top-4 left-5 z-10">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/25 rotate-3 group-hover:rotate-0 transition-transform duration-300">
                  <ShieldAlert className="w-5 h-5 text-white" />
                </div>
              </div>
              <h4 className="text-base font-bold text-rose-600 dark:text-rose-400 mb-1">
                Tilts Currently Locked
              </h4>
              <p className="text-sm text-[var(--foreground)] leading-relaxed">
                Belief tilts captured, but locked until red Safety Lights are addressed.
              </p>
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-2">
                {GATE_REASON_MESSAGES[beliefs.tilts_gate_reason]}
              </p>
            </div>
          </div>
        )}
        {hasAnyAmber && (
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-white dark:bg-slate-800/80 rounded-2xl border-2 border-amber-500/30 shadow-lg hover:shadow-xl transition-all duration-300 p-5 pt-10">
              <div className="absolute -top-4 left-5 z-10">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25 rotate-3 group-hover:rotate-0 transition-transform duration-300">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
              </div>
              <h4 className="text-base font-bold text-amber-600 dark:text-amber-400 mb-1">
                Tilts Available with Caution
              </h4>
              <p className="text-sm text-[var(--foreground)] leading-relaxed">
                Tilts are available, but amber flags suggest reviewing your portfolio first.
              </p>
            </div>
          </div>
        )}
        {allGreen && (
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-white dark:bg-slate-800/80 rounded-2xl border-2 border-emerald-500/30 shadow-lg hover:shadow-xl transition-all duration-300 p-5 pt-10">
              <div className="absolute -top-4 left-5 z-10">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 rotate-3 group-hover:rotate-0 transition-transform duration-300">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
              </div>
              <h4 className="text-base font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                Tilts Ready to Apply
              </h4>
              <p className="text-sm text-[var(--foreground)] leading-relaxed">
                All Safety Lights are green. Your tilts can be applied in the next step.
              </p>
            </div>
          </div>
        )}

        {/* Questionnaire Section */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative bg-white dark:bg-slate-800/80 rounded-2xl border border-[var(--border)] shadow-lg hover:shadow-xl transition-all duration-300 p-6 pt-12">
            <div className="absolute -top-5 left-6 z-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/70 flex items-center justify-center shadow-lg shadow-[var(--primary)]/25 rotate-3 group-hover:rotate-0 transition-transform duration-300">
                <Brain className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight">
                Investment Beliefs Questionnaire
              </h3>
              <span className="text-xs font-medium text-[var(--muted-foreground)] bg-[var(--muted)]/50 px-3 py-1 rounded-full">
                {responseCount}/8 answered
              </span>
            </div>
            <p className="text-sm text-[var(--muted-foreground)] mb-6">
              Please indicate your level of agreement with each statement. All 8 questions are required.
            </p>

            <div className="space-y-4">
              {BELIEF_QUESTIONS.map((question, index) => {
                const response = beliefs.responses[question.id];
                const isUnanswered = attemptedSubmit && response === undefined;

                return (
                  <div 
                    key={question.id}
                    className={`group/q relative p-5 rounded-xl border transition-all duration-300 ${
                      isUnanswered 
                        ? 'border-rose-300 dark:border-rose-700 bg-rose-50/50 dark:bg-rose-900/10' 
                        : response 
                          ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-900/10'
                          : 'border-[var(--border)] bg-slate-50/50 dark:bg-slate-800/30 hover:border-[var(--primary)]/50'
                    }`}
                    data-testid={`belief-question-${question.id}`}
                  >
                    <div className="flex gap-4 mb-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold transition-all duration-300 ${
                        response 
                          ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md'
                          : 'bg-[var(--primary)]/10 text-[var(--primary)]'
                      }`}>
                        {response ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                      </div>
                      <p className="text-sm text-[var(--foreground)] leading-relaxed pt-1">
                        {question.text}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 pl-12">
                      {ANSWER_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setBeliefResponse(question.id, option.value)}
                          className={`px-4 py-2.5 text-xs font-medium rounded-lg border-2 transition-all duration-200 ${
                            response?.answer === option.value
                              ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/80 text-white border-transparent shadow-lg shadow-[var(--primary)]/25 scale-105'
                              : 'bg-white dark:bg-slate-800 text-[var(--foreground)] border-[var(--border)] hover:border-[var(--primary)] hover:shadow-md hover:scale-102'
                          }`}
                          data-testid={`belief-${question.id}-${option.value}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>

                    {isUnanswered && (
                      <p className="text-xs text-rose-600 dark:text-rose-400 mt-3 pl-12 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Please answer this question to continue.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tilt Preview Section */}
        {responseCount > 0 && (
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-white dark:bg-slate-800/80 rounded-2xl border border-[var(--border)] shadow-lg hover:shadow-xl transition-all duration-300 p-6 pt-12">
              <div className="absolute -top-5 left-6 z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/25 rotate-3 group-hover:rotate-0 transition-transform duration-300">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight">
                  Tilt Preview
                </h3>
                {!beliefs.tilts_allowed && (
                  <span className="flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30 px-2 py-1 rounded-full">
                    <Lock className="w-3 h-3" />
                    Locked
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--muted-foreground)] mb-6">
                Based on your responses, here's how your portfolio tilts would be configured.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                {beliefs.tilt_profile.map((tilt) => {
                  const dirConfig = DIRECTION_CONFIG[tilt.direction];
                  const intensityConfig = INTENSITY_CONFIG[tilt.intensity];
                  const DirIcon = dirConfig.icon;

                  return (
                    <div 
                      key={tilt.axis_code}
                      className={`group/card relative p-4 rounded-xl border transition-all duration-300 ${intensityConfig.borderColor} ${intensityConfig.bgColor} ${!beliefs.tilts_allowed ? 'opacity-60' : 'hover:shadow-md hover:scale-[1.02]'}`}
                      data-testid={`tilt-preview-${tilt.axis_code}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-sm font-semibold text-[var(--foreground)]">
                          {AXIS_LABELS[tilt.axis_code]}
                        </h4>
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${dirConfig.bgGradient} flex items-center justify-center shadow-sm`}>
                          <DirIcon className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-medium ${dirConfig.color}`}>
                          {dirConfig.label}
                        </span>
                        {tilt.intensity !== 'NEUTRAL' && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${intensityConfig.bgColor} ${intensityConfig.color} border ${intensityConfig.borderColor}`}>
                            {tilt.intensity}
                          </span>
                        )}
                      </div>
                      {!beliefs.tilts_allowed && (
                        <p className="text-xs text-rose-500 dark:text-rose-400 mt-3 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Captured (not applied yet)
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Transparency Section */}
        {responseCount > 0 && (
          <Collapsible open={transparencyOpen} onOpenChange={setTransparencyOpen}>
            <CollapsibleTrigger asChild>
              <button className="group/trigger flex items-center gap-3 text-sm w-full justify-between p-4 rounded-xl border border-[var(--border)] bg-white dark:bg-slate-800/80 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover/trigger:bg-[var(--primary)]/10 transition-colors">
                    <Info className="w-4 h-4 text-[var(--muted-foreground)] group-hover/trigger:text-[var(--primary)]" />
                  </div>
                  <span className="font-medium text-[var(--foreground)]">View calculation details</span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  {transparencyOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <div className="space-y-6 p-6 rounded-2xl border border-[var(--border)] bg-white dark:bg-slate-800/80 shadow-lg">
                {/* Question Responses */}
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-4">Your Responses</h4>
                  <div className="space-y-2">
                    {BELIEF_QUESTIONS.map((q) => {
                      const response = beliefs.responses[q.id];
                      if (!response) return null;
                      return (
                        <div key={q.id} className="flex justify-between items-center text-xs py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                          <span className="text-[var(--foreground)] truncate max-w-[60%]">{q.text.slice(0, 50)}...</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[var(--foreground)]">{response.label}</span>
                            <span className="text-[var(--muted-foreground)] font-mono">({response.normalised > 0 ? '+' : ''}{response.normalised.toFixed(2)})</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Axis Scores Table */}
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-4">Axis Scores</h4>
                  <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-700/50">
                          <th className="text-left py-3 px-4 font-semibold text-[var(--foreground)]">Axis</th>
                          <th className="text-right py-3 px-4 font-semibold text-[var(--foreground)]">Score</th>
                          <th className="text-right py-3 px-4 font-semibold text-[var(--foreground)]">Direction</th>
                          <th className="text-right py-3 px-4 font-semibold text-[var(--foreground)]">Intensity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {beliefs.tilt_profile.map((tilt, i) => (
                          <tr key={tilt.axis_code} className={i % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/50 dark:bg-slate-700/30'}>
                            <td className="py-3 px-4 text-[var(--foreground)] font-medium">{AXIS_LABELS[tilt.axis_code]}</td>
                            <td className="py-3 px-4 text-right font-mono text-[var(--foreground)]">{tilt.score > 0 ? '+' : ''}{tilt.score.toFixed(2)}</td>
                            <td className="py-3 px-4 text-right">
                              <span className={`font-medium ${DIRECTION_CONFIG[tilt.direction].color}`}>{tilt.direction}</span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${INTENSITY_CONFIG[tilt.intensity].bgColor} ${INTENSITY_CONFIG[tilt.intensity].color}`}>
                                {tilt.intensity}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Gate Status */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                  <h4 className="text-sm font-bold text-[var(--foreground)] mb-2">Tilts Gate Status</h4>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[var(--muted-foreground)]">Tilts Allowed:</span>
                      <span className={`font-bold ${beliefs.tilts_allowed ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {beliefs.tilts_allowed ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[var(--muted-foreground)]">Reason:</span>
                      <span className="text-[var(--foreground)]">{beliefs.tilts_gate_reason.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Validation Error Summary */}
        {attemptedSubmit && unansweredQuestions.length > 0 && (
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-start gap-4 p-5 bg-white dark:bg-slate-800/80 border-2 border-rose-500/30 rounded-2xl shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/25 flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                  Please answer all 8 questions to continue.
                </p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  {unansweredQuestions.length} question{unansweredQuestions.length > 1 ? 's' : ''} remaining.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-[var(--border)]">
          <Button
            variant="outline"
            onClick={handleBack}
            className="px-6 py-2.5"
            data-testid="beliefs-back-button"
          >
            Back
          </Button>
          <Button
            onClick={handleContinue}
            className="px-8 py-2.5 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 hover:from-[var(--primary)]/90 hover:to-[var(--primary)]/70 shadow-lg shadow-[var(--primary)]/25 transition-all duration-300"
            data-testid="beliefs-continue-button"
          >
            Continue
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
