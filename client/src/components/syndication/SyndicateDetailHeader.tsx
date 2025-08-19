import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

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
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
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
  
  const getValueProposition = () => {
    const sectorText = syndicate.sector.join(' & ').toLowerCase();
    const leadRecord = syndicate.lead.trackRecord.toLowerCase().includes('exit') ? 'proven exits' : 'strong track record';
    return `High-confidence ${sectorText} deal with ${leadRecord}`;
  };

  // Animate progress bar on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(syndicate.committedPct);
    }, 300);
    return () => clearTimeout(timer);
  }, [syndicate.committedPct]);

  return (
    <div className="space-y-6">
      {/* Value Proposition Banner */}
      <div className="bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 dark:from-[var(--primary)]/5 dark:to-[var(--secondary)]/5 rounded-xl p-4 border border-[var(--primary)]/20 dark:border-[var(--primary)]/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--primary)] text-white rounded-full flex items-center justify-center">
            <i className="fas fa-star text-sm" aria-hidden="true"></i>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Why Join This Syndicate?
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              {getValueProposition()}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
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

        {/* Enhanced Progress Visualization */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Funding Progress
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {formatCurrency(syndicate.targetRaiseGBP * syndicate.committedPct / 100)} of {formatCurrency(syndicate.targetRaiseGBP)}
            </div>
          </div>
          
          <div className="relative">
            {/* Progress bar background */}
            <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-lg transition-all duration-1000 ease-out"
                style={{ width: `${animatedProgress}%` }}
              />
            </div>
            
            {/* Milestone markers */}
            <div className="absolute top-0 left-0 w-full h-4 flex items-center">
              {[25, 50, 75, 100].map(milestone => (
                <div
                  key={milestone}
                  className="absolute flex flex-col items-center"
                  style={{ left: `${milestone}%` }}
                >
                  <div className={`w-1 h-4 ${animatedProgress >= milestone ? 'bg-white' : 'bg-gray-400'} rounded-full`} />
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 transform -translate-x-1/2">
                    {milestone}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lead Credibility Signals */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm">
              <i className="fas fa-user-tie" aria-hidden="true"></i>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Lead Investor: {syndicate.lead.alias}
              </h3>
              <div className="flex flex-wrap gap-2">
                {syndicate.lead.trackRecord.includes('4 exits') && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-xs rounded">
                    <i className="fas fa-check text-xs" aria-hidden="true"></i>
                    4 exits
                  </span>
                )}
                {syndicate.lead.trackRecord.includes('£25m+') && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 text-xs rounded">
                    <i className="fas fa-star text-xs" aria-hidden="true"></i>
                    £25m+ raised in prior deals
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded">
                  <i className="fas fa-shield-alt text-xs" aria-hidden="true"></i>
                  Verified track record
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}