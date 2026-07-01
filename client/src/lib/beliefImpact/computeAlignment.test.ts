import { describe, it, expect } from 'vitest';
import { BUCKETS, type Bucket } from '../../data/episodeLibrary';
import type { Mix } from '../portfolioMix';
import { computeAlignment, blendBeliefAllocation } from './computeAlignment';
import { BELIEF_SCENARIO_ALLOCATION_PRIORS } from '../../data/beliefImpactTaxonomy';

function emptyMix(): Mix {
  return Object.fromEntries(BUCKETS.map((b) => [b, 0])) as Mix;
}

describe('blendBeliefAllocation', () => {
  it('returns the scenario prior unchanged when one scenario has full weight', () => {
    const blend = blendBeliefAllocation({ Stagflation: 1 });
    for (const [bucket, weight] of Object.entries(BELIEF_SCENARIO_ALLOCATION_PRIORS['Stagflation'])) {
      expect(blend[bucket as Bucket]).toBeCloseTo(weight as number, 6);
    }
  });

  it('returns an all-zero vector for empty weights', () => {
    const blend = blendBeliefAllocation({});
    expect(BUCKETS.every((b) => blend[b] === 0)).toBe(true);
  });
});

describe('computeAlignment', () => {
  it('scores 100 (BROADLY_ALIGNED) when the mix exactly matches the belief-weighted ideal', () => {
    const mix = blendBeliefAllocation({ Stagflation: 1 });
    const result = computeAlignment(mix, { Stagflation: 1 }, 'Balanced');
    expect(result.score).toBe(100);
    expect(result.band).toBe('BROADLY_ALIGNED');
  });

  it('flags concentration when one bucket exceeds 35%', () => {
    const mix = { ...emptyMix(), 'us-equity': 0.40, 'cash': 0.60 };
    const result = computeAlignment(mix, { Stagflation: 1 }, 'Balanced');
    expect(result.concentrationFlag).toContain('us-equity');
  });

  it('raises the mismatch flag only when both cautious self-report AND concentration are present', () => {
    const concentrated = { ...emptyMix(), 'us-equity': 0.40, 'cash': 0.60 };
    const diversified = { ...emptyMix(), 'us-equity': 0.20, 'cash': 0.20, 'uk-equity': 0.20, 'govt-bonds': 0.20, 'global-equity': 0.20 };

    expect(computeAlignment(concentrated, { Stagflation: 1 }, 'Conservative').mismatchFlag).not.toBeNull();
    expect(computeAlignment(concentrated, { Stagflation: 1 }, 'Adventurous').mismatchFlag).toBeNull();
    expect(computeAlignment(diversified, { Stagflation: 1 }, 'Conservative').mismatchFlag).toBeNull();
  });
});
