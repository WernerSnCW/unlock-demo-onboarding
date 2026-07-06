import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { useOnboardingV2Store as UseOnboardingV2Store } from './onboardingV2Store';

// The store is wrapped in zustand's `persist` middleware, which writes to
// `localStorage` on every `set()`. The project's vitest config runs client
// tests under `environment: 'node'` (no DOM globals), so stub it out the
// same way tests/onboardingV2.test.ts does, and re-import per test via
// vi.resetModules() so the stub is in place before the store module runs.
const localStorageMock = {
  data: {} as Record<string, string>,
  getItem: (key: string) => localStorageMock.data[key] || null,
  setItem: (key: string, value: string) => { localStorageMock.data[key] = value; },
  removeItem: (key: string) => { delete localStorageMock.data[key]; },
  clear: () => { localStorageMock.data = {}; },
};

vi.stubGlobal('localStorage', localStorageMock);

describe('safetyLightResponse store slice', () => {
  let useOnboardingV2Store: typeof UseOnboardingV2Store;

  beforeEach(async () => {
    vi.resetModules();
    localStorageMock.clear();
    ({ useOnboardingV2Store } = await import('./onboardingV2Store'));
    useOnboardingV2Store.getState().resetSafetyLightResponse();
  });

  it('starts with no responses recorded', () => {
    expect(useOnboardingV2Store.getState().safetyLightResponse.responses).toEqual({});
  });

  it('setSafetyLightResponse records a stance for a specific light', () => {
    useOnboardingV2Store.getState().setSafetyLightResponse('concentration', 'HOLD_DELIBERATE');
    const entry = useOnboardingV2Store.getState().safetyLightResponse.responses.concentration;
    expect(entry?.stance).toBe('HOLD_DELIBERATE');
    expect(typeof entry?.responded_at).toBe('string');
  });

  it('setSafetyLightResponse for one light does not affect another', () => {
    useOnboardingV2Store.getState().setSafetyLightResponse('liquidity', 'REDUCE');
    useOnboardingV2Store.getState().setSafetyLightResponse('concentration', 'HOLD_DELIBERATE');
    const responses = useOnboardingV2Store.getState().safetyLightResponse.responses;
    expect(responses.liquidity?.stance).toBe('REDUCE');
    expect(responses.concentration?.stance).toBe('HOLD_DELIBERATE');
  });

  it('resetSafetyLightResponse clears all responses', () => {
    useOnboardingV2Store.getState().setSafetyLightResponse('illiquids', 'UNSURE');
    useOnboardingV2Store.getState().resetSafetyLightResponse();
    expect(useOnboardingV2Store.getState().safetyLightResponse.responses).toEqual({});
  });
});
