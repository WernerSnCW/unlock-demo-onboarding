import { PersonaResult } from '@/state/onboardingV2Store';
import { User, Target, AlertTriangle, Activity } from 'lucide-react';

interface PersonaCardProps {
  persona: PersonaResult;
}

const traitLabels: Record<string, string> = {
  risk: 'Risk Appetite',
  property_bias: 'Property Focus',
  alts_bias: 'Alternatives',
  liquidity_comfort: 'Liquidity',
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

export default function PersonaCard({ persona }: PersonaCardProps) {
  const displayTraits = ['risk', 'property_bias', 'alts_bias', 'liquidity_comfort'];

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

        {/* What This Means For Your Plan */}
        {(persona.plan_focus_bullets?.length ?? 0) > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[var(--primary)]" />
              What This Means For Your Plan
            </h4>
            <ul className="space-y-2" data-testid="plan-focus-list">
              {persona.plan_focus_bullets?.map((bullet, i) => (
                <li 
                  key={i} 
                  className="flex items-start gap-2 text-sm text-[var(--foreground)]"
                >
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--primary)] flex-shrink-0" />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Risks to Watch (optional) */}
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

        {/* Trait Bar */}
        {persona.traits && (
          <div className="pt-4 border-t border-[var(--border)]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Your Profile Traits
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
                      <span className="text-xs font-bold text-[var(--foreground)]">{Math.round(value * 100)}%</span>
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
          </div>
        )}
      </div>
    </div>
  );
}
