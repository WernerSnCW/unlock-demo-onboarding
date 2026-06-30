import { useMemo, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  FileText, 
  Download, 
  Home,
  ShieldCheck,
  ShieldAlert,
  XCircle,
  Lock,
  ChevronRight,
  ChevronLeft,
  Printer,
  FileJson,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  useOnboardingV2Store, 
  SafetyStatus,
  Holding,
  IllustrativeScenario,
  AppliedTiltEntry,
} from '@/state/onboardingV2Store';
import { hasAnyRedLight, type PolicyData } from '@/lib/step9Helpers';
import { pctToMonetary } from '@/lib/step7Helpers';
import { 
  computeCrossScenarioSignals, 
  getScenarioInterpretation, 
  getCrossScenarioSynthesis,
  SCENARIO_EXPLAINER,
  type InterpretationContext,
} from '@/lib/scenarioInterpretation';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/Logo';

const SAFETY_STATUS_CONFIG: Record<SafetyStatus, { icon: typeof ShieldCheck; color: string; bg: string; label: string }> = {
  GREEN: { icon: ShieldCheck, color: 'text-[var(--success)]', bg: 'bg-[#00bb77]/15', label: 'Green' },
  AMBER: { icon: ShieldAlert, color: 'text-[var(--warning)]', bg: 'bg-[#f59e0b]/15', label: 'Amber' },
  RED: { icon: XCircle, color: 'text-[var(--destructive)]', bg: 'bg-[#ef4444]/15', label: 'Red' },
};

function SafetyPill({ status, label }: { status: SafetyStatus; label: string }) {
  const config = SAFETY_STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg}`}>
      <Icon className={`w-4 h-4 ${config.color}`} />
      <span className={`text-sm font-medium ${config.color}`}>{label}</span>
    </div>
  );
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `£${(value / 1_000_000).toFixed(2)}m`;
  } else if (value >= 1000) {
    return `£${(value / 1000).toFixed(1)}k`;
  }
  return `£${value.toFixed(0)}`;
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export default function Report() {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const { holdings, analysis, beliefs, scenario, intake } = useOnboardingV2Store();
  
  const safetyLights = analysis.result?.safety_lights;
  const metrics = safetyLights?.metrics;
  const hasRedLight = hasAnyRedLight(safetyLights);
  const hasAmberLight = safetyLights ? (
    safetyLights.liquidity === 'AMBER' || 
    safetyLights.concentration === 'AMBER' || 
    safetyLights.illiquids === 'AMBER'
  ) : false;
  const tiltsAllowed = beliefs.tilts_allowed && !hasRedLight;
  
  const { data: policy } = useQuery<PolicyData>({
    queryKey: ['/api/onboarding-v2/policy'],
  });

  const totalValue = useMemo(() => {
    return holdings.reduce((sum: number, p: Holding) => sum + (p.value_gbp || 0), 0);
  }, [holdings]);

  const hasTotalValue = totalValue > 0;

  const assetClassBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    holdings.forEach((p: Holding) => {
      const assetClass = p.asset_class || 'Other';
      breakdown[assetClass] = (breakdown[assetClass] || 0) + (p.value_gbp || 0);
    });
    return Object.entries(breakdown)
      .map(([name, value]) => ({
        name,
        value,
        pct: totalValue > 0 ? (value / totalValue) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [holdings, totalValue]);

  const regionBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    holdings.forEach((p: Holding) => {
      const region = p.region || 'Unspecified';
      breakdown[region] = (breakdown[region] || 0) + (p.value_gbp || 0);
    });
    return Object.entries(breakdown)
      .map(([name, value]) => ({
        name,
        value,
        pct: totalValue > 0 ? (value / totalValue) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [holdings, totalValue]);

  const wrapperBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    holdings.forEach((p: Holding) => {
      const wrapper = p.wrapper || 'Unknown';
      breakdown[wrapper] = (breakdown[wrapper] || 0) + (p.value_gbp || 0);
    });
    return Object.entries(breakdown)
      .map(([name, value]) => ({
        name,
        value,
        pct: totalValue > 0 ? (value / totalValue) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [holdings, totalValue]);

  const primaryConstraint = useMemo(() => {
    if (!safetyLights) return 'Analysis not completed';
    if (safetyLights.liquidity === 'RED' || 
        safetyLights.concentration === 'RED' || 
        safetyLights.illiquids === 'RED') {
      return 'Red guardrail(s) present — constraints dominate';
    }
    if (safetyLights.liquidity === 'AMBER') return 'Liquidity constraints apply';
    if (safetyLights.concentration === 'AMBER') return 'Concentration constraints apply';
    if (safetyLights.illiquids === 'AMBER') return 'Illiquidity constraints apply';
    return 'No guardrail-driven urgency';
  }, [safetyLights]);

  const crossScenarioSignals = useMemo(() => {
    return computeCrossScenarioSignals(scenario.scenarios);
  }, [scenario.scenarios]);

  const interpretationContext: InterpretationContext = useMemo(() => ({
    any_red: hasRedLight,
    any_amber: hasAmberLight,
    minimal_movement: false, // Computed per-scenario
    scenarios_converged: crossScenarioSignals.scenarios_converged,
    materially_wider: crossScenarioSignals.materially_wider,
  }), [hasRedLight, hasAmberLight, crossScenarioSignals]);

  const scenariosConverge = crossScenarioSignals.scenarios_converged;

  const activeScenario = scenario.scenarios.find(
    (s: IllustrativeScenario) => s.scenario_type === scenario.active_scenario
  );
  const appliedTilts = activeScenario?.applied_tilts || [];

  const generatedAt = new Date().toLocaleString('en-GB', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  const reportId = useMemo(() => {
    return `RPT-${Date.now().toString(36).toUpperCase()}`;
  }, []);

  const handleDownloadPDF = () => {
    window.print();
    toast({ title: 'Print dialog opened', description: 'Use your browser print dialog to save as PDF' });
  };

  const handleDownloadJSON = () => {
    const reportData = {
      report_meta: {
        report_id: reportId,
        generated_at: new Date().toISOString(),
        total_portfolio_value_gbp: totalValue,
        currency: 'GBP',
      },
      inputs_summary: {
        positions_count: holdings.length,
        intake_completed: intake.full_name !== '',
      },
      safety_lights: safetyLights ? {
        liquidity: { status: safetyLights.liquidity, metric: metrics?.cash_runway_months },
        concentration: { status: safetyLights.concentration, metric: metrics?.largest_line_pct },
        illiquids: { status: safetyLights.illiquids, metric: metrics?.illiquid_pct },
      } : null,
      preferences: {
        tilts_allowed: tiltsAllowed,
        applied_tilts: appliedTilts,
      },
      scenarios: scenario.scenarios.map((s: IllustrativeScenario) => ({
        scenario_type: s.scenario_type,
        bands: s.asset_class_bands.map(b => ({
          sleeve: b.sleeve,
          min_pct: b.illustrative_low_pct,
          max_pct: b.illustrative_high_pct,
        })),
      })),
      wrappers: wrapperBreakdown.reduce((acc: Record<string, number>, w) => {
        acc[w.name] = w.value;
        return acc;
      }, {}),
      transition: {
        has_red_light: hasRedLight,
        tilts_allowed: tiltsAllowed,
      },
      disclosures: {
        is_illustrative: true,
        not_financial_advice: true,
        policy_version: 'v1.0',
      },
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unlock-report-${reportId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'JSON downloaded', description: 'Report data exported successfully' });
  };

  const questionsToConsider = [
    'Are the guardrail thresholds aligned with your comfort around liquidity and concentration?',
    'Which preferences matter most to you when constraints tighten?',
    'Do wrappers match how accessible you want capital to be?',
    'If constraints force convergence, which constraint would you revisit first?',
    'How does the current allocation compare to your long-term intentions?',
    'Are there wrappers you would like to use more or less?',
  ];

  const guardrailDetails = safetyLights ? [
    { 
      key: 'liquidity', 
      label: 'Liquidity', 
      status: safetyLights.liquidity, 
      metric: metrics?.cash_runway_months,
      metricLabel: 'Cash runway',
      metricFormat: (v: number) => `${v.toFixed(1)} months`,
      why: 'Ensures sufficient accessible funds for near-term needs.' 
    },
    { 
      key: 'concentration', 
      label: 'Concentration', 
      status: safetyLights.concentration, 
      metric: metrics?.largest_line_pct,
      metricLabel: 'Largest position',
      metricFormat: (v: number) => formatPercent(v),
      why: 'Limits exposure to any single holding or sector.' 
    },
    { 
      key: 'illiquids', 
      label: 'Illiquids', 
      status: safetyLights.illiquids, 
      metric: metrics?.illiquid_pct,
      metricLabel: 'Illiquid exposure',
      metricFormat: (v: number) => formatPercent(v),
      why: 'Monitors exposure to assets that cannot be readily sold.' 
    },
  ] : [];

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <div className="print:hidden">
        <Header />
      </div>
      
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8">
        <div ref={printRef} className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-8 print:border-0 print:p-0">
          
          <div className="flex justify-between items-start mb-6 print:mb-4">
            <div className="flex items-start gap-4">
              <Logo size="lg" />
              <div>
                <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2" data-testid="report-title">
                  Snapshot Report (Illustrative)
                </h1>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Generated: {generatedAt}
                </p>
                {hasTotalValue && (
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Portfolio total: {formatCurrency(totalValue)} (GBP)
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2 print:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPDF}
                className="gap-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white"
                data-testid="button-download-pdf"
              >
                <Printer className="w-4 h-4" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadJSON}
                className="gap-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white"
                data-testid="button-download-json"
              >
                <FileJson className="w-4 h-4" />
                JSON
              </Button>
            </div>
          </div>

          <div className="border-l-4 border-[var(--primary)] bg-slate-50 dark:bg-slate-800/50 px-5 py-4 mb-8 print:mb-6">
            <p className="text-sm text-[var(--muted-foreground)] italic leading-relaxed">
              This report is illustrative and not financial advice. It summarises the information you provided and the constraints applied.
            </p>
          </div>

          <section className="mb-8 print:mb-6" data-testid="section-narrative">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">
              What this report is telling you
            </h2>
            <div className="space-y-4 text-[var(--foreground)] text-sm leading-relaxed">
              <p>
                This report summarises how your current portfolio behaves when tested against basic safety checks, your stated preferences, and a small set of illustrative scenarios.
              </p>
              <p>
                {hasRedLight 
                  ? 'One or more structural risks are present, which currently dominate how the portfolio behaves.'
                  : hasAmberLight
                    ? 'There are some emerging structural considerations, which may limit how freely preferences can apply.'
                    : 'In your case, the portfolio does not trigger any immediate structural risks. This means there is no forced need to change your allocation based on liquidity, concentration, or illiquidity concerns.'
                }
              </p>
              {!hasRedLight && !hasAmberLight && (
                <p>
                  Your preferences are recognised by the model, but because the portfolio already sits comfortably within the defined constraints, those preferences do not materially change the overall shape of the portfolio in the scenarios shown.
                </p>
              )}
            </div>
          </section>

          <section className="mb-8 print:mb-6" data-testid="section-not-doing">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">
              What this report is not doing
            </h2>
            <div className="space-y-2 text-[var(--foreground)] text-sm leading-relaxed">
              <p>This report does not tell you to buy or sell anything.</p>
              <p>It does not claim your portfolio is optimal or complete.</p>
              <p>It simply shows how much room there is — or is not — to move within the current constraints.</p>
            </div>
          </section>

          <section className="mb-8 print:mb-6 print:break-after-page" data-testid="section-executive">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[var(--primary)]" />
              Executive Snapshot
            </h2>
            
            {safetyLights && (
              <div className="mb-4">
                <p className="text-sm text-[var(--muted-foreground)] mb-2">Safety Lights</p>
                <div className="flex flex-wrap gap-2">
                  <SafetyPill status={safetyLights.liquidity} label="Liquidity" />
                  <SafetyPill status={safetyLights.concentration} label="Concentration" />
                  <SafetyPill status={safetyLights.illiquids} label="Illiquids" />
                </div>
              </div>
            )}
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                <p className="text-sm text-[var(--muted-foreground)] mb-1">Primary Constraint</p>
                <p className="font-semibold text-[var(--foreground)]">{primaryConstraint}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                <p className="text-sm text-[var(--muted-foreground)] mb-1">Preference Status</p>
                <p className="font-semibold text-[var(--foreground)]">
                  {tiltsAllowed ? 'Preferences allowed' : 'Preferences locked'}
                </p>
              </div>
            </div>
            
            {scenariosConverge && (
              <div className="mt-4 bg-[var(--u-green-fill)] border border-[var(--u-green-line)] rounded-lg p-3">
                <p className="text-sm text-[var(--foreground)]">
                  Under current constraints, scenarios converge on similar ranges.
                </p>
              </div>
            )}
          </section>

          <section className="mb-8 print:mb-6" data-testid="section-portfolio">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">
              Current Portfolio Snapshot
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-[var(--foreground)] mb-3">Asset Class Allocation</h3>
                {assetClassBreakdown.length > 0 ? (
                  <div className="space-y-2">
                    {assetClassBreakdown.map(item => (
                      <div key={item.name} className="flex justify-between items-center text-sm">
                        <span className="text-[var(--foreground)]">{item.name}</span>
                        <span className="text-[var(--muted-foreground)]">
                          {formatPercent(item.pct)}
                          {hasTotalValue && ` (~${formatCurrency(item.value)})`}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--muted-foreground)]">No holdings data provided</p>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold text-[var(--foreground)] mb-3">Regional Allocation</h3>
                {regionBreakdown.length > 0 ? (
                  <div className="space-y-2">
                    {regionBreakdown.map(item => (
                      <div key={item.name} className="flex justify-between items-center text-sm">
                        <span className="text-[var(--foreground)]">{item.name}</span>
                        <span className="text-[var(--muted-foreground)]">
                          {formatPercent(item.pct)}
                          {hasTotalValue && ` (~${formatCurrency(item.value)})`}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--muted-foreground)]">No regional data available</p>
                )}
              </div>
            </div>
            
            {!hasTotalValue && (
              <p className="mt-4 text-sm text-[var(--muted-foreground)] italic">
                £ values unavailable (portfolio total not provided).
              </p>
            )}
          </section>

          <section className="mb-8 print:mb-6 print:break-after-page" data-testid="section-guardrails">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">
              Guardrails Detail
            </h2>
            
            {hasRedLight && (
              <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-4 mb-4 flex items-start gap-3">
                <Lock className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-rose-800 dark:text-rose-200">
                  Preferences are locked while a red item exists. Address the red cards in Analysis to enable preference signals.
                </p>
              </div>
            )}
            
            {guardrailDetails.length > 0 && (
              <div className="space-y-4">
                {guardrailDetails.map(item => {
                  const config = SAFETY_STATUS_CONFIG[item.status];
                  const Icon = config.icon;
                  return (
                    <div key={item.key} className={`rounded-lg p-4 border ${config.bg} border-opacity-50`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-5 h-5 ${config.color}`} />
                          <span className="font-semibold text-[var(--foreground)]">{item.label}</span>
                        </div>
                        <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                      </div>
                      <div className="text-sm text-[var(--muted-foreground)]">
                        {item.metric !== undefined && (
                          <p>{item.metricLabel}: {item.metricFormat(item.metric)}</p>
                        )}
                        <p className="mt-1 italic">{item.why}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="mb-8 print:mb-6" data-testid="section-preferences">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">
              Preferences Summary
            </h2>
            
            {appliedTilts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left py-2 text-[var(--muted-foreground)] font-medium">Axis</th>
                      <th className="text-left py-2 text-[var(--muted-foreground)] font-medium">Application Status</th>
                      <th className="text-left py-2 text-[var(--muted-foreground)] font-medium">Constraint</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appliedTilts.map((tilt: AppliedTiltEntry) => (
                      <tr key={tilt.axis_code} className="border-b border-[var(--border)]">
                        <td className="py-2 text-[var(--foreground)]">{tilt.axis_label}</td>
                        <td className="py-2">
                          <span className={tilt.status === 'APPLIED' ? 'text-[var(--success)]' : tilt.status === 'LOCKED' ? 'text-[var(--destructive)]' : 'text-[var(--warning)]'}>
                            {tilt.status.replace(/_/g, ' ').toLowerCase()}
                          </span>
                        </td>
                        <td className="py-2 text-[var(--muted-foreground)]">{tilt.constraint_reason || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-[var(--muted-foreground)]">No preferences applied.</p>
            )}
            
            <p className="mt-4 text-sm text-[var(--muted-foreground)] italic">
              Preferences are signals used to shape illustrative scenario ranges within constraints. They are not targets.
            </p>
          </section>

          <section className="mb-8 print:mb-6 print:break-after-page" data-testid="section-scenarios">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">
              Illustrative Scenarios Summary
            </h2>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-[var(--foreground)] mb-2">{SCENARIO_EXPLAINER.title}</h3>
              <div className="text-sm text-[var(--muted-foreground)] whitespace-pre-line">
                {SCENARIO_EXPLAINER.content}
              </div>
            </div>
            
            {scenario.scenarios.length > 0 ? (
              <div className="space-y-6">
                {scenario.scenarios.map((s: IllustrativeScenario) => (
                  <div key={s.scenario_type} className="border border-[var(--border)] rounded-lg overflow-hidden shadow-sm">
                    <div className="bg-slate-100 dark:bg-slate-800 px-5 py-3 border-b border-[var(--border)]">
                      <h3 className="font-semibold text-[var(--foreground)]">
                        {s.scenario_label}
                      </h3>
                      <p className="text-sm text-[var(--muted-foreground)] mt-1">{s.scenario_description}</p>
                    </div>
                    <div className="px-5 py-4">
                      <div className="space-y-3">
                        {s.asset_class_bands.map(band => {
                          const lowPct = band.illustrative_low_pct;
                          const highPct = band.illustrative_high_pct;
                          return (
                            <div key={band.sleeve} className="space-y-1">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-[var(--foreground)] font-medium">{band.sleeve}</span>
                                <span className="text-[var(--muted-foreground)] tabular-nums">
                                  {formatPercent(lowPct)} – {formatPercent(highPct)}
                                  {hasTotalValue && (
                                    <span className="ml-2 text-xs">
                                      (~{formatCurrency(pctToMonetary(lowPct, totalValue))} – ~{formatCurrency(pctToMonetary(highPct, totalValue))})
                                    </span>
                                  )}
                                </span>
                              </div>
                              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-[var(--primary)] rounded-full opacity-60"
                                  style={{ 
                                    marginLeft: `${lowPct}%`,
                                    width: `${Math.max(highPct - lowPct, 1)}%`
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-5 pt-4 border-t border-dashed border-[var(--border)]">
                        <p className="text-sm">
                          <span className="font-medium text-[var(--primary)]">Interpretation: </span>
                          <span className="text-[var(--muted-foreground)] italic leading-relaxed">
                            {getScenarioInterpretation(s, interpretationContext)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="border-l-4 border-[var(--primary)] bg-slate-50 dark:bg-slate-800/50 px-5 py-4">
                  <h3 className="font-semibold text-[var(--foreground)] mb-2">What stands out across scenarios</h3>
                  <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                    {getCrossScenarioSynthesis(interpretationContext)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--muted-foreground)]">Scenarios not computed.</p>
            )}
          </section>

          <section className="mb-8 print:mb-6" data-testid="section-wrappers">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">
              Wrappers & Placement
            </h2>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-[var(--foreground)] mb-2">How this fits with the scenarios above</h3>
              <div className="space-y-2 text-sm text-[var(--muted-foreground)] leading-relaxed">
                <p>
                  The scenarios above illustrate how the overall allocation could vary within constraints.
                </p>
                <p>
                  This section shows how your current portfolio is held across different account types ('wrappers'), which affects access, tax treatment, and pacing.
                </p>
                <p>
                  As a result, even where scenarios indicate flexibility at a portfolio level, changes may occur unevenly or gradually across different accounts.
                </p>
              </div>
            </div>
            
            {wrapperBreakdown.length > 0 ? (
              <div className="space-y-2">
                {wrapperBreakdown.map(item => (
                  <div key={item.name} className="flex justify-between items-center text-sm border-b border-[var(--border)] py-2">
                    <span className="text-[var(--foreground)] font-medium">{item.name}</span>
                    <span className="text-[var(--muted-foreground)]">
                      {formatPercent(item.pct)}
                      {hasTotalValue && ` (~${formatCurrency(item.value)})`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--muted-foreground)]">Wrappers not provided.</p>
            )}
            
            {policy && (
              <p className="mt-4 text-sm text-[var(--muted-foreground)] italic">
                Policy wrapper priority: {policy.wrappers.priority_order.join(' → ')}. This is illustrative ordering, not personalised advice.
              </p>
            )}
          </section>

          <section className="mb-8 print:mb-6" data-testid="section-how-to-use">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">
              How to use this report
            </h2>
            <p className="text-sm text-[var(--foreground)] mb-3">
              Investors typically use a snapshot like this to:
            </p>
            <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
              <li className="flex items-start gap-2">
                <span className="text-[var(--primary)]">•</span>
                understand whether any structural risks are forcing action
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--primary)]">•</span>
                see whether preferences meaningfully change outcomes
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--primary)]">•</span>
                identify which constraints matter more than specific assets
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--primary)]">•</span>
                support clearer discussions with partners or advisers
              </li>
            </ul>
          </section>

          <section className="mb-8 print:mb-6" data-testid="section-questions">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">
              Questions you may want to reflect on
            </h2>
            <ul className="space-y-3">
              {questionsToConsider.map((q, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[var(--muted-foreground)]">
                  <ChevronRight className="w-4 h-4 text-[var(--primary)] flex-shrink-0 mt-0.5" />
                  {q}
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-8 print:mb-6" data-testid="section-scope">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">
              Scope & Method
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-[var(--foreground)] mb-2">How scenarios are produced</h3>
                <ul className="space-y-1 text-sm text-[var(--muted-foreground)]">
                  <li>• Safety Lights determine hard constraints</li>
                  <li>• Preference signals tilt within allowed ranges</li>
                  <li>• Policy defaults provide baseline assumptions</li>
                  <li>• All outputs are illustrative, not prescriptive</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-[var(--foreground)] mb-2">What is not modelled</h3>
                <ul className="space-y-1 text-sm text-[var(--muted-foreground)]">
                  <li>• Fees and transaction costs</li>
                  <li>• Tax outcomes or projections</li>
                  <li>• Expected returns or performance</li>
                  <li>• Execution timing or sequencing</li>
                  <li>• Specific product selection</li>
                </ul>
              </div>
            </div>
          </section>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6 border-t border-[var(--border)] print:hidden">
            <Button
              variant="outline"
              onClick={handleDownloadPDF}
              className="gap-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white"
              data-testid="button-download-pdf-bottom"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadJSON}
              className="gap-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white"
              data-testid="button-download-json-bottom"
            >
              <FileJson className="w-4 h-4" />
              Download JSON
            </Button>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 print:hidden">
            <Link href="/onboarding-v2/plan/wrappers" className="flex-1">
              <Button 
                variant="outline"
                className="w-full gap-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white" 
                data-testid="button-back-onboarding"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Onboarding
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button 
                className="w-full gap-2 bg-gradient-to-r from-[var(--primary)] to-[#00bb77]/80 hover:from-[#00bb77]/90 hover:to-[#00bb77]/70 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium" 
                data-testid="button-go-home"
              >
                <Home className="w-4 h-4" />
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </main>
      
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
