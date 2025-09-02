export interface BeliefQuestionOption {
  label: string;
  tags: Record<string, number>;
  scenarios: Record<string, number>;
}

export interface BeliefQuestion {
  id: string;
  prompt: string;
  options: Record<string, BeliefQuestionOption>;
}

// Selected belief questions that have scenario weights
export const BELIEF_QUESTIONS: BeliefQuestion[] = [
  {
    id: "q3_costs_up_10",
    prompt: "If fixed costs rose 10%, first reaction?",
    options: {
      negotiate: {
        label: "Negotiate with suppliers",
        tags: { adaptability: 1 },
        scenarios: { recession: -0.2 }
      },
      reduce_inv: {
        label: "Reduce investments",
        tags: { liquidity_pref: 1 },
        scenarios: { gilt_selloff: 0.2 }
      },
      use_credit: {
        label: "Use credit facilities",
        tags: { rate_sens: 1 },
        scenarios: { gilt_selloff: 0.6 }
      },
      side_income: {
        label: "Find additional income",
        tags: { resilience: 1 },
        scenarios: { recession: -0.2 }
      }
    }
  },
  {
    id: "q10_ai_effect",
    prompt: "In your field, AI will...",
    options: {
      replace: {
        label: "Replace many jobs",
        tags: { tech_conv: -1, ai_impact: 2 },
        scenarios: { tech_correction: 1.2, reflation: 0.4 }
      },
      augment: {
        label: "Augment human work",
        tags: { tech_conv: 1 },
        scenarios: { reflation: 0.5 }
      },
      little: {
        label: "Have little impact",
        tags: { tech_conv: 0 },
        scenarios: {}
      }
    }
  },
  {
    id: "q12_energy_up_20",
    prompt: "Energy bills +20%, you...",
    options: {
      switch: {
        label: "Switch providers",
        tags: { inflation_sens: 1 },
        scenarios: { stagflation: 0.2 }
      },
      insulate: {
        label: "Invest in insulation",
        tags: { inflation_sens: 2 },
        scenarios: { stagflation: 0.3 }
      },
      change_travel: {
        label: "Change travel habits",
        tags: { inflation_sens: 2 },
        scenarios: { energy_spike: 0.4 }
      },
      accept: {
        label: "Accept higher bills",
        tags: { inflation_sens: 3 },
        scenarios: { stagflation: 0.4, energy_spike: 0.4 }
      }
    }
  },
  {
    id: "q15_gbp_drop",
    prompt: "If GBP drops 15%, first you'd...",
    options: {
      shift_global: {
        label: "Shift to global assets",
        tags: { fxv: 2 },
        scenarios: { devaluation: 1.2 }
      },
      increase_gold: {
        label: "Increase gold holdings",
        tags: { gold_conv: 2, fxv: 1 },
        scenarios: { devaluation: 1.0, stagflation: 0.4 }
      },
      ignore: {
        label: "Ignore currency moves",
        tags: { passive_bias: 1 },
        scenarios: {}
      },
      rebalance_uk: {
        label: "Rebalance to UK assets",
        tags: { home_bias: 2 },
        scenarios: { devaluation: 0.2 }
      }
    }
  },
  {
    id: "q16_savings_rate_fall",
    prompt: "If savings rates fall from here, you...",
    options: {
      buy_long_gilts: {
        label: "Buy long-dated gilts",
        tags: { duration_pref: 2 },
        scenarios: { reflation: 0.8 }
      },
      move_credit: {
        label: "Move to credit markets",
        tags: { credit_pref: 2 },
        scenarios: { gilt_selloff: 0.4 }
      },
      add_equities: {
        label: "Add equity exposure",
        tags: { risk_tol: 1 },
        scenarios: { reflation: 0.5 }
      },
      leave_cash: {
        label: "Keep in cash",
        tags: { liquidity_pref: 1 },
        scenarios: { gilt_selloff: 0.3 }
      }
    }
  },
  {
    id: "q24_windfall_10pct",
    prompt: "A windfall =10% of portfolio; first to...",
    options: {
      debt: {
        label: "Pay down debt",
        tags: { liquidity_pref: 1 },
        scenarios: { gilt_selloff: 0.2 }
      },
      cash: {
        label: "Hold in cash",
        tags: { liquidity_pref: 2 },
        scenarios: { recession: 0.2 }
      },
      global_equity: {
        label: "Global equities",
        tags: { risk_tol: 1 },
        scenarios: { reflation: 0.3 }
      },
      gold_commod: {
        label: "Gold & commodities",
        tags: { gold_conv: 1, inflation_sens: 1 },
        scenarios: { stagflation: 0.3, energy_spike: 0.3 }
      },
      alts_eis: {
        label: "Alternatives/EIS",
        tags: { eis_open: 2 },
        scenarios: { devaluation: 0.4 }
      }
    }
  },
  {
    id: "q25_policy_confidence",
    prompt: "Govt more likely to stabilise or destabilise economy in 5y?",
    options: {
      stabilise: {
        label: "Stabilise the economy",
        tags: { pci: 2 },
        scenarios: { reflation: 0.6 }
      },
      neutral: {
        label: "Neither help nor hurt",
        tags: { pci: 0 },
        scenarios: {}
      },
      destabilise: {
        label: "Destabilise the economy",
        tags: { pci: -2 },
        scenarios: { gilt_selloff: 1.0, devaluation: 0.8, property_down: 0.6 }
      }
    }
  },
  {
    id: "q26_recession_cushion",
    prompt: "Confidence in policy cushioning a recession?",
    options: {
      high: {
        label: "High confidence",
        tags: { pci: 2 },
        scenarios: { reflation: 0.4 }
      },
      med: {
        label: "Medium confidence",
        tags: { pci: 1 },
        scenarios: {}
      },
      low: {
        label: "Low confidence",
        tags: { pci: -2 },
        scenarios: { recession: 0.5, gilt_selloff: 0.4 }
      }
    }
  }
];

// Scenario mapping from belief names to consistent IDs  
export const SCENARIO_MAPPING: Record<string, string> = {
  recession: "recession",
  property_down: "property_down", 
  stagflation: "stagflation",
  tech_correction: "tech_correction",
  devaluation: "devaluation",
  gilt_selloff: "gilt_selloff",
  energy_spike: "energy_spike",
  reflation: "reflation"
};

// Asset allocation defaults for each scenario
export const SCENARIO_DEFAULTS: Record<string, Record<string, number>> = {
  property_down: {
    GLOBAL_EQUITY: 0.40,
    UK_EQUITY_VALUE: 0.12,
    IG_CREDIT: 0.12,
    GILTS_LONG: 0.12,
    GILTS_SHORT: 0.14,
    CASH: 0.10
  },
  recession: {
    GLOBAL_EQUITY: 0.35,
    IG_CREDIT: 0.20,
    GILTS_SHORT: 0.20,
    UK_EQUITY_VALUE: 0.10,
    CASH: 0.15
  },
  stagflation: {
    GLOBAL_EQUITY: 0.30,
    GOLD: 0.20,
    COMMODITIES_ENERGY: 0.15,
    UK_EQUITY_VALUE: 0.15,
    IG_CREDIT: 0.10,
    CASH: 0.10
  },
  tech_correction: {
    GLOBAL_EQUITY: 0.35,
    IG_CREDIT: 0.20,
    GILTS_LONG: 0.15,
    GILTS_SHORT: 0.15,
    UK_EQUITY_VALUE: 0.15
  },
  devaluation: {
    GLOBAL_EQUITY: 0.45,
    GOLD: 0.15,
    COMMODITIES_ENERGY: 0.10,
    IG_CREDIT: 0.15,
    CASH: 0.15
  },
  reflation: {
    GLOBAL_EQUITY: 0.45,
    GROWTH_TECH: 0.15,
    GILTS_LONG: 0.15,
    IG_CREDIT: 0.15,
    CASH: 0.10
  },
  gilt_selloff: {
    CASH: 0.25,
    GILTS_SHORT: 0.25,
    GLOBAL_EQUITY: 0.25,
    UK_EQUITY_VALUE: 0.15,
    GOLD: 0.10
  },
  energy_spike: {
    GLOBAL_EQUITY: 0.30,
    UK_EQUITY_VALUE: 0.20,
    COMMODITIES_ENERGY: 0.20,
    GOLD: 0.15,
    CASH: 0.15
  }
};

// Asset display names
export const ASSET_NAMES: Record<string, string> = {
  GLOBAL_EQUITY: "Global Equity",
  UK_EQUITY_VALUE: "UK Value Equity", 
  IG_CREDIT: "Investment Grade Credit",
  GILTS_LONG: "Long Gilts",
  GILTS_SHORT: "Short Gilts",
  CASH: "Cash",
  GOLD: "Gold",
  COMMODITIES_ENERGY: "Energy Commodities",
  GROWTH_TECH: "Growth Tech"
};