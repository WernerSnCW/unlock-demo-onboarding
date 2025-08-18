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
    strengths: string[];
    weaknesses: string[];
    questions: string[];
  }[];
  valuation: {
    declared: number;
    benchmarkMin: number;
    benchmarkMax: number;
    assessment: string;
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

  // Mock analysis function - in real app would call AI service
  const analyseDocument = async (uploadedFile: File) => {
    setIsAnalysing(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock result based on the specification
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
          strengths: ['Clear articulation of customer pain points', 'Supported by market research data'],
          weaknesses: ['Could benefit from specific customer validation quotes'],
          questions: ['How did you validate this problem with potential customers?']
        },
        {
          name: 'Solution Overview',
          status: 'Present',
          strengths: ['Product demo screenshots included', 'Clear feature differentiation'],
          weaknesses: ['Technical feasibility not addressed', 'No mention of IP or competitive moats'],
          questions: ['What technical barriers exist for competitors to replicate this?']
        },
        {
          name: 'Market Size (TAM/SAM/SOM)',
          status: 'Present',
          strengths: ['TAM figure with credible source (PwC 2023)', 'Market growth trends included'],
          weaknesses: ['No clear SAM or SOM breakdown', 'Regional market analysis missing'],
          questions: ['What percentage of SOM do you realistically aim to capture in 3 years?']
        },
        {
          name: 'Business Model',
          status: 'Present',
          strengths: ['Clear SaaS subscription model', 'Multiple revenue streams identified'],
          weaknesses: ['No unit economics provided', 'Pricing justification unclear'],
          questions: ['What is your average revenue per user and how does it trend?']
        },
        {
          name: 'Competition Analysis',
          status: 'Weak',
          strengths: ['Some competitive landscape mapping'],
          weaknesses: ['Missing key direct competitors', 'No competitive advantage analysis'],
          questions: ['How do you compete with established players like [Company X]?']
        },
        {
          name: 'Traction & Metrics',
          status: 'Present',
          strengths: ['User growth metrics shown', 'Revenue progression clear'],
          weaknesses: ['No cohort analysis', 'Customer retention metrics missing'],
          questions: ['What does your customer retention look like by cohort?']
        },
        {
          name: 'Financial Projections',
          status: 'Weak',
          strengths: ['5-year revenue forecast provided'],
          weaknesses: ['Growth assumptions not justified', 'Cost structure unclear'],
          questions: ['What drives your projected 300% YoY growth rate?']
        },
        {
          name: 'Team',
          status: 'Present',
          strengths: ['Relevant industry experience', 'Clear role definitions'],
          weaknesses: ['No advisory board mentioned', 'Key hires plan missing'],
          questions: ['What key hires do you plan in the next 12 months?']
        },
        {
          name: 'Funding Ask & Use of Funds',
          status: 'Present',
          strengths: ['Clear funding amount requested', 'High-level use of funds breakdown'],
          weaknesses: ['Detailed milestone mapping missing', 'Runway calculation not shown'],
          questions: ['What specific milestones will this funding achieve?']
        },
        {
          name: 'Exit Strategy',
          status: 'Missing',
          strengths: [],
          weaknesses: ['No exit strategy or comparable transactions mentioned'],
          questions: ['What is your 5-7 year exit strategy and potential acquirers?']
        }
      ],
      valuation: {
        declared: 10000000,
        benchmarkMin: 4200000,
        benchmarkMax: 6800000,
        assessment: 'Overvalued by ~35% compared to stage and sector peers'
      },
      riskFlags: [
        { level: 'High', issue: 'Missing exit strategy completely' },
        { level: 'Medium', issue: 'Financial projections appear optimistic' },
        { level: 'Medium', issue: 'Incomplete competitive analysis' },
        { level: 'Low', issue: 'No advisory board mentioned' }
      ]
    };

    setResult(mockResult);
    setIsAnalysing(false);
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

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#5193B3] to-[#62C4C3] rounded-2xl mb-4 shadow-lg">
          <i className="fas fa-file-powerpoint text-2xl text-white" aria-hidden="true"></i>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#5193B3] to-[#62C4C3] bg-clip-text text-transparent mb-3">
          Pitch Deck Analyser
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Upload your startup pitch deck to get detailed analysis, investor questions, and valuation benchmarking
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
          <i className="fas fa-upload text-[#5193B3]" aria-hidden="true"></i>
          Upload Pitch Deck
        </h2>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select PDF or PowerPoint file
          </label>
          <input
            type="file"
            accept=".pdf,.ppt,.pptx"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 dark:text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-medium
              file:bg-[#5193B3] file:text-white
              hover:file:bg-[#4A85A3] file:cursor-pointer
              border border-gray-300 dark:border-gray-600 rounded-lg p-3
              bg-gray-50 dark:bg-gray-700"
          />
        </div>

        {/* Optional Context */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sector (Optional)
            </label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Stage (Optional)
            </label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Select stage</option>
              <option value="pre-seed">Pre-Seed</option>
              <option value="seed">Seed</option>
              <option value="series-a">Series A</option>
              <option value="series-b">Series B</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Geography (Optional)
            </label>
            <select
              value={geography}
              onChange={(e) => setGeography(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
          className="w-full bg-gradient-to-r from-[#5193B3] to-[#62C4C3] hover:from-[#4A85A3] hover:to-[#58B4B3] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          <div className="bg-gradient-to-br from-[#5193B3]/5 via-white to-[#62C4C3]/5 dark:from-[#5193B3]/10 dark:via-gray-800 dark:to-[#62C4C3]/10 rounded-xl border border-[#5193B3]/20 dark:border-[#62C4C3]/20 p-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-3">
              <i className="fas fa-chart-bar text-[#5193B3]" aria-hidden="true"></i>
              Executive Summary
            </h2>

            {/* Overall Scores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#5193B3] mb-1">
                  {result.overallScore.completeness}/10
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completeness</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#62C4C3] mb-1">
                  {result.overallScore.clarity}/10
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Clarity</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#F8D49B] mb-1">
                  {result.overallScore.valuationPlausibility}/10
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Valuation Reality</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Strengths */}
              <div>
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                  <i className="fas fa-thumbs-up" aria-hidden="true"></i>
                  Top Strengths
                </h3>
                <ul className="space-y-2">
                  {result.executiveSummary.topStrengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <i className="fas fa-check text-green-600 mt-1 flex-shrink-0" aria-hidden="true"></i>
                      <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div>
                <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                  <i className="fas fa-exclamation-triangle" aria-hidden="true"></i>
                  Key Weaknesses
                </h3>
                <ul className="space-y-2">
                  {result.executiveSummary.topWeaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <i className="fas fa-times text-red-600 mt-1 flex-shrink-0" aria-hidden="true"></i>
                      <span className="text-gray-700 dark:text-gray-300">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Valuation Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-3">
              <i className="fas fa-pound-sign text-[#5193B3]" aria-hidden="true"></i>
              Valuation Snapshot
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-[#5193B3] mb-1">
                  {formatCurrency(result.valuation.declared)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Declared Valuation</div>
              </div>
              <div className="text-center p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                <div className="text-2xl font-bold text-[#62C4C3] mb-1">
                  {formatCurrency(result.valuation.benchmarkMin)}–{formatCurrency(result.valuation.benchmarkMax)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Benchmark Range</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  {result.valuation.assessment}
                </div>
              </div>
            </div>
          </div>

          {/* Investor Questions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-3">
              <i className="fas fa-question-circle text-[#5193B3]" aria-hidden="true"></i>
              Key Investor Questions
            </h2>

            <div className="space-y-3">
              {result.executiveSummary.investorQuestions.map((question, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-[#5193B3] text-white text-xs font-medium rounded-full flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">{question}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-3">
              <i className="fas fa-list-check text-[#5193B3]" aria-hidden="true"></i>
              Section-by-Section Analysis
            </h2>

            <div className="space-y-6">
              {result.sections.map((section, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      {section.name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(section.status)} bg-gray-100 dark:bg-gray-700`}>
                      {section.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Strengths */}
                    {section.strengths.length > 0 && (
                      <div>
                        <h4 className="font-medium text-green-700 dark:text-green-400 mb-2 text-sm">Strengths</h4>
                        <ul className="space-y-1">
                          {section.strengths.map((strength, idx) => (
                            <li key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                              <i className="fas fa-check text-green-600 mt-1 flex-shrink-0 text-xs" aria-hidden="true"></i>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Weaknesses */}
                    {section.weaknesses.length > 0 && (
                      <div>
                        <h4 className="font-medium text-red-700 dark:text-red-400 mb-2 text-sm">Areas for Improvement</h4>
                        <ul className="space-y-1">
                          {section.weaknesses.map((weakness, idx) => (
                            <li key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                              <i className="fas fa-exclamation text-red-600 mt-1 flex-shrink-0 text-xs" aria-hidden="true"></i>
                              {weakness}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Questions */}
                  {section.questions.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <h4 className="font-medium text-[#5193B3] mb-2 text-sm">Suggested Questions</h4>
                      <ul className="space-y-1">
                        {section.questions.map((question, idx) => (
                          <li key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                            <i className="fas fa-question text-[#5193B3] mt-1 flex-shrink-0 text-xs" aria-hidden="true"></i>
                            {question}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Risk Flags */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-3">
              <i className="fas fa-flag text-[#5193B3]" aria-hidden="true"></i>
              Risk Indicators
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.riskFlags.map((risk, index) => (
                <div key={index} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(risk.level)} bg-gray-100 dark:bg-gray-700`}>
                      {risk.level} Risk
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{risk.issue}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Export Analysis</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-[#5193B3] hover:bg-[#4A85A3] text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
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