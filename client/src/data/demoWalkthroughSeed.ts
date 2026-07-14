// Demo Walkthrough seed data.
//
// Pre-populates Step 3 (Intake) and Step 4 (Holdings) with a realistic,
// anonymised investor so a salesperson can walk an investor through the flow
// without hand-typing anything. The portfolio mirrors the reference investor
// already in the production register — but seeded entirely client-side (no DB
// record, no personal identity).
//
// The holdings are built by running the register-shaped assets through the SAME
// mapper that hydrates a real register-backed investor (`mapAssetsToHoldings`),
// so the Demo Walkthrough looks and analyses identically to that flow.
import { mapAssetsToHoldings } from '@/lib/onboardingSync';
import type { Holding, IntakeData } from '@/state/onboardingV2Store';

// Layer-A register facts, in the camelCase shape the assets API returns (which
// is what `mapAssetsToHoldings` consumes). Values match the reference register;
// asset ids are anonymised (no personal identifier).
export interface DemoRegisterAsset {
  assetId: string;
  label: string;
  wrapperType: string;
  assetClass: string;
  currentValue: number;
  acquisitionCost: number | null;
  acquisitionDate: string | null;
  isin: string | null;
  notes: string | null;
}

export const DEMO_REGISTER_ASSETS: DemoRegisterAsset[] = [
  { assetId: 'demo-property-001', label: 'Main Residence — 6-bed', wrapperType: 'property', assetClass: 'property_residential', currentValue: 3500000, acquisitionCost: 1500000, acquisitionDate: '2005-01-01', isin: null, notes: null },
  { assetId: 'demo-property-002', label: 'Penthouse', wrapperType: 'property', assetClass: 'property_investment', currentValue: 950000, acquisitionCost: 500000, acquisitionDate: '2012-06-01', isin: null, notes: null },
  { assetId: 'demo-property-003', label: 'Box Hill', wrapperType: 'property', assetClass: 'property_investment', currentValue: 920000, acquisitionCost: 450000, acquisitionDate: '2010-03-01', isin: null, notes: null },
  { assetId: 'demo-property-004', label: 'Villa (EUR €1.75M)', wrapperType: 'property', assetClass: 'property_investment', currentValue: 1500000, acquisitionCost: 800000, acquisitionDate: '2024-01-01', isin: null, notes: 'Overseas property' },
  { assetId: 'demo-shares-001', label: 'L&G Shares', wrapperType: 'gia', assetClass: 'equity', currentValue: 300000, acquisitionCost: 150000, acquisitionDate: null, isin: null, notes: null },
  { assetId: 'demo-shares-002', label: 'EasyJet Shares', wrapperType: 'gia', assetClass: 'equity', currentValue: 200000, acquisitionCost: 120000, acquisitionDate: null, isin: null, notes: null },
  { assetId: 'demo-shares-003', label: 'Persimmon Shares', wrapperType: 'gia', assetClass: 'equity', currentValue: 250000, acquisitionCost: 100000, acquisitionDate: null, isin: null, notes: null },
  { assetId: 'demo-shares-004', label: 'Lloyds Shares', wrapperType: 'gia', assetClass: 'equity', currentValue: 300000, acquisitionCost: 80000, acquisitionDate: null, isin: null, notes: null },
  { assetId: 'demo-shares-005', label: 'Barclays Shares', wrapperType: 'gia', assetClass: 'equity', currentValue: 350000, acquisitionCost: 100000, acquisitionDate: null, isin: null, notes: null },
  { assetId: 'demo-shares-006', label: 'M&S Shares', wrapperType: 'gia', assetClass: 'equity', currentValue: 150000, acquisitionCost: 60000, acquisitionDate: null, isin: null, notes: null },
  { assetId: 'demo-shares-007', label: 'Ocado Shares', wrapperType: 'gia', assetClass: 'equity', currentValue: 100000, acquisitionCost: 80000, acquisitionDate: null, isin: null, notes: null },
  { assetId: 'demo-shares-008', label: 'Mitchells & Butlers Shares', wrapperType: 'gia', assetClass: 'equity', currentValue: 150000, acquisitionCost: 60000, acquisitionDate: null, isin: null, notes: null },
  { assetId: 'demo-shares-009', label: 'Santander Shares', wrapperType: 'gia', assetClass: 'equity', currentValue: 200000, acquisitionCost: 80000, acquisitionDate: null, isin: null, notes: null },
  { assetId: 'demo-pension-001', label: 'SIPP', wrapperType: 'pension', assetClass: 'pension', currentValue: 2250000, acquisitionCost: null, acquisitionDate: null, isin: null, notes: null },
  { assetId: 'demo-vct-001', label: 'VCT — Triple Point', wrapperType: 'vct', assetClass: 'vct', currentValue: 200000, acquisitionCost: 200000, acquisitionDate: '2020-04-01', isin: null, notes: null },
  { assetId: 'demo-vct-002', label: 'VCT — Unicorn', wrapperType: 'vct', assetClass: 'vct', currentValue: 200000, acquisitionCost: 200000, acquisitionDate: '2019-10-01', isin: null, notes: null },
  { assetId: 'demo-vct-003', label: 'VCT — British Smaller Companies', wrapperType: 'vct', assetClass: 'vct', currentValue: 200000, acquisitionCost: 200000, acquisitionDate: '2021-01-01', isin: null, notes: null },
  { assetId: 'demo-vct-004', label: 'VCT — Octopus Titan', wrapperType: 'vct', assetClass: 'vct', currentValue: 200000, acquisitionCost: 200000, acquisitionDate: '2020-06-01', isin: null, notes: null },
  { assetId: 'demo-aim-001', label: 'Octopus AIM VCT', wrapperType: 'aim', assetClass: 'aim', currentValue: 200000, acquisitionCost: 200000, acquisitionDate: '2020-03-01', isin: null, notes: null },
  { assetId: 'demo-cash-001', label: 'Cash & Savings', wrapperType: 'cash', assetClass: 'cash', currentValue: 130000, acquisitionCost: null, acquisitionDate: null, isin: null, notes: null },
  { assetId: 'demo-other-001', label: 'Whiskey / Collectables', wrapperType: 'gia', assetClass: 'collectibles', currentValue: 50000, acquisitionCost: 30000, acquisitionDate: null, isin: null, notes: null },
];

// Step 3 (Intake) values for the demo investor. Anonymised identity; financial
// figures and profile cues derived from the reference investor's plan.
//   • Annual income: £105,000 private pension + ~£11,500 state pension ≈ £117k.
//   • Essential spend: proxied by the plan's gross income target (~£125k).
//   • Total investable assets: register total excluding the main residence
//     (£12.30M − £3.50M ≈ £8.80M); the register itself is the source of truth.
//   • No monthly contribution — this is a decumulation (drawdown) plan.
//   • 15-year horizon at age 62; "Balanced" risk; income-oriented drawdown.
// The £ figures are rounded to whole thousands: the Intake number inputs enforce
// a native step="1000" constraint, so non-round values silently block the form's
// "Continue" button. These fields are approximate by design.
export const DEMO_INTAKE: IntakeData = {
  intake_method: 'manual',
  full_name: 'Demo Investor',
  email: 'demo.investor@example.com',
  investor_type: 'individual',
  region: 'uk',
  annual_income_gbp: 117000,
  annual_essential_spend_gbp: 125000,
  liquid_cash_gbp: 130000,
  total_investable_assets_gbp: 8800000,
  regular_monthly_contribution_gbp: 0,
  primary_goal: 'income_focus',
  time_horizon_years: 'long',
  risk_comfort: 'moderate',
  personaCues: {
    age_band: '55_64',
    portfolio_stage: 'PRIMARILY_DRAWDOWN',
    investing_focus: ['INDIVIDUAL_SHARES', 'PROPERTY_BTL', 'OTHER'],
    has_defined_benefit_pension: false,
    db_income_coverage_band: null,
    owns_business: false,
    private_business_wealth_band: null,
    has_employer_stock: false,
    employer_stock_alloc_band: null,
    has_crypto: false,
    crypto_alloc_band: null,
    adviser_usage: 'FULL_SERVICE_ADVISER',
    is_cross_border: true,
  },
};

export function buildDemoHoldings(): Holding[] {
  return mapAssetsToHoldings(DEMO_REGISTER_ASSETS);
}
