// CONTENT-BRAIN-GATE: provisional voice — replace via Unlock content brain + FCA checker before prod (§13).

export interface StageCopy {
  stage: 1 | 2 | 3 | 4;
  title: string;
  leadIn: string;
  complianceCaption: string;
  worthSittingWith: string; // symmetric behavioural beat — panic AND complacency (P1-6)
}

export const STAGE_COPY: StageCopy[] = [
  {
    stage: 1,
    title: 'The stress test',
    leadIn: 'This is the actual path those assets took during this episode, mapped onto your holdings — the fall and the recovery together.',
    complianceCaption: 'This is what history recorded, not a prediction. Future episodes can differ, and losses can exceed what is shown here.',
    worthSittingWith: 'Two reactions both tend to backfire: selling at the trough locks in the fall, and assuming the line always climbs back ignores how long some recoveries took.',
  },
  {
    stage: 2,
    title: 'Across history',
    leadIn: 'The same holdings, read across each recorded episode, in time order — each pairing the deepest fall with how long the recovery took.',
    complianceCaption: 'Each figure traces to a cited historical series. This is a record of the past, not a prediction of the next downturn.',
    worthSittingWith: 'Episodes rhyme, they do not repeat. A fast recovery in one episode is not a promise about another; a slow one is not a verdict on the future.',
  },
  {
    stage: 3,
    title: 'Tune it',
    leadIn: 'Combine episodes to see the range they reached together, then read anywhere between the typical and the worst edge those episodes actually hit.',
    complianceCaption: 'The band is the best and worst these selected episodes reached — not a prediction, and future losses can exceed this edge.',
    worthSittingWith: 'Reading at the worst edge shows the deepest point markets reached here. It is a record, not a floor — and not a forecast of the next one.',
  },
  {
    stage: 4,
    title: 'Compare mixes',
    leadIn: 'The same episodes, read against an alternative composition, shown as a neutral comparison across episodes.',
    complianceCaption: 'A comparison of how two compositions behaved in the recorded past — not a prediction, and not a comparison of merit.',
    worthSittingWith: 'A composition that fell less in one episode fell more in another. The trade-off runs both ways across the set.',
  },
];

export const NARRATIVE_FALLACY_NOTE =
  'Episode labels describe these particular episodes, not a taxonomy of the next downturn — episodes rhyme, they do not repeat.';

export const TARGET_MARKET =
  'This view is for self-directed investors exploring how their own holdings behaved across historical periods of stress.';

// §10 / P1-6 / P1-7 — foregrounded for short-horizon / decumulating users: a multi-year recovery
// may outlast the window they have, and an investor drawing income realises the fall permanently.
export const RECOVERY_COUNTER_BEAT =
  'Some of these recoveries took many years. For someone drawing on this money, or with a short horizon, ' +
  'the time spent below the starting point matters as much as the depth of the fall — a recovery that arrives ' +
  'after the money is needed arrives too late.';

// Outcome-4 advice pointer (§9 / P2-5) — neutral, non-promotional.
export const ADVICE_EXIT =
  'Decisions about your own portfolio, in light of your full circumstances, are where regulated financial advice is the right place to turn.';
