import { describe, it, expect } from 'vitest';
import { STAGE_COPY, ADVICE_EXIT, TARGET_MARKET, NARRATIVE_FALLACY_NOTE, RECOVERY_COUNTER_BEAT } from './scenarioPlannerCopy';

const BANNED_VERBS = ['should', 'must', 'buy', 'sell', 'optimise', 'optimize', 'improve', 'save', 'increase', 'decrease'];
const FORECAST_WORDS = ['will fall', 'will rise', 'predict', 'forecast', 'expected to', 'probability', 'chance of', 'likely to'];

function allStrings(): string[] {
  const out: string[] = [ADVICE_EXIT, TARGET_MARKET, NARRATIVE_FALLACY_NOTE, RECOVERY_COUNTER_BEAT];
  for (const s of STAGE_COPY) out.push(s.leadIn, s.complianceCaption, s.worthSittingWith);
  return out;
}

describe('scenario planner copy — compliance lint (§9)', () => {
  it('contains no advice verbs', () => {
    for (const text of allStrings()) {
      for (const verb of BANNED_VERBS) {
        expect(new RegExp(`\\b${verb}\\b`, 'i').test(text)).toBe(false);
      }
    }
  });
  it('contains no forecast framing', () => {
    for (const text of allStrings()) {
      // The mandated compliance disclaimers ("not a prediction" / "not a forecast") negate forecast
      // framing rather than assert it (and a sibling test requires them). Strip those exact phrases
      // before scanning — any OTHER predictive use is still caught.
      const scanned = text.toLowerCase().split('not a prediction').join('').split('not a forecast').join('');
      for (const phrase of FORECAST_WORDS) {
        expect(scanned.includes(phrase)).toBe(false);
      }
    }
  });
  it('has copy for all four stages', () => {
    expect(STAGE_COPY).toHaveLength(4);
  });
  it('every compliance caption asserts history-not-prediction', () => {
    for (const s of STAGE_COPY) expect(s.complianceCaption.toLowerCase()).toContain('not a prediction');
  });
  it('the recovery counter-beat names the duration risk for a shorter horizon (§10/P1-6)', () => {
    expect(RECOVERY_COUNTER_BEAT.toLowerCase()).toMatch(/year|recover/);
  });
});
