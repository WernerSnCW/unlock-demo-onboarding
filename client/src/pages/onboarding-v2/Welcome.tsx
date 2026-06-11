import OnboardingLayout from '@/components/onboarding-v2/OnboardingLayout';
import { Sparkles, Shield, TrendingUp, ArrowRight, Clock } from 'lucide-react';

export default function Welcome() {
  return (
    <OnboardingLayout
      stepId="welcome"
      title="Welcome to Unlock"
      description="Begin your personalised onboarding journey. We'll guide you through a simple process to understand your portfolio and build an illustrative picture of it."
    >
      <div className="space-y-10">
        {/* Feature Cards with enhanced depth */}
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {/* Secure & Private Card */}
          <div className="group relative h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative h-full bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-[var(--border)] shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/70 flex items-center justify-center shadow-lg shadow-[var(--primary)]/25 rotate-3 group-hover:rotate-0 transition-transform duration-300">
                  <Shield className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="pt-6 text-center">
                <h3 className="font-semibold text-[var(--foreground)] text-lg mb-2">Secure & Private</h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  Your data is encrypted and protected at every step of the journey
                </p>
              </div>
            </div>
          </div>
          
          {/* AI-Powered Card */}
          <div className="group relative h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--secondary)]/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative h-full bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-[var(--border)] shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary)]/70 flex items-center justify-center shadow-lg shadow-[var(--secondary)]/25 -rotate-3 group-hover:rotate-0 transition-transform duration-300">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="pt-6 text-center">
                <h3 className="font-semibold text-[var(--foreground)] text-lg mb-2">AI-Powered Insights</h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  See personalised analysis and considerations based on your situation
                </p>
              </div>
            </div>
          </div>
          
          {/* Optimized Strategy Card */}
          <div className="group relative h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative h-full bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-[var(--border)] shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25 rotate-3 group-hover:rotate-0 transition-transform duration-300">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="pt-6 text-center">
                <h3 className="font-semibold text-[var(--foreground)] text-lg mb-2">Options to Explore</h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  Explore illustrative options aligned with your beliefs and goals
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Time indicator with refined styling */}
        <div className="flex items-center justify-center gap-2 text-sm text-[var(--muted-foreground)]">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--muted)]/50 border border-[var(--border)]">
            <Clock className="w-4 h-4" />
            <span>5-10 minutes to complete</span>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}
