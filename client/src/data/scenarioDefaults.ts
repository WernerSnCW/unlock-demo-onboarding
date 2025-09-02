// Scenario default allocations
// Based on defaults.py

export interface ScenarioAllocation {
  [asset: string]: number;
}

export const SCENARIO_DEFAULTS: Record<string, ScenarioAllocation> = {
  "S001": { // property_crash
    "GLOBAL_EQUITY": 0.40,
    "UK_EQUITY_VALUE": 0.12,
    "IG_CREDIT": 0.12,
    "GILTS_LONG": 0.12,
    "GILTS_SHORT": 0.14,
    "CASH": 0.10
  },
  "S002": { // ai_recession
    "GLOBAL_EQUITY": 0.35,
    "IG_CREDIT": 0.20,
    "GILTS_SHORT": 0.20,
    "UK_EQUITY_VALUE": 0.10,
    "CASH": 0.15
  },
  "S003": { // stagflation
    "GLOBAL_EQUITY": 0.30,
    "GOLD": 0.20,
    "COMMODITIES_ENERGY": 0.15,
    "UK_EQUITY_VALUE": 0.15,
    "IG_CREDIT": 0.10,
    "CASH": 0.10
  },
  "S004": { // tech_burst
    "GLOBAL_EQUITY": 0.35,
    "IG_CREDIT": 0.20,
    "GILTS_LONG": 0.15,
    "GILTS_SHORT": 0.15,
    "UK_EQUITY_VALUE": 0.15
  },
  "S005": { // tax_shift
    "GLOBAL_EQUITY": 0.40,
    "UK_EQUITY_VALUE": 0.20,
    "IG_CREDIT": 0.15,
    "GILTS_LONG": 0.15,
    "CASH": 0.10
  },
  "S006": { // reflation
    "GLOBAL_EQUITY": 0.45,
    "GROWTH_TECH": 0.15,
    "GILTS_LONG": 0.15,
    "IG_CREDIT": 0.15,
    "CASH": 0.10
  },
  "S007": { // stagflation_2
    "GLOBAL_EQUITY": 0.25,
    "GOLD": 0.20,
    "COMMODITIES_ENERGY": 0.20,
    "UK_EQUITY_VALUE": 0.15,
    "CASH": 0.20
  },
  "S008": { // devaluation
    "GLOBAL_EQUITY": 0.45,
    "GOLD": 0.15,
    "COMMODITIES_ENERGY": 0.10,
    "IG_CREDIT": 0.15,
    "CASH": 0.15
  },
  "S009": { // gilt_selloff
    "CASH": 0.25,
    "GILTS_SHORT": 0.25,
    "GLOBAL_EQUITY": 0.25,
    "UK_EQUITY_VALUE": 0.15,
    "GOLD": 0.10
  },
  "S010": { // energy_spike
    "GLOBAL_EQUITY": 0.30,
    "UK_EQUITY_VALUE": 0.20,
    "COMMODITIES_ENERGY": 0.20,
    "GOLD": 0.15,
    "CASH": 0.15
  }
};

// Asset display names
export const ASSET_NAMES: Record<string, string> = {
  "GLOBAL_EQUITY": "Global Equity",
  "UK_EQUITY_VALUE": "UK Value Equity", 
  "GROWTH_TECH": "Growth Tech",
  "IG_CREDIT": "Investment Grade Credit",
  "GILTS_LONG": "Long-term Gilts",
  "GILTS_SHORT": "Short-term Gilts", 
  "CASH": "Cash",
  "GOLD": "Gold",
  "COMMODITIES_ENERGY": "Energy Commodities",
  "PROPERTY_UK_RESI": "UK Residential Property",
  "UK_REITs": "UK REITs",
  "CRYPTO_BTC": "Bitcoin",
  "CRYPTO_ETH": "Ethereum", 
  "CRYPTO_ALT": "Alternative Crypto",
  "COLLECTIBLES_ART": "Art",
  "COLLECTIBLES_WINE": "Wine",
  "COLLECTIBLES_WATCHES": "Watches",
  "COLLECTIBLES_CARS": "Classic Cars",
  "COLLECTIBLES_WHISKY": "Whisky",
  "COLLECTIBLES_JEWELLERY": "Jewellery"
};