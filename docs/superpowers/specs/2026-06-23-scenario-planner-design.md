# Design — Scenario Planner (empirical-history explorer)

**Created:** 2026-06-23 · **Revised:** 2026-06-23 (v2, post full-panel audit) · **Repo:** `~/dev/unlock-demo-onboarding`, branch `feat/v2-scenario-stress-engine`
**Status:** DRAFT v2 — audit folded in; pending Tom review + the human-gated items in §13.
**Builds on:** the deterministic stress lens (`client/src/lib/scenarioStress.ts`) verified in Workstream B (`docs/superpowers/reports/2026-06-23-v2-stress-engine-verification-B.md`).
**Audit:** `docs/superpowers/reports/2026-06-23-scenario-planner-design-audit.md` (8 lenses; P1=7/P2=7/P3=8). Finding IDs (P1-n etc.) are referenced inline.

---

## 0. Protected invariants (do not regress — all 8 audit lenses affirm)

1. **Empirical-only framing** (§2): replay cited, real historical episodes. No forward Monte-Carlo, no modelled/forecast element, ever.
2. **No invented numbers** (§6): severity is a *read-position within observed history*. The deleted `{0.7, 1.4}` multiplier must not reappear — not as severity, not as the band.

Any change that reintroduces a forecast or an arbitrary multiplier is out of bounds.

---

## 1. Problem & goal

The user asked: *"Where's the scenario planner that predicts different economic outcomes and their impact on the portfolio?"* The deterministic stress lens answers the **"named scenario → impact on your real holdings"** half. Missing: interactivity, multi-outcome comparison, a "what if I changed my mix" view, and a sense of *how bad it gets and how often* — without resurrecting the deleted probabilistic engine (5 flaws: uncalibrated odds, identity correlations, missing vols, compounding correlated shocks, magnitude-blind persona).

**Goal:** the *superior product* scenario planner — interactive, understanding-building, maximally credible — inside "intelligence, never advice."

---

## 2. Framing decision (foundational, audit-endorsed)

"Probabilities" conflates three things:
1. **Forward Monte-Carlo forecast** — REJECTED (the deleted flaws live here; FCA-radioactive for a non-advice tool).
2. **Pure deterministic named scenarios** (today's lens) — credible but abstract.
3. **Empirical history** ("across the comparable drawdowns, a mix like yours fell X–Y% and took Z to recover") — descriptive statistics of the *actual past*, cited. Not a forecast.

**Decision: deterministic engine + empirical-history layer (3), explicitly NOT forward-MC (1).** More credible than invented probabilities; real episodes give real cross-asset co-movement for free; stays inside "intelligence, never advice."

> ⚠️ The earlier claim "no sign-off needed" is **removed**. The empirical *framing* needs no sign-off, but the personalised *delta* surface (§7) does — see §9, §13. [P1-4]

---

## 3. Must-have capabilities (all four confirmed)

1. **Blend & dial** — weight/combine episodes + a read-position control (§6).
2. **Side-by-side** — every episode on the user's mix, default **chronological** sort (not worst-first [P3-2]), each row pairing drawdown *with* recovery-time.
3. **"What if I change my mix" delta** — current vs comparison mixes under the same episodes — reframed as neutral comparison, not a recommendation (§7) [P1-4].
4. **Time path** — real episode-replay path: the **fall-and-recovery two-limb path is the unit of analysis** [P3-6], not a single point.

---

## 4. Experience — progressive disclosure on a stable spine

Stepped *disclosure*, one **continuous canvas**; the path-chart is the constant visual, each stage adds one capability. Guided on-ramp → open by the end. (Rejected: all-at-once dashboard = quant overload; rigid wizard = kills exploration.)

| Stage | Adds | Teaching beat (Bloom) [P3-6] |
|---|---|---|
| 1 · **The stress test** | One episode, the **fall-and-recovery path**, drawdown + recovery-time | *Understand* — establish the two-limb path as the unit |
| 2 · **Across history** | Ranked side-by-side, chronological default, recovery-time shown beside drawdown | *Analyse* — pattern across episodes; pre-reveal "guess which hit your mix hardest" [P3-5] |
| 3 · **Tune it** | **Blend first, then** the read-position control with its own beat | *Understand → Apply* — what blending/reading does |
| 4 · **Compare mixes** | Neutral mix-comparison overlay + symmetric delta | *Apply/Evaluate* — read the delta direction before it's narrated [P3-5] |

### Guided narration (per stage)
- **Lead-in** — what you're seeing ("the actual path those assets took, mapped onto your holdings").
- **Compliance caption** — "what this is / what it isn't": *history, not a prediction*; tracks the read-position state [P1-5].
- **"Worth sitting with"** — the behavioural lesson, taught **symmetrically**: panic-selling AND complacency are both reception errors [P1-6]. Includes the recovery-time reality (below).
- Source real copy from the **Unlock content brain** (canonical voice); route every interstitial through the **FCA checker**, not just the banned-verb lint [P1-6].

### Narrative-fallacy guard [P3-4]
A light note that episode labels describe *these* episodes, not a taxonomy of the next downturn — "episodes rhyme, they don't repeat."

### Navigation, states & display [P2-7, P3-3, P3-8]
- Persistent stage indicator; **non-destructive revisit**; an always-available **"reset to my actual holdings / typical reading."** Define the default resting state of the fully-disclosed canvas (must not ratchet into a one-way quant view).
- **States table per stage:** empty (no holdings), partial (buckets with no episode data), loading, error — each tied to the §5 caveats it affects.
- **Loss display defaults to %**; pounds on demand only, always co-showing the recovery-endpoint value.
- **Mobile:** pinned spine; controls in a sheet/accordion; side-by-side degrades to a stacked list; delta becomes a toggle. Specify the Stage-2→3 passive→driver handoff cue and the Stage-4 overlay composition (how many paths/bands at once; current-vs-comparison visual distinction; replace-vs-accumulate on preset switch).

---

## 5. Data foundation (the real effort; partly unsourceable — plan required) [P1-1, P2-1/2/3/4, P2-6]

Historical return paths per asset bucket, per episode — every series cited to a source. **This is the bulk of the build and the main risk; it does not exist yet** (the codebase has only single-point prose anchors).

- **Episode roster (locked, native-granularity):** **1929–32 Great Depression · 1973–74 stagflation · 1987 · 2000 dotcom · 2008 GFC · 2020 COVID · 2022 rate shock** (7). Optional 8th: **1920–21 post-WWI deflation** (US-only equity+bond — Tom's call). Frame the set as **"the most instructive cited episodes," with selection rationale** — not an exhaustive distribution.
  - **1929–32 is the keystone deep episode** — strongest cited deep data *and* the empirical counter to "markets always recover" (~25yr real-terms recovery). It is the primary anchor for the P1-6 complacency safeguard.
  - **1973–74 retained** (earlier "cut" reversed): sourceable for UK+US equity, gilts/treasuries, cash, CPI (FTSE All-Share monthly from 1962); only EM/global/property are gaps, handled by the scope rule. Teaches "equities *and* bonds fall in real terms" — uniquely relevant to the decumulation ICP.
- **Native granularity per episode:** monthly where it exists (modern episodes; US back to 1871 via Shiller); **annual for deep multi-country episodes** (JST 1870–). Deep episodes play out over years, so an annual path still renders the drawdown-and-recovery curve faithfully. The engine carries a **per-episode granularity field and must handle mixed granularity.**
- **Replay floor = ~1870.** Pre-1870 (industrial-revolution era) has no investable per-bucket total-return series — only sparse stylised reconstructions — so a replay would **violate §0 (no invented numbers).** The AI ≈ technology-transition analogy is made in **narration only** (railway mania, 1873 Long Depression, dotcom as transition episodes), never as a fabricated portfolio path.
- **Deep-episode scope ("assets that existed then"):** pre-~1970 only US (+partial UK) equity, govt bonds, cash, inflation exist; europe/global/emerging/property render *"no comparable series"* (never zero-filled). State this per deep episode.
- **Buckets:** reuse the existing 1-D taxonomy (uk/us/europe/global/emerging equity, govt bonds, property, cash). **Not expanded** (YAGNI [P2-4]).

### Data sources (deep-history-capable, citeable)
| Source | Coverage | Granularity | Notes |
|---|---|---|---|
| Shiller (Yale) | US equity + dividends + CPI + long rate, 1871– | monthly (pre-1926 interpolated from Cowles annual) | free; the deep-US standard |
| JST Macrohistory (R6) | 18 advanced economies — equity/bond/bill/**housing** TR, 1870–2015 | annual | free, academic; key for multi-country + housing deep history |
| SBBI / Ibbotson (Morningstar) | US large/small/LT-govt/corp/T-bill/inflation, 1926– | monthly | industry standard; redistribution licence to check |
| Barclays Equity Gilt Study | UK equity/gilt/cash, 1899– | annual | UK long-run standard |
| MSCI | World/EAFE 1970–, EM 1988– | monthly | licensed |
| FRED | US CPI 1913–, Treasury yields | monthly | free |

For a **demo**, illustrative cited data from the free sources (Shiller, JST, FRED) is sufficient; full redistribution-licensing diligence is a production concern, not a v1 blocker.

### Hard data rules (carried into §11 criteria)
- **Provenance contract** [P2-1]: every number tagged to its series (provider, index/series ID, redistribution-licence status). State the **return basis once globally**: total return, **GBP** for a UK audience [P2-2], net/gross. Golden-case unit tests assert each bucket's episode drawdown/recovery against the published index figure.
- **Recovery defined once** [P2-3], explicitly (nominal-to-prior-peak vs real; same-mix vs rebalanced; with/without contributions). **Show real-terms recovery (or footnote the inflation gap) for any inflation episode** — a nominal "recovered in N months" on 1973 is true-but-misleading.
- **1973 / pre-1988 gaps** [P1-1]: MSCI EM starts 1988; several buckets are proxy-only/annual pre-1988. Where a bucket has no comparable series, **render "no comparable series" — never zero-fill or interpolate into the §6 band.** Treat 1973 as at-risk; swap if unsourceable.
- **Licensing** [P1-1]: FTSE/MSCI/Bloomberg series are typically licence-encumbered for redistribution. A licence check is part of the sourcing spike (§12).

### Scope contract, not footnotes [P2-4, P2-6]
The Workstream-B taxonomy gaps (UK large-cap-only; govt-bonds-only; Nasdaq/tech > broad-`us`; listed REITs ~−50% vs the property shock) make the observed band **structurally too narrow** for some holdings — so "worst markets reached" can be *false* for them. Therefore:
- State **up-front, before the first number**, which sleeve this models, and show the **modelled-vs-unmodelled share** of the user's actual portfolio.
- Promote materially-adverse caveats to **inline / on-hover at the affected bucket or number**, fired by the user's real holdings (e.g. holds property/REITs → "your real exposure could have fallen harder than this bucket shows").
- For the two episodes where the gap changes the conclusion (dotcom-vs-tech, 2008-REIT), add an episode-specific in-path caveat or gate the "worst markets reached" wording.

---

## 6. Read-position semantics (replaces "severity"; no invented numbers) [P1-5]

- **Blend** = *which* episodes + weights → a central blended path **and** a band = the min/max **actually observed** across those episodes.
- **Read-position** = *where you read* within that band: **default 'typical' (weighted-central)**, sliding toward "worst markets reached" — the worst edge markets actually hit. Never an extrapolation beyond observed history.

UI requirements:
- Relabel away from "severity"/"severe" toward read language: **"Read: typical outcome ↔ worst markets reached."** Default sits at typical, not the worst edge.
- The handle **rides visibly inside the drawn band**, with a live caption: *"markets actually reached here in these episodes — not a prediction, and future losses can exceed this."* [bounded-downside illusion guard]
- Define the **collapsed-band / single-episode state** (band → line): hide/disable the control or define a within-episode peak-trough read; never a silent no-op.
- Keep the **recovery limb visible** whenever the worst edge is selected.
- Sequence in Stage 3: **blend introduced first, read-position revealed after**, each with its own teaching beat. Add a comprehension check to the audit.

---

## 7. Mix comparison (reframed from "what-if payoff") [P1-3, P1-4]

Compare the user's current holdings against alternative composition points under the same episodes — **as neutral comparison, never a recommendation.**

- **Deriving a comparison vector** [P1-3]: step-7 produces allocation **bands** (low/high, split asset_class vs region), *not* a weight vector. `portfolioMix.ts` must **derive** a normalised bucket-weight vector from the bands — specify the rule (band midpoint; how the asset-class and region axes are reconciled into one vector summing to 1). This is **new work**, not reuse. Compliance to confirm presenting a band-midpoint as a comparison mix is acceptable (links to §13).
- **Neutral presentation** [P1-4]:
  - The step-7-derived mix and any presets are **equally-weighted comparison points the user selects between** — never single out the platform mix as the highlighted/"recommended" overlay.
  - **Neutral composition labels** (e.g. "more bonds, less equity"), not value-laden ones ("more defensive"/"more diversified").
  - **No directional visual valence**: no green-better/red-worse, no "improvement"/ranking, no "+6pts shallower" headline.
  - **Symmetric, distributional delta**: comparison mixes draw down *more* in some episodes (e.g. bonds in 1973/2022) — surface those; pair every delta with its inverse trade-off; present as a distribution across episodes, not one figure.
- **Deferred (YAGNI v1):** free-form custom allocation editing.
- ⚠️ **This surface is the single most-flagged risk and is human-gated — see §13.**

---

## 7A. Belief inputs ↔ scenario / outcome mapping (coherence) [Tom check]

**Finding (code-confirmed in `stressScenarios.ts` + `onboardingV2Store.ts`):** today only **3 of 8 belief axes map to any scenario** — `VOLATILITY_AVERSION` (equity drawdown), `INFLATION_HEDGE_TILT` (rates/inflation), `TECH_TILT` (tech). `PROPERTY_DOWNTURN` has **no** salience axis; `QUALITY / VALUE / UK_BIAS / ESG / SMALL_CAP` map to nothing in the lens. Expanding to the 7–8-episode roster widens the gap unless addressed. *Beliefs are only useful if they map to questions and outcomes.*

**Resolution (surgical, not a wholesale rewrite):**
1. **Style/factor axes stay step-7-only.** ESG, small-cap, quality (and mostly value) legitimately drive *allocation tilts*, not "which crash worries you." Don't force them onto episodes (small-cap also has no bucket). No change.
2. **Re-tag the new roster against existing axes where they genuinely map:** `VOLATILITY_AVERSION` → 1929 / 1987 / 2008 / 2020; `INFLATION_HEDGE_TILT` → 1973 / 2022; `TECH_TILT` → 2000; `VALUE_TILT` → 2000; `UK_BIAS` → 1973 / 2022. Every episode gets ≥1 salience hook (no orphan episodes).
3. **Add a horizon / circumstance input** (time horizon; accumulating vs decumulating) — maps directly to *outcomes*: drives the recovery-time counter-beat emphasis and the vulnerable-customer treatment. **Required by the audit anyway** (P1-6 complacency + P1-7 target-market), so it serves coherence *and* Consumer Duty with one question.
4. **Optional macro-concern question(s)** for 1:1 episode salience ("which stresses would you most want to understand your exposure to: high inflation · tech-driven crash · prolonged deep downturn · property fall"). **Framed as preference/curiosity, never forecast** — preserves the "beliefs are tilts, not macro forecasts" invariant (B3 #8).

**Coherence rule (build invariant):** every belief/circumstance question maps to either a step-7 tilt **or** a scenario salience/outcome — no orphan questions; every episode is reachable by some expressed signal — no orphan episodes.

## 8. Architecture (isolated units; reuse claims corrected) [P1-2, stale paths]

| Unit | Responsibility | Status |
|---|---|---|
| `client/src/data/episodeLibrary.ts` | Cited per-bucket monthly return paths per episode (+ source IDs, recovery windows) | **NEW** |
| `client/src/lib/portfolioMix.ts` | `Mix` abstraction; derive bucket-weight vectors from holdings AND from step-7 bands (§7 rule) | **NEW** |
| `client/src/lib/empiricalEngine.ts` | Pure: `(mix, episode, readPosition) → { path, drawdownRange, recoveryMonths, contributors }` | **NEW** (substantially) |
| `client/src/lib/episodeBlend.ts` | Weighted combine → central path + observed band | **NEW** |
| shared helpers | value-weighting + contributor-ranking | **EXTRACT first** from `scenarioStress.ts` (a tested refactor — they're currently inlined in one `.map()`, not reusable as-is) [P1-2] |
| view/format | rounding, signed-pct, compliance | reuse `scenarioStressView` conventions + banned-verb test |
| `client/src/pages/onboarding-v2/ScenarioPlanner.tsx` (+ stage components) | The stepped explorer; path chart = stable spine | **NEW** |
| narration content | Stage copy | content brain; FCA-checker + banned-verb linted |

**Corrected reality:** the old `computeScenarioStress()` inlines its steps and its severity *is* `central × {0.7,1.4}` — the very multiplier §0/§6 abandon. So the path/blend engine is **new**; only value-weighting + contributor-ranking are reusable, and only **after extraction**. The "everything else reuses verified machinery" claim is withdrawn. Guard in tests: `{0.7,1.4}` severityRange is gone and not silently reused as the band.

---

## 9. Compliance constraints (hard)

- "Intelligence, never advice." No advice verbs (should/must/buy/sell/optimise/improve/save) — lint-enforced. **But the lint cannot catch implied advice carried by juxtaposition/number/valence** — those are handled by §7 framing + the §13 human gate [P1-4].
- Numbers illustrative + defensible; **every episode series cited** (§5 provenance contract).
- **No probabilities/forecasts.** Empirical only: "this is what happened," never "this will happen."
- The **mix-comparison delta** (§7) is implied-suitability / Targeted-Support (PS25/22, live 6 Apr 2026) territory → **human compliance sign-off required** (§13), plus a success criterion that the delta UI is reviewed for implied-suitability *valence*, not only verbs.
- **Consumer-support exit** [P2-5]: a standing, neutral, non-promotional pointer at the Stage-4 / delta moment that decisions about one's own portfolio in light of full circumstances are where regulated advice is appropriate.
- Route all narration (esp. the recovery beat) through the **FCA checker** [P1-6].

---

## 10. Target market & vulnerable customers [P1-7] (new — Consumer Duty Outcome 1)

- **Who it's for:** self-directed investors exploring how their holdings behaved across historical stress — stated explicitly in-product.
- **Assumptions:** what financial resilience / life-stage the "calm, recovery-happened" message assumes.
- **Vulnerable / at-risk behaviour:** define behaviour for the **short-horizon / near-retiree / decumulation** user (a named ICP segment) for whom a multi-year recovery may not be survivable. The planner must **surface, not smooth over**, the case where the user's horizon is shorter than the historical recovery window. "Calm and credible" must never mean "reassuring to someone who should act." The recovery-time reality (§5 / P1-6) is the natural hook.

---

## 11. Success criteria

- All four must-haves functional on a stable-spine canvas with progressive disclosure; navigation + per-stage states defined.
- Empirical engine pure + unit-tested with hand-verified golden cases (Workstream-B discipline), including **provenance golden tests** (each bucket's episode drawdown/recovery == published index figure) and a **currency-basis** case.
- Read-position = read-within-observed-band; **no arbitrary multipliers anywhere** (test-guarded).
- All episode data cited; return basis + recovery defined globally; real-terms shown for inflation episodes; **scope contract** (modelled-vs-unmodelled share) shown up-front; adverse caveats inline.
- Zero banned verbs / zero forecast framing (lint) **and** the §7 delta passed a human valence/implied-suitability review.
- Target-market + vulnerable-customer behaviour implemented; Outcome-4 advice pointer present.
- A comprehension check (read-position not read as forecast) and a learning-effectiveness check [P3-5] pass.
- Full-panel audit findings resolved or consciously accepted (this doc).

---

## 12. Build sequencing (data risk first)

1. **Sourcing spike (time-boxed):** pull the §5 roster from the free deep-history sources (Shiller / JST / FRED), per episode × bucket, at native granularity; confirm GBP-conversion and the "no comparable series" buckets per deep episode. Decide the optional 1920–21 episode. *Gate: surface any episode that can't be cleanly sourced before building UI on it.*
2. **Extract** value-weighting + contributor-ranking into tested shared helpers.
3. Build `episodeLibrary` + `empiricalEngine` + `episodeBlend` (pure, golden-tested).
4. `portfolioMix` derivation (holdings + step-7 bands).
5. Stepped UI on the stable spine; narration from content brain.
6. §13 human gates before the delta surface ships.

---

## 13. Open items requiring human action (not codeable away)

- **Compliance sign-off on the §7 mix-comparison delta** — route to Tony Vine-Lott / William Corke. Confirm: (a) neutral-comparison framing keeps it out of Targeted Support; (b) band-midpoint-as-comparison-mix is acceptable. **Build of the delta surface is gated on this.** [P1-4, P1-3]
- **Data sourcing decision** (§12.1): confirm the §5 roster sources cleanly from the free deep-history datasets; decide the optional 1920–21 episode. (1973 retained; floor = 1870.) [P1-1]
- **Content-brain voice** for all narration; FCA-checker pass on interstitials. [P1-6]

---

## 14. Out of scope (v1)

Forward probabilistic simulation (§0/§2); taxonomy expansion (large/small-cap, credit, FX — scope-contracted, not built); free-form custom allocation editing; saving/sharing scenarios.
