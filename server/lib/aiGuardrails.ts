// Shared compliance guardrails for LLM output.
//
// This generalises the fail-closed pattern from /api/translate/next-steps —
// the one validated AI surface in this repo — so every LLM call site can
// validate output server-side and fail closed instead of returning (or
// silently substituting) unvalidated text. Per ADR 2026-06-11 (compliance
// gate extends to demo repo): no unvalidated LLM output may be returned,
// persisted, or cache-served.

export const COMPLIANCE_LINE = 'Illustrative only. Not financial advice.';

// Strict list used by summariser surfaces (translate/next-steps). Moved here
// verbatim from server/routes.ts so it has a single server-side source.
export const FORBIDDEN_WORDS = [
  // Financial advice verbs
  'should', 'recommend', 'buy', 'sell', 'allocate', 'rebalance',
  'increase', 'decrease', 'switch', 'guarantee', 'expect',
  'predict', 'outperform', 'alpha',
  // Judgement adjectives
  'positive', 'negative', 'favourable', 'favorable', 'unfavourable', 'unfavorable',
  'strong', 'weak', 'good', 'bad', 'excellent', 'poor', 'great', 'terrible',
  'optimistic', 'pessimistic', 'bullish', 'bearish', 'aggressive', 'conservative',
  // Strength/intensity modifiers that imply judgement
  'significant', 'substantial', 'considerable', 'notable', 'marked', 'pronounced',
  'slight', 'minor', 'marginal', 'modest',
  // Direction judgements
  'inclination', 'tendency', 'leaning'
];

// Narrower list for conversational and JSON-structured surfaces, where the
// full summariser list would reject legitimate analytical language. These are
// the advice-shaped terms: verbs that tell the user what to do with money.
export const ADVICE_TERMS = [
  'should', 'must', 'recommend', 'recommends', 'recommended', 'recommendation',
  'recommendations', 'buy', 'buying', 'sell', 'selling', 'allocate',
  'reallocate', 'rebalance', 'rebalancing', 'guarantee', 'guaranteed',
  'guarantees', 'outperform', 'underperform', 'act now',
];

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export function findBannedTerm(text: string, terms: string[]): string | null {
  for (const term of terms) {
    // \b on each word of the term; multi-word terms match as a phrase
    const pattern = term.split(/\s+/).map(w => `\\b${w}\\b`).join('\\s+');
    if (new RegExp(pattern, 'i').test(text)) {
      return term;
    }
  }
  return null;
}

// Exact semantics of the original validateAIOutput in /api/translate/next-steps:
// strict forbidden-word list + compliance line exactly once, at the end.
export function validateStrictSummary(text: string): ValidationResult {
  const banned = findBannedTerm(text, FORBIDDEN_WORDS);
  if (banned) {
    return { valid: false, reason: `Contains forbidden word: "${banned}"` };
  }

  const trimmedText = text.trim();
  if (!trimmedText.endsWith(COMPLIANCE_LINE)) {
    return { valid: false, reason: 'Compliance line must appear at the end of the output' };
  }

  const occurrences = (text.match(new RegExp(COMPLIANCE_LINE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  if (occurrences !== 1) {
    return { valid: false, reason: 'Compliance line must appear exactly once' };
  }

  return { valid: true };
}

// For conversational replies: advice-free and ends with the compliance line.
export function validateChatReply(text: string): ValidationResult {
  const banned = findBannedTerm(text, ADVICE_TERMS);
  if (banned) {
    return { valid: false, reason: `Contains advice-shaped term: "${banned}"` };
  }
  if (!text.trim().endsWith(COMPLIANCE_LINE)) {
    return { valid: false, reason: 'Compliance line must appear at the end of the output' };
  }
  return { valid: true };
}

// Deep-collect every string value in a parsed JSON structure.
export function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') {
    out.push(value);
  } else if (Array.isArray(value)) {
    for (const v of value) collectStrings(v, out);
  } else if (value && typeof value === 'object') {
    for (const v of Object.values(value)) collectStrings(v, out);
  }
  return out;
}

// For JSON-structured LLM output: every string field must be advice-free.
// skipKeys lets callers exempt fields that are overwritten deterministically
// (e.g. a disclaimer field that is replaced with COMPLIANCE_LINE).
export function validateJsonAdviceFree(value: unknown, skipKeys: string[] = []): ValidationResult {
  let scrubbed = value;
  if (value && typeof value === 'object' && !Array.isArray(value) && skipKeys.length > 0) {
    scrubbed = Object.fromEntries(
      Object.entries(value as Record<string, unknown>).filter(([k]) => !skipKeys.includes(k))
    );
  }
  for (const text of collectStrings(scrubbed)) {
    const banned = findBannedTerm(text, ADVICE_TERMS);
    if (banned) {
      return { valid: false, reason: `Contains advice-shaped term: "${banned}"` };
    }
  }
  return { valid: true };
}
