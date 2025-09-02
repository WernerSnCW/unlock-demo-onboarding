// Portfolio display component for Base and Persona-Adjusted allocations
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Shield, PieChart, AlertTriangle } from 'lucide-react';
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
  return (
    <div className="space-y-6">
      {/* Scenario Banner */}
      <Card className="border-[var(--primary)] bg-[var(--primary)]/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[var(--primary)]" />
            <CardTitle className="text-[var(--foreground)]">
              {explanations.scenarioReason}
            </CardTitle>
          </div>
        </CardHeader>
      </Card>

      {/* Portfolio Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Base Scenario Portfolio */}
        <Card className="border border-[var(--border)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[var(--foreground)]">
              <PieChart className="h-5 w-5 text-[var(--secondary)]" />
              Base ({scenarioName})
            </CardTitle>
            <p className="text-sm text-[var(--muted-foreground)]">
              Core scenario allocation before persona adjustments
            </p>
          </CardHeader>
          <CardContent>
            <AllocationTable allocation={baseAllocation} />
          </CardContent>
        </Card>

        {/* Persona-Adjusted Portfolio */}
        <Card className="border-2 border-[var(--primary)] bg-[var(--primary)]/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[var(--foreground)]">
              <Shield className="h-5 w-5 text-[var(--primary)]" />
              Persona-Adjusted (Example)
              <Badge className="bg-[var(--primary)] text-white">Recommended</Badge>
            </CardTitle>
            <p className="text-sm text-[var(--muted-foreground)]">
              Tailored to {personaName} constraints and preferences
            </p>
          </CardHeader>
          <CardContent>
            <AllocationTable allocation={personaAdjustedAllocation} isHighlighted />
          </CardContent>
        </Card>
      </div>

      {/* Why This Mix */}
      <Card className="border border-[var(--accent)]/20 bg-[var(--accent)]/10">
        <CardHeader>
          <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[var(--accent)]" />
            Why This Mix
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-semibold text-[var(--foreground)] mb-1">Scenario Tilt:</h4>
            <p className="text-sm text-[var(--muted-foreground)]">
              {getScenarioTiltExplanation(scenarioName)}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-[var(--foreground)] mb-1">Persona Guardrails:</h4>
            <ul className="space-y-1">
              {explanations.personaRulesApplied.map((rule, index) => (
                <li key={index} className="text-sm text-[var(--muted-foreground)] flex items-center gap-2">
                  <span className="w-1 h-1 bg-[var(--accent)] rounded-full" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="border border-[var(--muted)] bg-[var(--muted)]/10">
        <CardContent className="pt-6">
          <p className="text-sm text-[var(--muted-foreground)] text-center italic">
            Illustrative example based on your persona and answers; not investment advice.
          </p>
        </CardContent>
      </Card>
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
    <div className="space-y-3">
      {sortedAllocation.map(([asset, weight]) => (
        <div key={asset} className="flex items-center justify-between">
          <div className="flex-grow">
            <div className="font-medium text-[var(--foreground)]">
              {ASSET_NAMES[asset] || asset}
            </div>
            <div className="w-full h-2 bg-[var(--muted)] rounded-full overflow-hidden mt-1">
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
          <div className={`text-lg font-bold ml-4 ${
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