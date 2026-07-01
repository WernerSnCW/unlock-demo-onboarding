import { useEffect, useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import { ArcButton } from '@/components/ui/unlock/ArcButton';
import GridBackground from '@/components/onboarding-v2/GridBackground';
import { isInvestorMode, setAdminCode } from '@/lib/onboardingSync';
import unlockLogo from '@assets/unlock-logo.svg';

const GRANTED_KEY = 'unlock-access';

// Lightweight shared-code gate for the published demo. Off entirely unless the
// server has an ACCESS_CODE configured (status.required === false → open).
// Validated server-side; fails OPEN if the status check errors so a hiccup can't
// lock people out of a live demo. Not hardened auth — a stumble deterrent.
export default function AccessGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<'checking' | 'locked' | 'open'>('checking');
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Investor links (/i/:token) and an active investor session bypass the admin
    // gate entirely — the private token is their credential, not the admin code.
    if (window.location.pathname.startsWith('/i/') || isInvestorMode()) {
      setState('open');
      return;
    }
    if (sessionStorage.getItem(GRANTED_KEY) === 'granted') {
      setState('open');
      return;
    }
    fetch('/api/access/status')
      .then((r) => r.json())
      .then((d) => {
        if (!d?.required) {
          sessionStorage.setItem(GRANTED_KEY, 'granted');
          setState('open');
        } else {
          setState('locked');
        }
      })
      .catch(() => setState('open')); // fail open
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(false);
    try {
      const r = await fetch('/api/access/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const d = await r.json();
      if (d?.ok) {
        sessionStorage.setItem(GRANTED_KEY, 'granted');
        setAdminCode(code.trim()); // authorises admin API requests (x-access-code)
        setState('open');
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (state === 'checking') return null;
  if (state === 'open') return <>{children}</>;

  return (
    <div className="relative min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <GridBackground />
      <div className="relative z-10 w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <img src={unlockLogo} alt="Unlock" className="h-9 w-auto brightness-0 invert" />
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-xl)] p-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#00bb77]/12 border border-[#00bb77]/30 flex items-center justify-center">
              <Lock className="h-5 w-5 text-[var(--primary)]" />
            </div>
          </div>
          <h1 className="text-center text-xl font-semibold text-[var(--foreground)] mb-1">
            This demo is private
          </h1>
          <p className="text-center text-sm text-[var(--muted-foreground)] mb-6">
            Enter the access code to continue.
          </p>
          <form onSubmit={submit} className="space-y-3">
            <input
              autoFocus
              type="password"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError(false);
              }}
              placeholder="Access code"
              className="w-full text-center tracking-widest px-4 py-3 rounded-lg bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] outline-none focus:border-[var(--primary)] transition-colors placeholder:tracking-normal placeholder:text-[var(--muted-foreground)]"
              data-testid="access-code-input"
            />
            {error && (
              <p className="text-center text-sm text-[var(--destructive)]" data-testid="access-error">
                Incorrect code. Please try again.
              </p>
            )}
            <ArcButton variant="primary" type="submit" full disabled={submitting || !code.trim()}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Unlock'}
            </ArcButton>
          </form>
        </div>
        <p className="text-center text-xs text-[var(--muted-foreground)] mt-6">
          Unlock — structured decision support, not regulated financial advice.
        </p>
      </div>
    </div>
  );
}
