import { describe, it, expect } from 'vitest';
import { computePersona, buildPersonaCatalogue } from '../server/services/personaEngine';

// ============================================================
// Fixture 1: Business-heavy profile — triggers FOUNDER_ENTREPRENEUR hard override
// getBusinessDominance returns 0.375 for band '25_50' when owns_business=true (>= 0.25 threshold)
// ============================================================
const businessHeavyProfile = {
  age_band: '35_44' as const,
  portfolio_stage: 'ACCUMULATING' as const,
  primary_goal: 'growth',
  time_horizon: '10_plus',
  risk_comfort: 'moderate',
  total_portfolio_value_gbp: 500000,
  cash_runway_months: 6,
  largest_line_pct: 0.10,
  illiquid_pct: 0.05,
  asset_class_breakdown: {
    equity_pct: 0.50,
    bond_pct: 0.10,
    property_pct: 0.05,
    cash_pct: 0.10,
    alts_pct: 0.05,
    crypto_pct: 0.00,
  },
  liquidity_status: 'GREEN' as const,
  concentration_status: 'GREEN' as const,
  illiquids_status: 'GREEN' as const,
  personaCues: {
    age_band: '35_44' as const,
    portfolio_stage: 'ACCUMULATING' as const,
    investing_focus: ['PRIVATE_BUSINESS' as const],
    has_defined_benefit_pension: false,
    db_income_coverage_band: null,
    owns_business: true,
    private_business_wealth_band: '25_50' as const,
    has_employer_stock: false,
    employer_stock_alloc_band: null,
    has_crypto: false,
    crypto_alloc_band: null,
    adviser_usage: 'SOMETIMES_ADVISED' as const,
    is_cross_border: false,
  },
};

// ============================================================
// Fixture 2: Weighted match profile — no override triggers.
// Deliberately a decisive weighted outcome (self-directed, high risk, long horizon,
// equity-heavy — strongly SELF_DIRECTED_GROWTH-shaped). The assertions pin only the
// basis/reason/runners-up CONTRACT, not which persona wins.
// ============================================================
const weightedProfile = {
  age_band: '35_44' as const,
  portfolio_stage: 'ACCUMULATING' as const,
  primary_goal: 'growth',
  time_horizon: '10_plus',
  risk_comfort: 'high',
  total_portfolio_value_gbp: 300000,
  cash_runway_months: 8,
  largest_line_pct: 0.08,
  illiquid_pct: 0.02,
  asset_class_breakdown: {
    equity_pct: 0.70,
    bond_pct: 0.10,
    property_pct: 0.05,
    cash_pct: 0.10,
    alts_pct: 0.05,
    crypto_pct: 0.00,
  },
  liquidity_status: 'GREEN' as const,
  concentration_status: 'GREEN' as const,
  illiquids_status: 'GREEN' as const,
  personaCues: {
    age_band: '35_44' as const,
    portfolio_stage: 'ACCUMULATING' as const,
    investing_focus: ['FUNDS_ETFS' as const],
    has_defined_benefit_pension: false,
    db_income_coverage_band: null,
    owns_business: false,
    private_business_wealth_band: null,
    has_employer_stock: false,
    employer_stock_alloc_band: null,
    has_crypto: false,
    crypto_alloc_band: null,
    adviser_usage: 'SELF_DIRECTED' as const,
    is_cross_border: false,
  },
};

// ============================================================
// Fixture 3: Full-service adviser — same as weighted but adviser_usage=FULL_SERVICE_ADVISER
// SELF_DIRECTED_GROWTH must never appear in winner or runners-up
// ============================================================
const fullServiceProfile = {
  ...weightedProfile,
  personaCues: {
    ...weightedProfile.personaCues,
    adviser_usage: 'FULL_SERVICE_ADVISER' as const,
  },
};

describe('persona assignment transparency', () => {
  it('hard override reports basis HARD_OVERRIDE with a factual reason and no runners-up', () => {
    const result = computePersona(businessHeavyProfile);
    expect(result.code).toBe('FOUNDER_ENTREPRENEUR');
    expect(result.assignment_basis).toBe('HARD_OVERRIDE');
    expect(result.override_reason).toMatch(/business/i);
    expect(result.runners_up).toEqual([]);
  });

  it('weighted match reports basis WEIGHTED_MATCH, null reason, and exactly 2 ordered runners-up', () => {
    const result = computePersona(weightedProfile);
    expect(result.assignment_basis).toBe('WEIGHTED_MATCH');
    expect(result.override_reason).toBeNull();
    expect(result.runners_up).toHaveLength(2);
    for (const r of result.runners_up) {
      expect(r.code).not.toBe(result.code);
      expect(typeof r.label).toBe('string');
      expect(r.label.length).toBeGreaterThan(0);
    }
    // runners-up must be distinct
    expect(result.runners_up[0].code).not.toBe(result.runners_up[1].code);
  });

  it('fully-advised profiles never list SELF_DIRECTED_GROWTH among winner or runners-up', () => {
    const result = computePersona(fullServiceProfile);
    expect(result.code).not.toBe('SELF_DIRECTED_GROWTH');
    expect(result.runners_up.map((r) => r.code)).not.toContain('SELF_DIRECTED_GROWTH');
    // 8 personas with exactly one filtered still leaves 7 — slice(1, 3) must always yield 2
    expect(result.runners_up).toHaveLength(2);
  });

  it('BTL-focus property override states the buy-to-let path, not the 30% allocation path', () => {
    // property_pct 0.20 alone is below the 0.30 threshold; +0.15 BTL-focus boost fires the override
    const btlProfile = {
      ...weightedProfile,
      asset_class_breakdown: {
        ...weightedProfile.asset_class_breakdown,
        equity_pct: 0.55,
        property_pct: 0.20,
      },
      personaCues: {
        ...weightedProfile.personaCues,
        investing_focus: ['PROPERTY_BTL' as const],
      },
    };
    const result = computePersona(btlProfile);
    expect(result.code).toBe('PROPERTY_LED');
    expect(result.assignment_basis).toBe('HARD_OVERRIDE');
    expect(result.override_reason).toMatch(/buy-to-let/i);
    expect(result.override_reason).not.toContain('30%');
  });
});

describe('buildPersonaCatalogue', () => {
  it('returns all 8 personas with content and top-2 real weight emphases', () => {
    const catalogue = buildPersonaCatalogue();
    expect(catalogue).toHaveLength(8);
    for (const p of catalogue) {
      expect(p.code.length).toBeGreaterThan(0);
      expect(p.label.length).toBeGreaterThan(0);
      expect(p.one_liner.length).toBeGreaterThan(0);
      expect(p.plan_focus_bullets.length).toBeGreaterThan(0);
      expect(p.plan_focus_bullets.every((b) => b.length > 0)).toBe(true);
      expect(p.risks_bullets.length).toBeGreaterThan(0);
      expect(p.risks_bullets.every((b) => b.length > 0)).toBe(true);
      expect(p.emphases).toHaveLength(2);
      // emphases are the persona's actual top-2 weighted traits, descending
      expect(p.emphases[0].weight).toBeGreaterThanOrEqual(p.emphases[1].weight);
      expect(p.emphases[0].label.length).toBeGreaterThan(0);
    }
  });

  it('PROPERTY_LED emphasises property tilt first (weight 0.7 — pins the table wiring)', () => {
    const propertyLed = buildPersonaCatalogue().find((p) => p.code === 'PROPERTY_LED')!;
    expect(propertyLed.emphases[0]).toEqual({ trait: 'property_bias', label: 'Property tilt', weight: 0.7 });
  });
});
