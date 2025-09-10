import { useState, useCallback } from 'react';
import { BELIEF_QUESTIONS, SCALE_LABELS } from '@/data/beliefQuestions';
import { 
  processBeliefResponses, 
  type BeliefResponse, 
  DEFAULT_CONFIG, 
  type BeliefProcessingConfig 
} from '@/utils/beliefProcessing';

export interface BeliefQuestion {
  id: string;
  statement: string;
  direction: string;
  weights: Record<string, number>;
}

export interface BeliefAnswer {
  questionId: string;
  value: 1 | 2 | 3 | 4 | 5; // 1=Strongly Disagree, 5=Strongly Agree
}

export interface ScenarioWeight {
  scenario: string;
  weight: number;
  normalizedWeight: number;
  isMasked: boolean;
}

export function useBeliefQuestionnaire() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<BeliefAnswer[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [scenarioWeights, setScenarioWeights] = useState<ScenarioWeight[]>([]);
  const [selectedScenarios, setSelectedScenarios] = useState<Set<string>>(new Set());

  const questions = BELIEF_QUESTIONS;
  const currentQuestion = questions[currentQuestionIndex];
  const progress = (currentQuestionIndex / questions.length) * 100;
  const canGoBack = currentQuestionIndex > 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const answerQuestion = useCallback((value: 1 | 2 | 3 | 4 | 5) => {
    const answer: BeliefAnswer = {
      questionId: currentQuestion.id,
      value
    };

    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (isLastQuestion) {
      // Calculate scenario weights using new processing system
      const weights = calculateScenarioWeights(newAnswers);
      setScenarioWeights(weights);
      
      // Auto-select top scenarios (non-masked ones)
      const autoSelected = new Set(
        weights.filter(w => !w.isMasked).map(w => w.scenario)
      );
      setSelectedScenarios(autoSelected);
      
      setIsComplete(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [currentQuestion, answers, isLastQuestion]);

  const goBack = useCallback(() => {
    if (canGoBack) {
      setCurrentQuestionIndex(prev => prev - 1);
      setAnswers(prev => prev.slice(0, -1));
    }
  }, [canGoBack]);

  const calculateScenarioWeights = useCallback((answers: BeliefAnswer[]) => {
    // Use new belief processing configuration
    const config: BeliefProcessingConfig = {
      softmaxTemperature: 1.0, // Updated from 0.5 to 1.0 per spec
      meanCenterScores: false, // Disabled per spec
      maskThresholdFractionOfMax: 0.0, // No masking by default
      negativeWeightsAllowed: true // Support negative weights
    };

    // Convert answers to new BeliefResponse format
    const responses: BeliefResponse[] = answers.map(answer => ({
      questionId: answer.questionId,
      answer: answer.value
    }));

    // Use new processing pipeline
    const { finalProbabilities } = processBeliefResponses(responses, questions, config);

    console.log('New system scenario probabilities:', finalProbabilities);

    // Convert to ScenarioWeight format for compatibility
    const results: ScenarioWeight[] = Object.entries(finalProbabilities).map(([scenario, probability]) => ({
      scenario,
      weight: probability, // Raw probability from new system
      normalizedWeight: probability, // Already normalized by new system
      isMasked: probability === 0
    }));

    // Sort by normalized weight descending
    return results.sort((a, b) => b.normalizedWeight - a.normalizedWeight);
  }, []);

  const resetQuestionnaire = useCallback(() => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setIsComplete(false);
    setScenarioWeights([]);
    setSelectedScenarios(new Set());
  }, []);

  const autoCompleteQuestionnaire = useCallback(() => {
    // Generate random answers for all remaining questions
    const remainingQuestions = questions.slice(currentQuestionIndex);
    const randomAnswers: BeliefAnswer[] = remainingQuestions.map(question => ({
      questionId: question.id,
      value: (Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5
    }));

    const allAnswers = [...answers, ...randomAnswers];
    setAnswers(allAnswers);

    // Calculate scenario weights with all answers
    const weights = calculateScenarioWeights(allAnswers);
    setScenarioWeights(weights);
    
    // Auto-select top scenarios (non-masked ones)
    const autoSelected = new Set(
      weights.filter(w => !w.isMasked).map(w => w.scenario)
    );
    setSelectedScenarios(autoSelected);
    
    setIsComplete(true);
  }, [currentQuestionIndex, questions, answers, calculateScenarioWeights]);

  const toggleScenarioSelection = useCallback((scenario: string) => {
    setSelectedScenarios(prev => {
      const newSet = new Set(prev);
      if (newSet.has(scenario)) {
        newSet.delete(scenario);
      } else {
        newSet.add(scenario);
      }
      return newSet;
    });
  }, []);

  const selectAllActiveScenarios = useCallback(() => {
    const activeScenarios = scenarioWeights.filter(w => !w.isMasked).map(w => w.scenario);
    setSelectedScenarios(new Set(activeScenarios));
  }, [scenarioWeights]);

  const deselectAllScenarios = useCallback(() => {
    setSelectedScenarios(new Set());
  }, []);

  return {
    // State
    currentQuestion,
    currentQuestionIndex,
    progress,
    isComplete,
    answers,
    scenarioWeights,
    selectedScenarios,
    canGoBack,
    isLastQuestion,

    // Actions
    answerQuestion,
    goBack,
    resetQuestionnaire,
    autoCompleteQuestionnaire,
    toggleScenarioSelection,
    selectAllActiveScenarios,
    deselectAllScenarios,

    // Computed
    totalQuestions: questions.length,
    questions,
    scaleLabels: SCALE_LABELS
  };
}