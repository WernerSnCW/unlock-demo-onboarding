import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { getPolicy, applyPolicyOverrides, type Policy } from '../server/services/policy';
import { computeSafetyLights, type Intake } from '../server/services/analysis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface GoldenCase {
  name: string;
  description?: string;
  intake?: Intake;
  holdings?: Array<{
    wrapper: string;
    instrument: string;
    qty: number;
    price: number;
    cost_basis: number;
  }>;
  policy_overrides?: Partial<Policy>;
  current_weights?: Record<string, number>;
  context?: {
    isa_headroom_gbp?: number;
  };
  expect: {
    liquidity?: string;
    concentration?: string;
    illiquids?: string;
    tilts_allowed?: boolean;
    target_no_worsen?: boolean;
    bed_isa_suggested?: boolean;
  };
  notes?: string;
}

describe('Policy Loader', () => {
  it('should load policy defaults successfully', () => {
    const policy = getPolicy();
    
    expect(policy).toBeDefined();
    expect(policy.projection).toBeDefined();
    expect(policy.collectibles).toBeDefined();
    expect(policy.factors).toBeDefined();
    expect(policy.cgt).toBeDefined();
    expect(policy.wrappers).toBeDefined();
  });

  it('should have correct projection defaults', () => {
    const policy = getPolicy();
    
    expect(policy.projection.min_cash_months).toBe(6);
    expect(policy.projection.cash_amber_multiple).toBe(1.5);
    expect(policy.projection.max_single_name_pct).toBe(0.20);
    expect(policy.projection.concentration_amber_fraction).toBe(0.75);
  });

  it('should have correct collectibles defaults', () => {
    const policy = getPolicy();
    
    expect(policy.collectibles.max_weight_pct).toBe(0.10);
    expect(policy.collectibles.amber_fraction).toBe(0.70);
  });

  it('should have correct factors defaults', () => {
    const policy = getPolicy();
    
    expect(policy.factors.z_cap).toBe(2.0);
    expect(policy.factors.tilt_budget_risk).toBe(0.30);
  });

  it('should have correct CGT defaults', () => {
    const policy = getPolicy();
    
    expect(policy.cgt.cgt_allowance_per_year_gbp).toBe(3000);
    expect(policy.cgt.max_annual_disposal_ratio).toBe(0.25);
    expect(policy.cgt.min_reduce_plan_years).toBe(3);
  });

  it('should have correct wrapper defaults', () => {
    const policy = getPolicy();
    
    expect(policy.wrappers.priority_order).toEqual(['ISA', 'SIPP', 'GIA']);
    expect(policy.wrappers.bed_and_isa.min_gain_trigger_gbp).toBe(1000);
  });

  it('should apply policy overrides correctly', () => {
    const basePolicy = getPolicy();
    const overrides: Partial<Policy> = {
      projection: {
        ...basePolicy.projection,
        min_cash_months: 12,
      },
    };
    
    const modified = applyPolicyOverrides(basePolicy, overrides);
    
    expect(modified.projection.min_cash_months).toBe(12);
    expect(modified.projection.max_single_name_pct).toBe(0.20);
  });
});

describe('Safety Lights', () => {
  let goldenCases: GoldenCase[];
  let basePolicy: Policy;

  beforeAll(() => {
    const goldenPath = path.join(__dirname, 'golden/golden_cases.json');
    const goldenData = fs.readFileSync(goldenPath, 'utf8');
    goldenCases = JSON.parse(goldenData);
    basePolicy = getPolicy();
  });

  it('should load golden cases successfully', () => {
    expect(goldenCases).toBeDefined();
    expect(goldenCases.length).toBeGreaterThan(0);
  });

  describe('Liquidity classification', () => {
    it('should classify RED liquidity when cash runway < min_cash_months', () => {
      const intake: Intake = {
        cash: 10000,
        spend: 60000,
        largest_line_pct: 0.10,
        illiquid_pct: 0.05,
      };
      
      const result = computeSafetyLights(intake);
      
      expect(result.liquidity).toBe('RED');
      expect(result.details.cash_runway_months).toBe(2);
    });

    it('should classify AMBER liquidity when in amber zone', () => {
      const intake: Intake = {
        cash: 35000,
        spend: 60000,
        largest_line_pct: 0.10,
        illiquid_pct: 0.05,
      };
      
      const result = computeSafetyLights(intake);
      
      expect(result.liquidity).toBe('AMBER');
      expect(result.details.cash_runway_months).toBe(7);
    });

    it('should classify GREEN liquidity when cash runway >= amber threshold', () => {
      const intake: Intake = {
        cash: 50000,
        spend: 40000,
        largest_line_pct: 0.10,
        illiquid_pct: 0.05,
      };
      
      const result = computeSafetyLights(intake);
      
      expect(result.liquidity).toBe('GREEN');
    });

    it('should handle zero spend gracefully', () => {
      const intake: Intake = {
        cash: 10000,
        spend: 0,
        largest_line_pct: 0.10,
        illiquid_pct: 0.05,
      };
      
      const result = computeSafetyLights(intake);
      
      expect(result.liquidity).toBe('GREEN');
    });
  });

  describe('Concentration classification', () => {
    it('should classify RED concentration when above cap', () => {
      const intake: Intake = {
        cash: 50000,
        spend: 40000,
        largest_line_pct: 0.50,
        illiquid_pct: 0.05,
      };
      
      const result = computeSafetyLights(intake);
      
      expect(result.concentration).toBe('RED');
    });

    it('should classify AMBER concentration when in amber zone', () => {
      const intake: Intake = {
        cash: 50000,
        spend: 40000,
        largest_line_pct: 0.18,
        illiquid_pct: 0.05,
      };
      
      const result = computeSafetyLights(intake);
      
      expect(result.concentration).toBe('AMBER');
    });

    it('should classify GREEN concentration when below amber threshold', () => {
      const intake: Intake = {
        cash: 50000,
        spend: 40000,
        largest_line_pct: 0.10,
        illiquid_pct: 0.05,
      };
      
      const result = computeSafetyLights(intake);
      
      expect(result.concentration).toBe('GREEN');
    });
  });

  describe('Illiquids classification', () => {
    it('should classify RED illiquids when above cap', () => {
      const intake: Intake = {
        cash: 50000,
        spend: 40000,
        largest_line_pct: 0.10,
        illiquid_pct: 0.15,
      };
      
      const result = computeSafetyLights(intake);
      
      expect(result.illiquids).toBe('RED');
    });

    it('should classify AMBER illiquids when in amber zone', () => {
      const intake: Intake = {
        cash: 50000,
        spend: 40000,
        largest_line_pct: 0.10,
        illiquid_pct: 0.08,
      };
      
      const result = computeSafetyLights(intake);
      
      expect(result.illiquids).toBe('AMBER');
    });

    it('should classify GREEN illiquids when below amber threshold', () => {
      const intake: Intake = {
        cash: 50000,
        spend: 40000,
        largest_line_pct: 0.10,
        illiquid_pct: 0.03,
      };
      
      const result = computeSafetyLights(intake);
      
      expect(result.illiquids).toBe('GREEN');
    });
  });

  describe('Tilts allowed logic', () => {
    it('should disable tilts when any light is RED', () => {
      const intakeWithRedLiquidity: Intake = {
        cash: 10000,
        spend: 60000,
        largest_line_pct: 0.10,
        illiquid_pct: 0.05,
      };
      
      const result = computeSafetyLights(intakeWithRedLiquidity);
      
      expect(result.tilts_allowed).toBe(false);
      expect(result.overall_status).toBe('RED');
    });

    it('should allow tilts when all lights are GREEN or AMBER', () => {
      const healthyIntake: Intake = {
        cash: 50000,
        spend: 40000,
        largest_line_pct: 0.10,
        illiquid_pct: 0.03,
      };
      
      const result = computeSafetyLights(healthyIntake);
      
      expect(result.tilts_allowed).toBe(true);
    });
  });

  describe('Threshold values from policy', () => {
    it('should return correct threshold values with default policy', () => {
      const intake: Intake = {
        cash: 50000,
        spend: 40000,
        largest_line_pct: 0.10,
        illiquid_pct: 0.03,
      };
      
      const result = computeSafetyLights(intake);
      
      expect(result.details.liquidity_thresholds.red_below).toBe(6);
      expect(result.details.liquidity_thresholds.amber_below).toBe(9);
      expect(result.details.concentration_thresholds.amber_above).toBeCloseTo(0.15, 5);
      expect(result.details.concentration_thresholds.red_above).toBeCloseTo(0.20, 5);
      expect(result.details.illiquids_thresholds.amber_above).toBeCloseTo(0.07, 5);
      expect(result.details.illiquids_thresholds.red_above).toBeCloseTo(0.10, 5);
    });

    it('should adjust threshold values when policy is overridden', () => {
      const intake: Intake = {
        cash: 50000,
        spend: 40000,
        largest_line_pct: 0.10,
        illiquid_pct: 0.03,
      };
      
      const customPolicy: Policy = {
        ...basePolicy,
        projection: {
          ...basePolicy.projection,
          min_cash_months: 12,
          cash_amber_multiple: 2.0,
        },
        collectibles: {
          ...basePolicy.collectibles,
          max_weight_pct: 0.15,
          amber_fraction: 0.5,
        },
      };
      
      const result = computeSafetyLights(intake, customPolicy);
      
      expect(result.details.liquidity_thresholds.red_below).toBe(12);
      expect(result.details.liquidity_thresholds.amber_below).toBe(24);
      expect(result.details.illiquids_thresholds.amber_above).toBeCloseTo(0.075, 3);
      expect(result.details.illiquids_thresholds.red_above).toBe(0.15);
    });
  });

  describe('Golden cases', () => {
    it('Liquidity Red locks beliefs', () => {
      const testCase = goldenCases.find(c => c.name === 'Liquidity Red locks beliefs');
      expect(testCase).toBeDefined();
      
      if (!testCase?.intake) throw new Error('Test case missing intake');
      
      let policy = basePolicy;
      if (testCase.policy_overrides) {
        policy = applyPolicyOverrides(basePolicy, testCase.policy_overrides);
      }
      
      const result = computeSafetyLights(testCase.intake, policy);
      
      expect(result.liquidity).toBe('RED');
      expect(result.tilts_allowed).toBe(false);
    });

    it('Concentration breach no-worsen', () => {
      const testCase = goldenCases.find(c => c.name === 'Concentration breach no-worsen');
      expect(testCase).toBeDefined();
      
      if (!testCase?.intake) throw new Error('Test case missing intake');
      
      let policy = basePolicy;
      if (testCase.policy_overrides) {
        policy = applyPolicyOverrides(basePolicy, testCase.policy_overrides);
      }
      
      const result = computeSafetyLights(testCase.intake, policy);
      
      expect(result.concentration).toBe('RED');
      expect(result.tilts_allowed).toBe(false);
    });

    it('Bed & ISA suggestion - policy values accessible', () => {
      const testCase = goldenCases.find(c => c.name === 'Bed & ISA suggestion');
      expect(testCase).toBeDefined();
      
      const policy = getPolicy();
      expect(policy.wrappers.bed_and_isa.min_gain_trigger_gbp).toBeDefined();
      expect(typeof policy.wrappers.bed_and_isa.min_gain_trigger_gbp).toBe('number');
      expect(policy.wrappers.priority_order).toBeDefined();
      expect(Array.isArray(policy.wrappers.priority_order)).toBe(true);
    });

    it('All Green - tilts allowed', () => {
      const testCase = goldenCases.find(c => c.name === 'All Green - tilts allowed');
      expect(testCase).toBeDefined();
      
      if (!testCase?.intake) throw new Error('Test case missing intake');
      
      const result = computeSafetyLights(testCase.intake);
      
      expect(result.liquidity).toBe('GREEN');
      expect(result.concentration).toBe('GREEN');
      expect(result.illiquids).toBe('GREEN');
      expect(result.tilts_allowed).toBe(true);
    });

    it('Illiquids Red - tilts locked', () => {
      const testCase = goldenCases.find(c => c.name === 'Illiquids Red - tilts locked');
      expect(testCase).toBeDefined();
      
      if (!testCase?.intake) throw new Error('Test case missing intake');
      
      let policy = basePolicy;
      if (testCase.policy_overrides) {
        policy = applyPolicyOverrides(basePolicy, testCase.policy_overrides);
      }
      
      const result = computeSafetyLights(testCase.intake, policy);
      
      expect(result.illiquids).toBe('RED');
      expect(result.tilts_allowed).toBe(false);
    });

    it('Amber liquidity - tilts still allowed', () => {
      const testCase = goldenCases.find(c => c.name === 'Amber liquidity - tilts still allowed');
      expect(testCase).toBeDefined();
      
      if (!testCase?.intake) throw new Error('Test case missing intake');
      
      let policy = basePolicy;
      if (testCase.policy_overrides) {
        policy = applyPolicyOverrides(basePolicy, testCase.policy_overrides);
      }
      
      const result = computeSafetyLights(testCase.intake, policy);
      
      expect(result.liquidity).toBe('AMBER');
      expect(result.tilts_allowed).toBe(true);
    });
  });
});

describe('Overall Status Code and Labels', () => {
  it('should return ALL_CLEAR when all lights are GREEN', () => {
    const intake: Intake = {
      cash: 50000,
      spend: 60000,
      largest_line_pct: 0.10,
      illiquid_pct: 0.03,
    };

    const result = computeSafetyLights(intake);

    expect(result.liquidity).toBe('GREEN');
    expect(result.concentration).toBe('GREEN');
    expect(result.illiquids).toBe('GREEN');
    expect(result.overall_status_code).toBe('ALL_CLEAR');
    expect(result.overall_status_label).toBe('Within guardrails');
    expect(result.overall_status_message).toContain('All Safety Lights are green');
    expect(result.tilts_allowed).toBe(true);
  });

  it('should return CAUTION when one light is AMBER (none RED)', () => {
    const intake: Intake = {
      cash: 35000,
      spend: 60000,
      largest_line_pct: 0.10,
      illiquid_pct: 0.03,
    };

    const result = computeSafetyLights(intake);

    expect(result.liquidity).toBe('AMBER');
    expect(result.overall_status_code).toBe('CAUTION');
    expect(result.overall_status_label).toBe('Caution: amber flags present');
    expect(result.overall_status_message).toContain('One or more Safety Lights are amber');
    expect(result.tilts_allowed).toBe(true);
  });

  it('should return ACTION_REQUIRED when any light is RED', () => {
    const intake: Intake = {
      cash: 10000,
      spend: 60000,
      largest_line_pct: 0.10,
      illiquid_pct: 0.03,
    };

    const result = computeSafetyLights(intake);

    expect(result.liquidity).toBe('RED');
    expect(result.overall_status_code).toBe('ACTION_REQUIRED');
    expect(result.overall_status_label).toBe('Action required: red flags present');
    expect(result.overall_status_message).toContain('One or more Safety Lights are red');
    expect(result.tilts_allowed).toBe(false);
  });

  it('should include correct metrics in the response', () => {
    const intake: Intake = {
      cash: 90000,
      spend: 60000,
      largest_line_pct: 0.139,
      illiquid_pct: 0.048,
    };

    const result = computeSafetyLights(intake);

    expect(result.metrics).toBeDefined();
    expect(result.metrics.cash_runway_months).toBe(18);
    expect(result.metrics.largest_line_pct).toBe(0.139);
    expect(result.metrics.illiquid_pct).toBe(0.048);
  });

  it('should return ACTION_REQUIRED when RED concentration even if other lights are GREEN', () => {
    const intake: Intake = {
      cash: 90000,
      spend: 60000,
      largest_line_pct: 0.25,
      illiquid_pct: 0.03,
    };

    const result = computeSafetyLights(intake);

    expect(result.liquidity).toBe('GREEN');
    expect(result.concentration).toBe('RED');
    expect(result.illiquids).toBe('GREEN');
    expect(result.overall_status_code).toBe('ACTION_REQUIRED');
    expect(result.tilts_allowed).toBe(false);
  });

  it('should return GREEN for Concentration and Illiquids when holdings are zero', () => {
    const intake: Intake = {
      cash: 50000,
      spend: 30000,
      largest_line_pct: 0,
      illiquid_pct: 0,
    };

    const result = computeSafetyLights(intake);

    expect(result.concentration).toBe('GREEN');
    expect(result.illiquids).toBe('GREEN');
    expect(result.metrics.largest_line_pct).toBe(0);
    expect(result.metrics.illiquid_pct).toBe(0);
  });

  it('should return cash_runway_months=-1 and Liquidity GREEN when essential spend is zero', () => {
    const intake: Intake = {
      cash: 50000,
      spend: 0,
      largest_line_pct: 0.10,
      illiquid_pct: 0.05,
    };

    const result = computeSafetyLights(intake);

    expect(result.liquidity).toBe('GREEN');
    expect(result.metrics.cash_runway_months).toBe(-1);
  });
});
