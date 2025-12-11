import OnboardingLayout from '@/components/onboarding-v2/OnboardingLayout';
import { Upload, FileSpreadsheet, Link2, Building2 } from 'lucide-react';

export default function Method() {
  return (
    <OnboardingLayout
      stepId="method"
      title="Choose Your Intake Method"
      description="How would you like to share your portfolio information? Select the method that works best for you."
    >
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <button 
            className="p-6 border-2 border-[var(--border)] rounded-lg hover:border-[var(--primary)] transition-colors text-left group"
            data-testid="method-upload"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center group-hover:bg-[var(--primary)]/20 transition-colors">
                <Upload className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)] mb-1">Upload File</h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Upload a CSV or Excel file with your portfolio data
                </p>
              </div>
            </div>
          </button>

          <button 
            className="p-6 border-2 border-[var(--border)] rounded-lg hover:border-[var(--primary)] transition-colors text-left group"
            data-testid="method-manual"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-[var(--secondary)]/10 flex items-center justify-center group-hover:bg-[var(--secondary)]/20 transition-colors">
                <FileSpreadsheet className="w-6 h-6 text-[var(--secondary)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)] mb-1">Manual Entry</h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Enter your holdings manually step by step
                </p>
              </div>
            </div>
          </button>

          <button 
            className="p-6 border-2 border-[var(--border)] rounded-lg hover:border-[var(--primary)] transition-colors text-left group"
            data-testid="method-connect"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center group-hover:bg-[var(--accent)]/20 transition-colors">
                <Link2 className="w-6 h-6 text-[var(--accent)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)] mb-1">Connect Account</h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Link your investment accounts for automatic sync
                </p>
              </div>
            </div>
          </button>

          <button 
            className="p-6 border-2 border-[var(--border)] rounded-lg hover:border-[var(--primary)] transition-colors text-left group"
            data-testid="method-advisor"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-[var(--warning)]/10 flex items-center justify-center group-hover:bg-[var(--warning)]/20 transition-colors">
                <Building2 className="w-6 h-6 text-[var(--warning)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)] mb-1">Advisor Import</h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Import data shared by your financial advisor
                </p>
              </div>
            </div>
          </button>
        </div>

        <p className="text-center text-sm text-[var(--muted-foreground)]">
          For this demo, click Next to continue with sample data.
        </p>
      </div>
    </OnboardingLayout>
  );
}
