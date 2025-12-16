# Step 3 Intake - Structural Cues Test Checklist

## Manual Testing Checklist

### Basic Toggle Behavior
- [ ] **Toggle OFF → No band shown**: When any structural cue toggle is OFF, no follow-up dropdown should be visible
- [ ] **Toggle ON → Band required**: When a toggle is turned ON, the corresponding dropdown should appear
- [ ] **"Not sure" accepted**: Selecting "Not sure" in any dropdown should allow proceeding

### Validation Rules
- [ ] **Toggle ON + No band → Blocked**: If any toggle is ON but its band dropdown is empty, clicking "Continue to Holdings" should show a toast error
- [ ] **All toggles OFF → Proceed**: With all toggles OFF, form should submit normally
- [ ] **Toggle ON + Band selected → Proceed**: With toggle ON and any band option selected (including "Not sure"), form should submit

### Navigation Persistence
- [ ] **Back/forward preserves values**: Navigate forward to Holdings, then back to Intake - all selected values should be preserved
- [ ] **Refresh preserves values**: After filling out toggles and bands, refresh the page - values should persist from localStorage

### Step 5 Analysis - Context Section
- [ ] **Context section appears**: When any structural cue is enabled, the "Self-reported context from Intake" section should appear in Analysis
- [ ] **Correct band display**: Each enabled cue should show its band value (e.g., "covers ~25-50% of retirement income")
- [ ] **No context when all OFF**: When all toggles are OFF, the context section should not appear

### Backward Compatibility
- [ ] **Legacy data migration**: Old localStorage with `has_meaningful_crypto` should migrate to `has_crypto`
- [ ] **Missing bands default to NOT_SURE**: If old data has toggle=true but no band field, it should default to "Not sure"

### Safety Lights (No Changes)
- [ ] **Liquidity calculation unchanged**: Cash runway formula should work as before
- [ ] **Concentration calculation unchanged**: Largest holding % should calculate correctly
- [ ] **Illiquids calculation unchanged**: Illiquid allocation % should calculate correctly

## Structural Cues Mapping

| Toggle | Band Field | Band Options |
|--------|-----------|--------------|
| has_defined_benefit_pension | db_income_coverage_band | LT_25, 25_50, 50_75, GT_75, NOT_SURE |
| owns_business | private_business_wealth_band | LT_10, 10_25, 25_50, GT_50, NOT_SURE |
| has_employer_stock | employer_stock_alloc_band | LT_5, 5_15, 15_30, GT_30, NOT_SURE |
| has_crypto | crypto_alloc_band | LT_5, 5_10, 10_25, GT_25, NOT_SURE |

## Files Changed
- `client/src/state/onboardingV2Store.ts` - Added band types, PersonaCues fields, migration logic
- `client/src/pages/onboarding-v2/Intake.tsx` - New UI with toggle + conditional band pattern
- `client/src/pages/onboarding-v2/Analysis.tsx` - Context section for self-reported cues
