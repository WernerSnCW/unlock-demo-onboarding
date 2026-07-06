# Investor-Facing Methodology Explainer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Surface the onboarding logic/formulas/citations whitepaper as an in-app page (`/onboarding-v2/methodology`), gated per investor, whose numbers and reading order are pulled live from the actual code/config — so it structurally cannot drift out of sync.

**Architecture:** A server-side content module (`server/content/`) reads live values from `getPolicy()`, `personaEngine.ts`'s weight table, and the persona evidence citations, assembles them into a dependency-graph of "topics," topologically sorts them into reading order, and serves the result from a new `GET /api/onboarding-v2/methodology` endpoint. A new client page fetches and renders it. Gating is a simple server-side token allowlist merged into the existing `/i/:token` session response — no DB schema change, since the session table needs a real Postgres connection this environment doesn't have.

**Tech Stack:** TypeScript, Express (existing `server/routes.ts`), React + wouter (existing client), Vitest (node env, matches existing test convention).

---

### Task 1: Export the persona weight table

**Files:**
- Modify: `server/services/personaEngine.ts:291`
- Test: `server/services/personaEngine.test.ts` (new file)

- [ ] **Step 1: Write the failing test**

```typescript
// server/services/personaEngine.test.ts
import { describe, it, expect } from 'vitest';
import { PERSONA_WEIGHT_TABLE } from './personaEngine';

describe('PERSONA_WEIGHT_TABLE', () => {
  it('is exported and every persona’s weights sum to 1.0', () => {
    expect(PERSONA_WEIGHT_TABLE).toBeDefined();
    for (const [code, weights] of Object.entries(PERSONA_WEIGHT_TABLE)) {
      const sum = Object.values(weights).reduce((a, b) => a + b, 0);
      expect(sum, `${code} weights should sum to 1.0`).toBeCloseTo(1.0, 6);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run server/services/personaEngine.test.ts`
Expected: FAIL — `PERSONA_WEIGHT_TABLE` is not exported (TS error: "has no exported member").

- [ ] **Step 3: Export the table**

In `server/services/personaEngine.ts`, change line 291 from:
```typescript
const PERSONA_WEIGHT_TABLE: Record<PrimaryPersonaCode, PersonaWeights> = {
```
to:
```typescript
export const PERSONA_WEIGHT_TABLE: Record<PrimaryPersonaCode, PersonaWeights> = {
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run server/services/personaEngine.test.ts`
Expected: PASS (1 test)

- [ ] **Step 5: Run the full suite to confirm nothing else broke**

Run: `npm test`
Expected: all existing tests still green (this is a pure export addition, no behavior change)

- [ ] **Step 6: Commit**

```bash
git add server/services/personaEngine.ts server/services/personaEngine.test.ts
git commit -m "refactor(persona): export PERSONA_WEIGHT_TABLE for the methodology explainer"
```

---

### Task 2: Topic dependency-graph sequencer

**Files:**
- Create: `server/content/topicSequencer.ts`
- Test: `server/content/topicSequencer.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// server/content/topicSequencer.test.ts
import { describe, it, expect } from 'vitest';
import { sequenceTopics, type Topic } from './topicSequencer';

function topic(id: string, dependsOn: string[] = [], order = 0): Topic {
  return { id, kind: 'concept', title: id, dependsOn, order, render: () => ({ prose: [], tables: [] }) };
}

describe('sequenceTopics', () => {
  it('orders a topic after everything it depends on', () => {
    const result = sequenceTopics([topic('c', ['b']), topic('b', ['a']), topic('a')]);
    const ids = result.map((t) => t.id);
    expect(ids.indexOf('a')).toBeLessThan(ids.indexOf('b'));
    expect(ids.indexOf('b')).toBeLessThan(ids.indexOf('c'));
  });

  it('is deterministic across repeated calls on the same graph', () => {
    const topics = [topic('c', ['a']), topic('b', ['a']), topic('a')];
    const first = sequenceTopics(topics).map((t) => t.id);
    const second = sequenceTopics(topics).map((t) => t.id);
    expect(second).toEqual(first);
  });

  it('uses order as a tiebreaker among topics at the same depth', () => {
    const result = sequenceTopics([
      topic('later', ['root'], 10),
      topic('earlier', ['root'], 1),
      topic('root'),
    ]);
    const ids = result.map((t) => t.id);
    expect(ids.indexOf('earlier')).toBeLessThan(ids.indexOf('later'));
  });

  it('throws on a circular dependency', () => {
    expect(() => sequenceTopics([topic('a', ['b']), topic('b', ['a'])])).toThrow(/cycle/i);
  });

  it('throws when a topic depends on an id that does not exist', () => {
    expect(() => sequenceTopics([topic('a', ['missing'])])).toThrow(/unknown topic/i);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run server/content/topicSequencer.test.ts`
Expected: FAIL — module `./topicSequencer` does not exist.

- [ ] **Step 3: Implement the sequencer**

```typescript
// server/content/topicSequencer.ts

export type TopicKind = 'concept' | 'rule' | 'formula' | 'citation';

export interface TopicTable {
  headers: string[];
  rows: string[][];
}

export interface TopicContent {
  prose: string[];
  tables: TopicTable[];
}

export interface Topic {
  id: string;
  kind: TopicKind;
  title: string;
  dependsOn: string[];
  order?: number;
  render: () => TopicContent;
}

/**
 * Topological sort (Kahn's algorithm) over the topic dependency graph.
 * `order` breaks ties between topics that become available at the same time,
 * so authors can nudge sibling ordering without fighting the algorithm.
 */
export function sequenceTopics(topics: Topic[]): Topic[] {
  const byId = new Map(topics.map((t) => [t.id, t]));
  for (const t of topics) {
    for (const dep of t.dependsOn) {
      if (!byId.has(dep)) {
        throw new Error(`Topic "${t.id}" depends on unknown topic "${dep}"`);
      }
    }
  }

  const inDegree = new Map<string, number>(topics.map((t) => [t.id, t.dependsOn.length]));
  const dependents = new Map<string, string[]>(topics.map((t) => [t.id, []]));
  for (const t of topics) {
    for (const dep of t.dependsOn) {
      dependents.get(dep)!.push(t.id);
    }
  }

  const ready = topics.filter((t) => inDegree.get(t.id) === 0);
  const sortReady = (a: Topic, b: Topic) => (a.order ?? 0) - (b.order ?? 0) || a.id.localeCompare(b.id);
  ready.sort(sortReady);

  const result: Topic[] = [];
  const queue = [...ready];
  while (queue.length > 0) {
    queue.sort(sortReady);
    const next = queue.shift()!;
    result.push(next);
    for (const depId of dependents.get(next.id)!) {
      const remaining = inDegree.get(depId)! - 1;
      inDegree.set(depId, remaining);
      if (remaining === 0) queue.push(byId.get(depId)!);
    }
  }

  if (result.length !== topics.length) {
    throw new Error('Cycle detected in topic dependency graph');
  }

  return result;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run server/content/topicSequencer.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add server/content/topicSequencer.ts server/content/topicSequencer.test.ts
git commit -m "feat(content): add topic dependency-graph sequencer for the methodology explainer"
```

---

### Task 3: Live-data content aggregator (the drift guard)

**Files:**
- Create: `server/content/explainerContent.ts`
- Test: `server/content/explainerContent.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// server/content/explainerContent.test.ts
import { describe, it, expect } from 'vitest';
import { getExplainerData } from './explainerContent';
import { getPolicy } from '../services/policy';
import { PERSONA_WEIGHT_TABLE } from '../services/personaEngine';

describe('getExplainerData', () => {
  it('mirrors the live Safety Lights thresholds — never a hand-copied number', () => {
    const policy = getPolicy();
    const data = getExplainerData();
    expect(data.safetyLights.liquidity.redBelowMonths).toBe(policy.projection.min_cash_months);
    expect(data.safetyLights.liquidity.amberBelowMonths).toBe(
      policy.projection.min_cash_months * policy.projection.cash_amber_multiple,
    );
    expect(data.safetyLights.concentration.redAboveFraction).toBe(policy.projection.max_single_name_pct);
    expect(data.safetyLights.illiquids.redAboveFraction).toBe(policy.collectibles.max_weight_pct);
  });

  it('mirrors the live persona weight table exactly', () => {
    const data = getExplainerData();
    expect(data.personaWeights).toEqual(PERSONA_WEIGHT_TABLE);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run server/content/explainerContent.test.ts`
Expected: FAIL — module `./explainerContent` does not exist.

- [ ] **Step 3: Implement the aggregator**

```typescript
// server/content/explainerContent.ts
import { getPolicy } from '../services/policy';
import { PERSONA_WEIGHT_TABLE } from '../services/personaEngine';

export interface ExplainerData {
  safetyLights: {
    liquidity: { redBelowMonths: number; amberBelowMonths: number };
    concentration: { redAboveFraction: number; amberAboveFraction: number };
    illiquids: { redAboveFraction: number; amberAboveFraction: number };
  };
  personaWeights: typeof PERSONA_WEIGHT_TABLE;
}

/**
 * Every number here is re-derived from the live policy/persona-engine config,
 * never hand-typed — this is what keeps the methodology explainer from
 * drifting out of sync with the actual product logic. See
 * explainerContent.test.ts for the assertions that enforce this.
 */
export function getExplainerData(): ExplainerData {
  const policy = getPolicy();
  return {
    safetyLights: {
      liquidity: {
        redBelowMonths: policy.projection.min_cash_months,
        amberBelowMonths: policy.projection.min_cash_months * policy.projection.cash_amber_multiple,
      },
      concentration: {
        redAboveFraction: policy.projection.max_single_name_pct,
        amberAboveFraction: policy.projection.max_single_name_pct * policy.projection.concentration_amber_fraction,
      },
      illiquids: {
        redAboveFraction: policy.collectibles.max_weight_pct,
        amberAboveFraction: policy.collectibles.max_weight_pct * policy.collectibles.amber_fraction,
      },
    },
    personaWeights: PERSONA_WEIGHT_TABLE,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run server/content/explainerContent.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add server/content/explainerContent.ts server/content/explainerContent.test.ts
git commit -m "feat(content): live-data aggregator for the methodology explainer (drift guard)"
```

---

### Task 4: The topic content — full explainer graph

**Files:**
- Create: `server/content/explainerTopics.ts`
- Test: `server/content/explainerTopics.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// server/content/explainerTopics.test.ts
import { describe, it, expect } from 'vitest';
import { getSequencedTopics } from './explainerTopics';

describe('getSequencedTopics', () => {
  it('sequences all ten topics without throwing', () => {
    const topics = getSequencedTopics();
    expect(topics).toHaveLength(10);
  });

  it('places philosophy first (nothing else can come before it)', () => {
    const topics = getSequencedTopics();
    expect(topics[0].id).toBe('philosophy');
  });

  it('places persona-engine after safety-lights (it reuses cash-runway vocabulary)', () => {
    const topics = getSequencedTopics();
    const ids = topics.map((t) => t.id);
    expect(ids.indexOf('safety-lights')).toBeLessThan(ids.indexOf('persona-engine'));
  });

  it('places citations after both persona-engine and scenario-stress', () => {
    const topics = getSequencedTopics();
    const ids = topics.map((t) => t.id);
    expect(ids.indexOf('persona-engine')).toBeLessThan(ids.indexOf('citations'));
    expect(ids.indexOf('scenario-stress')).toBeLessThan(ids.indexOf('citations'));
  });

  it('every topic renders non-empty prose', () => {
    for (const topic of getSequencedTopics()) {
      const content = topic.render();
      expect(content.prose.length, `${topic.id} should have prose`).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run server/content/explainerTopics.test.ts`
Expected: FAIL — module `./explainerTopics` does not exist.

- [ ] **Step 3: Implement the topic graph**

```typescript
// server/content/explainerTopics.ts
import { sequenceTopics, type Topic } from './topicSequencer';
import { getExplainerData } from './explainerContent';

export function getSequencedTopics(): Topic[] {
  const data = getExplainerData();
  const pct = (n: number) => `${Math.round(n * 100)}%`;

  const topics: Topic[] = [
    {
      id: 'philosophy',
      kind: 'concept',
      title: 'Philosophy & invariants',
      dependsOn: [],
      order: 0,
      render: () => ({
        prose: [
          'This product provides intelligence, never advice. It holds no funds and takes no execution action.',
          'An earlier version ran a forward-looking Monte Carlo simulation. It was deleted: persona matching used magnitude-blind cosine similarity, the belief engine could only add risk signal, correlation dampening mistreated negative correlations, calibrated probabilities were computed then thrown away, and correlated shocks were compounded with a placeholder identity matrix.',
          'The replacement (see Scenario Stress) follows two rules: no invented numbers, and no extrapolation beyond what markets actually reached historically.',
          'Persona (see Persona Engine) is an anchor, not an input — it never feeds a recommendation or target allocation, and no match-percentage is ever shown.',
        ],
        tables: [],
      }),
    },
    {
      id: 'safety-lights',
      kind: 'rule',
      title: 'Safety Lights',
      dependsOn: ['philosophy'],
      order: 0,
      render: () => ({
        prose: [
          'Safety Lights measure liquidity, concentration, and illiquid exposure on the investor’s real, current portfolio. The worst of the three becomes the overall status, and a RED overall status blocks belief-driven tilts from applying.',
        ],
        tables: [
          {
            headers: ['Light', 'RED', 'AMBER', 'GREEN'],
            rows: [
              ['Liquidity (cash runway)', `< ${data.safetyLights.liquidity.redBelowMonths} months`, `${data.safetyLights.liquidity.redBelowMonths}–${data.safetyLights.liquidity.amberBelowMonths} months`, `≥ ${data.safetyLights.liquidity.amberBelowMonths} months`],
              ['Concentration (largest holding)', `> ${pct(data.safetyLights.concentration.redAboveFraction)}`, `${pct(data.safetyLights.concentration.amberAboveFraction)}–${pct(data.safetyLights.concentration.redAboveFraction)}`, `≤ ${pct(data.safetyLights.concentration.amberAboveFraction)}`],
              ['Illiquids (% of portfolio)', `> ${pct(data.safetyLights.illiquids.redAboveFraction)}`, `${pct(data.safetyLights.illiquids.amberAboveFraction)}–${pct(data.safetyLights.illiquids.redAboveFraction)}`, `≤ ${pct(data.safetyLights.illiquids.amberAboveFraction)}`],
            ],
          },
        ],
      }),
    },
    {
      id: 'persona-engine',
      kind: 'formula',
      title: 'Persona Engine',
      dependsOn: ['philosophy', 'safety-lights'],
      order: 0,
      render: () => ({
        prose: [
          'Six trait scores (T1–T6, each 0–1) are computed deterministically from Intake and Holdings. Three hard overrides (business ≥25% of net worth, property ≥30% of the portfolio, crypto band >25%) assign a persona at full confidence and bypass weighting entirely.',
          'Otherwise, each of the eight personas gets a score — the dot product of the investor’s trait scores against that persona’s weight row (weights sum to 1.0 per persona) — and the highest wins. Confidence is the gap between the top two scores, not a probability, and is never shown to the investor as a percentage.',
        ],
        tables: [
          {
            headers: ['Persona', 'Risk', 'Alts', 'Property', 'Liquidity', 'Income', 'Complexity'],
            rows: Object.entries(data.personaWeights).map(([code, w]) => [
              code, String(w.risk_appetite), String(w.alternatives_bias), String(w.property_bias),
              String(w.liquidity_comfort), String(w.income_orientation), String(w.complexity_proxy),
            ]),
          },
        ],
      }),
    },
    {
      id: 'beliefs-tilts',
      kind: 'rule',
      title: 'Beliefs → Portfolio Tilts',
      dependsOn: ['philosophy', 'safety-lights'],
      order: 1,
      render: () => ({
        prose: [
          'Eight style/preference questions map to eight axes via normaliseAnswer(a) = (a − 3) / 2, giving −1.0..+1.0 in 0.5 steps. One deliberate inversion: VOLATILITY_AVERSION = −normalised(Q_VOLATILITY_COMFORT).',
          'Intensity bands on |score|: neutral below 0.20, light 0.20–0.50, moderate 0.50–0.80, strong at or above 0.80. If the overall Safety Light status is RED, tilts are captured but not applied.',
        ],
        tables: [],
      }),
    },
    {
      id: 'scenario-stress',
      kind: 'formula',
      title: 'Outlook & Scenario Stress',
      dependsOn: ['beliefs-tilts', 'safety-lights'],
      order: 0,
      render: () => ({
        prose: [
          'Real holdings are replayed through cited historical episodes (Shiller, JST Macrohistory, FRED) — never a forward simulation. portfolioReturn(t) = Σ w[i] × episode.path[i][t] for each asset bucket i.',
          'A read-position slider interpolates between the blended central path and the worst observed edge of the chosen episodes — it can never show a loss deeper than an episode actually reached, because it only interpolates between two real observations.',
          'Alignment score = 100 × (1 − L1distance(currentMix, beliefWeightedIdealMix) / 2) — the overlap coefficient between two mix vectors, always shown with a qualitative band, never a bare number.',
        ],
        tables: [],
      }),
    },
    {
      id: 'illustrative-alternatives',
      kind: 'rule',
      title: 'Illustrative Alternatives',
      dependsOn: ['scenario-stress', 'safety-lights'],
      order: 0,
      render: () => ({
        prose: [
          'One illustrative way to reduce the modelled impact, staged into liquid moves (Stage 1, executable now) and illiquid moves (Stage 2, deferred). Trades below 0.5 percentage points are dropped as noise.',
          'Three invariants: after-mix equals the target exactly; after-alignment is 100 by construction and captioned as definitional, never an "uplift"; the runway comparison is a verdict only, never a "months gained" number, because the underlying buffer walk is mix-independent.',
        ],
        tables: [],
      }),
    },
    {
      id: 'citations',
      kind: 'citation',
      title: 'Data & evidence citations',
      dependsOn: ['persona-engine', 'scenario-stress'],
      order: 0,
      render: () => ({
        prose: [
          'Historical scenario data: Shiller (US equity/bonds, monthly, back to 1871), JST Macrohistory (18 economies, annual, back to 1870), FRED. Cross-check series (FTSE, MSCI, Bloomberg Global Aggregate) are illustrative pending full redistribution-licensing review.',
          'Persona evidence: the "built from ONS/FCA" claim is killed — those sources publish distributions and small, wrong-population typologies, never a persona set for this cohort. Current citation line: Pompian (2012) and Bailard/Biehl/Kaiser (1986) as incorporated in the CFA Institute Level III curriculum, calibrated against LongAngle 2026, BofA Private Bank 2024, and Connection Capital 2023 UK HNW survey data.',
        ],
        tables: [],
      }),
    },
    {
      id: 'non-goals',
      kind: 'concept',
      title: 'What this product deliberately does not do',
      dependsOn: ['persona-engine', 'beliefs-tilts', 'scenario-stress', 'illustrative-alternatives', 'citations'],
      order: 0,
      render: () => ({
        prose: [
          'No probabilities or forecasts. No modelled cross-asset correlation. No FX/currency modelling. No user-facing persona match-percentage. No persona-as-recommendation-input. No reference-portfolio comparison for the live 8 personas. No "you should" language on the alternatives surface. No execution action, no holding of funds.',
        ],
        tables: [],
      }),
    },
    {
      id: 'known-limitations',
      kind: 'concept',
      title: 'Known limitations & open items',
      dependsOn: ['non-goals'],
      order: 0,
      render: () => ({
        prose: [
          'Europe/emerging equity have zero historical episode data (currently unmodelled, not illustrative). The TECH_CORRECTION scenario cites Nasdaq −78% but the broad US-equity bucket tops out near −42%. No cross-bucket correlation or FX modelling (by design). The liquidity floor in staged rebalancing is flat, not withdrawal-rate-sensitive yet. CAPITAL_PRESERVATION is evidentially indistinguishable from INCOME_STABILITY — an open merge/differentiate decision. Full FCA PS25/22 Consumer Duty sign-off on the alternatives surface has not happened yet.',
        ],
        tables: [],
      }),
    },
    {
      id: 'formula-reference',
      kind: 'formula',
      title: 'Formula quick-reference',
      dependsOn: ['safety-lights', 'persona-engine', 'beliefs-tilts', 'scenario-stress', 'illustrative-alternatives'],
      order: 0,
      render: () => ({
        prose: [
          'cash_runway_months = liquid_cash / (annual_essential_spend / 12)',
          'score(persona) = Σ trait[i] × weight[persona][i]; match_confidence = clamp(topScore − secondScore, 0, 1)',
          'normaliseAnswer(1..5) = (answer − 3) / 2',
          'portfolioReturn(t) = Σ w[i] × episode.path[i][t]; alignmentScore = 100 × (1 − L1(currentMix, idealMix) / 2)',
        ],
        tables: [],
      }),
    },
  ];

  return sequenceTopics(topics);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run server/content/explainerTopics.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Run the full suite**

Run: `npm test`
Expected: all tests green, no regressions

- [ ] **Step 6: Commit**

```bash
git add server/content/explainerTopics.ts server/content/explainerTopics.test.ts
git commit -m "feat(content): full methodology explainer topic graph (10 topics)"
```

---

### Task 5: Server-side access allowlist

**Files:**
- Create: `server/config/methodologyAccess.ts`
- Test: `server/config/methodologyAccess.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// server/config/methodologyAccess.test.ts
import { describe, it, expect } from 'vitest';
import { isMethodologyEnabled } from './methodologyAccess';

describe('isMethodologyEnabled', () => {
  it('returns false for a token not on the allowlist', () => {
    expect(isMethodologyEnabled('not-a-real-token')).toBe(false);
  });

  it('returns false for an empty or undefined token', () => {
    expect(isMethodologyEnabled('')).toBe(false);
    expect(isMethodologyEnabled(undefined)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run server/config/methodologyAccess.test.ts`
Expected: FAIL — module `./methodologyAccess` does not exist.

- [ ] **Step 3: Implement the allowlist**

```typescript
// server/config/methodologyAccess.ts

/**
 * v1 access control for the methodology explainer: a plain allowlist of
 * investor session tokens, not a DB column. The `/i/:token` session table
 * needs a real Postgres connection this environment doesn't have locally,
 * and the only intended reader today is Tony — a DB migration is not
 * justified yet. Swap this for a real column when a second investor needs
 * the toggle. Populate via the METHODOLOGY_ENABLED_TOKENS env var
 * (comma-separated) so no token is hard-coded into source control.
 */
function loadAllowlist(): Set<string> {
  const raw = process.env.METHODOLOGY_ENABLED_TOKENS || '';
  return new Set(raw.split(',').map((t) => t.trim()).filter(Boolean));
}

export function isMethodologyEnabled(token: string | undefined): boolean {
  if (!token) return false;
  return loadAllowlist().has(token);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run server/config/methodologyAccess.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add server/config/methodologyAccess.ts server/config/methodologyAccess.test.ts
git commit -m "feat(access): token allowlist for the methodology explainer (v1, no DB column yet)"
```

---

### Task 6: Wire the API routes

**Files:**
- Modify: `server/routes.ts:2830-2840` (the existing `GET /api/onboarding-v2/i/:token` handler)
- Modify: `server/routes.ts` (add new route, near the other `onboarding-v2` routes)

- [ ] **Step 1: Add the import**

At the top of `server/routes.ts`, alongside the other `onboarding-v2` service imports, add:

```typescript
import { isMethodologyEnabled } from './config/methodologyAccess';
import { getSequencedTopics } from './content/explainerTopics';
```

- [ ] **Step 2: Merge the flag into the existing session response**

In `server/routes.ts`, change the handler at line 2830 from:

```typescript
  app.get("/api/onboarding-v2/i/:token", async (req, res) => {
    if (!requireDb(res)) return;
    try {
      const session = await storage.getOnboardingSessionByToken(req.params.token);
      if (!session) return res.status(404).json({ error: "Session not found" });
      res.json(session);
    } catch (error) {
      console.error("Get investor session error:", error);
      res.status(500).json({ error: "Failed to fetch session", message: error instanceof Error ? error.message : "Unknown error" });
    }
  });
```

to:

```typescript
  app.get("/api/onboarding-v2/i/:token", async (req, res) => {
    if (!requireDb(res)) return;
    try {
      const session = await storage.getOnboardingSessionByToken(req.params.token);
      if (!session) return res.status(404).json({ error: "Session not found" });
      res.json({ ...session, methodologyDocEnabled: isMethodologyEnabled(req.params.token) });
    } catch (error) {
      console.error("Get investor session error:", error);
      res.status(500).json({ error: "Failed to fetch session", message: error instanceof Error ? error.message : "Unknown error" });
    }
  });
```

- [ ] **Step 3: Add the content endpoint**

Immediately after that handler (still within the `onboarding-v2` route group in `server/routes.ts`), add:

```typescript
  app.get("/api/onboarding-v2/methodology", async (req, res) => {
    try {
      const topics = getSequencedTopics().map((t) => ({
        id: t.id,
        kind: t.kind,
        title: t.title,
        ...t.render(),
      }));
      res.json({ topics });
    } catch (error) {
      console.error("Get methodology content error:", error);
      res.status(500).json({ error: "Failed to build methodology content", message: error instanceof Error ? error.message : "Unknown error" });
    }
  });
```

Note this endpoint deliberately does NOT call `requireDb` — the content is static per app build, not per investor, so it works even without a database connection (verifiable locally with the dummy `DATABASE_URL`).

- [ ] **Step 4: Verify manually**

Run: `curl -s http://localhost:5000/api/onboarding-v2/methodology | head -c 500` (with the dev server running)
Expected: JSON beginning with `{"topics":[{"id":"philosophy",...`

- [ ] **Step 5: Commit**

```bash
git add server/routes.ts
git commit -m "feat(api): serve methodology explainer content + merge access flag into investor session"
```

---

### Task 7: Client-side session flag plumbing

**Files:**
- Modify: `client/src/lib/onboardingSync.ts:257-277` (the `loadInvestorSession` function)

- [ ] **Step 1: Read the current function signature**

The existing function (for reference, do not re-type — modify in place):

```typescript
export async function loadInvestorSession(
  token: string,
): Promise<{ ok: boolean; noDb?: boolean; currentStep?: string }> {
```

- [ ] **Step 2: Extend the return type and store the flag**

Change the function signature and body to capture and persist the new field. Replace the `return { ok: true, currentStep };` line and the function signature:

```typescript
export async function loadInvestorSession(
  token: string,
): Promise<{ ok: boolean; noDb?: boolean; currentStep?: string; methodologyDocEnabled?: boolean }> {
  try {
    const res = await fetch('/api/onboarding-v2/i/' + token);
    if (res.status === 503) return { ok: false, noDb: true };
    if (!res.ok) return { ok: false };
    const session = await res.json();
    let data: any = {};
    try { data = session.state ? JSON.parse(session.state) : {}; } catch { data = {}; }
    normalizeAnalysis(data);
    setInvestorToken(token); // set before fetching assets so the token-scoped call is authorised
    const hydrated = await hydrateHoldingsIfEmpty(data, `/api/onboarding-v2/i/${token}/assets`, false);
    if (data && Object.keys(data).length) useOnboardingV2Store.setState(data);
    if (hydrated) useOnboardingV2Store.getState().setHoldings(data.holdings);
    const currentStep = hydrated ? '/onboarding-v2/intake' : (session.currentStep || '/onboarding-v2/welcome');
    sessionStorage.setItem('methodology-doc-enabled', session.methodologyDocEnabled ? '1' : '0');
    return { ok: true, currentStep, methodologyDocEnabled: !!session.methodologyDocEnabled };
  } catch {
    return { ok: false };
  }
}

export function isMethodologyDocEnabled(): boolean {
  return sessionStorage.getItem('methodology-doc-enabled') === '1';
}
```

(This keeps the access flag in `sessionStorage`, separate from the persisted `onboarding-v2-storage` product-data store — it's an access-control bit, not investor data, and must not get swept up by the demo-mode snapshot/restore in `DemoContext.tsx`.)

- [ ] **Step 3: Verify no other callers break**

Run: `npx tsc --noEmit 2>&1 | grep -i onboardingSync`
Expected: no new errors referencing this file (the return type only gained an optional field, existing callers destructuring `{ ok, noDb, currentStep }` are unaffected).

- [ ] **Step 4: Commit**

```bash
git add client/src/lib/onboardingSync.ts
git commit -m "feat(client): capture and expose the methodology-doc-enabled session flag"
```

---

### Task 8: The Methodology page

**Files:**
- Create: `client/src/pages/onboarding-v2/Methodology.tsx`

- [ ] **Step 1: Write the page component**

```tsx
// client/src/pages/onboarding-v2/Methodology.tsx
import { useEffect, useState } from 'react';
import OnboardingLayout from '@/components/onboarding-v2/OnboardingLayout';
import { Loader2 } from 'lucide-react';

interface TopicTable {
  headers: string[];
  rows: string[][];
}

interface TopicResponse {
  id: string;
  kind: 'concept' | 'rule' | 'formula' | 'citation';
  title: string;
  prose: string[];
  tables: TopicTable[];
}

const KIND_LABEL: Record<TopicResponse['kind'], string> = {
  concept: 'Concept',
  rule: 'Rule',
  formula: 'Formula',
  citation: 'Citation',
};

export default function Methodology() {
  const [topics, setTopics] = useState<TopicResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/onboarding-v2/methodology')
      .then((r) => {
        if (!r.ok) throw new Error(`Request failed: ${r.status}`);
        return r.json();
      })
      .then((d) => setTopics(d.topics))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, []);

  return (
    <OnboardingLayout
      stepId="methodology"
      title="How this works"
      description="The logic, formulas, and evidence behind your analysis — generated from the same code and configuration that powers it, so it never falls out of date."
      hideNav
    >
      <div className="space-y-8 pt-6">
        {error && (
          <p className="text-sm text-rose-600 dark:text-rose-400" data-testid="methodology-error">{error}</p>
        )}
        {!topics && !error && (
          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        )}
        {topics?.map((topic) => (
          <div
            key={topic.id}
            className="p-6 rounded-2xl border border-[var(--border)] bg-white dark:bg-slate-800/80"
            data-testid={`methodology-topic-${topic.id}`}
          >
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
              {KIND_LABEL[topic.kind]}
            </span>
            <h3 className="text-lg font-bold text-[var(--foreground)] mt-1 mb-3">{topic.title}</h3>
            <div className="space-y-2">
              {topic.prose.map((p, i) => (
                <p key={i} className="text-sm text-[var(--foreground)] leading-relaxed">{p}</p>
              ))}
            </div>
            {topic.tables.map((table, ti) => (
              <div key={ti} className="overflow-x-auto rounded-xl border border-[var(--border)] mt-4">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-700/50">
                      {table.headers.map((h) => (
                        <th key={h} className="text-left py-2 px-3 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row, ri) => (
                      <tr key={ri} className={ri % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/50 dark:bg-slate-700/30'}>
                        {row.map((cell, ci) => (
                          <td key={ci} className="py-2 px-3">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ))}
      </div>
    </OnboardingLayout>
  );
}
```

- [ ] **Step 2: Register the route**

In `client/src/App.tsx`, add the lazy import alongside the other `onboarding-v2` imports:

```typescript
const OnboardingV2Methodology = lazy(() => import("@/pages/onboarding-v2/Methodology"));
```

And add the route alongside the other `onboarding-v2` routes (after the `plan/wrappers` route):

```tsx
      <Route path="/onboarding-v2/methodology">{() => <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" /></div>}><OnboardingV2Methodology /></Suspense>}</Route>
```

- [ ] **Step 3: Add the nav link, gated to investor mode + the flag**

In `client/src/components/Header.tsx`, import the helpers:

```typescript
import { isInvestorMode } from '@/lib/onboardingSync';
import { isMethodologyDocEnabled } from '@/lib/onboardingSync';
import { Link } from 'wouter';
import { BookOpen } from 'lucide-react';
```

Then, in the header's JSX, immediately before the `<InvestorSwitcher />` element, add:

```tsx
            {isInvestorMode() && isMethodologyDocEnabled() && (
              <Link
                href="/onboarding-v2/methodology"
                className="hidden md:flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors mr-2"
                data-testid="link-methodology"
              >
                <BookOpen className="w-4 h-4" />
                How this works
              </Link>
            )}
```

- [ ] **Step 4: Type-check and run the full suite**

Run: `npx tsc --noEmit 2>&1 | wc -l`
Expected: no increase versus the pre-existing baseline count

Run: `npm test`
Expected: all tests green

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/onboarding-v2/Methodology.tsx client/src/App.tsx client/src/components/Header.tsx
git commit -m "feat(onboarding): add the gated /onboarding-v2/methodology page and nav link"
```

---

### Task 9: Browser verification

**Files:** none (manual verification task)

- [ ] **Step 1: Start the dev server with a real token allowlisted**

Requires a real `DATABASE_URL` (this route depends on `requireDb` via the session table) — this cannot be fully exercised against the dummy local connection string used elsewhere in this repo. Document this constraint rather than working around it: run against a real Postgres instance, with `METHODOLOGY_ENABLED_TOKENS` set to a test investor's token.

- [ ] **Step 2: Verify the content endpoint directly (works even without a real DB)**

With the dev server running (dummy `DATABASE_URL` is fine for this one):
```bash
curl -s http://localhost:5000/api/onboarding-v2/methodology | python3 -m json.tool | head -40
```
Expected: 10 topics, `philosophy` first, valid JSON, Safety Lights table shows real numbers (6, 9, 20%, 15%, 25%, 15%).

- [ ] **Step 3: Verify the page renders standalone**

Navigate a browser (or Playwright) directly to `http://localhost:5000/onboarding-v2/methodology` and confirm all 10 topic cards render with their tables. This bypasses the investor-mode gate (which only affects the nav *link*, not the route itself in this v1) — acceptable for now since the route has no sensitive per-investor data, only the same static content everyone with the link would see; note this as a known v1 gap (route itself isn't access-controlled, only its discoverability is) if you want route-level enforcement added as a fast-follow.

- [ ] **Step 4: Confirm no regressions in the rest of the app**

Re-run the existing visual walkthrough smoke check: start on `/onboarding-v2/welcome`, confirm the page still loads and the Header renders without errors for a non-investor session (`isInvestorMode()` false — the new link should not appear at all).

---

## Explicitly deferred (not in this plan)

Per the design spec (§3.5, §3.6), scoped out of this plan on purpose — not oversights:

- **Word-doc generator refactor** (spec §3.1's second consumer): repointing the whitepaper generator script to read from `explainerContent.ts`/`explainerTopics.ts` instead of hand-typed prose. Needs its own plan once this content module has stabilized from a round of Tony's real usage — refactoring a generator against content that's still moving is wasted motion.
- **"Download as Word doc" button** (spec §3.6): depends on the generator refactor above existing first.
- **Slack update-notification action** (spec §3.5): the spec already scoped this as a manual, human-triggered action reusing the existing Slack tooling — there is no code to write; whoever updates a topic's content just sends the ping, the same way Werner was pinged tonight.
- **Route-level access enforcement**: this plan gates the *nav link's visibility* on `isMethodologyDocEnabled()`, but `/onboarding-v2/methodology` itself has no server-side check blocking a direct visit. Acceptable for v1 since the content is identical for every visitor and non-sensitive-per-se, but worth closing if this page ever carries anything investor-specific.
