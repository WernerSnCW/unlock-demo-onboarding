# Brief — Scenario/simulation scope + full verification of the v2 engine

**Created:** 2026-06-23 · **For:** a fresh session. Two workstreams; A needs a Tom decision before build, B can start immediately.
**Repo:** `~/dev/unlock-demo-onboarding`, branch `feat/v2-scenario-stress-engine` (PR #4, OPEN). Stay on this branch unless told otherwise.

---

## TL;DR

1. **"Where's the scenario planner / economic-outcome simulation?"** — It exists, but in a *deliberately deterministic* form, and the *probabilistic Monte-Carlo* version was **deleted on purpose** because it was the flawed part. Decision needed on whether/how to bring back a richer scenario planner. → **Workstream A**.
2. **"Test all the logic, maths, algorithms, data, presuppositions."** — Justified and overdue. There's a real harness gap (a chunk of v2 logic has tests that `npm test` never runs) plus a set of unexamined assumptions baked into the numbers. → **Workstream B**.

---

## Current state — what the tool actually does today (verified 2026-06-23)

The Onboarding-v2 flow (`client/src/pages/onboarding-v2/`) has three scenario-flavoured surfaces:

| Surface | File(s) | What it does | Nature |
|---|---|---|---|
| **Stress lens** (Analysis, step 5) | `lib/scenarioStress.ts`, `data/stressScenarios.ts`, `components/onboarding-v2/ScenarioStressSection.tsx` | Real holdings × 4 economic scenarios → illustrative % impact + range + top contributors. **This IS "different economic outcomes → impact on your portfolio."** | Deterministic, conditional, no probabilities |
| **Target / illustrative scenarios** (step 7) | `lib/step7Helpers.ts`, `lib/scenarioInterpretation.ts`, `pages/onboarding-v2/Target.tsx` | Three illustrative allocation scenarios with ranges + Safety-Light recompute per scenario; belief tilts applied/constrained/blocked by guardrails | Deterministic ranges, belief-driven |
| **Belief axes** (step 6) | `state/onboardingV2Store.ts` (`onboardingV2Store.ts:929-996`) | Eight −1..+1 preference signals that feed salience + step-7 tilts | Deterministic |

**Deleted on purpose during the rebuild** (decision A1 — see memory `unlock-onboarding-engine-rebuild`): the probabilistic Monte-Carlo engine `server/lib/simulate/engine_v2.ts`, `config/correlations.ts`, `config/scenarioVols.ts`, `data/scenarios.ts`, and routes `/api/scenario-impact` + `/api/simulate-v2`. Reason: 5 design flaws (uncalibrated probabilities discarded, identity correlation matrix, missing vols so crypto/property simulated riskless, compounding correlated shocks, magnitude-blind cosine persona). That removal was the *point* of the rebuild — do not resurrect it as-was.

**Likely-orphaned legacy still in the tree** (audit candidate, Workstream B): `server/lib/simulate/engine.ts` (a *different*, older scenario-weighted projection engine) is wired to `POST /api/simulate` in `server/routes.ts:~701`, but **no client code calls `/api/simulate`** (grep-verified). Its config (`server/config/scenarioShocks.ts`, `buckets.ts`, `scenarios.ts`, `personaDefaults.ts`) is probably dead too. Confirm and either delete (grep-gated) or document why it stays.

---

## Workstream A — Scenario planner / economic-outcome simulation (DECISION first)

**The user's ask:** a scenario planner that *predicts different economic outcomes and their impact on the portfolio.* The deterministic stress lens already does the "impact on portfolio under a named scenario" half. What it does **not** do, and what the user may be missing:

- **Interactivity** — user can't pick/blend scenarios, dial severity, or set a horizon. (The old `simulate/engine.ts` had `scenarioWeights`, `horizonMonths`, `shockMultiplier`, bands — the *interaction model* was decent even though the MC maths were flawed.)
- **Multi-outcome comparison** — no side-by-side "recession vs soft-landing vs stagflation" view, no time path, no "what if I changed my mix" delta.
- **Probabilistic framing** — intentionally absent (compliance: "intelligence, never advice"; no forecasts). This is a *feature*, not a bug, but the user should confirm they don't actually want it back.

**Decision for Tom (pick the altitude):**
1. **Extend the deterministic lens** — add more scenarios, user-adjustable severity slider, side-by-side outcome comparison, optional "vs target mix" delta. Keeps the no-forecast compliance stance. *(Lowest risk, most likely correct.)*
2. **Interactive scenario explorer** — reuse the *interaction model* of the old `simulate/engine.ts` (weights/horizon/bands) on top of the *correct* deterministic engine; show a transparent fan/range, still no probabilities.
3. **Re-introduce probabilistic simulation, done right** — only if genuinely wanted; would need calibrated vols, a real correlation matrix, and FCA-defensible framing. High effort, high compliance scrutiny. Brainstorm + spec required before any code.

**Process:** run `brainstorming` with Tom on this before touching code. Then `writing-plans`. Hard constraint: must not reintroduce the 5 deleted flaws; numbers stay illustrative + defensible; no probabilities presented as forecasts without explicit sign-off.

---

## Workstream B — Full verification of logic, maths, algorithms, data, presuppositions

The user wants everything stress-tested, not just "tests pass." Scope:

### B0. Harness gap (do this FIRST — it's the reason "119 green" is misleading)
`npm test` → `vitest run --config vitest.config.server.ts`, which includes **only `tests/**/*.test.ts`** (node env). The **co-located `client/src/lib/*.test.ts` files are NOT run by `npm test`:** `step7Helpers.test.ts`, `scenarioInterpretation.test.ts`, `step9Helpers.test.ts`, `reportNarrative.test.ts`, `stepFlow.test.ts`. So a large slice of v2 logic (step-7 scenarios, step-9, report narrative, step flow) has tests that **never run in CI**. Confirm whether a second vitest config runs them; if not, wire them in (or move them to `tests/`) and make the real green count honest. This is the highest-value finding.

### B1. Unit-by-unit audit (logic + maths + algorithms)
For each, re-derive the maths by hand on a golden case and adversarially probe edge cases:
- `lib/scenarioStress.ts` — value-weighting, `shockFor` fallback, contributor ranking, range derivation, divide-by-zero, the protective-holding exclusion (commit `7176539`). *Engine has 10 tests; verify they cover sign errors, all-cash, negative/zero values, missing region, unmapped asset class.*
- `lib/scenarioStressSalience.ts` — the 0.2 threshold, stable partition, no-drop guarantee.
- `lib/scenarioStressView.ts` — rounding, signed-pct formatting, banned-verb compliance.
- `data/stressScenarios.ts` — the calibrated numbers (just landed, commit `4e73c48`); re-check against the financial-domain review gaps below.
- `lib/step7Helpers.ts` + `lib/scenarioInterpretation.ts` — step-7 illustrative-scenario ranges + Safety-Light recompute. **(Tests exist but may not run — see B0.)**
- `state/onboardingV2Store.ts:929-996` — belief axis-score maths (−1..+1), intensity, tilt gating.
- `tests/safetyLights.test.ts` subject — the Safety-Lights thresholds (liquidity/concentration/illiquids) and their cutoffs.
- `lib/step9Helpers.ts`, `lib/reportNarrative.ts`, `lib/stepFlow.ts`.
- Legacy `server/lib/simulate/engine.ts` — audit for dead code (B/W decision: delete grep-gated or keep).

### B2. Data audit
- Re-verify the calibrated shocks against sources (citations are in each `historicalAnchor`). Sources used 2026-06-23: MSCI World −34% (COVID)/−54% (GFC); 2022 Bloomberg Global Agg −16.25%, UK gilts −20.2%, US Agg −13%, world equity −18%, FTSE 100 ~flat, MSCI EM −20.1%; Nasdaq −33.1% (2022)/−78% (2000–02); UK commercial property −44% (GFC, MSCI/IPD), UK house prices −18.7% (GFC)/−20% (early-90s).
- Carry forward the **financial-domain-reviewer flags** (taxonomy-inherent, currently disclosed by "Illustrative" labelling, not errors): (a) UK-equity 2022 resilience is *large-cap only* — UK mid/small-cap fell ~−18-20%; (b) `bond` shocks assume govt bonds — credit/HY fell in equity crises, index-linked gilts fell −31% in 2022; (c) TECH anchor cites Nasdaq −78% but the broad `us` equity bucket caps ~−42% severe; (d) listed REITs fell ~−50% in 2008 vs the −15% property shock in the equity-drawdown scenario. Decide whether any deserve a finer bucket or a footnote.

### B3. Presuppositions to challenge explicitly (the user asked for this by name)
1. **Value-weighting assumes mark-to-market £ values are current and comparable** across illiquid (property) and liquid holdings.
2. **No cross-bucket correlation** — the engine sums independent bucket shocks; real drawdowns are correlated (a deliberate simplification vs the deleted MC, but state it).
3. **Severity range = central × {0.7, 1.4}** — these multipliers are *arbitrary*, not derived. Are they defensible? Should they be per-scenario?
4. **Salience threshold = 0.2** — why 0.2? Matches the store's TOWARDS cutoff; confirm that's the right coupling.
5. **Region taxonomy is one-dimensional** (`uk/us/europe/global/emerging/other`) — can't express large vs small-cap, govt vs credit, residential vs commercial. Several B2 gaps stem from this.
6. **No FX effect** — a GBP investor in USD assets is exposed to GBP/USD; 2022 FTSE "flatness" was partly a weak-GBP/energy story. The model ignores currency.
7. **`defaultShockByAssetClass` fallback** — when a region is missing, the asset-class default applies; check no scenario silently mis-defaults (e.g. cash always 0).
8. **Beliefs are style/preference tilts, not macro forecasts** — the rebuild's core premise; confirm the UI never implies otherwise.

### B4. Approach & done criteria
- Skills: `superpowers:systematic-debugging` (for any defect), `superpowers:test-driven-development` (for new tests), `cloudworkz-skills:financial-domain-reviewer` (data/assumptions), `superpowers:verification-before-completion` (gate).
- Consider an orchestrated multi-agent review pass (adversarial verify per unit) if Tom opts in.
- **Done:** honest green count (B0 fixed); every unit in B1 has a hand-verified golden + edge cases; B2 data signed off or footnoted; B3 presuppositions each either defended in a doc or turned into a fix; orphaned legacy resolved.

---

## Files, commands, constraints
- Tests: `npm test` (tests/ only — see B0). Single file: `npx vitest run --config vitest.config.server.ts tests/<f>.test.ts`. Type-check: `npm run check`. Build: `npm run build`.
- Run locally (visual): dummy `DATABASE_URL='postgresql://demo:demo@127.0.0.1:5432/demo_unused'`; macOS needs `reusePort` dropped from `server/index.ts:64` temporarily (do NOT commit — Linux deploy needs it). A `.claude/launch.json` with an `unlock-onboarding` entry (port 5000) already exists locally (untracked).
- Compliance: "intelligence, never advice"; numbers illustrative + defensible; no probabilities/forecasts without explicit sign-off; no advice verbs (should/must/buy/sell/optimise/improve/save) in user-facing copy — `tests/stressScenarios.test.ts` enforces this for the scenario library.
- Memory to read: `unlock-onboarding-engine-rebuild` (full arc + decisions). Design: `docs/superpowers/specs/2026-06-23-v2-scenario-stress-engine-design.md`. Plan: `docs/superpowers/plans/2026-06-23-v2-scenario-stress-engine.md`. Engine review that started it: `~/Documents/Co Work Reset/Intelligence/research/2026-06-22-unlock-onboarding-engine-model-review-V2.md`.
