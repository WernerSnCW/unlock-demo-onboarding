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

        {/* Main Content - Revolutionary Design */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          
          {/* Expectation Setting - Elevated Design */}
          <div className="text-center mb-20 relative">
            <div className="inline-block relative mb-8">
              <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-full p-4 mb-4">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] opacity-10 blur-xl rounded-full"></div>
            </div>
            
            <h3 className="text-2xl md:text-3xl font-black text-[var(--foreground)] mb-4 tracking-tight">
              DEMO OVERVIEW
            </h3>
            <p className="text-lg text-[var(--muted-foreground)] max-w-4xl mx-auto leading-relaxed">
              This demo uses pre-set example portfolios to simulate how Unlock works. After the demo, you can either join the free waitlist or explore our founding investor programme.
            </p>
          </div>

          {/* Revolutionary Card Grid */}
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 mb-20">
            {[
              {
                icon: Target,
                title: "The Problem",
                subtitle: "We Solve",
                description: "Traditional investment analysis takes weeks of manual research, fragmented tools, and disconnected data sources. Alternative assets lack transparency.",
                gradient: "from-red-500 to-pink-400",
                bgColor: "bg-red-50 dark:bg-red-950/20",
                borderColor: "border-red-200 dark:border-red-800/30",
                badge: "01"
              },
              {
                icon: Users,
                title: "Demo Walkthrough",
                subtitle: "Tailored to You",
                description: "Experience personalized portfolio analysis powered by AI, real-time market data, and stress testing scenarios matched to your investor profile.",
                gradient: "from-blue-500 to-cyan-400",
                bgColor: "bg-blue-50 dark:bg-blue-950/20",
                borderColor: "border-blue-200 dark:border-blue-800/30",
                badge: "02"
              },
              {
                icon: ArrowRight,
                title: "Next Steps",
                subtitle: "Your Journey",
                description: "Choose your path forward: Join our free waitlist for early access or explore our founding investor programme for exclusive opportunities.",
                gradient: "from-green-500 to-emerald-400",
                bgColor: "bg-green-50 dark:bg-green-950/20",
                borderColor: "border-green-200 dark:border-green-800/30",
                badge: "03"
              }
            ].map((feature, index) => {
              // Determine the correct link for each card
              const getLink = () => {
                if (feature.badge === "01") return "/advice-gap"; // Problem We Solve -> Advice Gap
                if (feature.badge === "02") return "/investor-onboarding"; // Demo Walkthrough -> Start Onboarding
                return "#"; // Next Steps stays on same page
              };
              
              const CardContent = () => (
                <div className={`relative group ${feature.bgColor} ${feature.borderColor} border rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 ${feature.badge !== "03" ? "cursor-pointer" : ""}`}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-5 rounded-2xl`}></div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <Badge className={`text-lg font-bold px-4 py-2 bg-gradient-to-r ${feature.gradient} text-white border-0`}>
                        {feature.badge}
                      </Badge>
                      <div className={`p-4 bg-gradient-to-br ${feature.gradient} text-white rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                        <feature.icon className="h-8 w-8" />
                      </div>
                    </div>
                    
                    <h3 className="text-3xl font-black text-[var(--foreground)] mb-2 leading-tight">{feature.title}</h3>
                    <p className="text-xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent mb-4 tracking-wide">{feature.subtitle}</p>
                    <p className="text-[var(--muted-foreground)] leading-relaxed mb-6">{feature.description}</p>
                    
                    <div className="flex items-center text-[var(--primary)] font-bold group-hover:translate-x-2 transition-transform duration-300">
                      <span className="mr-2">{feature.badge === "03" ? "View Options" : "Explore Section"}</span>
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              );
              
              // Wrap in Link for cards 01 and 02, return plain div for card 03
              return feature.badge === "03" ? (
                <div key={index}><CardContent /></div>
              ) : (
                <Link key={index} href={getLink()}>
                  <CardContent />
                </Link>
              );
            })}
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
                
                <Link href="/investor-onboarding" className="group">
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