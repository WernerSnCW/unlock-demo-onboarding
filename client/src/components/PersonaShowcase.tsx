import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { INVESTMENT_PERSONAS, DIMENSION_LABELS, PersonaDef } from '@/data/personas';
import { Target, TrendingUp, DollarSign, Shield, Clock, Home, Zap, Users, ArrowDown } from 'lucide-react';

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
      className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-0 rounded-2xl overflow-hidden group relative"
      onClick={onClick}
      data-testid={`persona-card-${persona.code}`}
      style={{ 
        background: 'linear-gradient(135deg, var(--card) 0%, var(--muted) 100%)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
      }}
    >
      {/* Enhanced Header with gradient */}
      <div className="bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] p-5 relative">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-white leading-tight mb-1">
              {persona.name}
            </CardTitle>
            <p className="text-sm text-white/80">
              {persona.wealthTier}
            </p>
          </div>
          <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm font-medium">
            {persona.code}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-5 space-y-4">

        {/* Enhanced Portfolio Value Section */}
        <div className="bg-gradient-to-r rounded-2xl p-4 relative overflow-hidden" style={{ backgroundColor: 'var(--muted)' }}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Portfolio Value</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
                  {formatPortfolioValue(persona.portfolioValue)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge className={`${getRiskProfileColor(persona.riskProfile)} font-medium px-3 py-1`}>
                {persona.riskProfile}
              </Badge>
            </div>
          </div>
        </div>
        {/* Investment Approach */}
        <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--muted)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' }}>
              <div style={{ color: 'white' }}>
                {getApproachIcon(persona.approach)}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Investment Style</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--card-foreground)' }}>
                {persona.approach === 'SELF_DIRECTED' ? 'Self-Directed' : persona.approach === 'HYBRID' ? 'Hybrid' : 'Advised'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Key Notes - Enhanced */}
        <div className="p-4 rounded-xl border-l-4 relative" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--primary)' }}>
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--primary)' }}></div>
          <p className="text-sm italic leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
            "{persona.notes}"
          </p>
        </div>
        
        {/* Enhanced Investment Focus */}
        {(persona.propertyBias > 0.3 || persona.techBias > 0.3 || persona.altBias > 0.3) && (
          <div className="space-y-2">
            <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Key Investment Focus</p>
            <div className="flex items-center gap-2 flex-wrap">
              {persona.propertyBias > 0.3 && (
                <div className="flex items-center gap-2 rounded-xl px-3 py-2 flex-1 min-w-0" style={{ backgroundColor: 'var(--accent)' }}>
                  <Home className="h-4 w-4 text-white flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white">Property</p>
                    <p className="text-xs text-white/80">{(persona.propertyBias * 100).toFixed(0)}%</p>
                  </div>
                </div>
              )}
              {persona.techBias > 0.3 && (
                <div className="flex items-center gap-2 rounded-xl px-3 py-2 flex-1 min-w-0" style={{ backgroundColor: 'var(--primary)' }}>
                  <Zap className="h-4 w-4 text-white flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white">Tech</p>
                    <p className="text-xs text-white/80">{(persona.techBias * 100).toFixed(0)}%</p>
                  </div>
                </div>
              )}
              {persona.altBias > 0.3 && (
                <div className="flex items-center gap-2 rounded-xl px-3 py-2 flex-1 min-w-0" style={{ backgroundColor: 'var(--secondary)' }}>
                  <TrendingUp className="h-4 w-4 text-white flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white">Alts</p>
                    <p className="text-xs text-white/80">{(persona.altBias * 100).toFixed(0)}%</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hover indicator */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center pt-2">
          <p className="text-xs font-medium" style={{ color: 'var(--primary)' }}>Click to explore details →</p>
        </div>
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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl border-2" style={{ borderColor: 'var(--primary)', backgroundColor: 'var(--card)' }}>
        {/* Enhanced Header with brand colors */}
        <div className="bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] p-6 -m-6 mb-6 rounded-t-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-white">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                {persona.code}
              </Badge>
              <span className="text-xl font-bold">{persona.name}</span>
            </DialogTitle>
          </DialogHeader>
        </div>
        
        <div className="space-y-6 px-2">
          {/* Overview */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gradient-to-br p-4 rounded-xl" style={{ backgroundColor: 'var(--muted)' }}>
              <h4 className="font-semibold mb-2" style={{ color: 'var(--card-foreground)' }}>Portfolio Value</h4>
              <p className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>
                {formatPortfolioValue(persona.portfolioValue)}
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>{persona.wealthTier}</p>
            </div>
            <div className="bg-gradient-to-br p-4 rounded-xl" style={{ backgroundColor: 'var(--muted)' }}>
              <h4 className="font-semibold mb-2" style={{ color: 'var(--card-foreground)' }}>Risk Profile</h4>
              <Badge className={`${getRiskProfileColor(persona.riskProfile)} text-sm px-3 py-1 mb-2`}>
                {persona.riskProfile}
              </Badge>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                {persona.approach.replace('_', ' ')} approach
              </p>
            </div>
          </div>
          
          {/* Investment Characteristics */}
          <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--muted)' }}>
            <h4 className="font-semibold mb-4 text-lg" style={{ color: 'var(--card-foreground)' }}>Investment Characteristics</h4>
            
            <div className="mb-6 p-4 rounded-lg border-l-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--primary)' }}>
              <p className="italic text-base leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>"{persona.notes}"</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                  <span className="font-medium text-sm" style={{ color: 'var(--muted-foreground)' }}>Liquidity</span>
                </div>
                <p className="text-lg font-bold" style={{ color: 'var(--card-foreground)' }}>{persona.liquidityMonths} months</p>
              </div>
              
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDown className="h-4 w-4" style={{ color: 'var(--secondary)' }} />
                  <span className="font-medium text-sm" style={{ color: 'var(--muted-foreground)' }}>Drawdown</span>
                </div>
                <p className="text-lg font-bold" style={{ color: 'var(--card-foreground)' }}>{(persona.drawdownCap * 100).toFixed(0)}%</p>
              </div>
              
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                  <span className="font-medium text-sm" style={{ color: 'var(--muted-foreground)' }}>Concentration</span>
                </div>
                <p className="text-lg font-bold capitalize" style={{ color: 'var(--card-foreground)' }}>{persona.concentrationTolerance}</p>
              </div>
            </div>
          </div>
          
          {/* Investment Biases */}
          <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--muted)' }}>
            <h4 className="font-semibold mb-4 text-lg" style={{ color: 'var(--card-foreground)' }}>Investment Biases</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--card)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' }}>
                    <Home className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium" style={{ color: 'var(--card-foreground)' }}>Property</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 rounded-full h-3" style={{ backgroundColor: 'var(--muted)' }}>
                    <div 
                      className="h-3 rounded-full" 
                      style={{ 
                        width: `${persona.propertyBias * 100}%`,
                        backgroundColor: 'var(--accent)'
                      }}
                    ></div>
                  </div>
                  <span className="font-semibold min-w-[3rem] text-right" style={{ color: 'var(--card-foreground)' }}>{(persona.propertyBias * 100).toFixed(0)}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--card)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium" style={{ color: 'var(--card-foreground)' }}>Technology</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 rounded-full h-3" style={{ backgroundColor: 'var(--muted)' }}>
                    <div 
                      className="h-3 rounded-full" 
                      style={{ 
                        width: `${persona.techBias * 100}%`,
                        backgroundColor: 'var(--primary)'
                      }}
                    ></div>
                  </div>
                  <span className="font-semibold min-w-[3rem] text-right" style={{ color: 'var(--card-foreground)' }}>{(persona.techBias * 100).toFixed(0)}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--card)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--secondary)' }}>
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium" style={{ color: 'var(--card-foreground)' }}>Alternatives</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 rounded-full h-3" style={{ backgroundColor: 'var(--muted)' }}>
                    <div 
                      className="h-3 rounded-full" 
                      style={{ 
                        width: `${persona.altBias * 100}%`,
                        backgroundColor: 'var(--secondary)'
                      }}
                    ></div>
                  </div>
                  <span className="font-semibold min-w-[3rem] text-right" style={{ color: 'var(--card-foreground)' }}>{(persona.altBias * 100).toFixed(0)}%</span>
                </div>
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