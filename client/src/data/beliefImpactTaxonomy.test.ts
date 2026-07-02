import { describe, it, expect } from 'vitest';
import { BUCKETS } from './episodeLibrary';
import {
  BUCKET_TIER, BELIEF_SCENARIO_NAMES, BELIEF_SCENARIO_MAPPING, BELIEF_SCENARIO_ALLOCATION_PRIORS,
} from './beliefImpactTaxonomy';

describe('beliefImpactTaxonomy', () => {
  it('classifies every episodeLibrary bucket into a tier', () => {
    for (const b of BUCKETS) expect(BUCKET_TIER[b]).toBeDefined();
  });

  it('keeps europe/emerging equity UNMODELLED until sourced (spec §1 footnote)', () => {
    expect(BUCKET_TIER['europe-equity']).toBe('UNMODELLED');
    expect(BUCKET_TIER['emerging-equity']).toBe('UNMODELLED');
  });

  it('classifies uk-equity, us-equity, govt-bonds, cash as EPISODE_REPLAY (tier 1)', () => {
    expect(BUCKET_TIER['uk-equity']).toBe('EPISODE_REPLAY');
    expect(BUCKET_TIER['us-equity']).toBe('EPISODE_REPLAY');
    expect(BUCKET_TIER['govt-bonds']).toBe('EPISODE_REPLAY');
    expect(BUCKET_TIER['cash']).toBe('EPISODE_REPLAY');
  });

  it('has a mapping entry for every named belief scenario', () => {
    for (const name of BELIEF_SCENARIO_NAMES) expect(BELIEF_SCENARIO_MAPPING[name]).toBeDefined();
  });

  it('marks Rate-Cut Reflation as the sole upside scenario with no drawdown episodes', () => {
    expect(BELIEF_SCENARIO_MAPPING['Rate-Cut Reflation'].isUpside).toBe(true);
    expect(BELIEF_SCENARIO_MAPPING['Rate-Cut Reflation'].episodeIds).toHaveLength(0);
  });

  it('every allocation-prior row sums to 1 and excludes UNMODELLED buckets', () => {
    for (const name of BELIEF_SCENARIO_NAMES) {
      const prior = BELIEF_SCENARIO_ALLOCATION_PRIORS[name];
      const sum = Object.values(prior).reduce((s, v) => s + (v as number), 0);
      expect(sum).toBeCloseTo(1, 6);
      expect(prior['europe-equity']).toBeUndefined();
      expect(prior['emerging-equity']).toBeUndefined();
    }
  });
});
