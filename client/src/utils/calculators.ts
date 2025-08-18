// Calculator utilities for EIS/SEIS tax calculations

export interface AllowanceInputs {
  scheme: 'EIS' | 'SEIS';
  isKIC?: boolean;
  investmentThisYear: number;
  incomeTaxLiabilityThisYear: number;
  investmentPrevYear: number;
  unusedAllowancePrevYear?: number;
  carryBackFromThisYear: number;
  incomeTaxLiabilityPrevYear: number;
  investorLimitUsedPrevYear: boolean;
}

export interface AllowanceResult {
  reliefThis: number;
  reliefPrev: number;
  totalRelief: number;
  effectiveNetCost: number;
  allowanceLeftThis: number;
  allowanceLeftPrev: number;
  eligibleForThis: number;
  eligibleForPrev: number;
  limitThis: number;
  limitPrev: number;
  rate: number;
  notes: string[];
  validationErrors: string[];
}

export interface LossReliefInputs {
  scheme: 'EIS' | 'SEIS';
  subscription: number;
  saleProceeds: number;
  offsetType: 'income' | 'cgt';
  marginalIncomeRate?: number; // 0.20, 0.40, 0.45
  cgtRate?: number; // 0.10, 0.20
  upfrontReliefActuallyClaimed?: number;
}

export interface LossReliefResult {
  upfrontRelief: number;
  effectiveLoss: number;
  lossRelief: number;
  netLossAfterAllRelief: number;
  grossLoss: number;
  reductionPct: number;
  breakdown: {
    subscription: number;
    upfrontRelief: number;
    proceeds: number;
    effectiveLoss: number;
    chosenRate: number;
    lossReliefValue: number;
    finalNetLoss: number;
  };
}

export interface CGTDeferralInputs {
  mode: 'EIS_DEFERRAL' | 'SEIS_REINVESTMENT';
  originalGain: number;
  subscription: number;
  dateOfDisposal: Date;
  dateOfShareIssue: Date;
  cgtRate: number; // 0.10 or 0.20
}

export interface CGTDeferralResult {
  cgtDeferredOrSaved: number;
  remainingGain?: number;
  gainExempted?: number;
  deferrableAmount?: number;
  windowPass: boolean;
  minHoldDate?: Date;
  validationErrors: string[];
  breakdown: {
    originalGain: number;
    amountMatched: number;
    rateUsed: number;
    deferredOrExempted: number;
    remaining: number;
  };
}

export function calcAllowance(inputs: AllowanceInputs): AllowanceResult {
  const rate = inputs.scheme === 'EIS' ? 0.30 : 0.50;
  const limitThis = inputs.scheme === 'EIS' 
    ? (inputs.isKIC ? 2000000 : 1000000) 
    : 200000;
  const limitPrev = limitThis; // Same logic for previous year
  
  const notes: string[] = [];
  const validationErrors: string[] = [];

  // Calculate unused allowance from previous year if not provided
  const unusedAllowancePrevYear = inputs.unusedAllowancePrevYear ?? 
    Math.max(0, limitPrev - inputs.investmentPrevYear);

  // Validate carry-back cap
  const maxCarryBack = Math.min(
    inputs.investmentThisYear,
    unusedAllowancePrevYear,
    limitPrev - inputs.investmentPrevYear
  );

  let carryBackFromThisYear = inputs.carryBackFromThisYear;
  
  if (inputs.investorLimitUsedPrevYear) {
    carryBackFromThisYear = 0;
    if (inputs.carryBackFromThisYear > 0) {
      notes.push("Carry-back set to £0 because investor limit was used in previous year");
    }
  } else if (carryBackFromThisYear > maxCarryBack) {
    validationErrors.push(`Carry-back cannot exceed £${maxCarryBack.toLocaleString()}`);
    carryBackFromThisYear = Math.min(carryBackFromThisYear, maxCarryBack);
  }

  // Calculate relief amounts
  const eligibleForPrev = Math.min(
    carryBackFromThisYear, 
    inputs.incomeTaxLiabilityPrevYear / rate
  );
  const reliefPrev = eligibleForPrev * rate;

  const remainingThisYearSubscription = inputs.investmentThisYear - carryBackFromThisYear;
  const allowanceLeftThis = Math.max(0, limitThis - remainingThisYearSubscription);

  const eligibleForThis = Math.min(
    remainingThisYearSubscription,
    inputs.incomeTaxLiabilityThisYear / rate
  );
  const reliefThis = eligibleForThis * rate;

  const totalRelief = reliefPrev + reliefThis;
  const effectiveNetCost = inputs.investmentThisYear - totalRelief;

  // Add helpful notes
  if (inputs.scheme === 'EIS' && inputs.isKIC && limitThis === 2000000) {
    notes.push("Anything above £1m must be in Knowledge Intensive Companies (KICs)");
  }

  if (eligibleForThis < remainingThisYearSubscription) {
    notes.push("Relief capped by income tax liability this year");
  }

  if (eligibleForPrev < carryBackFromThisYear) {
    notes.push("Carry-back relief capped by previous year's income tax liability");
  }

  return {
    reliefThis,
    reliefPrev,
    totalRelief,
    effectiveNetCost,
    allowanceLeftThis,
    allowanceLeftPrev: unusedAllowancePrevYear - carryBackFromThisYear,
    eligibleForThis,
    eligibleForPrev,
    limitThis,
    limitPrev,
    rate,
    notes,
    validationErrors
  };
}

export function calcLossRelief(inputs: LossReliefInputs): LossReliefResult {
  const rate = inputs.scheme === 'EIS' ? 0.30 : 0.50;
  const upfrontRelief = inputs.upfrontReliefActuallyClaimed ?? 
    (inputs.subscription * rate);

  const effectiveLoss = Math.max(
    0, 
    inputs.subscription - upfrontRelief - inputs.saleProceeds
  );

  const chosenRate = inputs.offsetType === 'income' 
    ? (inputs.marginalIncomeRate ?? 0.20)
    : (inputs.cgtRate ?? 0.20);

  const lossRelief = effectiveLoss * chosenRate;
  const netLossAfterAllRelief = inputs.subscription - upfrontRelief - inputs.saleProceeds - lossRelief;
  const grossLoss = inputs.subscription - inputs.saleProceeds;
  const reductionPct = grossLoss > 0 ? (1 - netLossAfterAllRelief / grossLoss) * 100 : 0;

  return {
    upfrontRelief,
    effectiveLoss,
    lossRelief,
    netLossAfterAllRelief,
    grossLoss,
    reductionPct,
    breakdown: {
      subscription: inputs.subscription,
      upfrontRelief,
      proceeds: inputs.saleProceeds,
      effectiveLoss,
      chosenRate,
      lossReliefValue: lossRelief,
      finalNetLoss: netLossAfterAllRelief
    }
  };
}

export function calcCGTDeferral(inputs: CGTDeferralInputs): CGTDeferralResult {
  const validationErrors: string[] = [];
  
  // Window test for EIS (1 year before to 3 years after disposal)
  let windowPass = true;
  if (inputs.mode === 'EIS_DEFERRAL') {
    const oneYearBefore = new Date(inputs.dateOfDisposal);
    oneYearBefore.setFullYear(oneYearBefore.getFullYear() - 1);
    
    const threeYearsAfter = new Date(inputs.dateOfDisposal);
    threeYearsAfter.setFullYear(threeYearsAfter.getFullYear() + 3);
    
    windowPass = inputs.dateOfShareIssue >= oneYearBefore && 
                 inputs.dateOfShareIssue <= threeYearsAfter;
    
    if (!windowPass) {
      validationErrors.push("EIS deferral window is 1 year before to 3 years after disposal date");
    }
  }

  let cgtDeferredOrSaved = 0;
  let remainingGain: number | undefined;
  let gainExempted: number | undefined;
  let deferrableAmount: number | undefined;
  let minHoldDate: Date | undefined;

  if (inputs.mode === 'EIS_DEFERRAL' && windowPass) {
    deferrableAmount = Math.min(inputs.originalGain, inputs.subscription);
    cgtDeferredOrSaved = deferrableAmount * inputs.cgtRate;
    
    minHoldDate = new Date(inputs.dateOfShareIssue);
    minHoldDate.setFullYear(minHoldDate.getFullYear() + 3);
    
  } else if (inputs.mode === 'SEIS_REINVESTMENT') {
    const eligibleInvestment = Math.min(inputs.subscription, 200000);
    gainExempted = Math.min(inputs.originalGain, eligibleInvestment * 0.5);
    cgtDeferredOrSaved = gainExempted * inputs.cgtRate;
    remainingGain = inputs.originalGain - gainExempted;
  }

  const amountMatched = inputs.mode === 'EIS_DEFERRAL' 
    ? (deferrableAmount ?? 0)
    : Math.min(inputs.subscription, 200000);

  return {
    cgtDeferredOrSaved,
    remainingGain,
    gainExempted,
    deferrableAmount,
    windowPass,
    minHoldDate,
    validationErrors,
    breakdown: {
      originalGain: inputs.originalGain,
      amountMatched,
      rateUsed: inputs.cgtRate,
      deferredOrExempted: inputs.mode === 'EIS_DEFERRAL' ? (deferrableAmount ?? 0) : (gainExempted ?? 0),
      remaining: remainingGain ?? inputs.originalGain
    }
  };
}

// Utility functions
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}