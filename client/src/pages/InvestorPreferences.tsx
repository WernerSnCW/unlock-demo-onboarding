import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, Shield, Target, Lightbulb, BookOpen, DollarSign, AlertTriangle, Users, Globe, User, Heart, Clock, HelpCircle, Sparkles, Settings, Droplets, Brain, ThumbsUp, ThumbsDown, Minus, RotateCcw, ArrowRight, ArrowLeft, X, CheckCircle, BarChart3, Zap, Info } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { usePersonaQuiz } from '@/hooks/usePersonaQuiz';
import { useBeliefQuestionnaire } from '@/hooks/useBeliefQuestionnaire';
import { useAdditionalBeliefs } from '@/hooks/useAdditionalBeliefs';
import { DIMENSION_LABELS, INVESTMENT_PERSONAS, type PersonaDef } from '@/data/personas';
import { PortfolioDisplay } from '@/components/PortfolioDisplay';
import { SCENARIO_NAMES } from '@/data/beliefQuestions';

const preferencesSchema = z.object({
  activeInvestmentInterests: z.array(z.string()).min(1, 'Please select at least one investment interest'),
  learningCuriosityAreas: z.array(z.string()).min(1, 'Please select at least one area of curiosity'),
  geographicPreferences: z.array(z.string()).min(1, 'Please select at least one geographic preference'),
  investorObjective: z.enum(['wealth_building', 'wealth_preservation', 'hybrid']).optional(),
  riskProfile: z.enum(['conservative', 'cautious', 'balanced', 'growth', 'aggressive']).optional(),
  managementStyle: z.enum(['minimal', 'moderate', 'high']).optional(),
  decisionMakingStyle: z.enum(['rely_advisors', 'independent_research', 'collaborate_peers']).optional(),
  liquidityPreference: z.enum(['prefer_liquid', 'mixed_acceptable', 'comfortable_illiquid']).optional(),
  investmentHorizon: z.enum(['short_term', 'medium_term', 'long_term']).optional(),
  esgImportance: z.enum(['not_important', 'somewhat_important', 'very_important']).optional(),
  riskCapacity: z.number().optional(),
  ticketSizeMin: z.number().optional(),
  ticketSizeMax: z.number().optional(),
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

// Economic scenarios for portfolio stress testing
const economicScenarios = [
  {
    id: 'property_crash_2008',
    name: '2008-Style Property Crash',
    description: 'Significant property value decline with credit market freeze and financial sector stress',
    horizon: '5 year horizon',
    icon: AlertTriangle
  },
  {
    id: 'ai_recession',
    name: 'AI-Driven Economic Recession',
    description: 'Widespread job displacement and economic disruption from rapid AI adoption',
    horizon: '5 year horizon',
    icon: Brain
  },
  {
    id: 'stagflation_1970s',
    name: 'High-Inflation Stagflation (1970s Redux)',
    description: 'Prolonged period of high inflation combined with economic stagnation and unemployment',
    horizon: '5 year horizon',
    icon: TrendingUp
  },
  {
    id: 'tech_bubble_burst',
    name: 'Tech & Speculative Bubble Burst',
    description: 'Major correction in technology valuations and speculative assets',
    horizon: '5 year horizon',
    icon: Zap
  },
  {
    id: 'uk_policy_shift',
    name: 'UK Policy & Tax Regime Shift',
    description: 'Significant changes to tax policy, regulatory environment, and economic framework',
    horizon: '5 year horizon',
    icon: Settings
  }
];

// Persona to Economic Scenario mapping based on risk exposure analysis
const personaScenarioMapping: Record<string, string[]> = {
  // Property-Heavy Personas
  'property_lover': ['property_crash_2008', 'uk_policy_shift'],
  'legacy_builder': ['property_crash_2008', 'uk_policy_shift'], 
  'inheritance_receiver': ['property_crash_2008', 'uk_policy_shift'],
  
  // Tech & Growth Personas  
  'wealth_accumulator': ['tech_bubble_burst', 'ai_recession'],
  'crypto_bro': ['tech_bubble_burst', 'ai_recession'],
  'novice_self_directed': ['tech_bubble_burst', 'ai_recession'],
  'angel_networker': ['tech_bubble_burst', 'ai_recession'],
  
  // Income & Tax-Sensitive Personas
  'old_fashioned': ['stagflation_1970s', 'uk_policy_shift'],
  'the_saver': ['stagflation_1970s', 'uk_policy_shift'],
  'city_professional': ['uk_policy_shift', 'ai_recession'],
  
  // Mixed Risk Personas
  'retirement_planner': ['ai_recession', 'uk_policy_shift'],
  'mr_alternative': ['tech_bubble_burst', 'uk_policy_shift']
};

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
    { questionId: 'investment_objective', response: formData.investorObjective || 'hybrid' },
    { questionId: 'risk_profile', response: formData.riskProfile || 'balanced' },
    { questionId: 'time_commitment', response: formData.managementStyle || 'moderate' },
    { questionId: 'decision_making', response: formData.decisionMakingStyle === 'rely_advisors' ? 'advisors' : formData.decisionMakingStyle === 'collaborate_peers' ? 'community' : 'independent' },
    { questionId: 'liquidity_importance', response: formData.liquidityPreference === 'mixed_acceptable' ? 'mixed' : formData.liquidityPreference || 'mixed' },
    { questionId: 'current_portfolio', response: 'diversified_equities' }, // Default
    { questionId: 'asset_interests', response: ['public_equities'] }, // Default
    { questionId: 'biggest_challenge', response: 'lack_time' }, // Default
    { questionId: 'annual_return_target', response: 'eight_to_twelve' }, // Default
    { questionId: 'esg_importance', response: formData.esgImportance || 'somewhat_important' }
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

// Portfolio Recommendations Button Component
function PortfolioRecommendationsButton({ 
  persona, 
  selectedScenarios, 
  scenarioWeights,
  onShowPortfolio
}: { 
  persona: PersonaDef; 
  selectedScenarios: string[]; 
  scenarioWeights: any[];
  onShowPortfolio: () => void;
}) {
  const handleShowPortfolio = () => {
    if (selectedScenarios.length > 0) {
      onShowPortfolio();
    }
  };

  return (
    <Button 
      size="lg"
      onClick={handleShowPortfolio}
      disabled={selectedScenarios.length === 0}
      className="flex items-center gap-2 px-8 py-4 text-lg bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] hover:from-[var(--primary)]/90 hover:to-[var(--secondary)]/90 transition-all duration-300 shadow-lg disabled:opacity-50"
      data-testid="button-continue-analysis"
    >
      <TrendingUp className="h-5 w-5" />
      Show Portfolio Recommendations
      {selectedScenarios.length === 0 && (
        <Badge variant="outline" className="ml-2">
          Select scenarios first
        </Badge>
      )}
    </Button>
  );
}

// Get scenario description for tooltip
function getScenarioDescription(scenario: string): string {
  const descriptions: Record<string, string> = {
    'recession': 'Economic downturn with declining GDP, rising unemployment, and reduced consumer spending. Markets typically favor defensive assets.',
    'property_down': 'UK property market correction with falling house prices, impacting real estate investments and related sectors significantly.',
    'stagflation': 'High inflation combined with economic stagnation - rising prices but slow growth. Gold and commodities typically perform well.',
    'tech_correction': 'Technology sector selloff due to overvaluation concerns, affecting growth stocks and innovation-focused investments.',
    'devaluation': 'Sterling weakens significantly against major currencies, benefiting exporters but increasing import costs and inflation.',
    'gilt_selloff': 'UK government bonds face selling pressure, driving yields higher and bond prices lower. Duration risk increases.',
    'energy_spike': 'Energy prices surge due to supply disruptions or geopolitical tensions, benefiting energy stocks but hurting consumers.',
    'reflation': 'Economic recovery with moderate inflation and growth. Balanced scenario favoring growth equities and real assets.'
  };
  
  return descriptions[scenario] || 'Economic scenario affecting market conditions and investment returns.';
}

export default function InvestorPreferences() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();
  const [personaResult, setPersonaResult] = useState<{ persona: typeof investorPersonas[0], score: number } | null>(null);
  
  // Questionnaire state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<QuestionnaireAnswer[]>([]);
  const [questionnaireComplete, setQuestionnaireComplete] = useState(false);
  const [questionnairePersonaResult, setQuestionnairePersonaResult] = useState<{ persona: typeof investorPersonas[0], score: number, allMatches?: Array<{ persona: typeof investorPersonas[0], score: number }> } | null>(null);
  const [currentQuestionAnswer, setCurrentQuestionAnswer] = useState<string | string[]>('');
  
  // Selected persona state for user override
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  
  // Selected economic scenarios state (multiple selection allowed)
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<string[]>([]);

  // Persona details modal state
  const [selectedPersonaForDetails, setSelectedPersonaForDetails] = useState<typeof investorPersonas[0] | null>(null);
  
  // Active tab state
  const [activeTab, setActiveTab] = useState("detailed");

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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
      
      // Save persona result to localStorage for demo carryover
      localStorage.setItem('questionnairePersonaResult', JSON.stringify(personaClassification));

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

  // Randomize all questionnaire answers
  const randomizeAnswers = () => {
    const randomAnswers: QuestionnaireAnswer[] = [];

    questionnaireQuestions.forEach((question) => {
      if (question.type === 'radio') {
        // Pick a random option for radio questions
        const randomIndex = Math.floor(Math.random() * question.options.length);
        randomAnswers.push({
          questionId: question.id,
          response: question.options[randomIndex].id
        });
      } else if (question.type === 'multiselect') {
        // Pick 1-3 random options for multiselect questions
        const numSelections = Math.floor(Math.random() * 3) + 1; // 1-3 selections
        const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);
        const selectedOptions = shuffledOptions.slice(0, numSelections);
        
        randomAnswers.push({
          questionId: question.id,
          response: selectedOptions.map(option => option.id)
        });
      }
    });

    // Set the random answers and complete the questionnaire
    setQuestionnaireAnswers(randomAnswers);
    setQuestionnaireComplete(true);

    // Classify persona using the random answers
    const personaClassification = classifyInvestorPersonaFromAnswers(randomAnswers);
    setQuestionnairePersonaResult(personaClassification);
    
    // Save persona result to localStorage for demo carryover
    localStorage.setItem('questionnairePersonaResult', JSON.stringify(personaClassification));

    console.log('Questionnaire randomized:', {
      answers: randomAnswers,
      csvMappedAnswers: mapAnswersToCsvFormat(randomAnswers),
      topPersona: personaClassification.persona.name,
      topScore: `${personaClassification.score}%`,
      allMatches: personaClassification.allMatches?.map(m => ({ 
        name: m.persona.name, 
        score: `${m.score}%` 
      }))
    });

    toast({
      title: "Answers Randomized!",
      description: `Generated random profile: ${personaClassification.persona.name} (${personaClassification.score}% match)`,
    });
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
      activeInvestmentInterests: [],
      learningCuriosityAreas: [],
      geographicPreferences: [],
    },
  });

  const onSubmit = async (data: PreferencesFormData) => {
    setIsSubmitting(true);
    try {
      console.log('Investor preferences submitted:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Preferences Saved!",
        description: "Your investment preferences have been saved successfully. Switching to investment profile discovery...",
      });
      
      // Switch to the "Discover Your Investment Profile" tab after a brief delay
      setTimeout(() => {
        setActiveTab("profile");
        // Scroll to top when switching tabs
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 1500);
      
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

        <Tabs defaultValue="detailed" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-[var(--muted)] p-1 rounded-lg">
            <TabsTrigger 
              value="detailed" 
              className={`flex items-center gap-2 rounded-md transition-all duration-300 ${
                activeTab === "detailed" 
                  ? "!bg-[var(--primary)] !text-white shadow-md border-0" 
                  : "bg-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--background)]"
              }`}
            >
              <Target className="h-4 w-4" />
              Investor Preferences
            </TabsTrigger>
            <TabsTrigger 
              value="profile" 
              className={`flex items-center gap-2 rounded-md transition-all duration-300 ${
                activeTab === "profile" 
                  ? "!bg-[var(--primary)] !text-white shadow-md border-0" 
                  : "bg-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--background)]"
              }`}
            >
              <User className="h-4 w-4" />
              Discover Your Investment Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="detailed">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Demo Auto-Select Button */}
            <div className="flex justify-center mb-8">
              <Button
                type="button"
                onClick={() => {
                  // Auto-select sample preferences for demo
                  form.setValue('activeInvestmentInterests', [
                    'Venture Capital', 'Angel Investing', 'Cryptocurrency', 
                    'AI & Technology', 'EIS/SEIS Opportunities', 'Private Equity'
                  ]);
                  form.setValue('learningCuriosityAreas', [
                    'Market Analysis & Research', 'Venture Capital Ecosystem', 
                    'Risk Management', 'Cryptocurrency Fundamentals', 'Valuation Methods'
                  ]);
                  form.setValue('geographicPreferences', [
                    'United Kingdom', 'United States', 'European Union', 'Global Diversified'
                  ]);
                  
                  toast({
                    title: "Demo Preferences Selected!",
                    description: "Sample preferences have been automatically filled for demonstration purposes.",
                  });
                }}
                size="lg"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-0"
                data-testid="button-demo-autoselect"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Auto-Select Demo Preferences
              </Button>
            </div>

            {/* Active Investment Interests */}
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
                className="px-12 py-6 text-lg rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] hover:from-[var(--primary)]/90 hover:to-[var(--secondary)]/90"
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

              </form>
            </Form>
          </TabsContent>

          <TabsContent value="profile">
            <PersonaQuizContent />
          </TabsContent>
        </Tabs>
      </div>
      </main>
    </div>
  );
}

function PersonaQuizContent() {
  const [selectedPersona, setSelectedPersona] = useState<PersonaDef | null>(null);
  const [showBeliefQuestionnaire, setShowBeliefQuestionnaire] = useState(false);
  const [finalPersona, setFinalPersona] = useState<PersonaDef | null>(null);
  
  const {
    currentQuestion,
    currentQuestionIndex,
    progress,
    isComplete,
    result,
    canGoBack,
    isLastQuestion,
    answerQuestion,
    goBack,
    skipQuestion,
    resetQuiz,
    autoCompleteRandomly,
    totalQuestions,
    dimensionLabels
  } = usePersonaQuiz();

  // Scroll to top when quiz is completed
  useEffect(() => {
    if (isComplete && result) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isComplete, result]);

  // Handle auto complete with scroll to top
  const handleAutoComplete = useCallback(() => {
    autoCompleteRandomly();
    // Small delay to ensure state update, then scroll
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }, [autoCompleteRandomly]);

  // Handle persona selection and proceed to beliefs
  const handleUsePersona = useCallback(() => {
    if (!result) return;
    const chosenPersona = selectedPersona || result.topMatch.persona;
    setFinalPersona(chosenPersona);
    setShowBeliefQuestionnaire(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedPersona, result]);

  // Show belief questionnaire if selected
  if (showBeliefQuestionnaire && finalPersona) {
    return <BeliefQuestionnaireContent persona={finalPersona} onBack={() => setShowBeliefQuestionnaire(false)} />;
  }

  if (isComplete && result) {
    return (
      <div className="space-y-10">
        {/* Hero Results Header */}
        <div className="text-center space-y-4 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/10 via-transparent to-[var(--secondary)]/10 rounded-3xl blur-3xl -z-10"></div>
          
          <div className="relative bg-gradient-to-br from-[var(--primary)]/5 to-[var(--secondary)]/5 backdrop-blur-sm border border-[var(--primary)]/20 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full blur-lg opacity-75"></div>
                <div className="relative bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-full p-4">
                  <Target className="h-8 w-8" />
                </div>
                <div className="absolute -top-2 -right-2 animate-bounce">
                  <Sparkles className="h-6 w-6 text-[var(--accent)] fill-current" />
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] bg-clip-text text-transparent mb-4">
              Analysis Complete!
            </h1>
            <p className="text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto">
              Your personality matches our research-backed investor profiles with sophisticated 8-dimensional analysis
            </p>
          </div>
        </div>

        {/* Primary Match - Hero Card */}
        <Card className="relative overflow-hidden border-2 border-[var(--primary)] shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 via-transparent to-[var(--secondary)]/5"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--primary)]/20 to-transparent rounded-bl-3xl"></div>
          
          <CardHeader className="relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-xl text-white">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 border border-[var(--primary)]/30">
                    🏆 BEST MATCH
                  </Badge>
                </div>
                <CardTitle className="text-3xl md:text-4xl font-black text-[var(--primary)] leading-tight">
                  {result.topMatch.persona.name}
                </CardTitle>
                <CardDescription className="text-lg text-[var(--muted-foreground)]">
                  Your primary investment personality match
                </CardDescription>
              </div>
              
              <div className="text-right space-y-2">
                <div className="text-4xl font-black text-[var(--primary)]">
                  {result.topMatch.matchScore}%
                </div>
                <div className="text-sm text-[var(--muted-foreground)]">
                  {result.topMatch.confidence}% confidence
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="relative space-y-6">
            <div className="bg-gradient-to-r from-[var(--primary)]/5 to-[var(--secondary)]/5 rounded-2xl p-6 border border-[var(--primary)]/10">
              <p className="text-lg leading-relaxed text-[var(--foreground)]">
                {result.topMatch.persona.notes}
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)] hover:border-[var(--primary)]/30 transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-[var(--primary)]" />
                  <span className="font-semibold text-[var(--foreground)] text-sm">Wealth Tier</span>
                </div>
                <p className="text-[var(--muted-foreground)] font-medium">{result.topMatch.persona.wealthTier}</p>
              </div>
              
              <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)] hover:border-[var(--primary)]/30 transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-[var(--secondary)]" />
                  <span className="font-semibold text-[var(--foreground)] text-sm">Risk Profile</span>
                </div>
                <p className="text-[var(--muted-foreground)] font-medium">{result.topMatch.persona.riskProfile}</p>
              </div>
              
              <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)] hover:border-[var(--primary)]/30 transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-[var(--accent)]" />
                  <span className="font-semibold text-[var(--foreground)] text-sm">Approach</span>
                </div>
                <p className="text-[var(--muted-foreground)] font-medium">{result.topMatch.persona.approach}</p>
              </div>
              
              <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)] hover:border-[var(--primary)]/30 transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="h-4 w-4 text-[var(--warning)]" />
                  <span className="font-semibold text-[var(--foreground)] text-sm">Liquidity</span>
                </div>
                <p className="text-[var(--muted-foreground)] font-medium">{result.topMatch.persona.liquidityMonths} months</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Runner-up Match */}
        {result.runnerUp && (
          <Card className="border border-[var(--border)] bg-gradient-to-br from-[var(--secondary)]/5 to-transparent shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="px-3 py-1 border-[var(--secondary)] text-[var(--secondary)]">
                      📊 RUNNER-UP
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold text-[var(--secondary)]">
                    {result.runnerUp.persona.name}
                  </CardTitle>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[var(--secondary)]">
                    {result.runnerUp.matchScore}%
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--muted-foreground)] mb-4">
                {result.runnerUp.persona.notes}
              </p>
              <div className="bg-[var(--accent)]/10 rounded-lg p-3 border border-[var(--accent)]/20">
                <p className="text-sm text-[var(--muted-foreground)] flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-[var(--accent)]" />
                  We default to the safer option when scores are close for better risk management.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Profile Scores */}
        <Card className="border border-[var(--border)] bg-gradient-to-br from-[var(--accent)]/5 to-transparent shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-[var(--foreground)]">
              <BarChart3 className="h-5 w-5 text-[var(--accent)]" />
              Your 8-Dimensional Investment Profile
            </CardTitle>
            <CardDescription>
              How you scored across our research-backed investment dimensions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TooltipProvider>
              <div className="h-96 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart 
                  data={result.userProfile.map((score, index) => ({
                    dimension: dimensionLabels[index],
                    value: score,
                    fullMark: 5
                  }))}
                  margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
                >
                  <PolarGrid 
                    stroke="var(--foreground)" 
                    strokeOpacity={0.2}
                    strokeWidth={1}
                  />
                  <PolarAngleAxis 
                    dataKey="dimension" 
                    tick={{ 
                      fontSize: 12, 
                      fill: 'var(--foreground)',
                      fontWeight: 500
                    }}
                    className="text-xs"
                  />
                  <PolarRadiusAxis 
                    domain={[0, 5]} 
                    angle={90} 
                    tick={{ 
                      fontSize: 10, 
                      fill: 'var(--muted-foreground)',
                    }}
                    tickCount={6}
                  />
                  <Radar
                    name="Your Profile"
                    dataKey="value"
                    stroke="var(--primary)"
                    fill="var(--primary)"
                    fillOpacity={0.15}
                    strokeWidth={3}
                    dot={{ 
                      fill: 'var(--accent)', 
                      strokeWidth: 2, 
                      stroke: 'var(--primary)',
                      r: 5
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Score Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {result.userProfile.map((score, index) => {
                const percentage = (score / 5) * 100;
                const getScoreColor = (score: number) => {
                  if (score >= 4) return 'var(--success)';
                  if (score >= 3) return 'var(--primary)';
                  if (score >= 2) return 'var(--warning)';
                  return 'var(--destructive)';
                };

                const getDimensionExplanation = (dimensionIndex: number) => {
                  const explanations = [
                    "How comfortable you are with investment volatility and potential losses. Higher scores indicate willingness to accept more risk for potentially higher returns.",
                    "Your preference for property-based investments like real estate, REITs, and property funds. Higher scores indicate strong property allocation preference.",
                    "Your openness to alternative investments like private equity, hedge funds, commodities, and cryptocurrency. Higher scores indicate greater appetite for non-traditional assets.",
                    "How much you prioritize tax-efficient investing through ISAs, pensions, EIS/SEIS, and other tax wrappers. Higher scores indicate strong tax optimization focus.",
                    "Your preference for income-generating vs growth investments. Higher scores indicate preference for dividends, bonds, and regular income streams.",
                    "Your investment time horizon and legacy planning considerations. Higher scores indicate longer-term outlook and intergenerational wealth planning.",
                    "How much cash and easily accessible investments you prefer to maintain. Higher scores indicate preference for readily available funds.",
                    "How much you rely on professional financial advice vs independent decision-making. Higher scores indicate preference for advisor-guided investing."
                  ];
                  return explanations[dimensionIndex] || "Investment dimension explanation";
                };
                
                return (
                  <div 
                    key={index} 
                    className="relative text-center p-4 bg-gradient-to-br from-[var(--card)] to-[var(--muted)]/10 rounded-xl border-2 border-[var(--border)]/30 hover:border-[var(--primary)]/40 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                  >
                    {/* Progress Ring Background */}
                    <div className="absolute inset-0 rounded-xl opacity-10" 
                         style={{ 
                           background: `conic-gradient(${getScoreColor(score)} ${percentage}%, var(--muted) ${percentage}%)` 
                         }}>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <div className="text-xs font-semibold text-[var(--muted-foreground)] leading-tight">
                          {dimensionLabels[index]}
                        </div>
                        <Info className="h-3 w-3 text-[var(--muted-foreground)]" />
                      </div>
                      <div 
                        className="text-2xl font-bold mb-1"
                        style={{ color: getScoreColor(score) }}
                      >
                        {score.toFixed(1)}
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)] font-medium">
                        / 5.0
                      </div>
                      
                      {/* Mini progress bar */}
                      <div className="w-full bg-[var(--border)] rounded-full h-1.5 mt-2">
                        <div 
                          className="h-1.5 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: getScoreColor(score)
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            </TooltipProvider>
          </CardContent>
        </Card>

        {/* Analysis Deep Dive */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Aligned Dimensions */}
          <Card className="border border-[var(--success)]/20 bg-gradient-to-br from-[var(--success)]/5 to-transparent shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-[var(--success)]">
                <CheckCircle className="h-5 w-5" />
                Strong Alignment
              </CardTitle>
              <CardDescription>
                These dimensions match your persona well
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.alignedDimensions.map((dimension, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-[var(--success)]/5 rounded-lg border border-[var(--success)]/10">
                    <div className="w-2 h-2 bg-[var(--success)] rounded-full"></div>
                    <span className="text-[var(--foreground)] font-medium">{dimension}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notable Differences */}
          {result.notableDifferences.length > 0 && (
            <Card className="border border-[var(--warning)]/20 bg-gradient-to-br from-[var(--warning)]/5 to-transparent shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-[var(--warning)]">
                  <AlertTriangle className="h-5 w-5" />
                  Areas of Difference
                </CardTitle>
                <CardDescription>
                  Where you might differ from the typical persona
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.notableDifferences.map((dimension, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-[var(--warning)]/5 rounded-lg border border-[var(--warning)]/10">
                      <div className="w-2 h-2 bg-[var(--warning)] rounded-full"></div>
                      <span className="text-[var(--foreground)] font-medium">{dimension}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Alternative Persona Selection */}
        <Card className="border border-[var(--border)] shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-[var(--foreground)]">
              <Users className="h-5 w-5 text-[var(--secondary)]" />
              Don't Agree? Choose Your Persona
            </CardTitle>
            <CardDescription>
              Browse all 19 investment personas and select one that better matches your style
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {Object.values(INVESTMENT_PERSONAS).map((persona) => {
                const isMatchedPersona = result.topMatch.persona.code === persona.code;
                const isSelected = selectedPersona?.code === persona.code;
                
                return (
                  <div
                    key={persona.code}
                    onClick={() => setSelectedPersona(persona)}
                    className={`relative cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                      isMatchedPersona ? 'transform scale-110' : ''
                    } ${
                      isSelected
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10 shadow-lg border-2 p-4 rounded-xl'
                        : isMatchedPersona
                          ? 'border-[var(--secondary)] bg-gradient-to-br from-[var(--secondary)]/20 to-[var(--accent)]/10 shadow-xl border-4 p-4 rounded-xl ring-2 ring-[var(--secondary)]/30'
                          : 'border-[var(--border)] hover:border-[var(--accent)] bg-[var(--card)] border-2 p-4 rounded-xl'
                    }`}
                    data-testid={`persona-card-${persona.code}`}
                  >
                    {/* Quiz Match Badge - Always visible for matched persona */}
                    {isMatchedPersona && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="bg-gradient-to-r from-[var(--secondary)] to-[var(--accent)] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          QUIZ MATCH
                        </div>
                      </div>
                    )}
                    
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 bg-[var(--primary)] text-white rounded-full p-1 z-10">
                        <CheckCircle className="h-3 w-3" />
                      </div>
                    )}
                    
                    <div className={`space-y-2 ${isMatchedPersona ? 'pt-4' : ''}`}>
                      <div className={`text-xs font-bold ${isMatchedPersona ? 'text-[var(--secondary)]' : 'text-[var(--accent)]'}`}>
                        {persona.code}
                      </div>
                      <div className={`text-sm font-semibold leading-tight ${isMatchedPersona ? 'text-[var(--secondary)] font-bold' : 'text-[var(--foreground)]'}`}>
                        {persona.name}
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {persona.wealthTier}
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {persona.riskProfile}
                      </div>
                      <div className={`text-xs font-medium ${isMatchedPersona ? 'text-[var(--secondary)]' : 'text-[var(--accent)]'}`}>
                        £{(persona.portfolioValue / 1000).toFixed(0)}k
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {selectedPersona && (
              <div className="mt-6 p-4 bg-[var(--accent)]/10 rounded-xl border border-[var(--accent)]/20">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-[var(--primary)]" />
                  <span className="font-semibold text-[var(--foreground)]">Selected: {selectedPersona.name}</span>
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {selectedPersona.notes}
                </p>
                <button 
                  onClick={() => setSelectedPersona(null)}
                  className="mt-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  Clear selection to use quiz result
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card className="border border-[var(--border)] shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={resetQuiz}
                variant="outline"
                size="lg"
                className="flex items-center gap-2 px-8 py-4 text-lg border-2 border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all duration-300"
                data-testid="button-retake-quiz"
              >
                <RotateCcw className="h-5 w-5" />
                Take Quiz Again
              </Button>
              <Button 
                onClick={handleUsePersona}
                size="lg"
                className="flex items-center gap-2 px-8 py-4 text-lg bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] hover:from-[var(--primary)]/90 hover:to-[var(--secondary)]/90 transition-all duration-300 shadow-lg"
                data-testid="button-use-persona"
              >
                <Target className="h-5 w-5" />
                Use {selectedPersona ? selectedPersona.name : result.topMatch.persona.name}
              </Button>
            </div>
            
            <div className="mt-6 p-4 bg-[var(--accent)]/10 rounded-xl border border-[var(--accent)]/20">
              <p className="text-sm text-[var(--muted-foreground)] text-center flex items-center justify-center gap-2">
                <Target className="h-4 w-4 text-[var(--accent)]" />
                {selectedPersona 
                  ? `You've selected "${selectedPersona.name}" as your investment persona. This will be used to tailor recommendations.`
                  : 'This classification helps us tailor investment recommendations and educational content specifically for your profile.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Quiz Intro */}
      {currentQuestionIndex === 0 && (
        <Card className="border-2 border-[var(--border)] bg-gradient-to-br from-[var(--primary)]/5 to-[var(--secondary)]/5 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-[var(--primary)]">
              Discover Your Investment Persona
            </CardTitle>
            <CardDescription className="text-lg">
              Answer 10 questions to find your ideal investor profile from our 19 research-backed personas
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="bg-[var(--accent)]/10 rounded-lg p-4 border border-[var(--accent)]/20 mb-6">
              <p className="text-sm text-[var(--muted-foreground)]">
                Our 8-dimensional analysis covers Risk Tolerance, Property Exposure, Alternatives Orientation, 
                Tax Optimisation, Income Source Bias, Investment Horizon, Liquidity Preference, and Advisor Reliance.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quiz Question */}
      <Card className="border-2 border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] backdrop-blur-sm shadow-2xl transition-all duration-500">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="text-sm">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </Badge>
            <div className="flex gap-1">
              {Array.from({ length: totalQuestions }, (_, index) => (
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
            {currentQuestion?.text}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="max-w-3xl mx-auto">
            {/* Question Options */}
            <div className="space-y-4">
              {currentQuestion?.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-4 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--accent)]/5 transition-all duration-300 cursor-pointer"
                  onClick={() => answerQuestion(index)}
                  data-testid={`option-${index}`}
                >
                  <div className="w-4 h-4 rounded-full border-2 border-[var(--border)] bg-[var(--background)]"></div>
                  <label className="flex-1 text-base cursor-pointer">
                    {option.text}
                  </label>
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 max-w-2xl mx-auto">
              {canGoBack ? (
                <Button
                  onClick={goBack}
                  size="lg"
                  variant="outline"
                  className="px-6 py-4 text-lg border-2 border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--accent)]/10 transition-all duration-300"
                  data-testid="button-back"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back
                </Button>
              ) : (
                <div className="w-24" />
              )}
              
              <Button
                onClick={handleAutoComplete}
                size="lg"
                variant="outline"
                className="px-6 py-4 text-lg border-2 border-[var(--warning)] hover:border-[var(--warning)]/80 hover:bg-[var(--warning)]/10 transition-all duration-300 text-[var(--warning)]"
                data-testid="button-auto-complete"
              >
                <Zap className="mr-2 h-5 w-5" />
                Auto Complete
              </Button>
              
              <Button
                onClick={skipQuestion}
                size="lg"
                variant="outline"
                className="px-6 py-4 text-lg border-2 border-[var(--border)] hover:border-[var(--secondary)] hover:bg-[var(--accent)]/10 transition-all duration-300"
                data-testid="button-skip"
              >
                Skip
              </Button>
            </div>
          </div>
          
          {/* Progress Indicator */}
          <div className="mt-8">
            <div className="w-full bg-[var(--border)] rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-sm text-[var(--muted-foreground)] mt-2">
              {Math.round(progress)}% Complete
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BeliefQuestionnaireContent({ persona, onBack }: { persona: PersonaDef; onBack: () => void }) {
  const [showPortfolioView, setShowPortfolioView] = useState(false);
  const {
    currentQuestion,
    currentQuestionIndex,
    progress,
    isComplete,
    scenarioWeights,
    selectedScenarios,
    canGoBack,
    isLastQuestion,
    answerQuestion,
    goBack,
    resetQuestionnaire,
    autoCompleteQuestionnaire,
    toggleScenarioSelection,
    selectAllActiveScenarios,
    deselectAllScenarios,
    totalQuestions
  } = useBeliefQuestionnaire();

  const { 
    portfolioResult, 
    skipToNeutral 
  } = useAdditionalBeliefs();

  const handleShowPortfolio = () => {
    skipToNeutral(persona);
    setShowPortfolioView(true);
  };

  // Scroll to top when questionnaire is completed
  useEffect(() => {
    if (isComplete) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isComplete]);

  if (showPortfolioView && portfolioResult) {
    return (
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="text-center space-y-4">
          <Button 
            onClick={() => setShowPortfolioView(false)}
            variant="outline"
            size="sm"
            className="mb-4 text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <ArrowLeft className="h-4 w-4 mr-2 text-[var(--foreground)]" />
            Back to Scenario Selection
          </Button>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
              Portfolio Recommendations
            </h1>
            <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
              Based on your economic beliefs and persona constraints
            </p>
          </div>
        </div>
        
        {/* Persona & Scenarios Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Selected Persona */}
          <Card className="border-2 border-[var(--success)]/60 bg-gradient-to-br from-[var(--success)]/20 via-[var(--primary)]/15 to-[var(--accent)]/25 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="pb-3 bg-gradient-to-r from-[var(--success)]/10 to-transparent rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-[var(--foreground)] text-lg">
                <div className="p-1.5 rounded-full bg-[var(--success)]/20">
                  <User className="h-4 w-4 text-[var(--success)]" />
                </div>
                Selected Persona: {persona.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <p className="text-sm text-[var(--muted-foreground)]">{persona.notes}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-medium text-[var(--foreground)]">Wealth Tier:</span> {persona.wealthTier}
                </div>
                <div>
                  <span className="font-medium text-[var(--foreground)]">Liquidity:</span> {persona.liquidityMonths} months
                </div>
                <div>
                  <span className="font-medium text-[var(--foreground)]">Risk Tolerance:</span> {persona.concentrationTolerance}
                </div>
                <div>
                  <span className="font-medium text-[var(--foreground)]">Notes:</span> Active investor
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Economic Scenarios */}
          <Card className="border-2 border-[var(--info)]/60 bg-gradient-to-br from-[var(--info)]/20 via-[var(--secondary)]/15 to-[var(--warning)]/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="pb-3 bg-gradient-to-r from-[var(--info)]/10 to-transparent rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-[var(--foreground)] text-lg">
                <div className="p-1.5 rounded-full bg-[var(--info)]/20">
                  <BarChart3 className="h-4 w-4 text-[var(--info)]" />
                </div>
                Active Economic Scenarios
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <TooltipProvider>
                <div className="space-y-2">
                  {Array.from(selectedScenarios)
                    .map(scenario => {
                      const weight = scenarioWeights.find(w => w.scenario === scenario);
                      return (
                        <div key={scenario} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-[var(--foreground)]">
                              {SCENARIO_NAMES[scenario] || scenario}
                            </div>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3 w-3 text-[var(--muted-foreground)] hover:text-[var(--secondary)] cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="text-xs">
                                  {getScenarioDescription(scenario)}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="text-xs text-[var(--muted-foreground)]">
                            {weight ? `${(weight.normalizedWeight * 100).toFixed(1)}%` : '0%'}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </TooltipProvider>
              <div className="mt-2 pt-2 border-t border-[var(--border)]">
                <p className="text-xs text-[var(--muted-foreground)]">
                  Weights based on your economic beliefs responses
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <PortfolioDisplay
          baseAllocation={portfolioResult.baseAllocation}
          personaAdjustedAllocation={portfolioResult.personaAdjustedAllocation}
          scenarioName={SCENARIO_NAMES[portfolioResult.scenarioSelection.primary] || portfolioResult.scenarioSelection.primary}
          personaName={persona.name}
          explanations={portfolioResult.explanations}
        />
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="space-y-10">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
              Economic Scenario Beliefs
            </h1>
            <p className="text-xl text-[var(--muted-foreground)] max-w-3xl mx-auto">
              Your beliefs have been converted to scenario probability weights for stress testing
            </p>
          </div>
          
          {/* Persona Context */}
          <div className="max-w-2xl mx-auto p-6 bg-gradient-to-r from-[var(--accent)]/20 via-[var(--warning)]/10 to-[var(--accent)]/20 rounded-2xl border-2 border-[var(--accent)]/30 shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Target className="h-5 w-5 text-[var(--primary)]" />
              <span className="font-semibold text-[var(--foreground)]">Selected Persona: {persona.name}</span>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">{persona.notes}</p>
          </div>
        </div>

        {/* Scenario Weights Results */}
        <Card className="border-2 border-[var(--primary)]/30 bg-gradient-to-br from-[var(--card)] to-[var(--muted)]/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-2xl text-[var(--foreground)] flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-[var(--secondary)]" />
              Scenario Match % (relative to your answers)
            </CardTitle>
            <CardDescription>
              Based on your economic beliefs, here are the calculated scenario match percentages. Select scenarios for stress testing:
            </CardDescription>
            
            {/* Selection Controls */}
            <div className="flex flex-wrap gap-2 pt-4">
              <Button
                onClick={selectAllActiveScenarios}
                size="sm"
                variant="outline"
                className="text-xs border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/10"
                data-testid="button-select-all-active"
              >
                Select All Active
              </Button>
              <Button
                onClick={deselectAllScenarios}
                size="sm"
                variant="outline"
                className="text-xs border border-[var(--muted-foreground)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]/10"
                data-testid="button-deselect-all"
              >
                Deselect All
              </Button>
              <div className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {selectedScenarios.size} scenario{selectedScenarios.size !== 1 ? 's' : ''} selected
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scenarioWeights.slice(0, 8).map((item, index) => {
                const isSelected = selectedScenarios.has(item.scenario);
                return (
                  <div
                    key={item.scenario}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10 shadow-md'
                        : item.isMasked 
                          ? 'border-[var(--muted)] bg-[var(--muted)]/10 hover:border-[var(--primary)]/30' 
                          : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/50'
                    }`}
                    onClick={() => toggleScenarioSelection(item.scenario)}
                    data-testid={`scenario-${item.scenario}`}
                  >
                    {/* Selection Checkbox */}
                    <div className="flex-shrink-0">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                        isSelected
                          ? 'border-[var(--primary)] bg-[var(--primary)]'
                          : item.isMasked
                            ? 'border-[var(--muted)] bg-[var(--muted)]/20 hover:border-[var(--primary)]'
                            : 'border-[var(--border)] hover:border-[var(--primary)]'
                      }`}>
                        {isSelected && (
                          <CheckCircle className="h-3 w-3 text-white" />
                        )}
                      </div>
                    </div>

                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      isSelected
                        ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] ring-2 ring-[var(--primary)]/20'
                        : item.isMasked 
                          ? 'bg-[var(--muted)]' 
                          : 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-grow">
                      <div className="font-semibold text-[var(--foreground)] capitalize flex items-center gap-2">
                        {item.scenario.replace(/_/g, ' ')}
                        {item.isMasked && (
                          <span 
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-[var(--muted)] text-[var(--muted-foreground)] cursor-help"
                            title="No supporting answers for this scenario"
                          >
                            ⓘ Masked
                          </span>
                        )}
                        {isSelected && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-[var(--primary)] text-white">
                            Selected
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-[var(--muted-foreground)]">
                        Raw weight: {item.weight.toFixed(3)}
                        {item.isMasked && ' (below threshold)'}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className={`text-lg font-bold ${
                        item.isMasked ? 'text-[var(--muted-foreground)]' : 'text-[var(--foreground)]'
                      }`}>
                        {(item.normalizedWeight * 100).toFixed(1)}%
                      </div>
                      <div className="w-24 h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            isSelected
                              ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] shadow-sm'
                              : item.isMasked 
                                ? 'bg-[var(--muted)]' 
                                : 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]'
                          }`}
                          style={{ width: `${item.normalizedWeight * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-[var(--accent)]/10 rounded-xl border border-[var(--accent)]/20">
                <p className="text-sm text-[var(--muted-foreground)] text-center">
                  These scenario match percentages will be used to stress test portfolio performance across different economic conditions.
                </p>
              </div>
              
              {/* Configuration Display */}
              <details className="p-3 bg-[var(--muted)]/5 rounded-lg border border-[var(--border)]">
                <summary className="cursor-pointer text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                  Configuration Settings
                </summary>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-[var(--muted-foreground)]">
                  <div>Softmax Temperature: 0.5</div>
                  <div>Mean Centering: Enabled</div>
                  <div>Mask Threshold: 0.001</div>
                  <div>Display Cap: 80%</div>
                  <div className="col-span-2">Question Boosts: Energy Policy (1.3x), FX View (1.25x), Policy Support (1.2x)</div>
                </div>
              </details>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card className="border border-[var(--border)] shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={resetQuestionnaire}
                size="lg"
                variant="outline"
                className="flex items-center gap-2 px-6 py-4 text-lg border-2 border-[var(--border)] hover:border-[var(--muted-foreground)] transition-all duration-300"
                data-testid="button-retake-beliefs"
              >
                <RotateCcw className="h-5 w-5" />
                Retake Beliefs Quiz
              </Button>
              <Button 
                onClick={onBack}
                size="lg"
                variant="outline"
                className="flex items-center gap-2 px-6 py-4 text-lg border-2 border-[var(--border)] hover:border-[var(--muted-foreground)] transition-all duration-300"
                data-testid="button-back-to-persona"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Persona
              </Button>
              <PortfolioRecommendationsButton 
                persona={persona}
                selectedScenarios={Array.from(selectedScenarios)}
                scenarioWeights={scenarioWeights}
                onShowPortfolio={handleShowPortfolio}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">
            Economic Beliefs Assessment
          </h1>
          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
            Answer these questions about your economic outlook to generate scenario weights for stress testing
          </p>
        </div>
        
        {/* Persona Context */}
        <div className="max-w-xl mx-auto p-4 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 rounded-xl border border-[var(--border)]">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Target className="h-4 w-4 text-[var(--primary)]" />
            <span className="font-medium">Persona: {persona.name}</span>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <Card className="max-w-4xl mx-auto border border-[var(--border)] shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-[var(--foreground)]">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </CardTitle>
            <div className="text-sm text-[var(--muted-foreground)]">
              {Math.round(progress)}% complete
            </div>
          </div>
          <div className="w-full bg-[var(--muted)] rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Question */}
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold text-[var(--foreground)] leading-tight">
                {currentQuestion.text}
              </h2>
              <div className="text-sm text-[var(--muted-foreground)]">
                Scale: 1 (Strongly Disagree) → 5 (Strongly Agree)
              </div>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-5 gap-3 max-w-2xl mx-auto">
              {[1, 2, 3, 4, 5].map((value) => (
                <Button
                  key={value}
                  onClick={() => answerQuestion(value)}
                  size="lg"
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center gap-2 border-2 border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all duration-300"
                  data-testid={`answer-${value}`}
                >
                  <span className="text-2xl font-bold">{value}</span>
                  <span className="text-xs">
                    {value === 1 ? 'Strongly Disagree' :
                     value === 2 ? 'Disagree' :
                     value === 3 ? 'Neutral' :
                     value === 4 ? 'Agree' :
                     'Strongly Agree'}
                  </span>
                </Button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center max-w-2xl mx-auto pt-4">
              {canGoBack ? (
                <Button
                  onClick={goBack}
                  size="lg"
                  variant="outline"
                  className="px-6 py-3 border-2 border-[var(--border)] hover:border-[var(--muted-foreground)] transition-all duration-300"
                  data-testid="button-back"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              ) : (
                <Button
                  onClick={onBack}
                  size="lg"
                  variant="outline"
                  className="px-6 py-3 border-2 border-[var(--border)] hover:border-[var(--muted-foreground)] transition-all duration-300"
                  data-testid="button-back-to-persona"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Persona
                </Button>
              )}
              
              <div className="text-sm text-[var(--muted-foreground)]">
                {isLastQuestion ? 'Last Question!' : `${totalQuestions - currentQuestionIndex - 1} questions remaining`}
              </div>
            </div>

            {/* Auto Complete Button */}
            <div className="flex justify-center pt-6">
              <Button
                onClick={autoCompleteQuestionnaire}
                size="lg"
                variant="outline"
                className="px-6 py-4 text-lg border-2 border-[var(--warning)] hover:border-[var(--warning)]/80 hover:bg-[var(--warning)]/10 transition-all duration-300 text-[var(--warning)]"
                data-testid="button-auto-complete-beliefs"
              >
                <Zap className="mr-2 h-5 w-5" />
                Auto Complete Assessment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
