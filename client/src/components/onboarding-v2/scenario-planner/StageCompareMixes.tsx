import { useMemo, useState } from 'react';
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
  const [which, setWhich] = useState<'current' | 'comparison'>('current');

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

      <div role="radiogroup" className="flex gap-2 text-xs">
        {(['current', 'comparison'] as const).map((k) => (
          <button key={k} type="button" role="radio" aria-checked={which === k}
            onClick={() => setWhich(k)}
            className={`px-2 py-1 rounded-full border ${which === k ? 'bg-[var(--foreground)] text-[var(--background)]' : ''}`}>
            {k === 'current' ? 'Your holdings' : 'Alternative composition (more bonds, less equity)'}
          </button>
        ))}
      </div>

      {/* symmetric per-episode distribution — both directions shown, no valence colour */}
      <table className="w-full text-sm" data-testid="delta-distribution">
        <thead><tr className="text-left text-[var(--muted-foreground)]">
          <th className="py-1">Episode</th><th>Your holdings</th><th>Alternative</th><th>Difference</th>
        </tr></thead>
        <tbody>
          {rows.map(({ ep, cur, cmp }) => (
            <tr key={ep.id} className="border-t border-slate-200">
              <td className="py-1">{ep.shortLabel}</td>
              <td>{fmtSignedPct(cur)}</td>
              <td>{fmtSignedPct(cmp)}</td>
              <td className="text-[var(--muted-foreground)]">{fmtSignedPct(cmp - cur)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-[var(--muted-foreground)]">{copy.complianceCaption}</p>
      <p className="text-sm">{copy.worthSittingWith}</p>
    </section>
  );
}
