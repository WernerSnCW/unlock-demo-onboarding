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
  portfolioData?: any;
}

export default function DemoPortfolioAnalysis() {
  const [investorData, setInvestorData] = useState<InvestorData>({});
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // Load investor data from localStorage
    const storedPersona = localStorage.getItem('questionnairePersonaResult');
    const storedScenario = localStorage.getItem('selectedScenario');
    const storedPortfolio = localStorage.getItem('uploadedPortfolioData');

    const data: InvestorData = {};

    if (storedPersona) {
      try {
        const personaResult = JSON.parse(storedPersona);
        data.persona = personaResult.persona;
        data.score = personaResult.score;
      } catch (e) {
        console.error('Failed to parse persona data:', e);
      }
    }

    if (storedScenario) {
      try {
        data.scenario = JSON.parse(storedScenario);
      } catch (e) {
        console.error('Failed to parse scenario data:', e);
      }
    }

    if (storedPortfolio) {
      try {
        data.portfolioData = JSON.parse(storedPortfolio);
      } catch (e) {
        console.error('Failed to parse portfolio data:', e);
      }
    }

    setInvestorData(data);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--accent)]/5 to-[var(--secondary)]/10">
      <Header />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/20 via-[var(--secondary)]/20 to-[var(--accent)]/20 animate-gradient-x"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Link href="/demo-simulation">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Demo
                </Button>
              </Link>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] bg-clip-text text-transparent leading-tight mb-6">
              Live Portfolio Analysis
            </h1>
            <p className="text-xl text-[var(--muted-foreground)] max-w-3xl mx-auto leading-relaxed">
              Real-time analysis with AI-powered insights, stress testing, and personalized recommendations
            </p>
          </div>

          {/* Investor Profile Summary */}
          {(investorData.persona || investorData.scenario) && (
            <div className="mt-12 max-w-5xl mx-auto">
              <Card className="border-2 border-[var(--primary)]/30 bg-gradient-to-br from-[var(--card)] to-[var(--primary)]/5 backdrop-blur-sm shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <User className="h-6 w-6 text-[var(--primary)]" />
                    Analysis Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {investorData.persona && (
                      <div className="space-y-3">
                        <h3 className="font-semibold text-[var(--primary)] flex items-center gap-2">
                          <Brain className="h-4 w-4" />
                          Investor Profile
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-lg">{investorData.persona.name}</span>
                          {investorData.score && (
                            <Badge variant="secondary" className="px-3 py-1">
                              {investorData.score.toFixed(1)}% match
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {investorData.persona.description}
                        </p>
                      </div>
                    )}

                    {investorData.scenario && (
                      <div className="space-y-3">
                        <h3 className="font-semibold text-[var(--secondary)] flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Stress Test Scenario
                        </h3>
                        <div className="font-bold text-lg">{investorData.scenario.name}</div>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {investorData.scenario.description}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Main Analysis Tabs */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                      <div className="text-3xl font-bold text-[var(--primary)]">£1,950,000</div>
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">+12.5% (£217k)</span>
                        <span className="text-[var(--muted-foreground)]">vs last month</span>
                      </div>
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