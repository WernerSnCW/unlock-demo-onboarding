import type { ScreenHelp } from './types';

export const planTransitionHelp: ScreenHelp = {
  stepId: 'plan-transition',
  title: 'Transition',
  intro: 'Why any change would happen gradually — the constraints on pace, sequence and limits.',
  sections: [
    {
      heading: 'In plain terms',
      blocks: [
        {
          type: 'p',
          text: 'If you were ever to move your portfolio towards one of the scenarios, it would not happen overnight. This screen explains the structural reasons why — the pacing limits, the order things would need to happen in, and how your guardrails and preferences interact. It is a lens on constraints, not a plan or an instruction to do anything.',
        },
      ],
    },
    {
      heading: 'What you’ll see here',
      blocks: [
        {
          type: 'list',
          items: [
            'Three summary cards: your safety status, your preference (tilt) status, and the policy constraints that apply.',
            'A five-step illustrative timeline describing the sequence and pacing of any change.',
            'A red-lock banner if a red safety light is present, noting that preferences stay locked until it is addressed.',
            'A download of the constraints summary as a CSV.',
          ],
        },
      ],
    },
    {
      heading: 'What happens underneath',
      blocks: [
        {
          type: 'p',
          text: 'The timeline is always five deterministic steps, but their wording adapts to your situation: the first step reflects whether there is structural pressure (from a red or amber light) or none; a middle step notes any pacing limit drawn from policy; and a later step states whether your preferences are active-within-limits or locked behind a red item. The rest is consistent framing for discussion.',
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
            'The timeline is fixed at five steps; only the wording varies by your safety and preference status.',
            'Pacing language uses a policy value (a minimum number of years to reduce a position) when one is available, otherwise generic pacing text.',
            'While any red light is present, preferences are shown as locked.',
            'The CSV carries a timestamp, a policy version, and a "not financial advice" disclaimer.',
          ],
        },
      ],
    },
    {
      heading: 'What this feeds into',
      blocks: [
        {
          type: 'p',
          text: 'This screen is explanatory — it does not change your data. It sets up the Wrappers screen, which looks at the account types your money sits in.',
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
            'A fixed five-step timeline is easy to follow but inherently generic. Does it convey real constraints, or just reassurance?',
            'Pacing limits come from a single policy default. Should they vary by portfolio size or the scale of the move being contemplated?',
            'The screen deliberately stops short of "how" — is the line between explaining constraints and giving advice clear enough?',
          ],
        },
      ],
    },
  ],
};
