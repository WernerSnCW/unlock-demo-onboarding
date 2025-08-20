import { useState } from 'react';
import { User, Settings, Mail, MessageCircle } from 'lucide-react';

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
}

interface WelcomePanelProps {
  profile?: Profile;
  onChangePreferences?: (preferences: { newsletterFrequency: string; whatsappAlerts: boolean }) => void;
}

export default function WelcomePanel({ profile, onChangePreferences }: WelcomePanelProps) {
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

      {/* Profile Tags */}
      <div className="flex flex-wrap gap-2 mb-5">
        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: '#5193B3' }}>
          {profile.investorType.charAt(0).toUpperCase() + profile.investorType.slice(1)} Investor
        </span>
        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
          {profile.riskProfile.charAt(0).toUpperCase() + profile.riskProfile.slice(1)} Risk
        </span>
        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
          {profile.sectors[0]}
        </span>
      </div>

      {/* Active Preferences */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Active Preferences</h3>
        <div className="space-y-2">
          {/* Newsletter Frequency */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Newsletter</span>
            </div>
            <span className="text-sm font-medium px-2 py-1 rounded-md text-white" style={{ backgroundColor: '#F8D49B', color: '#8B5B00' }}>
              {profile.newsletterFrequency.charAt(0).toUpperCase() + profile.newsletterFrequency.slice(1)}
            </span>
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

      {/* Plan Status */}
      <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
        <p className="text-xs text-orange-700 dark:text-orange-300 font-medium">
          Free plan: Snapshot only. No advice.
        </p>
      </div>
    </div>
  );
}