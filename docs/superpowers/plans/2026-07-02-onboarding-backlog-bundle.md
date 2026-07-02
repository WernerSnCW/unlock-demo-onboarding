# Onboarding Backlog Bundle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clear the six small backlog items from the 2026-07-02 scoping note (§7) and forensic-audit ledgers: the `BELIEF_QUESTIONS` naming collision, proper bucket display labels, a defensive zero-spend runway guard on OutlookResults, a "Not applicable" wrapper option, answer-button ARIA, and a bounded plain-language pass on the alternatives screen.

**Architecture:** No engine changes. One rename (data module), one new 20-line display-label helper with tests, one guard mirroring the already-shipped `computeRunwayComparison` guard, one new select option + its three display-map entries, `aria-pressed` on two questionnaire button groups, and two StatCard sub-lines + a units footnote.

**Tech Stack:** React + TypeScript, vitest (node env; UI verified by typecheck + browser walk). Baselines on this branch: **364 tests green, 158 pre-existing tsc errors** (`npm run check 2>&1 | grep -c "error TS"`).

**Branch:** `polish/onboarding-backlog-bundle` off `main` (already created). Werner workflow: merge main into the branch before pushing, PR, never commit to main.

---

## Scouting facts (verified in source, current as of branch point)

- **Naming collision:** `client/src/data/beliefQuestions.ts` exports `BELIEF_QUESTIONS` (the B1–B15 *outlook* statements) + `SCALE_LABELS`. `client/src/pages/onboarding-v2/Beliefs.tsx:35` defines an unrelated local `const BELIEF_QUESTIONS` (the 8 `Q_*` belief questions). Same name, different domains. Importers of the data module: `client/src/lib/beliefImpact/scoreOutlook.ts` (line 1) and `client/src/pages/onboarding-v2/Outlook.tsx` (line 3). No test file imports it directly.
- **Bucket-label sites:** `OutlookResults.tsx:120` (row header) and `:148` (unmodelled breakdown — NOTE: `u.name` there may be a raw `asset_class` string for unbucketed holdings, not just a Bucket), `OutlookAlternatives.tsx:198` and `:211` (stage rows), `BeforeAfterPanel.tsx:13` (`bucketLabel` helper used for donut labels + diff table). All currently `replace(/-/g, ' ')`, which yields lowercase "uk equity" / "govt bonds".
- **Zero-spend runway on OutlookResults:** `OutlookResults.tsx:48-59` computes `runwayExamples` via `computeIncomeRunway` with `intake.annual_essential_spend_gbp` unguarded — a 0 value renders a false "would have covered essential spending" reassurance. Route ordering currently prevents it (known residual risk in the prior plan); this makes it defensive, mirroring `computeRunwayComparison`'s `<= 0 → null` guard shipped on PR #34.
- **Wrapper option:** `Holdings.tsx:18-25` `WRAPPERS` array (isa/sipp/gia/cash/offshore_bond/other) feeds the per-holding Select at `:390-405`; wrapper is REQUIRED by validation (`:140-141`), so users with no wrapper info currently have to lie with "Other". Display maps with graceful fallbacks: `step9Helpers.ts:48-54` `WRAPPER_LABELS` (fallback `wrapper.toUpperCase()` → would show "NOT_APPLICABLE"), `:56-62` `WRAPPER_ROLES` (fallback 'Investment wrapper'), `PlanWrappers.tsx:37-43` `WRAPPER_TOOLTIPS` (no entry → no tooltip), `onboardingV2Store.ts:739-753` `normalizeWrapper` (fallback would show "Not_applicable" in breakdowns).
- **ARIA:** `Outlook.tsx:61-73` and `Beliefs.tsx:254-266` answer buttons are toggle-style buttons with a visual selected state but no `aria-pressed`.
- **Plain-language (bounded scope):** on `OutlookAlternatives.tsx`, the "Allocation shift" and "Est. turnover" StatCards carry bare jargon values with no explainer sub-line (the other two cards have subs), and the screen uses the "pp" unit ~10 times with no expansion anywhere. A broader portal-wide terminology pass needs Tom's copy review — explicitly OUT of scope tonight; note it in the PR.

---

### Task 1: Rename the outlook question bank + bucket display labels + zero-spend guard

**Files:**
- Rename: `client/src/data/beliefQuestions.ts` → `client/src/data/outlookQuestions.ts` (git mv), export `BELIEF_QUESTIONS` → `OUTLOOK_QUESTIONS`
- Modify: `client/src/lib/beliefImpact/scoreOutlook.ts`, `client/src/pages/onboarding-v2/Outlook.tsx` (imports)
- Create: `client/src/lib/bucketLabels.ts` + `client/src/lib/bucketLabels.test.ts`
- Modify: `client/src/pages/onboarding-v2/OutlookResults.tsx` (labels ×2 + runway guard), `client/src/pages/onboarding-v2/OutlookAlternatives.tsx` (labels ×2), `client/src/components/onboarding-v2/BeforeAfterPanel.tsx` (use shared helper)

- [ ] **Step 1: Rename the module and export**

```bash
git mv client/src/data/beliefQuestions.ts client/src/data/outlookQuestions.ts
```

In `outlookQuestions.ts`: rename `export const BELIEF_QUESTIONS` → `export const OUTLOOK_QUESTIONS` and add above it:

```ts
// The B1–B15 macro-outlook statements (belief→impact flow). Renamed from BELIEF_QUESTIONS:
// Beliefs.tsx has an unrelated local constant of that name for the 8 Q_* style-preference questions.
```

Update the two importers:
- `scoreOutlook.ts:1`: `import { OUTLOOK_QUESTIONS } from '../../data/outlookQuestions';` and the usage at ~line 32.
- `Outlook.tsx:3`: `import { OUTLOOK_QUESTIONS, SCALE_LABELS } from '@/data/outlookQuestions';` and its usages (lines ~17 and the `.map` render).

Grep-gate: `grep -rn "beliefQuestions\|BELIEF_QUESTIONS" client/src --include='*.ts*'` must afterwards hit ONLY `Beliefs.tsx` (its local const and uses).

- [ ] **Step 2: Write failing tests for the label helper**

Create `client/src/lib/bucketLabels.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { bucketDisplayLabel } from './bucketLabels';

describe('bucketDisplayLabel', () => {
  it('maps the 8 taxonomy buckets to proper display names', () => {
    expect(bucketDisplayLabel('uk-equity')).toBe('UK equity');
    expect(bucketDisplayLabel('us-equity')).toBe('US equity');
    expect(bucketDisplayLabel('europe-equity')).toBe('Europe equity');
    expect(bucketDisplayLabel('emerging-equity')).toBe('Emerging-markets equity');
    expect(bucketDisplayLabel('global-equity')).toBe('Global equity');
    expect(bucketDisplayLabel('govt-bonds')).toBe('Government bonds');
    expect(bucketDisplayLabel('property')).toBe('Property');
    expect(bucketDisplayLabel('cash')).toBe('Cash');
  });

  it('falls back to sentence-cased dash-splitting for unknown keys (raw asset classes)', () => {
    expect(bucketDisplayLabel('alternatives')).toBe('Alternatives');
    expect(bucketDisplayLabel('private-equity')).toBe('Private equity');
  });
});
```

Run `npm test -- bucketLabels` → FAIL (module missing).

- [ ] **Step 3: Implement the helper**

Create `client/src/lib/bucketLabels.ts`:

```ts
/** Display names for the 8-bucket episode taxonomy. The unmodelled-breakdown list can also
 *  carry raw asset_class strings (bucketFor() returns null for e.g. alternatives), so the
 *  fallback sentence-cases any dash-separated key rather than assuming a Bucket. */
const BUCKET_DISPLAY: Record<string, string> = {
  'uk-equity': 'UK equity',
  'us-equity': 'US equity',
  'europe-equity': 'Europe equity',
  'emerging-equity': 'Emerging-markets equity',
  'global-equity': 'Global equity',
  'govt-bonds': 'Government bonds',
  'property': 'Property',
  'cash': 'Cash',
};

export function bucketDisplayLabel(key: string): string {
  const known = BUCKET_DISPLAY[key];
  if (known) return known;
  const spaced = key.replace(/-/g, ' ').trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
```

Run `npm test -- bucketLabels` → 2 PASS.

- [ ] **Step 4: Adopt at the five render sites**

- `OutlookResults.tsx:120`: `{bucketDisplayLabel(row.bucket)}` (import `bucketDisplayLabel` from `@/lib/bucketLabels`).
- `OutlookResults.tsx:148`: `{bucketDisplayLabel(u.name)}`.
- `OutlookAlternatives.tsx:198` and `:211` (both stage rows): `{bucketDisplayLabel(a.bucket)}`.
- `BeforeAfterPanel.tsx`: delete the local `bucketLabel` const; import `bucketDisplayLabel` and use it in `donutData` and the diff-table row. Colour-dot lookups (`BUCKET_COLOUR[...]`) are keyed on the raw bucket id — unchanged.

- [ ] **Step 5: Zero-spend runway guard on OutlookResults**

In `OutlookResults.tsx`, the `runwayExamples` useMemo (lines ~48-59): add as the first line of the memo body:

```ts
if (intake.annual_essential_spend_gbp <= 0) return [];
```

(`intake` is already destructured; the dep array already lists `intake.annual_essential_spend_gbp`.) Mirrors `computeRunwayComparison`'s guard — a zero spend makes `computeIncomeRunway` report "survives" unconditionally, which is a false reassurance (its documented precondition).

- [ ] **Step 6: Verify + commit**

- `npm test` → all green (364 prior + 2 new = 366).
- `npm run check 2>&1 | grep -c "error TS"` → 158.
- Grep-gate from Step 1 clean.

```bash
git add -A client/src
git commit -m "polish(onboarding): rename outlook question bank, proper bucket labels, zero-spend runway guard"
```

---

### Task 2: "Not applicable" wrapper option

**Files:**
- Modify: `client/src/pages/onboarding-v2/Holdings.tsx:18-25`, `client/src/lib/step9Helpers.ts:48-62`, `client/src/pages/onboarding-v2/PlanWrappers.tsx:37-43`, `client/src/state/onboardingV2Store.ts:739-753`
- Test: `client/src/lib/step9Helpers.test.ts` (append one test)

- [ ] **Step 1: Write the failing test**

Append to the existing `client/src/lib/step9Helpers.test.ts` (match its existing holding-fixture style — read the file first and reuse its helper/fixture if one exists):

```ts
describe('computeWrapperSummaries — not_applicable wrapper', () => {
  it('groups not_applicable holdings under a proper label instead of the uppercase fallback', () => {
    const holdings = [
      { wrapper: 'not_applicable', value_gbp: 10_000 },
      { wrapper: 'isa', value_gbp: 5_000 },
    ] as any[];
    const summaries = computeWrapperSummaries(holdings, ['isa', 'gia']);
    const na = summaries.find((s) => s.wrapper_code === 'not_applicable');
    expect(na).toBeDefined();
    expect(na!.wrapper_label).toBe('Not applicable');
    expect(na!.illustrative_role).toBe('No wrapper');
  });
});
```

(If the file's existing tests build holdings through a fixture helper, use that instead of the `as any[]` cast.) Run `npm test -- step9Helpers` → the new test FAILS (label comes back "NOT_APPLICABLE").

- [ ] **Step 2: Implement**

- `Holdings.tsx` `WRAPPERS` array — add before `other`:
  ```ts
  { value: 'not_applicable', label: 'Not applicable' },
  ```
- `step9Helpers.ts` — add to `WRAPPER_LABELS`: `not_applicable: 'Not applicable',` and to `WRAPPER_ROLES`: `not_applicable: 'No wrapper',`.
- `PlanWrappers.tsx` `WRAPPER_TOOLTIPS` — add:
  ```ts
  not_applicable: "No tax wrapper applies to this holding, or wrapper detail isn't relevant for it.",
  ```
- `onboardingV2Store.ts` `normalizeWrapper` `wrapperMap` — add: `'NOT_APPLICABLE': 'Not applicable',`.

- [ ] **Step 3: Verify + commit**

- `npm test -- step9Helpers` → all pass; `npm test` → all green (+1 = 367).
- `npm run check 2>&1 | grep -c "error TS"` → 158.

```bash
git add client/src/pages/onboarding-v2/Holdings.tsx client/src/lib/step9Helpers.ts client/src/pages/onboarding-v2/PlanWrappers.tsx client/src/state/onboardingV2Store.ts client/src/lib/step9Helpers.test.ts
git commit -m "feat(onboarding): 'Not applicable' wrapper option across holdings, summaries, placement view"
```

---

### Task 3: Answer-button ARIA + bounded plain-language pass

**Files:**
- Modify: `client/src/pages/onboarding-v2/Outlook.tsx:61-73`, `client/src/pages/onboarding-v2/Beliefs.tsx:254-266`, `client/src/pages/onboarding-v2/OutlookAlternatives.tsx` (StatCard subs + pp footnote)

- [ ] **Step 1: aria-pressed on both questionnaire button groups**

- `Outlook.tsx` answer button (inside the `ANSWER_VALUES.map`): add
  ```tsx
  aria-pressed={outlook.responses[q.id] === v}
  ```
- `Beliefs.tsx` answer button (inside the `ANSWER_OPTIONS.map`): add
  ```tsx
  aria-pressed={response?.answer === option.value}
  ```

These are toggle buttons with a purely visual selected state today; `aria-pressed` exposes that state to screen readers. Do NOT restructure to radio groups (bigger change, out of scope).

- [ ] **Step 2: Plain-language subs + pp footnote on OutlookAlternatives**

In the summary grid, give the two bare StatCards explainer subs (matching the two that already have them):

```tsx
<StatCard label="Allocation shift" value={`${result.summary.totalAbsChangePp}pp`} sub="all moves added together" />
<StatCard label="Est. turnover" value={`~${result.summary.estTurnoverPp}pp`} sub="share that changes hands" />
```

Directly below the grid's closing `</div>`, add:

```tsx
<p className="text-xs text-[var(--muted-foreground)]" data-testid="alternatives-pp-footnote">
  pp = percentage points of your modelled portfolio.
</p>
```

Nothing else: compliance captions, non-advice labels, and server copy stay byte-identical. The broader portal-wide terminology pass is a named follow-on for Tom's copy review, not tonight's scope.

- [ ] **Step 3: Verify + commit**

- `npm test` → all green (367).
- `npm run check 2>&1 | grep -c "error TS"` → 158.

```bash
git add client/src/pages/onboarding-v2/Outlook.tsx client/src/pages/onboarding-v2/Beliefs.tsx client/src/pages/onboarding-v2/OutlookAlternatives.tsx
git commit -m "polish(onboarding): answer-button aria-pressed + plain-language stat subs and pp footnote"
```

---

### Task 4: Verification + PR (controller does this)

- [ ] Full suite + typecheck vs baselines (367 expected / 158).
- [ ] Browser walkthrough (host patch if ENOTSUP, revert before commit): Holdings wrapper select shows "Not applicable" and validation accepts it; PlanWrappers shows the "Not applicable" card with label/role/tooltip; Outlook + Beliefs buttons expose aria-pressed (inspect via snapshot); alternatives screen shows the two new subs + pp footnote; bucket labels read "UK equity / Government bonds" on results + alternatives + panel; zero-spend runway absent on OutlookResults when spend = 0.
- [ ] `git fetch origin && git merge origin/main` → suite re-run → push → PR with per-item summary; note the portal-wide plain-language pass as a Tom-gated follow-on.
