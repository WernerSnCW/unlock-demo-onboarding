import { X, BookOpen } from 'lucide-react';
import { useHelpDrawer } from './HelpDrawerProvider';
import HelpContent from './HelpContent';

/**
 * The slide-in explainer panel. Fixed to the right edge, non-modal (no
 * click-blocking scrim) so the investor can read it alongside the live screen.
 *
 * Tab-ready: a per-screen "Your feedback" tab is planned to slot in beside the
 * explainer later (investors commenting on each screen). Only the Explainer
 * view is built for now — a second tab renders next to this header when added.
 */
export default function HelpDrawer() {
  const { help, open, closeDrawer } = useHelpDrawer();

  if (!help) return null;

  return (
    <aside
      role="complementary"
      aria-label={`How the ${help.title} screen works`}
      aria-hidden={!open}
      className={`fixed right-0 top-0 bottom-0 z-50 flex w-[min(440px,92vw)] flex-col border-l border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-xl)] transition-transform duration-300 ease-out ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
      data-testid="help-drawer"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <BookOpen className="h-4 w-4 flex-none text-[var(--primary)]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
              How this screen works
            </span>
          </div>
          <h2 className="text-xl font-light text-[var(--foreground)]">{help.title}</h2>
          <p className="mt-1 text-sm leading-snug text-[var(--muted-foreground)]">{help.intro}</p>
        </div>
        <button
          type="button"
          onClick={closeDrawer}
          aria-label="Close"
          className="flex-none rounded-[var(--radius-md)] p-1.5 text-[var(--muted-foreground)] transition-colors hover:bg-white/5 hover:text-[var(--foreground)] focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--primary)]"
          data-testid="help-drawer-close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <HelpContent help={help} />
      </div>

      {/* Footer */}
      <div className="border-t border-[var(--border)] px-5 py-3">
        <p className="text-[11px] leading-relaxed text-[var(--muted-foreground)]">
          Illustrative decision support, not financial advice. Underlined terms jump to that item on
          the screen.
        </p>
      </div>
    </aside>
  );
}
