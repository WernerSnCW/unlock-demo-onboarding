import { useState } from 'react';

interface Profile {
  firstName: string;
  investorType: "angel" | "syndicate" | "advisor" | "other";
  sectors: string[];
  riskProfile: "low" | "medium" | "high";
  newsletterFrequency: "daily" | "weekly" | "monthly";
  whatsappAlerts: boolean;
}

interface WelcomePanelProps {
  profile?: Profile;
  onChangePreferences?: (preferences: { newsletterFrequency: string; whatsappAlerts: boolean }) => void;
}

export default function WelcomePanel({ profile, onChangePreferences }: WelcomePanelProps) {
  if (!profile) {
    return (
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-[var(--card-foreground)] mb-4">
            Get Started
          </h2>
          <p className="text-[var(--muted-foreground)] mb-6">
            Complete 2-min onboarding to personalise your feed
          </p>
          <button 
            className="bg-[var(--primary)] text-[var(--primary-foreground)] px-6 py-2.5 rounded-[var(--radius-sm)] font-medium hover:opacity-90 transition-opacity"
            disabled
          >
            Complete Onboarding
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[var(--card-foreground)] mb-4">
          Welcome back, {profile.firstName}.
        </h2>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center px-3 py-1.5 rounded-[var(--radius-sm)] text-sm font-medium bg-[var(--primary)] text-[var(--primary-foreground)]">
            {profile.investorType.charAt(0).toUpperCase() + profile.investorType.slice(1)} Investor
          </span>
          <span className="inline-flex items-center px-3 py-1.5 rounded-[var(--radius-sm)] text-sm font-medium bg-[var(--muted)] text-[var(--muted-foreground)]">
            {profile.riskProfile.charAt(0).toUpperCase() + profile.riskProfile.slice(1)} Risk
          </span>
          <span className="inline-flex items-center px-3 py-1.5 rounded-[var(--radius-sm)] text-sm font-medium bg-[var(--muted)] text-[var(--muted-foreground)]">
            {profile.sectors[0]}
          </span>
        </div>

        {/* Profile completeness bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[var(--muted-foreground)]">Profile completeness</span>
            <span className="text-xs text-[var(--muted-foreground)]">75%</span>
          </div>
          <div className="w-full bg-[var(--muted)] rounded-full h-2">
            <div className="bg-[var(--success)] h-2 rounded-full" style={{ width: '75%' }}></div>
          </div>
        </div>

        <button 
          className="text-[var(--accent)] text-sm font-medium hover:underline mb-4"
          disabled
        >
          Improve my feed →
        </button>

        <p className="text-xs text-[var(--muted-foreground)] bg-[var(--muted)] p-3 rounded-[var(--radius-sm)]">
          Free plan: Snapshot diligence only. No investment advice.
        </p>
      </div>
    </div>
  );
}