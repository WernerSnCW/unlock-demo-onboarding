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
import { TrendingUp, Shield, Target, Lightbulb, BookOpen, DollarSign, AlertTriangle, Users, Globe, User, Heart, Clock, HelpCircle, Sparkles, Settings, Droplets, Brain } from 'lucide-react';
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

export default function InvestorPreferences() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();

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
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Preferences Saved",
        description: "Your investment preferences have been successfully updated.",
      });
      
      // Navigate back to demo agenda after a brief delay
      setTimeout(() => {
        setLocation('/demo/agenda');
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
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="profile">
            <div className="space-y-8">
              {/* Experience Level */}
              <Card className="border-2 border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] backdrop-blur-sm shadow-2xl hover:shadow-[var(--primary)]/10 transition-all duration-500 hover:scale-[1.01]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <BookOpen className="h-5 w-5 text-[var(--primary)]" />
                    Investment Experience
                  </CardTitle>
                  <CardDescription>
                    How would you describe your investment experience?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="cursor-pointer rounded-xl border-2 border-[var(--border)] p-6 hover:border-[var(--primary)] transition-all hover:bg-[var(--accent)]/5">
                      <div className="space-y-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-lg">Beginner</h3>
                        <p className="text-sm text-[var(--muted-foreground)]">New to investing, learning the basics</p>
                      </div>
                    </div>
                    <div className="cursor-pointer rounded-xl border-2 border-[var(--border)] p-6 hover:border-[var(--primary)] transition-all hover:bg-[var(--accent)]/5">
                      <div className="space-y-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                          <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-lg">Intermediate</h3>
                        <p className="text-sm text-[var(--muted-foreground)]">Some experience with stocks, bonds, or funds</p>
                      </div>
                    </div>
                    <div className="cursor-pointer rounded-xl border-2 border-[var(--border)] p-6 hover:border-[var(--primary)] transition-all hover:bg-[var(--accent)]/5">
                      <div className="space-y-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
                          <Target className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-lg">Advanced</h3>
                        <p className="text-sm text-[var(--muted-foreground)]">Experienced with complex strategies and analysis</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Investment Motivation */}
              <Card className="border-2 border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] backdrop-blur-sm shadow-2xl hover:shadow-[var(--primary)]/10 transition-all duration-500 hover:scale-[1.01]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Heart className="h-5 w-5 text-red-600" />
                    What Motivates Your Investing?
                  </CardTitle>
                  <CardDescription>
                    Select your primary motivation for investing (choose one)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="cursor-pointer rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-300 transition-all hover:bg-blue-50 dark:hover:bg-blue-950/20">
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <div>
                          <h4 className="font-medium">Building wealth for retirement</h4>
                          <p className="text-sm text-[var(--muted-foreground)]">Long-term financial security and independence</p>
                        </div>
                      </div>
                    </div>
                    <div className="cursor-pointer rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-300 transition-all hover:bg-blue-50 dark:hover:bg-blue-950/20">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium">Supporting family goals</h4>
                          <p className="text-sm text-[var(--muted-foreground)]">Education, home purchase, or family expenses</p>
                        </div>
                      </div>
                    </div>
                    <div className="cursor-pointer rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-300 transition-all hover:bg-blue-50 dark:hover:bg-blue-950/20">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                        <div>
                          <h4 className="font-medium">Growing current wealth</h4>
                          <p className="text-sm text-[var(--muted-foreground)]">Maximizing returns on existing capital</p>
                        </div>
                      </div>
                    </div>
                    <div className="cursor-pointer rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-300 transition-all hover:bg-blue-50 dark:hover:bg-blue-950/20">
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-orange-600" />
                        <div>
                          <h4 className="font-medium">Making a positive impact</h4>
                          <p className="text-sm text-[var(--muted-foreground)]">ESG investing and sustainable businesses</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Scenario */}
              <Card className="border-2 border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] backdrop-blur-sm shadow-2xl hover:shadow-[var(--primary)]/10 transition-all duration-500 hover:scale-[1.01]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Risk Scenario
                  </CardTitle>
                  <CardDescription>
                    Your investment portfolio drops 20% in value during a market downturn. What would you do?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="cursor-pointer rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-300 transition-all hover:bg-blue-50 dark:hover:bg-blue-950/20">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-red-600" />
                        <div>
                          <h4 className="font-medium">Sell everything immediately</h4>
                          <p className="text-sm text-[var(--muted-foreground)]">Protect remaining capital at all costs</p>
                        </div>
                      </div>
                    </div>
                    <div className="cursor-pointer rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-300 transition-all hover:bg-blue-50 dark:hover:bg-blue-950/20">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-yellow-600" />
                        <div>
                          <h4 className="font-medium">Wait and monitor closely</h4>
                          <p className="text-sm text-[var(--muted-foreground)]">Hold positions but watch for further declines</p>
                        </div>
                      </div>
                    </div>
                    <div className="cursor-pointer rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-300 transition-all hover:bg-blue-50 dark:hover:bg-blue-950/20">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <div>
                          <h4 className="font-medium">Buy more at lower prices</h4>
                          <p className="text-sm text-[var(--muted-foreground)]">See it as an opportunity to invest more</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Time Preference */}
              <Card className="border-2 border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] backdrop-blur-sm shadow-2xl hover:shadow-[var(--primary)]/10 transition-all duration-500 hover:scale-[1.01]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Investment Time Horizon
                  </CardTitle>
                  <CardDescription>
                    When do you expect to need access to your investment funds?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="cursor-pointer rounded-xl border-2 border-[var(--border)] p-6 hover:border-[var(--primary)] transition-all hover:bg-[var(--accent)]/5">
                      <div className="space-y-3 text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto">
                          <Clock className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-lg">0-3 Years</h3>
                        <p className="text-sm text-[var(--muted-foreground)]">Short-term goals and needs</p>
                      </div>
                    </div>
                    <div className="cursor-pointer rounded-xl border-2 border-[var(--border)] p-6 hover:border-[var(--primary)] transition-all hover:bg-[var(--accent)]/5">
                      <div className="space-y-3 text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto">
                          <Clock className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-lg">3-10 Years</h3>
                        <p className="text-sm text-[var(--muted-foreground)]">Medium-term planning</p>
                      </div>
                    </div>
                    <div className="cursor-pointer rounded-xl border-2 border-[var(--border)] p-6 hover:border-[var(--primary)] transition-all hover:bg-[var(--accent)]/5">
                      <div className="space-y-3 text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto">
                          <Clock className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-lg">10+ Years</h3>
                        <p className="text-sm text-[var(--muted-foreground)]">Long-term wealth building</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Results Action */}
              <div className="text-center pt-6">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl p-8 mb-6">
                  <User className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Create Your Investment Profile</h3>
                  <p className="text-[var(--muted-foreground)] mb-6 max-w-md mx-auto">
                    Based on your answers, we'll create a personalized investment profile with tailored recommendations.
                  </p>
                  <Button size="lg" className="px-12 py-6 text-lg bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] hover:from-[var(--primary)]/90 hover:to-[var(--secondary)]/90">
                    <Lightbulb className="mr-2 h-5 w-5" />
                    Generate My Profile
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}