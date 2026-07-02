import type { ScreenHelp } from './types';

export const outlookResultsHelp: ScreenHelp = {
  stepId: 'outlook-results',
  title: 'Outlook results',
  intro: 'How well your actual holdings line up with your stated outlook — scored, flagged, and grounded in named historical episodes wherever the data allows.',
  sections: [
    {
      heading: 'In plain terms',
      blocks: [
        {
          type: 'p',
          text: 'This screen takes the scenario weights from your outlook answers and holds them up against the portfolio you actually entered. It answers three questions: how aligned are your holdings with what you say you expect (the score at the top); where would the pain land if your expected scenarios played out (the per-asset impact rows); and how long could your cash buffer carry your essential spending through the worst of it (the income-runway notes).',
        },
      ],
    },
    {
      heading: 'What you’ll see here',
      blocks: [
        {
          type: 'list',
          items: [
            'An alignment score out of 100 with a band label (Broadly aligned / Partially aligned / Misaligned).',
            'Amber flags when they apply: a concentration warning if one asset class dominates, and a mismatch note if your outlook sits oddly against your stated risk comfort.',
            'Per-asset impact rows, each labelled either "Cited historical replay" (real episode data for that asset) or "Illustrative, anchored to historical episodes" (modelled, clearly marked as such).',
            'Income-runway notes: for your highest-weighted downside scenario, how many months of essential spending your liquid buffer would have covered along that episode’s actual path.',
            'A "Not modelled" panel listing holdings we deliberately exclude (e.g. emerging-market equity, alternatives) with their values — excluded because no reliable long-run history exists, not hidden.',
          ],
        },
      ],
    },
    {
      heading: 'What happens underneath',
      blocks: [
        {
          type: 'p',
          text: 'Your holdings are converted to percentage weights over the six modelled asset classes (UK, US and global equity, government bonds, property, cash), renormalised so the excluded classes don’t distort the sums. A target-style allocation is blended from your scenario weights, and the distance between the two — plus a concentration measure — produces the score.',
        },
        {
          type: 'p',
          text: 'For the impact rows, your top-weighted downside scenarios are mapped to named historical episodes. Where an asset class has a real recorded path through an episode, we cite it directly: the deepest fall and how long recovery took (or that it never recovered within the recorded window). Where it doesn’t, we anchor an illustrative shock to comparable episodes and label it as illustrative. The runway notes replay the episode path against your portfolio value, essential annual spend and liquid cash, month by month.',
        },
        {
          type: 'note',
          text: 'If the previous screen flagged insufficient signal, none of this is computed — this screen says so plainly and lets you go back or continue without the view.',
        },
      ],
    },
    {
      heading: 'The rules we apply',
      kind: 'rules',
      blocks: [
        {
          type: 'list',
          items: [
            'Only the six modelled asset classes are scored; everything else moves to the "Not modelled" panel with its value shown.',
            'Impact rows cite only your top three downside scenarios, and only those carrying meaningful weight (above 5%); upside scenarios never generate crash citations.',
            'An episode is only cited for an asset if it actually moved in that episode — near-zero dips are not dressed up as impacts.',
            'Each episode is cited at most once per asset row, even when several of your scenarios point at the same episode.',
            'The concentration flag fires when a single modelled asset class exceeds 35% of the modelled portfolio.',
          ],
        },
      ],
    },
    {
      heading: 'What this feeds into',
      blocks: [
        {
          type: 'list',
          items: [
            'Illustrative alternatives — the next screen simulates one way to reduce the gaps this screen surfaces.',
            'Nothing here changes your data; it is a read-only lens over what you already entered.',
          ],
        },
      ],
    },
    {
      heading: 'Worth scrutinising',
      kind: 'scrutinise',
      blocks: [
        {
          type: 'list',
          items: [
            'The score blends cited historical data with illustrative assumptions, and the caption says so — but a single number can still read as more precise than it is.',
            'The 35% concentration threshold and the alignment bands are calibration choices, not market facts.',
            'The runway notes assume the essential-spend figure you entered at Intake is accurate; an understated figure makes every episode look more survivable than it would be.',
            'Past episodes are context, not forecasts — the deepest historical fall is neither a floor nor a ceiling for the next one.',
          ],
        },
      ],
    },
  ],
};
