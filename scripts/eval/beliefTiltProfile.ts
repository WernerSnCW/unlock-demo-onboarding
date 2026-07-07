// Mirrors client/src/state/onboardingV2Store.ts's computeBeliefsScores axis-scoring logic
// (lines 1063-1097) as a standalone pure function, so the eval harness can exercise the
// belief-tilt-questions -> axis-scores -> tilt-profile dimension without a Zustand store.
//
// The store's computeBeliefsScores does NOT call normaliseAnswer directly: it reads a
// pre-normalised value off state.beliefs.responses[qId].normalised (set earlier by
// setBeliefResponse, onboardingV2Store.ts:971-983, which calls normaliseAnswer(answer) once
// at answer-time). Since this harness starts from raw 1-5 answers (BeliefTiltAnswers) rather
// than a populated responses map, calling normaliseAnswer(answer) directly per field here is
// equivalent to the store's getResponse(qId) = responses[qId]?.normalised ?? 0.
//
// normaliseAnswer and computeDirection are re-exported as-is from the store (already pure,
// already exported) — only computeIntensity's private logic is duplicated here verbatim, since
// the store does not export it.
import { normaliseAnswer, computeDirection, type AxisCode, type TiltDirection, type TiltIntensity } from '../../client/src/state/onboardingV2Store';
import type { BeliefTiltAnswers } from './generateProfiles';

export interface BeliefTiltProfileEntry {
  axis_code: AxisCode;
  direction: TiltDirection;
  intensity: TiltIntensity;
  score: number;
}

export interface BeliefTiltProfileResult {
  axisScores: Record<AxisCode, number>;
  tiltProfile: BeliefTiltProfileEntry[];
}

const ALL_AXES: AxisCode[] = [
  'QUALITY_TILT', 'VALUE_TILT', 'TECH_TILT', 'UK_BIAS',
  'ESG_TILT', 'INFLATION_HEDGE_TILT', 'SMALL_CAP_TILT', 'VOLATILITY_AVERSION',
];

/** Verbatim copy of onboardingV2Store.ts's private computeIntensity (line 602) — not exported
 *  by the store, so duplicated here rather than modifying product code for this eval harness. */
function computeIntensity(score: number): TiltIntensity {
  const abs = Math.abs(score);
  if (abs >= 0.80) return 'STRONG';
  if (abs >= 0.50) return 'MODERATE';
  if (abs >= 0.20) return 'LIGHT';
  return 'NEUTRAL';
}

export function computeBeliefTiltProfile(answers: BeliefTiltAnswers): BeliefTiltProfileResult {
  const axisScores: Record<AxisCode, number> = {
    QUALITY_TILT: normaliseAnswer(answers.Q_QUALITY),
    VALUE_TILT: normaliseAnswer(answers.Q_VALUE),
    TECH_TILT: normaliseAnswer(answers.Q_TECH),
    UK_BIAS: normaliseAnswer(answers.Q_UK_BIAS),
    ESG_TILT: normaliseAnswer(answers.Q_ESG),
    INFLATION_HEDGE_TILT: normaliseAnswer(answers.Q_INFLATION),
    SMALL_CAP_TILT: normaliseAnswer(answers.Q_SMALL_CAP),
    VOLATILITY_AVERSION: -normaliseAnswer(answers.Q_VOLATILITY_COMFORT),
  };

  const tiltProfile: BeliefTiltProfileEntry[] = ALL_AXES.map((axis) => ({
    axis_code: axis,
    direction: computeDirection(axisScores[axis]),
    intensity: computeIntensity(axisScores[axis]),
    score: axisScores[axis],
  }));

  return { axisScores, tiltProfile };
}
