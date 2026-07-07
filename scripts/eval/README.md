# Onboarding-v2 journey sufficiency eval harness

One-off deep audit of whether onboarding-v2's output sufficiently informs a wide range of
synthetic investors — not just "does it run." See
`docs/superpowers/plans/2026-07-04-onboarding-journey-sufficiency-eval.md` for the full design
and `docs/2026-07-02-persona-validation-report.md` for the prior manual-QA findings this harness
is built to generalize.

## Prerequisites

- Run on a branch that includes `client/src/lib/tiltsGate.ts` (currently PR #50/#51, not yet on
  `main` as of 2026-07-04 — check `git log main -- client/src/lib/tiltsGate.ts` before running;
  if it now returns a commit, `main` is fine).
- `ANTHROPIC_API_KEY` set in the environment.
- `@anthropic-ai/sdk` installed. If a fresh `npm install` fails with `ENOTFOUND
  package-firewall.replit.local`, this checkout's `package-lock.json` has some resolved URLs
  pinned to an internal Replit mirror unreachable outside that environment — install against the
  public registry instead (`npm install --registry https://registry.npmjs.org`), and get sign-off
  before regenerating the whole lockfile's resolved URLs, since that's a broader change than
  installing one package.

## Run order

1. `npm test` — runs this repo's entire vitest suite (server, client, and the eval harness's own
   tests together, per `vitest.config.server.ts`'s `include` globs), not just the harness's tests
   in isolation. No API key needed. To run only the harness's own tests:
   `npx vitest run --config vitest.config.server.ts scripts/eval/`.
2. `ANTHROPIC_API_KEY=... npx tsx scripts/eval/runCalibration.ts` — calibration gate. Must print
   "Calibration PASSED" before proceeding. If it fails, fix the judge prompt
   (`scripts/eval/judgePrompt.ts`) or re-examine the golden cases
   (`scripts/eval/golden/golden_profiles.json`) before continuing — do not skip this step.
3. `ANTHROPIC_API_KEY=... npm run eval:onboarding` — full run across ~120 stratified profiles,
   ~120 real, costed API calls to `claude-opus-4-8` (the judge model, hardcoded in
   `scripts/eval/judgeProfile.ts`). Writes `scripts/eval/results/eval-run-<timestamp>.json`
   (gitignored), incrementally after every profile — safe to interrupt (Ctrl+C, crash) partway
   through without losing prior progress.
   Any profile whose judge call fails (rate limit, network error) is recorded with
   `verdict: null` and an `error` message rather than aborting the whole run; re-run those
   specific profiles or the whole batch before treating the report as complete.
4. `npx tsx scripts/eval/synthesizeReport.ts scripts/eval/results/eval-run-<timestamp>.json` —
   prints the cross-cutting findings report (veto-fail rates and Weak/Absent-dimension clusters
   by profile shape, plus any errored-profile counts from step 3).

## Known limitations (see the plan doc for full detail)

- `computeStagedRebalance`'s target mix always equals the current mix in this harness (no
  belief-driven target-mix construction is wired in) — the judge prompt discloses this, and each
  `ProfileRunResult.caveats` array carries the same disclosure as structured data, so it doesn't
  get scored as a product defect or silently misread by a future consumer of the JSON.
- The three golden cases in Task 8 are regression guards against already-fixed bugs (commit
  `1033062` on `main`), not currently-live defects — see the plan doc's Task 8 note.
- The harness's `ProfileRunResult.sourceProfile` echoes the generated profile's `holdings` and
  `investorProfile` (including `personaCues`/`asset_class_breakdown`) so the judge prompt's
  embedded JSON actually contains what its own instructions point to — if you extend the judge
  prompt to reference other fields, confirm they're actually present in `ProfileRunResult` first.

## Explicitly deferred (not in this plan)

- **Promoting any subset of this harness into a CI gate.** Per resolved spec §3, this is a
  one-off audit; the profile-shape taxonomy and golden cases are structured so a future fast
  deterministic subset *could* be promoted, but no CI wiring is built here.
- **Turning on `SAFETY_LIGHT_ACKNOWLEDGMENT_ENABLED` for any real investor**, or any change to
  the self-placement mechanism itself — this harness only exercises `computeTiltsGate` as a read
  path for eval purposes, generating data for the compliance conversation without exposing
  anything live.
- **Full belief-driven target-mix construction** (the `blendBeliefAllocation` + tilt-budget flow
  that would give `computeStagedRebalance` a non-trivial target) — out of scope per the resolved
  spec's named pipeline entry points; flagged as a harness limitation instead of built out.
- **Re-deriving a still-live defect to replace the now-fixed golden cases** — flagged as an open
  question for Tom rather than decided unilaterally.
