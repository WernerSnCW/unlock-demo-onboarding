import type { ScreenHelp } from './types';

export const intakeHelp: ScreenHelp = {
  stepId: 'intake',
  title: 'Intake',
  intro: 'Where we capture the picture of you and your finances that everything else is built on.',
  sections: [
    {
      heading: 'In plain terms',
      blocks: [
        {
          type: 'p',
          text: 'This is the questionnaire. Nothing has been calculated yet — here we simply gather the facts about your situation: who you are, your income and spending, what you already hold, your goals, and how you feel about risk. Every later screen (your safety checks, your investor type, the scenarios) is worked out from what you enter here, so it is worth being reasonably accurate.',
        },
        {
          type: 'p',
          text: 'Only a handful of fields are required. The rest help us tailor the picture — the more you tell us, the more specific everything downstream becomes.',
        },
      ],
    },
    {
      heading: 'What you’ll do here',
      blocks: [
        {
          type: 'list',
          items: [
            'Basic details — your name, email, the type of investor (individual, joint, company, trust) and your region.',
            'Financial picture — your income, essential yearly spending, cash you can reach quickly, total investable assets, and any regular monthly contribution.',
            'Goals & risk — your main goal, your time horizon, and how comfortable you are with risk.',
            'Investor profile (optional) — a set of extra questions about your age, stage, focus, and any special holdings (a defined-benefit pension, a private business, employer stock, crypto). This section is collapsible and can be skipped, but answering it sharpens the analysis.',
          ],
        },
        {
          type: 'note',
          text: 'Two numbers do a lot of heavy lifting later: your essential yearly spending and your accessible cash. Together they decide your "cash runway" — how many months you could cover from cash alone — which drives the first safety check on the next screens.',
        },
      ],
    },
    {
      heading: 'What happens underneath',
      blocks: [
        {
          type: 'p',
          text: 'When you continue, the form is validated (required fields must be present and numbers must be sensible), your answers are saved to your session, and any earlier analysis result is cleared so it will be recomputed freshly from these new inputs.',
        },
        {
          type: 'p',
          text: 'The optional "structural cue" toggles work in pairs: if you switch one on (say, "I have a defined-benefit pension"), you must then pick the band that describes it. Switch it off and that detail is cleared. These cues do not change your holdings — they add context that nudges your investor type and the risks we flag.',
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
            'Required to continue: name, email, investor type, region, essential yearly spending, accessible cash, primary goal, time horizon, and risk comfort.',
            'Essential spending must be greater than zero (it is used as a divisor for cash runway). All money fields must be zero or positive.',
            'If you turn on any of the special-holding toggles (DB pension, private business, employer stock, crypto) you must choose its band before continuing.',
            'Answers are captured as bands (e.g. "10–25%"), not exact figures — approximate is deliberately fine at this stage.',
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
            'Holdings — your total investable figure here is a rough guide we confirm against the holdings you list next.',
            'Analysis — cash + spending set your cash-runway safety light; risk comfort, horizon, goal and the optional cues shape your investor type.',
            'Beliefs & Scenarios — your goal and stage influence how preferences are interpreted later.',
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
            'Is asking for essential spending (rather than total spending) the right basis for the cash-runway check? It is a deliberately conservative choice.',
            'The optional profile section is genuinely optional — but skipping it makes the investor-type match less confident. Is that trade-off clear enough to a first-time user?',
            'We collect self-reported bands, not verified figures. The demo trusts what you enter.',
          ],
        },
      ],
    },
  ],
};
