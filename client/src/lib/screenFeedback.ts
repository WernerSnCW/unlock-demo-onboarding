// Client API for per-screen, per-investor feedback.
//
// • Investor mode — notes are token-scoped to /api/onboarding-v2/i/:token/feedback.
// • Admin (advisor) mode — consolidation + review via /api/onboarding-v2/feedback,
//   authorised with the x-access-code header (same model as sessions).
//
// All calls degrade gracefully without a database (503 → { noDb: true }).
import { getInvestorToken, getAdminCode } from './onboardingSync';

export type FeedbackCategory = 'ux' | 'logic' | 'wording' | 'idea' | 'bug' | 'general';
export type FeedbackStatus = 'new' | 'reviewed' | 'actioned' | 'dismissed';

export interface ScreenFeedback {
  id: string;
  investorSessionId: string;
  stepId: string;
  category: FeedbackCategory;
  rating: number | null;
  comment: string;
  isInternal: boolean;
  status: FeedbackStatus;
  adminNote: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ScreenFeedbackWithInvestor extends ScreenFeedback {
  investorName: string;
  token: string | null;
}

export const FEEDBACK_CATEGORIES: { value: FeedbackCategory; label: string }[] = [
  { value: 'ux', label: 'UX / design' },
  { value: 'logic', label: 'Logic / rules' },
  { value: 'wording', label: 'Wording' },
  { value: 'idea', label: 'Idea' },
  { value: 'bug', label: 'Bug' },
  { value: 'general', label: 'General' },
];

function adminHeaders(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  const code = getAdminCode();
  if (code) h['x-access-code'] = code;
  return h;
}

// ---- Investor (token-scoped) ----

export interface SubmitFeedbackInput {
  stepId: string;
  category: FeedbackCategory;
  rating?: number | null;
  comment: string;
}

export async function submitFeedback(
  input: SubmitFeedbackInput,
): Promise<{ ok: boolean; noDb?: boolean; item?: ScreenFeedback }> {
  const token = getInvestorToken();
  if (!token) return { ok: false };
  try {
    const res = await fetch(`/api/onboarding-v2/i/${token}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (res.status === 503) return { ok: false, noDb: true };
    if (!res.ok) return { ok: false };
    return { ok: true, item: await res.json() };
  } catch {
    return { ok: false };
  }
}

export async function listMyFeedback(): Promise<{ ok: boolean; noDb?: boolean; items: ScreenFeedback[] }> {
  const token = getInvestorToken();
  if (!token) return { ok: false, items: [] };
  try {
    const res = await fetch(`/api/onboarding-v2/i/${token}/feedback`);
    if (res.status === 503) return { ok: false, noDb: true, items: [] };
    if (!res.ok) return { ok: false, items: [] };
    return { ok: true, items: await res.json() };
  } catch {
    return { ok: false, items: [] };
  }
}

export async function deleteMyFeedback(id: string): Promise<{ ok: boolean }> {
  const token = getInvestorToken();
  if (!token) return { ok: false };
  try {
    const res = await fetch(`/api/onboarding-v2/i/${token}/feedback/${id}`, { method: 'DELETE' });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}

// ---- Admin (advisor) internal notes + consolidation + review ----

// The advisor's own note on a screen, attached to the session they're demoing
// or reviewing (by id). Flagged internal server-side, so it stays separate
// from genuine investor feedback in the review.
export async function submitInternalFeedback(
  sessionId: string,
  input: SubmitFeedbackInput,
): Promise<{ ok: boolean; noDb?: boolean; item?: ScreenFeedback }> {
  try {
    const res = await fetch(`/api/onboarding-v2/sessions/${sessionId}/feedback`, {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(input),
    });
    if (res.status === 503) return { ok: false, noDb: true };
    if (!res.ok) return { ok: false };
    return { ok: true, item: await res.json() };
  } catch {
    return { ok: false };
  }
}

export async function listAllFeedback(): Promise<{ ok: boolean; noDb?: boolean; items: ScreenFeedbackWithInvestor[] }> {
  try {
    const res = await fetch('/api/onboarding-v2/feedback', { headers: adminHeaders() });
    if (res.status === 503) return { ok: false, noDb: true, items: [] };
    if (!res.ok) return { ok: false, items: [] };
    return { ok: true, items: await res.json() };
  } catch {
    return { ok: false, items: [] };
  }
}

export async function updateFeedback(
  id: string,
  patch: { status?: FeedbackStatus; adminNote?: string | null },
): Promise<{ ok: boolean; item?: ScreenFeedbackWithInvestor }> {
  try {
    const res = await fetch(`/api/onboarding-v2/feedback/${id}`, {
      method: 'PATCH',
      headers: adminHeaders(),
      body: JSON.stringify(patch),
    });
    if (!res.ok) return { ok: false };
    return { ok: true, item: await res.json() };
  } catch {
    return { ok: false };
  }
}
