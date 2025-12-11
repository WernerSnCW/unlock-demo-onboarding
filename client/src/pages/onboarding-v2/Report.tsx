import { Link } from 'wouter';
import OnboardingLayout from '@/components/onboarding-v2/OnboardingLayout';
import { FileText, Download, Share2, CheckCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Report() {
  return (
    <OnboardingLayout
      stepId="report"
      title="Your Personalized Report"
      description="Congratulations! Your onboarding is complete. Here's a summary of your personalized investment plan."
      hideNav
    >
      <div className="space-y-6">
        <div className="p-6 bg-[var(--success)]/10 border border-[var(--success)]/30 rounded-lg text-center">
          <CheckCircle className="w-12 h-12 text-[var(--success)] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Onboarding Complete!</h3>
          <p className="text-[var(--muted-foreground)]">
            Your personalized investment strategy has been created based on your portfolio and beliefs.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 border border-[var(--border)] rounded-lg text-center">
            <div className="text-2xl font-bold text-[var(--primary)]">£800k</div>
            <div className="text-sm text-[var(--muted-foreground)]">Total Portfolio</div>
          </div>
          <div className="p-4 border border-[var(--border)] rounded-lg text-center">
            <div className="text-2xl font-bold text-[var(--success)]">95%</div>
            <div className="text-sm text-[var(--muted-foreground)]">Target Alignment</div>
          </div>
          <div className="p-4 border border-[var(--border)] rounded-lg text-center">
            <div className="text-2xl font-bold text-[var(--secondary)]">£4.5k</div>
            <div className="text-sm text-[var(--muted-foreground)]">Est. Annual Savings</div>
          </div>
        </div>

        <div className="p-5 border border-[var(--border)] rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 text-[var(--primary)]" />
            <h3 className="font-semibold text-[var(--foreground)]">Your Report Includes</h3>
          </div>
          <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[var(--success)]" />
              Complete portfolio analysis
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[var(--success)]" />
              Belief alignment assessment
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[var(--success)]" />
              Target allocation recommendations
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[var(--success)]" />
              Phased transition plan
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[var(--success)]" />
              Tax wrapper optimization
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" className="gap-2 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all duration-200" data-testid="button-download-report">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
          <Button variant="outline" className="gap-2 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all duration-200" data-testid="button-share-report">
            <Share2 className="w-4 h-4" />
            Share with Advisor
          </Button>
        </div>

        <div className="pt-6 border-t border-[var(--border)]">
          <Link href="/">
            <Button className="w-full gap-2 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 hover:from-[var(--primary)]/90 hover:to-[var(--primary)]/70 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium" data-testid="button-go-home">
              <Home className="w-4 h-4" />
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </OnboardingLayout>
  );
}
