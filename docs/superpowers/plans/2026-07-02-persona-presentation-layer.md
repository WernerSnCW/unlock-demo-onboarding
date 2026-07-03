# Persona Presentation Layer Implementation Plan (Workstream B, anchor framing)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Surface the live 8-persona engine's existing outputs with the demo-praised presentation devices — assignment transparency (hard-override reason / clear-match / close-call), runner-up transparency, and a persona gallery — WITHOUT inventing any number the engine doesn't already compute.

**Architecture:** The engine (`server/services/personaEngine.ts`) already computes everything needed and throws most of it away: `was_hard_override` and the ranked `computeWeightedMatches` list never reach `PersonaResult`. Task 1 widens the engine output (pure, TDD). Task 2 adds a `GET /api/personas` catalogue endpoint from the existing `PRIMARY_PERSONAS` + `PERSONA_WEIGHT_TABLE` (single source, no duplicated content). Tasks 3–4 render: an assignment chip + runners-up line on the existing `PersonaCard`, and a collapsible `PersonaGallery` on the Analysis screen.

**Honesty constraints (binding, from the forensic-audit doctrine + match-semantics review):**
1. **Never render `match_score`/`match_confidence` as a user-facing number or %.** The score is an uncalibrated weighted dot-product; hard overrides return a flat 1.0. A "92% match" badge would repeat the legacy wizard's meaningless-confidence sin. The ONLY user-facing transforms allowed: (a) the qualitative clear-match/close-call chip defined in Task 3 (a declared threshold on the top-two gap — faithfully "how clear-cut the assignment was"), (b) runner-up ORDER (real ranking, no numbers).
2. **No reference-portfolio comparison in this PR.** The live 8 personas have no allocation defaults; the legacy `server/config/personaDefaults.ts` mixes belong to the 19-persona set, have no defined mapping to the 8, and self-contradict (P016 propertyBias 0.90 vs PROPERTY_UK_RESI 0.15). Building the comparison would require authored reference mixes — a content task, named in the PR as follow-on.
3. Override reason strings must state the ACTUAL triggering predicate (read the code, don't paraphrase thresholds).

**Tech Stack:** Express + TS server, React client (wouter, react-query, Tailwind CSS vars), vitest node env (server/lib tests only; UI via typecheck + browser walk). **Branch `feat/persona-presentation-layer` off main@7567433 (already created). Baselines: 352 tests green** (this branch pre-dates PR #34/#35), **tsc 158 errors** (`npm run check 2>&1 | grep -c "error TS"`).

## Scouting facts (verified)

- `server/services/personaEngine.ts`: `PersonaMatchOutput` (line ~445) = `{ code, match_score, match_confidence, was_hard_override }`; `assignPrimaryPersonaWithMatching` (line ~482) — three hard overrides (business ≥ 0.25 via `getBusinessDominance`, property via `getPropertyDominance` ≥ 0.30, `hasAlternativesDominance` = crypto band GT_25), then `computeWeightedMatches(traits)` (ranked list, line ~456), `FULL_SERVICE_ADVISER` excludes SELF_DIRECTED_GROWTH; `match_confidence` = top-two score gap. `computePersona` (line ~1324) builds `PersonaResult` (line ~105) and drops `was_hard_override` + runners-up. `PRIMARY_PERSONAS` (line ~142, exported at bottom) has label/one_liner/plan_focus_bullets/risks_bullets per code; `PERSONA_WEIGHT_TABLE` (line ~281) has the 6 trait weights per code (sum 1.0).
- Client mirror type: `client/src/state/onboardingV2Store.ts` `PersonaResult` (line ~183). Analysis screen: `client/src/pages/onboarding-v2/Analysis.tsx` renders `<PersonaCard persona={persona} />` at ~line 492 inside `{persona && (...)}`. `PersonaCard`: `client/src/components/onboarding-v2/PersonaCard.tsx` (255 lines; renders label, one_liner, why_fits, portfolio_traits, risks, indicators — NO match numbers today).
- Server test pattern: `tests/onboardingV2.test.ts` has a persona fixture suite from line ~638 (`ALTERNATIVES_FOCUSED Fixture`) using `computePersona(profile)` with a full `InvestorProfile` fixture — copy its fixture style.
- react-query fetch pattern: `useQuery({ queryKey: ['/api/onboarding-v2/policy'] })` in PlanWrappers.tsx (default fetcher keyed by URL).
- Trait display labels: use these exact human labels for the 6 traits — risk_appetite "Risk appetite", alternatives_bias "Alternatives tilt", property_bias "Property tilt", liquidity_comfort "Liquidity comfort", income_orientation "Income orientation", complexity_proxy "Financial complexity".

---

### Task 1: Widen the engine output (assignment basis, override reason, runners-up)

**Files:**
- Modify: `server/services/personaEngine.ts`
- Test: `tests/personaPresentation.test.ts` (new)

- [ ] **Step 1: Write the failing tests**

Create `tests/personaPresentation.test.ts`. Build fixtures by copying the `InvestorProfile` fixture style from `tests/onboardingV2.test.ts` (~line 638). Cases:

```ts
import { describe, it, expect } from 'vitest';
import { computePersona } from '../server/services/personaEngine';
// Build three profile fixtures (copy the shape from tests/onboardingV2.test.ts):
// 1. businessHeavyProfile: personaCues.owns_business=true, private_business_wealth_band='25_50'
//    (or whatever getBusinessDominance reads — READ the function and set the field it uses to >= 0.25)
// 2. weightedProfile: no override triggers; moderate values so weighted matching runs
// 3. fullServiceProfile: weightedProfile but personaCues.adviser_usage='FULL_SERVICE_ADVISER'

describe('persona assignment transparency', () => {
  it('hard override reports basis HARD_OVERRIDE with a factual reason and no runners-up', () => {
    const result = computePersona(businessHeavyProfile);
    expect(result.code).toBe('FOUNDER_ENTREPRENEUR');
    expect(result.assignment_basis).toBe('HARD_OVERRIDE');
    expect(result.override_reason).toMatch(/business/i);
    expect(result.runners_up).toEqual([]);
  });

  it('weighted match reports basis WEIGHTED_MATCH, null reason, and exactly 2 ordered runners-up', () => {
    const result = computePersona(weightedProfile);
    expect(result.assignment_basis).toBe('WEIGHTED_MATCH');
    expect(result.override_reason).toBeNull();
    expect(result.runners_up).toHaveLength(2);
    for (const r of result.runners_up) {
      expect(r.code).not.toBe(result.code);
      expect(typeof r.label).toBe('string');
      expect(r.label.length).toBeGreaterThan(0);
    }
    // runners-up must be distinct
    expect(result.runners_up[0].code).not.toBe(result.runners_up[1].code);
  });

  it('fully-advised profiles never list SELF_DIRECTED_GROWTH among winner or runners-up', () => {
    const result = computePersona(fullServiceProfile);
    expect(result.code).not.toBe('SELF_DIRECTED_GROWTH');
    expect(result.runners_up.map((r) => r.code)).not.toContain('SELF_DIRECTED_GROWTH');
  });
});
```

Run: `npm test -- personaPresentation` → FAIL (fields missing).

- [ ] **Step 2: Implement**

In `server/services/personaEngine.ts`:

(a) Widen the interfaces:

```ts
export type AssignmentBasis = 'HARD_OVERRIDE' | 'WEIGHTED_MATCH';

export interface PersonaRunnerUp {
  code: string;
  label: string;
}
```

Add to `PersonaMatchOutput`: `assignment_basis: AssignmentBasis; override_reason: string | null; runners_up: PersonaRunnerUp[];` (replace the bare `was_hard_override` boolean usage — keep the field if other code reads it; grep first).

Add to `PersonaResult`: the same three fields.

(b) In `assignPrimaryPersonaWithMatching`, each hard-override return gains:
- business: `assignment_basis: 'HARD_OVERRIDE', override_reason: <factual string derived from the predicate getBusinessDominance uses — e.g. 'A private business stake of 25% or more of your wealth'>, runners_up: []`
- property: read `getPropertyDominance` first and write the reason to match what it actually measures (e.g. 'Property makes up 30% or more of your modelled portfolio' — adjust if the function blends BTL focus).
- alternatives: `hasAlternativesDominance` is crypto band GT_25 → 'A crypto / digital-asset allocation of 25% or more'.

The weighted-path return gains: `assignment_basis: 'WEIGHTED_MATCH'`, `override_reason: null`, and `runners_up: matches.slice(1, 3).map((m) => ({ code: m.code, label: PRIMARY_PERSONAS[m.code].label }))` (AFTER the FULL_SERVICE_ADVISER filter, so excluded personas can't appear).

(c) `computePersona` passes the three new fields through to `PersonaResult`.

- [ ] **Step 3: Run tests**

`npm test -- personaPresentation` → 3 PASS. Then `npm test` → all green (352 prior + 3). Then `npm run check 2>&1 | grep -c "error TS"` → 158.

- [ ] **Step 4: Commit**

```bash
git add server/services/personaEngine.ts tests/personaPresentation.test.ts
git commit -m "feat(persona): expose assignment basis, override reason, runners-up from the engine"
```

---

### Task 2: Persona catalogue endpoint

**Files:**
- Modify: `server/services/personaEngine.ts` (catalogue builder), `server/routes.ts` (thin route)
- Test: `tests/personaPresentation.test.ts` (append)

- [ ] **Step 1: Write the failing tests**

Append:

```ts
import { buildPersonaCatalogue } from '../server/services/personaEngine';

describe('buildPersonaCatalogue', () => {
  it('returns all 8 personas with content and top-2 real weight emphases', () => {
    const catalogue = buildPersonaCatalogue();
    expect(catalogue).toHaveLength(8);
    for (const p of catalogue) {
      expect(p.code.length).toBeGreaterThan(0);
      expect(p.label.length).toBeGreaterThan(0);
      expect(p.one_liner.length).toBeGreaterThan(0);
      expect(p.plan_focus_bullets.length).toBeGreaterThan(0);
      expect(p.risks_bullets.length).toBeGreaterThan(0);
      expect(p.emphases).toHaveLength(2);
      // emphases are the persona's actual top-2 weighted traits, descending
      expect(p.emphases[0].weight).toBeGreaterThanOrEqual(p.emphases[1].weight);
      expect(p.emphases[0].label.length).toBeGreaterThan(0);
    }
  });

  it('PROPERTY_LED emphasises property tilt first (weight 0.7 — pins the table wiring)', () => {
    const propertyLed = buildPersonaCatalogue().find((p) => p.code === 'PROPERTY_LED')!;
    expect(propertyLed.emphases[0]).toEqual({ trait: 'property_bias', label: 'Property tilt', weight: 0.7 });
  });
});
```

Run → FAIL.

- [ ] **Step 2: Implement the builder** (in personaEngine.ts)

```ts
export interface PersonaCatalogueEntry {
  code: PrimaryPersonaCode;
  label: string;
  one_liner: string;
  plan_focus_bullets: string[];
  risks_bullets: string[];
  /** The persona's top-2 matching-weight traits — real weights from PERSONA_WEIGHT_TABLE, not copy. */
  emphases: { trait: keyof PersonaWeights; label: string; weight: number }[];
}

const TRAIT_LABELS: Record<keyof PersonaWeights, string> = {
  risk_appetite: 'Risk appetite',
  alternatives_bias: 'Alternatives tilt',
  property_bias: 'Property tilt',
  liquidity_comfort: 'Liquidity comfort',
  income_orientation: 'Income orientation',
  complexity_proxy: 'Financial complexity',
};

export function buildPersonaCatalogue(): PersonaCatalogueEntry[] {
  return (Object.keys(PRIMARY_PERSONAS) as PrimaryPersonaCode[]).map((code) => {
    const persona = PRIMARY_PERSONAS[code];
    const weights = PERSONA_WEIGHT_TABLE[code];
    const emphases = (Object.entries(weights) as [keyof PersonaWeights, number][])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([trait, weight]) => ({ trait, label: TRAIT_LABELS[trait], weight }));
    return {
      code,
      label: persona.label,
      one_liner: persona.one_liner,
      plan_focus_bullets: persona.plan_focus_bullets,
      risks_bullets: persona.risks_bullets,
      emphases,
    };
  });
}
```

(`PersonaWeights` may need `export` — check.)

- [ ] **Step 3: Thin route** in `server/routes.ts` (near the other onboarding-v2 routes):

```ts
app.get('/api/onboarding-v2/personas', (_req, res) => {
  return res.json({ personas: buildPersonaCatalogue() });
});
```

(import `buildPersonaCatalogue` alongside the existing personaEngine imports — check what routes.ts already imports from analysis/personaEngine and extend consistently.)

- [ ] **Step 4: Verify + commit**

`npm test -- personaPresentation` → 5 PASS; `npm test` all green; tsc 158.

```bash
git add server/services/personaEngine.ts server/routes.ts tests/personaPresentation.test.ts
git commit -m "feat(persona): catalogue endpoint for the 8-persona gallery"
```

---

### Task 3: Assignment chip + runners-up on PersonaCard

**Files:**
- Modify: `client/src/state/onboardingV2Store.ts` (PersonaResult type), `client/src/components/onboarding-v2/PersonaCard.tsx`

- [ ] **Step 1: Store type** — in `PersonaResult` (line ~183) add OPTIONAL fields (old persisted sessions lack them):

```ts
  assignment_basis?: 'HARD_OVERRIDE' | 'WEIGHTED_MATCH';
  override_reason?: string | null;
  runners_up?: { code: string; label: string }[];
```

- [ ] **Step 2: PersonaCard chip.** Read PersonaCard.tsx first; insert near the persona label/one_liner header. Add module-level:

```tsx
/** Qualitative read of match_confidence (the raw gap between the top two weighted scores).
 *  Deliberately NOT shown as a number: the underlying score is an uncalibrated weighted sum,
 *  so only the ordinal fact ("clear-cut" vs "close") is honest to present. */
const CLEAR_MATCH_GAP = 0.10;
```

Render logic (adapt classNames to the card's existing chip/badge style if one exists, else a small rounded-full bordered pill like the stage tabs):

```tsx
{persona.assignment_basis === 'HARD_OVERRIDE' && persona.override_reason && (
  <p className="text-xs text-[var(--muted-foreground)] mt-1" data-testid="persona-assignment-basis">
    Assigned directly: {persona.override_reason}.
  </p>
)}
{persona.assignment_basis === 'WEIGHTED_MATCH' && (
  <p className="text-xs text-[var(--muted-foreground)] mt-1" data-testid="persona-assignment-basis">
    {persona.match_confidence >= CLEAR_MATCH_GAP ? 'Clear match against the other profiles' : 'A close call'}
    {persona.runners_up && persona.runners_up.length > 0 && (
      <> — also considered: {persona.runners_up.map((r) => r.label).join(', ')}</>
    )}
    .
  </p>
)}
```

(If `assignment_basis` is absent — old session — nothing renders. No fallback invention.)

- [ ] **Step 3: Verify + commit**

`npm test` all green; tsc 158.

```bash
git add client/src/state/onboardingV2Store.ts client/src/components/onboarding-v2/PersonaCard.tsx
git commit -m "feat(persona): assignment-basis chip + runners-up transparency on the persona card"
```

---

### Task 4: PersonaGallery on Analysis

**Files:**
- Create: `client/src/components/onboarding-v2/PersonaGallery.tsx`
- Modify: `client/src/pages/onboarding-v2/Analysis.tsx`

- [ ] **Step 1: Component**

```tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CatalogueEntry {
  code: string;
  label: string;
  one_liner: string;
  plan_focus_bullets: string[];
  risks_bullets: string[];
  emphases: { trait: string; label: string; weight: number }[];
}

export default function PersonaGallery({ currentCode }: { currentCode: string }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { data } = useQuery<{ personas: CatalogueEntry[] }>({
    queryKey: ['/api/onboarding-v2/personas'],
    enabled: open,
  });

  return (
    <div className="mt-4" data-testid="persona-gallery">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        aria-expanded={open}
        data-testid="persona-gallery-toggle"
      >
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        See all 8 investor profiles
      </button>
      {open && data && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.personas.map((p) => {
            const isCurrent = p.code === currentCode;
            const isExpanded = expanded === p.code;
            return (
              <button
                key={p.code}
                type="button"
                onClick={() => setExpanded(isExpanded ? null : p.code)}
                aria-expanded={isExpanded}
                className={`text-left p-4 rounded-xl border transition-colors ${isCurrent
                  ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                  : 'border-[var(--border)] hover:border-[var(--primary)]/50'}`}
                data-testid={`persona-gallery-card-${p.code}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{p.label}</p>
                  {isCurrent && (
                    <span className="text-[10px] uppercase tracking-wider text-[var(--primary)] border border-[var(--primary)] rounded-full px-2 py-0.5 flex-shrink-0">
                      Your profile
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">{p.one_liner}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  Weighs most: {p.emphases.map((e) => e.label.toLowerCase()).join(', ')}
                </p>
                {isExpanded && (
                  <div className="mt-2 space-y-2" data-testid={`persona-gallery-detail-${p.code}`}>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">Plan focus</p>
                      <ul className="list-disc pl-4 text-xs text-[var(--muted-foreground)]">
                        {p.plan_focus_bullets.map((b, i) => <li key={i}>{b}</li>)}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">Risks to watch</p>
                      <ul className="list-disc pl-4 text-xs text-[var(--muted-foreground)]">
                        {p.risks_bullets.map((b, i) => <li key={i}>{b}</li>)}
                      </ul>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Wire into Analysis.tsx** — inside the existing `{persona && (...)}` block, directly after `<PersonaCard persona={persona} />`:

```tsx
<PersonaGallery currentCode={persona.code} />
```

(add the import). Nothing else on the screen changes.

- [ ] **Step 3: Verify + commit**

`npm test` all green; tsc 158.

```bash
git add client/src/components/onboarding-v2/PersonaGallery.tsx client/src/pages/onboarding-v2/Analysis.tsx
git commit -m "feat(persona): 8-profile gallery with current-profile highlight on analysis"
```

---

### Task 5: Verification + PR (controller)

- [ ] Full suite + tsc vs baselines (357 expected: 352 + 5 / 158).
- [ ] Browser walk (host patch if ENOTSUP, revert before commit): seed the store, run Analyse; confirm the assignment chip renders (weighted path: clear-match/close-call + "also considered"; override path: seed a business-heavy profile → "Assigned directly: …"); gallery opens, fetches, highlights the current profile, expands detail; no match numbers rendered anywhere; console clean.
- [ ] `git merge origin/main`, suite re-run, push, PR (independent of #34/#35 — branched off main; store-type edit is in a different region from #35's normalizeWrapper change, merges cleanly). PR body names the two excluded-on-honesty-grounds items: match-% badge (uncalibrated score) and reference-portfolio comparison (no authored mixes for the live 8) with what each would need.
