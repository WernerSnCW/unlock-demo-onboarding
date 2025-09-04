import { CANONICAL_BUCKETS, Bucket } from "../../config/buckets";
import { blendScenarioTemplates } from "../../config/scenarios";

export interface GapRequest {
  currentMix: Record<string, number>;   // bucket -> 0..1 (can omit)
  targetMix:  Record<string, number>;   // bucket -> 0..1 (can omit)
  // optional hints for warnings
  riskProfile?: string;                 // e.g., "Income" | "Conservative" | ...
  drawdownCap?: number;                 // e.g., 0.20 (20% worst-case)
  // optional light scenarios
  scenarioWeights?: Record<string, number>; // e.g., { S007:0.6, S009:0.4 }
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
    cashBillsTarget: number;
  };
  headlineFlags: string[];             // e.g., liquidity floor shortfall

  // light scenario insights (present iff scenarioWeights provided)
  beliefAlignmentNow?: number;          // 0..100
  beliefAlignmentTarget?: number;       // 0..100

  // Always safe to compute
  diversification: {
    hhiNow: number;                    // Σ w^2 (0..1)
    hhiTarget: number;
    deltaHhi: number;                  // hhiNow - hhiTarget
    nEffNow: number;                   // 1/hhiNow
    nEffTarget: number;                // 1/hhiTarget
  };

  turnoverPp: number;                  // 0.5 * Σ|Δ| * 100
  estCostPct?: number;                 // if friction rates available

  // Only if spend & PV known
  liquidityRunwayMonths?: { now: number; target: number; };
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
function l1(a: Record<Bucket,number>, b: Record<Bucket,number>) {
  return CANONICAL_BUCKETS.reduce((sum, k) => sum + Math.abs(a[k] - b[k]), 0);
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

  const absGapSum = +rows.reduce((s, r) => s + Math.abs(r.deltaPct), 0).toFixed(4);
  rows.sort((a, b) => Math.abs(b.deltaPct) - Math.abs(a.deltaPct));

  // Compute diversification metrics
  const hhiNow = +CANONICAL_BUCKETS.reduce((sum, b) => sum + current[b] * current[b], 0).toFixed(4);
  const hhiTarget = +CANONICAL_BUCKETS.reduce((sum, b) => sum + target[b] * target[b], 0).toFixed(4);
  const deltaHhi = +(hhiNow - hhiTarget).toFixed(4);
  const nEffNow = +(1 / hhiNow).toFixed(2);
  const nEffTarget = +(1 / hhiTarget).toFixed(2);

  // Compute turnover (half sum of absolute deltas, in percentage points)
  const turnoverPp = +(0.5 * absGapSum * 100).toFixed(1);

  const resp: GapResponse = {
    rows,
    totals: { absGapSum, cashBillsNow, cashBillsTarget },
    headlineFlags,
    diversification: {
      hhiNow,
      hhiTarget,
      deltaHhi,
      nEffNow,
      nEffTarget
    },
    turnoverPp,
  };

  // --- Light scenarios (optional) ---
  if (req.scenarioWeights && Object.values(req.scenarioWeights).some(w => w > 0)) {
    const S = harmonise(blendScenarioTemplates(req.scenarioWeights));
    const dNow = l1(current, S);
    const dTgt = l1(target,  S);
    // Alignment: 100 * (1 - L1/2). (Max L1 distance is 2.)
    resp.beliefAlignmentNow    = Math.round(100 * (1 - dNow/2));
    resp.beliefAlignmentTarget = Math.round(100 * (1 - dTgt/2));

    // Scenario sanity checks (add only if violated)
    const scenos = Object.keys(req.scenarioWeights).filter(k => (req.scenarioWeights![k]||0) > 0.001);
    if (scenos.includes("S007")) {
      const realNow = current.COMMODITIES + current.GOLD;
      const realTgt = target.COMMODITIES + target.GOLD;
      if (realTgt < realNow && realNow < 0.35) {
        resp.headlineFlags.push("S007 check: don't reduce (commodities + gold) unless already ≥ 35%.");
      }
    }
    if (scenos.includes("S009")) {
      if (target.GILTS_LONG > current.GILTS_LONG) {
        resp.headlineFlags.push("S009 check: don't increase long duration (GILTS_LONG).");
      }
    }
  }

  return resp;
}