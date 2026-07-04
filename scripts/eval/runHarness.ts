// Harness runner (Task 5): calls all onboarding-v2 pure engine functions for a single generated
// profile and assembles the results into one ProfileRunResult, so later tasks (judge prompts,
// calibration reports) have one call per profile instead of re-deriving the pipeline.
//
// Every import below was verified against the real source files before writing this — see the
// commit message / task report for the discrepancy list against the plan's starting sketch.
import { computeSafetyLights, type Intake, type SafetyLightsResult } from '../../server/services/analysis';
import { computePersona, type PersonaResult } from '../../server/services/personaEngine';
import { scoreOutlookBeliefs, type ScoreOutlookResult } from '../../client/src/lib/beliefImpact/scoreOutlook';
import { computeAlignment, type AlignmentResult } from '../../client/src/lib/beliefImpact/computeAlignment';
import { computeTieredImpact, type TieredImpactResult } from '../../client/src/lib/beliefImpact/computeTieredImpact';
import { buildBeliefActions } from '../../server/lib/actions/beliefActionsEngine';
import type { StagedRebalanceResult } from '../../server/lib/actions/stagedRebalance';
import { mixFromHoldings } from '../../client/src/lib/portfolioMix';
import { computeTiltsGate, type TiltsGateResult } from '../../client/src/lib/tiltsGate';
import type { SafetyLightResponseState } from '../../client/src/state/onboardingV2Store';
import type { SafetyLightType } from '../../client/src/data/safetyLightPerspectives';
import { computeBeliefTiltProfile, type BeliefTiltProfileResult } from './beliefTiltProfile';
import type { GeneratedProfile } from './generateProfiles';

export interface ProfileRunResult {
  profileId: string;
  shapeId: string;
  troubleZoneId: string;
  safetyLights: SafetyLightsResult;
  tiltsGate: TiltsGateResult;
  persona: PersonaResult;
  beliefTiltProfile: BeliefTiltProfileResult;
  outlookScore: ScoreOutlookResult;
  alignment: AlignmentResult;
  tieredImpact: TieredImpactResult;
  stagedRebalance: StagedRebalanceResult;
}

const ALL_LIGHTS: SafetyLightType[] = ['liquidity', 'concentration', 'illiquids'];

/** Builds the self-placement response state computeTiltsGate expects. A profile with no stance
 *  (undefined) or explicitly 'NO_RESPONSE' produces an empty responses map — computeTiltsGate then
 *  treats every RED light as un-acknowledged, correctly keeping the gate closed. */
function buildSafetyLightResponseState(profile: GeneratedProfile): SafetyLightResponseState {
  if (!profile.safetyLightStance || profile.safetyLightStance === 'NO_RESPONSE') {
    return { version: '1.0', responses: {} };
  }
  const stance = profile.safetyLightStance;
  const now = new Date().toISOString();
  const responses: SafetyLightResponseState['responses'] = {};
  for (const light of ALL_LIGHTS) {
    responses[light] = { stance, responded_at: now };
  }
  return { version: '1.0', responses };
}

/**
 * Runs one generated profile through every pure onboarding-v2 engine function and assembles the
 * results. Known harness limitation (flagged for the later judge-prompt task, not hidden): the
 * staged-rebalance call below uses the CURRENT mix as its own target (targetMix = currentMix),
 * because the belief-driven target-mix construction (blendBeliefAllocation, in computeAlignment.ts)
 * produces a vector over MODELLED_BUCKETS (the 8-bucket episodeLibrary taxonomy: uk-equity,
 * us-equity, europe-equity, emerging-equity, global-equity, govt-bonds, property, cash), while
 * buildBeliefActions/computeStagedRebalance operates over BELIEF_MODELLED_BUCKETS (a distinct
 * 6-bucket set: uk-equity, us-equity, global-equity, govt-bonds, property, cash — no europe/emerging
 * split). Wiring the real belief-derived target mix into the rebalance call requires reconciling
 * those two bucket sets, which is out of scope for "call all pure functions per profile" — that
 * reconciliation belongs to whichever task actually wires the alternatives/tilts engine end to end.
 * Passing targetMix = currentMix here means stagedRebalance.staged.stage1/stage2 will be empty (no
 * change needed) for most profiles; downstream consumers (e.g. a judge prompt) must not read this
 * as "the engine recommended zero rebalancing action" — it reflects a stubbed target, not a real one.
 */
export function runProfileThroughPipeline(profile: GeneratedProfile): ProfileRunResult {
  const intake: Intake = {
    cash: profile.holdings.find((h) => h.asset_class === 'cash')?.value_gbp ?? 0,
    spend: Math.round(profile.investorProfile.total_portfolio_value_gbp * 0.04),
    largest_line_pct: profile.investorProfile.largest_line_pct,
    illiquid_pct: profile.investorProfile.illiquid_pct,
  };
  const safetyLights = computeSafetyLights(intake);

  const persona = computePersona({
    ...profile.investorProfile,
    liquidity_status: safetyLights.liquidity,
    concentration_status: safetyLights.concentration,
    illiquids_status: safetyLights.illiquids,
  });

  const tiltsGate = computeTiltsGate(
    { liquidity: safetyLights.liquidity, concentration: safetyLights.concentration, illiquids: safetyLights.illiquids },
    buildSafetyLightResponseState(profile),
    true,
  );

  const beliefTiltProfile = computeBeliefTiltProfile(profile.beliefTiltAnswers);

  const outlookScore = scoreOutlookBeliefs(profile.outlookAnswers);

  const { mix } = mixFromHoldings(profile.holdings);
  const alignment = computeAlignment(mix, outlookScore.scenarioWeights, profile.investorProfile.risk_comfort);

  const tieredImpact = computeTieredImpact(mix, profile.holdings, outlookScore.scenarioWeights, profile.investorProfile.total_portfolio_value_gbp);

  // See the "Known harness limitation" note in this function's doc comment above.
  const currentMix: Record<string, number> = { ...mix };
  const targetMix: Record<string, number> = { ...mix };
  const stagedRebalance = buildBeliefActions({
    currentMix,
    targetMix,
    portfolioValueGBP: profile.investorProfile.total_portfolio_value_gbp,
  });

  return {
    profileId: profile.id,
    shapeId: profile.shapeId,
    troubleZoneId: profile.troubleZoneId,
    safetyLights,
    tiltsGate,
    persona,
    beliefTiltProfile,
    outlookScore,
    alignment,
    tieredImpact,
    stagedRebalance,
  };
}
