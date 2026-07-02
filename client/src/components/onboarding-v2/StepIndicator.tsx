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
  { id: 'analysis', label: 'Analysis', path: '/onboarding-v2/analysis' },
  { id: 'beliefs', label: 'Beliefs', path: '/onboarding-v2/beliefs' },
  { id: 'target', label: 'Scenario', path: '/onboarding-v2/target' },
  { id: 'outlook', label: 'Outlook', path: '/onboarding-v2/outlook' },
  { id: 'outlook-results', label: 'Impact', path: '/onboarding-v2/outlook-results' },
  { id: 'outlook-alternatives', label: 'Alternatives', path: '/onboarding-v2/outlook-alternatives' },
  { id: 'next-steps', label: 'Next Steps', path: '/onboarding-v2/next-steps' },
  { id: 'plan-transition', label: 'Transition', path: '/onboarding-v2/plan/transition' },
  { id: 'plan-wrappers', label: 'Wrappers', path: '/onboarding-v2/plan/wrappers' },
];

export const TOTAL_STEPS = ONBOARDING_STEPS.length;

interface StepIndicatorProps {
  currentStepId: string;
}

export default function StepIndicator({ currentStepId }: StepIndicatorProps) {
  const currentIndex = ONBOARDING_STEPS.findIndex(s => s.id === currentStepId);

  return (
    <div className="w-full py-3 px-2 bg-[var(--card)] border-b border-[var(--border)]">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          {ONBOARDING_STEPS.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = step.id === currentStepId;
            
            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all
                      ${isCompleted 
                        ? 'bg-[var(--success)] text-white' 
                        : isCurrent 
                          ? 'bg-[var(--primary)] text-white ring-2 ring-[var(--primary)] ring-offset-1 ring-offset-[var(--card)]' 
                          : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                      }
                    `}
                    data-testid={`step-indicator-${step.id}`}
                  >
                    {isCompleted ? <Check className="w-3 h-3" /> : index + 1}
                  </div>
                  <span 
                    className={`
                      mt-1 text-[10px] font-medium whitespace-nowrap
                      ${isCurrent ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'}
                    `}
                  >
                    {step.label}
                  </span>
                </div>
                {index < ONBOARDING_STEPS.length - 1 && (
                  <div 
                    className={`
                      flex-1 h-0.5 mx-1 mt-[-12px] min-w-2
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
