import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

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
  closingDate: string;
  eligibility: { EIS: boolean; SEIS: boolean };
  lead: { alias: string; trackRecord: string };
  interest: {
    overallPct: number;
    likeYouPct: number;
    cohorts: { angels: number; funds: number; familyOffices: number };
    history: number[];
    confidenceScore: number;
  };
}

interface SyndicateCardProps {
  syndicate: Syndicate;
  onOpen?: () => void;
  searchTerm?: string;
}

export function SyndicateCard({ syndicate, onOpen, searchTerm }: SyndicateCardProps) {
  const [isWatched, setIsWatched] = useState(false);
  const [animatedCommitted, setAnimatedCommitted] = useState(0);
  const [animatedConfidence, setAnimatedConfidence] = useState(0);
  const { toast } = useToast();

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

  const getConfidenceLevel = (score: number) => {
    if (score >= 75) return { level: 'High', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-500' };
    if (score >= 50) return { level: 'Moderate', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-gradient-to-r from-yellow-400 to-green-400' };
    return { level: 'Low', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-400' };
  };

  const highlightText = (text: string, searchTerm?: string) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const createSparklineData = (data: number[]) => {
    if (data.length < 2) return { path: '', points: [] };
    const width = 120;
    const height = 24;
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - minValue) / range) * height;
      return { x, y, value };
    });
    
    const pathData = points.map((point, index) => 
      index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`
    ).join(' ');
    
    return { path: pathData, points };
  };

  const handleWatchToggle = () => {
    const newWatchState = !isWatched;
    setIsWatched(newWatchState);
    toast({
      title: newWatchState ? "Added to Watchlist (prototype)" : "Removed from Watchlist",
      description: newWatchState ? "You'll get updates on this syndicate" : "No longer watching this syndicate",
    });
  };

  const daysUntilClosing = getDaysUntilClosing();
  const confidence = getConfidenceLevel(syndicate.interest.confidenceScore);
  const committedAmount = (syndicate.targetRaiseGBP * syndicate.committedPct) / 100;

  // Animate progress bars on mount
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setAnimatedCommitted(syndicate.committedPct);
    }, 100);
    const timer2 = setTimeout(() => {
      setAnimatedConfidence(syndicate.interest.confidenceScore);
    }, 150);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [syndicate.committedPct, syndicate.interest.confidenceScore]);

  return (
    <article 
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 focus-within:ring-2 focus-within:ring-[var(--primary)]/20"
      aria-labelledby={`syndicate-${syndicate.id}-title`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        {/* Company Logo Placeholder */}
        <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">
            {syndicate.company.charAt(0)}
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 
              id={`syndicate-${syndicate.id}-title`}
              className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate"
            >
              {highlightText(syndicate.company, searchTerm)}
            </h3>
            {syndicate.verified && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-xs rounded">
                <i className="fas fa-check-circle" aria-hidden="true"></i>
                Verified
              </span>
            )}
          </div>
          
          {/* Sector Tags */}
          <div className="flex flex-wrap gap-1">
            {syndicate.sector.map((s) => (
              <span key={s} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Watch Button */}
        <button
          onClick={handleWatchToggle}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
          title={isWatched ? "Remove from Watchlist" : "Add to Watchlist"}
        >
          <i 
            className={`fas fa-heart ${isWatched ? 'text-red-500' : 'text-gray-400'} transition-colors`} 
            aria-hidden="true"
          ></i>
        </button>
      </div>

      {/* Primary Metrics Row */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {formatCurrency(committedAmount)} of {formatCurrency(syndicate.targetRaiseGBP)} • {syndicate.committedPct}%
          </div>
          <span className="inline-flex items-center px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400 text-sm font-medium rounded">
            {daysUntilClosing}d
          </span>
        </div>
        <div 
          className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2"
          title="% of target raise soft-circled by the group."
        >
          <div 
            className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] h-3 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(animatedCommitted, 100)}%` }}
            aria-valuenow={syndicate.committedPct}
            aria-valuemin={0}
            aria-valuemax={100}
            role="progressbar"
            aria-label={`Committed ${syndicate.committedPct}% of target`}
          ></div>
        </div>
        
        {/* Interest Trend */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Interest Trend
            </span>
            <svg width="120" height="24" className="opacity-90">
              {/* Trend line */}
              <path
                d={createSparklineData(syndicate.interest.history).path}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="1.5"
                className="drop-shadow-sm"
              />
              {/* Data points */}
              {createSparklineData(syndicate.interest.history).points.map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r="2"
                  fill="var(--primary)"
                  className="drop-shadow-sm"
                />
              ))}
            </svg>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Last 7 periods
            </div>
            <div className="text-sm font-semibold text-[var(--primary)]">
              {syndicate.interest.overallPct}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Current
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="space-y-3 mb-4">
        {/* Investors Like You */}
        <div>
          <span 
            className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--secondary)]/10 text-[var(--secondary)] text-sm rounded-lg cursor-help"
            title="Share of participating investors with a similar profile to you (sector focus, ticket band, risk)."
          >
            <i className="fas fa-users" aria-hidden="true"></i>
            {syndicate.interest.likeYouPct}% investors like you
          </span>
        </div>

        {/* Confidence Meter */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">Confidence</span>
              <i 
                className="fas fa-info-circle text-gray-400 text-xs cursor-help" 
                aria-hidden="true"
                title="Composite of momentum, lead track record, and community interest. Informational only—this is not advice."
              ></i>
            </div>
            <span className={`text-sm font-medium ${confidence.color}`}>
              {syndicate.interest.confidenceScore}/100 ({confidence.level})
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ease-out ${confidence.bg}`}
              style={{ width: `${animatedConfidence}%` }}
              aria-valuenow={syndicate.interest.confidenceScore}
              aria-valuemin={0}
              aria-valuemax={100}
              role="progressbar"
              aria-label={`Confidence ${syndicate.interest.confidenceScore} out of 100 — ${confidence.level}`}
            ></div>
          </div>
          <span className="sr-only">
            Confidence {syndicate.interest.confidenceScore} out of 100 — {confidence.level}
          </span>
        </div>
      </div>

      {/* Footer with cohort mini-bar and meta info */}
      <div className="mb-4">
        {/* Cohort Mini-bar */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full flex">
              <div 
                className="bg-blue-500" 
                style={{ width: `${syndicate.interest.cohorts.angels}%` }}
                title={`${syndicate.interest.cohorts.angels}% Angels`}
              ></div>
              <div 
                className="bg-purple-500" 
                style={{ width: `${syndicate.interest.cohorts.funds}%` }}
                title={`${syndicate.interest.cohorts.funds}% Funds`}
              ></div>
              <div 
                className="bg-green-500" 
                style={{ width: `${syndicate.interest.cohorts.familyOffices}%` }}
                title={`${syndicate.interest.cohorts.familyOffices}% Family Offices`}
              ></div>
            </div>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Mix</span>
        </div>

        {/* Meta Info */}
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <div>Lead: {highlightText(syndicate.lead.alias, searchTerm)} • Min {formatCurrency(syndicate.minChequeGBP)}</div>
          <div className="flex gap-2">
            {syndicate.eligibility.EIS && (
              <span className="px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded">EIS</span>
            )}
            {syndicate.eligibility.SEIS && (
              <span className="px-2 py-1 bg-[var(--secondary)]/10 text-[var(--secondary)] rounded">SEIS</span>
            )}
            {!syndicate.eligibility.EIS && !syndicate.eligibility.SEIS && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded text-xs">
                Not EIS/SEIS
              </span>
            )}
          </div>
        </div>
      </div>

      {/* CTA */}
      <Link href={`/syndication/${syndicate.id}`}>
        <Button 
          className="w-full text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-[var(--primary)]/20" 
          variant="outline"
          onClick={onOpen}
        >
          View Syndicate
          <i className="fas fa-arrow-right ml-2" aria-hidden="true"></i>
        </Button>
      </Link>
    </article>
  );
}