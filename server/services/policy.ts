import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

let cachedPolicy: Policy | null = null;

function validatePercentage(value: unknown, fieldName: string): number {
  if (typeof value !== 'number' || value < 0 || value > 1) {
    throw new Error(`Policy validation error: ${fieldName} must be a number between 0 and 1, got ${value}`);
  }
  return value;
}

function validatePositiveNumber(value: unknown, fieldName: string): number {
  if (typeof value !== 'number' || value <= 0) {
    throw new Error(`Policy validation error: ${fieldName} must be a positive number, got ${value}`);
  }
  return value;
}

function validateNonNegativeNumber(value: unknown, fieldName: string): number {
  if (typeof value !== 'number' || value < 0) {
    throw new Error(`Policy validation error: ${fieldName} must be a non-negative number, got ${value}`);
  }
  return value;
}

function validateStringArray(value: unknown, fieldName: string): string[] {
  if (!Array.isArray(value) || !value.every(item => typeof item === 'string')) {
    throw new Error(`Policy validation error: ${fieldName} must be an array of strings`);
  }
  return value;
}

function validatePolicy(raw: unknown): Policy {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Policy validation error: policy must be an object');
  }

  const data = raw as Record<string, unknown>;

  if (!data.projection || typeof data.projection !== 'object') {
    throw new Error('Policy validation error: missing projection section');
  }
  if (!data.collectibles || typeof data.collectibles !== 'object') {
    throw new Error('Policy validation error: missing collectibles section');
  }
  if (!data.factors || typeof data.factors !== 'object') {
    throw new Error('Policy validation error: missing factors section');
  }
  if (!data.cgt || typeof data.cgt !== 'object') {
    throw new Error('Policy validation error: missing cgt section');
  }
  if (!data.wrappers || typeof data.wrappers !== 'object') {
    throw new Error('Policy validation error: missing wrappers section');
  }

  const projection = data.projection as Record<string, unknown>;
  const collectibles = data.collectibles as Record<string, unknown>;
  const factors = data.factors as Record<string, unknown>;
  const cgt = data.cgt as Record<string, unknown>;
  const wrappers = data.wrappers as Record<string, unknown>;

  if (!wrappers.bed_and_isa || typeof wrappers.bed_and_isa !== 'object') {
    throw new Error('Policy validation error: missing wrappers.bed_and_isa section');
  }
  const bedAndIsa = wrappers.bed_and_isa as Record<string, unknown>;

  return {
    projection: {
      min_cash_months: validatePositiveNumber(projection.min_cash_months, 'projection.min_cash_months'),
      cash_amber_multiple: validatePositiveNumber(projection.cash_amber_multiple, 'projection.cash_amber_multiple'),
      max_single_name_pct: validatePercentage(projection.max_single_name_pct, 'projection.max_single_name_pct'),
      concentration_amber_fraction: validatePercentage(projection.concentration_amber_fraction, 'projection.concentration_amber_fraction'),
    },
    collectibles: {
      max_weight_pct: validatePercentage(collectibles.max_weight_pct, 'collectibles.max_weight_pct'),
      amber_fraction: validatePercentage(collectibles.amber_fraction, 'collectibles.amber_fraction'),
    },
    factors: {
      z_cap: validatePositiveNumber(factors.z_cap, 'factors.z_cap'),
      tilt_budget_risk: validatePercentage(factors.tilt_budget_risk, 'factors.tilt_budget_risk'),
    },
    cgt: {
      cgt_allowance_per_year_gbp: validateNonNegativeNumber(cgt.cgt_allowance_per_year_gbp, 'cgt.cgt_allowance_per_year_gbp'),
      max_annual_disposal_ratio: validatePercentage(cgt.max_annual_disposal_ratio, 'cgt.max_annual_disposal_ratio'),
      min_reduce_plan_years: validatePositiveNumber(cgt.min_reduce_plan_years, 'cgt.min_reduce_plan_years'),
    },
    wrappers: {
      priority_order: validateStringArray(wrappers.priority_order, 'wrappers.priority_order'),
      bed_and_isa: {
        min_gain_trigger_gbp: validateNonNegativeNumber(bedAndIsa.min_gain_trigger_gbp, 'wrappers.bed_and_isa.min_gain_trigger_gbp'),
      },
    },
  };
}

export function loadPolicy(): Policy {
  const configPath = path.join(__dirname, '../config/policy_defaults.yaml');
  
  if (!fs.existsSync(configPath)) {
    throw new Error(`Policy config file not found: ${configPath}`);
  }

  const fileContents = fs.readFileSync(configPath, 'utf8');
  const rawPolicy = YAML.parse(fileContents);
  
  return validatePolicy(rawPolicy);
}

export function getPolicy(): Policy {
  if (!cachedPolicy) {
    cachedPolicy = loadPolicy();
  }
  return cachedPolicy;
}

export function reloadPolicy(): Policy {
  cachedPolicy = null;
  return getPolicy();
}

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
