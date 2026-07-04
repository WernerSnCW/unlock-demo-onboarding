// Run: ANTHROPIC_API_KEY=sk-... npm run eval:onboarding
// Orchestrates: generate profiles -> run each through the pipeline -> judge each -> write results
// to scripts/eval/results/. Assumes Task 10's calibration has already PASSED — this script does
// not re-run calibration itself (kept as a separate, explicit step per the resolved spec's
// "calibrate the judge before the full run" ordering).
//
// Resilience note: at ~100-150 profiles this makes ~100-150 real, costed Opus API calls. A single
// transient failure (rate limit, network blip) partway through must not lose the whole batch — so
// each profile's judge call is caught individually (recorded as an error entry, not aborting the
// run) and results are written incrementally after every profile, not only once at the end.
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';
import { generateProfiles } from './generateProfiles';
import { runProfileThroughPipeline, type ProfileRunResult } from './runHarness';
import { judgeProfile } from './judgeProfile';
import type { JudgeVerdict } from './judgePrompt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface FullEvalRecord {
  runResult: ProfileRunResult;
  verdict: JudgeVerdict | null;
  error: string | null;
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is not set. Set it before running the full eval.');
    process.exit(1);
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const profiles = generateProfiles();
  console.log(`Generated ${profiles.length} profiles. Running pipeline + judge for each...`);

  const resultsDir = path.join(__dirname, 'results');
  fs.mkdirSync(resultsDir, { recursive: true });
  const outPath = path.join(resultsDir, `eval-run-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);

  const records: FullEvalRecord[] = [];
  let errorCount = 0;

  for (let i = 0; i < profiles.length; i++) {
    const profile = profiles[i];
    console.log(`[${i + 1}/${profiles.length}] ${profile.id}`);
    const runResult = runProfileThroughPipeline(profile);

    let verdict: JudgeVerdict | null = null;
    let error: string | null = null;
    try {
      verdict = await judgeProfile(runResult, client);
    } catch (e) {
      error = (e as Error).message;
      errorCount++;
      console.error(`  judge call failed for ${profile.id}: ${error}`);
    }

    records.push({ runResult, verdict, error });

    // Write incrementally after every profile so a crash mid-run (network drop, process kill)
    // doesn't lose everything judged so far — this is a real, costed batch, not a cheap retry.
    fs.writeFileSync(outPath, JSON.stringify(records, null, 2));
  }

  const vetoFailCount = records.filter((r) => r.verdict?.vetoFailed).length;
  console.log(`\nDone. ${records.length} profiles processed, ${errorCount} judge-call errors, ${vetoFailCount} failed the veto gate.`);
  console.log(`Results written to ${outPath}`);
  if (errorCount > 0) {
    console.log(`${errorCount} profile(s) have verdict: null due to a judge-call error — see each record's "error" field. Re-run those specific profiles or the whole batch before treating the synthesis report as complete.`);
  }
  console.log('Run `npx tsx scripts/eval/synthesizeReport.ts ' + outPath + '` to generate the cross-cutting findings report.');
}

main().catch((err) => {
  console.error('Full eval run failed:', err);
  process.exit(1);
});
