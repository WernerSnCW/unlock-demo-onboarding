import { describe, it, expect } from 'vitest';
import {
  DEMO_INTAKE,
  DEMO_REGISTER_ASSETS,
  buildDemoHoldings,
} from '@/data/demoWalkthroughSeed';

// The Demo Walkthrough button (Method / Step 2) seeds Intake (Step 3) and
// Holdings (Step 4). These guards protect the two things that silently break the
// walkthrough if they regress: the register total, and the Intake number inputs'
// native step constraints (a non-round value blocks the "Continue" button).

describe('demoWalkthroughSeed', () => {
  it('builds one holding per register asset totalling £12.30M', () => {
    const holdings = buildDemoHoldings();
    expect(holdings).toHaveLength(DEMO_REGISTER_ASSETS.length);
    expect(holdings).toHaveLength(21);
    const total = holdings.reduce((s, h) => s + h.value_gbp, 0);
    expect(total).toBe(12_300_000);
  });

  it('flags property / VCT / AIM / collectibles as illiquid (and nothing else)', () => {
    const holdings = buildDemoHoldings();
    const illiquidLabels = holdings.filter((h) => h.illiquid).map((h) => h.instrument_name).sort();
    // 4 properties + 4 VCTs + 1 AIM + 1 collectibles = 10 illiquid lines
    expect(holdings.filter((h) => h.illiquid)).toHaveLength(10);
    // liquid: 9 listed shares + SIPP + cash = 11
    expect(holdings.filter((h) => !h.illiquid)).toHaveLength(11);
    expect(illiquidLabels).toContain('Whiskey / Collectables');
    expect(illiquidLabels).toContain('Octopus AIM VCT');
  });

  it('holding £ values and cost bases satisfy the Holdings input step (multiples of 100)', () => {
    for (const h of buildDemoHoldings()) {
      expect(h.value_gbp % 100).toBe(0);
      if (h.cost_basis_gbp != null) expect(h.cost_basis_gbp % 100).toBe(0);
    }
  });

  it('Intake £ figures are whole thousands so the native step="1000" inputs stay valid', () => {
    // Regression guard: non-round values fail HTML stepMismatch validation and
    // silently block Intake's "Continue to Holdings" button.
    expect(DEMO_INTAKE.annual_income_gbp % 1000).toBe(0);
    expect(DEMO_INTAKE.annual_essential_spend_gbp % 1000).toBe(0);
    expect(DEMO_INTAKE.liquid_cash_gbp % 1000).toBe(0);
    expect(DEMO_INTAKE.total_investable_assets_gbp % 1000).toBe(0);
    // Monthly contribution input uses step="100".
    expect(DEMO_INTAKE.regular_monthly_contribution_gbp % 100).toBe(0);
  });

  it('is anonymised — no reference to the source investor identity', () => {
    const blob = JSON.stringify({ DEMO_INTAKE, DEMO_REGISTER_ASSETS }).toLowerCase();
    expect(blob).not.toContain('tony');
    expect(DEMO_INTAKE.full_name).toBe('Demo Investor');
  });
});
