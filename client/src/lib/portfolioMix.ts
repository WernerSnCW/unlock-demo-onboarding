import { BUCKETS, bucketFor, type Bucket } from '../data/episodeLibrary';
import type { AllocationBand } from '../state/onboardingV2Store';

export type Mix = Record<Bucket, number>;
export interface MixHolding { asset_class: string; region: string; value_gbp: number; }

function emptyMix(): Mix {
  return Object.fromEntries(BUCKETS.map((b) => [b, 0])) as Mix;
}

/** Mix from real holdings. Unmappable holdings (PE, structured, FX) are reported as unmodelledShare
 *  (§5 scope contract) and excluded; the returned mix is normalised over modelled buckets only. */
export function mixFromHoldings(holdings: MixHolding[]): { mix: Mix; unmodelledShare: number } {
  const valid = holdings.filter((h) => h.value_gbp > 0);
  const total = valid.reduce((s, h) => s + h.value_gbp, 0);
  if (total <= 0) return { mix: emptyMix(), unmodelledShare: 0 };

  const mix = emptyMix();
  let modelled = 0;
  for (const h of valid) {
    const bucket = bucketFor(h.asset_class, h.region);
    if (bucket === null) continue;
    mix[bucket] += h.value_gbp;
    modelled += h.value_gbp;
  }
  const unmodelledShare = (total - modelled) / total;
  if (modelled > 0) for (const b of BUCKETS) mix[b] = mix[b] / modelled;
  return { mix, unmodelledShare };
}

/** §7 / P1-3: step-7 produces allocation BANDS (low/high, asset_class axis + region axis), not a vector.
 *  Rule: take each band's midpoint; allocate each asset-class midpoint across region midpoints
 *  pro-rata (equity split by region weights); bond/cash/property stay region-agnostic; normalise to 1. */
export function mixFromBands(assetBands: AllocationBand[], regionBands: AllocationBand[]): Mix {
  const mid = (b: AllocationBand) => (b.illustrative_low_pct + b.illustrative_high_pct) / 2;
  const assetMid: Record<string, number> = {};
  for (const b of assetBands) assetMid[b.sleeve.trim().toLowerCase()] = mid(b);

  const regionMid: Record<string, number> = {};
  let regionTotal = 0;
  for (const b of regionBands) {
    const v = mid(b);
    regionMid[b.sleeve.trim().toLowerCase()] = v;
    regionTotal += v;
  }
  const regionWeight = (rg: string) => (regionTotal > 0 ? (regionMid[rg] ?? 0) / regionTotal : 0);

  const mix = emptyMix();
  const equity = assetMid['equity'] ?? 0;
  mix['uk-equity'] = equity * regionWeight('uk');
  mix['us-equity'] = equity * regionWeight('us');
  mix['europe-equity'] = equity * regionWeight('europe');
  mix['emerging-equity'] = equity * regionWeight('emerging');
  mix['global-equity'] = equity * regionWeight('global');
  mix['govt-bonds'] = assetMid['bond'] ?? 0;
  mix['property'] = assetMid['property'] ?? 0;
  mix['cash'] = assetMid['cash'] ?? 0;

  const total = BUCKETS.reduce((s, b) => s + mix[b], 0);
  if (total > 0) for (const b of BUCKETS) mix[b] = mix[b] / total;
  return mix;
}
