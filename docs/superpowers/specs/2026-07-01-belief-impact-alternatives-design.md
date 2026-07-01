# Belief→Impact→Alternatives design

**Date:** 2026-07-01
**Status:** approved by Tom (v2, post-audit), pending implementation plan
**Background:** `Intelligence/research/2026-07-01-unlock-og-onboarding-belief-impact-alternatives-V1.md` (vault) — read that first, not re-derived here.

## Goal

Rebuild the OG mechanism Tom identified as the actual value: ask macro-outlook beliefs (not asset-price predictions), map them to likely second-order impact on the user's real portfolio using cited historical data, show alternatives that reduce that impact, and flag when self-identified risk tolerance doesn't match actual portfolio concentration.

Keep the existing style-tilt belief step (`Beliefs.tsx`, feeds `NextSteps.tsx`'s tilt application) unchanged. This is new, additive surface: outlook step → impact/alignment/mismatch results → alternatives, inserted between the existing Beliefs step and NextSteps.

**Priority framing (confirmed 2026-07-01):** this is an illustration/simulation tool — it holds no funds and takes no execution action. Design priority is accuracy, value, and utility of the output, not minimizing distance from an advice threshold. Where a compliance question exists it's tracked and will get a sign-off pass before ship, but it does not gate this design or the implementation plan.

## The taxonomy problem this design solves

Tom rejected treating "how many buckets / how much history" as one global decision ("8 or 16 seems binary - not tailored - all assets don't need to go back to the same date"). Verified per-bucket coverage in `episodeLibrary.ts` (7 real cited episodes) confirms this: coverage ranges from full depth to 1929 (uk-equity, govt-bonds, cash) down to zero episodes at all (europe-equity, emerging-equity — taxonomy slots that exist but have never had a series attached). Any single bucket-count choice papers over this variance either way: 8 buckets undercounts real gaps within itself; 16 (`CANONICAL_BUCKETS`, the orphaned `targetEngine.ts` taxonomy) invents granularity real intake never populates (`Holdings.tsx` only ever captures 6 asset classes × 6 regions).

## 1. Tier architecture

Every bucket in `episodeLibrary.ts`'s 8-bucket taxonomy (the one real intake actually populates) gets a fixed tier classification — assigned once, not re-judged per episode:

| Tier | Buckets | Treatment |
|---|---|---|
| 1 — episode-replay | uk-equity, govt-bonds, cash, us-equity | Literal cited historical episode data, shown as-is |
| 2 — modern-anchor illustrative | property, global-equity, europe-equity*, emerging-equity* | `stressScenarios.ts`-style: illustrative but historically-calibrated, cited anchor shown, explicitly labelled as illustrative (not literal replay) |
| 3 — explicitly unmodelled | alternatives, PE, structured, crypto, collectibles, FX (anything `bucketFor()` returns `null` for) | Excluded from the alignment score; named individually in the impact narrative with a stated reason ("no reliable long-run history exists for this asset class"), never silently folded into `unmodelledShare` without disclosure |

\* Europe-equity and emerging-equity are tier 2 **only once sourced**. They currently have zero episode data at all (not even modern-era), so until a modern-era MSCI Europe/EM series is sourced (a prerequisite build task, tracked separately, not blocking this plan), they ship as tier 3 — "not yet modelled" — rather than being silently treated as tier 2 with no data behind them.

Tier 1 and tier 2 impact statements must be visually/copy-distinct in the UI — cited replay and illustrative-anchor carry different evidentiary weight and must not blend into one number that reads as equally precise. This distinction must also reach the **headline alignment score** (see §5), not just the per-bucket narrative.

## 2. Belief input — reuse, don't rebuild (with 3 corrections)

`client/src/data/beliefQuestions.ts` (B1–B15) already exists in the current repo, unused (zero imports; `Beliefs.tsx` has an unrelated same-named local constant for the style-tilt set — a naming collision, not the same data). Its question style matches the founder's requirement — macro/world-condition statements, not direct asset-price predictions — for 12 of 15 questions. Reuse those unchanged.

**Three questions leak the asset-price prediction they were designed to avoid, and need rewriting before use** (found in audit, confirmed with Tom 2026-07-01):

| ID | Problem | Draft replacement (Tom to finalize wording/tone) |
|---|---|---|
| B7 | "For a 30-year-old today, renting is a better choice than buying" is a disguised property-price call | "Remote and flexible working will reduce demand for city-centre housing over the next 5 years." (housing-demand driver, not a price/investment call; keeps `direction: higher->Property Crash`) |
| B8 | "Investing in local businesses… is more attractive than investing in property" is a direct investment-attractiveness comparison, functionally "is property a bad investment" | "UK housing supply will increase enough over the next 5 years to meaningfully improve affordability." (supply/policy driver; keeps `direction: higher->Property Crash`, weight TBD) |
| B10 | "The pound will depreciate against the dollar and euro" *is* the FX call, not a belief that implies one | "International investors will lose confidence in the UK's fiscal position over the next 2 years." (causal antecedent of currency weakness; keeps `direction: higher->Sterling Devaluation`) |

These drafts are placeholders for Tom's edit pass, not final copy — the fix that matters is structural (causal-antecedent framing, not asset-price framing); exact wording is a domain-judgment call.

Each question carries a `weights: Record<ScenarioName, number>` against 8 named scenarios (AI Recession, Property Crash, Stagflation, Debt Spiral, Tech Burst, Sterling Devaluation, Energy Shock, Rate-Cut Reflation) and a `direction` field (`"higher->X"` or `"lower->X"`) indicating whether agreement or disagreement raises that scenario's likelihood.

## 3. Belief scoring — extend the existing graduated mechanism (scenario-level clamp)

`onboardingV2Store.ts` already has a tested, graduated (not binary) mechanism for the style-tilt axes:

```
normaliseAnswer(1..5) = (answer - 3) / 2   // -1.0 .. +1.0 in 0.5 steps
```

Strongly Agree/Disagree → ±1.0 ("convinced"); Agree/Disagree → ±0.5 ("probably"); Neutral → 0. This already distinguishes conviction from mere lean — extend it to B1–B15 rather than inventing a new scale.

**Aggregation (revised 2026-07-01 — supersedes the original per-question clamp):**

1. **Sign per question, per `direction`.** For `"lower->X"` questions, invert the normalised score before applying (same inversion pattern already used for `VOLATILITY_AVERSION`, applied per-question here instead of per-axis).
2. **Sum signed contributions *within* each scenario first** (a question's normalised score × its weight for that scenario). Where multiple questions feed one scenario (e.g. Property Crash: B7, B8, B14), this lets agreeing and disagreeing questions net against each other for that scenario — the original per-question clamp let one agreed-with question fully drive a scenario while contradicting answers to the *same* scenario contributed nothing, which is a real accuracy defect, not just a style concern.
3. **Clamp the scenario's *total* at zero**, not each question individually. This preserves the intended non-cancellation behaviour *across* different scenarios (a belief pointing away from Stagflation still shouldn't cancel a separate belief pointing toward Property Crash) while fixing the intra-scenario netting problem.
4. **Normalise the 8 clamped scenario totals to sum to 1** — this becomes the `scenarioWeights` input `computeGap.ts` already accepts (e.g. `{S007:0.6, S009:0.4}` today; here `{Stagflation: 0.6, "Property Crash": 0.4}`-shaped).

**Edge case to handle explicitly:** if all 8 scenario totals clamp to zero (e.g. an all-Neutral response set), step 4's normalisation is undefined (0/0). Fallback: treat as "insufficient signal" and either show an equal 1/8 weighting or skip the belief-impact section with an explicit "not enough signal to model" state — implementation plan to pick one, not a silent divide-by-zero.

This also resolves a data conflict found in audit: `beliefQuestions.ts` B12 (`Rate-Cut Reflation: +0.30, AI Recession: -0.10, Debt Spiral: -0.10`) has negative cross-scenario weights that the original per-question clamp would have zeroed out entirely, making that authored data permanently inert. Under the scenario-level clamp, B12's negative contributions correctly net against other questions feeding AI Recession/Debt Spiral instead of being discarded.

## 4. Belief→impact bridge (the new design surface)

Each of the 8 named scenarios needs a mapping onto tier-1/tier-2 episodes or stress-scenarios already in the repo — this replaces the role OG's fabricated `S001`–`S010` matrix played, using real data instead. Illustrative starting mapping (final editorial mapping is a build-time task, not decided here):

- Stagflation → `STAGFLATION_1973` + `RATE_SHOCK_2022` episodes (tier 1: uk-equity/govt-bonds/cash)
- Property Crash → `PROPERTY_DOWNTURN` stress scenario (tier 2) + property's episode coverage in `DOTCOM_2000`/`GFC_2008`/`COVID_2020`
- AI Recession / Tech Burst → `TECH_CORRECTION` stress scenario + `DOTCOM_2000` episode (us-equity)
- Debt Spiral / Sterling Devaluation → `RATE_SHOCK_2022` + `STAGFLATION_1973` (bond/gilt stress)
- Energy Shock → `RATE_INFLATION_SHOCK` stress scenario, `STAGFLATION_1973` episode
- Rate-Cut Reflation → benign/upside scenario; may need different narrative framing (sensitivity, not a "hit") rather than a drawdown number

## 5. Scoring — reuse `computeGap.ts`'s math, new taxonomy, de-precisioned headline

Reuse unchanged: `beliefAlignmentNow/Target = 100 * (1 - L1/2)`, HHI/`nEffNow`/`nEffTarget`, `isCautious()` liquidity-floor logic, the >35% concentration flag. Recompute over the 8-bucket `episodeLibrary` taxonomy instead of the fabricated 16-bucket `CANONICAL_BUCKETS`. Tier-3 holdings are excluded from the alignment score's denominator (normalised over tier-1/2 only, same pattern `mixFromHoldings()` already uses for `unmodelledShare`) and surfaced as a separate "£X (Y%) not modelled, because Z" line — never blended into the score.

This is also the substrate for the self-identification mismatch Tom described (low-risk self-report + high concentration): `isCautious()` + the concentration flag + `hhiNow`, already present, applied to the real current mix.

**Headline score presentation (added post-audit):** the 0–100 alignment score itself must carry a qualitative band ("broadly aligned" / "partially aligned" / "misaligned") alongside the number, and a one-line caveat next to the headline itself — not only in supporting detail. A precise-looking integer computed from 15 five-point answers and a mix of cited and illustrative data overstates its own precision if shown bare; the band + caveat reduces false-precision/anchoring risk without diluting the number's usefulness.

## 6. Income/withdrawal-sustainability impact (elevated to in-scope, 2026-07-01)

**Gap identified in audit:** §5's impact model shows %-drawdown on portfolio *value* only. For a decumulation-stage user, sequence-of-returns risk means a shock that coincides with ongoing withdrawals can permanently impair the portfolio even after the market-wide recovery shown in the episode data — value-only framing doesn't show this, and for this ICP it's arguably the most consequential accuracy gap in the whole design.

**Why this is in-scope now, not deferred:** the data this needs already exists and is already wired into an existing analysis payload — `annual_essential_spend_gbp`, `time_horizon_years`, and `liquid_cash_gbp` are captured in intake today and already flow into `Analysis.tsx`'s `runAnalysis()` payload. This is not blocked on new intake fields, only on new calculation logic — removing the dependency the decumulation review flagged as the reason to defer it.

**Design (episode-replay tier only, i.e. tier 1 buckets — property/global-equity's tier-2 illustrative treatment doesn't have the granular path data needed for a survival simulation):**

For each modelled episode, in addition to the existing %-value-impact number, compute: starting portfolio value, apply the episode's real cited path (already in `episodeLibrary.ts`'s `points` arrays) while subtracting `annual_essential_spend_gbp` pro-rated per step, and report whether/when the liquid+cash buffer (`isCautious()`'s existing floor logic) would have been exhausted before the episode's `recoveryIndex`. Output alongside the existing %-impact: a plain-language runway statement ("at your current spend, this episode's path would have used your full cash buffer before the {episode} recovery — you'd have needed to sell into the trough").

This extends the existing liquidity-floor mechanism rather than replacing it or requiring a new %-of-portfolio-vs-income-sustainability metric (e.g. Bengen/Kitces safe-withdrawal-rate) — that fuller framing remains a real, credible alternative for a future iteration, but this design's version reuses data and mechanisms already in the codebase and directly answers "does my plan survive this episode," which is the accuracy gap Tom flagged as urgent.

**Open dependency:** exact step-by-step withdrawal-pro-ration logic against `episodeLibrary.ts`'s uneven annual/monthly granularity (some episodes are annual, some monthly) is an implementation-plan-level detail, not decided here.

## 7. Alternatives

Reuse `actions/engine.ts`'s `buildActions` mechanics (trim/add/transfer staging, liquidity-floor raise, cost estimate) — algorithm-generic, just needs a bucket list. Do NOT reuse `targetEngine.ts` (welded to `S001`–`S010` and `CANONICAL_BUCKETS`, and to hardcoded persona-ID rules like `P016`/`P003`). Write new target-mix-construction logic driven by belief-weighted tier-1/2 exposure instead.

**Language layer (added post-audit, confirmed non-blocking per Tom):** alternatives are computed against the user's real holdings (this is deliberately kept — see Priority framing above, it's the source of the feature's utility) but presented with: illustrative framing throughout, no "recommend"/"you should" phrasing, and an explicit "this is a simulation, not advice" label before the alternatives render. These cost nothing in utility and improve output trust/transparency; they are not a compliance workaround. A full Consumer Duty / FCA PS25/22 sign-off pass (flagged to Tony Vine-Lott / William Corke in audit) is still tracked and will happen before ship, but does not gate this design or the implementation plan, per Tom's explicit call.

**Also flagged, not yet resolved:** the liquidity floor used in `buildActions` is currently a flat 20% (cautious) / 10% (other) regardless of withdrawal rate. Once §6's withdrawal-aware runway logic exists, the floor could become withdrawal-rate-sensitive rather than flat — worth revisiting once §6 ships, not blocking this design.

## 8. Flow

Existing style-tilt `Beliefs.tsx` (unchanged) → new "Your outlook" step (B1–B15, with B7/B8/B10 corrected) → results page (alignment score with qualitative band, concentration/mismatch flags, per-bucket impact: tier 1 shown as cited replay + withdrawal-runway statement where applicable, tier 2 labelled "illustrative, anchored to [episode/stress-scenario]", tier 3 listed by name as unmodelled with reason) → alternatives (`buildActions`-driven, illustrative language) → `NextSteps.tsx` (unchanged).

## Appendix: alternative formulas considered (per audit, only where a credible alternative genuinely existed)

| Component | Chosen | Credible alternatives considered | Why not chosen |
|---|---|---|---|
| Alignment score | `100*(1-L1/2)` (mathematically the overlap coefficient / 1−Total-Variation-Distance between two mix vectors) | Cosine similarity; tracking error / Sharpe-based divergence | Cosine measures angle not weight-overlap — less intuitive as a "%" figure for compositional vectors. Tracking error / Sharpe-divergence both need a return-covariance matrix this taxonomy doesn't have, and answer a different question (risk-adjusted return, not allocation similarity). |
| Concentration | HHI (`Σw²`) / `nEff = 1/HHI` | Entropy-based "effective number of bets" (factor-eigenvalue methods); max-single-position-% only | Entropy/eigenvalue methods need a correlation matrix — mismatched sophistication for an 8-bucket retail-facing display. Max-position-only is already present as a separate >35% flag, combined with HHI rather than substituted for it. |
| Belief aggregation | Linear opinion pool (weighted sum, scenario-level clamp, normalise) | Geometric-mean/log-linear pooling; Bayesian updating | Geometric pooling is actively incompatible with clamping (one zero input collapses the whole product). Bayesian updating needs calibrated conditional likelihoods this system's hand-authored weights don't have. Linear pooling is the standard method for combining uncalibrated independent judgments. |
| Belief-response scale | 5-point Likert with neutral midpoint | 4-point forced-choice (no neutral); 0–100% probability slider; confidence-weighted binary | Forced-choice manufactures false conviction from genuine "don't knows" on 15 unfamiliar macro topics — worse, not better, signal quality. Probability sliders have better calibration research pedigree in principle, but retail users are poorly calibrated on macro-economic probabilities, reintroducing the false-precision problem this design is otherwise careful to avoid. Confidence-weighted binary is a bigger UX lift than justified here. Mitigation for the neutral-midpoint satisficing risk: log per-question neutral-response rates as a data-quality signal. |
| Income-sustainability framing | Withdrawal-runway-vs-episode-path (§6) | Full safe-withdrawal-rate / "years of income" framing (Bengen/Kitces bucket-strategy style) | Bengen/Kitces framing is arguably the more decumulation-native long-term answer, but needs more structured planning-horizon modelling than this design's scope; the runway-vs-episode approach reuses data and mechanisms already in the codebase and ships the accuracy fix now. Worth a future iteration, not excluded on principle. |

## Open items (not blocking this design, tracked for the implementation plan)

- Europe/emerging-equity need at least a modern-era sourced series before functioning as tier 2 (currently zero coverage).
- Final belief-scenario→episode mapping table (§4) needs full editorial pass at build time.
- Rate-Cut Reflation's narrative framing (upside, not drawdown) needs its own copy treatment.
- All-Neutral zero-signal fallback (§3) needs a product decision (equal-weight vs. "not enough signal" state).
- §6's withdrawal pro-ration against uneven annual/monthly episode granularity needs implementation-level design.
- Liquidity floor becoming withdrawal-rate-sensitive (§7) once §6 ships.
- Vulnerable-customer handling path for the self-ID mismatch flag (none currently exists since the atomic-states system retired 2026-06-04) — tracked alongside the Consumer Duty/FCA sign-off pass, non-blocking per Tom's call.
- Compliance sign-off (Consumer Duty / FCA PS25/22) — tracked, assigned to Tony Vine-Lott / William Corke, non-blocking for this design/plan per Tom's explicit priority call 2026-07-01.
