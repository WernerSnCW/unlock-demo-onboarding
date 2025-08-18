# Overview

This project is "Unlock Free Version" - a business due diligence platform prototype built with React, TypeScript, and Express.js. The application provides investment due diligence snapshots using entirely mock data but appears fully functional. It features a split-screen premium dashboard with "Your World" (personalized content) on the left and "The Market" (curated news & insights) on the right, plus a comprehensive Investor Toolkit workspace. The design uses explicit Tailwind classes for reliable text visibility and consistent theming across light/dark modes with a calm, professional fintech aesthetic.

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

## Project Structure
- **Monorepo Design**: Client, server, and shared code organized in separate directories
- **Component Library**: Specialized business components (WelcomePanel, NewsFeed, AlertsPreferences, NewsletterControls, Watchlist, UpgradeCard, ToolCard, ToolkitModal, SimpleAllowanceCalculator)
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