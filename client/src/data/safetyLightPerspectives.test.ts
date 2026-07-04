import { describe, it, expect } from 'vitest';
import { SAFETY_LIGHT_PERSPECTIVES } from './safetyLightPerspectives';

const LIGHTS = ['liquidity', 'concentration', 'illiquids'] as const;
// Words that would tip one side into reading as the "correct" or recommended one — if either
// side of a pair uses these and the other doesn't, the symmetry the design relies on breaks.
const LOADED_WORDS = ['risky', 'risk-free', 'safer', 'better', 'recommended', 'should', 'smarter', 'wiser', 'mistake'];

describe('SAFETY_LIGHT_PERSPECTIVES', () => {
  it('has a REDUCE and a HOLD_DELIBERATE entry for every light type', () => {
    for (const light of LIGHTS) {
      expect(SAFETY_LIGHT_PERSPECTIVES[light].REDUCE, `${light} REDUCE`).toBeDefined();
      expect(SAFETY_LIGHT_PERSPECTIVES[light].HOLD_DELIBERATE, `${light} HOLD_DELIBERATE`).toBeDefined();
    }
  });

  it('every perspective has non-empty valuePoints and a tradeOff', () => {
    for (const light of LIGHTS) {
      for (const stance of ['REDUCE', 'HOLD_DELIBERATE'] as const) {
        const p = SAFETY_LIGHT_PERSPECTIVES[light][stance];
        expect(p.valuePoints.length, `${light}/${stance} valuePoints`).toBeGreaterThan(0);
        expect(p.tradeOff.length, `${light}/${stance} tradeOff`).toBeGreaterThan(0);
      }
    }
  });

  it('contains no loaded/persuasive language on either side', () => {
    for (const light of LIGHTS) {
      for (const stance of ['REDUCE', 'HOLD_DELIBERATE'] as const) {
        const p = SAFETY_LIGHT_PERSPECTIVES[light][stance];
        const text = [...p.valuePoints, p.tradeOff].join(' ').toLowerCase();
        for (const word of LOADED_WORDS) {
          expect(text.includes(word), `${light}/${stance} should not contain "${word}"`).toBe(false);
        }
      }
    }
  });

  it('keeps each pair roughly balanced in length (neither side over 1.6x the other)', () => {
    for (const light of LIGHTS) {
      const reduceLen = SAFETY_LIGHT_PERSPECTIVES[light].REDUCE.valuePoints.join(' ').length
        + SAFETY_LIGHT_PERSPECTIVES[light].REDUCE.tradeOff.length;
      const holdLen = SAFETY_LIGHT_PERSPECTIVES[light].HOLD_DELIBERATE.valuePoints.join(' ').length
        + SAFETY_LIGHT_PERSPECTIVES[light].HOLD_DELIBERATE.tradeOff.length;
      const ratio = Math.max(reduceLen, holdLen) / Math.min(reduceLen, holdLen);
      expect(ratio, `${light} REDUCE/HOLD_DELIBERATE length ratio`).toBeLessThan(1.6);
    }
  });
});
