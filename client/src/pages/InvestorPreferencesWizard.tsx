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
import { Target, ChevronLeft, ChevronRight, User, Save, CheckCircle } from 'lucide-react';
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

export default function InvestorPreferencesWizard() {
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
      toast({
        title: "All Done!",
        description: "Your investment preferences have been saved successfully.",
      });
      // TODO: Navigate to next page or show completion
    }
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

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <div className="relative overflow-hidden py-20">
          {/* Dynamic Background Mesh */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] via-transparent to-[var(--secondary)] opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-tl from-[var(--accent)] via-transparent to-[var(--warning)] opacity-5"></div>
          </div>
          
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <div className="mb-2">
              <p className="text-[var(--muted-foreground)] text-sm font-medium tracking-wider uppercase">
                INVESTMENT
              </p>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--foreground)]">
              PREFERENCES
            </h1>
            
            <p className="text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto">
              Configure your investment profile through{' '}
              <span className="font-semibold text-[var(--primary)]">detailed preferences</span>{' '}
              or{' '}
              <span className="font-semibold text-[var(--primary)]">discover your investment personality</span>
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
      </main>
      <Footer />
    </div>
  );
}