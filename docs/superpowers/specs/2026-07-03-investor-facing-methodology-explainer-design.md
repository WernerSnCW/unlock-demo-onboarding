# Investor-facing methodology explainer — design

**Status:** draft, approved by Tom 2026-07-03 · **Audience today:** Tony Vine-Lott only (investor + team, hence investor-space access)

## 1. Problem

The logic/formulas/evidence whitepaper delivered to Tony (2026-07-03) is a standalone Word doc, hand-authored by reading the code. It will drift the moment a threshold, weight, or citation changes in the app and nobody remembers to update the doc. Tom wants this surfaced in-app instead — toggleable per investor, always current, and readable in a deliberately sequenced order (concepts before the rules that use them, rules before the formulas that implement them, formulas before the citations that support them) rather than an arbitrary or alphabetical dump.

## 2. Non-goals (v1)

- Not a general public marketing page — lives inside the investor space, gated per investor.
- Not a distilled/redacted "safe for any investor" variant — the only intended reader today is Tony, who needs the same depth as the whitepaper (open items, killed claims, named decisions). Revisit distillation if/when a second investor is ever toggled on.
- Not a full in-app comment/redline system — that's the trickiest part of the original ask and is deliberately deferred. v1 ships a "download as Word doc" escape hatch so Tony can redline in a tool built for it.
- Not automatic update notifications — v1 is a manual admin action ("notify Tony"), reusing the Slack integration already proven working in this engagement.

## 3. Architecture

### 3.1 One content source, two renderers

`client/src/data/explainerContent.ts` (or `shared/` if the Word-doc generator needs server-side reuse — confirm during planning) becomes the single source of truth for every number, threshold, weight, and citation shown to Tony. It does **not** duplicate values — it imports/re-derives them from the actual live sources:

- Safety Lights thresholds ← `server/config/policy_defaults.yaml`
- Persona weight table + trait formulas ← `server/services/personaEngine.ts` (weights table exported for reuse; formula prose stays hand-authored but is unit-tested against the real function output so numbers can't silently diverge)
- Persona evidence citations ← `client/src/data/personaEvidenceCitations.ts`
- Scenario/episode sourcing ← the sourcing appendix data (extract into a typed module if not already one)

Two consumers read this same module:
1. The in-app page (`/onboarding-v2/methodology`)
2. The Word-doc generator script (the one used to build the 2026-07-03 whitepaper — refactored to read from `explainerContent.ts` instead of hand-typed prose)

A test (`explainerContent.test.ts`) asserts each displayed number equals its live source (e.g. `explainerContent.safetyLights.liquidity.redBelow === policyDefaults.projection.min_cash_months`). This is what makes "always aligned, never drifts" true rather than aspirational.

### 3.2 Content sequencing — the dependency graph

Each topic is a node:

```ts
interface Topic {
  id: string;                 // e.g. 'safety-lights', 'persona-weights'
  kind: 'concept' | 'rule' | 'formula' | 'citation';
  title: string;
  dependsOn: string[];        // topic ids that must render earlier
  order?: number;             // tiebreaker for same-depth topics, default 0
  render: (data: ExplainerData) => TopicContent; // prose + tables, referencing live data
}
```

A build-time function (`sequenceTopics(topics: Topic[]): Topic[]`) topologically sorts the graph (Kahn's algorithm), using `order` to break ties between topics at the same depth. It throws on cycles — a fast, loud failure mode for a future author who introduces a circular dependency by mistake.

Example graph for the topics that exist today (illustrative, finalized during planning):
- `philosophy` — no deps (foundational)
- `safety-lights` — depends on `philosophy`
- `persona-engine` — depends on `philosophy`, `safety-lights` (reuses "cash runway" vocabulary)
- `beliefs-tilts` — depends on `philosophy`, `safety-lights` (gating)
- `scenario-stress` — depends on `beliefs-tilts` (reuses the 0.20 salience threshold), `safety-lights` (concentration/HHI)
- `illustrative-alternatives` — depends on `scenario-stress`, `safety-lights` (liquidity floor)
- `citations` — depends on `persona-engine`, `scenario-stress` (cites the evidence each of those uses)
- `non-goals` — depends on all preceding concept/rule/formula topics
- `known-limitations` — depends on `non-goals`
- `formula-reference` — depends on all (pure appendix)

`sequenceTopics()` output feeds both renderers, so the in-app page and the Word doc structurally cannot diverge in reading order either — same guarantee as the numbers.

**Test:** `explainerSequencing.test.ts` — asserts no cycles, asserts a topic never appears before any topic in its `dependsOn`, asserts determinism (same graph → same order every run).

### 3.3 Surface

New route `/onboarding-v2/methodology`, reachable from a persistent nav element (not inserted into the 13-step sequence — it's reference material, not a step to complete). Renders topics in `sequenceTopics()` order, grouped visually by `kind` within the sequence (concept → rule → formula → citation, as each cluster occurs).

### 3.4 Gating

The onboarding-v2 session record (the one behind `/i/:token`, read via `loadInvestorSession`) gets a new boolean column, e.g. `methodologyDocEnabled`. `GET /api/onboarding-v2/i/:token` includes it in the session payload; the client hides the nav link and the route (redirects) when false. An admin endpoint flips it, reusing the existing `adminHeaders()` auth pattern already used elsewhere in `onboardingSync.ts`. Only Tony's token gets it enabled.

**Constraint carried over from investigation:** this session table needs a real Postgres connection — the dummy `DATABASE_URL` used for local preview does not support it (confirmed: `/api/onboarding-v2/sessions` 500s locally today). Testing this feature end-to-end needs a real DB, unlike the rest of tonight's work.

### 3.5 Update notification

An admin action, "Notify Tony this updated," sends a Slack DM (same mechanism already used to ping Werner tonight) with a one-line summary of what changed and a link to `/i/:token/methodology`. No automatic trigger on every save in v1 — a human decides when a change is substantial enough to flag.

### 3.6 Feedback loop (stopgap only)

A "Download as Word doc" button on the page, reusing the §3.1 generator, so Tony can comment/track-change in a tool built for that. No in-app comment system yet — flagged as the real fast-follow once we've seen how Tony actually wants to work with it.

## 4. Testing

- `explainerContent.test.ts` — every displayed value matches its live source (drift guard).
- `explainerSequencing.test.ts` — graph validity (no cycles, dependency ordering respected, deterministic).
- Existing Word-doc-generation validation (docx schema validator) reused for the refactored generator.
- Browser-verified: the gated route renders for a flagged session and 404s/redirects for an unflagged one.

## 5. Open questions for planning

- Exact storage location for `explainerContent.ts` (client-only vs `shared/` for server-side doc generation reuse).
- Whether the admin "notify" and "toggle" actions get a UI, or stay script/CLI-driven for the Tony-only v1.
- Whether `sequenceTopics()` needs a visible "table of contents" derived the same way, for both the page and the doc.
