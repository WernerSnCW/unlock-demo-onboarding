import { useState } from 'react';

interface AlertsPreferencesProps {
  frequency: string;
  whatsappEnabled: boolean;
  onChangeFrequency: (frequency: string) => void;
  onToggleWhatsapp: (enabled: boolean) => void;
}

export default function AlertsPreferences({
  frequency,
  whatsappEnabled,
  onChangeFrequency,
  onToggleWhatsapp
}: AlertsPreferencesProps) {
  const [showToast, setShowToast] = useState(false);

  const handleFrequencyChange = (newFreq: string) => {
    onChangeFrequency(newFreq);
    showSaveToast();
  };

  const handleWhatsappToggle = () => {
    onToggleWhatsapp(!whatsappEnabled);
    showSaveToast();
  };

  const showSaveToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <>
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <h3 className="text-lg font-semibold text-[var(--card-foreground)] mb-4">
          Alerts & Preferences
        </h3>
        
        {/* Newsletter Frequency */}
        <div className="space-y-3 mb-4">
          <label className="text-sm font-medium text-[var(--card-foreground)]">
            Newsletter Frequency
          </label>
          <div className="flex gap-1">
            {['daily', 'weekly', 'monthly'].map((freq) => (
              <button
                key={freq}
                onClick={() => handleFrequencyChange(freq)}
                className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] ${
                  frequency === freq
                    ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                    : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]'
                }`}
              >
                {freq.charAt(0).toUpperCase() + freq.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Channels */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-[var(--card-foreground)]">
            Channels
          </label>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1.5 rounded-[var(--radius-sm)] text-sm font-medium bg-[var(--muted)] text-[var(--muted-foreground)]">
              In-app
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-[var(--radius-sm)] text-sm font-medium bg-[var(--muted)] text-[var(--muted-foreground)]">
              Email
            </span>
            <button
              onClick={handleWhatsappToggle}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-sm)] text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] ${
                whatsappEnabled
                  ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]'
              }`}
            >
              WhatsApp
              {whatsappEnabled && (
                <span className="text-xs opacity-75">verify number soon</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-sm)] px-4 py-2 shadow-lg z-50">
          <span className="text-sm text-[var(--card-foreground)]">Preferences saved</span>
        </div>
      )}
    </>
  );
}