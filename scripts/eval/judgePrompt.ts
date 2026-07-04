// Concrete judge prompt + response schema per the resolved sufficiency-rubric spec §1: a veto
// gate (auto-fail), six Strong/Adequate/Weak/Absent scored dimensions with one evidence line
// each, and a binary per-profile checklist.
import type { ProfileRunResult } from './runHarness';

export type RubricLevel = 'Strong' | 'Adequate' | 'Weak' | 'Absent';

export interface DimensionScore {
  level: RubricLevel;
  evidence: string;
}

export interface JudgeChecklist {
  personaAssignedWithReason: boolean;
  everyHoldingCategoryFeedsOutput: boolean;
  atLeastOneScenarioCitedToRealEpisode: boolean;
  noContradictions: boolean;
  lowConfidenceAreasFlagged: boolean;
  clearNextStepShown: boolean;
}

export interface JudgeVerdict {
  vetoFailed: boolean;
  vetoReason: string | null;
  dimensions: {
    personaLegibility: DimensionScore;
    safetyLightsFidelity: DimensionScore;
    beliefOutlookTraceability: DimensionScore;
    internalConsistency: DimensionScore;
    informationalSufficiency: DimensionScore;
    complianceTargetMarketPosture: DimensionScore;
  };
  checklist: JudgeChecklist;
}

export const JUDGE_RESPONSE_SCHEMA = {
  type: 'object',
  required: ['vetoFailed', 'vetoReason', 'dimensions', 'checklist'],
  properties: {
    vetoFailed: { type: 'boolean' },
    vetoReason: { type: ['string', 'null'] },
    dimensions: {
      type: 'object',
      required: [
        'personaLegibility', 'safetyLightsFidelity', 'beliefOutlookTraceability',
        'internalConsistency', 'informationalSufficiency', 'complianceTargetMarketPosture',
      ],
      properties: {
        personaLegibility: { $ref: '#/definitions/dimensionScore' },
        safetyLightsFidelity: { $ref: '#/definitions/dimensionScore' },
        beliefOutlookTraceability: { $ref: '#/definitions/dimensionScore' },
        internalConsistency: { $ref: '#/definitions/dimensionScore' },
        informationalSufficiency: { $ref: '#/definitions/dimensionScore' },
        complianceTargetMarketPosture: { $ref: '#/definitions/dimensionScore' },
      },
    },
    checklist: {
      type: 'object',
      required: [
        'personaAssignedWithReason', 'everyHoldingCategoryFeedsOutput',
        'atLeastOneScenarioCitedToRealEpisode', 'noContradictions',
        'lowConfidenceAreasFlagged', 'clearNextStepShown',
      ],
      properties: {
        personaAssignedWithReason: { type: 'boolean' },
        everyHoldingCategoryFeedsOutput: { type: 'boolean' },
        atLeastOneScenarioCitedToRealEpisode: { type: 'boolean' },
        noContradictions: { type: 'boolean' },
        lowConfidenceAreasFlagged: { type: 'boolean' },
        clearNextStepShown: { type: 'boolean' },
      },
    },
  },
  definitions: {
    dimensionScore: {
      type: 'object',
      required: ['level', 'evidence'],
      properties: {
        level: { enum: ['Strong', 'Adequate', 'Weak', 'Absent'] },
        evidence: { type: 'string' },
      },
    },
  },
} as const;

export function buildJudgePrompt(result: ProfileRunResult): string {
  return `You are auditing one synthetic investor's output from Unlock's onboarding-v2 wealth-intelligence product. Unlock is NOT a regulated adviser: its compliance posture requires every output to read as "intelligence, never advice" — persona is a framing anchor, never an input to a recommendation, and nothing may be phrased as suitability advice.

## Step 1: Veto gate (auto-fail — check these FIRST, independent of the scored dimensions below)

A profile automatically FAILS (set vetoFailed: true) if ANY of the following hold:
- Any two displayed elements contradict each other for this investor (e.g. one screen implies tilts are locked while another shows a tilted allocation; persona says "growth-oriented" while risk narrative says "capital preservation").
- Any number shown is not traceable to this investor's own inputs (their holdings, answers) or a cited real episode/stress scenario. Zero-filled or fabricated figures fail this gate.
- Any output implies advice or suitability (e.g. "you should", "we recommend you hold", "this is right for you") rather than descriptive intelligence.

If vetoFailed is true, still fill in the six dimensions and checklist below as best you can (a failed profile is still informative for the synthesis report), but the veto is the headline verdict.

## Step 2: Score these six dimensions — Strong / Adequate / Weak / Absent, each with ONE evidence line citing specific data from the JSON below

1. **Persona legibility & reason-traceability** — is the persona assignment coherent and legible, with a reason a lay investor could follow (not just a code)?
2. **Safety-Lights fidelity** — do the liquidity/concentration/illiquids lights actually reflect this investor's holdings (cash runway, largest line, illiquid share) as given in the JSON?
3. **Belief/outlook -> scenario traceability** — does the stress reading (tieredImpact) trace to a real cited episode or stress scenario, not an unsourced number?
4. **Internal consistency** — graded version of the veto check: are there near-miss inconsistencies (not full contradictions) between screens/sections?
5. **Informational sufficiency** — does this investor come away with what they need to understand their situation and decide a next step? Are low-confidence areas (skipped optional section, NOT_SURE answers — see personaCues in the JSON) visibly flagged as "dig deeper" rather than silently defaulted or presented with false confidence?
6. **Compliance & target-market posture** — no overclaimed match-percentage, no advice-shaped language, persona presented as anchor not input.

## Step 3: Fill this binary checklist (fast, deterministic, feeds but does not replace the scored pass above)

- [ ] Persona assigned with a stated reason.
- [ ] Every holding category this profile carries (see holdings/asset_class_breakdown in the JSON) feeds at least one visible output artifact.
- [ ] Every profile shows at least one scenario/stress reading cited to a real episode.
- [ ] No two shown elements contradict.
- [ ] Any low-input-confidence area (optional section skipped, NOT_SURE answers, hard-override paths) is visibly flagged, not silently defaulted.
- [ ] A clear next step is shown for every profile — especially for edge/uncertain profiles.

## Known harness limitation — do not penalize the product for this specific gap

This harness's staged-rebalance output always has target mix equals the current mix (see scripts/eval/runHarness.ts) because full belief-driven target-mix construction sits outside this eval's pipeline entry points. If \`stagedRebalance.staged.stage1\` and \`stage2\` are both empty, treat that as a harness artifact, not a product defect, when scoring "Informational sufficiency" — but DO still flag it in the evidence line so the synthesis report (Task 12) can separate harness noise from real findings.

## The profile's full pipeline output (ProfileRunResult, JSON)

Profile ID: ${result.profileId}
Shape: ${result.shapeId}
Trouble zone: ${result.troubleZoneId}

\`\`\`json
${JSON.stringify(result, null, 2)}
\`\`\`

## Response format

Respond with ONLY a single JSON object matching this exact shape (no markdown fences, no prose outside the JSON):

\`\`\`json
{
  "vetoFailed": boolean,
  "vetoReason": string | null,
  "dimensions": {
    "personaLegibility": { "level": "Strong" | "Adequate" | "Weak" | "Absent", "evidence": string },
    "safetyLightsFidelity": { "level": "Strong" | "Adequate" | "Weak" | "Absent", "evidence": string },
    "beliefOutlookTraceability": { "level": "Strong" | "Adequate" | "Weak" | "Absent", "evidence": string },
    "internalConsistency": { "level": "Strong" | "Adequate" | "Weak" | "Absent", "evidence": string },
    "informationalSufficiency": { "level": "Strong" | "Adequate" | "Weak" | "Absent", "evidence": string },
    "complianceTargetMarketPosture": { "level": "Strong" | "Adequate" | "Weak" | "Absent", "evidence": string }
  },
  "checklist": {
    "personaAssignedWithReason": boolean,
    "everyHoldingCategoryFeedsOutput": boolean,
    "atLeastOneScenarioCitedToRealEpisode": boolean,
    "noContradictions": boolean,
    "lowConfidenceAreasFlagged": boolean,
    "clearNextStepShown": boolean
  }
}
\`\`\`
`;
}
