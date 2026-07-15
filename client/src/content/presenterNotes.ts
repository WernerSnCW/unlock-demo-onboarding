// Presenter notes — plain-English speaker notes for the advisor-facing
// "Presenter" window (a second-screen companion that follows the live step).
//
// Audience: the salesperson (Tom), talking to entrepreneurs with NO financial
// training. Every note explains what the screen/section is FOR, why it adds
// value, and how the information is used — in plain language, not headlines.
// Keyed by the same stepId OnboardingLayout uses, so the window can follow along.

export interface PresenterTerm {
  term: string;
  plain: string;
}

export interface PresenterSection {
  heading: string;
  /** 2–4 plain sentences: what it is, why it matters, how the info is used. */
  body: string;
}

export interface PresenterNote {
  stepId: string;
  stepNumber: number;
  /** Screen name as shown in the step indicator. */
  title: string;
  /** What the investor sees at the top of the screen. */
  onScreen: string;
  /** What this screen is for + how it adds value (a short paragraph). */
  purpose: string;
  /** An optional opening line Tom can say out loud. */
  sayThis?: string;
  /** Per-section breakdown — richer on the complex screens. */
  sections: PresenterSection[];
  /** Jargon on this screen, translated. */
  terms?: PresenterTerm[];
}

export const PRESENTER_NOTES: PresenterNote[] = [
  {
    stepId: 'welcome',
    stepNumber: 1,
    title: 'Welcome',
    onScreen: '"Welcome to Unlock" — three reassurance cards and a note that this is illustrative, not advice.',
    purpose:
      'This screen sets expectations and lowers the guard before we ask for anything. It tells the investor how long it takes, that their data is private, and — crucially — that nothing here is financial advice. No information is entered yet.',
    sayThis:
      '"This takes about ten minutes. It\'s a guided way to get a clear, illustrative picture of your own portfolio. Your data stays private, and nothing here is advice."',
    sections: [
      {
        heading: 'The three cards',
        body: 'Secure & Private, AI-Powered Insights, and Options to Explore. They exist purely to reassure — privacy, that the analysis is personalised, and that we illustrate options rather than dictate them.',
      },
      {
        heading: 'Why it matters',
        body: 'People relax when they know the time cost and that they are not about to be sold to or judged. Lead with the "not advice" framing — it is the promise the whole tool keeps.',
      },
    ],
  },
  {
    stepId: 'method',
    stepNumber: 2,
    title: 'Choose Method',
    onScreen: 'Four tiles — Manual Entry (the live one), plus Upload, Connect Account, Advisor Import (all "coming soon").',
    purpose:
      'This is simply how the portfolio gets into the tool. It signals that automated options (file upload, bank connection, adviser import) are on the roadmap, while keeping today\'s walkthrough simple: we type it in by hand.',
    sayThis:
      '"There\'ll be several ways to get your portfolio in — upload a file, connect your accounts, or pull it straight from your adviser. Today we\'ll just type it in so you can see the whole journey."',
    sections: [
      {
        heading: 'Why only Manual Entry works today',
        body: 'The other three are deliberately shown as "coming soon" to signal direction without over-promising. Manual Entry is marked "Recommended" so the eye goes to the one that works.',
      },
    ],
  },
  {
    stepId: 'intake',
    stepNumber: 3,
    title: 'About You (Intake)',
    onScreen: 'A form in four cards: Basic Details, Financial Picture, Goals & Risk Profile, and an optional Investor Profile section.',
    purpose:
      'This is the foundation everything else is built on. A handful of facts about the person and their money let the tool run its safety checks and describe what kind of investor they are. Only a couple of fields are strictly required — roughly right is fine.',
    sayThis:
      '"A few basics about you and your money. Only a couple are required, and rough numbers are fine — the more you share, the sharper the picture, but you can keep it light."',
    sections: [
      {
        heading: 'Basic Details',
        body: 'Name, email, investor type (individual, joint, company, trust), and tax residency. Tax residency matters because the rules — and later the wrapper/tax logic — differ by country.',
      },
      {
        heading: 'Financial Picture',
        body: 'The two that really count are essential spending and liquid cash. Together they set the "cash runway" — how many months of essential bills the cash on hand could cover — which drives the first safety light on the next screens. Total investable assets is just a rough guide here; the detail gets confirmed in Holdings.',
      },
      {
        heading: 'Goals & Risk Profile',
        body: 'Primary goal (grow, preserve, income, or a specific goal), time horizon, and how comfortable they are with ups and downs. These feed the "investor type" the tool describes later, and the risk answer is cross-checked against how they answer the volatility question in the Beliefs step.',
      },
      {
        heading: 'Investor Profile (optional)',
        body: 'Age band, whether they are building the pot up or drawing it down, where they focus (shares, property, private business, crypto), and "structural cues" like a final-salary pension, a private business, employer shares, or a cross-border setup. Optional, but it sharpens the investor type and the risks flagged. Important: these add context — they never change what the person owns.',
      },
    ],
    terms: [
      { term: 'Tax residency', plain: 'which country taxes you' },
      { term: 'Essential spending', plain: 'the bills you can\'t avoid — rent/mortgage, food, transport, insurance' },
      { term: 'Liquid cash', plain: 'money you could spend this week' },
      { term: 'Cash runway', plain: 'how many months your cash could cover the essential bills' },
      { term: 'Accumulating vs drawing down', plain: 'still building the pot vs living off it' },
    ],
  },
  {
    stepId: 'holdings',
    stepNumber: 4,
    title: 'Your Holdings',
    onScreen: 'A live summary panel at the top and a table where each row is one thing the person owns.',
    purpose:
      'This is where the person lists what they actually own, so the analysis runs on real numbers instead of guesses. As they type, the panel at the top updates live — total value, biggest single position, and how much is hard to sell.',
    sayThis:
      '"List what you own, one line each — roughly is fine. Watch the panel at the top: it shows your total, whether any one holding is a big share of everything, and how much of your money is tied up in things that are hard to sell."',
    sections: [
      {
        heading: 'The live summary tiles',
        body: 'Total Value is everything added up. Largest Holding is your biggest single position as a percentage — the "eggs in one basket" check. Illiquid Assets is the share that would be slow to sell. Safety Lights is a preview of the three checks that get explained fully on the next screen.',
      },
      {
        heading: 'Each row (the table)',
        body: 'For each holding: a name, the wrapper (which account it sits in), the asset class (what it is), the region, the value, and a tick for "illiquid" if it can\'t be sold quickly. The wrapper and asset-class mix later feed the direction scenarios and the tax/wrapper view.',
      },
      {
        heading: 'The optional detail (expand a row)',
        body: 'Cost and purchase date are optional but useful — they let the tool show unrealised gain (paper profit) and, later, model tax moves more precisely. Skip them in a quick demo; mention they sharpen the tax planning.',
      },
      {
        heading: 'What the numbers trigger',
        body: 'The totals drive two of the three safety lights. Current thresholds if you\'re asked: a single holding is amber above 15% and red above 20%; illiquid is amber above 7% and red above 10%.',
      },
    ],
    terms: [
      { term: 'Wrapper', plain: 'the account an investment sits in — ISA, pension, general account' },
      { term: 'Asset class', plain: 'what it is — shares, bonds, cash, property, alternatives, crypto' },
      { term: 'Illiquid', plain: 'slow or hard to sell — property, a private business, wine, art' },
      { term: 'Unrealised gain', plain: 'paper profit — worth now minus what you paid, before selling' },
    ],
  },
  {
    stepId: 'analysis',
    stepNumber: 5,
    title: 'Analysis',
    onScreen: 'A read-only results page: an overall status, three Safety Lights, key metrics, an "investor type", and a preferences banner.',
    purpose:
      'This is the tool\'s first honest read of the position — three safety checks plus a plain description of what kind of investor they look like. It\'s a health check, never a recommendation. Everything downstream carries these results forward.',
    sayThis:
      '"Now the tool reads your position. Three safety checks — cash, concentration, and how much is hard to sell — and a plain description of the kind of investor you look like. Think of it as a health check, not advice."',
    sections: [
      {
        heading: 'Overall status',
        body: 'A single green / amber / red, taking the worst of the three lights. Green = within guardrails, amber = worth watching, red = deal with this first.',
      },
      {
        heading: 'Safety Light 1 — Liquidity',
        body: 'Is the cash runway healthy? Red under 6 months, amber 6–9, green 9+. This is "if income stopped, how long could you pay the essential bills from cash."',
      },
      {
        heading: 'Safety Light 2 — Concentration',
        body: 'Is any single holding too big a share of everything? Amber 15–20%, red above 20%. The "too many eggs in one basket" check.',
      },
      {
        heading: 'Safety Light 3 — Illiquids',
        body: 'Is too much tied up in things that are hard to sell quickly? Amber 7–10%, red above 10%. Matters because in a crisis you can\'t easily reach that money.',
      },
      {
        heading: 'Investor Persona (investor type)',
        body: 'A one-line description like "Property-Led Investor," worked out from their answers and their actual holdings. It\'s a mirror held up to them, not a label that limits anything. Great conversation-starter: "does that sound like you?"',
      },
      {
        heading: 'The preferences banner — and why it might say "locked"',
        body: 'If any light is red, the tool says preferences are "locked." All it means is: fix the urgent safety issue before we lean the portfolio in any direction. Safety before style. Say: "Because a light is red, it won\'t illustrate leaning into your preferences yet — it wants that dealt with first. Stabilise, then optimise." It is not the tool breaking.',
      },
    ],
    terms: [
      { term: 'Safety Lights', plain: 'a car dashboard: green / amber / red on three things' },
      { term: 'Persona / investor type', plain: 'a plain description of what kind of investor you look like' },
      { term: 'Locked', plain: 'a safety light is red — fix that before leaning into style' },
    ],
  },
  {
    stepId: 'beliefs',
    stepNumber: 6,
    title: 'Beliefs',
    onScreen: 'Eight statements answered on a five-point scale, plus a live "Tilt preview" of eight dials.',
    purpose:
      'This captures HOW the person likes to invest — their leanings and style — so the tool can later illustrate a portfolio that reflects them, within the safety limits. No right answers; it\'s about preference.',
    sayThis:
      '"Eight quick statements about how you like to invest — do you prefer solid established companies, do you want a UK lean, do you care about sustainability, are you happy with a bumpy ride. There are no right answers. These set your preference dials."',
    sections: [
      {
        heading: 'What a "tilt" is (the one everyone asks)',
        body: 'A tilt is a gentle lean in a direction — like seasoning food to taste. "Lean a bit more towards UK companies," "lean away from smaller companies." It never buys or sells anything; it only flavours the illustration. Say it exactly like that and move on.',
      },
      {
        heading: 'What an "axis" is',
        body: 'One dial per preference. There are eight dials — quality, value, technology, UK bias, sustainability, inflation protection, smaller companies, and comfort with ups-and-downs. Each answer turns one dial from "lean strongly away" to "lean strongly towards."',
      },
      {
        heading: 'The Tilt preview',
        body: 'This just mirrors their answers back — which way each of the eight dials leans and how strongly (light, moderate, strong). It\'s a preview of preferences, not a portfolio, and nothing is bought or sold.',
      },
      {
        heading: 'How it\'s used next',
        body: 'These leanings feed the direction scenarios in the next step — but only within the safety guardrails. If a light is red, the leanings are captured but not applied yet (the "locked" idea from the Analysis screen).',
      },
    ],
    terms: [
      { term: 'Tilt', plain: 'a lean, like seasoning to taste — never buys or sells' },
      { term: 'Axis', plain: 'one dial per preference (there are 8)' },
      { term: 'Beliefs (vs Outlook)', plain: 'how you like to invest (Outlook, later, is what you think happens in the world)' },
    ],
  },
  {
    stepId: 'target',
    stepNumber: 7,
    title: 'Scenario (Direction)',
    onScreen: 'Three side-by-side scenarios, each showing current allocation vs an illustrative range, plus which preferences were reflected or held back.',
    purpose:
      'This shows — as ranges, never targets — how much the person\'s preferences would actually move things once the safety guardrails are respected. The point is to make "safety wins over preference" visible and concrete.',
    sayThis:
      '"Three versions of the same idea at different strengths. They show a direction of travel as a range — never a target, never a recommendation. The point is to see how much your preferences would move things once safety comes first."',
    sections: [
      {
        heading: 'The three scenarios (guardrail-first vs preference-leaning)',
        body: 'Think of a volume knob on their preferences. Neutral baseline = off (basically the portfolio as-is). Guardrail-first = low volume (safety leads, preferences nudge gently). Preference-leaning = high volume (leans in as far as the guardrails allow). Same preferences, three strengths — nobody is being told to pick one.',
      },
      {
        heading: 'The allocation ranges',
        body: 'Each row shows "Current: X%" versus an "Illustrative: low–high%." It\'s deliberately a range, not a single number, because it\'s a direction of travel, not a target to hit.',
      },
      {
        heading: 'Belief axes reflected',
        body: 'For each preference it shows whether it was Reflected, Partially reflected, Constrained (held back by a safety limit), or Not reflected. This is where you can point and say "your UK lean shows up here, but this one is held back because of the concentration flag."',
      },
      {
        heading: 'When everything looks the same',
        body: 'If a light is red, all three scenarios collapse onto "current" — the tool honestly saying "fix the safety issue first; there\'s nothing to illustrate yet." It can look like "it did nothing" — pre-empt that: it\'s the guardrails doing their job.',
      },
    ],
    terms: [
      { term: 'Guardrail-first / Preference-leaning', plain: 'a volume knob on your preferences — low vs high' },
      { term: 'Illustrative range', plain: 'a direction shown as a band, never a target' },
      { term: 'Constrained', plain: 'a preference held back by a safety limit' },
    ],
  },
  {
    stepId: 'outlook',
    stepNumber: 8,
    title: 'Your Outlook',
    onScreen: 'Fifteen statements about the world — jobs, AI, house prices, government debt, energy, the pound — on the same five-point scale.',
    purpose:
      'This captures how the person sees the next few years playing out — their worldview — deliberately kept separate from their portfolio. We then test their actual holdings against that worldview on the next screens.',
    sayThis:
      '"This one isn\'t about your portfolio — it\'s about the world. Fifteen views on the next few years: will AI hit jobs, will house prices fall, will the pound weaken. Then we\'ll show how your actual holdings would fare if you turn out to be right."',
    sections: [
      {
        heading: 'Why it\'s separate from Beliefs',
        body: 'Beliefs (Step 6) was about investing style. Outlook is about worldview — what will happen out there. Keep the two apart when you explain them; people conflate them.',
      },
      {
        heading: 'How the answers are used',
        body: 'Each answer nudges a set of named "what-if" scenarios up or down (things like Stagflation, Property Crash, or a Rate-Cut recovery). Agreeing with a gloomy statement adds weight to the matching scenario; disagreeing takes it away; neutral does nothing. The result is a weighted picture of which scenarios they find most plausible.',
      },
      {
        heading: 'If they answer mostly "neutral"',
        body: 'The answers cancel out and the tool says it doesn\'t have enough signal to model an outlook. That\'s by design, not a bug — nudge them to answer more definitively if you want the next screens to populate.',
      },
    ],
    terms: [
      { term: 'Outlook (vs Beliefs)', plain: 'what you think happens in the world (Beliefs was how you like to invest)' },
      { term: 'Scenario', plain: 'a named "what if" — e.g. a property crash or a recovery' },
    ],
  },
  {
    stepId: 'outlook-results',
    stepNumber: 9,
    title: 'Outlook Results (Impact)',
    onScreen: 'An Alignment score out of 100, any warning flags, per-asset historical impact, and a "would your cash last?" note.',
    purpose:
      'This maps the person\'s worldview onto their actual holdings, grounded in real history where the data allows. It turns an abstract worry into "here\'s what that would have meant for your money."',
    sayThis:
      '"Here\'s where your view of the world meets what you actually own. We replay real past episodes — the dot-com bust, 2008, COVID, the 2022 rate shock — to show how your holdings behaved in times like the ones you\'re worried about."',
    sections: [
      {
        heading: 'The alignment score (out of 100)',
        body: 'How well what they own matches how they see the world. Broadly aligned (70+), Partially aligned (40+), or Misaligned. It\'s a rough read, not a precise measurement — say so.',
      },
      {
        heading: 'The warning flags',
        body: 'Amber notes that fire when something stands out — e.g. "you describe yourself as cautious but you\'re concentrated," or "one asset type is over a third of the modelled portfolio."',
      },
      {
        heading: 'Historical impact rows',
        body: 'For each asset type they hold, the worst drop in a matching past crisis and how long it took to recover. Some rows are cited real data; others (property, global shares) are illustrative where clean history doesn\'t exist — the screen labels which is which.',
      },
      {
        heading: 'The income-runway note (the human one)',
        body: 'If the worst scenario hit, would their cash buffer cover essential spending until markets recovered — or would they be forced to sell at the bottom? This is the point that lands hardest; give it room.',
      },
    ],
    terms: [
      { term: 'Alignment score', plain: 'how well what you own matches how you see the world, out of 100' },
      { term: 'Trough', plain: 'the lowest point / the bottom' },
      { term: 'Modelled portfolio', plain: 'the part of your holdings we have history for' },
    ],
  },
  {
    stepId: 'outlook-alternatives',
    stepNumber: 10,
    title: 'Alternatives',
    onScreen: 'One simulated, staged way to soften the impact: a summary, a "do now / later" split, and a before/after comparison.',
    purpose:
      'This shows ONE illustrative path to a portfolio that better matches the person\'s worldview — explicitly a simulation, never a recommendation. It makes the alternative tangible without prescribing it.',
    sayThis:
      '"If the previous page worried you, here\'s one illustrative way to soften it — staged into what\'s sensible to do now versus slower, later decisions. It\'s a simulation of your own view, not advice on what to do."',
    sections: [
      {
        heading: 'The summary tiles',
        body: 'How much changes in total, a rough estimate of turnover and cost, and liquidity before versus after. All illustrative — the costs use fixed assumed rates, not real quotes.',
      },
      {
        heading: '"Do now" vs "Later — illiquid"',
        body: 'The tool stages the moves sensibly: rebuild the cash cushion first, do the easy liquid moves now, and defer property to "later" because it\'s slow to move. That staging mirrors how a sensible person actually thinks.',
      },
      {
        heading: 'Before / after',
        body: 'Two doughnuts and a line-by-line comparison: alignment before vs after, the worst-episode drop before vs after, and whether the "forced to sell" risk improves. It re-runs the same models from the previous page as if the changes were made in full.',
      },
      {
        heading: 'The honest caveat',
        body: 'It\'s one path, not an optimised plan, and it ignores tax wrappers, CGT, and timing. Saying that out loud protects you and builds trust.',
      },
    ],
    terms: [
      { term: 'pp (percentage points)', plain: 'the gap between two percentages — 8% to 10% is "2 pp"' },
      { term: 'Turnover', plain: 'how much of the portfolio changes hands' },
      { term: 'Staged', plain: 'done in a sensible order over time, not all at once' },
    ],
  },
  {
    stepId: 'next-steps',
    stepNumber: 11,
    title: 'Next Steps',
    onScreen: 'A plain-English checkpoint: current position, "what matters most now", preference status, and a short checklist.',
    purpose:
      'A pause to reflect — nothing is recalculated here. It restates where the guardrails and preferences stand, in plain English, before any planning conversation. It never tells the person to buy or sell.',
    sayThis:
      '"A checkpoint in plain English — what matters most right now, and what, if anything, is holding your flexibility back."',
    sections: [
      {
        heading: 'Your current position',
        body: 'One honest summary line — within guardrails, caution, red-but-you\'ve-chosen-to-hold, or action-required — so everyone\'s on the same page before moving on.',
      },
      {
        heading: 'What matters most now',
        body: 'The three safety lights again, worst-first, each with a one-line "why it matters." It focuses attention on the single most important thing.',
      },
      {
        heading: 'Preference signals status',
        body: 'All eight preferences and whether each is applied, constrained, or locked — nothing hidden. Reinforces the safety-before-style story.',
      },
    ],
  },
  {
    stepId: 'plan-transition',
    stepNumber: 12,
    title: 'Transition',
    onScreen: 'Three summary cards and a five-step timeline about what would govern pace and sequencing if changes were ever made.',
    purpose:
      'This explains why any change would happen gradually — the constraints on pace, order, and tax timing. It\'s a "constraints lens," not a plan, and it changes nothing. It sets the expectation that Unlock is measured, not a day-trading tool.',
    sayThis:
      '"You don\'t rip a portfolio apart overnight. If you ever did make changes, this shows what would sensibly govern the pace — tax timing, the account types involved, and the safety limits."',
    sections: [
      {
        heading: 'The three cards',
        body: 'Current safety status, whether preferences are active or locked, and a note that pacing limits apply. A quick "where do we stand" before the timeline.',
      },
      {
        heading: 'The five-step timeline',
        body: 'The structural things that govern change: any urgent pressure, how account types affect access and tax, pacing limits (spreading sales over time, often for tax reasons), preferences versus constraints, and the final snapshot.',
      },
      {
        heading: 'Export CSV',
        body: 'Downloads this as a simple summary for discussion afterwards. It carries a "not financial advice" line.',
      },
    ],
    terms: [
      { term: 'Pacing limits', plain: 'spreading changes over time, often to manage tax' },
      { term: 'Sequencing', plain: 'doing things in a sensible order' },
    ],
  },
  {
    stepId: 'plan-wrappers',
    stepNumber: 13,
    title: 'Wrappers',
    onScreen: 'A table of holdings grouped by account type (wrapper), plus a possible "Bed & ISA" suggestion.',
    purpose:
      'This shows how the money is spread across account types and makes the eye-opening point that the wrapper can matter as much as the investment — same holding, different account, different tax. A strong note to end the substantive flow on.',
    sayThis:
      '"Same investment, different account, different tax. This shows how your money is spread across ISAs, pensions, and general accounts — and where something might have a smarter home."',
    sections: [
      {
        heading: 'The account/wrapper table',
        body: 'Each wrapper — ISA (tax-free), SIPP (pension), GIA (taxable), cash, offshore bond — with how much is in it, its role, and a priority order. The priority is a fixed default; the best wrapper genuinely depends on someone\'s tax position, so present it as illustrative.',
      },
      {
        heading: 'The Bed & ISA badge (if it appears)',
        body: 'Flags a holding sitting in a taxable account on a gain that could be moved into an ISA to shelter its future growth from tax. Illustrative only — a "worth a conversation," not an instruction.',
      },
    ],
    terms: [
      { term: 'Wrapper', plain: 'the account an investment sits in — changes the tax' },
      { term: 'ISA / SIPP / GIA', plain: 'tax-free box / pension box / normal taxable box' },
      { term: 'Bed & ISA', plain: 'sell in a taxable account, buy back inside an ISA to shelter future growth' },
    ],
  },
];

export const PRESENTER_NOTE_BY_STEP: Record<string, PresenterNote> = Object.fromEntries(
  PRESENTER_NOTES.map((n) => [n.stepId, n]),
);
