// scripts/eval/calibrateJudge.ts
// Resolved spec §1: "A handful of hand-authored golden cases calibrate the judge before the full
// run... if it doesn't [independently rediscover known defects], the rubric/harness is
// miscalibrated before trusting it on novel profiles." This script is the calibration gate:
// it runs computePersona directly against each golden's expected outcome (deterministic, no LLM
// needed for this part) AND runs the full judge (LLM) against the resulting ProfileRunResult,
// capturing the judge's verdict on the result for manual review alongside the deterministic
// pass/fail (which remains the actual gate signal, per the resolved spec's "independently
// rediscovers known defects" framing being about the ENGINE, not the judge's opinion).
import { computePersona } from '../../server/services/personaEngine';
import type { InvestorProfile } from '../../server/services/personaEngine';
import { judgeProfile, type AnthropicMessagesClient } from './judgeProfile';
import type { JudgeVerdict } from './judgePrompt';
import { runProfileThroughPipeline } from './runHarness';
import type { GeneratedProfile } from './generateProfiles';

export interface GoldenCase {
  name: string;
  investorProfile: InvestorProfile;
  expectComputePersonaCode?: string;
  expectComputePersonaCodeNot?: string;
  expectMatchConfidenceLessThan?: number;
}

export interface CalibrationResult {
  name: string;
  passed: boolean;
  reason: string;
  judgeVerdict: JudgeVerdict;
}

export interface CalibrationReport {
  results: CalibrationResult[];
  allPassed: boolean;
}

function toGeneratedProfile(golden: GoldenCase, index: number): GeneratedProfile {
  return {
    id: `golden-${index}`,
    shapeId: 'golden',
    wealthTierId: 'golden',
    assetRegisterPatternId: 'golden',
    answerPatternId: 'golden',
    troubleZoneId: 'golden',
    investorProfile: golden.investorProfile,
    holdings: [],
    beliefTiltAnswers: { Q_VOLATILITY_COMFORT: 3, Q_QUALITY: 3, Q_VALUE: 3, Q_TECH: 3, Q_UK_BIAS: 3, Q_ESG: 3, Q_INFLATION: 3, Q_SMALL_CAP: 3 },
    outlookAnswers: {},
  };
}

export async function runCalibration(goldens: GoldenCase[], client: AnthropicMessagesClient): Promise<CalibrationReport> {
  const results: CalibrationResult[] = [];

  for (let i = 0; i < goldens.length; i++) {
    const golden = goldens[i];
    const personaResult = computePersona(golden.investorProfile);
    const failures: string[] = [];

    if (golden.expectComputePersonaCode && personaResult.code !== golden.expectComputePersonaCode) {
      failures.push(`expected persona code "${golden.expectComputePersonaCode}", got "${personaResult.code}"`);
    }
    if (golden.expectComputePersonaCodeNot && personaResult.code === golden.expectComputePersonaCodeNot) {
      failures.push(`expected persona code to NOT be "${golden.expectComputePersonaCodeNot}", but it was`);
    }
    if (golden.expectMatchConfidenceLessThan !== undefined && personaResult.match_confidence >= golden.expectMatchConfidenceLessThan) {
      failures.push(`expected match_confidence < ${golden.expectMatchConfidenceLessThan}, got ${personaResult.match_confidence}`);
    }

    // Runs the full pipeline + judge so the calibration report ACTUALLY captures the judge's
    // qualitative read of this known-shape profile (not just discards it) — deterministic checks
    // above remain the pass/fail gate signal per the resolved spec's framing.
    const generatedProfile = toGeneratedProfile(golden, i);
    const runResult = runProfileThroughPipeline(generatedProfile);
    const judgeVerdict = await judgeProfile(runResult, client);

    results.push({
      name: golden.name,
      passed: failures.length === 0,
      reason: failures.length === 0 ? 'all deterministic expectations met' : failures.join('; '),
      judgeVerdict,
    });
  }

  return { results, allPassed: results.every((r) => r.passed) };
}
