import { Link } from 'wouter';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Play, Sparkles, Brain, Rocket, Shield, Zap, ArrowRight, Crown, Gift, Target, TrendingUp, Users, Eye, ChevronRight, User, AlertTriangle, PoundSterling, PieChart, Globe, Clock } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import React, { useState, useEffect } from 'react';

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

export default function DemoSimulation() {
  // Parse URL parameters for configuration
  const urlParams = new URLSearchParams(window.location.search);
  const personaId = urlParams.get('persona');
  const personaName = urlParams.get('personaName');
  const selectedScenarioIds = urlParams.get('selectedScenarios')?.split(',').filter(Boolean) || [];
  const personaScenarioIds = urlParams.get('personaScenarios')?.split(',').filter(Boolean) || [];
  const allScenarioIds = urlParams.get('scenarios')?.split(',').filter(Boolean) || [];

  // Portfolio configuration state
  const [portfolioConfig, setPortfolioConfig] = useState({
    totalValue: '',
    stocks: '',
    bonds: '',
    alternatives: '',
    cash: '',
    property: '',
    international: '',
    timeHorizon: ''
  });
  const [configStep, setConfigStep] = useState(0);
  const [showConfiguration, setShowConfiguration] = useState(true);

  // Get scenario details - scenarios are already determined from previous screen
  const allScenarios = allScenarioIds
    .map(id => {
      const scenario = economicScenarios.find(s => s.id === id);
      return scenario ? {
        ...scenario,
        isSelected: selectedScenarioIds.includes(id), // User selected on previous screen
        isHighImpact: personaScenarioIds.includes(id) // Auto-determined by persona
      } : null;
    })
    .filter((scenario): scenario is NonNullable<typeof scenario> => scenario !== null);

  // Save scenarios to localStorage for demo carryover
  useEffect(() => {
    console.log('Checking scenarios for localStorage save:', {
      allScenariosLength: allScenarios.length,
      selectedScenarioIds,
      personaScenarioIds,
      allScenarios: allScenarios.map(s => ({ id: s.id, name: s.name, isSelected: s.isSelected, isHighImpact: s.isHighImpact }))
    });
    
    // Save the first available scenario (selected or high-impact)
    const scenarioToSave = allScenarios.find(s => s.isSelected || s.isHighImpact);
    if (scenarioToSave) {
      const scenarioData = {
        name: scenarioToSave.name,
        description: scenarioToSave.description
      };
      localStorage.setItem('selectedScenario', JSON.stringify(scenarioData));
      console.log('Saved scenario to localStorage:', scenarioData);
    } else if (allScenarios.length > 0) {
      console.log('No scenarios found in:', allScenarios.map(s => ({ name: s.name, isSelected: s.isSelected, isHighImpact: s.isHighImpact })));
    }
  }, [allScenarios, selectedScenarioIds, personaScenarioIds]);

  const portfolioQuestions = [
    {
      id: 'allocation',
      title: 'Portfolio Values',
      question: 'What are the current values of your portfolio holdings?',
      icon: PoundSterling,
      type: 'allocation',
      fields: [
        { key: 'stocks', label: 'Stocks/Equities', placeholder: '200000' },
        { key: 'bonds', label: 'Bonds/Fixed Income', placeholder: '100000' },
        { key: 'alternatives', label: 'Alternatives', placeholder: '100000' },
        { key: 'property', label: 'Property/REITs', placeholder: '50000' },
        { key: 'cash', label: 'Cash/Savings', placeholder: '50000' }
      ]
    },
    {
      id: 'international',
      title: 'Geographic Mix',
      question: 'What percentage is invested internationally?',
      icon: Globe,
      options: [
        { value: '0-25', label: '0-25% International' },
        { value: '25-50', label: '25-50% International' },
        { value: '50-75', label: '50-75% International' },
        { value: '75-100', label: '75-100% International' }
      ]
    },
    {
      id: 'timeHorizon',
      title: 'Investment Timeline',
      question: 'What is your primary investment time horizon?',
      icon: Clock,
      options: [
        { value: '1-3', label: '1-3 years' },
        { value: '3-7', label: '3-7 years' },
        { value: '7-15', label: '7-15 years' },
        { value: '15-plus', label: '15+ years' }
      ]
    }
  ];

  const handleConfigComplete = () => {
    // Store portfolio configuration data
    localStorage.setItem('portfolioConfig', JSON.stringify(portfolioConfig));
    setShowConfiguration(false);
  };

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Calculate portfolio totals and percentages
  const totalValue = Object.values(portfolioConfig).filter((_, i) => i >= 1 && i <= 5).reduce((sum, val) => sum + (parseInt(val as string) || 0), 0);
  const getPercentage = (value: string) => {
    const num = parseInt(value || '0');
    return totalValue > 0 ? ((num / totalValue) * 100).toFixed(1) : '0';
  };

  return (
    <div className="min-h-screen bg-[var(--background)] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-32 left-16 w-40 h-40 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-64 right-24 w-32 h-32 bg-gradient-to-br from-[var(--accent)] to-[var(--warning)] rounded-full blur-xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute bottom-48 left-24 w-28 h-28 bg-gradient-to-br from-[var(--secondary)] to-[var(--primary)] rounded-full blur-lg animate-pulse" style={{animationDelay: '2.5s'}}></div>
      </div>

      <Header />
      
      <main className="flex-1 relative z-10">
        {/* Hero Section */}
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
            <div className="inline-flex items-center px-8 py-4 bg-[var(--card)] border-2 border-[var(--success)] rounded-full shadow-2xl hover:shadow-[var(--success)]/20 transition-all duration-300 group">
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
          </div>
        </div>

      {/* Portfolio Configuration Questionnaire */}
      {showConfiguration && (
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-[var(--foreground)] mb-6">
              PORTFOLIO
              <span className="block bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
                CONFIGURATION
              </span>
            </h2>
            <p className="text-xl text-[var(--muted-foreground)] max-w-3xl mx-auto leading-relaxed">
              Help us understand your portfolio makeup to provide personalized analysis
            </p>
          </div>

          <div className="relative">
            {/* Progress indicator */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-2">
                {portfolioQuestions.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index <= configStep 
                        ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]' 
                        : 'bg-[var(--muted)]'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Question Card */}
            <Card className="relative bg-[var(--card)] border-2 border-[var(--border)] rounded-3xl overflow-hidden group hover:shadow-2xl transition-all duration-500">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]"></div>
              <CardContent className="p-12">
                {configStep < portfolioQuestions.length ? (
                  <div className="space-y-8">
                    <div className="text-center">
                      <div className="inline-block relative mb-6">
                        <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-2xl p-6 shadow-xl">
                          {React.createElement(portfolioQuestions[configStep].icon, {
                            className: "h-16 w-16 text-white"
                          })}
                        </div>
                      </div>
                      
                      <h3 className="text-3xl font-black text-[var(--foreground)] mb-4">
                        {portfolioQuestions[configStep].title}
                      </h3>
                      <p className="text-xl text-[var(--muted-foreground)] mb-8">
                        {portfolioQuestions[configStep].question}
                      </p>
                    </div>

                    {portfolioQuestions[configStep].type === 'allocation' ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {portfolioQuestions[configStep].fields?.map((field) => (
                            <div key={field.key} className="space-y-2">
                              <label className="font-semibold text-[var(--foreground)]">
                                {field.label}
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--muted-foreground)] text-lg">
                                  £
                                </span>
                                <input
                                  type="number"
                                  placeholder={field.placeholder}
                                  className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none transition-colors"
                                  value={portfolioConfig[field.key as keyof typeof portfolioConfig]}
                                  onChange={(e) => setPortfolioConfig(prev => ({
                                    ...prev,
                                    [field.key]: e.target.value
                                  }))}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Load Demo Data Button */}
                        <div className="text-center mt-6">
                          <Button
                            variant="outline"
                            onClick={() => {
                              const demoData = {
                                totalValue: '',
                                stocks: '200000',
                                bonds: '100000',
                                alternatives: '100000',
                                property: '50000',
                                cash: '50000',
                                international: '',
                                timeHorizon: ''
                              };
                              setPortfolioConfig(prev => ({
                                ...prev,
                                ...demoData
                              }));
                              // Save demo data to localStorage immediately
                              localStorage.setItem('portfolioConfig', JSON.stringify(demoData));
                              console.log('Demo portfolio data saved to localStorage:', demoData);
                            }}
                            className="mb-4 px-6 py-2 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 border-[var(--primary)] hover:from-[var(--primary)]/20 hover:to-[var(--secondary)]/20 transition-all duration-300"
                          >
                            <Gift className="h-4 w-4 mr-2" />
                            Load Demo Data
                          </Button>
                        </div>
                        
                        <div className="text-center mt-4">
                          <p className="text-lg font-semibold text-[var(--foreground)]">
                            Total Portfolio Value: £{Object.values(portfolioConfig).filter((_, i) => i >= 1 && i <= 5).reduce((sum, val) => sum + (parseInt(val as string) || 0), 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {portfolioQuestions[configStep].options?.map((option) => (
                          <Button
                            key={option.value}
                            variant="outline"
                            className={`h-auto p-6 text-left justify-start transition-all duration-300 hover:scale-105 ${
                              portfolioConfig[portfolioQuestions[configStep].id as keyof typeof portfolioConfig] === option.value
                                ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                                : 'border-[var(--border)] hover:border-[var(--primary)]'
                            }`}
                            onClick={() => setPortfolioConfig(prev => ({
                              ...prev,
                              [portfolioQuestions[configStep].id]: option.value
                            }))}
                          >
                            <div>
                              <div className="font-bold text-lg mb-1">{option.label}</div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between pt-8">
                      <Button
                        variant="outline"
                        onClick={() => setConfigStep(Math.max(0, configStep - 1))}
                        disabled={configStep === 0}
                        className="px-8 py-3"
                      >
                        Previous
                      </Button>
                      
                      <Button
                        onClick={() => {
                          if (configStep < portfolioQuestions.length - 1) {
                            setConfigStep(configStep + 1);
                          } else {
                            handleConfigComplete();
                          }
                        }}
                        className="px-8 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] hover:from-[var(--primary)]/90 hover:to-[var(--secondary)]/90"
                      >
                        {configStep < portfolioQuestions.length - 1 ? 'Next' : 'Complete Configuration'}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Combined Portfolio & Simulation Configuration */}
      {((!showConfiguration && (portfolioConfig.stocks || portfolioConfig.bonds || portfolioConfig.alternatives || portfolioConfig.property || portfolioConfig.cash)) || (personaName || allScenarios.length > 0)) ? (
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-[var(--foreground)] mb-6">
              CONFIGURATION
              <span className="block bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
                SUMMARY
              </span>
            </h2>
            <p className="text-xl text-[var(--muted-foreground)] max-w-3xl mx-auto leading-relaxed">
              Portfolio setup and simulation parameters configured for personalized analysis
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Portfolio Configuration */}
            {true && (
              <Card className="relative bg-[var(--card)] border-2 border-[var(--border)] rounded-3xl overflow-hidden group hover:shadow-2xl transition-all duration-500">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]"></div>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {/* Total Value */}
                    <div className="text-center">
                      <div className="inline-block relative mb-4">
                        <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-2xl p-4 shadow-xl">
                          <PoundSterling className="h-12 w-12 text-white" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-black text-[var(--foreground)] mb-2">
                        PORTFOLIO VALUE
                      </h3>
                      <p className="text-4xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
                        £{totalValue.toLocaleString()}
                      </p>
                    </div>

                    {/* Pie Chart */}
                    <div className="h-64">
                      {totalValue > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={[
                                { name: 'Stocks/Equities', value: parseInt(portfolioConfig.stocks || '0'), color: '#3b82f6' },
                                { name: 'Bonds/Fixed Income', value: parseInt(portfolioConfig.bonds || '0'), color: '#10b981' },
                                { name: 'Alternatives', value: parseInt(portfolioConfig.alternatives || '0'), color: '#8b5cf6' },
                                { name: 'Property/REITs', value: parseInt(portfolioConfig.property || '0'), color: '#f97316' },
                                { name: 'Cash/Savings', value: parseInt(portfolioConfig.cash || '0'), color: '#6b7280' }
                              ].filter(item => item.value > 0)}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={80}
                              dataKey="value"
                              stroke="none"
                            >
                              {[
                                { name: 'Stocks/Equities', value: parseInt(portfolioConfig.stocks || '0'), color: '#3b82f6' },
                                { name: 'Bonds/Fixed Income', value: parseInt(portfolioConfig.bonds || '0'), color: '#10b981' },
                                { name: 'Alternatives', value: parseInt(portfolioConfig.alternatives || '0'), color: '#8b5cf6' },
                                { name: 'Property/REITs', value: parseInt(portfolioConfig.property || '0'), color: '#f97316' },
                                { name: 'Cash/Savings', value: parseInt(portfolioConfig.cash || '0'), color: '#6b7280' }
                              ].filter(item => item.value > 0).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value: number) => [`£${value.toLocaleString()}`, 'Value']}
                              labelStyle={{ color: 'var(--foreground)' }}
                              contentStyle={{ 
                                backgroundColor: 'var(--background)', 
                                border: '1px solid var(--border)',
                                borderRadius: '8px'
                              }}
                            />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <div className="w-32 h-32 mx-auto rounded-full border-4 border-dashed border-[var(--muted-foreground)]/30 flex items-center justify-center mb-4">
                              <div className="text-[var(--muted-foreground)]/50 text-sm font-medium">
                                Chart will<br />appear here
                              </div>
                            </div>
                            <p className="text-sm text-[var(--muted-foreground)] max-w-xs">
                              Complete portfolio configuration above to see allocation visualization
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Asset Breakdown */}
                    <div className="space-y-3">
                      <h4 className="text-lg font-black text-[var(--foreground)] text-center">
                        ASSET ALLOCATION
                      </h4>
                      
                      {totalValue > 0 ? (
                        [
                          { key: 'stocks', label: 'Stocks/Equities', color: '#3b82f6' },
                          { key: 'bonds', label: 'Bonds/Fixed Income', color: '#10b981' },
                          { key: 'alternatives', label: 'Alternatives', color: '#8b5cf6' },
                          { key: 'property', label: 'Property/REITs', color: '#f97316' },
                          { key: 'cash', label: 'Cash/Savings', color: '#6b7280' }
                        ].map((asset) => {
                          const value = parseInt(portfolioConfig[asset.key as keyof typeof portfolioConfig] || '0');
                          const percentage = getPercentage(portfolioConfig[asset.key as keyof typeof portfolioConfig]);
                          
                          return value > 0 ? (
                            <div key={asset.key} className="flex justify-between items-center p-3 bg-[var(--muted)] rounded-xl">
                              <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full" style={{backgroundColor: asset.color}}></div>
                                <span className="font-semibold text-[var(--foreground)] text-sm">{asset.label}</span>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-[var(--foreground)] text-sm">£{value.toLocaleString()}</div>
                                <div className="text-xs text-[var(--muted-foreground)]">{percentage}%</div>
                              </div>
                            </div>
                          ) : null;
                        })
                      ) : (
                        <div className="space-y-3">
                          {[
                            { label: 'Stocks/Equities', color: '#3b82f6' },
                            { label: 'Bonds/Fixed Income', color: '#10b981' },
                            { label: 'Alternatives', color: '#8b5cf6' },
                            { label: 'Property/REITs', color: '#f97316' },
                            { label: 'Cash/Savings', color: '#6b7280' }
                          ].map((asset, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-[var(--muted)]/50 rounded-xl border-2 border-dashed border-[var(--muted-foreground)]/20">
                              <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full border-2 border-dashed" style={{borderColor: asset.color + '50'}}></div>
                                <span className="font-semibold text-[var(--muted-foreground)] text-sm">{asset.label}</span>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-[var(--muted-foreground)] text-sm">£0</div>
                                <div className="text-xs text-[var(--muted-foreground)]">0%</div>
                              </div>
                            </div>
                          ))}
                          <div className="text-center pt-4">
                            <p className="text-sm text-[var(--muted-foreground)]">
                              Asset values will appear here after configuration
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Additional Info */}
                    {(portfolioConfig.international || portfolioConfig.timeHorizon) && (
                      <div className="pt-4 border-t border-[var(--border)]">
                        <div className="grid grid-cols-1 gap-3">
                          {portfolioConfig.international && (
                            <div className="bg-[var(--muted)] rounded-xl p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Globe className="h-4 w-4 text-[var(--primary)]" />
                                <span className="font-semibold text-[var(--foreground)] text-sm">International</span>
                              </div>
                              <p className="text-sm text-[var(--muted-foreground)]">{portfolioConfig.international}</p>
                            </div>
                          )}
                          
                          {portfolioConfig.timeHorizon && (
                            <div className="bg-[var(--muted)] rounded-xl p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Clock className="h-4 w-4 text-[var(--primary)]" />
                                <span className="font-semibold text-[var(--foreground)] text-sm">Timeline</span>
                              </div>
                              <p className="text-sm text-[var(--muted-foreground)]">{portfolioConfig.timeHorizon}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Right Side - Simulation Configuration */}
            {(personaName || allScenarios.length > 0) && (
              <div className="space-y-6">
                {/* Active Persona */}
                {personaName && (
                  <Card className="relative bg-[var(--card)] border-2 border-[var(--border)] rounded-3xl overflow-hidden group hover:shadow-2xl transition-all duration-500">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]"></div>
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <div className="inline-block relative mb-4">
                          <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-2xl p-4 shadow-xl">
                            <User className="h-10 w-10 text-white" />
                          </div>
                        </div>
                        <h3 className="text-xl font-black text-[var(--foreground)] mb-2">
                          ACTIVE PERSONA
                        </h3>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20 rounded-2xl p-4 border border-green-200/50 dark:border-green-800/30">
                        <div className="flex items-center justify-between mb-3">
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 font-bold">
                            Live Profile
                          </Badge>
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                        <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">
                          {decodeURIComponent(personaName)}
                        </h4>
                        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-3">
                          Active modeling of portfolio behavior and risk responses according to this investor archetype.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="border-green-300 text-green-700 dark:border-green-600 dark:text-green-300 text-xs">
                            Live Analysis
                          </Badge>
                          <Badge variant="outline" className="border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-300 text-xs">
                            Risk Modeling
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Stress Testing */}
                {allScenarios.length > 0 && (
                  <Card className="relative bg-[var(--card)] border-2 border-[var(--border)] rounded-3xl overflow-hidden group hover:shadow-2xl transition-all duration-500">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--warning)] to-[var(--destructive)]"></div>
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <div className="inline-block relative mb-4">
                          <div className="bg-gradient-to-br from-[var(--warning)] to-[var(--destructive)] rounded-2xl p-4 shadow-xl">
                            <AlertTriangle className="h-10 w-10 text-white" />
                          </div>
                        </div>
                        <h3 className="text-xl font-black text-[var(--foreground)] mb-2">
                          STRESS TESTING
                        </h3>
                        <Badge className="bg-gradient-to-r from-[var(--warning)] to-[var(--destructive)] text-white border-0 font-bold">
                          {allScenarios.length} Active Scenarios
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        {allScenarios.map((scenario) => {
                          const IconComponent = scenario.icon;
                          return (
                            <div 
                              key={scenario.id} 
                              className={`bg-gradient-to-br rounded-xl p-4 border transition-all duration-300 ${
                                scenario.isSelected 
                                  ? 'from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 border-blue-300 dark:border-blue-600 shadow-lg' 
                                  : scenario.isHighImpact
                                  ? 'from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/20 border-red-300 dark:border-red-600 shadow-md'
                                  : 'from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/20 border-orange-200/50 dark:border-orange-800/30'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="bg-gradient-to-br from-[var(--warning)] to-[var(--destructive)] rounded-lg p-2">
                                    <IconComponent className="h-4 w-4 text-white" />
                                  </div>
                                  <Badge className={`text-xs font-bold ${
                                    scenario.isSelected 
                                      ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-600'
                                      : scenario.isHighImpact
                                      ? 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-600'
                                      : 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-600'
                                  }`}>
                                    {scenario.isSelected ? 'User Selected' : scenario.isHighImpact ? 'High Impact' : 'Applicable'}
                                  </Badge>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {scenario.horizon}
                                </Badge>
                              </div>
                              <h5 className="font-bold text-[var(--foreground)] text-sm mb-2">
                                {scenario.name}
                              </h5>
                              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mb-3">
                                {scenario.description}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-[var(--success)] font-medium">
                                <div className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse"></div>
                                <span>Stress testing active</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      ) : null}


        {/* Main Demo Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          
          {/* Demo Instructions */}
          <div className="text-center mb-20 relative">
            <div className="bg-gradient-to-br from-[var(--card)] to-[var(--muted)] border border-[var(--border)] rounded-2xl p-8 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-[var(--foreground)] mb-4">Ready to Proceed</h3>
              <p className="text-[var(--muted-foreground)] mb-6">
                Click below to begin your personalized portfolio analysis using the configuration settings from your investor profile.
              </p>
              
              <div 
                className="inline-block relative bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-[var(--primary)]/30 transition-all duration-300 group-hover:scale-105 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  
                  // Save scenarios to localStorage before navigation
                  const availableScenarios = allScenarios.filter(s => s.isSelected || s.isHighImpact);
                  console.log('Saving scenarios before navigation:', availableScenarios);
                  
                  if (availableScenarios.length > 0) {
                    // Save first available scenario
                    const scenarioToSave = {
                      name: availableScenarios[0].name,
                      description: availableScenarios[0].description
                    };
                    localStorage.setItem('selectedScenario', JSON.stringify(scenarioToSave));
                    console.log('Saved scenario to localStorage:', scenarioToSave);
                  }
                  
                  // Navigate to analysis page
                  window.location.href = '/demo-portfolio-analysis';
                }}
              >
                <div className="flex items-center gap-3">
                  <Rocket className="h-6 w-6" />
                  <span>Start Portfolio Analysis</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
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