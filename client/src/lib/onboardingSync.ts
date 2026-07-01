// Server-side persistence for onboarding sessions.
//
// Two modes:
// • Investor mode — the app is bound to ONE session via a private token
//   (from a /i/:token link). All reads/writes go to /api/onboarding-v2/i/:token
//   and can only ever touch that investor's own session.
// • Admin (advisor) mode — Tom/Werner, unlocked by the admin access code. Can
//   list every investor and open any of them; requests carry the code as an
//   x-access-code header.
import { useOnboardingV2Store, type Holding } from '@/state/onboardingV2Store';

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
// Active session id is PER-TAB (sessionStorage), not localStorage: two admin
// windows must not share one "active investor" or a save in one clobbers the
// other's row. (Investor token is likewise per-tab.)
export function getActiveSessionId(): string | null { return sessionStorage.getItem(ACTIVE_KEY); }
export function setActiveSessionId(id: string | null): void {
  if (id) sessionStorage.setItem(ACTIVE_KEY, id); else sessionStorage.removeItem(ACTIVE_KEY);
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

// Map Layer-A register assets back into onboarding holdings (reverse of the
// server-side projection). Gains/summary are recomputed by the store's
// setHoldings action once applied.
function mapAssetsToHoldings(assets: any[]): Holding[] {
  return assets.map((a) => ({
    id: String(a.assetId || a.id || 'h' + Math.random().toString(36).slice(2)),
    instrument_name: a.label || 'Holding',
    ticker: a.ticker || '',
    wrapper: a.wrapperType || '',
    asset_class: a.assetClass || '',
    region: '',
    value_gbp: Number(a.currentValue || 0),
    illiquid: /propert|collect|vct|aim|eis|seis|alt/i.test(String(a.assetClass || '')),
    currency: 'GBP',
    instrument_type: 'Fund',
    isin: a.isin || null,
    cost_basis_gbp: a.acquisitionCost != null ? Number(a.acquisitionCost) : null,
    acquisition_date: a.acquisitionDate || null,
    notes: a.notes || null,
  }));
}

// When a loaded session has no holdings but its register does (an imported /
// pre-loaded investor like Tony), seed the flow's holdings from the register.
// Mutates `data.holdings` and returns true if it hydrated.
async function hydrateHoldingsIfEmpty(data: any, assetsUrl: string, withAdminHeader: boolean): Promise<boolean> {
  const hasHoldings = Array.isArray(data?.holdings) && data.holdings.some((h: any) => Number(h?.value_gbp || 0) > 0);
  if (hasHoldings) return false;
  try {
    const res = await fetch(assetsUrl, withAdminHeader ? { headers: adminHeaders() } : undefined);
    if (!res.ok) return false;
    const assets = await res.json();
    if (!Array.isArray(assets) || assets.length === 0) return false;
    data.holdings = mapAssetsToHoldings(assets);
    return true;
  } catch {
    return false;
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
    const hydrated = await hydrateHoldingsIfEmpty(data, `/api/onboarding-v2/sessions/${id}/assets`, true);
    useOnboardingV2Store.setState(data);
    if (hydrated) useOnboardingV2Store.getState().setHoldings(data.holdings); // recompute gains/summary
    setActiveSessionId(session.id);
    // Imported investor (assets known, intake missing) → start at Intake to
    // capture the basics; Holdings will already be pre-filled from the register.
    const currentStep = hydrated ? '/onboarding-v2/intake' : (session.currentStep || '/onboarding-v2/welcome');
    return { ok: true, currentStep };
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
    setInvestorToken(token); // set before fetching assets so the token-scoped call is authorised
    const hydrated = await hydrateHoldingsIfEmpty(data, `/api/onboarding-v2/i/${token}/assets`, false);
    if (data && Object.keys(data).length) useOnboardingV2Store.setState(data);
    if (hydrated) useOnboardingV2Store.getState().setHoldings(data.holdings);
    const currentStep = hydrated ? '/onboarding-v2/intake' : (session.currentStep || '/onboarding-v2/welcome');
    return { ok: true, currentStep };
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
