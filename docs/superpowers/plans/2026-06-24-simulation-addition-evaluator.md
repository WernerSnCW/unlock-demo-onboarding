# simulation-addition-evaluator Skill — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Author a reusable cloudworkz reviewer-archetype skill that scores candidate additions to the Unlock scenario planner (episode / bucket / boom / intake-question) with a §0 veto gate, five scored dimensions, a strengthening step, and a sequencing lens.

**Architecture:** Two-layer "thin core / fat pack". A durable `SKILL.md` (method, verdict format, pass flow) plus a swappable `references/scenario-planner-invariants-V1.md` (the concrete bars, distilled from the scenario-planner design doc). Verification is by **golden worked examples** — expected scorecards authored first, then the skill is authored to reproduce them when followed.

**Tech Stack:** Markdown only. No code, no test runner. Modeled on the existing cloudworkz reviewer skill `Skills/behavioural-finance-reviewer/SKILL.md`. Verification = following the skill by hand against the golden examples + coverage checklists.

**Source spec:** `~/dev/unlock-demo-onboarding/docs/superpowers/specs/2026-06-24-simulation-addition-evaluator-design.md` (committed `e89c189`).

**Skill home (absolute paths — files live in the vault, not this repo):**
`/Users/thomasking/Documents/Co Work Reset/Skills/simulation-addition-evaluator/`

**Conventions to follow (read before starting):**
- `/Users/thomasking/Documents/Co Work Reset/Skills/behavioural-finance-reviewer/SKILL.md` — the archetype (frontmatter + Pass 0–N + hard rules + performance criteria + failure modes + related + version history).
- `/Users/thomasking/Documents/Co Work Reset/Skills/CLAUDE.md` — folder rules (one folder per skill; scaffold `notes.md`, `strategy.md`, `references/` together; don't hand-maintain a roster).

**Commit note:** files are in the vault (not a git repo per the session environment — vault syncs via Relay). "Commit" steps below are git commits in `~/dev/unlock-demo-onboarding` for the **plan/spec lineage only**; the vault skill files are saved (synced), not git-committed. Where a step says "save", use the Write tool. Do not attempt `git add` on vault paths.

---

## File Structure

| File | Responsibility |
|---|---|
| `Skills/simulation-addition-evaluator/SKILL.md` | Durable shell: frontmatter, Pass 0–5 flow, the rubric (veto + 5 dimensions + verdict rule), strengthening step, sequencing lens, output format, hard rules, performance criteria, failure modes, related, version history |
| `Skills/simulation-addition-evaluator/references/scenario-planner-invariants-V1.md` | Swappable pack: the concrete bars each dimension scores against, distilled from the design doc + pointer back to it + "how to extend" note |
| `Skills/simulation-addition-evaluator/references/worked-examples-V1.md` | Golden acceptance cases: expected scorecards (REJECT / REVISE / ADD / boom-REVISE) the skill must reproduce when followed |
| `Skills/simulation-addition-evaluator/notes.md` | Operator-voiced working notes |
| `Skills/simulation-addition-evaluator/strategy.md` | Design history + trade-offs |

---

## Task 1: Scaffold folder + SKILL.md frontmatter

**Files:**
- Create: `/Users/thomasking/Documents/Co Work Reset/Skills/simulation-addition-evaluator/SKILL.md`

- [ ] **Step 1: Read the archetype**

Read `/Users/thomasking/Documents/Co Work Reset/Skills/behavioural-finance-reviewer/SKILL.md` in full to match frontmatter fields and section order.

- [ ] **Step 2: Write SKILL.md frontmatter + title (body filled in Task 4)**

Save this exact frontmatter and opening to the SKILL.md file:

```markdown
---
name: simulation-addition-evaluator
description: Scores a candidate addition to the Unlock scenario planner (or its onboarding) on whether it strengthens the product, and proposes how to make it stronger. Candidate types: historical episode, asset-class/bucket, boom event, intake/belief question, other surface. Runs a §0 veto gate (empirical-only, no invented numbers), then scores five dimensions (sourceability & provenance, comprehension value, coherence & mapping, framing integrity, compliance & target-market) Strong/Adequate/Weak/Absent, proposes a concrete lift for every below-Strong dimension, returns an ADD/REVISE/REJECT verdict, and ranks a batch by effort-vs-payoff. Two-layer: this skill is the durable method; the scored bars live in a swappable invariant pack. Output lands at _scratch/{date}-addition-eval-{slug}-V1.md. Use when Tom says "evaluate this addition", "should we add this episode/bucket/question", "run the eval framework", "is this worth adding", or when the scenario-planner roster expansion needs a yardstick.
type: skill
project: Unlock
department: Product
owner: tom-king
status: V1
date: 2026-06-24
updated: 2026-06-24
tags: [skill, unlock, scenario-planner, evaluation-framework, reviewer-archetype, roster-expansion]
your_move: "Run on any candidate addition (episode/bucket/boom/intake-question) before it is built. The yardstick for the scenario-planner roster expansion."
source: "Tom steer 2026-06-23 ('add anything that adds value, don't add anything weak'); scenario-planner next-steps handoff names this the keystone, to be built before the roster expansion."
companion_files:
  - "[[Skills/simulation-addition-evaluator/notes|notes.md]]"
  - "[[Skills/simulation-addition-evaluator/strategy|strategy.md]]"
  - "[[Skills/simulation-addition-evaluator/references/scenario-planner-invariants-V1|references/scenario-planner-invariants-V1.md]]"
  - "[[Skills/simulation-addition-evaluator/references/worked-examples-V1|references/worked-examples-V1.md]]"
related_skills:
  - "[[Skills/consumer-duty-reviewer/SKILL|consumer-duty-reviewer]]"
  - "[[Skills/fca-guidance-checker/SKILL|fca-guidance-checker]]"
  - "[[Skills/behavioural-finance-reviewer/SKILL|behavioural-finance-reviewer]]"
---

You are the **simulation-addition-evaluator**. Tom's rule is the whole job: *add anything that adds value, don't add anything weak.* You judge whether a candidate addition strengthens the scenario planner (and its onboarding), and — for everything it falls short on — you say exactly how to make it stronger. You are a strengthening engine with a gate, not a gate alone.

<!-- BODY FILLED IN TASK 4 -->
```

- [ ] **Step 3: Verify frontmatter**

Run: `grep -E "^name: simulation-addition-evaluator$" "/Users/thomasking/Documents/Co Work Reset/Skills/simulation-addition-evaluator/SKILL.md"`
Expected: one match (name equals the folder slug).
Confirm by eye: required archetype fields present (name, description, type, project, department, owner, status, date, tags). The description leads with what it does and ends with the "Use when…" trigger phrases, matching the behavioural-finance-reviewer pattern.

---

## Task 2: Author the invariant pack (the fat layer)

**Files:**
- Create: `/Users/thomasking/Documents/Co Work Reset/Skills/simulation-addition-evaluator/references/scenario-planner-invariants-V1.md`

- [ ] **Step 1: Re-read the design doc sections being distilled**

Read these sections of `~/dev/unlock-demo-onboarding/docs/superpowers/specs/2026-06-23-scenario-planner-design.md`: §0 (invariants), §5 (data foundation + sources + hard rules + scope contract), §4 (Bloom beats), §7A (coherence rule + belief-axis map), §6 (read-position), §7 (mix comparison neutrality), §9 (compliance), §10 (target market/vulnerable).

- [ ] **Step 2: Save the invariant pack**

Save this exact content:

```markdown
# Scenario-planner invariant pack (V1)

The swappable bars the `simulation-addition-evaluator` scores against. Update **this file** as the product evolves; do not change SKILL.md.

**Canonical source:** `~/dev/unlock-demo-onboarding/docs/superpowers/specs/2026-06-23-scenario-planner-design.md` (branch `feat/v2-scenario-stress-engine`, PR #4). When this pack and the design doc disagree, the design doc wins — refresh this pack.

---

## Veto bars — §0 invariant safety (pass/fail; fail = REJECT)

- **Empirical-only.** Replays a real, cited historical episode. NO forward Monte-Carlo, NO modelled/forecast element, NO "X% chance" framing. A boom episode is still a real cited series.
- **No invented numbers.** Severity is a read-position *within observed history*. NO arbitrary multiplier (the deleted `central × {0.7,1.4}` must not reappear, as severity or as the band). NO zero-fill / interpolation into the observed band. NO fabricated pre-~1870 path (replay floor ≈ 1870; pre-1870 analogy is narration-only, never a portfolio path).

Any candidate that reintroduces a forecast, an arbitrary multiplier, a zero-fill, or a pre-1870 fabricated path FAILS the veto.

## Sourceability & provenance bars

- **Provenance contract:** every number tags to a series — provider, index/series ID, granularity, redistribution-licence status. Return basis stated once globally (total return, GBP, net/gross).
- **Comparable series must exist.** Where a bucket has no comparable series for an episode, render "no comparable series" — never zero-fill or interpolate. (1973/pre-1988 buckets and EM pre-1988 are the known gaps.)
- **Deep-history sources (free, citeable):** Shiller (US equity/CPI/rate 1871–, monthly), JST Macrohistory (18 economies equity/bond/bill/housing TR 1870–, annual), FRED (US CPI 1913–, Treasury yields). Licensed: SBBI/Ibbotson (US 1926–), Barclays Equity Gilt Study (UK 1899–), MSCI (World 1970–, EM 1988–).
- **Real-terms recovery** shown (or inflation gap footnoted) for any inflation episode — a nominal "recovered in N months" on 1973 is true-but-misleading.

## Comprehension bars

- Adds a **distinct teaching beat** on the Bloom ladder (Understand → Analyse → Apply → Evaluate), not quant noise.
- **Earns its place on the stable spine** — the path-chart canvas with progressive disclosure. An addition that doesn't teach anything new, or that overloads the canvas, scores low.
- Symmetric teaching: panic-selling AND complacency are both reception errors; the recovery-time reality (esp. 1929–32 ~25yr real recovery) is the complacency counter-beat.

## Coherence & mapping bars (§7A)

- **No orphan episodes:** every episode is reachable by some expressed belief/circumstance signal. Current belief-axis → episode map: VOLATILITY_AVERSION → 1929/1987/2008/2020; INFLATION_HEDGE_TILT → 1973/2022; TECH_TILT → 2000; VALUE_TILT → 2000; UK_BIAS → 1973/2022. (PROPERTY_DOWNTURN has NO axis yet — a property episode is an orphan until one is added.)
- **No orphan questions:** every intake/belief question maps to either a step-7 allocation tilt OR a scenario salience/outcome. Style/factor axes (ESG, small-cap, quality, mostly value) are step-7-only — do not force them onto episodes.
- **Bucket fit:** new buckets must fit the existing 1-D taxonomy (uk/us/europe/global/emerging equity, govt bonds, property, cash) + `bucketFor` + the holdings mapping. Gold and FX are NEW buckets beyond this set — adding them touches the taxonomy, `bucketFor`, AND the intake holdings questions.

## Framing integrity bars

- **Downside semantics:** drawdown, recovery-time, and band-min-as-"worst markets reached" all assume losses. A candidate that fits this frame scores well here.
- **Booms break this frame.** Recovery / read-position / band-min semantics do not carry to upside. A boom candidate scores Weak/Absent on framing UNTIL the open redesign decision is made: *still a downside stress planner, or a general historical scenario explorer?* This is the flag the framework must raise — mark it "no fix — inherent" pending that decision.
- **Neutral, non-advice comparison:** no green-better/red-worse valence, no "recommended" overlay, neutral composition labels ("more bonds, less equity" not "more defensive"), symmetric distributional delta (every delta paired with its inverse trade-off).

## Compliance & target-market bars

- **"Intelligence, never advice."** No advice verbs (should/must/buy/sell/optimise/improve/save) — lint-enforced; but implied advice via juxtaposition/number/valence is NOT lint-catchable and needs framing + human review.
- **Human-gate triggers:** the mix-comparison delta and anything implying suitability is Targeted-Support territory (PS25/22, live 6 Apr 2026) → human compliance sign-off (Tony Vine-Lott / William Corke). A candidate that adds an implied-suitability surface inherits this gate.
- **Target market / vulnerable customers (Consumer Duty Outcome 1):** the short-horizon / near-retiree / decumulation user, for whom a multi-year recovery may not be survivable. "Calm and credible" must never mean "reassuring to someone who should act." Surface the recovery-window-vs-horizon mismatch, never smooth it over.

## How to extend this pack

- When the roster expansion makes the boom decision, add an **upside-framing subsection** to "Framing integrity bars" (how recovery/read-position/band semantics work for gains) and flip the "booms break this" inherent-flag to a defined bar.
- When gold/FX buckets are approved, add them to the bucket taxonomy line and add their intake-mapping requirement.
- Never edit SKILL.md for these — only this pack.
```

- [ ] **Step 3: Verify coverage**

Confirm by eye that the pack has a bar-set for the veto + all five dimensions (sourceability, comprehension, coherence, framing, compliance/target-market), the pointer to the canonical design doc, and the "how to extend" note. Each of the five scored dimensions in SKILL.md (Task 4) must have a matching bar-set here.

Run: `grep -cE "^## " "/Users/thomasking/Documents/Co Work Reset/Skills/simulation-addition-evaluator/references/scenario-planner-invariants-V1.md"`
Expected: **7** `##` headers (veto, sourceability, comprehension, coherence, framing, compliance, how-to-extend). The title line uses a single `#`, so it is not counted.

---

## Task 3: Author the golden worked examples FIRST (the acceptance "tests")

**Files:**
- Create: `/Users/thomasking/Documents/Co Work Reset/Skills/simulation-addition-evaluator/references/worked-examples-V1.md`

These define correct behaviour. The skill body (Task 4) must reproduce these verdicts when followed. Author them before the body.

- [ ] **Step 1: Save the worked-examples file**

Save this exact content:

```markdown
# Worked examples (V1) — acceptance cases for simulation-addition-evaluator

Following the skill against each candidate must reproduce the stated verdict. These are the regression cases; re-run them after any SKILL.md or invariant-pack change.

---

## Case A — REJECT on veto (a forecast)

### Candidate: "Monte-Carlo 1-year VaR scenario (10% chance of −X%)"   [type: other surface]
Veto (§0 empirical/no-invented): **FAIL** — introduces a forward probabilistic forecast and a modelled number, not a replay of a cited episode.
VERDICT: **REJECT** (veto short-circuit; scoring passes not run).
Reason: violates §0 empirical-only and no-invented-numbers. No fix — inherent (it is the deleted engine).

---

## Case B — REVISE with a lift plan (downside episode, orphan mapping)

### Candidate: 1989–91 UK property bust   [type: episode]
Veto (§0): PASS
1 Sourceability      Adequate  — Nationwide HPI from 1952 (quarterly); gilt/cash sourceable
                     → Lift: cite the gilt series to close the partial-source gap
2 Comprehension      Strong    — adds the "property falls too + slow recovery" beat, absent today
3 Coherence/mapping  Weak      — no PROPERTY_DOWNTURN salience axis exists (§7A orphan)
                     → Lift: add a property-downturn belief question (ripples → +comprehension)
                       (that new question sanity-passes the rubric: maps to a scenario outcome ✓, low intake cost ✓)
4 Framing integrity  Adequate  — downside episode, fits the existing frame
5 Compliance/TM      Adequate  — recovery-time reality serves the decumulation ICP
                     → Lift: surface real-terms recovery (a nominal-only "recovered in N months" would mislead)
VERDICT: **REVISE** → lift plan: [add property belief question; cite gilt series; show real-terms recovery]
Effort/payoff: medium effort, high payoff → early in the queue once lifted.

---

## Case C — ADD (clean downside episode)

### Candidate: 1997 Asian financial crisis (emerging-equity bucket)   [type: episode]
Veto (§0): PASS
1 Sourceability      Adequate  — MSCI EM from 1988 covers 1997 (monthly); licence check noted
2 Comprehension      Adequate  — reinforces the cross-asset co-movement beat (not wholly new)
3 Coherence/mapping  Strong    — maps to existing emerging-equity bucket + VOLATILITY_AVERSION axis
4 Framing integrity  Strong    — downside episode, drawdown+recovery fits the frame
5 Compliance/TM      Strong    — no new advice surface; recovery-time reality intact
VERDICT: **ADD** (all dimensions Adequate-or-better).
Lift notes (Adequate dims): confirm MSCI redistribution licence (sourceability); pair with an existing episode rather than adding a standalone beat (comprehension).
Effort/payoff: low effort, medium payoff.

---

## Case D — REVISE forced by framing (a boom)

### Candidate: Gold 1976–80 bull run (+700%)   [type: boom event]
Veto (§0): PASS — a real, citeable gold price series.
1 Sourceability      Adequate  — LBMA / FRED gold price series exists; GBP-basis conversion needed
                     → Lift: add the GBP-converted gold series citation
2 Comprehension      Strong    — adds an upside beat (how a boom behaves), genuinely new
3 Coherence/mapping  Weak      — gold is NOT a current bucket; no holdings map to it; no signal reaches it
                     → Lift: add a gold bucket + bucketFor entry + intake holdings question
                       (sanity-pass: bucket fits taxonomy as a new line ✓, intake cost moderate — flag)
4 Framing integrity  Absent    — drawdown/recovery/band-min-as-worst do not carry to a +700% gain;
                       the downside frame cannot represent this
                     → No fix — inherent. Blocked on the open redesign decision: stress planner vs general
                       historical explorer. Surface to Tom; do not "fix" silently.
5 Compliance/TM      Adequate  — upside framing must still avoid "this will happen"; no advice verb
VERDICT: **REVISE → blocked** : framing is Absent with no in-scope fix. Cannot ADD until the
downside-vs-explorer redesign decision is made. (Two-or-more-Weak / Absent would otherwise be REJECT;
this is surfaced as a redesign-blocked REVISE because the candidate is strong once the frame is decided.)
Effort/payoff: high effort (new bucket + frame rework), high strategic payoff → sequence AFTER the redesign call.
```

- [ ] **Step 2: Verify the examples exercise every verdict path**

Confirm by eye: Case A = REJECT-on-veto; Case B = REVISE-with-lift-plan; Case C = ADD; Case D = boom forcing the framing decision. All five dimensions appear with reasons across the cases, and the two strengthening guardrails ("no fix — inherent" in A and D; the recursive sanity-pass in B and D) both appear.

---

## Task 4: Author the SKILL.md body (the rubric + passes)

**Files:**
- Modify: `/Users/thomasking/Documents/Co Work Reset/Skills/simulation-addition-evaluator/SKILL.md` (replace the `<!-- BODY FILLED IN TASK 4 -->` marker)

- [ ] **Step 1: Replace the body marker with the full skill body**

Replace the line `<!-- BODY FILLED IN TASK 4 -->` with this exact content:

```markdown
## Pass 0. Context prime

1. `references/scenario-planner-invariants-V1.md` — the bars you score against. If a call is in doubt, open the canonical design doc it points to.
2. `references/worked-examples-V1.md` — the calibration cases. Your scorecards must be consistent with these.
3. The candidate(s) — read each in full. If given a batch, list them before scoring.

## Pass 1. Classify

Tag each candidate by type: **episode · asset-class/bucket · boom event · intake/belief question · other surface.** Type sets where the rubric bites hardest:
- *episode* → sourceability bites hardest.
- *bucket* → coherence & mapping (taxonomy + holdings) bites hardest.
- *intake/belief question* → coherence (maps to a tilt or outcome?) + comprehension bite hardest.
- *boom event* → framing integrity bites hardest (it will usually be the blocker).

## Pass 2. Veto gate (§0)

Run the veto bars. If the candidate reintroduces a forecast, an arbitrary multiplier, a zero-fill, or a fabricated pre-1870 path, it **FAILS** → verdict REJECT, short-circuit (do not run the scoring passes). State the specific violation.

## Pass 3. Score the five dimensions

Rate each **Strong / Adequate / Weak / Absent**, each with one specific evidence line (no bare ratings):

1. **Sourceability & provenance** — can every number be cited to a real series (provider, ID, granularity, licence)? Comparable series exists, or does it force zero-fill / fabrication?
2. **Comprehension value** — adds a distinct teaching beat / builds understanding, or just quant noise? Earns its place on the stable spine?
3. **Coherence & mapping** — no orphans (episode reachable by a signal; question maps to a tilt or outcome; bucket fits taxonomy + holdings).
4. **Framing integrity** — fits the downside drawdown/recovery/band semantics + neutral non-advice comparison, or breaks them? Booms break them.
5. **Compliance & target-market** — inside "intelligence, never advice"; triggers a human gate? Respects the decumulation/vulnerable-customer reality?

## Pass 4. Strengthen, verdict & sequence

**Strengthen:** for every dimension below Strong, propose the specific concrete lift. Where none exists, mark **"no fix — inherent."** Note ripples (a lift that raises more than one dimension). Any lift that adds a question / bucket / episode gets a one-line **sanity-pass through this same rubric** (does it map to an outcome? acceptable intake cost?) so you never fix coherence by bloating onboarding.

**Verdict (threshold):**
- **REJECT** — veto failed, OR any dimension Absent, OR two-or-more Weak. (Exception: a candidate that is strong-once-a-redesign-decision-is-made may be surfaced as a **redesign-blocked REVISE** with the decision named — see worked example D.)
- **REVISE** — exactly one dimension Weak, or the unblock condition is known. Carries the **full lift plan** (every below-Strong fix), not just the blocker.
- **ADD** — all five Adequate-or-better. Still carries lift notes for Adequate dimensions.

**Sequence (effort vs payoff):** never sinks a verdict. Rank the ADDs (and unblocked REVISEs) so the high-payoff / sourceable / low-rework candidates come first. For a batch, produce a ranked summary table at the top.

## Pass 5. Confirm gate

Surface the scorecard(s) + (for a batch) the ranked table for Tom's confirm. On confirm, write to `_scratch/{date}-addition-eval-{candidate-or-batch-slug}-V1.md`.

## Output format

Per candidate, the scorecard shape from `references/worked-examples-V1.md` (veto line; the five dimensions each with rating + evidence + any `→ Lift`; VERDICT with lift plan; Effort/payoff). For a batch, the same scorecards preceded by a ranked ADD/REVISE/REJECT summary table.

## Hard rules

1. Never decide the open redesign question (stress planner vs general explorer) yourself — surface it. Booms are redesign-blocked until Tom decides.
2. Every rating carries a specific evidence line. No bare ratings.
3. Every below-Strong dimension carries a concrete lift OR an explicit "no fix — inherent."
4. Any lift that adds a question/bucket/episode is sanity-passed through this rubric.
5. The veto short-circuits — never score-average past a §0 failure.
6. You propose; you never auto-apply a lift or write planner code. A human decides; a separate build implements.
7. When the invariant pack and the design doc disagree, the design doc wins — say so and flag the pack as stale.
8. Em-dash sweep at save; output to the `_scratch/` path.

## Performance criteria

1. Reproduces the four worked examples (A REJECT, B REVISE, C ADD, D boom-blocked-REVISE) when followed.
2. Veto correctly short-circuits forecast/invented-number/zero-fill candidates.
3. Every below-Strong dimension has a lift or an inherent-no-fix mark; question/bucket/episode lifts are sanity-passed.
4. A batch run yields a ranked sequence by effort-vs-payoff.
5. Booms surface the framing redesign decision rather than passing silently.

## Failure modes

- **Bare rating.** "Coherence: Weak" with no reason is decoration. Mitigation: hard rule 2.
- **Salvaging the unsalvageable.** Proposing a "fix" for a §0 violation or a boom's framing. Mitigation: hard rule 1 + 3, the "no fix — inherent" mark.
- **Fixing coherence by bloating onboarding.** Adding intake questions to map every episode without counting the intake cost. Mitigation: hard rule 4, the recursive sanity-pass.
- **Score-averaging past the veto.** Letting a strong candidate buy back a §0 failure. Mitigation: hard rule 5, the short-circuit.
- **Quietly deciding the redesign.** Treating booms as ADD by stretching the downside frame. Mitigation: hard rule 1; framing scores Absent until the decision.

## Related

- [[Skills/consumer-duty-reviewer/SKILL]] — the human-gate authority for implied-suitability surfaces a candidate may trigger.
- [[Skills/fca-guidance-checker/SKILL]] — routes narration a candidate adds.
- [[Skills/behavioural-finance-reviewer/SKILL]] — the reviewer archetype this skill follows.
- [[Skills/simulation-addition-evaluator/references/scenario-planner-invariants-V1]] — the swappable bars.
- [[Skills/simulation-addition-evaluator/references/worked-examples-V1]] — the calibration cases.
- [[Skills/simulation-addition-evaluator/notes|notes.md]] / [[Skills/simulation-addition-evaluator/strategy|strategy.md]].

## Version history

**V1 (2026-06-24).** Built per the scenario-planner next-steps handoff as the keystone before the roster expansion. Two-layer thin-core/fat-pack; veto + five dimensions + strengthening step + sequencing lens.
```

- [ ] **Step 2: Verify the body reproduces the golden cases**

By hand, follow Pass 0–5 against worked example **B (property bust)** and **D (gold boom)** using the invariant pack. Confirm:
- B yields REVISE with the three-item lift plan (the coherence Weak triggers the property-belief-question lift; the question sanity-passes).
- D yields a redesign-blocked REVISE because framing is Absent with "no fix — inherent" and the redesign decision is named.
If a pass does not produce the stated verdict, fix the SKILL.md body (not the example) until it does.

- [ ] **Step 3: Verify section completeness**

Run: `grep -cE "^## (Pass [0-5]\.|Output format|Hard rules|Performance criteria|Failure modes|Related|Version history)" "/Users/thomasking/Documents/Co Work Reset/Skills/simulation-addition-evaluator/SKILL.md"`
Expected: **12** (Pass 0,1,2,3,4,5 = 6; plus Output format, Hard rules, Performance criteria, Failure modes, Related, Version history = 6).

---

## Task 5: Scaffold companion files (notes.md + strategy.md)

**Files:**
- Create: `/Users/thomasking/Documents/Co Work Reset/Skills/simulation-addition-evaluator/notes.md`
- Create: `/Users/thomasking/Documents/Co Work Reset/Skills/simulation-addition-evaluator/strategy.md`

Required by `Skills/CLAUDE.md` (scaffold `notes.md` + `strategy.md` with every new skill).

- [ ] **Step 1: Save notes.md**

```markdown
# notes — simulation-addition-evaluator

Operator notes.

- Tom's rule is the whole skill: *add anything that adds value, don't add anything weak.* Lead every scorecard from there.
- This is a **strengthening engine**, not just a gate. The lift plan is the point — a REVISE without a concrete lift plan is a failed run.
- Booms are the live trap. Do not let a boom through by stretching the downside frame. Framing scores Absent and surfaces the redesign decision until Tom rules on "stress planner vs general historical explorer."
- Keep the bars in the invariant pack, not in your head — when the product changes, the pack changes, the method doesn't.
- Dual-write / em-dash sweep at save per vault rules.
```

- [ ] **Step 2: Save strategy.md**

```markdown
# strategy — simulation-addition-evaluator

## Why this exists
The scenario-planner roster expansion (all crash AND boom events across stock/property/currency/gold) is a redesign, not a data add. Without a yardstick, weak or framing-breaking additions slip in. This skill is that yardstick, built before the expansion per the next-steps handoff.

## Key trade-offs decided in brainstorming (spec 2026-06-24)
- **Two-layer thin-core/fat-pack** over a one-off rubric: the method is durable, the bars are swappable, so the skill survives the roster redesign instead of being thrown away after one use. YAGNI guard: only the scenario-planner pack exists at v1.
- **Score + gate** over pure gate or pure ranking: per-dimension ratings show WHERE a candidate is weak (so it can be lifted); the threshold gives a decisive verdict; the effort-vs-payoff lens sequences a batch.
- **Strengthening step with two honesty guardrails** ("no fix — inherent"; recursive sanity-pass on any added question/bucket/episode) so it never pretends a candidate is salvageable and never fixes coherence by bloating onboarding.
- **Booms surfaced, not resolved:** the skill raises the framing redesign decision; it does not make it. That call is Tom's, in the roster-expansion workstream.

## Provenance
Brainstorm spec: `~/dev/unlock-demo-onboarding/docs/superpowers/specs/2026-06-24-simulation-addition-evaluator-design.md`. Grounding: `2026-06-23-scenario-planner-design.md`.
```

- [ ] **Step 3: Verify all five files exist**

Run: `ls -1 "/Users/thomasking/Documents/Co Work Reset/Skills/simulation-addition-evaluator/" "/Users/thomasking/Documents/Co Work Reset/Skills/simulation-addition-evaluator/references/"`
Expected: `SKILL.md`, `notes.md`, `strategy.md` in the skill folder; `scenario-planner-invariants-V1.md`, `worked-examples-V1.md` in `references/`.

---

## Task 6: Final acceptance — dry-run on a roster batch + commit the plan lineage

**Files:**
- (No new files; produces a `_scratch/` artifact and commits plan/spec lineage in the dev repo.)

- [ ] **Step 1: Dry-run the skill on a small roster batch**

Following the finished skill, score this 3-candidate batch end-to-end (Pass 0–5): **1929–32 Great Depression (already in library — expect ADD/known), 1992 Black Wednesday / sterling crisis (currency, type: episode), Gold 2011 peak (type: boom).** Confirm:
- The run produces a ranked summary table ordered by effort-vs-payoff.
- The currency candidate exposes the same orphan-bucket coherence gap as gold (no FX bucket/signal).
- Both boom/FX framing limitations surface the redesign decision rather than passing silently.
This validates success criteria 4 and 5 from the spec.

- [ ] **Step 2: Save the dry-run output**

Write the batch scorecard + ranked table to `/Users/thomasking/Documents/Co Work Reset/_scratch/2026-06-24-addition-eval-roster-smoke-V1.md`. This is both the acceptance evidence and the first real artifact for the roster-expansion workstream.

- [ ] **Step 3: Commit the plan + spec lineage (dev repo only)**

```bash
cd ~/dev/unlock-demo-onboarding
git add docs/superpowers/plans/2026-06-24-simulation-addition-evaluator.md
git commit -m "docs(eval-framework): implementation plan for simulation-addition-evaluator skill

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

(The vault skill files are saved/synced via Relay, not git-committed — do not git-add vault paths.)

- [ ] **Step 4: Report**

Summarise: the five skill files created, the four golden cases reproduced, the dry-run verdict + ranked table, and the one decision now on Tom's plate (the stress-planner-vs-explorer framing call that the roster expansion is blocked on).
```
