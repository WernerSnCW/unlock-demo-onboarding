import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// Database-backed portfolio position
export interface DBPosition {
  id: string;
  userId: string;
  accountId?: string;
  assetType: string;
  provider?: string;
  sourceRef?: string;
  symbol?: string;
  name?: string;
  sectorId?: number;
  quantity: string;
  costBasisGbp: string;
  currentPriceGbp: string;
  currentValueGbp: string;
  lastPricedAt?: Date;
  estimatedFx: boolean;
}

// Frontend-compatible position format
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

interface PortfolioDBState {
  positions: Position[];
  isPrivate: boolean;
  lastUpdated: string;
  isLoading: boolean;
  currentInvestorId: string | null;
  
  // Actions
  setCurrentInvestor: (investorId: string) => void;
  fetchPositions: (investorId: string) => Promise<void>;
  addPosition: (position: Omit<Position, 'id'>) => Promise<void>;
  updatePosition: (id: string, updates: Partial<Position>) => Promise<void>;
  removePosition: (id: string) => Promise<void>;
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

// Helper function to convert DB holding to frontend position
const convertDBHoldingToPosition = (holding: DBPosition): Position => {
  return {
    id: holding.id,
    ticker: holding.symbol || 'N/A',
    name: holding.name || 'Unknown',
    market: 'LSE', // Default to LSE, could be enhanced based on provider
    currency: 'GBP',
    quantity: parseFloat(holding.quantity || '0'),
    avgCost: parseFloat(holding.costBasisGbp || '0') / parseFloat(holding.quantity || '1'),
    price: parseFloat(holding.currentPriceGbp || '0'),
    sector: 'Unknown', // Would need sector lookup based on sectorId
    country: 'UK', // Default to UK
    asOf: holding.lastPricedAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    meta: {
      assetType: holding.assetType,
      provider: holding.provider,
      accountId: holding.accountId,
      estimatedFx: holding.estimatedFx
    }
  };
};

// Helper function to convert frontend position to DB holding
const convertPositionToDBHolding = (position: Omit<Position, 'id'>, userId: string): Omit<DBPosition, 'id'> => {
  const costBasis = position.quantity * position.avgCost;
  const currentValue = position.quantity * position.price;
  
  return {
    userId,
    accountId: position.meta?.accountId,
    assetType: position.meta?.assetType || 'equity',
    provider: position.meta?.provider || 'Manual',
    sourceRef: position.meta?.sourceRef,
    symbol: position.ticker,
    name: position.name,
    sectorId: position.meta?.sectorId,
    quantity: position.quantity.toString(),
    costBasisGbp: costBasis.toString(),
    currentPriceGbp: position.price.toString(),
    currentValueGbp: currentValue.toString(),
    estimatedFx: position.meta?.estimatedFx || false
  };
};

export const usePortfolioStoreDB = create<PortfolioDBState>()(
  subscribeWithSelector((set, get) => ({
    positions: [],
    isPrivate: true,
    lastUpdated: new Date().toISOString(),
    isLoading: false,
    currentInvestorId: null,

    setCurrentInvestor: (investorId: string) => {
      set({ currentInvestorId: investorId });
      get().fetchPositions(investorId);
    },

    fetchPositions: async (investorId: string) => {
      set({ isLoading: true });
      try {
        const response = await fetch(`/api/investors/${investorId}/portfolio-holdings`);
        if (response.ok) {
          const holdings: DBPosition[] = await response.json();
          const positions = holdings.map(convertDBHoldingToPosition);
          set({ 
            positions, 
            lastUpdated: new Date().toISOString(),
            isLoading: false 
          });
        } else {
          console.error('Failed to fetch portfolio holdings');
          set({ isLoading: false });
        }
      } catch (error) {
        console.error('Error fetching portfolio holdings:', error);
        set({ isLoading: false });
      }
    },

    addPosition: async (positionData: Omit<Position, 'id'>) => {
      const { currentInvestorId } = get();
      if (!currentInvestorId) {
        throw new Error('No investor selected');
      }

      try {
        const holdingData = convertPositionToDBHolding(positionData, currentInvestorId);
        const response = await fetch(`/api/investors/${currentInvestorId}/portfolio-holdings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(holdingData)
        });

        if (response.ok) {
          const newHolding: DBPosition = await response.json();
          const newPosition = convertDBHoldingToPosition(newHolding);
          
          set((state) => ({
            positions: [...state.positions, newPosition],
            lastUpdated: new Date().toISOString(),
          }));
        } else {
          throw new Error('Failed to create holding');
        }
      } catch (error) {
        console.error('Error adding position:', error);
        throw error;
      }
    },

    updatePosition: async (id: string, updates: Partial<Position>) => {
      try {
        // Find the existing position
        const existingPosition = get().positions.find(p => p.id === id);
        if (!existingPosition) {
          throw new Error('Position not found');
        }

        // Merge updates with existing position
        const updatedPosition = { ...existingPosition, ...updates };
        const holdingData = convertPositionToDBHolding(updatedPosition, get().currentInvestorId!);

        const response = await fetch(`/api/portfolio-holdings/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(holdingData)
        });

        if (response.ok) {
          const updatedHolding: DBPosition = await response.json();
          const updatedPos = convertDBHoldingToPosition(updatedHolding);
          
          set((state) => ({
            positions: state.positions.map(pos => 
              pos.id === id ? updatedPos : pos
            ),
            lastUpdated: new Date().toISOString(),
          }));
        } else {
          throw new Error('Failed to update holding');
        }
      } catch (error) {
        console.error('Error updating position:', error);
        throw error;
      }
    },

    removePosition: async (id: string) => {
      try {
        const response = await fetch(`/api/portfolio-holdings/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          set((state) => ({
            positions: state.positions.filter(pos => pos.id !== id),
            lastUpdated: new Date().toISOString(),
          }));
        } else {
          throw new Error('Failed to delete holding');
        }
      } catch (error) {
        console.error('Error removing position:', error);
        throw error;
      }
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
        return total + (position.quantity * position.price);
      }, 0);
    },

    getTotalGainLoss: () => {
      const positions = get().positions;
      let totalGainAbs = 0;
      let totalCostBasis = 0;

      positions.forEach(position => {
        const marketValue = position.quantity * position.price;
        const costBasis = position.quantity * position.avgCost;
        const gainAbs = marketValue - costBasis;
        
        totalGainAbs += gainAbs;
        totalCostBasis += costBasis;
      });

      const gainPct = totalCostBasis > 0 ? (totalGainAbs / totalCostBasis) * 100 : 0;
      return { gainAbs: totalGainAbs, gainPct };
    },

    getPositionsByTicker: (tickers: string[]) => {
      const positions = get().positions;
      return positions.filter(position => 
        tickers.includes(position.ticker)
      );
    },

    getSectorExposure: () => {
      const positions = get().positions;
      const exposure: Record<string, number> = {};
      const totalValue = get().getTotalValue();

      positions.forEach(position => {
        const value = position.quantity * position.price;
        const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
        
        if (exposure[position.sector]) {
          exposure[position.sector] += percentage;
        } else {
          exposure[position.sector] = percentage;
        }
      });

      return exposure;
    },

    getCountryExposure: () => {
      const positions = get().positions;
      const exposure: Record<string, number> = {};
      const totalValue = get().getTotalValue();

      positions.forEach(position => {
        const value = position.quantity * position.price;
        const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
        
        if (exposure[position.country]) {
          exposure[position.country] += percentage;
        } else {
          exposure[position.country] = percentage;
        }
      });

      return exposure;
    },

    getRiskFlags: () => {
      const positions = get().positions;
      const flags: string[] = [];
      const exposure = get().getSectorExposure();
      
      // Check for concentration risk
      Object.entries(exposure).forEach(([sector, percentage]) => {
        if (percentage > 25) {
          flags.push(`High ${sector} concentration (${percentage.toFixed(1)}%)`);
        }
      });

      // Check for currency exposure
      const nonGBPPositions = positions.filter(p => p.currency !== 'GBP');
      if (nonGBPPositions.length > 0) {
        flags.push('Currency exposure detected');
      }

      return flags;
    },
  }))
);