import { describe, it, expect } from 'vitest';
import { EPISODES } from '../data/episodeLibrary';
import { mixFromHoldings } from './portfolioMix';
import { replayEpisode } from './empiricalEngine';
import { blendEpisodes, readAt } from './episodeBlend';
import { orderEpisodesBySalience } from './episodeSalience';

describe('end-to-end pipeline', () => {
  const holdings = [
    { asset_class: 'equity', region: 'global', value_gbp: 300_000 },
    { asset_class: 'bond', region: 'global', value_gbp: 150_000 },
    { asset_class: 'cash', region: 'uk', value_gbp: 50_000 },
  ];

  it('produces a sane blended read path that never beats the worst observed edge', () => {
    const { mix } = mixFromHoldings(holdings);
    const ordered = orderEpisodesBySalience(EPISODES, { axisScores: { VOLATILITY_AVERSION: 0.6 } });
    // pick two monthly episodes to keep granularity uniform
    const chosen = ordered.filter((e) => e.granularity === 'monthly' && ['GFC_2008', 'COVID_2020'].includes(e.id));
    const replays = chosen.map((e) => replayEpisode(mix, e, 500_000));
    const blend = blendEpisodes(replays, replays.map(() => 1));
    const worst = readAt(blend, 1);
    const typical = readAt(blend, 0);
    for (let t = 0; t < worst.length; t++) {
      expect(worst[t]).toBeGreaterThanOrEqual(blend.band.min[t] - 1e-9); // never beyond observed
      expect(typical[t]).toBeCloseTo(blend.central[t], 10);
    }
  });

  it('drawdown is shallower than a 100% global-equity replay (diversification shows)', () => {
    const { mix } = mixFromHoldings(holdings);
    const gfc = EPISODES.find((e) => e.id === 'GFC_2008')!;
    const mixed = replayEpisode(mix, gfc, 500_000).drawdown;
    const allEquity = replayEpisode(
      { ...mix, 'global-equity': 1, 'govt-bonds': 0, 'cash': 0 } as typeof mix, gfc, 500_000,
    ).drawdown;
    expect(mixed).toBeGreaterThan(allEquity);
  });
});
