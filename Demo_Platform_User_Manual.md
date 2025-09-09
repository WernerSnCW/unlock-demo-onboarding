# Unlock Investment Platform - Demo Workflow User Manual

## Table of Contents
1. [Overview](#overview)
2. [Step 1: Investor Personas](#step-1-investor-personas)
3. [Step 2: Investment Profile Discovery](#step-2-investment-profile-discovery)
4. [Step 3: Economic Beliefs Assessment](#step-3-economic-beliefs-assessment)
5. [Step 4: Portfolio Analysis](#step-4-portfolio-analysis)
6. [Step 5: Investment Strategy](#step-5-investment-strategy)
7. [Step 6: Action Plan](#step-6-action-plan)
8. [Mathematical Models and Algorithms](#mathematical-models-and-algorithms)
9. [AI Integration and Recommendation Logic](#ai-integration-and-recommendation-logic)
10. [Technical Implementation Details](#technical-implementation-details)

---

## Overview

The Unlock Investment Platform demo is a comprehensive 6-step workflow that provides sophisticated investment analysis and personalized portfolio recommendations. The system combines behavioral finance principles, quantitative modeling, Monte Carlo simulations, and AI-powered insights to deliver institutional-grade investment guidance.

### Core Philosophy
- **Data-Driven**: All recommendations are based on quantitative analysis and historical precedents
- **Deterministic**: The action plan generation follows precise mathematical procedures
- **Personalized**: Each recommendation is tailored to the individual's risk profile and beliefs
- **Transparent**: All calculations and methodologies are explainable and auditable

### Workflow Overview
1. **Investor Personas** - Classification into 19 research-backed investor archetypes
2. **Investment Profile Discovery** - 8-dimensional personality assessment via questionnaire
3. **Economic Beliefs Assessment** - Scenario mapping based on economic outlook
4. **Portfolio Analysis** - Gap analysis between current and recommended allocations
5. **Investment Strategy** - Monte Carlo simulations and performance projections
6. **Action Plan** - Deterministic, prioritized execution roadmap

---

## Step 1: Investor Personas

### Purpose
Classify users into one of 19 scientifically-designed investor personas based on demographic, behavioral, and preference characteristics.

### The 19 Investor Personas
Each persona represents a distinct investor archetype with specific:
- **Portfolio Value Range**: £450K - £2.4M+
- **Wealth Tier**: Mass-Affluent, Upper Mass-Affluent, HNW, UHNW
- **Risk Profile**: Conservative, Balanced, Growth, Aggressive
- **Investment Approach**: Self-Directed, Hybrid, Full-Service
- **Age Range**: 22-75 years
- **Liquidity Preference**: 2-12 months of reserves
- **Drawdown Tolerance**: 18%-35% maximum acceptable decline

### Persona Examples

#### P001: The Retirement Planner
- **Profile**: £1.25M portfolio, Upper Mass-Affluent, Balanced risk
- **Goals**: Sustain retirement income, preserve capital, tax optimization
- **Characteristics**: 9 months liquidity, 24% drawdown cap, pension-focused
- **Bias Scores**: Property (0.30), Tech (0.30), Alternatives (0.25)

#### P002: The Property Lover  
- **Profile**: £1.2M portfolio, Self-Directed, Moderate risk
- **Goals**: Grow rental income, manage leverage, diversify beyond property
- **Characteristics**: 6 months liquidity, 24% drawdown cap, 78% property tilt
- **Bias Scores**: Property (0.85), Tech (0.10), Alternatives (0.15)

#### P003: The Crypto Enthusiast
- **Profile**: £780K portfolio, Self-Directed, Aggressive risk
- **Goals**: High growth through crypto, manage volatility, tax tracking
- **Characteristics**: 2 months liquidity, 35% drawdown cap, 51% crypto allocation
- **Bias Scores**: Property (0.05), Tech (0.70), Alternatives (0.45)

### Classification Logic
The system uses a comprehensive scoring matrix that evaluates:
- **Investment Objectives**: Wealth preservation vs. building vs. balanced
- **Risk Tolerance**: Conservative to aggressive appetite
- **Time Involvement**: Minimal to high management preference
- **Decision Style**: Independent research vs. advisor-guided vs. community-driven
- **Liquidity Needs**: Preference for liquid vs. illiquid investments
- **Current Portfolio**: Cash/bonds, equities, property-heavy, alternatives-heavy, etc.
- **Asset Interests**: Multi-select preferences across 32+ investment categories
- **Tax Optimization**: Importance of tax-efficient structures

### Persona Selection Interface
Users can explore all 19 personas through an interactive showcase featuring:
- **Visual Cards**: Each persona displays key metrics (portfolio value, risk profile, strategy)
- **Detailed Profiles**: Goals, investment focus, age range, and approach
- **Comparison Tools**: Side-by-side analysis of different personas
- **Selection Override**: Users can select any persona manually if preferred

---

## Step 2: Investment Profile Discovery

### Purpose
Generate a detailed 8-dimensional investment personality profile through a sophisticated questionnaire system.

### The 8 Investment Dimensions

#### Dimension 0: Risk Tolerance (Weight: 1.0)
- **Definition**: Appetite for investment volatility and potential losses
- **Questions**: Market crash behavior, portfolio decline reactions
- **Scale**: 1 (Very Conservative) to 5 (Very Aggressive)
- **Scoring**: Based on actual behavior patterns, not just stated preferences

#### Dimension 1: Property Allocation (Weight: 1.2)
- **Definition**: Preference for property-based investments
- **Questions**: Windfall allocation preferences, asset class priorities
- **Scale**: 1 (Minimal Property) to 5 (Property-Heavy)
- **Scoring**: Direct property, REITs, property funds, development

#### Dimension 2: Alternative Investments (Weight: 0.8)
- **Definition**: Interest in non-traditional investment vehicles
- **Questions**: Fine wine, collectibles, private equity, venture capital
- **Scale**: 1 (Traditional Only) to 5 (Alternatives-Heavy)
- **Scoring**: Covers everything from art to hedge funds

#### Dimension 3: Tax Optimization (Weight: 1.1)
- **Definition**: Focus on tax-efficient investment structures
- **Questions**: ISA/SIPP utilization, wrapper preferences
- **Scale**: 1 (Tax Indifferent) to 5 (Tax-Optimized)
- **Scoring**: EIS/SEIS, VCTs, pension contributions

#### Dimension 4: Income Focus (Weight: 0.9)
- **Definition**: Emphasis on generating regular investment income
- **Questions**: Income source preferences, dividend priorities
- **Scale**: 1 (Growth-Focused) to 5 (Income-Focused)
- **Scoring**: Dividends, bonds, rental income, yields

#### Dimension 5: Time Horizon (Weight: 1.3)
- **Definition**: Investment planning timeframe preference
- **Questions**: Planning horizon, legacy considerations
- **Scale**: 1 (Short-term, 2-3 years) to 5 (Generational, 20+ years)
- **Scoring**: Critical for asset allocation decisions

#### Dimension 6: Liquidity Needs (Weight: 1.0)
- **Definition**: Requirement for easily accessible investments
- **Questions**: Cash preference, illiquid tolerance
- **Scale**: 1 (Comfortable Illiquid) to 5 (High Liquidity Needs)
- **Scoring**: Inversely related to alternatives allocation

#### Dimension 7: Advisory Preference (Weight: 0.7)
- **Definition**: Preference for professional investment guidance
- **Questions**: Decision-making style, research approach
- **Scale**: 1 (Fully Self-Directed) to 5 (Fully Delegated)
- **Scoring**: Independent research vs. advisor reliance

### Questionnaire Algorithm

#### Question Types
1. **Risk Scenarios**: "When markets fall 15%, do you see it as..."
2. **Hypothetical Allocations**: "With an extra £250K, would you..."
3. **Behavioral Patterns**: "In 2020, did you sell, hold, or buy..."
4. **Preference Rankings**: "Which interests you more..."
5. **Time Perspective**: "Do you think in terms of..."

#### Scoring Methodology
```python
# Pseudo-code for scoring algorithm
for each_answer in questionnaire_responses:
    question = get_question(answer.question_id)
    selected_option = question.options[answer.option_index]
    
    for dimension_index in range(8):
        user_raw_scores[dimension_index] += selected_option.scores[dimension_index]

# Normalize scores to 0-5 scale
dimension_maxima = calculate_per_dimension_maximum()
normalized_scores = []
for i in range(8):
    normalized = min(5, max(0, (user_raw_scores[i] / dimension_maxima[i]) * 5))
    normalized_scores.append(normalized)
```

#### Persona Matching Algorithm
The system uses **cosine similarity** with dimension weighting:

```python
def calculate_persona_match(user_profile, persona_scores):
    # Apply dimension weights
    weighted_user = [score * weight for score, weight in zip(user_profile, DIMENSION_WEIGHTS)]
    weighted_persona = [score * weight for score, weight in zip(persona_scores, DIMENSION_WEIGHTS)]
    
    # Calculate cosine similarity
    dot_product = sum(a * b for a, b in zip(weighted_user, weighted_persona))
    magnitude_user = sqrt(sum(x * x for x in weighted_user))
    magnitude_persona = sqrt(sum(x * x for x in weighted_persona))
    
    similarity = dot_product / (magnitude_user * magnitude_persona)
    return round(similarity * 100)  # Convert to percentage
```

#### Tie-Breaking Logic
When persona matches are close (within 5% gap), the system applies **safety bias**:
- Prioritizes personas with lower risk scores
- Favors higher liquidity preferences
- Considers concentration tolerance
- Applies experience-based adjustments

### Results Display

#### Radar Chart Visualization
- **8-dimensional spider diagram** showing user scores vs. matched persona
- **Color-coded dimensions** with explanatory tooltips
- **Interactive elements** for exploring each dimension

#### Match Confidence Scoring
```python
def calculate_confidence(top_match, runner_up):
    gap = top_match.score - runner_up.score
    base_confidence = min(95, top_match.score)
    gap_bonus = min(20, gap * 2)
    return min(99, base_confidence + gap_bonus)
```

#### Strong Alignment vs. Differences
- **Strong Alignment**: Dimensions where user score matches persona ±0.5
- **Areas of Difference**: Dimensions with gaps >1.0
- **Dimensional Explanations**: Contextual tooltips explaining each dimension

---

## Step 3: Economic Beliefs Assessment

### Purpose
Map the user's economic outlook to scenario probabilities that will influence portfolio allocation recommendations.

### Questionnaire Structure

#### 12 Core Economic Belief Questions
The system uses `beliefs.json` containing structured questions:

```json
{
  "id": "B1_mobility_views",
  "text": "Do you expect the next generation to have better financial opportunities than today?",
  "scale": "1-5",
  "direction": "lower->recession,property_down,stagflation"
}
```

#### Sample Questions
1. **B1_mobility_views**: Generational financial opportunity expectations
2. **B2_job_security_white_collar**: White-collar job security over 5 years  
3. **B3_remote_work_tenure**: Stability of remote/hybrid work arrangements
4. **B4_government_confidence**: UK government debt/inflation management confidence
5. **B5_energy_policy**: Energy supply disruption likelihood
6. **B6_ai_adoption_speed**: Industry AI adoption rate expectations
7. **B7_renting_vs_buying**: Property ownership vs. renting preference
8. **B8_local_investment_preference**: Local business vs. property investment attractiveness
9. **B9_geopolitical_risk**: Major geopolitical supply chain shock probability
10. **B10_fx_view**: GBP depreciation vs. USD/EUR likelihood
11. **B11_credit_availability**: SME/household credit access ease
12. **B12_policy_support**: Rate cuts or fiscal support probability

### Scenario Mapping Engine

#### 10 Economic Scenarios
1. **S001: Property Crash** - 2008-style real estate decline
2. **S002: AI Recession** - Automation-driven economic disruption
3. **S003: Stagflation** - High inflation + economic stagnation
4. **S004: Tech Correction** - Technology sector bubble burst
5. **S005: Tax Shift** - Significant tax policy changes
6. **S006: Reflation** - Economic recovery with moderate inflation
7. **S007: Stagflation 2** - Extended inflationary period
8. **S008: Devaluation** - Currency depreciation scenario
9. **S009: Gilt Selloff** - Government bond market stress
10. **S010: Energy Spike** - Energy price shock scenario

#### Probability Calculation Algorithm

```python
def calculate_scenario_probabilities(belief_responses):
    scenario_scores = defaultdict(float)
    
    for response in belief_responses:
        question_id = response.questionId
        answer_value = response.value  # 1-5 scale
        
        # Get question weighting configuration
        question_weights = beliefs_data.weights[question_id]
        
        # Apply directional mapping
        direction = beliefs_data.questions[question_id].direction
        if "lower->" in direction:
            # Lower agreement increases scenario probability
            impact_multiplier = (6 - answer_value) / 5  # Inverts 1-5 to 5-1 range
        elif "higher->" in direction:
            # Higher agreement increases scenario probability  
            impact_multiplier = answer_value / 5
        
        # Apply weighted impact to each scenario
        for scenario, weight in question_weights.items():
            scenario_scores[scenario] += weight * impact_multiplier
    
    # Apply enhanced softmax with mean-centering
    raw_scores = list(scenario_scores.values())
    mean_centered = [score - np.mean(raw_scores) for score in raw_scores]
    
    # Softmax transformation with temperature control
    temperature = 0.5  # Sharpens distribution
    exp_scores = [np.exp(score / temperature) for score in mean_centered]
    total = sum(exp_scores)
    
    probabilities = [score / total for score in exp_scores]
    
    # Apply masking threshold
    masked_probs = [p if p > 0.001 else 0 for p in probabilities]
    
    return normalize_probabilities(masked_probs)
```

#### Scenario Weighting Features

##### Question Boosting
Certain critical questions receive amplified influence:
```python
question_boosts = {
    "B5_energy_policy": 1.3,     # Energy policy impact
    "B10_fx_view": 1.25,         # FX outlook importance  
    "B12_policy_support": 1.2    # Policy support significance
}
```

##### Softmax Temperature Control
- **Temperature = 0.5**: Sharpens probability distributions
- **Mean Centering**: Prevents single-scenario dominance
- **Masking Threshold**: Eliminates negligible scenarios (<0.1%)

##### Display Capping
- **Maximum Display**: 80% for any single scenario
- **Prevents Overconfidence**: Maintains diversified outlook
- **User Interface**: Shows top 3-4 scenarios with meaningful weights

### Methodology Transparency

#### Mathematical Framework
The system provides full transparency on:
- **Softmax Calculation Steps**: Temperature application, normalization
- **Weight Attribution**: Which questions drive which scenarios
- **Historical Precedents**: How scenarios map to actual historical events
- **Data Sources**: Where scenario parameters are derived from
- **Model Limitations**: Confidence intervals and uncertainty bands

#### Auto-Complete Functionality
For user convenience, the system can automatically complete remaining questions based on:
- **Persona Defaults**: Typical beliefs for the selected investor persona
- **Consistency Logic**: Ensuring coherent economic worldview
- **Randomization**: Preventing systematic bias in incomplete responses

---

## Step 4: Portfolio Analysis

### Purpose
Perform comprehensive gap analysis between current portfolio and recommended target allocation, providing detailed insights into required adjustments.

### Asset Universe Structure

#### 15 Canonical Asset Buckets
```typescript
const CANONICAL_BUCKETS = [
  "CASH",                    // Instant access cash
  "BILLS_SHORT_GILTS",      // Short-term government bonds
  "GILTS_LONG",             // Long-term government bonds  
  "IG_CREDIT",              // Investment grade corporate bonds
  "GLOBAL_EQUITY",          // International equity funds
  "UK_EQUITY_VALUE",        // UK value-oriented equities
  "GROWTH_TECH",            // Technology and growth stocks
  "PROPERTY_UK_RESI",       // UK residential property
  "COMMODITIES",            // Commodity futures/funds
  "GOLD",                   // Gold bullion/funds
  "ALTERNATIVES",           // Private equity, hedge funds
  "CRYPTO_BTC",             // Bitcoin exposure
  "CRYPTO_ETH",             // Ethereum exposure
  "COLLECTIBLES_ART",       // Art and collectibles
  "COLLECTIBLES_WINE"       // Fine wine investments
];
```

#### High-Level Asset Classes (User Interface)
- **Cash & Fixed Income**: CASH + BILLS_SHORT_GILTS + GILTS_LONG + IG_CREDIT
- **Global Equity**: GLOBAL_EQUITY + UK_EQUITY_VALUE
- **Tech & Growth**: GROWTH_TECH
- **Property**: PROPERTY_UK_RESI  
- **Commodities & Gold**: COMMODITIES + GOLD
- **Alternatives**: ALTERNATIVES
- **Cryptocurrency**: CRYPTO_BTC + CRYPTO_ETH
- **Collectibles**: COLLECTIBLES_ART + COLLECTIBLES_WINE

### Target Allocation Engine

#### Base Persona Allocation
Each persona has scientifically-designed default allocations:

```typescript
// Example: P001 (Retirement Planner) defaults
const P001_DEFAULTS = {
  CASH: 0.05,                    // 5% cash buffer
  BILLS_SHORT_GILTS: 0.15,       // 15% short gilts
  GILTS_LONG: 0.10,              // 10% long gilts
  IG_CREDIT: 0.10,               // 10% corporate bonds
  GLOBAL_EQUITY: 0.25,           // 25% global equities
  UK_EQUITY_VALUE: 0.15,         // 15% UK value
  GROWTH_TECH: 0.05,             // 5% tech growth
  PROPERTY_UK_RESI: 0.10,        // 10% property
  COMMODITIES: 0.03,             // 3% commodities
  GOLD: 0.02,                    // 2% gold
  // Remaining buckets: 0%
};
```

#### Scenario Tilting Algorithm

```python
def apply_scenario_tilts(base_allocation, scenario_weights, tilt_strength=0.3):
    """Apply scenario-based portfolio tilts to base persona allocation"""
    
    # Blend scenario templates based on probability weights
    scenario_blend = {}
    for bucket in CANONICAL_BUCKETS:
        weighted_sum = 0
        for scenario_id, weight in scenario_weights.items():
            scenario_template = SCENARIO_SHOCKS[scenario_id]
            weighted_sum += scenario_template.get(bucket, 0) * weight
        scenario_blend[bucket] = weighted_sum
    
    # Apply tilts with specified strength
    tilted_allocation = {}
    for bucket in CANONICAL_BUCKETS:
        base_weight = base_allocation[bucket]
        scenario_tilt = scenario_blend[bucket] * tilt_strength
        tilted_weight = base_weight + scenario_tilt
        tilted_allocation[bucket] = max(0, tilted_weight)  # Prevent negative weights
    
    # Renormalize to sum to 100%
    total = sum(tilted_allocation.values())
    return {bucket: weight/total for bucket, weight in tilted_allocation.items()}
```

#### Portfolio Rules Engine
The system applies sophisticated constraints:

##### Liquidity Floor Rules
```python
def apply_liquidity_floor(allocation, risk_profile, drawdown_cap):
    """Ensure minimum liquidity based on investor profile"""
    
    # Determine liquidity requirement
    is_cautious = (risk_profile in ["Conservative", "Income", "Defensive"] or 
                   drawdown_cap <= 0.20)
    liquidity_floor = 0.20 if is_cautious else 0.10
    
    current_liquidity = allocation["CASH"] + allocation["BILLS_SHORT_GILTS"]
    
    if current_liquidity < liquidity_floor:
        # Reallocate from other buckets to meet liquidity requirement
        shortfall = liquidity_floor - current_liquidity
        
        # Define donor order (least essential to most essential)
        donor_priority = [
            "COLLECTIBLES_ART", "COLLECTIBLES_WINE", "CRYPTO_BTC", 
            "CRYPTO_ETH", "ALTERNATIVES", "COMMODITIES", "GOLD",
            "GROWTH_TECH", "PROPERTY_UK_RESI"
        ]
        
        for donor_bucket in donor_priority:
            if shortfall <= 0:
                break
            available = allocation[donor_bucket]
            take = min(available, shortfall)
            allocation[donor_bucket] -= take
            allocation["BILLS_SHORT_GILTS"] += take * 0.7  # Prefer short gilts
            allocation["CASH"] += take * 0.3              # Some to cash
            shortfall -= take
    
    return allocation
```

##### Concentration Limits
```python
def apply_concentration_limits(allocation, concentration_tolerance):
    """Apply single-asset concentration limits"""
    
    limits = {
        "low": 0.25,      # Max 25% in any single bucket
        "med": 0.35,      # Max 35% in any single bucket
        "high": 0.50      # Max 50% in any single bucket
    }
    
    max_concentration = limits.get(concentration_tolerance, 0.35)
    
    for bucket, weight in allocation.items():
        if weight > max_concentration:
            excess = weight - max_concentration
            allocation[bucket] = max_concentration
            
            # Redistribute excess proportionally to other buckets
            remaining_buckets = {k: v for k, v in allocation.items() if k != bucket}
            total_remaining = sum(remaining_buckets.values())
            
            if total_remaining > 0:
                for other_bucket in remaining_buckets:
                    proportion = remaining_buckets[other_bucket] / total_remaining
                    allocation[other_bucket] += excess * proportion
    
    return allocation
```

### Gap Analysis Engine

#### Core Gap Calculation
```python
def compute_gap(current_mix, target_mix, scenario_weights=None):
    """Comprehensive portfolio gap analysis"""
    
    # Harmonize bucket structures (ensure all buckets present)
    current = harmonise_buckets(current_mix)
    target = harmonise_buckets(target_mix)
    
    # Calculate per-bucket gaps
    gap_rows = []
    for bucket in CANONICAL_BUCKETS:
        current_pct = current[bucket]
        target_pct = target[bucket] 
        delta_pct = target_pct - current_pct
        
        # Generate flags for this bucket
        flags = []
        if current_pct > 0.35:
            flags.append(f"Concentration: {bucket} > 35%")
        if abs(delta_pct) > 0.10:
            flags.append("Major reallocation required")
            
        gap_rows.append({
            "bucket": bucket,
            "currentPct": current_pct,
            "targetPct": target_pct,
            "deltaPct": delta_pct,
            "flags": flags
        })
    
    # Sort by absolute gap size (largest changes first)
    gap_rows.sort(key=lambda x: abs(x["deltaPct"]), reverse=True)
    
    # Calculate aggregate metrics
    total_abs_gap = sum(abs(row["deltaPct"]) for row in gap_rows)
    turnover_pp = (total_abs_gap * 100) / 2  # Portfolio turnover in percentage points
    
    # Liquidity analysis
    current_liquidity = current["CASH"] + current["BILLS_SHORT_GILTS"]
    target_liquidity = target["CASH"] + target["BILLS_SHORT_GILTS"]
    
    # Diversification metrics (Herfindahl-Hirschman Index)
    hhi_current = sum(weight * weight for weight in current.values())
    hhi_target = sum(weight * weight for weight in target.values())
    n_eff_current = 1 / hhi_current if hhi_current > 0 else 1
    n_eff_target = 1 / hhi_target if hhi_target > 0 else 1
    
    return {
        "rows": gap_rows,
        "totals": {
            "absGapSum": total_abs_gap,
            "cashBillsNow": current_liquidity,
            "cashBillsTarget": target_liquidity
        },
        "headlineFlags": generate_headline_flags(current, target),
        "diversification": {
            "hhiNow": hhi_current,
            "hhiTarget": hhi_target,
            "deltaHhi": hhi_current - hhi_target,
            "nEffNow": n_eff_current,
            "nEffTarget": n_eff_target
        },
        "turnoverPp": turnover_pp,
        "beliefAlignmentNow": calculate_belief_alignment(current, scenario_weights),
        "beliefAlignmentTarget": calculate_belief_alignment(target, scenario_weights)
    }
```

#### Belief Alignment Scoring
```python
def calculate_belief_alignment(allocation, scenario_weights):
    """Calculate how well portfolio aligns with economic beliefs"""
    
    if not scenario_weights:
        return None
        
    alignment_score = 0
    total_weight = sum(scenario_weights.values())
    
    for scenario_id, weight in scenario_weights.items():
        scenario_template = SCENARIO_SHOCKS[scenario_id]
        
        # Calculate cosine similarity between allocation and scenario template
        dot_product = sum(allocation[bucket] * scenario_template.get(bucket, 0) 
                         for bucket in CANONICAL_BUCKETS)
        
        mag_allocation = sqrt(sum(weight * weight for weight in allocation.values()))
        mag_scenario = sqrt(sum(weight * weight for weight in scenario_template.values()))
        
        if mag_allocation > 0 and mag_scenario > 0:
            similarity = dot_product / (mag_allocation * mag_scenario)
            weighted_similarity = similarity * (weight / total_weight)
            alignment_score += weighted_similarity
    
    return round(max(0, min(100, alignment_score * 100)))
```

### Strategic Commentary Generation

#### AI-Powered Explanation Engine
```python
def build_strategic_commentary(gap_analysis, context):
    """Generate human-readable explanations for portfolio adjustments"""
    
    commentary_bullets = []
    
    # Belief alignment commentary
    if gap_analysis.beliefAlignmentNow and gap_analysis.beliefAlignmentTarget:
        alignment_delta = gap_analysis.beliefAlignmentTarget - gap_analysis.beliefAlignmentNow
        direction_arrow = "↑" if alignment_delta > 0 else "↓" if alignment_delta < 0 else "→"
        
        commentary_bullets.append(
            f"Aligns with your outlook {context.scenarioLabel}: "
            f"Belief alignment {gap_analysis.beliefAlignmentNow}/100 → "
            f"{gap_analysis.beliefAlignmentTarget}/100 ({direction_arrow} {alignment_delta})"
        )
    
    # Liquidity story
    liquidity_now = round(gap_analysis.totals.cashBillsNow * 100, 1)
    liquidity_target = round(gap_analysis.totals.cashBillsTarget * 100, 1)
    commentary_bullets.append(
        f"Liquidity shifts from {liquidity_now}% → {liquidity_target}% "
        f"(cash + short gilts) for more flexibility in drawdowns"
    )
    
    # Top movements with rationale
    top_trims = get_top_moves(gap_analysis.rows, "TRIM", max_count=3)
    top_adds = get_top_moves(gap_analysis.rows, "ADD", max_count=3)
    
    if top_trims:
        trim_descriptions = []
        for trim in top_trims:
            bucket_reason = BUCKET_RATIONALES[trim.bucket]
            pp_change = round(abs(trim.deltaPct) * 100, 1)
            trim_descriptions.append(f"trim {trim.bucket} (~{pp_change}pp: {bucket_reason})")
        commentary_bullets.append(f"Largest reductions: {'; '.join(trim_descriptions)}")
    
    if top_adds:
        add_descriptions = []
        for add in top_adds:
            bucket_reason = BUCKET_RATIONALES[add.bucket]
            pp_change = round(add.deltaPct * 100, 1)
            add_descriptions.append(f"add {add.bucket} (~{pp_change}pp: {bucket_reason})")
        commentary_bullets.append(f"Largest additions: {'; '.join(add_descriptions)}")
    
    # Risk mitigation explanations
    for flag in gap_analysis.headlineFlags:
        if "Liquidity floor" in flag:
            commentary_bullets.append("Meets the liquidity floor requirement once changes are applied")
        elif "Concentration" in flag:
            commentary_bullets.append("Reduces single-bucket concentration risk")
    
    return commentary_bullets[:6]  # Limit to 6 key points
```

### Interactive Portfolio Visualization

#### Side-by-Side Comparison
- **Current Portfolio Pie Chart**: User's existing allocation
- **Target Portfolio Pie Chart**: Recommended allocation
- **Interactive Tooltips**: Detailed breakdown on hover
- **Color-Coded Categories**: Consistent visual language across charts

#### Gap Analysis Table
- **Sortable Columns**: Current %, Target %, Change (pp), Flags
- **Visual Indicators**: Red/green arrows, warning icons
- **Filtering Options**: By asset class, change magnitude, flag type
- **Export Functionality**: CSV download for further analysis

#### Summary Metrics Dashboard
- **Total Changes Required**: Sum of absolute percentage point moves
- **Portfolio Turnover**: Half of total absolute changes
- **Liquidity Impact**: Current vs. target cash positions
- **Diversification Score**: Effective number of holdings (1/HHI)
- **Belief Alignment**: Scenario consistency score (0-100)

---

## Step 5: Investment Strategy

### Purpose
Generate comprehensive investment strategy recommendations using Monte Carlo simulations, performance analysis, and risk assessment.

### Portfolio Simulation Engine

#### Simulation Framework Architecture
The system uses a sophisticated dual-engine approach:

1. **Deterministic Engine** (`engine.ts`): Base case scenarios
2. **Monte Carlo Engine** (`engine_v2.ts`): Probabilistic analysis with confidence bands

#### Monte Carlo Simulation Parameters

##### Core Input Structure
```typescript
interface SimV2Request {
  currentMix: Record<string, number>;        // Current portfolio weights
  targetMix: Record<string, number>;         // Recommended weights  
  scenarioWeights: Record<string, number>;   // Scenario probabilities
  horizonMonths?: number;                    // Analysis period (default: 12)
  startValueGBP?: number;                    // Initial value (default: 100K)
  shockMultiplier?: number;                  // Volatility scaling (default: 1.0)
  mode?: "hold" | "rebalanceMonthly";       // Portfolio management style
  mc?: { paths: number; seed?: number };     // Monte Carlo configuration
  costs?: { estTurnoverPp: number; estCostPct: number }; // Transaction costs
  multiHorizons?: number[];                  // Multi-period analysis
  fade?: { tauMonths?: number };             // Scenario fade parameters
}
```

##### Advanced Monte Carlo Configuration
```typescript
const DEFAULT_MC_CONFIG = {
  paths: 5000,                    // Number of simulation paths
  seed: 1234567,                  // Reproducible randomization
  confidence_bands: [5, 50, 95], // Percentile analysis
  rebalance_frequency: "monthly", // Portfolio rebalancing
  correlation_matrix: true,       // Inter-asset correlations
  scenario_fade: true            // Time-varying scenario influence
}
```

#### Scenario Shock Modeling

##### Historical Scenario Calibration
Each scenario has calibrated 12-month expected returns and volatilities:

```typescript
const SCENARIO_SHOCKS = {
  "S001": { // Property Crash
    PROPERTY_UK_RESI: -0.25,     // -25% property returns
    UK_EQUITY_VALUE: -0.15,      // -15% UK equities  
    GILTS_LONG: 0.12,           // +12% long gilts (flight to quality)
    CASH: 0.02,                  // +2% cash returns
    // ... other assets
  },
  "S002": { // AI Recession  
    GROWTH_TECH: -0.30,          // -30% tech stocks
    GLOBAL_EQUITY: -0.20,        // -20% global equities
    ALTERNATIVES: -0.15,         // -15% alternatives
    BILLS_SHORT_GILTS: 0.08,     // +8% short gilts
    // ... other assets
  },
  // ... 8 more scenarios
};

const SCENARIO_VOLS = {
  "S001": { // Property Crash volatilities
    PROPERTY_UK_RESI: 0.35,      // 35% annual volatility
    UK_EQUITY_VALUE: 0.25,       // 25% annual volatility
    GILTS_LONG: 0.15,           // 15% annual volatility
    // ... other assets
  },
  // ... other scenario volatilities
};
```

##### Correlation Matrix Integration
```python
def apply_correlation_structure(random_shocks, correlation_matrix):
    """Apply realistic inter-asset correlations using Cholesky decomposition"""
    
    # Cholesky decomposition of correlation matrix
    L = cholesky_decompose(correlation_matrix)
    
    # Transform independent shocks to correlated shocks
    correlated_shocks = {}
    for i, bucket in enumerate(CANONICAL_BUCKETS):
        correlated_value = sum(L[i][j] * random_shocks[j] for j in range(len(CANONICAL_BUCKETS)))
        correlated_shocks[bucket] = correlated_value
    
    return correlated_shocks
```

#### Simulation Execution Algorithm

```python
def simulate_portfolio_paths(request):
    """Execute Monte Carlo simulation with multiple paths"""
    
    # Initialize simulation parameters
    current_portfolio = harmonise_buckets(request.currentMix)
    target_portfolio = harmonise_buckets(request.targetMix)
    scenario_weights = normalize_weights(request.scenarioWeights)
    horizon_months = request.horizonMonths or 12
    num_paths = request.mc.paths if request.mc else 1
    
    # Blend scenario expectations
    blended_returns = blend_scenario_returns(SCENARIO_SHOCKS, scenario_weights)
    blended_vols = blend_scenario_volatilities(SCENARIO_VOLS, scenario_weights)
    
    # Setup random number generation
    rng = initialize_rng(request.mc.seed if request.mc else 1234567)
    normal_generator = box_muller_transform(rng)
    
    results = []
    for path in range(num_paths):
        current_path = simulate_single_path(
            current_portfolio, blended_returns, blended_vols,
            horizon_months, normal_generator, request.mode
        )
        target_path = simulate_single_path(
            target_portfolio, blended_returns, blended_vols,
            horizon_months, normal_generator, request.mode
        )
        
        results.append({
            "current_final": current_path[-1],
            "target_final": target_path[-1],
            "current_path": current_path,
            "target_path": target_path
        })
    
    return analyze_simulation_results(results, request)
```

#### Performance Metrics Calculation

##### Core Return Statistics
```python
def calculate_performance_metrics(simulation_results):
    """Calculate comprehensive performance statistics"""
    
    current_finals = [r["current_final"] for r in simulation_results]
    target_finals = [r["target_final"] for r in simulation_results]
    
    metrics = {
        # Central tendency
        "expected_return_current": np.mean([(f/100 - 1) for f in current_finals]),
        "expected_return_target": np.mean([(f/100 - 1) for f in target_finals]),
        
        # Risk metrics  
        "volatility_current": np.std([(f/100 - 1) for f in current_finals]),
        "volatility_target": np.std([(f/100 - 1) for f in target_finals]),
        
        # Downside risk
        "prob_loss_current": sum(1 for f in current_finals if f < 100) / len(current_finals),
        "prob_loss_target": sum(1 for f in target_finals if f < 100) / len(target_finals),
        
        # Value at Risk (5th percentile)
        "var_5_current": np.percentile(current_finals, 5) / 100 - 1,
        "var_5_target": np.percentile(target_finals, 5) / 100 - 1,
        
        # Expected Shortfall (mean of worst 5%)
        "es_5_current": np.mean([f for f in current_finals if f <= np.percentile(current_finals, 5)]) / 100 - 1,
        "es_5_target": np.mean([f for f in target_finals if f <= np.percentile(target_finals, 5)]) / 100 - 1,
        
        # Outperformance probability
        "prob_target_beats_current": sum(1 for r in simulation_results if r["target_final"] > r["current_final"]) / len(simulation_results)
    }
    
    # Calculate performance difference
    metrics["diff_pp"] = (metrics["expected_return_target"] - metrics["expected_return_current"]) * 100
    
    return metrics
```

##### Maximum Drawdown Analysis
```python
def calculate_max_drawdown(path):
    """Calculate maximum drawdown along a price path"""
    
    running_max = path[0]
    max_drawdown = 0
    
    for price in path:
        running_max = max(running_max, price)
        drawdown = (running_max - price) / running_max
        max_drawdown = max(max_drawdown, drawdown)
    
    return max_drawdown

def analyze_drawdown_statistics(simulation_results):
    """Analyze drawdown across all simulation paths"""
    
    current_drawdowns = []
    target_drawdowns = []
    
    for result in simulation_results:
        current_dd = calculate_max_drawdown(result["current_path"])
        target_dd = calculate_max_drawdown(result["target_path"]) 
        current_drawdowns.append(current_dd)
        target_drawdowns.append(target_dd)
    
    return {
        "max_drawdown_median": {
            "current": np.median(current_drawdowns),
            "target": np.median(target_drawdowns)
        },
        "max_drawdown_95th": {
            "current": np.percentile(current_drawdowns, 95),
            "target": np.percentile(target_drawdowns, 95)
        }
    }
```

#### Factor Attribution Analysis

##### Factor Grouping Structure
```typescript
const FACTOR_GROUPS = {
  "Equities": ["GLOBAL_EQUITY", "UK_EQUITY_VALUE", "GROWTH_TECH"],
  "Credit/Income": ["IG_CREDIT"],
  "Duration": ["GILTS_LONG"], 
  "Liquidity": ["CASH", "BILLS_SHORT_GILTS"],
  "Real Assets": ["GOLD", "COMMODITIES", "PROPERTY_UK_RESI"],
  "Other": ["ALTERNATIVES", "COLLECTIBLES_ART", "COLLECTIBLES_WINE", "CRYPTO_BTC", "CRYPTO_ETH"]
};
```

##### Attribution Calculation
```python
def calculate_factor_attribution(current_mix, target_mix, blended_returns):
    """Calculate performance attribution by factor groups"""
    
    attribution = []
    
    for factor_name, bucket_list in FACTOR_GROUPS.items():
        current_weight = sum(current_mix.get(bucket, 0) for bucket in bucket_list)
        target_weight = sum(target_mix.get(bucket, 0) for bucket in bucket_list)
        factor_return = sum(blended_returns.get(bucket, 0) * target_mix.get(bucket, 0) 
                           for bucket in bucket_list)
        
        # Calculate contribution difference
        weight_diff = target_weight - current_weight
        contribution_pp = weight_diff * factor_return * 100
        
        attribution.append({
            "factor": factor_name,
            "pp": round(contribution_pp, 2)
        })
    
    return sorted(attribution, key=lambda x: abs(x["pp"]), reverse=True)
```

### Advanced Analytics Features

#### Multi-Horizon Analysis
```python
def multi_horizon_analysis(request):
    """Analyze performance across multiple time horizons"""
    
    horizons = request.multiHorizons or [6, 12, 24, 36]
    results = []
    
    for horizon in horizons:
        horizon_request = {**request, "horizonMonths": horizon}
        horizon_result = simulate_portfolio(horizon_request)
        
        # Calculate breakeven timing
        breakeven_month = calculate_breakeven_point(horizon_result)
        
        results.append({
            "horizonMonths": horizon,
            "expectedReturnCurrent": horizon_result["expectedReturnCurrent"],
            "expectedReturnTarget": horizon_result["expectedReturnTarget"], 
            "diffPp": horizon_result["diffPp"],
            "endValue": horizon_result["endValue"],
            "breakevenMonthMed": breakeven_month
        })
    
    return results

def calculate_breakeven_point(simulation_results):
    """Calculate when target portfolio is expected to outperform current"""
    
    median_paths = extract_median_paths(simulation_results)
    current_path = median_paths["current"]
    target_path = median_paths["target"]
    
    for month in range(len(current_path)):
        if target_path[month] > current_path[month]:
            return month
    
    return None  # Target never overtakes current in median scenario
```

#### Scenario Stress Testing
```python
def stress_test_scenarios(current_mix, target_mix):
    """Test portfolio performance under pure scenario conditions"""
    
    stress_results = []
    
    for scenario_id, scenario_shocks in SCENARIO_SHOCKS.items():
        # Calculate 12-month returns under pure scenario
        current_return = sum(current_mix.get(bucket, 0) * shock 
                           for bucket, shock in scenario_shocks.items())
        target_return = sum(target_mix.get(bucket, 0) * shock 
                          for bucket, shock in scenario_shocks.items())
        
        stress_results.append({
            "id": scenario_id,
            "label": SCENARIO_LABELS[scenario_id],
            "retCurrent": current_return,
            "retTarget": target_return,
            "diffPp": (target_return - current_return) * 100
        })
    
    return sorted(stress_results, key=lambda x: abs(x["diffPp"]), reverse=True)
```

### Cost Analysis Integration

#### Transaction Cost Modeling
```python
def calculate_transaction_costs(gap_analysis, portfolio_value_gbp):
    """Estimate transaction costs for portfolio rebalancing"""
    
    # Asset-specific transaction cost rates
    TRANSACTION_COSTS = {
        "CASH": 0.0,                    # No cost for cash movements
        "BILLS_SHORT_GILTS": 0.001,     # 0.1% for short gilts  
        "GILTS_LONG": 0.002,           # 0.2% for long gilts
        "IG_CREDIT": 0.003,            # 0.3% for corporate bonds
        "GLOBAL_EQUITY": 0.002,        # 0.2% for equity funds
        "UK_EQUITY_VALUE": 0.002,      # 0.2% for UK equities
        "GROWTH_TECH": 0.003,          # 0.3% for growth stocks
        "PROPERTY_UK_RESI": 0.050,     # 5.0% for property transactions
        "COMMODITIES": 0.005,          # 0.5% for commodity funds
        "GOLD": 0.010,                 # 1.0% for gold transactions
        "ALTERNATIVES": 0.020,         # 2.0% for alternatives
        "CRYPTO_BTC": 0.015,           # 1.5% for crypto transactions
        "CRYPTO_ETH": 0.015,           # 1.5% for crypto transactions
        "COLLECTIBLES_ART": 0.100,     # 10% for art transactions
        "COLLECTIBLES_WINE": 0.080     # 8% for wine transactions
    }
    
    total_cost = 0
    for row in gap_analysis.rows:
        if abs(row.deltaPct) > 0.001:  # Only cost for meaningful changes
            transaction_volume = abs(row.deltaPct) * portfolio_value_gbp
            cost_rate = TRANSACTION_COSTS.get(row.bucket, 0.005)  # Default 0.5%
            bucket_cost = transaction_volume * cost_rate
            total_cost += bucket_cost
    
    # Express as percentage of portfolio
    cost_percentage = total_cost / portfolio_value_gbp if portfolio_value_gbp > 0 else 0
    
    return {
        "totalCostGBP": total_cost,
        "costPercentage": cost_percentage,
        "estTurnoverPp": gap_analysis.turnoverPp,
        "costPerTurnover": cost_percentage / (gap_analysis.turnoverPp / 100) if gap_analysis.turnoverPp > 0 else 0
    }
```

---

## Step 6: Action Plan

### Purpose
Generate a deterministic, prioritized execution roadmap that converts portfolio gaps into specific, actionable steps with precise mathematical accuracy.

### Action Plan Engine Architecture

The Action Plan system uses the exact deterministic procedure specified by the user requirements:

#### Core Algorithm Framework
```python
def build_actions(request: ActionsRequest) -> ActionsResponse:
    """
    EXACT IMPLEMENTATION BRIEF - Deterministic procedure (generic)
    Converts current and target portfolio allocations into staged action plan
    """
    
    # Harmonize input allocations to canonical bucket structure
    current = harmonise_buckets(request.currentMix)
    target = harmonise_buckets(request.targetMix)
    portfolio_value = max(0, request.portfolioValueGBP or 0)
    
    # Configuration parameters
    min_trade_pct = request.minTradePct or 0.005      # 0.5pp minimum trade size
    max_moves = request.maxMoves or 8                 # Maximum 8 actions
    liquidity_floor = request.liquidityFloorPct or 0.10  # 10% liquidity minimum
    stage_illiquids = request.stageIlliquids or True     # Stage illiquid assets
    
    # Define donor priority order (most liquid to least liquid)
    donor_order = request.donorOrder or [
        "GROWTH_TECH", "GLOBAL_EQUITY", "ALTERNATIVES", "PROPERTY_UK_RESI",
        "COMMODITIES", "GOLD", "UK_EQUITY_VALUE", "IG_CREDIT", "GILTS_LONG",
        "CRYPTO_BTC", "CRYPTO_ETH", "COLLECTIBLES_ART", "COLLECTIBLES_WINE"
    ]
```

#### Step 1: Calculate Portfolio Needs
```python
    # 1) Calculate per-bucket need (target - current)
    needs = {}
    total_abs_need = 0
    
    for bucket in CANONICAL_BUCKETS:
        need = (target[bucket] or 0) - (current[bucket] or 0)
        needs[bucket] = need
        total_abs_need += abs(need)
    
    # Early exit if no meaningful changes required
    if total_abs_need < 0.001:  # Less than 0.1% total change
        return generate_no_action_response()
```

#### Step 2: Liquidity Fix Actions (Stage 1 Priority)
```python
    # 2) Address liquidity shortfall first (highest priority)
    current_liquidity = current["CASH"] + current["BILLS_SHORT_GILTS"]
    liquidity_shortfall = max(0, liquidity_floor - current_liquidity)
    
    stage_1_actions = []
    stage_2_actions = []
    
    if liquidity_shortfall > 1e-6:  # Meaningful liquidity gap
        remaining_shortfall = liquidity_shortfall
        
        # Source liquidity from donor assets in priority order
        for donor_bucket in donor_order:
            if remaining_shortfall <= 1e-6:
                break
            
            available_to_trim = current[donor_bucket]
            trim_amount = min(available_to_trim, remaining_shortfall)
            
            if trim_amount > 1e-6:
                stage_1_actions.append({
                    "type": "TRIM",
                    "bucket": donor_bucket,
                    "deltaPct": -trim_amount,
                    "stage": 1,
                    "rationale": f"Liquidity fix: trim {trim_amount*100:.1f}pp from {donor_bucket}",
                    "estCostPct": get_transaction_cost_rate(donor_bucket)
                })
                remaining_shortfall -= trim_amount
        
        # Allocate liquidity proceeds between BILLS and CASH
        liquidity_raised = liquidity_shortfall - remaining_shortfall
        
        # Prefer short gilts (Bills) for yield, fall back to cash
        bills_capacity = 1.0 - current["BILLS_SHORT_GILTS"]  # Remaining capacity
        to_bills = min(liquidity_raised, bills_capacity)
        to_cash = max(0, liquidity_raised - to_bills)
        
        if to_bills > 1e-6:
            stage_1_actions.append({
                "type": "ADD",
                "bucket": "BILLS_SHORT_GILTS", 
                "deltaPct": to_bills,
                "stage": 1,
                "rationale": f"Liquidity fix: add {to_bills*100:.1f}pp to short gilts",
                "estCostPct": get_transaction_cost_rate("BILLS_SHORT_GILTS")
            })
        
        if to_cash > 1e-6:
            stage_1_actions.append({
                "type": "ADD",
                "bucket": "CASH",
                "deltaPct": to_cash, 
                "stage": 1,
                "rationale": f"Liquidity fix: add {to_cash*100:.1f}pp to cash",
                "estCostPct": get_transaction_cost_rate("CASH")
            })
```

#### Step 3: Rebalancing Actions (by Gap Magnitude)
```python
    # 3) Address largest portfolio gaps (rebalancing)
    # Sort buckets by absolute gap size (largest first)
    gap_priority_order = sorted(CANONICAL_BUCKETS, 
                               key=lambda b: abs(needs[b]), 
                               reverse=True)
    
    moves_count = 0
    for bucket in gap_priority_order:
        gap = needs[bucket]
        
        # Skip small gaps below minimum trade threshold
        if abs(gap) < min_trade_pct:
            continue
        
        # Check if asset should be staged due to illiquidity
        is_illiquid = stage_illiquids and bucket in ILLIQUID_BUCKETS
        
        if not is_illiquid and moves_count < max_moves:
            # Stage 1: Immediate action for liquid assets
            action_type = "ADD" if gap > 0 else "TRIM"
            stage_1_actions.append({
                "type": action_type,
                "bucket": bucket,
                "deltaPct": gap,
                "stage": 1,
                "rationale": f"Rebalancing: {action_type.lower()} {abs(gap)*100:.1f}pp {bucket}",
                "estCostPct": get_transaction_cost_rate(bucket)
            })
            moves_count += 1
        
        elif is_illiquid:
            # Stage 2: Deferred action for illiquid assets
            action_type = "ADD" if gap > 0 else "TRIM"
            stage_2_actions.append({
                "type": action_type,
                "bucket": bucket,
                "deltaPct": gap,
                "stage": 2,
                "rationale": f"Illiquid rebalancing: {action_type.lower()} {abs(gap)*100:.1f}pp {bucket}",
                "estCostPct": get_transaction_cost_rate(bucket)
            })
```

#### Step 4: Generate Monetary Values and Summary Statistics
```python
    # 4) Convert percentage changes to GBP amounts
    all_actions = stage_1_actions + stage_2_actions
    
    for action in all_actions:
        action["amountGBP"] = abs(action["deltaPct"]) * portfolio_value
    
    # 5) Calculate portfolio-level summary metrics
    total_abs_change = sum(abs(action["deltaPct"]) for action in all_actions)
    estimated_turnover_pp = (total_abs_change * 100) / 2  # Half of gross changes
    
    # Weighted average transaction cost
    total_cost_weighted = sum(abs(action["deltaPct"]) * action["estCostPct"] 
                             for action in all_actions)
    estimated_cost_pct = total_cost_weighted / total_abs_change if total_abs_change > 0 else 0
    
    # Current and target liquidity levels
    liquidity_now_pct = (current["CASH"] + current["BILLS_SHORT_GILTS"]) * 100
    liquidity_target_pct = (target["CASH"] + target["BILLS_SHORT_GILTS"]) * 100
```

#### Step 5: Generate Implementation Playbook
```python
    # 6) Generate step-by-step implementation guidance
    playbook_steps = []
    
    if stage_1_actions:
        playbook_steps.append("STAGE 1 - IMMEDIATE ACTIONS (within 1-2 weeks):")
        
        for i, action in enumerate(stage_1_actions, 1):
            verb = "Reduce" if action["type"] == "TRIM" else "Increase"
            bucket_display = action["bucket"].replace("_", " ").title()
            percentage = abs(action["deltaPct"]) * 100
            
            playbook_steps.append(
                f"{i}. {verb} {bucket_display} allocation by {percentage:.1f} percentage points "
                f"(~£{action['amountGBP']:,.0f} transaction)"
            )
    
    if stage_2_actions:
        playbook_steps.append("\nSTAGE 2 - DEFERRED ACTIONS (within 3-6 months):")
        
        for i, action in enumerate(stage_2_actions, 1):
            verb = "Reduce" if action["type"] == "TRIM" else "Increase"
            bucket_display = action["bucket"].replace("_", " ").title()
            percentage = abs(action["deltaPct"]) * 100
            
            playbook_steps.append(
                f"{len(stage_1_actions) + i}. {verb} {bucket_display} by {percentage:.1f}pp "
                f"(~£{action['amountGBP']:,.0f}) - illiquid asset, allow extended timeframe"
            )
    
    # Add implementation best practices
    playbook_steps.extend([
        "\nIMPLEMENTATION BEST PRACTICES:",
        "• Execute Stage 1 actions before Stage 2 to maintain liquidity",
        "• Consider pound-cost averaging for large transactions (>£50k)",
        "• Monitor market conditions - delay during high volatility periods",
        "• Keep detailed records for tax reporting and portfolio tracking",
        f"• Estimated total transaction costs: {estimated_cost_pct*100:.2f}% of portfolio"
    ])
```

### Action Classification System

#### Action Types
1. **TRIM**: Reduce allocation in over-weighted asset
2. **ADD**: Increase allocation in under-weighted asset  
3. **TRANSFER**: Move capital between assets (future enhancement)
4. **Liquidity Fix**: Special case for liquidity shortfall remediation

#### Staging Logic
```python
ILLIQUID_BUCKETS = [
    "PROPERTY_UK_RESI",        # Property transactions take 3-6 months
    "ALTERNATIVES",            # Private equity/hedge funds have lock-ups
    "COLLECTIBLES_ART",        # Art market illiquidity
    "COLLECTIBLES_WINE"        # Fine wine market illiquidity
]

def determine_action_stage(bucket, moves_count, max_moves, stage_illiquids):
    """Determine whether action should be Stage 1 (immediate) or Stage 2 (deferred)"""
    
    if stage_illiquids and bucket in ILLIQUID_BUCKETS:
        return 2  # Always defer illiquid assets
    
    if moves_count >= max_moves:
        return 2  # Defer if too many actions already
    
    return 1  # Default to immediate execution
```

#### Transaction Cost Integration
```python
TRANSACTION_COST_RATES = {
    # Highly liquid, low-cost assets
    "CASH": 0.000,
    "BILLS_SHORT_GILTS": 0.001,
    "GILTS_LONG": 0.002,
    
    # Standard liquid assets
    "GLOBAL_EQUITY": 0.002,
    "UK_EQUITY_VALUE": 0.002,
    "IG_CREDIT": 0.003,
    
    # Higher cost liquid assets  
    "GROWTH_TECH": 0.003,
    "COMMODITIES": 0.005,
    
    # Moderately illiquid assets
    "GOLD": 0.010,
    "CRYPTO_BTC": 0.015,
    "CRYPTO_ETH": 0.015,
    "ALTERNATIVES": 0.020,
    
    # Highly illiquid assets
    "PROPERTY_UK_RESI": 0.050,   # 5% (stamp duty, legal fees, estate agent)
    "COLLECTIBLES_WINE": 0.080,  # 8% (auction fees, storage, insurance)
    "COLLECTIBLES_ART": 0.100    # 10% (auction house premiums, insurance)
}

def get_transaction_cost_rate(bucket):
    """Get estimated transaction cost rate for asset bucket"""
    return TRANSACTION_COST_RATES.get(bucket, 0.005)  # Default 0.5%
```

### Action Plan Visualization

#### Executive Summary Dashboard
- **Total Portfolio Change**: Sum of absolute percentage point moves
- **Estimated Turnover**: Half of total absolute changes (standard metric)
- **Estimated Transaction Costs**: Weighted average of all actions
- **Current vs. Target Liquidity**: Cash position impact
- **Implementation Timeline**: Stage 1 (immediate) vs. Stage 2 (deferred)

#### Detailed Action Table
| Action | Asset | Change (pp) | Amount (GBP) | Rationale | Est. Cost % | Stage |
|--------|-------|-------------|--------------|-----------|-------------|--------|
| TRIM | Growth Tech | -3.2pp | £8,000 | Rebalancing: reduce overweight position | 0.3% | 1 |
| ADD | Short Gilts | +2.8pp | £7,000 | Liquidity fix: improve cash position | 0.1% | 1 |

#### Implementation Playbook
Detailed step-by-step instructions with:
- **Sequencing**: Stage 1 actions before Stage 2
- **Best Practices**: Pound-cost averaging, market timing considerations
- **Risk Management**: Liquidity preservation, tax implications
- **Cost Awareness**: Transaction cost estimates and optimization

### Quality Assurance and Validation

#### Mathematical Precision Checks
```python
def validate_action_plan(actions, current_mix, target_mix):
    """Ensure action plan achieves mathematical precision"""
    
    # Apply all actions to current portfolio
    simulated_result = apply_actions_to_portfolio(current_mix, actions)
    
    # Check convergence to target (within 0.1% tolerance)
    for bucket in CANONICAL_BUCKETS:
        current_final = simulated_result[bucket]
        target_value = target_mix[bucket]
        deviation = abs(current_final - target_value)
        
        if deviation > 0.001:  # 0.1% tolerance
            raise ValidationError(
                f"Action plan fails precision check for {bucket}: "
                f"deviation {deviation*100:.2f}pp exceeds 0.1% tolerance"
            )
    
    # Ensure portfolio sums to 100%
    total_allocation = sum(simulated_result.values())
    if abs(total_allocation - 1.0) > 0.001:
        raise ValidationError(f"Portfolio total {total_allocation:.3f} != 1.000")
    
    return True  # Validation passed
```

#### Liquidity Constraint Verification
```python
def verify_liquidity_constraints(actions, liquidity_floor):
    """Ensure liquidity requirements are met throughout execution"""
    
    # Simulate portfolio state after each action
    running_portfolio = dict(current_mix)
    
    for stage in [1, 2]:
        stage_actions = [a for a in actions if a["stage"] == stage]
        
        for action in stage_actions:
            # Apply action to running portfolio
            if action["type"] == "TRIM":
                running_portfolio[action["bucket"]] -= abs(action["deltaPct"])
            elif action["type"] == "ADD":
                running_portfolio[action["bucket"]] += action["deltaPct"]
            
            # Check liquidity constraint
            liquidity_level = running_portfolio["CASH"] + running_portfolio["BILLS_SHORT_GILTS"]
            if liquidity_level < liquidity_floor - 0.001:  # Allow small rounding tolerance
                raise ConstraintViolationError(
                    f"Liquidity drops below {liquidity_floor*100}% floor "
                    f"after {action['type']} {action['bucket']}"
                )
    
    return True  # All constraints satisfied
```

---

## Mathematical Models and Algorithms

### Persona Classification Mathematics

#### 8-Dimensional Scoring Model
The system uses a sophisticated multi-dimensional scoring framework:

```python
class PersonaClassifier:
    def __init__(self):
        self.dimension_weights = [1.0, 1.2, 0.8, 1.1, 0.9, 1.3, 1.0, 0.7]
        self.tie_break_gap = 5  # 5% gap triggers tie-breaking
        
    def calculate_cosine_similarity(self, user_vector, persona_vector):
        """Calculate weighted cosine similarity between profiles"""
        
        # Apply dimension weights
        weighted_user = [score * weight for score, weight in 
                        zip(user_vector, self.dimension_weights)]
        weighted_persona = [score * weight for score, weight in 
                           zip(persona_vector, self.dimension_weights)]
        
        # Cosine similarity calculation
        dot_product = sum(u * p for u, p in zip(weighted_user, weighted_persona))
        magnitude_user = math.sqrt(sum(u * u for u in weighted_user))
        magnitude_persona = math.sqrt(sum(p * p for p in weighted_persona))
        
        if magnitude_user == 0 or magnitude_persona == 0:
            return 0
            
        return dot_product / (magnitude_user * magnitude_persona)
    
    def apply_tie_breaking(self, matches):
        """Apply safety bias when matches are close"""
        
        if len(matches) < 2:
            return matches
            
        top_match, runner_up = matches[0], matches[1]
        gap = top_match.match_score - runner_up.match_score
        
        if gap <= self.tie_break_gap:
            # Choose safer persona based on risk and liquidity dimensions
            top_risk = top_match.persona.scores[0]      # Risk tolerance
            runner_up_risk = runner_up.persona.scores[0]
            
            top_liquidity = top_match.persona.scores[6]  # Liquidity needs
            runner_up_liquidity = runner_up.persona.scores[6]
            
            # Safety score: lower risk + higher liquidity = safer
            top_safety = -top_risk + top_liquidity
            runner_up_safety = -runner_up_risk + runner_up_liquidity
            
            if runner_up_safety > top_safety:
                # Swap top match with safer runner-up
                matches[0], matches[1] = matches[1], matches[0]
        
        return matches
```

### Economic Beliefs Scenario Mapping

#### Softmax with Temperature Control
```python
def calculate_scenario_probabilities(belief_responses, config):
    """Enhanced scenario probability calculation with softmax"""
    
    # Initialize scenario scores
    scenario_scores = {scenario: 0.0 for scenario in SCENARIOS}
    
    # Process each belief response
    for response in belief_responses:
        question = get_question(response.question_id)
        answer_value = response.value  # 1-5 Likert scale
        
        # Apply question-specific boosting
        boost_factor = config.question_boosts.get(response.question_id, 1.0)
        
        # Calculate directional impact
        if question.direction.startswith("lower->"):
            # Lower agreement increases scenario probabilities
            impact = (6 - answer_value) / 5  # Invert scale
        elif question.direction.startswith("higher->"):
            # Higher agreement increases scenario probabilities
            impact = answer_value / 5
        else:
            impact = (answer_value - 3) / 2  # Center around neutral
        
        # Apply weighted impact to relevant scenarios
        scenario_list = question.direction.split("->")[1].split(",")
        question_weight = config.weights[response.question_id]
        
        for scenario in scenario_list:
            scenario = scenario.strip()
            if scenario in scenario_scores:
                base_weight = question_weight.get(scenario, 0)
                scenario_scores[scenario] += base_weight * impact * boost_factor
    
    # Mean-center scores to prevent bias
    if config.mean_center_scores:
        mean_score = sum(scenario_scores.values()) / len(scenario_scores)
        scenario_scores = {s: score - mean_score for s, score in scenario_scores.items()}
    
    # Apply softmax transformation with temperature
    raw_scores = list(scenario_scores.values())
    temperature = config.softmax_temperature
    
    exp_scores = [math.exp(score / temperature) for score in raw_scores]
    total_exp = sum(exp_scores)
    
    probabilities = [exp_score / total_exp for exp_score in exp_scores]
    
    # Apply masking threshold
    masked_probs = [prob if prob > config.masked_softmax_threshold else 0 
                   for prob in probabilities]
    
    # Renormalize after masking
    total_masked = sum(masked_probs)
    if total_masked > 0:
        final_probs = [prob / total_masked for prob in masked_probs]
    else:
        final_probs = [1/len(SCENARIOS)] * len(SCENARIOS)  # Uniform fallback
    
    # Apply display capping
    capped_probs = [min(prob, config.display_cap_pct / 100) for prob in final_probs]
    
    return {scenario: prob for scenario, prob in zip(SCENARIOS, capped_probs)}
```

### Portfolio Optimization Mathematics

#### Target Allocation Blending
```python
def build_target_allocation(persona_id, scenario_weights, tilt_strength=0.3):
    """Build target allocation using persona base + scenario tilts"""
    
    # 1) Get persona baseline allocation
    base_allocation = PERSONA_DEFAULTS[persona_id].copy()
    
    # 2) Calculate scenario-weighted tilts
    scenario_tilts = {bucket: 0.0 for bucket in CANONICAL_BUCKETS}
    
    for scenario_id, weight in scenario_weights.items():
        scenario_template = SCENARIO_SHOCKS[scenario_id]
        for bucket, shock in scenario_template.items():
            scenario_tilts[bucket] += shock * weight
    
    # 3) Apply tilts with specified strength
    tilted_allocation = {}
    for bucket in CANONICAL_BUCKETS:
        base_weight = base_allocation.get(bucket, 0)
        tilt = scenario_tilts[bucket] * tilt_strength
        tilted_weight = base_weight + tilt
        tilted_allocation[bucket] = max(0, tilted_weight)  # Prevent negative
    
    # 4) Renormalize to sum to 100%
    total_weight = sum(tilted_allocation.values())
    if total_weight > 0:
        normalized_allocation = {bucket: weight / total_weight 
                               for bucket, weight in tilted_allocation.items()}
    else:
        normalized_allocation = base_allocation  # Fallback to base
    
    return normalized_allocation
```

#### Diversification Metrics
```python
def calculate_diversification_metrics(allocation):
    """Calculate Herfindahl-Hirschman Index and effective number of holdings"""
    
    # HHI = sum of squared weights
    hhi = sum(weight * weight for weight in allocation.values())
    
    # Effective number of holdings = 1 / HHI
    n_effective = 1 / hhi if hhi > 0 else 1
    
    # Diversification score (0-100, higher is more diversified)
    max_possible_hhi = 1.0  # All weight in single asset
    min_possible_hhi = 1 / len(CANONICAL_BUCKETS)  # Equal weights
    
    diversification_score = 100 * (max_possible_hhi - hhi) / (max_possible_hhi - min_possible_hhi)
    
    return {
        "hhi": hhi,
        "n_effective": n_effective,
        "diversification_score": max(0, min(100, diversification_score))
    }
```

### Monte Carlo Simulation Mathematics

#### Cholesky Decomposition for Correlations
```python
def apply_correlation_structure(independent_shocks, correlation_matrix):
    """Apply asset correlations using Cholesky decomposition"""
    
    def cholesky_decompose(matrix):
        """Minimal Cholesky decomposition for positive definite matrix"""
        n = len(matrix)
        L = [[0.0] * n for _ in range(n)]
        
        for i in range(n):
            for j in range(i + 1):
                if i == j:  # Diagonal elements
                    sum_sq = sum(L[i][k] * L[i][k] for k in range(j))
                    L[i][j] = math.sqrt(max(matrix[i][i] - sum_sq, 0))
                else:  # Below diagonal elements
                    sum_prod = sum(L[i][k] * L[j][k] for k in range(j))
                    if L[j][j] > 0:
                        L[i][j] = (matrix[i][j] - sum_prod) / L[j][j]
                    else:
                        L[i][j] = 0
        
        return L
    
    # Decompose correlation matrix
    chol_matrix = cholesky_decompose(correlation_matrix)
    
    # Apply transformation to independent shocks
    correlated_shocks = []
    for i in range(len(independent_shocks)):
        correlated_value = sum(chol_matrix[i][j] * independent_shocks[j] 
                              for j in range(len(independent_shocks)))
        correlated_shocks.append(correlated_value)
    
    return correlated_shocks
```

#### Box-Muller Normal Random Generation
```python
def box_muller_transform(uniform_rng):
    """Generate normally distributed random numbers from uniform RNG"""
    
    spare = None
    
    def generate_normal():
        nonlocal spare
        
        if spare is not None:
            value = spare
            spare = None
            return value
        
        # Generate two uniform random numbers
        u = uniform_rng()
        while u <= 1e-12:  # Avoid log(0)
            u = uniform_rng()
        
        v = uniform_rng()
        while v <= 1e-12:
            v = uniform_rng()
        
        # Box-Muller transformation
        magnitude = math.sqrt(-2 * math.log(u))
        z0 = magnitude * math.cos(2 * math.pi * v)
        z1 = magnitude * math.sin(2 * math.pi * v)
        
        spare = z1  # Save second value for next call
        return z0
    
    return generate_normal
```

#### Multi-Path Portfolio Evolution
```python
def simulate_portfolio_paths(config):
    """Generate multiple correlated asset price paths"""
    
    paths = []
    normal_gen = box_muller_transform(config.rng)
    
    for path_num in range(config.num_paths):
        path_values = [config.start_value]  # Initial portfolio value
        
        for month in range(config.horizon_months):
            # Generate correlated random shocks for all assets
            independent_shocks = [normal_gen() for _ in range(len(CANONICAL_BUCKETS))]
            correlated_shocks = apply_correlation_structure(independent_shocks, 
                                                           config.correlation_matrix)
            
            # Apply shocks to portfolio
            portfolio_return = 0
            for i, bucket in enumerate(CANONICAL_BUCKETS):
                weight = config.allocation[bucket]
                expected_return = config.blended_returns[bucket] / 12  # Monthly
                volatility = config.blended_vols[bucket] / math.sqrt(12)  # Monthly
                
                # Asset return = expected + volatility * shock
                asset_return = expected_return + volatility * correlated_shocks[i]
                portfolio_return += weight * asset_return
            
            # Compound portfolio value
            new_value = path_values[-1] * (1 + portfolio_return)
            path_values.append(new_value)
        
        paths.append(path_values)
    
    return paths
```

### Risk Metrics Calculation

#### Value at Risk (VaR) and Expected Shortfall
```python
def calculate_risk_metrics(final_values, confidence_level=0.05):
    """Calculate VaR and Expected Shortfall"""
    
    # Convert final values to returns
    returns = [(value / 100 - 1) for value in final_values]  # Assuming start value 100
    returns.sort()  # Sort for percentile calculation
    
    # Value at Risk (percentile)
    var_index = int(confidence_level * len(returns))
    var_value = returns[var_index]
    
    # Expected Shortfall (mean of worst cases)
    worst_returns = returns[:var_index + 1]
    expected_shortfall = sum(worst_returns) / len(worst_returns) if worst_returns else 0
    
    # Additional risk metrics
    volatility = statistics.stdev(returns) if len(returns) > 1 else 0
    downside_returns = [r for r in returns if r < 0]
    prob_loss = len(downside_returns) / len(returns)
    
    return {
        "var_5": var_value,
        "expected_shortfall_5": expected_shortfall,
        "volatility": volatility,
        "probability_of_loss": prob_loss,
        "worst_case": min(returns) if returns else 0,
        "best_case": max(returns) if returns else 0
    }
```

#### Maximum Drawdown Calculation
```python
def calculate_maximum_drawdown(price_path):
    """Calculate maximum peak-to-trough decline"""
    
    if len(price_path) < 2:
        return 0
    
    running_max = price_path[0]
    max_drawdown = 0
    drawdown_periods = []
    current_drawdown_start = None
    
    for i, price in enumerate(price_path):
        if price > running_max:
            # New peak reached
            if current_drawdown_start is not None:
                # End current drawdown period
                drawdown_periods.append({
                    "start_index": current_drawdown_start,
                    "end_index": i - 1,
                    "peak_value": running_max,
                    "trough_value": min(price_path[current_drawdown_start:i]),
                    "duration_months": i - current_drawdown_start
                })
                current_drawdown_start = None
            
            running_max = price
        else:
            # Potential drawdown
            if current_drawdown_start is None:
                current_drawdown_start = i
            
            drawdown = (running_max - price) / running_max
            max_drawdown = max(max_drawdown, drawdown)
    
    # Handle case where drawdown continues to end of period
    if current_drawdown_start is not None:
        trough_value = min(price_path[current_drawdown_start:])
        drawdown_periods.append({
            "start_index": current_drawdown_start,
            "end_index": len(price_path) - 1,
            "peak_value": running_max,
            "trough_value": trough_value,
            "duration_months": len(price_path) - current_drawdown_start
        })
    
    return {
        "max_drawdown": max_drawdown,
        "drawdown_periods": drawdown_periods,
        "longest_drawdown_months": max((p["duration_months"] for p in drawdown_periods), default=0)
    }
```

---

## AI Integration and Recommendation Logic

### GPT-5 Integration Architecture

The platform leverages OpenAI's GPT-5 model (released August 7, 2025) for sophisticated analysis and insights generation.

#### Model Configuration
```typescript
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const AI_CONFIG = {
    model: "gpt-5", // Latest OpenAI model as of August 2025
    temperature: 0.3, // Lower temperature for more deterministic financial analysis
    max_tokens: 2000,
    response_format: { type: "json_object" },
    timeout: 30000 // 30 second timeout for API calls
};
```

### Strategic Commentary Generation

#### Context-Aware Analysis Engine
```python
def generate_portfolio_insights(portfolio_data, user_context):
    """Generate AI-powered portfolio insights with contextual awareness"""
    
    system_prompt = """You are a senior investment advisor providing sophisticated portfolio analysis. 
    Your insights should be:
    - Grounded in quantitative analysis
    - Contextually relevant to the investor's profile
    - Educational but not constituting financial advice
    - Focused on portfolio construction principles
    - Include specific percentage allocations and rationales
    
    Always include a disclaimer that this is for informational purposes only."""
    
    user_prompt = f"""
    Analyze this portfolio transition for an investor:
    
    Investor Profile:
    - Persona: {user_context.persona_name}
    - Risk Profile: {user_context.risk_profile}
    - Time Horizon: {user_context.time_horizon}
    - Liquidity Needs: {user_context.liquidity_preference}
    - Economic Outlook: {user_context.scenario_weights}
    
    Portfolio Analysis:
    - Current Allocation: {portfolio_data.current_mix}
    - Recommended Allocation: {portfolio_data.target_mix}
    - Key Changes: {portfolio_data.major_moves}
    - Turnover Required: {portfolio_data.turnover_pp}%
    - Belief Alignment: {portfolio_data.belief_alignment_current} → {portfolio_data.belief_alignment_target}
    
    Provide analysis in JSON format:
    {{
        "overexposure_risks": ["list of concentration risks"],
        "diversification_improvements": ["list of diversification benefits"],
        "scenario_alignment": "explanation of how portfolio aligns with economic views",
        "implementation_considerations": ["practical execution guidance"],
        "risk_reward_profile": "overall risk-return assessment",
        "educational_insights": ["key investment principles demonstrated"]
    }}
    """
    
    response = openai.chat.completions.create(
        model=AI_CONFIG["model"],
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=AI_CONFIG["temperature"],
        response_format=AI_CONFIG["response_format"]
    )
    
    return json.loads(response.choices[0].message.content)
```

### Portfolio Analysis AI Components

#### Overexposure Detection Algorithm
```python
def detect_portfolio_overexposures(allocation, thresholds):
    """AI-enhanced overexposure detection with contextual analysis"""
    
    overexposures = []
    
    # Single asset concentration analysis
    for bucket, weight in allocation.items():
        if weight > thresholds.single_asset_max:
            risk_level = "HIGH" if weight > 0.4 else "MODERATE" if weight > 0.3 else "LOW"
            
            overexposures.append({
                "type": "single_asset",
                "asset": bucket,
                "current_weight": weight,
                "threshold": thresholds.single_asset_max,
                "excess_weight": weight - thresholds.single_asset_max,
                "risk_level": risk_level,
                "rationale": get_concentration_risk_explanation(bucket, weight)
            })
    
    # Geographic concentration analysis
    uk_exposure = (allocation.get("UK_EQUITY_VALUE", 0) + 
                  allocation.get("PROPERTY_UK_RESI", 0))
    if uk_exposure > thresholds.geographic_max:
        overexposures.append({
            "type": "geographic",
            "region": "UK",
            "current_weight": uk_exposure,
            "threshold": thresholds.geographic_max,
            "excess_weight": uk_exposure - thresholds.geographic_max,
            "risk_level": "MODERATE",
            "rationale": "Excessive UK concentration increases country-specific risk"
        })
    
    # Sector concentration analysis  
    tech_exposure = (allocation.get("GROWTH_TECH", 0) + 
                    allocation.get("CRYPTO_BTC", 0) + 
                    allocation.get("CRYPTO_ETH", 0))
    if tech_exposure > thresholds.sector_max:
        overexposures.append({
            "type": "sector",
            "sector": "Technology",
            "current_weight": tech_exposure,
            "threshold": thresholds.sector_max,
            "excess_weight": tech_exposure - thresholds.sector_max,
            "risk_level": "HIGH",
            "rationale": "High tech concentration increases volatility and correlation risk"
        })
    
    return overexposures
```

#### Diversification Scoring AI
```python
def calculate_ai_diversification_score(allocation, context):
    """AI-enhanced diversification scoring with contextual factors"""
    
    base_scores = {
        "asset_class_diversity": calculate_asset_class_diversity(allocation),
        "geographic_diversity": calculate_geographic_diversity(allocation),
        "liquidity_diversity": calculate_liquidity_diversity(allocation),
        "correlation_diversity": calculate_correlation_diversity(allocation),
        "time_horizon_diversity": calculate_time_horizon_diversity(allocation)
    }
    
    # Apply contextual weighting based on investor profile
    context_weights = {
        "Conservative": {"liquidity_diversity": 1.5, "correlation_diversity": 0.8},
        "Balanced": {"asset_class_diversity": 1.2, "geographic_diversity": 1.1},
        "Aggressive": {"correlation_diversity": 1.3, "time_horizon_diversity": 1.2}
    }
    
    risk_profile_weights = context_weights.get(context.risk_profile, {})
    
    # Calculate weighted score
    total_score = 0
    total_weight = 0
    
    for metric, base_score in base_scores.items():
        weight = risk_profile_weights.get(metric, 1.0)
        total_score += base_score * weight
        total_weight += weight
    
    final_score = total_score / total_weight if total_weight > 0 else 0
    
    # Generate AI insights on diversification
    insights = generate_diversification_insights(base_scores, context)
    
    return {
        "overall_score": round(final_score, 1),
        "component_scores": base_scores,
        "contextual_weights": risk_profile_weights,
        "insights": insights,
        "recommendations": generate_diversification_recommendations(base_scores)
    }
```

### Educational Content Generation

#### Investment Principles Extraction
```python
def extract_educational_insights(portfolio_changes):
    """Generate educational insights from portfolio recommendations"""
    
    principles = []
    
    # Analyze liquidity management
    if portfolio_changes.liquidity_delta > 0.05:  # >5% liquidity increase
        principles.append({
            "principle": "Liquidity Management",
            "explanation": "Maintaining adequate cash reserves provides flexibility during market stress and enables opportunistic investing",
            "application": f"Increasing liquidity from {portfolio_changes.liquidity_before:.1%} to {portfolio_changes.liquidity_after:.1%}",
            "historical_context": "During the 2008 financial crisis, portfolios with higher cash positions were able to capitalize on distressed opportunities"
        })
    
    # Analyze diversification improvements
    if portfolio_changes.hhi_improvement > 0.1:
        principles.append({
            "principle": "Diversification",
            "explanation": "Spreading investments across uncorrelated assets reduces portfolio volatility without proportionally reducing expected returns",
            "application": f"Reducing concentration (HHI) from {portfolio_changes.hhi_before:.3f} to {portfolio_changes.hhi_after:.3f}",
            "historical_context": "Modern Portfolio Theory demonstrates that diversification is the only 'free lunch' in investing"
        })
    
    # Analyze scenario hedging
    if portfolio_changes.scenario_alignment_improvement > 10:
        principles.append({
            "principle": "Scenario-Based Asset Allocation",
            "explanation": "Adjusting portfolio weights based on economic outlook helps align investments with expected market conditions",
            "application": f"Improving belief alignment from {portfolio_changes.belief_before}/100 to {portfolio_changes.belief_after}/100",
            "historical_context": "Tactical asset allocation based on economic indicators has historically added 1-2% annual alpha"
        })
    
    return principles
```

### Real-Time Market Context Integration

#### Economic Indicator Analysis
```python
def integrate_market_context(recommendations, market_data):
    """Enhance recommendations with current market conditions"""
    
    market_adjustments = {}
    
    # Analyze current market regime
    if market_data.vix > 25:  # High volatility environment
        market_adjustments["risk_reduction"] = {
            "adjustment": "Consider reducing risk asset allocation by 5-10%",
            "rationale": "High VIX suggests elevated market stress",
            "implementation": "Temporarily increase cash/short gilts allocation"
        }
    
    if market_data.yield_curve_inversion:  # Inverted yield curve
        market_adjustments["recession_hedge"] = {
            "adjustment": "Increase defensive positioning",
            "rationale": "Inverted yield curves historically precede recessions",
            "implementation": "Consider overweighting government bonds and defensive equities"
        }
    
    if market_data.inflation_expectations > 3.5:  # High inflation regime
        market_adjustments["inflation_hedge"] = {
            "adjustment": "Increase real asset allocation",
            "rationale": "High inflation erodes purchasing power of nominal assets",
            "implementation": "Consider increasing commodities, property, and inflation-linked bonds"
        }
    
    # Apply adjustments to base recommendations
    adjusted_recommendations = apply_market_adjustments(recommendations, market_adjustments)
    
    return {
        "base_recommendations": recommendations,
        "market_context": market_data,
        "adjustments_applied": market_adjustments,
        "final_recommendations": adjusted_recommendations
    }
```

### Risk Assessment AI

#### Multi-Dimensional Risk Analysis
```python
def perform_ai_risk_assessment(portfolio, investor_profile):
    """Comprehensive AI-powered risk assessment"""
    
    risk_dimensions = {
        "market_risk": analyze_market_risk(portfolio),
        "concentration_risk": analyze_concentration_risk(portfolio),
        "liquidity_risk": analyze_liquidity_risk(portfolio, investor_profile),
        "currency_risk": analyze_currency_risk(portfolio),
        "interest_rate_risk": analyze_interest_rate_risk(portfolio),
        "inflation_risk": analyze_inflation_risk(portfolio),
        "geopolitical_risk": analyze_geopolitical_risk(portfolio),
        "operational_risk": analyze_operational_risk(portfolio)
    }
    
    # Generate overall risk score (0-100)
    risk_weights = {
        "market_risk": 0.25,
        "concentration_risk": 0.20,
        "liquidity_risk": 0.15,
        "currency_risk": 0.10,
        "interest_rate_risk": 0.10,
        "inflation_risk": 0.10,
        "geopolitical_risk": 0.05,
        "operational_risk": 0.05
    }
    
    overall_risk_score = sum(risk_dimensions[dim]["score"] * risk_weights[dim] 
                           for dim in risk_dimensions)
    
    # Generate risk mitigation recommendations
    mitigation_strategies = []
    for dimension, analysis in risk_dimensions.items():
        if analysis["score"] > 70:  # High risk threshold
            mitigation_strategies.extend(analysis["mitigation_strategies"])
    
    return {
        "overall_risk_score": round(overall_risk_score, 1),
        "risk_level": classify_risk_level(overall_risk_score),
        "dimension_analysis": risk_dimensions,
        "key_risk_factors": [dim for dim, analysis in risk_dimensions.items() 
                           if analysis["score"] > 60],
        "mitigation_strategies": mitigation_strategies,
        "monitoring_indicators": generate_monitoring_indicators(risk_dimensions)
    }
```

---

## Technical Implementation Details

### Database Schema and Data Management

#### Core Database Tables
```sql
-- Investment Personas
CREATE TABLE investment_personas (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    portfolio_value INTEGER,
    wealth_tier VARCHAR,
    approach VARCHAR,
    risk_profile VARCHAR,
    age_range_min INTEGER,
    age_range_max INTEGER,
    goals TEXT[],
    scores DECIMAL[], -- 8-dimensional scores
    liquidity_months INTEGER,
    drawdown_cap DECIMAL,
    notes TEXT,
    property_bias DECIMAL,
    tech_bias DECIMAL,
    alt_bias DECIMAL,
    concentration_tolerance VARCHAR
);

-- User Profile Responses
CREATE TABLE profile_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL,
    question_id VARCHAR NOT NULL,
    option_index INTEGER,
    scores DECIMAL[], -- 8-dimensional impact scores
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Economic Belief Responses
CREATE TABLE belief_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL,
    question_id VARCHAR NOT NULL,
    value INTEGER, -- 1-5 Likert scale
    scenario_weights JSONB, -- Calculated scenario impacts
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio Allocations
CREATE TABLE portfolio_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL,
    allocation_type VARCHAR, -- 'current' or 'target'
    bucket VARCHAR NOT NULL,
    weight DECIMAL NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Action Plans
CREATE TABLE action_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL,
    action_type VARCHAR, -- 'TRIM', 'ADD', 'TRANSFER'
    bucket VARCHAR NOT NULL,
    delta_pct DECIMAL,
    amount_gbp INTEGER,
    rationale TEXT,
    stage INTEGER, -- 1 or 2
    est_cost_pct DECIMAL,
    status VARCHAR DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

#### Data Persistence Strategy
```typescript
interface StorageInterface {
    // Persona classification results
    savePersonaMatch(userId: string, personaId: string, matchScore: number, confidence: number): Promise<void>;
    getPersonaMatch(userId: string): Promise<PersonaMatch | null>;
    
    // Investment profile responses
    saveProfileResponses(userId: string, responses: ProfileResponse[]): Promise<void>;
    getProfileResponses(userId: string): Promise<ProfileResponse[]>;
    
    // Economic belief responses
    saveBeliefResponses(userId: string, responses: BeliefResponse[]): Promise<void>;
    getBeliefResponses(userId: string): Promise<BeliefResponse[]>;
    
    // Portfolio allocations
    saveAllocation(userId: string, type: 'current' | 'target', allocation: Record<string, number>): Promise<void>;
    getAllocation(userId: string, type: 'current' | 'target'): Promise<Record<string, number> | null>;
    
    // Action plans
    saveActionPlan(userId: string, actions: Action[]): Promise<void>;
    getActionPlan(userId: string): Promise<Action[]>;
    updateActionStatus(userId: string, actionId: string, status: string): Promise<void>;
}
```

### API Architecture

#### RESTful Endpoint Design
```typescript
// Persona endpoints
app.post('/api/personas/classify', async (req, res) => {
    const { userId, responses } = req.body;
    const classification = await personaClassifier.classify(responses);
    await storage.savePersonaMatch(userId, classification);
    res.json(classification);
});

app.get('/api/personas/:userId', async (req, res) => {
    const { userId } = req.params;
    const match = await storage.getPersonaMatch(userId);
    res.json(match);
});

// Economic beliefs endpoints
app.post('/api/beliefs/analyze', async (req, res) => {
    const { userId, responses } = req.body;
    const scenarioWeights = await beliefAnalyzer.calculateScenarios(responses);
    await storage.saveBeliefResponses(userId, responses);
    res.json({ scenarioWeights });
});

// Portfolio analysis endpoints  
app.post('/api/portfolio/analyze', async (req, res) => {
    const { userId, currentMix, targetMix, scenarioWeights } = req.body;
    
    const gapAnalysis = await gapAnalyzer.computeGap({
        currentMix,
        targetMix,
        scenarioWeights
    });
    
    res.json(gapAnalysis);
});

// Monte Carlo simulation endpoints
app.post('/api/simulation/run', async (req, res) => {
    const simulationRequest = req.body as SimV2Request;
    const results = await monteCarloEngine.simulate(simulationRequest);
    res.json(results);
});

// Action plan endpoints
app.post('/api/actions/generate', async (req, res) => {
    const { userId, currentMix, targetMix, portfolioValueGBP } = req.body;
    
    const actionPlan = await actionEngine.buildActions({
        currentMix,
        targetMix,
        portfolioValueGBP,
        liquidityFloorPct: 0.10,
        stageIlliquids: true
    });
    
    await storage.saveActionPlan(userId, actionPlan.staged.stage1.concat(actionPlan.staged.stage2));
    res.json(actionPlan);
});
```

### Frontend State Management

#### React Query Integration
```typescript
// Persona classification hook
export function usePersonaClassification() {
    const [responses, setResponses] = useState<ProfileResponse[]>([]);
    
    const classificationMutation = useMutation({
        mutationFn: async (responses: ProfileResponse[]) => {
            return apiRequest('/api/personas/classify', {
                method: 'POST',
                body: { userId: getCurrentUserId(), responses }
            });
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['persona'] });
        }
    });
    
    return {
        responses,
        addResponse: (response: ProfileResponse) => setResponses(prev => [...prev, response]),
        classifyPersona: classificationMutation.mutate,
        isClassifying: classificationMutation.isPending,
        result: classificationMutation.data
    };
}

// Portfolio analysis hook
export function usePortfolioAnalysis() {
    const analysisQuery = useQuery({
        queryKey: ['portfolio', 'analysis'],
        queryFn: async () => {
            const currentMix = await apiRequest('/api/portfolio/current');
            const targetMix = await apiRequest('/api/portfolio/target');
            const scenarioWeights = await apiRequest('/api/beliefs/scenarios');
            
            return apiRequest('/api/portfolio/analyze', {
                method: 'POST',
                body: { currentMix, targetMix, scenarioWeights }
            });
        },
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });
    
    return {
        gapAnalysis: analysisQuery.data,
        isAnalyzing: analysisQuery.isLoading,
        error: analysisQuery.error,
        refetch: analysisQuery.refetch
    };
}

// Monte Carlo simulation hook
export function useMonteCarloSimulation() {
    const [simulationConfig, setSimulationConfig] = useState({
        horizonMonths: 12,
        paths: 5000,
        mode: 'hold' as RebalanceMode
    });
    
    const simulationMutation = useMutation({
        mutationFn: async (config: SimV2Request) => {
            return apiRequest('/api/simulation/run', {
                method: 'POST',
                body: config
            });
        }
    });
    
    return {
        config: simulationConfig,
        updateConfig: setSimulationConfig,
        runSimulation: simulationMutation.mutate,
        isRunning: simulationMutation.isPending,
        results: simulationMutation.data,
        error: simulationMutation.error
    };
}
```

### Performance Optimization

#### Caching Strategy
```typescript
// Redis caching for expensive calculations
class CacheManager {
    constructor(private redis: Redis) {}
    
    async cacheScenarioCalculation(userId: string, responses: BeliefResponse[], result: any) {
        const key = `scenarios:${userId}:${this.hashResponses(responses)}`;
        await this.redis.setex(key, 3600, JSON.stringify(result)); // Cache for 1 hour
    }
    
    async getCachedScenarioCalculation(userId: string, responses: BeliefResponse[]) {
        const key = `scenarios:${userId}:${this.hashResponses(responses)}`;
        const cached = await this.redis.get(key);
        return cached ? JSON.parse(cached) : null;
    }
    
    async cacheMonteCarloResults(simulationId: string, results: SimV2Response) {
        const key = `simulation:${simulationId}`;
        await this.redis.setex(key, 1800, JSON.stringify(results)); // Cache for 30 minutes
    }
    
    private hashResponses(responses: BeliefResponse[]): string {
        return crypto.createHash('md5')
            .update(JSON.stringify(responses.sort((a, b) => a.questionId.localeCompare(b.questionId))))
            .digest('hex');
    }
}
```

#### Lazy Loading Implementation
```typescript
// Lazy load heavy components
const MonteCarloSimulation = lazy(() => import('@/components/MonteCarloSimulation'));
const PortfolioVisualization = lazy(() => import('@/components/PortfolioVisualization'));
const ActionPlanGenerator = lazy(() => import('@/components/ActionPlanGenerator'));

// Performance monitoring
function PerformanceWrapper({ children, componentName }: { children: React.ReactNode, componentName: string }) {
    useEffect(() => {
        const startTime = performance.now();
        return () => {
            const endTime = performance.now();
            console.log(`${componentName} render time: ${endTime - startTime}ms`);
        };
    });
    
    return <>{children}</>;
}
```

### Error Handling and Validation

#### Input Validation Framework
```typescript
// Zod schemas for API validation
const PersonaResponseSchema = z.object({
    questionId: z.string().min(1),
    optionIndex: z.number().int().min(0).max(4),
    scores: z.array(z.number()).length(8)
});

const BeliefResponseSchema = z.object({
    questionId: z.string().min(1), 
    value: z.number().int().min(1).max(5)
});

const AllocationSchema = z.record(
    z.string(), // Asset bucket name
    z.number().min(0).max(1) // Weight between 0 and 1
).refine(
    (allocation) => {
        const total = Object.values(allocation).reduce((sum, weight) => sum + weight, 0);
        return Math.abs(total - 1.0) < 0.001; // Allow small rounding tolerance
    },
    { message: "Allocation weights must sum to 100%" }
);

// Error boundary component
class AnalysisErrorBoundary extends React.Component {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    
    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }
    
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Analysis error:', error, errorInfo);
        
        // Report to monitoring service
        reportError(error, {
            context: 'portfolio_analysis',
            errorInfo,
            userId: getCurrentUserId()
        });
    }
    
    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="text-red-800 font-semibold">Analysis Error</h3>
                    <p className="text-red-600 mt-2">
                        An error occurred during portfolio analysis. Please try refreshing the page or contact support.
                    </p>
                    <Button 
                        onClick={() => this.setState({ hasError: false, error: null })}
                        variant="outline" 
                        className="mt-4"
                    >
                        Retry Analysis
                    </Button>
                </div>
            );
        }
        
        return this.props.children;
    }
}
```

### Security Considerations

#### Data Protection and Privacy
```typescript
// Data encryption for sensitive information
class DataProtectionService {
    private encryptionKey: string;
    
    constructor() {
        this.encryptionKey = process.env.ENCRYPTION_KEY!;
    }
    
    encryptPortfolioData(data: any): string {
        const cipher = crypto.createCipher('aes-256-gcm', this.encryptionKey);
        let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }
    
    decryptPortfolioData(encryptedData: string): any {
        const decipher = crypto.createDecipher('aes-256-gcm', this.encryptionKey);
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return JSON.parse(decrypted);
    }
    
    // PII anonymization
    anonymizeUserId(realUserId: string): string {
        return crypto.createHash('sha256').update(realUserId).digest('hex').substring(0, 16);
    }
}

// Rate limiting for API endpoints
const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/api/', rateLimiter);
```

This comprehensive user manual provides complete coverage of the demo platform's logic, calculations, and implementation details. The system represents a sophisticated integration of behavioral finance, quantitative analysis, AI-powered insights, and deterministic execution planning, all delivered through an intuitive user interface that guides investors through a professional-grade portfolio optimization process.