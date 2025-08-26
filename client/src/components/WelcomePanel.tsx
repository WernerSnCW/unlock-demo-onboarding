import { useState } from 'react';
import { User, Settings, Mail, MessageCircle, TrendingUp, Eye, HelpCircle, Users, Crown, Star, Award, Edit3, Bell, PinIcon as Pin, Zap, PieChart, Home, Briefcase } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface Profile {
  firstName: string;
  lastName?: string;
  email?: string;
  investorType: "angel" | "syndicate" | "advisor" | "other";
  sectors: string[];
  riskProfile: "low" | "medium" | "high";
  newsletterFrequency: "daily" | "weekly" | "monthly";
  whatsappAlerts: boolean;
  profilePicture?: string;
  // Investment Activity
  reportsViewed: number;
  questionsAsked: number;
  syndicatesJoined: number;
  // Portfolio Summary  
  totalHoldingsValue?: string;
  topSector?: { name: string; percentage: number };
  portfolioLastUpdated?: string;
  // Trust & Community
  reputationScore: number;
  badges: string[];
  // Plan
  currentPlan: "free" | "premium";
  // Investor Preferences
  existingInvestments?: string[];
  regions?: string[];
}

interface WelcomePanelProps {
  profile?: Profile;
  selectedInvestorId?: string;
  onChangePreferences?: (preferences: { newsletterFrequency: string; whatsappAlerts: boolean }) => void;
  onEditSectors?: () => void;
  onUpgrade?: () => void;
}

export default function WelcomePanel({ profile, selectedInvestorId, onChangePreferences, onEditSectors, onUpgrade }: WelcomePanelProps) {
  if (!profile) {
    return (
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4 text-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <h2 className="text-lg font-semibold text-[var(--card-foreground)] mb-3">
          Improve your feed
        </h2>
        <p className="text-[var(--muted-foreground)] mb-4 text-sm">
          Complete onboarding (2 min)
        </p>
        <button 
          className="bg-[var(--accent)] text-[var(--accent-foreground)] px-4 py-2 rounded-[var(--radius-sm)] font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          disabled
        >
          Complete Onboarding
        </button>
      </div>
    );
  }

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'Active Contributor': return <Star className="h-3 w-3" />;
      case 'Early Adopter': return <Award className="h-3 w-3" />;
      default: return <Award className="h-3 w-3" />;
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Active Contributor': return 'text-[var(--info-foreground)]';
      case 'Early Adopter': return 'text-[var(--primary-foreground)]';
      default: return 'text-[var(--muted-foreground)]';
    }
  };

  const getBadgeBackground = (badge: string) => {
    switch (badge) {
      case 'Active Contributor': return 'var(--info)';
      case 'Early Adopter': return 'var(--primary)';
      default: return 'var(--muted)';
    }
  };

  // Fetch portfolio data
  const { data: portfolioHoldings = [] } = useQuery<any[]>({
    queryKey: ['/api/investors', selectedInvestorId, 'portfolio-holdings'],
    enabled: !!selectedInvestorId,
  });

  const { data: properties = [] } = useQuery<any[]>({
    queryKey: ['/api/properties', selectedInvestorId],
    enabled: !!selectedInvestorId,
  });

  const { data: alternatives = [] } = useQuery<any[]>({
    queryKey: ['/api/alternatives', selectedInvestorId],
    enabled: !!selectedInvestorId,
  });

  // Calculate portfolio mix
  const portfolioValue = portfolioHoldings.reduce((sum: number, holding: any) => 
    sum + parseFloat(holding.currentValueGbp || '0'), 0);
  
  const propertyValue = properties.reduce((sum: number, property: any) => 
    sum + parseFloat(property.currentValueGbp || '0'), 0);
  
  const alternativeValue = alternatives.reduce((sum: number, alt: any) => 
    sum + parseFloat(alt.currentValueGbp || '0'), 0);

  const totalValue = portfolioValue + propertyValue + alternativeValue;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `£${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `£${(value / 1000).toFixed(0)}K`;
    } else {
      return `£${value.toFixed(0)}`;
    }
  };

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
      {/* Header with Profile Picture and Name */}
      <div className="flex items-center gap-4 mb-5">
        <div className="relative">
          {profile.profilePicture ? (
            <img 
              src={profile.profilePicture} 
              alt={`${profile.firstName}'s profile`}
              className="w-12 h-12 rounded-full object-cover border-2 border-[var(--border)]"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary)]/10 to-[var(--primary)]/20 border-2 border-[var(--border)] flex items-center justify-center">
              <User className="h-6 w-6 text-[var(--primary)]" />
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[var(--success)] rounded-full border-2 border-[var(--card)]"></div>
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-[var(--card-foreground)]">
            Welcome back, {profile.firstName}.
          </h2>
          {profile.email && (
            <p className="text-sm text-[var(--muted-foreground)]">{profile.email}</p>
          )}
        </div>
        <button 
          className="p-2 text-[var(--muted-foreground)] hover:text-[var(--primary)] rounded-[var(--radius-sm)] hover:bg-[var(--muted)] transition-colors"
          disabled
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      {/* Profile Tags with Trust Signals */}
      <div className="flex flex-wrap gap-2 mb-5">
        {/* Investor Type */}
        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: 'var(--secondary)', color: 'var(--secondary-foreground)' }}>
          {profile.investorType?.charAt(0).toUpperCase() + profile.investorType?.slice(1)} Investor
        </span>
        
        {/* Existing Investments - Show up to 3 */}
        {profile.existingInvestments && profile.existingInvestments.length > 0 && 
          profile.existingInvestments.slice(0, 3).map((investment, index) => (
            <span key={index} className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: 'var(--success)', color: 'var(--success-foreground)' }}>
              {investment}
            </span>
          ))
        }
        {profile.existingInvestments && profile.existingInvestments.length > 3 && (
          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: 'var(--success)', color: 'var(--success-foreground)' }}>
            +{profile.existingInvestments.length - 3} more
          </span>
        )}
        
        {/* Regions */}
        {profile.regions && profile.regions.length > 0 && (
          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
            {profile.regions[0]}
            {profile.regions.length > 1 && ` +${profile.regions.length - 1}`}
          </span>
        )}
      </div>

      {/* Badges */}
      {profile.badges && profile.badges.length > 0 && (
        <div className="mb-5">
          <div className="flex flex-wrap gap-2">
            {profile.badges.map((badge, index) => (
              <span key={index} className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${getBadgeColor(badge)}`} style={{ backgroundColor: getBadgeBackground(badge) }}>
                {getBadgeIcon(badge)}
                {badge}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Investment Activity Snapshot */}
      <div className="mb-5">
        <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--card-foreground)' }}>Investment Activity</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
            <div className="flex items-center justify-center mb-1">
              <Eye className="h-4 w-4" style={{ color: 'var(--info)' }} />
            </div>
            <div className="text-lg font-semibold" style={{ color: 'var(--info)' }}>{profile.reportsViewed}</div>
            <div className="text-xs" style={{ color: 'var(--info)' }}>Reports this month</div>
          </div>
          <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
            <div className="flex items-center justify-center mb-1">
              <HelpCircle className="h-4 w-4" style={{ color: 'var(--success)' }} />
            </div>
            <div className="text-lg font-semibold" style={{ color: 'var(--success)' }}>{profile.questionsAsked}</div>
            <div className="text-xs" style={{ color: 'var(--success)' }}>Questions asked</div>
          </div>
          <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4" style={{ color: 'var(--primary)' }} />
            </div>
            <div className="text-lg font-semibold" style={{ color: 'var(--primary)' }}>{profile.syndicatesJoined}</div>
            <div className="text-xs" style={{ color: 'var(--primary)' }}>Syndicates joined</div>
          </div>
        </div>
      </div>

      {/* Portfolio Mix */}
      {selectedInvestorId && totalValue > 0 && (
        <div className="mb-5">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: 'var(--card-foreground)' }}>
            <PieChart className="h-4 w-4" />
            Portfolio Mix
          </h3>
          <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Total Portfolio Value</span>
              <span className="text-lg font-semibold" style={{ color: 'var(--card-foreground)' }}>{formatCurrency(totalValue)}</span>
            </div>
            
            <div className="space-y-3">
              {/* Portfolio Holdings */}
              {portfolioValue > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" style={{ color: 'var(--info)' }} />
                    <span className="text-sm" style={{ color: 'var(--card-foreground)' }}>Securities</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium" style={{ color: 'var(--card-foreground)' }}>{formatCurrency(portfolioValue)}</div>
                    <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{((portfolioValue / totalValue) * 100).toFixed(0)}%</div>
                  </div>
                </div>
              )}
              
              {/* Property Portfolio */}
              {propertyValue > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4" style={{ color: 'var(--success)' }} />
                    <span className="text-sm" style={{ color: 'var(--card-foreground)' }}>Property</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium" style={{ color: 'var(--card-foreground)' }}>{formatCurrency(propertyValue)}</div>
                    <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{((propertyValue / totalValue) * 100).toFixed(0)}%</div>
                  </div>
                </div>
              )}
              
              {/* Alternative Investments */}
              {alternativeValue > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                    <span className="text-sm" style={{ color: 'var(--card-foreground)' }}>Alternatives</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium" style={{ color: 'var(--card-foreground)' }}>{formatCurrency(alternativeValue)}</div>
                    <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{((alternativeValue / totalValue) * 100).toFixed(0)}%</div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Visual bar representation */}
            <div className="mt-3 h-2 rounded-full overflow-hidden flex" style={{ backgroundColor: 'var(--border)' }}>
              {portfolioValue > 0 && (
                <div 
                  className="h-full" 
                  style={{ width: `${(portfolioValue / totalValue) * 100}%`, backgroundColor: 'var(--info)' }}
                />
              )}
              {propertyValue > 0 && (
                <div 
                  className="h-full" 
                  style={{ width: `${(propertyValue / totalValue) * 100}%`, backgroundColor: 'var(--success)' }}
                />
              )}
              {alternativeValue > 0 && (
                <div 
                  className="h-full" 
                  style={{ width: `${(alternativeValue / totalValue) * 100}%`, backgroundColor: 'var(--primary)' }}
                />
              )}
            </div>
            
            <div className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>
              Updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      )}

      {/* Quick Preferences & Controls */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium" style={{ color: 'var(--card-foreground)' }}>Quick Controls</h3>
          <button 
            onClick={onEditSectors}
            className="text-xs font-medium flex items-center gap-1 hover:opacity-75 transition-opacity"
            style={{ color: 'var(--info)' }}
          >
            <Edit3 className="h-3 w-3" />
            Edit Sectors
          </button>
        </div>
        <div className="space-y-2">
          {/* Email Alerts Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
              <span className="text-sm" style={{ color: 'var(--card-foreground)' }}>Email Alerts</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {profile.newsletterFrequency?.charAt(0).toUpperCase() + profile.newsletterFrequency?.slice(1)}
              </span>
              <div className="w-6 h-3 rounded-full relative" style={{ backgroundColor: 'var(--success)' }}>
                <div className="absolute top-0.5 w-2 h-2 bg-white rounded-full translate-x-3"></div>
              </div>
            </div>
          </div>

          {/* WhatsApp Alerts */}
          <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
              <span className="text-sm" style={{ color: 'var(--card-foreground)' }}>WhatsApp Alerts</span>
            </div>
            <div className="w-6 h-3 rounded-full relative transition-colors" style={{ backgroundColor: profile.whatsappAlerts ? 'var(--success)' : 'var(--border)' }}>
              <div className={`absolute top-0.5 w-2 h-2 bg-white rounded-full transition-transform ${
                profile.whatsappAlerts ? 'translate-x-3' : 'translate-x-0.5'
              }`}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Nudges */}
      <div className="mb-5">
        <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--card-foreground)' }}>For You</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-3 rounded-lg border" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}>
            <Pin className="h-4 w-4" style={{ color: 'var(--info)' }} />
            <span className="text-sm" style={{ color: 'var(--info)' }}>2 new reports available in Fintech</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg border" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}>
            <Zap className="h-4 w-4" style={{ color: 'var(--primary)' }} />
            <span className="text-sm" style={{ color: 'var(--primary)' }}>Join 1 new syndicate in your sectors</span>
          </div>
        </div>
      </div>

      {/* Plan & Upgrade Visibility */}
      <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4" style={{ color: 'var(--info)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--card-foreground)' }}>
              {profile.currentPlan?.charAt(0).toUpperCase() + profile.currentPlan?.slice(1)} Plan
            </span>
          </div>
          {profile.currentPlan === 'free' && (
            <button 
              onClick={onUpgrade}
              className="text-xs px-3 py-1.5 rounded-md font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              Upgrade
            </button>
          )}
        </div>
        {profile.currentPlan === 'free' ? (
          <p className="text-xs" style={{ color: 'var(--info)' }}>
            Upgrade to unlock analyst insights & syndicate builder
          </p>
        ) : (
          <p className="text-xs" style={{ color: 'var(--success)' }}>
            Full access to all premium features
          </p>
        )}
      </div>
    </div>
  );
}