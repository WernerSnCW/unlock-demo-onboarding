import { useState, useEffect } from 'react';

// Constants for allowances and rates
const SEIS_RATE = 0.50;
const SEIS_CAP = 200_000;
const EIS_RATE = 0.30;
const EIS_CAP_REGULAR = 1_000_000;
const EIS_CAP_WITH_KIC = 2_000_000;

interface SEISEISInputs {
  // Tax year context
  taxYear: string;
  
  // Income tax liability (before reliefs)
  incomeTaxLiabilityThisYear: number;
  incomeTaxLiabilityPrevYear: number;
  
  // Other reliefs (optional)
  otherReliefsThisYear: number;
  otherReliefsPrevYear: number;
  
  // SEIS section
  seisThisYear: number;
  seisCarryBackRequested: number | 'auto';
  seisUsedPrevYear: number;
  
  // EIS section
  eisThisYearTotal: number;
  eisThisYearKIC: number;
  eisCarryBackRequested: number | 'auto';
  eisUsedPrevYear: number;
  
  // Options
  prioritySEISFirst: boolean;
  autoOptimize: boolean;
}

interface SEISEISResult {
  // Headline summary
  totalRelief: number;
  reliefThisYear: number;
  reliefPrevYear: number;
  effectiveNetCost: number;
  
  // SEIS breakdown
  seis: {
    appliedToPrev: number;
    appliedToThis: number;
    reliefPrev: number;
    reliefThis: number;
    allowanceRemainingPrev: number;
    allowanceRemainingThis: number;
    unusedPotentialLost: number;
  };
  
  // EIS breakdown  
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
  
  // Progress tracking
  progress: {
    seisUsagePrev: number;
    seisUsageThis: number;
    eisUsageRegularPrev: number;
    eisUsageRegularThis: number;
    eisUsageKICPrev: number;
    eisUsageKICThis: number;
  };
  
  // Optimization suggestions
  suggestions: string[];
  validationErrors: string[];
}

function calculateSEISEIS(inputs: SEISEISInputs): SEISEISResult {
  const errors: string[] = [];
  const suggestions: string[] = [];
  
  // Validation
  if (inputs.incomeTaxLiabilityThisYear < 0) errors.push("Income tax liability cannot be negative");
  if (inputs.incomeTaxLiabilityPrevYear < 0) errors.push("Previous year income tax liability cannot be negative");
  if (inputs.seisThisYear < 0) errors.push("SEIS investment cannot be negative");
  if (inputs.eisThisYearTotal < 0) errors.push("EIS investment cannot be negative");
  if (inputs.eisThisYearKIC > inputs.eisThisYearTotal) errors.push("KIC amount cannot exceed total EIS investment");
  
  // Step A — SEIS allocation
  const seisPrevCapAvail = Math.max(0, SEIS_CAP - inputs.seisUsedPrevYear);
  
  let seisToPrev: number;
  if (inputs.autoOptimize || inputs.seisCarryBackRequested === 'auto') {
    // Auto optimize: maximize use of previous year liability
    seisToPrev = Math.min(inputs.seisThisYear, seisPrevCapAvail);
  } else {
    seisToPrev = Math.min(
      typeof inputs.seisCarryBackRequested === 'number' ? inputs.seisCarryBackRequested : 0,
      inputs.seisThisYear,
      seisPrevCapAvail
    );
  }
  
  const seisToThis = Math.min(inputs.seisThisYear - seisToPrev, SEIS_CAP);
  
  const seisReliefPrevPotential = SEIS_RATE * seisToPrev;
  const seisReliefThisPotential = SEIS_RATE * seisToThis;
  
  // Step B — EIS allocation (with KIC rule)
  const eisNonKICThis = inputs.eisThisYearTotal - inputs.eisThisYearKIC;
  
  // Carry-back to previous year (greedy, KIC-aware and optimal)
  const nonKIC_to_prev = Math.min(eisNonKICThis, Math.max(0, EIS_CAP_REGULAR - inputs.eisUsedPrevYear));
  
  const kicBandCapacityPrev = Math.max(0, EIS_CAP_WITH_KIC - (inputs.eisUsedPrevYear + nonKIC_to_prev));
  const KIC_to_prev_raw = Math.min(inputs.eisThisYearKIC, kicBandCapacityPrev);
  
  let eisToPrev: number;
  if (inputs.autoOptimize || inputs.eisCarryBackRequested === 'auto') {
    eisToPrev = nonKIC_to_prev + KIC_to_prev_raw;
  } else {
    eisToPrev = Math.min(
      typeof inputs.eisCarryBackRequested === 'number' ? inputs.eisCarryBackRequested : 0,
      nonKIC_to_prev + KIC_to_prev_raw
    );
  }
  
  let nonKIC_to_prev_final: number;
  let KIC_to_prev_final: number;
  
  if (eisToPrev < nonKIC_to_prev) {
    nonKIC_to_prev_final = eisToPrev;
    KIC_to_prev_final = 0;
  } else {
    nonKIC_to_prev_final = nonKIC_to_prev;
    KIC_to_prev_final = eisToPrev - nonKIC_to_prev;
  }
  
  // Apply in this year
  const nonKIC_rem = eisNonKICThis - nonKIC_to_prev_final;
  const KIC_rem = inputs.eisThisYearKIC - KIC_to_prev_final;
  const nonKIC_to_this = Math.min(nonKIC_rem, EIS_CAP_REGULAR);
  const KIC_to_this = Math.min(KIC_rem, EIS_CAP_WITH_KIC - nonKIC_to_this);
  
  const eisReliefPrevPotential = EIS_RATE * eisToPrev;
  const eisReliefThisPotential = EIS_RATE * (nonKIC_to_this + KIC_to_this);
  
  // Step C — Enforce per-year income-tax liability caps
  const liabPrev = Math.max(0, inputs.incomeTaxLiabilityPrevYear - inputs.otherReliefsPrevYear);
  const liabThis = Math.max(0, inputs.incomeTaxLiabilityThisYear - inputs.otherReliefsThisYear);
  
  // Priority rule: SEIS first (50%), then EIS (30%)
  let seisReliefPrev: number, eisReliefPrev: number, seisReliefThis: number, eisReliefThis: number;
  
  if (inputs.prioritySEISFirst) {
    seisReliefPrev = Math.min(seisReliefPrevPotential, liabPrev);
    const liabPrevRem = liabPrev - seisReliefPrev;
    eisReliefPrev = Math.min(eisReliefPrevPotential, liabPrevRem);
    
    seisReliefThis = Math.min(seisReliefThisPotential, liabThis);
    const liabThisRem = liabThis - seisReliefThis;
    eisReliefThis = Math.min(eisReliefThisPotential, liabThisRem);
  } else {
    // EIS first priority
    eisReliefPrev = Math.min(eisReliefPrevPotential, liabPrev);
    const liabPrevRem = liabPrev - eisReliefPrev;
    seisReliefPrev = Math.min(seisReliefPrevPotential, liabPrevRem);
    
    eisReliefThis = Math.min(eisReliefThisPotential, liabThis);
    const liabThisRem = liabThis - eisReliefThis;
    seisReliefThis = Math.min(seisReliefThisPotential, liabThisRem);
  }
  
  // Calculate totals and remaining allowances
  const totalRelief = seisReliefPrev + eisReliefPrev + seisReliefThis + eisReliefThis;
  const effectiveNetCost = inputs.seisThisYear + inputs.eisThisYearTotal - totalRelief;
  
  // SEIS allowances remaining
  const seisAllowanceRemainingPrev = SEIS_CAP - (inputs.seisUsedPrevYear + seisToPrev);
  const seisAllowanceRemainingThis = SEIS_CAP - seisToThis;
  
  // EIS allowances remaining
  const eisUsedPrevTotal = inputs.eisUsedPrevYear + nonKIC_to_prev_final + KIC_to_prev_final;
  const eisUsedThisTotal = nonKIC_to_this + KIC_to_this;
  
  const eisAllowanceRegularPrev = Math.max(0, EIS_CAP_REGULAR - eisUsedPrevTotal);
  const eisAllowanceKICPrev = Math.max(0, EIS_CAP_WITH_KIC - eisUsedPrevTotal);
  const eisAllowanceRegularThis = Math.max(0, EIS_CAP_REGULAR - eisUsedThisTotal);
  const eisAllowanceKICThis = Math.max(0, EIS_CAP_WITH_KIC - eisUsedThisTotal);
  
  // Calculate unused potential lost
  const seisUnusedLost = (seisReliefPrevPotential - seisReliefPrev) + (seisReliefThisPotential - seisReliefThis);
  const eisUnusedLost = (eisReliefPrevPotential - eisReliefPrev) + (eisReliefThisPotential - eisReliefThis);
  
  // Generate optimization suggestions
  if (inputs.autoOptimize) {
    suggestions.push(`Auto-optimized: Carry back £${seisToPrev.toLocaleString()} SEIS and £${eisToPrev.toLocaleString()} EIS to maximize relief`);
  }
  
  if (seisUnusedLost > 0 || eisUnusedLost > 0) {
    suggestions.push(`£${(seisUnusedLost + eisUnusedLost).toLocaleString()} of potential relief lost due to insufficient income tax liability`);
  }
  
  return {
    totalRelief,
    reliefThisYear: seisReliefThis + eisReliefThis,
    reliefPrevYear: seisReliefPrev + eisReliefPrev,
    effectiveNetCost,
    
    seis: {
      appliedToPrev: seisToPrev,
      appliedToThis: seisToThis,
      reliefPrev: seisReliefPrev,
      reliefThis: seisReliefThis,
      allowanceRemainingPrev: seisAllowanceRemainingPrev,
      allowanceRemainingThis: seisAllowanceRemainingThis,
      unusedPotentialLost: seisUnusedLost
    },
    
    eis: {
      appliedToPrev: eisToPrev,
      appliedToThis: nonKIC_to_this + KIC_to_this,
      reliefPrev: eisReliefPrev,
      reliefThis: eisReliefThis,
      allowanceRemainingRegular: { prev: eisAllowanceRegularPrev, this: eisAllowanceRegularThis },
      allowanceRemainingKIC: { prev: eisAllowanceKICPrev, this: eisAllowanceKICThis },
      unusedPotentialLost: eisUnusedLost,
      kicAppliedToPrev: KIC_to_prev_final,
      kicAppliedToThis: KIC_to_this,
      nonKicAppliedToPrev: nonKIC_to_prev_final,
      nonKicAppliedToThis: nonKIC_to_this
    },
    
    progress: {
      seisUsagePrev: ((inputs.seisUsedPrevYear + seisToPrev) / SEIS_CAP) * 100,
      seisUsageThis: (seisToThis / SEIS_CAP) * 100,
      eisUsageRegularPrev: (Math.min(eisUsedPrevTotal, EIS_CAP_REGULAR) / EIS_CAP_REGULAR) * 100,
      eisUsageRegularThis: (Math.min(eisUsedThisTotal, EIS_CAP_REGULAR) / EIS_CAP_REGULAR) * 100,
      eisUsageKICPrev: (Math.max(0, eisUsedPrevTotal - EIS_CAP_REGULAR) / EIS_CAP_REGULAR) * 100,
      eisUsageKICThis: (Math.max(0, eisUsedThisTotal - EIS_CAP_REGULAR) / EIS_CAP_REGULAR) * 100
    },
    
    suggestions,
    validationErrors: errors
  };
}

export default function SimpleAllowanceCalculator() {
  const currentYear = new Date().getFullYear();
  const taxYear = `${currentYear}/${(currentYear + 1).toString().slice(-2)}`;
  const prevTaxYear = `${currentYear - 1}/${currentYear.toString().slice(-2)}`;
  
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
            <p className="text-sm text-[var(--info)]/80">This year: {taxYear} • Previous year: {prevTaxYear}</p>
          </div>
          <div className="flex gap-2">
            <label className="flex items-center text-sm text-[var(--foreground)]">
              <input
                type="checkbox"
                checked={inputs.autoOptimize}
                onChange={(e) => updateInput('autoOptimize', e.target.checked)}
                className="mr-2"
              />
              Auto Optimize
            </label>
            <label className="flex items-center text-sm text-[var(--foreground)]">
              <input
                type="checkbox"
                checked={inputs.prioritySEISFirst}
                onChange={(e) => updateInput('prioritySEISFirst', e.target.checked)}
                className="mr-2"
              />
              SEIS Priority
            </label>
          </div>
        </div>
      </div>

      {/* Single Column Layout with Alternating Input/Result Pairs */}
      <div className="space-y-8">
        
        {/* General Information & Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[var(--muted)] rounded-[var(--radius-sm)] p-4">
            <h4 className="font-semibold text-[var(--card-foreground)] mb-4">A. General Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--card-foreground)] mb-1">
                  Income Tax Liability This Year (£)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={inputs.incomeTaxLiabilityThisYear}
                  onChange={(e) => updateInput('incomeTaxLiabilityThisYear', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--card-foreground)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--card-foreground)] mb-1">
                  Income Tax Liability Previous Year (£)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={inputs.incomeTaxLiabilityPrevYear}
                  onChange={(e) => updateInput('incomeTaxLiabilityPrevYear', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--card-foreground)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--card-foreground)] mb-1">
                  Other Reliefs This Year (£)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={inputs.otherReliefsThisYear}
                  onChange={(e) => updateInput('otherReliefsThisYear', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--card-foreground)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--card-foreground)] mb-1">
                  Other Reliefs Previous Year (£)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={inputs.otherReliefsPrevYear}
                  onChange={(e) => updateInput('otherReliefsPrevYear', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--card-foreground)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-[var(--primary-foreground)] rounded-[var(--radius-sm)] p-4" style={{ boxShadow: 'var(--shadow-md)' }}>
            <h4 className="font-semibold text-[var(--primary-foreground)] mb-4 flex items-center gap-2">
              <i className="fas fa-calculator"></i>
              Total Relief Summary
            </h4>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">{formatCurrency(result.totalRelief)}</div>
              <div className="text-[var(--primary-foreground)]/80 mb-3">Total Tax Relief</div>
              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div className="bg-[var(--primary-foreground)]/20 rounded-[var(--radius-sm)] p-2">
                  <div className="font-semibold">{formatCurrency(result.reliefThisYear)}</div>
                  <div className="text-[var(--primary-foreground)]/80">Relief This Year</div>
                </div>
                <div className="bg-[var(--primary-foreground)]/20 rounded-[var(--radius-sm)] p-2">
                  <div className="font-semibold">{formatCurrency(result.reliefPrevYear)}</div>
                  <div className="text-[var(--primary-foreground)]/80">Carried Back</div>
                </div>
              </div>
              <div className="pt-3 border-t border-[var(--primary-foreground)]/30">
                <div className="text-base font-semibold">Net Cost: {formatCurrency(result.effectiveNetCost)}</div>
                <div className="text-xs text-[var(--primary-foreground)]/80">After tax relief</div>
              </div>
            </div>
          </div>
        </div>

        {/* SEIS Section & Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[var(--warning)]/10 rounded-[var(--radius-sm)] p-4 border border-[var(--warning)]/30">
            <h4 className="font-semibold text-[var(--warning)] mb-4 flex items-center gap-2">
              <i className="fas fa-star"></i>
              B. SEIS Section
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[var(--card-foreground)] mb-1">
                  SEIS Subscribed This Year (£)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={inputs.seisThisYear}
                  onChange={(e) => updateInput('seisThisYear', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--card-foreground)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                />
                <p className="text-xs text-[var(--muted-foreground)] mt-1">Annual cap: £200,000 • Rate: 50%</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--card-foreground)] mb-1">
                  Carry Back to Previous Year
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={inputs.seisCarryBackRequested === 'auto' ? 0 : inputs.seisCarryBackRequested}
                    onChange={(e) => updateInput('seisCarryBackRequested', Number(e.target.value))}
                    disabled={inputs.autoOptimize}
                    className="flex-1 px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--card-foreground)] disabled:opacity-50 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                  />
                  {inputs.autoOptimize && (
                    <span className="px-3 py-2 bg-[var(--success)]/20 text-[var(--success)] text-sm rounded-[var(--radius-sm)]">Auto</span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--card-foreground)] mb-1">
                  SEIS Already Used Last Year (£)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={inputs.seisUsedPrevYear}
                  onChange={(e) => updateInput('seisUsedPrevYear', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--card-foreground)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
            </div>
          </div>

          <div className="bg-[var(--warning)]/10 rounded-[var(--radius-sm)] p-4 border border-[var(--warning)]/30">
            <h4 className="font-semibold text-[var(--warning)] mb-4 flex items-center gap-2">
              <i className="fas fa-star"></i>
              SEIS Breakdown
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
              <div>
                <div className="text-[var(--muted-foreground)] text-xs">Applied to Previous Year</div>
                <div className="font-semibold text-[var(--card-foreground)]">{formatCurrency(result.seis.appliedToPrev)}</div>
                <div className="text-[var(--warning)] text-sm">Relief: {formatCurrency(result.seis.reliefPrev)}</div>
              </div>
              <div>
                <div className="text-[var(--muted-foreground)] text-xs">Applied to This Year</div>
                <div className="font-semibold text-[var(--card-foreground)]">{formatCurrency(result.seis.appliedToThis)}</div>
                <div className="text-[var(--warning)] text-sm">Relief: {formatCurrency(result.seis.reliefThis)}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-[var(--muted-foreground)] text-xs">Allowance Remaining (Prev)</div>
                <div className="font-semibold text-[var(--card-foreground)]">{formatCurrency(result.seis.allowanceRemainingPrev)}</div>
              </div>
              <div>
                <div className="text-[var(--muted-foreground)] text-xs">Allowance Remaining (This)</div>
                <div className="font-semibold text-[var(--card-foreground)]">{formatCurrency(result.seis.allowanceRemainingThis)}</div>
              </div>
            </div>
            {result.seis.unusedPotentialLost > 0 && (
              <div className="mt-4 p-2 bg-[var(--destructive)]/10 text-[var(--destructive)] rounded-[var(--radius-sm)] text-sm">
                Unused potential lost: {formatCurrency(result.seis.unusedPotentialLost)}
              </div>
            )}
          </div>
        </div>

        {/* EIS Section & Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[var(--success)]/10 rounded-[var(--radius-sm)] p-4 border border-[var(--success)]/30">
            <h4 className="font-semibold text-[var(--success)] mb-4 flex items-center gap-2">
              <i className="fas fa-building"></i>
              C. EIS Section
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[var(--card-foreground)] mb-1">
                  EIS Subscribed This Year - Total (£)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={inputs.eisThisYearTotal}
                  onChange={(e) => updateInput('eisThisYearTotal', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--card-foreground)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                />
                <p className="text-xs text-[var(--muted-foreground)] mt-1">Annual cap: £1m regular + £1m KIC • Rate: 30%</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--card-foreground)] mb-1">
                  ...of which is Knowledge-Intensive Companies (KIC) (£)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={inputs.eisThisYearKIC}
                  onChange={(e) => updateInput('eisThisYearKIC', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--card-foreground)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--card-foreground)] mb-1">
                  Carry Back to Previous Year
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={inputs.eisCarryBackRequested === 'auto' ? 0 : inputs.eisCarryBackRequested}
                    onChange={(e) => updateInput('eisCarryBackRequested', Number(e.target.value))}
                    disabled={inputs.autoOptimize}
                    className="flex-1 px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--card-foreground)] disabled:opacity-50 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                  />
                  {inputs.autoOptimize && (
                    <span className="px-3 py-2 bg-[var(--success)]/20 text-[var(--success)] text-sm rounded-[var(--radius-sm)]">Auto</span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--card-foreground)] mb-1">
                  EIS Already Used Last Year (£)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={inputs.eisUsedPrevYear}
                  onChange={(e) => updateInput('eisUsedPrevYear', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--card-foreground)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
            </div>
          </div>

          <div className="bg-[var(--success)]/10 rounded-[var(--radius-sm)] p-4 border border-[var(--success)]/30">
            <h4 className="font-semibold text-[var(--success)] mb-4 flex items-center gap-2">
              <i className="fas fa-building"></i>
              EIS Breakdown
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
              <div>
                <div className="text-[var(--muted-foreground)] text-xs">Applied to Previous Year</div>
                <div className="font-semibold text-[var(--card-foreground)]">{formatCurrency(result.eis.appliedToPrev)}</div>
                <div className="text-[var(--success)] text-sm">Relief: {formatCurrency(result.eis.reliefPrev)}</div>
                <div className="text-xs text-[var(--muted-foreground)]">
                  Non-KIC: {formatCurrency(result.eis.nonKicAppliedToPrev)} | KIC: {formatCurrency(result.eis.kicAppliedToPrev)}
                </div>
              </div>
              <div>
                <div className="text-[var(--muted-foreground)] text-xs">Applied to This Year</div>
                <div className="font-semibold text-[var(--card-foreground)]">{formatCurrency(result.eis.appliedToThis)}</div>
                <div className="text-[var(--success)] text-sm">Relief: {formatCurrency(result.eis.reliefThis)}</div>
                <div className="text-xs text-[var(--muted-foreground)]">
                  Non-KIC: {formatCurrency(result.eis.nonKicAppliedToThis)} | KIC: {formatCurrency(result.eis.kicAppliedToThis)}
                </div>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <div className="text-[var(--muted-foreground)]">Remaining Allowances (Previous Year)</div>
                <div className="text-[var(--card-foreground)]">Up to £1m (any): {formatCurrency(result.eis.allowanceRemainingRegular.prev)}</div>
                <div className="text-[var(--card-foreground)]">KIC-only to £2m: {formatCurrency(result.eis.allowanceRemainingKIC.prev)}</div>
              </div>
              <div>
                <div className="text-[var(--muted-foreground)]">Remaining Allowances (This Year)</div>
                <div className="text-[var(--card-foreground)]">Up to £1m (any): {formatCurrency(result.eis.allowanceRemainingRegular.this)}</div>
                <div className="text-[var(--card-foreground)]">KIC-only to £2m: {formatCurrency(result.eis.allowanceRemainingKIC.this)}</div>
              </div>
            </div>
            {result.eis.unusedPotentialLost > 0 && (
              <div className="mt-4 p-2 bg-[var(--destructive)]/10 text-[var(--destructive)] rounded-[var(--radius-sm)] text-sm">
                Unused potential lost: {formatCurrency(result.eis.unusedPotentialLost)}
              </div>
            )}
          </div>

          {/* Progress Bars */}
          <div className="bg-[var(--muted)] rounded-[var(--radius-sm)] p-4">
            <h4 className="font-semibold text-[var(--card-foreground)] mb-3">Usage Progress</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1 text-[var(--card-foreground)]">
                  <span>SEIS Previous Year</span>
                  <span>{result.progress.seisUsagePrev.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-[var(--border)] rounded-full h-2">
                  <div className="bg-[var(--warning)] h-2 rounded-full" style={{ width: `${Math.min(result.progress.seisUsagePrev, 100)}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1 text-[var(--card-foreground)]">
                  <span>SEIS This Year</span>
                  <span>{result.progress.seisUsageThis.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-[var(--border)] rounded-full h-2">
                  <div className="bg-[var(--warning)] h-2 rounded-full" style={{ width: `${Math.min(result.progress.seisUsageThis, 100)}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1 text-[var(--card-foreground)]">
                  <span>EIS Regular (Previous)</span>
                  <span>{result.progress.eisUsageRegularPrev.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-[var(--border)] rounded-full h-2">
                  <div className="bg-[var(--success)] h-2 rounded-full" style={{ width: `${Math.min(result.progress.eisUsageRegularPrev, 100)}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1 text-[var(--card-foreground)]">
                  <span>EIS KIC Band (Previous)</span>
                  <span>{result.progress.eisUsageKICPrev.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-[var(--border)] rounded-full h-2">
                  <div className="bg-[var(--secondary)] h-2 rounded-full" style={{ width: `${Math.min(result.progress.eisUsageKICPrev, 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <div className="bg-[var(--info)]/10 rounded-[var(--radius-sm)] p-4 border border-[var(--info)]/30">
              <h4 className="font-semibold text-[var(--info)] mb-2">Optimization Suggestions</h4>
              <ul className="text-sm text-[var(--info)]/80 space-y-1">
                {result.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <i className="fas fa-lightbulb text-[var(--warning)] mt-0.5"></i>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Scope Note */}
          <div className="bg-[var(--muted)] rounded-[var(--radius-sm)] p-4 border border-[var(--border)]">
            <h4 className="font-semibold text-[var(--card-foreground)] mb-2">Important Notes</h4>
            <div className="text-sm text-[var(--muted-foreground)] space-y-1">
              <p>• This tool models income tax relief only under SEIS/EIS schemes</p>
              <p>• No carry-forward of unused relief; relief in each year cannot exceed that year's income tax liability</p>
              <p>• Does not model CGT deferral (EIS), CGT reduction/reinvestment (SEIS), or loss relief</p>
              <p>• SEIS rate: 50% up to £200k annually | EIS rate: 30% up to £1m + £1m KIC annually</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}