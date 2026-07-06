# Safety-Light Self-Placement (RED-Gate Softening) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the uniform "any RED Safety Light disables belief-driven tilts" gate with an investor self-placement mechanism — symmetric both-sides framing per light type, the investor picks the description closest to their own reasoning, and only an explicit "I'm comfortable holding this" self-placement (not a system judgment) unlocks tilts. Ships flag-dark (off by default) pending Werner/Vine-Lott/Corke sign-off — see `Intelligence/decisions/2026-07-04-belief-tilt-red-gate-softening-V1.md`.

**Architecture:** A new client-only data slice (`safetyLightResponse`) records the investor's per-light self-placement (`REDUCE` / `HOLD_DELIBERATE` / `UNSURE`, default unanswered = current locked behavior). A single new pure function, `computeTiltsGate()`, replaces the gate logic currently duplicated in `onboardingV2Store.ts`'s `setAnalysisResult` and `computeBeliefsScores` — when the feature flag is off, it is byte-for-byte identical to today's `overall_status !== 'RED'` rule, so no existing test changes behavior. A new UI component renders the symmetric copy and three response buttons, gated behind the flag, on `Analysis.tsx`'s existing Tilts Banner. Responses persist through the existing `onboardingSync.ts` snapshot mechanism.

**Tech Stack:** TypeScript, Zustand (existing `onboardingV2Store.ts`), React (existing pages/components), Vitest (node env, no jsdom — UI is browser-verified per existing repo convention, not jsdom-tested).

---

### Task 1: Feature flag

**Files:**
- Modify: `client/src/lib/featureFlags.ts`

- [ ] **Step 1: Add the flag**

Append to `client/src/lib/featureFlags.ts` (matching the existing `DELTA_ENABLED` pattern exactly, but defaulting OFF since this gates a live safety mechanism rather than a demo feature Tom explicitly waived sign-off for):

```ts
/** Safety-light self-placement (RED-gate softening). DEFAULT OFF — this is a Consumer Duty /
 *  advice-boundary judgment call (see Intelligence/decisions/2026-07-04-belief-tilt-red-gate-softening-V1.md
 *  in the vault) and must not be exposed to any investor before Werner/Vine-Lott/Corke sign-off.
 *  Opt in locally with VITE_SAFETY_LIGHT_ACKNOWLEDGMENT=1. */
export const SAFETY_LIGHT_ACKNOWLEDGMENT_ENABLED: boolean =
  typeof import.meta === 'undefined'
    ? false
    : (import.meta as { env?: Record<string, string> }).env?.VITE_SAFETY_LIGHT_ACKNOWLEDGMENT === '1';
```

- [ ] **Step 2: Commit**

```bash
git add client/src/lib/featureFlags.ts
git commit -m "feat(flags): add SAFETY_LIGHT_ACKNOWLEDGMENT_ENABLED, default off"
```

---

### Task 2: Symmetric both-sides content

**Files:**
- Create: `client/src/data/safetyLightPerspectives.ts`
- Test: `client/src/data/safetyLightPerspectives.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// client/src/data/safetyLightPerspectives.test.ts
import { describe, it, expect } from 'vitest';
import { SAFETY_LIGHT_PERSPECTIVES } from './safetyLightPerspectives';

const LIGHTS = ['liquidity', 'concentration', 'illiquids'] as const;
// Words that would tip one side into reading as the "correct" or recommended one — if either
// side of a pair uses these and the other doesn't, the symmetry the design relies on breaks.
const LOADED_WORDS = ['risky', 'risk-free', 'safer', 'better', 'recommended', 'should', 'smarter', 'wiser', 'mistake'];

describe('SAFETY_LIGHT_PERSPECTIVES', () => {
  it('has a REDUCE and a HOLD_DELIBERATE entry for every light type', () => {
    for (const light of LIGHTS) {
      expect(SAFETY_LIGHT_PERSPECTIVES[light].REDUCE, `${light} REDUCE`).toBeDefined();
      expect(SAFETY_LIGHT_PERSPECTIVES[light].HOLD_DELIBERATE, `${light} HOLD_DELIBERATE`).toBeDefined();
    }
  });

  it('every perspective has non-empty valuePoints and a tradeOff', () => {
    for (const light of LIGHTS) {
      for (const stance of ['REDUCE', 'HOLD_DELIBERATE'] as const) {
        const p = SAFETY_LIGHT_PERSPECTIVES[light][stance];
        expect(p.valuePoints.length, `${light}/${stance} valuePoints`).toBeGreaterThan(0);
        expect(p.tradeOff.length, `${light}/${stance} tradeOff`).toBeGreaterThan(0);
      }
    }
  });

  it('contains no loaded/persuasive language on either side', () => {
    for (const light of LIGHTS) {
      for (const stance of ['REDUCE', 'HOLD_DELIBERATE'] as const) {
        const p = SAFETY_LIGHT_PERSPECTIVES[light][stance];
        const text = [...p.valuePoints, p.tradeOff].join(' ').toLowerCase();
        for (const word of LOADED_WORDS) {
          expect(text.includes(word), `${light}/${stance} should not contain "${word}"`).toBe(false);
        }
      }
    }
  });

  it('keeps each pair roughly balanced in length (neither side over 1.6x the other)', () => {
    for (const light of LIGHTS) {
      const reduceLen = SAFETY_LIGHT_PERSPECTIVES[light].REDUCE.valuePoints.join(' ').length
        + SAFETY_LIGHT_PERSPECTIVES[light].REDUCE.tradeOff.length;
      const holdLen = SAFETY_LIGHT_PERSPECTIVES[light].HOLD_DELIBERATE.valuePoints.join(' ').length
        + SAFETY_LIGHT_PERSPECTIVES[light].HOLD_DELIBERATE.tradeOff.length;
      const ratio = Math.max(reduceLen, holdLen) / Math.min(reduceLen, holdLen);
      expect(ratio, `${light} REDUCE/HOLD_DELIBERATE length ratio`).toBeLessThan(1.6);
    }
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run client/src/data/safetyLightPerspectives.test.ts`
Expected: FAIL — module `./safetyLightPerspectives` does not exist.

- [ ] **Step 3: Write the content module**

```typescript
// client/src/data/safetyLightPerspectives.ts
// Symmetric both-sides framing shown when a Safety Light is RED (see Task 6's UI component).
// Neither side is written to read as more reasonable than the other — this is itself the
// compliance-relevant property, not just accuracy. See the "no loaded language" test in
// safetyLightPerspectives.test.ts, which is the automated guard against drift.

export type SafetyLightType = 'liquidity' | 'concentration' | 'illiquids';

export interface Perspective {
  /** What an investor taking this stance typically values — factual, not persuasive. */
  valuePoints: string[];
  /** What that stance gives up — stated plainly, not minimised. */
  tradeOff: string;
}

export interface PerspectivePair {
  REDUCE: Perspective;
  HOLD_DELIBERATE: Perspective;
}

export const SAFETY_LIGHT_PERSPECTIVES: Record<SafetyLightType, PerspectivePair> = {
  liquidity: {
    REDUCE: {
      valuePoints: [
        'More room to cover essential spending through a market downturn without needing to sell other holdings at a bad time.',
        'Less month-to-month exposure to near-term bills or unexpected costs.',
        'More flexibility to act on an opportunity if one comes up.',
      ],
      tradeOff: 'Cash held as a buffer is not invested, so it does not participate in market growth.',
    },
    HOLD_DELIBERATE: {
      valuePoints: [
        'Other reliable, fast-access sources of income or credit outside this portfolio — for example a salary, a second portfolio, or a credit facility — that make a large standalone buffer less necessary.',
        'Keeping more capital invested and working rather than held aside.',
      ],
      tradeOff: 'A thinner buffer means less cushion if an unexpected cost and a market downturn happen at the same time.',
    },
  },
  concentration: {
    REDUCE: {
      valuePoints: [
        'Less exposure to any single company or asset’s specific bad news.',
        'A smoother, more predictable overall return profile across the portfolio.',
      ],
      tradeOff: 'Reducing a concentrated position can cap the upside if that holding performs exceptionally well, and may trigger a disposal (with its own cost or tax consequences).',
    },
    HOLD_DELIBERATE: {
      valuePoints: [
        'Specific knowledge of, or control over, that holding — for example a family business, a long-held family asset, or deep familiarity with a company.',
        'Avoiding a disposal event that reducing the position would trigger, whether for tax, cost, or other reasons.',
      ],
      tradeOff: 'Holding a concentrated position means outsized exposure to that single holding’s specific ups and downs.',
    },
  },
  illiquids: {
    REDUCE: {
      valuePoints: [
        'Being able to access more of the portfolio quickly if plans change or an opportunity or emergency arises.',
        'Simpler valuation and less ongoing management than illiquid holdings typically require.',
      ],
      tradeOff: 'Reducing illiquid exposure can mean exiting an asset class the investor understands well or one that has performed well for them, and illiquid assets often carry real cost or delay to sell.',
    },
    HOLD_DELIBERATE: {
      valuePoints: [
        'Multi-generational or long-term ownership goals that a liquid substitute would not serve — for example a family property portfolio.',
        'A track record and specific expertise in that asset class.',
        'Income or other benefits the illiquid holding provides directly.',
      ],
      tradeOff: 'A large illiquid allocation means less flexibility to respond quickly if circumstances change.',
    },
  },
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run client/src/data/safetyLightPerspectives.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add client/src/data/safetyLightPerspectives.ts client/src/data/safetyLightPerspectives.test.ts
git commit -m "feat(content): symmetric both-sides perspectives for the safety-light self-placement"
```

---

### Task 3: Store slice for self-placement responses

**Files:**
- Modify: `client/src/state/onboardingV2Store.ts`
- Test: `client/src/state/safetyLightResponse.test.ts` (new file, testing the store in isolation)

- [ ] **Step 1: Write the failing test**

```typescript
// client/src/state/safetyLightResponse.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useOnboardingV2Store } from './onboardingV2Store';

describe('safetyLightResponse store slice', () => {
  beforeEach(() => {
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run client/src/state/safetyLightResponse.test.ts`
Expected: FAIL — `setSafetyLightResponse`/`resetSafetyLightResponse`/`safetyLightResponse` do not exist on the store.

- [ ] **Step 3: Add the types**

In `client/src/state/onboardingV2Store.ts`, immediately after the `TiltsGateReason` type (currently ending at line 239), add:

```typescript
export type SafetyLightType = 'liquidity' | 'concentration' | 'illiquids';
export type SafetyLightStance = 'REDUCE' | 'HOLD_DELIBERATE' | 'UNSURE';

export interface SafetyLightResponseEntry {
  stance: SafetyLightStance;
  responded_at: string;
}

export interface SafetyLightResponseState {
  version: string;
  responses: Partial<Record<SafetyLightType, SafetyLightResponseEntry>>;
}
```

- [ ] **Step 4: Add the initial state constant**

Find `initialBeliefs` (the constant used to seed `BeliefsState`, referenced near line 485-495) and add a sibling constant immediately after it:

```typescript
const initialSafetyLightResponse: SafetyLightResponseState = {
  version: '1.0',
  responses: {},
};
```

- [ ] **Step 5: Register the slice on the store's state type**

Find the `OnboardingV2State` interface (spans roughly lines 372-416, containing `beliefs: BeliefsState;` and `outlook: OutlookState;`). Add, alongside those two fields:

```typescript
  safetyLightResponse: SafetyLightResponseState;
  setSafetyLightResponse: (light: SafetyLightType, stance: SafetyLightStance) => void;
  resetSafetyLightResponse: () => void;
```

- [ ] **Step 6: Register the slice in the store body**

Find where the store's returned object includes `beliefs: initialBeliefs,` and `outlook: initialOutlook,` (the initial-state block passed to `create<OnboardingV2State>()(...)`). Add:

```typescript
      safetyLightResponse: initialSafetyLightResponse,
```

Then, immediately after the existing `resetOutlook: () => { set({ outlook: initialOutlook }); },` action (around line 988-990), add the two new actions:

```typescript
      setSafetyLightResponse: (light, stance) => {
        set((state) => ({
          safetyLightResponse: {
            ...state.safetyLightResponse,
            responses: {
              ...state.safetyLightResponse.responses,
              [light]: { stance, responded_at: new Date().toISOString() },
            },
          },
        }));
      },

      resetSafetyLightResponse: () => {
        set({ safetyLightResponse: initialSafetyLightResponse });
      },
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npx vitest run client/src/state/safetyLightResponse.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 8: Run the full suite to confirm nothing else broke**

Run: `npm test`
Expected: all existing tests still green (pure addition, no existing behavior touched yet)

- [ ] **Step 9: Commit**

```bash
git add client/src/state/onboardingV2Store.ts client/src/state/safetyLightResponse.test.ts
git commit -m "feat(state): add safetyLightResponse store slice for RED-gate self-placement"
```

---

### Task 4: Shared gate-composition function (replaces the duplicated inline logic)

**Files:**
- Create: `client/src/lib/tiltsGate.ts`
- Test: `client/src/lib/tiltsGate.test.ts`

The gate logic today is duplicated verbatim in `onboardingV2Store.ts`'s `setAnalysisResult` (lines 908-923) and `computeBeliefsScores` (lines 997-1012). This task extracts it into one pure function so the new override logic is defined exactly once — Task 5 wires both call sites to it.

- [ ] **Step 1: Write the failing tests**

```typescript
// client/src/lib/tiltsGate.test.ts
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
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run client/src/lib/tiltsGate.test.ts`
Expected: FAIL — module `./tiltsGate` does not exist.

- [ ] **Step 3: Implement `computeTiltsGate`**

```typescript
// client/src/lib/tiltsGate.ts
import type { SafetyLightsResult, SafetyLightResponseState, SafetyLightType, TiltsGateReason } from '../state/onboardingV2Store';

export interface TiltsGateResult {
  tiltsAllowed: boolean;
  gateReason: TiltsGateReason;
}

const LIGHT_TO_REASON: Record<SafetyLightType, TiltsGateReason> = {
  liquidity: 'RED_LIQUIDITY',
  concentration: 'RED_CONCENTRATION',
  illiquids: 'RED_ILLIQUIDS',
};

/**
 * When `selfPlacementEnabled` is false, this is byte-for-byte the original rule:
 * any RED light blocks tilts, with the specific reason if there's exactly one.
 * When true, a RED light only stays blocking if the investor has not self-placed
 * as HOLD_DELIBERATE for that specific light — every currently-RED light must be
 * individually addressed (see Intelligence/decisions/2026-07-04-belief-tilt-red-gate-softening-V1.md
 * for why REDUCE/UNSURE both leave the block in place rather than partially unlocking).
 */
export function computeTiltsGate(
  lights: Pick<SafetyLightsResult, 'liquidity' | 'concentration' | 'illiquids'>,
  selfPlacement: SafetyLightResponseState,
  selfPlacementEnabled: boolean,
): TiltsGateResult {
  const redLights = (Object.keys(LIGHT_TO_REASON) as SafetyLightType[]).filter((l) => lights[l] === 'RED');

  const gateReason: TiltsGateReason =
    redLights.length === 0 ? 'NO_RED_FLAGS'
    : redLights.length === 1 ? LIGHT_TO_REASON[redLights[0]]
    : 'MULTIPLE_RED_FLAGS';

  if (redLights.length === 0) {
    return { tiltsAllowed: true, gateReason };
  }

  if (!selfPlacementEnabled) {
    return { tiltsAllowed: false, gateReason };
  }

  const allAcknowledged = redLights.every((l) => selfPlacement.responses[l]?.stance === 'HOLD_DELIBERATE');
  return { tiltsAllowed: allAcknowledged, gateReason };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run client/src/lib/tiltsGate.test.ts`
Expected: PASS (9 tests)

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/tiltsGate.ts client/src/lib/tiltsGate.test.ts
git commit -m "feat(gate): extract computeTiltsGate with flag-gated self-placement override"
```

---

### Task 5: Wire the shared gate into the store

**Files:**
- Modify: `client/src/state/onboardingV2Store.ts:900-932` (`setAnalysisResult`)
- Modify: `client/src/state/onboardingV2Store.ts:992-1012` (`computeBeliefsScores`)

- [ ] **Step 1: Add the imports**

At the top of `onboardingV2Store.ts`, alongside the other local imports:

```typescript
import { computeTiltsGate } from '../lib/tiltsGate';
import { SAFETY_LIGHT_ACKNOWLEDGMENT_ENABLED } from '../lib/featureFlags';
```

- [ ] **Step 2: Replace the duplicated logic in `setAnalysisResult`**

Replace:

```typescript
        // Immediately compute beliefs gate status from new safety lights
        const safetyLights = result?.safety_lights;
        if (safetyLights) {
          let tiltsAllowed = true;
          let gateReason: TiltsGateReason = 'NO_RED_FLAGS';
          const redFlags: string[] = [];
          if (safetyLights.liquidity === 'RED') redFlags.push('RED_LIQUIDITY');
          if (safetyLights.concentration === 'RED') redFlags.push('RED_CONCENTRATION');
          if (safetyLights.illiquids === 'RED') redFlags.push('RED_ILLIQUIDS');
          if (redFlags.length >= 2) {
            tiltsAllowed = false;
            gateReason = 'MULTIPLE_RED_FLAGS';
          } else if (redFlags.length === 1) {
            tiltsAllowed = false;
            gateReason = redFlags[0] as TiltsGateReason;
          }
          set((state) => ({
            beliefs: {
              ...state.beliefs,
              tilts_allowed: tiltsAllowed,
              tilts_gate_reason: gateReason,
            },
          }));
        }
```

with:

```typescript
        // Immediately compute beliefs gate status from new safety lights
        const safetyLights = result?.safety_lights;
        if (safetyLights) {
          const { tiltsAllowed, gateReason } = computeTiltsGate(
            safetyLights,
            get().safetyLightResponse,
            SAFETY_LIGHT_ACKNOWLEDGMENT_ENABLED,
          );
          set((state) => ({
            beliefs: {
              ...state.beliefs,
              tilts_allowed: tiltsAllowed,
              tilts_gate_reason: gateReason,
            },
          }));
        }
```

- [ ] **Step 3: Replace the duplicated logic in `computeBeliefsScores`**

Replace:

```typescript
        // Compute tilts_allowed and gate_reason from safety lights
        let tiltsAllowed = true;
        let gateReason: TiltsGateReason = 'NO_RED_FLAGS';
        if (safetyLights) {
          const redFlags: string[] = [];
          if (safetyLights.liquidity === 'RED') redFlags.push('RED_LIQUIDITY');
          if (safetyLights.concentration === 'RED') redFlags.push('RED_CONCENTRATION');
          if (safetyLights.illiquids === 'RED') redFlags.push('RED_ILLIQUIDS');
          if (redFlags.length >= 2) {
            tiltsAllowed = false;
            gateReason = 'MULTIPLE_RED_FLAGS';
          } else if (redFlags.length === 1) {
            tiltsAllowed = false;
            gateReason = redFlags[0] as TiltsGateReason;
          }
        }
```

with:

```typescript
        // Compute tilts_allowed and gate_reason from safety lights
        let tiltsAllowed = true;
        let gateReason: TiltsGateReason = 'NO_RED_FLAGS';
        if (safetyLights) {
          const gate = computeTiltsGate(safetyLights, state.safetyLightResponse, SAFETY_LIGHT_ACKNOWLEDGMENT_ENABLED);
          tiltsAllowed = gate.tiltsAllowed;
          gateReason = gate.gateReason;
        }
```

(Note: `computeBeliefsScores` already has a `state` variable in scope from `const state = get();` at the top of the function — no new `get()` call needed here, unlike Step 2.)

- [ ] **Step 4: Run the full suite**

Run: `npm test`
Expected: all tests green, including the pre-existing `tests/onboardingV2.test.ts` RED-scenario tests (flag defaults off, so behavior is unchanged) and the new `tiltsGate.test.ts`/`safetyLightResponse.test.ts` suites.

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit 2>&1 | wc -l`
Expected: no increase versus the pre-existing baseline count (check current baseline first with `git stash && npx tsc --noEmit 2>&1 | wc -l && git stash pop` if unsure).

- [ ] **Step 6: Commit**

```bash
git add client/src/state/onboardingV2Store.ts
git commit -m "refactor(state): wire computeTiltsGate into both gate-computation call sites"
```

---

### Task 6: Self-placement UI component

**Files:**
- Create: `client/src/components/onboarding-v2/SafetyLightAcknowledgment.tsx`

- [ ] **Step 1: Write the component**

```tsx
// client/src/components/onboarding-v2/SafetyLightAcknowledgment.tsx
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { SAFETY_LIGHT_PERSPECTIVES, type SafetyLightType } from '@/data/safetyLightPerspectives';
import { useOnboardingV2Store, type SafetyLightStance } from '@/state/onboardingV2Store';

const LIGHT_LABEL: Record<SafetyLightType, string> = {
  liquidity: 'Liquidity',
  concentration: 'Concentration',
  illiquids: 'Illiquid exposure',
};

const STANCE_LABEL: Record<SafetyLightStance, string> = {
  REDUCE: 'Closer to reduce this',
  HOLD_DELIBERATE: 'Closer to hold this as-is',
  UNSURE: 'Not sure yet',
};

function PerspectiveCard({ title, valuePoints, tradeOff }: { title: string; valuePoints: string[]; tradeOff: string }) {
  return (
    <div className="flex-1 p-4 rounded-xl border border-[var(--border)] bg-white dark:bg-slate-800/60">
      <h5 className="text-sm font-semibold text-[var(--foreground)] mb-2">{title}</h5>
      <ul className="space-y-1.5 mb-3">
        {valuePoints.map((point, i) => (
          <li key={i} className="text-xs text-[var(--foreground)] leading-relaxed">{point}</li>
        ))}
      </ul>
      <p className="text-xs text-[var(--muted-foreground)] italic leading-relaxed">Trade-off: {tradeOff}</p>
    </div>
  );
}

export default function SafetyLightAcknowledgment({ light }: { light: SafetyLightType }) {
  const [expanded, setExpanded] = useState(false);
  const stance = useOnboardingV2Store((s) => s.safetyLightResponse.responses[light]?.stance);
  const setSafetyLightResponse = useOnboardingV2Store((s) => s.setSafetyLightResponse);
  const perspectives = SAFETY_LIGHT_PERSPECTIVES[light];

  return (
    <div className="p-5 rounded-2xl border border-[var(--border)] bg-slate-50 dark:bg-slate-900/40" data-testid={`safety-light-acknowledgment-${light}`}>
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center justify-between w-full text-left"
        data-testid={`safety-light-acknowledgment-toggle-${light}`}
      >
        <span className="text-sm font-semibold text-[var(--foreground)]">
          {LIGHT_LABEL[light]} is flagged — how does this fit your situation?
        </span>
        {expanded ? <ChevronUp className="w-4 h-4 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 flex-shrink-0" />}
      </button>

      {expanded && (
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <PerspectiveCard
            title="Considerations for reducing this"
            valuePoints={perspectives.REDUCE.valuePoints}
            tradeOff={perspectives.REDUCE.tradeOff}
          />
          <PerspectiveCard
            title="Considerations for holding this as-is"
            valuePoints={perspectives.HOLD_DELIBERATE.valuePoints}
            tradeOff={perspectives.HOLD_DELIBERATE.tradeOff}
          />
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {(['REDUCE', 'HOLD_DELIBERATE', 'UNSURE'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSafetyLightResponse(light, s)}
            data-testid={`safety-light-acknowledgment-stance-${light}-${s}`}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              stance === s
                ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                : 'bg-white dark:bg-slate-800 text-[var(--foreground)] border-[var(--border)] hover:border-[var(--primary)]'
            }`}
          >
            {STANCE_LABEL[s]}
          </button>
        ))}
      </div>

      {stance && (
        <p className="mt-3 text-xs text-[var(--muted-foreground)]" data-testid={`safety-light-acknowledgment-recorded-${light}`}>
          Recorded: {STANCE_LABEL[stance]}.{' '}
          {stance === 'HOLD_DELIBERATE'
            ? 'Preference signals for this area are unlocked based on what you told us.'
            : 'Preference signals for this area stay locked until this is addressed or you tell us it’s a deliberate choice.'}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/components/onboarding-v2/SafetyLightAcknowledgment.tsx
git commit -m "feat(ui): SafetyLightAcknowledgment component (flag-gated, not yet wired)"
```

---

### Task 7: Wire the component into Analysis.tsx

**Files:**
- Modify: `client/src/pages/onboarding-v2/Analysis.tsx`

- [ ] **Step 1: Add the imports**

Near the top of `Analysis.tsx`, alongside the other component imports:

```typescript
import SafetyLightAcknowledgment from '@/components/onboarding-v2/SafetyLightAcknowledgment';
import { SAFETY_LIGHT_ACKNOWLEDGMENT_ENABLED } from '@/lib/featureFlags';
import type { SafetyLightType } from '@/state/onboardingV2Store';
```

- [ ] **Step 2: Render one card per RED light, immediately after the existing Tilts Banner**

The Tilts Banner block is at lines 500-535 (already destructured `liquidity`, `concentration`, `illiquids`, `tilts_allowed` at line 276). Immediately after that banner's closing tag, add:

```tsx
        {SAFETY_LIGHT_ACKNOWLEDGMENT_ENABLED && (['liquidity', 'concentration', 'illiquids'] as SafetyLightType[])
          .filter((light) => ({ liquidity, concentration, illiquids }[light] === 'RED'))
          .map((light) => (
            <div key={light} className="mt-4">
              <SafetyLightAcknowledgment light={light} />
            </div>
          ))}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit 2>&1 | grep -i Analysis.tsx`
Expected: no new errors referencing this file.

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/onboarding-v2/Analysis.tsx
git commit -m "feat(onboarding): render SafetyLightAcknowledgment per RED light on Analysis (flag-gated)"
```

---

### Task 8: Persist self-placement responses

**Files:**
- Modify: `client/src/lib/onboardingSync.ts`

- [ ] **Step 1: Add the new slice to `DATA_KEYS`**

Find the `DATA_KEYS` constant (line 19: `['intake', 'holdings', 'summary', 'analysis', 'beliefs', 'outlook', 'scenario']`). Change it to:

```typescript
const DATA_KEYS = ['intake', 'holdings', 'summary', 'analysis', 'beliefs', 'outlook', 'scenario', 'safetyLightResponse'] as const;
```

- [ ] **Step 2: Verify no other code assumes a fixed-length DATA_KEYS**

Run: `grep -n "DATA_KEYS" client/src/lib/onboardingSync.ts`
Expected: `DATA_KEYS` is only used to build the snapshot object generically (e.g. `Object.fromEntries(DATA_KEYS.map(...))` or similar spread) — if it is, no further change is needed since the new key is picked up automatically. If any code destructures `DATA_KEYS` by fixed index/length, update it to be robust to the new 8th entry.

- [ ] **Step 3: Run the full suite**

Run: `npm test`
Expected: all tests green — this is a persistence-list change only, no computation logic touched.

- [ ] **Step 4: Commit**

```bash
git add client/src/lib/onboardingSync.ts
git commit -m "fix(sync): persist safetyLightResponse in the session snapshot"
```

---

### Task 9: Browser verification

**Files:** none (manual verification task)

- [ ] **Step 1: Start the dev server with the flag enabled**

Run with `VITE_SAFETY_LIGHT_ACKNOWLEDGMENT=1` set in the environment before `npm run dev` (or add it to a local `.env` file, not committed).

- [ ] **Step 2: Verify flag-off is unchanged (regression check)**

With the flag NOT set, seed a RED-concentration scenario (via the existing demo-mode script or manual Holdings entry) and confirm: no `SafetyLightAcknowledgment` card renders on Analysis; the Tilts Banner and Beliefs.tsx lock badge behave exactly as before.

- [ ] **Step 3: Verify flag-on behavior**

With the flag set, seed the same RED-concentration scenario:
- Confirm a `SafetyLightAcknowledgment` card renders for "Concentration" only (not liquidity/illiquids, which are GREEN).
- Click to expand — confirm both perspective cards render with their value points and trade-off.
- Click "Closer to hold this as-is" — confirm the "Recorded:" line appears, confirm `beliefs.tilts_allowed` becomes `true` (check the Tilts Banner flips to "Preference Signals Enabled" and the Beliefs.tsx lock badge disappears).
- Reload the page — confirm the self-placement persists (Task 8's persistence).
- Click "Closer to reduce this" instead — confirm tilts stay locked.

- [ ] **Step 4: Verify multi-light composition**

Seed a scenario with both liquidity and concentration RED. Confirm tilts stay locked until BOTH are self-placed as "Closer to hold this as-is" — self-placing only one should leave tilts locked (per Task 4's `MULTIPLE_RED_FLAGS` composition test).

---

### Task 10: Update the explainer content and whitepaper to describe the built mechanism

**Files:**
- Modify: `server/content/explainerTopics.ts` (`safety-lights` and `known-limitations` topics)

Per Tom's instruction: the whitepaper reflects what is actually built, not the reverse. Do this task last, after Tasks 1-9 are verified working.

- [ ] **Step 1: Update the `safety-lights` topic's prose**

In `server/content/explainerTopics.ts`, find the `safety-lights` topic (`id: 'safety-lights'`). Add a new paragraph to its `prose` array, after the existing threshold-table description:

```typescript
          'A RED overall status also offers the investor a self-placement option (flag-gated, not yet live to any investor besides internal testing): for each flagged light, two short, deliberately balanced descriptions are shown — one for investors who would prioritise reducing that exposure, one for investors who are comfortable holding it deliberately — and the investor picks whichever is closer to their own reasoning, or stays unsure. Only an explicit "closer to hold this as-is" placement unlocks belief-driven tilts for that specific flagged area; the system never infers this from wealth, holdings size, or any other proxy.',
```

- [ ] **Step 2: Update the `known-limitations` topic's prose**

Find the `known-limitations` topic. The existing prose paragraph currently ends with the CAPITAL_PRESERVATION/PS25/22 sentence. Add:

```typescript
          'The RED-status self-placement mechanism (see Safety Lights) is built but flag-dark: it is off for every investor except internal testing pending sign-off from Werner, Tony Vine-Lott, and compliance counsel, per Intelligence/decisions/2026-07-04-belief-tilt-red-gate-softening-V1.md in the internal vault.',
```

- [ ] **Step 3: Run the explainer's own tests**

Run: `npx vitest run tests/explainerContent.test.ts tests/explainerTopics.test.ts`
Expected: PASS — these tests check structural properties (non-empty prose, sequencing), not exact wording, so adding a sentence should not break them. If a test asserts an exact prose array length, update it to match.

- [ ] **Step 4: Commit**

```bash
git add server/content/explainerTopics.ts
git commit -m "docs(explainer): describe the flag-dark safety-light self-placement mechanism"
```

---

## Explicitly deferred (not in this plan)

- **Server-side/audit-log persistence of self-placement beyond the existing session-state blob**: the decision doc calls for a durable audit trail; today's `state` JSON blob on the session record already captures it (Task 8), but a dedicated, queryable audit table is a larger data-model change appropriate for a follow-up once compliance reviews the mechanism, not before.
- **Turning the flag on for any real investor**: explicitly gated on Werner/Vine-Lott/Corke sign-off per the decision doc. This plan only covers building and flag-dark-verifying the mechanism.
- **Route-level or server-side enforcement of the flag** (i.e. preventing a determined client from setting `VITE_SAFETY_LIGHT_ACKNOWLEDGMENT=1` themselves): out of scope — this mirrors the existing `VITE_SCENARIO_DELTA` pattern's own trust model (a build-time env var, not a runtime access-control boundary), consistent with this being an internal/demo-controlled flag rather than a per-investor entitlement.
