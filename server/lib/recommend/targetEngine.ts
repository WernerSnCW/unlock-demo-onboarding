import { CANONICAL_BUCKETS, type Bucket } from "../../config/buckets";
import { blendScenarioTemplates } from "../../config/scenarios";

// Temporary inline persona defaults until import issue is resolved
const PERSONA_DEFAULTS: Record<string, Record<Bucket, number>> = {
  "P001": {
    CASH: 0.0800,
    BILLS_SHORT_GILTS: 0.1200,
    GILTS_LONG: 0.0600,
    IG_CREDIT: 0.1500,
    GLOBAL_EQUITY: 0.2800,
    UK_EQUITY_VALUE: 0.1200,
    GROWTH_TECH: 0.0400,
    PROPERTY_UK_RESI: 0.0800,
    COMMODITIES: 0.0200,
    GOLD: 0.0300,
    ALTERNATIVES: 0.0100,
    CRYPTO_BTC: 0.0000,
    CRYPTO_ETH: 0.0000,
    COLLECTIBLES_ART: 0.0100,
    COLLECTIBLES_WINE: 0.0000,
  },
  "P003": {
    CASH: 0.0300,
    BILLS_SHORT_GILTS: 0.0400,
    GILTS_LONG: 0.0200,
    IG_CREDIT: 0.0700,
    GLOBAL_EQUITY: 0.2800,
    UK_EQUITY_VALUE: 0.0500,
    GROWTH_TECH: 0.2000,
    PROPERTY_UK_RESI: 0.0500,
    COMMODITIES: 0.0300,
    GOLD: 0.0200,
    ALTERNATIVES: 0.0300,
    CRYPTO_BTC: 0.1000,
    CRYPTO_ETH: 0.0800,
    COLLECTIBLES_ART: 0.0000,
    COLLECTIBLES_WINE: 0.0000,
  },
  "P015": {
    CASH: 0.0600,
    BILLS_SHORT_GILTS: 0.0800,
    GILTS_LONG: 0.0400,
    IG_CREDIT: 0.1000,
    GLOBAL_EQUITY: 0.3200,
    UK_EQUITY_VALUE: 0.1400,
    GROWTH_TECH: 0.1000,
    PROPERTY_UK_RESI: 0.0700,
    COMMODITIES: 0.0400,
    GOLD: 0.0300,
    ALTERNATIVES: 0.0500,
    CRYPTO_BTC: 0.0000,
    CRYPTO_ETH: 0.0000,
    COLLECTIBLES_ART: 0.0200,
    COLLECTIBLES_WINE: 0.0000,
  },
  "P016": {
    CASH: 0.0500,
    BILLS_SHORT_GILTS: 0.0700,
    GILTS_LONG: 0.0300,
    IG_CREDIT: 0.0900,
    GLOBAL_EQUITY: 0.2800,
    UK_EQUITY_VALUE: 0.0800,
    GROWTH_TECH: 0.0900,
    PROPERTY_UK_RESI: 0.1200,
    COMMODITIES: 0.0300,
    GOLD: 0.0400,
    ALTERNATIVES: 0.0400,
    CRYPTO_BTC: 0.0000,
    CRYPTO_ETH: 0.0000,
    COLLECTIBLES_ART: 0.0700,
    COLLECTIBLES_WINE: 0.0100,
  }
};

export interface TargetRequest {
  personaId: string;
  scenarioWeights: Record<string, number>;
  tiltStrength?: number;
  riskProfile?: string;
  drawdownCap?: number;
  overrides?: {
    liquidityFloorPct?: number;
    singleBucketCapPct?: number;
    minWeight?: Record<string, number>;
    maxWeight?: Record<string, number>;
    locks?: Record<string, number>;
  };
}

export interface TargetResponse {
  personaId: string;
  scenarioWeights: Record<string, number>;
  tiltStrength: number;
  baseMix: Record<Bucket, number>;
  scenarioBlend: Record<Bucket, number>;
  preRulesMix: Record<Bucket, number>;
  targetMix: Record<Bucket, number>;
  flags: string[];
  adjustments: string[];
}

function harmonise(mix: Partial<Record<string, number>>): Record<Bucket, number> {
  const out = {} as Record<Bucket, number>;
  for (const b of CANONICAL_BUCKETS) out[b] = Number(mix[b] ?? 0);
  return out;
}

function sum(m: Record<Bucket, number>) { 
  return CANONICAL_BUCKETS.reduce((s, b) => s + m[b], 0); 
}

function normalise(m: Record<Bucket, number>) {
  const s = sum(m) || 1; 
  const out = {} as Record<Bucket, number>;
  for (const b of CANONICAL_BUCKETS) out[b] = m[b] / s;
  return out;
}

function clip(x: number, lo: number, hi: number) { 
  return Math.min(hi, Math.max(lo, x)); 
}

function isCautious(rp?: string, dd?: number) {
  const s = (rp || "").toLowerCase();
  return s.includes("conservative") || s.includes("income") || s.includes("defensive") || (typeof dd === "number" && dd <= 0.20);
}

export function buildTarget(req: TargetRequest): TargetResponse {
  const flags: string[] = [];
  const adjustments: string[] = [];

  // --- 1) base & scenarios ---
  const base = harmonise(PERSONA_DEFAULTS[req.personaId] || {});
  const scenNorm = (() => {
    const total = Object.values(req.scenarioWeights || {}).reduce((a, b) => a + b, 0) || 0;
    const norm: Record<string, number> = {};
    for (const [k, v] of Object.entries(req.scenarioWeights || {})) norm[k] = total ? v / total : 0;
    return norm;
  })();
  const scenBlend = harmonise(blendScenarioTemplates(scenNorm));

  // --- 2) tilt ---
  const k = clip(req.tiltStrength ?? 0.35, 0, 1); // default moderate tilt
  let mix: Record<Bucket, number> = {} as any;
  for (const b of CANONICAL_BUCKETS) mix[b] = (1 - k) * base[b] + k * scenBlend[b];
  mix = normalise(mix);
  const preRules = { ...mix };

  // helpers
  const applyLocksMinsMax = () => {
    const { locks = {}, minWeight = {}, maxWeight = {} } = req.overrides || {};
    // Locks (exact)
    for (const [bk, w] of Object.entries(locks)) {
      if (bk in mix) { 
        mix[bk as Bucket] = Number(w); 
        adjustments.push(`Lock ${bk}=${(Number(w) * 100).toFixed(1)}%`); 
      }
    }
    // Normalise remaining space
    let free = 1 - sum(harmonise(locks));
    if (free < 0) free = 0;
    // Clip to min/max
    const mins: Record<Bucket, number> = harmonise(minWeight);
    const maxs: Record<Bucket, number> = harmonise(maxWeight);
    // First, bring any below min up; any above max down, track residual
    let pos = 0, neg = 0;
    const residual: Record<Bucket, number> = {} as any;
    for (const b of CANONICAL_BUCKETS) {
      const lo = mins[b], hi = maxs[b] || 1;
      const clipped = clip(mix[b], lo, hi);
      residual[b] = clipped - mix[b];
      if (residual[b] > 0) pos += residual[b]; else neg += residual[b];
      mix[b] = clipped;
    }
    // Re-spread surplus/deficit pro-rata to buckets not locked
    const unlocked = CANONICAL_BUCKETS.filter(b => !(b in (req.overrides?.locks || {})));
    const unlockedSum = unlocked.reduce((s, b) => s + mix[b], 0) || 1;
    const need = 1 - sum(mix);
    for (const b of unlocked) mix[b] += (mix[b] / unlockedSum) * need;
    mix = normalise(mix);
  };

  const capBucket = (bucket: Bucket, cap: number, route: Bucket[]) => {
    if (mix[bucket] <= cap) return;
    const excess = mix[bucket] - cap;
    mix[bucket] = cap;
    adjustments.push(`Cap ${bucket} at ${(cap * 100).toFixed(1)}% (excess ${(excess * 100).toFixed(1)}%)`);
    // push excess into route buckets in order, proportional to available headroom (1 - current weight)
    let remaining = excess;
    for (const r of route) {
      if (remaining <= 1e-9) break;
      const headroom = Math.max(0, 1 - mix[r]);
      const take = Math.min(headroom, remaining);
      mix[r] += take;
      remaining -= take;
    }
    if (remaining > 1e-9) {
      // final normalise fallback
      const others = CANONICAL_BUCKETS.filter(b => b !== bucket);
      const s = others.reduce((x, b) => x + mix[b], 0) || 1;
      for (const b of others) mix[b] += (mix[b] / s) * remaining;
    }
    mix = normalise(mix);
  };

  const raiseLiquidity = (floor: number) => {
    const liqNow = mix.CASH + mix.BILLS_SHORT_GILTS;
    if (liqNow >= floor - 1e-9) return;
    let need = floor - liqNow;
    // add to receivers
    const receivers: Bucket[] = ["BILLS_SHORT_GILTS", "CASH"];
    for (const r of receivers) {
      const add = Math.min(need, 1 - mix[r]);
      mix[r] += add; need -= add;
      if (add > 0) adjustments.push(`Add ${(add * 100).toFixed(1)}% to ${r} (raise liquidity)`);
      if (need <= 1e-9) break;
    }
    if (need > 1e-9) flags.push("Liquidity floor unreachable due to caps/locks.");
    // remove from donors (largest first) by the fixed order
    const donors: Bucket[] = [
      "GROWTH_TECH", "GLOBAL_EQUITY", "ALTERNATIVES", "PROPERTY_UK_RESI",
      "COMMODITIES", "GOLD", "UK_EQUITY_VALUE", "IG_CREDIT", "GILTS_LONG", 
      "CRYPTO_BTC", "CRYPTO_ETH", "COLLECTIBLES_ART", "COLLECTIBLES_WINE"
    ];
    for (const d of donors) {
      if (need <= 1e-9) break;
      const give = Math.min(mix[d], need);
      if (give > 0) { 
        mix[d] -= give; 
        need -= give; 
        adjustments.push(`Take ${(give * 100).toFixed(1)}% from ${d} (raise liquidity)`); 
      }
    }
    mix = normalise(mix);
  };

  // --- 3) rules ---
  // 3.1 Locks/min/max (optional)
  applyLocksMinsMax();

  // 3.2 Single-bucket cap
  const capPct = req.overrides?.singleBucketCapPct ?? 0.35;
  for (const b of CANONICAL_BUCKETS) {
    capBucket(b, capPct, ["BILLS_SHORT_GILTS", "IG_CREDIT", "CASH", "UK_EQUITY_VALUE", "GLOBAL_EQUITY"]);
  }

  // 3.3 Liquidity floor
  const floor = req.overrides?.liquidityFloorPct ?? (isCautious(req.riskProfile, req.drawdownCap) ? 0.20 : 0.10);
  const liqBefore = mix.CASH + mix.BILLS_SHORT_GILTS;
  if (liqBefore < floor) {
    flags.push(`Liquidity floor: have ${(liqBefore * 100).toFixed(1)}%, need ≥ ${(floor * 100).toFixed(0)}%`);
    raiseLiquidity(floor);
  }

  // 3.4 Persona/Scenario rules (light)
  const scenos = Object.entries(req.scenarioWeights || {}).filter(([, w]) => w > 0.001).map(([k]) => k);
  if (req.personaId === "P016" && scenos.some(s => ["S001", "S007", "S009"].includes(s))) {
    if (mix.PROPERTY_UK_RESI > 0.45) {
      capBucket("PROPERTY_UK_RESI", 0.45, ["BILLS_SHORT_GILTS", "IG_CREDIT"]);
      flags.push("P016 property cap ≤45% under S001/S007/S009");
    }
  }
  if (req.personaId === "P003" && scenos.includes("S004")) {
    const crypto = (mix.CRYPTO_BTC || 0) + (mix.CRYPTO_ETH || 0);
    if (crypto > 0.15) {
      const excess = crypto - 0.15;
      // trim proportionally from BTC/ETH
      const tot = (mix.CRYPTO_BTC || 0) + (mix.CRYPTO_ETH || 0) || 1;
      const trimBTC = Math.min(mix.CRYPTO_BTC, excess * (mix.CRYPTO_BTC / tot));
      const trimETH = Math.min(mix.CRYPTO_ETH, excess * (mix.CRYPTO_ETH / tot));
      mix.CRYPTO_BTC -= trimBTC; mix.CRYPTO_ETH -= trimETH;
      mix.IG_CREDIT += excess * 0.60; mix.CASH += excess * 0.40;
      adjustments.push(`Trim crypto ${(excess * 100).toFixed(1)}% (cap 15%); route 60%→IG_CREDIT, 40%→CASH`);
      flags.push("P003 crypto cap ≤15% under S004");
      mix = normalise(mix);
    }
  }

  // 3.5 Scenario sanity
  if (scenos.includes("S007")) {
    const baseReal = base.COMMODITIES + base.GOLD;
    const targetReal = mix.COMMODITIES + mix.GOLD;
    if (targetReal < baseReal && baseReal < 0.35) {
      const need = baseReal - targetReal;
      // add equally to COMMODITIES and GOLD, take from equities first
      const addEach = need / 2;
      mix.COMMODITIES += addEach; mix.GOLD += addEach;
      const takeOrder: Bucket[] = ["GLOBAL_EQUITY", "GROWTH_TECH", "UK_EQUITY_VALUE"];
      let remaining = need;
      for (const d of takeOrder) {
        if (remaining <= 1e-9) break;
        const take = Math.min(mix[d], remaining);
        if (take > 0) { mix[d] -= take; remaining -= take; }
      }
      adjustments.push(`S007 sanity: restore real assets ${(need * 100).toFixed(1)}%`);
      flags.push("S007 (stagflation): maintain real-asset hedge");
      mix = normalise(mix);
    }
  }
  if (scenos.includes("S009")) {
    if (mix.GILTS_LONG > base.GILTS_LONG) {
      const excess = mix.GILTS_LONG - base.GILTS_LONG;
      mix.GILTS_LONG = base.GILTS_LONG;
      mix.BILLS_SHORT_GILTS += excess;
      adjustments.push(`S009 sanity: move ${(excess * 100).toFixed(1)}% from GILTS_LONG → BILLS_SHORT_GILTS`);
      flags.push("S009 (gilt sell-off): avoid duration risk");
      mix = normalise(mix);
    }
  }

  // Final normalise
  mix = normalise(mix);

  return {
    personaId: req.personaId,
    scenarioWeights: scenNorm,
    tiltStrength: k,
    baseMix: base,
    scenarioBlend: scenBlend,
    preRulesMix: preRules,
    targetMix: mix,
    flags,
    adjustments
  };
}