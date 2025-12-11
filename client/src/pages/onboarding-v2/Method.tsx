import OnboardingLayout from '@/components/onboarding-v2/OnboardingLayout';
import { Upload, FileSpreadsheet, Link2, Building2, Check } from 'lucide-react';
import { useOnboardingV2Store } from '@/state/onboardingV2Store';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';

export default function Method() {
  const { updateIntake, intake } = useOnboardingV2Store();
  const [, navigate] = useLocation();

  const handleSelectMethod = (method: 'manual' | 'upload' | 'connect' | 'advisor') => {
    if (method === 'manual') {
      updateIntake({ intake_method: method });
      navigate('/onboarding-v2/intake');
    }
  };

  const methods = [
    {
      id: 'upload',
      icon: Upload,
      title: 'Upload File',
      description: 'Upload a CSV or Excel file with your portfolio data',
      color: 'primary',
      comingSoon: true,
    },
    {
      id: 'manual',
      icon: FileSpreadsheet,
      title: 'Manual Entry',
      description: 'Enter your holdings manually step by step',
      color: 'secondary',
      comingSoon: false,
      recommended: true,
    },
    {
      id: 'connect',
      icon: Link2,
      title: 'Connect Account',
      description: 'Link your investment accounts for automatic sync',
      color: 'accent',
      comingSoon: true,
    },
    {
      id: 'advisor',
      icon: Building2,
      title: 'Advisor Import',
      description: 'Import data shared by your financial advisor',
      color: 'warning',
      comingSoon: true,
    },
  ];

  return (
    <OnboardingLayout
      stepId="method"
      title="Choose Your Intake Method"
      description="How would you like to share your portfolio information? Select the method that works best for you."
      hideNav
    >
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          {methods.map((method) => {
            const Icon = method.icon;
            const isSelected = intake.intake_method === method.id;
            const isDisabled = method.comingSoon;

            return (
              <button
                key={method.id}
                onClick={() => handleSelectMethod(method.id as 'manual' | 'upload' | 'connect' | 'advisor')}
                disabled={isDisabled}
                className={`relative p-6 border-2 rounded-lg text-left group transition-all ${
                  isSelected
                    ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                    : isDisabled
                    ? 'border-[var(--border)] opacity-60 cursor-not-allowed'
                    : 'border-[var(--border)] hover:border-[var(--primary)]'
                }`}
                data-testid={`method-${method.id}`}
              >
                {method.recommended && (
                  <span className="absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--primary)] text-white">
                    Recommended
                  </span>
                )}
                {method.comingSoon && (
                  <span className="absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)]">
                    Coming soon
                  </span>
                )}
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                      isSelected
                        ? `bg-[var(--${method.color})] text-white`
                        : `bg-[var(--${method.color})]/10 group-hover:bg-[var(--${method.color})]/20`
                    }`}
                  >
                    {isSelected ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <Icon className={`w-6 h-6 text-[var(--${method.color})]`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[var(--foreground)] mb-1">{method.title}</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">{method.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-[var(--muted)]/30 rounded-lg p-4 border border-[var(--border)]">
          <p className="text-center text-sm text-[var(--foreground)]">
            <strong>For this demo:</strong> Click <span className="text-[var(--primary)] font-medium">Manual Entry</span> to continue with the onboarding wizard.
            Other intake methods will be available in future releases.
          </p>
        </div>

        <div className="flex justify-center pt-4">
          <Button
            onClick={() => handleSelectMethod('manual')}
            className="gap-2 bg-[var(--primary)] hover:bg-[var(--primary)]/90 px-8"
            data-testid="button-continue-manual"
          >
            Continue with Manual Entry
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
