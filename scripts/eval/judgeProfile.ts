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

function extractJsonText(rawText: string): string {
  const fenceMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  return fenceMatch ? fenceMatch[1] : rawText;
}

function validateVerdict(parsed: unknown): asserts parsed is JudgeVerdict {
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Judge response validation error: parsed response is not an object');
  }
  const obj = parsed as Record<string, unknown>;
  for (const key of REQUIRED_TOP_LEVEL_KEYS) {
    if (!(key in obj)) throw new Error(`Judge response validation error: missing required top-level key "${key}"`);
  }
  const dimensions = obj.dimensions as Record<string, unknown>;
  for (const key of REQUIRED_DIMENSION_KEYS) {
    if (!(key in dimensions)) throw new Error(`Judge response validation error: missing required dimension "${key}"`);
  }
  const checklist = obj.checklist as Record<string, unknown>;
  for (const key of REQUIRED_CHECKLIST_KEYS) {
    if (!(key in checklist)) throw new Error(`Judge response validation error: missing required checklist item "${key}"`);
  }
}

export async function judgeProfile(result: ProfileRunResult, client: AnthropicMessagesClient): Promise<JudgeVerdict> {
  const prompt = buildJudgePrompt(result);
  const response = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

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
