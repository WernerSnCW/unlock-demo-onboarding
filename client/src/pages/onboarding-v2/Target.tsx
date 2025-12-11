import OnboardingLayout from '@/components/onboarding-v2/OnboardingLayout';
import { Target as TargetIcon, ArrowRight, Percent } from 'lucide-react';

export default function Target() {
  return (
    <OnboardingLayout
      stepId="target"
      title="Your Target Allocation"
      description="Based on your beliefs and analysis, here's your recommended target portfolio allocation to work towards."
    >
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-5 border border-[var(--border)] rounded-lg">
            <h3 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <span className="text-[var(--muted-foreground)]">Current</span>
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[var(--muted-foreground)]">Equities</span>
                <span className="font-semibold text-[var(--foreground)]">45%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--muted-foreground)]">Property</span>
                <span className="font-semibold text-[var(--foreground)]">35%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--muted-foreground)]">Private Equity</span>
                <span className="font-semibold text-[var(--foreground)]">12%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--muted-foreground)]">Alternatives</span>
                <span className="font-semibold text-[var(--foreground)]">8%</span>
              </div>
            </div>
          </div>

          <div className="p-5 border-2 border-[var(--primary)] rounded-lg bg-[var(--primary)]/5">
            <h3 className="font-semibold text-[var(--primary)] mb-4 flex items-center gap-2">
              <TargetIcon className="w-4 h-4" />
              Target
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[var(--muted-foreground)]">Equities</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[var(--foreground)]">50%</span>
                  <span className="text-xs text-[var(--success)]">+5%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--muted-foreground)]">Property</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[var(--foreground)]">25%</span>
                  <span className="text-xs text-[var(--destructive)]">-10%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--muted-foreground)]">Private Equity</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[var(--foreground)]">15%</span>
                  <span className="text-xs text-[var(--success)]">+3%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--muted-foreground)]">Alternatives</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[var(--foreground)]">10%</span>
                  <span className="text-xs text-[var(--success)]">+2%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 py-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-[var(--foreground)]">75%</div>
            <div className="text-sm text-[var(--muted-foreground)]">Current Alignment</div>
          </div>
          <ArrowRight className="w-8 h-8 text-[var(--primary)]" />
          <div className="text-center">
            <div className="text-3xl font-bold text-[var(--primary)]">95%</div>
            <div className="text-sm text-[var(--muted-foreground)]">Target Alignment</div>
          </div>
        </div>

        <div className="p-4 bg-[var(--muted)] rounded-lg text-center">
          <div className="flex items-center justify-center gap-2 text-[var(--muted-foreground)]">
            <Percent className="w-4 h-4" />
            <span className="text-sm">Estimated improvement in belief alignment after rebalancing</span>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}
