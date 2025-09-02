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
  isMasked: boolean;
}

export function useBeliefQuestionnaire() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<BeliefAnswer[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [scenarioWeights, setScenarioWeights] = useState<ScenarioWeight[]>([]);
  const [selectedScenarios, setSelectedScenarios] = useState<Set<string>>(new Set());

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
    // Enhanced configuration
    const config = {
      softmaxTemperature: 0.5,
      meanCenterScores: true,
      maskedSoftmaxThreshold: 0.001,
      questionBoosts: { 
        "B5_energy_policy": 1.3, 
        "B10_fx_view": 1.25, 
        "B12_policy_support": 1.2 
      } as Record<string, number>,
      displayCapPct: 80
    };

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

    // Step 1: Build raw scenario scores with question boosts
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
          
          // Step 2: Apply question boosts
          const boost = config.questionBoosts[answer.questionId] || 1.0;
          const boostedContribution = weight * normalizedImpact * boost;
          
          rawWeights[scenario] += boostedContribution;
        });
      }
    });

    console.log('Raw weights before processing:', rawWeights);

    // Step 3: Mean-centre scores
    if (config.meanCenterScores) {
      const average = Object.values(rawWeights).reduce((sum, weight) => sum + weight, 0) / allScenarios.size;
      Object.keys(rawWeights).forEach(scenario => {
        rawWeights[scenario] -= average;
      });
    }

    console.log('Weights after mean-centering:', rawWeights);

    // Step 4: Masking - identify scenarios below threshold
    const activeScenarios = Object.entries(rawWeights)
      .filter(([, weight]) => weight > config.maskedSoftmaxThreshold)
      .map(([scenario]) => scenario);

    console.log('Active scenarios:', activeScenarios);

    // Step 5: Temperature-scaled softmax
    const activeWeights = activeScenarios.map(scenario => rawWeights[scenario]);
    const maxWeight = Math.max(...activeWeights);
    
    const expWeights = activeScenarios.map(scenario => {
      const tempScaledWeight = (rawWeights[scenario] - maxWeight) / config.softmaxTemperature;
      return {
        scenario,
        expWeight: Math.exp(tempScaledWeight)
      };
    });

    const sumExpWeights = expWeights.reduce((sum, item) => sum + item.expWeight, 0);

    // Build final results
    const results: ScenarioWeight[] = [];
    
    // Add active scenarios with calculated percentages
    expWeights.forEach(({ scenario, expWeight }) => {
      let normalizedWeight = expWeight / sumExpWeights;
      
      // Step 6: Apply display cap
      if (normalizedWeight > (config.displayCapPct / 100)) {
        normalizedWeight = config.displayCapPct / 100;
      }
      
      results.push({
        scenario,
        weight: rawWeights[scenario],
        normalizedWeight,
        isMasked: false
      });
    });

    // Add masked scenarios with 0%
    allScenarios.forEach(scenario => {
      if (!activeScenarios.includes(scenario)) {
        results.push({
          scenario,
          weight: rawWeights[scenario],
          normalizedWeight: 0,
          isMasked: true
        });
      }
    });

    // Rescale to ensure sum is 100% after capping
    const totalActive = results.filter(r => !r.isMasked).reduce((sum, r) => sum + r.normalizedWeight, 0);
    if (totalActive > 0) {
      results.forEach(result => {
        if (!result.isMasked) {
          result.normalizedWeight = result.normalizedWeight / totalActive;
        }
      });
    }

    console.log('Final scenario weights:', results);

    // Sort by normalized weight descending
    return results.sort((a, b) => b.normalizedWeight - a.normalizedWeight);
  }, [questions]);

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
      value: Math.floor(Math.random() * 5) + 1 // Random value between 1-5
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
    questions
  };
}