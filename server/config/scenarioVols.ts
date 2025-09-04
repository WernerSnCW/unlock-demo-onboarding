import { Bucket } from "./buckets";

type VolVector = Partial<Record<Bucket, number>>; // 12m stdev, e.g., 0.18 = 18%/yr

export const SCENARIO_VOLS: Record<string, VolVector> = {
  S001: { 
    GLOBAL_EQUITY: 0.18, 
    UK_EQUITY_VALUE: 0.16, 
    GROWTH_TECH: 0.30, 
    IG_CREDIT: 0.06, 
    GILTS_LONG: 0.10, 
    BILLS_SHORT_GILTS: 0.01, 
    GOLD: 0.15, 
    COMMODITIES: 0.22 
  },
  S002: { 
    GLOBAL_EQUITY: 0.20, 
    GROWTH_TECH: 0.32, 
    IG_CREDIT: 0.07, 
    GILTS_LONG: 0.11, 
    BILLS_SHORT_GILTS: 0.01 
  },
  S003: { 
    COMMODITIES: 0.28, 
    GOLD: 0.18, 
    GLOBAL_EQUITY: 0.20, 
    GILTS_LONG: 0.12, 
    IG_CREDIT: 0.07 
  },
  S004: { 
    GLOBAL_EQUITY: 0.17, 
    IG_CREDIT: 0.06, 
    GILTS_LONG: 0.09, 
    BILLS_SHORT_GILTS: 0.01 
  },
  S005: { 
    GLOBAL_EQUITY: 0.18, 
    UK_EQUITY_VALUE: 0.16, 
    IG_CREDIT: 0.06, 
    GROWTH_TECH: 0.27 
  },
  S006: { 
    GROWTH_TECH: 0.35, 
    GLOBAL_EQUITY: 0.20, 
    IG_CREDIT: 0.07 
  },
  S007: { 
    COMMODITIES: 0.30, 
    GOLD: 0.20, 
    GLOBAL_EQUITY: 0.24, 
    UK_EQUITY_VALUE: 0.18, 
    IG_CREDIT: 0.09, 
    GILTS_LONG: 0.14, 
    BILLS_SHORT_GILTS: 0.02, 
    GROWTH_TECH: 0.38 
  },
  S008: { 
    COMMODITIES: 0.20, 
    GOLD: 0.16, 
    GLOBAL_EQUITY: 0.18, 
    IG_CREDIT: 0.06, 
    GILTS_LONG: 0.10 
  },
  S009: { 
    GILTS_LONG: 0.16, 
    GLOBAL_EQUITY: 0.20, 
    UK_EQUITY_VALUE: 0.17, 
    COMMODITIES: 0.24, 
    IG_CREDIT: 0.08, 
    BILLS_SHORT_GILTS: 0.02 
  },
  S010: { 
    COMMODITIES: 0.30, 
    GOLD: 0.20, 
    GLOBAL_EQUITY: 0.18, 
    IG_CREDIT: 0.07, 
    GILTS_LONG: 0.12 
  }
};