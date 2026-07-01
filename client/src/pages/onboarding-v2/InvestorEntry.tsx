import { useEffect, useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Loader2, AlertTriangle } from 'lucide-react';
import GridBackground from '@/components/onboarding-v2/GridBackground';
import { loadInvestorSession } from '@/lib/onboardingSync';
import unlockLogo from '@assets/unlock-logo.svg';

// Landing for an investor's private link (/i/:token). Loads only their own
// session (the token is the credential), then drops them into their flow.
export default function InvestorEntry() {
  const [, params] = useRoute('/i/:token');
  const [, navigate] = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = params?.token;
    if (!token) {
      setError('This link is invalid. Please check with your adviser.');
      return;
    }
    let active = true;
    loadInvestorSession(token).then((r) => {
      if (!active) return;
      if (r.ok && r.currentStep) {
        navigate(r.currentStep);
      } else if (r.noDb) {
        setError('This link is not available right now. Please try again shortly.');
      } else {
        setError('This link is invalid or has expired. Please check with your adviser.');
      }
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.token]);

  return (
    <div className="relative min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <GridBackground />
      <div className="relative z-10 text-center">
        <img src={unlockLogo} alt="Unlock" className="h-9 w-auto brightness-0 invert mx-auto mb-8" />
        {!error ? (
          <div className="flex flex-col items-center gap-3 text-[var(--muted-foreground)]">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            <p>Loading your session…</p>
          </div>
        ) : (
          <div className="max-w-sm mx-auto rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-8">
            <AlertTriangle className="w-10 h-10 text-[var(--warning)] mx-auto mb-4" />
            <h1 className="text-lg font-semibold text-[var(--foreground)] mb-2">Link not available</h1>
            <p className="text-sm text-[var(--muted-foreground)]">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
