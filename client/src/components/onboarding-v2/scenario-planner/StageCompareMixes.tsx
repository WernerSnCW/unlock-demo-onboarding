import { useMemo } from 'react';
import { useOnboardingV2Store } from '@/state/onboardingV2Store';
import { mixFromBands, type Mix } from '@/lib/portfolioMix';
import { replayEpisode } from '@/lib/empiricalEngine';
import { fmtSignedPct } from '@/lib/scenarioPlannerView';
import { STAGE_COPY } from '@/data/scenarioPlannerCopy';
import type { Episode } from '@/data/episodeLibrary';

const START_VALUE = 500_000;

export default function StageCompareMixes(
  { currentMix, episodes }: { currentMix: Mix; episodes: Episode[] },
) {
  const copy = STAGE_COPY[3];
  const { scenario } = useOnboardingV2Store();
  const active = scenario.scenarios.find((s) => s.scenario_type === scenario.active_scenario)
    ?? scenario.scenarios[0];

  // An alternative composition only exists once an illustrative allocation has
  // been computed (step 7). Until then scenario.scenarios is empty → no comparison.
  const hasComparison = !!active && active.asset_class_bands.length > 0;

  const comparisonMix = useMemo(
    () => (active ? mixFromBands(active.asset_class_bands, active.region_bands) : currentMix),
    [active, currentMix],
  );

  const rows = useMemo(
    () =>
      episodes.map((ep) => {
        const cur = replayEpisode(currentMix, ep, START_VALUE).drawdown;
        const cmp = replayEpisode(comparisonMix, ep, START_VALUE).drawdown;
        return { ep, cur, cmp };
      }),
    [episodes, currentMix, comparisonMix],
  );

  return (
    <section data-testid="stage-4" className="space-y-3">
      <p className="text-sm text-[var(--muted-foreground)]">{copy.leadIn}</p>

      {hasComparison ? (
        /* symmetric per-episode distribution — both directions shown, no valence colour */
        <table className="w-full text-sm" data-testid="delta-distribution">
          <thead><tr className="text-left text-[var(--muted-foreground)]">
            <th className="py-1">Episode</th><th>Your holdings</th><th>Alternative</th><th>Difference</th>
          </tr></thead>
          <tbody>
            {rows.map(({ ep, cur, cmp }) => (
              <tr key={ep.id} className="border-t border-[var(--border)]">
                <td className="py-1">{ep.shortLabel}</td>
                <td>{fmtSignedPct(cur)}</td>
                <td>{fmtSignedPct(cmp)}</td>
                <td className="text-[var(--muted-foreground)]">{fmtSignedPct(cmp - cur)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p data-testid="compare-empty" className="text-sm text-[var(--muted-foreground)]">
          Set an illustrative allocation in the earlier step to compare a different composition against your holdings here.
        </p>
      )}
      <p className="text-xs text-[var(--muted-foreground)]">{copy.complianceCaption}</p>
      <p className="text-sm">{copy.worthSittingWith}</p>
    </section>
  );
}
