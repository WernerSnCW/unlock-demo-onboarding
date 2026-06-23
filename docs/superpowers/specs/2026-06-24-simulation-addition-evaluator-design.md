# Design — `simulation-addition-evaluator` skill

**Created:** 2026-06-24 · **Repo grounding:** `~/dev/unlock-demo-onboarding`, branch `feat/v2-scenario-stress-engine` (PR #4)
**Status:** DRAFT — brainstorm complete, pending Tom review before writing the implementation plan.
**Builds on:** the scenario-planner design `docs/superpowers/specs/2026-06-23-scenario-planner-design.md` (the §-references below point into it).
**Skill home (when built):** vault `Skills/simulation-addition-evaluator/` (cloudworkz reviewer-archetype family).

---

## 0. Purpose

A reusable **evaluation framework** — the keystone the next-steps handoff calls for — that scores any *candidate addition* to the Unlock scenario planner (and, by extension, its onboarding) on whether it **strengthens** the product, and tells you **how to make it stronger** before it ships.

Tom's steer: *"add anything that adds value, don't add anything weak."* The framework is the yardstick the roster expansion (all crash AND boom events across stock / property / currency / gold) runs through, candidate by candidate.

It is **not only a pass/fail gate** — for every dimension a candidate falls short on, it proposes the concrete lift. It is a *strengthening engine* with a gate, not a gate alone.

---

## 1. Shape & placement (the "shell")

A **cloudworkz reviewer-archetype skill** — markdown, run by reading, same family as `behavioural-finance-reviewer` / `consumer-duty-reviewer`. You point it at one or more candidates; it returns a scorecard + ADD/REVISE/REJECT verdict + a lift plan, and (for a batch) a ranked sequence. Output lands in `_scratch/{date}-...`.

**Two-layer structure (decided: thin core / fat pack):**

| Layer | File | Role | Changes when… |
|---|---|---|---|
| **Skill (durable shell)** | `Skills/simulation-addition-evaluator/SKILL.md` | The scoring procedure, evidence discipline, verdict + lift-plan format, confirm gate, pass structure | Rarely — only if the *method* changes |
| **Invariant pack (swappable)** | `Skills/simulation-addition-evaluator/references/scenario-planner-invariants-V1.md` | The concrete bars each dimension scores against, distilled from the design doc | Whenever the product evolves (e.g. roster expansion makes the boom decision) |
| Companion files | `notes.md`, `strategy.md` | Operator voice + design history (scaffolded per Skills/CLAUDE.md) | — |

**YAGNI guard:** the "general core" is just the stable spine + verdict method. The only invariant pack at v1 is the scenario-planner one. We do **not** build speculative packs for hypothetical future simulations Unlock does not have. A second simulation, if it ever appears, gets its own pack then.

**Why this name:** `simulation-addition-evaluator` says what it does — evaluates candidate additions to a simulation/onboarding product. (Considered and rejected: `onboarding-strength-reviewer`, `scenario-strength-evaluator`.)

---

## 2. The rubric (the "heart")

One **veto gate**, five **scored dimensions**, one **sequencing lens**. All bars are sourced from the scenario-planner design doc and live in the invariant pack.

### Veto gate — §0 Invariant safety *(pass/fail, not scored)*

Does the candidate preserve the protected invariants?
- **Empirical-only** — replays a real, cited episode. No forward Monte-Carlo, no modelled/forecast element. A boom episode is still a real cited series.
- **No invented numbers** — severity is a read-position *within observed history*; never an arbitrary multiplier (the deleted `{0.7,1.4}` must not reappear), never zero-fill, never a fabricated pre-~1870 path.

**Fail → automatic REJECT**, regardless of how strong the candidate is elsewhere. This line cannot be bought back. (Short-circuits the scoring passes.)

### Five scored dimensions — each rated **Strong / Adequate / Weak / Absent**, every rating backed by a specific evidence line (no bare ratings)

| # | Dimension | The question it asks | What it catches |
|---|---|---|---|
| 1 | **Sourceability & provenance** | Can every number be cited to a real series (provider, series ID, granularity, licence)? Does a comparable series exist, or does it force zero-fill / pre-1870 fabrication? | Unsourceable episodes (1973 EM gap; pre-1988 buckets) |
| 2 | **Comprehension value** | Does it add a *distinct teaching beat* (Bloom) / build understanding, or just add quant noise to the canvas? Does it earn its place on the stable spine? | "Weak" additions that teach nothing new |
| 3 | **Coherence & mapping** | No orphans: every episode reachable by some belief/circumstance signal; every intake question maps to a step-7 tilt or a scenario salience/outcome; new buckets fit the 1-D taxonomy + `bucketFor` + holdings mapping (§7A) | Disconnected additions (a gold bucket no holdings map to; an episode no belief reaches) |
| 4 | **Framing integrity** | Does it fit the product's framing or break it? Downside drawdown/recovery/band-min-as-worst semantics; neutral non-advice comparison; symmetric, non-valenced delta | **Booms** — they break the downside-only frame; this dimension forces the redesign decision rather than letting them slip in |
| 5 | **Compliance & target-market** | Stays inside "intelligence, never advice" (+ banned verbs)? Triggers a human gate (implied suitability / Targeted Support PS25/22)? Respects the decumulation / vulnerable-customer reality (recovery-time)? | Additions that quietly cross into advice or ignore the short-horizon ICP |

### Verdict rule (threshold)

- **REJECT** if the veto fails, **or** any dimension is **Absent**, **or** two-or-more dimensions are **Weak**.
- **REVISE** if exactly one dimension is Weak, **or** the unblock condition is known (e.g. "ADD once framing reworked for upside" / "ADD once sourced"). Carries the full **lift plan**.
- **ADD** if all five are Adequate-or-better. Still carries lift notes for any Adequate dimensions.

### Sequencing lens — Effort vs payoff *(orders the ADDs; never sinks a verdict)*

A high-value candidate is never REJECTED for being effortful — it is ADD-but-later. This lens ranks the batch so the roster expansion does the high-payoff / sourceable / low-rework candidates first.

---

## 3. The strengthening step (what makes it an engine, not just a gate)

For **every dimension scored below Strong**, the framework proposes the specific, concrete action that would lift it — where one exists.

- Example: Weak coherence on a property-bust episode → *"add a `PROPERTY_DOWNTURN` belief-stage question so the episode is reachable."*
- **Ripples are noted** — that same belief question lifts coherence *and* can add comprehension value (a new thing the user learns about themselves).

Two honesty guardrails:

1. **Some weaknesses can't be lifted.** A pre-1870 episode is unsourceable by §0; a boom can't be made to "fit" the downside frame without the redesign call. These are marked **"no fix — inherent"**, so the engine never pretends every candidate is salvageable.
2. **A proposed lift is itself a candidate.** Any fix that adds a question / bucket / episode gets a quick **sanity-pass through the same rubric** (maps to an outcome? acceptable intake cost?). This stops the framework from "fixing" coherence by bloating onboarding. The strengthener is disciplined by its own gate.

**REVISE** carries the full lift plan (every below-Strong dimension's fix), not just the single blocker. **ADD** carries lift notes for Adequate dimensions — making a good addition better before it ships.

---

## 4. The skill flow (passes)

Follows the cloudworkz reviewer-archetype structure:

- **Pass 0 — Context prime.** Load the invariant pack (`references/scenario-planner-invariants-V1.md`); if a call is in doubt, the canonical design doc it points to. Read the candidate(s) in full.
- **Pass 1 — Classify.** Tag each candidate by type: *episode · asset-class/bucket · boom event · intake/belief question · other surface.* The rubric applies with type-specific emphasis (sourceability bites hardest on episodes; coherence on buckets + intake questions; framing integrity on booms).
- **Pass 2 — Veto gate.** Run §0. On fail, short-circuit to REJECT with the reason.
- **Pass 3 — Score the five dimensions.** Strong/Adequate/Weak/Absent, each with a specific evidence line. No bare ratings.
- **Pass 4 — Strengthen, verdict & sequence.** For each below-Strong dimension, propose the lift (or mark "no fix — inherent"); sanity-pass any lift that adds a question/bucket/episode. Apply the threshold rule → ADD/REVISE/REJECT with the full lift plan. Add the effort-vs-payoff read. For a batch, produce a ranked summary table.
- **Pass 5 — Confirm gate.** Surface the scorecard(s) + batch ranking for Tom's confirm, then write to `_scratch/{date}-addition-eval-{candidate-or-batch-slug}-V1.md`.

---

## 5. Output format

Per candidate, a compact scorecard:

```
### Candidate: 1989–91 UK property bust   [type: episode]
Veto (§0 empirical/no-invented): PASS
1 Sourceability      Adequate  — Nationwide HPI from 1952 (quarterly); gilt/cash sourceable
                     → Lift: cite the gilt series to close the partial-source gap
2 Comprehension      Strong    — adds the "property falls too + slow recovery" beat, absent today
3 Coherence/mapping  Weak      — no PROPERTY_DOWNTURN salience axis exists (§7A orphan)
                     → Lift: add a property-downturn belief question (ripples → +comprehension)
                       (that new question sanity-passes the rubric: maps to outcome ✓, low intake cost ✓)
4 Framing integrity  Adequate  — downside episode, fits the existing frame
5 Compliance/TM      Adequate  — recovery-time reality serves the decumulation ICP
                     → Lift: surface real-terms recovery (a nominal-only "recovered in N months" would mislead)
VERDICT: REVISE → lift plan: [add property belief question; cite gilt series; show real-terms recovery]
Effort/payoff: medium effort, high payoff → early in the queue once lifted.
```

For a **batch** (the roster expansion): the same scorecards, preceded by a ranked ADD/REVISE/REJECT summary table at the top (ordered by the sequencing lens).

---

## 6. The invariant pack contents (`references/scenario-planner-invariants-V1.md`)

The swappable layer — a distillation of the design doc into the concrete bars each dimension scores against:

- **§0 veto bars** — empirical-only and no-invented-numbers stated as pass/fail tests (no forecast/MC; no arbitrary multiplier; no zero-fill; replay floor ~1870).
- **Sourceability bars** — the provenance contract (provider / series-ID / granularity / licence); the deep-history source table (Shiller / JST / FRED / SBBI / Barclays / MSCI); "no comparable series → render, never zero-fill"; real-terms recovery for inflation episodes.
- **Comprehension bars** — the Bloom teaching-beat ladder; the "earns its place on the stable spine" test.
- **Coherence bars** — the §7A rule (no orphan episodes / no orphan questions); the current belief-axis → episode map; the 1-D bucket taxonomy + `bucketFor` / holdings mapping.
- **Framing bars** — downside drawdown / recovery / band-min semantics; neutral non-advice comparison; symmetric-not-valenced delta; **the explicit "booms break this" flag** with the open "stress planner vs general historical explorer" redesign question.
- **Compliance / target-market bars** — "intelligence never advice" + banned verbs; the human-gate triggers (implied suitability; Targeted Support PS25/22, live 6 Apr 2026); the decumulation / vulnerable-customer recovery-time reality.
- **Pointer** back to the canonical design doc + current branch.
- **"How to extend this pack"** note — e.g. when the roster expansion makes the boom decision, the framing section gains an upside-path / read-position-for-gains subsection. The skill logic does not change; this file does.

---

## 7. Success criteria

- The skill scores any of the five candidate types and returns a scorecard + ADD/REVISE/REJECT verdict + lift plan, with every rating backed by a specific evidence line (no bare ratings).
- The §0 veto correctly REJECTS any forecast / invented-number / zero-fill candidate, short-circuiting the scoring passes.
- Every below-Strong dimension carries a concrete lift **or** an explicit "no fix — inherent"; lifts that add a question/bucket/episode are sanity-passed through the rubric.
- A batch run produces a ranked sequence ordered by effort-vs-payoff.
- Running the skill on the roster-expansion candidates surfaces the boom-framing redesign decision (via dimension 4) rather than letting booms through silently.
- The invariant pack is separable from the skill: updating a bar (e.g. adding the upside-framing subsection) requires no change to SKILL.md.
- Skill follows the cloudworkz reviewer archetype: frontmatter, Pass 0–5, hard rules, performance criteria, failure modes, related, version history; output to `_scratch/`; companion `notes.md` / `strategy.md` scaffolded.

---

## 8. Out of scope (v1)

- Speculative invariant packs for other (non-existent) Unlock simulations.
- Auto-applying lifts (the skill *proposes*; a human decides and a separate build implements).
- Running the roster expansion itself — that is the *next* workstream, which uses this framework as its yardstick.
- Any change to the scenario planner code.

---

## 9. Open items / decisions folded in

- **Decided:** two-layer (thin core / fat pack); score+gate verdict; reviewer-archetype skill in vault `Skills/`; name `simulation-addition-evaluator`; strengthening step with the two honesty guardrails; design doc home = this dev-repo `specs/` folder (keeps the scenario-planner lineage together).
- **Deferred to roster-expansion workstream (not this skill):** the actual "stress planner vs general historical explorer" framing decision; gold/FX taxonomy expansion. This skill *surfaces* those; it does not resolve them.
