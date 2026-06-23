import { describe, it, expect } from 'vitest';
import { replayEpisode } from './empiricalEngine';
import { EPISODES, BUCKETS, type Episode, type Bucket } from '../data/episodeLibrary';
import type { Mix } from './portfolioMix';

function mixOf(parts: Partial<Record<Bucket, number>>): Mix {
  return Object.fromEntries(BUCKETS.map((b) => [b, parts[b] ?? 0])) as Mix;
}

// A synthetic episode to pin the formula exactly (§8 worked example).
const WORKED: Episode = {
  id: 'WORKED', name: 'Worked', shortLabel: 'W', yearLabel: '', granularity: 'monthly',
  beliefSalience: ['VOLATILITY_AVERSION'], inflationEpisode: false, selectionRationale: '',
  paths: {
    'global-equity': { provider: 'x', seriesId: 'x', basis: 'total-return', currency: 'GBP',
      points: [0, -0.45], troughIndex: 1, recoveryIndex: -1 },
    'govt-bonds': { provider: 'x', seriesId: 'x', basis: 'total-return', currency: 'GBP',
      points: [0, 0.06], troughIndex: 0, recoveryIndex: 0 },
    'cash': { provider: 'x', seriesId: 'x', basis: 'total-return', currency: 'GBP',
      points: [0, 0.0], troughIndex: 0, recoveryIndex: 0 },
    'uk-equity': null, 'us-equity': null, 'europe-equity': null, 'emerging-equity': null, 'property': null,
  },
};

describe('replayEpisode — §8 worked example', () => {
  const mix = mixOf({ 'global-equity': 0.6, 'govt-bonds': 0.3, 'cash': 0.1 });

  it('value-weights bucket paths into a portfolio path', () => {
    const r = replayEpisode(mix, WORKED, 500_000);
    expect(r.points[1]).toBeCloseTo(0.6 * -0.45 + 0.3 * 0.06 + 0.1 * 0, 10); // -0.252
  });

  it('reads drawdown at the trough', () => {
    const r = replayEpisode(mix, WORKED, 500_000);
    expect(r.drawdown).toBeCloseTo(-0.252, 10);
    expect(r.troughIndex).toBe(1);
  });

  it('ranks contributors at the trough in signed £, excluding protective holdings', () => {
    const r = replayEpisode(mix, WORKED, 500_000);
    expect(r.contributors[0].label).toBe('global-equity');
    expect(r.contributors[0].impactGbp).toBeCloseTo(0.6 * -0.45 * 500_000, 6); // -135,000
    expect(r.contributors.find((c) => c.label === 'govt-bonds')).toBeUndefined(); // protective
  });

  it('reports the weight in no-data buckets and excludes them from the sum (never zero-filled)', () => {
    const m = mixOf({ 'global-equity': 0.5, 'emerging-equity': 0.5 }); // emerging null in WORKED
    const r = replayEpisode(m, WORKED, 100);
    expect(r.noDataShare).toBeCloseTo(0.5, 10);
    expect(r.points[1]).toBeCloseTo(0.5 * -0.45, 10); // emerging excluded, NOT zero-added
  });

  it('a mix entirely in no-data buckets reports noDataShare 1 and a degenerate replay', () => {
    const m = mixOf({ 'uk-equity': 0.5, 'us-equity': 0.5 }); // both null in WORKED
    const r = replayEpisode(m, WORKED, 100);
    expect(r.noDataShare).toBeCloseTo(1, 10);
    expect(r.points).toEqual([0]);
    expect(r.drawdown).toBe(0);
    expect(r.troughIndex).toBe(0);
    expect(r.recoverySteps).toBe(0);
    expect(r.contributors).toEqual([]);
  });
});

describe('replayEpisode — real GFC episode (invariant #3: no extrapolation)', () => {
  it('never reports a drawdown deeper than the worst bucket the mix actually holds', () => {
    const gfc = EPISODES.find((e) => e.id === 'GFC_2008')!;
    const mix = mixOf({ 'global-equity': 0.7, 'govt-bonds': 0.3 });
    const r = replayEpisode(mix, gfc, 1_000_000);
    const worstGlobal = Math.min(...gfc.paths['global-equity']!.points);
    expect(r.drawdown).toBeGreaterThanOrEqual(worstGlobal); // weighted ⇒ shallower than worst single bucket
  });

  it('computes recovery in steps from the trough (null if not recovered in window)', () => {
    const gfc = EPISODES.find((e) => e.id === 'GFC_2008')!;
    const r = replayEpisode(mixOf({ 'global-equity': 1 }), gfc, 100);
    expect(r.recoverySteps).not.toBeNull();
    expect(r.recoverySteps).toBeGreaterThan(0);
  });
});
