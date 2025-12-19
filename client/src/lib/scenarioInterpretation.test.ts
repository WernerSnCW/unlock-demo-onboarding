import { describe, it, expect } from 'vitest';
import {
  computeScenarioSignals,
  computeConvergenceScore,
  computeCrossScenarioSignals,
  getScenarioInterpretation,
  getCrossScenarioSynthesis,
  SCENARIO_EXPLAINER,
  type InterpretationContext,
} from './scenarioInterpretation';
import type { IllustrativeScenario, AllocationBand } from '../state/onboardingV2Store';

const BANNED_VERBS = ['should', 'must', 'buy', 'sell', 'optimise', 'optimize', 'improve', 'save'];

function checkBannedVerbs(text: string): void {
  BANNED_VERBS.forEach(verb => {
    const regex = new RegExp(`\\b${verb}\\b`, 'i');
    expect(regex.test(text.toLowerCase())).toBe(false);
  });
}

function createMockBand(overrides: Partial<AllocationBand> = {}): AllocationBand {
  return {
    sleeve: 'Equity',
    current_pct: 50,
    illustrative_low_pct: 45,
    illustrative_high_pct: 55,
    direction: 'NEUTRAL' as const,
    midpoint_pct: 50,
    pressure: 0.5,
    clamped: false,
    debug: {
      scenarioStrength: 0.25,
      maxShift: 5,
      halfWidth: 5,
      rawPressure: 0,
      centreShift: 0,
      unclampedCentre: 50,
      clampedCentre: 50,
      unclampedMin: 45,
      unclampedMax: 55,
      bindingConstraints: [],
    },
    ...overrides,
  };
}

function createMockScenario(
  type: 'GUARDRAIL_FIRST' | 'PREFERENCE_LEANING' | 'NEUTRAL_BASELINE',
  bands: AllocationBand[]
): IllustrativeScenario {
  return {
    scenario_type: type,
    scenario_label: type === 'GUARDRAIL_FIRST' ? 'Guardrail-first' 
      : type === 'PREFERENCE_LEANING' ? 'Preference-leaning' 
      : 'Neutral baseline',
    scenario_description: 'Test scenario',
    asset_class_bands: bands,
    region_bands: [],
    wrapper_bands: [],
    applied_tilts: [],
    binding_constraints: [],
    tilts_applied_count: 0,
    tilts_constrained_count: 0,
  };
}

describe('Scenario Interpretation', () => {
  describe('computeScenarioSignals', () => {
    it('computes total movement from midpoint', () => {
      const scenario = createMockScenario('GUARDRAIL_FIRST', [
        createMockBand({ current_pct: 50, illustrative_low_pct: 45, illustrative_high_pct: 55 }), // mid=50, move=0
        createMockBand({ sleeve: 'Bond', current_pct: 30, illustrative_low_pct: 35, illustrative_high_pct: 45 }), // mid=40, move=10
      ]);
      const signals = computeScenarioSignals(scenario);
      expect(signals.total_movement_pp).toBe(10);
    });

    it('computes average range width', () => {
      const scenario = createMockScenario('GUARDRAIL_FIRST', [
        createMockBand({ illustrative_low_pct: 45, illustrative_high_pct: 55 }), // width=10
        createMockBand({ sleeve: 'Bond', illustrative_low_pct: 30, illustrative_high_pct: 40 }), // width=10
      ]);
      const signals = computeScenarioSignals(scenario);
      expect(signals.avg_range_width_pp).toBe(10);
    });
  });

  describe('computeConvergenceScore', () => {
    it('returns 1.0 for single scenario', () => {
      const scenarios = [createMockScenario('GUARDRAIL_FIRST', [createMockBand()])];
      expect(computeConvergenceScore(scenarios)).toBe(1.0);
    });

    it('returns high score for identical scenarios', () => {
      const band = createMockBand();
      const scenarios = [
        createMockScenario('GUARDRAIL_FIRST', [band]),
        createMockScenario('PREFERENCE_LEANING', [band]),
      ];
      expect(computeConvergenceScore(scenarios)).toBeGreaterThanOrEqual(0.9);
    });

    it('returns lower score for divergent scenarios', () => {
      const scenarios = [
        createMockScenario('GUARDRAIL_FIRST', [
          createMockBand({ illustrative_low_pct: 40, illustrative_high_pct: 50 }),
        ]),
        createMockScenario('PREFERENCE_LEANING', [
          createMockBand({ illustrative_low_pct: 60, illustrative_high_pct: 70 }),
        ]),
      ];
      expect(computeConvergenceScore(scenarios)).toBeLessThan(0.5);
    });
  });

  describe('computeCrossScenarioSignals', () => {
    it('detects converged scenarios', () => {
      const band = createMockBand();
      const scenarios = [
        createMockScenario('GUARDRAIL_FIRST', [band]),
        createMockScenario('PREFERENCE_LEANING', [band]),
        createMockScenario('NEUTRAL_BASELINE', [band]),
      ];
      const signals = computeCrossScenarioSignals(scenarios);
      expect(signals.scenarios_converged).toBe(true);
    });

    it('detects materially wider preference scenario', () => {
      const scenarios = [
        createMockScenario('GUARDRAIL_FIRST', [
          createMockBand({ illustrative_low_pct: 48, illustrative_high_pct: 52 }), // width=4
        ]),
        createMockScenario('PREFERENCE_LEANING', [
          createMockBand({ illustrative_low_pct: 40, illustrative_high_pct: 60 }), // width=20
        ]),
      ];
      const signals = computeCrossScenarioSignals(scenarios);
      expect(signals.materially_wider).toBe(true);
    });
  });

  describe('getScenarioInterpretation', () => {
    const baseContext: InterpretationContext = {
      any_red: false,
      any_amber: false,
      minimal_movement: false,
      scenarios_converged: false,
      materially_wider: true,
    };

    it('returns red guardrail message when any_red is true', () => {
      const context = { ...baseContext, any_red: true };
      const scenario = createMockScenario('GUARDRAIL_FIRST', [createMockBand()]);
      const interpretation = getScenarioInterpretation(scenario, context);
      expect(interpretation).toContain('red guardrail is present');
      expect(interpretation).toContain('Preferences are recorded but locked');
    });

    it('returns minimal movement message for low total movement', () => {
      const scenario = createMockScenario('GUARDRAIL_FIRST', [
        createMockBand({ current_pct: 50, illustrative_low_pct: 49, illustrative_high_pct: 51 }),
      ]);
      const interpretation = getScenarioInterpretation(scenario, baseContext);
      expect(interpretation).toContain('limited deviation');
    });

    it('appends preference-specific text for PREFERENCE_LEANING', () => {
      const scenario = createMockScenario('PREFERENCE_LEANING', [
        createMockBand({ current_pct: 50, illustrative_low_pct: 40, illustrative_high_pct: 60 }),
      ]);
      const context = { ...baseContext, materially_wider: true };
      const interpretation = getScenarioInterpretation(scenario, context);
      expect(interpretation).toContain('Preferences introduce additional flexibility');
    });

    it('appends reference text for NEUTRAL_BASELINE', () => {
      const scenario = createMockScenario('NEUTRAL_BASELINE', [
        createMockBand({ current_pct: 50, illustrative_low_pct: 40, illustrative_high_pct: 60 }),
      ]);
      const interpretation = getScenarioInterpretation(scenario, baseContext);
      expect(interpretation).toContain('reference view with no preferences applied');
    });

    it('contains no banned verbs', () => {
      const contexts: InterpretationContext[] = [
        baseContext,
        { ...baseContext, any_red: true },
        { ...baseContext, scenarios_converged: true },
      ];
      const types: Array<'GUARDRAIL_FIRST' | 'PREFERENCE_LEANING' | 'NEUTRAL_BASELINE'> = [
        'GUARDRAIL_FIRST', 'PREFERENCE_LEANING', 'NEUTRAL_BASELINE'
      ];
      
      contexts.forEach(context => {
        types.forEach(type => {
          const scenario = createMockScenario(type, [createMockBand()]);
          const interpretation = getScenarioInterpretation(scenario, context);
          checkBannedVerbs(interpretation);
        });
      });
    });
  });

  describe('getCrossScenarioSynthesis', () => {
    it('returns red override message when any_red', () => {
      const context: InterpretationContext = {
        any_red: true, any_amber: false, minimal_movement: false,
        scenarios_converged: false, materially_wider: false,
      };
      const synthesis = getCrossScenarioSynthesis(context);
      expect(synthesis).toContain('red guardrail is present');
    });

    it('returns convergence message when scenarios_converged', () => {
      const context: InterpretationContext = {
        any_red: false, any_amber: false, minimal_movement: false,
        scenarios_converged: true, materially_wider: false,
      };
      const synthesis = getCrossScenarioSynthesis(context);
      expect(synthesis).toContain('ranges remain similar');
    });

    it('returns differences message when not converged', () => {
      const context: InterpretationContext = {
        any_red: false, any_amber: false, minimal_movement: false,
        scenarios_converged: false, materially_wider: true,
      };
      const synthesis = getCrossScenarioSynthesis(context);
      expect(synthesis).toContain('Differences between scenarios');
    });

    it('contains no banned verbs', () => {
      const contexts: InterpretationContext[] = [
        { any_red: true, any_amber: false, minimal_movement: false, scenarios_converged: false, materially_wider: false },
        { any_red: false, any_amber: false, minimal_movement: false, scenarios_converged: true, materially_wider: false },
        { any_red: false, any_amber: false, minimal_movement: false, scenarios_converged: false, materially_wider: true },
      ];
      contexts.forEach(context => {
        checkBannedVerbs(getCrossScenarioSynthesis(context));
      });
    });
  });

  describe('SCENARIO_EXPLAINER', () => {
    it('has title and content', () => {
      expect(SCENARIO_EXPLAINER.title).toBe('How to read these scenarios');
      expect(SCENARIO_EXPLAINER.content.length).toBeGreaterThan(100);
    });

    it('mentions all three scenario types', () => {
      expect(SCENARIO_EXPLAINER.content).toContain('Guardrail-first');
      expect(SCENARIO_EXPLAINER.content).toContain('Preference-leaning');
      expect(SCENARIO_EXPLAINER.content).toContain('Neutral baseline');
    });

    it('contains no banned verbs', () => {
      checkBannedVerbs(SCENARIO_EXPLAINER.title);
      checkBannedVerbs(SCENARIO_EXPLAINER.content);
    });
  });
});
