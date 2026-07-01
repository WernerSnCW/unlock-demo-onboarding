# Belief-Impact-Alternatives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the belief→impact→alternatives→mismatch onboarding step: ask macro-outlook beliefs (B1–B15), map them to cited/illustrative historical impact on the user's real portfolio, show a tiered alignment score with a self-ID mismatch flag, and generate illustrative rebalancing alternatives — inserted between the existing Target step and NextSteps.

**Architecture:** Belief scoring and all impact/alignment computation run client-side as pure functions (matching the codebase's existing pattern for style-tilt belief scoring and the already-built episode-replay engine from the parked scenario-planner thread, which this plan reuses directly rather than duplicating). Only the rebalancing-action generation stays server-side, by generalizing the existing `/api/actions` engine to accept a parametrized bucket list rather than duplicating its algorithm.

**Tech Stack:** React + TypeScript (client), Express + TypeScript (server), Zustand (store), wouter (routing), Vitest (tests — note the config only picks up `tests/**/*.test.ts` and `client/src/**/*.test.ts`, NOT `.tsx`, so this plan follows the codebase's existing convention of testing logic modules only, not components).

**Spec of record:** `docs/superpowers/specs/2026-07-01-belief-impact-alternatives-design.md` (v2, approved). This plan implements it; where the spec explicitly deferred a decision to "implementation plan level" (§3 all-neutral fallback, §4 scenario→episode mapping, §5 allocation-prior substrate, §6 withdrawal pro-ration, §7 bucket-list generalization), this plan makes that decision concretely below — each is called out inline.

---

## Key reuse discovery (read before starting)

A prior, since-parked "scenario-planner roster-expansion" thread already built a tested, working episode-impact pipeline on the exact same `episodeLibrary.ts` 8-bucket taxonomy this design needs. **Do not duplicate these — import and reuse them directly:**

- `client/src/lib/portfolioMix.ts` — `mixFromHoldings(holdings)` → `{ mix, unmodelledShare }`, already normalises over modelled buckets only and excludes unmappable holdings (PE/structured/FX/etc.) exactly as spec §5 requires.
- `client/src/lib/empiricalEngine.ts` — `replayEpisode(mix, episode, startValue)` → `EpisodeReplay { points, drawdown, troughIndex, recoverySteps, contributors, noDataShare }`. This IS the tier-1 "cited replay" impact computation.
- `client/src/lib/scenarioStress.ts` — `shockFor(scenario, assetClass, region)` and `computeScenarioStress(holdings, scenarios)`. This IS the tier-2 "modern-anchor illustrative" impact computation.
- `client/src/lib/episodeBlend.ts` — `blendEpisodes(replays, weights)` for combining multiple episodes.
- `client/src/lib/portfolioMath.ts` — `rankContributors`, `valueWeights` generic helpers.
- `client/src/lib/scenarioPlannerView.ts` — `fmtSignedPct`, `fmtRecovery` formatting helpers; reuse for consistent display conventions.
- `client/src/data/scenarioPlannerCopy.ts` — existing non-advice/illustrative copy conventions (`ADVICE_EXIT`, compliance caption style). New copy in this plan follows the same voice, marked `CONTENT-BRAIN-GATE: provisional voice` the same way.

None of the above are modified by this plan. This plan only adds new files that call into them, plus the genuinely new pieces: B1–B15 scoring, the belief→scenario mapping, the alignment-score allocation-prior substrate, income-runway, and the generalized rebalancing engine.

---

## File Structure

**New files:**
- `client/src/data/beliefImpactTaxonomy.ts` — tier classification (§1), belief-scenario→episode/stress-scenario mapping (§4), belief-scenario allocation priors (§5 substrate).
- `client/src/lib/beliefImpact/scoreOutlook.ts` — B1–B15 scenario-level-clamp aggregation (§2–3).
- `client/src/lib/beliefImpact/computeAlignment.ts` — alignment score, band, concentration flag, self-ID mismatch flag (§5); also exports `blendBeliefAllocation`, reused as the alternatives target mix (§7).
- `client/src/lib/beliefImpact/computeTieredImpact.ts` — per-bucket tiered impact narrative, wiring belief scenarios to `replayEpisode`/`shockFor` (§1/§4/§8), plus unmodelled-holdings breakdown.
- `client/src/lib/beliefImpact/computeIncomeRunway.ts` — withdrawal-runway-vs-episode-path (§6).
- `server/lib/actions/stagedRebalance.ts` — generic rebalancing algorithm extracted from `engine.ts`, parametrized by bucket list/liquidity buckets/friction rates (§7 "algorithm-generic" requirement).
- `server/lib/actions/beliefActionsEngine.ts` — wraps `stagedRebalance.ts` for the 8-bucket episode taxonomy.
- `client/src/pages/onboarding-v2/Outlook.tsx` — new step: B1–B15 questionnaire.
- `client/src/pages/onboarding-v2/OutlookResults.tsx` — new step: alignment score/band, mismatch flags, tiered impact, income-runway.
- `client/src/pages/onboarding-v2/OutlookAlternatives.tsx` — new step: illustrative rebalancing alternatives.
- Tests: `client/src/data/beliefImpactTaxonomy.test.ts`, `client/src/lib/beliefImpact/scoreOutlook.test.ts`, `client/src/lib/beliefImpact/computeAlignment.test.ts`, `client/src/lib/beliefImpact/computeTieredImpact.test.ts`, `client/src/lib/beliefImpact/computeIncomeRunway.test.ts`, `tests/stagedRebalance.test.ts`, `tests/beliefActionsEngine.test.ts`.

**Modified files:**
- `client/src/data/beliefQuestions.ts` — B7/B8/B10 statement rewrites (audit fix, §2).
- `client/src/state/onboardingV2Store.ts` — export `normaliseAnswer` (currently private); add `outlook` state slice + actions.
- `server/lib/actions/engine.ts` — refactor `buildActions` to call `computeStagedRebalance` (behavior-preserving).
- `server/routes.ts` — add `/api/belief-actions` route.
- `client/src/App.tsx` — 3 new lazy routes.
- `client/src/pages/onboarding-v2/Target.tsx` — `handleContinue` navigates to `/onboarding-v2/outlook` instead of `/onboarding-v2/next-steps`.
- `client/src/pages/onboarding-v2/NextSteps.tsx` — `handleBack` navigates to `/onboarding-v2/outlook-alternatives` instead of `/onboarding-v2/target`.

**Flow after this plan:** `...→ target → outlook → outlook-results → outlook-alternatives → next-steps → ...` (unchanged before `target` and after `next-steps`).

---

### Task 1: Belief-impact taxonomy & mapping data

**Files:**
- Create: `client/src/data/beliefImpactTaxonomy.ts`
- Test: `client/src/data/beliefImpactTaxonomy.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { BUCKETS } from './episodeLibrary';
import {
  BUCKET_TIER, BELIEF_SCENARIO_NAMES, BELIEF_SCENARIO_MAPPING, BELIEF_SCENARIO_ALLOCATION_PRIORS,
} from './beliefImpactTaxonomy';

describe('beliefImpactTaxonomy', () => {
  it('classifies every episodeLibrary bucket into a tier', () => {
    for (const b of BUCKETS) expect(BUCKET_TIER[b]).toBeDefined();
  });

  it('keeps europe/emerging equity UNMODELLED until sourced (spec §1 footnote)', () => {
    expect(BUCKET_TIER['europe-equity']).toBe('UNMODELLED');
    expect(BUCKET_TIER['emerging-equity']).toBe('UNMODELLED');
  });

  it('classifies uk-equity, us-equity, govt-bonds, cash as EPISODE_REPLAY (tier 1)', () => {
    expect(BUCKET_TIER['uk-equity']).toBe('EPISODE_REPLAY');
    expect(BUCKET_TIER['us-equity']).toBe('EPISODE_REPLAY');
    expect(BUCKET_TIER['govt-bonds']).toBe('EPISODE_REPLAY');
    expect(BUCKET_TIER['cash']).toBe('EPISODE_REPLAY');
  });

  it('has a mapping entry for every named belief scenario', () => {
    for (const name of BELIEF_SCENARIO_NAMES) expect(BELIEF_SCENARIO_MAPPING[name]).toBeDefined();
  });

  it('marks Rate-Cut Reflation as the sole upside scenario with no drawdown episodes', () => {
    expect(BELIEF_SCENARIO_MAPPING['Rate-Cut Reflation'].isUpside).toBe(true);
    expect(BELIEF_SCENARIO_MAPPING['Rate-Cut Reflation'].episodeIds).toHaveLength(0);
  });

  it('every allocation-prior row sums to 1 and excludes UNMODELLED buckets', () => {
    for (const name of BELIEF_SCENARIO_NAMES) {
      const prior = BELIEF_SCENARIO_ALLOCATION_PRIORS[name];
      const sum = Object.values(prior).reduce((s, v) => s + (v as number), 0);
      expect(sum).toBeCloseTo(1, 6);
      expect(prior['europe-equity']).toBeUndefined();
      expect(prior['emerging-equity']).toBeUndefined();
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run client/src/data/beliefImpactTaxonomy.test.ts`
Expected: FAIL with "Cannot find module './beliefImpactTaxonomy'"

- [ ] **Step 3: Write the implementation**

```typescript
import type { Bucket } from './episodeLibrary';

export type ImpactTier = 'EPISODE_REPLAY' | 'MODERN_ANCHOR' | 'UNMODELLED';

/** Fixed per-bucket tier classification (spec §1) — assigned once by data depth, not re-judged
 *  per episode. europe-equity/emerging-equity sit in UNMODELLED until a modern-era series is
 *  sourced (tracked separately, not blocking this design) even though the Bucket slot exists. */
export const BUCKET_TIER: Record<Bucket, ImpactTier> = {
  'uk-equity': 'EPISODE_REPLAY',
  'us-equity': 'EPISODE_REPLAY',
  'govt-bonds': 'EPISODE_REPLAY',
  'cash': 'EPISODE_REPLAY',
  'property': 'MODERN_ANCHOR',
  'global-equity': 'MODERN_ANCHOR',
  'europe-equity': 'UNMODELLED',
  'emerging-equity': 'UNMODELLED',
};

export type BeliefScenarioName =
  | 'AI Recession' | 'Property Crash' | 'Stagflation' | 'Debt Spiral'
  | 'Tech Burst' | 'Sterling Devaluation' | 'Energy Shock' | 'Rate-Cut Reflation';

export const BELIEF_SCENARIO_NAMES: BeliefScenarioName[] = [
  'AI Recession', 'Property Crash', 'Stagflation', 'Debt Spiral',
  'Tech Burst', 'Sterling Devaluation', 'Energy Shock', 'Rate-Cut Reflation',
];

export interface ScenarioMapping {
  /** cited episodes (episodeLibrary.ts EPISODES ids) — tier-1 replay data */
  episodeIds: string[];
  /** illustrative stress scenarios (stressScenarios.ts ids) — tier-2 anchor data */
  stressScenarioIds: string[];
  /** true for the one benign/upside scenario — no drawdown episode, narrative framing differs (§4) */
  isUpside: boolean;
}

/** Spec §4 belief→impact bridge. Illustrative starting mapping — final editorial pass is a
 *  build-time task per the spec itself, not decided here; the IDs are real and functional now. */
export const BELIEF_SCENARIO_MAPPING: Record<BeliefScenarioName, ScenarioMapping> = {
  'Stagflation': { episodeIds: ['STAGFLATION_1973', 'RATE_SHOCK_2022'], stressScenarioIds: [], isUpside: false },
  'Property Crash': { episodeIds: ['DOTCOM_2000', 'GFC_2008', 'COVID_2020'], stressScenarioIds: ['PROPERTY_DOWNTURN'], isUpside: false },
  'AI Recession': { episodeIds: ['DOTCOM_2000'], stressScenarioIds: ['TECH_CORRECTION'], isUpside: false },
  'Tech Burst': { episodeIds: ['DOTCOM_2000'], stressScenarioIds: ['TECH_CORRECTION'], isUpside: false },
  'Debt Spiral': { episodeIds: ['RATE_SHOCK_2022', 'STAGFLATION_1973'], stressScenarioIds: [], isUpside: false },
  'Sterling Devaluation': { episodeIds: ['RATE_SHOCK_2022', 'STAGFLATION_1973'], stressScenarioIds: [], isUpside: false },
  'Energy Shock': { episodeIds: ['STAGFLATION_1973'], stressScenarioIds: ['RATE_INFLATION_SHOCK'], isUpside: false },
  'Rate-Cut Reflation': { episodeIds: [], stressScenarioIds: [], isUpside: true },
};

/** Spec §5 alignment substrate: hand-authored ideal allocation per belief scenario over the
 *  8-bucket real-data taxonomy — same pattern as computeGap.ts's SCENARIO_PRIORS (S001-S010),
 *  applied to episodeLibrary's taxonomy instead of the fabricated one. Illustrative first pass,
 *  informed by which buckets held up in each scenario's mapped episodes; editorial pass expected
 *  at build time (mirrors the spec's own framing for §4). europe-equity/emerging-equity excluded
 *  (UNMODELLED, never allocated into). */
export const BELIEF_SCENARIO_ALLOCATION_PRIORS: Record<BeliefScenarioName, Partial<Record<Bucket, number>>> = {
  'Stagflation': { 'cash': 0.35, 'govt-bonds': 0.15, 'uk-equity': 0.15, 'us-equity': 0.15, 'global-equity': 0.10, 'property': 0.10 },
  'Property Crash': { 'cash': 0.20, 'govt-bonds': 0.25, 'uk-equity': 0.20, 'us-equity': 0.15, 'global-equity': 0.15, 'property': 0.05 },
  'AI Recession': { 'cash': 0.20, 'govt-bonds': 0.25, 'uk-equity': 0.20, 'us-equity': 0.10, 'global-equity': 0.15, 'property': 0.10 },
  'Tech Burst': { 'cash': 0.15, 'govt-bonds': 0.20, 'uk-equity': 0.20, 'us-equity': 0.10, 'global-equity': 0.20, 'property': 0.15 },
  'Debt Spiral': { 'cash': 0.30, 'govt-bonds': 0.05, 'uk-equity': 0.20, 'us-equity': 0.15, 'global-equity': 0.15, 'property': 0.15 },
  'Sterling Devaluation': { 'cash': 0.15, 'govt-bonds': 0.10, 'uk-equity': 0.10, 'us-equity': 0.25, 'global-equity': 0.25, 'property': 0.15 },
  'Energy Shock': { 'cash': 0.30, 'govt-bonds': 0.15, 'uk-equity': 0.15, 'us-equity': 0.15, 'global-equity': 0.15, 'property': 0.10 },
  'Rate-Cut Reflation': { 'cash': 0.05, 'govt-bonds': 0.10, 'uk-equity': 0.20, 'us-equity': 0.25, 'global-equity': 0.25, 'property': 0.15 },
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run client/src/data/beliefImpactTaxonomy.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add client/src/data/beliefImpactTaxonomy.ts client/src/data/beliefImpactTaxonomy.test.ts
git commit -m "feat(belief-impact): add tier taxonomy and belief-scenario mapping data"
```

---

### Task 2: Belief question corrections (B7/B8/B10)

**Files:**
- Modify: `client/src/data/beliefQuestions.ts:85-100,111-117`

This is a data edit, not logic — no test needed (the existing `BELIEF_QUESTIONS` shape/weights/direction fields are unchanged, only `statement` text changes on 3 entries, per the audited spec §2 drafts). Wording is Tom's to finalize; these are the audited draft replacements, not final copy — mirrors the `CONTENT-BRAIN-GATE: provisional voice` pattern already used elsewhere in this codebase (e.g. `scenarioPlannerCopy.ts`).

- [ ] **Step 1: Edit B7's statement**

In `client/src/data/beliefQuestions.ts`, find:

```typescript
  {
    id: "B7_renting_vs_buying",
    statement: "For a 30-year-old today, renting is a better choice than buying over the next 5 years.",
    direction: "higher->Property Crash",
    weights: {
      "Property Crash": 0.18
    }
  },
```

Replace with:

```typescript
  {
    id: "B7_renting_vs_buying",
    // CONTENT-BRAIN-GATE: provisional voice, draft replacement per 2026-07-01 audit (was a disguised
    // property-price call) — Tom to finalize wording/tone.
    statement: "Remote and flexible working will reduce demand for city-centre housing over the next 5 years.",
    direction: "higher->Property Crash",
    weights: {
      "Property Crash": 0.18
    }
  },
```

- [ ] **Step 2: Edit B8's statement**

Find:

```typescript
  {
    id: "B8_local_investment_preference",
    statement: "Investing in local businesses and infrastructure is more attractive than investing in property.",
    direction: "higher->Property Crash, Rate-Cut Reflation",
    weights: {
      "Property Crash": 0.10,
      "Rate-Cut Reflation": 0.08
    }
  },
```

Replace with:

```typescript
  {
    id: "B8_local_investment_preference",
    // CONTENT-BRAIN-GATE: provisional voice, draft replacement per 2026-07-01 audit (was a direct
    // investment-attractiveness comparison) — Tom to finalize wording/tone; weight kept as-is.
    statement: "UK housing supply will increase enough over the next 5 years to meaningfully improve affordability.",
    direction: "higher->Property Crash, Rate-Cut Reflation",
    weights: {
      "Property Crash": 0.10,
      "Rate-Cut Reflation": 0.08
    }
  },
```

- [ ] **Step 3: Edit B10's statement**

Find:

```typescript
  {
    id: "B10_fx_view",
    statement: "The British pound will depreciate against the US dollar and euro over the next 2 years.",
    direction: "higher->Sterling Devaluation",
    weights: {
      "Sterling Devaluation": 0.22
    }
  },
```

Replace with:

```typescript
  {
    id: "B10_fx_view",
    // CONTENT-BRAIN-GATE: provisional voice, draft replacement per 2026-07-01 audit (was the FX call
    // itself, not a belief implying one) — Tom to finalize wording/tone.
    statement: "International investors will lose confidence in the UK's fiscal position over the next 2 years.",
    direction: "higher->Sterling Devaluation",
    weights: {
      "Sterling Devaluation": 0.22
    }
  },
```

- [ ] **Step 4: Verify no other file references the old statement text**

Run: `grep -rn "renting is a better choice\|Investing in local businesses\|will depreciate against the US dollar" client/src --include="*.ts" --include="*.tsx"`
Expected: no output (only `beliefQuestions.ts` held the strings, now changed)

- [ ] **Step 5: Commit**

```bash
git add client/src/data/beliefQuestions.ts
git commit -m "fix(belief-impact): rewrite B7/B8/B10 to remove disguised asset-price calls (audit fix)"
```

---

### Task 3: Outlook belief scoring (scenario-level clamp)

**Files:**
- Create: `client/src/lib/beliefImpact/scoreOutlook.ts`
- Test: `client/src/lib/beliefImpact/scoreOutlook.test.ts`

**Implementation-plan decision (spec §3 open item):** all-Neutral / fully-self-cancelling responses yield `insufficientSignal: true` rather than a silent equal-weight guess — the safer, more honest option given the Consumer Duty framing already established for this feature.

**Implementation-plan decision (correctness fix vs. a naive reading of §4):** the aggregation iterates every scenario key in a question's `weights` object, applying the SAME sign (derived only from the `higher`/`lower` keyword in `direction`), not just the scenarios listed after `->` in `direction`. This matters concretely for B12 (`direction: "higher->Rate-Cut Reflation"`, `weights: {"Rate-Cut Reflation":0.30,"AI Recession":-0.10,"Debt Spiral":-0.10}`) — its negative AI Recession/Debt Spiral weights are NOT listed in `direction`'s scenario list, but per spec §3's own audit note they must still net against other AI-Recession/Debt-Spiral-weighted questions, not be discarded. Test 3 below proves this exact case.

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { scoreOutlookBeliefs } from './scoreOutlook';

describe('scoreOutlookBeliefs', () => {
  it('all-Neutral responses → insufficientSignal, all weights zero', () => {
    const responses = {
      B1_mobility_views: 3 as const, B4_government_confidence: 3 as const, B5_energy_policy: 3 as const,
    };
    const result = scoreOutlookBeliefs(responses);
    expect(result.insufficientSignal).toBe(true);
    expect(Object.values(result.scenarioWeights).every((w) => w === 0)).toBe(true);
  });

  it('a single strongly-agreed question splits weight proportionally across its scenarios', () => {
    // B5: "higher->Energy Shock, Stagflation", weights {Energy Shock:0.22, Stagflation:0.15}
    const result = scoreOutlookBeliefs({ B5_energy_policy: 5 });
    expect(result.insufficientSignal).toBe(false);
    expect(result.scenarioWeights['Energy Shock']).toBeCloseTo(0.22 / 0.37, 6);
    expect(result.scenarioWeights['Stagflation']).toBeCloseTo(0.15 / 0.37, 6);
    expect(result.scenarioWeights['AI Recession']).toBe(0);
  });

  it('B12 negative cross-scenario weight nets against another question feeding the same scenario (audit fix)', () => {
    // B2: "lower->AI Recession, Tech Burst", weights {AI Recession:0.20, Tech Burst:0.15}
    //   strongly DISAGREE (1) with "lower" direction → signedScore = -1.0 * -1 = +1.0
    //   contributes AI Recession += 0.20, Tech Burst += 0.15
    // B12: "higher->Rate-Cut Reflation", weights {Rate-Cut Reflation:0.30, AI Recession:-0.10, Debt Spiral:-0.10}
    //   strongly AGREE (5) with "higher" direction → signedScore = +1.0
    //   contributes Rate-Cut Reflation += 0.30, AI Recession += -0.10, Debt Spiral += -0.10 (clamped to 0)
    // Net AI Recession = 0.20 - 0.10 = 0.10 (not discarded, not double-counted)
    const result = scoreOutlookBeliefs({ B2_job_security_white_collar: 1, B12_policy_support: 5 });
    const sum = 0.10 + 0.15 + 0.30; // AI Recession + Tech Burst + Rate-Cut Reflation, Debt Spiral clamped to 0
    expect(result.scenarioWeights['AI Recession']).toBeCloseTo(0.10 / sum, 6);
    expect(result.scenarioWeights['Tech Burst']).toBeCloseTo(0.15 / sum, 6);
    expect(result.scenarioWeights['Rate-Cut Reflation']).toBeCloseTo(0.30 / sum, 6);
    expect(result.scenarioWeights['Debt Spiral']).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run client/src/lib/beliefImpact/scoreOutlook.test.ts`
Expected: FAIL with "Cannot find module './scoreOutlook'"

- [ ] **Step 3: Write the implementation**

```typescript
import { BELIEF_QUESTIONS } from '../../data/beliefQuestions';
import { BELIEF_SCENARIO_NAMES, type BeliefScenarioName } from '../../data/beliefImpactTaxonomy';

export type OutlookAnswer = 1 | 2 | 3 | 4 | 5;

export interface ScoreOutlookResult {
  scenarioWeights: Record<BeliefScenarioName, number>;
  insufficientSignal: boolean;
}

function normaliseOutlookAnswer(answer: OutlookAnswer): number {
  return (answer - 3) / 2;
}

function directionSign(direction: string): 1 | -1 {
  return direction.trim().toLowerCase().startsWith('lower') ? -1 : 1;
}

function zeroedScenarios(): Record<BeliefScenarioName, number> {
  return Object.fromEntries(BELIEF_SCENARIO_NAMES.map((s) => [s, 0])) as Record<BeliefScenarioName, number>;
}

/** Spec §3: sum signed contributions WITHIN each scenario first, THEN clamp at zero, THEN
 *  normalise across scenarios. Supersedes an earlier per-question clamp (audit fix) which let one
 *  agreed-with question fully drive a scenario while a contradicting answer to the SAME scenario
 *  contributed nothing. */
export function scoreOutlookBeliefs(
  responses: Partial<Record<string, OutlookAnswer>>,
): ScoreOutlookResult {
  const totals = zeroedScenarios();

  for (const q of BELIEF_QUESTIONS) {
    const answer = responses[q.id];
    if (answer === undefined) continue;
    const signedScore = normaliseOutlookAnswer(answer) * directionSign(q.direction);
    for (const [scenarioName, weight] of Object.entries(q.weights)) {
      totals[scenarioName as BeliefScenarioName] += signedScore * weight;
    }
  }

  const clamped = Object.fromEntries(
    BELIEF_SCENARIO_NAMES.map((s) => [s, Math.max(0, totals[s])]),
  ) as Record<BeliefScenarioName, number>;
  const sum = BELIEF_SCENARIO_NAMES.reduce((s, name) => s + clamped[name], 0);

  if (sum <= 1e-9) {
    return { scenarioWeights: zeroedScenarios(), insufficientSignal: true };
  }

  return {
    scenarioWeights: Object.fromEntries(
      BELIEF_SCENARIO_NAMES.map((s) => [s, clamped[s] / sum]),
    ) as Record<BeliefScenarioName, number>,
    insufficientSignal: false,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run client/src/lib/beliefImpact/scoreOutlook.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/beliefImpact/scoreOutlook.ts client/src/lib/beliefImpact/scoreOutlook.test.ts
git commit -m "feat(belief-impact): add B1-B15 scenario-level-clamp belief scoring"
```

---

### Task 4: Store outlook state slice

**Files:**
- Modify: `client/src/state/onboardingV2Store.ts`

- [ ] **Step 1: Export the existing `normaliseAnswer` helper (currently private)**

Find (around line 518):

```typescript
// Compute normalised score from answer (1-5) -> (-1 to +1)
function normaliseAnswer(answer: 1 | 2 | 3 | 4 | 5): number {
```

Replace with:

```typescript
// Compute normalised score from answer (1-5) -> (-1 to +1)
export function normaliseAnswer(answer: 1 | 2 | 3 | 4 | 5): number {
```

(No behavior change — this only makes an existing pure function importable elsewhere, matching how `computeDirection` is already exported.)

- [ ] **Step 2: Add the `OutlookState` type and import, near `BeliefsState` (around line 256-266)**

Find:

```typescript
export interface BeliefsState {
  version: string;
  completed: boolean;
  completed_at: string | null;
  responses: Partial<Record<BeliefQuestionId, BeliefResponse>>;
  axis_scores: Partial<Record<AxisCode, number>>;
  axis_intensities: Partial<Record<AxisCode, AxisIntensity>>;
  tilt_profile: TiltProfileEntry[];
  tilts_allowed: boolean;
  tilts_gate_reason: TiltsGateReason;
}
```

Replace with:

```typescript
export interface BeliefsState {
  version: string;
  completed: boolean;
  completed_at: string | null;
  responses: Partial<Record<BeliefQuestionId, BeliefResponse>>;
  axis_scores: Partial<Record<AxisCode, number>>;
  axis_intensities: Partial<Record<AxisCode, AxisIntensity>>;
  tilt_profile: TiltProfileEntry[];
  tilts_allowed: boolean;
  tilts_gate_reason: TiltsGateReason;
}

// ============================================
// Outlook (belief→impact→alternatives, macro-outlook beliefs B1-B15)
// ============================================
export interface OutlookState {
  version: string;
  completed: boolean;
  completed_at: string | null;
  responses: Partial<Record<string, 1 | 2 | 3 | 4 | 5>>;
  scenario_weights: Partial<Record<import('../data/beliefImpactTaxonomy').BeliefScenarioName, number>>;
  insufficient_signal: boolean;
}
```

(Using an inline `import(...)` type reference here, rather than a top-level `import type` statement, is deliberate: `episodeLibrary.ts` already imports `AxisCode` from this same store file, so a top-level type-only import back from `beliefImpactTaxonomy.ts` would be a second edge of that same type-only cycle — safe in practice but avoidable. The inline form sidesteps adding a new cross-file type edge to this already-cyclic pair.)

- [ ] **Step 3: Add `outlook` to the state interface, next to `beliefs` (around line 356-362)**

Find:

```typescript
interface OnboardingV2State {
  intake: IntakeData;
  holdings: Holding[];
  summary: PortfolioSummary;
  analysis: AnalysisState;
  beliefs: BeliefsState;
  scenario: ScenarioState;
```

Replace with:

```typescript
interface OnboardingV2State {
  intake: IntakeData;
  holdings: Holding[];
  summary: PortfolioSummary;
  analysis: AnalysisState;
  beliefs: BeliefsState;
  outlook: OutlookState;
  scenario: ScenarioState;
```

- [ ] **Step 4: Add the outlook actions to the same interface, next to the Beliefs actions (around line 377-381)**

Find:

```typescript
  // Beliefs actions
  setBeliefResponse: (questionId: BeliefQuestionId, answer: 1 | 2 | 3 | 4 | 5) => void;
  computeBeliefsScores: () => void;
  completeBeliefsStep: () => void;
  resetBeliefs: () => void;
```

Replace with:

```typescript
  // Beliefs actions
  setBeliefResponse: (questionId: BeliefQuestionId, answer: 1 | 2 | 3 | 4 | 5) => void;
  computeBeliefsScores: () => void;
  completeBeliefsStep: () => void;
  resetBeliefs: () => void;

  // Outlook actions
  setOutlookResponse: (questionId: string, answer: 1 | 2 | 3 | 4 | 5) => void;
  computeOutlookScores: () => void;
  completeOutlookStep: () => void;
  resetOutlook: () => void;
```

- [ ] **Step 5: Add the `initialOutlook` constant, next to `initialBeliefs` (around line 462-472)**

Find:

```typescript
const initialBeliefs: BeliefsState = {
  version: '1.0',
  completed: false,
  completed_at: null,
  responses: {},
  axis_scores: {},
  axis_intensities: {},
  tilt_profile: [],
  tilts_allowed: true,
  tilts_gate_reason: 'NO_RED_FLAGS',
};
```

Replace with:

```typescript
const initialBeliefs: BeliefsState = {
  version: '1.0',
  completed: false,
  completed_at: null,
  responses: {},
  axis_scores: {},
  axis_intensities: {},
  tilt_profile: [],
  tilts_allowed: true,
  tilts_gate_reason: 'NO_RED_FLAGS',
};

const initialOutlook: OutlookState = {
  version: '1.0',
  completed: false,
  completed_at: null,
  responses: {},
  scenario_weights: {},
  insufficient_signal: false,
};
```

- [ ] **Step 6: Add `outlook: initialOutlook` to the store's initial state and wire the 4 actions, next to the Beliefs actions (around line 914-927, right after `setBeliefResponse`)**

Find:

```typescript
      // Beliefs actions
      setBeliefResponse: (questionId, answer) => {
        const normalised = normaliseAnswer(answer);
        const label = ANSWER_LABELS[answer];
        set((state) => ({
          beliefs: {
            ...state.beliefs,
            responses: {
              ...state.beliefs.responses,
              [questionId]: { answer, normalised, label },
            },
          },
        }));
      },
```

Replace with:

```typescript
      // Beliefs actions
      setBeliefResponse: (questionId, answer) => {
        const normalised = normaliseAnswer(answer);
        const label = ANSWER_LABELS[answer];
        set((state) => ({
          beliefs: {
            ...state.beliefs,
            responses: {
              ...state.beliefs.responses,
              [questionId]: { answer, normalised, label },
            },
          },
        }));
      },

      // Outlook actions
      setOutlookResponse: (questionId, answer) => {
        set((state) => ({
          outlook: {
            ...state.outlook,
            responses: { ...state.outlook.responses, [questionId]: answer },
          },
        }));
      },

      computeOutlookScores: () => {
        const { scoreOutlookBeliefs } = require('../lib/beliefImpact/scoreOutlook') as typeof import('../lib/beliefImpact/scoreOutlook');
        const state = get();
        const { scenarioWeights, insufficientSignal } = scoreOutlookBeliefs(state.outlook.responses);
        set((s) => ({
          outlook: { ...s.outlook, scenario_weights: scenarioWeights, insufficient_signal: insufficientSignal },
        }));
      },

      completeOutlookStep: () => {
        set((state) => ({
          outlook: { ...state.outlook, completed: true, completed_at: new Date().toISOString() },
        }));
      },

      resetOutlook: () => {
        set({ outlook: initialOutlook });
      },
```

**Note on `require(...)` in Step 6:** this file is a Vite/ESM module, so `require` is not actually available at runtime. Use a top-level `import { scoreOutlookBeliefs } from '../lib/beliefImpact/scoreOutlook';` instead, added alongside this file's other top-of-file imports (next to the `zustand`/`zustand/middleware` imports at the top). Do this in Step 7 below, and remove the `require(...)` line from `computeOutlookScores` — replace its first line with just using the top-level-imported `scoreOutlookBeliefs` directly.

- [ ] **Step 7: Fix the import — add to the top of the file, replace the inline require**

Find (the top of the file):

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
```

Replace with:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { scoreOutlookBeliefs } from '../lib/beliefImpact/scoreOutlook';
```

Then find (the `computeOutlookScores` body just written in Step 6):

```typescript
      computeOutlookScores: () => {
        const { scoreOutlookBeliefs } = require('../lib/beliefImpact/scoreOutlook') as typeof import('../lib/beliefImpact/scoreOutlook');
        const state = get();
```

Replace with:

```typescript
      computeOutlookScores: () => {
        const state = get();
```

- [ ] **Step 8: Add `outlook: initialOutlook,` to the store's initial-state object**

Find the store creation site where `beliefs: initialBeliefs,` appears as an initial-state field (in the object passed to `create(persist((set, get) => ({ ... })))` — search for it):

Run: `grep -n "beliefs: initialBeliefs," client/src/state/onboardingV2Store.ts`

At that exact line, add `outlook: initialOutlook,` immediately after it via Edit (old_string: `beliefs: initialBeliefs,`, new_string: `beliefs: initialBeliefs,\n      outlook: initialOutlook,`), matching the indentation shown by the grep.

- [ ] **Step 9: Verify the project still typechecks**

Run: `npx tsc --noEmit -p .`
Expected: no new errors introduced by this change (pre-existing errors, if any, are unrelated and out of scope)

- [ ] **Step 10: Verify existing store tests still pass**

Run: `npx vitest run tests/onboardingV2.test.ts`
Expected: PASS (unchanged — this task only adds new fields/actions, no existing behavior changed)

- [ ] **Step 11: Commit**

```bash
git add client/src/state/onboardingV2Store.ts
git commit -m "feat(belief-impact): add outlook state slice to onboardingV2Store"
```

---

### Task 5: Alignment score, concentration flag, self-ID mismatch flag

**Files:**
- Create: `client/src/lib/beliefImpact/computeAlignment.ts`
- Test: `client/src/lib/beliefImpact/computeAlignment.test.ts`

**Implementation-plan decision:** `blendBeliefAllocation` (this file) doubles as the target-mix input for the alternatives engine in Task 9 — spec §7's "new target-mix-construction logic driven by belief-weighted tier-1/2 exposure" IS this function's output. No separate target-mix file is created (would duplicate the same normalise-and-blend logic for no reason).

**Implementation-plan decision:** the self-ID mismatch flag fires on exactly `isCautious(riskComfort) && concentrationFlag !== null` — matching spec §5's literal description ("isCautious() + the concentration flag + hhiNow, already present, applied to the real current mix"). No additional HHI threshold is invented beyond the existing >35% single-bucket concentration check.

**Correction found during code review (fixed in this task, not deferred):** this task's original draft assumed `mixFromHoldings` (portfolioMix.ts) already excludes tier-3 (`europe-equity`/`emerging-equity`) mass — it does not. `mixFromHoldings` only excludes holdings where `bucketFor()` returns `null` (PE/structured/FX/alternatives); it has no notion of this feature's `BUCKET_TIER` concept, and includes `europe-equity`/`emerging-equity` as fully-weighted buckets. `computeAlignment` therefore renormalises `mix` over `MODELLED_BUCKETS` internally via an exported `renormaliseOverModelledBuckets(mix)` helper, called as the first line of the function, before any L1-distance/HHI/concentration math. **Task 6 and Task 12 below have been updated to reuse this same helper** for the same reason (both would otherwise silently misstate a per-bucket "% of modelled portfolio" or misalign a target-mix comparison for any user holding europe/emerging equity).

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { BUCKETS, type Bucket } from '../../data/episodeLibrary';
import type { Mix } from '../portfolioMix';
import { computeAlignment, blendBeliefAllocation } from './computeAlignment';
import { BELIEF_SCENARIO_ALLOCATION_PRIORS } from '../../data/beliefImpactTaxonomy';

function emptyMix(): Mix {
  return Object.fromEntries(BUCKETS.map((b) => [b, 0])) as Mix;
}

describe('blendBeliefAllocation', () => {
  it('returns the scenario prior unchanged when one scenario has full weight', () => {
    const blend = blendBeliefAllocation({ Stagflation: 1 });
    for (const [bucket, weight] of Object.entries(BELIEF_SCENARIO_ALLOCATION_PRIORS['Stagflation'])) {
      expect(blend[bucket as Bucket]).toBeCloseTo(weight as number, 6);
    }
  });

  it('returns an all-zero vector for empty weights', () => {
    const blend = blendBeliefAllocation({});
    expect(BUCKETS.every((b) => blend[b] === 0)).toBe(true);
  });
});

describe('computeAlignment', () => {
  it('scores 100 (BROADLY_ALIGNED) when the mix exactly matches the belief-weighted ideal', () => {
    const mix = blendBeliefAllocation({ Stagflation: 1 });
    const result = computeAlignment(mix, { Stagflation: 1 }, 'Balanced');
    expect(result.score).toBe(100);
    expect(result.band).toBe('BROADLY_ALIGNED');
  });

  it('flags concentration when one bucket exceeds 35%', () => {
    const mix = { ...emptyMix(), 'us-equity': 0.40, 'cash': 0.60 };
    const result = computeAlignment(mix, { Stagflation: 1 }, 'Balanced');
    expect(result.concentrationFlag).toContain('us-equity');
  });

  it('raises the mismatch flag only when both cautious self-report AND concentration are present', () => {
    const concentrated = { ...emptyMix(), 'us-equity': 0.40, 'cash': 0.60 };
    const diversified = { ...emptyMix(), 'us-equity': 0.20, 'cash': 0.20, 'uk-equity': 0.20, 'govt-bonds': 0.20, 'global-equity': 0.20 };

    expect(computeAlignment(concentrated, { Stagflation: 1 }, 'Conservative').mismatchFlag).not.toBeNull();
    expect(computeAlignment(concentrated, { Stagflation: 1 }, 'Adventurous').mismatchFlag).toBeNull();
    expect(computeAlignment(diversified, { Stagflation: 1 }, 'Conservative').mismatchFlag).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run client/src/lib/beliefImpact/computeAlignment.test.ts`
Expected: FAIL with "Cannot find module './computeAlignment'"

- [ ] **Step 3: Write the implementation**

```typescript
import type { Mix } from '../portfolioMix';
import { BUCKETS, type Bucket } from '../../data/episodeLibrary';
import {
  BUCKET_TIER, BELIEF_SCENARIO_ALLOCATION_PRIORS, BELIEF_SCENARIO_NAMES, type BeliefScenarioName,
} from '../../data/beliefImpactTaxonomy';

export type AlignmentBand = 'BROADLY_ALIGNED' | 'PARTIALLY_ALIGNED' | 'MISALIGNED';

export interface AlignmentResult {
  score: number; // 0..100
  band: AlignmentBand;
  concentrationFlag: string | null;
  hhi: number;
  nEff: number;
  mismatchFlag: string | null;
}

const MODELLED_BUCKETS: Bucket[] = BUCKETS.filter((b) => BUCKET_TIER[b] !== 'UNMODELLED');

/** Blend belief scenario weights into an 8-bucket "ideal allocation" vector (spec §5 substrate) —
 *  same pattern as computeGap.ts's blendScenarioTemplates, applied to the real-data taxonomy.
 *  Also serves as the alternatives target mix (spec §7) — see Task 9. */
export function blendBeliefAllocation(weights: Partial<Record<BeliefScenarioName, number>>): Mix {
  const total = BELIEF_SCENARIO_NAMES.reduce((s, name) => s + (weights[name] ?? 0), 0);
  const out = Object.fromEntries(BUCKETS.map((b) => [b, 0])) as Mix;
  if (total <= 0) return out;
  for (const name of BELIEF_SCENARIO_NAMES) {
    const w = (weights[name] ?? 0) / total;
    if (w <= 0) continue;
    const prior = BELIEF_SCENARIO_ALLOCATION_PRIORS[name];
    for (const [bucket, p] of Object.entries(prior)) {
      out[bucket as Bucket] += (p as number) * w;
    }
  }
  return out;
}

function l1Modelled(a: Mix, b: Mix): number {
  return MODELLED_BUCKETS.reduce((sum, k) => sum + Math.abs(a[k] - b[k]), 0);
}

function bandFor(score: number): AlignmentBand {
  if (score >= 70) return 'BROADLY_ALIGNED';
  if (score >= 40) return 'PARTIALLY_ALIGNED';
  return 'MISALIGNED';
}

/** Same predicate as computeGap.ts's isCautious(), ported (that file is keyed to the old
 *  16-bucket taxonomy's request shape and not reused directly here). */
function isCautious(riskComfort: string, drawdownCap?: number): boolean {
  const s = (riskComfort || '').toLowerCase();
  return s.includes('conservative') || s.includes('income') || s.includes('defensive')
    || (typeof drawdownCap === 'number' && drawdownCap <= 0.20);
}

/** Spec §5: reuses computeGap.ts's alignment/HHI/concentration/isCautious formulas, recomputed
 *  over the real 8-bucket episodeLibrary taxonomy. `mix` is expected to already come normalised-
 *  over-modelled-buckets-only from `mixFromHoldings` (portfolioMix.ts), so tier-3 buckets are
 *  already excluded before this function runs. */
export function computeAlignment(
  mix: Mix,
  scenarioWeights: Partial<Record<BeliefScenarioName, number>>,
  riskComfort: string,
  drawdownCap?: number,
): AlignmentResult {
  const idealAllocation = blendBeliefAllocation(scenarioWeights);
  const distance = l1Modelled(mix, idealAllocation);
  const score = Math.round(100 * (1 - distance / 2));

  const hhi = MODELLED_BUCKETS.reduce((s, b) => s + mix[b] * mix[b], 0);
  const nEff = hhi > 0 ? 1 / hhi : 0;

  let concentrationFlag: string | null = null;
  for (const b of MODELLED_BUCKETS) {
    if (mix[b] > 0.35) { concentrationFlag = `Concentration: ${b} is over 35% of your modelled portfolio.`; break; }
  }

  const cautious = isCautious(riskComfort, drawdownCap);
  const mismatchFlag = (cautious && concentrationFlag !== null)
    ? 'You described yourself as cautious, but your holdings are concentrated — a mismatch worth a closer look.'
    : null;

  return { score, band: bandFor(score), concentrationFlag, hhi, nEff, mismatchFlag };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run client/src/lib/beliefImpact/computeAlignment.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/beliefImpact/computeAlignment.ts client/src/lib/beliefImpact/computeAlignment.test.ts
git commit -m "feat(belief-impact): add alignment score, concentration flag, self-ID mismatch flag"
```

---

### Task 6: Tiered impact narrative

**Files:**
- Create: `client/src/lib/beliefImpact/computeTieredImpact.ts`
- Test: `client/src/lib/beliefImpact/computeTieredImpact.test.ts`

This wires belief scenarios to real per-bucket cited episode paths (tier 1) and `shockFor` (tier 2) — no new impact math, only the scenario→bucket wiring spec §4 calls "the new design surface."

**Correction found during Task 5's code review (applied here, not deferred):** two fixes vs. an earlier draft of this task:
1. **Per-bucket sourcing, not portfolio-level.** An earlier draft called `replayEpisode(mix, episode, portfolioValueGBP)` per bucket — but `replayEpisode` returns a single PORTFOLIO-level blended drawdown across the whole mix, so every bucket's row would have shown the *same* number instead of a bucket-specific one. This task instead reads `episode.paths[bucket]` directly (already has `troughIndex`/`recoveryIndex` precomputed by `episodeLibrary.ts`'s `withIndices()`), giving a genuinely per-bucket cited trough/recovery.
2. **Upside scenarios must be filtered out BEFORE ranking top-3, not just skipped inside the loop.** A further fix, found in this task's own code review: `topScenarios` must filter `!BELIEF_SCENARIO_MAPPING[name].isUpside` alongside the weight threshold, before `.slice(0, 3)` — not just `continue` on `isUpside` inside the per-bucket loop, which would let `'Rate-Cut Reflation'` silently consume one of only 3 citation slots with zero citations if it ranked highly by weight.
3. **Skip citing an episode where the bucket's trough is ~0 (held steady).** Several episodes' cash/govt-bonds paths only ever rise (e.g. `DOTCOM_2000`, `GFC_2008`, `COVID_2020` — several mapped from `'Property Crash'`), producing `troughIndex=recoveryIndex=0` and a nonsensical "0% trough, recovered in 0 months" citation. Guard: `if (Math.abs(troughPct) < 0.01) continue;` before building the citation.
4. **Rows never include UNMODELLED-tier buckets; `weightPct` is renormalised.** `mixFromHoldings` (the existing, reused function) does NOT exclude `europe-equity`/`emerging-equity` from its mix (it only excludes true `bucketFor()`-null holdings) — see the correction note in Task 5. So `mix` can carry real weight in those two UNMODELLED-tier buckets. This task calls `renormaliseOverModelledBuckets` (exported from Task 5's `computeAlignment.ts`) so `rows` only cover the 6 modelled buckets and `weightPct` sums to 100% across them, and folds any `europe-equity`/`emerging-equity` holding value into `unmodelledBreakdown` alongside the true `bucketFor()`-null holdings — matching spec §1's own framing that europe/emerging-equity "ship as tier 3" exactly like the unmapped asset classes, not as a third, undisplayed category. `UnmodelledEntry`'s field is named `name` (not `assetClass`) since it now covers both asset-class names and bucket names.

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { BUCKETS, type Bucket } from '../../data/episodeLibrary';
import type { Mix } from '../portfolioMix';
import { computeTieredImpact } from './computeTieredImpact';

function emptyMix(): Mix {
  return Object.fromEntries(BUCKETS.map((b) => [b, 0])) as Mix;
}

describe('computeTieredImpact', () => {
  it('includes a cited episode source for a tier-1 bucket under a mapped scenario', () => {
    const mix = { ...emptyMix(), 'uk-equity': 1 };
    const result = computeTieredImpact(mix, [], { Stagflation: 1 }, 500_000);
    const row = result.rows.find((r) => r.bucket === 'uk-equity')!;
    expect(row.tier).toBe('EPISODE_REPLAY');
    expect(row.citedSources.some((s) => s.id === 'STAGFLATION_1973')).toBe(true);
  });

  it('includes an illustrative stress-scenario source for a tier-2 bucket', () => {
    const mix = { ...emptyMix(), 'property': 1 };
    const result = computeTieredImpact(mix, [], { 'Property Crash': 1 }, 500_000);
    const row = result.rows.find((r) => r.bucket === 'property')!;
    expect(row.tier).toBe('MODERN_ANCHOR');
    expect(row.citedSources.some((s) => s.id === 'PROPERTY_DOWNTURN')).toBe(true);
  });

  it('skips episode/stress sourcing entirely for the upside scenario', () => {
    const mix = { ...emptyMix(), 'uk-equity': 1 };
    const result = computeTieredImpact(mix, [], { 'Rate-Cut Reflation': 1 }, 500_000);
    const row = result.rows.find((r) => r.bucket === 'uk-equity')!;
    expect(row.citedSources).toHaveLength(0);
  });

  it('never produces a row for an UNMODELLED-tier bucket, and renormalises weightPct over modelled buckets only', () => {
    const mix = { ...emptyMix(), 'emerging-equity': 0.5, 'uk-equity': 0.5 };
    const result = computeTieredImpact(mix, [], { Stagflation: 1 }, 500_000);
    expect(result.rows.find((r) => r.bucket === 'emerging-equity')).toBeUndefined();
    const ukRow = result.rows.find((r) => r.bucket === 'uk-equity')!;
    expect(ukRow.weightPct).toBe(100); // renormalised: 0.5 / (0.5 modelled total) = 1.0 = 100%
  });

  it('reports true-unmodelled holdings (bucketFor -> null) grouped by asset class', () => {
    const holdings = [
      { asset_class: 'alternatives', region: 'global', value_gbp: 20_000 },
      { asset_class: 'alternatives', region: 'uk', value_gbp: 10_000 },
      { asset_class: 'equity', region: 'uk', value_gbp: 70_000 },
    ];
    const mix = { ...emptyMix(), 'uk-equity': 1 };
    const result = computeTieredImpact(mix, holdings, { Stagflation: 1 }, 100_000);
    expect(result.unmodelledSharePct).toBeCloseTo(30, 1);
    expect(result.unmodelledBreakdown).toEqual([{ name: 'alternatives', valueGbp: 30_000 }]);
  });

  it('also routes UNMODELLED-tier bucket holdings (europe/emerging equity) into the same unmodelled breakdown', () => {
    const holdings = [
      { asset_class: 'equity', region: 'emerging', value_gbp: 25_000 },
      { asset_class: 'equity', region: 'uk', value_gbp: 75_000 },
    ];
    const mix = { ...emptyMix(), 'emerging-equity': 0.25, 'uk-equity': 0.75 };
    const result = computeTieredImpact(mix, holdings, { Stagflation: 1 }, 100_000);
    expect(result.unmodelledSharePct).toBeCloseTo(25, 1);
    expect(result.unmodelledBreakdown).toEqual([{ name: 'emerging-equity', valueGbp: 25_000 }]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- client/src/lib/beliefImpact/computeTieredImpact.test.ts`
Expected: FAIL with "Cannot find module './computeTieredImpact'"

- [ ] **Step 3: Write the implementation**

```typescript
import { EPISODES, BUCKETS, bucketFor, type Bucket } from '../../data/episodeLibrary';
import { STRESS_SCENARIOS } from '../../data/stressScenarios';
import { shockFor } from '../scenarioStress';
import type { Mix } from '../portfolioMix';
import {
  BUCKET_TIER, BELIEF_SCENARIO_MAPPING, type BeliefScenarioName, type ImpactTier,
} from '../../data/beliefImpactTaxonomy';
import { renormaliseOverModelledBuckets } from './computeAlignment';

export interface CitedSource {
  id: string;
  name: string;
  troughPct: number;
  recoveryLabel: string;
}

export interface BucketImpactRow {
  bucket: Bucket;
  tier: ImpactTier;
  weightPct: number;
  citedSources: CitedSource[];
}

export interface UnmodelledEntry {
  name: string;
  valueGbp: number;
}

export interface TieredImpactResult {
  rows: BucketImpactRow[];
  unmodelledSharePct: number;
  unmodelledBreakdown: UnmodelledEntry[];
}

interface HoldingForBreakdown { asset_class: string; region: string; value_gbp: number; }

const MODELLED_BUCKETS: Bucket[] = BUCKETS.filter((b) => BUCKET_TIER[b] !== 'UNMODELLED');

const BUCKET_TO_ASSET_REGION: Record<Bucket, [string, string]> = {
  'uk-equity': ['equity', 'uk'], 'us-equity': ['equity', 'us'],
  'europe-equity': ['equity', 'europe'], 'emerging-equity': ['equity', 'emerging'],
  'global-equity': ['equity', 'global'], 'govt-bonds': ['bond', 'global'],
  'property': ['property', 'uk'], 'cash': ['cash', 'uk'],
};

/** Spec §1/§4/§8: per-bucket tiered impact narrative. Reads cited episode paths directly (tier 1)
 *  and `shockFor` (tier 2) — this function only wires belief scenarios to the buckets the user
 *  holds, which is the genuinely new part per spec §4. `mix` is renormalised over modelled buckets
 *  before use (see Task 5's correction note) so rows and weightPct never include UNMODELLED-tier
 *  (europe/emerging-equity) mass; that mass is folded into `unmodelledBreakdown` instead. */
export function computeTieredImpact(
  mix: Mix,
  holdings: HoldingForBreakdown[],
  scenarioWeights: Partial<Record<BeliefScenarioName, number>>,
  portfolioValueGBP: number,
): TieredImpactResult {
  const topScenarios = (Object.entries(scenarioWeights) as [BeliefScenarioName, number][])
    .filter(([, w]) => w > 0.05)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const normalisedMix = renormaliseOverModelledBuckets(mix);

  const rows: BucketImpactRow[] = [];
  for (const bucket of MODELLED_BUCKETS) {
    const weightPct = normalisedMix[bucket] * 100;
    if (weightPct <= 0) continue;
    const tier = BUCKET_TIER[bucket];
    const citedSources: CitedSource[] = [];

    for (const [scenarioName] of topScenarios) {
      const mapping = BELIEF_SCENARIO_MAPPING[scenarioName];
      if (mapping.isUpside) continue;

      if (tier === 'EPISODE_REPLAY') {
        for (const epId of mapping.episodeIds) {
          const episode = EPISODES.find((e) => e.id === epId);
          if (!episode) continue;
          const path = episode.paths[bucket];
          if (path === null) continue;
          const troughPct = path.points[path.troughIndex];
          const stepsFromTrough = path.recoveryIndex === -1 ? null : path.recoveryIndex - path.troughIndex;
          citedSources.push({
            id: episode.id,
            name: episode.name,
            troughPct,
            recoveryLabel: stepsFromTrough === null
              ? 'not recovered within the recorded window'
              : `${stepsFromTrough} ${episode.granularity === 'annual' ? 'year' : 'month'}${stepsFromTrough === 1 ? '' : 's'}`,
          });
        }
      } else if (tier === 'MODERN_ANCHOR') {
        for (const ssId of mapping.stressScenarioIds) {
          const stressScenario = STRESS_SCENARIOS.find((s) => s.id === ssId);
          if (!stressScenario) continue;
          const [assetClass, region] = BUCKET_TO_ASSET_REGION[bucket];
          citedSources.push({
            id: stressScenario.id,
            name: stressScenario.name,
            troughPct: shockFor(stressScenario, assetClass, region),
            recoveryLabel: 'illustrative, not a cited recovery period',
          });
        }
      }
    }
    rows.push({ bucket, tier, weightPct: Math.round(weightPct * 10) / 10, citedSources });
  }

  const validHoldings = holdings.filter((h) => h.value_gbp > 0);
  const totalValue = validHoldings.reduce((s, h) => s + h.value_gbp, 0);

  const byKey = new Map<string, number>();
  for (const h of validHoldings) {
    const bucket = bucketFor(h.asset_class, h.region);
    if (bucket === null) {
      byKey.set(h.asset_class, (byKey.get(h.asset_class) ?? 0) + h.value_gbp);
    } else if (BUCKET_TIER[bucket] === 'UNMODELLED') {
      byKey.set(bucket, (byKey.get(bucket) ?? 0) + h.value_gbp);
    }
  }
  const unmodelledValue = Array.from(byKey.values()).reduce((s, v) => s + v, 0);
  const unmodelledSharePct = totalValue > 0 ? Math.round((unmodelledValue / totalValue) * 1000) / 10 : 0;
  const unmodelledBreakdown: UnmodelledEntry[] = Array.from(byKey.entries())
    .map(([name, valueGbp]) => ({ name, valueGbp }))
    .sort((a, b) => b.valueGbp - a.valueGbp);

  return { rows, unmodelledSharePct, unmodelledBreakdown };
}
```

`portfolioValueGBP` is currently unused in this function body (it's part of the signature for forward compatibility with a possible future £-value display, per the original design) — if the implementer's linter flags an unused-parameter warning, prefix it `_portfolioValueGBP` or add a one-line comment; do not remove it from the signature, since callers (Task 11) already pass it and the plan may extend this later.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- client/src/lib/beliefImpact/computeTieredImpact.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/beliefImpact/computeTieredImpact.ts client/src/lib/beliefImpact/computeTieredImpact.test.ts
git commit -m "feat(belief-impact): add tiered per-bucket impact narrative wiring"
```

---

### Task 7: Income/withdrawal-runway computation

**Files:**
- Create: `client/src/lib/beliefImpact/computeIncomeRunway.ts`
- Test: `client/src/lib/beliefImpact/computeIncomeRunway.test.ts`

**Implementation-plan decision (spec §6 open dependency — withdrawal pro-ration against uneven granularity):** pro-rate `annual_essential_spend_gbp` as-is per annual step, or divided by 12 per monthly step. This function takes an already-computed `EpisodeReplay` (from Task 6 / the existing `replayEpisode`) rather than re-deriving a portfolio path — it only adds the buffer-depletion walk.

**Implementation-plan decision (survival predicate):** the buffer "survives" only if it never runs dry within the recorded window, OR it runs dry at/after the episode's recorded recovery point. If the episode never recovered within its recorded window (`recoverySteps === null`) AND the buffer does run dry at some point, that counts as NOT surviving — an unresolved episode with a dry buffer is not a pass.

**Correction found during this task's code review (fixed in this task, not deferred):** two fixes:
1. The `narrative` string must NOT use the same "before the {episode} recovery" phrasing for both the known-recovery-exhaustion case and the never-recovered-in-window-exhaustion case — the latter must say something like "never recovered within its recorded window," mirroring `computeTieredImpact.ts`'s existing `recoveryLabel` pattern. Conflating the two understates severity exactly where this feature needs to be honest.
2. The function signature drops the separate `granularity: Granularity` parameter (redundant with, and unenforced against, `replay.granularity`) — derive `spendPerStep`/`unit` from `replay.granularity` directly. **Task 11 below has been updated** to call `computeIncomeRunway(replay, intake.annual_essential_spend_gbp, intake.liquid_cash_gbp, episode.name)` — 4 arguments, not 5.

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest';
import type { EpisodeReplay } from '../empiricalEngine';
import { computeIncomeRunway } from './computeIncomeRunway';

function replay(overrides: Partial<EpisodeReplay>): EpisodeReplay {
  return {
    episodeId: 'TEST', granularity: 'annual', points: [0, -0.1, -0.2, -0.1, 0],
    drawdown: -0.2, troughIndex: 2, recoverySteps: 2, contributors: [], noDataShare: 0,
    ...overrides,
  };
}

describe('computeIncomeRunway', () => {
  it('survives when the buffer never runs dry within the window', () => {
    const result = computeIncomeRunway(replay({}), 'annual', 10_000, 1_000_000, 'Test Episode');
    expect(result.survivesWithoutSellingAtTrough).toBe(true);
    expect(result.bufferExhaustedAtStep).toBeNull();
  });

  it('does not survive when the buffer runs dry before the recorded recovery', () => {
    // troughIndex=2, recoverySteps=2 -> recoveryStepFromStart=4. Buffer of 15,000 at 10,000/yr
    // exhausts at step 1 (15,000 - 10,000*1 = 5,000 >=0; at t=2: 15,000-20,000<0) -> step 2.
    const result = computeIncomeRunway(replay({}), 'annual', 10_000, 15_000, 'Test Episode');
    expect(result.survivesWithoutSellingAtTrough).toBe(false);
    expect(result.bufferExhaustedAtStep).toBe(2);
    expect(result.recoveryStepFromStart).toBe(4);
  });

  it('does not survive when the episode never recovered in its window AND the buffer runs dry', () => {
    const result = computeIncomeRunway(replay({ recoverySteps: null }), 'annual', 10_000, 15_000, 'Test Episode');
    expect(result.survivesWithoutSellingAtTrough).toBe(false);
    expect(result.recoveryStepFromStart).toBeNull();
  });

  it('pro-rates monthly episodes by dividing annual spend by 12', () => {
    // monthly granularity, spend/step = 10,000/12 ≈ 833.33; buffer 2,000 exhausts at step 3
    // (2000 - 833.33*2 = 333.34 >=0; at t=3: 2000-2500<0)
    const monthlyReplay = replay({ granularity: 'monthly', points: [0, -0.1, -0.2, -0.15, -0.05, 0], recoverySteps: 3, troughIndex: 2 });
    const result = computeIncomeRunway(monthlyReplay, 'monthly', 10_000, 2_000, 'Test Episode');
    expect(result.bufferExhaustedAtStep).toBe(3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run client/src/lib/beliefImpact/computeIncomeRunway.test.ts`
Expected: FAIL with "Cannot find module './computeIncomeRunway'"

- [ ] **Step 3: Write the implementation**

```typescript
import type { EpisodeReplay } from '../empiricalEngine';
import type { Granularity } from '../../data/episodeLibrary';

export interface IncomeRunwayResult {
  survivesWithoutSellingAtTrough: boolean;
  bufferExhaustedAtStep: number | null;
  recoveryStepFromStart: number | null;
  narrative: string;
}

/** Spec §6: withdrawal-runway-vs-episode-path. Reuses the EpisodeReplay already computed for the
 *  tiered impact narrative (Task 6) — only adds the buffer-depletion walk, not a new portfolio-path
 *  simulation. Pro-ration decided here: annual_essential_spend_gbp as-is per annual step, /12 per
 *  monthly step (spec §6 open dependency). */
export function computeIncomeRunway(
  replay: EpisodeReplay,
  granularity: Granularity,
  annualEssentialSpendGbp: number,
  liquidCashGbp: number,
  episodeName: string,
): IncomeRunwayResult {
  const spendPerStep = granularity === 'annual' ? annualEssentialSpendGbp : annualEssentialSpendGbp / 12;

  let bufferExhaustedAtStep: number | null = null;
  for (let t = 0; t < replay.points.length; t++) {
    if (liquidCashGbp - spendPerStep * t < 0) { bufferExhaustedAtStep = t; break; }
  }

  const recoveryStepFromStart = replay.recoverySteps === null ? null : replay.troughIndex + replay.recoverySteps;

  const survivesWithoutSellingAtTrough =
    bufferExhaustedAtStep === null
    || (recoveryStepFromStart !== null && bufferExhaustedAtStep >= recoveryStepFromStart);

  const unit = granularity === 'annual' ? 'year' : 'month';
  const narrative = survivesWithoutSellingAtTrough
    ? `At your current spend, your cash buffer would have covered essential spending through the ${episodeName} episode without needing to sell into the trough.`
    : `At your current spend, this episode's path would have used your full cash buffer ${bufferExhaustedAtStep} ${unit}${bufferExhaustedAtStep === 1 ? '' : 's'} in — before the ${episodeName} recovery — meaning you'd have needed to sell into the trough.`;

  return { survivesWithoutSellingAtTrough, bufferExhaustedAtStep, recoveryStepFromStart, narrative };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run client/src/lib/beliefImpact/computeIncomeRunway.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/beliefImpact/computeIncomeRunway.ts client/src/lib/beliefImpact/computeIncomeRunway.test.ts
git commit -m "feat(belief-impact): add withdrawal-runway-vs-episode-path computation"
```

---

### Task 8: Extract generic staged-rebalance core; refactor `buildActions` (behavior-preserving)

**Files:**
- Create: `server/lib/actions/stagedRebalance.ts`
- Modify: `server/lib/actions/engine.ts`
- Test: `tests/stagedRebalance.test.ts`

Spec §7 says `buildActions` is "algorithm-generic, just needs a bucket list" — but its liquidity-floor logic is hardcoded to the two literal bucket names `CASH`/`BILLS_SHORT_GILTS`, which don't exist in the 8-bucket episode taxonomy (which has one `cash` bucket, no bills-equivalent). This task extracts the real generic core (parametrized by bucket list AND liquidity-bucket list) and makes the existing `buildActions` a thin, behavior-preserving wrapper around it — required before Task 9 can add a second wrapper for the new taxonomy without duplicating ~200 lines of rebalancing logic.

- [ ] **Step 1: Write a fixture-based regression test against the CURRENT `buildActions` (before refactor)**

This test locks in current behavior so the refactor can be verified safe. Run it against the pre-refactor code first.

```typescript
import { describe, it, expect } from 'vitest';
import { buildActions } from '../server/lib/actions/engine';
import { CANONICAL_BUCKETS } from '../server/config/buckets';

describe('buildActions (regression fixture, pre- and post-refactor)', () => {
  it('produces a self-funded stage 1 that exactly lands on target when unconstrained', () => {
    const currentMix: Record<string, number> = Object.fromEntries(CANONICAL_BUCKETS.map((b) => [b, 0]));
    currentMix.CASH = 0.05;
    currentMix.GLOBAL_EQUITY = 0.95;
    const targetMix: Record<string, number> = Object.fromEntries(CANONICAL_BUCKETS.map((b) => [b, 0]));
    targetMix.CASH = 0.15;
    targetMix.GLOBAL_EQUITY = 0.65;
    targetMix.GILTS_LONG = 0.20;

    const result = buildActions({ currentMix, targetMix, portfolioValueGBP: 1_000_000 });

    const allActions = [...result.staged.stage1, ...result.staged.stage2];
    for (const bucket of ['CASH', 'GLOBAL_EQUITY', 'GILTS_LONG']) {
      const net = allActions.filter((a) => a.bucket === bucket).reduce((s, a) => s + a.deltaPct, 0);
      const need = (targetMix[bucket] ?? 0) - (currentMix[bucket] ?? 0);
      expect(net).toBeCloseTo(need, 3);
    }
    expect(result.summary.liquidityNowPct).toBe(5);
    expect(result.summary.liquidityFixPp).toBe(5);
  });
});
```

**Correction found when this task was first dispatched (fixture bug, not an `engine.ts` bug):** the fixture above originally asserted `liquidityFixPp` of `10`, but with `currentMix.CASH = 0.05` and no explicit `liquidityFloorPct` (defaults to `0.10`), the correct top-up is `0.10 - 0.05 = 0.05` → `liquidityFixPp = 5`, not `10`. An implementer correctly hand-traced this, found the fixture's expectation didn't match the live, unmodified `engine.ts`'s actual (correct) math, and reported BLOCKED per this task's own explicit instruction ("STOP if the regression test doesn't pass against current code") rather than proceeding on a broken safety net — exactly the right call. The expectation above is now fixed to `5`.

**Second thing found and worth a decision before Step 4:** the reference `stagedRebalance.ts` code in Step 3 below silently changes two `/api/actions`-facing copy strings versus the current `engine.ts`: `"Raise liquidity (short gilts)"` → `"Raise liquidity"`, and `"Defer illiquid changes (property/alternatives/collectibles) to **Stage 2**..."` → `"Defer illiquid changes to **Stage 2**..."`. No existing test asserts on this exact text so `npm test` won't catch it, but it IS a real (if cosmetic) change to live output. Decision: **keep the simplified generic copy** — the taxonomy-specific parenthetical ("short gilts", "property/alternatives/collectibles") is CANONICAL_BUCKETS-specific detail that doesn't belong in a function meant to serve two different taxonomies; the old Target step's UI doesn't appear to string-match on this exact playbook text (it's rendered as free-form markdown bullets), so this is a safe, intentional simplification, not an accidental regression. No code change needed for this — just flagging that it's a deliberate, reviewed decision, not an oversight, in case a future reviewer flags it again.

- [ ] **Step 2: Run the test against the current (pre-refactor) `engine.ts` to confirm it passes**

Run: `npx vitest run tests/stagedRebalance.test.ts`
Expected: PASS (this is the safety net for the refactor, not a red-first TDD step — the behavior already exists and works; this test proves it, then the refactor must keep it green)

- [ ] **Step 3: Create `stagedRebalance.ts` with the generic, parametrized core**

```typescript
export interface StagedRebalanceParams {
  buckets: string[];
  current: Record<string, number>;
  target: Record<string, number>;
  portfolioValueGBP: number;
  liquidityBuckets: string[];
  liquidityFloorPct: number;
  donorOrder: string[];
  minTradePct: number;
  maxMoves: number;
  illiquidBuckets: string[];
  frictionRate: Record<string, number>;
  stageIlliquids: boolean;
}

export interface RebalanceAction {
  type: "TRIM" | "ADD" | "TRANSFER";
  bucket: string;
  deltaPct: number;
  amountGBP: number;
  rationale: string;
  stage: 1 | 2;
  estCostPct?: number;
}

export interface StagedRebalanceResult {
  summary: {
    totalAbsChangePp: number;
    estTurnoverPp: number;
    estCostPct: number;
    liquidityNowPct: number;
    liquidityTargetPct: number;
    liquidityFixPp?: number;
  };
  staged: { stage1: RebalanceAction[]; stage2: RebalanceAction[] };
  playbook: string[];
}

const pct = (x: number) => +(x * 100).toFixed(1);

/** Generic staged-rebalance algorithm extracted from the original buildActions() (spec §7's
 *  "algorithm-generic, just needs a bucket list" — including the liquidity-bucket names, which
 *  were hardcoded to CASH/BILLS_SHORT_GILTS in the original and are now parametrized). */
export function computeStagedRebalance(p: StagedRebalanceParams): StagedRebalanceResult {
  const {
    buckets: BUCKETS, current, target, portfolioValueGBP: pv, liquidityBuckets,
    liquidityFloorPct: liqFloor, donorOrder: donors, minTradePct: minTrade, maxMoves,
    illiquidBuckets, frictionRate, stageIlliquids: stageIlliq,
  } = p;

  const need: Record<string, number> = {};
  let totalAbsNeed = 0;
  for (const b of BUCKETS) {
    need[b] = (target[b] ?? 0) - (current[b] ?? 0);
    totalAbsNeed += Math.abs(need[b]);
  }

  const stage1Draft: Array<{ bucket: string; deltaPct: number }> = [];
  const stage2Draft: Array<{ bucket: string; deltaPct: number }> = [];

  const liqNow = liquidityBuckets.reduce((s, b) => s + (current[b] ?? 0), 0);
  const needLiq = Math.max(0, liqFloor - liqNow);

  if (needLiq > 1e-6) {
    let remaining = needLiq;
    for (const d of donors) {
      if (remaining <= 1e-6) break;
      const canGive = Math.min(current[d] ?? 0, remaining);
      if (canGive <= 1e-6) continue;
      stage1Draft.push({ bucket: d, deltaPct: -canGive });
      remaining -= canGive;
    }
    // Receive into liquidity buckets in order, each filled to 1.0 before moving to the next
    // (generalises the original's "Bills first, then Cash" two-bucket rule to N buckets).
    let toDistribute = needLiq - Math.max(0, remaining);
    for (const b of liquidityBuckets) {
      if (toDistribute <= 1e-6) break;
      const room = Math.max(0, 1 - (current[b] ?? 0));
      const give = Math.min(toDistribute, room);
      if (give > 1e-6) { stage1Draft.push({ bucket: b, deltaPct: give }); toDistribute -= give; }
    }
  }

  const order = [...BUCKETS].sort((a, b) => Math.abs(need[b]) - Math.abs(need[a]));
  let moves = 0;
  for (const b of order) {
    const n = need[b];
    if (Math.abs(n) < minTrade) continue;
    const isIlliq = stageIlliq && illiquidBuckets.includes(b);
    if (!isIlliq && moves < maxMoves) { stage1Draft.push({ bucket: b, deltaPct: n }); moves++; }
    else if (isIlliq) { stage2Draft.push({ bucket: b, deltaPct: n }); }
  }

  const draft1: Record<string, number> = {};
  stage1Draft.forEach((a) => { draft1[a.bucket] = (draft1[a.bucket] ?? 0) + a.deltaPct; });
  const draft2: Record<string, number> = {};
  stage2Draft.forEach((a) => { draft2[a.bucket] = (draft2[a.bucket] ?? 0) + a.deltaPct; });

  const s1: Record<string, number> = {};
  for (const b of BUCKETS) {
    const n = need[b], d = draft1[b] ?? 0;
    s1[b] = n >= 0 ? Math.min(Math.max(0, d), n) : Math.max(Math.min(0, d), n);
  }
  for (const b of illiquidBuckets) s1[b] = 0;

  const adds = BUCKETS.reduce((s, b) => s + Math.max(0, s1[b]), 0);
  const trims = BUCKETS.reduce((s, b) => s - Math.min(0, s1[b]), 0);
  const EPS = 0.003;
  if (adds > trims + EPS) { const k = trims / adds; for (const b of BUCKETS) if (s1[b] > 0) s1[b] *= k; }
  if (trims > adds + EPS) { const k = adds / trims; for (const b of BUCKETS) if (s1[b] < 0) s1[b] *= k; }

  const s2: Record<string, number> = {};
  for (const b of BUCKETS) s2[b] = need[b] - s1[b];

  console.assert(
    BUCKETS.every((b) => Math.abs((s1[b] + s2[b]) - need[b]) <= 0.001),
    'stagedRebalance: net mismatch on at least one bucket',
  );
  console.assert(
    Math.abs(BUCKETS.reduce((s, b) => s + s1[b], 0)) <= 0.003,
    'stagedRebalance: Stage-1 not self-funded',
  );

  const stage1: RebalanceAction[] = [];
  const stage2: RebalanceAction[] = [];
  for (const b of BUCKETS) {
    const v1 = s1[b];
    if (Math.abs(v1) > 1e-6) {
      const isLiquidityBucket = liquidityBuckets.includes(b);
      stage1.push({
        type: v1 > 0 ? "ADD" : "TRIM", bucket: b, deltaPct: v1, amountGBP: Math.abs(v1) * pv,
        estCostPct: (frictionRate[b] ?? 0) * Math.abs(v1),
        rationale: isLiquidityBucket ? (v1 > 0 ? "Raise liquidity" : "Reduce liquidity")
          : (v1 > 0 ? "Increase allocation towards target" : "Reduce allocation towards target"),
        stage: 1,
      });
    }
    const v2 = s2[b];
    if (Math.abs(v2) > 1e-6) {
      stage2.push({
        type: v2 > 0 ? "ADD" : "TRIM", bucket: b, deltaPct: v2, amountGBP: Math.abs(v2) * pv,
        estCostPct: (frictionRate[b] ?? 0) * Math.abs(v2),
        rationale: v2 > 0 ? "Increase allocation towards target" : "Reduce allocation towards target",
        stage: 2,
      });
    }
  }

  const estTurnoverPp = +(0.5 * totalAbsNeed * 100).toFixed(1);
  let estCostPct = 0;
  for (const a of [...stage1, ...stage2]) estCostPct += a.estCostPct || 0;
  estCostPct = +estCostPct.toFixed(4);

  const bullets: string[] = [];
  const currentLiquidity = liqNow;
  const afterStage1 = currentLiquidity + liquidityBuckets.reduce((s, b) => s + (s1[b] ?? 0), 0);
  const topUpPp = Math.max(0, liqFloor - currentLiquidity);
  bullets.push(
    topUpPp > 1e-6
      ? `Top up liquidity by ~${pct(topUpPp)} pp (from ${pct(currentLiquidity)}% to ${pct(afterStage1)}%) before other moves.`
      : `Liquidity already meets the floor (${pct(currentLiquidity)}%).`,
  );
  const addActions = stage1.filter((a) => a.type === "ADD").slice(0, 3).map((a) => `add **${a.bucket.replace(/_/g, " ")}** ~${pct(a.deltaPct)} pp`);
  const trimActions = stage1.filter((a) => a.type === "TRIM").slice(0, 3).map((a) => `trim **${a.bucket.replace(/_/g, " ")}** ~${pct(Math.abs(a.deltaPct))} pp`);
  if (trimActions.length) bullets.push(`Largest reductions now: ${trimActions.join("; ")}.`);
  if (addActions.length) bullets.push(`Largest additions now: ${addActions.join("; ")}.`);
  if (stage2.some((a) => illiquidBuckets.includes(a.bucket))) bullets.push(`Defer illiquid changes to **Stage 2** or next review.`);
  bullets.push(`Keep individual trades above ${pct(minTrade)} pp to avoid noise.`);
  bullets.push(`Estimated turnover: ~${estTurnoverPp} pp; indicative cost: ~${(estCostPct * 100).toFixed(2)}% of portfolio.`);

  return {
    summary: {
      totalAbsChangePp: +(totalAbsNeed * 100).toFixed(1),
      estTurnoverPp, estCostPct,
      liquidityNowPct: +(currentLiquidity * 100).toFixed(1),
      liquidityTargetPct: +(liquidityBuckets.reduce((s, b) => s + (target[b] ?? 0), 0) * 100).toFixed(1),
      liquidityFixPp: topUpPp > 1e-6 ? +(topUpPp * 100).toFixed(1) : undefined,
    },
    staged: { stage1, stage2 },
    playbook: bullets,
  };
}
```

- [ ] **Step 4: Refactor `engine.ts`'s `buildActions` into a thin wrapper**

Find the entire body of `server/lib/actions/engine.ts` from `export function buildActions(req: ActionsRequest): ActionsResponse {` to its closing `}` (the whole function — everything after the `harmonise`/`pct` helper declarations), and replace it with:

```typescript
export function buildActions(req: ActionsRequest): ActionsResponse {
  const current = harmonise(req.currentMix);
  const target = harmonise(req.targetMix);
  const donorsDefault: Bucket[] = [
    "GROWTH_TECH", "GLOBAL_EQUITY", "ALTERNATIVES", "PROPERTY_UK_RESI",
    "COMMODITIES", "GOLD", "UK_EQUITY_VALUE", "IG_CREDIT", "GILTS_LONG",
    "CRYPTO_BTC", "CRYPTO_ETH", "COLLECTIBLES_ART", "COLLECTIBLES_WINE",
  ];
  return computeStagedRebalance({
    buckets: CANONICAL_BUCKETS,
    current,
    target,
    portfolioValueGBP: Math.max(0, req.portfolioValueGBP || 0),
    liquidityBuckets: ["CASH", "BILLS_SHORT_GILTS"],
    liquidityFloorPct: req.liquidityFloorPct ?? 0.10,
    donorOrder: (req.donorOrder as Bucket[] | undefined) ?? donorsDefault,
    minTradePct: req.minTradePct ?? 0.005,
    maxMoves: req.maxMoves ?? 8,
    illiquidBuckets: ILLIQUID_BUCKETS,
    frictionRate: FRICTION_RATE,
    stageIlliquids: req.stageIlliquids ?? true,
  });
}
```

And add the import at the top of `engine.ts`:

```typescript
import { computeStagedRebalance } from "./stagedRebalance";
```

Leave the `harmonise` and `pct` helper functions and the `ActionsRequest`/`Action`/`ActionsResponse` type exports in `engine.ts` exactly as they are — only the function body of `buildActions` is replaced, and `harmonise`/`pct` are still used by the wrapper (`harmonise` is; `pct` may now be unused in `engine.ts` — if `tsc`/lint flags it as unused after this edit, delete it from `engine.ts` in this same step).

- [ ] **Step 5: Run the regression test again (post-refactor) to confirm identical behavior**

Run: `npx vitest run tests/stagedRebalance.test.ts`
Expected: PASS — same assertions, same numbers, now going through `computeStagedRebalance`

- [ ] **Step 6: Run the full test suite to catch any other regression**

Run: `npx vitest run`
Expected: PASS (all existing tests, including `tests/onboardingV2.test.ts` and any other consumer of `engine.ts`, unaffected)

- [ ] **Step 7: Commit**

```bash
git add server/lib/actions/stagedRebalance.ts server/lib/actions/engine.ts tests/stagedRebalance.test.ts
git commit -m "refactor(actions): extract generic staged-rebalance core, parametrize liquidity buckets"
```

---

### Task 9: `buildBeliefActions` engine + `/api/belief-actions` route

**Files:**
- Create: `server/lib/actions/beliefActionsEngine.ts`
- Modify: `server/routes.ts`
- Test: `tests/beliefActionsEngine.test.ts`

**Implementation-plan decision:** the 8-bucket episode taxonomy's rebalancing engine operates only over the 6 MODELLED buckets (tier-1 + tier-2: `uk-equity`, `us-equity`, `global-equity`, `govt-bonds`, `property`, `cash`) — `europe-equity`/`emerging-equity` are excluded from the bucket list entirely (never a donor or recipient), since they're `UNMODELLED`.

**Correction found during Task 5's code review (applies to the caller, Task 12, not this engine itself):** `mixFromHoldings` does NOT actually exclude `europe-equity`/`emerging-equity` (see Task 5's correction note) — so whichever page calls this engine (`OutlookAlternatives.tsx`, Task 12) MUST pass `renormaliseOverModelledBuckets(mix)` as `currentMix`, not the raw mix, or `current`'s modelled-bucket slice won't sum to 1 the way `targetMix` (from `blendBeliefAllocation`) does, producing systematically overstated "need" deltas. Task 12 below is written with this fix already applied — this note is here so the engine's own behavior (this file) isn't mistakenly "fixed" a second time; the fix belongs entirely on the caller side.

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { buildBeliefActions } from '../server/lib/actions/beliefActionsEngine';

describe('buildBeliefActions', () => {
  it('raises liquidity into cash (the sole liquidity bucket) when below the floor', () => {
    const currentMix = { 'cash': 0.05, 'uk-equity': 0.95, 'us-equity': 0, 'global-equity': 0, 'govt-bonds': 0, 'property': 0 };
    const targetMix = { 'cash': 0.15, 'uk-equity': 0.55, 'us-equity': 0, 'global-equity': 0, 'govt-bonds': 0.30, 'property': 0 };
    const result = buildBeliefActions({ currentMix, targetMix, portfolioValueGBP: 500_000 });
    expect(result.summary.liquidityFixPp).toBe(10);
    const allActions = [...result.staged.stage1, ...result.staged.stage2];
    const cashNet = allActions.filter((a) => a.bucket === 'cash').reduce((s, a) => s + a.deltaPct, 0);
    expect(cashNet).toBeCloseTo(0.10, 3);
  });

  it('stages property (the sole illiquid bucket) into stage 2', () => {
    const currentMix = { 'cash': 0.10, 'uk-equity': 0.40, 'us-equity': 0.20, 'global-equity': 0.20, 'govt-bonds': 0.10, 'property': 0 };
    const targetMix = { 'cash': 0.10, 'uk-equity': 0.20, 'us-equity': 0.20, 'global-equity': 0.20, 'govt-bonds': 0.10, 'property': 0.20 };
    const result = buildBeliefActions({ currentMix, targetMix, portfolioValueGBP: 500_000 });
    const propertyInStage2 = result.staged.stage2.some((a) => a.bucket === 'property');
    const propertyInStage1 = result.staged.stage1.some((a) => a.bucket === 'property');
    expect(propertyInStage2).toBe(true);
    expect(propertyInStage1).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/beliefActionsEngine.test.ts`
Expected: FAIL with "Cannot find module '../server/lib/actions/beliefActionsEngine'"

- [ ] **Step 3: Write the implementation**

```typescript
import { computeStagedRebalance, type StagedRebalanceResult } from "./stagedRebalance";

export const BELIEF_MODELLED_BUCKETS = ['uk-equity', 'us-equity', 'global-equity', 'govt-bonds', 'property', 'cash'];
export const BELIEF_LIQUIDITY_BUCKETS = ['cash'];
export const BELIEF_ILLIQUID_BUCKETS = ['property'];
export const BELIEF_DONOR_ORDER = ['global-equity', 'us-equity', 'uk-equity', 'property'];

/** Illustrative round-trip cost assumptions for the 8-bucket episode taxonomy, same order of
 *  magnitude as the original FRICTION_RATE table (frictions.ts) mapped onto this taxonomy's buckets. */
export const BELIEF_FRICTION_RATE: Record<string, number> = {
  'uk-equity': 0.0015, 'us-equity': 0.0015, 'global-equity': 0.0015,
  'govt-bonds': 0.0006, 'property': 0.0100, 'cash': 0,
};

export interface BeliefActionsRequest {
  currentMix: Record<string, number>;
  targetMix: Record<string, number>;
  portfolioValueGBP: number;
  liquidityFloorPct?: number;
  minTradePct?: number;
  maxMoves?: number;
}

/** Spec §7: "new target-mix-construction logic driven by belief-weighted tier-1/2 exposure" —
 *  the target mix itself is `blendBeliefAllocation()`'s output (client/src/lib/beliefImpact/
 *  computeAlignment.ts); this function only stages the moves from current to that target,
 *  reusing the same generic algorithm the original /api/actions endpoint uses (Task 8). */
export function buildBeliefActions(req: BeliefActionsRequest): StagedRebalanceResult {
  return computeStagedRebalance({
    buckets: BELIEF_MODELLED_BUCKETS,
    current: req.currentMix,
    target: req.targetMix,
    portfolioValueGBP: Math.max(0, req.portfolioValueGBP || 0),
    liquidityBuckets: BELIEF_LIQUIDITY_BUCKETS,
    liquidityFloorPct: req.liquidityFloorPct ?? 0.10,
    donorOrder: BELIEF_DONOR_ORDER,
    minTradePct: req.minTradePct ?? 0.005,
    maxMoves: req.maxMoves ?? 6,
    illiquidBuckets: BELIEF_ILLIQUID_BUCKETS,
    frictionRate: BELIEF_FRICTION_RATE,
    stageIlliquids: true,
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/beliefActionsEngine.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Add the `/api/belief-actions` route**

In `server/routes.ts`, find the end of the existing `/api/actions` handler:

```typescript
      return res.json(result);
    } catch (error) {
      console.error('Actions API error:', error);
      return res.status(500).json({ 
        error: 'Failed to generate action plan',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
```

Replace with (adds the new route immediately after, unchanged existing handler above it):

```typescript
      return res.json(result);
    } catch (error) {
      console.error('Actions API error:', error);
      return res.status(500).json({ 
        error: 'Failed to generate action plan',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Belief Actions API Route - stage rebalancing moves for the belief-impact-alternatives taxonomy
  app.post("/api/belief-actions", (req, res) => {
    try {
      const body = req.body as BeliefActionsRequest;
      if (!body?.currentMix || !body?.targetMix || !body?.portfolioValueGBP) {
        return res.status(400).json({
          error: "currentMix, targetMix, portfolioValueGBP are required"
        });
      }
      const result = buildBeliefActions(body);
      return res.json(result);
    } catch (error) {
      console.error('Belief Actions API error:', error);
      return res.status(500).json({
        error: 'Failed to generate belief-driven action plan',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
```

Add the import near the existing `buildActions` import at the top of `server/routes.ts`:

Run: `grep -n "import.*buildActions" server/routes.ts`

At that line, add immediately after it: `import { buildBeliefActions, type BeliefActionsRequest } from "./lib/actions/beliefActionsEngine";`

- [ ] **Step 6: Manually verify the route**

Run: `npm run dev` (in one terminal), then in another:

```bash
curl -X POST http://localhost:5000/api/belief-actions \
  -H "Content-Type: application/json" \
  -d '{"currentMix":{"cash":0.05,"uk-equity":0.95,"us-equity":0,"global-equity":0,"govt-bonds":0,"property":0},"targetMix":{"cash":0.15,"uk-equity":0.55,"us-equity":0,"global-equity":0,"govt-bonds":0.30,"property":0},"portfolioValueGBP":500000}'
```

Expected: 200 response with `summary`/`staged`/`playbook` fields, `summary.liquidityFixPp: 10`

- [ ] **Step 7: Commit**

```bash
git add server/lib/actions/beliefActionsEngine.ts server/routes.ts tests/beliefActionsEngine.test.ts
git commit -m "feat(belief-impact): add buildBeliefActions engine and /api/belief-actions route"
```

---

### Task 10: `Outlook.tsx` page (B1–B15 questionnaire)

**Files:**
- Create: `client/src/pages/onboarding-v2/Outlook.tsx`

No `.test.ts` for this file — the vitest config (`vitest.config.server.ts`) only includes `tests/**/*.test.ts` and `client/src/**/*.test.ts` (no `.tsx`), matching the existing codebase convention that pages are verified manually/by the router wiring's smoke test (Task 13), not by component tests. `Beliefs.tsx`/`NextSteps.tsx`/`Analysis.tsx` have no test files either.

- [ ] **Step 1: Create the page, mirroring `Beliefs.tsx`'s existing structural pattern (OnboardingLayout, allAnswered/attemptedSubmit gating, back/continue buttons)**

```tsx
import OnboardingLayout from '@/components/onboarding-v2/OnboardingLayout';
import { useOnboardingV2Store } from '@/state/onboardingV2Store';
import { BELIEF_QUESTIONS, SCALE_LABELS } from '@/data/beliefQuestions';
import { useLocation } from 'wouter';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';

const ANSWER_VALUES: (1 | 2 | 3 | 4 | 5)[] = [1, 2, 3, 4, 5];

export default function Outlook() {
  const [, navigate] = useLocation();
  const { outlook, setOutlookResponse, computeOutlookScores, completeOutlookStep } = useOnboardingV2Store();
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const allAnswered = useMemo(
    () => BELIEF_QUESTIONS.every((q) => outlook.responses[q.id] !== undefined),
    [outlook.responses],
  );
  const answeredCount = Object.keys(outlook.responses).length;

  const handleContinue = () => {
    setAttemptedSubmit(true);
    if (!allAnswered) return;
    computeOutlookScores();
    completeOutlookStep();
    navigate('/onboarding-v2/outlook-results');
  };

  const handleBack = () => navigate('/onboarding-v2/target');

  return (
    <OnboardingLayout
      stepId="outlook"
      title="Your outlook"
      description="These are about the world, not your portfolio — how you see the next few years playing out. We'll map them to how your actual holdings would be affected if you're right."
      hideNav={true}
    >
      <div className="space-y-6 pt-6">
        {BELIEF_QUESTIONS.map((q) => (
          <div
            key={q.id}
            className="p-4 rounded-xl border border-[var(--border)] bg-white dark:bg-slate-800/80"
            data-testid={`outlook-question-${q.id}`}
          >
            <p className="text-sm font-medium text-[var(--foreground)] mb-3">{q.statement}</p>
            <div className="flex gap-2 flex-wrap">
              {ANSWER_VALUES.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setOutlookResponse(q.id, v)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    outlook.responses[q.id] === v
                      ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                      : 'bg-white dark:bg-slate-800 border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)]'
                  }`}
                  data-testid={`outlook-answer-${q.id}-${v}`}
                >
                  {SCALE_LABELS[v]}
                </button>
              ))}
            </div>
          </div>
        ))}

        {attemptedSubmit && !allAnswered && (
          <p className="text-sm text-rose-600 dark:text-rose-400" data-testid="outlook-validation-error">
            Please answer all {BELIEF_QUESTIONS.length} questions to continue ({answeredCount}/{BELIEF_QUESTIONS.length} so far).
          </p>
        )}

        <div className="flex justify-between items-center pt-6 border-t border-[var(--border)]">
          <Button variant="outline" onClick={handleBack} data-testid="outlook-back-button">Back</Button>
          <Button onClick={handleContinue} disabled={!allAnswered} data-testid="outlook-continue-button">
            Continue {!allAnswered && `(${answeredCount}/${BELIEF_QUESTIONS.length})`}
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p .`
Expected: no new errors

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/onboarding-v2/Outlook.tsx
git commit -m "feat(belief-impact): add Outlook page (B1-B15 questionnaire)"
```

---

### Task 11: `OutlookResults.tsx` page (alignment, mismatch, tiered impact, income runway)

**Files:**
- Create: `client/src/pages/onboarding-v2/OutlookResults.tsx`

- [ ] **Step 1: Create the page, wiring Tasks 1/5/6/7's logic modules together**

```tsx
import { useMemo } from 'react';
import OnboardingLayout from '@/components/onboarding-v2/OnboardingLayout';
import { useOnboardingV2Store } from '@/state/onboardingV2Store';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { mixFromHoldings, type MixHolding } from '@/lib/portfolioMix';
import { EPISODES } from '@/data/episodeLibrary';
import { replayEpisode } from '@/lib/empiricalEngine';
import { computeAlignment } from '@/lib/beliefImpact/computeAlignment';
import { computeTieredImpact } from '@/lib/beliefImpact/computeTieredImpact';
import { computeIncomeRunway } from '@/lib/beliefImpact/computeIncomeRunway';
import { BELIEF_SCENARIO_MAPPING, type BeliefScenarioName } from '@/data/beliefImpactTaxonomy';
import { fmtSignedPct } from '@/lib/scenarioPlannerView';

const BAND_LABEL: Record<string, string> = {
  BROADLY_ALIGNED: 'Broadly aligned',
  PARTIALLY_ALIGNED: 'Partially aligned',
  MISALIGNED: 'Misaligned',
};

export default function OutlookResults() {
  const [, navigate] = useLocation();
  const { holdings, intake, outlook, summary } = useOnboardingV2Store();

  const holdingsForCompute = useMemo(
    () => holdings.filter((h) => h.value_gbp > 0).map((h) => ({ asset_class: h.asset_class, region: h.region, value_gbp: h.value_gbp })),
    [holdings],
  );

  const { mix } = useMemo(() => mixFromHoldings(holdingsForCompute as MixHolding[]), [holdingsForCompute]);

  const alignment = useMemo(
    () => computeAlignment(mix, outlook.scenario_weights, intake.risk_comfort),
    [mix, outlook.scenario_weights, intake.risk_comfort],
  );

  const tieredImpact = useMemo(
    () => computeTieredImpact(mix, holdingsForCompute, outlook.scenario_weights, summary.total_investable_value),
    [mix, holdingsForCompute, outlook.scenario_weights, summary.total_investable_value],
  );

  const topScenario = useMemo(() => {
    const entries = Object.entries(outlook.scenario_weights) as [BeliefScenarioName, number][];
    return entries.sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  }, [outlook.scenario_weights]);

  const runwayExamples = useMemo(() => {
    if (!topScenario) return [];
    const mapping = BELIEF_SCENARIO_MAPPING[topScenario];
    if (!mapping || mapping.isUpside) return [];
    return mapping.episodeIds
      .map((epId) => EPISODES.find((e) => e.id === epId))
      .filter((e): e is NonNullable<typeof e> => e !== undefined)
      .map((episode) => {
        const replay = replayEpisode(mix, episode, summary.total_investable_value);
        return computeIncomeRunway(replay, intake.annual_essential_spend_gbp, intake.liquid_cash_gbp, episode.name);
      });
  }, [topScenario, mix, summary.total_investable_value, intake.annual_essential_spend_gbp, intake.liquid_cash_gbp]);

  const handleContinue = () => navigate('/onboarding-v2/outlook-alternatives');
  const handleBack = () => navigate('/onboarding-v2/outlook');

  if (outlook.insufficient_signal) {
    return (
      <OnboardingLayout stepId="outlook-results" title="Your outlook results" hideNav={true}>
        <div className="space-y-6 pt-6">
          <p className="text-sm text-[var(--muted-foreground)]" data-testid="outlook-insufficient-signal">
            Your answers didn't give us enough signal to model an outlook-driven impact — mostly neutral responses
            cancel each other out. You can go back and answer more definitively, or continue without this view.
          </p>
          <div className="flex justify-between items-center pt-6 border-t border-[var(--border)]">
            <Button variant="outline" onClick={handleBack} data-testid="outlook-results-back-button">Back</Button>
            <Button onClick={handleContinue} data-testid="outlook-results-continue-button">Continue</Button>
          </div>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout stepId="outlook-results" title="Your outlook results" hideNav={true}>
      <div className="space-y-6 pt-6">
        <div className="p-5 rounded-xl border-2 border-[var(--border)]" data-testid="alignment-headline">
          <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Alignment score</p>
          <p className="text-3xl font-bold">
            {alignment.score}<span className="text-base font-normal text-[var(--muted-foreground)]"> / 100</span>
          </p>
          <p className="text-sm font-medium mt-1">{BAND_LABEL[alignment.band]}</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-2">
            Illustrative only — based on 15 answers and a mix of cited and illustrative data, not a precise measurement.
          </p>
        </div>

        {alignment.mismatchFlag && (
          <div className="p-4 rounded-xl border-2 border-amber-500/30 bg-amber-500/5" data-testid="mismatch-flag">
            <p className="text-sm text-amber-700 dark:text-amber-400">{alignment.mismatchFlag}</p>
          </div>
        )}
        {alignment.concentrationFlag && (
          <div className="p-4 rounded-xl border-2 border-amber-500/30 bg-amber-500/5" data-testid="concentration-flag">
            <p className="text-sm text-amber-700 dark:text-amber-400">{alignment.concentrationFlag}</p>
          </div>
        )}

        <div className="space-y-3" data-testid="tiered-impact-rows">
          {tieredImpact.rows.map((row) => (
            <div key={row.bucket} className="p-4 rounded-xl border border-[var(--border)]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">{row.bucket.replace(/-/g, ' ')}</span>
                <span className="text-xs text-[var(--muted-foreground)]">{row.weightPct}% of modelled portfolio</span>
              </div>
              <span className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
                {row.tier === 'EPISODE_REPLAY' ? 'Cited historical replay' : 'Illustrative, anchored to historical episodes'}
              </span>
              {row.citedSources.map((s) => (
                <p key={s.id} className="text-sm mt-1">
                  {s.name}: {fmtSignedPct(s.troughPct)} at the deepest point ({s.recoveryLabel})
                </p>
              ))}
            </div>
          ))}
        </div>

        {runwayExamples.map((r, i) => (
          <div key={i} className="p-4 rounded-xl border border-[var(--border)] bg-slate-50 dark:bg-slate-800/50" data-testid={`income-runway-${i}`}>
            <p className="text-sm">{r.narrative}</p>
          </div>
        ))}

        {tieredImpact.unmodelledBreakdown.length > 0 && (
          <div className="p-4 rounded-xl border border-[var(--border)]" data-testid="unmodelled-breakdown">
            <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
              Not modelled ({tieredImpact.unmodelledSharePct}% of your portfolio)
            </p>
            {tieredImpact.unmodelledBreakdown.map((u) => (
              <p key={u.name} className="text-sm">
                {u.name.replace(/-/g, ' ')}: £{u.valueGbp.toLocaleString('en-GB')} — no reliable long-run history exists for this asset class.
              </p>
            ))}
          </div>
        )}

        <p className="text-xs text-[var(--muted-foreground)] pt-2 border-t border-[var(--border)]">
          Illustrative only. Not financial advice.
        </p>

        <div className="flex justify-between items-center pt-2">
          <Button variant="outline" onClick={handleBack} data-testid="outlook-results-back-button">Back</Button>
          <Button onClick={handleContinue} data-testid="outlook-results-continue-button">See alternatives</Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p .`
Expected: no new errors

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/onboarding-v2/OutlookResults.tsx
git commit -m "feat(belief-impact): add OutlookResults page (alignment, mismatch, tiered impact, runway)"
```

---

### Task 12: `OutlookAlternatives.tsx` page (illustrative rebalancing)

**Files:**
- Create: `client/src/pages/onboarding-v2/OutlookAlternatives.tsx`

- [ ] **Step 1: Create the page, calling `/api/belief-actions` with `blendBeliefAllocation` as the target mix**

```tsx
import { useEffect, useMemo, useState } from 'react';
import OnboardingLayout from '@/components/onboarding-v2/OnboardingLayout';
import { useOnboardingV2Store } from '@/state/onboardingV2Store';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { mixFromHoldings, type MixHolding } from '@/lib/portfolioMix';
import { blendBeliefAllocation, renormaliseOverModelledBuckets } from '@/lib/beliefImpact/computeAlignment';
import { apiRequest } from '@/lib/queryClient';

interface BeliefAction {
  type: 'TRIM' | 'ADD' | 'TRANSFER';
  bucket: string;
  deltaPct: number;
  amountGBP: number;
  rationale: string;
  stage: 1 | 2;
}
interface BeliefActionsResponse {
  summary: {
    totalAbsChangePp: number; estTurnoverPp: number; estCostPct: number;
    liquidityNowPct: number; liquidityTargetPct: number; liquidityFixPp?: number;
  };
  staged: { stage1: BeliefAction[]; stage2: BeliefAction[] };
  playbook: string[];
}

export default function OutlookAlternatives() {
  const [, navigate] = useLocation();
  const { holdings, outlook, summary } = useOnboardingV2Store();
  const [result, setResult] = useState<BeliefActionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mix = useMemo(() => {
    const mixHoldings: MixHolding[] = holdings
      .filter((h) => h.value_gbp > 0)
      .map((h) => ({ asset_class: h.asset_class, region: h.region, value_gbp: h.value_gbp }));
    // renormalise: mixFromHoldings does not exclude europe/emerging-equity (UNMODELLED tier), but
    // targetMix below always sums to 1 over the 6 modelled buckets only — see Task 5's correction
    // note. Without this, "need" deltas would be systematically overstated.
    return renormaliseOverModelledBuckets(mixFromHoldings(mixHoldings).mix);
  }, [holdings]);

  const targetMix = useMemo(() => blendBeliefAllocation(outlook.scenario_weights), [outlook.scenario_weights]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const response = await apiRequest('POST', '/api/belief-actions', {
          currentMix: mix, targetMix, portfolioValueGBP: summary.total_investable_value,
        });
        const json = await response.json();
        if (!cancelled) setResult(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to compute alternatives');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [mix, targetMix, summary.total_investable_value]);

  const handleBack = () => navigate('/onboarding-v2/outlook-results');
  const handleContinue = () => navigate('/onboarding-v2/next-steps');

  return (
    <OnboardingLayout stepId="outlook-alternatives" title="Illustrative alternatives" hideNav={true}>
      <div className="space-y-6 pt-6">
        <p className="text-sm text-[var(--muted-foreground)]" data-testid="alternatives-non-advice-label">
          This is a simulation based on your outlook, not a recommendation. It shows one illustrative way to reduce
          the impact modelled on the previous page — not advice on what to do.
        </p>

        {loading && <p className="text-sm text-[var(--muted-foreground)]" data-testid="alternatives-loading">Computing illustrative alternatives...</p>}
        {error && <p className="text-sm text-rose-600" data-testid="alternatives-error">{error}</p>}

        {result && (
          <div className="space-y-4" data-testid="alternatives-result">
            <div className="p-4 rounded-xl border border-[var(--border)]">
              <p className="text-sm">
                Estimated turnover: ~{result.summary.estTurnoverPp}pp; indicative cost: ~{(result.summary.estCostPct * 100).toFixed(2)}% of your modelled portfolio.
              </p>
            </div>
            {result.staged.stage1.length > 0 && (
              <div data-testid="alternatives-stage1">
                <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-2">Stage 1 — liquid moves</p>
                {result.staged.stage1.map((a, i) => (
                  <p key={i} className="text-sm">
                    {a.bucket.replace(/-/g, ' ')}: {a.type === 'ADD' ? '+' : '-'}{Math.abs(a.deltaPct * 100).toFixed(1)}pp
                    {' '}(£{Math.round(a.amountGBP).toLocaleString('en-GB')}) — {a.rationale}
                  </p>
                ))}
              </div>
            )}
            {result.staged.stage2.length > 0 && (
              <div data-testid="alternatives-stage2">
                <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-2">Stage 2 — illiquid moves, deferred</p>
                {result.staged.stage2.map((a, i) => (
                  <p key={i} className="text-sm">
                    {a.bucket.replace(/-/g, ' ')}: {a.type === 'ADD' ? '+' : '-'}{Math.abs(a.deltaPct * 100).toFixed(1)}pp
                    {' '}(£{Math.round(a.amountGBP).toLocaleString('en-GB')}) — {a.rationale}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-[var(--muted-foreground)] pt-2 border-t border-[var(--border)]" data-testid="alternatives-compliance-caption">
          Illustrative only. Not financial advice. Decisions about your own portfolio, in light of your full
          circumstances, are where regulated financial advice is the right place to turn.
        </p>

        <div className="flex justify-between items-center pt-2">
          <Button variant="outline" onClick={handleBack} data-testid="alternatives-back-button">Back</Button>
          <Button onClick={handleContinue} data-testid="alternatives-continue-button">Continue</Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p .`
Expected: no new errors

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/onboarding-v2/OutlookAlternatives.tsx
git commit -m "feat(belief-impact): add OutlookAlternatives page"
```

---

### Task 13: Router wiring + end-to-end smoke verification

**Files:**
- Modify: `client/src/App.tsx:45-46,99-100`
- Modify: `client/src/pages/onboarding-v2/Target.tsx:1093-1096`
- Modify: `client/src/pages/onboarding-v2/NextSteps.tsx:173-175`

- [ ] **Step 1: Add the 3 new lazy imports to `App.tsx`**

Find:

```typescript
const OnboardingV2Target = lazy(() => import("@/pages/onboarding-v2/Target"));
const OnboardingV2NextSteps = lazy(() => import("@/pages/onboarding-v2/NextSteps"));
```

Replace with:

```typescript
const OnboardingV2Target = lazy(() => import("@/pages/onboarding-v2/Target"));
const OnboardingV2Outlook = lazy(() => import("@/pages/onboarding-v2/Outlook"));
const OnboardingV2OutlookResults = lazy(() => import("@/pages/onboarding-v2/OutlookResults"));
const OnboardingV2OutlookAlternatives = lazy(() => import("@/pages/onboarding-v2/OutlookAlternatives"));
const OnboardingV2NextSteps = lazy(() => import("@/pages/onboarding-v2/NextSteps"));
```

- [ ] **Step 2: Add the 3 new routes to `App.tsx`**

Find:

```typescript
      <Route path="/onboarding-v2/target">{() => <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" /></div>}><OnboardingV2Target /></Suspense>}</Route>
      <Route path="/onboarding-v2/next-steps">{() => <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" /></div>}><OnboardingV2NextSteps /></Suspense>}</Route>
```

Replace with:

```typescript
      <Route path="/onboarding-v2/target">{() => <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" /></div>}><OnboardingV2Target /></Suspense>}</Route>
      <Route path="/onboarding-v2/outlook">{() => <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" /></div>}><OnboardingV2Outlook /></Suspense>}</Route>
      <Route path="/onboarding-v2/outlook-results">{() => <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" /></div>}><OnboardingV2OutlookResults /></Suspense>}</Route>
      <Route path="/onboarding-v2/outlook-alternatives">{() => <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" /></div>}><OnboardingV2OutlookAlternatives /></Suspense>}</Route>
      <Route path="/onboarding-v2/next-steps">{() => <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" /></div>}><OnboardingV2NextSteps /></Suspense>}</Route>
```

- [ ] **Step 3: Redirect `Target.tsx`'s continue into the new flow**

Find:

```typescript
  const handleContinue = () => {
    completeScenarioStep();
    navigate('/onboarding-v2/next-steps');
  };
```

Replace with:

```typescript
  const handleContinue = () => {
    completeScenarioStep();
    navigate('/onboarding-v2/outlook');
  };
```

- [ ] **Step 4: Redirect `NextSteps.tsx`'s back button into the new flow**

Find:

```typescript
  const handleBack = () => {
    navigate('/onboarding-v2/target');
  };
```

Replace with:

```typescript
  const handleBack = () => {
    navigate('/onboarding-v2/outlook-alternatives');
  };
```

- [ ] **Step 5: Full automated test suite**

Run: `npx vitest run`
Expected: PASS — all existing tests plus all new tests from Tasks 1, 3, 5, 6, 7, 8, 9

- [ ] **Step 6: Typecheck the whole project**

Run: `npx tsc --noEmit -p .`
Expected: no new errors

- [ ] **Step 7: Manual end-to-end smoke test (pages aren't covered by the vitest config — `.tsx` files are excluded)**

Using the `run`/preview-server skill or `npm run dev` + a browser:

1. Start the dev server, navigate to `/onboarding-v2/welcome`, and step through: method → intake (fill in `annual_essential_spend_gbp`, `liquid_cash_gbp`, `time_horizon_years`, `risk_comfort`) → holdings (add at least one holding with `asset_class: 'equity', region: 'uk'` and one with `asset_class: 'alternatives'` to exercise both the modelled and unmodelled paths) → beliefs (existing style-tilt step, unchanged) → analysis → target.
2. On Target, click Continue — confirm it navigates to `/onboarding-v2/outlook`, not `/onboarding-v2/next-steps`.
3. On Outlook, answer all 15 questions (mix of agree/disagree, not all-Neutral) and click Continue — confirm navigation to `/onboarding-v2/outlook-results`.
4. On OutlookResults — confirm: an alignment score renders with a band label; the uk-equity row (if held) shows "Cited historical replay" with a named episode and a signed percentage; the alternatives-asset-class holding appears under "Not modelled"; no console errors.
5. Click "See alternatives" — confirm navigation to `/onboarding-v2/outlook-alternatives`, that it calls `/api/belief-actions` (check the network tab for a 200 response), and that staged moves render with the non-advice label visible above them.
6. Click Continue — confirm navigation to `/onboarding-v2/next-steps` (existing page, unchanged).
7. On NextSteps, click Back — confirm it returns to `/onboarding-v2/outlook-alternatives`, not `/onboarding-v2/target`.
8. Repeat step 3 answering all 15 questions as Neutral — confirm OutlookResults shows the "didn't give us enough signal" state instead of a score.

Expected: all 8 checks pass, no console errors, no broken navigation.

- [ ] **Step 8: Commit**

```bash
git add client/src/App.tsx client/src/pages/onboarding-v2/Target.tsx client/src/pages/onboarding-v2/NextSteps.tsx
git commit -m "feat(belief-impact): wire outlook/outlook-results/outlook-alternatives into the onboarding flow"
```

---

## Self-review notes (spec coverage)

- §1 tiers → Task 1 (`BUCKET_TIER`), rendered in Task 11.
- §2 belief reuse + B7/B8/B10 fix → Task 2.
- §3 scenario-level clamp + all-neutral fallback → Task 3.
- §4 belief→impact bridge → Task 1 (`BELIEF_SCENARIO_MAPPING`) + Task 6 (wiring to `replayEpisode`/`shockFor`).
- §5 alignment score + band + caveat + concentration + mismatch → Task 5, rendered in Task 11.
- §6 income/withdrawal runway → Task 7, rendered in Task 11.
- §7 alternatives, non-advice language, real-holdings target → Tasks 8/9/12.
- §8 flow → Task 13.
- Open items explicitly deferred by the spec itself (europe/emerging sourcing, final editorial mapping pass, Rate-Cut Reflation copy treatment beyond the upside skip in Task 6, vulnerable-customer path, compliance sign-off) are correctly NOT implemented here — they are out of scope per the spec's own "not blocking this design" framing, not gaps in this plan.
