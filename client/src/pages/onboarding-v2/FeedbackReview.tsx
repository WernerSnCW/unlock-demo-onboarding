import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Download, MessagesSquare } from 'lucide-react';
import GridBackground from '@/components/onboarding-v2/GridBackground';
import { ONBOARDING_STEPS } from '@/components/onboarding-v2/StepIndicator';
import {
  listAllFeedback,
  updateFeedback,
  FEEDBACK_CATEGORIES,
  type ScreenFeedbackWithInvestor,
  type FeedbackStatus,
  type FeedbackCategory,
} from '@/lib/screenFeedback';

/**
 * Advisor consolidation + review of investor feedback, grouped BY SCREEN so you
 * can see what everyone said about e.g. Analysis in one place, triage each note
 * (status + a decision note), and export the lot as CSV. Admin-only (the API is
 * gated by the access code; not linked for investors).
 */

const STATUSES: FeedbackStatus[] = ['new', 'reviewed', 'actioned', 'dismissed'];
const STATUS_LABEL: Record<FeedbackStatus, string> = {
  new: 'New',
  reviewed: 'Reviewed',
  actioned: 'Actioned',
  dismissed: 'Dismissed',
};

// Screen label lookup from the step id, in flow order.
const STEP_LABEL: Record<string, string> = Object.fromEntries(
  ONBOARDING_STEPS.map(s => [s.id, s.label]),
);
const STEP_ORDER: Record<string, number> = Object.fromEntries(
  ONBOARDING_STEPS.map((s, i) => [s.id, i]),
);

function catLabel(c: FeedbackCategory | string): string {
  return FEEDBACK_CATEGORIES.find(x => x.value === c)?.label ?? String(c);
}

function fmtDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function toCsv(rows: ScreenFeedbackWithInvestor[]): string {
  const header = ['Screen', 'Investor', 'Category', 'Rating', 'Comment', 'Status', 'Advisor note', 'Date'];
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = rows.map(r =>
    [
      STEP_LABEL[r.stepId] ?? r.stepId,
      r.investorName,
      catLabel(r.category),
      r.rating ?? '',
      r.comment,
      STATUS_LABEL[r.status as FeedbackStatus] ?? r.status,
      r.adminNote ?? '',
      fmtDate(r.createdAt),
    ]
      .map(esc)
      .join(','),
  );
  return [header.map(esc).join(','), ...lines].join('\n');
}

export default function FeedbackReview() {
  const [items, setItems] = useState<ScreenFeedbackWithInvestor[]>([]);
  const [state, setState] = useState<'loading' | 'ok' | 'no-db' | 'error'>('loading');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    listAllFeedback().then(res => {
      if (res.noDb) return setState('no-db');
      if (!res.ok) return setState('error');
      setItems(res.items);
      setState('ok');
    });
  }, []);

  const filtered = useMemo(
    () =>
      items.filter(
        i =>
          (catFilter === 'all' || i.category === catFilter) &&
          (statusFilter === 'all' || i.status === statusFilter),
      ),
    [items, catFilter, statusFilter],
  );

  // Group by screen, ordered by the onboarding flow.
  const groups = useMemo(() => {
    const map = new Map<string, ScreenFeedbackWithInvestor[]>();
    for (const i of filtered) {
      const arr = map.get(i.stepId) ?? [];
      arr.push(i);
      map.set(i.stepId, arr);
    }
    return Array.from(map.entries()).sort(
      (a, b) => (STEP_ORDER[a[0]] ?? 99) - (STEP_ORDER[b[0]] ?? 99),
    );
  }, [filtered]);

  async function patch(id: string, p: { status?: FeedbackStatus; adminNote?: string | null }) {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, ...p } : i)));
    await updateFeedback(id, p);
  }

  function exportCsv() {
    const blob = new Blob([toCsv(filtered)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'unlock-screen-feedback.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="relative min-h-screen bg-[var(--background)]">
      <GridBackground />
      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <Link
              href="/onboarding-v2/welcome"
              className="mb-2 inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              <ArrowLeft className="h-4 w-4" /> Back to onboarding
            </Link>
            <h1 className="flex items-center gap-2 text-3xl font-light text-[var(--foreground)]">
              <MessagesSquare className="h-6 w-6 text-[var(--primary)]" />
              Investor feedback
            </h1>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Per-screen notes from investors reviewing the demo, grouped by screen.
            </p>
          </div>
          <button
            type="button"
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] px-3 py-2 text-sm text-[var(--foreground)] transition-colors hover:border-[#00bb77]/50 disabled:opacity-40"
            data-testid="feedback-export-csv"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>

        {/* Filters */}
        {state === 'ok' && items.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <FilterSelect
              label="Category"
              value={catFilter}
              onChange={setCatFilter}
              options={[{ value: 'all', label: 'All' }, ...FEEDBACK_CATEGORIES]}
            />
            <FilterSelect
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[{ value: 'all', label: 'All' }, ...STATUSES.map(s => ({ value: s, label: STATUS_LABEL[s] }))]}
            />
            <span className="text-sm text-[var(--muted-foreground)]">
              {filtered.length} of {items.length} notes
            </span>
          </div>
        )}

        {/* States */}
        {state === 'loading' && <p className="text-[var(--muted-foreground)]">Loading feedback…</p>}
        {state === 'no-db' && (
          <p className="text-[var(--muted-foreground)]">
            Feedback needs a database. It’s available on the deployed app once the schema is pushed.
          </p>
        )}
        {state === 'error' && (
          <p className="text-[#f59e0b]">
            Couldn’t load feedback. This view requires advisor access.
          </p>
        )}
        {state === 'ok' && items.length === 0 && (
          <p className="text-[var(--muted-foreground)]">No feedback yet — it’ll appear here as investors leave notes.</p>
        )}

        {/* Groups by screen */}
        <div className="space-y-8">
          {groups.map(([stepId, notes]) => {
            const rated = notes.filter(n => n.rating != null);
            const avg = rated.length
              ? (rated.reduce((s, n) => s + (n.rating ?? 0), 0) / rated.length).toFixed(1)
              : null;
            return (
              <section key={stepId} data-testid={`feedback-group-${stepId}`}>
                <div className="mb-3 flex items-baseline gap-3 border-b border-[var(--border)] pb-2">
                  <h2 className="text-lg font-medium text-[var(--foreground)]">
                    {STEP_LABEL[stepId] ?? stepId}
                  </h2>
                  <span className="text-sm text-[var(--muted-foreground)]">
                    {notes.length} {notes.length === 1 ? 'note' : 'notes'}
                    {avg && ` · avg clarity ${avg}/5`}
                  </span>
                </div>
                <div className="space-y-3">
                  {notes.map(n => (
                    <FeedbackRow key={n.id} note={n} onPatch={patch} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
      {label}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--input)] px-2 py-1 text-sm text-[var(--foreground)] focus:border-[#00bb77] focus:outline-none"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function FeedbackRow({
  note,
  onPatch,
}: {
  note: ScreenFeedbackWithInvestor;
  onPatch: (id: string, p: { status?: FeedbackStatus; adminNote?: string | null }) => void;
}) {
  const [noteDraft, setNoteDraft] = useState(note.adminNote ?? '');
  return (
    <div
      className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white/[0.03] p-4"
      data-testid={`feedback-row-${note.id}`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-[var(--foreground)]">{note.investorName}</span>
        <span className="rounded-full border border-[#00bb77]/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--primary)]">
          {catLabel(note.category)}
        </span>
        {note.rating != null && (
          <span className="text-[11px] text-[var(--muted-foreground)]">clarity {note.rating}/5</span>
        )}
        <span className="ml-auto text-[11px] text-[var(--muted-foreground)]">{fmtDate(note.createdAt)}</span>
      </div>

      <p className="mb-3 text-sm leading-relaxed text-[var(--foreground)]">{note.comment}</p>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={note.status}
          onChange={e => onPatch(note.id, { status: e.target.value as FeedbackStatus })}
          data-testid={`feedback-status-${note.id}`}
          className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--input)] px-2 py-1 text-xs text-[var(--foreground)] focus:border-[#00bb77] focus:outline-none"
        >
          {STATUSES.map(s => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <input
          value={noteDraft}
          onChange={e => setNoteDraft(e.target.value)}
          onBlur={() => {
            if (noteDraft !== (note.adminNote ?? '')) onPatch(note.id, { adminNote: noteDraft || null });
          }}
          placeholder="Advisor note / decision…"
          className="min-w-0 flex-1 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--input)] px-2 py-1 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[#00bb77] focus:outline-none"
        />
      </div>
    </div>
  );
}
