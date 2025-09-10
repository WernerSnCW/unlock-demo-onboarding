// Additional belief questionnaire hook for scenario → portfolio flow
import { useState, useCallback } from 'react';
import { BELIEF_QUESTIONS, SCALE_LABELS } from '../data/beliefQuestions';
import { 
  processBeliefResponses, 
  type BeliefResponse as NewBeliefResponse, 
  DEFAULT_CONFIG, 
  type BeliefProcessingConfig 
} from '../utils/beliefProcessing';
import { SCENARIO_DEFAULTS } from '../data/scenarioDefaults';
import { 
  applyPersonaRules, 
  selectScenario, 
  blendAllocations,
  type Allocation,
  type ScenarioSelection 
} from '../utils/personaRules';
import { PersonaDef } from '../data/personas';

// Legacy interface for backward compatibility
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

  // Use new B1-B15 questions
  const questions = BELIEF_QUESTIONS.map(q => ({
    id: q.id,
    text: q.statement, // Use 'statement' field from new format
    options: [
      { text: "1 - Strongly Disagree" },
      { text: "2 - Disagree" },
      { text: "3 - Neutral" },
      { text: "4 - Agree" },
      { text: "5 - Strongly Agree" }
    ]
  }));
  
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
  // Convert legacy responses to new format
  const newResponses: NewBeliefResponse[] = responses.map(response => ({
    questionId: response.questionId,
    answer: (response.selectedOptionIndex + 1) as 1 | 2 | 3 | 4 | 5 // Convert 0-4 to 1-5
  }));

  // Use new belief processing system
  const config: BeliefProcessingConfig = {
    softmaxTemperature: 1.0,
    meanCenterScores: false,
    maskThresholdFractionOfMax: 0.0,
    negativeWeightsAllowed: true
  };

  const { finalProbabilities } = processBeliefResponses(newResponses, BELIEF_QUESTIONS, config);
  
  console.log('Scenario probabilities from new system:', finalProbabilities);

  // Find the top scenario based on probabilities
  const topScenario = Object.entries(finalProbabilities)
    .sort(([,a], [,b]) => b - a)[0][0];

  // Get base allocation for the top scenario
  const baseAllocation = SCENARIO_DEFAULTS[topScenario] || SCENARIO_DEFAULTS["S006"];
  
  // Apply persona rules to adjust allocation
  const personaAdjustedAllocation = applyPersonaRules(baseAllocation, persona, topScenario);
  
  // Create scenario selection object
  const scenarioSelection: ScenarioSelection = {
    primary: getScenarioNameFromCode(topScenario),
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

// Helper to get scenario name from code (updated for new scenario codes)
function getScenarioNameFromCode(scenarioCode: string): string {
  const scenarioNames: Record<string, string> = {
    "S005": "debt_spiral",
    "S010": "property_crash", 
    "S002": "ai_recession",
    "S003": "stagflation",
    "S006": "tech_burst",
    "S009": "sterling_devaluation",
    "S008": "energy_shock",
    "S007": "rate_cut_reflation"
  };
  return scenarioNames[scenarioCode] || "rate_cut_reflation";
}

// Process neutral scenario when user skips questionnaire
function processNeutralScenario(persona: PersonaDef): PortfolioResult {
  const baseAllocation = SCENARIO_DEFAULTS["S007"]; // Rate-Cut Reflation as neutral
  const personaAdjustedAllocation = applyPersonaRules(baseAllocation, persona, "S007");
  
  const scenarioSelection: ScenarioSelection = {
    primary: "rate_cut_reflation",
    decision: 'indecisive'
  };
  
  const explanations = {
    scenarioReason: "Using balanced Rate-Cut Reflation scenario as baseline",
    personaRulesApplied: [`Applied ${persona.name} liquidity and risk constraints`]
  };
  
  return {
    baseAllocation,
    personaAdjustedAllocation,
    scenarioSelection,
    explanations
  };
}