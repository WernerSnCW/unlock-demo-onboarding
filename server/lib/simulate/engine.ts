import { CANONICAL_BUCKETS } from "../../config/buckets";
import { SCENARIO_SHOCKS } from "../../config/scenarioShocks";

type Bucket = typeof CANONICAL_BUCKETS[number];

export interface SimRequest {
  currentMix: Record<string, number>;
  targetMix:  Record<string, number>;
  scenarioWeights: Record<string, number>;     // e.g., { S007:0.6, S009:0.4 }
  horizonMonths?: number;                       // default 12
  startValueGBP?: number;                       // default 100
  shockMultiplier?: number;                     // default 1.0 (scale all shocks)
  band?: { low: number; high: number };         // optional confidence-style band multipliers, e.g., {low:0.5, high:1.5}
}

export interface SimSeriesPoint { 
  t: number; 
  current: number; 
  target: number; 
  currentLow?: number; 
  currentHigh?: number; 
  targetLow?: number; 
  targetHigh?: number; 
}

export interface SimResponse {
  blendedShocks: Record<Bucket, number>;           // per-bucket expected return over horizon
  contributionsCurrent: Record<Bucket, number>;    // bucket contribution (pp) to portfolio return
  contributionsTarget:  Record<Bucket, number>;
  portfolioReturnCurrent: number;                  // expected return over horizon (e.g., 0.042 = +4.2%)
  portfolioReturnTarget:  number;
  series: SimSeriesPoint[];                        // monthly path for chart (deterministic compounding)
}

function harmonise(mix: Partial<Record<string,number>>): Record<Bucket, number> {
  const out = {} as Record<Bucket, number>;
  for (const b of CANONICAL_BUCKETS) out[b] = Number(mix[b] ?? 0);
  return out;
}

function normalise(weights: Record<string, number>) {
  const tot = Object.values(weights||{}).reduce((a,b)=>a+b,0) || 0;
  const out: Record<string, number> = {};
  for (const [k,v] of Object.entries(weights||{})) out[k] = tot ? v/tot : 0;
  return out;
}

export function simulate(req: SimRequest): SimResponse {
  console.log('=== SIMULATION DEBUG ===');
  console.log('Raw scenario weights:', req.scenarioWeights);
  
  const horizon = Math.max(1, Math.round(req.horizonMonths ?? 12));
  const shockMult = req.shockMultiplier ?? 1.0;
  const scenW = normalise(req.scenarioWeights);
  
  console.log('Normalized scenario weights:', scenW);
  console.log('Available scenarios:', Object.keys(SCENARIO_SHOCKS));

  // 1) Blend shocks across scenarios
  const blended: Record<Bucket, number> = harmonise({});
  for (const [sid, w] of Object.entries(scenW)) {
    const sv = SCENARIO_SHOCKS[sid];
    console.log(`Processing scenario ${sid}: weight=${w}, found=${!!sv}`);
    if (sv) console.log(`Scenario ${sid} shocks:`, sv);
    if (!sv || w <= 0) continue;
    for (const [bk, r] of Object.entries(sv)) {
      const contribution = (r as number) * w * shockMult;
      blended[bk as Bucket] += contribution;
      if (contribution !== 0) {
        console.log(`  ${bk}: ${r} * ${w} = ${contribution}`);
      }
    }
  }
  
  console.log('Final blended shocks:', blended);
  console.log('=== END SIMULATION DEBUG ===');

  // 2) Portfolio returns (dot product) and contributions
  const cur = harmonise(req.currentMix);
  const tgt = harmonise(req.targetMix);

  const contrC: Record<Bucket, number> = {} as any;
  const contrT: Record<Bucket, number> = {} as any;
  let rC = 0, rT = 0;
  for (const b of CANONICAL_BUCKETS) {
    contrC[b] = cur[b] * blended[b];
    contrT[b] = tgt[b] * blended[b];
    rC += contrC[b]; rT += contrT[b];
  }

  // 3) Build a smooth path (deterministic compounding)
  // Assume each bucket's horizon return arrives evenly each month: r_month_b = (1 + R_b)^(1/h) - 1
  const rMonth: Record<Bucket, number> = {} as any;
  for (const b of CANONICAL_BUCKETS) rMonth[b] = Math.pow(1 + blended[b], 1 / horizon) - 1;

  const start = req.startValueGBP ?? 100;
  let valC = start, valT = start;
  let valCL = start, valCH = start, valTL = start, valTH = start;

  const series: SimSeriesPoint[] = [{ t: 0, current: valC, target: valT }];
  for (let m = 1; m <= horizon; m++) {
    // deterministic compounding using fixed mixes
    let monthRC = 0, monthRT = 0;
    for (const b of CANONICAL_BUCKETS) { monthRC += cur[b] * rMonth[b]; monthRT += tgt[b] * rMonth[b]; }
    valC *= (1 + monthRC);
    valT *= (1 + monthRT);

    // Optional "band" paths (scale shocks)
    if (req.band) {
      const low = req.band.low ?? 1.0, high = req.band.high ?? 1.0;
      let monthRCL = 0, monthRCH = 0, monthRTL = 0, monthRTH = 0;
      for (const b of CANONICAL_BUCKETS) {
        const rm = rMonth[b];
        monthRCL += cur[b] * (low * rm);
        monthRCH += cur[b] * (high* rm);
        monthRTL += tgt[b] * (low * rm);
        monthRTH += tgt[b] * (high* rm);
      }
      valCL *= (1 + monthRCL); valCH *= (1 + monthRCH);
      valTL *= (1 + monthRTL); valTH *= (1 + monthRTH);
      series.push({ t: m, current: valC, target: valT, currentLow: valCL, currentHigh: valCH, targetLow: valTL, targetHigh: valTH });
    } else {
      series.push({ t: m, current: valC, target: valT });
    }
  }

  return {
    blendedShocks: blended,
    contributionsCurrent: contrC,
    contributionsTarget: contrT,
    portfolioReturnCurrent: rC,
    portfolioReturnTarget: rT,
    series
  };
}