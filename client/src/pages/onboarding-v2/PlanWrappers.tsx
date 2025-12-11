import OnboardingLayout from '@/components/onboarding-v2/OnboardingLayout';
import { Shield, Wallet, Building2, Banknote } from 'lucide-react';

export default function PlanWrappers() {
  return (
    <OnboardingLayout
      stepId="plan-wrappers"
      title="Recommended Wrappers"
      description="Optimize your tax efficiency by using the right investment wrappers for each asset class."
    >
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-5 border border-[var(--border)] rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)]">ISA</h3>
                <p className="text-xs text-[var(--muted-foreground)]">Tax-free growth & income</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Current</span>
                <span className="font-medium text-[var(--foreground)]">£85,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Recommended</span>
                <span className="font-medium text-[var(--success)]">£120,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Annual Allowance</span>
                <span className="font-medium text-[var(--foreground)]">£20,000</span>
              </div>
            </div>
          </div>

          <div className="p-5 border border-[var(--border)] rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--secondary)]/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[var(--secondary)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)]">Pension</h3>
                <p className="text-xs text-[var(--muted-foreground)]">Tax relief on contributions</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Current</span>
                <span className="font-medium text-[var(--foreground)]">£145,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Recommended</span>
                <span className="font-medium text-[var(--success)]">£200,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Annual Allowance</span>
                <span className="font-medium text-[var(--foreground)]">£60,000</span>
              </div>
            </div>
          </div>

          <div className="p-5 border border-[var(--border)] rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--success)]/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[var(--success)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)]">EIS/SEIS</h3>
                <p className="text-xs text-[var(--muted-foreground)]">30-50% income tax relief</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Current</span>
                <span className="font-medium text-[var(--foreground)]">£25,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Recommended</span>
                <span className="font-medium text-[var(--success)]">£50,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Annual Limit</span>
                <span className="font-medium text-[var(--foreground)]">£1,000,000</span>
              </div>
            </div>
          </div>

          <div className="p-5 border border-[var(--border)] rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--warning)]/10 flex items-center justify-center">
                <Banknote className="w-5 h-5 text-[var(--warning)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)]">GIA</h3>
                <p className="text-xs text-[var(--muted-foreground)]">Taxable - use CGT allowance</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Current</span>
                <span className="font-medium text-[var(--foreground)]">£95,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Recommended</span>
                <span className="font-medium text-[var(--destructive)]">£80,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">CGT Allowance</span>
                <span className="font-medium text-[var(--foreground)]">£3,000</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[var(--success)]/10 border border-[var(--success)]/30 rounded-lg">
          <h4 className="font-semibold text-[var(--foreground)] mb-2">Potential Tax Savings</h4>
          <p className="text-sm text-[var(--muted-foreground)]">
            By optimizing your wrapper usage, you could save an estimated <span className="font-bold text-[var(--success)]">£4,500</span> per year in taxes.
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
}
