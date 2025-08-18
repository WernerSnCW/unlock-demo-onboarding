import { Link } from 'wouter';

interface Business {
  id: string;
  name: string;
  ch_number: string;
  verified: boolean;
  sector: string;
  size: string;
  risk: string;
  eligibility: { EIS: boolean; SEIS: boolean };
  revenueBand: string;
  employees: number;
  snapshot: {
    filingHealth: string;
    summary: string;
    tags?: string[];
  };
  community: {
    syndicateInterestPct: number;
    questionsCount: number;
    lastQuestion: string;
  };
}

interface BusinessCardProps {
  business: Business;
}

export default function BusinessCard({ business }: BusinessCardProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getRiskDot = (risk: string) => {
    switch (risk) {
      case 'Low': return '🟢';
      case 'Medium': return '🟡';
      case 'High': return '🔴';
      default: return '⚪';
    }
  };

  const getSectorIcon = (sector: string) => {
    switch (sector) {
      case 'Biotechnology': return '🧬';
      case 'Fintech': return '💳';
      case 'CleanTech': return '🌱';
      case 'HealthTech': return '🏥';
      case 'DeepTech': return '🧠';
      case 'Sustainable Materials': return '♻️';
      default: return '🏢';
    }
  };

  const getCompanyInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
  };

  const isHighInterest = business.community.syndicateInterestPct >= 70;
  const isTrending = business.community.questionsCount >= 15;
  
  const borderColor = business.verified 
    ? 'border-l-4 border-l-green-500 dark:border-l-green-400' 
    : 'border-l-4 border-l-gray-300 dark:border-l-gray-600';

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${borderColor} p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden`}>
      {/* Trending Badge */}
      {(isHighInterest || isTrending) && (
        <div className="absolute top-4 right-4">
          {isHighInterest && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs rounded-full font-medium shadow-sm">
              🔥 Hot
            </span>
          )}
          {isTrending && !isHighInterest && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-400 to-purple-500 text-white text-xs rounded-full font-medium shadow-sm">
              📈 Trending
            </span>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {/* Company Logo/Avatar */}
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#5193B3] to-[#62C4C3] rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
          {getCompanyInitials(business.name)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{business.name}</h3>
            {business.verified ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-xs rounded-md flex-shrink-0">
                <i className="fas fa-check-circle" aria-hidden="true"></i>
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-md flex-shrink-0">
                <i className="fas fa-exclamation-triangle" aria-hidden="true"></i>
                Unverified
              </span>
            )}
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded-md">
              <span className="text-sm">{getSectorIcon(business.sector)}</span>
              {business.sector}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md ${getRiskColor(business.risk)}`} title={`${business.risk} risk profile`}>
              <span>{getRiskDot(business.risk)}</span>
              {business.risk} Risk
            </span>
            {business.eligibility.EIS && (
              <span className="px-2 py-1 bg-[#5193B3]/10 text-[#5193B3] dark:bg-[#5193B3]/20 dark:text-[#5193B3] text-xs rounded-md">
                EIS
              </span>
            )}
            {business.eligibility.SEIS && (
              <span className="px-2 py-1 bg-[#62C4C3]/10 text-[#62C4C3] dark:bg-[#62C4C3]/20 dark:text-[#62C4C3] text-xs rounded-md">
                SEIS
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Snapshot Tags */}
      {business.snapshot.tags && business.snapshot.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {business.snapshot.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md"
            >
              {tag}
            </span>
          ))}
          {business.snapshot.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded-md">
              +{business.snapshot.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Snapshot Summary */}
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
        {business.snapshot.summary}
      </p>

      {/* Mini Financials */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{business.revenueBand}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Revenue</div>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{business.employees}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Employees</div>
        </div>
      </div>

      {/* Community Engagement with Visual Indicators */}
      <div className="space-y-3 mb-4">
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">Syndicate Interest</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{business.community.syndicateInterestPct}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#5193B3] to-[#62C4C3] transition-all duration-300"
              style={{ width: `${business.community.syndicateInterestPct}%` }}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <i className="fas fa-comments text-[#62C4C3]" aria-hidden="true"></i>
            <span className="text-gray-600 dark:text-gray-400">{business.community.questionsCount} questions</span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Last: "{business.community.lastQuestion.substring(0, 30)}..."</span>
        </div>
      </div>

      {/* Premium Differentiation */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
          <span>Valuation Range</span>
          <i className="fas fa-lock" aria-hidden="true"></i>
        </div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded blur-sm relative">
          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
            £••••m - £••••m
          </div>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-center">
          Upgrade to view detailed valuation analysis
        </p>
      </div>

      {/* CTA */}
      <Link
        href={`/business/${business.id}`}
        className="inline-flex items-center justify-center w-full px-4 py-2 bg-[#5193B3] hover:bg-[#4082a2] text-white text-sm font-medium rounded-lg transition-colors"
      >
        Open Profile
        <i className="fas fa-arrow-right ml-2" aria-hidden="true"></i>
      </Link>
    </div>
  );
}