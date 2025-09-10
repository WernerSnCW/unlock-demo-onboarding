// New Belief Processing Logic for Economic Scenario Engine v2.1
// Handles B1-B15 questions with 1-5 scale responses and negative weights

export interface BeliefResponse {
  questionId: string;
  answer: 1 | 2 | 3 | 4 | 5; // 1=Strongly Disagree, 5=Strongly Agree
}

export interface ScenarioWeights {
  [scenario: string]: number;
}

export interface BeliefProcessingConfig {
  softmaxTemperature: number;
  meanCenterScores: boolean;
  maskThresholdFractionOfMax: number;
  negativeWeightsAllowed: boolean;
}

// Default configuration based on spec
export const DEFAULT_CONFIG: BeliefProcessingConfig = {
  softmaxTemperature: 1.0, // Changed from 0.5 to 1.0 per spec
  meanCenterScores: false, // Disabled per spec
  maskThresholdFractionOfMax: 0.0, // No masking by default
  negativeWeightsAllowed: true // Support negative weights
};

/**
 * Convert 1-5 scale response to signal (-1 to +1, center=3=0)
 */
function scaleToSignal(answer: 1 | 2 | 3 | 4 | 5): number {
  // 1→-1, 2→-0.5, 3→0, 4→0.5, 5→1
  return (answer - 3) / 2;
}

/**
 * Parse direction string to determine if lower or higher values increase scenario risk
 */
function parseDirection(direction: string): { isLower: boolean; scenarios: string[] } {
  const isLower = direction.startsWith('lower->');
  const scenariosStr = direction.replace(/^(lower|higher)->/, '');
  const scenarios = scenariosStr.split(',').map(s => s.trim());
  return { isLower, scenarios };
}

/**
 * Calculate scenario weights from belief responses using new B1-B15 system
 */
export function calculateScenarioWeights(
  responses: BeliefResponse[],
  questions: Array<{
    id: string;
    statement: string;
    direction: string;
    weights: Record<string, number>;
  }>,
  config: BeliefProcessingConfig = DEFAULT_CONFIG
): ScenarioWeights {
  const scenarioScores: Record<string, number> = {};

  // Process each response
  responses.forEach(response => {
    const question = questions.find(q => q.id === response.questionId);
    if (!question) return;

    const signal = scaleToSignal(response.answer);
    const { isLower, scenarios } = parseDirection(question.direction);

    // Apply direction logic: 
    // - "lower->scenarios" means lower agreement increases scenario risk
    // - "higher->scenarios" means higher agreement increases scenario risk
    const adjustedSignal = isLower ? -signal : signal;

    // Only positive signals contribute to scenario scores (negative signals drop to 0)
    // This implements "Drop negatives to 0" from the spec
    const contributingSignal = Math.max(0, adjustedSignal);

    // Apply weights to scenarios for this question
    Object.entries(question.weights).forEach(([scenario, weight]) => {
      if (config.negativeWeightsAllowed || weight >= 0) {
        scenarioScores[scenario] = (scenarioScores[scenario] || 0) + (contributingSignal * weight);
      }
    });
  });

  return scenarioScores;
}

/**
 * Apply softmax normalization with temperature control
 */
export function applySoftmaxNormalization(
  weights: ScenarioWeights,
  config: BeliefProcessingConfig = DEFAULT_CONFIG
): ScenarioWeights {
  let processedWeights = { ...weights };

  // Mean center scores if enabled (disabled in new spec)
  if (config.meanCenterScores) {
    const values = Object.values(processedWeights);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    Object.keys(processedWeights).forEach(key => {
      processedWeights[key] -= mean;
    });
  }

  // Apply masking threshold if specified
  const maxWeight = Math.max(...Object.values(processedWeights));
  const threshold = maxWeight * config.maskThresholdFractionOfMax;
  
  const activeScenarios = Object.entries(processedWeights)
    .filter(([_, weight]) => weight >= threshold);

  if (activeScenarios.length === 0) {
    // If no scenarios pass threshold, return uniform distribution
    const uniformWeight = 1.0 / Object.keys(processedWeights).length;
    const result: ScenarioWeights = {};
    Object.keys(processedWeights).forEach(scenario => {
      result[scenario] = uniformWeight;
    });
    return result;
  }

  // Apply softmax with temperature
  const maxActiveWeight = Math.max(...activeScenarios.map(([_, w]) => w));
  const expWeights = activeScenarios.map(([scenario, weight]) => [
    scenario,
    Math.exp((weight - maxActiveWeight) / config.softmaxTemperature)
  ] as [string, number]);

  const expSum = expWeights.reduce((sum, [_, exp]) => sum + exp, 0);

  // Build normalized result
  const result: ScenarioWeights = {};
  
  // Initialize all scenarios to 0
  Object.keys(processedWeights).forEach(scenario => {
    result[scenario] = 0;
  });

  // Set normalized weights for active scenarios
  expWeights.forEach(([scenario, exp]) => {
    result[scenario] = exp / expSum;
  });

  return result;
}

/**
 * Apply regime multipliers and decay rates (for advanced features)
 */
export function applyRegimeAdjustments(
  weights: ScenarioWeights,
  regime: 'low' | 'normal' | 'high' | 'crisis' = 'normal',
  decayRates?: Record<string, number>
): ScenarioWeights {
  const regimeMultipliers = {
    low: 0.8,
    normal: 1.0,
    high: 1.4,
    crisis: 1.8
  };

  const multiplier = regimeMultipliers[regime];
  const adjusted: ScenarioWeights = {};

  Object.entries(weights).forEach(([scenario, weight]) => {
    let adjustedWeight = weight * multiplier;
    
    // Apply decay if specified
    if (decayRates && decayRates[scenario]) {
      const decayFactor = 1 - decayRates[scenario];
      adjustedWeight *= decayFactor;
    }
    
    adjusted[scenario] = adjustedWeight;
  });

  // Renormalize after adjustments
  const total = Object.values(adjusted).reduce((sum, val) => sum + val, 0);
  if (total > 0) {
    Object.keys(adjusted).forEach(scenario => {
      adjusted[scenario] /= total;
    });
  }

  return adjusted;
}

/**
 * Complete belief processing pipeline
 */
export function processBeliefResponses(
  responses: BeliefResponse[],
  questions: Array<{
    id: string;
    statement: string;
    direction: string;
    weights: Record<string, number>;
  }>,
  config: BeliefProcessingConfig = DEFAULT_CONFIG,
  regime: 'low' | 'normal' | 'high' | 'crisis' = 'normal'
): {
  rawWeights: ScenarioWeights;
  normalizedWeights: ScenarioWeights;
  finalProbabilities: ScenarioWeights;
} {
  // Step 1: Calculate raw scenario weights
  const rawWeights = calculateScenarioWeights(responses, questions, config);

  // Step 2: Apply softmax normalization
  const normalizedWeights = applySoftmaxNormalization(rawWeights, config);

  // Step 3: Apply regime adjustments (optional)
  const finalProbabilities = applyRegimeAdjustments(normalizedWeights, regime);

  return {
    rawWeights,
    normalizedWeights,
    finalProbabilities
  };
}

/**
 * Legacy function wrapper for backwards compatibility
 */
export function applySoftmaxWithConfig(
  weights: ScenarioWeights,
  config: {
    softmaxTemperature: number;
    meanCenterScores: boolean;
    maskedSoftmaxThreshold: number;
    displayCapPct: number;
  }
): { scenario: string; weight: number; normalizedWeight: number; isMasked: boolean }[] {
  
  const newConfig: BeliefProcessingConfig = {
    softmaxTemperature: config.softmaxTemperature,
    meanCenterScores: config.meanCenterScores,
    maskThresholdFractionOfMax: config.maskedSoftmaxThreshold,
    negativeWeightsAllowed: true
  };

  const normalized = applySoftmaxNormalization(weights, newConfig);
  
  return Object.entries(weights).map(([scenario, rawWeight]) => ({
    scenario,
    weight: rawWeight,
    normalizedWeight: Math.min(normalized[scenario] || 0, config.displayCapPct / 100),
    isMasked: (normalized[scenario] || 0) === 0
  })).sort((a, b) => b.normalizedWeight - a.normalizedWeight);
}