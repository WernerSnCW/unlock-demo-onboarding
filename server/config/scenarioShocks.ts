import { CANONICAL_BUCKETS } from "./buckets";

type Bucket = typeof CANONICAL_BUCKETS[number];
type ShockVector = Partial<Record<Bucket, number>>; // expected total return over horizon, e.g. 0.12 = +12%
export type ScenarioShocks = Record<string, ShockVector>;

export const SCENARIO_SHOCKS: ScenarioShocks = {
  // S001 – Base Growth
  S001: { GLOBAL_EQUITY: 0.10, UK_EQUITY_VALUE: 0.06, GROWTH_TECH: 0.12, IG_CREDIT: 0.03, GILTS_LONG: 0.02 },

  // S002 – Policy Support / Cuts
  S002: { GLOBAL_EQUITY: 0.12, GROWTH_TECH: 0.15, IG_CREDIT: 0.04, GILTS_LONG: 0.05, BILLS_SHORT_GILTS: 0.01 },

  // S003 – Inflation Hedges
  S003: { COMMODITIES: 0.15, GOLD: 0.10, GLOBAL_EQUITY: -0.03, GILTS_LONG: -0.08, IG_CREDIT: -0.02, UK_EQUITY_VALUE: 0.02 },

  // S004 – Rates Normalisation
  S004: { GLOBAL_EQUITY: 0.05, IG_CREDIT: 0.03, GILTS_LONG: 0.02, BILLS_SHORT_GILTS: 0.01 },

  // S005 – Quality Growth
  S005: { GLOBAL_EQUITY: 0.09, UK_EQUITY_VALUE: 0.07, IG_CREDIT: 0.03, GROWTH_TECH: 0.08 },

  // S006 – Tech-led Growth
  S006: { GROWTH_TECH: 0.20, GLOBAL_EQUITY: 0.10, IG_CREDIT: 0.02, GILTS_LONG: 0.00 },

  // S007 – Stagflation Tilt
  S007: { COMMODITIES: 0.18, GOLD: 0.12, GLOBAL_EQUITY: -0.12, UK_EQUITY_VALUE: -0.05,
          IG_CREDIT: -0.06, GILTS_LONG: -0.10, BILLS_SHORT_GILTS: 0.02, PROPERTY_UK_RESI: -0.08, GROWTH_TECH: -0.20 },

  // S008 – Soft-ish Inflation
  S008: { COMMODITIES: 0.06, GOLD: 0.04, GLOBAL_EQUITY: 0.05, IG_CREDIT: 0.02, GILTS_LONG: -0.02 },

  // S009 – Gilt Sell-off / Duration Shock
  S009: { GILTS_LONG: -0.12, BILLS_SHORT_GILTS: 0.02, GLOBAL_EQUITY: -0.05, UK_EQUITY_VALUE: -0.03,
          COMMODITIES: 0.05, GOLD: -0.02, IG_CREDIT: -0.03 },

  // S010 – Commodity Upswing
  S010: { COMMODITIES: 0.20, GOLD: 0.12, GLOBAL_EQUITY: 0.02, IG_CREDIT: 0.00, GILTS_LONG: -0.04 }
} as const;