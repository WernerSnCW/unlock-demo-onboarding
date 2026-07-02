import type { ScreenHelp } from './types';

export const outlookHelp: ScreenHelp = {
  stepId: 'outlook',
  title: 'Your outlook',
  intro: 'Fifteen statements about the world — not your portfolio — that we turn into a weighted view of which market scenarios you consider most plausible.',
  sections: [
    {
      heading: 'In plain terms',
      blocks: [
        {
          type: 'p',
          text: 'The earlier Beliefs step asked how you like to invest. This one asks what you think will happen in the world — job security, government policy, AI adoption, housing, currency, credit. Your agreement or disagreement with each statement is mapped to a set of named market scenarios (a stagflation episode, a property crash, a rates shock, and so on), producing a weighting of which scenarios your outlook points towards.',
        },
      ],
    },
    {
      heading: 'What you’ll see here',
      blocks: [
        {
          type: 'list',
          items: [
            'Fifteen statements (B1–B15), each answered on a five-point scale from Strongly Disagree to Strongly Agree.',
            'A running count of how many you have answered; all fifteen are required before you can continue.',
            'If you try to continue with gaps, each unanswered question is highlighted individually so you don’t have to hunt for it.',
          ],
        },
      ],
    },
    {
      heading: 'What happens underneath',
      blocks: [
        {
          type: 'p',
          text: 'Each statement contributes evidence for or against particular scenarios. A strong agreement pushes weight towards the scenarios that statement is linked to; a strong disagreement pushes weight away; Neutral contributes nothing. Contributions are combined per scenario, clamped so no single answer can dominate a scenario on its own, and then the weights are normalised so they sum to one.',
        },
        {
          type: 'note',
          text: 'If your answers are mostly neutral and cancel out, the tool does not force a view: it flags "insufficient signal" and the next screen says so honestly instead of modelling on noise.',
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
            'Eight named scenarios carry the weights (e.g. Stagflation, Property Crash, Rate-Cut Reflation); each question feeds a fixed subset of them.',
            'Contributions are clamped at scenario level before normalising — one emphatic answer cannot single-handedly define your outlook.',
            'Neutral answers add nothing; a mostly-neutral response set trips the insufficient-signal fallback rather than producing an arbitrary weighting.',
            'All fifteen answers are required; there is no partial scoring.',
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
            'Outlook results — your scenario weights are compared against your actual holdings to produce the alignment score and the per-asset impact view.',
            'Illustrative alternatives — the same weights build the illustrative target mix that the rebalancing simulation steers towards.',
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
            'The question-to-scenario mapping is a fixed, hand-authored table. Do the linkages read as reasonable — does agreeing that "credit is getting harder to obtain" really point at the scenarios we link it to?',
            'Five answer levels compress a lot of nuance. Someone 60/40 on a statement has to pick a side or go Neutral.',
            'The statements are about the next few years; the historical episodes they map to are decades old. The bridge between the two is a judgement call worth challenging.',
          ],
        },
      ],
    },
  ],
};
