// Symmetric both-sides framing shown when a Safety Light is RED (see Task 6's UI component).
// Neither side is written to read as more reasonable than the other — this is itself the
// compliance-relevant property, not just accuracy. See the "no loaded language" test in
// safetyLightPerspectives.test.ts, which is the automated guard against drift.

export type SafetyLightType = 'liquidity' | 'concentration' | 'illiquids';

export interface Perspective {
  /** What an investor taking this stance typically values — factual, not persuasive. */
  valuePoints: string[];
  /** What that stance gives up — stated plainly, not minimised. */
  tradeOff: string;
}

export interface PerspectivePair {
  REDUCE: Perspective;
  HOLD_DELIBERATE: Perspective;
}

export const SAFETY_LIGHT_PERSPECTIVES: Record<SafetyLightType, PerspectivePair> = {
  liquidity: {
    REDUCE: {
      valuePoints: [
        'More room to cover essential spending through a market downturn without needing to sell other holdings at a bad time.',
        'Less month-to-month exposure to near-term bills or unexpected costs.',
        'More flexibility to act on an opportunity if one comes up.',
      ],
      tradeOff: 'Cash held as a buffer is not invested, so it does not participate in market growth.',
    },
    HOLD_DELIBERATE: {
      valuePoints: [
        'Other reliable, fast-access sources of income or credit outside this portfolio — for example a salary, a second portfolio, or a credit facility — that make a large standalone buffer less necessary.',
        'Keeping more capital invested and working rather than held aside.',
      ],
      tradeOff: 'A thinner buffer means less cushion if an unexpected cost and a market downturn happen at the same time.',
    },
  },
  concentration: {
    REDUCE: {
      valuePoints: [
        'Less exposure to any single company or asset’s specific bad news.',
        'A smoother, more predictable overall return profile across the portfolio.',
      ],
      tradeOff: 'Reducing a concentrated position can cap the upside if that holding performs exceptionally well, and may trigger a disposal (with its own cost or tax consequences).',
    },
    HOLD_DELIBERATE: {
      valuePoints: [
        'Specific knowledge of, or control over, that holding — for example a family business, a long-held family asset, or deep familiarity with a company.',
        'Avoiding a disposal event that reducing the position would trigger, whether for tax, cost, or other reasons.',
      ],
      tradeOff: 'Holding a concentrated position means outsized exposure to that single holding’s specific ups and downs.',
    },
  },
  illiquids: {
    REDUCE: {
      valuePoints: [
        'Being able to access more of the portfolio quickly if plans change or an opportunity or emergency arises.',
        'Simpler valuation and less ongoing management than illiquid holdings typically require.',
      ],
      tradeOff: 'Reducing illiquid exposure can mean exiting an asset class the investor understands well or one that has performed well for them, and illiquid assets often carry real cost or delay to sell.',
    },
    HOLD_DELIBERATE: {
      valuePoints: [
        'Multi-generational or long-term ownership goals that a liquid substitute would not serve — for example a family property portfolio.',
        'A track record and specific expertise in that asset class.',
        'Income or other benefits the illiquid holding provides directly.',
      ],
      tradeOff: 'A large illiquid allocation means less flexibility to respond quickly if circumstances change.',
    },
  },
};
