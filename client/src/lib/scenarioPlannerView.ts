import type { Granularity } from '../data/episodeLibrary';

/** Signed whole-% with the U+2212 minus, matching scenarioStressView conventions. */
export function fmtSignedPct(n: number): string {
  const v = Math.round(n * 100);
  const sign = v > 0 ? '+' : v < 0 ? '−' : '';
  return `${sign}${Math.abs(v)}%`;
}

/** Recovery, in the episode's native unit; real-terms tagged for inflation episodes (§5 / P2-3). */
export function fmtRecovery(steps: number | null, granularity: Granularity, inflationEpisode: boolean): string {
  if (steps === null) return 'not recovered within the recorded window';
  const unit = granularity === 'annual' ? 'year' : 'month';
  const plural = steps === 1 ? unit : `${unit}s`;
  return `${steps} ${plural}${inflationEpisode ? ' (real terms)' : ''}`;
}

/** Up-front scope contract: what share of the portfolio this models (§5 / P2-4/6). Descriptive, no verbs. */
export function scopeContractLine(unmodelledShare: number): string {
  const modelled = Math.round((1 - unmodelledShare) * 100);
  if (modelled >= 100) return 'This view maps all of your holdings to a historical bucket.';
  return `This view maps about ${modelled}% of your portfolio to a historical bucket; ` +
    `the remainder sits in holdings with no comparable historical series and is shown separately.`;
}
