# Beliefs risk-consistency footnote — optional plan (not authorised)

> **Status: NOT a decision gate on already-shipped work.** This is a new, small, opt-in feature proposal surfaced by `docs/2026-07-02-rec9-persona-beliefs-bridge-analysis.md` §3.5. Nobody has asked for it. Do not execute without Tom's go-ahead.

> **For agentic workers:** if approved, use superpowers:test-driven-development for the scoring/comparison helper — it's pure client-side logic and should be unit-tested like the neighbouring `lib/beliefImpact/*` helpers.

**Goal:** Give the Beliefs step (Step 6) a small, honest way to surface that its `Q_VOLATILITY_COMFORT` question measures the same thing as Step 3's `risk_comfort` — without wiring either into the persona engine (the rec-9 analysis recommends explicitly against that; see the linked doc for why).

**Non-goals:** does not change `personaEngine.ts`, `analysis.ts`, or the `/api/onboarding-v2/analyse` payload. Does not trigger any re-analysis. Does not change persona display timing.

**Why this is cheap and low-risk:** `intake.risk_comfort` and `beliefs.responses.Q_VOLATILITY_COMFORT` are both already present in `useOnboardingV2Store()` by the time Beliefs renders (intake is captured in Step 3, long before Step 6). This is a pure read of two existing values — no network call, no store schema change, no dependency on navigation order.

---

### Task 1: Comparison helper

**Files:**
- Add: `client/src/lib/beliefImpact/compareRiskConsistency.ts`
- Test: `client/src/lib/beliefImpact/compareRiskConsistency.test.ts`

- [ ] Write a pure function `compareRiskConsistency(riskComfort: string, volatilityResponse: BeliefResponse | undefined): { verdict: 'CONSISTENT' | 'MORE_CAUTIOUS' | 'MORE_RISK_TOLERANT' | 'INSUFFICIENT_DATA'; note: string }`.
  - Map `risk_comfort` (`very_low`/`low`/`moderate`/`medium`/`high`/`very_high`) onto the same −1..+1 scale `normaliseAnswer` already uses for belief responses (reuse the existing `riskMap` values from `personaEngine.ts`'s `computeRiskAppetite` as the reference midpoints — do not duplicate a second ad hoc mapping).
  - Compare against `volatilityResponse.normalised` (already computed and stored by `setBeliefResponse`). A gap under ~0.4 → `CONSISTENT`; the belief answer meaningfully more cautious → `MORE_CAUTIOUS`; meaningfully more risk-tolerant → `MORE_RISK_TOLERANT`; missing `risk_comfort` or no response yet → `INSUFFICIENT_DATA`.
  - Write the note copy in plain language, e.g. *"Your answer here reads as more cautious than your Step 3 risk answer — both are noted; neither overrides the other."* Explicitly do not use match-%, scores, or persona language in the copy (matches the report's §7.3 "no user-facing match-%" default).
- [ ] Unit tests: consistent pair, both-cautious-directions mismatches, missing risk_comfort, missing belief response.

### Task 2: Surface it in Beliefs.tsx

**Files:**
- Modify: `client/src/pages/onboarding-v2/Beliefs.tsx`

- [ ] Only after `Q_VOLATILITY_COMFORT` has been answered (reuse `beliefs.responses.Q_VOLATILITY_COMFORT`), render a small, dismissible-style info note (visually consistent with the existing Transparency/Methodology collapsibles, not another gate banner — this is informational, not a gate) showing `compareRiskConsistency(...)`'s note.
- [ ] Do not gate `allAnswered`/Continue on this — it's advisory only, same posture as the existing Transparency section.
- [ ] Add a `data-testid="risk-consistency-note"` for future test coverage.

### Task 3: Verify against golden-case style used elsewhere

- [ ] Confirm no existing `tests/onboardingV2.test.ts` or `stepFlow.test.ts` assertions break (this task adds a new UI element and a new pure helper; it should not touch step counts, step order, or the analyse payload).
- [ ] Manual pass in the running app: answer Step 3 with a low-risk answer, then Step 6's volatility question with a high-agreement ("strongly agree" on comfort with fluctuation) answer, and confirm the note reads as a mismatch, not silently absent.

---

**Estimated cost:** Cheap (one new pure-function file + its test, one small addition to an existing page). No server, no engine, no step-flow changes.
**Decision needed before starting:** whether this is worth building at all given nobody requested it — flag to Tom.
