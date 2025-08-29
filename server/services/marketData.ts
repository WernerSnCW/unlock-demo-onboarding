// Live Market Data Service
// Fetches real-time stock and crypto prices from free APIs

import fetch from 'node-fetch';

interface MarketDataResponse {
  [symbol: string]: {
    price: number;
    change: number;
    changePercent: number;
    lastUpdate: string;
  };
}

interface AlphaVantageQuote {
  "Global Quote": {
    "01. symbol": string;
    "05. price": string;
    "09. change": string;
    "10. change percent": string;
  };
}

interface YahooFinanceData {
  chart: {
    result: Array<{
      meta: {
        regularMarketPrice: number;
        previousClose: number;
        symbol: string;
      };
    }>;
  };
}

interface CoinGeckoResponse {
  [coinId: string]: {
    usd: number;
    usd_24h_change: number;
  };
}

class MarketDataService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 60000; // 1 minute cache
  
  // Using free APIs without API keys for demo
  private readonly YAHOO_FINANCE_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';
  private readonly COINGECKO_BASE = 'https://api.coingecko.com/api/v3/simple/price';
  
  private isCacheValid(symbol: string): boolean {
    const cached = this.cache.get(symbol);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.CACHE_DURATION;
  }

  private getCachedData(symbol: string) {
    const cached = this.cache.get(symbol);
    return cached ? cached.data : null;
  }

  private setCachedData(symbol: string, data: any) {
    this.cache.set(symbol, {
      data,
      timestamp: Date.now()
    });
  }

  async getStockPrice(symbol: string): Promise<any> {
    if (this.isCacheValid(symbol)) {
      return this.getCachedData(symbol);
    }

    try {
      console.log(`Fetching live data for ${symbol}...`);
      const response = await fetch(`${this.YAHOO_FINANCE_BASE}/${symbol}?interval=1m&range=1d`);
      
      if (!response.ok) {
        throw new Error(`Yahoo Finance API error: ${response.status}`);
      }

      const data = await response.json() as YahooFinanceData;
      const result = data.chart.result[0];
      
      if (!result) {
        throw new Error(`No data found for symbol ${symbol}`);
      }

      const currentPrice = result.meta.regularMarketPrice;
      const previousClose = result.meta.previousClose;
      const change = currentPrice - previousClose;
      const changePercent = (change / previousClose) * 100;

      const marketData = {
        symbol,
        price: currentPrice,
        change: change,
        changePercent: changePercent,
        lastUpdate: new Date().toISOString()
      };

      this.setCachedData(symbol, marketData);
      return marketData;
    } catch (error) {
      console.error(`Failed to fetch data for ${symbol}:`, error);
      
      // Return fallback mock data if API fails
      return this.getMockData(symbol);
    }
  }

  async getCryptoPrice(coinId: string): Promise<any> {
    if (this.isCacheValid(coinId)) {
      return this.getCachedData(coinId);
    }

    try {
      console.log(`Fetching crypto data for ${coinId}...`);
      const response = await fetch(
        `${this.COINGECKO_BASE}?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`
      );
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json() as CoinGeckoResponse;
      const coinData = data[coinId];
      
      if (!coinData) {
        throw new Error(`No data found for coin ${coinId}`);
      }

      const marketData = {
        symbol: coinId.toUpperCase(),
        price: coinData.usd,
        change: (coinData.usd * coinData.usd_24h_change) / 100,
        changePercent: coinData.usd_24h_change,
        lastUpdate: new Date().toISOString()
      };

      this.setCachedData(coinId, marketData);
      return marketData;
    } catch (error) {
      console.error(`Failed to fetch crypto data for ${coinId}:`, error);
      
      // Return fallback mock data if API fails
      return this.getMockCryptoData(coinId);
    }
  }

  async getMultipleQuotes(symbols: string[]): Promise<MarketDataResponse> {
    const quotes: MarketDataResponse = {};
    
    // Process stocks and crypto separately
    const stockSymbols = symbols.filter(s => !s.includes('-USD') && s !== 'BTC-USD');
    const cryptoSymbols = symbols.filter(s => s.includes('-USD') || s === 'BTC-USD');

    // Fetch stock data
    const stockPromises = stockSymbols.map(async (symbol) => {
      try {
        const data = await this.getStockPrice(symbol);
        quotes[symbol] = data;
      } catch (error) {
        console.error(`Failed to fetch ${symbol}:`, error);
        quotes[symbol] = this.getMockData(symbol);
      }
    });

    // Fetch crypto data 
    const cryptoPromises = cryptoSymbols.map(async (symbol) => {
      try {
        // Map crypto symbols to CoinGecko IDs
        let coinId: string;
        switch(symbol) {
          case 'BTC-USD':
            coinId = 'bitcoin';
            break;
          case 'ETH-USD':
            coinId = 'ethereum';
            break;
          default:
            // Fallback for other cryptos
            coinId = symbol.toLowerCase().replace('-usd', '');
        }
        const data = await this.getCryptoPrice(coinId);
        quotes[symbol] = data;
      } catch (error) {
        console.error(`Failed to fetch crypto ${symbol}:`, error);
        quotes[symbol] = this.getMockCryptoData(symbol);
      }
    });

    // Wait for all requests to complete
    await Promise.all([...stockPromises, ...cryptoPromises]);
    
    return quotes;
  }

  private getMockData(symbol: string) {
    // Fallback mock data with realistic values
    const basePrice = symbol === 'AAPL' ? 188.85 : 
                     symbol === 'MSFT' ? 389.12 : 
                     symbol === 'NVDA' ? 892.45 : 
                     symbol === 'GOOGL' ? 160.71 : 
                     symbol === 'TSLA' ? 262.12 : 
                     symbol === 'VOO' ? 430.85 : 250;

    const changePercent = (Math.random() - 0.5) * 4; // ±2%
    const change = basePrice * (changePercent / 100);

    return {
      symbol,
      price: basePrice + change,
      change: change,
      changePercent: changePercent,
      lastUpdate: new Date().toISOString()
    };
  }

  private getMockCryptoData(symbol: string) {
    const basePrice = symbol === 'BTC-USD' ? 40000 : 2500;
    const changePercent = (Math.random() - 0.5) * 10; // ±5%
    const change = basePrice * (changePercent / 100);

    return {
      symbol,
      price: basePrice + change,
      change: change,
      changePercent: changePercent,
      lastUpdate: new Date().toISOString()
    };
  }

  // Clear old cache entries periodically
  clearCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.CACHE_DURATION * 2) {
        this.cache.delete(key);
      }
    }
  }
}

export const marketDataService = new MarketDataService();

// Clear cache every 5 minutes
setInterval(() => {
  marketDataService.clearCache();
}, 5 * 60 * 1000);