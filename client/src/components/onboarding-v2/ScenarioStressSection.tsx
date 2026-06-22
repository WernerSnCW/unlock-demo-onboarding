import { useMemo } from 'react';
import { useOnboardingV2Store } from '@/state/onboardingV2Store';
import { STRESS_SCENARIOS } from '@/data/stressScenarios';
import { computeScenarioStress, type StressHolding } from '@/lib/scenarioStress';
import { orderBySalience } from '@/lib/scenarioStressSalience';
import { buildStressNarrative } from '@/lib/scenarioStressView';

export default function ScenarioStressSection() {
  const { holdings, beliefs } = useOnboardingV2Store();

  const narratives = useMemo(() => {
    const stressHoldings: StressHolding[] = holdings
      .filter((h) => h.value_gbp > 0)
      .map((h) => ({
        instrument_name: h.instrument_name,
        asset_class: h.asset_class,
        region: h.region,
        value_gbp: h.value_gbp,
      }));
    const results = computeScenarioStress(stressHoldings, STRESS_SCENARIOS);
    const ordered = orderBySalience(results, STRESS_SCENARIOS, { axisScores: beliefs.axis_scores });
    const byId = new Map(STRESS_SCENARIOS.map((s) => [s.id, s]));
    return ordered.map((r) => buildStressNarrative(r, byId.get(r.scenarioId)!));
  }, [holdings, beliefs.axis_scores]);

  if (narratives.length === 0) return null;

  return (
    <div className="space-y-3" data-testid="scenario-stress-section">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
        How your portfolio holds up under stress
      </h3>
      <p className="text-sm text-[var(--muted-foreground)] -mt-1">
        Illustrative, conditional estimates of how your current holdings would move if each scenario played out. Not a forecast.
      </p>
      <div className="grid gap-3">
        {narratives.map((n) => (
          <div
            key={n.scenarioId}
            className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5"
            data-testid={`stress-card-${n.scenarioId}`}
          >
            <div className="flex items-baseline justify-between gap-3">
              <h4 className="font-bold text-[var(--foreground)] tracking-tight">{n.title}</h4>
              <span className="text-xs text-[var(--muted-foreground)]">{n.anchor}</span>
            </div>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">{n.blurb}</p>
            <p className="text-base font-semibold text-[var(--foreground)] mt-3">{n.headline}</p>
            {n.contributors.length > 0 && (
              <ul className="mt-2 text-sm text-[var(--muted-foreground)] list-disc list-inside">
                {n.contributors.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
