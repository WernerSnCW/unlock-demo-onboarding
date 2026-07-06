import { sequenceTopics, type Topic } from './topicSequencer';
import { getExplainerData } from './explainerContent';

export function getSequencedTopics(): Topic[] {
  const data = getExplainerData();
  const pct = (n: number) => `${Math.round(n * 100)}%`;

  const topics: Topic[] = [
    {
      id: 'philosophy',
      kind: 'concept',
      title: 'Philosophy & invariants',
      dependsOn: [],
      order: 0,
      render: () => ({
        prose: [
          'This product provides intelligence, never advice. It holds no funds and takes no execution action.',
          'An earlier version ran a forward-looking Monte Carlo simulation. It was deleted: persona matching used magnitude-blind cosine similarity, the belief engine could only add risk signal, correlation dampening mistreated negative correlations, calibrated probabilities were computed then thrown away, and correlated shocks were compounded with a placeholder identity matrix.',
          'The replacement (see Scenario Stress) follows two rules: no invented numbers, and no extrapolation beyond what markets actually reached historically.',
          'Persona (see Persona Engine) is an anchor, not an input — it never feeds a recommendation or target allocation, and no match-percentage is ever shown.',
        ],
        tables: [],
      }),
    },
    {
      id: 'safety-lights',
      kind: 'rule',
      title: 'Safety Lights',
      dependsOn: ['philosophy'],
      order: 0,
      render: () => ({
        prose: [
          'Safety Lights measure liquidity, concentration, and illiquid exposure on the investor’s real, current portfolio. The worst of the three becomes the overall status, and a RED overall status blocks belief-driven tilts from applying.',
        ],
        tables: [
          {
            headers: ['Light', 'RED', 'AMBER', 'GREEN'],
            rows: [
              ['Liquidity (cash runway)', `< ${data.safetyLights.liquidity.redBelowMonths} months`, `${data.safetyLights.liquidity.redBelowMonths}–${data.safetyLights.liquidity.amberBelowMonths} months`, `≥ ${data.safetyLights.liquidity.amberBelowMonths} months`],
              ['Concentration (largest holding)', `> ${pct(data.safetyLights.concentration.redAboveFraction)}`, `${pct(data.safetyLights.concentration.amberAboveFraction)}–${pct(data.safetyLights.concentration.redAboveFraction)}`, `≤ ${pct(data.safetyLights.concentration.amberAboveFraction)}`],
              ['Illiquids (% of portfolio)', `> ${pct(data.safetyLights.illiquids.redAboveFraction)}`, `${pct(data.safetyLights.illiquids.amberAboveFraction)}–${pct(data.safetyLights.illiquids.redAboveFraction)}`, `≤ ${pct(data.safetyLights.illiquids.amberAboveFraction)}`],
            ],
          },
        ],
      }),
    },
    {
      id: 'persona-engine',
      kind: 'formula',
      title: 'Persona Engine',
      dependsOn: ['philosophy', 'safety-lights'],
      order: 0,
      render: () => ({
        prose: [
          'Six trait scores (T1–T6, each 0–1) are computed deterministically from Intake and Holdings. Three hard overrides (business ≥25% of net worth, property ≥30% of the portfolio, crypto band >25%) assign a persona at full confidence and bypass weighting entirely.',
          'Otherwise, each of the eight personas gets a score — the dot product of the investor’s trait scores against that persona’s weight row (weights sum to 1.0 per persona) — and the highest wins. Confidence is the gap between the top two scores, not a probability, and is never shown to the investor as a percentage.',
        ],
        tables: [
          {
            headers: ['Persona', 'Risk', 'Alts', 'Property', 'Liquidity', 'Income', 'Complexity'],
            rows: Object.entries(data.personaWeights).map(([code, w]) => [
              code, String(w.risk_appetite), String(w.alternatives_bias), String(w.property_bias),
              String(w.liquidity_comfort), String(w.income_orientation), String(w.complexity_proxy),
            ]),
          },
        ],
      }),
    },
    {
      id: 'beliefs-tilts',
      kind: 'rule',
      title: 'Beliefs → Portfolio Tilts',
      dependsOn: ['philosophy', 'safety-lights'],
      order: 1,
      render: () => ({
        prose: [
          'Eight style/preference questions map to eight axes via normaliseAnswer(a) = (a − 3) / 2, giving −1.0..+1.0 in 0.5 steps. One deliberate inversion: VOLATILITY_AVERSION = −normalised(Q_VOLATILITY_COMFORT).',
          'Intensity bands on |score|: neutral below 0.20, light 0.20–0.50, moderate 0.50–0.80, strong at or above 0.80. If the overall Safety Light status is RED, tilts are captured but not applied.',
        ],
        tables: [],
      }),
    },
    {
      id: 'scenario-stress',
      kind: 'formula',
      title: 'Outlook & Scenario Stress',
      dependsOn: ['beliefs-tilts', 'safety-lights'],
      order: 0,
      render: () => ({
        prose: [
          'Real holdings are replayed through cited historical episodes (Shiller, JST Macrohistory, FRED) — never a forward simulation. portfolioReturn(t) = Σ w[i] × episode.path[i][t] for each asset bucket i.',
          'A read-position slider interpolates between the blended central path and the worst observed edge of the chosen episodes — it can never show a loss deeper than an episode actually reached, because it only interpolates between two real observations.',
          'Alignment score = 100 × (1 − L1distance(currentMix, beliefWeightedIdealMix) / 2) — the overlap coefficient between two mix vectors, always shown with a qualitative band, never a bare number.',
        ],
        tables: [],
      }),
    },
    {
      id: 'illustrative-alternatives',
      kind: 'rule',
      title: 'Illustrative Alternatives',
      dependsOn: ['scenario-stress', 'safety-lights'],
      order: 0,
      render: () => ({
        prose: [
          'One illustrative way to reduce the modelled impact, staged into liquid moves (Stage 1, executable now) and illiquid moves (Stage 2, deferred). Trades below 0.5 percentage points are dropped as noise.',
          'Three invariants: after-mix equals the target exactly; after-alignment is 100 by construction and captioned as definitional, never an "uplift"; the runway comparison is a verdict only, never a "months gained" number, because the underlying buffer walk is mix-independent.',
        ],
        tables: [],
      }),
    },
    {
      id: 'citations',
      kind: 'citation',
      title: 'Data & evidence citations',
      dependsOn: ['persona-engine', 'scenario-stress'],
      order: 0,
      render: () => ({
        prose: [
          'Historical scenario data: Shiller (US equity/bonds, monthly, back to 1871), JST Macrohistory (18 economies, annual, back to 1870), FRED. Cross-check series (FTSE, MSCI, Bloomberg Global Aggregate) are illustrative pending full redistribution-licensing review.',
          'Persona evidence: the "built from ONS/FCA" claim is killed — those sources publish distributions and small, wrong-population typologies, never a persona set for this cohort. Current citation line: Pompian (2012) and Bailard/Biehl/Kaiser (1986) as incorporated in the CFA Institute Level III curriculum, calibrated against LongAngle 2026, BofA Private Bank 2024, and Connection Capital 2023 UK HNW survey data.',
        ],
        tables: [],
      }),
    },
    {
      id: 'non-goals',
      kind: 'concept',
      title: 'What this product deliberately does not do',
      dependsOn: ['persona-engine', 'beliefs-tilts', 'scenario-stress', 'illustrative-alternatives', 'citations'],
      order: 0,
      render: () => ({
        prose: [
          'No probabilities or forecasts. No modelled cross-asset correlation. No FX/currency modelling. No user-facing persona match-percentage. No persona-as-recommendation-input. No reference-portfolio comparison for the live 8 personas. No "you should" language on the alternatives surface. No execution action, no holding of funds.',
        ],
        tables: [],
      }),
    },
    {
      id: 'known-limitations',
      kind: 'concept',
      title: 'Known limitations & open items',
      dependsOn: ['non-goals'],
      order: 0,
      render: () => ({
        prose: [
          'Europe/emerging equity have zero historical episode data (currently unmodelled, not illustrative). The TECH_CORRECTION scenario cites Nasdaq −78% but the broad US-equity bucket tops out near −42%. No cross-bucket correlation or FX modelling (by design). The liquidity floor in staged rebalancing is flat, not withdrawal-rate-sensitive yet. CAPITAL_PRESERVATION is evidentially indistinguishable from INCOME_STABILITY — an open merge/differentiate decision. Full FCA PS25/22 Consumer Duty sign-off on the alternatives surface has not happened yet.',
        ],
        tables: [],
      }),
    },
    {
      id: 'formula-reference',
      kind: 'formula',
      title: 'Formula quick-reference',
      dependsOn: ['safety-lights', 'persona-engine', 'beliefs-tilts', 'scenario-stress', 'illustrative-alternatives'],
      order: 0,
      render: () => ({
        prose: [
          'cash_runway_months = liquid_cash / (annual_essential_spend / 12)',
          'score(persona) = Σ trait[i] × weight[persona][i]; match_confidence = clamp(topScore − secondScore, 0, 1)',
          'normaliseAnswer(1..5) = (answer − 3) / 2',
          'portfolioReturn(t) = Σ w[i] × episode.path[i][t]; alignmentScore = 100 × (1 − L1(currentMix, idealMix) / 2)',
        ],
        tables: [],
      }),
    },
  ];

  return sequenceTopics(topics);
}
