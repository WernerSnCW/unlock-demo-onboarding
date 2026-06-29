import type { EpisodeReplay } from './empiricalEngine';

export interface BlendBand { min: number[]; max: number[]; }
export interface Blend { central: number[]; band: BlendBand; }

/** Weighted-average central path + per-step observed min/max band across the selected replays.
 *  Replays should share granularity/length (enforced upstream by only offering matching episodes).
 *  Caller must pass weights.length === replays.length (paired by index); mismatched lengths give NaN/under-weighted results. */
export function blendEpisodes(replays: EpisodeReplay[], weights: number[]): Blend {
  if (replays.length === 0) return { central: [0], band: { min: [0], max: [0] } };
  const wsum = weights.reduce((s, w) => s + w, 0) || 1;
  const w = weights.map((x) => x / wsum);
  const length = replays.reduce((m, r) => Math.max(m, r.points.length), 0);

  const central: number[] = [];
  const min: number[] = [];
  const max: number[] = [];
  for (let t = 0; t < length; t++) {
    const vals = replays.map((r) => r.points[t] ?? r.points[r.points.length - 1]);
    central.push(vals.reduce((s, v, i) => s + w[i] * v, 0));
    min.push(Math.min(...vals));
    max.push(Math.max(...vals));
  }
  return { central, band: { min, max } };
}

/** readValue(t) = central(t) + r·(worstEdge(t) − central(t)), worstEdge = band.min, r clamped to [0,1].
 *  r=0 → typical (central), r=1 → worst markets reached. Never beyond the observed worst edge.
 *  (Cumulative returns are negative on the downside, so band.min is the worst observed outcome.) */
export function readAt(blend: Blend, r: number): number[] {
  const rr = Math.max(0, Math.min(1, r));
  return blend.central.map((c, t) => c + rr * (blend.band.min[t] - c));
}
