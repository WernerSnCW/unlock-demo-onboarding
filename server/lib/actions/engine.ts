import { CANONICAL_BUCKETS, Bucket } from "../../config/buckets";
import { FRICTION_RATE, ILLIQUID_BUCKETS } from "./frictions";
import { computeStagedRebalance } from "./stagedRebalance";

export interface ActionsRequest {
  currentMix: Record<string, number>;
  targetMix:  Record<string, number>;
  portfolioValueGBP: number;
  liquidityFloorPct?: number;
  donorOrder?: string[];
  minTradePct?: number;
  maxMoves?: number;
  stageIlliquids?: boolean;
}

export interface Action {
  type: "TRIM" | "ADD" | "TRANSFER";
  bucket: string;
  deltaPct: number;   // fraction of portfolio (pp/100)
  amountGBP: number;
  rationale: string;
  stage: 1 | 2;
  estCostPct?: number;
}

export interface ActionsResponse {
  summary: {
    totalAbsChangePp: number;
    estTurnoverPp: number;
    estCostPct: number;
    liquidityNowPct: number;
    liquidityTargetPct: number;
    liquidityFixPp?: number;
  };
  staged: { stage1: Action[]; stage2: Action[] };
  playbook: string[];
}

function harmonise(m: Partial<Record<string, number>>): Record<Bucket, number> {
  const out = {} as Record<Bucket, number>;
  for (const b of CANONICAL_BUCKETS) out[b] = Number(m[b] ?? 0);
  return out;
}

export function buildActions(req: ActionsRequest): ActionsResponse {
  const current = harmonise(req.currentMix);
  const target = harmonise(req.targetMix);
  const donorsDefault: Bucket[] = [
    "GROWTH_TECH", "GLOBAL_EQUITY", "ALTERNATIVES", "PROPERTY_UK_RESI",
    "COMMODITIES", "GOLD", "UK_EQUITY_VALUE", "IG_CREDIT", "GILTS_LONG",
    "CRYPTO_BTC", "CRYPTO_ETH", "COLLECTIBLES_ART", "COLLECTIBLES_WINE",
  ];
  return computeStagedRebalance({
    buckets: [...CANONICAL_BUCKETS],
    current,
    target,
    portfolioValueGBP: Math.max(0, req.portfolioValueGBP || 0),
    liquidityBuckets: ["CASH", "BILLS_SHORT_GILTS"],
    liquidityFloorPct: req.liquidityFloorPct ?? 0.10,
    donorOrder: (req.donorOrder as Bucket[] | undefined) ?? donorsDefault,
    minTradePct: req.minTradePct ?? 0.005,
    maxMoves: req.maxMoves ?? 8,
    illiquidBuckets: ILLIQUID_BUCKETS,
    frictionRate: FRICTION_RATE as Record<string, number>,
    stageIlliquids: req.stageIlliquids ?? true,
  });
}