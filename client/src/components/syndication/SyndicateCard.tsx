import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

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
}

export function SyndicateCard({ syndicate, onOpen }: SyndicateCardProps) {
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
    if (score >= 75) return { level: 'High', color: 'text-green-600 dark:text-green-400' };
    if (score >= 50) return { level: 'Moderate', color: 'text-yellow-600 dark:text-yellow-400' };
    return { level: 'Low', color: 'text-red-600 dark:text-red-400' };
  };

  const daysUntilClosing = getDaysUntilClosing();
  const confidence = getConfidenceLevel(syndicate.interest.confidenceScore);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2 flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
            {syndicate.company}
          </h3>
          {syndicate.verified && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-xs rounded">
              <i className="fas fa-check-circle" aria-hidden="true"></i>
              Verified
            </span>
          )}
        </div>
      </div>

      {/* Sector Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {syndicate.sector.map((s) => (
          <span key={s} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded">
            {s}
          </span>
        ))}
      </div>

      {/* Raise Target & Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Target {formatCurrency(syndicate.targetRaiseGBP)}</span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{syndicate.committedPct}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-[var(--primary)] h-2 rounded-full transition-all"
            style={{ width: `${Math.min(syndicate.committedPct, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Investors Like You Badge */}
      <div className="mb-4">
        <span 
          className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--secondary)]/10 text-[var(--secondary)] text-sm rounded-lg"
          title="Share of participating investors with a similar profile to yours (sector focus, ticket size, risk)."
        >
          <i className="fas fa-users" aria-hidden="true"></i>
          {syndicate.interest.likeYouPct}% of angels like you shortlisted this
        </span>
      </div>

      {/* Confidence Meter */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-600 dark:text-gray-400">Confidence</span>
          <span className={`text-sm font-medium ${confidence.color}`}>
            {syndicate.interest.confidenceScore}/100 ({confidence.level})
          </span>
        </div>
        <div 
          className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"
          title="Composite signal of momentum, lead track record, and community interest. Informational only."
        >
          <div 
            className="h-2 rounded-full transition-all bg-gradient-to-r from-gray-400 via-yellow-400 to-green-400"
            style={{ width: `${syndicate.interest.confidenceScore}%` }}
          ></div>
        </div>
      </div>

      {/* Meta Row */}
      <div className="text-xs text-gray-600 dark:text-gray-400 mb-4 space-y-1">
        <div>Lead: {syndicate.lead.alias} · Min £{(syndicate.minChequeGBP / 1000).toFixed(0)}k · Closes in {daysUntilClosing}d</div>
        <div className="flex gap-2">
          {syndicate.eligibility.EIS && (
            <span className="px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded">EIS</span>
          )}
          {syndicate.eligibility.SEIS && (
            <span className="px-2 py-1 bg-[var(--secondary)]/10 text-[var(--secondary)] rounded">SEIS</span>
          )}
        </div>
      </div>

      {/* CTA */}
      <Link href={`/syndication/${syndicate.id}`}>
        <Button 
          className="w-full" 
          variant="outline"
          onClick={onOpen}
        >
          View Syndicate
          <i className="fas fa-arrow-right ml-2" aria-hidden="true"></i>
        </Button>
      </Link>
    </div>
  );
}