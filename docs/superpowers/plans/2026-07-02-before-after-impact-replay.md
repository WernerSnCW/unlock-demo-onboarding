# Before/After Impact Replay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close value-chain step 5 ("if you took action, here's what the impact would be"): re-run the existing alignment, episode-replay, and income-runway engines on the post-action target mix and render before → after on `OutlookAlternatives` — side-by-side donuts, headline stat comparisons, and a signed diff table — plus two cheap tier-2 devices (4-stat summary grid, stage tabs with counts).

**Architecture:** One new pure-function module `client/src/lib/beliefImpact/computeBeforeAfter.ts` composes the four engines that already exist (`computeAlignment`, `replayEpisode`, `computeIncomeRunway`, plus the mix renormaliser). No new modelling, no server changes: the "after" mix is exactly the `targetMix` already in memory on the screen (see invariant 1 below). A new presentational component `BeforeAfterPanel.tsx` renders the result inside `OutlookAlternatives`.

**Tech Stack:** React + TypeScript (Vite client), wouter routing, Tailwind CSS variables, shared SVG `Donut` component, vitest (node env, pure-function tests only — no component test infra exists in this repo; UI is verified by browser walkthrough).

---

## Context for the zero-context engineer

**The flow.** Onboarding v2 runs intake → holdings → beliefs → outlook (B1–B15 questionnaire) → outlook-results (impact of the user's beliefs on their *current* portfolio) → **outlook-alternatives** (staged rebalancing moves toward a belief-driven target mix) → next-steps. This plan adds the missing payoff beat to outlook-alternatives: what the previous page's numbers would look like *after* the staged moves.

**The taxonomy.** Portfolios are expressed as a `Mix` — `Record<Bucket, number>` over 8 buckets (`client/src/data/episodeLibrary.ts` exports `BUCKETS`). Two buckets (`europe-equity`, `emerging-equity`) are tier `UNMODELLED` (`client/src/data/beliefImpactTaxonomy.ts` `BUCKET_TIER`); all belief-impact math runs over the 6 modelled buckets and mixes must be renormalised over them first (`renormaliseOverModelledBuckets` in `computeAlignment.ts`). The `mix` variable in `OutlookAlternatives.tsx:35-46` is **already renormalised**.

**Invariants this plan relies on (all verified in source):**

1. **After-mix = targetMix, exactly.** `server/lib/actions/stagedRebalance.ts` splits `need[b] = target[b] − current[b]` into `s1[b] + s2[b] = need[b]` (console.assert at ~line 113) and emits every non-zero `s1`/`s2` as a stage-1/stage-2 action. Applying *all* staged moves therefore lands exactly on `targetMix` — the honest "after" state is the `targetMix` already computed at `OutlookAlternatives.tsx:48`. Label it as "all staged changes, both stages" — never as stage 1 alone.
2. **Alignment "after" is 100 by definition.** `targetMix = blendBeliefAllocation(weights)` is the same vector `computeAlignment` scores against, so distance is 0 and the after-score is exactly 100. Do not present this as a discovery: caption it as true-by-construction ("the illustrative target is built directly from your outlook answers"). This is the do-not-port doctrine applied — no fake uplift.
3. **Runway's buffer-exhaustion step is mix-independent.** `computeIncomeRunway` walks `liquidCash − spendPerStep·t`; only the episode's recovery timing (which depends on the mix) changes the *verdict* (`survivesWithoutSellingAtTrough`). The honest before/after runway comparison is the **selling-into-the-trough verdict**, not a fabricated "runway months" uplift number.
4. **Runway precondition.** `computeIncomeRunway`'s doc comment: a zero/unset `annual_essential_spend_gbp` always reports "survives". Guard: return `null` (render nothing) when spend ≤ 0. This is the known residual risk from the prior plan — do not add a new path to it.

**Why no second tiered-impact block.** The scoping note says "re-run alignment + tiered impact + income runway". `computeTieredImpact`'s cited troughs/recoveries are per-episode path facts that do not change with the mix — only each bucket's `weightPct` changes, and the diff table already shows exactly that. The mix-sensitive portfolio-level restatement of the same engine is `replayEpisode` (value-weighted episode path), which is what the worst-episode comparison runs on both mixes. So the tiered-impact re-run is fully represented by diff table + episode comparison; duplicating the citation rows would repeat identical text.

**Copy doctrine (binding, from the 2026-07-02 forensic audit):** no performance/uplift claims; every simulated number labelled illustrative; house error voice is *no analysis shown rather than an approximation*; signed values always carry their sign; the screen's existing non-advice labels stay untouched.

**Commands:** tests `npm test` (vitest, includes `client/src/**/*.test.ts`); typecheck `npm run check` (**pre-existing baseline: 188 errors on main — must not increase**); dev server `npm run dev` (port 5000).

## File structure

- **Modify** `client/src/lib/beliefImpact/computeAlignment.ts` — export the module-private `MODELLED_BUCKETS` (avoid a third private copy).
- **Create** `client/src/lib/beliefImpact/computeBeforeAfter.ts` — all pure computation: mix diff, worst-episode comparison, runway comparison, composed entry point.
- **Create** `client/src/lib/beliefImpact/computeBeforeAfter.test.ts` — TDD tests for the above.
- **Create** `client/src/components/onboarding-v2/BeforeAfterPanel.tsx` — presentational: donuts, headline stats, diff table.
- **Modify** `client/src/pages/onboarding-v2/OutlookAlternatives.tsx` — compute + render the panel; 4-stat grid; stage tabs.

---

### Task 1: `computeMixDiff` + export `MODELLED_BUCKETS`

**Files:**
- Modify: `client/src/lib/beliefImpact/computeAlignment.ts:18`
- Create: `client/src/lib/beliefImpact/computeBeforeAfter.ts`
- Test: `client/src/lib/beliefImpact/computeBeforeAfter.test.ts`

- [ ] **Step 1: Export MODELLED_BUCKETS**

In `computeAlignment.ts` line 18, change:

```ts
const MODELLED_BUCKETS: Bucket[] = BUCKETS.filter((b) => BUCKET_TIER[b] !== 'UNMODELLED');
```

to:

```ts
export const MODELLED_BUCKETS: Bucket[] = BUCKETS.filter((b) => BUCKET_TIER[b] !== 'UNMODELLED');
```

(Leave `computeTieredImpact.ts`'s private copy alone — out of scope.)

- [ ] **Step 2: Write the failing tests**

Create `client/src/lib/beliefImpact/computeBeforeAfter.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { BUCKETS, type Bucket } from '../../data/episodeLibrary';
import type { Mix } from '../portfolioMix';
import { computeMixDiff } from './computeBeforeAfter';

export function mkMix(partial: Partial<Record<Bucket, number>>): Mix {
  return { ...(Object.fromEntries(BUCKETS.map((b) => [b, 0])) as Mix), ...partial };
}

describe('computeMixDiff', () => {
  it('returns signed per-bucket rows over modelled buckets, dropping all-zero buckets', () => {
    const current = mkMix({ 'uk-equity': 0.5, cash: 0.5 });
    const target = mkMix({ 'uk-equity': 0.2, 'govt-bonds': 0.5, cash: 0.3 });
    const rows = computeMixDiff(current, target);
    expect(rows).toEqual([
      { bucket: 'uk-equity', beforePct: 50, afterPct: 20, deltaPp: -30 },
      { bucket: 'govt-bonds', beforePct: 0, afterPct: 50, deltaPp: 50 },
      { bucket: 'cash', beforePct: 50, afterPct: 30, deltaPp: -20 },
    ]);
  });

  it('deltas sum to ~0 (both sides are normalised distributions)', () => {
    const current = mkMix({ 'us-equity': 0.7, property: 0.2, cash: 0.1 });
    const target = mkMix({ 'us-equity': 0.3, 'govt-bonds': 0.4, property: 0.1, cash: 0.2 });
    const sum = computeMixDiff(current, target).reduce((s, r) => s + r.deltaPp, 0);
    expect(Math.abs(sum)).toBeLessThanOrEqual(0.2); // rounding tolerance only
  });

  it('renormalises a current mix that carries unmodelled-bucket mass', () => {
    // 50% europe-equity is UNMODELLED: modelled mass renormalises to uk-equity 50% -> 100%... 
    const current = mkMix({ 'uk-equity': 0.5, 'europe-equity': 0.5 });
    const target = mkMix({ 'uk-equity': 0.6, cash: 0.4 });
    const rows = computeMixDiff(current, target);
    const uk = rows.find((r) => r.bucket === 'uk-equity');
    expect(uk).toEqual({ bucket: 'uk-equity', beforePct: 100, afterPct: 60, deltaPp: -40 });
    expect(rows.find((r) => r.bucket === 'europe-equity')).toBeUndefined();
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test -- computeBeforeAfter`
Expected: FAIL — `computeBeforeAfter.ts` does not exist / `computeMixDiff` not exported.

- [ ] **Step 4: Implement `computeMixDiff`**

Create `client/src/lib/beliefImpact/computeBeforeAfter.ts`:

```ts
import { EPISODES, type Bucket, type Episode } from '../../data/episodeLibrary';
import { replayEpisode, type EpisodeReplay } from '../empiricalEngine';
import type { Mix } from '../portfolioMix';
import { BELIEF_SCENARIO_MAPPING, type BeliefScenarioName } from '../../data/beliefImpactTaxonomy';
import {
  computeAlignment, renormaliseOverModelledBuckets, MODELLED_BUCKETS,
} from './computeAlignment';
import { computeIncomeRunway, type IncomeRunwayResult } from './computeIncomeRunway';

export interface MixDiffRow {
  bucket: Bucket;
  beforePct: number; // 0-100, 1dp, renormalised over modelled buckets
  afterPct: number;
  deltaPp: number;   // signed, 1dp
}

/** Per-bucket now -> after rows. "After" is the full target mix — see invariant 1 in the plan:
 *  stage-1 + stage-2 deltas sum exactly to target − current (stagedRebalance.ts assertion), so
 *  applying all staged moves lands on targetMix. Rows where both sides are 0 are dropped. */
export function computeMixDiff(currentMix: Mix, targetMix: Mix): MixDiffRow[] {
  const before = renormaliseOverModelledBuckets(currentMix);
  const rows: MixDiffRow[] = [];
  for (const b of MODELLED_BUCKETS) {
    const beforePct = Math.round(before[b] * 1000) / 10;
    const afterPct = Math.round(targetMix[b] * 1000) / 10;
    if (beforePct <= 0 && afterPct <= 0) continue;
    rows.push({ bucket: b, beforePct, afterPct, deltaPp: Math.round((afterPct - beforePct) * 10) / 10 });
  }
  return rows;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- computeBeforeAfter`
Expected: 3 PASS.

- [ ] **Step 6: Run the full suite (no regressions from the export change)**

Run: `npm test`
Expected: all green (entire prior suite + 3 new; note the exact prior count before starting and hold it).

- [ ] **Step 7: Commit**

```bash
git add client/src/lib/beliefImpact/computeAlignment.ts client/src/lib/beliefImpact/computeBeforeAfter.ts client/src/lib/beliefImpact/computeBeforeAfter.test.ts
git commit -m "feat(belief-impact): mix diff rows for the before/after replay"
```

---

### Task 2: `computeWorstEpisodeComparison`

Replays the cited episodes on both mixes and returns the worst one (by *before* drawdown) with both troughs and recovery labels. Episode selection uses **the same rule as `computeTieredImpact`** (top 3 non-upside scenarios with weight > 0.05) so the compared episode is always one already cited on the previous page.

**Files:**
- Modify: `client/src/lib/beliefImpact/computeBeforeAfter.ts`
- Test: `client/src/lib/beliefImpact/computeBeforeAfter.test.ts`

- [ ] **Step 1: Write the failing tests**

Append to `computeBeforeAfter.test.ts`:

```ts
import { computeWorstEpisodeComparison } from './computeBeforeAfter';

describe('computeWorstEpisodeComparison', () => {
  const stagflationWeights = { Stagflation: 1 } as const; // cites STAGFLATION_1973 + RATE_SHOCK_2022

  it('returns null when no downside scenario clears the weight threshold', () => {
    expect(computeWorstEpisodeComparison(
      mkMix({ 'uk-equity': 1 }), mkMix({ cash: 1 }), { 'Rate-Cut Reflation': 1 }, 100_000,
    )).toBeNull();
    expect(computeWorstEpisodeComparison(
      mkMix({ 'uk-equity': 1 }), mkMix({ cash: 1 }), { Stagflation: 0.04 }, 100_000,
    )).toBeNull();
  });

  it('replays the same episode on both mixes and reports both troughs', () => {
    const result = computeWorstEpisodeComparison(
      mkMix({ 'uk-equity': 1 }), mkMix({ 'govt-bonds': 0.5, cash: 0.5 }), stagflationWeights, 100_000,
    );
    expect(result).not.toBeNull();
    expect(['STAGFLATION_1973', 'RATE_SHOCK_2022']).toContain(result!.episodeId);
    expect(result!.beforeTroughPct).toBeLessThan(0);
    // a bonds/cash mix cannot fall further than an all-equity mix in these cited episodes
    expect(result!.afterTroughPct).toBeGreaterThanOrEqual(result!.beforeTroughPct);
    expect(result!.beforeRecoveryLabel).toMatch(/trough|not recovered/);
    expect(result!.afterRecoveryLabel).toMatch(/trough|not recovered/);
  });

  it('identical mixes produce identical before/after numbers', () => {
    const mix = mkMix({ 'uk-equity': 0.6, cash: 0.4 });
    const result = computeWorstEpisodeComparison(mix, mix, stagflationWeights, 100_000);
    expect(result!.afterTroughPct).toBe(result!.beforeTroughPct);
    expect(result!.afterRecoveryLabel).toBe(result!.beforeRecoveryLabel);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- computeBeforeAfter`
Expected: FAIL — `computeWorstEpisodeComparison` not exported.

- [ ] **Step 3: Implement**

Append to `computeBeforeAfter.ts`:

```ts
export interface EpisodeComparison {
  episodeId: string;
  episodeName: string;
  beforeTroughPct: number; // fraction, e.g. -0.21
  afterTroughPct: number;
  beforeRecoveryLabel: string;
  afterRecoveryLabel: string;
}

const TOP_SCENARIOS = 3;
const MIN_SCENARIO_WEIGHT = 0.05;

/** Same selection rule as computeTieredImpact (top 3 non-upside, weight > 0.05) so the compared
 *  episode is always one the previous page already cited. */
function citedEpisodes(scenarioWeights: Partial<Record<BeliefScenarioName, number>>): Episode[] {
  const top = (Object.entries(scenarioWeights) as [BeliefScenarioName, number][])
    .filter(([name, w]) => w > MIN_SCENARIO_WEIGHT && !BELIEF_SCENARIO_MAPPING[name].isUpside)
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_SCENARIOS);
  const ids = new Set<string>();
  for (const [name] of top) for (const id of BELIEF_SCENARIO_MAPPING[name].episodeIds) ids.add(id);
  return EPISODES.filter((e) => ids.has(e.id));
}

function recoveryLabel(replay: EpisodeReplay): string {
  if (replay.recoverySteps === null) return 'not recovered within the recorded window';
  const unit = replay.granularity === 'annual' ? 'year' : 'month';
  return `${replay.recoverySteps} ${unit}${replay.recoverySteps === 1 ? '' : 's'} from the trough`;
}

/** Portfolio-level worst cited episode, replayed on both mixes. Picking by BEFORE drawdown and
 *  reporting the SAME episode's after keeps the comparison apples-to-apples. */
export function computeWorstEpisodeComparison(
  currentMix: Mix,
  targetMix: Mix,
  scenarioWeights: Partial<Record<BeliefScenarioName, number>>,
  portfolioValueGBP: number,
): EpisodeComparison | null {
  const before = renormaliseOverModelledBuckets(currentMix);
  let worst: EpisodeComparison | null = null;
  let worstDrawdown = Infinity;
  for (const episode of citedEpisodes(scenarioWeights)) {
    const beforeReplay = replayEpisode(before, episode, portfolioValueGBP);
    if (beforeReplay.drawdown >= worstDrawdown) continue;
    const afterReplay = replayEpisode(targetMix, episode, portfolioValueGBP);
    worstDrawdown = beforeReplay.drawdown;
    worst = {
      episodeId: episode.id,
      episodeName: episode.name,
      beforeTroughPct: beforeReplay.drawdown,
      afterTroughPct: afterReplay.drawdown,
      beforeRecoveryLabel: recoveryLabel(beforeReplay),
      afterRecoveryLabel: recoveryLabel(afterReplay),
    };
  }
  return worst;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- computeBeforeAfter`
Expected: 6 PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/beliefImpact/computeBeforeAfter.ts client/src/lib/beliefImpact/computeBeforeAfter.test.ts
git commit -m "feat(belief-impact): worst cited-episode before/after comparison"
```

---

### Task 3: `computeRunwayComparison` + composed `computeBeforeAfter`

**Files:**
- Modify: `client/src/lib/beliefImpact/computeBeforeAfter.ts`
- Test: `client/src/lib/beliefImpact/computeBeforeAfter.test.ts`

- [ ] **Step 1: Write the failing tests**

Append to `computeBeforeAfter.test.ts`:

```ts
import { computeRunwayComparison, computeBeforeAfter } from './computeBeforeAfter';
import { blendBeliefAllocation } from './computeAlignment';

describe('computeRunwayComparison', () => {
  it('returns null when annual essential spend is zero or negative (known survives-bug guard)', () => {
    expect(computeRunwayComparison(
      mkMix({ 'uk-equity': 1 }), mkMix({ cash: 1 }), 'STAGFLATION_1973', 100_000, 0, 50_000,
    )).toBeNull();
    expect(computeRunwayComparison(
      mkMix({ 'uk-equity': 1 }), mkMix({ cash: 1 }), 'STAGFLATION_1973', 100_000, -1, 50_000,
    )).toBeNull();
  });

  it('returns null for an unknown episode id', () => {
    expect(computeRunwayComparison(
      mkMix({ 'uk-equity': 1 }), mkMix({ cash: 1 }), 'NO_SUCH_EPISODE', 100_000, 40_000, 50_000,
    )).toBeNull();
  });

  it('runs the runway walk on both mixes over the same episode', () => {
    const result = computeRunwayComparison(
      mkMix({ 'uk-equity': 1 }), mkMix({ 'govt-bonds': 0.5, cash: 0.5 }),
      'STAGFLATION_1973', 100_000, 40_000, 50_000,
    );
    expect(result).not.toBeNull();
    expect(result!.episodeName.length).toBeGreaterThan(0);
    expect(['year', 'month']).toContain(result!.unit);
    expect(typeof result!.before.survivesWithoutSellingAtTrough).toBe('boolean');
    expect(typeof result!.after.survivesWithoutSellingAtTrough).toBe('boolean');
  });
});

describe('computeBeforeAfter (composed)', () => {
  const weights = { Stagflation: 0.7, 'Property Crash': 0.3 } as const;

  it('after-alignment is exactly 100 by construction (target IS the blended ideal)', () => {
    const result = computeBeforeAfter({
      currentMix: mkMix({ 'uk-equity': 1 }),
      targetMix: blendBeliefAllocation(weights),
      scenarioWeights: weights,
      riskComfort: 'balanced',
      portfolioValueGBP: 250_000,
      annualEssentialSpendGbp: 40_000,
      liquidCashGbp: 60_000,
    });
    expect(result.alignment.after).toBe(100);
    expect(result.alignment.before).toBeLessThan(100);
    expect(result.mixDiff.length).toBeGreaterThan(0);
    expect(result.worstEpisode).not.toBeNull();
    expect(result.runway).not.toBeNull();
  });

  it('omits runway (null) when spend is unset, keeping the rest', () => {
    const result = computeBeforeAfter({
      currentMix: mkMix({ 'uk-equity': 1 }),
      targetMix: blendBeliefAllocation(weights),
      scenarioWeights: weights,
      riskComfort: 'balanced',
      portfolioValueGBP: 250_000,
      annualEssentialSpendGbp: 0,
      liquidCashGbp: 60_000,
    });
    expect(result.runway).toBeNull();
    expect(result.worstEpisode).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- computeBeforeAfter`
Expected: FAIL — `computeRunwayComparison` / `computeBeforeAfter` not exported.

- [ ] **Step 3: Implement**

Append to `computeBeforeAfter.ts`:

```ts
export interface RunwayComparison {
  episodeName: string;
  unit: 'year' | 'month';
  before: IncomeRunwayResult;
  after: IncomeRunwayResult;
}

/** Selling-into-the-trough verdict, before vs after, on ONE named episode. Note (invariant 3 in
 *  the plan): the buffer-exhaustion step is mix-independent — only the recovery timing changes
 *  with the mix — so the comparison is the verdict, never a "runway months" uplift number.
 *  Returns null when spend is unset: computeIncomeRunway's documented precondition — a zero
 *  spend always reports "survives", which would be a false reassurance. */
export function computeRunwayComparison(
  currentMix: Mix,
  targetMix: Mix,
  episodeId: string,
  portfolioValueGBP: number,
  annualEssentialSpendGbp: number,
  liquidCashGbp: number,
): RunwayComparison | null {
  if (annualEssentialSpendGbp <= 0) return null;
  const episode = EPISODES.find((e) => e.id === episodeId);
  if (!episode) return null;
  const before = replayEpisode(renormaliseOverModelledBuckets(currentMix), episode, portfolioValueGBP);
  const after = replayEpisode(targetMix, episode, portfolioValueGBP);
  return {
    episodeName: episode.name,
    unit: episode.granularity === 'annual' ? 'year' : 'month',
    before: computeIncomeRunway(before, annualEssentialSpendGbp, liquidCashGbp, episode.name),
    after: computeIncomeRunway(after, annualEssentialSpendGbp, liquidCashGbp, episode.name),
  };
}

export interface BeforeAfterInputs {
  currentMix: Mix;
  targetMix: Mix;
  scenarioWeights: Partial<Record<BeliefScenarioName, number>>;
  riskComfort: string;
  portfolioValueGBP: number;
  annualEssentialSpendGbp: number;
  liquidCashGbp: number;
}

export interface BeforeAfterResult {
  alignment: { before: number; after: number };
  mixDiff: MixDiffRow[];
  worstEpisode: EpisodeComparison | null;
  runway: RunwayComparison | null;
}

/** The full step-5 payload: every number is a re-run of an engine the previous page already
 *  used, on the same inputs, with only the mix swapped current -> target. */
export function computeBeforeAfter(i: BeforeAfterInputs): BeforeAfterResult {
  const alignment = {
    before: computeAlignment(i.currentMix, i.scenarioWeights, i.riskComfort).score,
    after: computeAlignment(i.targetMix, i.scenarioWeights, i.riskComfort).score,
  };
  const mixDiff = computeMixDiff(i.currentMix, i.targetMix);
  const worstEpisode = computeWorstEpisodeComparison(
    i.currentMix, i.targetMix, i.scenarioWeights, i.portfolioValueGBP,
  );
  const runway = worstEpisode
    ? computeRunwayComparison(
        i.currentMix, i.targetMix, worstEpisode.episodeId,
        i.portfolioValueGBP, i.annualEssentialSpendGbp, i.liquidCashGbp,
      )
    : null;
  return { alignment, mixDiff, worstEpisode, runway };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- computeBeforeAfter`
Expected: 11 PASS.

- [ ] **Step 5: Run the full suite**

Run: `npm test`
Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add client/src/lib/beliefImpact/computeBeforeAfter.ts client/src/lib/beliefImpact/computeBeforeAfter.test.ts
git commit -m "feat(belief-impact): runway comparison + composed before/after engine"
```

---

### Task 4: `BeforeAfterPanel` component + integration into `OutlookAlternatives`

No component test infra exists (vitest runs in node env only) — this task is verified by typecheck now and the browser walkthrough in Task 7.

**Files:**
- Create: `client/src/components/onboarding-v2/BeforeAfterPanel.tsx`
- Modify: `client/src/pages/onboarding-v2/OutlookAlternatives.tsx`

- [ ] **Step 1: Create the panel component**

Create `client/src/components/onboarding-v2/BeforeAfterPanel.tsx`:

```tsx
import { Donut } from '@/components/shared/Donut';
import { fmtSignedPct } from '@/lib/scenarioPlannerView';
import type {
  BeforeAfterResult, MixDiffRow, RunwayComparison,
} from '@/lib/beliefImpact/computeBeforeAfter';
import type { IncomeRunwayResult } from '@/lib/beliefImpact/computeIncomeRunway';

const BUCKET_COLOUR: Record<string, string> = {
  'uk-equity': '#3b82f6', 'us-equity': '#8b5cf6', 'global-equity': '#06b6d4',
  'govt-bonds': '#10b981', 'property': '#f59e0b', 'cash': '#64748b',
};

const bucketLabel = (b: string) => b.replace(/-/g, ' ');

function donutData(rows: MixDiffRow[], key: 'beforePct' | 'afterPct') {
  return rows
    .filter((r) => r[key] > 0)
    .sort((a, b) => b[key] - a[key])
    .map((r) => ({ label: bucketLabel(r.bucket), value: r[key], color: BUCKET_COLOUR[r.bucket] ?? '#94a3b8' }));
}

const fmtPp = (d: number) => `${d > 0 ? '+' : d < 0 ? '−' : ''}${Math.abs(d).toFixed(1)}pp`;

function troughVerdict(r: IncomeRunwayResult, unit: RunwayComparison['unit']): string {
  if (r.survivesWithoutSellingAtTrough) return 'buffer covers essential spending';
  return r.bufferExhaustedAtStep === null
    ? 'buffer would run out'
    : `buffer out after ${r.bufferExhaustedAtStep} ${unit}${r.bufferExhaustedAtStep === 1 ? '' : 's'}`;
}

export default function BeforeAfterPanel({ result }: { result: BeforeAfterResult }) {
  const { alignment, mixDiff, worstEpisode, runway } = result;
  return (
    <div className="space-y-4 pt-4 border-t border-[var(--border)]" data-testid="before-after-panel">
      <div>
        <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
          If you made all the staged changes
        </p>
        <p className="text-sm text-[var(--muted-foreground)]">
          The same models from the previous page, re-run as if both stages were applied in full.
          A simulation of your own outlook — not a forecast, and not a recommendation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" data-testid="before-after-donuts">
        <div className="p-4 rounded-xl border border-[var(--border)]">
          <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-2 text-center">Now</p>
          <Donut data={donutData(mixDiff, 'beforePct')} size={160} />
        </div>
        <div className="p-4 rounded-xl border border-[var(--border)]">
          <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-2 text-center">After all staged moves</p>
          <Donut data={donutData(mixDiff, 'afterPct')} size={160} />
        </div>
      </div>

      <div className="p-4 rounded-xl border border-[var(--border)] space-y-3" data-testid="before-after-stats">
        <div>
          <p className="text-sm">
            Alignment with your outlook:{' '}
            <span className="font-semibold">{alignment.before}</span>
            {' → '}
            <span className="font-semibold">{alignment.after}</span> / 100
          </p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            100 by definition — the illustrative target is built directly from your outlook answers,
            so applying it in full matches them exactly.
          </p>
        </div>
        {worstEpisode && (
          <p className="text-sm" data-testid="before-after-worst-episode">
            Deepest cited episode ({worstEpisode.episodeName}):{' '}
            {fmtSignedPct(worstEpisode.beforeTroughPct)} {'→'} {fmtSignedPct(worstEpisode.afterTroughPct)} at the trough.
            {' '}Recovery: {worstEpisode.beforeRecoveryLabel} {'→'} {worstEpisode.afterRecoveryLabel}.
          </p>
        )}
        {runway && (
          <p className="text-sm" data-testid="before-after-runway">
            Selling into the trough ({runway.episodeName}):{' '}
            {troughVerdict(runway.before, runway.unit)} now {'→'} {troughVerdict(runway.after, runway.unit)} after the staged moves.
          </p>
        )}
      </div>

      <div data-testid="before-after-diff-table">
        <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
          Allocation changes, bucket by bucket
        </p>
        <div className="rounded-xl border border-[var(--border)] divide-y divide-[var(--border)]">
          {mixDiff.map((row) => (
            <div key={row.bucket} className="flex items-center justify-between px-4 py-2 text-sm">
              <span className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: BUCKET_COLOUR[row.bucket] ?? '#94a3b8' }}
                />
                {bucketLabel(row.bucket)}
              </span>
              <span className="flex items-center gap-3 tabular-nums">
                <span className="text-[var(--muted-foreground)]">{row.beforePct.toFixed(1)}%</span>
                <span className="text-[var(--muted-foreground)]">{'→'}</span>
                <span>{row.afterPct.toFixed(1)}%</span>
                <span className={
                  row.deltaPp > 0 ? 'text-emerald-600 dark:text-emerald-400 w-20 text-right'
                    : row.deltaPp < 0 ? 'text-rose-600 dark:text-rose-400 w-20 text-right'
                      : 'text-[var(--muted-foreground)] w-20 text-right'
                }>
                  {row.deltaPp > 0 ? '▲' : row.deltaPp < 0 ? '▼' : ''} {fmtPp(row.deltaPp)}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Integrate into `OutlookAlternatives`**

In `client/src/pages/onboarding-v2/OutlookAlternatives.tsx`:

(a) Add imports:

```tsx
import BeforeAfterPanel from '@/components/onboarding-v2/BeforeAfterPanel';
import { computeBeforeAfter } from '@/lib/beliefImpact/computeBeforeAfter';
```

(b) Pull `intake` from the store — change line 30:

```tsx
const { holdings, outlook, summary, intake } = useOnboardingV2Store();
```

(c) After the `targetMix` memo (line 48), add:

```tsx
const beforeAfter = useMemo(() => {
  if (outlook.insufficient_signal) return null;
  return computeBeforeAfter({
    currentMix: mix,
    targetMix,
    scenarioWeights: outlook.scenario_weights,
    riskComfort: intake.risk_comfort,
    portfolioValueGBP: summary.total_investable_value,
    annualEssentialSpendGbp: intake.annual_essential_spend_gbp,
    liquidCashGbp: intake.liquid_cash_gbp,
  });
}, [
  outlook.insufficient_signal, mix, targetMix, outlook.scenario_weights, intake.risk_comfort,
  summary.total_investable_value, intake.annual_essential_spend_gbp, intake.liquid_cash_gbp,
]);
```

(d) Render the panel as the last block inside the `{result && (...)}` fragment — after the stage-2 section, still inside the `space-y-4` div:

```tsx
{beforeAfter && <BeforeAfterPanel result={beforeAfter} />}
```

The panel renders only when the staged plan rendered (`result &&` wrapper), so "the staged changes" it refers to are on screen; the insufficient-signal early-return path is untouched.

- [ ] **Step 3: Typecheck against the baseline**

Run: `npm run check 2>&1 | grep -c "error TS"`
Expected: same count as main's baseline (188 pre-existing; run the same command on a clean `main` checkout if in doubt). New errors from these files: zero.

- [ ] **Step 4: Commit**

```bash
git add client/src/components/onboarding-v2/BeforeAfterPanel.tsx client/src/pages/onboarding-v2/OutlookAlternatives.tsx
git commit -m "feat(onboarding): before/after impact replay panel on outlook alternatives"
```

---

### Task 5: 4-stat summary card grid

Replaces the single-sentence summary card (`OutlookAlternatives.tsx` — the `p-4 rounded-xl` div containing "Estimated turnover: …") with the audit's tier-2 stat grid, surfacing the currently-unused `totalAbsChangePp`, `liquidityNowPct`, `liquidityTargetPct` fields.

**Files:**
- Modify: `client/src/pages/onboarding-v2/OutlookAlternatives.tsx`

- [ ] **Step 1: Add a local `StatCard` helper**

Above the `export default function OutlookAlternatives()` line, add:

```tsx
function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="p-3 rounded-xl border border-[var(--border)]">
      <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">{label}</p>
      <p className="text-lg font-semibold mt-0.5 tabular-nums">{value}</p>
      {sub && <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{sub}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Replace the summary sentence with the grid**

Replace:

```tsx
<div className="p-4 rounded-xl border border-[var(--border)]">
  <p className="text-sm">
    Estimated turnover: ~{result.summary.estTurnoverPp}pp; indicative cost: ~{(result.summary.estCostPct * 100).toFixed(2)}% of your modelled portfolio.
  </p>
</div>
```

with:

```tsx
<div className="grid grid-cols-2 sm:grid-cols-4 gap-3" data-testid="alternatives-summary-grid">
  <StatCard label="Total change" value={`${result.summary.totalAbsChangePp}pp`} />
  <StatCard label="Est. turnover" value={`~${result.summary.estTurnoverPp}pp`} />
  <StatCard label="Indicative cost" value={`~${(result.summary.estCostPct * 100).toFixed(2)}%`} sub="of modelled portfolio" />
  <StatCard
    label="Liquidity"
    value={`${result.summary.liquidityNowPct}% → ${result.summary.liquidityTargetPct}%`}
    sub={result.summary.liquidityFixPp !== undefined ? `includes +${result.summary.liquidityFixPp}pp top-up` : undefined}
  />
</div>
```

- [ ] **Step 3: Typecheck**

Run: `npm run check 2>&1 | grep -c "error TS"`
Expected: unchanged from baseline.

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/onboarding-v2/OutlookAlternatives.tsx
git commit -m "feat(onboarding): 4-stat summary grid on outlook alternatives"
```

---

### Task 6: Stage tabs with live counts

Replaces the two static stage headings with "Do now (N)" / "Later — illiquid (N)" toggles (audit tier-2 device). Keep the existing `data-testid="alternatives-stage1"` / `"alternatives-stage2"` on the lists.

**Files:**
- Modify: `client/src/pages/onboarding-v2/OutlookAlternatives.tsx`

- [ ] **Step 1: Add tab state**

`useState` is already imported. Inside the component, next to the other state hooks:

```tsx
const [activeStage, setActiveStage] = useState<1 | 2>(1);
```

- [ ] **Step 2: Replace the two stage sections**

Replace both blocks (`{result.staged.stage1.length > 0 && (...)}` and `{result.staged.stage2.length > 0 && (...)}`) with:

```tsx
<div>
  <div className="flex gap-2 mb-3" role="tablist" aria-label="Staged moves" data-testid="alternatives-stage-tabs">
    <button
      role="tab"
      aria-selected={activeStage === 1}
      onClick={() => setActiveStage(1)}
      className={`px-3 py-1.5 rounded-full border text-sm ${activeStage === 1
        ? 'border-[var(--foreground)] font-medium'
        : 'border-[var(--border)] text-[var(--muted-foreground)]'}`}
      data-testid="stage-tab-1"
    >
      Do now ({result.staged.stage1.length})
    </button>
    <button
      role="tab"
      aria-selected={activeStage === 2}
      onClick={() => setActiveStage(2)}
      className={`px-3 py-1.5 rounded-full border text-sm ${activeStage === 2
        ? 'border-[var(--foreground)] font-medium'
        : 'border-[var(--border)] text-[var(--muted-foreground)]'}`}
      data-testid="stage-tab-2"
    >
      Later — illiquid ({result.staged.stage2.length})
    </button>
  </div>
  {activeStage === 1 && (
    <div role="tabpanel" data-testid="alternatives-stage1">
      {result.staged.stage1.length === 0 && (
        <p className="text-sm text-[var(--muted-foreground)]">No moves at this stage.</p>
      )}
      {result.staged.stage1.map((a, i) => (
        <p key={i} className="text-sm">
          {a.bucket.replace(/-/g, ' ')}: {a.type === 'ADD' ? '+' : '-'}{Math.abs(a.deltaPct * 100).toFixed(1)}pp
          {' '}({formatCurrency(Math.round(a.amountGBP))}) — {a.rationale}
        </p>
      ))}
    </div>
  )}
  {activeStage === 2 && (
    <div role="tabpanel" data-testid="alternatives-stage2">
      {result.staged.stage2.length === 0 && (
        <p className="text-sm text-[var(--muted-foreground)]">No moves at this stage.</p>
      )}
      {result.staged.stage2.map((a, i) => (
        <p key={i} className="text-sm">
          {a.bucket.replace(/-/g, ' ')}: {a.type === 'ADD' ? '+' : '-'}{Math.abs(a.deltaPct * 100).toFixed(1)}pp
          {' '}({formatCurrency(Math.round(a.amountGBP))}) — {a.rationale}
        </p>
      ))}
    </div>
  )}
</div>
```

- [ ] **Step 3: Typecheck**

Run: `npm run check 2>&1 | grep -c "error TS"`
Expected: unchanged from baseline.

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/onboarding-v2/OutlookAlternatives.tsx
git commit -m "feat(onboarding): stage tabs with live counts on outlook alternatives"
```

---

### Task 7: Full verification (suite + typecheck + browser walkthrough)

Done by the orchestrating session, not delegated (prior-session verification stance).

- [ ] **Step 1: Full test suite**

Run: `npm test`
Expected: all green (entire prior suite + 11 new).

- [ ] **Step 2: Typecheck vs baseline**

Run: `npm run check 2>&1 | grep -c "error TS"`
Expected: exactly the main baseline (188). If it differs, diff against `git stash && npm run check` on main to isolate.

- [ ] **Step 3: Browser walkthrough**

If `npm run dev` fails with `ENOTSUP` in the sandbox, temporarily change `host: "0.0.0.0"` to `host: "127.0.0.1"` in `server/index.ts` `listenOptions` — and **revert before any commit** (`git checkout -- server/index.ts`).

Walk: Start → intake (fill risk comfort, essential spend, liquid cash) → holdings (include some equity + property + cash) → beliefs → outlook (answer B1–B15 non-neutrally) → outlook-results → **outlook-alternatives**. Verify:
- 4-stat grid renders with plausible numbers; liquidity shows now → target.
- Stage tabs show counts; switching tabs swaps the lists; empty stage shows "No moves at this stage."
- Before/after panel: two donuts (different shapes), alignment X → 100 with the by-definition caption, worst-episode trough before → after (after should usually be shallower for a defensive target), runway verdict line present (spend was set).
- Set essential spend to 0 via intake (fresh run): runway line absent, panel otherwise intact.
- Neutral-answers run: insufficient-signal screen unchanged, no panel, no network call.
- Screenshot the alternatives screen for the PR.

- [ ] **Step 4: Revert the host patch if applied**

Run: `git status` — `server/index.ts` must not appear. If it does: `git checkout -- server/index.ts`.

---

### Task 8: Merge main in, push, open PR (Werner workflow)

- [ ] **Step 1: Merge latest main into the feature branch**

```bash
git fetch origin && git merge origin/main
```

Expected: clean merge (resolve any conflict locally; never rebase/force-push).

- [ ] **Step 2: Re-run the suite after merge**

Run: `npm test`
Expected: all green.

- [ ] **Step 3: Push and open the PR**

```bash
git push -u origin feat/before-after-impact-replay
gh pr create --title "feat(onboarding): before/after impact replay on outlook alternatives" --body "$(cat <<'EOF'
## What

Closes value-chain step 5 from the scoping note (PR #33): after the staged moves, the same three models from outlook-results are re-run on the post-action target mix and rendered before → after.

- **Before/after panel** on OutlookAlternatives: side-by-side donuts (now vs after all staged moves), alignment score pair, worst cited-episode trough + recovery comparison, selling-into-the-trough verdict, signed per-bucket diff table.
- **4-stat summary grid** (total change / turnover / indicative cost / liquidity now→target) replacing the single-sentence summary.
- **Stage tabs with live counts** ("Do now (N)" / "Later — illiquid (N)") replacing static headings.

## Honesty notes (audit doctrine applied)

- The "after" mix is the target mix exactly — stage-1 + stage-2 deltas sum to target−current by construction (stagedRebalance assertion), and the panel says "both stages applied in full".
- After-alignment is 100 by definition (the target IS the blended outlook ideal); captioned as such rather than presented as an uplift.
- The runway comparison reports the selling-into-the-trough verdict, not a fabricated "runway months" gain — the buffer walk is mix-independent.
- Runway line is omitted entirely when essential spend is unset (the documented always-survives precondition).

## Engine changes

None. One export widened (`MODELLED_BUCKETS` from computeAlignment). All new computation is a pure client-side composition of existing engines, TDD'd in `computeBeforeAfter.test.ts`.

## Verification

- `npm test`: all green (11 new tests).
- `npm run check`: error count unchanged from main baseline.
- Manual browser walkthrough incl. insufficient-signal and zero-spend paths (screenshot below).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 4: Attach the walkthrough screenshot to the PR**

Use `gh pr comment` with the screenshot from Task 7, or note in the PR body where it lives.
