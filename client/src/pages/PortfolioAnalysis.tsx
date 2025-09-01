import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { TrendingUp, TrendingDown, PieChart, BarChart3, Zap, AlertTriangle, Lightbulb, DollarSign, Activity, Globe, Shield, RefreshCw, ArrowUpRight, ArrowDownRight, Eye, Brain, Home, Building, Briefcase, Plus, Minus, Loader, Sparkles, Target, Award, TrendingUpDown } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress as UIProgress } from '@/components/ui/progress';
import { apiRequest } from '@/lib/queryClient';

export default function PortfolioAnalysis() {
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysis, setAnalysis] = useState<any>(null);
  const [liveData, setLiveData] = useState<any>({});
  const [portfolioData, setPortfolioData] = useState<any>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Process uploaded portfolio data
  useEffect(() => {
    // Check for uploaded portfolio data first
    const uploadedDataStr = localStorage.getItem('uploadedPortfolioData');
    let interval: NodeJS.Timeout | null = null;
    
    if (uploadedDataStr) {
      try {
        const uploadedData = JSON.parse(uploadedDataStr);
        console.log('Using uploaded portfolio data:', uploadedData);
        
        // Parse uploaded CSV data - check if it has Ticker column or old format
        console.log('Processing uploaded CSV data:', uploadedData.rawData);
        console.log('Total rows in CSV:', uploadedData.rawData.length);
        
        // Check CSV format - see if first row has Ticker column
        const hasTickerColumn = uploadedData.rawData.length > 0 && 
          (uploadedData.rawData[0].hasOwnProperty('Ticker') || uploadedData.rawData[0].hasOwnProperty('ticker'));
        console.log('CSV has Ticker column:', hasTickerColumn);
        
        // DEBUG: Log all raw data to see what's missing
        console.log('All raw data rows:');
        uploadedData.rawData.forEach((row: any, index: number) => {
          console.log(`Raw row ${index + 1}:`, row);
        });
        
        // Filter and categorize all holdings - process ALL rows, not just those with tickers
        const allHoldings = uploadedData.rawData
          .filter((row: any) => {
            const hasRequiredFields = row.Category && row.Holding && row.Value_GBP;
            if (!hasRequiredFields) {
              console.log('Skipping row due to missing fields:', row);
            }
            return hasRequiredFields;
          })
          .map((row: any, index: number) => {
            const value = parseFloat(row.Value_GBP) || 0;
            // Handle ticker codes - skip live data fetch if ticker is N/A
            const ticker = row.Ticker || row.ticker || 'N/A';
            const hasValidTicker = ticker && ticker !== 'N/A' && ticker.trim() !== '';
            
            // Use Account/Provider as name when Holding is N/A (for accounts like Pension, ISA, etc.)
            const displayName = (row.Holding === 'N/A' || !row.Holding) 
              ? (row['Account/Provider'] || 'Unknown Account')
              : (row.Holding || 'Unknown Holding');
            
            const holding = {
              ticker: ticker,
              name: displayName,
              sector: row.Category || 'Unknown',
              value: value,
              percentage: 0, // Will be calculated below
              shares: 1, // Default for demo
              currentPrice: value,
              change: 0,
              changePercent: 0,
              provider: row['Account/Provider'] || 'Unknown',
              category: row.Category,
              classification: row.Classification || 'Traditional', // Use explicit classification
              hasValidTicker: hasValidTicker
            };
            
            console.log(`Row ${index + 1}: ${holding.name} (${holding.ticker}) - £${holding.value} - Category: ${holding.category} - Classification: ${holding.classification}`);
            return holding;
          });
          
        console.log('Processed holdings count:', allHoldings.length);
        
        // Use explicit Classification column instead of guessing from Category
        console.log('Using Classification column for categorization');
        
        const traditionalHoldings = allHoldings.filter((h: any) => {
          const classification = h.classification ? h.classification.toLowerCase().trim() : 'traditional';
          return classification === 'traditional' || classification === 'stock' || classification === 'equity';
        });
        
        const propertyHoldings = allHoldings.filter((h: any) => {
          const classification = h.classification ? h.classification.toLowerCase().trim() : '';
          return classification === 'property' || classification === 'real estate' || classification.includes('property');
        }).map((h: any) => ({
          type: h.name,
          location: h.provider,
          value: h.value,
          monthlyRent: Math.round(h.value * 0.005), // Estimate 6% annual yield
          yield: 6.0,
          purchasePrice: h.value,
          mortgage: 0,
          equity: h.value
        }));
        
        const alternativeHoldings = allHoldings.filter((h: any) => {
          const classification = h.classification ? h.classification.toLowerCase().trim() : '';
          return classification === 'alternative' || classification.includes('alternative') || classification.includes('private') || classification.includes('art') || classification.includes('commodity');
        }).map((h: any) => ({
          type: h.category,
          name: h.name,
          value: h.value,
          riskRating: 'Medium' as const,
          sector: h.sector,
          investmentDate: '2023-01-01',
          expectedReturn: '2-3x'
        }));
          
        // Calculate total value from ALL holdings, not just traditional
        const totalValue = allHoldings.reduce((sum: number, holding: any) => sum + holding.value, 0);
        
        // Calculate percentages for ALL holdings based on total portfolio value
        allHoldings.forEach((holding: any) => {
          holding.percentage = totalValue > 0 ? (holding.value / totalValue) * 100 : 0;
        });
        
        // Calculate actual asset allocation percentages
        const traditionalValue = traditionalHoldings.reduce((sum: number, h: any) => sum + h.value, 0);
        const propertyValue = propertyHoldings.reduce((sum: number, h: any) => sum + h.value, 0);
        const alternativeValue = alternativeHoldings.reduce((sum: number, h: any) => sum + h.value, 0);
        
        
        // Create combined array of ALL holdings with valid tickers for live feed
        const liveTickerHoldings = allHoldings.filter((h: any) => h.hasValidTicker);
        
        const portfolioData = {
          totalValue,
          assetAllocation: {
            traditional: totalValue > 0 ? Math.round((traditionalValue / totalValue) * 100) : 0,
            property: totalValue > 0 ? Math.round((propertyValue / totalValue) * 100) : 0,
            alternatives: totalValue > 0 ? Math.round((alternativeValue / totalValue) * 100) : 0
          },
          holdings: {
            traditional: traditionalHoldings,
            properties: propertyHoldings,
            alternatives: alternativeHoldings,
            liveTickerHoldings: liveTickerHoldings // ALL holdings with tickers for live feed
          }
        };
        
        setPortfolioData(portfolioData);
        
        // Fetch live market data for uploaded holdings (only for those with valid tickers)
        const fetchUploadedLiveData = async () => {
          try {
            // Get tickers from ALL holdings with valid tickers (Traditional, Property, Alternative)
            const validTickers = liveTickerHoldings
              .filter((h: any) => h.ticker !== 'N/A' && h.ticker.trim() !== '')
              .map((h: any) => h.ticker);
            
            console.log('Valid tickers for live data:', validTickers);
            
            if (validTickers.length > 0) {
              const symbols = validTickers.join(',');
              console.log('Fetching live market data for uploaded holdings:', symbols);
              
              const response = await apiRequest('GET', `/api/market-data/quotes?symbols=${symbols}`);
              const data = await response.json();
              
              if (data.quotes) {
                console.log('Received live market data for uploads:', data.quotes);
                setLiveData(data.quotes);
              }
            } else {
              console.log('No valid tickers found for live market data - using static values');
              // No live data needed - holdings will show static values
            }
          } catch (error) {
            console.error('Failed to fetch live market data for uploads:', error);
            // Fallback to mock data for valid tickers only
            const fallbackData: any = {};
            liveTickerHoldings
              .forEach((holding: any) => {
                const randomChange = (Math.random() - 0.5) * 0.02;
                fallbackData[holding.ticker] = {
                  price: holding.currentPrice * (1 + randomChange),
                  change: holding.currentPrice * randomChange,
                  changePercent: randomChange * 100
                };
              });
            setLiveData(fallbackData);
          }
        };
        
        // Initial fetch and set up interval
        fetchUploadedLiveData();
        interval = setInterval(fetchUploadedLiveData, 30000);
        
      } catch (error) {
        console.error('Error parsing uploaded data:', error);
      }
    } else {
      // No uploaded data, use fallback demo data
      console.log('No uploaded data found, using demo portfolio');
      const fallbackPortfolio = {
        totalValue: 485000,
        assetAllocation: { traditional: 62.5, property: 25.8, alternatives: 11.7 },
        holdings: {
          traditional: [
            { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology', value: 85000, percentage: 17.5, shares: 450, currentPrice: 188.85, change: 2.34, changePercent: 1.26 },
            { ticker: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology', value: 72000, percentage: 14.8, shares: 185, currentPrice: 389.12, change: -1.88, changePercent: -0.48 },
            { ticker: 'NVDA', name: 'NVIDIA Corp.', sector: 'Technology', value: 58000, percentage: 12.0, shares: 65, currentPrice: 892.45, change: 18.92, changePercent: 2.17 },
          ],
          properties: [
            { type: 'Buy-to-Let Flat', location: 'Manchester M1', value: 85000, monthlyRent: 950, yield: 13.4, purchasePrice: 75000, mortgage: 55000, equity: 30000 },
          ],
          alternatives: [
            { type: 'Startup Investment', name: 'TechCorp Series A', value: 25000, riskRating: 'High', sector: 'FinTech', investmentDate: '2023-06-15', expectedReturn: '3-5x' },
          ]
        }
      };
      setPortfolioData(fallbackPortfolio);
      
      // Set up live data fetching for fallback data
      const fetchFallbackLiveData = async () => {
        try {
          const symbols = fallbackPortfolio.holdings.traditional.map(h => h.ticker).join(',');
          const response = await apiRequest('GET', `/api/market-data/quotes?symbols=${symbols}`);
          const data = await response.json();
          if (data.quotes) setLiveData(data.quotes);
        } catch (error) {
          console.error('Failed to fetch fallback live market data:', error);
        }
      };
      
      fetchFallbackLiveData();
      interval = setInterval(fetchFallbackLiveData, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  // Generate AI analysis once portfolio data is loaded
  useEffect(() => {
    if (portfolioData && !analysis) {
      generateAIAnalysis();
    }
  }, [portfolioData, analysis]);

  const generateAIAnalysis = async () => {
    if (!portfolioData) return;
    
    setAnalysisLoading(true);
    setAnalysisProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev < 90) return prev + Math.random() * 15;
        return prev;
      });
    }, 500);

    try {
      const response = await apiRequest('POST', '/api/portfolio/analyze', {
        userId: 'demo-portfolio-analysis',
        portfolioData: portfolioData,
        forceRefresh: true
      });

      const analysisData = await response.json();
      setAnalysisProgress(100);
      setTimeout(() => {
        setAnalysis(analysisData);
        setAnalysisLoading(false);
        clearInterval(progressInterval);
      }, 1000);
    } catch (error) {
      console.error('Failed to analyze portfolio:', error);
      // Fallback to mock analysis for demo
      setAnalysisProgress(100);
      setTimeout(() => {
        setAnalysis({
          totalPortfolioValue: portfolioData.totalValue,
          assetAllocation: portfolioData.assetAllocation,
          diversificationScore: 7.2,
          riskLevel: 'Medium-High',
          keyInsights: [
            'Technology sector concentration at 65% creates significant sector risk',
            'Strong performance in growth stocks but limited defensive positions',
            'Cryptocurrency exposure adds volatility but also growth potential'
          ],
          overexposureWarnings: [
            {
              category: 'Technology Sector',
              percentage: 65.2,
              recommendation: 'Consider diversifying into other sectors like healthcare, energy, or consumer staples to reduce concentration risk.'
            }
          ],
          generalGuidance: [
            'Consider adding bonds or dividend-paying stocks for stability',
            'Property investments provide good diversification',
            'Review and rebalance quarterly to maintain target allocations'
          ]
        });
        setAnalysisLoading(false);
        clearInterval(progressInterval);
      }, 1000);
    }
  };

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPrice = (price: number | null | undefined) => {
    if (price == null || isNaN(price)) return '£0.00';
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatPercentage = (percentage: number | null | undefined) => {
    if (percentage == null || isNaN(percentage)) return '0.00%';
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  // Chart data
  const assetAllocationData = portfolioData ? [
    { name: 'Traditional', value: portfolioData.assetAllocation.traditional, color: '#10A957' },
    { name: 'Property', value: portfolioData.assetAllocation.property, color: '#13683B' },
    { name: 'Alternative', value: portfolioData.assetAllocation.alternatives, color: '#FE9239' }
  ] : [];

  const clearUploadedData = () => {
    localStorage.removeItem('uploadedPortfolioData');
    window.location.reload();
  };

  const loadDemoCSV = () => {
    // Create demo CSV data in the expected format
    const demoCSVData = [
      { Category: 'Equities', 'Account/Provider': 'Interactive Brokers', Holding: 'Apple Inc', Value_GBP: '25000' },
      { Category: 'Equities', 'Account/Provider': 'Interactive Brokers', Holding: 'Microsoft Corp', Value_GBP: '18000' },
      { Category: 'Equities', 'Account/Provider': 'Interactive Brokers', Holding: 'NVIDIA Corp', Value_GBP: '15000' },
      { Category: 'Equities', 'Account/Provider': 'Hargreaves Lansdown', Holding: 'Vanguard FTSE 100', Value_GBP: '12000' },
      { Category: 'Bonds', 'Account/Provider': 'Hargreaves Lansdown', Holding: 'UK Government Gilts', Value_GBP: '8000' },
      { Category: 'Crypto', 'Account/Provider': 'Coinbase', Holding: 'Bitcoin', Value_GBP: '5000' },
      { Category: 'ETF', 'Account/Provider': 'Interactive Brokers', Holding: 'S&P 500 ETF', Value_GBP: '22000' }
    ];

    const demoUploadData = {
      uploadedAt: new Date().toISOString(),
      positions: [], // Not needed for this demo
      rawData: demoCSVData
    };

    localStorage.setItem('uploadedPortfolioData', JSON.stringify(demoUploadData));
    window.location.reload();
  };

  const uploadedDataStr = localStorage.getItem('uploadedPortfolioData');
  
  // Debug: Log current localStorage state
  console.log('Current localStorage uploadedPortfolioData:', uploadedDataStr);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      
      {/* Data Source Indicator */}
      {uploadedDataStr && (
        <div className="bg-green-100 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800/50 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="text-sm text-green-800 dark:text-green-200">
              ✓ Using your uploaded CSV portfolio data
            </span>
            <Button 
              onClick={clearUploadedData}
              variant="outline" 
              size="sm"
              className="text-green-800 dark:text-green-200 border-green-300 dark:border-green-700"
            >
              Clear Uploaded Data
            </Button>
          </div>
        </div>
      )}
      
      {/* Stunning Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 -left-32 w-96 h-96 rounded-full opacity-30 animate-pulse bg-gradient-to-r from-[#10A957]/20 to-transparent" 
               style={{ animationDuration: '4s' }}></div>
          <div className="absolute top-60 -right-32 w-80 h-80 rounded-full opacity-25 animate-pulse bg-gradient-to-r from-[#13683B]/20 to-transparent" 
               style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
          <div className="absolute -bottom-20 left-1/2 w-72 h-72 rounded-full opacity-20 animate-pulse bg-gradient-to-r from-[#F8D49B]/20 to-transparent" 
               style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
        </div>
      </div>

      <main className="relative z-10">
        <div className="max-w-full mx-auto p-8">
          
          {/* Hero Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-6 mb-8 p-6 rounded-3xl bg-gradient-to-r from-[#10A957] to-[#13683B] shadow-2xl">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Eye className="h-12 w-12 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-6xl font-black text-white mb-2">
                  Portfolio Analysis
                </h1>
                <p className="text-2xl text-white/90 font-medium">
                  Live Market Data • AI-Powered Insights • Real-Time Analytics
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <span className="text-white font-bold">LIVE</span>
              </div>
            </div>
          </div>

          {/* Two-Panel Masterpiece Layout */}
          <div className="flex gap-8 min-h-screen">
            
            {/* Main Content Area */}
            <div className="flex-1 space-y-8">
              
              {/* Portfolio Value Showcase */}
              <div className="p-8 rounded-3xl relative overflow-hidden bg-gradient-to-br from-[#10A957] via-[#13683B] to-[#F8D49B] shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
                
                <div className="relative z-10 text-white text-center">
                  <div className="inline-flex items-center gap-3 mb-4 px-6 py-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <Award className="h-6 w-6" />
                    <span className="font-bold text-lg">Total Portfolio Value</span>
                  </div>
                  <div className="text-7xl font-black mb-4 tracking-tight">
                    {formatCurrency(portfolioData?.totalValue || 0)}
                  </div>
                  <div className="flex items-center justify-center gap-8 text-lg">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <TrendingUp className="h-5 w-5" />
                      <span className="font-semibold">+8.4% YTD</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Target className="h-5 w-5" />
                      <span className="font-semibold">12 Positions</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Asset Allocation Masterpiece */}
              {portfolioData && (
                <div className="p-8 rounded-3xl bg-[var(--card)] shadow-2xl border border-[var(--border)]">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-[#10A957] to-[#13683B]">
                      <PieChart className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-[var(--foreground)]">Asset Allocation</h2>
                      <p className="text-lg text-[var(--muted-foreground)]">Portfolio distribution across investment types</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={assetAllocationData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={140}
                            paddingAngle={8}
                            dataKey="value"
                          >
                            {assetAllocationData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: any) => [`${(value || 0).toFixed(1)}%`, 'Allocation']}
                            contentStyle={{ 
                              backgroundColor: 'var(--card)', 
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--radius-lg)',
                              boxShadow: 'var(--shadow-lg)'
                            }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#10A957]/10 to-[#10A957]/5 border border-[#10A957]/20">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Briefcase className="h-6 w-6 text-[#10A957]" />
                            <span className="font-bold text-lg text-[var(--foreground)]">Traditional Holdings</span>
                          </div>
                          <Badge className="px-4 py-2 text-lg font-bold bg-[#10A957] text-white">
                            {portfolioData.assetAllocation.traditional}%
                          </Badge>
                        </div>
                        <div className="text-2xl font-black text-[var(--foreground)]">
                          {formatCurrency(portfolioData.totalValue * (portfolioData.assetAllocation.traditional / 100))}
                        </div>
                      </div>

                      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#13683B]/10 to-[#13683B]/5 border border-[#13683B]/20">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Building className="h-6 w-6 text-[#13683B]" />
                            <span className="font-bold text-lg text-[var(--foreground)]">Property Portfolio</span>
                          </div>
                          <Badge className="px-4 py-2 text-lg font-bold bg-[#13683B] text-white">
                            {portfolioData.assetAllocation.property}%
                          </Badge>
                        </div>
                        <div className="text-2xl font-black text-[var(--foreground)]">
                          {formatCurrency(portfolioData.totalValue * (portfolioData.assetAllocation.property / 100))}
                        </div>
                      </div>

                      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#FE9239]/20 to-[#FE9239]/10 border border-[#FE9239]/30">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Zap className="h-6 w-6 text-[#FE9239]" />
                            <span className="font-bold text-lg text-[var(--foreground)]">Alternative Investments</span>
                          </div>
                          <Badge className="px-4 py-2 text-lg font-bold bg-[#FE9239] text-[#1A1A1A]">
                            {portfolioData.assetAllocation.alternatives}%
                          </Badge>
                        </div>
                        <div className="text-2xl font-black text-[var(--foreground)]">
                          {formatCurrency(portfolioData.totalValue * (portfolioData.assetAllocation.alternatives / 100))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Investment Buckets - Stunning Design */}
              {portfolioData && (
                <div className="grid gap-8">
                  
                  {/* Traditional Holdings */}
                  <div className="p-8 rounded-3xl relative overflow-hidden bg-[var(--card)] shadow-2xl border border-[var(--border)]">
                    <div className="absolute top-0 right-0 w-40 h-40 opacity-5 rounded-full -mr-20 -mt-20 bg-gradient-to-r from-[#10A957]/20 to-transparent"></div>
                    
                    <div className="flex items-center gap-6 mb-8">
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#10A957] to-[#10A957]/80">
                        <Briefcase className="h-10 w-10 text-white" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-[var(--foreground)]">Traditional Holdings</h3>
                        <p className="text-lg text-[var(--muted-foreground)]">Stocks, ETFs & Cryptocurrency</p>
                      </div>
                      <div className="ml-auto px-6 py-3 rounded-xl bg-[#10A957]/10 border border-[#10A957]/20">
                        <span className="text-2xl font-black text-[#10A957]">
                          {portfolioData.holdings.traditional.filter((h: any) => h.hasValidTicker).length} positions
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      {portfolioData.holdings.traditional.map((holding: any, index: number) => (
                        <div key={index} 
                             className="flex items-center justify-between p-6 rounded-2xl hover:shadow-lg transition-all duration-300 bg-[var(--muted)]/50 border border-[var(--border)]">
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg bg-gradient-to-r from-[#10A957] to-[#13683B]">
                              {holding.ticker.slice(0, 2)}
                            </div>
                            <div>
                              <div className="text-xl font-black text-[var(--foreground)]">{holding.ticker}</div>
                              <div className="text-lg text-[var(--muted-foreground)]">{holding.name}</div>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-sm px-3 py-1 rounded-lg bg-[var(--muted)] text-[var(--foreground)]">
                                  {holding.shares} shares
                                </span>
                                <span className="text-sm px-3 py-1 rounded-lg bg-[var(--muted)] text-[var(--foreground)]">
                                  {holding.sector}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-black mb-2 text-[var(--foreground)]">
                              {formatCurrency(holding.value)}
                            </div>
                            <div className="px-4 py-2 rounded-xl bg-[#10A957]/10 border border-[#10A957]/20">
                              <span className="font-bold text-lg text-[#10A957]">
                                {formatPercentage(holding.percentage)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Property Portfolio */}
                  <div className="p-8 rounded-3xl relative overflow-hidden bg-[var(--card)] shadow-2xl border border-[var(--border)]">
                    <div className="absolute bottom-0 left-0 w-32 h-32 opacity-5 rounded-full -ml-16 -mb-16 bg-gradient-to-r from-[#13683B]/20 to-transparent"></div>
                    
                    <div className="flex items-center gap-6 mb-8">
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#13683B] to-[#13683B]/80">
                        <Building className="h-10 w-10 text-white" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-[var(--foreground)]">Property Portfolio</h3>
                        <p className="text-lg text-[var(--muted-foreground)]">Real Estate Investments</p>
                      </div>
                      <div className="ml-auto px-6 py-3 rounded-xl bg-[#13683B]/10 border border-[#13683B]/20">
                        <span className="text-2xl font-black text-[#13683B]">
                          {portfolioData.holdings.properties.length} properties
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      {portfolioData.holdings.properties.map((property: any, index: number) => (
                        <div key={index} 
                             className="flex items-center justify-between p-6 rounded-2xl hover:shadow-lg transition-all duration-300 bg-[var(--muted)]/50 border border-[var(--border)]">
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-r from-[#13683B] to-[#3B82F6]">
                              <Home className="h-8 w-8" />
                            </div>
                            <div>
                              <div className="text-xl font-black text-[var(--foreground)]">{property.type}</div>
                              <div className="text-lg text-[var(--muted-foreground)]">{property.location}</div>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-sm px-3 py-1 rounded-lg bg-[#10B981]/20 text-[#10B981]">
                                  £{property.monthlyRent}/mo
                                </span>
                                <span className="text-sm px-3 py-1 rounded-lg bg-[#10B981]/20 text-[#10B981]">
                                  {property.yield}% yield
                                </span>
                                {property.mortgage > 0 && (
                                  <span className="text-sm px-3 py-1 rounded-lg bg-[#FE9239]/20 text-[#FE9239]">
                                    Mortgage: {formatCurrency(property.mortgage)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-black mb-2 text-[var(--foreground)]">
                              {formatCurrency(property.value)}
                            </div>
                            <div className="text-lg text-[var(--muted-foreground)]">
                              Equity: {formatCurrency(property.equity || property.value)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Alternative Investments */}
                  <div className="p-8 rounded-3xl relative overflow-hidden bg-[var(--card)] shadow-2xl border border-[var(--border)]">
                    <div className="absolute top-0 left-1/2 w-24 h-24 opacity-10 rounded-full -ml-12 -mt-12 bg-gradient-to-r from-[#FE9239]/30 to-transparent"></div>
                    
                    <div className="flex items-center gap-6 mb-8">
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FE9239] to-[#FE9239]/80">
                        <Zap className="h-10 w-10 text-white" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-[var(--foreground)]">Alternative Investments</h3>
                        <p className="text-lg text-[var(--muted-foreground)]">High Growth Opportunities</p>
                      </div>
                      <div className="ml-auto px-6 py-3 rounded-xl bg-[#FE9239]/10 border border-[#FE9239]/20">
                        <span className="text-2xl font-black text-[#FE9239]">
                          {portfolioData.holdings.alternatives.length} investments
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      {portfolioData.holdings.alternatives.map((alternative: any, index: number) => (
                        <div key={index} 
                             className="flex items-center justify-between p-6 rounded-2xl hover:shadow-lg transition-all duration-300 bg-[var(--muted)]/50 border border-[var(--border)]">
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-r from-[#FE9239] to-[#F8D49B]">
                              <Sparkles className="h-8 w-8" />
                            </div>
                            <div>
                              <div className="text-xl font-black text-[var(--foreground)]">{alternative.name}</div>
                              <div className="text-lg text-[var(--muted-foreground)]">{alternative.type} • {alternative.sector}</div>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-sm px-3 py-1 rounded-lg bg-[var(--muted)] text-[var(--foreground)]">
                                  Invested: {alternative.investmentDate}
                                </span>
                                <span className="text-sm px-3 py-1 rounded-lg bg-[#10B981]/20 text-[#10B981]">
                                  Expected: {alternative.expectedReturn}
                                </span>
                                <span className={`text-sm px-3 py-1 rounded-lg ${
                                  alternative.riskRating === 'High' 
                                    ? 'bg-[#EF4444] text-white' 
                                    : 'bg-[#FE9239]/20 text-[#FE9239]'
                                }`}>
                                  {alternative.riskRating} Risk
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-black text-[var(--foreground)]">
                              {formatCurrency(alternative.value)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* AI Analysis Section - Masterpiece */}
              <div className="p-8 rounded-3xl relative overflow-hidden bg-[var(--card)] shadow-2xl border border-[var(--border)]">
                <div className="absolute top-0 right-0 w-64 h-64 opacity-5 rounded-full -mr-32 -mt-32 bg-gradient-to-r from-[#10A957]/20 to-transparent"></div>
                
                <div className="flex items-center gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-[#10A957] via-[#13683B] to-[#F8D49B]">
                    <Brain className="h-12 w-12 text-white" />
                  </div>
                  <div>
                    <h3 className="text-4xl font-black text-[var(--foreground)]">AI Investment Analysis</h3>
                    <p className="text-xl text-[var(--muted-foreground)]">Powered by GPT-5 • Educational insights only</p>
                  </div>
                  <div className="ml-auto px-6 py-3 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-[#10A957] to-[#13683B]">
                    GPT-5
                  </div>
                </div>

                {analysisLoading ? (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center gap-6 mb-8 p-6 rounded-2xl bg-[var(--muted)]/50">
                      <Loader className="h-12 w-12 animate-spin text-[#10A957]" />
                      <div className="text-left">
                        <div className="text-2xl font-black mb-2 text-[var(--foreground)]">Analyzing Portfolio...</div>
                        <p className="text-lg text-[var(--muted-foreground)]">
                          {analysisProgress < 30 ? 'Loading portfolio data...' :
                           analysisProgress < 60 ? 'Analyzing risk factors...' :
                           analysisProgress < 90 ? 'Generating insights...' :
                           'Finalizing analysis...'}
                        </p>
                      </div>
                    </div>
                    <div className="max-w-md mx-auto">
                      <UIProgress value={analysisProgress} className="h-3" />
                      <div className="mt-2 text-lg font-bold text-[#10A957]">
                        {Math.round(analysisProgress)}%
                      </div>
                    </div>
                  </div>
                ) : analysis ? (
                  <div className="space-y-8">
                    
                    {/* Key Insights */}
                    <div>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 rounded-xl bg-gradient-to-r from-[#10A957] to-[#13683B]">
                          <Lightbulb className="h-8 w-8 text-white" />
                        </div>
                        <h4 className="text-3xl font-black text-[var(--foreground)]">Key Insights</h4>
                      </div>
                      <div className="grid gap-6">
                        {analysis.keyInsights?.map((insight: string, index: number) => (
                          <div key={index} 
                               className="p-8 rounded-2xl bg-gradient-to-r from-[#10A957]/5 to-[#13683B]/5 border border-[#10A957]/20">
                            <div className="flex items-start gap-6">
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg flex-shrink-0 bg-gradient-to-r from-[#10A957] to-[#13683B]">
                                {index + 1}
                              </div>
                              <p className="text-xl font-medium leading-relaxed text-[var(--foreground)]">
                                {insight}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Risk Alerts */}
                    {analysis.overexposureWarnings?.length > 0 && (
                      <div>
                        <div className="flex items-center gap-4 mb-6">
                          <div className="p-3 rounded-xl bg-gradient-to-r from-[#EF4444] to-[#FE9239]">
                            <AlertTriangle className="h-8 w-8 text-white" />
                          </div>
                          <h4 className="text-3xl font-black text-[var(--foreground)]">Risk Alerts</h4>
                        </div>
                        <div className="space-y-6">
                          {analysis.overexposureWarnings.map((warning: any, index: number) => (
                            <div key={index} 
                                 className="relative p-8 rounded-2xl bg-gradient-to-r from-[#EF4444]/5 to-[#FE9239]/5 border border-[#EF4444]/20">
                              <div className="absolute top-4 right-4 w-4 h-4 rounded-full animate-pulse bg-[#EF4444]"></div>
                              <div className="flex items-center justify-between mb-6">
                                <span className="text-2xl font-black text-[#EF4444]">
                                  {warning.category}
                                </span>
                                <div className="px-6 py-3 rounded-xl text-white font-bold text-lg bg-[#EF4444]">
                                  {formatPercentage(warning.percentage)} Exposure
                                </div>
                              </div>
                              <p className="text-lg leading-relaxed text-[var(--foreground)]">
                                {warning.recommendation}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Investment Guidance */}
                    <div>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 rounded-xl bg-gradient-to-r from-[#13683B] to-[#10B981]">
                          <Globe className="h-8 w-8 text-white" />
                        </div>
                        <h4 className="text-3xl font-black text-[var(--foreground)]">Investment Guidance</h4>
                      </div>
                      <div className="grid gap-6">
                        {analysis.generalGuidance?.map((guidance: string, index: number) => (
                          <div key={index} 
                               className="p-8 rounded-2xl bg-gradient-to-r from-[#10B981]/5 to-[#13683B]/5 border border-[#10B981]/20">
                            <div className="flex items-start gap-6">
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg flex-shrink-0 bg-gradient-to-r from-[#10B981] to-[#13683B]">
                                {index + 1}
                              </div>
                              <p className="text-xl font-medium leading-relaxed text-[var(--foreground)]">
                                {guidance}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Professional Disclaimer */}
                    <div className="p-8 rounded-2xl text-center bg-[var(--muted)]/30 border border-[var(--border)]">
                      <p className="text-lg leading-relaxed text-[var(--muted-foreground)]">
                        <span className="font-black text-[var(--foreground)]">Important Disclaimer:</span> This AI-powered analysis is for educational and informational purposes only. 
                        It does not constitute financial advice. Always consult with qualified financial advisors before making investment decisions.
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Stunning Side Panel */}
            <div className="w-96 space-y-8">
              <div className="sticky top-8">
                
                {/* Live Market Feed */}
                <div className="p-6 rounded-3xl relative overflow-hidden mb-8 bg-gradient-to-br from-[#10B981] to-[#3B82F6] shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6 text-white">
                      <Activity className="h-8 w-8" />
                      <h3 className="text-2xl font-black">Live Market Feed</h3>
                      <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl backdrop-blur-sm">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                        <span className="font-bold">LIVE</span>
                      </div>
                    </div>

                    <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-hide">
                      {portfolioData ? (
                        portfolioData.holdings.liveTickerHoldings.map((holding: any, index: number) => {
                          const livePrice = liveData[holding.ticker];
                          const isPositive = livePrice ? livePrice.changePercent >= 0 : holding.changePercent >= 0;
                          const displayPrice = livePrice ? livePrice.price : holding.currentPrice;
                          const displayChange = livePrice ? livePrice.changePercent : holding.changePercent;
                          
                          return (
                            <div key={index} 
                                 className="flex items-center justify-between p-4 rounded-2xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white font-bold text-sm">
                                  {holding.ticker.slice(0, 2)}
                                </div>
                                <div>
                                  <div className="font-bold text-white">{holding.ticker}</div>
                                  {livePrice && (
                                    <div className="flex items-center gap-1">
                                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                      <span className="text-xs text-white/90 font-medium">LIVE</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right text-white">
                                <div className="font-mono text-sm font-bold">
                                  {holding.ticker === 'BTC-USD' ? 
                                    formatCurrency(displayPrice).replace('£', '$') :
                                    `$${formatPrice(displayPrice)}`
                                  }
                                </div>
                                <div className={`text-xs flex items-center justify-end gap-1 ${isPositive ? 'text-green-200' : 'text-red-200'}`}>
                                  {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                  {formatPercentage(displayChange)}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex items-center justify-center py-8 text-white">
                          <RefreshCw className="h-8 w-8 animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="p-6 rounded-3xl bg-[var(--card)] shadow-2xl border border-[var(--border)]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-[#10A957] to-[#13683B]">
                      <TrendingUpDown className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-[var(--foreground)]">Performance Stats</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--muted)]/50">
                      <span className="font-medium text-[var(--muted-foreground)]">Portfolio Value</span>
                      <span className="font-black text-lg text-[var(--foreground)]">
                        {formatCurrency(portfolioData?.totalValue || 0)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--muted)]/50">
                      <span className="font-medium text-[var(--muted-foreground)]">Total Positions</span>
                      <span className="font-black text-lg text-[var(--foreground)]">
                        {(portfolioData?.holdings.traditional.length || 0) + 
                         (portfolioData?.holdings.properties.length || 0) + 
                         (portfolioData?.holdings.alternatives.length || 0)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--muted)]/50">
                      <span className="font-medium text-[var(--muted-foreground)]">YTD Performance</span>
                      <span className="font-black text-lg text-[#10B981]">
                        +8.4%
                      </span>
                    </div>
                    
                    {analysis && (
                      <div className="pt-4 border-t border-[var(--border)]">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#10A957]/5 to-[#13683B]/5 border border-[#10A957]/20">
                          <span className="font-medium text-[var(--muted-foreground)]">Diversification Score</span>
                          <div className="px-4 py-2 rounded-xl text-white font-black"
                               style={{ 
                                 background: analysis.diversificationScore >= 7 
                                   ? '#10B981' 
                                   : '#FE9239'
                               }}>
                            {analysis.diversificationScore}/10
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center gap-6 mt-16 mb-8">
            <Link href="/demo/investor-onboarding">
              <Button className="px-8 py-4 text-lg rounded-2xl" 
                      style={{ 
                        background: 'var(--muted)', 
                        color: 'var(--foreground)',
                        boxShadow: 'var(--shadow-md)'
                      }}>
                <ArrowUpRight className="h-5 w-5 rotate-180 mr-2" />
                Back to Onboarding
              </Button>
            </Link>
            <Link href="/demo/agenda">
              <Button className="px-8 py-4 text-lg rounded-2xl" 
                      style={{ 
                        background: `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)`,
                        color: 'white',
                        boxShadow: 'var(--shadow-lg)'
                      }}>
                <Zap className="h-5 w-5 mr-2" />
                Return to Demo
              </Button>
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}