import OnboardingLayout from '@/components/onboarding-v2/OnboardingLayout';
import { 
  useOnboardingV2Store,
  ScenarioType,
  AllocationBand,
  AppliedTiltEntry,
  BindingConstraint,
  IllustrativeScenario,
} from '@/state/onboardingV2Store';
import { useLocation } from 'wouter';
import { useEffect, useMemo, useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  Lock,
  Check,
  X,
  Info,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Target as TargetIcon,
  Scale,
  ChevronRight,
  HelpCircle,
  Bug,
  Activity,
  Circle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  computeDelta,
  computeTotalMovement,
  computeGuardrailImpacts,
  computeSafetyLightsForScenario,
  generateChangeBullets,
  hasAnyRedLightFromResult,
  computeMovementLimitedCallout,
  checkRangesIdenticalAcrossScenarios,
  computeExamplePortfolioSet,
  generateExampleDiffersSummary,
  pctToMonetary,
  formatMonetary,
  formatMonetaryNoSign,
  formatMonetaryRange,
  computeMonetaryDelta,
  formatTotalMonetaryMovement,
  MONETARY_DISCLAIMER,
  type DeltaResult,
  type ExampleType,
  type ExamplePortfolioSet,
  type DisplayMode,
} from '@/lib/step7Helpers';

const TOTAL_BELIEF_AXES = 8;

interface RangeBarRow {
  label: string;
  currentPct: number;
  minPct: number;
  maxPct: number;
}

interface ScenarioRangeOverlay {
  scenarioType: ScenarioType;
  label: string;
  color: string;
  rows: RangeBarRow[];
}

function RangeBarChart({ 
  title, 
  rows, 
  showMidpoint = true,
  overlays = [],
  showOverlayMode = false,
  exampleValuesBySleeveMap,
  showExample = false,
  displayMode = 'percent',
  totalValue = 0,
}: { 
  title: string; 
  rows: RangeBarRow[]; 
  showMidpoint?: boolean;
  overlays?: ScenarioRangeOverlay[];
  showOverlayMode?: boolean;
  exampleValuesBySleeveMap?: Map<string, number>;
  showExample?: boolean;
  displayMode?: DisplayMode;
  totalValue?: number;
}) {
  const showMonetary = displayMode === 'monetary' && totalValue > 0;
  const allIdentical = showOverlayMode && overlays.length > 1 && overlays.every((overlay, i, arr) => {
    if (i === 0) return true;
    return overlay.rows.every((row, j) => 
      row.minPct === arr[0].rows[j]?.minPct && row.maxPct === arr[0].rows[j]?.maxPct
    );
  });

  return (
    <div className="bg-gradient-to-br from-white via-slate-50/80 to-slate-100/50 dark:from-slate-800/90 dark:via-slate-800/70 dark:to-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-lg ring-1 ring-slate-900/5 dark:ring-white/5 p-5">
      <h4 className="font-semibold text-[var(--foreground)] mb-4 text-sm tracking-tight">{title}</h4>
      
      {allIdentical && (
        <p className="text-xs text-[var(--muted-foreground)] italic mb-4 bg-slate-100/80 dark:bg-slate-700/50 p-2.5 rounded-lg border border-slate-200/50 dark:border-slate-600/30">
          Ranges are identical across scenarios under current constraints.
        </p>
      )}

      {/* 0-100% scale reference */}
      <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mb-3 px-1 font-medium tracking-wide uppercase">
        <span>0%</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100%</span>
      </div>
      
      <div className="space-y-5">
        {rows.map((row, idx) => {
          const midpoint = (row.minPct + row.maxPct) / 2;
          const ariaLabel = `${row.label}: current ${row.currentPct.toFixed(1)}%, illustrative range ${row.minPct.toFixed(0)}–${row.maxPct.toFixed(0)}%`;
          
          return (
            <div key={row.label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-[var(--foreground)]">{row.label}</span>
                <span className="text-[var(--muted-foreground)]">
                  Current: {row.currentPct.toFixed(1)}%
                </span>
              </div>
              
              <div 
                className="relative h-7 bg-gradient-to-r from-slate-200/80 via-slate-100 to-slate-200/80 dark:from-slate-700 dark:via-slate-600/50 dark:to-slate-700 rounded-full overflow-hidden shadow-inner ring-1 ring-slate-900/5 dark:ring-white/5"
                role="img"
                aria-label={ariaLabel}
                data-testid={`range-bar-${row.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {showOverlayMode && overlays.length > 0 ? (
                  overlays.map((overlay, oi) => {
                    const overlayRow = overlay.rows[idx];
                    if (!overlayRow) return null;
                    const left = overlayRow.minPct;
                    const width = overlayRow.maxPct - overlayRow.minPct;
                    const overlayMid = (overlayRow.minPct + overlayRow.maxPct) / 2;
                    return (
                      <div key={overlay.scenarioType} className="absolute inset-0">
                        <div
                          className="absolute h-full rounded-full opacity-40"
                          style={{
                            left: `${left}%`,
                            width: `${width}%`,
                            backgroundColor: overlay.color,
                            top: `${oi * 2}px`,
                            height: `${24 - overlays.length * 2}px`,
                          }}
                        />
                        {showMidpoint && (
                          <div
                            className="absolute w-0.5 h-full"
                            style={{
                              left: `${overlayMid}%`,
                              backgroundColor: overlay.color,
                              opacity: 0.8,
                            }}
                          />
                        )}
                      </div>
                    );
                  })
                ) : (
                  <>
                    <div
                      className="absolute inset-y-1 bg-gradient-to-r from-[#5193B3]/50 via-[#62C4C3]/40 to-[#5193B3]/50 rounded-full shadow-[0_0_8px_rgba(81,147,179,0.3)]"
                      style={{
                        left: `${row.minPct}%`,
                        width: `${row.maxPct - row.minPct}%`,
                      }}
                    />
                    {showMidpoint && (
                      <div
                        className="absolute w-0.5 h-full bg-[var(--primary)] shadow-[0_0_4px_rgba(81,147,179,0.5)]"
                        style={{ left: `${midpoint}%` }}
                        title={`Midpoint: ${midpoint.toFixed(1)}%`}
                      />
                    )}
                  </>
                )}
                
                <div
                  className="absolute w-3 h-3 bg-slate-800 dark:bg-white rounded-full border-2 border-white dark:border-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.25),0_0_0_2px_rgba(255,255,255,0.8)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.5),0_0_0_2px_rgba(30,41,59,0.8)]"
                  style={{
                    left: `${row.currentPct}%`,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                  title={`Current: ${row.currentPct.toFixed(1)}%`}
                />
                
                {showExample && exampleValuesBySleeveMap?.has(row.label) && (
                  <div
                    className="absolute w-0 h-0 border-l-[5px] border-r-[5px] border-b-[8px] border-l-transparent border-r-transparent border-b-[#5193B3]"
                    style={{
                      left: `${exampleValuesBySleeveMap.get(row.label)}%`,
                      top: '-2px',
                      transform: 'translateX(-50%)',
                    }}
                    title={`Example: ${exampleValuesBySleeveMap.get(row.label)?.toFixed(1)}%`}
                    data-testid={`example-marker-${row.label.toLowerCase().replace(/\s+/g, '-')}`}
                  />
                )}
              </div>
              
              <div className="flex justify-between text-[10px] text-[var(--muted-foreground)]">
                <span>
                  {showMonetary 
                    ? `Illustrative ${formatMonetaryRange(row.minPct, row.maxPct, totalValue)}`
                    : `Range: ${row.minPct.toFixed(0)}–${row.maxPct.toFixed(0)}%`
                  }
                </span>
                {showMidpoint && !showOverlayMode && !showExample && (
                  <span className="text-[var(--primary)] font-medium">
                    {showMonetary
                      ? `Mid: ${formatMonetaryNoSign(pctToMonetary(midpoint, totalValue), totalValue)}`
                      : `Mid: ${midpoint.toFixed(1)}%`
                    }
                  </span>
                )}
                {showExample && exampleValuesBySleeveMap?.has(row.label) && (
                  <span className="text-[#5193B3] font-medium">
                    {showMonetary
                      ? `Example: ${formatMonetaryNoSign(pctToMonetary(exampleValuesBySleeveMap.get(row.label) || 0, totalValue), totalValue)}`
                      : `Example: ${exampleValuesBySleeveMap.get(row.label)?.toFixed(1)}%`
                    }
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {showOverlayMode && overlays.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-[var(--border)]">
          {overlays.map(overlay => (
            <div key={overlay.scenarioType} className="flex items-center gap-2 text-xs">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: overlay.color }}
              />
              <span className="text-[var(--muted-foreground)]">{overlay.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 bg-slate-700 dark:bg-white rounded-full border border-slate-400" />
            <span className="text-[var(--muted-foreground)]">Current</span>
          </div>
        </div>
      )}
      
      {showExample && (
        <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-[var(--border)]">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 bg-slate-700 dark:bg-white rounded-full border border-slate-400" />
            <span className="text-[var(--muted-foreground)]">Current</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-[#5193B3]" />
            <span className="text-[var(--muted-foreground)]">Example</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ExamplePortfolioPanel({ 
  exampleSet,
  selectedType,
  onTypeChange,
  safetyLightsUnchanged = true,
  displayMode = 'percent',
  totalValue = 0,
}: {
  exampleSet: ExamplePortfolioSet;
  selectedType: ExampleType;
  onTypeChange: (type: ExampleType) => void;
  safetyLightsUnchanged?: boolean;
  displayMode?: DisplayMode;
  totalValue?: number;
}) {
  const example = exampleSet[selectedType.toLowerCase() as 'low' | 'mid' | 'high'];
  const differsSummary = generateExampleDiffersSummary(example.top_movers);
  const showMonetary = displayMode === 'monetary' && totalValue > 0;
  
  return (
    <div className="bg-gradient-to-br from-white via-slate-50/80 to-slate-100/50 dark:from-slate-800/90 dark:via-slate-800/70 dark:to-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-lg ring-1 ring-slate-900/5 dark:ring-white/5 p-5" data-testid="example-portfolio-panel">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-[var(--foreground)] flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#5193B3]/10 dark:bg-[#5193B3]/20">
            <Layers className="w-4 h-4 text-[#5193B3]" />
          </div>
          Example portfolios within this scenario (illustrative)
        </h4>
        <div className="flex gap-0.5 bg-slate-200/80 dark:bg-slate-700 rounded-lg p-0.5 shadow-inner" data-testid="example-type-selector">
          {(['LOW', 'MID', 'HIGH'] as ExampleType[]).map((type) => (
            <button
              key={type}
              onClick={() => onTypeChange(type)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
                selectedType === type
                  ? 'bg-white dark:bg-slate-600 text-[var(--foreground)] shadow-md ring-1 ring-slate-900/5'
                  : 'text-slate-500 dark:text-slate-400 hover:text-[var(--foreground)] hover:bg-white/50 dark:hover:bg-slate-600/50'
              }`}
              data-testid={`example-type-${type.toLowerCase()}`}
            >
              {type === 'LOW' ? 'Low' : type === 'MID' ? 'Mid' : 'High'}
            </button>
          ))}
        </div>
      </div>
      
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 italic leading-relaxed">
        These are illustrative portfolio states chosen from within the scenario ranges to help interpret what the ranges imply. They are not targets and not advice.
      </p>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {example.allocations.map((alloc) => {
          const monetaryValue = pctToMonetary(alloc.example_pct, totalValue);
          const monetaryDelta = computeMonetaryDelta(alloc.current_pct, alloc.example_pct, totalValue);
          
          return (
            <div key={alloc.sleeve} className="bg-gradient-to-br from-white via-slate-50 to-slate-100/80 dark:from-slate-700/80 dark:via-slate-700/60 dark:to-slate-800/80 rounded-xl p-4 border border-slate-200/60 dark:border-slate-600/40 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium mb-1">{alloc.sleeve}</div>
              <div className="text-xl font-bold text-[var(--foreground)] tracking-tight">
                {showMonetary ? formatMonetaryNoSign(monetaryValue, totalValue) : `${alloc.example_pct.toFixed(1)}%`}
              </div>
              <div className={`text-xs font-medium mt-1 ${
                alloc.delta_pp > 0.5 ? 'text-[#10A957]' : 
                alloc.delta_pp < -0.5 ? 'text-[#FE9239]' : 
                'text-slate-400'
              }`}>
                {showMonetary 
                  ? `${formatMonetary(monetaryDelta, totalValue)} vs current`
                  : `${alloc.delta_pp >= 0 ? '+' : '−'}${Math.abs(alloc.delta_pp).toFixed(1)}pp vs current`
                }
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gradient-to-r from-slate-100/80 via-slate-50 to-slate-100/80 dark:from-slate-700/60 dark:via-slate-700/40 dark:to-slate-700/60 rounded-xl border border-slate-200/50 dark:border-slate-600/30">
        <div className="flex-1">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium mb-1">Total movement vs current</div>
          <div className="text-base font-bold text-[var(--foreground)]" data-testid="example-total-movement">
            {showMonetary 
              ? `${formatTotalMonetaryMovement(example.allocations, totalValue)} reallocated across asset classes`
              : `${example.total_movement_pp.toFixed(1)}pp`
            }
          </div>
        </div>
        <div className="flex-1">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium mb-1">What differs in this example</div>
          <div className="text-sm text-[var(--foreground)] leading-relaxed" data-testid="example-differs-summary">
            {differsSummary}
          </div>
        </div>
      </div>
      
      {example.normalised && (
        <p className="text-xs text-slate-400 mt-4 italic">
          Minor rounding normalisation applied.
        </p>
      )}
      
      <div className="mt-5 pt-5 border-t border-slate-200/60 dark:border-slate-700/60">
        <div className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium mb-3">Safety Lights under this example</div>
        <div className="flex flex-wrap gap-2">
          {['Liquidity', 'Concentration', 'Illiquids'].map((axis) => (
            <div 
              key={axis}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700/80 dark:text-slate-400 border border-slate-200/50 dark:border-slate-600/30"
              data-testid={`example-safety-light-${axis.toLowerCase()}`}
            >
              {axis}: {safetyLightsUnchanged ? 'Unchanged (requires holdings-level data)' : 'See scenario'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const SCENARIO_COLORS: Record<ScenarioType, string> = {
  GUARDRAIL_FIRST: '#10A957',
  PREFERENCE_LEANING: '#5193B3',
  NEUTRAL_BASELINE: '#FE9239',
};

const SCENARIO_LABELS: Record<ScenarioType, { label: string; description: string; icon: typeof ShieldCheck }> = {
  GUARDRAIL_FIRST: {
    label: 'Guardrail-first',
    description: 'Prioritises Safety Lights. Minimal deviation.',
    icon: ShieldCheck,
  },
  PREFERENCE_LEANING: {
    label: 'Preference-leaning',
    description: 'Reflects beliefs within guardrail budgets.',
    icon: Scale,
  },
  NEUTRAL_BASELINE: {
    label: 'Neutral baseline',
    description: 'Minimal deviation. No tilts applied.',
    icon: Layers,
  },
};

const DIRECTION_ARROWS: Record<string, string> = {
  INCREASE: '↑',
  DECREASE: '↓',
  NEUTRAL: '↔',
};

const DIRECTION_ICONS: Record<string, typeof TrendingUp> = {
  INCREASE: TrendingUp,
  DECREASE: TrendingDown,
  NEUTRAL: Minus,
};

const DIRECTION_COLORS: Record<string, string> = {
  INCREASE: 'text-[#10A957]',
  DECREASE: 'text-[#FE9239]',
  NEUTRAL: 'text-[#64748B]',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: typeof Check }> = {
  APPLIED: { label: 'Reflected', color: 'text-[#10A957]', bgColor: 'bg-[#10A957]/10', icon: Check },
  PARTIALLY_APPLIED: { label: 'Partially reflected', color: 'text-[#13683B]', bgColor: 'bg-[#13683B]/10', icon: Check },
  CONSTRAINED: { label: 'Constrained', color: 'text-[#FE9239]', bgColor: 'bg-[#FE9239]/10', icon: Lock },
  LOCKED: { label: 'Constrained by guardrails', color: 'text-[#DC2626]', bgColor: 'bg-[#DC2626]/10', icon: Lock },
  NOT_APPLIED: { label: 'Not reflected', color: 'text-[#64748B]', bgColor: 'bg-slate-100 dark:bg-slate-800', icon: X },
};

function AllocationBandRow({ band, showDelta = false }: { band: AllocationBand; showDelta?: boolean }) {
  const dirArrow = DIRECTION_ARROWS[band.direction];
  const dirColor = DIRECTION_COLORS[band.direction];
  
  const delta = useMemo(() => computeDelta(band), [band]);
  const deltaColor = delta.delta_pp > 0.5 ? 'text-[#10A957]' : 
                     delta.delta_pp < -0.5 ? 'text-[#FE9239]' : 
                     'text-[var(--muted-foreground)]';
  
  return (
    <div className="flex items-center justify-between py-3 px-4 border-b border-[var(--border)] last:border-b-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
      <div className="flex-1 flex items-center gap-2">
        <span className="font-medium text-[var(--foreground)]">{band.sleeve}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={`text-lg font-bold ${dirColor} cursor-help`} data-testid={`direction-${band.sleeve.toLowerCase()}`}>
                {dirArrow}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Directional pressure from preferences within constraints</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {band.clamped && (
          <Lock className="w-3 h-3 text-[#FE9239]" />
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <span className="text-sm text-[var(--muted-foreground)]">Current</span>
          <span className="ml-2 font-mono font-semibold text-[var(--foreground)]">{band.current_pct.toFixed(1)}%</span>
        </div>
        <div className="text-right min-w-[100px]">
          <span className="text-sm text-[var(--muted-foreground)]">Illustrative</span>
          <span className="ml-2 font-mono font-semibold text-[var(--primary)]">
            {band.illustrative_low_pct.toFixed(0)}–{band.illustrative_high_pct.toFixed(0)}%
          </span>
        </div>
        {showDelta && (
          <div className="text-right min-w-[70px]">
            <span className="text-sm text-[var(--muted-foreground)]">Δ vs current</span>
            <span className={`ml-2 font-mono font-semibold ${deltaColor}`} data-testid={`delta-${band.sleeve.toLowerCase()}`}>
              {delta.delta_display}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function AppliedTiltRow({ tilt, hasAnyRed }: { tilt: AppliedTiltEntry; hasAnyRed: boolean }) {
  const statusConfig = STATUS_CONFIG[tilt.status] || STATUS_CONFIG.NOT_APPLIED;
  const StatusIcon = statusConfig.icon;
  
  const getPrimaryConstraint = (): string | null => {
    if (tilt.status === 'APPLIED') return null;
    if (tilt.status === 'LOCKED' && hasAnyRed) return 'Tilts locked while a red item exists';
    if (tilt.constraint_reason) return tilt.constraint_reason;
    if (tilt.status === 'CONSTRAINED') return 'Guardrail binding';
    if (tilt.status === 'PARTIALLY_APPLIED') return 'Partially constrained';
    return null;
  };
  
  const primaryConstraint = getPrimaryConstraint();
  
  return (
    <div className="flex items-center justify-between py-3 px-4 border-b border-[var(--border)] last:border-b-0">
      <div className="flex-1">
        <span className="font-medium text-[var(--foreground)]">{tilt.axis_label}</span>
      </div>
      <div className="flex items-center gap-3">
        {primaryConstraint && (
          <span className="text-xs text-[var(--muted-foreground)] max-w-[180px] text-right">
            {primaryConstraint}
          </span>
        )}
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusConfig.bgColor}`}>
          <StatusIcon className={`w-3 h-3 ${statusConfig.color}`} />
          <span className={`text-xs font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
        </div>
      </div>
    </div>
  );
}

function ConstraintRow({ constraint }: { constraint: BindingConstraint }) {
  return (
    <div className="flex items-start gap-3 py-3 px-4 border-b border-[var(--border)] last:border-b-0">
      <div className="w-8 h-8 rounded-lg bg-[#FE9239]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Lock className="w-4 h-4 text-[#FE9239]" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[var(--foreground)]">{constraint.constraint_type}</span>
          <span className="text-xs text-[var(--muted-foreground)]">
            (Current: {constraint.current_value.toFixed(1)} | Threshold: {constraint.threshold})
          </span>
        </div>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">{constraint.description}</p>
      </div>
    </div>
  );
}

function DebugBandRow({ band }: { band: AllocationBand }) {
  return (
    <tr className="border-b border-slate-200 dark:border-slate-700 text-xs">
      <td className="px-2 py-1 font-medium">{band.sleeve}</td>
      <td className="px-2 py-1 font-mono text-right">{band.current_pct.toFixed(1)}</td>
      <td className="px-2 py-1 font-mono text-right">{band.debug.rawPressure.toFixed(3)}</td>
      <td className="px-2 py-1 font-mono text-right">{band.debug.centreShift.toFixed(2)}</td>
      <td className="px-2 py-1 font-mono text-right">{band.debug.unclampedCentre.toFixed(1)}</td>
      <td className="px-2 py-1 font-mono text-right">{band.debug.clampedCentre.toFixed(1)}</td>
      <td className="px-2 py-1 font-mono text-right">{band.midpoint_pct.toFixed(1)}</td>
      <td className="px-2 py-1 font-mono text-right">{band.illustrative_low_pct.toFixed(1)}</td>
      <td className="px-2 py-1 font-mono text-right">{band.illustrative_high_pct.toFixed(1)}</td>
      <td className="px-2 py-1 text-center">
        {band.debug.bindingConstraints.length > 0 
          ? band.debug.bindingConstraints.join(', ') 
          : '-'}
      </td>
    </tr>
  );
}

function DebugPanel({ scenarios }: { scenarios: IllustrativeScenario[] }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Get the scenario parameters from the first band's debug info
  const getScenarioParams = (scenario: IllustrativeScenario) => {
    if (scenario.asset_class_bands.length > 0) {
      const d = scenario.asset_class_bands[0].debug;
      return `strength=${d.scenarioStrength}, maxShift=${d.maxShift}, halfWidth=${d.halfWidth}`;
    }
    return '';
  };
  
  return (
    <div className="mt-8 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
        data-testid="debug-panel-toggle"
      >
        <Bug className="w-4 h-4" />
        <span>Debug (internal)</span>
        <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="p-4 border-t border-dashed border-slate-300 dark:border-slate-600 overflow-x-auto">
          <div className="space-y-6">
            {scenarios.map((scenario) => (
              <div key={scenario.scenario_type} className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  {scenario.scenario_label}
                  <span className="text-slate-400 font-normal">
                    ({getScenarioParams(scenario)})
                  </span>
                </h4>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        <th className="px-2 py-1 text-left">Sleeve</th>
                        <th className="px-2 py-1 text-right">Current</th>
                        <th className="px-2 py-1 text-right">Pressure</th>
                        <th className="px-2 py-1 text-right">Shift</th>
                        <th className="px-2 py-1 text-right">Uncl Ctr</th>
                        <th className="px-2 py-1 text-right">Clamp Ctr</th>
                        <th className="px-2 py-1 text-right">Midpoint</th>
                        <th className="px-2 py-1 text-right">Min</th>
                        <th className="px-2 py-1 text-right">Max</th>
                        <th className="px-2 py-1 text-center">Constraints</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scenario.asset_class_bands.map((band) => (
                        <DebugBandRow key={band.sleeve} band={band} />
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {scenario.region_bands.length > 0 && (
                  <div className="overflow-x-auto mt-2">
                    <p className="text-xs text-slate-500 mb-1">Regions:</p>
                    <table className="w-full text-xs border-collapse min-w-[800px]">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          <th className="px-2 py-1 text-left">Sleeve</th>
                          <th className="px-2 py-1 text-right">Current</th>
                          <th className="px-2 py-1 text-right">Pressure</th>
                          <th className="px-2 py-1 text-right">Shift</th>
                          <th className="px-2 py-1 text-right">Uncl Ctr</th>
                          <th className="px-2 py-1 text-right">Clamp Ctr</th>
                          <th className="px-2 py-1 text-right">Midpoint</th>
                          <th className="px-2 py-1 text-right">Min</th>
                          <th className="px-2 py-1 text-right">Max</th>
                          <th className="px-2 py-1 text-center">Constraints</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scenario.region_bands.map((band) => (
                          <DebugBandRow key={band.sleeve} band={band} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScenarioContent({ 
  scenario, 
  safetyLights,
  compareMode = false,
  allScenarios = [],
  rangesIdentical = false,
  displayMode = 'percent',
  totalValue = 0,
}: { 
  scenario: IllustrativeScenario; 
  safetyLights?: any;
  compareMode?: boolean;
  allScenarios?: IllustrativeScenario[];
  rangesIdentical?: boolean;
  displayMode?: DisplayMode;
  totalValue?: number;
}) {
  const [selectedExampleType, setSelectedExampleType] = useState<ExampleType>('MID');
  const showMonetary = displayMode === 'monetary' && totalValue > 0;
  
  const axesReflectedCount = scenario.scenario_type === 'NEUTRAL_BASELINE' 
    ? 0 
    : scenario.tilts_applied_count;
    
  const hasAnyRed = hasAnyRedLightFromResult(safetyLights);
  
  const exampleSet = useMemo(() => 
    computeExamplePortfolioSet(scenario.asset_class_bands),
    [scenario.asset_class_bands]
  );
  
  const selectedExample = exampleSet[selectedExampleType.toLowerCase() as 'low' | 'mid' | 'high'];
  
  const exampleValuesBySleeveMap = useMemo(() => {
    const map = new Map<string, number>();
    selectedExample.allocations.forEach(a => map.set(a.sleeve, a.example_pct));
    return map;
  }, [selectedExample]);
  
  const assetTotalMovement = useMemo(() => 
    computeTotalMovement(scenario.asset_class_bands), 
    [scenario.asset_class_bands]
  );
  
  const regionTotalMovement = useMemo(() => 
    computeTotalMovement(scenario.region_bands), 
    [scenario.region_bands]
  );
  
  const guardrailImpacts = useMemo(() => 
    computeGuardrailImpacts(scenario.applied_tilts, hasAnyRed),
    [scenario.applied_tilts, hasAnyRed]
  );
  
  const safetyLightStatuses = useMemo(() => 
    computeSafetyLightsForScenario(safetyLights),
    [safetyLights]
  );
  
  const { changes, staysSame } = useMemo(() => 
    generateChangeBullets(scenario.asset_class_bands, scenario.region_bands, scenario.applied_tilts),
    [scenario.asset_class_bands, scenario.region_bands, scenario.applied_tilts]
  );
  
  const movementCallout = useMemo(() => 
    computeMovementLimitedCallout(
      assetTotalMovement.total_movement_pp,
      hasAnyRed,
      scenario.binding_constraints,
      rangesIdentical
    ),
    [assetTotalMovement.total_movement_pp, hasAnyRed, scenario.binding_constraints, rangesIdentical]
  );

  const assetRangeRows: RangeBarRow[] = useMemo(() => 
    scenario.asset_class_bands.map(band => ({
      label: band.sleeve,
      currentPct: band.current_pct,
      minPct: band.illustrative_low_pct,
      maxPct: band.illustrative_high_pct,
    })),
    [scenario.asset_class_bands]
  );

  const regionRangeRows: RangeBarRow[] = useMemo(() => 
    scenario.region_bands.map(band => ({
      label: band.sleeve,
      currentPct: band.current_pct,
      minPct: band.illustrative_low_pct,
      maxPct: band.illustrative_high_pct,
    })),
    [scenario.region_bands]
  );

  const assetOverlays: ScenarioRangeOverlay[] = useMemo(() => {
    if (!compareMode || allScenarios.length === 0) return [];
    return allScenarios.map(s => ({
      scenarioType: s.scenario_type,
      label: SCENARIO_LABELS[s.scenario_type]?.label || s.scenario_type,
      color: SCENARIO_COLORS[s.scenario_type] || '#5193B3',
      rows: s.asset_class_bands.map(band => ({
        label: band.sleeve,
        currentPct: band.current_pct,
        minPct: band.illustrative_low_pct,
        maxPct: band.illustrative_high_pct,
      })),
    }));
  }, [compareMode, allScenarios]);

  const regionOverlays: ScenarioRangeOverlay[] = useMemo(() => {
    if (!compareMode || allScenarios.length === 0) return [];
    return allScenarios.map(s => ({
      scenarioType: s.scenario_type,
      label: SCENARIO_LABELS[s.scenario_type]?.label || s.scenario_type,
      color: SCENARIO_COLORS[s.scenario_type] || '#5193B3',
      rows: s.region_bands.map(band => ({
        label: band.sleeve,
        currentPct: band.current_pct,
        minPct: band.illustrative_low_pct,
        maxPct: band.illustrative_high_pct,
      })),
    }));
  }, [compareMode, allScenarios]);

  return (
    <div className="space-y-6">
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
        <p className="text-sm text-[var(--muted-foreground)]">{scenario.scenario_description}</p>
        <div className="flex items-center gap-6 mt-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted-foreground)]">Belief axes reflected:</span>
            <span className="text-sm font-semibold text-[#10A957]">{axesReflectedCount} of {TOTAL_BELIEF_AXES}</span>
          </div>
          {scenario.tilts_constrained_count > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--muted-foreground)]">Axes constrained:</span>
              <span className="text-sm font-semibold text-[#FE9239]">{scenario.tilts_constrained_count}</span>
            </div>
          )}
        </div>
      </div>

      {/* Impact vs Current Section Header */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-[var(--border)]">
        <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
          <Activity className="w-4 h-4 text-[var(--primary)]" />
          Impact vs current (illustrative)
        </h3>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          Shows modelled directional differences from your current allocation. Not advice.
        </p>
      </div>

      {/* Why movement is limited callout */}
      {movementCallout.show && (
        <div 
          className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4"
          data-testid="movement-limited-callout"
        >
          <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            {movementCallout.title}
          </h4>
          <p className="text-sm text-amber-700 dark:text-amber-400">
            {movementCallout.body}
          </p>
        </div>
      )}

      {/* Asset Class Bands */}
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#10A957]/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative bg-white dark:bg-slate-800/80 rounded-2xl border border-[var(--border)] shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[var(--primary)]" />
              Asset Class Allocation
            </h3>
            <div className="text-sm text-[var(--muted-foreground)]">
              Total movement: <span className="font-mono font-semibold text-[var(--primary)]" data-testid="total-movement-asset">{assetTotalMovement.display}</span>
            </div>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mb-4">
            Ranges illustrate feasible directions under the scenario constraints. They do not represent target allocations.
          </p>
          <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] overflow-hidden">
            {scenario.asset_class_bands.map((band) => (
              <AllocationBandRow key={band.sleeve} band={band} showDelta={true} />
            ))}
          </div>
        </div>
      </div>

      {/* Region Bands */}
      {scenario.region_bands.length > 0 && (
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-[var(--border)] shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[var(--foreground)]">Regional Allocation</h3>
            <div className="text-sm text-[var(--muted-foreground)]">
              Total movement: <span className="font-mono font-semibold text-[var(--primary)]" data-testid="total-movement-region">{regionTotalMovement.display}</span>
            </div>
          </div>
          <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] overflow-hidden">
            {scenario.region_bands.map((band) => (
              <AllocationBandRow key={band.sleeve} band={band} showDelta={true} />
            ))}
          </div>
        </div>
      )}

      {/* Monetary Disclaimer */}
      {showMonetary && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4" data-testid="monetary-disclaimer">
          <p className="text-xs text-amber-800 dark:text-amber-200 italic">
            {MONETARY_DISCLAIMER}
          </p>
        </div>
      )}

      {/* Example Portfolio Panel */}
      <ExamplePortfolioPanel
        exampleSet={exampleSet}
        selectedType={selectedExampleType}
        onTypeChange={setSelectedExampleType}
        safetyLightsUnchanged={true}
        displayMode={displayMode}
        totalValue={totalValue}
      />

      {/* Range Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RangeBarChart 
          title="Asset Class Ranges (Illustrative)"
          rows={assetRangeRows}
          showMidpoint={true}
          overlays={assetOverlays}
          showOverlayMode={compareMode}
          exampleValuesBySleeveMap={exampleValuesBySleeveMap}
          showExample={!compareMode}
          displayMode={displayMode}
          totalValue={totalValue}
        />
        {regionRangeRows.length > 0 && (
          <RangeBarChart 
            title="Regional Ranges (Illustrative)"
            rows={regionRangeRows}
            showMidpoint={true}
            overlays={regionOverlays}
            showOverlayMode={compareMode}
            displayMode={displayMode}
            totalValue={totalValue}
          />
        )}
      </div>

      {/* What Changes / What Stays the Same */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-[var(--border)] p-4">
          <h4 className="font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-[#10A957]" />
            What differs (illustrative)
          </h4>
          {changes.length > 0 ? (
            <ul className="space-y-2">
              {changes.map((bullet, i) => (
                <li key={i} className="text-sm text-[var(--muted-foreground)] flex items-start gap-2">
                  <Circle className="w-2 h-2 text-[#10A957] flex-shrink-0 mt-1.5 fill-current" />
                  {bullet.text}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--muted-foreground)] italic" data-testid="what-differs-fallback">
              Preferences are directionally present, but their impact is constrained by current guardrails, resulting in minimal allocation movement.
            </p>
          )}
        </div>
        <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-[var(--border)] p-4">
          <h4 className="font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
            <Minus className="w-4 h-4 text-[var(--muted-foreground)]" />
            What remains similar
          </h4>
          {staysSame.length > 0 ? (
            <ul className="space-y-2">
              {staysSame.map((bullet, i) => (
                <li key={i} className="text-sm text-[var(--muted-foreground)] flex items-start gap-2">
                  <Circle className="w-2 h-2 text-slate-400 flex-shrink-0 mt-1.5 fill-current" />
                  {bullet.text}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--muted-foreground)] italic" data-testid="what-remains-fallback">
              Most exposures remain near current levels.
            </p>
          )}
        </div>
      </div>

      {/* Safety Lights under this scenario */}
      <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-[var(--border)] p-4">
        <h4 className="font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[var(--primary)]" />
          Safety Lights under this scenario
        </h4>
        <div className="flex flex-wrap gap-3">
          {safetyLightStatuses.map((light) => {
            const statusColors: Record<string, string> = {
              GREEN: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
              AMBER: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
              RED: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
              UNCHANGED: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
            };
            return (
              <div 
                key={light.axis} 
                className={`px-3 py-1.5 rounded-full text-xs font-medium ${statusColors[light.status]}`}
                data-testid={`safety-light-${light.axis.toLowerCase()}`}
              >
                {light.axis}: {light.display_label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Applied Tilts Panel (Belief Axes Reflected) */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-[var(--border)] shadow-lg p-6">
        <h3 className="text-lg font-bold text-[var(--foreground)] mb-2 flex items-center gap-2">
          <TargetIcon className="w-5 h-5 text-[var(--primary)]" />
          Belief Axes Reflected
        </h3>
        <p className="text-sm text-[var(--muted-foreground)] mb-2">
          This shows how each belief axis from Step 6 is reflected in this illustrative scenario.
        </p>
        {/* Helper caption for Applied badges */}
        <p className="text-xs text-[var(--muted-foreground)] italic mb-4">
          "Reflected" indicates the scenario incorporates this preference directionally within constraints. It is not a buy or sell instruction.
        </p>
        <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] overflow-hidden">
          {scenario.applied_tilts.map((tilt) => (
            <AppliedTiltRow key={tilt.axis_code} tilt={tilt} hasAnyRed={hasAnyRed} />
          ))}
        </div>
      </div>

      {/* Binding Constraints Panel */}
      {scenario.binding_constraints.length > 0 && (
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-[var(--border)] shadow-lg p-6">
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#FE9239]" />
            Trade-offs and Constraints
          </h3>
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl mb-4">
            <p className="text-sm text-[var(--foreground)] font-medium">
              Safety Lights guardrails take precedence over belief axes.
            </p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              The following guardrails are binding constraints in this scenario.
            </p>
          </div>
          <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] overflow-hidden">
            {scenario.binding_constraints.map((constraint, i) => (
              <ConstraintRow key={i} constraint={constraint} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Target() {
  const [, navigate] = useLocation();
  const [compareMode, setCompareMode] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('percent');
  const { 
    scenario, 
    beliefs, 
    analysis,
    summary,
    computeScenarios, 
    setActiveScenario,
    completeScenarioStep,
  } = useOnboardingV2Store();
  
  const totalValue = summary.total_investable_value;

  const tiltsAllowed = beliefs.tilts_allowed;

  // Compute scenarios on mount if not already computed
  useEffect(() => {
    if (!scenario.computed && analysis.result) {
      computeScenarios();
    }
  }, [scenario.computed, analysis.result, computeScenarios]);

  const activeScenario = useMemo(() => {
    return scenario.scenarios.find(s => s.scenario_type === scenario.active_scenario) || scenario.scenarios[0];
  }, [scenario.scenarios, scenario.active_scenario]);

  const rangesIdentical = useMemo(() => 
    checkRangesIdenticalAcrossScenarios(scenario.scenarios),
    [scenario.scenarios]
  );

  const handleContinue = () => {
    completeScenarioStep();
    navigate('/onboarding-v2/next-steps');
  };

  const handleBack = () => {
    navigate('/onboarding-v2/beliefs');
  };

  return (
    <OnboardingLayout
      stepId="target"
      title="Illustrative Portfolio Direction"
      description="This is an illustrative analysis based on the information provided. It is not financial advice."
      hideNav={true}
    >
      <div className="space-y-8 pt-6">
        {/* Disclaimer Box - Always Visible */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-500/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative bg-white dark:bg-slate-800/80 rounded-2xl border border-[var(--border)] shadow-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-lg flex-shrink-0">
                <Info className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-2">What this page shows</h3>
                <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-[var(--primary)] flex-shrink-0 mt-0.5" />
                    <span>This page shows three illustrative portfolio direction scenarios based on the information provided.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-[var(--primary)] flex-shrink-0 mt-0.5" />
                    <span>"Current" is your portfolio today (based on the holdings you entered).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-[var(--primary)] flex-shrink-0 mt-0.5" />
                    <span>"Illustrative" ranges show plausible direction of travel within constraints — they are not targets.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-[var(--primary)] flex-shrink-0 mt-0.5" />
                    <span>Ranges may be narrow when a Safety Light is RED, because guardrails take precedence over preferences.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-[var(--primary)] flex-shrink-0 mt-0.5" />
                    <span>Use the scenarios to understand which preferences are being applied, constrained, or locked — and why.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-[var(--primary)] flex-shrink-0 mt-0.5" />
                    <span>Next, Step 8 summarises the key constraints and shows a simple, non-prescriptive action plan to improve flexibility (without instructing you to buy or sell any asset).</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* How to read these scenarios - Collapsible Accordion */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="how-to-read" className="border border-[var(--border)] rounded-xl overflow-hidden bg-white dark:bg-slate-800/80">
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-slate-50/50 dark:hover:bg-slate-700/50">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-[var(--primary)]" />
                <span className="font-semibold text-[var(--foreground)]">How to read these scenarios</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <ul className="space-y-3 text-sm text-[var(--muted-foreground)]">
                <li className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-[var(--primary)] flex-shrink-0 mt-0.5" />
                  <span><strong className="text-[var(--foreground)]">Guardrail-first</strong> prioritises reducing risk flags identified by Safety Lights.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Scale className="w-4 h-4 text-[var(--primary)] flex-shrink-0 mt-0.5" />
                  <span><strong className="text-[var(--foreground)]">Preference-leaning</strong> reflects your stated beliefs as far as guardrail constraints allow.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Layers className="w-4 h-4 text-[var(--primary)] flex-shrink-0 mt-0.5" />
                  <span><strong className="text-[var(--foreground)]">Neutral baseline</strong> shows minimal deviation from your current allocation without incorporating belief axes.</span>
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Tilts Locked Banner */}
        {scenario.tilts_locked_banner && (
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FE9239]/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-white dark:bg-slate-800/80 rounded-2xl border-2 border-[#FE9239]/30 shadow-lg p-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FE9239] to-[#EA580C] flex items-center justify-center shadow-lg flex-shrink-0">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-[#FE9239]">Belief axes captured but constrained</h4>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Safety Lights guardrails constrain how preferences can be considered. Address the underlying constraints to enable full consideration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scenario Tabs */}
        {scenario.computed && scenario.scenarios.length > 0 && (
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#10A957]/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-white dark:bg-slate-800/80 rounded-2xl border border-[var(--border)] shadow-lg p-6 pt-12">
              <div className="absolute -top-5 left-6 z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#10A957] to-[#13683B] flex items-center justify-center shadow-lg shadow-[#10A957]/25 rotate-3 group-hover:rotate-0 transition-transform duration-300">
                  <TargetIcon className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Illustrative Scenarios</h2>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Unlock models three illustrative scenarios. Each reflects your stated preferences within different constraint frameworks.
                  </p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center gap-6">
                    <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1" data-testid="display-mode-toggle">
                      <button
                        onClick={() => setDisplayMode('percent')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          displayMode === 'percent'
                            ? 'bg-white dark:bg-slate-600 text-[var(--foreground)] shadow-sm'
                            : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                        }`}
                        data-testid="display-mode-percent"
                      >
                        %
                      </button>
                      <button
                        onClick={() => setDisplayMode('monetary')}
                        disabled={totalValue <= 0}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          displayMode === 'monetary'
                            ? 'bg-white dark:bg-slate-600 text-[var(--foreground)] shadow-sm'
                            : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                        } ${totalValue <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        data-testid="display-mode-monetary"
                        title={totalValue <= 0 ? 'Enter holdings to view monetary values' : ''}
                      >
                        £
                      </button>
                    </div>
                    <div 
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                        compareMode 
                          ? 'bg-[var(--primary)]/10 border-[var(--primary)]/30' 
                          : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      <Switch
                        id="compare-mode"
                        checked={compareMode}
                        onCheckedChange={setCompareMode}
                        data-testid="compare-scenarios-toggle"
                      />
                      <Label htmlFor="compare-mode" className="text-sm text-[var(--foreground)] cursor-pointer whitespace-nowrap">
                        Compare
                      </Label>
                    </div>
                  </div>
                  {rangesIdentical && (
                    <span className="text-xs text-[var(--muted-foreground)] italic" data-testid="convergence-microcopy">
                      Under current constraints, all three scenarios converge on similar ranges.
                    </span>
                  )}
                </div>
              </div>

              <Tabs 
                value={scenario.active_scenario} 
                onValueChange={(value) => setActiveScenario(value as ScenarioType)}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  {scenario.scenarios.map((s) => {
                    const config = SCENARIO_LABELS[s.scenario_type];
                    const ScenarioIcon = config.icon;
                    return (
                      <TabsTrigger 
                        key={s.scenario_type} 
                        value={s.scenario_type}
                        className="flex items-center gap-2 text-sm"
                        data-testid={`scenario-tab-${s.scenario_type}`}
                      >
                        <ScenarioIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">{config.label}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {scenario.scenarios.map((s) => (
                  <TabsContent key={s.scenario_type} value={s.scenario_type}>
                    <ScenarioContent 
                      scenario={s} 
                      safetyLights={analysis.result?.safety_lights}
                      compareMode={compareMode}
                      allScenarios={scenario.scenarios}
                      rangesIdentical={rangesIdentical}
                      displayMode={displayMode}
                      totalValue={totalValue}
                    />
                  </TabsContent>
                ))}
              </Tabs>
              
              {/* Debug Panel - Hidden by default */}
              <DebugPanel scenarios={scenario.scenarios} />
            </div>
          </div>
        )}

        {/* Loading State */}
        {!scenario.computed && (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full border-4 border-[var(--primary)] border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-[var(--muted-foreground)]">Computing illustrative scenarios...</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-[var(--border)]">
          <Button
            variant="outline"
            onClick={handleBack}
            className="px-6 py-2.5 border-2 border-[var(--border)] bg-white dark:bg-slate-800 text-[var(--foreground)] hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-[var(--primary)] transition-all duration-300"
            data-testid="target-back-button"
          >
            Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!scenario.computed}
            className="px-8 py-2.5 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 hover:from-[var(--primary)]/90 hover:to-[var(--primary)]/70 shadow-lg shadow-[var(--primary)]/25 transition-all duration-300"
            data-testid="target-continue-button"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
