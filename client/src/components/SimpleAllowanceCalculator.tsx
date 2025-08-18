import { useState, useEffect } from 'react';
import { calcAllowance, formatCurrency, formatPercentage, AllowanceInputs } from '../utils/calculators';

export default function SimpleAllowanceCalculator() {
  const [inputs, setInputs] = useState<AllowanceInputs>({
    scheme: 'EIS',
    isKIC: false,
    investmentThisYear: 50000,
    incomeTaxLiabilityThisYear: 25000,
    investmentPrevYear: 0,
    carryBackFromThisYear: 0,
    incomeTaxLiabilityPrevYear: 15000,
    investorLimitUsedPrevYear: false
  });

  const [result, setResult] = useState(calcAllowance(inputs));

  useEffect(() => {
    setResult(calcAllowance(inputs));
  }, [inputs]);

  const updateInput = (field: keyof AllowanceInputs, value: any) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column - Inputs */}
        <div className="space-y-6">
          
          {/* Scheme Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
              Scheme
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="scheme"
                  value="EIS"
                  checked={inputs.scheme === 'EIS'}
                  onChange={(e) => updateInput('scheme', e.target.value as 'EIS' | 'SEIS')}
                  className="mr-2 text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">EIS</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="scheme"
                  value="SEIS"
                  checked={inputs.scheme === 'SEIS'}
                  onChange={(e) => updateInput('scheme', e.target.value as 'EIS' | 'SEIS')}
                  className="mr-2 text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">SEIS</span>
              </label>
            </div>

            {inputs.scheme === 'EIS' && (
              <div className="mt-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={inputs.isKIC}
                    onChange={(e) => updateInput('isKIC', e.target.checked)}
                    className="mr-2 text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Knowledge-Intensive Company (KIC)</span>
                </label>
              </div>
            )}
          </div>

          {/* This Tax Year */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-3">This Tax Year</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Investment Amount (£)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={inputs.investmentThisYear}
                  onChange={(e) => updateInput('investmentThisYear', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Income Tax Liability (£)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={inputs.incomeTaxLiabilityThisYear}
                  onChange={(e) => updateInput('incomeTaxLiabilityThisYear', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Previous Tax Year */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-3">Previous Tax Year</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Investment Made Last Year (£)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={inputs.investmentPrevYear}
                  onChange={(e) => updateInput('investmentPrevYear', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Carry Back From This Year (£)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={inputs.carryBackFromThisYear}
                  onChange={(e) => updateInput('carryBackFromThisYear', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Income Tax Liability Last Year (£)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={inputs.incomeTaxLiabilityPrevYear}
                  onChange={(e) => updateInput('incomeTaxLiabilityPrevYear', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={inputs.investorLimitUsedPrevYear}
                    onChange={(e) => updateInput('investorLimitUsedPrevYear', e.target.checked)}
                    className="mr-2 text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Investor limit used in previous year</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          
          {/* Summary */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Relief this year:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(result.reliefThis)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Carry-back relief:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(result.reliefPrev)}</span>
              </div>
              <div className="flex justify-between font-semibold text-blue-600 dark:text-blue-400 border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                <span>Total relief:</span>
                <span>{formatCurrency(result.totalRelief)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Effective net cost:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(result.effectiveNetCost)}</span>
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-3">Breakdown</h4>
            <div className="grid grid-cols-2 gap-4">
              
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <h5 className="font-medium text-gray-800 dark:text-gray-100 mb-2">This Year</h5>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subscription applied:</span>
                    <span className="text-gray-900 dark:text-gray-100">{formatCurrency(result.eligibleForThis)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Relief rate:</span>
                    <span className="text-gray-900 dark:text-gray-100">{formatPercentage(result.rate * 100, 0)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-700 dark:text-gray-200">Relief amount:</span>
                    <span className="text-gray-900 dark:text-gray-100">{formatCurrency(result.reliefThis)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Remaining allowance:</span>
                    <span className="text-gray-900 dark:text-gray-100">{formatCurrency(result.allowanceLeftThis)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <h5 className="font-medium text-gray-800 dark:text-gray-100 mb-2">Carried Back</h5>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subscription applied:</span>
                    <span className="text-gray-900 dark:text-gray-100">{formatCurrency(result.eligibleForPrev)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Relief rate:</span>
                    <span className="text-gray-900 dark:text-gray-100">{formatPercentage(result.rate * 100, 0)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-700 dark:text-gray-200">Relief amount:</span>
                    <span className="text-gray-900 dark:text-gray-100">{formatCurrency(result.reliefPrev)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Remaining allowance:</span>
                    <span className="text-gray-900 dark:text-gray-100">{formatCurrency(result.allowanceLeftPrev)}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Allowance Usage */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-3">Allowance Usage</h4>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-300">{inputs.scheme === 'EIS' ? 'EIS' : 'SEIS'}</span>
                  <span className="text-gray-900 dark:text-gray-100">{formatCurrency(result.eligibleForThis)} / {formatCurrency(result.limitThis)}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min((result.eligibleForThis / result.limitThis) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="flex gap-2 flex-wrap">
            <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-xs font-medium">
              {inputs.scheme}
            </span>
            {inputs.isKIC && (
              <span className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-xs font-medium">
                KIC
              </span>
            )}
            <span className="inline-block bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-xs font-medium">
              Rate: {formatPercentage(result.rate * 100, 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Tool Footnote */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        <i className="fas fa-info-circle mr-1" aria-hidden="true"></i>
        Based on 2024/25 tax year rates and limits. Subject to income tax liability and scheme rules. 
        Illustrative only - not financial advice.
      </div>
    </div>
  );
}