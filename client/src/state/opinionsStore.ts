import { create } from 'zustand';
import analystOpinionsData from '../mocks/analyst_opinions.json';
import tickerMap from '../mocks/ticker_map.json';

export interface AnalystOpinion {
  ticker: string;
  analyst: string;
  rating: 'Strong Buy' | 'Buy' | 'Overweight' | 'Outperform' | 'Neutral' | 'Hold' | 'Underweight' | 'Underperform' | 'Sell';
  target: number;
  currency: string;
  note: string;
  asOf: string;
}

export interface TickerConsensus {
  ticker: string;
  opinions: AnalystOpinion[];
  consensus: {
    rating: string;
    avgTarget: number;
    currency: string;
    targetDelta: number;
    targetDeltaPct: number;
    counts: {
      strongBuy: number;
      buy: number;
      neutral: number;
      sell: number;
    };
  };
}

interface OpinionsState {
  opinions: AnalystOpinion[];
  filters: {
    rating: 'all' | 'positive' | 'neutral' | 'negative';
    timeframe: 'all' | '7d' | '30d';
    tickers: string[];
  };
  
  // Actions
  setRatingFilter: (rating: OpinionsState['filters']['rating']) => void;
  setTimeframeFilter: (timeframe: OpinionsState['filters']['timeframe']) => void;
  setTickerFilter: (tickers: string[]) => void;
  resetFilters: () => void;
  
  // Computed
  getByTickers: (tickers: string[]) => AnalystOpinion[];
  getConsensusForTicker: (ticker: string) => TickerConsensus | null;
  getFilteredOpinions: () => AnalystOpinion[];
  getAllTickers: () => string[];
}

// Helper functions
const normalizeTickerSymbol = (ticker: string): string => {
  return tickerMap[ticker as keyof typeof tickerMap] || ticker;
};

const getRatingWeight = (rating: string): number => {
  const weights: Record<string, number> = {
    'Strong Buy': 5,
    'Buy': 4,
    'Overweight': 4,
    'Outperform': 4,
    'Neutral': 3,
    'Hold': 3,
    'Underweight': 2,
    'Underperform': 2,
    'Sell': 1,
  };
  return weights[rating] || 3;
};

const getRatingCategory = (rating: string): 'positive' | 'neutral' | 'negative' => {
  const positive = ['Strong Buy', 'Buy', 'Overweight', 'Outperform'];
  const negative = ['Underweight', 'Underperform', 'Sell'];
  
  if (positive.includes(rating)) return 'positive';
  if (negative.includes(rating)) return 'negative';
  return 'neutral';
};

const getConsensusRating = (opinions: AnalystOpinion[]): string => {
  if (opinions.length === 0) return 'No Coverage';
  
  const avgWeight = opinions.reduce((sum, op) => sum + getRatingWeight(op.rating), 0) / opinions.length;
  
  if (avgWeight >= 4.5) return 'Strong Buy';
  if (avgWeight >= 3.5) return 'Buy';
  if (avgWeight >= 2.5) return 'Hold';
  return 'Sell';
};

const isWithinTimeframe = (asOf: string, timeframe: string): boolean => {
  if (timeframe === 'all') return true;
  
  const opinionDate = new Date(asOf);
  const now = new Date();
  const daysAgo = timeframe === '7d' ? 7 : 30;
  const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
  
  return opinionDate >= cutoffDate;
};

export const useOpinionsStore = create<OpinionsState>()((set, get) => ({
  opinions: analystOpinionsData as AnalystOpinion[],
  filters: {
    rating: 'all',
    timeframe: 'all',
    tickers: [],
  },

  setRatingFilter: (rating) => {
    set((state) => ({
      filters: { ...state.filters, rating },
    }));
  },

  setTimeframeFilter: (timeframe) => {
    set((state) => ({
      filters: { ...state.filters, timeframe },
    }));
  },

  setTickerFilter: (tickers) => {
    set((state) => ({
      filters: { ...state.filters, tickers },
    }));
  },

  resetFilters: () => {
    set({
      filters: {
        rating: 'all',
        timeframe: 'all',
        tickers: [],
      },
    });
  },

  getByTickers: (tickers) => {
    const opinions = get().opinions;
    const normalizedTickers = tickers.map(normalizeTickerSymbol);
    
    return opinions.filter(opinion => {
      const normalizedTicker = normalizeTickerSymbol(opinion.ticker);
      return normalizedTickers.includes(normalizedTicker) || normalizedTickers.includes(opinion.ticker);
    });
  },

  getConsensusForTicker: (ticker) => {
    const opinions = get().getByTickers([ticker]);
    if (opinions.length === 0) return null;
    
    // Calculate consensus
    const avgTarget = opinions.reduce((sum, op) => sum + op.target, 0) / opinions.length;
    const currency = opinions[0].currency;
    
    // Assume current price is last opinion's target for demo
    const currentPrice = opinions[0].target * 0.95; // Mock current price
    const targetDelta = avgTarget - currentPrice;
    const targetDeltaPct = (targetDelta / currentPrice) * 100;
    
    const counts = {
      strongBuy: opinions.filter(op => ['Strong Buy', 'Buy', 'Overweight', 'Outperform'].includes(op.rating)).length,
      buy: opinions.filter(op => ['Buy', 'Overweight'].includes(op.rating)).length,
      neutral: opinions.filter(op => ['Neutral', 'Hold'].includes(op.rating)).length,
      sell: opinions.filter(op => ['Underweight', 'Underperform', 'Sell'].includes(op.rating)).length,
    };
    
    return {
      ticker,
      opinions,
      consensus: {
        rating: getConsensusRating(opinions),
        avgTarget,
        currency,
        targetDelta,
        targetDeltaPct,
        counts,
      },
    };
  },

  getFilteredOpinions: () => {
    const { opinions, filters } = get();
    
    return opinions.filter(opinion => {
      // Rating filter
      if (filters.rating !== 'all') {
        const category = getRatingCategory(opinion.rating);
        if (category !== filters.rating) return false;
      }
      
      // Timeframe filter
      if (!isWithinTimeframe(opinion.asOf, filters.timeframe)) return false;
      
      // Ticker filter
      if (filters.tickers.length > 0) {
        const normalizedTicker = normalizeTickerSymbol(opinion.ticker);
        if (!filters.tickers.includes(opinion.ticker) && !filters.tickers.includes(normalizedTicker)) {
          return false;
        }
      }
      
      return true;
    });
  },

  getAllTickers: () => {
    const opinions = get().opinions;
    const tickers = new Set(opinions.map(op => op.ticker));
    return Array.from(tickers).sort();
  },
}));

// Export helper functions
export { normalizeTickerSymbol, getRatingWeight, getRatingCategory, getConsensusRating };