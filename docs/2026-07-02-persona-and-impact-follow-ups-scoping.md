# Scoping: persona layer, before/after impact, and persona-set validation

**Status:** scoping — for discussion, not a build plan yet
**Date:** 2026-07-02
**Inputs:** Werner's investor-demo feedback (Slack, 2026-07-02 10:16–10:24, six screenshots of the legacy wizard journey); Tom's user-perspective value chain from early investor demos; investor-demo meeting notes (Unlock-relevant items only); the shipped belief-impact flow (PR #31).

## 1. The user-perspective value chain (what demos proved)

From early investor demos, the highest-value arc was:

1. Onboard: input investments, profile yourself, input your beliefs.
2. **"Here's your persona, and the standard portfolio for that profile."**
3. "Here's the economic impact if the things you believe will happen actually happen."
4. Impact on the standard profile + **options to improve the impact on YOUR portfolio, based on what YOU believe** — not what anyone else thinks.
5. **"If you took action, here's what the impact would be."**

Framing (Werner, verbatim intent): *at the end of onboarding you should know what to do next. Not advice — given these indicators, this is probably worth reviewing; if you structured your portfolio like this, this may happen; no guarantee; the onus is on the investor to review and decide.*

## 2. Gap map vs the shipped flow (PR #31)

| Value-chain step | Status today |
|---|---|
| 1. Investments / profile / beliefs input | ✅ intake → holdings → beliefs → outlook |
| 2. Persona + persona standard portfolio | ◐ **engine exists, presentation missing** — see correction below |
| 3. Impact if beliefs happen | ✅ tiered impact + income runway (cited episodes) — on the actual portfolio only |
| 4. Standard-profile impact + belief-driven options | ◐ belief-driven alternatives exist; persona-standard comparison missing |
| 5. Post-action impact ("if you took action") | ❌ missing — moves are shown, but impact is never re-run on the post-action mix |

## 3. Workstream A — before/after impact replay (build first; unambiguous)

Close the loop on step 5. Every engine already exists: take the alternatives' target mix, re-run alignment + tiered impact + income runway on it, and render before → after alongside the staged moves (e.g. "alignment 60 → 84; worst-episode trough −21% → −12%; runway 10 → 19 months"). No new modelling; highest demo value per unit of work. Same non-advice framing and labels as the rest of the flow.

## 4. Workstream B — persona layer (needs one design decision first)

Restore the persona beat the demos proved (step 2 + the persona half of step 4):

- Map the investor's answers to a persona and present it with the persona's standard/reference portfolio.
- Show the belief-impact on the persona standard next to the impact on their actual portfolio.

**Decision required before building: anchor vs input.**
- *Anchor* (recommended): the persona is a framing device — a recognisable identity plus a reference mix to compare against. Compliance-safe; matches the "indicators, onus on investor" posture.
- *Input*: the persona feeds the recommended target mix. Materially closer to advice; not recommended without compliance review.

**Do not carry over from the legacy wizard:** the "forecast uplift 6–12%" performance-promise banner; the cumulative worst-case that sums all selected scenarios simultaneously (including benign ones); the self-contradicting gap commentary; the 0-actions/0%→0% staging bugs. The journey shape was right; those mechanics were the documented reasons the wizard was retired.

## 5. Workstream C — persona-set validation (the "right personas" question)

> **Correction (2026-07-02 forensic audit — see `2026-07-02-legacy-wizard-forensic-audit.md`):** the flow already HAS a live persona engine. `server/services/personaEngine.ts` (8 primary personas + T1–T6 behavioural traits, hard overrides for dominant asset identities) runs inside `analyzeOnboarding` and renders on the v2 Analysis screen today. What's missing is the demo-praised *presentation* (match-% badge, persona reference portfolio, persona-vs-actual comparison, gallery) — so Workstream B is a presentation + reconciliation job, not a from-scratch engine build. The count below is therefore FOUR sets, and two incompatible `match_score` semantics exist between the legacy and live engines.

Four divergent persona sets exist today:

| Set | Where | Notes |
|---|---|---|
| 19 "Investment Personas" (P001–P019) | this repo, `client/src/data/personas.ts` (+ `personaRules.ts`; quiz UI deleted in `c7c7504`, matcher recoverable from git) | The demoed wizard's set; 8-dimensional scores + operative metadata (liquidityMonths, drawdownCap, biases, concentration tolerance) that parameterises portfolio rules |
| 8 live "Persona Engine v2" personas + T1–T6 traits | this repo, `server/services/personaEngine.ts` — live in the v2 flow | Hand-tuned weights; hard overrides (business/property/crypto dominance); no user-facing match % |
| 10 P-codes × 4 motivational engines | vault canon (`Context/brand.md`, `Context/operator.md`, `Context/market.md`) | Explicitly named the canonical persona model for how HNW investors think |
| 3 year-1 bullseye personas | Unlock content brain (`describe_unlock`) | The ICP/marketing bullseye, not necessarily the product taxonomy |

These may be answering different questions (product placement vs behavioural model vs ICP targeting), but nothing currently documents how they relate — and the onboarding product should not ship a persona presentation layer while the sets are unreconciled.

**Evidence finding (audit §1.3):** the "built from ONS wealth surveys, FCA segmentation studies, global wealth reports" line shown in the demo UI is unsubstantiated — no source data or derivation exists in the repo; the 19 personas trace to a pasted, hand-authored file. Validation task 2 below is therefore not a formality: ground the claim or cut the copy.

**Validation tasks:**
1. Reconcile the three sets: same taxonomy at different grains, or genuinely competing models? Document the relationship.
2. Evidence audit of the 19: trace each persona to the claimed sources (FCA Financial Lives / segmentation studies, ONS Wealth & Assets Survey, Knight Frank Wealth Report, other credible wealth-segmentation research). Mark each persona **corroborated / partially corroborated / unsupported**.
3. Coverage check against the target market (HNW £500k–£25M cohort): missing personas? over-split personas? wrong tiers?
4. Output: one product persona set with named sources, recorded as a decision, and one source of truth for the data (repo or brain, referenced by the other).

**Long-run (design seam now, build later):** persona creation/refinement from observed data. The per-investor sessions and per-screen feedback capture already shipped provide the observational base; define how observed answer/portfolio clusters propose new or adjusted personas (human-approved, never auto-shipped).

## 6. Workstream D — question→persona mapping audit

Verify that what we ask can actually place an investor into the persona set: profiling/intake fields, the 8 beliefs questions, the B1–B15 outlook statements, and the asset-register (holdings/wrappers) inputs.

- Build a coverage matrix: question → persona dimension(s) it discriminates.
- Flag questions that map to nothing (dead inputs) and persona dimensions no question reaches (unidentifiable personas).
- Note: the legacy wizard's `personaRules.ts` mapped *its* questionnaire to the 19; the new flow's questions were designed for beliefs/outlook scoring, not persona placement — so gaps are expected and must be found deliberately, not assumed away.

## 7. Small backlog (from the demo meeting notes)

- Portfolio wrappers step: add a **"Not applicable"** option.
- **Plain-language pass** over portal terminology (pairs with the screen-help content added on PR #31 — the drawer explains screens, but the screens themselves still carry jargon).
- Already shipped, no action: private links for investor sessions; per-screen feedback categorisation.

## 8. Suggested order

1. **A** — before/after impact replay (small, unambiguous, biggest demo payoff).
2. **C1–C2** — persona reconciliation + evidence audit (research, no code; unblocks the design decision).
3. **B** — persona layer, once the set is validated and anchor-vs-input is decided.
4. **D** — question→persona audit alongside B's design.
5. **Backlog items** — bundled into any nearby UI PR.
