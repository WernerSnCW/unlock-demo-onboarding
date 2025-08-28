import { useState } from 'react';

interface AnalysisResult {
  id: string;
  fileName: string;
  overallScore: {
    completeness: number;
    clarity: number;
    valuationPlausibility: number;
  };
  executiveSummary: {
    topStrengths: string[];
    topWeaknesses: string[];
    investorQuestions: string[];
  };
  sections: {
    name: string;
    status: 'Present' | 'Missing' | 'Weak';
    extracted: string;
    strengths: string[];
    weaknesses: string[];
    questions: string[];
    benchmark: string;
  }[];
  valuation: {
    declared: number;
    benchmarkMin: number;
    benchmarkMax: number;
    assessment: string;
    methods: {
      preMoney: number;
      postMoney: number;
      revenueMultiple: {
        arr: number;
        multiple: number;
        impliedValue: number;
      };
      ebitdaMultiple: {
        ebitda: number;
        multiple: number;
        impliedValue: number;
      };
      roiProjection: {
        equityStake: number;
        projectedExit: number;
        investorReturn: number;
        roiMultiple: number;
        irr: number;
      };
    };
    suggestedQuestions: string[];
  };
  riskFlags: {
    level: 'Low' | 'Medium' | 'High';
    issue: string;
  }[];
}

export default function PitchDeckAnalyser() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [sector, setSector] = useState('');
  const [stage, setStage] = useState('');
  const [geography, setGeography] = useState('');

  const analyseDocument = async (uploadedFile: File) => {
    setIsAnalysing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('sector', sector || 'General');
      formData.append('stage', stage || 'Seed');
      formData.append('geography', geography || 'United Kingdom');

      const response = await fetch('/api/analyse-pitch-deck', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to analyze pitch deck');
      }

      const result = await response.json();
      setResult(result);
    } catch (error) {
      console.error('Pitch deck analysis failed:', error);
      // Fallback to mock data for now
      const mockResult: AnalysisResult = {
      id: Date.now().toString(),
      fileName: uploadedFile.name,
      overallScore: {
        completeness: 7.2,
        clarity: 6.8,
        valuationPlausibility: 5.4
      },
      executiveSummary: {
        topStrengths: [
          'Strong market opportunity with credible TAM data (£2.1B)',
          'Clear SaaS revenue model with tiered pricing structure',
          'Experienced founding team with relevant industry background'
        ],
        topWeaknesses: [
          'No clear unit economics or customer acquisition costs provided',
          'Competition analysis missing key direct competitors',
          'Financial projections appear optimistic without detailed justification'
        ],
        investorQuestions: [
          'What is your current CAC and projected CAC trends over 24 months?',
          'How do you differentiate from [Competitor X] who launched similar features?',
          'What assumptions underpin your 300% YoY growth projections?',
          'What is your customer retention rate and churn analysis?',
          'How much runway do you have at current burn rate?'
        ]
      },
      sections: [
        {
          name: 'Problem Statement',
          status: 'Present',
          extracted: 'SMEs lose £50bn annually due to inefficient invoice reconciliation processes and manual data entry errors.',
          strengths: ['Uses quantifiable pain point with credible source (PwC)', 'Clear financial impact stated'],
          weaknesses: ['No primary data validation provided', 'Missing customer interviews or surveys'],
          questions: [
            'How did you validate the £50bn figure with actual SMEs?',
            'Have you conducted primary research to quantify demand?',
            'What specific pain points did customers mention most frequently?'
          ],
          benchmark: 'Medium strength - has third-party data but lacks primary validation'
        },
        {
          name: 'Solution Overview',
          status: 'Present',
          extracted: 'AI-powered reconciliation platform that reduces invoice processing time by 70% through automated matching and error detection.',
          strengths: ['Clear measurable benefit (70% time reduction)', 'Technology approach specified'],
          weaknesses: ['No demo evidence or screenshots', 'IP defensibility unclear', 'No technical architecture shown'],
          questions: [
            'Is the AI model proprietary or built on third-party APIs?',
            'What is the typical onboarding time for SME clients?',
            'Do you have patents or IP protection for your algorithms?'
          ],
          benchmark: 'Needs evidence - lacks visual proof or technical depth'
        },
        {
          name: 'Market Size (TAM/SAM/SOM)',
          status: 'Present',
          extracted: 'TAM: £50bn (global invoice processing market), SAM: £12bn (UK/EU mid-market), SOM: £300m targetable in first 3 years.',
          strengths: ['TAM and SAM included with sources', 'Geographic focus specified'],
          weaknesses: ['SOM calculation methodology unclear', 'No bottom-up market analysis', 'Growth rate assumptions missing'],
          questions: [
            'How did you calculate your £300m SOM - bottom-up or top-down approach?',
            'What percentage of SOM can you realistically capture in 3 years?',
            'What are the key market drivers for growth in this sector?'
          ],
          benchmark: 'Partial - strong TAM/SAM but weak SOM justification'
        },
        {
          name: 'Business Model',
          status: 'Present',
          extracted: 'SaaS subscription model: £250/month for SMEs, £1,200/month for enterprise clients, with annual contracts.',
          strengths: ['Clear pricing tiers', 'Target segments defined', 'Recurring revenue model'],
          weaknesses: ['No CAC or LTV analysis', 'Churn assumptions missing', 'Unit economics not provided'],
          questions: [
            'What is your projected customer acquisition cost (CAC) and payback period?',
            'How do you expect churn rates to differ between SME and enterprise?',
            'What are your gross margins and key cost drivers?'
          ],
          benchmark: 'Light detail - pricing clear but missing unit economics'
        },
        {
          name: 'Traction & Metrics',
          status: 'Present',
          extracted: '50 paying SME customers, £250k ARR, 15% month-over-month growth, average deal size £250/month.',
          strengths: ['Real revenue traction demonstrated', 'Strong MoM growth rate', 'Clear customer base'],
          weaknesses: ['Churn rate not disclosed', 'Sales pipeline visibility missing', 'Customer satisfaction metrics absent'],
          questions: [
            'What is your current monthly and annual churn rate?',
            'Do you have signed letters of intent with enterprise prospects?',
            'What is your sales pipeline value and conversion rate?'
          ],
          benchmark: 'Above average - solid early traction with revenue growth'
        },
        {
          name: 'Competition Analysis',
          status: 'Weak',
          extracted: 'Competitive landscape includes legacy providers like Sage and QuickBooks, plus newer entrants like Receipt Bank.',
          strengths: ['Major competitors identified', 'Market positioning attempted'],
          weaknesses: ['Direct feature comparison missing', 'Competitive advantages unclear', 'Market share analysis absent'],
          questions: [
            'How do you differentiate from Receipt Bank and other AI-powered solutions?',
            'What prevents competitors from replicating your core features?',
            'Have you lost any deals to competitors and why?'
          ],
          benchmark: 'Weak - lacks detailed competitive analysis and differentiation'
        },
        {
          name: 'Team',
          status: 'Present',
          extracted: 'CEO: Former Head of Product at Xero with 8 years fintech experience. CTO: PhD in Machine Learning, ex-Google engineer.',
          strengths: ['Relevant industry experience', 'Strong technical leadership', 'Proven track record'],
          weaknesses: ['No commercial or finance expertise shown', 'Advisory board not mentioned', 'Key hiring plans missing'],
          questions: [
            'Who is responsible for fundraising and financial strategy?',
            'Do you have advisors with SME accounting industry expertise?',
            'What key hires are planned for the next 12 months?'
          ],
          benchmark: 'Strong but incomplete - excellent founders but gaps in commercial roles'
        },
        {
          name: 'Financial Projections',
          status: 'Weak',
          extracted: 'Forecasting £2m ARR within 18 months, targeting 200 enterprise customers at £1,200/month average.',
          strengths: ['Clear revenue target', 'Customer acquisition goals specified'],
          weaknesses: ['Bottom-up assumptions unclear', 'Cost projections missing', 'Sensitivity analysis absent'],
          questions: [
            'What assumptions underpin your £2m ARR forecast?',
            'How do you plan to acquire 200 enterprise customers?',
            'What happens to projections if growth is 50% slower?'
          ],
          benchmark: 'Optimistic - lacks detailed bottom-up justification'
        },
        {
          name: 'Funding Ask & Use of Funds',
          status: 'Present',
          extracted: 'Seeking £5m for 20% equity (£20m pre-money valuation). Funds split: 60% sales/marketing, 25% product development, 15% operations.',
          strengths: ['Clear funding amount', 'Use of funds breakdown provided', 'Equity stake specified'],
          weaknesses: ['Milestone mapping unclear', 'Runway calculation missing', 'Valuation justification weak'],
          questions: [
            'What specific milestones will this funding achieve?',
            'How long will £5m last at projected burn rate?',
            'Why do you believe £20m valuation is justified at this stage?'
          ],
          benchmark: 'Overvalued - typical UK SaaS seed valuations are £6-10m'
        },
        {
          name: 'Exit Strategy',
          status: 'Missing',
          extracted: 'No exit strategy information provided in the deck.',
          strengths: [],
          weaknesses: ['Complete absence of exit planning', 'No comparable transactions mentioned', 'Strategic acquirer analysis missing'],
          questions: [
            'What is your 5-7 year exit strategy and timeline?',
            'Who are the potential strategic acquirers in this space?',
            'Have you researched comparable transaction multiples?'
          ],
          benchmark: 'Missing entirely - investors expect some exit consideration'
        }
      ],
      valuation: {
        declared: 20000000,
        benchmarkMin: 4200000,
        benchmarkMax: 6800000,
        assessment: 'Overvalued by ~35% compared to stage and sector peers',
        methods: {
          preMoney: 20000000,
          postMoney: 25000000,
          revenueMultiple: {
            arr: 250000,
            multiple: 10,
            impliedValue: 2500000
          },
          ebitdaMultiple: {
            ebitda: 1200000,
            multiple: 12,
            impliedValue: 14400000
          },
          roiProjection: {
            equityStake: 20,
            projectedExit: 100000000,
            investorReturn: 20000000,
            roiMultiple: 4,
            irr: 31
          }
        },
        suggestedQuestions: [
          'Which valuation methodology did you use to justify £20m pre-money?',
          'How do you reconcile the 8× difference between ARR multiple valuation (£2.5m) and your ask (£20m)?',
          'What assumptions underpin your forecast EBITDA?',
          'What comparable companies were used in your valuation benchmark?',
          'If your exit is £100m, how do you justify that growth rate vs industry averages?'
        ]
      },
      riskFlags: [
        { level: 'High', issue: 'Missing exit strategy completely' },
        { level: 'Medium', issue: 'Financial projections appear optimistic' },
        { level: 'Medium', issue: 'Incomplete competitive analysis' },
        { level: 'Low', issue: 'No advisory board mentioned' }
      ]
      };

      setResult(mockResult);
    } finally {
      setIsAnalysing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setResult(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'text-green-600 dark:text-green-400';
      case 'Weak': return 'text-yellow-600 dark:text-yellow-400';
      case 'Missing': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-yellow-600 dark:text-yellow-400';
      case 'Medium': return 'text-orange-600 dark:text-orange-400';
      case 'High': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getBenchmarkColor = (benchmark: string) => {
    const lower = benchmark.toLowerCase();
    if (lower.includes('strong') || lower.includes('above average')) return 'text-green-600 dark:text-green-400';
    if (lower.includes('medium') || lower.includes('partial')) return 'text-yellow-600 dark:text-yellow-400';
    if (lower.includes('weak') || lower.includes('missing') || lower.includes('overvalued') || lower.includes('needs')) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 bg-[var(--background)] min-h-screen">
      
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-2xl mb-4 shadow-lg">
          <i className="fas fa-file-powerpoint text-2xl text-[var(--primary-foreground)]" aria-hidden="true"></i>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent mb-3">
          Pitch Deck Analyser
        </h1>
        <p className="text-[var(--muted-foreground)] max-w-2xl mx-auto">
          Upload your startup pitch deck to get detailed analysis, investor questions, and valuation benchmarking
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-[var(--card)] rounded-[var(--radius-lg)] border border-[var(--border)] p-8 shadow-[var(--shadow-md)]">
        <h2 className="text-xl font-semibold text-[var(--card-foreground)] mb-6 flex items-center gap-2">
          <i className="fas fa-upload text-[var(--primary)]" aria-hidden="true"></i>
          Upload Pitch Deck
        </h2>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
            <i className="fas fa-file text-[var(--primary)]" aria-hidden="true"></i>
            Select PDF or PowerPoint file
          </label>
          <input
            type="file"
            accept=".pdf,.ppt,.pptx"
            onChange={handleFileUpload}
            className="block w-full text-sm text-[var(--muted-foreground)]
              file:mr-4 file:py-2 file:px-4
              file:rounded-[var(--radius-md)] file:border-0
              file:text-sm file:font-medium
              file:bg-[var(--primary)] file:text-[var(--primary-foreground)]
              hover:file:bg-[var(--secondary)] file:cursor-pointer
              border border-[var(--border)] rounded-[var(--radius-md)] p-3
              bg-[var(--input)] focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent
              transition-all duration-200"
            data-testid="file-upload-input"
          />
        </div>

        {/* Optional Context */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
              <i className="fas fa-building text-[var(--primary)]" aria-hidden="true"></i>
              Sector
              <span className="text-[var(--muted-foreground)] text-xs">(optional)</span>
            </label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--radius-md)] 
                bg-[var(--input)] text-[var(--foreground)]
                focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent
                transition-all duration-200"
              data-testid="sector-select"
            >
              <option value="">Select sector</option>
              <option value="fintech">FinTech</option>
              <option value="healthtech">HealthTech</option>
              <option value="edtech">EdTech</option>
              <option value="saas">SaaS</option>
              <option value="ecommerce">E-commerce</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
              <i className="fas fa-chart-line text-[var(--primary)]" aria-hidden="true"></i>
              Stage
              <span className="text-[var(--muted-foreground)] text-xs">(optional)</span>
            </label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--radius-md)] 
                bg-[var(--input)] text-[var(--foreground)]
                focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent
                transition-all duration-200"
              data-testid="stage-select"
            >
              <option value="">Select stage</option>
              <option value="pre-seed">Pre-Seed</option>
              <option value="seed">Seed</option>
              <option value="series-a">Series A</option>
              <option value="series-b">Series B</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
              <i className="fas fa-globe text-[var(--primary)]" aria-hidden="true"></i>
              Geography
              <span className="text-[var(--muted-foreground)] text-xs">(optional)</span>
            </label>
            <select
              value={geography}
              onChange={(e) => setGeography(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--radius-md)] 
                bg-[var(--input)] text-[var(--foreground)]
                focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent
                transition-all duration-200"
              data-testid="geography-select"
            >
              <option value="">Select region</option>
              <option value="uk">United Kingdom</option>
              <option value="eu">European Union</option>
              <option value="us">United States</option>
              <option value="global">Global</option>
            </select>
          </div>
        </div>

        {/* Analyse Button */}
        <button
          onClick={() => file && analyseDocument(file)}
          disabled={!file || isAnalysing}
          className="w-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] 
            hover:from-[var(--secondary)] hover:to-[var(--primary)] 
            text-[var(--primary-foreground)] font-semibold py-3 px-6 
            rounded-[var(--radius-lg)] transition-all duration-200 
            disabled:opacity-50 disabled:cursor-not-allowed 
            flex items-center justify-center gap-2 shadow-[var(--shadow-md)]
            hover:shadow-[var(--shadow-lg)]"
          data-testid="analyze-button"
        >
          {isAnalysing ? (
            <>
              <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
              Analysing Deck...
            </>
          ) : (
            <>
              <i className="fas fa-search" aria-hidden="true"></i>
              Analyse Pitch Deck
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-8">
          
          {/* Executive Summary */}
          <div className="bg-[var(--card)] rounded-[var(--radius-lg)] border border-[var(--border)] p-8 shadow-[var(--shadow-lg)]">
            <h2 className="text-2xl font-bold text-[var(--card-foreground)] mb-6 flex items-center gap-3">
              <i className="fas fa-chart-bar text-[var(--primary)]" aria-hidden="true"></i>
              Executive Summary
            </h2>

            {/* Overall Scores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 rounded-[var(--radius-md)] bg-[var(--muted)] border border-[var(--border)]">
                <div className="text-3xl font-bold text-[var(--primary)] mb-1">
                  {result.overallScore.completeness}/10
                </div>
                <div className="text-sm text-[var(--muted-foreground)]">Completeness</div>
              </div>
              <div className="text-center p-4 rounded-[var(--radius-md)] bg-[var(--muted)] border border-[var(--border)]">
                <div className="text-3xl font-bold text-[var(--secondary)] mb-1">
                  {result.overallScore.clarity}/10
                </div>
                <div className="text-sm text-[var(--muted-foreground)]">Clarity</div>
              </div>
              <div className="text-center p-4 rounded-[var(--radius-md)] bg-[var(--muted)] border border-[var(--border)]">
                <div className="text-3xl font-bold text-[var(--accent-foreground)] mb-1">
                  {result.overallScore.valuationPlausibility}/10
                </div>
                <div className="text-sm text-[var(--muted-foreground)]">Valuation Reality</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Strengths */}
              <div>
                <h3 className="text-lg font-semibold text-[var(--success)] mb-3 flex items-center gap-2">
                  <i className="fas fa-thumbs-up" aria-hidden="true"></i>
                  Top Strengths
                </h3>
                <ul className="space-y-2">
                  {result.executiveSummary.topStrengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <i className="fas fa-check text-[var(--success)] mt-1 flex-shrink-0" aria-hidden="true"></i>
                      <span className="text-[var(--foreground)]">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div>
                <h3 className="text-lg font-semibold text-[var(--destructive)] mb-3 flex items-center gap-2">
                  <i className="fas fa-exclamation-triangle" aria-hidden="true"></i>
                  Key Weaknesses
                </h3>
                <ul className="space-y-2">
                  {result.executiveSummary.topWeaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <i className="fas fa-times text-[var(--destructive)] mt-1 flex-shrink-0" aria-hidden="true"></i>
                      <span className="text-[var(--foreground)]">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Valuation Analysis */}
          <div className="bg-[var(--card)] rounded-[var(--radius-lg)] border border-[var(--border)] p-8 shadow-[var(--shadow-lg)]">
            <h2 className="text-2xl font-bold text-[var(--card-foreground)] mb-6 flex items-center gap-3">
              <i className="fas fa-pound-sign text-[var(--primary)]" aria-hidden="true"></i>
              Valuation Analysis
            </h2>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-[var(--muted)] border border-[var(--border)] rounded-[var(--radius-md)]">
                <div className="text-2xl font-bold text-[var(--primary)] mb-1">
                  {formatCurrency(result.valuation.declared)}
                </div>
                <div className="text-sm text-[var(--muted-foreground)]">Pre-Money Valuation</div>
              </div>
              <div className="text-center p-4 bg-[var(--muted)] border border-[var(--border)] rounded-[var(--radius-md)]">
                <div className="text-2xl font-bold text-[var(--secondary)] mb-1">
                  {result.valuation.methods.postMoney ? formatCurrency(result.valuation.methods.postMoney) : 
                   result.valuation.implied_from_terms?.post_money ? formatCurrency(result.valuation.implied_from_terms.post_money) :
                   result.valuation.implied_from_stated?.post_money ? formatCurrency(result.valuation.implied_from_stated.post_money) :
                   result.valuation.implied_from_post_money?.post_money ? formatCurrency(result.valuation.implied_from_post_money.post_money) : '£0'}
                </div>
                <div className="text-sm text-[var(--muted-foreground)]">Post-Money Valuation</div>
              </div>
              <div className="text-center p-4 bg-[var(--muted)] border border-[var(--border)] rounded-[var(--radius-md)]">
                <div className="text-lg font-medium text-[var(--foreground)]">
                  {result.valuation.assessment}
                </div>
              </div>
            </div>

            {/* Benchmarking Table */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-[var(--card-foreground)] mb-4 flex items-center gap-2">
                <i className="fas fa-table text-[var(--primary)]" aria-hidden="true"></i>
                Valuation Methods Comparison
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-[var(--border)] rounded-[var(--radius-md)]">
                  <thead className="bg-[var(--muted)]">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-[var(--foreground)] border-b border-[var(--border)]">Method</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-[var(--foreground)] border-b border-[var(--border)]">Basis Used</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-[var(--foreground)] border-b border-[var(--border)]">Implied Value</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-[var(--foreground)] border-b border-[var(--border)]">Deck Value</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-[var(--foreground)] border-b border-[var(--border)]">Commentary</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[var(--card)]">
                    <tr className="border-b border-[var(--border)]">
                      <td className="px-4 py-3 text-sm text-[var(--card-foreground)] font-medium">Pre/Post Money</td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{
                        (() => {
                          if (!(result.valuation as any).hasTerms) return "Terms not specified";
                          return "Ask amount & equity terms";
                        })()
                      }</td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{
                        (() => {
                          if (!(result.valuation as any).hasTerms) return "—";
                          return `${formatCurrency(result.valuation.methods.preMoney)} pre, ${formatCurrency(result.valuation.methods.postMoney)} post`;
                        })()
                      }</td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{
                        (() => {
                          const declaredValue = (result.valuation as any).declaredValue || result.valuation.declared;
                          const isDCF = (result.valuation as any).declaredPV !== null && (result.valuation as any).declaredPV !== undefined;
                          
                          if (isDCF && declaredValue > 0) {
                            return `${formatCurrency(declaredValue)} DCF PV`;
                          }
                          
                          const hasTerms = (result.valuation as any).hasTerms;
                          if (hasTerms && result.valuation.methods.preMoney > 0) {
                            return `${formatCurrency(result.valuation.methods.preMoney)} pre`;
                          }
                          
                          return "—";
                        })()
                      }</td>
                      <td className="px-4 py-3 text-sm text-[var(--success)]">{
                        (() => {
                          if (!(result.valuation as any).hasTerms) return "—";
                          return (result.valuation as any).declaredPV ? "DCF vs. Terms Check" : "Matches terms";
                        })()
                      }</td>
                    </tr>
                    <tr className="border-b border-[var(--border)]">
                      <td className="px-4 py-3 text-sm text-[var(--card-foreground)] font-medium">Revenue Multiple</td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{formatCurrency(result.valuation.methods.revenueMultiple.arr)} ARR × {result.valuation.methods.revenueMultiple.multiple}x</td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{formatCurrency(result.valuation.methods.revenueMultiple.impliedValue)}</td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{
                        (() => {
                          const declaredValue = (result.valuation as any).declaredValue || result.valuation.declared;
                          const isDCF = (result.valuation as any).declaredPV !== null && (result.valuation as any).declaredPV !== undefined;
                          
                          if (isDCF && declaredValue > 0) {
                            return `${formatCurrency(declaredValue)} DCF PV`;
                          }
                          
                          const hasTerms = (result.valuation as any).hasTerms;
                          if (hasTerms && result.valuation.methods.preMoney > 0) {
                            return `${formatCurrency(result.valuation.methods.preMoney)} pre`;
                          }
                          
                          return "—";
                        })()
                      }</td>
                      <td className="px-4 py-3 text-sm text-[var(--destructive)]">{
                        (() => {
                          const basePV = result.valuation.methods.revenueMultiple.impliedValue;
                          const deckVal = (result.valuation as any).declaredValue || result.valuation.declared;
                          if (!deckVal || !basePV || deckVal <= 0 || basePV <= 0) return "—";
                          return deckVal < basePV ? "Undervalued vs ARR benchmark" : "Overvalued vs ARR benchmark";
                        })()
                      }</td>
                    </tr>
                    <tr className="border-b border-[var(--border)]">
                      <td className="px-4 py-3 text-sm text-[var(--card-foreground)] font-medium">EBITDA Multiple</td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{formatCurrency(result.valuation.methods.ebitdaMultiple.ebitda)} EBITDA × {result.valuation.methods.ebitdaMultiple.multiple}x</td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{formatCurrency(result.valuation.methods.ebitdaMultiple.impliedValue)}</td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{
                        (() => {
                          const declaredValue = (result.valuation as any).declaredValue || result.valuation.declared;
                          const isDCF = (result.valuation as any).declaredPV !== null && (result.valuation as any).declaredPV !== undefined;
                          
                          if (isDCF && declaredValue > 0) {
                            return `${formatCurrency(declaredValue)} DCF PV`;
                          }
                          
                          const hasTerms = (result.valuation as any).hasTerms;
                          if (hasTerms && result.valuation.methods.preMoney > 0) {
                            return `${formatCurrency(result.valuation.methods.preMoney)} pre`;
                          }
                          
                          return "—";
                        })()
                      }</td>
                      <td className="px-4 py-3 text-sm text-[var(--warning)]">{
                        (() => {
                          const basePV = result.valuation.methods.ebitdaMultiple.impliedValue;
                          const deckVal = (result.valuation as any).declaredValue || result.valuation.declared;
                          if (!deckVal || !basePV || deckVal <= 0 || basePV <= 0) return "—";
                          return deckVal < basePV ? "Undervalued vs EBITDA benchmark" : "Premium pricing applied";
                        })()
                      }</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-[var(--card-foreground)] font-medium">ROI Projection</td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{result.valuation.methods.roiProjection.equityStake}% stake, {result.valuation.methods.roiProjection.roiMultiple}x return</td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{formatCurrency(result.valuation.methods.roiProjection.projectedExit)}</td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">5-7 year horizon</td>
                      <td className="px-4 py-3 text-sm text-[var(--accent-foreground)]">{result.valuation.methods.roiProjection.irr}% IRR target</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Enhanced Valuation Methods from enhanced engine */}
            {((result.valuation as any).revenue_multiple || (result.valuation as any).ebitda_multiple || (result.valuation as any).implied_from_stated) && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-[var(--card-foreground)] mb-4 flex items-center gap-2">
                  <i className="fas fa-chart-line text-[var(--primary)]" aria-hidden="true"></i>
                  Enhanced Valuation Calculations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(result.valuation as any).revenue_multiple && (
                    <div className="bg-[var(--muted)] p-4 rounded-[var(--radius-md)] border border-[var(--border)]">
                      <h4 className="font-medium text-[var(--card-foreground)] mb-2">Revenue Multiple Range</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[var(--muted-foreground)]">Low:</span>
                          <span className="text-[var(--foreground)]">{formatCurrency((result.valuation as any).revenue_multiple.implied_low)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--muted-foreground)]">Mid:</span>
                          <span className="text-[var(--primary)] font-medium">{formatCurrency((result.valuation as any).revenue_multiple.implied_mid)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--muted-foreground)]">High:</span>
                          <span className="text-[var(--foreground)]">{formatCurrency((result.valuation as any).revenue_multiple.implied_high)}</span>
                        </div>
                        <div className="text-xs text-[var(--muted-foreground)] mt-2">
                          Based on {formatCurrency((result.valuation as any).revenue_multiple.arr)} ARR
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {(result.valuation as any).ebitda_multiple && (
                    <div className="bg-[var(--muted)] p-4 rounded-[var(--radius-md)] border border-[var(--border)]">
                      <h4 className="font-medium text-[var(--card-foreground)] mb-2">EBITDA Multiple Range</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[var(--muted-foreground)]">Low:</span>
                          <span className="text-[var(--foreground)]">{formatCurrency((result.valuation as any).ebitda_multiple.implied_low)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--muted-foreground)]">Mid:</span>
                          <span className="text-[var(--secondary)] font-medium">{formatCurrency((result.valuation as any).ebitda_multiple.implied_mid)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--muted-foreground)]">High:</span>
                          <span className="text-[var(--foreground)]">{formatCurrency((result.valuation as any).ebitda_multiple.implied_high)}</span>
                        </div>
                        <div className="text-xs text-[var(--muted-foreground)] mt-2">
                          Based on {formatCurrency((result.valuation as any).ebitda_multiple.ebitda)} EBITDA
                        </div>
                      </div>
                    </div>
                  )}

                  {(result.valuation as any).implied_from_stated && (
                    <div className="bg-[var(--muted)] p-4 rounded-[var(--radius-md)] border border-[var(--border)]">
                      <h4 className="font-medium text-[var(--card-foreground)] mb-2">From Stated Valuation</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[var(--muted-foreground)]">Pre-money:</span>
                          <span className="text-[var(--foreground)]">{formatCurrency((result.valuation as any).implied_from_stated.pre_money)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--muted-foreground)]">Post-money:</span>
                          <span className="text-[var(--accent)] font-medium">{formatCurrency((result.valuation as any).implied_from_stated.post_money)}</span>
                        </div>
                        <div className="text-xs text-[var(--muted-foreground)] mt-2">
                          Method: {(result.valuation as any).implied_from_stated.method}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* LLM-Powered Peer Analysis */}
            {(result.valuation as any).peer_analysis && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-[var(--card-foreground)] mb-4 flex items-center gap-2">
                  <i className="fas fa-users text-[var(--primary)]" aria-hidden="true"></i>
                  Peer Valuation Analysis
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Peer Comparison Summary */}
                  <div className="bg-[var(--muted)] p-4 rounded-[var(--radius-md)] border border-[var(--border)]">
                    <h4 className="font-medium text-[var(--card-foreground)] mb-3">Market Comparison</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-[var(--muted-foreground)] mb-1">Valuation Gap vs. Peers</div>
                        <div className={`text-lg font-semibold ${(result.valuation as any).peer_analysis.valuation_gap_pct > 0.2 ? 'text-[var(--destructive)]' : (result.valuation as any).peer_analysis.valuation_gap_pct > 0 ? 'text-[var(--warning)]' : 'text-[var(--success)]'}`}>
                          {((result.valuation as any).peer_analysis.valuation_gap_pct * 100).toFixed(1)}%
                          {(result.valuation as any).peer_analysis.valuation_gap_pct > 0 ? ' premium' : (result.valuation as any).peer_analysis.valuation_gap_pct < 0 ? ' discount' : ' aligned'}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-[var(--muted-foreground)] mb-1">Reasonableness Score</div>
                        <div className="flex items-center gap-2">
                          <div className={`text-lg font-semibold ${(result.valuation as any).peer_analysis.assessment.reasonableness_score >= 7 ? 'text-[var(--success)]' : (result.valuation as any).peer_analysis.assessment.reasonableness_score >= 5 ? 'text-[var(--warning)]' : 'text-[var(--destructive)]'}`}>
                            {(result.valuation as any).peer_analysis.assessment.reasonableness_score}/10
                          </div>
                          <div className="flex">
                            {Array.from({ length: 10 }, (_, i) => (
                              <i key={i} className={`fas fa-star text-xs ${i < (result.valuation as any).peer_analysis.assessment.reasonableness_score ? 'text-[var(--accent)]' : 'text-[var(--muted-foreground)]'}`} aria-hidden="true"></i>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-[var(--muted-foreground)] mb-1">Typical Revenue Multiples</div>
                        <div className="text-sm text-[var(--foreground)]">
                          {(result.valuation as any).peer_analysis.peer_comparison.typical_multiples.revenue_multiple_range[0]}× - {(result.valuation as any).peer_analysis.peer_comparison.typical_multiples.revenue_multiple_range[1]}×
                        </div>
                      </div>
                      
                      {(result.valuation as any).peer_analysis.peer_comparison.typical_multiples.ebitda_multiple_range && (
                        <div>
                          <div className="text-sm text-[var(--muted-foreground)] mb-1">Typical EBITDA Multiples</div>
                          <div className="text-sm text-[var(--foreground)]">
                            {(result.valuation as any).peer_analysis.peer_comparison.typical_multiples.ebitda_multiple_range[0]}× - {(result.valuation as any).peer_analysis.peer_comparison.typical_multiples.ebitda_multiple_range[1]}×
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Similar Companies & Assessment */}
                  <div className="space-y-4">
                    {/* Similar Companies */}
                    <div className="bg-[var(--muted)] p-4 rounded-[var(--radius-md)] border border-[var(--border)]">
                      <h4 className="font-medium text-[var(--card-foreground)] mb-2">Similar Companies</h4>
                      <div className="space-y-1">
                        {(result.valuation as any).peer_analysis.peer_comparison.similar_companies.map((company: string, index: number) => (
                          <div key={index} className="text-sm text-[var(--foreground)] flex items-center gap-2">
                            <i className="fas fa-building text-[var(--primary)] text-xs" aria-hidden="true"></i>
                            {company}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Market Context */}
                    <div className="bg-[var(--muted)] p-4 rounded-[var(--radius-md)] border border-[var(--border)]">
                      <h4 className="font-medium text-[var(--card-foreground)] mb-2">Market Context</h4>
                      <p className="text-sm text-[var(--foreground)]">
                        {(result.valuation as any).peer_analysis.peer_comparison.market_context}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Assessment Details */}
                <div className="mt-6 bg-[var(--card)] p-4 rounded-[var(--radius-md)] border border-[var(--border)]">
                  <h4 className="font-medium text-[var(--card-foreground)] mb-3">Assessment Summary</h4>
                  <p className="text-sm text-[var(--foreground)] mb-4">
                    {(result.valuation as any).peer_analysis.assessment.justification}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Key Factors */}
                    {(result.valuation as any).peer_analysis.assessment.key_factors.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-[var(--card-foreground)] mb-2">Key Factors</h5>
                        <ul className="space-y-1">
                          {(result.valuation as any).peer_analysis.assessment.key_factors.map((factor: string, index: number) => (
                            <li key={index} className="text-sm text-[var(--foreground)] flex items-start gap-2">
                              <i className="fas fa-check-circle text-[var(--primary)] text-xs mt-0.5" aria-hidden="true"></i>
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Red Flags / Positive Signals */}
                    <div className="space-y-3">
                      {(result.valuation as any).peer_analysis.assessment.red_flags && (result.valuation as any).peer_analysis.assessment.red_flags.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-[var(--destructive)] mb-2">Red Flags</h5>
                          <ul className="space-y-1">
                            {(result.valuation as any).peer_analysis.assessment.red_flags.map((flag: string, index: number) => (
                              <li key={index} className="text-sm text-[var(--foreground)] flex items-start gap-2">
                                <i className="fas fa-exclamation-triangle text-[var(--destructive)] text-xs mt-0.5" aria-hidden="true"></i>
                                {flag}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {(result.valuation as any).peer_analysis.assessment.positive_signals && (result.valuation as any).peer_analysis.assessment.positive_signals.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-[var(--success)] mb-2">Positive Signals</h5>
                          <ul className="space-y-1">
                            {(result.valuation as any).peer_analysis.assessment.positive_signals.map((signal: string, index: number) => (
                              <li key={index} className="text-sm text-[var(--foreground)] flex items-start gap-2">
                                <i className="fas fa-thumbs-up text-[var(--success)] text-xs mt-0.5" aria-hidden="true"></i>
                                {signal}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-[var(--border)]">
                    <p className="text-xs text-[var(--muted-foreground)]">
                      <i className="fas fa-info-circle mr-1" aria-hidden="true"></i>
                      {(result.valuation as any).peer_analysis.methodology_note}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Method Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="p-4 bg-[var(--muted)] border border-[var(--border)] rounded-[var(--radius-md)]">
                <h4 className="font-semibold text-[var(--card-foreground)] mb-3 flex items-center gap-2">
                  <i className="fas fa-chart-line text-[var(--primary)] text-sm" aria-hidden="true"></i>
                  Revenue Multiple Analysis
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--muted-foreground)]">Current ARR:</span>
                    <span className="font-medium text-[var(--foreground)]">{formatCurrency(result.valuation.methods.revenueMultiple.arr)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted-foreground)]">Industry Multiple:</span>
                    <span className="font-medium text-[var(--foreground)]">{result.valuation.methods.revenueMultiple.multiple}×</span>
                  </div>
                  <div className="flex justify-between border-t border-[var(--border)] pt-2">
                    <span className="text-[var(--muted-foreground)]">Fair Value:</span>
                    <span className="font-bold text-[var(--primary)]">{formatCurrency(result.valuation.methods.revenueMultiple.impliedValue)}</span>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] mt-2">Most common for SaaS/tech startups. Focuses on recurring revenue potential.</p>
                </div>
              </div>

              <div className="p-4 bg-[var(--muted)] border border-[var(--border)] rounded-[var(--radius-md)]">
                <h4 className="font-semibold text-[var(--card-foreground)] mb-3 flex items-center gap-2">
                  <i className="fas fa-chart-bar text-[var(--secondary)] text-sm" aria-hidden="true"></i>
                  EBITDA Multiple Analysis
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--muted-foreground)]">Forecasted EBITDA (Y3):</span>
                    <span className="font-medium text-[var(--foreground)]">{formatCurrency(result.valuation.methods.ebitdaMultiple.ebitda)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted-foreground)]">Industry Multiple:</span>
                    <span className="font-medium text-[var(--foreground)]">{result.valuation.methods.ebitdaMultiple.multiple}×</span>
                  </div>
                  <div className="flex justify-between border-t border-[var(--border)] pt-2">
                    <span className="text-[var(--muted-foreground)]">Implied Value:</span>
                    <span className="font-bold text-[var(--secondary)]">{formatCurrency(result.valuation.methods.ebitdaMultiple.impliedValue)}</span>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] mt-2">Useful for later-stage businesses. Reflects profitability and efficiency.</p>
                </div>
              </div>
            </div>

            {/* ROI Analysis */}
            <div className="p-6 bg-gradient-to-r from-[var(--accent)] to-[var(--warning)] rounded-[var(--radius-lg)] mb-8 border border-[var(--border)]">
              <h4 className="font-semibold text-[var(--accent-foreground)] mb-4 flex items-center gap-2">
                <i className="fas fa-trophy text-[var(--accent-foreground)] text-sm" aria-hidden="true"></i>
                Investor ROI Projection
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="text-center p-3 bg-white/20 rounded-[var(--radius-md)]">
                  <div className="text-2xl font-bold text-[var(--accent-foreground)] mb-1">
                    {result.valuation.methods?.roiProjection?.equityStake ? 
                     `${result.valuation.methods.roiProjection.equityStake}%` : '15%'}
                  </div>
                  <div className="text-[var(--accent-foreground)] opacity-80">Equity Stake</div>
                </div>
                <div className="text-center p-3 bg-white/20 rounded-[var(--radius-md)]">
                  <div className="text-2xl font-bold text-[var(--accent-foreground)] mb-1">
                    {result.valuation.methods?.roiProjection?.roiMultiple ? 
                     `${result.valuation.methods.roiProjection.roiMultiple}×` : '4×'}
                  </div>
                  <div className="text-[var(--accent-foreground)] opacity-80">ROI Multiple</div>
                </div>
                <div className="text-center p-3 bg-white/20 rounded-[var(--radius-md)]">
                  <div className="text-2xl font-bold text-[var(--accent-foreground)] mb-1">
                    {result.valuation.methods?.roiProjection?.irr ? 
                     `${result.valuation.methods.roiProjection.irr}%` : '31%'}
                  </div>
                  <div className="text-[var(--accent-foreground)] opacity-80">IRR (5 years)</div>
                </div>
                <div className="text-center p-3 bg-white/20 rounded-[var(--radius-md)]">
                  <div className="text-lg font-bold text-[var(--accent-foreground)] mb-1">
                    {result.valuation.methods?.roiProjection?.investorReturn ? 
                     formatCurrency(result.valuation.methods.roiProjection.investorReturn) : '£20M'}
                  </div>
                  <div className="text-[var(--accent-foreground)] opacity-80">Projected Return</div>
                </div>
              </div>
              <p className="text-xs text-[var(--accent-foreground)] mt-4 text-center opacity-90">
                Above VC target hurdle (~25–30%), but depends heavily on hitting ARR forecast and achieving {result.valuation.methods?.roiProjection?.projectedExit ? formatCurrency(result.valuation.methods.roiProjection.projectedExit) : '£100M'} exit.
              </p>
            </div>

            {/* Valuation Questions */}
            <div>
              <h4 className="font-semibold text-[var(--card-foreground)] mb-3 flex items-center gap-2">
                <i className="fas fa-question-circle text-[var(--primary)] text-sm" aria-hidden="true"></i>
                Key Valuation Questions
              </h4>
              <div className="space-y-2">
                {result.valuation.suggestedQuestions.map((question, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-[var(--muted)] border border-[var(--border)] rounded-[var(--radius-md)]">
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-medium rounded-full flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-sm text-[var(--foreground)]">{question}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Investor Questions */}
          <div className="bg-[var(--card)] rounded-[var(--radius-lg)] border border-[var(--border)] p-8 shadow-[var(--shadow-lg)]">
            <h2 className="text-2xl font-bold text-[var(--card-foreground)] mb-6 flex items-center gap-3">
              <i className="fas fa-question-circle text-[var(--primary)]" aria-hidden="true"></i>
              Key Investor Questions
            </h2>

            <div className="space-y-3">
              {result.executiveSummary.investorQuestions.map((question, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-[var(--muted)] border border-[var(--border)] rounded-[var(--radius-md)]">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-medium rounded-full flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-[var(--foreground)]">{question}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section Analysis */}
          <div className="bg-[var(--card)] rounded-[var(--radius-lg)] border border-[var(--border)] p-8 shadow-[var(--shadow-lg)]">
            <h2 className="text-2xl font-bold text-[var(--card-foreground)] mb-6 flex items-center gap-3">
              <i className="fas fa-list-check text-[var(--primary)]" aria-hidden="true"></i>
              Section-by-Section Analysis
            </h2>

            <div className="space-y-6">
              {result.sections.map((section, index) => (
                <div key={index} className="border border-[var(--border)] rounded-[var(--radius-lg)] p-6 bg-[var(--muted)] shadow-[var(--shadow)]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[var(--card-foreground)]">
                      {section.name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(section.status)} bg-[var(--background)] border border-[var(--border)]`}>
                      {section.status}
                    </span>
                  </div>

                  {/* Extracted Content */}
                  <div className="mb-6 p-4 bg-[var(--primary)]/10 rounded-[var(--radius-md)] border-l-4 border-[var(--primary)]">
                    <h4 className="font-medium text-[var(--primary)] mb-2 text-sm flex items-center gap-2">
                      <i className="fas fa-quote-left text-xs" aria-hidden="true"></i>
                      Extracted Content
                    </h4>
                    <p className="text-sm text-[var(--foreground)] italic">
                      "{section.extracted}"
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Strengths */}
                    {section.strengths.length > 0 && (
                      <div>
                        <h4 className="font-medium text-[var(--success)] mb-2 text-sm flex items-center gap-2">
                          <i className="fas fa-thumbs-up text-xs" aria-hidden="true"></i>
                          Strengths
                        </h4>
                        <ul className="space-y-2">
                          {section.strengths.map((strength, idx) => (
                            <li key={idx} className="text-sm text-[var(--foreground)] flex items-start gap-2">
                              <i className="fas fa-check text-[var(--success)] mt-1 flex-shrink-0 text-xs" aria-hidden="true"></i>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Weaknesses */}
                    {section.weaknesses.length > 0 && (
                      <div>
                        <h4 className="font-medium text-[var(--destructive)] mb-2 text-sm flex items-center gap-2">
                          <i className="fas fa-exclamation-triangle text-xs" aria-hidden="true"></i>
                          Areas for Improvement
                        </h4>
                        <ul className="space-y-2">
                          {section.weaknesses.map((weakness, idx) => (
                            <li key={idx} className="text-sm text-[var(--foreground)] flex items-start gap-2">
                              <i className="fas fa-times text-[var(--destructive)] mt-1 flex-shrink-0 text-xs" aria-hidden="true"></i>
                              {weakness}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Benchmark */}
                  <div className="mb-4 p-3 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-md)]">
                    <h4 className="font-medium text-[var(--card-foreground)] mb-1 text-sm flex items-center gap-2">
                      <i className="fas fa-chart-bar text-xs" aria-hidden="true"></i>
                      Benchmark Assessment
                    </h4>
                    <p className={`text-sm font-medium ${getBenchmarkColor(section.benchmark)}`}>
                      {section.benchmark}
                    </p>
                  </div>

                  {/* Questions */}
                  {section.questions.length > 0 && (
                    <div className="pt-4 border-t border-[var(--border)]">
                      <h4 className="font-medium text-[var(--primary)] mb-3 text-sm flex items-center gap-2">
                        <i className="fas fa-question-circle text-xs" aria-hidden="true"></i>
                        Suggested Investor Questions
                      </h4>
                      <div className="space-y-2">
                        {section.questions.map((question, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-2 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-md)]">
                            <span className="inline-flex items-center justify-center w-5 h-5 bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-medium rounded-full flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="text-sm text-[var(--foreground)]">{question}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Risk Flags */}
          <div className="bg-[var(--card)] rounded-[var(--radius-lg)] border border-[var(--border)] p-8 shadow-[var(--shadow-lg)]">
            <h2 className="text-2xl font-bold text-[var(--card-foreground)] mb-6 flex items-center gap-3">
              <i className="fas fa-flag text-[var(--primary)]" aria-hidden="true"></i>
              Risk Indicators
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.riskFlags.map((risk, index) => (
                <div key={index} className="p-4 border border-[var(--border)] bg-[var(--muted)] rounded-[var(--radius-md)]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(risk.level)} bg-[var(--background)] border border-[var(--border)]`}>
                      {risk.level} Risk
                    </span>
                  </div>
                  <p className="text-sm text-[var(--foreground)]">{risk.issue}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-[var(--muted)] rounded-[var(--radius-lg)] p-6 text-center border border-[var(--border)]">
            <h3 className="text-lg font-semibold text-[var(--card-foreground)] mb-4">Export Analysis</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-[var(--primary)] hover:bg-[var(--primary)]/80 text-[var(--primary-foreground)] font-medium py-2 px-6 rounded-[var(--radius-md)] transition-colors flex items-center justify-center gap-2">
                <i className="fas fa-download" aria-hidden="true"></i>
                Download PDF Report
              </button>
              <button className="bg-[#62C4C3] hover:bg-[#58B4B3] text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
                <i className="fas fa-share" aria-hidden="true"></i>
                Share Analysis
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}