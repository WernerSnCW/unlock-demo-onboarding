// scripts/eval/judgeProfile.ts
// Calls the Anthropic Messages API with the judge prompt (Task 6) and validates/parses the
// response against JUDGE_RESPONSE_SCHEMA's required keys. The AnthropicMessagesClient interface
// (rather than importing Anthropic's SDK type directly into the function signature) keeps this
// module trivially mockable in tests without hitting the network.
import { buildJudgePrompt, type JudgeVerdict } from './judgePrompt';
import type { ProfileRunResult } from './runHarness';

export interface AnthropicMessagesClient {
  messages: {
    create: (params: { model: string; max_tokens: number; messages: { role: 'user'; content: string }[] }) => Promise<{ content: { type: string; text?: string }[] }>;
  };
}

const REQUIRED_TOP_LEVEL_KEYS = ['vetoFailed', 'vetoReason', 'dimensions', 'checklist'] as const;
const REQUIRED_DIMENSION_KEYS = [
  'personaLegibility', 'safetyLightsFidelity', 'beliefOutlookTraceability',
  'internalConsistency', 'informationalSufficiency', 'complianceTargetMarketPosture',
] as const;
const REQUIRED_CHECKLIST_KEYS = [
  'personaAssignedWithReason', 'everyHoldingCategoryFeedsOutput',
  'atLeastOneScenarioCitedToRealEpisode', 'noContradictions',
  'lowConfidenceAreasFlagged', 'clearNextStepShown',
] as const;

const VALID_LEVELS = ['Strong', 'Adequate', 'Weak', 'Absent'] as const;

function extractJsonText(rawText: string): string {
  const trimmed = rawText.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenceMatch ? fenceMatch[1] : trimmed;
}

function validateVerdict(parsed: unknown): asserts parsed is JudgeVerdict {
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Judge response validation error: parsed response is not an object');
  }
  const obj = parsed as Record<string, unknown>;
  for (const key of REQUIRED_TOP_LEVEL_KEYS) {
    if (!(key in obj)) throw new Error(`Judge response validation error: missing required top-level key "${key}"`);
  }

  if (typeof obj.vetoFailed !== 'boolean') {
    throw new Error(`Judge response validation error: "vetoFailed" must be a boolean, got ${typeof obj.vetoFailed}`);
  }
  if (obj.vetoReason !== null && typeof obj.vetoReason !== 'string') {
    throw new Error(`Judge response validation error: "vetoReason" must be a string or null, got ${typeof obj.vetoReason}`);
  }

  const dimensions = obj.dimensions as Record<string, unknown>;
  if (typeof dimensions !== 'object' || dimensions === null) {
    throw new Error('Judge response validation error: "dimensions" must be an object');
  }
  for (const key of REQUIRED_DIMENSION_KEYS) {
    if (!(key in dimensions)) throw new Error(`Judge response validation error: missing required dimension "${key}"`);
    const dim = dimensions[key] as Record<string, unknown>;
    if (typeof dim !== 'object' || dim === null) {
      throw new Error(`Judge response validation error: dimension "${key}" must be an object`);
    }
    if (!VALID_LEVELS.includes(dim.level as (typeof VALID_LEVELS)[number])) {
      throw new Error(`Judge response validation error: dimension "${key}".level must be one of ${VALID_LEVELS.join('/')}, got ${JSON.stringify(dim.level)}`);
    }
    if (typeof dim.evidence !== 'string') {
      throw new Error(`Judge response validation error: dimension "${key}".evidence must be a string, got ${typeof dim.evidence}`);
    }
  }

  const checklist = obj.checklist as Record<string, unknown>;
  if (typeof checklist !== 'object' || checklist === null) {
    throw new Error('Judge response validation error: "checklist" must be an object');
  }
  for (const key of REQUIRED_CHECKLIST_KEYS) {
    if (!(key in checklist)) throw new Error(`Judge response validation error: missing required checklist item "${key}"`);
    if (typeof checklist[key] !== 'boolean') {
      throw new Error(`Judge response validation error: checklist item "${key}" must be a boolean, got ${typeof checklist[key]}`);
    }
  }
}

export async function judgeProfile(result: ProfileRunResult, client: AnthropicMessagesClient): Promise<JudgeVerdict> {
  const prompt = buildJudgePrompt(result);
  let response;
  try {
    response = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });
  } catch (e) {
    throw new Error(`Judge API call failed for profile ${result.profileId}: ${(e as Error).message}`);
  }

  const textBlock = response.content.find((c) => c.type === 'text');
  if (!textBlock || !textBlock.text) {
    throw new Error('Judge response validation error: no text content block in the API response');
  }

  const jsonText = extractJsonText(textBlock.text);
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (e) {
    throw new Error(`Judge response validation error: response is not valid JSON: ${(e as Error).message}`);
  }

  validateVerdict(parsed);
  return parsed;
}
