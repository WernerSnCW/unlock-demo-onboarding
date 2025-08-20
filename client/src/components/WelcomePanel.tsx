import { useState } from 'react';
import { User, Settings, Mail, MessageCircle, TrendingUp, Eye, HelpCircle, Users, Crown, Star, Award, Edit3, Bell, PinIcon as Pin, Zap } from 'lucide-react';

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
}

interface WelcomePanelProps {
  profile?: Profile;
  onChangePreferences?: (preferences: { newsletterFrequency: string; whatsappAlerts: boolean }) => void;
  onEditSectors?: () => void;
  onUpgrade?: () => void;
}

export default function WelcomePanel({ profile, onChangePreferences, onEditSectors, onUpgrade }: WelcomePanelProps) {
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
      case 'Active Contributor': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Early Adopter': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
      {/* Header with Profile Picture and Name */}
      <div className="flex items-center gap-4 mb-5">
        <div className="relative">
          {profile.profilePicture ? (
            <img 
              src={profile.profilePicture} 
              alt={`${profile.firstName}'s profile`}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Welcome back, {profile.firstName}.
          </h2>
          {profile.email && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>
          )}
        </div>
        <button 
          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
          disabled
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      {/* Profile Tags with Trust Signals */}
      <div className="flex flex-wrap gap-2 mb-5">
        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: '#5193B3' }}>
          {profile.investorType?.charAt(0).toUpperCase() + profile.investorType?.slice(1)} Investor
        </span>
        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
          {profile.riskProfile?.charAt(0).toUpperCase() + profile.riskProfile?.slice(1)} Risk
        </span>
        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
          {profile.sectors?.[0]}
        </span>
        {/* Reputation Score */}
        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: '#62C4C3', color: 'white' }}>
          <TrendingUp className="h-3 w-3" />
          Rep: {profile.reputationScore}
        </span>
      </div>

      {/* Badges */}
      {profile.badges && profile.badges.length > 0 && (
        <div className="mb-5">
          <div className="flex flex-wrap gap-2">
            {profile.badges.map((badge, index) => (
              <span key={index} className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${getBadgeColor(badge)}`}>
                {getBadgeIcon(badge)}
                {badge}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Investment Activity Snapshot */}
      <div className="mb-5">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Investment Activity</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">{profile.reportsViewed}</div>
            <div className="text-xs text-blue-600 dark:text-blue-400">Reports this month</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <HelpCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-lg font-semibold text-green-600 dark:text-green-400">{profile.questionsAsked}</div>
            <div className="text-xs text-green-600 dark:text-green-400">Questions asked</div>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">{profile.syndicatesJoined}</div>
            <div className="text-xs text-purple-600 dark:text-purple-400">Syndicates joined</div>
          </div>
        </div>
      </div>

      {/* Portfolio Summary */}
      {profile.totalHoldingsValue && (
        <div className="mb-5">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Portfolio Summary</h3>
          <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Holdings</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">{profile.totalHoldingsValue}</span>
            </div>
            {profile.topSector && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Top Sector</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {profile.topSector.name} {profile.topSector.percentage}%
                </span>
              </div>
            )}
            {profile.portfolioLastUpdated && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Last updated: {profile.portfolioLastUpdated}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Preferences & Controls */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Quick Controls</h3>
          <button 
            onClick={onEditSectors}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1"
          >
            <Edit3 className="h-3 w-3" />
            Edit Sectors
          </button>
        </div>
        <div className="space-y-2">
          {/* Email Alerts Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Email Alerts</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {profile.newsletterFrequency?.charAt(0).toUpperCase() + profile.newsletterFrequency?.slice(1)}
              </span>
              <div className="w-6 h-3 bg-green-500 rounded-full relative">
                <div className="absolute top-0.5 w-2 h-2 bg-white rounded-full translate-x-3"></div>
              </div>
            </div>
          </div>

          {/* WhatsApp Alerts */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">WhatsApp Alerts</span>
            </div>
            <div className={`w-6 h-3 rounded-full relative transition-colors ${
              profile.whatsappAlerts ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}>
              <div className={`absolute top-0.5 w-2 h-2 bg-white rounded-full transition-transform ${
                profile.whatsappAlerts ? 'translate-x-3' : 'translate-x-0.5'
              }`}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Nudges */}
      <div className="mb-5">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">For You</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <Pin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-blue-700 dark:text-blue-300">2 new reports available in Fintech</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm text-purple-700 dark:text-purple-300">Join 1 new syndicate in your sectors</span>
          </div>
        </div>
      </div>

      {/* Plan & Upgrade Visibility */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {profile.currentPlan?.charAt(0).toUpperCase() + profile.currentPlan?.slice(1)} Plan
            </span>
          </div>
          {profile.currentPlan === 'free' && (
            <button 
              onClick={onUpgrade}
              className="text-xs bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1.5 rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              Upgrade
            </button>
          )}
        </div>
        {profile.currentPlan === 'free' ? (
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Upgrade to unlock analyst insights & syndicate builder
          </p>
        ) : (
          <p className="text-xs text-green-700 dark:text-green-300">
            Full access to all premium features
          </p>
        )}
      </div>
    </div>
  );
}