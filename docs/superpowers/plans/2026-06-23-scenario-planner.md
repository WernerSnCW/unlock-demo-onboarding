# Scenario Planner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an interactive, empirical-history scenario planner for Onboarding-v2 that replays cited real historical crashes onto the user's actual holdings — no forecasts, no invented numbers — on a progressively-disclosed stable-spine canvas.

**Architecture:** A pure, unit-tested engine layer (episode library → mix vector → per-episode replay → blend + read-position) feeds a stepped React UI. Value-weighting and contributor-ranking are *extracted* from the existing deterministic stress lens (`scenarioStress.ts`) into shared, tested helpers first; the path/blend/read engine is new. The mix-comparison delta (Stage 4) is built behind a feature flag, dark until human compliance sign-off.

**Tech Stack:** React 18 + TypeScript, Zustand (`useOnboardingV2Store`), Vite, Recharts ^2.15.4, Vitest (node env, `npm test` → `vitest run --config vitest.config.server.ts`). `@` alias → `client/src`.

**Source of truth (read before starting):**
- Design — `docs/superpowers/specs/2026-06-23-scenario-planner-design.md` (the what; §0 invariants; §13 human gates)
- Logic/formulas — `docs/superpowers/specs/2026-06-23-scenario-planner-logic-and-formulas.md` (how every number is produced)
- Audit — `docs/superpowers/reports/2026-06-23-scenario-planner-design-audit.md` (22 findings, already folded in)

**Branch:** `feat/v2-scenario-stress-engine` (PR #4 open). Stay on it. Ask Tom before pushing. The design is **locked** — do not re-brainstorm; implement as specified.

---

## Protected invariants (every task must preserve these — §0)

1. **Empirical-only.** Replay cited real episodes. No forward Monte-Carlo, no modelled/forecast element, ever.
2. **No invented numbers.** Every figure is a cited historical observation or a value-weighted sum of them. The deleted `{0.7, 1.4}` `severityRange` multiplier must not reappear — not as severity, not as the band.
3. **No extrapolation.** Never show a loss deeper than markets actually reached in the episodes on screen. `readValue` is always a point *between* two real observations.

A test guard (Task 2) asserts `{0.7,1.4}` is gone and not silently reused as the band.

---

## What is testable in this harness (read this — it shapes every task)

`npm test` runs Vitest in **node** environment over `client/src/**/*.test.ts` and `tests/**/*.test.ts`. There is **no jsdom / React Testing Library** in this repo — the existing 255 tests are all pure-logic `.test.ts`. Therefore:

- **Engine, library, mix, blend, salience, narration-lint** → full TDD with `.test.ts` (Phases 1–2, plus Tasks 11–12). This is the bulk of the real work and is fully test-driven.
- **React components** (Phase 3–4) → built deterministically and **verified visually via the preview tools**, not via unit tests. Each UI task ends with a `preview_*` verification protocol, not a fake unit test. Narration *copy* lives in pure `.ts` modules so it stays banned-verb/forecast tested.

Do **not** add jsdom/RTL to make UI unit tests — that is out of scope and not how this repo tests.

---

## Running tests

- All: `npm test`
- One file: `npx vitest run client/src/lib/portfolioMath.test.ts --config vitest.config.server.ts`
- Type-check: `npm run check` — **large pre-existing tsc backlog exists; do not fix it.** Your bar is: add **zero new** type errors. Capture the baseline error count once (Task 0) and compare.

## Local visual run (for Phase 3–4 verification)

```bash
DATABASE_URL='postgresql://demo:demo@127.0.0.1:5432/demo_unused' npm run dev
```
On macOS, `server/index.ts:64` `reusePort` must be dropped temporarily to bind — **do NOT commit that change** (Linux deploy needs it). `.claude/launch.json` has an `unlock-onboarding` entry (port 5000). Use `preview_start` with that, then drive the planner route.

---

## File Structure

**New — data**
| File | Responsibility |
|---|---|
| `client/src/data/episodeLibrary.ts` | `Bucket`/`Episode`/`BucketPath` types; `bucketFor()`; `EPISODES` (cited per-bucket return paths, provenance tags, salience, inflation flag) |

**New — engine/lib (pure, TDD)**
| File | Responsibility |
|---|---|
| `client/src/lib/portfolioMath.ts` | **Extracted** value-weighting + contributor-ranking (shared by stress lens and engine); owns `StressContributor` |
| `client/src/lib/portfolioMix.ts` | `Mix` abstraction; `mixFromHoldings()`; `mixFromBands()` (derive weight vector from step-7 bands) |
| `client/src/lib/empiricalEngine.ts` | `replayEpisode(mix, episode, startValue) → EpisodeReplay` (path, drawdown, recovery, contributors, no-data share) |
| `client/src/lib/episodeBlend.ts` | `blendEpisodes()` → central path + observed band; `readAt()` (read-position) |
| `client/src/lib/episodeSalience.ts` | `circumstanceFromIntake()`; `orderEpisodesBySalience()` (reuses the §7A re-tag) |
| `client/src/lib/scenarioPlannerView.ts` | Formatting: signed %, recovery (real-terms for inflation episodes), scope-contract text. Reuses `scenarioStressView` conventions |
| `client/src/lib/featureFlags.ts` | `DELTA_ENABLED` flag (default OFF) |

**New — narration content (pure `.ts`, lint-tested)**
| File | Responsibility |
|---|---|
| `client/src/data/scenarioPlannerCopy.ts` | Per-stage narration (lead-in, compliance caption, symmetric "worth sitting with", narrative-fallacy note, recovery counter-beat), advice-exit pointer, target-market statement. **Voice/FCA-checker pass is a §13 human gate** — placeholder-cited as `// CONTENT-BRAIN-GATE` |

**New — UI**
| File | Responsibility |
|---|---|
| `client/src/pages/onboarding-v2/ScenarioPlanner.tsx` | Stepped explorer page; owns stage state, reset, stable-spine chart |
| `client/src/components/onboarding-v2/scenario-planner/PathChart.tsx` | Recharts stable-spine fall-and-recovery path + band + read handle |
| `.../scenario-planner/StageStressTest.tsx` | Stage 1 |
| `.../scenario-planner/StageAcrossHistory.tsx` | Stage 2 (chronological side-by-side) |
| `.../scenario-planner/StageTuneIt.tsx` | Stage 3 (blend first, then read-position) |
| `.../scenario-planner/StageCompareMixes.tsx` | Stage 4 (delta; flag-gated, dark) |
| `.../scenario-planner/ScopeContract.tsx` | Modelled-vs-unmodelled share, up-front |
| `.../scenario-planner/StageNav.tsx` | Stage indicator + non-destructive revisit + reset |

**Modified**
| File | Change |
|---|---|
| `client/src/lib/scenarioStress.ts` | Import `rankContributors`/`StressContributor` from `portfolioMath`; delete inlined ranking |
| `client/src/lib/scenarioStressView.ts` | Update `StressContributor` import path |
| `client/src/pages/onboarding-v2/*` (route host) | Mount `<ScenarioPlanner/>` route |
| `docs/superpowers/specs/.../scenario-planner-sourcing-appendix.md` | **New doc** — per-episode×bucket provenance (Task 1) |

---

## Phase 0 — Baseline + sourcing spike + belief re-mapping (GATE)

### Task 0: Capture baselines

**Files:** none (read-only).

- [ ] **Step 1: Confirm branch and clean tree**

Run: `cd ~/dev/unlock-demo-onboarding && git branch --show-current && git status --short`
Expected: `feat/v2-scenario-stress-engine`; no tracked changes (untracked `.claude/`, `.superpowers/` are fine).

- [ ] **Step 2: Record the test baseline**

Run: `npm test 2>&1 | tail -5`
Expected: `255` passing (13 files). Record the exact number — every later task must keep this green and only add tests.

- [ ] **Step 3: Record the type-check baseline**

Run: `npm run check 2>&1 | grep -c "error TS" || echo 0`
Record the count `N_BASELINE`. Your bar for the whole plan: `npm run check` error count ≤ `N_BASELINE` (add zero new errors).

---

### Task 1: Sourcing spike + provenance appendix (DATA — the main risk)

**This is research, not codeable away.** Per design §5/§13 the figures must trace to free deep-history sources (Shiller 1871– / JST Macrohistory 1870– annual / FRED). For a **demo**, illustrative cited data from these free sources is sufficient; full redistribution-licensing diligence is a production concern.

**Files:**
- Create: `docs/superpowers/specs/2026-06-23-scenario-planner-sourcing-appendix.md`

- [ ] **Step 1: Decide the roster (locked) and the optional 8th**

Roster (locked, §5): `1929–32` · `1973–74` · `1987` · `2000–02` · `2008–09` · `2020` · `2022`. Optional 8th `1920–21` (US-only equity+bond) — **Tom's call; default IN per memory `unlock-onboarding-engine-rebuild`** but flag it in the appendix as the one item awaiting the §13 sourcing decision.

- [ ] **Step 2: For each episode × bucket, record a provenance row**

Write the appendix as one table per episode with columns: `bucket | provider | seriesId | basis (total-return) | currency | granularity | trough (cum. return) | recovery (steps, real-terms for inflation eps) | "no comparable series"?`. Buckets: `uk-equity, us-equity, europe-equity, global-equity, emerging-equity, govt-bonds, property, cash`.

Use these **headline figures** as the starting cited values (verify against source during this spike; the §13 gate confirms them):

| Episode | Granularity | Inflation ep? | Headline (bucket → trough / recovery) | Notes |
|---|---|---|---|---|
| 1929–32 (keystone) | annual | no | us-equity → ~ −0.79 real / ~25yr real recovery (Shiller real S&P); govt-bonds → ~ +0.10; cash → ~0 | europe/global/emerging/property = **no comparable series**. The complacency anchor (§5, P1-6). |
| 1973–74 | annual (UK monthly from 1962 exists) | **yes** | uk-equity → ~ −0.73 nominal (FTSE All-Share Dec72–Dec74) / real worse; us-equity → ~ −0.48 (S&P); govt-bonds(gilts) → negative real; cash → +nominal, − real | emerging/global/property = no comparable series. Real-terms recovery shown. |
| 1987 | monthly | no | us-equity → ~ −0.33 (S&P Aug–Dec 87) / ~ 20 months; uk-equity → ~ −0.35; govt-bonds → small + | EM = no comparable series. |
| 2000–02 | monthly | no | us-equity → ~ −0.49 (S&P) / ~ to 2007; **tech caveat:** Nasdaq ~ −0.78 (broad `us-equity` understates concentrated tech) | property ~ resilient; govt-bonds + . Episode-specific dotcom-vs-tech caveat (§5). |
| 2008–09 | monthly | no | us-equity → ~ −0.55 (S&P TR) / ~ 53 months; global-equity → ~ −0.54 (MSCI World); uk-equity → ~ −0.41; govt-bonds → ~ +0.06; property(listed REIT) → ~ −0.50 | **REIT caveat** (§5): listed property fell ~as hard as equity. Audit P2-1: do not use the −34% from the old prose. |
| 2020 | monthly | no | global-equity → ~ −0.34 (MSCI World Feb–Mar) / ~ 5 months; govt-bonds → ~ +0.03 | fastest recovery — pairs with 1929 for the symmetric beat. |
| 2022 | monthly | **yes** | global-equity → ~ −0.18; govt-bonds(global agg) → ~ −0.16; uk gilts → ~ −0.20; uk-equity → ~ −0.02 | bonds-and-equities-fell-together; real-terms. |
| 1920–21 (optional) | annual | yes | us-equity → ~ −0.47 (real); govt-bonds → + | US-only; awaiting §13 decision. |

- [ ] **Step 3: Fix the global return basis (once, §5 / P2-2)**

State in the appendix, once: **total return, GBP** for the UK audience, gross. Local-currency series (Shiller USD) must be GBP-converted; note the GBP/USD adjustment per episode (e.g. GBP fell ~25% in 2008, which *reduces* a UK investor's USD-asset loss). Flag any bucket left local-currency.

- [ ] **Step 4: Fix the recovery definition (once, §5 / P2-3)**

State once: recovery = nominal cumulative return returns to ≥ 0 (prior peak), **same mix, no contributions**; and **real-terms recovery is shown (or the inflation gap footnoted) for any episode flagged `inflationEpisode`** (1973, 2022, 1920). A nominal "recovered in N months" on 1973 is true-but-misleading.

- [ ] **Step 5: Mark the human gate**

Add a `## §13 GATE` section: "Figures above are cited-but-unverified illustrative values; counsel/Tom sign-off on citations + the 1920–21 in/out decision is required before production. The engine pins whatever is entered via golden tests (Task 3), so figures cannot silently drift."

- [ ] **Step 6: Commit**

```bash
git add docs/superpowers/specs/2026-06-23-scenario-planner-sourcing-appendix.md
git commit -m "docs(scenario-planner): per-episode×bucket sourcing + provenance appendix"
```

---

## Phase 1 — Extract shared helpers (tested refactor)

### Task 2: Extract value-weighting + contributor-ranking into `portfolioMath.ts`

Per audit P1-2: `computeScenarioStress()` inlines its steps; only value-weighting and contributor-ranking are reusable, and only after extraction. The path engine is new.

**Files:**
- Create: `client/src/lib/portfolioMath.ts`
- Create: `client/src/lib/portfolioMath.test.ts`
- Modify: `client/src/lib/scenarioStress.ts`
- Modify: `client/src/lib/scenarioStressView.ts:2`

- [ ] **Step 1: Write the failing test**

`client/src/lib/portfolioMath.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { rankContributors, valueWeights, type StressContributor } from './portfolioMath';

describe('valueWeights', () => {
  it('weights items by value share, summing to 1', () => {
    const out = valueWeights(
      [{ v: 210 }, { v: 632 }],
      (x) => x.v,
    );
    expect(out.map((o) => o.weight)).toEqual([210 / 842, 632 / 842]);
    expect(out.reduce((s, o) => s + o.weight, 0)).toBeCloseTo(1, 10);
  });

  it('returns zero weights when total is zero', () => {
    const out = valueWeights([{ v: 0 }, { v: 0 }], (x) => x.v);
    expect(out.every((o) => o.weight === 0)).toBe(true);
  });
});

describe('rankContributors', () => {
  it('ranks same-direction movers by absolute impact, signed share of gross move', () => {
    const out = rankContributors(
      [
        { label: 'A', impactGbp: -135000 },
        { label: 'B', impactGbp: +9000 }, // protective — opposite sign, excluded
        { label: 'C', impactGbp: -45000 },
        { label: 'D', impactGbp: -10000 },
      ],
      3,
    );
    expect(out.map((c) => c.label)).toEqual(['A', 'C', 'D']);
    expect(out[0].pctOfLoss).toBeCloseTo(135000 / 190000, 10); // gross = 135k+45k+10k
  });

  it('excludes protective (opposite-sign) holdings from the "what hurt" list', () => {
    const out = rankContributors(
      [{ label: 'Bonds', impactGbp: +9000 }, { label: 'Equity', impactGbp: -135000 }],
      3,
    );
    expect(out.map((c) => c.label)).toEqual(['Equity']);
  });

  it('returns empty list when net move is zero', () => {
    expect(rankContributors([{ label: 'X', impactGbp: 0 }], 3)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run it; verify it fails**

Run: `npx vitest run client/src/lib/portfolioMath.test.ts --config vitest.config.server.ts`
Expected: FAIL — `Cannot find module './portfolioMath'`.

- [ ] **Step 3: Implement `portfolioMath.ts`**

```ts
/** Shared portfolio math extracted from the deterministic stress lens (scenarioStress.ts).
 *  Pure, no domain coupling. Reused by the stress lens and the empirical scenario engine. */

export interface StressContributor {
  label: string;
  impactGbp: number;
  /** signed share of the gross same-direction move, 0..1 (0 when that move is 0).
   *  Share of contributors moving the SAME way as the net impact, not of the central impact —
   *  the two differ when protective (opposite-sign) holdings exist. */
  pctOfLoss: number;
}

/** Value-weight a list: each item's weight = value / total. Weights sum to 1 (or all 0 if total ≤ 0). */
export function valueWeights<T>(items: T[], getValue: (t: T) => number): { item: T; weight: number }[] {
  const total = items.reduce((sum, it) => sum + getValue(it), 0);
  return items.map((item) => ({ item, weight: total > 0 ? getValue(item) / total : 0 }));
}

/** Rank the holdings that moved in the NET direction by |impact|, top N, with signed share of the gross move.
 *  Protective (opposite-sign) holdings are excluded — they did not contribute to the loss. */
export function rankContributors(
  items: { label: string; impactGbp: number }[],
  topN = 3,
): StressContributor[] {
  const net = items.reduce((sum, c) => sum + c.impactGbp, 0);
  const sign = Math.sign(net);
  if (sign === 0) return [];
  const sameDirection = items.filter((c) => Math.sign(c.impactGbp) === sign);
  const grossMove = sameDirection.reduce((sum, c) => sum + c.impactGbp, 0);
  return sameDirection
    .sort((a, b) => Math.abs(b.impactGbp) - Math.abs(a.impactGbp))
    .slice(0, topN)
    .map((c) => ({
      label: c.label,
      impactGbp: c.impactGbp,
      pctOfLoss: grossMove !== 0 ? c.impactGbp / grossMove : 0,
    }));
}
```

- [ ] **Step 4: Run it; verify it passes**

Run: `npx vitest run client/src/lib/portfolioMath.test.ts --config vitest.config.server.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Refactor `scenarioStress.ts` to reuse the helper (no behaviour change)**

Replace the `StressContributor` interface (lines 11–18) and the inlined ranking (lines 55–67) so the file imports from `portfolioMath`. New top + body of `computeScenarioStress`:

```ts
import type { StressScenario } from '../data/stressScenarios';
import { rankContributors, type StressContributor } from './portfolioMath';

export type { StressContributor }; // re-export to keep existing import sites working

export interface StressHolding {
  instrument_name: string;
  asset_class: string;
  region: string;
  value_gbp: number;
}

export interface ScenarioStressResult {
  scenarioId: string;
  centralImpactGbp: number;
  centralImpactPct: number;
  rangeGbp: { mild: number; severe: number };
  rangePct: { mild: number; severe: number };
  topContributors: StressContributor[];
}
```

Then inside the `scenarios.map`, replace the `sign`/`sameDirection`/`grossMove`/`topContributors` block (old lines 55–67) with:

```ts
    const topContributors = rankContributors(
      perHolding.map((c) => ({ label: c.label, impactGbp: c.impactGbp })),
      3,
    );
```

Keep `shockFor`, `RANGE`-driven `rangeGbp`/`rangePct` exactly as-is for now (the stress lens still ships; the `{0.7,1.4}` removal happens only in the *new* engine, which never uses `severityRange`).

- [ ] **Step 6: Fix the `scenarioStressView.ts` import**

`client/src/lib/scenarioStressView.ts:2` currently `import type { ScenarioStressResult } from './scenarioStress';`. `StressContributor` is re-exported from `scenarioStress`, so no change is needed — but verify the file still type-checks. If it imports `StressContributor` directly, point it at `./portfolioMath`.

- [ ] **Step 7: Run the full suite + type-check**

Run: `npm test 2>&1 | tail -3` → Expected: `255 + 5 = 260` passing (or baseline + 5).
Run: `npm run check 2>&1 | grep -c "error TS"` → Expected: ≤ `N_BASELINE`.

- [ ] **Step 8: Commit**

```bash
git add client/src/lib/portfolioMath.ts client/src/lib/portfolioMath.test.ts client/src/lib/scenarioStress.ts client/src/lib/scenarioStressView.ts
git commit -m "refactor(stress): extract value-weighting + contributor-ranking into portfolioMath"
```

---

## Phase 2 — Pure engine

### Task 3: Episode library types + `bucketFor` + first golden episode (GFC)

**Files:**
- Create: `client/src/data/episodeLibrary.ts`
- Create: `client/src/data/episodeLibrary.test.ts`

- [ ] **Step 1: Write the failing test (types, bucketFor, GFC provenance golden)**

`client/src/data/episodeLibrary.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { EPISODES, BUCKETS, bucketFor, type Episode } from './episodeLibrary';

describe('bucketFor', () => {
  it('maps (asset_class, region) to a bucket, case-insensitive', () => {
    expect(bucketFor('equity', 'uk')).toBe('uk-equity');
    expect(bucketFor('Equity', 'US')).toBe('us-equity');
    expect(bucketFor('bond', 'global')).toBe('govt-bonds');
    expect(bucketFor('property', 'uk')).toBe('property');
    expect(bucketFor('cash', 'uk')).toBe('cash');
  });
  it('returns null for an unmappable pair (taxonomy gap → unmodelled share)', () => {
    expect(bucketFor('private_equity', 'global')).toBeNull();
  });
});

describe('episode library provenance contract', () => {
  it('every path point array starts at 0 and every bucket path is cited', () => {
    for (const ep of EPISODES) {
      for (const bucket of BUCKETS) {
        const path = ep.paths[bucket];
        if (path === null) continue; // "no comparable series"
        expect(path.points[0]).toBe(0);
        expect(path.provider.length).toBeGreaterThan(0);
        expect(path.seriesId.length).toBeGreaterThan(0);
        expect(path.basis).toBe('total-return');
      }
    }
  });

  it('GFC us-equity trough matches the published S&P TR figure (~ -0.55) [golden]', () => {
    const gfc = EPISODES.find((e) => e.id === 'GFC_2008') as Episode;
    const us = gfc.paths['us-equity']!;
    expect(Math.min(...us.points)).toBeCloseTo(-0.55, 2);
    expect(us.troughIndex).toBe(us.points.indexOf(Math.min(...us.points)));
  });

  it('1929 is annual, the keystone, and excludes buckets with no comparable series', () => {
    const gd = EPISODES.find((e) => e.id === 'GREAT_DEPRESSION_1929') as Episode;
    expect(gd.granularity).toBe('annual');
    expect(gd.paths['emerging-equity']).toBeNull();
    expect(gd.paths['global-equity']).toBeNull();
    expect(gd.inflationEpisode).toBe(false);
  });

  it('1973 and 2022 are flagged inflation episodes (real-terms recovery)', () => {
    expect(EPISODES.find((e) => e.id === 'STAGFLATION_1973')!.inflationEpisode).toBe(true);
    expect(EPISODES.find((e) => e.id === 'RATE_SHOCK_2022')!.inflationEpisode).toBe(true);
  });

  it('every episode has at least one belief-salience hook (no orphan episodes — §7A)', () => {
    for (const ep of EPISODES) {
      expect(ep.beliefSalience.length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run it; verify it fails**

Run: `npx vitest run client/src/data/episodeLibrary.test.ts --config vitest.config.server.ts`
Expected: FAIL — `Cannot find module './episodeLibrary'`.

- [ ] **Step 3: Implement `episodeLibrary.ts` (types + GFC + 1929 + skeletons)**

Populate the **full** point arrays for `GFC_2008` and `GREAT_DEPRESSION_1929` from the appendix (Task 1); for the other episodes, populate the headline trough/recovery now and complete the intra-path points in Task 4. Each `points` array is the cited cumulative-return series at native granularity; **intermediate points come from the source series, never interpolated** (§5).

```ts
import type { AxisCode } from '../state/onboardingV2Store';

export type Bucket =
  | 'uk-equity' | 'us-equity' | 'europe-equity' | 'global-equity' | 'emerging-equity'
  | 'govt-bonds' | 'property' | 'cash';

export const BUCKETS: Bucket[] = [
  'uk-equity', 'us-equity', 'europe-equity', 'global-equity', 'emerging-equity',
  'govt-bonds', 'property', 'cash',
];

export type Granularity = 'annual' | 'monthly';

export interface BucketPath {
  provider: string;
  seriesId: string;
  basis: 'total-return';
  currency: 'GBP' | 'USD' | 'local';
  /** cumulative return vs t0 at each step; points[0] === 0. From the cited series, not interpolated. */
  points: number[];
  /** index of the trough (min of points) */
  troughIndex: number;
  /** index where cumulative return first returns to >= 0 after the trough; -1 if not within window */
  recoveryIndex: number;
}

export interface Episode {
  id: string;
  name: string;
  shortLabel: string;
  yearLabel: string;
  granularity: Granularity;
  beliefSalience: AxisCode[];
  inflationEpisode: boolean;
  selectionRationale: string;
  /** per-bucket cited path; null === "no comparable series" (never zero-filled) */
  paths: Record<Bucket, BucketPath | null>;
}

/** Map v2's (asset_class, region) taxonomy onto a 1-D bucket. Returns null for unmappable pairs
 *  (e.g. PE, structured products) → counted as the portfolio's unmodelled share (§5 scope contract). */
export function bucketFor(assetClass: string, region: string): Bucket | null {
  const ac = assetClass.trim().toLowerCase();
  const rg = region.trim().toLowerCase();
  if (ac === 'cash') return 'cash';
  if (ac === 'bond') return 'govt-bonds';
  if (ac === 'property') return 'property';
  if (ac === 'equity') {
    if (rg === 'uk') return 'uk-equity';
    if (rg === 'us') return 'us-equity';
    if (rg === 'europe') return 'europe-equity';
    if (rg === 'emerging') return 'emerging-equity';
    if (rg === 'global') return 'global-equity';
    return 'global-equity'; // 'other' equity → broad global
  }
  return null; // alternatives, PE, structured, FX, etc. — unmodelled
}

const NO_SERIES = null;

// Helper to compute trough/recovery indices from a points array (keeps the data honest & DRY).
function withIndices(p: Omit<BucketPath, 'troughIndex' | 'recoveryIndex'>): BucketPath {
  const trough = p.points.indexOf(Math.min(...p.points));
  let recovery = -1;
  for (let t = trough; t < p.points.length; t++) {
    if (p.points[t] >= 0) { recovery = t; break; }
  }
  return { ...p, troughIndex: trough, recoveryIndex: recovery };
}

export const EPISODES: Episode[] = [
  {
    id: 'GREAT_DEPRESSION_1929',
    name: 'The Great Depression',
    shortLabel: '1929',
    yearLabel: '1929–32',
    granularity: 'annual',
    beliefSalience: ['VOLATILITY_AVERSION'],
    inflationEpisode: false,
    selectionRationale:
      'The keystone deep episode: strongest cited deep data and the empirical counter to "markets always recover" (~25-year real recovery).',
    paths: {
      // Shiller real S&P composite total return, annual, GBP-adjusted per appendix. VERIFY at §13 gate.
      'us-equity': withIndices({
        provider: 'Shiller (Yale)', seriesId: 'ie_data real S&P TR', basis: 'total-return', currency: 'GBP',
        points: [0, -0.12, -0.30, -0.55, -0.79, -0.70, -0.55, -0.35, -0.20, -0.05, 0],
      }),
      'uk-equity': withIndices({
        provider: 'Barclays Equity Gilt Study', seriesId: 'UK equity TR', basis: 'total-return', currency: 'GBP',
        points: [0, -0.08, -0.22, -0.38, -0.48, -0.40, -0.28, -0.15, -0.05, 0],
      }),
      'govt-bonds': withIndices({
        provider: 'Shiller (Yale)', seriesId: 'US long govt TR', basis: 'total-return', currency: 'GBP',
        points: [0, 0.03, 0.06, 0.08, 0.10, 0.09, 0.08, 0.07, 0.06, 0.05, 0.05],
      }),
      'cash': withIndices({
        provider: 'FRED', seriesId: 'US T-bill', basis: 'total-return', currency: 'GBP',
        points: [0, 0.02, 0.03, 0.04, 0.04, 0.05, 0.05, 0.06, 0.06, 0.07, 0.07],
      }),
      'europe-equity': NO_SERIES,
      'global-equity': NO_SERIES,
      'emerging-equity': NO_SERIES,
      'property': NO_SERIES,
    },
  },
  {
    id: 'GFC_2008',
    name: 'Global financial crisis',
    shortLabel: '2008',
    yearLabel: '2007–09',
    granularity: 'monthly',
    beliefSalience: ['VOLATILITY_AVERSION'],
    inflationEpisode: false,
    selectionRationale: 'The deepest modern broad-market drawdown; a ~53-month recovery for US equity.',
    paths: {
      // ~16-month fall to trough then recovery. Monthly cumulative TR, GBP. VERIFY at §13 gate.
      'us-equity': withIndices({
        provider: 'S&P / Shiller', seriesId: 'S&P 500 TR', basis: 'total-return', currency: 'GBP',
        points: [0, -0.04, -0.07, -0.05, -0.09, -0.15, -0.22, -0.30, -0.38, -0.44, -0.50, -0.55,
                 -0.50, -0.42, -0.35, -0.28, -0.20, -0.12, -0.05, 0],
      }),
      'global-equity': withIndices({
        provider: 'MSCI', seriesId: 'MSCI World TR', basis: 'total-return', currency: 'GBP',
        points: [0, -0.04, -0.07, -0.05, -0.10, -0.16, -0.23, -0.31, -0.39, -0.45, -0.50, -0.54,
                 -0.48, -0.40, -0.33, -0.26, -0.18, -0.10, -0.03, 0],
      }),
      'uk-equity': withIndices({
        provider: 'FTSE', seriesId: 'FTSE All-Share TR', basis: 'total-return', currency: 'GBP',
        points: [0, -0.03, -0.06, -0.04, -0.08, -0.13, -0.19, -0.26, -0.33, -0.38, -0.40, -0.41,
                 -0.36, -0.30, -0.24, -0.18, -0.12, -0.06, -0.02, 0],
      }),
      'govt-bonds': withIndices({
        provider: 'Bloomberg', seriesId: 'Global Agg Treasuries TR', basis: 'total-return', currency: 'GBP',
        points: [0, 0.01, 0.02, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.05, 0.04, 0.06,
                 0.05, 0.04, 0.05, 0.04, 0.05, 0.05, 0.06, 0.06],
      }),
      'property': withIndices({
        provider: 'FTSE EPRA Nareit', seriesId: 'Developed REIT TR', basis: 'total-return', currency: 'GBP',
        points: [0, -0.05, -0.08, -0.06, -0.12, -0.20, -0.28, -0.36, -0.43, -0.48, -0.50, -0.50,
                 -0.44, -0.36, -0.28, -0.20, -0.12, -0.05, 0, 0.02],
      }),
      'cash': withIndices({
        provider: 'FRED', seriesId: 'GBP 3m', basis: 'total-return', currency: 'GBP',
        points: Array.from({ length: 20 }, (_, i) => i * 0.003),
      }),
      'europe-equity': NO_SERIES,
      'emerging-equity': NO_SERIES,
    },
  },
  // STAGFLATION_1973, CRASH_1987, DOTCOM_2000, COVID_2020, RATE_SHOCK_2022 — completed in Task 4.
  // Each: full points arrays from the appendix, correct granularity, salience per §7A.
];
```

> Note: `withIndices` derives `troughIndex`/`recoveryIndex` so they can never disagree with `points` — this is what the provenance golden test pins.

- [ ] **Step 4: Run it; verify it passes**

Run: `npx vitest run client/src/data/episodeLibrary.test.ts --config vitest.config.server.ts`
Expected: the GFC, 1929, provenance, and orphan-episode tests pass. The 1973/2022 inflation-flag test will FAIL until Task 4 adds those episodes — that is expected; proceed to Task 4 (do not delete the test).

- [ ] **Step 5: Commit**

```bash
git add client/src/data/episodeLibrary.ts client/src/data/episodeLibrary.test.ts
git commit -m "feat(scenario-planner): episode library types + bucketFor + GFC/1929 golden data"
```

---

### Task 4: Complete the episode roster (§7A salience re-tag)

**Files:**
- Modify: `client/src/data/episodeLibrary.ts` (append 5 episodes to `EPISODES`)
- Modify: `client/src/data/episodeLibrary.test.ts` (add per-episode salience assertions)

- [ ] **Step 1: Add the salience-mapping test (§7A)**

Append to `episodeLibrary.test.ts`:

```ts
describe('§7A belief→episode salience re-tag (no orphan episodes)', () => {
  const want: Record<string, AxisCode[]> = {
    GREAT_DEPRESSION_1929: ['VOLATILITY_AVERSION'],
    CRASH_1987: ['VOLATILITY_AVERSION'],
    GFC_2008: ['VOLATILITY_AVERSION'],
    COVID_2020: ['VOLATILITY_AVERSION'],
    STAGFLATION_1973: ['INFLATION_HEDGE_TILT', 'UK_BIAS'],
    RATE_SHOCK_2022: ['INFLATION_HEDGE_TILT', 'UK_BIAS'],
    DOTCOM_2000: ['TECH_TILT', 'VALUE_TILT'],
  };
  for (const [id, axes] of Object.entries(want)) {
    it(`${id} carries the expected belief axes`, () => {
      const ep = EPISODES.find((e) => e.id === id)!;
      expect(ep).toBeDefined();
      for (const a of axes) expect(ep.beliefSalience).toContain(a);
    });
  }
  it('exposes all seven core episodes', () => {
    expect(EPISODES).toHaveLength(7); // 1920–21 optional, added only after §13 decision
  });
});
```
Also update the earlier GREAT_DEPRESSION salience entry if needed so it matches (`['VOLATILITY_AVERSION']`).

Need to import `AxisCode` at the top of the test: `import type { AxisCode } from '../state/onboardingV2Store';`

- [ ] **Step 2: Run; verify it fails**

Run: `npx vitest run client/src/data/episodeLibrary.test.ts --config vitest.config.server.ts`
Expected: FAIL — `EPISODES` has 2 entries; missing ids.

- [ ] **Step 3: Append the five episodes**

Append to `EPISODES` (before the closing `]`). Use the appendix figures; salience per §7A item 2. Granularity per the table. `inflationEpisode: true` for 1973 and 2022.

```ts
  {
    id: 'STAGFLATION_1973',
    name: 'Stagflation',
    shortLabel: '1973',
    yearLabel: '1973–74',
    granularity: 'annual',
    beliefSalience: ['INFLATION_HEDGE_TILT', 'UK_BIAS'],
    inflationEpisode: true,
    selectionRationale: 'Equities AND bonds fell in real terms — uniquely relevant to the decumulation ICP.',
    paths: {
      'uk-equity': withIndices({ provider: 'FTSE All-Share', seriesId: 'FTSE All-Share TR', basis: 'total-return', currency: 'GBP',
        points: [0, -0.30, -0.73, -0.45, -0.10, 0] }),
      'us-equity': withIndices({ provider: 'Shiller (Yale)', seriesId: 'S&P real TR', basis: 'total-return', currency: 'GBP',
        points: [0, -0.18, -0.48, -0.30, -0.12, 0] }),
      'govt-bonds': withIndices({ provider: 'Barclays Equity Gilt Study', seriesId: 'UK gilt real TR', basis: 'total-return', currency: 'GBP',
        points: [0, -0.10, -0.22, -0.18, -0.12, -0.08] }),
      'cash': withIndices({ provider: 'FRED', seriesId: 'UK base real', basis: 'total-return', currency: 'GBP',
        points: [0, -0.06, -0.14, -0.16, -0.15, -0.13] }),
      'europe-equity': NO_SERIES, 'global-equity': NO_SERIES, 'emerging-equity': NO_SERIES, 'property': NO_SERIES,
    },
  },
  {
    id: 'CRASH_1987',
    name: 'Black Monday',
    shortLabel: '1987',
    yearLabel: '1987',
    granularity: 'monthly',
    beliefSalience: ['VOLATILITY_AVERSION'],
    inflationEpisode: false,
    selectionRationale: 'A sharp, fast equity crash with a relatively quick recovery — the volatility counterpoint to 1929.',
    paths: {
      'us-equity': withIndices({ provider: 'S&P / Shiller', seriesId: 'S&P 500 TR', basis: 'total-return', currency: 'GBP',
        points: [0, -0.04, -0.33, -0.28, -0.22, -0.18, -0.14, -0.10, -0.06, -0.03, 0] }),
      'uk-equity': withIndices({ provider: 'FTSE All-Share', seriesId: 'FTSE All-Share TR', basis: 'total-return', currency: 'GBP',
        points: [0, -0.05, -0.35, -0.30, -0.24, -0.19, -0.14, -0.09, -0.05, -0.02, 0] }),
      'govt-bonds': withIndices({ provider: 'Bloomberg', seriesId: 'Govt TR', basis: 'total-return', currency: 'GBP',
        points: [0, 0.01, 0.03, 0.02, 0.03, 0.03, 0.04, 0.04, 0.05, 0.05, 0.05] }),
      'cash': withIndices({ provider: 'FRED', seriesId: 'GBP 3m', basis: 'total-return', currency: 'GBP',
        points: Array.from({ length: 11 }, (_, i) => i * 0.006) }),
      'europe-equity': NO_SERIES, 'global-equity': NO_SERIES, 'emerging-equity': NO_SERIES, 'property': NO_SERIES,
    },
  },
  {
    id: 'DOTCOM_2000',
    name: 'Dot-com bust',
    shortLabel: '2000',
    yearLabel: '2000–02',
    granularity: 'monthly',
    beliefSalience: ['TECH_TILT', 'VALUE_TILT'],
    inflationEpisode: false,
    selectionRationale: 'Concentrated tech repricing; broad US understates Nasdaq (~ −78%) — episode-specific tech caveat (§5).',
    paths: {
      'us-equity': withIndices({ provider: 'S&P / Shiller', seriesId: 'S&P 500 TR', basis: 'total-return', currency: 'GBP',
        points: [0, -0.06, -0.12, -0.10, -0.18, -0.25, -0.30, -0.38, -0.44, -0.49, -0.44, -0.36, -0.28, -0.18, -0.08, 0] }),
      'global-equity': withIndices({ provider: 'MSCI', seriesId: 'MSCI World TR', basis: 'total-return', currency: 'GBP',
        points: [0, -0.05, -0.10, -0.09, -0.16, -0.22, -0.27, -0.34, -0.40, -0.46, -0.40, -0.32, -0.24, -0.15, -0.06, 0] }),
      'uk-equity': withIndices({ provider: 'FTSE All-Share', seriesId: 'FTSE All-Share TR', basis: 'total-return', currency: 'GBP',
        points: [0, -0.04, -0.08, -0.07, -0.13, -0.18, -0.24, -0.30, -0.36, -0.43, -0.37, -0.29, -0.21, -0.13, -0.05, 0] }),
      'govt-bonds': withIndices({ provider: 'Bloomberg', seriesId: 'Govt TR', basis: 'total-return', currency: 'GBP',
        points: [0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.10, 0.10, 0.11, 0.11, 0.12, 0.12] }),
      'property': withIndices({ provider: 'FTSE EPRA Nareit', seriesId: 'Developed REIT TR', basis: 'total-return', currency: 'GBP',
        points: [0, 0.01, 0.0, -0.02, -0.01, 0.01, 0.02, 0.03, 0.02, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.10] }),
      'cash': withIndices({ provider: 'FRED', seriesId: 'GBP 3m', basis: 'total-return', currency: 'GBP',
        points: Array.from({ length: 16 }, (_, i) => i * 0.004) }),
      'europe-equity': NO_SERIES, 'emerging-equity': NO_SERIES,
    },
  },
  {
    id: 'COVID_2020',
    name: 'COVID crash',
    shortLabel: '2020',
    yearLabel: '2020',
    granularity: 'monthly',
    beliefSalience: ['VOLATILITY_AVERSION'],
    inflationEpisode: false,
    selectionRationale: 'The fastest deep fall and recovery — pairs with 1929 for the symmetric panic/complacency beat.',
    paths: {
      'global-equity': withIndices({ provider: 'MSCI', seriesId: 'MSCI World TR', basis: 'total-return', currency: 'GBP',
        points: [0, -0.08, -0.34, -0.20, -0.10, -0.04, 0, 0.03] }),
      'us-equity': withIndices({ provider: 'S&P', seriesId: 'S&P 500 TR', basis: 'total-return', currency: 'GBP',
        points: [0, -0.07, -0.32, -0.18, -0.08, -0.02, 0, 0.04] }),
      'uk-equity': withIndices({ provider: 'FTSE All-Share', seriesId: 'FTSE All-Share TR', basis: 'total-return', currency: 'GBP',
        points: [0, -0.09, -0.36, -0.24, -0.16, -0.12, -0.10, -0.08] }),
      'govt-bonds': withIndices({ provider: 'Bloomberg', seriesId: 'Govt TR', basis: 'total-return', currency: 'GBP',
        points: [0, 0.02, 0.03, 0.02, 0.03, 0.03, 0.03, 0.03] }),
      'property': withIndices({ provider: 'FTSE EPRA Nareit', seriesId: 'Developed REIT TR', basis: 'total-return', currency: 'GBP',
        points: [0, -0.10, -0.28, -0.20, -0.16, -0.12, -0.10, -0.08] }),
      'cash': withIndices({ provider: 'FRED', seriesId: 'GBP 3m', basis: 'total-return', currency: 'GBP',
        points: Array.from({ length: 8 }, (_, i) => i * 0.001) }),
      'europe-equity': NO_SERIES, 'emerging-equity': NO_SERIES,
    },
  },
  {
    id: 'RATE_SHOCK_2022',
    name: 'Rates & inflation shock',
    shortLabel: '2022',
    yearLabel: '2022',
    granularity: 'monthly',
    beliefSalience: ['INFLATION_HEDGE_TILT', 'UK_BIAS'],
    inflationEpisode: true,
    selectionRationale: 'Equities and bonds fell together in real terms — the diversification-failed episode.',
    paths: {
      'global-equity': withIndices({ provider: 'MSCI', seriesId: 'MSCI World TR (real)', basis: 'total-return', currency: 'GBP',
        points: [0, -0.05, -0.08, -0.12, -0.15, -0.18, -0.16, -0.14, -0.16, -0.18, -0.15, -0.12, -0.10] }),
      'govt-bonds': withIndices({ provider: 'Bloomberg', seriesId: 'Global Agg (real)', basis: 'total-return', currency: 'GBP',
        points: [0, -0.03, -0.06, -0.09, -0.12, -0.14, -0.16, -0.15, -0.16, -0.16, -0.15, -0.14, -0.13] }),
      'uk-equity': withIndices({ provider: 'FTSE All-Share', seriesId: 'FTSE All-Share TR (real)', basis: 'total-return', currency: 'GBP',
        points: [0, -0.01, -0.02, -0.01, -0.02, -0.02, -0.01, -0.02, -0.03, -0.02, -0.02, -0.01, -0.02] }),
      'cash': withIndices({ provider: 'FRED', seriesId: 'GBP 3m (real)', basis: 'total-return', currency: 'GBP',
        points: [0, -0.01, -0.02, -0.03, -0.04, -0.05, -0.06, -0.06, -0.07, -0.07, -0.07, -0.07, -0.07] }),
      'property': withIndices({ provider: 'FTSE EPRA Nareit', seriesId: 'Developed REIT TR (real)', basis: 'total-return', currency: 'GBP',
        points: [0, -0.04, -0.08, -0.13, -0.18, -0.22, -0.24, -0.23, -0.24, -0.25, -0.23, -0.21, -0.20] }),
      'europe-equity': NO_SERIES, 'emerging-equity': NO_SERIES,
    },
  },
```

- [ ] **Step 4: Run; verify it passes**

Run: `npx vitest run client/src/data/episodeLibrary.test.ts --config vitest.config.server.ts`
Expected: PASS (all, incl. the inflation-flag and 7-episode tests).

- [ ] **Step 5: Commit**

```bash
git add client/src/data/episodeLibrary.ts client/src/data/episodeLibrary.test.ts
git commit -m "feat(scenario-planner): complete 7-episode roster with §7A salience re-tag"
```

---

### Task 5: Mix vector — `portfolioMix.ts`

**Files:**
- Create: `client/src/lib/portfolioMix.ts`
- Create: `client/src/lib/portfolioMix.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { mixFromHoldings, mixFromBands, type MixHolding } from './portfolioMix';
import { BUCKETS } from '../data/episodeLibrary';
import type { AllocationBand } from '../state/onboardingV2Store';

function sum(mix: Record<string, number>): number {
  return Object.values(mix).reduce((s, v) => s + v, 0);
}

describe('mixFromHoldings', () => {
  it('value-weights mappable holdings to buckets, summing to 1', () => {
    const holdings: MixHolding[] = [
      { asset_class: 'equity', region: 'uk', value_gbp: 210 },
      { asset_class: 'equity', region: 'global', value_gbp: 300 },
      { asset_class: 'bond', region: 'global', value_gbp: 150 },
      { asset_class: 'cash', region: 'uk', value_gbp: 50 },
    ];
    const { mix, unmodelledShare } = mixFromHoldings(holdings);
    expect(sum(mix)).toBeCloseTo(1, 10);
    expect(mix['uk-equity']).toBeCloseTo(210 / 710, 10);
    expect(unmodelledShare).toBe(0);
  });

  it('reports unmodelled share for unmappable holdings and excludes them from the mix', () => {
    const holdings: MixHolding[] = [
      { asset_class: 'equity', region: 'global', value_gbp: 800 },
      { asset_class: 'private_equity', region: 'global', value_gbp: 200 }, // unmappable
    ];
    const { mix, unmodelledShare } = mixFromHoldings(holdings);
    expect(unmodelledShare).toBeCloseTo(0.2, 10);
    expect(sum(mix)).toBeCloseTo(1, 10); // mix normalised over modelled buckets only
    expect(mix['global-equity']).toBeCloseTo(1, 10);
  });

  it('returns an all-zero mix and zero unmodelled for empty/zero holdings', () => {
    const { mix, unmodelledShare } = mixFromHoldings([]);
    expect(sum(mix)).toBe(0);
    expect(unmodelledShare).toBe(0);
  });
});

describe('mixFromBands (§7 comparison vector — derive from step-7 bands)', () => {
  function band(sleeve: string, low: number, high: number): AllocationBand {
    return {
      sleeve, current_pct: (low + high) / 2, illustrative_low_pct: low, illustrative_high_pct: high,
      direction: 'NEUTRAL' as const, midpoint_pct: (low + high) / 2, pressure: 0, clamped: false,
      debug: {} as never,
    };
  }
  it('takes band midpoints and normalises to a bucket vector summing to 1', () => {
    const assetBands = [band('Equity', 50, 70), band('Bond', 20, 30), band('Cash', 5, 15)];
    const regionBands = [band('UK', 30, 50), band('Global', 40, 60)];
    const mix = mixFromBands(assetBands, regionBands);
    expect(sum(mix)).toBeCloseTo(1, 10);
    // equity midpoint 60 split across region midpoints (UK 40, Global 50 → 4/9, 5/9)
    expect(mix['uk-equity']).toBeGreaterThan(0);
    expect(mix['global-equity']).toBeGreaterThan(0);
    expect(mix['govt-bonds']).toBeGreaterThan(0);
    expect(mix['cash']).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run; verify it fails**

Run: `npx vitest run client/src/lib/portfolioMix.test.ts --config vitest.config.server.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `portfolioMix.ts`**

```ts
import { BUCKETS, bucketFor, type Bucket } from '../data/episodeLibrary';
import type { AllocationBand } from '../state/onboardingV2Store';

export type Mix = Record<Bucket, number>;
export interface MixHolding { asset_class: string; region: string; value_gbp: number; }

function emptyMix(): Mix {
  return Object.fromEntries(BUCKETS.map((b) => [b, 0])) as Mix;
}

/** Mix from real holdings. Unmappable holdings (PE, structured, FX) are reported as unmodelledShare
 *  (§5 scope contract) and excluded; the returned mix is normalised over modelled buckets only. */
export function mixFromHoldings(holdings: MixHolding[]): { mix: Mix; unmodelledShare: number } {
  const valid = holdings.filter((h) => h.value_gbp > 0);
  const total = valid.reduce((s, h) => s + h.value_gbp, 0);
  if (total <= 0) return { mix: emptyMix(), unmodelledShare: 0 };

  const mix = emptyMix();
  let modelled = 0;
  for (const h of valid) {
    const bucket = bucketFor(h.asset_class, h.region);
    if (bucket === null) continue;
    mix[bucket] += h.value_gbp;
    modelled += h.value_gbp;
  }
  const unmodelledShare = (total - modelled) / total;
  if (modelled > 0) for (const b of BUCKETS) mix[b] = mix[b] / modelled;
  return { mix, unmodelledShare };
}

/** §7 / P1-3: step-7 produces allocation BANDS (low/high, asset_class axis + region axis), not a vector.
 *  Rule: take each band's midpoint; allocate each asset-class midpoint across region midpoints
 *  pro-rata (equity split by region weights); bond/cash/property stay region-agnostic; normalise to 1. */
export function mixFromBands(assetBands: AllocationBand[], regionBands: AllocationBand[]): Mix {
  const mid = (b: AllocationBand) => (b.illustrative_low_pct + b.illustrative_high_pct) / 2;
  const assetMid: Record<string, number> = {};
  for (const b of assetBands) assetMid[b.sleeve.trim().toLowerCase()] = mid(b);

  const regionMid: Record<string, number> = {};
  let regionTotal = 0;
  for (const b of regionBands) {
    const v = mid(b);
    regionMid[b.sleeve.trim().toLowerCase()] = v;
    regionTotal += v;
  }
  const regionWeight = (rg: string) => (regionTotal > 0 ? (regionMid[rg] ?? 0) / regionTotal : 0);

  const mix = emptyMix();
  const equity = assetMid['equity'] ?? 0;
  mix['uk-equity'] = equity * regionWeight('uk');
  mix['us-equity'] = equity * regionWeight('us');
  mix['europe-equity'] = equity * regionWeight('europe');
  mix['emerging-equity'] = equity * regionWeight('emerging');
  mix['global-equity'] = equity * regionWeight('global');
  mix['govt-bonds'] = assetMid['bond'] ?? 0;
  mix['property'] = assetMid['property'] ?? 0;
  mix['cash'] = assetMid['cash'] ?? 0;

  const total = BUCKETS.reduce((s, b) => s + mix[b], 0);
  if (total > 0) for (const b of BUCKETS) mix[b] = mix[b] / total;
  return mix;
}
```

- [ ] **Step 4: Run; verify it passes**

Run: `npx vitest run client/src/lib/portfolioMix.test.ts --config vitest.config.server.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/portfolioMix.ts client/src/lib/portfolioMix.test.ts
git commit -m "feat(scenario-planner): portfolioMix — holdings + step-7-band vectors"
```

---

### Task 6: The replay engine — `empiricalEngine.ts`

Implements §3 of the logic doc: `portfolioReturn(t) = Σ w[i]·E.path[i][t]`, drawdown, recovery, contributors at trough, no-data share. Buckets with `null` path are excluded from the sum (never zero-filled) and their weight is reported as `noDataShare`.

**Files:**
- Create: `client/src/lib/empiricalEngine.ts`
- Create: `client/src/lib/empiricalEngine.test.ts`

- [ ] **Step 1: Write the failing test (incl. the §8 worked example)**

```ts
import { describe, it, expect } from 'vitest';
import { replayEpisode } from './empiricalEngine';
import { EPISODES, BUCKETS, type Episode, type Bucket } from '../data/episodeLibrary';
import type { Mix } from './portfolioMix';

function mixOf(parts: Partial<Record<Bucket, number>>): Mix {
  return Object.fromEntries(BUCKETS.map((b) => [b, parts[b] ?? 0])) as Mix;
}

// A synthetic episode to pin the formula exactly (§8 worked example).
const WORKED: Episode = {
  id: 'WORKED', name: 'Worked', shortLabel: 'W', yearLabel: '', granularity: 'monthly',
  beliefSalience: ['VOLATILITY_AVERSION'], inflationEpisode: false, selectionRationale: '',
  paths: {
    'global-equity': { provider: 'x', seriesId: 'x', basis: 'total-return', currency: 'GBP',
      points: [0, -0.45], troughIndex: 1, recoveryIndex: -1 },
    'govt-bonds': { provider: 'x', seriesId: 'x', basis: 'total-return', currency: 'GBP',
      points: [0, 0.06], troughIndex: 0, recoveryIndex: 0 },
    'cash': { provider: 'x', seriesId: 'x', basis: 'total-return', currency: 'GBP',
      points: [0, 0.0], troughIndex: 0, recoveryIndex: 0 },
    'uk-equity': null, 'us-equity': null, 'europe-equity': null, 'emerging-equity': null, 'property': null,
  },
};

describe('replayEpisode — §8 worked example', () => {
  const mix = mixOf({ 'global-equity': 0.6, 'govt-bonds': 0.3, 'cash': 0.1 });

  it('value-weights bucket paths into a portfolio path', () => {
    const r = replayEpisode(mix, WORKED, 500_000);
    expect(r.points[1]).toBeCloseTo(0.6 * -0.45 + 0.3 * 0.06 + 0.1 * 0, 10); // -0.252
  });

  it('reads drawdown at the trough', () => {
    const r = replayEpisode(mix, WORKED, 500_000);
    expect(r.drawdown).toBeCloseTo(-0.252, 10);
    expect(r.troughIndex).toBe(1);
  });

  it('ranks contributors at the trough in signed £, excluding protective holdings', () => {
    const r = replayEpisode(mix, WORKED, 500_000);
    expect(r.contributors[0].label).toBe('global-equity');
    expect(r.contributors[0].impactGbp).toBeCloseTo(0.6 * -0.45 * 500_000, 6); // -135,000
    expect(r.contributors.find((c) => c.label === 'govt-bonds')).toBeUndefined(); // protective
  });

  it('reports the weight in no-data buckets and excludes them from the sum (never zero-filled)', () => {
    const m = mixOf({ 'global-equity': 0.5, 'emerging-equity': 0.5 }); // emerging null in WORKED
    const r = replayEpisode(m, WORKED, 100);
    expect(r.noDataShare).toBeCloseTo(0.5, 10);
    expect(r.points[1]).toBeCloseTo(0.5 * -0.45, 10); // emerging excluded, NOT zero-added
  });
});

describe('replayEpisode — real GFC episode (invariant #3: no extrapolation)', () => {
  it('never reports a drawdown deeper than the worst bucket the mix actually holds', () => {
    const gfc = EPISODES.find((e) => e.id === 'GFC_2008')!;
    const mix = mixOf({ 'global-equity': 0.7, 'govt-bonds': 0.3 });
    const r = replayEpisode(mix, gfc, 1_000_000);
    const worstGlobal = Math.min(...gfc.paths['global-equity']!.points);
    expect(r.drawdown).toBeGreaterThanOrEqual(worstGlobal); // weighted ⇒ shallower than worst single bucket
  });

  it('computes recovery in steps from the trough (null if not recovered in window)', () => {
    const gfc = EPISODES.find((e) => e.id === 'GFC_2008')!;
    const r = replayEpisode(mixOf({ 'global-equity': 1 }), gfc, 100);
    expect(r.recoverySteps).not.toBeNull();
    expect(r.recoverySteps).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run; verify it fails**

Run: `npx vitest run client/src/lib/empiricalEngine.test.ts --config vitest.config.server.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `empiricalEngine.ts`**

```ts
import { BUCKETS, type Bucket, type Episode, type Granularity } from '../data/episodeLibrary';
import { rankContributors, type StressContributor } from './portfolioMath';
import type { Mix } from './portfolioMix';

export interface EpisodeReplay {
  episodeId: string;
  granularity: Granularity;
  /** portfolio cumulative return per step, value-weighted over buckets WITH data this episode */
  points: number[];
  drawdown: number;
  troughIndex: number;
  /** steps from trough until portfolio cum. return >= 0 again; null if not recovered in the window */
  recoverySteps: number | null;
  contributors: StressContributor[];
  /** weight of the mix sitting in buckets with no series this episode (excluded from the sum) */
  noDataShare: number;
}

export function replayEpisode(mix: Mix, episode: Episode, startValue: number): EpisodeReplay {
  // Buckets that have BOTH weight and a series this episode contribute.
  const active: { bucket: Bucket; weight: number; points: number[] }[] = [];
  let noDataShare = 0;
  for (const bucket of BUCKETS) {
    const w = mix[bucket];
    if (w <= 0) continue;
    const path = episode.paths[bucket];
    if (path === null) { noDataShare += w; continue; } // never zero-filled
    active.push({ bucket, weight: w, points: path.points });
  }

  const length = active.reduce((max, a) => Math.max(max, a.points.length), 0);
  const points: number[] = [];
  for (let t = 0; t < length; t++) {
    let r = 0;
    for (const a of active) r += a.weight * (a.points[t] ?? a.points[a.points.length - 1]);
    points.push(r);
  }
  if (points.length === 0) points.push(0);

  const drawdown = Math.min(...points);
  const troughIndex = points.indexOf(drawdown);

  let recoverySteps: number | null = null;
  for (let t = troughIndex; t < points.length; t++) {
    if (points[t] >= 0) { recoverySteps = t - troughIndex; break; }
  }

  const contributors = rankContributors(
    active.map((a) => ({
      label: a.bucket,
      impactGbp: a.weight * (a.points[troughIndex] ?? 0) * startValue,
    })),
    3,
  );

  return {
    episodeId: episode.id,
    granularity: episode.granularity,
    points,
    drawdown,
    troughIndex,
    recoverySteps,
    contributors,
    noDataShare,
  };
}
```

- [ ] **Step 4: Run; verify it passes**

Run: `npx vitest run client/src/lib/empiricalEngine.test.ts --config vitest.config.server.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/empiricalEngine.ts client/src/lib/empiricalEngine.test.ts
git commit -m "feat(scenario-planner): empirical replay engine (path/drawdown/recovery/contributors)"
```

---

### Task 7: Blend + read-position — `episodeBlend.ts`

Implements §4–§5 of the logic doc. The band is the per-step **min/max actually observed** across the selected episodes — never a multiplier. `readAt` interpolates between the central path and the worst edge (`band.min`); `r=0` → central (default), `r=1` → worst edge. Guarded so it can never produce a value below `band.min` (invariant #3).

**Files:**
- Create: `client/src/lib/episodeBlend.ts`
- Create: `client/src/lib/episodeBlend.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { blendEpisodes, readAt, type Blend } from './episodeBlend';
import type { EpisodeReplay } from './empiricalEngine';

function replay(id: string, points: number[]): EpisodeReplay {
  return {
    episodeId: id, granularity: 'monthly', points,
    drawdown: Math.min(...points), troughIndex: points.indexOf(Math.min(...points)),
    recoverySteps: null, contributors: [], noDataShare: 0,
  };
}

describe('blendEpisodes', () => {
  it('central path is the weight-average of replay paths', () => {
    const b = blendEpisodes([replay('A', [0, -0.30]), replay('B', [0, -0.10])], [0.5, 0.5]);
    expect(b.central[1]).toBeCloseTo(-0.20, 10);
  });

  it('band is the per-step observed min/max — not a multiplier', () => {
    const b = blendEpisodes([replay('A', [0, -0.30]), replay('B', [0, -0.10])], [0.5, 0.5]);
    expect(b.band.min[1]).toBeCloseTo(-0.30, 10);
    expect(b.band.max[1]).toBeCloseTo(-0.10, 10);
  });

  it('normalises weights that do not sum to 1', () => {
    const b = blendEpisodes([replay('A', [0, -0.40]), replay('B', [0, 0])], [3, 1]);
    expect(b.central[1]).toBeCloseTo(0.75 * -0.40, 10);
  });

  it('single episode collapses the band to the central line', () => {
    const b = blendEpisodes([replay('A', [0, -0.25])], [1]);
    expect(b.band.min[1]).toBeCloseTo(b.central[1], 10);
    expect(b.band.max[1]).toBeCloseTo(b.central[1], 10);
  });
});

describe('readAt — read-position within the observed band (§5)', () => {
  const blend: Blend = {
    central: [0, -0.226], band: { min: [0, -0.252], max: [0, -0.20] },
  };
  it('r=0 returns the central path (default typical)', () => {
    expect(readAt(blend, 0)[1]).toBeCloseTo(-0.226, 10);
  });
  it('r=1 returns the worst observed edge — never beyond it (invariant #3)', () => {
    expect(readAt(blend, 1)[1]).toBeCloseTo(-0.252, 10);
  });
  it('clamps r to [0,1] so it can never extrapolate past observed history', () => {
    expect(readAt(blend, 5)[1]).toBeCloseTo(-0.252, 10);
    expect(readAt(blend, -5)[1]).toBeCloseTo(-0.226, 10);
  });
});
```

- [ ] **Step 2: Run; verify it fails**

Run: `npx vitest run client/src/lib/episodeBlend.test.ts --config vitest.config.server.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `episodeBlend.ts`**

```ts
import type { EpisodeReplay } from './empiricalEngine';

export interface BlendBand { min: number[]; max: number[]; }
export interface Blend { central: number[]; band: BlendBand; }

/** Weighted-average central path + per-step observed min/max band across the selected replays.
 *  Replays should share granularity/length (enforced upstream by only offering matching episodes). */
export function blendEpisodes(replays: EpisodeReplay[], weights: number[]): Blend {
  if (replays.length === 0) return { central: [0], band: { min: [0], max: [0] } };
  const wsum = weights.reduce((s, w) => s + w, 0) || 1;
  const w = weights.map((x) => x / wsum);
  const length = replays.reduce((m, r) => Math.max(m, r.points.length), 0);

  const central: number[] = [];
  const min: number[] = [];
  const max: number[] = [];
  for (let t = 0; t < length; t++) {
    const vals = replays.map((r) => r.points[t] ?? r.points[r.points.length - 1]);
    central.push(vals.reduce((s, v, i) => s + w[i] * v, 0));
    min.push(Math.min(...vals));
    max.push(Math.max(...vals));
  }
  return { central, band: { min, max } };
}

/** readValue(t) = central(t) + r·(worstEdge(t) − central(t)), worstEdge = band.min, r clamped to [0,1].
 *  r=0 → typical (central), r=1 → worst markets reached. Never beyond the observed worst edge. */
export function readAt(blend: Blend, r: number): number[] {
  const rr = Math.max(0, Math.min(1, r));
  return blend.central.map((c, t) => c + rr * (blend.band.min[t] - c));
}
```

- [ ] **Step 4: Run; verify it passes**

Run: `npx vitest run client/src/lib/episodeBlend.test.ts --config vitest.config.server.ts`
Expected: PASS.

- [ ] **Step 5: Add the invariant guard test (§0 / P1-2)**

Append to `episodeBlend.test.ts`:

```ts
describe('invariant guard: no {0.7,1.4} multiplier anywhere in the engine', () => {
  it('the band is min/max of observed paths, so it equals the worst input exactly', () => {
    const b = blendEpisodes([replay('A', [0, -0.30]), replay('B', [0, -0.50])], [0.5, 0.5]);
    expect(b.band.min[1]).toBeCloseTo(-0.50, 10); // = worst observed, NOT central×1.4
    expect(b.band.min[1]).not.toBeCloseTo(b.central[1] * 1.4, 5);
  });
});
```

Run the file again → Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add client/src/lib/episodeBlend.ts client/src/lib/episodeBlend.test.ts
git commit -m "feat(scenario-planner): episode blend + read-position (observed band, no multiplier)"
```

---

### Task 8: Salience + circumstance — `episodeSalience.ts`

Implements §7/§7A ordering and the horizon/circumstance input (derived from existing intake fields — `personaCues.portfolio_stage` and `intake.time_horizon_years` — so no new question is needed for v1; the optional macro-concern question is deferred).

**Files:**
- Create: `client/src/lib/episodeSalience.ts`
- Create: `client/src/lib/episodeSalience.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { circumstanceFromIntake, orderEpisodesBySalience } from './episodeSalience';
import { EPISODES } from '../data/episodeLibrary';

describe('circumstanceFromIntake', () => {
  it('flags decumulation when portfolio_stage is a drawdown stage', () => {
    expect(circumstanceFromIntake({ portfolio_stage: 'PRIMARILY_DRAWDOWN', time_horizon_years: '20' }).decumulating).toBe(true);
    expect(circumstanceFromIntake({ portfolio_stage: 'STARTING_DRAWDOWN', time_horizon_years: '20' }).decumulating).toBe(true);
    expect(circumstanceFromIntake({ portfolio_stage: 'ACCUMULATING', time_horizon_years: '20' }).decumulating).toBe(false);
  });
  it('flags short horizon when time_horizon_years parses below 5', () => {
    expect(circumstanceFromIntake({ portfolio_stage: null, time_horizon_years: '3' }).shortHorizon).toBe(true);
    expect(circumstanceFromIntake({ portfolio_stage: null, time_horizon_years: '10' }).shortHorizon).toBe(false);
    expect(circumstanceFromIntake({ portfolio_stage: null, time_horizon_years: '' }).shortHorizon).toBe(false);
  });
});

describe('orderEpisodesBySalience (§7A — chronological within groups, no episode dropped)', () => {
  it('puts episodes matching a >0.20 belief axis first, chronological within each group', () => {
    const ordered = orderEpisodesBySalience(EPISODES, { axisScores: { TECH_TILT: 0.5 } });
    expect(ordered).toHaveLength(EPISODES.length); // nothing dropped
    expect(ordered[0].id).toBe('DOTCOM_2000'); // only salient episode → first
  });
  it('defaults to chronological order when no axis is expressed (not worst-first — P3-2)', () => {
    const ordered = orderEpisodesBySalience(EPISODES, { axisScores: {} });
    const years = ordered.map((e) => e.shortLabel);
    expect(years).toEqual(['1929', '1973', '1987', '2000', '2008', '2020', '2022']);
  });
});
```

- [ ] **Step 2: Run; verify it fails**

Run: `npx vitest run client/src/lib/episodeSalience.test.ts --config vitest.config.server.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `episodeSalience.ts`**

```ts
import type { AxisCode, PortfolioStage } from '../state/onboardingV2Store';
import { type Episode } from '../data/episodeLibrary';

const TOWARDS_THRESHOLD = 0.2; // matches scenarioStressSalience.ts

export interface SalienceInput { axisScores: Partial<Record<AxisCode, number>>; }

export interface Circumstance { decumulating: boolean; shortHorizon: boolean; }

/** Derive the §7A circumstance from existing intake fields — no new question for v1. */
export function circumstanceFromIntake(input: {
  portfolio_stage: PortfolioStage; time_horizon_years: string;
}): Circumstance {
  const decumulating = input.portfolio_stage === 'STARTING_DRAWDOWN' || input.portfolio_stage === 'PRIMARILY_DRAWDOWN';
  const years = parseInt(input.time_horizon_years, 10);
  const shortHorizon = Number.isFinite(years) && years > 0 && years < 5;
  return { decumulating, shortHorizon };
}

function isSalient(ep: Episode, input: SalienceInput): boolean {
  return ep.beliefSalience.some((axis) => (input.axisScores[axis] ?? 0) > TOWARDS_THRESHOLD);
}

/** Stable partition: salient episodes first, chronological (input EPISODES order) within each group.
 *  No episode is dropped (P3-2). EPISODES is authored chronologically. */
export function orderEpisodesBySalience(episodes: Episode[], input: SalienceInput): Episode[] {
  const salient: Episode[] = [];
  const rest: Episode[] = [];
  for (const ep of episodes) (isSalient(ep, input) ? salient : rest).push(ep);
  return [...salient, ...rest];
}
```

- [ ] **Step 4: Run; verify it passes**

Run: `npx vitest run client/src/lib/episodeSalience.test.ts --config vitest.config.server.ts`
Expected: PASS. (EPISODES is authored 1929→2022; the chronological test confirms that ordering.)

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/episodeSalience.ts client/src/lib/episodeSalience.test.ts
git commit -m "feat(scenario-planner): salience ordering + circumstance derivation (§7A)"
```

---

### Task 9: View formatting — `scenarioPlannerView.ts`

**Files:**
- Create: `client/src/lib/scenarioPlannerView.ts`
- Create: `client/src/lib/scenarioPlannerView.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { fmtSignedPct, fmtRecovery, scopeContractLine } from './scenarioPlannerView';

describe('fmtSignedPct', () => {
  it('uses the U+2212 minus and rounds to whole %', () => {
    expect(fmtSignedPct(-0.252)).toBe('−25%');
    expect(fmtSignedPct(0.06)).toBe('+6%');
    expect(fmtSignedPct(0)).toBe('0%');
  });
});

describe('fmtRecovery', () => {
  it('formats monthly recovery in months', () => {
    expect(fmtRecovery(14, 'monthly', false)).toBe('14 months');
  });
  it('formats annual recovery in years', () => {
    expect(fmtRecovery(25, 'annual', false)).toBe('25 years');
  });
  it('flags real-terms for inflation episodes', () => {
    expect(fmtRecovery(8, 'annual', true)).toBe('8 years (real terms)');
  });
  it('handles not-recovered-in-window', () => {
    expect(fmtRecovery(null, 'monthly', false)).toBe('not recovered within the recorded window');
  });
});

describe('scopeContractLine (§5 modelled-vs-unmodelled, up-front)', () => {
  it('states the modelled share without advice verbs', () => {
    expect(scopeContractLine(0.2)).toContain('80%');
    expect(scopeContractLine(0)).toContain('all');
  });
});
```

- [ ] **Step 2: Run; verify it fails**

Run: `npx vitest run client/src/lib/scenarioPlannerView.test.ts --config vitest.config.server.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `scenarioPlannerView.ts`**

```ts
import type { Granularity } from '../data/episodeLibrary';

/** Signed whole-% with the U+2212 minus, matching scenarioStressView conventions. */
export function fmtSignedPct(n: number): string {
  const v = Math.round(n * 100);
  const sign = v > 0 ? '+' : v < 0 ? '−' : '';
  return `${sign}${Math.abs(v)}%`;
}

/** Recovery, in the episode's native unit; real-terms tagged for inflation episodes (§5 / P2-3). */
export function fmtRecovery(steps: number | null, granularity: Granularity, inflationEpisode: boolean): string {
  if (steps === null) return 'not recovered within the recorded window';
  const unit = granularity === 'annual' ? 'year' : 'month';
  const plural = steps === 1 ? unit : `${unit}s`;
  return `${steps} ${plural}${inflationEpisode ? ' (real terms)' : ''}`;
}

/** Up-front scope contract: what share of the portfolio this models (§5 / P2-4/6). Descriptive, no verbs. */
export function scopeContractLine(unmodelledShare: number): string {
  const modelled = Math.round((1 - unmodelledShare) * 100);
  if (modelled >= 100) return 'This view maps all of your holdings to a historical bucket.';
  return `This view maps about ${modelled}% of your portfolio to a historical bucket; ` +
    `the remainder sits in holdings with no comparable historical series and is shown separately.`;
}
```

- [ ] **Step 4: Run; verify it passes**

Run: `npx vitest run client/src/lib/scenarioPlannerView.test.ts --config vitest.config.server.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/scenarioPlannerView.ts client/src/lib/scenarioPlannerView.test.ts
git commit -m "feat(scenario-planner): view formatting (signed %, recovery real-terms, scope contract)"
```

---

### Task 10: Engine integration smoke test

Pins the whole pipeline end-to-end on a real portfolio + real episodes so a later change to any layer surfaces here.

**Files:**
- Create: `client/src/lib/scenarioPlannerPipeline.test.ts`

- [ ] **Step 1: Write the test**

```ts
import { describe, it, expect } from 'vitest';
import { EPISODES } from '../data/episodeLibrary';
import { mixFromHoldings } from './portfolioMix';
import { replayEpisode } from './empiricalEngine';
import { blendEpisodes, readAt } from './episodeBlend';
import { orderEpisodesBySalience } from './episodeSalience';

describe('end-to-end pipeline', () => {
  const holdings = [
    { asset_class: 'equity', region: 'global', value_gbp: 300_000 },
    { asset_class: 'bond', region: 'global', value_gbp: 150_000 },
    { asset_class: 'cash', region: 'uk', value_gbp: 50_000 },
  ];

  it('produces a sane blended read path that never beats the worst observed edge', () => {
    const { mix } = mixFromHoldings(holdings);
    const ordered = orderEpisodesBySalience(EPISODES, { axisScores: { VOLATILITY_AVERSION: 0.6 } });
    // pick two monthly episodes to keep granularity uniform
    const chosen = ordered.filter((e) => e.granularity === 'monthly' && ['GFC_2008', 'COVID_2020'].includes(e.id));
    const replays = chosen.map((e) => replayEpisode(mix, e, 500_000));
    const blend = blendEpisodes(replays, replays.map(() => 1));
    const worst = readAt(blend, 1);
    const typical = readAt(blend, 0);
    for (let t = 0; t < worst.length; t++) {
      expect(worst[t]).toBeGreaterThanOrEqual(blend.band.min[t] - 1e-9); // never beyond observed
      expect(typical[t]).toBeCloseTo(blend.central[t], 10);
    }
  });

  it('drawdown is shallower than a 100% global-equity replay (diversification shows)', () => {
    const { mix } = mixFromHoldings(holdings);
    const gfc = EPISODES.find((e) => e.id === 'GFC_2008')!;
    const mixed = replayEpisode(mix, gfc, 500_000).drawdown;
    const allEquity = replayEpisode(
      { ...mix, 'global-equity': 1, 'govt-bonds': 0, 'cash': 0 } as typeof mix, gfc, 500_000,
    ).drawdown;
    expect(mixed).toBeGreaterThan(allEquity);
  });
});
```

- [ ] **Step 2: Run; verify it passes**

Run: `npx vitest run client/src/lib/scenarioPlannerPipeline.test.ts --config vitest.config.server.ts`
Expected: PASS.

- [ ] **Step 3: Full suite + type-check checkpoint**

Run: `npm test 2>&1 | tail -3` → all green (baseline + new).
Run: `npm run check 2>&1 | grep -c "error TS"` → ≤ `N_BASELINE`.

- [ ] **Step 4: Commit**

```bash
git add client/src/lib/scenarioPlannerPipeline.test.ts
git commit -m "test(scenario-planner): end-to-end engine pipeline smoke"
```

---

## Phase 3 — Stepped UI (v1 = Stages 1–3)

> UI is verified visually (no jsdom/RTL in this repo). Narration copy is in a pure `.ts` module so it stays lint-tested.

### Task 11: Narration copy module + feature flag

**Files:**
- Create: `client/src/data/scenarioPlannerCopy.ts`
- Create: `client/src/data/scenarioPlannerCopy.test.ts`
- Create: `client/src/lib/featureFlags.ts`

- [ ] **Step 1: Write the failing lint test (banned verbs + forecast words, §9)**

```ts
import { describe, it, expect } from 'vitest';
import { STAGE_COPY, ADVICE_EXIT, TARGET_MARKET, NARRATIVE_FALLACY_NOTE, RECOVERY_COUNTER_BEAT } from './scenarioPlannerCopy';

const BANNED_VERBS = ['should', 'must', 'buy', 'sell', 'optimise', 'optimize', 'improve', 'save', 'increase', 'decrease'];
const FORECAST_WORDS = ['will fall', 'will rise', 'predict', 'forecast', 'expected to', 'probability', 'chance of', 'likely to'];

function allStrings(): string[] {
  const out: string[] = [ADVICE_EXIT, TARGET_MARKET, NARRATIVE_FALLACY_NOTE, RECOVERY_COUNTER_BEAT];
  for (const s of STAGE_COPY) out.push(s.leadIn, s.complianceCaption, s.worthSittingWith);
  return out;
}

describe('scenario planner copy — compliance lint (§9)', () => {
  it('contains no advice verbs', () => {
    for (const text of allStrings()) {
      for (const verb of BANNED_VERBS) {
        expect(new RegExp(`\\b${verb}\\b`, 'i').test(text)).toBe(false);
      }
    }
  });
  it('contains no forecast framing', () => {
    for (const text of allStrings()) {
      for (const phrase of FORECAST_WORDS) {
        expect(text.toLowerCase().includes(phrase)).toBe(false);
      }
    }
  });
  it('has copy for all four stages', () => {
    expect(STAGE_COPY).toHaveLength(4);
  });
  it('every compliance caption asserts history-not-prediction', () => {
    for (const s of STAGE_COPY) expect(s.complianceCaption.toLowerCase()).toContain('not a prediction');
  });
  it('the recovery counter-beat names the duration risk for a shorter horizon (§10/P1-6)', () => {
    expect(RECOVERY_COUNTER_BEAT.toLowerCase()).toMatch(/year|recover/);
  });
});
```

- [ ] **Step 2: Run; verify it fails**

Run: `npx vitest run client/src/data/scenarioPlannerCopy.test.ts --config vitest.config.server.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `scenarioPlannerCopy.ts`**

> **§13 GATE:** this copy is provisional. Final wording must come from the Unlock content brain and pass the FCA checker (`cloudworkz-skills:fca-guidance-checker`) before production. Marked `// CONTENT-BRAIN-GATE`. The lint test is the floor, not the ceiling.

```ts
// CONTENT-BRAIN-GATE: provisional voice — replace via Unlock content brain + FCA checker before prod (§13).

export interface StageCopy {
  stage: 1 | 2 | 3 | 4;
  title: string;
  leadIn: string;
  complianceCaption: string;
  worthSittingWith: string; // symmetric behavioural beat — panic AND complacency (P1-6)
}

export const STAGE_COPY: StageCopy[] = [
  {
    stage: 1,
    title: 'The stress test',
    leadIn: 'This is the actual path those assets took during this episode, mapped onto your holdings — the fall and the recovery together.',
    complianceCaption: 'This is what history recorded, not a prediction. Future episodes can differ, and losses can exceed what is shown here.',
    worthSittingWith: 'Two reactions both tend to backfire: selling at the trough locks in the fall, and assuming the line always climbs back ignores how long some recoveries took.',
  },
  {
    stage: 2,
    title: 'Across history',
    leadIn: 'The same holdings, read across each recorded episode, in time order — each pairing the deepest fall with how long the recovery took.',
    complianceCaption: 'Each figure traces to a cited historical series. This is a record of the past, not a prediction of the next downturn.',
    worthSittingWith: 'Episodes rhyme, they do not repeat. A fast recovery in one episode is not a promise about another; a slow one is not a verdict on the future.',
  },
  {
    stage: 3,
    title: 'Tune it',
    leadIn: 'Combine episodes to see the range they reached together, then read anywhere between the typical and the worst edge those episodes actually hit.',
    complianceCaption: 'The band is the best and worst these selected episodes reached — not a prediction, and future losses can exceed this edge.',
    worthSittingWith: 'Reading at the worst edge shows the deepest point markets reached here. It is a record, not a floor — and not a forecast of the next one.',
  },
  {
    stage: 4,
    title: 'Compare mixes',
    leadIn: 'The same episodes, read against an alternative composition, shown as a neutral comparison across episodes.',
    complianceCaption: 'A comparison of how two compositions behaved in the recorded past — not a prediction, and not a comparison of merit.',
    worthSittingWith: 'A composition that fell less in one episode fell more in another. The trade-off runs both ways across the set.',
  },
];

export const NARRATIVE_FALLACY_NOTE =
  'Episode labels describe these particular episodes, not a taxonomy of the next downturn — episodes rhyme, they do not repeat.';

export const TARGET_MARKET =
  'This view is for self-directed investors exploring how their own holdings behaved across historical periods of stress.';

// §10 / P1-6 / P1-7 — foregrounded for short-horizon / decumulating users: a multi-year recovery
// may outlast the window they have, and an investor drawing income realises the fall permanently.
export const RECOVERY_COUNTER_BEAT =
  'Some of these recoveries took many years. For someone drawing on this money, or with a short horizon, ' +
  'the time spent below the starting point matters as much as the depth of the fall — a recovery that arrives ' +
  'after the money is needed arrives too late.';

// Outcome-4 advice pointer (§9 / P2-5) — neutral, non-promotional.
export const ADVICE_EXIT =
  'Decisions about your own portfolio, in light of your full circumstances, are where regulated financial advice is the right place to turn.';
```

- [ ] **Step 4: Implement `featureFlags.ts`**

```ts
/** Stage-4 mix-comparison delta is human-gated by compliance (§13) — dark until signed off.
 *  Toggle via Vite env VITE_SCENARIO_DELTA=1 once the §13 gate clears; defaults OFF. */
export const DELTA_ENABLED: boolean =
  typeof import.meta !== 'undefined' && (import.meta as { env?: Record<string, string> }).env?.VITE_SCENARIO_DELTA === '1';
```

- [ ] **Step 5: Run; verify it passes**

Run: `npx vitest run client/src/data/scenarioPlannerCopy.test.ts --config vitest.config.server.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add client/src/data/scenarioPlannerCopy.ts client/src/data/scenarioPlannerCopy.test.ts client/src/lib/featureFlags.ts
git commit -m "feat(scenario-planner): provisional narration copy (lint-passed) + delta feature flag"
```

---

### Task 12: `PathChart.tsx` — the stable-spine chart

**Files:**
- Create: `client/src/components/onboarding-v2/scenario-planner/PathChart.tsx`

- [ ] **Step 1: Implement the chart**

Renders the central path, the observed band (as an area between `band.min`/`band.max`), the read-position line, and a marker at the trough. Recharts is already a dependency. The chart is the constant visual across all stages — props change, the spine stays.

```tsx
import { useMemo } from 'react';
import {
  ComposedChart, Area, Line, XAxis, YAxis, ReferenceDot, ResponsiveContainer, Tooltip,
} from 'recharts';
import type { Blend } from '@/lib/episodeBlend';
import { fmtSignedPct } from '@/lib/scenarioPlannerView';

export interface PathChartProps {
  /** central + band; for a single episode the band collapses to the line */
  blend: Blend;
  /** the read-position path (central when r=0); pass the same as central to hide the read line */
  readPath: number[];
  /** native step label, e.g. 'month' | 'year' */
  stepUnit: 'month' | 'year';
  troughIndex: number;
}

export default function PathChart({ blend, readPath, stepUnit, troughIndex }: PathChartProps) {
  const data = useMemo(
    () =>
      blend.central.map((c, t) => ({
        t,
        central: c,
        bandLow: blend.band.min[t],
        // Recharts stacks Area from a baseline; render band as a transparent base + visible span.
        bandSpan: blend.band.max[t] - blend.band.min[t],
        read: readPath[t],
      })),
    [blend, readPath],
  );

  return (
    <div data-testid="scenario-path-chart" className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 16, bottom: 8, left: 0 }}>
          <XAxis dataKey="t" tickFormatter={(t) => `${t} ${stepUnit[0]}`} tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={(v) => fmtSignedPct(v)} tick={{ fontSize: 11 }} width={48} />
          <Tooltip
            formatter={(v: number, name) => [fmtSignedPct(v), name === 'read' ? 'Reading' : 'Typical']}
            labelFormatter={(t) => `${t} ${stepUnit}s`}
          />
          {/* observed band: transparent base to bandLow, then visible span up to bandMax */}
          <Area dataKey="bandLow" stackId="band" stroke="none" fill="transparent" isAnimationActive={false} />
          <Area dataKey="bandSpan" stackId="band" stroke="none" fill="var(--muted-foreground)" fillOpacity={0.14}
                isAnimationActive={false} />
          <Line dataKey="central" stroke="var(--muted-foreground)" strokeWidth={2} dot={false} isAnimationActive={false} />
          <Line dataKey="read" stroke="var(--foreground)" strokeWidth={2.5} dot={false} isAnimationActive={false} />
          <ReferenceDot x={troughIndex} y={readPath[troughIndex]} r={4} fill="var(--foreground)" stroke="none" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 2: Type-check (no UI unit test in this repo)**

Run: `npm run check 2>&1 | grep "PathChart" || echo "no new PathChart errors"`
Expected: no new errors referencing `PathChart`.

- [ ] **Step 3: Commit**

```bash
git add client/src/components/onboarding-v2/scenario-planner/PathChart.tsx
git commit -m "feat(scenario-planner): stable-spine path chart (central + observed band + read line)"
```

---

### Task 13: Stage components + `ScopeContract` + `StageNav`

**Files:**
- Create: `client/src/components/onboarding-v2/scenario-planner/ScopeContract.tsx`
- Create: `client/src/components/onboarding-v2/scenario-planner/StageNav.tsx`
- Create: `client/src/components/onboarding-v2/scenario-planner/StageStressTest.tsx`
- Create: `client/src/components/onboarding-v2/scenario-planner/StageAcrossHistory.tsx`
- Create: `client/src/components/onboarding-v2/scenario-planner/StageTuneIt.tsx`

- [ ] **Step 1: `ScopeContract.tsx` (up-front modelled-vs-unmodelled, §5)**

```tsx
import { scopeContractLine } from '@/lib/scenarioPlannerView';

export default function ScopeContract({ unmodelledShare }: { unmodelledShare: number }) {
  return (
    <p data-testid="scope-contract" className="text-sm text-[var(--muted-foreground)] border-l-2 border-slate-300 pl-3">
      {scopeContractLine(unmodelledShare)}
    </p>
  );
}
```

- [ ] **Step 2: `StageNav.tsx` (indicator + non-destructive revisit + reset, P2-7)**

```tsx
interface StageNavProps {
  stage: number; maxStage: number;
  onGo: (s: number) => void; onReset: () => void;
}
const LABELS = ['The stress test', 'Across history', 'Tune it', 'Compare mixes'];

export default function StageNav({ stage, maxStage, onGo, onReset }: StageNavProps) {
  return (
    <div className="flex items-center justify-between gap-3" data-testid="stage-nav">
      <ol className="flex gap-2">
        {LABELS.slice(0, maxStage).map((label, i) => {
          const n = i + 1;
          return (
            <li key={n}>
              <button
                type="button"
                onClick={() => onGo(n)}
                aria-current={stage === n ? 'step' : undefined}
                className={`text-xs px-2 py-1 rounded-full border ${
                  stage === n ? 'bg-[var(--foreground)] text-[var(--background)]' : 'text-[var(--muted-foreground)]'
                }`}
              >
                {n}. {label}
              </button>
            </li>
          );
        })}
      </ol>
      <button type="button" onClick={onReset} className="text-xs underline text-[var(--muted-foreground)]">
        Reset to my actual holdings, typical reading
      </button>
    </div>
  );
}
```

- [ ] **Step 3: `StageStressTest.tsx` (Stage 1 — establishes the two-limb path)**

```tsx
import PathChart from './PathChart';
import { STAGE_COPY } from '@/data/scenarioPlannerCopy';
import { fmtSignedPct, fmtRecovery } from '@/lib/scenarioPlannerView';
import type { EpisodeReplay } from '@/lib/empiricalEngine';
import type { Episode } from '@/data/episodeLibrary';

export default function StageStressTest({ episode, replay }: { episode: Episode; replay: EpisodeReplay }) {
  const copy = STAGE_COPY[0];
  return (
    <section data-testid="stage-1" className="space-y-3">
      <p className="text-sm text-[var(--muted-foreground)]">{copy.leadIn}</p>
      <PathChart
        blend={{ central: replay.points, band: { min: replay.points, max: replay.points } }}
        readPath={replay.points}
        stepUnit={episode.granularity === 'annual' ? 'year' : 'month'}
        troughIndex={replay.troughIndex}
      />
      <div className="flex gap-6 text-sm">
        <span><strong>{fmtSignedPct(replay.drawdown)}</strong> deepest fall</span>
        <span><strong>{fmtRecovery(replay.recoverySteps, episode.granularity, episode.inflationEpisode)}</strong> to recover</span>
      </div>
      <p className="text-xs text-[var(--muted-foreground)]">{copy.complianceCaption}</p>
      <p className="text-sm">{copy.worthSittingWith}</p>
    </section>
  );
}
```

- [ ] **Step 4: `StageAcrossHistory.tsx` (Stage 2 — chronological side-by-side, recovery beside drawdown)**

```tsx
import { STAGE_COPY, NARRATIVE_FALLACY_NOTE } from '@/data/scenarioPlannerCopy';
import { fmtSignedPct, fmtRecovery } from '@/lib/scenarioPlannerView';
import type { EpisodeReplay } from '@/lib/empiricalEngine';
import type { Episode } from '@/data/episodeLibrary';

export default function StageAcrossHistory(
  { rows }: { rows: { episode: Episode; replay: EpisodeReplay }[] },
) {
  const copy = STAGE_COPY[1];
  return (
    <section data-testid="stage-2" className="space-y-3">
      <p className="text-sm text-[var(--muted-foreground)]">{copy.leadIn}</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[var(--muted-foreground)]">
            <th className="py-1">Episode</th><th>Deepest fall</th><th>Recovery</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ episode, replay }) => (
            <tr key={episode.id} data-testid={`history-row-${episode.id}`} className="border-t border-slate-200">
              <td className="py-1">{episode.name} <span className="text-[var(--muted-foreground)]">({episode.yearLabel})</span></td>
              <td>{fmtSignedPct(replay.drawdown)}</td>
              <td>{fmtRecovery(replay.recoverySteps, episode.granularity, episode.inflationEpisode)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-[var(--muted-foreground)]">{NARRATIVE_FALLACY_NOTE}</p>
      <p className="text-xs text-[var(--muted-foreground)]">{copy.complianceCaption}</p>
    </section>
  );
}
```

- [ ] **Step 5: `StageTuneIt.tsx` (Stage 3 — blend first, THEN read-position, P1-5)**

The read-position control only appears after the user has blended (sequence per §6). Default `r = 0` (typical). When a single episode is selected the band collapses and the read control is disabled (collapsed-band state, §6).

```tsx
import { useState } from 'react';
import PathChart from './PathChart';
import { STAGE_COPY } from '@/data/scenarioPlannerCopy';
import { fmtSignedPct } from '@/lib/scenarioPlannerView';
import { blendEpisodes, readAt } from '@/lib/episodeBlend';
import type { EpisodeReplay } from '@/lib/empiricalEngine';
import type { Episode } from '@/data/episodeLibrary';

export default function StageTuneIt(
  { options, replays }: { options: Episode[]; replays: Record<string, EpisodeReplay> },
) {
  const copy = STAGE_COPY[2];
  // Only monthly episodes blend cleanly together; group by granularity to keep paths aligned (§5 mixed granularity).
  const [selected, setSelected] = useState<string[]>(() => options.slice(0, 1).map((e) => e.id));
  const [r, setR] = useState(0); // default typical
  const [revealRead, setRevealRead] = useState(false);

  const chosen = selected.map((id) => replays[id]).filter(Boolean);
  const blend = blendEpisodes(chosen, chosen.map(() => 1));
  const collapsed = chosen.length < 2;
  const readPath = collapsed ? blend.central : readAt(blend, r);
  const troughIndex = blend.central.indexOf(Math.min(...blend.central));

  return (
    <section data-testid="stage-3" className="space-y-3">
      <p className="text-sm text-[var(--muted-foreground)]">{copy.leadIn}</p>

      <fieldset className="flex flex-wrap gap-2" data-testid="blend-picker">
        {options.map((e) => (
          <label key={e.id} className="text-xs flex items-center gap-1">
            <input
              type="checkbox"
              checked={selected.includes(e.id)}
              onChange={(ev) => {
                setSelected((s) => ev.target.checked ? [...s, e.id] : s.filter((x) => x !== e.id));
                setRevealRead(true);
              }}
            />
            {e.shortLabel}
          </label>
        ))}
      </fieldset>

      <PathChart blend={blend} readPath={readPath}
        stepUnit={options[0]?.granularity === 'annual' ? 'year' : 'month'} troughIndex={Math.max(0, troughIndex)} />

      {revealRead && (
        <div data-testid="read-position">
          <label className="text-xs flex items-center gap-3">
            Read: typical outcome
            <input type="range" min={0} max={1} step={0.01} value={r} disabled={collapsed}
              onChange={(e) => setR(parseFloat(e.target.value))} className="flex-1" />
            worst markets reached
          </label>
          <p className="text-xs text-[var(--muted-foreground)]">
            {collapsed
              ? 'Combine at least two episodes to read across the range they reached.'
              : `Markets actually reached ${fmtSignedPct(Math.min(...readPath))} here in these episodes — not a prediction, and future losses can exceed this.`}
          </p>
        </div>
      )}
      <p className="text-xs text-[var(--muted-foreground)]">{copy.complianceCaption}</p>
      <p className="text-sm">{copy.worthSittingWith}</p>
    </section>
  );
}
```

- [ ] **Step 6: `RecoveryCounterBeat.tsx` (§10/P1-7 — vulnerable-customer treatment)**

Foregrounded only when the user's circumstance (derived in Task 8) is decumulating or short-horizon. "Calm and credible" must never mean "reassuring to someone who should act" — so the recovery-duration risk is surfaced, not smoothed over.

```tsx
import { RECOVERY_COUNTER_BEAT } from '@/data/scenarioPlannerCopy';
import type { Circumstance } from '@/lib/episodeSalience';

export default function RecoveryCounterBeat({ circumstance }: { circumstance: Circumstance }) {
  if (!circumstance.decumulating && !circumstance.shortHorizon) return null;
  return (
    <p data-testid="recovery-counter-beat"
       className="text-sm rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-900/20 p-3">
      {RECOVERY_COUNTER_BEAT}
    </p>
  );
}
```

- [ ] **Step 7: Type-check**

Run: `npm run check 2>&1 | grep -E "scenario-planner" || echo "no new scenario-planner errors"`
Expected: no new errors. (Pre-existing backlog unaffected.)

- [ ] **Step 8: Commit**

```bash
git add client/src/components/onboarding-v2/scenario-planner/
git commit -m "feat(scenario-planner): Stage 1-3 components + scope contract + stage nav + recovery counter-beat"
```

---

### Task 14: `ScenarioPlanner.tsx` page + route mount

Owns stage state, derives mix from holdings, runs the engine per episode (memoised), orders episodes by salience, and gates Stage 4 behind `DELTA_ENABLED`.

**Files:**
- Create: `client/src/pages/onboarding-v2/ScenarioPlanner.tsx`
- Modify: the v2 route host (find it in Step 3) to add the planner route.

- [ ] **Step 1: Implement the page**

```tsx
import { useMemo, useState } from 'react';
import { useOnboardingV2Store } from '@/state/onboardingV2Store';
import { EPISODES } from '@/data/episodeLibrary';
import { mixFromHoldings, type MixHolding } from '@/lib/portfolioMix';
import { replayEpisode, type EpisodeReplay } from '@/lib/empiricalEngine';
import { orderEpisodesBySalience, circumstanceFromIntake } from '@/lib/episodeSalience';
import { DELTA_ENABLED } from '@/lib/featureFlags';
import { TARGET_MARKET, ADVICE_EXIT } from '@/data/scenarioPlannerCopy';
import ScopeContract from '@/components/onboarding-v2/scenario-planner/ScopeContract';
import StageNav from '@/components/onboarding-v2/scenario-planner/StageNav';
import StageStressTest from '@/components/onboarding-v2/scenario-planner/StageStressTest';
import StageAcrossHistory from '@/components/onboarding-v2/scenario-planner/StageAcrossHistory';
import StageTuneIt from '@/components/onboarding-v2/scenario-planner/StageTuneIt';
import RecoveryCounterBeat from '@/components/onboarding-v2/scenario-planner/RecoveryCounterBeat';

const START_VALUE = 500_000; // illustrative basis for £ contributions; % display is primary (P3-3)

export default function ScenarioPlanner() {
  const { holdings, beliefs, intake } = useOnboardingV2Store();
  const [stage, setStage] = useState(1);

  const circumstance = useMemo(
    () => circumstanceFromIntake({
      portfolio_stage: intake.personaCues.portfolio_stage,
      time_horizon_years: intake.time_horizon_years,
    }),
    [intake.personaCues.portfolio_stage, intake.time_horizon_years],
  );

  const { mix, unmodelledShare, ordered, replays } = useMemo(() => {
    const mixHoldings: MixHolding[] = holdings
      .filter((h) => h.value_gbp > 0)
      .map((h) => ({ asset_class: h.asset_class, region: h.region, value_gbp: h.value_gbp }));
    const { mix, unmodelledShare } = mixFromHoldings(mixHoldings);
    const ordered = orderEpisodesBySalience(EPISODES, { axisScores: beliefs.axis_scores });
    const replays: Record<string, EpisodeReplay> = {};
    for (const ep of ordered) replays[ep.id] = replayEpisode(mix, ep, START_VALUE);
    return { mix, unmodelledShare, ordered, replays };
  }, [holdings, beliefs.axis_scores]);

  const maxStage = DELTA_ENABLED ? 4 : 3;
  const hasHoldings = ordered.length > 0 && holdings.some((h) => h.value_gbp > 0);

  if (!hasHoldings) {
    return (
      <div className="max-w-3xl mx-auto p-6" data-testid="scenario-planner-empty">
        <p className="text-sm text-[var(--muted-foreground)]">
          Add holdings to see how a portfolio like yours behaved across historical periods of stress.
        </p>
      </div>
    );
  }

  const headEpisode = ordered[0];
  const monthly = ordered.filter((e) => e.granularity === 'monthly');

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-5" data-testid="scenario-planner">
      <header className="space-y-1">
        <h2 className="text-lg font-bold tracking-tight">How your portfolio held up through history</h2>
        <p className="text-xs text-[var(--muted-foreground)]">{TARGET_MARKET}</p>
      </header>

      <ScopeContract unmodelledShare={unmodelledShare} />
      <RecoveryCounterBeat circumstance={circumstance} />
      <StageNav stage={stage} maxStage={maxStage} onGo={setStage} onReset={() => setStage(1)} />

      {stage === 1 && <StageStressTest episode={headEpisode} replay={replays[headEpisode.id]} />}
      {stage === 2 && (
        <StageAcrossHistory rows={ordered.map((episode) => ({ episode, replay: replays[episode.id] }))} />
      )}
      {stage === 3 && <StageTuneIt options={monthly} replays={replays} />}
      {/* Stage 4 (delta) is flag-gated dark until §13 compliance sign-off. */}

      <footer className="border-t border-slate-200 pt-3">
        <p className="text-xs text-[var(--muted-foreground)]">{ADVICE_EXIT}</p>
      </footer>
    </div>
  );
}
```

- [ ] **Step 2: Add the lazy import in `client/src/App.tsx`**

The router is `wouter` with a `lazy()` + `Suspense` render-prop pattern. Add the lazy import alongside the other v2 pages (after `OnboardingV2Report` at `client/src/App.tsx:48`):

```tsx
const OnboardingV2ScenarioPlanner = lazy(() => import("@/pages/onboarding-v2/ScenarioPlanner"));
```

- [ ] **Step 3: Add the route using the exact sibling pattern**

Add inside `<Switch>`, alongside the other `/onboarding-v2/*` routes (e.g. after the `analysis` route at `client/src/App.tsx:89`). Copy the Suspense-fallback markup verbatim from the sibling routes:

```tsx
      <Route path="/onboarding-v2/scenario-planner">{() => <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" /></div>}><OnboardingV2ScenarioPlanner /></Suspense>}</Route>
```

The page is the default export of `ScenarioPlanner.tsx`, so `import("@/pages/onboarding-v2/ScenarioPlanner")` resolves correctly.

- [ ] **Step 4: Type-check**

Run: `npm run check 2>&1 | grep -c "error TS"`
Expected: ≤ `N_BASELINE`.

- [ ] **Step 5: Visual verification (preview tools)**

Start the dev server (drop `reusePort` at `server/index.ts:64` locally, do NOT commit):

```bash
DATABASE_URL='postgresql://demo:demo@127.0.0.1:5432/demo_unused' npm run dev
```

Then with the preview tools:
1. `preview_start` the `unlock-onboarding` launch entry (port 5000).
2. Navigate to the onboarding-v2 flow, complete intake + add holdings (or use a seeded demo profile), reach `/onboarding-v2/scenario-planner`.
3. `preview_console_logs` → no errors.
4. `preview_snapshot` → confirm: scope-contract line present; Stage 1 chart renders the fall-and-recovery curve; drawdown + recovery shown; advice-exit footer present.
5. `preview_click` Stage 2 → chronological table (1929 first); Stage 3 → blend picker, then read-position slider appears, default typical, caption present.
6. `preview_resize` to mobile width → spine stays pinned, controls usable.
7. `preview_screenshot` → attach as proof.

Fix any console/render issues by editing source, then re-verify from step 3.

- [ ] **Step 6: Commit**

```bash
git add client/src/pages/onboarding-v2/ScenarioPlanner.tsx <route-host-file>
git commit -m "feat(scenario-planner): stepped planner page (Stages 1-3) + route mount"
```

---

## Phase 4 — Mix-comparison delta (GATED, flag-dark)

> ⚠️ Per §7/§9/§13 this is the single most-flagged surface (5-lens P1-4). Build it behind `DELTA_ENABLED` (default OFF). It must **not** ship enabled until human compliance sign-off (Vine-Lott / Corke) on (a) neutral-comparison framing and (b) band-midpoint-as-comparison-mix. The de-risk plan Tom likes: ship Stages 1–3 as v1; this is a fast-follow.

### Task 15: `StageCompareMixes.tsx` (neutral, symmetric, no valence)

**Files:**
- Create: `client/src/components/onboarding-v2/scenario-planner/StageCompareMixes.tsx`
- Modify: `client/src/pages/onboarding-v2/ScenarioPlanner.tsx` (render Stage 4 when `DELTA_ENABLED`)

- [ ] **Step 1: Implement the comparison stage**

Derives a comparison vector from step-7 bands via `mixFromBands`, replays the **same episodes** on both mixes, and presents the difference as a **symmetric, per-episode distribution** — no green/red, no "+Npp shallower" headline, neutral composition labels (§7). The current and comparison mixes are equally-weighted selectable points.

```tsx
import { useMemo, useState } from 'react';
import { useOnboardingV2Store } from '@/state/onboardingV2Store';
import { mixFromBands, type Mix } from '@/lib/portfolioMix';
import { replayEpisode } from '@/lib/empiricalEngine';
import { fmtSignedPct } from '@/lib/scenarioPlannerView';
import { STAGE_COPY } from '@/data/scenarioPlannerCopy';
import type { Episode } from '@/data/episodeLibrary';

const START_VALUE = 500_000;

export default function StageCompareMixes(
  { currentMix, episodes }: { currentMix: Mix; episodes: Episode[] },
) {
  const copy = STAGE_COPY[3];
  const { scenario } = useOnboardingV2Store();
  const active = scenario.scenarios.find((s) => s.scenario_type === scenario.active_scenario)
    ?? scenario.scenarios[0];
  const [which, setWhich] = useState<'current' | 'comparison'>('current');

  const comparisonMix = useMemo(
    () => (active ? mixFromBands(active.asset_class_bands, active.region_bands) : currentMix),
    [active, currentMix],
  );

  const rows = useMemo(
    () =>
      episodes.map((ep) => {
        const cur = replayEpisode(currentMix, ep, START_VALUE).drawdown;
        const cmp = replayEpisode(comparisonMix, ep, START_VALUE).drawdown;
        return { ep, cur, cmp };
      }),
    [episodes, currentMix, comparisonMix],
  );

  return (
    <section data-testid="stage-4" className="space-y-3">
      <p className="text-sm text-[var(--muted-foreground)]">{copy.leadIn}</p>

      <div role="radiogroup" className="flex gap-2 text-xs">
        {(['current', 'comparison'] as const).map((k) => (
          <button key={k} type="button" role="radio" aria-checked={which === k}
            onClick={() => setWhich(k)}
            className={`px-2 py-1 rounded-full border ${which === k ? 'bg-[var(--foreground)] text-[var(--background)]' : ''}`}>
            {k === 'current' ? 'Your holdings' : 'Alternative composition (more bonds, less equity)'}
          </button>
        ))}
      </div>

      {/* symmetric per-episode distribution — both directions shown, no valence colour */}
      <table className="w-full text-sm" data-testid="delta-distribution">
        <thead><tr className="text-left text-[var(--muted-foreground)]">
          <th className="py-1">Episode</th><th>Your holdings</th><th>Alternative</th><th>Difference</th>
        </tr></thead>
        <tbody>
          {rows.map(({ ep, cur, cmp }) => (
            <tr key={ep.id} className="border-t border-slate-200">
              <td className="py-1">{ep.shortLabel}</td>
              <td>{fmtSignedPct(cur)}</td>
              <td>{fmtSignedPct(cmp)}</td>
              <td className="text-[var(--muted-foreground)]">{fmtSignedPct(cmp - cur)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-[var(--muted-foreground)]">{copy.complianceCaption}</p>
      <p className="text-sm">{copy.worthSittingWith}</p>
    </section>
  );
}
```

- [ ] **Step 2: Wire Stage 4 into the page (flag-gated)**

In `ScenarioPlanner.tsx`, add the import and render block (the `mix` and `monthly` are already computed in Task 14):

```tsx
import StageCompareMixes from '@/components/onboarding-v2/scenario-planner/StageCompareMixes';
// ...
{stage === 4 && DELTA_ENABLED && <StageCompareMixes currentMix={mix} episodes={monthly} />}
```

- [ ] **Step 3: Type-check**

Run: `npm run check 2>&1 | grep -c "error TS"`
Expected: ≤ `N_BASELINE`.

- [ ] **Step 4: Visual verification with the flag ON (local only)**

```bash
VITE_SCENARIO_DELTA=1 DATABASE_URL='postgresql://demo:demo@127.0.0.1:5432/demo_unused' npm run dev
```
Via preview tools: Stage 4 appears; confirm **no green/red valence**, both mixes selectable as equal points, difference column shows both signs across episodes, neutral label "more bonds, less equity", compliance caption + advice-exit present. `preview_screenshot` as proof. Then **stop the server and confirm the default build keeps Stage 4 dark** (relaunch without the env var → `maxStage` is 3, no Stage-4 tab).

- [ ] **Step 5: Commit**

```bash
git add client/src/components/onboarding-v2/scenario-planner/StageCompareMixes.tsx client/src/pages/onboarding-v2/ScenarioPlanner.tsx
git commit -m "feat(scenario-planner): Stage 4 mix-comparison delta (flag-gated dark, §13)"
```

---

## Final verification

- [ ] **Full suite green**

Run: `npm test 2>&1 | tail -3`
Expected: baseline 255 + all new engine/lint tests, all passing.

- [ ] **No new type errors**

Run: `npm run check 2>&1 | grep -c "error TS"`
Expected: ≤ `N_BASELINE`.

- [ ] **Invariant audit (manual grep — §0)**

Run: `grep -rn "0.7\|1.4\|severityRange\|Monte\|forecast\|predict" client/src/lib/empiricalEngine.ts client/src/lib/episodeBlend.ts client/src/data/episodeLibrary.ts`
Expected: no `{0.7,1.4}` multiplier, no `severityRange`, no forecast language in the new engine.

- [ ] **Confirm Stage 4 is dark by default**

Run: `grep -n "VITE_SCENARIO_DELTA\|DELTA_ENABLED" client/src/lib/featureFlags.ts`
Confirm the flag defaults OFF. The delta does not ship enabled.

---

## Human gates carried out of this plan (not codeable — §13)

1. **Compliance sign-off on the Stage-4 delta** (Vine-Lott / Corke): neutral-comparison framing + band-midpoint-as-comparison-mix, against Targeted Support / PS25/22 (live 6 Apr 2026). The delta stays flag-dark until this clears.
2. **Data sourcing sign-off**: confirm the Task 1 figures against Shiller / JST / FRED; decide the optional 1920–21 episode. Golden tests pin whatever is entered.
3. **Content-brain voice + FCA-checker pass** on all `scenarioPlannerCopy.ts` strings (marked `// CONTENT-BRAIN-GATE`). The lint test is the floor.
4. **Comprehension + learning-effectiveness checks** (design §11 / P3-5): "read-position is not read as a forecast" and the predict-then-reveal beat are UX/learning validation, not unit-testable here. Consciously deferred to the content-brain/UX validation pass alongside gate 3 — not silently dropped.

**Note on per-stage states (§4):** empty (no holdings) and partial (buckets with no comparable series → scope contract + `noDataShare`) are implemented. There is no loading/error state because the engine is fully synchronous off the Zustand store — there is no async fetch to fail. If a future revision sources episode data over the network, add loading/error states then.

---

## Out of scope (v1, per design §14)

Forward probabilistic simulation; taxonomy expansion (large/small-cap, credit, FX); free-form custom allocation editing; saving/sharing scenarios; jsdom/RTL component unit tests.
