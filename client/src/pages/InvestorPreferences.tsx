import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Shield, Target, Lightbulb, BookOpen, DollarSign, AlertTriangle, Users, Globe, User, Heart, Clock, HelpCircle, Sparkles, Settings, Droplets, Brain, ThumbsUp, ThumbsDown, Minus, RotateCcw, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const preferencesSchema = z.object({
  investorObjective: z.enum(['wealth_preservation', 'wealth_building', 'hybrid'], {
    required_error: 'Please select your primary investment objective.',
  }),
  riskProfile: z.enum(['conservative', 'cautious', 'balanced', 'growth', 'aggressive'], {
    required_error: 'Please select your risk profile.',
  }),
  investmentHorizon: z.enum(['short_term', 'medium_term', 'long_term'], {
    required_error: 'Please select your investment time horizon.',
  }),
  managementStyle: z.enum(['minimal', 'moderate', 'high'], {
    required_error: 'Please select your preferred management style.',
  }),
  liquidityPreference: z.enum(['prefer_liquid', 'mixed_acceptable', 'comfortable_illiquid'], {
    required_error: 'Please select your liquidity preference.',
  }),
  decisionMakingStyle: z.enum(['rely_advisors', 'collaborate_peers', 'independent_research'], {
    required_error: 'Please select your decision-making style.',
  }),
  riskCapacity: z.number().min(1).max(10),
  ticketSizeMin: z.number().min(0),
  ticketSizeMax: z.number().min(0),
  activeInvestmentInterests: z.array(z.string()).min(1, 'Please select at least one investment interest'),
  learningCuriosityAreas: z.array(z.string()).min(1, 'Please select at least one area of curiosity'),
  geographicPreferences: z.array(z.string()).min(1, 'Please select at least one geographic preference'),
  esgImportance: z.enum(['not_important', 'somewhat_important', 'very_important']),
});

type PreferencesFormData = z.infer<typeof preferencesSchema>;

const investorObjectives = [
  {
    id: 'wealth_preservation',
    title: 'Wealth Preservation',
    description: 'Focus on protecting and maintaining existing wealth with steady, low-risk returns',
    icon: Shield,
    color: 'text-green-600 dark:text-green-400'
  },
  {
    id: 'wealth_building',
    title: 'Wealth Building',
    description: 'Actively grow wealth through higher-risk, higher-reward investment opportunities',
    icon: TrendingUp,
    color: 'text-blue-600 dark:text-blue-400'
  },
  {
    id: 'hybrid',
    title: 'Hybrid Approach',
    description: 'Balanced strategy combining wealth preservation and growth opportunities',
    icon: Target,
    color: 'text-purple-600 dark:text-purple-400'
  }
];

const riskProfiles = [
  {
    id: 'conservative',
    title: 'Conservative',
    description: 'Prioritize capital preservation, minimal volatility tolerance',
    range: '0-15% expected volatility'
  },
  {
    id: 'cautious',
    title: 'Cautious',
    description: 'Limited risk exposure, preference for stable returns',
    range: '5-25% expected volatility'
  },
  {
    id: 'balanced',
    title: 'Balanced',
    description: 'Moderate risk tolerance, balanced growth and preservation',
    range: '10-35% expected volatility'
  },
  {
    id: 'growth',
    title: 'Growth',
    description: 'Higher risk tolerance for potentially greater returns',
    range: '15-45% expected volatility'
  },
  {
    id: 'aggressive',
    title: 'Aggressive',
    description: 'Maximum growth potential, comfortable with high volatility',
    range: '20%+ expected volatility'
  }
];

const managementStyles = [
  {
    id: 'minimal',
    title: 'Minimal',
    description: 'Prefer delegation/advisors',
    icon: Users
  },
  {
    id: 'moderate',
    title: 'Moderate',
    description: 'Occasional research and involvement',
    icon: Settings
  },
  {
    id: 'high',
    title: 'High',
    description: 'Hands-on, self-directed, frequent decisions',
    icon: Brain
  }
];

const liquidityPreferences = [
  {
    id: 'prefer_liquid',
    title: 'Prefer Liquid Assets',
    description: 'Prefer liquid, tradeable assets',
    icon: Droplets
  },
  {
    id: 'mixed_acceptable',
    title: 'Mixed Acceptable',
    description: 'Mix of liquid and illiquid acceptable',
    icon: Target
  },
  {
    id: 'comfortable_illiquid',
    title: 'Comfortable with Illiquid',
    description: 'Comfortable with illiquid/tied-up investments',
    icon: Clock
  }
];

const decisionMakingStyles = [
  {
    id: 'rely_advisors',
    title: 'Professional Advisors',
    description: 'Rely on professional advisors',
    icon: Users
  },
  {
    id: 'collaborate_peers',
    title: 'Collaborate with Peers',
    description: 'Collaborate with peers/networks',
    icon: Globe
  },
  {
    id: 'independent_research',
    title: 'Independent Research',
    description: 'Independent / self-research',
    icon: BookOpen
  }
];

const timeHorizons = [
  {
    id: 'short_term',
    title: 'Short Term',
    description: '0-5 years',
    icon: Clock
  },
  {
    id: 'medium_term',
    title: 'Medium Term',
    description: '5-10 years',
    icon: Target
  },
  {
    id: 'long_term',
    title: 'Long Term',
    description: '10+ years, retirement/legacy',
    icon: TrendingUp
  }
];

const esgImportanceOptions = [
  {
    id: 'not_important',
    title: 'Not Important',
    description: 'ESG factors are not a priority in investment decisions',
    icon: DollarSign
  },
  {
    id: 'somewhat_important',
    title: 'Somewhat Important',
    description: 'ESG factors are considered alongside financial returns',
    icon: Heart
  },
  {
    id: 'very_important',
    title: 'Very Important',
    description: 'ESG factors are a primary consideration in investment decisions',
    icon: Globe
  }
];

const investmentInterests = [
  'Public Equity Markets', 'Private Equity', 'Venture Capital', 'Angel Investing',
  'Real Estate Investment', 'Property Development', 'REITs', 'Cryptocurrency',
  'Bond Markets', 'Government Securities', 'Corporate Bonds', 'Hedge Funds',
  'Commodities Trading', 'Precious Metals', 'Energy Investments', 'Infrastructure',
  'ESG/Impact Investing', 'Fintech Innovation', 'Biotech & Healthcare', 'AI & Technology',
  'Green Energy', 'Cleantech', 'Emerging Markets', 'Alternative Assets',
  'Fine Art & Collectibles', 'Whisky & Spirits', 'Wine Investment', 'Classic Cars',
  'Luxury Watches', 'Peer-to-Peer Lending', 'Crowdfunding', 'Pension Schemes',
  'ISA Optimization', 'Tax-Efficient Investments', 'EIS/SEIS Opportunities', 'VCTs'
];

const learningAreas = [
  'Market Analysis & Research', 'Financial Statement Analysis', 'Valuation Methods',
  'Portfolio Diversification', 'Risk Management', 'Tax Optimization Strategies',
  'Alternative Investment Strategies', 'ESG Investment Principles', 'Cryptocurrency Fundamentals',
  'Real Estate Investment Analysis', 'Venture Capital Ecosystem', 'Private Equity Structures',
  'Options & Derivatives', 'International Markets', 'Economic Indicators',
  'Behavioral Finance', 'Robo-Advisory Platforms', 'DIY Investment Platforms',
  'Pension Planning', 'Retirement Strategies', 'Estate Planning', 'Insurance Products',
  'Regulatory Environment', 'Investment Psychology', 'Technical Analysis', 'Fundamental Analysis'
];

const geographicRegions = [
  'United Kingdom', 'European Union', 'United States', 'Canada',
  'Asia-Pacific', 'Japan', 'China', 'India', 'Southeast Asia',
  'Latin America', 'Middle East', 'Africa', 'Australia', 'Nordic Countries',
  'Switzerland', 'Emerging Markets', 'Frontier Markets', 'Global Diversified'
];

// Persona definitions based on criteria
const investorPersonas = [
  {
    id: 'retirement_planner',
    name: 'The Retirement Planner (Hybrid)',
    description: 'Focused on long-term retirement planning with moderate involvement and balanced approach',
    criteria: {
      investorObjective: ['hybrid'],
      riskProfile: ['cautious', 'balanced'],
      riskCapacity: [4, 5, 6],
      managementStyle: ['moderate'],
      liquidityPreference: ['mixed_acceptable'],
      decisionMakingStyle: ['rely_advisors', 'independent_research'],
      investmentHorizon: ['long_term'],
      esgImportance: ['somewhat_important'],
      activeInvestmentInterests: ['Pension Schemes', 'ISA Optimization', 'Tax-Efficient Investments', 'EIS/SEIS Opportunities'],
      learningCuriosityAreas: ['Retirement Strategies', 'Tax Optimization Strategies', 'Insurance Products', 'Estate Planning'],
      geographicPreferences: ['United Kingdom', 'European Union']
    }
  },
  {
    id: 'wealth_accumulator',
    name: 'The Wealth Accumulator (Self-Directed)',
    description: 'High-growth focused, self-directed investor with appetite for emerging opportunities',
    criteria: {
      investorObjective: ['wealth_building'],
      riskProfile: ['growth'],
      riskCapacity: [7, 8, 9],
      managementStyle: ['high'],
      liquidityPreference: ['mixed_acceptable'],
      decisionMakingStyle: ['independent_research'],
      investmentHorizon: ['medium_term'],
      esgImportance: ['not_important', 'somewhat_important'],
      activeInvestmentInterests: ['Venture Capital', 'Angel Investing', 'Cryptocurrency', 'Emerging Markets', 'AI & Technology'],
      learningCuriosityAreas: ['Market Analysis & Research', 'Venture Capital Ecosystem', 'Risk Management', 'Cryptocurrency Fundamentals'],
      geographicPreferences: ['United States', 'Global Diversified', 'Emerging Markets']
    }
  },
  {
    id: 'legacy_builder',
    name: 'The Legacy Builder (Advisor-Reliant)',
    description: 'Conservative wealth preservation focused on long-term legacy with strong ESG considerations',
    criteria: {
      investorObjective: ['wealth_preservation'],
      riskProfile: ['conservative'],
      riskCapacity: [3, 4, 5],
      managementStyle: ['minimal'],
      liquidityPreference: ['prefer_liquid'],
      decisionMakingStyle: ['rely_advisors'],
      investmentHorizon: ['long_term'],
      esgImportance: ['very_important'],
      activeInvestmentInterests: ['Bond Markets', 'Real Estate Investment', 'Fine Art & Collectibles', 'EIS/SEIS Opportunities'],
      learningCuriosityAreas: ['Estate Planning', 'Tax Optimization Strategies', 'Pension Planning'],
      geographicPreferences: ['United Kingdom', 'European Union']
    }
  },
  {
    id: 'novice_self_directed',
    name: 'The Novice Self-Directed Investor',
    description: 'Learning-focused beginner with cautious approach to self-directed investing',
    criteria: {
      investorObjective: ['hybrid'],
      riskProfile: ['cautious'],
      riskCapacity: [3, 4, 5],
      managementStyle: ['moderate'],
      liquidityPreference: ['prefer_liquid'],
      decisionMakingStyle: ['independent_research'],
      investmentHorizon: ['medium_term'],
      esgImportance: ['not_important', 'somewhat_important'],
      activeInvestmentInterests: ['Public Equity Markets', 'Cryptocurrency', 'EIS/SEIS Opportunities'],
      learningCuriosityAreas: ['Market Analysis & Research', 'DIY Investment Platforms', 'Risk Management'],
      geographicPreferences: ['United Kingdom', 'United States']
    }
  },
  {
    id: 'property_lover',
    name: 'The Property Lover',
    description: 'Real estate focused investor comfortable with illiquid assets and advisor support',
    criteria: {
      investorObjective: ['hybrid'],
      riskProfile: ['balanced'],
      riskCapacity: [5, 6, 7],
      managementStyle: ['minimal', 'moderate'],
      liquidityPreference: ['comfortable_illiquid'],
      decisionMakingStyle: ['rely_advisors'],
      investmentHorizon: ['long_term'],
      esgImportance: ['not_important'],
      activeInvestmentInterests: ['Real Estate Investment', 'Property Development', 'REITs', 'Alternative Assets'],
      learningCuriosityAreas: ['Tax Optimization Strategies', 'Real Estate Investment Analysis'],
      geographicPreferences: ['United Kingdom', 'European Union']
    }
  },
  {
    id: 'crypto_bro',
    name: 'The Crypto Bro',
    description: 'High-risk cryptocurrency enthusiast with aggressive self-directed approach',
    criteria: {
      investorObjective: ['wealth_building'],
      riskProfile: ['aggressive'],
      riskCapacity: [8, 9, 10],
      managementStyle: ['high'],
      liquidityPreference: ['mixed_acceptable'],
      decisionMakingStyle: ['independent_research'],
      investmentHorizon: ['medium_term'],
      esgImportance: ['not_important'],
      activeInvestmentInterests: ['Cryptocurrency', 'AI & Technology'],
      learningCuriosityAreas: ['Cryptocurrency Fundamentals', 'Risk Management'],
      geographicPreferences: ['United States', 'Emerging Markets']
    }
  },
  {
    id: 'old_fashioned',
    name: 'The Old Fashioned',
    description: 'Traditional conservative investor preferring established markets and advisor guidance',
    criteria: {
      investorObjective: ['wealth_preservation'],
      riskProfile: ['conservative'],
      riskCapacity: [2, 3, 4],
      managementStyle: ['minimal'],
      liquidityPreference: ['prefer_liquid'],
      decisionMakingStyle: ['rely_advisors'],
      investmentHorizon: ['long_term'],
      esgImportance: ['somewhat_important'],
      activeInvestmentInterests: ['Bond Markets', 'Public Equity Markets', 'Government Securities'],
      learningCuriosityAreas: ['Pension Planning', 'Risk Management', 'Market Analysis & Research'],
      geographicPreferences: ['United Kingdom', 'European Union']
    }
  },
  {
    id: 'mr_alternative',
    name: 'Mr Alternative',
    description: 'Alternative investment specialist comfortable with illiquid assets and complex strategies',
    criteria: {
      investorObjective: ['hybrid'],
      riskProfile: ['growth'],
      riskCapacity: [6, 7, 8],
      managementStyle: ['moderate'],
      liquidityPreference: ['comfortable_illiquid'],
      decisionMakingStyle: ['independent_research', 'rely_advisors'],
      investmentHorizon: ['medium_term', 'long_term'],
      esgImportance: ['not_important'],
      activeInvestmentInterests: ['Fine Art & Collectibles', 'Whisky & Spirits', 'Private Equity', 'Hedge Funds', 'Alternative Assets', 'Venture Capital', 'EIS/SEIS Opportunities'],
      learningCuriosityAreas: ['Alternative Investment Strategies', 'Valuation Methods', 'Venture Capital Ecosystem'],
      geographicPreferences: ['Global Diversified']
    }
  },
  {
    id: 'angel_networker',
    name: 'The Angel Networker',
    description: 'Early-stage investment specialist who values peer collaboration and syndicate opportunities',
    criteria: {
      investorObjective: ['wealth_building'],
      riskProfile: ['growth'],
      riskCapacity: [6, 7, 8],
      managementStyle: ['moderate'],
      liquidityPreference: ['mixed_acceptable'],
      decisionMakingStyle: ['collaborate_peers'],
      investmentHorizon: ['medium_term', 'long_term'],
      esgImportance: ['somewhat_important'],
      activeInvestmentInterests: ['Angel Investing', 'EIS/SEIS Opportunities', 'Venture Capital'],
      learningCuriosityAreas: ['Venture Capital Ecosystem', 'Risk Management'],
      geographicPreferences: ['United Kingdom', 'United States', 'European Union']
    }
  },
  {
    id: 'city_professional',
    name: 'The City Professional',
    description: 'Time-poor professional seeking advisor-managed balanced approach to wealth building',
    criteria: {
      investorObjective: ['hybrid'],
      riskProfile: ['balanced'],
      riskCapacity: [5, 6, 7],
      managementStyle: ['minimal'],
      liquidityPreference: ['mixed_acceptable'],
      decisionMakingStyle: ['rely_advisors'],
      investmentHorizon: ['medium_term'],
      esgImportance: ['somewhat_important'],
      activeInvestmentInterests: ['Public Equity Markets', 'Venture Capital', 'EIS/SEIS Opportunities'],
      learningCuriosityAreas: ['Tax Optimization Strategies', 'Pension Planning'],
      geographicPreferences: ['United Kingdom', 'Global Diversified']
    }
  },
  {
    id: 'inheritance_receiver',
    name: 'The Inheritance Receiver',
    description: 'Cautious new investor exploring options while preserving inherited wealth',
    criteria: {
      investorObjective: ['wealth_preservation'],
      riskProfile: ['cautious'],
      riskCapacity: [3, 4, 5],
      managementStyle: ['moderate'],
      liquidityPreference: ['prefer_liquid'],
      decisionMakingStyle: ['rely_advisors', 'independent_research'],
      investmentHorizon: ['medium_term', 'long_term'],
      esgImportance: ['somewhat_important'],
      activeInvestmentInterests: ['Bond Markets', 'Cryptocurrency'],
      learningCuriosityAreas: ['Market Analysis & Research', 'Behavioral Finance'],
      geographicPreferences: ['United Kingdom', 'European Union']
    }
  },
  {
    id: 'the_saver',
    name: 'The Saver',
    description: 'Ultra-conservative investor focused on capital preservation and ESG principles',
    criteria: {
      investorObjective: ['wealth_preservation'],
      riskProfile: ['conservative'],
      riskCapacity: [2, 3, 4],
      managementStyle: ['minimal'],
      liquidityPreference: ['prefer_liquid'],
      decisionMakingStyle: ['rely_advisors'],
      investmentHorizon: ['long_term'],
      esgImportance: ['very_important', 'somewhat_important'],
      activeInvestmentInterests: ['Bond Markets', 'Government Securities', 'ISA Optimization', 'Pension Schemes'],
      learningCuriosityAreas: ['Pension Planning'],
      geographicPreferences: ['United Kingdom', 'European Union']
    }
  }
];

function classifyInvestorPersona(formData: PreferencesFormData): { persona: typeof investorPersonas[0], score: number } {
  let bestMatch = { persona: investorPersonas[0], score: 0 };

  for (const persona of investorPersonas) {
    let score = 0;
    let totalCriteria = 0;

    // Check each criterion and award points for matches
    const criteria = persona.criteria;

    // Primary criteria (higher weight)
    if (criteria.investorObjective.includes(formData.investorObjective)) score += 3;
    totalCriteria += 3;

    if (criteria.riskProfile.includes(formData.riskProfile)) score += 3;
    totalCriteria += 3;

    if (criteria.riskCapacity.includes(formData.riskCapacity)) score += 2;
    totalCriteria += 2;

    // Management and decision style (medium weight)
    if (criteria.managementStyle.includes(formData.managementStyle)) score += 2;
    totalCriteria += 2;

    if (criteria.liquidityPreference.includes(formData.liquidityPreference)) score += 2;
    totalCriteria += 2;

    if (criteria.decisionMakingStyle.includes(formData.decisionMakingStyle)) score += 2;
    totalCriteria += 2;

    if (criteria.investmentHorizon.includes(formData.investmentHorizon)) score += 2;
    totalCriteria += 2;

    if (criteria.esgImportance.includes(formData.esgImportance)) score += 1;
    totalCriteria += 1;

    // Interest alignment (lower weight but important for persona fit)
    const interestMatches = formData.activeInvestmentInterests.filter(interest => 
      criteria.activeInvestmentInterests.some(criteriaInterest => 
        criteriaInterest.toLowerCase().includes(interest.toLowerCase()) || 
        interest.toLowerCase().includes(criteriaInterest.toLowerCase())
      )
    ).length;
    score += Math.min(interestMatches, 3); // Cap at 3 points
    totalCriteria += 3;

    const learningMatches = formData.learningCuriosityAreas.filter(area => 
      criteria.learningCuriosityAreas.some(criteriaArea => 
        criteriaArea.toLowerCase().includes(area.toLowerCase()) || 
        area.toLowerCase().includes(criteriaArea.toLowerCase())
      )
    ).length;
    score += Math.min(learningMatches, 2); // Cap at 2 points
    totalCriteria += 2;

    const geoMatches = formData.geographicPreferences.filter(geo => 
      criteria.geographicPreferences.includes(geo)
    ).length;
    score += Math.min(geoMatches, 2); // Cap at 2 points
    totalCriteria += 2;

    // Calculate percentage score
    const percentageScore = (score / totalCriteria) * 100;

    if (percentageScore > bestMatch.score) {
      bestMatch = { persona, score: percentageScore };
    }
  }

  return bestMatch;
}

// Sequential questionnaire data structure
interface QuestionnaireQuestion {
  id: string;
  text: string;
  category: string;
}

interface QuestionnaireAnswer {
  questionId: string;
  response: 'agree' | 'neutral' | 'disagree';
}

const questionnaireQuestions: QuestionnaireQuestion[] = [
  { id: 'self_directed_research', text: 'I prefer to research and make my own investment decisions rather than rely on financial advisors', category: 'decision_style' },
  { id: 'high_risk_tolerance', text: 'I am comfortable with investments that may lose significant value in exchange for higher potential returns', category: 'risk_tolerance' },
  { id: 'long_term_horizon', text: 'I prefer to invest for the long term (10+ years) rather than seeking quick gains', category: 'time_horizon' },
  { id: 'alternative_investments', text: 'I am interested in alternative investments like private equity, real estate, or collectibles', category: 'investment_type' },
  { id: 'cryptocurrency_interest', text: 'I am interested in investing in cryptocurrencies and digital assets', category: 'investment_type' },
  { id: 'advisor_reliance', text: 'I prefer to delegate investment decisions to professional advisors rather than manage myself', category: 'decision_style' },
  { id: 'conservative_approach', text: 'I prioritize preserving my capital over achieving high returns', category: 'risk_tolerance' },
  { id: 'esg_importance', text: 'Environmental, social, and governance (ESG) factors are important in my investment decisions', category: 'values' },
  { id: 'liquidity_preference', text: 'I need to be able to access my investments quickly if necessary', category: 'liquidity' },
  { id: 'peer_collaboration', text: 'I prefer to collaborate with other investors and learn from their experiences', category: 'decision_style' },
  { id: 'property_focus', text: 'Real estate and property investments are a major focus of my investment strategy', category: 'investment_type' },
  { id: 'retirement_planning', text: 'My primary investment goal is building wealth for retirement', category: 'objectives' }
];

export default function InvestorPreferences() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();
  const [personaResult, setPersonaResult] = useState<{ persona: typeof investorPersonas[0], score: number } | null>(null);
  
  // Questionnaire state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<QuestionnaireAnswer[]>([]);
  const [questionnaireComplete, setQuestionnaireComplete] = useState(false);
  const [questionnairePersonaResult, setQuestionnairePersonaResult] = useState<{ persona: typeof investorPersonas[0], score: number } | null>(null);

  // Convert questionnaire answers to form data for persona classification
  const convertQuestionnaireToFormData = (answers: QuestionnaireAnswer[]): PreferencesFormData => {
    const answerMap = answers.reduce((acc, answer) => {
      acc[answer.questionId] = answer.response;
      return acc;
    }, {} as Record<string, string>);

    // Map questionnaire answers to form fields
    let investorObjective: 'wealth_building' | 'wealth_preservation' | 'hybrid' = 'hybrid';
    let riskProfile: 'conservative' | 'cautious' | 'balanced' | 'growth' | 'aggressive' = 'balanced';
    let managementStyle: 'minimal' | 'moderate' | 'high' = 'moderate';
    let liquidityPreference: 'prefer_liquid' | 'mixed_acceptable' | 'comfortable_illiquid' = 'mixed_acceptable';
    let decisionMakingStyle: 'rely_advisors' | 'independent_research' | 'collaborate_peers' = 'independent_research';
    let investmentHorizon: 'short_term' | 'medium_term' | 'long_term' = 'medium_term';
    let esgImportance: 'not_important' | 'somewhat_important' | 'very_important' = 'somewhat_important';
    let activeInvestmentInterests: string[] = [];

    // Decision making style
    if (answerMap.self_directed_research === 'agree') {
      decisionMakingStyle = 'independent_research';
      managementStyle = 'high';
    } else if (answerMap.advisor_reliance === 'agree') {
      decisionMakingStyle = 'rely_advisors';
      managementStyle = 'minimal';
    } else if (answerMap.peer_collaboration === 'agree') {
      decisionMakingStyle = 'collaborate_peers';
    }

    // Risk tolerance
    if (answerMap.high_risk_tolerance === 'agree') {
      riskProfile = answerMap.cryptocurrency_interest === 'agree' ? 'aggressive' : 'growth';
    } else if (answerMap.conservative_approach === 'agree') {
      riskProfile = 'conservative';
    } else {
      riskProfile = 'balanced';
    }

    // Investment objective
    if (answerMap.retirement_planning === 'agree') {
      investorObjective = answerMap.conservative_approach === 'agree' ? 'wealth_preservation' : 'hybrid';
    } else if (answerMap.conservative_approach === 'agree') {
      investorObjective = 'wealth_preservation';
    } else if (answerMap.high_risk_tolerance === 'agree') {
      investorObjective = 'wealth_building';
    }

    // Time horizon
    if (answerMap.long_term_horizon === 'agree') {
      investmentHorizon = 'long_term';
    }

    // Liquidity
    if (answerMap.liquidity_preference === 'agree') {
      liquidityPreference = 'prefer_liquid';
    } else if (answerMap.alternative_investments === 'agree' || answerMap.property_focus === 'agree') {
      liquidityPreference = 'comfortable_illiquid';
    }

    // ESG
    if (answerMap.esg_importance === 'agree') {
      esgImportance = 'very_important';
    } else if (answerMap.esg_importance === 'disagree') {
      esgImportance = 'not_important';
    }

    // Investment interests
    if (answerMap.cryptocurrency_interest === 'agree') {
      activeInvestmentInterests.push('Cryptocurrency');
    }
    if (answerMap.alternative_investments === 'agree') {
      activeInvestmentInterests.push('Private Equity', 'Alternative Assets');
    }
    if (answerMap.property_focus === 'agree') {
      activeInvestmentInterests.push('Real Estate Investment');
    }
    if (answerMap.retirement_planning === 'agree') {
      activeInvestmentInterests.push('Pension Schemes');
    }

    return {
      investorObjective,
      riskProfile,
      riskCapacity: riskProfile === 'aggressive' ? 9 : riskProfile === 'growth' ? 7 : riskProfile === 'balanced' ? 5 : 3,
      ticketSizeMin: 1000,
      ticketSizeMax: 50000,
      activeInvestmentInterests,
      learningCuriosityAreas: [],
      geographicPreferences: ['United Kingdom'],
      managementStyle,
      liquidityPreference,
      decisionMakingStyle,
      investmentHorizon,
      esgImportance,
    };
  };

  // Handle questionnaire answer
  const handleQuestionnaireAnswer = (response: 'agree' | 'neutral' | 'disagree') => {
    const currentQuestion = questionnaireQuestions[currentQuestionIndex];
    const newAnswer: QuestionnaireAnswer = {
      questionId: currentQuestion.id,
      response
    };

    const updatedAnswers = [...questionnaireAnswers.filter(a => a.questionId !== currentQuestion.id), newAnswer];
    setQuestionnaireAnswers(updatedAnswers);

    // Move to next question or complete
    if (currentQuestionIndex < questionnaireQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Complete questionnaire
      setQuestionnaireComplete(true);
      
      // Convert answers to form data and classify persona
      const formData = convertQuestionnaireToFormData(updatedAnswers);
      const personaClassification = classifyInvestorPersona(formData);
      setQuestionnairePersonaResult(personaClassification);

      console.log('Questionnaire completed:', {
        answers: updatedAnswers,
        formData,
        persona: personaClassification.persona.name,
        score: `${personaClassification.score.toFixed(1)}%`
      });

      toast({
        title: "Profile Complete!",
        description: `You've been identified as "${personaClassification.persona.name}" with ${personaClassification.score.toFixed(1)}% confidence.`,
      });
    }
  };

  // Reset questionnaire
  const resetQuestionnaire = () => {
    setCurrentQuestionIndex(0);
    setQuestionnaireAnswers([]);
    setQuestionnaireComplete(false);
    setQuestionnairePersonaResult(null);
  };

  const form = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      riskCapacity: 5,
      ticketSizeMin: 1000,
      ticketSizeMax: 50000,
      activeInvestmentInterests: [],
      learningCuriosityAreas: [],
      geographicPreferences: [],
      managementStyle: 'moderate',
      liquidityPreference: 'mixed_acceptable',
      decisionMakingStyle: 'collaborate_peers',
      investmentHorizon: 'medium_term',
      esgImportance: 'somewhat_important',
    },
  });

  const onSubmit = async (data: PreferencesFormData) => {
    setIsSubmitting(true);
    try {
      console.log('Investor preferences submitted:', data);
      
      // Classify investor persona based on form responses
      const personaClassification = classifyInvestorPersona(data);
      setPersonaResult(personaClassification);
      
      console.log('Investor persona classified:', {
        persona: personaClassification.persona.name,
        score: `${personaClassification.score.toFixed(1)}%`,
        description: personaClassification.persona.description
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Preferences Saved & Persona Identified!",
        description: `You've been classified as "${personaClassification.persona.name}" with ${personaClassification.score.toFixed(1)}% match confidence.`,
      });
      
      // Navigate back to demo agenda after a brief delay
      setTimeout(() => {
        setLocation('/demo/agenda');
      }, 3000);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-[var(--accent)] to-[var(--warning)] rounded-full blur-lg animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-40 left-20 w-20 h-20 bg-gradient-to-br from-[var(--secondary)] to-[var(--primary)] rounded-full blur-lg animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 right-10 w-28 h-28 bg-gradient-to-br from-[var(--warning)] to-[var(--accent)] rounded-full blur-xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
      </div>

      <Header />
      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <div className="relative overflow-hidden py-20">
          {/* Dynamic Background Mesh */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] via-transparent to-[var(--secondary)] opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-tl from-[var(--accent)] via-transparent to-[var(--warning)] opacity-5"></div>
          </div>
          
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Floating Icon with Glow Effect */}
            <div className="flex items-center justify-center mb-8 relative">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-full p-6 group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-12 w-12" />
                </div>
                <div className="absolute -top-2 -right-2 animate-bounce">
                  <Sparkles className="h-6 w-6 text-[var(--accent)] fill-current" />
                </div>
              </div>
            </div>

            {/* Revolutionary Typography */}
            <h1 className="relative mb-8">
              <span className="block text-2xl md:text-4xl font-light text-[var(--muted-foreground)] tracking-wider uppercase mb-2">Investment</span>
              <span className="block text-5xl md:text-8xl font-black bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] bg-clip-text text-transparent leading-none tracking-tight">
                PREFERENCES
              </span>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent"></div>
            </h1>

            <p className="text-xl md:text-2xl text-[var(--muted-foreground)] max-w-4xl mx-auto mb-12 leading-relaxed font-light">
              Configure your investment profile through 
              <span className="text-[var(--primary)] font-semibold"> detailed preferences</span> or 
              <span className="text-[var(--secondary)] font-semibold"> discover your investment personality</span>
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative">        

        <Tabs defaultValue="detailed" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="detailed" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Detailed Preferences
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Discover Your Investment Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="detailed">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Investment Objectives */}
            <Card className="border-2 border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] backdrop-blur-sm shadow-2xl hover:shadow-[var(--primary)]/10 transition-all duration-500 hover:scale-[1.01]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Target className="h-6 w-6 text-[var(--primary)]" />
                  Investment Objectives
                </CardTitle>
                <CardDescription>
                  What is your primary investment objective?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="investorObjective"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-1 md:grid-cols-3 gap-4"
                        >
                          {investorObjectives.map((objective) => {
                            const Icon = objective.icon;
                            return (
                              <FormItem key={objective.id}>
                                <FormLabel className="[&:has([data-state=checked])>div]:border-blue-500 [&:has([data-state=checked])>div]:bg-blue-50 dark:[&:has([data-state=checked])>div]:bg-blue-950/50">
                                  <FormControl>
                                    <RadioGroupItem value={objective.id} className="sr-only" />
                                  </FormControl>
                                  <div className="cursor-pointer rounded-xl border-2 border-[var(--border)] p-6 hover:border-[var(--primary)] transition-all hover:bg-[var(--accent)]/5">
                                    <div className="space-y-3">
                                      <Icon className={`h-8 w-8 ${objective.color}`} />
                                      <h3 className="font-semibold text-lg">{objective.title}</h3>
                                      <p className="text-sm text-[var(--muted-foreground)]">{objective.description}</p>
                                    </div>
                                  </div>
                                </FormLabel>
                              </FormItem>
                            );
                          })}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Risk Profile */}
            <Card className="border-2 border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] backdrop-blur-sm shadow-2xl hover:shadow-[var(--primary)]/10 transition-all duration-500 hover:scale-[1.01]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <AlertTriangle className="h-6 w-6 text-[var(--warning)]" />
                  Risk Profile
                </CardTitle>
                <CardDescription>
                  Select the risk profile that best matches your comfort level and investment approach.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="riskProfile"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="space-y-3"
                        >
                          {riskProfiles.map((profile) => (
                            <FormItem key={profile.id}>
                              <FormLabel className="[&:has([data-state=checked])>div]:border-amber-500 [&:has([data-state=checked])>div]:bg-amber-50 dark:[&:has([data-state=checked])>div]:bg-amber-950/50">
                                <FormControl>
                                  <RadioGroupItem value={profile.id} className="sr-only" />
                                </FormControl>
                                <div className="cursor-pointer rounded-lg border-2 border-[var(--border)] p-4 hover:border-[var(--warning)] transition-all hover:bg-[var(--warning)]/5">
                                  <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                      <h3 className="font-semibold">{profile.title}</h3>
                                      <p className="text-sm text-[var(--muted-foreground)]">{profile.description}</p>
                                    </div>
                                    <Badge variant="outline" className="ml-4">{profile.range}</Badge>
                                  </div>
                                </div>
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                {/* Risk Capacity Slider */}
                <FormField
                  control={form.control}
                  name="riskCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Risk Capacity (1-10)</FormLabel>
                      <FormDescription>
                        How much financial risk can you afford to take? (1 = Very Low, 10 = Very High)
                      </FormDescription>
                      <FormControl>
                        <div className="space-y-4">
                          <Slider
                            min={1}
                            max={10}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm text-slate-500">
                            <span>Very Low Risk</span>
                            <span className="font-semibold text-lg">{field.value}</span>
                            <span>Very High Risk</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Management Style */}
            <Card className="border-2 border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] backdrop-blur-sm shadow-2xl hover:shadow-[var(--primary)]/10 transition-all duration-500 hover:scale-[1.01]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Settings className="h-6 w-6 text-[var(--primary)]" />
                  Investment Management Style
                </CardTitle>
                <CardDescription>
                  How much time do you want to spend actively managing your investments?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="managementStyle"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-1 md:grid-cols-3 gap-4"
                        >
                          {managementStyles.map((style) => {
                            const Icon = style.icon;
                            return (
                              <FormItem key={style.id}>
                                <FormLabel className="[&:has([data-state=checked])>div]:border-[var(--primary)] [&:has([data-state=checked])>div]:bg-[var(--primary)]/5">
                                  <FormControl>
                                    <RadioGroupItem value={style.id} className="sr-only" />
                                  </FormControl>
                                  <div className="cursor-pointer rounded-xl border-2 border-[var(--border)] p-6 hover:border-[var(--primary)] transition-all hover:bg-[var(--accent)]/5">
                                    <div className="space-y-3 text-center">
                                      <Icon className="h-8 w-8 text-[var(--primary)] mx-auto" />
                                      <h3 className="font-semibold text-lg">{style.title}</h3>
                                      <p className="text-sm text-[var(--muted-foreground)]">{style.description}</p>
                                    </div>
                                  </div>
                                </FormLabel>
                              </FormItem>
                            );
                          })}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Liquidity Preference */}
            <Card className="border-2 border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] backdrop-blur-sm shadow-2xl hover:shadow-[var(--primary)]/10 transition-all duration-500 hover:scale-[1.01]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Droplets className="h-6 w-6 text-[var(--secondary)]" />
                  Liquidity Preference
                </CardTitle>
                <CardDescription>
                  How comfortable are you with locking up capital in long-term or illiquid assets?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="liquidityPreference"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-1 md:grid-cols-3 gap-4"
                        >
                          {liquidityPreferences.map((preference) => {
                            const Icon = preference.icon;
                            return (
                              <FormItem key={preference.id}>
                                <FormLabel className="[&:has([data-state=checked])>div]:border-[var(--secondary)] [&:has([data-state=checked])>div]:bg-[var(--secondary)]/5">
                                  <FormControl>
                                    <RadioGroupItem value={preference.id} className="sr-only" />
                                  </FormControl>
                                  <div className="cursor-pointer rounded-xl border-2 border-[var(--border)] p-6 hover:border-[var(--secondary)] transition-all hover:bg-[var(--accent)]/5">
                                    <div className="space-y-3 text-center">
                                      <Icon className="h-8 w-8 text-[var(--secondary)] mx-auto" />
                                      <h3 className="font-semibold text-lg">{preference.title}</h3>
                                      <p className="text-sm text-[var(--muted-foreground)]">{preference.description}</p>
                                    </div>
                                  </div>
                                </FormLabel>
                              </FormItem>
                            );
                          })}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Decision Making Style */}
            <Card className="border-2 border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] backdrop-blur-sm shadow-2xl hover:shadow-[var(--primary)]/10 transition-all duration-500 hover:scale-[1.01]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Brain className="h-6 w-6 text-[var(--accent)]" />
                  Decision Making Style
                </CardTitle>
                <CardDescription>
                  How do you prefer to make investment decisions?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="decisionMakingStyle"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-1 md:grid-cols-3 gap-4"
                        >
                          {decisionMakingStyles.map((style) => {
                            const Icon = style.icon;
                            return (
                              <FormItem key={style.id}>
                                <FormLabel className="[&:has([data-state=checked])>div]:border-[var(--accent)] [&:has([data-state=checked])>div]:bg-[var(--accent)]/5">
                                  <FormControl>
                                    <RadioGroupItem value={style.id} className="sr-only" />
                                  </FormControl>
                                  <div className="cursor-pointer rounded-xl border-2 border-[var(--border)] p-6 hover:border-[var(--accent)] transition-all hover:bg-[var(--accent)]/5">
                                    <div className="space-y-3 text-center">
                                      <Icon className="h-8 w-8 text-[var(--accent)] mx-auto" />
                                      <h3 className="font-semibold text-lg">{style.title}</h3>
                                      <p className="text-sm text-[var(--muted-foreground)]">{style.description}</p>
                                    </div>
                                  </div>
                                </FormLabel>
                              </FormItem>
                            );
                          })}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Investment Time Horizon */}
            <Card className="border-2 border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] backdrop-blur-sm shadow-2xl hover:shadow-[var(--primary)]/10 transition-all duration-500 hover:scale-[1.01]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Clock className="h-6 w-6 text-[var(--primary)]" />
                  Investment Time Horizon
                </CardTitle>
                <CardDescription>
                  What is your primary investment time horizon?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="investmentHorizon"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-1 md:grid-cols-3 gap-4"
                        >
                          {timeHorizons.map((horizon) => {
                            const Icon = horizon.icon;
                            return (
                              <FormItem key={horizon.id}>
                                <FormLabel className="[&:has([data-state=checked])>div]:border-[var(--primary)] [&:has([data-state=checked])>div]:bg-[var(--primary)]/5">
                                  <FormControl>
                                    <RadioGroupItem value={horizon.id} className="sr-only" />
                                  </FormControl>
                                  <div className="cursor-pointer rounded-xl border-2 border-[var(--border)] p-6 hover:border-[var(--primary)] transition-all hover:bg-[var(--accent)]/5">
                                    <div className="space-y-3 text-center">
                                      <Icon className="h-8 w-8 text-[var(--primary)] mx-auto" />
                                      <h3 className="font-semibold text-lg">{horizon.title}</h3>
                                      <p className="text-sm text-[var(--muted-foreground)]">{horizon.description}</p>
                                    </div>
                                  </div>
                                </FormLabel>
                              </FormItem>
                            );
                          })}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* ESG Importance */}
            <Card className="border-2 border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] backdrop-blur-sm shadow-2xl hover:shadow-[var(--primary)]/10 transition-all duration-500 hover:scale-[1.01]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Globe className="h-6 w-6 text-[var(--secondary)]" />
                  ESG & Impact Considerations
                </CardTitle>
                <CardDescription>
                  How important are ethical, environmental, or impact considerations in your investments?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="esgImportance"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-1 md:grid-cols-3 gap-4"
                        >
                          {esgImportanceOptions.map((option) => {
                            const Icon = option.icon;
                            return (
                              <FormItem key={option.id}>
                                <FormLabel className="[&:has([data-state=checked])>div]:border-[var(--secondary)] [&:has([data-state=checked])>div]:bg-[var(--secondary)]/5">
                                  <FormControl>
                                    <RadioGroupItem value={option.id} className="sr-only" />
                                  </FormControl>
                                  <div className="cursor-pointer rounded-xl border-2 border-[var(--border)] p-6 hover:border-[var(--secondary)] transition-all hover:bg-[var(--accent)]/5">
                                    <div className="space-y-3 text-center">
                                      <Icon className="h-8 w-8 text-[var(--secondary)] mx-auto" />
                                      <h3 className="font-semibold text-lg">{option.title}</h3>
                                      <p className="text-sm text-[var(--muted-foreground)]">{option.description}</p>
                                    </div>
                                  </div>
                                </FormLabel>
                              </FormItem>
                            );
                          })}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Investment Interests */}
            <Card className="border-2 border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] backdrop-blur-sm shadow-2xl hover:shadow-[var(--primary)]/10 transition-all duration-500 hover:scale-[1.01]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <DollarSign className="h-6 w-6 text-green-600" />
                  Active Investment Interests
                </CardTitle>
                <CardDescription>
                  Which investment areas are you actively interested in or currently investing in?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="activeInvestmentInterests"
                  render={() => (
                    <FormItem>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {investmentInterests.map((interest) => (
                          <FormField
                            key={interest}
                            control={form.control}
                            name="activeInvestmentInterests"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={interest}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(interest)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, interest])
                                          : field.onChange(field.value?.filter((value) => value !== interest))
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal cursor-pointer">
                                    {interest}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Learning & Curiosity Areas */}
            <Card className="border-2 border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] backdrop-blur-sm shadow-2xl hover:shadow-[var(--primary)]/10 transition-all duration-500 hover:scale-[1.01]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                  Learning & Curiosity Areas
                </CardTitle>
                <CardDescription>
                  Which investment topics would you like to learn more about?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="learningCuriosityAreas"
                  render={() => (
                    <FormItem>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {learningAreas.map((area) => (
                          <FormField
                            key={area}
                            control={form.control}
                            name="learningCuriosityAreas"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={area}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(area)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, area])
                                          : field.onChange(field.value?.filter((value) => value !== area))
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal cursor-pointer">
                                    {area}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Geographic Preferences */}
            <Card className="border-2 border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] backdrop-blur-sm shadow-2xl hover:shadow-[var(--primary)]/10 transition-all duration-500 hover:scale-[1.01]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Globe className="h-6 w-6 text-indigo-600" />
                  Geographic Preferences
                </CardTitle>
                <CardDescription>
                  Which geographic regions are you interested in for investments?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="geographicPreferences"
                  render={() => (
                    <FormItem>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {geographicRegions.map((region) => (
                          <FormField
                            key={region}
                            control={form.control}
                            name="geographicPreferences"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={region}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(region)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, region])
                                          : field.onChange(field.value?.filter((value) => value !== region))
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal cursor-pointer">
                                    {region}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <Button 
                type="submit" 
                size="lg" 
                disabled={isSubmitting}
                className="px-12 py-6 text-lg bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] hover:from-[var(--primary)]/90 hover:to-[var(--secondary)]/90"
                data-testid="button-submit-preferences"
              >
                {isSubmitting ? (
                  <>
                    <Lightbulb className="mr-2 h-4 w-4 animate-spin" />
                    Saving Preferences...
                  </>
                ) : (
                  <>
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Save Preferences & Continue
                  </>
                )}
              </Button>
            </div>

            {/* Persona Result Display */}
            {personaResult && (
              <Card className="border-2 border-[var(--primary)] bg-gradient-to-br from-[var(--primary)]/5 to-[var(--secondary)]/5 backdrop-blur-sm shadow-2xl mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl text-[var(--primary)]">
                    <User className="h-6 w-6" />
                    Your Investor Persona
                  </CardTitle>
                  <CardDescription>
                    Based on your preferences, we've identified your investor profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-[var(--primary)]">
                        {personaResult.persona.name}
                      </h3>
                      <Badge variant="secondary" className="px-3 py-1">
                        {personaResult.score.toFixed(1)}% match
                      </Badge>
                    </div>
                    <p className="text-[var(--muted-foreground)] leading-relaxed">
                      {personaResult.persona.description}
                    </p>
                    <div className="bg-[var(--accent)]/10 rounded-lg p-4 border border-[var(--accent)]/20">
                      <p className="text-sm text-[var(--muted-foreground)]">
                        🎯 This classification helps us tailor investment recommendations and educational content specifically for your profile.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="profile">
            <div className="space-y-8">
              {!questionnaireComplete ? (
                /* Sequential Questionnaire */
                <Card className="border-2 border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] backdrop-blur-sm shadow-2xl transition-all duration-500">
                  <CardHeader className="text-center">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline" className="text-sm">
                        Question {currentQuestionIndex + 1} of {questionnaireQuestions.length}
                      </Badge>
                      <div className="flex gap-1">
                        {questionnaireQuestions.map((_, index) => (
                          <div
                            key={index}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                              index <= currentQuestionIndex 
                                ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] shadow-sm' 
                                : 'bg-[var(--border)]'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <CardTitle className="text-2xl text-center leading-relaxed max-w-4xl mx-auto">
                      {questionnaireQuestions[currentQuestionIndex]?.text}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-8">
                    <div className="flex justify-center gap-4 max-w-2xl mx-auto">
                      <Button
                        onClick={() => handleQuestionnaireAnswer('agree')}
                        size="lg"
                        className="flex-1 py-6 text-lg bg-gradient-to-br from-[var(--secondary)] to-emerald-600 hover:from-[var(--secondary)]/90 hover:to-emerald-600/90 text-white border-2 border-[var(--secondary)] hover:border-[var(--secondary)]/90 shadow-lg hover:shadow-[var(--secondary)]/20 transition-all duration-300"
                        data-testid="button-agree"
                      >
                        <ThumbsUp className="mr-2 h-5 w-5" />
                        Agree
                      </Button>
                      
                      <Button
                        onClick={() => handleQuestionnaireAnswer('neutral')}
                        size="lg"
                        variant="outline"
                        className="flex-1 py-6 text-lg border-2 border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--accent)]/10 bg-[var(--card)] backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300"
                        data-testid="button-neutral"
                      >
                        <Minus className="mr-2 h-5 w-5" />
                        Neutral
                      </Button>
                      
                      <Button
                        onClick={() => handleQuestionnaireAnswer('disagree')}
                        size="lg"
                        className="flex-1 py-6 text-lg bg-gradient-to-br from-red-500 to-red-600 hover:from-red-500/90 hover:to-red-600/90 text-white border-2 border-red-500 hover:border-red-500/90 shadow-lg hover:shadow-red-500/20 transition-all duration-300"
                        data-testid="button-disagree"
                      >
                        <ThumbsDown className="mr-2 h-5 w-5" />
                        Disagree
                      </Button>
                    </div>
                    
                    {/* Progress Indicator */}
                    <div className="mt-8">
                      <div className="w-full bg-[var(--border)] rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${((currentQuestionIndex + 1) / questionnaireQuestions.length) * 100}%` 
                          }}
                        />
                      </div>
                      <p className="text-center text-sm text-[var(--muted-foreground)] mt-2">
                        {Math.round(((currentQuestionIndex + 1) / questionnaireQuestions.length) * 100)}% Complete
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                /* Results Display */
                <div className="space-y-6">
                  {/* Persona Result */}
                  {questionnairePersonaResult && (
                    <Card className="border-2 border-[var(--primary)] bg-gradient-to-br from-[var(--primary)]/5 to-[var(--secondary)]/5 backdrop-blur-sm shadow-2xl">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl text-[var(--primary)]">
                          <User className="h-6 w-6" />
                          Your Investment Persona
                        </CardTitle>
                        <CardDescription>
                          Based on your questionnaire responses, we've identified your investor profile
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-[var(--primary)]">
                              {questionnairePersonaResult.persona.name}
                            </h3>
                            <Badge variant="secondary" className="px-3 py-1">
                              {questionnairePersonaResult.score.toFixed(1)}% match
                            </Badge>
                          </div>
                          <p className="text-[var(--muted-foreground)] leading-relaxed">
                            {questionnairePersonaResult.persona.description}
                          </p>
                          <div className="bg-[var(--accent)]/10 rounded-lg p-4 border border-[var(--accent)]/20">
                            <p className="text-sm text-[var(--muted-foreground)]">
                              🎯 This classification helps us tailor investment recommendations and educational content specifically for your profile.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={resetQuestionnaire}
                      variant="outline"
                      size="lg"
                      className="px-8 py-4"
                      data-testid="button-retake-questionnaire"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Retake Questionnaire
                    </Button>
                    <Button
                      onClick={() => setLocation('/demo/agenda')}
                      size="lg"
                      className="px-8 py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] hover:from-[var(--primary)]/90 hover:to-[var(--secondary)]/90"
                      data-testid="button-continue-demo"
                    >
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Continue to Demo
                    </Button>
                  </div>
                </div>
              )}

              {/* Investor Persona Overview Cards */}
              <Card className="border-2 border-[var(--border)] bg-[var(--card)] backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl text-[var(--primary)]">
                    <Users className="h-5 w-5" />
                    12 Investor Personas
                  </CardTitle>
                  <CardDescription>
                    Discover which investor profile matches your preferences through our questionnaire
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {investorPersonas.map((persona) => (
                      <div
                        key={persona.id}
                        className="cursor-pointer rounded-xl border border-[var(--border)] p-4 hover:border-[var(--primary)] transition-all hover:bg-[var(--accent)]/5 hover:shadow-lg hover:scale-[1.02] duration-300"
                        data-testid={`persona-card-${persona.id}`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]"></div>
                            <h3 className="font-semibold text-sm text-[var(--foreground)]">{persona.name}</h3>
                          </div>
                          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed line-clamp-3">
                            {persona.description}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                            <Target className="h-3 w-3" />
                            <span className="capitalize">
                              {persona.criteria.investorObjective.join(', ')} • {persona.criteria.riskProfile.join(', ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}