import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, ChevronLeft, ChevronRight, User, Save, CheckCircle, Sparkles, BookOpen, Globe, TrendingUp, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';

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
  { id: 'preferences', title: 'Investment Preferences', icon: Target, description: '3 steps to capture your investment interests' },
  { id: 'profile', title: 'Investment Profile Discovery', icon: User, description: 'Discover your investment personality through assessment' },
  { id: 'analysis', title: 'Portfolio Analysis', icon: BarChart3, description: 'Coming soon - analyze your current holdings' },
  { id: 'strategy', title: 'Investment Strategy', icon: TrendingUp, description: 'Coming soon - develop your investment strategy' },
  { id: 'action', title: 'Action Plan', icon: CheckCircle, description: 'Coming soon - create your personalized action plan' }
];

export default function InvestorPreferencesWizard() {
  const [activeMainTab, setActiveMainTab] = useState('preferences');
  const [currentStep, setCurrentStep] = useState(1);
  const [investorName, setInvestorName] = useState<string>('');
  const [showNameDialog, setShowNameDialog] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
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
        completedAt: new Date().toISOString()
      };
      
      try {
        // TODO: Implement actual API call to save complete preferences
        console.log(`Saving complete investment preferences for investor ${investorName}:`, completePreferences);
        
        // Mark all steps as completed
        setCompletedSteps(new Set([1, 2, 3]));
        
        // Navigate to Investment Profile Discovery (main tab 2)
        setActiveMainTab('profile');
        
        toast({
          title: "Investment Preferences Complete!",
          description: `All preferences saved for ${investorName}. Moving to Investment Profile Discovery.`,
        });
        
      } catch (error) {
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

            {investorName && (
              <div className="mt-6">
                <Badge variant="secondary" className="bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]">
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
          <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
            {/* Enhanced Tab Navigation */}
            <div className="mb-12">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {mainTabs.map((tab, index) => {
                  const IconComponent = tab.icon;
                  const isActive = activeMainTab === tab.id;
                  const isCompleted = index === 0 && completedSteps.size > 0; // Example logic
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveMainTab(tab.id)}
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

            {/* Tab Content: Investment Preferences */}
            <TabsContent value="preferences">
              {/* Auto-Capture Demo Button */}
              <div className="flex justify-center mb-8">
                <Button
                  type="button"
                  onClick={handleAutoCapture}
                  size="lg"
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-0"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Auto-Capture Demo Preferences (All Steps)
                </Button>
              </div>

              {/* Progress and Step Navigation */}
              <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.title}
            </h2>
            <span className="text-sm text-gray-500">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          
          {/* Step Pills */}
          <div className="flex items-center justify-center gap-4 mt-6">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => goToStep(step.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  currentStep === step.id
                    ? 'bg-[var(--primary)] text-white'
                    : completedSteps.has(step.id)
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 cursor-not-allowed'
                }`}
                disabled={step.id > currentStep && !completedSteps.has(step.id - 1)}
              >
                {completedSteps.has(step.id) && (
                  <CheckCircle className="w-4 h-4" />
                )}
                <span>{step.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                $
              </span>
              {steps[currentStep - 1]?.subtitle}
            </CardTitle>
            <CardDescription className="text-base">
              {currentStep === 1 && 'Which investment areas are you actively interested in or currently investing in?'}
              {currentStep === 2 && 'Which investment topics would you like to learn more about?'}
              {currentStep === 3 && 'Which geographic regions are you interested in for investments?'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Step 1: Active Investment Interests */}
            {currentStep === 1 && (
              <Form {...step1Form}>
                <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-6">
                  <FormField
                    control={step1Form.control}
                    name="activeInvestmentInterests"
                    render={() => (
                      <FormItem>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {investmentInterests.map((interest) => (
                            <FormField
                              key={interest}
                              control={step1Form.control}
                              name="activeInvestmentInterests"
                              render={({ field }) => (
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
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== interest
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal leading-5">
                                    {interest}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex items-center justify-between pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      disabled
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    
                    <Button type="submit" className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4" />
                      Save Preferences & Continue
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {/* Step 2: Learning & Curiosity Areas */}
            {currentStep === 2 && (
              <Form {...step2Form}>
                <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-6">
                  <FormField
                    control={step2Form.control}
                    name="learningCuriosityAreas"
                    render={() => (
                      <FormItem>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {learningAreas.map((area) => (
                            <FormField
                              key={area}
                              control={step2Form.control}
                              name="learningCuriosityAreas"
                              render={({ field }) => (
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
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== area
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal leading-5">
                                    {area}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex items-center justify-between pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    
                    <Button type="submit" className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4" />
                      Save Preferences & Continue
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {/* Step 3: Geographic Preferences */}
            {currentStep === 3 && (
              <Form {...step3Form}>
                <form onSubmit={step3Form.handleSubmit(handleStep3Submit)} className="space-y-6">
                  <FormField
                    control={step3Form.control}
                    name="geographicPreferences"
                    render={() => (
                      <FormItem>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {geographicRegions.map((region) => (
                            <FormField
                              key={region}
                              control={step3Form.control}
                              name="geographicPreferences"
                              render={({ field }) => (
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
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== region
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal leading-5">
                                    {region}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex items-center justify-between pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    
                    <Button type="submit" className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4" />
                      Complete Setup
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab Content: Investment Profile Discovery */}
            <TabsContent value="profile">
              <div className="max-w-4xl mx-auto px-6 py-8">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <User className="w-6 h-6 text-[var(--primary)]" />
                      Investment Profile Discovery
                    </CardTitle>
                    <CardDescription className="text-base">
                      Discover your investment personality through a comprehensive assessment.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full flex items-center justify-center mx-auto mb-6">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-4 text-[var(--foreground)]">Coming Soon</h3>
                      <p className="text-[var(--muted-foreground)] mb-6">
                        Complete the investment preferences first, then discover your unique investment personality through our advanced profiling system.
                      </p>
                      <Button variant="outline" disabled>
                        Start Profile Discovery
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab Content: Portfolio Analysis */}
            <TabsContent value="analysis">
              <div className="max-w-4xl mx-auto px-6 py-8">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <BarChart3 className="w-6 h-6 text-[var(--primary)]" />
                      Portfolio Analysis
                    </CardTitle>
                    <CardDescription className="text-base">
                      Analyze your current investment holdings and performance.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full flex items-center justify-center mx-auto mb-6">
                        <BarChart3 className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-4 text-[var(--foreground)]">Coming Soon</h3>
                      <p className="text-[var(--muted-foreground)] mb-6">
                        Advanced portfolio analysis tools will be available after completing your investment preferences and profile discovery.
                      </p>
                      <Button variant="outline" disabled>
                        Analyze Portfolio
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab Content: Investment Strategy */}
            <TabsContent value="strategy">
              <div className="max-w-4xl mx-auto px-6 py-8">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <TrendingUp className="w-6 h-6 text-[var(--primary)]" />
                      Investment Strategy
                    </CardTitle>
                    <CardDescription className="text-base">
                      Develop a personalized investment strategy based on your profile.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full flex items-center justify-center mx-auto mb-6">
                        <TrendingUp className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-4 text-[var(--foreground)]">Coming Soon</h3>
                      <p className="text-[var(--muted-foreground)] mb-6">
                        Get personalized investment strategy recommendations tailored to your preferences and risk profile.
                      </p>
                      <Button variant="outline" disabled>
                        Build Strategy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab Content: Action Plan */}
            <TabsContent value="action">
              <div className="max-w-4xl mx-auto px-6 py-8">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <CheckCircle className="w-6 h-6 text-[var(--primary)]" />
                      Action Plan
                    </CardTitle>
                    <CardDescription className="text-base">
                      Create your personalized investment action plan.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-4 text-[var(--foreground)]">Coming Soon</h3>
                      <p className="text-[var(--muted-foreground)] mb-6">
                        Receive a detailed action plan with specific steps to implement your investment strategy.
                      </p>
                      <Button variant="outline" disabled>
                        Generate Action Plan
                      </Button>
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