import { PersonaResult, PortfolioTrait, TraitIntensity } from '@/state/onboardingV2Store';
import { User, Target, AlertTriangle, Layers } from 'lucide-react';

interface PersonaCardProps {
  persona: PersonaResult;
}

const traitLabels: Record<string, string> = {
  risk: 'Risk Orientation',
  property_bias: 'Property Tilt',
  alts_bias: 'Alternatives Exposure',
  liquidity_comfort: 'Liquidity Resilience',
  tax_complexity: 'Tax Complexity',
  cross_border_complexity: 'Cross-Border',
};

const traitColors: Record<string, string> = {
  risk: 'bg-rose-500',
  property_bias: 'bg-amber-500',
  alts_bias: 'bg-purple-500',
  liquidity_comfort: 'bg-emerald-500',
  tax_complexity: 'bg-blue-500',
  cross_border_complexity: 'bg-cyan-500',
};

const intensityColors: Record<TraitIntensity, string> = {
  Light: 'bg-slate-400 dark:bg-slate-500',
  Moderate: 'bg-amber-500',
  High: 'bg-rose-500',
};

const intensityBgColors: Record<TraitIntensity, string> = {
  Light: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
  Moderate: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  High: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
};

export default function PersonaCard({ persona }: PersonaCardProps) {
  const displayTraits = ['risk', 'liquidity_comfort', 'alts_bias', 'property_bias'];

  return (
    <div 
      className="rounded-xl border border-[var(--border)] bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-gray-900 shadow-sm overflow-hidden"
      data-testid="persona-card"
    >
      {/* Header with gradient accent */}
      <div className="relative px-6 py-5 bg-gradient-to-r from-[var(--primary)]/10 via-[var(--secondary)]/5 to-transparent border-b border-[var(--border)]">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[var(--primary)] to-[var(--secondary)]" />
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
            <User className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-[var(--foreground)]" data-testid="persona-label">
              {persona.label}
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] mt-1" data-testid="persona-oneliner">
              {persona.one_liner}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Why This Fits You */}
        {(persona.why_fits_bullets?.length ?? 0) > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Target className="w-4 h-4 text-[var(--secondary)]" />
              Why This Fits You
            </h4>
            <ul className="space-y-2" data-testid="why-fits-list">
              {persona.why_fits_bullets?.map((bullet, i) => (
                <li 
                  key={i} 
                  className="flex items-start gap-2 text-sm text-[var(--foreground)]"
                >
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--secondary)] flex-shrink-0" />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Portfolio Traits Influencing Your Plan */}
        {(persona.portfolio_traits?.length ?? 0) > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[var(--primary)]" />
              Portfolio Traits Influencing Your Plan
            </h4>
            <div className="flex flex-wrap gap-2" data-testid="portfolio-traits-list">
              {persona.portfolio_traits?.map((trait, i) => (
                <div 
                  key={i} 
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${intensityBgColors[trait.intensity]}`}
                  data-testid={`portfolio-trait-${i}`}
                >
                  <span className={`w-2 h-2 rounded-full ${intensityColors[trait.intensity]}`} />
                  <span>{trait.name}</span>
                  <span className="opacity-70">({trait.intensity})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risks to Watch */}
        {(persona.risks_bullets?.length ?? 0) > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Risks to Watch
            </h4>
            <ul className="space-y-2" data-testid="risks-list">
              {persona.risks_bullets?.map((bullet, i) => (
                <li 
                  key={i} 
                  className="flex items-start gap-2 text-sm text-[var(--muted-foreground)]"
                >
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Trait Bars */}
        {persona.traits && (
          <div className="pt-4 border-t border-[var(--border)]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Your Profile Indicators
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" data-testid="traits-grid">
              {displayTraits.map((trait) => {
                const value = persona.traits?.[trait as keyof typeof persona.traits] ?? 0;
                const label = traitLabels[trait] || trait;
                const color = traitColors[trait] || 'bg-slate-500';
                
                return (
                  <div key={trait} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[var(--muted-foreground)]">{label}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${color} transition-all duration-500`}
                        style={{ width: `${Math.min(100, value * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-[var(--muted-foreground)] mt-3 italic">
              Indicators reflect relative positioning, not precise measurements.
            </p>
          </div>
        )}

        {/* Advisory disclaimer */}
        <div className="pt-4 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            Personas are directional profiles based on your responses, not regulated financial advice. 
            Your actual situation may require professional guidance tailored to your circumstances.
          </p>
        </div>
      </div>
    </div>
  );
}
