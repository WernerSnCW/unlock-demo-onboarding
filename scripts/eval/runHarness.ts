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
  caveats: string[];
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
 * staged-rebalance call below uses the CURRENT mix as its own target (targetMix = currentMix).
 * The real belief-driven target-mix construction (blendBeliefAllocation, in computeAlignment.ts)
 * returns a Mix keyed over all 8 episodeLibrary BUCKETS (uk/us/europe/emerging/global equity,
 * govt-bonds, property, cash), zero-filled for the 2 UNMODELLED buckets (europe/emerging equity).
 * buildBeliefActions/computeStagedRebalance only reads the 6-key BELIEF_MODELLED_BUCKETS subset,
 * so wiring blendBeliefAllocation's real output straight in would compile fine (both are loosely
 * typed Record<string, number>) but its 2 extra keys would be silently ignored by the rebalance
 * engine — not a type error, a silent-truncation risk worth deciding on deliberately rather than
 * wiring in without review. Skipping that wiring is out of scope for "call all pure functions per
 * profile" — it belongs to whichever task actually wires the alternatives/tilts engine end to end.
 * Passing targetMix = currentMix here means stagedRebalance.staged.stage1/stage2 will be empty (no
 * change needed) for most profiles; downstream consumers (e.g. a judge prompt) must not read this
 * as "the engine recommended zero rebalancing action" — it reflects a stubbed target, not a real one.
 */
export function runProfileThroughPipeline(profile: GeneratedProfile): ProfileRunResult {
  // cash and spend are both derived from the profile's actual cash holding and its
  // independently-sampled cash_runway_months (see generateProfiles.ts), NOT a flat percentage of
  // total_portfolio_value_gbp — a flat-rate spend would make cash_runway_months scale-invariant
  // (collapsing to a constant ~30 or ~90 months regardless of wealth tier or trouble zone) and
  // structurally defeat the liquidity safety light. See the fix commit for the empirical finding.
  const cashHoldingGBP = profile.holdings.find((h) => h.asset_class === 'cash')?.value_gbp ?? 0;
  const intendedRunwayMonths = profile.investorProfile.cash_runway_months;
  const intake: Intake = {
    cash: cashHoldingGBP,
    spend: intendedRunwayMonths > 0 ? Math.round((cashHoldingGBP * 12) / intendedRunwayMonths) : 0,
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

  // targetMix is built from the same `mix` spread as currentMix (see the "Known harness
  // limitation" doc comment above), so compare by value, not by reference — the two are always
  // distinct object instances but always equal in content given the harness's current stub.
  const caveats: string[] = [];
  const targetEqualsCurrentMix =
    Object.keys(targetMix).length === Object.keys(currentMix).length &&
    Object.entries(targetMix).every(([key, value]) => currentMix[key] === value);
  if (targetEqualsCurrentMix) {
    caveats.push(
      'stagedRebalance target mix equals current mix (belief-driven target-mix construction not wired in this harness) — do not read an empty stagedRebalance as a real zero-action recommendation',
    );
  }

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
    caveats,
  };
}
