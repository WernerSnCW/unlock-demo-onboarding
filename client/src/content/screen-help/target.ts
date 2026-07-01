import type { ScreenHelp } from './types';

export const targetHelp: ScreenHelp = {
  stepId: 'target',
  title: 'Scenarios',
  intro: 'Three illustrative directions your portfolio could lean — shown as ranges, never as targets or advice.',
  sections: [
    {
      heading: 'In plain terms',
      blocks: [
        {
          type: 'p',
          text: 'This screen shows three ways your portfolio could be shaped, given your beliefs and your safety guardrails. They are illustrations, not recommendations: each is shown as a range (an illustrative low to high for each asset class and region), not a precise target. The point is to see how much — or how little — your stated preferences would actually move things once the guardrails are respected.',
        },
      ],
    },
    {
      heading: 'What you’ll see here',
      blocks: [
        {
          type: 'list',
          items: [
            'Three [[scenarios|target-scenario-tabs]]: Guardrail-first (safety leads), Preference-leaning (your beliefs lead, within limits), and a Neutral baseline (no lean at all).',
            'A [[display toggle|display-mode-toggle]] to view ranges as percentages or as pounds, and a [[compare mode|compare-scenarios-toggle]] that overlays all three.',
            'An [[example portfolio|example-portfolio-panel]] within each scenario’s ranges, with low / mid / high variants and the holdings that move most.',
            'Which belief signals were applied, partially applied, constrained or locked — and which guardrails are actively binding.',
          ],
        },
      ],
    },
    {
      heading: 'What happens underneath',
      blocks: [
        {
          type: 'p',
          text: 'Each belief signal is turned into a small directional pressure on each part of the portfolio (for example, a value or tech lean nudges equity up; volatility aversion nudges towards bonds and cash). Those pressures are combined, then scaled by how assertive the scenario is meant to be.',
        },
        {
          type: 'p',
          text: 'A centre point for each asset class is shifted by that scaled pressure, and a band is drawn around it. Crucially, the shift is then clamped by your Safety Lights: a scenario will not increase equity while concentration is stretched, will not cut cash while liquidity is tight, and will not add to property or alternatives while illiquids are stretched. If a red light is present, all preference pressure is switched off entirely and the scenarios converge.',
        },
      ],
    },
    {
      heading: 'The rules we apply',
      kind: 'rules',
      blocks: [
        {
          type: 'p',
          text: 'How assertive each scenario is (how far the centre can move, and how wide the range):',
        },
        {
          type: 'list',
          items: [
            'Neutral baseline: no shift, a narrow ±2 percentage-point range only.',
            'Guardrail-first: gentle — up to about 1 point of shift, ±3 point range.',
            'Preference-leaning: strongest — up to about 6 points of shift, ±6 point range.',
            'A signal only registers as "increase" or "decrease" once its pressure passes a small threshold; below that it reads as neutral.',
            'Every range is clamped to sensible bounds and to your Safety Lights before it is shown.',
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
            'Next steps — the applied/constrained/locked status of your preferences is summarised there as a review checklist.',
            'The historical stress lens — the mix behind these scenarios is what gets replayed against past market episodes.',
            'The report — the scenarios and their convergence note are carried into the final snapshot.',
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
            'The assertiveness numbers (1 vs 6 points of shift, ±3 vs ±6 ranges) are calibration choices. Do they make "preference-leaning" feel meaningfully different from "guardrail-first" without overpromising?',
            'When guardrails bind hard, all three scenarios can look almost identical. That is honest, but might read as "the tool did nothing" — is the convergence explained clearly enough?',
            'The mapping from each belief to its pressure on each asset class (e.g. how much "tech" lifts equity) is a fixed set of weights worth reviewing.',
            'These are ranges, explicitly not targets or forecasts, and they exclude fees, tax and returns. Is that boundary obvious to a reviewer?',
          ],
        },
      ],
    },
  ],
};
