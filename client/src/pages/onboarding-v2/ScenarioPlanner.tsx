import { useMemo, useState } from 'react';
import { useOnboardingV2Store } from '@/state/onboardingV2Store';
import { EPISODES } from '@/data/episodeLibrary';
import { mixFromHoldings, type MixHolding } from '@/lib/portfolioMix';
import { replayEpisode, type EpisodeReplay } from '@/lib/empiricalEngine';
import { orderEpisodesBySalience, circumstanceFromIntake } from '@/lib/episodeSalience';
import { DELTA_ENABLED } from '@/lib/featureFlags';
import { TARGET_MARKET, ADVICE_EXIT } from '@/data/scenarioPlannerCopy';
import ScopeContract from '@/components/onboarding-v2/scenario-planner/ScopeContract';
import StageNav from '@/components/onboarding-v2/scenario-planner/StageNav';
import StageStressTest from '@/components/onboarding-v2/scenario-planner/StageStressTest';
import StageAcrossHistory from '@/components/onboarding-v2/scenario-planner/StageAcrossHistory';
import StageTuneIt from '@/components/onboarding-v2/scenario-planner/StageTuneIt';
import StageCompareMixes from '@/components/onboarding-v2/scenario-planner/StageCompareMixes';
import RecoveryCounterBeat from '@/components/onboarding-v2/scenario-planner/RecoveryCounterBeat';

const START_VALUE = 500_000; // illustrative basis for £ contributions; % display is primary (P3-3)

export default function ScenarioPlanner() {
  const { holdings, beliefs, intake } = useOnboardingV2Store();
  const [stage, setStage] = useState(1);

  const circumstance = useMemo(
    () => circumstanceFromIntake({
      portfolio_stage: intake.personaCues.portfolio_stage,
      time_horizon_years: intake.time_horizon_years,
    }),
    [intake.personaCues.portfolio_stage, intake.time_horizon_years],
  );

  const { mix, unmodelledShare, ordered, replays } = useMemo(() => {
    const mixHoldings: MixHolding[] = holdings
      .filter((h) => h.value_gbp > 0)
      .map((h) => ({ asset_class: h.asset_class, region: h.region, value_gbp: h.value_gbp }));
    const { mix, unmodelledShare } = mixFromHoldings(mixHoldings);
    const ordered = orderEpisodesBySalience(EPISODES, { axisScores: beliefs.axis_scores });
    const replays: Record<string, EpisodeReplay> = {};
    for (const ep of ordered) replays[ep.id] = replayEpisode(mix, ep, START_VALUE);
    return { mix, unmodelledShare, ordered, replays };
  }, [holdings, beliefs.axis_scores]);

  const maxStage = DELTA_ENABLED ? 4 : 3;
  const hasHoldings = ordered.length > 0 && holdings.some((h) => h.value_gbp > 0);

  if (!hasHoldings) {
    return (
      <div className="max-w-3xl mx-auto p-6" data-testid="scenario-planner-empty">
        <p className="text-sm text-[var(--muted-foreground)]">
          Add holdings to see how a portfolio like yours behaved across historical periods of stress.
        </p>
      </div>
    );
  }

  const headEpisode = ordered[0];
  const monthly = ordered.filter((e) => e.granularity === 'monthly');

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-5" data-testid="scenario-planner">
      <header className="space-y-1">
        <h2 className="text-lg font-bold tracking-tight">How your portfolio held up through history</h2>
        <p className="text-xs text-[var(--muted-foreground)]">{TARGET_MARKET}</p>
      </header>

      <ScopeContract unmodelledShare={unmodelledShare} />
      <RecoveryCounterBeat circumstance={circumstance} />
      <StageNav stage={stage} maxStage={maxStage} onGo={setStage} onReset={() => setStage(1)} />

      {stage === 1 && <StageStressTest episode={headEpisode} replay={replays[headEpisode.id]} />}
      {stage === 2 && (
        <StageAcrossHistory rows={ordered.map((episode) => ({ episode, replay: replays[episode.id] }))} />
      )}
      {stage === 3 && <StageTuneIt options={monthly} replays={replays} />}
      {/* Stage 4 (delta) is flag-gated dark until §13 compliance sign-off. */}
      {stage === 4 && DELTA_ENABLED && <StageCompareMixes currentMix={mix} episodes={monthly} />}

      <footer className="border-t border-slate-200 pt-3">
        <p className="text-xs text-[var(--muted-foreground)]">{ADVICE_EXIT}</p>
      </footer>
    </div>
  );
}
