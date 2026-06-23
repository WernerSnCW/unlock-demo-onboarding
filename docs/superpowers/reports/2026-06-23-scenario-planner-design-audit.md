# Scenario Planner Design Spec — Consolidated Audit

**Date:** 2026-06-23 · **Target:** `docs/superpowers/specs/2026-06-23-scenario-planner-design.md`
**Method:** 8-lens parallel panel (financial-domain · behavioural-finance · fca-guidance · consumer-duty · unlock-hnw · instructional-design · ux-flow · premortem) → synthesis. All 8 reviewer skills invoked successfully.
**Verdict:** SOUND-WITH-FIXES (fixes are build-gating, not cosmetic). **P1 = 7 · P2 = 7 · P3 = 8.**

> **Protected invariant (all 8 lenses):** the empirical-only framing (§2) and the no-invented-numbers severity model (§6, severity = read-position within observed history) are the spine of the product's credibility and more defensible than the deleted Monte-Carlo engine. No fix may reintroduce a modelled/forecast element or the `{0.7,1.4}` multiplier.

---

## Headline

The framing call is unanimously endorsed and is the strongest thing in the spec. It fails in two separable places: (1) a **data-and-reuse foundation that does not yet exist** (unsourced/partly-unsourceable monthly series; the "reuse verified machinery" claim is wrong — the old engine *is* the abandoned multiplier model; §7's "step-7 target allocation" is actually allocation *bands*, not a weight vector); and (2) **three personalised-output surfaces** (what-if-mix delta, "severe = worst markets reached" slider, recovery-always-happened narration) that carry real Consumer Duty / FCA-boundary and behavioural harm under the regime live since **6 Apr 2026** — none catchable by a banned-verb lint. Build it, but fix the data plan, correct the reuse claims, and lock the delta/severity/narration framing first. The delta needs **human compliance sign-off**, not a self-asserted "no sign-off needed."

---

(Full per-finding detail below — reproduced verbatim from the synthesis agent.)

## P1 — Build-gating

- **P1-1 · Data foundation doesn't exist / no sourcing/licensing/citation plan** *(premortem + financial-domain).* ~5 episodes × ~8 buckets × monthly cited total-return paths; codebase has only single-point prose anchors. 1973 EM unsourceable (MSCI EM starts 1988); index data licence-encumbered. → Add a per-episode×bucket sourcing appendix (provider, series ID, licence, monthly figures, recovery-window def); time-box a sourcing spike; treat 1973 as at-risk/cuttable; never zero-fill into the band.
- **P1-2 · "Reuse verified machinery" overstated** *(premortem).* `computeScenarioStress()` inlines the steps and its severity *is* `central × {0.7,1.4}`. → §8 must say value-weighting/contributor-ranking are *extracted* first; path engine is new; delete "everything else reuses verified machinery"; guard that `{0.7,1.4}` is gone.
- **P1-3 · §7 misdescribes step-7 output** *(premortem).* It's allocation bands (low/high, asset×region axes), not a weight vector. → `portfolioMix.ts` must *derive* a vector (specify midpoint/axis-reconciliation/normalisation rule) as new work; compliance to clear band-midpoint-as-"target mix."
- **P1-4 · What-if-mix delta = implied suitability / Targeted Support** *(fca + consumer-duty + behavioural + hnw + premortem — 5-lens).* Platform target on real holdings + favourable delta = Category B shape under PS25/22 (live 6 Apr 2026), regardless of verbs. → Neutral equally-weighted comparison points; neutral preset labels; no directional valence; symmetric/distribution display with inverse trade-offs; **remove "no sign-off needed"; add human compliance gate (Vine-Lott / Corke); valence-review success criterion.**
- **P1-5 · "Severe = worst markets reached"** *(behavioural + ux + consumer-duty + fca + instructional + premortem — 6-lens).* Catastrophizing default + bounded-downside illusion + non-obvious read-position semantics + collapsed-band no-op + hardest concept in most overloaded stage. → Default 'typical'; read-position labelling; handle rides inside drawn band w/ live "not a prediction / can exceed this" caption; define collapsed-band state; keep recovery visible; sequence blend-before-severity; comprehension check.
- **P1-6 · Recovery-always-happened = false reassurance / complacency** *(consumer-duty + behavioural + hnw).* Same beat that calms a panic-seller makes a decumulator complacent; survivorship sample (no Japan post-1989). → Counter-beat: recovery took X years, forced sellers realise the loss permanently; surface longest-recovery + deepest-trough; teach panic AND complacency symmetrically; route interstitial through FCA checker.
- **P1-7 · No target-market / vulnerable-customer statement** *(consumer-duty, structural).* → Add target-market section (who it's for, assumed resilience/life-stage) + vulnerable-customer note; define short-horizon / decumulation behaviour.

## P2 — Before a sophisticated user sees it

- **P2-1 · Headline numbers unattributed to a series** *(financial + hnw).* GFC -34%/~21mo matches no named bucket (S&P TR ~-55%/~53mo). → Provenance contract: every number tagged to its series; global return basis; golden tests vs published figures.
- **P2-2 · Currency basis unspecified** *(financial).* GBP fell ~25% in 2008; local-ccy overstates UK drawdowns. → Disclose basis per bucket (recommend GBP); golden case.
- **P2-3 · Recovery definition ambiguous (nominal vs real)** *(financial + hnw).* 1973 nominal "recovery" still deeply underwater in real terms. → Define recovery once; real-terms for 1973.
- **P2-4 · 1-D 8-bucket taxonomy can't represent the ICP** *(hnw + financial + fca + consumer-duty — 4-lens).* Structured products, EIS/BR, PE, FX, concentrated equity excluded; band structurally too narrow so "worst markets reached" is false for them. → Don't expand (YAGNI); replace footnotes with up-front scope contract + modelled-vs-unmodelled share; episode-specific caveats for dotcom-vs-tech and 2008-REIT.
- **P2-5 · No Outcome-4 advice exit at the decision moment** *(consumer-duty).* → Standing neutral non-promotional pointer at Stage-4 that own-portfolio decisions are where regulated advice fits.
- **P2-6 · Material caveats are footnotes a non-expert can't weight** *(consumer-duty + fca + ux + instructional — 4-lens).* → Promote adverse caveats to inline/on-hover at the affected number, fired by the user's holdings; test understanding.
- **P2-7 · No back/revisit/reset model; no empty/loading/error states** *(ux).* → Specify navigation + default resting state + a per-stage states table.

## P3 — Cheap to lock now

P3-1 "actionable/planner" leans directional → descriptive language. P3-2 worst-at-top anchors on max loss → chronological default sort. P3-3 pounds amplify panic → % default, pounds on demand w/ recovery endpoint. P3-4 narrative fallacy → "episodes rhyme, don't repeat" note. P3-5 exposition-only → one predict-then-reveal beat + learning-effectiveness criterion. P3-6 beats unmapped beyond Stage 1; Stage-1→2 scaffold inversion → one beat/stage w/ Bloom level, Stage 1 establishes two-limb path, Stage 2 exposes recovery-time. P3-7 5 episodes read thin; "a mix like yours" over-claims → widen to ~7–8 or frame as "most instructive cited episodes"; reword to "the range these episodes reached." P3-8 no mobile / Stage-2→3 handoff / Stage-4 overlay composition → specify each. **Stale paths** → correct to `client/src/…`.
