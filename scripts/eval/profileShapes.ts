// Profile-shape taxonomy per the resolved sufficiency-rubric spec §2: wealth tier x
// asset-register pattern x answer-pattern archetype, weighted toward named trouble zones.
// This is DATA only — scripts/eval/generateProfiles.ts turns each PROFILE_SHAPES entry into
// concrete InvestorProfile/holdings/beliefs/outlook fixtures.

export interface WealthTier {
  id: string;
  label: string;
  minGBP: number;
  maxGBP: number | null; // null = no upper bound (the "25m+" tier)
}

// Spans the product's stated target market, GBP500k-25m+ (resolved spec §2).
export const WEALTH_TIERS: WealthTier[] = [
  { id: 'ENTRY', label: '£500k-£1m', minGBP: 500_000, maxGBP: 1_000_000 },
  { id: 'CORE', label: '£1m-£5m', minGBP: 1_000_000, maxGBP: 5_000_000 },
  { id: 'HIGH', label: '£5m-£25m', minGBP: 5_000_000, maxGBP: 25_000_000 },
  { id: 'UHNW', label: '£25m+', minGBP: 25_000_000, maxGBP: null },
];

export interface AssetRegisterPattern {
  id: string;
  label: string;
  /** Fractional asset_class_breakdown, must sum to 1.0. */
  breakdown: { equity_pct: number; bond_pct: number; property_pct: number; cash_pct: number; alts_pct: number; crypto_pct: number };
}

export const ASSET_REGISTER_PATTERNS: AssetRegisterPattern[] = [
  { id: 'DIVERSIFIED', label: 'Diversified across all classes', breakdown: { equity_pct: 0.45, bond_pct: 0.20, property_pct: 0.15, cash_pct: 0.10, alts_pct: 0.08, crypto_pct: 0.02 } },
  { id: 'EQUITY_HEAVY', label: 'Equity-concentrated', breakdown: { equity_pct: 0.75, bond_pct: 0.05, property_pct: 0.05, cash_pct: 0.10, alts_pct: 0.05, crypto_pct: 0 } },
  { id: 'PROPERTY_HEAVY', label: 'Property-concentrated (BTL-style)', breakdown: { equity_pct: 0.20, bond_pct: 0.05, property_pct: 0.55, cash_pct: 0.10, alts_pct: 0.10, crypto_pct: 0 } },
  { id: 'CASH_HEAVY_DEFENSIVE', label: 'Cash/bond-heavy defensive', breakdown: { equity_pct: 0.20, bond_pct: 0.35, property_pct: 0.10, cash_pct: 0.30, alts_pct: 0.05, crypto_pct: 0 } },
  { id: 'ALTS_CRYPTO_HEAVY', label: 'Alternatives/crypto-concentrated', breakdown: { equity_pct: 0.30, bond_pct: 0.05, property_pct: 0.05, cash_pct: 0.10, alts_pct: 0.30, crypto_pct: 0.20 } },
  { id: 'CONCENTRATED_SINGLE_LINE', label: 'Single-line concentration (employer stock or family holding)', breakdown: { equity_pct: 0.60, bond_pct: 0.10, property_pct: 0.10, cash_pct: 0.10, alts_pct: 0.10, crypto_pct: 0 } },
];

export interface AnswerPattern {
  id: string;
  label: string;
  /** Whether the optional section (T2/T6-feeding cues) is filled in at all. */
  optionalSectionCompleted: boolean;
  /** Whether hard-override-eligible bands (property/alternatives/business-wealth) are answered NOT_SURE. */
  hardOverrideNotSureHeavy: boolean;
  /** time_horizon value to use — deliberately includes the vocabulary edge values. */
  timeHorizon: 'short' | 'medium' | 'long' | 'very_long';
}

export const ANSWER_PATTERNS: AnswerPattern[] = [
  { id: 'FULL_ANSWERS', label: 'Every question answered, no NOT_SURE', optionalSectionCompleted: true, hardOverrideNotSureHeavy: false, timeHorizon: 'long' },
  { id: 'OPTIONAL_SKIPPED', label: 'Optional section (T2/T6 cues) left blank', optionalSectionCompleted: false, hardOverrideNotSureHeavy: false, timeHorizon: 'medium' },
  { id: 'HARD_OVERRIDE_NOT_SURE_HEAVY', label: 'Property/alternatives/business-wealth bands answered NOT_SURE', optionalSectionCompleted: true, hardOverrideNotSureHeavy: true, timeHorizon: 'medium' },
  { id: 'HORIZON_SHORT', label: 'Full answers, short horizon', optionalSectionCompleted: true, hardOverrideNotSureHeavy: false, timeHorizon: 'short' },
  { id: 'HORIZON_VERY_LONG', label: 'Full answers, very-long horizon', optionalSectionCompleted: true, hardOverrideNotSureHeavy: false, timeHorizon: 'very_long' },
];

export interface TroubleZone {
  id: string;
  label: string;
  /** What the coverage audit (2026-07-02 persona validation report §6) flagged about this zone. */
  rationale: string;
}

// Named trouble zones from the resolved spec §2, each traceable to a finding in
// docs/2026-07-02-persona-validation-report.md.
export const TROUBLE_ZONES: TroubleZone[] = [
  { id: 'OPTIONAL_SECTION_SKIPPER', label: 'Optional-section skippers (T2/T6-starved, hard overrides dark except property)', rationale: 'report §6.2: a minimal-input user leaves T2/T6 starved and every hard override except property dark' },
  { id: 'HARD_OVERRIDE_NOT_SURE', label: 'Hard-override paths answered NOT_SURE (property/alternatives/business-wealth)', rationale: 'report §6.3: FOUNDER override previously fired on NOT_SURE business-wealth band at confidence 1.0 — fixed on main by commit 1033062, now a regression-guard case, not a live-bug case (see Task 8 note)' },
  { id: 'HORIZON_VOCAB_EDGE', label: 'Horizon-vocabulary edge values (medium, long)', rationale: 'report §6.3: engine horizon scalars were written for 10_plus/5_9, UI ships short/medium/long/very_long — fixed on main by commit 1033062, now a regression-guard case (see Task 8 note)' },
  { id: 'CAPITAL_PRESERVATION_BOUNDARY', label: 'CAPITAL_PRESERVATION vs INCOME_STABILITY boundary', rationale: 'report §4/§6.3: CAPITAL_PRESERVATION previously reachable only through a contradiction-shaped path — fixed on main by commit 1033062, now a regression-guard case (see Task 8 note)' },
  { id: 'CROSS_BORDER_DB_PENSION', label: 'Cross-border / DB-pension-secured shapes', rationale: 'report §4: DB-pension-secured is a UK-specific type the engine treats as a flat complexity bump rather than an income-security signal; cross-border feeds T6 only' },
];

export interface ProfileShape {
  id: string;
  wealthTier: string; // WealthTier.id
  assetRegisterPattern: string; // AssetRegisterPattern.id
  answerPattern: string; // AnswerPattern.id
  troubleZone: string; // TroubleZone.id — every shape is anchored to the trouble zone it exercises
  /** Minimum number of concrete profiles this shape must get in a ~100-150 stratified sample. */
  floor: number;
  /** Relative sampling weight above the floor. */
  weight: number;
  /** Optional RED-gate self-placement stance to attach (spec item 4 — computeTiltsGate profile
   *  dimension). Only meaningful for shapes whose safety-lights inputs will actually produce a
   *  RED light; generateProfiles.ts (Task 3) is responsible for making that true when this is set. */
  redGateStance?: 'REDUCE' | 'HOLD_DELIBERATE' | 'UNSURE' | 'NO_RESPONSE';
}

export const PROFILE_SHAPES: ProfileShape[] = [
  { id: 'entry-diversified-full', wealthTier: 'ENTRY', assetRegisterPattern: 'DIVERSIFIED', answerPattern: 'FULL_ANSWERS', troubleZone: 'HORIZON_VOCAB_EDGE', floor: 3, weight: 1 },
  { id: 'entry-property-skipped', wealthTier: 'ENTRY', assetRegisterPattern: 'PROPERTY_HEAVY', answerPattern: 'OPTIONAL_SKIPPED', troubleZone: 'OPTIONAL_SECTION_SKIPPER', floor: 6, weight: 2 },
  { id: 'entry-cash-heavy-horizon-short', wealthTier: 'ENTRY', assetRegisterPattern: 'CASH_HEAVY_DEFENSIVE', answerPattern: 'HORIZON_SHORT', troubleZone: 'CAPITAL_PRESERVATION_BOUNDARY', floor: 6, weight: 2 },
  { id: 'core-diversified-full', wealthTier: 'CORE', assetRegisterPattern: 'DIVERSIFIED', answerPattern: 'FULL_ANSWERS', troubleZone: 'HORIZON_VOCAB_EDGE', floor: 5, weight: 2 },
  { id: 'core-equity-heavy-horizon-vlong', wealthTier: 'CORE', assetRegisterPattern: 'EQUITY_HEAVY', answerPattern: 'HORIZON_VERY_LONG', troubleZone: 'HORIZON_VOCAB_EDGE', floor: 5, weight: 2 },
  { id: 'core-concentrated-red-hold', wealthTier: 'CORE', assetRegisterPattern: 'CONCENTRATED_SINGLE_LINE', answerPattern: 'FULL_ANSWERS', troubleZone: 'HARD_OVERRIDE_NOT_SURE', floor: 7, weight: 3, redGateStance: 'HOLD_DELIBERATE' },
  { id: 'core-concentrated-red-reduce', wealthTier: 'CORE', assetRegisterPattern: 'CONCENTRATED_SINGLE_LINE', answerPattern: 'FULL_ANSWERS', troubleZone: 'HARD_OVERRIDE_NOT_SURE', floor: 7, weight: 3, redGateStance: 'REDUCE' },
  { id: 'core-concentrated-red-no-response', wealthTier: 'CORE', assetRegisterPattern: 'CONCENTRATED_SINGLE_LINE', answerPattern: 'FULL_ANSWERS', troubleZone: 'HARD_OVERRIDE_NOT_SURE', floor: 7, weight: 3, redGateStance: 'NO_RESPONSE' },
  { id: 'core-property-notsure-heavy', wealthTier: 'CORE', assetRegisterPattern: 'PROPERTY_HEAVY', answerPattern: 'HARD_OVERRIDE_NOT_SURE_HEAVY', troubleZone: 'HARD_OVERRIDE_NOT_SURE', floor: 7, weight: 3 },
  { id: 'core-alts-notsure-heavy', wealthTier: 'CORE', assetRegisterPattern: 'ALTS_CRYPTO_HEAVY', answerPattern: 'HARD_OVERRIDE_NOT_SURE_HEAVY', troubleZone: 'HARD_OVERRIDE_NOT_SURE', floor: 7, weight: 3 },
  { id: 'core-cross-border-db', wealthTier: 'CORE', assetRegisterPattern: 'DIVERSIFIED', answerPattern: 'FULL_ANSWERS', troubleZone: 'CROSS_BORDER_DB_PENSION', floor: 8, weight: 3 },
  { id: 'high-diversified-optional-skipped', wealthTier: 'HIGH', assetRegisterPattern: 'DIVERSIFIED', answerPattern: 'OPTIONAL_SKIPPED', troubleZone: 'OPTIONAL_SECTION_SKIPPER', floor: 6, weight: 2 },
  { id: 'high-equity-heavy-full', wealthTier: 'HIGH', assetRegisterPattern: 'EQUITY_HEAVY', answerPattern: 'FULL_ANSWERS', troubleZone: 'CAPITAL_PRESERVATION_BOUNDARY', floor: 5, weight: 2 },
  { id: 'high-cash-heavy-preservation-boundary', wealthTier: 'HIGH', assetRegisterPattern: 'CASH_HEAVY_DEFENSIVE', answerPattern: 'FULL_ANSWERS', troubleZone: 'CAPITAL_PRESERVATION_BOUNDARY', floor: 8, weight: 3 },
  { id: 'high-cross-border-db-notsure', wealthTier: 'HIGH', assetRegisterPattern: 'DIVERSIFIED', answerPattern: 'HARD_OVERRIDE_NOT_SURE_HEAVY', troubleZone: 'CROSS_BORDER_DB_PENSION', floor: 8, weight: 3 },
  { id: 'high-alts-crypto-full', wealthTier: 'HIGH', assetRegisterPattern: 'ALTS_CRYPTO_HEAVY', answerPattern: 'FULL_ANSWERS', troubleZone: 'HARD_OVERRIDE_NOT_SURE', floor: 5, weight: 2 },
  { id: 'uhnw-diversified-full', wealthTier: 'UHNW', assetRegisterPattern: 'DIVERSIFIED', answerPattern: 'FULL_ANSWERS', troubleZone: 'CROSS_BORDER_DB_PENSION', floor: 5, weight: 2 },
  { id: 'uhnw-property-heavy-optional-skipped', wealthTier: 'UHNW', assetRegisterPattern: 'PROPERTY_HEAVY', answerPattern: 'OPTIONAL_SKIPPED', troubleZone: 'OPTIONAL_SECTION_SKIPPER', floor: 5, weight: 2 },
  { id: 'uhnw-concentrated-red-hold', wealthTier: 'UHNW', assetRegisterPattern: 'CONCENTRATED_SINGLE_LINE', answerPattern: 'FULL_ANSWERS', troubleZone: 'HARD_OVERRIDE_NOT_SURE', floor: 5, weight: 2, redGateStance: 'HOLD_DELIBERATE' },
  { id: 'uhnw-alts-crypto-notsure', wealthTier: 'UHNW', assetRegisterPattern: 'ALTS_CRYPTO_HEAVY', answerPattern: 'HARD_OVERRIDE_NOT_SURE_HEAVY', troubleZone: 'HARD_OVERRIDE_NOT_SURE', floor: 5, weight: 2 },
];
