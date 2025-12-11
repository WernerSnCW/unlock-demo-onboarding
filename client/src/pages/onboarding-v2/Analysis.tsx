import OnboardingLayout from '@/components/onboarding-v2/OnboardingLayout';
import { BarChart3, PieChart, AlertTriangle, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function Analysis() {
  return (
    <OnboardingLayout
      stepId="analysis"
      title="Portfolio Analysis"
      description="We've analyzed your portfolio against your stated beliefs and preferences. Here's what we found."
    >
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-5 border border-[var(--border)] rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                <PieChart className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <h3 className="font-semibold text-[var(--foreground)]">Asset Allocation</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[var(--muted-foreground)]">Equities</span>
                  <span className="font-medium text-[var(--foreground)]">45%</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[var(--muted-foreground)]">Property</span>
                  <span className="font-medium text-[var(--foreground)]">35%</span>
                </div>
                <Progress value={35} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[var(--muted-foreground)]">Alternatives</span>
                  <span className="font-medium text-[var(--foreground)]">20%</span>
                </div>
                <Progress value={20} className="h-2" />
              </div>
            </div>
          </div>

          <div className="p-5 border border-[var(--border)] rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--success)]/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-[var(--success)]" />
              </div>
              <h3 className="font-semibold text-[var(--foreground)]">Belief Alignment</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[var(--muted-foreground)]">Risk Match</span>
                  <span className="font-medium text-[var(--success)]">85%</span>
                </div>
                <Progress value={85} className="h-2 [&>div]:bg-[var(--success)]" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[var(--muted-foreground)]">ESG Alignment</span>
                  <span className="font-medium text-[var(--warning)]">62%</span>
                </div>
                <Progress value={62} className="h-2 [&>div]:bg-[var(--warning)]" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[var(--muted-foreground)]">Geographic Fit</span>
                  <span className="font-medium text-[var(--success)]">78%</span>
                </div>
                <Progress value={78} className="h-2 [&>div]:bg-[var(--success)]" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 border border-[var(--warning)]/30 rounded-lg bg-[var(--warning)]/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[var(--warning)] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-[var(--foreground)] mb-1">Areas for Improvement</h4>
              <ul className="text-sm text-[var(--muted-foreground)] space-y-1">
                <li>Consider increasing ESG-focused investments to match your stated preferences</li>
                <li>Property concentration is higher than typical for your risk profile</li>
                <li>Limited international diversification may increase regional risk</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-5 border border-[var(--success)]/30 rounded-lg bg-[var(--success)]/5">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-[var(--success)] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-[var(--foreground)] mb-1">Strengths</h4>
              <ul className="text-sm text-[var(--muted-foreground)] space-y-1">
                <li>Good diversification across asset classes</li>
                <li>Risk level aligns well with your stated tolerance</li>
                <li>Strong allocation to tax-efficient wrappers (ISA, pension)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}
