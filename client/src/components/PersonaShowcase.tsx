import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { INVESTMENT_PERSONAS, DIMENSION_LABELS, PersonaDef } from '@/data/personas';
import { Target, TrendingUp, DollarSign, Shield, Clock, Home, Zap, Users } from 'lucide-react';

const getRiskProfileColor = (riskProfile: string) => {
  switch (riskProfile.toLowerCase()) {
    case 'conservative':
    case 'very conservative':
    case 'income/defensive':
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
    case 'balanced':
    case 'moderate':
    case 'income':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
    case 'growth':
    case 'aggressive':
    case 'growth/opportunistic':
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
    default:
      return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400';
  }
};

const getApproachIcon = (approach: string) => {
  switch (approach) {
    case 'SELF_DIRECTED':
      return <Target className="h-4 w-4" />;
    case 'HYBRID':
      return <TrendingUp className="h-4 w-4" />;
    case 'ADVISED':
      return <Users className="h-4 w-4" />;
    default:
      return <Target className="h-4 w-4" />;
  }
};

const formatPortfolioValue = (value: number) => {
  if (value >= 1_000_000) {
    return `£${(value / 1_000_000).toFixed(1)}M`;
  }
  return `£${(value / 1_000).toFixed(0)}K`;
};

const PersonaCard: React.FC<{ persona: PersonaDef; onClick: () => void }> = ({ persona, onClick }) => {
  return (
    <Card 
      className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-850 rounded-2xl overflow-hidden group"
      onClick={onClick}
      data-testid={`persona-card-${persona.code}`}
      style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}
    >
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base font-bold text-white leading-tight">
                {persona.name}
              </CardTitle>
              <p className="text-xs text-white/80">
                {persona.wealthTier}
              </p>
            </div>
            <Badge className="ml-2 bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs">
              {persona.code}
            </Badge>
          </div>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Portfolio Value & Risk - Compact */}
        <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatPortfolioValue(persona.portfolioValue)}
              </p>
            </div>
          </div>
          <Badge className={`${getRiskProfileColor(persona.riskProfile)} text-xs`} variant="secondary">
            {persona.riskProfile}
          </Badge>
        </div>
        
        {/* Key Notes - Compact */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-lg p-3 border-l-3 border-[var(--primary)]">
          <p className="text-xs text-[var(--muted-foreground)] italic">
            "{persona.notes}"
          </p>
        </div>
        
        {/* Investment Focus - Compact */}
        {(persona.propertyBias > 0.3 || persona.techBias > 0.3 || persona.altBias > 0.3) && (
          <div className="flex items-center justify-center gap-2">
            {persona.propertyBias > 0.3 && (
              <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-900/20 rounded-md px-2 py-1">
                <Home className="h-3 w-3 text-orange-500" />
                <span className="text-xs text-orange-600 dark:text-orange-400">Property</span>
              </div>
            )}
            {persona.techBias > 0.3 && (
              <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 rounded-md px-2 py-1">
                <Zap className="h-3 w-3 text-blue-500" />
                <span className="text-xs text-blue-600 dark:text-blue-400">Tech</span>
              </div>
            )}
            {persona.altBias > 0.3 && (
              <div className="flex items-center gap-1 bg-purple-50 dark:bg-purple-900/20 rounded-md px-2 py-1">
                <TrendingUp className="h-3 w-3 text-purple-500" />
                <span className="text-xs text-purple-600 dark:text-purple-400">Alts</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const PersonaDetailDialog: React.FC<{ 
  persona: PersonaDef | null; 
  onClose: () => void; 
  onSelect?: (persona: PersonaDef) => void;
}> = ({ persona, onClose, onSelect }) => {
  if (!persona) return null;

  const handleSelect = () => {
    if (onSelect) {
      onSelect(persona);
    }
    onClose();
  };

  return (
    <Dialog open={!!persona} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Badge variant="outline">{persona.code}</Badge>
            <span>{persona.name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-[var(--card-foreground)] mb-2">Portfolio Value</h4>
              <p className="text-2xl font-bold text-[var(--primary)]">
                {formatPortfolioValue(persona.portfolioValue)}
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">{persona.wealthTier}</p>
            </div>
            <div>
              <h4 className="font-semibold text-[var(--card-foreground)] mb-2">Risk Profile</h4>
              <Badge className={getRiskProfileColor(persona.riskProfile)}>
                {persona.riskProfile}
              </Badge>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                {persona.approach.replace('_', ' ')} approach
              </p>
            </div>
          </div>
          
          {/* Investment Characteristics */}
          <div>
            <h4 className="font-semibold text-[var(--card-foreground)] mb-3">Investment Characteristics</h4>
            <div className="bg-[var(--muted)] rounded-lg p-4">
              <p className="text-[var(--muted-foreground)] italic mb-4">"{persona.notes}"</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Liquidity Preference:</span>
                  <p>{persona.liquidityMonths} months</p>
                </div>
                <div>
                  <span className="font-medium">Drawdown Tolerance:</span>
                  <p>{(persona.drawdownCap * 100).toFixed(0)}%</p>
                </div>
                <div>
                  <span className="font-medium">Concentration:</span>
                  <p className="capitalize">{persona.concentrationTolerance}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Investment Biases */}
          <div>
            <h4 className="font-semibold text-[var(--card-foreground)] mb-3">Investment Biases</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-orange-500" />
                  <span>Property</span>
                </div>
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full" 
                    style={{ width: `${persona.propertyBias * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm">{(persona.propertyBias * 100).toFixed(0)}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span>Technology</span>
                </div>
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${persona.techBias * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm">{(persona.techBias * 100).toFixed(0)}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  <span>Alternatives</span>
                </div>
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${persona.altBias * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm">{(persona.altBias * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          {onSelect && (
            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={handleSelect} className="flex-1">
                Select This Persona
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export interface PersonaShowcaseProps {
  onPersonaSelect?: (persona: PersonaDef) => void;
  showSelection?: boolean;
}

export default function PersonaShowcase({ onPersonaSelect, showSelection = false }: PersonaShowcaseProps) {
  const [selectedPersona, setSelectedPersona] = useState<PersonaDef | null>(null);
  
  const personas = Object.values(INVESTMENT_PERSONAS);
  
  const handlePersonaClick = (persona: PersonaDef) => {
    setSelectedPersona(persona);
  };
  
  const handlePersonaSelect = (persona: PersonaDef) => {
    if (onPersonaSelect) {
      onPersonaSelect(persona);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-[var(--card-foreground)]">
          19 Investor Personas
        </h2>
        <p className="text-lg text-[var(--muted-foreground)] max-w-3xl mx-auto">
          Our comprehensive methodology identifies 19 distinct investor personalities based on risk tolerance, 
          investment approach, portfolio preferences, and behavioral characteristics. Click any persona to learn more.
        </p>
      </div>
      
      {/* Persona Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {personas.map((persona) => (
          <PersonaCard
            key={persona.code}
            persona={persona}
            onClick={() => handlePersonaClick(persona)}
          />
        ))}
      </div>
      
      {/* Statistics */}
      <div className="bg-[var(--muted)] rounded-xl p-6 mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-[var(--primary)]">19</div>
            <div className="text-sm text-[var(--muted-foreground)]">Unique Personas</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--primary)]">8</div>
            <div className="text-sm text-[var(--muted-foreground)]">Dimensions</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--primary)]">£280K-£2.8M</div>
            <div className="text-sm text-[var(--muted-foreground)]">Portfolio Range</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--primary)]">5</div>
            <div className="text-sm text-[var(--muted-foreground)]">Wealth Tiers</div>
          </div>
        </div>
      </div>
      
      {/* Persona Detail Dialog */}
      <PersonaDetailDialog 
        persona={selectedPersona} 
        onClose={() => setSelectedPersona(null)}
        onSelect={showSelection ? handlePersonaSelect : undefined}
      />
    </div>
  );
}