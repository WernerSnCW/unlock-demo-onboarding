import OnboardingLayout from '@/components/onboarding-v2/OnboardingLayout';
import { Sparkles, Shield, TrendingUp } from 'lucide-react';

export default function Welcome() {
  return (
    <OnboardingLayout
      stepId="welcome"
      title="Welcome to Unlock"
      description="Begin your personalized investment journey. We'll guide you through a simple process to understand your portfolio and create a tailored strategy."
    >
      <div className="space-y-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-[var(--muted)] rounded-lg">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--primary)] flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-[var(--foreground)] mb-2">Secure & Private</h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              Your data is encrypted and protected at every step
            </p>
          </div>
          
          <div className="text-center p-6 bg-[var(--muted)] rounded-lg">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--secondary)] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-[var(--foreground)] mb-2">AI-Powered Insights</h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              Get personalized recommendations based on your goals
            </p>
          </div>
          
          <div className="text-center p-6 bg-[var(--muted)] rounded-lg">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--accent)] flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[var(--accent-foreground)]" />
            </div>
            <h3 className="font-semibold text-[var(--foreground)] mb-2">Optimized Strategy</h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              Create a plan aligned with your investment beliefs
            </p>
          </div>
        </div>

        <div className="text-center text-sm text-[var(--muted-foreground)]">
          This process typically takes 5-10 minutes to complete.
        </div>
      </div>
    </OnboardingLayout>
  );
}
