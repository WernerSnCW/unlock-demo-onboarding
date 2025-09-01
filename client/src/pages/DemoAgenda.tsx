import { Link } from 'wouter';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Play, Sparkles, Brain, Rocket, Shield, Zap, ArrowRight, Crown, Gift, Target, TrendingUp, Users, Eye, ChevronRight, User, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

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
  const selectedScenarioIds = urlParams.get('selectedScenarios')?.split(',').filter(Boolean) || [];
  const personaScenarioIds = urlParams.get('personaScenarios')?.split(',').filter(Boolean) || [];
  const allScenarioIds = urlParams.get('scenarios')?.split(',').filter(Boolean) || [];

  // Get scenario details
  const allScenarios = allScenarioIds
    .map(id => {
      const scenario = economicScenarios.find(s => s.id === id);
      return scenario ? {
        ...scenario,
        isSelected: selectedScenarioIds.includes(id),
        isPersonaApplicable: personaScenarioIds.includes(id)
      } : null;
    })
    .filter((scenario): scenario is NonNullable<typeof scenario> => scenario !== null);

  return (
    <div className="min-h-screen bg-[var(--background)] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-32 left-16 w-40 h-40 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-64 right-24 w-32 h-32 bg-gradient-to-br from-[var(--accent)] to-[var(--warning)] rounded-full blur-xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute bottom-48 left-24 w-28 h-28 bg-gradient-to-br from-[var(--secondary)] to-[var(--primary)] rounded-full blur-lg animate-pulse" style={{animationDelay: '2.5s'}}></div>
      </div>

      <Header />
      
      {/* Configuration Display */}
      {(personaName || allScenarios.length > 0) && (
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 border-blue-200/50 dark:border-blue-800/30">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="relative">
                    <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-full p-4">
                      <Target className="h-8 w-8" />
                    </div>
                    <div className="absolute -top-1 -right-1 animate-bounce">
                      <Sparkles className="h-5 w-5 text-[var(--accent)] fill-current" />
                    </div>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                  Simulation Configuration
                </h2>
                <p className="text-[var(--muted-foreground)]">
                  Your personalized demo will use the following settings for portfolio analysis and stress testing
                </p>
              </div>
              
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
            </CardContent>
          </Card>
        </div>
      )}
      
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
              Demo Session
              <span className="text-[var(--primary)] font-semibold"> Agenda</span>
            </p>
          </div>
        </div>

        {/* Expectation Setting */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="mb-12 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 border-blue-200/50 dark:border-blue-800/30">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-full p-3">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">Demo Overview</h3>
                  <p className="text-[var(--muted-foreground)] text-lg leading-relaxed">
                    This demo uses pre-set example portfolios to simulate how Unlock works. After the demo, you can either join the free waitlist or explore our founding investor programme.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Session Agenda - 3 Main Items */}
          <div className="grid gap-8 mb-16">
            
            {/* 1. Problem We Solve */}
            <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-red-200/50 dark:border-red-800/30">
              <CardContent className="p-8">
                <div className="flex items-center gap-6">
                  <div className="bg-gradient-to-br from-red-500 to-pink-400 text-white rounded-full p-4 group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-8 w-8" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className="bg-red-100 text-red-700 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-600">01</Badge>
                      <h2 className="text-2xl font-bold text-[var(--foreground)]">Problem We Solve</h2>
                    </div>
                    <p className="text-[var(--muted-foreground)] text-lg">
                      Traditional investment analysis takes weeks. We deliver insights in minutes.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Demo Walkthrough */}
            <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200/50 dark:border-blue-800/30">
              <CardContent className="p-8">
                <div className="flex items-center gap-6">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-400 text-white rounded-full p-4 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-8 w-8" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-600">02</Badge>
                      <h2 className="text-2xl font-bold text-[var(--foreground)]">Demo Walkthrough Tailored to Investor Interests</h2>
                    </div>
                    <p className="text-[var(--muted-foreground)] text-lg">
                      Personalized portfolio analysis using your investor profile and risk scenarios.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. Next Steps */}
            <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/50 dark:border-green-800/30">
              <CardContent className="p-8">
                <div className="flex items-center gap-6">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-400 text-white rounded-full p-4 group-hover:scale-110 transition-transform duration-300">
                    <ArrowRight className="h-8 w-8" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-600">03</Badge>
                      <h2 className="text-2xl font-bold text-[var(--foreground)]">Next Steps</h2>
                    </div>
                    <p className="text-[var(--muted-foreground)] text-lg">
                      Choose your path: Free waitlist or founding investor programme.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] opacity-10 blur-2xl rounded-3xl"></div>
              <div className="relative bg-gradient-to-br from-[var(--card)] to-[var(--muted)] border border-[var(--border)] rounded-3xl p-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <Crown className="h-12 w-12 text-[var(--primary)]" />
                    <div className="absolute -top-1 -right-1">
                      <Gift className="h-4 w-4 text-[var(--accent)] fill-current animate-bounce" />
                    </div>
                  </div>
                </div>
                
                <h3 className="text-3xl font-black text-[var(--foreground)] mb-4">
                  READY TO BEGIN?
                </h3>
                
                <Link href="/portfolio-analysis" className="group">
                  <div className="inline-block relative bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-[var(--primary)]/30 transition-all duration-300 group-hover:scale-105">
                    <div className="flex items-center gap-3">
                      <Play className="h-6 w-6" />
                      <span>Start Demo</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}