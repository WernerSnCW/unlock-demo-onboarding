import type { ScreenHelp } from './types';

export const holdingsHelp: ScreenHelp = {
  stepId: 'holdings',
  title: 'Holdings',
  intro: 'Where you list what you actually own, so the analysis works from real numbers.',
  sections: [
    {
      heading: 'In plain terms',
      blocks: [
        {
          type: 'p',
          text: 'This is your portfolio, entered line by line. Each row is one thing you hold — a fund, a share, cash, a property — with its value and which account (or "wrapper") it sits in. As you type, the panel at the top keeps a running summary so you can see the shape of the portfolio taking form.',
        },
      ],
    },
    {
      heading: 'What you’ll do here',
      blocks: [
        {
          type: 'list',
          items: [
            'For each holding, give it a name, choose its wrapper (ISA, SIPP, GIA, cash, offshore bond, other), its asset class (equity, bond, cash, property, alternatives, other) and its value.',
            'Optionally open a row’s details to add a ticker, region, currency, cost basis, purchase date and notes.',
            'Add or remove rows as needed. You need at least one holding with a value above zero to continue.',
          ],
        },
        {
          type: 'note',
          text: 'If you enter a cost basis, we show the [[unrealised gain|summary-unrealised-gain]] on that line — useful later when the plan considers tax wrappers.',
        },
      ],
    },
    {
      heading: 'What happens underneath',
      blocks: [
        {
          type: 'p',
          text: 'The summary tiles update live from the rows you have entered:',
        },
        {
          type: 'list',
          items: [
            '[[Total value|summary-total-value]] is simply the sum of every holding’s value.',
            '[[Largest holding|summary-concentration]] is your biggest single line as a percentage of the total — a concentration check.',
            '[[Illiquid share|summary-illiquid]] is the percentage of the portfolio in things you have marked as hard to sell quickly.',
            'The [[Safety Lights status|summary-safety-status]] tile previews the green/amber/red verdict you’ll see in full on the Analysis screen.',
          ],
        },
        {
          type: 'p',
          text: 'Changing any holding clears the previous analysis, so the next screen always reflects exactly what is on this one.',
        },
      ],
    },
    {
      heading: 'The rules we apply',
      kind: 'rules',
      blocks: [
        {
          type: 'p',
          text: 'The colour on the concentration and liquidity tiles uses the same thresholds as the full safety check:',
        },
        {
          type: 'list',
          items: [
            'Concentration (largest single holding): green up to 15%, amber from 15% to 20%, red above 20%.',
            'Illiquid share: green up to 7%, amber from 7% to 10%, red above 10%.',
            'Unrealised gain is only shown where you provide both a value and a cost basis; it is value minus cost.',
            'Only holdings with a value above zero count towards the totals.',
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
            'Analysis — the totals here drive two of the three Safety Lights (concentration and illiquids) and the allocation breakdown behind your investor type.',
            'Scenarios & the historical stress lens — your asset-class and region mix is what we shift (illustratively) and what we replay against past market episodes.',
            'Wrappers & the report — holdings are grouped by account type to show how your money is spread across tax wrappers.',
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
            'Marking a holding as "illiquid" is a manual judgement here — there is no automatic classification. Is that the right level of user responsibility?',
            'The concentration check looks at the single largest line, not grouped exposure (e.g. several funds all holding the same mega-cap). Is single-line concentration a sufficient measure?',
            'Values are entered by hand and taken at face value; nothing is priced or verified against a market feed in this demo.',
          ],
        },
      ],
    },
  ],
};
