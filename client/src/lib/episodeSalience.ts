import type { AxisCode, PortfolioStage } from '../state/onboardingV2Store';
import { type Episode } from '../data/episodeLibrary';

const TOWARDS_THRESHOLD = 0.2; // matches scenarioStressSalience.ts

export interface SalienceInput { axisScores: Partial<Record<AxisCode, number>>; }

export interface Circumstance { decumulating: boolean; shortHorizon: boolean; }

/** Derive the §7A circumstance from existing intake fields — no new question for v1. */
export function circumstanceFromIntake(input: {
  portfolio_stage: PortfolioStage; time_horizon_years: string;
}): Circumstance {
  const decumulating = input.portfolio_stage === 'STARTING_DRAWDOWN' || input.portfolio_stage === 'PRIMARILY_DRAWDOWN';
  const years = parseInt(input.time_horizon_years, 10);
  const shortHorizon = Number.isFinite(years) && years > 0 && years < 5;
  return { decumulating, shortHorizon };
}

function isSalient(ep: Episode, input: SalienceInput): boolean {
  return ep.beliefSalience.some((axis) => (input.axisScores[axis] ?? 0) > TOWARDS_THRESHOLD);
}

/** Stable partition: salient episodes first, chronological (input EPISODES order) within each group.
 *  No episode is dropped (P3-2). EPISODES is authored chronologically. */
export function orderEpisodesBySalience(episodes: Episode[], input: SalienceInput): Episode[] {
  const salient: Episode[] = [];
  const rest: Episode[] = [];
  for (const ep of episodes) (isSalient(ep, input) ? salient : rest).push(ep);
  return [...salient, ...rest];
}
