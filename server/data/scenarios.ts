// Scenarios data for portfolio impact analysis
// This maps scenario IDs to their detailed performance data

export const scenarios: Record<string, any> = {
  "property_down": {
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
  "recession": {
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
  "stagflation": {
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
  "tech_correction": {
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
  "devaluation": {
    name: "Sterling Devaluation",
    horizon_years: 5,
    mu: {
      CASH: 0.01,
      BILLS_SHORT_GILTS: 0.0,
      GILTS_LONG: 0.0,
      IG_CREDIT: -0.02,
      HY_CREDIT: -0.05,
      GLOBAL_EQUITY: 0.08, // Benefits from FX
      UK_EQUITY_VALUE: -0.03,
      GROWTH_TECH: 0.05,
      PROPERTY_UK_RESI: -0.1,
      COMMODITIES: 0.1, // Commodity prices rise in GBP terms
      GOLD: 0.12, // Safe haven + FX benefit
      ALTERNATIVES: -0.08,
      CRYPTO_BTC: 0.15, // Alternative currency
      CRYPTO_ETH: 0.15,
      COLLECTIBLES_ART: 0.05, // International market
      COLLECTIBLES_WINE: 0.05,
      COLLECTIBLES_WHISKY: 0.08, // Exports benefit
      COLLECTIBLES_CARS: 0.05
    }
  },
  "reflation": {
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
  "gilt_selloff": {
    name: "Gilt Market Selloff",
    horizon_years: 3,
    mu: {
      CASH: 0.04,
      BILLS_SHORT_GILTS: 0.02,
      GILTS_LONG: -0.25,
      IG_CREDIT: -0.08,
      HY_CREDIT: -0.15,
      GLOBAL_EQUITY: -0.1,
      UK_EQUITY_VALUE: -0.15,
      GROWTH_TECH: -0.12,
      PROPERTY_UK_RESI: -0.08,
      COMMODITIES: 0.05,
      GOLD: 0.1,
      ALTERNATIVES: -0.05,
      CRYPTO_BTC: 0.0,
      CRYPTO_ETH: 0.0,
      COLLECTIBLES_ART: -0.05,
      COLLECTIBLES_WINE: -0.05,
      COLLECTIBLES_WHISKY: -0.05,
      COLLECTIBLES_CARS: -0.05
    }
  },
  "energy_spike": {
    name: "Energy Price Shock",
    horizon_years: 3,
    mu: {
      CASH: 0.02,
      BILLS_SHORT_GILTS: 0.01,
      GILTS_LONG: -0.05,
      IG_CREDIT: -0.05,
      HY_CREDIT: -0.1,
      GLOBAL_EQUITY: -0.08,
      UK_EQUITY_VALUE: -0.1,
      GROWTH_TECH: -0.15,
      PROPERTY_UK_RESI: -0.05,
      COMMODITIES: 0.25, // Energy commodities benefit
      GOLD: 0.12,
      ALTERNATIVES: 0.0,
      CRYPTO_BTC: 0.05,
      CRYPTO_ETH: 0.05,
      COLLECTIBLES_ART: -0.02,
      COLLECTIBLES_WINE: -0.02,
      COLLECTIBLES_WHISKY: 0.0,
      COLLECTIBLES_CARS: -0.08 // Transport costs hit classics
    }
  }
};

// Scenario ID to name mapping for labels
export const SCENARIO_LABELS: Record<string, string> = {
  "property_down": "Property Crash",
  "recession": "AI Recession",
  "stagflation": "Stagflation",
  "tech_correction": "Tech Burst",
  "devaluation": "Sterling Devaluation",
  "reflation": "Rate-Cut Reflation",
  "gilt_selloff": "Gilt Market Selloff",
  "energy_spike": "Energy Price Shock"
};