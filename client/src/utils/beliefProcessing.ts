// Belief processing logic
// Based on beliefs.py and beliefs_ml.py

interface BeliefResponse {
  questionId: string;
  selectedOption: string;
}

interface LatentIndices {
  psi: number;  // property confidence index
  pci: number;  // policy confidence index  
  inf: number;  // inflation sensitivity
  tech: number; // tech conviction
  fxv: number;  // FX vulnerability
  eng: number;  // energy risk
  rate: number; // rate sensitivity
  rt: number;   // risk tolerance
}

interface ScenarioWeights {
  [scenario: string]: number;
}

// Helper functions
function standardize(values: Record<string, number>): Record<string, number> {
  const vals = Object.values(values);
  if (vals.length === 0) return {};
  
  const mean = vals.reduce((sum, val) => sum + val, 0) / vals.length;
  const variance = vals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / vals.length;
  const stdDev = Math.sqrt(variance) || 1.0;
  
  const result: Record<string, number> = {};
  for (const [key, value] of Object.entries(values)) {
    result[key] = (value - mean) / stdDev;
  }
  return result;
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function inferLatentIndices(
  responses: BeliefResponse[], 
  questionMap: any
): LatentIndices {
  const z: Record<string, number> = {};
  
  // Aggregate tags from responses
  responses.forEach(response => {
    const question = questionMap.find((q: any) => q.id === response.questionId);
    if (!question) return;
    
    const option = question.options[response.selectedOption];
    if (!option) return;
    
    Object.entries(option.tags).forEach(([tag, weight]: [string, any]) => {
      z[tag] = (z[tag] || 0) + weight;
    });
  });
  
  const standardizedZ = standardize(z);
  
  return {
    psi: sigmoid(standardizedZ.property_conf || -(standardizedZ.property_caution || 0)),
    pci: sigmoid(standardizedZ.pci || 0),
    inf: sigmoid(standardizedZ.inflation_sens || 0),
    tech: sigmoid(standardizedZ.tech_conv || 0),
    fxv: sigmoid(standardizedZ.fxv || 0),
    eng: sigmoid(standardizedZ.energy_risk || 0),
    rate: sigmoid(standardizedZ.rate_sens || 0),
    rt: sigmoid(standardizedZ.risk_tol || 0)
  };
}

export function calculateScenarioProbabilities(
  responses: BeliefResponse[],
  questionMap: any,
  latentIndices: LatentIndices
): ScenarioWeights {
  const raw: Record<string, number> = {};
  
  // Sum scenario weights from responses
  responses.forEach(response => {
    const question = questionMap.find((q: any) => q.id === response.questionId);
    if (!question) return;
    
    const option = question.options[response.selectedOption];
    if (!option) return;
    
    Object.entries(option.scenarios).forEach(([scenario, weight]: [string, any]) => {
      raw[scenario] = (raw[scenario] || 0) + weight;
    });
  });
  
  // Apply latent factor adjustments
  raw.property_crash = (raw.property_crash || 0) * 
    (latentIndices.pci < 0.4 && latentIndices.psi < 0.5 ? 1.3 : 
     latentIndices.psi > 0.6 ? 0.9 : 1.0);
     
  raw.stagflation = (raw.stagflation || 0) * 
    (latentIndices.inf > 0.6 || latentIndices.eng > 0.6 ? 1.2 : 1.0);
    
  raw.devaluation = (raw.devaluation || 0) * 
    (latentIndices.fxv > 0.6 ? 1.3 : 1.0);
    
  raw.reflation = (raw.reflation || 0) * 
    (latentIndices.pci > 0.6 ? 1.2 : 0.9);
    
  raw.gilt_selloff = (raw.gilt_selloff || 0) * 
    (latentIndices.rate > 0.6 && latentIndices.pci < 0.5 ? 1.2 : 1.0);
  
  // Apply floor values
  const floor = 0.05;
  const scenarios = [
    "property_crash", "ai_recession", "stagflation", "tech_burst", 
    "tax_shift", "reflation", "stagflation_2", "devaluation", 
    "gilt_selloff", "energy_spike"
  ];
  
  scenarios.forEach(scenario => {
    raw[scenario] = Math.max(raw[scenario] || 0, floor);
  });
  
  // Normalize to probabilities
  const total = Object.values(raw).reduce((sum, val) => sum + val, 0);
  const normalized: ScenarioWeights = {};
  
  scenarios.forEach(scenario => {
    normalized[scenario] = raw[scenario] / total;
  });
  
  return normalized;
}

export function applyMLWeightUpdate(
  baseProbabilities: ScenarioWeights, 
  features: LatentIndices
): ScenarioWeights {
  const adjusted = { ...baseProbabilities };
  
  // Property crash adjustment
  const scorePC = -1.0 * (features.pci - 0.5) - 0.8 * (features.psi - 0.5);
  adjusted.property_crash *= (1 + 0.5 * scorePC);
  
  // Stagflation adjustment
  const scoreStag = (features.inf - 0.5) + 0.3 * (features.eng - 0.5);
  adjusted.stagflation *= (1 + 0.5 * scoreStag);
  
  // FX adjustment
  const scoreFX = (features.fxv - 0.5);
  adjusted.devaluation *= (1 + 0.7 * scoreFX);
  
  // Normalize
  const total = Object.values(adjusted).reduce((sum, val) => sum + val, 0) || 1.0;
  const result: ScenarioWeights = {};
  
  Object.entries(adjusted).forEach(([key, value]) => {
    result[key] = Math.max(0.01, value) / total;
  });
  
  return result;
}

// Temperature-scaled softmax with mean centering
export function applySoftmaxWithConfig(
  weights: ScenarioWeights,
  config: {
    softmaxTemperature: number;
    meanCenterScores: boolean;
    maskedSoftmaxThreshold: number;
    displayCapPct: number;
  }
): { scenario: string; weight: number; normalizedWeight: number; isMasked: boolean }[] {
  
  let processedWeights = { ...weights };
  
  // Mean center if enabled
  if (config.meanCenterScores) {
    const values = Object.values(processedWeights);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    Object.keys(processedWeights).forEach(key => {
      processedWeights[key] -= mean;
    });
  }
  
  // Apply masking threshold
  const activeScenarios = Object.entries(processedWeights)
    .filter(([_, weight]) => weight > config.maskedSoftmaxThreshold);
    
  // Apply softmax to active scenarios
  const maxWeight = Math.max(...activeScenarios.map(([_, w]) => w));
  const expWeights = activeScenarios.map(([scenario, weight]) => [
    scenario, 
    Math.exp((weight - maxWeight) / config.softmaxTemperature)
  ]);
  
  const expSum = expWeights.reduce((sum, [_, exp]) => sum + (exp as number), 0);
  
  // Build final results
  const results = Object.entries(processedWeights).map(([scenario, rawWeight]) => {
    const activeEntry = expWeights.find(([s, _]) => s === scenario);
    const isMasked = !activeEntry;
    
    let normalizedWeight = 0;
    if (!isMasked && expSum > 0) {
      normalizedWeight = (activeEntry![1] as number) / expSum;
      // Apply display cap
      normalizedWeight = Math.min(normalizedWeight, config.displayCapPct / 100);
    }
    
    return {
      scenario,
      weight: rawWeight,
      normalizedWeight,
      isMasked
    };
  });
  
  // Sort by normalized weight descending
  return results.sort((a, b) => b.normalizedWeight - a.normalizedWeight);
}