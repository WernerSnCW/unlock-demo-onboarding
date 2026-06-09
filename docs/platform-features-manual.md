# Unlock Platform — Feature Manual (non‑onboarding)

> **What this document is.** A plain‑English reference to **every part of the Unlock
> platform outside the Onboarding v2 flow** — the dashboard, portfolio tools, the
> Investor Toolkit, due diligence, syndication, business research, news, and the demo
> /presentation screens. For each area it explains what the feature is, what the user
> sees, and — importantly — **how "real" it is** (fully working, working off mock
> data, presentation‑only, or a locked/stub placeholder).
>
> **Companion document.** The investor onboarding journey is documented separately in
> [`docs/onboarding-v2-manual.md`](./onboarding-v2-manual.md). This manual deliberately
> does **not** repeat that flow.
>
> **A note on "functional".** This is a prototype/demo platform. Many screens look
> fully built but run on curated mock JSON, browser `localStorage`, or hard‑coded
> example records rather than a live backend. That's by design — the goal is to
> demonstrate the *experience*. This manual flags the status of each feature honestly
> so you know what would and wouldn't work with real data today.

---

## Status legend

Each feature is tagged with one of these:

| Tag | Meaning |
|-----|---------|
| 🟢 **Functional** | Real computation and/or a live backend API or database. Works with real inputs. |
| 🟡 **Mock‑data** | The UI and logic work, but the data is curated JSON / `localStorage` / hard‑coded examples rather than a live source. |
| 🔵 **Presentation‑only** | A static narrative/brand screen for demos — no data or interaction beyond navigation. |
| ⚪ **Stub / locked** | A placeholder or "premium/coming‑soon" card with no working implementation behind it. |

---

## Table of contents

1. [Navigation map](#1-navigation-map)
2. [Dashboard & home](#2-dashboard--home)
3. [Portfolio & holdings](#3-portfolio--holdings)
4. [Account settings](#4-account-settings)
5. [Investor Toolkit](#5-investor-toolkit)
6. [Pitch Deck Analyser](#6-pitch-deck-analyser)
7. [Due Diligence](#7-due-diligence)
8. [Syndication](#8-syndication)
9. [Businesses](#9-businesses)
10. [News](#10-news)
11. [Demo & presentation suite](#11-demo--presentation-suite)
12. [Legacy onboarding (superseded)](#12-legacy-onboarding-superseded)
13. [Miscellaneous pages](#13-miscellaneous-pages)
14. [Assets & data model](#14-assets--data-model)
15. [Backend, data & infrastructure notes](#15-backend-data--infrastructure-notes)
16. [Source references](#16-source-references)

---

## 1. Navigation map

| Route | Page | Area | Status |
|-------|------|------|--------|
| `/` | Home | Dashboard | 🟢 |
| `/asset-register` | Asset Register | Portfolio | 🟡 |
| `/targets-bands` | Targets & Bands | Portfolio | 🟡 |
| `/portfolio-analysis` | Portfolio Analysis | Portfolio | 🟢 / 🟡 |
| `/demo-portfolio-analysis` | Demo Portfolio Analysis | Portfolio (demo) | 🟡 |
| `/profile` | Profile | Portfolio / account | 🟢 |
| `/profile/portfolio` | Profile (Portfolio tab) | Portfolio | 🟢 |
| `/account-settings` | Account Settings | Account | 🟢 |
| `/toolkit` | Investor Toolkit | Tools | mixed |
| `/pitch-deck-analyser` | Pitch Deck Analyser | Tools | 🟢 |
| `/due-diligence` | Due Diligence Hub | Due diligence | 🟡 |
| `/due-diligence/requests` | DD Requests list | Due diligence | 🟡 |
| `/due-diligence/requests/:id` | DD Request detail | Due diligence | 🟡 |
| `/snapshot/:id`, `/due-diligence/snapshot/:id` | Snapshot Report | Due diligence | 🟡 |
| `/syndication` | Syndication directory | Syndication | 🟡 |
| `/syndication/bundles` | Syndicate Bundles | Syndication | 🟡 |
| `/syndication/:id` | Syndicate Detail | Syndication | 🟡 |
| `/businesses` | Businesses directory | Research | 🟡 |
| `/business/:id` | Business Profile | Research | 🟡 |
| `/news` | News (Enhanced) | News | 🟢 / 🟡 |
| `/advice-gap` | Advice Gap | Demo | 🔵 |
| `/demo` | Demo agenda | Demo | 🔵 |
| `/demo/agenda` | Demo Agenda | Demo | 🔵 |
| `/demo-simulation` | Demo Simulation | Demo | 🟡 |
| `/splash` | Splash screen | Demo | 🔵 |
| `/ending` | Ending splash | Demo | 🔵 |
| `/investor-onboarding` | Legacy onboarding | Legacy | 🟡 |
| `/investor-preferences`, `/investor-preferences-v2` | Legacy preferences | Legacy | 🟡 |

---

## 2. Dashboard & home

### Home — `/` 🟡 Mock‑data

**Plain English.** The main landing dashboard, built as a premium split screen:

- **"Your World" (left):** the user's personal financial picture — net worth,
  portfolio performance, and "Safety Lights" risk indicators.
- **"The Market" (right):** curated market trends, a news feed, and quick‑access
  **Investor Toolkit** shortcuts (calculators etc.).

**Key features.** Interactive news cards, quick‑action buttons to calculators, and a
watchlist. The dashboard content is driven by curated mock JSON
(`onboardingProfile.json`, `newsFeed.json`, `watchlist.json`); the only live query is
the selected investor's preferences (`/api/investors/.../preferences`). So the screen
looks fully populated but the figures and news on Home itself are demo‑seeded rather
than fetched live. (Live market quotes are used elsewhere — see Portfolio Analysis.)

---

## 3. Portfolio & holdings

### Asset Register — `/asset-register` 🟡 Mock‑data

**Plain English.** A full asset‑inventory workspace — think of it as the
"single source of truth" for everything the investor owns: investments, property,
cash, and the debts (liabilities) held against them. It's the richest single screen in
the app and is built to feel like a professional wealth‑management register.

**The six tabs.**

1. **Holdings Register** — the complete inventory of assets and liabilities, with live
   prices, cost basis, and tax treatment (see the column list below).
2. **Targets & Bands** — set target allocations and acceptable ranges per asset class,
   with "Drift" and "Breach" indicators when a class moves out of band. (Mirrors the
   standalone Targets & Bands page below.)
3. **Transactions** — an audit‑ready ledger of economic events: Buys, Sells,
   Dividends, Interest, Fees, Taxes, and Transfers.
4. **Documents** — a document store for statements, contract notes, and valuations,
   organised into "buckets" (e.g. Statements, Tax Relief).
5. **Reconciliation** — compares recorded holdings against broker statements to flag
   discrepancies (e.g. Vanguard, AJ Bell, Trading 212).
6. **Household** — manages multiple entities (Personal, Spouse, Ltd), tracks tax
   allowances (ISA, SIPP, JISA), and surfaces wrapper‑optimisation prompts.

**Holdings Register columns.** Asset, Type (ETF/Cash/Property/…), **Source** (Live,
CSV, OCR/document, or Manual — each shown with its own icon), Identifier (ISIN /
ticker / property title / wallet address), Custodian, Wrapper (ISA/SIPP/GIA/Personal),
Units, Cost (basis), Price, Value, Return (e.g. IRR / TWR / APR), Bucket (strategic
allocation), Tax/Relief (e.g. Accumulating, EIS, SIPP relief), Evidence (e.g. "On
file", "Valuation due"), and a Complete % bar.

**Add Asset modal** (3 steps): **Identify** — `isin`, `ticker`, `securityName`,
`wrapper`, `custodian`, `accountLabel`, `distributionType` (Accumulating/Distributing),
`bucket`; **Amount** — `units`, `price`, `costBasis`, `fees`, `tradeDate`,
`valuationDate`; **Evidence** — `notes`, `evidenceState`, `evidenceType`,
`evidenceReference`, `reminder`.

**Add Liability modal**: liability type (mortgage, loan, …), name/lender, linked
asset, outstanding principal, interest rate, monthly repayment, term‑end/due date, and
evidence type/reference.

**Sidebar.** Valuation snapshot ("as at" date, EOD pricing, GBP) with last
reconciliation status; **Entities** filter (Personal/Spouse/Ltd); **Wrappers** filter
(ISA/SIPP/GIA/Personal); **Custodians / wallets** list (e.g. Vanguard, AJ Bell, HSBC,
Ledger); an estate **Beneficiary** block (life‑beat check, fallback email, package);
and **Quick actions** (Add asset, Add liability, Import CSV, AI Import, Upload
evidence, Density toggle).

**Imports.** **AI Import** accepts "messy" inputs — PDF statements, contract notes, or
pasted text — and extracts fields (asset name, ISIN, units, price) for review before
they're committed. **CSV Import** handles bulk holdings via a template. A guided
**Help/Tour** walks through the valuation snapshot, entities, holdings table, KPIs, and
tabs.

**Status.** A high‑fidelity interactive prototype: the holdings, transactions, and
documents are **hard‑coded demo data held in local state** — the page itself does not
fetch from an API or persist to the database. A "source" legend (live / csv / ocr /
manual) simulates what real integrations would look like. For asset records that *do*
persist, see **Account Settings** and the **Assets & data model** section.

### Targets & Bands — `/targets-bands` 🟡 Mock‑data

**Plain English.** Strategic asset‑allocation management: set target percentages per
asset class and see when the portfolio drifts "out of band".

**Key features.**
- "Current vs Target" view per bucket (Equity, Bonds, Cash, …) with drift indicators
  when a class breaches its min/max limits.
- Toggle views: Bucket, Wrapper (ISA/SIPP/GIA), Account (custodian), Liabilities.
- A **"Propose Trades"** button that triggers a rebalance planner, "Snooze" alerts,
  and "Why this?" tooltips explaining the rebalance logic.

**Status.** Runs on demo bucket data to showcase the rebalancing concept.

### Portfolio Analysis — `/portfolio-analysis` 🟢 / 🟡

**Plain English.** A high‑end analytics dashboard for a single portfolio.

**Key features.**
- A hero value display with a "Live" animation.
- Two panels: allocation donut charts + holding lists on the left; AI insights and
  overexposure warnings on the right.
- **AI analysis** via `POST /api/portfolio/analyze`, plus **live market quote
  polling** (~every 30 seconds) for tickers in the data.

**Status.** Functional pipeline: it loads a portfolio the user uploaded via CSV
(stored in `localStorage` as `uploadedPortfolioData`) and fetches live quotes; if
nothing is uploaded it falls back to a ~£485k demo portfolio. The AI analysis and
market data are real; the fallback portfolio is mock.

### Demo Portfolio Analysis — `/demo-portfolio-analysis` 🟡 Mock‑data

**Plain English.** A demo variant of the analysis page, wired to the onboarding demo
journey rather than to uploaded data.

**Key features.**
- A 6‑tab layout: Overview, Refine, Gap, Performance, Risk, Stress.
- **Stress testing** against economic scenarios (e.g. "2008‑style property crash",
  "AI recession").
- Reads `questionnairePersonaResult` and `selectedScenario` from `localStorage` to
  reflect choices made during the demo.

**Status.** Contextual/mock — built to make the demo narrative concrete.

### Profile — `/profile` (and `/profile/portfolio`) 🟢 Functional

**Plain English.** The user's investment identity and settings hub.

**Key features.**
- Overview of investor type (e.g. "Angel"), risk appetite, and ticket range.
- A Portfolio tab with holdings, properties, and alternatives plus an "Upload
  Portfolio" CTA (Moneyhub/Plaid‑style connect, or CSV).
- Preferences and security/privacy settings, and a profile‑completion score.

**Status.** Functional — fetches from `/api/investors` and the database‑backed
portfolio store. `/profile/portfolio` is an alias that lands on the Portfolio tab.

---

## 4. Account settings

### Account Settings — `/account-settings` 🟢 Functional

**Plain English.** The most complete CRUD area in the app — full management of the
investor's profile and assets, with everything saved to the database.

**Key features.**
- Tabs for **Preferences**, **Tax Profile**, **Accounts** (brokers), and
  **Portfolios** (Holdings, Properties, Alternatives).
- Zod‑validated forms with real persistence via `/api/investors`, `/api/properties`,
  and `/api/alternatives`.
- Add/delete investor personas, link (mock) broker accounts, and manually enter
  property and alternative assets that persist in the database.

**Status.** Fully functional, database‑backed CRUD. (Broker links themselves are
mocked, but the records persist.)

---

## 5. Investor Toolkit

### Toolkit hub — `/toolkit`

**Plain English.** A central hub of tax, analysis, and utility tools, shown as cards
in categories (Tax Relief, Analysis, Utilities). Tools open either in a modal or as a
dedicated page. Some are fully working, some are premium‑locked stubs.

| Tool | How it opens | Status | Backend |
|------|--------------|--------|---------|
| **Pitch Deck Analyser** | Page `/pitch-deck-analyser` | 🟢 Functional | `POST /api/analyse-pitch-deck` (OpenAI) |
| **Property Valuation** | Modal | 🟢 Functional (real data) | `POST /api/property-valuation` (UK HPI + PPD + postcode→LAD) |
| **Allowance Calculator (EIS/SEIS)** | Modal | 🟢 Functional | Client‑side (`SEISEISCalculation.ts`) |
| **Art Valuation** | Modal | 🟢 Functional (external) | `GET /api/art-valuation-config` (env URL, embedded iframe/link) |
| **Whisky Valuation** | Modal | 🟢 Functional (external) | `GET /api/whisky-valuation-config` (env URL) |
| **Website Fact Checker** | Modal | 🟢 Functional | `POST /api/fact-check` (AI + news/Companies House) |
| **Document Checklist** | Modal | 🟢 Functional (informational) | None |
| **Loss Relief Calculator** | Modal | ⚪ Stub (premium‑locked) | — |
| **CGT Deferral Calculator** | Modal | ⚪ Stub (premium‑locked) | — |
| **Risk/Return Profiler** | Modal | ⚪ Stub (premium‑locked) | — |
| **Glossary** | Modal | ⚪ Stub (premium‑locked) | — |

**Highlights.**

- **Allowance Calculator (EIS/SEIS).** Real tax computation: handles tax‑year
  selection, income‑tax liability, carry‑back optimisation, annual limits (£200k SEIS;
  £1m–£2m EIS), and Knowledge‑Intensive Companies. Pure client‑side maths — no API.
- **Property Valuation.** A genuine "HPI + comparables" model: the user enters a
  postcode and property type and gets an estimated value, comparable historical sales,
  and trend charts. It queries the `uk_hpi` (Land Registry index) and
  `property_price_data` tables and uses `postcode_lad_mapping` to resolve the correct
  HPI region (≈2.7m postcodes loaded).
- **Art & Whisky Valuation.** Wrappers around separate external valuation apps. If the
  corresponding environment URL (`ART_VALUATION_APP_URL` / `WHISKY_VALUATION_APP_URL`)
  is configured, the tool embeds it in an iframe or links out; otherwise it shows a
  connection screen.
- **Website Fact Checker.** The user enters a URL and specific claims; the tool returns
  a verdict (Verified / Contradicted / …) with rationale and supporting evidence,
  using AI plus news/Companies House cross‑referencing.

---

## 6. Pitch Deck Analyser

### Pitch Deck Analyser — `/pitch-deck-analyser` 🟢 Functional

**Plain English.** Upload a startup pitch deck (PDF/PPTX) and get an automated
analysis and valuation.

**Key features.**
- AI extracts the standard deck sections (Problem, Solution, Market, Team, …) and
  scores strengths/weaknesses.
- A valuation model combining a **DCF present value** with **industry multiples**
  (multiples only appear when the deck contains ARR/MRR/EBITDA data; otherwise they
  read zero rather than inventing numbers). Peer comparisons are shown only when there
  is enough data.
- The valuation engine is configuration‑driven (`server/valuation_config.ts`):
  discount rates, multiple ranges, rounding, and peer ordering are all configurable.

**Status.** Functional via `POST /api/analyse-pitch-deck` (integrates OpenAI). It ships
with a hard‑coded "Unlock Pitch Deck" example and falls back to mock logic if the API
call fails, but the real endpoint exists and runs.

---

## 7. Due Diligence

This area lets a user request, track, and read investor‑grade due‑diligence reports on
companies. State is held in a persisted Zustand store (`useDueStore`,
`localStorage`), and request processing is simulated through a Queue → Processing →
Completed/Failed lifecycle.

### Due Diligence Hub — `/due-diligence` 🟡 Mock‑data

Dashboard with headline metrics (Total, Completed, In Progress, Reliability), a "New
Request" dialog, and a list of recent requests toggleable between cards and table.

### DD Requests list — `/due-diligence/requests` 🟡 Mock‑data

A dedicated full‑page table of all historical and active requests, with filter/sort.

### DD Request detail — `/due-diligence/requests/:id` 🟡 Mock‑data

Status page with tabs: Overview (timeline, inputs, assessment scores), Result
(summary + detailed metrics), Q&A (community discussion), and Activity. Supports
**Re‑run** (creates a new request) and **Delete**; the Q&A is interactive (upvote,
follow, answer).

### Snapshot Report — `/snapshot/:id` and `/due-diligence/snapshot/:id` 🟡 Mock‑data

A formal, investor‑grade report: overall star rating, a Due‑Diligence Scorecard
(Company, Compliance, Fraud, Financial, …), executive summary, investment highlights,
and a final recommendation. It pulls from the DD store for user‑created requests or
from `businesses.json`, and includes a fully fleshed‑out hard‑coded example for
"Unlock Services Limited". Print/share buttons are mocked; a "Deep Dive" is a locked
premium feature.

---

## 8. Syndication

A directory and detail experience for investment syndicates and themed bundles. All
data comes from curated JSON (`syndicates.json`, `syndicateBundles.json`); filtering,
sorting, and "join" state work in the browser.

### Syndication directory — `/syndication` 🟡 Mock‑data

Searchable directory with "All Syndicates" and "Bundles" tabs, extensive filters
(sector, stage, eligibility, minimum cheque, closing window) and sorting (confidence,
closing date), with debounced real‑time search.

### Syndicate Bundles — `/syndication/bundles` 🟡 Mock‑data

A grid of themed bundles (e.g. "SaaS Powerhouses", "Green Energy") with aggregate
stats (average confidence, minimum investment). Clicking a bundle opens a detailed
breakdown modal.

### Syndicate Detail — `/syndication/:id` 🟡 Mock‑data

Deep dive into one syndicate: target raise and % committed, investment thesis, fee
structure, market benchmarks, community confidence signals, and an activity timeline.
**Join Syndicate** saves state to `localStorage`; there's also an AI‑assistant preview.

---

## 9. Businesses

A directory of companies to research and engage with. Data comes from
`businesses.json`; "likes"/"favorites" and community interactions persist in
`localStorage`.

### Businesses directory — `/businesses` 🟡 Mock‑data

Browseable company directory with a "Spotlight" section, a filter sidebar (sector,
size, tax relief), search, and card/table views. Users can like/favourite companies
and sort by "Most Discussed" or "Peer Interest".

### Business Profile — `/business/:id` 🟡 Mock‑data

A company profile: key facts (age, employees, revenue), a snapshot summary with star
ratings across DD categories, and a community Q&A panel. Links out to the full
Snapshot Report and a locked premium "Deep Dive". The community Q&A is interactive.

---

## 10. News

### News (Enhanced) — `/news` 🟢 / 🟡

**Plain English.** A sophisticated, AI‑curated news experience in a 3‑column layout:
filters and preferences on the left, the curated feed in the centre, and a "WhatsApp
Intelligence" mobile simulator plus AI assistant on the right.

**Key features.** Real‑time, preference‑driven filtering of the feed; a preferences
panel that re‑prunes the feed locally; an interactive mobile frame simulating WhatsApp
alerts; and a genuine **`/api/chat`** integration for the news assistant.

**Status.** The chat assistant is functional; the article feed is curated mock data
(`newsItems.json`) with real filtering/relevance logic. (A simpler legacy `News.tsx`
also exists but is superseded by this page.)

---

## 11. Demo & presentation suite

These screens exist to support guided sales/demo sessions. Most are
presentation‑only.

- **Advice Gap — `/advice-gap` 🔵** A narrative page making the case for the product
  ("Valuation Chaos", "Time Deficit", "Portfolio Drift"), with CTAs into onboarding.
- **Demo agenda — `/demo` 🔵** A "session ready" agenda that frames the demo as
  Problem → Walkthrough → Next Steps, with navigation cards into each stage. (A related
  `/demo/agenda` and `DemoAgenda` page serve the same purpose.)
- **Demo Simulation — `/demo-simulation` 🟡** A live‑demo wizard where the presenter
  inputs stock/bond/property values (or loads demo data) and sees a Recharts
  allocation pie update; configuration persists to `localStorage` and feeds predefined
  stress scenarios.
- **Splash — `/splash` 🔵** A glossy brand intro (glassmorphism orbs, animated logo,
  simulated initialisation bar, mouse‑responsive background).
- **Ending splash — `/ending` 🔵** A post‑demo "thank you" screen with contact details
  and a closing CTA.

---

## 12. Legacy onboarding (superseded)

These older flows still exist but have been replaced by Onboarding v2 (see the
companion manual). Treat them as read‑only legacy:

- **`/investor-onboarding`** (`InvestorOnboarding.tsx`) — the original onboarding
  walkthrough.
- **`/investor-preferences`** and **`/investor-preferences-v2`** — legacy preference
  collection; their logic now lives in Onboarding v2 and Account Settings.

---

## 13. Miscellaneous pages

- **About — `About.tsx` ⚪** Template/placeholder marketing content. The file exists
  but is **not** imported or routed in `App.tsx`, so it isn't reachable in the app.
- **Docs — `Docs.tsx` ⚪** Placeholder technical docs/getting‑started content. Also
  **not** imported or routed — present as a file only.
- **Components — `Components.tsx` ⚪** A developer/design reference page, not imported
  or routed and not part of the user journey.
- **not‑found — `*` 🟢** The standard 404 fallback for unmatched routes.

---

## 14. Assets & data model

**Plain English.** The Asset Register page above runs on demo data, but the app *does*
have a real database for assets — it's used by **Account Settings** and **Profile**,
where what you add genuinely persists. This section summarises how assets are modelled
(Drizzle ORM tables in `shared/schema.ts`), grouped into three families: investment
holdings, property, and alternatives. All money fields are GBP numerics.

### Investment holdings

- **`portfolio_accounts`** — a brokerage/cash/private account. Key fields: `userId`,
  `provider` (e.g. Moneyhub / Plaid / Manual), `accountType` (brokerage/cash/private),
  `currency` (default GBP), `currentBalanceGbp`, `cashBalanceGbp`.
- **`portfolio_holdings`** — an individual position within an account. Key fields:
  `userId`, `accountId`, `assetType` (equity/fund/crypto/private/other), `symbol`,
  `name`, `quantity`, `costBasisGbp`, `currentPriceGbp`, `currentValueGbp`,
  `estimated_fx`.

### Property

A property is modelled across six linked tables so the same asset can carry ownership,
debt, valuations, tenancies, and cashflows:

- **`properties`** — the building: `uprn`, `addressLine1`, `postcode`, `propertyType`
  (residential/BTL/commercial/industrial/land/mixed), `epcRating` (A–G).
- **`property_ownerships`** — who owns it and how: `ownershipType` (direct/SPV),
  `sharePct`, `acquisitionPriceGbp`, `isPrimaryResidence`.
- **`property_loans`** — mortgages/debt: `lenderName`, `currentBalanceGbp`,
  `interestRatePct`, `rateType` (fixed/tracker/variable), `fixEndDate`,
  `paymentAmountGbp`.
- **`property_valuations`** — point‑in‑time values: `valueGbp`, `valuationDate`,
  `method` (purchase/avm/ai_valuation/…), `source` (Zoopla/UK_HPI/…), `confidence`
  (0–1), plus `valuationRangeMinGbp` / `valuationRangeMaxGbp`, `hpiBaseValueGbp`, and
  `comparableAvgValueGbp` (these feed the Property Valuation tool).
- **`property_leases`** — tenancies: `tenantLabel`, `rentGbp`, `rentFrequency`
  (monthly/quarterly/annual), `status` (active/void).
- **`property_cashflows`** — income/expense ledger: `flowDate`, `kind`
  (rent/mortgage/maintenance/…), `amountGbp`.

### Alternatives

- **`alternative_investments`** — illiquid/specialist assets. Key fields:
  `investmentType` (private_equity/venture_capital/collectibles/…), `name`,
  `investmentAmountGbp`, `currentValueGbp`; **risk/return** — `riskRating`
  (low→very_high), `targetReturnPct`, `actualReturnPct`; **tax wrappers** —
  `taxWrapperEligible` (bool), `taxWrapperType` (EIS/SEIS/VCT/none); **liquidity** —
  `liquidityPeriod` (immediate→illiquid), `maturityDateUk`.

### Insert schemas & types

Every table has a matching `insert…Schema` (a `drizzle-zod` insert schema that omits
auto‑generated fields such as `id` and timestamps) and exported select types (e.g.
`PortfolioHolding`, `Property`, `PropertyValuation`, `AlternativeInvestment`). These are
the shapes the Account Settings forms validate against before saving.

### Asset Register page vs. persisted records

It's worth being explicit: the **Asset Register page** (`/asset-register`) is a demo
prototype on hard‑coded data and does **not** read or write these tables. The records
above are created and edited through **Account Settings** (and shown in **Profile**),
which call `/api/investors`, `/api/properties`, and `/api/alternatives`. So "add an
asset that actually saves" happens in Account Settings, not the Asset Register page.

---

## 15. Backend, data & infrastructure notes

**Plain English.** Some features are backed by real services and a database; many run
on curated JSON or browser storage. This section summarises where the "real"
backend exists.

- **Database (PostgreSQL via Drizzle ORM).** Real persistence for investor profiles,
  portfolio holdings, properties, and alternative investments (used by Account
  Settings and Profile). Also holds the property‑valuation datasets: `uk_hpi`,
  `property_price_data`, and a ~2.7m‑row `postcode_lad_mapping` table.
- **Live/AI endpoints (Express, `server/routes.ts`).** Market quotes
  (`/api/market-data/quotes`, `/api/market-data/quote/:symbol`), portfolio AI analysis
  (`/api/portfolio/analyze`), pitch‑deck analysis
  (`/api/analyse-pitch-deck`), property valuation (`/api/property-valuation`), website
  fact‑checking (`/api/fact-check`), the news assistant (`/api/chat`), and the
  art/whisky valuation config endpoints. Several AI features use the configured
  OpenAI integration.
- **Client‑side compute.** The EIS/SEIS Allowance Calculator runs entirely in the
  browser.
- **Browser `localStorage`.** Used as the "store" for Due Diligence requests,
  Syndication joins, Business likes/favourites, uploaded portfolio CSVs, and demo
  configuration.
- **Curated mock JSON.** `businesses.json`, `syndicates.json`,
  `syndicateBundles.json`, `newsItems.json`, and similar files seed the directories and
  feeds.

---

## 16. Source references

**Pages** — `client/src/pages/`: `Home.tsx`, `AssetRegister.tsx`,
`TargetsAndBands.tsx`, `PortfolioAnalysis.tsx`, `DemoPortfolioAnalysis.tsx`,
`Profile.tsx`, `ProfilePortfolio.tsx`, `AccountSettings.tsx`, `Toolkit.tsx`,
`PitchDeckAnalyser.tsx`, `DueDiligenceHub.tsx`, `DueDiligenceRequests.tsx`,
`DueDiligenceRequestDetail.tsx`, `SnapshotReport.tsx`, `Syndication.tsx`,
`SyndicationBundles.tsx`, `SyndicateDetail.tsx`, `Businesses.tsx`,
`BusinessProfile.tsx`, `NewsEnhanced.tsx`, `News.tsx`, `AdviceGap.tsx`, `Demo.tsx`,
`DemoAgenda.tsx`, `DemoSimulation.tsx`, `SplashScreen.tsx`, `EndingSplashScreen.tsx`,
`About.tsx`, `Docs.tsx`, `Components.tsx`, and the legacy `InvestorOnboarding.tsx` /
`InvestorPreferences.tsx` / `InvestorPreferencesWizard.tsx`.

**Routing** — `client/src/App.tsx`.

**Key logic** — `client/src/components/SEISEISCalculation.ts` (tax calc),
`server/routes.ts` (API endpoints), `server/valuation_config.ts` (pitch‑deck
valuation config), and the Drizzle schema in `shared/schema.ts`.

**Companion** — [`docs/onboarding-v2-manual.md`](./onboarding-v2-manual.md) for the
investor onboarding journey.
