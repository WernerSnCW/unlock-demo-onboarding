import { describe, it, expect } from 'vitest';
import { PERSONA_WEIGHT_TABLE } from '../server/services/personaEngine';

describe('PERSONA_WEIGHT_TABLE', () => {
  it('is exported and every persona\'s weights sum to 1.0', () => {
    expect(PERSONA_WEIGHT_TABLE).toBeDefined();
    for (const [code, weights] of Object.entries(PERSONA_WEIGHT_TABLE)) {
      const sum = Object.values(weights).reduce((a, b) => a + b, 0);
      expect(sum, `${code} weights should sum to 1.0`).toBeCloseTo(1.0, 6);
    }
  });
});
