import { describe, it, expect } from 'vitest';
import { buildJudgePrompt, JUDGE_RESPONSE_SCHEMA, type JudgeVerdict } from './judgePrompt';
import { runProfileThroughPipeline } from './runHarness';
import { generateProfiles } from './generateProfiles';

describe('buildJudgePrompt', () => {
  it('includes the veto-gate criteria verbatim', () => {
    const profiles = generateProfiles();
    const result = runProfileThroughPipeline(profiles[0]);
    const prompt = buildJudgePrompt(result);
    expect(prompt).toContain('contradict each other');
    expect(prompt).toContain("intelligence, never advice");
  });

  it('includes all six scored dimension names', () => {
    const profiles = generateProfiles();
    const result = runProfileThroughPipeline(profiles[0]);
    const prompt = buildJudgePrompt(result);
    for (const dim of [
      'Persona legibility', 'Safety-Lights fidelity', 'Belief/outlook',
      'Internal consistency', 'Informational sufficiency', 'Compliance',
    ]) {
      expect(prompt, `missing dimension "${dim}"`).toContain(dim);
    }
  });

  it('includes all six binary checklist items', () => {
    const profiles = generateProfiles();
    const result = runProfileThroughPipeline(profiles[0]);
    const prompt = buildJudgePrompt(result);
    expect(prompt).toContain('Persona assigned with a stated reason');
    expect(prompt).toContain('Every holding category');
    expect(prompt).toContain('at least one scenario/stress reading');
    expect(prompt).toContain('No two shown elements contradict');
    expect(prompt).toContain('low-input-confidence area');
    expect(prompt).toContain('clear next step');
  });

  it('discloses the harness staged-rebalance limitation from runHarness.ts', () => {
    const profiles = generateProfiles();
    const result = runProfileThroughPipeline(profiles[0]);
    const prompt = buildJudgePrompt(result);
    expect(prompt).toContain('target mix equals the current mix');
  });

  it('serializes the full ProfileRunResult as JSON into the prompt', () => {
    const profiles = generateProfiles();
    const result = runProfileThroughPipeline(profiles[0]);
    const prompt = buildJudgePrompt(result);
    expect(prompt).toContain(result.persona.code);
    expect(prompt).toContain(result.profileId);
  });

  it('JUDGE_RESPONSE_SCHEMA requires vetoFailed, dimensions, and checklist top-level keys', () => {
    expect(JUDGE_RESPONSE_SCHEMA.required).toEqual(expect.arrayContaining(['vetoFailed', 'vetoReason', 'dimensions', 'checklist']));
  });
});
