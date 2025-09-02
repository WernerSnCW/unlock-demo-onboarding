// Additional belief questionnaire hook for scenario → portfolio flow
import { useState, useCallback } from 'react';
import { BELIEF_QUESTIONS, SCENARIO_MAPPING } from '../data/beliefQuestions';
import { SCENARIO_DEFAULTS } from '../data/scenarioDefaults';
import { 
  inferLatentIndices, 
  calculateScenarioProbabilities, 
  applyMLWeightUpdate,
  applySoftmaxWithConfig
} from '../utils/beliefProcessing';
import { 
  applyPersonaRules, 
  selectScenario, 
  blendAllocations,
  type Allocation,
  type ScenarioSelection 
} from '../utils/personaRules';
import { PersonaDef } from '../data/personas';

export interface BeliefResponse {
  questionId: string;
  selectedOption: string;
}

export interface PortfolioResult {
  baseAllocation: Allocation;
  personaAdjustedAllocation: Allocation;
  scenarioSelection: ScenarioSelection;
  explanations: {
    scenarioReason: string;
    personaRulesApplied: string[];
  };
}

export function useAdditionalBeliefs() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<BeliefResponse[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [portfolioResult, setPortfolioResult] = useState<PortfolioResult | null>(null);

  const questions = BELIEF_QUESTIONS;
  const currentQuestion = questions[currentQuestionIndex];
  const progress = (currentQuestionIndex / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const canGoBack = currentQuestionIndex > 0;

  const answerQuestion = useCallback((selectedOption: string, persona: PersonaDef) => {
    const newResponse: BeliefResponse = {
      questionId: currentQuestion.id,
      selectedOption
    };

    const newResponses = [...responses, newResponse];
    setResponses(newResponses);

    if (isLastQuestion) {
      // Process complete questionnaire
      const result = processBeliefQuestionnaire(newResponses, persona);
      setPortfolioResult(result);
      setIsComplete(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [currentQuestion, responses, isLastQuestion]);

  const goBack = useCallback(() => {
    if (canGoBack) {
      setCurrentQuestionIndex(prev => prev - 1);
      // Remove the last response
      setResponses(prev => prev.slice(0, -1));
    }
  }, [canGoBack]);

  const resetQuestionnaire = useCallback(() => {
    setCurrentQuestionIndex(0);
    setResponses([]);
    setIsComplete(false);
    setPortfolioResult(null);
  }, []);

  const skipToNeutral = useCallback((persona: PersonaDef) => {
    // Use neutral/base scenario with persona rules applied
    const neutralResult = processNeutralScenario(persona);
    setPortfolioResult(neutralResult);
    setIsComplete(true);
  }, []);

  const autoComplete = useCallback((persona: PersonaDef) => {
    // Generate random responses for remaining questions
    const remainingQuestions = questions.slice(currentQuestionIndex);
    const randomResponses: BeliefResponse[] = remainingQuestions.map(question => ({
      questionId: question.id,
      selectedOption: Object.keys(question.options)[
        Math.floor(Math.random() * Object.keys(question.options).length)
      ]
    }));

    const allResponses = [...responses, ...randomResponses];
    const result = processBeliefQuestionnaire(allResponses, persona);
    
    setResponses(allResponses);
    setPortfolioResult(result);
    setIsComplete(true);
  }, [currentQuestionIndex, questions, responses]);

  return {
    // State
    currentQuestion,
    currentQuestionIndex,
    progress,
    isComplete,
    responses,
    portfolioResult,
    canGoBack,
    isLastQuestion,

    // Actions
    answerQuestion,
    goBack,
    resetQuestionnaire,
    skipToNeutral,
    autoComplete,

    // Computed
    totalQuestions: questions.length,
    questions
  };
}

// Process belief questionnaire responses into portfolio recommendations
function processBeliefQuestionnaire(responses: BeliefResponse[], persona: PersonaDef): PortfolioResult {
  // Step 1: Infer latent indices from responses
  const latentIndices = inferLatentIndices(responses, BELIEF_QUESTIONS);
  
  // Step 2: Calculate scenario probabilities
  const rawScenarioProbabilities = calculateScenarioProbabilities(responses, BELIEF_QUESTIONS, latentIndices);
  
  // Step 3: Apply ML weight updates
  const adjustedProbabilities = applyMLWeightUpdate(rawScenarioProbabilities, latentIndices);
  
  // Step 4: Apply softmax with configuration
  const config = {
    softmaxTemperature: 0.5,
    meanCenterScores: true,
    maskedSoftmaxThreshold: 0.001,
    displayCapPct: 80
  };
  
  const scenarioWeights = applySoftmaxWithConfig(adjustedProbabilities, config);
  
  // Step 5: Select scenario(s)
  const scenarioSelection = selectScenario(scenarioWeights);
  
  // Step 6: Build base allocation
  let baseAllocation: Allocation;
  
  if (scenarioSelection.decision === 'clear_winner') {
    const scenarioCode = SCENARIO_MAPPING[scenarioSelection.primary] || scenarioSelection.primary;
    baseAllocation = SCENARIO_DEFAULTS[scenarioCode] || SCENARIO_DEFAULTS["S006"];
  } else if (scenarioSelection.decision === 'close' && scenarioSelection.secondary && scenarioSelection.blendRatio) {
    const primaryCode = SCENARIO_MAPPING[scenarioSelection.primary] || scenarioSelection.primary;
    const secondaryCode = SCENARIO_MAPPING[scenarioSelection.secondary] || scenarioSelection.secondary;
    const primaryAllocation = SCENARIO_DEFAULTS[primaryCode] || SCENARIO_DEFAULTS["S006"];
    const secondaryAllocation = SCENARIO_DEFAULTS[secondaryCode] || SCENARIO_DEFAULTS["S006"];
    
    baseAllocation = blendAllocations(
      primaryAllocation,
      secondaryAllocation,
      scenarioSelection.blendRatio[0],
      scenarioSelection.blendRatio[1]
    );
  } else {
    // Indecisive - use neutral/reflation
    baseAllocation = SCENARIO_DEFAULTS["S006"];
  }
  
  // Step 7: Apply persona rules
  const scenarioCode = SCENARIO_MAPPING[scenarioSelection.primary] || scenarioSelection.primary;
  const personaAdjustedAllocation = applyPersonaRules(baseAllocation, persona, scenarioCode);
  
  // Step 8: Generate explanations
  const explanations = generateExplanations(scenarioSelection, persona, scenarioCode);
  
  return {
    baseAllocation,
    personaAdjustedAllocation,
    scenarioSelection,
    explanations
  };
}

// Process neutral scenario when user skips questionnaire
function processNeutralScenario(persona: PersonaDef): PortfolioResult {
  const baseAllocation = SCENARIO_DEFAULTS["S006"]; // Reflation as neutral
  const personaAdjustedAllocation = applyPersonaRules(baseAllocation, persona, "S006");
  
  const scenarioSelection: ScenarioSelection = {
    primary: "reflation",
    decision: 'indecisive'
  };
  
  const explanations = {
    scenarioReason: "Using balanced Reflation scenario as baseline",
    personaRulesApplied: [`Applied ${persona.name} liquidity and risk constraints`]
  };
  
  return {
    baseAllocation,
    personaAdjustedAllocation,
    scenarioSelection,
    explanations
  };
}

// Generate explanations for the portfolio recommendations
function generateExplanations(
  scenarioSelection: ScenarioSelection,
  persona: PersonaDef,
  scenarioCode: string
): { scenarioReason: string; personaRulesApplied: string[] } {
  let scenarioReason = "";
  
  if (scenarioSelection.decision === 'clear_winner') {
    scenarioReason = `Clear match to ${scenarioSelection.primary.replace('_', ' ')} scenario`;
  } else if (scenarioSelection.decision === 'close') {
    const ratio = scenarioSelection.blendRatio || [0.5, 0.5];
    scenarioReason = `Blending ${scenarioSelection.primary.replace('_', ' ')} (${Math.round(ratio[0] * 100)}%) and ${scenarioSelection.secondary?.replace('_', ' ')} (${Math.round(ratio[1] * 100)}%)`;
  } else {
    scenarioReason = "Using balanced scenario due to mixed signals";
  }
  
  const personaRulesApplied: string[] = [];
  
  // Add persona-specific rule descriptions
  personaRulesApplied.push(`${persona.liquidityMonths}-month liquidity requirement enforced`);
  
  if (persona.concentrationTolerance === "low") {
    personaRulesApplied.push("Conservative concentration limits applied");
  } else if (persona.concentrationTolerance === "high") {
    personaRulesApplied.push("Higher concentration tolerance permitted");
  }
  
  if (persona.name === "P016") {
    personaRulesApplied.push("BTL property caps applied for risk management");
  }
  
  if (persona.name === "P003" && scenarioCode === "S004") {
    personaRulesApplied.push("Crypto exposure limited during tech stress");
  }
  
  if (persona.wealthTier.includes("Entry") || persona.wealthTier.includes("Mass")) {
    personaRulesApplied.push("Collectibles capped at 5% for wealth tier");
  }
  
  return { scenarioReason, personaRulesApplied };
}