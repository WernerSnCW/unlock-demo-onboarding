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
  useIndependentProbs?: boolean; // New flag for independent probabilities
  independentProbsK?: number; // Sensitivity parameter for independent probs
}

export interface RegimeCfg {
  weightMultiplier: number;   // e.g. low 0.8, normal 1.0, high 1.4, crisis 1.8
  months: number;             // horizon for decay
}

export type DecayRates = Record<string, number>; // annualized λ
export type CorrMap = Record<string, number>;    // "QID|QID" -> correlation in [-1,1]

// Default configuration based on spec
export const DEFAULT_CONFIG: BeliefProcessingConfig = {
  softmaxTemperature: 1.0, // Changed from 0.5 to 1.0 per spec
  meanCenterScores: false, // Disabled per spec
  maskThresholdFractionOfMax: 0.0, // No masking by default
  negativeWeightsAllowed: true, // Support negative weights
  useIndependentProbs: true, // Use independent probabilities instead of softmax
  independentProbsK: 1.0 // Sensitivity parameter for independent probs
};

// Default regime configurations
export const DEFAULT_REGIME_CONFIGS: Record<string, RegimeCfg> = {
  low: { weightMultiplier: 0.8, months: 12 },
  normal: { weightMultiplier: 1.0, months: 12 },
  high: { weightMultiplier: 1.4, months: 12 },
  crisis: { weightMultiplier: 1.8, months: 12 }
};

// Default decay rates for scenarios (annualized)
export const DEFAULT_DECAY_RATES: DecayRates = {
  "Energy Shock": 0.25,
  "Stagflation": 0.15,
  "Debt Spiral": 0.12,
  "Sterling Devaluation": 0.12,
  "Property Crash": 0.08,
  "Tech Burst": 0.06,
  "AI Recession": 0.05,
  "Rate-Cut Reflation": 0.06
};

// Default correlation map for belief questions
export const DEFAULT_CORRELATIONS: CorrMap = {
  "B4_government_confidence|B13_fiscal_sustainability": -0.70,
  "B5_energy_policy|B9_geopolitical_risk": 0.60,
  "B2_job_security_white_collar|B1_mobility_views": 0.65,
  "B13_fiscal_sustainability|B15_external_balance_risk": 0.50,
  "B3_remote_work_tenure|B7_renting_vs_buying": 0.40
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
 * Simple correlation dampening: si' = si / (1 + 0.5 * Σ|corr(i,j)| for j with s_j>0)
 */
function dampSignals(
  rawSignals: Record<string, number>,
  corr: CorrMap
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const qi of Object.keys(rawSignals)) {
    const si = rawSignals[qi];
    if (si <= 0) { 
      out[qi] = 0; 
      continue; 
    }
    let tot = 0;
    for (const key of Object.keys(corr)) {
      const [a, b] = key.split("|");
      if (a === qi && rawSignals[b] > 0) tot += Math.abs(corr[key]);
      if (b === qi && rawSignals[a] > 0) tot += Math.abs(corr[key]);
    }
    const factor = 1 / (1 + 0.5 * tot);
    out[qi] = si * factor;
  }
  return out;
}

/**
 * Apply regime multiplier and exponential time decay
 */
function applyRegimeAndDecay(
  scores: Record<string, number>,
  regime: RegimeCfg,
  decay: DecayRates
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const scen of Object.keys(scores)) {
    const λ = decay[scen] ?? 0;
    const decayFactor = Math.exp(-λ * (regime.months / 12));
    out[scen] = scores[scen] * regime.weightMultiplier * decayFactor;
  }
  return out;
}

/**
 * Convert scores to independent probabilities in [0,1].
 * Use Poisson-complement: p = 1 - exp(-k * max(0,score)).
 * k is a sensitivity knob (start with 1.0).
 */
export function independentProbs(
  scores: Record<string, number>,
  k = 1.0
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const scen of Object.keys(scores)) {
    const x = Math.max(0, scores[scen]);
    out[scen] = 1 - Math.exp(-k * x);
  }
  return out; // NOT normalised; multiple can be high
}

/**
 * Main: answers -> independent scenario probabilities
 */
export function computeIndependentProbabilities(opts: {
  responses: BeliefResponse[];
  questions: Array<{
    id: string;
    statement: string;
    direction: string;
    weights: Record<string, number>;
  }>;
  regime?: RegimeCfg;
  decay?: DecayRates;
  corr?: CorrMap;
  k?: number; // optional sensitivity (default 1.0)
}): Record<string, number> {
  const { 
    responses, 
    questions, 
    regime = DEFAULT_REGIME_CONFIGS.normal, 
    decay = DEFAULT_DECAY_RATES, 
    corr = DEFAULT_CORRELATIONS, 
    k = 1.0 
  } = opts;

  // Convert responses to raw signals
  const raw: Record<string, number> = {};
  responses.forEach(response => {
    const question = questions.find(q => q.id === response.questionId);
    if (!question) return;
    
    const signal = scaleToSignal(response.answer);
    const { isLower } = parseDirection(question.direction);
    
    // Apply direction logic and only keep positive signals
    const adjustedSignal = isLower ? -signal : signal;
    raw[response.questionId] = Math.max(0, adjustedSignal);
  });

  // Apply correlation dampening
  const adjusted = dampSignals(raw, corr);
  
  // Aggregate signals into scenario scores
  const scores: Record<string, number> = {};
  responses.forEach(response => {
    const question = questions.find(q => q.id === response.questionId);
    if (!question) return;
    
    const s = adjusted[response.questionId] || 0;
    if (s <= 0) return;
    
    Object.entries(question.weights).forEach(([scenario, weight]) => {
      scores[scenario] = (scores[scenario] || 0) + s * weight;
    });
  });
  
  // Apply regime and decay
  const s2 = applyRegimeAndDecay(scores, regime, decay);
  
  // Convert to independent probabilities
  return independentProbs(s2, k);
}

/**
 * Apply softmax normalization with temperature control (legacy function)
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
 * Complete belief processing pipeline with support for independent probabilities
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
  if (config.useIndependentProbs) {
    // Use new independent probabilities system
    const regimeCfg = DEFAULT_REGIME_CONFIGS[regime];
    const independentProbs = computeIndependentProbabilities({
      responses,
      questions,
      regime: regimeCfg,
      decay: DEFAULT_DECAY_RATES,
      corr: DEFAULT_CORRELATIONS,
      k: config.independentProbsK || 1.0
    });
    
    // For backwards compatibility, also calculate raw weights
    const rawWeights = calculateScenarioWeights(responses, questions, config);
    
    return {
      rawWeights,
      normalizedWeights: independentProbs, // Independent probabilities don't need normalization
      finalProbabilities: independentProbs // No regime adjustments needed as they're already applied
    };
  } else {
    // Use legacy softmax system
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