// src/valuation_config.ts

/** Generic, env-driven configuration — no hard-coded deck values */
export const ValuationConfig = {
  currencyPrimary: process.env.CURRENCY_PRIMARY || "GBP",

  /** If the deck provides a discount rate we use it; otherwise we use this default when set (or no discounting if null) */
  defaultDiscountRatePct:
    process.env.DEFAULT_DISCOUNT_RATE != null
      ? Number(process.env.DEFAULT_DISCOUNT_RATE)
      : null, // e.g. set env DEFAULT_DISCOUNT_RATE=0.25

  /** Preferred order when picking a single peer basis for gap calculations */
  peerBasisOrder: ["revenue_multiple", "ebitda_multiple"] as const,

  /** UI behaviour */
  hideROIWithoutTerms: true,
  labelWhenNoTerms: "Deck Valuation (PV)",

  /** Rounding step for currency values shown to users */
  roundToNearest: 1000,
} as const;

/** Discount a forward EV back to present value */
export function discountToPresent(
  futureValue: number,
  years?: number | null,
  rate?: number | null,
): number {
  if (!futureValue || !years || years <= 0 || !rate || rate <= 0) {
    return Math.round(futureValue);
  }
  return Math.round(futureValue / Math.pow(1 + rate, years));
}

/** Round a value to a given step (e.g., 1,000) */
export function roundTo(value: number, step?: number | null): number {
  if (!value || !step) return Math.round(value);
  return Math.round(value / step) * step;
}

/** Get the discount rate to use (deck > env default > none) */
export function getDiscountRate(kpis: {
  discount_rate_pct?: number | null;
}): number | null {
  if (typeof kpis.discount_rate_pct === "number") return kpis.discount_rate_pct;
  return ValuationConfig.defaultDiscountRatePct ?? null;
}

/** Build a multiple block that contains forward and present-value bands */
export function computePVMultipleBlock(
  base: number | null | undefined,
  multLow: number,
  multMid: number,
  multHigh: number,
  years: number,
  rate: number | null,
) {
  if (!base) return null;
  const fwdLow = Math.round(base * multLow);
  const fwdMid = Math.round(base * multMid);
  const fwdHigh = Math.round(base * multHigh);

  const pvLow = discountToPresent(fwdLow, years, rate);
  const pvMid = discountToPresent(fwdMid, years, rate);
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
