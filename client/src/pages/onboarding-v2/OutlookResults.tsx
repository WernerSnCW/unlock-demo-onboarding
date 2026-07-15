import { useMemo } from 'react';
import OnboardingLayout from '@/components/onboarding-v2/OnboardingLayout';
import { useOnboardingV2Store } from '@/state/onboardingV2Store';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { mixFromHoldings } from '@/lib/portfolioMix';
import { EPISODES } from '@/data/episodeLibrary';
import { replayEpisode } from '@/lib/empiricalEngine';
import { computeAlignment, type AlignmentBand } from '@/lib/beliefImpact/computeAlignment';
import { computeTieredImpact } from '@/lib/beliefImpact/computeTieredImpact';
import { computeIncomeRunway } from '@/lib/beliefImpact/computeIncomeRunway';
import { BELIEF_SCENARIO_MAPPING, type BeliefScenarioName } from '@/data/beliefImpactTaxonomy';
import { fmtSignedPct } from '@/lib/scenarioPlannerView';
import { formatCurrency } from '@/utils/calculators';
import { bucketDisplayLabel } from '@/lib/bucketLabels';

const BAND_LABEL: Record<AlignmentBand, string> = {
  BROADLY_ALIGNED: 'Broadly aligned',
  PARTIALLY_ALIGNED: 'Partially aligned',
  MISALIGNED: 'Misaligned',
};

const BAND_BAR: Record<AlignmentBand, string> = {
  BROADLY_ALIGNED: 'bg-[var(--success)]',
  PARTIALLY_ALIGNED: 'bg-amber-500',
  MISALIGNED: 'bg-rose-500',
};

/** Thin horizontal bar — used for the alignment gauge, coverage split and drawdown bars. */
function MiniBar({ pct, className }: { pct: number; className: string }) {
  const w = Math.max(0, Math.min(100, pct));
  return (
    <div className="h-2 rounded-full bg-[var(--muted)] overflow-hidden">
      <div className={`h-full rounded-full ${className}`} style={{ width: `${w}%` }} />
    </div>
  );
}

export default function OutlookResults() {
  const [, navigate] = useLocation();
  const { holdings, intake, outlook, summary } = useOnboardingV2Store();

  const holdingsForCompute = useMemo(
    () => holdings.filter((h) => h.value_gbp > 0).map((h) => ({ asset_class: h.asset_class, region: h.region, value_gbp: h.value_gbp })),
    [holdings],
  );

  const { mix } = useMemo(() => mixFromHoldings(holdingsForCompute), [holdingsForCompute]);

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
    if (intake.annual_essential_spend_gbp <= 0) return [];
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

  const modelledPct = Math.max(0, Math.min(100, 100 - tieredImpact.unmodelledSharePct));
  const maxTrough = Math.max(
    0.2,
    ...tieredImpact.rows.flatMap((r) => r.citedSources.map((s) => Math.abs(s.troughPct))),
  );

  return (
    <OnboardingLayout
      stepId="outlook-results"
      title="Your outlook results"
      description="How the world you described would land on the things you actually own."
      hideNav={true}
    >
      <div className="space-y-8 pt-6">
        {/* Lead-in: what this whole page is doing */}
        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
          You told us how you see the next few years. Here we take what you actually own and ask three things:
          does your portfolio line up with that view, where would it have hurt in past crises like the ones you
          flagged, and would your cash carry you through. It's illustrative — a way to see and discuss, not a forecast.
        </p>

        {/* 1 — Alignment */}
        <section className="space-y-3">
          <div>
            <h3 className="text-base font-semibold text-[var(--foreground)]">How aligned are you?</h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              How closely what you own lines up with the world you described — out of 100.
            </p>
          </div>
          <div className="p-5 rounded-xl border-2 border-[var(--border)]" data-testid="alignment-headline">
            <div className="flex items-end justify-between mb-3">
              <p className="text-3xl font-bold">
                {alignment.score}<span className="text-base font-normal text-[var(--muted-foreground)]"> / 100</span>
              </p>
              <p className="text-sm font-medium">{BAND_LABEL[alignment.band]}</p>
            </div>
            <MiniBar pct={alignment.score} className={BAND_BAR[alignment.band]} />
            <div className="flex justify-between text-[10px] text-[var(--muted-foreground)] mt-1.5">
              <span>Misaligned</span>
              <span>Partially aligned (40+)</span>
              <span>Broadly aligned (70+)</span>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] mt-3">
              Illustrative only — based on 15 answers and a mix of cited and illustrative data, not a precise measurement.
              A lower score isn't a failure; it just means your holdings and your view are pulling in different directions.
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
        </section>

        {/* 2 — What "modelled" means + coverage split */}
        <section className="space-y-3">
          <div>
            <h3 className="text-base font-semibold text-[var(--foreground)]">What we could model</h3>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              We stress-test your holdings by <strong>replaying real past market crises</strong> (the dot-com bust, 2008,
              COVID, the 2022 rate shock). We can only do that for asset types with reliable long-run history —
              shares, bonds, property and cash. Tax-advantaged or niche holdings — VCTs, AIM, a pension entered as a
              single line, collectibles — don't have that history, so we <strong>set them aside and show them
              separately</strong> rather than guess.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-[var(--border)]" data-testid="coverage-bar">
            <div className="flex h-3 rounded-full overflow-hidden bg-[var(--muted)]">
              <div className="bg-[var(--primary)] h-full" style={{ width: `${modelledPct}%` }} />
            </div>
            <div className="flex justify-between text-xs mt-2">
              <span className="flex items-center gap-1.5 text-[var(--foreground)]">
                <span className="w-2 h-2 rounded-full bg-[var(--primary)]" /> Modelled {modelledPct}%
              </span>
              <span className="flex items-center gap-1.5 text-[var(--muted-foreground)]">
                <span className="w-2 h-2 rounded-full bg-[var(--muted-foreground)]" /> Set aside {tieredImpact.unmodelledSharePct}%
              </span>
            </div>
          </div>
        </section>

        {/* 3 — Impact, with drawdown bars */}
        <section className="space-y-3">
          <div>
            <h3 className="text-base font-semibold text-[var(--foreground)]">How your holdings would have fared</h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              For the part we could model, here's the deepest drop each asset type saw in past crises like the one your
              answers point to — and how long it took to recover. Bars are scaled to the worst drop shown.
            </p>
          </div>
          <div className="space-y-3" data-testid="tiered-impact-rows">
            {tieredImpact.rows.map((row) => (
              <div key={row.bucket} className="p-4 rounded-xl border border-[var(--border)]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{bucketDisplayLabel(row.bucket)}</span>
                  <span className="text-xs text-[var(--muted-foreground)]">{row.weightPct}% of modelled portfolio</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
                  {row.tier === 'EPISODE_REPLAY' ? 'Cited historical replay' : 'Illustrative, anchored to historical episodes'}
                </span>
                <div className="mt-2.5 space-y-2.5">
                  {row.citedSources.map((s) => (
                    <div key={s.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{s.name}</span>
                        <span className="font-semibold text-rose-600 dark:text-rose-400">{fmtSignedPct(s.troughPct)}</span>
                      </div>
                      <MiniBar pct={(Math.abs(s.troughPct) / maxTrough) * 100} className="bg-rose-500" />
                      <p className="text-[11px] text-[var(--muted-foreground)] mt-1">at the deepest point · {s.recoveryLabel}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4 — Income runway */}
        {runwayExamples.length > 0 && (
          <section className="space-y-3">
            <div>
              <h3 className="text-base font-semibold text-[var(--foreground)]">Would your cash carry you through?</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                Whether your cash buffer would cover essential spending until markets recovered — or whether you'd be
                forced to sell at the bottom.
              </p>
            </div>
            {runwayExamples.map((r, i) => (
              <div key={i} className="p-4 rounded-xl border border-[var(--border)] bg-slate-50 dark:bg-slate-800/50" data-testid={`income-runway-${i}`}>
                <p className="text-sm">{r.narrative}</p>
              </div>
            ))}
          </section>
        )}

        {/* 5 — Set aside (not modelled) */}
        {tieredImpact.unmodelledBreakdown.length > 0 && (
          <div className="p-4 rounded-xl border border-dashed border-[var(--border)]" data-testid="unmodelled-breakdown">
            <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
              Set aside — not modelled ({tieredImpact.unmodelledSharePct}% of your portfolio)
            </p>
            {tieredImpact.unmodelledBreakdown.map((u) => (
              <p key={u.name} className="text-sm mt-1">
                {bucketDisplayLabel(u.name)}: {formatCurrency(u.valueGbp)} — no reliable long-run history for this asset type, so it's left out rather than guessed.
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
