// Portfolio display component for Base and Persona-Adjusted allocations
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Shield, PieChart, AlertTriangle, Brain, Loader2, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ASSET_NAMES } from '../data/scenarioDefaults';
import type { Allocation } from '../utils/personaRules';

interface PortfolioDisplayProps {
  baseAllocation: Allocation;
  personaAdjustedAllocation: Allocation;
  scenarioName: string;
  personaName: string;
  explanations: {
    scenarioReason: string;
    personaRulesApplied: string[];
  };
}

// Chart colors for vibrant, professional financial visualization
const CHART_COLORS = [
  '#0891b2', // Vibrant cyan (primary equivalent)
  '#06b6d4', // Bright cyan 
  '#3b82f6', // Bright blue
  '#8b5cf6', // Purple
  '#10b981', // Emerald green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#f97316', // Orange
  '#84cc16', // Lime green
  '#ec4899', // Pink
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#a855f7', // Violet
  '#22c55e', // Green
  '#eab308'  // Yellow
];

export function PortfolioDisplay({ 
  baseAllocation, 
  personaAdjustedAllocation, 
  scenarioName,
  personaName,
  explanations 
}: PortfolioDisplayProps) {
  const [interpretation, setInterpretation] = useState<string>('');
  const [isLoadingInterpretation, setIsLoadingInterpretation] = useState(false);

  useEffect(() => {
    generateInterpretation();
  }, [baseAllocation, personaAdjustedAllocation, scenarioName, personaName]);

  const generateInterpretation = async () => {
    setIsLoadingInterpretation(true);
    try {
      const response = await fetch('/api/portfolio-interpretation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personaName: personaName,
          baseAllocation,
          personaAdjustedAllocation,
          rulesApplied: explanations.personaRulesApplied
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setInterpretation(data.interpretation);
      }
    } catch (error) {
      console.error('Failed to generate interpretation:', error);
    } finally {
      setIsLoadingInterpretation(false);
    }
  };

  // Prepare chart data
  const prepareChartData = (allocation: Allocation) => {
    return Object.entries(allocation)
      .filter(([_, value]) => value > 0.005)
      .sort(([,a], [,b]) => b - a)
      .map(([asset, weight], index) => ({
        name: ASSET_NAMES[asset] || asset,
        value: Number((weight * 100).toFixed(1)),
        fill: CHART_COLORS[index % CHART_COLORS.length]
      }));
  };

  // Calculate differences for comparison table
  const calculateDifferences = () => {
    const allAssets = new Set([
      ...Object.keys(baseAllocation),
      ...Object.keys(personaAdjustedAllocation)
    ]);

    return Array.from(allAssets)
      .map(asset => {
        const base = (baseAllocation[asset] || 0) * 100;
        const adjusted = (personaAdjustedAllocation[asset] || 0) * 100;
        const difference = adjusted - base;
        
        return {
          asset: ASSET_NAMES[asset] || asset,
          base: Number(base.toFixed(1)),
          adjusted: Number(adjusted.toFixed(1)),
          difference: Number(difference.toFixed(1))
        };
      })
      .filter(item => item.base > 0.5 || item.adjusted > 0.5 || Math.abs(item.difference) > 0.1)
      .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
  };

  const baseChartData = prepareChartData(baseAllocation);
  const adjustedChartData = prepareChartData(personaAdjustedAllocation);
  const comparisonData = calculateDifferences();

  return (
    <div className="space-y-6">
      {/* Enhanced Scenario Banner */}
      <Card className="border-[var(--primary)] bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/5 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-[var(--primary)]/20">
                <TrendingUp className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div>
                <CardTitle className="text-xl text-[var(--foreground)] mb-1">
                  Portfolio Recommendations
                </CardTitle>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {explanations.scenarioReason}
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="text-sm">
                {personaName}
              </Badge>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Economic scenario: {scenarioName}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Portfolio Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Base Allocation Chart */}
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
              <Shield className="h-4 w-4 text-[var(--muted-foreground)]" />
              Base Scenario Mix
            </CardTitle>
            <p className="text-sm text-[var(--muted-foreground)]">
              Pure economic scenario allocation
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={baseChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {baseChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Allocation']} />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Persona-Adjusted Chart */}
        <Card className="shadow-md border-[var(--accent)]/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
              <PieChart className="h-4 w-4 text-[var(--accent)]" />
              Your Personalised Mix
            </CardTitle>
            <p className="text-sm text-[var(--muted-foreground)]">
              Adjusted for your persona preferences
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={adjustedChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {adjustedChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Allocation']} />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Table */}
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[var(--accent)]" />
            What Changed?
          </CardTitle>
          <p className="text-sm text-[var(--muted-foreground)]">
            Key differences between base scenario and your personalised mix
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-2 px-1 font-medium text-[var(--foreground)]">Asset Class</th>
                  <th className="text-right py-2 px-1 font-medium text-[var(--muted-foreground)]">Base</th>
                  <th className="text-right py-2 px-1 font-medium text-[var(--accent)]">Your Mix</th>
                  <th className="text-right py-2 px-1 font-medium text-[var(--foreground)]">Change</th>
                </tr>
              </thead>
              <tbody className="space-y-1">
                {comparisonData.map((item, index) => (
                  <tr key={index} className="border-b border-[var(--border)]/50 hover:bg-[var(--muted)]/20 transition-colors">
                    <td className="py-3 px-1 font-medium text-[var(--foreground)]">
                      {item.asset}
                    </td>
                    <td className="text-right py-3 px-1 text-[var(--muted-foreground)]">
                      {item.base}%
                    </td>
                    <td className="text-right py-3 px-1 font-medium text-[var(--accent)]">
                      {item.adjusted}%
                    </td>
                    <td className="text-right py-3 px-1">
                      <div className="flex items-center justify-end gap-1">
                        {item.difference > 0.1 ? (
                          <ArrowUp className="h-3 w-3 text-green-500" />
                        ) : item.difference < -0.1 ? (
                          <ArrowDown className="h-3 w-3 text-red-500" />
                        ) : (
                          <Minus className="h-3 w-3 text-[var(--muted-foreground)]" />
                        )}
                        <span className={`font-medium ${
                          item.difference > 0.1 ? 'text-green-600' :
                          item.difference < -0.1 ? 'text-red-600' : 
                          'text-[var(--muted-foreground)]'
                        }`}>
                          {item.difference > 0 ? '+' : ''}{item.difference}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Why This Mix - Enhanced */}
      <Card className="border border-[var(--accent)]/30 bg-gradient-to-r from-[var(--accent)]/5 to-[var(--secondary)]/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
            <Shield className="h-5 w-5 text-[var(--accent)]" />
            Why These Changes?
          </CardTitle>
          <p className="text-sm text-[var(--muted-foreground)]">
            Persona-driven adjustments to the base scenario
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-[var(--foreground)] text-sm flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Scenario Tilt
              </h4>
              <p className="text-sm text-[var(--muted-foreground)] pl-4">
                {getScenarioTiltExplanation(scenarioName)}
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-[var(--foreground)] text-sm flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Persona Guardrails
              </h4>
              <ul className="space-y-1 pl-4">
                {explanations.personaRulesApplied.slice(0, 3).map((rule, index) => (
                  <li key={index} className="text-sm text-[var(--muted-foreground)] flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full flex-shrink-0 mt-2" />
                    {rule}
                  </li>
                ))}
                {explanations.personaRulesApplied.length > 3 && (
                  <li className="text-xs text-[var(--muted-foreground)] pl-3.5 italic">
                    +{explanations.personaRulesApplied.length - 3} more adjustments
                  </li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced AI Interpretation */}
      <Card className="shadow-xl border-[var(--primary)]/30 bg-gradient-to-br from-[var(--primary)]/5 via-[var(--secondary)]/5 to-[var(--accent)]/5">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-[var(--primary)]/20">
                <Brain className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div>
                <CardTitle className="text-[var(--foreground)] text-lg">
                  AI Portfolio Analysis
                </CardTitle>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Personalized insights and expectations
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              GPT-4 Powered
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingInterpretation ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="p-3 rounded-full bg-[var(--primary)]/10 animate-pulse">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" />
              </div>
              <div className="text-center">
                <p className="text-[var(--foreground)] font-medium">AI is analyzing your portfolio...</p>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  Generating personalized insights based on your preferences
                </p>
              </div>
            </div>
          ) : interpretation ? (
            <div className="bg-white/60 dark:bg-black/20 rounded-lg p-6 border border-[var(--border)]/50">
              <div className="space-y-6">
                {(() => {
                  try {
                    const parsed = JSON.parse(interpretation);
                    
                    return (
                      <>
                        {/* Overview */}
                        <div className="text-sm text-[var(--foreground)] leading-relaxed font-medium">
                          {parsed.overview}
                        </div>

                        {/* Why this suits you */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-[var(--primary)] flex items-center gap-2 text-sm">
                            <Shield className="h-4 w-4" />
                            Why this suits you
                          </h4>
                          <div className="space-y-2 ml-2">
                            {parsed.suitability?.map((item: string, index: number) => (
                              <div key={index} className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-2 flex-shrink-0"></div>
                                <p className="text-sm text-[var(--foreground)] leading-relaxed">
                                  {item}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* What to expect */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-[var(--accent)] flex items-center gap-2 text-sm">
                            <TrendingUp className="h-4 w-4" />
                            What to expect
                          </h4>
                          <div className="space-y-2 ml-2">
                            <div className="flex items-start gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-2 flex-shrink-0"></div>
                              <p className="text-sm text-[var(--foreground)] leading-relaxed">
                                <span className="font-medium text-green-600">Strengths:</span> {parsed.expectations?.strengths}
                              </p>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-2 flex-shrink-0"></div>
                              <p className="text-sm text-[var(--foreground)] leading-relaxed">
                                <span className="font-medium text-amber-600">Watch for:</span> {parsed.expectations?.considerations}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Consider */}
                        {parsed.advice && (
                          <div className="p-3 bg-[var(--muted)]/20 rounded-md border-l-3 border-[var(--secondary)]">
                            <div className="flex items-start gap-2">
                              <Brain className="h-4 w-4 text-[var(--secondary)] mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-[var(--foreground)] font-medium">
                                {parsed.advice}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Disclaimer */}
                        <div className="pt-4 border-t border-[var(--border)]/30">
                          <p className="text-xs text-[var(--muted-foreground)] italic text-center">
                            {parsed.disclaimer}
                          </p>
                        </div>
                      </>
                    );
                  } catch (e) {
                    // Fallback to plain text if JSON parsing fails
                    return (
                      <div className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-line">
                        {interpretation}
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-[var(--muted-foreground)]">
                Unable to generate interpretation at this time.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Disclaimer */}
      <div className="text-center py-3 px-6 bg-gradient-to-r from-[var(--muted)]/5 to-[var(--secondary)]/5 rounded-lg border border-[var(--muted)]/30 shadow-sm">
        <div className="flex items-center justify-center gap-2 mb-1">
          <AlertTriangle className="h-3 w-3 text-[var(--accent)]" />
          <p className="text-xs font-medium text-[var(--foreground)]">Important Disclaimer</p>
        </div>
        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
          This is an illustrative example based on your persona and preferences. Not financial advice. 
          Always consult a qualified financial advisor for investment decisions.
        </p>
      </div>
    </div>
  );
}

// Allocation table component
function AllocationTable({ 
  allocation, 
  isHighlighted = false 
}: { 
  allocation: Allocation; 
  isHighlighted?: boolean;
}) {
  // Sort by allocation percentage descending
  const sortedAllocation = Object.entries(allocation)
    .filter(([_, value]) => value > 0.005) // Only show assets > 0.5%
    .sort(([,a], [,b]) => b - a);

  return (
    <div className="space-y-2">
      {sortedAllocation.map(([asset, weight]) => (
        <div key={asset} className="flex items-center justify-between">
          <div className="flex-grow min-w-0">
            <div className="font-medium text-[var(--foreground)] text-sm truncate">
              {ASSET_NAMES[asset] || asset}
            </div>
            <div className="w-full h-1.5 bg-[var(--muted)] rounded-full overflow-hidden mt-0.5">
              <div 
                className={`h-full transition-all duration-300 ${
                  isHighlighted 
                    ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] shadow-sm'
                    : 'bg-gradient-to-r from-[var(--muted-foreground)] to-[var(--muted-foreground)]/70'
                }`}
                style={{ width: `${weight * 100}%` }}
              />
            </div>
          </div>
          <div className={`text-base font-bold ml-3 flex-shrink-0 ${
            isHighlighted ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'
          }`}>
            {(weight * 100).toFixed(1)}%
          </div>
        </div>
      ))}
    </div>
  );
}

// Get scenario-specific tilt explanation
function getScenarioTiltExplanation(scenarioName: string): string {
  const explanations: Record<string, string> = {
    'Property Crash': 'Reduced property exposure; higher cash and bonds for safety',
    'AI Recession': 'Defensive positioning with credit and short-term bonds',
    'Stagflation': 'Gold and commodities hedge against inflation; reduced bonds',
    'Tech Burst': 'Value tilt and duration for tech correction protection',
    'Tax Shift': 'UK equity preference for potential tax advantages',
    'Reflation': 'Growth equity bias for economic recovery scenario',
    'Stagflation 2': 'Maximum inflation protection via commodities and gold',
    'Devaluation': 'Global equity and gold hedge currency weakness',
    'Gilt Selloff': 'Cash heavy with short duration to avoid bond losses',
    'Energy Spike': 'Energy commodities and value stocks benefit from higher prices'
  };
  
  return explanations[scenarioName] || 'Balanced allocation across asset classes';
}