// Investment Personas with 8-dimensional scoring
// Dimensions: [Risk, Property, Alternatives, Tax, Income, Horizon, Liquidity, Advisor]

export interface PersonaDef {
  code: string;
  name: string;
  description: string;
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
    description: "Nearing or in retirement, focused on generating sustainable income while preserving capital and managing longevity risk through diversified, tax-efficient strategies.",
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
    description: "Property-focused investor who concentrates heavily on real estate for rental income and capital appreciation, balancing leverage risk with diversification needs.",
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
    description: "Young, tech-savvy investor pursuing high growth through significant cryptocurrency allocation while managing extreme volatility and concentration risk.",
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
    description: "Conservative investor prioritizing capital preservation through traditional safe assets like cash, bonds, and dividend stocks while avoiding market volatility.",
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
    description: "Wealthy individual building intergenerational wealth through diversified portfolios, estate planning, and alternative investments while minimizing inheritance tax.",
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
    description: "Tech industry professional managing concentrated stock positions, RSUs, and vesting events while diversifying away from employer risk through growth-oriented investments.",
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
    description: "Income-focused investor building a portfolio of dividend-paying stocks and REITs for sustainable cash flow, prioritizing quality yields over growth.",
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
    description: "Early-career professional automating investments through low-cost index funds while saving for major goals like home ownership and building long-term wealth.",
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
    description: "Location-independent investor requiring portable, globally diversified investments with multi-currency exposure and flexible liquidity for cross-border lifestyle.",
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
    description: "Professional advisor using sophisticated model portfolios with robust risk controls, balancing client needs with regulatory compliance and cost efficiency.",
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
    description: "Tax-optimization focused investor maximizing annual ISA and SIPP allowances while using tax-efficient products like VCTs and EIS for long-term growth.",
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
    description: "Professional with guaranteed DB pension enabling higher risk tolerance in personal investments, integrating pension income with private asset allocation.",
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
    description: "Risk-averse investor building wealth slowly through diversified balanced funds, disciplined DCA strategies, and strong emphasis on capital protection.",
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
    description: "Young wealthy inheritor learning to manage substantial family wealth through professional advisory services, focusing on preservation and generational planning.",
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
    description: "Business owner balancing reinvestment in their company with personal diversification, using barbell liquidity approach and tax-efficient entrepreneurial reliefs.",
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
    description: "Buy-to-let specialist with extensive leveraged property portfolio, seeking to optimize yields and reduce concentration risk through diversification into liquid markets.",
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
    description: "Retirement-phase investor managing sequence-of-returns risk through defensive strategies, sustainable withdrawal policies, and high liquidity preservation.",
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
    description: "Investor with significant single-stock concentration seeking to systematically reduce idiosyncratic risk while building diversified core portfolio around legacy position.",
    portfolioValue: 950_000,
    wealthTier: "Mass-Affluent",
    approach: "SELF_DIRECTED",
    riskProfile: "Moderate (idiosyncratic)",
    age_range: [35, 60],
    goals: [
      "Reduce single-stock concentration risk over time",
      "Use a collar or hedge where tax-efficient",
      "Build a diversified core around the legacy position",
      "Manage the tax implications of diversification"
    ],
    scores: [3.5, 1.5, 2.0, 3.0, 2.0, 3.0, 2.0, 2.5],
    liquidityMonths: 5,
    drawdownCap: 0.35,
    notes: "Single stock risk; diversification urgency",
    propertyBias: 0.15,
    techBias: 0.40,
    altBias: 0.20,
    concentrationTolerance: "low"
  },
  "P019": {
    code: "P019",
    name: "The HNW Family Office Client",
    description: "Ultra-high-net-worth individual accessing sophisticated institutional investments, trusts, and structures through family office for multi-generational wealth preservation.",
    portfolioValue: 8_500_000,
    wealthTier: "UHNW",
    approach: "FULL_SERVICE",
    riskProfile: "Sophisticated",
    age_range: [40, 70],
    goals: [
      "Preserve wealth across generations via trusts and structures",
      "Access institutional-grade alternatives and direct investments",
      "Coordinate tax, legal, and investment aspects holistically",
      "Align investment policy with family governance and philanthropy"
    ],
    scores: [3.5, 5.0, 5.0, 2.5, 3.0, 5.0, 4.0, 5.0],
    liquidityMonths: 12,
    drawdownCap: 0.30,
    notes: "Multi-generational; FO/trust structures",
    propertyBias: 0.60,
    techBias: 0.30,
    altBias: 0.50,
    concentrationTolerance: "med"
  }
};

// Dimension labels for the 8-dimensional scores
export const DIMENSION_LABELS = [
  "Risk Tolerance",
  "Property Allocation", 
  "Alternative Investments",
  "Tax Optimization",
  "Income Focus",
  "Time Horizon",
  "Liquidity Needs",
  "Advisory Preference"
];

// Dimension weights for persona matching algorithm
export const DIMENSION_WEIGHTS = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0];

// Configuration for persona matching
export const CONFIG = {
  tieBreakGap: 0.15,
  showRunnerUpWhenClose: true
};