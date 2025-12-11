import { useState } from 'react';
import { Link } from 'wouter';
import { User, Settings, Mail, MessageCircle, TrendingUp, Eye, HelpCircle, Users, Crown, Star, Award, Edit3, Bell, PinIcon as Pin, Zap, PieChart, Home, Briefcase, Rocket } from 'lucide-react';
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
      <div className="flex items-start gap-4 mb-6">
        <div className="relative">
          {profile.profilePicture ? (
            <img 
              src={profile.profilePicture} 
              alt={`${profile.firstName}'s profile`}
              className="w-16 h-16 rounded-full object-cover border-3 border-[var(--border)]"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary)]/10 to-[var(--primary)]/20 border-3 border-[var(--border)] flex items-center justify-center">
              <User className="h-8 w-8 text-[var(--primary)]" />
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[var(--success)] rounded-full border-2 border-[var(--card)]"></div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-bold text-[var(--card-foreground)]">
              Welcome back, {profile.firstName}
            </h2>
            {profile.currentPlan === 'free' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                ⓘ Free
              </span>
            )}
          </div>
          {profile.email && (
            <p className="text-sm text-[var(--muted-foreground)] mb-3">{profile.email}</p>
          )}
          
          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            {/* Investor Type */}
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--secondary)', color: 'var(--secondary)' }}>
              {profile.investorType?.charAt(0).toUpperCase() + profile.investorType?.slice(1)} Investor
            </span>
            
            {/* Badges */}
            {profile.badges && profile.badges.length > 0 && profile.badges.map((badge, index) => (
              <span key={index} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: getBadgeBackground(badge), color: getBadgeColor(badge) }}>
                {getBadgeIcon(badge)}
                {badge}
              </span>
            ))}
          </div>
        </div>
        <button 
          className="p-2 text-[var(--muted-foreground)] hover:text-[var(--primary)] rounded-[var(--radius-sm)] hover:bg-[var(--muted)] transition-colors"
          disabled
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      {/* Investment Activity Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-left p-4 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Reports this month</div>
          <div className="text-2xl font-bold mt-1" style={{ color: 'var(--card-foreground)' }}>{profile.reportsViewed}</div>
          <div className="flex items-center mt-1">
            <Eye className="h-3 w-3 mr-1" style={{ color: 'var(--muted-foreground)' }} />
          </div>
        </div>
        <div className="text-left p-4 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Questions asked</div>
          <div className="text-2xl font-bold mt-1" style={{ color: 'var(--card-foreground)' }}>{profile.questionsAsked}</div>
          <div className="flex items-center mt-1">
            <HelpCircle className="h-3 w-3 mr-1" style={{ color: 'var(--muted-foreground)' }} />
          </div>
        </div>
        <div className="text-left p-4 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Syndicates joined</div>
          <div className="text-2xl font-bold mt-1" style={{ color: 'var(--card-foreground)' }}>{profile.syndicatesJoined}</div>
          <div className="flex items-center mt-1">
            <Users className="h-3 w-3 mr-1" style={{ color: 'var(--muted-foreground)' }} />
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

      {/* Quick Controls */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--card-foreground)' }}>Quick Controls</h3>
          <button className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">
            <Settings className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3">
          {/* Email Alerts Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--card-foreground)' }}>Email Alerts</span>
            </div>
            <div className="w-12 h-6 rounded-full relative transition-all duration-200" style={{ backgroundColor: 'var(--success)' }}>
              <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 translate-x-6"></div>
            </div>
          </div>

          {/* WhatsApp Alerts */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--card-foreground)' }}>WhatsApp Alerts</span>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-all duration-200 ${profile.whatsappAlerts ? 'bg-[var(--success)]' : 'bg-[var(--border)]'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${
                profile.whatsappAlerts ? 'translate-x-6 left-1' : 'left-1'
              }`}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Try Onboarding Demo */}
      <div className="p-6 rounded-xl mb-6" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}>
        <div className="flex items-center gap-3 mb-2">
          <Rocket className="h-5 w-5 text-white" />
          <h3 className="text-lg font-semibold text-white">
            Try Investor Onboarding
          </h3>
        </div>
        <p className="text-sm mb-4 text-white/80">
          Experience our new streamlined onboarding flow designed for investors.
        </p>
        <Link href="/onboarding-v2/welcome">
          <button 
            className="w-full py-3 px-4 rounded-xl font-medium hover:opacity-90 transition-opacity bg-white text-[var(--primary)]"
            data-testid="button-start-onboarding-v2"
          >
            Start Onboarding Demo
          </button>
        </Link>
      </div>

      {/* Upgrade to PRO */}
      {profile.currentPlan === 'free' && (
        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--muted)' }}>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--card-foreground)' }}>
            Upgrade to PRO
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
            to get access to all features! Connect with Venus World!
          </p>
          <button 
            onClick={onUpgrade}
            className="w-full py-3 px-4 rounded-xl font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--card)', color: 'var(--card-foreground)', border: '1px solid var(--border)' }}
          >
            Upgrade
          </button>
        </div>
      )}
    </div>
  );
}