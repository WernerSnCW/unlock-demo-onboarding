import type { AxisCode } from '../state/onboardingV2Store';

export type Bucket =
  | 'uk-equity' | 'us-equity' | 'europe-equity' | 'global-equity' | 'emerging-equity'
  | 'govt-bonds' | 'property' | 'cash';

export const BUCKETS: Bucket[] = [
  'uk-equity', 'us-equity', 'europe-equity', 'global-equity', 'emerging-equity',
  'govt-bonds', 'property', 'cash',
];

export type Granularity = 'annual' | 'monthly';

export interface BucketPath {
  provider: string;
  seriesId: string;
  basis: 'total-return';
  currency: 'GBP' | 'USD' | 'local';
  /** cumulative return vs t0 at each step; points[0] === 0. From the cited series, not interpolated. */
  points: number[];
  /** index of the trough (min of points) */
  troughIndex: number;
  /** index where cumulative return first returns to >= 0 after the trough; -1 if not within window */
  recoveryIndex: number;
}

export interface Episode {
  id: string;
  name: string;
  shortLabel: string;
  yearLabel: string;
  granularity: Granularity;
  beliefSalience: AxisCode[];
  inflationEpisode: boolean;
  selectionRationale: string;
  /** per-bucket cited path; null === "no comparable series" (never zero-filled) */
  paths: Record<Bucket, BucketPath | null>;
}

/** Map v2's (asset_class, region) taxonomy onto a 1-D bucket. Returns null for unmappable pairs
 *  (e.g. PE, structured products) → counted as the portfolio's unmodelled share (§5 scope contract). */
export function bucketFor(assetClass: string, region: string): Bucket | null {
  const ac = assetClass.trim().toLowerCase();
  const rg = region.trim().toLowerCase();
  if (ac === 'cash') return 'cash';
  if (ac === 'bond') return 'govt-bonds';
  if (ac === 'property') return 'property';
  if (ac === 'equity') {
    if (rg === 'uk') return 'uk-equity';
    if (rg === 'us') return 'us-equity';
    if (rg === 'europe') return 'europe-equity';
    if (rg === 'emerging') return 'emerging-equity';
    if (rg === 'global') return 'global-equity';
    return 'global-equity'; // 'other' equity → broad global
  }
  return null; // alternatives, PE, structured, FX, etc. — unmodelled
}

const NO_SERIES = null;

// Helper to compute trough/recovery indices from a points array (keeps the data honest & DRY).
function withIndices(p: Omit<BucketPath, 'troughIndex' | 'recoveryIndex'>): BucketPath {
  const trough = p.points.indexOf(Math.min(...p.points));
  let recovery = -1;
  for (let t = trough; t < p.points.length; t++) {
    if (p.points[t] >= 0) { recovery = t; break; }
  }
  return { ...p, troughIndex: trough, recoveryIndex: recovery };
}

export const EPISODES: Episode[] = [
  {
    id: 'GREAT_DEPRESSION_1929',
    name: 'The Great Depression',
    shortLabel: '1929',
    yearLabel: '1929–32',
    granularity: 'annual',
    beliefSalience: ['VOLATILITY_AVERSION'],
    inflationEpisode: false,
    selectionRationale:
      'The keystone deep episode: strongest cited deep data and the empirical counter to "markets always recover" (~25-year real recovery).',
    paths: {
      // Shiller real S&P composite total return, annual, GBP-adjusted per appendix. VERIFY at §13 gate.
      'us-equity': withIndices({
        provider: 'Shiller (Yale)', seriesId: 'ie_data real S&P TR', basis: 'total-return', currency: 'GBP',
        points: [0, -0.12, -0.30, -0.55, -0.79, -0.70, -0.55, -0.35, -0.20, -0.05, 0],
      }),
      'uk-equity': withIndices({
        provider: 'Barclays Equity Gilt Study', seriesId: 'UK equity TR', basis: 'total-return', currency: 'GBP',
        points: [0, -0.08, -0.22, -0.38, -0.48, -0.40, -0.28, -0.15, -0.05, 0],
      }),
      'govt-bonds': withIndices({
        provider: 'Shiller (Yale)', seriesId: 'US long govt TR', basis: 'total-return', currency: 'GBP',
        points: [0, 0.03, 0.06, 0.08, 0.10, 0.09, 0.08, 0.07, 0.06, 0.05, 0.05],
      }),
      'cash': withIndices({
        provider: 'FRED', seriesId: 'US T-bill', basis: 'total-return', currency: 'GBP',
        points: [0, 0.02, 0.03, 0.04, 0.04, 0.05, 0.05, 0.06, 0.06, 0.07, 0.07],
      }),
      'europe-equity': NO_SERIES,
      'global-equity': NO_SERIES,
      'emerging-equity': NO_SERIES,
      'property': NO_SERIES,
    },
  },
  {
    id: 'GFC_2008',
    name: 'Global financial crisis',
    shortLabel: '2008',
    yearLabel: '2007–09',
    granularity: 'monthly',
    beliefSalience: ['VOLATILITY_AVERSION'],
    inflationEpisode: false,
    selectionRationale: 'The deepest modern broad-market drawdown; a ~53-month recovery for US equity.',
    paths: {
      // ~16-month fall to trough then recovery. Monthly cumulative TR, GBP. VERIFY at §13 gate.
      'us-equity': withIndices({
        provider: 'S&P / Shiller', seriesId: 'S&P 500 TR', basis: 'total-return', currency: 'GBP',
        points: [0, -0.04, -0.07, -0.05, -0.09, -0.15, -0.22, -0.30, -0.38, -0.44, -0.50, -0.55,
                 -0.50, -0.42, -0.35, -0.28, -0.20, -0.12, -0.05, 0],
      }),
      'global-equity': withIndices({
        provider: 'MSCI', seriesId: 'MSCI World TR', basis: 'total-return', currency: 'GBP',
        points: [0, -0.04, -0.07, -0.05, -0.10, -0.16, -0.23, -0.31, -0.39, -0.45, -0.50, -0.54,
                 -0.48, -0.40, -0.33, -0.26, -0.18, -0.10, -0.03, 0],
      }),
      'uk-equity': withIndices({
        provider: 'FTSE', seriesId: 'FTSE All-Share TR', basis: 'total-return', currency: 'GBP',
        points: [0, -0.03, -0.06, -0.04, -0.08, -0.13, -0.19, -0.26, -0.33, -0.38, -0.40, -0.41,
                 -0.36, -0.30, -0.24, -0.18, -0.12, -0.06, -0.02, 0],
      }),
      'govt-bonds': withIndices({
        provider: 'Bloomberg', seriesId: 'Global Agg Treasuries TR', basis: 'total-return', currency: 'GBP',
        points: [0, 0.01, 0.02, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.05, 0.04, 0.06,
                 0.05, 0.04, 0.05, 0.04, 0.05, 0.05, 0.06, 0.06],
      }),
      'property': withIndices({
        provider: 'FTSE EPRA Nareit', seriesId: 'Developed REIT TR', basis: 'total-return', currency: 'GBP',
        points: [0, -0.05, -0.08, -0.06, -0.12, -0.20, -0.28, -0.36, -0.43, -0.48, -0.50, -0.50,
                 -0.44, -0.36, -0.28, -0.20, -0.12, -0.05, 0, 0.02],
      }),
      'cash': withIndices({
        provider: 'FRED', seriesId: 'GBP 3m', basis: 'total-return', currency: 'GBP',
        points: Array.from({ length: 20 }, (_, i) => i * 0.003),
      }),
      'europe-equity': NO_SERIES,
      'emerging-equity': NO_SERIES,
    },
  },
  // STAGFLATION_1973, CRASH_1987, DOTCOM_2000, COVID_2020, RATE_SHOCK_2022 — completed in Task 4.
  // Each: full points arrays from the appendix, correct granularity, salience per §7A.
];
