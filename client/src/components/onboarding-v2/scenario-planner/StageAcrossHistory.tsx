import { STAGE_COPY, NARRATIVE_FALLACY_NOTE } from '@/data/scenarioPlannerCopy';
import { fmtSignedPct, fmtRecovery } from '@/lib/scenarioPlannerView';
import type { EpisodeReplay } from '@/lib/empiricalEngine';
import type { Episode } from '@/data/episodeLibrary';

export default function StageAcrossHistory(
  { rows }: { rows: { episode: Episode; replay: EpisodeReplay }[] },
) {
  const copy = STAGE_COPY[1];
  return (
    <section data-testid="stage-2" className="space-y-3">
      <p className="text-sm text-[var(--muted-foreground)]">{copy.leadIn}</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[var(--muted-foreground)]">
            <th className="py-1">Episode</th><th>Deepest fall</th><th>Recovery</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ episode, replay }) => (
            <tr key={episode.id} data-testid={`history-row-${episode.id}`} className="border-t border-[var(--border)]">
              <td className="py-1">{episode.name} <span className="text-[var(--muted-foreground)]">({episode.yearLabel})</span></td>
              <td>{fmtSignedPct(replay.drawdown)}</td>
              <td>{fmtRecovery(replay.recoverySteps, episode.granularity, episode.inflationEpisode)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-[var(--muted-foreground)]">{NARRATIVE_FALLACY_NOTE}</p>
      <p className="text-xs text-[var(--muted-foreground)]">{copy.complianceCaption}</p>
    </section>
  );
}
