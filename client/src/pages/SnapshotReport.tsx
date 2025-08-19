import { useRoute, Link } from 'wouter';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import businessesData from '../mocks/businesses.json';

export default function SnapshotReport() {
  const [, params] = useRoute('/snapshot/:id');
  const business = businessesData.find(b => b.id === params?.id);

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Business Not Found</h1>
          <Link href="/businesses">
            <Button>Back to Businesses</Button>
          </Link>
        </div>
      </div>
    );
  }

  const calculateOverallScore = () => {
    if (!business.snapshot.detailedAssessment) return 75;
    const sections = Object.values(business.snapshot.detailedAssessment);
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
      data: business.snapshot.detailedAssessment?.company || { score: 75, status: 'Good' },
      icon: 'fas fa-building',
      description: 'Business registration, structure, and operational legitimacy assessment'
    },
    {
      id: 'complianceCheck',
      title: 'Compliance Check',
      data: business.snapshot.detailedAssessment?.complianceCheck || { score: 75, status: 'Good' },
      icon: 'fas fa-shield-alt',
      description: 'Regulatory compliance, legal standing, and governance framework evaluation'
    },
    {
      id: 'fraudRisk',
      title: 'Fraud Risk Assessment',
      data: business.snapshot.detailedAssessment?.fraudRisk || { score: 90, status: 'Very Low' },
      icon: 'fas fa-user-shield',
      description: 'Background verification, transparency, and integrity risk analysis'
    },
    {
      id: 'financialHealth',
      title: 'Financial Health',
      data: business.snapshot.detailedAssessment?.financialHealth || { score: 75, status: 'Good' },
      icon: 'fas fa-chart-line',
      description: 'Revenue analysis, cash flow, profitability, and financial stability metrics'
    },
    {
      id: 'management',
      title: 'Management',
      data: business.snapshot.detailedAssessment?.management || { score: 85, status: 'Strong' },
      icon: 'fas fa-users',
      description: 'Leadership experience, team quality, and management capability assessment'
    },
    {
      id: 'marketing',
      title: 'Marketing & Brand Management',
      data: business.snapshot.detailedAssessment?.marketing || { score: 75, status: 'Good' },
      icon: 'fas fa-bullhorn',
      description: 'Market presence, brand strength, and marketing strategy effectiveness'
    },
    {
      id: 'claimsManagement',
      title: 'Claims Management',
      data: business.snapshot.detailedAssessment?.claimsManagement || { score: 85, status: 'Strong' },
      icon: 'fas fa-file-contract',
      description: 'Insurance coverage, legal risk management, and claims handling processes'
    },
    {
      id: 'investorValidation',
      title: 'Investor Validation',
      data: business.snapshot.detailedAssessment?.investorValidation || { score: 85, status: 'Strong' },
      icon: 'fas fa-handshake',
      description: 'Previous funding rounds, investor quality, and validation credentials'
    }
  ];

  const overallScore = calculateOverallScore();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1">
        {/* Header Section */}
        <div className="bg-[var(--primary)] text-white py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Button 
                    onClick={() => window.history.back()}
                    variant="outline"
                    size="sm"
                    className="text-white border-white/40 hover:bg-white/20 bg-white/10 font-medium"
                  >
                    <i className="fas fa-arrow-left mr-2" aria-hidden="true"></i>
                    Back
                  </Button>
                  <h1 className="text-2xl font-bold">UNLOCK</h1>
                  <span className="text-lg font-medium">Due Diligence Snapshot</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white/10 rounded-lg p-3">
                    <span className="text-white/70 block">Company</span>
                    <div className="font-semibold text-lg">{business.name}</div>
                    <div className="text-xs text-white/60">CH: {business.ch_number}</div>
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
            <Link href="/businesses" className="text-[#5193B3] hover:text-[#4082a2]">
              Businesses
            </Link>
            <span className="text-gray-500 mx-2">→</span>
            <Link href={`/business/${business.id}`} className="text-[#5193B3] hover:text-[#4082a2]">
              {business.name}
            </Link>
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

          {/* Investment Thesis */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-[var(--primary)] text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
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
                    {business.snapshot.summary}
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="fas fa-check text-green-600 dark:text-green-400 text-xs mt-1 flex-shrink-0" aria-hidden="true"></i>
                    Established {business.sector} market presence since {business.foundedYear}
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
                    {business.sector} sector positioning with {business.employees} team members
                  </p>
                  <p className="flex items-start gap-3">
                    <i className="fas fa-circle text-[var(--primary)] text-xs mt-1 flex-shrink-0" aria-hidden="true"></i>
                    Revenue band: {business.revenueBand} demonstrates market traction
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
                    {business.eligibility?.EIS ? 'EIS eligible' : 'EIS eligibility pending'} • {business.eligibility?.SEIS ? 'SEIS qualified' : 'SEIS under review'}
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="fas fa-circle text-[var(--accent)] dark:text-yellow-400 text-xs mt-1 flex-shrink-0" aria-hidden="true"></i>
                    Risk level: {business.risk} based on current assessment
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="fas fa-circle text-[var(--accent)] dark:text-yellow-400 text-xs mt-1 flex-shrink-0" aria-hidden="true"></i>
                    Verification score supports {overallScore >= 80 ? 'premium' : 'standard'} valuation approach
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-[var(--primary)] text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
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
              <div className="w-8 h-8 bg-[var(--primary)] text-white rounded-full flex items-center justify-center text-sm font-bold">5</div>
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
              <span>Processing Time: 4.1s | Report ID: snapshot_{business.id.replace('_', '')}{Date.now().toString().slice(-6)}</span>
              <span>Generated: {new Date().toLocaleDateString('en-US')} {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <p className="mt-2 italic">Due diligence based on data provided by the company and public sources. This snapshot is for initial screening purposes only.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Link href={`/business/${business.id}`}>
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