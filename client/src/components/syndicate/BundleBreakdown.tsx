import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, Lock, Info } from 'lucide-react';
import syndicatesData from '../../mocks/syndicates.json';

interface BundleBreakdown {
  synId: string;
  weightPct: number;
}

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
  breakdown: BundleBreakdown[];
}

interface BundleBreakdownProps {
  bundle: BundleData;
  onClose?: () => void;
  className?: string;
}

export function BundleBreakdown({ bundle, onClose, className = '' }: BundleBreakdownProps) {
  const [investmentAmount, setInvestmentAmount] = useState(bundle.minChequeGBP);

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
    if (amount >= 1000) {
      return `£${(amount / 1000).toFixed(0)}k`;
    }
    return formatGBP(amount);
  };

  // Get syndicate details for each component
  const bundleComponents = bundle.breakdown.map(component => {
    const syndicate = syndicatesData.find(s => s.id === component.synId);
    return {
      ...component,
      syndicate,
      allocation: (investmentAmount * component.weightPct) / 100
    };
  }).filter(component => component.syndicate);

  const colors = [
    'bg-blue-500',
    'bg-green-500', 
    'bg-purple-500',
    'bg-amber-500',
    'bg-pink-500',
    'bg-indigo-500'
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <PieChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {bundle.title}
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {bundle.description}
        </p>
      </div>

      {/* Bundle Summary */}
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Diversification</div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {bundle.diversification.count} companies across {bundle.diversification.sectors.join(', ')}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Expected Hold</div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {bundle.expectedHoldYears} years
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Bundle Fees</div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Carry {bundle.fees.carryPct}% · Admin {bundle.fees.adminAnnualPct}%/yr
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Min Investment</div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {formatGBP(bundle.minChequeGBP)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visual Breakdown */}
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-base">Portfolio Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Stacked Bar Chart */}
            <div className="w-full h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
              {bundleComponents.map((component, index) => (
                <div
                  key={component.synId}
                  className={`${colors[index % colors.length]} h-full transition-all duration-300`}
                  style={{ width: `${component.weightPct}%` }}
                  title={`${component.syndicate?.company}: ${component.weightPct}%`}
                />
              ))}
            </div>

            {/* Legend */}
            <div className="space-y-2">
              {bundleComponents.map((component, index) => (
                <div key={component.synId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {component.syndicate?.company}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {component.syndicate?.stage} · {component.syndicate?.sector.join(', ')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {component.weightPct}%
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatGBPShort(component.allocation)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investment Preview */}
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-base">Investment Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Sample investment:</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatGBP(investmentAmount)}
              </span>
            </div>
            
            {/* Company Allocations */}
            <div className="space-y-2">
              {bundleComponents.map((component, index) => (
                <div key={component.synId} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {component.syndicate?.company}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatGBPShort(component.allocation)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Educational Note */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Bundle Benefits:</strong> A single commitment spreads across multiple companies 
            for diversified exposure, reducing single-company risk while maintaining venture upside potential.
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex gap-3">
        <Button 
          disabled 
          className="flex-1 bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          onClick={() => {
            console.info(`Analytics: attempted to join bundle "${bundle.title}" (preview feature)`);
          }}
          data-analytics="bundle-join-attempt"
          data-bundle={bundle.id}
        >
          <Lock className="h-4 w-4 mr-2" />
          Join Bundle (Preview)
        </Button>
        
        {onClose && (
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Close
          </Button>
        )}
      </div>
    </div>
  );
}