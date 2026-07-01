import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Trash2, Send, MessagesSquare } from 'lucide-react';
import { isInvestorMode } from '@/lib/onboardingSync';
import {
  FEEDBACK_CATEGORIES,
  submitFeedback,
  listMyFeedback,
  deleteMyFeedback,
  type FeedbackCategory,
  type ScreenFeedback,
} from '@/lib/screenFeedback';

/**
 * "Your feedback" drawer tab. Investors leave per-screen notes (category +
 * optional 1–5 clarity rating + comment) and can see/remove their own notes for
 * the current screen. In admin/demo mode there's no investor session to attach
 * to, so it points the advisor to the consolidated review view instead.
 */
export default function FeedbackTab({ stepId, screenTitle }: { stepId: string; screenTitle: string }) {
  const investor = isInvestorMode();
  if (!investor) return <AdminFeedbackNote />;
  return <InvestorFeedbackForm stepId={stepId} screenTitle={screenTitle} />;
}

function AdminFeedbackNote() {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white/[0.03] p-4">
      <div className="mb-2 flex items-center gap-2 text-[var(--foreground)]">
        <MessagesSquare className="h-4 w-4 text-[var(--primary)]" />
        <span className="text-sm font-medium">Investor feedback</span>
      </div>
      <p className="mb-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
        Feedback is collected from investors on their own private links, per screen. You’re viewing
        as an advisor, so there’s no investor note to add here.
      </p>
      <Link
        href="/onboarding-v2/feedback"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] underline decoration-dotted underline-offset-2 hover:decoration-solid"
        data-testid="link-feedback-review"
      >
        Open the feedback review →
      </Link>
    </div>
  );
}

function InvestorFeedbackForm({ stepId, screenTitle }: { stepId: string; screenTitle: string }) {
  const [category, setCategory] = useState<FeedbackCategory>('ux');
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error' | 'no-db'>('idle');
  const [mine, setMine] = useState<ScreenFeedback[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load this investor's existing notes for the current screen.
  useEffect(() => {
    let active = true;
    setLoaded(false);
    listMyFeedback().then(({ items }) => {
      if (!active) return;
      setMine(items.filter(f => f.stepId === stepId));
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [stepId]);

  async function handleSubmit() {
    if (!comment.trim() || saving) return;
    setSaving(true);
    setStatus('idle');
    const res = await submitFeedback({ stepId, category, rating, comment: comment.trim() });
    setSaving(false);
    if (res.ok && res.item) {
      setMine(prev => [res.item as ScreenFeedback, ...prev]);
      setComment('');
      setRating(null);
      setStatus('saved');
    } else {
      setStatus(res.noDb ? 'no-db' : 'error');
    }
  }

  async function handleDelete(id: string) {
    const res = await deleteMyFeedback(id);
    if (res.ok) setMine(prev => prev.filter(f => f.id !== id));
  }

  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
        Tell us what you think of the <span className="text-[var(--foreground)]">{screenTitle}</span>{' '}
        screen — the design, the logic, anything unclear, or an idea. Your notes are private to the
        Unlock team.
      </p>

      {/* Category */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--primary)]">
          What’s this about?
        </label>
        <div className="flex flex-wrap gap-2">
          {FEEDBACK_CATEGORIES.map(c => {
            const active = category === c.value;
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                data-testid={`feedback-cat-${c.value}`}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  active
                    ? 'border-[#00bb77] bg-[#00bb77]/[0.14] text-[var(--foreground)]'
                    : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[#00bb77]/40'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rating */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--primary)]">
          How clear was this screen? <span className="text-[var(--muted-foreground)] normal-case tracking-normal">(optional)</span>
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(rating === n ? null : n)}
              data-testid={`feedback-rating-${n}`}
              className={`h-8 w-8 rounded-[var(--radius-md)] border text-sm transition-colors ${
                rating === n
                  ? 'border-[#00bb77] bg-[#00bb77] text-[var(--primary-foreground)]'
                  : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[#00bb77]/40'
              }`}
            >
              {n}
            </button>
          ))}
          <span className="ml-1 text-xs text-[var(--muted-foreground)]">1 = confusing · 5 = crystal clear</span>
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--primary)]">
          Your note
        </label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={4}
          maxLength={4000}
          placeholder="What worked, what didn’t, what you’d change…"
          data-testid="feedback-comment"
          className="w-full resize-y rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--input)] p-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[#00bb77] focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!comment.trim() || saving}
          data-testid="feedback-submit"
          className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] transition-colors hover:bg-[#008655] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {saving ? 'Sending…' : 'Send feedback'}
        </button>
        {status === 'saved' && <span className="text-xs text-[var(--primary)]">Thanks — saved.</span>}
        {status === 'error' && <span className="text-xs text-[#ef4444]">Couldn’t save — please try again.</span>}
        {status === 'no-db' && <span className="text-xs text-[#f59e0b]">Feedback isn’t available in this preview.</span>}
      </div>

      {/* Own notes for this screen */}
      {loaded && mine.length > 0 && (
        <div className="border-t border-[var(--border)] pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
            Your notes on this screen ({mine.length})
          </p>
          <ul className="space-y-2">
            {mine.map(f => (
              <li
                key={f.id}
                data-testid={`feedback-mine-${f.id}`}
                className="group flex items-start justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-white/[0.03] p-3"
              >
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="rounded-full border border-[#00bb77]/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--primary)]">
                      {FEEDBACK_CATEGORIES.find(c => c.value === f.category)?.label ?? f.category}
                    </span>
                    {f.rating != null && (
                      <span className="text-[11px] text-[var(--muted-foreground)]">clarity {f.rating}/5</span>
                    )}
                  </div>
                  <p className="text-sm leading-snug text-[var(--foreground)] break-words">{f.comment}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(f.id)}
                  aria-label="Delete note"
                  className="flex-none rounded p-1 text-[var(--muted-foreground)] opacity-0 transition-opacity hover:text-[#ef4444] group-hover:opacity-100 focus:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
