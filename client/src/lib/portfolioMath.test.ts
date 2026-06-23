import { describe, it, expect } from 'vitest';
import { rankContributors, valueWeights, type StressContributor } from './portfolioMath';

describe('valueWeights', () => {
  it('weights items by value share, summing to 1', () => {
    const out = valueWeights(
      [{ v: 210 }, { v: 632 }],
      (x) => x.v,
    );
    expect(out.map((o) => o.weight)).toEqual([210 / 842, 632 / 842]);
    expect(out.reduce((s, o) => s + o.weight, 0)).toBeCloseTo(1, 10);
  });

  it('returns zero weights when total is zero', () => {
    const out = valueWeights([{ v: 0 }, { v: 0 }], (x) => x.v);
    expect(out.every((o) => o.weight === 0)).toBe(true);
  });
});

describe('rankContributors', () => {
  it('ranks same-direction movers by absolute impact, signed share of gross move', () => {
    const out = rankContributors(
      [
        { label: 'A', impactGbp: -135000 },
        { label: 'B', impactGbp: +9000 }, // protective — opposite sign, excluded
        { label: 'C', impactGbp: -45000 },
        { label: 'D', impactGbp: -10000 },
      ],
      3,
    );
    expect(out.map((c) => c.label)).toEqual(['A', 'C', 'D']);
    expect(out[0].pctOfLoss).toBeCloseTo(135000 / 190000, 10); // gross = 135k+45k+10k
  });

  it('excludes protective (opposite-sign) holdings from the "what hurt" list', () => {
    const out = rankContributors(
      [{ label: 'Bonds', impactGbp: +9000 }, { label: 'Equity', impactGbp: -135000 }],
      3,
    );
    expect(out.map((c) => c.label)).toEqual(['Equity']);
  });

  it('returns empty list when net move is zero', () => {
    expect(rankContributors([{ label: 'X', impactGbp: 0 }], 3)).toEqual([]);
  });
});
