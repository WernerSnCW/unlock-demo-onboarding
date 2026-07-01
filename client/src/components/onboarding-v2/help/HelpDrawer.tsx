import { useEffect, useState } from 'react';
import { X, BookOpen, MessageSquarePlus } from 'lucide-react';
import { useHelpDrawer } from './HelpDrawerProvider';
import HelpContent from './HelpContent';
import FeedbackTab from './FeedbackTab';

type Tab = 'explainer' | 'feedback';

/**
 * The slide-in panel. Fixed to the right edge, non-modal (no click-blocking
 * scrim) so the investor can read it alongside the live screen.
 *
 * Two tabs: "How it works" (the explainer) and "Your feedback" (per-screen,
 * per-investor review notes).
 */
export default function HelpDrawer() {
  const { help, open } = useHelpDrawer();
  const [tab, setTab] = useState<Tab>('explainer');

  // Reset to the explainer tab whenever the screen changes.
  useEffect(() => {
    if (help) setTab('explainer');
  }, [help?.stepId]);

  if (!help) return null;

  return (
    <aside
      role="complementary"
      aria-label={`Help for the ${help.title} screen`}
      aria-hidden={!open}
      className={`fixed right-0 top-0 bottom-0 z-50 flex w-[min(440px,92vw)] flex-col border-l border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-xl)] transition-transform duration-300 ease-out ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
      data-testid="help-drawer"
    >
      <DrawerHeader title={help.title} intro={help.intro} tab={tab} />

      {/* Tabs */}
      <div className="flex flex-none border-b border-[var(--border)] px-3">
        <TabButton icon={<BookOpen className="h-4 w-4" />} label="How it works" active={tab === 'explainer'} onClick={() => setTab('explainer')} testid="help-tab-explainer" />
        <TabButton icon={<MessageSquarePlus className="h-4 w-4" />} label="Your feedback" active={tab === 'feedback'} onClick={() => setTab('feedback')} testid="help-tab-feedback" />
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {tab === 'explainer' ? <HelpContent help={help} /> : <FeedbackTab stepId={help.stepId} screenTitle={help.title} />}
      </div>

      {/* Footer */}
      <div className="flex-none border-t border-[var(--border)] px-5 py-3">
        <p className="text-[11px] leading-relaxed text-[var(--muted-foreground)]">
          {tab === 'explainer'
            ? 'Illustrative decision support, not financial advice. Underlined terms jump to that item on the screen.'
            : 'Your feedback goes to the Unlock team to help shape the product.'}
        </p>
      </div>
    </aside>
  );
}

function DrawerHeader({ title, intro, tab }: { title: string; intro: string; tab: Tab }) {
  const { closeDrawer } = useHelpDrawer();
  return (
    <div className="flex flex-none items-start justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
      <div className="min-w-0">
        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
          {tab === 'explainer' ? 'How this screen works' : 'Feedback on this screen'}
        </span>
        <h2 className="text-xl font-light text-[var(--foreground)]">{title}</h2>
        {tab === 'explainer' && (
          <p className="mt-1 text-sm leading-snug text-[var(--muted-foreground)]">{intro}</p>
        )}
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
  );
}

function TabButton({
  icon,
  label,
  active,
  onClick,
  testid,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  testid: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testid}
      className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors ${
        active
          ? 'border-[#00bb77] text-[var(--foreground)]'
          : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
