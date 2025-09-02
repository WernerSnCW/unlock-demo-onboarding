// Portfolio display component for Base and Persona-Adjusted allocations
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Shield, PieChart, AlertTriangle, Brain, Loader2 } from 'lucide-react';
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
          persona: personaName,
          scenario: scenarioName,
          baseAllocation,
          personaAdjustedAllocation,
          constraintsApplied: explanations.personaRulesApplied
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

  return (
    <div className="space-y-4">
      {/* Scenario Banner */}
      <Card className="border-[var(--primary)] bg-[var(--primary)]/10">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[var(--primary)]" />
            <CardTitle className="text-lg text-[var(--foreground)]">
              {explanations.scenarioReason}
            </CardTitle>
          </div>
        </CardHeader>
      </Card>

      {/* Portfolio Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Base Scenario Portfolio */}
        <Card className="border border-[var(--border)]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-[var(--foreground)] text-lg">
              <PieChart className="h-4 w-4 text-[var(--secondary)]" />
              Base ({scenarioName})
            </CardTitle>
            <p className="text-xs text-[var(--muted-foreground)]">
              Core scenario allocation before persona adjustments
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <AllocationTable allocation={baseAllocation} />
          </CardContent>
        </Card>

        {/* Persona-Adjusted Portfolio */}
        <Card className="border-2 border-[var(--primary)] bg-[var(--primary)]/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-[var(--foreground)] text-lg">
              <Shield className="h-4 w-4 text-[var(--primary)]" />
              Persona-Adjusted (Example)
              <Badge className="bg-[var(--primary)] text-white text-xs">Recommended</Badge>
            </CardTitle>
            <p className="text-xs text-[var(--muted-foreground)]">
              Tailored to {personaName} constraints and preferences
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <AllocationTable allocation={personaAdjustedAllocation} isHighlighted />
          </CardContent>
        </Card>
      </div>

      {/* Why This Mix - More Compact */}
      <Card className="border border-[var(--accent)]/20 bg-[var(--accent)]/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-[var(--foreground)] flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-[var(--accent)]" />
            Why This Mix
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <div>
            <h4 className="font-medium text-[var(--foreground)] text-sm mb-1">Scenario Tilt:</h4>
            <p className="text-xs text-[var(--muted-foreground)]">
              {getScenarioTiltExplanation(scenarioName)}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-[var(--foreground)] text-sm mb-1">Persona Guardrails:</h4>
            <ul className="space-y-0.5">
              {explanations.personaRulesApplied.map((rule, index) => (
                <li key={index} className="text-xs text-[var(--muted-foreground)] flex items-center gap-2">
                  <span className="w-1 h-1 bg-[var(--accent)] rounded-full flex-shrink-0" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* AI Interpretation */}
      <Card className="border border-[var(--accent)]/30 bg-[var(--accent)]/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-[var(--foreground)] flex items-center gap-2 text-base">
            <Brain className="h-4 w-4 text-[var(--accent)]" />
            Portfolio Interpretation
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoadingInterpretation ? (
            <div className="flex items-center gap-2 py-6">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--accent)]" />
              <div className="text-sm text-[var(--muted-foreground)]">
                <div className="font-medium">AI is analyzing your portfolio...</div>
                <div className="text-xs mt-1">This may take 10-15 seconds</div>
              </div>
            </div>
          ) : interpretation ? (
            <div className="prose prose-sm max-w-none">
              <div className="text-sm text-[var(--foreground)] whitespace-pre-line">
                {interpretation}
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--muted-foreground)]">
              Unable to generate interpretation at this time.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Compact Disclaimer */}
      <div className="text-center py-2 px-4 bg-[var(--muted)]/10 rounded border border-[var(--muted)]">
        <p className="text-xs text-[var(--muted-foreground)] italic">
          Illustrative example based on your persona and answers; not investment advice.
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