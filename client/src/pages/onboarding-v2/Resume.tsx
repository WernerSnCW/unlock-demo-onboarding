import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { UserPlus, Clock, ArrowRight, Loader2, Database } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArcButton } from '@/components/ui/unlock/ArcButton';
import { ONBOARDING_STEPS } from '@/components/onboarding-v2/StepIndicator';
import { listSessions, loadSession, startNewInvestor, type SessionSummary } from '@/lib/onboardingSync';

function stepLabel(path: string | null): string {
  if (!path) return 'Not started';
  const step = ONBOARDING_STEPS.find((s) => s.path === path || s.id === path);
  return step ? step.label : path.replace('/onboarding-v2/', '');
}

function formatWhen(iso: string | null): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return '';
  }
}

export default function Resume() {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(true);
  const [noDb, setNoDb] = useState(false);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [resumingId, setResumingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    listSessions().then((r) => {
      if (!active) return;
      setNoDb(Boolean(r.noDb));
      setSessions(r.sessions);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const onStartNew = () => {
    startNewInvestor();
    navigate('/onboarding-v2/welcome');
  };

  const onResume = async (id: string) => {
    setResumingId(id);
    const r = await loadSession(id);
    if (r.ok && r.currentStep) navigate(r.currentStep);
    else setResumingId(null);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-10">
        <div className="text-center mb-8">
          <p className="u-eyebrow mb-3">Resume</p>
          <h1 className="text-4xl font-light tracking-tight text-[var(--foreground)] mb-3">
            Continue a saved investor
          </h1>
          <p className="text-lg leading-relaxed text-[var(--muted-foreground)] max-w-xl mx-auto">
            Pick up where you left off, or start a new investor from scratch.
          </p>
          <div className="u-divider mt-6 max-w-xs mx-auto" />
        </div>

        <div className="flex justify-center mb-8">
          <ArcButton variant="primary" onClick={onStartNew} data-testid="button-start-new-investor">
            <UserPlus className="w-4 h-4" />
            Start new investor
          </ArcButton>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 text-[var(--muted-foreground)] py-10">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading saved sessions…
          </div>
        )}

        {!loading && noDb && (
          <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-5 text-sm text-[var(--muted-foreground)]">
            <Database className="w-5 h-5 mt-0.5 text-[var(--warning)] shrink-0" />
            <div>
              <p className="font-medium text-[var(--foreground)] mb-1">Server storage is off</p>
              <p>
                No database is connected, so saved sessions can't be listed here. The onboarding flow
                still works and autosaves to this browser — provision a database to enable resuming
                across devices.
              </p>
            </div>
          </div>
        )}

        {!loading && !noDb && sessions.length === 0 && (
          <p className="text-center text-[var(--muted-foreground)] py-10">
            No saved sessions yet. Start a new investor above — progress autosaves from the intake step.
          </p>
        )}

        {!loading && !noDb && sessions.length > 0 && (
          <ul className="space-y-3" data-testid="session-list">
            {sessions.map((s) => (
              <li
                key={s.id}
                className="u-hover-lift flex items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-5"
                data-testid={`session-row-${s.id}`}
              >
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--foreground)] truncate">{s.investorName}</p>
                  <p className="text-sm text-[var(--muted-foreground)] flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatWhen(s.updatedAt)}
                    </span>
                    <span aria-hidden>·</span>
                    <span>Last step: {stepLabel(s.currentStep)}</span>
                  </p>
                </div>
                <ArcButton
                  variant="outline"
                  onClick={() => onResume(s.id)}
                  disabled={resumingId === s.id}
                  data-testid={`button-resume-${s.id}`}
                >
                  {resumingId === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Resume <ArrowRight className="w-4 h-4" /></>}
                </ArcButton>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  );
}
