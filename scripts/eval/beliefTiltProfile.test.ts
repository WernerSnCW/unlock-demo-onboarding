import { describe, it, expect } from 'vitest';
import { computeBeliefTiltProfile } from './beliefTiltProfile';
import type { BeliefTiltAnswers } from './generateProfiles';

const NEUTRAL: BeliefTiltAnswers = {
  Q_VOLATILITY_COMFORT: 3, Q_QUALITY: 3, Q_VALUE: 3, Q_TECH: 3,
  Q_UK_BIAS: 3, Q_ESG: 3, Q_INFLATION: 3, Q_SMALL_CAP: 3,
};

describe('computeBeliefTiltProfile', () => {
  it('all-neutral answers produce all-NEUTRAL direction and intensity', () => {
    const result = computeBeliefTiltProfile(NEUTRAL);
    for (const entry of result.tiltProfile) {
      expect(entry.direction).toBe('NEUTRAL');
      expect(entry.intensity).toBe('NEUTRAL');
    }
  });

  it('a Strongly Agree (5) on Q_TECH produces a TOWARDS/STRONG TECH_TILT', () => {
    const result = computeBeliefTiltProfile({ ...NEUTRAL, Q_TECH: 5 });
    const techEntry = result.tiltProfile.find((e) => e.axis_code === 'TECH_TILT')!;
    expect(techEntry.direction).toBe('TOWARDS');
    expect(techEntry.intensity).toBe('STRONG');
    expect(techEntry.score).toBe(1.0);
  });

  it('Q_VOLATILITY_COMFORT is inverted into VOLATILITY_AVERSION', () => {
    const result = computeBeliefTiltProfile({ ...NEUTRAL, Q_VOLATILITY_COMFORT: 5 });
    const volEntry = result.tiltProfile.find((e) => e.axis_code === 'VOLATILITY_AVERSION')!;
    expect(volEntry.score).toBe(-1.0);
    expect(volEntry.direction).toBe('AWAY');
  });

  it('produces exactly 8 tilt-profile entries, one per axis', () => {
    const result = computeBeliefTiltProfile(NEUTRAL);
    expect(result.tiltProfile.length).toBe(8);
  });
});
