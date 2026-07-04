import type { SafetyLightType } from '../data/safetyLightPerspectives';
import type { SafetyLightsResult, SafetyLightResponseState, TiltsGateReason } from '../state/onboardingV2Store';

export interface TiltsGateResult {
  tiltsAllowed: boolean;
  gateReason: TiltsGateReason;
}

const LIGHT_TO_REASON: Record<SafetyLightType, TiltsGateReason> = {
  liquidity: 'RED_LIQUIDITY',
  concentration: 'RED_CONCENTRATION',
  illiquids: 'RED_ILLIQUIDS',
};

/**
 * When `selfPlacementEnabled` is false, this is byte-for-byte the original rule:
 * any RED light blocks tilts, with the specific reason if there's exactly one.
 * When true, a RED light only stays blocking if the investor has not self-placed
 * as HOLD_DELIBERATE for that specific light — every currently-RED light must be
 * individually addressed (see Intelligence/decisions/2026-07-04-belief-tilt-red-gate-softening-V1.md
 * for why REDUCE/UNSURE both leave the block in place rather than partially unlocking).
 */
export function computeTiltsGate(
  lights: Pick<SafetyLightsResult, 'liquidity' | 'concentration' | 'illiquids'>,
  selfPlacement: SafetyLightResponseState,
  selfPlacementEnabled: boolean,
): TiltsGateResult {
  const redLights = (Object.keys(LIGHT_TO_REASON) as SafetyLightType[]).filter((l) => lights[l] === 'RED');

  const gateReason: TiltsGateReason =
    redLights.length === 0 ? 'NO_RED_FLAGS'
    : redLights.length === 1 ? LIGHT_TO_REASON[redLights[0]]
    : 'MULTIPLE_RED_FLAGS';

  if (redLights.length === 0) {
    return { tiltsAllowed: true, gateReason };
  }

  if (!selfPlacementEnabled) {
    return { tiltsAllowed: false, gateReason };
  }

  const allAcknowledged = redLights.every((l) => selfPlacement.responses[l]?.stance === 'HOLD_DELIBERATE');
  return { tiltsAllowed: allAcknowledged, gateReason };
}
