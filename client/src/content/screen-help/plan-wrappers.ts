import type { ScreenHelp } from './types';

export const planWrappersHelp: ScreenHelp = {
  stepId: 'plan-wrappers',
  title: 'Wrappers',
  intro: 'How your money is spread across account types — and why the wrapper matters as much as the investment.',
  sections: [
    {
      heading: 'In plain terms',
      blocks: [
        {
          type: 'p',
          text: 'A "wrapper" is the type of account an investment sits inside — an ISA, a pension (SIPP), a general account (GIA), cash, an offshore bond. The same fund behaves very differently for tax, access and flexibility depending on its wrapper. This screen shows how your current holdings are distributed across wrappers and explains the role each one plays. It is illustrative context, not personalised tax advice.',
        },
      ],
    },
    {
      heading: 'What you’ll see here',
      blocks: [
        {
          type: 'list',
          items: [
            'A row per wrapper you hold, with its value, share of the total, number of holdings, and a plain description of its role (tax-sheltered, pension, taxable, liquidity, tax-deferred).',
            'Wrappers ordered by a policy priority, so the most tax-efficient homes appear first.',
            'A "Bed & ISA" note if you hold gains in a taxable account that might be candidates for moving into an ISA.',
            'A red-lock banner if a red safety light is present, and an amber note if you have no holdings to show.',
          ],
        },
      ],
    },
    {
      heading: 'What happens underneath',
      blocks: [
        {
          type: 'p',
          text: 'Your holdings are grouped by their wrapper field and summed, then sorted using a policy-defined priority order. Each wrapper is given a standard label and role description. Separately, we look for holdings in a general (taxable) account whose gain is above a policy trigger — those are flagged as potential "Bed & ISA" candidates (a common way to shelter existing gains).',
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
            'Wrapper ordering follows a policy priority list; anything not in the list is grouped as "other".',
            'Each wrapper’s share is its value ÷ the total portfolio value.',
            'A holding is a Bed & ISA candidate only if it is in a general account, has a positive value, has a recorded cost basis, and its unrealised gain is above the policy trigger amount.',
            'Labels and roles are fixed descriptions — the ordering and thresholds are explicitly "illustrative, not personalised advice".',
          ],
        },
      ],
    },
    {
      heading: 'What this feeds into',
      blocks: [
        {
          type: 'p',
          text: 'This is the last content screen before the report. The wrapper breakdown and any Bed & ISA flag are carried into the final snapshot, which consolidates everything you have seen.',
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
            'Wrapper priority is a single fixed order. In reality the "best" wrapper depends on the person’s tax position — is a generic priority helpful or potentially misleading?',
            'Bed & ISA is surfaced as a concept from a simple gain threshold, with no view on allowances used or the individual’s wider tax position. Is flagging it here appropriate, or does it stray towards advice?',
            'The role descriptions are simplified (e.g. pension access ages, ISA limits) — accurate enough for orientation, but not a substitute for current rules.',
          ],
        },
      ],
    },
  ],
};
