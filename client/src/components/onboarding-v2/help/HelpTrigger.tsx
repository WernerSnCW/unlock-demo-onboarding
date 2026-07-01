import { HelpCircle } from 'lucide-react';
import { useHelpDrawer } from './HelpDrawerProvider';

/**
 * The affordance that opens the explainer: a slim tab pinned to the right edge,
 * always visible while a screen has help content. Until the investor opens it
 * for the first time, a gentle pulse + a one-time label draw the eye to it.
 *
 * Hidden while the drawer is open (the drawer's own close button takes over).
 */
export default function HelpTrigger() {
  const { help, open, hasSeen, openDrawer } = useHelpDrawer();

  if (!help || open) return null;

  return (
    <div className="fixed right-0 top-1/2 z-40 -translate-y-1/2">
      {/* First-time hint label — disappears once the drawer has been opened. */}
      {!hasSeen && (
        <div
          className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-[var(--radius-md)] border border-[#00bb77]/30 bg-[var(--card)] px-3 py-1.5 text-xs text-[var(--foreground)] shadow-[var(--shadow-lg)]"
          data-testid="help-trigger-hint"
        >
          <span className="font-medium text-[var(--primary)]">New</span> · understand this screen
        </div>
      )}

      <button
        type="button"
        onClick={openDrawer}
        aria-label="How this screen works"
        data-testid="help-trigger"
        className="group relative flex items-center gap-2 rounded-l-[var(--radius-lg)] border border-r-0 border-[var(--border)] bg-[var(--card)] py-4 pl-3 pr-2.5 shadow-[var(--shadow-lg)] transition-colors hover:bg-[#00bb77]/[0.08] focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--primary)]"
      >
        {/* Pulse ring until first opened. */}
        {!hasSeen && (
          <span className="absolute left-2 top-3 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00bb77]/75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#00bb77]" />
          </span>
        )}
        <HelpCircle className="h-5 w-5 text-[var(--primary)]" />
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground)]"
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
        >
          How this works
        </span>
      </button>
    </div>
  );
}
