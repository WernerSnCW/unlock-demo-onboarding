// scripts/eval/judgeProfile.test.ts
import { describe, it, expect, vi } from 'vitest';
import { judgeProfile, type AnthropicMessagesClient } from './judgeProfile';
import { runProfileThroughPipeline } from './runHarness';
import { generateProfiles } from './generateProfiles';

function fakeClient(responseJson: string): AnthropicMessagesClient {
  return {
    messages: {
      create: vi.fn().mockResolvedValue({ content: [{ type: 'text', text: responseJson }] }),
    },
  };
}

const VALID_RESPONSE = JSON.stringify({
  vetoFailed: false,
  vetoReason: null,
  dimensions: {
    personaLegibility: { level: 'Strong', evidence: 'Persona code and label both present with a clear one-liner.' },
    safetyLightsFidelity: { level: 'Adequate', evidence: 'Lights match holdings-derived metrics.' },
    beliefOutlookTraceability: { level: 'Strong', evidence: 'Tiered impact cites GFC_2008.' },
    internalConsistency: { level: 'Strong', evidence: 'No contradictions found.' },
    informationalSufficiency: { level: 'Adequate', evidence: 'Next step implied but not explicit.' },
    complianceTargetMarketPosture: { level: 'Strong', evidence: 'No advice-shaped language.' },
  },
  checklist: {
    personaAssignedWithReason: true,
    everyHoldingCategoryFeedsOutput: true,
    atLeastOneScenarioCitedToRealEpisode: true,
    noContradictions: true,
    lowConfidenceAreasFlagged: false,
    clearNextStepShown: false,
  },
});

describe('judgeProfile', () => {
  it('parses a well-formed judge response into a JudgeVerdict', async () => {
    const profiles = generateProfiles();
    const result = runProfileThroughPipeline(profiles[0]);
    const verdict = await judgeProfile(result, fakeClient(VALID_RESPONSE));
    expect(verdict.vetoFailed).toBe(false);
    expect(verdict.dimensions.personaLegibility.level).toBe('Strong');
    expect(verdict.checklist.everyHoldingCategoryFeedsOutput).toBe(true);
  });

  it('strips markdown code fences if the model wraps its JSON response', async () => {
    const profiles = generateProfiles();
    const result = runProfileThroughPipeline(profiles[0]);
    const fenced = '```json\n' + VALID_RESPONSE + '\n```';
    const verdict = await judgeProfile(result, fakeClient(fenced));
    expect(verdict.vetoFailed).toBe(false);
  });

  it('throws a descriptive error when the response is missing a required top-level key', async () => {
    const profiles = generateProfiles();
    const result = runProfileThroughPipeline(profiles[0]);
    const broken = JSON.stringify({ vetoFailed: false, dimensions: {}, checklist: {} }); // missing vetoReason
    await expect(judgeProfile(result, fakeClient(broken))).rejects.toThrow(/vetoReason/);
  });

  it('throws a descriptive error when the response is not valid JSON', async () => {
    const profiles = generateProfiles();
    const result = runProfileThroughPipeline(profiles[0]);
    await expect(judgeProfile(result, fakeClient('not json at all'))).rejects.toThrow(/JSON/);
  });

  it('parses unfenced JSON whose evidence field contains a literal triple-backtick', async () => {
    const profiles = generateProfiles();
    const result = runProfileThroughPipeline(profiles[0]);
    const withEmbeddedFence = JSON.stringify({
      vetoFailed: false,
      vetoReason: null,
      dimensions: {
        personaLegibility: { level: 'Strong', evidence: 'Copy cites the ```code block``` shown on-screen.' },
        safetyLightsFidelity: { level: 'Adequate', evidence: 'Lights match holdings-derived metrics.' },
        beliefOutlookTraceability: { level: 'Strong', evidence: 'Tiered impact cites GFC_2008.' },
        internalConsistency: { level: 'Strong', evidence: 'No contradictions found.' },
        informationalSufficiency: { level: 'Adequate', evidence: 'Next step implied but not explicit.' },
        complianceTargetMarketPosture: { level: 'Strong', evidence: 'No advice-shaped language.' },
      },
      checklist: {
        personaAssignedWithReason: true,
        everyHoldingCategoryFeedsOutput: true,
        atLeastOneScenarioCitedToRealEpisode: true,
        noContradictions: true,
        lowConfidenceAreasFlagged: false,
        clearNextStepShown: false,
      },
    });
    const verdict = await judgeProfile(result, fakeClient(withEmbeddedFence));
    expect(verdict.vetoFailed).toBe(false);
    expect(verdict.dimensions.personaLegibility.evidence).toContain('```code block```');
  });

  it('throws a descriptive error when a dimension level is not a valid enum value', async () => {
    const profiles = generateProfiles();
    const result = runProfileThroughPipeline(profiles[0]);
    const parsedInvalid = JSON.parse(VALID_RESPONSE);
    parsedInvalid.dimensions.personaLegibility.level = 'Very Strong';
    await expect(judgeProfile(result, fakeClient(JSON.stringify(parsedInvalid)))).rejects.toThrow(
      /personaLegibility.*level.*Strong\/Adequate\/Weak\/Absent/
    );
  });

  it('throws a descriptive error when a dimension evidence field has the wrong type', async () => {
    const profiles = generateProfiles();
    const result = runProfileThroughPipeline(profiles[0]);
    const parsedInvalid = JSON.parse(VALID_RESPONSE);
    parsedInvalid.dimensions.personaLegibility.evidence = 123;
    await expect(judgeProfile(result, fakeClient(JSON.stringify(parsedInvalid)))).rejects.toThrow(
      /personaLegibility.*evidence.*must be a string/
    );
  });

  it('throws a descriptive error when vetoFailed has the wrong type', async () => {
    const profiles = generateProfiles();
    const result = runProfileThroughPipeline(profiles[0]);
    const parsedInvalid = JSON.parse(VALID_RESPONSE);
    parsedInvalid.vetoFailed = 'false';
    await expect(judgeProfile(result, fakeClient(JSON.stringify(parsedInvalid)))).rejects.toThrow(
      /vetoFailed.*must be a boolean/
    );
  });

  it('re-throws a clear error mentioning the profile id when the API call fails', async () => {
    const profiles = generateProfiles();
    const result = runProfileThroughPipeline(profiles[0]);
    const failingClient: AnthropicMessagesClient = {
      messages: {
        create: vi.fn().mockRejectedValue(new Error('rate limit exceeded')),
      },
    };
    await expect(judgeProfile(result, failingClient)).rejects.toThrow(
      new RegExp(`${result.profileId}.*rate limit exceeded`)
    );
  });
});
