import OnboardingLayout from '@/components/onboarding-v2/OnboardingLayout';
import { Briefcase, Building, TrendingUp, Gem } from 'lucide-react';

export default function Holdings() {
  return (
    <OnboardingLayout
      stepId="holdings"
      title="Your Current Holdings"
      description="Review and confirm your portfolio holdings. This is where we capture the assets you currently own across all investment categories."
    >
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-5 border border-[var(--border)] rounded-lg bg-[var(--muted)]/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)]">Traditional Assets</h3>
                <p className="text-sm text-[var(--muted-foreground)]">Stocks, bonds, ETFs, funds</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-[var(--foreground)]">£250,000</div>
            <div className="text-sm text-[var(--muted-foreground)]">12 holdings</div>
          </div>

          <div className="p-5 border border-[var(--border)] rounded-lg bg-[var(--muted)]/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--secondary)]/10 flex items-center justify-center">
                <Building className="w-5 h-5 text-[var(--secondary)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)]">Property</h3>
                <p className="text-sm text-[var(--muted-foreground)]">Residential, commercial, REITs</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-[var(--foreground)]">£450,000</div>
            <div className="text-sm text-[var(--muted-foreground)]">2 properties</div>
          </div>

          <div className="p-5 border border-[var(--border)] rounded-lg bg-[var(--muted)]/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-[var(--accent)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)]">Private Equity</h3>
                <p className="text-sm text-[var(--muted-foreground)]">Startups, EIS/SEIS, syndicates</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-[var(--foreground)]">£75,000</div>
            <div className="text-sm text-[var(--muted-foreground)]">5 investments</div>
          </div>

          <div className="p-5 border border-[var(--border)] rounded-lg bg-[var(--muted)]/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--warning)]/10 flex items-center justify-center">
                <Gem className="w-5 h-5 text-[var(--warning)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)]">Alternatives</h3>
                <p className="text-sm text-[var(--muted-foreground)]">Art, collectibles, crypto</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-[var(--foreground)]">£25,000</div>
            <div className="text-sm text-[var(--muted-foreground)]">3 items</div>
          </div>
        </div>

        <div className="text-center p-4 bg-[var(--primary)]/5 rounded-lg border border-[var(--primary)]/20">
          <div className="text-sm text-[var(--muted-foreground)]">Total Portfolio Value</div>
          <div className="text-3xl font-bold text-[var(--primary)]">£800,000</div>
        </div>

        <p className="text-center text-sm text-[var(--muted-foreground)]">
          Sample data shown for demo purposes. In the live version, this will reflect your actual holdings.
        </p>
      </div>
    </OnboardingLayout>
  );
}
