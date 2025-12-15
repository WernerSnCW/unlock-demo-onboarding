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
      gradient: 'from-[var(--primary)] to-[var(--primary)]/70',
      glowColor: 'from-[var(--primary)]/20',
      shadowColor: 'shadow-[var(--primary)]/25',
      comingSoon: true,
    },
    {
      id: 'manual',
      icon: FileSpreadsheet,
      title: 'Manual Entry',
      description: 'Enter your holdings manually step by step',
      gradient: 'from-[var(--secondary)] to-[var(--secondary)]/70',
      glowColor: 'from-[var(--secondary)]/20',
      shadowColor: 'shadow-[var(--secondary)]/25',
      comingSoon: false,
      recommended: true,
    },
    {
      id: 'connect',
      icon: Link2,
      title: 'Connect Account',
      description: 'Link your investment accounts for automatic sync',
      gradient: 'from-amber-500 to-amber-600',
      glowColor: 'from-amber-500/20',
      shadowColor: 'shadow-amber-500/25',
      comingSoon: true,
    },
    {
      id: 'advisor',
      icon: Building2,
      title: 'Advisor Import',
      description: 'Import data shared by your financial advisor',
      gradient: 'from-purple-500 to-purple-600',
      glowColor: 'from-purple-500/20',
      shadowColor: 'shadow-purple-500/25',
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
      <div className="space-y-8">
        <div className="grid md:grid-cols-2 gap-6 pt-4">
          {methods.map((method) => {
            const Icon = method.icon;
            const isSelected = intake.intake_method === method.id;
            const isDisabled = method.comingSoon;

            return (
              <div key={method.id} className="group relative h-full">
                {/* Glow effect on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${method.glowColor} to-transparent rounded-2xl blur-xl opacity-0 ${!isDisabled ? 'group-hover:opacity-100' : ''} transition-opacity duration-500`} />
                
                <button
                  onClick={() => handleSelectMethod(method.id as 'manual' | 'upload' | 'connect' | 'advisor')}
                  disabled={isDisabled}
                  className={`relative h-full w-full text-left transition-all duration-300 ${!isDisabled ? 'hover:-translate-y-1' : ''}`}
                  data-testid={`method-${method.id}`}
                >
                  <div className={`relative h-full bg-white dark:bg-slate-800/80 rounded-2xl p-6 border shadow-lg transition-all duration-300 ${
                    isSelected
                      ? 'border-[var(--primary)] shadow-xl'
                      : isDisabled
                      ? 'border-[var(--border)] opacity-60'
                      : 'border-[var(--border)] hover:shadow-xl'
                  }`}>
                    {/* Floating icon */}
                    <div className="absolute -top-5 left-6">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${method.gradient} flex items-center justify-center shadow-lg ${method.shadowColor} ${!isDisabled ? 'rotate-3 group-hover:rotate-0' : ''} transition-transform duration-300`}>
                        {isSelected ? (
                          <Check className="w-6 h-6 text-white" />
                        ) : (
                          <Icon className="w-6 h-6 text-white" />
                        )}
                      </div>
                    </div>

                    {/* Badges */}
                    {method.recommended && (
                      <span className="absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 text-white shadow-sm">
                        Recommended
                      </span>
                    )}
                    {method.comingSoon && (
                      <span className="absolute top-3 right-3 text-xs font-medium px-3 py-1 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]">
                        Coming soon
                      </span>
                    )}

                    {/* Content */}
                    <div className="pt-6">
                      <h3 className="font-semibold text-[var(--foreground)] text-lg mb-2">{method.title}</h3>
                      <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{method.description}</p>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Info box with enhanced styling */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/5 to-[var(--secondary)]/5 rounded-xl blur-xl" />
          <div className="relative bg-white/50 dark:bg-slate-800/30 backdrop-blur-sm rounded-xl p-5 border border-[var(--border)]">
            <p className="text-center text-sm text-[var(--foreground)]">
              <strong>For this demo:</strong> Click <span className="text-[var(--primary)] font-semibold">Manual Entry</span> to continue with the onboarding wizard.
              Other intake methods will be available in future releases.
            </p>
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <Button
            onClick={() => handleSelectMethod('manual')}
            className="gap-2 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 hover:from-[var(--primary)]/90 hover:to-[var(--primary)]/70 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-medium px-8 py-6 text-base"
            data-testid="button-continue-manual"
          >
            Continue with Manual Entry
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
