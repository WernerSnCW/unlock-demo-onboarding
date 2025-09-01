import { useState, useEffect } from 'react';
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
import { TrendingUp, Shield, Target, Lightbulb, BookOpen, DollarSign, AlertTriangle, Users, Globe, User, Heart, Clock, HelpCircle, Sparkles, Settings, Droplets, Brain, ThumbsUp, ThumbsDown, Minus, RotateCcw, ArrowRight, ArrowLeft } from 'lucide-react';
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

// New scoring matrix from CSV data
const scoringMatrix: Record<string, Record<string, Record<string, number>>> = {
  'Q1_Objective': {
    'Wealth Preservation': { 'Legacy Builder': 2, 'Old Fashioned': 2, 'Saver': 2, 'Retirement Planner': 1 },
    'Balanced / Hybrid': { 'Retirement Planner': 2, 'Property Lover': 2, 'City Professional': 2, 'Mr Alternative': 2, 'Inheritance Receiver': 1, 'Novice Self-Directed': 1 },
    'Wealth Building': { 'Wealth Accumulator': 2, 'Crypto Bro': 2, 'Angel Networker': 2, 'City Professional': 1 }
  },
  'Q2_Risk': {
    'Conservative': { 'Legacy Builder': 2, 'Old Fashioned': 2, 'Saver': 2 },
    'Cautious': { 'Retirement Planner': 2, 'Inheritance Receiver': 2, 'Novice Self-Directed': 1 },
    'Balanced': { 'Property Lover': 2, 'City Professional': 2, 'Retirement Planner': 1 },
    'Growth': { 'Wealth Accumulator': 2, 'Angel Networker': 2, 'Mr Alternative': 2, 'Crypto Bro': 1 },
    'Aggressive': { 'Crypto Bro': 2 }
  },
  'Q3_TimeInvolvement': {
    'Minimal': { 'City Professional': 2, 'Legacy Builder': 2, 'Saver': 2, 'Old Fashioned': 2 },
    'Moderate': { 'Retirement Planner': 2, 'Property Lover': 2, 'Angel Networker': 2, 'Inheritance Receiver': 2 },
    'High': { 'Wealth Accumulator': 2, 'Crypto Bro': 2, 'Novice Self-Directed': 2 }
  },
  'Q4_Style': {
    'Independent / self-research': { 'Wealth Accumulator': 2, 'Crypto Bro': 2, 'Novice Self-Directed': 2, 'Mr Alternative': 1 },
    'With professional advisors': { 'Legacy Builder': 2, 'City Professional': 2, 'Old Fashioned': 2, 'Retirement Planner': 2, 'Property Lover': 2, 'Inheritance Receiver': 1 },
    'Community / syndicate': { 'Angel Networker': 2 }
  },
  'Q5_Liquidity': {
    'Prefer liquid': { 'Saver': 2, 'Old Fashioned': 2, 'Legacy Builder': 2, 'Novice Self-Directed': 2, 'Inheritance Receiver': 2 },
    'Mixed OK': { 'Retirement Planner': 2, 'Wealth Accumulator': 2, 'Angel Networker': 2, 'City Professional': 2, 'Crypto Bro': 2 },
    'Comfortable with illiquid': { 'Property Lover': 2, 'Mr Alternative': 2 }
  },
  'Q6_PortfolioType': {
    'Cash/Bonds/Regulated': { 'Saver': 2, 'Old Fashioned': 2 },
    'Diversified Equities/Funds': { 'Retirement Planner': 2, 'City Professional': 2 },
    'Property-heavy': { 'Property Lover': 2 },
    'Alternatives-heavy': { 'Mr Alternative': 2 },
    'Crypto-heavy': { 'Crypto Bro': 2 },
    'Beginner mix': { 'Novice Self-Directed': 2, 'Inheritance Receiver': 2 }
  },
  'Q7_Interests': {
    'Public': { 'Old Fashioned': 2, 'Saver': 2, 'Retirement Planner': 2, 'City Professional': 1 },
    'Property': { 'Property Lover': 2, 'Retirement Planner': 1 },
    'Crypto': { 'Crypto Bro': 2, 'Wealth Accumulator': 1 },
    'Collectibles': { 'Mr Alternative': 2, 'Legacy Builder': 2 },
    'VC_Angel_EIS': { 'Angel Networker': 2, 'Wealth Accumulator': 2, 'City Professional': 2, 'Retirement Planner': 2 }
  },
  'Q8_Challenge': {
    'Lack of time': { 'City Professional': 2 },
    'Lack of knowledge': { 'Novice Self-Directed': 2, 'Inheritance Receiver': 2 },
    'Scam risk': { 'Crypto Bro': 2 },
    'Tax optimisation': { 'Retirement Planner': 2, 'Property Lover': 2 },
    'Estate/retirement planning': { 'Legacy Builder': 2, 'Retirement Planner': 2 }
  },
  'Q9_ReturnTarget': {
    '3–5%': { 'Old Fashioned': 2, 'Saver': 2 },
    '5–7%': { 'Retirement Planner': 2 },
    '8–12%': { 'Property Lover': 2, 'Mr Alternative': 2, 'Angel Networker': 2 },
    '15%+': { 'Wealth Accumulator': 2, 'Crypto Bro': 2 }
  },
  'Q10_ESG': {
    'Very important': { 'Legacy Builder': 2, 'Saver': 2, 'Retirement Planner': 2 },
    'Somewhat important': { 'Angel Networker': 1, 'City Professional': 1, 'Old Fashioned': 1 },
    'Not important': { 'Crypto Bro': 2, 'Mr Alternative': 2, 'Wealth Accumulator': 1 }
  }
};

// Map persona names from CSV to persona IDs
const personaNameMapping: Record<string, string> = {
  'Legacy Builder': 'legacy_builder',
  'Old Fashioned': 'old_fashioned',
  'Saver': 'the_saver',
  'Retirement Planner': 'retirement_planner',
  'Property Lover': 'property_lover',
  'City Professional': 'city_professional',
  'Mr Alternative': 'mr_alternative',
  'Wealth Accumulator': 'wealth_accumulator',
  'Crypto Bro': 'crypto_bro',
  'Angel Networker': 'angel_networker',
  'Inheritance Receiver': 'inheritance_receiver',
  'Novice Self-Directed': 'novice_self_directed'
};

// Map questionnaire answers to CSV option values
function mapAnswersToCsvFormat(answers: QuestionnaireAnswer[]): Record<string, string | string[]> {
  const answerMap = answers.reduce((acc, answer) => {
    acc[answer.questionId] = answer.response;
    return acc;
  }, {} as Record<string, string | string[]>);

  const csvAnswers: Record<string, string | string[]> = {};

  // Q1: Investment Objective
  const objective = answerMap.investment_objective as string;
  if (objective === 'wealth_preservation') csvAnswers.Q1_Objective = 'Wealth Preservation';
  else if (objective === 'balanced_hybrid') csvAnswers.Q1_Objective = 'Balanced / Hybrid';
  else if (objective === 'wealth_building') csvAnswers.Q1_Objective = 'Wealth Building';

  // Q2: Risk Profile
  const risk = answerMap.risk_profile as string;
  if (risk) csvAnswers.Q2_Risk = risk.charAt(0).toUpperCase() + risk.slice(1);

  // Q3: Time Involvement
  const time = answerMap.time_commitment as string;
  if (time === 'minimal') csvAnswers.Q3_TimeInvolvement = 'Minimal';
  else if (time === 'moderate') csvAnswers.Q3_TimeInvolvement = 'Moderate';
  else if (time === 'high') csvAnswers.Q3_TimeInvolvement = 'High';

  // Q4: Decision Making Style
  const style = answerMap.decision_making as string;
  if (style === 'independent') csvAnswers.Q4_Style = 'Independent / self-research';
  else if (style === 'advisors') csvAnswers.Q4_Style = 'With professional advisors';
  else if (style === 'community') csvAnswers.Q4_Style = 'Community / syndicate';

  // Q5: Liquidity
  const liquidity = answerMap.liquidity_importance as string;
  if (liquidity === 'prefer_liquid') csvAnswers.Q5_Liquidity = 'Prefer liquid';
  else if (liquidity === 'mixed') csvAnswers.Q5_Liquidity = 'Mixed OK';
  else if (liquidity === 'comfortable_illiquid') csvAnswers.Q5_Liquidity = 'Comfortable with illiquid';

  // Q6: Portfolio Type
  const portfolio = answerMap.current_portfolio as string;
  if (portfolio === 'cash_bonds') csvAnswers.Q6_PortfolioType = 'Cash/Bonds/Regulated';
  else if (portfolio === 'diversified_equities') csvAnswers.Q6_PortfolioType = 'Diversified Equities/Funds';
  else if (portfolio === 'property_heavy') csvAnswers.Q6_PortfolioType = 'Property-heavy';
  else if (portfolio === 'alternatives_heavy') csvAnswers.Q6_PortfolioType = 'Alternatives-heavy';
  else if (portfolio === 'crypto_heavy') csvAnswers.Q6_PortfolioType = 'Crypto-heavy';
  else if (portfolio === 'beginner_mix') csvAnswers.Q6_PortfolioType = 'Beginner mix';

  // Q7: Asset Interests (multi-select)
  const interests = answerMap.asset_interests as string[];
  if (Array.isArray(interests)) {
    csvAnswers.Q7_Interests = [];
    if (interests.includes('public_equities')) (csvAnswers.Q7_Interests as string[]).push('Public');
    if (interests.includes('property_real_estate')) (csvAnswers.Q7_Interests as string[]).push('Property');
    if (interests.includes('crypto_digital')) (csvAnswers.Q7_Interests as string[]).push('Crypto');
    if (interests.includes('collectibles')) (csvAnswers.Q7_Interests as string[]).push('Collectibles');
    if (interests.includes('vc_angel_eis')) (csvAnswers.Q7_Interests as string[]).push('VC_Angel_EIS');
  }

  // Q8: Challenge
  const challenge = answerMap.biggest_challenge as string;
  if (challenge === 'lack_time') csvAnswers.Q8_Challenge = 'Lack of time';
  else if (challenge === 'lack_knowledge') csvAnswers.Q8_Challenge = 'Lack of knowledge';
  else if (challenge === 'risk_scams') csvAnswers.Q8_Challenge = 'Scam risk';
  else if (challenge === 'tax_optimisation') csvAnswers.Q8_Challenge = 'Tax optimisation';
  else if (challenge === 'estate_retirement') csvAnswers.Q8_Challenge = 'Estate/retirement planning';

  // Q9: Return Target
  const returnTarget = answerMap.annual_return_target as string;
  if (returnTarget === 'three_to_five') csvAnswers.Q9_ReturnTarget = '3–5%';
  else if (returnTarget === 'five_to_seven') csvAnswers.Q9_ReturnTarget = '5–7%';
  else if (returnTarget === 'eight_to_twelve') csvAnswers.Q9_ReturnTarget = '8–12%';
  else if (returnTarget === 'fifteen_plus') csvAnswers.Q9_ReturnTarget = '15%+';

  // Q10: ESG
  const esg = answerMap.esg_importance as string;
  if (esg === 'not_important') csvAnswers.Q10_ESG = 'Not important';
  else if (esg === 'somewhat_important') csvAnswers.Q10_ESG = 'Somewhat important';
  else if (esg === 'very_important') csvAnswers.Q10_ESG = 'Very important';

  return csvAnswers;
}

function classifyInvestorPersona(formData: PreferencesFormData): { persona: typeof investorPersonas[0], score: number } {
  // For backwards compatibility, convert form data to questionnaire answers
  const mockAnswers: QuestionnaireAnswer[] = [
    { questionId: 'investment_objective', response: formData.investorObjective },
    { questionId: 'risk_profile', response: formData.riskProfile },
    { questionId: 'time_commitment', response: formData.managementStyle },
    { questionId: 'decision_making', response: formData.decisionMakingStyle === 'rely_advisors' ? 'advisors' : formData.decisionMakingStyle === 'collaborate_peers' ? 'community' : 'independent' },
    { questionId: 'liquidity_importance', response: formData.liquidityPreference === 'mixed_acceptable' ? 'mixed' : formData.liquidityPreference },
    { questionId: 'current_portfolio', response: 'diversified_equities' }, // Default
    { questionId: 'asset_interests', response: ['public_equities'] }, // Default
    { questionId: 'biggest_challenge', response: 'lack_time' }, // Default
    { questionId: 'annual_return_target', response: 'eight_to_twelve' }, // Default
    { questionId: 'esg_importance', response: formData.esgImportance }
  ];

  return classifyInvestorPersonaFromAnswers(mockAnswers);
}

function classifyInvestorPersonaFromAnswers(answers: QuestionnaireAnswer[]): { persona: typeof investorPersonas[0], score: number, allMatches?: Array<{ persona: typeof investorPersonas[0], score: number }> } {
  const csvAnswers = mapAnswersToCsvFormat(answers);
  const personaScores: Record<string, number> = {};

  // Initialize all persona scores to 0
  Object.values(personaNameMapping).forEach(personaId => {
    personaScores[personaId] = 0;
  });

  // Calculate scores based on CSV matrix
  Object.entries(csvAnswers).forEach(([questionKey, userAnswer]) => {
    const questionScoring = scoringMatrix[questionKey];
    if (!questionScoring) return;

    if (questionKey === 'Q7_Interests' && Array.isArray(userAnswer)) {
      // Special handling for Q7 multi-select interests (cap at 2 points)
      const interestScores: Record<string, number> = {};
      userAnswer.forEach(interest => {
        const interestScoring = questionScoring[interest];
        if (interestScoring) {
          Object.entries(interestScoring).forEach(([personaName, weight]) => {
            const personaId = personaNameMapping[personaName];
            if (personaId) {
              interestScores[personaId] = (interestScores[personaId] || 0) + weight;
            }
          });
        }
      });
      // Cap at 2 points per persona for Q7
      Object.entries(interestScores).forEach(([personaId, score]) => {
        personaScores[personaId] += Math.min(score, 2);
      });
    } else if (typeof userAnswer === 'string') {
      // Regular single-select questions
      const answerScoring = questionScoring[userAnswer];
      if (answerScoring) {
        Object.entries(answerScoring).forEach(([personaName, weight]) => {
          const personaId = personaNameMapping[personaName];
          if (personaId) {
            personaScores[personaId] += weight;
          }
        });
      }
    }
  });

  // Convert scores to percentages and find all relevant matches
  const MAX_SCORE_PER_PERSONA = 20;
  const allMatches: Array<{ persona: typeof investorPersonas[0], score: number }> = [];

  Object.entries(personaScores).forEach(([personaId, score]) => {
    const persona = investorPersonas.find(p => p.id === personaId);
    if (persona && score > 0) {
      const percentage = Math.round((score / MAX_SCORE_PER_PERSONA) * 100);
      allMatches.push({ persona, score: percentage });
    }
  });

  // Sort by score descending
  allMatches.sort((a, b) => b.score - a.score);

  const bestMatch = allMatches.length > 0 
    ? allMatches[0]
    : { persona: investorPersonas[0], score: 0 };

  return { ...bestMatch, allMatches };
}

// Sequential questionnaire data structure
interface QuestionnaireQuestion {
  id: string;
  text: string;
  type: 'radio' | 'multiselect';
  options: { id: string; label: string; }[];
}

interface QuestionnaireAnswer {
  questionId: string;
  response: string | string[]; // Single value for radio, array for multiselect
}

const questionnaireQuestions: QuestionnaireQuestion[] = [
  {
    id: 'investment_objective',
    text: 'What is your main investment objective?',
    type: 'radio',
    options: [
      { id: 'wealth_preservation', label: 'Wealth Preservation' },
      { id: 'wealth_building', label: 'Wealth Building' },
      { id: 'balanced_hybrid', label: 'Balanced / Hybrid' }
    ]
  },
  {
    id: 'risk_profile',
    text: 'How would you describe your risk profile?',
    type: 'radio',
    options: [
      { id: 'conservative', label: 'Conservative (0–15% volatility)' },
      { id: 'cautious', label: 'Cautious (5–25%)' },
      { id: 'balanced', label: 'Balanced (10–35%)' },
      { id: 'growth', label: 'Growth (15–45%)' },
      { id: 'aggressive', label: 'Aggressive (20%+)' }
    ]
  },
  {
    id: 'time_commitment',
    text: 'How much time do you want to spend actively managing your investments?',
    type: 'radio',
    options: [
      { id: 'minimal', label: 'Minimal (rely on advisors, little personal time)' },
      { id: 'moderate', label: 'Moderate (some involvement, occasional research)' },
      { id: 'high', label: 'High (hands-on, frequent decisions)' }
    ]
  },
  {
    id: 'decision_making',
    text: 'How do you prefer to make investment decisions?',
    type: 'radio',
    options: [
      { id: 'independent', label: 'Independent / self-research' },
      { id: 'advisors', label: 'With professional advisors' },
      { id: 'community', label: 'As part of a community or syndicate' }
    ]
  },
  {
    id: 'liquidity_importance',
    text: 'How important is liquidity (easy access to your money) to you?',
    type: 'radio',
    options: [
      { id: 'prefer_liquid', label: 'Prefer liquid, tradable assets' },
      { id: 'mixed', label: 'Comfortable with a mix of liquid and illiquid' },
      { id: 'comfortable_illiquid', label: 'Comfortable with illiquid, long-term holds' }
    ]
  },
  {
    id: 'current_portfolio',
    text: 'Which best describes your current portfolio?',
    type: 'radio',
    options: [
      { id: 'cash_bonds', label: 'Mostly cash/bonds/regulated assets' },
      { id: 'diversified_equities', label: 'Diversified equities/funds' },
      { id: 'property_heavy', label: 'Property-heavy' },
      { id: 'alternatives_heavy', label: 'Alternatives/collectibles-heavy' },
      { id: 'crypto_heavy', label: 'Crypto-heavy' },
      { id: 'beginner_mix', label: 'Beginner mix (small allocations across categories)' }
    ]
  },
  {
    id: 'asset_interests',
    text: 'What types of assets interest you most? (select all that apply)',
    type: 'multiselect',
    options: [
      { id: 'public_equities', label: 'Public equities & bonds' },
      { id: 'property_real_estate', label: 'Property/real estate' },
      { id: 'crypto_digital', label: 'Crypto/digital assets' },
      { id: 'collectibles', label: 'Collectibles (art, whisky, luxury items)' },
      { id: 'vc_angel_eis', label: 'VC, Angel, or EIS/SEIS investments' }
    ]
  },
  {
    id: 'biggest_challenge',
    text: 'What is your biggest challenge with investing?',
    type: 'radio',
    options: [
      { id: 'lack_time', label: 'Lack of time' },
      { id: 'lack_knowledge', label: 'Lack of knowledge/experience' },
      { id: 'risk_scams', label: 'Risk of scams' },
      { id: 'tax_optimisation', label: 'Tax optimisation' },
      { id: 'estate_retirement', label: 'Estate/retirement planning' }
    ]
  },
  {
    id: 'annual_return_target',
    text: 'What annual return are you aiming for?',
    type: 'radio',
    options: [
      { id: 'three_to_five', label: '3–5%' },
      { id: 'five_to_seven', label: '5–7%' },
      { id: 'eight_to_twelve', label: '8–12%' },
      { id: 'fifteen_plus', label: '15%+' }
    ]
  },
  {
    id: 'esg_importance',
    text: 'How important are ethical/ESG or impact values in your investing?',
    type: 'radio',
    options: [
      { id: 'not_important', label: 'Not important' },
      { id: 'somewhat_important', label: 'Somewhat important' },
      { id: 'very_important', label: 'Very important' }
    ]
  }
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
  const [currentQuestionAnswer, setCurrentQuestionAnswer] = useState<string | string[]>('');

  // Convert questionnaire answers to form data for persona classification
  const convertQuestionnaireToFormData = (answers: QuestionnaireAnswer[]): PreferencesFormData => {
    const answerMap = answers.reduce((acc, answer) => {
      acc[answer.questionId] = answer.response;
      return acc;
    }, {} as Record<string, string | string[]>);

    // Map questionnaire answers to form fields
    let investorObjective: 'wealth_building' | 'wealth_preservation' | 'hybrid' = 'hybrid';
    let riskProfile: 'conservative' | 'cautious' | 'balanced' | 'growth' | 'aggressive' = 'balanced';
    let managementStyle: 'minimal' | 'moderate' | 'high' = 'moderate';
    let liquidityPreference: 'prefer_liquid' | 'mixed_acceptable' | 'comfortable_illiquid' = 'mixed_acceptable';
    let decisionMakingStyle: 'rely_advisors' | 'independent_research' | 'collaborate_peers' = 'independent_research';
    let investmentHorizon: 'short_term' | 'medium_term' | 'long_term' = 'medium_term';
    let esgImportance: 'not_important' | 'somewhat_important' | 'very_important' = 'somewhat_important';
    let activeInvestmentInterests: string[] = [];

    // Direct mappings from new question format
    if (answerMap.investment_objective === 'wealth_preservation') {
      investorObjective = 'wealth_preservation';
    } else if (answerMap.investment_objective === 'wealth_building') {
      investorObjective = 'wealth_building';
    } else {
      investorObjective = 'hybrid';
    }

    if (answerMap.risk_profile) {
      riskProfile = answerMap.risk_profile as 'conservative' | 'cautious' | 'balanced' | 'growth' | 'aggressive';
    }

    if (answerMap.time_commitment) {
      managementStyle = answerMap.time_commitment as 'minimal' | 'moderate' | 'high';
    }

    if (answerMap.decision_making === 'independent') {
      decisionMakingStyle = 'independent_research';
    } else if (answerMap.decision_making === 'advisors') {
      decisionMakingStyle = 'rely_advisors';
    } else if (answerMap.decision_making === 'community') {
      decisionMakingStyle = 'collaborate_peers';
    }

    if (answerMap.liquidity_importance === 'prefer_liquid') {
      liquidityPreference = 'prefer_liquid';
    } else if (answerMap.liquidity_importance === 'mixed') {
      liquidityPreference = 'mixed_acceptable';
    } else if (answerMap.liquidity_importance === 'comfortable_illiquid') {
      liquidityPreference = 'comfortable_illiquid';
    }

    if (answerMap.esg_importance) {
      esgImportance = answerMap.esg_importance as 'not_important' | 'somewhat_important' | 'very_important';
    }

    // Handle multi-select asset interests
    if (Array.isArray(answerMap.asset_interests)) {
      const assetMap: Record<string, string[]> = {
        'public_equities': ['Public Equity Markets', 'Bond Markets'],
        'property_real_estate': ['Real Estate Investment', 'REITs', 'Property Development'],
        'crypto_digital': ['Cryptocurrency'],
        'collectibles': ['Fine Art & Collectibles', 'Whisky & Spirits', 'Alternative Assets'],
        'vc_angel_eis': ['Venture Capital', 'Angel Investing', 'EIS/SEIS Opportunities']
      };
      
      answerMap.asset_interests.forEach(interest => {
        if (assetMap[interest]) {
          activeInvestmentInterests.push(...assetMap[interest]);
        }
      });
    }

    // Set investment horizon based on return target and other factors
    if (answerMap.annual_return_target === 'three_to_five' || answerMap.biggest_challenge === 'estate_retirement') {
      investmentHorizon = 'long_term';
    } else if (answerMap.annual_return_target === 'fifteen_plus') {
      investmentHorizon = 'short_term';
    } else {
      investmentHorizon = 'medium_term';
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

  // Handle questionnaire answer for radio questions
  const handleRadioAnswer = (value: string) => {
    setCurrentQuestionAnswer(value);
  };

  // Handle questionnaire answer for multiselect questions
  const handleMultiselectAnswer = (value: string, checked: boolean) => {
    const current = Array.isArray(currentQuestionAnswer) ? currentQuestionAnswer : [];
    let updated: string[];
    
    if (checked) {
      updated = [...current, value];
    } else {
      updated = current.filter(item => item !== value);
    }
    
    setCurrentQuestionAnswer(updated);
  };

  // Go back to previous question
  const goBackToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      
      // Restore previous answer if it exists
      const previousQuestion = questionnaireQuestions[currentQuestionIndex - 1];
      const previousAnswer = questionnaireAnswers.find(a => a.questionId === previousQuestion.id);
      
      if (previousAnswer) {
        setCurrentQuestionAnswer(previousAnswer.response);
      } else {
        setCurrentQuestionAnswer(previousQuestion.type === 'multiselect' ? [] : '');
      }
    }
  };

  // Submit current question answer and move to next
  const submitCurrentAnswer = () => {
    if (!currentQuestionAnswer || (Array.isArray(currentQuestionAnswer) && currentQuestionAnswer.length === 0)) {
      toast({
        title: "Answer Required",
        description: "Please select an answer before continuing.",
        variant: "destructive"
      });
      return;
    }

    const currentQuestion = questionnaireQuestions[currentQuestionIndex];
    const newAnswer: QuestionnaireAnswer = {
      questionId: currentQuestion.id,
      response: currentQuestionAnswer
    };

    const updatedAnswers = [...questionnaireAnswers.filter(a => a.questionId !== currentQuestion.id), newAnswer];
    setQuestionnaireAnswers(updatedAnswers);

    // Reset current answer
    setCurrentQuestionAnswer(currentQuestion.type === 'multiselect' ? [] : '');

    // Move to next question or complete
    if (currentQuestionIndex < questionnaireQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Complete questionnaire
      setQuestionnaireComplete(true);
      
      // Classify persona using new CSV-based scoring
      const personaClassification = classifyInvestorPersonaFromAnswers(updatedAnswers);
      setQuestionnairePersonaResult(personaClassification);

      console.log('Questionnaire completed:', {
        answers: updatedAnswers,
        csvMappedAnswers: mapAnswersToCsvFormat(updatedAnswers),
        topPersona: personaClassification.persona.name,
        topScore: `${personaClassification.score}%`,
        allMatches: personaClassification.allMatches?.map(m => ({ 
          name: m.persona.name, 
          score: `${m.score}%` 
        }))
      });

      // Show all relevant personas if multiple found
      const topMatches = personaClassification.allMatches?.slice(0, 3) || [personaClassification];
      const matchText = topMatches.length > 1 
        ? `Top matches: ${topMatches.map(m => `${m.persona.name} (${m.score}%)`).join(', ')}`
        : `You're a "${personaClassification.persona.name}" with ${personaClassification.score}% alignment.`;

      toast({
        title: "Profile Analysis Complete!",
        description: matchText,
      });
    }
  };

  // Reset questionnaire
  const resetQuestionnaire = () => {
    setCurrentQuestionIndex(0);
    setQuestionnaireAnswers([]);
    setQuestionnaireComplete(false);
    setQuestionnairePersonaResult(null);
    setCurrentQuestionAnswer(questionnaireQuestions[0]?.type === 'multiselect' ? [] : '');
  };

  // Initialize current answer when component mounts or question changes
  useEffect(() => {
    if (questionnaireQuestions[currentQuestionIndex]) {
      const currentQuestion = questionnaireQuestions[currentQuestionIndex];
      
      // Check if there's already an answer for this question
      const existingAnswer = questionnaireAnswers.find(a => a.questionId === currentQuestion.id);
      
      if (existingAnswer) {
        setCurrentQuestionAnswer(existingAnswer.response);
      } else {
        setCurrentQuestionAnswer(currentQuestion.type === 'multiselect' ? [] : '');
      }
    }
  }, [currentQuestionIndex, questionnaireAnswers]);

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
                    <div className="max-w-3xl mx-auto">
                      {questionnaireQuestions[currentQuestionIndex]?.type === 'radio' ? (
                        /* Radio Group for Single Select */
                        <RadioGroup
                          value={typeof currentQuestionAnswer === 'string' ? currentQuestionAnswer : ''}
                          onValueChange={handleRadioAnswer}
                          className="space-y-4"
                        >
                          {questionnaireQuestions[currentQuestionIndex]?.options.map((option) => (
                            <div
                              key={option.id}
                              className="flex items-center space-x-3 p-4 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--accent)]/5 transition-all duration-300 cursor-pointer"
                              onClick={() => handleRadioAnswer(option.id)}
                              data-testid={`radio-option-${option.id}`}
                            >
                              <RadioGroupItem value={option.id} id={option.id} />
                              <label htmlFor={option.id} className="flex-1 text-base cursor-pointer">
                                {option.label}
                              </label>
                            </div>
                          ))}
                        </RadioGroup>
                      ) : (
                        /* Checkbox Group for Multi Select */
                        <div className="space-y-4">
                          <p className="text-sm text-[var(--muted-foreground)] mb-4">Select all that apply:</p>
                          {questionnaireQuestions[currentQuestionIndex]?.options.map((option) => (
                            <div
                              key={option.id}
                              className="flex items-center space-x-3 p-4 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--accent)]/5 transition-all duration-300"
                            >
                              <Checkbox
                                id={option.id}
                                checked={Array.isArray(currentQuestionAnswer) && currentQuestionAnswer.includes(option.id)}
                                onCheckedChange={(checked) => handleMultiselectAnswer(option.id, checked as boolean)}
                                data-testid={`checkbox-option-${option.id}`}
                              />
                              <label htmlFor={option.id} className="flex-1 text-base cursor-pointer">
                                {option.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Navigation Buttons */}
                      <div className="flex justify-between items-center mt-8 max-w-md mx-auto">
                        {currentQuestionIndex > 0 ? (
                          <Button
                            onClick={goBackToPreviousQuestion}
                            size="lg"
                            variant="outline"
                            className="px-6 py-4 text-lg border-2 border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--accent)]/10 transition-all duration-300"
                            data-testid="button-back"
                          >
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            Back
                          </Button>
                        ) : (
                          <div className="w-24" /> /* Spacer */
                        )}
                        
                        <Button
                          onClick={submitCurrentAnswer}
                          size="lg"
                          className="px-8 py-4 text-lg bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] hover:from-[var(--primary)]/90 hover:to-[var(--secondary)]/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                          data-testid="button-continue"
                        >
                          <ArrowRight className="mr-2 h-5 w-5" />
                          {currentQuestionIndex === questionnaireQuestions.length - 1 ? 'Complete' : 'Continue'}
                        </Button>
                      </div>
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
                          Your Investment Persona Analysis
                        </CardTitle>
                        <CardDescription>
                          Based on your questionnaire responses, here are your matching investor profiles
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {/* Primary Match */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-xl font-bold text-[var(--primary)]">
                                🏆 Primary Match: {questionnairePersonaResult.persona.name}
                              </h3>
                              <Badge variant="default" className="px-3 py-1 bg-[var(--primary)] text-white">
                                {questionnairePersonaResult.score}% alignment
                              </Badge>
                            </div>
                            <p className="text-[var(--muted-foreground)] leading-relaxed">
                              {questionnairePersonaResult.persona.description}
                            </p>
                          </div>

                          {/* Additional Relevant Matches */}
                          {questionnairePersonaResult.allMatches && questionnairePersonaResult.allMatches.length > 1 && (
                            <div className="space-y-4">
                              <h4 className="text-lg font-semibold text-[var(--secondary)]">
                                📊 Additional Relevant Profiles
                              </h4>
                              <div className="grid gap-3">
                                {questionnairePersonaResult.allMatches.slice(1, 4).map((match, index) => (
                                  <div 
                                    key={match.persona.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-[var(--muted)]/20 border border-[var(--border)]"
                                  >
                                    <div className="flex-1">
                                      <h5 className="font-medium text-[var(--foreground)]">
                                        {match.persona.name}
                                      </h5>
                                      <p className="text-sm text-[var(--muted-foreground)] mt-1 line-clamp-2">
                                        {match.persona.description}
                                      </p>
                                    </div>
                                    <Badge variant="outline" className="ml-3 px-2 py-1">
                                      {match.score}%
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="bg-[var(--accent)]/10 rounded-lg p-4 border border-[var(--accent)]/20">
                            <p className="text-sm text-[var(--muted-foreground)]">
                              🎯 These classifications help us tailor investment recommendations and educational content specifically for your profile. The scoring is based on a weighted analysis of your responses across 10 discovery questions.
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
                    {investorPersonas.map((persona) => {
                      // Find if this persona has a score from questionnaire results
                      const personaMatch = questionnairePersonaResult?.allMatches?.find(
                        match => match.persona.id === persona.id
                      );
                      const isPrimaryMatch = questionnairePersonaResult?.persona.id === persona.id;
                      const hasScore = personaMatch && personaMatch.score > 0;

                      // Determine styling based on match results
                      let cardClasses = "cursor-pointer rounded-xl border p-4 transition-all hover:shadow-lg hover:scale-[1.02] duration-300";
                      let borderClasses = "";
                      let backgroundClasses = "";
                      
                      if (isPrimaryMatch) {
                        // Primary match: prominent styling
                        borderClasses = "border-2 border-[var(--primary)]";
                        backgroundClasses = "bg-gradient-to-br from-[var(--primary)]/15 to-[var(--secondary)]/10";
                      } else if (hasScore) {
                        // Secondary match: subtle highlight
                        borderClasses = "border-2 border-[var(--secondary)]/60";
                        backgroundClasses = "bg-[var(--secondary)]/5";
                      } else {
                        // No match: standard styling
                        borderClasses = "border border-[var(--border)]";
                        backgroundClasses = "bg-[var(--card)]";
                      }

                      return (
                        <div
                          key={persona.id}
                          className={`${cardClasses} ${borderClasses} ${backgroundClasses} hover:border-[var(--primary)]`}
                          data-testid={`persona-card-${persona.id}`}
                        >
                          <div className="space-y-3">
                            {/* Header with optional score badge */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${isPrimaryMatch ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]' : hasScore ? 'bg-[var(--secondary)]' : 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]'}`}></div>
                                <h3 className="font-semibold text-sm text-[var(--foreground)]">{persona.name}</h3>
                              </div>
                              {hasScore && (
                                <div className="flex items-center gap-1">
                                  {isPrimaryMatch && <span className="text-xs">🏆</span>}
                                  <Badge 
                                    variant={isPrimaryMatch ? "default" : "secondary"} 
                                    className={`text-xs px-2 py-0.5 ${isPrimaryMatch ? 'bg-[var(--primary)] text-white' : 'bg-[var(--secondary)] text-white'}`}
                                  >
                                    {personaMatch.score}%
                                  </Badge>
                                </div>
                              )}
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

                            {/* Match indicator for scored personas */}
                            {hasScore && (
                              <div className="pt-2 border-t border-[var(--border)]/30">
                                <p className="text-xs font-medium text-[var(--primary)]">
                                  {isPrimaryMatch ? '✨ Your Primary Match' : '📊 Relevant Profile'}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
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