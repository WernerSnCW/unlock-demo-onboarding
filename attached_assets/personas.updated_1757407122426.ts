// Investment Personas with 8-dimensional scoring
// Dimensions: [Risk, Property, Alternatives, Tax, Income, Horizon, Liquidity, Advisor]

export interface PersonaDef {
  code: string;
  name: string;
  portfolioValue: number;
  wealthTier: string;
  approach: string;
  riskProfile: string;
    age_range: [number, number];
  goals: string[];
scores: number[]; // 8-dimensional scores [0-5]
  liquidityMonths: number;
  drawdownCap: number;
  notes: string;
  propertyBias: number;
  techBias: number;
  altBias: number;
  concentrationTolerance: string;
}

export const INVESTMENT_PERSONAS: Record<string, PersonaDef> = {
  "P001": {
    code: "P001",
    name: "The Retirement Planner",
    portfolioValue: 1_250_000,
    wealthTier: "Upper Mass-Affluent",
    approach: "HYBRID",
    riskProfile: "Balanced",
        age_range: [55, 70],
    goals: [
      "Sustain retirement income with a safe withdrawal rate",
      "Preserve capital and manage longevity risk",
      "Optimise tax across ISA/SIPP and drawdown sequencing",
      "Keep inflation hedges and low-cost diversification"
    ],
scores: [3.0, 3.0, 2.5, 4.0, 3.0, 4.5, 3.5, 3.0],
    liquidityMonths: 9,
    drawdownCap: 0.24,
    notes: "Pension-focused diversified",
    propertyBias: 0.30,
    techBias: 0.30,
    altBias: 0.25,
    concentrationTolerance: "med"
  },
  "P002": {
    code: "P002",
    name: "The Property Lover",
    portfolioValue: 1_200_000,
    wealthTier: "Upper Mass-Affluent",
    approach: "SELF_DIRECTED",
    riskProfile: "Moderate",
        age_range: [35, 60],
    goals: [
      "Grow rental income and equity in property portfolio",
      "Manage leverage and interest-rate risk prudently",
      "Balance property with diversified liquid assets",
      "Optimise ownership structure and tax treatment"
    ],
scores: [3.5, 5.0, 1.5, 2.0, 4.0, 3.0, 2.5, 2.0],
    liquidityMonths: 6,
    drawdownCap: 0.24,
    notes: "78% property tilt",
    propertyBias: 0.85,
    techBias: 0.10,
    altBias: 0.15,
    concentrationTolerance: "high"
  },
  "P003": {
    code: "P003",
    name: "The Crypto Enthusiast",
    portfolioValue: 780_000,
    wealthTier: "Mass-Affluent",
    approach: "SELF_DIRECTED",
    riskProfile: "Aggressive",
        age_range: [22, 40],
    goals: [
      "Pursue high growth through crypto within a risk cap",
      "Adopt a core–satellite allocation with broad market core",
      "Manage extreme volatility and sequence risk",
      "Track tax lots and reporting obligations"
    ],
scores: [5.0, 0.5, 4.5, 2.0, 1.0, 2.0, 1.0, 1.5],
    liquidityMonths: 2,
    drawdownCap: 0.35,
    notes: "51% crypto; tech heavy",
    propertyBias: 0.05,
    techBias: 0.70,
    altBias: 0.45,
    concentrationTolerance: "high"
  },
  "P004": {
    code: "P004",
    name: "The Old Fashioned Saver",
    portfolioValue: 450_000,
    wealthTier: "Mass-Affluent",
    approach: "SELF_DIRECTED",
    riskProfile: "Conservative",
        age_range: [50, 75],
    goals: [
      "Protect capital with cash, gilts, and investment-grade bonds",
      "Maintain purchasing power while avoiding large drawdowns",
      "Keep the portfolio simple and low-cost",
      "Hold adequate emergency reserves"
    ],
scores: [1.5, 2.0, 1.0, 3.0, 4.0, 2.0, 4.5, 2.0],
    liquidityMonths: 10,
    drawdownCap: 0.18,
    notes: "Cash/Bonds/Dividend focus",
    propertyBias: 0.20,
    techBias: 0.10,
    altBias: 0.10,
    concentrationTolerance: "low"
  },
  "P005": {
    code: "P005",
    name: "The Legacy Builder",
    portfolioValue: 2_400_000,
    wealthTier: "HNW",
    approach: "SELF_DIRECTED",
    riskProfile: "Moderate",
        age_range: [40, 65],
    goals: [
      "Build intergenerational wealth and legacy",
      "Mitigate IHT through trusts, gifting, and wrappers",
      "Balance growth with capital preservation",
      "Document succession and philanthropic intent"
    ],
scores: [3.5, 4.5, 4.0, 3.5, 2.5, 5.0, 3.5, 2.5],
    liquidityMonths: 9,
    drawdownCap: 0.25,
    notes: "Alt investments & estate planning",
    propertyBias: 0.50,
    techBias: 0.30,
    altBias: 0.40,
    concentrationTolerance: "med"
  },
  "P006": {
    code: "P006",
    name: "The Tech Worker",
    portfolioValue: 840_000,
    wealthTier: "Mass-Affluent",
    approach: "SELF_DIRECTED",
    riskProfile: "Growth",
        age_range: [25, 45],
    goals: [
      "Diversify RSUs/options away from employer risk",
      "Maximise ISA/SIPP and manage vesting tax events",
      "Maintain a robust emergency fund",
      "Tilt growth while avoiding over-concentration in tech"
    ],
scores: [4.5, 1.5, 2.5, 3.0, 1.5, 3.0, 2.5, 2.0],
    liquidityMonths: 4,
    drawdownCap: 0.30,
    notes: "Company stock concentration",
    propertyBias: 0.15,
    techBias: 0.80,
    altBias: 0.25,
    concentrationTolerance: "med"
  },
  "P007": {
    code: "P007",
    name: "The Dividend Seeker",
    portfolioValue: 650_000,
    wealthTier: "Mass-Affluent",
    approach: "HYBRID",
    riskProfile: "Income",
        age_range: [45, 70],
    goals: [
      "Generate dependable dividend income",
      "Favour dividend growth and quality over headline yield",
      "Use tax wrappers to reduce dividend taxation",
      "Avoid yield traps and maintain diversification"
    ],
scores: [2.5, 3.5, 1.5, 3.0, 4.5, 3.0, 3.0, 3.5],
    liquidityMonths: 6,
    drawdownCap: 0.22,
    notes: "UK dividend tilt; REITs",
    propertyBias: 0.35,
    techBias: 0.15,
    altBias: 0.15,
    concentrationTolerance: "med"
  },
  "P008": {
    code: "P008",
    name: "The Young Professional",
    portfolioValue: 170_000,
    wealthTier: "Entry Mass-Affluent",
    approach: "SELF_DIRECTED",
    riskProfile: "Growth",
        age_range: [22, 35],
    goals: [
      "Automate investing and build a low-cost core portfolio",
      "Save towards home deposit and career mobility",
      "Keep 6–12 months of expenses in cash",
      "Accept higher equity exposure for long-term growth"
    ],
scores: [4.0, 1.5, 1.0, 4.0, 1.0, 2.0, 2.0, 2.0],
    liquidityMonths: 3,
    drawdownCap: 0.30,
    notes: "Indexing + small spec",
    propertyBias: 0.15,
    techBias: 0.55,
    altBias: 0.10,
    concentrationTolerance: "med"
  },
  "P009": {
    code: "P009",
    name: "The Global Nomad",
    portfolioValue: 510_000,
    wealthTier: "Mass-Affluent",
    approach: "HYBRID",
    riskProfile: "Balanced",
        age_range: [28, 50],
    goals: [
      "Maintain portability for cross-border life",
      "Use multi-currency, globally diversified holdings",
      "Stay compliant with tax residency and reporting",
      "Keep higher liquidity for relocations"
    ],
scores: [3.0, 2.5, 2.0, 2.5, 2.0, 3.0, 3.0, 3.0],
    liquidityMonths: 6,
    drawdownCap: 0.25,
    notes: "Currency mgmt; global funds",
    propertyBias: 0.25,
    techBias: 0.35,
    altBias: 0.20,
    concentrationTolerance: "med"
  },
  "P010": {
    code: "P010",
    name: "The Financial Advisor",
    portfolioValue: 950_000,
    wealthTier: "Mass-Affluent",
    approach: "SELF_DIRECTED",
    riskProfile: "Balanced+",
        age_range: [35, 60],
    goals: [
      "Deploy model portfolios with robust risk controls",
      "Balance client income needs with long-term growth",
      "Evidence suitability and compliance",
      "Keep costs, rebalancing, and taxes efficient"
    ],
scores: [3.5, 3.5, 3.5, 3.5, 3.0, 3.5, 3.0, 2.0],
    liquidityMonths: 6,
    drawdownCap: 0.26,
    notes: "Pro diversification incl alts",
    propertyBias: 0.35,
    techBias: 0.35,
    altBias: 0.35,
    concentrationTolerance: "med"
  },
  "P011": {
    code: "P011",
    name: "The ISA/SIPP Maximiser",
    portfolioValue: 680_000,
    wealthTier: "Mass-Affluent",
    approach: "SELF_DIRECTED",
    riskProfile: "Growth",
        age_range: [30, 60],
    goals: [
      "Maximise ISA/SIPP allowances annually",
      "Use tax-efficient products (VCT/EIS where suitable)",
      "Minimise fees and leakage",
      "Grow a diversified, long-horizon portfolio"
    ],
scores: [4.0, 2.0, 2.0, 5.0, 2.0, 3.0, 2.5, 2.0],
    liquidityMonths: 4,
    drawdownCap: 0.28,
    notes: "Tax wrapper optimisation",
    propertyBias: 0.20,
    techBias: 0.45,
    altBias: 0.20,
    concentrationTolerance: "med"
  },
  "P012": {
    code: "P012",
    name: "The Defined Benefit Heavy",
    portfolioValue: 420_000,
    wealthTier: "Mass-Affluent (Liquid)",
    approach: "HYBRID",
    riskProfile: "Aggressive (DB-backed)",
        age_range: [50, 70],
    goals: [
      "Integrate defined-benefit income with DC/ISA assets",
      "Hedge inflation and interest-rate exposures",
      "Keep risk moderate given guaranteed income floor",
      "Plan for tax-efficient withdrawals"
    ],
scores: [4.5, 1.5, 2.5, 2.0, 4.0, 2.5, 2.5, 3.0],
    liquidityMonths: 4,
    drawdownCap: 0.32,
    notes: "DB enables higher risk",
    propertyBias: 0.15,
    techBias: 0.45,
    altBias: 0.25,
    concentrationTolerance: "med"
  },
  "P013": {
    code: "P013",
    name: "The Cautious Accumulator",
    portfolioValue: 320_000,
    wealthTier: "Mass-Affluent",
    approach: "HYBRID",
    riskProfile: "Conservative",
        age_range: [30, 50],
    goals: [
      "Accumulate steadily with low drawdown risk",
      "Prioritise diversification and capital protection",
      "Use DCA and disciplined rebalancing",
      "Maintain adequate cash reserves"
    ],
scores: [2.0, 2.0, 1.0, 3.0, 2.5, 2.5, 4.0, 3.5],
    liquidityMonths: 9,
    drawdownCap: 0.20,
    notes: "Balanced funds, gilts, cash",
    propertyBias: 0.20,
    techBias: 0.15,
    altBias: 0.10,
    concentrationTolerance: "low"
  },
  "P014": {
    code: "P014",
    name: "The High Net Worth Inheritor",
    portfolioValue: 3_200_000,
    wealthTier: "HNW+",
    approach: "FULL_SERVICE",
    riskProfile: "Moderate",
        age_range: [25, 45],
    goals: [
      "Preserve and professionalise inherited wealth",
      "Build financial literacy and a governance framework",
      "Plan for IHT and intergenerational transfers",
      "Diversify away from legacy concentrations"
    ],
scores: [3.0, 4.5, 4.0, 2.0, 3.5, 4.5, 3.5, 4.5],
    liquidityMonths: 9,
    drawdownCap: 0.24,
    notes: "Discretionary, PE/HF, family office",
    propertyBias: 0.55,
    techBias: 0.30,
    altBias: 0.40,
    concentrationTolerance: "med"
  },
  "P015": {
    code: "P015",
    name: "The Entrepreneur",
    portfolioValue: 1_100_000,
    wealthTier: "Upper Mass-Affluent",
    approach: "SELF_DIRECTED",
    riskProfile: "Growth/Opportunistic",
        age_range: [28, 55],
    goals: [
      "Barbell liquidity: ample cash plus growth assets",
      "Reinvest in the business while diversifying personally",
      "Use EIS/SEIS and entrepreneur reliefs where eligible",
      "Manage income volatility and runway risk"
    ],
scores: [4.5, 2.0, 5.0, 3.0, 1.5, 3.5, 3.0, 2.0],
    liquidityMonths: 6,
    drawdownCap: 0.32,
    notes: "Biz equity; EIS/VC",
    propertyBias: 0.20,
    techBias: 0.45,
    altBias: 0.50,
    concentrationTolerance: "med"
  },
  "P016": {
    code: "P016",
    name: "The BTL Mogul",
    portfolioValue: 2_800_000,
    wealthTier: "HNW",
    approach: "SELF_DIRECTED",
    riskProfile: "Moderate/Income",
        age_range: [35, 65],
    goals: [
      "Optimise leveraged BTL portfolio yield and risk",
      "Reduce concentration by adding liquid markets",
      "Use SPVs/structures for efficient taxation",
      "Stress-test for rate rises and voids"
    ],
scores: [3.0, 5.0, 2.0, 1.5, 4.5, 3.5, 3.0, 1.5],
    liquidityMonths: 6,
    drawdownCap: 0.22,
    notes: "8 BTLs; dev fund; leverage sensitivity",
    propertyBias: 0.90,
    techBias: 0.10,
    altBias: 0.20,
    concentrationTolerance: "high"
  },
  "P017": {
    code: "P017",
    name: "The Pension Drawdown Specialist",
    portfolioValue: 850_000,
    wealthTier: "Mass-Affluent",
    approach: "HYBRID",
    riskProfile: "Income/Defensive",
        age_range: [58, 75],
    goals: [
      "Manage sequence-of-returns risk in drawdown",
      "Set a sustainable withdrawal policy",
      "Plan tax-efficient withdrawals and allowances",
      "Keep inflation hedges and longevity protection"
    ],
scores: [1.5, 2.0, 1.0, 3.5, 4.5, 4.0, 5.0, 3.5],
    liquidityMonths: 12,
    drawdownCap: 0.20,
    notes: "Cash ladder; defensive equity",
    propertyBias: 0.20,
    techBias: 0.10,
    altBias: 0.10,
    concentrationTolerance: "low"
  },
  "P018": {
    code: "P018",
    name: "The Concentrated Stock Holder",
    portfolioValue: 950_000,
    wealthTier: "Mass-Affluent",
    approach: "SELF_DIRECTED",
    riskProfile: "Moderate (idiosyncratic)",
        age_range: [35, 60],
    goals: [
      "Reduce single-stock concentration risk over time",
      "Stage sales to manage CGT and market impact",
      "Use hedging or collars where appropriate",
      "Build a diversified core alongside the position"
    ],
scores: [3.5, 1.0, 2.0, 2.5, 1.5, 3.0, 3.0, 2.0],
    liquidityMonths: 6,
    drawdownCap: 0.28,
    notes: "42% single-stock",
    propertyBias: 0.10,
    techBias: 0.30,
    altBias: 0.20,
    concentrationTolerance: "high"
  },
  "P019": {
    code: "P019",
    name: "The Ultra-Conservative Saver",
    portfolioValue: 280_000,
    wealthTier: "Entry Mass-Affluent",
    approach: "SELF_DIRECTED",
    riskProfile: "Very Conservative",
        age_range: [50, 80],
    goals: [
      "Protect capital first and foremost",
      "Keep costs and complexity very low",
      "Hold cash and high-quality fixed income",
      "Beat inflation modestly without large drawdowns"
    ],
scores: [1.0, 1.0, 0.5, 3.0, 1.5, 1.5, 5.0, 2.0],
    liquidityMonths: 12,
    drawdownCap: 0.15,
    notes: "NS&I/gilts; inflation risk",
    propertyBias: 0.10,
    techBias: 0.05,
    altBias: 0.05,
    concentrationTolerance: "low"
  }
};

// Dimension configuration
export const DIMENSION_LABELS = [
  "Risk Tolerance",
  "Property Exposure", 
  "Alternatives Orientation",
  "Tax Optimisation",
  "Income Source Bias",
  "Horizon / Legacy",
  "Liquidity Preference",
  "Advisor Reliance"
];

export const DIMENSION_WEIGHTS = [1.5, 1.0, 1.0, 0.8, 0.9, 1.0, 1.5, 0.6];

export const CONFIG = {
  tieBreakGap: 5,
  showRunnerUpWhenClose: true,
  explanationsEnabled: true
};