import OnboardingLayout from '@/components/onboarding-v2/OnboardingLayout';
import { Scale, Shield, Leaf, Globe, Info } from 'lucide-react';
import { useState } from 'react';

export default function Beliefs() {
  const [selectedRisk, setSelectedRisk] = useState<string | null>(null);
  const [selectedHorizon, setSelectedHorizon] = useState<string | null>(null);
  const [selectedEsg, setSelectedEsg] = useState<string | null>(null);
  const [selectedGeo, setSelectedGeo] = useState<string | null>(null);

  const beliefCards = [
    {
      id: 'risk',
      icon: Scale,
      title: 'Risk Tolerance',
      description: 'How comfortable are you with potential investment losses?',
      gradient: 'from-[var(--primary)] to-[var(--primary)]/70',
      glowColor: 'from-[var(--primary)]/20',
      shadowColor: 'shadow-[var(--primary)]/25',
      options: ['Conservative', 'Moderate', 'Aggressive'],
      selected: selectedRisk,
      setSelected: setSelectedRisk,
    },
    {
      id: 'horizon',
      icon: Shield,
      title: 'Investment Horizon',
      description: 'When do you expect to need access to these funds?',
      gradient: 'from-[var(--secondary)] to-[var(--secondary)]/70',
      glowColor: 'from-[var(--secondary)]/20',
      shadowColor: 'shadow-[var(--secondary)]/25',
      options: ['1-3 years', '3-5 years', '5-10 years', '10+ years'],
      selected: selectedHorizon,
      setSelected: setSelectedHorizon,
    },
    {
      id: 'esg',
      icon: Leaf,
      title: 'ESG Preferences',
      description: 'How important is environmental and social responsibility?',
      gradient: 'from-emerald-500 to-emerald-600',
      glowColor: 'from-emerald-500/20',
      shadowColor: 'shadow-emerald-500/25',
      options: ['Not important', 'Somewhat', 'Important', 'Critical'],
      selected: selectedEsg,
      setSelected: setSelectedEsg,
    },
    {
      id: 'geo',
      icon: Globe,
      title: 'Geographic Focus',
      description: 'Do you prefer UK-focused or global diversification?',
      gradient: 'from-amber-500 to-amber-600',
      glowColor: 'from-amber-500/20',
      shadowColor: 'shadow-amber-500/25',
      options: ['UK Only', 'Mostly UK', 'Balanced', 'Global'],
      selected: selectedGeo,
      setSelected: setSelectedGeo,
    },
  ];

  return (
    <OnboardingLayout
      stepId="beliefs"
      title="Your Investment Beliefs"
      description="Understanding your investment philosophy helps us create recommendations that align with your values and risk tolerance."
    >
      <div className="space-y-8">
        {/* Info banner with enhanced styling */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/10 to-transparent rounded-xl blur-lg" />
          <div className="relative flex items-start gap-3 p-4 bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-[var(--border)] rounded-xl">
            <div className="p-2 rounded-lg bg-[var(--primary)]/10">
              <Info className="w-4 h-4 text-[var(--primary)]" />
            </div>
            <p className="text-sm text-[var(--muted-foreground)] pt-1">
              Belief settings are optional in this version; defaults will be used if you skip this step.
            </p>
          </div>
        </div>

        {/* Belief cards with enhanced depth */}
        <div className="grid md:grid-cols-2 gap-6 pt-2">
          {beliefCards.map((card) => {
            const Icon = card.icon;
            
            return (
              <div key={card.id} className="group relative">
                {/* Glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.glowColor} to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative bg-white dark:bg-slate-800/80 rounded-2xl border border-[var(--border)] shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden h-full">
                  {/* Floating icon */}
                  <div className="absolute -top-4 left-5">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg ${card.shadowColor} rotate-3 group-hover:rotate-0 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <div className="p-6 pt-10">
                    <h3 className="font-semibold text-[var(--foreground)] text-lg mb-2">{card.title}</h3>
                    <p className="text-sm text-[var(--muted-foreground)] mb-4 leading-relaxed">
                      {card.description}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {card.options.map((option) => (
                        <button
                          key={option}
                          onClick={() => card.setSelected(option)}
                          className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 ${
                            card.selected === option
                              ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-md'
                              : 'bg-[var(--background)] text-[var(--foreground)] border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--muted)]/50'
                          }`}
                          data-testid={`belief-${card.id}-${option.replace(/\s+/g, '-').toLowerCase()}`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </OnboardingLayout>
  );
}
