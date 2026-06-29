# Handoff — Unlock onboarding engine rebuild (higher-level model rework)

**Created:** 2026-06-22 · **For:** a fresh session (Claude Code or Cowork) starting cold
**Repo:** `~/dev/unlock-demo-onboarding` @ `harden/phase2-profiling-simulation-tools` (HEAD `05c1be4`)

## Why this session exists
Tom wants to **rebuild the persona/belief/portfolio engine to a much higher standard** — not patch defects, but fix the *model design*. A comparison + audit was just completed. Your job is the next phase: research/design the correct model, then build it. Start with research/design, not code.

## What's already established (do NOT re-derive — read these)
- **The assessment is done.** Full findings: `~/Documents/Co Work Reset/Intelligence/research/2026-06-22-unlock-onboarding-engine-model-review-V2.md` (V2). Read this first — it has the og comparison, the five confirmed model-design flaws with `file:line`, and the rebuild decision agenda (§3).
- **Prior code-defect review:** `~/Documents/Co Work Reset/Intelligence/research/2026-06-11-unlock-onboarding-repo-review-V1.md` (V1, 30 findings). Most demo-blocking Criticals already fixed by commits D1–D8.
- **The engine spec (current, flawed):** `PERSONA_AND_BELIEF_LOGIC.md` (repo root, 1498 lines). It documents the *shared legacy wizard* engine, NOT the Onboarding-v2 flow.

## The five model-design flaws to fix (all verified in code at `05c1be4`)
Detail + `file:line` in V2 §2. In short:
1. **Persona cosine match on `[0,5]⁸` vectors** (`client/src/hooks/usePersonaQuiz.ts:67-104`) — compressed scores, inflated confidence, ignores magnitude. → magnitude-aware distance instead.
2. **Belief engine drops negative signals** (`client/src/utils/beliefProcessing.ts:117,226`) — can only add risk, never subtract; lower-half Likert is dead.
3. **Correlation dampening uses `|corr|`** (`beliefProcessing.ts:144-150`) — mistreats negative correlations.
4. **Probabilities uncalibrated (`k=1.0`) and then discarded** — `/api/scenario-impact` (`server/routes.ts:719-800`) booleanizes `weight>0`; belief probs never reach the loss number.
5. **Compounding correlated shocks + placeholder MC** — `routes.ts:764-803` triple-counts shared factors; `server/config/correlations.ts` is the identity matrix; `server/config/scenarioVols.ts` missing vols for crypto/property/alts/collectibles (→ riskless).
   Plus **structural incoherence**: two persona engines (`usePersonaQuiz.ts` cosine vs `server/services/personaEngine.ts` dot-product) with different math; pick one.

## The six decisions the rebuild must answer first (V2 §3)
1. Risk profiler **or** scenario stress tool? (today both, disconnected — pick the spine)
2. Persona matching: distance-based, or drop the confidence %
3. Belief→impact: feed probability magnitude in, or relabel as worst-case stress (honest)
4. MC inputs: fund real correlation+vols (with PD guard on `cholesky`) or strip the stats
5. Belief signal: allow protective beliefs to net down, or document the bias
6. One persona engine — delete the unused path

## How to start (suggested sequence)
1. **brainstorm the target model** before any code — resolve the six decisions above with Tom.
2. **write a plan** for the rebuild.
3. **Build test-first** — V1 found zero engine tests and a vacuous suite; `npm test` (vitest) is now wired. Every flaw above should land as a failing test first.
4. Keep changes **surgical** — the "two engines / two scenario systems" mess is from non-surgical accretion; don't add a third.

## Suggested skills to invoke
- `superpowers:brainstorming` — **first**, to resolve the six model decisions before coding (process skill).
- `superpowers:writing-plans` — turn the agreed model into a staged plan.
- `superpowers:test-driven-development` — rebuild is test-first; engine currently untested.
- `cloudworkz-skills:financial-domain-reviewer` and `cloudworkz-skills:unlock-hnw-reviewer` — domain correctness + compliance framing for an HNW audience.
- `cloudworkz-skills:karpathy-guidelines` — keep it surgical; avoid re-creating the duplicate-engine sprawl.
- (For the final write-up) `cloudworkz-skills:record-decision` — the six decisions are ADR-worthy.

## Constraints / gotchas
- Demo ships to prospects; compliance line = "intelligence, never advice." Don't reintroduce advice-framing copy (V1 D8 just removed it).
- `cholesky()` (`server/lib/simulate/engine_v2.ts:247`) assumes positive-definite — any real correlation matrix needs a PD guard or it silently NaNs.
- og repo (`unlock-demo-onboarding-og`) is the un-hardened snapshot — reference only, never ship.
