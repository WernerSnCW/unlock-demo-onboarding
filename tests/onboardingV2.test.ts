import { describe, it, expect, beforeEach, vi } from 'vitest';

const localStorageMock = {
  data: {} as Record<string, string>,
  getItem: (key: string) => localStorageMock.data[key] || null,
  setItem: (key: string, value: string) => { localStorageMock.data[key] = value; },
  removeItem: (key: string) => { delete localStorageMock.data[key]; },
  clear: () => { localStorageMock.data = {}; },
};

vi.stubGlobal('localStorage', localStorageMock);

describe('Onboarding V2 Store', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorageMock.clear();
  });

  it('should calculate portfolio summary correctly', async () => {
    const { useOnboardingV2Store } = await import('../client/src/state/onboardingV2Store');
    const store = useOnboardingV2Store.getState();

    store.setHoldings([
      {
        id: 'h1',
        instrument_name: 'Vanguard FTSE 100',
        ticker: 'VUKE',
        wrapper: 'isa',
        asset_class: 'equity',
        region: 'uk',
        value_gbp: 50000,
        illiquid: false,
      },
      {
        id: 'h2',
        instrument_name: 'Property Fund',
        ticker: 'PROP',
        wrapper: 'gia',
        asset_class: 'property',
        region: 'uk',
        value_gbp: 30000,
        illiquid: true,
      },
      {
        id: 'h3',
        instrument_name: 'Global Bonds',
        ticker: 'BOND',
        wrapper: 'sipp',
        asset_class: 'bond',
        region: 'global',
        value_gbp: 20000,
        illiquid: false,
      },
    ]);

    const summary = useOnboardingV2Store.getState().summary;

    expect(summary.total_investable_value).toBe(100000);
    expect(summary.holding_count).toBe(3);
    expect(summary.largest_line_pct).toBe(50);
    expect(summary.illiquid_pct).toBe(30);
  });

  it('should update intake data correctly', async () => {
    const { useOnboardingV2Store } = await import('../client/src/state/onboardingV2Store');
    const store = useOnboardingV2Store.getState();

    store.updateIntake({
      full_name: 'John Doe',
      email: 'john@example.com',
      investor_type: 'individual',
      region: 'uk',
      annual_income_gbp: 75000,
      annual_essential_spend_gbp: 36000,
      liquid_cash_gbp: 25000,
    });

    const intake = useOnboardingV2Store.getState().intake;

    expect(intake.full_name).toBe('John Doe');
    expect(intake.email).toBe('john@example.com');
    expect(intake.investor_type).toBe('individual');
    expect(intake.annual_essential_spend_gbp).toBe(36000);
    expect(intake.liquid_cash_gbp).toBe(25000);
  });

  it('should add and remove holdings correctly', async () => {
    const { useOnboardingV2Store } = await import('../client/src/state/onboardingV2Store');
    const store = useOnboardingV2Store.getState();

    const initialCount = store.holdings.length;
    store.addHolding();
    expect(useOnboardingV2Store.getState().holdings.length).toBe(initialCount + 1);

    const holdingId = useOnboardingV2Store.getState().holdings[0].id;
    store.removeHolding(holdingId);
    expect(useOnboardingV2Store.getState().holdings.length).toBe(initialCount);
  });

  it('should set analysis loading and result states', async () => {
    const { useOnboardingV2Store } = await import('../client/src/state/onboardingV2Store');
    const store = useOnboardingV2Store.getState();

    expect(store.analysis.status).toBe('idle');

    store.setAnalysisLoading();
    expect(useOnboardingV2Store.getState().analysis.status).toBe('loading');

    const mockResult = {
      safety_lights: {
        liquidity: 'GREEN' as const,
        concentration: 'AMBER' as const,
        illiquids: 'GREEN' as const,
        overall_status: 'AMBER' as const,
        tilts_allowed: true,
        details: {
          cash_runway_months: 8.3,
          liquidity_thresholds: { red_below: 6, amber_below: 9 },
          concentration_thresholds: { amber_above: 15, red_above: 20 },
          illiquids_thresholds: { amber_above: 7, red_above: 10 },
        },
      },
      persona: { id: null, name: null },
    };

    store.setAnalysisResult(mockResult);
    const analysis = useOnboardingV2Store.getState().analysis;
    expect(analysis.status).toBe('ready');
    expect(analysis.result).toEqual(mockResult);
  });

  it('should handle analysis error state', async () => {
    const { useOnboardingV2Store } = await import('../client/src/state/onboardingV2Store');
    const store = useOnboardingV2Store.getState();

    store.setAnalysisError('Network error');
    const analysis = useOnboardingV2Store.getState().analysis;
    expect(analysis.status).toBe('error');
    expect(analysis.error).toBe('Network error');
  });

  it('should reset onboarding state', async () => {
    const { useOnboardingV2Store } = await import('../client/src/state/onboardingV2Store');
    const store = useOnboardingV2Store.getState();

    store.updateIntake({ full_name: 'Test User' });
    store.addHolding();

    store.resetOnboarding();
    const state = useOnboardingV2Store.getState();

    expect(state.intake.full_name).toBe('');
    expect(state.holdings.length).toBe(1);
    expect(state.analysis.status).toBe('idle');
  });
});

describe('Analysis API Payload', () => {
  it('should build correct payload from intake and summary', async () => {
    const intake = {
      liquid_cash_gbp: 25000,
      annual_essential_spend_gbp: 36000,
    };

    const summary = {
      largest_line_pct: 45,
      illiquid_pct: 15,
    };

    const payload = {
      cash: intake.liquid_cash_gbp,
      spend: intake.annual_essential_spend_gbp,
      largest_line_pct: summary.largest_line_pct,
      illiquid_pct: summary.illiquid_pct,
    };

    expect(payload).toEqual({
      cash: 25000,
      spend: 36000,
      largest_line_pct: 45,
      illiquid_pct: 15,
    });
  });
});

describe('Holdings Validation', () => {
  it('should require at least one holding with positive value', () => {
    const holdings = [
      { instrument_name: '', value_gbp: 0, wrapper: '', asset_class: '' },
    ];

    const validHoldings = holdings.filter(
      (h) => h.instrument_name || h.value_gbp > 0 || h.wrapper || h.asset_class
    );

    expect(validHoldings.length).toBe(0);
  });

  it('should identify holdings with incomplete required fields', () => {
    const holding = {
      instrument_name: 'Test Fund',
      value_gbp: 10000,
      wrapper: '',
      asset_class: 'equity',
    };

    const errors: { wrapper?: string } = {};

    if (!holding.wrapper) {
      errors.wrapper = 'Wrapper required';
    }

    expect(errors.wrapper).toBe('Wrapper required');
  });

  it('should validate positive value requirement', () => {
    const holding = {
      instrument_name: 'Test Fund',
      value_gbp: 0,
      wrapper: 'isa',
      asset_class: 'equity',
    };

    const isInvalid = !holding.value_gbp || holding.value_gbp <= 0;
    expect(isInvalid).toBe(true);
  });
});

describe('Portfolio Summary Calculations', () => {
  it('should calculate largest line percentage correctly', () => {
    const holdings = [
      { value_gbp: 50000, illiquid: false },
      { value_gbp: 30000, illiquid: true },
      { value_gbp: 20000, illiquid: false },
    ];

    const total = holdings.reduce((sum, h) => sum + h.value_gbp, 0);
    const largestValue = Math.max(...holdings.map((h) => h.value_gbp));
    const largest_line_pct = total > 0 ? (largestValue / total) * 100 : 0;

    expect(total).toBe(100000);
    expect(largest_line_pct).toBe(50);
  });

  it('should calculate illiquid percentage correctly', () => {
    const holdings = [
      { value_gbp: 50000, illiquid: false },
      { value_gbp: 30000, illiquid: true },
      { value_gbp: 20000, illiquid: false },
    ];

    const total = holdings.reduce((sum, h) => sum + h.value_gbp, 0);
    const illiquidValue = holdings
      .filter((h) => h.illiquid)
      .reduce((sum, h) => sum + h.value_gbp, 0);
    const illiquid_pct = total > 0 ? (illiquidValue / total) * 100 : 0;

    expect(illiquidValue).toBe(30000);
    expect(illiquid_pct).toBe(30);
  });

  it('should handle empty holdings gracefully', () => {
    const holdings: { value_gbp: number; illiquid: boolean }[] = [];

    const total = holdings.reduce((sum, h) => sum + h.value_gbp, 0);
    const largest_line_pct = 0;
    const illiquid_pct = 0;

    expect(total).toBe(0);
    expect(largest_line_pct).toBe(0);
    expect(illiquid_pct).toBe(0);
  });
});

describe('Advanced Holdings Fields', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorageMock.clear();
  });

  it('should create new holdings with default currency = GBP and other fields empty/null', async () => {
    const { useOnboardingV2Store } = await import('../client/src/state/onboardingV2Store');
    const store = useOnboardingV2Store.getState();

    store.addHolding();
    const holdings = useOnboardingV2Store.getState().holdings;
    const newHolding = holdings[holdings.length - 1];

    expect(newHolding.currency).toBe('GBP');
    expect(newHolding.instrument_type).toBe('Fund');
    expect(newHolding.isin).toBeNull();
    expect(newHolding.cost_basis_gbp).toBeNull();
    expect(newHolding.acquisition_date).toBeNull();
    expect(newHolding.notes).toBeNull();
  });

  it('should update advanced fields correctly', async () => {
    const { useOnboardingV2Store } = await import('../client/src/state/onboardingV2Store');
    const store = useOnboardingV2Store.getState();

    store.addHolding();
    const holdings = useOnboardingV2Store.getState().holdings;
    const holdingId = holdings[holdings.length - 1].id;

    store.updateHolding(holdingId, {
      currency: 'USD',
      instrument_type: 'ETF',
      isin: 'US1234567890',
      cost_basis_gbp: 7500,
      acquisition_date: '2023-04-01',
      notes: 'Test notes',
    });

    const updatedHolding = useOnboardingV2Store.getState().holdings.find(h => h.id === holdingId);

    expect(updatedHolding?.currency).toBe('USD');
    expect(updatedHolding?.instrument_type).toBe('ETF');
    expect(updatedHolding?.isin).toBe('US1234567890');
    expect(updatedHolding?.cost_basis_gbp).toBe(7500);
    expect(updatedHolding?.acquisition_date).toBe('2023-04-01');
    expect(updatedHolding?.notes).toBe('Test notes');
  });

  it('should compute unrealized gain correctly for individual holding', async () => {
    const { useOnboardingV2Store } = await import('../client/src/state/onboardingV2Store');
    const store = useOnboardingV2Store.getState();

    store.setHoldings([
      {
        id: 'h1',
        instrument_name: 'Test Fund',
        ticker: 'TEST',
        wrapper: 'isa',
        asset_class: 'equity',
        region: 'uk',
        value_gbp: 10000,
        illiquid: false,
        currency: 'GBP',
        instrument_type: 'Fund',
        isin: null,
        cost_basis_gbp: 7500,
        acquisition_date: null,
        notes: null,
      },
    ]);

    const holdings = useOnboardingV2Store.getState().holdings;
    const holding = holdings[0];

    expect(holding.unrealised_gain_gbp).toBe(2500);
    expect(holding.unrealised_gain_pct).toBeCloseTo(33.33, 1);
  });

  it('should compute total unrealized gain in summary', async () => {
    const { useOnboardingV2Store } = await import('../client/src/state/onboardingV2Store');
    const store = useOnboardingV2Store.getState();

    store.setHoldings([
      {
        id: 'h1',
        instrument_name: 'Fund A',
        ticker: 'FUNDA',
        wrapper: 'isa',
        asset_class: 'equity',
        region: 'uk',
        value_gbp: 10000,
        illiquid: false,
        currency: 'GBP',
        instrument_type: 'Fund',
        isin: null,
        cost_basis_gbp: 7500,
        acquisition_date: null,
        notes: null,
      },
      {
        id: 'h2',
        instrument_name: 'Fund B',
        ticker: 'FUNDB',
        wrapper: 'gia',
        asset_class: 'equity',
        region: 'us',
        value_gbp: 5000,
        illiquid: false,
        currency: 'GBP',
        instrument_type: 'ETF',
        isin: null,
        cost_basis_gbp: 6000,
        acquisition_date: null,
        notes: null,
      },
      {
        id: 'h3',
        instrument_name: 'Fund C (no cost basis)',
        ticker: 'FUNDC',
        wrapper: 'sipp',
        asset_class: 'bond',
        region: 'global',
        value_gbp: 20000,
        illiquid: false,
        currency: 'GBP',
        instrument_type: 'Fund',
        isin: null,
        cost_basis_gbp: null,
        acquisition_date: null,
        notes: null,
      },
    ]);

    const summary = useOnboardingV2Store.getState().summary;

    // Fund A: 10000 - 7500 = +2500
    // Fund B: 5000 - 6000 = -1000
    // Total: 2500 - 1000 = 1500
    expect(summary.total_unrealised_gain_gbp).toBe(1500);
    expect(summary.holdings_with_cost_basis).toBe(2);
  });

  it('should not include holdings without cost basis in unrealized gain calculation', async () => {
    const { useOnboardingV2Store } = await import('../client/src/state/onboardingV2Store');
    const store = useOnboardingV2Store.getState();

    store.setHoldings([
      {
        id: 'h1',
        instrument_name: 'No Cost Basis',
        ticker: 'NCB',
        wrapper: 'isa',
        asset_class: 'equity',
        region: 'uk',
        value_gbp: 50000,
        illiquid: false,
        currency: 'GBP',
        instrument_type: 'Fund',
        isin: null,
        cost_basis_gbp: null,
        acquisition_date: null,
        notes: null,
      },
    ]);

    const summary = useOnboardingV2Store.getState().summary;
    const holding = useOnboardingV2Store.getState().holdings[0];

    expect(holding.unrealised_gain_gbp).toBeNull();
    expect(holding.unrealised_gain_pct).toBeNull();
    expect(summary.total_unrealised_gain_gbp).toBe(0);
    expect(summary.holdings_with_cost_basis).toBe(0);
  });
});

describe('Portfolio Breakdowns', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorageMock.clear();
  });

  const createHolding = (overrides: Partial<{
    id: string; instrument_name: string; ticker: string; wrapper: string;
    asset_class: string; region: string; value_gbp: number; illiquid: boolean;
  }>) => ({
    id: overrides.id || 'h1',
    instrument_name: overrides.instrument_name || '',
    ticker: overrides.ticker || '',
    wrapper: overrides.wrapper || '',
    asset_class: overrides.asset_class || '',
    region: overrides.region || '',
    value_gbp: overrides.value_gbp ?? 0,
    illiquid: overrides.illiquid ?? false,
    currency: 'GBP',
    instrument_type: 'Fund',
    isin: null,
    cost_basis_gbp: null,
    acquisition_date: null,
    notes: null,
  });

  it('should compute asset class breakdown correctly', async () => {
    const { computePortfolioBreakdowns } = await import('../client/src/state/onboardingV2Store');

    const holdings = [
      createHolding({ id: 'h1', instrument_name: 'UK Equity Fund', ticker: 'UKE', wrapper: 'ISA', asset_class: 'Equity', region: 'UK', value_gbp: 50000 }),
      createHolding({ id: 'h2', instrument_name: 'Property Fund', ticker: 'PROP', wrapper: 'GIA', asset_class: 'Property', region: 'UK', value_gbp: 30000, illiquid: true }),
      createHolding({ id: 'h3', instrument_name: 'Global Bonds', ticker: 'BOND', wrapper: 'SIPP', asset_class: 'Bond', region: 'Global', value_gbp: 20000 }),
    ];

    const breakdowns = computePortfolioBreakdowns(holdings);

    expect(breakdowns.total_value).toBe(100000);
    expect(breakdowns.by_asset_class.length).toBe(3);

    const equity = breakdowns.by_asset_class.find(a => a.name === 'Equity');
    expect(equity?.value_gbp).toBe(50000);
    expect(equity?.weight_pct).toBe(50);

    const property = breakdowns.by_asset_class.find(a => a.name === 'Property');
    expect(property?.value_gbp).toBe(30000);
    expect(property?.weight_pct).toBe(30);

    const bond = breakdowns.by_asset_class.find(a => a.name === 'Bond');
    expect(bond?.value_gbp).toBe(20000);
    expect(bond?.weight_pct).toBe(20);
  });

  it('should normalize case differences in asset class and wrapper', async () => {
    const { computePortfolioBreakdowns } = await import('../client/src/state/onboardingV2Store');

    const holdings = [
      createHolding({ id: 'h1', wrapper: 'ISA', asset_class: 'equity', value_gbp: 30000 }),
      createHolding({ id: 'h2', wrapper: 'isa', asset_class: 'EQUITY', value_gbp: 20000 }),
      createHolding({ id: 'h3', wrapper: 'Isa', asset_class: 'Equity', value_gbp: 10000 }),
    ];

    const breakdowns = computePortfolioBreakdowns(holdings);

    expect(breakdowns.by_asset_class.length).toBe(1);
    expect(breakdowns.by_asset_class[0].name).toBe('Equity');
    expect(breakdowns.by_asset_class[0].value_gbp).toBe(60000);

    expect(breakdowns.by_wrapper.length).toBe(1);
    expect(breakdowns.by_wrapper[0].name).toBe('ISA');
    expect(breakdowns.by_wrapper[0].value_gbp).toBe(60000);
  });

  it('should compute wrapper breakdown correctly', async () => {
    const { computePortfolioBreakdowns } = await import('../client/src/state/onboardingV2Store');

    const holdings = [
      createHolding({ id: 'h1', instrument_name: 'ISA Fund 1', wrapper: 'ISA', asset_class: 'Equity', value_gbp: 40000 }),
      createHolding({ id: 'h2', instrument_name: 'ISA Fund 2', wrapper: 'ISA', asset_class: 'Bond', value_gbp: 20000 }),
      createHolding({ id: 'h3', instrument_name: 'SIPP Fund', wrapper: 'SIPP', asset_class: 'Equity', value_gbp: 40000 }),
    ];

    const breakdowns = computePortfolioBreakdowns(holdings);

    expect(breakdowns.by_wrapper.length).toBe(2);

    const isa = breakdowns.by_wrapper.find(w => w.name === 'ISA');
    expect(isa?.value_gbp).toBe(60000);
    expect(isa?.weight_pct).toBe(60);

    const sipp = breakdowns.by_wrapper.find(w => w.name === 'SIPP');
    expect(sipp?.value_gbp).toBe(40000);
    expect(sipp?.weight_pct).toBe(40);
  });

  it('should return top 5 holdings sorted by value', async () => {
    const { computePortfolioBreakdowns } = await import('../client/src/state/onboardingV2Store');

    const holdings = Array.from({ length: 7 }, (_, i) => createHolding({
      id: `h${i + 1}`,
      instrument_name: `Fund ${i + 1}`,
      ticker: `F${i + 1}`,
      wrapper: 'ISA',
      asset_class: 'Equity',
      region: 'UK',
      value_gbp: (7 - i) * 10000,
      illiquid: i === 2,
    }));

    const breakdowns = computePortfolioBreakdowns(holdings);

    expect(breakdowns.top_holdings.length).toBe(5);
    expect(breakdowns.top_holdings[0].value_gbp).toBe(70000);
    expect(breakdowns.top_holdings[0].name).toBe('Fund 1');
    expect(breakdowns.top_holdings[4].value_gbp).toBe(30000);
    expect(breakdowns.top_holdings[4].name).toBe('Fund 5');

    const illiquidHolding = breakdowns.top_holdings.find(h => h.name === 'Fund 3');
    expect(illiquidHolding?.illiquid).toBe(true);
  });

  it('should handle empty holdings gracefully', async () => {
    const { computePortfolioBreakdowns } = await import('../client/src/state/onboardingV2Store');

    const breakdowns = computePortfolioBreakdowns([]);

    expect(breakdowns.total_value).toBe(0);
    expect(breakdowns.by_asset_class).toEqual([]);
    expect(breakdowns.by_wrapper).toEqual([]);
    expect(breakdowns.top_holdings).toEqual([]);
  });

  it('should handle holdings with zero value', async () => {
    const { computePortfolioBreakdowns } = await import('../client/src/state/onboardingV2Store');

    const holdings = [
      createHolding({ id: 'h1', instrument_name: 'Valid Fund', wrapper: 'ISA', asset_class: 'Equity', value_gbp: 10000 }),
      createHolding({ id: 'h2', instrument_name: 'Zero Value Fund', wrapper: 'ISA', asset_class: 'Equity', value_gbp: 0 }),
    ];

    const breakdowns = computePortfolioBreakdowns(holdings);

    expect(breakdowns.total_value).toBe(10000);
    expect(breakdowns.by_asset_class.length).toBe(1);
    expect(breakdowns.top_holdings.length).toBe(1);
  });

  it('should use "Other" for missing asset class or wrapper', async () => {
    const { computePortfolioBreakdowns } = await import('../client/src/state/onboardingV2Store');

    const holdings = [
      createHolding({ id: 'h1', instrument_name: 'Mystery Fund', wrapper: '', asset_class: '', region: '', value_gbp: 10000 }),
    ];

    const breakdowns = computePortfolioBreakdowns(holdings);

    expect(breakdowns.by_asset_class[0].name).toBe('Other');
    expect(breakdowns.by_wrapper[0].name).toBe('Other');
    expect(breakdowns.top_holdings[0].asset_class).toBe('Other');
    expect(breakdowns.top_holdings[0].wrapper).toBe('Other');
  });

  it('should calculate weight percentages that sum to 100%', async () => {
    const { computePortfolioBreakdowns } = await import('../client/src/state/onboardingV2Store');

    const holdings = [
      createHolding({ id: 'h1', wrapper: 'ISA', asset_class: 'Equity', value_gbp: 33333 }),
      createHolding({ id: 'h2', wrapper: 'SIPP', asset_class: 'Bond', value_gbp: 33333 }),
      createHolding({ id: 'h3', wrapper: 'GIA', asset_class: 'Property', value_gbp: 33334 }),
    ];

    const breakdowns = computePortfolioBreakdowns(holdings);

    const assetClassTotal = breakdowns.by_asset_class.reduce((sum, a) => sum + a.weight_pct, 0);
    const wrapperTotal = breakdowns.by_wrapper.reduce((sum, w) => sum + w.weight_pct, 0);

    expect(assetClassTotal).toBeCloseTo(100, 1);
    expect(wrapperTotal).toBeCloseTo(100, 1);
  });
});

/**
 * ALTERNATIVES_FOCUSED Persona Test Fixture
 * 
 * QA fixture for regression testing the ALTERNATIVES_FOCUSED persona assignment.
 * This fixture documents the expected behavior for alternatives-dominant portfolios.
 */
describe('Persona Engine - ALTERNATIVES_FOCUSED Fixture', () => {
  /**
   * Test Fixture: Alternatives-Dominant Profile
   * 
   * Inputs:
   * - portfolio_stage: ACCUMULATING
   * - adviser_usage: SELF_DIRECTED  
   * - time_horizon: 10+ years (long)
   * - risk_comfort: high
   * - alts_pct: 35% (alternatives dominance)
   * - crypto_alloc_band: GT_25 (>25% crypto)
   * 
   * Expected persona code: ALTERNATIVES_FOCUSED
   * 
   * Trigger rule: crypto_alloc_band === 'GT_25' (>25% crypto from questionnaire)
   */
  const ALTERNATIVES_FOCUSED_FIXTURE = {
    profile: {
      age_band: '25_34' as const,
      portfolio_stage: 'ACCUMULATING' as const,
      primary_goal: 'growth',
      time_horizon: '10_plus',
      risk_comfort: 'high',
      total_portfolio_value_gbp: 200000,
      cash_runway_months: 4,
      largest_line_pct: 0.25,
      illiquid_pct: 0.10,
      asset_class_breakdown: {
        equity_pct: 0.40,
        bond_pct: 0.05,
        property_pct: 0.10,
        cash_pct: 0.10,
        alts_pct: 0.35,
        crypto_pct: 0.30,
      },
      liquidity_status: 'AMBER' as const,
      concentration_status: 'AMBER' as const,
      illiquids_status: 'GREEN' as const,
      personaCues: {
        age_band: '25_34' as const,
        portfolio_stage: 'ACCUMULATING' as const,
        investing_focus: ['CRYPTO' as const],
        has_defined_benefit_pension: false,
        db_income_coverage_band: null,
        owns_business: false,
        private_business_wealth_band: null,
        has_employer_stock: false,
        employer_stock_alloc_band: null,
        has_crypto: true,
        crypto_alloc_band: 'GT_25' as const,
        adviser_usage: 'SELF_DIRECTED' as const,
        is_cross_border: false,
      },
    },
    expected_persona_code: 'ALTERNATIVES_FOCUSED',
    expected_label: 'Alternatives Focused',
  };

  it('should assign ALTERNATIVES_FOCUSED persona for alternatives-dominant profile', async () => {
    const { computePersona } = await import('../server/services/personaEngine');
    
    const result = computePersona(ALTERNATIVES_FOCUSED_FIXTURE.profile);
    
    expect(result.code).toBe(ALTERNATIVES_FOCUSED_FIXTURE.expected_persona_code);
    expect(result.label).toBe(ALTERNATIVES_FOCUSED_FIXTURE.expected_label);
  });

  it('should NOT assign ALTERNATIVES_FOCUSED when alternatives exposure is low', async () => {
    const { computePersona } = await import('../server/services/personaEngine');
    
    const lowAltsProfile = {
      ...ALTERNATIVES_FOCUSED_FIXTURE.profile,
      asset_class_breakdown: {
        ...ALTERNATIVES_FOCUSED_FIXTURE.profile.asset_class_breakdown,
        alts_pct: 0.10,
        crypto_pct: 0.05,
        equity_pct: 0.65,
      },
      personaCues: {
        ...ALTERNATIVES_FOCUSED_FIXTURE.profile.personaCues,
        has_crypto: false,
        crypto_alloc_band: null,
        investing_focus: [],
      },
    };
    
    const result = computePersona(lowAltsProfile);
    
    expect(result.code).not.toBe('ALTERNATIVES_FOCUSED');
    expect(result.code).toBe('SELF_DIRECTED_GROWTH');
  });

  it('should include valid T1-T6 traits for ALTERNATIVES_FOCUSED persona', async () => {
    const { computePersona } = await import('../server/services/personaEngine');
    
    const result = computePersona(ALTERNATIVES_FOCUSED_FIXTURE.profile);
    
    // Verify all 6 traits are present and in valid range
    expect(result.traits).toBeDefined();
    expect(result.traits.risk_appetite).toBeGreaterThanOrEqual(0);
    expect(result.traits.risk_appetite).toBeLessThanOrEqual(1);
    expect(result.traits.alternatives_bias).toBeGreaterThanOrEqual(0);
    expect(result.traits.alternatives_bias).toBeLessThanOrEqual(1);
    expect(result.traits.property_bias).toBeGreaterThanOrEqual(0);
    expect(result.traits.property_bias).toBeLessThanOrEqual(1);
    expect(result.traits.liquidity_comfort).toBeGreaterThanOrEqual(0);
    expect(result.traits.liquidity_comfort).toBeLessThanOrEqual(1);
    expect(result.traits.income_orientation).toBeGreaterThanOrEqual(0);
    expect(result.traits.income_orientation).toBeLessThanOrEqual(1);
    expect(result.traits.complexity_proxy).toBeGreaterThanOrEqual(0);
    expect(result.traits.complexity_proxy).toBeLessThanOrEqual(1);
    
    // ALTERNATIVES_FOCUSED should have high alternatives_bias
    expect(result.traits.alternatives_bias).toBeGreaterThan(0.5);
  });

  it('should include 2-3 why_fits_bullets for ALTERNATIVES_FOCUSED persona', async () => {
    const { computePersona } = await import('../server/services/personaEngine');
    
    const result = computePersona(ALTERNATIVES_FOCUSED_FIXTURE.profile);
    
    expect(result.why_fits_bullets).toBeDefined();
    expect(result.why_fits_bullets.length).toBeGreaterThanOrEqual(2);
    expect(result.why_fits_bullets.length).toBeLessThanOrEqual(3);
    
    // Should reference crypto allocation since that's the trigger
    const hasCryptoRef = result.why_fits_bullets.some(b => 
      b.toLowerCase().includes('crypto') || b.toLowerCase().includes('25%')
    );
    expect(hasCryptoRef).toBe(true);
  });
});

/**
 * SELF_DIRECTED_GROWTH Persona Test Fixture
 * 
 * QA fixture for regression testing the SELF_DIRECTED_GROWTH persona assignment.
 * Validates trait scoring and why_fits_bullets generation.
 */
describe('Persona Engine - SELF_DIRECTED_GROWTH Fixture', () => {
  /**
   * Test Fixture: Self-Directed Growth Profile
   * 
   * Inputs:
   * - portfolio_stage: ACCUMULATING
   * - adviser_usage: SELF_DIRECTED
   * - time_horizon: 10+ years (long)
   * - risk_comfort: moderate/high
   * - equity allocation: 70%
   * 
   * Expected persona code: SELF_DIRECTED_GROWTH
   * 
   * Trigger rule: self-directed + accumulating + long horizon + moderate/high risk
   */
  const SELF_DIRECTED_GROWTH_FIXTURE = {
    profile: {
      age_band: '35_44' as const,
      portfolio_stage: 'ACCUMULATING' as const,
      primary_goal: 'growth',
      time_horizon: '10_plus',
      risk_comfort: 'high',
      total_portfolio_value_gbp: 250000,
      cash_runway_months: 8,
      largest_line_pct: 0.12,
      illiquid_pct: 0.05,
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
        investing_focus: ['FUNDS_ETFS' as const, 'INDIVIDUAL_SHARES' as const],
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
    },
    expected_persona_code: 'SELF_DIRECTED_GROWTH',
    expected_label: 'Self-Directed Growth Investor',
  };

  it('should assign SELF_DIRECTED_GROWTH persona for self-directed accumulator', async () => {
    const { computePersona } = await import('../server/services/personaEngine');
    
    const result = computePersona(SELF_DIRECTED_GROWTH_FIXTURE.profile);
    
    expect(result.code).toBe(SELF_DIRECTED_GROWTH_FIXTURE.expected_persona_code);
    expect(result.label).toBe(SELF_DIRECTED_GROWTH_FIXTURE.expected_label);
  });

  it('should include valid T1-T6 traits for SELF_DIRECTED_GROWTH persona', async () => {
    const { computePersona } = await import('../server/services/personaEngine');
    
    const result = computePersona(SELF_DIRECTED_GROWTH_FIXTURE.profile);
    
    // Verify all 6 traits are present and in valid range
    expect(result.traits).toBeDefined();
    expect(result.traits.risk_appetite).toBeGreaterThanOrEqual(0);
    expect(result.traits.risk_appetite).toBeLessThanOrEqual(1);
    expect(result.traits.alternatives_bias).toBeGreaterThanOrEqual(0);
    expect(result.traits.alternatives_bias).toBeLessThanOrEqual(1);
    expect(result.traits.property_bias).toBeGreaterThanOrEqual(0);
    expect(result.traits.property_bias).toBeLessThanOrEqual(1);
    expect(result.traits.liquidity_comfort).toBeGreaterThanOrEqual(0);
    expect(result.traits.liquidity_comfort).toBeLessThanOrEqual(1);
    expect(result.traits.income_orientation).toBeGreaterThanOrEqual(0);
    expect(result.traits.income_orientation).toBeLessThanOrEqual(1);
    expect(result.traits.complexity_proxy).toBeGreaterThanOrEqual(0);
    expect(result.traits.complexity_proxy).toBeLessThanOrEqual(1);
    
    // SELF_DIRECTED_GROWTH should have high risk_appetite (long horizon, high equity)
    expect(result.traits.risk_appetite).toBeGreaterThan(0.4);
    // Should have low income_orientation (accumulating)
    expect(result.traits.income_orientation).toBeLessThan(0.3);
  });

  it('should include 2-3 why_fits_bullets for SELF_DIRECTED_GROWTH persona', async () => {
    const { computePersona } = await import('../server/services/personaEngine');
    
    const result = computePersona(SELF_DIRECTED_GROWTH_FIXTURE.profile);
    
    expect(result.why_fits_bullets).toBeDefined();
    expect(result.why_fits_bullets.length).toBeGreaterThanOrEqual(2);
    expect(result.why_fits_bullets.length).toBeLessThanOrEqual(3);
    
    // Should reference self-directed since that's a key trigger
    const hasSelfDirectedRef = result.why_fits_bullets.some(b => 
      b.toLowerCase().includes('self') || b.toLowerCase().includes('adviser') || b.toLowerCase().includes('without')
    );
    expect(hasSelfDirectedRef).toBe(true);
  });
});

/**
 * CAPITAL_PRESERVATION Persona Test Fixture
 * 
 * QA fixture for regression testing the CAPITAL_PRESERVATION persona assignment.
 * Validates trait scoring and why_fits_bullets generation.
 */
describe('Persona Engine - CAPITAL_PRESERVATION Fixture', () => {
  /**
   * Test Fixture: Capital Preservation Profile
   * 
   * Inputs:
   * - portfolio_stage: STARTING_DRAWDOWN (NOT PRIMARILY_DRAWDOWN to avoid INCOME_STABILITY)
   * - primary_goal: 'growth' (NOT 'income' to avoid INCOME_STABILITY)
   * - risk_comfort: low
   * - time_horizon: '10_plus' (long horizon to avoid income-focused triggers)
   * - cash_runway_months: 18+ (high)
   * - cash_pct: 25%
   * 
   * Expected persona code: CAPITAL_PRESERVATION
   * 
   * Trigger rule: low risk + high cash/runway + not accumulating + not income-focused
   */
  const CAPITAL_PRESERVATION_FIXTURE = {
    profile: {
      age_band: '55_64' as const,
      portfolio_stage: 'STARTING_DRAWDOWN' as const,
      primary_goal: 'growth',
      time_horizon: '10_plus',
      risk_comfort: 'low',
      total_portfolio_value_gbp: 1200000,
      cash_runway_months: 18,
      largest_line_pct: 0.08,
      illiquid_pct: 0.02,
      asset_class_breakdown: {
        equity_pct: 0.30,
        bond_pct: 0.35,
        property_pct: 0.10,
        cash_pct: 0.25,
        alts_pct: 0.00,
        crypto_pct: 0.00,
      },
      liquidity_status: 'GREEN' as const,
      concentration_status: 'GREEN' as const,
      illiquids_status: 'GREEN' as const,
      personaCues: {
        age_band: '55_64' as const,
        portfolio_stage: 'STARTING_DRAWDOWN' as const,
        investing_focus: ['FUNDS_ETFS' as const],
        has_defined_benefit_pension: false,
        db_income_coverage_band: null,
        owns_business: false,
        private_business_wealth_band: null,
        has_employer_stock: false,
        employer_stock_alloc_band: null,
        has_crypto: false,
        crypto_alloc_band: null,
        adviser_usage: 'SOMETIMES_ADVISED' as const,
        is_cross_border: false,
      },
    },
    expected_persona_code: 'CAPITAL_PRESERVATION',
    expected_label: 'Capital Preservation Investor',
  };

  it('should assign CAPITAL_PRESERVATION persona for low-risk, high-cash profile', async () => {
    const { computePersona } = await import('../server/services/personaEngine');
    
    const result = computePersona(CAPITAL_PRESERVATION_FIXTURE.profile);
    
    expect(result.code).toBe(CAPITAL_PRESERVATION_FIXTURE.expected_persona_code);
    expect(result.label).toBe(CAPITAL_PRESERVATION_FIXTURE.expected_label);
  });

  it('should include valid T1-T6 traits for CAPITAL_PRESERVATION persona', async () => {
    const { computePersona } = await import('../server/services/personaEngine');
    
    const result = computePersona(CAPITAL_PRESERVATION_FIXTURE.profile);
    
    // Verify all 6 traits are present and in valid range
    expect(result.traits).toBeDefined();
    expect(result.traits.risk_appetite).toBeGreaterThanOrEqual(0);
    expect(result.traits.risk_appetite).toBeLessThanOrEqual(1);
    expect(result.traits.alternatives_bias).toBeGreaterThanOrEqual(0);
    expect(result.traits.alternatives_bias).toBeLessThanOrEqual(1);
    expect(result.traits.property_bias).toBeGreaterThanOrEqual(0);
    expect(result.traits.property_bias).toBeLessThanOrEqual(1);
    expect(result.traits.liquidity_comfort).toBeGreaterThanOrEqual(0);
    expect(result.traits.liquidity_comfort).toBeLessThanOrEqual(1);
    expect(result.traits.income_orientation).toBeGreaterThanOrEqual(0);
    expect(result.traits.income_orientation).toBeLessThanOrEqual(1);
    expect(result.traits.complexity_proxy).toBeGreaterThanOrEqual(0);
    expect(result.traits.complexity_proxy).toBeLessThanOrEqual(1);
    
    // CAPITAL_PRESERVATION should have low risk_appetite
    expect(result.traits.risk_appetite).toBeLessThan(0.5);
    // Should have high liquidity_comfort (18 months runway, 25% cash)
    expect(result.traits.liquidity_comfort).toBeGreaterThan(0.5);
  });

  it('should include 2-3 why_fits_bullets for CAPITAL_PRESERVATION persona', async () => {
    const { computePersona } = await import('../server/services/personaEngine');
    
    const result = computePersona(CAPITAL_PRESERVATION_FIXTURE.profile);
    
    expect(result.why_fits_bullets).toBeDefined();
    expect(result.why_fits_bullets.length).toBeGreaterThanOrEqual(2);
    expect(result.why_fits_bullets.length).toBeLessThanOrEqual(3);
  });

  it('should include match_score and match_confidence for CAPITAL_PRESERVATION persona', async () => {
    const { computePersona } = await import('../server/services/personaEngine');
    
    const result = computePersona(CAPITAL_PRESERVATION_FIXTURE.profile);
    
    expect(result.match_score).toBeDefined();
    expect(result.match_score).toBeGreaterThanOrEqual(0);
    expect(result.match_score).toBeLessThanOrEqual(1);
    expect(result.match_confidence).toBeDefined();
    expect(result.match_confidence).toBeGreaterThanOrEqual(0);
    expect(result.match_confidence).toBeLessThanOrEqual(1);
  });
});

/**
 * CORE_GROWTH Persona Test Fixture
 * 
 * CORE_GROWTH represents advised accumulators with growth focus and moderate risk.
 * Key differentiators from SELF_DIRECTED_GROWTH:
 * - adviser_usage=FULL_SERVICE_ADVISER (no self-directed boost to risk_appetite)
 * - Moderate complexity (DB pension only, not enough to trigger FOUNDER at 60% weight)
 * CORE_GROWTH weight: risk=0.35, complexity=0.30 vs SELF_DIRECTED: risk=0.50, complexity=0.20
 */
describe('Persona Engine - CORE_GROWTH Fixture', () => {
  // Target corridor: risk 0.34, liquidity 0.40, complexity 0.42, alts 0.05
  // Key differentiators: FULL_SERVICE_ADVISER + higher complexity + moderate risk + moderate liquidity
  const CORE_GROWTH_FIXTURE = {
    profile: {
      age_band: '35_44' as const,
      portfolio_stage: 'ACCUMULATING' as const,
      primary_goal: 'growth',
      time_horizon: '10_plus',
      risk_comfort: 'high',
      total_portfolio_value_gbp: 800000,
      cash_runway_months: 7,
      largest_line_pct: 0.10,
      illiquid_pct: 0.05,
      asset_class_breakdown: {
        equity_pct: 0.55,
        bond_pct: 0.25,
        property_pct: 0.06,
        cash_pct: 0.09,
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
        has_defined_benefit_pension: true,
        db_income_coverage_band: '50_75' as const,
        owns_business: false,
        private_business_wealth_band: null,
        has_employer_stock: true,
        employer_stock_alloc_band: '5_10' as const,
        has_crypto: false,
        crypto_alloc_band: null,
        adviser_usage: 'FULL_SERVICE_ADVISER' as const,
        is_cross_border: false,
      },
    },
    expected_persona_code: 'CORE_GROWTH',
    expected_label: 'Core Growth Investor',
  };

  it('should assign CORE_GROWTH persona for advised accumulator with growth focus', async () => {
    const { computePersona } = await import('../server/services/personaEngine');
    
    const result = computePersona(CORE_GROWTH_FIXTURE.profile);
    
    expect(result.code).toBe(CORE_GROWTH_FIXTURE.expected_persona_code);
    expect(result.label).toBe(CORE_GROWTH_FIXTURE.expected_label);
    expect(result.match_score).toBeGreaterThanOrEqual(0);
    expect(result.match_confidence).toBeGreaterThanOrEqual(0);
  });
});

/**
 * BALANCED_ALLOCATOR Persona Test Fixture
 * 
 * BALANCED_ALLOCATOR (weights: risk=0.23, liquidity=0.30, income=0.12, complexity=0.25)
 * Key differentiators:
 * - Higher liquidity emphasis than CORE_GROWTH (0.30 vs 0.12)
 * - Lower income emphasis than CAPITAL_PRESERVATION (0.12 vs 0.37)
 * 
 * Architect-derived corridor: risk 0.26-0.30, liquidity 0.46-0.52, income 0.18-0.22, complexity 0.36-0.40
 * Fixture design: 9+ month runway for high liquidity, moderate risk comfort
 */
describe('Persona Engine - BALANCED_ALLOCATOR Fixture', () => {
  // Profile: moderate risk, high liquidity (9+ months runway), moderate complexity
  const BALANCED_ALLOCATOR_FIXTURE = {
    profile: {
      age_band: '45_54' as const,
      portfolio_stage: 'ACCUMULATING' as const,
      primary_goal: 'balance',
      time_horizon: '5_9',
      risk_comfort: 'moderate',
      total_portfolio_value_gbp: 450000,
      cash_runway_months: 9,
      largest_line_pct: 0.08,
      illiquid_pct: 0.05,
      asset_class_breakdown: {
        equity_pct: 0.28,
        bond_pct: 0.42,
        property_pct: 0.08,
        cash_pct: 0.14,
        alts_pct: 0.08,
        crypto_pct: 0.00,
      },
      liquidity_status: 'GREEN' as const,
      concentration_status: 'GREEN' as const,
      illiquids_status: 'GREEN' as const,
      personaCues: {
        age_band: '45_54' as const,
        portfolio_stage: 'ACCUMULATING' as const,
        investing_focus: ['FUNDS_ETFS' as const],
        has_defined_benefit_pension: true,
        db_income_coverage_band: '25_50' as const,
        owns_business: false,
        private_business_wealth_band: null,
        has_employer_stock: false,
        employer_stock_alloc_band: null,
        has_crypto: false,
        crypto_alloc_band: null,
        adviser_usage: 'SOMETIMES_ADVISED' as const,
        is_cross_border: false,
      },
    },
    expected_persona_code: 'BALANCED_ALLOCATOR',
    expected_label: 'Balanced Allocator',
  };

  it('should assign BALANCED_ALLOCATOR persona for balanced profile with moderate traits', async () => {
    const { computePersona } = await import('../server/services/personaEngine');
    
    const result = computePersona(BALANCED_ALLOCATOR_FIXTURE.profile);
    
    expect(result.code).toBe(BALANCED_ALLOCATOR_FIXTURE.expected_persona_code);
    expect(result.label).toBe(BALANCED_ALLOCATOR_FIXTURE.expected_label);
    expect(result.match_score).toBeGreaterThanOrEqual(0);
    expect(result.match_confidence).toBeGreaterThanOrEqual(0);
  });
});

/**
 * INCOME_STABILITY Persona Test Fixture
 * 
 * QA fixture for weighted matching when profile is income/drawdown focused.
 */
describe('Persona Engine - INCOME_STABILITY Fixture', () => {
  const INCOME_STABILITY_FIXTURE = {
    profile: {
      age_band: '65_plus' as const,
      portfolio_stage: 'PRIMARILY_DRAWDOWN' as const,
      primary_goal: 'income',
      time_horizon: '5_10',
      risk_comfort: 'low',
      total_portfolio_value_gbp: 900000,
      cash_runway_months: 24,
      largest_line_pct: 0.05,
      illiquid_pct: 0.02,
      asset_class_breakdown: {
        equity_pct: 0.25,
        bond_pct: 0.40,
        property_pct: 0.05,
        cash_pct: 0.30,
        alts_pct: 0.00,
        crypto_pct: 0.00,
      },
      liquidity_status: 'GREEN' as const,
      concentration_status: 'GREEN' as const,
      illiquids_status: 'GREEN' as const,
      personaCues: {
        age_band: '65_plus' as const,
        portfolio_stage: 'PRIMARILY_DRAWDOWN' as const,
        investing_focus: ['FUNDS_ETFS' as const],
        has_defined_benefit_pension: true,
        db_income_coverage_band: '50_75' as const,
        owns_business: false,
        private_business_wealth_band: null,
        has_employer_stock: false,
        employer_stock_alloc_band: null,
        has_crypto: false,
        crypto_alloc_band: null,
        adviser_usage: 'FULL_SERVICE_ADVISER' as const,
        is_cross_border: false,
      },
    },
    expected_persona_code: 'INCOME_STABILITY',
    expected_label: 'Income & Stability Investor',
  };

  it('should assign INCOME_STABILITY persona for drawdown-focused profile', async () => {
    const { computePersona } = await import('../server/services/personaEngine');
    
    const result = computePersona(INCOME_STABILITY_FIXTURE.profile);
    
    expect(result.code).toBe(INCOME_STABILITY_FIXTURE.expected_persona_code);
    expect(result.label).toBe(INCOME_STABILITY_FIXTURE.expected_label);
    expect(result.match_score).toBeGreaterThanOrEqual(0);
    expect(result.match_confidence).toBeGreaterThanOrEqual(0);
  });
});

/**
 * FOUNDER_ENTREPRENEUR Persona Test Fixture (HARD OVERRIDE)
 * 
 * QA fixture for hard override when business wealth dominance >= 25%.
 */
describe('Persona Engine - FOUNDER_ENTREPRENEUR Fixture', () => {
  const FOUNDER_ENTREPRENEUR_FIXTURE = {
    profile: {
      age_band: '45_54' as const,
      portfolio_stage: 'ACCUMULATING' as const,
      primary_goal: 'growth',
      time_horizon: '10_plus',
      risk_comfort: 'high',
      total_portfolio_value_gbp: 2000000,
      cash_runway_months: 6,
      largest_line_pct: 0.35,
      illiquid_pct: 0.40,
      asset_class_breakdown: {
        equity_pct: 0.30,
        bond_pct: 0.05,
        property_pct: 0.10,
        cash_pct: 0.10,
        alts_pct: 0.05,
        crypto_pct: 0.00,
      },
      liquidity_status: 'AMBER' as const,
      concentration_status: 'AMBER' as const,
      illiquids_status: 'AMBER' as const,
      personaCues: {
        age_band: '45_54' as const,
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
    },
    expected_persona_code: 'FOUNDER_ENTREPRENEUR',
    expected_label: 'Founder / Entrepreneur',
  };

  it('should assign FOUNDER_ENTREPRENEUR persona via hard override for business dominance', async () => {
    const { computePersona } = await import('../server/services/personaEngine');
    
    const result = computePersona(FOUNDER_ENTREPRENEUR_FIXTURE.profile);
    
    expect(result.code).toBe(FOUNDER_ENTREPRENEUR_FIXTURE.expected_persona_code);
    expect(result.label).toBe(FOUNDER_ENTREPRENEUR_FIXTURE.expected_label);
    // Hard override should have match_score and confidence of 1.0
    expect(result.match_score).toBe(1.0);
    expect(result.match_confidence).toBe(1.0);
  });
});

/**
 * PROPERTY_LED Persona Test Fixture (HARD OVERRIDE)
 * 
 * QA fixture for hard override when property_pct >= 30%.
 */
describe('Persona Engine - PROPERTY_LED Fixture', () => {
  const PROPERTY_LED_FIXTURE = {
    profile: {
      age_band: '55_64' as const,
      portfolio_stage: 'STARTING_DRAWDOWN' as const,
      primary_goal: 'income',
      time_horizon: '5_10',
      risk_comfort: 'moderate',
      total_portfolio_value_gbp: 1500000,
      cash_runway_months: 12,
      largest_line_pct: 0.25,
      illiquid_pct: 0.35,
      asset_class_breakdown: {
        equity_pct: 0.25,
        bond_pct: 0.10,
        property_pct: 0.35,
        cash_pct: 0.15,
        alts_pct: 0.15,
        crypto_pct: 0.00,
      },
      liquidity_status: 'GREEN' as const,
      concentration_status: 'AMBER' as const,
      illiquids_status: 'AMBER' as const,
      personaCues: {
        age_band: '55_64' as const,
        portfolio_stage: 'STARTING_DRAWDOWN' as const,
        investing_focus: ['PROPERTY_BTL' as const],
        has_defined_benefit_pension: false,
        db_income_coverage_band: null,
        owns_business: false,
        private_business_wealth_band: null,
        has_employer_stock: false,
        employer_stock_alloc_band: null,
        has_crypto: false,
        crypto_alloc_band: null,
        adviser_usage: 'SOMETIMES_ADVISED' as const,
        is_cross_border: false,
      },
    },
    expected_persona_code: 'PROPERTY_LED',
    expected_label: 'Property-Led Investor',
  };

  it('should assign PROPERTY_LED persona via hard override for property dominance', async () => {
    const { computePersona } = await import('../server/services/personaEngine');
    
    const result = computePersona(PROPERTY_LED_FIXTURE.profile);
    
    expect(result.code).toBe(PROPERTY_LED_FIXTURE.expected_persona_code);
    expect(result.label).toBe(PROPERTY_LED_FIXTURE.expected_label);
    // Hard override should have match_score and confidence of 1.0
    expect(result.match_score).toBe(1.0);
    expect(result.match_confidence).toBe(1.0);
  });
});

/**
 * Direction Boundary Tests
 * 
 * Verifies computeDirection() uses exclusive thresholds per spec:
 * - Exactly ±0.20 → NEUTRAL
 * - > +0.20 → TOWARDS
 * - < -0.20 → AWAY
 */
describe('computeDirection boundary cases', () => {
  it('should return NEUTRAL at exactly +0.20 boundary', async () => {
    const { computeDirection } = await import('../client/src/state/onboardingV2Store');
    expect(computeDirection(0.20)).toBe('NEUTRAL');
  });

  it('should return NEUTRAL at exactly -0.20 boundary', async () => {
    const { computeDirection } = await import('../client/src/state/onboardingV2Store');
    expect(computeDirection(-0.20)).toBe('NEUTRAL');
  });

  it('should return TOWARDS just above +0.20', async () => {
    const { computeDirection } = await import('../client/src/state/onboardingV2Store');
    expect(computeDirection(0.21)).toBe('TOWARDS');
  });

  it('should return AWAY just below -0.20', async () => {
    const { computeDirection } = await import('../client/src/state/onboardingV2Store');
    expect(computeDirection(-0.21)).toBe('AWAY');
  });
});

/**
 * Step 7 Scenario Range Tests
 * 
 * Verifies MIN_RANGE_WIDTH_PP (2.0) is applied correctly:
 * - GUARDRAIL_FIRST and PREFERENCE_LEANING: ranges are at least 2pp wide
 * - NEUTRAL_BASELINE: unchanged (uses ±2pp = 4pp total width, always meets minimum)
 * - Extreme pressure cases: no artificial widening if range already exceeds minimum
 */
describe('Step 7 Scenario Range - Minimum Width', () => {
  const MIN_RANGE_WIDTH_PP = 2.0;
  
  const setupStoreForScenarios = async () => {
    const { useOnboardingV2Store } = await import('../client/src/state/onboardingV2Store');
    const store = useOnboardingV2Store.getState();
    
    store.setHoldings([
      { id: '1', name: 'Equity Fund', ticker: 'EQ1', value_gbp: 50000, asset_class: 'Equity', region: 'UK', wrapper: 'ISA', is_liquid: true, is_illiquid: false },
      { id: '2', name: 'Cash', ticker: 'CASH', value_gbp: 50000, asset_class: 'Cash', region: 'UK', wrapper: 'ISA', is_liquid: true, is_illiquid: false },
    ]);
    
    store.updateIntake({
      age_band: '35_44',
      portfolio_stage: 'ACCUMULATING',
      monthly_spending_gbp: 2000,
    });
    
    store.setAnalysisResult({
      safety_lights: {
        liquidity: 'GREEN',
        concentration: 'GREEN',
        illiquids: 'GREEN',
        overall_status: 'ALL_CLEAR',
        metrics: {
          cash_runway_months: 25,
          largest_line_pct: 0.5,
          illiquid_pct: 0,
        },
      },
    });
    
    return { useOnboardingV2Store, store };
  };
  
  it('should ensure GUARDRAIL_FIRST range is at least MIN_RANGE_WIDTH_PP wide for tiny pressure', async () => {
    const { useOnboardingV2Store, store } = await setupStoreForScenarios();
    
    store.setBeliefResponse('Q_QUALITY', 3);
    store.setBeliefResponse('Q_VALUE', 3);
    store.setBeliefResponse('Q_TECH', 3);
    store.setBeliefResponse('Q_SMALL_CAP', 3);
    store.setBeliefResponse('Q_ESG', 3);
    store.setBeliefResponse('Q_INFLATION', 3);
    store.setBeliefResponse('Q_VOLATILITY_COMFORT', 3);
    store.setBeliefResponse('Q_UK_BIAS', 3);
    store.computeBeliefsScores();
    store.computeScenarios();
    
    const scenario = useOnboardingV2Store.getState().scenario;
    const guardrailFirst = scenario.scenarios.find(s => s.scenario_type === 'GUARDRAIL_FIRST');
    
    expect(guardrailFirst).toBeDefined();
    guardrailFirst!.asset_class_bands.forEach(band => {
      const width = band.illustrative_high_pct - band.illustrative_low_pct;
      expect(width).toBeGreaterThanOrEqual(MIN_RANGE_WIDTH_PP);
    });
  });
  
  it('should ensure PREFERENCE_LEANING range is at least MIN_RANGE_WIDTH_PP wide for tiny pressure', async () => {
    const { useOnboardingV2Store, store } = await setupStoreForScenarios();
    
    store.setBeliefResponse('Q_QUALITY', 3);
    store.setBeliefResponse('Q_VALUE', 3);
    store.setBeliefResponse('Q_TECH', 3);
    store.setBeliefResponse('Q_SMALL_CAP', 3);
    store.setBeliefResponse('Q_ESG', 3);
    store.setBeliefResponse('Q_INFLATION', 3);
    store.setBeliefResponse('Q_VOLATILITY_COMFORT', 3);
    store.setBeliefResponse('Q_UK_BIAS', 3);
    store.computeBeliefsScores();
    store.computeScenarios();
    
    const scenario = useOnboardingV2Store.getState().scenario;
    const preferenceLeaning = scenario.scenarios.find(s => s.scenario_type === 'PREFERENCE_LEANING');
    
    expect(preferenceLeaning).toBeDefined();
    preferenceLeaning!.asset_class_bands.forEach(band => {
      const width = band.illustrative_high_pct - band.illustrative_low_pct;
      expect(width).toBeGreaterThanOrEqual(MIN_RANGE_WIDTH_PP);
    });
  });
  
  it('should not artificially widen NEUTRAL_BASELINE range (already ±2pp = 4pp total)', async () => {
    const { useOnboardingV2Store, store } = await setupStoreForScenarios();
    
    store.setBeliefResponse('Q_QUALITY', 3);
    store.setBeliefResponse('Q_VALUE', 3);
    store.setBeliefResponse('Q_TECH', 3);
    store.setBeliefResponse('Q_SMALL_CAP', 3);
    store.setBeliefResponse('Q_ESG', 3);
    store.setBeliefResponse('Q_INFLATION', 3);
    store.setBeliefResponse('Q_VOLATILITY_COMFORT', 3);
    store.setBeliefResponse('Q_UK_BIAS', 3);
    store.computeBeliefsScores();
    store.computeScenarios();
    
    const scenario = useOnboardingV2Store.getState().scenario;
    const neutralBaseline = scenario.scenarios.find(s => s.scenario_type === 'NEUTRAL_BASELINE');
    
    expect(neutralBaseline).toBeDefined();
    neutralBaseline!.asset_class_bands.forEach(band => {
      const width = band.illustrative_high_pct - band.illustrative_low_pct;
      expect(width).toBe(4.0);
    });
  });
  
  it('should not artificially widen range when extreme pressure already exceeds minimum', async () => {
    const { useOnboardingV2Store, store } = await setupStoreForScenarios();
    
    store.setBeliefResponse('Q_QUALITY', 5);
    store.setBeliefResponse('Q_VALUE', 5);
    store.setBeliefResponse('Q_TECH', 5);
    store.setBeliefResponse('Q_SMALL_CAP', 5);
    store.setBeliefResponse('Q_ESG', 5);
    store.setBeliefResponse('Q_INFLATION', 5);
    store.setBeliefResponse('Q_VOLATILITY_COMFORT', 1);
    store.setBeliefResponse('Q_UK_BIAS', 5);
    store.computeBeliefsScores();
    store.computeScenarios();
    
    const scenario = useOnboardingV2Store.getState().scenario;
    const preferenceLeaning = scenario.scenarios.find(s => s.scenario_type === 'PREFERENCE_LEANING');
    
    expect(preferenceLeaning).toBeDefined();
    preferenceLeaning!.asset_class_bands.forEach(band => {
      const width = band.illustrative_high_pct - band.illustrative_low_pct;
      expect(width).toBeGreaterThanOrEqual(MIN_RANGE_WIDTH_PP);
    });
  });
});

/**
 * Step 7 Applied Tilts - LOCKED Status Tests
 * 
 * When tilts_allowed=false (due to RED Safety Lights), all applied tilts
 * should have status LOCKED (not CONSTRAINED).
 */
describe('Step 7 Applied Tilts - LOCKED Status', () => {
  beforeEach(() => {
    vi.resetModules();
  });
  
  it('should set status LOCKED for all tilts when tilts_allowed=false (RED Safety Lights)', async () => {
    const { useOnboardingV2Store } = await import('../client/src/state/onboardingV2Store');
    const store = useOnboardingV2Store.getState();
    
    store.setHoldings([
      { id: '1', name: 'Equity Fund', ticker: 'EQ1', value_gbp: 100000, asset_class: 'Equity', region: 'UK', wrapper: 'ISA', is_liquid: true, is_illiquid: false },
    ]);
    
    store.updateIntake({
      age_band: '35_44',
      portfolio_stage: 'ACCUMULATING',
      monthly_spending_gbp: 5000,
    });
    
    store.setAnalysisResult({
      safety_lights: {
        liquidity: 'RED',
        concentration: 'GREEN',
        illiquids: 'GREEN',
        overall_status: 'NEEDS_ATTENTION',
        metrics: {
          cash_runway_months: 0,
          largest_line_pct: 1.0,
          illiquid_pct: 0,
        },
      },
    });
    
    store.setBeliefResponse('Q_QUALITY', 5);
    store.setBeliefResponse('Q_VALUE', 3);
    store.setBeliefResponse('Q_TECH', 4);
    store.setBeliefResponse('Q_SMALL_CAP', 3);
    store.setBeliefResponse('Q_ESG', 3);
    store.setBeliefResponse('Q_INFLATION', 3);
    store.setBeliefResponse('Q_VOLATILITY_COMFORT', 3);
    store.setBeliefResponse('Q_UK_BIAS', 3);
    store.computeBeliefsScores();
    store.computeScenarios();
    
    const state = useOnboardingV2Store.getState();
    
    expect(state.beliefs.tilts_allowed).toBe(false);
    
    const guardrailFirst = state.scenario.scenarios.find(s => s.scenario_type === 'GUARDRAIL_FIRST');
    expect(guardrailFirst).toBeDefined();
    
    guardrailFirst!.applied_tilts.forEach(tilt => {
      expect(tilt.status).toBe('LOCKED');
      expect(tilt.constraint_reason).toBe('Considered within guardrails due to Safety Lights.');
    });
    
    expect(guardrailFirst!.tilts_constrained_count).toBeGreaterThan(0);
  });
  
  it('should NOT use LOCKED status when tilts_allowed=true (all GREEN lights)', async () => {
    const { useOnboardingV2Store } = await import('../client/src/state/onboardingV2Store');
    const store = useOnboardingV2Store.getState();
    
    store.setHoldings([
      { id: '1', name: 'Equity Fund', ticker: 'EQ1', value_gbp: 50000, asset_class: 'Equity', region: 'UK', wrapper: 'ISA', is_liquid: true, is_illiquid: false },
      { id: '2', name: 'Cash', ticker: 'CASH', value_gbp: 50000, asset_class: 'Cash', region: 'UK', wrapper: 'ISA', is_liquid: true, is_illiquid: false },
    ]);
    
    store.updateIntake({
      age_band: '35_44',
      portfolio_stage: 'ACCUMULATING',
      monthly_spending_gbp: 2000,
    });
    
    store.setAnalysisResult({
      safety_lights: {
        liquidity: 'GREEN',
        concentration: 'GREEN',
        illiquids: 'GREEN',
        overall_status: 'ALL_CLEAR',
        metrics: {
          cash_runway_months: 25,
          largest_line_pct: 0.5,
          illiquid_pct: 0,
        },
      },
    });
    
    store.setBeliefResponse('Q_QUALITY', 5);
    store.setBeliefResponse('Q_VALUE', 3);
    store.setBeliefResponse('Q_TECH', 4);
    store.setBeliefResponse('Q_SMALL_CAP', 3);
    store.setBeliefResponse('Q_ESG', 3);
    store.setBeliefResponse('Q_INFLATION', 3);
    store.setBeliefResponse('Q_VOLATILITY_COMFORT', 3);
    store.setBeliefResponse('Q_UK_BIAS', 3);
    store.computeBeliefsScores();
    store.computeScenarios();
    
    const state = useOnboardingV2Store.getState();
    
    expect(state.beliefs.tilts_allowed).toBe(true);
    
    state.scenario.scenarios.forEach(scenario => {
      const lockedTilts = scenario.applied_tilts.filter(t => t.status === 'LOCKED');
      expect(lockedTilts.length).toBe(0);
    });
  });
});

/**
 * D1: Guardrails dominate — RED locks belief tilts out of the band maths.
 *
 * Review finding D1 (2026-06-11): belief tilts were applied to the
 * illustrative scenario ranges regardless of tilts_allowed; the flag only
 * stamped the LOCKED label. These tests pin the fixed behaviour:
 *  - any RED Safety Light  => scenario ranges are identical with and
 *    without belief tilts (tilts recorded, not applied)
 *  - AMBER/GREEN           => belief tilts shift the ranges
 */
describe('D1: RED Safety Light suppresses belief tilts from scenario ranges', () => {
  type Lights = { liquidity: string; concentration: string; illiquids: string; overall_status: string };

  const setupWithLights = async (lights: Lights) => {
    const { useOnboardingV2Store } = await import('../client/src/state/onboardingV2Store');
    const store = useOnboardingV2Store.getState();
    store.resetOnboarding();

    store.setHoldings([
      { id: '1', name: 'Equity Fund', ticker: 'EQ1', value_gbp: 50000, asset_class: 'Equity', region: 'UK', wrapper: 'ISA', is_liquid: true, is_illiquid: false },
      { id: '2', name: 'Cash', ticker: 'CASH', value_gbp: 30000, asset_class: 'Cash', region: 'UK', wrapper: 'ISA', is_liquid: true, is_illiquid: false },
      { id: '3', name: 'Property Fund', ticker: 'PROP', value_gbp: 20000, asset_class: 'Property', region: 'UK', wrapper: 'GIA', is_liquid: false, is_illiquid: true },
    ]);

    store.updateIntake({
      age_band: '35_44',
      portfolio_stage: 'ACCUMULATING',
      monthly_spending_gbp: 2000,
    });

    store.setAnalysisResult({
      safety_lights: {
        ...lights,
        metrics: {
          cash_runway_months: lights.liquidity === 'RED' ? 1 : 25,
          largest_line_pct: lights.concentration === 'RED' ? 0.5 : 0.1,
          illiquid_pct: lights.illiquids === 'RED' ? 0.4 : 0.05,
        },
      } as any,
    });

    return { useOnboardingV2Store, store };
  };

  const answerBeliefs = (store: any, answer: number) => {
    ['Q_QUALITY', 'Q_VALUE', 'Q_TECH', 'Q_SMALL_CAP', 'Q_ESG', 'Q_INFLATION', 'Q_VOLATILITY_COMFORT', 'Q_UK_BIAS']
      .forEach(q => store.setBeliefResponse(q, answer));
    store.computeBeliefsScores();
    store.computeScenarios();
  };

  // Flatten every band of every scenario into a comparable structure.
  const snapshotBands = (useStore: any) => {
    const scenario = useStore.getState().scenario;
    return scenario.scenarios.map((s: any) => ({
      type: s.scenario_type,
      bands: [...s.asset_class_bands, ...s.region_bands, ...s.wrapper_bands].map((b: any) => ({
        sleeve: b.sleeve,
        low: b.illustrative_low_pct,
        high: b.illustrative_high_pct,
        midpoint: b.midpoint_pct,
      })),
    }));
  };

  const RED_LIGHTS: Lights = { liquidity: 'RED', concentration: 'GREEN', illiquids: 'GREEN', overall_status: 'ACTION_REQUIRED' };
  const GREEN_LIGHTS: Lights = { liquidity: 'GREEN', concentration: 'GREEN', illiquids: 'GREEN', overall_status: 'ALL_CLEAR' };
  const AMBER_LIGHTS: Lights = { liquidity: 'GREEN', concentration: 'AMBER', illiquids: 'GREEN', overall_status: 'CAUTION' };

  it('RED: scenario ranges are identical with strong beliefs and with neutral beliefs', async () => {
    const first = await setupWithLights(RED_LIGHTS);
    answerBeliefs(first.store, 5);
    expect(first.useOnboardingV2Store.getState().beliefs.tilts_allowed).toBe(false);
    const withTilts = snapshotBands(first.useOnboardingV2Store);

    const second = await setupWithLights(RED_LIGHTS);
    answerBeliefs(second.store, 3);
    const withoutTilts = snapshotBands(second.useOnboardingV2Store);

    expect(withTilts).toEqual(withoutTilts);
  });

  it('RED: sleeve pressures carry no belief-derived component', async () => {
    const { useOnboardingV2Store, store } = await setupWithLights(RED_LIGHTS);
    answerBeliefs(store, 5);
    const pressures = useOnboardingV2Store.getState().scenario.sleeve_pressures!;
    // Only the guardrail-driven cash boost may remain; every belief-derived
    // pressure must be zero.
    expect(pressures.equity).toBeCloseTo(0, 10);
    expect(pressures.bond).toBeCloseTo(0, 10);
    expect(pressures.property).toBeCloseTo(0, 10);
    expect(pressures.alternatives).toBeCloseTo(0, 10);
    expect(pressures.uk).toBeCloseTo(0, 10);
    expect(pressures.global).toBeCloseTo(0, 10);
    expect(pressures.cash).toBeCloseTo(0.3, 5); // liquidity guardrail boost, not a belief tilt
  });

  it('GREEN: strong beliefs shift the preference-leaning ranges', async () => {
    const first = await setupWithLights(GREEN_LIGHTS);
    answerBeliefs(first.store, 5);
    expect(first.useOnboardingV2Store.getState().beliefs.tilts_allowed).toBe(true);
    const withTilts = snapshotBands(first.useOnboardingV2Store);

    const second = await setupWithLights(GREEN_LIGHTS);
    answerBeliefs(second.store, 3);
    const withoutTilts = snapshotBands(second.useOnboardingV2Store);

    const pick = (snap: any[], type: string) => snap.find(s => s.type === type)!.bands;
    expect(pick(withTilts, 'PREFERENCE_LEANING')).not.toEqual(pick(withoutTilts, 'PREFERENCE_LEANING'));
    // Neutral baseline never reflects beliefs, with or without tilts.
    expect(pick(withTilts, 'NEUTRAL_BASELINE')).toEqual(pick(withoutTilts, 'NEUTRAL_BASELINE'));
  });

  it('AMBER (no RED): tilts remain allowed and shift the ranges', async () => {
    const first = await setupWithLights(AMBER_LIGHTS);
    answerBeliefs(first.store, 5);
    expect(first.useOnboardingV2Store.getState().beliefs.tilts_allowed).toBe(true);
    const withTilts = snapshotBands(first.useOnboardingV2Store);

    const second = await setupWithLights(AMBER_LIGHTS);
    answerBeliefs(second.store, 3);
    const withoutTilts = snapshotBands(second.useOnboardingV2Store);

    const pick = (snap: any[], type: string) => snap.find(s => s.type === type)!.bands;
    expect(pick(withTilts, 'PREFERENCE_LEANING')).not.toEqual(pick(withoutTilts, 'PREFERENCE_LEANING'));
  });
});
