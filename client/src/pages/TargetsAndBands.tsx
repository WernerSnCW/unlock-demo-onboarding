import { useState } from 'react';
import { Info, Settings, TrendingUp, TrendingDown, AlertTriangle, ChevronDown, X, Pencil, Clock, FileText, Check } from 'lucide-react';
import Header from '../components/Header';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';

// Demo data
interface Bucket {
  id: string;
  name: string;
  current: number;
  target: number;
  bandMin: number;
  bandMax: number;
  valueGbp: number;
  holdings: HoldingContribution[];
  valuationStale?: boolean;
  lastValuation?: string;
}

interface HoldingContribution {
  name: string;
  wrapper: string;
  account: string;
  valueGbp: number;
  percentage: number;
}

interface TradeProposal {
  action: 'Sell' | 'Buy';
  holding: string;
  account: string;
  wrapper: string;
  amountGbp: number;
  units?: number;
  estFees: number;
  estCgt: number;
  resultingPercent: number;
}

const demoPortfolioValue = 245000;

const demoBuckets: Bucket[] = [
  {
    id: 'equity',
    name: 'Equity',
    current: 46,
    target: 40,
    bandMin: 35,
    bandMax: 45,
    valueGbp: 112700,
    holdings: [
      { name: 'Vanguard Global All-Cap', wrapper: 'ISA', account: 'Vanguard ISA', valueGbp: 78000, percentage: 31.8 },
      { name: 'FTSE 100 Tracker', wrapper: 'SIPP', account: 'AJ Bell SIPP', valueGbp: 24700, percentage: 10.1 },
      { name: 'Tech ETF', wrapper: 'GIA', account: 'AJ Bell GIA', valueGbp: 10000, percentage: 4.1 }
    ]
  },
  {
    id: 'bonds',
    name: 'Bonds',
    current: 18,
    target: 30,
    bandMin: 25,
    bandMax: 35,
    valueGbp: 44100,
    holdings: [
      { name: 'UK Gilt Index', wrapper: 'ISA', account: 'Vanguard ISA', valueGbp: 32000, percentage: 13.1 },
      { name: 'Corporate Bond Fund', wrapper: 'SIPP', account: 'AJ Bell SIPP', valueGbp: 12100, percentage: 4.9 }
    ]
  },
  {
    id: 'cash',
    name: 'Cash',
    current: 14,
    target: 10,
    bandMin: 5,
    bandMax: 15,
    valueGbp: 34300,
    holdings: [
      { name: 'Premium Bonds', wrapper: 'Personal', account: 'NS&I', valueGbp: 20000, percentage: 8.2 },
      { name: 'Cash ISA', wrapper: 'ISA', account: 'Marcus', valueGbp: 14300, percentage: 5.8 }
    ]
  },
  {
    id: 'alternatives',
    name: 'Alternatives',
    current: 12,
    target: 10,
    bandMin: 5,
    bandMax: 15,
    valueGbp: 29400,
    holdings: [
      { name: 'EIS Portfolio', wrapper: 'Personal', account: 'Direct Holdings', valueGbp: 18000, percentage: 7.3 },
      { name: 'Property Fund', wrapper: 'ISA', account: 'Vanguard ISA', valueGbp: 11400, percentage: 4.7 }
    ],
    valuationStale: true,
    lastValuation: '2025-06-15'
  },
  {
    id: 'property',
    name: 'Property',
    current: 10,
    target: 10,
    bandMin: 5,
    bandMax: 15,
    valueGbp: 24500,
    holdings: [
      { name: '42 Elm St, Manchester', wrapper: 'Personal', account: 'Direct Property', valueGbp: 24500, percentage: 10.0 }
    ],
    valuationStale: true,
    lastValuation: '2025-03-20'
  }
];

type ViewMode = 'bucket' | 'wrapper' | 'account' | 'liabilities';

export default function TargetsAndBands() {
  const [viewMode, setViewMode] = useState<ViewMode>('bucket');
  const [policyDrawerOpen, setPolicyDrawerOpen] = useState(false);
  const [rebalancePlannerOpen, setRebalancePlannerOpen] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState<Bucket | null>(null);
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [breakdownBucket, setBreakdownBucket] = useState<Bucket | null>(null);
  const [snoozedBuckets, setSnoozedBuckets] = useState<Set<string>>(new Set());

  // Calculate buckets out of band
  const bucketsOutOfBand = demoBuckets.filter(b => 
    b.current < b.bandMin || b.current > b.bandMax
  );

  // Helper component for wrapper tags
  const WrapperTag = ({ wrapper }: { wrapper: string }) => {
    const colors: Record<string, string> = {
      'ISA': 'bg-[var(--success)]/10 text-[var(--success)]',
      'SIPP': 'bg-[var(--info)]/10 text-[var(--info)]',
      'GIA': 'bg-[var(--warning)]/10 text-[var(--warning)]',
      'Personal': 'bg-[var(--muted)] text-[var(--muted-foreground)]'
    };
    
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[wrapper] || colors.Personal}`}>
        {wrapper}
      </span>
    );
  };

  // Drift chip component
  const DriftChip = ({ bucket }: { bucket: Bucket }) => {
    const drift = bucket.current - bucket.target;
    const absDrift = Math.abs(drift);
    const isBreached = bucket.current < bucket.bandMin || bucket.current > bucket.bandMax;
    
    const getChipColor = () => {
      if (isBreached) {
        return drift > 0 
          ? 'bg-[var(--destructive)]/10 text-[var(--destructive)] border-[var(--destructive)]/20'
          : 'bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20';
      }
      return 'bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]';
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getChipColor()}`} data-testid={`drift-chip-${bucket.id}`}>
        {drift > 0 ? '+' : ''}{drift.toFixed(1)}% {isBreached ? 'out of band' : 'in band'}
      </span>
    );
  };

  // Bucket card component
  const BucketCard = ({ bucket }: { bucket: Bucket }) => {
    const drift = bucket.current - bucket.target;
    const isBreached = bucket.current < bucket.bandMin || bucket.current > bucket.bandMax;
    const isSnoozed = snoozedBuckets.has(bucket.id);

    const handleProposeTrades = (b: Bucket) => {
      setSelectedBucket(b);
      setRebalancePlannerOpen(true);
    };

    const handleSnooze = (bucketId: string) => {
      setSnoozedBuckets(prev => {
        const newSet = new Set(prev);
        if (newSet.has(bucketId)) {
          newSet.delete(bucketId);
        } else {
          newSet.add(bucketId);
        }
        return newSet;
      });
    };

    const handleBreakdown = (b: Bucket) => {
      setBreakdownBucket(b);
      setBreakdownOpen(true);
    };

    return (
      <div className={`p-6 border-2 rounded-xl bg-[var(--card)] transition-all ${
        isBreached && !isSnoozed ? 'border-[var(--destructive)]' : 'border-[var(--border)]'
      }`} data-testid={`bucket-card-${bucket.id}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-[var(--foreground)]">{bucket.name}</h3>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              £{bucket.valueGbp.toLocaleString()}
            </p>
          </div>
          <DriftChip bucket={bucket} />
        </div>

        {/* Percentages */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-xs text-[var(--muted-foreground)] mb-1">Current</div>
            <div className="text-2xl font-bold text-[var(--foreground)]">{bucket.current}%</div>
          </div>
          <div>
            <div className="text-xs text-[var(--muted-foreground)] mb-1">Target</div>
            <div className="text-2xl font-bold text-[var(--primary)]">{bucket.target}%</div>
          </div>
          <div>
            <div className="text-xs text-[var(--muted-foreground)] mb-1">Band</div>
            <div className="text-lg font-semibold text-[var(--foreground)]">{bucket.bandMin}–{bucket.bandMax}%</div>
          </div>
        </div>

        {/* Visual bar */}
        <div className="mb-4 h-2 bg-[var(--muted)] rounded-full overflow-hidden">
          <div 
            className={`h-full ${drift > 0 ? 'bg-[var(--destructive)]' : drift < 0 ? 'bg-[var(--warning)]' : 'bg-[var(--success)]'}`}
            style={{ width: `${bucket.current}%` }}
          />
        </div>

        {/* Stale valuation warning */}
        {bucket.valuationStale && (
          <div className="mb-4 px-3 py-2 bg-[var(--warning)]/10 border border-[var(--warning)]/20 rounded-lg flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-[var(--warning)] mt-0.5 flex-shrink-0" />
            <div className="text-xs text-[var(--foreground)]">
              <strong>Actions paused — valuation due</strong>
              <div className="text-[var(--muted-foreground)] mt-0.5">
                Last updated: {bucket.lastValuation}
              </div>
            </div>
          </div>
        )}

        {/* Snoozed indicator */}
        {isSnoozed && (
          <div className="mb-4 px-3 py-2 bg-[var(--info)]/10 border border-[var(--info)]/20 rounded-lg flex items-center gap-2">
            <Clock className="h-4 w-4 text-[var(--info)]" />
            <span className="text-xs text-[var(--foreground)]">Rebalance snoozed for 30 days</span>
          </div>
        )}

        {/* Breakdown link */}
        <button
          onClick={() => handleBreakdown(bucket)}
          className="text-sm text-[var(--primary)] hover:underline mb-4 flex items-center gap-1"
          data-testid={`breakdown-link-${bucket.id}`}
        >
          See holdings ({bucket.holdings.length}) <ChevronDown className="h-4 w-4" />
        </button>

        {/* Action buttons */}
        <div className="flex gap-2">
          {bucket.valuationStale ? (
            <button
              className="flex-1 px-4 py-2 bg-[var(--warning)] text-white rounded-xl text-sm font-medium hover:bg-[var(--warning)]/90 transition-colors"
              data-testid={`update-valuation-${bucket.id}`}
            >
              Update valuation
            </button>
          ) : (
            <>
              <button
                onClick={() => handleProposeTrades(bucket)}
                disabled={isSnoozed}
                className="flex-1 px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid={`propose-trades-${bucket.id}`}
              >
                Propose trades
              </button>
              <button
                onClick={() => handleSnooze(bucket.id)}
                className="px-4 py-2 bg-transparent border border-[var(--border)] text-[var(--foreground)] rounded-xl text-sm font-medium hover:bg-[var(--muted)] transition-colors"
                data-testid={`snooze-${bucket.id}`}
              >
                {isSnoozed ? 'Un-snooze' : 'Snooze'}
              </button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="px-4 py-2 bg-transparent border border-[var(--border)] text-[var(--foreground)] rounded-xl text-sm font-medium hover:bg-[var(--muted)] transition-colors"
                      data-testid={`why-this-${bucket.id}`}
                    >
                      Why this?
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      {drift > 0 
                        ? `${bucket.name} is overweight due to price appreciation. Consider rebalancing to avoid concentration risk.`
                        : drift < 0
                        ? `${bucket.name} is underweight. Consider topping up to maintain target allocation.`
                        : 'Your allocation is within target bands. No action needed right now.'
                      }
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Targets & Bands</h1>
          <p className="text-[var(--muted-foreground)]">Track your strategic allocation and manage drift</p>
        </div>

        {/* Info banner */}
        <TooltipProvider>
          <div className="mb-6 px-4 py-3 bg-[var(--info)]/10 border border-[var(--info)]/20 rounded-xl flex items-start gap-3">
            <Info className="h-5 w-5 text-[var(--info)] mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1">ⓘ How it works</h3>
              <p className="text-sm text-[var(--foreground)]">
                Targets set your long-run mix. Bands prevent over-trading. When a bucket drifts outside its band, we suggest the smallest set of trades to get you back inside—preferably inside your ISA/SIPP to avoid CGT.
              </p>
            </div>
          </div>
        </TooltipProvider>

        {/* Compact header strip */}
        <div className="mb-6 p-4 border border-[var(--border)] rounded-xl bg-[var(--card)] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            {/* Overall drift */}
            <div>
              <div className="text-xs text-[var(--muted-foreground)] mb-1">Overall drift</div>
              <button
                className="text-sm font-semibold text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
                data-testid="overall-drift"
              >
                {bucketsOutOfBand.length} bucket{bucketsOutOfBand.length !== 1 ? 's' : ''} out of band
              </button>
            </div>

            {/* Policy */}
            <div>
              <div className="text-xs text-[var(--muted-foreground)] mb-1">Rebalance rule</div>
              <div className="text-sm text-[var(--foreground)]">Band breach • Trade min £500 • Review quarterly</div>
            </div>
          </div>

          {/* Edit policy link */}
          <button
            onClick={() => setPolicyDrawerOpen(true)}
            className="px-4 py-2 bg-transparent border border-[var(--border)] text-[var(--foreground)] rounded-xl text-sm font-medium hover:bg-[var(--muted)] transition-colors flex items-center gap-2"
            data-testid="edit-policy"
          >
            <Settings className="h-4 w-4" />
            Edit policy
          </button>
        </div>

        {/* View controls */}
        <div className="mb-6 flex items-center gap-2 flex-wrap">
          <div className="text-sm text-[var(--muted-foreground)]">View:</div>
          <div className="inline-flex rounded-xl border border-[var(--border)] bg-[var(--muted)]/20 p-1">
            <button
              onClick={() => setViewMode('bucket')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'bucket'
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
              }`}
              data-testid="view-bucket"
            >
              By Bucket
            </button>
            <button
              onClick={() => setViewMode('wrapper')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'wrapper'
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
              }`}
              data-testid="view-wrapper"
            >
              By Wrapper
            </button>
            <button
              onClick={() => setViewMode('account')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'account'
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
              }`}
              data-testid="view-account"
            >
              By Account
            </button>
            <button
              onClick={() => setViewMode('liabilities')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'liabilities'
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
              }`}
              data-testid="view-liabilities"
            >
              With Liabilities
            </button>
          </div>
        </div>

        {/* Bucket grid (default view) */}
        {viewMode === 'bucket' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {demoBuckets.map(bucket => (
              <BucketCard key={bucket.id} bucket={bucket} />
            ))}
          </div>
        )}

        {/* By Wrapper view */}
        {viewMode === 'wrapper' && (
          <div className="space-y-6">
            <div className="px-4 py-3 bg-[var(--muted)]/20 border border-[var(--border)] rounded-xl">
              <p className="text-sm text-[var(--foreground)]">
                <strong>Wrapper view</strong> shows Equity/Bonds/Cash within ISA/SIPP/GIA. Prefer ISA/SIPP trades to avoid CGT.
              </p>
            </div>
            
            {['ISA', 'SIPP', 'GIA', 'Personal'].map(wrapper => {
              const wrapperHoldings = demoBuckets.flatMap(b => 
                b.holdings.filter(h => h.wrapper === wrapper)
              );
              const wrapperTotal = wrapperHoldings.reduce((sum, h) => sum + h.valueGbp, 0);
              
              if (wrapperHoldings.length === 0) return null;
              
              return (
                <div key={wrapper} className="border border-[var(--border)] rounded-xl bg-[var(--card)] overflow-hidden">
                  <div className="px-6 py-4 bg-[var(--muted)]/20 border-b border-[var(--border)] flex items-center justify-between">
                    <div>
                      <WrapperTag wrapper={wrapper} />
                      <p className="text-sm text-[var(--muted-foreground)] mt-1">
                        £{wrapperTotal.toLocaleString()} • {((wrapperTotal / demoPortfolioValue) * 100).toFixed(1)}% of portfolio
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-3">
                      {wrapperHoldings.map((holding, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-b-0">
                          <div>
                            <div className="text-sm font-medium text-[var(--foreground)]">{holding.name}</div>
                            <div className="text-xs text-[var(--muted-foreground)]">{holding.account}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-[var(--foreground)]">£{holding.valueGbp.toLocaleString()}</div>
                            <div className="text-xs text-[var(--muted-foreground)]">{holding.percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* By Account view */}
        {viewMode === 'account' && (
          <div className="space-y-6">
            <div className="px-4 py-3 bg-[var(--muted)]/20 border border-[var(--border)] rounded-xl">
              <p className="text-sm text-[var(--foreground)]">
                <strong>Account view</strong> groups holdings by custodian for reconciliation and account-specific rebalancing.
              </p>
            </div>
            
            {['Vanguard ISA', 'AJ Bell SIPP', 'AJ Bell GIA', 'Marcus', 'NS&I', 'Direct Holdings', 'Direct Property'].map(account => {
              const accountHoldings = demoBuckets.flatMap(b => 
                b.holdings.filter(h => h.account === account)
              );
              const accountTotal = accountHoldings.reduce((sum, h) => sum + h.valueGbp, 0);
              
              if (accountHoldings.length === 0) return null;
              
              return (
                <div key={account} className="border border-[var(--border)] rounded-xl bg-[var(--card)] overflow-hidden">
                  <div className="px-6 py-4 bg-[var(--muted)]/20 border-b border-[var(--border)]">
                    <h3 className="text-sm font-semibold text-[var(--foreground)]">{account}</h3>
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">
                      £{accountTotal.toLocaleString()} • {((accountTotal / demoPortfolioValue) * 100).toFixed(1)}% of portfolio
                    </p>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-3">
                      {accountHoldings.map((holding, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-b-0">
                          <div>
                            <div className="text-sm font-medium text-[var(--foreground)]">{holding.name}</div>
                            <div className="text-xs text-[var(--muted-foreground)]">
                              <WrapperTag wrapper={holding.wrapper} />
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-[var(--foreground)]">£{holding.valueGbp.toLocaleString()}</div>
                            <div className="text-xs text-[var(--muted-foreground)]">{holding.percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* With Liabilities view */}
        {viewMode === 'liabilities' && (
          <div className="space-y-6">
            <div className="px-4 py-3 bg-[var(--muted)]/20 border border-[var(--border)] rounded-xl">
              <p className="text-sm text-[var(--foreground)]">
                <strong>Liabilities overlay</strong> shows net worth impact. Mortgage reduces effective property exposure; margin loan reduces cash bucket.
              </p>
            </div>

            {/* Gross vs Net Assets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 border border-[var(--border)] rounded-xl bg-[var(--card)]">
                <div className="text-sm text-[var(--muted-foreground)] mb-2">Gross Assets</div>
                <div className="text-3xl font-bold text-[var(--foreground)]">£{demoPortfolioValue.toLocaleString()}</div>
              </div>
              
              <div className="p-6 border border-[var(--border)] rounded-xl bg-[var(--card)]">
                <div className="text-sm text-[var(--muted-foreground)] mb-2">Total Liabilities</div>
                <div className="text-3xl font-bold text-[var(--destructive)]">£128,450</div>
                <div className="text-xs text-[var(--muted-foreground)] mt-1">Mortgage: £128,450</div>
              </div>
              
              <div className="p-6 border border-[var(--border)] rounded-xl bg-[var(--success)]/10 border-[var(--success)]/20">
                <div className="text-sm text-[var(--muted-foreground)] mb-2">Net Worth</div>
                <div className="text-3xl font-bold text-[var(--success)]">£{(demoPortfolioValue - 128450).toLocaleString()}</div>
              </div>
            </div>

            {/* Adjusted buckets grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {demoBuckets.map(bucket => {
                // Adjust property bucket for mortgage
                const adjustedValue = bucket.id === 'property' 
                  ? bucket.valueGbp - 128450 
                  : bucket.valueGbp;
                const adjustedPercent = bucket.id === 'property'
                  ? -42.4 // Net liability after mortgage
                  : bucket.current;

                return (
                  <div key={bucket.id} className="p-6 border-2 rounded-xl bg-[var(--card)] border-[var(--border)]">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--foreground)]">{bucket.name}</h3>
                        <p className="text-sm text-[var(--muted-foreground)] mt-1">
                          £{adjustedValue.toLocaleString()}
                          {bucket.id === 'property' && (
                            <span className="ml-2 text-xs text-[var(--destructive)]">(net of mortgage)</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs text-[var(--muted-foreground)] mb-1">Current</div>
                        <div className={`text-2xl font-bold ${adjustedPercent < 0 ? 'text-[var(--destructive)]' : 'text-[var(--foreground)]'}`}>
                          {adjustedPercent.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[var(--muted-foreground)] mb-1">Target</div>
                        <div className="text-2xl font-bold text-[var(--primary)]">{bucket.target}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-[var(--muted-foreground)] mb-1">Band</div>
                        <div className="text-lg font-semibold text-[var(--foreground)]">{bucket.bandMin}–{bucket.bandMax}%</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Breakdown Drawer */}
      {breakdownOpen && breakdownBucket && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--card)] rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="sticky top-0 bg-[var(--card)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                {breakdownBucket.name} Holdings
              </h2>
              <button
                onClick={() => setBreakdownOpen(false)}
                className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors"
                data-testid="close-breakdown"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-3">
                {breakdownBucket.holdings.map((holding, idx) => (
                  <div key={idx} className="p-4 border border-[var(--border)] rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-[var(--foreground)]">{holding.name}</div>
                        <div className="text-xs text-[var(--muted-foreground)] mt-1">{holding.account}</div>
                      </div>
                      <WrapperTag wrapper={holding.wrapper} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <div className="text-xs text-[var(--muted-foreground)]">Value</div>
                        <div className="text-sm font-semibold text-[var(--foreground)]">£{holding.valueGbp.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-[var(--muted-foreground)]">% of Portfolio</div>
                        <div className="text-sm font-semibold text-[var(--foreground)]">{holding.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rebalance Planner Overlay */}
      {rebalancePlannerOpen && selectedBucket && (
        <RebalancePlanner
          bucket={selectedBucket}
          onClose={() => setRebalancePlannerOpen(false)}
          portfolioValue={demoPortfolioValue}
        />
      )}

      {/* Policy Drawer */}
      {policyDrawerOpen && (
        <PolicyDrawer onClose={() => setPolicyDrawerOpen(false)} />
      )}
    </div>
  );
}

// Rebalance Planner component
function RebalancePlanner({ 
  bucket, 
  onClose, 
  portfolioValue 
}: { 
  bucket: Bucket; 
  onClose: () => void; 
  portfolioValue: number;
}) {
  const [goalType, setGoalType] = useState<'midpoint' | 'edge'>('midpoint');
  const [savedPlan, setSavedPlan] = useState(false);
  
  const targetPercent = goalType === 'midpoint' 
    ? bucket.target 
    : bucket.current > bucket.target ? bucket.bandMax : bucket.bandMin;
  
  const drift = bucket.current - targetPercent;
  const tradeAmountGbp = Math.abs(drift / 100 * portfolioValue);

  // Generate trade proposals using heuristics
  const generateTrades = (): TradeProposal[] => {
    const trades: TradeProposal[] = [];
    
    if (drift > 0) {
      // Need to sell - prefer ISA/SIPP
      const isaHolding = bucket.holdings.find(h => h.wrapper === 'ISA');
      const sippHolding = bucket.holdings.find(h => h.wrapper === 'SIPP');
      const giaHolding = bucket.holdings.find(h => h.wrapper === 'GIA');
      
      if (isaHolding && isaHolding.valueGbp >= tradeAmountGbp) {
        trades.push({
          action: 'Sell',
          holding: isaHolding.name,
          account: isaHolding.account,
          wrapper: 'ISA',
          amountGbp: tradeAmountGbp,
          units: Math.floor(tradeAmountGbp / 100),
          estFees: 0,
          estCgt: 0,
          resultingPercent: targetPercent
        });
      } else if (sippHolding && sippHolding.valueGbp >= tradeAmountGbp) {
        trades.push({
          action: 'Sell',
          holding: sippHolding.name,
          account: sippHolding.account,
          wrapper: 'SIPP',
          amountGbp: tradeAmountGbp,
          units: Math.floor(tradeAmountGbp / 100),
          estFees: 0,
          estCgt: 0,
          resultingPercent: targetPercent
        });
      } else if (giaHolding) {
        trades.push({
          action: 'Sell',
          holding: giaHolding.name,
          account: giaHolding.account,
          wrapper: 'GIA',
          amountGbp: Math.min(tradeAmountGbp, giaHolding.valueGbp),
          units: Math.floor(Math.min(tradeAmountGbp, giaHolding.valueGbp) / 100),
          estFees: 9.95,
          estCgt: Math.min(tradeAmountGbp, giaHolding.valueGbp) * 0.10, // 10% gain assumed
          resultingPercent: targetPercent
        });
      }
    } else if (drift < 0) {
      // Need to buy - use cash from same wrapper if possible
      trades.push({
        action: 'Buy',
        holding: bucket.holdings[0]?.name || `${bucket.name} Fund`,
        account: bucket.holdings[0]?.account || 'Vanguard ISA',
        wrapper: 'ISA',
        amountGbp: tradeAmountGbp,
        units: Math.floor(tradeAmountGbp / 100),
        estFees: 0,
        estCgt: 0,
        resultingPercent: targetPercent
      });
    }
    
    return trades;
  };

  const trades = generateTrades();

  const handleSavePlan = () => {
    setSavedPlan(true);
    // In a real app, this would log to the reconciliation system
    console.log('Plan created:', new Date().toLocaleDateString('en-GB'));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--card)] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-[var(--card)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Rebalance Planner — {bucket.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors"
            data-testid="close-planner"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Banner */}
        <div className="px-6 py-3 bg-[var(--info)]/10 border-b border-[var(--info)]/20">
          <p className="text-sm text-[var(--foreground)]">
            <strong>Tax-efficient rebalancing:</strong> We prioritise ISA/SIPP changes first. GIA trades show estimated CGT and fees.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Goal selector */}
          <div>
            <label className="text-sm font-medium text-[var(--foreground)] mb-2 block">Rebalance goal</label>
            <div className="inline-flex rounded-xl border border-[var(--border)] bg-[var(--muted)]/20 p-1">
              <button
                onClick={() => setGoalType('midpoint')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  goalType === 'midpoint'
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                    : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
                }`}
                data-testid="goal-midpoint"
              >
                To mid-point ({bucket.target}%)
              </button>
              <button
                onClick={() => setGoalType('edge')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  goalType === 'edge'
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                    : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
                }`}
                data-testid="goal-edge"
              >
                To band edge ({bucket.current > bucket.target ? bucket.bandMax : bucket.bandMin}%)
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border border-[var(--border)] rounded-xl">
              <div className="text-xs text-[var(--muted-foreground)] mb-1">Current</div>
              <div className="text-xl font-bold text-[var(--foreground)]">{bucket.current}%</div>
            </div>
            <div className="p-4 border border-[var(--border)] rounded-xl">
              <div className="text-xs text-[var(--muted-foreground)] mb-1">Target</div>
              <div className="text-xl font-bold text-[var(--primary)]">{targetPercent}%</div>
            </div>
            <div className="p-4 border border-[var(--border)] rounded-xl">
              <div className="text-xs text-[var(--muted-foreground)] mb-1">Trade Amount</div>
              <div className="text-xl font-bold text-[var(--foreground)]">£{tradeAmountGbp.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            </div>
          </div>

          {/* Trade table */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Proposed Trades</h3>
            
            {trades.length === 0 ? (
              <div className="p-6 border border-[var(--border)] rounded-xl text-center text-sm text-[var(--muted-foreground)]">
                No trades needed — allocation is within band
              </div>
            ) : (
              <div className="border border-[var(--border)] rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[var(--muted)]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)]">Action</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)]">Holding</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)]">Account</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)]">Wrapper</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-[var(--muted-foreground)]">Amount</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-[var(--muted-foreground)]">Est. Fees</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-[var(--muted-foreground)]">Est. CGT</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-[var(--muted-foreground)]">Result %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((trade, idx) => (
                      <tr key={idx} className="border-t border-[var(--border)]">
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            trade.action === 'Sell' 
                              ? 'bg-[var(--destructive)]/10 text-[var(--destructive)]' 
                              : 'bg-[var(--success)]/10 text-[var(--success)]'
                          }`}>
                            {trade.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--foreground)]">{trade.holding}</td>
                        <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{trade.account}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            trade.wrapper === 'ISA' ? 'bg-[var(--success)]/10 text-[var(--success)]' :
                            trade.wrapper === 'SIPP' ? 'bg-[var(--info)]/10 text-[var(--info)]' :
                            'bg-[var(--warning)]/10 text-[var(--warning)]'
                          }`}>
                            {trade.wrapper}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-[var(--foreground)]">
                          £{trade.amountGbp.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-[var(--muted-foreground)]">
                          £{trade.estFees.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-[var(--muted-foreground)]">
                          £{trade.estCgt.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-[var(--primary)]">
                          {trade.resultingPercent.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
            <button
              onClick={handleSavePlan}
              disabled={savedPlan || trades.length === 0}
              className="px-6 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              data-testid="save-plan"
            >
              {savedPlan ? <Check className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
              {savedPlan ? 'Plan saved' : 'Save plan'}
            </button>

            {savedPlan && (
              <p className="text-sm text-[var(--success)]">
                Plain-English summary: {trades[0]?.action === 'Sell' ? 'Sell' : 'Buy'} £{tradeAmountGbp.toLocaleString(undefined, { maximumFractionDigits: 0 })} of {trades[0]?.holding} in {trades[0]?.wrapper}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Policy Drawer component
function PolicyDrawer({ onClose }: { onClose: () => void }) {
  const [rebalanceRule, setRebalanceRule] = useState<'time' | 'threshold' | 'hybrid'>('threshold');
  const [minTradeSize, setMinTradeSize] = useState('500');
  const [cashBuffer, setCashBuffer] = useState('5');
  const [includeProperty, setIncludeProperty] = useState(false);
  const [taxPreference, setTaxPreference] = useState<'prefer' | 'allow' | 'never'>('prefer');

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-[var(--card)] rounded-t-xl sm:rounded-xl w-full sm:max-w-2xl sm:max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-[var(--card)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Rebalance Policy</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors"
            data-testid="close-policy"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Rebalance rule */}
          <div>
            <label className="text-sm font-medium text-[var(--foreground)] mb-2 block">Rebalance rule</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-[var(--border)] rounded-xl cursor-pointer hover:bg-[var(--muted)]/50 transition-colors">
                <input
                  type="radio"
                  checked={rebalanceRule === 'time'}
                  onChange={() => setRebalanceRule('time')}
                  className="h-4 w-4"
                  data-testid="rule-time"
                />
                <div>
                  <div className="text-sm font-medium text-[var(--foreground)]">Time-based (quarterly)</div>
                  <div className="text-xs text-[var(--muted-foreground)]">Rebalance every 3 months regardless of drift</div>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 border border-[var(--border)] rounded-xl cursor-pointer hover:bg-[var(--muted)]/50 transition-colors">
                <input
                  type="radio"
                  checked={rebalanceRule === 'threshold'}
                  onChange={() => setRebalanceRule('threshold')}
                  className="h-4 w-4"
                  data-testid="rule-threshold"
                />
                <div>
                  <div className="text-sm font-medium text-[var(--foreground)]">Threshold (band breach)</div>
                  <div className="text-xs text-[var(--muted-foreground)]">Only when allocation drifts outside bands</div>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 border border-[var(--border)] rounded-xl cursor-pointer hover:bg-[var(--muted)]/50 transition-colors">
                <input
                  type="radio"
                  checked={rebalanceRule === 'hybrid'}
                  onChange={() => setRebalanceRule('hybrid')}
                  className="h-4 w-4"
                  data-testid="rule-hybrid"
                />
                <div>
                  <div className="text-sm font-medium text-[var(--foreground)]">Hybrid</div>
                  <div className="text-xs text-[var(--muted-foreground)]">Quarterly review + band breach alerts</div>
                </div>
              </label>
            </div>
          </div>

          {/* Min trade size */}
          <div>
            <label className="text-sm font-medium text-[var(--foreground)] mb-2 block">Minimum trade size (£)</label>
            <input
              type="number"
              value={minTradeSize}
              onChange={(e) => setMinTradeSize(e.target.value)}
              className="w-full px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--background)] text-[var(--foreground)]"
              data-testid="min-trade-size"
            />
            <p className="text-xs text-[var(--muted-foreground)] mt-1">Avoid small trades that rack up fees</p>
          </div>

          {/* Cash buffer */}
          <div>
            <label className="text-sm font-medium text-[var(--foreground)] mb-2 block">Cash buffer floor (%)</label>
            <input
              type="number"
              value={cashBuffer}
              onChange={(e) => setCashBuffer(e.target.value)}
              className="w-full px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--background)] text-[var(--foreground)]"
              data-testid="cash-buffer"
            />
            <p className="text-xs text-[var(--muted-foreground)] mt-1">Minimum cash % to maintain for liquidity</p>
          </div>

          {/* Include property */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeProperty}
                onChange={(e) => setIncludeProperty(e.target.checked)}
                className="h-4 w-4"
                data-testid="include-property"
              />
              <div>
                <div className="text-sm font-medium text-[var(--foreground)]">Include property in rebalance</div>
                <div className="text-xs text-[var(--muted-foreground)]">Consider illiquid assets in allocation (view-only nudges)</div>
              </div>
            </label>
          </div>

          {/* Tax preference */}
          <div>
            <label className="text-sm font-medium text-[var(--foreground)] mb-2 block">Tax preference for trades</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-[var(--border)] rounded-xl cursor-pointer hover:bg-[var(--muted)]/50 transition-colors">
                <input
                  type="radio"
                  checked={taxPreference === 'prefer'}
                  onChange={() => setTaxPreference('prefer')}
                  className="h-4 w-4"
                  data-testid="tax-prefer"
                />
                <div>
                  <div className="text-sm font-medium text-[var(--foreground)]">Prefer ISA/SIPP</div>
                  <div className="text-xs text-[var(--muted-foreground)]">Use tax-advantaged wrappers first, GIA if needed</div>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 border border-[var(--border)] rounded-xl cursor-pointer hover:bg-[var(--muted)]/50 transition-colors">
                <input
                  type="radio"
                  checked={taxPreference === 'allow'}
                  onChange={() => setTaxPreference('allow')}
                  className="h-4 w-4"
                  data-testid="tax-allow"
                />
                <div>
                  <div className="text-sm font-medium text-[var(--foreground)]">Allow GIA if needed</div>
                  <div className="text-xs text-[var(--muted-foreground)]">Will show CGT estimates</div>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 border border-[var(--border)] rounded-xl cursor-pointer hover:bg-[var(--muted)]/50 transition-colors">
                <input
                  type="radio"
                  checked={taxPreference === 'never'}
                  onChange={() => setTaxPreference('never')}
                  className="h-4 w-4"
                  data-testid="tax-never"
                />
                <div>
                  <div className="text-sm font-medium text-[var(--foreground)]">Never GIA</div>
                  <div className="text-xs text-[var(--muted-foreground)]">Show warnings if rebalance requires GIA trades</div>
                </div>
              </label>
            </div>
          </div>

          {/* Save button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-transparent border border-[var(--border)] text-[var(--foreground)] rounded-xl text-sm font-medium hover:bg-[var(--muted)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors"
              data-testid="save-policy"
            >
              Save policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
