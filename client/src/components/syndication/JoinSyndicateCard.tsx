import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface JoinSyndicateCardProps {
  syndicate: {
    id: string;
    company: string;
    minChequeGBP: number;
    closingDate: string;
    carryPct: number;
    mgmtFeePct: number;
    verified: boolean;
  };
  onJoin: (syndicateId: string) => void;
}

export function JoinSyndicateCard({ syndicate, onJoin }: JoinSyndicateCardProps) {
  const [isJoining, setIsJoining] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

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

  const handleJoinClick = async () => {
    setIsJoining(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    onJoin(syndicate.id);
    setIsJoining(false);
  };

  const daysUntilClosing = getDaysUntilClosing();
  const isUrgent = daysUntilClosing <= 7;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Join Syndicate
        </h3>
        {syndicate.verified && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-xs rounded">
            <i className="fas fa-check-circle text-xs" aria-hidden="true"></i>
            Verified
          </span>
        )}
      </div>

      {/* Key Details */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Min Investment</span>
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(syndicate.minChequeGBP)}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Closing</span>
          <span className={`text-sm font-medium ${isUrgent ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
            {isUrgent && <i className="fas fa-exclamation-triangle mr-1" aria-hidden="true"></i>}
            {daysUntilClosing}d left
          </span>
        </div>
      </div>

      {/* Fee Structure - Collapsible */}
      <div className="mb-6">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <span>Fee Structure</span>
          <i className={`fas fa-chevron-${showDetails ? 'up' : 'down'} text-xs`} aria-hidden="true"></i>
        </button>
        
        {showDetails && (
          <div className="mt-3 space-y-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Carry</span>
              <span className="text-gray-900 dark:text-gray-100">{syndicate.carryPct}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Management Fee</span>
              <span className="text-gray-900 dark:text-gray-100">{syndicate.mgmtFeePct}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="space-y-3">
        <Button
          onClick={handleJoinClick}
          disabled={isJoining}
          className="w-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] hover:from-[var(--primary)]/90 hover:to-[var(--secondary)]/90 text-white font-medium py-3"
        >
          {isJoining ? (
            <span className="flex items-center gap-2">
              <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
              Processing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <i className="fas fa-handshake" aria-hidden="true"></i>
              Express Interest
            </span>
          )}
        </Button>
        
        <Button
          variant="outline"
          className="w-full border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <i className="fas fa-download mr-2" aria-hidden="true"></i>
          Download Terms
        </Button>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-start gap-2">
          <i className="fas fa-exclamation-triangle text-yellow-600 dark:text-yellow-400 text-sm mt-0.5" aria-hidden="true"></i>
          <p className="text-xs text-yellow-800 dark:text-yellow-300">
            <strong>Investment Risk:</strong> Capital at risk. Past performance is not indicative of future results. 
            This is not financial advice.
          </p>
        </div>
      </div>

      {/* Premium Feature Preview */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 rounded-lg border border-purple-200 dark:border-purple-700">
        <div className="flex items-center gap-2 mb-2">
          <i className="fas fa-crown text-purple-600 dark:text-purple-400" aria-hidden="true"></i>
          <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
            Premium Feature
          </span>
        </div>
        <p className="text-xs text-purple-800 dark:text-purple-200 mb-3">
          Get instant notifications when similar opportunities match your criteria
        </p>
        <Button
          size="sm"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs"
        >
          <i className="fas fa-star mr-1" aria-hidden="true"></i>
          Upgrade for Smart Alerts
        </Button>
      </div>
    </div>
  );
}