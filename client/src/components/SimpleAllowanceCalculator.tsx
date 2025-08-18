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
          
          {/* Headline Result Card */}
          <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
            <div className="text-center mb-4">
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Tax Relief</h4>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(result.totalRelief)}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Net cost: <span className="font-medium text-gray-700 dark:text-gray-300">{formatCurrency(result.effectiveNetCost)}</span>
              </p>
            </div>
            
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="text-center">
                  <div className="font-medium text-gray-700 dark:text-gray-300">{formatCurrency(result.reliefThis)}</div>
                  <div className="text-gray-500 dark:text-gray-400">This Year</div>
                </div>
                <div className="text-center border-l border-gray-200 dark:border-gray-600">
                  <div className="font-medium text-gray-700 dark:text-gray-300">{formatCurrency(result.reliefPrev)}</div>
                  <div className="text-gray-500 dark:text-gray-400">Carry-back</div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Details */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h4 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
              <i className="fas fa-list-ul text-sm text-blue-600" aria-hidden="true"></i>
              Calculation Summary
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Investment amount:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(inputs.investmentThisYear)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Relief rate:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{formatPercentage(result.rate * 100, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Tax liability this year:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(inputs.incomeTaxLiabilityThisYear)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2">
                <span className="text-gray-600 dark:text-gray-300">Effective rate of return:</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {formatPercentage((result.totalRelief / inputs.investmentThisYear) * 100, 1)}
                </span>
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

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                onClick={() => {
                  // Recalculate with current inputs
                  setResult(calcAllowance(inputs));
                }}
              >
                <i className="fas fa-calculator text-sm" aria-hidden="true"></i>
                Recalculate
              </button>
              
              <button
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                onClick={() => {
                  const reportData = {
                    timestamp: new Date().toLocaleString(),
                    inputs,
                    results: result
                  };
                  
                  // Create and download report
                  const dataStr = JSON.stringify(reportData, null, 2);
                  const dataBlob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `allowance-calculation-${new Date().toISOString().split('T')[0]}.json`;
                  link.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <i className="fas fa-download text-sm" aria-hidden="true"></i>
                Export
              </button>
            </div>
            
            <button
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'EIS/SEIS Allowance Calculation',
                    text: `Total Relief: ${formatCurrency(result.totalRelief)} | Net Cost: ${formatCurrency(result.effectiveNetCost)}`,
                    url: window.location.href
                  });
                } else {
                  // Fallback to clipboard
                  const shareText = `EIS/SEIS Calculation Results:
Investment: ${formatCurrency(inputs.investmentThisYear)}
Total Relief: ${formatCurrency(result.totalRelief)}
Net Cost: ${formatCurrency(result.effectiveNetCost)}
Rate: ${formatPercentage(result.rate * 100, 0)}`;
                  navigator.clipboard.writeText(shareText);
                  // Could add a toast notification here
                }
              }}
            >
              <i className="fas fa-share text-sm" aria-hidden="true"></i>
              Share Results
            </button>
          </div>

          {/* Badges */}
          <div className="flex gap-2 flex-wrap pt-4 border-t border-gray-200 dark:border-gray-700">
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
            <span className="inline-block bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-xs font-medium">
              <i className="fas fa-clock mr-1" aria-hidden="true"></i>
              2024/25
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Footnote & Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex gap-2">
            <button
              className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg text-xs transition-colors flex items-center gap-2"
              onClick={() => {
                // Reset to default values
                setInputs({
                  scheme: 'EIS',
                  isKIC: false,
                  investmentThisYear: 50000,
                  incomeTaxLiabilityThisYear: 25000,
                  investmentPrevYear: 0,
                  carryBackFromThisYear: 0,
                  incomeTaxLiabilityPrevYear: 15000,
                  investorLimitUsedPrevYear: false
                });
              }}
            >
              <i className="fas fa-redo text-xs" aria-hidden="true"></i>
              Reset
            </button>
            
            <button
              className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg text-xs transition-colors flex items-center gap-2"
              onClick={() => {
                // Save to localStorage
                const savedData = {
                  inputs,
                  result,
                  timestamp: new Date().toISOString(),
                  name: `EIS/SEIS Calculation - ${new Date().toLocaleDateString()}`
                };
                const existing = JSON.parse(localStorage.getItem('saved-calculations') || '[]');
                existing.unshift(savedData);
                localStorage.setItem('saved-calculations', JSON.stringify(existing.slice(0, 10))); // Keep last 10
                // Could add toast notification here
              }}
            >
              <i className="fas fa-bookmark text-xs" aria-hidden="true"></i>
              Save
            </button>
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-2">
            <i className="fas fa-info-circle text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" aria-hidden="true"></i>
            <div className="text-xs text-yellow-800 dark:text-yellow-200">
              <strong>Important:</strong> Based on 2024/25 tax year rates and limits. Subject to income tax liability and scheme rules. 
              Results are illustrative only and do not constitute financial advice. Always consult a qualified advisor for investment decisions.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}