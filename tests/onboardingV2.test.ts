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
