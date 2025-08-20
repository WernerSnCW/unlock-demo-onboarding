import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Info } from 'lucide-react';
import { InfoPopover } from '@/components/shared/InfoPopover';

interface FractionalData {
  unitName: string;
  unitsOffered: number;
  unitPriceGBP: number;
  minUnitsPerInvestor: number;
}

interface FractionalOwnershipProps {
  fractional: FractionalData;
  className?: string;
}

export function FractionalOwnership({ fractional, className = '' }: FractionalOwnershipProps) {
  const [quantity, setQuantity] = useState(fractional.minUnitsPerInvestor);

  const formatGBP = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalValue = quantity * fractional.unitPriceGBP;
  const maxUnits = Math.min(fractional.unitsOffered, 100); // Cap for demo

  return (
    <Card className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Fractional Ownership</CardTitle>
            <InfoPopover title="Fractional Ownership" side="top">
              <div className="space-y-2 text-sm">
                <p>
                  Fractional ownership allows you to invest in individual units of the company, 
                  providing more granular control over your investment size.
                </p>
                <p>
                  This is a preview feature - secondary market liquidity is under exploration.
                </p>
              </div>
            </InfoPopover>
          </div>
        </div>
        <CardDescription>
          Preview feature - secondary liquidity under exploration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Unit Information */}
          <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {fractional.unitsOffered.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Units Offered
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatGBP(fractional.unitPriceGBP)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Unit Price
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {fractional.minUnitsPerInvestor}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Min Units
              </div>
            </div>
          </div>

          {/* Unit Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="unit-quantity" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Select Units
              </label>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {quantity} {fractional.unitName}{quantity !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="relative">
              <Input
                id="unit-quantity"
                type="number"
                min={fractional.minUnitsPerInvestor}
                max={maxUnits}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(fractional.minUnitsPerInvestor, parseInt(e.target.value) || 0))}
                className="pr-20 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                disabled
                aria-label="Number of units to reserve"
              />
              <div className="absolute right-3 top-2.5 text-xs text-gray-400">
                units
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Total Investment
              </span>
              <span className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                {formatGBP(totalValue)}
              </span>
            </div>
          </div>

          {/* Reserve Button (Disabled) */}
          <Button 
            disabled 
            className="w-full bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            onClick={() => {
              console.info(`Analytics: attempted to reserve ${quantity} units (preview feature)`);
            }}
            data-analytics="fractional-reserve-attempt"
            data-units={quantity}
          >
            <Lock className="h-4 w-4 mr-2" />
            Reserve Units (Preview)
          </Button>

          {/* Preview Notice */}
          <div className="text-xs text-gray-500 dark:text-gray-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-amber-700 dark:text-amber-300">Preview Feature:</strong>
                <br />
                Secondary market and liquidity mechanisms are currently under development. 
                This interface shows how fractional investment will work once fully implemented.
              </div>
            </div>
          </div>

          {/* Unit Economics */}
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <div className="flex justify-between">
                <span>Ownership per unit:</span>
                <span>{((1 / fractional.unitsOffered) * 100).toFixed(4)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Your ownership ({quantity} units):</span>
                <span className="font-medium">{((quantity / fractional.unitsOffered) * 100).toFixed(4)}%</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}