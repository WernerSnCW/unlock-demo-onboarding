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
  Info
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

const ANSWER_OPTIONS: { value: 1 | 2 | 3 | 4 | 5; label: string }[] = [
  { value: 1, label: 'Strongly disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly agree' },
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

const DIRECTION_CONFIG: Record<TiltDirection, { label: string; icon: typeof TrendingUp; color: string }> = {
  TOWARDS: { label: 'Lean towards', icon: TrendingUp, color: 'text-emerald-600' },
  AWAY: { label: 'Lean away', icon: TrendingDown, color: 'text-rose-600' },
  NEUTRAL: { label: 'Neutral', icon: Minus, color: 'text-slate-500' },
};

const INTENSITY_CONFIG: Record<TiltIntensity, { color: string; bgColor: string }> = {
  NEUTRAL: { color: 'text-slate-500', bgColor: 'bg-slate-100 dark:bg-slate-800' },
  LIGHT: { color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  MODERATE: { color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
  STRONG: { color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
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

  // Compute gate status on mount and whenever analysis or response count changes
  const responseCount = Object.keys(beliefs.responses).length;
  useEffect(() => {
    computeBeliefsScores();
  }, [analysis.result, responseCount, computeBeliefsScores]);

  // Check if all questions are answered
  const allAnswered = useMemo(() => {
    return BELIEF_QUESTIONS.every(q => beliefs.responses[q.id] !== undefined);
  }, [beliefs.responses]);

  // Get unanswered questions
  const unansweredQuestions = useMemo(() => {
    return BELIEF_QUESTIONS.filter(q => beliefs.responses[q.id] === undefined).map(q => q.id);
  }, [beliefs.responses]);

  // Check safety lights status
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
      <div className="space-y-8">
        {/* Gate Banner */}
        {hasAnyRed && (
          <div className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl">
            <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
                Belief tilts captured, but currently locked until red Safety Lights are addressed.
              </p>
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                {GATE_REASON_MESSAGES[beliefs.tilts_gate_reason]}
              </p>
            </div>
          </div>
        )}
        {hasAnyAmber && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Tilts are available, but amber flags suggest caution.
            </p>
          </div>
        )}
        {allGreen && (
          <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              Tilts are available and can be applied in the next step.
            </p>
          </div>
        )}

        {/* Questionnaire */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            Investment Beliefs Questionnaire
          </h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            Please indicate your level of agreement with each statement. All 8 questions are required.
          </p>

          <div className="space-y-4">
            {BELIEF_QUESTIONS.map((question, index) => {
              const response = beliefs.responses[question.id];
              const isUnanswered = attemptedSubmit && response === undefined;

              return (
                <div 
                  key={question.id}
                  className={`p-5 rounded-xl border transition-colors ${
                    isUnanswered 
                      ? 'border-rose-300 dark:border-rose-700 bg-rose-50/50 dark:bg-rose-900/10' 
                      : 'border-[var(--border)] bg-white dark:bg-slate-800/50'
                  }`}
                  data-testid={`belief-question-${question.id}`}
                >
                  <div className="flex gap-3 mb-4">
                    <span className="text-sm font-bold text-[var(--primary)] bg-[var(--primary)]/10 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </span>
                    <p className="text-sm text-[var(--foreground)] leading-relaxed pt-0.5">
                      {question.text}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pl-10">
                    {ANSWER_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setBeliefResponse(question.id, option.value)}
                        className={`px-3 py-2 text-xs rounded-lg border transition-all duration-200 ${
                          response?.answer === option.value
                            ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-md'
                            : 'bg-[var(--background)] text-[var(--foreground)] border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--muted)]/50'
                        }`}
                        data-testid={`belief-${question.id}-${option.value}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  {isUnanswered && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 mt-2 pl-10">
                      Please answer this question to continue.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tilt Preview Section */}
        {Object.keys(beliefs.responses).length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--foreground)] flex items-center gap-2">
              Tilt Preview
              {!beliefs.tilts_allowed && (
                <Lock className="w-4 h-4 text-rose-500" />
              )}
            </h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              Based on your responses, here's how your portfolio tilts would be configured.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {beliefs.tilt_profile.map((tilt) => {
                const dirConfig = DIRECTION_CONFIG[tilt.direction];
                const intensityConfig = INTENSITY_CONFIG[tilt.intensity];
                const DirIcon = dirConfig.icon;

                return (
                  <div 
                    key={tilt.axis_code}
                    className={`p-4 rounded-xl border border-[var(--border)] bg-white dark:bg-slate-800/50 ${!beliefs.tilts_allowed ? 'opacity-75' : ''}`}
                    data-testid={`tilt-preview-${tilt.axis_code}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium text-[var(--foreground)]">
                        {AXIS_LABELS[tilt.axis_code]}
                      </h4>
                      <div className={`flex items-center gap-1 ${dirConfig.color}`}>
                        <DirIcon className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${dirConfig.color}`}>
                        {dirConfig.label}
                      </span>
                      {tilt.intensity !== 'NEUTRAL' && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${intensityConfig.bgColor} ${intensityConfig.color}`}>
                          {tilt.intensity}
                        </span>
                      )}
                    </div>
                    {!beliefs.tilts_allowed && (
                      <p className="text-xs text-rose-500 mt-2 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Captured (not applied yet)
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Transparency Section */}
        {Object.keys(beliefs.responses).length > 0 && (
          <Collapsible open={transparencyOpen} onOpenChange={setTransparencyOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors w-full justify-between p-3 rounded-lg border border-[var(--border)] bg-slate-50 dark:bg-slate-800/30">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  <span>View calculation details</span>
                </div>
                {transparencyOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <div className="space-y-6 p-4 rounded-xl border border-[var(--border)] bg-slate-50 dark:bg-slate-800/30">
                {/* Question Responses */}
                <div>
                  <h4 className="text-sm font-semibold text-[var(--foreground)] mb-3">Your Responses</h4>
                  <div className="space-y-2">
                    {BELIEF_QUESTIONS.map((q) => {
                      const response = beliefs.responses[q.id];
                      if (!response) return null;
                      return (
                        <div key={q.id} className="flex justify-between items-center text-xs py-1 border-b border-[var(--border)] last:border-0">
                          <span className="text-[var(--muted-foreground)] truncate max-w-[70%]">{q.text.slice(0, 60)}...</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[var(--foreground)]">{response.label}</span>
                            <span className="text-[var(--muted-foreground)]">({response.normalised > 0 ? '+' : ''}{response.normalised.toFixed(2)})</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Axis Scores Table */}
                <div>
                  <h4 className="text-sm font-semibold text-[var(--foreground)] mb-3">Axis Scores</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-[var(--border)]">
                          <th className="text-left py-2 text-[var(--muted-foreground)]">Axis</th>
                          <th className="text-right py-2 text-[var(--muted-foreground)]">Score</th>
                          <th className="text-right py-2 text-[var(--muted-foreground)]">Direction</th>
                          <th className="text-right py-2 text-[var(--muted-foreground)]">Intensity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {beliefs.tilt_profile.map((tilt) => (
                          <tr key={tilt.axis_code} className="border-b border-[var(--border)] last:border-0">
                            <td className="py-2 text-[var(--foreground)]">{AXIS_LABELS[tilt.axis_code]}</td>
                            <td className="py-2 text-right text-[var(--foreground)]">{tilt.score > 0 ? '+' : ''}{tilt.score.toFixed(2)}</td>
                            <td className="py-2 text-right">
                              <span className={DIRECTION_CONFIG[tilt.direction].color}>{tilt.direction}</span>
                            </td>
                            <td className="py-2 text-right">
                              <span className={INTENSITY_CONFIG[tilt.intensity].color}>{tilt.intensity}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Gate Status */}
                <div>
                  <h4 className="text-sm font-semibold text-[var(--foreground)] mb-2">Tilts Gate Status</h4>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    <span className="font-medium">Tilts Allowed:</span> {beliefs.tilts_allowed ? 'Yes' : 'No'}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    <span className="font-medium">Reason:</span> {beliefs.tilts_gate_reason.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Validation Error Summary */}
        {attemptedSubmit && unansweredQuestions.length > 0 && (
          <div className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
                Please answer all 8 questions to continue.
              </p>
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                {unansweredQuestions.length} question{unansweredQuestions.length > 1 ? 's' : ''} remaining.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t border-[var(--border)]">
          <Button
            variant="outline"
            onClick={handleBack}
            data-testid="beliefs-back-button"
          >
            Back
          </Button>
          <Button
            onClick={handleContinue}
            data-testid="beliefs-continue-button"
          >
            Continue
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
