export const ValuationConfig = {
  currencyPrimary: process.env.CURRENCY_PRIMARY || "GBP",
  // If the deck provides a discount rate we use it; if not, we DON'T discount unless this default is set.
  defaultDiscountRatePct: process.env.DEFAULT_DISCOUNT_RATE ?? null, // e.g. "0.25" or leave null
  // Which peer basis to prefer when computing a single gap:
  peerBasisOrder: ["revenue_multiple", "ebitda_multiple"], // reorder if you prefer
  // UI behaviour
  hideROIWithoutTerms: true,
  labelWhenNoTerms: "Deck Valuation (PV)", // used for headline tile
  // Rounding
  roundToNearest: 1000, // round to nearest currency unit (e.g. 1,000)
} as const;

// Generic helper functions
export function discountToPresent(
  futureValue: number,
  years?: number | null,
  rate?: number | null
) {
  if (!futureValue || !years || years <= 0 || !rate || rate <= 0) return Math.round(futureValue);
  return Math.round(futureValue / Math.pow(1 + rate, years));
}

export function roundTo(value: number, step: number) {
  if (!value || !step) return value;
  return Math.round(value / step) * step;
}

// Utility to get discount rate from KPIs or environment
export function getDiscountRate(kpis: any): number | null {
  if (typeof kpis.discount_rate_pct === "number") return kpis.discount_rate_pct;
  if (ValuationConfig.defaultDiscountRatePct != null) {
    const n = Number(ValuationConfig.defaultDiscountRatePct);
    return Number.isFinite(n) ? n : null;
  }
  return null; // no discounting unless the deck gives a rate or env provides default
}

// Compute present value multiple block generically
export function computePVMultipleBlock(
  base: number | null | undefined, 
  multLow: number, 
  multMid: number, 
  multHigh: number, 
  years: number, 
  rate: number | null
) {
  if (!base) return null;
  const fwdLow = Math.round(base * multLow);
  const fwdMid = Math.round(base * multMid);
  const fwdHigh = Math.round(base * multHigh);
  const pvLow  = discountToPresent(fwdLow,  years, rate);
  const pvMid  = discountToPresent(fwdMid,  years, rate);
  const pvHigh = discountToPresent(fwdHigh, years, rate);
  return {
    base,
    multiple_low: multLow,
    multiple_mid: multMid,
    multiple_high: multHigh,
    implied_forward_low: fwdLow,
    implied_forward_mid: fwdMid,
    implied_forward_high: fwdHigh,
    implied_low: pvLow,
    implied_mid: pvMid,
    implied_high: pvHigh,
    horizon_years: years,
    discounted: !!(rate && years > 0),
  };
}

// Guardrails for determining if we have enough data
export function hasEnoughForRevenuePV(k: any, res: any) {
  const band = res?.revenue_multiple;
  return !!(band?.implied_mid);
}

export function hasEnoughForEBITDAPV(k: any, res: any) {
  const band = res?.ebitda_multiple;
  return !!(band?.implied_mid);
}