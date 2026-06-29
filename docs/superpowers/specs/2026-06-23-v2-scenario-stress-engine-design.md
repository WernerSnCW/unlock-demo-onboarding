# Design — Onboarding-v2 scenario-stress engine + legacy-wizard retirement

**Date:** 2026-06-23 · **Repo:** `unlock-demo-onboarding` @ `harden/phase2-profiling-simulation-tools` (HEAD `05c1be4`)
**Supersedes the literal scope of:** `docs/2026-06-22-engine-rebuild-handoff.md`
**Reviews this builds on:** `Intelligence/research/2026-06-22-...-model-review-V2.md` (the five flaws), `...2026-06-11-...-repo-review-V1.md`

---

## 1. Why this design differs from the handoff

The handoff asked us to "rebuild the persona/belief/portfolio engine and fix the five model-design flaws." Investigation during brainstorming established a fact the handoff did not have:

> **All five reviewed flaws live only on the legacy `InvestorPreferencesWizard` path. The shipping Onboarding-v2 flow executes none of them.**

Verified at HEAD `05c1be4`:

- **Persona cosine / fake confidence % (flaw 2.1):** v2 uses the *server* `personaEngine.ts` (deterministic weighted trait scoring) and **renders no confidence number**. The cosine `usePersonaQuiz.ts` is imported only by `InvestorPreferences.tsx` / `InvestorPreferencesWizard.tsx`.
- **Belief clamp `Math.max(0,…)` (2.2) and `|corr|` dampening (2.3):** in `client/src/utils/beliefProcessing.ts`, reachable only via the legacy wizard's `useBeliefQuestionnaire`. v2 computes belief axis scores locally in `onboardingV2Store.ts:929-996` and never calls `processBeliefResponses`.
- **Probability discard / booleanize (2.4):** `/api/scenario-impact` (`server/routes.ts:719-800`) is called only from `InvestorPreferencesWizard.tsx`. v2 never calls it.
- **Compounding + identity-matrix MC + missing vols (2.5):** `/api/simulate-v2` + `engine_v2.ts` + `correlations.ts` (identity) + `scenarioVols.ts` (missing buckets) are reached only from the legacy wizard. v2 runs **no Monte Carlo** and imports neither config.

The legacy wizard is **still reachable**: routes `/investor-preferences` and `/investor-preferences-v2` exist (`client/src/App.tsx:82-83`), linked from `PortfolioAnalysis.tsx:1040` and `AdviceGap.tsx:312`. The front door (Header, WelcomePanel, StepIndicator) routes to `/onboarding-v2/*`.

**Consequence:** "fix the five flaws in the documented engine" would polish a non-front-door path and deepen the duplicate-engine sprawl the review itself flagged (2.6). The higher-standard move is to **delete that path** and **build the one capability it had that v2 lacks — a portfolio stress projection — correctly, natively in v2.**

---

## 2. Decisions (resolved with Tom, 2026-06-22/23)

Rubric Tom set: *most valuable, accurate, impressive, and useful for users*; plus the standing compliance line *intelligence, never advice*.

| # | Decision | Resolution |
|---|---|---|
| 1 | Spine: profiler or stress tool? | **v2 is the spine, with a new belief-salient stress lens as the centrepiece.** |
| — | Rebuild target | **A1: retire the legacy wizard; build one correct stress engine into v2.** |
| 2 | Persona matching | **No classifier confidence number** (v2 already shows none). Keep `personaEngine.ts` as a descriptive frame; tighten copy from "Unlock classifies you as…" toward a **reflective mirror** of the user's stated stance. Cosine path deleted with the wizard. |
| 3 | Belief→impact wiring | Beliefs are **style/preference tilts**, not macro forecasts. They keep driving allocation bands (unchanged). The stress lens runs on **real holdings vs a scenario library**; beliefs add only a **light salience layer**. No belief is treated as a probability. |
| 4 | MC inputs | **No Monte Carlo.** Deterministic conditional stress with an explicit shock **range**. We do not simulate a distribution we cannot defend, and we print no probability we cannot calibrate. |
| 5 | Belief signal model | Moot for the stress lens (no summed risk score to clamp). The existing allocation path is untouched; the `Math.max(0,…)` clamp and `|corr|` dampening die with the legacy code. |
| 6 | One persona engine | **Delete** the cosine path, the legacy belief pipeline, and the flawed stress/MC engine. `personaEngine.ts` survives. |

Two sub-decisions:

- **Shock source:** historically-calibrated (researched from real drawdowns) — but **non-blocking**: the engine builds against a scenario-library data contract; researched numbers populate/refine it in parallel.
- **Belief link:** light salience layer (stress runs on all scenarios; stated concerns surface the matching scenario first).

---

## 3. Goals / non-goals

**Goals**
- A new, honest, deterministic **portfolio-resilience** lens in v2: "if this scenario played out, your current holdings move ~−X% (range −Y to −Z), driven mostly by …".
- Surface concentration / illiquidity blind spots in the user's *actual* portfolio — reinforcing the existing Safety Lights narrative.
- Retire the legacy wizard and its flawed engine; one engine, where the product lives.
- Full test coverage on the new engine (the engine is currently untested per V1).

**Non-goals**
- No Monte Carlo, no probability outputs, no expected-shortfall/VaR statistics.
- No change to the existing belief→allocation-band machinery.
- No advice framing; outputs are illustrative and conditional.
- No sourcing project gating the build — shock data is a populatable contract.

---

## 4. Architecture

Three units, each independently understandable and testable.

### 4.1 Scenario library — `client/src/data/stressScenarios.ts` (new)
A typed, static data file. The engine's only knowledge of "what a shock is."

```ts
type AssetClass = 'equity' | 'bond' | 'cash' | 'property' | 'alternatives' | 'other';
type Region = 'uk' | 'us' | 'europe' | 'global' | 'emerging' | 'other';

interface StressScenario {
  id: string;                 // 'EQUITY_DRAWDOWN'
  name: string;               // 'Global equity drawdown'
  blurb: string;              // one-line, illustrative framing
  historicalAnchor: string;   // e.g. '~2008/2020 equity selloff' (shown as provenance)
  // central shock per (asset_class, region); range derived via lowMultiplier/highMultiplier
  shocks: Partial<Record<AssetClass, Partial<Record<Region, number>>>>; // signed decimals, e.g. -0.25
  defaultShockByAssetClass: Partial<Record<AssetClass, number>>;        // fallback when region absent
  range: { low: number; high: number }; // multipliers on central, e.g. {low:0.7, high:1.4}
  beliefSalience?: BeliefAxis[]; // axes whose concern surfaces this scenario first
}
```

Maps to **v2's own holdings taxonomy** (`asset_class × region` from `onboardingV2Store.ts:55-74`), *not* the legacy bucket set. Initial set (≈4–6): `EQUITY_DRAWDOWN`, `RATE_INFLATION_SHOCK`, `TECH_CORRECTION`, `PROPERTY_DOWNTURN`, optionally `CREDIT_STRESS`, `GBP_SHOCK`. Numbers are historically-calibrated illustrative values, labelled "illustrative" on screen.

### 4.2 Stress engine — `client/src/lib/scenarioStress.ts` (new, pure)
```ts
function computeScenarioStress(
  holdings: Holding[],            // existing v2 Holding[]
  scenarios: StressScenario[],
): ScenarioStressResult[];

interface ScenarioStressResult {
  scenarioId: string;
  centralImpactPct: number;       // portfolio value change, e.g. -0.18
  rangePct: { low: number; high: number };
  centralImpactGbp: number;
  topContributors: { label: string; impactGbp: number; pctOfLoss: number }[]; // the "blind spot"
}
```
- Pure, deterministic, no network, no store coupling. Total portfolio value = `Σ value_gbp`.
- For each scenario: per-holding shock = `shocks[asset_class][region]` ?? `defaultShockByAssetClass[asset_class]` ?? `0`; holding impact = `value_gbp × shock`; portfolio impact = `Σ / total`.
- Range = central × `{low, high}` multipliers (transparent, not simulated).
- `topContributors` ranks holdings by absolute £ impact → the concentration mirror.

### 4.3 Presentation — new section on the v2 Report/Analysis surface
- Renders each `ScenarioStressResult` as a conditional, illustrative statement + range + top contributors.
- **Belief salience:** order scenarios so that any whose `beliefSalience` matches a `TOWARDS`/high-intensity stated concern (`INFLATION_HEDGE_TILT`, `TECH_TILT`, `VOLATILITY_AVERSION`) appears first, with a "you told us …" callout. Pure ordering/highlight; never hides a scenario.
- **Gating:** the stress lens is descriptive of *current* holdings, so it does **not** use `tiltGate`/`tiltsAllowed`. It shows regardless of Safety Lights (and is most valuable when they are RED).

### 4.4 Data flow
```
Holdings (store) ─┐
                  ├─> computeScenarioStress(holdings, stressScenarios) ─> ScenarioStressResult[] ─┐
stressScenarios ──┘                                                                               │
beliefs.axisScores (store) ──> salience ordering/highlight ───────────────────────────────────────┴─> Report section
```
Holdings already exist in the store; beliefs already exist. The engine is additive — no new intake step.

### 4.5 Deletion (legacy retirement)
- Re-point `PortfolioAnalysis.tsx:1040` and `AdviceGap.tsx:312` from `/investor-preferences-v2` to `/onboarding-v2/welcome`.
- Remove routes `client/src/App.tsx:82-83` and their imports.
- Delete `InvestorPreferences.tsx`, `InvestorPreferencesWizard.tsx`, `usePersonaQuiz.ts`, `beliefProcessing.ts`, and the legacy belief hooks — **after** confirming no v2 import survives (grep gate in the plan).
- Delete `/api/scenario-impact`, `/api/simulate-v2`, `engine_v2.ts`, `correlations.ts`, `scenarioVols.ts`, and legacy `server/data/scenarios.ts` — **only** once a grep proves they are unreferenced outside the deleted set.
- Each deletion is its own commit, gated by a green test run, so it can be reverted in isolation.

---

## 5. Compliance

- Every stress output is **conditional + illustrative**: "*if* this scenario occurred …", labelled illustrative, with visible historical provenance.
- No probabilities, no forecasts, no "you should". Beliefs are described as the user's stated preferences, not predictions.
- Reinforces the existing Safety Lights ("intelligence") framing rather than introducing an advice-flavoured projection.

---

## 6. Testing strategy (test-first)

The engine is the first properly-tested unit in this repo. Vitest is wired.

- **`scenarioStress` unit tests (write first, must fail first):**
  - empty holdings → empty/zero result, no NaN.
  - single equity holding + `EQUITY_DRAWDOWN` → impact equals the shock.
  - region fallback: holding with region absent from `shocks` uses `defaultShockByAssetClass`.
  - unknown asset_class/`other` with no default → 0 shock (riskless only when truly unmapped, by design — asserted, not accidental).
  - `topContributors` ranks by £ impact and sums to the total loss.
  - range low < central < high in sign-correct order.
  - mixed multi-bucket portfolio → portfolio impact equals the value-weighted sum (golden test).
- **Salience ordering tests:** a strong `INFLATION_HEDGE_TILT` concern surfaces `RATE_INFLATION_SHOCK` first; no scenario is ever dropped.
- **Scenario-library validation test:** every `shocks` entry is in `[-1, 1]`; every scenario has an anchor + blurb; ids unique.
- **Deletion regression:** after re-pointing links, a route test confirms `/investor-preferences*` 404/redirect and the front-door flow is intact; a grep-based guard asserts the deleted modules have no remaining importers.

---

## 7. Risks / open items

- **Shock realism:** initial values are illustrative-but-anchored; historical calibration is a parallel research task (non-blocking). Flagged on screen as illustrative until refined.
- **Taxonomy coarseness:** v2 holdings have no distinct "crypto" asset_class (it falls under `alternatives`/`other`). A scenario wanting crypto-specific shocks must shock `alternatives` — acceptable for the demo; note it.
- **Persona copy:** reflective-mirror rewrite is a copy/UX change on `PersonaCard`; keep it small and within the "no classification claim" rule.
- **Deletion blast radius:** legacy files may be imported by shared components; the grep gate before each deletion is mandatory.

---

## 8. Sequencing (for the plan)
1. Engine + library contract + tests (test-first), behind no UI.
2. Report section wiring + salience ordering.
3. Persona reflective-mirror copy.
4. Legacy retirement (re-point links → remove routes → delete modules), each gated by grep + green tests.
5. (Parallel, non-blocking) historical shock calibration research → populate `stressScenarios.ts`.
