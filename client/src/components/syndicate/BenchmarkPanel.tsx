import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, BarChart3 } from 'lucide-react';

interface Benchmark {
  name: string;
  stage: string;
  preMoneyGBP: number;
}

interface BenchmarksData {
  sector: string;
  stageMedianPreMoneyGBP: number;
  revMultipleX: number;
  recentComps: Benchmark[];
}

interface BenchmarkPanelProps {
  benchmarks: BenchmarksData;
  dealAskPreMoneyGBP?: number;
  className?: string;
}

export function BenchmarkPanel({ 
  benchmarks, 
  dealAskPreMoneyGBP = benchmarks.stageMedianPreMoneyGBP,
  className = ''
}: BenchmarkPanelProps) {
  const formatGBP = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatGBPShort = (amount: number) => {
    if (amount >= 1000000) {
      return `£${(amount / 1000000).toFixed(1)}m`;
    }
    return formatGBP(amount);
  };

  const getComparisonPercentage = () => {
    const percentage = ((dealAskPreMoneyGBP - benchmarks.stageMedianPreMoneyGBP) / benchmarks.stageMedianPreMoneyGBP) * 100;
    return Math.round(percentage);
  };

  const comparisonPct = getComparisonPercentage();
  const isAboveMedian = comparisonPct > 0;

  return (
    <Card className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <CardTitle className="text-base">Market Benchmarks</CardTitle>
        </div>
        <CardDescription>
          {benchmarks.sector} sector comparison
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Valuation Comparison */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Valuation vs Stage Median
              </span>
              <div className={`text-sm font-medium ${
                isAboveMedian 
                  ? 'text-amber-600 dark:text-amber-400' 
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {isAboveMedian ? '+' : ''}{comparisonPct}%
              </div>
            </div>
            
            {/* Comparison Bars */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Deal ask</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatGBPShort(dealAskPreMoneyGBP)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, (dealAskPreMoneyGBP / Math.max(dealAskPreMoneyGBP, benchmarks.stageMedianPreMoneyGBP)) * 100)}%` 
                  }}
                  aria-label={`Deal ask ${formatGBP(dealAskPreMoneyGBP)}`}
                />
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Stage median</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatGBPShort(benchmarks.stageMedianPreMoneyGBP)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gray-400 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, (benchmarks.stageMedianPreMoneyGBP / Math.max(dealAskPreMoneyGBP, benchmarks.stageMedianPreMoneyGBP)) * 100)}%` 
                  }}
                  aria-label={`Stage median ${formatGBP(benchmarks.stageMedianPreMoneyGBP)}`}
                />
              </div>
            </div>
          </div>

          {/* Revenue Multiple */}
          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Revenue Multiple
              </span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {benchmarks.revMultipleX}x
            </span>
          </div>

          {/* Recent Comparables */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              Recent Comparables
            </h4>
            <div className="space-y-2">
              {benchmarks.recentComps.map((comp, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {comp.name}
                    </span>
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                      {comp.stage}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatGBPShort(comp.preMoneyGBP)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <strong>Note:</strong> Benchmarks are indicative and not investment advice. 
            Actual valuations depend on company-specific factors and market conditions.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}