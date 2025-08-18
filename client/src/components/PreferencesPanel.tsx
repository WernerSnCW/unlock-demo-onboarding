import { useState } from 'react';

interface PreferencesPanelProps {
  preferences: {
    frequency: 'daily' | 'weekly' | 'monthly';
    channels: {
      email: boolean;
      whatsapp: boolean;
      pushNotifications: boolean;
    };
    sectors: string[];
    riskAppetite: ('low' | 'medium' | 'high')[];
    eisSeisEnabled: boolean;
  };
  onUpdatePreferences: (preferences: any) => void;
  onResetPreferences: () => void;
}

const availableSectors = ['Fintech', 'Biotech', 'AI', 'Cleantech', 'PropTech', 'HealthTech'];
const riskLevels = [
  { id: 'low', label: 'Low', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  { id: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  { id: 'high', label: 'High', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' }
];

export default function PreferencesPanel({ 
  preferences, 
  onUpdatePreferences, 
  onResetPreferences 
}: PreferencesPanelProps) {
  
  const [showToast, setShowToast] = useState(false);

  const showUpdateToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
    console.log({ 
      event: 'preferences_updated', 
      frequency: preferences.frequency,
      channels: preferences.channels,
      sectors: preferences.sectors,
      riskAppetite: preferences.riskAppetite,
      eisSeisEnabled: preferences.eisSeisEnabled
    });
  };

  const updateFrequency = (frequency: 'daily' | 'weekly' | 'monthly') => {
    onUpdatePreferences({ ...preferences, frequency });
    showUpdateToast();
    console.log({ event: 'newsletter_frequency_changed', value: frequency });
  };

  const updateChannels = (channel: keyof typeof preferences.channels, enabled: boolean) => {
    const newChannels = { ...preferences.channels, [channel]: enabled };
    onUpdatePreferences({ ...preferences, channels: newChannels });
    showUpdateToast();
    
    if (channel === 'whatsapp') {
      console.log({ event: 'whatsapp_alerts_toggled', value: enabled });
    }
  };

  const toggleSector = (sector: string) => {
    const newSectors = preferences.sectors.includes(sector) 
      ? preferences.sectors.filter(s => s !== sector)
      : [...preferences.sectors, sector];
    onUpdatePreferences({ ...preferences, sectors: newSectors });
    showUpdateToast();
  };

  const toggleRiskLevel = (risk: 'low' | 'medium' | 'high') => {
    const newRiskAppetite = preferences.riskAppetite.includes(risk)
      ? preferences.riskAppetite.filter(r => r !== risk)
      : [...preferences.riskAppetite, risk];
    onUpdatePreferences({ ...preferences, riskAppetite: newRiskAppetite });
    showUpdateToast();
  };

  const toggleEISSeisFilter = () => {
    onUpdatePreferences({ ...preferences, eisSeisEnabled: !preferences.eisSeisEnabled });
    showUpdateToast();
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-[var(--success)] text-[var(--success-foreground)] px-4 py-2 rounded-[var(--radius-md)] shadow-lg z-50 transition-all">
          <div className="flex items-center gap-2">
            <i className="fas fa-check-circle"></i>
            <span className="text-sm font-medium">Preferences updated</span>
          </div>
        </div>
      )}

      {/* Newsletter Frequency */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4">
        <h3 className="font-semibold text-[var(--card-foreground)] mb-4">Newsletter Frequency</h3>
        <div className="flex rounded-[var(--radius-sm)] bg-[var(--muted)] p-1" role="radiogroup" aria-label="Newsletter frequency">
          {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
            <button
              key={freq}
              onClick={() => updateFrequency(freq)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-[var(--radius-sm)] transition-colors ${
                preferences.frequency === freq
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--card-foreground)]'
              }`}
              role="radio"
              aria-checked={preferences.frequency === freq}
            >
              {freq.charAt(0).toUpperCase() + freq.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Channels */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4">
        <h3 className="font-semibold text-[var(--card-foreground)] mb-4">Alert Channels</h3>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Alert channels">
          {[
            { key: 'email', label: 'Email', icon: 'fa-envelope' },
            { key: 'whatsapp', label: 'WhatsApp', icon: 'fa-whatsapp' },
            { key: 'pushNotifications', label: 'Push', icon: 'fa-bell' }
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => updateChannels(key as keyof typeof preferences.channels, !preferences.channels[key as keyof typeof preferences.channels])}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                preferences.channels[key as keyof typeof preferences.channels]
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]'
              }`}
              aria-pressed={preferences.channels[key as keyof typeof preferences.channels]}
            >
              <i className={`fas ${icon} text-xs`}></i>
              {label}
            </button>
          ))}
        </div>
        {preferences.channels.whatsapp && (
          <p className="text-xs text-[var(--muted-foreground)] mt-3 p-2 bg-[var(--muted)] rounded-[var(--radius-sm)]">
            <i className="fas fa-info-circle mr-1"></i>
            Verification coming soon.
          </p>
        )}
      </div>

      {/* Sector Filters */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4">
        <h3 className="font-semibold text-[var(--card-foreground)] mb-4">Sector Filters</h3>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Sector filters">
          {availableSectors.map((sector) => (
            <button
              key={sector}
              onClick={() => toggleSector(sector)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                preferences.sectors.includes(sector)
                  ? 'bg-[var(--secondary)] text-[var(--secondary-foreground)]'
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]'
              }`}
              aria-pressed={preferences.sectors.includes(sector)}
            >
              <i className={`fas ${preferences.sectors.includes(sector) ? 'fa-check-circle' : 'fa-circle'} text-xs`}></i>
              {sector}
            </button>
          ))}
        </div>
      </div>

      {/* Risk Appetite Filters */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4">
        <h3 className="font-semibold text-[var(--card-foreground)] mb-4">Risk Appetite</h3>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Risk appetite filters">
          {riskLevels.map((risk) => (
            <button
              key={risk.id}
              onClick={() => toggleRiskLevel(risk.id as 'low' | 'medium' | 'high')}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                preferences.riskAppetite.includes(risk.id as 'low' | 'medium' | 'high')
                  ? risk.color
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]'
              }`}
              aria-pressed={preferences.riskAppetite.includes(risk.id as 'low' | 'medium' | 'high')}
            >
              <i className={`fas ${preferences.riskAppetite.includes(risk.id as 'low' | 'medium' | 'high') ? 'fa-check-circle' : 'fa-circle'} text-xs`}></i>
              {risk.label}
            </button>
          ))}
        </div>
      </div>

      {/* EIS/SEIS Toggle */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[var(--card-foreground)]">EIS/SEIS Updates</h3>
            <p className="text-sm text-[var(--muted-foreground)]">Show tax-efficient investment updates</p>
          </div>
          <button
            onClick={toggleEISSeisFilter}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 ${
              preferences.eisSeisEnabled ? 'bg-[var(--primary)]' : 'bg-[var(--muted)]'
            }`}
            role="switch"
            aria-checked={preferences.eisSeisEnabled}
            aria-label="Toggle EIS/SEIS updates"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                preferences.eisSeisEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Reset Button */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4">
        <button
          onClick={onResetPreferences}
          className="w-full px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] border border-[var(--border)] rounded-[var(--radius-sm)] hover:bg-[var(--muted)] hover:text-[var(--card-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 transition-colors"
        >
          <i className="fas fa-undo mr-2"></i>
          Reset to Defaults
        </button>
      </div>
      
      {/* Live Region for Accessibility */}
      <div aria-live="polite" aria-label="Preferences status" className="sr-only">
        {showToast && 'Preferences have been updated'}
      </div>
    </div>
  );
}