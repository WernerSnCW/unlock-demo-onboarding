import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ArcButton } from '@/components/ui/unlock/ArcButton';
import StepIndicator, { ONBOARDING_STEPS } from './StepIndicator';
import { saveCurrentSession, setLastStepPath } from '@/lib/onboardingSync';
import GridBackground from './GridBackground';
import Header from '../Header';
import Footer from '../Footer';
import { HelpDrawerProvider, useHelpDrawer } from './help/HelpDrawerProvider';
import HelpDrawer from './help/HelpDrawer';
import HelpTrigger from './help/HelpTrigger';

interface OnboardingLayoutProps {
  stepId: string;
  title: string;
  description: string;
  children: React.ReactNode;
  nextPath?: string;
  prevPath?: string;
  hideNav?: boolean;
  wideLayout?: boolean;
}

/**
 * Wraps the layout body in the help-drawer provider so every onboarding screen
 * gets the "How this screen works" explainer for free (keyed by stepId). The
 * trigger/drawer only appear when help content exists for the step.
 */
export default function OnboardingLayout(props: OnboardingLayoutProps) {
  return (
    <HelpDrawerProvider stepId={props.stepId}>
      <OnboardingLayoutBody {...props} />
    </HelpDrawerProvider>
  );
}

function OnboardingLayoutBody({
  stepId,
  title,
  description,
  children,
  nextPath,
  prevPath,
  hideNav = false,
  wideLayout = false,
}: OnboardingLayoutProps) {
  const [location, navigate] = useLocation();
  const { open: helpOpen } = useHelpDrawer();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [stepId]);

  // Autosave the session on each step (best-effort; no-ops without a DB and
  // skips steps before there's an identifiable investor or holdings). Stores the
  // current route path so resume can navigate straight back to it.
  useEffect(() => {
    void saveCurrentSession(location);
    // Remember this step so side-trips (e.g. the feedback review) can return
    // here instead of resetting to step 1.
    setLastStepPath(location);
  }, [location]);

  const currentIndex = ONBOARDING_STEPS.findIndex(s => s.id === stepId);
  const prevStep = currentIndex > 0 ? ONBOARDING_STEPS[currentIndex - 1] : null;
  const nextStep = currentIndex < ONBOARDING_STEPS.length - 1 ? ONBOARDING_STEPS[currentIndex + 1] : null;
  
  const effectivePrevPath = prevPath ?? prevStep?.path;
  const effectiveNextPath = nextPath ?? nextStep?.path;

  return (
    <div className="relative min-h-screen bg-[var(--background)] flex flex-col">
      <GridBackground />
      {/* On large screens, squeeze the content column left of the open drawer
          so the screen stays fully readable side-by-side with the explainer. */}
      <div
        className={`relative z-10 flex flex-col flex-1 transition-[padding] duration-300 ease-out ${
          helpOpen ? 'lg:pr-[456px]' : ''
        }`}
      >
      <Header />
      <StepIndicator currentStepId={stepId} />
      
      <main className={`flex-1 mx-auto w-full px-4 py-8 ${wideLayout ? 'max-w-6xl' : 'max-w-4xl'}`}>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-8 shadow-[var(--shadow-lg)]">
          <div className="text-center mb-8">
            {currentIndex >= 0 && (
              <p className="u-eyebrow mb-3" data-testid={`eyebrow-${stepId}`}>
                Step {currentIndex + 1} of {ONBOARDING_STEPS.length}
              </p>
            )}
            <h1
              className="text-4xl font-light tracking-tight text-[var(--foreground)] mb-4"
              data-testid={`heading-${stepId}`}
            >
              {title}
            </h1>
            <p className="text-lg leading-relaxed text-[var(--muted-foreground)] max-w-2xl mx-auto">
              {description}
            </p>
            <div className="u-divider mt-6 max-w-xs mx-auto" />
          </div>

          <div className="mb-8">
            {children}
          </div>

          {!hideNav && (
            <div className="flex justify-between items-center pt-6 border-t border-[var(--border)]">
              {effectivePrevPath ? (
                <ArcButton
                  variant="outline"
                  onClick={() => navigate(effectivePrevPath)}
                  data-testid="button-back"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </ArcButton>
              ) : (
                <div />
              )}

              {effectiveNextPath && (
                <ArcButton
                  variant="primary"
                  onClick={() => navigate(effectiveNextPath)}
                  data-testid="button-next"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </ArcButton>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
      </div>

      {/* Screen explainer — appears only when help content exists for stepId. */}
      <HelpTrigger />
      <HelpDrawer />
    </div>
  );
}
