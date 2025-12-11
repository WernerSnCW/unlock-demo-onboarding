import { Check } from 'lucide-react';

export interface OnboardingStep {
  id: string;
  label: string;
  path: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { id: 'welcome', label: 'Welcome', path: '/onboarding-v2/welcome' },
  { id: 'method', label: 'Method', path: '/onboarding-v2/method' },
  { id: 'intake', label: 'Intake', path: '/onboarding-v2/intake' },
  { id: 'holdings', label: 'Holdings', path: '/onboarding-v2/holdings' },
  { id: 'beliefs', label: 'Beliefs', path: '/onboarding-v2/beliefs' },
  { id: 'analysis', label: 'Analysis', path: '/onboarding-v2/analysis' },
  { id: 'target', label: 'Target', path: '/onboarding-v2/target' },
  { id: 'plan', label: 'Plan', path: '/onboarding-v2/plan/transition' },
  { id: 'report', label: 'Report', path: '/onboarding-v2/report' },
];

interface StepIndicatorProps {
  currentStepId: string;
}

export default function StepIndicator({ currentStepId }: StepIndicatorProps) {
  const currentIndex = ONBOARDING_STEPS.findIndex(s => s.id === currentStepId);

  return (
    <div className="w-full py-4 px-4 bg-[var(--card)] border-b border-[var(--border)]">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
          {ONBOARDING_STEPS.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = step.id === currentStepId;
            
            return (
              <div key={step.id} className="flex items-center flex-shrink-0">
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                      ${isCompleted 
                        ? 'bg-[var(--success)] text-white' 
                        : isCurrent 
                          ? 'bg-[var(--primary)] text-white ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--card)]' 
                          : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                      }
                    `}
                    data-testid={`step-indicator-${step.id}`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                  </div>
                  <span 
                    className={`
                      mt-1 text-xs font-medium whitespace-nowrap
                      ${isCurrent ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'}
                    `}
                  >
                    {step.label}
                  </span>
                </div>
                {index < ONBOARDING_STEPS.length - 1 && (
                  <div 
                    className={`
                      w-8 h-0.5 mx-1 mt-[-16px]
                      ${isCompleted ? 'bg-[var(--success)]' : 'bg-[var(--border)]'}
                    `}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
