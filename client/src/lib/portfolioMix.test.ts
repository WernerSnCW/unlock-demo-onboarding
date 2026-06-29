import { describe, it, expect } from 'vitest';
import { mixFromHoldings, mixFromBands, type MixHolding } from './portfolioMix';
import { BUCKETS } from '../data/episodeLibrary';
import type { AllocationBand } from '../state/onboardingV2Store';

function sum(mix: Record<string, number>): number {
  return Object.values(mix).reduce((s, v) => s + v, 0);
}

describe('mixFromHoldings', () => {
  it('value-weights mappable holdings to buckets, summing to 1', () => {
    const holdings: MixHolding[] = [
      { asset_class: 'equity', region: 'uk', value_gbp: 210 },
      { asset_class: 'equity', region: 'global', value_gbp: 300 },
      { asset_class: 'bond', region: 'global', value_gbp: 150 },
      { asset_class: 'cash', region: 'uk', value_gbp: 50 },
    ];
    const { mix, unmodelledShare } = mixFromHoldings(holdings);
    expect(sum(mix)).toBeCloseTo(1, 10);
    expect(mix['uk-equity']).toBeCloseTo(210 / 710, 10);
    expect(unmodelledShare).toBe(0);
  });

  it('reports unmodelled share for unmappable holdings and excludes them from the mix', () => {
    const holdings: MixHolding[] = [
      { asset_class: 'equity', region: 'global', value_gbp: 800 },
      { asset_class: 'private_equity', region: 'global', value_gbp: 200 }, // unmappable
    ];
    const { mix, unmodelledShare } = mixFromHoldings(holdings);
    expect(unmodelledShare).toBeCloseTo(0.2, 10);
    expect(sum(mix)).toBeCloseTo(1, 10); // mix normalised over modelled buckets only
    expect(mix['global-equity']).toBeCloseTo(1, 10);
  });

  it('returns an all-zero mix and zero unmodelled for empty/zero holdings', () => {
    const { mix, unmodelledShare } = mixFromHoldings([]);
    expect(sum(mix)).toBe(0);
    expect(unmodelledShare).toBe(0);
  });

  it('all-unmappable holdings → all-zero mix and unmodelledShare of 1', () => {
    const { mix, unmodelledShare } = mixFromHoldings([
      { asset_class: 'private_equity', region: 'global', value_gbp: 500 },
    ]);
    expect(sum(mix)).toBe(0);
    expect(unmodelledShare).toBeCloseTo(1, 10);
  });
});

describe('mixFromBands (§7 comparison vector — derive from step-7 bands)', () => {
  function band(sleeve: string, low: number, high: number): AllocationBand {
    return {
      sleeve, current_pct: (low + high) / 2, illustrative_low_pct: low, illustrative_high_pct: high,
      direction: 'NEUTRAL' as const, midpoint_pct: (low + high) / 2, pressure: 0, clamped: false,
      debug: {} as never,
    };
  }
  it('takes band midpoints and normalises to a bucket vector summing to 1', () => {
    const assetBands = [band('Equity', 50, 70), band('Bond', 20, 30), band('Cash', 5, 15)];
    const regionBands = [band('UK', 30, 50), band('Global', 40, 60)];
    const mix = mixFromBands(assetBands, regionBands);
    expect(sum(mix)).toBeCloseTo(1, 10);
    // equity midpoint 60 split across region midpoints (UK 40, Global 50 → 4/9, 5/9)
    expect(mix['uk-equity']).toBeGreaterThan(0);
    expect(mix['global-equity']).toBeGreaterThan(0);
    expect(mix['govt-bonds']).toBeGreaterThan(0);
    expect(mix['cash']).toBeGreaterThan(0);
  });

  it('splits equity across regions pro-rata and normalises the whole vector', () => {
    const assetBands = [band('Equity', 50, 70), band('Bond', 20, 30), band('Cash', 5, 15)];
    const regionBands = [band('UK', 30, 50), band('Global', 40, 60)];
    const mix = mixFromBands(assetBands, regionBands);
    const preTotal = 60 + 25 + 10; // equity 60 + bond 25 + cash 10 = 95
    expect(mix['uk-equity']).toBeCloseTo((60 * (40 / 90)) / preTotal, 10);
    expect(mix['global-equity']).toBeCloseTo((60 * (50 / 90)) / preTotal, 10);
    expect(mix['govt-bonds']).toBeCloseTo(25 / preTotal, 10);
    expect(mix['cash']).toBeCloseTo(10 / preTotal, 10);
    expect(mix['property']).toBe(0);
  });
});
