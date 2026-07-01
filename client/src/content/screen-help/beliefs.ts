import type { ScreenHelp } from './types';

export const beliefsHelp: ScreenHelp = {
  stepId: 'beliefs',
  title: 'Beliefs',
  intro: 'Eight questions that capture your leanings — the directions you’d like your portfolio to lean, within the guardrails.',
  sections: [
    {
      heading: 'In plain terms',
      blocks: [
        {
          type: 'p',
          text: 'Here you answer eight statements on a five-point agree/disagree scale. Your answers become eight "preference signals" — leanings such as favouring quality, value, technology, UK exposure, or ESG, or being more averse to volatility. These do not predict returns and do not change what you hold. They express a direction of travel that the next screen uses to build illustrative scenarios.',
        },
      ],
    },
    {
      heading: 'What you’ll do here',
      blocks: [
        {
          type: 'list',
          items: [
            'Answer all eight statements from "Strongly disagree" to "Strongly agree".',
            'Watch the [[live preview|beliefs-tilt-preview]] update as you answer — it shows each signal’s direction (towards / away) and strength.',
            'Optionally open [[Transparency|beliefs-transparency]] to see exactly how each answer maps to a signal and its score.',
          ],
        },
      ],
    },
    {
      heading: 'What happens underneath',
      blocks: [
        {
          type: 'p',
          text: 'Each answer is converted to a score from −1 to +1 (strongly disagree is −1, neutral is 0, strongly agree is +1). Most questions map straight to a signal. One is deliberately inverted: comfort with volatility becomes "volatility aversion", so a high comfort produces a low aversion.',
        },
        {
          type: 'p',
          text: 'Each signal is then labelled by strength — neutral, light, moderate or strong — based on how far from zero it is. That strength is what governs how much a signal is allowed to push a scenario later.',
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
            'Answer-to-score: (your 1–5 answer − 3) ÷ 2, giving −1 to +1.',
            'Strength bands (absolute score): under 0.20 is neutral, 0.20–0.50 light, 0.50–0.80 moderate, 0.80+ strong.',
            'Volatility aversion is the inverse of the volatility-comfort answer.',
            'All eight questions must be answered before you can continue.',
            'If any Safety Light is red, these preferences are locked and will not move the scenarios at all — the screen tells you when this is the case.',
          ],
        },
      ],
    },
    {
      heading: 'What this feeds into',
      blocks: [
        {
          type: 'p',
          text: 'The signals feed directly into the Scenario screen, where they create gentle directional pressure on the asset-class and region ranges — but only within what the Safety Lights allow, and only as far as each signal’s strength justifies.',
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
            'Eight statements are a compact way to elicit preferences — is anything important (e.g. income vs. growth, home-currency risk) missing or over-simplified?',
            'The strength bands (0.20 / 0.50 / 0.80) are fixed cut-offs. A moderate and a strong answer are treated quite differently at 0.79 vs 0.81.',
            'Inverting volatility comfort into aversion is a modelling choice — is it intuitive to the person answering?',
            'Preferences are captured but never allowed to override a red safety light. Some investors may expect their stated preference to carry more weight.',
          ],
        },
      ],
    },
  ],
};
