import { useEffect } from 'react';
import { Link } from 'wouter';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Target, User, AlertTriangle, Shield, Sparkles, Play, Rocket, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function Demo() {
  // Parse URL parameters for configuration
  const urlParams = new URLSearchParams(window.location.search);
  const personaName = urlParams.get('personaName');
  const selectedScenarioIds = urlParams.get('selectedScenarios')?.split(',').filter(Boolean) || [];
  const personaScenarioIds = urlParams.get('personaScenarios')?.split(',').filter(Boolean) || [];

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Mock scenarios for display
  const mockScenarios = [
    {
      id: 'property_crash_2008',
      name: '2008-Style Property Crash',
      description: 'Significant property value decline with credit market freeze and financial sector stress'
    },
    {
      id: 'ai_recession', 
      name: 'AI-Driven Economic Recession',
      description: 'Widespread job displacement and economic disruption from rapid AI adoption'
    },
    {
      id: 'uk_policy_shift',
      name: 'Major UK Policy Shift', 
      description: 'Significant changes in UK tax, regulatory, or economic policy affecting investors'
    }
  ];

  // Get relevant scenarios for display
  const displayScenarios = mockScenarios.filter(scenario => 
    personaScenarioIds.includes(scenario.id)
  );

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Configuration Display */}
        <div className="mb-8">
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
                  Live Demo Simulation
                </h2>
                <p className="text-[var(--muted-foreground)]">
                  Running personalized portfolio analysis with your investor profile and risk scenarios
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Investor Persona */}
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
                        Active Profile
                      </Badge>
                    </div>
                    <h5 className="font-bold text-[var(--foreground)] text-lg mb-2">
                      {personaName ? decodeURIComponent(personaName) : 'The Legacy Builder (Advisor-Reliant)'}
                    </h5>
                    <p className="text-sm text-[var(--muted-foreground)] mb-4 leading-relaxed">
                      The simulation is actively modeling your portfolio behavior and risk responses according to this investor archetype.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        Live Analysis
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Risk Modeling
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Real-time Data
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {/* Active Stress Tests */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-[var(--primary)]" />
                    <h4 className="font-semibold text-[var(--foreground)]">
                      Active Stress Tests ({displayScenarios.length})
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {displayScenarios.map((scenario) => (
                      <div key={scenario.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-800/30">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-[var(--primary)]" />
                            <Badge className="text-xs bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-600">
                              Applicable
                            </Badge>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            5 year horizon
                          </Badge>
                        </div>
                        <h6 className="font-semibold text-[var(--foreground)] text-sm mb-2">
                          {scenario.name}
                        </h6>
                        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mb-3">
                          {scenario.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                          <div className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse"></div>
                          <span>Stress testing active</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hero Section */}
        <div className="text-center py-16">
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
            <span className="block text-2xl md:text-4xl font-light text-[var(--muted-foreground)] tracking-wider uppercase mb-2">Live Demo</span>
            <span className="block text-5xl md:text-8xl font-black bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] bg-clip-text text-transparent leading-none tracking-tight">
              SIMULATION
            </span>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent"></div>
          </h1>

          <p className="text-xl md:text-2xl text-[var(--muted-foreground)] max-w-4xl mx-auto mb-12 leading-relaxed font-light">
            Experience how
            <span className="text-[var(--primary)] font-semibold"> Unlock transforms investment analysis</span>
          </p>

          {/* Status Badge with Animation */}
          <div className="inline-flex items-center px-8 py-4 bg-[var(--card)] border-2 border-[var(--success)] rounded-full shadow-2xl hover:shadow-[var(--success)]/20 transition-all duration-300 group mb-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Shield className="h-6 w-6 text-[var(--success)]" />
                <div className="absolute inset-0 animate-ping">
                  <Shield className="h-6 w-6 text-[var(--success)] opacity-30" />
                </div>
              </div>
              <span className="text-[var(--foreground)] font-semibold text-lg">SIMULATION ACTIVE</span>
              <div className="w-2 h-2 bg-[var(--success)] rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Start Analysis Button */}
          <Link href="/portfolio-analysis" className="group">
            <div className="inline-block relative bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-[var(--primary)]/30 transition-all duration-300 group-hover:scale-105">
              <div className="flex items-center gap-3">
                <Rocket className="h-6 w-6" />
                <span>Start Portfolio Analysis</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}