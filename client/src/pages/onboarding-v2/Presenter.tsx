import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Radio, MessageSquareQuote } from 'lucide-react';
import { PRESENTER_NOTES, PRESENTER_NOTE_BY_STEP } from '@/content/presenterNotes';
import { getInitialStep, subscribeToStep } from '@/lib/presenterSync';

// Second-screen companion for the advisor. Shows plain-English speaker notes for
// the current onboarding step and, by default, follows the live flow (when the
// advisor navigates the main window, this jumps to match). "Follow live" can be
// toggled off so the advisor can read ahead without being pulled back.
export default function Presenter() {
  const firstStep = PRESENTER_NOTES[0].stepId;
  const [stepId, setStepId] = useState<string>(() => getInitialStep() || firstStep);
  const [follow, setFollow] = useState(true);
  const [pinged, setPinged] = useState(false);

  useEffect(() => {
    document.title = 'Unlock — Presenter notes';
  }, []);

  useEffect(() => {
    const unsub = subscribeToStep((incoming) => {
      if (!PRESENTER_NOTE_BY_STEP[incoming]) return;
      // Briefly flash the "live" badge whenever a step arrives, so the advisor
      // sees the link is working even if they're not following.
      setPinged(true);
      window.setTimeout(() => setPinged(false), 600);
      if (follow) setStepId(incoming);
    });
    return unsub;
  }, [follow]);

  const index = useMemo(
    () => PRESENTER_NOTES.findIndex((n) => n.stepId === stepId),
    [stepId],
  );
  const note = PRESENTER_NOTES[index] ?? PRESENTER_NOTES[0];
  const total = PRESENTER_NOTES.length;

  const go = (delta: number) => {
    const next = Math.min(Math.max(index + delta, 0), total - 1);
    setStepId(PRESENTER_NOTES[next].stepId);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-[var(--card)] border-b border-[var(--border)] px-5 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MessageSquareQuote className="w-5 h-5 text-[var(--primary)]" />
            <span className="font-semibold tracking-tight">Presenter notes</span>
          </div>
          <button
            onClick={() => setFollow((f) => !f)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              follow
                ? 'border-[#00bb77]/50 text-[var(--primary)] bg-[#00bb77]/10'
                : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]'
            }`}
            title={follow ? 'Following the live flow — click to browse freely' : 'Not following — click to snap back to the live step'}
            data-testid="presenter-follow-toggle"
          >
            <Radio className={`w-3.5 h-3.5 ${pinged ? 'text-[var(--primary)] animate-pulse' : ''}`} />
            {follow ? 'Following live' : 'Follow live: off'}
          </button>
        </div>
        {/* Step strip */}
        <div className="mt-3 flex gap-1 overflow-x-auto pb-1">
          {PRESENTER_NOTES.map((n, i) => (
            <button
              key={n.stepId}
              onClick={() => setStepId(n.stepId)}
              className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                i === index
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
              title={n.title}
            >
              {n.stepNumber}
            </button>
          ))}
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 overflow-y-auto px-6 py-6 max-w-2xl w-full mx-auto">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          Step {note.stepNumber} of {total}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{note.title}</h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)] italic">{note.onScreen}</p>

        {/* Purpose */}
        <section className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
            What this screen is for
          </h2>
          <p className="text-[15px] leading-relaxed">{note.purpose}</p>
        </section>

        {/* Say this */}
        {note.sayThis && (
          <section className="mt-4 rounded-xl border-l-4 border-[var(--primary)] bg-[#00bb77]/[0.07] p-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] mb-1.5">
              Say this
            </h2>
            <p className="text-[15px] leading-relaxed">{note.sayThis}</p>
          </section>
        )}

        {/* Sections */}
        {note.sections.length > 0 && (
          <section className="mt-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">
              Section by section
            </h2>
            <div className="space-y-3">
              {note.sections.map((s) => (
                <div key={s.heading} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
                  <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1.5">{s.heading}</h3>
                  <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">{s.body}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Terms */}
        {note.terms && note.terms.length > 0 && (
          <section className="mt-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">
              If a word lands badly — translate and move on
            </h2>
            <dl className="rounded-xl border border-[var(--border)] bg-[var(--card)] divide-y divide-[var(--border)]">
              {note.terms.map((t) => (
                <div key={t.term} className="flex gap-3 p-3">
                  <dt className="w-32 shrink-0 text-sm font-semibold text-[var(--foreground)]">{t.term}</dt>
                  <dd className="text-sm text-[var(--muted-foreground)]">{t.plain}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </main>

      {/* Manual nav */}
      <footer className="sticky bottom-0 bg-[var(--card)] border-t border-[var(--border)] px-5 py-3 flex items-center justify-between">
        <button
          onClick={() => go(-1)}
          disabled={index <= 0}
          className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium disabled:opacity-40 hover:border-[var(--primary)] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>
        <span className="text-xs text-[var(--muted-foreground)]">{note.title}</span>
        <button
          onClick={() => go(1)}
          disabled={index >= total - 1}
          className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium disabled:opacity-40 hover:border-[var(--primary)] transition-colors"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
}
