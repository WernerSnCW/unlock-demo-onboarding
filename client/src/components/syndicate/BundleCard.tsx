import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, PieChart } from 'lucide-react';

interface BundleData {
  id: string;
  title: string;
  description: string;
  targetRaiseGBP: number;
  minChequeGBP: number;
  confidenceScore: number;
  diversification: {
    count: number;
    sectors: string[];
  };
  expectedHoldYears: number;
  fees: {
    carryPct: number;
    adminAnnualPct: number;
  };
}

interface BundleCardProps {
  bundle: BundleData;
  onClick?: () => void;
  className?: string;
}

export function BundleCard({ bundle, onClick, className = '' }: BundleCardProps) {
  const formatGBP = (amount: number) => {
    if (amount >= 1000000) {
      return `£${(amount / 1000000).toFixed(1)}m`;
    }
    if (amount >= 1000) {
      return `£${(amount / 1000).toFixed(0)}k`;
    }
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-blue-600 dark:text-blue-400';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getConfidenceBg = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 70) return 'bg-blue-100 dark:bg-blue-900/30';
    if (score >= 60) return 'bg-amber-100 dark:bg-amber-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  return (
    <Card 
      className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 cursor-pointer ${className}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {bundle.title}
            </CardTitle>
          </div>
          <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getConfidenceBg(bundle.confidenceScore)} ${getConfidenceColor(bundle.confidenceScore)}`}>
            {bundle.confidenceScore}% confidence
          </div>
        </div>
        <CardDescription className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {bundle.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Diversification */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {bundle.diversification.count} companies
            </span>
          </div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {bundle.expectedHoldYears}yr hold
          </div>
        </div>

        {/* Sector Chips */}
        <div className="flex flex-wrap gap-1">
          {bundle.diversification.sectors.map((sector, index) => (
            <span 
              key={index}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded"
            >
              {sector}
            </span>
          ))}
        </div>

        {/* Financial Information */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Min Investment</div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {formatGBP(bundle.minChequeGBP)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Target Raise</div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {formatGBP(bundle.targetRaiseGBP)}
            </div>
          </div>
        </div>

        {/* Fees */}
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>Carry {bundle.fees.carryPct}% · Admin {bundle.fees.adminAnnualPct}%/yr</span>
        </div>

        {/* CTA */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-3"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          View Bundle Details
        </Button>
      </CardContent>
    </Card>
  );
}