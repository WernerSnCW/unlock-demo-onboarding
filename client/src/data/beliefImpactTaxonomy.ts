import type { Bucket } from './episodeLibrary';

export type ImpactTier = 'EPISODE_REPLAY' | 'MODERN_ANCHOR' | 'UNMODELLED';

/** Fixed per-bucket tier classification (spec §1) — assigned once by data depth, not re-judged
 *  per episode. europe-equity/emerging-equity sit in UNMODELLED until a modern-era series is
 *  sourced (tracked separately, not blocking this design) even though the Bucket slot exists. */
export const BUCKET_TIER: Record<Bucket, ImpactTier> = {
  'uk-equity': 'EPISODE_REPLAY',
  'us-equity': 'EPISODE_REPLAY',
  'govt-bonds': 'EPISODE_REPLAY',
  'cash': 'EPISODE_REPLAY',
  'property': 'MODERN_ANCHOR',
  'global-equity': 'MODERN_ANCHOR',
  'europe-equity': 'UNMODELLED',
  'emerging-equity': 'UNMODELLED',
};

export type BeliefScenarioName =
  | 'AI Recession' | 'Property Crash' | 'Stagflation' | 'Debt Spiral'
  | 'Tech Burst' | 'Sterling Devaluation' | 'Energy Shock' | 'Rate-Cut Reflation';

export const BELIEF_SCENARIO_NAMES: BeliefScenarioName[] = [
  'AI Recession', 'Property Crash', 'Stagflation', 'Debt Spiral',
  'Tech Burst', 'Sterling Devaluation', 'Energy Shock', 'Rate-Cut Reflation',
];

export interface ScenarioMapping {
  /** cited episodes (episodeLibrary.ts EPISODES ids) — tier-1 replay data */
  episodeIds: string[];
  /** illustrative stress scenarios (stressScenarios.ts ids) — tier-2 anchor data */
  stressScenarioIds: string[];
  /** true for the one benign/upside scenario — no drawdown episode, narrative framing differs (§4) */
  isUpside: boolean;
}

/** Spec §4 belief→impact bridge. Illustrative starting mapping — final editorial pass is a
 *  build-time task per the spec itself, not decided here; the IDs are real and functional now. */
export const BELIEF_SCENARIO_MAPPING: Record<BeliefScenarioName, ScenarioMapping> = {
  'Stagflation': { episodeIds: ['STAGFLATION_1973', 'RATE_SHOCK_2022'], stressScenarioIds: [], isUpside: false },
  'Property Crash': { episodeIds: ['DOTCOM_2000', 'GFC_2008', 'COVID_2020'], stressScenarioIds: ['PROPERTY_DOWNTURN'], isUpside: false },
  'AI Recession': { episodeIds: ['DOTCOM_2000'], stressScenarioIds: ['TECH_CORRECTION'], isUpside: false },
  'Tech Burst': { episodeIds: ['DOTCOM_2000'], stressScenarioIds: ['TECH_CORRECTION'], isUpside: false },
  'Debt Spiral': { episodeIds: ['RATE_SHOCK_2022', 'STAGFLATION_1973'], stressScenarioIds: [], isUpside: false },
  'Sterling Devaluation': { episodeIds: ['RATE_SHOCK_2022', 'STAGFLATION_1973'], stressScenarioIds: [], isUpside: false },
  'Energy Shock': { episodeIds: ['STAGFLATION_1973'], stressScenarioIds: ['RATE_INFLATION_SHOCK'], isUpside: false },
  'Rate-Cut Reflation': { episodeIds: [], stressScenarioIds: [], isUpside: true },
};

/** Spec §5 alignment substrate: hand-authored ideal allocation per belief scenario over the
 *  8-bucket real-data taxonomy — same pattern as computeGap.ts's SCENARIO_PRIORS (S001-S010),
 *  applied to episodeLibrary's taxonomy instead of the fabricated one. Illustrative first pass,
 *  informed by which buckets held up in each scenario's mapped episodes; editorial pass expected
 *  at build time (mirrors the spec's own framing for §4). europe-equity/emerging-equity excluded
 *  (UNMODELLED, never allocated into). */
export const BELIEF_SCENARIO_ALLOCATION_PRIORS: Record<BeliefScenarioName, Partial<Record<Bucket, number>>> = {
  'Stagflation': { 'cash': 0.35, 'govt-bonds': 0.15, 'uk-equity': 0.15, 'us-equity': 0.15, 'global-equity': 0.10, 'property': 0.10 },
  'Property Crash': { 'cash': 0.20, 'govt-bonds': 0.25, 'uk-equity': 0.20, 'us-equity': 0.15, 'global-equity': 0.15, 'property': 0.05 },
  'AI Recession': { 'cash': 0.20, 'govt-bonds': 0.25, 'uk-equity': 0.20, 'us-equity': 0.10, 'global-equity': 0.15, 'property': 0.10 },
  'Tech Burst': { 'cash': 0.15, 'govt-bonds': 0.20, 'uk-equity': 0.20, 'us-equity': 0.10, 'global-equity': 0.20, 'property': 0.15 },
  'Debt Spiral': { 'cash': 0.30, 'govt-bonds': 0.05, 'uk-equity': 0.20, 'us-equity': 0.15, 'global-equity': 0.15, 'property': 0.15 },
  'Sterling Devaluation': { 'cash': 0.15, 'govt-bonds': 0.10, 'uk-equity': 0.10, 'us-equity': 0.25, 'global-equity': 0.25, 'property': 0.15 },
  'Energy Shock': { 'cash': 0.30, 'govt-bonds': 0.15, 'uk-equity': 0.15, 'us-equity': 0.15, 'global-equity': 0.15, 'property': 0.10 },
  'Rate-Cut Reflation': { 'cash': 0.05, 'govt-bonds': 0.10, 'uk-equity': 0.20, 'us-equity': 0.25, 'global-equity': 0.25, 'property': 0.15 },
};
