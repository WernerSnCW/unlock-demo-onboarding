import type { ScreenHelp } from './types';

export const outlookAlternativesHelp: ScreenHelp = {
  stepId: 'outlook-alternatives',
  title: 'Illustrative alternatives',
  intro: 'One simulated, staged way to move your portfolio towards your outlook — explicitly a simulation, never a recommendation.',
  sections: [
    {
      heading: 'In plain terms',
      blocks: [
        {
          type: 'p',
          text: 'The previous screen showed where your holdings and your outlook diverge. This one simulates a single illustrative way to close some of that gap: a staged set of moves from your current mix towards a mix blended from your scenario weights. It exists to make the gap concrete — roughly what would have to move, in what order, and what the churn might cost — not to tell you what to do.',
        },
      ],
    },
    {
      heading: 'What you’ll see here',
      blocks: [
        {
          type: 'list',
          items: [
            'A summary line: estimated turnover in percentage points and an indicative cost as a fraction of the modelled portfolio.',
            '"How this was staged" — the plain-English playbook behind the moves (liquidity first, largest reductions and additions, what got deferred, what got dropped as noise).',
            'Stage 1 — liquid moves: trims and additions in tradable assets, each with its percentage-point change and approximate pound value.',
            'Stage 2 — illiquid moves, deferred: changes involving property, held back for a later review rather than assumed immediate.',
            'A non-advice notice above the results and a compliance caption below them — both deliberate and load-bearing.',
          ],
        },
      ],
    },
    {
      heading: 'What happens underneath',
      blocks: [
        {
          type: 'p',
          text: 'Your holdings are converted to weights over the six modelled asset classes and renormalised, so the simulation compares like with like against the outlook-blended target. A staging engine then works out the difference per asset class and orders the moves: the cash floor is topped up first, funded by trimming growth-leaning assets in a fixed donor order; remaining gaps become Stage 1 moves if the asset is liquid; anything involving property is deferred to Stage 2. Stage 1 is kept self-funding — additions are scaled to what the trims release.',
        },
        {
          type: 'note',
          text: 'If your outlook produced insufficient signal, this screen refuses to simulate at all — a target built from no signal would just mean "sell everything", which is noise, not analysis.',
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
            'A 10% liquidity floor is restored before any other move; cash is the only bucket that counts towards it.',
            'Moves smaller than 0.5 percentage points are dropped as noise; Stage 1 is capped at six moves.',
            'Property is always deferred to Stage 2 — the simulation never assumes an illiquid asset can be sold on demand.',
            'Asset classes we don’t model (e.g. emerging-market equity, alternatives) are never bought or sold by the simulation.',
            'Indicative costs use fixed, illustrative friction rates per asset class — property expensive, cash free, listed assets in between.',
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
            'Next steps — the flow continues to the summary and action-plan screen; nothing from this simulation is saved to your data or carried forward as a plan.',
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
            'This is one illustrative path, not an optimised one — a different donor order or floor would produce a different, equally defensible staging.',
            'The friction rates behind the cost estimate are assumptions, not quotes; real dealing costs, spreads and tax will differ.',
            'The target mix inherits every judgement call embedded in the outlook mapping — errors upstream flow straight into these numbers.',
            'The simulation ignores tax wrappers, capital-gains consequences and timing; the compliance caption points at regulated advice for exactly that reason.',
          ],
        },
      ],
    },
  ],
};
