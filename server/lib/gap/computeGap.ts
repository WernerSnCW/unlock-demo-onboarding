import { CANONICAL_BUCKETS, Bucket } from "../../config/buckets";

export interface GapRequest {
  currentMix: Record<string, number>;  // bucket -> 0..1 (can omit buckets)
  targetMix:  Record<string, number>;  // bucket -> 0..1 (can omit buckets)
  // Optional guard-rail hints for warnings:
  riskProfile?: string;                // e.g., "Income" | "Conservative" | ...
  drawdownCap?: number;                // e.g., 0.20 (20% worst-case tolerance)
}

export interface GapRow {
  bucket: Bucket;
  currentPct: number;                  // 0..1
  targetPct: number;                   // 0..1
  deltaPct: number;                    // target - current
  flags: string[];                     // per-row flags
}

export interface GapResponse {
  rows: GapRow[];                      // sorted by |delta| desc
  totals: {
    absGapSum: number;                 // Σ |delta|
    cashBillsNow: number;              // CASH + BILLS_SHORT_GILTS
    cashBillsTarget: number;           // same for target
  };
  headlineFlags: string[];             // e.g., liquidity floor shortfall
}

function harmonise(mix: Partial<Record<string, number>>): Record<Bucket, number> {
  const out = {} as Record<Bucket, number>;
  for (const b of CANONICAL_BUCKETS) out[b] = Number(mix[b] ?? 0);
  return out;
}

function isCautious(rp?: string, dd?: number): boolean {
  const s = (rp || "").toLowerCase();
  return s.includes("conservative") || s.includes("income") || s.includes("defensive")
      || (typeof dd === "number" && dd <= 0.20);
}

export function computeGap(req: GapRequest): GapResponse {
  const current = harmonise(req.currentMix);
  const target  = harmonise(req.targetMix);

  const rows: GapRow[] = CANONICAL_BUCKETS.map((bucket) => {
    const currentPct = current[bucket];
    const targetPct  = target[bucket];
    const deltaPct   = +(targetPct - currentPct).toFixed(4);
    const flags: string[] = [];
    // Simple concentration flag (>35% of portfolio in any one bucket)
    if (currentPct > 0.35) flags.push(`Concentration: ${bucket} > 35%`);
    return { bucket, currentPct, targetPct, deltaPct, flags };
  });

  const cashBillsNow    = current.CASH + current.BILLS_SHORT_GILTS;
  const cashBillsTarget = target.CASH + target.BILLS_SHORT_GILTS;

  // Liquidity floor warning: 10% default, 20% if cautious/income/defensive or drawdown <= 20%
  const floor = isCautious(req.riskProfile, req.drawdownCap) ? 0.20 : 0.10;

  const headlineFlags: string[] = [];
  if (cashBillsNow < floor) {
    headlineFlags.push(
      `Liquidity floor shortfall: have ${(cashBillsNow*100).toFixed(1)}%, need ≥ ${(floor*100).toFixed(0)}%`
    );
  }

  // Totals and ordering
  const absGapSum = +rows.reduce((s, r) => s + Math.abs(r.deltaPct), 0).toFixed(4);
  rows.sort((a, b) => Math.abs(b.deltaPct) - Math.abs(a.deltaPct));

  return {
    rows,
    totals: { absGapSum, cashBillsNow, cashBillsTarget },
    headlineFlags,
  };
}