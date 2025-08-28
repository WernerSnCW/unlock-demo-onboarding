import { useState, useMemo } from 'react';
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
    recommendation: string;
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

  const analyzePortfolio = async () => {
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
        portfolioData: portfolioSummary
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

                <Button 
                  onClick={analyzePortfolio}
                  disabled={analysisLoading}
                  className="w-full"
                  style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                >
                  {analysisLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Analyze Portfolio
                    </>
                  )}
                </Button>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: 'var(--card-foreground)' }}>
              <Lightbulb className="h-5 w-5" style={{ color: 'var(--primary)' }} />
              Investment Analysis & Guidance
            </CardTitle>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              AI-powered insights based on your current portfolio allocation • Not financial advice
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overexposure Warnings */}
            {analysis.overexposureWarnings.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2" style={{ color: 'var(--card-foreground)' }}>
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Potential Overexposure Areas
                </h4>
                <div className="space-y-2">
                  {analysis.overexposureWarnings.map((warning, index) => (
                    <div key={index} className="p-4 rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-orange-800 dark:text-orange-400">
                          {warning.category}
                        </span>
                        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                          {formatPercentage(warning.percentage)}
                        </Badge>
                      </div>
                      <p className="text-sm text-orange-700 dark:text-orange-400">
                        {warning.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Diversification Score */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
                <h4 className="font-medium mb-2" style={{ color: 'var(--card-foreground)' }}>
                  Diversification Score
                </h4>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
                    {analysis.diversificationScore}/10
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full"
                        style={{ 
                          backgroundColor: 'var(--primary)',
                          width: `${(analysis.diversificationScore / 10) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
                <h4 className="font-medium mb-2" style={{ color: 'var(--card-foreground)' }}>
                  Risk Assessment
                </h4>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  {analysis.riskAssessment}
                </p>
              </div>
            </div>

            {/* Key Insights */}
            <div>
              <h4 className="font-medium mb-3" style={{ color: 'var(--card-foreground)' }}>
                Key Insights
              </h4>
              <ul className="space-y-2">
                {analysis.keyInsights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: 'var(--primary)' }} />
                    <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      {insight}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* General Guidance */}
            <div>
              <h4 className="font-medium mb-3" style={{ color: 'var(--card-foreground)' }}>
                General Guidance
              </h4>
              <ul className="space-y-2">
                {analysis.generalGuidance.map((guidance, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: 'var(--secondary)' }} />
                    <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      {guidance}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-xs p-3 rounded-lg border border-gray-200 dark:border-gray-700" style={{ backgroundColor: 'var(--muted)' }}>
              <p style={{ color: 'var(--muted-foreground)' }}>
                <strong>Disclaimer:</strong> This analysis is for informational purposes only and does not constitute financial advice. 
                Always consult with a qualified financial advisor before making investment decisions.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}