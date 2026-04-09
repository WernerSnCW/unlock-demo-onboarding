export const CANONICAL_BUCKETS = [
  "CASH","BILLS_SHORT_GILTS","GILTS_LONG","IG_CREDIT","HY_CREDIT",
  "GLOBAL_EQUITY","UK_EQUITY_VALUE","GROWTH_TECH","PROPERTY_UK_RESI",
  "COMMODITIES","GOLD","ALTERNATIVES",
  "CRYPTO_BTC","CRYPTO_ETH","COLLECTIBLES_ART","COLLECTIBLES_WINE",
] as const;

export type Bucket = typeof CANONICAL_BUCKETS[number];

type ShockVector = Partial<Record<Bucket, number>>;
type VolVector = Partial<Record<Bucket, number>>;

export type ScenarioShocks = Record<string, ShockVector>;

export const SCENARIO_SHOCKS: ScenarioShocks = {
  S001: { GLOBAL_EQUITY: 0.10, UK_EQUITY_VALUE: 0.06, GROWTH_TECH: 0.12, IG_CREDIT: 0.03, GILTS_LONG: 0.02 },
  S002: { GLOBAL_EQUITY: 0.12, GROWTH_TECH: 0.15, IG_CREDIT: 0.04, GILTS_LONG: 0.05, BILLS_SHORT_GILTS: 0.01 },
  S003: { COMMODITIES: 0.15, GOLD: 0.10, GLOBAL_EQUITY: -0.03, GILTS_LONG: -0.08, IG_CREDIT: -0.02, UK_EQUITY_VALUE: 0.02 },
  S004: { GLOBAL_EQUITY: 0.05, IG_CREDIT: 0.03, GILTS_LONG: 0.02, BILLS_SHORT_GILTS: 0.01 },
  S005: { GLOBAL_EQUITY: 0.09, UK_EQUITY_VALUE: 0.07, IG_CREDIT: 0.03, GROWTH_TECH: 0.08 },
  S006: { GROWTH_TECH: 0.20, GLOBAL_EQUITY: 0.10, IG_CREDIT: 0.02, GILTS_LONG: 0.00 },
  S007: { COMMODITIES: 0.18, GOLD: 0.12, GLOBAL_EQUITY: -0.12, UK_EQUITY_VALUE: -0.05,
          IG_CREDIT: -0.06, GILTS_LONG: -0.10, BILLS_SHORT_GILTS: 0.02, PROPERTY_UK_RESI: -0.08, GROWTH_TECH: -0.20 },
  S008: { COMMODITIES: 0.06, GOLD: 0.04, GLOBAL_EQUITY: 0.05, IG_CREDIT: 0.02, GILTS_LONG: -0.02 },
  S009: { GILTS_LONG: -0.12, BILLS_SHORT_GILTS: 0.02, GLOBAL_EQUITY: -0.05, UK_EQUITY_VALUE: -0.03,
          COMMODITIES: 0.05, GOLD: -0.02, IG_CREDIT: -0.03 },
  S010: { COMMODITIES: 0.20, GOLD: 0.12, GLOBAL_EQUITY: 0.02, IG_CREDIT: 0.00, GILTS_LONG: -0.04 },
} as const;

export const SCENARIO_VOLS: Record<string, VolVector> = {
  S001: { GLOBAL_EQUITY: 0.18, UK_EQUITY_VALUE: 0.16, GROWTH_TECH: 0.30, IG_CREDIT: 0.06, GILTS_LONG: 0.10, BILLS_SHORT_GILTS: 0.01, GOLD: 0.15, COMMODITIES: 0.22 },
  S002: { GLOBAL_EQUITY: 0.20, GROWTH_TECH: 0.32, IG_CREDIT: 0.07, GILTS_LONG: 0.11, BILLS_SHORT_GILTS: 0.01 },
  S003: { COMMODITIES: 0.28, GOLD: 0.18, GLOBAL_EQUITY: 0.20, GILTS_LONG: 0.12, IG_CREDIT: 0.07 },
  S004: { GLOBAL_EQUITY: 0.17, IG_CREDIT: 0.06, GILTS_LONG: 0.09, BILLS_SHORT_GILTS: 0.01 },
  S005: { GLOBAL_EQUITY: 0.18, UK_EQUITY_VALUE: 0.16, IG_CREDIT: 0.06, GROWTH_TECH: 0.27 },
  S006: { GROWTH_TECH: 0.35, GLOBAL_EQUITY: 0.20, IG_CREDIT: 0.07 },
  S007: { COMMODITIES: 0.30, GOLD: 0.20, GLOBAL_EQUITY: 0.24, UK_EQUITY_VALUE: 0.18, IG_CREDIT: 0.09, GILTS_LONG: 0.14, BILLS_SHORT_GILTS: 0.02, GROWTH_TECH: 0.38 },
  S008: { COMMODITIES: 0.20, GOLD: 0.16, GLOBAL_EQUITY: 0.18, IG_CREDIT: 0.06, GILTS_LONG: 0.10 },
  S009: { GILTS_LONG: 0.16, GLOBAL_EQUITY: 0.20, UK_EQUITY_VALUE: 0.17, COMMODITIES: 0.24, IG_CREDIT: 0.08, BILLS_SHORT_GILTS: 0.02 },
  S010: { COMMODITIES: 0.30, GOLD: 0.20, GLOBAL_EQUITY: 0.18, IG_CREDIT: 0.07, GILTS_LONG: 0.12 },
};

export const SCENARIO_LABELS: Record<string, string> = {
  S001: "Base Case",
  S002: "Recession",
  S003: "Inflation Spike",
  S004: "Recovery",
  S005: "Reflation",
  S006: "Tech Crash",
  S007: "Stagflation",
  S008: "Energy Crisis",
  S009: "Gilt Sell-off",
  S010: "Commodity Boom",
};

export const FACTORS: Record<string, string[]> = {
  "Equities": ["GLOBAL_EQUITY","UK_EQUITY_VALUE","GROWTH_TECH"],
  "Credit/Income": ["IG_CREDIT"],
  "Duration": ["GILTS_LONG"],
  "Liquidity": ["CASH","BILLS_SHORT_GILTS"],
  "Real Assets": ["GOLD","COMMODITIES","PROPERTY_UK_RESI"],
  "Other": ["ALTERNATIVES","COLLECTIBLES_ART","COLLECTIBLES_WINE","CRYPTO_BTC","CRYPTO_ETH"],
};

export function defaultCorrelation(): number[][] {
  const n = CANONICAL_BUCKETS.length;
  const M = Array.from({length: n}, (_: unknown, i: number) => Array.from({length: n}, (_: unknown, j: number) => i === j ? 1 : 0));
  return M;
}

export const CORRELATION: number[][] = defaultCorrelation();
export const CORRELATION_MATRIX: number[][] = CORRELATION;
export const BUCKET_ORDER: Bucket[] = [...CANONICAL_BUCKETS];

export const SCENARIO_PRIORS: Record<string, Partial<Record<Bucket, number>>> = {
  S001: { CASH:0.10, GILTS_LONG:0.10, IG_CREDIT:0.15, GLOBAL_EQUITY:0.50, UK_EQUITY_VALUE:0.15 },
  S002: { CASH:0.15, BILLS_SHORT_GILTS:0.20, IG_CREDIT:0.20, GLOBAL_EQUITY:0.35, UK_EQUITY_VALUE:0.10 },
  S003: { CASH:0.10, IG_CREDIT:0.10, GLOBAL_EQUITY:0.30, UK_EQUITY_VALUE:0.15, COMMODITIES:0.15, GOLD:0.20 },
  S004: { BILLS_SHORT_GILTS:0.15, GILTS_LONG:0.15, IG_CREDIT:0.20, GLOBAL_EQUITY:0.35, UK_EQUITY_VALUE:0.15 },
  S005: { CASH:0.10, GILTS_LONG:0.15, IG_CREDIT:0.15, GLOBAL_EQUITY:0.40, UK_EQUITY_VALUE:0.20 },
  S006: { CASH:0.05, GILTS_LONG:0.15, IG_CREDIT:0.10, GLOBAL_EQUITY:0.45, UK_EQUITY_VALUE:0.10, GROWTH_TECH:0.15 },
  S007: { CASH:0.10, BILLS_SHORT_GILTS:0.10, IG_CREDIT:0.08, GLOBAL_EQUITY:0.25, UK_EQUITY_VALUE:0.15, COMMODITIES:0.20, GOLD:0.12 },
  S008: { CASH:0.10, BILLS_SHORT_GILTS:0.05, IG_CREDIT:0.10, GLOBAL_EQUITY:0.40, UK_EQUITY_VALUE:0.10, COMMODITIES:0.10, GOLD:0.15 },
  S009: { CASH:0.15, BILLS_SHORT_GILTS:0.20, GILTS_LONG:0.05, IG_CREDIT:0.10, GLOBAL_EQUITY:0.35, UK_EQUITY_VALUE:0.10, COMMODITIES:0.05 },
  S010: { CASH:0.07, BILLS_SHORT_GILTS:0.05, IG_CREDIT:0.08, GLOBAL_EQUITY:0.22, UK_EQUITY_VALUE:0.18, COMMODITIES:0.25, GOLD:0.15 },
} as const;

export function blendScenarioTemplates(
  weights: Record<string, number>,
): Record<Bucket, number> {
  const total = Object.values(weights || {}).reduce((a, b) => a + b, 0) || 0;
  const norm = Object.fromEntries(Object.entries(weights || {}).map(([k, v]) => [k, total ? v / total : 0]));
  const out: Record<Bucket, number> = Object.fromEntries(CANONICAL_BUCKETS.map(b => [b, 0])) as Record<Bucket, number>;
  for (const [sid, w] of Object.entries(norm)) {
    const prior = SCENARIO_PRIORS[sid]; if (!prior || w <= 0) continue;
    for (const [b, p] of Object.entries(prior)) out[b as Bucket] += (p as number) * w;
  }
  return out;
}

export const SCENARIOS: Record<string, { name: string; description: string; horizon_years: number; mu: Record<string, number> }> = {
  "Debt Spiral": {
    name: "Debt Spiral",
    description: "Sovereign financing stress: interest costs outpace revenues; gilt sell-off, FX pressure, wider credit spreads.",
    horizon_years: 5,
    mu: { GLOBAL_EQUITY:-0.20, UK_EQUITY_VALUE:-0.25, GROWTH_TECH:-0.30, PROPERTY_UK_RESI:-0.15, GILTS_LONG:-0.20, HY_CREDIT:-0.20, GOLD:0.15, COMMODITIES:0.0, CRYPTO_BTC:-0.20, CRYPTO_ETH:-0.25, IG_CREDIT:-0.10, CASH:0.0, BILLS_SHORT_GILTS:0.02, ALTERNATIVES:-0.14, COLLECTIBLES_ART:-0.06, COLLECTIBLES_WINE:-0.04 },
  },
  "Property Crash": {
    name: "Property Crash",
    description: "Housing-led downturn: affordability shock and tight credit drive double-digit UK resi declines.",
    horizon_years: 5,
    mu: { GLOBAL_EQUITY:-0.25, UK_EQUITY_VALUE:-0.20, GROWTH_TECH:-0.30, PROPERTY_UK_RESI:-0.18, GILTS_LONG:0.08, HY_CREDIT:-0.20, GOLD:0.12, COMMODITIES:-0.10, CRYPTO_BTC:-0.35, CRYPTO_ETH:-0.44, IG_CREDIT:-0.08, CASH:0.0, BILLS_SHORT_GILTS:0.02, ALTERNATIVES:-0.18, COLLECTIBLES_ART:-0.095, COLLECTIBLES_WINE:-0.08 },
  },
  "AI Recession": {
    name: "AI Recession",
    description: "Automation displaces labour faster than demand adjusts; consumption weakens; duration rallies.",
    horizon_years: 5,
    mu: { GLOBAL_EQUITY:-0.18, UK_EQUITY_VALUE:-0.12, GROWTH_TECH:-0.22, PROPERTY_UK_RESI:-0.10, GILTS_LONG:0.10, HY_CREDIT:-0.15, GOLD:0.08, COMMODITIES:-0.08, CRYPTO_BTC:-0.30, CRYPTO_ETH:-0.38, IG_CREDIT:-0.06, CASH:0.0, BILLS_SHORT_GILTS:0.02, ALTERNATIVES:-0.13, COLLECTIBLES_ART:-0.07, COLLECTIBLES_WINE:-0.06 },
  },
  "Stagflation": {
    name: "Stagflation",
    description: "Supply/energy shocks keep inflation high while growth slows; equity-bond correlation flips positive.",
    horizon_years: 5,
    mu: { GLOBAL_EQUITY:-0.20, UK_EQUITY_VALUE:-0.05, GROWTH_TECH:-0.25, PROPERTY_UK_RESI:0.02, GILTS_LONG:-0.18, HY_CREDIT:-0.20, GOLD:0.18, COMMODITIES:0.20, CRYPTO_BTC:0.05, CRYPTO_ETH:0.06, IG_CREDIT:-0.10, CASH:0.0, BILLS_SHORT_GILTS:-0.01, ALTERNATIVES:-0.14, COLLECTIBLES_ART:0.0, COLLECTIBLES_WINE:0.02 },
  },
  "Tech Burst": {
    name: "Tech Burst",
    description: "Valuation compression in growth tech/crypto; multiples de-rate; duration and gold gain a bid.",
    horizon_years: 5,
    mu: { GLOBAL_EQUITY:-0.22, UK_EQUITY_VALUE:-0.05, GROWTH_TECH:-0.40, PROPERTY_UK_RESI:-0.04, GILTS_LONG:0.15, HY_CREDIT:-0.05, GOLD:0.10, COMMODITIES:-0.08, CRYPTO_BTC:-0.70, CRYPTO_ETH:-0.80, IG_CREDIT:0.05, CASH:0.0, BILLS_SHORT_GILTS:0.02, ALTERNATIVES:-0.15, COLLECTIBLES_ART:-0.08, COLLECTIBLES_WINE:-0.07 },
  },
  "Sterling Devaluation": {
    name: "Sterling Devaluation",
    description: "Loss of policy/external-balance credibility drives sharp GBP fall; imported inflation rises.",
    horizon_years: 5,
    mu: { GLOBAL_EQUITY:-0.10, UK_EQUITY_VALUE:-0.15, GROWTH_TECH:-0.15, PROPERTY_UK_RESI:-0.12, GILTS_LONG:-0.12, HY_CREDIT:-0.15, GOLD:0.25, COMMODITIES:0.15, CRYPTO_BTC:0.20, CRYPTO_ETH:0.25, IG_CREDIT:-0.08, CASH:0.0, BILLS_SHORT_GILTS:0.0, ALTERNATIVES:-0.07, COLLECTIBLES_ART:0.0, COLLECTIBLES_WINE:0.025 },
  },
  "Energy Shock": {
    name: "Energy Shock",
    description: "Geopolitical/supply disruptions lift energy/commodities; stagflationary pressure builds.",
    horizon_years: 3,
    mu: { GLOBAL_EQUITY:-0.18, UK_EQUITY_VALUE:-0.12, GROWTH_TECH:-0.20, PROPERTY_UK_RESI:-0.05, GILTS_LONG:-0.10, HY_CREDIT:-0.12, GOLD:0.12, COMMODITIES:0.20, CRYPTO_BTC:-0.20, CRYPTO_ETH:-0.25, IG_CREDIT:-0.06, CASH:0.0, BILLS_SHORT_GILTS:-0.01, ALTERNATIVES:-0.13, COLLECTIBLES_ART:-0.01, COLLECTIBLES_WINE:0.024 },
  },
  "Rate-Cut Reflation": {
    name: "Rate-Cut Reflation",
    description: "Policy easing and sentiment rebound lift risk assets; duration rallies; gold softens on real yields.",
    horizon_years: 3,
    mu: { GLOBAL_EQUITY:0.12, UK_EQUITY_VALUE:0.08, GROWTH_TECH:0.16, PROPERTY_UK_RESI:0.03, GILTS_LONG:0.18, HY_CREDIT:0.08, GOLD:-0.05, COMMODITIES:0.05, CRYPTO_BTC:0.20, CRYPTO_ETH:0.25, IG_CREDIT:0.02, CASH:0.0, BILLS_SHORT_GILTS:0.0, ALTERNATIVES:0.084, COLLECTIBLES_ART:0.046, COLLECTIBLES_WINE:0.039 },
  },
};

export const LEGACY_SCENARIO_IDS: Record<string, string> = {
  "energy_spike": "Energy Shock",
  "property_down": "Property Crash",
  "stagflation": "Stagflation",
  "reflation": "Rate-Cut Reflation",
  "recession": "AI Recession",
  "tech_correction": "Tech Burst",
  "devaluation": "Sterling Devaluation",
  "gilt_selloff": "Debt Spiral",
};

export const ASSET_CLASS_MAPPING: Record<string, string | string[]> = {
  "Global Equity": "GLOBAL_EQUITY",
  "UK Equity": "UK_EQUITY_VALUE",
  "Growth Tech": "GROWTH_TECH",
  "UK Property": "PROPERTY_UK_RESI",
  "Long Gilts": "GILTS_LONG",
  "HY Credit": "HY_CREDIT",
  "Gold": "GOLD",
  "Commodities": "COMMODITIES",
  "Crypto": ["CRYPTO_BTC", "CRYPTO_ETH"],
};

export const IG_CREDIT_SHOCKS: Record<string, number> = {
  "Debt Spiral": -0.10,
  "Property Crash": -0.08,
  "AI Recession": -0.06,
  "Stagflation": -0.10,
  "Tech Burst": 0.05,
  "Sterling Devaluation": -0.08,
  "Energy Shock": -0.06,
  "Rate-Cut Reflation": 0.02,
};

export const CRYPTO_SPLIT_CONFIG = {
  CRYPTO_BTC: 1.0,
  CRYPTO_ETH: 1.25,
  cap_abs_pct: 0.80,
};
