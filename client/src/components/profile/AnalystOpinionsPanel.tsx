import { useState, useMemo, useEffect } from 'react';
import { Filter, TrendingUp, AlertTriangle, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useOpinionsStore, AnalystOpinion, TickerConsensus } from '@/state/opinionsStore';
import { formatPrice, formatPriceDelta, formatDateRelative, getRatingColor } from '@/utils/formatters';

interface AnalystOpinionsPanelProps {
  tickers?: string[];
  className?: string;
  compact?: boolean;
  showFilters?: boolean;
}

export function AnalystOpinionsPanel({ 
  tickers, 
  className = '', 
  compact = false,
  showFilters = true 
}: AnalystOpinionsPanelProps) {
  const { 
    opinions, 
    filters, 
    setRatingFilter, 
    setTimeframeFilter, 
    setTickerFilter,
    resetFilters,
    getByTickers, 
    getConsensusForTicker, 
    getFilteredOpinions,
    getAllTickers 
  } = useOpinionsStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Set ticker filter if specific tickers are provided
  useEffect(() => {
    if (tickers && tickers.length > 0) {
      setTickerFilter(tickers);
    }
  }, [tickers, setTickerFilter]);

  const displayOpinions = useMemo(() => {
    let opinions = tickers ? getByTickers(tickers) : getFilteredOpinions();
    
    if (searchTerm) {
      opinions = opinions.filter(opinion =>
        opinion.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opinion.analyst.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opinion.note.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return opinions.sort((a, b) => new Date(b.asOf).getTime() - new Date(a.asOf).getTime());
  }, [tickers, getByTickers, getFilteredOpinions, searchTerm]);

  const consensusData = useMemo(() => {
    if (!tickers || tickers.length === 0) return [];
    
    return tickers.map(ticker => getConsensusForTicker(ticker))
      .filter(consensus => consensus !== null) as TickerConsensus[];
  }, [tickers, getConsensusForTicker]);

  const clearSearch = () => {
    setSearchTerm('');
  };

  const OpinionCard = ({ opinion }: { opinion: AnalystOpinion }) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[var(--primary)] rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-semibold">
              {opinion.analyst.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
              {opinion.analyst}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              {formatDateRelative(opinion.asOf)}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <Badge className={`text-xs ${getRatingColor(opinion.rating)}`}>
            {opinion.rating}
          </Badge>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1">
            {formatPrice(opinion.target, opinion.currency)}
          </div>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
        <strong>{opinion.ticker}:</strong> {opinion.note}
      </p>
    </div>
  );

  const ConsensusCard = ({ consensus }: { consensus: TickerConsensus }) => (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          {consensus.ticker} Consensus
        </h3>
        <Badge className={getRatingColor(consensus.consensus.rating)}>
          {consensus.consensus.rating}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600 dark:text-gray-400">Avg Target:</span>
          <span className="font-medium text-gray-900 dark:text-gray-100 ml-1">
            {formatPrice(consensus.consensus.avgTarget, consensus.consensus.currency)}
            <span className={`ml-1 ${consensus.consensus.targetDeltaPct >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              ({consensus.consensus.targetDeltaPct >= 0 ? '+' : ''}{consensus.consensus.targetDeltaPct.toFixed(1)}%)
            </span>
          </span>
        </div>
        
        <div>
          <span className="text-gray-600 dark:text-gray-400">Coverage:</span>
          <span className="font-medium text-gray-900 dark:text-gray-100 ml-1">
            {consensus.consensus.counts.strongBuy} Buy, {consensus.consensus.counts.neutral} Hold, {consensus.consensus.counts.sell} Sell
          </span>
        </div>
      </div>
    </div>
  );

  if (displayOpinions.length === 0 && consensusData.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-3" />
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          No analyst opinions available
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Opinions will appear here as coverage becomes available.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[var(--primary)]" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Analyst Opinions
          </h2>
          {displayOpinions.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {displayOpinions.length}
            </Badge>
          )}
        </div>
        
        {showFilters && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className="text-xs"
          >
            <Filter className="h-3 w-3 mr-1" />
            Filters
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search opinions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-8"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="h-3 w-3 text-gray-400" />
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFiltersPanel && showFilters && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Rating:</span>
            <div className="flex gap-1">
              {['all', 'positive', 'neutral', 'negative'].map((rating) => (
                <Button
                  key={rating}
                  variant={filters.rating === rating ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRatingFilter(rating as any)}
                  className="text-xs capitalize"
                >
                  {rating}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Time:</span>
            <div className="flex gap-1">
              {['all', '7d', '30d'].map((timeframe) => (
                <Button
                  key={timeframe}
                  variant={filters.timeframe === timeframe ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeframeFilter(timeframe as any)}
                  className="text-xs"
                >
                  {timeframe === 'all' ? 'All Time' : `Last ${timeframe}`}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs">
              Reset Filters
            </Button>
          </div>
        </div>
      )}

      {/* Consensus Summary (for specific tickers) */}
      {consensusData.length > 0 && (
        <div className="mb-6">
          {consensusData.map((consensus) => (
            <ConsensusCard key={consensus.ticker} consensus={consensus} />
          ))}
        </div>
      )}

      {/* Opinions List */}
      <div className={`space-y-3 ${compact ? 'max-h-96 overflow-y-auto' : ''}`}>
        {displayOpinions.map((opinion, index) => (
          <OpinionCard key={`${opinion.ticker}-${opinion.analyst}-${index}`} opinion={opinion} />
        ))}
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-800 dark:text-amber-200">
            <p className="mb-1">
              <strong>Disclaimer:</strong> Analyst opinions are third-party views and not financial advice.
            </p>
            <p>
              Targets are indicative and may change without notice. Past performance does not guarantee future results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}