# Current Onboarding Flow - Developer Notes

> **WARNING**: The existing onboarding flow should NOT be modified while we build Onboarding v2.
> Treat this code as read-only.

## Location of Old Onboarding Flow

### Key Files

| Route | Page Component | Location |
|-------|---------------|----------|
| `/investor-onboarding` | `InvestorOnboarding` | `client/src/pages/InvestorOnboarding.tsx` |
| `/investor-preferences` | `InvestorPreferences` | `client/src/pages/InvestorPreferences.tsx` |
| `/investor-preferences-v2` | `InvestorPreferencesWizard` | `client/src/pages/InvestorPreferencesWizard.tsx` |

### Related Components

- `client/src/contexts/InvestorContext.tsx` - Investor state management
- `client/src/data/beliefQuestions.ts` - Belief questionnaire data
- `client/src/data/personas.ts` - Persona definitions
- `client/src/hooks/useBeliefQuestionnaire.ts` - Belief questionnaire hook
- `client/src/hooks/usePersonaQuiz.ts` - Persona quiz hook

### How the Old Flow is Entered

1. The old onboarding flow can be accessed directly via `/investor-onboarding`
2. The preferences wizard is available at `/investor-preferences-v2`
3. Various buttons throughout the app may link to these routes

## Onboarding v2 - New Implementation

Onboarding v2 will live in a completely separate namespace under `/onboarding-v2/*`:

- All new pages will be in `client/src/pages/onboarding-v2/`
- New shared components in `client/src/components/onboarding-v2/`
- The old flow remains untouched and fully functional

This separation ensures we can iterate on the new demo flow without risk to the existing implementation.
