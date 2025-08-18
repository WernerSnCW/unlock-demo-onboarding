import { useState } from 'react';

interface NewsletterControlsProps {
  frequency: string;
  whatsappEnabled: boolean;
  onChangeFrequency: (frequency: string) => void;
  onToggleWhatsapp: (enabled: boolean) => void;
}

export default function NewsletterControls({
  frequency,
  whatsappEnabled,
  onChangeFrequency,
  onToggleWhatsapp
}: NewsletterControlsProps) {
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
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4 sticky top-4 z-10" style={{ boxShadow: 'var(--shadow-md)' }}>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="space-y-2">
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
          
          <div className="flex items-center gap-2">
            <label htmlFor="whatsapp-toggle-sticky" className="text-sm font-medium text-[var(--card-foreground)]">
              WhatsApp Alerts
            </label>
            <button
              id="whatsapp-toggle-sticky"
              onClick={handleWhatsappToggle}
              className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] ${
                whatsappEnabled ? 'bg-[var(--accent)]' : 'bg-[var(--muted)]'
              }`}
              aria-pressed={whatsappEnabled}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  whatsappEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
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