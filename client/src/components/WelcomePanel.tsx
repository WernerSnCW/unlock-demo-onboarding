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
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-6 shadow-md">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-[var(--card-foreground)] mb-4">
            Get Started
          </h2>
          <p className="text-[var(--muted-foreground)] mb-6">
            Complete 2-min onboarding to personalise your feed
          </p>
          <button 
            className="bg-[var(--primary)] text-[var(--primary-foreground)] px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
            disabled
          >
            Complete Onboarding
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-6 shadow-md">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-[var(--card-foreground)] mb-2">
          Welcome back, {profile.firstName}.
        </h2>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[var(--primary)] text-[var(--primary-foreground)]">
            {profile.investorType.charAt(0).toUpperCase() + profile.investorType.slice(1)} Investor
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[var(--secondary)] text-[var(--secondary-foreground)]">
            {profile.riskProfile.charAt(0).toUpperCase() + profile.riskProfile.slice(1)} Risk
          </span>
          {profile.sectors.slice(0, 2).map((sector) => (
            <span key={sector} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[var(--accent)] text-[var(--accent-foreground)]">
              {sector}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-[var(--muted)] text-[var(--muted-foreground)]">
            Newsletter: {profile.newsletterFrequency}
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-[var(--muted)] text-[var(--muted-foreground)]">
            WhatsApp: {profile.whatsappAlerts ? 'On' : 'Off'}
          </span>
        </div>

        <button 
          className="text-[var(--primary)] text-sm hover:underline mb-4"
          disabled
        >
          Edit profile
        </button>

        <p className="text-xs text-[var(--muted-foreground)] bg-[var(--muted)] p-3 rounded">
          Free plan: Snapshot diligence only. No investment advice.
        </p>
      </div>
    </div>
  );
}