# Persona validation report: reconciliation, evidence audit, and coverage (Workstreams C + D)

**Status:** validation record — feeds the persona presentation layer (Workstream B) and the copy doctrine
**Date:** 2026-07-02
**Method:** four parallel research passes (persona-set reconciliation across repo + vault + content brain; FCA source audit; ONS/Knight Frank/global-wealth-report audit; academic + industry segmentation sweep) plus a full question→persona coverage trace of the live engine. All source claims carry URLs or file:line evidence. Companion docs: `2026-07-02-persona-and-impact-follow-ups-scoping.md` (Workstream C/D briefs), `2026-07-02-legacy-wizard-forensic-audit.md` (§1.2–1.3).

---

## 1. Executive summary

1. **The four persona sets are three different purposes with partial overlap, not one taxonomy at different grains.** The live 8 (product placement) and legacy 19 (deleted quiz) are competing matching engines with incompatible mathematics; the vault's 10 P-codes × 4 engines are a marketing/content-routing model; the 3 bullseyes are a priority filter over the P-codes, not a taxonomy.
2. **The legacy "built from ONS wealth surveys, FCA segmentation studies, global wealth reports" line is unsupportable and must never return.** All three source families publish distributional statistics or small typologies for the wrong populations — none defines an HNW persona set. The honest ceiling is "informed by / calibrated against", with the specific citation line in §4.3.
3. **The live 8-persona set survives the evidence audit as the product set**: 3 personas corroborated, 4 partially corroborated, 1 (CAPITAL_PRESERVATION) unsupported as a *distinct* persona — it is near-indistinguishable from INCOME_STABILITY in both the weight table and the evidence base.
4. **The engine's inputs, not its personas, are the weak point.** 23 of the ~35 questions a user answers contribute nothing to persona placement, and the section that feeds 2 of 6 traits and 2 of 3 hard overrides is optional and collapsed by default. Ten concrete fixes are costed in §6.
5. **Working defaults adopted under the no-decision-gates rule** (Tom, 2026-07-02): persona presented as **anchor** (framing device), not input; the **live 8 = the product persona set**; the legacy 19 formally retired as a product taxonomy (retained only as a demo-investor seed catalogue). Each is reversible; draft decision record in §7.

---

## 2. The four sets, reconciled

| Set | Where | Question it answers | Carries |
|---|---|---|---|
| 19 legacy "Investment Personas" (P001–P019) | `client/src/data/personas.ts` (+ deleted quiz matcher `f036e73:client/src/hooks/usePersonaQuiz.ts`) | Demo quiz routing | 8-dim [0–5] score vectors; operative metadata (liquidityMonths, drawdownCap, biases, concentrationTolerance); **full 15-bucket reference mixes in `server/config/personaDefaults.ts`** |
| 8 live "Persona Engine v2" | `server/services/personaEngine.ts` | Live onboarding placement | Narrative content (label/one-liner/plan-focus/risks); 6-trait weight table (sums to 1.0); 3 hard overrides; **no reference mixes** |
| 10 P-codes × 4 motivational engines | Vault canon (`Projects/Unlock-Content-Brain/03_personas/`, ADR-024, FACT-020) | ICP/content routing | Structural definitions, portfolio *value ranges* (not mixes), 40 content cells with engine tiers |
| 3 year-1 bullseyes | Content brain (FACT-021) = P2 Estate Architect, P3 Operator-Owner, P5 Multi-Family Principal | Priority filter (~80% of paying clients) | Cohort labels + named observed investors |

**Cross-set mapping (live 8 → nearest kin):**

| Live persona | Legacy P00x | Vault P-code | Bullseye? |
|---|---|---|---|
| CORE_GROWTH | P008 (partial P011) | ~P1/P6, neither clean | No |
| SELF_DIRECTED_GROWTH | P006 (partial P015) | P6 Active Allocator | No (adjacent) |
| BALANCED_ALLOCATOR | P009/P010/P013 | P7 Advisory-Informed | No (deferred) |
| INCOME_STABILITY | P001/P017/P007 | P2×E1 | **Partial (P2)** |
| CAPITAL_PRESERVATION | P004/P013/P019 | P2×E1 / P8×E1 | Partial (P2) |
| FOUNDER_ENTREPRENEUR | P015 (near-exact) | P3 Operator-Owner | **Yes — strongest alignment in the taxonomy** |
| PROPERTY_LED | P002/P016 (near-exact) | **NO P-code exists** | No |
| ALTERNATIVES_FOCUSED | P003 (near-exact) | **NO P-code exists** | No |

**Named contradictions (for the canon owners):**
- **PROPERTY_LED and ALTERNATIVES_FOCUSED have no vault P-code.** Two of the three product hard-override classes — including one of the largest real-world UK HNW categories (BTL concentration) — are invisible to the marketing/content model.
- **P3's internal cohort label "DIY retirees" contradicts its own structural definition** (pre-exit business owner). Historical naming artifact; should be corrected in canon.
- **P5 Multi-Family Principal (bullseye, the most complex case in the taxonomy) maps to CAPITAL_PRESERVATION, whose complexity weight is the lowest in the table (0.10).** A real P5 entering v2 onboarding would land in INCOME_STABILITY or BALANCED_ALLOCATOR instead.
- **The two match-score semantics are dimensionally incompatible**: legacy = cosine % over weighted [0–5]⁸ vectors (`usePersonaQuiz.ts:67-70`, magnitude-blind — the audit's known flaw); live = weighted dot product over 6 traits clamped 0–1, with hard overrides pinned to 1.0 (`personaEngine.ts:461-467, 490-508`). Never mix or compare them.
- **The legacy reference mixes self-contradict**: P016 "BTL Mogul" has `propertyBias: 0.90` in `personas.ts` but `PROPERTY_UK_RESI: 0.15` in `personaDefaults.ts`; P019 (UHNW family office) holds the most defensive mix with zero alternatives. Whether the defaults are "current holdings models" or "diversification targets" is unstated. **These mixes must not be reused for a persona-vs-actual comparison without that ambiguity being resolved and the mapping to the live 8 being authored.**

---

## 3. Evidence audit: what the claimed sources actually contain

### 3.1 FCA

| Source | Year | What it defines | HNW applicability |
|---|---|---|---|
| Financial Lives Survey 2024 (n=17,950) | 2025 | Dimensional cross-tabs only; **no typology**. 61% of £10k+ investors hold ≥¾ of investable assets in cash; 9% of £250k+ hold unlisted shares | £500k+ sub-sample likely **under 400 respondents** — persona-level segmentation mathematically unsupportable |
| Financial Lives 2022 (n=19,145) | 2023 | Same structure, no typology | Same limitation |
| BritainThinks "Understanding Self-Directed Investors" (n=517) | 2021 | **3 archetypes**: "Having a Go", "Thinking It Through", "The Gambler" | Explicitly high-risk, low-wealth retail — the demographic **inverse** of Unlock's cohort |
| NMG/boobook Investment Platforms study (n=3,000+) | 2018 | **6 segments**: Controllers (13%, avg £485k), Loyalists, Hesitants, Abdicators, Optimisers, Delegators | Controllers is the ONLY FCA-adjacent segment overlapping Unlock's floor; n≈390, 2018-era |
| FCA Certified HNW definition (≥£170k income / ≥£430k net assets from 31 Jan 2024) | 2024 | Regulatory eligibility gate, not a persona | Classification only |

### 3.2 ONS / Knight Frank / global wealth reports

| Source | What it defines | Usable hard numbers |
|---|---|---|
| ONS Wealth & Assets Survey R8 (2020–22) — **note: Official Statistics accreditation suspended from R8 (response rate 41%)** | Distributions only, no typology; **business assets excluded** from decile analysis | Top-10% threshold £1.2005M; top-10% composition: property 38%, pensions 36%, financial ~15%; top-1% threshold £3.1215M |
| Advani et al. 2021 (adjusted WAS, academic) | — | At £5M+ net wealth per adult, business + financial assets dominate (official WAS undercounts) |
| Knight Frank Wealth Report 2025/2026 | No typology; attitudes via ~600 adviser proxies | UK UHNWI ($30M+) 27,876 (2026 model); 40% of UHNWIs view property as long-term investment; family-office direct RE 22.5% |
| Capgemini WWR 2025 (n≈6,500 HNWIs) | Wealth bands + 3 *mandate* categories (discretionary/advised/self-directed) — service preferences, not personas | Global HNWI allocation: cash 26%, RE 22%, FI 19%, equities 18%, alts 15% |
| UBS GWR 2025 | "EMILLI" ($1–5M) — a wealth-band label, not a behavioural type | UK millionaires ~2M+ |

### 3.3 Academic + industry segmentation (the citable scaffolding)

| Source | Types | Empirical basis | Maps to |
|---|---|---|---|
| Barnewall (1987) | Passive/Active investor | Practitioner heuristic (CFA L3 curriculum) | Active → FOUNDER_ENTREPRENEUR |
| Bailard, Biehl & Kaiser (1986) | Individualist / Adventurer / Celebrity / Guardian / Straight Arrow | Jungian derivation, no primary survey; post-hoc partial validation | Individualist → SELF_DIRECTED_GROWTH; Adventurer → ALTERNATIVES_FOCUSED; Guardian → CAPITAL_PRESERVATION/INCOME_STABILITY |
| Pompian (2008/2012, Wiley; CFA L3) | Passive Preserver / Friendly Follower / Independent Individualist / Active Accumulator | Practitioner framework + bias literature; explicitly NOT a validated predictive model | Active Accumulator → FOUNDER; Independent Individualist → SELF_DIRECTED_GROWTH; Passive Preserver → INCOME/CAP-PRES |
| LongAngle HNW Benchmark 2026 (n=233, avg NW $17M, 85% >$5M, 57% self-manage) | Functional segments (wealth source / objective / tier) | Self-disclosed allocations, US community sample | **Closest empirical cohort to Unlock's target.** Founders 61% own-company concentration; RE 64% adoption; crypto 42% adoption; income-vs-growth RE split 20% vs 10% |
| BofA Private Bank Study 2024 (n=1,007, ≥$3M) | Generational cohorts only | Escalent survey, ±3pp | Younger HNW: 17% alts, 49% own crypto |
| Connection Capital 2023 (n=151, UK HNW/UHNW) | Tier split only | Proprietary client survey | **Only UK-origin HNW primary data**: 40% allocate 20%+ to alts |
| De Bortoli et al. 2019 (PLOS ONE); CFA L3 curriculum caveats; JBEF 2022 review | — | Typology-validity critiques: questionnaire types diverge from behaviour; traits not static; MBTI-derived frames "lack scientific validity" | Grounds for presenting personas as **framing, not diagnosis** — i.e. the anchor posture |

### 3.4 Verdicts

- **The claim "built from ONS wealth surveys, FCA segmentation studies, global wealth reports" is false as stated and stays dead** (audit §1.3 already ordered its removal; this report grounds why). None of those sources defines personas; the FCA's only typologies cover the wrong populations; ONS/KF/Capgemini/UBS publish distributions and bands.
- **The defensible citation line** (usable in UI/marketing once counsel-checked):
  > *"Persona dimensions informed by established behavioural-finance typologies (Pompian 2012; Bailard, Biehl & Kaiser 1986), as incorporated in the CFA Institute Level III curriculum; portfolio and behaviour patterns calibrated against empirical HNW survey data (LongAngle 2026 HNW Benchmark; BofA Private Bank 2024; Connection Capital 2023 UK HNW survey); UK wealth-composition context from the ONS Wealth and Assets Survey."*
- **What may never be claimed:** that the 8 personas are independently empirically validated by primary survey; that any named external source *segments* UK self-directed HNW investors into these (or any) behavioural clusters; any user-facing match-% (the score is an uncalibrated weighted sum — see Workstream B honesty constraints).

---

## 4. Per-persona evidence verdicts (live 8)

| Persona | Verdict | Basis |
|---|---|---|
| FOUNDER_ENTREPRENEUR | **Corroborated** | Barnewall Active; Pompian Active Accumulator; LongAngle founders 61% own-company concentration; Advani et al. business-wealth dominance at £5M+; direct P3/bullseye alignment |
| SELF_DIRECTED_GROWTH | **Corroborated** | FCA/NMG Controllers (avg £485k, fully self-directed); LongAngle 57% self-manage; Pompian Independent Individualist; BB&K Individualist |
| PROPERTY_LED | **Corroborated (distributional)** | ONS top-decile property 38%; KF 40% UHNWI property-as-investment; LongAngle RE 64% adoption / 42% of private portfolio; UK BTL prevalence. No academic typology anchor — evidence is composition-based, which fits a holdings-triggered override persona |
| INCOME_STABILITY | **Corroborated / partial** | ONS pensions 36% of top-decile wealth (UK-specific); LongAngle income-focused segment (2× RE allocation); Pompian Passive Preserver (partial); P2×E1 bullseye alignment |
| CORE_GROWTH | **Partially corroborated** | Accumulation-growth cohorts ubiquitous in every source but none distinguishes this from SELF_DIRECTED_GROWTH behaviourally; NMG Loyalists partial |
| BALANCED_ALLOCATOR | **Partially corroborated** | NMG Optimisers (adviser-on-demand, avg £388k); BB&K centre; no HNW-specific evidence for a distinct "balanced" behavioural type |
| ALTERNATIVES_FOCUSED | **Partially corroborated** | BB&K Adventurer; LongAngle crypto 42% adoption (US); BofA younger-HNW 49% crypto; Connection Capital UK alts appetite. UK prevalence of crypto-*dominant* (>25%) HNW portfolios is unmeasured — the override threshold is a product choice, not an evidenced cut |
| CAPITAL_PRESERVATION | **Unsupported as distinct** | Every evidence line it has (Guardian/Passive Preserver, estate demand) is shared with INCOME_STABILITY; its weight row differs only 0.36/0.44 vs 0.28/0.52 (liquidity/income); the coverage trace (§6) shows it is reachable only through a contradiction-shaped path at near-zero confidence. Merge or differentiate (D-rec 10) |

**Coverage check vs the £500k–£25M target:** no missing persona is *evidenced as needed* except possibly a UK-specific **DB-pension-secured** type (ONS: pensions are the largest top-decile component; the engine treats DB as a flat +0.15 complexity input and ignores its income-security meaning — see D-rec 5). Over-split: CAPITAL_PRESERVATION vs INCOME_STABILITY (above). Wrong-tier: none — the set spans the cohort acceptably.

---

## 5. Recommendation: one product persona set

**Adopt the live 8 as THE product persona set** (working default under the no-gates rule; reversible):
- Repo (`personaEngine.ts`) is the single source of truth for product personas; the content brain / vault P-codes remain the source of truth for *marketing/content routing*; the mapping table in §2 is the documented relationship. Neither system should silently borrow the other's codes.
- **Legacy 19: formally retired as a product taxonomy.** Retain `personas.ts` + `personaDefaults.ts` solely as the demo-investor seed catalogue (the audit's demo-kit use), with a file-header comment saying exactly that.
- Canon fixes to request from the vault owners: add P-code analogues (or an explicit "not marketed" note) for property-led and alternatives-focused investors; correct P3's cohort label; note the P5→product mapping caveat.
- Near-term evidence upgrades (cheap): the per-investor sessions + per-screen feedback already shipped provide the observational base to test persona-assignment plausibility against real users — define the review loop before any persona copy ships to subscribers (human-approved, never auto-shipped).

---

## 6. Question→persona coverage audit (Workstream D)

Full trace of every collected input against the engine (files: `personaEngine.ts`, `analysis.ts`, `routes.ts` analyze route, Intake/Holdings/Beliefs screens, store, B1–B15 data).

**Headline: the persona engine is fed only by Step-3 intake + optional personaCues + Holdings-derived percentages. The 8 beliefs questions and all 15 outlook statements — 23 of the ~35 questions a user answers — contribute nothing to persona placement** (they drive tilts and macro scenario weights respectively, by design). Meanwhile the collapsed-by-default optional section carries 2 of 6 traits (T2 alternatives, T6 complexity) and 2 of 3 hard overrides.

### 6.1 Dead inputs (collected, reach no persona dimension)
- Dead entirely: `investor_type`, tax-residency `region`, `annual_income_gbp`, `regular_monthly_contribution_gbp`, intake `total_investable_assets_gbp`, `intake_method`; holdings advanced fields (`currency`, `instrument_type`, `isin`, `cost_basis_gbp`, `acquisition_date`, `notes` — server logs and drops); `age_band` (display only); `investing_focus` values FUNDS_ETFS / INDIVIDUAL_SHARES / PRIVATE_BUSINESS / OTHER; adviser value `I_AM_AN_ADVISER` (fully dead enum); `primary_goal` values `preserve_capital` and `specific_goal` (persona-inert despite one of them literally naming preservation).
- Persona-dead but used elsewhere: all 8 beliefs Qs (→ tilt axes → Step-7 scenarios); all 15 B-statements (→ scenario_weights → belief-impact flow); holding `region`/`wrapper` (→ Step-7 bands); `db_income_coverage_band` and `employer_stock_alloc_band` (display chips/risks only — the *bands* never alter placement, only their parent booleans do, flat).

### 6.2 Unidentifiable dimensions for optional-section skippers
A minimal-input user meaningfully feeds T1 (risk), T3 (property), T4 (liquidity) and partially T5; **T2 and T6 are starved and all hard overrides except property are dark.** Specific breaks: T5's biggest input (`portfolio_stage`, +0.4) is optional; "preservation" has no trait at all; T6 caps at 0.3 (portfolio-value tiers) without the optional cues, making FOUNDER effectively unreachable by weights (its 0.58 complexity weight can't be fed); crypto is inexpressible in Holdings (no dropdown option → `crypto_pct` structurally 0); self-directedness has no direct signal (only the ×1.12 multiplier; skippers indistinguishable).

### 6.3 Reachability findings
- CAPITAL_PRESERVATION is reachable **only through a contradiction-shaped path** (high income-orientation while goal ≠ income), at 1–3 point margins over INCOME_STABILITY — near-zero match confidence by construction.
- FOUNDER_ENTREPRENEUR is **override-only in practice** — and the override fires on `NOT_SURE` business-wealth band (treated as 0.25), assigning "Founder, confidence 1.0" to a user who said they don't know.
- **Latent vocabulary bug:** the engine's horizon scalars were written for `10_plus`/`5_9` values; the UI ships `short/medium/long/very_long` — `medium`'s 0.6 scalar is unreachable and `long` (7–15y) binarises to 1.0. Direct evidence the newer intake and the engine evolved separately.
- Stale server fallback: `defaultPersonaCues` in `analysis.ts` (~L197–207) still uses the legacy `has_meaningful_crypto` shape.

### 6.4 Recommendations (costed)

| # | Fix | Cost |
|---|---|---|
| 1 | Wire `primary_goal = preserve_capital` into T5 (preservation branch); fix `specific_goal`'s misleading "e.g. retirement" placeholder | Cheap |
| 2 | Add a crypto option to Holdings ASSET_CLASSES so `crypto_pct` can be non-zero | Cheap |
| 3 | Move `portfolio_stage` (+ ideally `adviser_usage`) into the required Goals & Risk card | Cheap |
| 4 | Default `is_cross_border` from collected region + holdings currencies | Cheap–moderate |
| 5 | Feed `db_income_coverage_band` into T5 and `employer_stock_alloc_band` into T6/concentration | Moderate (re-verify vs P2.3 golden cases) |
| 6 | Give SELF_DIRECTED_GROWTH a real signal (count INDIVIDUAL_SHARES focus; define I_AM_AN_ADVISER) | Cheap |
| 7 | Fix the horizon vocabulary mismatch (map `medium` → 0.6 scalar; decide `long` semantics) | Cheap |
| 8 | Stop `NOT_SURE` auto-firing the FOUNDER override; treat as weighted evidence with honest confidence | Cheap |
| 9 | Bridge Q_VOLATILITY_COMFORT into T1 as a consistency check (or drop the duplication) — beliefs currently never reach the analyze route | Moderate |
| 10 | Decide CAPITAL_PRESERVATION's fate: add a discriminating estate/legacy input, or merge with INCOME_STABILITY | Moderate–expensive |

---

## 7. Working defaults adopted (no-decision-gates rule) + draft decision record

Adopted 2026-07-02 as reversible working defaults, per Tom's standing instruction that nothing waits on a pending decision:

1. **Persona = anchor, not input.** The persona is a framing device with explainability (assignment basis, runners-up) — it does not feed the target mix or any recommendation. This is also the posture the typology-validity literature supports (§3.3) and the compliance-safe reading from the scoping note. Moving to *input* would require compliance review (PS25/22 targeted-support analysis) — named, not scheduled.
2. **Live 8 = the product persona set** (§5), legacy 19 retired as product taxonomy.
3. **No user-facing match-%; no persona reference-portfolio comparison until reference mixes are authored for the live 8** (the legacy defaults are unusable as-is — §2 contradictions).

Draft decision record (for `Intelligence/decisions/` via record-decision): *"2026-07-02 — persona-anchor-and-product-set-V1: persona presented as anchor; live 8 adopted as product set with §4 evidence verdicts; legacy 19 retired to demo-seed duty; match-% and reference-mix comparison excluded pending calibration/authoring; reversal path = compliance review for input-posture, authored mixes for comparison."*

## 8. Action ledger

- **Copy:** the ONS/FCA credibility line stays dead; §3.4's citation line is the only approved formulation (counsel check before external use).
- **Build (shipped tonight, PR: persona presentation layer):** assignment-basis transparency, runners-up, qualitative match chip, 8-persona gallery — all engine-honest.
- **Backlog (this report):** D-recs 1–10 (§6.4); canon fixes (§2); CAPITAL_PRESERVATION merge/differentiate call; DB-pension persona evaluation (§4); observational persona-validation loop (§5).
