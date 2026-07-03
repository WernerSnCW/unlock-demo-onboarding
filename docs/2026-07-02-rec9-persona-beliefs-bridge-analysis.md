# Rec 9 structural analysis: bridging Beliefs into the persona engine

**Status:** structural analysis — research and design options only, no code changed
**Date:** 2026-07-02
**Scope:** D-rec 9 from `2026-07-02-persona-validation-report.md` §6.4 ("Bridge Q_VOLATILITY_COMFORT into T1 as a consistency check or second reading — Moderate cost"), explicitly declined in the just-shipped `feat/persona-coverage-fixes` PR pending this trace. Companion: `docs/superpowers/plans/2026-07-02-persona-coverage-fixes.md` (states the same navigation-order objection this doc verifies).
**Method:** direct read of `Beliefs.tsx`, `Analysis.tsx`, `Target.tsx`, `Holdings.tsx`, `Intake.tsx`, `onboardingV2Store.ts`, `personaEngine.ts`, `analysis.ts`, `routes.ts` (the `/api/onboarding-v2/analyse` handler) on branch `feat/persona-coverage-fixes`. No code executed beyond `git grep`/`git show`; no files under `server/` or `client/src/pages/onboarding-v2/` modified.

---

## 1. Executive summary

1. **The brief's navigation summary is half right.** Holdings → Analysis → Beliefs is correct, and Beliefs' Continue button does gate on `analysis.status`/beliefs data as described. But Beliefs' **Back button is unconditional** — it always returns to `/onboarding-v2/analysis`, it is not gated on any condition. And critically, **that back-navigation does not re-run analysis.** `Analysis.tsx`'s effect only calls `runAnalysis()` when `analysis.status === 'idle'`; once a result exists (`status: 'ready'`), returning to the page just re-renders the cached persona. So today, no path — forward or backward — ever re-runs persona computation with beliefs data in it, confirming the report's finding cleanly.
2. **A "recompute on return" pattern already exists in this codebase and is directly reusable.** `Holdings.tsx:166` and `Intake.tsx:162` both call `resetAnalysis()` (flips `analysis.status` back to `'idle'`) before navigating to Analysis, which makes the effect re-fire. This is the mechanism option (a) below would reuse — it is not a new pattern, just an unused-for-Beliefs instance of an existing one.
3. **The real fork is not navigation order — it's whether the bridge is active or passive.** D-rec 9 was phrased as two alternatives ("consistency check" vs. "second reading"). A passive consistency check (compare the two answers, show a note) needs **no re-analysis, no server change, and no navigation-order fix at all** — it can be built as a client-only read of two values already in the store. Only the active version (bridging into T1 so it can move the assignment) needs any of options (a)–(d). The brief conflates these; they have very different cost and risk profiles.
4. **Recommendation: don't build the active bridge.** The report's own evidence audit already establishes `risk_comfort` and `Q_VOLATILITY_COMFORT` as the same construct asked twice, and the live persona set already has borderline pairs (CAPITAL_PRESERVATION vs. INCOME_STABILITY are 1–3 points apart per §6.3) that a small T1 nudge from a redundant question could flip — visibly, on a page whose entire selling point (PR #38, shipped the same day) is a stable, explained persona. Document the redundancy and close the rec; a cheap, zero-risk passive consistency footnote is optional and written up separately as a plan for Tom's call, not executed here.

---

## 2. Navigation graph, traced

### 2.1 Forward path (confirmed as briefed)

```
Holdings.tsx:166  handleNext()      → resetAnalysis(); navigate('/onboarding-v2/analysis')
Analysis.tsx:544  "Continue to Beliefs" → navigate('/onboarding-v2/beliefs')   [unconditional button, always present once a result renders]
Beliefs.tsx:120   handleContinue()  → if (!allAnswered) return;
                                       completeBeliefsStep(); navigate('/onboarding-v2/target')
Target.tsx:1093   handleContinue()  → completeScenarioStep(); navigate('/onboarding-v2/outlook')
```

`Analysis.tsx`'s effect (line 131–139):
```
if (!hasValidData) return;
if (analysis.status === 'idle') runAnalysis();
```
`runAnalysis()` POSTs `{ intake, holdings }` to `/api/onboarding-v2/analyse` — the payload (built at `Analysis.tsx:147–176`) carries `risk_comfort`, `primary_goal`, `time_horizon`, `personaCues`, asset-class breakdown, and holdings. **It does not carry anything from the `beliefs` store slice.** This is why the persona is settled before Beliefs is ever shown in the primary flow: Analysis runs eagerly (as soon as intake+holdings are valid) and its input contract has no belief fields to omit-by-order — beliefs simply aren't wired in, at any point in the flow, forward or backward.

### 2.2 Back-navigation (corrects the brief)

`Beliefs.tsx:129–131`:
```ts
const handleBack = () => {
  navigate('/onboarding-v2/analysis');
};
```
This is **unconditional** — a plain Back button, not branching on `beliefs.tilts_allowed`, safety-light status, or anything else. There is only one Beliefs exit besides Continue, and it always targets Analysis.

Does landing back on Analysis constitute a re-analysis pass? **No.** `analysis.status` is `'ready'` after the first run and nothing on the Beliefs→Analysis path calls `resetAnalysis()`. Analysis's effect guard (`status === 'idle'`) means the component just renders the persisted `analysis.result` from the store — same persona, same safety lights, same `why_fits_bullets`. The only thing that *does* recompute on every Beliefs render is `computeBeliefsScores()` (`Beliefs.tsx:96–98`, fired on mount and whenever `analysis.result` or `responseCount` changes) — but that only writes to the `beliefs` slice (`axis_scores`, `tilt_profile`, `tilts_allowed`), which `Target.tsx` later reads to build the three illustrative scenarios. It never touches `analysis.result.persona`. The belief-tilt pipeline and the persona-trait pipeline are two fully separate computations that happen to both read from `analysis.result.safety_lights` but never intersect on the persona side.

### 2.3 `stepFlow.ts` — does not exist

There is no `client/src/lib/stepFlow.ts`. Only `client/src/lib/stepFlow.test.ts` exists, and it imports `ONBOARDING_STEPS`/`TOTAL_STEPS` from `client/src/components/onboarding-v2/StepIndicator.tsx` — that component (not a `lib/` file) is the actual step-order source of truth: 13 steps, `welcome → method → intake → holdings → analysis → beliefs → target → outlook → outlook-results → outlook-alternatives → next-steps → plan-transition → plan-wrappers`. Any reorder option (§3, option b) has to edit this array and its consumers, not a `stepFlow.ts` that isn't there.

### 2.4 The one relevant existing pattern: recompute-on-edit-return

`Holdings.tsx:101,113,118,166` and `Intake.tsx:162` all call `resetAnalysis()` before returning to Analysis, specifically so that editing upstream data forces a fresh persona/safety-lights computation rather than showing stale results. This is the **only** precedent in the codebase for "go back and recompute," and it is a clean, already-tested idiom — not something that would need to be invented for option (a).

---

## 3. Architectural options

### 3.0 The real first decision: passive check vs. active input

Before the ordering options below, note that D-rec 9 offered two different fixes and they don't need the same machinery:

- **Passive consistency check** — read `intake.risk_comfort` and `beliefs.responses.Q_VOLATILITY_COMFORT` together (both already live in the same Zustand store) and surface a note ("your Step 6 answer is more/less risk-tolerant than your Step 3 answer"). No T1 change, no re-POST, no persona re-render, **no dependency on step order at all** — it can render correctly regardless of which screen the user is currently on, because it only ever needs whichever value is currently in the store. This is effectively free relative to (a)–(d).
- **Active second reading** — actually blend the belief answer into T1 so it can move `risk_appetite` and, potentially, the assigned persona. This is the version that runs into the ordering problem, and needs one of (a)–(d).

The options below are all for the *active* version, since the passive version doesn't need a structural fix.

### 3.1 Option (a): re-analysis pass after Beliefs completes

Reuse the `resetAnalysis()` idiom (§2.4). Two sub-variants:

- **(a-i) Route back through Analysis.** Beliefs' `handleContinue` calls `resetAnalysis()` and navigates to `/onboarding-v2/analysis` instead of `/onboarding-v2/target`. Analysis's own "Continue to Beliefs" button (`Analysis.tsx:544`) would need a conditional — if `beliefs.completed` is already true (the flag `completeBeliefsStep()` already sets), show "Continue to Target" and route there instead. This reuses an existing field (`beliefs.completed`) and an existing pattern (`resetAnalysis`), so it's the cheaper of the two sub-variants.
- **(a-ii) Recompute in place, no detour.** Beliefs' Continue handler POSTs the belief-augmented payload directly and updates `analysis.result` without visiting the Analysis screen. Cheaper on navigation/step-flow logic, but `runAnalysis()` currently lives as a local closure inside `Analysis.tsx` (lines 141–185) — there's no store-level "trigger analysis" action today, so this variant requires lifting that POST logic into the store first.

**Cost:** Moderate. (a-i) is mostly wiring; (a-ii) needs a small refactor first.
**UX:** The investor sees the Portfolio Analysis screen (or its persona card) update after a single Beliefs answer, on a screen they already completed. Best case it reads as "refined using your preferences"; worst case it reads as repetitive or as the system contradicting itself.
**Honesty risk: highest of the group.** The live 8-persona weighted match already has near-ties (CAPITAL_PRESERVATION vs. INCOME_STABILITY within 1–3 points, per the validation report §6.3) — a modest T1 shift from one Likert question is a plausible flip trigger, and it would flip visibly, on the exact page PR #38 (shipped the same day as the report) built specifically to make the persona assignment feel stable and explained (`why_fits_bullets`, `match_confidence`, `was_hard_override` are the verified transparency fields on this branch). Showing that assignment change for a question the user will recognise as a near-duplicate of one they already answered actively works against that trust-building goal.

### 3.2 Option (b): reorder steps so Beliefs precedes the first Analysis render

**Cost: expensive**, more than a route-order edit. `Beliefs.tsx` is written entirely on the assumption that Safety Lights already exist: it reads `analysis.result?.safety_lights` on mount (line 93), branches its top banner on `hasAnyRed`/`hasAnyAmber`/`allGreen` (lines 108–198), and its whole framing — "Tilts Currently Locked... locked until red Safety Lights are addressed" — presupposes the gate status is already known. Moving Beliefs earlier means either computing Safety Lights before Beliefs anyway (in which case you haven't actually solved the ordering problem, you've just moved the safety-lights call earlier and left the persona/beliefs order unresolved) or stripping the gate-status framing out of Beliefs and rebuilding it elsewhere. It also requires editing `StepIndicator.tsx`'s `ONBOARDING_STEPS` array (and its pinned test in `stepFlow.test.ts`) and every literal "Step 6"/"Step 7" reference sprinkled through `Target.tsx`'s copy.
**UX:** Removes the "why are we asking this" framing that currently opens Beliefs.
**Honesty risk:** Low on the specific persona-timing question (nothing would visibly change later), but high risk of regressing the safety-lights-gates-beliefs design that the current Beliefs screen is built around.

### 3.3 Option (c): defer persona *display*, not computation

Hide `PersonaCard` on the first Analysis render (`persona && beliefs.completed` instead of just `persona`, `Analysis.tsx:484`) and reveal it only once Beliefs is done.
**Cost:** Cheap–moderate, presentation-only.
**Important caveat:** on its own, this **does not deliver rec 9** — it only hides an early reveal of a persona that's still computed from intake-only data. If the goal is genuinely to let Q_VOLATILITY_COMFORT influence the assignment, (c) has to be paired with (a); alone it just removes an early positive touchpoint (the "here's who you are" moment right after Holdings) for no engine benefit.
**Honesty risk:** Low if paired with (a) (one reveal, correctly timed); mildly negative on its own (delays gratification, changes nothing).

### 3.4 Option (d): compute twice — draft, then confirmed — and show the delta

Add a second result slot (e.g. `analysis.draftResult`), run analysis once pre-Beliefs and once post-Beliefs, and present both with an explicit "this may refine after your preferences" framing plus a delta explanation if they differ.
**Cost: expensive.** New state shape, a second POST path, and materially new copy/UI — the current Analysis screen (Overall Status Banner, "Here's the investing stance we heard") reads as confident and final; retrofitting a draft/confirmed distinction changes that tone for every user, not just the edge case where T1 actually moves.
**UX/honesty:** Arguably the most honest *if* the delta is well explained — it doesn't hide the update, it frames the first pass as provisional from the start. But that's a disproportionate amount of new surface area and copy to build and maintain for one redundant question.

### 3.5 Option (e): other patterns

- The only genuine "recompute on return" precedent in the codebase is the `resetAnalysis()` idiom already covered under (a) — there's no other half-built solution sitting in the code to reuse.
- The one option not in the brief's list, and the one actually worth building if anything is: **the passive consistency footnote from §3.0.** No re-analysis, no server contract change, no step-order dependency, no persona-display change — it reads two values already in the store and shows a client-only note. Cost/UX/risk are all effectively negligible, because it never touches the persona engine or its display.

### 3.6 Summary table

| Option | Delivers rec 9's stated goal? | Cost | Persona visibly changes mid-flow? | Honesty risk |
|---|---|---|---|---|
| (a) Re-analysis pass | Yes | Moderate | Yes | High |
| (b) Reorder steps | Yes | Expensive | No (computed once, correctly late) | Low on timing, high on regressing Beliefs' own UX |
| (c) Defer display only | No (cosmetic unless paired with (a)) | Cheap–moderate | N/A alone | Low, but doesn't solve the ask |
| (d) Draft + confirmed | Yes | Expensive | Yes, but explicitly framed | Low–moderate |
| (e) Passive consistency footnote | Partially — delivers the "consistency check" half of rec 9, not the "second reading" half | Cheap | No | Negligible |

---

## 4. Recommendation

**Don't build the active bridge (options a/b/d).** Three independent reasons converge:

1. **The report already answered this.** §3.4/§4 of the validation report establish `risk_comfort` and `Q_VOLATILITY_COMFORT` as the same underlying construct, captured twice, at different points in the flow, in different input formats (categorical vs. 5-point Likert). D-rec 9 itself offered "or drop the duplication" as the alternative to wiring it — that alternative is the cheaper, evidence-consistent choice, not a fallback.
2. **The persona set has borderline pairs that make an active bridge riskier than it looks.** CAPITAL_PRESERVATION vs. INCOME_STABILITY sit 1–3 points apart in the weighted match (report §6.3); nudging T1 from a second, weaker reading of a question already asked is a plausible way to flip that boundary, and the flip would be visible on the persona card the same day the presentation layer (PR #38) shipped specifically to make that assignment feel stable and explained. A redundant question causing a visible persona change is a worse user experience than the current state (no bridge at all).
3. **Cost doesn't justify the juice.** Every active option is moderate-to-expensive engineering (a step-flow branch, a lifted store action, a full reorder, or a new draft/confirmed UI) to move one trait by a small, uncalibrated amount, for a construct the engine already measures adequately from `risk_comfort` alone.

**Working default, adopted now under the no-decision-gates norm (reversible):**
- **D-rec 9 closes as "accepted redundancy, not wired."** `risk_comfort` (Step 3) remains T1's only input; `Q_VOLATILITY_COMFORT` (Step 6) continues to feed only the belief-tilt/scenario pipeline (`VOLATILITY_AVERSION` axis in `Target.tsx`'s scenarios), which is a legitimate and already-working use of that answer — it's just not also a persona input, and doesn't need to be.
- No code changes needed to close this — it's a documentation/backlog-status action: mark D-rec 9 resolved in the validation report's action ledger (§8) so it doesn't linger as an apparently-open item.

**Genuinely new decision, not covered by the above:** whether the cheap passive consistency footnote (§3.5/(e)) is worth building at all — it's additive, not corrective, and nobody has asked for it yet. That's a real "should we build this" call for Tom, not a re-litigation of the no-bridge decision above, so it's written up as a small, standalone, do-or-don't plan rather than executed:

→ `docs/superpowers/plans/2026-07-02-beliefs-risk-consistency-footnote-plan.md`
