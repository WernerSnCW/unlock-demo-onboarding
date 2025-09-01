import { Link } from 'wouter';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, AlertTriangle, Play, Target, TrendingUp, BarChart3, CheckCircle, Brain, Shield, Zap } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="flex-1">
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