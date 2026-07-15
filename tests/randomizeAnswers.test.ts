import { describe, it, expect } from 'vitest';
import { randomLikert, randomizeLikertResponses } from '@/lib/randomizeAnswers';

describe('randomizeAnswers', () => {
  it('randomLikert only ever returns integers 1–5', () => {
    for (let i = 0; i < 1000; i++) {
      const v = randomLikert();
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(5);
    }
  });

  it('assigns exactly one valid answer to every question id', () => {
    const ids = ['Q_A', 'Q_B', 'Q_C', 'Q_D'] as const;
    const answers: Record<string, number> = {};
    randomizeLikertResponses(ids, (id, value) => {
      answers[id] = value;
    });
    expect(Object.keys(answers).sort()).toEqual([...ids].sort());
    for (const id of ids) {
      expect([1, 2, 3, 4, 5]).toContain(answers[id]);
    }
  });

  it('is a no-op for an empty id list', () => {
    let calls = 0;
    randomizeLikertResponses([], () => { calls++; });
    expect(calls).toBe(0);
  });
});
