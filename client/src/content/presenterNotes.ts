// Presenter notes — plain-English speaker notes for the advisor-facing
// "Presenter" window (a second-screen companion that follows the live step).
//
// Audience: the salesperson (Tom), talking to entrepreneurs with NO financial
// training. This is a SECOND-SCREEN companion, so there's room to be thorough —
// favour clear, useful explanation over brevity.
//
// Every step answers three things explicitly:
//   1. covers   — what this step/section covers, in plain English + how to
//                 explain it to the investor (with a concrete example).
//   2. useful   — why it's useful / what the investor gets out of it.
//   3. howUsed  — how it's used later in the onboarding, and why it's needed.
// Plus a literal "sayThis" line, section-by-section notes on the busy screens,
// and jargon translations. Keyed by the same stepId OnboardingLayout uses.

export interface PresenterTerm {
  term: string;
  plain: string;
}

export interface PresenterSection {
  heading: string;
  /** A full, plain-English paragraph: what it is, how to explain it, why it
   *  matters / how it's used. Don't be terse — this is second-screen real estate. */
  body: string;
}

export interface PresenterNote {
  stepId: string;
  stepNumber: number;
  /** Screen name as shown in the step indicator. */
  title: string;
  /** What the investor sees at the top of the screen. */
  onScreen: string;
  /** (1) What this step covers + how to explain it, plain English, with example. */
  covers: string;
  /** A line Tom can say out loud to the investor. */
  sayThis: string;
  /** (2) Why it's useful — what the investor gets from it. */
  useful: string;
  /** (3) How it's used later / why it's needed. */
  howUsed: string;
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
    onScreen: '"Welcome to Unlock" — three reassurance cards (Secure & Private, AI-Powered Insights, Options to Explore), a "5–10 minutes" note, and a line that this is illustrative, not advice.',
    covers:
      'A simple introduction screen. It tells the investor the whole thing takes five to ten minutes, that their data is private and secure, and — most importantly — that nothing here is financial advice. Nothing is entered yet; they just begin.',
    sayThis:
      '"This takes about ten minutes. It\'s a guided way to get a clear, illustrative picture of your own portfolio. Your data stays private, and nothing here is advice — think of it as a structured way to see where you stand."',
    useful:
      'It settles the investor before you ask for anything personal. People share more openly once they know how long it takes, that they won\'t be judged, and that no one is about to sell them a product. The "not advice" promise is the one the whole tool keeps — leading with it builds trust immediately.',
    howUsed:
      'Nothing is captured here, so nothing feeds forward. Its only job is to set expectations so the investor is comfortable giving you honest numbers on the next few screens — and honest numbers are what make everything downstream meaningful.',
    sections: [],
  },
  {
    stepId: 'method',
    stepNumber: 2,
    title: 'Choose Method',
    onScreen: 'Four tiles — Manual Entry (the one that works, marked "Recommended"), plus Upload File, Connect Account, and Advisor Import (all "coming soon").',
    covers:
      'This is simply how the portfolio gets into the tool. Today the investor picks "Manual Entry" and types their holdings in by hand. The other three options — uploading a spreadsheet, connecting their investment accounts, or importing from their adviser — are shown as "coming soon" to signal where the product is heading.',
    sayThis:
      '"There\'ll be several ways to get your portfolio in — upload a file, connect your accounts, or pull it straight from your adviser. Today we\'ll just type it in by hand so you can see the whole journey end to end."',
    useful:
      'It shows the investor the product has a real roadmap (automatic imports are coming) while keeping today\'s walkthrough simple and controlled. It also frames the next screen: they know they\'re about to enter their holdings.',
    howUsed:
      'The choice just routes them to manual entry — no data is captured. It exists so the flow has a natural "how would you like to do this?" moment rather than dropping them straight into a form.',
    sections: [],
  },
  {
    stepId: 'intake',
    stepNumber: 3,
    title: 'About You (Intake)',
    onScreen: 'A form in four cards: Basic Details, Financial Picture, Goals & Risk Profile, and an optional "Investor Profile" section that expands.',
    covers:
      'A short form about the person and their money: who they are, roughly what they earn and spend, how much cash they keep to hand, their goals, their time horizon, and how comfortable they are with ups and downs. Only a couple of fields are required, and rough figures are fine. There\'s also an optional deeper profile (age, business ownership, pensions, crypto, cross-border) for people happy to share more.',
    sayThis:
      '"A few basics about you and your money — rough numbers are completely fine. For example, roughly what do your essential monthly bills come to, and how much cash do you keep for emergencies. The more you tell it, the sharper the picture, but you can keep it light."',
    useful:
      'This is the picture of the investor that everything else is measured against. It only takes a couple of minutes, and it\'s what lets the tool say something specific about them rather than generic. The optional profile section is where an entrepreneur\'s real situation (a business, a final-salary pension) gets recognised.',
    howUsed:
      'The safety analysis in Step 5 depends on it — for example, the tool literally cannot check whether someone has enough emergency cash without knowing their monthly spending (cash ÷ monthly spend = how many months they\'re covered). Their goals, horizon and risk comfort feed the "investor type" description, and the optional profile answers sharpen that persona match later.',
    sections: [
      {
        heading: 'Basic Details',
        body: 'Name, email, investor type (individual, joint, company, trust) and tax residency. Explain tax residency simply as "which country taxes you" — it matters because the rules, and later the tax/wrapper logic, are different in the UK versus elsewhere. This is just context-setting; it\'s the financial numbers that do the real work.',
      },
      {
        heading: 'Financial Picture',
        body: 'The two that really matter are essential spending (the bills they can\'t avoid — mortgage/rent, food, transport, insurance) and liquid cash (money they could spend this week). Say why plainly: "I ask about spending because that\'s the only way to tell whether your cash cushion would actually last." Total investable assets is just a rough guide here — the real detail comes on the Holdings screen. Income and monthly contributions add colour but aren\'t critical.',
      },
      {
        heading: 'Goals & Risk Profile',
        body: 'Their primary goal (grow, preserve, generate income, or a specific goal like retirement), how long they\'re investing for, and how comfortable they are with their portfolio bouncing around. Frame it as "so the picture reflects what you\'re actually trying to do." These answers feed the "investor type" on the next screen, and the risk-comfort answer is quietly cross-checked against how they answer the volatility question later in Beliefs — if they say "cautious" here but "bring on the swings" there, the tool gently notes the mismatch.',
      },
      {
        heading: 'Investor Profile (optional, expands)',
        body: 'Age band, whether they\'re still building the pot up or drawing an income from it, where they focus (shares, property, private business, crypto), and "structural cues" — a final-salary pension, a private business, employer shares, meaningful crypto, a cross-border setup. Tell them it\'s optional but genuinely sharpens the result: "if you own a business, that changes what kind of investor you are, and the tool should know that." Crucially, these add context that nudges the persona and the risks flagged — they never change what the person actually owns.',
      },
    ],
    terms: [
      { term: 'Tax residency', plain: 'which country taxes you' },
      { term: 'Essential spending', plain: 'the bills you can\'t avoid — mortgage/rent, food, transport, insurance' },
      { term: 'Liquid cash', plain: 'money you could spend this week without selling anything' },
      { term: 'Time horizon', plain: 'how long before you\'ll need the money' },
    ],
  },
  {
    stepId: 'holdings',
    stepNumber: 4,
    title: 'Your Holdings',
    onScreen: 'A live summary panel at the top (Total Value, Largest Holding %, Illiquid %, a Safety Lights preview) and a table where each row is one thing the person owns.',
    covers:
      'The investor lists what they actually own — one line per holding, each with a name, a value, what it is (asset class), where it is (region), and which account it sits in (the wrapper — ISA, SIPP, GIA). They tick anything that\'s hard to sell quickly. Rough is fine; they can add a few big holdings to get the picture. As they type, the panel at the top adds it all up live.',
    sayThis:
      '"List what you own, one line each — just the main things is fine to start. Watch the panel at the top as you go: it shows your total, whether any single holding is a big slice of everything, and how much of your money is tied up in things that are slow to sell."',
    useful:
      'This is the moment the tool stops being generic and starts working from their real numbers. The live panel gives an instant, honest read — "your biggest holding is 30% of everything" often lands before you\'ve said a word. It also gives the investor a rare consolidated view of a portfolio that\'s usually scattered across providers.',
    howUsed:
      'Everything that follows is built on this. The totals drive two of the three safety checks on the next screen (is any one holding too big; is too much illiquid), the asset-class and region mix feeds the illustrative scenarios, and the wrappers feed the tax/placement view near the end. Without the holdings, the rest of the flow has nothing to analyse.',
    sections: [
      {
        heading: 'The live summary tiles',
        body: 'Total Value is simply everything added up. Largest Holding shows their biggest single position as a percentage — the "eggs in one basket" check. Illiquid Assets shows the share that would be slow to sell. Safety Lights is a preview of the three checks explained in full on the next screen. Point at these as they type — the numbers moving in real time is part of the "aha."',
      },
      {
        heading: 'Each row in the table',
        body: 'For every holding: a name, the wrapper (the account it lives in — ISA, pension/SIPP, or a general account), the asset class (shares, bonds, cash, property, alternatives, crypto), the region, the value, and a tick for "illiquid" if it can\'t be sold quickly. Explain wrapper as "the box the investment sits in — same investment, different box, different tax." The illiquid tick is a judgement call the investor makes — property, a private business stake, or collectibles get ticked.',
      },
      {
        heading: 'The optional detail (expand a row)',
        body: 'Each row opens up for cost, purchase date, ISIN and notes. These are optional — skip them in a quick demo — but if the investor adds what they paid, the tool can show their "unrealised gain" (paper profit) and, later, model tax moves more precisely. Mention it as "worth adding if you want the tax planning to be sharper, but not needed to see the picture."',
      },
      {
        heading: 'The numbers behind the lights (if they ask)',
        body: 'Concentration turns amber when one holding is above 15% of the portfolio and red above 20%. Illiquid turns amber above 7% and red above 10%. You don\'t need to quote these unless asked, but it\'s useful to know the panel colours aren\'t arbitrary — they map to the exact thresholds on the next screen.',
      },
    ],
    terms: [
      { term: 'Wrapper', plain: 'the account an investment sits in — ISA, pension, general account' },
      { term: 'Asset class', plain: 'what it is — shares, bonds, cash, property, alternatives, crypto' },
      { term: 'Illiquid', plain: 'slow or hard to sell — property, a private business, wine, art' },
      { term: 'Unrealised gain', plain: 'paper profit — worth now minus what you paid, before you\'ve sold' },
    ],
  },
  {
    stepId: 'analysis',
    stepNumber: 5,
    title: 'Analysis',
    onScreen: 'A read-only results page: an overall status banner, three "Safety Lights", key metrics, an "Investor Persona", and a banner saying whether preferences are enabled or locked.',
    covers:
      'The tool\'s first honest read of the position. It runs a "Safety Lights" check on three things — is there enough accessible cash (liquidity), is too much riding on one holding (concentration), and is too much tied up in things that can\'t be sold quickly (illiquids) — and gives each a green, amber, or red. It also describes what kind of investor they look like (their "persona"), worked out from their answers and their actual holdings.',
    sayThis:
      '"Now the tool reads your position — three safety checks and a plain description of the kind of investor you look like. Green means fine, amber means keep an eye on it, red means let\'s deal with that first. It\'s a health check, not a recommendation."',
    useful:
      'It turns a pile of numbers into three simple, honest signals anyone can grasp in seconds, plus a mirror — "you look like a Property-Led Investor; does that ring true?" — which is a brilliant conversation opener. It shows problems before preferences, which is exactly the order a sensible adviser would use.',
    howUsed:
      'This is the gatekeeper for the rest of the flow. If there\'s a serious structural problem (a red light), it doesn\'t make sense to start talking about style and preferences yet — safety comes before style — so the tool records preferences but holds them back until the red is addressed. The persona and the light statuses are carried all the way through to the final summary and report.',
    sections: [
      {
        heading: 'Overall status',
        body: 'A single green / amber / red at the top, taking the worst of the three lights — because a portfolio is only as safe as its weakest point. Green = within the guardrails, amber = worth watching, red = something to address first.',
      },
      {
        heading: 'Safety Light 1 — Liquidity (cash)',
        body: 'Asks: if income stopped, how many months could they cover their essential bills from cash alone? This is the "cash runway." Red is under 6 months, amber 6–9, green 9+. Explain it as "your financial shock absorber — enough set aside so a bad month doesn\'t force you to sell investments at the worst time."',
      },
      {
        heading: 'Safety Light 2 — Concentration',
        body: 'Asks: is any single holding too big a share of everything? Amber at 15–20%, red above 20%. The plain version is "too many eggs in one basket — if that one holding has a bad year, it drags your whole picture down with it." Very common with founders holding a lot of their own company or one big property.',
      },
      {
        heading: 'Safety Light 3 — Illiquids',
        body: 'Asks: is too much tied up in things that are slow to sell — property, a private business, collectibles? Amber at 7–10%, red above 10%. Explain the risk plainly: "these can be great investments, but if you needed cash quickly you couldn\'t easily reach this money."',
      },
      {
        heading: 'Investor Persona (investor type)',
        body: 'A one-line description — e.g. "Property-Led Investor" — matched from a set of eight types using their profile and their actual holdings. Stress that it\'s a mirror, not a box that limits them: "based on what you\'ve told me, you look like X — does that sound right?" It frames the whole conversation around who they actually are, and it\'s a natural place to let them correct you.',
      },
      {
        heading: 'The preferences banner — and why it might say "locked"',
        body: 'If any light is red, the tool says preference signals are "locked." All it means is: let\'s fix the urgent safety issue before we lean the portfolio in any direction. Say it as "safety before style — stabilise first, then optimise." It is not the tool breaking or penalising them; the preferences are safely recorded and will apply once the red is cleared. (This wording is being softened — it currently reads harsher than it means.)',
      },
    ],
    terms: [
      { term: 'Safety Lights', plain: 'a car dashboard — green / amber / red on three checks' },
      { term: 'Cash runway', plain: 'how many months your cash could cover the essential bills' },
      { term: 'Concentration', plain: 'how much is riding on a single holding — eggs in one basket' },
      { term: 'Persona / investor type', plain: 'a plain description of what kind of investor you look like' },
      { term: 'Locked', plain: 'a safety light is red — fix that before leaning into style' },
    ],
  },
  {
    stepId: 'beliefs',
    stepNumber: 6,
    title: 'Beliefs',
    onScreen: 'Eight agree/disagree statements on a five-point scale, plus a live "Tilt preview" showing eight dials.',
    covers:
      'Eight short statements about how the person likes to invest — do they prefer solid, established companies or cheaper out-of-favour ones; do they want a deliberate UK lean; does sustainability matter; are they worried about inflation; do they believe in tech; are they happy with smaller companies; and how comfortable are they with a bumpy ride. Each answer sets a "tilt" — a gentle lean — on one of eight dials, from strongly against to strongly for.',
    sayThis:
      '"Eight quick statements about how you like to invest — no right answers. Two people with identical portfolios can want very different things, so this is where we capture what you actually prefer. Think of each answer as nudging a dial."',
    useful:
      'It captures the investor\'s personality and preferences, which numbers alone can\'t show. Two investors with the same holdings might want completely different things — one wants to lean into UK companies, another wants everything sustainable — and this is where that gets heard. It makes the later scenarios feel like theirs, not off-the-shelf.',
    howUsed:
      'These leanings shape the illustrative scenarios in the next step — but only within the safety guardrails. If a light is red, the tilts are recorded but held back (the "locked" idea from Analysis) so the tool never leans a portfolio in a riskier direction while a safety issue is unresolved. Nothing here buys or sells anything — it only flavours the illustration you\'ll show next.',
    sections: [
      {
        heading: 'What a "tilt" is (the question you get most)',
        body: 'A tilt is a gentle lean in a direction — like seasoning food to taste. "Lean a bit more towards UK companies," "lean away from smaller companies." Say it exactly like that. The key reassurance: a tilt never buys or sells anything and never overrides safety — it only flavours the illustration the tool draws for you. If someone gets stuck on the word, drop it and just say "your preferences."',
      },
      {
        heading: 'What an "axis" is (and the eight of them)',
        body: 'An axis is just one dial for one preference — there are eight. Each statement they answer turns one dial from "lean strongly away" (−1) through neutral (0) to "lean strongly towards" (+1). The eight: quality companies, value/cheaper companies, technology, a UK lean, sustainability (ESG), inflation protection, smaller companies, and comfort with ups-and-downs. You almost never need the word "axis" out loud — say "dial" or "preference."',
      },
      {
        heading: 'The Tilt preview (the eight dials on screen)',
        body: 'As they answer, the preview mirrors their choices straight back — which way each dial leans and how strongly (light, moderate, or strong). It\'s a preview of preferences, not a portfolio, and nothing is being bought or sold. It\'s a nice "the tool is listening to you" moment — point at a dial and say "there\'s your UK lean, showing up already."',
      },
      {
        heading: 'How this shapes the next screen',
        body: 'Explain the hand-off: "these leanings feed the illustrative directions on the next screen — but always inside your safety limits. If one of your safety lights is red, we still capture your preferences, we just don\'t apply them until that\'s sorted." That keeps the safety-before-style story consistent.',
      },
    ],
    terms: [
      { term: 'Tilt', plain: 'a lean, like seasoning to taste — never buys or sells' },
      { term: 'Axis', plain: 'one dial for one preference (there are 8)' },
      { term: 'Beliefs (vs Outlook)', plain: 'how you like to invest — Outlook, later, is what you think happens in the world' },
    ],
  },
  {
    stepId: 'target',
    stepNumber: 7,
    title: 'Scenario (Direction)',
    onScreen: 'Three side-by-side scenarios, each showing the current allocation vs an illustrative range, plus which preferences were reflected or held back. A percentage / pound-value toggle.',
    covers:
      'The tool generates three illustrative directions the portfolio could lean. "Neutral baseline" barely changes anything (the do-nothing comparison). "Guardrail-first" prioritises safety and only nudges preferences gently. "Preference-leaning" applies the investor\'s beliefs more strongly. Each shows ranges for asset classes and regions with the investor\'s current position marked, and they can flip between percentages and rough pound values.',
    sayThis:
      '"Three versions of the same idea at different strengths — like a volume knob on your preferences. They\'re shown as ranges, never targets, and never a recommendation. The point is to see how much your preferences would actually move things once safety comes first."',
    useful:
      'It lets the investor see the range of possibilities for their portfolio in one glance, instead of a single prescriptive answer. Showing three side by side keeps it honest and non-pushy, and gives them something concrete to take into a real conversation with an adviser: "here\'s roughly the direction I\'d lean, and here\'s what safety would allow."',
    howUsed:
      'This is where the beliefs from Step 6 and the safety lights from Step 5 come together visibly. The preferences push the ranges; the guardrails cap how far they can push. If a safety light is red, all three scenarios collapse onto "current" — the tool honestly saying "there\'s nothing to illustrate until the red is fixed." It feeds the summary and the final report.',
    sections: [
      {
        heading: 'The three scenarios (guardrail-first vs preference-leaning)',
        body: 'Use the volume-knob analogy. Neutral baseline = knob off, essentially the portfolio as-is. Guardrail-first = low volume: safety leads, preferences nudge gently. Preference-leaning = high volume: leans into their beliefs as far as the guardrails allow. Same preferences, three strengths — nobody is being told to pick one. The value of three is that the investor sees the full spread, from "change little" to "lean in."',
      },
      {
        heading: 'The allocation ranges',
        body: 'Each row shows "Current: X%" against an "Illustrative: low–high%." Stress the word range: "it\'s a band, a direction of travel, not a target to hit." The current-position marker lets them see at a glance whether a preference would move something up or down, and by how much. The percentage / pound toggle helps people who think in money rather than percentages.',
      },
      {
        heading: 'Which preferences were reflected (or held back)',
        body: 'For each preference the tool shows whether it was Reflected, Partially reflected, Constrained (held back by a safety limit), or Not reflected. This is where you can point and say "your UK lean shows up here — but this one\'s held back because your concentration flag is amber." It makes the guardrails visible rather than mysterious.',
      },
      {
        heading: 'When all three look the same',
        body: 'Pre-empt this: if a safety light is red, the preferences are switched off and all three scenarios converge on "current." It can look like "the tool did nothing" — explain it\'s the opposite: "it\'s deliberately not leaning your portfolio anywhere while there\'s a red safety flag. Fix that, and these ranges open up."',
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
    onScreen: 'Fifteen agree/disagree statements about the world — jobs, AI, house prices, government debt, energy, the pound, credit — on the same five-point scale.',
    covers:
      'Fifteen statements about how the person sees the next few years playing out in the wider world — will AI hit white-collar jobs, will remote work cut city-centre housing demand, will the pound weaken, will government debt become a problem, will energy shocks hit. Deliberately about the world, not their portfolio. It\'s a separate thing from the Beliefs step.',
    sayThis:
      '"This one isn\'t about your portfolio — it\'s about the world. Fifteen views on the next few years: will AI take jobs, will house prices fall, will the pound weaken. Then, on the next screen, we\'ll show how your actual holdings would fare if you turn out to be right."',
    useful:
      'It captures the investor\'s worldview — the things they actually worry or feel strongly about — and gives you a way to connect those worries to their money. That\'s a powerful, personal conversation: "you said you\'re worried about a property downturn; here\'s what that would mean for you."',
    howUsed:
      'Each answer nudges a set of named "what-if" scenarios (things like Stagflation, a Property Crash, or a Rate-Cut recovery) up or down. Agreeing with a gloomy statement adds weight to the matching scenario; disagreeing takes it away; neutral does nothing. The result is a weighted picture of which scenarios they find most plausible, which drives the stress-test and the illustrative alternatives on the next two screens.',
    sections: [
      {
        heading: 'Why it\'s separate from Beliefs (Step 6)',
        body: 'This is the distinction to nail, because people conflate them. Beliefs = how you like to invest (your style). Outlook = what you think will happen in the world (your worldview). One shapes the direction of your portfolio; the other gets stress-tested against history. Say plainly: "earlier I asked how you like to invest — this is different, this is what you think the world will do."',
      },
      {
        heading: 'How the answers are turned into scenarios',
        body: 'Explain it simply: "the more strongly you agree with a worry, the more weight we put on the matching scenario." So someone who strongly agrees that mortgage costs will bite and house prices will fall ends up with a heavily-weighted "Property Crash" scenario, which is exactly what gets tested next. Neutral answers add nothing, so encourage them to answer definitely where they have a view.',
      },
      {
        heading: 'If they answer mostly "neutral"',
        body: 'Be ready for this: if they sit on the fence for most statements, the answers cancel out and the tool says it doesn\'t have enough signal to model an outlook. That\'s by design, not a bug. Nudge them: "if you\'ve got a view either way, lean into it — that\'s what lets the next screen show you something specific."',
      },
    ],
    terms: [
      { term: 'Outlook (vs Beliefs)', plain: 'what you think happens in the world — Beliefs was how you like to invest' },
      { term: 'Scenario', plain: 'a named "what if" — e.g. a property crash, or a recovery' },
    ],
  },
  {
    stepId: 'outlook-results',
    stepNumber: 9,
    title: 'Outlook Results (Impact)',
    onScreen: 'An "Alignment score" out of 100, any amber warning flags, per-asset historical impact rows, and a "would your cash last?" note.',
    covers:
      'This maps the investor\'s worldview onto their actual holdings, using real history where the data allows. It shows an "alignment score" (how well what they own matches how they see the world), flags any obvious mismatches, and — for each asset type they hold — replays how it behaved in real past crises like the ones they\'re worried about (the dot-com bust, 2008, COVID, the 2022 rate shock).',
    sayThis:
      '"Here\'s where your view of the world meets what you actually own. We replay real past episodes to show how your holdings behaved in times like the ones you flagged — and, importantly, whether your cash would carry you through, or whether you\'d be forced to sell at the worst possible moment."',
    useful:
      'It makes an abstract worry concrete and personal: not "markets can fall" but "in a downturn like the one you\'re worried about, this part of your portfolio dropped by this much and took this long to recover." The "would your cash last?" point in particular tends to land hard and is genuinely useful — it\'s the difference between riding out a crash and being forced to sell into it.',
    howUsed:
      'It uses the weighted scenarios from the Outlook step and the holdings from Step 4, grounded in a library of real historical episodes. It sets up the next screen (Alternatives), which shows one illustrative way to reduce the pain identified here. Nothing is recommended — it\'s a stress-test, not a forecast.',
    sections: [
      {
        heading: 'The alignment score (out of 100)',
        body: 'How well what they own matches how they see the world: Broadly aligned (70+), Partially aligned (40+), or Misaligned. Be honest that it\'s a rough read, not a precise measurement — "think of it as a temperature check, not a lab result." A low score isn\'t a failure; it\'s a talking point: "your holdings and your worries are pulling in different directions — worth understanding why."',
      },
      {
        heading: 'The warning flags',
        body: 'Amber notes that appear when something stands out — for example "you describe yourself as cautious, but your holdings are concentrated," or "one asset type is over a third of your modelled portfolio." These are conversation starters, not alarms. Read them out and ask "does that surprise you?"',
      },
      {
        heading: 'Historical impact rows',
        body: 'For each asset type they hold, the worst drop it suffered in a matching past crisis and how long it took to recover. Some rows are backed by real, cited episode data; others (like property or global shares, where clean history is harder) are clearly labelled as illustrative. Point out the labelling — it shows the tool is being honest about what it does and doesn\'t know.',
      },
      {
        heading: 'The income-runway note (the human one)',
        body: 'The most important line on the screen: if the worst scenario hit, would their cash buffer cover essential spending until markets recovered — or would they run out partway and be forced to sell at the bottom? Give this room. It\'s the single most relatable idea in the whole tool: "the goal is never to be a forced seller in a crash."',
      },
    ],
    terms: [
      { term: 'Alignment score', plain: 'how well what you own matches how you see the world, out of 100' },
      { term: 'Trough', plain: 'the lowest point — the bottom of the fall' },
      { term: 'Modelled portfolio', plain: 'the part of your holdings we have real history for' },
    ],
  },
  {
    stepId: 'outlook-alternatives',
    stepNumber: 10,
    title: 'Alternatives',
    onScreen: 'One simulated, staged way to soften the impact: summary tiles, a "Do now" vs "Later — illiquid" split, and a before/after comparison.',
    covers:
      'This shows one illustrative, staged way to move the portfolio towards something that better matches the investor\'s worldview and reduces the pain shown on the previous screen. It splits the moves into "do now" (easy, liquid changes) and "later" (slow, illiquid ones like property), estimates the rough cost, and shows a clear before-and-after.',
    sayThis:
      '"If the previous screen worried you, here\'s one illustrative way to soften it — staged into what\'s sensible to do now versus slower decisions for later. It\'s a simulation of your own outlook, not advice on what to do, and it doesn\'t touch anything you own."',
    useful:
      'It makes the alternative tangible without ever prescribing it — the investor sees "here\'s roughly what closing that gap would involve, in what order, and at roughly what cost." The staging mirrors how a sensible person actually thinks: rebuild the cash cushion first, do the easy things now, take your time over property.',
    howUsed:
      'It takes the worldview-blended "ideal" mix and compares it to the current holdings, then works out a sensible set of moves to close the gap, rebuilding the cash safety buffer first. The before/after re-runs the same stress-test from the previous screen so the investor can see whether the "forced to sell" risk actually improves. It leads into the wrap-up steps.',
    sections: [
      {
        heading: 'The summary tiles',
        body: 'How much changes in total, a rough estimate of how much would change hands (turnover), the indicative cost, and liquidity before versus after. Be upfront: the costs use fixed, illustrative rates, not real quotes. Frame it as "a sense of the scale, not a bill."',
      },
      {
        heading: '"Do now" vs "Later — illiquid"',
        body: 'The tool deliberately stages the moves: rebuild the cash cushion first, do the easy liquid moves now, and defer property to "later" because it\'s slow and costly to move. This ordering is the point — say "you don\'t do this all at once; you do the safe, cheap things first and take your time over the rest." It reassures cautious people that nothing drastic is being suggested.',
      },
      {
        heading: 'Before / after',
        body: 'Two doughnut charts and a line-by-line comparison: alignment before vs after, the worst-episode drop before vs after, and whether the "forced to sell" verdict improves. It re-runs the exact same models from the previous screen as if the staged changes were made in full — so it\'s a like-for-like "here\'s what it would buy you."',
      },
      {
        heading: 'The honest caveat',
        body: 'Say it out loud — it builds trust: "this is one illustrative path, not an optimised plan, and it ignores tax wrappers, capital gains, and timing. The real version of this is a conversation with an adviser." Naming the limits makes the whole thing more credible, not less.',
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
    onScreen: 'A plain-English checkpoint: current position, "what matters most now", the status of the eight preferences, and a short review checklist.',
    covers:
      'A summary that pulls everything together in plain English: the safety-light status, which preferences were applied or held back, and a clear read of the overall position. Nothing is recalculated here — it\'s a reflection point, a "so where does that leave us?" pause.',
    sayThis:
      '"Let\'s take stock. Here\'s where you stand overall, what matters most right now, and what — if anything — is holding your flexibility back. Nothing here tells you to buy or sell; it\'s a clear starting point for a proper conversation."',
    useful:
      'It gives both the investor and their adviser a clear, shared starting point for a real conversation — where they stand, what\'s flagged, and what to discuss next. After a lot of screens, it\'s the "here\'s the headline" moment that ties it all back together.',
    howUsed:
      'It reads straight from the earlier steps — the safety lights, the persona, the preference statuses — and restates them without changing anything. It\'s the bridge from "here\'s your picture" to the final wrap-up screens and the report.',
    sections: [
      {
        heading: 'Your current position',
        body: 'One honest summary line — within guardrails, caution, red-but-you\'ve-chosen-to-hold, or action-required — so everyone\'s on the same page before moving on. Read it out and let it land; it\'s the one-sentence version of the whole analysis.',
      },
      {
        heading: 'What matters most now',
        body: 'The three safety lights again, ordered worst-first, each with a short "why it matters." This focuses attention on the single most important thing rather than everything at once — "if we only do one thing, it\'s this."',
      },
      {
        heading: 'Preference signals status',
        body: 'All eight preferences and whether each was applied, constrained, or locked — nothing hidden. It reinforces the safety-before-style story: "your preferences are all captured; a couple are on hold until the amber flag improves."',
      },
    ],
  },
  {
    stepId: 'plan-transition',
    stepNumber: 12,
    title: 'Transition',
    onScreen: 'Three summary cards (safety status, preference status, policy constraints) and a five-step timeline about what would govern pace and sequencing, plus an "Export CSV" button.',
    covers:
      'This shows the structural constraints that would govern any future changes — whether safety issues dominate, whether preferences are active or on hold, and what pacing limits apply (for example, spreading changes over a minimum number of years, often to manage tax). It\'s the "rules of the road," not a plan, and it changes nothing.',
    sayThis:
      '"People often ask \'how quickly could I actually change this?\' — and the honest answer is: gradually, and in a sensible order. This shows what governs the pace: tax timing, the account types involved, and your safety limits. You don\'t rip a portfolio apart overnight."',
    useful:
      'It directly answers the question investors almost always ask — "how fast could this happen?" — and sets the expectation that Unlock is measured and sensible rather than a day-trading tool. That\'s reassuring, especially to a cautious business owner.',
    howUsed:
      'It reads the safety status and preference status from earlier, plus the pacing rules from policy, and lays them out as a timeline. Nothing is executed. The Export CSV button lets the investor take a simple summary of these constraints away for discussion.',
    sections: [
      {
        heading: 'The three summary cards',
        body: 'A quick "where do we stand": current safety status, whether preferences are active or locked, and a note that pacing limits apply. It\'s the one-glance context before the timeline.',
      },
      {
        heading: 'The five-step timeline',
        body: 'The structural things that would govern change, in order: any urgent pressure, how the account types affect access and tax, pacing limits (why changes get spread over time), preferences versus constraints, and the final snapshot. Walk it as "the sensible sequence anyone would follow," not a to-do list.',
      },
      {
        heading: 'Export CSV',
        body: 'Downloads these constraints as a simple summary for discussion afterwards, carrying a clear "not financial advice" line. Useful for the investor to hand to their own adviser.',
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
    onScreen: 'A table of holdings grouped by account type (wrapper), with amounts and a priority order, plus a possible "Bed & ISA" suggestion.',
    covers:
      'A factual summary of how the investor\'s money is spread across account types — ISAs, pensions (SIPPs), general accounts (GIAs), cash, offshore bonds. It also checks whether a "Bed & ISA" move might be worth considering. It makes the point that the wrapper — the box the investment sits in — can matter as much as the investment itself.',
    sayThis:
      '"Same investment, different account, different tax. This shows how your money is spread across ISAs, pensions and general accounts — and where something might have a smarter home. You might have the right investments sitting in the wrong wrappers, and this just makes that visible."',
    useful:
      'Wrapper placement affects tax and flexibility, and it\'s something most people never look at. Showing that an investor "might have the right investments in the wrong wrappers" is genuinely eye-opening and a strong, practical note to end the substantive flow on — without telling them to move anything.',
    howUsed:
      'It reads the wrappers from the holdings entered in Step 4, groups and totals them, and applies a policy priority order to illustrate placement. The Bed & ISA check flags holdings sitting in a taxable account on a gain that could be sheltered. It all flows into the final report. It\'s illustrative — the best wrapper genuinely depends on someone\'s full tax position.',
    sections: [
      {
        heading: 'The account/wrapper table',
        body: 'Each wrapper — ISA (tax-free growth), SIPP (pension), GIA (a normal taxable account), cash, offshore bond — with how much is in it, its role, and a priority order. Explain the priority as "a general default order for filling tax-efficient accounts first," and be clear it\'s illustrative because the right answer depends on the person\'s tax position.',
      },
      {
        heading: 'The Bed & ISA badge (if it appears)',
        body: 'Flags a holding sitting in a taxable account on a gain that could be moved into an ISA to shelter its future growth from tax. Explain the term simply — "sell it in the taxable account and buy it straight back inside your ISA" — and frame it as "worth a conversation," never an instruction.',
      },
    ],
    terms: [
      { term: 'Wrapper', plain: 'the account an investment sits in — changes the tax treatment' },
      { term: 'ISA / SIPP / GIA', plain: 'tax-free box / pension box / normal taxable box' },
      { term: 'Bed & ISA', plain: 'sell in a taxable account, buy back inside an ISA to shelter future growth' },
    ],
  },
];

export const PRESENTER_NOTE_BY_STEP: Record<string, PresenterNote> = Object.fromEntries(
  PRESENTER_NOTES.map((n) => [n.stepId, n]),
);
