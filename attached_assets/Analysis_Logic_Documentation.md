# Step 5: Analysis - Safety Lights Framework
## Comprehensive Logic and Calculations Documentation

---

## Overview

The Analysis page (Step 5) evaluates user portfolios using Unlock's **Safety Lights Framework**. This framework assesses three key risk metrics and determines whether the portfolio is within safe guardrails.

**Three Safety Lights:**
1. **Liquidity** - Cash runway / emergency fund adequacy
2. **Concentration** - Single-name / largest holding risk
3. **Illiquids** - Illiquid asset allocation exposure

Each metric receives a status: **GREEN** (safe), **AMBER** (caution), or **RED** (action required).

---

## 1. LIQUIDITY (Cash Runway)

### Purpose
Ensures the user has sufficient liquid cash to cover essential expenses in an emergency, without needing to sell investments at an inopportune time.

### Input Values
- `liquid_cash_gbp`: User's liquid cash / emergency fund (from Intake page)
- `annual_essential_spend_gbp`: User's annual essential expenses (from Intake page)

### Calculation

```
Monthly Spend = Annual Essential Spend / 12

Cash Runway (months) = Liquid Cash / Monthly Spend
```

**Example:**
- Liquid Cash: £25,000
- Annual Essential Spend: £36,000
- Monthly Spend: £36,000 / 12 = £3,000
- Cash Runway: £25,000 / £3,000 = **8.33 months**

### Thresholds

| Status | Condition | Description |
|--------|-----------|-------------|
| **RED** | Cash runway < 6 months | Below minimum - high risk |
| **AMBER** | 6 ≤ Cash runway < 9 months | Below ideal - moderate risk |
| **GREEN** | Cash runway ≥ 9 months | Healthy buffer - low risk |

### Policy Configuration (policy_defaults.yaml)
```yaml
projection:
  min_cash_months: 6           # RED threshold
  cash_amber_multiple: 1.5     # AMBER = min × 1.5 = 9 months
```

### Edge Cases
- If `monthly_spend <= 0`: Treat as infinite runway (return ∞)
- Display: ∞ symbol for infinite runway

---

## 2. CONCENTRATION (Single Name Risk)

### Purpose
Prevents over-reliance on any single investment, which could expose the portfolio to significant losses if that investment performs poorly.

### Input Values
- `largest_line_pct`: Percentage of total portfolio in largest single holding
- Calculated from Holdings page data

### Calculation

```
Largest Line % = (Largest Holding Value / Total Portfolio Value) × 100
```

**Example:**
- Total Portfolio: £500,000
- Largest Holding (AAPL): £90,000
- Largest Line %: (£90,000 / £500,000) × 100 = **18%**

### Thresholds

| Status | Condition | Description |
|--------|-----------|-------------|
| **RED** | Largest holding > 20% | Dangerous concentration |
| **AMBER** | 15% < Largest holding ≤ 20% | Moderate concentration |
| **GREEN** | Largest holding ≤ 15% | Well diversified |

### Policy Configuration
```yaml
projection:
  max_single_name_pct: 0.20              # 20% = RED threshold
  concentration_amber_fraction: 0.75      # AMBER = 20% × 0.75 = 15%
```

---

## 3. ILLIQUIDS (Illiquid Asset Exposure)

### Purpose
Limits exposure to assets that cannot be quickly sold at fair value (property, private equity, collectibles, etc.), ensuring the user can access funds when needed.

### Input Values
- `illiquid_pct`: Percentage of portfolio in illiquid assets
- Holdings marked as "illiquid" on the Holdings page

### Calculation

```
Illiquid % = (Sum of Illiquid Holdings / Total Portfolio Value) × 100
```

**Example:**
- Total Portfolio: £500,000
- Illiquid Holdings: £35,000 (art collection)
- Illiquid %: (£35,000 / £500,000) × 100 = **7%**

### Thresholds

| Status | Condition | Description |
|--------|-----------|-------------|
| **RED** | Illiquid allocation > 10% | Excessive illiquidity |
| **AMBER** | 7% < Illiquid allocation ≤ 10% | Elevated illiquidity |
| **GREEN** | Illiquid allocation ≤ 7% | Healthy liquidity |

### Policy Configuration
```yaml
collectibles:
  max_weight_pct: 0.10          # 10% = RED threshold
  amber_fraction: 0.70           # AMBER = 10% × 0.70 = 7%
```

---

## 4. OVERALL STATUS CALCULATION

### Logic

```typescript
function getWorstStatus(statuses: SafetyStatus[]): SafetyStatus {
  if (statuses.includes('RED')) return 'RED';
  if (statuses.includes('AMBER')) return 'AMBER';
  return 'GREEN';
}

overall_status = getWorstStatus([liquidity, concentration, illiquids]);
```

The overall status is the **worst** of the three individual lights.

### Status Codes and Messages

| Overall Status | Status Code | Label | Message |
|---------------|-------------|-------|---------|
| **GREEN** | ALL_CLEAR | "Within guardrails" | "All Safety Lights are green. Your portfolio is currently within Unlock's guardrails for liquidity, concentration and illiquid exposure." |
| **AMBER** | CAUTION | "Caution: amber flags present" | "One or more Safety Lights are amber. We recommend addressing these areas before significantly increasing risk." |
| **RED** | ACTION_REQUIRED | "Action required: red flags present" | "One or more Safety Lights are red. We will not recommend risk-increasing moves until these issues are addressed." |

---

## 5. TILTS ALLOWED RULE

### Critical Business Logic

```typescript
tilts_allowed = (overall_status !== 'RED');
```

**Rule:** If ANY Safety Light is RED, belief-based tilts are **LOCKED**.

### Implications
- **Tilts Enabled (GREEN/AMBER)**: User can customize portfolio with belief-based tilts within guardrails
- **Tilts Locked (RED)**: User must address red flags before making risk-increasing moves

---

## 6. COMPLETE CODE REFERENCE

### Main Analysis Function

```typescript
export function computeSafetyLights(intake: Intake, policy?: Policy): SafetyLightsResult {
  const pol = policy || getPolicy();
  const { projection, collectibles } = pol;

  // 1. LIQUIDITY CALCULATION
  const monthlySpend = intake.spend / 12;
  let cashRunwayMonths: number;
  
  if (monthlySpend <= 0) {
    cashRunwayMonths = Number.MAX_SAFE_INTEGER; // Infinite runway
  } else {
    cashRunwayMonths = intake.cash / monthlySpend;
  }

  const minCashMonths = projection.min_cash_months; // 6
  const amberThreshold = minCashMonths * projection.cash_amber_multiple; // 9

  let liquidity: SafetyStatus;
  if (cashRunwayMonths < minCashMonths) {
    liquidity = 'RED';
  } else if (cashRunwayMonths < amberThreshold) {
    liquidity = 'AMBER';
  } else {
    liquidity = 'GREEN';
  }

  // 2. CONCENTRATION CALCULATION
  const maxSingleName = projection.max_single_name_pct; // 0.20
  const concentrationAmberThreshold = maxSingleName * projection.concentration_amber_fraction; // 0.15

  let concentration: SafetyStatus;
  if (intake.largest_line_pct > maxSingleName) {
    concentration = 'RED';
  } else if (intake.largest_line_pct > concentrationAmberThreshold) {
    concentration = 'AMBER';
  } else {
    concentration = 'GREEN';
  }

  // 3. ILLIQUIDS CALCULATION
  const maxIlliquid = collectibles.max_weight_pct; // 0.10
  const illiquidsAmberThreshold = maxIlliquid * collectibles.amber_fraction; // 0.07

  let illiquids: SafetyStatus;
  if (intake.illiquid_pct > maxIlliquid) {
    illiquids = 'RED';
  } else if (intake.illiquid_pct > illiquidsAmberThreshold) {
    illiquids = 'AMBER';
  } else {
    illiquids = 'GREEN';
  }

  // 4. OVERALL STATUS
  const overall_status = getWorstStatus([liquidity, concentration, illiquids]);
  const tilts_allowed = overall_status !== 'RED';

  return {
    liquidity,
    concentration,
    illiquids,
    overall_status,
    tilts_allowed,
    // ... additional details
  };
}
```

---

## 7. DATA FLOW SUMMARY

```
┌─────────────────────────────────────────────────────────────────┐
│                        INTAKE PAGE (Step 3)                     │
├─────────────────────────────────────────────────────────────────┤
│  • liquid_cash_gbp (emergency fund)                             │
│  • annual_essential_spend_gbp                                   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       HOLDINGS PAGE (Step 4)                    │
├─────────────────────────────────────────────────────────────────┤
│  • Individual holdings with values                              │
│  • Illiquid flags per holding                                   │
│  • Calculated: largest_line_pct, illiquid_pct                   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ANALYSIS PAGE (Step 5)                     │
├─────────────────────────────────────────────────────────────────┤
│  computeSafetyLights({                                          │
│    cash: liquid_cash_gbp,                                       │
│    spend: annual_essential_spend_gbp,                           │
│    largest_line_pct: (from holdings summary),                   │
│    illiquid_pct: (from holdings summary)                        │
│  })                                                             │
├─────────────────────────────────────────────────────────────────┤
│  OUTPUT:                                                        │
│  • liquidity: GREEN | AMBER | RED                               │
│  • concentration: GREEN | AMBER | RED                           │
│  • illiquids: GREEN | AMBER | RED                               │
│  • overall_status: GREEN | AMBER | RED                          │
│  • tilts_allowed: boolean                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. THRESHOLD SUMMARY TABLE

| Metric | GREEN | AMBER | RED |
|--------|-------|-------|-----|
| **Liquidity** | ≥ 9 months runway | 6-9 months | < 6 months |
| **Concentration** | ≤ 15% largest | 15-20% | > 20% |
| **Illiquids** | ≤ 7% illiquid | 7-10% | > 10% |

---

## 9. FILES REFERENCE

| File | Purpose |
|------|---------|
| `server/services/analysis.ts` | Core analysis logic |
| `server/config/policy_defaults.yaml` | Configurable thresholds |
| `server/services/policy.ts` | Policy loading and overrides |
| `client/src/pages/onboarding-v2/Analysis.tsx` | Frontend display |
| `client/src/state/onboardingV2Store.ts` | State management |

---

*Generated from Unlock Free Version codebase - December 2025*
