import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getScreenHelp, type ScreenHelp } from '@/content/screen-help';

/**
 * Screen-explainer help drawer — shared state.
 *
 * Mounted once per screen inside OnboardingLayout. Holds the open/closed state,
 * resolves the help content for the current step, and owns the "highlight an
 * on-screen element" behaviour that the drawer's inline links call.
 *
 * The drawer is intentionally NON-MODAL: there is no click-blocking scrim, so
 * the investor can read the explanation and interact with the live screen at
 * the same time (which is what makes the click-to-highlight links work).
 */

const SEEN_KEY = 'unlock:screen-help-seen';

interface HelpDrawerContextValue {
  /** Content for the current screen, or null if none is authored. */
  help: ScreenHelp | null;
  open: boolean;
  /** Whether the user has ever opened the drawer (drives the first-time hint). */
  hasSeen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  /** Scroll to and pulse the element tagged data-help-anchor={key}. */
  highlight: (anchorKey: string) => void;
}

const HelpDrawerContext = createContext<HelpDrawerContextValue | null>(null);

export function useHelpDrawer(): HelpDrawerContextValue {
  const ctx = useContext(HelpDrawerContext);
  if (!ctx) throw new Error('useHelpDrawer must be used within a HelpDrawerProvider');
  return ctx;
}

function readSeen(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

export function HelpDrawerProvider({
  stepId,
  children,
}: {
  stepId: string;
  children: React.ReactNode;
}) {
  const help = useMemo(() => getScreenHelp(stepId), [stepId]);
  const [open, setOpen] = useState(false);
  const [hasSeen, setHasSeen] = useState<boolean>(readSeen);

  // Close the drawer whenever the step changes, so it never carries stale
  // content across a navigation.
  useEffect(() => {
    setOpen(false);
  }, [stepId]);

  const markSeen = useCallback(() => {
    setHasSeen(true);
    try {
      localStorage.setItem(SEEN_KEY, '1');
    } catch {
      /* private mode / storage disabled — the hint just keeps showing */
    }
  }, []);

  const openDrawer = useCallback(() => {
    setOpen(true);
    markSeen();
  }, [markSeen]);

  const closeDrawer = useCallback(() => setOpen(false), []);

  const toggleDrawer = useCallback(() => {
    setOpen(prev => {
      if (!prev) markSeen();
      return !prev;
    });
  }, [markSeen]);

  const highlight = useCallback((anchorKey: string) => {
    if (typeof document === 'undefined') return;
    // Prefer an explicit data-help-anchor; fall back to the element's
    // data-testid so most links work without touching the screen files (the
    // existing test ids double as stable highlight targets).
    const el =
      document.querySelector<HTMLElement>(`[data-help-anchor="${anchorKey}"]`) ??
      document.querySelector<HTMLElement>(`[data-testid="${anchorKey}"]`);
    if (!el) return; // safe no-op if the element isn't on this screen
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Restart the animation even if it was already flashing.
    el.classList.remove('help-anchor-flash');
    // Force a reflow so re-adding the class replays the keyframes.
    void el.offsetWidth;
    el.classList.add('help-anchor-flash');
    window.setTimeout(() => el.classList.remove('help-anchor-flash'), 2200);
  }, []);

  // Escape closes the drawer.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const value = useMemo<HelpDrawerContextValue>(
    () => ({ help, open, hasSeen, openDrawer, closeDrawer, toggleDrawer, highlight }),
    [help, open, hasSeen, openDrawer, closeDrawer, toggleDrawer, highlight],
  );

  return <HelpDrawerContext.Provider value={value}>{children}</HelpDrawerContext.Provider>;
}
