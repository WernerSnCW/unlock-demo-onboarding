import { Link } from 'wouter';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, AlertTriangle, ArrowLeft, Play, Target, TrendingUp, BarChart3, CheckCircle, Brain, Rocket, Shield, Zap, Sparkles, Eye } from 'lucide-react';

// Economic scenarios data
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
    name: 'Major UK Policy Shift',
    description: 'Significant changes in UK tax, regulatory, or economic policy affecting investors',
    horizon: '5 year horizon',
    icon: Shield
  }
];

export default function DemoAgenda() {
  // Parse URL parameters for configuration
  const urlParams = new URLSearchParams(window.location.search);
  const personaName = urlParams.get('persona');
  const selectedScenarioIds = urlParams.get('scenarios')?.split(',').filter(Boolean) || [];
  const applicableScenarioIds = urlParams.get('applicable')?.split(',').filter(Boolean) || [];

  // Combine and deduplicate scenarios
  const allScenarioIds = Array.from(new Set([...selectedScenarioIds, ...applicableScenarioIds]));
  const allScenarios = allScenarioIds
    .map(id => {
      const scenario = economicScenarios.find(s => s.id === id);
      return scenario ? {
        ...scenario,
        isSelected: selectedScenarioIds.includes(id)
      } : null;
    })
    .filter((scenario): scenario is NonNullable<typeof scenario> => scenario !== null);

  const hasConfiguration = personaName || allScenarios.length > 0;

  return (
    <div className="min-h-screen bg-[var(--background)] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-32 left-16 w-40 h-40 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-64 right-24 w-32 h-32 bg-gradient-to-br from-[var(--accent)] to-[var(--warning)] rounded-full blur-xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute bottom-48 left-24 w-28 h-28 bg-gradient-to-br from-[var(--secondary)] to-[var(--primary)] rounded-full blur-lg animate-pulse" style={{animationDelay: '2.5s'}}></div>
      </div>

      <Header />
      
      {/* Navigation Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link 
            href="/investor-preferences"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-[#5193B3] dark:hover:text-[#62C4C3] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Preferences
          </Link>
          <div className="text-gray-300 dark:text-gray-600">•</div>
          <span className="text-gray-800 dark:text-gray-200 font-medium">Demo Simulation</span>
        </div>
      </div>

      <main className="flex-1 relative z-10">
        {/* Hero Section with Advanced Visual Design */}
        <div className="relative overflow-hidden min-h-[60vh] flex items-center justify-center">
          {/* Dynamic Background Mesh */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] via-transparent to-[var(--secondary)] opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-tl from-[var(--accent)] via-transparent to-[var(--warning)] opacity-5"></div>
          </div>
          
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            {/* Floating Icon with Glow Effect */}
            <div className="flex items-center justify-center mb-8 relative">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-full p-6 group-hover:scale-110 transition-transform duration-300">
                  <Play className="h-12 w-12" />
                </div>
                <div className="absolute -top-2 -right-2 animate-bounce">
                  <Sparkles className="h-6 w-6 text-[var(--accent)] fill-current" />
                </div>
              </div>
            </div>

            {/* Revolutionary Typography */}
            <h1 className="relative mb-8">
              <span className="block text-2xl md:text-4xl font-light text-[var(--muted-foreground)] tracking-wider uppercase mb-2">Investment Intelligence</span>
              <span className="block text-5xl md:text-8xl font-black bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] bg-clip-text text-transparent leading-none tracking-tight">
                UNLEASHED
              </span>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent"></div>
            </h1>

            <p className="text-xl md:text-2xl text-[var(--muted-foreground)] max-w-4xl mx-auto mb-12 leading-relaxed font-light">
              Witness the paradigm shift that transforms weeks of manual analysis into 
              <span className="text-[var(--primary)] font-semibold"> minutes of AI-powered insights</span>
            </p>

            {/* Status Badge with Animation */}
            <div className="inline-flex items-center px-8 py-4 bg-[var(--card)] border-2 border-[var(--primary)] rounded-full shadow-2xl hover:shadow-[var(--primary)]/20 transition-all duration-300 group">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Shield className="h-6 w-6 text-[var(--success)]" />
                  <div className="absolute inset-0 animate-ping">
                    <Shield className="h-6 w-6 text-[var(--success)] opacity-30" />
                  </div>
                </div>
                <span className="text-[var(--foreground)] font-semibold text-lg">LIVE DEMONSTRATION</span>
                <div className="w-2 h-2 bg-[var(--success)] rounded-full animate-pulse"></div>
                <span className="text-[var(--muted-foreground)] font-medium">30-45 minutes</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Configuration Display */}
          {hasConfiguration && (
            <div className="mb-12">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 border-blue-200/50 dark:border-blue-800/30">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
                    <Target className="h-5 w-5 text-[var(--primary)]" />
                    Simulation Configuration
                  </CardTitle>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Your personalized demo will use the following settings for portfolio analysis and stress testing
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Selected Persona */}
                    {personaName && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-[var(--primary)]" />
                          <h4 className="font-semibold text-[var(--foreground)]">
                            Investor Persona
                          </h4>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20 rounded-lg p-6 border border-green-200/50 dark:border-green-800/30">
                          <div className="flex items-start justify-between mb-3">
                            <Badge className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-600">
                              Selected Profile
                            </Badge>
                          </div>
                          <h5 className="font-bold text-[var(--foreground)] text-lg mb-2">
                            {personaName}
                          </h5>
                          <p className="text-sm text-[var(--muted-foreground)] mb-4 leading-relaxed">
                            This simulation will model your portfolio behavior and risk responses according to the characteristics and preferences of this investor archetype.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-xs">
                              Risk-Aware Analysis
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Personalized Scenarios
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Behavioral Modeling
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Selected Economic Scenarios */}
                    {allScenarios.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-[var(--primary)]" />
                          <h4 className="font-semibold text-[var(--foreground)]">
                            Stress Test Scenarios ({allScenarios.length})
                          </h4>
                        </div>
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                          {allScenarios.map((scenario) => {
                            const IconComponent = scenario.icon;
                            return (
                              <div key={scenario.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-800/30">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <IconComponent className="h-4 w-4 text-[var(--primary)]" />
                                    <Badge className={`text-xs ${
                                      scenario.isSelected 
                                        ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-600'
                                        : 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-600'
                                    }`}>
                                      {scenario.isSelected ? 'Selected' : 'Applicable'}
                                    </Badge>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {scenario.horizon}
                                  </Badge>
                                </div>
                                <h6 className="font-semibold text-[var(--foreground)] text-sm mb-2">
                                  {scenario.name}
                                </h6>
                                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mb-3">
                                  {scenario.description}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                                  <div className="w-2 h-2 rounded-full bg-[var(--primary)]"></div>
                                  <span>Portfolio stress testing enabled</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="mt-8 flex flex-wrap gap-4">
                    <Button className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white">
                      <Play className="h-4 w-4 mr-2" />
                      Start Simulation
                    </Button>
                    <Link href="/investor-preferences">
                      <Button variant="outline">
                        Modify Configuration
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Default Demo Content */}
          {!hasConfiguration && (
            <>
              {/* Page Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Investment Platform Demo
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Experience the power of AI-driven investment analysis and portfolio insights
                </p>
              </div>

              {/* Demo Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-[var(--primary)]" />
                      Portfolio Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Real-time portfolio analysis with AI-powered insights and risk assessment
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-[var(--primary)]" />
                      Stress Testing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Comprehensive stress testing against various economic scenarios
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-[var(--primary)]" />
                      Investor Personas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Personalized analysis based on your investor profile and preferences
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Get Started */}
              <Card className="text-center">
                <CardContent className="py-12">
                  <CheckCircle className="h-16 w-16 text-[var(--primary)] mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Ready to Experience the Demo?
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                    Upload your portfolio data and complete our investor questionnaire to get a personalized demonstration
                    of our AI-powered investment analysis platform.
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center">
                    <Link href="/portfolio-analysis">
                      <Button size="lg" className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white">
                        <BarChart3 className="h-5 w-5 mr-2" />
                        Start with Portfolio Analysis
                      </Button>
                    </Link>
                    <Link href="/investor-preferences">
                      <Button size="lg" variant="outline">
                        <User className="h-5 w-5 mr-2" />
                        Take Investor Questionnaire
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}