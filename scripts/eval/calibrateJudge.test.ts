import { describe, it, expect, vi } from 'vitest';
import { runCalibration, type GoldenCase } from './calibrateJudge';
import type { AnthropicMessagesClient } from './judgeProfile';

const GOLDEN_CASES: GoldenCase[] = [
  {
    name: 'CAPITAL_PRESERVATION boundary — regression guard',
    investorProfile: {
      age_band: '55_64', portfolio_stage: 'ACCUMULATING', primary_goal: 'preserve_capital',
      time_horizon: 'medium', risk_comfort: 'very_low', total_portfolio_value_gbp: 800000,
      cash_runway_months: 18, largest_line_pct: 0.12, illiquid_pct: 0.05,
      asset_class_breakdown: { equity_pct: 0.25, bond_pct: 0.30, property_pct: 0.10, cash_pct: 0.30, alts_pct: 0.05, crypto_pct: 0 },
      liquidity_status: 'GREEN', concentration_status: 'GREEN', illiquids_status: 'GREEN',
      personaCues: { age_band: '55_64', portfolio_stage: 'ACCUMULATING', investing_focus: [], has_defined_benefit_pension: false, db_income_coverage_band: null, owns_business: false, private_business_wealth_band: null, has_employer_stock: false, employer_stock_alloc_band: null, has_crypto: false, crypto_alloc_band: null, adviser_usage: 'SELF_DIRECTED', is_cross_border: false },
    },
    expectComputePersonaCode: 'CAPITAL_PRESERVATION',
  },
];

function fakeClientReturning(personaCode: string): AnthropicMessagesClient {
  return {
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify({
          vetoFailed: false, vetoReason: null,
          dimensions: {
            personaLegibility: { level: 'Strong', evidence: `Assigned ${personaCode} with a reason.` },
            safetyLightsFidelity: { level: 'Strong', evidence: 'Matches holdings.' },
            beliefOutlookTraceability: { level: 'Strong', evidence: 'Cites a real episode.' },
            internalConsistency: { level: 'Strong', evidence: 'No contradictions.' },
            informationalSufficiency: { level: 'Adequate', evidence: 'Reasonable.' },
            complianceTargetMarketPosture: { level: 'Strong', evidence: 'No advice language.' },
          },
          checklist: {
            personaAssignedWithReason: true, everyHoldingCategoryFeedsOutput: true,
            atLeastOneScenarioCitedToRealEpisode: true, noContradictions: true,
            lowConfidenceAreasFlagged: false, clearNextStepShown: true,
          },
        }) }],
      }),
    },
  };
}

describe('runCalibration', () => {
  it('reports PASS when computePersona resolves to the expected code', async () => {
    const client = fakeClientReturning('CAPITAL_PRESERVATION');
    const report = await runCalibration(GOLDEN_CASES, client);
    expect(report.results[0].passed).toBe(true);
    expect(report.allPassed).toBe(true);
  });

  it('reports FAIL with a descriptive reason when computePersona resolves to a different code', async () => {
    const badCase: GoldenCase = { ...GOLDEN_CASES[0], expectComputePersonaCode: 'INCOME_STABILITY' };
    const client = fakeClientReturning('CAPITAL_PRESERVATION');
    const report = await runCalibration([badCase], client);
    expect(report.results[0].passed).toBe(false);
    expect(report.results[0].reason).toContain('INCOME_STABILITY');
    expect(report.allPassed).toBe(false);
  });

  it('captures the judge verdict on the result, not just the deterministic pass/fail', async () => {
    const client = fakeClientReturning('CAPITAL_PRESERVATION');
    const report = await runCalibration(GOLDEN_CASES, client);
    expect(report.results[0].judgeVerdict).toBeDefined();
    expect(report.results[0].judgeVerdict.dimensions.personaLegibility.level).toBe('Strong');
  });
});
