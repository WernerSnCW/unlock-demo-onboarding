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
import { useEffect, useMemo } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Lock,
  Check,
  X,
  Info,
  ArrowRight,
  Layers,
  Target as TargetIcon,
  Scale,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SCENARIO_LABELS: Record<ScenarioType, { label: string; description: string; icon: typeof ShieldCheck }> = {
  GUARDRAIL_FIRST: {
    label: 'Guardrail-first',
    description: 'Prioritises Safety Lights. Minimal deviation.',
    icon: ShieldCheck,
  },
  PREFERENCE_LEANING: {
    label: 'Preference-leaning',
    description: 'Applies tilts within guardrail budgets.',
    icon: Scale,
  },
  NEUTRAL_BASELINE: {
    label: 'Neutral baseline',
    description: 'Minimal deviation. No tilts applied.',
    icon: Layers,
  },
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
  APPLIED: { label: 'Applied', color: 'text-[#10A957]', bgColor: 'bg-[#10A957]/10', icon: Check },
  PARTIALLY_APPLIED: { label: 'Partially applied', color: 'text-[#13683B]', bgColor: 'bg-[#13683B]/10', icon: Check },
  CONSTRAINED: { label: 'Constrained', color: 'text-[#FE9239]', bgColor: 'bg-[#FE9239]/10', icon: Lock },
  NOT_APPLIED: { label: 'Not applied', color: 'text-[#64748B]', bgColor: 'bg-slate-100 dark:bg-slate-800', icon: X },
};

function AllocationBandRow({ band }: { band: AllocationBand }) {
  const DirIcon = DIRECTION_ICONS[band.direction];
  const dirColor = DIRECTION_COLORS[band.direction];
  
  return (
    <div className="flex items-center justify-between py-3 px-4 border-b border-[var(--border)] last:border-b-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
      <div className="flex-1">
        <span className="font-medium text-[var(--foreground)]">{band.sleeve}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <span className="text-sm text-[var(--muted-foreground)]">Current</span>
          <span className="ml-2 font-mono font-semibold text-[var(--foreground)]">{band.current_pct.toFixed(1)}%</span>
        </div>
        <DirIcon className={`w-4 h-4 ${dirColor}`} />
        <div className="text-right min-w-[100px]">
          <span className="text-sm text-[var(--muted-foreground)]">Illustrative</span>
          <span className="ml-2 font-mono font-semibold text-[var(--primary)]">
            {band.illustrative_low_pct.toFixed(0)}–{band.illustrative_high_pct.toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}

function AppliedTiltRow({ tilt }: { tilt: AppliedTiltEntry }) {
  const statusConfig = STATUS_CONFIG[tilt.status] || STATUS_CONFIG.NOT_APPLIED;
  const StatusIcon = statusConfig.icon;
  
  return (
    <div className="flex items-center justify-between py-3 px-4 border-b border-[var(--border)] last:border-b-0">
      <div className="flex-1">
        <span className="font-medium text-[var(--foreground)]">{tilt.axis_label}</span>
        {tilt.constraint_reason && (
          <p className="text-xs text-[var(--muted-foreground)] mt-1">{tilt.constraint_reason}</p>
        )}
      </div>
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusConfig.bgColor}`}>
        <StatusIcon className={`w-3 h-3 ${statusConfig.color}`} />
        <span className={`text-xs font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
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

function ScenarioContent({ scenario }: { scenario: IllustrativeScenario }) {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
        <p className="text-sm text-[var(--muted-foreground)]">{scenario.scenario_description}</p>
        <div className="flex items-center gap-6 mt-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted-foreground)]">Tilts reflected:</span>
            <span className="text-sm font-semibold text-[#10A957]">{scenario.tilts_applied_count}</span>
          </div>
          {scenario.tilts_constrained_count > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--muted-foreground)]">Tilts constrained:</span>
              <span className="text-sm font-semibold text-[#FE9239]">{scenario.tilts_constrained_count}</span>
            </div>
          )}
        </div>
      </div>

      {/* Asset Class Bands */}
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#10A957]/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative bg-white dark:bg-slate-800/80 rounded-2xl border border-[var(--border)] shadow-lg p-6">
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-[var(--primary)]" />
            Asset Class Allocation
          </h3>
          <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] overflow-hidden">
            {scenario.asset_class_bands.map((band) => (
              <AllocationBandRow key={band.sleeve} band={band} />
            ))}
          </div>
        </div>
      </div>

      {/* Region Bands */}
      {scenario.region_bands.length > 0 && (
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-[var(--border)] shadow-lg p-6">
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">Regional Allocation</h3>
          <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] overflow-hidden">
            {scenario.region_bands.map((band) => (
              <AllocationBandRow key={band.sleeve} band={band} />
            ))}
          </div>
        </div>
      )}

      {/* Applied Tilts Panel */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-[var(--border)] shadow-lg p-6">
        <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
          <TargetIcon className="w-5 h-5 text-[var(--primary)]" />
          Belief Tilts Reflected
        </h3>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">
          This shows how each belief axis from Step 6 is reflected in this illustrative scenario.
        </p>
        <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] overflow-hidden">
          {scenario.applied_tilts.map((tilt) => (
            <AppliedTiltRow key={tilt.axis_code} tilt={tilt} />
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
              Safety Lights guardrails take precedence over belief tilts.
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
  const { 
    scenario, 
    beliefs, 
    analysis,
    computeScenarios, 
    setActiveScenario,
    completeScenarioStep,
  } = useOnboardingV2Store();

  const tiltsAllowed = beliefs.tilts_allowed;
  const safetyLights = analysis.result?.safety_lights;

  // Compute scenarios on mount if not already computed
  useEffect(() => {
    if (!scenario.computed && analysis.result) {
      computeScenarios();
    }
  }, [scenario.computed, analysis.result, computeScenarios]);

  const activeScenario = useMemo(() => {
    return scenario.scenarios.find(s => s.scenario_type === scenario.active_scenario) || scenario.scenarios[0];
  }, [scenario.scenarios, scenario.active_scenario]);

  const handleContinue = () => {
    completeScenarioStep();
    navigate('/onboarding-v2/transition');
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
                    <span>This page provides an illustrative portfolio scenario based on the information provided.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-[var(--primary)] flex-shrink-0 mt-0.5" />
                    <span>It reflects the constraints and preferences captured in onboarding.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-[var(--primary)] flex-shrink-0 mt-0.5" />
                    <span>It does not account for the full suitability assessment required for regulated advice, and it does not instruct you to buy or sell any asset.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

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
                  <h4 className="font-bold text-[#FE9239]">Belief tilts captured but not applied</h4>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Safety Lights guardrails prevent tilt application in this scenario. Address the underlying constraints to enable tilts.
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

              <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Illustrative Scenarios</h2>
              <p className="text-sm text-[var(--muted-foreground)] mb-6">
                Unlock models three illustrative scenarios. Each reflects your stated preferences within different constraint frameworks.
              </p>

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
                    <ScenarioContent scenario={s} />
                  </TabsContent>
                ))}
              </Tabs>
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
