import { useMemo } from 'react';
import OnboardingLayout from '@/components/onboarding-v2/OnboardingLayout';
import { useOnboardingV2Store } from '@/state/onboardingV2Store';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { mixFromHoldings, type MixHolding } from '@/lib/portfolioMix';
import { EPISODES } from '@/data/episodeLibrary';
import { replayEpisode } from '@/lib/empiricalEngine';
import { computeAlignment } from '@/lib/beliefImpact/computeAlignment';
import { computeTieredImpact } from '@/lib/beliefImpact/computeTieredImpact';
import { computeIncomeRunway } from '@/lib/beliefImpact/computeIncomeRunway';
import { BELIEF_SCENARIO_MAPPING, type BeliefScenarioName } from '@/data/beliefImpactTaxonomy';
import { fmtSignedPct } from '@/lib/scenarioPlannerView';

const BAND_LABEL: Record<string, string> = {
  BROADLY_ALIGNED: 'Broadly aligned',
  PARTIALLY_ALIGNED: 'Partially aligned',
  MISALIGNED: 'Misaligned',
};

export default function OutlookResults() {
  const [, navigate] = useLocation();
  const { holdings, intake, outlook, summary } = useOnboardingV2Store();

  const holdingsForCompute = useMemo(
    () => holdings.filter((h) => h.value_gbp > 0).map((h) => ({ asset_class: h.asset_class, region: h.region, value_gbp: h.value_gbp })),
    [holdings],
  );

  const { mix } = useMemo(() => mixFromHoldings(holdingsForCompute as MixHolding[]), [holdingsForCompute]);

  const alignment = useMemo(
    () => computeAlignment(mix, outlook.scenario_weights, intake.risk_comfort),
    [mix, outlook.scenario_weights, intake.risk_comfort],
  );

  const tieredImpact = useMemo(
    () => computeTieredImpact(mix, holdingsForCompute, outlook.scenario_weights, summary.total_investable_value),
    [mix, holdingsForCompute, outlook.scenario_weights, summary.total_investable_value],
  );

  const topScenario = useMemo(() => {
    const entries = Object.entries(outlook.scenario_weights) as [BeliefScenarioName, number][];
    return entries.sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  }, [outlook.scenario_weights]);

  const runwayExamples = useMemo(() => {
    if (!topScenario) return [];
    const mapping = BELIEF_SCENARIO_MAPPING[topScenario];
    if (!mapping || mapping.isUpside) return [];
    return mapping.episodeIds
      .map((epId) => EPISODES.find((e) => e.id === epId))
      .filter((e): e is NonNullable<typeof e> => e !== undefined)
      .map((episode) => {
        const replay = replayEpisode(mix, episode, summary.total_investable_value);
        return computeIncomeRunway(replay, intake.annual_essential_spend_gbp, intake.liquid_cash_gbp, episode.name);
      });
  }, [topScenario, mix, summary.total_investable_value, intake.annual_essential_spend_gbp, intake.liquid_cash_gbp]);

  const handleContinue = () => navigate('/onboarding-v2/outlook-alternatives');
  const handleBack = () => navigate('/onboarding-v2/outlook');

  if (outlook.insufficient_signal) {
    return (
      <OnboardingLayout
        stepId="outlook-results"
        title="Your outlook results"
        description="How your outlook maps to your actual holdings."
        hideNav={true}
      >
        <div className="space-y-6 pt-6">
          <p className="text-sm text-[var(--muted-foreground)]" data-testid="outlook-insufficient-signal">
            Your answers didn't give us enough signal to model an outlook-driven impact — mostly neutral responses
            cancel each other out. You can go back and answer more definitively, or continue without this view.
          </p>
          <div className="flex justify-between items-center pt-6 border-t border-[var(--border)]">
            <Button variant="outline" onClick={handleBack} data-testid="outlook-results-back-button">Back</Button>
            <Button onClick={handleContinue} data-testid="outlook-results-continue-button">Continue</Button>
          </div>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout
      stepId="outlook-results"
      title="Your outlook results"
      description="How your outlook maps to your actual holdings."
      hideNav={true}
    >
      <div className="space-y-6 pt-6">
        <div className="p-5 rounded-xl border-2 border-[var(--border)]" data-testid="alignment-headline">
          <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Alignment score</p>
          <p className="text-3xl font-bold">
            {alignment.score}<span className="text-base font-normal text-[var(--muted-foreground)]"> / 100</span>
          </p>
          <p className="text-sm font-medium mt-1">{BAND_LABEL[alignment.band]}</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-2">
            Illustrative only — based on 15 answers and a mix of cited and illustrative data, not a precise measurement.
          </p>
        </div>

        {alignment.mismatchFlag && (
          <div className="p-4 rounded-xl border-2 border-amber-500/30 bg-amber-500/5" data-testid="mismatch-flag">
            <p className="text-sm text-amber-700 dark:text-amber-400">{alignment.mismatchFlag}</p>
          </div>
        )}
        {alignment.concentrationFlag && (
          <div className="p-4 rounded-xl border-2 border-amber-500/30 bg-amber-500/5" data-testid="concentration-flag">
            <p className="text-sm text-amber-700 dark:text-amber-400">{alignment.concentrationFlag}</p>
          </div>
        )}

        <div className="space-y-3" data-testid="tiered-impact-rows">
          {tieredImpact.rows.map((row) => (
            <div key={row.bucket} className="p-4 rounded-xl border border-[var(--border)]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">{row.bucket.replace(/-/g, ' ')}</span>
                <span className="text-xs text-[var(--muted-foreground)]">{row.weightPct}% of modelled portfolio</span>
              </div>
              <span className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
                {row.tier === 'EPISODE_REPLAY' ? 'Cited historical replay' : 'Illustrative, anchored to historical episodes'}
              </span>
              {row.citedSources.map((s) => (
                <p key={s.id} className="text-sm mt-1">
                  {s.name}: {fmtSignedPct(s.troughPct)} at the deepest point ({s.recoveryLabel})
                </p>
              ))}
            </div>
          ))}
        </div>

        {runwayExamples.map((r, i) => (
          <div key={i} className="p-4 rounded-xl border border-[var(--border)] bg-slate-50 dark:bg-slate-800/50" data-testid={`income-runway-${i}`}>
            <p className="text-sm">{r.narrative}</p>
          </div>
        ))}

        {tieredImpact.unmodelledBreakdown.length > 0 && (
          <div className="p-4 rounded-xl border border-[var(--border)]" data-testid="unmodelled-breakdown">
            <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
              Not modelled ({tieredImpact.unmodelledSharePct}% of your portfolio)
            </p>
            {tieredImpact.unmodelledBreakdown.map((u) => (
              <p key={u.name} className="text-sm">
                {u.name.replace(/-/g, ' ')}: £{u.valueGbp.toLocaleString('en-GB')} — no reliable long-run history exists for this asset class.
              </p>
            ))}
          </div>
        )}

        <p className="text-xs text-[var(--muted-foreground)] pt-2 border-t border-[var(--border)]">
          Illustrative only. Not financial advice.
        </p>

        <div className="flex justify-between items-center pt-2">
          <Button variant="outline" onClick={handleBack} data-testid="outlook-results-back-button">Back</Button>
          <Button onClick={handleContinue} data-testid="outlook-results-continue-button">See alternatives</Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
