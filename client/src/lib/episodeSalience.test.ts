import { describe, it, expect } from 'vitest';
import { circumstanceFromIntake, orderEpisodesBySalience } from './episodeSalience';
import { EPISODES } from '../data/episodeLibrary';

describe('circumstanceFromIntake', () => {
  it('flags decumulation when portfolio_stage is a drawdown stage', () => {
    expect(circumstanceFromIntake({ portfolio_stage: 'PRIMARILY_DRAWDOWN', time_horizon_years: '20' }).decumulating).toBe(true);
    expect(circumstanceFromIntake({ portfolio_stage: 'STARTING_DRAWDOWN', time_horizon_years: '20' }).decumulating).toBe(true);
    expect(circumstanceFromIntake({ portfolio_stage: 'ACCUMULATING', time_horizon_years: '20' }).decumulating).toBe(false);
  });
  it('flags short horizon when time_horizon_years parses below 5', () => {
    expect(circumstanceFromIntake({ portfolio_stage: null, time_horizon_years: '3' }).shortHorizon).toBe(true);
    expect(circumstanceFromIntake({ portfolio_stage: null, time_horizon_years: '10' }).shortHorizon).toBe(false);
    expect(circumstanceFromIntake({ portfolio_stage: null, time_horizon_years: '' }).shortHorizon).toBe(false);
  });
});

describe('orderEpisodesBySalience (§7A — chronological within groups, no episode dropped)', () => {
  it('puts episodes matching a >0.20 belief axis first, chronological within each group', () => {
    const ordered = orderEpisodesBySalience(EPISODES, { axisScores: { TECH_TILT: 0.5 } });
    expect(ordered).toHaveLength(EPISODES.length); // nothing dropped
    expect(ordered[0].id).toBe('DOTCOM_2000'); // only salient episode → first
  });
  it('defaults to chronological order when no axis is expressed (not worst-first — P3-2)', () => {
    const ordered = orderEpisodesBySalience(EPISODES, { axisScores: {} });
    const years = ordered.map((e) => e.shortLabel);
    expect(years).toEqual(['1929', '1973', '1987', '2000', '2008', '2020', '2022']);
  });
  it('keeps both the salient group and the rest in chronological order (stable partition)', () => {
    // VOLATILITY_AVERSION is carried by 1929, 1987, 2008, 2020 → those float first in chronological order;
    // the non-salient remainder (1973, 2000, 2022) follows, also chronological.
    const ordered = orderEpisodesBySalience(EPISODES, { axisScores: { VOLATILITY_AVERSION: 0.5 } });
    expect(ordered).toHaveLength(EPISODES.length);
    expect(ordered.map((e) => e.shortLabel)).toEqual(['1929', '1987', '2008', '2020', '1973', '2000', '2022']);
  });
});
