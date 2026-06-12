import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TrendingUp, DollarSign, PieChart as PieChartIcon, AlertTriangle, Lightbulb, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';

interface PortfolioSummaryProps {
  userId: string;
}

interface PortfolioData {
  traditional: {
    value: number;
    count: number;
  };
  property: {
    value: number;
    count: number;
  };
  alternatives: {
    value: number;
    count: number;
  };
}

interface InvestmentAnalysis {
  totalPortfolioValue: number;
  assetAllocation: {
    traditional: number;
    property: number;
    alternatives: number;
  };
  overexposureWarnings: Array<{
    category: string;
    percentage: number;
    consideration: string;
  }>;
  diversificationScore: number;
  keyInsights: string[];
  riskAssessment: string;
  generalGuidance: string[];
}

const COLORS = ['#5193B3', '#62C4C3', '#F8D49B'];

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

export function PortfolioSummary({ userId }: PortfolioSummaryProps) {
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysis, setAnalysis] = useState<InvestmentAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisLoaded, setAnalysisLoaded] = useState(false);

  // Fetch portfolio data from all three sources
  const { data: portfolioHoldings = [] } = useQuery<any[]>({
    queryKey: ['/api/investors', userId, 'portfolio-holdings'],
    enabled: !!userId,
  });

  const { data: properties = [] } = useQuery<any[]>({
    queryKey: ['/api/properties', userId],
    enabled: !!userId,
  });

  const { data: alternatives = [] } = useQuery<any[]>({
    queryKey: ['/api/alternatives', userId],
    enabled: !!userId,
  });

  // Calculate portfolio totals
  const portfolioData = useMemo(() => {
    const traditionalValue = portfolioHoldings.reduce((sum: number, holding: any) => 
      sum + (parseFloat(holding.currentValueGbp) || 0), 0);
    
    const propertyValue = properties.reduce((sum: number, property: any) => 
      sum + (parseFloat(property.latestValuation?.valueGbp) || 0), 0);
    
    const alternativesValue = alternatives.reduce((sum: number, alt: any) => 
      sum + (parseFloat(alt.currentValueGbp) || 0), 0);

    return {
      traditional: {
        value: traditionalValue,
        count: portfolioHoldings.length
      },
      property: {
        value: propertyValue,
        count: properties.length
      },
      alternatives: {
        value: alternativesValue,
        count: alternatives.length
      }
    };
  }, [portfolioHoldings, properties, alternatives]);

  const totalValue = portfolioData.traditional.value + portfolioData.property.value + portfolioData.alternatives.value;

  // Prepare chart data
  const chartData = [
    {
      name: 'Traditional Holdings',
      value: portfolioData.traditional.value,
      percentage: totalValue > 0 ? (portfolioData.traditional.value / totalValue) * 100 : 0,
      count: portfolioData.traditional.count
    },
    {
      name: 'Property Portfolio',
      value: portfolioData.property.value,
      percentage: totalValue > 0 ? (portfolioData.property.value / totalValue) * 100 : 0,
      count: portfolioData.property.count
    },
    {
      name: 'Alternative Investments',
      value: portfolioData.alternatives.value,
      percentage: totalValue > 0 ? (portfolioData.alternatives.value / totalValue) * 100 : 0,
      count: portfolioData.alternatives.count
    }
  ].filter(item => item.value > 0);

  // Auto-load cached analysis on component mount
  useEffect(() => {
    if (userId && totalValue > 0 && !analysisLoaded && !analysisLoading) {
      setAnalysisLoaded(true);
      analyzePortfolio(false); // Load cached analysis without forcing refresh
    }
  }, [userId, totalValue, analysisLoaded, analysisLoading]);

  const analyzePortfolio = async (forceRefresh = false) => {
    if (!userId || totalValue === 0) return;
    
    setAnalysisLoading(true);
    setAnalysisError(null);
    try {
      // Prepare portfolio data for LLM analysis
      const portfolioSummary = {
        totalValue,
        assetAllocation: {
          traditional: chartData.find(d => d.name === 'Traditional Holdings')?.percentage || 0,
          property: chartData.find(d => d.name === 'Property Portfolio')?.percentage || 0,
          alternatives: chartData.find(d => d.name === 'Alternative Investments')?.percentage || 0
        },
        holdings: {
          traditional: portfolioHoldings.map((h: any) => ({
            ticker: h.ticker,
            sector: h.sector,
            value: parseFloat(h.currentValueGbp),
            percentage: (parseFloat(h.currentValueGbp) / portfolioData.traditional.value) * 100
          })),
          properties: properties.map((p: any) => ({
            type: p.propertyType,
            location: p.postcode,
            value: parseFloat(p.latestValuation?.valueGbp || '0')
          })),
          alternatives: alternatives.map((a: any) => ({
            type: a.investmentType,
            riskRating: a.riskRating,
            value: parseFloat(a.currentValueGbp)
          }))
        }
      };

      const response = await apiRequest('POST', '/api/portfolio/analyze', {
        userId,
        portfolioData: portfolioSummary,
        forceRefresh // Pass through the force refresh parameter
      });

      const analysisData = await response.json();
      setAnalysis(analysisData as InvestmentAnalysis);
      setAnalysisError(null);
    } catch (error) {
      console.error('Failed to analyze portfolio:', error);
      setAnalysisError('Failed to analyze portfolio. Please try again.');
      setAnalysis(null);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium" style={{ color: 'var(--card-foreground)' }}>
            {data.name}
          </p>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Value: {formatCurrency(data.value)}
          </p>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Allocation: {formatPercentage(data.percentage)}
          </p>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Investments: {data.count}
          </p>
        </div>
      );
    }
    return null;
  };

  if (totalValue === 0) {
    return (
      <Card className="mb-8">
        <CardContent className="py-12 text-center">
          <PieChartIcon className="mx-auto h-12 w-12 mb-4" style={{ color: 'var(--muted-foreground)' }} />
          <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--card-foreground)' }}>
            No Investment Data
          </h3>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Add your investments to see portfolio summary and analysis
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: 'var(--card-foreground)' }}>
            <PieChartIcon className="h-5 w-5" style={{ color: 'var(--primary)' }} />
            Portfolio Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Total Value */}
            <div className="lg:col-span-1">
              <div className="space-y-4">
                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
                  <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                    Total Portfolio Value
                  </p>
                  <p className="text-3xl font-bold mt-2" style={{ color: 'var(--card-foreground)' }}>
                    {formatCurrency(totalValue)}
                  </p>
                </div>

                <div className="space-y-2">
                  {chartData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index] }}
                        />
                        <span className="text-sm font-medium" style={{ color: 'var(--card-foreground)' }}>
                          {item.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium" style={{ color: 'var(--card-foreground)' }}>
                          {formatCurrency(item.value)}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                          {formatPercentage(item.percentage)} • {item.count} investments
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => analyzePortfolio(false)}
                    disabled={analysisLoading}
                    className="flex-1"
                    style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                  >
                    {analysisLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Analyze Portfolio
                      </>
                    )}
                  </Button>
                  {analysis && (
                    <Button 
                      variant="outline"
                      onClick={() => analyzePortfolio(true)}
                      disabled={analysisLoading}
                      className="px-3"
                      title="Generate fresh analysis (ignores cache)"
                    >
                      {analysisLoading ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="lg:col-span-2">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value, entry: any) => (
                        <span style={{ color: 'var(--card-foreground)' }}>
                          {value} ({formatPercentage(entry.payload.percentage)})
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Error */}
      {analysisError && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{analysisError}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analysis && (
        <Card className="overflow-hidden">
          <CardHeader style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
            <CardTitle className="flex items-center gap-3" style={{ color: 'var(--card-foreground)' }}>
              <div className="flex items-center justify-center w-10 h-10 rounded-full shadow-lg" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Investment Analysis & Guidance</h3>
                <p className="text-sm font-normal mt-1" style={{ color: 'var(--muted-foreground)' }}>
                  AI-powered insights based on your current portfolio allocation • Not financial advice
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 p-6">
            {/* Overexposure Warnings */}
            {analysis.overexposureWarnings.length > 0 && (
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full shadow-md" style={{ background: 'var(--destructive)', color: 'var(--destructive-foreground)' }}>
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <h4 className="text-lg font-semibold" style={{ color: 'var(--card-foreground)' }}>
                    Potential Overexposure Areas
                  </h4>
                </div>
                <div className="space-y-3">
                  {analysis.overexposureWarnings.map((warning, index) => (
                    <div key={index} className="relative p-5 rounded-xl shadow-sm" style={{ borderLeft: '4px solid var(--destructive)', background: 'var(--muted)', border: '1px solid var(--border)' }}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-base" style={{ color: 'var(--destructive)' }}>
                          {warning.category}
                        </span>
                        <Badge className="shadow-sm px-3 py-1" style={{ background: 'var(--destructive)', color: 'var(--destructive-foreground)' }}>
                          {formatPercentage(warning.percentage)}
                        </Badge>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                        {warning.consideration}
                      </p>
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--destructive)' }}></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio Assessment */}
            <div className="p-6 rounded-xl shadow-sm" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-8 h-8 rounded-full shadow-md" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                  <TrendingUp className="h-4 w-4" />
                </div>
                <h4 className="text-lg font-semibold" style={{ color: 'var(--card-foreground)' }}>
                  Portfolio Assessment
                </h4>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Diversification Score */}
                <div>
                  <h5 className="font-medium mb-3 flex items-center gap-2" style={{ color: 'var(--card-foreground)' }}>
                    <div className="flex items-center justify-center w-6 h-6 rounded-full" style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)' }}>
                      <TrendingUp className="h-3 w-3" />
                    </div>
                    Diversification Score
                  </h5>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>
                      {analysis.diversificationScore}
                      <span className="text-lg" style={{ color: 'var(--muted-foreground)' }}>/10</span>
                    </div>
                    <div className="flex-1">
                      <div className="w-full rounded-full h-3 shadow-inner" style={{ background: 'var(--border)' }}>
                        <div 
                          className="h-3 rounded-full shadow-sm transition-all duration-500"
                          style={{ 
                            background: 'var(--primary)',
                            width: `${(analysis.diversificationScore / 10) * 100}%`
                          }}
                        />
                      </div>
                      <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                        {analysis.diversificationScore >= 8 ? 'Excellent' : 
                         analysis.diversificationScore >= 6 ? 'Good' : 
                         analysis.diversificationScore >= 4 ? 'Moderate' : 'Needs Improvement'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Risk Assessment */}
                <div>
                  <h5 className="font-medium mb-3 flex items-center gap-2" style={{ color: 'var(--card-foreground)' }}>
                    <div className="flex items-center justify-center w-6 h-6 rounded-full" style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}>
                      <AlertTriangle className="h-3 w-3" />
                    </div>
                    Risk Assessment
                  </h5>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                    {analysis.riskAssessment}
                  </p>
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full shadow-md" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                  <Lightbulb className="h-4 w-4" />
                </div>
                <h4 className="text-lg font-semibold" style={{ color: 'var(--card-foreground)' }}>
                  Key Insights
                </h4>
              </div>
              <div className="grid gap-3">
                {analysis.keyInsights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-lg" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shadow-sm" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                      {index + 1}
                    </div>
                    <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--card-foreground)' }}>
                      {insight}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* General Guidance */}
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full shadow-md" style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)' }}>
                  <DollarSign className="h-4 w-4" />
                </div>
                <h4 className="text-lg font-semibold" style={{ color: 'var(--card-foreground)' }}>
                  General Guidance
                </h4>
              </div>
              <div className="grid gap-3">
                {analysis.generalGuidance.map((guidance, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-lg" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shadow-sm" style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)' }}>
                      {index + 1}
                    </div>
                    <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--card-foreground)' }}>
                      {guidance}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-4 rounded-lg" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
              <p className="text-xs text-center italic" style={{ color: 'var(--muted-foreground)' }}>
                <strong>Important Disclaimer:</strong> This analysis is for educational purposes only and does not constitute financial advice. 
                Always consult with qualified financial advisors before making investment decisions.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}