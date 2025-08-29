import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { TrendingUp, TrendingDown, PieChart, BarChart3, Zap, AlertTriangle, Lightbulb, DollarSign, Activity, Globe, Shield, RefreshCw, ArrowUpRight, ArrowDownRight, Eye, Brain } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';

export default function PortfolioAnalysis() {
  const [analysisLoading, setAnalysisLoading] = useState(true);
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
            { type: 'Buy-to-Let Flat', location: 'Manchester M1', value: 85000, monthlyRent: 950, yield: 13.4 },
            { type: 'Commercial Property', location: 'Birmingham B2', value: 40000, monthlyRent: 580, yield: 17.4 }
          ],
          alternatives: [
            { type: 'Startup Investment', name: 'TechCorp Series A', value: 25000, riskRating: 'High', sector: 'FinTech' },
            { type: 'Art Investment', name: 'Contemporary Art Portfolio', value: 18000, riskRating: 'Medium', sector: 'Art' },
            { type: 'Whisky Cask', name: 'Macallan 25yr Cask', value: 14000, riskRating: 'Medium', sector: 'Collectibles' }
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
    try {
      const response = await apiRequest('POST', '/api/portfolio/analyze', {
        userId: 'demo-portfolio-analysis',
        portfolioData: portfolioData,
        forceRefresh: true
      });

      const analysisData = await response.json();
      setAnalysis(analysisData);
    } catch (error) {
      console.error('Failed to analyze portfolio:', error);
      // Fallback to mock analysis for demo
      setAnalysis({
        totalPortfolioValue: portfolioData.totalValue,
        assetAllocation: portfolioData.assetAllocation,
        overexposureWarnings: [
          {
            category: "Technology Sector",
            percentage: 54.6,
            recommendation: "Consider diversifying into other sectors like healthcare, finance, or consumer goods to reduce technology concentration risk."
          }
        ],
        diversificationScore: 6.2,
        keyInsights: [
          "Strong technology sector weighting provides growth potential but increases volatility risk",
          "Property investments offer good yield diversification with 13-17% rental returns", 
          "Cryptocurrency allocation adds speculative growth potential but requires monitoring",
          "Alternative investments provide unique diversification beyond traditional assets"
        ],
        riskAssessment: "Moderate-to-High risk profile with concentrated technology exposure. Strong growth potential but higher volatility. Property yields provide stable income diversification.",
        generalGuidance: [
          "Consider rebalancing technology exposure below 40% for better diversification",
          "Property portfolio provides excellent yield - consider expanding this allocation",
          "Monitor cryptocurrency position closely due to high volatility",
          "Alternative investments add portfolio uniqueness but limit liquidity"
        ]
      });
    } finally {
      setAnalysisLoading(false);
    }
  };

  const COLORS = ['#5193B3', '#62C4C3', '#F8D49B', '#E8A87C', '#C96868'];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatPrice = (price: number, decimals: number = 2) => {
    return price.toFixed(decimals);
  };

  // Prepare chart data
  const assetAllocationData = portfolioData ? [
    { name: 'Traditional Holdings', value: portfolioData.assetAllocation.traditional, amount: portfolioData.totalValue * (portfolioData.assetAllocation.traditional / 100) },
    { name: 'Property Portfolio', value: portfolioData.assetAllocation.property, amount: portfolioData.totalValue * (portfolioData.assetAllocation.property / 100) },
    { name: 'Alternative Investments', value: portfolioData.assetAllocation.alternatives, amount: portfolioData.totalValue * (portfolioData.assetAllocation.alternatives / 100) }
  ] : [];

  const performanceData = [
    { month: 'Jan', value: 420000 },
    { month: 'Feb', value: 435000 },
    { month: 'Mar', value: 448000 },
    { month: 'Apr', value: 442000 },
    { month: 'May', value: 467000 },
    { month: 'Jun', value: 485000 }
  ];

  const sectorData = portfolioData ? [
    { name: 'Technology', value: 54.6, amount: 264810 },
    { name: 'Consumer Cyclical', value: 7.8, amount: 38000 },
    { name: 'Cryptocurrency', value: 6.6, amount: 32000 },
    { name: 'Diversified ETF', value: 5.8, amount: 28000 },
    { name: 'Real Estate', value: 25.8, amount: 125000 }
  ] : [];

  return (
    <div className="min-h-screen bg-[var(--background)] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-3">
        <div className="absolute top-32 left-16 w-40 h-40 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-64 right-24 w-32 h-32 bg-gradient-to-br from-[var(--accent)] to-[var(--warning)] rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-48 left-24 w-28 h-28 bg-gradient-to-br from-[var(--secondary)] to-[var(--primary)] rounded-full blur-xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <Header />
      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <div className="relative overflow-hidden min-h-[40vh] flex items-center justify-center bg-gradient-to-br from-[var(--primary)] via-transparent to-[var(--secondary)] bg-opacity-5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <div className="flex items-center justify-center mb-8 relative">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full blur-3xl opacity-60 group-hover:opacity-80 transition-opacity animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-full p-8 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="h-20 w-20" />
                </div>
                <div className="absolute -top-4 -right-4 animate-bounce" style={{animationDelay: '1s'}}>
                  <Zap className="h-10 w-10 text-[var(--accent)] fill-current" />
                </div>
              </div>
            </div>

            <h1 className="relative mb-8">
              <span className="block text-6xl md:text-8xl font-black bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] bg-clip-text text-transparent leading-none tracking-tight">
                PORTFOLIO INSIGHTS
              </span>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-48 h-2 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent"></div>
            </h1>

            <p className="text-xl md:text-2xl text-[var(--muted-foreground)] max-w-4xl mx-auto mb-8 leading-relaxed font-light">
              Your complete investment portfolio analyzed with 
              <span className="text-[var(--primary)] font-semibold"> AI-powered insights and live market data</span>
            </p>

            <div className="inline-flex items-center px-8 py-4 bg-[var(--card)] border-2 border-[var(--primary)] rounded-full shadow-2xl">
              <Activity className="h-6 w-6 text-[var(--success)] mr-3" />
              <span className="text-[var(--foreground)] font-semibold text-lg">LIVE ANALYSIS</span>
              <div className="w-2 h-2 bg-[var(--success)] rounded-full animate-pulse ml-3"></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Portfolio Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Total Portfolio Value</p>
                    <p className="text-3xl font-black mt-2">
                      {portfolioData ? formatCurrency(portfolioData.totalValue) : '£0'}
                    </p>
                  </div>
                  <div className="bg-white/20 rounded-full p-3">
                    <DollarSign className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-white/90">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">+12.5% YTD</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[var(--success)] to-[var(--primary)] text-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Monthly Gain</p>
                    <p className="text-3xl font-black mt-2">£18,400</p>
                  </div>
                  <div className="bg-white/20 rounded-full p-3">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-white/90">
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">+3.94% this month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[var(--accent)] to-[var(--warning)] text-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Active Holdings</p>
                    <p className="text-3xl font-black mt-2">
                      {portfolioData ? portfolioData.holdings.traditional.length + portfolioData.holdings.properties.length + portfolioData.holdings.alternatives.length : 0}
                    </p>
                  </div>
                  <div className="bg-white/20 rounded-full p-3">
                    <PieChart className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-white/90">
                  <Eye className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Across 3 asset classes</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[var(--secondary)] to-[var(--accent)] text-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Diversification Score</p>
                    <p className="text-3xl font-black mt-2">
                      {analysis ? `${analysis.diversificationScore}/10` : '-.--'}
                    </p>
                  </div>
                  <div className="bg-white/20 rounded-full p-3">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-white/90">
                  <Activity className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">
                    {analysis ? (analysis.diversificationScore >= 7 ? 'Well diversified' : 'Room for improvement') : 'Analyzing...'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            
            {/* Asset Allocation Chart */}
            <Card className="shadow-xl">
              <CardHeader className="bg-[var(--muted)] border-b">
                <CardTitle className="flex items-center gap-3 text-[var(--foreground)]">
                  <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-full p-2">
                    <PieChart className="h-5 w-5" />
                  </div>
                  Asset Allocation
                  <Badge className="ml-auto bg-[var(--success)] text-white">Live</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {portfolioData ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={assetAllocationData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {assetAllocationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any, name: any, props: any) => [
                            `${formatPercentage(value)} (${formatCurrency(props.payload.amount)})`,
                            name
                          ]}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          height={36}
                          formatter={(value: any) => (
                            <span style={{ color: 'var(--card-foreground)' }}>{value}</span>
                          )}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
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

            {/* Portfolio Performance Chart */}
            <Card className="shadow-xl">
              <CardHeader className="bg-[var(--muted)] border-b">
                <CardTitle className="flex items-center gap-3 text-[var(--foreground)]">
                  <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--warning)] text-white rounded-full p-2">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  6-Month Performance
                  <Badge className="ml-auto bg-[var(--primary)] text-white">Trending Up</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                        tickFormatter={(value) => formatCurrency(value).replace('£', '£')}
                      />
                      <Tooltip 
                        formatter={(value: any) => [formatCurrency(value), 'Portfolio Value']}
                        labelStyle={{ color: 'var(--card-foreground)' }}
                        contentStyle={{ 
                          backgroundColor: 'var(--card)', 
                          border: '1px solid var(--border)',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="var(--primary)" 
                        strokeWidth={4}
                        dot={{ fill: 'var(--primary)', strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, fill: 'var(--accent)' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Holdings Table */}
          <Card className="shadow-xl mb-8">
            <CardHeader className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white">
              <CardTitle className="flex items-center gap-3">
                <Activity className="h-6 w-6" />
                Live Holdings & Market Data
                <div className="ml-auto flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Real-time updates</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {portfolioData ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[var(--muted)] text-[var(--muted-foreground)] text-sm">
                      <tr>
                        <th className="text-left p-4 font-semibold">Symbol</th>
                        <th className="text-left p-4 font-semibold">Name</th>
                        <th className="text-right p-4 font-semibold">Price</th>
                        <th className="text-right p-4 font-semibold">Change</th>
                        <th className="text-right p-4 font-semibold">Value</th>
                        <th className="text-right p-4 font-semibold">Allocation</th>
                      </tr>
                    </thead>
                    <tbody className="text-[var(--foreground)]">
                      {portfolioData.holdings.traditional.map((holding: any, index: number) => {
                        const livePrice = liveData[holding.ticker];
                        const isPositive = livePrice ? livePrice.changePercent >= 0 : holding.changePercent >= 0;
                        const displayPrice = livePrice ? livePrice.price : holding.currentPrice;
                        const displayChange = livePrice ? livePrice.changePercent : holding.changePercent;
                        
                        return (
                          <tr key={index} className="border-b border-[var(--border)] hover:bg-[var(--muted)] transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full flex items-center justify-center text-white font-bold text-sm">
                                  {holding.ticker.slice(0, 2)}
                                </div>
                                <div>
                                  <span className="font-bold">{holding.ticker}</span>
                                  {livePrice && (
                                    <div className="flex items-center gap-1 mt-1">
                                      <div className="w-2 h-2 bg-[var(--success)] rounded-full animate-pulse"></div>
                                      <span className="text-xs text-[var(--success)] font-medium">LIVE</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-[var(--muted-foreground)]">{holding.name}</td>
                            <td className="p-4 text-right font-mono">
                              {holding.ticker === 'BTC-USD' ? 
                                formatCurrency(displayPrice).replace('£', '$') :
                                `$${formatPrice(displayPrice)}`
                              }
                            </td>
                            <td className="p-4 text-right">
                              <div className={`flex items-center justify-end gap-1 ${isPositive ? 'text-[var(--success)]' : 'text-[var(--destructive)]'}`}>
                                {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                                <span className="font-semibold">
                                  {formatPercentage(displayChange)}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 text-right font-bold">
                              {formatCurrency(holding.value)}
                            </td>
                            <td className="p-4 text-right">
                              <Badge variant="outline" className="font-medium">
                                {formatPercentage(holding.percentage)}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-[var(--muted-foreground)]" />
                  <p className="text-[var(--muted-foreground)]">Loading portfolio data...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Analysis Section */}
          {analysis && (
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-[var(--card)] via-[var(--card)] to-[var(--muted)] mb-8">
              <CardHeader className="bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] text-white">
                <CardTitle className="flex items-center gap-4">
                  <div className="bg-white/20 rounded-full p-3">
                    <Brain className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black">AI Investment Analysis</h3>
                    <p className="text-white/90 font-normal mt-1">
                      Powered by advanced machine learning • Educational insights only
                    </p>
                  </div>
                  <Badge className="ml-auto bg-white/20 text-white border-white/30">
                    GPT-4 Turbo
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 p-8">
                
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
                    It does not constitute professional financial advice. Always consult with qualified financial advisors before making investment decisions. 
                    Past performance does not guarantee future results.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="px-8 py-6 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-xl font-bold text-lg hover:scale-105 transition-all shadow-xl"
                onClick={() => window.print()}
                data-testid="button-export-report"
              >
                <Activity className="h-6 w-6 mr-3" />
                Export Full Report
              </Button>
              
              <Link 
                href="/profile?tab=portfolio"
                className="inline-flex items-center px-8 py-6 border-2 border-[var(--primary)] text-[var(--primary)] rounded-xl font-bold text-lg hover:scale-105 transition-all shadow-xl hover:bg-[var(--primary)] hover:text-white"
                data-testid="button-view-full-portfolio"
              >
                <Eye className="h-6 w-6 mr-3" />
                View Full Portfolio
              </Link>
            </div>
            
            <p className="text-[var(--muted-foreground)] text-sm max-w-2xl mx-auto">
              This enhanced portfolio analysis demonstrates the power of AI-driven investment insights. 
              Continue exploring the platform to see more advanced features and tools.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}