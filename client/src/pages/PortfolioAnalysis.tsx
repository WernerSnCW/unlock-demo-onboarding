import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { TrendingUp, TrendingDown, PieChart, BarChart3, Zap, AlertTriangle, Lightbulb, DollarSign, Activity, Globe, Shield, RefreshCw, ArrowUpRight, ArrowDownRight, Eye, Brain, Home, Building, Briefcase, Plus, Minus, Loader, Sparkles, Target, Award, TrendingUpDown, CheckCircle, User, Settings, BarChart2 } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress as UIProgress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';

export default function PortfolioAnalysis() {
  const [activeTab, setActiveTab] = useState('configuration');
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysis, setAnalysis] = useState<any>(null);
  const [liveData, setLiveData] = useState<any>({});
  const [portfolioData, setPortfolioData] = useState<any>(null);
  
  // Demo configuration data from previous steps
  const [demoConfig, setDemoConfig] = useState<any>(null);

  // Load demo configuration data from localStorage
  useEffect(() => {
    const demoConfigStr = localStorage.getItem('demoConfigData');
    if (demoConfigStr) {
      try {
        const config = JSON.parse(demoConfigStr);
        setDemoConfig(config);
        console.log('Loaded demo configuration:', config);
      } catch (error) {
        console.error('Error parsing demo configuration:', error);
      }
    }
  }, []);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Calculate portfolio summary data
  const getPortfolioSummary = () => {
    if (!demoConfig?.portfolioConfig) return null;
    
    const config = demoConfig.portfolioConfig;
    const total = (config.stocks || 0) + (config.bonds || 0) + (config.alternatives || 0) + (config.property || 0) + (config.cash || 0);
    
    return {
      total,
      breakdown: [
        { name: 'Stocks', value: config.stocks || 0, percentage: total > 0 ? ((config.stocks || 0) / total * 100).toFixed(1) : '0', color: '#3B82F6' },
        { name: 'Bonds', value: config.bonds || 0, percentage: total > 0 ? ((config.bonds || 0) / total * 100).toFixed(1) : '0', color: '#10B981' },
        { name: 'Alternatives', value: config.alternatives || 0, percentage: total > 0 ? ((config.alternatives || 0) / total * 100).toFixed(1) : '0', color: '#F59E0B' },
        { name: 'Property', value: config.property || 0, percentage: total > 0 ? ((config.property || 0) / total * 100).toFixed(1) : '0', color: '#8B5CF6' },
        { name: 'Cash', value: config.cash || 0, percentage: total > 0 ? ((config.cash || 0) / total * 100).toFixed(1) : '0', color: '#6B7280' }
      ].filter(item => item.value > 0)
    };
  };

  const portfolioSummary = getPortfolioSummary();

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      
      {/* Stunning Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 -left-32 w-96 h-96 rounded-full opacity-30 animate-pulse bg-gradient-to-r from-[var(--primary)]/20 to-transparent" 
               style={{ animationDuration: '4s' }}></div>
          <div className="absolute top-60 -right-32 w-80 h-80 rounded-full opacity-25 animate-pulse bg-gradient-to-r from-[var(--secondary)]/20 to-transparent" 
               style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
          <div className="absolute -bottom-20 left-1/2 w-72 h-72 rounded-full opacity-20 animate-pulse bg-gradient-to-r from-[var(--accent)]/20 to-transparent" 
               style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
        </div>
      </div>

      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Hero Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-6 mb-8 p-6 rounded-3xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] shadow-2xl">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <BarChart2 className="h-12 w-12 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-4xl md:text-6xl font-black text-white mb-2">
                  Portfolio Analysis
                </h1>
                <p className="text-lg md:text-2xl text-white/90 font-medium">
                  Live Market Data • AI-Powered Insights • Real-Time Analytics
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <span className="text-white font-bold">LIVE</span>
              </div>
            </div>
          </div>

          {/* Tabbed Interface */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-[var(--muted)] p-2 rounded-2xl">
              <TabsTrigger 
                value="configuration" 
                className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-[var(--background)] data-[state=active]:text-[var(--foreground)] data-[state=active]:shadow-sm rounded-xl py-3"
                data-testid="tab-configuration"
              >
                <CheckCircle className="h-4 w-4" />
                Configuration Summary
              </TabsTrigger>
              <TabsTrigger 
                value="questions" 
                className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-[var(--background)] data-[state=active]:text-[var(--foreground)] data-[state=active]:shadow-sm rounded-xl py-3"
                data-testid="tab-questions"
              >
                <Target className="h-4 w-4" />
                Additional Questions
              </TabsTrigger>
              <TabsTrigger 
                value="analysis" 
                className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-[var(--background)] data-[state=active]:text-[var(--foreground)] data-[state=active]:shadow-sm rounded-xl py-3"
                data-testid="tab-analysis"
              >
                <TrendingUp className="h-4 w-4" />
                Analysis Results
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Configuration Summary */}
            <TabsContent value="configuration" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-[var(--foreground)] mb-4">
                  Your Configuration Summary
                </h2>
                <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
                  Review the portfolio allocation, investor persona, and economic scenarios from your profile setup
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Portfolio Allocation Summary */}
                <Card className="border-2 border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] backdrop-blur-sm shadow-2xl transition-all duration-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <PieChart className="h-6 w-6 text-[var(--primary)]" />
                      Portfolio Allocation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {portfolioSummary ? (
                      <div className="space-y-6">
                        {/* Total Value */}
                        <div className="text-center p-6 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 rounded-2xl">
                          <div className="text-3xl font-bold text-[var(--foreground)] mb-2">
                            £{portfolioSummary.total.toLocaleString()}
                          </div>
                          <div className="text-sm text-[var(--muted-foreground)]">
                            Total Portfolio Value
                          </div>
                        </div>

                        {/* Pie Chart */}
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={portfolioSummary.breakdown}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percentage }) => `${name}: ${percentage}%`}
                              >
                                {portfolioSummary.breakdown.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value: any) => [`£${value.toLocaleString()}`, 'Value']} />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Breakdown List */}
                        <div className="space-y-3">
                          {portfolioSummary.breakdown.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-[var(--muted)]/50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-4 h-4 rounded-full" 
                                  style={{ backgroundColor: item.color }}
                                ></div>
                                <span className="font-medium">{item.name}</span>
                              </div>
                              <div className="text-right">
                                <div className="font-bold">£{item.value.toLocaleString()}</div>
                                <div className="text-sm text-[var(--muted-foreground)]">{item.percentage}%</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-[var(--muted-foreground)]">
                        <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No portfolio configuration found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Persona & Scenarios Summary */}
                <div className="space-y-6">
                  
                  {/* Active Persona */}
                  {demoConfig?.persona?.name && (
                    <Card className="border-2 border-[var(--border)] hover:border-[var(--secondary)] bg-[var(--card)] backdrop-blur-sm shadow-2xl transition-all duration-500">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl">
                          <User className="h-6 w-6 text-[var(--secondary)]" />
                          Active Investor Persona
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center p-6 bg-gradient-to-r from-[var(--secondary)]/10 to-[var(--accent)]/10 rounded-2xl">
                          <div className="w-16 h-16 bg-gradient-to-r from-[var(--secondary)] to-[var(--accent)] rounded-full mx-auto mb-4 flex items-center justify-center">
                            <User className="h-8 w-8 text-white" />
                          </div>
                          <div className="text-xl font-bold text-[var(--foreground)] mb-2">
                            {demoConfig.persona.name}
                          </div>
                          <Badge className="bg-[var(--secondary)]/20 text-[var(--secondary)] border-[var(--secondary)]/30">
                            Classification Applied
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Economic Scenarios */}
                  {demoConfig?.scenarios?.all?.length > 0 && (
                    <Card className="border-2 border-[var(--border)] hover:border-[var(--accent)] bg-[var(--card)] backdrop-blur-sm shadow-2xl transition-all duration-500">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl">
                          <TrendingUpDown className="h-6 w-6 text-[var(--accent)]" />
                          Economic Scenarios
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {demoConfig.scenarios.all.map((scenario: any, index: number) => (
                            <div key={index} className="p-4 bg-[var(--muted)]/50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-bold text-[var(--foreground)]">
                                  {scenario.name}
                                </h5>
                                <Badge className={`text-xs ${
                                  scenario.isSelected 
                                    ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300'
                                    : 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/50 dark:text-orange-300'
                                }`}>
                                  {scenario.isSelected ? 'Selected' : 'Applicable'}
                                </Badge>
                              </div>
                              <p className="text-sm text-[var(--muted-foreground)] mb-2">
                                {scenario.description}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-[var(--success)] font-medium">
                                <div className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse"></div>
                                <span>Stress testing active</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Additional Questions */}
            <TabsContent value="questions" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-[var(--foreground)] mb-4">
                  Additional Analysis Questions
                </h2>
                <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
                  Help us refine your portfolio analysis with these additional insights
                </p>
              </div>

              <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Investment Timeline Question */}
                <Card className="border-2 border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] backdrop-blur-sm shadow-2xl transition-all duration-500">
                  <CardHeader>
                    <CardTitle className="text-xl">Investment Timeline & Goals</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-[var(--muted-foreground)]">
                      What is your primary investment timeline for this portfolio?
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: 'Short-term (1-3 years)', desc: 'Near-term goals or liquidity needs' },
                        { label: 'Medium-term (3-10 years)', desc: 'Major purchases or life events' },
                        { label: 'Long-term (10+ years)', desc: 'Retirement or wealth building' },
                        { label: 'Mixed timeline', desc: 'Multiple goals with different horizons' }
                      ].map((option, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="h-auto p-4 text-left justify-start hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]"
                          data-testid={`option-timeline-${index}`}
                        >
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-[var(--muted-foreground)]">{option.desc}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Risk Capacity Question */}
                <Card className="border-2 border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] backdrop-blur-sm shadow-2xl transition-all duration-500">
                  <CardHeader>
                    <CardTitle className="text-xl">Risk Capacity Assessment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-[var(--muted-foreground)]">
                      How would you handle a 20% portfolio decline during a market downturn?
                    </p>
                    <div className="space-y-3">
                      {[
                        'I would panic and sell everything immediately',
                        'I would be very concerned and consider reducing risk',
                        'I would be uncomfortable but likely hold steady',
                        'I would stay calm and continue with my plan',
                        'I would see it as a buying opportunity'
                      ].map((option, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="w-full text-left justify-start hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]"
                          data-testid={`option-risk-${index}`}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Income & Liquidity Question */}
                <Card className="border-2 border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] backdrop-blur-sm shadow-2xl transition-all duration-500">
                  <CardHeader>
                    <CardTitle className="text-xl">Income & Liquidity Needs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-[var(--muted-foreground)]">
                      Do you require regular income from your investments?
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { label: 'No income needed', desc: 'Focus on growth' },
                        { label: 'Some income preferred', desc: 'Balanced approach' },
                        { label: 'Income essential', desc: 'Dividend/yield focus' }
                      ].map((option, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="h-auto p-4 text-center hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]"
                          data-testid={`option-income-${index}`}
                        >
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-[var(--muted-foreground)]">{option.desc}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Progress to Analysis */}
                <div className="text-center pt-8">
                  <Button
                    onClick={() => setActiveTab('analysis')}
                    className="px-8 py-4 text-lg bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-2xl shadow-2xl hover:shadow-[var(--primary)]/30 transition-all duration-300"
                    data-testid="button-proceed-analysis"
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    Proceed to Analysis
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Tab 3: Analysis Results */}
            <TabsContent value="analysis" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-[var(--foreground)] mb-4">
                  Portfolio Analysis Results
                </h2>
                <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
                  Comprehensive analysis based on your configuration and responses
                </p>
              </div>

              {/* Analysis placeholder - this would contain the existing analysis functionality */}
              <div className="max-w-6xl mx-auto">
                <Card className="border-2 border-[var(--border)] bg-[var(--card)] backdrop-blur-sm shadow-2xl">
                  <CardContent className="p-12 text-center">
                    <div className="space-y-6">
                      <div className="w-20 h-20 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full mx-auto flex items-center justify-center">
                        <TrendingUp className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-[var(--foreground)]">
                        Analysis Engine Starting...
                      </h3>
                      <p className="text-[var(--muted-foreground)] max-w-md mx-auto">
                        Your portfolio analysis will appear here, incorporating all your configuration data, persona insights, and economic scenario modeling.
                      </p>
                      <div className="flex items-center justify-center gap-2 text-[var(--primary)]">
                        <Loader className="h-5 w-5 animate-spin" />
                        <span className="font-medium">Processing market data...</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Navigation */}
          <div className="flex justify-center gap-6 mt-16 mb-8">
            <Link href="/demo/simulation">
              <Button 
                className="px-8 py-4 text-lg rounded-2xl bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--muted)]/80 shadow-lg" 
                data-testid="button-back-simulation"
              >
                <ArrowUpRight className="h-5 w-5 rotate-180 mr-2" />
                Back to Configuration
              </Button>
            </Link>
            <Link href="/investor-preferences">
              <Button 
                className="px-8 py-4 text-lg rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white shadow-2xl hover:shadow-[var(--primary)]/30 transition-all duration-300"
                data-testid="button-continue-onboarding"
              >
                <Zap className="h-5 w-5 mr-2" />
                Continue Demo Flow
              </Button>
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}