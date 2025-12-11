import OnboardingLayout from '@/components/onboarding-v2/OnboardingLayout';
import { Scale, Shield, Leaf, Globe } from 'lucide-react';

export default function Beliefs() {
  return (
    <OnboardingLayout
      stepId="beliefs"
      title="Your Investment Beliefs"
      description="Understanding your investment philosophy helps us create recommendations that align with your values and risk tolerance."
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="p-5 border border-[var(--border)] rounded-lg">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                <Scale className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[var(--foreground)] mb-2">Risk Tolerance</h3>
                <p className="text-sm text-[var(--muted-foreground)] mb-3">
                  How comfortable are you with potential investment losses?
                </p>
                <div className="flex gap-2">
                  {['Conservative', 'Moderate', 'Aggressive'].map((level) => (
                    <button
                      key={level}
                      className="px-4 py-2 text-sm border border-[var(--border)] rounded-md hover:bg-[var(--muted)] transition-colors"
                      data-testid={`belief-risk-${level.toLowerCase()}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 border border-[var(--border)] rounded-lg">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--secondary)]/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-[var(--secondary)]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[var(--foreground)] mb-2">Investment Horizon</h3>
                <p className="text-sm text-[var(--muted-foreground)] mb-3">
                  When do you expect to need access to these funds?
                </p>
                <div className="flex gap-2 flex-wrap">
                  {['1-3 years', '3-5 years', '5-10 years', '10+ years'].map((horizon) => (
                    <button
                      key={horizon}
                      className="px-4 py-2 text-sm border border-[var(--border)] rounded-md hover:bg-[var(--muted)] transition-colors"
                      data-testid={`belief-horizon-${horizon.replace(/\s+/g, '-').toLowerCase()}`}
                    >
                      {horizon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 border border-[var(--border)] rounded-lg">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--success)]/10 flex items-center justify-center flex-shrink-0">
                <Leaf className="w-5 h-5 text-[var(--success)]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[var(--foreground)] mb-2">ESG Preferences</h3>
                <p className="text-sm text-[var(--muted-foreground)] mb-3">
                  How important is environmental and social responsibility?
                </p>
                <div className="flex gap-2 flex-wrap">
                  {['Not important', 'Somewhat', 'Important', 'Critical'].map((level) => (
                    <button
                      key={level}
                      className="px-4 py-2 text-sm border border-[var(--border)] rounded-md hover:bg-[var(--muted)] transition-colors"
                      data-testid={`belief-esg-${level.replace(/\s+/g, '-').toLowerCase()}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 border border-[var(--border)] rounded-lg">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-[var(--accent)]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[var(--foreground)] mb-2">Geographic Focus</h3>
                <p className="text-sm text-[var(--muted-foreground)] mb-3">
                  Do you prefer UK-focused or global diversification?
                </p>
                <div className="flex gap-2 flex-wrap">
                  {['UK Only', 'Mostly UK', 'Balanced', 'Global'].map((focus) => (
                    <button
                      key={focus}
                      className="px-4 py-2 text-sm border border-[var(--border)] rounded-md hover:bg-[var(--muted)] transition-colors"
                      data-testid={`belief-geo-${focus.replace(/\s+/g, '-').toLowerCase()}`}
                    >
                      {focus}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}
