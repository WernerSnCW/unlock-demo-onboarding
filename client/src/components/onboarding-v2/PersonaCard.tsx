import { PersonaResult, PortfolioTrait, TraitIntensity, RiskToWatch, ProfileIndicator } from '@/state/onboardingV2Store';
import { User, Target, AlertTriangle, Layers, BarChart3 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PersonaCardProps {
  persona: PersonaResult;
}

// Trait visibility rules per spec
const ALWAYS_SHOW_TRAITS = new Set([
  'Liquidity Resilience',
  'Concentration',
  'Crypto Allocation',
  'Private Business Exposure',
  'DB Pension Context',
  'Cross-border Complexity',
]);

const CONDITIONAL_TRAITS = new Set([
  'Employer Stock',
  'Illiquids Exposure',
]);

// Priority order for chip display (max 6)
const TRAIT_PRIORITY: string[] = [
  'Concentration',
  'Liquidity Resilience',
  'Private Business Exposure',
  'Crypto Allocation',
  'DB Pension Context',
  'Cross-border Complexity',
  'Employer Stock',
  'Illiquids Exposure',
];

const MAX_VISIBLE_CHIPS = 6;

function filterAndSortTraits(traits: PortfolioTrait[]): { visible: PortfolioTrait[], hiddenCount: number } {
  // Track traits hidden by conditional rules
  let conditionallyHiddenCount = 0;
  
  // Filter based on visibility rules (create a new array to avoid mutation)
  const filteredTraits = [...traits].filter(trait => {
    if (ALWAYS_SHOW_TRAITS.has(trait.name)) {
      return true;
    }
    if (CONDITIONAL_TRAITS.has(trait.name)) {
      // Only show if Moderate or Strong
      const shouldShow = trait.intensity === 'Moderate' || trait.intensity === 'Strong';
      if (!shouldShow) {
        conditionallyHiddenCount++;
      }
      return shouldShow;
    }
    // Show other traits by default
    return true;
  });

  // Sort by priority (already working on a copy)
  filteredTraits.sort((a, b) => {
    const aIdx = TRAIT_PRIORITY.indexOf(a.name);
    const bIdx = TRAIT_PRIORITY.indexOf(b.name);
    const aPriority = aIdx === -1 ? TRAIT_PRIORITY.length : aIdx;
    const bPriority = bIdx === -1 ? TRAIT_PRIORITY.length : bIdx;
    return aPriority - bPriority;
  });

  // Limit to max chips
  const visible = filteredTraits.slice(0, MAX_VISIBLE_CHIPS);
  // Total hidden = traits dropped by max limit + traits dropped by conditional rules
  const hiddenByMaxLimit = filteredTraits.length - visible.length;
  const hiddenCount = hiddenByMaxLimit + conditionallyHiddenCount;

  return { visible, hiddenCount };
}

const intensityColors: Record<TraitIntensity, string> = {
  Light: 'bg-slate-400 dark:bg-slate-500',
  Moderate: 'bg-[var(--warning)]',
  Strong: 'bg-[var(--primary)]',
};

const intensityBgColors: Record<TraitIntensity, string> = {
  Light: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
  Moderate: 'bg-[#f59e0b]/10 text-[var(--warning)]',
  Strong: 'bg-[#00bb77]/10 text-[var(--primary)]',
};

const indicatorColors: Record<string, string> = {
  'Risk Orientation': 'bg-[var(--u-viz-1)]',
  'Liquidity Resilience': 'bg-[var(--u-viz-2)]',
  'Alternatives Exposure': 'bg-[var(--u-viz-4)]',
  'Property Tilt': 'bg-[var(--u-viz-3)]',
};

export default function PersonaCard({ persona }: PersonaCardProps) {
  return (
    <div 
      className="rounded-xl border border-[var(--border)] bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-gray-900 shadow-sm overflow-hidden"
      data-testid="persona-card"
    >
      {/* Header with gradient accent */}
      <div className="relative px-6 py-5 bg-gradient-to-r from-[#00bb77]/10 via-[#008655]/5 to-transparent border-b border-[var(--border)]">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[var(--primary)] to-[var(--secondary)]" />
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-[#00bb77]/10 text-[var(--primary)]">
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
        {(persona.portfolio_traits?.length ?? 0) > 0 && (() => {
          const { visible, hiddenCount } = filterAndSortTraits(persona.portfolio_traits || []);
          return (
            <div className="space-y-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[var(--primary)]" />
                Portfolio Traits
              </h4>
              <div className="flex flex-wrap gap-2" data-testid="portfolio-traits-list">
                {visible.map((trait, i) => (
                  <TooltipProvider key={i}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium cursor-help ${intensityBgColors[trait.intensity]}`}
                          data-testid={`portfolio-trait-${i}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${intensityColors[trait.intensity]}`} />
                          <span>{trait.name}</span>
                          <span className="opacity-70">({trait.intensity})</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{trait.detail}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
              {hiddenCount > 0 && (
                <p className="text-xs text-[var(--muted-foreground)] italic">
                  Additional context captured (not shown).
                </p>
              )}
            </div>
          );
        })()}

        {/* Risks to Watch - using new data-triggered risks */}
        {(persona.risks_to_watch?.length ?? 0) > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Risks to Watch
            </h4>
            <ul className="space-y-2" data-testid="risks-list">
              {persona.risks_to_watch?.map((risk, i) => (
                <li 
                  key={i} 
                  className="flex items-start gap-2 text-sm text-[var(--muted-foreground)]"
                >
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                  {risk.text}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Profile Indicators (I1-I4) */}
        {(persona.profile_indicators?.length ?? 0) > 0 && (
          <div className="pt-4 border-t border-[var(--border)]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5" />
              Your Profile Indicators
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" data-testid="indicators-grid">
              {persona.profile_indicators?.map((indicator, i) => {
                const color = indicatorColors[indicator.name] || 'bg-slate-500';
                
                return (
                  <TooltipProvider key={i}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="space-y-1.5 cursor-help">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-[var(--muted-foreground)] truncate">
                              {indicator.name}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${color} transition-all duration-500`}
                              style={{ width: `${indicator.value}%` }}
                            />
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{indicator.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
