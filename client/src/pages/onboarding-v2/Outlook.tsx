import OnboardingLayout from '@/components/onboarding-v2/OnboardingLayout';
import { useOnboardingV2Store } from '@/state/onboardingV2Store';
import { BELIEF_QUESTIONS, SCALE_LABELS } from '@/data/beliefQuestions';
import { useLocation } from 'wouter';
import { useState, useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ANSWER_VALUES: (1 | 2 | 3 | 4 | 5)[] = [1, 2, 3, 4, 5];

export default function Outlook() {
  const [, navigate] = useLocation();
  const { outlook, setOutlookResponse, completeOutlookStep } = useOnboardingV2Store();
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const allAnswered = useMemo(
    () => BELIEF_QUESTIONS.every((q) => outlook.responses[q.id] !== undefined),
    [outlook.responses],
  );
  const answeredCount = Object.keys(outlook.responses).length;

  const handleContinue = () => {
    setAttemptedSubmit(true);
    if (!allAnswered) return;
    completeOutlookStep();
    navigate('/onboarding-v2/outlook-results');
  };

  const handleBack = () => navigate('/onboarding-v2/target');

  return (
    <OnboardingLayout
      stepId="outlook"
      title="Your outlook"
      description="These are about the world, not your portfolio — how you see the next few years playing out. We'll map them to how your actual holdings would be affected if you're right."
      hideNav={true}
    >
      <div className="space-y-6 pt-6">
        <div className="flex items-center justify-end">
          <span className="text-xs font-medium text-[var(--muted-foreground)] bg-[#2b2b2b]/50 px-3 py-1 rounded-full" data-testid="outlook-progress-indicator">
            {answeredCount}/{BELIEF_QUESTIONS.length} answered
          </span>
        </div>

        {BELIEF_QUESTIONS.map((q) => {
          const isUnanswered = attemptedSubmit && outlook.responses[q.id] === undefined;

          return (
            <div
              key={q.id}
              className={`p-4 rounded-xl border transition-colors ${
                isUnanswered
                  ? 'border-rose-300 dark:border-rose-700 bg-rose-50/50 dark:bg-rose-900/10'
                  : 'border-[var(--border)] bg-white dark:bg-slate-800/80'
              }`}
              data-testid={`outlook-question-${q.id}`}
            >
              <p className="text-sm font-medium text-[var(--foreground)] mb-3">{q.statement}</p>
              <div className="flex gap-2 flex-wrap">
                {ANSWER_VALUES.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setOutlookResponse(q.id, v)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                      outlook.responses[q.id] === v
                        ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                        : 'bg-white dark:bg-slate-800 border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)]'
                    }`}
                    data-testid={`outlook-answer-${q.id}-${v}`}
                  >
                    {SCALE_LABELS[v]}
                  </button>
                ))}
              </div>

              {isUnanswered && (
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-3 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Please answer this question to continue.
                </p>
              )}
            </div>
          );
        })}

        {attemptedSubmit && !allAnswered && (
          <p className="text-sm text-rose-600 dark:text-rose-400" data-testid="outlook-validation-error">
            Please answer all {BELIEF_QUESTIONS.length} questions to continue ({answeredCount}/{BELIEF_QUESTIONS.length} so far).
          </p>
        )}

        <div className="flex justify-between items-center pt-6 border-t border-[var(--border)]">
          <Button variant="outline" onClick={handleBack} data-testid="outlook-back-button">Back</Button>
          <Button onClick={handleContinue} disabled={!allAnswered} data-testid="outlook-continue-button">
            Continue {!allAnswered && `(${answeredCount}/${BELIEF_QUESTIONS.length})`}
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
