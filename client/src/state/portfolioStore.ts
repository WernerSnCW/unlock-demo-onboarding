import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import portfolioData from '../mocks/portfolio.json';

export interface Position {
  id: string;
  ticker: string;
  name: string;
  market: string;
  currency: string;
  quantity: number;
  avgCost: number;
  price: number;
  sector: string;
  country: string;
  asOf: string;
  meta?: Record<string, any>;
}

interface PortfolioState {
  positions: Position[];
  isPrivate: boolean;
  lastUpdated: string;
  
  // Actions
  addPosition: (position: Omit<Position, 'id'>) => void;
  updatePosition: (id: string, updates: Partial<Position>) => void;
  removePosition: (id: string) => void;
  setPositions: (positions: Position[]) => void;
  clearPortfolio: () => void;
  togglePrivacy: () => void;
  
  // Computed values
  getTotalValue: () => number;
  getTotalGainLoss: () => { gainAbs: number; gainPct: number };
  getPositionsByTicker: (tickers: string[]) => Position[];
  getSectorExposure: () => Record<string, number>;
  getCountryExposure: () => Record<string, number>;
  getRiskFlags: () => string[];
}

// Helper functions
const formatCurrency = (amount: number, currency: string): number => {
  // Mock FX rates for prototype - in real app would use live rates
  const fxRates: Record<string, number> = {
    USD: 0.79, // USD to GBP
    GBP: 1.0,
    EUR: 0.85,
  };
  return amount * (fxRates[currency] || 1.0);
};

const calculateMarketValue = (position: Position): number => {
  return position.quantity * position.price;
};

const calculateGain = (position: Position): { gainAbs: number; gainPct: number } => {
  const marketValue = calculateMarketValue(position);
  const costBasis = position.quantity * position.avgCost;
  const gainAbs = marketValue - costBasis;
  const gainPct = costBasis > 0 ? (gainAbs / costBasis) * 100 : 0;
  return { gainAbs, gainPct };
};

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      positions: portfolioData as Position[],
      isPrivate: true,
      lastUpdated: new Date().toISOString(),

      addPosition: (positionData) => {
        const newPosition: Position = {
          ...positionData,
          id: `pos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
        
        set((state) => ({
          positions: [...state.positions, newPosition],
          lastUpdated: new Date().toISOString(),
        }));
      },

      updatePosition: (id, updates) => {
        set((state) => ({
          positions: state.positions.map(pos => 
            pos.id === id ? { ...pos, ...updates } : pos
          ),
          lastUpdated: new Date().toISOString(),
        }));
      },

      removePosition: (id) => {
        set((state) => ({
          positions: state.positions.filter(pos => pos.id !== id),
          lastUpdated: new Date().toISOString(),
        }));
      },

      setPositions: (positions) => {
        set({
          positions,
          lastUpdated: new Date().toISOString(),
        });
      },

      clearPortfolio: () => {
        set({
          positions: [],
          lastUpdated: new Date().toISOString(),
        });
      },

      togglePrivacy: () => {
        set((state) => ({
          isPrivate: !state.isPrivate,
        }));
      },

      getTotalValue: () => {
        const positions = get().positions;
        return positions.reduce((total, position) => {
          const marketValue = calculateMarketValue(position);
          const gbpValue = formatCurrency(marketValue, position.currency);
          return total + gbpValue;
        }, 0);
      },

      getTotalGainLoss: () => {
        const positions = get().positions;
        let totalGainAbs = 0;
        let totalCostBasis = 0;

        positions.forEach(position => {
          const marketValue = calculateMarketValue(position);
          const costBasis = position.quantity * position.avgCost;
          const gainAbs = marketValue - costBasis;
          
          totalGainAbs += formatCurrency(gainAbs, position.currency);
          totalCostBasis += formatCurrency(costBasis, position.currency);
        });

        const gainPct = totalCostBasis > 0 ? (totalGainAbs / totalCostBasis) * 100 : 0;
        return { gainAbs: totalGainAbs, gainPct };
      },

      getPositionsByTicker: (tickers) => {
        const positions = get().positions;
        return positions.filter(pos => tickers.includes(pos.ticker));
      },

      getSectorExposure: () => {
        const positions = get().positions;
        const totalValue = get().getTotalValue();
        const sectorValues: Record<string, number> = {};

        positions.forEach(position => {
          const marketValue = calculateMarketValue(position);
          const gbpValue = formatCurrency(marketValue, position.currency);
          const percentage = totalValue > 0 ? (gbpValue / totalValue) * 100 : 0;
          
          sectorValues[position.sector] = (sectorValues[position.sector] || 0) + percentage;
        });

        return sectorValues;
      },

      getCountryExposure: () => {
        const positions = get().positions;
        const totalValue = get().getTotalValue();
        const countryValues: Record<string, number> = {};

        positions.forEach(position => {
          const marketValue = calculateMarketValue(position);
          const gbpValue = formatCurrency(marketValue, position.currency);
          const percentage = totalValue > 0 ? (gbpValue / totalValue) * 100 : 0;
          
          countryValues[position.country] = (countryValues[position.country] || 0) + percentage;
        });

        return countryValues;
      },

      getRiskFlags: () => {
        const positions = get().positions;
        const totalValue = get().getTotalValue();
        const flags: string[] = [];

        // Check single position concentration
        positions.forEach(position => {
          const marketValue = calculateMarketValue(position);
          const gbpValue = formatCurrency(marketValue, position.currency);
          const percentage = totalValue > 0 ? (gbpValue / totalValue) * 100 : 0;
          
          if (percentage > 30) {
            flags.push(`Concentration risk: ${position.ticker} represents ${percentage.toFixed(1)}% of portfolio`);
          }
        });

        // Check sector concentration
        const sectorExposure = get().getSectorExposure();
        Object.entries(sectorExposure).forEach(([sector, percentage]) => {
          if (percentage > 60) {
            flags.push(`Sector concentration: ${sector} represents ${percentage.toFixed(1)}% of portfolio`);
          }
        });

        return flags;
      },
    }),
    {
      name: 'portfolio-storage',
      version: 1,
    }
  )
);

// Export helper functions for use in components
export { calculateMarketValue, calculateGain, formatCurrency };