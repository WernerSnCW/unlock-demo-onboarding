import { BUCKETS, type Bucket, type Episode, type Granularity } from '../data/episodeLibrary';
import { rankContributors, type StressContributor } from './portfolioMath';
import type { Mix } from './portfolioMix';

export interface EpisodeReplay {
  episodeId: string;
  granularity: Granularity;
  /** portfolio cumulative return per step, value-weighted over buckets WITH data this episode */
  points: number[];
  drawdown: number;
  troughIndex: number;
  /** steps from trough until portfolio cum. return >= 0 again; null if not recovered in the window */
  recoverySteps: number | null;
  contributors: StressContributor[];
  /** weight of the mix sitting in buckets with no series this episode (excluded from the sum) */
  noDataShare: number;
}

export function replayEpisode(mix: Mix, episode: Episode, startValue: number): EpisodeReplay {
  // Buckets that have BOTH weight and a series this episode contribute.
  const active: { bucket: Bucket; weight: number; points: number[] }[] = [];
  let noDataShare = 0;
  for (const bucket of BUCKETS) {
    const w = mix[bucket];
    if (w <= 0) continue;
    const path = episode.paths[bucket];
    if (path === null) { noDataShare += w; continue; } // never zero-filled
    active.push({ bucket, weight: w, points: path.points });
  }

  const length = active.reduce((max, a) => Math.max(max, a.points.length), 0);
  const points: number[] = [];
  for (let t = 0; t < length; t++) {
    let r = 0;
    // A bucket whose series ends early holds flat at its final return (carry last value) — never re-zeroed.
    for (const a of active) r += a.weight * (a.points[t] ?? a.points[a.points.length - 1]);
    points.push(r);
  }
  if (points.length === 0) points.push(0);

  const drawdown = Math.min(...points);
  const troughIndex = points.indexOf(drawdown);

  let recoverySteps: number | null = null;
  for (let t = troughIndex; t < points.length; t++) {
    if (points[t] >= 0) { recoverySteps = t - troughIndex; break; }
  }

  const contributors = rankContributors(
    active.map((a) => ({
      label: a.bucket,
      impactGbp: a.weight * (a.points[troughIndex] ?? a.points[a.points.length - 1]) * startValue,
    })),
    3,
  );

  return {
    episodeId: episode.id,
    granularity: episode.granularity,
    points,
    drawdown,
    troughIndex,
    recoverySteps,
    contributors,
    noDataShare,
  };
}
