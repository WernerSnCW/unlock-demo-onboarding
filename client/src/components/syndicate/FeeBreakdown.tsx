import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoPopover } from '@/components/shared/InfoPopover';

interface Fee {
  carryPct: number;
  adminAnnualPct: number;
  platformFeeGBP: number;
  notes?: string;
}

interface FeeBreakdownProps {
  fee: Fee;
  inline?: boolean;
  className?: string;
}

export function FeeBreakdown({ fee, inline = false, className = '' }: FeeBreakdownProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatGBP = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPct = (pct: number) => `${pct}%`;

  const FeeDisplay = ({ showTitle = false }) => (
    <div className={`space-y-3 ${className}`}>
      {showTitle && (
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Fee Structure</h3>
          <InfoPopover title="Fee Information">
            <div className="space-y-2">
              <p><strong>Carry:</strong> Percentage of profits paid to the lead investor</p>
              <p><strong>Admin Fee:</strong> Annual management fee on committed capital</p>
              <p><strong>Platform Fee:</strong> One-time fee charged by the platform</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                {fee.notes || "Transparent, flat fees. No hidden commissions."}
              </p>
            </div>
          </InfoPopover>
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">
            {formatPct(fee.carryPct)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Carry</div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">
            {formatPct(fee.adminAnnualPct)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Admin/yr</div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">
            {fee.platformFeeGBP === 0 ? 'Free' : formatGBP(fee.platformFeeGBP)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Platform</div>
        </div>
      </div>
    </div>
  );

  if (inline) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="h-8 px-3 text-xs font-medium"
        onClick={() => setIsModalOpen(true)}
        aria-label="View fee breakdown"
      >
        Carry {formatPct(fee.carryPct)} · Admin {formatPct(fee.adminAnnualPct)}/yr
      </Button>
    );
  }

  return (
    <>
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Fee Structure</CardTitle>
          <CardDescription>
            {fee.notes || "Transparent, flat fees. No hidden commissions."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FeeDisplay />
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-4"
            onClick={() => setIsModalOpen(true)}
          >
            View Fee Examples
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle>Fee Structure Details</DialogTitle>
            <DialogDescription>
              How fees are calculated on your investment
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <FeeDisplay showTitle />
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Example Calculation</h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Investment amount:</span>
                  <span className="font-medium">£10,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform fee:</span>
                  <span className="font-medium">
                    {fee.platformFeeGBP === 0 ? 'Free' : formatGBP(fee.platformFeeGBP)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Annual admin fee ({formatPct(fee.adminAnnualPct)}):</span>
                  <span className="font-medium">{formatGBP(10000 * (fee.adminAnnualPct / 100))}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span>If total gains £50,000:</span>
                    <span className="font-medium">Carry = {formatGBP(50000 * (fee.carryPct / 100))}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}