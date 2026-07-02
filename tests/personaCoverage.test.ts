import { describe, it, expect } from 'vitest';
import { computePersona, computeTraitScores, type InvestorProfile } from '../server/services/personaEngine';

function baseProfile(overrides: Partial<InvestorProfile> = {}): InvestorProfile {
  return {
    age_band: '35_44',
    portfolio_stage: 'ACCUMULATING',
    primary_goal: 'grow_wealth',
    time_horizon: 'long',
    risk_comfort: 'moderate',
    total_portfolio_value_gbp: 600000,
    cash_runway_months: 6,
    largest_line_pct: 0.15,
    illiquid_pct: 0.05,
    asset_class_breakdown: {
      equity_pct: 0.50,
      bond_pct: 0.20,
      property_pct: 0.10,
      cash_pct: 0.15,
      alts_pct: 0.05,
      crypto_pct: 0,
    },
    liquidity_status: 'GREEN',
    concentration_status: 'GREEN',
    illiquids_status: 'GREEN',
    personaCues: {
      age_band: '35_44',
      portfolio_stage: 'ACCUMULATING',
      investing_focus: [],
      has_defined_benefit_pension: false,
      db_income_coverage_band: null,
      owns_business: false,
      private_business_wealth_band: null,
      has_employer_stock: false,
      employer_stock_alloc_band: null,
      has_crypto: false,
      crypto_alloc_band: null,
      adviser_usage: null,
      is_cross_border: false,
    },
    ...overrides,
  };
}

describe('rec 7: time horizon vocabulary', () => {
  it('medium (3-7yrs) scores between short and long, not equal to short', () => {
    const shortScore = computeTraitScores(baseProfile({ time_horizon: 'short' })).risk_appetite;
    const mediumScore = computeTraitScores(baseProfile({ time_horizon: 'medium' })).risk_appetite;
    const longScore = computeTraitScores(baseProfile({ time_horizon: 'long' })).risk_appetite;
    expect(mediumScore).toBeGreaterThan(shortScore);
    expect(mediumScore).toBeLessThan(longScore);
  });
});

// NOTE: the plan's draft test skeleton asserted on `result.assignment_basis`, but no such field
// exists on PersonaResult (checked personaEngine.ts's PersonaResult interface and the
// computePersona() return object — it only returns match_score/match_confidence, not the
// internal `was_hard_override` flag computed inside assignPrimaryPersonaWithMatching). All three
// hard-override branches return match_confidence: 1.0 exactly; a weighted match's confidence is
// (topMatch.score - secondMatch.score), which is essentially never exactly 1.0 for a realistic
// profile. match_confidence === 1.0 is used below as the proxy for "was this a hard override"
// instead of the nonexistent assignment_basis field.
describe('rec 8: NOT_SURE business band does not auto-fire the founder override', () => {
  it('owns_business + NOT_SURE routes to weighted matching, not a hard override', () => {
    const profile = baseProfile({
      personaCues: {
        ...baseProfile().personaCues,
        owns_business: true,
        private_business_wealth_band: 'NOT_SURE',
      },
    });
    const result = computePersona(profile);
    expect(result.match_confidence).toBeLessThan(1.0);
    expect(result.code).not.toBe('FOUNDER_ENTREPRENEUR');
  });

  it('owns_business + GT_50 still fires the hard override (regression guard)', () => {
    const profile = baseProfile({
      personaCues: {
        ...baseProfile().personaCues,
        owns_business: true,
        private_business_wealth_band: 'GT_50',
      },
    });
    const result = computePersona(profile);
    expect(result.code).toBe('FOUNDER_ENTREPRENEUR');
    expect(result.match_confidence).toBe(1.0);
  });
});

describe('rec 6: self-directed signal + I_AM_AN_ADVISER handling', () => {
  it('individual-shares focus increases risk_appetite over a no-focus baseline', () => {
    const without = computeTraitScores(baseProfile()).risk_appetite;
    const withFocus = computeTraitScores(
      baseProfile({ personaCues: { ...baseProfile().personaCues, investing_focus: ['INDIVIDUAL_SHARES'] } }),
    ).risk_appetite;
    expect(withFocus).toBeGreaterThan(without);
  });

  it('I_AM_AN_ADVISER is excluded from SELF_DIRECTED_GROWTH like FULL_SERVICE_ADVISER', () => {
    // A profile shaped to weight-match SELF_DIRECTED_GROWTH: high risk, self-directed-leaning inputs.
    const profile = baseProfile({
      risk_comfort: 'very_high',
      time_horizon: 'very_long',
      total_portfolio_value_gbp: 300000,
      asset_class_breakdown: {
        equity_pct: 0.85,
        bond_pct: 0.05,
        property_pct: 0,
        cash_pct: 0.05,
        alts_pct: 0.05,
        crypto_pct: 0,
      },
      personaCues: {
        ...baseProfile().personaCues,
        investing_focus: ['INDIVIDUAL_SHARES'],
        adviser_usage: 'I_AM_AN_ADVISER',
      },
    });
    const result = computePersona(profile);
    expect(result.code).not.toBe('SELF_DIRECTED_GROWTH');
  });
});

describe('rec 5: DB pension coverage and employer stock band feed traits', () => {
  it('GT_75 DB income coverage increases income_orientation over NOT_SURE', () => {
    const gt75 = computeTraitScores(baseProfile({
      personaCues: { ...baseProfile().personaCues, has_defined_benefit_pension: true, db_income_coverage_band: 'GT_75' },
    })).income_orientation;
    const notSure = computeTraitScores(baseProfile({
      personaCues: { ...baseProfile().personaCues, has_defined_benefit_pension: true, db_income_coverage_band: 'NOT_SURE' },
    })).income_orientation;
    expect(gt75).toBeGreaterThan(notSure);
  });

  it('GT_30 employer stock band increases complexity_proxy over LT_5', () => {
    const gt30 = computeTraitScores(baseProfile({
      personaCues: { ...baseProfile().personaCues, has_employer_stock: true, employer_stock_alloc_band: 'GT_30' },
    })).complexity_proxy;
    const lt5 = computeTraitScores(baseProfile({
      personaCues: { ...baseProfile().personaCues, has_employer_stock: true, employer_stock_alloc_band: 'LT_5' },
    })).complexity_proxy;
    expect(gt30).toBeGreaterThan(lt5);
  });
});

describe('rec 1+10: capital preservation differentiator', () => {
  it('preserve_capital goal raises liquidity_comfort relative to grow_wealth, at equal cash/runway', () => {
    const preserve = computeTraitScores(baseProfile({ primary_goal: 'preserve_capital' })).liquidity_comfort;
    const grow = computeTraitScores(baseProfile({ primary_goal: 'grow_wealth' })).liquidity_comfort;
    expect(preserve).toBeGreaterThan(grow);
  });

  it('a preservation-postured profile (very_low risk, preserve_capital, accumulating, ample liquidity) resolves to CAPITAL_PRESERVATION', () => {
    const profile = baseProfile({
      risk_comfort: 'very_low',
      primary_goal: 'preserve_capital',
      portfolio_stage: 'ACCUMULATING',
      cash_runway_months: 18,
      total_portfolio_value_gbp: 800000,
      asset_class_breakdown: {
        equity_pct: 0.25,
        bond_pct: 0.30,
        property_pct: 0.10,
        cash_pct: 0.30,
        alts_pct: 0.05,
        crypto_pct: 0,
      },
      personaCues: { ...baseProfile().personaCues, portfolio_stage: 'ACCUMULATING' },
    });
    const result = computePersona(profile);
    expect(result.code).toBe('CAPITAL_PRESERVATION');
  });

  it('an income-focused drawdown profile still resolves to INCOME_STABILITY (no regression)', () => {
    const profile = baseProfile({
      risk_comfort: 'low',
      primary_goal: 'income_focus',
      portfolio_stage: 'PRIMARILY_DRAWDOWN',
      cash_runway_months: 10,
      personaCues: { ...baseProfile().personaCues, portfolio_stage: 'PRIMARILY_DRAWDOWN' },
    });
    expect(computePersona(profile).code).toBe('INCOME_STABILITY');
  });
});
