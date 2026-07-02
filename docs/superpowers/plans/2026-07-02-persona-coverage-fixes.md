# Persona Coverage Fixes Implementation Plan (Workstream D closure)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Close the cheap+moderate gaps from the persona validation report's coverage matrix (D-recs 1-8, 10) — dead inputs, an unreachable persona, a founder-override that fires on uncertainty, and a stale server fallback. Rec 9 (bridge Q_VOLATILITY_COMFORT into the persona engine) is **not attempted**: traced navigation shows Holdings → Analysis → Beliefs in the primary flow, so beliefs answers don't exist yet when the persona engine first runs — bridging it would require restructuring step order or adding a re-analysis pass, out of scope for a coverage-fix PR. Noted in the PR as a structural follow-on, not a decision gate.

**Branch:** `feat/persona-coverage-fixes` off main@7567433 (created). **Baselines: 352 tests green, tsc 158.**

**Architecture:** No UI restructuring beyond one default-state flip and one dropdown option. All trait-weighting changes are additive branches inside the existing T1-T6 compute functions in `server/services/personaEngine.ts`, verified against the existing fixture style in `tests/onboardingV2.test.ts` (persona fixtures from line ~638) so no existing pinned test breaks.

## Design decision: CAPITAL_PRESERVATION differentiator (rec 1 + rec 10, combined)

The report found CAPITAL_PRESERVATION reachable only through a contradiction (needs high income_orientation while its own defining goal, "preserve capital," contributes nothing). Naively wiring `preserve_capital` into `income_orientation` would make things WORSE: CAPITAL_PRESERVATION's income weight (0.44) is LOWER than INCOME_STABILITY's (0.52), so boosting income_orientation favours the wrong persona.

The correct lever is **liquidity_comfort**: CAPITAL_PRESERVATION's liquidity/income weight ratio is 0.36/0.44 = 0.82; INCOME_STABILITY's is 0.28/0.52 = 0.54. CAPITAL_PRESERVATION weighs liquidity relatively higher. Boosting `liquidity_comfort` (not `income_orientation`) for `preserve_capital` goal correctly differentiates the two personas without a full weight-table retune (the report's "expensive" option). This closes rec 1 and rec 10 in one semantically-correct move.

---

### Task 1: Server engine fixes (recs 5, 6, 7, 8, 10 + stale-fallback fix)

**Files:**
- Modify: `server/services/personaEngine.ts`, `server/services/analysis.ts`
- Test: `tests/personaCoverage.test.ts` (new)

- [ ] **Step 1: Write failing tests**

Create `tests/personaCoverage.test.ts`. Build `InvestorProfile` fixtures matching the shape used in `tests/onboardingV2.test.ts` (~line 638 `ALTERNATIVES_FOCUSED_FIXTURE`) — read that file first to copy the exact fixture shape (all required `InvestorProfile` fields).

```ts
import { describe, it, expect } from 'vitest';
import { computePersona, computeTraitScores } from '../server/services/personaEngine';

// Copy the base fixture shape from tests/onboardingV2.test.ts's persona fixtures.
// Each test below overrides only the fields it needs on top of that base.

describe('rec 7: time horizon vocabulary', () => {
  it('medium (3-7yrs) scores between short and long, not equal to short', () => {
    const base = (horizon: string) => (/* base fixture with time_horizon: horizon, everything else neutral */);
    const shortScore = computeTraitScores(base('short')).risk_appetite;
    const mediumScore = computeTraitScores(base('medium')).risk_appetite;
    const longScore = computeTraitScores(base('long')).risk_appetite;
    expect(mediumScore).toBeGreaterThan(shortScore);
    expect(mediumScore).toBeLessThan(longScore);
  });
});

describe('rec 8: NOT_SURE business band does not auto-fire the founder override', () => {
  it('owns_business + NOT_SURE routes to weighted matching, not a hard override', () => {
    const profile = /* base fixture with personaCues.owns_business=true, private_business_wealth_band='NOT_SURE', otherwise neutral/low-business-signal */;
    const result = computePersona(profile);
    expect(result.assignment_basis).toBe('WEIGHTED_MATCH');
    expect(result.match_confidence).toBeLessThan(1.0);
  });

  it('owns_business + GT_50 still fires the hard override (regression guard)', () => {
    const profile = /* same base, private_business_wealth_band='GT_50' */;
    const result = computePersona(profile);
    expect(result.code).toBe('FOUNDER_ENTREPRENEUR');
    expect(result.assignment_basis).toBe('HARD_OVERRIDE');
  });
});

describe('rec 6: self-directed signal + I_AM_AN_ADVISER handling', () => {
  it('individual-shares focus increases risk_appetite over a no-focus baseline', () => {
    const base = /* fixture with investing_focus: [] */;
    const withFocus = { ...base, personaCues: { ...base.personaCues, investing_focus: ['INDIVIDUAL_SHARES'] } };
    expect(computeTraitScores(withFocus).risk_appetite).toBeGreaterThan(computeTraitScores(base).risk_appetite);
  });

  it('I_AM_AN_ADVISER is excluded from SELF_DIRECTED_GROWTH like FULL_SERVICE_ADVISER', () => {
    const profile = /* a profile that would otherwise weight-match to SELF_DIRECTED_GROWTH, with adviser_usage: 'I_AM_AN_ADVISER' */;
    const result = computePersona(profile);
    expect(result.code).not.toBe('SELF_DIRECTED_GROWTH');
  });
});

describe('rec 5: DB pension coverage and employer stock band feed traits', () => {
  it('GT_75 DB income coverage increases income_orientation over NOT_SURE', () => {
    const base = (band: string) => (/* fixture with has_defined_benefit_pension=true, db_income_coverage_band=band */);
    expect(computeTraitScores(base('GT_75')).income_orientation)
      .toBeGreaterThan(computeTraitScores(base('NOT_SURE')).income_orientation);
  });

  it('GT_30 employer stock band increases complexity_proxy over LT_5', () => {
    const base = (band: string) => (/* fixture with has_employer_stock=true, employer_stock_alloc_band=band */);
    expect(computeTraitScores(base('GT_30')).complexity_proxy)
      .toBeGreaterThan(computeTraitScores(base('LT_5')).complexity_proxy);
  });
});

describe('rec 1+10: capital preservation differentiator', () => {
  it('preserve_capital goal raises liquidity_comfort relative to grow_wealth, at equal cash/runway', () => {
    const base = (goal: string) => (/* fixture with primary_goal: goal, moderate cash/runway inputs */);
    expect(computeTraitScores(base('preserve_capital')).liquidity_comfort)
      .toBeGreaterThan(computeTraitScores(base('grow_wealth')).liquidity_comfort);
  });

  it('a preservation-postured profile (very_low risk, preserve_capital goal, ample liquidity, not drawdown) now resolves to CAPITAL_PRESERVATION', () => {
    const profile = /* very_low risk_comfort, primary_goal: 'preserve_capital', portfolio_stage: 'ACCUMULATING' (NOT drawdown — this is the case the report found unreachable), 20%+ cash, 12mo+ runway */;
    const result = computePersona(profile);
    expect(result.code).toBe('CAPITAL_PRESERVATION');
  });

  it('an income-focused profile still resolves to INCOME_STABILITY (no regression)', () => {
    const profile = /* portfolio_stage: 'PRIMARILY_DRAWDOWN', primary_goal: 'income_focus', low risk_comfort */;
    expect(computePersona(profile).code).toBe('INCOME_STABILITY');
  });
});
```

Run: `npm test -- personaCoverage` → FAIL (behaviour not yet implemented).

- [ ] **Step 2: Implement rec 7 (horizon vocabulary)**

In `computeRiskAppetite` (`personaEngine.ts` ~line 761), replace:

```ts
const horizonScalar = isLongHorizon(profile) ? 1.0 : 
                      profile.time_horizon === '5_9' ? 0.6 : 0.3;
```

with:

```ts
const horizonLower = (profile.time_horizon || '').toLowerCase();
const horizonScalar = isLongHorizon(profile) ? 1.0
  : (horizonLower === 'medium' || horizonLower === '5_9') ? 0.6
  : 0.3;
```

- [ ] **Step 3: Implement rec 8 (NOT_SURE founder override)**

In `getBusinessDominance` (~line 365), change the `NOT_SURE` band score from `0.25` to `0.15` (matches `computeComplexityProxy`'s own NOT_SURE treatment for consistency — a NOT_SURE answer no longer meets the `>= 0.25` override threshold, so it flows into weighted matching instead, where `complexity_proxy` still picks it up).

```ts
const bandScore: Record<string, number> = {
  'LT_10': 0.05,
  '10_25': 0.175,
  '25_50': 0.375,
  'GT_50': 0.60,
  'NOT_SURE': 0.15,
};
```

- [ ] **Step 4: Implement rec 6 (self-directed signal + adviser handling)**

In `computeRiskAppetite`, add an INDIVIDUAL_SHARES boost before the adviser multiplier:

```ts
const focusBoost = profile.personaCues.investing_focus?.includes('INDIVIDUAL_SHARES') ? 0.05 : 0;
const rawScore = 0.35 * riskBase + 0.20 * horizonScalar + 0.45 * allocationTerm + focusBoost;
```

In `assignPrimaryPersonaWithMatching`, extend the exclusion filter (~line 521):

```ts
if (profile.personaCues.adviser_usage === 'FULL_SERVICE_ADVISER' || profile.personaCues.adviser_usage === 'I_AM_AN_ADVISER') {
  matches = matches.filter(m => m.code !== 'SELF_DIRECTED_GROWTH');
}
```

(Rationale for I_AM_AN_ADVISER: a financial-adviser-professional answering for themselves is not the target "self-directed growth investor" persona voice; same exclusion as full-service.)

- [ ] **Step 5: Implement rec 5 (DB pension + employer stock bands)**

In `computeIncomeOrientation` (~line 845), add after the existing DB-independent logic:

```ts
const dbBand = profile.personaCues.db_income_coverage_band;
if (profile.personaCues.has_defined_benefit_pension && dbBand) {
  const dbBoost: Record<string, number> = { 'GT_75': 0.15, '50_75': 0.10, '25_50': 0.05, 'LT_25': 0, 'NOT_SURE': 0.05 };
  score += dbBoost[dbBand] || 0;
}
```

In `computeComplexityProxy` (~line 878), replace the flat employer-stock line:

```ts
if (profile.personaCues.has_employer_stock) {
  score += 0.15;
}
```

with a banded version:

```ts
if (profile.personaCues.has_employer_stock) {
  const stockBand = profile.personaCues.employer_stock_alloc_band;
  const stockBoost: Record<string, number> = { 'LT_5': 0.08, '5_15': 0.11, '15_30': 0.14, 'GT_30': 0.18, 'NOT_SURE': 0.11 };
  score += stockBoost[stockBand || 'NOT_SURE'] || 0.11;
}
```

(Both stay within the original 0.15-weight envelope at the NOT_SURE midpoint, so profiles that only ever answered the boolean toggle see no change — only band-answering profiles differentiate.)

- [ ] **Step 6: Implement rec 1+10 (capital preservation differentiator)**

In `computeLiquidityComfort` (~line 825), add before the final return:

```ts
// rec 1+10: 'preserve_capital' is a stronger liquidity-comfort signal, relatively, than an
// income signal — CAPITAL_PRESERVATION's liquidity/income weight ratio (0.36/0.44=0.82) is
// higher than INCOME_STABILITY's (0.28/0.52=0.54), so this differentiates the two personas
// correctly where boosting income_orientation would have favoured the wrong one.
const preservationBoost = (profile.primary_goal || '').toLowerCase() === 'preserve_capital' ? 0.12 : 0;
return Math.min(1, Math.max(0, runwayScore * 0.5 + cashScore * 0.25 - illiquidPenalty * 0.25 + preservationBoost));
```

- [ ] **Step 7: Fix the stale `defaultPersonaCues` fallback in `analysis.ts`**

Read the current `PersonaCues` interface in `personaEngine.ts` (exported, has: age_band, portfolio_stage, investing_focus, has_defined_benefit_pension, db_income_coverage_band, owns_business, private_business_wealth_band, has_employer_stock, employer_stock_alloc_band, has_crypto, crypto_alloc_band, adviser_usage, is_cross_border). Replace `analysis.ts`'s `defaultPersonaCues` (~line 197, currently missing several required fields and carrying a stale `has_meaningful_crypto` key) with a literal matching the CURRENT interface exactly — all fields `null` or `[]` as appropriate, no `has_meaningful_crypto`, add `has_crypto: null, crypto_alloc_band: null, db_income_coverage_band: null, private_business_wealth_band: null, employer_stock_alloc_band: null`.

- [ ] **Step 8: Run tests, verify, commit**

`npm test -- personaCoverage` → all pass. `npm test` → all green (352 + however many new tests). `npm run check 2>&1 | grep -c "error TS"` → 158 or LOWER (the stale-fallback fix may remove a pre-existing type error — if it drops below 158, that's a genuine improvement; note the new number).

```bash
git add server/services/personaEngine.ts server/services/analysis.ts tests/personaCoverage.test.ts
git commit -m "fix(persona): close coverage gaps — horizon vocabulary, founder-override certainty, DB/employer-stock bands, capital-preservation differentiator"
```

---

### Task 2: UI fixes (recs 2, 3, 4)

**Files:**
- Modify: `client/src/pages/onboarding-v2/Holdings.tsx`, `client/src/pages/onboarding-v2/Intake.tsx`

- [ ] **Step 1: rec 2 — add crypto to Holdings ASSET_CLASSES**

In `Holdings.tsx`, the `ASSET_CLASSES` array (~line 27), add before `other`:

```ts
{ value: 'crypto', label: 'Crypto / Digital Assets' },
```

No other change needed — `Analysis.tsx`'s `computeAssetClassBreakdown` (~line 110-128) already has a `name.includes('crypto')` branch that currently can never match; this makes it reachable. Verify by reading that function once more to confirm `normalizeKey('crypto')` → `'Crypto'` still matches `.includes('crypto')` after `.toLowerCase()` (it does — the check lowercases first).

- [ ] **Step 2: rec 3 — auto-expand the Investor Profile section**

In `Intake.tsx` (~line 51), change:

```ts
const [showInvestorProfile, setShowInvestorProfile] = useState(false);
```

to:

```ts
const [showInvestorProfile, setShowInvestorProfile] = useState(true);
```

(Keeps the collapsible affordance — a returning/impatient user can still hide it — but the section carrying `portfolio_stage`, the highest-leverage T5 input, and 2 of 3 hard-override inputs is now visible by default instead of requiring a discovery click.)

- [ ] **Step 3: rec 4 — default `is_cross_border` from collected signals**

In `Intake.tsx`, find where `personaCues.is_cross_border` is read/set (grep `is_cross_border`). Add a `useEffect` that defaults it (without overriding an explicit user toggle) — read the surrounding code first to find the right hook location; the pattern should be: if the user has NOT explicitly touched the cross-border toggle yet (track via a local `crossBorderTouched` ref/state, defaulting false) AND `intake.region !== 'uk'`, set `personaCues.is_cross_border = true`. Do not attempt to read holding currencies for this — that data isn't available on the Intake screen (Holdings is a later step); scope this to the `region` signal only, which IS available on Intake. If wiring a `useEffect` safely proves awkward given the form's existing state management, it is acceptable to SKIP this step and note it as not attempted (this is the one item in this task with a real implementation-risk judgment call — do not force a fragile effect that could cause an infinite update loop with react-hook-form).

- [ ] **Step 4: Verify, commit**

`npm test` → same count as Task 1 end (UI-only, no new tests expected unless step 3 was implemented — if implemented, no test infra exists for this component's effects; verification is the browser walk in Task 3). `npm run check 2>&1 | grep -c "error TS"` → same as Task 1 end.

```bash
git add client/src/pages/onboarding-v2/Holdings.tsx client/src/pages/onboarding-v2/Intake.tsx
git commit -m "feat(onboarding): crypto asset class, investor-profile auto-expand, cross-border default"
```

---

### Task 3: Verification + PR (controller)

- [ ] Full suite + tsc vs Task 1's end-state baselines.
- [ ] Browser walk: seed a preservation-postured profile (very_low risk, preserve_capital, accumulating, high cash/runway) → confirm CAPITAL_PRESERVATION; seed owns_business+NOT_SURE → confirm weighted match not hard override, confidence <1.0, code plausibly still FOUNDER_ENTREPRENEUR-adjacent or something else entirely (either is fine — the point is it's no longer a false-certain override); add a crypto holding on Holdings → confirm it shows as its own line in the unmodelled/asset-class breakdown wherever visible; toggle the Investor Profile section defaults open.
- [ ] Merge main, push, PR. Body names rec 9 as a structural (not decision) deferral with the traced navigation evidence, and rec 4's cross-border step as skipped-if-risky per Task 2 Step 3's judgment call.
