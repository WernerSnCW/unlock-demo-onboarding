import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Target, ChevronLeft, ChevronRight, User, Save, CheckCircle, Sparkles, BookOpen, Globe, TrendingUp, BarChart3, ArrowLeft, ArrowRight, Zap, RotateCcw, Shield, Brain, Droplets, Lightbulb, AlertTriangle, Users, Info, DollarSign, ArrowUp, ArrowDown, Activity, AlertCircle, PiggyBank, Play, Pause, Download, PieChart as PieChartIcon, ListChecks, Plus, Minus, TrendingDown, Calculator, ChevronDown, Calendar, Database } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { usePersonaQuiz } from '@/hooks/usePersonaQuiz';
import { useBeliefQuestionnaire } from '@/hooks/useBeliefQuestionnaire';
import { useAdditionalBeliefs } from '@/hooks/useAdditionalBeliefs';
import beliefsData from '@/data/beliefs.json';
import ToolkitModal from '../components/ToolkitModal';

// Types for beliefs data
interface BeliefsData {
  questions: BeliefQuestion[];
  weights: Record<string, Record<string, number>>;
  normalize: string;
}

interface BeliefQuestion {
  id: string;
  text: string;
  scale: string;
  direction: string;
}
import { PortfolioDisplay } from '@/components/PortfolioDisplay';
import { DIMENSION_LABELS, INVESTMENT_PERSONAS, type PersonaDef } from '@/data/personas';
import { PERSONA_DEFAULTS, type AssetBucket, type Mix } from '@/data/personaDefaults';
import { type BeliefQuestionData, SCENARIO_NAMES } from '@/data/beliefQuestions';
import PersonaShowcase from '@/components/PersonaShowcase';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Gap Analysis Types
interface GapRow {
  bucket: string;
  currentPct: number;
  targetPct: number;
  deltaPct: number;
  flags: string[];
}

interface GapResponse {
  rows: GapRow[];
  totals: {
    absGapSum: number;
    cashBillsNow: number;
    cashBillsTarget: number;
  };
  headlineFlags: string[];
}
// Context import removed - will get persona from props/state

// Schema for each step
const investorNameSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters')
});

const step1Schema = z.object({
  activeInvestmentInterests: z.array(z.string()).min(1, 'Please select at least one investment interest')
});

const step2Schema = z.object({
  learningCuriosityAreas: z.array(z.string()).min(1, 'Please select at least one area of curiosity')
});

const step3Schema = z.object({
  geographicPreferences: z.array(z.string()).min(1, 'Please select at least one geographic preference')
});

type InvestorNameData = z.infer<typeof investorNameSchema>;
type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;

// Investment interests data matching the images
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

// Learning areas data
const learningAreas = [
  'Market Analysis & Research', 'Financial Statement Analysis', 'Valuation Methods',
  'Portfolio Diversification', 'Alternative Investment Strategies', 'Tax Optimization Strategies',
  'Real Estate Investment Analysis', 'Options & Derivatives', 'Cryptocurrency Fundamentals',
  'Behavioral Finance', 'Pension Planning', 'Private Equity Structures',
  'Technical Analysis', 'Insurance Products', 'ESG Investment Principles',
  'Venture Capital Ecosystem', 'International Markets', 'Economic Indicators',
  'Risk Management', 'Robo-Advisory Platforms', 'DIY Investment Platforms',
  'Retirement Strategies', 'Regulatory Environment', 'Estate Planning',
  'Fundamental Analysis', 'Investment Psychology'
];

// Geographic regions
const geographicRegions = [
  'United Kingdom', 'European Union', 'United States', 'Canada',
  'Asia-Pacific', 'Japan', 'China', 'India',
  'Southeast Asia', 'Latin America', 'Middle East', 'Africa',
  'Australia', 'Nordic Countries', 'Switzerland', 'Emerging Markets',
  'Frontier Markets', 'Global Diversified'
];

const steps = [
  { id: 1, title: 'Investment Interests', subtitle: 'Active Investment Interests' },
  { id: 2, title: 'Learning Areas', subtitle: 'Learning & Curiosity Areas' },
  { id: 3, title: 'Geographic Focus', subtitle: 'Geographic Preferences' }
];

const mainTabs = [
  { id: 'preferences', title: 'Investor Personas', icon: Target, description: 'Our methodology to identify and explore 19 unique investor personas' },
  { id: 'profile', title: 'Investment Profile Discovery', icon: User, description: 'Discover your investment personality through assessment' },
  { id: 'beliefs', title: 'Economic Beliefs', icon: Brain, description: 'Share your economic outlook for personalized strategy' },
  { id: 'analysis', title: 'Portfolio Analysis', icon: BarChart3, description: 'Comprehensive analysis of your current holdings and performance' },
  { id: 'strategy', title: 'Portfolio Recommendations', icon: TrendingUp, description: 'AI-powered investment strategy tailored to your preferences' },
  { id: 'action', title: 'Action Plan', icon: CheckCircle, description: 'Prioritized action steps to optimize your investment portfolio' }
];

export default function InvestorPreferencesWizard() {
  const [activeMainTab, setActiveMainTab] = useState('preferences');
  const [currentStep, setCurrentStep] = useState(1);
  const [investorName, setInvestorName] = useState<string>('');
  const [showNameDialog, setShowNameDialog] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isAutoCompleted, setIsAutoCompleted] = useState<boolean>(false);
  const [showBeliefQuestionnaire, setShowBeliefQuestionnaire] = useState<boolean>(false);
  const [userId] = useState<string>(() => `demo-${Date.now()}`);
  const { toast } = useToast();

  // Form for investor name
  const nameForm = useForm<InvestorNameData>({
    resolver: zodResolver(investorNameSchema),
    defaultValues: { name: '' }
  });

  // Forms for each step
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { activeInvestmentInterests: [] }
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: { learningCuriosityAreas: [] }
  });

  const step3Form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: { geographicPreferences: [] }
  });

  const handleNameSubmit = (data: InvestorNameData) => {
    setInvestorName(data.name);
    setShowNameDialog(false);
    toast({
      title: "Welcome!",
      description: `Let's configure your investment preferences, ${data.name}.`,
    });
  };

  const saveStep = async (stepNumber: number, data: any) => {
    try {
      // TODO: Implement actual API call to save data
      console.log(`Saving step ${stepNumber} for investor ${investorName}:`, data);
      
      setCompletedSteps(prev => new Set([...Array.from(prev), stepNumber]));
      
      toast({
        title: "Progress Saved",
        description: `Step ${stepNumber} preferences saved successfully.`,
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Unable to save preferences. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleStep1Submit = async (data: Step1Data) => {
    const saved = await saveStep(1, data);
    if (saved) {
      setCurrentStep(2);
    }
  };

  const handleStep2Submit = async (data: Step2Data) => {
    const saved = await saveStep(2, data);
    if (saved) {
      setCurrentStep(3);
    }
  };

  const handleStep3Submit = async (data: Step3Data) => {
    const saved = await saveStep(3, data);
    if (saved) {
      // Save complete investment preferences against investor name
      const completePreferences = {
        investorName,
        activeInvestmentInterests: step1Form.getValues().activeInvestmentInterests,
        learningCuriosityAreas: step2Form.getValues().learningCuriosityAreas,
        geographicPreferences: data.geographicPreferences,
        completedAt: new Date().toISOString(),
        completionMethod: isAutoCompleted ? 'auto' : 'manual' // Track completion method
      };
      
      try {
        // Save complete investment preferences via API
        const response = await fetch('/api/investors/wizard-preferences', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(completePreferences),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();
        console.log('Wizard preferences saved successfully:', result);
        
        // Mark all steps as completed
        setCompletedSteps(new Set([1, 2, 3]));
        
        // Navigate to Investment Profile Discovery (main tab 2)
        setActiveMainTab('profile');
        
        toast({
          title: "Investment Preferences Complete!",
          description: `All preferences saved for ${investorName}. Moving to Investment Profile Discovery.`,
        });
        
      } catch (error) {
        console.error('Save error:', error);
        toast({
          title: "Save Error",
          description: "Failed to save complete preferences. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleAutoCapture = () => {
    // Auto-fill all three steps with sample data
    step1Form.setValue('activeInvestmentInterests', [
      'Venture Capital', 'Angel Investing', 'Cryptocurrency', 
      'AI & Technology', 'EIS/SEIS Opportunities', 'Private Equity',
      'Real Estate Investment', 'Green Energy'
    ]);
    
    step2Form.setValue('learningCuriosityAreas', [
      'Market Analysis & Research', 'Venture Capital Ecosystem', 
      'Risk Management', 'Cryptocurrency Fundamentals', 'Valuation Methods',
      'Portfolio Diversification', 'ESG Investment Principles'
    ]);
    
    step3Form.setValue('geographicPreferences', [
      'United Kingdom', 'United States', 'European Union', 
      'Global Diversified', 'Emerging Markets'
    ]);
    
    // Mark steps 1 and 2 as completed and navigate to step 3
    setCompletedSteps(new Set([1, 2]));
    setCurrentStep(3);
    
    // Track that auto-complete was used
    setIsAutoCompleted(true);
    
    toast({
      title: "Demo Preferences Auto-Captured!",
      description: "Sample preferences filled and navigated to final step.",
    });
  };

  const goToStep = (step: number) => {
    if (step <= currentStep || completedSteps.has(step - 1)) {
      setCurrentStep(step);
    }
  };

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

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
        <div className="relative overflow-hidden py-8">
            {/* Dynamic Background Mesh */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] via-transparent to-[var(--secondary)] opacity-10"></div>
              <div className="absolute inset-0 bg-gradient-to-tl from-[var(--accent)] via-transparent to-[var(--warning)] opacity-5"></div>
            </div>
          
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Floating Icon with Glow Effect */}
            <div className="flex items-center justify-center mb-4 relative">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-full p-4 group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-8 w-8" />
                </div>
                <div className="absolute -top-2 -right-2 animate-bounce">
                  <Sparkles className="h-6 w-6 text-[var(--accent)] fill-current" />
                </div>
              </div>
            </div>

            {/* Revolutionary Typography - Dynamic Header */}
            <h1 className="relative mb-4">
              {(() => {
                // Determine which tab is currently active - if beliefs questionnaire is shown, use 'beliefs'
                const currentTabId = showBeliefQuestionnaire ? 'beliefs' : activeMainTab;
                const currentTab = mainTabs.find(tab => tab.id === currentTabId);
                const titleParts = currentTab?.title.split(' ') || ['Investment', 'Preferences'];
                const firstPart = titleParts.slice(0, -1).join(' ');
                const lastPart = titleParts[titleParts.length - 1];
                
                return (
                  <>
                    <span className="block text-lg md:text-2xl font-light text-[var(--muted-foreground)] tracking-wider uppercase mb-1">
                      {firstPart}
                    </span>
                    <span className="block text-3xl md:text-5xl font-black bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] bg-clip-text text-transparent leading-none tracking-tight">
                      {lastPart.toUpperCase()}
                    </span>
                  </>
                );
              })()}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent"></div>
            </h1>

            <p className="text-base md:text-lg text-[var(--muted-foreground)] max-w-4xl mx-auto mb-6 leading-relaxed font-light">
              Configure your investment profile through 
              <span className="text-[var(--primary)] font-semibold"> detailed preferences</span> or 
              <span className="text-[var(--secondary)] font-semibold"> discover your investment personality</span>
            </p>

            {investorName && (
              <div className="mt-6">
                <Badge variant="secondary" className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white border-0 shadow-lg">
                  {investorName}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Investor Name Dialog */}
        <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <User className="w-5 h-5 text-green-600" />
                Investor Information
              </DialogTitle>
              <DialogDescription className="text-gray-700 dark:text-gray-300">
                Let's start by capturing your name for personalized investment preferences.
              </DialogDescription>
            </DialogHeader>
            <Form {...nameForm}>
              <form onSubmit={nameForm.handleSubmit(handleNameSubmit)} className="space-y-4">
                <FormField
                  control={nameForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-900 dark:text-gray-100 font-medium">Full Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your full name" 
                          className="text-gray-900 dark:text-gray-100"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Continue to Preferences
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Main Tab Navigation */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative">
          <Tabs value={showBeliefQuestionnaire ? 'beliefs' : activeMainTab} onValueChange={(value) => {
            if (value === 'beliefs') {
              setShowBeliefQuestionnaire(true);
              setActiveMainTab('beliefs'); // Also update activeMainTab for consistent header
            } else {
              setShowBeliefQuestionnaire(false);
              setActiveMainTab(value);
            }
          }} className="w-full">
            {/* Enhanced Tab Navigation */}
            <div className="mb-12">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                {mainTabs.map((tab, index) => {
                  const IconComponent = tab.icon;
                  // Fix: Check if beliefs questionnaire is shown for proper tab highlighting
                  const isActive = (showBeliefQuestionnaire && tab.id === 'beliefs') || (!showBeliefQuestionnaire && activeMainTab === tab.id);
                  
                  // Fix: Proper completion logic for each tab
                  let isCompleted = false;
                  if (tab.id === 'preferences') {
                    isCompleted = completedSteps.size > 0; // Card 1 completed when wizard steps done
                  } else if (tab.id === 'profile') {
                    // Card 2 completed when we're on Economic Beliefs (meaning quiz was finished)
                    isCompleted = showBeliefQuestionnaire;
                  } else if (tab.id === 'beliefs') {
                    // Card 3 completed when belief responses are saved (and we're on analysis)
                    isCompleted = activeMainTab === 'analysis';
                  } else if (tab.id === 'analysis') {
                    // Card 4 completed when we're on strategy tab (meaning analysis was done)
                    isCompleted = activeMainTab === 'strategy';
                  }
                  
                  return (
                    <button
                      key={tab.id}
                      data-tab={tab.id}
                      onClick={() => {
                        if (tab.id === 'beliefs') {
                          setShowBeliefQuestionnaire(true);
                          setActiveMainTab('beliefs');
                        } else {
                          setShowBeliefQuestionnaire(false);
                          setActiveMainTab(tab.id);
                        }
                      }}
                      className={`group relative bg-white dark:bg-gray-800 rounded-2xl p-6 text-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg border-2 ${
                        isActive 
                          ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 shadow-lg' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600'
                      }`}
                    >
                      {/* Step Number */}
                      <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isActive 
                          ? 'bg-green-500 text-white' 
                          : isCompleted 
                          ? 'bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-200'
                          : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {index + 1}
                      </div>
                      
                      {/* Icon */}
                      <div className={`mb-4 flex justify-center ${
                        isActive ? 'text-green-600' : 'text-gray-400 group-hover:text-green-500'
                      }`}>
                        <div className={`p-3 rounded-full transition-colors ${
                          isActive 
                            ? 'bg-green-100 dark:bg-green-800' 
                            : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-green-50 dark:group-hover:bg-green-900/20'
                        }`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                      </div>
                      
                      {/* Title */}
                      <h3 className={`font-semibold text-base mb-2 ${
                        isActive 
                          ? 'text-green-800 dark:text-green-200' 
                          : 'text-gray-700 dark:text-gray-200 group-hover:text-green-700 dark:group-hover:text-green-300'
                      }`}>
                        {tab.title}
                      </h3>
                      
                      {/* Description */}
                      <p className={`text-sm leading-tight ${
                        isActive 
                          ? 'text-green-600 dark:text-green-300' 
                          : 'text-gray-500 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400'
                      }`}>
                        {tab.description}
                      </p>
                      
                      {/* Active Indicator */}
                      {isActive && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                          <div className="w-4 h-4 bg-green-500 rounded-full border-4 border-white dark:border-gray-800"></div>
                        </div>
                      )}
                      
                      {/* Completed Badge */}
                      {isCompleted && !isActive && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              
              {/* Progress Connector Line */}
              <div className="hidden md:block relative mt-8">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700"></div>
                <div 
                  className="absolute top-0 left-0 h-0.5 bg-green-500 transition-all duration-500"
                  style={{ width: `${(mainTabs.findIndex(tab => tab.id === activeMainTab) / (mainTabs.length - 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Tab Content: Investor Personas */}
            <TabsContent value="preferences">
              <div className="max-w-7xl mx-auto px-6 py-8">
                <PersonaShowcase onNavigateNext={() => setActiveMainTab('profile')} />
              </div>
            </TabsContent>

            {/* Tab Content: Investment Profile Discovery */}
            <TabsContent value="profile">
              <div className="max-w-6xl mx-auto px-6 py-8">
                <PersonaQuizContentWizard 
                  investorName={investorName}
                  setShowBeliefQuestionnaire={setShowBeliefQuestionnaire}
                />
              </div>
            </TabsContent>

            {/* Tab Content: Portfolio Analysis */}
            <TabsContent value="analysis">
              <PersonalizedPortfolioAnalysis onTabChange={setActiveMainTab} />
            </TabsContent>

            {/* Tab Content: Investment Strategy */}
            <TabsContent value="strategy">
              <PortfolioRecommendations userId={userId} />
            </TabsContent>

            {/* Tab Content: Action Plan */}
            <TabsContent value="action">
              <ActionPlanComponent userId={userId} />
            </TabsContent>
            
            {/* Economic Beliefs Assessment Tab */}
            <TabsContent value="beliefs" className="mt-8">
              <div className="space-y-8">
                <BeliefQuestionnaireComponent 
                  setActiveMainTab={setActiveMainTab} 
                  setShowBeliefQuestionnaire={setShowBeliefQuestionnaire} 
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function PersonaQuizContentWizard({ 
  investorName, 
  setShowBeliefQuestionnaire 
}: { 
  investorName: string; 
  setShowBeliefQuestionnaire: (show: boolean) => void; 
}) {
  const [selectedPersona, setSelectedPersona] = useState<PersonaDef | null>(null);
  
  const [isAutoCompleted, setIsAutoCompleted] = useState(false); // Track auto completion
  const { toast } = useToast();
  
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
    dimensionLabels,
    answers // Add answers array from hook
  } = usePersonaQuiz();

  // Scroll to top when quiz is completed
  useEffect(() => {
    if (isComplete && result) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isComplete, result]);

  // Handle auto complete with scroll to top
  const handleAutoComplete = useCallback(() => {
    setIsAutoCompleted(true); // Mark as auto completed
    autoCompleteRandomly();
    // Small delay to ensure state update, then scroll
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }, [autoCompleteRandomly]);

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
                        <Popover>
                          <PopoverTrigger asChild>
                            <Info className="h-3 w-3 text-[var(--muted-foreground)] hover:text-[var(--primary)] cursor-pointer transition-colors" />
                          </PopoverTrigger>
                          <PopoverContent 
                            className="w-80 p-4 bg-white dark:bg-gray-900 border shadow-xl"
                            side="top"
                            align="center"
                            sideOffset={8}
                            style={{ zIndex: 999999 }}
                          >
                            <p className="text-sm leading-relaxed text-gray-900 dark:text-gray-100">
                              {getDimensionExplanation(index)}
                            </p>
                          </PopoverContent>
                        </Popover>
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
                        £{(persona.portfolioValue / 1000).toLocaleString()}K
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
                onClick={async () => {
                  // Save quiz data when persona is selected
                  const chosenPersona = selectedPersona || result.topMatch.persona;
                  const matchScore = selectedPersona ? 1.0 : result.topMatch.matchScore;
                  
                  try {
                    // Ensure we have a valid investor name (fallback if empty)
                    const validInvestorName = investorName || `Demo User ${Date.now()}`;
                    
                    // Prepare quiz data to save
                    const quizData = {
                      investorName: validInvestorName,
                      quizAnswers: answers, // Quiz answers from usePersonaQuiz hook
                      matchedPersonaCode: chosenPersona.code,
                      personaMatchScore: matchScore,
                      completionMethod: isAutoCompleted ? 'auto' : 'manual'
                    };

                    console.log('Saving quiz data:', quizData);

                    // Save quiz data to database
                    const response = await fetch('/api/investors/quiz-data', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(quizData),
                    });

                    if (!response.ok) {
                      throw new Error(`API error: ${response.status}`);
                    }

                    const result = await response.json();
                    console.log('Quiz data saved successfully:', result);
                    
                    // CRITICAL: Save quiz data to localStorage for Economic Beliefs component
                    // Include the userId from the API response
                    const quizDataWithUserId = {
                      ...quizData,
                      userId: result.userId
                    };
                    localStorage.setItem('investorQuizData', JSON.stringify(quizDataWithUserId));
                    
                    toast({
                      title: "Persona Selected!",
                      description: `Your investment persona (${chosenPersona.name}) has been saved successfully.`,
                    });

                    // Continue to next section
                    setShowBeliefQuestionnaire(true);
                    
                  } catch (error) {
                    console.error('Failed to save quiz data:', error);
                    toast({
                      title: "Save Failed",
                      description: "Unable to save persona selection. Please try again.",
                      variant: "destructive",
                    });
                  }
                }}
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

// Economic Beliefs Assessment Component  
function BeliefQuestionnaireComponent({ 
  setActiveMainTab,
  setShowBeliefQuestionnaire 
}: { 
  setActiveMainTab: (tab: string) => void;
  setShowBeliefQuestionnaire: (show: boolean) => void; 
}) {
  // Get the matched persona from stored quiz data
  const [matchedPersona, setMatchedPersona] = useState<PersonaDef | null>(null);

  // State for scenario selection interface (moved to top level to avoid hooks rule violation)
  const [selectedScenarios, setSelectedScenarios] = useState<Set<string>>(new Set());
  const [scenarioWeights, setScenarioWeights] = useState<any[]>([]);

  // Load matched persona from localStorage
  useEffect(() => {
    const storedQuizData = localStorage.getItem('investorQuizData');
    if (storedQuizData) {
      try {
        const quizData = JSON.parse(storedQuizData);
        if (quizData.matchedPersonaCode) {
          // Convert INVESTMENT_PERSONAS Record to array to find by code
          const personaArray = Object.values(INVESTMENT_PERSONAS);
          const persona = personaArray.find(p => p.code === quizData.matchedPersonaCode);
          setMatchedPersona(persona || null);
        }
      } catch (error) {
        console.error('Failed to load quiz data:', error);
      }
    }
  }, []);

  // Use sophisticated beliefs hook instead of basic one
  const beliefData = useAdditionalBeliefs();
  
  // Add safety check for undefined hook data
  if (!beliefData) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-[var(--warning)] mx-auto mb-4" />
            <p className="text-lg text-[var(--muted-foreground)]">
              Loading belief questionnaire...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    currentQuestion,
    currentQuestionIndex,
    progress,
    canGoBack,
    isComplete,
    responses,
    portfolioResult,
    answerQuestion,
    goBack,
    resetQuestionnaire,
    autoComplete,
    totalQuestions
  } = beliefData;

  const { toast } = useToast();

  // Calculate scenario weights from belief responses (moved to top level)
  useEffect(() => {
    if (isComplete && responses.length > 0) {
      // Calculate scenario scores from beliefs responses using weights from beliefs.json
      const typedBeliefsData = beliefsData as BeliefsData;
      const scenarioScores: Record<string, number> = {};
      
      responses.forEach(response => {
        const question = typedBeliefsData.questions.find((q: BeliefQuestion) => q.id === response.questionId);
        if (!question) return;
        
        const weights = typedBeliefsData.weights[response.questionId];
        if (!weights) return;
        
        // Convert 0-based index to 1-5 scale value
        const scaleValue = response.selectedOptionIndex + 1;
        
        // Apply weights based on the direction logic
        Object.entries(weights).forEach(([scenario, weight]) => {
          let contribution = 0;
          const weightValue = weight as number;
          
          // Parse direction to determine how scale value affects scenario
          if (question.direction.includes('lower->')) {
            // Lower values increase scenario probability
            contribution = weightValue * (6 - scaleValue); // Invert: 5->1, 4->2, etc.
          } else if (question.direction.includes('higher->')) {
            // Higher values increase scenario probability  
            contribution = weightValue * scaleValue;
          }
          
          scenarioScores[scenario] = (scenarioScores[scenario] || 0) + contribution;
        });
      });

      // Convert to scenario weights array and normalize
      const scenarioArray = Object.entries(scenarioScores).map(([scenario, score]) => ({
        scenario,
        weight: Math.max(0, score),
        normalizedWeight: 0, // Will be calculated below
        isMasked: false
      }));

      // Normalize weights to sum to 1
      const totalWeight = scenarioArray.reduce((sum, item) => sum + item.weight, 0);
      scenarioArray.forEach(item => {
        item.normalizedWeight = totalWeight > 0 ? item.weight / totalWeight : 0;
        item.isMasked = item.normalizedWeight < 0.01; // Mask scenarios below 1%
      });

      // Sort by normalized weight descending
      scenarioArray.sort((a, b) => b.normalizedWeight - a.normalizedWeight);
      
      setScenarioWeights(scenarioArray);
      
      // Auto-select top 3 non-masked scenarios
      const topScenarios = scenarioArray.filter(s => !s.isMasked).slice(0, 3);
      setSelectedScenarios(new Set(topScenarios.map(s => s.scenario)));
    }
  }, [isComplete, responses]);

  // Helper functions for scenario selection
  const selectAllActiveScenarios = useCallback(() => {
    const activeScenarios = scenarioWeights.filter(s => !s.isMasked).map(s => s.scenario);
    setSelectedScenarios(new Set(activeScenarios));
  }, [scenarioWeights]);

  const deselectAllScenarios = useCallback(() => {
    setSelectedScenarios(new Set());
  }, []);

  const toggleScenarioSelection = useCallback((scenario: string) => {
    const newSelection = new Set(selectedScenarios);
    if (newSelection.has(scenario)) {
      newSelection.delete(scenario);
    } else {
      newSelection.add(scenario);
    }
    setSelectedScenarios(newSelection);
  }, [selectedScenarios]);

  // Show loading if persona not loaded yet
  if (!matchedPersona) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg text-[var(--muted-foreground)]">
              Loading your investor profile...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isComplete && portfolioResult) {
    // Show Economic Scenario Beliefs interface with scenario selection
    // IMPORTANT: This should match the interface from the original /investor-preferences route

    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
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
                <span className="font-semibold text-[var(--foreground)]">Selected Persona: {matchedPersona.name}</span>
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">{matchedPersona.notes}</p>
            </div>
          </div>

          {/* Methodology Disclosure */}
          <Card className="border border-[var(--border)] bg-[var(--card)] shadow-lg">
            <Collapsible>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-[var(--muted)]/30 transition-colors">
                  <CardTitle className="text-xl text-[var(--foreground)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-[var(--primary)]" />
                      Methodology & Historical Precedents
                    </div>
                    <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                  </CardTitle>
                  <CardDescription>
                    View the formulas, historical data, and precedents used to predict economic scenarios
                  </CardDescription>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-6">
                    
                    {/* Mathematical Framework */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-[var(--foreground)] flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-[var(--secondary)]" />
                        Mathematical Framework
                      </h3>
                      <div className="bg-[var(--muted)]/20 p-4 rounded-lg border border-[var(--border)]">
                        <div className="space-y-3 text-sm">
                          <div>
                            <p className="font-medium text-[var(--foreground)] mb-2">Scenario Weight Calculation:</p>
                            <code className="bg-[var(--muted)] px-2 py-1 rounded text-xs">
                              Weight = Σ(Response × Question_Weight × Direction_Multiplier)
                            </code>
                          </div>
                          <div>
                            <p className="font-medium text-[var(--foreground)] mb-2">Normalization Formula:</p>
                            <code className="bg-[var(--muted)] px-2 py-1 rounded text-xs">
                              Normalized_Weight = Raw_Weight / Σ(All_Raw_Weights)
                            </code>
                          </div>
                          <div>
                            <p className="font-medium text-[var(--foreground)] mb-2">Direction Logic:</p>
                            <ul className="space-y-1 text-[var(--muted-foreground)] ml-4">
                              <li>• "higher→scenario": Weight × Response_Value (1-5)</li>
                              <li>• "lower→scenario": Weight × (6 - Response_Value)</li>
                              <li>• Minimum threshold: 1% for scenario inclusion</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Historical Precedents */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-[var(--foreground)] flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[var(--secondary)]" />
                        Historical Precedents & Data Sources
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-[var(--muted)]/20 p-4 rounded-lg border border-[var(--border)]">
                          <h4 className="font-semibold text-[var(--foreground)] mb-2">Economic Recessions</h4>
                          <ul className="text-sm text-[var(--muted-foreground)] space-y-1">
                            <li>• 1973-75: Oil Crisis (-3.9% GDP)</li>
                            <li>• 1979-81: Monetary Policy (-2.5% GDP)</li>
                            <li>• 1990-91: Poll Tax Recession (-2.4% GDP)</li>
                            <li>• 2008-09: Financial Crisis (-6.9% GDP)</li>
                            <li>• 2020: COVID-19 Pandemic (-11.0% GDP)</li>
                          </ul>
                        </div>
                        <div className="bg-[var(--muted)]/20 p-4 rounded-lg border border-[var(--border)]">
                          <h4 className="font-semibold text-[var(--foreground)] mb-2">Sterling Devaluations</h4>
                          <ul className="text-sm text-[var(--muted-foreground)] space-y-1">
                            <li>• 1967: Bretton Woods (-14.3% vs USD)</li>
                            <li>• 1976: IMF Crisis (-25% vs trade-weighted)</li>
                            <li>• 1992: Black Wednesday (-15% vs DEM)</li>
                            <li>• 2016: Brexit Vote (-18% vs USD)</li>
                            <li>• 2022: Mini-Budget Crisis (-8% vs USD)</li>
                          </ul>
                        </div>
                        <div className="bg-[var(--muted)]/20 p-4 rounded-lg border border-[var(--border)]">
                          <h4 className="font-semibold text-[var(--foreground)] mb-2">Gilt Selloffs</h4>
                          <ul className="text-sm text-[var(--muted-foreground)] space-y-1">
                            <li>• 1976: IMF Crisis (+400bp 10Y yields)</li>
                            <li>• 1994: Tightening Cycle (+300bp)</li>
                            <li>• 2022: LDI Crisis (+500bp in 6 months)</li>
                            <li>• Correlation: 0.73 with inflation surprises</li>
                          </ul>
                        </div>
                        <div className="bg-[var(--muted)]/20 p-4 rounded-lg border border-[var(--border)]">
                          <h4 className="font-semibold text-[var(--foreground)] mb-2">Property Corrections</h4>
                          <ul className="text-sm text-[var(--muted-foreground)] space-y-1">
                            <li>• 1989-1995: Peak-to-trough (-22%)</li>
                            <li>• 2007-2009: Financial crisis (-20%)</li>
                            <li>• Average cycle: 18 years peak-to-peak</li>
                            <li>• Regional variance: London ±5% vs national</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Data Sources */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-[var(--foreground)] flex items-center gap-2">
                        <Database className="h-4 w-4 text-[var(--secondary)]" />
                        Data Sources & Validation
                      </h3>
                      <div className="bg-[var(--muted)]/20 p-4 rounded-lg border border-[var(--border)]">
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-[var(--foreground)] mb-2">Economic Data:</p>
                            <ul className="text-[var(--muted-foreground)] space-y-1">
                              <li>• ONS National Accounts</li>
                              <li>• Bank of England Database</li>
                              <li>• FRED Economic Data</li>
                              <li>• IMF Historical Statistics</li>
                            </ul>
                          </div>
                          <div>
                            <p className="font-medium text-[var(--foreground)] mb-2">Market Data:</p>
                            <ul className="text-[var(--muted-foreground)] space-y-1">
                              <li>• Bloomberg Terminal</li>
                              <li>• Refinitiv Eikon</li>
                              <li>• FTSE Russell Indices</li>
                              <li>• Land Registry HPI</li>
                            </ul>
                          </div>
                          <div>
                            <p className="font-medium text-[var(--foreground)] mb-2">Validation:</p>
                            <ul className="text-[var(--muted-foreground)] space-y-1">
                              <li>• Out-of-sample testing (2019-2024)</li>
                              <li>• Cross-validation (5-fold)</li>
                              <li>• Regime-specific accuracy</li>
                              <li>• Monte Carlo bootstrapping</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Model Limitations */}
                    <div className="bg-amber-50/50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                      <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Model Limitations & Disclaimers
                      </h4>
                      <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                        <li>• Historical precedents may not predict future outcomes</li>
                        <li>• Model based on UK data since 1960 (limited emerging market exposure)</li>
                        <li>• Extreme tail events (&gt;3σ) may not be adequately captured</li>
                        <li>• Scenario probabilities are indicative, not predictive</li>
                        <li>• For educational and analytical purposes only</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

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
                  onClick={async () => {
                    try {
                      // Get the userId from stored quiz data to update existing record
                      const storedQuizData = localStorage.getItem('investorQuizData');
                      let userId = null;
                      let investorName = null;
                      
                      if (storedQuizData) {
                        try {
                          const quizData = JSON.parse(storedQuizData);
                          userId = quizData.userId;
                          investorName = quizData.investorName;
                        } catch (error) {
                          console.error('Failed to parse quiz data:', error);
                        }
                      }

                      if (!userId || !investorName) {
                        toast({
                          title: "Error",
                          description: "Session data not found. Please restart the wizard.",
                          variant: "destructive"
                        });
                        return;
                      }

                      // Save economic beliefs responses to backend
                      const beliefsData = {
                        userId: userId, // Use existing userId to update same record
                        investorName: investorName, // Use actual investor name, not persona name
                        beliefResponses: responses,
                        selectedScenarios: Array.from(selectedScenarios),
                        scenarioWeights: scenarioWeights,
                        completionMethod: responses.length === totalQuestions ? 'manual' : 'auto'
                      };

                      const response = await fetch('/api/investors/belief-responses', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(beliefsData),
                      });

                      if (response.ok) {
                        const result = await response.json();
                        console.log('Belief responses saved successfully:', result);
                        
                        // Navigate to Portfolio Analysis section by manually triggering the existing tab logic
                        console.log('Navigating to analysis tab...');
                        
                        // Trigger the same onValueChange logic that happens when user clicks a tab manually
                        const tabChangeHandler = (value: string) => {
                          if (value === 'beliefs') {
                            setShowBeliefQuestionnaire(true);
                            setActiveMainTab('beliefs');
                          } else {
                            setShowBeliefQuestionnaire(false);
                            setActiveMainTab(value);
                          }
                        };
                        
                        // Call the handler directly with 'analysis'
                        tabChangeHandler('analysis');
                        
                        console.log('Navigation completed successfully');
                        
                        // Show success message
                        toast({
                          title: "Economic Beliefs Saved",
                          description: `Selected ${selectedScenarios.size} scenarios for portfolio analysis`,
                        });
                        
                        console.log('Moving to Portfolio Analysis with data:', beliefsData);
                        
                      } else {
                        const errorData = await response.text();
                        throw new Error(`Failed to save belief responses: ${response.status} - ${errorData}`);
                      }
                    } catch (error) {
                      console.error('Error saving beliefs:', error);
                      toast({
                        title: "Error",
                        description: "Failed to save economic beliefs. Please try again.",
                        variant: "destructive"
                      });
                    }
                  }}
                  size="lg"
                  className="flex items-center gap-2 px-6 py-4 text-lg bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] hover:from-[var(--primary)]/90 hover:to-[var(--secondary)]/90 transition-all duration-300 shadow-lg"
                  data-testid="button-perform-portfolio-analysis"
                >
                  <Target className="h-5 w-5" />
                  Perform Portfolio Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-[var(--warning)] mx-auto mb-4" />
            <p className="text-lg text-[var(--muted-foreground)]">
              No belief questions available. Please try again later.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Reload Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Brain className="w-6 h-6 text-[var(--primary)]" />
            Economic Beliefs Assessment
          </CardTitle>
          <CardDescription className="text-base">
            Section 3: Share your views on economic trends to personalize your investment strategy.
          </CardDescription>
          
          {/* Question Counter */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-[var(--muted-foreground)]">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </div>
            <div className="text-sm text-[var(--muted-foreground)]">
              {Math.round(progress)}% Complete
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-2">
            <div className="w-full bg-[var(--muted)] rounded-full h-2">
              <div 
                className="bg-[var(--primary)] h-2 rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Question */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-6 text-center text-[var(--foreground)]">
              {currentQuestion.text || 'Question loading...'}
            </h3>
            
            {/* Options - Use actual question options */}
            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-4 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--accent)]/5 transition-all duration-300 cursor-pointer"
                  onClick={() => answerQuestion(index, matchedPersona)}
                  data-testid={`belief-option-${index}`}
                >
                  <div className="w-4 h-4 rounded-full border-2 border-[var(--border)] bg-[var(--background)]"></div>
                  <label className="flex-1 text-base cursor-pointer">
                    {option.text}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            {canGoBack ? (
              <Button
                onClick={goBack}
                size="lg"
                variant="outline"
                className="px-6 py-4 text-lg border-2 border-[var(--border)] hover:border-[var(--primary)]"
                data-testid="button-belief-back"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back
              </Button>
            ) : (
              <div className="w-24" />
            )}
            
            <Button
              onClick={() => autoComplete(matchedPersona)}
              size="lg"
              variant="outline"
              className="px-6 py-4 text-lg border-2 border-[var(--warning)] hover:border-[var(--warning)]/80 text-[var(--warning)]"
              data-testid="button-belief-auto-complete"
            >
              <Zap className="mr-2 h-5 w-5" />
              Auto Complete
            </Button>
          </div>

          {/* Progress */}
          <div className="mt-8">
            <div className="w-full bg-[var(--border)] rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-sm text-[var(--muted-foreground)] mt-2">
              Question {currentQuestionIndex + 1} - {Math.round(progress)}% Complete
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Actual Portfolio Form Component
function ActualPortfolioForm({ investorName, matchedPersona, onTabChange }: { investorName: string; matchedPersona: any; onTabChange: (tab: string) => void }) {
  const [portfolioValue, setPortfolioValue] = useState<string>('');
  const [allocations, setAllocations] = useState({
    cashFixedIncome: '',
    globalEquity: '',
    techGrowth: '',
    property: '',
    commoditiesGold: '',
    alternatives: '',
    cryptocurrency: '',
    collectibles: ''
  });

  // Store allocations globally for Action Plan to use (same source as Gap Analysis)
  useEffect(() => {
    (window as any).currentFormAllocations = allocations;
  }, [allocations]);
  const [gapAnalysisData, setGapAnalysisData] = useState<GapResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { toast } = useToast();

  const handleAllocationChange = (field: string, value: string) => {
    setAllocations(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateTotal = () => {
    return Object.values(allocations).reduce((sum, value) => {
      const num = parseFloat(value) || 0;
      return sum + num;
    }, 0);
  };

  const total = calculateTotal();
  const isValid = total === 100 && portfolioValue !== '';

  // Function to get userId from localStorage or generate new one
  const getUserId = () => {
    try {
      const storedQuizData = localStorage.getItem('investorQuizData');
      if (storedQuizData) {
        const quizData = JSON.parse(storedQuizData);
        return quizData.userId;
      }
    } catch (error) {
      console.error('Failed to get userId from localStorage:', error);
    }
    return `demo-${Date.now()}`;
  };

  // Function to get recommended allocation - MUST use same targetMix as Recommendations/Actions
  const getRecommendedAllocation = (persona: any) => {
    // Default empty allocation structure
    const emptyAllocation = {
      cashFixedIncome: '0',
      globalEquity: '0',
      techGrowth: '0',
      property: '0',
      commoditiesGold: '0',
      alternatives: '0',
      cryptocurrency: '0',
      collectibles: '0'
    };

    // CRITICAL: Use exact targetMix from /api/target (same as Recommendations/Actions)
    const apiTargetData = (window as any).targetDataFromAPI;
    if (apiTargetData?.targetMix) {
      console.log('Gap Analysis: Using targetMix from /api/target (same as Recommendations/Actions)');
      const targetMix = apiTargetData.targetMix;
      
      // Map /api/target result to form fields and convert to percentages
      const allocation = {
        cashFixedIncome: Math.round((targetMix.CASH + targetMix.BILLS_SHORT_GILTS + targetMix.GILTS_LONG + targetMix.IG_CREDIT) * 100).toString(),
        globalEquity: Math.round((targetMix.GLOBAL_EQUITY + targetMix.UK_EQUITY_VALUE) * 100).toString(),
        techGrowth: Math.round(targetMix.GROWTH_TECH * 100).toString(),
        property: Math.round(targetMix.PROPERTY_UK_RESI * 100).toString(),
        commoditiesGold: Math.round((targetMix.COMMODITIES + targetMix.GOLD) * 100).toString(),
        alternatives: Math.round(targetMix.ALTERNATIVES * 100).toString(),
        cryptocurrency: Math.round((targetMix.CRYPTO_BTC + targetMix.CRYPTO_ETH) * 100).toString(),
        collectibles: Math.round((targetMix.COLLECTIBLES_ART + targetMix.COLLECTIBLES_WINE) * 100).toString()
      };

      console.log('Gap Analysis: Generated allocation from /api/target targetMix:', allocation);
      return allocation;
    }

    // Fallback to persona defaults only if /api/target data not available
    console.log('Gap Analysis: Falling back to persona defaults (targetMix not available)');
    if (!persona?.code) {
      console.log('No persona code found');
      return emptyAllocation;
    }

    const defaults = PERSONA_DEFAULTS[persona.code];
    if (!defaults) {
      console.log('No defaults found for persona code:', persona.code);
      return emptyAllocation;
    }

    // Map PERSONA_DEFAULTS structure to form fields and convert to percentages
    const allocation = {
      cashFixedIncome: Math.round((defaults.CASH + defaults.BILLS_SHORT_GILTS + defaults.GILTS_LONG + defaults.IG_CREDIT) * 100).toString(),
      globalEquity: Math.round((defaults.GLOBAL_EQUITY + defaults.UK_EQUITY_VALUE) * 100).toString(),
      techGrowth: Math.round(defaults.GROWTH_TECH * 100).toString(),
      property: Math.round(defaults.PROPERTY_UK_RESI * 100).toString(),
      commoditiesGold: Math.round((defaults.COMMODITIES + defaults.GOLD) * 100).toString(),
      alternatives: Math.round(defaults.ALTERNATIVES * 100).toString(),
      cryptocurrency: Math.round((defaults.CRYPTO_BTC + defaults.CRYPTO_ETH) * 100).toString(),
      collectibles: Math.round((defaults.COLLECTIBLES_ART + defaults.COLLECTIBLES_WINE) * 100).toString()
    };

    console.log('Gap Analysis: Generated allocation from persona defaults:', allocation);
    return allocation;
  };

  // Map portfolio allocation to canonical buckets format
  const mapToCanonicalBuckets = (allocations: any): Record<string, number> => {
    return {
      CASH: (parseFloat(allocations.cashFixedIncome) || 0) * 0.3 / 100, // Portion of cash/fixed income as cash
      BILLS_SHORT_GILTS: (parseFloat(allocations.cashFixedIncome) || 0) * 0.4 / 100, // Portion as bills
      GILTS_LONG: (parseFloat(allocations.cashFixedIncome) || 0) * 0.2 / 100, // Portion as gilts
      IG_CREDIT: (parseFloat(allocations.cashFixedIncome) || 0) * 0.1 / 100, // Portion as credit
      GLOBAL_EQUITY: (parseFloat(allocations.globalEquity) || 0) * 0.7 / 100, // Majority as global equity
      UK_EQUITY_VALUE: (parseFloat(allocations.globalEquity) || 0) * 0.3 / 100, // Portion as UK equity
      GROWTH_TECH: (parseFloat(allocations.techGrowth) || 0) / 100,
      PROPERTY_UK_RESI: (parseFloat(allocations.property) || 0) / 100,
      COMMODITIES: (parseFloat(allocations.commoditiesGold) || 0) * 0.6 / 100, // Majority as commodities
      GOLD: (parseFloat(allocations.commoditiesGold) || 0) * 0.4 / 100, // Portion as gold
      ALTERNATIVES: (parseFloat(allocations.alternatives) || 0) / 100,
      CRYPTO_BTC: (parseFloat(allocations.cryptocurrency) || 0) * 0.6 / 100, // Majority as BTC
      CRYPTO_ETH: (parseFloat(allocations.cryptocurrency) || 0) * 0.4 / 100, // Portion as ETH
      COLLECTIBLES_ART: (parseFloat(allocations.collectibles) || 0) * 0.7 / 100, // Majority as art
      COLLECTIBLES_WINE: (parseFloat(allocations.collectibles) || 0) * 0.3 / 100, // Portion as wine
    };
  };

  // Perform enhanced gap analysis with belief alignment
  const performGapAnalysis = async () => {
    if (!matchedPersona) return;

    setIsAnalyzing(true);
    try {
      // CRITICAL: Call /api/target to get same targetMix as Recommendations/Actions
      const userId = getUserId();
      let targetMixFromAPI = null;
      
      try {
        // Build scenario weights (same logic as recommendations)
        let scenarioWeights: Record<string, number> = {};
        try {
          const beliefResponse = await fetch(`/api/investors/${userId}/belief-responses`);
          if (beliefResponse.ok) {
            const beliefData = await beliefResponse.json();
            if (beliefData.scenarioWeights) {
              scenarioWeights = beliefData.scenarioWeights;
            }
          }
        } catch (beliefError) {
          console.log('Could not fetch belief responses for gap analysis, using default weights');
        }

        // If no scenario weights, use default equal weighting
        if (Object.keys(scenarioWeights).length === 0) {
          scenarioWeights = {
            "S005": 0.125, "S010": 0.125, "S002": 0.125, "S003": 0.125,
            "S006": 0.125, "S009": 0.125, "S008": 0.125, "S007": 0.125
          };
        }

        const targetRequest = {
          personaId: matchedPersona.code,
          scenarioWeights: scenarioWeights,
          tiltStrength: 0.35
        };

        console.log('Gap Analysis: Calling /api/target with same params as Recommendations');
        const targetResponse = await fetch('/api/target', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(targetRequest)
        });

        if (targetResponse.ok) {
          const targetResult = await targetResponse.json();
          targetMixFromAPI = targetResult.targetMix;
          console.log('Gap Analysis: Got targetMix from /api/target:', targetMixFromAPI);
        }
      } catch (targetError) {
        console.log('Gap Analysis: Could not call /api/target, falling back to persona defaults');
      }

      const currentMix = mapToCanonicalBuckets(allocations);
      const targetMix = targetMixFromAPI || mapToCanonicalBuckets(getRecommendedAllocation(matchedPersona));
      
      console.log('Current portfolio mix:', currentMix);
      console.log('Target portfolio mix:', targetMix);

      // Build scenario weights from belief responses if available
      let scenarioWeights: Record<string, number> | undefined;
      if ((beliefsData as any)?.selectedScenarios) {
        scenarioWeights = {};
        const scenarios = JSON.parse((beliefsData as any).selectedScenarios);
        
        // Map our belief scenarios to the canonical scenario IDs
        const scenarioMapping: Record<string, string> = {
          'property_down': 'S003', // Inflation hedges scenario
          'energy_spike': 'S008', // Soft inflation scenario  
          'recession': 'S002', // Policy support scenario
          'reflation': 'S005', // Quality growth scenario
          'stagflation': 'S007', // Stagflation tilt scenario
          'tech_correction': 'S006', // Tech-led growth scenario
          'gilt_selloff': 'S009', // Gilt sell-off scenario
          'devaluation': 'S010' // Commodity upswing scenario
        };

        scenarios.forEach((scenario: string) => {
          const canonicalId = scenarioMapping[scenario];
          if (canonicalId) {
            scenarioWeights![canonicalId] = 0.3; // Equal weight for selected scenarios
          }
        });
      }

      const response = await fetch('/api/gap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentMix,
          targetMix,
          riskProfile: matchedPersona.riskProfile || 'Moderate',
          drawdownCap: matchedPersona.drawdownCap || 0.15,
          scenarioWeights,
          personaLabel: matchedPersona.title,
          investorName
        }),
      });

      if (!response.ok) {
        throw new Error(`Gap analysis failed: ${response.statusText}`);
      }

      const gapData = await response.json();
      console.log('Gap analysis results:', gapData);
      setGapAnalysisData(gapData);
      
      toast({
        title: "Gap Analysis Complete",
        description: "Portfolio analysis shows recommendations vs your current allocation.",
      });
    } catch (error) {
      console.error('Gap analysis error:', error);
      toast({
        title: "Analysis Error", 
        description: "Failed to perform gap analysis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid) {
      toast({
        title: "Invalid Portfolio",
        description: "Portfolio allocations must total exactly 100% and portfolio value is required.",
        variant: "destructive"
      });
      return;
    }

    // Save the actual portfolio data
    const portfolioData = {
      investorName,
      portfolioValue: parseFloat(portfolioValue),
      allocations
    };
    
    console.log('Saving actual portfolio:', portfolioData);

    try {
      const response = await fetch('/api/investors/actual-portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: getUserId(),
          ...portfolioData
        }),
      });

      const result = await response.json();
      console.log('Portfolio API response:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Failed to save portfolio');
      }

      if (result.success) {
        console.log('Portfolio saved successfully:', result);

        toast({
          title: "Portfolio Saved",
          description: "Your actual portfolio has been recorded successfully.",
        });

        // Perform gap analysis with /api/target data (same as Recommendations/Actions)
        await performGapAnalysis();
      } else {
        throw new Error(result.message || 'Save operation was not successful');
      }

    } catch (error) {
      console.error('Error saving portfolio:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save portfolio. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <DollarSign className="w-6 h-6 text-[var(--primary)]" />
          Your Actual Portfolio
        </CardTitle>
        <CardDescription className="text-base">
          Tell us about your current investment portfolio for {investorName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Portfolio Value Input */}
          <div className="space-y-2">
            <label htmlFor="portfolioValue" className="text-sm font-medium text-[var(--foreground)]">
              Total Portfolio Value (£)
            </label>
            <input
              id="portfolioValue"
              type="number"
              value={portfolioValue}
              onChange={(e) => setPortfolioValue(e.target.value)}
              placeholder="e.g., 500000"
              className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              data-testid="input-portfolio-value"
              required
            />
          </div>

          {/* Asset Allocation Inputs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-[var(--foreground)]">
                Asset Allocation (must total 100%)
              </h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  // Generate random allocation
                  const allocationCategories = [
                    'cashFixedIncome',
                    'globalEquity', 
                    'techGrowth',
                    'property',
                    'commoditiesGold',
                    'alternatives',
                    'cryptocurrency',
                    'collectibles'
                  ];

                  // Generate random weights
                  const randomWeights = allocationCategories.map(() => Math.random());
                  const weightSum = randomWeights.reduce((sum, weight) => sum + weight, 0);
                  
                  // Normalize to sum to 100%
                  const normalizedWeights = randomWeights.map(weight => (weight / weightSum) * 100);
                  
                  // Create random allocation object
                  const randomAllocation: any = {};
                  allocationCategories.forEach((category, index) => {
                    randomAllocation[category] = Math.round(normalizedWeights[index]).toString();
                  });

                  // Ensure total is exactly 100% by adjusting the largest allocation
                  const total = Object.values(randomAllocation).reduce((sum: number, val: any) => sum + parseInt(val), 0);
                  if (total !== 100) {
                    const largest = Object.entries(randomAllocation).reduce((max, [key, val]: [string, any]) => 
                      parseInt(val) > parseInt(max[1]) ? [key, val] : max, ['', '0']);
                    randomAllocation[largest[0]] = (parseInt(largest[1]) + (100 - total)).toString();
                  }

                  setAllocations(randomAllocation);
                  toast({
                    title: "Random Allocation Generated",
                    description: "Filled with a random portfolio allocation for testing.",
                  });
                }}
                className="text-xs"
              >
                <Zap className="h-3 w-3 mr-1" />
                Use Random
              </Button>
            </div>

            {/* Live Portfolio Chart */}
            {total > 0 && (
              <div className="p-4 bg-gradient-to-br from-[var(--accent)]/5 to-[var(--secondary)]/5 rounded-2xl border border-[var(--accent)]/20">
                <h5 className="font-medium text-[var(--foreground)] mb-4">Your Portfolio Visualization</h5>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Cash & Fixed Income', value: parseFloat(allocations.cashFixedIncome) || 0, color: '#10B981' },
                        { name: 'Global Equity', value: parseFloat(allocations.globalEquity) || 0, color: '#3B82F6' },
                        { name: 'Technology & Growth', value: parseFloat(allocations.techGrowth) || 0, color: '#06B6D4' },
                        { name: 'Property & Real Estate', value: parseFloat(allocations.property) || 0, color: '#8B5CF6' },
                        { name: 'Commodities & Gold', value: parseFloat(allocations.commoditiesGold) || 0, color: '#F59E0B' },
                        { name: 'Alternative Investments', value: parseFloat(allocations.alternatives) || 0, color: '#EF4444' },
                        { name: 'Cryptocurrency', value: parseFloat(allocations.cryptocurrency) || 0, color: '#F97316' },
                        { name: 'Collectibles', value: parseFloat(allocations.collectibles) || 0, color: '#A855F7' }
                      ].filter(item => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={50}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ value }) => value > 0 ? `${value}%` : ''}
                      labelLine={false}
                    >
                      {[
                        { name: 'Cash & Fixed Income', value: parseFloat(allocations.cashFixedIncome) || 0, color: '#10B981' },
                        { name: 'Global Equity', value: parseFloat(allocations.globalEquity) || 0, color: '#3B82F6' },
                        { name: 'Technology & Growth', value: parseFloat(allocations.techGrowth) || 0, color: '#06B6D4' },
                        { name: 'Property & Real Estate', value: parseFloat(allocations.property) || 0, color: '#8B5CF6' },
                        { name: 'Commodities & Gold', value: parseFloat(allocations.commoditiesGold) || 0, color: '#F59E0B' },
                        { name: 'Alternative Investments', value: parseFloat(allocations.alternatives) || 0, color: '#EF4444' },
                        { name: 'Cryptocurrency', value: parseFloat(allocations.cryptocurrency) || 0, color: '#F97316' },
                        { name: 'Collectibles', value: parseFloat(allocations.collectibles) || 0, color: '#A855F7' }
                      ].filter(item => item.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value, name) => [`${value}%`, name]}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-[var(--muted-foreground)] mt-2">
                  Live preview of your portfolio allocation • {total.toFixed(1)}% allocated
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'cashFixedIncome', label: 'Cash & Fixed Income', placeholder: '25' },
                { key: 'globalEquity', label: 'Global Equity', placeholder: '35' },
                { key: 'techGrowth', label: 'Technology & Growth', placeholder: '15' },
                { key: 'property', label: 'Property & Real Estate', placeholder: '10' },
                { key: 'commoditiesGold', label: 'Commodities & Gold', placeholder: '5' },
                { key: 'alternatives', label: 'Alternative Investments', placeholder: '5' },
                { key: 'cryptocurrency', label: 'Cryptocurrency', placeholder: '3' },
                { key: 'collectibles', label: 'Collectibles', placeholder: '2' }
              ].map((field) => (
                <div key={field.key} className="space-y-1">
                  <label htmlFor={field.key} className="text-sm font-medium text-[var(--foreground)]">
                    {field.label} (%)
                  </label>
                  <input
                    id={field.key}
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={allocations[field.key as keyof typeof allocations]}
                    onChange={(e) => handleAllocationChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                    data-testid={`input-${field.key}`}
                  />
                </div>
              ))}
            </div>

            {/* Total Display */}
            <div className="flex justify-between items-center p-4 bg-[var(--accent)]/5 rounded-lg border border-[var(--accent)]/20">
              <span className="font-medium text-[var(--foreground)]">Total Allocation:</span>
              <span className={`text-xl font-bold ${
                total === 100 ? 'text-green-600' : 
                total > 100 ? 'text-red-600' : 'text-[var(--muted-foreground)]'
              }`}>
                {total.toFixed(1)}%
              </span>
            </div>
            
            {total !== 100 && (
              <p className="text-sm text-[var(--muted-foreground)]">
                {total < 100 ? 
                  `You need ${(100 - total).toFixed(1)}% more to reach 100%` :
                  `You are ${(total - 100).toFixed(1)}% over 100%`
                }
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={!isValid}
            className="w-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] hover:from-[var(--primary)]/90 hover:to-[var(--secondary)]/90 text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="button-save-portfolio"
          >
            <Save className="w-5 h-5 mr-2" />
            Save My Portfolio
          </Button>
        </form>

        {/* Show Gap Analysis Results */}
        {gapAnalysisData && (
          <GapAnalysisResults 
            gapData={gapAnalysisData} 
            onContinue={() => onTabChange('strategy')}
          />
        )}
        
        {/* Loading State for Gap Analysis */}
        {isAnalyzing && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--primary)]"></div>
                <p className="text-[var(--foreground)]">Analyzing portfolio gap...</p>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}

// Personalized Portfolio Analysis Component
function PersonalizedPortfolioAnalysis({ onTabChange }: { onTabChange: (tab: string) => void }) {
  const [matchedPersona, setMatchedPersona] = useState<PersonaDef | null>(null);
  const [investorName, setInvestorName] = useState<string>('');

  // Load matched persona from localStorage
  useEffect(() => {
    const storedQuizData = localStorage.getItem('investorQuizData');
    if (storedQuizData) {
      try {
        const quizData = JSON.parse(storedQuizData);
        setInvestorName(quizData.investorName || 'Investor');
        if (quizData.matchedPersonaCode) {
          const personaArray = Object.values(INVESTMENT_PERSONAS);
          const persona = personaArray.find(p => p.code === quizData.matchedPersonaCode);
          setMatchedPersona(persona || null);
        }
      } catch (error) {
        console.error('Failed to load quiz data:', error);
      }
    }
  }, []);

  if (!matchedPersona) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-[var(--foreground)]">Loading Portfolio Analysis</h3>
            <p className="text-[var(--muted-foreground)]">
              Generating your personalized portfolio recommendations...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get detailed portfolio allocation from persona defaults
  const personaDefaults = PERSONA_DEFAULTS[matchedPersona.code];
  if (!personaDefaults) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-12">
            <h3 className="text-xl font-semibold mb-4 text-[var(--foreground)]">Portfolio data not available</h3>
            <p className="text-[var(--muted-foreground)]">
              No allocation data found for persona {matchedPersona.code}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group detailed allocations into major categories
  const portfolioAllocation = [
    {
      name: 'Cash & Fixed Income',
      value: Math.round((personaDefaults.CASH + personaDefaults.BILLS_SHORT_GILTS + personaDefaults.GILTS_LONG + personaDefaults.IG_CREDIT) * 100),
      color: '#10B981',
      assets: ['Cash', 'Government Bonds', 'Corporate Credit'],
      description: 'Safe havens providing income and stability'
    },
    {
      name: 'Global Equity',
      value: Math.round((personaDefaults.GLOBAL_EQUITY + personaDefaults.UK_EQUITY_VALUE) * 100),
      color: '#3B82F6',
      assets: ['International Stocks', 'UK Value Stocks'],
      description: 'Traditional equity investments for growth'
    },
    {
      name: 'Technology & Growth',
      value: Math.round(personaDefaults.GROWTH_TECH * 100),
      color: '#06B6D4',
      assets: ['Tech Stocks', 'Growth Companies'],
      description: 'High-growth technology investments'
    },
    {
      name: 'Property & Real Estate',
      value: Math.round(personaDefaults.PROPERTY_UK_RESI * 100),
      color: '#8B5CF6',
      assets: ['UK Residential Property'],
      description: 'Direct property and real estate investments'
    },
    {
      name: 'Commodities & Gold',
      value: Math.round((personaDefaults.COMMODITIES + personaDefaults.GOLD) * 100),
      color: '#F59E0B',
      assets: ['Commodity Futures', 'Gold'],
      description: 'Inflation hedges and store of value'
    },
    {
      name: 'Alternative Investments',
      value: Math.round(personaDefaults.ALTERNATIVES * 100),
      color: '#EF4444',
      assets: ['Private Equity', 'Hedge Funds'],
      description: 'Non-traditional investment strategies'
    },
    {
      name: 'Cryptocurrency',
      value: Math.round((personaDefaults.CRYPTO_BTC + personaDefaults.CRYPTO_ETH) * 100),
      color: '#F97316',
      assets: ['Bitcoin', 'Ethereum'],
      description: 'Digital assets and blockchain investments'
    },
    {
      name: 'Collectibles',
      value: Math.round((personaDefaults.COLLECTIBLES_ART + personaDefaults.COLLECTIBLES_WINE) * 100),
      color: '#A855F7',
      assets: ['Art', 'Fine Wine'],
      description: 'Luxury collectible investments'
    }
  ].filter(item => item.value > 0);

  return (
    <div className="w-full px-8 py-8">
      {/* Side-by-Side Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side - Portfolio Recommendation */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <BarChart3 className="w-6 h-6 text-[var(--primary)]" />
              Your Portfolio Recommendation
            </CardTitle>
            <CardDescription className="text-base">
              Based on your investment persona: <span className="font-semibold text-[var(--primary)]">{matchedPersona.name}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Portfolio Value Display */}
              <div className="text-center p-6 bg-gradient-to-br from-[var(--accent)]/10 to-[var(--secondary)]/10 rounded-2xl border border-[var(--accent)]/20">
                <h3 className="text-lg font-medium text-[var(--muted-foreground)] mb-2">Recommended Portfolio Size</h3>
                <p className="text-3xl font-bold text-[var(--foreground)]">
                  £{(matchedPersona.portfolioValue / 1000).toLocaleString()}K
                </p>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">{matchedPersona.wealthTier}</p>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[var(--accent)]/5 rounded-lg border border-[var(--accent)]/20">
                  <h5 className="font-medium text-[var(--foreground)] mb-1">Risk Profile</h5>
                  <p className="text-lg font-semibold text-[var(--primary)]">{matchedPersona.riskProfile}</p>
                </div>
                <div className="p-4 bg-[var(--accent)]/5 rounded-lg border border-[var(--accent)]/20">
                  <h5 className="font-medium text-[var(--foreground)] mb-1">Approach</h5>
                  <p className="text-lg font-semibold text-[var(--primary)]">
                    {matchedPersona.approach.replace('_', ' ')}
                  </p>
                </div>
                <div className="p-4 bg-[var(--accent)]/5 rounded-lg border border-[var(--accent)]/20">
                  <h5 className="font-medium text-[var(--foreground)] mb-1">Liquidity Buffer</h5>
                  <p className="text-lg font-semibold text-[var(--primary)]">{matchedPersona.liquidityMonths} months</p>
                </div>
                <div className="p-4 bg-[var(--accent)]/5 rounded-lg border border-[var(--accent)]/20">
                  <h5 className="font-medium text-[var(--foreground)] mb-1">Max Drawdown</h5>
                  <p className="text-lg font-semibold text-[var(--primary)]">{(matchedPersona.drawdownCap * 100).toFixed(0)}%</p>
                </div>
              </div>

              {/* Portfolio Allocation Chart */}
              <div className="space-y-4">
                <h4 className="font-semibold text-[var(--foreground)]">Portfolio Allocation Overview</h4>
                <div className="p-6 bg-gradient-to-br from-[var(--accent)]/5 to-[var(--secondary)]/5 rounded-2xl border border-[var(--accent)]/20">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={portfolioAllocation}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        innerRadius={45}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${value}%`}
                        labelLine={false}
                      >
                        {portfolioAllocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value, name) => [`${value}%`, name]}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))'
                        }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value) => value}
                        wrapperStyle={{ 
                          color: 'hsl(var(--foreground))',
                          fontSize: '12px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <p className="text-center text-sm text-[var(--muted-foreground)] mt-2">
                    Interactive breakdown of your recommended asset allocation
                  </p>
                </div>
              </div>

              {/* Allocation Breakdown */}
              <div className="space-y-4">
                <h4 className="font-semibold text-[var(--foreground)]">Asset Allocation</h4>
                {portfolioAllocation.map((item, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-[var(--foreground)]">{item.name}</span>
                      <span className="font-semibold text-[var(--foreground)]">{item.value}%</span>
                    </div>
                    <div className="w-full bg-[var(--border)] rounded-full h-3">
                      <div 
                        className="h-3 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${item.value}%`,
                          backgroundColor: item.color 
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-[var(--muted-foreground)]">{item.description}</p>
                      {'assets' in item && (
                        <p className="text-xs text-[var(--muted-foreground)]/80">
                          Includes: {item.assets.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Persona Description */}
              <div className="p-6 bg-gradient-to-br from-[var(--primary)]/5 to-[var(--secondary)]/5 rounded-2xl border border-[var(--primary)]/20">
                <h5 className="font-semibold text-[var(--foreground)] mb-3">Portfolio Notes</h5>
                <p className="text-[var(--muted-foreground)]">{matchedPersona.notes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Side - Actual Portfolio Form */}
        <div>
          <ActualPortfolioForm investorName={investorName} matchedPersona={matchedPersona} onTabChange={onTabChange} />
        </div>
      </div>
    </div>
  );
}

// Enhanced Gap Analysis Results Component
function GapAnalysisResults({ gapData, onContinue }: { gapData: any; onContinue?: () => void }) {
  const hasBeliefAlignment = gapData.beliefAlignmentNow !== undefined && gapData.beliefAlignmentTarget !== undefined;
  const hasCommentary = gapData.commentary && gapData.commentary.whyBullets;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <TrendingUp className="w-5 h-5 text-[var(--primary)]" />
          Persona Gap Analysis (Base Mix)
        </CardTitle>
        <CardDescription>
          Sophisticated comparison with belief alignment and strategic commentary
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Strategic Commentary */}
        {hasCommentary && (
          <div className="mb-6 p-4 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-gray-800/50 rounded-lg border">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
              <Brain className="w-5 h-5 text-[var(--primary)]" />
              Strategic Commentary
              {gapData.commentary.scenarioLabel && (
                <span className="text-sm text-[var(--muted-foreground)] font-normal">
                  • {gapData.commentary.scenarioLabel}
                </span>
              )}
            </h3>
            <div className="space-y-3">
              {gapData.commentary.whyBullets.map((bullet: string, index: number) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-[var(--primary)] mt-2 flex-shrink-0"></div>
                  <div className="text-[var(--foreground)]" dangerouslySetInnerHTML={{ __html: bullet.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Headline Flags */}
        {gapData.headlineFlags.length > 0 && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">Portfolio Alerts</h4>
            {gapData.headlineFlags.map((flag: string, index: number) => (
              <p key={index} className="text-amber-800 dark:text-amber-300 text-sm">{flag}</p>
            ))}
            {/* Show clarification text if there are any liquidity-related flags */}
            {gapData.headlineFlags.some((flag: string) => flag.toLowerCase().includes('liquidity')) && (
              <p className="text-amber-700 dark:text-amber-400 text-xs mt-2 italic">
                Liquidity floor is preview-only here; it's enforced in the recommendation step.
              </p>
            )}
          </div>
        )}

        {/* Core Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-200">Total Changes</h4>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
              {(gapData.totals.absGapSum * 100).toFixed(1)}%
              <span className="text-xs bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">
                {gapData.turnoverPp}pp turnover
              </span>
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400">Portfolio rebalancing required</p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="font-semibold text-green-900 dark:text-green-200">Current Liquidity</h4>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
              {(gapData.totals.cashBillsNow * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-green-600 dark:text-green-400">Cash & short-term bonds</p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <h4 className="font-semibold text-purple-900 dark:text-purple-200">Target Liquidity</h4>
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {(gapData.totals.cashBillsTarget * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-purple-600 dark:text-purple-400">Recommended level</p>
          </div>
        </div>

        {/* Enhanced Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Belief Alignment Card */}
          {hasBeliefAlignment && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <h4 className="font-semibold text-amber-900 dark:text-amber-200 text-sm">Belief Alignment</h4>
              <p className="text-xl font-bold text-amber-700 dark:text-amber-300">
                {gapData.beliefAlignmentNow}/100 → {gapData.beliefAlignmentTarget}/100 
                {gapData.beliefAlignmentTarget > gapData.beliefAlignmentNow && (
                  <span className="text-green-600 dark:text-green-400 ml-1">
                    (↑ +{gapData.beliefAlignmentTarget - gapData.beliefAlignmentNow})
                  </span>
                )}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">How closely your mix matches your outlook</p>
            </div>
          )}

          {/* Diversification Card */}
          {gapData.diversification && (
            <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
              <h4 className="font-semibold text-teal-900 dark:text-teal-200 text-sm">Diversification</h4>
              <p className="text-xl font-bold text-teal-700 dark:text-teal-300">
                {gapData.diversification.deltaHhi > 0 ? '+' : ''}{(gapData.diversification.deltaHhi * 1000).toFixed(1)} HHI
                <span className="text-sm ml-2">
                  (N: {gapData.diversification.nEffNow} → {gapData.diversification.nEffTarget})
                </span>
              </p>
              <p className="text-xs text-teal-600 dark:text-teal-400">
                {gapData.diversification.deltaHhi > 0 ? 'Less concentrated' : 'More concentrated'} • Lower HHI = better spread
              </p>
            </div>
          )}
        </div>

        {/* Gap Analysis Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left p-3 font-semibold text-[var(--foreground)]">Asset Class</th>
                <th className="text-right p-3 font-semibold text-[var(--foreground)]">Current %</th>
                <th className="text-right p-3 font-semibold text-[var(--foreground)]">Target % (Persona Base)</th>
                <th className="text-right p-3 font-semibold text-[var(--foreground)]">Δ (pp)</th>
                <th className="text-left p-3 font-semibold text-[var(--foreground)]">Flags</th>
              </tr>
            </thead>
            <tbody>
              {gapData.rows.map((row: any, index: number) => (
                <tr key={row.bucket} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/30">
                  <td className="p-3 font-medium text-[var(--foreground)]">
                    {row.bucket.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </td>
                  <td className="p-3 text-right text-[var(--foreground)]">
                    {(row.currentPct * 100).toFixed(1)}%
                  </td>
                  <td className="p-3 text-right text-[var(--foreground)]">
                    {(row.targetPct * 100).toFixed(1)}%
                  </td>
                  <td className={`p-3 text-right font-semibold ${
                    row.deltaPct < 0 ? 'text-red-600 dark:text-red-400' : 
                    row.deltaPct > 0 ? 'text-green-600 dark:text-green-400' : 
                    'text-[var(--foreground)]'
                  }`}>
                    {row.deltaPct > 0 ? '+' : ''}{(row.deltaPct * 100).toFixed(1)}
                  </td>
                  <td className="p-3 text-sm text-[var(--muted-foreground)]">
                    {row.flags.join(', ') || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Continue Button */}
        {onContinue && (
          <div className="mt-6 flex justify-center">
            <Button 
              onClick={onContinue}
              className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] hover:from-[var(--primary)]/90 hover:to-[var(--secondary)]/90 text-white font-semibold px-8 py-3"
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              Continue to Portfolio Recommendations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Portfolio Recommendations Component
interface PortfolioRecommendationsProps {
  userId: string;
}

interface TargetResponse {
  personaId: string;
  scenarioWeights: Record<string, number>;
  tiltStrength: number;
  baseMix: Record<string, number>;
  scenarioBlend: Record<string, number>;
  preRulesMix: Record<string, number>;
  targetMix: Record<string, number>;
  flags: string[];
  adjustments: string[];
  narrative?: {
    overview: string;
    bullets: string[];
    topAdds: { bucket: string; pp: number }[];
    topTrims: { bucket: string; pp: number }[];
  };
}

interface SimulationResponse {
  blendedShocks: Record<string, number>;
  contributionsCurrent: Record<string, number>;
  contributionsTarget: Record<string, number>;
  portfolioReturnCurrent: number;
  portfolioReturnTarget: number;
  series: Array<{
    t: number;
    current: number;
    target: number;
    currentLow?: number;
    currentHigh?: number;
    targetLow?: number;
    targetHigh?: number;
  }>;
}

function PortfolioRecommendations({ userId: propUserId }: PortfolioRecommendationsProps) {
  const [targetData, setTargetData] = useState<TargetResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [simulationData, setSimulationData] = useState<SimulationResponse | null>(null);
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [horizonMonths, setHorizonMonths] = useState(12);
  const { toast } = useToast();

  // Get investor preferences to extract persona and scenario weights
  const [investorPrefs, setInvestorPrefs] = useState<any>(null);
  const [actualUserId, setActualUserId] = useState<string | null>(null);

  // Get the correct userId from localStorage - SAME as Action Plan getUserId logic
  useEffect(() => {
    const getUserId = () => {
      try {
        const storedQuizData = localStorage.getItem('investorQuizData');
        if (storedQuizData) {
          const quizData = JSON.parse(storedQuizData);
          return quizData.userId || `demo-${Date.now()}`;
        }
      } catch (error) {
        console.log('Error reading quiz data for userId:', error);
      }
      return `demo-${Date.now()}`;
    };

    const userId = getUserId();
    console.log('actualUserId:', userId);
    setActualUserId(userId);
  }, [propUserId]);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!actualUserId) return;
      
      try {
        console.log('=== Generate Recommendations Button Clicked ===');
        console.log('actualUserId:', actualUserId);
        const response = await fetch(`/api/investors/${actualUserId}/preferences`);
        console.log('investorPrefs:', response.ok ? 'found' : null);
        if (response.ok) {
          const prefs = await response.json();
          console.log('Portfolio Recommendations - Fetched preferences:', prefs);
          setInvestorPrefs(prefs);
        } else {
          console.log('Portfolio Recommendations - Failed to fetch preferences:', response.status);
          setInvestorPrefs(null);
        }
      } catch (error) {
        console.error('Failed to fetch investor preferences:', error);
        setInvestorPrefs(null);
      }
    };
    
    fetchPreferences();
  }, [actualUserId]);

  const generateRandomAllocation = async () => {
    console.log('=== Generate Random Allocation Button Clicked ===');
    console.log('actualUserId:', actualUserId);
    
    setLoading(true);
    setError(null);
    setLoadingMessage("Generating random portfolio allocation...");

    try {
      // Define all asset buckets
      const assetBuckets = [
        'CASH',
        'BILLS_SHORT_GILTS', 
        'GILTS_LONG',
        'IG_CREDIT',
        'GLOBAL_EQUITY',
        'UK_EQUITY_VALUE',
        'GROWTH_TECH',
        'PROPERTY_UK_RESI',
        'COMMODITIES',
        'GOLD',
        'ALTERNATIVES',
        'CRYPTO_BTC',
        'CRYPTO_ETH',
        'COLLECTIBLES_ART',
        'COLLECTIBLES_WINE'
      ];

      // Generate random weights
      const randomWeights = assetBuckets.map(() => Math.random());
      const weightSum = randomWeights.reduce((sum, weight) => sum + weight, 0);
      
      // Normalize to sum to 1 (100%)
      const normalizedWeights = randomWeights.map(weight => weight / weightSum);
      
      // Create the random allocation
      const randomAllocation: any = {};
      assetBuckets.forEach((bucket, index) => {
        randomAllocation[bucket] = normalizedWeights[index];
      });

      // Create mock target data structure
      const randomTargetData = {
        personaId: 'RANDOM',
        scenarioWeights: {},
        tiltStrength: 0,
        baseMix: randomAllocation,
        scenarioBlend: randomAllocation,
        preRulesMix: randomAllocation,
        targetMix: randomAllocation,
        flags: ['Random allocation generated'],
        adjustments: ['No house rules applied to random allocation'],
        narrative: {
          overview: 'This is a completely random portfolio allocation for demonstration purposes. Each asset class has been assigned a random percentage that sums to 100%. This is not based on any investment strategy or recommendation.',
          bullets: [
            'Random allocation across all asset classes',
            'No consideration of risk profile or economic beliefs',
            'Purely for demonstration and testing purposes',
            'Not suitable for actual investment decisions'
          ]
        }
      };

      setTargetData(randomTargetData);
      
      toast({
        title: "Random Allocation Generated",
        description: "A random portfolio allocation has been created for demonstration!",
      });

    } catch (error) {
      console.error('Error generating random allocation:', error);
      setError('Failed to generate random allocation. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMessage(null);
    }
  };

  const generateRecommendations = async () => {
    console.log('=== Generate Recommendations Button Clicked ===');
    console.log('actualUserId:', actualUserId);
    console.log('investorPrefs:', investorPrefs);
    console.log('detectedPersona:', investorPrefs?.detectedPersona);
    console.log('matched_persona_code:', (investorPrefs as any)?.matched_persona_code);
    
    // Check all possible persona fields that might be saved in the database
    let personaId = (investorPrefs as any)?.matched_persona_code || 
                   (investorPrefs as any)?.matchedPersonaCode || 
                   investorPrefs?.detectedPersona;
    
    console.log('Retrieved persona fields:', {
      matched_persona_code: (investorPrefs as any)?.matched_persona_code,
      matchedPersonaCode: (investorPrefs as any)?.matchedPersonaCode,
      detectedPersona: investorPrefs?.detectedPersona
    });
    
    // Only fall back to quiz analysis if NO persona is saved
    if (!personaId && investorPrefs?.quizAnswers) {
      console.log('No saved persona found, extracting from quiz answers...');
      try {
        const quizAnswers = JSON.parse(investorPrefs.quizAnswers);
        console.log('Quiz answers:', quizAnswers);
        
        // Look for the quiz data that might contain the persona
        if (quizAnswers.length > 0 && quizAnswers[0].matchedPersonaCode) {
          personaId = quizAnswers[0].matchedPersonaCode;
          console.log('Found persona in quiz data:', personaId);
        } else {
          // Last resort: basic risk tolerance mapping
          const riskQuestion = quizAnswers.find((q: any) => q.questionId === 'risk_tolerance');
          if (riskQuestion) {
            const riskToPersona: Record<number, string> = {
              0: 'P004', // Conservative -> The Old Fashioned Saver
              1: 'P001', // Moderate Conservative -> The Retirement Planner  
              2: 'P009', // Balanced -> The Global Nomad
              3: 'P008', // Growth -> The Young Professional
              4: 'P003'  // Aggressive -> The Crypto Enthusiast
            };
            
            personaId = riskToPersona[riskQuestion.optionIndex] || 'P009';
            console.log('Detected persona from risk tolerance:', personaId);
          }
        }
      } catch (error) {
        console.error('Failed to parse quiz answers:', error);
      }
    }
    
    if (!personaId) {
      console.log('ERROR: Still missing persona after extraction attempt');
      // Use default persona instead of blocking
      personaId = 'P016'; // Default to Legacy Builder
      console.log('Using default persona:', personaId);
    }

    setLoading(true);
    setError(null);
    setTargetData(null); // Clear previous results

    // Add realistic processing delay with messages
    const processingMessages = [
      'Analyzing your investment profile...',
      'Processing economic scenarios...',
      'Calculating optimal asset allocation...',
      'Generating personalized recommendations...'
    ];

    for (let i = 0; i < processingMessages.length; i++) {
      setLoadingMessage(processingMessages[i]);
      await new Promise(resolve => setTimeout(resolve, 800)); // 800ms per message = 3.2 seconds total
    }

    try {
      console.log('=== Starting Portfolio Recommendations Generation ===');
      console.log('Generating recommendations with prefs:', investorPrefs);
      console.log('actualUserId:', actualUserId);
      console.log('investorPrefs full object:', investorPrefs);

      // Get belief responses from separate API call if needed
      let scenarioWeights: Record<string, number> = {};
      
      try {
        const beliefResponse = await fetch(`/api/investors/${actualUserId}/belief-responses`);
        if (beliefResponse.ok) {
          const beliefData = await beliefResponse.json();
          console.log('Belief data:', beliefData);
          
          if (beliefData.scenarioWeights) {
            // scenarioWeights is already a parsed object, not a JSON string
            scenarioWeights = beliefData.scenarioWeights;
          }
        }
      } catch (beliefError) {
        console.log('Could not fetch belief responses, using default weights');
      }

      // If no scenario weights, use default equal weighting
      if (Object.keys(scenarioWeights).length === 0) {
        scenarioWeights = {
          "S005": 0.125, // Quality Growth (reflation)
          "S010": 0.125, // Commodity Upswing (devaluation)
          "S002": 0.125, // Policy Support (recession)
          "S003": 0.125, // Inflation Hedges (property_down)
          "S006": 0.125, // Tech-led Growth (tech_correction)
          "S009": 0.125, // Gilt Sell-off (gilt_selloff)
          "S008": 0.125, // Soft-ish Inflation (energy_spike)
          "S007": 0.125  // Stagflation Tilt (stagflation)
        };
      }
      
      // Convert scenario names to S-codes if needed
      const scenarioNameToCode: Record<string, string> = {
        "reflation": "S005",     // Quality Growth
        "devaluation": "S010",   // Commodity Upswing
        "recession": "S002",     // Policy Support
        "property_down": "S003", // Inflation Hedges
        "tech_correction": "S006", // Tech-led Growth
        "gilt_selloff": "S009",  // Gilt Sell-off
        "energy_spike": "S008",  // Soft-ish Inflation
        "stagflation": "S007"    // Stagflation Tilt
      };
      
      // Convert any scenario names to proper S-codes
      const convertedWeights: Record<string, number> = {};
      for (const [scenario, weight] of Object.entries(scenarioWeights)) {
        const scenarioCode = scenarioNameToCode[scenario] || scenario;
        convertedWeights[scenarioCode] = weight;
      }
      scenarioWeights = convertedWeights;

      console.log('Using scenario weights:', scenarioWeights);

      // Calculate dynamic tilt strength based on persona characteristics
      const persona = INVESTMENT_PERSONAS[personaId];
      let tiltStrength = 0.35; // Default fallback
      let drawdownCap = 0.20; // Default fallback
      
      if (persona) {
        // Use persona's actual drawdown capacity
        drawdownCap = persona.drawdownCap;
        
        // Calculate tilt strength based on persona risk profile and characteristics
        // Higher risk tolerance = higher tilt strength (more scenario influence)
        // Lower risk tolerance = lower tilt strength (closer to base allocation)
        const riskScore = persona.scores[0]; // First score is risk tolerance (0-5)
        const concentrationTolerance = persona.concentrationTolerance;
        
        // Base calculation: map risk score (0-5) to tilt strength (0.15-0.55)
        tiltStrength = 0.15 + (riskScore / 5) * 0.40;
        
        // Adjust based on concentration tolerance
        if (concentrationTolerance === 'low') {
          tiltStrength *= 0.8; // More conservative
        } else if (concentrationTolerance === 'high') {
          tiltStrength *= 1.2; // More aggressive
        }
        
        // Cap between reasonable bounds
        tiltStrength = Math.max(0.15, Math.min(0.65, tiltStrength));
        
        console.log(`Calculated tilt strength for ${persona.name}: ${(tiltStrength * 100).toFixed(1)}% (risk score: ${riskScore}, concentration: ${concentrationTolerance})`);
      }

      const requestData = {
        personaId: personaId,
        scenarioWeights: scenarioWeights,
        tiltStrength: tiltStrength,
        riskProfile: investorPrefs.riskBand || persona?.riskProfile || "Moderate",
        drawdownCap: drawdownCap
      };

      console.log('Target API request:', requestData);

      const response = await fetch('/api/target', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Target API error:', response.status, errorText);
        throw new Error(`Failed to generate recommendations: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Target API result:', result);
      
      // Add default narrative if missing (backend doesn't generate it yet)
      if (!result.narrative) {
        result.narrative = {
          overview: "Portfolio recommendations generated based on your investor profile and market outlook.",
          bullets: [],
          topAdds: [],
          topTrims: []
        };
      }
      
      setTargetData(result);
      
      // Gap Analysis now calls /api/target directly for consistency
      
      toast({
        title: "Recommendations Generated",
        description: "Your personalized portfolio recommendations are ready!",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate recommendations';
      console.error('Generation error:', error);
      setError(errorMessage);
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const formatBucketName = (bucket: string) => {
    return bucket.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const runSimulation = async () => {
    if (!targetData || !investorPrefs) return;
    
    setSimulationLoading(true);
    try {
      // Get current portfolio mix from actual portfolio data
      const actualPortfolioResponse = await fetch(`/api/investors/${actualUserId}/preferences`);
      let currentMix = targetData.baseMix; // fallback to base mix
      
      if (actualPortfolioResponse.ok) {
        const actualData = await actualPortfolioResponse.json();
        if (actualData.actualPortfolioAllocations) {
          const allocations = JSON.parse(actualData.actualPortfolioAllocations);
          // Convert high-level allocations to detailed bucket allocations
          currentMix = convertToDetailedBuckets(allocations);
        }
      }
      
      const beliefResponse = await fetch(`/api/investors/${actualUserId}/belief-responses`);
      let scenarioWeights: Record<string, number> = {};
      
      if (beliefResponse.ok) {
        const beliefData = await beliefResponse.json();
        if (beliefData.scenarioWeights) {
          scenarioWeights = beliefData.scenarioWeights;
        }
      }
      
      // Map belief scenario names to scenario codes
      const beliefToScenarioMap: Record<string, string> = {
        'recession': 'S002',
        'energy_spike': 'S008', 
        'property_down': 'S003',
        'reflation': 'S005',
        'devaluation': 'S010',
        'tech_correction': 'S006',
        'gilt_selloff': 'S009',
        'stagflation': 'S007'
      };
      
      // Ensure scenario weights are properly formatted and not empty
      const formattedScenarioWeights: Record<string, number> = {};
      for (const [key, value] of Object.entries(scenarioWeights)) {
        const scenarioCode = beliefToScenarioMap[key] || key;
        formattedScenarioWeights[scenarioCode] = Number(value);
      }
      
      // If no scenario weights, use sensible defaults that match our shocks config
      if (Object.keys(formattedScenarioWeights).length === 0) {
        formattedScenarioWeights.S002 = 0.35;  // Policy Support
        formattedScenarioWeights.S008 = 0.34;  // Soft Inflation  
        formattedScenarioWeights.S003 = 0.31;  // Inflation Hedges
      }
      
      
      const simulationRequest = {
        currentMix,
        targetMix: targetData.targetMix,
        scenarioWeights: formattedScenarioWeights,
        horizonMonths,
        startValueGBP: 100,
        shockMultiplier: 1.0,
        mode: "hold",
        mc: { paths: 5000, seed: 12345 },
        multiHorizons: [6, 12, 24],
        fade: { tauMonths: 24 }
      };
      
      console.log('=== ENHANCED SIMULATION REQUEST ===');
      console.log('Horizon months:', horizonMonths);
      console.log('Request:', simulationRequest);
      
      const response = await fetch('/api/simulate-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(simulationRequest)
      });
      
      if (!response.ok) {
        throw new Error('Simulation failed');
      }
      
      const result = await response.json();
      console.log('=== ENHANCED SIMULATION RESULT ===');
      console.log('Expected returns:', result.expectedReturnCurrent, result.expectedReturnTarget);
      console.log('Probability target beats current:', result.probTargetBeatsCurrent);
      console.log('Max drawdown median:', result.maxDrawdownMed);
      console.log('Fan chart points:', result.fan?.length);
      
      // Convert enhanced simulation result to display format
      const enhancedSimulationData = {
        portfolioReturnCurrent: result.expectedReturnCurrent,
        portfolioReturnTarget: result.expectedReturnTarget,
        contributionsCurrent: result.contributionsCurrent,
        contributionsTarget: result.contributionsTarget,
        series: result.fan?.map(point => ({
          t: point.t,
          current: point.current.p50,
          target: point.target.p50,
          currentLow: point.current.p05,
          currentHigh: point.current.p95,
          targetLow: point.target.p05,
          targetHigh: point.target.p95
        })) || [],
        probTargetBeatsCurrent: result.probTargetBeatsCurrent,
        maxDrawdownMed: result.maxDrawdownMed,
        horizonMonths: result.horizonMonths,
        // NEW enhanced fields:
        endValue: result.endValue,
        endValueBand: result.endValueBand,
        breakevenMonthMed: result.breakevenMonthMed,
        downside: result.downside,
        costs: result.costs,
        diffAttribution: result.diffAttribution,
        stresses: result.stresses,
        // NEW: Multi-horizon snapshots
        multi: result.multi
      };
      
      setSimulationData(enhancedSimulationData);
      
    } catch (error) {
      console.error('Simulation error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      toast({
        title: "Simulation Failed",
        description: `Could not run portfolio simulation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setSimulationLoading(false);
    }
  };

  const convertToDetailedBuckets = (allocations: any) => {
    // Convert high-level allocations to detailed bucket allocations
    const detailed: Record<string, number> = {};
    const cashFixedIncome = parseFloat(allocations.cashFixedIncome || '0') / 100;
    const globalEquity = parseFloat(allocations.globalEquity || '0') / 100;
    const techGrowth = parseFloat(allocations.techGrowth || '0') / 100;
    const property = parseFloat(allocations.property || '0') / 100;
    const commoditiesGold = parseFloat(allocations.commoditiesGold || '0') / 100;
    const alternatives = parseFloat(allocations.alternatives || '0') / 100;
    const cryptocurrency = parseFloat(allocations.cryptocurrency || '0') / 100;
    const collectibles = parseFloat(allocations.collectibles || '0') / 100;
    
    // Map to detailed buckets - SAME as Gap Analysis mapToCanonicalBuckets for consistency
    detailed.CASH = cashFixedIncome * 0.3; // 30% of Cash & Fixed Income as cash
    detailed.BILLS_SHORT_GILTS = cashFixedIncome * 0.4; // 40% of Cash & Fixed Income as bills  
    detailed.GILTS_LONG = cashFixedIncome * 0.2; // 20% of Cash & Fixed Income as gilts
    detailed.IG_CREDIT = cashFixedIncome * 0.1;
    detailed.GLOBAL_EQUITY = globalEquity * 0.8;
    detailed.UK_EQUITY_VALUE = globalEquity * 0.2;
    detailed.GROWTH_TECH = techGrowth;
    detailed.PROPERTY_UK_RESI = property;
    detailed.COMMODITIES = commoditiesGold * 0.7;
    detailed.GOLD = commoditiesGold * 0.3;
    detailed.ALTERNATIVES = alternatives;
    detailed.CRYPTO_BTC = cryptocurrency * 0.6;
    detailed.CRYPTO_ETH = cryptocurrency * 0.4;
    detailed.COLLECTIBLES_ART = collectibles * 0.8;
    detailed.COLLECTIBLES_WINE = collectibles * 0.2;
    
    return detailed;
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <TrendingUp className="w-6 h-6 text-[var(--primary)]" />
            Portfolio Recommendations
          </CardTitle>
          <CardDescription className="text-base">
            AI-powered portfolio allocation based on your investment profile and market beliefs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!targetData && !loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-[var(--foreground)]">Generate Portfolio Recommendations</h3>
              <p className="text-[var(--muted-foreground)] mb-6 max-w-2xl mx-auto">
                Get a sophisticated portfolio allocation that combines your investor profile with your economic beliefs and professional house rules.
              </p>
              <Button 
                onClick={generateRecommendations}
                disabled={loading}
                className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] hover:from-[var(--primary)]/90 hover:to-[var(--secondary)]/90 text-white font-semibold px-8 py-3 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {loadingMessage || 'Processing...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Recommendations
                  </>
                )}
              </Button>
              {/* Debug info */}
              <div className="mt-4 text-xs text-gray-500">
                Debug: actualUserId={actualUserId}, hasPrefs={!!investorPrefs}, detectedPersona={investorPrefs?.detectedPersona}, loading={loading}
                <br />buttonDisabled={loading || !investorPrefs?.detectedPersona}, condition1={loading}, condition2={!investorPrefs?.detectedPersona}
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-[var(--foreground)]">Generating Recommendations</h3>
              <p className="text-[var(--muted-foreground)] mb-6">
                Analyzing your profile and market beliefs to create your optimal portfolio allocation...
              </p>
              <div className="w-64 mx-auto">
                <Progress value={undefined} className="h-2" />
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-red-600 dark:text-red-400">Generation Failed</h3>
              <p className="text-[var(--muted-foreground)] mb-6">{error}</p>
              <Button 
                onClick={generateRecommendations}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}

          {targetData && (
            <>
              <Tabs defaultValue="recommendations" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="recommendations" className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Recommendations
                  </TabsTrigger>
                  <TabsTrigger value="simulation" className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Simulation
                  </TabsTrigger>
                </TabsList>
              
              <TabsContent value="recommendations" className="space-y-8 mt-6">
                {/* Economic Scenarios Section */}
                <div className="mb-8">
                  <div className="bg-[var(--card)] rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-md)] p-6">
                    <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                      <i className="fas fa-chart-line text-[var(--info)]"></i>
                      Economic Scenario Analysis
                    </h3>
                    <div className="bg-[var(--info)]/10 border border-[var(--info)]/20 rounded-[var(--radius-md)] p-4 mb-6">
                      <div className="flex items-start gap-2">
                        <i className="fas fa-info-circle text-[var(--info)] mt-1"></i>
                        <div>
                          <span className="font-semibold text-[var(--info)]">📊 Blended Recommendation</span>
                          <p className="text-sm text-[var(--muted-foreground)] mt-1 leading-relaxed">
                            {targetData.narrative?.overview || "Built from your investor persona and tilted towards the scenarios you consider most likely. The mix aims to balance resilience and opportunity across different outcomes while maintaining sensible liquidity and diversification. It's a belief-aligned starting point, not a guarantee of performance or investment advice."}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(targetData.scenarioWeights)
                        .filter(([, weight]) => weight > 0)
                        .sort(([, a], [, b]) => b - a)
                        .map(([scenarioId, weight]) => {
                          const scenarioLabels: Record<string, string> = {
                            "S001": "Base Growth",
                            "S002": "Policy Support", 
                            "S003": "Inflation Hedges",
                            "S004": "Rates Normalisation",
                            "S005": "Quality Growth",
                            "S006": "Tech-led Growth",
                            "S007": "Stagflation Tilt",
                            "S008": "Soft-ish Inflation",
                            "S009": "Gilt Sell-off",
                            "S010": "Commodity Upswing"
                          };

                          const scenarioDescriptions: Record<string, string> = {
                            "S001": "Steady economic growth with balanced inflation and employment",
                            "S002": "Government stimulus drives market expansion and investment", 
                            "S003": "Rising inflation favors commodities and inflation-protected assets",
                            "S004": "Interest rates return to historical norms after period of change",
                            "S005": "High-quality companies outperform in selective market conditions",
                            "S006": "Technology sector leads broad economic transformation",
                            "S007": "Persistent inflation combined with economic stagnation",
                            "S008": "Moderate inflation rises but remains economically manageable",
                            "S009": "Bond market sell-off drives yields higher across duration",
                            "S010": "Commodity cycle upswing benefits resource-based investments"
                          };
                          
                          return (
                            <div key={scenarioId} className="p-4 bg-[var(--muted)]/20 rounded-[var(--radius-md)] border border-[var(--border)] hover:shadow-[var(--shadow-sm)] transition-shadow">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-[var(--foreground)] flex items-center gap-2">
                                  <i className="fas fa-chart-area text-[var(--secondary)] text-sm"></i>
                                  {scenarioLabels[scenarioId] || scenarioId}
                                </span>
                                <div className="bg-[var(--secondary)] text-[var(--secondary-foreground)] px-2 py-1 rounded-[var(--radius-sm)] text-sm font-bold">
                                  {(weight * 100).toFixed(1)}%
                                </div>
                              </div>
                              <div className="text-xs text-[var(--muted-foreground)] mb-2 font-mono">
                                {scenarioId}
                              </div>
                              <div className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                                {scenarioDescriptions[scenarioId] || "Economic scenario analysis"}
                              </div>
                            </div>
                          );
                        })
                      }
                    </div>
                  </div>
                </div>

              {/* Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-[var(--card)] rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <i className="fas fa-user-circle text-[var(--info)] text-lg"></i>
                    <h4 className="font-semibold text-[var(--muted-foreground)] text-sm">Investor Profile</h4>
                  </div>
                  <p className="text-2xl font-bold text-[var(--info)] mb-2">
                    {INVESTMENT_PERSONAS[targetData.personaId]?.name || targetData.personaId}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">Based on your quiz results</p>
                </div>
                <div className="p-6 bg-[var(--card)] rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <i className="fas fa-balance-scale text-[var(--success)] text-lg"></i>
                    <h4 className="font-semibold text-[var(--muted-foreground)] text-sm">Scenario Blending</h4>
                  </div>
                  <p className="text-2xl font-bold text-[var(--success)] mb-2">{(targetData.tiltStrength * 100).toFixed(0)}%</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Weighted across scenarios for uncertainty management</p>
                </div>
                <div className="p-6 bg-[var(--card)] rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <i className="fas fa-cogs text-[var(--warning)] text-lg"></i>
                    <h4 className="font-semibold text-[var(--muted-foreground)] text-sm">Adjustments</h4>
                  </div>
                  <p className="text-2xl font-bold text-[var(--warning)] mb-2">{targetData.adjustments.length}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">House rules applied</p>
                </div>
              </div>

              {/* Target Portfolio Chart */}
              <div className="mb-8">
                <div className="bg-[var(--card)] rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-md)] p-6">
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-6 flex items-center gap-2">
                    <i className="fas fa-pie-chart text-[var(--primary)]"></i>
                    Recommended Portfolio Allocation
                  </h3>
                  <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(targetData.targetMix)
                          .filter(([, value]) => value > 0.001)
                          .map(([bucket, value]) => ({
                            name: formatBucketName(bucket),
                            value: value * 100,
                            bucket
                          }))
                        }
                        cx="50%"
                        cy="40%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ value }) => `${value.toFixed(1)}%`}
                        labelLine={false}
                      >
                        {Object.entries(targetData.targetMix)
                          .filter(([, value]) => value > 0.001)
                          .map((_, index) => (
                            <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                          ))
                        }
                      </Pie>
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value: string) => value}
                        wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                      />
                      <RechartsTooltip formatter={(value: any) => [`${value.toFixed(1)}%`, 'Allocation']} />
                    </PieChart>
                  </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Portfolio Breakdown Table */}
              <div className="mb-8">
                <div className="bg-[var(--card)] rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-md)] p-6">
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-6 flex items-center gap-2">
                    <i className="fas fa-table text-[var(--primary)]"></i>
                    Detailed Allocation Breakdown
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse bg-[var(--background)] rounded-[var(--radius-md)] overflow-hidden">
                      <thead>
                        <tr className="bg-[var(--muted)]/30 border-b border-[var(--border)]">
                          <th className="text-left p-4 font-semibold text-[var(--foreground)]">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger className="cursor-help underline decoration-dotted flex items-center gap-1">
                                  <i className="fas fa-layer-group text-[var(--info)] text-sm"></i>
                                  Asset Class
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Investment categories such as equities, bonds, property, and alternatives</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </th>
                          <th className="text-right p-4 font-semibold text-[var(--foreground)]">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger className="cursor-help underline decoration-dotted flex items-center gap-1 justify-end">
                                  <i className="fas fa-user text-[var(--info)] text-sm"></i>
                                  Base %
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Starting allocation based on your investor persona before any adjustments</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </th>
                          <th className="text-right p-4 font-semibold text-[var(--foreground)]">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger className="cursor-help underline decoration-dotted flex items-center gap-1 justify-end">
                                  <i className="fas fa-chart-line text-[var(--secondary)] text-sm"></i>
                                  Scenario Blend %
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Allocation tilted towards your selected economic scenarios and beliefs</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </th>
                          <th className="text-right p-4 font-semibold text-[var(--foreground)]">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger className="cursor-help underline decoration-dotted flex items-center gap-1 justify-end">
                                  <i className="fas fa-target text-[var(--primary)] text-sm"></i>
                                  Final Target %
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Recommended allocation after applying professional house rules and constraints</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(targetData.targetMix)
                          .filter(([, value]) => value > 0.001)
                          .sort(([, a], [, b]) => b - a)
                          .map(([bucket, target]) => (
                            <tr key={bucket} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/10 transition-colors">
                              <td className="p-4 font-medium text-[var(--foreground)]">
                                {formatBucketName(bucket)}
                              </td>
                              <td className="p-4 text-right text-[var(--muted-foreground)] font-mono">
                                {formatPercentage(targetData.baseMix[bucket] || 0)}
                              </td>
                              <td className="p-4 text-right text-[var(--muted-foreground)] font-mono">
                                {formatPercentage(targetData.scenarioBlend[bucket] || 0)}
                              </td>
                              <td className="p-4 text-right font-bold text-[var(--primary)]">
                                {formatPercentage(target)}
                              </td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Strategic Commentary */}
              <div className="mb-8">
                <div className="bg-[var(--card)] rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-md)] p-6">
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-6 flex items-center gap-2">
                    <i className="fas fa-lightbulb text-[var(--warning)]"></i>
                    Strategic Commentary
                  </h3>
                  
                  {/* AI-Generated Commentary */}
                  {targetData.narrative?.bullets && targetData.narrative.bullets.length > 0 && (
                    <div className="bg-[var(--warning)]/10 border border-[var(--warning)]/20 rounded-[var(--radius-md)] p-4 mb-6">
                      <h4 className="font-medium text-[var(--warning)] text-sm mb-3 flex items-center">
                        <Brain className="w-4 h-4 mr-2" />
                        Portfolio Analysis
                      </h4>
                      <ul className="space-y-2">
                        {targetData.narrative.bullets.map((bullet, index) => (
                          <li key={index} className="text-sm text-[var(--muted-foreground)] leading-relaxed flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--warning)] mt-2 flex-shrink-0"></div>
                            <span dangerouslySetInnerHTML={{ __html: bullet.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                          </li>
                        ))}
                      </ul>
                    </div>
                )}
                
                  {/* Flags and Adjustments */}
                  {targetData.flags.length > 0 && (
                    <div className="bg-[var(--warning)]/15 border border-[var(--warning)]/30 rounded-[var(--radius-md)] p-4 mb-4">
                      <h4 className="font-semibold text-[var(--warning)] mb-2 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Portfolio Flags
                      </h4>
                      <ul className="space-y-1">
                        {targetData.flags.map((flag, index) => (
                          <li key={index} className="text-sm text-[var(--muted-foreground)]">
                            • {flag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {targetData.adjustments.length > 0 && (
                    <div className="bg-[var(--info)]/15 border border-[var(--info)]/30 rounded-[var(--radius-md)] p-4">
                      <h4 className="font-semibold text-[var(--info)] mb-2 flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        House Rules Applied
                      </h4>
                      <ul className="space-y-1">
                        {targetData.adjustments.map((adjustment, index) => (
                          <li key={index} className="text-sm text-[var(--muted-foreground)]">
                            • {adjustment}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Regenerate Button */}
              <div className="text-center pt-6">
                <Button 
                  onClick={generateRecommendations}
                  variant="outline"
                  className="border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/10"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Regenerate Recommendations
                </Button>
              </div>
              </TabsContent>
              
              <TabsContent value="simulation" className="space-y-8 mt-6">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="text-center">
                    <h3 className="text-xl font-semibold mb-2 text-[var(--foreground)]">Portfolio Simulation</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      If your outlook plays out, how might your portfolios move?
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-4 p-4 bg-[var(--muted)]/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="horizon">Time Horizon:</Label>
                      <Select value={horizonMonths.toString()} onValueChange={(value) => setHorizonMonths(parseInt(value))}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6">6m</SelectItem>
                          <SelectItem value="12">12m</SelectItem>
                          <SelectItem value="18">18m</SelectItem>
                          <SelectItem value="24">24m</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={runSimulation}
                      disabled={simulationLoading || !targetData}
                      className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] hover:from-[var(--primary)]/90 hover:to-[var(--secondary)]/90 text-white"
                    >
                      {simulationLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Running...
                        </>
                      ) : (
                        <>
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Run Simulation
                        </>
                      )}
                    </Button>
                  </div>

                  {simulationData && simulationData.series && simulationData.series.length > 0 && (
                    <>
                      {/* Key Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="p-6 bg-[var(--card)] rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-shadow">
                          <div className="flex items-center gap-2 mb-3">
                            <i className="fas fa-user text-[var(--info)] text-lg"></i>
                            <div className="text-sm font-medium text-[var(--muted-foreground)]">Current Portfolio</div>
                          </div>
                          <div className="text-3xl font-bold text-[var(--info)] mb-2">
                            {simulationData.portfolioReturnCurrent >= 0 ? '+' : ''}{(simulationData.portfolioReturnCurrent * 100).toFixed(2)}%
                          </div>
                          <div className="text-xs text-[var(--muted-foreground)]">over {horizonMonths} months</div>
                        </div>
                        
                        <div className="p-6 bg-[var(--card)] rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-shadow">
                          <div className="flex items-center gap-2 mb-3">
                            <i className="fas fa-bullseye text-[var(--success)] text-lg"></i>
                            <div className="text-sm font-medium text-[var(--muted-foreground)]">Recommended Portfolio</div>
                          </div>
                          <div className="text-3xl font-bold text-[var(--success)] mb-2">
                            {simulationData.portfolioReturnTarget >= 0 ? '+' : ''}{(simulationData.portfolioReturnTarget * 100).toFixed(2)}%
                          </div>
                          <div className="text-xs text-[var(--muted-foreground)]">over {horizonMonths} months</div>
                        </div>
                        
                        <div className="p-6 bg-[var(--card)] rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-shadow">
                          <div className="flex items-center gap-2 mb-3">
                            <i className="fas fa-arrow-up text-[var(--primary)] text-lg"></i>
                            <div className="text-sm font-medium text-[var(--muted-foreground)]">Difference</div>
                          </div>
                          <div className="text-3xl font-bold text-[var(--primary)] mb-2">
                            {((simulationData.portfolioReturnTarget - simulationData.portfolioReturnCurrent) * 100) >= 0 ? '+' : ''}
                            {((simulationData.portfolioReturnTarget - simulationData.portfolioReturnCurrent) * 100).toFixed(2)} pp
                          </div>
                          <div className="text-xs text-[var(--muted-foreground)]">potential improvement</div>
                        </div>
                      </div>

                      {/* Simulation Methodology Explainer */}
                      <div className="mb-6 p-6 bg-[var(--card)] rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-md)]">
                        <h4 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                          <i className="fas fa-chart-line text-[var(--info)]"></i>
                          How This Simulation Works
                        </h4>
                        <div className="text-sm text-[var(--muted-foreground)] space-y-3">
                          <p>
                            <strong>Monte Carlo Analysis:</strong> We run 5,000+ different market scenarios over your chosen time horizon, 
                            comparing how your current portfolio allocation would perform against our recommended allocation.
                          </p>
                          <p>
                            <strong>Current Mix:</strong> Your actual portfolio holdings (e.g., {Math.round((simulationData.contributionsCurrent?.['GLOBAL_EQUITY'] || 0) * 100)}% Global Equity, {Math.round((simulationData.contributionsCurrent?.['CASH'] || 0) * 100)}% Cash, etc.)
                          </p>
                          <p>
                            <strong>Recommended Mix:</strong> Our AI-driven allocation based on your investor profile, risk preferences, and economic beliefs 
                            (e.g., {Math.round((simulationData.contributionsTarget?.['GLOBAL_EQUITY'] || 0) * 100)}% Global Equity, {Math.round((simulationData.contributionsTarget?.['CASH'] || 0) * 100)}% Cash, plus diversification into real assets, etc.)
                          </p>
                          <p>
                            <strong>Key Insight:</strong> This shows the potential performance difference between maintaining your current strategy 
                            versus implementing our personalized recommendations over {simulationData.horizonMonths} months.
                          </p>
                        </div>
                      </div>

                      {/* Multi-Horizon Snapshots */}
                      {simulationData.multi && simulationData.multi.length > 0 && (
                        <div className="mb-8">
                          <div className="bg-[var(--card)] rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-md)] p-6">
                            <h4 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                              <i className="fas fa-clock text-[var(--primary)]"></i>
                              Horizon Snapshots
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              {simulationData.multi.map((horizon, idx) => (
                                <div key={idx} className="p-4 bg-[var(--muted)]/10 rounded-[var(--radius-md)] border border-[var(--border)] hover:shadow-[var(--shadow-sm)] transition-shadow">
                                  <div className="text-center mb-3">
                                    <div className="text-lg font-bold text-[var(--primary)]">{horizon.horizonMonths} Months</div>
                                  </div>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-[var(--muted-foreground)]">Current:</span>
                                      <div className="text-right">
                                        <div className="font-mono text-[var(--foreground)]">{(horizon.expectedReturnCurrent * 100).toFixed(2)}%</div>
                                        <div className="text-xs text-[var(--muted-foreground)]">£{((horizon.endValue.current * (investorPrefs?.actualPortfolioValue || 500000) / 100) / 1000).toFixed(0)}k</div>
                                      </div>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-[var(--muted-foreground)]">Target:</span>
                                      <div className="text-right">
                                        <div className="font-mono text-[var(--foreground)]">{(horizon.expectedReturnTarget * 100).toFixed(2)}%</div>
                                        <div className="text-xs text-[var(--muted-foreground)]">£{((horizon.endValue.target * (investorPrefs?.actualPortfolioValue || 500000) / 100) / 1000).toFixed(0)}k</div>
                                      </div>
                                    </div>
                                    <div className="border-t border-[var(--border)] pt-2">
                                      <div className="flex justify-between items-center">
                                        <span className="text-[var(--muted-foreground)] font-medium">Difference:</span>
                                        <div className="text-right">
                                          <div className={`font-mono font-bold ${horizon.diffPp >= 0 ? 'text-[var(--success)]' : 'text-[var(--destructive)]'}`}>
                                            {horizon.diffPp >= 0 ? '+' : ''}{(horizon.diffPp * 100).toFixed(2)}%
                                          </div>
                                          <div className={`text-xs ${horizon.diffPp >= 0 ? 'text-[var(--success)]' : 'text-[var(--destructive)]'}`}>
                                            £{((horizon.endValue.diffGBP * (investorPrefs?.actualPortfolioValue || 500000) / 100) / 1000).toFixed(1)}k
                                          </div>
                                        </div>
                                      </div>
                                      {horizon.breakevenMonthMed && (
                                        <div className="flex justify-between mt-1">
                                          <span className="text-[var(--muted-foreground)] text-xs">Breakeven:</span>
                                          <span className="text-xs text-[var(--info)]">Month {horizon.breakevenMonthMed}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="text-xs text-[var(--muted-foreground)] text-center bg-[var(--muted)]/20 p-3 rounded-[var(--radius-sm)]">
                              <i className="fas fa-info-circle mr-1"></i>
                              We fade scenario effects for longer horizons (τ = 24m) to reflect uncertainty. Not a guarantee.
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Enhanced Analytics */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {/* £ Impact */}
                        {simulationData.endValue && (
                          <div className="p-6 bg-[var(--card)] rounded-[var(--radius-md)] border border-[var(--border)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow">
                            <div className="flex items-center gap-2 mb-2">
                              <i className="fas fa-pound-sign text-[var(--success)] text-lg"></i>
                              <div className="text-sm font-medium text-[var(--muted-foreground)]">£ Impact</div>
                            </div>
                            <div className="text-2xl font-bold text-[var(--success)] mb-1">
                              £{((simulationData.endValue.diffGBP * (investorPrefs?.actualPortfolioValue || 500000) / 100) / 1000).toFixed(1)}k
                            </div>
                            <div className="text-xs text-[var(--muted-foreground)]">
                              median uplift at horizon
                            </div>
                          </div>
                        )}

                        {/* Win Probability */}
                        {simulationData.probTargetBeatsCurrent !== undefined && (
                          <div className="p-6 bg-[var(--card)] rounded-[var(--radius-md)] border border-[var(--border)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow">
                            <div className="flex items-center gap-2 mb-2">
                              <i className="fas fa-trophy text-[var(--warning)] text-lg"></i>
                              <div className="text-sm font-medium text-[var(--muted-foreground)]">Win Probability</div>
                            </div>
                            <div className="text-2xl font-bold text-[var(--warning)] mb-1">
                              {(simulationData.probTargetBeatsCurrent * 100).toFixed(1)}%
                            </div>
                            <div className="text-xs text-[var(--muted-foreground)]">
                              recommended beats current
                            </div>
                          </div>
                        )}

                        {/* Breakeven */}
                        {simulationData.breakevenMonthMed !== undefined && (
                          <div className="p-6 bg-[var(--card)] rounded-[var(--radius-md)] border border-[var(--border)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow">
                            <div className="flex items-center gap-2 mb-2">
                              <i className="fas fa-calendar-check text-[var(--info)] text-lg"></i>
                              <div className="text-sm font-medium text-[var(--muted-foreground)]">Breakeven</div>
                            </div>
                            <div className="text-2xl font-bold text-[var(--info)] mb-1">
                              {simulationData.breakevenMonthMed ? `Month ${simulationData.breakevenMonthMed}` : '> Horizon'}
                            </div>
                            <div className="text-xs text-[var(--muted-foreground)]">
                              target overtakes current
                            </div>
                          </div>
                        )}

                        {/* Downside Risk */}
                        {simulationData.downside && (
                          <div className="p-6 bg-[var(--card)] rounded-[var(--radius-md)] border border-[var(--border)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow">
                            <div className="flex items-center gap-2 mb-2">
                              <i className="fas fa-shield-alt text-[var(--destructive)] text-lg"></i>
                              <div className="text-sm font-medium text-[var(--muted-foreground)]">Downside Risk</div>
                            </div>
                            <div className="text-lg font-bold text-[var(--destructive)] mb-1">
                              {(simulationData.downside.probLoss.current * 100).toFixed(1)}% → {(simulationData.downside.probLoss.target * 100).toFixed(1)}%
                            </div>
                            <div className="text-xs text-[var(--muted-foreground)]">
                              probability of loss
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Attribution Analysis */}
                      {simulationData.diffAttribution && simulationData.diffAttribution.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-[var(--foreground)] mb-3">Why the Difference?</h4>
                          <div className="space-y-2">
                            {simulationData.diffAttribution.map((attr, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-[var(--muted)]/30 rounded-lg">
                                <span className="font-medium text-[var(--foreground)]">{attr.factor}</span>
                                <div className="flex items-center gap-2">
                                  <div className={`w-20 h-2 rounded ${attr.pp >= 0 ? 'bg-green-500' : 'bg-red-500'}`} 
                                       style={{width: `${Math.abs(attr.pp) * 1000}px`}}>
                                  </div>
                                  <span className={`text-sm font-mono ${attr.pp >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {attr.pp >= 0 ? '+' : ''}{(attr.pp * 100).toFixed(2)}%
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Stress Testing */}
                      {simulationData.stresses && simulationData.stresses.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-[var(--foreground)] mb-3">Stress Tests</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {simulationData.stresses.map((stress, idx) => (
                              <div key={idx} className="p-4 bg-[var(--muted)]/20 rounded-lg border">
                                <div className="text-sm font-medium text-[var(--foreground)] mb-2">{stress.label}</div>
                                <div className="text-xs text-[var(--muted-foreground)] mb-1">Current: {(stress.retCurrent * 100).toFixed(2)}%</div>
                                <div className="text-xs text-[var(--muted-foreground)] mb-1">Target: {(stress.retTarget * 100).toFixed(2)}%</div>
                                <div className={`text-sm font-bold ${stress.diffPp >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                  Diff: {stress.diffPp >= 0 ? '+' : ''}{(stress.diffPp * 100).toFixed(2)}%
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Portfolio Evolution Chart */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-[var(--foreground)]">Portfolio Evolution</h4>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={simulationData.series}>
                              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                              <XAxis 
                                dataKey="t" 
                                stroke="var(--muted-foreground)"
                                label={{ value: 'Months', position: 'insideBottom', offset: -5, style: { fill: 'var(--muted-foreground)' } }}
                              />
                              <YAxis 
                                stroke="var(--muted-foreground)"
                                label={{ value: 'Portfolio Value', angle: -90, position: 'insideLeft', style: { fill: 'var(--muted-foreground)' } }}
                                domain={['dataMin - 2', 'dataMax + 2']}
                                tickFormatter={(value) => {
                                  const actualValue = value * (investorPrefs?.actualPortfolioValue || 500000) / 100;
                                  return `£${(actualValue / 1000).toFixed(0)}k`;
                                }}
                              />
                              <RechartsTooltip 
                                contentStyle={{ 
                                  backgroundColor: 'var(--background)', 
                                  border: '1px solid var(--border)', 
                                  borderRadius: '8px',
                                  color: 'var(--foreground)'
                                }}
                                formatter={(value: any, name: string) => {
                                  const actualValue = value * (investorPrefs?.actualPortfolioValue || 500000) / 100;
                                  const formattedValue = new Intl.NumberFormat('en-GB', {
                                    style: 'currency',
                                    currency: 'GBP',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                  }).format(actualValue);
                                  return [
                                    formattedValue,
                                    name === 'current' ? 'Current Portfolio' : 'Recommended Portfolio'
                                  ];
                                }}
                                labelFormatter={(label) => `Month ${label}`}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="current" 
                                stroke="#3b82f6" 
                                strokeWidth={2}
                                dot={false}
                                name="current"
                              />
                              <Line 
                                type="monotone" 
                                dataKey="target" 
                                stroke="#10b981" 
                                strokeWidth={2}
                                dot={false}
                                name="target"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Top Contributors */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-[var(--foreground)]">Current Portfolio - Top Contributors</h4>
                          <div className="space-y-2">
                            {Object.entries(simulationData.contributionsCurrent)
                              .sort(([,a], [,b]) => Math.abs(b) - Math.abs(a))
                              .slice(0, 5)
                              .filter(([,value]) => Math.abs(value) > 0.001)
                              .map(([bucket, contribution]) => (
                                <div key={bucket} className="flex items-center justify-between p-2 bg-[var(--muted)]/30 rounded">
                                  <span className="text-sm font-medium">{formatBucketName(bucket)}</span>
                                  <span className={`text-sm font-semibold ${contribution >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {contribution >= 0 ? '+' : ''}{(contribution * 100).toFixed(1)} pp
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-[var(--foreground)]">Recommended Portfolio - Top Contributors</h4>
                          <div className="space-y-2">
                            {Object.entries(simulationData.contributionsTarget)
                              .sort(([,a], [,b]) => Math.abs(b) - Math.abs(a))
                              .slice(0, 5)
                              .filter(([,value]) => Math.abs(value) > 0.001)
                              .map(([bucket, contribution]) => (
                                <div key={bucket} className="flex items-center justify-between p-2 bg-[var(--muted)]/30 rounded">
                                  <span className="text-sm font-medium">{formatBucketName(bucket)}</span>
                                  <span className={`text-sm font-semibold ${contribution >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {contribution >= 0 ? '+' : ''}{(contribution * 100).toFixed(1)} pp
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>

                      {/* Footnote */}
                      <div className="text-xs text-[var(--muted-foreground)] text-center p-4 bg-[var(--muted)]/20 rounded-lg">
                        Scenario shocks are illustrative and not guarantees. Figures are rounded. 
                        Simulation uses deterministic compounding based on your economic outlook.
                      </div>
                    </>
                  )}

                  {!simulationData && !simulationLoading && targetData && (
                    <div className="text-center py-8">
                      <div className="text-[var(--muted-foreground)]">
                        Run a simulation to see how your portfolios might perform under your economic outlook.
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            
            {/* Continue to Actions Button */}
            <div className="text-center pt-8 pb-4">
              <Button 
                onClick={async () => {
                  if (!targetData?.targetMix || !investorPrefs?.investorName || !actualUserId) {
                    console.error('Missing required data for saving recommendations');
                    return;
                  }

                  try {
                    console.log('=== SAVING RECOMMENDED PORTFOLIO ===');
                    console.log('Data to save:', {
                      userId: actualUserId,
                      investorName: investorPrefs.investorName,
                      targetMixKeys: Object.keys(targetData.targetMix)
                    });

                    // Save the recommended portfolio allocations
                    const response = await fetch('/api/investors/recommended-portfolio', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        userId: actualUserId,
                        investorName: investorPrefs.investorName,
                        targetMix: targetData.targetMix
                      }),
                    });

                    console.log('Response status:', response.status);
                    console.log('Response ok:', response.ok);

                    if (!response.ok) {
                      const errorText = await response.text();
                      console.error('Response error text:', errorText);
                      throw new Error(`Failed to save recommended portfolio: ${response.status} ${errorText}`);
                    }

                    const result = await response.json();
                    console.log('=== SAVE SUCCESS ===');
                    console.log('Recommended portfolio saved successfully:', result);

                    // Navigate to Action Plan tab - force navigation
                    const tabButtons = document.querySelectorAll('[data-tab="action"]');
                    if (tabButtons.length > 0) {
                      (tabButtons[0] as HTMLElement).click();
                    }
                    
                    // Show success message
                    toast({
                      title: "Recommendations Saved",
                      description: "Your portfolio recommendations have been saved successfully!",
                    });

                  } catch (error) {
                    console.error('=== SAVE ERROR ===');
                    console.error('Error type:', typeof error);
                    console.error('Error name:', error?.name);
                    console.error('Error message:', error?.message);
                    console.error('Full error object:', error);
                    console.error('Error stack:', error?.stack);
                    
                    // Show error message to user
                    toast({
                      title: "Save Error",
                      description: "There was an issue saving your recommendations, but you can still continue.",
                      variant: "destructive",
                    });
                    
                    // Still navigate even if save fails - force navigation
                    const tabButtons = document.querySelectorAll('[data-tab="action"]');
                    if (tabButtons.length > 0) {
                      (tabButtons[0] as HTMLElement).click();
                    }
                  }
                }}
                className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] hover:from-[var(--primary)]/90 hover:to-[var(--secondary)]/90 text-white font-semibold px-8 py-3"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Continue to Actions
              </Button>
            </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Action Plan Component
function ActionPlanComponent({ userId }: { userId: string }) {
  const [actionsData, setActionsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeStage, setActiveStage] = useState<1 | 2>(1);
  const [error, setError] = useState<string | null>(null);
  const [investorPrefs, setInvestorPrefs] = useState<any>(null);
  const [beliefData, setBeliefData] = useState<any>(null);
  const [gapAnalysisData, setGapAnalysisData] = useState<any>(null);
  const [currentAllocations, setCurrentAllocations] = useState<any>(null);
  const [matchedPersona, setMatchedPersona] = useState<PersonaDef | null>(null);
  const [isToolkitModalOpen, setIsToolkitModalOpen] = useState(false);
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Function to get current user ID (same as used by recommendations)
  const getUserId = () => {
    try {
      const storedQuizData = localStorage.getItem('investorQuizData');
      if (storedQuizData) {
        const quizData = JSON.parse(storedQuizData);
        return quizData.userId || `demo-${Date.now()}`;
      }
    } catch (error) {
      console.log('Error reading quiz data for userId:', error);
    }
    return `demo-${Date.now()}`;
  };

  // Don't auto-fetch on mount - let user click to generate
  // This prevents issues with mismatched user IDs

  const generateActionPlan = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use getUserId() to get the CURRENT active user (same as recommendations)
      const actualUserId = getUserId();
      console.log('Action Plan: Using current active userId (from getUserId):', actualUserId);
      
      // First try to get the actual saved portfolio value from preferences
      let portfolioValue = 100000; // Default fallback
      
      // Try to get actualPortfolioValue from saved preferences
      const prefsResponse = await fetch(`/api/investors/${actualUserId}/preferences`);
      if (prefsResponse.ok) {
        const prefs = await prefsResponse.json();
        if (prefs.actualPortfolioValue && prefs.actualPortfolioValue > 0) {
          portfolioValue = prefs.actualPortfolioValue;
          console.log('Action Plan: Using saved actual portfolio value:', portfolioValue);
        } else {
          console.log('Action Plan: No actualPortfolioValue in preferences, trying to calculate from holdings');
          
          // Fallback: calculate from holdings
          const [portfolioResponse, propertiesResponse, alternativesResponse] = await Promise.all([
            fetch(`/api/investors/${actualUserId}/portfolio-holdings`),
            fetch(`/api/properties/${actualUserId}`),
            fetch(`/api/alternatives/${actualUserId}`)
          ]);
          
          if (portfolioResponse.ok && propertiesResponse.ok && alternativesResponse.ok) {
            const [portfolioHoldings, properties, alternatives] = await Promise.all([
              portfolioResponse.json(),
              propertiesResponse.json(),
              alternativesResponse.json()
            ]);
            
            const holdingsValue = portfolioHoldings.reduce((sum: number, holding: any) => 
              sum + parseFloat(holding.currentValueGbp || '0'), 0);
            const propertyValue = properties.reduce((sum: number, property: any) => 
              sum + parseFloat(property.currentValueGbp || '0'), 0);
            const alternativeValue = alternatives.reduce((sum: number, alt: any) => 
              sum + parseFloat(alt.currentValueGbp || '0'), 0);
            
            const totalValue = holdingsValue + propertyValue + alternativeValue;
            
            if (totalValue > 0) {
              portfolioValue = totalValue;
              console.log('Action Plan: Using calculated portfolio value from holdings:', portfolioValue);
            } else {
              portfolioValue = 350000; // Demo value only if no saved data available
              console.log('Action Plan: Using demo portfolio value (no saved data):', portfolioValue);
            }
          } else {
            portfolioValue = 350000; // Demo value if API calls fail
            console.log('Action Plan: Using demo portfolio value (API failed):', portfolioValue);
          }
        }
      } else {
        portfolioValue = 350000; // Demo value if preferences not found
        console.log('Action Plan: Using demo portfolio value (no preferences):', portfolioValue);
      }
      
      // Fetch investor preferences to get recommended portfolio
      const prefsResponse2 = await fetch(`/api/investors/${actualUserId}/preferences`);
      console.log('Action Plan: Preferences response status:', prefsResponse2.status);
      
      let targetMix;
      let hasRealData = false;
      
      if (!prefsResponse2.ok) {
        console.log('Action Plan: No preferences found, using demo target portfolio');
        // Use varied demo based on random selection to show different results
        const demoPortfolios = [
          // BTL Mogul (property-focused)
          {
            CASH: 0.077, BILLS_SHORT_GILTS: 0.113, GILTS_LONG: 0.033, IG_CREDIT: 0.111,
            GLOBAL_EQUITY: 0.294, UK_EQUITY_VALUE: 0.106, GROWTH_TECH: 0.046, PROPERTY_UK_RESI: 0.061,
            COMMODITIES: 0.042, GOLD: 0.057, ALTERNATIVES: 0.020, CRYPTO_BTC: 0.000,
            CRYPTO_ETH: 0.000, COLLECTIBLES_ART: 0.035, COLLECTIBLES_WINE: 0.005
          },
          // Tech Worker (growth-focused)
          {
            CASH: 0.050, BILLS_SHORT_GILTS: 0.080, GILTS_LONG: 0.020, IG_CREDIT: 0.100,
            GLOBAL_EQUITY: 0.400, UK_EQUITY_VALUE: 0.150, GROWTH_TECH: 0.120, PROPERTY_UK_RESI: 0.030,
            COMMODITIES: 0.025, GOLD: 0.015, ALTERNATIVES: 0.010, CRYPTO_BTC: 0.000,
            CRYPTO_ETH: 0.000, COLLECTIBLES_ART: 0.000, COLLECTIBLES_WINE: 0.000
          },
          // Conservative Saver (bonds-focused)
          {
            CASH: 0.200, BILLS_SHORT_GILTS: 0.250, GILTS_LONG: 0.150, IG_CREDIT: 0.200,
            GLOBAL_EQUITY: 0.150, UK_EQUITY_VALUE: 0.050, GROWTH_TECH: 0.000, PROPERTY_UK_RESI: 0.000,
            COMMODITIES: 0.000, GOLD: 0.000, ALTERNATIVES: 0.000, CRYPTO_BTC: 0.000,
            CRYPTO_ETH: 0.000, COLLECTIBLES_ART: 0.000, COLLECTIBLES_WINE: 0.000
          }
        ];
        targetMix = demoPortfolios[Math.floor(Math.random() * demoPortfolios.length)];
      } else {
        const preferences = await prefsResponse2.json();
        console.log('Action Plan: Fetched preferences:', preferences);
        
        // Store preferences for summary display
        setInvestorPrefs(preferences);
        
        // Extract matched persona using same logic as recommendations
        let personaId = (preferences as any)?.matched_persona_code || 
                       (preferences as any)?.matchedPersonaCode || 
                       preferences?.detectedPersona;
        
        // Fallback to quiz analysis if no persona is saved
        if (!personaId && preferences?.quizAnswers) {
          try {
            const quizAnswers = JSON.parse(preferences.quizAnswers);
            if (quizAnswers.length > 0 && quizAnswers[0].matchedPersonaCode) {
              personaId = quizAnswers[0].matchedPersonaCode;
            } else {
              // Last resort: basic risk tolerance mapping
              const riskQuestion = quizAnswers.find((q: any) => q.questionId === 'risk_tolerance');
              if (riskQuestion) {
                const riskToPersona: Record<number, string> = {
                  0: 'P004', // Conservative -> The Old Fashioned Saver
                  1: 'P001', // Moderate Conservative -> The Retirement Planner  
                  2: 'P009', // Balanced -> The Global Nomad
                  3: 'P008', // Growth -> The Young Professional
                  4: 'P003'  // Aggressive -> The Crypto Enthusiast
                };
                personaId = riskToPersona[riskQuestion.optionIndex] || 'P009';
              }
            }
          } catch (error) {
            console.error('Failed to parse quiz answers:', error);
          }
        }
        
        // Set matched persona from INVESTMENT_PERSONAS
        if (personaId && INVESTMENT_PERSONAS[personaId]) {
          setMatchedPersona(INVESTMENT_PERSONAS[personaId]);
        }
        
        // Fetch belief data for summary display
        try {
          const beliefResponse = await fetch(`/api/investors/${actualUserId}/belief-responses`);
          if (beliefResponse.ok) {
            const belief = await beliefResponse.json();
            setBeliefData(belief);
          }
        } catch (error) {
          console.log('Could not fetch belief data:', error);
        }
        
        // Store current allocations from global state
        const currentFormAllocations = (window as any).currentFormAllocations;
        if (currentFormAllocations) {
          setCurrentAllocations(currentFormAllocations);
        }
        
        if (!preferences.recommendedPortfolioAllocations) {
          console.log('Action Plan: No saved recommendations, using demo target portfolio');
          // Use varied demo portfolio
          const demoPortfolios = [
            // BTL Mogul (property-focused)
            {
              CASH: 0.077, BILLS_SHORT_GILTS: 0.113, GILTS_LONG: 0.033, IG_CREDIT: 0.111,
              GLOBAL_EQUITY: 0.294, UK_EQUITY_VALUE: 0.106, GROWTH_TECH: 0.046, PROPERTY_UK_RESI: 0.061,
              COMMODITIES: 0.042, GOLD: 0.057, ALTERNATIVES: 0.020, CRYPTO_BTC: 0.000,
              CRYPTO_ETH: 0.000, COLLECTIBLES_ART: 0.035, COLLECTIBLES_WINE: 0.005
            },
            // Tech Worker (growth-focused)
            {
              CASH: 0.050, BILLS_SHORT_GILTS: 0.080, GILTS_LONG: 0.020, IG_CREDIT: 0.100,
              GLOBAL_EQUITY: 0.400, UK_EQUITY_VALUE: 0.150, GROWTH_TECH: 0.120, PROPERTY_UK_RESI: 0.030,
              COMMODITIES: 0.025, GOLD: 0.015, ALTERNATIVES: 0.010, CRYPTO_BTC: 0.000,
              CRYPTO_ETH: 0.000, COLLECTIBLES_ART: 0.000, COLLECTIBLES_WINE: 0.000
            }
          ];
          targetMix = demoPortfolios[Math.floor(Math.random() * demoPortfolios.length)];
        } else {
          // Parse the saved recommended portfolio
          targetMix = JSON.parse(preferences.recommendedPortfolioAllocations);
          hasRealData = true;
          console.log('Action Plan: Using saved target mix:', targetMix);
          
          // CRITICAL: Use the actualPortfolioValue from preferences if available
          if (preferences.actualPortfolioValue) {
            portfolioValue = parseFloat(preferences.actualPortfolioValue);
            console.log('Action Plan: Using actualPortfolioValue from preferences:', portfolioValue);
            
            // Store investor preferences for gap analysis to use same data source
            (window as any).actionPlanInvestorPreferences = preferences;
            
            // Also override the stored portfolio data to indicate we have real data
            window.actionPlanPortfolioData = {
              portfolioHoldings: [],
              properties: [],
              alternatives: [],
              totalValue: portfolioValue,
              hasRealData: true,
              actualPortfolioAllocations: preferences.actualPortfolioAllocations
            };
          }
        }
      }
      
      // Store current form allocations globally for Action Plan to use (same source as Gap Analysis)
      // This is set from the actual portfolio form component
      
      // Calculate actual current portfolio mix from real data
      const calculateCurrentMix = (portfolioData: any) => {
        const { portfolioHoldings, properties, alternatives, totalValue, hasRealData, actualPortfolioAllocations } = portfolioData;
        
        // CRITICAL: Always use current form allocations (same as Gap Analysis) instead of saved database values
        console.log('Action Plan: Using current form allocations (same source as Gap Analysis)');
        
        // Get the current form allocations (same as Gap Analysis)
        const currentFormAllocations = (window as any).currentFormAllocations;
        
        if (currentFormAllocations) {
          // Use same mapping logic as Gap Analysis (mapToCanonicalBuckets)
          const currentMix = {
            // Cash & Fixed Income breakdown (same ratios as current portfolio)
            CASH: (parseFloat(currentFormAllocations.cashFixedIncome) || 0) * 0.3 / 100,
            BILLS_SHORT_GILTS: (parseFloat(currentFormAllocations.cashFixedIncome) || 0) * 0.4 / 100,
            GILTS_LONG: (parseFloat(currentFormAllocations.cashFixedIncome) || 0) * 0.2 / 100,
            IG_CREDIT: (parseFloat(currentFormAllocations.cashFixedIncome) || 0) * 0.1 / 100,
            
            // Global Equity breakdown (same ratios as current portfolio)
            GLOBAL_EQUITY: (parseFloat(currentFormAllocations.globalEquity) || 0) * 0.7 / 100,
            UK_EQUITY_VALUE: (parseFloat(currentFormAllocations.globalEquity) || 0) * 0.3 / 100,
            
            // Direct mappings
            GROWTH_TECH: (parseFloat(currentFormAllocations.techGrowth) || 0) / 100,
            PROPERTY_UK_RESI: (parseFloat(currentFormAllocations.property) || 0) / 100,
            ALTERNATIVES: (parseFloat(currentFormAllocations.alternatives) || 0) / 100,
            
            // Commodities & Gold breakdown (same ratios as current portfolio)
            COMMODITIES: (parseFloat(currentFormAllocations.commoditiesGold) || 0) * 0.6 / 100,
            GOLD: (parseFloat(currentFormAllocations.commoditiesGold) || 0) * 0.4 / 100,
            
            // Cryptocurrency breakdown (same ratios as current portfolio)
            CRYPTO_BTC: (parseFloat(currentFormAllocations.cryptocurrency) || 0) * 0.6 / 100,
            CRYPTO_ETH: (parseFloat(currentFormAllocations.cryptocurrency) || 0) * 0.4 / 100,
            
            // Collectibles breakdown (same ratios as current portfolio)
            COLLECTIBLES_ART: (parseFloat(currentFormAllocations.collectibles) || 0) * 0.7 / 100,
            COLLECTIBLES_WINE: (parseFloat(currentFormAllocations.collectibles) || 0) * 0.3 / 100,
          };
          
          console.log('Action Plan: Calculated current mix from FORM DATA (same as Gap Analysis):', currentMix);
          return currentMix;
        }
        
        // Fallback: Use saved portfolio allocations if form data not available
        if (hasRealData && actualPortfolioAllocations) {
          console.log('Action Plan: Fallback to actualPortfolioAllocations from preferences');
          const allocations = JSON.parse(actualPortfolioAllocations);
          
          // Convert percentages to decimals and map to canonical buckets (old mapping)
          const currentMix = {
            CASH: parseFloat(allocations.cashFixedIncome || '0') / 100,
            BILLS_SHORT_GILTS: 0, // Not in Werner's categories
            GILTS_LONG: 0, // Not in Werner's categories  
            IG_CREDIT: 0, // Not in Werner's categories
            GLOBAL_EQUITY: parseFloat(allocations.globalEquity || '0') / 100,
            UK_EQUITY_VALUE: 0, // Not in Werner's categories
            GROWTH_TECH: parseFloat(allocations.techGrowth || '0') / 100,
            PROPERTY_UK_RESI: parseFloat(allocations.property || '0') / 100,
            COMMODITIES: parseFloat(allocations.commoditiesGold || '0') / 100,
            GOLD: 0, // Commodities includes gold in Werner's data
            ALTERNATIVES: parseFloat(allocations.alternatives || '0') / 100,
            CRYPTO_BTC: parseFloat(allocations.cryptocurrency || '0') / 100,
            CRYPTO_ETH: 0, // All crypto in one bucket for Werner
            COLLECTIBLES_ART: parseFloat(allocations.collectibles || '0') / 100,
            COLLECTIBLES_WINE: 0 // All collectibles in one bucket for Werner
          };
          
          console.log('Action Plan: Calculated current mix from saved preferences:', currentMix);
          return currentMix;
        }
        
        if (!hasRealData || totalValue === 0) {
          // Use varied demo current portfolios to show different gaps
          const demoCurrentPortfolios = [
            // Conservative starting position
            {
              CASH: 0.25, BILLS_SHORT_GILTS: 0.15, GILTS_LONG: 0.10, IG_CREDIT: 0.20,
              GLOBAL_EQUITY: 0.20, UK_EQUITY_VALUE: 0.10, GROWTH_TECH: 0.00, PROPERTY_UK_RESI: 0.00,
              COMMODITIES: 0.00, GOLD: 0.00, ALTERNATIVES: 0.00, CRYPTO_BTC: 0.00,
              CRYPTO_ETH: 0.00, COLLECTIBLES_ART: 0.00, COLLECTIBLES_WINE: 0.00
            },
            // Equity-heavy starting position
            {
              CASH: 0.10, BILLS_SHORT_GILTS: 0.05, GILTS_LONG: 0.05, IG_CREDIT: 0.10,
              GLOBAL_EQUITY: 0.40, UK_EQUITY_VALUE: 0.20, GROWTH_TECH: 0.08, PROPERTY_UK_RESI: 0.02,
              COMMODITIES: 0.00, GOLD: 0.00, ALTERNATIVES: 0.00, CRYPTO_BTC: 0.00,
              CRYPTO_ETH: 0.00, COLLECTIBLES_ART: 0.00, COLLECTIBLES_WINE: 0.00
            },
            // Balanced starting position  
            {
              CASH: 0.15, BILLS_SHORT_GILTS: 0.10, GILTS_LONG: 0.08, IG_CREDIT: 0.15,
              GLOBAL_EQUITY: 0.25, UK_EQUITY_VALUE: 0.15, GROWTH_TECH: 0.07, PROPERTY_UK_RESI: 0.05,
              COMMODITIES: 0.00, GOLD: 0.00, ALTERNATIVES: 0.00, CRYPTO_BTC: 0.00,
              CRYPTO_ETH: 0.00, COLLECTIBLES_ART: 0.00, COLLECTIBLES_WINE: 0.00
            }
          ];
          return demoCurrentPortfolios[Math.floor(Math.random() * demoCurrentPortfolios.length)];
        }
        
        // Calculate actual allocation from real holdings
        const currentMix = {
          CASH: 0, BILLS_SHORT_GILTS: 0, GILTS_LONG: 0, IG_CREDIT: 0,
          GLOBAL_EQUITY: 0, UK_EQUITY_VALUE: 0, GROWTH_TECH: 0, PROPERTY_UK_RESI: 0,
          COMMODITIES: 0, GOLD: 0, ALTERNATIVES: 0, CRYPTO_BTC: 0,
          CRYPTO_ETH: 0, COLLECTIBLES_ART: 0, COLLECTIBLES_WINE: 0
        };
        
        // Map portfolio holdings to asset buckets
        portfolioHoldings.forEach((holding: any) => {
          const value = parseFloat(holding.currentValueGbp || '0');
          const percentage = value / totalValue;
          const category = holding.category?.toLowerCase() || holding.assetType?.toLowerCase() || '';
          
          // Map holding categories to canonical buckets
          if (category.includes('cash') || category.includes('money market')) {
            currentMix.CASH += percentage;
          } else if (category.includes('gilt') && (category.includes('short') || category.includes('bill'))) {
            currentMix.BILLS_SHORT_GILTS += percentage;
          } else if (category.includes('gilt') && category.includes('long')) {
            currentMix.GILTS_LONG += percentage;
          } else if (category.includes('credit') || category.includes('bond') || category.includes('fixed income')) {
            currentMix.IG_CREDIT += percentage;
          } else if (category.includes('equity') && category.includes('uk')) {
            currentMix.UK_EQUITY_VALUE += percentage;
          } else if (category.includes('tech') || category.includes('growth')) {
            currentMix.GROWTH_TECH += percentage;
          } else if (category.includes('property') || category.includes('reit') || category.includes('real estate')) {
            currentMix.PROPERTY_UK_RESI += percentage;
          } else if (category.includes('commodit')) {
            currentMix.COMMODITIES += percentage;
          } else if (category.includes('gold')) {
            currentMix.GOLD += percentage;
          } else if (category.includes('bitcoin') || category.includes('btc')) {
            currentMix.CRYPTO_BTC += percentage;
          } else if (category.includes('ethereum') || category.includes('eth')) {
            currentMix.CRYPTO_ETH += percentage;
          } else {
            // Default to global equity for unmatched equity holdings
            currentMix.GLOBAL_EQUITY += percentage;
          }
        });
        
        // Add property allocations
        properties.forEach((property: any) => {
          const value = parseFloat(property.currentValueGbp || '0');
          const percentage = value / totalValue;
          currentMix.PROPERTY_UK_RESI += percentage;
        });
        
        // Add alternative investments
        alternatives.forEach((alt: any) => {
          const value = parseFloat(alt.currentValueGbp || '0');
          const percentage = value / totalValue;
          const category = alt.category?.toLowerCase() || alt.type?.toLowerCase() || '';
          
          if (category.includes('art')) {
            currentMix.COLLECTIBLES_ART += percentage;
          } else if (category.includes('wine')) {
            currentMix.COLLECTIBLES_WINE += percentage;
          } else if (category.includes('crypto') || category.includes('bitcoin')) {
            currentMix.CRYPTO_BTC += percentage;
          } else if (category.includes('ethereum')) {
            currentMix.CRYPTO_ETH += percentage;
          } else {
            currentMix.ALTERNATIVES += percentage;
          }
        });
        
        console.log('Action Plan: Calculated actual current mix:', currentMix);
        return currentMix;
      };
      
      const currentMix = calculateCurrentMix(window.actionPlanPortfolioData);

      // Call the Actions API
      console.log('Action Plan: Calling Actions API with:', {
        currentMixKeys: Object.keys(currentMix),
        targetMixKeys: Object.keys(targetMix),
        portfolioValueGBP: portfolioValue
      });
      
      const actionsResponse = await fetch('/api/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentMix,
          targetMix,
          portfolioValueGBP: portfolioValue, // Calculated or demo portfolio value
          liquidityFloorPct: 0.10,
          minTradePct: 0.005,
          maxMoves: 8,
          stageIlliquids: true
        }),
      });

      console.log('Action Plan: Actions API response status:', actionsResponse.status);

      if (!actionsResponse.ok) {
        const errorText = await actionsResponse.text();
        console.log('Action Plan: Actions API error:', errorText);
        throw new Error(`Failed to generate action plan: ${actionsResponse.status} - ${errorText}`);
      }

      const actionsResult = await actionsResponse.json();
      console.log('Action Plan: Actions API result:', actionsResult);
      setActionsData(actionsResult);
      
    } catch (error) {
      console.error('Error generating action plan:', error);
      const errorMessage = error instanceof Error ? error.message : 
                           typeof error === 'string' ? error : 
                           'An unknown error occurred while generating the action plan';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatBucketName = (bucket: string) => {
    return bucket.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'ADD': return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'TRIM': return <ArrowDown className="w-4 h-4 text-red-600" />;
      case 'TRANSFER': return <ArrowRight className="w-4 h-4 text-blue-600" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const exportToCSV = () => {
    if (!actionsData) return;
    
    const stage1Actions = actionsData.staged.stage1;
    const csvContent = [
      ['Action', 'Asset Class', 'Change (pp)', 'Amount (GBP)', 'Rationale', 'Est. Cost %'].join(','),
      ...stage1Actions.map((action: any) => [
        action.type,
        formatBucketName(action.bucket),
        (action.deltaPct * 100).toFixed(1),
        action.amountGBP,
        action.rationale,
        ((action.estCostPct || 0) * 100).toFixed(3)
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'action-plan.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Save Action Plan function
  const saveActionPlan = async () => {
    if (!actionsData || isSaving) return;
    
    setIsSaving(true);
    try {
      const actionPlanData = {
        userId: getUserId(),
        investorName: investorPrefs?.investorName || 'Unknown',
        playbook: actionsData.playbook || [],
        stage1Actions: actionsData.staged.stage1 || [],
        stage2Actions: actionsData.staged.stage2 || [],
        summary: actionsData.summary || {},
        generatedAt: new Date().toISOString()
      };

      console.log('Saving Action Plan:', actionPlanData);

      const response = await fetch('/api/action-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(actionPlanData),
      });

      if (!response.ok) {
        throw new Error(`Failed to save action plan: ${response.status}`);
      }

      const result = await response.json();
      console.log('Action Plan saved successfully:', result);
      
      // Show success message
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000); // Hide after 5 seconds
      
    } catch (error) {
      console.error('Failed to save action plan:', error);
      if (error instanceof Error) {
        console.error('Action plan save error:', error.message);
      } else {
        // If the error is not a proper Error object, it might be a success case being caught
        console.log('Non-error exception caught, possibly successful save');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-4 text-[var(--foreground)]">Generating Action Plan</h3>
          <p className="text-[var(--muted-foreground)] mb-6">
            Analyzing your portfolio gaps and creating prioritized action steps...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
              <h3 className="text-xl font-semibold mb-4 text-[var(--foreground)]">Error Generating Action Plan</h3>
              <p className="text-[var(--muted-foreground)] mb-6">{error}</p>
              <Button onClick={generateActionPlan} variant="outline">
                <ArrowRight className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!actionsData) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-[var(--primary)] mx-auto mb-6" />
              <h3 className="text-xl font-semibold mb-4 text-[var(--foreground)]">Ready to Generate Action Plan</h3>
              <p className="text-[var(--muted-foreground)] mb-6">
                Create a detailed, prioritized action plan to implement your investment strategy.
              </p>
              <Button onClick={generateActionPlan}>
                <Play className="w-4 h-4 mr-2" />
                Generate Action Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentActions = activeStage === 1 ? actionsData.staged.stage1 : actionsData.staged.stage2;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <Card className="border-2 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-200">Action Plan Saved!</h3>
                  <p className="text-sm text-green-700 dark:text-green-300">Your investment playbook and actions have been saved successfully.</p>
                </div>
                <button 
                  onClick={() => setShowSuccessMessage(false)}
                  className="ml-auto text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                >
                  ×
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Your Action Plan</h1>
        <p className="text-[var(--muted-foreground)]">
          Prioritized steps to implement your investment strategy
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--primary)]/5 border-[var(--primary)]/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full flex items-center justify-center mx-auto">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">{actionsData.summary.totalAbsChangePp}pp</div>
              <div className="text-sm font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Total Change</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--secondary)]/5 border-[var(--secondary)]/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-gradient-to-r from-[var(--secondary)] to-[var(--info)] rounded-full flex items-center justify-center mx-auto">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-[var(--secondary)]">{actionsData.summary.estTurnoverPp}pp</div>
              <div className="text-sm font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Est. Turnover</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--success)]/5 border-[var(--success)]/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-gradient-to-r from-[var(--success)] to-[var(--accent)] rounded-full flex items-center justify-center mx-auto">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-[var(--success)]">{(actionsData.summary.estCostPct * 100).toFixed(2)}%</div>
              <div className="text-sm font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Est. Cost</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--warning)]/5 border-[var(--warning)]/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-gradient-to-r from-[var(--warning)] to-[var(--accent)] rounded-full flex items-center justify-center mx-auto">
                <PiggyBank className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-[var(--warning)]">{actionsData.summary.liquidityNowPct}%</div>
              <div className="text-sm font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Current Liquidity</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Playbook */}
      <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--accent)]/5 border-[var(--accent)]/20 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-[var(--accent)]/10 to-[var(--warning)]/10 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-[var(--foreground)]">
            <BookOpen className="w-5 h-5 text-[var(--warning)]" />
            Investment Playbook
          </CardTitle>
          <CardDescription className="text-[var(--muted-foreground)]">
            Key strategic guidance for implementing your action plan
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {actionsData.playbook.map((bullet: string, index: number) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-gradient-to-r from-[var(--muted)]/20 to-transparent rounded-lg border-l-4 border-[var(--warning)] hover:from-[var(--accent)]/10 transition-all duration-300">
                <div className="w-8 h-8 bg-gradient-to-r from-[var(--warning)] to-[var(--accent)] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-md">
                  {index + 1}
                </div>
                <p className="text-[var(--foreground)] leading-relaxed font-medium" dangerouslySetInnerHTML={{
                  __html: bullet.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[var(--primary)]">$1</strong>')
                }} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stage Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant={activeStage === 1 ? "default" : "outline"}
            onClick={() => setActiveStage(1)}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl ${
              activeStage === 1 
                ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white border-none hover:from-[var(--primary)]/90 hover:to-[var(--secondary)]/90' 
                : 'text-[var(--foreground)] hover:text-[var(--primary)] border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/5'
            }`}
          >
            <Play className={`w-4 h-4 ${activeStage === 1 ? 'text-white' : 'text-[var(--primary)]'}`} />
            <span className={activeStage === 1 ? 'text-white' : 'text-[var(--foreground)]'}>
              Stage 1: Do Now ({actionsData.staged.stage1.length} actions)
            </span>
          </Button>
          <Button
            variant={activeStage === 2 ? "default" : "outline"}
            onClick={() => setActiveStage(2)}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl ${
              activeStage === 2 
                ? 'bg-gradient-to-r from-[var(--secondary)] to-[var(--info)] text-white border-none hover:from-[var(--secondary)]/90 hover:to-[var(--info)]/90' 
                : 'text-[var(--foreground)] hover:text-[var(--secondary)] border-[var(--border)] hover:border-[var(--secondary)]/50 hover:bg-[var(--secondary)]/5'
            }`}
          >
            <Pause className={`w-4 h-4 ${activeStage === 2 ? 'text-white' : 'text-[var(--secondary)]'}`} />
            <span className={activeStage === 2 ? 'text-white' : 'text-[var(--foreground)]'}>
              Stage 2: Later ({actionsData.staged.stage2.length} actions)
            </span>
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={saveActionPlan}
            className="flex items-center gap-2 px-6 py-3 font-semibold text-[var(--foreground)] hover:text-[var(--success)] border-[var(--border)] hover:border-[var(--success)]/50 hover:bg-[var(--success)]/5 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Save className="w-4 h-4 text-[var(--success)]" />
            <span>Save Plan</span>
          </Button>
          <Button
            variant="outline"
            onClick={exportToCSV}
            className="flex items-center gap-2 px-6 py-3 font-semibold text-[var(--foreground)] hover:text-[var(--accent)] border-[var(--border)] hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/5 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Download className="w-4 h-4 text-[var(--warning)]" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Actions Table */}
      <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--muted)]/10 border-[var(--border)] shadow-xl">
        <CardHeader className="bg-gradient-to-r from-[var(--primary)]/5 to-[var(--secondary)]/5 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-[var(--foreground)]">
            <ListChecks className="w-5 h-5 text-[var(--primary)]" />
            {activeStage === 1 ? 'Immediate Actions' : 'Deferred Actions'}
          </CardTitle>
          <CardDescription className="text-[var(--muted-foreground)]">
            {activeStage === 1 
              ? 'Priority actions to implement immediately'
              : 'Lower priority or illiquid actions to consider later'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-4 px-4 font-semibold text-[var(--muted-foreground)] uppercase tracking-wide text-sm">Action</th>
                  <th className="text-left py-4 px-4 font-semibold text-[var(--muted-foreground)] uppercase tracking-wide text-sm">Asset Class</th>
                  <th className="text-right py-4 px-4 font-semibold text-[var(--muted-foreground)] uppercase tracking-wide text-sm">Change (pp)</th>
                  <th className="text-right py-4 px-4 font-semibold text-[var(--muted-foreground)] uppercase tracking-wide text-sm">Amount</th>
                  <th className="text-left py-4 px-4 font-semibold text-[var(--muted-foreground)] uppercase tracking-wide text-sm">Rationale</th>
                  <th className="text-right py-4 px-4 font-semibold text-[var(--muted-foreground)] uppercase tracking-wide text-sm">Est. Cost</th>
                </tr>
              </thead>
              <tbody>
                {currentActions.map((action: any, index: number) => (
                  <tr key={index} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/20 transition-colors duration-200">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10">
                          {getActionIcon(action.type)}
                        </div>
                        <span className="font-semibold text-[var(--foreground)]">{action.type}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-[var(--foreground)]">
                      {formatBucketName(action.bucket)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={`font-bold text-lg ${action.deltaPct > 0 ? 'text-[var(--success)]' : 'text-[var(--destructive)]'}`}>
                        {action.deltaPct > 0 ? '+' : ''}{(action.deltaPct * 100).toFixed(1)}pp
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-[var(--foreground)]">
                      {formatCurrency(action.amountGBP)}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-[var(--muted-foreground)] font-medium">{action.rationale}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-[var(--primary)] font-bold">
                        {((action.estCostPct || 0) * 100).toFixed(3)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Regenerate Button */}
      <div className="text-center mt-8 mb-6">
        <Button 
          onClick={generateActionPlan} 
          variant="outline" 
          className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white border-none hover:from-[var(--primary)]/90 hover:to-[var(--secondary)]/90 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3"
        >
          <ArrowRight className="w-4 h-4 mr-2" />
          Regenerate Action Plan
        </Button>
      </div>

      {/* Investor Summary Section */}
      <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--muted)]/20 border-[var(--border)] shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Investor Summary
          </CardTitle>
          <CardDescription>
            Complete overview of your investor profile, portfolio, and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Investor Profile */}
            <div className="space-y-4">
              <h4 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
                <Badge className="w-4 h-4" />
                Investor Profile
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Name:</span>
                  <span className="font-medium">{investorPrefs?.investorName || 'Not set'}</span>
                </div>
                {matchedPersona && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-[var(--muted-foreground)]">Persona:</span>
                      <span className="font-medium text-[var(--primary)]">{matchedPersona.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--muted-foreground)]">Risk Profile:</span>
                      <span className="font-medium">{matchedPersona.riskProfile}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--muted-foreground)]">Max Drawdown:</span>
                      <span className="font-medium">{(matchedPersona.drawdownCap * 100).toFixed(0)}%</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Portfolio Value:</span>
                  <span className="font-medium">{investorPrefs?.actualPortfolioValue ? formatCurrency(investorPrefs.actualPortfolioValue) : 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Wizard Completed:</span>
                  <span className="font-medium">{investorPrefs?.wizardCompletedAt ? new Date(investorPrefs.wizardCompletedAt).toLocaleDateString() : 'Not completed'}</span>
                </div>
              </div>
            </div>

            {/* Current Portfolio */}
            <div className="space-y-4">
              <h4 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
                <PieChartIcon className="w-4 h-4" />
                Current Portfolio
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Total Value:</span>
                  <span className="font-medium">{investorPrefs?.actualPortfolioValue ? formatCurrency(investorPrefs.actualPortfolioValue) : 'Not set'}</span>
                </div>
                {currentAllocations && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-[var(--muted-foreground)]">Cash & Fixed Income:</span>
                      <span className="font-medium">{currentAllocations.cashFixedIncome || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--muted-foreground)]">Global Equity:</span>
                      <span className="font-medium">{currentAllocations.globalEquity || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--muted-foreground)]">Tech & Growth:</span>
                      <span className="font-medium">{currentAllocations.techGrowth || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--muted-foreground)]">Property:</span>
                      <span className="font-medium">{currentAllocations.property || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--muted-foreground)]">Alternatives:</span>
                      <span className="font-medium">{currentAllocations.alternatives || 0}%</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Investment Preferences */}
            {investorPrefs && (
              <div className="space-y-4">
                <h4 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Investment Interests
                </h4>
                <div className="text-sm">
                  <div className="flex flex-wrap gap-1">
                    {investorPrefs.activeInvestmentInterests?.slice(0, 4).map((interest: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                    {investorPrefs.activeInvestmentInterests?.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{investorPrefs.activeInvestmentInterests.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Economic Beliefs */}
            {beliefData && (
              <div className="space-y-4">
                <h4 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Economic Outlook
                </h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(beliefData.scenarioWeights || {}).map(([scenario, weight]) => (
                    <div key={scenario} className="flex justify-between">
                      <span className="text-[var(--muted-foreground)] capitalize">
                        {scenario.replace('_', ' ')}:
                      </span>
                      <span className="font-medium">{((weight as number) * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gap Analysis Summary */}
            {gapAnalysisData && (
              <div className="space-y-4">
                <h4 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Gap Analysis
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--muted-foreground)]">Total Changes:</span>
                    <span className="font-medium">{(gapAnalysisData.totals.totalAbsChangePp * 100).toFixed(1)} pp</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted-foreground)]">Biggest Add:</span>
                    <span className="font-medium text-green-600">
                      {gapAnalysisData.rows.find(r => r.deltaPct > 0)?.bucket.replace(/_/g, ' ') || 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted-foreground)]">Biggest Trim:</span>
                    <span className="font-medium text-red-600">
                      {gapAnalysisData.rows.find(r => r.deltaPct < 0)?.bucket.replace(/_/g, ' ') || 'None'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Plan Summary */}
            {actionsData && (
              <div className="space-y-4">
                <h4 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Action Plan
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--muted-foreground)]">Immediate Actions:</span>
                    <span className="font-medium">{actionsData.staged.stage1.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted-foreground)]">Later Actions:</span>
                    <span className="font-medium">{actionsData.staged.stage2.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted-foreground)]">Est. Total Cost:</span>
                    <span className="font-medium">{((actionsData.summary.estCostPct || 0) * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted-foreground)]">Portfolio Turnover:</span>
                    <span className="font-medium">{(actionsData.summary.estTurnoverPp || 0).toFixed(1)} pp</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Key Insights */}
          <div className="mt-6 p-4 bg-gradient-to-br from-[var(--accent)]/10 to-[var(--secondary)]/10 rounded-lg border border-[var(--accent)]/20">
            <h5 className="font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Key Insights
            </h5>
            <div className="text-sm text-[var(--muted-foreground)] space-y-1">
              {investorPrefs?.investorName && (
                <p>• Investor profile for <strong>{investorPrefs.investorName}</strong> completed on {investorPrefs.wizardCompletedAt ? new Date(investorPrefs.wizardCompletedAt).toLocaleDateString() : 'unknown date'}</p>
              )}
              {matchedPersona && (
                <p>• Matched to <strong>{matchedPersona.name}</strong> persona - {matchedPersona.description}</p>
              )}
              {beliefData?.scenarioWeights && (
                <p>• Economic outlook emphasizes <strong>{Object.entries(beliefData.scenarioWeights).sort(([,a], [,b]) => (b as number) - (a as number))[0][0].replace('_', ' ')}</strong> scenario with highest weighting</p>
              )}
              {actionsData && (
                <p>• Implementation plan includes <strong>{actionsData.staged.stage1.length} immediate actions</strong> with estimated cost of <strong>{((actionsData.summary.estCostPct || 0) * 100).toFixed(2)}%</strong></p>
              )}
              {matchedPersona && investorPrefs?.actualPortfolioValue && (
                <p>• Portfolio size of <strong>{formatCurrency(investorPrefs.actualPortfolioValue)}</strong> aligns with {matchedPersona.riskProfile.toLowerCase()} risk appetite and {(matchedPersona.drawdownCap * 100).toFixed(0)}% max drawdown tolerance</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Separator Line */}
      <div className="w-full h-1 bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--primary)] rounded-full my-8 shadow-md"></div>

      {/* Tools Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          className="bg-gradient-to-br from-[var(--card)] to-[var(--primary)]/5 border-[var(--primary)]/20 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer group rounded-2xl overflow-hidden hover:scale-105 hover:border-[var(--primary)]/40 hover:bg-gradient-to-br hover:from-[var(--card)] hover:to-[var(--primary)]/10"
          onClick={() => {
            setActiveToolId('allowance-calculator');
            setIsToolkitModalOpen(true);
          }}
        >
          <CardContent className="p-6 text-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/0 via-[var(--primary)]/5 to-[var(--primary)]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 shadow-lg group-hover:shadow-xl">
                <DollarSign className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="font-semibold text-[var(--foreground)] mb-2 group-hover:text-[var(--primary)] transition-colors duration-300">EIS Allowance Calculator</h3>
              <p className="text-sm text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors duration-300">Calculate your EIS investment allowances and tax relief</p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-[var(--card)] to-[var(--secondary)]/5 border-[var(--secondary)]/20 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer group rounded-2xl overflow-hidden hover:scale-105 hover:border-[var(--secondary)]/40 hover:bg-gradient-to-br hover:from-[var(--card)] hover:to-[var(--secondary)]/10"
          onClick={() => {
            // Open Directory in popup window
            const popup = window.open(
              '/businesses',
              'Directory',
              'width=1200,height=800,scrollbars=yes,resizable=yes,location=no,menubar=no,toolbar=no'
            );
            if (popup) {
              popup.focus();
            }
          }}
        >
          <CardContent className="p-6 text-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--secondary)]/0 via-[var(--secondary)]/5 to-[var(--secondary)]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-gradient-to-r from-[var(--secondary)] to-[var(--info)] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 shadow-lg group-hover:shadow-xl">
                <BookOpen className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="font-semibold text-[var(--foreground)] mb-2 group-hover:text-[var(--secondary)] transition-colors duration-300">Directory</h3>
              <p className="text-sm text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors duration-300">Browse investment opportunities and platforms</p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-[var(--card)] to-[var(--accent)]/5 border-[var(--accent)]/20 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer group rounded-2xl overflow-hidden hover:scale-105 hover:border-[var(--warning)]/40 hover:bg-gradient-to-br hover:from-[var(--card)] hover:to-[var(--accent)]/10"
          onClick={() => {
            // Open Pitch Deck Analyzer in popup window
            const popup = window.open(
              '/pitch-deck-analyser',
              'PitchDeckAnalyzer',
              'width=1200,height=800,scrollbars=yes,resizable=yes,location=no,menubar=no,toolbar=no'
            );
            if (popup) {
              popup.focus();
            }
          }}
        >
          <CardContent className="p-6 text-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--warning)]/0 via-[var(--warning)]/5 to-[var(--warning)]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-gradient-to-r from-[var(--warning)] to-[var(--accent)] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 shadow-lg group-hover:shadow-xl">
                <BarChart3 className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="font-semibold text-[var(--foreground)] mb-2 group-hover:text-[var(--warning)] transition-colors duration-300">Pitch Deck Analyser</h3>
              <p className="text-sm text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors duration-300">Analyze startup pitch decks and investment potential</p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-[var(--card)] to-[var(--success)]/5 border-[var(--success)]/20 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer group rounded-2xl overflow-hidden hover:scale-105 hover:border-[var(--success)]/40 hover:bg-gradient-to-br hover:from-[var(--card)] hover:to-[var(--success)]/10"
          onClick={() => {
            // Open Syndication in popup window
            const popup = window.open(
              '/syndication',
              'Syndication',
              'width=1200,height=800,scrollbars=yes,resizable=yes,location=no,menubar=no,toolbar=no'
            );
            if (popup) {
              popup.focus();
            }
          }}
        >
          <CardContent className="p-6 text-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--success)]/0 via-[var(--success)]/5 to-[var(--success)]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-gradient-to-r from-[var(--success)] to-[var(--primary)] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 shadow-lg group-hover:shadow-xl">
                <Users className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="font-semibold text-[var(--foreground)] mb-2 group-hover:text-[var(--success)] transition-colors duration-300">Syndication</h3>
              <p className="text-sm text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors duration-300">Join investment syndicates and co-investment opportunities</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolkit Modal */}
      <ToolkitModal
        isOpen={isToolkitModalOpen}
        onClose={() => {
          setIsToolkitModalOpen(false);
          setActiveToolId(null);
        }}
        toolType={activeToolId || ''}
        title="EIS Allowance Calculator"
      />

    </div>
  );
}