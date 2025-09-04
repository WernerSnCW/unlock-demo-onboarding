import { CANONICAL_BUCKETS, Bucket } from "../../config/buckets";
import { SCENARIO_SHOCKS } from "../../config/scenarioShocks";
import { SCENARIO_VOLS } from "../../config/scenarioVols";
import { CORRELATION, BUCKET_ORDER } from "../../config/correlations";

// Scenario labels for stress testing
const SCENARIO_LABELS: Record<string, string> = {
  S001: "Base Case",
  S002: "Recession", 
  S003: "Inflation Spike",
  S004: "Recovery",
  S005: "Reflation",
  S006: "Tech Crash",
  S007: "Stagflation", 
  S008: "Energy Crisis",
  S009: "Gilt Sell-off",
  S010: "Commodity Boom"
};

// Factor groupings for attribution analysis
const FACTORS: Record<string, string[]> = {
  "Equities": ["GLOBAL_EQUITY","UK_EQUITY_VALUE","GROWTH_TECH"],
  "Credit/Income": ["IG_CREDIT"],
  "Duration": ["GILTS_LONG"],
  "Liquidity": ["CASH","BILLS_SHORT_GILTS"],
  "Real Assets": ["GOLD","COMMODITIES","PROPERTY_UK_RESI"],
  "Other": ["ALTERNATIVES","COLLECTIBLES_ART","COLLECTIBLES_WINE","CRYPTO_BTC","CRYPTO_ETH"]
};

export type RebalanceMode = "hold" | "rebalanceMonthly";

export interface SimV2Request {
  currentMix: Record<string, number>;
  targetMix:  Record<string, number>;
  scenarioWeights: Record<string, number>;   // e.g., { S007:0.6, S009:0.4 }
  horizonMonths?: number;                    // default 12
  startValueGBP?: number;                    // default 100
  shockMultiplier?: number;                  // default 1.0 (scales both mean & vol)
  mode?: RebalanceMode;                      // default "hold"
  mc?: { paths: number; seed?: number };     // optional Monte Carlo (e.g., {paths: 5000})
  costs?: { estTurnoverPp: number; estCostPct: number }; // optional after-costs analysis
}

export interface FanPoint { 
  t:number; 
  current:{p05:number;p50:number;p95:number}; 
  target:{p05:number;p50:number;p95:number}; 
}

export interface SimV2Response {
  horizonMonths: number;
  expectedReturnCurrent: number;   // from blended means RH
  expectedReturnTarget:  number;
  diffPp: number;                  // expectedReturnTarget - expectedReturnCurrent
  contributionsCurrent: Record<Bucket, number>;
  contributionsTarget:  Record<Bucket, number>;
  fan: FanPoint[];                 // if mc enabled; else single deterministic series in p50
  probTargetBeatsCurrent?: number; // MC: P(final_T > final_C)
  maxDrawdownMed?: { current:number; target:number }; // MC: median max DD
  mode: RebalanceMode;
  
  // NEW investor-ready fields:
  endValue: { current: number; target: number; diffGBP: number };
  endValueBand?: { current:{p05:number;p50:number;p95:number}; target:{p05:number;p50:number;p95:number} };
  breakevenMonthMed?: number | null;
  downside?: {
    probLoss: { current:number; target:number }; // P(final return < 0)
    es5:      { current:number; target:number }; // Expected Shortfall at 5%
  };
  costs?: { estTurnoverPp:number; estCostPct:number; diffAfterCostsPp:number };
  diffAttribution: Array<{ factor:string; pp:number }>;
  stresses?: Array<{ id:string; label:string; retCurrent:number; retTarget:number; diffPp:number }>;
}

// ---------- helpers ----------
function harmonise(m: Partial<Record<string,number>>): Record<Bucket, number> {
  const out = {} as Record<Bucket, number>;
  for (const b of CANONICAL_BUCKETS) out[b] = Number(m[b] ?? 0);
  return out;
}

function normaliseW(w: Record<string, number>) {
  const s = Object.values(w||{}).reduce((a,b)=>a+b,0) || 0;
  const out: Record<string, number> = {};
  for (const [k,v] of Object.entries(w||{})) out[k] = s ? v/s : 0;
  return out;
}

function blend<T extends Record<string, number>>(parts: Record<string, T>, weights: Record<string, number>): Record<string, number> {
  const w = normaliseW(weights);
  const acc: Record<string, number> = {};
  for (const [sid, ws] of Object.entries(w)) {
    const vec = parts[sid]; if (!vec || ws<=0) continue;
    for (const [k, v] of Object.entries(vec)) acc[k] = (acc[k]||0) + v*ws;
  }
  return acc;
}

function pow1p(x:number, p:number){ return Math.pow(1+x, p) - 1; }

function dot(a: Record<Bucket, number>, b: Record<Bucket, number>) {
  return CANONICAL_BUCKETS.reduce((s,k)=>s + (a[k]||0)*(b[k]||0), 0);
}

function cholesky(A:number[][]){ // minimal; assumes PD
  const n=A.length, L=Array.from({length:n},()=>Array(n).fill(0));
  for (let i=0;i<n;i++){
    for (let j=0;j<=i;j++){
      let sum=0; for (let k=0;k<j;k++) sum+=L[i][k]*L[j][k];
      L[i][j] = (i===j) ? Math.sqrt(Math.max(A[i][i]-sum,0)) : (A[i][j]-sum)/L[j][j];
    }
  }
  return L;
}

function rng(seed=1234567){ // simple LCG for reproducibility
  let s = seed>>>0;
  return ()=> (s = (1664525*s + 1013904223)>>>0, (s>>>8)/0x01000000);
}

function randn(seedGen:()=>number){ // Box-Muller
  let spare: number|undefined;
  return ()=> {
    if (spare!==undefined){ const v=spare; spare=undefined; return v; }
    let u=0,v=0; while(u<=1e-12) u=seedGen(); while(v<=1e-12) v=seedGen();
    const mag = Math.sqrt(-2*Math.log(u)); const z0 = mag*Math.cos(2*Math.PI*v); const z1 = mag*Math.sin(2*Math.PI*v);
    spare=z1; return z0;
  };
}

// Helper to compute horizon returns for a pure scenario
function computeRHForPureScenario(scenarioId: string, H: number, k: number): Record<Bucket, number> {
  const mean12 = harmonise(SCENARIO_SHOCKS[scenarioId] || {});
  const RH: Record<Bucket, number> = {} as any;
  for (const b of CANONICAL_BUCKETS) {
    RH[b] = pow1p((mean12[b] || 0) * k, H/12);
  }
  return RH;
}

// ---------- main ----------
export function simulateV2(req: SimV2Request): SimV2Response {
  const H = Math.max(1, Math.round(req.horizonMonths ?? 12));
  const startV = req.startValueGBP ?? 100;
  const k = req.shockMultiplier ?? 1.0;
  const mode: RebalanceMode = req.mode ?? "hold";

  const cur = harmonise(req.currentMix);
  const tgt = harmonise(req.targetMix);

  // 1) Blend 12m means & vols across scenarios, then scale
  const mean12 = harmonise( blend(SCENARIO_SHOCKS, req.scenarioWeights) );
  const vol12  = harmonise( blend(SCENARIO_VOLS,   req.scenarioWeights) ) as Record<Bucket, number>;
  for (const b of CANONICAL_BUCKETS){ mean12[b]*=k; vol12[b]*=(k || 1); } // scale both if multiplier used

  const meanMonth: Record<Bucket, number> = {} as any;
  const volMonth:  Record<Bucket, number> = {} as any;
  for (const b of CANONICAL_BUCKETS){
    meanMonth[b] = Math.pow(1 + (mean12[b]||0), 1/12) - 1;
    volMonth[b]  = (vol12[b] || 0) / Math.sqrt(12);
  }

  // 2) Expected (deterministic) horizon returns using 12m means
  const RH: Record<Bucket, number> = {} as any;
  for (const b of CANONICAL_BUCKETS) RH[b] = pow1p(mean12[b]||0, H/12);
  const contributionsCurrent = {} as Record<Bucket, number>;
  const contributionsTarget  = {} as Record<Bucket, number>;
  for (const b of CANONICAL_BUCKETS){
    contributionsCurrent[b] = (cur[b]||0) * RH[b];
    contributionsTarget[b]  = (tgt[b]||0) * RH[b];
  }
  const expectedReturnCurrent = dot(cur, RH);
  const expectedReturnTarget  = dot(tgt, RH);

  // 3) Monte Carlo fan (optional)
  const fan: FanPoint[] = [];
  let probTargetBeatsCurrent: number | undefined;
  let maxDDMed: {current:number; target:number} | undefined;
  let mcFinalReturnsCurrent: number[] | undefined;
  let mcFinalReturnsTarget: number[] | undefined;

  if (req.mc && req.mc.paths>0) {
    const paths = Math.min(20000, Math.max(100, Math.round(req.mc.paths)));
    const R = rng(req.mc.seed ?? 12345);
    const N01 = randn(R);

    // Build Cholesky for correlation (assumes BUCKET_ORDER matches)
    const L = cholesky(CORRELATION);
    const n = BUCKET_ORDER.length;

    const pathValsC = Array.from({length:paths},()=>startV);
    const pathValsT = Array.from({length:paths},()=>startV);
    const pathSeriesC = Array.from({length:paths},()=>Array(H+1).fill(0).map((_,i)=> i===0? startV : 0));
    const pathSeriesT = Array.from({length:paths},()=>Array(H+1).fill(0).map((_,i)=> i===0? startV : 0));
    const maxDrawC = Array(paths).fill(0), maxDrawT = Array(paths).fill(0);

    const stepOneMonth = () => {
      // draw correlated Z
      const z = Array(n).fill(0).map(()=>N01());
      const zc = Array(n).fill(0);
      for (let i=0;i<n;i++){ let s=0; for (let j=0;j<=i;j++) s += L[i][j]*z[j]; zc[i]=s; }
      // map to bucket order
      const r: Record<Bucket, number> = {} as any;
      for (let i=0;i<n;i++){
        const b = BUCKET_ORDER[i];
        r[b] = meanMonth[b] + volMonth[b]*zc[i];
      }
      return r;
    };

    for (let p=0;p<paths;p++){
      let wC = {...cur}, wT = {...tgt};
      let vC = startV, vT = startV;
      let peakC = startV, peakT = startV;

      for (let m=1;m<=H;m++){
        const r = stepOneMonth(); // same shock vector applied to both mixes

        // month portfolio returns
        let rc = 0, rt = 0;
        for (const b of CANONICAL_BUCKETS){ rc += wC[b]*r[b]; rt += wT[b]*r[b]; }
        vC *= (1 + rc); vT *= (1 + rt);

        // track drawdowns
        peakC = Math.max(peakC, vC); peakT = Math.max(peakT, vT);
        maxDrawC[p] = Math.max(maxDrawC[p], 1 - vC/peakC);
        maxDrawT[p] = Math.max(maxDrawT[p], 1 - vT/peakT);

        pathSeriesC[p][m] = vC;
        pathSeriesT[p][m] = vT;

        // rebalance monthly if selected
        if (mode === "rebalanceMonthly"){ wC = {...cur}; wT = {...tgt}; }
        else { /* buy-and-hold: weights drift automatically via compounding */ }
      }
    }

    // Build fan (p05/p50/p95) over time
    const pctile = (arr:number[], p:number) => { const a=[...arr].sort((x,y)=>x-y); const i=Math.floor((a.length-1)*p); return a[i]; };
    for (let m=0;m<=H;m++){
      const sliceC = pathSeriesC.map(a=>a[m]);
      const sliceT = pathSeriesT.map(a=>a[m]);
      fan.push({
        t:m,
        current:{ p05:pctile(sliceC,0.05), p50:pctile(sliceC,0.50), p95:pctile(sliceC,0.95) },
        target: { p05:pctile(sliceT,0.05), p50:pctile(sliceT,0.50), p95:pctile(sliceT,0.95) }
      });
    }
    const finalsC = pathSeriesC.map(a=>a[H]);
    const finalsT = pathSeriesT.map(a=>a[H]);
    let wins=0; for (let i=0;i<paths;i++) if (finalsT[i] > finalsC[i]) wins++;
    probTargetBeatsCurrent = wins/paths;

    // Store final returns for downside analysis
    mcFinalReturnsCurrent = finalsC.map(v => (v - startV) / startV);
    mcFinalReturnsTarget = finalsT.map(v => (v - startV) / startV);

    const mdMed = (xs:number[])=> pctile(xs,0.50);
    maxDDMed = { current: mdMed(maxDrawC), target: mdMed(maxDrawT) };
  } else {
    // deterministic series using means only (median path)
    const fanTmp: FanPoint[] = [];
    let vC = startV, vT = startV;
    fanTmp.push({ t:0, current:{p05:vC,p50:vC,p95:vC}, target:{p05:vT,p50:vT,p95:vT} });
    for (let m=1;m<=H;m++){
      // monthly means only
      let rc=0, rt=0; for (const b of CANONICAL_BUCKETS){ rc += cur[b]*meanMonth[b]; rt += tgt[b]*meanMonth[b]; }
      vC *= (1+rc); vT *= (1+rt);
      fanTmp.push({ t:m, current:{p05:vC,p50:vC,p95:vC}, target:{p05:vT,p50:vT,p95:vT} });
    }
    fan.push(...fanTmp);
  }

  // ========== NEW INVESTOR-READY FEATURES ==========
  
  // 1) £ impact & range
  const last = fan[fan.length - 1];
  const p50C = last.current.p50;
  const p50T = last.target.p50;
  const endValue = { current: p50C, target: p50T, diffGBP: p50T - p50C };
  const endValueBand = { current: last.current, target: last.target };

  // 2) Breakeven month (median)
  let breakevenMonthMed: number | null = null;
  for (const pt of fan) { 
    if (pt.target.p50 >= pt.current.p50) { 
      breakevenMonthMed = pt.t; 
      break; 
    } 
  }

  // 3) Downside risk (only if MC enabled)
  let downside: SimV2Response['downside'] | undefined;
  if (mcFinalReturnsCurrent && mcFinalReturnsTarget) {
    const prob = (arr:number[]) => arr.filter(x => x < 0).length / arr.length;
    const es5 = (arr:number[]) => {
      const s = [...arr].sort((a,b)=>a-b);
      const k = Math.max(1, Math.floor(s.length * 0.05));
      const worst = s.slice(0, k);
      return worst.reduce((a,x)=>a+x,0) / worst.length;
    };
    downside = {
      probLoss: { current: prob(mcFinalReturnsCurrent), target: prob(mcFinalReturnsTarget) },
      es5:      { current: es5(mcFinalReturnsCurrent), target: es5(mcFinalReturnsTarget) }
    };
  }

  // 4) After-costs uplift (optional)
  let costs: SimV2Response['costs'] | undefined;
  if (req.costs) {
    costs = {
      estTurnoverPp: req.costs.estTurnoverPp,
      estCostPct:    req.costs.estCostPct,
      diffAfterCostsPp: (expectedReturnTarget - expectedReturnCurrent) - req.costs.estCostPct
    };
  }

  // 5) Difference attribution (factor buckets)
  const diffAttribution = Object.entries(FACTORS).map(([name, bs])=>{
    const pp = bs.reduce((s,b)=> {
      const bucket = b as Bucket;
      return s + ((tgt[bucket]-cur[bucket]) * (RH[bucket] || 0));
    }, 0);
    return { factor: name, pp };
  }).sort((a,b)=> Math.abs(b.pp) - Math.abs(a.pp));

  // 6) Stresses (pure scenarios)
  const stresses = ["S003","S007","S009"].map(id => {
    const RHstress = computeRHForPureScenario(id, H, k);
    const retC = CANONICAL_BUCKETS.reduce((s,b)=> s + (cur[b]||0)*(RHstress[b]||0), 0);
    const retT = CANONICAL_BUCKETS.reduce((s,b)=> s + (tgt[b]||0)*(RHstress[b]||0), 0);
    return { 
      id, 
      label: SCENARIO_LABELS[id] || id, 
      retCurrent: retC, 
      retTarget: retT, 
      diffPp: retT - retC 
    };
  });

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
    
    // NEW investor-ready fields:
    endValue,
    endValueBand,
    breakevenMonthMed,
    downside,
    costs,
    diffAttribution,
    stresses
  };
}