import { Link, useLocation } from 'wouter';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StepIndicator, { ONBOARDING_STEPS } from './StepIndicator';
import Header from '../Header';
import Footer from '../Footer';

interface OnboardingLayoutProps {
  stepId: string;
  title: string;
  description: string;
  children: React.ReactNode;
  nextPath?: string;
  prevPath?: string;
  hideNav?: boolean;
}

export default function OnboardingLayout({
  stepId,
  title,
  description,
  children,
  nextPath,
  prevPath,
  hideNav = false,
}: OnboardingLayoutProps) {
  const [, navigate] = useLocation();
  
  const currentIndex = ONBOARDING_STEPS.findIndex(s => s.id === stepId);
  const prevStep = currentIndex > 0 ? ONBOARDING_STEPS[currentIndex - 1] : null;
  const nextStep = currentIndex < ONBOARDING_STEPS.length - 1 ? ONBOARDING_STEPS[currentIndex + 1] : null;
  
  const effectivePrevPath = prevPath ?? prevStep?.path;
  const effectiveNextPath = nextPath ?? nextStep?.path;

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <Header />
      <StepIndicator currentStepId={stepId} />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 
              className="text-3xl font-bold text-[var(--foreground)] mb-4"
              data-testid={`heading-${stepId}`}
            >
              {title}
            </h1>
            <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
              {description}
            </p>
          </div>

          <div className="mb-8">
            {children}
          </div>

          {!hideNav && (
            <div className="flex justify-between items-center pt-6 border-t border-[var(--border)]">
              {effectivePrevPath ? (
                <Button
                  variant="outline"
                  onClick={() => navigate(effectivePrevPath)}
                  className="gap-2"
                  data-testid="button-back"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              ) : (
                <div />
              )}
              
              {effectiveNextPath && (
                <Button
                  onClick={() => navigate(effectiveNextPath)}
                  className="gap-2 bg-[var(--primary)] hover:bg-[var(--primary)]/90"
                  data-testid="button-next"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
