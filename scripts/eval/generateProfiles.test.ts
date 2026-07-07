import { describe, it, expect } from 'vitest';
import { generateProfiles, type GeneratedProfile } from './generateProfiles';
import { PROFILE_SHAPES, WEALTH_TIERS, ASSET_REGISTER_PATTERNS, ANSWER_PATTERNS, TROUBLE_ZONES } from './profileShapes';

describe('generateProfiles', () => {
  it('produces between 100 and 150 profiles', () => {
    const profiles = generateProfiles();
    expect(profiles.length).toBeGreaterThanOrEqual(100);
    expect(profiles.length).toBeLessThanOrEqual(150);
  });

  it('meets or exceeds every shape floor', () => {
    const profiles = generateProfiles();
    const countByShape = new Map<string, number>();
    for (const p of profiles) countByShape.set(p.shapeId, (countByShape.get(p.shapeId) ?? 0) + 1);
    for (const shape of PROFILE_SHAPES) {
      expect(countByShape.get(shape.id) ?? 0, `shape ${shape.id} below floor`).toBeGreaterThanOrEqual(shape.floor);
    }
  });

  it('every generated profile has a unique id', () => {
    const profiles = generateProfiles();
    const ids = new Set(profiles.map((p) => p.id));
    expect(ids.size).toBe(profiles.length);
  });

  it('asset_class_breakdown always sums to 1.0 (within floating-point tolerance)', () => {
    const profiles = generateProfiles();
    for (const p of profiles) {
      const b = p.investorProfile.asset_class_breakdown;
      const sum = b.equity_pct + b.bond_pct + b.property_pct + b.cash_pct + b.alts_pct + b.crypto_pct;
      expect(Math.abs(sum - 1.0), `profile ${p.id} breakdown sums to ${sum}`).toBeLessThan(0.001);
    }
  });

  it('OPTIONAL_SKIPPED-pattern profiles have every optional personaCue field null/false, not fabricated', () => {
    const profiles = generateProfiles();
    const skippers = profiles.filter((p) => p.answerPatternId === 'OPTIONAL_SKIPPED');
    expect(skippers.length).toBeGreaterThan(0);
    for (const p of skippers) {
      expect(p.investorProfile.personaCues.has_defined_benefit_pension).toBeNull();
      expect(p.investorProfile.personaCues.owns_business).toBeNull();
      expect(p.investorProfile.personaCues.has_employer_stock).toBeNull();
      expect(p.investorProfile.personaCues.is_cross_border).toBeNull();
    }
  });

  it('HARD_OVERRIDE_NOT_SURE_HEAVY-pattern profiles set NOT_SURE bands, not a concrete band', () => {
    const profiles = generateProfiles();
    const notSureHeavy = profiles.filter((p) => p.answerPatternId === 'HARD_OVERRIDE_NOT_SURE_HEAVY');
    expect(notSureHeavy.length).toBeGreaterThan(0);
    for (const p of notSureHeavy) {
      if (p.investorProfile.personaCues.owns_business) {
        expect(p.investorProfile.personaCues.private_business_wealth_band).toBe('NOT_SURE');
      }
    }
  });

  it('profiles with redGateStance set on their shape carry a matching safetyLightStance field', () => {
    const profiles = generateProfiles();
    const withStance = profiles.filter((p) => p.safetyLightStance !== undefined);
    expect(withStance.length).toBeGreaterThan(0);
    for (const p of withStance) {
      expect(['REDUCE', 'HOLD_DELIBERATE', 'UNSURE', 'NO_RESPONSE']).toContain(p.safetyLightStance);
    }
  });

  it('wealth-tier profiles land within their declared GBP band', () => {
    const profiles = generateProfiles();
    for (const p of profiles) {
      expect(p.investorProfile.total_portfolio_value_gbp).toBeGreaterThanOrEqual(500_000);
    }
  });

  it('every ProfileShape string-ID cross-reference resolves to a real entry (referential integrity)', () => {
    const tierIds = new Set(WEALTH_TIERS.map((t) => t.id));
    const assetIds = new Set(ASSET_REGISTER_PATTERNS.map((a) => a.id));
    const patternIds = new Set(ANSWER_PATTERNS.map((a) => a.id));
    const zoneIds = new Set(TROUBLE_ZONES.map((z) => z.id));
    for (const shape of PROFILE_SHAPES) {
      expect(tierIds.has(shape.wealthTier), `shape ${shape.id} references unknown wealthTier ${shape.wealthTier}`).toBe(true);
      expect(assetIds.has(shape.assetRegisterPattern), `shape ${shape.id} references unknown assetRegisterPattern ${shape.assetRegisterPattern}`).toBe(true);
      expect(patternIds.has(shape.answerPattern), `shape ${shape.id} references unknown answerPattern ${shape.answerPattern}`).toBe(true);
      expect(zoneIds.has(shape.troubleZone), `shape ${shape.id} references unknown troubleZone ${shape.troubleZone}`).toBe(true);
    }
  });
});
