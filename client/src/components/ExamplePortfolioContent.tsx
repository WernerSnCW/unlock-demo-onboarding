import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Target, BarChart3, TrendingUp, Shield, Lightbulb } from 'lucide-react';
import { type PersonaDef } from '@/data/personas';
import { type BeliefFlowResult } from '@/hooks/useBeliefFlow';
import { ASSET_NAMES } from '@/data/belief-questions';

interface ExamplePortfolioContentProps {
  persona: PersonaDef;
  portfolioResult: BeliefFlowResult;
  onBack: () => void;
  onReturnToPersona: () => void;
}

export function ExamplePortfolioContent({ 
  persona, 
  portfolioResult, 
  onBack, 
  onReturnToPersona 
}: ExamplePortfolioContentProps) {
  const { scenarioSelection, baseAllocation, personaAdjustedAllocation, explanations } = portfolioResult;
  
  // Convert allocations to sorted arrays for display
  const baseSorted = Object.entries(baseAllocation)
    .filter(([, weight]) => weight > 0.01)
    .sort(([, a], [, b]) => b - a);
    
  const adjustedSorted = Object.entries(personaAdjustedAllocation)
    .filter(([, weight]) => weight > 0.01)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="space-y-8">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex items-center gap-2"
          data-testid="button-back-to-questions"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Questions
        </Button>
        <Button
          onClick={onReturnToPersona}
          variant="outline"
          className="text-[var(--muted-foreground)]"
          data-testid="button-choose-different-persona"
        >
          Choose Different Persona
        </Button>
      </div>

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
            Your Example Portfolio
          </h1>
          <p className="text-xl text-[var(--muted-foreground)] max-w-3xl mx-auto">
            Based on your persona and economic beliefs, here's a personalized investment allocation
          </p>
        </div>
        
        {/* Persona & Scenario Summary */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--primary)]/5 rounded-xl border border-[var(--primary)]/20">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-[var(--primary)]" />
              <span className="font-semibold text-[var(--foreground)]">Persona: {persona.name}</span>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">{persona.notes}</p>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-[var(--secondary)]/10 to-[var(--secondary)]/5 rounded-xl border border-[var(--secondary)]/20">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-5 w-5 text-[var(--secondary)]" />
              <span className="font-semibold text-[var(--foreground)]">
                Scenario: {scenarioSelection.top.replace('_', ' ')}
                {scenarioSelection.blend && ` + ${scenarioSelection.runnerUp?.replace('_', ' ')}`}
              </span>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              {explanations.scenarioReason}
            </p>
          </div>
        </div>
      </div>

      {/* Portfolio Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Base Scenario Allocation */}
        <Card className="border border-[var(--border)] shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[var(--foreground)]">
              <Shield className="h-5 w-5 text-[var(--muted-foreground)]" />
              Base Scenario Mix
            </CardTitle>
            <CardDescription>
              Default allocation for {scenarioSelection.top.replace('_', ' ')} scenario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {baseSorted.map(([asset, weight]) => (
                <div key={asset} className="flex items-center justify-between" data-testid={`base-asset-${asset}`}>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full bg-gradient-to-r from-[var(--muted)] to-[var(--muted-foreground)]"
                    />
                    <span className="text-sm font-medium text-[var(--foreground)]">
                      {ASSET_NAMES[asset] || asset.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-[var(--foreground)]" data-testid={`base-weight-${asset}`}>
                      {(weight * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Persona-Adjusted Allocation */}
        <Card className="border border-[var(--primary)] shadow-xl bg-gradient-to-br from-[var(--primary)]/5 to-[var(--secondary)]/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[var(--primary)]">
              <TrendingUp className="h-5 w-5" />
              Your Personalized Portfolio
            </CardTitle>
            <CardDescription>
              Adjusted for your persona's constraints and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {adjustedSorted.map(([asset, weight]) => (
                <div key={asset} className="flex items-center justify-between" data-testid={`adjusted-asset-${asset}`}>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]"
                    />
                    <span className="text-sm font-medium text-[var(--foreground)]">
                      {ASSET_NAMES[asset] || asset.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-[var(--primary)]" data-testid={`adjusted-weight-${asset}`}>
                      {(weight * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Explanation */}
      <Card className="border border-[var(--accent)] bg-gradient-to-r from-[var(--accent)]/5 to-[var(--accent)]/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[var(--accent)]">
            <Lightbulb className="h-5 w-5" />
            Why This Portfolio Mix?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-[var(--foreground)] mb-2">Scenario Influence:</h4>
              <p className="text-[var(--muted-foreground)]" data-testid="text-scenario-reason">
                {explanations.scenarioReason}
              </p>
            </div>
            
            {explanations.personaRulesApplied.length > 0 && (
              <div>
                <h4 className="font-semibold text-[var(--foreground)] mb-2">Persona Adjustments:</h4>
                <ul className="space-y-1" data-testid="list-persona-adjustments">
                  {explanations.personaRulesApplied.map((rule, index) => (
                    <li key={index} className="flex items-start gap-2 text-[var(--muted-foreground)]">
                      <span className="text-[var(--accent)] mt-1">•</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="mt-6 p-4 bg-[var(--muted)]/20 rounded-lg border border-[var(--muted)]">
            <p className="text-xs text-[var(--muted-foreground)] text-center">
              <strong>Disclaimer:</strong> This is an illustrative example based on your persona and answers; not financial advice.
              Always consult with a qualified financial advisor before making investment decisions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}