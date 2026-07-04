import { describe, it, expect } from 'vitest';
import { runProfileThroughPipeline } from './runHarness';
import { generateProfiles } from './generateProfiles';

describe('runProfileThroughPipeline', () => {
  it('produces a complete ProfileRunResult for a full-answers profile with no exceptions', () => {
    const profiles = generateProfiles();
    const profile = profiles.find((p) => p.answerPatternId === 'FULL_ANSWERS')!;
    const result = runProfileThroughPipeline(profile);

    expect(result.profileId).toBe(profile.id);
    expect(result.safetyLights.overall_status).toMatch(/GREEN|AMBER|RED/);
    expect(result.persona.code).toBeTruthy();
    expect(typeof result.outlookScore.insufficientSignal).toBe('boolean');
    expect(result.alignment.band).toMatch(/BROADLY_ALIGNED|PARTIALLY_ALIGNED|MISALIGNED/);
    expect(Array.isArray(result.tieredImpact.rows)).toBe(true);
    expect(Array.isArray(result.stagedRebalance.staged.stage1)).toBe(true);
    expect(result.beliefTiltProfile.tiltProfile.length).toBe(8);
  });

  it('computes the tilts gate and reflects a RED-gate-shaped profile as blocked when stance is NO_RESPONSE', () => {
    const profiles = generateProfiles();
    const profile = profiles.find((p) => p.safetyLightStance === 'NO_RESPONSE')!;
    const result = runProfileThroughPipeline(profile);
    expect(result.tiltsGate.tiltsAllowed).toBe(false);
  });

  it('computes the tilts gate as unlocked when stance is HOLD_DELIBERATE and a light is RED', () => {
    const profiles = generateProfiles();
    const profile = profiles.find((p) => p.safetyLightStance === 'HOLD_DELIBERATE')!;
    const result = runProfileThroughPipeline(profile);
    expect(result.safetyLights.concentration === 'RED' || result.safetyLights.liquidity === 'RED' || result.safetyLights.illiquids === 'RED').toBe(true);
    expect(result.tiltsGate.tiltsAllowed).toBe(true);
  });

  it('every generated profile runs through the full pipeline without throwing', () => {
    const profiles = generateProfiles();
    for (const profile of profiles) {
      expect(() => runProfileThroughPipeline(profile), `profile ${profile.id} threw`).not.toThrow();
    }
  });

  it('liquidity light varies across the generated profile set (not structurally stuck at GREEN)', () => {
    const profiles = generateProfiles();
    const statuses = new Set(profiles.map((p) => runProfileThroughPipeline(p).safetyLights.liquidity));
    expect(statuses.size, `liquidity status never varies — got only: ${[...statuses]}`).toBeGreaterThan(1);
  });

  it('surfaces the staged-rebalance stub limitation via caveats', () => {
    const profiles = generateProfiles();
    const result = runProfileThroughPipeline(profiles[0]);
    expect(result.caveats).toContain(
      'stagedRebalance target mix equals current mix (belief-driven target-mix construction not wired in this harness) — do not read an empty stagedRebalance as a real zero-action recommendation',
    );
  });
});
