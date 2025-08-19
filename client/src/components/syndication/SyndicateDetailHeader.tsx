interface Syndicate {
  id: string;
  businessId: string;
  company: string;
  sector: string[];
  verified: boolean;
  stage: string;
  targetRaiseGBP: number;
  committedPct: number;
  minChequeGBP: number;
  carryPct: number;
  mgmtFeePct: number;
  closingDate: string;
  eligibility: { EIS: boolean; SEIS: boolean };
  lead: { alias: string; trackRecord: string };
}

interface Business {
  id: string;
  name: string;
  sector: string;
  // Add other properties as needed
}

interface SyndicateDetailHeaderProps {
  syndicate: Syndicate;
  business?: Business;
  requested?: boolean;
}

export function SyndicateDetailHeader({ syndicate, business, requested = false }: SyndicateDetailHeaderProps) {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `£${(amount / 1000000).toFixed(1)}m`;
    }
    return `£${(amount / 1000).toFixed(0)}k`;
  };

  const getDaysUntilClosing = () => {
    const today = new Date();
    const closing = new Date(syndicate.closingDate);
    const diffTime = closing.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilClosing = getDaysUntilClosing();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {syndicate.company}
            </h1>
            {syndicate.verified && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-sm rounded-lg">
                <i className="fas fa-check-circle" aria-hidden="true"></i>
                Verified
              </span>
            )}
            {requested && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-sm rounded-lg">
                <i className="fas fa-clock" aria-hidden="true"></i>
                Requested
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {syndicate.sector.map((s) => (
              <span key={s} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded">
                {s}
              </span>
            ))}
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
              {syndicate.stage}
            </span>
          </div>
        </div>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <i className="fas fa-target text-[var(--primary)] text-lg" aria-hidden="true"></i>
          </div>
          <div className="text-xl font-bold text-[var(--primary)] mb-1">
            {formatCurrency(syndicate.targetRaiseGBP)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Target Raise</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <i className="fas fa-chart-line text-[var(--secondary)] text-lg" aria-hidden="true"></i>
          </div>
          <div className="text-xl font-bold text-[var(--secondary)] mb-1">
            {syndicate.committedPct}%
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Committed</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <i className="fas fa-pound-sign text-gray-600 dark:text-gray-400 text-lg" aria-hidden="true"></i>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
            {formatCurrency(syndicate.minChequeGBP)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Min Cheque</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <i className="fas fa-calendar-times text-gray-600 dark:text-gray-400 text-lg" aria-hidden="true"></i>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
            {daysUntilClosing}d
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Closes In</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <i className="fas fa-percentage text-[var(--accent)] text-lg" aria-hidden="true"></i>
          </div>
          <div className="text-lg font-bold text-[var(--accent)] mb-1">
            {syndicate.carryPct}%
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Carry</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <i className="fas fa-certificate text-gray-600 dark:text-gray-400 text-lg" aria-hidden="true"></i>
          </div>
          <div className="flex justify-center gap-1 mb-1">
            {syndicate.eligibility.EIS && (
              <span className="px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] text-xs rounded">EIS</span>
            )}
            {syndicate.eligibility.SEIS && (
              <span className="px-2 py-1 bg-[var(--secondary)]/10 text-[var(--secondary)] text-xs rounded">SEIS</span>
            )}
            {!syndicate.eligibility.EIS && !syndicate.eligibility.SEIS && (
              <span className="text-gray-400 text-xs">N/A</span>
            )}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Eligibility</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Commitment Progress</span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{syndicate.committedPct}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] h-3 rounded-full transition-all"
            style={{ width: `${Math.min(syndicate.committedPct, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Lead Info */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="flex items-center gap-3">
          <i className="fas fa-user-tie text-gray-600 dark:text-gray-400" aria-hidden="true"></i>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {syndicate.lead.alias}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {syndicate.lead.trackRecord}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}