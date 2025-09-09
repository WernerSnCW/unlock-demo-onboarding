import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { INVESTMENT_PERSONAS, DIMENSION_LABELS, PersonaDef } from '@/data/personas';
import { PERSONA_DEFAULTS, type AssetBucket, type Mix } from '@/data/personaDefaults';
import { Target, TrendingUp, DollarSign, Shield, Clock, Home, Zap, Users, ArrowDown, PieChart, Banknote, LineChart, Building, Coins, Globe, MapPin, Cpu, Landmark, Gem, Bitcoin, Palette, Wine } from 'lucide-react';

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
      {/* Compact Header with gradient */}
      <div className="bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] p-3 relative">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base font-bold text-white leading-tight">
              {persona.name}
            </CardTitle>
            <p className="text-xs text-white/80">
              {persona.wealthTier}
            </p>
          </div>
          <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs">
            {persona.code}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3">

        {/* Portfolio & Risk Section */}
        <div className="rounded-xl p-3 relative" style={{ backgroundColor: 'var(--muted)' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
                <DollarSign className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Portfolio Value</p>
                <p className="text-lg font-bold" style={{ color: 'var(--primary)' }}>
                  {formatPortfolioValue(persona.portfolioValue)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Badge className={`${getRiskProfileColor(persona.riskProfile)} text-xs px-2 py-1`}>
              {persona.riskProfile}
            </Badge>
          </div>
        </div>
        {/* Investment Approach & Age */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
            <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' }}>
              <div style={{ color: 'white' }}>
                {getApproachIcon(persona.approach)}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Style</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--card-foreground)' }}>
                {persona.approach === 'SELF_DIRECTED' ? 'Self' : persona.approach === 'HYBRID' ? 'Hybrid' : 'Advised'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
            <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: 'var(--secondary)' }}>
              <Clock className="h-3 w-3 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Age</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--card-foreground)' }}>
                {persona.age_range[0]}-{persona.age_range[1]}
              </p>
            </div>
          </div>
        </div>
        
        {/* Key Notes */}
        <div className="p-3 rounded-lg border-l-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--primary)' }}>
          <p className="text-xs italic" style={{ color: 'var(--muted-foreground)' }}>
            "{persona.notes}"
          </p>
        </div>
        
        {/* Investment Focus */}
        {(persona.propertyBias > 0.3 || persona.techBias > 0.3 || persona.altBias > 0.3) && (
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>Key Investment Focus</p>
            <div className="grid gap-1">
              {persona.propertyBias > 0.3 && (
                <div className="flex items-center justify-between rounded-lg px-2 py-1" style={{ backgroundColor: 'var(--accent)' }}>
                  <div className="flex items-center gap-1">
                    <Home className="h-3 w-3 text-white" />
                    <span className="text-xs font-medium text-white">Property</span>
                  </div>
                  <span className="text-xs text-white/80">{(persona.propertyBias * 100).toFixed(0)}%</span>
                </div>
              )}
              {persona.techBias > 0.3 && (
                <div className="flex items-center justify-between rounded-lg px-2 py-1" style={{ backgroundColor: 'var(--primary)' }}>
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-white" />
                    <span className="text-xs font-medium text-white">Tech</span>
                  </div>
                  <span className="text-xs text-white/80">{(persona.techBias * 100).toFixed(0)}%</span>
                </div>
              )}
              {persona.altBias > 0.3 && (
                <div className="flex items-center justify-between rounded-lg px-2 py-1" style={{ backgroundColor: 'var(--secondary)' }}>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-white" />
                    <span className="text-xs font-medium text-white">Alts</span>
                  </div>
                  <span className="text-xs text-white/80">{(persona.altBias * 100).toFixed(0)}%</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hover indicator */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
          <p className="text-xs font-medium" style={{ color: 'var(--primary)' }}>Click to explore →</p>
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
          
          {/* Investment Goals */}
          <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--muted)' }}>
            <h4 className="font-semibold mb-4 text-lg" style={{ color: 'var(--card-foreground)' }}>Investment Goals</h4>
            <div className="space-y-3">
              {persona.goals.map((goal, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center mt-0.5" style={{ backgroundColor: 'var(--primary)' }}>
                    <span className="text-xs font-bold text-white">{index + 1}</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                    {goal}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Portfolio Mix */}
          <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--muted)' }}>
            <h4 className="font-semibold mb-4 text-lg" style={{ color: 'var(--card-foreground)' }}>Recommended Portfolio Mix</h4>
            <PortfolioMixDisplay personaCode={persona.code} />
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

// Component to display portfolio mix for a persona
function PortfolioMixDisplay({ personaCode }: { personaCode: string }) {
  const mix = PERSONA_DEFAULTS[personaCode];
  
  if (!mix) {
    return <p className="text-sm text-muted-foreground">Portfolio mix not available</p>;
  }

  // Group assets by category for better display
  const getAssetIcon = (bucket: AssetBucket) => {
    const iconProps = { className: "h-4 w-4", style: { color: 'var(--primary)' } };
    
    switch (bucket) {
      case 'CASH':
        return <Banknote {...iconProps} />;
      case 'BILLS_SHORT_GILTS':
        return <Landmark {...iconProps} />;
      case 'GILTS_LONG':
        return <Building {...iconProps} />;
      case 'IG_CREDIT':
        return <LineChart {...iconProps} />;
      case 'GLOBAL_EQUITY':
        return <Globe {...iconProps} />;
      case 'UK_EQUITY_VALUE':
        return <MapPin {...iconProps} />;
      case 'GROWTH_TECH':
        return <Cpu {...iconProps} />;
      case 'PROPERTY_UK_RESI':
        return <Home {...iconProps} />;
      case 'COMMODITIES':
        return <TrendingUp {...iconProps} />;
      case 'GOLD':
        return <Coins {...iconProps} />;
      case 'ALTERNATIVES':
        return <Target {...iconProps} />;
      case 'CRYPTO_BTC':
        return <Bitcoin {...iconProps} />;
      case 'CRYPTO_ETH':
        return <Zap {...iconProps} />;
      case 'COLLECTIBLES_ART':
        return <Palette {...iconProps} />;
      case 'COLLECTIBLES_WINE':
        return <Wine {...iconProps} />;
      default:
        return <PieChart {...iconProps} />;
    }
  };

  const getAssetLabel = (bucket: AssetBucket) => {
    const labels: Record<AssetBucket, string> = {
      'CASH': 'Cash',
      'BILLS_SHORT_GILTS': 'Bills & Short Gilts',
      'GILTS_LONG': 'Long Gilts',
      'IG_CREDIT': 'IG Credit',
      'GLOBAL_EQUITY': 'Global Equity',
      'UK_EQUITY_VALUE': 'UK Equity Value',
      'GROWTH_TECH': 'Growth & Tech',
      'PROPERTY_UK_RESI': 'UK Property',
      'COMMODITIES': 'Commodities',
      'GOLD': 'Gold',
      'ALTERNATIVES': 'Alternatives',
      'CRYPTO_BTC': 'Bitcoin',
      'CRYPTO_ETH': 'Ethereum',
      'COLLECTIBLES_ART': 'Art',
      'COLLECTIBLES_WINE': 'Wine'
    };
    return labels[bucket];
  };

  // Filter out zero allocations and sort by size
  const nonZeroAllocations = Object.entries(mix)
    .filter(([_, allocation]) => allocation > 0)
    .sort(([_, a], [__, b]) => b - a);

  // Group into major categories
  const categories = {
    'Fixed Income & Cash': ['CASH', 'BILLS_SHORT_GILTS', 'GILTS_LONG', 'IG_CREDIT'],
    'Equities': ['GLOBAL_EQUITY', 'UK_EQUITY_VALUE', 'GROWTH_TECH'],
    'Real Assets': ['PROPERTY_UK_RESI', 'COMMODITIES', 'GOLD'],
    'Alternative Investments': ['ALTERNATIVES', 'CRYPTO_BTC', 'CRYPTO_ETH', 'COLLECTIBLES_ART', 'COLLECTIBLES_WINE']
  };

  return (
    <div className="space-y-4">
      {Object.entries(categories).map(([categoryName, buckets]) => {
        const categoryAllocations = buckets
          .map(bucket => [bucket as AssetBucket, mix[bucket as AssetBucket]] as const)
          .filter(([_, allocation]) => allocation > 0);
        
        if (categoryAllocations.length === 0) return null;
        
        const categoryTotal = categoryAllocations.reduce((sum, [_, allocation]) => sum + allocation, 0);
        
        return (
          <div key={categoryName} className="space-y-2">
            <div className="flex items-center justify-between">
              <h5 className="font-medium text-sm" style={{ color: 'var(--card-foreground)' }}>
                {categoryName}
              </h5>
              <span className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>
                {(categoryTotal * 100).toFixed(1)}%
              </span>
            </div>
            <div className="space-y-1 ml-4">
              {categoryAllocations.map(([bucket, allocation]) => (
                <div key={bucket} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">{getAssetIcon(bucket)}</div>
                    <span style={{ color: 'var(--muted-foreground)' }}>
                      {getAssetLabel(bucket)}
                    </span>
                  </div>
                  <span className="font-medium" style={{ color: 'var(--card-foreground)' }}>
                    {(allocation * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      
      {/* Summary */}
      <div className="border-t pt-3 mt-4" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between text-sm font-medium">
          <span style={{ color: 'var(--card-foreground)' }}>Total Portfolio</span>
          <span style={{ color: 'var(--primary)' }}>100.0%</span>
        </div>
        <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
          {nonZeroAllocations.length} asset classes allocated
        </p>
      </div>
    </div>
  );
}

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
      
      {/* Continue Button */}
      <div className="flex justify-center mt-8">
        <Button 
          onClick={() => {
            // Navigate to next tab - assuming this is called from parent component
            if (onPersonaSelect) {
              // Trigger navigation to next step
              window.dispatchEvent(new CustomEvent('navigateToNextTab'));
            }
          }}
          className="px-8 py-3 text-lg font-semibold" 
          style={{ backgroundColor: 'var(--primary)' }}
          data-testid="button-continue-to-next-tab"
        >
          Continue to Investment Preferences →
        </Button>
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