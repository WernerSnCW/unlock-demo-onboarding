// Run: ANTHROPIC_API_KEY=sk-... npx tsx scripts/eval/runCalibration.ts
// Loads the golden cases (Task 8) and runs them through runCalibration (Task 9) using the real
// Anthropic client. Exits non-zero if any golden case fails its deterministic expectation —
// per the resolved spec, the full run (Task 11) must not proceed if this fails.
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';
import { runCalibration, type GoldenCase } from './calibrateJudge';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface RawGoldenFile {
  name: string;
  investorProfile?: unknown;
  investorProfileShort?: unknown;
  investorProfileMedium?: unknown;
  investorProfileLong?: unknown;
  expectComputePersonaCode?: string;
  expectComputePersonaCodeNot?: string;
  expectMatchConfidenceLessThan?: number;
  expectRiskAppetiteOrdering?: string;
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is not set. Set it before running calibration.');
    process.exit(1);
  }

  const goldenPath = path.join(__dirname, 'golden', 'golden_profiles.json');
  const raw = JSON.parse(fs.readFileSync(goldenPath, 'utf8')) as RawGoldenFile[];

  // The horizon-vocabulary golden case (Task 8) uses a three-profile ordering check rather than
  // the single-profile GoldenCase shape — handle it separately from the two single-profile cases.
  const singleProfileCases: GoldenCase[] = raw
    .filter((r) => r.investorProfile !== undefined)
    .map((r) => ({
      name: r.name,
      investorProfile: r.investorProfile as GoldenCase['investorProfile'],
      expectComputePersonaCode: r.expectComputePersonaCode,
      expectComputePersonaCodeNot: r.expectComputePersonaCodeNot,
      expectMatchConfidenceLessThan: r.expectMatchConfidenceLessThan,
    }));

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const report = await runCalibration(singleProfileCases, client);

  console.log('\n=== Calibration report (persona-shaped golden cases) ===');
  for (const result of report.results) {
    console.log(`${result.passed ? 'PASS' : 'FAIL'} — ${result.name}: ${result.reason}`);
  }

  // Horizon-vocabulary ordering check (the third golden case) — runs computeTraitScores directly,
  // no judge call needed since this is purely a numeric-ordering regression guard.
  const horizonCase = raw.find((r) => r.expectRiskAppetiteOrdering !== undefined);
  if (horizonCase) {
    const { computeTraitScores } = await import('../../server/services/personaEngine');
    const shortScore = computeTraitScores(horizonCase.investorProfileShort as any).risk_appetite;
    const mediumScore = computeTraitScores(horizonCase.investorProfileMedium as any).risk_appetite;
    const longScore = computeTraitScores(horizonCase.investorProfileLong as any).risk_appetite;
    const ok = shortScore < mediumScore && mediumScore < longScore;
    console.log(`${ok ? 'PASS' : 'FAIL'} — ${horizonCase.name}: short=${shortScore} medium=${mediumScore} long=${longScore}`);
    if (!ok) report.allPassed = false;
  }

  if (!report.allPassed) {
    console.error('\nCalibration FAILED. Do not proceed to the full run (scripts/eval/runFullEval.ts) until the rubric/harness is fixed — see this plan\'s Task 8 note on regression-guard framing.');
    process.exit(1);
  }

  console.log('\nCalibration PASSED. Safe to proceed to the full run.');
}

main().catch((err) => {
  console.error('Calibration script failed:', err);
  process.exit(1);
});
