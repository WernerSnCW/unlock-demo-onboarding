import { describe, it, expect } from 'vitest';
import { BUCKETS, type Bucket } from '../../data/episodeLibrary';
import type { Mix } from '../portfolioMix';
import { computeMixDiff } from './computeBeforeAfter';

export function mkMix(partial: Partial<Record<Bucket, number>>): Mix {
  return { ...(Object.fromEntries(BUCKETS.map((b) => [b, 0])) as Mix), ...partial };
}

describe('computeMixDiff', () => {
  it('returns signed per-bucket rows over modelled buckets, dropping all-zero buckets', () => {
    const current = mkMix({ 'uk-equity': 0.5, cash: 0.5 });
    const target = mkMix({ 'uk-equity': 0.2, 'govt-bonds': 0.5, cash: 0.3 });
    const rows = computeMixDiff(current, target);
    expect(rows).toEqual([
      { bucket: 'uk-equity', beforePct: 50, afterPct: 20, deltaPp: -30 },
      { bucket: 'govt-bonds', beforePct: 0, afterPct: 50, deltaPp: 50 },
      { bucket: 'cash', beforePct: 50, afterPct: 30, deltaPp: -20 },
    ]);
  });

  it('deltas sum to ~0 (both sides are normalised distributions)', () => {
    const current = mkMix({ 'us-equity': 0.7, property: 0.2, cash: 0.1 });
    const target = mkMix({ 'us-equity': 0.3, 'govt-bonds': 0.4, property: 0.1, cash: 0.2 });
    const sum = computeMixDiff(current, target).reduce((s, r) => s + r.deltaPp, 0);
    expect(Math.abs(sum)).toBeLessThanOrEqual(0.2); // rounding tolerance only
  });

  it('renormalises a current mix that carries unmodelled-bucket mass', () => {
    // 50% europe-equity is UNMODELLED: modelled mass renormalises so uk-equity 50% -> 100%
    const current = mkMix({ 'uk-equity': 0.5, 'europe-equity': 0.5 });
    const target = mkMix({ 'uk-equity': 0.6, cash: 0.4 });
    const rows = computeMixDiff(current, target);
    const uk = rows.find((r) => r.bucket === 'uk-equity');
    expect(uk).toEqual({ bucket: 'uk-equity', beforePct: 100, afterPct: 60, deltaPp: -40 });
    expect(rows.find((r) => r.bucket === 'europe-equity')).toBeUndefined();
  });
});
