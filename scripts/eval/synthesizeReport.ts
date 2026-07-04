// scripts/eval/synthesizeReport.ts
// Aggregates judged FullEvalRecords into cross-cutting findings by profile shape, per the
// resolved spec's task sequence item (f): "aggregate/synthesis report generator (cross-cutting
// findings by profile shape)". Records with verdict === null (a judge-call error, see
// runFullEval.ts) are counted as errored and excluded from veto/dimension aggregation, not
// silently treated as passing or crashing on null access.
import * as fs from 'fs';
import type { FullEvalRecord } from './runFullEval';
import type { RubricLevel } from './judgePrompt';

export interface ShapeSummary {
  totalProfiles: number;
  vetoFailCount: number;
  vetoFailRate: number;
  erroredCount: number;
  dimensionLevelCounts: Record<string, Record<RubricLevel, number>>;
}

export interface SynthesisReport {
  overall: { totalProfiles: number; vetoFailCount: number; vetoFailRate: number; erroredCount: number };
  byShape: Record<string, ShapeSummary>;
  crossCuttingFindings: string[];
  vetoFailedProfileIds: string[];
  erroredProfileIds: string[];
}

const DIMENSION_KEYS = [
  'personaLegibility', 'safetyLightsFidelity', 'beliefOutlookTraceability',
  'internalConsistency', 'informationalSufficiency', 'complianceTargetMarketPosture',
] as const;

function newShapeSummary(): ShapeSummary {
  return {
    totalProfiles: 0, vetoFailCount: 0, vetoFailRate: 0, erroredCount: 0,
    dimensionLevelCounts: Object.fromEntries(
      DIMENSION_KEYS.map((k) => [k, { Strong: 0, Adequate: 0, Weak: 0, Absent: 0 }]),
    ) as Record<string, Record<RubricLevel, number>>,
  };
}

export function synthesizeReport(records: FullEvalRecord[]): SynthesisReport {
  const byShape: Record<string, ShapeSummary> = {};
  const vetoFailedProfileIds: string[] = [];
  const erroredProfileIds: string[] = [];

  for (const record of records) {
    const shapeId = record.runResult.shapeId!;
    if (!byShape[shapeId]) byShape[shapeId] = newShapeSummary();
    const summary = byShape[shapeId];
    summary.totalProfiles++;

    if (record.verdict === null) {
      summary.erroredCount++;
      erroredProfileIds.push(record.runResult.profileId!);
      continue; // no verdict data to aggregate for this profile
    }

    if (record.verdict.vetoFailed) {
      summary.vetoFailCount++;
      vetoFailedProfileIds.push(record.runResult.profileId!);
    }
    for (const dim of DIMENSION_KEYS) {
      const level = record.verdict.dimensions[dim].level;
      summary.dimensionLevelCounts[dim][level]++;
    }
  }

  for (const shapeId of Object.keys(byShape)) {
    const s = byShape[shapeId];
    // Rate is over judged (non-errored) profiles, not raw totalProfiles — an errored profile
    // wasn't judged at all, so it shouldn't dilute the veto-fail rate of the ones that were.
    const judgedCount = s.totalProfiles - s.erroredCount;
    s.vetoFailRate = judgedCount > 0 ? s.vetoFailCount / judgedCount : 0;
  }

  const crossCuttingFindings: string[] = [];
  for (const [shapeId, summary] of Object.entries(byShape)) {
    const judgedCount = summary.totalProfiles - summary.erroredCount;
    if (summary.vetoFailRate >= 0.5 && judgedCount >= 2) {
      crossCuttingFindings.push(`Shape "${shapeId}": ${(summary.vetoFailRate * 100).toFixed(0)}% veto-gate failure rate across ${judgedCount} judged profiles — investigate this shape's inputs for a systemic issue, not isolated noise.`);
    }
    for (const dim of DIMENSION_KEYS) {
      const counts = summary.dimensionLevelCounts[dim];
      const weakOrAbsent = counts.Weak + counts.Absent;
      if (judgedCount >= 2 && weakOrAbsent === judgedCount) {
        crossCuttingFindings.push(`Shape "${shapeId}": every judged profile (${judgedCount}) scored Weak or Absent on "${dim}" — likely a systemic gap for this shape, not per-profile noise.`);
      }
    }
    if (summary.erroredCount > 0) {
      crossCuttingFindings.push(`Shape "${shapeId}": ${summary.erroredCount} of ${summary.totalProfiles} profiles errored during judging (see erroredProfileIds) — re-run these before treating this shape's findings as complete.`);
    }
  }

  const totalProfiles = records.length;
  const erroredCount = records.filter((r) => r.verdict === null).length;
  const judgedTotal = totalProfiles - erroredCount;
  const vetoFailCount = records.filter((r) => r.verdict !== null && r.verdict.vetoFailed).length;

  return {
    overall: {
      totalProfiles,
      vetoFailCount,
      vetoFailRate: judgedTotal > 0 ? vetoFailCount / judgedTotal : 0,
      erroredCount,
    },
    byShape,
    crossCuttingFindings,
    vetoFailedProfileIds,
    erroredProfileIds,
  };
}

// CLI entry point: npx tsx scripts/eval/synthesizeReport.ts <path-to-eval-run-json>
if (import.meta.url === `file://${process.argv[1]}`) {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error('Usage: npx tsx scripts/eval/synthesizeReport.ts <path-to-eval-run-json>');
    process.exit(1);
  }
  const records = JSON.parse(fs.readFileSync(inputPath, 'utf8')) as FullEvalRecord[];
  const report = synthesizeReport(records);
  console.log(JSON.stringify(report, null, 2));
}
