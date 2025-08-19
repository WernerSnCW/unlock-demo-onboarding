import { useRoute, Link } from 'wouter';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
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
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <i className="fas fa-camera text-[#5193B3]" aria-hidden="true"></i>
                Snapshot Summary
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Filing Health:</span>
                  <span className={`px-2 py-1 text-xs rounded-lg ${getFilingHealthColor(business.snapshot.filingHealth)}`}>
                    {business.snapshot.filingHealth}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Web Score:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#5193B3] transition-all duration-300"
                        style={{ width: `${business.snapshot.webScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {business.snapshot.webScore}/100
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Red Flags:</span>
                  <span className={`text-sm font-medium ${
                    business.snapshot.redFlags === 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : business.snapshot.redFlags <= 2 
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {business.snapshot.redFlags}
                  </span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {business.snapshot.summary}
                </p>
              </div>

              <Button className="w-full mt-4 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700" variant="outline">
                Open Full Snapshot
                <i className="fas fa-external-link-alt ml-2" aria-hidden="true"></i>
              </Button>
            </div>

            {/* Community */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <i className="fas fa-users text-[#62C4C3]" aria-hidden="true"></i>
                Community
              </h2>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Syndicate Interest</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {business.community.syndicateInterestPct}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#5193B3] to-[#62C4C3] transition-all duration-500"
                      style={{ width: `${business.community.syndicateInterestPct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Peers short-listing this business
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Questions Asked</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {business.community.questionsCount}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                      "{business.community.lastQuestion}"
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button className="w-full bg-[#5193B3] hover:bg-[#4082a2] text-white">
                    <i className="fas fa-heart mr-2" aria-hidden="true"></i>
                    Follow
                  </Button>
                  <Button variant="outline" className="w-full text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <i className="fas fa-question-circle mr-2" aria-hidden="true"></i>
                    Ask a Question
                  </Button>
                  <Button variant="outline" className="w-full text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <i className="fas fa-comments mr-2" aria-hidden="true"></i>
                    Join Discussion
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap gap-4 mt-6">
            <Button size="lg" className="bg-[#5193B3] hover:bg-[#4082a2] text-white">
              <i className="fas fa-file-alt mr-2" aria-hidden="true"></i>
              Open Full Snapshot
            </Button>
            <Button variant="outline" size="lg" disabled className="text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600">
              <i className="fas fa-lock mr-2" aria-hidden="true"></i>
              Export (Premium)
            </Button>
            <Button variant="outline" size="lg" className="text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
              <i className="fas fa-share-alt mr-2" aria-hidden="true"></i>
              Share Link
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}