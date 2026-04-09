import {
  CANONICAL_BUCKETS,
  SCENARIO_SHOCKS,
  SCENARIO_VOLS,
  SCENARIO_LABELS as CONFIG_SCENARIO_LABELS,
  CORRELATION,
  BUCKET_ORDER,
  FACTORS,
  type Bucket,
} from './simulationConfig';

const SCENARIO_LABELS: Record<string, string> = CONFIG_SCENARIO_LABELS;

export type RebalanceMode = "hold" | "rebalanceMonthly";

export interface SimV2Request {
  currentMix: Record<string, number>;
  targetMix:  Record<string, number>;
  scenarioWeights: Record<string, number>;
  horizonMonths?: number;
  startValueGBP?: number;
  shockMultiplier?: number;
  mode?: RebalanceMode;
  mc?: { paths: number; seed?: number };
  costs?: { estTurnoverPp: number; estCostPct: number };
  multiHorizons?: number[];
  fade?: {
    tauMonths?: number;
    basePrior12?: Partial<Record<Bucket, number>>;
  };
}

export interface FanPoint {
  t: number;
  current: { p05: number; p50: number; p95: number };
  target: { p05: number; p50: number; p95: number };
}

export interface MultiHorizonSummary {
  horizonMonths: number;
  expectedReturnCurrent: number;
  expectedReturnTarget: number;
  diffPp: number;
  endValue: { current: number; target: number; diffGBP: number };
  breakevenMonthMed: number | null;
  costs?: { estTurnoverPp: number; estCostPct: number; diffAfterCostsPp: number };
}

export interface SimV2Response {
  horizonMonths: number;
  expectedReturnCurrent: number;
  expectedReturnTarget: number;
  diffPp: number;
  contributionsCurrent: Record<Bucket, number>;
  contributionsTarget: Record<Bucket, number>;
  fan: FanPoint[];
  probTargetBeatsCurrent?: number;
  maxDrawdownMed?: { current: number; target: number };
  mode: RebalanceMode;
  endValue: { current: number; target: number; diffGBP: number };
  endValueBand?: { current: { p05: number; p50: number; p95: number }; target: { p05: number; p50: number; p95: number } };
  breakevenMonthMed?: number | null;
  downside?: {
    probLoss: { current: number; target: number };
    es5: { current: number; target: number };
  };
  costs?: { estTurnoverPp: number; estCostPct: number; diffAfterCostsPp: number };
  diffAttribution: Array<{ factor: string; pp: number }>;
  stresses?: Array<{ id: string; label: string; retCurrent: number; retTarget: number; diffPp: number }>;
  multi?: MultiHorizonSummary[];
}

function harmonise(m: Partial<Record<string, number>>): Record<Bucket, number> {
  const out = {} as Record<Bucket, number>;
  for (const b of CANONICAL_BUCKETS) out[b] = Number(m[b] ?? 0);
  return out;
}

function normaliseW(w: Record<string, number>) {
  const s = Object.values(w || {}).reduce((a, b) => a + b, 0) || 0;
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(w || {})) out[k] = s ? v / s : 0;
  return out;
}

function blend<T extends Record<string, number>>(parts: Record<string, T>, weights: Record<string, number>): Record<string, number> {
  const w = normaliseW(weights);
  const acc: Record<string, number> = {};
  for (const [sid, ws] of Object.entries(w)) {
    const vec = parts[sid]; if (!vec || ws <= 0) continue;
    for (const [k, v] of Object.entries(vec)) acc[k] = (acc[k] || 0) + v * ws;
  }
  return acc;
}

function pow1p(x: number, p: number) { return Math.pow(1 + x, p) - 1; }

function dot(a: Record<Bucket, number>, b: Record<Bucket, number>) {
  return CANONICAL_BUCKETS.reduce((s, k) => s + (a[k] || 0) * (b[k] || 0), 0);
}

function cholesky(A: number[][]) {
  const n = A.length, L = Array.from({length: n}, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = 0; for (let k = 0; k < j; k++) sum += L[i][k] * L[j][k];
      L[i][j] = (i === j) ? Math.sqrt(Math.max(A[i][i] - sum, 0)) : (A[i][j] - sum) / L[j][j];
    }
  }
  return L;
}

function rng(seed = 1234567) {
  let s = seed >>> 0;
  return () => (s = (1664525 * s + 1013904223) >>> 0, (s >>> 8) / 0x01000000);
}

function randn(seedGen: () => number) {
  let spare: number | undefined;
  return () => {
    if (spare !== undefined) { const v = spare; spare = undefined; return v; }
    let u = 0, v = 0; while (u <= 1e-12) u = seedGen(); while (v <= 1e-12) v = seedGen();
    const mag = Math.sqrt(-2 * Math.log(u)); const z0 = mag * Math.cos(2 * Math.PI * v); const z1 = mag * Math.sin(2 * Math.PI * v);
    spare = z1; return z0;
  };
}

function computeRHForPureScenario(scenarioId: string, H: number, k: number): Record<Bucket, number> {
  const mean12 = harmonise(SCENARIO_SHOCKS[scenarioId] || {});
  const RH: Record<Bucket, number> = {} as Record<Bucket, number>;
  for (const b of CANONICAL_BUCKETS) {
    RH[b] = pow1p((mean12[b] || 0) * k, H / 12);
  }
  return RH;
}

function alphaFade(H: number, tau: number) {
  return 1 - Math.exp(-(H) / Math.max(1, tau));
}

function buildBasePrior12(req: SimV2Request): Record<Bucket, number> {
  const base = {} as Record<Bucket, number>;
  for (const b of CANONICAL_BUCKETS) base[b] = Number(req.fade?.basePrior12?.[b] ?? 0);
  return base;
}

function fadedMean12ForH(mean12Scenario: Record<Bucket, number>, base12: Record<Bucket, number>, H: number, tau: number): Record<Bucket, number> {
  const a = alphaFade(H, tau);
  const out = {} as Record<Bucket, number>;
  for (const b of CANONICAL_BUCKETS) out[b] = (1 - a) * (mean12Scenario[b] || 0) + a * (base12[b] || 0);
  return out;
}

function breakevenOnMedian(H: number, start: number, curW: Record<Bucket, number>, tgtW: Record<Bucket, number>, meanMonth: Record<Bucket, number>): number | null {
  let vC = start, vT = start;
  if (H <= 0) return 0;
  for (let m = 1; m <= H; m++) {
    let rc = 0, rt = 0;
    for (const b of CANONICAL_BUCKETS) { rc += (curW[b] || 0) * (meanMonth[b] || 0); rt += (tgtW[b] || 0) * (meanMonth[b] || 0); }
    vC *= (1 + rc); vT *= (1 + rt);
    if (vT >= vC) return m;
  }
  return null;
}

export function simulate(req: SimV2Request): SimV2Response {
  const H = Math.max(1, Math.round(req.horizonMonths ?? 12));
  const startV = req.startValueGBP ?? 100;
  const k = req.shockMultiplier ?? 1.0;
  const mode: RebalanceMode = req.mode ?? "hold";

  const cur = harmonise(req.currentMix);
  const tgt = harmonise(req.targetMix);

  const mean12Scenario = harmonise(blend(SCENARIO_SHOCKS as unknown as Record<string, Record<string, number>>, req.scenarioWeights));
  const vol12 = harmonise(blend(SCENARIO_VOLS as unknown as Record<string, Record<string, number>>, req.scenarioWeights)) as Record<Bucket, number>;
  for (const b of CANONICAL_BUCKETS) { mean12Scenario[b] *= k; vol12[b] *= (k || 1); }

  const tau = req.fade?.tauMonths ?? 24;
  const basePrior12 = buildBasePrior12(req);

  const mean12 = fadedMean12ForH(mean12Scenario, basePrior12, H, tau);

  const meanMonth: Record<Bucket, number> = {} as Record<Bucket, number>;
  const volMonth: Record<Bucket, number> = {} as Record<Bucket, number>;
  for (const b of CANONICAL_BUCKETS) {
    meanMonth[b] = Math.pow(1 + (mean12[b] || 0), 1 / 12) - 1;
    volMonth[b] = (vol12[b] || 0) / Math.sqrt(12);
  }

  const RH: Record<Bucket, number> = {} as Record<Bucket, number>;
  for (const b of CANONICAL_BUCKETS) RH[b] = pow1p(mean12[b] || 0, H / 12);
  const contributionsCurrent = {} as Record<Bucket, number>;
  const contributionsTarget = {} as Record<Bucket, number>;
  for (const b of CANONICAL_BUCKETS) {
    contributionsCurrent[b] = (cur[b] || 0) * RH[b];
    contributionsTarget[b] = (tgt[b] || 0) * RH[b];
  }
  const expectedReturnCurrent = dot(cur, RH);
  const expectedReturnTarget = dot(tgt, RH);

  const fan: FanPoint[] = [];
  let probTargetBeatsCurrent: number | undefined;
  let maxDDMed: { current: number; target: number } | undefined;
  let mcFinalReturnsCurrent: number[] | undefined;
  let mcFinalReturnsTarget: number[] | undefined;

  if (req.mc && req.mc.paths > 0) {
    const paths = Math.min(20000, Math.max(100, Math.round(req.mc.paths)));
    const R = rng(req.mc.seed ?? 12345);
    const N01 = randn(R);

    const L = cholesky(CORRELATION);
    const n = BUCKET_ORDER.length;

    const pathSeriesC = Array.from({length: paths}, () => Array(H + 1).fill(0).map((_: unknown, i: number) => i === 0 ? startV : 0));
    const pathSeriesT = Array.from({length: paths}, () => Array(H + 1).fill(0).map((_: unknown, i: number) => i === 0 ? startV : 0));
    const maxDrawC = Array(paths).fill(0), maxDrawT = Array(paths).fill(0);

    const stepOneMonth = () => {
      const z = Array(n).fill(0).map(() => N01());
      const zc = Array(n).fill(0);
      for (let i = 0; i < n; i++) { let s = 0; for (let j = 0; j <= i; j++) s += L[i][j] * z[j]; zc[i] = s; }
      const r: Record<Bucket, number> = {} as Record<Bucket, number>;
      for (let i = 0; i < n; i++) {
        const b = BUCKET_ORDER[i];
        r[b] = meanMonth[b] + volMonth[b] * zc[i];
      }
      return r;
    };

    for (let p = 0; p < paths; p++) {
      let wC = {...cur}, wT = {...tgt};
      let vC = startV, vT = startV;
      let peakC = startV, peakT = startV;

      for (let m = 1; m <= H; m++) {
        const r = stepOneMonth();

        let rc = 0, rt = 0;
        for (const b of CANONICAL_BUCKETS) { rc += wC[b] * r[b]; rt += wT[b] * r[b]; }
        vC *= (1 + rc); vT *= (1 + rt);

        peakC = Math.max(peakC, vC); peakT = Math.max(peakT, vT);
        maxDrawC[p] = Math.max(maxDrawC[p], 1 - vC / peakC);
        maxDrawT[p] = Math.max(maxDrawT[p], 1 - vT / peakT);

        pathSeriesC[p][m] = vC;
        pathSeriesT[p][m] = vT;

        if (mode === "rebalanceMonthly") { wC = {...cur}; wT = {...tgt}; }
      }
    }

    const pctile = (arr: number[], p: number) => { const a = [...arr].sort((x, y) => x - y); const i = Math.floor((a.length - 1) * p); return a[i]; };
    for (let m = 0; m <= H; m++) {
      const sliceC = pathSeriesC.map(a => a[m]);
      const sliceT = pathSeriesT.map(a => a[m]);
      fan.push({
        t: m,
        current: { p05: pctile(sliceC, 0.05), p50: pctile(sliceC, 0.50), p95: pctile(sliceC, 0.95) },
        target: { p05: pctile(sliceT, 0.05), p50: pctile(sliceT, 0.50), p95: pctile(sliceT, 0.95) },
      });
    }
    const finalsC = pathSeriesC.map(a => a[H]);
    const finalsT = pathSeriesT.map(a => a[H]);
    let wins = 0; for (let i = 0; i < paths; i++) if (finalsT[i] > finalsC[i]) wins++;
    probTargetBeatsCurrent = wins / paths;

    mcFinalReturnsCurrent = finalsC.map(v => (v - startV) / startV);
    mcFinalReturnsTarget = finalsT.map(v => (v - startV) / startV);

    const mdMed = (xs: number[]) => pctile(xs, 0.50);
    maxDDMed = { current: mdMed(maxDrawC), target: mdMed(maxDrawT) };
  } else {
    let vC = startV, vT = startV;
    fan.push({ t: 0, current: { p05: vC, p50: vC, p95: vC }, target: { p05: vT, p50: vT, p95: vT } });
    for (let m = 1; m <= H; m++) {
      let rc = 0, rt = 0; for (const b of CANONICAL_BUCKETS) { rc += cur[b] * meanMonth[b]; rt += tgt[b] * meanMonth[b]; }
      vC *= (1 + rc); vT *= (1 + rt);
      fan.push({ t: m, current: { p05: vC, p50: vC, p95: vC }, target: { p05: vT, p50: vT, p95: vT } });
    }
  }

  const last = fan[fan.length - 1];
  const p50C = last.current.p50;
  const p50T = last.target.p50;
  const endValue = { current: p50C, target: p50T, diffGBP: p50T - p50C };
  const endValueBand = { current: last.current, target: last.target };

  let breakevenMonthMed: number | null = null;
  for (const pt of fan) {
    if (pt.target.p50 >= pt.current.p50) {
      breakevenMonthMed = pt.t;
      break;
    }
  }

  let downside: SimV2Response['downside'] | undefined;
  if (mcFinalReturnsCurrent && mcFinalReturnsTarget) {
    const prob = (arr: number[]) => arr.filter(x => x < 0).length / arr.length;
    const es5 = (arr: number[]) => {
      const s = [...arr].sort((a, b) => a - b);
      const kk = Math.max(1, Math.floor(s.length * 0.05));
      const worst = s.slice(0, kk);
      return worst.reduce((a, x) => a + x, 0) / worst.length;
    };
    downside = {
      probLoss: { current: prob(mcFinalReturnsCurrent), target: prob(mcFinalReturnsTarget) },
      es5: { current: es5(mcFinalReturnsCurrent), target: es5(mcFinalReturnsTarget) },
    };
  }

  let costs: SimV2Response['costs'] | undefined;
  if (req.costs) {
    costs = {
      estTurnoverPp: req.costs.estTurnoverPp,
      estCostPct: req.costs.estCostPct,
      diffAfterCostsPp: (expectedReturnTarget - expectedReturnCurrent) - req.costs.estCostPct,
    };
  }

  const diffAttribution = Object.entries(FACTORS).map(([name, bs]) => {
    const pp = bs.reduce((s, b) => {
      const bucket = b as Bucket;
      return s + ((tgt[bucket] - cur[bucket]) * (RH[bucket] || 0));
    }, 0);
    return { factor: name, pp };
  }).sort((a, b) => Math.abs(b.pp) - Math.abs(a.pp));

  const stresses = ["S003", "S007", "S009"].map(id => {
    const RHstress = computeRHForPureScenario(id, H, k);
    const retC = CANONICAL_BUCKETS.reduce((s, b) => s + (cur[b] || 0) * (RHstress[b] || 0), 0);
    const retT = CANONICAL_BUCKETS.reduce((s, b) => s + (tgt[b] || 0) * (RHstress[b] || 0), 0);
    return {
      id,
      label: SCENARIO_LABELS[id] || id,
      retCurrent: retC,
      retTarget: retT,
      diffPp: retT - retC,
    };
  });

  let multi: MultiHorizonSummary[] | undefined;
  if (req.multiHorizons && req.multiHorizons.length) {
    const uniq = Array.from(new Set(req.multiHorizons.filter(h => h > 0))).sort((a, b) => a - b);
    multi = [];

    for (const h of uniq) {
      const mean12H = fadedMean12ForH(mean12Scenario, basePrior12, h, tau);
      const RHh: Record<Bucket, number> = {} as Record<Bucket, number>;
      for (const b of CANONICAL_BUCKETS) RHh[b] = pow1p(mean12H[b] || 0, h / 12);

      const erC = dot(cur, RHh);
      const erT = dot(tgt, RHh);
      const diff = erT - erC;

      const meanMonthH: Record<Bucket, number> = {} as Record<Bucket, number>;
      for (const b of CANONICAL_BUCKETS) meanMonthH[b] = Math.pow(1 + (mean12H[b] || 0), 1 / 12) - 1;

      const be = breakevenOnMedian(h, startV, cur, tgt, meanMonthH);

      const endC = startV * (1 + erC);
      const endT = startV * (1 + erT);

      const summary: MultiHorizonSummary = {
        horizonMonths: h,
        expectedReturnCurrent: erC,
        expectedReturnTarget: erT,
        diffPp: diff,
        endValue: { current: endC, target: endT, diffGBP: endT - endC },
        breakevenMonthMed: be,
      };

      if (req.costs) {
        summary.costs = {
          estTurnoverPp: req.costs.estTurnoverPp,
          estCostPct: req.costs.estCostPct,
          diffAfterCostsPp: diff - req.costs.estCostPct,
        };
      }

      multi.push(summary);
    }
  }

  return {
    horizonMonths: H,
    expectedReturnCurrent,
    expectedReturnTarget,
    diffPp: expectedReturnTarget - expectedReturnCurrent,
    contributionsCurrent,
    contributionsTarget,
    fan,
    probTargetBeatsCurrent,
    maxDrawdownMed: maxDDMed,
    mode,
    endValue,
    endValueBand,
    breakevenMonthMed,
    downside,
    costs,
    diffAttribution,
    stresses,
    multi,
  };
}
