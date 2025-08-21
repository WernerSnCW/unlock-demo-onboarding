import { useState, useEffect } from 'react';
import { calcAllowance, formatCurrency, formatPercentage, AllowanceInputs } from '../utils/calculators';

export default function AllowanceCalculator() {
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
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Left Column - Inputs */}
        <div className="space-y-6">
          
          {/* Scheme Selection */}
          <div>
            <label className="block text-sm font-medium text-[var(--card-foreground)] mb-3">
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
                  className="mr-2 accent-[#5193B3]"
                />
                <span className="text-sm">EIS</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="scheme"
                  value="SEIS"
                  checked={inputs.scheme === 'SEIS'}
                  onChange={(e) => updateInput('scheme', e.target.value as 'EIS' | 'SEIS')}
                  className="mr-2 accent-[#5193B3]"
                />
                <span className="text-sm">SEIS</span>
              </label>
            </div>
          </div>

          {/* KIC Option for EIS */}
          {inputs.scheme === 'EIS' && (
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={inputs.isKIC}
                  onChange={(e) => updateInput('isKIC', e.target.checked)}
                  className="mr-2 accent-[#5193B3]"
                />
                <span className="text-sm font-medium text-[var(--card-foreground)]">
                  Knowledge-Intensive Company (KIC)
                </span>
              </label>
            </div>
          )}

          {/* This Tax Year */}
          <div>
            <h4 className="text-md font-semibold text-[var(--card-foreground)] mb-3">This Tax Year</h4>
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
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-[var(--radius-sm)] text-gray-900 dark:text-gray-100 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] focus:outline-none"
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
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-[var(--radius-sm)] text-gray-900 dark:text-gray-100 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Previous Tax Year */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-3">Previous Tax Year</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[var(--card-foreground)] mb-1">
                  Investment Made Last Year (£)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={inputs.investmentPrevYear}
                  onChange={(e) => updateInput('investmentPrevYear', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--card-foreground)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--card-foreground)] mb-1">
                  Carry Back From This Year (£)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={inputs.carryBackFromThisYear}
                  onChange={(e) => updateInput('carryBackFromThisYear', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--card-foreground)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--card-foreground)] mb-1">
                  Income Tax Liability Last Year (£)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={inputs.incomeTaxLiabilityPrevYear}
                  onChange={(e) => updateInput('incomeTaxLiabilityPrevYear', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--card-foreground)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] focus:outline-none"
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={inputs.investorLimitUsedPrevYear}
                    onChange={(e) => updateInput('investorLimitUsedPrevYear', e.target.checked)}
                    className="mr-2 accent-[#5193B3]"
                  />
                  <span className="text-sm">Investor limit used in previous year</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          
          {/* Summary */}
          <div className="bg-[var(--muted)] rounded-[var(--radius-md)] p-4">
            <h4 className="text-lg font-semibold text-[var(--card-foreground)] mb-3">Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Relief this year:</span>
                <span className="font-medium">{formatCurrency(result.reliefThis)}</span>
              </div>
              <div className="flex justify-between">
                <span>Carry-back relief:</span>
                <span className="font-medium">{formatCurrency(result.reliefPrev)}</span>
              </div>
              <div className="flex justify-between font-semibold text-[var(--primary)] border-t border-[var(--border)] pt-2 mt-2">
                <span>Total relief:</span>
                <span>{formatCurrency(result.totalRelief)}</span>
              </div>
              <div className="flex justify-between">
                <span>Effective net cost:</span>
                <span className="font-medium">{formatCurrency(result.effectiveNetCost)}</span>
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div>
            <h4 className="text-md font-semibold text-[var(--card-foreground)] mb-3">Breakdown</h4>
            <div className="grid grid-cols-2 gap-4">
              
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-3">
                <h5 className="font-medium text-[var(--card-foreground)] mb-2">This Year</h5>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Subscription applied:</span>
                    <span>{formatCurrency(result.eligibleForThis)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Relief rate:</span>
                    <span>{formatPercentage(result.rate * 100, 0)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Relief amount:</span>
                    <span>{formatCurrency(result.reliefThis)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining allowance:</span>
                    <span>{formatCurrency(result.allowanceLeftThis)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-3">
                <h5 className="font-medium text-[var(--card-foreground)] mb-2">Carried Back</h5>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Subscription applied:</span>
                    <span>{formatCurrency(result.eligibleForPrev)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Relief rate:</span>
                    <span>{formatPercentage(result.rate * 100, 0)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Relief amount:</span>
                    <span>{formatCurrency(result.reliefPrev)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining allowance:</span>
                    <span>{formatCurrency(result.allowanceLeftPrev)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bars */}
          <div>
            <h4 className="text-md font-semibold text-[var(--card-foreground)] mb-3">Allowance Usage</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>This year</span>
                  <span>{formatCurrency(result.limitThis - result.allowanceLeftThis)} / {formatCurrency(result.limitThis)}</span>
                </div>
                <div className="w-full bg-[var(--border)] rounded-full h-2">
                  <div 
                    className="bg-[var(--primary)] h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, ((result.limitThis - result.allowanceLeftThis) / result.limitThis) * 100)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Previous year</span>
                  <span>{formatCurrency(result.limitPrev - result.allowanceLeftPrev)} / {formatCurrency(result.limitPrev)}</span>
                </div>
                <div className="w-full bg-[var(--border)] rounded-full h-2">
                  <div 
                    className="bg-[var(--secondary)] h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, ((result.limitPrev - result.allowanceLeftPrev) / result.limitPrev) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Badges and Notes */}
          <div>
            <div className="flex gap-2 mb-3">
              <span className="inline-block bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-1 rounded-full text-xs font-medium">
                {inputs.scheme}
              </span>
              {inputs.isKIC && (
                <span className="inline-block bg-[var(--secondary)]/10 text-[var(--secondary)] px-2 py-1 rounded-full text-xs font-medium">
                  KIC
                </span>
              )}
            </div>
            
            {/* Validation Errors */}
            {result.validationErrors.length > 0 && (
              <div className="space-y-1 mb-3">
                {result.validationErrors.map((error, index) => (
                  <div key={index} className="text-xs text-[var(--destructive)] bg-[var(--destructive)]/10 px-2 py-1 rounded">
                    <i className="fas fa-exclamation-triangle mr-1" aria-hidden="true"></i>
                    {error}
                  </div>
                ))}
              </div>
            )}
            
            {/* Notes */}
            {result.notes.length > 0 && (
              <div className="space-y-1">
                {result.notes.map((note, index) => (
                  <div key={index} className="text-xs text-[var(--muted-foreground)] bg-[var(--info)]/10 px-2 py-1 rounded">
                    <i className="fas fa-info-circle mr-1 text-[var(--info)]" aria-hidden="true"></i>
                    {note}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Worked Example */}
      <div className="bg-[var(--muted)] rounded-[var(--radius-md)] p-4 border-l-4 border-[var(--accent)]">
        <h4 className="text-md font-semibold text-[var(--card-foreground)] mb-2">
          <i className="fas fa-calculator mr-2 text-[var(--accent)]" aria-hidden="true"></i>
          Worked Example
        </h4>
        <div className="text-sm text-[var(--muted-foreground)] space-y-2">
          <p>
            <strong>EIS (non-KIC):</strong> Invest £120,000 this year; choose to carry back £20,000. 
            Last year you used £950,000 of allowance and had £10,000 income tax due. 
            This year you have £50,000 income tax due.
          </p>
          <p>
            Last year remaining allowance = £50,000 → carry-back £20,000 ok. 
            Relief last year = £20,000 × 30% = £6,000 (cap to liability if needed).
          </p>
          <p>
            This year relief = (£120,000 − £20,000) × 30% = £30,000. 
            Total relief = £36,000. Remaining this-year allowance = £1,000,000 − £100,000 = £900,000.
          </p>
        </div>
      </div>

      {/* Tool Footnote */}
      <div className="mt-6 pt-4 border-t border-[var(--border)] text-xs text-[var(--muted-foreground)]">
        <i className="fas fa-info-circle mr-1" aria-hidden="true"></i>
        Illustrative only. Subject to personal circumstances and HMRC rules. Not financial advice.
      </div>
    </div>
  );
}