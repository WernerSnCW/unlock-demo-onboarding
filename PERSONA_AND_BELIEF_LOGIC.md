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

## Summary

This system provides a comprehensive approach to investor profiling and outcome prediction:

1. **Personas** are created using research-based 8-dimensional profiles covering risk, assets, tax, time, liquidity, and advisory preferences

2. **Identification** uses a 10-question quiz that maps responses to dimensions, normalizes scores, and matches via weighted cosine similarity with safety-biased tie-breaking

3. **Beliefs** are converted to scenario probabilities through a sophisticated pipeline: signal conversion → direction logic → correlation dampening → regime adjustment → time decay → independent probability calculation

4. **Outcomes** are predicted by applying scenario-specific impacts to portfolios, weighted by probabilities, with persona-specific rules ensuring allocations align with risk tolerance, liquidity needs, and concentration preferences

The entire system is designed to be transparent, reproducible, and grounded in financial theory while remaining practical for real-world investor profiling and portfolio management.
