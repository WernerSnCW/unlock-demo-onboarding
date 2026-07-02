import { describe, it, expect } from 'vitest';
import { scoreOutlookBeliefs } from './scoreOutlook';

describe('scoreOutlookBeliefs', () => {
  it('all-Neutral responses → insufficientSignal, all weights zero', () => {
    const responses = {
      B1_mobility_views: 3 as const, B4_government_confidence: 3 as const, B5_energy_policy: 3 as const,
    };
    const result = scoreOutlookBeliefs(responses);
    expect(result.insufficientSignal).toBe(true);
    expect(Object.values(result.scenarioWeights).every((w) => w === 0)).toBe(true);
  });

  it('a single strongly-agreed question splits weight proportionally across its scenarios', () => {
    // B5: "higher->Energy Shock, Stagflation", weights {Energy Shock:0.22, Stagflation:0.15}
    const result = scoreOutlookBeliefs({ B5_energy_policy: 5 });
    expect(result.insufficientSignal).toBe(false);
    expect(result.scenarioWeights['Energy Shock']).toBeCloseTo(0.22 / 0.37, 6);
    expect(result.scenarioWeights['Stagflation']).toBeCloseTo(0.15 / 0.37, 6);
    expect(result.scenarioWeights['AI Recession']).toBe(0);
  });

  it('B12 negative cross-scenario weight nets against another question feeding the same scenario (audit fix)', () => {
    // B2: "lower->AI Recession, Tech Burst", weights {AI Recession:0.20, Tech Burst:0.15}
    //   strongly DISAGREE (1) with "lower" direction → signedScore = -1.0 * -1 = +1.0
    //   contributes AI Recession += 0.20, Tech Burst += 0.15
    // B12: "higher->Rate-Cut Reflation", weights {Rate-Cut Reflation:0.30, AI Recession:-0.10, Debt Spiral:-0.10}
    //   strongly AGREE (5) with "higher" direction → signedScore = +1.0
    //   contributes Rate-Cut Reflation += 0.30, AI Recession += -0.10, Debt Spiral += -0.10 (clamped to 0)
    // Net AI Recession = 0.20 - 0.10 = 0.10 (not discarded, not double-counted)
    const result = scoreOutlookBeliefs({ B2_job_security_white_collar: 1, B12_policy_support: 5 });
    const sum = 0.10 + 0.15 + 0.30; // AI Recession + Tech Burst + Rate-Cut Reflation, Debt Spiral clamped to 0
    expect(result.scenarioWeights['AI Recession']).toBeCloseTo(0.10 / sum, 6);
    expect(result.scenarioWeights['Tech Burst']).toBeCloseTo(0.15 / sum, 6);
    expect(result.scenarioWeights['Rate-Cut Reflation']).toBeCloseTo(0.30 / sum, 6);
    expect(result.scenarioWeights['Debt Spiral']).toBe(0);
  });
});
