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
  snapshot: {
    filingHealth: string;
    summary: string;
  };
  community: {
    syndicateInterestPct: number;
    questionsCount: number;
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{business.name}</h3>
            {business.verified ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-xs rounded-md">
                <i className="fas fa-check-circle" aria-hidden="true"></i>
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-md">
                <i className="fas fa-exclamation-triangle" aria-hidden="true"></i>
                Unverified
              </span>
            )}
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded-md">
              {business.sector}
            </span>
            <span className={`px-2 py-1 text-xs rounded-md ${getRiskColor(business.risk)}`}>
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

      {/* Snapshot Summary */}
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
        {business.snapshot.summary}
      </p>

      {/* Community Stats */}
      <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <i className="fas fa-chart-bar text-[#5193B3]" aria-hidden="true"></i>
          <span>Peers {business.community.syndicateInterestPct}%</span>
        </div>
        <div className="flex items-center gap-1">
          <i className="fas fa-question-circle text-[#62C4C3]" aria-hidden="true"></i>
          <span>{business.community.questionsCount} questions</span>
        </div>
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