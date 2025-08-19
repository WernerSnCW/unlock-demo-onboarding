import { useRoute, Link } from 'wouter';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { CommunityPanel } from '@/components/community/CommunityPanel';

import businessesData from '../mocks/businesses.json';

export default function BusinessProfile() {
  const [, params] = useRoute('/business/:id');
  const business = businessesData.find(b => b.id === params?.id);

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="flex-1">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Business Not Found
              </h1>
              <Link href="/businesses" className="text-[#5193B3] hover:text-[#4082a2]">
                ← Back to Directory
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getFilingHealthColor = (health: string) => {
    switch (health) {
      case 'Good': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Watch': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Poor': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getVerificationLevel = (score: number) => {
    if (score >= 80) return { 
      level: 'Reliable Verification', 
      color: 'text-green-600 dark:text-green-400',
      icon: 'fas fa-lock',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    };
    if (score >= 60) return { 
      level: 'Conditional Verification', 
      color: 'text-amber-600 dark:text-amber-400',
      icon: 'fas fa-lock',
      bgColor: 'bg-amber-100 dark:bg-amber-900/20'
    };
    return { 
      level: 'Critical Review Recommended', 
      color: 'text-red-600 dark:text-red-400',
      icon: 'fas fa-lock',
      bgColor: 'bg-red-100 dark:bg-red-900/20'
    };
  };

  const getScoreFromStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'excellent': return 95;
      case 'very low': return 95;
      case 'strong': return 85;
      case 'good': return 75;
      case 'watch': return 60;
      case 'moderate': return 60;
      default: return 50;
    }
  };

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

  const getRecommendationText = (score: number) => {
    if (score >= 90) return 'Highly Recommended';
    if (score >= 80) return 'Recommended';
    if (score >= 70) return 'Consider with Caution';
    if (score >= 60) return 'Further Review Required';
    return 'Critical Review Recommended';
  };

  const getRecommendationColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-blue-600 dark:text-blue-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const currentYear = new Date().getFullYear();
  const companyAge = currentYear - business.foundedYear;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumbs */}
          <nav className="mb-6 text-sm">
            <Link href="/businesses" className="text-[#5193B3] hover:text-[#4082a2]">
              Businesses
            </Link>
            <span className="text-gray-500 mx-2">→</span>
            <span className="text-gray-600 dark:text-gray-400">{business.sector}</span>
            <span className="text-gray-500 mx-2">→</span>
            <span className="text-gray-900 dark:text-gray-100">{business.name}</span>
          </nav>

          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {business.name}
                  </h1>
                  {business.verified ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-sm rounded-lg">
                      <i className="fas fa-check-circle" aria-hidden="true"></i>
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm rounded-lg">
                      <i className="fas fa-exclamation-triangle" aria-hidden="true"></i>
                      Unverified
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-gray-600 dark:text-gray-400">Companies House:</span>
                  <code className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1 rounded text-sm font-mono">
                    {business.ch_number}
                  </code>
                  <Button variant="ghost" size="sm" className="px-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                    <i className="fas fa-copy" aria-hidden="true"></i>
                  </Button>
                </div>

                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-sm rounded-lg">
                    {business.sector}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg">
                    {business.location}
                  </span>
                  <span className={`px-3 py-1 text-sm rounded-lg ${getRiskColor(business.risk)}`}>
                    {business.risk} Risk
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Facts Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Key Facts</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#5193B3] mb-1">{companyAge}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Years Old</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#62C4C3] mb-1">{business.employees}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{business.size}</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center gap-1 mb-1">
                  {business.eligibility.EIS && (
                    <span className="px-2 py-1 bg-[#5193B3]/10 text-[#5193B3] text-xs rounded">EIS</span>
                  )}
                  {business.eligibility.SEIS && (
                    <span className="px-2 py-1 bg-[#62C4C3]/10 text-[#62C4C3] text-xs rounded">SEIS</span>
                  )}
                  {!business.eligibility.EIS && !business.eligibility.SEIS && (
                    <span className="text-gray-400 text-xs">N/A</span>
                  )}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Eligibility</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {new Date(business.snapshot.lastFilingDate).toLocaleDateString()}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Last Filing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#F8D49B] mb-1">{business.snapshot.directors}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Directors</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">{business.revenueBand}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Revenue</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Snapshot Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <i className="fas fa-camera text-[#5193B3]" aria-hidden="true"></i>
                  Snapshot Summary
                </h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Generated: {new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
              </div>

              {/* Overall Assessment Score */}
              <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {(calculateOverallScore() / 20).toFixed(1)}/5.0
                    </span>
                    <div className="flex items-center gap-1">
                      {getStarRating(calculateOverallScore())}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className={`${getVerificationLevel(calculateOverallScore()).icon} ${getVerificationLevel(calculateOverallScore()).color}`} aria-hidden="true"></i>
                    <span className={`text-sm font-medium ${getVerificationLevel(calculateOverallScore()).color}`}>
                      {getVerificationLevel(calculateOverallScore()).level}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Overall Investment Assessment Score
                </div>
              </div>

              {/* Investment Summary */}
              <div className="mb-4 p-4 bg-white dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  <strong className="text-gray-900 dark:text-gray-100">{business.name}</strong> presents a {getVerificationLevel(calculateOverallScore()).level.toLowerCase()} investment opportunity based on completed due diligence analysis. The company demonstrates {calculateOverallScore() >= 80 ? 'strong' : calculateOverallScore() >= 60 ? 'moderate' : 'limited'} credibility across business verification, compliance standards, and operational frameworks. {calculateOverallScore() >= 80 ? 'Key strengths include robust management structure and reliable financial positioning.' : calculateOverallScore() >= 60 ? 'Areas for consideration include enhanced compliance monitoring and risk management protocols.' : 'Significant concerns warrant comprehensive review before proceeding with investment decisions.'}
                </p>
              </div>
              
              <div className="space-y-3">
                {/* Company */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Company:</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {getStarRating(business.snapshot.detailedAssessment?.company?.score || 75)}
                    </div>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${getVerificationLevel(business.snapshot.detailedAssessment?.company?.score || 75).bgColor}`}>
                      <i className={`${getVerificationLevel(business.snapshot.detailedAssessment?.company?.score || 75).icon} ${getVerificationLevel(business.snapshot.detailedAssessment?.company?.score || 75).color}`} aria-hidden="true"></i>
                    </div>
                  </div>
                </div>

                {/* Compliance Check */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Compliance Check:</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {getStarRating(business.snapshot.detailedAssessment?.complianceCheck?.score || 75)}
                    </div>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${getVerificationLevel(business.snapshot.detailedAssessment?.complianceCheck?.score || 75).bgColor}`}>
                      <i className={`${getVerificationLevel(business.snapshot.detailedAssessment?.complianceCheck?.score || 75).icon} ${getVerificationLevel(business.snapshot.detailedAssessment?.complianceCheck?.score || 75).color}`} aria-hidden="true"></i>
                    </div>
                  </div>
                </div>

                {/* Fraud Risk Assessment */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Fraud Risk Assessment:</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {getStarRating(business.snapshot.detailedAssessment?.fraudRisk?.score || 90)}
                    </div>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${getVerificationLevel(business.snapshot.detailedAssessment?.fraudRisk?.score || 90).bgColor}`}>
                      <i className={`${getVerificationLevel(business.snapshot.detailedAssessment?.fraudRisk?.score || 90).icon} ${getVerificationLevel(business.snapshot.detailedAssessment?.fraudRisk?.score || 90).color}`} aria-hidden="true"></i>
                    </div>
                  </div>
                </div>

                {/* Financial Health */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Financial Health:</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {getStarRating(business.snapshot.detailedAssessment?.financialHealth?.score || 75)}
                    </div>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${getVerificationLevel(business.snapshot.detailedAssessment?.financialHealth?.score || 75).bgColor}`}>
                      <i className={`${getVerificationLevel(business.snapshot.detailedAssessment?.financialHealth?.score || 75).icon} ${getVerificationLevel(business.snapshot.detailedAssessment?.financialHealth?.score || 75).color}`} aria-hidden="true"></i>
                    </div>
                  </div>
                </div>

                {/* Management */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Management:</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {getStarRating(business.snapshot.detailedAssessment?.management?.score || 85)}
                    </div>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${getVerificationLevel(business.snapshot.detailedAssessment?.management?.score || 85).bgColor}`}>
                      <i className={`${getVerificationLevel(business.snapshot.detailedAssessment?.management?.score || 85).icon} ${getVerificationLevel(business.snapshot.detailedAssessment?.management?.score || 85).color}`} aria-hidden="true"></i>
                    </div>
                  </div>
                </div>

                {/* Marketing & Brand Management */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Marketing & Brand Management:</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {getStarRating(business.snapshot.detailedAssessment?.marketing?.score || 75)}
                    </div>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${getVerificationLevel(business.snapshot.detailedAssessment?.marketing?.score || 75).bgColor}`}>
                      <i className={`${getVerificationLevel(business.snapshot.detailedAssessment?.marketing?.score || 75).icon} ${getVerificationLevel(business.snapshot.detailedAssessment?.marketing?.score || 75).color}`} aria-hidden="true"></i>
                    </div>
                  </div>
                </div>

                {/* Claims Management */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Claims Management:</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {getStarRating(business.snapshot.detailedAssessment?.claimsManagement?.score || 85)}
                    </div>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${getVerificationLevel(business.snapshot.detailedAssessment?.claimsManagement?.score || 85).bgColor}`}>
                      <i className={`${getVerificationLevel(business.snapshot.detailedAssessment?.claimsManagement?.score || 85).icon} ${getVerificationLevel(business.snapshot.detailedAssessment?.claimsManagement?.score || 85).color}`} aria-hidden="true"></i>
                    </div>
                  </div>
                </div>

                {/* Investor Validation */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Investor Validation:</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {getStarRating(business.snapshot.detailedAssessment?.investorValidation?.score || 85)}
                    </div>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${getVerificationLevel(business.snapshot.detailedAssessment?.investorValidation?.score || 85).bgColor}`}>
                      <i className={`${getVerificationLevel(business.snapshot.detailedAssessment?.investorValidation?.score || 85).icon} ${getVerificationLevel(business.snapshot.detailedAssessment?.investorValidation?.score || 85).color}`} aria-hidden="true"></i>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {business.snapshot.summary}
                </p>
              </div>

              <Link href={`/snapshot/${business.id}`}>
                <Button className="w-full mt-4 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700" variant="outline">
                  Open Full Snapshot
                  <i className="fas fa-external-link-alt ml-2" aria-hidden="true"></i>
                </Button>
              </Link>
              
              <div className="flex gap-2 mt-3">
                <Button 
                  className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-not-allowed" 
                  variant="outline"
                  disabled
                >
                  <i className="fas fa-lock mr-2" aria-hidden="true"></i>
                  Export (Premium)
                </Button>
                <Button className="flex-1 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700" variant="outline">
                  <i className="fas fa-share-alt mr-2" aria-hidden="true"></i>
                  Share Link
                </Button>
              </div>
            </div>

            {/* Community */}
            <CommunityPanel business={business} />
          </div>




        </div>
      </main>
      <Footer />
    </div>
  );
}