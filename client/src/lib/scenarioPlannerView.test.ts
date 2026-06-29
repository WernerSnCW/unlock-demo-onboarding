import { describe, it, expect } from 'vitest';
import { fmtSignedPct, fmtRecovery, scopeContractLine } from './scenarioPlannerView';

describe('fmtSignedPct', () => {
  it('uses the U+2212 minus and rounds to whole %', () => {
    expect(fmtSignedPct(-0.252)).toBe('−25%');
    expect(fmtSignedPct(0.06)).toBe('+6%');
    expect(fmtSignedPct(0)).toBe('0%');
  });
});

describe('fmtRecovery', () => {
  it('formats monthly recovery in months', () => {
    expect(fmtRecovery(14, 'monthly', false)).toBe('14 months');
  });
  it('formats annual recovery in years', () => {
    expect(fmtRecovery(25, 'annual', false)).toBe('25 years');
  });
  it('flags real-terms for inflation episodes', () => {
    expect(fmtRecovery(8, 'annual', true)).toBe('8 years (real terms)');
  });
  it('handles not-recovered-in-window', () => {
    expect(fmtRecovery(null, 'monthly', false)).toBe('not recovered within the recorded window');
  });
  it('uses singular unit when steps is 1', () => {
    expect(fmtRecovery(1, 'annual', false)).toBe('1 year');
    expect(fmtRecovery(1, 'monthly', false)).toBe('1 month');
  });
});

describe('scopeContractLine (§5 modelled-vs-unmodelled, up-front)', () => {
  it('states the modelled share without advice verbs', () => {
    expect(scopeContractLine(0.2)).toContain('80%');
    expect(scopeContractLine(0)).toContain('all');
  });
});
