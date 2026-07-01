import { describe, it, expect } from 'vitest';
import { buildActions } from '../server/lib/actions/engine';
import { CANONICAL_BUCKETS } from '../server/config/buckets';

describe('buildActions (regression fixture, pre- and post-refactor)', () => {
  it('produces a self-funded stage 1 that exactly lands on target when unconstrained', () => {
    const currentMix: Record<string, number> = Object.fromEntries(CANONICAL_BUCKETS.map((b) => [b, 0]));
    currentMix.CASH = 0.05;
    currentMix.GLOBAL_EQUITY = 0.95;
    const targetMix: Record<string, number> = Object.fromEntries(CANONICAL_BUCKETS.map((b) => [b, 0]));
    targetMix.CASH = 0.15;
    targetMix.GLOBAL_EQUITY = 0.65;
    targetMix.GILTS_LONG = 0.20;

    const result = buildActions({ currentMix, targetMix, portfolioValueGBP: 1_000_000 });

    const allActions = [...result.staged.stage1, ...result.staged.stage2];
    for (const bucket of ['CASH', 'GLOBAL_EQUITY', 'GILTS_LONG']) {
      const net = allActions.filter((a) => a.bucket === bucket).reduce((s, a) => s + a.deltaPct, 0);
      const need = (targetMix[bucket] ?? 0) - (currentMix[bucket] ?? 0);
      expect(net).toBeCloseTo(need, 3);
    }
    expect(result.summary.liquidityNowPct).toBe(5);
    expect(result.summary.liquidityFixPp).toBe(5);
  });
});
