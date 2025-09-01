import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, TrendingDown, User, Target, AlertTriangle, PieChart, BarChart3, LineChart, Sparkles, Brain, Zap, ArrowLeft } from "lucide-react";
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
  scenarios?: Array<{
    name: string;
    description: string;
  }>;
  portfolioData?: any;
  portfolioConfig?: any;
}

export default function DemoPortfolioAnalysis() {
  const [investorData, setInvestorData] = useState<InvestorData>({});
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // Load investor data from localStorage
    const storedPersona = localStorage.getItem('questionnairePersonaResult');
    const storedScenario = localStorage.getItem('selectedScenario');
    const storedScenarios = localStorage.getItem('selectedScenarios');
    const storedPortfolio = localStorage.getItem('uploadedPortfolioData');
    const storedConfig = localStorage.getItem('portfolioConfig');

    const data: InvestorData = {};

    console.log('Loading demo data from localStorage:', {
      persona: storedPersona ? 'Found' : 'Missing',
      scenarios: storedScenarios ? 'Found' : 'Missing', 
      portfolio: storedPortfolio ? 'Found' : 'Missing',
      config: storedConfig ? 'Found' : 'Missing'
    });

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

    if (storedScenarios) {
      try {
        data.scenarios = JSON.parse(storedScenarios);
        console.log('Loaded scenarios:', Array.isArray(data.scenarios) ? `${data.scenarios.length} scenarios` : 'Single scenario');
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
          <TabsList className="grid w-full grid-cols-5 bg-[var(--card)] border border-[var(--border)] p-1 rounded-xl">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--primary)] data-[state=active]:to-[var(--secondary)] data-[state=active]:text-white"
            >
              <PieChart className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="performance" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--primary)] data-[state=active]:to-[var(--secondary)] data-[state=active]:text-white"
            >
              <TrendingUp className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger 
              value="risk" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--primary)] data-[state=active]:to-[var(--secondary)] data-[state=active]:text-white"
            >
              <AlertTriangle className="h-4 w-4" />
              Risk Analysis
            </TabsTrigger>
            <TabsTrigger 
              value="stress" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--primary)] data-[state=active]:to-[var(--secondary)] data-[state=active]:text-white"
            >
              <Zap className="h-4 w-4" />
              Stress Testing
            </TabsTrigger>
            <TabsTrigger 
              value="insights" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--primary)] data-[state=active]:to-[var(--secondary)] data-[state=active]:text-white"
            >
              <Sparkles className="h-4 w-4" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          {/* Portfolio Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Investor Profile & Scenario Configuration */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {investorData.persona ? (
                <Card className="border-2 border-[var(--primary)]/30 bg-gradient-to-br from-[var(--card)] to-[var(--primary)]/5 backdrop-blur-sm shadow-2xl">
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
                <Card className="border-2 border-dashed border-[var(--border)] bg-[var(--card)]">
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

              {(investorData.scenarios && investorData.scenarios.length > 0) ? (
                <Card className="border-2 border-[var(--secondary)]/30 bg-gradient-to-br from-[var(--card)] to-[var(--secondary)]/5 backdrop-blur-sm shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Target className="h-5 w-5 text-[var(--secondary)]" />
                      Stress Test Scenarios
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {investorData.scenarios.map((scenario, index) => (
                        <div key={index} className={`${index > 0 ? 'pt-4 border-t border-[var(--border)]' : ''}`}>
                          <h3 className="text-xl font-bold text-[var(--secondary)]">
                            {scenario.name}
                          </h3>
                          <p className="text-[var(--muted-foreground)] leading-relaxed mt-2">
                            {scenario.description}
                          </p>
                        </div>
                      ))}
                      <div className="flex items-center gap-2 text-sm text-[var(--secondary)]">
                        <div className="w-2 h-2 rounded-full bg-[var(--secondary)] animate-pulse"></div>
                        <span>{investorData.scenarios.length} scenario{investorData.scenarios.length > 1 ? 's' : ''} modeling active</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-2 border-dashed border-[var(--border)] bg-[var(--card)]">
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
              <Card className="lg:col-span-2 border-2 border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] backdrop-blur-sm shadow-2xl transition-all duration-500">
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
                  <div className="h-80 flex items-center justify-center border-2 border-dashed border-[var(--border)] rounded-lg">
                    <div className="text-center space-y-2">
                      <PieChart className="h-12 w-12 text-[var(--muted-foreground)] mx-auto" />
                      <p className="text-[var(--muted-foreground)]">Portfolio allocation chart will display here</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Real-time data integration with interactive visualizations
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="border-2 border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] backdrop-blur-sm shadow-2xl transition-all duration-500">
                  <CardHeader>
                    <CardTitle className="text-lg">Total Portfolio Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {investorData.portfolioConfig && investorData.portfolioConfig.totalValue ? (
                        <>
                          <div className="text-3xl font-bold text-[var(--primary)]">
                            £{parseInt(investorData.portfolioConfig.totalValue).toLocaleString()}
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

                <Card className="border-2 border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] backdrop-blur-sm shadow-2xl transition-all duration-500">
                  <CardHeader>
                    <CardTitle className="text-lg">Key Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-[var(--muted-foreground)]">Risk Score</span>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Medium</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--muted-foreground)]">Diversification</span>
                        <Badge variant="outline" className="bg-green-100 text-green-800">Good</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--muted-foreground)]">Holdings</span>
                        <span className="font-semibold">14 positions</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card className="border-2 border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] backdrop-blur-sm shadow-2xl transition-all duration-500">
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
              <Card className="border-2 border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] backdrop-blur-sm shadow-2xl transition-all duration-500">
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

              <Card className="border-2 border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] backdrop-blur-sm shadow-2xl transition-all duration-500">
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
            <Card className="border-2 border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] backdrop-blur-sm shadow-2xl transition-all duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-[var(--accent)]" />
                  Economic Scenario Testing
                  {investorData.scenarios && investorData.scenarios.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {investorData.scenarios.length} Active Scenario{investorData.scenarios.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Portfolio performance under different economic conditions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {investorData.scenarios && investorData.scenarios.length > 0 && (
                    <div className="space-y-3">
                      {investorData.scenarios.map((scenario, index) => (
                        <div key={index} className="p-4 bg-[var(--accent)]/10 rounded-lg border border-[var(--accent)]/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="h-4 w-4 text-[var(--accent)]" />
                            <span className="font-semibold">Active Scenario: {scenario.name}</span>
                          </div>
                          <p className="text-sm text-[var(--muted-foreground)]">
                            {scenario.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="h-80 flex items-center justify-center border-2 border-dashed border-[var(--border)] rounded-lg">
                    <div className="text-center space-y-2">
                      <Zap className="h-12 w-12 text-[var(--muted-foreground)] mx-auto" />
                      <p className="text-[var(--muted-foreground)]">Stress test results and scenario modeling</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Impact analysis across different market conditions
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <Card className="border-2 border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] backdrop-blur-sm shadow-2xl transition-all duration-500">
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
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}