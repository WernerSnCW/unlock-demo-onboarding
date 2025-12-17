# Overview

This project is "Unlock Free Version" - a business due diligence platform prototype built with React, TypeScript, and Express.js. The application provides investment due diligence snapshots using entirely mock data but appears fully functional. It features a split-screen premium dashboard with "Your World" (personalized content) on the left and "The Market" (curated news & insights) on the right, plus a comprehensive Investor Toolkit workspace. The platform includes enhanced account settings with comprehensive investment preferences including existing investment holdings and investment interests. The design uses explicit Tailwind classes for reliable text visibility and consistent theming across light/dark modes with a calm, professional fintech aesthetic.

**Recent Completion (Aug 26, 2025):** Full database-backed portfolio holdings, property portfolio, and alternative investments systems are now operational with complete CRUD functionality and comprehensive form validation. The alternatives tab includes advanced features like tax wrapper eligibility (EIS/SEIS/VCT), risk ratings, and real-time return calculations.

**Recent Addition (Aug 27, 2025):** Integrated external valuation tools with secure environment-based configuration. Art and whisky valuation tools now automatically load configured app URLs from environment secrets (ART_VALUATION_APP_URL, WHISKY_VALUATION_APP_URL) with proper error handling and Replit-optimized embedding support.

**Major Refactoring Complete (Aug 28, 2025):** Successfully implemented fully configurable and generic valuation system with all hard-coded values moved to `server/valuation_config.ts`. Key achievements:
- Created reusable `computePVMultipleBlock()` function for present value calculations
- Implemented generic `getDiscountRate()` logic with fallback to configurable defaults
- Added configurable rounding, multiple ranges, and peer comparison ordering
- Enhanced frontend with conditional ROI section visibility based on funding terms
- All valuation computations now use generic, configuration-driven approach for maximum flexibility and reusability

**DCF Extraction Debugging Complete (Aug 28, 2025):** Successfully diagnosed and resolved the valuation display system. Key findings:
- DCF present value extraction works correctly (£20.5m extracted and displayed)
- Industry multiples correctly show 0 when pitch deck lacks ARR/MRR/EBITDA data
- Enhanced LLM extraction prompts for improved financial metrics detection
- System properly validates authentic data vs. synthetic fallbacks
- Valuation engine correctly computes peer comparisons only when sufficient data is available

**Postcode Data Infrastructure Complete (Aug 28, 2025):** Successfully implemented comprehensive UK postcode to LAD code mapping:
- Created `postcode_lad_mapping` table with proper Drizzle ORM schema
- Uploaded complete UK postcode dataset: 2,706,777 postcode records with 363 unique LAD codes
- Built efficient batch upload system processing 1,000 records per batch
- Added TypeScript types and validation for postcode/LAD mapping operations
- Database infrastructure now supports location-based business analysis and regional property insights
- Complete coverage includes England, Scotland, Wales, and Northern Ireland postcodes

**Property Valuation LAD Integration Complete (Aug 28, 2025):** Successfully integrated postcode LAD mapping with UK HPI property valuations:
- Replaced hard-coded postcode prefix mapping with precise database lookups
- Enhanced regional accuracy using LAD codes (e.g., "Tonbridge and Malling" vs generic "Kent")
- Implemented intelligent fallback strategies for partial postcode matches
- Added comprehensive logging showing postcode → LAD code → HPI region mapping chain
- Significantly improved valuation accuracy across all UK regions including Scotland, Wales, and Northern Ireland

**Design System Migration Complete (Aug 28, 2025):** Successfully migrated property portfolio cards to use official CSS design system:
- Replaced all hardcoded Tailwind colors with CSS custom properties from index.css
- Updated property cards to use --primary, --secondary, --accent, --muted color variables
- Enhanced visual consistency across light/dark themes using official design tokens
- Implemented proper gradient backgrounds using CSS variables for brand consistency
- Updated action buttons to use official color scheme (--destructive for delete, --primary for actions)
- All visual elements now follow the established design system for reliable theming

**Portfolio Summary & LLM Analysis Complete (Aug 28, 2025):** Successfully implemented comprehensive portfolio overview with AI-powered insights:
- Added portfolio summary section with interactive pie chart showing allocation across Traditional Holdings, Property Portfolio, and Alternative Investments
- Created total portfolio value display with breakdown by investment type and count
- Integrated GPT-5 powered investment analysis API endpoint providing educational insights (not financial advice)
- Built overexposure detection system identifying concentration risks (>30% single asset class, >20% sector, >15% property location)
- Implemented diversification scoring (0-10) considering geographic spread, sector diversity, and asset class balance
- Added risk assessment summaries, key portfolio insights, and general guidance points
- Fixed property valuation data integration using latestValuation.valueGbp field structure
- All analysis includes professional disclaimers emphasizing informational purpose only

**Investor Persona Feature Complete (Dec 12, 2025):** Successfully implemented end-to-end investor personas for Onboarding v2:
- Created persona engine module (`server/services/personaEngine.ts`) with 8 persona families: CORE_GROWTH, BALANCED_ALLOCATOR, SELF_DIRECTED_GROWTH, FOUNDER_ENTREPRENEUR, PROPERTY_LED, ALTERNATIVES_FOCUSED, INCOME_STABILITY, CAPITAL_PRESERVATION
- Implemented trait-based scoring system using 6 weighted traits (risk_appetite, alternatives_bias, property_bias, liquidity_comfort, income_orientation, complexity_proxy)
- Extended analysis service to accept personaCues, asset_class_breakdown, and extended intake data
- Built PersonaCard component with Fortune 500 professional styling displaying: label, one-liner, "Why This Fits You" bullets, "What This Means For Your Plan" bullets, "Risks to Watch" bullets, and horizontal trait bars
- Added PersonaCues interface to onboarding store with optional fields (age_band, portfolio_stage, investing_focus, has_defined_benefit_pension, owns_business, etc.)
- Integrated persona computation into Analysis page with asset class breakdown derived from holdings
- All persona cues are optional - validation doesn't block navigation

**Weighted Persona Matching Complete (Dec 17, 2025):** Enhanced persona engine with fully transparent weighted matching system:
- Implemented PERSONA_WEIGHT_TABLE with 8 personas and trait weights summing to 1.0 per persona
- Pure weighted matching: match_score = sum(trait[t] × weight[t]), match_confidence = (topScore - secondScore)
- No hidden boosts: persona scoring is fully transparent and explainable
- Hard overrides (FOUNDER_ENTREPRENEUR, PROPERTY_LED, ALTERNATIVES_FOCUSED) trigger first for obvious dominance cases (>25% business, >30% property, GT_25 crypto band from questionnaire)
- All 42 persona tests passing with transparent scoring

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development patterns
- **Build Tool**: Vite for fast development server and optimized production builds with hot module replacement
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with explicit color classes for reliable text visibility (migrated from CSS custom properties)
- **Design System**: Professional color palette with --primary: #5193B3, --secondary: #62C4C3, --accent: #F8D49B
- **Layout System**: Split-screen dashboard: "Your World" (left) and "The Market" (right) with responsive mobile stacking, plus comprehensive Investor Toolkit
- **Spacing Scale**: Unified spacing tokens (12px, 16px, 24px) and radius tokens (8px, 12px, 16px)
- **Theme Support**: Complete light/dark mode implementation with ThemeProvider
- **Mock Data**: JSON-based fake data system for realistic business due diligence content
- **UI Components**: Custom business-focused components (NewsCard, WelcomePanel, AlertsPreferences, NewsletterControls, ToolCard, ToolkitModal)
- **Investor Toolkit**: Comprehensive tool workspace with categorized tool cards (Tax Relief, Analysis, Utilities), modal system, and premium preview section

## Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Language**: TypeScript with ES modules for type safety and modern JavaScript features
- **Development**: tsx for TypeScript execution with hot reloading in development
- **Middleware**: Custom logging middleware for API request tracking and error handling
- **Storage Interface**: Abstracted storage layer with in-memory implementation for development and PostgreSQL for production

## Data Storage
- **Database**: PostgreSQL with Neon serverless integration for cloud deployment
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Schema**: Shared TypeScript schemas between frontend and backend using Zod for validation
- **Migrations**: Drizzle Kit for database migrations and schema synchronization
- **Investment Preferences**: Enhanced investor preferences schema with existingInvestments and investmentInterests arrays
- **Portfolio Holdings**: Database-backed portfolio positions with full CRUD operations via usePortfolioStoreDB hook
- **Property Portfolio**: Comprehensive property management with tables for properties, ownerships, loans, valuations, leases, and cashflows

## Project Structure
- **Monorepo Design**: Client, server, and shared code organized in separate directories
- **Component Library**: Specialized business components (WelcomePanel, NewsFeed, AlertsPreferences, NewsletterControls, Watchlist, UpgradeCard, ToolCard, ToolkitModal, SimpleAllowanceCalculator, enhanced PreferencesPanel with investment preferences)
- **Mock Data System**: JSON files in /src/mocks/ providing realistic business data
- **Theme Architecture**: CSS custom properties in index.css for global color management
- **Split-Screen Layout**: Desktop (2-col equal), Tablet (2-col with wider right), Mobile (1-col stacked: Welcome → Alerts → Newsletter → News → Watchlist → Upgrade)
- **Sticky Elements**: Newsletter controls sticky at top of right column with shadow
- **Development Tools**: Integrated development environment with Replit-specific optimizations

## Authentication & Security
- **Session Management**: PostgreSQL-backed session storage using connect-pg-simple
- **User Schema**: Predefined user table structure with UUID primary keys and unique constraints
- **Type Safety**: End-to-end type safety from database schema to frontend components

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Query for frontend state management
- **Build Tools**: Vite with React plugin, TypeScript compiler, PostCSS with Autoprefixer
- **Routing**: Wouter for lightweight client-side navigation

## UI & Styling
- **Component Library**: Radix UI primitives for accessible, unstyled components
- **Styling Framework**: Tailwind CSS with custom design tokens and CSS variables
- **Icons**: Font Awesome for comprehensive icon library
- **Utility Libraries**: clsx and tailwind-merge for conditional class composition

## Backend Infrastructure
- **Web Framework**: Express.js with middleware for JSON parsing and URL encoding
- **Development Server**: Custom Vite integration for seamless frontend/backend development
- **Session Storage**: connect-pg-simple for PostgreSQL session management

## Database & ORM
- **Database Provider**: Neon PostgreSQL serverless database
- **ORM**: Drizzle ORM with PostgreSQL dialect and Zod integration
- **Schema Validation**: Zod for runtime type checking and validation
- **Database Tools**: Drizzle Kit for migrations and schema management

## Development Tools
- **TypeScript**: Strict type checking with path mapping for clean imports
- **Replit Integration**: Cartographer and runtime error modal plugins for Replit environment
- **Code Quality**: ESLint-compatible tooling with proper module resolution

## Utility Libraries
- **Date Handling**: date-fns for date manipulation and formatting
- **Form Management**: React Hook Form with Hookform resolvers for form validation
- **Carousel Components**: Embla Carousel for interactive content sliders
- **Command Interface**: cmdk for command palette functionality