import { describe, it, expect } from 'vitest';
import { compareRiskConsistency } from './compareRiskConsistency';
import type { BeliefResponse } from '../../state/onboardingV2Store';

function response(answer: 1 | 2 | 3 | 4 | 5, normalised: number): BeliefResponse {
  return { answer, normalised, label: '' };
}

describe('compareRiskConsistency', () => {
  it('returns CONSISTENT when the belief answer matches the stated risk comfort', () => {
    const result = compareRiskConsistency('high', response(4, 0.5));
    expect(result.verdict).toBe('CONSISTENT');
  });

  it('returns MORE_CAUTIOUS when the belief answer is meaningfully more cautious than risk_comfort', () => {
    const result = compareRiskConsistency('very_high', response(1, -1));
    expect(result.verdict).toBe('MORE_CAUTIOUS');
  });

  it('returns MORE_RISK_TOLERANT when the belief answer is meaningfully more risk-tolerant than risk_comfort', () => {
    const result = compareRiskConsistency('very_low', response(5, 1));
    expect(result.verdict).toBe('MORE_RISK_TOLERANT');
  });

  it('returns INSUFFICIENT_DATA when risk_comfort is missing', () => {
    const result = compareRiskConsistency('', response(4, 0.5));
    expect(result.verdict).toBe('INSUFFICIENT_DATA');
  });

  it('returns INSUFFICIENT_DATA when there is no belief response yet', () => {
    const result = compareRiskConsistency('high', undefined);
    expect(result.verdict).toBe('INSUFFICIENT_DATA');
  });

  it('never uses match-percent, score, or persona language in the note copy', () => {
    const verdicts = [
      compareRiskConsistency('high', response(4, 0.5)),
      compareRiskConsistency('very_high', response(1, -1)),
      compareRiskConsistency('very_low', response(5, 1)),
    ];
    for (const v of verdicts) {
      expect(v.note.toLowerCase()).not.toMatch(/%|score|persona/);
    }
  });
});
