// SEIS/EIS Calculator Implementation - Following exact HMRC specification

// Constants per HMRC investor rules
const SEIS_RATE = 0.50;
const SEIS_CAP = 200_000;
const EIS_RATE = 0.30;
const EIS_CAP_ANY = 1_000_000;        // Any EIS up to £1m
const EIS_CAP_TOTAL = 2_000_000;      // Total EIS cap (£1m any + £1m KIC-only)

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

export function calculateSEISEIS(inputs: SEISEISInputs): SEISEISResult {
  const errors: string[] = [];
  const suggestions: string[] = [];
  
  // Clamp negative inputs to 0
  const S_this = Math.max(0, inputs.seisThisYear);
  const S_prev_used = Math.max(0, inputs.seisUsedPrevYear);
  const E_this_total = Math.max(0, inputs.eisThisYearTotal);
  const E_this_kic = Math.max(0, inputs.eisThisYearKIC);
  const E_prev_used = Math.max(0, inputs.eisUsedPrevYear);
  const O_prev = Math.max(0, inputs.otherReliefsPrevYear);
  const O_this = Math.max(0, inputs.otherReliefsThisYear);
  
  // Validation
  if (E_this_kic > E_this_total) errors.push("KIC amount cannot exceed total EIS investment");
  
  // Define E_this_non
  const E_this_non = Math.max(0, E_this_total - E_this_kic);
  
  // Adjust liabilities for other reliefs
  const L_prev = Math.max(0, inputs.incomeTaxLiabilityPrevYear - O_prev);
  const L_this = Math.max(0, inputs.incomeTaxLiabilityThisYear - O_this);
  
  // 1) Compute per-year investor capacity
  
  // SEIS
  const S_cap_prev = Math.max(0, SEIS_CAP - S_prev_used);
  const S_cap_this = SEIS_CAP;
  
  // EIS - previous year
  const E_cap_prev_any = Math.max(0, EIS_CAP_ANY - E_prev_used);
  const E_cap_prev_all = Math.max(0, EIS_CAP_TOTAL - E_prev_used);
  const E_cap_prev_kic_only = Math.max(0, E_cap_prev_all - E_cap_prev_any);
  
  // EIS - this year
  const E_cap_this_any = EIS_CAP_ANY;
  const E_cap_this_all = EIS_CAP_TOTAL;
  const E_cap_this_kic_only = E_cap_this_all - E_cap_this_any;
  
  // 2) Allocate to the previous year first (maximise relief there)
  
  // 2.1 SEIS → previous year
  let S_to_prev: number;
  if (inputs.autoOptimize || inputs.seisCarryBackRequested === 'auto') {
    S_to_prev = Math.min(S_this, S_cap_prev, 2 * L_prev); // because 50% rate
  } else {
    const S_carry_req = typeof inputs.seisCarryBackRequested === 'number' ? inputs.seisCarryBackRequested : 0;
    S_to_prev = Math.min(S_carry_req, S_this, S_cap_prev);
  }
  
  const SEIS_relief_prev = SEIS_RATE * S_to_prev;
  const L_prev_rem = Math.max(0, L_prev - SEIS_relief_prev);
  
  // 2.2 EIS → previous year (respect bands)
  let E_non_to_prev: number, E_kic_to_prev: number;
  
  if (inputs.autoOptimize || inputs.eisCarryBackRequested === 'auto') {
    // Auto: allocate to clear remaining liability
    const E_needed_prev = Math.ceil(L_prev_rem / EIS_RATE);
    
    // Allocate non-KIC first (fills the "any" band up to £1m)
    E_non_to_prev = Math.min(E_this_non, E_cap_prev_any, E_needed_prev);
    
    // Then allocate KIC in the KIC-only band (over £1m)
    E_kic_to_prev = Math.min(E_this_kic, E_cap_prev_kic_only, Math.max(0, E_needed_prev - E_non_to_prev));
  } else {
    // Manual: allocate based on user request
    const E_carry_req = typeof inputs.eisCarryBackRequested === 'number' ? inputs.eisCarryBackRequested : 0;
    const E_total_to_prev = Math.min(E_carry_req, E_this_total, E_cap_prev_all);
    
    // Allocate non-KIC first up to the "any" band
    E_non_to_prev = Math.min(E_this_non, E_cap_prev_any, E_total_to_prev);
    // Then KIC for remainder
    E_kic_to_prev = Math.min(E_this_kic, E_cap_prev_kic_only, Math.max(0, E_total_to_prev - E_non_to_prev));
  }
  
  const E_to_prev = E_non_to_prev + E_kic_to_prev;
  const EIS_relief_prev = EIS_RATE * E_to_prev;
  const L_prev_final_rem = Math.max(0, L_prev_rem - EIS_relief_prev);
  
  // Remainders to carry into "this year"
  const S_rem = S_this - S_to_prev;
  const E_non_rem = E_this_non - E_non_to_prev;
  const E_kic_rem = E_this_kic - E_kic_to_prev;
  
  // 3) Allocate to this year
  
  // 3.1 SEIS → this year
  const S_to_this = Math.min(S_rem, S_cap_this, 2 * L_this);
  const SEIS_relief_this = SEIS_RATE * S_to_this;
  const L_this_rem = Math.max(0, L_this - SEIS_relief_this);
  
  // 3.2 EIS → this year (respect bands)
  const E_needed_this = Math.ceil(L_this_rem / EIS_RATE);
  
  // Allocate non-KIC to the £1m "any" band
  const E_non_to_this = Math.min(E_non_rem, E_cap_this_any, E_needed_this);
  
  // Allocate KIC in the KIC-only band (over £1m)
  const E_kic_to_this = Math.min(E_kic_rem, E_cap_this_all - E_non_to_this, Math.max(0, E_needed_this - E_non_to_this));
  
  const E_to_this = E_non_to_this + E_kic_to_this;
  const EIS_relief_this = EIS_RATE * E_to_this;
  const L_this_final_rem = Math.max(0, L_this_rem - EIS_relief_this);
  
  // 4) Totals, lost-potential and residual allowance
  
  // 4.1 Relief totals
  const Relief_prev = SEIS_relief_prev + EIS_relief_prev;
  const Relief_this = SEIS_relief_this + EIS_relief_this;
  const Total_relief = Relief_prev + Relief_this;
  
  // 4.2 "Potential relief lost due to insufficient liability"
  
  // Previous year
  const SEIS_potential_prev = SEIS_RATE * Math.min(S_this, S_cap_prev);
  const EIS_potential_prev = EIS_RATE * (Math.min(E_this_non, E_cap_prev_any) + Math.min(E_this_kic, E_cap_prev_kic_only));
  const SEIS_lost_prev = Math.max(0, SEIS_potential_prev - SEIS_relief_prev);
  const EIS_lost_prev = Math.max(0, EIS_potential_prev - EIS_relief_prev);
  
  // This year
  const SEIS_potential_this = SEIS_RATE * Math.min(S_rem, S_cap_this);
  const EIS_potential_this = EIS_RATE * (Math.min(E_non_rem, E_cap_this_any) + Math.min(E_kic_rem, E_cap_this_kic_only));
  const SEIS_lost_this = Math.max(0, SEIS_potential_this - SEIS_relief_this);
  const EIS_lost_this = Math.max(0, EIS_potential_this - EIS_relief_this);
  
  // 4.3 Residual investor allowance
  const SEIS_allow_prev_left = Math.max(0, SEIS_CAP - (S_prev_used + S_to_prev));
  const SEIS_allow_this_left = Math.max(0, SEIS_CAP - S_to_this);
  
  const EIS_prev_any_left = Math.max(0, E_cap_prev_any - E_non_to_prev);
  const EIS_prev_total_left = Math.max(0, E_cap_prev_all - (E_non_to_prev + E_kic_to_prev));
  const EIS_this_any_left = Math.max(0, E_cap_this_any - E_non_to_this);
  const EIS_this_total_left = Math.max(0, E_cap_this_all - (E_non_to_this + E_kic_to_this));
  
  // 4.4 Effective net cost
  const Net_cost = (S_this + E_this_total) - Total_relief;
  
  // Generate optimization suggestions
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
      unusedPotentialLost: SEIS_lost_prev + SEIS_lost_this
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
      nonKicAppliedToThis: E_non_to_this
    },
    
    progress: {
      seisUsagePrev: ((S_prev_used + S_to_prev) / SEIS_CAP) * 100,
      seisUsageThis: (S_to_this / SEIS_CAP) * 100,
      eisUsageRegularPrev: (Math.min(E_prev_used + E_non_to_prev + E_kic_to_prev, EIS_CAP_ANY) / EIS_CAP_ANY) * 100,
      eisUsageRegularThis: (Math.min(E_non_to_this + E_kic_to_this, EIS_CAP_ANY) / EIS_CAP_ANY) * 100,
      eisUsageKICPrev: ((E_prev_used + E_non_to_prev + E_kic_to_prev) / EIS_CAP_TOTAL) * 100,
      eisUsageKICThis: ((E_non_to_this + E_kic_to_this) / EIS_CAP_TOTAL) * 100
    },
    
    suggestions,
    validationErrors: errors
  };
}