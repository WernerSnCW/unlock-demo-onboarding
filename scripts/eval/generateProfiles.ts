// Deterministic stratified sampler: turns scripts/eval/profileShapes.ts's taxonomy into concrete
// InvestorProfile fixtures (plus raw holdings/beliefs/outlook inputs) for the harness (Task 5).
// Deterministic (seeded, not Math.random()) so re-running produces the same profile set —
// required for the calibration workflow in Task 9 to be reproducible.

import {
  PROFILE_SHAPES,
  WEALTH_TIERS,
  ASSET_REGISTER_PATTERNS,
  ANSWER_PATTERNS,
  type WealthTier,
  type AnswerPattern,
} from './profileShapes';
import type { InvestorProfile, PersonaCues, AssetClassBreakdown } from '../../server/services/personaEngine';

export interface RawHolding {
  asset_class: string;
  region: string;
  value_gbp: number;
  wrapper: string;
  illiquid: boolean;
}

export interface BeliefTiltAnswers {
  Q_VOLATILITY_COMFORT: 1 | 2 | 3 | 4 | 5;
  Q_QUALITY: 1 | 2 | 3 | 4 | 5;
  Q_VALUE: 1 | 2 | 3 | 4 | 5;
  Q_TECH: 1 | 2 | 3 | 4 | 5;
  Q_UK_BIAS: 1 | 2 | 3 | 4 | 5;
  Q_ESG: 1 | 2 | 3 | 4 | 5;
  Q_INFLATION: 1 | 2 | 3 | 4 | 5;
  Q_SMALL_CAP: 1 | 2 | 3 | 4 | 5;
}

export type OutlookAnswers = Partial<Record<string, 1 | 2 | 3 | 4 | 5>>;

export interface GeneratedProfile {
  id: string;
  shapeId: string;
  wealthTierId: string;
  assetRegisterPatternId: string;
  answerPatternId: string;
  troubleZoneId: string;
  investorProfile: InvestorProfile;
  holdings: RawHolding[];
  beliefTiltAnswers: BeliefTiltAnswers;
  outlookAnswers: OutlookAnswers;
  safetyLightStance?: 'REDUCE' | 'HOLD_DELIBERATE' | 'UNSURE' | 'NO_RESPONSE';
}

/** Small deterministic PRNG (mulberry32) — no external dependency, reproducible across runs. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// TARGET_TOTAL: the resolved spec (§2/§3) asks for a total between 100 and 150, sampled
// proportionally to `weight` with each shape's `floor` guaranteed. PROFILE_SHAPES' floors
// (Task 2, already committed) sum to 73 — below the floor of the target range. Per Task 3's
// own Step 4 guidance ("adjust individual floor values ... until the sum lands in range" OR,
// per the Step 3 implementation note, "extend the loop to draw floor + round((weight/totalWeight)
// * extraBudget) per shape"), this generator takes the second path: it keeps every committed
// floor untouched and tops up proportionally to `weight` until the total lands mid-range. This
// satisfies both the floor requirement and the total-count requirement without editing Task 2's
// already-merged file.
const TARGET_TOTAL = 120;

function computeShapeCounts(): Map<string, number> {
  const floorSum = PROFILE_SHAPES.reduce((sum, s) => sum + s.floor, 0);
  const extraBudget = Math.max(0, TARGET_TOTAL - floorSum);
  const totalWeight = PROFILE_SHAPES.reduce((sum, s) => sum + s.weight, 0);

  const counts = new Map<string, number>();
  let allocatedExtra = 0;
  for (const shape of PROFILE_SHAPES) {
    const extra = Math.round((shape.weight / totalWeight) * extraBudget);
    counts.set(shape.id, shape.floor + extra);
    allocatedExtra += extra;
  }

  // Rounding can land a couple of units off the extraBudget; reconcile the delta against the
  // highest-weight shape so the total is deterministic and doesn't quietly drift by rounding.
  const drift = extraBudget - allocatedExtra;
  if (drift !== 0) {
    const heaviest = [...PROFILE_SHAPES].sort((a, b) => b.weight - a.weight)[0];
    counts.set(heaviest.id, (counts.get(heaviest.id) ?? heaviest.floor) + drift);
  }

  return counts;
}

function pickPortfolioValue(tier: WealthTier, rand: () => number): number {
  const min = tier.minGBP;
  const max = tier.maxGBP ?? tier.minGBP * 2; // UHNW has no upper bound; sample within a bounded illustrative range
  return Math.round(min + rand() * (max - min));
}

function buildHoldings(breakdown: AssetClassBreakdown, totalGBP: number, largestLinePct: number, assetPatternId: string): RawHolding[] {
  const holdings: RawHolding[] = [];
  const entries: [string, number][] = [
    ['equity', breakdown.equity_pct],
    ['bond', breakdown.bond_pct],
    ['property', breakdown.property_pct],
    ['cash', breakdown.cash_pct],
    ['alts', breakdown.alts_pct],
    ['crypto', breakdown.crypto_pct],
  ];
  for (const [assetClass, pct] of entries) {
    if (pct <= 0) continue;
    const region = assetClass === 'equity' ? 'uk' : assetClass === 'property' ? 'uk' : 'global';
    holdings.push({
      asset_class: assetClass,
      region,
      value_gbp: Math.round(pct * totalGBP),
      wrapper: 'GIA',
      illiquid: assetClass === 'property' || assetClass === 'alts',
    });
  }
  // Concentration is expressed as the largest single line — for CONCENTRATED_SINGLE_LINE shapes
  // this is the equity holding sized to largestLinePct of the total; other shapes leave it at the
  // asset-class-level split above and largestLinePct is small by construction.
  if (assetPatternId === 'CONCENTRATED_SINGLE_LINE') {
    const equityHolding = holdings.find((h) => h.asset_class === 'equity');
    if (equityHolding) equityHolding.value_gbp = Math.round(largestLinePct * totalGBP);
  }
  return holdings;
}

function buildPersonaCues(pattern: AnswerPattern, notSureHeavy: boolean, crossBorderDb: boolean, rand: () => number): PersonaCues {
  const skipped = !pattern.optionalSectionCompleted;
  const ageBands: PersonaCues['age_band'][] = ['35_44', '45_54', '55_64'];
  return {
    age_band: ageBands[Math.floor(rand() * ageBands.length)],
    portfolio_stage: skipped ? null : 'ACCUMULATING',
    investing_focus: skipped ? [] : ['FUNDS_ETFS'],
    has_defined_benefit_pension: skipped ? null : crossBorderDb,
    db_income_coverage_band: skipped ? null : crossBorderDb ? (notSureHeavy ? 'NOT_SURE' : 'GT_75') : null,
    owns_business: skipped ? null : true,
    private_business_wealth_band: skipped ? null : notSureHeavy ? 'NOT_SURE' : '25_50',
    has_employer_stock: skipped ? null : true,
    employer_stock_alloc_band: skipped ? null : notSureHeavy ? 'NOT_SURE' : '15_30',
    has_crypto: skipped ? null : false,
    crypto_alloc_band: skipped ? null : null,
    adviser_usage: skipped ? null : 'SELF_DIRECTED',
    is_cross_border: skipped ? null : crossBorderDb,
  };
}

function buildBeliefTiltAnswers(rand: () => number): BeliefTiltAnswers {
  const rand5 = (): 1 | 2 | 3 | 4 | 5 => ([1, 2, 3, 4, 5] as const)[Math.floor(rand() * 5)];
  return {
    Q_VOLATILITY_COMFORT: rand5(),
    Q_QUALITY: rand5(),
    Q_VALUE: rand5(),
    Q_TECH: rand5(),
    Q_UK_BIAS: rand5(),
    Q_ESG: rand5(),
    Q_INFLATION: rand5(),
    Q_SMALL_CAP: rand5(),
  };
}

function buildOutlookAnswers(rand: () => number): OutlookAnswers {
  // B1-B15 ids match client/src/data/outlookQuestions.ts's OUTLOOK_QUESTIONS — kept as plain
  // numeric strings here to avoid an import cycle into client/src/data from a script/ file;
  // scoreOutlookBeliefs (Task 5) iterates OUTLOOK_QUESTIONS itself and looks up by id
  // (`responses[q.id]`), so any extra/missing key here is harmless — a missing id is simply
  // skipped (client/src/lib/beliefImpact/scoreOutlook.ts: `if (answer === undefined) continue;`).
  const ids = [
    'B1_mobility_views',
    'B2_job_security_white_collar',
    'B3_remote_work_tenure',
    'B4_government_confidence',
    'B5_energy_policy',
    'B6_ai_adoption_speed',
    'B7_renting_vs_buying',
    'B8_local_investment_preference',
    'B9_geopolitical_risk',
    'B10_fx_view',
    'B11_credit_availability',
    'B12_policy_support',
    'B13_fiscal_sustainability',
    'B14_mortgage_reset_pressure',
    'B15_external_balance_risk',
  ];
  const answers: OutlookAnswers = {};
  for (const id of ids) answers[id] = ([1, 2, 3, 4, 5] as const)[Math.floor(rand() * 5)];
  return answers;
}

/** Maps the resolved spec's redGateStance vocabulary onto the time_horizon/risk_comfort strings
 *  that InvestorProfile actually declares as `string` (personaEngine.ts imposes no enum — it
 *  parses time_horizon textually via isLongHorizon and matches risk_comfort against a lowercase
 *  lookup table), and onto answerPattern's timeHorizon vocabulary (short/medium/long/very_long,
 *  the UI's real vocabulary per profileShapes.ts's HORIZON_VOCAB_EDGE rationale). */
function resolveTimeHorizon(pattern: AnswerPattern): string {
  return pattern.timeHorizon;
}

export function generateProfiles(): GeneratedProfile[] {
  const rand = mulberry32(20260704); // fixed seed — deterministic across runs, per Task 9's calibration requirement
  const shapeCounts = computeShapeCounts();
  const profiles: GeneratedProfile[] = [];

  for (const shape of PROFILE_SHAPES) {
    const tier = WEALTH_TIERS.find((t) => t.id === shape.wealthTier);
    const asset = ASSET_REGISTER_PATTERNS.find((a) => a.id === shape.assetRegisterPattern);
    const pattern = ANSWER_PATTERNS.find((a) => a.id === shape.answerPattern);
    if (!tier || !asset || !pattern) {
      // Referential integrity is covered by its own test; fail loudly here too rather than
      // silently skipping a shape if that test is ever bypassed.
      throw new Error(`generateProfiles: shape ${shape.id} references an unknown tier/pattern id`);
    }

    const count = shapeCounts.get(shape.id) ?? shape.floor;

    for (let i = 0; i < count; i++) {
      const totalGBP = pickPortfolioValue(tier, rand);
      const largestLinePct =
        shape.assetRegisterPattern === 'CONCENTRATED_SINGLE_LINE' ? 0.3 + rand() * 0.15 : asset.breakdown.equity_pct * 0.4;
      const illiquidPct = asset.breakdown.property_pct + asset.breakdown.alts_pct;
      const cashRunwayMonths = shape.troubleZone === 'CAPITAL_PRESERVATION_BOUNDARY' ? 3 + rand() * 3 : 6 + rand() * 12;
      const crossBorderDb = shape.troubleZone === 'CROSS_BORDER_DB_PENSION';
      const notSureHeavy = pattern.hardOverrideNotSureHeavy;

      const investorProfile: InvestorProfile = {
        age_band: '45_54',
        portfolio_stage: pattern.optionalSectionCompleted ? 'ACCUMULATING' : null,
        primary_goal: shape.troubleZone === 'CAPITAL_PRESERVATION_BOUNDARY' ? 'preserve_capital' : 'grow_wealth',
        time_horizon: resolveTimeHorizon(pattern),
        risk_comfort: shape.troubleZone === 'CAPITAL_PRESERVATION_BOUNDARY' ? 'very_low' : 'moderate',
        personaCues: buildPersonaCues(pattern, notSureHeavy, crossBorderDb, rand),
        total_portfolio_value_gbp: totalGBP,
        cash_runway_months: cashRunwayMonths,
        largest_line_pct: largestLinePct,
        illiquid_pct: illiquidPct,
        asset_class_breakdown: asset.breakdown,
        liquidity_status: cashRunwayMonths < 6 ? 'RED' : 'GREEN',
        concentration_status: largestLinePct > 0.2 ? 'RED' : 'GREEN',
        illiquids_status: illiquidPct > 0.1 ? 'RED' : 'GREEN',
      };

      profiles.push({
        id: `${shape.id}-${i}`,
        shapeId: shape.id,
        wealthTierId: tier.id,
        assetRegisterPatternId: asset.id,
        answerPatternId: pattern.id,
        troubleZoneId: shape.troubleZone,
        investorProfile,
        holdings: buildHoldings(asset.breakdown, totalGBP, largestLinePct, shape.assetRegisterPattern),
        beliefTiltAnswers: buildBeliefTiltAnswers(rand),
        outlookAnswers: buildOutlookAnswers(rand),
        safetyLightStance: shape.redGateStance,
      });
    }
  }

  return profiles;
}
