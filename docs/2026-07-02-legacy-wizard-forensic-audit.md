# Forensic audit: legacy wizard → v2 enhancement capture

**Status:** audit record — feeds the companion scoping note (`2026-07-02-persona-and-impact-follow-ups-scoping.md`)
**Date:** 2026-07-02
**Method:** five parallel read-only audit lenses over the full repo — (1) journey & screens, (2) persona system, (3) engines, (4) action-plan/comparison/report surfaces, (5) cross-cutting UX/design — each judged against the shipped v2 flow (PR #31). Lens 4's subject surfaces were recovered from git history: the legacy wizard was deleted in `c7c7504`; the praised screens live at `c7c7504^:client/src/pages/InvestorPreferencesWizard.tsx` (7,232 lines). Nothing in the working tree was modified by the audit.

## 1. Headline findings (corrections to prior understanding)

1. **v2 already has a live persona engine.** `server/services/personaEngine.ts` (8 primary personas + T1–T6 behavioural traits, hard overrides for dominant asset identities, hand-tuned weights) is wired into the v2 flow via `analyzeOnboarding` and rendered on `Analysis.tsx`. The scoping note's original "persona layer missing entirely" is wrong as stated: **the engine exists; the demo-praised presentation does not** (no match-% badge, no persona reference portfolio, no persona-vs-actual comparison, no gallery).
2. **There are FOUR divergent persona sets**, not three: the legacy 19 (`client/src/data/personas.ts`, quiz UI deleted), the live v2 8 (`personaEngine.ts`), the canonical "10 P-codes × 4 motivational engines" (vault canon), and the 3 year-1 bullseye personas (content brain). Two incompatible `match_score` semantics exist between the first two (cosine-% vs weighted-sum gap).
3. **The "built from ONS wealth surveys, FCA segmentation studies…" credibility line is unsubstantiated.** No source data, derivation, or citation exists anywhere in the repo; the 19 personas trace to a pasted Python file (`attached_assets/persona_defs_*.py`). The validation workstream must ground the claim or cut the copy. Do not reuse the line until grounded.
4. **The "forecast uplift" banner is resolved.** It lived in the deleted wizard's Action Plan screen: a client-side card claiming **"2–25% annual improvement"** derived from total-change-pp bands (screenshot's "6–12%" was one band). Pure fabricated performance promise; confirmed do-not-port.
5. **The cumulative worst-case flaw is presentation-layer, not engine.** Every engine (target blend, sim shock blend) correctly normalises scenario weights; the "all scenarios simultaneously" stress was constructed in the UI. Guard v2 at the UI seam.
6. **A false-reporting bug shipped in legacy product copy:** the liquidity-shortfall flag (computed on the *current* mix only) is inverted into "meets the liquidity floor once changes are applied" (`why.ts:73`, `narrate.ts:106`) — target-mix compliance is never checked. Never replicate claim-without-check copy.

## 2. Consolidated enhancement backlog (deduped across lenses, ranked within tier)

### Tier 1 — feed the scoping workstreams directly

| # | Enhancement | Source lens | Lands on | Note |
|---|---|---|---|---|
| 1 | **Before/after impact replay** with side-by-side current-vs-target donuts + signed-arrow diff table | 3,4,5 | OutlookAlternatives | `mix`/`targetMix` already in memory; independently top-ranked by three lenses. Workstream A. |
| 2 | **Persona presentation layer**: match-% badge + persona code, reference-portfolio comparison, runner-up transparency, gallery with click-through detail | 2,4,5 | Analysis + a persona beat | Engine exists; reconcile sets first (Workstream C). Inherit: safer-persona tie-break (lower risk wins), aligned-dimensions explainability. |
| 3 | **Save Plan + Export CSV** for the illustrative plan | 4 | NextSteps | Port the wizard's persisted payload shape + Blob CSV; fix quoting, include stage 2; verify/rebuild the server route (likely dead post-`c7c7504`). |
| 4 | **Time-phased action bands** (IMMEDIATE / SHORT-TERM / LONG-TERM) | 1 | NextSteps | The concrete staging grammar from SnapshotReport. |
| 5 | **Scenario-conditional resilience questionnaire** (~19 "Refine" questions: job security under the chosen scenario, % property equity you'd liquidate in a crash, cash-buffer months…) | 1 | optional module after OutlookResults | Richest untapped content; legacy never persisted the answers. Feeds runway/friction modelling. Progressive-deepening loop: coarse result → invite refinement → visibly richer result. |
| 6 | **Belief-alignment score now→target** | 3,4 | OutlookResults/Alternatives | Keep the 0–100 device; recompute against stress outcomes (v2 scenarioStress), not L1 distance to a hand-authored template. |
| 7 | **Effective-N diversification card** (ΔHHI + "N: 10.4 → 5.5") | 3,4 | OutlookAlternatives | Machinery already in `computeAlignment.ts`. Show honestly when it worsens. Note legacy displayed ΔHHI×1000. |
| 8 | **`tilts_allowed` hygiene gate** | 3 | belief-actions engine | Any RED safety light suppresses risk-increasing suggestions; worst-of + policy thresholds. |
| 9 | **Engine ledger** (base → blend → preRules → final + `adjustments[]`) | 3 | server engines | Every rule fire explainable on screen and in compliance review. |
| 10 | **Tilt-strength as an explicit user dial** with the honest "tilted N% towards your scenarios" sentence (N = the interpolation constant, arithmetically true) | 3 | OutlookAlternatives | |

### Tier 2 — UX devices (cheap, high polish)

- **4-stat card grid** (total change pp / turnover / cost / current liquidity) lifting `result.summary` out of one inline sentence — incl. currently-unused `liquidityNowPct`/`liquidityTargetPct` (lens 4).
- **Stage tabs with live counts** — "Do Now (N)" / "Later (N)" toggles replacing static headings (lens 4).
- **Dual-register tooltips** — plain-English paragraph then technical paragraph, per stat; legacy copy is ready-written source material (lens 4: "the demo wow was density-with-explainers — bold number + honest footnote popover"; institutionalise the pairing).
- **Per-action rows with ADD↑/TRIM↓ icons + signed coloured deltas** (lens 4).
- **Live donut preview while typing allocations** + must-total-100 trio (colour-coded running total, "need X% more" helper, disabled submit) wherever % entry exists (lens 4).
- **Staged progress narration** for analysis waits (3–4 rotating real-phase messages, never fake %) instead of spinners; skeleton loaders instead of `Loader2` (lens 5).
- **RAG score pills** with the positive empty state "No significant concerns identified" (lens 5).
- **Security reassurance pill** ("processed securely / not shared") at data-entry moments on Intake/Holdings (lenses 1,5).
- **Milestone completion moments** (celebration card + what-happens-next panel) at Holdings-done and Analysis-ready — port the choreography, never the simulated progress timer (lenses 1,5).
- **Data-provenance strip** — "viewing: your data / sample data" + reset control (lens 1).
- **Element-anchored 5-step spotlight micro-tour** for the densest screen, reusing `AssetRegisterTour`'s positioning engine (lens 5).
- **Grouped-category mix display** (category subtotals, indented asset rows) for 15-bucket mixes (lens 5).
- **Property chart pack** (sparkline + valuation-range with confidence badge) when property holdings detected (lens 5).
- **Scenario-tilt "why this matters" one-liners** next to each active scenario (lens 5).
- **Scenario badge taxonomy** — User Selected vs High Impact (persona-derived) vs Applicable (lens 1); revive the persona→scenario relevance mapping with a proper transport (legacy used URL params).
- **Scorecard grammar for Report** — per-section star/status + one-line finding, KEY STRENGTHS / AREAS FOR ATTENTION two-sided framing, provenance footer (report ID, timestamp, screening-only caveat) (lens 1).
- **Upload-first intake** — make Method's CSV upload real (honest parsing + mapping review; the legacy version simulated progress) (lens 1).

### Copy doctrine (lens 5 + 2 + 3)

- Name data sources **only once grounded** — the ONS/FCA line is strong copy currently backed by nothing (§1.3).
- House error-state voice, verbatim from legacy: *"No analysis is shown rather than an approximation."*
- Tooltips teach concepts, not widgets. First-person persona voice. "Aim for X" coaching micro-copy.
- Port the devices, not the volume: legacy shouts (ALL-CAPS font-black gradients); v2's font-light restraint is the right register.
- Replace forward-looking "Strengths" labels with "Characteristics". No "Expected: 2–3x", no LIVE badges on non-live data, no model-name branding ("GPT-4 Powered"), no speed promises.

### Demo kit (consolidate as a named capability; lenses 1,5)

v2 already has the best piece (investor switcher + private links + resume). Missing: **agenda page** (the three-act arc: Problem → Walkthrough → Next Steps — investors praised the narrative, v2 is only act two), **one-click sample-investor seed** (store-seeding, not DOM-walking), **data-source banner + mid-session reset**, **ending moment** (completion acknowledgement + contact/booking cards + single CTA). The 19 personas double as a demo-investor generator with full portfolio defaults.

## 3. Do-not-port ledger (confirmed in situ, with mechanisms)

| Item | Where | Mechanism |
|---|---|---|
| "Forecast Uplift 2–25%" hero | deleted wizard L6551–6624 | client-side bands over totalChangePp; fabricated performance promise |
| Cumulative all-scenarios stress | presentation layer only | engines normalise correctly; UI summed |
| Flag→reassurance inversion | `why.ts:73`, `narrate.ts:106` | asserts target compliance never verified |
| Direction-baked reason strings | `why.ts` `BUCKET_REASON` | one string spliced into both trim and add templates → self-contradictions; fix = `{addReason, trimReason}` pairs |
| Fake live signals | PortfolioAnalysis | hardcoded +8.4% YTD, 30s "LIVE" feed, simulated upload progress, "SIMULATION ACTIVE" badges with no model |
| Normative allocation priors presented as "scenarios" | `server/config/scenarios.ts` | conflates belief with prescription; v2's descriptive shocks + cited episodes are the right kind |
| `dangerouslySetInnerHTML` bold-parse | wizard playbook | reimplement with a safe splitter |
| Reputation/badge/upsell furniture | WelcomePanel/UpgradeCard | not the onboarding flow's job |

## 4. Legacy bug ledger (do not replicate)

- `personaRules.ts:65,91` compare `persona.name === "P016"/"P003"` but codes live in `.code` — the P016 property-stress cap and P003 tech-burst cap **never fire**.
- Tie-break gap unit bug: `matchScore` is 0–100 integer, `tieBreakGap = 0.15` — safer-persona tie-breaking effectively never triggers (intended ~15 points).
- Softmax over 0–100 integers collapses confidence to ~100/0 — the confidence number was near-meaningless.
- Quiz normalisation over-weights Risk/Horizon (two questions each, normalised by single-question max).
- CSV export: stage 1 only, no field quoting (commas in rationale corrupt rows).
- Duplicated `personaDefaults` (client + server) with no sync guard; persona name map hardcoded a third time in `routes.ts`.
- **S-code ID collision**: `server/config/scenarios.ts` S002="Policy Support" (allocation prior) vs `client/src/data/scenarios.json` S002="AI recession" (shock) — same IDs, different semantics, four scenario data layers in total.
- TargetsAndBands "Save plan" is console.log-only theatre; wizard's Save Plan hit a real endpoint (`/api/action-plans`) that must be verified/rebuilt before reuse.
- `blendScenarioTemplates` double-normalises (harmless; sign of an untightened seam). `aggregateToHighLevel`/`mapBackToCanonical` are dead code with mislabelled constants.

## 5. Sound legacy mechanics worth keeping (lens 3 verdict table, condensed)

Linear tilt `(1−k)·base + k·blend` (bounded, explainable) · rules-after-tilt with full adjustments ledger · effective-N (1/HHI) · turnover ½Σ|Δ| + frictions-before-benefits · Safety Lights worst-of + `tilts_allowed` gate · shock **blend** + `alphaFade` decay + breakeven month + MC fan chart (recalibrate on real inputs — the identity correlation matrix is a known placeholder) · liquidity floor with donor routing (parameterise the fixed donor order) · persona/scenario conditional caps (make declarative, not hardcoded pairs).

## 6. Where the full lens reports live

The five complete lens reports (with file:line evidence) are preserved in the session transcript and summarised above; the highest-value verbatim artefacts for future implementers are: the deleted wizard blob `c7c7504^:client/src/pages/InvestorPreferencesWizard.tsx` (action plan L6543–7100, comparison L2573–2790/L3040–3230, gap cards L4255–4440), the legacy quiz matcher `git show f036e73:client/src/hooks/usePersonaQuiz.ts`, and the Refine questionnaire `DemoPortfolioAnalysis.tsx:938–1442`.
