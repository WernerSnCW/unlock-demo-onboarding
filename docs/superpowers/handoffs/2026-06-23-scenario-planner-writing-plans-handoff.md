# Handoff — Scenario Planner: run `writing-plans`

**Created:** 2026-06-23 · **For:** a fresh session. **Repo:** `~/dev/unlock-demo-onboarding`, branch `feat/v2-scenario-stress-engine` (PR #4 OPEN). Stay on this branch.
**Your job:** turn the APPROVED design into an implementation plan via `superpowers:writing-plans`. The design is locked — do **not** re-brainstorm it. Read the three artefacts, then plan.

---

## TL;DR
The scenario-planner design (Workstream A) is brainstormed, audited by an 8-lens panel, and approved by Tom. Three docs are committed (commit `f069347`). The next step is **`writing-plans`** only. Then a *new* session executes the plan.

## Read first (in order)
1. **Logic/formulas** — `docs/superpowers/specs/2026-06-23-scenario-planner-logic-and-formulas.md` (how every number is produced; start here — it's the clearest).
2. **Design spec** — `docs/superpowers/specs/2026-06-23-scenario-planner-design.md` (the what + the §0 invariants + §13 human gates).
3. **Audit** — `docs/superpowers/reports/2026-06-23-scenario-planner-design-audit.md` (the 22 findings already folded into the spec; don't re-litigate).
4. Memory: `unlock-onboarding-engine-rebuild` (full arc, incl. Workstream B which is done + pushed @ `fd0bbc1`).

## What is LOCKED (do not reopen)
- **Empirical-history replay, NOT forward-MC.** Deterministic. Severity = read-position within the *observed* band; the `{0.7,1.4}` multiplier is gone and stays gone. (§0 invariants.)
- **Roster:** 1929 · 1973 · 1987 · 2000 · 2008 · 2020 · 2022 + **1920–21** (Tom: in). Native granularity (annual deep / monthly modern). Replay floor ~1870; industrial-revolution/AI analogy in **copy only**.
- **UX:** progressive disclosure on a stable spine (4 stages); guided narration (lead-in + compliance caption + behavioural beat).
- **Belief↔scenario coherence rule** (§7A): no orphan questions, no orphan episodes; add a horizon/circumstance input; style/factor axes stay step-7-only.

## Plan shape (suggested phases)
- **Phase 0 — Sourcing spike + belief re-mapping (GATE):** can we pull cited series for the roster × buckets from free sources (Shiller 1871 / JST Macrohistory 1870 annual / FRED)? Confirm GBP basis, "no comparable series" buckets per deep episode, recovery definition. Decide optional 1920–21. Re-tag scenarios to belief axes. *If the data can't be sourced, surface before building UI on it.*
- **Phase 1 — Extract** value-weighting + contributor-ranking from `client/src/lib/scenarioStress.ts` into tested shared helpers (they're currently inlined; this is real work, not free reuse).
- **Phase 2 — Pure engine:** `client/src/data/episodeLibrary.ts`, `client/src/lib/empiricalEngine.ts`, `client/src/lib/episodeBlend.ts`, `client/src/lib/portfolioMix.ts` (derive weight vector from holdings AND from step-7 bands). Golden-case + provenance tests (each bucket's episode drawdown/recovery == published index figure).
- **Phase 3 — Stepped UI:** `client/src/pages/onboarding-v2/ScenarioPlanner.tsx` + stage components; stable-spine chart; navigation/reset; per-stage empty/loading/error states; narration from the content brain (FCA-checker + banned-verb lint).
- **Phase 4 — Mix-comparison delta (LAST, GATED):** neutral comparison (no green-better, symmetric trade-offs); **build behind a feature flag, dark until human compliance sign-off** (Vine-Lott / Corke — §13).

**De-risk option Tom likes:** ship Stages 1–3 as v1 (clean, ~no compliance risk) and treat the delta as a fast-follow.

## Human gates (not codeable — §13)
1. Compliance sign-off on the delta surface (Targeted Support / PS25/22, live 6 Apr 2026).
2. Data sourcing decision (1920–21 in/out after the spike).
3. Content-brain voice + FCA-checker pass on narration.

## Run / verify (from Workstream B notes)
- Tests: `npm test` (now 255/255 across 13 files after the B0 harness fix). Type-check: `npm run check` (large PRE-EXISTING out-of-scope tsc backlog — don't try to fix it; just add zero new errors).
- Local run (visual): dummy `DATABASE_URL='postgresql://demo:demo@127.0.0.1:5432/demo_unused'`; macOS needs `reusePort` dropped from `server/index.ts:64` temporarily (do NOT commit — Linux deploy needs it). `.claude/launch.json` has an `unlock-onboarding` entry (port 5000).
- Compliance constants: no advice verbs (lint-enforced) — but the lint can't catch implied-suitability *valence*; that's the delta's human gate.

## State
- Docs committed @ `f069347` on `feat/v2-scenario-stress-engine` (local; ask Tom before pushing).
- Workstream B done + pushed @ `fd0bbc1`.
