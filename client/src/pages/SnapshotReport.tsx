import { useRoute, Link, useLocation } from 'wouter';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { useRequestById } from '@/state/dueStore';
import businessesData from '../mocks/businesses.json';

export default function SnapshotReport() {
  // Try both route patterns - due diligence snapshots and business snapshots
  const [, dueDiligenceParams] = useRoute('/due-diligence/snapshot/:id');
  const [, businessParams] = useRoute('/snapshot/:id');
  const [, setLocation] = useLocation();
  
  // Use whichever route matched
  const params = dueDiligenceParams || businessParams;
  
  // Try to get due diligence request first
  const dueRequest = useRequestById(params?.id || '');
  
  // If no due diligence request, try business data (for backward compatibility)
  const business = !dueRequest ? businessesData.find(b => b.id === params?.id) : null;

  if (!dueRequest && !business) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Snapshot Not Found</h1>
          <Link href="/due-diligence">
            <Button>Back to Due Diligence</Button>
          </Link>
        </div>
      </div>
    );
  }

  // If we have a due diligence request but it's not completed, show appropriate message
  if (dueRequest && (!dueRequest.result || dueRequest.status !== 'completed')) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {dueRequest.status === 'processing' ? 'Analysis In Progress' : 
             dueRequest.status === 'queued' ? 'Analysis Queued' :
             dueRequest.status === 'failed' ? 'Analysis Failed' : 'Snapshot Not Ready'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {dueRequest.status === 'processing' ? `Analysis is ${dueRequest.progress}% complete. Please check back shortly.` :
             dueRequest.status === 'queued' ? 'Your request is queued for processing.' :
             dueRequest.status === 'failed' ? 'The analysis failed. Please try submitting a new request.' :
             'The snapshot is not available yet.'}
          </p>
          <Link href={`/due-diligence/requests/${dueRequest.id}`}>
            <Button>View Request Details</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Use data from due diligence request or fallback to business data
  const companyData = dueRequest || business;
  
  // Generate mock business data structure for due diligence requests
  const mockBusinessFromDueRequest = dueRequest ? {
    id: dueRequest.id,
    name: dueRequest.companyName,
    ch_number: dueRequest.companyNumber || 'N/A',
    verified: true,
    sector: dueRequest.businessContext.industry,
    size: dueRequest.businessContext.size,
    employees: dueRequest.businessContext.size === 'Large' ? 250 : dueRequest.businessContext.size === 'Medium' ? 75 : 25,
    revenueBand: '£1m–£5m',
    location: dueRequest.businessContext.headquarters,
    foundedYear: 2019,
    risk: 'Low',
    eligibility: { EIS: true, SEIS: false },
    snapshot: {
      filingHealth: 'Good',
      lastFilingDate: '2025-05-02',
      directors: 3,
      webScore: 86,
      redFlags: 0,
      summary: dueRequest.result?.summary || 'Comprehensive due diligence analysis completed with strong verification across key business areas.',
      tags: ['Verified', 'Due Diligence Complete', 'Recommended'],
      detailedAssessment: {
        company: { score: 85, status: 'Strong' },
        complianceCheck: { score: 88, status: 'Excellent' },
        fraudRisk: { score: 92, status: 'Very Low' },
        financialHealth: { score: 78, status: 'Good' },
        management: { score: 89, status: 'Strong' },
        marketing: { score: 82, status: 'Good' },
        claimsManagement: { score: 86, status: 'Strong' },
        investorValidation: { score: 84, status: 'Strong' }
      }
    }
  } : null;
  
  // Hardcoded report for Unlock Services Limited (biz_045)
  const unlockHardcodedReport = {
    id: "biz_045",
    name: "Unlock Services Limited",
    ch_number: "15610723",
    verified: true,
    sector: "Legal Tech",
    size: "Micro",
    employees: 4,
    revenueBand: "Pre-revenue",
    location: "86–90 Paul Street, London, EC2A 4NE, UK",
    foundedYear: 2024,
    risk: "Low",
    eligibility: { EIS: false, SEIS: false },
    snapshot: {
      filingHealth: "Good",
      lastFilingDate: "2025-04-01",
      directors: 2,
      webScore: 88,
      redFlags: 0,
      summary: "Investor-first due diligence and discovery platform for alternative assets with clean governance and strong technical foundation.",
      tags: ["Legal Tech", "Due Diligence", "AI-Assisted", "Investor Tools"],
      detailedAssessment: {
        company: {
          score: 91,
          status: "Excellent",
          keyPoints: [
            "Clear problem–solution fit: investor-first due diligence with automation and explainability",
            "Lean, execution-focused team with rapid iteration velocity", 
            "Early partner pipeline across syndicates/advisors; strong narrative and positioning"
          ],
          concerns: [
            "Early-stage operational scale still to be proven at higher customer volumes"
          ]
        },
        complianceCheck: {
          score: 90,
          status: "Excellent",
          keyPoints: [
            "Active UK company; clean filing profile and on-time deadlines",
            "GDPR-ready data practices; clear role separation for data processors/controllers",
            "No County Court Judgments (CCJs) or registered charges identified at this stage"
          ],
          concerns: [
            "Requires ongoing vendor/processor audits as integrations expand (KYC, payments, data vendors)"
          ]
        },
        fraudRisk: {
          score: 88,
          status: "Strong",
          keyPoints: [
            "Transparent governance and founder identities; verifiable digital footprint",
            "Planned multi-source verification of claims (company filings, FCA registers, news) reduces spoofing",
            "Audit trail for report generation improves trust and tamper resistance"
          ],
          concerns: [
            "Third-party data dependencies introduce supply-chain risk; mitigated by source redundancy"
          ]
        },
        financialHealth: {
          score: 82,
          status: "Strong",
          keyPoints: [
            "Lean burn and modular product roadmap extend runway",
            "Multi-tier pricing with clear unit economics for 'Snapshot' vs 'Deep-dive' reports",
            "Early revenue opportunities via pilot cohorts and advisor partnerships"
          ],
          concerns: [
            "Pre-revenue/early-revenue stage; sensitivity to sales cycle length and partner activation"
          ]
        },
        management: {
          score: 90,
          status: "Excellent",
          keyPoints: [
            "Founder with strong product/strategy background and disciplined delivery culture",
            "Clear operating cadence (roadmap → experiments → evidence → release)",
            "Advisory bench forming across legal, venture, and data domains"
          ],
          concerns: [
            "Key-person risk typical of early teams; mitigation via hiring plan and documented processes"
          ]
        },
        marketing: {
          score: 84,
          status: "Strong",
          keyPoints: [
            "Compelling category story: 'evidence-led due diligence in hours, not weeks'",
            "Waitlist/community momentum among self-directed investors and syndicate leads",
            "Content flywheel planned (case studies, red-flag spotlights, valuation explainers)"
          ],
          concerns: [
            "Brand awareness still early; requires consistent thought leadership and partner distribution"
          ]
        },
        claimsManagement: {
          score: 86,
          status: "Strong",
          keyPoints: [
            "Structured claim extraction and source-backed validation in the product workflow",
            "Confidence scoring and red-flag taxonomy surface issues quickly",
            "Human-in-the-loop review keeps quality high for complex edge cases"
          ],
          concerns: [
            "Ongoing need to tune false-positive/false-negative balance as data coverage widens"
          ]
        },
        investorValidation: {
          score: 89,
          status: "Strong",
          keyPoints: [
            "Positive early feedback from angels/advisors on speed, clarity, and transparency",
            "Demonstrable willingness to pay for time-to-insight and standardised outputs",
            "Syndicate and challenger-bank use cases expand TAM beyond single-investor tools"
          ],
          concerns: [
            "Enterprise procurement cycles may lengthen conversion without targeted champions"
          ]
        }
      }
    },
    customContent: {
      executiveSummary: "Unlock is a Legal Tech platform delivering investor-grade due diligence in a fraction of the time. The product combines structured claim extraction, multi-source verification, and transparent confidence scoring to produce audit-ready reports that investors can trust. Early signals indicate strong resonance with self-directed investors and syndicate leads seeking faster, clearer decisions.\n\nGovernance and compliance are clean, with an on-time filing profile and a thoughtful approach to data protection. While the business is early-stage, the operating model is capital-efficient, the roadmap is focused on high-value workflows (Snapshot → Deep-dive), and partnerships offer near-term revenue pathways. Execution risk remains typical of the stage, but the team's cadence and evidence-first mindset are encouraging.",
      investmentHighlights: [
        "Compelling painkiller: speeds up and standardises due diligence with explainable outputs",
        "Strong early community interest and partner pipeline in angel/syndicate ecosystems", 
        "Lean operating model with clear pricing tiers and attractive unit economics",
        "Differentiated trust features: red-flags, confidence scores, and source citations",
        "Extendable platform: modules for valuation notes, claims tracking, and portfolio monitoring"
      ],
      riskFactors: [
        "Early-stage adoption risk: requires consistent GTM execution and partner activation",
        "Third-party data/regulatory dependencies necessitate ongoing vendor governance"
      ],
      finalRecommendation: "Favourable. Proceed with a structured pilot and milestone-based seed commitment. Prioritise conversions within existing investor communities, formalise two data-provider redundancies, and publish 2–3 flagship case studies to cement credibility. Assuming pilot KPIs are met (time-to-report, NPS, paid conversions), scale into syndicate and advisor channels."
    }
  };

  // Use hardcoded report for Unlock Services Limited, otherwise use dynamic system
  const reportData = business?.id === "biz_045" ? unlockHardcodedReport : 
                     dueRequest ? mockBusinessFromDueRequest : business;

  const calculateOverallScore = () => {
    if (!reportData?.snapshot?.detailedAssessment) return 75;
    const sections = Object.values(reportData.snapshot.detailedAssessment);
    const totalScore = sections.reduce((sum, section) => sum + section.score, 0);
    return Math.round(totalScore / sections.length);
  };

  const getStarRating = (score: number) => {
    const rating = Math.round((score / 100) * 5);
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<i key={i} className="fas fa-star text-[#F8D49B]" aria-hidden="true"></i>);
      } else {
        stars.push(<i key={i} className="far fa-star text-gray-300 dark:text-gray-600" aria-hidden="true"></i>);
      }
    }
    return stars;
  };

  const getVerificationLevel = (score: number) => {
    if (score >= 80) return { 
      level: 'Reliable Verification', 
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    };
    if (score >= 60) return { 
      level: 'Conditional Verification', 
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-900/20'
    };
    return { 
      level: 'Critical Review Recommended', 
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20'
    };
  };

  const getRecommendationText = (score: number) => {
    if (score >= 90) return 'Highly Recommended';
    if (score >= 80) return 'Recommended';
    if (score >= 70) return 'Consider with Caution';
    if (score >= 60) return 'Further Review Required';
    return 'Critical Review Recommended';
  };

  const ddCategories = [
    {
      id: 'company',
      title: 'Company',
      data: reportData?.snapshot?.detailedAssessment?.company || { score: 85, status: 'Strong' },
      icon: 'fas fa-building',
      description: 'Business registration, structure, and operational legitimacy assessment'
    },
    {
      id: 'complianceCheck',
      title: 'Compliance Check',
      data: reportData?.snapshot?.detailedAssessment?.complianceCheck || { score: 88, status: 'Excellent' },
      icon: 'fas fa-shield-alt',
      description: 'Regulatory compliance, legal standing, and governance framework evaluation'
    },
    {
      id: 'fraudRisk',
      title: 'Fraud Risk Assessment',
      data: reportData?.snapshot?.detailedAssessment?.fraudRisk || { score: 92, status: 'Very Low' },
      icon: 'fas fa-user-shield',
      description: 'Background verification, transparency, and integrity risk analysis'
    },
    {
      id: 'financialHealth',
      title: 'Financial Health',
      data: reportData?.snapshot?.detailedAssessment?.financialHealth || { score: 78, status: 'Good' },
      icon: 'fas fa-chart-line',
      description: 'Revenue analysis, cash flow, profitability, and financial stability metrics'
    },
    {
      id: 'management',
      title: 'Directors and Key Personnel',
      data: reportData?.snapshot?.detailedAssessment?.management || { score: 89, status: 'Strong' },
      icon: 'fas fa-users',
      description: 'Leadership experience, team quality, and management capability assessment'
    },

    {
      id: 'claimsManagement',
      title: 'Claims Management',
      data: reportData?.snapshot?.detailedAssessment?.claimsManagement || { score: 86, status: 'Strong' },
      icon: 'fas fa-file-contract',
      description: 'Insurance coverage, legal risk management, and claims handling processes'
    },
    {
      id: 'investorValidation',
      title: 'Investor Validation',
      data: reportData?.snapshot?.detailedAssessment?.investorValidation || { score: 84, status: 'Strong' },
      icon: 'fas fa-handshake',
      description: 'Previous funding rounds, investor quality, and validation credentials'
    }
  ];

  const overallScore = calculateOverallScore();

  const displayName = reportData?.name || 'Company';
  const displayNumber = reportData?.ch_number || 'N/A';
  const backUrl = dueRequest ? '/due-diligence' : '/businesses';

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="flex-1">
        {/* Header Section */}
        <div className="bg-[var(--primary)] text-white py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Link href={backUrl}>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="text-white border-white/40 hover:bg-white/20 bg-white/10 font-medium"
                    >
                      <i className="fas fa-arrow-left mr-2" aria-hidden="true"></i>
                      Back
                    </Button>
                  </Link>
                  <h1 className="text-2xl font-bold">UNLOCK</h1>
                  <span className="text-lg font-medium">Due Diligence Snapshot</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white/10 rounded-lg p-3">
                    <span className="text-white/70 block">Company</span>
                    <div className="font-semibold text-lg">{displayName}</div>
                    <div className="text-xs text-white/60">CH: {displayNumber}</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <span className="text-white/70 block">Report Generated</span>
                    <div className="font-semibold">{new Date().toLocaleDateString('en-GB', { 
                      day: 'numeric',
                      month: 'long', 
                      year: 'numeric' 
                    })}</div>
                    <div className="text-xs text-white/60">v1.0 • System Generated</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <span className="text-white/70 block">Assessment Score</span>
                    <div className="font-semibold text-lg">{(overallScore / 20).toFixed(1)}/5.0</div>
                    <div className="text-xs text-white/60">{getRecommendationText(overallScore)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation */}
          <nav className="mb-6 text-sm">
            <Link href={backUrl} className="text-[var(--primary)] hover:text-[var(--primary)]/80">
              {dueRequest ? 'Due Diligence' : 'Businesses'}
            </Link>
            <span className="text-[var(--muted-foreground)] mx-2">→</span>
            <span className="text-[var(--foreground)]">{displayName} Snapshot</span>
            <span className="text-gray-500 mx-2">→</span>
            <span className="text-gray-900 dark:text-gray-100">Due Diligence Snapshot</span>
          </nav>

          {/* Overall Assessment */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-[var(--primary)] text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Overall Assessment</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {(overallScore / 20).toFixed(1)}/5.0
                  </div>
                  <div className="flex items-center gap-1">
                    {getStarRating(overallScore)}
                  </div>
                  <div className={`font-medium ${getVerificationLevel(overallScore).color}`}>
                    {getRecommendationText(overallScore)}
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Verification Areas Completed
                </div>

                <div className="flex flex-wrap gap-2">
                  {ddCategories.map((category) => (
                    <span 
                      key={category.id}
                      className="px-3 py-1 bg-[var(--secondary)]/20 text-[var(--primary)] text-xs rounded-full font-medium"
                    >
                      {category.title}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Data Quality</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">Excellent</div>
              </div>
            </div>
          </div>

          {/* Analysis Report */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-[var(--primary)] text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Analysis Report</h2>
            </div>

            {/* Due Diligence Scorecard */}
            <div className="bg-[var(--primary)] text-white p-6 rounded-xl mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-white/20 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  <i className="fas fa-clipboard-list" aria-hidden="true"></i>
                </div>
                <h3 className="font-semibold">Due Diligence Scorecard</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-4 px-3 font-semibold">Due Diligence Area</th>
                      <th className="text-center py-4 px-3 font-semibold">Score</th>
                      <th className="text-left py-4 px-3 font-semibold">Assessment Summary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ddCategories.map((category, index) => (
                      <tr key={category.id} className={`${index !== ddCategories.length - 1 ? 'border-b border-white/10' : ''}`}>
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-2">
                            <i className={`${category.icon} text-white/70 w-4`} aria-hidden="true"></i>
                            <div>
                              <div className="font-semibold">{category.title}</div>
                              <div className="text-xs text-white/60">{category.data.status}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-3 text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            {getStarRating(category.data.score)}
                          </div>
                          <div className="text-xs text-white/70">{category.data.score}/100</div>
                        </td>
                        <td className="py-4 px-3 text-sm text-white/80">
                          {category.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Overall Assessment */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-[var(--primary)] text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Overall Assessment</h2>
            </div>

            <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300">
              <p className="mb-4">
                <strong className="text-gray-900 dark:text-gray-100">{reportData.name}</strong> presents a {getVerificationLevel(overallScore).level.toLowerCase()} investment opportunity based on completed due diligence analysis. The company demonstrates {overallScore >= 80 ? 'strong' : overallScore >= 60 ? 'moderate' : 'limited'} credibility across business verification, compliance standards, and operational frameworks.
              </p>
              
              <p className="mb-4">
                {overallScore >= 80 ? (
                  <>The assessment reveals robust performance across {ddCategories.filter(c => c.data.score >= 80).length} of 8 key areas, with particularly strong scores in management structure and business verification. The company's {reportData.sector} positioning, combined with its {reportData.employees}-person team and {reportData.revenueBand} revenue performance, indicates a well-established market presence.</>
                ) : overallScore >= 60 ? (
                  <>The evaluation identifies {ddCategories.filter(c => c.data.score >= 80).length} areas of strength alongside {8 - ddCategories.filter(c => c.data.score >= 80).length} categories requiring enhanced monitoring. While the core business fundamentals appear sound, additional verification steps are recommended to address compliance and operational gaps before proceeding with investment decisions.</>
                ) : (
                  <>The assessment highlights significant areas of concern across multiple due diligence categories. With only {ddCategories.filter(c => c.data.score >= 80).length} areas meeting reliability standards, comprehensive review and verification are essential before any investment consideration.</>
                )}
              </p>

              <p>
                The company's {reportData.eligibility?.EIS ? 'confirmed EIS eligibility' : 'pending EIS status'} and {reportData.eligibility?.SEIS ? 'SEIS qualification' : 'SEIS review process'} provide relevant tax advantages for qualifying investors. Risk assessment categorizes this opportunity as {(reportData.risk || 'moderate').toLowerCase()} risk, consistent with the overall verification score and market positioning within the {reportData.sector} sector.
              </p>
            </div>
          </div>

          {/* Section Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-[var(--primary)] text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Section Analysis</h2>
            </div>

            <div className="space-y-8">
              {ddCategories.map((category) => (
                <div key={category.id} className="border-l-4 border-gray-200 dark:border-gray-600 pl-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <i className={`${category.icon} text-gray-600 dark:text-gray-400 text-sm`} aria-hidden="true"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{category.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{category.data.score}/100</span>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          category.data.score >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          category.data.score >= 60 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {category.data.score >= 80 ? 'Reliable Verification' : 
                           category.data.score >= 60 ? 'Conditional Verification' : 
                           'Critical Review Recommended'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                    {/* Show custom key points if available, otherwise generic text */}
                    {(category.data as any)?.keyPoints && (category.data as any).keyPoints.length > 0 ? (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">KEY STRENGTHS:</h4>
                        <ul className="space-y-2">
                          {(category.data as any).keyPoints.map((point: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <i className="fas fa-check-circle text-green-600 dark:text-green-400 text-xs mt-1 flex-shrink-0" aria-hidden="true"></i>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">KEY FINDINGS:</h4>
                        <p>{category.description} Assessment shows {(category.data.status || 'standard').toLowerCase()} performance with verification score of {category.data.score}/100.</p>
                      </div>
                    )}

                    {/* Show custom concerns if available */}
                    {(category.data as any)?.concerns && (category.data as any).concerns.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">AREAS FOR ATTENTION:</h4>
                        <ul className="space-y-2">
                          {(category.data as any).concerns.map((concern: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <i className="fas fa-exclamation-circle text-amber-600 dark:text-amber-400 text-xs mt-1 flex-shrink-0" aria-hidden="true"></i>
                              <span>{concern}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Strategic implications - show generic text when no custom content */}
                    {!(category.data as any)?.keyPoints && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">STRATEGIC IMPLICATIONS:</h4>
                        <p>{category.data.score >= 80 ? 
                          `Strong performance in ${(category.title || 'this area').toLowerCase()} enhances overall investment confidence and reduces associated risks. This area demonstrates reliable verification standards that support positive valuation considerations.` :
                          category.data.score >= 60 ?
                          `Moderate performance in ${(category.title || 'this area').toLowerCase()} requires ongoing monitoring and potential enhancement. While meeting basic requirements, additional verification may strengthen investment positioning.` :
                          `${category.title} performance below optimal standards presents potential risk factors that warrant comprehensive review and remediation before investment consideration.`
                        }</p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">INVESTOR CONSIDERATIONS:</h4>
                      <p>{category.data.score >= 80 ?
                        `The strong verification score supports confidence in this area's reliability for investment decision-making. Recommended for inclusion in positive investment thesis development.` :
                        category.data.score >= 60 ?
                        `Moderate verification levels suggest standard due diligence protocols are adequate, with periodic review recommended to maintain investment confidence.` :
                        `Below-threshold performance requires enhanced due diligence and potential risk mitigation strategies before proceeding with investment decisions.`
                      }</p>
                    </div>

                    {category.data.score < 80 && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">RISK MITIGATION:</h4>
                        <p>{category.data.score >= 60 ?
                          `Standard monitoring protocols and periodic verification updates recommended to maintain acceptable risk levels in ${(category.title || 'this area').toLowerCase()}.` :
                          `Comprehensive review and remediation required in ${(category.title || 'this area').toLowerCase()} before investment consideration. Enhanced verification processes essential for risk management.`
                        }</p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">BENCHMARKING:</h4>
                      <p>Verification score of {category.data.score}/100 compares {category.data.score >= 80 ? 'favorably' : category.data.score >= 60 ? 'adequately' : 'below standard'} to industry benchmarks for {(reportData.sector || 'comparable').toLowerCase()} companies of similar size and maturity stage.</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Investment Thesis */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-[var(--primary)] text-white rounded-full flex items-center justify-center text-sm font-bold">5</div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Investment Thesis</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Competitive Strengths */}
              <div className="p-6 bg-white dark:bg-gray-700 border border-green-200 dark:border-green-700 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <i className="fas fa-thumbs-up text-green-600 dark:text-green-400 text-sm" aria-hidden="true"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Competitive Strengths</h3>
                </div>
                <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-3">
                    <i className="fas fa-check text-green-600 dark:text-green-400 text-xs mt-1 flex-shrink-0" aria-hidden="true"></i>
                    Strong verification across {ddCategories.filter(c => c.data.score >= 80).length} core business areas
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="fas fa-check text-green-600 dark:text-green-400 text-xs mt-1 flex-shrink-0" aria-hidden="true"></i>
                    {reportData?.snapshot?.summary}
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="fas fa-check text-green-600 dark:text-green-400 text-xs mt-1 flex-shrink-0" aria-hidden="true"></i>
                    Established {reportData?.sector} market presence since {reportData?.foundedYear}
                  </li>
                </ul>
              </div>

              {/* Key Concerns */}
              <div className="p-6 bg-white dark:bg-gray-700 border border-amber-200 dark:border-amber-700 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                    <i className="fas fa-exclamation-triangle text-amber-600 dark:text-amber-400 text-sm" aria-hidden="true"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Areas for Review</h3>
                </div>
                <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  {overallScore < 80 ? (
                    <>
                      <li className="flex items-start gap-3">
                        <i className="fas fa-circle text-amber-600 dark:text-amber-400 text-xs mt-1 flex-shrink-0" aria-hidden="true"></i>
                        {8 - ddCategories.filter(c => c.data.score >= 80).length} categories require enhanced monitoring
                      </li>
                      <li className="flex items-start gap-3">
                        <i className="fas fa-circle text-amber-600 dark:text-amber-400 text-xs mt-1 flex-shrink-0" aria-hidden="true"></i>
                        Due diligence completion recommended before investment
                      </li>
                    </>
                  ) : (
                    <li className="flex items-start gap-3">
                      <i className="fas fa-circle text-amber-600 dark:text-amber-400 text-xs mt-1 flex-shrink-0" aria-hidden="true"></i>
                      Standard ongoing monitoring protocols sufficient
                    </li>
                  )}
                </ul>
              </div>

              {/* Market Opportunity */}
              <div className="p-6 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-[var(--primary)]/10 dark:bg-[var(--primary)]/20 rounded-full flex items-center justify-center">
                    <i className="fas fa-chart-line text-[var(--primary)] text-sm" aria-hidden="true"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Market Opportunity</h3>
                </div>
                <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  <p className="flex items-start gap-3">
                    <i className="fas fa-circle text-[var(--primary)] text-xs mt-1 flex-shrink-0" aria-hidden="true"></i>
                    {reportData?.sector} sector positioning with {reportData?.employees} team members
                  </p>
                  <p className="flex items-start gap-3">
                    <i className="fas fa-circle text-[var(--primary)] text-xs mt-1 flex-shrink-0" aria-hidden="true"></i>
                    Revenue band: {reportData?.revenueBand} demonstrates market traction
                  </p>
                </div>
              </div>

              {/* Investment Factors */}
              <div className="p-6 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-[var(--accent)]/20 dark:bg-[var(--accent)]/30 rounded-full flex items-center justify-center">
                    <i className="fas fa-coins text-[var(--accent)] dark:text-yellow-400 text-sm" aria-hidden="true"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Investment Factors</h3>
                </div>
                <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-3">
                    <i className="fas fa-circle text-[var(--accent)] dark:text-yellow-400 text-xs mt-1 flex-shrink-0" aria-hidden="true"></i>
                    {reportData?.eligibility?.EIS ? 'EIS eligible' : 'EIS eligibility pending'} • {reportData?.eligibility?.SEIS ? 'SEIS qualified' : 'SEIS under review'}
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="fas fa-circle text-[var(--accent)] dark:text-yellow-400 text-xs mt-1 flex-shrink-0" aria-hidden="true"></i>
                    Risk level: {reportData?.risk || 'Under Review'} based on current assessment
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="fas fa-circle text-[var(--accent)] dark:text-yellow-400 text-xs mt-1 flex-shrink-0" aria-hidden="true"></i>
                    Verification score supports {overallScore >= 80 ? 'premium' : 'standard'} valuation approach
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Custom Sections for Unlock Services Limited */}
          {reportData?.id === "biz_045" && (reportData as any)?.customContent && (
            <>
              {/* Executive Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-[var(--primary)] text-white rounded-full flex items-center justify-center text-sm font-bold">6</div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Executive Summary</h2>
                </div>
                
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {(reportData as any).customContent.executiveSummary}
                  </div>
                </div>
              </div>

              {/* Investment Highlights & Risk Factors */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Investment Highlights */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      <i className="fas fa-thumbs-up" aria-hidden="true"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Investment Highlights</h3>
                  </div>
                  
                  <ul className="space-y-4">
                    {(reportData as any).customContent.investmentHighlights.map((highlight: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Risk Factors */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      <i className="fas fa-exclamation-triangle" aria-hidden="true"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Risk Factors</h3>
                  </div>
                  
                  <ul className="space-y-4">
                    {(reportData as any).customContent.riskFactors.map((risk: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Final Recommendation */}
              <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-xl p-6 mb-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-white/20 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    <i className="fas fa-chart-line" aria-hidden="true"></i>
                  </div>
                  <h3 className="text-xl font-semibold">Investment Recommendation</h3>
                </div>
                
                <div className="text-white/90 leading-relaxed">
                  {(reportData as any).customContent.finalRecommendation}
                </div>
              </div>
            </>
          )}

          {/* Actionable Recommendations */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-[var(--primary)] text-white rounded-full flex items-center justify-center text-sm font-bold">{reportData?.id === "biz_045" ? "7" : "6"}</div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Actionable Recommendations</h2>
            </div>

            <div className="space-y-4">
              <div className="p-5 bg-white dark:bg-gray-700 border border-red-200 dark:border-red-700 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <i className="fas fa-exclamation-triangle text-red-600 dark:text-red-400 text-sm" aria-hidden="true"></i>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">IMMEDIATE:</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 ml-11">Complete comprehensive verification across all due diligence categories</p>
              </div>

              <div className="p-5 bg-white dark:bg-gray-700 border border-amber-200 dark:border-amber-700 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                    <i className="fas fa-clock text-amber-600 dark:text-amber-400 text-sm" aria-hidden="true"></i>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">SHORT-TERM:</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 ml-11">Address identified compliance and verification gaps through enhanced monitoring</p>
              </div>

              <div className="p-5 bg-white dark:bg-gray-700 border border-blue-200 dark:border-blue-700 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <i className="fas fa-calendar-alt text-blue-600 dark:text-blue-400 text-sm" aria-hidden="true"></i>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">LONG-TERM:</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 ml-11">Establish ongoing monitoring and verification processes for sustained compliance</p>
              </div>
            </div>
          </div>

          {/* Risk Assessment Matrix */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-[var(--primary)] text-white rounded-full flex items-center justify-center text-sm font-bold">{reportData?.id === "biz_045" ? "8" : "7"}</div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Risk Assessment Matrix</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* High Risk */}
              <div className="p-6 bg-white dark:bg-gray-700 border border-red-200 dark:border-red-700 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <i className="fas fa-exclamation-triangle text-red-600 dark:text-red-400 text-sm" aria-hidden="true"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">High Risk</h3>
                </div>
                {overallScore < 60 ? (
                  <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-red-600 rounded-full inline-block mt-1.5 flex-shrink-0"></span>
                      Incomplete verification data
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-red-600 rounded-full inline-block mt-1.5 flex-shrink-0"></span>
                      Unverified compliance claims
                    </li>
                  </ul>
                ) : (
                  <p className="text-sm text-gray-700 dark:text-gray-300">No high-risk factors identified</p>
                )}
              </div>

              {/* Medium Risk */}
              <div className="p-6 bg-white dark:bg-gray-700 border border-amber-200 dark:border-amber-700 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                    <i className="fas fa-exclamation-circle text-amber-600 dark:text-amber-400 text-sm" aria-hidden="true"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Medium Risk</h3>
                </div>
                {overallScore >= 60 && overallScore < 80 ? (
                  <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-amber-600 rounded-full inline-block mt-1.5 flex-shrink-0"></span>
                      Areas for ongoing monitoring identified
                    </li>
                  </ul>
                ) : (
                  <p className="text-sm text-gray-700 dark:text-gray-300">Standard monitoring protocols sufficient</p>
                )}
              </div>

              {/* Low Risk */}
              <div className="p-6 bg-white dark:bg-gray-700 border border-green-200 dark:border-green-700 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <i className="fas fa-check-circle text-green-600 dark:text-green-400 text-sm" aria-hidden="true"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Low Risk</h3>
                </div>
                <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-green-600 rounded-full inline-block mt-1.5 flex-shrink-0"></span>
                    Strong verification scores across categories
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-green-600 rounded-full inline-block mt-1.5 flex-shrink-0"></span>
                    Reliable compliance framework
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="mb-2">This report is generated based on available verification data and should be supplemented with additional due diligence.</p>
            <div className="flex justify-between items-center">
              <span>Processing Time: 4.1s | Report ID: snapshot_{reportData.id.replace('_', '')}{Date.now().toString().slice(-6)}</span>
              <span>Generated: {new Date().toLocaleDateString('en-US')} {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <p className="mt-2 italic">Due diligence based on data provided by the company and public sources. This snapshot is for initial screening purposes only.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Link href={dueRequest ? `/due-diligence/requests/${dueRequest.id}` : `/business/${reportData.id}`}>
              <Button variant="outline" size="lg" className="text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800">
                <i className="fas fa-arrow-left mr-2" aria-hidden="true"></i>
                Back to Profile
              </Button>
            </Link>
            <Button variant="outline" size="lg" disabled className="text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 cursor-not-allowed">
              <i className="fas fa-lock mr-2" aria-hidden="true"></i>
              Export PDF (Premium)
            </Button>
            <Button size="lg" className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white shadow-md">
              <i className="fas fa-share-alt mr-2" aria-hidden="true"></i>
              Share Report
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}