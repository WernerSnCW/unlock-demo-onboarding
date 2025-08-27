import { useState, useEffect } from 'react';
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
      <i className="fas fa-question-circle text-[var(--muted-foreground)] hover:text-[var(--info)] ml-1 text-sm"></i>
    </Tooltip>
  );
}

// User Guide Modal
function UserGuide({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[var(--card)] rounded-[var(--radius-lg)] p-6 max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[var(--card-foreground)]">SEIS/EIS Calculator User Guide</h2>
          <button
            onClick={onClose}
            className="text-[var(--muted-foreground)] hover:text-[var(--card-foreground)] text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-6 text-[var(--card-foreground)]">
          <section>
            <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">How This Calculator Works</h3>
            <p className="mb-3">This calculator follows the exact HMRC specification for SEIS and EIS tax relief, implementing the precise allocation rules and band restrictions that determine your actual tax benefits.</p>
            
            <div className="bg-[var(--muted)] p-4 rounded-[var(--radius-sm)] mb-4">
              <h4 className="font-medium mb-2">Key Features:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Automatic optimization to maximize total relief across both tax years</li>
                <li>Proper handling of EIS band restrictions (£1m any-source + £1m KIC-only)</li>
                <li>Carry-back logic that prioritizes previous year relief first</li>
                <li>Accounts for other income tax reliefs and liability constraints</li>
                <li>Shows potential relief lost due to insufficient tax liability</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">Input Sections</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-[var(--secondary)]">Tax Liability</h4>
                <ul className="text-sm space-y-2">
                  <li><strong>This Year:</strong> Your total income tax liability for the current tax year (before reliefs)</li>
                  <li><strong>Previous Year:</strong> Your income tax liability for the previous year</li>
                  <li><strong>Other Reliefs:</strong> Any other income tax reliefs you're claiming (VCT, etc.)</li>
                </ul>
                
                <h4 className="font-medium text-[var(--secondary)]">SEIS Investments</h4>
                <ul className="text-sm space-y-2">
                  <li><strong>This Year:</strong> Total SEIS investments made in the current tax year</li>
                  <li><strong>Previously Used:</strong> SEIS allowance already used in previous year</li>
                  <li><strong>Carry Back:</strong> Amount to carry back (auto-optimized by default)</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-[var(--secondary)]">EIS Investments</h4>
                <ul className="text-sm space-y-2">
                  <li><strong>Total This Year:</strong> All EIS investments made in current tax year</li>
                  <li><strong>KIC Amount:</strong> Portion that qualifies as Knowledge Intensive Company investment</li>
                  <li><strong>Previously Used:</strong> EIS allowance already used in previous year</li>
                  <li><strong>Carry Back:</strong> Amount to carry back (auto-optimized by default)</li>
                </ul>
                
                <h4 className="font-medium text-[var(--secondary)]">Options</h4>
                <ul className="text-sm space-y-2">
                  <li><strong>Auto Optimize:</strong> Automatically maximizes total relief</li>
                  <li><strong>SEIS Priority:</strong> Apply SEIS before EIS (recommended)</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">Understanding the Results</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-[var(--secondary)]">Headline Summary</h4>
                <p className="text-sm">Shows total tax relief, breakdown by year, and effective net cost of your investments after relief.</p>
              </div>
              
              <div>
                <h4 className="font-medium text-[var(--secondary)]">SEIS/EIS Breakdown</h4>
                <p className="text-sm">Detailed allocation showing how much of each scheme is applied to each tax year, remaining allowances, and any potential relief lost due to insufficient tax liability.</p>
              </div>
              
              <div>
                <h4 className="font-medium text-[var(--secondary)]">Progress Bars</h4>
                <p className="text-sm">Visual representation of allowance usage. EIS shows both the £1m "any-source" band and the total £2m capacity including KIC-only investments.</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">Important Notes</h3>
            <div className="bg-[var(--warning)]/10 border border-[var(--warning)]/30 rounded-[var(--radius-sm)] p-4">
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li><strong>Estimation Only:</strong> This calculator is for planning purposes. Always consult a qualified tax advisor</li>
                <li><strong>Deadlines:</strong> Tax relief claims must be made by 31st January following the end of the relevant tax year</li>
                <li><strong>Risk Capital:</strong> SEIS/EIS investments carry significant risk - you may lose your capital</li>
                <li><strong>Qualifying Investments:</strong> Ensure your investments qualify for the relief schemes</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

interface SEISEISInputs {
  taxYear: string;
  incomeTaxLiabilityThisYear: number;
  incomeTaxLiabilityPrevYear: number;
  otherReliefsThisYear: number;
  otherReliefsPrevYear: number;
  seisThisYear: number;
  seisCarryBackRequested: number | 'auto';
  seisUsedPrevYear: number;
  eisThisYearTotal: number;
  eisThisYearKIC: number;
  eisCarryBackRequested: number | 'auto';
  eisUsedPrevYear: number;
  prioritySEISFirst: boolean;
  autoOptimize: boolean;
}

interface SEISEISResult {
  totalRelief: number;
  reliefThisYear: number;
  reliefPrevYear: number;
  effectiveNetCost: number;
  seis: {
    appliedToPrev: number;
    appliedToThis: number;
    reliefPrev: number;
    reliefThis: number;
    allowanceRemainingPrev: number;
    allowanceRemainingThis: number;
    unusedPotentialLost: number;
  };
  eis: {
    appliedToPrev: number;
    appliedToThis: number;
    reliefPrev: number;
    reliefThis: number;
    allowanceRemainingRegular: { prev: number; this: number };
    allowanceRemainingKIC: { prev: number; this: number };
    unusedPotentialLost: number;
    kicAppliedToPrev: number;
    kicAppliedToThis: number;
    nonKicAppliedToPrev: number;
    nonKicAppliedToThis: number;
  };
  progress: {
    seisUsagePrev: number;
    seisUsageThis: number;
    eisUsageRegularPrev: number;
    eisUsageRegularThis: number;
    eisUsageKICPrev: number;
    eisUsageKICThis: number;
  };
  suggestions: string[];
  validationErrors: string[];
}

export default function SimpleAllowanceCalculator() {
  const currentYear = new Date().getFullYear();
  const taxYear = `${currentYear}/${(currentYear + 1).toString().slice(-2)}`;
  const prevTaxYear = `${currentYear - 1}/${currentYear.toString().slice(-2)}`;
  
  const [showUserGuide, setShowUserGuide] = useState(false);
  const [inputs, setInputs] = useState<SEISEISInputs>({
    taxYear,
    incomeTaxLiabilityThisYear: 50000,
    incomeTaxLiabilityPrevYear: 45000,
    otherReliefsThisYear: 0,
    otherReliefsPrevYear: 0,
    seisThisYear: 100000,
    seisCarryBackRequested: 'auto',
    seisUsedPrevYear: 0,
    eisThisYearTotal: 500000,
    eisThisYearKIC: 200000,
    eisCarryBackRequested: 'auto',
    eisUsedPrevYear: 0,
    prioritySEISFirst: true,
    autoOptimize: true
  });

  const [result, setResult] = useState(calculateSEISEIS(inputs));

  useEffect(() => {
    setResult(calculateSEISEIS(inputs));
  }, [inputs]);

  const updateInput = (field: keyof SEISEISInputs, value: any) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount: number) => `£${amount.toLocaleString()}`;

  return (
    <div className="p-6 bg-[var(--background)] space-y-6">
      {/* TESTING BANNER - REMOVE AFTER CONFIRMING */}
      <div className="bg-red-500 text-white p-2 rounded text-center font-bold">
        ⚠️ UPDATED VERSION LOADED - CACHE CLEARED ⚠️
      </div>
      
      {/* Header with Help Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">SEIS/EIS Allowance Calculator</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Optimize your tax relief across SEIS and EIS investments</p>
        </div>
        <button
          onClick={() => setShowUserGuide(true)}
          className="bg-[var(--info)] text-[var(--info-foreground)] px-4 py-2 rounded-[var(--radius-sm)] hover:bg-[var(--info)]/90 transition-colors flex items-center gap-2"
        >
          <i className="fas fa-question-circle"></i>
          User Guide
        </button>
      </div>

      {/* User Guide Modal */}
      <UserGuide isOpen={showUserGuide} onClose={() => setShowUserGuide(false)} />

      {/* Validation Errors */}
      {result.validationErrors.length > 0 && (
        <div className="bg-[var(--destructive)]/10 border border-[var(--destructive)]/30 rounded-[var(--radius-sm)] p-4">
          <h4 className="font-medium text-[var(--destructive)] mb-2">Validation Errors</h4>
          <ul className="text-sm text-[var(--destructive)]/80 list-disc list-inside">
            {result.validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Tax Year Context */}
      <div className="bg-[var(--info)]/10 rounded-[var(--radius-sm)] p-4 border border-[var(--info)]/30">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium text-[var(--info)]">Tax Year Context</h3>
            <p className="text-sm text-[var(--card-foreground)]">This year: {taxYear} • Previous year: {prevTaxYear}</p>
          </div>
          <div className="flex gap-2">
            <Tooltip content="Automatically calculates the optimal carry-back amounts to maximize total tax relief across both tax years">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={inputs.autoOptimize}
                  onChange={(e) => updateInput('autoOptimize', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-[var(--card-foreground)]">Auto Optimize</span>
              </label>
            </Tooltip>
            <Tooltip content="Apply SEIS relief before EIS relief (recommended due to higher 50% rate vs 30%)">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={inputs.prioritySEISFirst}
                  onChange={(e) => updateInput('prioritySEISFirst', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-[var(--card-foreground)]">SEIS Priority</span>
              </label>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Main Calculator Layout - Side by Side */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Side: Inputs */}
        <div className="space-y-6">
          {/* Income Tax Liability Section */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6">
            <h3 className="text-lg font-semibold text-[var(--card-foreground)] mb-4">Income Tax Liability</h3>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--card-foreground)] mb-2">
                    This Year ({taxYear})
                    <HelpIcon tooltip="Your total income tax liability for the current tax year, before any reliefs are applied" />
                  </label>
                  <input
                    type="number"
                    value={inputs.incomeTaxLiabilityThisYear}
                    onChange={(e) => updateInput('incomeTaxLiabilityThisYear', Number(e.target.value))}
                    className="w-full p-3 border border-[var(--border)] rounded-[var(--radius-sm)] bg-[var(--background)] text-[var(--card-foreground)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--card-foreground)] mb-2">
                    Previous Year ({prevTaxYear})
                    <HelpIcon tooltip="Your income tax liability for the previous tax year, used for carry-back calculations" />
                  </label>
                  <input
                    type="number"
                    value={inputs.incomeTaxLiabilityPrevYear}
                    onChange={(e) => updateInput('incomeTaxLiabilityPrevYear', Number(e.target.value))}
                    className="w-full p-3 border border-[var(--border)] rounded-[var(--radius-sm)] bg-[var(--background)] text-[var(--card-foreground)]"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--card-foreground)] mb-2">
                    Other Reliefs This Year
                    <HelpIcon tooltip="Other income tax reliefs you're claiming this year (e.g., VCT relief, pension contributions). These reduce available liability for SEIS/EIS relief" />
                  </label>
                  <input
                    type="number"
                    value={inputs.otherReliefsThisYear}
                    onChange={(e) => updateInput('otherReliefsThisYear', Number(e.target.value))}
                    className="w-full p-3 border border-[var(--border)] rounded-[var(--radius-sm)] bg-[var(--background)] text-[var(--card-foreground)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--card-foreground)] mb-2">
                    Other Reliefs Previous Year
                    <HelpIcon tooltip="Other income tax reliefs claimed in the previous year, which reduce the available liability for carry-back relief" />
                  </label>
                  <input
                    type="number"
                    value={inputs.otherReliefsPrevYear}
                    onChange={(e) => updateInput('otherReliefsPrevYear', Number(e.target.value))}
                    className="w-full p-3 border border-[var(--border)] rounded-[var(--radius-sm)] bg-[var(--background)] text-[var(--card-foreground)]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SEIS Section */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6">
            <h3 className="text-lg font-semibold text-[var(--card-foreground)] mb-4">SEIS Investments (50% Relief)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--card-foreground)] mb-2">
                  SEIS Invested This Year
                  <HelpIcon tooltip="Total amount invested in SEIS-qualifying companies during the current tax year. Maximum £200,000 per year for 50% tax relief" />
                </label>
                <input
                  type="number"
                  value={inputs.seisThisYear}
                  onChange={(e) => updateInput('seisThisYear', Number(e.target.value))}
                  className="w-full p-3 border border-[var(--border)] rounded-[var(--radius-sm)] bg-[var(--background)] text-[var(--card-foreground)]"
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--card-foreground)] mb-2">
                    SEIS Used Previous Year
                    <HelpIcon tooltip="Amount of SEIS allowance already used in the previous tax year. This reduces the available capacity for carry-back" />
                  </label>
                  <input
                    type="number"
                    value={inputs.seisUsedPrevYear}
                    onChange={(e) => updateInput('seisUsedPrevYear', Number(e.target.value))}
                    className="w-full p-3 border border-[var(--border)] rounded-[var(--radius-sm)] bg-[var(--background)] text-[var(--card-foreground)]"
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
                    className="w-full p-3 border border-[var(--border)] rounded-[var(--radius-sm)] bg-[var(--background)] text-[var(--card-foreground)]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* EIS Section */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6">
            <h3 className="text-lg font-semibold text-[var(--card-foreground)] mb-4">EIS Investments (30% Relief)</h3>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--card-foreground)] mb-2">
                    Total EIS This Year
                    <HelpIcon tooltip="Total amount invested in EIS-qualifying companies this tax year. Annual limit: £1m any company + £1m additional KIC companies = £2m total" />
                  </label>
                  <input
                    type="number"
                    value={inputs.eisThisYearTotal}
                    onChange={(e) => updateInput('eisThisYearTotal', Number(e.target.value))}
                    className="w-full p-3 border border-[var(--border)] rounded-[var(--radius-sm)] bg-[var(--background)] text-[var(--card-foreground)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--card-foreground)] mb-2">
                    KIC Amount
                    <HelpIcon tooltip="Amount invested in Knowledge Intensive Companies (KIC). This portion can use the additional £1m allowance above the standard £1m limit" />
                  </label>
                  <input
                    type="number"
                    value={inputs.eisThisYearKIC}
                    onChange={(e) => updateInput('eisThisYearKIC', Number(e.target.value))}
                    className="w-full p-3 border border-[var(--border)] rounded-[var(--radius-sm)] bg-[var(--background)] text-[var(--card-foreground)]"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--card-foreground)] mb-2">
                    EIS Used Previous Year
                    <HelpIcon tooltip="Amount of EIS allowance already used in the previous tax year. This reduces available capacity for carry-back relief" />
                  </label>
                  <input
                    type="number"
                    value={inputs.eisUsedPrevYear}
                    onChange={(e) => updateInput('eisUsedPrevYear', Number(e.target.value))}
                    className="w-full p-3 border border-[var(--border)] rounded-[var(--radius-sm)] bg-[var(--background)] text-[var(--card-foreground)]"
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
                    className="w-full p-3 border border-[var(--border)] rounded-[var(--radius-sm)] bg-[var(--background)] text-[var(--card-foreground)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Results */}
        <div className="space-y-6">
          {/* Headline Results */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6">
            <h3 className="text-lg font-semibold text-[var(--card-foreground)] mb-4">Tax Relief Summary</h3>
            <div className="grid grid-cols-2 gap-4">
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

          {/* SEIS Breakdown */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6">
            <h3 className="text-lg font-semibold text-[var(--card-foreground)] mb-4">SEIS Breakdown (50% Relief)</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-4 bg-blue-50 border border-gray-300 rounded-lg h-20 flex flex-col justify-between">
                  <div className="font-bold text-black text-sm">Applied to Previous Year</div>
                  <div className="text-black text-sm font-semibold">{formatCurrency(result.seis.appliedToPrev)} → {formatCurrency(result.seis.reliefPrev)} relief</div>
                </div>
                <div className="p-4 bg-blue-50 border border-gray-300 rounded-lg h-20 flex flex-col justify-between">
                  <div className="font-bold text-black text-sm">Applied to This Year</div>
                  <div className="text-black text-sm font-semibold">{formatCurrency(result.seis.appliedToThis)} → {formatCurrency(result.seis.reliefThis)} relief</div>
                </div>
                <div className="p-4 bg-blue-50 border border-gray-300 rounded-lg h-20 flex flex-col justify-between">
                  <div className="font-bold text-black text-sm">Allowance Remaining (Prev)</div>
                  <div className="text-black text-sm font-semibold">{formatCurrency(result.seis.allowanceRemainingPrev)}</div>
                </div>
                <div className="p-4 bg-blue-50 border border-gray-300 rounded-lg h-20 flex flex-col justify-between">
                  <div className="font-bold text-black text-sm">Allowance Remaining (This)</div>
                  <div className="text-black text-sm font-semibold">{formatCurrency(result.seis.allowanceRemainingThis)}</div>
                </div>
              </div>
              
              {result.seis.unusedPotentialLost > 0 && (
                <div className="text-sm text-[var(--warning)] bg-[var(--warning)]/10 p-3 rounded-[var(--radius-sm)]">
                  <strong>Potential Lost:</strong> {formatCurrency(result.seis.unusedPotentialLost)} relief lost due to insufficient liability
                </div>
              )}

              {/* SEIS Usage Progress Bars */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Previous Year Usage</span>
                    <span>{result.progress.seisUsagePrev.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-[var(--muted)] rounded-full h-2">
                    <div className="bg-[var(--primary)] h-2 rounded-full" style={{ width: `${Math.min(result.progress.seisUsagePrev, 100)}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>This Year Usage</span>
                    <span>{result.progress.seisUsageThis.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-[var(--muted)] rounded-full h-2">
                    <div className="bg-[var(--primary)] h-2 rounded-full" style={{ width: `${Math.min(result.progress.seisUsageThis, 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* EIS Breakdown */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6">
            <h3 className="text-lg font-semibold text-[var(--card-foreground)] mb-4">EIS Breakdown (30% Relief)</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-4 bg-green-50 border border-gray-300 rounded-lg h-24 flex flex-col justify-between">
                  <div className="font-bold text-black text-sm">Applied to Previous Year</div>
                  <div className="text-black text-sm font-semibold">
                    {formatCurrency(result.eis.appliedToPrev)} → {formatCurrency(result.eis.reliefPrev)} relief
                  </div>
                  <div className="text-xs text-black font-medium mt-1">
                    Non-KIC: {formatCurrency(result.eis.nonKicAppliedToPrev)} • KIC: {formatCurrency(result.eis.kicAppliedToPrev)}
                  </div>
                </div>
                <div className="p-4 bg-green-50 border border-gray-300 rounded-lg h-24 flex flex-col justify-between">
                  <div className="font-bold text-black text-sm">Applied to This Year</div>
                  <div className="text-black text-sm font-semibold">
                    {formatCurrency(result.eis.appliedToThis)} → {formatCurrency(result.eis.reliefThis)} relief
                  </div>
                  <div className="text-xs text-black font-medium mt-1">
                    Non-KIC: {formatCurrency(result.eis.nonKicAppliedToThis)} • KIC: {formatCurrency(result.eis.kicAppliedToThis)}
                  </div>
                </div>
                <div className="p-4 bg-green-50 border border-gray-300 rounded-lg h-24 flex flex-col justify-between">
                  <div className="font-bold text-black text-sm">Remaining Allowances (Prev)</div>
                  <div className="text-black text-sm font-semibold">
                    Any: {formatCurrency(result.eis.allowanceRemainingRegular.prev)}<br/>
                    Total: {formatCurrency(result.eis.allowanceRemainingKIC.prev)}
                  </div>
                </div>
                <div className="p-4 bg-green-50 border border-gray-300 rounded-lg h-24 flex flex-col justify-between">
                  <div className="font-bold text-black text-sm">Remaining Allowances (This)</div>
                  <div className="text-black text-sm font-semibold">
                    Any: {formatCurrency(result.eis.allowanceRemainingRegular.this)}<br/>
                    Total: {formatCurrency(result.eis.allowanceRemainingKIC.this)}
                  </div>
                </div>
              </div>
              
              {result.eis.unusedPotentialLost > 0 && (
                <div className="text-sm text-[var(--warning)] bg-[var(--warning)]/10 p-3 rounded-[var(--radius-sm)]">
                  <strong>Potential Lost:</strong> {formatCurrency(result.eis.unusedPotentialLost)} relief lost due to insufficient liability
                </div>
              )}

              {/* EIS Usage Progress Bars */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Previous Year - Any Band (£1m)</span>
                    <span>{result.progress.eisUsageRegularPrev.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-[var(--muted)] rounded-full h-2">
                    <div className="bg-[var(--secondary)] h-2 rounded-full" style={{ width: `${Math.min(result.progress.eisUsageRegularPrev, 100)}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Previous Year - Total (£2m)</span>
                    <span>{result.progress.eisUsageKICPrev.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-[var(--muted)] rounded-full h-2">
                    <div className="bg-[var(--secondary)]/70 h-2 rounded-full" style={{ width: `${Math.min(result.progress.eisUsageKICPrev, 100)}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>This Year - Any Band (£1m)</span>
                    <span>{result.progress.eisUsageRegularThis.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-[var(--muted)] rounded-full h-2">
                    <div className="bg-[var(--secondary)] h-2 rounded-full" style={{ width: `${Math.min(result.progress.eisUsageRegularThis, 100)}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>This Year - Total (£2m)</span>
                    <span>{result.progress.eisUsageKICThis.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-[var(--muted)] rounded-full h-2">
                    <div className="bg-[var(--secondary)]/70 h-2 rounded-full" style={{ width: `${Math.min(result.progress.eisUsageKICThis, 100)}%` }}></div>
                  </div>
                </div>
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
        </div>
      </div>

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