# Onboarding v2 — Feature Manual

> **What this document is.** A single, authoritative reference for the **current
> Onboarding v2 flow** — the 10‑step investor onboarding experience that lives under
> `/onboarding-v2/*`. Every screen and every behind‑the‑scenes engine is described
> twice: once in **plain English** (what it does and why it matters) and once as a
> **technical deep‑dive** (routes, store fields, endpoints, formulas, thresholds).
>
> **This supersedes the old `Demo_Platform_User_Manual.md` for onboarding.** That
> manual documents the *old* 6‑step demo flow (`/investor-onboarding`,
> `/investor-preferences*`), which still exists but is unrelated to Onboarding v2.
> Keep the old manual as a historical reference only.
>
> **Non‑advisory by design.** Onboarding v2 never tells a user to buy, sell, or
> change anything. It surfaces *illustrative* observations, ranges, and constraints.
> The compliance line **"Illustrative only. Not financial advice."** is enforced
> wherever generated text appears.

---

## Table of contents

1. [Overview & design philosophy](#1-overview--design-philosophy)
2. [The journey at a glance](#2-the-journey-at-a-glance)
3. [Step‑by‑step catalogue](#3-step-by-step-catalogue)
   - [Step 1 — Welcome](#step-1--welcome)
   - [Step 2 — Method](#step-2--method)
   - [Step 3 — Intake](#step-3--intake)
   - [Step 4 — Holdings](#step-4--holdings)
   - [Step 5 — Analysis](#step-5--analysis)
   - [Step 6 — Beliefs](#step-6--beliefs)
   - [Step 7 — Target (Scenarios)](#step-7--target-scenarios)
   - [Step 8 — Next Steps](#step-8--next-steps)
   - [Step 9 — Plan: Transition](#step-9--plan-transition)
   - [Step 10 — Plan: Wrappers](#step-10--plan-wrappers)
   - [Output screen — Report](#output-screen--report)
4. [Engine deep‑dives](#4-engine-deep-dives)
   - [Safety Lights](#safety-lights)
   - [Persona engine](#persona-engine)
   - [Beliefs → tilt scoring](#beliefs--tilt-scoring)
   - [Scenario range generation](#scenario-range-generation)
5. [Cross‑cutting systems](#5-cross-cutting-systems)
   - [Non‑advisory guardrails & banned‑words policy](#non-advisory-guardrails--banned-words-policy)
   - [The onboarding store (state model)](#the-onboarding-store-state-model)
   - [API endpoints](#api-endpoints)
   - [Policy configuration](#policy-configuration)
6. [Report outputs](#6-report-outputs)
7. [Source references](#7-source-references)

---

## 1. Overview & design philosophy

**Plain English.** Onboarding v2 walks an investor from a blank slate to a single
shareable snapshot of where they stand. It collects who they are and what they own,
runs a set of safety checks, learns their investment preferences, and then shows
*illustrative* directions — never instructions. The whole thing is designed to feel
like a thoughtful conversation with a careful, compliance‑aware analyst.

Three principles govern everything:

- **Deterministic first.** The numbers that matter (safety checks, allocation
  ranges, persona match) are computed by transparent, repeatable rules — not by an
  AI guessing. AI is used only to *re‑phrase* already‑computed results into friendly
  prose, and even then its output is validated.
- **Guardrails dominate.** Safety always wins. If a hard safety limit is breached
  (a "RED" light), the user's stated preferences are *recorded but locked* — they
  cannot influence the illustrative ranges until the red issue is resolved.
- **Non‑advisory.** No "should", no "buy/sell", no "recommend". The platform
  describes structure and constraints; it does not prescribe action.

**Technical.** The flow is a client‑side wizard (React + `wouter` routing) backed by
a Zustand store (`onboardingV2Store.ts`) persisted to `localStorage`. Heavy logic is
split between the client (`step7Helpers.ts`, `step9Helpers.ts`,
`scenarioInterpretation.ts`) and the server (`server/services/analysis.ts`,
`server/services/personaEngine.ts`), with policy thresholds centralised in
`server/config/policy_defaults.yaml`. There are exactly **10 numbered steps** plus a
final **Report** output screen (which is *not* counted as a step). The step count is
defined by `TOTAL_STEPS` in `client/src/components/onboarding-v2/StepIndicator.tsx`.

---

## 2. The journey at a glance

| # | Screen | Route | One‑line purpose |
|---|--------|-------|------------------|
| 1 | Welcome | `/onboarding-v2/welcome` | Set expectations, start the flow |
| 2 | Method | `/onboarding-v2/method` | Choose how to provide data (Manual Entry is active) |
| 3 | Intake | `/onboarding-v2/intake` | Personal, financial, goals & persona‑cue inputs |
| 4 | Holdings | `/onboarding-v2/holdings` | Build the portfolio line‑by‑line |
| 5 | Analysis | `/onboarding-v2/analysis` | Safety Lights + persona (calls the analyse API) |
| 6 | Beliefs | `/onboarding-v2/beliefs` | 8‑question preference questionnaire → tilts |
| 7 | Target | `/onboarding-v2/target` | Three illustrative allocation scenarios |
| 8 | Next Steps | `/onboarding-v2/next-steps` | "What matters most now" + review checklist |
| 9 | Plan: Transition | `/onboarding-v2/plan/transition` | Constraints that govern pace & sequencing |
| 10 | Plan: Wrappers | `/onboarding-v2/plan/wrappers` | How holdings sit across account types |
| — | Report | `/onboarding-v2/report` | Consolidated, exportable snapshot (output, not a step) |

**The narrative.** A user lands on **Welcome**, picks **Manual Entry** on **Method**,
and fills in their profile and finances on **Intake** (including optional "structural
cues" like a defined‑benefit pension or business ownership). On **Holdings** they
enter each position; the app continuously recomputes total value, concentration, and
illiquid percentage. **Analysis** sends everything to the server, which returns the
three **Safety Lights** and the best‑matching **investor persona**. On **Beliefs**,
the user answers 8 preference questions that become directional "tilts" — but if a
Safety Light is RED, those tilts are locked. **Target** shows three illustrative
allocation scenarios (Guardrail‑first, Preference‑leaning, Neutral baseline) as
ranges, with example portfolios inside each. **Next Steps** summarises what matters
most right now and produces a neutral review checklist (optionally re‑phrased by AI).
**Plan: Transition** explains the structural and policy constraints that would govern
*pace* if changes were ever considered, and **Plan: Wrappers** shows how the
portfolio is distributed across ISA/SIPP/GIA and flags a possible Bed & ISA. Finally,
**Report** consolidates everything into one snapshot the user can print to PDF or
export as JSON.

---

## 3. Step‑by‑step catalogue

Each step below follows the same shape: **What the user sees / does**, **Inputs
collected**, **Computation / API**, **Store writes**, **Navigates to**.

### Step 1 — Welcome

**Plain English.** A welcome splash that sets expectations: three reassurance cards
("Secure & Private", "AI‑Powered Insights", "Optimized Strategy") and a note that the
process takes ~5–10 minutes. One button starts the flow.

- **Inputs collected:** None.
- **Computation / API:** None.
- **Store writes:** None.
- **Navigates to:** `/onboarding-v2/method`.

### Step 2 — Method

**Plain English.** The user chooses how they want to provide their data. Four options
are shown — **Upload File**, **Manual Entry** (recommended), **Connect Account**, and
**Advisor Import** — but only **Manual Entry** is active in the demo.

- **Inputs collected:** The chosen intake method.
- **Computation / API:** None.
- **Store writes:** `updateIntake({ intake_method })` → `intake.intake_method`.
- **Navigates to:** `/onboarding-v2/intake` (on Manual Entry).

### Step 3 — Intake

**Plain English.** A multi‑section form gathering the personal and financial picture
plus optional "Investor Profile" cues. The cues are what let the persona engine
recognise founders, landlords, or crypto‑heavy investors.

- **Inputs collected:**
  - **Basic details:** `full_name`, `email`, `investor_type`, `region` (tax residency).
  - **Financial picture:** `annual_income_gbp`, `annual_essential_spend_gbp`,
    `liquid_cash_gbp`, `total_investable_assets_gbp`,
    `regular_monthly_contribution_gbp`.
  - **Goals / risk:** `primary_goal`, `time_horizon_years`, `risk_comfort`.
  - **Persona cues:** `age_band`, `portfolio_stage`, `investing_focus[]`, plus paired
    toggles and bands: `has_defined_benefit_pension` (+ `db_income_coverage_band`),
    `owns_business` (+ `private_business_wealth_band`), `has_employer_stock`
    (+ `employer_stock_alloc_band`), `has_crypto` (+ `crypto_alloc_band`).
- **Computation / API:** Local Zod validation (`intakeSchema`) over fields and bands.
- **Store writes:** `updateIntake(...)`, `updatePersonaCues(...)`, and `resetAnalysis()`
  to clear any stale analysis result.
- **Navigates to:** `/onboarding-v2/holdings`.

### Step 4 — Holdings

**Plain English.** A table where the user builds their portfolio one position at a
time. As they add or edit holdings, a live summary shows total value, the size of the
largest single position (concentration), and what share is illiquid.

- **Inputs collected (per `Holding`):** `instrument_name`, `ticker`, `wrapper`,
  `asset_class`, `region`, `value_gbp`, `illiquid` (checkbox), and optional currency,
  type, cost basis, and notes.
- **Computation / API:** `recalculateSummary()` derives `total_investable_value`,
  `largest_line_pct`, and `illiquid_pct`.
- **Store writes:** `addHolding` / `updateHolding` / `removeHolding` →
  `holdings[]`; `recalculateSummary()` → `summary`; `resetAnalysis()` on every change.
- **Navigates to:** `/onboarding-v2/analysis`.

### Step 5 — Analysis

**Plain English.** The app shows a short "Analysing…" state, then a results
dashboard: three **Safety Lights** (Liquidity, Concentration, Illiquids) shown as
green/amber/red cards, key metrics, the user's self‑reported context, and an
**Investor Persona** card. This is the first screen driven by the server.

- **Inputs collected:** None (read‑only results view).
- **Computation / API:** **POST `/api/onboarding-v2/analyse`**. Request payload:

  ```jsonc
  {
    "intake": {
      "cash": number,                       // liquid_cash_gbp
      "spend": number,                      // annual_essential_spend_gbp
      "largest_line_pct": number,           // 0–1
      "illiquid_pct": number,               // 0–1
      "total_portfolio_value_gbp": number,
      "primary_goal": string,
      "time_horizon": string,
      "risk_comfort": string,
      "personaCues": PersonaCues,
      "asset_class_breakdown": { "equity_pct": number /* … */ }
    },
    "holdings": Holding[]
  }
  ```

  The server returns the three Safety Lights, an overall status + message, metrics
  (e.g. `cash_runway_months`), and the matched persona.
- **Display:** Liquidity uses `metrics.cash_runway_months`; Concentration uses
  `summary.largest_line_pct`; Illiquids uses `summary.illiquid_pct`. An overall banner
  shows `overall_status_label` / `overall_status_message`. The persona renders via the
  `PersonaCard` component (`label`, `one_liner`, `plan_focus_bullets`, `risks_bullets`,
  and `portfolio_traits` bars).
- **Store writes:** `setAnalysisLoading`, `setAnalysisResult`, `setAnalysisError` →
  `analysis.status`, `analysis.result`.
- **Navigates to:** `/onboarding-v2/beliefs`.

### Step 6 — Beliefs

**Plain English.** An 8‑question preference questionnaire on a 5‑point
agree/disagree scale. Answers become directional "tilts" (e.g. lean toward quality,
or away from volatility). Crucially, if any Safety Light is **RED**, preferences are
**recorded but locked** — they cannot move the illustrative ranges until the red issue
is addressed.

- **The 8 belief axes:** `QUALITY_TILT`, `VALUE_TILT`, `TECH_TILT`, `UK_BIAS`,
  `ESG_TILT`, `INFLATION_HEDGE_TILT`, `SMALL_CAP_TILT`, and `VOLATILITY_AVERSION`
  (the last is *inverted* from a "Volatility Comfort" question).
- **Inputs collected:** One 1–5 Likert answer per question.
- **Computation:** `computeBeliefsScores()` converts answers to direction
  (`TOWARDS` / `AWAY` / `NEUTRAL`) and intensity (`NEUTRAL` / `LIGHT` / `MODERATE` /
  `STRONG`). See [Beliefs → tilt scoring](#beliefs--tilt-scoring).
- **`tilts_allowed`:** Set to `false` when any Safety Light is RED (surfaced via the
  `hasAnyRed` check and `GATE_REASON_MESSAGES`).
- **Store writes:** `setBeliefResponse(...)` → `beliefs.responses`;
  `computeBeliefsScores()` → `beliefs.tilt_profile`, `beliefs.tilts_allowed`;
  `completeBeliefsStep()`.
- **Navigates to:** `/onboarding-v2/target` (once all 8 are answered).

### Step 7 — Target (Scenarios)

**Plain English.** The heart of the flow. It presents **three illustrative
scenarios** as allocation *ranges* (not single targets), so the user can see how
different priorities would shift the shape of their portfolio:

- **Guardrail‑first** — prioritises the Safety Lights, minimal deviation.
- **Preference‑leaning** — reflects the user's beliefs, *within* guardrail budgets.
- **Neutral baseline** — minimal deviation, no tilts applied.

Each sleeve is drawn as a range bar with the current position marked. Within a
scenario, the user can inspect **example portfolios** (Low / Mid / High) chosen from
inside the ranges to make the ranges concrete. Values can be toggled between
percentages and monetary amounts. Everything is labelled *illustrative* and *not a
target*.

- **Inputs collected:** Scenario selection / example toggles / percent‑vs‑monetary
  display (view‑state only).
- **Computation:** `computeScenarios()` plus helpers in `step7Helpers.ts`
  (`computeDelta`, `computeGuardrailImpacts`, `computeSafetyLightsForScenario`,
  `computeExamplePortfolioSet`, `pctToMonetary`, etc.). See
  [Scenario range generation](#scenario-range-generation). When tilts are locked,
  the Preference‑leaning scenario collapses toward the guardrail/neutral shape.
- **Store writes:** `computeScenarios()` → `scenario.scenarios[]`;
  `setActiveScenario(...)` → `scenario.active_scenario`.
- **Navigates to:** `/onboarding-v2/next-steps`.

### Step 8 — Next Steps

**Plain English.** A calm summary of "what matters most right now". It restates the
user's current safety position, lists the Safety Lights ordered by severity (red
first), shows the status of each preference signal (applied / partially applied /
constrained / locked / not applied), and produces a neutral **review checklist** of
3–6 prompts. A button can optionally ask the AI to re‑phrase this into a friendly
paragraph — but that text is strictly validated for compliance.

- **Inputs collected:** None.
- **Computation / API:** A deterministic checklist is built locally (always 3–6
  bullets, with safe fallbacks). An optional **POST `/api/translate/next-steps`** call
  re‑phrases a structured payload into prose. The response is validated both
  server‑side and client‑side against the [banned‑words policy](#non-advisory-guardrails--banned-words-policy);
  on any failure the UI falls back to the deterministic summary.
- **Store writes:** `completeNextStepsStep()`.
- **Navigates to:** `/onboarding-v2/plan/transition`.

### Step 9 — Plan: Transition

**Plain English.** A *constraints lens*, not a plan. It explains the structural and
policy factors that would govern the *pace and sequencing* of any change if one were
ever considered — for example, capital‑gains pacing over multiple years. Three summary
cards show the safety status, whether tilts are allowed, and the policy pacing limits;
a numbered list details each structural consideration. If a Safety Light is RED, a
prominent banner explains that preference signals are locked. The constraints can be
exported as CSV.

- **Inputs collected:** None.
- **Computation / API:** **GET `/api/onboarding-v2/policy`** loads the policy config.
  `buildTransitionTimeline(safetyLights, tilts_allowed, policy)` and
  `generateTransitionCSV(...)` (from `step9Helpers.ts`) build the list and export.
  The pacing note surfaces `policy.cgt.min_reduce_plan_years`.
- **Store writes:** None (reads `analysis` and `beliefs`).
- **Navigates to:** `/onboarding-v2/plan/wrappers`.

### Step 10 — Plan: Wrappers

**Plain English.** Shows how the current portfolio is held across account types
("wrappers") — ISA, SIPP, GIA, and others — grouped into a table with each wrapper's
value, share of the total, illustrative role, and priority. Because wrappers affect
tax, access, and how easily assets can be moved, this gives context on which parts of
the portfolio are flexible vs. constrained. When eligible, a **Bed & ISA** badge
appears with the reasons. A red Safety Light again locks tilts via a banner. If no
wrapper data was captured, a "missing inputs" banner points the user back to Holdings.

- **Inputs collected:** None.
- **Computation / API:** **GET `/api/onboarding-v2/policy`**.
  `computeWrapperSummaries(holdings, policy.wrappers.priority_order)` groups holdings;
  `bedAndIsaEligible(holdings, policy.wrappers.bed_and_isa.min_gain_trigger_gbp)`
  decides the badge (both from `step9Helpers.ts`).
- **Store writes:** None (reads `holdings`, `analysis`, `beliefs`).
- **Navigates to:** `/onboarding-v2/report`.

### Output screen — Report

**Plain English.** Not an extra step — a consolidation of everything into a single
shareable snapshot. It shows an executive snapshot (Safety Lights pills, primary
constraint, preference status), the current portfolio by asset class and region,
guardrail detail, a preferences table, and the illustrative scenario ranges. The user
can print it to PDF or export the underlying data as JSON.

- **Computation / API:** **GET `/api/onboarding-v2/policy`**; rendering uses
  `step9Helpers`, `step7Helpers`, and `scenarioInterpretation`.
- **Outputs:** **PDF** via `window.print()` (browser print‑to‑PDF); **JSON** via a
  local `Blob` download of the consolidated `reportData`. (A server‑side share‑link
  generator is not part of the current Report code — export is local PDF/JSON.)

---

## 4. Engine deep‑dives

### Safety Lights

**Plain English.** Three traffic‑light checks that decide whether the portfolio is
structurally safe. Green is fine, amber is caution, red is a hard problem that locks
preferences.

**Technical.** Computed in `server/services/analysis.ts` (`computeSafetyLights`) using
thresholds from `server/config/policy_defaults.yaml`.

| Light | Formula | GREEN | AMBER | RED |
|-------|---------|-------|-------|-----|
| **Liquidity** (cash runway) | `liquid_cash_gbp / (annual_essential_spend_gbp / 12)` | ≥ 9 months | 6–9 months | < 6 months |
| **Concentration** (largest line) | `max(holding_value) / total_portfolio_value` | ≤ 15% | 15–20% | > 20% |
| **Illiquids** | `sum(illiquid_value) / total_portfolio_value` | ≤ 15% | 15–25% | > 25% |

Threshold sources in policy config: liquidity `min_cash_months: 6` with
`cash_amber_multiple: 1.5` (→ 9 months); concentration `max_single_name_pct: 0.20`
with `concentration_amber_fraction: 0.75` (→ 15%); illiquids `max_weight_pct: 0.25`
with `amber_fraction: 0.60` (→ 15%). The **overall status** is the worst of the three.
Any RED sets `tilts_allowed = false` downstream.

> Note: an older `attached_assets/Analysis_Logic_Documentation.md` lists different
> illiquid bands (7%/10%). The values above are the ones actually configured in
> `policy_defaults.yaml` and used by the running code; treat the YAML as the source of
> truth.

### Persona engine

**Plain English.** Matches the investor to one of eight recognisable "families" based
on weighted personality traits, with a few obvious‑case shortcuts (a founder with a
big business, a landlord, or a heavy crypto holder get matched directly).

**Technical.** `server/services/personaEngine.ts`.

- **8 persona families:** `CORE_GROWTH`, `SELF_DIRECTED_GROWTH`, `BALANCED_ALLOCATOR`,
  `INCOME_STABILITY`, `CAPITAL_PRESERVATION`, `FOUNDER_ENTREPRENEUR`, `PROPERTY_LED`,
  `ALTERNATIVES_FOCUSED`.
- **6 weighted traits:** `risk_appetite`, `alternatives_bias`, `property_bias`,
  `liquidity_comfort`, `income_orientation`, `complexity_proxy` (each 0.0–1.0).
- **Weighted matching:** each persona has a weight vector in `PERSONA_WEIGHT_TABLE`
  whose weights sum to 1.0. `match_score = Σ (trait[t] × weight[t])`; the winner is
  the highest score. `match_confidence = topScore − secondScore` (clamped 0–1). No
  hidden boosts on the *scores* — scoring itself is transparent.
- **Eligibility filter:** before picking the winner, certain personas can be excluded
  from contention based on context — notably, `SELF_DIRECTED_GROWTH` is excluded when
  the user indicates a full‑service adviser (`FULL_SERVICE_ADVISER`).
- **Hard overrides** (checked *before* weighted matching, in priority order):
  1. `FOUNDER_ENTREPRENEUR` if private‑business wealth ≥ 25% (`businessDominance ≥ 0.25`).
  2. `PROPERTY_LED` if `propertyDominance ≥ 0.30`. Note `propertyDominance` is not raw
     property weight: when the user's focus includes buy‑to‑let (`PROPERTY_BTL`) a
     `+0.15` boost is added (`propertyDominance = property_pct + 0.15`), so the
     override can trigger below 30% raw property.
  3. `ALTERNATIVES_FOCUSED` if `has_crypto === true` **and** `crypto_alloc_band === 'GT_25'`.

### Beliefs → tilt scoring

**Plain English.** Turns 8 agree/disagree answers into directional tilts with a
strength, then gates them behind the Safety Lights.

**Technical.**

- Each 1–5 answer normalises to a score in **−1.0 … +1.0**.
- **Direction:** `score > 0.20` → `TOWARDS`; `score < −0.20` → `AWAY`; else `NEUTRAL`.
- **Intensity:** `|score| ≥ 0.8` → `STRONG`; `≥ 0.5` → `MODERATE`; `≥ 0.2` → `LIGHT`;
  else `NEUTRAL`.
- **Inversion:** `VOLATILITY_AVERSION` is the inverse of the `Q_VOLATILITY_COMFORT`
  response.
- **Guardrails‑dominate:** if any Safety Light is RED, `tilts_allowed = false`; the
  tilt profile is still stored but is *not* applied to the target scenarios.

### Scenario range generation

**Plain English.** Builds the three Target scenarios as allocation ranges, applies
the user's tilts only where guardrails allow, and produces concrete example
portfolios so the ranges are easy to interpret.

**Technical.** Driven by `computeScenarios()` in the store plus helpers in
`client/src/lib/step7Helpers.ts` and interpretation copy in
`scenarioInterpretation.ts`:

- `computeDelta` / `computeTotalMovement` — change vs. current per sleeve and overall.
- `computeGuardrailImpacts` / `computeSafetyLightsForScenario` — re‑checks safety for
  a candidate scenario and marks each tilt's application status (`APPLIED`,
  `PARTIALLY_APPLIED`, `CONSTRAINED`, `LOCKED`, `NOT_APPLIED`).
- `computeExamplePortfolioSet` — derives Low / Mid / High example portfolios from
  inside the ranges; `generateExampleDiffersSummary` explains what differs.
- `pctToMonetary` / `formatMonetary*` — percent↔£ display toggle (with
  `MONETARY_DISCLAIMER`). Ranges identical across scenarios are explicitly called out.

---

## 5. Cross‑cutting systems

### Non‑advisory guardrails & banned‑words policy

**Plain English.** Any AI‑generated text is held to a strict no‑advice standard. If
the AI slips into advice‑like or judgemental language, the platform throws the output
away and shows the safe, deterministic version instead.

**Technical.** Enforced for the `/api/translate/next-steps` output both server‑side
(`validateAIOutput`) and client‑side (`validateAIOutputClient` in `NextSteps.tsx`):

- **Banned words** (30+) span advice verbs (`should`, `recommend`, `buy`, `sell`,
  `allocate`, `rebalance`, `increase`, `decrease`, `switch`, `guarantee`, `expect`,
  `predict`, `outperform`, `alpha`), judgement adjectives (`positive`, `negative`,
  `strong`, `weak`, `good`, `bad`, `bullish`, `bearish`, `aggressive`,
  `conservative`, …), intensity modifiers (`significant`, `substantial`, `slight`,
  `modest`, …), and direction judgements (`inclination`, `tendency`, `leaning`).
- The text must **end with exactly one** copy of the compliance line
  **"Illustrative only. Not financial advice."**
- Any failure → the UI silently falls back to the deterministic checklist/summary.

> **Hard checks vs. prompt guidance.** The *strictly validated* rules are only the
> two above: the banned‑words list and the single trailing compliance line. Using
> neutral verbs (`indicates`, `shows`) and canonical axis labels (e.g.
> `Volatility Comfort`, `ESG Tilt`) is *instructed in the prompt* to the model but is
> not enforced by the validators.

### The onboarding store (state model)

**Plain English.** A single in‑browser store holds everything the user has entered
and everything the engines compute, persisted so a refresh doesn't lose progress.

**Technical.** `client/src/state/onboardingV2Store.ts` — a Zustand store with the
`persist` middleware (localStorage). Top‑level slices:

| Slice | Type | Key fields |
|-------|------|-----------|
| `intake` | `IntakeData` | `intake_method`, `full_name`, `annual_income_gbp`, …, `personaCues: PersonaCues` |
| `holdings` | `Holding[]` | `id`, `instrument_name`, `asset_class`, `value_gbp`, `illiquid` |
| `summary` | `PortfolioSummary` | `total_investable_value`, `largest_line_pct`, `illiquid_pct` |
| `analysis` | `AnalysisState` | `status: AnalysisStatus`, `result: AnalysisResult \| null` |
| `beliefs` | `BeliefsState` | `responses`, `tilt_profile: TiltProfileEntry[]`, `tilts_allowed: boolean` |
| `scenario` | `ScenarioState` | `active_scenario: ScenarioType`, `scenarios: IllustrativeScenario[]` |

`PersonaCues` includes `age_band`, `portfolio_stage`, `investing_focus[]`,
`has_crypto` (and the paired bands described under Intake). Main actions:
`updateIntake`, `updatePersonaCues`, `setHoldings` / `addHolding` / `updateHolding` /
`removeHolding`, `recalculateSummary`, `resetAnalysis`, `setAnalysisLoading` /
`setAnalysisResult` / `setAnalysisError`, `setBeliefResponse`, `computeBeliefsScores`,
`completeBeliefsStep`, `computeScenarios`, `setActiveScenario`, `completeNextStepsStep`.

### API endpoints

| Method & path | Used by | Purpose |
|---------------|---------|---------|
| `POST /api/onboarding-v2/analyse` | Step 5 Analysis | Compute Safety Lights + persona from intake & holdings |
| `GET /api/onboarding-v2/policy` | Steps 9, 10, Report | Load policy config (thresholds, wrapper priority, pacing) |
| `POST /api/translate/next-steps` | Step 8 Next Steps | Re‑phrase a structured payload into compliant prose (validated) |

These are implemented in `server/routes.ts` (around lines 2553–2774).

### Policy configuration

**Plain English.** All the "magic numbers" live in one config file so they can be
tuned without touching code.

**Technical.** `server/config/policy_defaults.yaml` (loaded via the policy endpoint):

- **Safety Light thresholds** — see [Safety Lights](#safety-lights).
- **Wrapper priority order** — `ISA → SIPP → GIA`.
- **Bed & ISA trigger** — only suggest if unrealised gain exceeds
  `min_gain_trigger_gbp: 1000`.
- **CGT pacing** — spread large reductions over at least `min_reduce_plan_years: 3`.

---

## 6. Report outputs

**Plain English.** The Report screen is the deliverable — one page that gathers the
whole journey into a snapshot a user can keep or share.

**Technical.** Sections rendered: executive snapshot (Safety Lights pills, primary
constraint, preference status), current portfolio by asset class & region (%, £),
guardrail detail (cash runway, largest position, illiquid exposure), preferences
table (`AppliedTiltEntry`: axis, application status, constraint reason), and
illustrative scenario ranges (Low/High across Guardrail‑first vs. Preference‑leaning).

- **PDF:** `window.print()` (browser print‑to‑PDF).
- **JSON:** local `Blob` download of the consolidated `reportData` object.
- The screen reads policy via `GET /api/onboarding-v2/policy` and reuses
  `step9Helpers`, `step7Helpers`, and `scenarioInterpretation` for figures and copy.

---

## 7. Source references

**Pages** — `client/src/pages/onboarding-v2/`: `Welcome.tsx`, `Method.tsx`,
`Intake.tsx`, `Holdings.tsx`, `Analysis.tsx`, `Beliefs.tsx`, `Target.tsx`,
`NextSteps.tsx`, `PlanTransition.tsx`, `PlanWrappers.tsx`, `Report.tsx`.

**Components** — `client/src/components/onboarding-v2/`: `OnboardingLayout.tsx`,
`StepIndicator.tsx` (`TOTAL_STEPS`), `PersonaCard.tsx`, `PortfolioSnapshot.tsx`.

**State & helpers** — `client/src/state/onboardingV2Store.ts`,
`client/src/lib/step7Helpers.ts`, `client/src/lib/step9Helpers.ts`,
`client/src/lib/scenarioInterpretation.ts`, `client/src/utils/personaRules.ts`,
`client/src/utils/beliefProcessing.ts`.

**Server** — `server/services/analysis.ts`, `server/services/personaEngine.ts`,
`server/config/policy_defaults.yaml`, `server/routes.ts` (≈ 2553–2774).

**Background docs** — `attached_assets/Analysis_Logic_Documentation.md`,
`PERSONA_AND_BELIEF_LOGIC.md`, `docs/onboarding-v2-overview.md` (note: the overview
predates the Next Steps step and lists 9 routes; this manual is the current
reference). The old `Demo_Platform_User_Manual.md` documents the unrelated legacy
6‑step demo flow and is superseded here for onboarding.
