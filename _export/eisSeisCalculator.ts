export const SEIS_RATE = 0.50;
export const SEIS_CAP = 200_000;
export const EIS_RATE = 0.30;
export const EIS_CAP_ANY = 1_000_000;
export const EIS_CAP_TOTAL = 2_000_000;

export interface SEISEISInputs {
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

export interface SEISEISResult {
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

export function computeSEISEIS(inputs: SEISEISInputs): SEISEISResult {
  const errors: string[] = [];
  const suggestions: string[] = [];

  const S_this = Math.max(0, inputs.seisThisYear);
  const S_prev_used = Math.max(0, inputs.seisUsedPrevYear);
  const E_this_total = Math.max(0, inputs.eisThisYearTotal);
  const E_this_kic = Math.max(0, inputs.eisThisYearKIC);
  const E_prev_used = Math.max(0, inputs.eisUsedPrevYear);
  const O_prev = Math.max(0, inputs.otherReliefsPrevYear);
  const O_this = Math.max(0, inputs.otherReliefsThisYear);

  if (E_this_kic > E_this_total) errors.push("KIC amount cannot exceed total EIS investment");

  const E_this_non = Math.max(0, E_this_total - E_this_kic);

  const L_prev = Math.max(0, inputs.incomeTaxLiabilityPrevYear - O_prev);
  const L_this = Math.max(0, inputs.incomeTaxLiabilityThisYear - O_this);

  const S_cap_prev = Math.max(0, SEIS_CAP - S_prev_used);
  const S_cap_this = SEIS_CAP;

  const E_cap_prev_any = Math.max(0, EIS_CAP_ANY - E_prev_used);
  const E_cap_prev_all = Math.max(0, EIS_CAP_TOTAL - E_prev_used);
  const E_cap_prev_kic_only = Math.max(0, E_cap_prev_all - E_cap_prev_any);

  const E_cap_this_any = EIS_CAP_ANY;
  const E_cap_this_all = EIS_CAP_TOTAL;
  const E_cap_this_kic_only = E_cap_this_all - E_cap_this_any;

  let S_to_prev: number;
  if (inputs.autoOptimize || inputs.seisCarryBackRequested === 'auto') {
    S_to_prev = Math.min(S_this, S_cap_prev, 2 * L_prev);
  } else {
    const S_carry_req = typeof inputs.seisCarryBackRequested === 'number' ? inputs.seisCarryBackRequested : 0;
    S_to_prev = Math.min(S_carry_req, S_this, S_cap_prev);
  }

  const SEIS_relief_prev = SEIS_RATE * S_to_prev;
  const L_prev_rem = Math.max(0, L_prev - SEIS_relief_prev);

  let E_non_to_prev: number, E_kic_to_prev: number;

  if (inputs.autoOptimize || inputs.eisCarryBackRequested === 'auto') {
    const E_needed_prev = Math.ceil(L_prev_rem / EIS_RATE);
    E_non_to_prev = Math.min(E_this_non, E_cap_prev_any, E_needed_prev);
    E_kic_to_prev = Math.min(E_this_kic, E_cap_prev_kic_only, Math.max(0, E_needed_prev - E_non_to_prev));
  } else {
    const E_carry_req = typeof inputs.eisCarryBackRequested === 'number' ? inputs.eisCarryBackRequested : 0;
    const E_total_to_prev = Math.min(E_carry_req, E_this_total, E_cap_prev_all);
    E_non_to_prev = Math.min(E_this_non, E_cap_prev_any, E_total_to_prev);
    E_kic_to_prev = Math.min(E_this_kic, E_cap_prev_kic_only, Math.max(0, E_total_to_prev - E_non_to_prev));
  }

  const E_to_prev = E_non_to_prev + E_kic_to_prev;
  const EIS_relief_prev = EIS_RATE * E_to_prev;

  const S_rem = S_this - S_to_prev;
  const E_non_rem = E_this_non - E_non_to_prev;
  const E_kic_rem = E_this_kic - E_kic_to_prev;

  const S_to_this = Math.min(S_rem, S_cap_this, 2 * L_this);
  const SEIS_relief_this = SEIS_RATE * S_to_this;
  const L_this_rem = Math.max(0, L_this - SEIS_relief_this);

  const E_needed_this = Math.ceil(L_this_rem / EIS_RATE);
  const E_non_to_this = Math.min(E_non_rem, E_cap_this_any, E_needed_this);
  const E_kic_to_this = Math.min(E_kic_rem, E_cap_this_all - E_non_to_this, Math.max(0, E_needed_this - E_non_to_this));

  const E_to_this = E_non_to_this + E_kic_to_this;
  const EIS_relief_this = EIS_RATE * E_to_this;

  const Relief_prev = SEIS_relief_prev + EIS_relief_prev;
  const Relief_this = SEIS_relief_this + EIS_relief_this;
  const Total_relief = Relief_prev + Relief_this;

  const SEIS_potential_prev = SEIS_RATE * Math.min(S_this, S_cap_prev);
  const EIS_potential_prev = EIS_RATE * (Math.min(E_this_non, E_cap_prev_any) + Math.min(E_this_kic, E_cap_prev_kic_only));
  const SEIS_lost_prev = Math.max(0, SEIS_potential_prev - SEIS_relief_prev);
  const EIS_lost_prev = Math.max(0, EIS_potential_prev - EIS_relief_prev);

  const SEIS_potential_this = SEIS_RATE * Math.min(S_rem, S_cap_this);
  const EIS_potential_this = EIS_RATE * (Math.min(E_non_rem, E_cap_this_any) + Math.min(E_kic_rem, E_cap_this_kic_only));
  const SEIS_lost_this = Math.max(0, SEIS_potential_this - SEIS_relief_this);
  const EIS_lost_this = Math.max(0, EIS_potential_this - EIS_relief_this);

  const SEIS_allow_prev_left = Math.max(0, SEIS_CAP - (S_prev_used + S_to_prev));
  const SEIS_allow_this_left = Math.max(0, SEIS_CAP - S_to_this);

  const EIS_prev_any_left = Math.max(0, E_cap_prev_any - E_non_to_prev);
  const EIS_prev_total_left = Math.max(0, E_cap_prev_all - (E_non_to_prev + E_kic_to_prev));
  const EIS_this_any_left = Math.max(0, E_cap_this_any - E_non_to_this);
  const EIS_this_total_left = Math.max(0, E_cap_this_all - (E_non_to_this + E_kic_to_this));

  const Net_cost = (S_this + E_this_total) - Total_relief;

  if (inputs.autoOptimize) {
    suggestions.push(`Auto-optimized: Carry back £${S_to_prev.toLocaleString()} SEIS and £${E_to_prev.toLocaleString()} EIS to maximize relief`);
  }

  const total_lost = SEIS_lost_prev + EIS_lost_prev + SEIS_lost_this + EIS_lost_this;
  if (total_lost > 0) {
    suggestions.push(`£${total_lost.toLocaleString()} of potential relief lost due to insufficient income tax liability`);
  }

  return {
    totalRelief: Total_relief,
    reliefThisYear: Relief_this,
    reliefPrevYear: Relief_prev,
    effectiveNetCost: Net_cost,

    seis: {
      appliedToPrev: S_to_prev,
      appliedToThis: S_to_this,
      reliefPrev: SEIS_relief_prev,
      reliefThis: SEIS_relief_this,
      allowanceRemainingPrev: SEIS_allow_prev_left,
      allowanceRemainingThis: SEIS_allow_this_left,
      unusedPotentialLost: SEIS_lost_prev + SEIS_lost_this,
    },

    eis: {
      appliedToPrev: E_to_prev,
      appliedToThis: E_to_this,
      reliefPrev: EIS_relief_prev,
      reliefThis: EIS_relief_this,
      allowanceRemainingRegular: { prev: EIS_prev_any_left, this: EIS_this_any_left },
      allowanceRemainingKIC: { prev: EIS_prev_total_left, this: EIS_this_total_left },
      unusedPotentialLost: EIS_lost_prev + EIS_lost_this,
      kicAppliedToPrev: E_kic_to_prev,
      kicAppliedToThis: E_kic_to_this,
      nonKicAppliedToPrev: E_non_to_prev,
      nonKicAppliedToThis: E_non_to_this,
    },

    progress: {
      seisUsagePrev: ((S_prev_used + S_to_prev) / SEIS_CAP) * 100,
      seisUsageThis: (S_to_this / SEIS_CAP) * 100,
      eisUsageRegularPrev: (Math.min(E_prev_used + E_non_to_prev + E_kic_to_prev, EIS_CAP_ANY) / EIS_CAP_ANY) * 100,
      eisUsageRegularThis: (Math.min(E_non_to_this + E_kic_to_this, EIS_CAP_ANY) / EIS_CAP_ANY) * 100,
      eisUsageKICPrev: ((E_prev_used + E_non_to_prev + E_kic_to_prev) / EIS_CAP_TOTAL) * 100,
      eisUsageKICThis: ((E_non_to_this + E_kic_to_this) / EIS_CAP_TOTAL) * 100,
    },

    suggestions,
    validationErrors: errors,
  };
}

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

export function computeAllowance(inputs: AllowanceInputs): AllowanceResult {
  const rate = inputs.scheme === 'EIS' ? 0.30 : 0.50;
  const limitThis = inputs.scheme === 'EIS'
    ? (inputs.isKIC ? 2000000 : 1000000)
    : 200000;
  const limitPrev = limitThis;

  const notes: string[] = [];
  const validationErrors: string[] = [];

  const unusedAllowancePrevYear = inputs.unusedAllowancePrevYear ??
    Math.max(0, limitPrev - inputs.investmentPrevYear);

  const maxCarryBack = Math.min(
    inputs.investmentThisYear,
    unusedAllowancePrevYear,
    limitPrev - inputs.investmentPrevYear,
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

  const eligibleForPrev = Math.min(
    carryBackFromThisYear,
    inputs.incomeTaxLiabilityPrevYear / rate,
  );
  const reliefPrev = eligibleForPrev * rate;

  const remainingThisYearSubscription = inputs.investmentThisYear - carryBackFromThisYear;
  const allowanceLeftThis = Math.max(0, limitThis - remainingThisYearSubscription);

  const eligibleForThis = Math.min(
    remainingThisYearSubscription,
    inputs.incomeTaxLiabilityThisYear / rate,
  );
  const reliefThis = eligibleForThis * rate;

  const totalRelief = reliefPrev + reliefThis;
  const effectiveNetCost = inputs.investmentThisYear - totalRelief;

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
    validationErrors,
  };
}

export interface LossReliefInputs {
  scheme: 'EIS' | 'SEIS';
  subscription: number;
  saleProceeds: number;
  offsetType: 'income' | 'cgt';
  marginalIncomeRate?: number;
  cgtRate?: number;
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

export function computeLossRelief(inputs: LossReliefInputs): LossReliefResult {
  const rate = inputs.scheme === 'EIS' ? 0.30 : 0.50;
  const upfrontRelief = inputs.upfrontReliefActuallyClaimed ??
    (inputs.subscription * rate);

  const effectiveLoss = Math.max(
    0,
    inputs.subscription - upfrontRelief - inputs.saleProceeds,
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
      finalNetLoss: netLossAfterAllRelief,
    },
  };
}

export interface CGTDeferralInputs {
  mode: 'EIS_DEFERRAL' | 'SEIS_REINVESTMENT';
  originalGain: number;
  subscription: number;
  dateOfDisposal: Date;
  dateOfShareIssue: Date;
  cgtRate: number;
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

export function computeCGTDeferral(inputs: CGTDeferralInputs): CGTDeferralResult {
  const validationErrors: string[] = [];

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
      remaining: remainingGain ?? inputs.originalGain,
    },
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}
