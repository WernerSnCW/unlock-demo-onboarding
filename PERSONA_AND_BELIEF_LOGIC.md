# Persona and Belief System Logic Documentation

This document explains the core logic behind the investor persona identification system and the economic belief-based outcome prediction engine.

## Table of Contents

1. [Persona Creation and Identification](#1-persona-creation-and-identification)
2. [Question-Answer Matching Logic](#2-question-answer-matching-logic)
3. [Belief-Based Outcome Prediction](#3-belief-based-outcome-prediction)

---

## 1. Persona Creation and Identification

### 1.1 Overview

The system defines **19 distinct investor personas** that represent different investor profiles based on wealth level, risk appetite, investment preferences, and behavioral characteristics. Each persona is characterized by an **8-dimensional profile** that captures their investment personality.

### 1.2 The 19 Investor Personas

| Code | Persona Name | Wealth Tier | Risk Profile | Portfolio Value |
|------|-------------|-------------|--------------|-----------------|
| P001 | The Retirement Planner | Upper Mass-Affluent | Balanced | £1,250,000 |
| P002 | The Property Lover | Upper Mass-Affluent | Moderate | £1,200,000 |
| P003 | The Crypto Enthusiast | Mass-Affluent | Aggressive | £780,000 |
| P004 | The Old Fashioned Saver | Mass-Affluent | Conservative | £450,000 |
| P005 | The Legacy Builder | HNW | Moderate | £2,400,000 |
| P006 | The Tech Worker | Mass-Affluent | Growth | £840,000 |
| P007 | The Dividend Seeker | Mass-Affluent | Income | £650,000 |
| P008 | The Young Professional | Entry Mass-Affluent | Growth | £170,000 |
| P009 | The Global Nomad | Mass-Affluent | Balanced | £510,000 |
| P010 | The Financial Advisor | Mass-Affluent | Balanced | £950,000 |
| P011 | The ISA/SIPP Maximiser | Mass-Affluent | Balanced | £720,000 |
| P012 | The Defined Benefit Heavy | Upper Mass-Affluent | Conservative | £1,400,000 |
| P013 | The Cautious Accumulator | Mass-Affluent | Cautious | £380,000 |
| P014 | The High Net Worth Inheritor | HNW | Balanced | £3,200,000 |
| P015 | The Entrepreneur | HNW | Growth | £2,800,000 |
| P016 | The BTL Mogul | Upper Mass-Affluent | Moderate | £1,600,000 |
| P017 | The Pension Drawdown Specialist | Upper Mass-Affluent | Income | £1,100,000 |
| P018 | The Concentrated Stock Holder | Mass-Affluent | Growth | £920,000 |
| P019 | The Ultra-Conservative Saver | Mass-Affluent | Conservative | £550,000 |

### 1.3 The 8-Dimensional Scoring System

Each persona is defined by scores (0-5 scale) across 8 dimensions:

| Dimension Index | Dimension Name | Description |
|----------------|----------------|-------------|
| 0 | **Risk Tolerance** | Willingness to accept market volatility and drawdowns |
| 1 | **Property Allocation** | Preference for real estate vs. other asset classes |
| 2 | **Alternative Investments** | Interest in alternatives (crypto, collectibles, PE, etc.) |
| 3 | **Tax Optimization** | Priority on tax-efficient wrappers (ISAs, SIPPs) |
| 4 | **Income Focus** | Emphasis on generating current income vs. growth |
| 5 | **Time Horizon** | Investment timeframe and legacy planning orientation |
| 6 | **Liquidity Needs** | Requirement for accessible cash reserves |
| 7 | **Advisory Preference** | Reliance on professional advisors vs. self-direction |

**Example: P001 "The Retirement Planner"**
```
Scores: [3.0, 3.0, 2.5, 4.0, 3.0, 4.5, 3.5, 3.0]

Interpretation:
- Risk Tolerance: 3.0 (Moderate - balanced approach)
- Property Allocation: 3.0 (Moderate property exposure)
- Alternative Investments: 2.5 (Some interest but not primary focus)
- Tax Optimization: 4.0 (High priority on ISA/SIPP efficiency)
- Income Focus: 3.0 (Moderate - sustainable withdrawals)
- Time Horizon: 4.5 (Long-term - managing longevity risk)
- Liquidity Needs: 3.5 (Moderate-high - need accessible reserves)
- Advisory Preference: 3.0 (Hybrid approach - some guidance)
```

### 1.4 Additional Persona Characteristics

Beyond the 8-dimensional scores, each persona also has:

- **Liquidity Months**: Target cash buffer (e.g., 9 months for P001)
- **Drawdown Cap**: Maximum acceptable portfolio decline (e.g., 24% for P001)
- **Property Bias**: Portfolio tilt toward property (0.0-1.0)
- **Tech Bias**: Portfolio tilt toward technology (0.0-1.0)
- **Alt Bias**: Portfolio tilt toward alternatives (0.0-1.0)
- **Concentration Tolerance**: Willingness to hold concentrated positions (low/med/high)

### 1.5 How Personas Were Created

The personas were designed through:

1. **Market Research**: Analysis of real investor behaviors, wealth segments, and investment patterns in the UK market
2. **Behavioral Clustering**: Grouping investors by common goals, risk profiles, and asset preferences
3. **Wealth Stratification**: Covering the spectrum from Entry Mass-Affluent (£170k) to UHNW (£8.5m+)
4. **Goal Alignment**: Each persona has specific investment objectives (retirement income, legacy building, growth, etc.)
5. **Calibration**: 8-dimensional scores calibrated to reflect realistic investor profiles

---

## 2. Question-Answer Matching Logic

### 2.1 Overview

The persona identification system uses a **10-question quiz** where each question targets specific dimensions. User responses are converted to dimensional scores, which are then matched against the 19 predefined personas using **weighted cosine similarity**.

### 2.2 The Question Structure

Each question has:
- **Primary Dimension**: The main dimension it measures (0-7)
- **Options**: Multiple choice answers
- **Score Vectors**: Each option has an 8-dimensional score vector

**Example Question:**
```javascript
{
  id: "risk_tolerance",
  text: "When markets fall 15% in a year, do you usually see it as:",
  dimension: 0, // Risk Tolerance
  options: [
    { text: "A buying opportunity", scores: [5,0,0,0,0,0,0,0] },
    { text: "A reason to hold steady", scores: [3,0,0,0,0,0,0,0] },
    { text: "A signal to reduce exposure", scores: [1,0,0,0,0,0,0,0] }
  ]
}
```

### 2.3 The 10 Core Questions

1. **Q1: Risk Tolerance** - Response to market downturns (Dimension 0)
2. **Q2: Income Source** - Primary financial security source (Dimension 4)
3. **Q3: Asset Preference** - Preference for property vs. markets vs. alternatives (Dimension 1)
4. **Q4: Time Horizon** - Short-term vs. long-term vs. legacy thinking (Dimension 5)
5. **Q5: Liquidity** - Cash availability requirements (Dimension 6)
6. **Q6: Alternatives** - Interest in collectibles/early-stage investments (Dimension 2)
7. **Q7: Decision Making** - Self-directed vs. advisor-reliant (Dimension 7)
8. **Q8: Market Crash Behavior** - Actual behavior during 2020 crash (Dimension 0)
9. **Q9: Investment Purpose** - Lifestyle funding vs. wealth transfer (Dimension 5)
10. **Q10: Tax Wrappers** - ISA/SIPP maximization vs. flexibility (Dimension 3)

### 2.4 Score Accumulation and Normalization

**Step 1: Accumulate Raw Scores**

As the user answers questions, their responses accumulate into a raw 8-dimensional score vector:

```javascript
rawScores = [0, 0, 0, 0, 0, 0, 0, 0]

For each answer:
  rawScores[i] += selectedOption.scores[i]  // for i = 0 to 7
```

**Example:**
```
Q1: "A buying opportunity" → scores: [5,0,0,0,0,0,0,0]
Q2: "Dividends" → scores: [0,0,0,0,5,0,0,0]
Q3: "Property" → scores: [0,5,0,0,0,0,0,0]

rawScores = [5, 5, 0, 0, 5, 0, 0, 0]
```

**Step 2: Calculate Dimension Maxima**

Find the maximum possible score for each dimension across all questions:

```javascript
maxima = [0, 0, 0, 0, 0, 0, 0, 0]

for each question:
  for each option:
    for dimension i in 0..7:
      maxima[i] = max(maxima[i], option.scores[i])
```

**Step 3: Normalize to 0-5 Scale**

```javascript
normalizedScores[i] = min(5, max(0, (rawScores[i] / maxima[i]) * 5))
```

This ensures all user profiles are on the same 0-5 scale as the predefined personas.

### 2.5 Weighted Cosine Similarity Matching

**Step 1: Apply Dimension Weights**

Currently, all dimensions have equal weight (1.0):

```javascript
DIMENSION_WEIGHTS = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]

weightedUserProfile[i] = normalizedScores[i] * DIMENSION_WEIGHTS[i]
weightedPersonaScores[i] = persona.scores[i] * DIMENSION_WEIGHTS[i]
```

**Step 2: Calculate Cosine Similarity**

For each of the 19 personas, calculate cosine similarity:

```javascript
cosineSimilarity(userProfile, personaProfile) = 
  dotProduct / (magnitudeA * magnitudeB)

where:
  dotProduct = Σ(userProfile[i] * personaProfile[i])
  magnitudeA = sqrt(Σ(userProfile[i]²))
  magnitudeB = sqrt(Σ(personaProfile[i]²))
```

**Step 3: Convert to Match Score**

```javascript
matchScore = round(cosineSimilarity * 100)  // 0-100 scale
```

**Example Calculation:**

```
User Profile: [4.0, 3.5, 2.0, 4.0, 3.0, 4.5, 3.5, 3.0]
P001 Profile: [3.0, 3.0, 2.5, 4.0, 3.0, 4.5, 3.5, 3.0]

dotProduct = (4.0*3.0) + (3.5*3.0) + (2.0*2.5) + (4.0*4.0) + 
             (3.0*3.0) + (4.5*4.5) + (3.5*3.5) + (3.0*3.0)
           = 12.0 + 10.5 + 5.0 + 16.0 + 9.0 + 20.25 + 12.25 + 9.0
           = 94.0

magnitudeUser = sqrt(4.0² + 3.5² + 2.0² + 4.0² + 3.0² + 4.5² + 3.5² + 3.0²)
              = sqrt(16 + 12.25 + 4 + 16 + 9 + 20.25 + 12.25 + 9)
              = sqrt(98.75) = 9.94

magnitudeP001 = sqrt(3.0² + 3.0² + 2.5² + 4.0² + 3.0² + 4.5² + 3.5² + 3.0²)
              = sqrt(87.75) = 9.37

similarity = 94.0 / (9.94 * 9.37) = 94.0 / 93.14 = 0.991
matchScore = round(0.991 * 100) = 99
```

### 2.6 Confidence Calculation

After sorting personas by match score, confidence is calculated:

```javascript
For the top match:
  runnerUpScore = matches[1].matchScore
  gap = topMatchScore - runnerUpScore
  
  baseConfidence = min(95, topMatchScore)
  gapBonus = min(20, gap * 2)  // Up to 20% bonus for large gaps
  
  confidence = min(99, round(baseConfidence + gapBonus))

For other matches:
  confidence = topConfidence * (score / topScore) * 0.8
```

### 2.7 Tie-Breaking Logic (Safety Bias)

When the gap between the top two matches is ≤15% (CONFIG.tieBreakGap = 0.15):

```javascript
if (firstMatchScore - secondMatchScore <= 15) {
  // Choose the SAFER persona
  
  // First check risk tolerance (lower is safer)
  if (second.scores[0] < first.scores[0]) {
    return second as top match
  }
  
  // If risk is equal, check liquidity (higher is safer)
  if (first.scores[0] === second.scores[0]) {
    if (second.scores[6] > first.scores[6]) {
      return second as top match
    }
  }
}
```

**Rationale**: When matches are very close, the system defaults to the more conservative option to protect the investor.

### 2.8 Alignment Analysis

After identifying the top match, the system analyzes which dimensions align well and which differ:

```javascript
// Calculate absolute differences for each dimension
differences[i] = abs(userScore[i] - personaScore[i])

// Sort by difference (ascending)
sortedDimensions = sort(differences)

// Top 3 most aligned (smallest differences)
alignedDimensions = sortedDimensions[0..2].map(d => d.label)

// Notable differences (difference >= 2.0)
notableDifferences = sortedDimensions
  .filter(d => d.difference >= 2.0)
  .slice(0, 3)
  .map(d => d.label)
```

---

## 3. Belief-Based Outcome Prediction

### 3.1 Overview

The belief system converts investor responses to **15 economic belief questions (B1-B15)** into **independent scenario probabilities** that predict how different economic scenarios might impact their portfolio. This uses a sophisticated signal processing pipeline with correlation dampening, regime adjustments, and exponential decay.

### 3.2 The 15 Economic Belief Questions

Each question asks about future economic conditions on a **1-5 Likert scale**:
- 1 = Strongly Disagree
- 2 = Disagree
- 3 = Neutral
- 4 = Agree
- 5 = Strongly Agree

| ID | Question | Direction Logic |
|----|----------|----------------|
| B1 | Do you expect the next generation to have better financial opportunities? | lower→AI Recession, Property Crash, Stagflation |
| B2 | How secure do you feel white-collar jobs are over the next 5 years? | lower→AI Recession, Tech Burst |
| B3 | How stable do you expect remote/hybrid work arrangements to be? | lower→Property Crash, Sterling Devaluation |
| B4 | How confident are you in UK government debt/inflation management? | lower→Debt Spiral, Stagflation, Sterling Devaluation |
| B5 | How likely are energy supply disruptions or higher energy taxes? | higher→Energy Shock, Stagflation |
| B6 | How quickly will your industry adopt AI to replace tasks? | higher→AI Recession, Tech Burst |
| B7 | Is renting better than buying for a 30-year-old over 5 years? | higher→Property Crash |
| B8 | How attractive is investing in local businesses vs. property? | higher→Property Crash, Rate-Cut Reflation |
| B9 | How likely is a major geopolitical shock affecting supply chains? | higher→Energy Shock, Stagflation |
| B10 | How likely is GBP to depreciate against USD/EUR over 2 years? | higher→Sterling Devaluation |
| B11 | How easy will credit be for SMEs/households in the next 2 years? | lower→Debt Spiral, AI Recession |
| B12 | How likely are significant rate cuts or fiscal support in 12 months? | higher→Rate-Cut Reflation |
| B13 | Will UK government interest payments grow faster than tax revenues? | higher→Debt Spiral, Sterling Devaluation |
| B14 | Will rising mortgage costs force households to cut spending significantly? | higher→Property Crash, AI Recession |
| B15 | Will the UK's trade and current account deficits widen unsustainably? | higher→Sterling Devaluation, Debt Spiral |

### 3.3 Economic Scenarios Tracked

The system tracks probabilities for these economic scenarios:

- **AI Recession**: Economic recession driven by job displacement from AI adoption
- **Property Crash**: UK residential property market decline
- **Stagflation**: High inflation combined with low economic growth
- **Debt Spiral**: UK government bond market stress and debt sustainability concerns
- **Sterling Devaluation**: British pound depreciation vs. major currencies
- **Energy Shock**: Energy price spike or supply disruptions
- **Tech Burst**: Technology sector correction
- **Rate-Cut Reflation**: Policy-driven economic reflation through rate cuts and fiscal support

### 3.4 Signal Processing Pipeline

The belief-to-outcome prediction follows this multi-stage pipeline:

```
User Responses (1-5 scale)
    ↓
[1] Convert to Signals (-1 to +1, centered at 3=0)
    ↓
[2] Apply Direction Logic (lower→ vs higher→)
    ↓
[3] Drop Negative Signals to 0
    ↓
[4] Apply Correlation Dampening
    ↓
[5] Aggregate into Scenario Scores using Weights
    ↓
[6] Apply Regime Multipliers
    ↓
[7] Apply Exponential Time Decay
    ↓
[8] Convert to Independent Probabilities
    ↓
Final Scenario Probabilities (0-1 scale, non-normalized)
```

### 3.5 Step-by-Step Logic

**Step 1: Convert to Signals**

Transform 1-5 scale responses to -1 to +1 signals centered at neutral (3):

```javascript
signal = (answer - 3) / 2

Examples:
  1 (Strongly Disagree) → -1.0
  2 (Disagree) → -0.5
  3 (Neutral) → 0.0
  4 (Agree) → 0.5
  5 (Strongly Agree) → 1.0
```

**Step 2: Apply Direction Logic**

Each question has a direction that determines how the signal affects scenarios:

- **"lower→scenarios"**: Lower agreement (negative signal) increases scenario risk
- **"higher→scenarios"**: Higher agreement (positive signal) increases scenario risk

```javascript
if (direction.startsWith("lower->")) {
  adjustedSignal = -signal  // Invert the signal
} else if (direction.startsWith("higher->")) {
  adjustedSignal = signal   // Keep signal as-is
}
```

**Example:**
```
B1: "Next generation will have better opportunities"
Answer: 2 (Disagree) → signal = -0.5
Direction: "lower→recession, property_down, stagflation"
adjustedSignal = -(-0.5) = +0.5  // Disagreement increases these scenario risks
```

**Step 3: Drop Negative Signals to 0**

Only positive signals contribute to scenario scores:

```javascript
contributingSignal = max(0, adjustedSignal)
```

This prevents "protective" beliefs from creating negative scenario scores.

**Step 4: Apply Correlation Dampening**

To avoid double-counting correlated beliefs, dampen signals based on correlations:

```javascript
// Correlation map example
correlations = {
  "B4|B13": -0.70,  // Government confidence vs. fiscal sustainability
  "B5|B9": 0.60,    // Energy policy vs. geopolitical risk
  "B2|B1": 0.65,    // Job security vs. mobility views
  ...
}

// Dampening formula
dampedSignal[i] = signal[i] / (1 + 0.5 * Σ|correlation(i,j)| for active j)
```

**Example:**
```
B5 (energy policy) signal = 0.8
B9 (geopolitical risk) signal = 0.6
Correlation(B5, B9) = 0.60

dampedSignal[B5] = 0.8 / (1 + 0.5 * 0.60) = 0.8 / 1.30 = 0.615
```

**Step 5: Aggregate into Scenario Scores**

Each question-scenario pair has a weight that determines contribution:

```javascript
// Example weights from beliefs.json
weights = {
  "B1_mobility_views": {
    "recession": 0.2,
    "property_down": 0.1,
    "stagflation": 0.05
  },
  "B4_government_confidence": {
    "gilt_selloff": 0.25,
    "stagflation": 0.1,
    "devaluation": 0.1
  },
  ...
}

// Aggregation
scenarioScore[scenario] = Σ (dampedSignal[q] * weight[q][scenario])
```

**Example:**
```
B1 dampedSignal = 0.5
B4 dampedSignal = 0.7

recession_score = (0.5 * 0.2) + ... = aggregated from all questions
stagflation_score = (0.5 * 0.05) + (0.7 * 0.1) + ...
```

**Step 6: Apply Regime Multipliers**

Adjust scenarios based on current economic regime:

```javascript
regimeMultipliers = {
  "low": 0.8,      // Low volatility environment
  "normal": 1.0,   // Normal conditions
  "high": 1.4,     // Elevated uncertainty
  "crisis": 1.8    // Crisis conditions
}

adjustedScore[scenario] = scenarioScore[scenario] * regimeMultiplier
```

**Step 7: Apply Exponential Time Decay**

Different scenarios decay at different rates over time:

```javascript
decayRates = {
  "Energy Shock": 0.25,      // λ = 0.25 per year
  "Stagflation": 0.15,
  "Debt Spiral": 0.12,
  "Property Crash": 0.08,
  "Tech Burst": 0.06,
  ...
}

months = 12  // Default horizon
decayFactor = exp(-λ * (months / 12))

finalScore[scenario] = adjustedScore[scenario] * decayFactor
```

**Example:**
```
Energy Shock:
  λ = 0.25
  12-month decay = exp(-0.25 * 1) = exp(-0.25) = 0.779

If adjustedScore = 2.0:
  finalScore = 2.0 * 0.779 = 1.558
```

**Step 8: Convert to Independent Probabilities**

Use Poisson-complement formula to convert scores to probabilities:

```javascript
k = 1.0  // Sensitivity parameter

probability[scenario] = 1 - exp(-k * max(0, finalScore))
```

**Key property**: This formula allows **multiple scenarios to have high probabilities simultaneously** (unlike softmax normalization which forces them to sum to 1.0).

**Example:**
```
Energy Shock finalScore = 1.558
probability = 1 - exp(-1.0 * 1.558) = 1 - exp(-1.558) = 1 - 0.210 = 0.790 (79%)

Property Crash finalScore = 0.924
probability = 1 - exp(-1.0 * 0.924) = 1 - exp(-0.924) = 1 - 0.397 = 0.603 (60%)

Both scenarios can have high probabilities because they could occur together!
```

### 3.6 Using Scenario Probabilities for Portfolio Analysis

Once scenario probabilities are calculated, they're used to:

1. **Stress Test Portfolios**: Apply scenario-specific returns to current allocation
2. **Calculate Expected Outcomes**: Weight outcomes by probability
3. **Identify Vulnerabilities**: Highlight high-risk scenarios for the investor's profile
4. **Recommend Adjustments**: Suggest allocation changes to mitigate top risks

**Example Scenario Impact:**

```
Scenario: Property Crash (probability = 60%)
Impact on assets:
  - PROPERTY_UK_RESI: -25%
  - UK_REITs: -20%
  - GILTS_SHORT: +5%
  - CASH: 0%

For investor with 40% property allocation:
  Portfolio impact = 0.40 * (-0.25) + ... = -10% (weighted by 0.60 probability)
```

### 3.7 Persona-Specific Adjustments

After calculating scenario probabilities, the system applies **persona-specific rules** to the base allocation:

1. **Minimum Liquidity**: Ensure cash/short-term holdings meet persona's liquidityMonths requirement
2. **Concentration Limits**: Cap single asset exposure based on concentrationTolerance (low/med/high)
3. **Property Caps**: Special limits for property-heavy personas (e.g., P016 BTL Mogul)
4. **Tech/Crypto Adjustments**: Reduce exposure in tech_correction scenario for tech-heavy personas
5. **Bias Tilts**: Apply propertyBias, techBias, altBias to reflect persona preferences

**Example Rule (P016 BTL Mogul):**
```javascript
// Hard property cap at 65% normally
if (propertyAllocation > 0.65) {
  excess = propertyAllocation - 0.65
  allocation.PROPERTY_UK_RESI = 0.65
  allocation.GILTS_SHORT += 0.6 * excess
  allocation.GOLD += 0.4 * excess
}

// Even stricter cap (45%) in property crash scenario
if (scenario === "property_crash" && propertyAllocation > 0.45) {
  // Rebalance to safer assets
}
```

---

## 4. Portfolio Analysis and Scenario Impact Calculation

### 4.1 Overview

Once scenario probabilities are calculated from the belief system, they're used to analyze the investor's current portfolio and generate worst-case impact projections. This system uses **compounding mathematics** (not simple addition) to accurately model what happens if multiple scenarios occur simultaneously.

### 4.2 Worst-Case Scenario Impact (Cumulative Analysis)

The system calculates portfolio impact under the assumption that **ALL selected scenarios occur together** - providing a genuine stress test rather than weighted averages.

**Endpoint**: `/api/scenario-impact`

**Step 1: Identify Selected Scenarios**

```javascript
for (const [scenarioId, weight] of Object.entries(scenarioWeights)) {
  if (weight > 0) {
    selectedScenarios.push(scenario);
  }
}
```

**Step 2: Calculate Individual Scenario Impact**

For each selected scenario, calculate how it affects the portfolio:

```javascript
// For each scenario
scenarioPortfolioReturn = Σ (allocation[asset] * scenarioReturn[asset])

// Example:
Current portfolio: {
  GLOBAL_EQUITY: 0.30 (30%),
  PROPERTY_UK_RESI: 0.25 (25%),
  CASH: 0.15 (15%),
  ...
}

Debt Spiral scenario returns: {
  GLOBAL_EQUITY: -0.20 (-20%),
  PROPERTY_UK_RESI: -0.15 (-15%),
  CASH: 0.00 (0%),
  ...
}

scenarioReturn = (0.30 * -0.20) + (0.25 * -0.15) + (0.15 * 0.00) + ...
              = -0.06 + -0.0375 + 0 + ...
              = -0.1325 (-13.25%)
```

**Step 3: Compound Multiple Scenarios**

This is the critical mathematical difference - scenarios compound, they don't add:

```javascript
// WRONG approach (simple addition):
totalReturn = scenario1_return + scenario2_return + scenario3_return

// CORRECT approach (compounding):
compoundedReturn = (1 + scenario1_return) * (1 + scenario2_return) * (1 + scenario3_return) - 1
```

**Example Calculation:**

```
Selected scenarios:
  - Debt Spiral: -13.25%
  - Property Crash: -18.50%
  
WRONG (addition): -13.25% + -18.50% = -31.75%

CORRECT (compounding):
  (1 + -0.1325) * (1 + -0.1850) - 1
  = (0.8675) * (0.8150) - 1
  = 0.7070 - 1
  = -0.2930 (-29.30%)

The compounded worst-case is actually BETTER than simple addition because
losses in sequence reduce the base for subsequent losses.
```

**Step 4: Calculate Asset-Level Impacts**

Each asset class experiences compounded returns from all scenarios:

```javascript
for (const assetClass of Object.keys(currentMix)) {
  let compoundedReturn = 1.0;
  
  for (const [scenarioId, weight] of Object.entries(scenarioWeights)) {
    if (weight > 0) {
      const scenarioReturn = scenario.mu[assetClass] || 0;
      compoundedReturn *= (1 + scenarioReturn);
    }
  }
  
  cumulativeAssetReturn = compoundedReturn - 1;
  assetValueChange = portfolioValueGBP * allocation * cumulativeAssetReturn;
  projectedValue = currentValue * (1 + cumulativeAssetReturn);
}
```

**Step 5: Portfolio Value Projection**

```javascript
currentPortfolioValue = £1,250,000
cumulativeReturn = -0.2930 (-29.30%)
totalValueChange = £1,250,000 * -0.2930 = -£366,250
projectedPortfolioValue = £1,250,000 * (1 + -0.2930) = £883,750
```

### 4.3 Scenario Impact Output Structure

```javascript
{
  summary: {
    currentPortfolioValue: 1250000,
    projectedPortfolioValue: 883750,
    totalValueChange: -366250,
    percentageChange: -0.2930,
    selectedScenariosCount: 2,
    analysisType: "cumulative_worst_case"
  },
  scenarioBreakdown: [
    {
      scenarioId: "Property Crash",
      scenarioName: "Property Crash",
      portfolioReturn: -0.1850,
      portfolioValueChange: -231250,
      horizonYears: 5,
      assetImpacts: [
        {
          assetClass: "PROPERTY_UK_RESI",
          currentAllocation: 0.25,
          scenarioReturn: -0.18,
          valueChange: -56250,
          currentValue: 312500,
          projectedValue: 256250
        },
        ...
      ]
    },
    ...
  ],
  assetImpacts: [
    {
      assetClass: "PROPERTY_UK_RESI",
      currentAllocation: 0.25,
      cumulativeReturn: -0.3094, // Compounded from both scenarios
      valueChange: -96812.50,
      currentValue: 312500,
      projectedValue: 215687.50
    },
    ...
  ]
}
```

---

## 5. Target Allocation and Recommendation Engine

### 5.1 Overview

The target allocation engine combines the investor's persona profile with scenario-based tilts to generate an optimized portfolio recommendation. This process involves blending, applying rules, and ensuring constraints are satisfied.

**Endpoint**: `/api/target`

**File**: `server/lib/recommend/targetEngine.ts`

### 5.2 The Allocation Pipeline

```
Persona Base Mix
    ↓
[1] Apply Scenario Tilts (weighted blending)
    ↓
[2] Apply Persona-Specific Rules
    ↓
[3] Enforce Liquidity Floors
    ↓
[4] Apply Concentration Limits
    ↓
[5] Normalize to 100%
    ↓
Final Target Mix
```

### 5.3 Step-by-Step Logic

**Step 1: Load Persona Base Mix**

Each persona has a default allocation across all canonical asset buckets:

```javascript
// Example: P001 "The Retirement Planner"
baseMix = {
  CASH: 0.0800,
  BILLS_SHORT_GILTS: 0.1200,
  GILTS_LONG: 0.0600,
  IG_CREDIT: 0.1500,
  GLOBAL_EQUITY: 0.2800,
  UK_EQUITY_VALUE: 0.1200,
  GROWTH_TECH: 0.0400,
  PROPERTY_UK_RESI: 0.0800,
  COMMODITIES: 0.0200,
  GOLD: 0.0300,
  ALTERNATIVES: 0.0100,
  CRYPTO_BTC: 0.0000,
  CRYPTO_ETH: 0.0000,
  COLLECTIBLES_ART: 0.0100,
  COLLECTIBLES_WINE: 0.0000
}
```

**Step 2: Blend Scenario Templates**

Scenarios have directional tilts that modify the base allocation:

```javascript
// Example scenario templates (not actual returns, but allocation tilts)
debtSpiralTemplate = {
  CASH: +0.15,              // Increase cash
  GILTS_LONG: -0.10,        // Reduce gilts
  GLOBAL_EQUITY: -0.05,     // Reduce equities
  GOLD: +0.05,              // Increase gold
  ...
}

propertyCrashTemplate = {
  PROPERTY_UK_RESI: -0.20,  // Reduce property exposure
  CASH: +0.10,              // Increase cash
  BILLS_SHORT_GILTS: +0.05, // Increase short gilts
  ...
}

// Blend scenarios based on weights
scenarioWeights = {
  "Debt Spiral": 0.60,
  "Property Crash": 0.40
}

scenarioBlend[bucket] = Σ (scenarioTemplate[bucket] * scenarioWeight)

// Apply tilt strength (0-1 scale, default 0.5)
preRulesMix[bucket] = baseMix[bucket] + (scenarioBlend[bucket] * tiltStrength)
```

**Step 3: Apply Liquidity Floor**

Ensure minimum cash/short-term holdings:

```javascript
const liquidityFloor = overrides?.liquidityFloorPct || 0.10; // Default 10%
const currentLiquidity = preRulesMix.CASH + preRulesMix.BILLS_SHORT_GILTS;

if (currentLiquidity < liquidityFloor) {
  const shortfall = liquidityFloor - currentLiquidity;
  
  // Add liquidity
  preRulesMix.CASH += shortfall * 0.6;
  preRulesMix.BILLS_SHORT_GILTS += shortfall * 0.4;
  
  // Fund from donor buckets (highest risk first)
  const donors = ["GROWTH_TECH", "CRYPTO_BTC", "CRYPTO_ETH", "GLOBAL_EQUITY", ...];
  let remaining = shortfall;
  
  for (const donor of donors) {
    if (remaining <= 0) break;
    const canTake = Math.min(preRulesMix[donor], remaining * 0.3);
    preRulesMix[donor] -= canTake;
    remaining -= canTake;
  }
}
```

**Step 4: Apply Concentration Limits**

Cap single-bucket exposure based on persona risk tolerance:

```javascript
const singleBucketCap = overrides?.singleBucketCapPct || 0.35; // Default 35%

for (const bucket of CANONICAL_BUCKETS) {
  if (preRulesMix[bucket] > singleBucketCap) {
    const excess = preRulesMix[bucket] - singleBucketCap;
    preRulesMix[bucket] = singleBucketCap;
    
    // Redistribute excess to safer buckets
    preRulesMix.BILLS_SHORT_GILTS += excess * 0.5;
    preRulesMix.IG_CREDIT += excess * 0.3;
    preRulesMix.CASH += excess * 0.2;
  }
}
```

**Step 5: Persona-Specific Rules**

Apply custom rules for specific personas:

```javascript
// Example: P016 "BTL Mogul" has hard property caps
if (personaId === "P016") {
  const hardPropertyCap = 0.65; // 65% maximum normally
  
  if (preRulesMix.PROPERTY_UK_RESI > hardPropertyCap) {
    const excess = preRulesMix.PROPERTY_UK_RESI - hardPropertyCap;
    preRulesMix.PROPERTY_UK_RESI = hardPropertyCap;
    preRulesMix.GILTS_SHORT += excess * 0.6;
    preRulesMix.GOLD += excess * 0.4;
  }
  
  // Even stricter in property crash scenarios
  const selectedScenarios = Object.keys(scenarioWeights).filter(s => scenarioWeights[s] > 0);
  if (selectedScenarios.includes("Property Crash")) {
    const stressCap = 0.45; // 45% maximum in stress
    if (preRulesMix.PROPERTY_UK_RESI > stressCap) {
      const excess = preRulesMix.PROPERTY_UK_RESI - stressCap;
      preRulesMix.PROPERTY_UK_RESI = stressCap;
      preRulesMix.CASH += excess * 0.5;
      preRulesMix.BILLS_SHORT_GILTS += excess * 0.5;
    }
  }
}
```

**Step 6: Normalize to 100%**

```javascript
const sum = Object.values(preRulesMix).reduce((a, b) => a + b, 0);

for (const bucket of CANONICAL_BUCKETS) {
  targetMix[bucket] = preRulesMix[bucket] / sum;
}

// Verification: sum should equal 1.0
const finalSum = Object.values(targetMix).reduce((a, b) => a + b, 0);
console.assert(Math.abs(finalSum - 1.0) < 0.001, "Target mix must sum to 1.0");
```

### 5.4 Target Response Structure

```javascript
{
  personaId: "P001",
  scenarioWeights: { "Debt Spiral": 0.60, "Property Crash": 0.40 },
  tiltStrength: 0.5,
  baseMix: { CASH: 0.08, BILLS_SHORT_GILTS: 0.12, ... },
  scenarioBlend: { CASH: +0.125, GILTS_LONG: -0.06, ... },
  preRulesMix: { CASH: 0.2025, BILLS_SHORT_GILTS: 0.14, ... },
  targetMix: { CASH: 0.1950, BILLS_SHORT_GILTS: 0.1350, ... },
  flags: ["liquidity_floor_applied", "property_cap_applied"],
  adjustments: [
    "Increased liquidity from 18% to 23% to meet minimum requirement",
    "Reduced property exposure from 35% to 25% due to Property Crash scenario"
  ],
  narrative: {
    overview: "Your target allocation prioritizes safety with 33% in cash and bonds...",
    bullets: [
      "Increased cash to 19.5% (from 8%) to provide defensive buffer",
      "Reduced property to 5% (from 8%) given property crash concerns",
      "Maintained 28% global equity for long-term growth"
    ],
    topAdds: [
      { bucket: "CASH", pp: 11.5 },
      { bucket: "BILLS_SHORT_GILTS", pp: 1.5 }
    ],
    topTrims: [
      { bucket: "PROPERTY_UK_RESI", pp: -3.0 },
      { bucket: "GILTS_LONG", pp: -2.5 }
    ]
  }
}
```

---

## 6. Monte Carlo Simulation and Risk Analysis

### 6.1 Overview

The Monte Carlo simulation engine projects portfolio performance under uncertainty by generating thousands of potential future paths, accounting for asset correlations, scenario probabilities, and volatility.

**Endpoint**: `/api/simulate-v2`

**File**: `server/lib/simulate/engine_v2.ts`

### 6.2 Simulation Pipeline

```
Scenario Weights → Blend Scenario Shocks → Apply Fade
    ↓                      ↓                    ↓
  S001: 0.60          GLOBAL_EQUITY: -0.12   12m mean: -0.10
  S002: 0.40          PROPERTY_UK_RESI: -0.15 12m mean: -0.12
                      CASH: 0.00              12m mean: 0.00
    ↓
Convert to Monthly Returns
    ↓
Generate Correlated Random Shocks (Cholesky Decomposition)
    ↓
Simulate N Paths (e.g., 5000 paths × 12 months)
    ↓
Calculate Risk Metrics (Expected Return, Downside Risk, Drawdown)
```

### 6.3 Step-by-Step Logic

**Step 1: Blend Scenario Shocks**

Combine scenario-specific returns using normalized weights:

```javascript
// Normalize scenario weights to sum to 1.0
const normWeights = normalizeWeights(scenarioWeights);

// Blend 12-month expected returns for each bucket
mean12Scenario[bucket] = Σ (scenarioShock[scenarioId][bucket] * normWeight[scenarioId])

// Example:
scenarioWeights = { "Debt Spiral": 0.6, "Property Crash": 0.4 }

Debt Spiral shocks: { GLOBAL_EQUITY: -0.20, PROPERTY_UK_RESI: -0.15, ... }
Property Crash shocks: { GLOBAL_EQUITY: -0.25, PROPERTY_UK_RESI: -0.18, ... }

mean12Scenario[GLOBAL_EQUITY] = (-0.20 * 0.6) + (-0.25 * 0.4)
                               = -0.12 + -0.10
                               = -0.22 (-22% over 12 months)

mean12Scenario[PROPERTY_UK_RESI] = (-0.15 * 0.6) + (-0.18 * 0.4)
                                  = -0.09 + -0.072
                                  = -0.162 (-16.2% over 12 months)
```

**Step 2: Apply Scenario Fade** 

Scenarios fade toward base case over time using exponential decay:

```javascript
// Fade parameter (tau) controls how fast scenarios revert
tau = 24 months (default)

// Alpha fade function
alphaFade(H, tau) = 1 - exp(-H / tau)

// For H = 12 months:
alpha = 1 - exp(-12 / 24) = 1 - exp(-0.5) = 1 - 0.6065 = 0.3935 (39.35%)

// Faded mean (blends scenario shock with base prior)
fadedMean12[bucket] = (1 - alpha) * mean12Scenario[bucket] + alpha * basePrior12[bucket]

// Example:
mean12Scenario[GLOBAL_EQUITY] = -0.22
basePrior12[GLOBAL_EQUITY] = 0.08 (normal equity return)

fadedMean12[GLOBAL_EQUITY] = (1 - 0.3935) * (-0.22) + (0.3935) * (0.08)
                            = (0.6065) * (-0.22) + (0.3935) * (0.08)
                            = -0.1334 + 0.0315
                            = -0.1019 (-10.19%)

// At H = 24 months, alpha = 0.6321, so scenario has faded 63% toward base
```

**Step 3: Convert to Monthly Returns and Volatility**

```javascript
// Convert 12-month return to monthly compounded return
meanMonth[bucket] = (1 + mean12[bucket])^(1/12) - 1

// Example:
mean12[GLOBAL_EQUITY] = -0.1019
meanMonth[GLOBAL_EQUITY] = (1 + -0.1019)^(1/12) - 1
                         = (0.8981)^(0.0833) - 1
                         = 0.9911 - 1
                         = -0.0089 (-0.89% per month)

// Convert 12-month volatility to monthly volatility
vol12[GLOBAL_EQUITY] = 0.18 (18% annual from scenario blend)
volMonth[GLOBAL_EQUITY] = 0.18 / sqrt(12) = 0.18 / 3.464 = 0.0520 (5.20% monthly)
```

**Step 4: Cholesky Decomposition for Correlated Returns**

Assets don't move independently - they're correlated. Use Cholesky decomposition to generate correlated random shocks:

```javascript
// Correlation matrix (15x15 for all canonical buckets)
CORRELATION = [
  [1.00, 0.85, 0.75, ...], // GLOBAL_EQUITY correlations
  [0.85, 1.00, 0.80, ...], // UK_EQUITY_VALUE correlations
  [0.75, 0.80, 1.00, ...], // GROWTH_TECH correlations
  ...
]

// Decompose into lower-triangular matrix L
L = cholesky(CORRELATION)

// To generate correlated random vector:
// 1. Draw N independent standard normals: z ~ N(0,1)
z = [randn(), randn(), randn(), ..., randn()] // N=15 values

// 2. Multiply by Cholesky factor: z_correlated = L * z
z_correlated = L * z

// 3. Scale by volatility and add mean:
r[bucket_i] = meanMonth[bucket_i] + volMonth[bucket_i] * z_correlated[i]
```

**Example Correlated Shock Generation:**

```
Independent draws:
z = [0.52, -1.31, 0.85, ...]

After Cholesky (accounting for 0.85 correlation between GLOBAL_EQUITY and UK_EQUITY_VALUE):
z_correlated = [0.52, -1.08, 0.72, ...]

Final monthly returns:
r[GLOBAL_EQUITY] = -0.0089 + 0.0520 * 0.52 = -0.0089 + 0.0270 = 0.0181 (+1.81%)
r[UK_EQUITY_VALUE] = -0.0075 + 0.0480 * -1.08 = -0.0075 + -0.0518 = -0.0593 (-5.93%)
r[GROWTH_TECH] = -0.0112 + 0.0650 * 0.72 = -0.0112 + 0.0468 = 0.0356 (+3.56%)
```

**Step 5: Simulate Multiple Paths**

Generate N paths (e.g., 5000) over H months (e.g., 12):

```javascript
for (path = 1 to N_paths) {
  portfolioValue_Current = startValue; // £100
  portfolioValue_Target = startValue;
  
  for (month = 1 to H) {
    // Generate correlated shocks for this month
    r = generateCorrelatedShocks(meanMonth, volMonth, CORRELATION);
    
    // Calculate portfolio return for current mix
    returnCurrent = Σ (currentMix[bucket] * r[bucket])
    
    // Calculate portfolio return for target mix
    returnTarget = Σ (targetMix[bucket] * r[bucket])
    
    // Compound portfolio values
    portfolioValue_Current *= (1 + returnCurrent);
    portfolioValue_Target *= (1 + returnTarget);
    
    // Track drawdown (for max drawdown calculation)
    peakValue_Current = max(peakValue_Current, portfolioValue_Current);
    currentDrawdown_Current = 1 - (portfolioValue_Current / peakValue_Current);
    maxDrawdown_Current = max(maxDrawdown_Current, currentDrawdown_Current);
  }
  
  // Store final values for this path
  finalValues_Current[path] = portfolioValue_Current;
  finalValues_Target[path] = portfolioValue_Target;
  maxDrawdowns_Current[path] = maxDrawdown_Current;
}
```

**Step 6: Calculate Risk Metrics**

```javascript
// Expected returns (deterministic, no MC needed)
expectedReturn_Current = Σ (currentMix[bucket] * horizonReturn[bucket])
expectedReturn_Target = Σ (targetMix[bucket] * horizonReturn[bucket])

// Probability target beats current (from MC)
probTargetBeatsCurrent = count(finalValues_Target > finalValues_Current) / N_paths

// Median maximum drawdown (from MC)
maxDrawdownMed_Current = median(maxDrawdowns_Current)
maxDrawdownMed_Target = median(maxDrawdowns_Target)

// Downside risk metrics
probLoss_Current = count(finalReturns_Current < 0) / N_paths
probLoss_Target = count(finalReturns_Target < 0) / N_paths

// Expected Shortfall at 5% (average of worst 5% outcomes)
worstReturns_Current = sort(finalReturns_Current)[0 : N_paths * 0.05]
es5_Current = mean(worstReturns_Current)
```

### 6.4 Simulation Output Structure

```javascript
{
  horizonMonths: 12,
  expectedReturnCurrent: -0.1250, // -12.50% expected
  expectedReturnTarget: -0.0420,  // -4.20% expected (8.3pp better)
  diffPp: 0.0830, // 8.3 percentage points improvement
  
  contributionsCurrent: {
    GLOBAL_EQUITY: -0.0660, // 30% allocation * -22% return = -6.6pp
    PROPERTY_UK_RESI: -0.0405, // 25% allocation * -16.2% return = -4.05pp
    CASH: 0.0000, // 15% allocation * 0% return = 0pp
    ...
  },
  
  contributionsTarget: {
    GLOBAL_EQUITY: -0.0616, // 28% allocation * -22% return = -6.16pp
    PROPERTY_UK_RESI: -0.0081, // 5% allocation * -16.2% return = -0.81pp
    CASH: 0.0000, // 19.5% allocation * 0% return = 0pp
    ...
  },
  
  endValue: {
    current: 87.50, // £1,250,000 → £1,093,750
    target: 95.80, // £1,250,000 → £1,197,500
    diffGBP: 103750 // £103,750 better
  },
  
  endValueBand: { // Monte Carlo percentiles
    current: { p05: 72.50, p50: 87.50, p95: 105.20 },
    target: { p05: 82.30, p50: 95.80, p95: 112.40 }
  },
  
  probTargetBeatsCurrent: 0.847, // 84.7% chance target outperforms
  
  maxDrawdownMed: {
    current: 0.1850, // Median max drawdown 18.5%
    target: 0.1125   // Median max drawdown 11.25%
  },
  
  downside: {
    probLoss: {
      current: 0.712, // 71.2% chance of losing money
      target: 0.458   // 45.8% chance of losing money
    },
    es5: {
      current: -0.2840, // Average of worst 5% outcomes: -28.4%
      target: -0.1950   // Average of worst 5% outcomes: -19.5%
    }
  },
  
  breakevenMonthMed: 8, // Target breaks even with current at month 8
  
  fan: [ // Monte Carlo fan chart (p05, p50, p95 at each time step)
    { t: 0, current: {p05:100, p50:100, p95:100}, target: {p05:100, p50:100, p95:100} },
    { t: 1, current: {p05:95.2, p50:99.1, p95:103.5}, target: {p05:96.8, p50:99.7, p95:103.1} },
    ...
    { t: 12, current: {p05:72.5, p50:87.5, p95:105.2}, target: {p05:82.3, p50:95.8, p95:112.4} }
  ],
  
  stresses: [ // Pure scenario stress tests
    {
      id: "Debt Spiral",
      label: "Debt Spiral",
      retCurrent: -0.1325,
      retTarget: -0.0840,
      diffPp: 0.0485 // 4.85pp better in Debt Spiral
    },
    {
      id: "Property Crash",
      label: "Property Crash",
      retCurrent: -0.1850,
      retTarget: -0.0620,
      diffPp: 0.1230 // 12.3pp better in Property Crash
    }
  ]
}
```

---

## 7. Action Plan Generation

### 7.1 Overview

The action plan engine translates the gap between current and target allocations into a prioritized sequence of discrete trades, accounting for liquidity constraints, transaction costs, and practical execution.

**Endpoint**: `/api/actions`

**File**: `server/lib/actions/engine.ts`

### 7.2 Action Generation Pipeline

```
Current Mix vs Target Mix → Calculate Need per Bucket
    ↓
Liquidity Fix (Stage 0)
    ↓
Identify Trims and Adds
    ↓
Stage 1: Liquid Assets (immediate)
Stage 2: Illiquid Assets (deferred)
    ↓
Self-Fund Each Stage
    ↓
Generate Action List with Rationale
```

### 7.3 Step-by-Step Logic

**Step 1: Calculate Need**

```javascript
need[bucket] = target[bucket] - current[bucket]

// Example:
current = { CASH: 0.08, GLOBAL_EQUITY: 0.30, PROPERTY_UK_RESI: 0.25, ... }
target = { CASH: 0.195, GLOBAL_EQUITY: 0.28, PROPERTY_UK_RESI: 0.05, ... }

need[CASH] = 0.195 - 0.08 = +0.115 (need to ADD 11.5pp)
need[GLOBAL_EQUITY] = 0.28 - 0.30 = -0.02 (need to TRIM 2pp)
need[PROPERTY_UK_RESI] = 0.05 - 0.25 = -0.20 (need to TRIM 20pp)
```

**Step 2: Liquidity Fix (Priority 0)**

Before any rebalancing, ensure minimum liquidity is met:

```javascript
liquidityFloor = 0.10 (10% minimum)
currentLiquidity = current[CASH] + current[BILLS_SHORT_GILTS]
                 = 0.08 + 0.12 = 0.20 (20% - above floor, no action needed)

// If below floor:
if (currentLiquidity < liquidityFloor) {
  needLiq = liquidityFloor - currentLiquidity;
  
  // TRIM from donor order (riskiest first)
  donors = ["GROWTH_TECH", "GLOBAL_EQUITY", "ALTERNATIVES", "PROPERTY_UK_RESI", ...]
  
  for (donor of donors) {
    canGive = min(current[donor], remaining_needLiq);
    TRIM(donor, -canGive);
    remaining_needLiq -= canGive;
    if (remaining_needLiq <= 0) break;
  }
  
  // ADD to BILLS_SHORT_GILTS and CASH
  ADD("BILLS_SHORT_GILTS", +needLiq * 0.6);
  ADD("CASH", +needLiq * 0.4);
}
```

**Step 3: Stage Actions by Liquidity**

Separate actions into two stages:

```javascript
ILLIQUID_BUCKETS = [
  "PROPERTY_UK_RESI",
  "ALTERNATIVES",
  "COLLECTIBLES_ART",
  "COLLECTIBLES_WINE",
  ...
]

for (bucket of CANONICAL_BUCKETS) {
  if (abs(need[bucket]) < minTrade) continue; // Skip tiny moves (< 0.5pp)
  
  if (ILLIQUID_BUCKETS.includes(bucket)) {
    stage2.push({ bucket, deltaPct: need[bucket] });
  } else {
    stage1.push({ bucket, deltaPct: need[bucket] });
  }
}

// Limit Stage 1 to maxMoves (default 8 trades)
stage1 = stage1.sort_by_abs_delta().slice(0, maxMoves);
```

**Step 4: Self-Fund Each Stage**

Ensure adds = trims within each stage (no external cash injection):

```javascript
// Stage 1 self-funding
adds_stage1 = sum(max(0, delta) for delta in stage1)
trims_stage1 = sum(abs(min(0, delta)) for delta in stage1)

if (adds_stage1 > trims_stage1 + 0.003) { // Tolerance 0.3pp
  // Scale down adds proportionally
  scaleFactor = trims_stage1 / adds_stage1;
  for (action in stage1) {
    if (action.delta > 0) {
      action.delta *= scaleFactor;
    }
  }
}

// Net should be near zero
netStage1 = sum(stage1.deltas)
assert(abs(netStage1) < 0.003, "Stage 1 must be self-funded");
```

**Step 5: Generate Action List with Rationale**

```javascript
actions = [];

for (action in stage1) {
  bucket = action.bucket;
  deltaPct = action.deltaPct;
  amountGBP = portfolioValueGBP * deltaPct;
  type = (deltaPct > 0) ? "ADD" : "TRIM";
  
  // Generate contextual rationale
  if (type === "TRIM") {
    rationale = `Reduce ${bucket_name} by ${abs(deltaPct)*100}pp to fund defensive positioning`;
  } else {
    rationale = `Increase ${bucket_name} by ${deltaPct*100}pp for ${reason}`;
  }
  
  actions.push({
    type,
    bucket,
    deltaPct: abs(deltaPct),
    amountGBP: abs(amountGBP),
    rationale,
    stage: 1,
    estCostPct: abs(deltaPct) * FRICTION_RATE[bucket] // e.g., 0.005 for liquid
  });
}

// Repeat for stage 2...
```

### 7.4 Action Plan Output Structure

```javascript
{
  summary: {
    totalAbsChangePp: 47.5, // Total portfolio turnover (47.5pp)
    estTurnoverPp: 23.75, // One-way turnover
    estCostPct: 0.0012, // Estimated costs 0.12%
    liquidityNowPct: 20.0, // Current liquidity 20%
    liquidityTargetPct: 33.0, // Target liquidity 33%
    liquidityFixPp: 0 // No liquidity fix needed
  },
  
  staged: {
    stage1: [ // Execute immediately (liquid assets)
      {
        type: "TRIM",
        bucket: "PROPERTY_UK_RESI",
        deltaPct: 0.20,
        amountGBP: 250000,
        rationale: "Reduce UK Property by 20pp to derisk against Property Crash scenario",
        stage: 1,
        estCostPct: 0.0010 // 0.10% transaction cost
      },
      {
        type: "ADD",
        bucket: "CASH",
        deltaPct: 0.115,
        amountGBP: 143750,
        rationale: "Increase Cash by 11.5pp to enhance defensive buffer",
        stage: 1,
        estCostPct: 0.0001
      },
      {
        type: "TRIM",
        bucket: "GLOBAL_EQUITY",
        deltaPct: 0.02,
        amountGBP: 25000,
        rationale: "Trim Global Equity by 2pp to rebalance risk exposure",
        stage: 1,
        estCostPct: 0.0001
      },
      ...
    ],
    
    stage2: [ // Defer (illiquid assets)
      {
        type: "ADD",
        bucket: "ALTERNATIVES",
        deltaPct: 0.03,
        amountGBP: 37500,
        rationale: "Gradually build Alternatives exposure by 3pp",
        stage: 2,
        estCostPct: 0.0015
      }
    ]
  },
  
  playbook: [
    "Stage 1 (Immediate): Rebalance liquid holdings - reduce Property by 20pp, add Cash 11.5pp",
    "Stage 2 (Deferred): Build illiquid positions gradually - add Alternatives 3pp over 6-12 months",
    "Estimated total cost: 0.12% of portfolio (£1,500 on £1.25m)",
    "Liquidity improves from 20% to 33% - strong defensive buffer"
  ]
}
```

---

## Summary

This system provides a comprehensive approach to investor profiling and outcome prediction:

1. **Personas** are created using research-based 8-dimensional profiles covering risk, assets, tax, time, liquidity, and advisory preferences

2. **Identification** uses a 10-question quiz that maps responses to dimensions, normalizes scores, and matches via weighted cosine similarity with safety-biased tie-breaking

3. **Beliefs** are converted to scenario probabilities through a sophisticated pipeline: signal conversion → direction logic → correlation dampening → regime adjustment → time decay → independent probability calculation

4. **Outcomes** are predicted by applying scenario-specific impacts to portfolios, weighted by probabilities, with persona-specific rules ensuring allocations align with risk tolerance, liquidity needs, and concentration preferences

The entire system is designed to be transparent, reproducible, and grounded in financial theory while remaining practical for real-world investor profiling and portfolio management.
