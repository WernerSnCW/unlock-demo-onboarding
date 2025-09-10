// New Economic Scenario Belief Questions (B1-B15)
// Based on Unlock Scenario Belief Engine v2.1

export interface BeliefQuestion {
  id: string;
  statement: string;
  direction: string;
  weights: Record<string, number>;
}

export interface BeliefScale {
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
}

export const SCALE_LABELS: BeliefScale = {
  1: "Strongly Disagree",
  2: "Disagree", 
  3: "Neutral / Unsure",
  4: "Agree",
  5: "Strongly Agree"
};

export const BELIEF_QUESTIONS: BeliefQuestion[] = [
  {
    id: "B1_mobility_views",
    statement: "The next generation will have better financial opportunities than today.",
    direction: "lower->AI Recession, Property Crash, Stagflation",
    weights: {
      "AI Recession": 0.12,
      "Property Crash": 0.10,
      "Stagflation": 0.08
    }
  },
  {
    id: "B2_job_security_white_collar",
    statement: "White-collar jobs will remain secure over the next 5 years.",
    direction: "lower->AI Recession, Tech Burst",
    weights: {
      "AI Recession": 0.20,
      "Tech Burst": 0.15
    }
  },
  {
    id: "B3_remote_work_tenure",
    statement: "Remote and hybrid work arrangements will remain stable over the next 3 years.",
    direction: "lower->Property Crash, Sterling Devaluation",
    weights: {
      "Property Crash": 0.12,
      "Sterling Devaluation": 0.08
    }
  },
  {
    id: "B4_government_confidence",
    statement: "The UK government will manage debt and inflation effectively.",
    direction: "lower->Debt Spiral, Stagflation, Sterling Devaluation",
    weights: {
      "Debt Spiral": 0.18,
      "Stagflation": 0.10,
      "Sterling Devaluation": 0.10
    }
  },
  {
    id: "B5_energy_policy",
    statement: "Energy supply disruptions or higher energy taxes are likely in the next 3 years.",
    direction: "higher->Energy Shock, Stagflation",
    weights: {
      "Energy Shock": 0.22,
      "Stagflation": 0.15
    }
  },
  {
    id: "B6_ai_adoption_speed",
    statement: "Industries will rapidly adopt AI to replace tasks.",
    direction: "higher->AI Recession, Tech Burst",
    weights: {
      "AI Recession": 0.22,
      "Tech Burst": 0.16
    }
  },
  {
    id: "B7_renting_vs_buying",
    statement: "For a 30-year-old today, renting is a better choice than buying over the next 5 years.",
    direction: "higher->Property Crash",
    weights: {
      "Property Crash": 0.18
    }
  },
  {
    id: "B8_local_investment_preference",
    statement: "Investing in local businesses and infrastructure is more attractive than investing in property.",
    direction: "higher->Property Crash, Rate-Cut Reflation",
    weights: {
      "Property Crash": 0.10,
      "Rate-Cut Reflation": 0.08
    }
  },
  {
    id: "B9_geopolitical_risk",
    statement: "A major geopolitical shock will disrupt supply chains in the next 3 years.",
    direction: "higher->Energy Shock, Stagflation",
    weights: {
      "Energy Shock": 0.20,
      "Stagflation": 0.14
    }
  },
  {
    id: "B10_fx_view",
    statement: "The British pound will depreciate against the US dollar and euro over the next 2 years.",
    direction: "higher->Sterling Devaluation",
    weights: {
      "Sterling Devaluation": 0.22
    }
  },
  {
    id: "B11_credit_availability",
    statement: "SMEs and households will find it easy to get credit in the next 2 years.",
    direction: "lower->Debt Spiral, AI Recession",
    weights: {
      "Debt Spiral": 0.16,
      "AI Recession": 0.12
    }
  },
  {
    id: "B12_policy_support",
    statement: "Significant interest rate cuts or fiscal support are likely in the next 12 months.",
    direction: "higher->Rate-Cut Reflation",
    weights: {
      "Rate-Cut Reflation": 0.30,
      "AI Recession": -0.10,
      "Debt Spiral": -0.10
    }
  },
  {
    id: "B13_fiscal_sustainability",
    statement: "UK government interest payments will grow faster than tax revenues, creating a debt sustainability problem.",
    direction: "higher->Debt Spiral, Sterling Devaluation",
    weights: {
      "Debt Spiral": 0.30,
      "Sterling Devaluation": 0.15
    }
  },
  {
    id: "B14_mortgage_reset_pressure",
    statement: "Rising mortgage costs will force households to cut back spending significantly over the next 2 years.",
    direction: "higher->Property Crash, AI Recession",
    weights: {
      "Property Crash": 0.25,
      "AI Recession": 0.10
    }
  },
  {
    id: "B15_external_balance_risk",
    statement: "The UK's trade and current account deficits will widen unsustainably.",
    direction: "higher->Sterling Devaluation, Debt Spiral",
    weights: {
      "Sterling Devaluation": 0.25,
      "Debt Spiral": 0.10
    }
  }
];

// Legacy ID mapping for migration support
export const LEGACY_QUESTION_MAPPING: Record<string, string> = {
  "q10_ai_effect": "B6_ai_adoption_speed",
  "q12_energy_up_20": "B5_energy_policy",
  "q13_fuel_high_12m": "B9_geopolitical_risk"
};

// Legacy scenario mapping for migration support
export const LEGACY_SCENARIO_MAPPING: Record<string, string> = {
  "energy_spike": "Energy Shock",
  "property_down": "Property Crash",
  "stagflation": "Stagflation",
  "reflation": "Rate-Cut Reflation",
  "ai_recession": "AI Recession",
  "tech_burst": "Tech Burst",
  "devaluation": "Sterling Devaluation",
  "gilt_selloff": "Debt Spiral"
};

// New scenario names
export const SCENARIO_NAMES: Record<string, string> = {
  "Debt Spiral": "Debt Spiral",
  "Property Crash": "Property Crash", 
  "AI Recession": "AI Recession",
  "Stagflation": "Stagflation",
  "Tech Burst": "Tech Burst",
  "Sterling Devaluation": "Sterling Devaluation",
  "Energy Shock": "Energy Shock",
  "Rate-Cut Reflation": "Rate-Cut Reflation"
};