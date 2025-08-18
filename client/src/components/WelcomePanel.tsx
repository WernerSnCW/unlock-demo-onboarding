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
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--card-foreground)]">
          Welcome back, {profile.firstName}.
        </h2>
        
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium bg-[var(--primary)] text-[var(--primary-foreground)]">
            {profile.investorType.charAt(0).toUpperCase() + profile.investorType.slice(1)} Investor
          </span>
          <span className="inline-flex items-center px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium bg-[var(--muted)] text-[var(--muted-foreground)]">
            {profile.riskProfile.charAt(0).toUpperCase() + profile.riskProfile.slice(1)} Risk
          </span>
          <span className="inline-flex items-center px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium bg-[var(--muted)] text-[var(--muted-foreground)]">
            {profile.sectors[0]}
          </span>
        </div>

        <button 
          className="text-[var(--accent)] text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          disabled
        >
          Edit profile
        </button>

        <p className="text-xs text-[var(--muted-foreground)] bg-[var(--muted)] p-3 rounded-[var(--radius-sm)]">
          Free plan: Snapshot only. No advice.
        </p>
      </div>
    </div>
  );
}