import PathChart from './PathChart';
import { STAGE_COPY } from '@/data/scenarioPlannerCopy';
import { fmtSignedPct, fmtRecovery } from '@/lib/scenarioPlannerView';
import type { EpisodeReplay } from '@/lib/empiricalEngine';
import type { Episode } from '@/data/episodeLibrary';

export default function StageStressTest({ episode, replay }: { episode: Episode; replay: EpisodeReplay }) {
  const copy = STAGE_COPY[0];
  return (
    <section data-testid="stage-1" className="space-y-3">
      <p className="text-sm text-[var(--muted-foreground)]">{copy.leadIn}</p>
      <PathChart
        blend={{ central: replay.points, band: { min: replay.points, max: replay.points } }}
        readPath={replay.points}
        stepUnit={episode.granularity === 'annual' ? 'year' : 'month'}
        troughIndex={replay.troughIndex}
      />
      <div className="flex gap-6 text-sm">
        <span><strong>{fmtSignedPct(replay.drawdown)}</strong> deepest fall</span>
        <span><strong>{fmtRecovery(replay.recoverySteps, episode.granularity, episode.inflationEpisode)}</strong> to recover</span>
      </div>
      <p className="text-xs text-[var(--muted-foreground)]">{copy.complianceCaption}</p>
      <p className="text-sm">{copy.worthSittingWith}</p>
    </section>
  );
}
