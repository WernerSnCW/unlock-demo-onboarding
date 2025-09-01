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
  // Parse URL parameters to get persona and scenario configuration
  const urlParams = new URLSearchParams(window.location.search);
  const personaId = urlParams.get('persona');
  const personaName = urlParams.get('personaName');
  const scenarioIds = urlParams.get('scenarios')?.split(',').filter(Boolean) || [];
  
  // Get selected scenarios
  const selectedScenarios = scenarioIds
    .map(id => economicScenarios.find(s => s.id === id))
    .filter((scenario): scenario is typeof scenario & {} => scenario !== undefined);
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
      
      {/* Configuration Summary Section */}
      {(personaName || selectedScenarios.length > 0) && (
        <div className="relative z-10 bg-gradient-to-r from-[var(--primary)]/5 to-[var(--secondary)]/5 border-b border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Card className="border-2 border-[var(--primary)]/20 bg-[var(--card)]/80 backdrop-blur-sm shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--foreground)]">
                      Demo Configuration Active
                    </h3>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Your simulation will use the following investor profile and economic scenarios
                    </p>
                  </div>
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
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20 rounded-lg p-4 border border-green-200/50 dark:border-green-800/30">
                        <Badge className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-600 mb-2">
                          Selected Profile
                        </Badge>
                        <p className="font-medium text-[var(--foreground)] text-sm">
                          {personaName}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Selected Economic Scenarios */}
                  {selectedScenarios.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-[var(--primary)]" />
                        <h4 className="font-semibold text-[var(--foreground)]">
                          Stress Test Scenarios ({selectedScenarios.length})
                        </h4>
                      </div>
                      <div className="space-y-2 max-h-24 overflow-y-auto">
                        {selectedScenarios.map((scenario) => {
                          const IconComponent = scenario.icon;
                          return (
                            <div key={scenario.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 rounded-lg p-3 border border-blue-200/50 dark:border-blue-800/30">
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-3 w-3 text-[var(--primary)]" />
                                <Badge className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-600 text-xs">
                                  Active
                                </Badge>
                              </div>
                              <p className="font-medium text-[var(--foreground)] text-xs mt-1">
                                {scenario.name}
                              </p>
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

        {/* Main Content - Revolutionary Design */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          
          {/* Central Focus Header */}
          <div className="text-center mb-20 relative">
            <div className="inline-block relative mb-8">
              <h2 className="text-5xl md:text-6xl font-black text-[var(--foreground)] tracking-tight">
                DEMO
                <span className="block text-3xl md:text-4xl bg-gradient-to-r from-[var(--secondary)] to-[var(--accent)] bg-clip-text text-transparent font-light tracking-widest">
                  ARCHITECTURE
                </span>
              </h2>
              <div className="absolute -inset-4 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] opacity-10 blur-xl rounded-full"></div>
            </div>
            
            {/* Dynamic Expectations Block */}
            <div className="max-w-4xl mx-auto mb-16 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)] to-[var(--warning)] rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-[var(--card)] border border-[var(--accent)] rounded-2xl p-8 backdrop-blur-sm hover:shadow-2xl transition-all duration-500">
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <div className="bg-gradient-to-br from-[var(--accent)] to-[var(--warning)] rounded-full p-4 shadow-lg">
                      <Eye className="h-8 w-8 text-[var(--accent-foreground)]" />
                    </div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-[var(--accent)] to-[var(--warning)] rounded-full opacity-30 blur-sm animate-pulse"></div>
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-2xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                      EXPERIENTIAL PREVIEW
                      <Sparkles className="h-5 w-5 text-[var(--accent)] fill-current" />
                    </h3>
                    <p className="text-lg text-[var(--foreground)] leading-relaxed">
                      This demonstration employs <span className="font-bold text-[var(--primary)]">pre-configured portfolio simulations</span> to showcase Unlock's capabilities. 
                      Post-demo pathways include <span className="font-bold text-[var(--secondary)]">waitlist enrollment</span> or exploration of our 
                      <span className="font-bold text-[var(--accent)]"> founding investor ecosystem</span>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Revolutionary Agenda Items with Advanced Design */}
          <div className="space-y-8 max-w-5xl mx-auto">
            
            {/* Agenda Item 1 - Problem Analysis */}
            <Link href="/advice-gap" className="group relative block" data-testid="link-problem-deconstruction">
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl"></div>
              <div className="relative bg-[var(--card)] border-2 border-[var(--border)] hover:border-[var(--primary)] rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] cursor-pointer">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]"></div>
                <div className="p-10">
                  <div className="flex items-center gap-8">
                    <div className="relative">
                      <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-2xl p-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
                        <span className="text-3xl font-black text-white">01</span>
                      </div>
                      <div className="absolute -inset-2 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-2xl opacity-20 blur-lg group-hover:opacity-40 transition-opacity"></div>
                      <Target className="absolute top-2 right-2 h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl md:text-4xl font-black text-[var(--foreground)] mb-3 flex items-center gap-3">
                        PROBLEM DECONSTRUCTION
                        <Brain className="h-8 w-8 text-[var(--primary)]" />
                      </h3>
                      <p className="text-lg text-[var(--muted-foreground)] leading-relaxed">
                        Dissecting the systemic inefficiencies in traditional investment due diligence methodologies
                      </p>
                    </div>
                    <ChevronRight className="h-8 w-8 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] group-hover:translate-x-2 transition-all" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Agenda Item 2 - Demo Walkthrough */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--secondary)] to-[var(--accent)] rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl"></div>
              <div className="relative bg-[var(--card)] border-2 border-[var(--border)] hover:border-[var(--secondary)] rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--secondary)] to-[var(--accent)]"></div>
                <div className="p-10">
                  <div className="flex items-center gap-8">
                    <div className="relative">
                      <div className="bg-gradient-to-br from-[var(--secondary)] to-[var(--accent)] rounded-2xl p-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
                        <span className="text-3xl font-black text-white">02</span>
                      </div>
                      <div className="absolute -inset-2 bg-gradient-to-r from-[var(--secondary)] to-[var(--accent)] rounded-2xl opacity-20 blur-lg group-hover:opacity-40 transition-opacity"></div>
                      <Zap className="absolute top-2 right-2 h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl md:text-4xl font-black text-[var(--foreground)] mb-3 flex items-center gap-3">
                        ADAPTIVE DEMONSTRATION
                        <TrendingUp className="h-8 w-8 text-[var(--secondary)]" />
                      </h3>
                      <p className="text-lg text-[var(--muted-foreground)] leading-relaxed">
                        Personalized platform exploration calibrated to individual investor behavioral patterns and preferences
                      </p>
                    </div>
                    <ChevronRight className="h-8 w-8 text-[var(--muted-foreground)] group-hover:text-[var(--secondary)] group-hover:translate-x-2 transition-all" />
                  </div>
                </div>
              </div>
            </div>

            {/* Agenda Item 3 - Next Steps */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)] to-[var(--warning)] rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl"></div>
              <div className="relative bg-[var(--card)] border-2 border-[var(--border)] hover:border-[var(--accent)] rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--accent)] to-[var(--warning)]"></div>
                <div className="p-10">
                  <div className="flex items-center gap-8">
                    <div className="relative">
                      <div className="bg-gradient-to-br from-[var(--accent)] to-[var(--warning)] rounded-2xl p-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
                        <span className="text-3xl font-black text-[var(--foreground)]">03</span>
                      </div>
                      <div className="absolute -inset-2 bg-gradient-to-r from-[var(--accent)] to-[var(--warning)] rounded-2xl opacity-20 blur-lg group-hover:opacity-40 transition-opacity"></div>
                      <Rocket className="absolute top-2 right-2 h-6 w-6 text-[var(--foreground)]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl md:text-4xl font-black text-[var(--foreground)] mb-3 flex items-center gap-3">
                        ENGAGEMENT PATHWAYS
                        <Users className="h-8 w-8 text-[var(--accent)]" />
                      </h3>
                      <p className="text-lg text-[var(--muted-foreground)] leading-relaxed">
                        Strategic onboarding routes: Community access tier versus premium founding investor consortium membership
                      </p>
                    </div>
                    <ChevronRight className="h-8 w-8 text-[var(--muted-foreground)] group-hover:text-[var(--accent)] group-hover:translate-x-2 transition-all" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ultimate Call to Action */}
          <div className="text-center mt-24">
            <div className="relative max-w-4xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] rounded-3xl blur-xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] rounded-3xl p-12 text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full blur-xl"></div>
                
                <div className="relative z-10">
                  <h3 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
                    INITIATE TRANSFORMATION
                  </h3>
                  <p className="text-xl md:text-2xl opacity-95 mb-10 max-w-3xl mx-auto font-light leading-relaxed">
                    Experience the convergence of artificial intelligence and investment strategy. 
                    Your competitive advantage awaits activation.
                  </p>
                  <Link 
                    href="/investor-onboarding"
                    className="group inline-flex items-center px-12 py-6 bg-white text-[var(--primary)] rounded-2xl font-black text-xl hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-white/20"
                    data-testid="button-start-demo"
                  >
                    <Play className="h-8 w-8 mr-4 group-hover:scale-110 transition-transform" />
                    COMMENCE DEMO
                    <ArrowRight className="h-8 w-8 ml-4 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}