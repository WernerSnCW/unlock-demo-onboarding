import type { ScreenHelp } from './types';

export const nextStepsHelp: ScreenHelp = {
  stepId: 'next-steps',
  title: 'Next Steps',
  intro: 'A plain-English checkpoint: where your guardrails and preferences currently stand before any planning.',
  sections: [
    {
      heading: 'In plain terms',
      blocks: [
        {
          type: 'p',
          text: 'This screen pauses to summarise your position in words. It restates your Safety Lights, shows which of your preference signals were actually applied (and which were held back by the guardrails), and turns that into a short review checklist — the things you might reflect on before the planning screens. It can also generate a plain-language summary of your position.',
        },
      ],
    },
    {
      heading: 'What you’ll see here',
      blocks: [
        {
          type: 'list',
          items: [
            'A position headline and sentence describing your overall guardrail status.',
            'Your three Safety Lights again, ordered worst-first so the most pressing item leads.',
            'The status of each of the eight preference signals: applied, partially applied, constrained, locked, or not applied.',
            'A short review checklist — a few points drawn from your reds, ambers and preference statuses.',
            'An optional generated summary of your position in plain language, with the raw inputs it was built from viewable on request.',
          ],
        },
      ],
    },
    {
      heading: 'What happens underneath',
      blocks: [
        {
          type: 'p',
          text: 'The checklist is generated deterministically from your data — a red light adds a "review your cash reserves" style prompt, locked preferences add a note that a red item is holding them back, and so on, with fallback prompts to ensure there are always at least a few useful points.',
        },
        {
          type: 'p',
          text: 'The optional written summary is produced by a language model, but it is fenced by strict compliance rules: a long list of directive or advice-like words is forbidden, and the text must end with a fixed "illustrative only, not financial advice" line. The response is re-checked on the way back, so it cannot drift into advice.',
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
            'Safety Lights are shown worst-first (red, then amber, then green).',
            'All eight preference signals are always listed, even the ones that did nothing, so nothing is hidden.',
            'The generated summary must avoid ~45 forbidden advice-like words and must carry the fixed disclaimer line; it is validated both server- and client-side.',
          ],
        },
      ],
    },
    {
      heading: 'What this feeds into',
      blocks: [
        {
          type: 'p',
          text: 'Nothing is recalculated here — it is a reflection point. Continuing moves you into the planning screens (Transition and Wrappers), which are framed by exactly the guardrail and preference status shown here.',
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
            'Is a language-model summary the right tool here, even tightly fenced? The forbidden-word list is the main safeguard — is it complete enough?',
            'The checklist is rule-based and deliberately generic. Does it feel genuinely useful, or like filler?',
            'Showing every preference signal (including the inert ones) is a transparency choice — helpful for reviewers, but potentially noisy for a real user.',
          ],
        },
      ],
    },
  ],
};
