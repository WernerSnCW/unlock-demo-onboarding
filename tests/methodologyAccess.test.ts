import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isMethodologyEnabled } from '../server/config/methodologyAccess';

describe('isMethodologyEnabled', () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.METHODOLOGY_ENABLED_TOKENS;
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.METHODOLOGY_ENABLED_TOKENS;
    } else {
      process.env.METHODOLOGY_ENABLED_TOKENS = originalEnv;
    }
  });

  it('returns false for a token not on the allowlist', () => {
    expect(isMethodologyEnabled('not-a-real-token')).toBe(false);
  });

  it('returns false for an empty or undefined token', () => {
    expect(isMethodologyEnabled('')).toBe(false);
    expect(isMethodologyEnabled(undefined)).toBe(false);
  });

  it('returns true for a token on the allowlist', () => {
    process.env.METHODOLOGY_ENABLED_TOKENS = 'tok-a,tok-b';
    expect(isMethodologyEnabled('tok-a')).toBe(true);
    expect(isMethodologyEnabled('tok-b')).toBe(true);
  });

  it('returns false for a token not on the allowlist when others are enabled', () => {
    process.env.METHODOLOGY_ENABLED_TOKENS = 'tok-a,tok-b';
    expect(isMethodologyEnabled('tok-c')).toBe(false);
  });

  it('handles whitespace and trailing commas in the allowlist', () => {
    process.env.METHODOLOGY_ENABLED_TOKENS = ' tok-a , tok-b , ';
    expect(isMethodologyEnabled('tok-a')).toBe(true);
    expect(isMethodologyEnabled('tok-b')).toBe(true);
  });
});
