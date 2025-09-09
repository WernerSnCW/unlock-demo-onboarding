// Scenarios data for portfolio impact analysis
// This maps scenario IDs to their detailed performance data

export const scenarios: Record<string, any> = {
  "S001": {
    name: "Property Crash (2008-style)",
    horizon_years: 5,
    mu: {
      CASH: 0.02,
      BILLS_SHORT_GILTS: 0.04,
      GILTS_LONG: 0.08,
      IG_CREDIT: -0.08,
      HY_CREDIT: -0.2,
      GLOBAL_EQUITY: -0.25,
      UK_EQUITY_VALUE: -0.2,
      GROWTH_TECH: -0.3,
      PROPERTY_UK_RESI: -0.15,
      COMMODITIES: -0.1,
      GOLD: 0.12,
      ALTERNATIVES: -0.08,
      CRYPTO_BTC: -0.35,
      CRYPTO_ETH: -0.45,
      COLLECTIBLES_ART: -0.05,
      COLLECTIBLES_WINE: -0.08,
      COLLECTIBLES_WHISKY: -0.1,
      COLLECTIBLES_CARS: -0.06
    }
  },
  "S002": {
    name: "AI-Driven Economic Recession",
    horizon_years: 5,
    mu: {
      CASH: 0.03,
      BILLS_SHORT_GILTS: 0.05,
      GILTS_LONG: 0.1,
      IG_CREDIT: -0.06,
      HY_CREDIT: -0.15,
      GLOBAL_EQUITY: -0.18,
      UK_EQUITY_VALUE: -0.12,
      GROWTH_TECH: -0.22,
      PROPERTY_UK_RESI: -0.1,
      COMMODITIES: -0.08,
      GOLD: 0.08,
      ALTERNATIVES: -0.05,
      CRYPTO_BTC: -0.3,
      CRYPTO_ETH: -0.38,
      COLLECTIBLES_ART: -0.06,
      COLLECTIBLES_WINE: -0.06,
      COLLECTIBLES_WHISKY: -0.08,
      COLLECTIBLES_CARS: -0.05
    }
  },
  "S003": {
    name: "Stagflation (1970s-style)",
    horizon_years: 5,
    mu: {
      CASH: 0.01,
      BILLS_SHORT_GILTS: -0.02,
      GILTS_LONG: -0.18,
      IG_CREDIT: -0.1,
      HY_CREDIT: -0.2,
      GLOBAL_EQUITY: -0.2,
      UK_EQUITY_VALUE: -0.05,
      GROWTH_TECH: -0.25,
      PROPERTY_UK_RESI: 0.02,
      COMMODITIES: 0.2,
      GOLD: 0.18,
      ALTERNATIVES: -0.04,
      CRYPTO_BTC: 0.05,
      CRYPTO_ETH: 0.08,
      COLLECTIBLES_ART: -0.03,
      COLLECTIBLES_WINE: -0.05,
      COLLECTIBLES_WHISKY: -0.05,
      COLLECTIBLES_CARS: -0.02
    }
  },
  "S004": {
    name: "Tech & Speculative Asset Burst",
    horizon_years: 5,
    mu: {
      CASH: 0.02,
      BILLS_SHORT_GILTS: 0.03,
      GILTS_LONG: 0.15,
      IG_CREDIT: 0.05,
      HY_CREDIT: -0.05,
      GLOBAL_EQUITY: -0.22,
      UK_EQUITY_VALUE: -0.05,
      GROWTH_TECH: -0.4,
      PROPERTY_UK_RESI: -0.04,
      COMMODITIES: -0.08,
      GOLD: 0.1,
      ALTERNATIVES: -0.2,
      CRYPTO_BTC: -0.7,
      CRYPTO_ETH: -0.8,
      COLLECTIBLES_ART: -0.08,
      COLLECTIBLES_WINE: -0.06,
      COLLECTIBLES_WHISKY: -0.08,
      COLLECTIBLES_CARS: -0.05
    }
  },
  "S005": {
    name: "UK Tax Regime Shift",
    horizon_years: 5,
    mu: {
      CASH: 0.01,
      BILLS_SHORT_GILTS: 0.0,
      GILTS_LONG: 0.0,
      IG_CREDIT: -0.02,
      HY_CREDIT: -0.05,
      GLOBAL_EQUITY: -0.05,
      UK_EQUITY_VALUE: -0.03,
      GROWTH_TECH: 0.0,
      PROPERTY_UK_RESI: -0.1,
      COMMODITIES: 0.0,
      GOLD: 0.02,
      ALTERNATIVES: -0.08,
      CRYPTO_BTC: 0.0,
      CRYPTO_ETH: 0.0,
      COLLECTIBLES_ART: 0.0,
      COLLECTIBLES_WINE: 0.0,
      COLLECTIBLES_WHISKY: 0.0,
      COLLECTIBLES_CARS: 0.0
    }
  },
  "S006": {
    name: "Rate-Cut Reflation",
    horizon_years: 3,
    mu: {
      CASH: 0.02,
      BILLS_SHORT_GILTS: 0.0,
      GILTS_LONG: 0.18,
      IG_CREDIT: 0.1,
      HY_CREDIT: 0.0,
      GLOBAL_EQUITY: 0.12,
      UK_EQUITY_VALUE: 0.08,
      GROWTH_TECH: 0.16,
      PROPERTY_UK_RESI: 0.03,
      COMMODITIES: 0.05,
      GOLD: -0.05,
      ALTERNATIVES: 0.0,
      CRYPTO_BTC: 0.2,
      CRYPTO_ETH: 0.25,
      COLLECTIBLES_ART: 0.0,
      COLLECTIBLES_WINE: 0.0,
      COLLECTIBLES_WHISKY: 0.0,
      COLLECTIBLES_CARS: 0.0
    }
  },
  "S007": {
    name: "Stagflation 2.0 (acute)",
    horizon_years: 3,
    mu: {
      CASH: 0.01,
      BILLS_SHORT_GILTS: 0.0,
      GILTS_LONG: -0.15,
      IG_CREDIT: 0.0,
      HY_CREDIT: 0.0,
      GLOBAL_EQUITY: -0.15,
      UK_EQUITY_VALUE: -0.05,
      GROWTH_TECH: -0.18,
      PROPERTY_UK_RESI: 0.0,
      COMMODITIES: 0.2,
      GOLD: 0.12,
      ALTERNATIVES: 0.0,
      CRYPTO_BTC: 0.0,
      CRYPTO_ETH: 0.0,
      COLLECTIBLES_ART: 0.0,
      COLLECTIBLES_WINE: 0.0,
      COLLECTIBLES_WHISKY: 0.0,
      COLLECTIBLES_CARS: 0.0
    }
  }
};

// Scenario ID to name mapping for labels
export const SCENARIO_LABELS: Record<string, string> = {
  "S001": "Property Crash",
  "S002": "AI Recession", 
  "S003": "Stagflation",
  "S004": "Tech Burst",
  "S005": "Tax Shift",
  "S006": "Reflation",
  "S007": "Stagflation 2.0",
  "property_down": "Property Crash",
  "recession": "AI Recession",
  "tech_correction": "Tech Burst"
};