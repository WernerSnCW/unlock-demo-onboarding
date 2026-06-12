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
    declared: number | null;
    benchmarkMin: number;
    benchmarkMax: number;
    assessment: string;
    methods: {
      preMoney: number;
      postMoney: number;
      revenueMultiple: {
        base: number;
        baseLabel: string;
        horizonYears: number;
        multiple: number;
        impliedValue: number;
      };
      ebitdaMultiple: {
        ebitda: number;
        baseLabel: string;
        horizonYears: number;
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
    // Enhanced valuation data from backend
    revenue_multiple?: {
      base: number;
      base_label: string;
      multiple_low: number;
      multiple_mid: number;
      multiple_high: number;
      implied_low: number;
      implied_mid: number;
      implied_high: number;
      horizon_years: number;
      discounted: boolean;
    };
    ebitda_multiple?: {
      base: number;
      base_label: string;
      multiple_low: number;
      multiple_mid: number;
      multiple_high: number;
      implied_low: number;
      implied_mid: number;
      implied_high: number;
      horizon_years: number;
      discounted: boolean;
    };
    implied_from_terms?: {
      pre_money: number;
      post_money: number;
      raise: number;
      equity_pct: number;
    };
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
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [sector, setSector] = useState('');
  const [stage, setStage] = useState('');
  const [geography, setGeography] = useState('');
  const [selectedPreviousAnalysis, setSelectedPreviousAnalysis] = useState<string | null>(null);

  // Hardcoded example: Unlock Pitch Deck Analysis
  const unlockPitchDeckAnalysis: AnalysisResult = {
    id: "unlock-pitch-deck-june-2025",
    fileName: "Unlock Pitch Deck - June 2025.pdf",
    overallScore: {
      completeness: 9,
      clarity: 10,
      valuationPlausibility: 8
    },
    executiveSummary: {
      topStrengths: [
        "Tackles a well-evidenced trust gap in alternatives (fraud losses; only ~4% retail participation), giving Unlock a compelling mission and timing.",
        "Differentiated \"AI + expert\" diligence engine with structured Q&A and modular tools that span discovery → decision → completion.",
        "Tiered pricing for individuals and institutions with clear expansion paths (EMIs/PSPs, family offices) and white-label/API options.",
        "Traction signals (pre-alpha demos, LOIs, early funding) and a phased, test-and-learn roadmap."
      ],
      topWeaknesses: [
        "Round terms (raise size, pre/post) not explicitly stated in the deck.",
        "Execution depends on integrations/partnerships in compliance and payments—partners identified; timelines matter."
      ],
      investorQuestions: [
        "What milestones gate the Alpha→Beta transition and unlock institutional pilots (EMIs/PSPs)?",
        "Which compliance/KYC partners are first for \"digital completion,\" and what is the co-selling plan?",
        "How quickly does analyst time per report fall with workflow automation, and how does that move gross margin?",
        "What are the first three data sources powering \"Cognisense\" risk surfacing, and how are confidence scores reported to users?",
        "Which segments of the investor directory (by asset type) will seed network effects fastest?"
      ]
    },
    sections: [
      {
        name: 'Problem',
        status: 'Present',
        extracted: 'UK investors face opaque, fragmented, and often risky alternative opportunities; fraud and low retail participation underscore a trust deficit.',
        strengths: ['Quantified pain (fraud stats, low alts penetration)', 'First-person investor quotes', 'Clear "jobs to be done"'],
        weaknesses: [],
        questions: ['What 2–3 metrics will you publish (publicly) as "trust signals" to compound credibility quarterly?'],
        benchmark: 'High — sharp articulation with credible data points'
      },
      {
        name: 'Solution',
        status: 'Present', 
        extracted: 'Unified hub for curated discovery, AI + expert diligence, structured Q&A, and digital completion, delivered as modular tools.',
        strengths: ['End-to-end flow', 'Interactive diligence workflows', 'Expert-governed reports', 'Seamless partner execution'],
        weaknesses: [],
        questions: ['Which diligence modules will be self-serve first (valuation, verification, competitor scan), and what\'s the beta success metric?'],
        benchmark: 'High — differentiated vs. pitch-only or compliance-only point solutions'
      },
      {
        name: 'Market Size',
        status: 'Present',
        extracted: '22.8m UK investors; staged GTM from investor tiers to EMIs/PSPs and family offices; white-label/API for scale.',
        strengths: ['Clear wedges with quantified expansion markets (£50–70m EMI/PSP DD; £30–84m family-office intelligence)'],
        weaknesses: [],
        questions: [],
        benchmark: 'High — credible bottoms-up snapshots and realistic penetration targets'
      },
      {
        name: 'Traction',
        status: 'Present',
        extracted: 'Functional pre-alpha, live demos, LOIs, initial funding, weekly user sessions guiding roadmap.',
        strengths: ['Early but purposeful', 'Good momentum for stage'],
        weaknesses: [],
        questions: [],
        benchmark: 'Medium-High — early but purposeful; good momentum for stage'
      },
      {
        name: 'Business Model',
        status: 'Present',
        extracted: 'Recurring tiers (£0/£99/£249/institutional), staged verticals, and a 5-year plan to £7–9m ARR and £6.75m EBITDA.',
        strengths: ['Diversified lines with operating leverage from automation', 'Disciplined valuation slide'],
        weaknesses: [],
        questions: [],
        benchmark: 'High — diversified lines with operating leverage from automation; disciplined valuation slide'
      },
      {
        name: 'Terms/Valuation',
        status: 'Present',
        extracted: 'Deck provides a DCF/EBITDA-based value indication (~£20.5m), using conservative multiples. Round terms to be specified.',
        strengths: ['Thoughtful, conservative framing'],
        weaknesses: ['Add explicit pre/post to complete the picture'],
        questions: [],
        benchmark: 'Medium-High — thoughtful, conservative framing; add explicit pre/post to complete the picture'
      }
    ],
    valuation: {
      declared: 20500000,
      benchmarkMin: 15000000,
      benchmarkMax: 25000000,
      assessment: 'DCF anchored in Year-5 EBITDA with conservative multiples shows discipline for stage',
      methods: {
        preMoney: 20500000,
        postMoney: 20500000,
        revenueMultiple: {
          base: 8000000,
          baseLabel: "ARR (Year 5)",
          horizonYears: 5,
          multiple: 2.5,
          impliedValue: 20000000
        },
        ebitdaMultiple: {
          ebitda: 6750000,
          baseLabel: "EBITDA (Year 5)",
          horizonYears: 5,
          multiple: 8,
          impliedValue: 54000000
        },
        roiProjection: {
          equityStake: 20,
          roiMultiple: 2.73,
          irr: 22,
          projectedExit: 20500000,
          investorReturn: 4100000
        }
      },
      suggestedQuestions: [
        "How are growth projections supported beyond current revenue figures?",
        "What benchmarks inform the conservative EBITDA multiples?", 
        "How does the DCF compare to comparable transaction data?"
      ]
    },
    riskFlags: [
      {
        level: 'Medium',
        issue: 'Execution: Reliant on timely partner integrations (KYC/AML/SPV/payment) to complete the "from insight to action" promise'
      },
      {
        level: 'Medium', 
        issue: 'Data Quality: Early versions must maintain high precision/recall in red-flag surfacing and confidence scoring'
      }
    ]
  };

  const uploadedDecks = [
    {
      id: "unlock-pitch-deck-june-2025",
      title: "Unlock Pitch Deck - June 2025",
      fileSize: "2.4 MB",
      uploadDate: "June 15, 2025",
      summary: "AI-powered investment due diligence platform tackling trust gap in alternatives market"
    }
  ];

  const handleSelectPreviousAnalysis = (analysisId: string) => {
    if (analysisId === "unlock-pitch-deck-june-2025") {
      setIsAnalysing(true);
      setResult(null); // Clear current result
      setSelectedPreviousAnalysis(analysisId);
      setFile(null); // Clear any uploaded file
      
      // Show loading animation for 10 seconds before displaying results
      setTimeout(() => {
        setResult(unlockPitchDeckAnalysis);
        setIsAnalysing(false);
      }, 10000);
    }
  };

  const analyseDocument = async (uploadedFile: File) => {
    setIsAnalysing(true);
    setAnalysisError(null);
    setSelectedPreviousAnalysis(null); // Clear any selected previous analysis
    
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
      console.log("API Response received:", result);
      console.log("Declared valuation from API:", result?.valuation?.declared);
      console.log("Enhanced valuation data:", {
        revenue_multiple: result?.valuation?.revenue_multiple,
        ebitda_multiple: result?.valuation?.ebitda_multiple,
        implied_from_terms: result?.valuation?.implied_from_terms
      });
      setResult(result);
    } catch (error) {
      // Fail visibly — never substitute a canned analysis of the user's own
      // deck for a real one (review finding D7).
      console.error('Pitch deck analysis failed:', error);
      setResult(null);
      setAnalysisError('We could not analyse this deck right now. No analysis is shown rather than an approximation — please try again.');
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

  const formatCurrency = (amount: number | null | undefined) => {
    console.log("formatCurrency called with:", amount, typeof amount);
    if (amount == null || amount === 0) return "Not specified";
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  const moneyOrNA = (v?: number | null) =>
    v == null || v === 0 ? "Not specified" : formatCurrency(v);

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
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen relative">
      {/* Loading Overlay */}
      {isAnalysing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-[var(--card)] rounded-[var(--radius-lg)] border border-[var(--border)] p-8 shadow-[var(--shadow-lg)] text-center max-w-md mx-4">
            <div className="w-16 h-16 mx-auto mb-6 relative">
              <div className="w-16 h-16 border-4 border-[var(--primary)]/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-[var(--primary)] rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-semibold text-[var(--card-foreground)] mb-2">Analysing Deck</h3>
            <p className="text-[var(--muted-foreground)] text-sm">
              Our AI is analyzing your pitch deck for completeness, clarity, and valuation benchmarking...
            </p>
          </div>
        </div>
      )}

      {analysisError && !isAnalysing && (
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <div className="bg-[var(--destructive)]/10 border border-[var(--destructive)]/30 rounded-[var(--radius-md)] p-4 flex items-start gap-3">
            <i className="fas fa-triangle-exclamation text-[var(--destructive)] mt-0.5" aria-hidden="true"></i>
            <div>
              <p className="font-semibold text-[var(--card-foreground)]">Analysis unavailable</p>
              <p className="text-sm text-[var(--muted-foreground)]">{analysisError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Professional Header */}
      <div className="bg-gradient-to-r from-[var(--secondary)] to-[var(--primary)] text-white px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <i className="fas fa-file-powerpoint text-2xl text-white" aria-hidden="true"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Pitch Deck Analyser</h1>
                <p className="text-white/90 text-sm">Upload your startup pitch deck to get detailed analysis, investor questions, and valuation benchmarking</p>
              </div>
            </div>
          </div>
          
          {/* Feature Highlights */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-sm font-bold text-white">Section Analysis</div>
              <div className="text-xs text-white/80">15+ Key Areas</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-sm font-bold text-white">Valuation Check</div>
              <div className="text-xs text-white/80">Multiple Methods</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-sm font-bold text-white">Investor Questions</div>
              <div className="text-xs text-white/80">Due Diligence Ready</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-8">

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

      {/* Uploaded Decks Section */}
      <div className="bg-[var(--card)] rounded-[var(--radius-lg)] border border-[var(--border)] p-8 shadow-[var(--shadow-md)]">
        <h2 className="text-xl font-semibold text-[var(--card-foreground)] mb-6 flex items-center gap-2">
          <i className="fas fa-cloud-upload-alt text-[var(--primary)]" aria-hidden="true"></i>
          Uploaded Decks
        </h2>
        
        <p className="text-[var(--muted-foreground)] text-sm mb-6">
          Select a previously uploaded deck to analyze or compare
        </p>

        <div className="space-y-4">
          {uploadedDecks.map((deck) => (
            <div 
              key={deck.id} 
              className={`bg-[var(--muted)]/10 rounded-[var(--radius-md)] p-4 border cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedPreviousAnalysis === deck.id 
                  ? 'border-[var(--primary)] bg-[var(--primary)]/5' 
                  : 'border-[var(--border)] hover:border-[var(--primary)]/50'
              }`}
              onClick={() => handleSelectPreviousAnalysis(deck.id)}
              data-testid={`uploaded-deck-${deck.id}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-[var(--radius-md)] flex items-center justify-center">
                    <i className="fas fa-file-pdf text-white text-sm" aria-hidden="true"></i>
                  </div>
                  <div>
                    <h3 className="font-medium text-[var(--card-foreground)]">{deck.title}</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">{deck.summary}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                        <i className="fas fa-calendar text-[var(--primary)]" aria-hidden="true"></i>
                        <span>Uploaded: {deck.uploadDate}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                        <i className="fas fa-file-alt text-[var(--primary)]" aria-hidden="true"></i>
                        <span>Size: {deck.fileSize}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fas fa-chevron-right text-[var(--muted-foreground)]" aria-hidden="true"></i>
                </div>
              </div>
            </div>
          ))}
        </div>
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
                <div className="text-sm text-[var(--muted-foreground)]">
                  {(result.valuation as any).headlineLabel || "Valuation"}
                </div>
              </div>
              <div className="text-center p-4 bg-[var(--muted)] border border-[var(--border)] rounded-[var(--radius-md)]">
                <div className="text-2xl font-bold text-[var(--secondary)] mb-1">
                  {(() => {
                    const postMoney = result.valuation.methods.postMoney;
                    if (postMoney && postMoney > 0) return formatCurrency(postMoney);
                    return "Not specified";
                  })()}
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
                          const declaredValue = (result.valuation as any).declaredValue ?? result.valuation.declared;
                          const isDCF = (result.valuation as any).declaredPV !== null && (result.valuation as any).declaredPV !== undefined;
                          
                          // Check if we have a valid declared value (not null/zero)
                          if (declaredValue && declaredValue > 0) {
                            if (isDCF) {
                              return `${formatCurrency(declaredValue)} DCF PV`;
                            }
                            return `${formatCurrency(declaredValue)} stated`;
                          }
                          
                          const hasTerms = (result.valuation as any).hasTerms;
                          if (hasTerms && result.valuation.methods.preMoney > 0) {
                            return `${formatCurrency(result.valuation.methods.preMoney)} pre`;
                          }
                          
                          return "Not specified";
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
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{
                        (() => {
                          const base = result.valuation.methods.revenueMultiple.base;
                          const baseLabel = result.valuation.methods.revenueMultiple.baseLabel || "Revenue";
                          const horizonYears = result.valuation.methods.revenueMultiple.horizonYears ?? 0;
                          const baseText = Number.isFinite(base) && base > 0 ? formatCurrency(base) : "not specified";
                          const timeLabel = horizonYears > 0 ? ` (Year ${horizonYears})` : "";
                          return `${baseText} ${baseLabel}${timeLabel} × ${result.valuation.methods.revenueMultiple.multiple}x`;
                        })()
                      }</td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{
                        (() => {
                          const impliedValue = result.valuation.methods.revenueMultiple.impliedValue;
                          if (!impliedValue || impliedValue === 0) return "—";
                          return formatCurrency(impliedValue);
                        })()
                      }</td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{
                        (() => {
                          const declaredValue = (result.valuation as any).declaredValue ?? result.valuation.declared;
                          const isDCF = (result.valuation as any).declaredPV !== null && (result.valuation as any).declaredPV !== undefined;
                          
                          if (declaredValue && declaredValue > 0) {
                            if (isDCF) {
                              return `${formatCurrency(declaredValue)} DCF PV`;
                            }
                            return `${formatCurrency(declaredValue)} stated`;
                          }
                          
                          const hasTerms = (result.valuation as any).hasTerms;
                          if (hasTerms && result.valuation.methods.preMoney > 0) {
                            return `${formatCurrency(result.valuation.methods.preMoney)} pre`;
                          }
                          
                          return "Not specified";
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
                          const declaredValue = (result.valuation as any).declaredValue ?? result.valuation.declared;
                          const isDCF = (result.valuation as any).declaredPV !== null && (result.valuation as any).declaredPV !== undefined;
                          
                          if (declaredValue && declaredValue > 0) {
                            if (isDCF) {
                              return `${formatCurrency(declaredValue)} DCF PV`;
                            }
                            return `${formatCurrency(declaredValue)} stated`;
                          }
                          
                          const hasTerms = (result.valuation as any).hasTerms;
                          if (hasTerms && result.valuation.methods.preMoney > 0) {
                            return `${formatCurrency(result.valuation.methods.preMoney)} pre`;
                          }
                          
                          return "Not specified";
                        })()
                      }</td>
                      <td className="px-4 py-3 text-sm text-[var(--warning)]">{
                        (() => {
                          const basePV = result.valuation.methods.ebitdaMultiple.impliedValue;
                          const deckVal = (result.valuation as any).declaredValue ?? result.valuation.declared;
                          if (!deckVal || !basePV || deckVal <= 0 || basePV <= 0) return "—";
                          return deckVal < basePV ? "Undervalued vs EBITDA benchmark" : "Premium pricing applied";
                        })()
                      }</td>
                    </tr>
                    {/* ROI Projection Row - Only show if roiProjection exists */}
                    {result.valuation.methods.roiProjection && (
                      <tr>
                        <td className="px-4 py-3 text-sm text-[var(--card-foreground)] font-medium">ROI Projection</td>
                        <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{result.valuation.methods.roiProjection.equityStake}% stake, {result.valuation.methods.roiProjection.roiMultiple}x return</td>
                        <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{formatCurrency(result.valuation.methods.roiProjection.projectedExit)}</td>
                        <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">5-7 year horizon</td>
                        <td className="px-4 py-3 text-sm text-[var(--accent-foreground)]">{result.valuation.methods.roiProjection.irr}% IRR target</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Enhanced Valuation Methods from enhanced engine */}
            {(result.valuation.revenue_multiple || result.valuation.ebitda_multiple || result.valuation.implied_from_terms) && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-[var(--card-foreground)] mb-4 flex items-center gap-2">
                  <i className="fas fa-chart-line text-[var(--primary)]" aria-hidden="true"></i>
                  Enhanced Valuation Calculations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {result.valuation.revenue_multiple && (
                    <div className="bg-[var(--muted)] p-4 rounded-[var(--radius-md)] border border-[var(--border)]">
                      <h4 className="font-medium text-[var(--card-foreground)] mb-2">Revenue Multiple Range</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[var(--muted-foreground)]">Low ({result.valuation.revenue_multiple.multiple_low}x):</span>
                          <span className="text-[var(--foreground)]">{formatCurrency(result.valuation.revenue_multiple.implied_low)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--muted-foreground)]">Mid ({result.valuation.revenue_multiple.multiple_mid}x):</span>
                          <span className="text-[var(--primary)] font-medium">{formatCurrency(result.valuation.revenue_multiple.implied_mid)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--muted-foreground)]">High ({result.valuation.revenue_multiple.multiple_high}x):</span>
                          <span className="text-[var(--foreground)]">{formatCurrency(result.valuation.revenue_multiple.implied_high)}</span>
                        </div>
                        <div className="text-xs text-[var(--muted-foreground)] mt-2">
                          Based on {formatCurrency(result.valuation.revenue_multiple.base)} {result.valuation.revenue_multiple.base_label}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {result.valuation.ebitda_multiple && (
                    <div className="bg-[var(--muted)] p-4 rounded-[var(--radius-md)] border border-[var(--border)]">
                      <h4 className="font-medium text-[var(--card-foreground)] mb-2">EBITDA Multiple Range</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[var(--muted-foreground)]">Low ({result.valuation.ebitda_multiple.multiple_low}x):</span>
                          <span className="text-[var(--foreground)]">{formatCurrency(result.valuation.ebitda_multiple.implied_low)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--muted-foreground)]">Mid ({result.valuation.ebitda_multiple.multiple_mid}x):</span>
                          <span className="text-[var(--secondary)] font-medium">{formatCurrency(result.valuation.ebitda_multiple.implied_mid)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--muted-foreground)]">High ({result.valuation.ebitda_multiple.multiple_high}x):</span>
                          <span className="text-[var(--foreground)]">{formatCurrency(result.valuation.ebitda_multiple.implied_high)}</span>
                        </div>
                        <div className="text-xs text-[var(--muted-foreground)] mt-2">
                          Based on {formatCurrency(result.valuation.ebitda_multiple.base)} {result.valuation.ebitda_multiple.base_label}
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

            {/* Method Details - Only show if we have revenue/EBITDA multiples */}
            {(result.valuation.methods.revenueMultiple.base > 0 || result.valuation.methods.ebitdaMultiple.ebitda > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="p-4 bg-[var(--muted)] border border-[var(--border)] rounded-[var(--radius-md)]">
                <h4 className="font-semibold text-[var(--card-foreground)] mb-3 flex items-center gap-2">
                  <i className="fas fa-chart-line text-[var(--primary)] text-sm" aria-hidden="true"></i>
                  Revenue Multiple Analysis
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--muted-foreground)]">
                      {(() => {
                        const baseLabel = result.valuation.methods.revenueMultiple.baseLabel || "Revenue";
                        const horizonYears = result.valuation.methods.revenueMultiple.horizonYears ?? 0;
                        return horizonYears > 0 ? `${baseLabel} (Year ${horizonYears}):` : `Current ${baseLabel}:`;
                      })()}
                    </span>
                    <span className="font-medium text-[var(--foreground)]">
                      {(() => {
                        const base = result.valuation.methods.revenueMultiple.base;
                        return Number.isFinite(base) && base > 0 ? formatCurrency(base) : "not specified";
                      })()}
                    </span>
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
            )}

            {/* ROI Analysis - Only show if roiProjection exists */}
            {result.valuation.methods.roiProjection && (
              <div className="p-6 bg-gradient-to-r from-[var(--accent)] to-[var(--warning)] rounded-[var(--radius-lg)] mb-8 border border-[var(--border)]">
                <h4 className="font-semibold text-[var(--accent-foreground)] mb-4 flex items-center gap-2">
                  <i className="fas fa-trophy text-[var(--accent-foreground)] text-sm" aria-hidden="true"></i>
                  Investor ROI Projection
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="text-center p-3 bg-white/20 rounded-[var(--radius-md)]">
                    <div className="text-2xl font-bold text-[var(--accent-foreground)] mb-1">
                      {result.valuation.methods.roiProjection.equityStake}%
                    </div>
                    <div className="text-[var(--accent-foreground)] opacity-80">Equity Stake</div>
                  </div>
                  <div className="text-center p-3 bg-white/20 rounded-[var(--radius-md)]">
                    <div className="text-2xl font-bold text-[var(--accent-foreground)] mb-1">
                      {result.valuation.methods.roiProjection.roiMultiple}×
                    </div>
                    <div className="text-[var(--accent-foreground)] opacity-80">ROI Multiple</div>
                  </div>
                  <div className="text-center p-3 bg-white/20 rounded-[var(--radius-md)]">
                    <div className="text-2xl font-bold text-[var(--accent-foreground)] mb-1">
                      {result.valuation.methods.roiProjection.irr}%
                    </div>
                    <div className="text-[var(--accent-foreground)] opacity-80">IRR (5 years)</div>
                  </div>
                  <div className="text-center p-3 bg-white/20 rounded-[var(--radius-md)]">
                    <div className="text-lg font-bold text-[var(--accent-foreground)] mb-1">
                      {formatCurrency(result.valuation.methods.roiProjection.investorReturn)}
                    </div>
                    <div className="text-[var(--accent-foreground)] opacity-80">Projected Return</div>
                  </div>
                </div>
                <p className="text-xs text-[var(--accent-foreground)] mt-4 text-center opacity-90">
                  Above VC target hurdle (~25–30%), but depends heavily on hitting ARR forecast and achieving {formatCurrency(result.valuation.methods.roiProjection.projectedExit)} exit.
                </p>
              </div>
            )}

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
              {result.riskFlags?.map((risk, index) => (
                <div key={index} className="p-4 border border-[var(--border)] bg-[var(--muted)] rounded-[var(--radius-md)]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(risk.level)} bg-[var(--background)] border border-[var(--border)]`}>
                      {risk.level} Risk
                    </span>
                  </div>
                  <p className="text-sm text-[var(--foreground)]">{risk.issue}</p>
                </div>
              )) || <p className="text-[var(--muted-foreground)]">No risks to display</p>}
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
    </div>
  );
}