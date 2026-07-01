import { describe, it, expect } from 'vitest';
import { BUCKETS, type Bucket } from '../../data/episodeLibrary';
import type { Mix } from '../portfolioMix';
import { computeTieredImpact } from './computeTieredImpact';

function emptyMix(): Mix {
  return Object.fromEntries(BUCKETS.map((b) => [b, 0])) as Mix;
}

describe('computeTieredImpact', () => {
  it('includes a cited episode source for a tier-1 bucket under a mapped scenario', () => {
    const mix = { ...emptyMix(), 'uk-equity': 1 };
    const result = computeTieredImpact(mix, [], { Stagflation: 1 }, 500_000);
    const row = result.rows.find((r) => r.bucket === 'uk-equity')!;
    expect(row.tier).toBe('EPISODE_REPLAY');
    expect(row.citedSources.some((s) => s.id === 'STAGFLATION_1973')).toBe(true);
  });

  it('includes an illustrative stress-scenario source for a tier-2 bucket', () => {
    const mix = { ...emptyMix(), 'property': 1 };
    const result = computeTieredImpact(mix, [], { 'Property Crash': 1 }, 500_000);
    const row = result.rows.find((r) => r.bucket === 'property')!;
    expect(row.tier).toBe('MODERN_ANCHOR');
    expect(row.citedSources.some((s) => s.id === 'PROPERTY_DOWNTURN')).toBe(true);
  });

  it('skips episode/stress sourcing entirely for the upside scenario', () => {
    const mix = { ...emptyMix(), 'uk-equity': 1 };
    const result = computeTieredImpact(mix, [], { 'Rate-Cut Reflation': 1 }, 500_000);
    const row = result.rows.find((r) => r.bucket === 'uk-equity')!;
    expect(row.citedSources).toHaveLength(0);
  });

  it('never produces a row for an UNMODELLED-tier bucket, and renormalises weightPct over modelled buckets only', () => {
    const mix = { ...emptyMix(), 'emerging-equity': 0.5, 'uk-equity': 0.5 };
    const result = computeTieredImpact(mix, [], { Stagflation: 1 }, 500_000);
    expect(result.rows.find((r) => r.bucket === 'emerging-equity')).toBeUndefined();
    const ukRow = result.rows.find((r) => r.bucket === 'uk-equity')!;
    expect(ukRow.weightPct).toBe(100);
  });

  it('reports true-unmodelled holdings (bucketFor -> null) grouped by asset class', () => {
    const holdings = [
      { asset_class: 'alternatives', region: 'global', value_gbp: 20_000 },
      { asset_class: 'alternatives', region: 'uk', value_gbp: 10_000 },
      { asset_class: 'equity', region: 'uk', value_gbp: 70_000 },
    ];
    const mix = { ...emptyMix(), 'uk-equity': 1 };
    const result = computeTieredImpact(mix, holdings, { Stagflation: 1 }, 100_000);
    expect(result.unmodelledSharePct).toBeCloseTo(30, 1);
    expect(result.unmodelledBreakdown).toEqual([{ name: 'alternatives', valueGbp: 30_000 }]);
  });

  it('also routes UNMODELLED-tier bucket holdings (europe/emerging equity) into the same unmodelled breakdown', () => {
    const holdings = [
      { asset_class: 'equity', region: 'emerging', value_gbp: 25_000 },
      { asset_class: 'equity', region: 'uk', value_gbp: 75_000 },
    ];
    const mix = { ...emptyMix(), 'emerging-equity': 0.25, 'uk-equity': 0.75 };
    const result = computeTieredImpact(mix, holdings, { Stagflation: 1 }, 100_000);
    expect(result.unmodelledSharePct).toBeCloseTo(25, 1);
    expect(result.unmodelledBreakdown).toEqual([{ name: 'emerging-equity', valueGbp: 25_000 }]);
  });
});
