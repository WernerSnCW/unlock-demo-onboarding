# V2 Scenario-Stress Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an honest, deterministic portfolio-stress lens to the Onboarding-v2 flow (real holdings × a scenario library → illustrative conditional impact with a range), and retire the flawed legacy wizard.

**Architecture:** Three pure, independently-tested units — a typed scenario **library**, a pure **stress engine**, and a pure **salience+view** layer — plus a thin presentational React section wired into the v2 Analysis screen. No Monte Carlo, no probabilities, no `tiltGate` coupling. The legacy `InvestorPreferencesWizard` path (sole carrier of the five reviewed flaws) is deleted, grep-gated.

**Tech Stack:** TypeScript, React (wouter routing), Zustand store, Vitest (`vitest.config.server.ts`, node env, includes `tests/**/*.test.ts`).

**Design source:** `docs/superpowers/specs/2026-06-23-v2-scenario-stress-engine-design.md`

---

## Test infrastructure note (read once)

- `npm test` → `vitest run --config vitest.config.server.ts`, which includes **only `tests/**/*.test.ts`** (node env). The co-located `client/src/lib/*.test.ts` files are **not** run by `npm test`.
- Therefore: **all new tests in this plan live in `tests/`** and import the engine via **relative paths** (`../client/src/lib/...`).
- The engine, library, salience, and view files use **type-only imports** for any store type (`import type { AxisCode }`), so no React/Zustand is loaded at test runtime.
- Run a single test file: `npx vitest run --config vitest.config.server.ts tests/<file>.test.ts`

---

## File structure

| File | Responsibility | New/Modify |
|---|---|---|
| `client/src/data/stressScenarios.ts` | Typed scenario library + initial illustrative shocks (v2 `asset_class × region` taxonomy) | Create |
| `client/src/lib/scenarioStress.ts` | Pure engine: holdings × scenarios → impact results | Create |
| `client/src/lib/scenarioStressSalience.ts` | Pure: order results so belief-relevant scenarios surface first | Create |
| `client/src/lib/scenarioStressView.ts` | Pure: build compliance-safe display strings | Create |
| `client/src/components/onboarding-v2/ScenarioStressSection.tsx` | Thin presentational section (reads store, calls the pure units) | Create |
| `client/src/pages/onboarding-v2/Analysis.tsx` | Insert the section; reflective-mirror persona copy | Modify |
| `client/src/App.tsx` | Remove legacy wizard routes + imports | Modify |
| `client/src/pages/PortfolioAnalysis.tsx`, `client/src/pages/AdviceGap.tsx` | Re-point legacy links to `/onboarding-v2/welcome` | Modify |
| `tests/stressScenarios.test.ts`, `tests/scenarioStress.test.ts`, `tests/scenarioStressSalience.test.ts`, `tests/scenarioStressView.test.ts` | Tests | Create |
| Legacy modules (wizard, cosine, flawed engine/config) | Deleted (grep-gated) | Delete |

---

## Task 1: Scenario library (data contract + initial illustrative shocks)

**Files:**
- Create: `client/src/data/stressScenarios.ts`
- Test: `tests/stressScenarios.test.ts`

- [ ] **Step 1: Write the failing validation test**

```ts
// tests/stressScenarios.test.ts
import { describe, it, expect } from 'vitest';
import { STRESS_SCENARIOS, type StressScenario } from '../client/src/data/stressScenarios';

const VALID_AXES = [
  'QUALITY_TILT','VALUE_TILT','TECH_TILT','UK_BIAS','ESG_TILT',
  'INFLATION_HEDGE_TILT','SMALL_CAP_TILT','VOLATILITY_AVERSION',
];
const BANNED_VERBS = ['should','must','buy','sell','optimise','optimize','improve','save'];

describe('STRESS_SCENARIOS library', () => {
  it('has at least 4 scenarios with unique ids', () => {
    expect(STRESS_SCENARIOS.length).toBeGreaterThanOrEqual(4);
    const ids = STRESS_SCENARIOS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every scenario is structurally complete and compliance-safe', () => {
    STRESS_SCENARIOS.forEach((s: StressScenario) => {
      expect(s.name.length).toBeGreaterThan(0);
      expect(s.blurb.length).toBeGreaterThan(0);
      expect(s.historicalAnchor.length).toBeGreaterThan(0);
      expect(s.severityRange.mildMultiplier).toBeLessThan(s.severityRange.severeMultiplier);
      const text = `${s.name} ${s.blurb}`.toLowerCase();
      BANNED_VERBS.forEach((v) => expect(new RegExp(`\\b${v}\\b`).test(text)).toBe(false));
      s.beliefSalience.forEach((axis) => expect(VALID_AXES).toContain(axis));
    });
  });

  it('every shock value is a signed decimal in [-1, 1]', () => {
    STRESS_SCENARIOS.forEach((s) => {
      Object.values(s.shocks).forEach((byRegion) =>
        Object.values(byRegion).forEach((v) => {
          expect(v).toBeGreaterThanOrEqual(-1);
          expect(v).toBeLessThanOrEqual(1);
        }),
      );
      Object.values(s.defaultShockByAssetClass).forEach((v) => {
        expect(v).toBeGreaterThanOrEqual(-1);
        expect(v).toBeLessThanOrEqual(1);
      });
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run --config vitest.config.server.ts tests/stressScenarios.test.ts`
Expected: FAIL — `Cannot find module '../client/src/data/stressScenarios'`.

- [ ] **Step 3: Create the library**

```ts
// client/src/data/stressScenarios.ts
import type { AxisCode } from '../state/onboardingV2Store';

/**
 * Deterministic stress-scenario library for the Onboarding-v2 stress lens.
 * Shocks are ILLUSTRATIVE, loosely anchored to historical episodes, and labelled
 * as such on screen. Keys use v2's own taxonomy: asset_class and region are the
 * lowercase string values stored on Holding (e.g. 'equity', 'global').
 * Historical calibration of these numbers is a separate, non-blocking research task.
 */
export interface StressScenario {
  id: string;
  name: string;
  blurb: string;
  historicalAnchor: string;
  /** shocks[asset_class][region] -> signed decimal move, e.g. -0.25 = −25% */
  shocks: Record<string, Record<string, number>>;
  /** fallback when a holding's region is not in `shocks[asset_class]` */
  defaultShockByAssetClass: Record<string, number>;
  /** multipliers applied to the central impact to express a transparent range */
  severityRange: { mildMultiplier: number; severeMultiplier: number };
  /** belief axes whose stated concern surfaces this scenario first (salience only) */
  beliefSalience: AxisCode[];
}

const RANGE = { mildMultiplier: 0.7, severeMultiplier: 1.4 };

export const STRESS_SCENARIOS: StressScenario[] = [
  {
    id: 'EQUITY_DRAWDOWN',
    name: 'Global equity drawdown',
    blurb: 'A broad fall in global share prices, with riskier regions falling furthest and high-quality bonds holding up.',
    historicalAnchor: 'Illustrative — scale of the 2008 and 2020 equity selloffs',
    shocks: {
      equity: { global: -0.30, us: -0.32, uk: -0.28, europe: -0.30, emerging: -0.38, other: -0.30 },
      bond: { global: 0.02, uk: 0.02 },
      property: { uk: -0.10, global: -0.10 },
      alternatives: { global: -0.15 },
    },
    defaultShockByAssetClass: { equity: -0.30, bond: 0.0, property: -0.10, alternatives: -0.15, cash: 0.0, other: -0.10 },
    severityRange: RANGE,
    beliefSalience: ['VOLATILITY_AVERSION'],
  },
  {
    id: 'RATE_INFLATION_SHOCK',
    name: 'Rates & inflation shock',
    blurb: 'A jump in interest rates and inflation that weighs on both shares and bonds at the same time.',
    historicalAnchor: 'Illustrative — scale of the 2022 rate/inflation repricing',
    shocks: {
      equity: { global: -0.15, us: -0.16, uk: -0.12, europe: -0.15, emerging: -0.18, other: -0.15 },
      bond: { global: -0.15, uk: -0.15 },
      property: { uk: -0.12, global: -0.12 },
      alternatives: { global: -0.05 },
    },
    defaultShockByAssetClass: { equity: -0.15, bond: -0.15, property: -0.12, alternatives: -0.05, cash: 0.0, other: -0.08 },
    severityRange: RANGE,
    beliefSalience: ['INFLATION_HEDGE_TILT'],
  },
  {
    id: 'TECH_CORRECTION',
    name: 'Technology correction',
    blurb: 'A sharp repricing of technology and growth shares, felt most in US-heavy and tech-tilted portfolios.',
    historicalAnchor: 'Illustrative — scale of the 2000 and 2022 tech corrections',
    shocks: {
      equity: { us: -0.25, global: -0.18, uk: -0.08, europe: -0.12, emerging: -0.20, other: -0.18 },
      alternatives: { global: -0.10 },
      property: { uk: -0.05, global: -0.05 },
    },
    defaultShockByAssetClass: { equity: -0.18, bond: 0.0, property: -0.05, alternatives: -0.10, cash: 0.0, other: -0.08 },
    severityRange: RANGE,
    beliefSalience: ['TECH_TILT'],
  },
  {
    id: 'PROPERTY_DOWNTURN',
    name: 'Property downturn',
    blurb: 'A fall in property values, concentrated in UK residential and commercial holdings.',
    historicalAnchor: 'Illustrative — scale of the early-1990s and 2008 UK property falls',
    shocks: {
      property: { uk: -0.25, global: -0.18, other: -0.20 },
      equity: { uk: -0.08, global: -0.06 },
      alternatives: { global: -0.08 },
    },
    defaultShockByAssetClass: { property: -0.22, equity: -0.06, bond: 0.0, alternatives: -0.08, cash: 0.0, other: -0.10 },
    severityRange: RANGE,
    beliefSalience: [],
  },
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run --config vitest.config.server.ts tests/stressScenarios.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add client/src/data/stressScenarios.ts tests/stressScenarios.test.ts
git commit -m "feat(v2-stress): add scenario library with validated illustrative shocks"
```

---

## Task 2: Stress engine (pure)

**Files:**
- Create: `client/src/lib/scenarioStress.ts`
- Test: `tests/scenarioStress.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// tests/scenarioStress.test.ts
import { describe, it, expect } from 'vitest';
import { computeScenarioStress, shockFor, type StressHolding } from '../client/src/lib/scenarioStress';
import type { StressScenario } from '../client/src/data/stressScenarios';

const SCN: StressScenario = {
  id: 'TEST',
  name: 'Test',
  blurb: 'test',
  historicalAnchor: 'test',
  shocks: { equity: { global: -0.25, us: -0.40 }, bond: { global: 0.05 } },
  defaultShockByAssetClass: { equity: -0.20, bond: 0.0, cash: 0.0 },
  severityRange: { mildMultiplier: 0.7, severeMultiplier: 1.4 },
  beliefSalience: [],
};

function holding(over: Partial<StressHolding>): StressHolding {
  return { instrument_name: 'X', asset_class: 'equity', region: 'global', value_gbp: 100000, ...over };
}

describe('shockFor', () => {
  it('matches asset_class + region (case-insensitive)', () => {
    expect(shockFor(SCN, 'Equity', 'US')).toBe(-0.40);
  });
  it('falls back to defaultShockByAssetClass when region is absent', () => {
    expect(shockFor(SCN, 'equity', 'mars')).toBe(-0.20);
  });
  it('returns 0 when asset_class is unmapped and has no default', () => {
    expect(shockFor(SCN, 'collectibles', 'uk')).toBe(0);
  });
});

describe('computeScenarioStress', () => {
  it('returns zero impact and no NaN for empty holdings', () => {
    const [r] = computeScenarioStress([], [SCN]);
    expect(r.centralImpactGbp).toBe(0);
    expect(r.centralImpactPct).toBe(0);
    expect(Number.isNaN(r.centralImpactPct)).toBe(false);
    expect(r.topContributors).toEqual([]);
  });

  it('applies the matched shock to a single holding', () => {
    const [r] = computeScenarioStress([holding({ value_gbp: 100000 })], [SCN]);
    expect(r.centralImpactGbp).toBe(-25000);
    expect(r.centralImpactPct).toBeCloseTo(-0.25, 10);
  });

  it('value-weights across buckets (golden)', () => {
    const holdings = [
      holding({ instrument_name: 'A', asset_class: 'equity', region: 'us', value_gbp: 50000 }),    // -0.40 -> -20000
      holding({ instrument_name: 'B', asset_class: 'equity', region: 'global', value_gbp: 30000 }), // -0.25 -> -7500
      holding({ instrument_name: 'C', asset_class: 'bond', region: 'global', value_gbp: 20000 }),   // +0.05 -> +1000
    ];
    const [r] = computeScenarioStress(holdings, [SCN]);
    expect(r.centralImpactGbp).toBe(-26500);           // -20000 -7500 +1000
    expect(r.centralImpactPct).toBeCloseTo(-0.265, 10); // / 100000
  });

  it('derives a transparent range from the multipliers', () => {
    const [r] = computeScenarioStress([holding({ value_gbp: 100000 })], [SCN]);
    expect(r.rangePct.mild).toBeCloseTo(-0.175, 10);  // -0.25 * 0.7
    expect(r.rangePct.severe).toBeCloseTo(-0.35, 10);  // -0.25 * 1.4
  });

  it('ranks top contributors by absolute £ impact, top 3', () => {
    const holdings = [
      holding({ instrument_name: 'big', asset_class: 'equity', region: 'us', value_gbp: 50000 }),
      holding({ instrument_name: 'mid', asset_class: 'equity', region: 'global', value_gbp: 30000 }),
      holding({ instrument_name: 'small', asset_class: 'equity', region: 'global', value_gbp: 1000 }),
      holding({ instrument_name: 'flat', asset_class: 'cash', region: 'uk', value_gbp: 9000 }),
    ];
    const [r] = computeScenarioStress(holdings, [SCN]);
    expect(r.topContributors.map((c) => c.label)).toEqual(['big', 'mid', 'small']);
    expect(r.topContributors[0].pctOfLoss).toBeGreaterThan(r.topContributors[1].pctOfLoss);
  });

  it('ignores non-positive holdings', () => {
    const [r] = computeScenarioStress([holding({ value_gbp: 0 }), holding({ value_gbp: -5 })], [SCN]);
    expect(r.centralImpactGbp).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run --config vitest.config.server.ts tests/scenarioStress.test.ts`
Expected: FAIL — `Cannot find module '../client/src/lib/scenarioStress'`.

- [ ] **Step 3: Implement the engine**

```ts
// client/src/lib/scenarioStress.ts
import type { StressScenario } from '../data/stressScenarios';

/** Minimal holdings shape the engine needs — decoupled from the store's Holding. */
export interface StressHolding {
  instrument_name: string;
  asset_class: string;
  region: string;
  value_gbp: number;
}

export interface StressContributor {
  label: string;
  impactGbp: number;
  /** signed share of the central impact, 0..1 (0 when central impact is 0) */
  pctOfLoss: number;
}

export interface ScenarioStressResult {
  scenarioId: string;
  centralImpactGbp: number;
  centralImpactPct: number;            // decimal, e.g. -0.18
  rangeGbp: { mild: number; severe: number };
  rangePct: { mild: number; severe: number };
  topContributors: StressContributor[];
}

/** Look up the shock for an (asset_class, region) pair, case-insensitive, with fallback. */
export function shockFor(scenario: StressScenario, assetClass: string, region: string): number {
  const ac = assetClass.toLowerCase();
  const rg = region.toLowerCase();
  const byRegion = scenario.shocks[ac];
  if (byRegion && typeof byRegion[rg] === 'number') return byRegion[rg];
  const dflt = scenario.defaultShockByAssetClass[ac];
  return typeof dflt === 'number' ? dflt : 0;
}

export function computeScenarioStress(
  holdings: StressHolding[],
  scenarios: StressScenario[],
): ScenarioStressResult[] {
  const valid = holdings.filter((h) => h.value_gbp > 0);
  const total = valid.reduce((sum, h) => sum + h.value_gbp, 0);

  return scenarios.map((scenario) => {
    const perHolding = valid.map((h) => ({
      label: h.instrument_name,
      impactGbp: h.value_gbp * shockFor(scenario, h.asset_class, h.region),
    }));
    const centralImpactGbp = perHolding.reduce((sum, c) => sum + c.impactGbp, 0);
    const centralImpactPct = total > 0 ? centralImpactGbp / total : 0;
    const { mildMultiplier, severeMultiplier } = scenario.severityRange;

    const topContributors: StressContributor[] = perHolding
      .filter((c) => c.impactGbp !== 0)
      .sort((a, b) => Math.abs(b.impactGbp) - Math.abs(a.impactGbp))
      .slice(0, 3)
      .map((c) => ({
        label: c.label,
        impactGbp: c.impactGbp,
        pctOfLoss: centralImpactGbp !== 0 ? c.impactGbp / centralImpactGbp : 0,
      }));

    return {
      scenarioId: scenario.id,
      centralImpactGbp,
      centralImpactPct,
      rangeGbp: { mild: centralImpactGbp * mildMultiplier, severe: centralImpactGbp * severeMultiplier },
      rangePct: { mild: centralImpactPct * mildMultiplier, severe: centralImpactPct * severeMultiplier },
      topContributors,
    };
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run --config vitest.config.server.ts tests/scenarioStress.test.ts`
Expected: PASS (all tests in the file).

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/scenarioStress.ts tests/scenarioStress.test.ts
git commit -m "feat(v2-stress): add pure deterministic stress engine"
```

---

## Task 3: Belief-salience ordering (pure)

**Files:**
- Create: `client/src/lib/scenarioStressSalience.ts`
- Test: `tests/scenarioStressSalience.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// tests/scenarioStressSalience.test.ts
import { describe, it, expect } from 'vitest';
import { orderBySalience, isSalient } from '../client/src/lib/scenarioStressSalience';
import { STRESS_SCENARIOS } from '../client/src/data/stressScenarios';
import type { ScenarioStressResult } from '../client/src/lib/scenarioStress';

function resultFor(id: string): ScenarioStressResult {
  return {
    scenarioId: id, centralImpactGbp: -1, centralImpactPct: -0.1,
    rangeGbp: { mild: 0, severe: 0 }, rangePct: { mild: 0, severe: 0 }, topContributors: [],
  };
}
const results = STRESS_SCENARIOS.map((s) => resultFor(s.id));

describe('isSalient', () => {
  it('is true when a beliefSalience axis has a TOWARDS-strength score (> 0.2)', () => {
    const inflation = STRESS_SCENARIOS.find((s) => s.id === 'RATE_INFLATION_SHOCK')!;
    expect(isSalient(inflation, { axisScores: { INFLATION_HEDGE_TILT: 0.8 } })).toBe(true);
  });
  it('is false when the axis score is below the 0.2 threshold', () => {
    const inflation = STRESS_SCENARIOS.find((s) => s.id === 'RATE_INFLATION_SHOCK')!;
    expect(isSalient(inflation, { axisScores: { INFLATION_HEDGE_TILT: 0.1 } })).toBe(false);
  });
});

describe('orderBySalience', () => {
  it('surfaces the belief-relevant scenario first without dropping any', () => {
    const ordered = orderBySalience(results, STRESS_SCENARIOS, { axisScores: { INFLATION_HEDGE_TILT: 0.9 } });
    expect(ordered[0].scenarioId).toBe('RATE_INFLATION_SHOCK');
    expect(ordered.length).toBe(results.length);
    expect(new Set(ordered.map((r) => r.scenarioId)).size).toBe(results.length);
  });
  it('preserves original order when no concern is salient', () => {
    const ordered = orderBySalience(results, STRESS_SCENARIOS, { axisScores: {} });
    expect(ordered.map((r) => r.scenarioId)).toEqual(results.map((r) => r.scenarioId));
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run --config vitest.config.server.ts tests/scenarioStressSalience.test.ts`
Expected: FAIL — `Cannot find module '../client/src/lib/scenarioStressSalience'`.

- [ ] **Step 3: Implement salience ordering**

```ts
// client/src/lib/scenarioStressSalience.ts
import type { AxisCode } from '../state/onboardingV2Store';
import type { StressScenario } from '../data/stressScenarios';
import type { ScenarioStressResult } from './scenarioStress';

export interface SalienceInput {
  axisScores: Partial<Record<AxisCode, number>>;
}

/** Threshold matches the store's TOWARDS direction cutoff (score > 0.20). */
const TOWARDS_THRESHOLD = 0.2;

export function isSalient(scenario: StressScenario, input: SalienceInput): boolean {
  return scenario.beliefSalience.some((axis) => (input.axisScores[axis] ?? 0) > TOWARDS_THRESHOLD);
}

/** Stable partition: salient scenarios first, original order preserved within each group. No scenario is dropped. */
export function orderBySalience(
  results: ScenarioStressResult[],
  scenarios: StressScenario[],
  input: SalienceInput,
): ScenarioStressResult[] {
  const byId = new Map(scenarios.map((s) => [s.id, s]));
  const salient: ScenarioStressResult[] = [];
  const rest: ScenarioStressResult[] = [];
  for (const r of results) {
    const scenario = byId.get(r.scenarioId);
    if (scenario && isSalient(scenario, input)) salient.push(r);
    else rest.push(r);
  }
  return [...salient, ...rest];
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run --config vitest.config.server.ts tests/scenarioStressSalience.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/scenarioStressSalience.ts tests/scenarioStressSalience.test.ts
git commit -m "feat(v2-stress): add belief-salience ordering"
```

---

## Task 4: Compliance-safe view strings (pure)

**Files:**
- Create: `client/src/lib/scenarioStressView.ts`
- Test: `tests/scenarioStressView.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// tests/scenarioStressView.test.ts
import { describe, it, expect } from 'vitest';
import { buildStressNarrative } from '../client/src/lib/scenarioStressView';
import { STRESS_SCENARIOS } from '../client/src/data/stressScenarios';
import type { ScenarioStressResult } from '../client/src/lib/scenarioStress';

const BANNED_VERBS = ['should','must','buy','sell','optimise','optimize','improve','save'];
const result: ScenarioStressResult = {
  scenarioId: 'EQUITY_DRAWDOWN',
  centralImpactGbp: -180000,
  centralImpactPct: -0.18,
  rangeGbp: { mild: -126000, severe: -252000 },
  rangePct: { mild: -0.126, severe: -0.252 },
  topContributors: [{ label: 'Tech Fund', impactGbp: -120000, pctOfLoss: 0.667 }],
};
const scenario = STRESS_SCENARIOS.find((s) => s.id === 'EQUITY_DRAWDOWN')!;

describe('buildStressNarrative', () => {
  it('renders a signed, conditional, illustrative headline with the range', () => {
    const n = buildStressNarrative(result, scenario);
    expect(n.headline).toContain('18%');
    expect(n.headline).toContain('13%');  // 0.126 rounded
    expect(n.headline).toContain('25%');  // 0.252 rounded
    expect(n.title).toBe(scenario.name);
    expect(n.anchor).toContain('Illustrative');
  });
  it('lists top contributors with their share of the move', () => {
    const n = buildStressNarrative(result, scenario);
    expect(n.contributors[0]).toContain('Tech Fund');
    expect(n.contributors[0]).toContain('67%');
  });
  it('contains no advice verbs anywhere', () => {
    const n = buildStressNarrative(result, scenario);
    const text = `${n.title} ${n.blurb} ${n.headline} ${n.contributors.join(' ')}`.toLowerCase();
    BANNED_VERBS.forEach((v) => expect(new RegExp(`\\b${v}\\b`).test(text)).toBe(false));
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run --config vitest.config.server.ts tests/scenarioStressView.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the view builder**

```ts
// client/src/lib/scenarioStressView.ts
import type { StressScenario } from '../data/stressScenarios';
import type { ScenarioStressResult } from './scenarioStress';

export interface StressNarrative {
  scenarioId: string;
  title: string;
  anchor: string;
  blurb: string;
  headline: string;
  contributors: string[];
}

function signedPct(n: number): string {
  const v = Math.round(n * 100);
  const sign = v > 0 ? '+' : v < 0 ? '−' : ''; // U+2212 minus, matching existing copy
  return `${sign}${Math.abs(v)}%`;
}

function absPct(n: number): string {
  return `${Math.abs(Math.round(n * 100))}%`;
}

export function buildStressNarrative(result: ScenarioStressResult, scenario: StressScenario): StressNarrative {
  const headline =
    `Illustrative impact: about ${signedPct(result.centralImpactPct)} ` +
    `(range ${signedPct(result.rangePct.mild)} to ${signedPct(result.rangePct.severe)})`;
  const contributors = result.topContributors.map(
    (c) => `${c.label} — ${absPct(c.pctOfLoss)} of the move`,
  );
  return {
    scenarioId: result.scenarioId,
    title: scenario.name,
    anchor: scenario.historicalAnchor,
    blurb: scenario.blurb,
    headline,
    contributors,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run --config vitest.config.server.ts tests/scenarioStressView.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/scenarioStressView.ts tests/scenarioStressView.test.ts
git commit -m "feat(v2-stress): add compliance-safe narrative builder"
```

---

## Task 5: Presentational section + wire into Analysis

**Files:**
- Create: `client/src/components/onboarding-v2/ScenarioStressSection.tsx`
- Modify: `client/src/pages/onboarding-v2/Analysis.tsx`

- [ ] **Step 1: Create the section component**

```tsx
// client/src/components/onboarding-v2/ScenarioStressSection.tsx
import { useMemo } from 'react';
import { useOnboardingV2Store } from '@/state/onboardingV2Store';
import { STRESS_SCENARIOS } from '@/data/stressScenarios';
import { computeScenarioStress, type StressHolding } from '@/lib/scenarioStress';
import { orderBySalience } from '@/lib/scenarioStressSalience';
import { buildStressNarrative } from '@/lib/scenarioStressView';

export default function ScenarioStressSection() {
  const { holdings, beliefs } = useOnboardingV2Store();

  const narratives = useMemo(() => {
    const stressHoldings: StressHolding[] = holdings
      .filter((h) => h.value_gbp > 0)
      .map((h) => ({
        instrument_name: h.instrument_name,
        asset_class: h.asset_class,
        region: h.region,
        value_gbp: h.value_gbp,
      }));
    const results = computeScenarioStress(stressHoldings, STRESS_SCENARIOS);
    const ordered = orderBySalience(results, STRESS_SCENARIOS, { axisScores: beliefs.axis_scores });
    const byId = new Map(STRESS_SCENARIOS.map((s) => [s.id, s]));
    return ordered.map((r) => buildStressNarrative(r, byId.get(r.scenarioId)!));
  }, [holdings, beliefs.axis_scores]);

  if (narratives.length === 0) return null;

  return (
    <div className="space-y-3" data-testid="scenario-stress-section">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
        How your portfolio holds up under stress
      </h3>
      <p className="text-sm text-[var(--muted-foreground)] -mt-1">
        Illustrative, conditional estimates of how your current holdings would move if each scenario played out. Not a forecast.
      </p>
      <div className="grid gap-3">
        {narratives.map((n) => (
          <div
            key={n.scenarioId}
            className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5"
            data-testid={`stress-card-${n.scenarioId}`}
          >
            <div className="flex items-baseline justify-between gap-3">
              <h4 className="font-bold text-[var(--foreground)] tracking-tight">{n.title}</h4>
              <span className="text-xs text-[var(--muted-foreground)]">{n.anchor}</span>
            </div>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">{n.blurb}</p>
            <p className="text-base font-semibold text-[var(--foreground)] mt-3">{n.headline}</p>
            {n.contributors.length > 0 && (
              <ul className="mt-2 text-sm text-[var(--muted-foreground)] list-disc list-inside">
                {n.contributors.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire it into Analysis.tsx**

In `client/src/pages/onboarding-v2/Analysis.tsx`, add the import after the existing `PersonaCard` import (line 4):

```tsx
import ScenarioStressSection from '@/components/onboarding-v2/ScenarioStressSection';
```

Then insert the section immediately **after** the Investor Persona block (which closes with `</div>` after `<PersonaCard persona={persona} />` near line 492) and **before** the `{/* Tilts Banner */}` comment:

```tsx
        <ScenarioStressSection />

```

- [ ] **Step 3: Type-check and run the full suite**

Run: `npm run check && npm test`
Expected: `tsc` passes; all `tests/**` pass (including the four new files).

- [ ] **Step 4: Visual verification (preview)**

Start the dev server and walk the v2 flow to the Analysis screen with a multi-bucket portfolio; confirm the stress cards render with a salient scenario first when an inflation/tech/volatility concern is set. Capture a screenshot.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/onboarding-v2/ScenarioStressSection.tsx client/src/pages/onboarding-v2/Analysis.tsx
git commit -m "feat(v2-stress): render stress lens on the Analysis screen"
```

---

## Task 6: Persona reflective-mirror copy

**Files:**
- Modify: `client/src/pages/onboarding-v2/Analysis.tsx`

- [ ] **Step 1: Replace the "classifies you as" copy**

In `client/src/pages/onboarding-v2/Analysis.tsx`, the Investor Persona block (≈ lines 484–491) currently reads:

```tsx
            <p className="text-sm text-[var(--muted-foreground)] -mt-1">
              Based on your answers and current portfolio, Unlock classifies you as:
            </p>
```

Change the copy to a reflective mirror (no classification claim):

```tsx
            <p className="text-sm text-[var(--muted-foreground)] -mt-1">
              From your answers and current portfolio, here's the investing stance we heard:
            </p>
```

- [ ] **Step 2: Type-check**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/onboarding-v2/Analysis.tsx
git commit -m "refactor(v2): reframe persona copy as a reflective mirror, not a classification"
```

---

## Task 7: Retire the legacy wizard — re-point links

**Files:**
- Modify: `client/src/pages/PortfolioAnalysis.tsx:1040`, `client/src/pages/AdviceGap.tsx:312`

- [ ] **Step 1: Re-point both links to the v2 front door**

In `client/src/pages/PortfolioAnalysis.tsx` (≈ line 1040) change:

```tsx
            <Link href="/investor-preferences-v2">
```
to:
```tsx
            <Link href="/onboarding-v2/welcome">
```

In `client/src/pages/AdviceGap.tsx` (≈ line 312) change the `href="/investor-preferences-v2"` attribute to `href="/onboarding-v2/welcome"`.

- [ ] **Step 2: Confirm no other in-app links target the legacy routes**

Run: `grep -rn "investor-preferences" client/src --include="*.tsx" --include="*.ts" | grep -v "App.tsx"`
Expected: no remaining matches (other than App.tsx, handled in Task 8).

- [ ] **Step 3: Type-check and commit**

```bash
npm run check
git add client/src/pages/PortfolioAnalysis.tsx client/src/pages/AdviceGap.tsx
git commit -m "refactor: re-point legacy wizard links to onboarding-v2"
```

---

## Task 8: Retire the legacy wizard — remove routes + delete modules (grep-gated)

**Files:**
- Modify: `client/src/App.tsx` (remove imports lines 33–34 and routes lines 82–83)
- Delete: legacy client + server modules

- [ ] **Step 1: Remove the routes and imports from App.tsx**

Delete these lines in `client/src/App.tsx`:
- Imports (≈ 33–34): `import InvestorPreferences from "@/pages/InvestorPreferences";` and `import InvestorPreferencesWizard from "@/pages/InvestorPreferencesWizard";`
- Routes (≈ 82–83): `<Route path="/investor-preferences" component={InvestorPreferences} />` and `<Route path="/investor-preferences-v2" component={InvestorPreferencesWizard} />`

- [ ] **Step 2: Grep-gate the client deletions**

Run:
```bash
grep -rn "InvestorPreferencesWizard\|InvestorPreferences\b\|usePersonaQuiz\|beliefProcessing\|useBeliefQuestionnaire\|useAdditionalBeliefs" client/src --include="*.tsx" --include="*.ts"
```
Expected: **no matches** (all importers removed). If any match remains, stop and resolve it before deleting.

- [ ] **Step 3: Delete the legacy client modules**

```bash
git rm client/src/pages/InvestorPreferences.tsx \
       client/src/pages/InvestorPreferencesWizard.tsx \
       client/src/hooks/usePersonaQuiz.ts \
       client/src/utils/beliefProcessing.ts
```
(If `useBeliefQuestionnaire` / `useAdditionalBeliefs` live in their own files surfaced by the Step-2 grep history, `git rm` those too. Do not delete files still referenced.)

- [ ] **Step 4: Grep-gate the server deletions**

Run:
```bash
grep -rn "scenario-impact\|simulate-v2\|engine_v2\|config/correlations\|config/scenarioVols\|data/scenarios" server client --include="*.ts" --include="*.tsx"
```
Expected: matches only **inside** the files about to be deleted (and the legacy route handlers in `server/routes.ts`). Remove the `/api/scenario-impact` and `/api/simulate-v2` handler blocks from `server/routes.ts` (the ranges identified in the design: ≈ `routes.ts:719-800` and the `/api/simulate-v2` handler ≈ `routes.ts:879+`). Re-grep until only the to-be-deleted files match.

- [ ] **Step 5: Delete the flawed server engine + config**

```bash
git rm server/lib/simulate/engine_v2.ts \
       server/config/correlations.ts \
       server/config/scenarioVols.ts \
       server/data/scenarios.ts
```
Only delete a file once the Step-4 grep proves it has no importer outside the deleted set.

- [ ] **Step 6: Type-check, full suite, build**

Run: `npm run check && npm test && npm run build`
Expected: `tsc` clean, all `tests/**` green, build succeeds (catches any dangling import the greps missed).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor: delete legacy wizard + flawed stress/MC engine and config"
```

---

## Task 9: Route regression guard

**Files:**
- Test: `tests/legacyRetirement.test.ts`

- [ ] **Step 1: Write a guard test that the legacy routes are gone and the front door survives**

```ts
// tests/legacyRetirement.test.ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const app = readFileSync(resolve(__dirname, '../client/src/App.tsx'), 'utf8');

describe('legacy wizard retirement', () => {
  it('App.tsx no longer routes the legacy wizard', () => {
    expect(app).not.toContain('/investor-preferences-v2');
    expect(app).not.toContain('/investor-preferences"');
    expect(app).not.toContain('InvestorPreferencesWizard');
  });
  it('the v2 front door is still routed', () => {
    expect(app).toContain('/onboarding-v2/welcome');
  });
});
```

- [ ] **Step 2: Run + verify pass**

Run: `npx vitest run --config vitest.config.server.ts tests/legacyRetirement.test.ts`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add tests/legacyRetirement.test.ts
git commit -m "test: guard legacy-wizard retirement and v2 front door"
```

---

## Appendix A — Parallel, non-blocking: historical shock calibration

Not on the critical path. After Task 8, refine the illustrative shock values in `client/src/data/stressScenarios.ts` against real historical drawdowns (per asset class × region) and update each `historicalAnchor` to cite the basis. The `tests/stressScenarios.test.ts` structural invariants must still pass; no engine code changes. Suggested approach: `deep-research` skill to source per-bucket drawdowns for 2000 / 2008 / 2020 / 2022 episodes, then a single commit updating the data file.

---

## Self-review notes (completed)

- **Spec coverage:** scenario library (Task 1) ✓; pure deterministic engine, no MC/probabilities (Task 2) ✓; light salience layer (Task 3) ✓; compliance-safe conditional/illustrative output (Tasks 4–5) ✓; persona reflective mirror (Task 6) ✓; legacy retirement with grep gates (Tasks 7–8) ✓; route regression (Task 9) ✓; historical calibration non-blocking (Appendix A) ✓; no `tiltGate` coupling — section renders whenever holdings exist ✓.
- **Type consistency:** `StressHolding`, `StressScenario`, `ScenarioStressResult`, `SalienceInput.axisScores` (= `beliefs.axis_scores: Partial<Record<AxisCode, number>>`), `severityRange.{mildMultiplier,severeMultiplier}`, `rangePct.{mild,severe}` are used identically across tasks.
- **Placeholders:** none — every code step shows complete code; deletion steps are grep-gated with exact commands.
