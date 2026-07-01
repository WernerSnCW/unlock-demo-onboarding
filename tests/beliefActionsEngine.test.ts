import { describe, it, expect } from 'vitest';
import { buildBeliefActions } from '../server/lib/actions/beliefActionsEngine';

describe('buildBeliefActions', () => {
  it('raises liquidity into cash (the sole liquidity bucket) when below the floor', () => {
    const currentMix = { 'cash': 0.05, 'uk-equity': 0.95, 'us-equity': 0, 'global-equity': 0, 'govt-bonds': 0, 'property': 0 };
    const targetMix = { 'cash': 0.15, 'uk-equity': 0.55, 'us-equity': 0, 'global-equity': 0, 'govt-bonds': 0.30, 'property': 0 };
    const result = buildBeliefActions({ currentMix, targetMix, portfolioValueGBP: 500_000 });
    // liquidityFixPp is the top-up to the liquidity FLOOR (default 0.10), not the full
    // current->target need for cash: 0.10 floor - 0.05 current = 5pp. (10pp is the cash
    // bucket's full current->target delta, asserted separately below via cashNet.) Same
    // fixture-arithmetic class of bug as Task 8's regression fixture, see
    // docs/superpowers/plans/2026-07-01-belief-impact-alternatives.md Task 9 correction note.
    expect(result.summary.liquidityFixPp).toBe(5);
    const allActions = [...result.staged.stage1, ...result.staged.stage2];
    const cashNet = allActions.filter((a) => a.bucket === 'cash').reduce((s, a) => s + a.deltaPct, 0);
    expect(cashNet).toBeCloseTo(0.10, 3);
  });

  it('stages property (the sole illiquid bucket) into stage 2', () => {
    const currentMix = { 'cash': 0.10, 'uk-equity': 0.40, 'us-equity': 0.20, 'global-equity': 0.20, 'govt-bonds': 0.10, 'property': 0 };
    const targetMix = { 'cash': 0.10, 'uk-equity': 0.20, 'us-equity': 0.20, 'global-equity': 0.20, 'govt-bonds': 0.10, 'property': 0.20 };
    const result = buildBeliefActions({ currentMix, targetMix, portfolioValueGBP: 500_000 });
    const propertyInStage2 = result.staged.stage2.some((a) => a.bucket === 'property');
    const propertyInStage1 = result.staged.stage1.some((a) => a.bucket === 'property');
    expect(propertyInStage2).toBe(true);
    expect(propertyInStage1).toBe(false);
  });
});
