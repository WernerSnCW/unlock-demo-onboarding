// Economic Scenarios data for portfolio impact analysis
// Based on Unlock Scenario Belief Engine v2.1 - 8 scenarios system

export const scenarios: Record<string, any> = {
  "Debt Spiral": {
    name: "Debt Spiral",
    description: "Sovereign financing stress: interest costs outpace revenues; gilt sell-off, FX pressure, wider credit spreads.",
    horizon_years: 5,
    mu: {
      // Core 9 asset classes from new system
      GLOBAL_EQUITY: -0.20,
      UK_EQUITY_VALUE: -0.25,
      GROWTH_TECH: -0.30,
      PROPERTY_UK_RESI: -0.15,
      GILTS_LONG: -0.20,
      HY_CREDIT: -0.20,
      GOLD: 0.15,
      COMMODITIES: 0.0,
      CRYPTO_BTC: -0.20,
      CRYPTO_ETH: -0.25, // ETH 1.25x multiplier on BTC shock
      // IG Credit from IG_CREDIT_SHOCKS
      IG_CREDIT: -0.10,
      // Other buckets - calculated using rules from integration spec
      CASH: 0.0, // default
      BILLS_SHORT_GILTS: 0.02, // recession benefit
      ALTERNATIVES: -0.14, // 0.7 * Global Equity = 0.7 * (-0.20) = -0.14
      COLLECTIBLES_ART: -0.06, // 0.3 * Global Equity + 0.2 * Commodities = -0.06 + 0 = -0.06
      COLLECTIBLES_WINE: -0.04, // 0.2 * Global Equity + 0.3 * Commodities = -0.04 + 0 = -0.04
      COLLECTIBLES_WHISKY: -0.06,
      COLLECTIBLES_CARS: -0.06
    }
  },
  "Property Crash": {
    name: "Property Crash",
    description: "Housing-led downturn: affordability shock and tight credit drive double-digit UK resi declines.",
    horizon_years: 5,
    mu: {
      GLOBAL_EQUITY: -0.25,
      UK_EQUITY_VALUE: -0.20,
      GROWTH_TECH: -0.30,
      PROPERTY_UK_RESI: -0.18,
      GILTS_LONG: 0.08,
      HY_CREDIT: -0.20,
      GOLD: 0.12,
      COMMODITIES: -0.10,
      CRYPTO_BTC: -0.35,
      CRYPTO_ETH: -0.44, // ETH 1.25x multiplier
      IG_CREDIT: -0.08,
      CASH: 0.0,
      BILLS_SHORT_GILTS: 0.02,
      ALTERNATIVES: -0.18, // 0.7 * (-0.25) = -0.175, capped at -0.18
      COLLECTIBLES_ART: -0.095, // 0.3 * (-0.25) + 0.2 * (-0.10) = -0.075 - 0.02 = -0.095
      COLLECTIBLES_WINE: -0.08, // 0.2 * (-0.25) + 0.3 * (-0.10) = -0.05 - 0.03 = -0.08
      COLLECTIBLES_WHISKY: -0.08,
      COLLECTIBLES_CARS: -0.08
    }
  },
  "AI Recession": {
    name: "AI Recession",
    description: "Automation displaces labour faster than demand adjusts; consumption weakens; duration rallies.",
    horizon_years: 5,
    mu: {
      GLOBAL_EQUITY: -0.18,
      UK_EQUITY_VALUE: -0.12,
      GROWTH_TECH: -0.22,
      PROPERTY_UK_RESI: -0.10,
      GILTS_LONG: 0.10,
      HY_CREDIT: -0.15,
      GOLD: 0.08,
      COMMODITIES: -0.08,
      CRYPTO_BTC: -0.30,
      CRYPTO_ETH: -0.38, // ETH 1.25x multiplier
      IG_CREDIT: -0.06,
      CASH: 0.0,
      BILLS_SHORT_GILTS: 0.02,
      ALTERNATIVES: -0.13, // 0.7 * (-0.18) = -0.126
      COLLECTIBLES_ART: -0.07, // 0.3 * (-0.18) + 0.2 * (-0.08) = -0.054 - 0.016 = -0.07
      COLLECTIBLES_WINE: -0.06, // 0.2 * (-0.18) + 0.3 * (-0.08) = -0.036 - 0.024 = -0.06
      COLLECTIBLES_WHISKY: -0.06,
      COLLECTIBLES_CARS: -0.06
    }
  },
  "Stagflation": {
    name: "Stagflation",
    description: "Supply/energy shocks keep inflation high while growth slows; equity–bond correlation flips positive.",
    horizon_years: 5,
    mu: {
      GLOBAL_EQUITY: -0.20,
      UK_EQUITY_VALUE: -0.05,
      GROWTH_TECH: -0.25,
      PROPERTY_UK_RESI: 0.02,
      GILTS_LONG: -0.18,
      HY_CREDIT: -0.20,
      GOLD: 0.18,
      COMMODITIES: 0.20,
      CRYPTO_BTC: 0.05,
      CRYPTO_ETH: 0.06, // ETH 1.25x multiplier on positive
      IG_CREDIT: -0.10,
      CASH: 0.0,
      BILLS_SHORT_GILTS: -0.01, // inflation shock penalty
      ALTERNATIVES: -0.14, // 0.7 * (-0.20) = -0.14
      COLLECTIBLES_ART: 0.0, // 0.3 * (-0.20) + 0.2 * (0.20) = -0.06 + 0.04 = -0.02, capped at 0
      COLLECTIBLES_WINE: 0.02, // 0.2 * (-0.20) + 0.3 * (0.20) = -0.04 + 0.06 = 0.02
      COLLECTIBLES_WHISKY: 0.0,
      COLLECTIBLES_CARS: -0.02
    }
  },
  "Tech Burst": {
    name: "Tech Burst", 
    description: "Valuation compression in growth tech/crypto; multiples de-rate; duration and gold gain a bid.",
    horizon_years: 5,
    mu: {
      GLOBAL_EQUITY: -0.22,
      UK_EQUITY_VALUE: -0.05,
      GROWTH_TECH: -0.40,
      PROPERTY_UK_RESI: -0.04,
      GILTS_LONG: 0.15,
      HY_CREDIT: -0.05,
      GOLD: 0.10,
      COMMODITIES: -0.08,
      CRYPTO_BTC: -0.70,
      CRYPTO_ETH: -0.80, // Capped at 80% per spec
      IG_CREDIT: 0.05,
      CASH: 0.0,
      BILLS_SHORT_GILTS: 0.02,
      ALTERNATIVES: -0.15, // 0.7 * (-0.22) = -0.154, within cap range
      COLLECTIBLES_ART: -0.08, // 0.3 * (-0.22) + 0.2 * (-0.08) = -0.066 - 0.016 = -0.082
      COLLECTIBLES_WINE: -0.07, // 0.2 * (-0.22) + 0.3 * (-0.08) = -0.044 - 0.024 = -0.068
      COLLECTIBLES_WHISKY: -0.08,
      COLLECTIBLES_CARS: -0.08
    }
  },
  "Sterling Devaluation": {
    name: "Sterling Devaluation",
    description: "Loss of policy/external-balance credibility drives sharp GBP fall; imported inflation rises.",
    horizon_years: 5,
    mu: {
      GLOBAL_EQUITY: -0.10,
      UK_EQUITY_VALUE: -0.15,
      GROWTH_TECH: -0.15,
      PROPERTY_UK_RESI: -0.12,
      GILTS_LONG: -0.12,
      HY_CREDIT: -0.15,
      GOLD: 0.25,
      COMMODITIES: 0.15,
      CRYPTO_BTC: 0.20,
      CRYPTO_ETH: 0.25, // ETH 1.25x multiplier on positive
      IG_CREDIT: -0.08,
      CASH: 0.0,
      BILLS_SHORT_GILTS: 0.0,
      ALTERNATIVES: -0.07, // 0.7 * (-0.10) = -0.07
      COLLECTIBLES_ART: 0.0, // 0.3 * (-0.10) + 0.2 * (0.15) = -0.03 + 0.03 = 0
      COLLECTIBLES_WINE: 0.025, // 0.2 * (-0.10) + 0.3 * (0.15) = -0.02 + 0.045 = 0.025
      COLLECTIBLES_WHISKY: 0.05, // Export benefit
      COLLECTIBLES_CARS: 0.02
    }
  },
  "Energy Shock": {
    name: "Energy Shock",
    description: "Geopolitical/supply disruptions lift energy/commodities; stagflationary pressure builds.",
    horizon_years: 3,
    mu: {
      GLOBAL_EQUITY: -0.18,
      UK_EQUITY_VALUE: -0.12,
      GROWTH_TECH: -0.20,
      PROPERTY_UK_RESI: -0.05,
      GILTS_LONG: -0.10,
      HY_CREDIT: -0.12,
      GOLD: 0.12,
      COMMODITIES: 0.20,
      CRYPTO_BTC: -0.20,
      CRYPTO_ETH: -0.25, // ETH 1.25x multiplier
      IG_CREDIT: -0.06,
      CASH: 0.0,
      BILLS_SHORT_GILTS: -0.01, // inflation shock penalty
      ALTERNATIVES: -0.13, // 0.7 * (-0.18) = -0.126
      COLLECTIBLES_ART: -0.01, // 0.3 * (-0.18) + 0.2 * (0.20) = -0.054 + 0.04 = -0.014
      COLLECTIBLES_WINE: 0.024, // 0.2 * (-0.18) + 0.3 * (0.20) = -0.036 + 0.06 = 0.024
      COLLECTIBLES_WHISKY: 0.0,
      COLLECTIBLES_CARS: -0.08 // Transport costs impact
    }
  },
  "Rate-Cut Reflation": {
    name: "Rate-Cut Reflation",
    description: "Policy easing and sentiment rebound lift risk assets; duration rallies; gold softens on real yields.",
    horizon_years: 3,
    mu: {
      GLOBAL_EQUITY: 0.12,
      UK_EQUITY_VALUE: 0.08,
      GROWTH_TECH: 0.16,
      PROPERTY_UK_RESI: 0.03,
      GILTS_LONG: 0.18,
      HY_CREDIT: 0.08,
      GOLD: -0.05,
      COMMODITIES: 0.05,
      CRYPTO_BTC: 0.20,
      CRYPTO_ETH: 0.25, // ETH 1.25x multiplier on positive
      IG_CREDIT: 0.02,
      CASH: 0.0,
      BILLS_SHORT_GILTS: 0.0,
      ALTERNATIVES: 0.084, // 0.7 * (0.12) = 0.084
      COLLECTIBLES_ART: 0.046, // 0.3 * (0.12) + 0.2 * (0.05) = 0.036 + 0.01 = 0.046
      COLLECTIBLES_WINE: 0.039, // 0.2 * (0.12) + 0.3 * (0.05) = 0.024 + 0.015 = 0.039
      COLLECTIBLES_WHISKY: 0.03,
      COLLECTIBLES_CARS: 0.03
    }
  }
};

// Legacy scenario ID mapping for migration
export const LEGACY_SCENARIO_IDS: Record<string, string> = {
  "energy_spike": "Energy Shock",
  "property_down": "Property Crash", 
  "stagflation": "Stagflation",
  "reflation": "Rate-Cut Reflation",
  "recession": "AI Recession",
  "tech_correction": "Tech Burst",
  "devaluation": "Sterling Devaluation",
  "gilt_selloff": "Debt Spiral"
};

// Scenario name mapping for labels  
export const SCENARIO_LABELS: Record<string, string> = {
  "Debt Spiral": "Debt Spiral",
  "Property Crash": "Property Crash",
  "AI Recession": "AI Recession", 
  "Stagflation": "Stagflation",
  "Tech Burst": "Tech Burst",
  "Sterling Devaluation": "Sterling Devaluation",
  "Energy Shock": "Energy Shock",
  "Rate-Cut Reflation": "Rate-Cut Reflation"
};

// Asset class mapping configuration for new system
export const ASSET_CLASS_MAPPING = {
  // Core 9 asset classes to canonical buckets
  "Global Equity": "GLOBAL_EQUITY",
  "UK Equity": "UK_EQUITY_VALUE", 
  "Growth Tech": "GROWTH_TECH",
  "UK Property": "PROPERTY_UK_RESI",
  "Long Gilts": "GILTS_LONG",
  "HY Credit": "HY_CREDIT",
  "Gold": "GOLD",
  "Commodities": "COMMODITIES",
  "Crypto": ["CRYPTO_BTC", "CRYPTO_ETH"] // Split with different multipliers
};

// IG Credit specific shocks by scenario
export const IG_CREDIT_SHOCKS: Record<string, number> = {
  "Debt Spiral": -0.10,
  "Property Crash": -0.08,
  "AI Recession": -0.06,
  "Stagflation": -0.10,
  "Tech Burst": 0.05,
  "Sterling Devaluation": -0.08,
  "Energy Shock": -0.06,
  "Rate-Cut Reflation": 0.02
};

// Crypto split configuration (BTC x1.0, ETH x1.25, cap at ±80%)
export const CRYPTO_SPLIT_CONFIG = {
  CRYPTO_BTC: 1.0,
  CRYPTO_ETH: 1.25,
  cap_abs_pct: 0.80
};