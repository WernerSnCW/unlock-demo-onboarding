import type { AllocationBand, IllustrativeScenario } from '@/state/onboardingV2Store';

export interface ScenarioSignals {
  total_movement_pp: number;
  avg_range_width_pp: number;
}

export interface CrossScenarioSignals {
  convergence_score: number;
  scenarios_converged: boolean;
  materially_wider: boolean;
}

export interface InterpretationContext {
  any_red: boolean;
  any_amber: boolean;
  minimal_movement: boolean;
  scenarios_converged: boolean;
  materially_wider: boolean;
}

const CONVERGENCE_THRESHOLD = 0.90;
const MINIMAL_MOVEMENT_THRESHOLD = 2.0;
const MATERIALLY_WIDER_THRESHOLD = 2.0;

export function computeScenarioSignals(scenario: IllustrativeScenario): ScenarioSignals {
  const bands = scenario.asset_class_bands;
  
  const total_movement_pp = bands.reduce((sum, band) => {
    const midpoint = (band.illustrative_low_pct + band.illustrative_high_pct) / 2;
    return sum + Math.abs(midpoint - band.current_pct);
  }, 0);
  
  const avg_range_width_pp = bands.length > 0
    ? bands.reduce((sum, band) => sum + (band.illustrative_high_pct - band.illustrative_low_pct), 0) / bands.length
    : 0;
  
  return { total_movement_pp, avg_range_width_pp };
}

export function computeConvergenceScore(scenarios: IllustrativeScenario[]): number {
  if (scenarios.length < 2) return 1.0;
  
  let totalOverlap = 0;
  let comparisons = 0;
  
  for (let i = 0; i < scenarios.length; i++) {
    for (let j = i + 1; j < scenarios.length; j++) {
      const bandsA = scenarios[i].asset_class_bands;
      const bandsB = scenarios[j].asset_class_bands;
      
      for (let k = 0; k < Math.min(bandsA.length, bandsB.length); k++) {
        const a = bandsA[k];
        const b = bandsB[k];
        
        const overlapLow = Math.max(a.illustrative_low_pct, b.illustrative_low_pct);
        const overlapHigh = Math.min(a.illustrative_high_pct, b.illustrative_high_pct);
        const overlap = Math.max(0, overlapHigh - overlapLow);
        
        const rangeA = a.illustrative_high_pct - a.illustrative_low_pct;
        const rangeB = b.illustrative_high_pct - b.illustrative_low_pct;
        const avgRange = (rangeA + rangeB) / 2;
        
        const overlapRatio = avgRange > 0 ? overlap / avgRange : 1.0;
        totalOverlap += Math.min(1, overlapRatio);
        comparisons++;
      }
    }
  }
  
  return comparisons > 0 ? totalOverlap / comparisons : 1.0;
}

export function computeCrossScenarioSignals(scenarios: IllustrativeScenario[]): CrossScenarioSignals {
  const convergence_score = computeConvergenceScore(scenarios);
  const scenarios_converged = convergence_score >= CONVERGENCE_THRESHOLD;
  
  const guardrailFirst = scenarios.find(s => s.scenario_type === 'GUARDRAIL_FIRST');
  const preferenceLeaning = scenarios.find(s => s.scenario_type === 'PREFERENCE_LEANING');
  
  let materially_wider = false;
  if (guardrailFirst && preferenceLeaning) {
    const gfSignals = computeScenarioSignals(guardrailFirst);
    const plSignals = computeScenarioSignals(preferenceLeaning);
    materially_wider = plSignals.avg_range_width_pp >= gfSignals.avg_range_width_pp + MATERIALLY_WIDER_THRESHOLD;
  }
  
  return { convergence_score, scenarios_converged, materially_wider };
}

export function getScenarioInterpretation(
  scenario: IllustrativeScenario,
  context: InterpretationContext
): string {
  const signals = computeScenarioSignals(scenario);
  const isMinimalMovement = signals.total_movement_pp < MINIMAL_MOVEMENT_THRESHOLD;
  
  let base = '';
  
  if (context.any_red) {
    base = 'A red guardrail is present. Preferences are recorded but locked, and this scenario remains constraint-led.';
    return base;
  }
  
  if (isMinimalMovement) {
    base = 'Under current constraints, this scenario allows only limited deviation from the existing allocation.';
  } else {
    base = 'This scenario allows some re-shaping of the allocation within the current safety limits.';
  }
  
  if (scenario.scenario_type === 'PREFERENCE_LEANING') {
    if (context.scenarios_converged || !context.materially_wider) {
      base += ' Preferences are recognised, but constraints materially limit their effect.';
    } else {
      base += ' Preferences introduce additional flexibility, bounded by safety constraints.';
    }
  }
  
  if (scenario.scenario_type === 'NEUTRAL_BASELINE') {
    base += ' This scenario provides a reference view with no preferences applied.';
  }
  
  return base;
}

export function getCrossScenarioSynthesis(context: InterpretationContext): string {
  if (context.any_red) {
    return 'A red guardrail is present. Preferences are locked, so scenarios remain driven by constraints.';
  }
  
  if (context.scenarios_converged) {
    return 'Across all three scenarios, ranges remain similar, indicating that constraints dominate outcomes under current inputs.';
  }
  
  return 'Differences between scenarios highlight where preferences can influence outcomes within constraints.';
}

export const SCENARIO_EXPLAINER = {
  title: 'How to read these scenarios',
  content: `Each scenario answers a slightly different question:
• Guardrail-first shows how the portfolio behaves when safety constraints are prioritised and change is kept minimal.
• Preference-leaning shows how far stated preferences can influence the portfolio without breaching constraints.
• Neutral baseline shows the portfolio with no preferences applied, serving as a reference point.

The ranges show feasible directions, not targets. Where scenarios look similar, it indicates that constraints — not preferences — are the dominant factor.`,
};
