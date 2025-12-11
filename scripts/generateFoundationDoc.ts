import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } from 'docx';
import * as fs from 'fs';

const createDocument = () => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            children: [
              new TextRun({
                text: "UNLOCK",
                bold: true,
                size: 56,
                color: "5193B3",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Foundational Product Information",
                bold: true,
                size: 36,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Comprehensive Investment Intelligence Platform",
                italics: true,
                size: 24,
                color: "666666",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
          }),

          // Section 1: The Problem Statement
          new Paragraph({
            text: "1. THE PROBLEM STATEMENT",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),

          new Paragraph({
            text: "What specific, painful problem does this solve?",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "UK investors with portfolios above £250,000 face a fragmented, overwhelming investment landscape. They struggle with:",
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "• ", bold: true }), new TextRun("Fragmented Portfolio Visibility: Assets scattered across multiple platforms (ISAs, SIPPs, GIAs, property, crypto, private equity) with no unified view of total wealth")],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "• ", bold: true }), new TextRun("Due Diligence Paralysis: Unable to properly evaluate investment opportunities, especially in alternative assets and EIS/SEIS schemes, leading to either missed opportunities or poor decisions")],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "• ", bold: true }), new TextRun("Tax Inefficiency: Missing £5,000-£15,000 annually through suboptimal wrapper usage, unclaimed reliefs, and poor allowance management across household members")],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "• ", bold: true }), new TextRun("Syndicate Access Barriers: Excluded from group investment opportunities due to lack of deal flow, trust signals, and co-investment infrastructure")],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "• ", bold: true }), new TextRun("Knowledge Gaps: No personalized guidance that matches their specific investor persona, risk profile, and economic beliefs")],
            indent: { left: 360 },
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: "Who experiences this problem most acutely?",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Self-directed UK investors in the 'mass affluent' to 'high net worth' segment (£250k-£5M portfolios) who:",
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [new TextRun("• Have outgrown simple apps like Freetrade or Nutmeg but cannot justify £20k+ annual wealth manager fees")],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [new TextRun("• Own multiple asset types (listed securities, property, alternatives, private equity)")],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [new TextRun("• Manage wealth across a household (spouse, children's JISAs, family companies, trusts)")],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [new TextRun("• Are interested in tax-advantaged investments (EIS, SEIS, VCT) but lack due diligence capability")],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [new TextRun("• Want to participate in syndicated deals but lack access and trust infrastructure")],
            indent: { left: 360 },
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: "What does the problem cost them?",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Money: ", bold: true }), new TextRun("£5,000-£15,000+ annually in missed tax reliefs, suboptimal wrapper usage, and poor investment decisions due to inadequate due diligence. Lost opportunity cost from passing on good deals or investing in poor ones.")],
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Time: ", bold: true }), new TextRun("40-80 hours annually on manual portfolio tracking, statement reconciliation, tax return preparation, and amateur due diligence research.")],
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Stress: ", bold: true }), new TextRun("Constant anxiety about 'am I doing this right?', fear of HMRC compliance issues, uncertainty about retirement readiness, and FOMO on investment opportunities.")],
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Opportunity: ", bold: true }), new TextRun("Exclusion from institutional-quality deal flow, inability to co-invest with experienced angels, and missed access to professional-grade analysis tools.")],
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: "Why hasn't it been solved before?",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [new TextRun("• Traditional wealth managers target UHNW (£5M+) due to high service delivery costs")],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [new TextRun("• Robo-advisors focus on simple, discretionary portfolios—not complex existing holdings")],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [new TextRun("• Portfolio trackers (Moneyhub, Emma) aggregate but don't provide actionable intelligence")],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [new TextRun("• Due diligence platforms serve institutional investors, not retail angels")],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [new TextRun("• Syndicate platforms lack the trust infrastructure and due diligence integration")],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [new TextRun("• No platform has combined whole-of-wealth visibility with UK-specific tax intelligence, AI-powered due diligence, and syndicated investment access in one integrated experience")],
            indent: { left: 360 },
            spacing: { after: 400 },
          }),

          // Section 2: The Solution
          new Paragraph({
            text: "2. THE SOLUTION",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),

          new Paragraph({
            text: "What does the product actually do?",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Unlock is an integrated investment intelligence platform that combines personalized investor profiling, AI-powered due diligence, syndicated deal access, comprehensive portfolio management, and professional-grade tools—all designed specifically for UK self-directed investors.",
              }),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: "How does it work (in plain English)?",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Step 1 - Know Yourself: ", bold: true }), new TextRun("Complete our intelligent onboarding that identifies your investor persona from 19 archetypes, assesses your economic beliefs, and understands your investment interests across 36 categories.")],
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Step 2 - Connect Your Wealth: ", bold: true }), new TextRun("Import your existing portfolio via live API connections, CSV uploads, or AI-powered document extraction. See everything in one place—stocks, bonds, property, crypto, private equity.")],
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Step 3 - Discover Opportunities: ", bold: true }), new TextRun("Browse vetted investment opportunities, request AI-powered due diligence snapshots, and explore syndicated deals matched to your profile.")],
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Step 4 - Analyze & Optimize: ", bold: true }), new TextRun("Use professional-grade tools (tax calculators, pitch deck analyzer, valuation tools) and get AI-driven portfolio recommendations.")],
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Step 5 - Invest with Confidence: ", bold: true }), new TextRun("Join syndicates, track your investments, reconcile against statements, and manage your household's tax allowances in real-time.")],
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: "What's the 'before and after' transformation?",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "BEFORE", bold: true })] })],
                    shading: { fill: "E8E8E8" },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "AFTER", bold: true })] })],
                    shading: { fill: "D4EDDA" },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Spreadsheets and paper statements")] }),
                  new TableCell({ children: [new Paragraph("Single source of truth with live data")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Guessing at investment quality")] }),
                  new TableCell({ children: [new Paragraph("AI-powered due diligence reports")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Excluded from deal flow")] }),
                  new TableCell({ children: [new Paragraph("Access to vetted syndicates with trust signals")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Individual account view")] }),
                  new TableCell({ children: [new Paragraph("Household-level wealth optimization")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Manual tax calculations")] }),
                  new TableCell({ children: [new Paragraph("Real-time allowance tracking with carry-back optimization")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Generic investment advice")] }),
                  new TableCell({ children: [new Paragraph("Persona-matched, belief-aligned recommendations")] }),
                ],
              }),
            ],
          }),

          new Paragraph({
            text: "What makes it different from existing alternatives?",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 100 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "1. Investor-First Intelligence: ", bold: true }), new TextRun("19 distinct investor personas with personalized experiences, not one-size-fits-all")],
            spacing: { after: 60 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "2. Integrated Due Diligence: ", bold: true }), new TextRun("AI-powered business analysis with Companies House integration, fraud risk scoring, and compliance checks")],
            spacing: { after: 60 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "3. Syndicate Infrastructure: ", bold: true }), new TextRun("Trust signals, fee transparency, confidence scoring, and 'investors like you' metrics")],
            spacing: { after: 60 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "4. Whole-of-Wealth: ", bold: true }), new TextRun("True multi-asset coverage including property, crypto, private equity—not just listed securities")],
            spacing: { after: 60 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "5. UK Tax-Native: ", bold: true }), new TextRun("Built around ISA, SIPP, EIS, SEIS, VCT, CGT—not a US product adapted for UK")],
            spacing: { after: 60 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "6. Household-Centric: ", bold: true }), new TextRun("Optimize across spouse, children's JISAs, family companies—not just individual accounts")],
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: "What are the key features of the product?",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),

          new Paragraph({
            children: [new TextRun({ text: "MODULE 1: Investor Onboarding & Profile Discovery", bold: true, color: "5193B3" })],
            spacing: { before: 150, after: 80 },
          }),
          new Paragraph({ children: [new TextRun("• 6-step intelligent wizard capturing investment interests (36 categories), learning areas (26 topics), geographic preferences (18 regions)")], indent: { left: 360 } }),
          new Paragraph({ children: [new TextRun("• Persona identification from 19 archetypes (Retirement Planner, Property Lover, Crypto Enthusiast, Legacy Builder, Tech Worker, etc.)")], indent: { left: 360 } }),
          new Paragraph({ children: [new TextRun("• Economic beliefs questionnaire for personalized strategy alignment")], indent: { left: 360 } }),
          new Paragraph({ children: [new TextRun("• AI-generated portfolio analysis with gap identification")], indent: { left: 360 } }),
          new Paragraph({ children: [new TextRun("• Personalized action plan with prioritized next steps")], indent: { left: 360 } }),

          new Paragraph({
            children: [new TextRun({ text: "MODULE 2: Due Diligence Hub", bold: true, color: "5193B3" })],
            spacing: { before: 150, after: 80 },
          }),
          new Paragraph({ children: [new TextRun("• AI-powered Snapshot reports (quick DD) and Deep Dive analysis (comprehensive)")], indent: { left: 360 } }),
          new Paragraph({ children: [new TextRun("• Companies House integration for verified company lookup")], indent: { left: 360 } }),
          new Paragraph({ children: [new TextRun("• 8-section analysis: Company Profile, Compliance Check, Fraud Risk, Financial Health, Management, Marketing, Claims Management, Investor Validation")], indent: { left: 360 } }),
          new Paragraph({ children: [new TextRun("• Status tracking with turnaround metrics")], indent: { left: 360 } }),
          new Paragraph({ children: [new TextRun("• Q&A capability for each report")], indent: { left: 360 } }),

          new Paragraph({
            children: [new TextRun({ text: "MODULE 3: Syndication Platform", bold: true, color: "5193B3" })],
            spacing: { before: 150, after: 80 },
          }),
          new Paragraph({ children: [new TextRun("• Browse individual syndicates and themed bundles")], indent: { left: 360 } }),
          new Paragraph({ children: [new TextRun("• Advanced filtering: sector, stage (Pre-Seed to Series B), EIS/SEIS eligibility, minimum cheque, closing window")], indent: { left: 360 } }),
          new Paragraph({ children: [new TextRun("• Trust signals: data sources verified, investor history, deal legitimacy scoring")], indent: { left: 360 } }),
          new Paragraph({ children: [new TextRun("• Fee transparency: carry %, admin annual %, total cost breakdown")], indent: { left: 360 } }),
          new Paragraph({ children: [new TextRun("• Confidence scores and 'investors like you' community metrics")], indent: { left: 360 } }),
          new Paragraph({ children: [new TextRun("• AI assistant preview for each syndicate")], indent: { left: 360 } }),

          new Paragraph({
            children: [new TextRun({ text: "MODULE 4: Investor Toolkit (12+ Tools)", bold: true, color: "5193B3" })],
            spacing: { before: 150, after: 80 },
          }),
          new Paragraph({ children: [new TextRun("• Tax Relief: EIS/SEIS Allowance Calculator with carry-back optimization, Loss Relief Calculator, CGT Deferral Calculator")], indent: { left: 360 } }),
          new Paragraph({ children: [new TextRun("• Analysis: Pitch Deck Analyser (AI-powered), Business Snapshot Request, Risk/Return Profiler")], indent: { left: 360 } }),
          new Paragraph({ children: [new TextRun("• Valuation: Property Valuation (UK HPI integration), Art Valuation, Whisky & Cask Valuation")], indent: { left: 360 } }),
          new Paragraph({ children: [new TextRun("• Utilities: Document Checklist, EIS/SEIS Glossary, Website Fact Checker")], indent: { left: 360 } }),

          new Paragraph({
            children: [new TextRun({ text: "MODULE 5: Asset Register (Comprehensive Portfolio Management)", bold: true, color: "5193B3" })],
            spacing: { before: 150, after: 80 },
          }),
          new Paragraph({ children: [new TextRun("• Holdings Register: All assets/liabilities with live prices, cost basis, tax treatment, evidence chain, completeness scores")], indent: { left: 360 } }),
          new Paragraph({ children: [new TextRun("• Targets & Bands: Strategic allocation targets with tolerance bands and rebalancing suggestions")], indent: { left: 360 } }),
          new Paragraph({ children: [new TextRun("• Transactions: Complete audit trail for tax reporting (buys, sells, dividends, corporate actions)")], indent: { left: 360 } }),
          new Paragraph({ children: [new TextRun("• Documents: Statement storage with AI-powered OCR extraction")], indent: { left: 360 } }),
          new Paragraph({ children: [new TextRun("• Reconciliation: Compare records against broker statements to catch discrepancies")], indent: { left: 360 } }),
          new Paragraph({ children: [new TextRun("• Household: Multi-entity management (spouse, children, companies) with allowance optimization")], indent: { left: 360 } }),
          new Paragraph({ children: [new TextRun("• Data Sources: Live API feeds, CSV import, document OCR, manual entry")], indent: { left: 360 } }),

          new Paragraph({
            children: [new TextRun({ text: "MODULE 6: Business Discovery", bold: true, color: "5193B3" })],
            spacing: { before: 150, after: 80 },
          }),
          new Paragraph({ children: [new TextRun("• Searchable database of EIS/SEIS qualifying businesses")], indent: { left: 360 } }),
          new Paragraph({ children: [new TextRun("• Filter by sector, size, eligibility status")], indent: { left: 360 } }),
          new Paragraph({ children: [new TextRun("• Like/favorite tracking with personalized watchlists")], indent: { left: 360 } }),
          new Paragraph({ children: [new TextRun("• One-click snapshot request integration")], indent: { left: 360 } }),

          new Paragraph({
            children: [new TextRun({ text: "MODULE 7: News & Intelligence Dashboard", bold: true, color: "5193B3" })],
            spacing: { before: 150, after: 80 },
          }),
          new Paragraph({ children: [new TextRun("• Personalized news feed based on investor preferences")], indent: { left: 360 } }),
          new Paragraph({ children: [new TextRun("• Company watchlist with alert configuration")], indent: { left: 360 } }),
          new Paragraph({ children: [new TextRun("• Quick tools dock for rapid access")], indent: { left: 360 } }),
          new Paragraph({ children: [new TextRun("• Newsletter frequency controls and WhatsApp integration")], indent: { left: 360 } }),
          new Paragraph({ children: [new TextRun("• Due diligence requests mini-panel")], indent: { left: 360 }, spacing: { after: 400 } }),

          // Section 3: Target Customer Profiles
          new Paragraph({
            text: "3. TARGET CUSTOMER PROFILES",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),

          new Paragraph({
            children: [new TextRun({ text: "Persona 1: The Retirement Planner", bold: true, size: 26 })],
            spacing: { before: 150, after: 80 },
          }),
          new Paragraph({ children: [new TextRun({ text: "Demographics: ", bold: true }), new TextRun("Age 55-70, £1.25M portfolio, Upper Mass-Affluent")] }),
          new Paragraph({ children: [new TextRun({ text: "Pain Points: ", bold: true }), new TextRun("Sequence of returns risk, tax-efficient drawdown planning, pension vs ISA decisions, longevity risk management")] }),
          new Paragraph({ children: [new TextRun({ text: "Belief Shift Required: ", bold: true }), new TextRun("'I need an expensive advisor' → 'I can manage this with the right tools and intelligence'")] }),
          new Paragraph({ children: [new TextRun({ text: "Common Objection: ", bold: true }), new TextRun("'This seems too complicated for me'")] }),
          new Paragraph({ children: [new TextRun({ text: "Response: ", bold: true }), new TextRun("Guided onboarding with persona-specific setup; retirement-focused dashboards; drawdown calculators")], spacing: { after: 150 } }),

          new Paragraph({
            children: [new TextRun({ text: "Persona 2: The EIS/SEIS Angel", bold: true, size: 26 })],
            spacing: { before: 150, after: 80 },
          }),
          new Paragraph({ children: [new TextRun({ text: "Demographics: ", bold: true }), new TextRun("Age 35-55, £500k-£2M portfolio, Growth-focused")] }),
          new Paragraph({ children: [new TextRun({ text: "Pain Points: ", bold: true }), new TextRun("Finding quality deal flow, conducting proper due diligence, tracking tax reliefs across multiple investments, co-investment access")] }),
          new Paragraph({ children: [new TextRun({ text: "Belief Shift Required: ", bold: true }), new TextRun("'I can spot good deals myself' → 'AI-powered DD catches things I'd miss'")] }),
          new Paragraph({ children: [new TextRun({ text: "Common Objection: ", bold: true }), new TextRun("'I have my own network for deals'")] }),
          new Paragraph({ children: [new TextRun({ text: "Response: ", bold: true }), new TextRun("Syndicate access expands your deal flow; DD tools enhance (not replace) your judgment; allowance calculator maximizes your tax relief")], spacing: { after: 150 } }),

          new Paragraph({
            children: [new TextRun({ text: "Persona 3: The Property-Heavy Investor", bold: true, size: 26 })],
            spacing: { before: 150, after: 80 },
          }),
          new Paragraph({ children: [new TextRun({ text: "Demographics: ", bold: true }), new TextRun("Age 35-60, £1.2M portfolio (78% property), BTL focus")] }),
          new Paragraph({ children: [new TextRun({ text: "Pain Points: ", bold: true }), new TextRun("Concentration risk in illiquid assets, leverage management, diversification beyond property, income vs capital growth balance")] }),
          new Paragraph({ children: [new TextRun({ text: "Belief Shift Required: ", bold: true }), new TextRun("'Property is the only safe investment' → 'I need liquid assets for resilience'")] }),
          new Paragraph({ children: [new TextRun({ text: "Common Objection: ", bold: true }), new TextRun("'My properties aren't tracked in apps'")] }),
          new Paragraph({ children: [new TextRun({ text: "Response: ", bold: true }), new TextRun("Full property portfolio module with rental yields, mortgages, valuations (UK HPI integration), and concentration analysis")], spacing: { after: 150 } }),

          new Paragraph({
            children: [new TextRun({ text: "Persona 4: The Tech Worker / RSU Holder", bold: true, size: 26 })],
            spacing: { before: 150, after: 80 },
          }),
          new Paragraph({ children: [new TextRun({ text: "Demographics: ", bold: true }), new TextRun("Age 25-45, £840k portfolio, Heavy employer stock concentration")] }),
          new Paragraph({ children: [new TextRun({ text: "Pain Points: ", bold: true }), new TextRun("RSU/options vesting tax events, concentrated single-stock risk, employer-correlated career and wealth risk")] }),
          new Paragraph({ children: [new TextRun({ text: "Belief Shift Required: ", bold: true }), new TextRun("'I'll diversify when the time is right' → 'I need a systematic plan now'")] }),
          new Paragraph({ children: [new TextRun({ text: "Common Objection: ", bold: true }), new TextRun("'I can track this in a spreadsheet'")] }),
          new Paragraph({ children: [new TextRun({ text: "Response: ", bold: true }), new TextRun("We catch RSU vesting tax events you'd miss; concentration risk alerts; systematic diversification planning")], spacing: { after: 400 } }),

          // Section 4: Business Model
          new Paragraph({
            text: "4. BUSINESS MODEL",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),

          new Paragraph({
            text: "How do you make money?",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [new TextRun("B2C subscription model with tiered pricing based on portfolio complexity and feature access, plus transaction fees on syndicate participation.")],
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: "Pricing Structure (Projected)",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Tier", bold: true })] })], shading: { fill: "E8E8E8" } }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Monthly", bold: true })] })], shading: { fill: "E8E8E8" } }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Annual", bold: true })] })], shading: { fill: "E8E8E8" } }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Target Segment", bold: true })] })], shading: { fill: "E8E8E8" } }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Free")] }),
                  new TableCell({ children: [new Paragraph("£0")] }),
                  new TableCell({ children: [new Paragraph("£0")] }),
                  new TableCell({ children: [new Paragraph("Portfolio tracking, limited DD snapshots, basic tools")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Essential")] }),
                  new TableCell({ children: [new Paragraph("£19")] }),
                  new TableCell({ children: [new Paragraph("£190")] }),
                  new TableCell({ children: [new Paragraph("<£500k, single entity, 5 DD snapshots/month")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Professional")] }),
                  new TableCell({ children: [new Paragraph("£49")] }),
                  new TableCell({ children: [new Paragraph("£490")] }),
                  new TableCell({ children: [new Paragraph("£500k-£2M, household features, unlimited DD, syndicate access")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Premium")] }),
                  new TableCell({ children: [new Paragraph("£99")] }),
                  new TableCell({ children: [new Paragraph("£990")] }),
                  new TableCell({ children: [new Paragraph("£2M+, priority support, API access, white-glove onboarding")] }),
                ],
              }),
            ],
          }),

          new Paragraph({
            text: "Unit Economics (Target)",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({ children: [new TextRun({ text: "CAC: ", bold: true }), new TextRun("£150 (content marketing, referrals, IFA partnerships)")] }),
          new Paragraph({ children: [new TextRun({ text: "LTV: ", bold: true }), new TextRun("£2,400 (4-year average retention at blended £50/month)")] }),
          new Paragraph({ children: [new TextRun({ text: "LTV:CAC Ratio: ", bold: true }), new TextRun("16:1")] }),
          new Paragraph({ children: [new TextRun({ text: "Gross Margin: ", bold: true }), new TextRun("85% (SaaS delivery, AI costs managed)")] }),
          new Paragraph({ children: [new TextRun({ text: "Payback Period: ", bold: true }), new TextRun("3 months")] }),

          new Paragraph({
            text: "Revenue Trajectory",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Year", bold: true })] })], shading: { fill: "E8E8E8" } }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Subscribers", bold: true })] })], shading: { fill: "E8E8E8" } }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "ARR", bold: true })] })], shading: { fill: "E8E8E8" } }),
                ],
              }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph("Y1")] }), new TableCell({ children: [new Paragraph("500")] }), new TableCell({ children: [new Paragraph("£300k")] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph("Y2")] }), new TableCell({ children: [new Paragraph("2,500")] }), new TableCell({ children: [new Paragraph("£1.5M")] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph("Y3")] }), new TableCell({ children: [new Paragraph("8,000")] }), new TableCell({ children: [new Paragraph("£4.8M")] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph("Y4")] }), new TableCell({ children: [new Paragraph("20,000")] }), new TableCell({ children: [new Paragraph("£12M")] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph("Y5")] }), new TableCell({ children: [new Paragraph("45,000")] }), new TableCell({ children: [new Paragraph("£27M")] })] }),
            ],
          }),

          // Section 5: Competitive Landscape
          new Paragraph({
            text: "5. COMPETITIVE LANDSCAPE",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),

          new Paragraph({
            text: "Direct Competitors",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Competitor", bold: true })] })], shading: { fill: "E8E8E8" } }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Weakness", bold: true })] })], shading: { fill: "E8E8E8" } }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Why We Win", bold: true })] })], shading: { fill: "E8E8E8" } }),
                ],
              }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph("Moneyhub / Emma")] }), new TableCell({ children: [new Paragraph("Aggregation only, no intelligence")] }), new TableCell({ children: [new Paragraph("AI-powered DD, actionable recommendations")] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph("Wealthify / Nutmeg")] }), new TableCell({ children: [new Paragraph("Discretionary only, their portfolios")] }), new TableCell({ children: [new Paragraph("Works with YOUR existing holdings")] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph("SyndicateRoom / Seedrs")] }), new TableCell({ children: [new Paragraph("Deal flow only, no portfolio mgmt")] }), new TableCell({ children: [new Paragraph("Integrated discovery + management")] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph("Wealth managers")] }), new TableCell({ children: [new Paragraph("£250k minimums, 1%+ fees")] }), new TableCell({ children: [new Paragraph("90% cost savings, DIY with AI support")] })] }),
            ],
          }),

          new Paragraph({
            text: "Unfair Advantage / Moat",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({ children: [new TextRun({ text: "1. UK Tax Intelligence: ", bold: true }), new TextRun("Deep integration with UK-specific wrappers, allowances, and reliefs—not a US product adapted")] }),
          new Paragraph({ children: [new TextRun({ text: "2. 19 Persona Architecture: ", bold: true }), new TextRun("Personalized experiences based on validated investor archetypes, not generic journeys")] }),
          new Paragraph({ children: [new TextRun({ text: "3. Integrated DD Engine: ", bold: true }), new TextRun("AI-powered due diligence built-in, not a separate product")] }),
          new Paragraph({ children: [new TextRun({ text: "4. Trust Infrastructure: ", bold: true }), new TextRun("Confidence scores, community metrics, and transparency that syndicate platforms lack")] }),
          new Paragraph({ children: [new TextRun({ text: "5. Evidence Chain: ", bold: true }), new TextRun("Every data point linked to source documents—unique in consumer fintech")] }),

          // Section 6: Traction & Validation
          new Paragraph({
            text: "6. TRACTION & VALIDATION",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),

          new Paragraph({
            text: "Current Stage: Functional Prototype",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [new TextRun("Comprehensive working prototype with all major modules operational:")],
            spacing: { after: 100 },
          }),
          new Paragraph({ children: [new TextRun("• 7,286-line Investor Onboarding Wizard with 19 personas, belief questionnaire, and AI analysis")] }),
          new Paragraph({ children: [new TextRun("• Complete Due Diligence Hub with 8-section AI-powered reports")] }),
          new Paragraph({ children: [new TextRun("• Full Syndication Platform with trust signals, fee transparency, and filtering")] }),
          new Paragraph({ children: [new TextRun("• 12+ Toolkit calculators and analysis tools")] }),
          new Paragraph({ children: [new TextRun("• 4,800+ line Asset Register with 6 integrated tabs")] }),
          new Paragraph({ children: [new TextRun("• Live API integrations, CSV import, and AI document extraction")] }),
          new Paragraph({ children: [new TextRun("• Complete UK postcode database (2.7M records) for property valuations")] }),
          new Paragraph({ children: [new TextRun("• PostgreSQL database with full CRUD operations")] }),

          new Paragraph({
            text: "Validation Needed (Next Phase)",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({ children: [new TextRun("• Beta user cohort (target: 50 users)")] }),
          new Paragraph({ children: [new TextRun("• 90-day retention metrics (target: 80%)")] }),
          new Paragraph({ children: [new TextRun("• NPS score (target: 50+)")] }),
          new Paragraph({ children: [new TextRun("• Conversion rates from free to paid tiers")] }),
          new Paragraph({ children: [new TextRun("• Real portfolio data quality validation")] }),

          // Section 7: Team & Execution
          new Paragraph({
            text: "7. TEAM & EXECUTION",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),

          new Paragraph({
            text: "Relevant Experience",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({ children: [new TextRun("• Deep UK wealth management domain expertise")] }),
          new Paragraph({ children: [new TextRun("• Full-stack technical capability (React, TypeScript, Node.js, PostgreSQL)")] }),
          new Paragraph({ children: [new TextRun("• AI/ML integration experience (OpenAI, document processing)")] }),
          new Paragraph({ children: [new TextRun("• Understanding of FCA regulatory environment")] }),
          new Paragraph({ children: [new TextRun("• B2C subscription product experience")] }),

          new Paragraph({
            text: "Go-to-Market Plan",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({ children: [new TextRun({ text: "Phase 1 (Months 1-6) - Foundation:", bold: true })] }),
          new Paragraph({ children: [new TextRun("• Content marketing (SEO targeting 'UK tax optimization', 'EIS calculator', 'portfolio tracker')")] }),
          new Paragraph({ children: [new TextRun("• Personal finance community engagement (Reddit, forums, podcasts)")] }),
          new Paragraph({ children: [new TextRun("• IFA referral partnerships (revenue share model)")] }),
          new Paragraph({ children: [new TextRun("• Angel investor network outreach")] }),

          new Paragraph({ children: [new TextRun({ text: "Phase 2 (Months 7-12) - Scale:", bold: true })], spacing: { before: 100 } }),
          new Paragraph({ children: [new TextRun("• Paid acquisition (LinkedIn, Google targeting mass affluent)")] }),
          new Paragraph({ children: [new TextRun("• Integration partnerships (broker platforms, accounting software)")] }),
          new Paragraph({ children: [new TextRun("• PR campaign (financial press, broadsheet money sections)")] }),
          new Paragraph({ children: [new TextRun("• Referral program with free months for referrers")] }),

          new Paragraph({ children: [new TextRun({ text: "Phase 3 (Year 2+) - Expansion:", bold: true })], spacing: { before: 100 } }),
          new Paragraph({ children: [new TextRun("• B2B channel (IFA white-label version)")] }),
          new Paragraph({ children: [new TextRun("• International expansion (Ireland, Australia—similar tax systems)")] }),
          new Paragraph({ children: [new TextRun("• Adjacent products (tax return filing integration, IHT planning module)")] }),
          new Paragraph({ children: [new TextRun("• Syndicate origination (becoming a deal source, not just aggregator)")] }),

          // Footer
          new Paragraph({
            children: [new TextRun({ text: "—", color: "CCCCCC" })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 600, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Document prepared: December 2025",
                italics: true,
                color: "888888",
                size: 20,
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Unlock - Investment Intelligence for the Self-Directed Investor",
                italics: true,
                color: "5193B3",
                size: 20,
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
        ],
      },
    ],
  });

  return doc;
};

async function main() {
  const doc = createDocument();
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync('Unlock_Foundation_Product_Information.docx', buffer);
  console.log('Document created: Unlock_Foundation_Product_Information.docx');
}

main();
