# Scenario Planner — next-session handoff (2026-06-23)

**Start the new session rooted in `~/dev/unlock-demo-onboarding`** (NOT the vault) so the preview tooling works. Branch: `feat/v2-scenario-stress-engine` (PR #4). HEAD `9298a50`, in sync with origin.

---

## State: scenario planner BUILT, PUSHED, demo-enabled

The empirical-history scenario planner is complete and live on PR #4 (16 commits, `3e7af48` sourcing → `9298a50` Stage-4 polish). Built via subagent-driven execution of the locked plan `docs/superpowers/plans/2026-06-23-scenario-planner.md` (every task: implement → spec review → code-quality review; plus a final holistic review = ship-ready).

- **318/318 tests green**; `npm run check` = **158 tsc errors = pre-existing baseline, ZERO new** (large unrelated backlog — do not fix it; bar is add-zero).
- **§0 invariants verified end-to-end:** empirical-only (no Monte-Carlo/forecast), no `{0.7,1.4}` multiplier, no extrapolation (`readAt` clamped to observed `band.min`).
- **All 4 stages visible** at route `/onboarding-v2/scenario-planner`: stress test → across history → tune it → compare-mixes.
- **Stage 4 (compare-mixes delta) ENABLED for the demo** — Tom waived the §13 compliance sign-off gate (demo to Tony Vine-Lott + Will Corke for feedback). `DELTA_ENABLED` in `client/src/lib/featureFlags.ts` now defaults ON (force-off via `VITE_SCENARIO_DELTA=0`; **re-gate to default-OFF before any advice-sensitive / production release**).

### Files (all under `client/src/`)
- Data: `data/episodeLibrary.ts` (7 cited episodes, chronological), `data/scenarioPlannerCopy.ts` (provisional copy, `CONTENT-BRAIN-GATE`).
- Engine (pure, TDD): `lib/portfolioMath.ts`, `portfolioMix.ts`, `empiricalEngine.ts`, `episodeBlend.ts`, `episodeSalience.ts`, `scenarioPlannerView.ts`, `featureFlags.ts`.
- UI: `pages/onboarding-v2/ScenarioPlanner.tsx` + `components/onboarding-v2/scenario-planner/*` (PathChart, StageStressTest, StageAcrossHistory, StageTuneIt, StageNav, ScopeContract, RecoveryCounterBeat, StageCompareMixes).
- Docs on branch: design `docs/superpowers/specs/2026-06-23-scenario-planner-design.md`; logic/formulas `...-logic-and-formulas.md`; sourcing `...-sourcing-appendix.md`; audit `docs/superpowers/reports/2026-06-23-scenario-planner-design-audit.md`.

---

## Suggested sequence for the new session

### 1. Browser-walk the demo first (quick gate, run before Tony/Will see it)
Not yet done — preview MCP was scoped to the vault workspace last session. From the dev-repo workspace:
- `preview_start` the `unlock-onboarding` entry (`.claude/launch.json`, port 5000).
- **macOS gotcha:** `server/index.ts` `server.listen({ reusePort: true })` throws `ENOTSUP` on macOS. Temporarily set `reusePort: false` to bind locally — **do NOT commit** (Linux deploy needs `true`).
- The dev server needs `DATABASE_URL` set (launch.json passes a dummy `demo_unused` url; the v2 analyse path does no DB query, so it boots fine for visual checks).
- The page shows an empty state without holdings — drive the onboarding-v2 flow to add holdings (or seed the Zustand store) so the stages render. Stage 4's comparison needs step-7 scenario bands populated (`computeScenarios`) or it shows the graceful "set an allocation to compare" note.
- Verify: chart renders fall+recovery, stage nav clicks 1→4, tune-it blend picker + read-position slider, no console errors, mobile resize. Screenshot as proof.

### 2. Build the evaluation framework — the keystone (do this BEFORE adding anything)
Tom's steer: *"add anything that adds value, don't add anything weak — might need a skill and a framework to evaluate what makes the onboarding + simulation stronger."* Build it as a reusable skill (via `brainstorming` → `write-a-skill`): a rubric that scores any candidate addition (episode, asset class, boom, intake question) on whether it strengthens the onboarding + simulation. This is the yardstick the roster expansion runs through.

### 3. Roster expansion — run every candidate through the framework
See memory `[[scenario-planner-roster-expansion]]`. Expand to all relevant crash AND boom events across stock / property / currency / gold. **This is a real redesign, not a data add** — brainstorm first:
- **Booms break the downside-only framing** — `drawdown`/`recovery`/`band.min`-as-worst all assume losses. Decide: still a stress planner, or a general historical scenario explorer? Recovery/read-position semantics need rework for upside.
- **Gold & currency/FX are NEW buckets** beyond the current 8 — touches `episodeLibrary` Bucket type, `bucketFor`, AND the intake "mapping questions" (holdings taxonomy must capture gold/FX).
- Candidate events: 1989–91 UK property bust / negative equity / Black Wednesday 1992; 1997 Asian; 1998 LTCM/rouble; gold 1980 & 2011 peaks; plus the boom side. (Context: the 18-year land-cycle discussion — property busts ~1973/1991/2008.)
- Refresh the design audit, logic doc, and sourcing appendix (§13 open-items) before re-planning.

### 4. FCA pass (folds in with copy)
Replace the provisional `scenarioPlannerCopy.ts` voice. Ground it in the **FCA Handbook/website rules directly** (content brain optional per Tom), on the **"we're a platform/software — we provide information, not advice"** line.

---

## Known minor items (non-blocking, noted by review)
- StageCompareMixes: the previously-dead `which` radio was removed in the polish; if a richer comparison UI is wanted later, design it through the framework.
- `START_VALUE` (500_000) is duplicated in `ScenarioPlanner.tsx` and `StageCompareMixes.tsx` — harmless (£ isn't rendered; % is primary), but extract to a shared const if touched.
- PathChart trough ReferenceDot uses the central path's `troughIndex`; when the read-position `r>0` the read line's true minimum index can differ slightly — cosmetic only.

## Don't
- Don't fix the pre-existing tsc backlog (bar = add zero new errors).
- Don't reintroduce any `{0.7,1.4}` multiplier / forecast / Monte-Carlo (§0).
- Don't commit the local `reusePort:false` change.
