import { describe, it, expect } from 'vitest';
import { computeTiltsGate } from './tiltsGate';
import type { SafetyLightsResult } from '../state/onboardingV2Store';
import type { SafetyLightResponseState } from '../state/onboardingV2Store';

function lights(overrides: Partial<Pick<SafetyLightsResult, 'liquidity' | 'concentration' | 'illiquids'>>): Pick<SafetyLightsResult, 'liquidity' | 'concentration' | 'illiquids'> {
  return { liquidity: 'GREEN', concentration: 'GREEN', illiquids: 'GREEN', ...overrides };
}

const NO_RESPONSES: SafetyLightResponseState = { version: '1.0', responses: {} };

describe('computeTiltsGate', () => {
  it('allows tilts when no light is RED, flag off', () => {
    const result = computeTiltsGate(lights({}), NO_RESPONSES, false);
    expect(result).toEqual({ tiltsAllowed: true, gateReason: 'NO_RED_FLAGS' });
  });

  it('blocks tilts with the specific reason when exactly one light is RED, flag off', () => {
    const result = computeTiltsGate(lights({ liquidity: 'RED' }), NO_RESPONSES, false);
    expect(result).toEqual({ tiltsAllowed: false, gateReason: 'RED_LIQUIDITY' });
  });

  it('blocks tilts with MULTIPLE_RED_FLAGS when two or more lights are RED, flag off', () => {
    const result = computeTiltsGate(lights({ liquidity: 'RED', concentration: 'RED' }), NO_RESPONSES, false);
    expect(result).toEqual({ tiltsAllowed: false, gateReason: 'MULTIPLE_RED_FLAGS' });
  });

  it('flag ON but no self-placement recorded: identical to flag OFF (still blocked)', () => {
    const result = computeTiltsGate(lights({ concentration: 'RED' }), NO_RESPONSES, true);
    expect(result).toEqual({ tiltsAllowed: false, gateReason: 'RED_CONCENTRATION' });
  });

  it('flag ON, one RED light, self-placed UNSURE: stays blocked', () => {
    const responses: SafetyLightResponseState = {
      version: '1.0',
      responses: { concentration: { stance: 'UNSURE', responded_at: '2026-07-04T00:00:00.000Z' } },
    };
    const result = computeTiltsGate(lights({ concentration: 'RED' }), responses, true);
    expect(result).toEqual({ tiltsAllowed: false, gateReason: 'RED_CONCENTRATION' });
  });

  it('flag ON, one RED light, self-placed REDUCE: stays blocked (reducing is compatible with the existing protective posture)', () => {
    const responses: SafetyLightResponseState = {
      version: '1.0',
      responses: { concentration: { stance: 'REDUCE', responded_at: '2026-07-04T00:00:00.000Z' } },
    };
    const result = computeTiltsGate(lights({ concentration: 'RED' }), responses, true);
    expect(result).toEqual({ tiltsAllowed: false, gateReason: 'RED_CONCENTRATION' });
  });

  it('flag ON, one RED light, self-placed HOLD_DELIBERATE: unlocks', () => {
    const responses: SafetyLightResponseState = {
      version: '1.0',
      responses: { concentration: { stance: 'HOLD_DELIBERATE', responded_at: '2026-07-04T00:00:00.000Z' } },
    };
    const result = computeTiltsGate(lights({ concentration: 'RED' }), responses, true);
    expect(result).toEqual({ tiltsAllowed: true, gateReason: 'RED_CONCENTRATION' });
  });

  it('flag ON, two RED lights, only one self-placed HOLD_DELIBERATE: stays blocked (every RED light must be addressed)', () => {
    const responses: SafetyLightResponseState = {
      version: '1.0',
      responses: { concentration: { stance: 'HOLD_DELIBERATE', responded_at: '2026-07-04T00:00:00.000Z' } },
    };
    const result = computeTiltsGate(lights({ liquidity: 'RED', concentration: 'RED' }), responses, true);
    expect(result).toEqual({ tiltsAllowed: false, gateReason: 'MULTIPLE_RED_FLAGS' });
  });

  it('flag ON, two RED lights, both self-placed HOLD_DELIBERATE: unlocks', () => {
    const responses: SafetyLightResponseState = {
      version: '1.0',
      responses: {
        liquidity: { stance: 'HOLD_DELIBERATE', responded_at: '2026-07-04T00:00:00.000Z' },
        concentration: { stance: 'HOLD_DELIBERATE', responded_at: '2026-07-04T00:00:00.000Z' },
      },
    };
    const result = computeTiltsGate(lights({ liquidity: 'RED', concentration: 'RED' }), responses, true);
    expect(result).toEqual({ tiltsAllowed: true, gateReason: 'MULTIPLE_RED_FLAGS' });
  });

  it('blocks tilts with MULTIPLE_RED_FLAGS when all three lights are RED, flag off', () => {
    const result = computeTiltsGate(lights({ liquidity: 'RED', concentration: 'RED', illiquids: 'RED' }), NO_RESPONSES, false);
    expect(result).toEqual({ tiltsAllowed: false, gateReason: 'MULTIPLE_RED_FLAGS' });
  });

  it('flag ON, all three lights RED, only two self-placed HOLD_DELIBERATE: stays blocked', () => {
    const responses: SafetyLightResponseState = {
      version: '1.0',
      responses: {
        liquidity: { stance: 'HOLD_DELIBERATE', responded_at: '2026-07-04T00:00:00.000Z' },
        concentration: { stance: 'HOLD_DELIBERATE', responded_at: '2026-07-04T00:00:00.000Z' },
      },
    };
    const result = computeTiltsGate(lights({ liquidity: 'RED', concentration: 'RED', illiquids: 'RED' }), responses, true);
    expect(result).toEqual({ tiltsAllowed: false, gateReason: 'MULTIPLE_RED_FLAGS' });
  });

  it('flag ON, all three lights RED, all self-placed HOLD_DELIBERATE: unlocks', () => {
    const responses: SafetyLightResponseState = {
      version: '1.0',
      responses: {
        liquidity: { stance: 'HOLD_DELIBERATE', responded_at: '2026-07-04T00:00:00.000Z' },
        concentration: { stance: 'HOLD_DELIBERATE', responded_at: '2026-07-04T00:00:00.000Z' },
        illiquids: { stance: 'HOLD_DELIBERATE', responded_at: '2026-07-04T00:00:00.000Z' },
      },
    };
    const result = computeTiltsGate(lights({ liquidity: 'RED', concentration: 'RED', illiquids: 'RED' }), responses, true);
    expect(result).toEqual({ tiltsAllowed: true, gateReason: 'MULTIPLE_RED_FLAGS' });
  });
});
