import type { EpisodeReplay } from '../empiricalEngine';
import type { Granularity } from '../../data/episodeLibrary';

export interface IncomeRunwayResult {
  survivesWithoutSellingAtTrough: boolean;
  bufferExhaustedAtStep: number | null;
  recoveryStepFromStart: number | null;
  narrative: string;
}

/** Withdrawal-runway-vs-episode-path. Reuses the EpisodeReplay already computed for the tiered
 *  impact narrative — only adds the buffer-depletion walk, not a new portfolio-path simulation.
 *  Pro-ration decided here: annual_essential_spend_gbp as-is per annual step, /12 per monthly step. */
export function computeIncomeRunway(
  replay: EpisodeReplay,
  granularity: Granularity,
  annualEssentialSpendGbp: number,
  liquidCashGbp: number,
  episodeName: string,
): IncomeRunwayResult {
  const spendPerStep = granularity === 'annual' ? annualEssentialSpendGbp : annualEssentialSpendGbp / 12;

  let bufferExhaustedAtStep: number | null = null;
  for (let t = 0; t < replay.points.length; t++) {
    if (liquidCashGbp - spendPerStep * t < 0) { bufferExhaustedAtStep = t; break; }
  }

  const recoveryStepFromStart = replay.recoverySteps === null ? null : replay.troughIndex + replay.recoverySteps;

  const survivesWithoutSellingAtTrough =
    bufferExhaustedAtStep === null
    || (recoveryStepFromStart !== null && bufferExhaustedAtStep >= recoveryStepFromStart);

  const unit = granularity === 'annual' ? 'year' : 'month';
  const narrative = survivesWithoutSellingAtTrough
    ? `At your current spend, your cash buffer would have covered essential spending through the ${episodeName} episode without needing to sell into the trough.`
    : `At your current spend, this episode's path would have used your full cash buffer ${bufferExhaustedAtStep} ${unit}${bufferExhaustedAtStep === 1 ? '' : 's'} in — before the ${episodeName} recovery — meaning you'd have needed to sell into the trough.`;

  return { survivesWithoutSellingAtTrough, bufferExhaustedAtStep, recoveryStepFromStart, narrative };
}
