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
import { TrendingUp, Shield, Target, Lightbulb, BookOpen, DollarSign, AlertTriangle, Users, Globe, User, Heart, Clock, HelpCircle } from 'lucide-react';
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
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-4xl mx-auto p-6 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Target className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Investment Preferences
            </h1>
          </div>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Help us understand your investment objectives, risk profile, and areas of interest to provide personalized insights and recommendations.
          </p>
        </div>

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
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Target className="h-6 w-6 text-blue-600" />
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
                                  <div className="cursor-pointer rounded-xl border-2 border-slate-200 dark:border-slate-700 p-6 hover:border-blue-300 transition-all">
                                    <div className="space-y-3">
                                      <Icon className={`h-8 w-8 ${objective.color}`} />
                                      <h3 className="font-semibold text-lg">{objective.title}</h3>
                                      <p className="text-sm text-slate-600 dark:text-slate-400">{objective.description}</p>
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
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
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
                                <div className="cursor-pointer rounded-lg border-2 border-slate-200 dark:border-slate-700 p-4 hover:border-amber-300 transition-all">
                                  <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                      <h3 className="font-semibold">{profile.title}</h3>
                                      <p className="text-sm text-slate-600 dark:text-slate-400">{profile.description}</p>
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

            {/* Investment Interests */}
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
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
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
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
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
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
                className="px-12 py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Investment Experience
                  </CardTitle>
                  <CardDescription>
                    How would you describe your investment experience?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="cursor-pointer rounded-xl border-2 border-slate-200 dark:border-slate-700 p-6 hover:border-blue-300 transition-all hover:bg-blue-50 dark:hover:bg-blue-950/20">
                      <div className="space-y-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-lg">Beginner</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">New to investing, learning the basics</p>
                      </div>
                    </div>
                    <div className="cursor-pointer rounded-xl border-2 border-slate-200 dark:border-slate-700 p-6 hover:border-blue-300 transition-all hover:bg-blue-50 dark:hover:bg-blue-950/20">
                      <div className="space-y-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                          <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-lg">Intermediate</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Some experience with stocks, bonds, or funds</p>
                      </div>
                    </div>
                    <div className="cursor-pointer rounded-xl border-2 border-slate-200 dark:border-slate-700 p-6 hover:border-blue-300 transition-all hover:bg-blue-50 dark:hover:bg-blue-950/20">
                      <div className="space-y-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
                          <Target className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-lg">Advanced</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Experienced with complex strategies and analysis</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Investment Motivation */}
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
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
                          <p className="text-sm text-slate-600 dark:text-slate-400">Long-term financial security and independence</p>
                        </div>
                      </div>
                    </div>
                    <div className="cursor-pointer rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-300 transition-all hover:bg-blue-50 dark:hover:bg-blue-950/20">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium">Supporting family goals</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Education, home purchase, or family expenses</p>
                        </div>
                      </div>
                    </div>
                    <div className="cursor-pointer rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-300 transition-all hover:bg-blue-50 dark:hover:bg-blue-950/20">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                        <div>
                          <h4 className="font-medium">Growing current wealth</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Maximizing returns on existing capital</p>
                        </div>
                      </div>
                    </div>
                    <div className="cursor-pointer rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-300 transition-all hover:bg-blue-50 dark:hover:bg-blue-950/20">
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-orange-600" />
                        <div>
                          <h4 className="font-medium">Making a positive impact</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">ESG investing and sustainable businesses</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Scenario */}
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
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
                          <p className="text-sm text-slate-600 dark:text-slate-400">Protect remaining capital at all costs</p>
                        </div>
                      </div>
                    </div>
                    <div className="cursor-pointer rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-300 transition-all hover:bg-blue-50 dark:hover:bg-blue-950/20">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-yellow-600" />
                        <div>
                          <h4 className="font-medium">Wait and monitor closely</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Hold positions but watch for further declines</p>
                        </div>
                      </div>
                    </div>
                    <div className="cursor-pointer rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-300 transition-all hover:bg-blue-50 dark:hover:bg-blue-950/20">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <div>
                          <h4 className="font-medium">Buy more at lower prices</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">See it as an opportunity to invest more</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Time Preference */}
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
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
                    <div className="cursor-pointer rounded-xl border-2 border-slate-200 dark:border-slate-700 p-6 hover:border-blue-300 transition-all hover:bg-blue-50 dark:hover:bg-blue-950/20">
                      <div className="space-y-3 text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto">
                          <Clock className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-lg">0-3 Years</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Short-term goals and needs</p>
                      </div>
                    </div>
                    <div className="cursor-pointer rounded-xl border-2 border-slate-200 dark:border-slate-700 p-6 hover:border-blue-300 transition-all hover:bg-blue-50 dark:hover:bg-blue-950/20">
                      <div className="space-y-3 text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto">
                          <Clock className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-lg">3-10 Years</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Medium-term planning</p>
                      </div>
                    </div>
                    <div className="cursor-pointer rounded-xl border-2 border-slate-200 dark:border-slate-700 p-6 hover:border-blue-300 transition-all hover:bg-blue-50 dark:hover:bg-blue-950/20">
                      <div className="space-y-3 text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto">
                          <Clock className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-lg">10+ Years</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Long-term wealth building</p>
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
                  <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                    Based on your answers, we'll create a personalized investment profile with tailored recommendations.
                  </p>
                  <Button size="lg" className="px-12 py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
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