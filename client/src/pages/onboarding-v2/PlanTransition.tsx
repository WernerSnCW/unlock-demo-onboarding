import OnboardingLayout from '@/components/onboarding-v2/OnboardingLayout';
import { ArrowRightLeft, Clock, AlertCircle, CheckCircle } from 'lucide-react';

export default function PlanTransition() {
  return (
    <OnboardingLayout
      stepId="plan-transition"
      title="Transition Plan"
      description="Here's a phased approach to move from your current allocation to your target portfolio while minimizing tax impact and transaction costs."
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="p-5 border border-[var(--border)] rounded-lg">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-bold flex-shrink-0">
                1
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-[var(--foreground)]">Immediate Actions</h3>
                  <span className="text-xs px-2 py-0.5 bg-[var(--success)]/10 text-[var(--success)] rounded-full">Low Risk</span>
                </div>
                <p className="text-sm text-[var(--muted-foreground)] mb-3">
                  Redirect new contributions to underweight asset classes
                </p>
                <ul className="text-sm text-[var(--muted-foreground)] space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                    Increase ISA equity contributions
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                    Explore EIS/SEIS opportunities for private equity exposure
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-5 border border-[var(--border)] rounded-lg">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--secondary)] flex items-center justify-center text-white font-bold flex-shrink-0">
                2
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-[var(--foreground)]">Short-term (3-6 months)</h3>
                  <span className="text-xs px-2 py-0.5 bg-[var(--warning)]/10 text-[var(--warning)] rounded-full">Medium</span>
                </div>
                <p className="text-sm text-[var(--muted-foreground)] mb-3">
                  Begin strategic rebalancing within tax wrappers
                </p>
                <ul className="text-sm text-[var(--muted-foreground)] space-y-1">
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[var(--warning)]" />
                    Rebalance pension holdings (no CGT implications)
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[var(--warning)]" />
                    Review property portfolio for underperformers
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-5 border border-[var(--border)] rounded-lg">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center text-[var(--accent-foreground)] font-bold flex-shrink-0">
                3
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-[var(--foreground)]">Long-term (6-18 months)</h3>
                  <span className="text-xs px-2 py-0.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full">Strategic</span>
                </div>
                <p className="text-sm text-[var(--muted-foreground)] mb-3">
                  Optimize property exposure and maximize tax efficiency
                </p>
                <ul className="text-sm text-[var(--muted-foreground)] space-y-1">
                  <li className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[var(--primary)]" />
                    Consider property sale timing for CGT optimization
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[var(--primary)]" />
                    Explore REIT alternatives for property exposure
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[var(--muted)] rounded-lg flex items-center gap-3">
          <ArrowRightLeft className="w-5 h-5 text-[var(--primary)]" />
          <p className="text-sm text-[var(--muted-foreground)]">
            Continue to the next step to see recommended tax wrappers for your transition.
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
}
