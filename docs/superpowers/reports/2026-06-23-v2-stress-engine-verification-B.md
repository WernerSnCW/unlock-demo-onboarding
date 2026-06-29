# Verification report — v2 scenario-stress engine (Workstream B)

**Date:** 2026-06-23 · **Branch:** `feat/v2-scenario-stress-engine` (PR #4) · **Scope:** Workstream B of the scenario-sim + full-verification brief.
**Method:** unit-by-unit hand-derivation of maths + adversarial edge probing, data re-check against cited anchors, explicit challenge of 8 presuppositions, and dead-code resolution. No multi-agent orchestration (not opted in).

## Verdict

The deterministic stress engine and its step-7 satellites are **mathematically sound**. Every unit reconciles against its tests on a hand-derived golden case, and the documented edge cases (empty/all-cash/negative-value/missing-region/unmapped-class/divide-by-zero/protective-exclusion) are correctly handled. **No correctness defects** were found that would distort a number shown to a user.

What was found: one doc inaccuracy (F1), one display-convention inconsistency (F2), one low-severity edge case (F3), one data-presentation gap (D1), the dead-code resolution (which **corrects the brief's guess**), and a pre-existing type-check failure outside scope. All 8 presuppositions are either defended below or converted to a recommendation.

**Honest test baseline:** `npm test` → **254/254 green across 13 files** (post-B0 harness fix `ea75e42`).

---

## B1 — Unit-by-unit audit

### `lib/scenarioStress.ts` — core engine ✅
Hand-derived against all 10 tests. Golden (`equity/us £50k @ −0.40 = −20,000` + `equity/global £30k @ −0.25 = −7,500` + `bond/global £20k @ +0.05 = +1,000` = **−26,500**, pct **−0.265**) reconciles. Range = central × {0.7, 1.4} reconciles. Protective exclusion: `sameDirection` filter on `Math.sign(central)` excludes opposite-sign holdings; `grossMove` is the same-direction sum; `pctOfLoss = impact / grossMove` → 1.0 for the sole loss-maker. Guards: `total > 0 ?` and `grossMove !== 0 ?` both present → no NaN/divide-by-zero. All-cash → central 0, sign 0, no contributors. **Sound.**

- **F1 (doc, trivial):** `StressContributor.pctOfLoss` is documented (`scenarioStress.ts:14`) as "signed share of the **central impact**", but the code divides by `grossMove` (same-direction sum), not `centralImpactGbp`. These differ whenever protective holdings exist. The narrative copy ("X% of the move") matches the *code*; the comment is the wrong part. → **Fix the comment** (applied, see below).

> Note on range semantics for net-gain scenarios: if a portfolio nets a *gain* under a scenario (e.g. 100% govt bonds in EQUITY_DRAWDOWN, +4/+5%), the "severe" multiplier (×1.4) produces a *larger gain*, not a worse outcome. Not wrong (bonds genuinely rally in equity drawdowns and the copy reads "+X%"), but the multiplier semantics implicitly assume a loss. Covered under B3 #3.

### `lib/scenarioStressSalience.ts` ✅
`isSalient` uses `> 0.2`, exactly matching the store's `computeDirection` TOWARDS cutoff `score > 0.20` (`onboardingV2Store.ts:528-531`). `orderBySalience` is a stable partition (salient first, original order preserved within each group, nothing dropped; unknown ids fall to `rest`). **Sound.** Threshold coupling defended in B3 #4.

### `lib/scenarioStressView.ts` ✅
`signedPct` rounds `n*100` then signs from the rounded value (so −0.4% → "0%" with no sign, correct). U+2212 minus matches existing copy. `absPct` correct. Banned-verb compliance enforced by `tests/scenarioStressView.test.ts` + `tests/stressScenarios.test.ts`. **Sound.**

### `state/onboardingV2Store.ts:929-996` — belief-axis maths ✅
8 axes mapped from normalised responses; `VOLATILITY_AVERSION = −Q_VOLATILITY_COMFORT` (inversion correct). `computeDirection`/`computeIntensity` cutoffs (±0.20 NEUTRAL/LIGHT boundary, 0.50 MODERATE, etc.) consistent with the salience threshold. Tilt gate: ≥2 RED → `MULTIPLE_RED_FLAGS` lock; exactly 1 RED → single-flag lock; both set `tilts_allowed=false`. **Sound.**

### `tests/safetyLights.test.ts` subject (`server/services/analysis.ts`) ✅
35 tests cover liquidity (cash-runway months vs `min_cash_months`/`cash_amber_multiple`), concentration (`max_single_name_pct`/`concentration_amber_fraction`), illiquids (`max_weight_pct`/`amber_fraction`), policy-override propagation, zero-spend (`cash_runway=-1`, GREEN), zero-holdings (GREEN), and overall-status mapping. Thresholds are policy-driven, not magic. **Sound and thorough.**

### `lib/step7Helpers.ts` ✅ (one convention flag)
`computeDelta`/`computeDeltas`/`computeTotalMovement`, guardrail-impact mapping, change-bullets (top-3 movers ≥0.5pp), `checkRangesIdenticalAcrossScenarios` (toFixed(2) string compare with MISSING sentinel), example-portfolio normalisation (factor `100/total`), and monetary formatting all reconcile.

- **F2 (convention, low/med):** "Total movement" uses two conventions. `computeTotalMovement` (pp, `:59`) sums `|delta_pp|` **gross** — within a single dimension that sums to 100%, this double-counts a rebalance (X out + X in). `computeTotalMonetaryMovement` (£, `:523`) sums `|delta money|` then **÷2** (one-way turnover). They're shown in different contexts (scenario bands at `Target.tsx:727/732` vs example portfolios at `:377`), so not a side-by-side contradiction — but a sharp user comparing "8.0pp moved" to "~£20k reallocated" would find them ~2× inconsistent in concept. → **Recommendation:** pick one convention (one-way turnover is the financial norm) and apply it to both, or footnote that the pp figure is gross.
- Edge: `normaliseAllocations` divides by `total`; if every `example_pct` were 0, `factor = Infinity`. Not reachable with real bands (allocations sum > 0); noted, not fixed.

### `lib/scenarioInterpretation.ts` ✅ (one edge)
`computeScenarioSignals` (gross pp movement — same convention family as F2), `computeConvergenceScore` (pairwise band overlap ratio, clamped 0..1, averaged), threshold-driven copy selection.

- **F3 (edge, low):** `computeConvergenceScore` (`:64`) returns ratio `1.0` when `avgRange === 0`, so two zero-width bands at *different* points would falsely score as fully converged. It also compares bands **positionally by index** (`:52`), assuming identical band ordering across scenarios (engine-controlled, holds today). Thresholds `CONVERGENCE_THRESHOLD=0.90`, `MINIMAL_MOVEMENT_THRESHOLD=2.0`, `MATERIALLY_WIDER_THRESHOLD=2.0` are undocumented magic numbers → B3 #3.

### `lib/step9Helpers.ts`, `lib/reportNarrative.ts`, `lib/stepFlow.ts`
Covered by 48 tests now running post-B0 (17 + 20 + 11). No numeric core; copy/flow logic. Spot-clean; no action.

---

## B2 — Data audit of calibrated shocks (`data/stressScenarios.ts`)

Central shocks re-checked against the cited `historicalAnchor`s; all well-sourced and conservative (the ×1.4 severe reaches *toward* — usually slightly short of — the deepest historical figure, which is defensible for "illustrative"):

| Scenario | Spot-check vs anchor | Verdict |
|---|---|---|
| EQUITY_DRAWDOWN | equity global −0.34 = COVID MSCI World −34% ✓; severe ×1.4 = −47.6% vs GFC −54% (toward) ✓; bonds +0.04/+0.05 = flight-to-quality ✓ | Defensible |
| RATE_INFLATION (2022) | world eq −0.18 (≈MSCI World −18%) ✓; UK −0.02 (FTSE 100 ~flat) ✓; bond global −0.16 (Bloomberg Agg −16.25%) ✓; UK gilts −0.20 ✓; US bond −0.13 ✓ | Well-calibrated |
| TECH_CORRECTION | US eq −0.30 (Nasdaq 2022 −33%) ✓; severe ×1.4 = −42% | See D1 |
| PROPERTY_DOWNTURN | UK property −0.28 (between residential −19% and commercial −44%) ✓; severe ×1.4 = −39% | Defensible blend |

- **D1 (data presentation):** TECH_CORRECTION's anchor cites "Nasdaq −78% (2000–02)" but the broad `us` equity bucket can only reach ~−42% at severe. A reader comparing the cited −78% to the −42% severe range may read the model as under-representing its own worst case. → **Recommendation:** either drop the −78% citation (the bucket can't express it) or footnote that −78% was Nasdaq-Composite-specific (concentrated tech), broader US exposure less severe.

**Financial-domain-reviewer flags carried forward (taxonomy-inherent, disclosed by "Illustrative" labelling — not errors):** (a) UK-equity 2022 resilience is large-cap only; (b) `bond` shocks assume govt bonds (credit/HY/index-linked fell harder); (c) TECH anchor vs bucket gap (= D1); (d) listed REITs fell ~−50% in 2008 vs the property shock used in the equity-drawdown scenario. All stem from the one-dimensional taxonomy (B3 #5). **Recommendation:** keep the Illustrative labelling; add the D1 footnote; defer finer buckets to Workstream A.

No numeric data errors found.

---

## B3 — Presuppositions, challenged explicitly

1. **Mark-to-market £ values current & comparable across liquid/illiquid.** *Defended (disclosed):* the engine consumes whatever £ values the intake provides; staleness/illiquidity of property valuations is a data-input property, surfaced as "Illustrative". No fix in-engine.
2. **No cross-bucket correlation** — buckets summed independently. *Defended:* a deliberate simplification vs the deleted Monte-Carlo (which compounded correlated shocks — one of the 5 reasons it was cut). Real drawdowns are correlated; the deterministic model intentionally does not model this. State in copy if not already.
3. **Severity range = central × {0.7, 1.4}; interpretation thresholds 0.90/2.0/2.0.** *Weakest assumption.* The multipliers are arbitrary, not derived, and uniform across scenarios; the interpretation thresholds are undocumented. *Recommendation:* either document the rationale (and that ×1.4 ≈ "toward the historical worst") or make severity per-scenario (a natural Workstream-A item).
4. **Salience threshold 0.2.** *Defended:* deliberately coupled to the store's TOWARDS cutoff (`> 0.20`) — verified identical. Correct coupling.
5. **One-dimensional region taxonomy** (`uk/us/europe/global/emerging/other`). *Defended-with-cost:* cannot express large vs small-cap, govt vs credit, residential vs commercial — the root of B2 flags (a)(b)(d). *Recommendation:* finer buckets only if Workstream A wants them; otherwise footnote.
6. **No FX effect.** *Disclosed gap:* a GBP investor in USD assets carries GBP/USD risk; 2022 FTSE "flatness" was partly weak-GBP/energy. The model ignores currency. *Recommendation:* note as a known simplification; FX is a Workstream-A candidate, not a defect.
7. **`defaultShockByAssetClass` fallback.** *Verified safe:* each scenario sets `cash: 0.0` explicitly and provides sane asset-class defaults; an unmapped class with no default returns 0 (test-covered). No silent mis-default found.
8. **Beliefs are style/preference tilts, not macro forecasts.** *Defended:* the rebuild's core premise. Axis scores feed salience + step-7 tilts only; they never drive the stress shocks. UI copy ("intelligence, never advice"; "ranges show feasible directions, not targets") is consistent. Confirm no surface implies forecasting.

---

## Dead-code resolution (corrects the brief)

Grep-verified reachability:
- **Dead chain (safe to delete):** `POST /api/simulate` handler (`server/routes.ts:699-718`) → `server/lib/simulate/engine.ts` → `server/config/scenarioShocks.ts`. **No client code calls `/api/simulate`.**
- **NOT dead** (the brief guessed these were probably dead — they are live):
  - `config/buckets.ts` → used by `server/lib/recommend/narrate.ts`, `server/lib/gap/computeGap.ts`.
  - `config/personaDefaults.ts` (server) → used by `server/lib/recommend/targetEngine.ts`.
  - `config/scenarios.ts` (`SCENARIO_LABELS`) → used by `server/routes.ts`, `narrate.ts`, `client .../Target.tsx`.

**Recommendation:** delete only the three dead-chain files/handler, grep-gated. Held for explicit go (deleting a route handler) — see "Open for Tom".

---

## Verification gate

- **Tests:** 254/254 green (`npm test`).
- **Type-check (`npm run check`):** stress-engine units compile clean; **pre-existing, out-of-scope** errors remain in `server/services/factChecker.ts`, `server/services/marketData.ts`, `server/storage.ts` (last touched by unrelated commits, not the stress work). The branch does **not** type-check clean as a whole — flagged honestly; fixing is separate work.

---

## Applied vs open

**Applied this pass (zero-risk):**
- F1 — corrected the `pctOfLoss` doc comment.

**Open for Tom (decisions / non-trivial):**
- F2 — choose a single "total movement" convention (recommend one-way turnover for both) or footnote the pp figure.
- D1 — TECH anchor: drop the −78% citation or footnote it as Nasdaq-Composite-specific.
- Dead-code — green-light the grep-gated deletion of the `/api/simulate` chain (3 files/handler).
- Pre-existing type errors in `factChecker`/`marketData`/`storage` — separate cleanup; in scope for "test all the logic" only if you want it.
- B3 #3/#5/#6 (arbitrary multipliers, 1-D taxonomy, no FX) — natural inputs to the Workstream-A scenario-planner decision.
