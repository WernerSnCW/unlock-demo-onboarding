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

  // Process uploaded file and generate portfolio data with live market prices
  useEffect(() => {
    const processUploadedPortfolio = async () => {
      try {
        // Fetch real portfolio data from the demo user account
        const demoUserId = 'demo-1755866735025'; // The demo user ID from the system
        
        // Fetch traditional holdings
        const holdingsResponse = await fetch(`/api/investors/${demoUserId}/portfolio-holdings`);
        const portfolioHoldings = holdingsResponse.ok ? await holdingsResponse.json() : [];
        
        // Fetch properties
        const propertiesResponse = await fetch(`/api/properties/${demoUserId}`);
        const properties = propertiesResponse.ok ? await propertiesResponse.json() : [];
        
        // Fetch alternatives
        const alternativesResponse = await fetch(`/api/alternatives/${demoUserId}`);
        const alternatives = alternativesResponse.ok ? await alternativesResponse.json() : [];
        
        // Calculate values from real data
        const traditionalValue = portfolioHoldings.reduce((sum: number, holding: any) => 
          sum + (parseFloat(holding.currentValueGbp) || 0), 0);
          
        const propertyValue = properties.reduce((sum: number, property: any) => 
          sum + (parseFloat(property.latestValuation?.valueGbp) || 0), 0);
          
        const alternativesValue = alternatives.reduce((sum: number, alt: any) => 
          sum + (parseFloat(alt.currentValueGbp) || 0), 0);
          
        const totalValue = traditionalValue + propertyValue + alternativesValue;
        
        // Convert to frontend format
        const realPortfolioData = {
          totalValue: totalValue > 0 ? totalValue : 485000, // Fallback to demo data if no real data
          assetAllocation: {
            traditional: totalValue > 0 ? (traditionalValue / totalValue) * 100 : 62.5,
            property: totalValue > 0 ? (propertyValue / totalValue) * 100 : 25.8,
            alternatives: totalValue > 0 ? (alternativesValue / totalValue) * 100 : 11.7
          },
          holdings: {
            traditional: portfolioHoldings.length > 0 ? portfolioHoldings.map((holding: any) => ({
              ticker: holding.symbol || 'N/A',
              name: holding.name || 'Unknown',
              sector: 'Technology', // Default sector
              value: parseFloat(holding.currentValueGbp) || 0,
              percentage: totalValue > 0 ? ((parseFloat(holding.currentValueGbp) || 0) / totalValue) * 100 : 0,
              shares: parseFloat(holding.quantity) || 0,
              currentPrice: parseFloat(holding.currentPriceGbp) || 0,
              change: 0, // Will be updated by live market data
              changePercent: 0 // Will be updated by live market data
            })) : [
              { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology', value: 85000, percentage: 17.5, shares: 450, currentPrice: 188.85, change: 2.34, changePercent: 1.26 },
              { ticker: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology', value: 72000, percentage: 14.8, shares: 185, currentPrice: 389.12, change: -1.88, changePercent: -0.48 },
              { ticker: 'NVDA', name: 'NVIDIA Corp.', sector: 'Technology', value: 58000, percentage: 12.0, shares: 65, currentPrice: 892.45, change: 18.92, changePercent: 2.17 },
              { ticker: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', value: 45000, percentage: 9.3, shares: 280, currentPrice: 160.71, change: 0.92, changePercent: 0.58 },
              { ticker: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Cyclical', value: 38000, percentage: 7.8, shares: 145, currentPrice: 262.12, change: -4.23, changePercent: -1.59 },
              { ticker: 'BTC-USD', name: 'Bitcoin', sector: 'Cryptocurrency', value: 32000, percentage: 6.6, shares: 0.8, currentPrice: 40000, change: 1200, changePercent: 3.09 },
              { ticker: 'VOO', name: 'Vanguard S&P 500 ETF', sector: 'Diversified ETF', value: 28000, percentage: 5.8, shares: 65, currentPrice: 430.85, change: 2.15, changePercent: 0.50 }
            ],
            properties: properties.length > 0 ? properties.map((property: any) => ({
              type: property.propertyType || 'Property',
              location: `${property.city || 'Unknown'} ${property.postcode || ''}`.trim(),
              value: parseFloat(property.latestValuation?.valueGbp) || 0,
              monthlyRent: property.leases?.[0]?.monthlyRentGbp || 0,
              yield: property.leases?.[0]?.monthlyRentGbp ? 
                (property.leases[0].monthlyRentGbp * 12 / (parseFloat(property.latestValuation?.valueGbp) || 1)) * 100 : 0,
              purchasePrice: parseFloat(property.ownerships?.[0]?.purchasePriceGbp) || 0,
              mortgage: property.loans?.[0] ? parseFloat(property.loans[0].currentBalanceGbp) || 0 : 0,
              equity: (parseFloat(property.latestValuation?.valueGbp) || 0) - 
                (property.loans?.[0] ? parseFloat(property.loans[0].currentBalanceGbp) || 0 : 0)
            })) : [
              { type: 'Buy-to-Let Flat', location: 'Manchester M1', value: 85000, monthlyRent: 950, yield: 13.4, purchasePrice: 75000, mortgage: 55000, equity: 30000 },
              { type: 'Commercial Property', location: 'Birmingham B2', value: 40000, monthlyRent: 580, yield: 17.4, purchasePrice: 35000, mortgage: 0, equity: 40000 }
            ],
            alternatives: alternatives.length > 0 ? alternatives.map((alt: any) => ({
              type: alt.investmentType || 'Alternative Investment',
              name: alt.name || 'Investment',
              value: parseFloat(alt.currentValueGbp) || 0,
              riskRating: alt.riskRating || 'Medium',
              sector: 'Alternative',
              investmentDate: alt.investmentDateUk || 'N/A',
              expectedReturn: alt.targetReturnPct ? `${alt.targetReturnPct}%` : 'N/A'
            })) : [
              { type: 'Startup Investment', name: 'TechCorp Series A', value: 25000, riskRating: 'High', sector: 'FinTech', investmentDate: '2023-06-15', expectedReturn: '3-5x' },
              { type: 'Art Investment', name: 'Contemporary Art Portfolio', value: 18000, riskRating: 'Medium', sector: 'Art', investmentDate: '2023-03-20', expectedReturn: '8-12% p.a.' },
              { type: 'Whisky Cask', name: 'Macallan 25yr Cask', value: 14000, riskRating: 'Medium', sector: 'Collectibles', investmentDate: '2022-11-08', expectedReturn: '10-15% p.a.' }
            ]
          }
        };
        
        setPortfolioData(realPortfolioData);
        console.log('Loaded portfolio data:', realPortfolioData);
        
        // Fetch real live market data using the loaded portfolio data
        const fetchLiveMarketData = async (portfolioData: any) => {
          try {
            if (!portfolioData?.holdings?.traditional?.length) return;
            
            const symbols = portfolioData.holdings.traditional.map((h: any) => h.ticker).join(',');
            console.log('Fetching live market data for:', symbols);
            
            const response = await apiRequest('GET', `/api/market-data/quotes?symbols=${symbols}`);
            const data = await response.json();
            
            if (data.quotes) {
              console.log('Received live market data:', data.quotes);
              setLiveData(data.quotes);
            }
          } catch (error) {
            console.error('Failed to fetch live market data:', error);
            // Fallback to mock data if API fails
            const fallbackData: any = {};
            portfolioData.holdings.traditional.forEach((holding: any) => {
              const volatility = holding.ticker.includes('BTC') ? 0.05 : holding.ticker === 'TSLA' ? 0.03 : 0.02;
              const randomChange = (Math.random() - 0.5) * volatility;
              fallbackData[holding.ticker] = {
                price: holding.currentPrice * (1 + randomChange),
                change: holding.change + (Math.random() - 0.5) * 2,
                changePercent: holding.changePercent + randomChange * 100
              };
            });
            setLiveData(fallbackData);
          }
        };

        // Initial fetch
        fetchLiveMarketData(realPortfolioData);
        
        // Update live data every 30 seconds (reasonable for free APIs)
        const interval = setInterval(() => fetchLiveMarketData(realPortfolioData), 30000);
        
        return () => clearInterval(interval);
        
      } catch (error) {
        console.error('Error loading portfolio data:', error);
        // Fallback to mock portfolio if API fails
        const fallbackPortfolio = {
          totalValue: 485000,
          assetAllocation: { traditional: 62.5, property: 25.8, alternatives: 11.7 },
          holdings: {
            traditional: [
              { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology', value: 85000, percentage: 17.5, shares: 450, currentPrice: 188.85, change: 2.34, changePercent: 1.26 },
              { ticker: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology', value: 72000, percentage: 14.8, shares: 185, currentPrice: 389.12, change: -1.88, changePercent: -0.48 },
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
        
        // Set up live data fetching for fallback data too
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
        const interval = setInterval(fetchFallbackLiveData, 30000);
        
        return () => clearInterval(interval);
      }
    };

    const cleanup = processUploadedPortfolio();
    return cleanup;
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  // Chart data
  const assetAllocationData = portfolioData ? [
    { name: 'Traditional', value: portfolioData.assetAllocation.traditional, color: '#10A957' },
    { name: 'Property', value: portfolioData.assetAllocation.property, color: '#13683B' },
    { name: 'Alternative', value: portfolioData.assetAllocation.alternatives, color: '#FE9239' }
  ] : [];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      
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
                            formatter={(value: any) => [`${value.toFixed(1)}%`, 'Allocation']}
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
                          {portfolioData.holdings.traditional.length} positions
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
                        portfolioData.holdings.traditional.map((holding: any, index: number) => {
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
              <Button className="px-8 py-4 text-lg text-white rounded-2xl" 
                      style={{ 
                        background: `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)`,
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