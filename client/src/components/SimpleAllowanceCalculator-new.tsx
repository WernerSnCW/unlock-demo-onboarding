import { useState, useMemo } from 'react';
import { Calculator } from 'lucide-react';
import { calculateSEISEIS } from './SEISEISCalculation';

// Tooltip component for help functionality
function Tooltip({ children, content }: { children: React.ReactNode; content: string }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-[var(--card-foreground)] text-[var(--card)] text-xs rounded-[var(--radius-sm)] z-10 shadow-lg max-w-sm min-w-48 w-max">
          <div className="whitespace-normal text-center">{content}</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[var(--card-foreground)]"></div>
        </div>
      )}
    </div>
  );
}

// Help icon with tooltip
function HelpIcon({ tooltip }: { tooltip: string }) {
  return (
    <Tooltip content={tooltip}>
      <i className="fas fa-info-circle text-[var(--muted-foreground)] hover:text-[var(--info)] ml-1 text-sm"></i>
    </Tooltip>
  );
}

// Format currency helper
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Input types and default values
interface CalculatorInputs {
  taxYear: string;
  incomeTaxLiabilityPrevYear: number;
  incomeTaxLiabilityThisYear: number;
  otherReliefsThisYear: number;
  otherReliefsPrevYear: number;
  seisThisYear: number;
  seisUsedPrevYear: number;
  seisCarryBackRequested: number | 'auto';
  eisTotalThisYear: number;
  kicAmount: number;
  eisUsedPrevYear: number;
  eisCarryBackRequested: number | 'auto';
  prioritySEISFirst: boolean;
  autoOptimize: boolean;
}

const defaultInputs: CalculatorInputs = {
  taxYear: '2024/25',
  incomeTaxLiabilityPrevYear: 50000,
  incomeTaxLiabilityThisYear: 60000,
  otherReliefsThisYear: 0,
  otherReliefsPrevYear: 0,
  seisThisYear: 100000,
  seisUsedPrevYear: 0,
  seisCarryBackRequested: 'auto',
  eisTotalThisYear: 500000,
  kicAmount: 200000,
  eisUsedPrevYear: 0,
  eisCarryBackRequested: 'auto',
  prioritySEISFirst: true,
  autoOptimize: true,
};

export function SimpleAllowanceCalculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(defaultInputs);

  const updateInput = <K extends keyof CalculatorInputs>(
    key: K,
    value: CalculatorInputs[K]
  ) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  // Calculate results
  const result = useMemo(() => {
    return calculateSEISEIS({
      taxYear: inputs.taxYear,
      incomeTaxLiabilityPrevYear: inputs.incomeTaxLiabilityPrevYear,
      incomeTaxLiabilityThisYear: inputs.incomeTaxLiabilityThisYear,
      otherReliefsThisYear: inputs.otherReliefsThisYear,
      otherReliefsPrevYear: inputs.otherReliefsPrevYear,
      seisThisYear: inputs.seisThisYear,
      seisUsedPrevYear: inputs.seisUsedPrevYear,
      seisCarryBackRequested: inputs.seisCarryBackRequested,
      eisThisYearTotal: inputs.eisTotalThisYear,
      eisThisYearKIC: inputs.kicAmount,
      eisUsedPrevYear: inputs.eisUsedPrevYear,
      eisCarryBackRequested: inputs.eisCarryBackRequested,
      prioritySEISFirst: inputs.prioritySEISFirst,
      autoOptimize: inputs.autoOptimize,
    });
  }, [inputs]);

  const thisTaxYear = inputs.taxYear;
  const prevTaxYear = inputs.taxYear === '2024/25' ? '2023/24' : '2024/25';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="h-6 w-6 text-[var(--primary)]" />
        <h1 className="text-2xl font-bold text-[var(--card-foreground)]">
          SEIS/EIS Allowance Calculator
        </h1>
      </div>

      {/* Tax Context - Shared at top */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6">
        <h3 className="text-lg font-semibold text-[var(--card-foreground)] mb-4">Tax Context</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-[var(--card-foreground)] mb-2">
              Tax Year
              <HelpIcon tooltip="The tax year for which you're calculating relief (e.g., 2024/25)" />
            </label>
            <select
              value={inputs.taxYear}
              onChange={(e) => updateInput('taxYear', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-[var(--radius-sm)] bg-[var(--background)] text-[var(--card-foreground)]"
            >
              <option value="2024/25">2024/25</option>
              <option value="2025/26">2025/26</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--card-foreground)] mb-2">
              Income Tax Liability (Previous Year)
              <HelpIcon tooltip="Your income tax liability for the previous tax year (used for carry-back relief)" />
            </label>
            <input
              type="number"
              value={inputs.incomeTaxLiabilityPrevYear}
              onChange={(e) => updateInput('incomeTaxLiabilityPrevYear', Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-[var(--radius-sm)] bg-[var(--background)] text-[var(--card-foreground)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--card-foreground)] mb-2">
              Income Tax Liability (This Year)
              <HelpIcon tooltip="Your income tax liability for this tax year" />
            </label>
            <input
              type="number"
              value={inputs.incomeTaxLiabilityThisYear}
              onChange={(e) => updateInput('incomeTaxLiabilityThisYear', Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-[var(--radius-sm)] bg-[var(--background)] text-[var(--card-foreground)]"
            />
          </div>
        </div>

        {/* Other Reliefs Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--card-foreground)] mb-2">
              Other Reliefs (Previous Year)
              <HelpIcon tooltip="Other income tax reliefs claimed in previous year (VCT, Gift Aid, etc.)" />
            </label>
            <input
              type="number"
              value={inputs.otherReliefsPrevYear}
              onChange={(e) => updateInput('otherReliefsPrevYear', Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-[var(--radius-sm)] bg-[var(--background)] text-[var(--card-foreground)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--card-foreground)] mb-2">
              Other Reliefs (This Year)
              <HelpIcon tooltip="Other income tax reliefs claimed this year (VCT, Gift Aid, etc.)" />
            </label>
            <input
              type="number"
              value={inputs.otherReliefsThisYear}
              onChange={(e) => updateInput('otherReliefsThisYear', Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-[var(--radius-sm)] bg-[var(--background)] text-[var(--card-foreground)]"
            />
          </div>
        </div>
      </div>

      {/* Optimization Settings */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6">
        <h3 className="text-lg font-semibold text-[var(--card-foreground)] mb-4">Optimization Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="autoOptimize"
              checked={inputs.autoOptimize}
              onChange={(e) => updateInput('autoOptimize', e.target.checked)}
              className="h-4 w-4 text-[var(--primary)] border-[var(--border)] rounded focus:ring-[var(--primary)]"
            />
            <label htmlFor="autoOptimize" className="text-sm font-medium text-[var(--card-foreground)]">
              Auto Optimize Relief
              <HelpIcon tooltip="Automatically optimize carry-back amounts to maximize total tax relief across both years" />
            </label>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="prioritySEIS"
              checked={inputs.prioritySEISFirst}
              onChange={(e) => updateInput('prioritySEISFirst', e.target.checked)}
              className="h-4 w-4 text-[var(--primary)] border-[var(--border)] rounded focus:ring-[var(--primary)]"
            />
            <label htmlFor="prioritySEIS" className="text-sm font-medium text-[var(--card-foreground)]">
              SEIS Priority
              <HelpIcon tooltip="Apply SEIS relief before EIS (recommended for maximum benefit due to higher relief rate)" />
            </label>
          </div>
        </div>
      </div>

      {/* Two Column Layout: SEIS | EIS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SEIS Column */}
        <div className="space-y-6">
          {/* SEIS Inputs */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6 h-[400px]">
            <h3 className="text-lg font-semibold text-[var(--card-foreground)] mb-4">SEIS Investments (50% Relief)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--card-foreground)] mb-2">
                  SEIS Invested This Year
                  <HelpIcon tooltip="Total amount invested in SEIS qualifying companies this tax year" />
                </label>
                <input
                  type="number"
                  value={inputs.seisThisYear}
                  onChange={(e) => updateInput('seisThisYear', Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-[var(--radius-sm)] bg-[var(--background)] text-[var(--card-foreground)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--card-foreground)] mb-2">
                  SEIS Used Previous Year
                  <HelpIcon tooltip="Amount of SEIS allowance already used in the previous tax year" />
                </label>
                <input
                  type="number"
                  value={inputs.seisUsedPrevYear}
                  onChange={(e) => updateInput('seisUsedPrevYear', Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-[var(--radius-sm)] bg-[var(--background)] text-[var(--card-foreground)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--card-foreground)] mb-2">
                  SEIS Carry Back Amount
                  <HelpIcon tooltip="Specific amount to carry back to previous year. Leave as 'auto' for optimal allocation, or enter a specific amount" />
                </label>
                <input
                  type="text"
                  value={inputs.seisCarryBackRequested === 'auto' ? 'auto' : inputs.seisCarryBackRequested}
                  onChange={(e) => {
                    const value = e.target.value.toLowerCase();
                    updateInput('seisCarryBackRequested', value === 'auto' ? 'auto' : Number(value) || 0);
                  }}
                  placeholder="auto or amount"
                  className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-[var(--radius-sm)] bg-[var(--background)] text-[var(--card-foreground)]"
                />
              </div>
            </div>
          </div>

          {/* SEIS Results */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6 min-h-[500px]">
            <h3 className="text-lg font-semibold text-[var(--card-foreground)] mb-4">SEIS Breakdown</h3>
            <div className="space-y-3">
              <div className="p-4 rounded-lg h-16 flex justify-between items-center border-2" style={{ backgroundColor: '#13683B', color: '#ffffff', borderColor: '#13683B' }}>
                <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#ffffff' }}>Previous Year Applied</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>{formatCurrency(result.seis.appliedToPrev)}</span>
              </div>
              <div className="p-4 rounded-lg h-16 flex justify-between items-center border-2" style={{ backgroundColor: '#13683B', color: '#ffffff', borderColor: '#13683B' }}>
                <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#ffffff' }}>This Year Applied</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>{formatCurrency(result.seis.appliedToThis)}</span>
              </div>
              <div className="p-4 rounded-lg h-16 flex justify-between items-center border-2" style={{ backgroundColor: '#13683B', color: '#ffffff', borderColor: '#13683B' }}>
                <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#ffffff' }}>Remaining (Previous)</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>{formatCurrency(result.seis.allowanceRemainingPrev)}</span>
              </div>
              <div className="p-4 rounded-lg h-16 flex justify-between items-center border-2" style={{ backgroundColor: '#13683B', color: '#ffffff', borderColor: '#13683B' }}>
                <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#ffffff' }}>Remaining (This Year)</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>{formatCurrency(result.seis.allowanceRemainingThis)}</span>
              </div>
              
              {result.seis.unusedPotentialLost > 0 && (
                <div className="text-sm p-3 rounded-lg" style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #F59E0B' }}>
                  <strong>Potential Lost:</strong> {formatCurrency(result.seis.unusedPotentialLost)} relief lost due to insufficient liability
                </div>
              )}

              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1" style={{ color: '#1F2937' }}>
                    <span style={{ color: '#1F2937', fontWeight: '500' }}>Previous Year Usage</span>
                    <span style={{ color: '#1F2937', fontWeight: '600' }}>{result.progress.seisUsagePrev.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: `${Math.min(result.progress.seisUsagePrev, 100)}%`, backgroundColor: '#13683B' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1" style={{ color: '#1F2937' }}>
                    <span style={{ color: '#1F2937', fontWeight: '500' }}>This Year Usage</span>
                    <span style={{ color: '#1F2937', fontWeight: '600' }}>{result.progress.seisUsageThis.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: `${Math.min(result.progress.seisUsageThis, 100)}%`, backgroundColor: '#13683B' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* EIS Column */}
        <div className="space-y-6">
          {/* EIS Inputs */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6 h-[400px]">
            <h3 className="text-lg font-semibold text-[var(--card-foreground)] mb-4">EIS Investments (30% Relief)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--card-foreground)] mb-2">
                  Total EIS This Year
                  <HelpIcon tooltip="Total amount invested in EIS qualifying companies this tax year" />
                </label>
                <input
                  type="number"
                  value={inputs.eisTotalThisYear}
                  onChange={(e) => updateInput('eisTotalThisYear', Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-[var(--radius-sm)] bg-[var(--background)] text-[var(--card-foreground)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--card-foreground)] mb-2">
                  KIC Amount
                  <HelpIcon tooltip="Amount invested in Knowledge Intensive Companies (higher allowance applies)" />
                </label>
                <input
                  type="number"
                  value={inputs.kicAmount}
                  onChange={(e) => updateInput('kicAmount', Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-[var(--radius-sm)] bg-[var(--background)] text-[var(--card-foreground)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--card-foreground)] mb-2">
                  EIS Used Previous Year
                  <HelpIcon tooltip="Amount of EIS allowance already used in the previous tax year" />
                </label>
                <input
                  type="number"
                  value={inputs.eisUsedPrevYear}
                  onChange={(e) => updateInput('eisUsedPrevYear', Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-[var(--radius-sm)] bg-[var(--background)] text-[var(--card-foreground)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--card-foreground)] mb-2">
                  EIS Carry Back Amount
                  <HelpIcon tooltip="Specific amount to carry back to previous year. Leave as 'auto' for optimal allocation, or enter a specific amount" />
                </label>
                <input
                  type="text"
                  value={inputs.eisCarryBackRequested === 'auto' ? 'auto' : inputs.eisCarryBackRequested}
                  onChange={(e) => {
                    const value = e.target.value.toLowerCase();
                    updateInput('eisCarryBackRequested', value === 'auto' ? 'auto' : Number(value) || 0);
                  }}
                  placeholder="auto or amount"
                  className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-[var(--radius-sm)] bg-[var(--background)] text-[var(--card-foreground)]"
                />
              </div>
            </div>
          </div>

          {/* EIS Results */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6 min-h-[500px]">
            <h3 className="text-lg font-semibold text-[var(--card-foreground)] mb-4">EIS Breakdown</h3>
            <div className="space-y-3">
              <div className="p-4 rounded-lg h-16 flex justify-between items-center border-2" style={{ backgroundColor: '#10B981', color: '#ffffff', borderColor: '#10B981' }}>
                <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#ffffff' }}>Previous Year Applied</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>{formatCurrency(result.eis.appliedToPrev)}</span>
              </div>
              <div className="p-4 rounded-lg h-16 flex justify-between items-center border-2" style={{ backgroundColor: '#10B981', color: '#ffffff', borderColor: '#10B981' }}>
                <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#ffffff' }}>This Year Applied</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>{formatCurrency(result.eis.appliedToThis)}</span>
              </div>
              <div className="p-4 rounded-lg h-16 flex justify-between items-center border-2" style={{ backgroundColor: '#10B981', color: '#ffffff', borderColor: '#10B981' }}>
                <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#ffffff' }}>Remaining (Previous)</span>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', textAlign: 'right' }}>
                  Any: {formatCurrency(result.eis.allowanceRemainingRegular.prev)}<br/>
                  Total: {formatCurrency(result.eis.allowanceRemainingKIC.prev)}
                </div>
              </div>
              <div className="p-4 rounded-lg h-16 flex justify-between items-center border-2" style={{ backgroundColor: '#10B981', color: '#ffffff', borderColor: '#10B981' }}>
                <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#ffffff' }}>Remaining (This Year)</span>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', textAlign: 'right' }}>
                  Any: {formatCurrency(result.eis.allowanceRemainingRegular.this)}<br/>
                  Total: {formatCurrency(result.eis.allowanceRemainingKIC.this)}
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-sm" style={{ color: '#1F2937' }}>
                  <div className="font-semibold mb-2" style={{ color: '#1F2937' }}>Investment Breakdown:</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div style={{ color: '#1F2937', fontWeight: '600' }}>Previous Year:</div>
                      <div style={{ color: '#1F2937' }}>Non-KIC: {formatCurrency(result.eis.nonKicAppliedToPrev)}</div>
                      <div style={{ color: '#1F2937' }}>KIC: {formatCurrency(result.eis.kicAppliedToPrev)}</div>
                    </div>
                    <div>
                      <div style={{ color: '#1F2937', fontWeight: '600' }}>This Year:</div>
                      <div style={{ color: '#1F2937' }}>Non-KIC: {formatCurrency(result.eis.nonKicAppliedToThis)}</div>
                      <div style={{ color: '#1F2937' }}>KIC: {formatCurrency(result.eis.kicAppliedToThis)}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {result.eis.unusedPotentialLost > 0 && (
                <div className="text-sm p-3 rounded-lg" style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #F59E0B' }}>
                  <strong>Potential Lost:</strong> {formatCurrency(result.eis.unusedPotentialLost)} relief lost due to insufficient liability
                </div>
              )}

              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: '#1F2937', fontWeight: '500' }}>Previous Year - Any Band (£1m)</span>
                    <span style={{ color: '#1F2937', fontWeight: '600' }}>{result.progress.eisUsageRegularPrev.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: `${Math.min(result.progress.eisUsageRegularPrev, 100)}%`, backgroundColor: '#10B981' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: '#1F2937', fontWeight: '500' }}>This Year - Any Band (£1m)</span>
                    <span style={{ color: '#1F2937', fontWeight: '600' }}>{result.progress.eisUsageRegularThis.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: `${Math.min(result.progress.eisUsageRegularThis, 100)}%`, backgroundColor: '#10B981' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Results */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6">
        <h3 className="text-lg font-semibold text-[var(--card-foreground)] mb-4">Tax Relief Summary</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-[var(--primary)]/10 rounded-[var(--radius-sm)]">
            <div className="text-2xl font-bold text-[var(--primary)]">{formatCurrency(result.totalRelief)}</div>
            <div className="text-sm text-[var(--muted-foreground)]">Total Tax Relief</div>
          </div>
          <div className="text-center p-4 bg-[var(--secondary)]/10 rounded-[var(--radius-sm)]">
            <div className="text-2xl font-bold text-[var(--secondary)]">{formatCurrency(result.effectiveNetCost)}</div>
            <div className="text-sm text-[var(--muted-foreground)]">Effective Net Cost</div>
          </div>
          <div className="text-center p-4 bg-[var(--info)]/10 rounded-[var(--radius-sm)]">
            <div className="text-xl font-bold text-[var(--info)]">{formatCurrency(result.reliefThisYear)}</div>
            <div className="text-sm text-[var(--muted-foreground)]">Relief This Year</div>
          </div>
          <div className="text-center p-4 bg-[var(--info)]/10 rounded-[var(--radius-sm)]">
            <div className="text-xl font-bold text-[var(--info)]">{formatCurrency(result.reliefPrevYear)}</div>
            <div className="text-sm text-[var(--muted-foreground)]">Relief Carried Back</div>
          </div>
        </div>
      </div>

      {/* Optimization Suggestions */}
      {result.suggestions.length > 0 && (
        <div className="bg-[var(--info)]/10 border border-[var(--info)]/30 rounded-[var(--radius-sm)] p-4">
          <h4 className="font-medium text-[var(--info)] mb-2">Optimization Suggestions</h4>
          <ul className="text-sm text-[var(--card-foreground)] space-y-1">
            {result.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <span className="text-[var(--info)] mr-2">•</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Important Disclaimers */}
      <div className="bg-[var(--warning)]/10 border border-[var(--warning)]/30 rounded-[var(--radius-sm)] p-4">
        <h4 className="font-medium text-[var(--warning)] mb-2">Important Notes</h4>
        <ul className="text-sm text-[var(--card-foreground)] list-disc list-inside space-y-1">
          <li><strong>Estimation Only:</strong> This calculator is for planning purposes. Always consult a qualified tax advisor</li>
          <li><strong>Deadlines:</strong> Tax relief claims must be made by 31st January following the end of the relevant tax year</li>
          <li><strong>Risk Capital:</strong> SEIS/EIS investments carry significant risk - you may lose your capital</li>
          <li><strong>Qualifying Investments:</strong> Ensure your investments qualify for the relief schemes</li>
        </ul>
      </div>
    </div>
  );
}