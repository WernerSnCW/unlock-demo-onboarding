import { describe, it, expect } from 'vitest';
import { EPISODES, BUCKETS, bucketFor, type Episode } from './episodeLibrary';

describe('bucketFor', () => {
  it('maps (asset_class, region) to a bucket, case-insensitive', () => {
    expect(bucketFor('equity', 'uk')).toBe('uk-equity');
    expect(bucketFor('Equity', 'US')).toBe('us-equity');
    expect(bucketFor('bond', 'global')).toBe('govt-bonds');
    expect(bucketFor('property', 'uk')).toBe('property');
    expect(bucketFor('cash', 'uk')).toBe('cash');
  });
  it('returns null for an unmappable pair (taxonomy gap → unmodelled share)', () => {
    expect(bucketFor('private_equity', 'global')).toBeNull();
  });
});

describe('episode library provenance contract', () => {
  it('every path point array starts at 0 and every bucket path is cited', () => {
    for (const ep of EPISODES) {
      for (const bucket of BUCKETS) {
        const path = ep.paths[bucket];
        if (path === null) continue; // "no comparable series"
        expect(path.points[0]).toBe(0);
        expect(path.provider.length).toBeGreaterThan(0);
        expect(path.seriesId.length).toBeGreaterThan(0);
        expect(path.basis).toBe('total-return');
      }
    }
  });

  it('GFC us-equity trough matches the published S&P TR figure (~ -0.55) [golden]', () => {
    const gfc = EPISODES.find((e) => e.id === 'GFC_2008') as Episode;
    const us = gfc.paths['us-equity']!;
    expect(Math.min(...us.points)).toBeCloseTo(-0.55, 2);
    expect(us.troughIndex).toBe(us.points.indexOf(Math.min(...us.points)));
  });

  it('1929 is annual, the keystone, and excludes buckets with no comparable series', () => {
    const gd = EPISODES.find((e) => e.id === 'GREAT_DEPRESSION_1929') as Episode;
    expect(gd.granularity).toBe('annual');
    expect(gd.paths['emerging-equity']).toBeNull();
    expect(gd.paths['global-equity']).toBeNull();
    expect(gd.inflationEpisode).toBe(false);
  });

  it('1973 and 2022 are flagged inflation episodes (real-terms recovery)', () => {
    expect(EPISODES.find((e) => e.id === 'STAGFLATION_1973')!.inflationEpisode).toBe(true);
    expect(EPISODES.find((e) => e.id === 'RATE_SHOCK_2022')!.inflationEpisode).toBe(true);
  });

  it('every episode has at least one belief-salience hook (no orphan episodes — §7A)', () => {
    for (const ep of EPISODES) {
      expect(ep.beliefSalience.length).toBeGreaterThan(0);
    }
  });
});
