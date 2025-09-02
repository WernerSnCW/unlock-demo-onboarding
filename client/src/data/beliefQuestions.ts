// Belief questions for scenario mapping
// Based on questions.py - filtered for questions with scenario weights

export interface BeliefQuestionOption {
  text: string;
  tags: Record<string, number>;
  scenarios: Record<string, number>;
}

export interface BeliefQuestionData {
  id: string;
  prompt: string;
  options: Record<string, BeliefQuestionOption>;
}

export const BELIEF_QUESTIONS: BeliefQuestionData[] = [
  {
    id: "q10_ai_effect",
    prompt: "In your field, AI will...",
    options: {
      replace: {
        text: "Replace many jobs including mine",
        tags: { tech_conv: -1, ai_impact: 2 },
        scenarios: { ai_recession: 1.2, tech_burst: 0.4 }
      },
      augment: {
        text: "Augment my productivity significantly", 
        tags: { tech_conv: 1 },
        scenarios: { reflation: 0.5 }
      },
      little: {
        text: "Have little impact on my work",
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
        text: "Switch supplier immediately",
        tags: { inflation_sens: 1 },
        scenarios: { stagflation: 0.2 }
      },
      insulate: {
        text: "Invest in home insulation",
        tags: { inflation_sens: 2 },
        scenarios: { stagflation: 0.3 }
      },
      change_travel: {
        text: "Change travel patterns",
        tags: { inflation_sens: 2 },
        scenarios: { energy_spike: 0.4 }
      },
      accept: {
        text: "Accept the higher costs",
        tags: { inflation_sens: 3 },
        scenarios: { stagflation: 0.4, energy_spike: 0.4 }
      }
    }
  },
  {
    id: "q13_fuel_high_12m", 
    prompt: "If fuel stays high 12m, you...",
    options: {
      public_transport: {
        text: "Switch to public transport",
        tags: { adapt_speed: 1 },
        scenarios: { energy_spike: 0.2 }
      },
      switch_ev: {
        text: "Buy an electric vehicle",
        tags: { adapt_speed: 1 },
        scenarios: { energy_spike: 0.2 }
      },
      car_share: {
        text: "Use car sharing services",
        tags: { adapt_speed: 1 },
        scenarios: { energy_spike: 0.1 }
      },
      no_change: {
        text: "Make no changes",
        tags: { adapt_speed: -1 },
        scenarios: { energy_spike: 0.3, stagflation: 0.2 }
      }
    }
  },
  {
    id: "q14_overseas_income",
    prompt: "Overseas income/spend next 2y?",
    options: {
      mostly_gbp: {
        text: "Mostly UK-based",
        tags: { fxv: -1 },
        scenarios: {}
      },
      mixed: {
        text: "Mixed UK and overseas", 
        tags: { fxv: 1 },
        scenarios: { devaluation: 0.4 }
      },
      mostly_fx: {
        text: "Mostly overseas",
        tags: { fxv: 2 },
        scenarios: { devaluation: 0.8 }
      }
    }
  },
  {
    id: "q15_gbp_drop",
    prompt: "If GBP drops 15%, first you'd...",
    options: {
      shift_global: {
        text: "Shift to global investments",
        tags: { fxv: 2 },
        scenarios: { devaluation: 1.2 }
      },
      increase_gold: {
        text: "Increase gold allocation",
        tags: { gold_conv: 2, fxv: 1 },
        scenarios: { devaluation: 1.0, stagflation: 0.4 }
      },
      ignore: {
        text: "Ignore and stay the course",
        tags: { passive_bias: 1 },
        scenarios: {}
      },
      rebalance_uk: {
        text: "Rebalance towards UK assets",
        tags: { home_bias: 2 },
        scenarios: { tax_shift: 0.2 }
      }
    }
  },
  {
    id: "q16_savings_rate_fall",
    prompt: "If savings rates fall from here, you...",
    options: {
      buy_long_gilts: {
        text: "Buy long-term gilts",
        tags: { duration_pref: 2 },
        scenarios: { reflation: 0.8 }
      },
      move_credit: {
        text: "Move to corporate bonds",
        tags: { credit_pref: 2 },
        scenarios: { gilt_selloff: 0.4 }
      },
      add_equities: {
        text: "Add more equities",
        tags: { risk_tol: 1 },
        scenarios: { reflation: 0.5 }
      },
      leave_cash: {
        text: "Leave money in cash",
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
        text: "Pay down debt",
        tags: { liquidity_pref: 1 },
        scenarios: { gilt_selloff: 0.2 }
      },
      cash: {
        text: "Hold as cash",
        tags: { liquidity_pref: 2 },
        scenarios: { recession: 0.2 }
      },
      global_equity: {
        text: "Global equity funds",
        tags: { risk_tol: 1 },
        scenarios: { reflation: 0.3 }
      },
      gold_commod: {
        text: "Gold and commodities",
        tags: { gold_conv: 1, inflation_sens: 1 },
        scenarios: { stagflation: 0.3, energy_spike: 0.3 }
      },
      alts_eis: {
        text: "Alternative investments/EIS",
        tags: { eis_open: 2 },
        scenarios: { tax_shift: 0.4 }
      }
    }
  },
  {
    id: "q25_policy_confidence", 
    prompt: "Govt more likely to stabilise or destabilise economy in 5y?",
    options: {
      stabilise: {
        text: "Stabilise the economy",
        tags: { pci: 2 },
        scenarios: { reflation: 0.6 }
      },
      neutral: {
        text: "Neither - maintain status quo",
        tags: { pci: 0 },
        scenarios: {}
      },
      destabilise: {
        text: "Destabilise through poor policy",
        tags: { pci: -2 },
        scenarios: { gilt_selloff: 1.0, devaluation: 0.8, tax_shift: 0.6 }
      }
    }
  },
  {
    id: "q26_recession_cushion",
    prompt: "Confidence in policy cushioning a recession?",
    options: {
      high: {
        text: "High confidence in policy response",
        tags: { pci: 2 },
        scenarios: { reflation: 0.4 }
      },
      med: {
        text: "Moderate confidence",
        tags: { pci: 1 },
        scenarios: {}
      },
      low: {
        text: "Low confidence in policy",
        tags: { pci: -2 },
        scenarios: { recession: 0.5, gilt_selloff: 0.4 }
      }
    }
  }
];

// Scenario mapping from belief names to S-codes
export const SCENARIO_MAPPING: Record<string, string> = {
  "property_crash": "S001",
  "ai_recession": "S002", 
  "stagflation": "S003",
  "tech_burst": "S004",
  "tax_shift": "S005",
  "reflation": "S006",
  "stagflation_2": "S007",
  "devaluation": "S008",
  "gilt_selloff": "S009",
  "energy_spike": "S010"
};

// Reverse mapping for display
export const SCENARIO_NAMES: Record<string, string> = {
  "S001": "Property Crash",
  "S002": "AI Recession", 
  "S003": "Stagflation",
  "S004": "Tech Burst",
  "S005": "Tax Shift",
  "S006": "Reflation",
  "S007": "Stagflation 2", 
  "S008": "Devaluation",
  "S009": "Gilt Selloff",
  "S010": "Energy Spike"
};