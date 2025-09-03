// Additional belief questionnaire hook for scenario → portfolio flow
import { useState, useCallback } from 'react';
import { CORE_QUESTIONS } from '../data/questions';
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
  selectedOptionIndex: number;
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

  const questions = CORE_QUESTIONS;
  const currentQuestion = questions[currentQuestionIndex];
  const progress = (currentQuestionIndex / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const canGoBack = currentQuestionIndex > 0;

  const answerQuestion = useCallback((selectedOptionIndex: number, persona: PersonaDef) => {
    const newResponse: BeliefResponse = {
      questionId: currentQuestion.id,
      selectedOptionIndex
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
      selectedOptionIndex: Math.floor(Math.random() * question.options.length)
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
  // For core questions, use a simpler approach based on responses
  // Analyze responses to determine appropriate scenario
  const scenarioCode = determineScenarioFromCoreQuestions(responses);
  const baseAllocation = SCENARIO_DEFAULTS[scenarioCode] || SCENARIO_DEFAULTS["S006"];
  
  // Apply persona rules to adjust allocation
  const personaAdjustedAllocation = applyPersonaRules(baseAllocation, persona, scenarioCode);
  
  // Create scenario selection object
  const scenarioSelection: ScenarioSelection = {
    primary: getScenarioNameFromCode(scenarioCode),
    decision: 'clear_winner'
  };
  
  // Generate explanations
  const explanations = {
    scenarioReason: `Portfolio based on your investment profile responses and ${persona.name} persona characteristics`,
    personaRulesApplied: [
      `Applied ${persona.name} risk tolerance and liquidity preferences`,
      `Incorporated ${persona.liquidityMonths}-month liquidity requirement`,
      `Adjusted for ${persona.concentrationTolerance} concentration tolerance`
    ]
  };
  
  return {
    baseAllocation,
    personaAdjustedAllocation,
    scenarioSelection,
    explanations
  };
}

// Determine scenario based on core question responses
function determineScenarioFromCoreQuestions(responses: BeliefResponse[]): string {
  // Simple scoring based on risk tolerance and time horizon
  let riskScore = 0;
  let timeScore = 0;
  
  responses.forEach(response => {
    const question = CORE_QUESTIONS.find(q => q.id === response.questionId);
    if (!question) return;
    
    // Risk-related questions
    if (response.questionId === 'risk_tolerance' || response.questionId === 'market_crash') {
      riskScore += response.selectedOptionIndex;
    }
    
    // Time horizon related
    if (response.questionId === 'time_horizon' || response.questionId === 'investment_purpose') {
      timeScore += response.selectedOptionIndex;
    }
  });
  
  // Map to scenarios based on simple rules
  if (riskScore >= 3) {
    return "S001"; // High growth scenario for high risk tolerance
  } else if (riskScore >= 1) {
    return "S006"; // Balanced scenario for moderate risk
  } else {
    return "S008"; // Conservative scenario for low risk
  }
}

// Helper to get scenario name from code
function getScenarioNameFromCode(scenarioCode: string): string {
  const scenarioNames: Record<string, string> = {
    "S001": "growth_focus",
    "S006": "balanced_growth", 
    "S008": "conservative_income"
  };
  return scenarioNames[scenarioCode] || "balanced_growth";
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