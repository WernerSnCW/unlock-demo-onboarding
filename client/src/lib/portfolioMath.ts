/** Shared portfolio math extracted from the deterministic stress lens (scenarioStress.ts).
 *  Pure, no domain coupling. Reused by the stress lens and the empirical scenario engine. */

export interface StressContributor {
  label: string;
  impactGbp: number;
  /** signed share of the gross same-direction move, 0..1 (0 when that move is 0).
   *  Share of contributors moving the SAME way as the net impact, not of the central impact —
   *  the two differ when protective (opposite-sign) holdings exist. */
  pctOfLoss: number;
}

/** Value-weight a list: each item's weight = value / total. Weights sum to 1 (or all 0 if total ≤ 0). */
export function valueWeights<T>(items: T[], getValue: (t: T) => number): { item: T; weight: number }[] {
  const total = items.reduce((sum, it) => sum + getValue(it), 0);
  return items.map((item) => ({ item, weight: total > 0 ? getValue(item) / total : 0 }));
}

/** Rank the holdings that moved in the NET direction by |impact|, top N, with signed share of the gross move.
 *  Protective (opposite-sign) holdings are excluded — they did not contribute to the loss. */
export function rankContributors(
  items: { label: string; impactGbp: number }[],
  topN = 3,
): StressContributor[] {
  const net = items.reduce((sum, c) => sum + c.impactGbp, 0);
  const sign = Math.sign(net);
  if (sign === 0) return [];
  const sameDirection = items.filter((c) => Math.sign(c.impactGbp) === sign);
  const grossMove = sameDirection.reduce((sum, c) => sum + c.impactGbp, 0);
  return sameDirection
    .sort((a, b) => Math.abs(b.impactGbp) - Math.abs(a.impactGbp))
    .slice(0, topN)
    .map((c) => ({
      label: c.label,
      impactGbp: c.impactGbp,
      pctOfLoss: grossMove !== 0 ? c.impactGbp / grossMove : 0,
    }));
}
