// scripts/eval/synthesizeReport.test.ts
import { describe, it, expect } from 'vitest';
import { synthesizeReport } from './synthesizeReport';
import type { FullEvalRecord } from './runFullEval';
import type { ProfileRunResult } from './runHarness';
import type { JudgeVerdict } from './judgePrompt';

function fakeRecord(shapeId: string, vetoFailed: boolean, level: 'Strong' | 'Weak', index = 0): { runResult: Partial<ProfileRunResult>; verdict: JudgeVerdict; error: null } {
  return {
    runResult: { profileId: `${shapeId}-${index}`, shapeId, troubleZoneId: 'OPTIONAL_SECTION_SKIPPER' },
    verdict: {
      vetoFailed, vetoReason: vetoFailed ? 'contradiction found' : null,
      dimensions: {
        personaLegibility: { level, evidence: 'x' },
        safetyLightsFidelity: { level, evidence: 'x' },
        beliefOutlookTraceability: { level, evidence: 'x' },
        internalConsistency: { level, evidence: 'x' },
        informationalSufficiency: { level, evidence: 'x' },
        complianceTargetMarketPosture: { level, evidence: 'x' },
      },
      checklist: {
        personaAssignedWithReason: true, everyHoldingCategoryFeedsOutput: true,
        atLeastOneScenarioCitedToRealEpisode: true, noContradictions: !vetoFailed,
        lowConfidenceAreasFlagged: true, clearNextStepShown: true,
      },
    },
    error: null,
  };
}

function fakeErroredRecord(shapeId: string, index: number): { runResult: Partial<ProfileRunResult>; verdict: null; error: string } {
  return {
    runResult: { profileId: `${shapeId}-${index}`, shapeId, troubleZoneId: 'OPTIONAL_SECTION_SKIPPER' },
    verdict: null,
    error: 'Judge API call failed for profile shape-a-0: rate limit exceeded',
  };
}

describe('synthesizeReport', () => {
  it('groups veto-gate failure rate by shape', () => {
    const records = [
      fakeRecord('shape-a', true, 'Weak'),
      fakeRecord('shape-a', false, 'Strong', 1),
      fakeRecord('shape-b', false, 'Strong'),
    ] as unknown as FullEvalRecord[];
    const report = synthesizeReport(records);
    expect(report.byShape['shape-a'].vetoFailRate).toBe(0.5);
    expect(report.byShape['shape-b'].vetoFailRate).toBe(0);
  });

  it('computes overall veto-fail count and rate', () => {
    const records = [
      fakeRecord('shape-a', true, 'Weak'),
      fakeRecord('shape-a', false, 'Strong', 1),
    ] as unknown as FullEvalRecord[];
    const report = synthesizeReport(records);
    expect(report.overall.totalProfiles).toBe(2);
    expect(report.overall.vetoFailCount).toBe(1);
    expect(report.overall.vetoFailRate).toBe(0.5);
  });

  it('flags shapes where every profile scored Weak on a dimension as a cross-cutting finding', () => {
    const records = [
      fakeRecord('shape-a', false, 'Weak'),
      fakeRecord('shape-a', false, 'Weak', 1),
    ] as unknown as FullEvalRecord[];
    const report = synthesizeReport(records);
    expect(report.crossCuttingFindings.length).toBeGreaterThan(0);
    expect(report.crossCuttingFindings.some((f) => f.includes('shape-a'))).toBe(true);
  });

  it('lists every failing profileId for manual review', () => {
    const records = [fakeRecord('shape-a', true, 'Weak')] as unknown as FullEvalRecord[];
    const report = synthesizeReport(records);
    expect(report.vetoFailedProfileIds).toContain('shape-a-0');
  });

  it('counts errored (verdict: null) records separately without crashing or double-counting them in veto/dimension stats', () => {
    const records = [
      fakeRecord('shape-a', false, 'Strong'),
      fakeErroredRecord('shape-a', 1),
    ] as unknown as FullEvalRecord[];
    const report = synthesizeReport(records);
    expect(report.overall.totalProfiles).toBe(2);
    expect(report.overall.erroredCount).toBe(1);
    expect(report.byShape['shape-a'].totalProfiles).toBe(2);
    expect(report.byShape['shape-a'].erroredCount).toBe(1);
    expect(report.byShape['shape-a'].vetoFailCount).toBe(0);
    expect(report.byShape['shape-a'].vetoFailRate).toBe(0);
    expect(report.erroredProfileIds).toContain('shape-a-1');
  });
});
