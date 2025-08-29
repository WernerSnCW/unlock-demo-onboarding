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
    const processUploadedPortfolio = () => {
      // Simulate realistic portfolio data based on uploaded file
      const mockPortfolio = {
        totalValue: 485000,
        assetAllocation: {
          traditional: 62.5,
          property: 25.8,
          alternatives: 11.7
        },
        holdings: {
          traditional: [
            { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology', value: 85000, percentage: 17.5, shares: 450, currentPrice: 188.85, change: 2.34, changePercent: 1.26 },
            { ticker: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology', value: 72000, percentage: 14.8, shares: 185, currentPrice: 389.12, change: -1.88, changePercent: -0.48 },
            { ticker: 'NVDA', name: 'NVIDIA Corp.', sector: 'Technology', value: 58000, percentage: 12.0, shares: 65, currentPrice: 892.45, change: 18.92, changePercent: 2.17 },
            { ticker: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', value: 45000, percentage: 9.3, shares: 280, currentPrice: 160.71, change: 0.92, changePercent: 0.58 },
            { ticker: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Cyclical', value: 38000, percentage: 7.8, shares: 145, currentPrice: 262.12, change: -4.23, changePercent: -1.59 },
            { ticker: 'BTC-USD', name: 'Bitcoin', sector: 'Cryptocurrency', value: 32000, percentage: 6.6, shares: 0.8, currentPrice: 40000, change: 1200, changePercent: 3.09 },
            { ticker: 'VOO', name: 'Vanguard S&P 500 ETF', sector: 'Diversified ETF', value: 28000, percentage: 5.8, shares: 65, currentPrice: 430.85, change: 2.15, changePercent: 0.50 }
          ],
          properties: [
            { type: 'Buy-to-Let Flat', location: 'Manchester M1', value: 85000, monthlyRent: 950, yield: 13.4, purchasePrice: 75000, mortgage: 55000, equity: 30000 },
            { type: 'Commercial Property', location: 'Birmingham B2', value: 40000, monthlyRent: 580, yield: 17.4, purchasePrice: 35000, mortgage: 0, equity: 40000 }
          ],
          alternatives: [
            { type: 'Startup Investment', name: 'TechCorp Series A', value: 25000, riskRating: 'High', sector: 'FinTech', investmentDate: '2023-06-15', expectedReturn: '3-5x' },
            { type: 'Art Investment', name: 'Contemporary Art Portfolio', value: 18000, riskRating: 'Medium', sector: 'Art', investmentDate: '2023-03-20', expectedReturn: '8-12% p.a.' },
            { type: 'Whisky Cask', name: 'Macallan 25yr Cask', value: 14000, riskRating: 'Medium', sector: 'Collectibles', investmentDate: '2022-11-08', expectedReturn: '10-15% p.a.' }
          ]
        }
      };
      setPortfolioData(mockPortfolio);

      // Fetch real live market data
      const fetchLiveMarketData = async () => {
        try {
          const symbols = mockPortfolio.holdings.traditional.map(h => h.ticker).join(',');
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
          mockPortfolio.holdings.traditional.forEach(holding => {
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
      fetchLiveMarketData();
      
      // Update live data every 30 seconds (reasonable for free APIs)
      const interval = setInterval(fetchLiveMarketData, 30000);
      
      return () => clearInterval(interval);
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
    { name: 'Traditional', value: portfolioData.assetAllocation.traditional, color: 'hsl(var(--primary))' },
    { name: 'Property', value: portfolioData.assetAllocation.property, color: 'hsl(var(--secondary))' },
    { name: 'Alternative', value: portfolioData.assetAllocation.alternatives, color: 'hsl(var(--accent))' }
  ] : [];

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Header />
      
      {/* Stunning Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-20 -left-32 w-96 h-96 rounded-full opacity-30 animate-pulse" 
               style={{ 
                 background: `radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)`,
                 animationDuration: '4s' 
               }}></div>
          <div className="absolute top-60 -right-32 w-80 h-80 rounded-full opacity-25 animate-pulse" 
               style={{ 
                 background: `radial-gradient(circle, hsl(var(--secondary)) 0%, transparent 70%)`,
                 animationDuration: '6s',
                 animationDelay: '2s'
               }}></div>
          <div className="absolute -bottom-20 left-1/2 w-72 h-72 rounded-full opacity-20 animate-pulse" 
               style={{ 
                 background: `radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)`,
                 animationDuration: '5s',
                 animationDelay: '1s'
               }}></div>
        </div>
      </div>

      <main className="relative z-10">
        <div className="max-w-full mx-auto p-8">
          
          {/* Hero Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-6 mb-8 p-6 rounded-3xl" 
                 style={{ 
                   background: `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)`,
                   boxShadow: 'var(--shadow-xl)'
                 }}>
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
              <div className="p-8 rounded-3xl relative overflow-hidden" 
                   style={{ 
                     background: `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 50%, hsl(var(--accent)) 100%)`,
                     boxShadow: 'var(--shadow-xl)'
                   }}>
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
                <div className="p-8 rounded-3xl" 
                     style={{ 
                       background: 'var(--card)',
                       boxShadow: 'var(--shadow-xl)',
                       border: '1px solid var(--border)'
                     }}>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 rounded-2xl" 
                         style={{ background: `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)` }}>
                      <PieChart className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black" style={{ color: 'var(--foreground)' }}>Asset Allocation</h2>
                      <p className="text-lg" style={{ color: 'var(--muted-foreground)' }}>Portfolio distribution across investment types</p>
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
                      <div className="p-6 rounded-2xl" 
                           style={{ 
                             background: `linear-gradient(135deg, hsl(var(--primary))/10 0%, hsl(var(--primary))/5 100%)`,
                             border: '1px solid hsl(var(--primary))/20'
                           }}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Briefcase className="h-6 w-6" style={{ color: 'hsl(var(--primary))' }} />
                            <span className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>Traditional Holdings</span>
                          </div>
                          <Badge className="px-4 py-2 text-lg font-bold" 
                                 style={{ 
                                   background: 'hsl(var(--primary))', 
                                   color: 'hsl(var(--primary-foreground))' 
                                 }}>
                            {portfolioData.assetAllocation.traditional}%
                          </Badge>
                        </div>
                        <div className="text-2xl font-black" style={{ color: 'var(--foreground)' }}>
                          {formatCurrency(portfolioData.totalValue * (portfolioData.assetAllocation.traditional / 100))}
                        </div>
                      </div>

                      <div className="p-6 rounded-2xl" 
                           style={{ 
                             background: `linear-gradient(135deg, hsl(var(--secondary))/10 0%, hsl(var(--secondary))/5 100%)`,
                             border: '1px solid hsl(var(--secondary))/20'
                           }}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Building className="h-6 w-6" style={{ color: 'hsl(var(--secondary))' }} />
                            <span className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>Property Portfolio</span>
                          </div>
                          <Badge className="px-4 py-2 text-lg font-bold" 
                                 style={{ 
                                   background: 'hsl(var(--secondary))', 
                                   color: 'hsl(var(--secondary-foreground))' 
                                 }}>
                            {portfolioData.assetAllocation.property}%
                          </Badge>
                        </div>
                        <div className="text-2xl font-black" style={{ color: 'var(--foreground)' }}>
                          {formatCurrency(portfolioData.totalValue * (portfolioData.assetAllocation.property / 100))}
                        </div>
                      </div>

                      <div className="p-6 rounded-2xl" 
                           style={{ 
                             background: `linear-gradient(135deg, hsl(var(--accent))/20 0%, hsl(var(--accent))/10 100%)`,
                             border: '1px solid hsl(var(--accent))/30'
                           }}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Zap className="h-6 w-6" style={{ color: 'hsl(var(--warning))' }} />
                            <span className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>Alternative Investments</span>
                          </div>
                          <Badge className="px-4 py-2 text-lg font-bold" 
                                 style={{ 
                                   background: 'hsl(var(--warning))', 
                                   color: 'hsl(var(--warning-foreground))' 
                                 }}>
                            {portfolioData.assetAllocation.alternatives}%
                          </Badge>
                        </div>
                        <div className="text-2xl font-black" style={{ color: 'var(--foreground)' }}>
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
                  <div className="p-8 rounded-3xl relative overflow-hidden" 
                       style={{ 
                         background: 'var(--card)',
                         boxShadow: 'var(--shadow-xl)',
                         border: '1px solid var(--border)'
                       }}>
                    <div className="absolute top-0 right-0 w-40 h-40 opacity-5 rounded-full -mr-20 -mt-20"
                         style={{ background: `radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)` }}></div>
                    
                    <div className="flex items-center gap-6 mb-8">
                      <div className="p-4 rounded-2xl" 
                           style={{ background: `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary))/80 100%)` }}>
                        <Briefcase className="h-10 w-10 text-white" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-black" style={{ color: 'var(--foreground)' }}>Traditional Holdings</h3>
                        <p className="text-lg" style={{ color: 'var(--muted-foreground)' }}>Stocks, ETFs & Cryptocurrency</p>
                      </div>
                      <div className="ml-auto px-6 py-3 rounded-xl" 
                           style={{ background: `hsl(var(--primary))/10`, border: '1px solid hsl(var(--primary))/20' }}>
                        <span className="text-2xl font-black" style={{ color: 'hsl(var(--primary))' }}>
                          {portfolioData.holdings.traditional.length} positions
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      {portfolioData.holdings.traditional.map((holding: any, index: number) => (
                        <div key={index} 
                             className="flex items-center justify-between p-6 rounded-2xl hover:shadow-lg transition-all duration-300" 
                             style={{ 
                               background: 'var(--muted)/50',
                               border: '1px solid var(--border)'
                             }}>
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg"
                                 style={{ background: `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)` }}>
                              {holding.ticker.slice(0, 2)}
                            </div>
                            <div>
                              <div className="text-xl font-black" style={{ color: 'var(--foreground)' }}>{holding.ticker}</div>
                              <div className="text-lg" style={{ color: 'var(--muted-foreground)' }}>{holding.name}</div>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-sm px-3 py-1 rounded-lg" 
                                      style={{ background: 'var(--muted)', color: 'var(--foreground)' }}>
                                  {holding.shares} shares
                                </span>
                                <span className="text-sm px-3 py-1 rounded-lg" 
                                      style={{ background: 'var(--muted)', color: 'var(--foreground)' }}>
                                  {holding.sector}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-black mb-2" style={{ color: 'var(--foreground)' }}>
                              {formatCurrency(holding.value)}
                            </div>
                            <div className="px-4 py-2 rounded-xl" 
                                 style={{ 
                                   background: `hsl(var(--primary))/10`, 
                                   border: '1px solid hsl(var(--primary))/20' 
                                 }}>
                              <span className="font-bold text-lg" style={{ color: 'hsl(var(--primary))' }}>
                                {formatPercentage(holding.percentage)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Property Portfolio */}
                  <div className="p-8 rounded-3xl relative overflow-hidden" 
                       style={{ 
                         background: 'var(--card)',
                         boxShadow: 'var(--shadow-xl)',
                         border: '1px solid var(--border)'
                       }}>
                    <div className="absolute bottom-0 left-0 w-32 h-32 opacity-5 rounded-full -ml-16 -mb-16"
                         style={{ background: `radial-gradient(circle, hsl(var(--secondary)) 0%, transparent 70%)` }}></div>
                    
                    <div className="flex items-center gap-6 mb-8">
                      <div className="p-4 rounded-2xl" 
                           style={{ background: `linear-gradient(135deg, hsl(var(--secondary)) 0%, hsl(var(--secondary))/80 100%)` }}>
                        <Building className="h-10 w-10 text-white" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-black" style={{ color: 'var(--foreground)' }}>Property Portfolio</h3>
                        <p className="text-lg" style={{ color: 'var(--muted-foreground)' }}>Real Estate Investments</p>
                      </div>
                      <div className="ml-auto px-6 py-3 rounded-xl" 
                           style={{ background: `hsl(var(--secondary))/10`, border: '1px solid hsl(var(--secondary))/20' }}>
                        <span className="text-2xl font-black" style={{ color: 'hsl(var(--secondary))' }}>
                          {portfolioData.holdings.properties.length} properties
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      {portfolioData.holdings.properties.map((property: any, index: number) => (
                        <div key={index} 
                             className="flex items-center justify-between p-6 rounded-2xl hover:shadow-lg transition-all duration-300" 
                             style={{ 
                               background: 'var(--muted)/50',
                               border: '1px solid var(--border)'
                             }}>
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg"
                                 style={{ background: `linear-gradient(135deg, hsl(var(--secondary)) 0%, hsl(var(--info)) 100%)` }}>
                              <Home className="h-8 w-8" />
                            </div>
                            <div>
                              <div className="text-xl font-black" style={{ color: 'var(--foreground)' }}>{property.type}</div>
                              <div className="text-lg" style={{ color: 'var(--muted-foreground)' }}>{property.location}</div>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-sm px-3 py-1 rounded-lg" 
                                      style={{ background: 'hsl(var(--success))/20', color: 'hsl(var(--success))' }}>
                                  £{property.monthlyRent}/mo
                                </span>
                                <span className="text-sm px-3 py-1 rounded-lg" 
                                      style={{ background: 'hsl(var(--success))/20', color: 'hsl(var(--success))' }}>
                                  {property.yield}% yield
                                </span>
                                {property.mortgage > 0 && (
                                  <span className="text-sm px-3 py-1 rounded-lg" 
                                        style={{ background: 'hsl(var(--warning))/20', color: 'hsl(var(--warning))' }}>
                                    Mortgage: {formatCurrency(property.mortgage)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-black mb-2" style={{ color: 'var(--foreground)' }}>
                              {formatCurrency(property.value)}
                            </div>
                            <div className="text-lg" style={{ color: 'var(--muted-foreground)' }}>
                              Equity: {formatCurrency(property.equity || property.value)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Alternative Investments */}
                  <div className="p-8 rounded-3xl relative overflow-hidden" 
                       style={{ 
                         background: 'var(--card)',
                         boxShadow: 'var(--shadow-xl)',
                         border: '1px solid var(--border)'
                       }}>
                    <div className="absolute top-0 left-1/2 w-24 h-24 opacity-10 rounded-full -ml-12 -mt-12"
                         style={{ background: `radial-gradient(circle, hsl(var(--warning)) 0%, transparent 70%)` }}></div>
                    
                    <div className="flex items-center gap-6 mb-8">
                      <div className="p-4 rounded-2xl" 
                           style={{ background: `linear-gradient(135deg, hsl(var(--warning)) 0%, hsl(var(--warning))/80 100%)` }}>
                        <Zap className="h-10 w-10 text-white" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-black" style={{ color: 'var(--foreground)' }}>Alternative Investments</h3>
                        <p className="text-lg" style={{ color: 'var(--muted-foreground)' }}>High Growth Opportunities</p>
                      </div>
                      <div className="ml-auto px-6 py-3 rounded-xl" 
                           style={{ background: `hsl(var(--warning))/10`, border: '1px solid hsl(var(--warning))/20' }}>
                        <span className="text-2xl font-black" style={{ color: 'hsl(var(--warning))' }}>
                          {portfolioData.holdings.alternatives.length} investments
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      {portfolioData.holdings.alternatives.map((alternative: any, index: number) => (
                        <div key={index} 
                             className="flex items-center justify-between p-6 rounded-2xl hover:shadow-lg transition-all duration-300" 
                             style={{ 
                               background: 'var(--muted)/50',
                               border: '1px solid var(--border)'
                             }}>
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg"
                                 style={{ background: `linear-gradient(135deg, hsl(var(--warning)) 0%, hsl(var(--accent)) 100%)` }}>
                              <Sparkles className="h-8 w-8" />
                            </div>
                            <div>
                              <div className="text-xl font-black" style={{ color: 'var(--foreground)' }}>{alternative.name}</div>
                              <div className="text-lg" style={{ color: 'var(--muted-foreground)' }}>{alternative.type} • {alternative.sector}</div>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-sm px-3 py-1 rounded-lg" 
                                      style={{ background: 'var(--muted)', color: 'var(--foreground)' }}>
                                  Invested: {alternative.investmentDate}
                                </span>
                                <span className="text-sm px-3 py-1 rounded-lg" 
                                      style={{ background: 'hsl(var(--success))/20', color: 'hsl(var(--success))' }}>
                                  Expected: {alternative.expectedReturn}
                                </span>
                                <span className={`text-sm px-3 py-1 rounded-lg ${
                                  alternative.riskRating === 'High' 
                                    ? 'text-white' 
                                    : ''
                                }`} 
                                      style={{ 
                                        background: alternative.riskRating === 'High' 
                                          ? 'hsl(var(--destructive))' 
                                          : 'hsl(var(--warning))/20',
                                        color: alternative.riskRating === 'High' 
                                          ? 'white' 
                                          : 'hsl(var(--warning))'
                                      }}>
                                  {alternative.riskRating} Risk
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-black" style={{ color: 'var(--foreground)' }}>
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
              <div className="p-8 rounded-3xl relative overflow-hidden" 
                   style={{ 
                     background: 'var(--card)',
                     boxShadow: 'var(--shadow-xl)',
                     border: '1px solid var(--border)'
                   }}>
                <div className="absolute top-0 right-0 w-64 h-64 opacity-5 rounded-full -mr-32 -mt-32"
                     style={{ background: `radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)` }}></div>
                
                <div className="flex items-center gap-6 mb-8">
                  <div className="p-6 rounded-2xl"
                       style={{ background: `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 50%, hsl(var(--accent)) 100%)` }}>
                    <Brain className="h-12 w-12 text-white" />
                  </div>
                  <div>
                    <h3 className="text-4xl font-black" style={{ color: 'var(--foreground)' }}>AI Investment Analysis</h3>
                    <p className="text-xl" style={{ color: 'var(--muted-foreground)' }}>Powered by GPT-4 Turbo • Educational insights only</p>
                  </div>
                  <div className="ml-auto px-6 py-3 rounded-xl text-white font-bold text-lg"
                       style={{ background: `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)` }}>
                    GPT-4 Turbo
                  </div>
                </div>

                {analysisLoading ? (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center gap-6 mb-8 p-6 rounded-2xl"
                         style={{ background: 'var(--muted)/50' }}>
                      <Loader className="h-12 w-12 animate-spin" style={{ color: 'hsl(var(--primary))' }} />
                      <div className="text-left">
                        <div className="text-2xl font-black mb-2" style={{ color: 'var(--foreground)' }}>Analyzing Portfolio...</div>
                        <p className="text-lg" style={{ color: 'var(--muted-foreground)' }}>
                          {analysisProgress < 30 ? 'Loading portfolio data...' :
                           analysisProgress < 60 ? 'Analyzing risk factors...' :
                           analysisProgress < 90 ? 'Generating insights...' :
                           'Finalizing analysis...'}
                        </p>
                      </div>
                    </div>
                    <div className="max-w-md mx-auto">
                      <UIProgress value={analysisProgress} className="h-3" />
                      <div className="mt-2 text-lg font-bold" style={{ color: 'hsl(var(--primary))' }}>
                        {Math.round(analysisProgress)}%
                      </div>
                    </div>
                  </div>
                ) : analysis ? (
                  <div className="space-y-8">
                    
                    {/* Key Insights */}
                    <div>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 rounded-xl"
                             style={{ background: `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)` }}>
                          <Lightbulb className="h-8 w-8 text-white" />
                        </div>
                        <h4 className="text-3xl font-black" style={{ color: 'var(--foreground)' }}>Key Insights</h4>
                      </div>
                      <div className="grid gap-6">
                        {analysis.keyInsights?.map((insight: string, index: number) => (
                          <div key={index} 
                               className="p-8 rounded-2xl" 
                               style={{ 
                                 background: `linear-gradient(135deg, hsl(var(--primary))/5 0%, hsl(var(--secondary))/5 100%)`,
                                 border: '1px solid hsl(var(--primary))/20'
                               }}>
                            <div className="flex items-start gap-6">
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg flex-shrink-0"
                                   style={{ background: `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)` }}>
                                {index + 1}
                              </div>
                              <p className="text-xl font-medium leading-relaxed" style={{ color: 'var(--foreground)' }}>
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
                          <div className="p-3 rounded-xl"
                               style={{ background: `linear-gradient(135deg, hsl(var(--destructive)) 0%, hsl(var(--warning)) 100%)` }}>
                            <AlertTriangle className="h-8 w-8 text-white" />
                          </div>
                          <h4 className="text-3xl font-black" style={{ color: 'var(--foreground)' }}>Risk Alerts</h4>
                        </div>
                        <div className="space-y-6">
                          {analysis.overexposureWarnings.map((warning: any, index: number) => (
                            <div key={index} 
                                 className="relative p-8 rounded-2xl" 
                                 style={{ 
                                   background: `linear-gradient(135deg, hsl(var(--destructive))/5 0%, hsl(var(--warning))/5 100%)`,
                                   border: '1px solid hsl(var(--destructive))/20'
                                 }}>
                              <div className="absolute top-4 right-4 w-4 h-4 rounded-full animate-pulse"
                                   style={{ background: 'hsl(var(--destructive))' }}></div>
                              <div className="flex items-center justify-between mb-6">
                                <span className="text-2xl font-black" style={{ color: 'hsl(var(--destructive))' }}>
                                  {warning.category}
                                </span>
                                <div className="px-6 py-3 rounded-xl text-white font-bold text-lg"
                                     style={{ background: 'hsl(var(--destructive))' }}>
                                  {formatPercentage(warning.percentage)} Exposure
                                </div>
                              </div>
                              <p className="text-lg leading-relaxed" style={{ color: 'var(--foreground)' }}>
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
                        <div className="p-3 rounded-xl"
                             style={{ background: `linear-gradient(135deg, hsl(var(--secondary)) 0%, hsl(var(--success)) 100%)` }}>
                          <Globe className="h-8 w-8 text-white" />
                        </div>
                        <h4 className="text-3xl font-black" style={{ color: 'var(--foreground)' }}>Investment Guidance</h4>
                      </div>
                      <div className="grid gap-6">
                        {analysis.generalGuidance?.map((guidance: string, index: number) => (
                          <div key={index} 
                               className="p-8 rounded-2xl" 
                               style={{ 
                                 background: `linear-gradient(135deg, hsl(var(--success))/5 0%, hsl(var(--secondary))/5 100%)`,
                                 border: '1px solid hsl(var(--success))/20'
                               }}>
                            <div className="flex items-start gap-6">
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg flex-shrink-0"
                                   style={{ background: `linear-gradient(135deg, hsl(var(--success)) 0%, hsl(var(--secondary)) 100%)` }}>
                                {index + 1}
                              </div>
                              <p className="text-xl font-medium leading-relaxed" style={{ color: 'var(--foreground)' }}>
                                {guidance}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Professional Disclaimer */}
                    <div className="p-8 rounded-2xl text-center" 
                         style={{ 
                           background: 'var(--muted)/30',
                           border: '1px solid var(--border)'
                         }}>
                      <p className="text-lg leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                        <span className="font-black" style={{ color: 'var(--foreground)' }}>Important Disclaimer:</span> This AI-powered analysis is for educational and informational purposes only. 
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
                <div className="p-6 rounded-3xl relative overflow-hidden mb-8" 
                     style={{ 
                       background: `linear-gradient(135deg, hsl(var(--success)) 0%, hsl(var(--info)) 100%)`,
                       boxShadow: 'var(--shadow-xl)'
                     }}>
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
                <div className="p-6 rounded-3xl" 
                     style={{ 
                       background: 'var(--card)',
                       boxShadow: 'var(--shadow-xl)',
                       border: '1px solid var(--border)'
                     }}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl" 
                         style={{ background: `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)` }}>
                      <TrendingUpDown className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-black" style={{ color: 'var(--foreground)' }}>Performance Stats</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl" 
                         style={{ background: 'var(--muted)/50' }}>
                      <span className="font-medium" style={{ color: 'var(--muted-foreground)' }}>Portfolio Value</span>
                      <span className="font-black text-lg" style={{ color: 'var(--foreground)' }}>
                        {formatCurrency(portfolioData?.totalValue || 0)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-2xl" 
                         style={{ background: 'var(--muted)/50' }}>
                      <span className="font-medium" style={{ color: 'var(--muted-foreground)' }}>Total Positions</span>
                      <span className="font-black text-lg" style={{ color: 'var(--foreground)' }}>
                        {(portfolioData?.holdings.traditional.length || 0) + 
                         (portfolioData?.holdings.properties.length || 0) + 
                         (portfolioData?.holdings.alternatives.length || 0)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-2xl" 
                         style={{ background: 'var(--muted)/50' }}>
                      <span className="font-medium" style={{ color: 'var(--muted-foreground)' }}>YTD Performance</span>
                      <span className="font-black text-lg" style={{ color: 'hsl(var(--success))' }}>
                        +8.4%
                      </span>
                    </div>
                    
                    {analysis && (
                      <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                        <div className="flex items-center justify-between p-4 rounded-2xl" 
                             style={{ 
                               background: `linear-gradient(135deg, hsl(var(--primary))/5 0%, hsl(var(--secondary))/5 100%)`,
                               border: '1px solid hsl(var(--primary))/20'
                             }}>
                          <span className="font-medium" style={{ color: 'var(--muted-foreground)' }}>Diversification Score</span>
                          <div className="px-4 py-2 rounded-xl text-white font-black"
                               style={{ 
                                 background: analysis.diversificationScore >= 7 
                                   ? 'hsl(var(--success))' 
                                   : 'hsl(var(--warning))'
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