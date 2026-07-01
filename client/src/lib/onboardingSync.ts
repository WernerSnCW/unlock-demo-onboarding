// Server-side persistence for onboarding sessions.
//
// Two modes:
// • Investor mode — the app is bound to ONE session via a private token
//   (from a /i/:token link). All reads/writes go to /api/onboarding-v2/i/:token
//   and can only ever touch that investor's own session.
// • Admin (advisor) mode — Tom/Werner, unlocked by the admin access code. Can
//   list every investor and open any of them; requests carry the code as an
//   x-access-code header.
import { useOnboardingV2Store } from '@/state/onboardingV2Store';

const ACTIVE_KEY = 'onboarding-v2-session-id';   // admin/demo: active row id
const TOKEN_KEY = 'onboarding-v2-investor-token'; // investor: their private token
const ADMIN_KEY = 'onboarding-v2-admin-code';     // advisor: admin code for headers

// The data slices that make up a session (must match the store + persist set).
const DATA_KEYS = ['intake', 'holdings', 'summary', 'analysis', 'beliefs', 'scenario'] as const;

export interface SessionSummary {
  id: string;
  token: string | null;
  investorName: string;
  email: string | null;
  currentStep: string | null;
  status: string | null;
  updatedAt: string | null;
}

export type SaveResult =
  | { ok: true; id?: string }
  | { ok: false; reason: 'no-db' | 'empty' | 'error' };

// ---- mode / credential helpers ----
export function getActiveSessionId(): string | null { return localStorage.getItem(ACTIVE_KEY); }
export function setActiveSessionId(id: string | null): void {
  if (id) localStorage.setItem(ACTIVE_KEY, id); else localStorage.removeItem(ACTIVE_KEY);
}
export function getInvestorToken(): string | null { return sessionStorage.getItem(TOKEN_KEY); }
export function setInvestorToken(token: string | null): void {
  if (token) sessionStorage.setItem(TOKEN_KEY, token); else sessionStorage.removeItem(TOKEN_KEY);
}
export function isInvestorMode(): boolean { return Boolean(getInvestorToken()); }
export function getAdminCode(): string | null { return sessionStorage.getItem(ADMIN_KEY); }
export function setAdminCode(code: string | null): void {
  if (code) sessionStorage.setItem(ADMIN_KEY, code); else sessionStorage.removeItem(ADMIN_KEY);
}

function adminHeaders(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  const code = getAdminCode();
  if (code) h['x-access-code'] = code;
  return h;
}

function snapshot(): Record<string, unknown> {
  const state = useOnboardingV2Store.getState() as unknown as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  for (const k of DATA_KEYS) data[k] = state[k];
  return data;
}

function currentName(): string {
  const s = useOnboardingV2Store.getState() as any;
  return (s.intake?.full_name || '').trim();
}

// A session snapshot captured mid-analysis stores status 'loading'; the Analysis
// page only auto-runs from 'idle', so reset a stale loading/error state on load.
function normalizeAnalysis(data: any): void {
  if (data?.analysis && (data.analysis.status === 'loading' || data.analysis.status === 'error')) {
    data.analysis = { ...data.analysis, status: 'idle' };
  }
}

// Only worth persisting (in admin/demo mode) once there's an identifiable
// investor or real holdings — avoids junk rows from the welcome/method steps.
function hasMeaningfulData(): { has: boolean; investorName: string; email: string | null } {
  const s = useOnboardingV2Store.getState() as any;
  const name = currentName();
  const hasHoldings = Array.isArray(s.holdings) && s.holdings.some((h: any) => (h?.value_gbp || 0) > 0);
  return { has: Boolean(name) || hasHoldings, investorName: name || 'Unnamed investor', email: s.intake?.email || null };
}

export async function saveCurrentSession(
  currentStep: string,
  status: 'in_progress' | 'completed' = 'in_progress',
): Promise<SaveResult> {
  const token = getInvestorToken();

  // Investor mode — always save to their own token-scoped session.
  if (token) {
    const name = currentName();
    const body = {
      state: JSON.stringify(snapshot()),
      currentStep,
      status,
      ...(name ? { investorName: name } : {}),
    };
    try {
      const res = await fetch('/api/onboarding-v2/i/' + token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.status === 503) return { ok: false, reason: 'no-db' };
      if (!res.ok) return { ok: false, reason: 'error' };
      return { ok: true };
    } catch {
      return { ok: false, reason: 'error' };
    }
  }

  // Admin / demo mode — upsert by id (advisor's own walkthrough).
  const { has, investorName, email } = hasMeaningfulData();
  if (!has) return { ok: false, reason: 'empty' };
  const id = getActiveSessionId() || undefined;
  const body = { ...(id ? { id } : {}), investorName, email, state: JSON.stringify(snapshot()), currentStep, status };
  try {
    const res = await fetch('/api/onboarding-v2/sessions', {
      method: 'POST',
      headers: adminHeaders(),
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

// ---- admin (advisor) ----
export async function listSessions(): Promise<{ ok: boolean; noDb?: boolean; sessions: SessionSummary[] }> {
  try {
    const res = await fetch('/api/onboarding-v2/sessions', { headers: adminHeaders() });
    if (res.status === 503) return { ok: false, noDb: true, sessions: [] };
    if (!res.ok) return { ok: false, sessions: [] };
    return { ok: true, sessions: await res.json() };
  } catch {
    return { ok: false, sessions: [] };
  }
}

export async function loadSession(id: string): Promise<{ ok: boolean; currentStep?: string }> {
  try {
    const res = await fetch('/api/onboarding-v2/sessions/' + id, { headers: adminHeaders() });
    if (!res.ok) return { ok: false };
    const session = await res.json();
    const data = JSON.parse(session.state);
    normalizeAnalysis(data);
    useOnboardingV2Store.setState(data);
    setActiveSessionId(session.id);
    return { ok: true, currentStep: session.currentStep || '/onboarding-v2/welcome' };
  } catch {
    return { ok: false };
  }
}

// Advisor creates an investor and gets their private token to build a link.
export async function createInvestor(
  investorName: string,
  email?: string,
): Promise<{ ok: boolean; noDb?: boolean; token?: string; id?: string }> {
  try {
    const res = await fetch('/api/onboarding-v2/investors', {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify({ investorName, email: email || null }),
    });
    if (res.status === 503) return { ok: false, noDb: true };
    if (!res.ok) return { ok: false };
    const d = await res.json();
    return { ok: true, token: d.token, id: d.id };
  } catch {
    return { ok: false };
  }
}

// ---- investor (token-scoped) ----
export async function loadInvestorSession(
  token: string,
): Promise<{ ok: boolean; noDb?: boolean; currentStep?: string }> {
  try {
    const res = await fetch('/api/onboarding-v2/i/' + token);
    if (res.status === 503) return { ok: false, noDb: true };
    if (!res.ok) return { ok: false };
    const session = await res.json();
    let data: any = {};
    try { data = session.state ? JSON.parse(session.state) : {}; } catch { data = {}; }
    normalizeAnalysis(data);
    if (data && Object.keys(data).length) useOnboardingV2Store.setState(data);
    setInvestorToken(token);
    return { ok: true, currentStep: session.currentStep || '/onboarding-v2/welcome' };
  } catch {
    return { ok: false };
  }
}

// Begin a brand-new investor (admin/demo only): clear the active session + reset.
export function startNewInvestor(): void {
  setActiveSessionId(null);
  const s = useOnboardingV2Store.getState() as any;
  if (typeof s.resetOnboarding === 'function') s.resetOnboarding();
}

// Full logout: clear admin session, any active investor, and the local session
// id, then send the browser back to the code screen.
export function logout(): void {
  sessionStorage.removeItem('unlock-access');
  setAdminCode(null);
  setInvestorToken(null);
  setActiveSessionId(null);
  window.location.href = '/';
}
