export type DemoActionType = 'type' | 'select' | 'click' | 'clickText' | 'wait';

export interface DemoAction {
  type: DemoActionType;
  selector?: string;
  value?: string;
  ms?: number;
}

export interface DemoStep {
  route: string;
  label: string;
  actions: DemoAction[];
}

const type = (selector: string, value: string): DemoAction => ({ type: 'type', selector, value });
const select = (selector: string, value: string): DemoAction => ({ type: 'select', selector, value });
const click = (selector: string): DemoAction => ({ type: 'click', selector });
const clickText = (value: string): DemoAction => ({ type: 'clickText', value });
const wait = (ms: number): DemoAction => ({ type: 'wait', ms });

const HOLDINGS: Array<[string, string, string, string]> = [
  ['Cash reserve', 'Cash Account', 'Cash', '141667'],
  ['Government bond fund', 'GIA (General)', 'Bond', '141667'],
  ['UK equity ISA', 'ISA', 'Equity', '141666'],
  ['Global equity fund', 'GIA (General)', 'Equity', '141667'],
  ['Property fund', 'GIA (General)', 'Property', '141667'],
  ['Alternatives fund', 'GIA (General)', 'Alternatives', '141666'],
];

const holdingActions: DemoAction[] = HOLDINGS.flatMap(([name, wrapper, assetClass, value], i) => [
  ...(i > 0 ? [click('[data-testid="button-add-holding"]')] : []),
  type(`[data-testid="input-holding-name-${i}"]`, name),
  type(`[data-testid="input-holding-value-${i}"]`, value),
  select(`[data-testid="select-holding-wrapper-${i}"]`, wrapper),
  select(`[data-testid="select-holding-asset-class-${i}"]`, assetClass),
]);

const BELIEF_ANSWERS: Array<[string, number]> = [
  ['Q_VOLATILITY_COMFORT', 1],
  ['Q_QUALITY', 4],
  ['Q_VALUE', 3],
  ['Q_TECH', 2],
  ['Q_UK_BIAS', 4],
  ['Q_ESG', 3],
  ['Q_INFLATION', 4],
  ['Q_SMALL_CAP', 2],
];

const OUTLOOK_ANSWERS: Array<[string, number]> = [
  ['B1_mobility_views', 4],
  ['B2_job_security_white_collar', 2],
  ['B3_remote_work_tenure', 4],
  ['B4_government_confidence', 2],
  ['B5_energy_policy', 5],
  ['B6_ai_adoption_speed', 4],
  ['B7_renting_vs_buying', 2],
  ['B8_local_investment_preference', 4],
  ['B9_geopolitical_risk', 5],
  ['B10_fx_view', 2],
  ['B11_credit_availability', 4],
  ['B12_policy_support', 1],
  ['B13_fiscal_sustainability', 4],
  ['B14_mortgage_reset_pressure', 5],
  ['B15_external_balance_risk', 2],
];

export const DEMO_INVESTOR_LABEL = 'Alex Morgan — Capital Preservation Investor (synthetic)';

export const DEMO_STEPS: DemoStep[] = [
  {
    route: '/onboarding-v2/welcome',
    label: 'Welcome',
    actions: [wait(800), click('[data-testid="button-next"]')],
  },
  {
    route: '/onboarding-v2/method',
    label: 'Choose a method',
    actions: [wait(500), click('[data-testid="method-manual"]')],
  },
  {
    route: '/onboarding-v2/intake',
    label: 'Tell us about yourself',
    actions: [
      type('[data-testid="input-full-name"]', 'Alex Morgan'),
      type('[data-testid="input-email"]', 'alex.morgan@example.com'),
      select('[data-testid="select-investor-type"]', 'Individual'),
      select('[data-testid="select-region"]', 'United Kingdom'),
      type('[data-testid="input-annual-income"]', '150000'),
      type('[data-testid="input-annual-spend"]', '40000'),
      type('[data-testid="input-liquid-cash"]', '60000'),
      type('[data-testid="input-investable-assets"]', '850000'),
      type('[data-testid="input-monthly-contribution"]', '1000'),
      select('[data-testid="select-primary-goal"]', 'Preserve capital'),
      select('[data-testid="select-time-horizon"]', '7 to 15 years'),
      select('[data-testid="select-risk-comfort"]', 'Very Low - I prefer stability over growth'),
      click('[data-testid="toggle-investor-profile"]'),
      wait(400),
      click('[data-testid="button-next"]'),
    ],
  },
  {
    route: '/onboarding-v2/holdings',
    label: 'Current holdings',
    actions: [...holdingActions, click('[data-testid="button-next"]')],
  },
  {
    route: '/onboarding-v2/analysis',
    label: 'Portfolio analysis',
    actions: [wait(3500), click('[data-testid="button-next"]')],
  },
  {
    route: '/onboarding-v2/beliefs',
    label: 'Investment beliefs',
    actions: [
      ...BELIEF_ANSWERS.map(([q, v]) => click(`[data-testid="belief-${q}-${v}"]`)),
      click('[data-testid="beliefs-continue-button"]'),
    ],
  },
  {
    route: '/onboarding-v2/target',
    label: 'Target scenario',
    actions: [wait(3500), click('[data-testid="target-continue-button"]')],
  },
  {
    route: '/onboarding-v2/outlook',
    label: 'Outlook statements',
    actions: [
      ...OUTLOOK_ANSWERS.map(([q, v]) => click(`[data-testid="outlook-answer-${q}-${v}"]`)),
      click('[data-testid="outlook-continue-button"]'),
    ],
  },
  {
    route: '/onboarding-v2/outlook-results',
    label: 'Impact of your outlook',
    actions: [wait(3500), click('[data-testid="outlook-results-continue-button"]')],
  },
  {
    route: '/onboarding-v2/outlook-alternatives',
    label: 'Illustrative alternatives',
    actions: [wait(4000), clickText('Later'), wait(2500), click('[data-testid="alternatives-continue-button"]')],
  },
  {
    route: '/onboarding-v2/next-steps',
    label: 'Next steps',
    actions: [wait(3500), click('[data-testid="nextsteps-continue-button"]')],
  },
  {
    route: '/onboarding-v2/plan/transition',
    label: 'Transition plan',
    actions: [wait(3500), click('[data-testid="button-next"]')],
  },
  {
    route: '/onboarding-v2/plan/wrappers',
    label: 'Wrappers',
    actions: [wait(3500)],
  },
];
