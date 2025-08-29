import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { TrendingUp, TrendingDown, PieChart, BarChart3, Zap, AlertTriangle, Lightbulb, DollarSign, Activity, Globe, Shield, RefreshCw, ArrowUpRight, ArrowDownRight, Eye, Brain, Home, Building, Briefcase, Plus, Minus, Loader } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, Legend, Progress } from 'recharts';
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
    { name: 'Traditional Holdings', value: portfolioData.assetAllocation.traditional, color: 'hsl(var(--primary))' },
    { name: 'Property Portfolio', value: portfolioData.assetAllocation.property, color: 'hsl(var(--secondary))' },
    { name: 'Alternative Investments', value: portfolioData.assetAllocation.alternatives, color: 'hsl(var(--accent))' }
  ] : [];

  const performanceData = [
    { month: 'Jan', value: 445000 },
    { month: 'Feb', value: 452000 },
    { month: 'Mar', value: 448000 },
    { month: 'Apr', value: 465000 },
    { month: 'May', value: 471000 },
    { month: 'Jun', value: 485000 }
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-[var(--secondary)] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-[var(--accent)] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>
      </div>

      <main className="relative z-10">
        <div className="max-w-full mx-auto p-6">
          
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-full p-4 shadow-2xl">
                <Eye className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-5xl font-black bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
                  Live Portfolio Analysis
                </h1>
                <p className="text-xl text-[var(--muted-foreground)] mt-2">
                  Real-time market data • AI-powered insights • Professional analysis
                </p>
              </div>
            </div>
          </div>

          {/* Two-Panel Layout */}
          <div className="flex gap-8 min-h-screen">
            
            {/* Main Content - Portfolio Details */}
            <div className="flex-1 space-y-8">
              
              {/* Portfolio Summary */}
              <Card className="shadow-xl">
                <CardHeader className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <PieChart className="h-8 w-8" />
                    Portfolio Overview
                    <Badge className="ml-auto bg-white/20 text-white">
                      {formatCurrency(portfolioData?.totalValue || 0)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {portfolioData ? (
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={assetAllocationData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={120}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {assetAllocationData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value: any) => [`${value.toFixed(1)}%`, 'Allocation']}
                              labelStyle={{ color: 'var(--card-foreground)' }}
                              contentStyle={{ 
                                backgroundColor: 'var(--card)', 
                                border: '1px solid var(--border)',
                                borderRadius: '8px'
                              }}
                            />
                            <Legend />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-[var(--muted)] rounded-lg">
                          <span className="font-medium">Traditional Holdings</span>
                          <div className="text-right">
                            <div className="font-bold">{formatCurrency(portfolioData.totalValue * (portfolioData.assetAllocation.traditional / 100))}</div>
                            <div className="text-sm text-[var(--muted-foreground)]">{portfolioData.assetAllocation.traditional}%</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-[var(--muted)] rounded-lg">
                          <span className="font-medium">Property Portfolio</span>
                          <div className="text-right">
                            <div className="font-bold">{formatCurrency(portfolioData.totalValue * (portfolioData.assetAllocation.property / 100))}</div>
                            <div className="text-sm text-[var(--muted-foreground)]">{portfolioData.assetAllocation.property}%</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-[var(--muted)] rounded-lg">
                          <span className="font-medium">Alternative Investments</span>
                          <div className="text-right">
                            <div className="font-bold">{formatCurrency(portfolioData.totalValue * (portfolioData.assetAllocation.alternatives / 100))}</div>
                            <div className="text-sm text-[var(--muted-foreground)]">{portfolioData.assetAllocation.alternatives}%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-80 flex items-center justify-center">
                      <div className="animate-spin">
                        <RefreshCw className="h-12 w-12 text-[var(--muted-foreground)]" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Investment Buckets */}
              {portfolioData && (
                <>
                  {/* Traditional Holdings */}
                  <Card className="shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                      <CardTitle className="flex items-center gap-3">
                        <Briefcase className="h-6 w-6" />
                        Traditional Holdings
                        <Badge className="ml-auto bg-white/20 text-white">
                          {portfolioData.holdings.traditional.length} positions
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="space-y-4 p-6">
                        {portfolioData.holdings.traditional.map((holding: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-[var(--muted)] rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                {holding.ticker.slice(0, 2)}
                              </div>
                              <div>
                                <div className="font-bold">{holding.ticker}</div>
                                <div className="text-sm text-[var(--muted-foreground)]">{holding.name}</div>
                                <div className="text-xs text-[var(--muted-foreground)]">{holding.shares} shares • {holding.sector}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg">{formatCurrency(holding.value)}</div>
                              <Badge variant="outline" className="mt-1">
                                {formatPercentage(holding.percentage)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Property Portfolio */}
                  <Card className="shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                      <CardTitle className="flex items-center gap-3">
                        <Building className="h-6 w-6" />
                        Property Portfolio
                        <Badge className="ml-auto bg-white/20 text-white">
                          {portfolioData.holdings.properties.length} properties
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="space-y-4 p-6">
                        {portfolioData.holdings.properties.map((property: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-[var(--muted)] rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white">
                                <Home className="h-6 w-6" />
                              </div>
                              <div>
                                <div className="font-bold">{property.type}</div>
                                <div className="text-sm text-[var(--muted-foreground)]">{property.location}</div>
                                <div className="text-xs text-[var(--muted-foreground)]">
                                  £{property.monthlyRent}/mo • {property.yield}% yield
                                </div>
                                {property.mortgage > 0 && (
                                  <div className="text-xs text-orange-600">
                                    Mortgage: {formatCurrency(property.mortgage)}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg">{formatCurrency(property.value)}</div>
                              <div className="text-sm text-[var(--muted-foreground)]">
                                Equity: {formatCurrency(property.equity || property.value)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Alternative Investments */}
                  <Card className="shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                      <CardTitle className="flex items-center gap-3">
                        <Zap className="h-6 w-6" />
                        Alternative Investments
                        <Badge className="ml-auto bg-white/20 text-white">
                          {portfolioData.holdings.alternatives.length} investments
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="space-y-4 p-6">
                        {portfolioData.holdings.alternatives.map((alternative: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-[var(--muted)] rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                                <Zap className="h-6 w-6" />
                              </div>
                              <div>
                                <div className="font-bold">{alternative.name}</div>
                                <div className="text-sm text-[var(--muted-foreground)]">{alternative.type} • {alternative.sector}</div>
                                <div className="text-xs text-[var(--muted-foreground)]">
                                  Invested: {alternative.investmentDate} • Expected: {alternative.expectedReturn}
                                </div>
                                <Badge 
                                  variant={alternative.riskRating === 'High' ? 'destructive' : 'secondary'}
                                  className="mt-1 text-xs"
                                >
                                  {alternative.riskRating} Risk
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg">{formatCurrency(alternative.value)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* AI Analysis Section */}
              <Card className="shadow-2xl border-0 bg-gradient-to-br from-[var(--card)] via-[var(--card)] to-[var(--muted)]">
                <CardHeader className="bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] text-white">
                  <CardTitle className="flex items-center gap-4">
                    <div className="bg-white/20 rounded-full p-3">
                      <Brain className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black">AI Investment Analysis</h3>
                      <p className="text-white/90 font-normal mt-1">
                        Powered by advanced machine learning • Educational insights only
                      </p>
                    </div>
                    <Badge className="bg-white/20 text-white border-white/30">
                      GPT-4 Turbo
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  
                  {analysisLoading ? (
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-4 mb-4">
                          <Loader className="h-8 w-8 animate-spin text-[var(--primary)]" />
                          <span className="text-xl font-semibold">Analyzing Portfolio...</span>
                        </div>
                        <UIProgress value={analysisProgress} className="w-full max-w-md mx-auto" />
                        <p className="text-sm text-[var(--muted-foreground)] mt-2">
                          {analysisProgress < 30 ? 'Loading portfolio data...' :
                           analysisProgress < 60 ? 'Analyzing risk factors...' :
                           analysisProgress < 90 ? 'Generating insights...' :
                           'Finalizing analysis...'}
                        </p>
                      </div>
                    </div>
                  ) : analysis ? (
                    <div className="space-y-8">
                      
                      {/* Overexposure Warnings */}
                      {analysis.overexposureWarnings?.length > 0 && (
                        <div className="relative">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="bg-gradient-to-r from-[var(--destructive)] to-red-600 text-white rounded-full p-3 shadow-lg">
                              <AlertTriangle className="h-6 w-6" />
                            </div>
                            <h4 className="text-2xl font-bold text-[var(--foreground)]">Risk Alerts</h4>
                          </div>
                          <div className="space-y-4">
                            {analysis.overexposureWarnings.map((warning: any, index: number) => (
                              <div key={index} className="relative p-6 rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-l-4 border-[var(--destructive)] shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                  <span className="font-bold text-lg text-[var(--destructive)]">
                                    {warning.category}
                                  </span>
                                  <Badge className="bg-[var(--destructive)] text-white px-4 py-2 text-sm font-bold shadow-md">
                                    {formatPercentage(warning.percentage)} Exposure
                                  </Badge>
                                </div>
                                <p className="text-[var(--muted-foreground)] leading-relaxed">
                                  {warning.recommendation}
                                </p>
                                <div className="absolute top-3 right-3 w-3 h-3 bg-[var(--destructive)] rounded-full animate-pulse"></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Key Insights */}
                      <div className="relative">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-full p-3 shadow-lg">
                            <Lightbulb className="h-6 w-6" />
                          </div>
                          <h4 className="text-2xl font-bold text-[var(--foreground)]">Key Insights</h4>
                        </div>
                        <div className="grid gap-4">
                          {analysis.keyInsights?.map((insight: string, index: number) => (
                            <div key={index} className="flex items-start gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 shadow-lg border border-[var(--primary)]/20">
                              <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-md flex-shrink-0">
                                {index + 1}
                              </div>
                              <p className="text-[var(--foreground)] leading-relaxed font-medium">
                                {insight}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* General Guidance */}
                      <div className="relative">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="bg-gradient-to-r from-[var(--secondary)] to-[var(--accent)] text-white rounded-full p-3 shadow-lg">
                            <Globe className="h-6 w-6" />
                          </div>
                          <h4 className="text-2xl font-bold text-[var(--foreground)]">Investment Guidance</h4>
                        </div>
                        <div className="grid gap-4">
                          {analysis.generalGuidance?.map((guidance: string, index: number) => (
                            <div key={index} className="flex items-start gap-4 p-6 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 shadow-lg border border-[var(--secondary)]/20">
                              <div className="bg-gradient-to-r from-[var(--secondary)] to-[var(--accent)] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-md flex-shrink-0">
                                {index + 1}
                              </div>
                              <p className="text-[var(--foreground)] leading-relaxed font-medium">
                                {guidance}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Disclaimer */}
                      <div className="p-6 rounded-2xl bg-gradient-to-r from-[var(--muted)] to-[var(--muted)] border border-[var(--border)] shadow-inner">
                        <p className="text-sm text-center text-[var(--muted-foreground)] italic leading-relaxed">
                          <strong className="text-[var(--foreground)]">Important Disclaimer:</strong> This AI-powered analysis is for educational and informational purposes only. 
                          It does not constitute financial advice. Always consult with qualified financial advisors before making investment decisions.
                        </p>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>

            {/* Side Panel - Live Market Data */}
            <div className="w-96 space-y-6">
              <div className="sticky top-6">
                
                {/* Live Market Data Feed */}
                <Card className="shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <CardTitle className="flex items-center gap-3">
                      <Activity className="h-6 w-6" />
                      Live Market Feed
                      <div className="ml-auto flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="text-sm">LIVE</span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 max-h-96 overflow-y-auto">
                    {portfolioData ? (
                      <div className="space-y-3">
                        {portfolioData.holdings.traditional.map((holding: any, index: number) => {
                          const livePrice = liveData[holding.ticker];
                          const isPositive = livePrice ? livePrice.changePercent >= 0 : holding.changePercent >= 0;
                          const displayPrice = livePrice ? livePrice.price : holding.currentPrice;
                          const displayChange = livePrice ? livePrice.changePercent : holding.changePercent;
                          
                          return (
                            <div key={index} className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-lg hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                  {holding.ticker.slice(0, 2)}
                                </div>
                                <div>
                                  <div className="font-bold text-sm">{holding.ticker}</div>
                                  {livePrice && (
                                    <div className="flex items-center gap-1">
                                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                      <span className="text-xs text-green-600 font-medium">LIVE</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-mono text-sm">
                                  {holding.ticker === 'BTC-USD' ? 
                                    formatCurrency(displayPrice).replace('£', '$') :
                                    `$${formatPrice(displayPrice)}`
                                  }
                                </div>
                                <div className={`text-xs flex items-center justify-end gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                  {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                  {formatPercentage(displayChange)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin text-[var(--muted-foreground)]" />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-[var(--foreground)]">
                      <BarChart3 className="h-5 w-5" />
                      Quick Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--muted-foreground)]">Portfolio Value</span>
                      <span className="font-bold">{formatCurrency(portfolioData?.totalValue || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--muted-foreground)]">Positions</span>
                      <span className="font-bold">{portfolioData?.holdings.traditional.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--muted-foreground)]">Properties</span>
                      <span className="font-bold">{portfolioData?.holdings.properties.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--muted-foreground)]">Alternatives</span>
                      <span className="font-bold">{portfolioData?.holdings.alternatives.length || 0}</span>
                    </div>
                    {analysis && (
                      <div className="pt-2 border-t border-[var(--border)]">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[var(--muted-foreground)]">Diversification Score</span>
                          <Badge variant={analysis.diversificationScore >= 7 ? 'default' : 'destructive'}>
                            {analysis.diversificationScore}/10
                          </Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-12 mb-8">
            <Link href="/demo/investor-onboarding">
              <Button variant="outline" size="lg" className="gap-2">
                <ArrowUpRight className="h-5 w-5 rotate-180" />
                Back to Onboarding
              </Button>
            </Link>
            <Link href="/demo/agenda">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white shadow-lg">
                <Zap className="h-5 w-5" />
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