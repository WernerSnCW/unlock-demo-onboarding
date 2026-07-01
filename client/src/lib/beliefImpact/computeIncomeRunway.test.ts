import { describe, it, expect } from 'vitest';
import type { EpisodeReplay } from '../empiricalEngine';
import { computeIncomeRunway } from './computeIncomeRunway';

function replay(overrides: Partial<EpisodeReplay>): EpisodeReplay {
  return {
    episodeId: 'TEST', granularity: 'annual', points: [0, -0.1, -0.2, -0.1, 0],
    drawdown: -0.2, troughIndex: 2, recoverySteps: 2, contributors: [], noDataShare: 0,
    ...overrides,
  };
}

describe('computeIncomeRunway', () => {
  it('survives when the buffer never runs dry within the window', () => {
    const result = computeIncomeRunway(replay({}), 'annual', 10_000, 1_000_000, 'Test Episode');
    expect(result.survivesWithoutSellingAtTrough).toBe(true);
    expect(result.bufferExhaustedAtStep).toBeNull();
  });

  it('does not survive when the buffer runs dry before the recorded recovery', () => {
    const result = computeIncomeRunway(replay({}), 'annual', 10_000, 15_000, 'Test Episode');
    expect(result.survivesWithoutSellingAtTrough).toBe(false);
    expect(result.bufferExhaustedAtStep).toBe(2);
    expect(result.recoveryStepFromStart).toBe(4);
  });

  it('does not survive when the episode never recovered in its window AND the buffer runs dry', () => {
    const result = computeIncomeRunway(replay({ recoverySteps: null }), 'annual', 10_000, 15_000, 'Test Episode');
    expect(result.survivesWithoutSellingAtTrough).toBe(false);
    expect(result.recoveryStepFromStart).toBeNull();
  });

  it('pro-rates monthly episodes by dividing annual spend by 12', () => {
    const monthlyReplay = replay({ granularity: 'monthly', points: [0, -0.1, -0.2, -0.15, -0.05, 0], recoverySteps: 3, troughIndex: 2 });
    const result = computeIncomeRunway(monthlyReplay, 'monthly', 10_000, 2_000, 'Test Episode');
    expect(result.bufferExhaustedAtStep).toBe(3);
  });
});
