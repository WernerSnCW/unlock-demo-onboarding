import { describe, it, expect } from 'vitest';
import { blendEpisodes, readAt, type Blend } from './episodeBlend';
import type { EpisodeReplay } from './empiricalEngine';

function replay(id: string, points: number[]): EpisodeReplay {
  return {
    episodeId: id, granularity: 'monthly', points,
    drawdown: Math.min(...points), troughIndex: points.indexOf(Math.min(...points)),
    recoverySteps: null, contributors: [], noDataShare: 0,
  };
}

describe('blendEpisodes', () => {
  it('central path is the weight-average of replay paths', () => {
    const b = blendEpisodes([replay('A', [0, -0.30]), replay('B', [0, -0.10])], [0.5, 0.5]);
    expect(b.central[1]).toBeCloseTo(-0.20, 10);
  });

  it('band is the per-step observed min/max — not a multiplier', () => {
    const b = blendEpisodes([replay('A', [0, -0.30]), replay('B', [0, -0.10])], [0.5, 0.5]);
    expect(b.band.min[1]).toBeCloseTo(-0.30, 10);
    expect(b.band.max[1]).toBeCloseTo(-0.10, 10);
  });

  it('normalises weights that do not sum to 1', () => {
    const b = blendEpisodes([replay('A', [0, -0.40]), replay('B', [0, 0])], [3, 1]);
    expect(b.central[1]).toBeCloseTo(0.75 * -0.40, 10);
  });

  it('single episode collapses the band to the central line', () => {
    const b = blendEpisodes([replay('A', [0, -0.25])], [1]);
    expect(b.band.min[1]).toBeCloseTo(b.central[1], 10);
    expect(b.band.max[1]).toBeCloseTo(b.central[1], 10);
  });

  it('returns a well-formed single-step blend for empty input', () => {
    const b = blendEpisodes([], []);
    expect(b.central).toEqual([0]);
    expect(b.band.min).toEqual([0]);
    expect(b.band.max).toEqual([0]);
  });

  it('carries the last value for a shorter path (ragged tails held flat, not re-zeroed)', () => {
    const b = blendEpisodes([replay('A', [0, -0.1, -0.2]), replay('B', [0, -0.3])], [0.5, 0.5]);
    // at t=2 B has no point → carries its last value -0.3
    expect(b.central[2]).toBeCloseTo(0.5 * -0.2 + 0.5 * -0.3, 10);
    expect(b.band.min[2]).toBeCloseTo(-0.3, 10);
    expect(b.band.max[2]).toBeCloseTo(-0.2, 10);
  });
});

describe('readAt — read-position within the observed band (§5)', () => {
  const blend: Blend = {
    central: [0, -0.226], band: { min: [0, -0.252], max: [0, -0.20] },
  };
  it('r=0 returns the central path (default typical)', () => {
    expect(readAt(blend, 0)[1]).toBeCloseTo(-0.226, 10);
  });
  it('r=1 returns the worst observed edge — never beyond it (invariant #3)', () => {
    expect(readAt(blend, 1)[1]).toBeCloseTo(-0.252, 10);
  });
  it('clamps r to [0,1] so it can never extrapolate past observed history', () => {
    expect(readAt(blend, 5)[1]).toBeCloseTo(-0.252, 10);
    expect(readAt(blend, -5)[1]).toBeCloseTo(-0.226, 10);
  });
});

describe('invariant guard: no {0.7,1.4} multiplier anywhere in the engine', () => {
  it('the band is min/max of observed paths, so it equals the worst input exactly', () => {
    const b = blendEpisodes([replay('A', [0, -0.30]), replay('B', [0, -0.50])], [0.5, 0.5]);
    expect(b.band.min[1]).toBeCloseTo(-0.50, 10); // = worst observed, NOT central×1.4
    expect(b.band.min[1]).not.toBeCloseTo(b.central[1] * 1.4, 5);
  });
});
