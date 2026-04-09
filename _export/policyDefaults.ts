export interface ProjectionPolicy {
  min_cash_months: number;
  cash_amber_multiple: number;
  max_single_name_pct: number;
  concentration_amber_fraction: number;
}

export interface CollectiblesPolicy {
  max_weight_pct: number;
  amber_fraction: number;
}

export interface FactorsPolicy {
  z_cap: number;
  tilt_budget_risk: number;
}

export interface CgtPolicy {
  cgt_allowance_per_year_gbp: number;
  max_annual_disposal_ratio: number;
  min_reduce_plan_years: number;
}

export interface BedAndIsaPolicy {
  min_gain_trigger_gbp: number;
}

export interface WrappersPolicy {
  priority_order: string[];
  bed_and_isa: BedAndIsaPolicy;
}

export interface Policy {
  projection: ProjectionPolicy;
  collectibles: CollectiblesPolicy;
  factors: FactorsPolicy;
  cgt: CgtPolicy;
  wrappers: WrappersPolicy;
}

export const POLICY_DEFAULTS: Policy = {
  projection: {
    min_cash_months: 6,
    cash_amber_multiple: 1.5,
    max_single_name_pct: 0.20,
    concentration_amber_fraction: 0.75,
  },
  collectibles: {
    max_weight_pct: 0.25,
    amber_fraction: 0.60,
  },
  factors: {
    z_cap: 2.0,
    tilt_budget_risk: 0.30,
  },
  cgt: {
    cgt_allowance_per_year_gbp: 3000,
    max_annual_disposal_ratio: 0.25,
    min_reduce_plan_years: 3,
  },
  wrappers: {
    priority_order: ["ISA", "SIPP", "GIA"],
    bed_and_isa: {
      min_gain_trigger_gbp: 1000,
    },
  },
};

export function applyPolicyOverrides(basePolicy: Policy, overrides: Partial<Policy>): Policy {
  return {
    projection: { ...basePolicy.projection, ...overrides.projection },
    collectibles: { ...basePolicy.collectibles, ...overrides.collectibles },
    factors: { ...basePolicy.factors, ...overrides.factors },
    cgt: { ...basePolicy.cgt, ...overrides.cgt },
    wrappers: {
      ...basePolicy.wrappers,
      ...overrides.wrappers,
      bed_and_isa: {
        ...basePolicy.wrappers.bed_and_isa,
        ...(overrides.wrappers?.bed_and_isa || {}),
      },
    },
  };
}
