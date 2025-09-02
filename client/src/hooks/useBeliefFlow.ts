import { useState, useCallback } from 'react';
import { BELIEF_QUESTIONS, SCENARIO_DEFAULTS, SCENARIO_MAPPING, type BeliefQuestion } from '../data/belief-questions';
import { type PersonaDef } from '../data/personas';

export interface BeliefAnswer {
  questionId: string;
  selectedOption: string;
}

export interface ScenarioSelection {
  top: string;
  runnerUp?: string;
  blend?: [number, number];
  confidence: 'clear_winner' | 'close' | 'indecisive';
}

export interface PortfolioAllocation {
  [asset: string]: number;
}

export interface BeliefFlowResult {
  scenarioSelection: ScenarioSelection;
  baseAllocation: PortfolioAllocation;
  personaAdjustedAllocation: PortfolioAllocation;
  explanations: {
    scenarioReason: string;
    personaRulesApplied: string[];
  };
}

export function useBeliefFlow() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<BeliefAnswer[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<BeliefFlowResult | null>(null);

  const questions = BELIEF_QUESTIONS;
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + answers.length) / questions.length) * 100;
  const canGoBack = currentQuestionIndex > 0 || answers.length > 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // Process answers to scenario weights using beliefs logic
  const calculateScenarioWeights = useCallback((beliefAnswers: BeliefAnswer[]) => {
    // Sum scenario weights from answers
    const rawScores: Record<string, number> = {};
    
    for (const answer of beliefAnswers) {
      const question = questions.find(q => q.id === answer.questionId);
      if (!question) continue;
      
      const option = question.options[answer.selectedOption];
      if (!option) continue;
      
      for (const [scenario, weight] of Object.entries(option.scenarios)) {
        rawScores[scenario] = (rawScores[scenario] || 0) + weight;
      }
    }

    // Apply temperature-scaled softmax with mean centering
    const allScenarios = ['recession', 'property_down', 'stagflation', 'tech_correction', 
                         'devaluation', 'gilt_selloff', 'energy_spike', 'reflation'];
    
    for (const scenario of allScenarios) {
      if (!(scenario in rawScores)) {
        rawScores[scenario] = 0;
      }
    }

    // Mean center
    const mean = Object.values(rawScores).reduce((a, b) => a + b, 0) / allScenarios.length;
    const centeredScores: Record<string, number> = {};
    for (const [scenario, score] of Object.entries(rawScores)) {
      centeredScores[scenario] = score - mean;
    }

    // Temperature-scaled softmax (temperature = 0.5)
    const temperature = 0.5;
    const expScores: Record<string, number> = {};
    let expSum = 0;
    
    for (const [scenario, score] of Object.entries(centeredScores)) {
      const expScore = Math.exp(score / temperature);
      expScores[scenario] = expScore;
      expSum += expScore;
    }

    // Normalize to probabilities
    const probabilities: Record<string, number> = {};
    for (const [scenario, expScore] of Object.entries(expScores)) {
      probabilities[scenario] = expScore / expSum;
    }

    // Sort by probability
    const sorted = Object.entries(probabilities)
      .sort(([, a], [, b]) => b - a)
      .map(([scenario, prob]) => ({ scenario, probability: prob }));

    return sorted;
  }, [questions]);

  // Select scenarios based on decision rules
  const selectScenarios = useCallback((sortedScenarios: Array<{scenario: string, probability: number}>) => {
    const top = sortedScenarios[0];
    const runnerUp = sortedScenarios[1];
    
    const gap = (top.probability - runnerUp.probability) * 100; // Convert to percentage points

    if (gap >= 10) {
      // Clear winner
      return {
        top: top.scenario,
        confidence: 'clear_winner' as const
      };
    } else if (gap >= 3) {
      // Close - blend based on gap
      let topWeight = 0.55; // Default for 3pt gap
      if (gap >= 7) topWeight = 0.65;
      else if (gap >= 4) topWeight = 0.60;
      
      return {
        top: top.scenario,
        runnerUp: runnerUp.scenario,
        blend: [topWeight, 1 - topWeight] as [number, number],
        confidence: 'close' as const
      };
    } else {
      // Indecisive - fall back to neutral/balanced
      return {
        top: 'reflation', // Neutral scenario
        confidence: 'indecisive' as const
      };
    }
  }, []);

  // Create base allocation from scenario(s)
  const createBaseAllocation = useCallback((selection: ScenarioSelection): PortfolioAllocation => {
    if (selection.blend && selection.runnerUp) {
      // Blend two scenarios
      const topAlloc = SCENARIO_DEFAULTS[selection.top] || {};
      const runnerUpAlloc = SCENARIO_DEFAULTS[selection.runnerUp] || {};
      const [topWeight, runnerWeight] = selection.blend;
      
      const blended: PortfolioAllocation = {};
      const allAssets = Array.from(new Set([...Object.keys(topAlloc), ...Object.keys(runnerUpAlloc)]));
      
      for (const asset of allAssets) {
        blended[asset] = (topAlloc[asset] || 0) * topWeight + (runnerUpAlloc[asset] || 0) * runnerWeight;
      }
      
      return blended;
    } else {
      // Single scenario
      return SCENARIO_DEFAULTS[selection.top] || {};
    }
  }, []);

  // Apply persona constraints (simplified version of the rules)
  const applyPersonaRules = useCallback((baseAllocation: PortfolioAllocation, persona: PersonaDef, scenarioId: string) => {
    const alloc = { ...baseAllocation };
    const appliedRules: string[] = [];

    // Liquidity floor: min(10%, 2% × liquidityMonths)
    const minLiquidity = Math.max(0.10, 0.02 * persona.liquidityMonths);
    const currentLiquidity = (alloc.CASH || 0) + (alloc.GILTS_SHORT || 0);
    
    if (currentLiquidity < minLiquidity) {
      const needed = minLiquidity - currentLiquidity;
      alloc.CASH = (alloc.CASH || 0) + needed * 0.6;
      alloc.GILTS_SHORT = (alloc.GILTS_SHORT || 0) + needed * 0.4;
      
      // Take from riskier assets
      const toReduce = ['GLOBAL_EQUITY', 'GROWTH_TECH', 'COMMODITIES_ENERGY'];
      let remaining = needed;
      for (const asset of toReduce) {
        if (remaining <= 0) break;
        const cut = Math.min(alloc[asset] || 0, remaining / toReduce.length);
        alloc[asset] = (alloc[asset] || 0) - cut;
        remaining -= cut;
      }
      
      appliedRules.push(`Liquidity floor raised to ${(minLiquidity * 100).toFixed(0)}%`);
    }

    // Concentration limits (30% single asset class)
    let hasConcentrationCap = false;
    for (const [asset, weight] of Object.entries(alloc)) {
      if (weight > 0.30) {
        const excess = weight - 0.30;
        alloc[asset] = 0.30;
        alloc.IG_CREDIT = (alloc.IG_CREDIT || 0) + excess * 0.5;
        alloc.CASH = (alloc.CASH || 0) + excess * 0.5;
        hasConcentrationCap = true;
      }
    }
    if (hasConcentrationCap) {
      appliedRules.push('Concentration cap of 30% per asset class');
    }

    // Persona-specific rules
    if (persona.code === 'P016') {
      // BTL Mogul - property caps
      const propertyAssets = ['PROPERTY_UK_RESI', 'UK_REITs'];
      let maxProperty = 0.65;
      
      if (['gilt_selloff', 'stagflation'].includes(scenarioId)) {
        maxProperty = 0.45; // Deleveraging under rate shock
        appliedRules.push('Property cap reduced due to rate sensitivity');
      }
      
      const totalProperty = propertyAssets.reduce((sum, asset) => sum + (alloc[asset] || 0), 0);
      if (totalProperty > maxProperty) {
        const scale = maxProperty / totalProperty;
        for (const asset of propertyAssets) {
          alloc[asset] = (alloc[asset] || 0) * scale;
        }
        appliedRules.push(`Property exposure capped at ${(maxProperty * 100).toFixed(0)}%`);
      }
    }

    if (persona.code === 'P003' && scenarioId === 'tech_correction') {
      // Crypto Enthusiast - crypto caps in tech correction
      const cryptoAssets = ['CRYPTO_BTC', 'CRYPTO_ETH', 'CRYPTO_ALT'];
      const cryptoCap = 0.15;
      
      for (const asset of cryptoAssets) {
        if ((alloc[asset] || 0) > cryptoCap) {
          const excess = (alloc[asset] || 0) - cryptoCap;
          alloc[asset] = cryptoCap;
          alloc.IG_CREDIT = (alloc.IG_CREDIT || 0) + excess * 0.6;
          alloc.GILTS_LONG = (alloc.GILTS_LONG || 0) + excess * 0.4;
        }
      }
      appliedRules.push('Crypto exposure reduced in tech correction');
    }

    // Normalize to 100%
    const total = Object.values(alloc).reduce((sum, val) => sum + val, 0);
    if (total > 0) {
      for (const asset in alloc) {
        alloc[asset] = alloc[asset] / total;
      }
    }

    return { allocation: alloc, appliedRules };
  }, []);

  // Generate explanation text
  const createExplanations = useCallback((selection: ScenarioSelection, appliedRules: string[]) => {
    let scenarioReason = '';
    
    if (selection.confidence === 'clear_winner') {
      scenarioReason = `${selection.top.replace('_', ' ')} scenario shows strong match to your economic beliefs`;
    } else if (selection.confidence === 'close' && selection.runnerUp && selection.blend) {
      const [topWeight, runnerWeight] = selection.blend;
      scenarioReason = `Blending ${selection.top.replace('_', ' ')} (${(topWeight * 100).toFixed(0)}%) and ${selection.runnerUp.replace('_', ' ')} (${(runnerWeight * 100).toFixed(0)}%) based on your answers`;
    } else {
      scenarioReason = 'Using balanced approach due to mixed economic beliefs';
    }

    return {
      scenarioReason,
      personaRulesApplied: appliedRules
    };
  }, []);

  const answerQuestion = useCallback((selectedOption: string) => {
    if (!currentQuestion) return;

    const newAnswer: BeliefAnswer = {
      questionId: currentQuestion.id,
      selectedOption
    };

    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);

    if (isLastQuestion) {
      setIsComplete(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [currentQuestion, answers, isLastQuestion]);

  const goBack = useCallback(() => {
    if (canGoBack) {
      if (answers.length > 0) {
        setAnswers(prev => prev.slice(0, -1));
      }
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(prev => prev - 1);
      }
    }
  }, [canGoBack, answers.length, currentQuestionIndex]);

  const generateResult = useCallback((persona: PersonaDef) => {
    // Calculate scenario weights
    const sortedScenarios = calculateScenarioWeights(answers);
    
    // Select scenarios
    const scenarioSelection = selectScenarios(sortedScenarios);
    
    // Create base allocation
    const baseAllocation = createBaseAllocation(scenarioSelection);
    
    // Apply persona rules
    const { allocation: personaAdjustedAllocation, appliedRules } = applyPersonaRules(
      baseAllocation, 
      persona, 
      scenarioSelection.top
    );
    
    // Create explanations
    const explanations = createExplanations(scenarioSelection, appliedRules);
    
    const result: BeliefFlowResult = {
      scenarioSelection,
      baseAllocation,
      personaAdjustedAllocation,
      explanations
    };
    
    setResult(result);
    return result;
  }, [answers, calculateScenarioWeights, selectScenarios, createBaseAllocation, applyPersonaRules, createExplanations]);

  const resetFlow = useCallback(() => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setIsComplete(false);
    setResult(null);
  }, []);

  // Auto-complete for testing
  const autoComplete = useCallback(() => {
    const remainingQuestions = questions.slice(currentQuestionIndex);
    const randomAnswers = remainingQuestions.map(question => ({
      questionId: question.id,
      selectedOption: Object.keys(question.options)[Math.floor(Math.random() * Object.keys(question.options).length)]
    }));

    setAnswers([...answers, ...randomAnswers]);
    setIsComplete(true);
  }, [questions, currentQuestionIndex, answers]);

  return {
    // State
    currentQuestion,
    currentQuestionIndex,
    progress,
    isComplete,
    answers,
    result,
    canGoBack,
    isLastQuestion,
    
    // Actions
    answerQuestion,
    goBack,
    generateResult,
    resetFlow,
    autoComplete,
    
    // Computed
    totalQuestions: questions.length,
    questions
  };
}