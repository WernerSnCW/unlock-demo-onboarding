import type { Bucket } from '../../data/episodeLibrary';
import type { Mix } from '../portfolioMix';
import { renormaliseOverModelledBuckets, MODELLED_BUCKETS } from './computeAlignment';

export interface MixDiffRow {
  bucket: Bucket;
  beforePct: number; // 0-100, 1dp, renormalised over modelled buckets
  afterPct: number;
  deltaPp: number;   // signed, 1dp
}

/** Per-bucket now -> after rows. "After" is the full target mix — stage-1 + stage-2 deltas sum
 *  exactly to target − current (stagedRebalance.ts assertion), so applying all staged moves lands
 *  on targetMix. Rows where both sides are 0 are dropped.
 *  targetMix is assumed to already sum to 1 over modelled buckets (e.g. the output of
 *  blendBeliefAllocation), which is why only currentMix is renormalised. */
export function computeMixDiff(currentMix: Mix, targetMix: Mix): MixDiffRow[] {
  const before = renormaliseOverModelledBuckets(currentMix);
  const rows: MixDiffRow[] = [];
  for (const b of MODELLED_BUCKETS) {
    const beforePct = Math.round(before[b] * 1000) / 10;
    const afterPct = Math.round(targetMix[b] * 1000) / 10;
    if (beforePct <= 0 && afterPct <= 0) continue;
    rows.push({ bucket: b, beforePct, afterPct, deltaPp: Math.round((targetMix[b] - before[b]) * 1000) / 10 });
  }
  return rows;
}
