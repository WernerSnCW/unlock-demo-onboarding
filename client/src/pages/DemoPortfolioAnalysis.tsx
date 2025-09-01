import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, TrendingDown, User, Target, AlertTriangle, PieChart, BarChart3, LineChart, Sparkles, Brain, Zap, ArrowLeft, Shield, Settings, Clock, Leaf } from "lucide-react";
import { Cell, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Link } from "wouter";

interface InvestorData {
  persona?: {
    name: string;
    description: string;
  };
  score?: number;
  scenario?: {
    name: string;
    description: string;
  };
  portfolioData?: any;
  portfolioConfig?: any;
}

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

export default function DemoPortfolioAnalysis() {
  const [investorData, setInvestorData] = useState<InvestorData>({});
  const [activeTab, setActiveTab] = useState("overview");
  const [personaScenarios, setPersonaScenarios] = useState<any[]>([]);

  useEffect(() => {
    // Load investor data from localStorage
    const storedPersona = localStorage.getItem('questionnairePersonaResult');
    const storedScenario = localStorage.getItem('selectedScenario');
    const storedPortfolio = localStorage.getItem('uploadedPortfolioData');
    const storedConfig = localStorage.getItem('portfolioConfig');
    
    // Get persona scenarios from URL parameters (as passed from demo simulation)
    const urlParams = new URLSearchParams(window.location.search);
    const personaScenarioIds = urlParams.get('personaScenarios')?.split(',').filter(Boolean) || [];
    const allScenarioIds = urlParams.get('scenarios')?.split(',').filter(Boolean) || [];

    const data: InvestorData = {};

    console.log('Loading demo data from localStorage:', {
      persona: storedPersona ? 'Found' : 'Missing',
      scenario: storedScenario ? 'Found' : 'Missing', 
      portfolio: storedPortfolio ? 'Found' : 'Missing',
      config: storedConfig ? 'Found' : 'Missing'
    });

    console.log('URL scenario IDs:', { personaScenarioIds, allScenarioIds });

    // Filter scenarios to show only the ones relevant to this persona
    const relevantScenarioIds = allScenarioIds.length > 0 ? allScenarioIds : personaScenarioIds;
    const filteredScenarios = economicScenarios.filter(scenario => 
      relevantScenarioIds.includes(scenario.id)
    );
    
    console.log('Filtered scenarios for this persona:', filteredScenarios.map(s => s.name));
    setPersonaScenarios(filteredScenarios);

    if (storedPersona) {
      try {
        const personaResult = JSON.parse(storedPersona);
        data.persona = personaResult.persona;
        data.score = personaResult.score;
        console.log('Loaded persona:', data.persona?.name);
      } catch (e) {
        console.error('Failed to parse persona data:', e);
      }
    }

    if (storedScenario) {
      try {
        data.scenario = JSON.parse(storedScenario);
        console.log('Loaded scenario:', data.scenario?.name);
      } catch (e) {
        console.error('Failed to parse scenario data:', e);
      }
    }

    if (storedPortfolio) {
      try {
        data.portfolioData = JSON.parse(storedPortfolio);
        console.log('Loaded portfolio data:', data.portfolioData ? 'Success' : 'Failed');
      } catch (e) {
        console.error('Failed to parse portfolio data:', e);
      }
    }

    if (storedConfig) {
      try {
        data.portfolioConfig = JSON.parse(storedConfig);
        console.log('Loaded portfolio config:', data.portfolioConfig ? 'Success' : 'Failed');
      } catch (e) {
        console.error('Failed to parse portfolio config:', e);
      }
    }

    setInvestorData(data);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-32 left-16 w-40 h-40 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-64 right-24 w-32 h-32 bg-gradient-to-br from-[var(--accent)] to-[var(--warning)] rounded-full blur-xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute bottom-48 left-24 w-28 h-28 bg-gradient-to-br from-[var(--secondary)] to-[var(--primary)] rounded-full blur-lg animate-pulse" style={{animationDelay: '2.5s'}}></div>
      </div>

      <Header />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden min-h-[60vh] flex items-center justify-center">
        {/* Dynamic Background Mesh */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] via-transparent to-[var(--secondary)] opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-[var(--accent)] via-transparent to-[var(--warning)] opacity-5"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {/* Back Navigation */}
          <div className="flex items-center justify-center mb-8">
            <Link href="/demo-simulation">
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--primary)]">
                <ArrowLeft className="h-4 w-4" />
                Back to Demo
              </Button>
            </Link>
          </div>

          {/* Floating Icon with Glow Effect */}
          <div className="flex items-center justify-center mb-8 relative">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-full p-6 group-hover:scale-110 transition-transform duration-300">
                <LineChart className="h-12 w-12" />
              </div>
              <div className="absolute -top-2 -right-2 animate-bounce">
                <Sparkles className="h-6 w-6 text-[var(--accent)] fill-current" />
              </div>
            </div>
          </div>

          {/* Revolutionary Typography */}
          <h1 className="relative mb-8">
            <span className="block text-2xl md:text-4xl font-light text-[var(--muted-foreground)] tracking-wider uppercase mb-2">Live Portfolio</span>
            <span className="block text-5xl md:text-8xl font-black bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] bg-clip-text text-transparent leading-none tracking-tight">
              ANALYSIS
            </span>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent"></div>
          </h1>

          <p className="text-xl md:text-2xl text-[var(--muted-foreground)] max-w-4xl mx-auto mb-12 leading-relaxed font-light">
            Real-time analysis with
            <span className="text-[var(--primary)] font-semibold"> AI-powered insights, stress testing, and personalized recommendations</span>
          </p>

          {/* Status Badge with Animation */}
          <div className="inline-flex items-center px-8 py-4 bg-[var(--card)] border-2 border-[var(--success)] rounded-full shadow-2xl hover:shadow-[var(--success)]/20 transition-all duration-300 group">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Zap className="h-6 w-6 text-[var(--success)]" />
                <div className="absolute inset-0 animate-ping">
                  <Zap className="h-6 w-6 text-[var(--success)] opacity-30" />
                </div>
              </div>
              <span className="text-[var(--foreground)] font-semibold text-lg">ANALYSIS ACTIVE</span>
              <div className="w-2 h-2 bg-[var(--success)] rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Analysis Tabs */}
      <main className="flex-1 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-6 bg-[var(--card)] border-2 border-[var(--border)] p-0.5 rounded-xl shadow-2xl backdrop-blur-sm h-12">
            <TabsTrigger 
              value="overview" 
              className="flex items-center justify-center rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--primary)] data-[state=active]:to-[var(--secondary)] data-[state=active]:text-white data-[state=active]:shadow-lg py-1 px-0.5"
            >
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">1</div>
                <span className="text-xs hidden lg:block">Overview</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="refine" 
              className="flex items-center justify-center rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--primary)] data-[state=active]:to-[var(--secondary)] data-[state=active]:text-white data-[state=active]:shadow-lg py-1 px-0.5"
            >
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">2</div>
                <span className="text-xs hidden lg:block">Refine</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="performance" 
              className="flex items-center justify-center rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--primary)] data-[state=active]:to-[var(--secondary)] data-[state=active]:text-white data-[state=active]:shadow-lg py-1 px-0.5"
            >
              <div className="flex flex-col items-center">
                <TrendingUp className="h-3 w-3" />
                <span className="text-xs hidden lg:block">Perf</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="risk" 
              className="flex items-center justify-center rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--primary)] data-[state=active]:to-[var(--secondary)] data-[state=active]:text-white data-[state=active]:shadow-lg py-1 px-0.5"
            >
              <div className="flex flex-col items-center">
                <AlertTriangle className="h-3 w-3" />
                <span className="text-xs hidden lg:block">Risk</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="stress" 
              className="flex items-center justify-center rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--primary)] data-[state=active]:to-[var(--secondary)] data-[state=active]:text-white data-[state=active]:shadow-lg py-1 px-0.5"
            >
              <div className="flex flex-col items-center">
                <Zap className="h-3 w-3" />
                <span className="text-xs hidden lg:block">Stress</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="insights" 
              className="flex items-center justify-center rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--primary)] data-[state=active]:to-[var(--secondary)] data-[state=active]:text-white data-[state=active]:shadow-lg py-1 px-0.5"
            >
              <div className="flex flex-col items-center">
                <Sparkles className="h-3 w-3" />
                <span className="text-xs hidden lg:block">AI</span>
              </div>
            </TabsTrigger>
          </TabsList>

          {/* Portfolio Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Investor Profile & Scenario Configuration */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {investorData.persona ? (
                <Card className="relative border-2 border-[var(--primary)]/30 bg-gradient-to-br from-[var(--card)] to-[var(--primary)]/5 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden group hover:shadow-[var(--primary)]/20 transition-all duration-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <User className="h-5 w-5 text-[var(--primary)]" />
                      Your Investor Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-[var(--primary)]">
                          {investorData.persona.name}
                        </h3>
                        {investorData.score && (
                          <Badge variant="secondary" className="px-3 py-1 text-sm">
                            {investorData.score.toFixed(1)}% match
                          </Badge>
                        )}
                      </div>
                      <p className="text-[var(--muted-foreground)] leading-relaxed">
                        {investorData.persona.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-[var(--success)]">
                        <div className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse"></div>
                        <span>Profile-based analysis active</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-2 border-dashed border-[var(--border)] bg-[var(--card)] rounded-3xl">
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center space-y-3">
                      <User className="h-8 w-8 text-[var(--muted-foreground)] mx-auto" />
                      <p className="text-[var(--muted-foreground)]">
                        Complete investor preferences questionnaire
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {personaScenarios.length > 0 ? (
                <Card className="relative border-2 border-[var(--secondary)]/30 bg-gradient-to-br from-[var(--card)] to-[var(--secondary)]/5 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden group hover:shadow-[var(--secondary)]/20 transition-all duration-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Target className="h-5 w-5 text-[var(--secondary)]" />
                      Stress Testing
                      <Badge variant="outline" className="bg-[var(--secondary)] text-white ml-2">
                        {personaScenarios.length} Active Scenarios
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {personaScenarios.map((scenario) => {
                        const isCurrentScenario = investorData.scenario?.name === scenario.name;
                        const IconComponent = scenario.icon;
                        
                        return (
                          <div
                            key={scenario.id}
                            className="p-3 rounded-xl border transition-all duration-300 border-[var(--secondary)] bg-[var(--secondary)]/10 shadow-md"
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-[var(--secondary)] text-white">
                                <IconComponent className="h-4 w-4" />
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-sm text-[var(--secondary)]">
                                    {scenario.name}
                                  </h4>
                                  <Badge variant="secondary" className="bg-[var(--secondary)] text-white text-xs">
                                    High Impact
                                  </Badge>
                                </div>
                                
                                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mb-2">
                                  {scenario.description}
                                </p>
                                
                                <div className="flex items-center gap-2 text-xs text-[var(--secondary)]">
                                  <div className="w-2 h-2 rounded-full bg-[var(--secondary)] animate-pulse"></div>
                                  <span>
                                    {isCurrentScenario ? 'Stress testing active' : 'Scenario modeling active'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-2 border-dashed border-[var(--border)] bg-[var(--card)] rounded-3xl">
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center space-y-3">
                      <Target className="h-8 w-8 text-[var(--muted-foreground)] mx-auto" />
                      <p className="text-[var(--muted-foreground)]">
                        Select economic scenario for stress testing
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-2 border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] backdrop-blur-sm shadow-2xl rounded-3xl transition-all duration-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-[var(--primary)]" />
                    Portfolio Allocation
                  </CardTitle>
                  <CardDescription>
                    Asset class distribution and allocation breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {investorData.portfolioConfig ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={[
                              {
                                name: 'Stocks/Equities',
                                value: parseInt(investorData.portfolioConfig.stocks || '0'),
                                color: '#646cff'
                              },
                              {
                                name: 'Bonds',
                                value: parseInt(investorData.portfolioConfig.bonds || '0'),
                                color: '#41d1ff'
                              },
                              {
                                name: 'Alternatives',
                                value: parseInt(investorData.portfolioConfig.alternatives || '0'),
                                color: '#f97316'
                              },
                              {
                                name: 'Property/REITs',
                                value: parseInt(investorData.portfolioConfig.property || '0'),
                                color: '#22c55e'
                              },
                              {
                                name: 'Cash/Savings',
                                value: parseInt(investorData.portfolioConfig.cash || '0'),
                                color: '#8b5cf6'
                              }
                            ].filter(item => item.value > 0)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {[
                              { color: '#646cff' },
                              { color: '#41d1ff' },
                              { color: '#f97316' },
                              { color: '#22c55e' },
                              { color: '#8b5cf6' }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number) => [`£${value.toLocaleString()}`, 'Value']}
                            labelStyle={{ color: 'var(--foreground)' }}
                            contentStyle={{ 
                              backgroundColor: 'var(--card)', 
                              border: '1px solid var(--border)',
                              borderRadius: '8px'
                            }}
                          />
                          <Legend 
                            wrapperStyle={{ 
                              paddingTop: '20px',
                              fontSize: '14px'
                            }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-80 flex items-center justify-center border-2 border-dashed border-[var(--border)] rounded-lg">
                      <div className="text-center space-y-2">
                        <PieChart className="h-12 w-12 text-[var(--muted-foreground)] mx-auto" />
                        <p className="text-[var(--muted-foreground)]">Portfolio allocation chart will display here</p>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          Real-time data integration with interactive visualizations
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="border-2 border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] backdrop-blur-sm shadow-2xl rounded-3xl transition-all duration-500">
                  <CardHeader>
                    <CardTitle className="text-lg">Total Portfolio Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {investorData.portfolioConfig && (investorData.portfolioConfig.stocks || investorData.portfolioConfig.bonds || investorData.portfolioConfig.alternatives || investorData.portfolioConfig.property || investorData.portfolioConfig.cash) ? (
                        <>
                          <div className="text-3xl font-bold text-[var(--primary)]">
                            £{(
                              (parseInt(investorData.portfolioConfig.stocks || '0')) +
                              (parseInt(investorData.portfolioConfig.bonds || '0')) +
                              (parseInt(investorData.portfolioConfig.alternatives || '0')) +
                              (parseInt(investorData.portfolioConfig.property || '0')) +
                              (parseInt(investorData.portfolioConfig.cash || '0'))
                            ).toLocaleString()}
                          </div>
                          <div className="space-y-2 text-xs">
                            {investorData.portfolioConfig.stocks && (
                              <div className="flex justify-between">
                                <span className="text-[var(--muted-foreground)]">Stocks/Equities:</span>
                                <span className="font-medium">£{parseInt(investorData.portfolioConfig.stocks).toLocaleString()}</span>
                              </div>
                            )}
                            {investorData.portfolioConfig.bonds && (
                              <div className="flex justify-between">
                                <span className="text-[var(--muted-foreground)]">Bonds:</span>
                                <span className="font-medium">£{parseInt(investorData.portfolioConfig.bonds).toLocaleString()}</span>
                              </div>
                            )}
                            {investorData.portfolioConfig.alternatives && (
                              <div className="flex justify-between">
                                <span className="text-[var(--muted-foreground)]">Alternatives:</span>
                                <span className="font-medium">£{parseInt(investorData.portfolioConfig.alternatives).toLocaleString()}</span>
                              </div>
                            )}
                            {investorData.portfolioConfig.property && (
                              <div className="flex justify-between">
                                <span className="text-[var(--muted-foreground)]">Property/REITs:</span>
                                <span className="font-medium">£{parseInt(investorData.portfolioConfig.property).toLocaleString()}</span>
                              </div>
                            )}
                            {investorData.portfolioConfig.cash && (
                              <div className="flex justify-between">
                                <span className="text-[var(--muted-foreground)]">Cash/Savings:</span>
                                <span className="font-medium">£{parseInt(investorData.portfolioConfig.cash).toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-3xl font-bold text-[var(--primary)]">£1,950,000</div>
                          <div className="flex items-center gap-2 text-sm">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="text-green-600">+12.5% (£217k)</span>
                            <span className="text-[var(--muted-foreground)]">vs last month</span>
                          </div>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            Complete portfolio configuration to see your values
                          </p>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] backdrop-blur-sm shadow-2xl rounded-3xl transition-all duration-500">
                  <CardHeader>
                    <CardTitle className="text-lg">Portfolio Configuration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {investorData.portfolioConfig ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-[var(--muted-foreground)]">Geographic Mix</span>
                            <span className="font-semibold">
                              {investorData.portfolioConfig.international === '0-25' && '0-25% International'}
                              {investorData.portfolioConfig.international === '25-50' && '25-50% International'}
                              {investorData.portfolioConfig.international === '50-75' && '50-75% International'}
                              {investorData.portfolioConfig.international === '75-100' && '75-100% International'}
                              {!investorData.portfolioConfig.international && 'Not specified'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[var(--muted-foreground)]">Time Horizon</span>
                            <span className="font-semibold">
                              {investorData.portfolioConfig.timeHorizon === '1-3' && '1-3 years'}
                              {investorData.portfolioConfig.timeHorizon === '3-7' && '3-7 years'}
                              {investorData.portfolioConfig.timeHorizon === '7-15' && '7-15 years'}
                              {investorData.portfolioConfig.timeHorizon === '15-plus' && '15+ years'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[var(--muted-foreground)]">Portfolio Size</span>
                            <span className="font-semibold">
                              £{(
                                (parseInt(investorData.portfolioConfig.stocks || '0')) +
                                (parseInt(investorData.portfolioConfig.bonds || '0')) +
                                (parseInt(investorData.portfolioConfig.alternatives || '0')) +
                                (parseInt(investorData.portfolioConfig.property || '0')) +
                                (parseInt(investorData.portfolioConfig.cash || '0'))
                              ).toLocaleString()}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-[var(--muted-foreground)]">Portfolio configuration data not available</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card className="border-2 border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] backdrop-blur-sm shadow-2xl rounded-3xl transition-all duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-[var(--secondary)]" />
                  Performance Analysis
                </CardTitle>
                <CardDescription>
                  Historical performance and trend analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 flex items-center justify-center border-2 border-dashed border-[var(--border)] rounded-lg">
                  <div className="text-center space-y-2">
                    <LineChart className="h-12 w-12 text-[var(--muted-foreground)] mx-auto" />
                    <p className="text-[var(--muted-foreground)]">Performance charts and analytics</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Real-time market data with historical comparison
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risk Analysis Tab */}
          <TabsContent value="risk" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-2 border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] backdrop-blur-sm shadow-2xl rounded-3xl transition-all duration-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <span className="font-semibold text-orange-800 dark:text-orange-200">Concentration Risk</span>
                      </div>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        High allocation to crypto assets (17.9% of portfolio)
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-[var(--muted-foreground)]">Portfolio Beta</span>
                        <span className="font-semibold">1.23</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--muted-foreground)]">Volatility</span>
                        <span className="font-semibold">18.5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--muted-foreground)]">Max Drawdown</span>
                        <span className="font-semibold text-red-600">-15.2%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] backdrop-blur-sm shadow-2xl rounded-3xl transition-all duration-500">
                <CardHeader>
                  <CardTitle>Asset Class Risk</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border-2 border-dashed border-[var(--border)] rounded-lg">
                    <div className="text-center space-y-2">
                      <BarChart3 className="h-12 w-12 text-[var(--muted-foreground)] mx-auto" />
                      <p className="text-[var(--muted-foreground)]">Risk breakdown by asset class</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Stress Testing Tab */}
          <TabsContent value="stress" className="space-y-6">
            <Card className="border-2 border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] backdrop-blur-sm shadow-2xl rounded-3xl transition-all duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-[var(--accent)]" />
                  Economic Scenario Testing
                  {investorData.scenario && (
                    <Badge variant="secondary" className="ml-2">
                      {investorData.scenario.name}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Portfolio performance under different economic conditions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {investorData.scenario && (
                    <div className="p-4 bg-[var(--accent)]/10 rounded-lg border border-[var(--accent)]/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-[var(--accent)]" />
                        <span className="font-semibold">Active Scenario: {investorData.scenario.name}</span>
                      </div>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {investorData.scenario.description}
                      </p>
                    </div>
                  )}
                  
                  {/* All Economic Scenarios */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-[var(--foreground)]">
                        All Economic Scenarios
                      </h3>
                      <Badge variant="outline" className="bg-[var(--muted)] text-[var(--foreground)]">
                        {personaScenarios.length} Active Scenarios
                      </Badge>
                    </div>
                    <div className="grid gap-3 max-h-none overflow-visible">
                      {personaScenarios.map((scenario, index) => {
                        const isActive = investorData.scenario?.name === scenario.name;
                        const IconComponent = scenario.icon;
                        console.log(`Rendering persona scenario ${index + 1}:`, scenario.name, 'Active:', isActive);
                        
                        return (
                          <div
                            key={scenario.id}
                            className={`relative p-4 rounded-xl border transition-all duration-300 ${
                              isActive
                                ? 'border-[var(--primary)] bg-[var(--primary)]/5 shadow-lg shadow-[var(--primary)]/20'
                                : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/50 hover:shadow-md'
                            }`}
                          >
                            {isActive && (
                              <div className="absolute top-2 right-2">
                                <Badge variant="secondary" className="bg-[var(--primary)] text-white">
                                  Active
                                </Badge>
                              </div>
                            )}
                            
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${
                                isActive 
                                  ? 'bg-[var(--primary)] text-white' 
                                  : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                              }`}>
                                <IconComponent className="h-5 w-5" />
                              </div>
                              
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className={`font-semibold ${
                                    isActive ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'
                                  }`}>
                                    {scenario.name}
                                  </h4>
                                  <span className="text-xs text-[var(--muted-foreground)] bg-[var(--muted)] px-2 py-1 rounded">
                                    {scenario.horizon}
                                  </span>
                                </div>
                                
                                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                                  {scenario.description}
                                </p>
                                
                                {isActive && (
                                  <div className="flex items-center gap-2 text-xs text-[var(--primary)]">
                                    <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse"></div>
                                    <span>Currently running stress test analysis</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <Card className="border-2 border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] backdrop-blur-sm shadow-2xl rounded-3xl transition-all duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[var(--primary)]" />
                  AI-Powered Insights
                  {investorData.persona && (
                    <Badge variant="secondary" className="ml-2">
                      Tailored for {investorData.persona.name}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Personalized recommendations based on your investor profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-green-800 dark:text-green-200">Opportunities</span>
                      </div>
                      <ul className="space-y-2 text-sm text-green-700 dark:text-green-300">
                        <li>• Consider rebalancing crypto allocation</li>
                        <li>• Strong performance in tech holdings</li>
                        <li>• Opportunity for ESG diversification</li>
                      </ul>
                    </div>

                    <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-3">
                        <Brain className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold text-blue-800 dark:text-blue-200">Recommendations</span>
                      </div>
                      <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                        <li>• Increase bond allocation for stability</li>
                        <li>• Consider international diversification</li>
                        <li>• Review tax-efficient structures</li>
                      </ul>
                    </div>
                  </div>

                  <div className="h-64 flex items-center justify-center border-2 border-dashed border-[var(--border)] rounded-lg">
                    <div className="text-center space-y-2">
                      <Sparkles className="h-12 w-12 text-[var(--muted-foreground)] mx-auto" />
                      <p className="text-[var(--muted-foreground)]">Advanced AI analysis and recommendations</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Machine learning insights based on market trends and personal profile
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Refine Your Analysis Tab */}
          <TabsContent value="refine" className="space-y-6">
            <Card className="border-2 border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] backdrop-blur-sm shadow-2xl rounded-3xl transition-all duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-[var(--primary)]" />
                  Refine Your Analysis
                </CardTitle>
                <CardDescription>
                  Answer these questions to get more personalized insights and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Investment Goals */}
                  <Card className="bg-gradient-to-br from-[var(--primary)]/5 to-[var(--secondary)]/5 border-[var(--primary)]/20">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5 text-[var(--primary)]" />
                        Investment Goals
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-[var(--foreground)] mb-2 block">
                          What is your primary investment objective?
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <button className="p-3 text-left border border-[var(--border)] rounded-lg hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all duration-200">
                            <div className="font-medium">Capital Growth</div>
                            <div className="text-xs text-[var(--muted-foreground)]">Focus on long-term appreciation</div>
                          </button>
                          <button className="p-3 text-left border border-[var(--border)] rounded-lg hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all duration-200">
                            <div className="font-medium">Income Generation</div>
                            <div className="text-xs text-[var(--muted-foreground)]">Priority on dividends and yield</div>
                          </button>
                          <button className="p-3 text-left border border-[var(--border)] rounded-lg hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all duration-200">
                            <div className="font-medium">Capital Preservation</div>
                            <div className="text-xs text-[var(--muted-foreground)]">Protect existing wealth</div>
                          </button>
                          <button className="p-3 text-left border border-[var(--border)] rounded-lg hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all duration-200">
                            <div className="font-medium">Balanced Approach</div>
                            <div className="text-xs text-[var(--muted-foreground)]">Mix of growth and income</div>
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Risk Tolerance */}
                  <Card className="bg-gradient-to-br from-[var(--secondary)]/5 to-[var(--accent)]/5 border-[var(--secondary)]/20">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-[var(--secondary)]" />
                        Risk Assessment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-[var(--foreground)] mb-2 block">
                          How would you react to a 20% portfolio decline?
                        </label>
                        <div className="space-y-2">
                          <button className="w-full p-3 text-left border border-[var(--border)] rounded-lg hover:border-[var(--secondary)] hover:bg-[var(--secondary)]/5 transition-all duration-200">
                            <div className="font-medium">Sell immediately</div>
                            <div className="text-xs text-[var(--muted-foreground)]">Minimize further losses</div>
                          </button>
                          <button className="w-full p-3 text-left border border-[var(--border)] rounded-lg hover:border-[var(--secondary)] hover:bg-[var(--secondary)]/5 transition-all duration-200">
                            <div className="font-medium">Hold and wait for recovery</div>
                            <div className="text-xs text-[var(--muted-foreground)]">Stay the course</div>
                          </button>
                          <button className="w-full p-3 text-left border border-[var(--border)] rounded-lg hover:border-[var(--secondary)] hover:bg-[var(--secondary)]/5 transition-all duration-200">
                            <div className="font-medium">Buy more at lower prices</div>
                            <div className="text-xs text-[var(--muted-foreground)]">Take advantage of the opportunity</div>
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Time Horizon */}
                  <Card className="bg-gradient-to-br from-[var(--accent)]/5 to-[var(--warning)]/5 border-[var(--accent)]/20">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5 text-[var(--accent)]" />
                        Investment Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-[var(--foreground)] mb-2 block">
                          When do you expect to need this money?
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <button className="p-3 text-center border border-[var(--border)] rounded-lg hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all duration-200">
                            <div className="font-medium text-sm">1-3 years</div>
                          </button>
                          <button className="p-3 text-center border border-[var(--border)] rounded-lg hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all duration-200">
                            <div className="font-medium text-sm">3-7 years</div>
                          </button>
                          <button className="p-3 text-center border border-[var(--border)] rounded-lg hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all duration-200">
                            <div className="font-medium text-sm">7-15 years</div>
                          </button>
                          <button className="p-3 text-center border border-[var(--border)] rounded-lg hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all duration-200">
                            <div className="font-medium text-sm">15+ years</div>
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* ESG Preferences */}
                  <Card className="bg-gradient-to-br from-[var(--success)]/5 to-[var(--primary)]/5 border-[var(--success)]/20">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Leaf className="h-5 w-5 text-[var(--success)]" />
                        ESG & Sustainability
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-[var(--foreground)] mb-2 block">
                          How important are environmental and social factors in your investments?
                        </label>
                        <div className="space-y-2">
                          <button className="w-full p-3 text-left border border-[var(--border)] rounded-lg hover:border-[var(--success)] hover:bg-[var(--success)]/5 transition-all duration-200">
                            <div className="font-medium">Very Important</div>
                            <div className="text-xs text-[var(--muted-foreground)]">Only invest in ESG-compliant companies</div>
                          </button>
                          <button className="w-full p-3 text-left border border-[var(--border)] rounded-lg hover:border-[var(--success)] hover:bg-[var(--success)]/5 transition-all duration-200">
                            <div className="font-medium">Somewhat Important</div>
                            <div className="text-xs text-[var(--muted-foreground)]">Prefer ESG options when available</div>
                          </button>
                          <button className="w-full p-3 text-left border border-[var(--border)] rounded-lg hover:border-[var(--success)] hover:bg-[var(--success)]/5 transition-all duration-200">
                            <div className="font-medium">Not a Priority</div>
                            <div className="text-xs text-[var(--muted-foreground)]">Focus primarily on returns</div>
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Submit Button */}
                  <div className="flex justify-center pt-6">
                    <button className="px-8 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      Update Analysis
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}