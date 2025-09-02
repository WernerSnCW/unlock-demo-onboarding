import { useState, useCallback } from 'react';
import beliefsData from '@/data/beliefs.json';

export interface BeliefQuestion {
  id: string;
  text: string;
  scale: string;
  direction: string;
}

export interface BeliefAnswer {
  questionId: string;
  value: number;
}

export interface ScenarioWeight {
  scenario: string;
  weight: number;
  normalizedWeight: number;
}

export function useBeliefQuestionnaire() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<BeliefAnswer[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [scenarioWeights, setScenarioWeights] = useState<ScenarioWeight[]>([]);

  const questions = beliefsData.questions as BeliefQuestion[];
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + answers.length) / questions.length) * 100;
  const canGoBack = currentQuestionIndex > 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const answerQuestion = useCallback((value: number) => {
    const answer: BeliefAnswer = {
      questionId: currentQuestion.id,
      value
    };

    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (isLastQuestion) {
      // Calculate scenario weights
      const weights = calculateScenarioWeights(newAnswers);
      setScenarioWeights(weights);
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

  const resetQuestionnaire = useCallback(() => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setIsComplete(false);
    setScenarioWeights([]);
  }, []);

  const calculateScenarioWeights = useCallback((answers: BeliefAnswer[]) => {
    const rawWeights: Record<string, number> = {};

    // Initialize scenario weights
    const allScenarios = new Set<string>();
    Object.values(beliefsData.weights).forEach(questionWeights => {
      Object.keys(questionWeights).forEach(scenario => {
        allScenarios.add(scenario);
      });
    });

    allScenarios.forEach(scenario => {
      rawWeights[scenario] = 0;
    });

    // Calculate weighted contributions from each answer
    answers.forEach(answer => {
      const questionWeights = beliefsData.weights[answer.questionId as keyof typeof beliefsData.weights];
      if (questionWeights) {
        Object.entries(questionWeights).forEach(([scenario, weight]) => {
          // Convert 1-5 scale to impact: 1 = low impact, 5 = high impact
          // For questions with "lower->" direction, invert the scale
          const question = questions.find(q => q.id === answer.questionId);
          const direction = question?.direction || '';
          
          let impactMultiplier = answer.value;
          if (direction.includes('lower->')) {
            impactMultiplier = 6 - answer.value; // Invert scale for "lower" direction
          }
          
          // Normalize to 0-1 range
          const normalizedImpact = (impactMultiplier - 1) / 4;
          rawWeights[scenario] += weight * normalizedImpact;
        });
      }
    });

    // Apply softmax normalization for probability weights
    const maxWeight = Math.max(...Object.values(rawWeights));
    const expWeights = Object.entries(rawWeights).map(([scenario, weight]) => ({
      scenario,
      expWeight: Math.exp(weight - maxWeight) // Subtract max for numerical stability
    }));

    const sumExpWeights = expWeights.reduce((sum, item) => sum + item.expWeight, 0);

    const normalizedWeights = expWeights.map(({ scenario, expWeight }) => ({
      scenario,
      weight: rawWeights[scenario],
      normalizedWeight: expWeight / sumExpWeights
    }));

    // Sort by normalized weight descending
    return normalizedWeights.sort((a, b) => b.normalizedWeight - a.normalizedWeight);
  }, [questions]);

  return {
    // State
    currentQuestion,
    currentQuestionIndex,
    progress,
    isComplete,
    answers,
    scenarioWeights,
    canGoBack,
    isLastQuestion,

    // Actions
    answerQuestion,
    goBack,
    resetQuestionnaire,

    // Computed
    totalQuestions: questions.length,
    questions
  };
}