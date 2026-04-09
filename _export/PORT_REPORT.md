# Engine Port Report — v1 to @unlock/shared

**Date:** 2026-04-09
**Total files:** 7
**Total lines:** 2,237
**Typecheck:** `npx tsc --noEmit --strict` — PASS (0 errors)

---

## Engine 1 — EIS/SEIS Calculator

**File:** `eisSeisCalculator.ts` (485 lines)

**Sources:**
- `client/src/components/SEISEISCalculation.ts` (calculateSEISEIS)
- `client/src/utils/calculators.ts` (calcAllowance, calcLossRelief, calcCGTDeferral)

**Exports (7 functions, 10 interfaces, 5 constants):**
- `computeSEISEIS(inputs)` — merged two-year SEIS/EIS calculator (renamed from `calculateSEISEIS`)
- `computeAllowance(inputs)` — single-scheme allowance calculator (renamed from `calcAllowance`)
- `computeLossRelief(inputs)` — loss relief calculator (renamed from `calcLossRelief`)
- `computeCGTDeferral(inputs)` — CGT deferral/reinvestment calculator (renamed from `calcCGTDeferral`)
- `formatCurrency(amount)`, `formatPercentage(value, decimals)`
- `SEIS_RATE`, `SEIS_CAP`, `EIS_RATE`, `EIS_CAP_ANY`, `EIS_CAP_TOTAL`
- All input/output interfaces: `SEISEISInputs`, `SEISEISResult`, `AllowanceInputs`, `AllowanceResult`, `LossReliefInputs`, `LossReliefResult`, `CGTDeferralInputs`, `CGTDeferralResult`

**Changes from source:**
- Function names prefixed with `compute` for consistency (`calculateSEISEIS` → `computeSEISEIS`, `calcAllowance` → `computeAllowance`, etc.)
- Removed all React / codebase-internal imports
- No logic changes

---

## Engine 2 — Monte Carlo Simulation

**Files:** `simulationConfig.ts` (189 lines) + `simulationEngine.ts` (407 lines) = 596 lines

**Sources:**
- `server/lib/simulate/engine_v2.ts` (simulateV2)
- `server/config/buckets.ts` (CANONICAL_BUCKETS, Bucket)
- `server/config/scenarios.ts` (SCENARIO_PRIORS, blendScenarioTemplates)
- `server/config/scenarioShocks.ts` (SCENARIO_SHOCKS)
- `server/config/scenarioVols.ts` (SCENARIO_VOLS)
- `server/config/correlations.ts` (CORRELATION, BUCKET_ORDER, defaultCorrelation)
- `server/data/scenarios.ts` (SCENARIOS, LEGACY_SCENARIO_IDS, etc.)

**Exports — simulationConfig.ts (17 exports):**
- `CANONICAL_BUCKETS`, `Bucket`, `ScenarioShocks`
- `SCENARIO_SHOCKS`, `SCENARIO_VOLS`, `SCENARIO_LABELS`, `FACTORS`
- `defaultCorrelation()`, `CORRELATION`, `BUCKET_ORDER`
- `SCENARIO_PRIORS`, `blendScenarioTemplates()`
- `SCENARIOS`, `LEGACY_SCENARIO_IDS`, `ASSET_CLASS_MAPPING`, `IG_CREDIT_SHOCKS`, `CRYPTO_SPLIT_CONFIG`

**Exports — simulationEngine.ts (6 exports):**
- `simulate(req)` — main Monte Carlo + deterministic simulation (renamed from `simulateV2`)
- `SimV2Request`, `SimV2Response`, `FanPoint`, `MultiHorizonSummary`, `RebalanceMode`

**Changes from source:**
- `simulateV2` renamed to `simulate`
- All 6 config files consolidated into `simulationConfig.ts`
- `server/data/scenarios.ts` data (8 named scenarios) merged into `simulationConfig.ts`
- Removed all Express/Drizzle/server-path imports
- No logic changes

---

## Engine 3 — Safety Lights + Persona

**Files:** `policyDefaults.ts` (84 lines) + `personaDefaults.ts` (126 lines) + `safetyLights.ts` (155 lines) + `personaEngine.ts` (791 lines) = 1,156 lines

**Sources:**
- `server/config/policy_defaults.yaml` + `server/services/policy.ts`
- `server/config/personaDefaults.ts`
- `server/services/analysis.ts` (computeSafetyLights)
- `server/services/personaEngine.ts` (computePersona, computeTraitScores, etc.)

**Exports — policyDefaults.ts (9 exports):**
- `Policy`, `ProjectionPolicy`, `CollectiblesPolicy`, `FactorsPolicy`, `CgtPolicy`, `BedAndIsaPolicy`, `WrappersPolicy`
- `POLICY_DEFAULTS` — YAML converted to typed TypeScript constant
- `applyPolicyOverrides(base, overrides)`

**Exports — personaDefaults.ts (4 exports):**
- `CANONICAL_BUCKETS`, `Bucket`, `Mix`, `PERSONA_DEFAULTS`

**Exports — safetyLights.ts (6 exports):**
- `computeSafetyLights(intake, policy?)` — pure function, policy passed as parameter (defaults to POLICY_DEFAULTS)
- `SafetyStatus`, `OverallStatusCode`, `Intake`, `SafetyLightsMetrics`, `SafetyLightsResult`

**Exports — personaEngine.ts (23 exports):**
- `computePersona(profile)` — main persona assignment
- `computeTraitScores(profile)` / `computeTraits(profile)` — T1-T6 trait computation
- `buildWhyFitsBullets(profile, traitScores)` — input-grounded bullet generation
- `PRIMARY_PERSONAS` — 8 persona definitions
- All types: `PersonaCues`, `AssetClassBreakdown`, `InvestorProfile`, `PersonaResult`, `PersonaTraits`, `PortfolioTrait`, `RiskToWatch`, `ProfileIndicator`, plus all band/status types

**Changes from source:**
- YAML `policy_defaults.yaml` converted to typed `POLICY_DEFAULTS` constant (no fs/YAML runtime dependency)
- `getPolicy()` caching removed; callers pass policy directly or use `POLICY_DEFAULTS`
- `computeSafetyLights` now defaults to `POLICY_DEFAULTS` instead of calling `getPolicy()`
- `personaDefaults.ts` source had no `HY_CREDIT` key; added `HY_CREDIT: 0` to all 19 mixes for type completeness
- `analysis.ts` type mismatch fixed: source used `has_meaningful_crypto` but interface defined `has_crypto` — exported version uses `has_crypto` consistently
- Removed `analyzeOnboarding()` orchestrator (couples safety lights + persona — consumers can compose these themselves)
- Removed all Express/Drizzle/YAML/fs/path imports
- No logic changes to any computation
