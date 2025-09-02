import { useState, useCallback } from 'react';
import { CORE_QUESTIONS, Question } from '@/data/questions';
import { INVESTMENT_PERSONAS, DIMENSION_LABELS, DIMENSION_WEIGHTS, CONFIG, PersonaDef } from '@/data/personas';

export interface QuizAnswer {
  questionId: string;
  optionIndex: number;
  scores: number[];
}

export interface PersonaMatch {
  persona: PersonaDef;
  matchScore: number;
  confidence: number;
}

export interface QuizResult {
  topMatch: PersonaMatch;
  runnerUp?: PersonaMatch;
  userProfile: number[];
  alignedDimensions: string[];
  notableDifferences: string[];
}

export function usePersonaQuiz() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [userRawScores, setUserRawScores] = useState<number[]>(new Array(8).fill(0));
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  const currentQuestion = CORE_QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / CORE_QUESTIONS.length) * 100;
  const canGoBack = currentQuestionIndex > 0;
  const isLastQuestion = currentQuestionIndex === CORE_QUESTIONS.length - 1;

  // Calculate per-dimension maxima for normalization
  const calculateDimensionMaxima = useCallback(() => {
    const maxima = new Array(8).fill(0);
    
    CORE_QUESTIONS.forEach(question => {
      question.options.forEach(option => {
        option.scores.forEach((score, dimIndex) => {
          maxima[dimIndex] = Math.max(maxima[dimIndex], score);
        });
      });
    });
    
    // Prevent division by zero
    return maxima.map(max => max || 1);
  }, []);

  // Normalize user scores to 0-5 scale
  const normalizeScores = useCallback((rawScores: number[]) => {
    const maxima = calculateDimensionMaxima();
    return rawScores.map((score, index) => 
      Math.min(5, Math.max(0, (score / maxima[index]) * 5))
    );
  }, [calculateDimensionMaxima]);

  // Apply dimension weights
  const applyWeights = useCallback((scores: number[]) => {
    return scores.map((score, index) => score * DIMENSION_WEIGHTS[index]);
  }, []);

  // Calculate cosine similarity between two vectors
  const cosineSimilarity = useCallback((a: number[], b: number[]) => {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
  }, []);

  // Calculate match scores and find best persona
  const calculatePersonaMatches = useCallback((userProfile: number[]) => {
    const weightedUserProfile = applyWeights(userProfile);
    const matches: PersonaMatch[] = [];

    Object.values(INVESTMENT_PERSONAS).forEach(persona => {
      const weightedPersonaScores = applyWeights(persona.scores);
      const similarity = cosineSimilarity(weightedUserProfile, weightedPersonaScores);
      const matchScore = Math.round(similarity * 100);
      
      matches.push({
        persona,
        matchScore,
        confidence: 0 // Will be calculated with softmax
      });
    });

    // Sort by match score (descending)
    matches.sort((a, b) => b.matchScore - a.matchScore);

    // Apply softmax for relative confidence
    const maxScore = Math.max(...matches.map(m => m.matchScore));
    const expScores = matches.map(m => Math.exp(m.matchScore - maxScore));
    const sumExpScores = expScores.reduce((sum, exp) => sum + exp, 0);
    
    matches.forEach((match, index) => {
      match.confidence = Math.round((expScores[index] / sumExpScores) * 100);
    });

    return matches;
  }, [applyWeights, cosineSimilarity]);

  // Apply tie-breaking logic (safer persona when close)
  const applyTieBreaking = useCallback((matches: PersonaMatch[]) => {
    if (matches.length < 2) return matches;

    const [first, second] = matches;
    const gap = first.matchScore - second.matchScore;

    if (gap <= CONFIG.tieBreakGap) {
      // Choose safer persona (lower risk, higher liquidity)
      const firstRisk = first.persona.scores[0];
      const secondRisk = second.persona.scores[0];
      
      if (secondRisk < firstRisk) {
        // Second is safer (lower risk)
        return [second, first, ...matches.slice(2)];
      } else if (firstRisk === secondRisk) {
        // Equal risk, check liquidity
        const firstLiquidity = first.persona.scores[6];
        const secondLiquidity = second.persona.scores[6];
        
        if (secondLiquidity > firstLiquidity) {
          // Second is safer (higher liquidity)
          return [second, first, ...matches.slice(2)];
        }
      }
    }

    return matches;
  }, []);

  // Find aligned dimensions and notable differences
  const analyzeAlignment = useCallback((userProfile: number[], topPersona: PersonaDef) => {
    const differences = userProfile.map((userScore, index) => ({
      dimension: index,
      label: DIMENSION_LABELS[index],
      difference: Math.abs(userScore - topPersona.scores[index])
    }));

    differences.sort((a, b) => a.difference - b.difference);

    const alignedDimensions = differences
      .slice(0, 3)
      .map(d => d.label);

    const notableDifferences = differences
      .filter(d => d.difference >= 2)
      .slice(0, 3)
      .map(d => d.label);

    return { alignedDimensions, notableDifferences };
  }, []);

  const answerQuestion = useCallback((optionIndex: number) => {
    const option = currentQuestion.options[optionIndex];
    const newAnswer: QuizAnswer = {
      questionId: currentQuestion.id,
      optionIndex,
      scores: option.scores
    };

    // Update raw scores
    const newRawScores = [...userRawScores];
    option.scores.forEach((score, index) => {
      newRawScores[index] += score;
    });

    setAnswers(prev => [...prev, newAnswer]);
    setUserRawScores(newRawScores);

    if (isLastQuestion) {
      // Calculate final result
      const userProfile = normalizeScores(newRawScores);
      const matches = calculatePersonaMatches(userProfile);
      const finalMatches = applyTieBreaking(matches);
      
      const topMatch = finalMatches[0];
      const runnerUp = CONFIG.showRunnerUpWhenClose && 
                      finalMatches.length > 1 && 
                      (topMatch.matchScore - finalMatches[1].matchScore) <= CONFIG.tieBreakGap
                      ? finalMatches[1] 
                      : undefined;

      const { alignedDimensions, notableDifferences } = analyzeAlignment(userProfile, topMatch.persona);

      setResult({
        topMatch,
        runnerUp,
        userProfile,
        alignedDimensions,
        notableDifferences
      });
      setIsComplete(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [currentQuestion, userRawScores, isLastQuestion, normalizeScores, calculatePersonaMatches, applyTieBreaking, analyzeAlignment]);

  const goBack = useCallback(() => {
    if (!canGoBack) return;

    // Remove last answer and update scores
    const lastAnswer = answers[answers.length - 1];
    const newRawScores = [...userRawScores];
    lastAnswer.scores.forEach((score, index) => {
      newRawScores[index] -= score;
    });

    setAnswers(prev => prev.slice(0, -1));
    setUserRawScores(newRawScores);
    setCurrentQuestionIndex(prev => prev - 1);
  }, [canGoBack, answers, userRawScores]);

  const skipQuestion = useCallback(() => {
    if (isLastQuestion) {
      // Calculate result with current scores
      const userProfile = normalizeScores(userRawScores);
      const matches = calculatePersonaMatches(userProfile);
      const finalMatches = applyTieBreaking(matches);
      
      const topMatch = finalMatches[0];
      const runnerUp = CONFIG.showRunnerUpWhenClose && 
                      finalMatches.length > 1 && 
                      (topMatch.matchScore - finalMatches[1].matchScore) <= CONFIG.tieBreakGap
                      ? finalMatches[1] 
                      : undefined;

      const { alignedDimensions, notableDifferences } = analyzeAlignment(userProfile, topMatch.persona);

      setResult({
        topMatch,
        runnerUp,
        userProfile,
        alignedDimensions,
        notableDifferences
      });
      setIsComplete(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [isLastQuestion, userRawScores, normalizeScores, calculatePersonaMatches, applyTieBreaking, analyzeAlignment]);

  const resetQuiz = useCallback(() => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setUserRawScores(new Array(8).fill(0));
    setIsComplete(false);
    setResult(null);
  }, []);

  return {
    // State
    currentQuestion,
    currentQuestionIndex,
    progress,
    answers,
    isComplete,
    result,
    canGoBack,
    isLastQuestion,

    // Actions
    answerQuestion,
    goBack,
    skipQuestion,
    resetQuiz,

    // Computed
    totalQuestions: CORE_QUESTIONS.length,
    dimensionLabels: DIMENSION_LABELS
  };
}