# Belief→Impact→Alternatives design

**Date:** 2026-07-01
**Status:** approved by Tom, pending implementation plan
**Background:** `Intelligence/research/2026-07-01-unlock-og-onboarding-belief-impact-alternatives-V1.md` (vault) — read that first, not re-derived here.

## Goal

Rebuild the OG mechanism Tom identified as the actual value: ask macro-outlook beliefs (not asset-price predictions), map them to likely second-order impact on the user's real portfolio using cited historical data, show alternatives that reduce that impact, and flag when self-identified risk tolerance doesn't match actual portfolio concentration.

Keep the existing style-tilt belief step (`Beliefs.tsx`, feeds `NextSteps.tsx`'s tilt application) unchanged. This is new, additive surface: outlook step → impact/alignment/mismatch results → alternatives, inserted between the existing Beliefs step and NextSteps.

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

Tier 1 and tier 2 impact statements must be visually/copy-distinct in the UI — cited replay and illustrative-anchor carry different evidentiary weight and must not blend into one number that reads as equally precise.

## 2. Belief input — reuse, don't rebuild

`client/src/data/beliefQuestions.ts` (B1–B15) already exists in the current repo, unused (zero imports; `Beliefs.tsx` has an unrelated same-named local constant for the style-tilt set — a naming collision, not the same data). Its question style already matches what Tom described: macro/world-condition statements (AI job disruption, government debt control, energy/geopolitical shocks, property, sterling, credit availability), not direct asset-price predictions. Reuse this file's content unchanged as the new "Your outlook" step.

Each question carries a `weights: Record<ScenarioName, number>` against 8 named scenarios (AI Recession, Property Crash, Stagflation, Debt Spiral, Tech Burst, Sterling Devaluation, Energy Shock, Rate-Cut Reflation) and a `direction` field (`"higher->X"` or `"lower->X"`) indicating whether agreement or disagreement raises that scenario's likelihood.

## 3. Belief scoring — extend the existing graduated mechanism

`onboardingV2Store.ts` already has a tested, graduated (not binary) mechanism for the style-tilt axes:

```
normaliseAnswer(1..5) = (answer - 3) / 2   // -1.0 .. +1.0 in 0.5 steps
```

Strongly Agree/Disagree → ±1.0 ("convinced"); Agree/Disagree → ±0.5 ("probably"); Neutral → 0. This already distinguishes conviction from mere lean — extend it to B1–B15 rather than inventing a new scale.

Extension needed (B1–B15 is many-questions-to-few-scenarios, unlike the 1:1 style-tilt axes):

1. **Sign per question, per `direction`.** For `"lower->X"` questions, invert the normalised score before applying (same inversion pattern already used for `VOLATILITY_AVERSION`, applied per-question here instead of per-axis).
2. **Clamp each question's contribution to a scenario at zero before summing.** A belief pointing away from a scenario contributes nothing to it — it does not subtract from or cancel a separate belief pointing toward that same scenario from a different question. (Confirmed with Tom 2026-07-01.)
3. **Sum contributions per scenario, then normalise the 8 scenario totals to sum to 1** — this becomes the `scenarioWeights` input `computeGap.ts` already accepts (e.g. `{S007:0.6, S009:0.4}` today; here `{Stagflation: 0.6, "Property Crash": 0.4}`-shaped).

## 4. Belief→impact bridge (the new design surface)

Each of the 8 named scenarios needs a mapping onto tier-1/tier-2 episodes or stress-scenarios already in the repo — this replaces the role OG's fabricated `S001`–`S010` matrix played, using real data instead. Illustrative starting mapping (final editorial mapping is a build-time task, not decided here):

- Stagflation → `STAGFLATION_1973` + `RATE_SHOCK_2022` episodes (tier 1: uk-equity/govt-bonds/cash)
- Property Crash → `PROPERTY_DOWNTURN` stress scenario (tier 2) + property's episode coverage in `DOTCOM_2000`/`GFC_2008`/`COVID_2020`
- AI Recession / Tech Burst → `TECH_CORRECTION` stress scenario + `DOTCOM_2000` episode (us-equity)
- Debt Spiral / Sterling Devaluation → `RATE_SHOCK_2022` + `STAGFLATION_1973` (bond/gilt stress)
- Energy Shock → `RATE_INFLATION_SHOCK` stress scenario, `STAGFLATION_1973` episode
- Rate-Cut Reflation → benign/upside scenario; may need different narrative framing (sensitivity, not a "hit") rather than a drawdown number

## 5. Scoring — reuse `computeGap.ts`'s math, new taxonomy

Reuse unchanged: `beliefAlignmentNow/Target = 100 * (1 - L1/2)`, HHI/`nEffNow`/`nEffTarget`, `isCautious()` liquidity-floor logic, the >35% concentration flag. Recompute over the 8-bucket `episodeLibrary` taxonomy instead of the fabricated 16-bucket `CANONICAL_BUCKETS`. Tier-3 holdings are excluded from the alignment score's denominator (normalised over tier-1/2 only, same pattern `mixFromHoldings()` already uses for `unmodelledShare`) and surfaced as a separate "£X (Y%) not modelled, because Z" line — never blended into the score.

This is also the substrate for the self-identification mismatch Tom described (low-risk self-report + high concentration): `isCautious()` + the concentration flag + `hhiNow`, already present, applied to the real current mix.

## 6. Alternatives

Reuse `actions/engine.ts`'s `buildActions` mechanics (trim/add/transfer staging, liquidity-floor raise, cost estimate) — algorithm-generic, just needs a bucket list. Do NOT reuse `targetEngine.ts` (welded to `S001`–`S010` and `CANONICAL_BUCKETS`, and to hardcoded persona-ID rules like `P016`/`P003`). Write new target-mix-construction logic driven by belief-weighted tier-1/2 exposure instead.

## 7. Flow

Existing style-tilt `Beliefs.tsx` (unchanged) → new "Your outlook" step (B1–B15) → results page (alignment score, concentration/mismatch flags, per-bucket impact: tier 1 shown as cited replay, tier 2 labelled "illustrative, anchored to [episode/stress-scenario]", tier 3 listed by name as unmodelled with reason) → alternatives (`buildActions`-driven) → `NextSteps.tsx` (unchanged).

## Open items (not blocking this design, tracked for the implementation plan)

- Europe/emerging-equity need at least a modern-era sourced series before functioning as tier 2 (currently zero coverage).
- Final belief-scenario→episode mapping table (§4) needs full editorial pass at build time.
- Rate-Cut Reflation's narrative framing (upside, not drawdown) needs its own copy treatment.
- Compliance review (`consumer-duty-reviewer` / `fca-guidance-checker`) once implementation is scoped — this surface sits close to implied-suitability/Targeted-Support territory (PS25/22), per the source research note.
