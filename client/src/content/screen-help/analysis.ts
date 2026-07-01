import type { ScreenHelp } from './types';

export const analysisHelp: ScreenHelp = {
  stepId: 'analysis',
  title: 'Analysis',
  intro: 'The first read of your position: three safety checks and the investor type they point to.',
  sections: [
    {
      heading: 'In plain terms',
      blocks: [
        {
          type: 'p',
          text: 'This screen is read-only — you are not entering anything, you are seeing what your intake and holdings add up to. It has two halves. First, the Safety Lights: three simple green / amber / red checks on the structural health of your portfolio. Second, your investor type ("persona"): a plain description of the kind of investor your numbers suggest, with the traits and risks that come with it.',
        },
      ],
    },
    {
      heading: 'What you’ll see here',
      blocks: [
        {
          type: 'list',
          items: [
            'An [[overall status|overall-status-banner]] banner — the worst of the three lights, because one red is enough to warrant caution.',
            'Three lights: [[Liquidity|safety-light-liquidity]] (do you hold enough accessible cash?), [[Concentration|safety-light-concentration]] (is too much in one holding?), and [[Illiquids|safety-light-illiquids]] (is too much hard to sell?).',
            'Your [[investor type|persona-card]], with a one-line description, why it fits, your [[portfolio traits|portfolio-traits-list]], the [[risks to watch|risks-list]], and a set of [[profile indicators|indicators-grid]] scored 0–100.',
            'A [[preferences gate|tilts-banner]] telling you whether your beliefs will be allowed to influence the later scenarios.',
          ],
        },
      ],
    },
    {
      heading: 'What happens underneath',
      blocks: [
        {
          type: 'p',
          text: 'The Liquidity light is a cash-runway sum: your accessible cash divided by your monthly essential spending gives the number of months you could cover from cash alone.',
        },
        {
          type: 'p',
          text: 'Concentration and Illiquids come straight from your holdings — your largest single line as a share of the total, and the share you marked illiquid.',
        },
        {
          type: 'p',
          text: 'The investor type is not picked from a dropdown — it is derived. We score you on six underlying traits (risk appetite, alternatives bias, property bias, liquidity comfort, income orientation, and a complexity measure), each between 0 and 1, blended from your answers and your actual allocation. A few strong signals act as direct overrides — for example, a dominant private business points to a "founder" type, a large property share to a "property-led" type, and a large crypto band to an "alternatives-focused" type. Otherwise the six trait scores are matched against a table of eight investor types and the closest match wins.',
        },
      ],
    },
    {
      heading: 'The rules we apply',
      kind: 'rules',
      blocks: [
        {
          type: 'p',
          text: 'Safety Light thresholds (from the policy defaults):',
        },
        {
          type: 'list',
          items: [
            'Liquidity: red below 6 months of cash runway, amber from 6 to 9 months, green at 9 months or more.',
            'Concentration: red above 20% in one holding, amber from 15% to 20%, green below 15%.',
            'Illiquids: red above 10% illiquid, amber from 7% to 10%, green below 7%.',
            'Overall status is the worst of the three.',
          ],
        },
        {
          type: 'p',
          text: 'Preferences gate: if any light is red, your belief-driven tilts are locked for the scenarios — structural safety takes priority over preference. Amber and green leave them available.',
        },
      ],
    },
    {
      heading: 'What this feeds into',
      blocks: [
        {
          type: 'list',
          items: [
            'Beliefs — the preferences gate here decides whether your answers there will actually move the scenarios.',
            'Scenarios — a red or amber light physically constrains how far a scenario is allowed to shift (e.g. it won’t increase equity while concentration is red).',
            'Next steps & report — the lights and your investor type are carried through into the guardrails summary and the final snapshot.',
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
            'The thresholds (6/9 months, 15/20%, 7/10%) are policy defaults. Are they the right lines for the range of investors who will use this?',
            'Cash runway uses essential spending only; someone with large discretionary spending may have less real headroom than the green light suggests.',
            'The investor-type engine blends self-reported answers with computed allocation — where they disagree, the weighting decides the outcome. Is the balance between "what you said" and "what you hold" right?',
            'A single red light locks all preferences, not just the related one. Is that proportionate, or too blunt?',
          ],
        },
      ],
    },
  ],
};
