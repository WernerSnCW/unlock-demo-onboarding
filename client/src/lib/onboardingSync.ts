// Server-side persistence for onboarding sessions so an interrupted investor
// can be resumed later (selected by name from a list). Autosaves a snapshot of
// the store on each step. Best-effort: if no database is configured the API
// returns 503 and the flow continues on browser localStorage alone.
import { useOnboardingV2Store } from '@/state/onboardingV2Store';

const ACTIVE_KEY = 'onboarding-v2-session-id';

// The data slices that make up a session (must match the store + persist set).
const DATA_KEYS = ['intake', 'holdings', 'summary', 'analysis', 'beliefs', 'scenario'] as const;

export interface SessionSummary {
  id: string;
  investorName: string;
  email: string | null;
  currentStep: string | null;
  status: string | null;
  updatedAt: string | null;
}

export type SaveResult =
  | { ok: true; id: string }
  | { ok: false; reason: 'no-db' | 'empty' | 'error' };

export function getActiveSessionId(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}

export function setActiveSessionId(id: string | null): void {
  if (id) localStorage.setItem(ACTIVE_KEY, id);
  else localStorage.removeItem(ACTIVE_KEY);
}

function snapshot(): Record<string, unknown> {
  const state = useOnboardingV2Store.getState() as unknown as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  for (const k of DATA_KEYS) data[k] = state[k];
  return data;
}

// Only worth persisting once there's an identifiable investor or real holdings —
// avoids junk "Unnamed investor" rows from the welcome/method steps.
function hasMeaningfulData(): { has: boolean; investorName: string; email: string | null } {
  const s = useOnboardingV2Store.getState() as any;
  const name = (s.intake?.full_name || '').trim();
  const hasHoldings = Array.isArray(s.holdings) && s.holdings.some((h: any) => (h?.value_gbp || 0) > 0);
  return { has: Boolean(name) || hasHoldings, investorName: name || 'Unnamed investor', email: s.intake?.email || null };
}

export async function saveCurrentSession(currentStep: string): Promise<SaveResult> {
  const { has, investorName, email } = hasMeaningfulData();
  if (!has) return { ok: false, reason: 'empty' };

  const id = getActiveSessionId() || undefined;
  const body = {
    ...(id ? { id } : {}),
    investorName,
    email,
    state: JSON.stringify(snapshot()),
    currentStep,
    status: 'in_progress',
  };

  try {
    const res = await fetch('/api/onboarding-v2/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.status === 503) return { ok: false, reason: 'no-db' };
    if (!res.ok) return { ok: false, reason: 'error' };
    const saved = await res.json();
    if (saved?.id) setActiveSessionId(saved.id);
    return { ok: true, id: saved.id };
  } catch {
    return { ok: false, reason: 'error' };
  }
}

export async function listSessions(): Promise<{ ok: boolean; noDb?: boolean; sessions: SessionSummary[] }> {
  try {
    const res = await fetch('/api/onboarding-v2/sessions');
    if (res.status === 503) return { ok: false, noDb: true, sessions: [] };
    if (!res.ok) return { ok: false, sessions: [] };
    return { ok: true, sessions: await res.json() };
  } catch {
    return { ok: false, sessions: [] };
  }
}

// Loads a saved session into the store and marks it active so subsequent
// autosaves update the same row. Returns the step to resume at.
export async function loadSession(id: string): Promise<{ ok: boolean; currentStep?: string }> {
  try {
    const res = await fetch('/api/onboarding-v2/sessions/' + id);
    if (!res.ok) return { ok: false };
    const session = await res.json();
    const data = JSON.parse(session.state);
    // If the snapshot was captured while the Analysis step was still computing,
    // its status is a stale 'loading'/'error' — the Analysis page only auto-runs
    // from 'idle', so reset it so resuming re-runs instead of hanging on the
    // spinner. A completed analysis is left as-is (shows results immediately).
    if (data?.analysis && (data.analysis.status === 'loading' || data.analysis.status === 'error')) {
      data.analysis = { ...data.analysis, status: 'idle' };
    }
    useOnboardingV2Store.setState(data);
    setActiveSessionId(session.id);
    return { ok: true, currentStep: session.currentStep || '/onboarding-v2/welcome' };
  } catch {
    return { ok: false };
  }
}

// Begin a brand-new investor: clear the active session and reset the store so
// the next autosave creates a fresh row instead of overwriting the previous one.
export function startNewInvestor(): void {
  setActiveSessionId(null);
  const s = useOnboardingV2Store.getState() as any;
  if (typeof s.resetOnboarding === 'function') s.resetOnboarding();
}
