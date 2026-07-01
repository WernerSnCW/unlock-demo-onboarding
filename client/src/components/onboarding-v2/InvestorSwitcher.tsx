import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { ChevronDown, UserPlus, Search, Check, CircleDashed, Briefcase, Loader2, Copy, Play } from 'lucide-react';
import { useOnboardingV2Store } from '@/state/onboardingV2Store';
import { ONBOARDING_STEPS } from './StepIndicator';
import {
  listSessions, loadSession, startNewInvestor, getActiveSessionId,
  createInvestor, isInvestorMode,
  type SessionSummary,
} from '@/lib/onboardingSync';

// Friendly "where they're up to" label for an in-progress session.
function stepInfo(path: string | null): string {
  if (!path) return 'Not started';
  const idx = ONBOARDING_STEPS.findIndex((s) => s.path === path || s.id === path);
  if (idx >= 0) return `Step ${idx + 1} of ${ONBOARDING_STEPS.length} · ${ONBOARDING_STEPS[idx].label}`;
  const tail = path.replace('/onboarding-v2/', '').replace(/\//g, ' ');
  return tail.charAt(0).toUpperCase() + tail.slice(1);
}

// Top-right control: shows the investor currently being worked on, and a
// dropdown to swap between saved investors (completed or in progress).
export default function InvestorSwitcher() {
  const [, navigate] = useLocation();
  const activeName = useOnboardingV2Store((s) => s.intake.full_name);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [noDb, setNoDb] = useState(false);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  // Create-investor flow: idle → creating (name entry) → created (show link).
  const [createMode, setCreateMode] = useState<'idle' | 'creating' | 'created'>('idle');
  const [newName, setNewName] = useState('');
  const [creatingBusy, setCreatingBusy] = useState(false);
  const [createdLink, setCreatedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const activeId = getActiveSessionId();
  const investorMode = isInvestorMode();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Refresh the list each time the dropdown opens.
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    listSessions().then((r) => {
      setNoDb(Boolean(r.noDb));
      setSessions(r.sessions);
      setLoading(false);
    });
  }, [open]);

  const label = activeName?.trim() ? activeName.trim() : 'New investor';

  const onSelect = async (id: string) => {
    setBusyId(id);
    const r = await loadSession(id);
    setBusyId(null);
    setOpen(false);
    if (r.ok && r.currentStep) navigate(r.currentStep);
  };

  // Tom's own blank demo walkthrough (no link needed).
  const onBlankWalkthrough = () => {
    startNewInvestor();
    setOpen(false);
    navigate('/onboarding-v2/welcome');
  };

  const onCreateInvestor = async () => {
    if (!newName.trim()) return;
    setCreatingBusy(true);
    const r = await createInvestor(newName.trim());
    setCreatingBusy(false);
    if (r.ok && r.token) {
      setCreatedLink(`${window.location.origin}/i/${r.token}`);
      setCreateMode('created');
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(createdLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — user can select the text manually */
    }
  };

  const resetCreate = () => {
    setCreateMode('idle');
    setNewName('');
    setCreatedLink('');
    setCopied(false);
  };

  // Investors see a read-only label of their own name — never the list/dropdown.
  if (investorMode) {
    return (
      <div className="hidden md:flex items-center gap-2 p-2">
        <div className="w-8 h-8 rounded-full bg-[#00bb77]/12 border border-[#00bb77]/30 flex items-center justify-center">
          <Briefcase className="h-4 w-4 text-[var(--primary)]" />
        </div>
        <span className="max-w-[180px] truncate text-sm font-medium text-[var(--card-foreground)]">
          {activeName?.trim() || 'Your session'}
        </span>
      </div>
    );
  }

  const filtered = query.trim()
    ? sessions.filter((s) => s.investorName.toLowerCase().includes(query.trim().toLowerCase()))
    : sessions;

  return (
    <div className="relative hidden md:block" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#ffffff]/[0.06] transition-colors"
        data-testid="investor-switcher"
      >
        <div className="w-8 h-8 rounded-full bg-[#00bb77]/12 border border-[#00bb77]/30 flex items-center justify-center">
          <Briefcase className="h-4 w-4 text-[var(--primary)]" />
        </div>
        <span className="hidden lg:block max-w-[160px] truncate text-sm font-medium text-[var(--card-foreground)]">
          {label}
        </span>
        <ChevronDown className={`h-4 w-4 text-[var(--muted-foreground)] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-[var(--popover)] rounded-xl shadow-[var(--shadow-xl)] border border-[var(--border)] z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-[var(--muted-foreground)]">
              Investors
            </span>
            {!noDb && !loading && (
              <span className="text-xs text-[var(--muted-foreground)]">{sessions.length}</span>
            )}
          </div>

          {/* Search — shown once the list is long enough to warrant it */}
          {!noDb && sessions.length > 5 && (
            <div className="px-3 pb-2">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--input)] border border-[var(--border)]">
                <Search className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search investors…"
                  className="bg-transparent outline-none text-sm text-[var(--foreground)] w-full placeholder:text-[var(--muted-foreground)]"
                  data-testid="investor-search"
                />
              </div>
            </div>
          )}

          {/* List */}
          <div className="max-h-72 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center gap-2 text-sm text-[var(--muted-foreground)] py-6">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            )}

            {!loading && noDb && (
              <p className="px-4 py-4 text-xs leading-relaxed text-[var(--muted-foreground)]">
                Server storage is off, so saved investors can’t be listed. Provision a database to
                switch investors across sessions. The current session still autosaves to this browser.
              </p>
            )}

            {!loading && !noDb && filtered.length === 0 && (
              <p className="px-4 py-4 text-sm text-[var(--muted-foreground)]">
                {sessions.length === 0 ? 'No saved investors yet.' : 'No matches.'}
              </p>
            )}

            {!loading && !noDb && filtered.map((s) => {
              const isActive = s.id === activeId;
              const completed = s.status === 'completed';
              return (
                <button
                  key={s.id}
                  onClick={() => onSelect(s.id)}
                  disabled={busyId === s.id}
                  className="w-full px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-[#ffffff]/[0.05] transition-colors text-left"
                  data-testid={`investor-option-${s.id}`}
                >
                  <span className="flex items-start gap-2 min-w-0">
                    {isActive
                      ? <Check className="h-4 w-4 mt-0.5 text-[var(--primary)] shrink-0" />
                      : <span className="w-4 shrink-0" />}
                    <span className="min-w-0">
                      <span className={`block truncate text-sm ${isActive ? 'text-[var(--foreground)] font-medium' : 'text-[var(--card-foreground)]'}`}>
                        {s.investorName}
                      </span>
                      {!completed && (
                        <span className="block truncate text-xs text-[var(--muted-foreground)]">
                          {stepInfo(s.currentStep)}
                        </span>
                      )}
                    </span>
                  </span>
                  {busyId === s.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--muted-foreground)] shrink-0" />
                  ) : (
                    <span
                      className={
                        completed
                          ? 'shrink-0 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[#00bb77]/12 text-[var(--primary)] border border-[#00bb77]/30'
                          : 'shrink-0 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[#ffffff]/[0.04] text-[var(--muted-foreground)] border border-[var(--border)]'
                      }
                    >
                      {completed ? <Check className="h-3 w-3" /> : <CircleDashed className="h-3 w-3" />}
                      {completed ? 'Done' : 'In progress'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Create investor (get a private link) + own demo walkthrough */}
          <div className="border-t border-[var(--border)] p-3 space-y-2">
            {createMode === 'idle' && (
              <>
                <button
                  onClick={() => setCreateMode('creating')}
                  className="w-full px-2 py-2 flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:bg-[#00bb77]/[0.06] rounded-lg transition-colors"
                  data-testid="investor-create"
                >
                  <UserPlus className="h-4 w-4" />
                  New investor — get a private link
                </button>
                <button
                  onClick={onBlankWalkthrough}
                  className="w-full px-2 py-2 flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[#ffffff]/[0.04] rounded-lg transition-colors"
                  data-testid="investor-blank-walkthrough"
                >
                  <Play className="h-4 w-4" />
                  Start a blank walkthrough (demo)
                </button>
              </>
            )}

            {createMode === 'creating' && (
              <div className="space-y-2">
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onCreateInvestor()}
                  placeholder="Investor name"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--input)] border border-[var(--border)] text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] placeholder:text-[var(--muted-foreground)]"
                  data-testid="investor-create-name"
                />
                <div className="flex gap-2">
                  <button
                    onClick={onCreateInvestor}
                    disabled={!newName.trim() || creatingBusy}
                    className="flex-1 px-3 py-2 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                    data-testid="investor-create-confirm"
                  >
                    {creatingBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create link'}
                  </button>
                  <button onClick={resetCreate} className="px-3 py-2 rounded-lg text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {createMode === 'created' && (
              <div className="space-y-2">
                <p className="text-xs text-[var(--muted-foreground)]">Private link for <span className="text-[var(--foreground)] font-medium">{newName.trim()}</span> — send it to them:</p>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={createdLink}
                    onFocus={(e) => e.currentTarget.select()}
                    className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-[var(--input)] border border-[var(--border)] text-xs text-[var(--foreground)] outline-none"
                    data-testid="investor-created-link"
                  />
                  <button
                    onClick={copyLink}
                    className="shrink-0 px-3 py-2 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium flex items-center gap-1.5"
                    data-testid="investor-copy-link"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <button onClick={resetCreate} className="w-full px-2 py-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                  + Create another
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
