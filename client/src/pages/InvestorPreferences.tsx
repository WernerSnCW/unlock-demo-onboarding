import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  Form,
} from '@/components/ui/form';
import { INVESTMENT_INTERESTS, LEARNING_AREAS, GEOGRAPHIC_REGIONS } from '@/data/preferences';
import { TrendingUp, Shield, Target, Lightbulb, BookOpen, DollarSign, AlertTriangle, Users, Globe, User, Heart, Clock, HelpCircle, Sparkles, Settings, Droplets, Brain, ThumbsUp, ThumbsDown, Minus, RotateCcw, ArrowRight, ArrowLeft, X, CheckCircle, BarChart3, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePersonaQuiz } from '@/hooks/usePersonaQuiz';
import { useBeliefQuestionnaire } from '@/hooks/useBeliefQuestionnaire';
import { useBeliefFlow, type BeliefFlowResult } from '@/hooks/useBeliefFlow';
import { DIMENSION_LABELS, INVESTMENT_PERSONAS, type PersonaDef } from '@/data/personas';
import { ASSET_NAMES } from '@/data/belief-questions';
import { ExamplePortfolioContent } from '@/components/ExamplePortfolioContent';

const preferencesSchema = z.object({
  activeInvestmentInterests: z.array(z.string()).min(1, 'Please select at least one investment interest'),
  learningCuriosityAreas: z.array(z.string()).min(1, 'Please select at least one area of curiosity'),
  geographicPreferences: z.array(z.string()).min(1, 'Please select at least one geographic preference'),
});

type PreferencesForm = z.infer<typeof preferencesSchema>;

export default function InvestorPreferences() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'detailed' | 'profile'>('detailed');
  const [showDemo, setShowDemo] = useState(false);

  const form = useForm<PreferencesForm>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      activeInvestmentInterests: [],
      learningCuriosityAreas: [],
      geographicPreferences: [],
    },
  });

  const onSubmit = (data: PreferencesForm) => {
    console.log('Form submitted:', data);
    toast({
      title: "Preferences saved successfully!",
      description: "Your investment preferences have been updated.",
    });
  };

  const investorPersonas = INVESTMENT_PERSONAS;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--muted)]/20 to-[var(--background)]">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* Hero Section */}
          <div className="text-center space-y-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/10 via-transparent to-[var(--secondary)]/10 rounded-3xl blur-3xl -z-10"></div>
            
            <div className="relative bg-gradient-to-br from-[var(--primary)]/5 to-[var(--secondary)]/5 backdrop-blur-sm border border-[var(--primary)]/20 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full blur-lg opacity-75"></div>
                  <div className="relative bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-full p-4">
                    <Settings className="h-8 w-8" />
                  </div>
                  <div className="absolute -top-2 -right-2 animate-bounce">
                    <Sparkles className="h-6 w-6 text-[var(--accent)] fill-current" />
                  </div>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] bg-clip-text text-transparent mb-4">
                Investor Preferences
              </h1>
              <p className="text-xl text-[var(--muted-foreground)] max-w-3xl mx-auto leading-relaxed">
                Configure your investment profile through detailed preferences or discover your ideal investor persona through our research-backed assessment
              </p>

              {/* Demo Mode Toggle */}
              <div className="mt-8">
                <Button
                  onClick={() => setShowDemo(!showDemo)}
                  variant="outline"
                  size="lg"
                  className={`transition-all duration-500 border-2 ${
                    showDemo 
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] shadow-lg' 
                      : 'border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]'
                  }`}
                >
                  <Settings className="mr-2 h-5 w-5" />
                  {showDemo ? 'Hide' : 'Show'} Demo Mode
                </Button>
                
                {showDemo && (
                  <div className="mt-4 max-w-2xl mx-auto p-6 bg-[var(--accent)]/10 rounded-2xl border border-[var(--accent)]/30 animate-in fade-in-0 slide-in-from-top-4 duration-500">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-[var(--accent)] mt-0.5 flex-shrink-0" />
                      <div className="space-y-3">
                        <h3 className="font-semibold text-[var(--foreground)]">Demo Features Available</h3>
                        <ul className="text-sm text-[var(--muted-foreground)] space-y-2">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-[var(--accent)]" />
                            Quick preference auto-fill for demonstration
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-[var(--accent)]" />
                            Instant persona quiz completion
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-[var(--accent)]" />
                            Sample results with mock data
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

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
                variant="outline"
                className={`transition-all duration-500 border-2 ${
                  showDemo 
                    ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] shadow-lg animate-pulse' 
                    : 'border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]'
                }`}
                data-testid="button-demo-auto-select"
              >
                <Zap className="mr-2 h-5 w-5" />
                Demo: Auto-Select Preferences
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Investment Interests */}
              <Card className="bg-gradient-to-br from-[var(--primary)]/5 to-[var(--primary)]/10 border-[var(--primary)]/20 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-[var(--primary)] rounded-lg">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-[var(--primary)]">Investment Interests</CardTitle>
                      <CardDescription className="text-sm">
                        Select areas you're actively interested in investing
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="activeInvestmentInterests"
                    render={() => (
                      <FormItem>
                        <ScrollArea className="h-80 pr-4">
                          <div className="space-y-3">
                            {INVESTMENT_INTERESTS.map((interest) => (
                              <FormField
                                key={interest}
                                control={form.control}
                                name="activeInvestmentInterests"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={interest}
                                      className="flex flex-row items-start space-x-3 space-y-0 p-3 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all duration-300 group"
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
                                                )
                                          }}
                                          className="border-[var(--primary)] data-[state=checked]:bg-[var(--primary)] data-[state=checked]:text-white"
                                          data-testid={`checkbox-interest-${interest.toLowerCase().replace(/\s+/g, '-')}`}
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel className="text-sm font-medium text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                                          {interest}
                                        </FormLabel>
                                      </div>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                        </ScrollArea>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Learning & Curiosity Areas */}
              <Card className="bg-gradient-to-br from-[var(--secondary)]/5 to-[var(--secondary)]/10 border-[var(--secondary)]/20 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-[var(--secondary)] rounded-lg">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-[var(--secondary)]">Learning & Curiosity Areas</CardTitle>
                      <CardDescription className="text-sm">
                        Topics you want to learn more about or stay updated on
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="learningCuriosityAreas"
                    render={() => (
                      <FormItem>
                        <ScrollArea className="h-80 pr-4">
                          <div className="space-y-3">
                            {LEARNING_AREAS.map((area) => (
                              <FormField
                                key={area}
                                control={form.control}
                                name="learningCuriosityAreas"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={area}
                                      className="flex flex-row items-start space-x-3 space-y-0 p-3 rounded-lg border border-[var(--border)] hover:border-[var(--secondary)] hover:bg-[var(--secondary)]/5 transition-all duration-300 group"
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
                                                )
                                          }}
                                          className="border-[var(--secondary)] data-[state=checked]:bg-[var(--secondary)] data-[state=checked]:text-white"
                                          data-testid={`checkbox-learning-${area.toLowerCase().replace(/\s+/g, '-')}`}
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel className="text-sm font-medium text-[var(--foreground)] group-hover:text-[var(--secondary)] transition-colors">
                                          {area}
                                        </FormLabel>
                                      </div>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                        </ScrollArea>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Geographic Preferences */}
              <Card className="bg-gradient-to-br from-[var(--accent)]/5 to-[var(--accent)]/10 border-[var(--accent)]/20 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-[var(--accent)] rounded-lg">
                      <Globe className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-[var(--accent)]">Geographic Preferences</CardTitle>
                      <CardDescription className="text-sm">
                        Regions and markets you prefer to invest in
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="geographicPreferences"
                    render={() => (
                      <FormItem>
                        <ScrollArea className="h-80 pr-4">
                          <div className="space-y-3">
                            {GEOGRAPHIC_REGIONS.map((region) => (
                              <FormField
                                key={region}
                                control={form.control}
                                name="geographicPreferences"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={region}
                                      className="flex flex-row items-start space-x-3 space-y-0 p-3 rounded-lg border border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all duration-300 group"
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
                                                )
                                          }}
                                          className="border-[var(--accent)] data-[state=checked]:bg-[var(--accent)] data-[state=checked]:text-white"
                                          data-testid={`checkbox-geographic-${region.toLowerCase().replace(/\s+/g, '-')}`}
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel className="text-sm font-medium text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                                          {region}
                                        </FormLabel>
                                      </div>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                        </ScrollArea>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-8">
              <Button 
                type="submit" 
                size="lg" 
                className="px-12 py-6 text-lg bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] hover:from-[var(--primary)]/90 hover:to-[var(--secondary)]/90 transition-all duration-300 shadow-xl"
                data-testid="button-save-preferences"
              >
                {form.formState.isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Settings className="mr-2 h-5 w-5" />
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
              We've analyzed your responses across 8 investment dimensions and found your ideal investor persona
            </p>
          </div>
        </div>

        {/* Best Match Card */}
        <Card className="border border-[var(--primary)] shadow-2xl bg-gradient-to-br from-[var(--primary)]/5 to-[var(--secondary)]/5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--secondary)]/5 pointer-events-none"></div>
          <CardHeader className="relative pb-6">
            <div className="flex items-center justify-between mb-4">
              <Badge className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white text-sm px-3 py-1">
                🎯 Best Match
              </Badge>
              <div className="text-3xl font-bold text-[var(--primary)]">
                {(result.topMatch.matchPercentage * 100).toFixed(0)}%
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-[var(--primary)] mb-2">
              {result.topMatch.persona.name}
            </CardTitle>
            <CardDescription className="text-lg text-[var(--muted-foreground)]">
              {result.topMatch.persona.notes}
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-[var(--primary)]" />
                  Aligned Dimensions
                </h4>
                <div className="space-y-2">
                  {result.topMatch.alignedDimensions.map((dim) => (
                    <div key={dim} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-[var(--primary)]" />
                      <span className="text-[var(--foreground)]">{dimensionLabels[dim]}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-[var(--warning)]" />
                  Different Dimensions
                </h4>
                <div className="space-y-2">
                  {result.topMatch.differentDimensions.map((dim) => (
                    <div key={dim} className="flex items-center gap-2 text-sm">
                      <Minus className="h-4 w-4 text-[var(--warning)]" />
                      <span className="text-[var(--muted-foreground)]">{dimensionLabels[dim]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Runner-up if exists */}
        {result.runnerUp && (
          <Card className="border border-[var(--border)] shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="text-sm">
                  🥈 Runner-up
                </Badge>
                <div className="text-xl font-bold text-[var(--muted-foreground)]">
                  {(result.runnerUp.matchPercentage * 100).toFixed(0)}%
                </div>
              </div>
              <CardTitle className="text-xl text-[var(--foreground)]">
                {result.runnerUp.persona.name}
              </CardTitle>
              <CardDescription>{result.runnerUp.persona.notes}</CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* User Profile Scores */}
        <Card className="border border-[var(--border)] shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[var(--foreground)]">
              <BarChart3 className="h-5 w-5 text-[var(--secondary)]" />
              Your Investment Profile Scores
            </CardTitle>
            <CardDescription>
              Your responses mapped across the 8 key investment dimensions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(result.userScores).map(([dimension, score]) => (
                <div key={dimension} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-[var(--foreground)]">
                      {dimensionLabels[dimension]}
                    </span>
                    <span className="text-sm text-[var(--muted-foreground)]">
                      {score.toFixed(1)}
                    </span>
                  </div>
                  <div className="w-full bg-[var(--muted)] rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(score / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alternative Personas Selection */}
        <Card className="border border-[var(--border)] shadow-lg">
          <CardHeader>
            <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
              <Users className="h-5 w-5 text-[var(--accent)]" />
              Alternative Personas
            </CardTitle>
            <CardDescription>
              Explore other investor personas or stick with your best match
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {INVESTMENT_PERSONAS.slice(0, 6).map((persona) => {
                const isTopMatch = persona.id === result.topMatch.persona.id;
                const isRunnerUp = result.runnerUp && persona.id === result.runnerUp.persona.id;
                const isSelected = selectedPersona?.id === persona.id;
                
                return (
                  <div
                    key={persona.id}
                    onClick={() => setSelectedPersona(persona)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                      isTopMatch 
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10 shadow-md' 
                        : isRunnerUp
                          ? 'border-[var(--secondary)] bg-[var(--secondary)]/10'
                          : isSelected
                            ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                            : 'border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5'
                    }`}
                    data-testid={`persona-option-${persona.id}`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-[var(--foreground)]">
                          {persona.name}
                        </h4>
                        {isTopMatch && (
                          <Badge className="bg-[var(--primary)] text-white text-xs">Top</Badge>
                        )}
                        {isRunnerUp && (
                          <Badge variant="secondary" className="text-xs">2nd</Badge>
                        )}
                        {isSelected && !isTopMatch && !isRunnerUp && (
                          <Badge className="bg-[var(--accent)] text-white text-xs">Selected</Badge>
                        )}
                      </div>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {persona.notes}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => {
                  resetQuiz();
                  setSelectedPersona(null);
                }}
                size="lg"
                variant="outline"
                className="flex items-center gap-2 px-6 py-4 text-lg border-2 border-[var(--border)] hover:border-[var(--muted-foreground)] transition-all duration-300"
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
                <ArrowRight className="h-5 w-5" />
                Use {selectedPersona ? selectedPersona.name : result.topMatch.persona.name}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Intro Card for first question */}
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
            {currentQuestion?.text || 'Loading question...'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="max-w-3xl mx-auto">
            {/* Question Options */}
            <div className="space-y-4">
              {currentQuestion?.options?.map((option, index) => (
                <div
                  key={index}
                  onClick={() => answerQuestion(index)}
                  className="p-6 rounded-xl border-2 border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 cursor-pointer transition-all duration-300 group hover:shadow-lg"
                  data-testid={`option-${index}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full border-2 border-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-all duration-300 flex items-center justify-center font-bold">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <p className="text-lg text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors font-medium leading-relaxed">
                      {option.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation and Progress */}
          <div className="mt-12 space-y-6">
            <div className="flex justify-between items-center max-w-3xl mx-auto">
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
              ) : <div></div>}
              
              <div className="flex gap-4">
                <Button
                  onClick={skipQuestion}
                  size="lg"
                  variant="ghost"
                  className="px-6 py-3 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all duration-300"
                  data-testid="button-skip"
                >
                  Skip Question
                </Button>
                <Button
                  onClick={handleAutoComplete}
                  size="lg"
                  variant="outline"
                  className="px-6 py-3 border-2 border-[var(--warning)] text-[var(--warning)] hover:bg-[var(--warning)]/10 transition-all duration-300"
                  data-testid="button-auto-complete"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Auto Complete
                </Button>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="max-w-3xl mx-auto">
              <div className="w-full bg-[var(--muted)] rounded-full h-3 overflow-hidden shadow-inner">
                <div 
                  className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] h-3 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center text-sm text-[var(--muted-foreground)] mt-2">
                {Math.round(progress)}% Complete
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BeliefQuestionnaireContent({ persona, onBack }: { persona: PersonaDef; onBack: () => void }) {
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [portfolioResult, setPortfolioResult] = useState<BeliefFlowResult | null>(null);
  
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
    generateResult,
    resetFlow,
    autoComplete,
    totalQuestions
  } = useBeliefFlow();

  // Handle portfolio generation when belief questionnaire completes
  useEffect(() => {
    if (isComplete && !portfolioResult) {
      const result = generateResult(persona);
      setPortfolioResult(result);
      setShowPortfolio(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isComplete, portfolioResult, generateResult, persona]);

  // Show portfolio results
  if (showPortfolio && portfolioResult) {
    return (
      <ExamplePortfolioContent 
        persona={persona} 
        portfolioResult={portfolioResult} 
        onBack={() => {
          setShowPortfolio(false);
          setPortfolioResult(null);
          resetFlow();
        }}
        onReturnToPersona={onBack}
      />
    );
  }

  // This should not be reached since we redirect to portfolio on completion
  if (isComplete) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center mx-auto">
          <CheckCircle className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--primary)]">Assessment Complete!</h2>
        <p className="text-[var(--muted-foreground)]">Generating your personalized portfolio...</p>
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
                {currentQuestion?.prompt}
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
                  onClick={() => answerQuestion(value.toString())}
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
                onClick={autoComplete}
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