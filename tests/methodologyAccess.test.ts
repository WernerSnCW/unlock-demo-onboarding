import { describe, it, expect } from 'vitest';
import { isMethodologyEnabled } from '../server/config/methodologyAccess';

describe('isMethodologyEnabled', () => {
  it('returns false for a token not on the allowlist', () => {
    expect(isMethodologyEnabled('not-a-real-token')).toBe(false);
  });

  it('returns false for an empty or undefined token', () => {
    expect(isMethodologyEnabled('')).toBe(false);
    expect(isMethodologyEnabled(undefined)).toBe(false);
  });
});
