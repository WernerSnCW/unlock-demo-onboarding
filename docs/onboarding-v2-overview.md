# Onboarding v2 Overview

## Purpose

Onboarding v2 is a cleaner, spec-driven investor onboarding demo flow. It provides a streamlined experience for demonstrating the Unlock platform's capabilities without the complexity of the original onboarding implementation.

## Routes

All Onboarding v2 routes are namespaced under `/onboarding-v2/`:

| Route | Component | Description |
|-------|-----------|-------------|
| `/onboarding-v2/welcome` | Welcome | Introduction and overview of the onboarding process |
| `/onboarding-v2/method` | Method | Choose data intake method (upload, manual, connect, advisor) |
| `/onboarding-v2/intake` | Intake | Collect basic investor information |
| `/onboarding-v2/holdings` | Holdings | Review and confirm portfolio holdings |
| `/onboarding-v2/beliefs` | Beliefs | Capture investment beliefs and preferences |
| `/onboarding-v2/analysis` | Analysis | Show portfolio analysis results |
| `/onboarding-v2/target` | Target | Display recommended target allocation |
| `/onboarding-v2/plan/transition` | PlanTransition | Phased transition plan |
| `/onboarding-v2/plan/wrappers` | PlanWrappers | Tax wrapper recommendations |
| `/onboarding-v2/report` | Report | Final personalized report summary |

## Entry Point

The onboarding demo can be started from:
- The "Start Onboarding Demo" button in the WelcomePanel on the Dashboard
- Direct navigation to `/onboarding-v2/welcome`

## File Structure

```
client/src/
├── components/
│   └── onboarding-v2/
│       ├── OnboardingLayout.tsx   # Shared layout with navigation
│       └── StepIndicator.tsx      # Step progress indicator
└── pages/
    └── onboarding-v2/
        ├── Welcome.tsx
        ├── Method.tsx
        ├── Intake.tsx
        ├── Holdings.tsx
        ├── Beliefs.tsx
        ├── Analysis.tsx
        ├── Target.tsx
        ├── PlanTransition.tsx
        ├── PlanWrappers.tsx
        └── Report.tsx
```

## Next Steps

The following work is planned for future iterations:

1. **API Integration**: Wire these pages to a new onboarding API for real data persistence
2. **Safety Lights Logic**: Integrate with the policy-based Safety Lights system for risk assessment
3. **Real Data**: Replace sample/mock data with actual investor portfolio data
4. **State Management**: Add proper state management for form data across steps
5. **Validation**: Implement form validation and error handling

## Technical Observations

### Existing Onboarding Implementation

The existing onboarding flow (located in `client/src/pages/InvestorOnboarding.tsx`) has the following characteristics:

- **Stack**: React with wouter for routing, Tailwind CSS for styling
- **Data Storage**: Uses localStorage for portfolio data persistence
- **CSV Parsing**: Manual CSV parsing with basic column mapping
- **Flow**: Simple upload → analysis pattern (3 steps indicated in UI)

### Technical Patterns Used

- **Routing**: wouter (`useLocation`, `Link` components)
- **Styling**: Tailwind CSS with CSS custom properties (design tokens)
- **Component Library**: shadcn/ui components (Button, Progress, etc.)
- **Data Fetching**: TanStack Query for API calls
- **Layout**: Header/Footer wrapped pages with max-width containers

### Known Technical Debt in Existing Flow

- CSV parsing is fragile and lacks robust error handling
- No proper form validation
- Uses localStorage for persistence (not ideal for production)
- Hardcoded step count that doesn't match actual flow
- Console logging for debugging left in production code

## Important Note

> **WARNING**: The old onboarding flow (`/investor-onboarding`, `/investor-preferences`, `/investor-preferences-v2`) 
> should NOT be modified while building Onboarding v2. Treat the old code as read-only to avoid breaking 
> existing functionality.
