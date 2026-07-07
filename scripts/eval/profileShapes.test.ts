import { describe, it, expect } from 'vitest';
import { WEALTH_TIERS, ANSWER_PATTERNS, TROUBLE_ZONES, PROFILE_SHAPES } from './profileShapes';

describe('profileShapes taxonomy', () => {
  it('defines wealth tiers spanning GBP500k-25m+', () => {
    expect(WEALTH_TIERS.length).toBeGreaterThanOrEqual(3);
    expect(WEALTH_TIERS[0].minGBP).toBe(500_000);
    expect(WEALTH_TIERS[WEALTH_TIERS.length - 1].maxGBP).toBeNull();
  });

  it('defines the named trouble-zone answer patterns from the resolved spec', () => {
    const ids = TROUBLE_ZONES.map((t) => t.id);
    expect(ids).toContain('OPTIONAL_SECTION_SKIPPER');
    expect(ids).toContain('HARD_OVERRIDE_NOT_SURE');
    expect(ids).toContain('HORIZON_VOCAB_EDGE');
    expect(ids).toContain('CAPITAL_PRESERVATION_BOUNDARY');
    expect(ids).toContain('CROSS_BORDER_DB_PENSION');
  });

  it('every PROFILE_SHAPES entry has a floor of at least 1 and a positive weight', () => {
    for (const shape of PROFILE_SHAPES) {
      expect(shape.floor).toBeGreaterThanOrEqual(1);
      expect(shape.weight).toBeGreaterThan(0);
    }
  });

  it('PROFILE_SHAPES has at least one entry per trouble zone', () => {
    for (const zone of TROUBLE_ZONES) {
      const covering = PROFILE_SHAPES.filter((s) => s.troubleZone === zone.id);
      expect(covering.length, `no PROFILE_SHAPES entry for trouble zone ${zone.id}`).toBeGreaterThan(0);
    }
  });

  it('includes a self-placement (RED-gate stance) dimension on at least one shape', () => {
    const withStance = PROFILE_SHAPES.filter((s) => s.redGateStance !== undefined);
    expect(withStance.length).toBeGreaterThan(0);
  });

  it('answer patterns include full, optional-skipped, and hard-override archetypes', () => {
    const ids = ANSWER_PATTERNS.map((a) => a.id);
    expect(ids).toContain('FULL_ANSWERS');
    expect(ids).toContain('OPTIONAL_SKIPPED');
    expect(ids).toContain('HARD_OVERRIDE_NOT_SURE_HEAVY');
  });
});
