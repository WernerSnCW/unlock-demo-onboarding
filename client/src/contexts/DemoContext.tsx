import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'wouter';
import { DEMO_STEPS, DEMO_INVESTOR_LABEL, type DemoAction } from '@/lib/demo/demoScript';
import { setDemoMode } from '@/lib/onboardingSync';

const STORAGE_KEY = 'onboarding-v2-storage';
const BACKUP_KEY = '__demo_backup_onboarding_v2_storage';

// End the demo cleanly: stop gating saves, restore the advisor's real store
// (or clear it), and hard-reload to Welcome so no synthetic data lingers in
// memory or gets autosaved afterwards.
function endDemoCleanup(): void {
  setDemoMode(false);
  const backup = sessionStorage.getItem(BACKUP_KEY);
  if (backup) {
    localStorage.setItem(STORAGE_KEY, backup);
    sessionStorage.removeItem(BACKUP_KEY);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
  window.location.href = '/onboarding-v2/welcome';
}

interface DemoContextValue {
  active: boolean;
  paused: boolean;
  currentStepIndex: number;
  totalSteps: number;
  currentStepLabel: string;
  investorLabel: string;
  cursorRect: DOMRect | null;
  start: () => void;
  togglePause: () => void;
  exit: () => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used within DemoProvider');
  return ctx;
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function waitForElement(selector: string, runIdRef: { current: number }, runId: number, timeoutMs = 6000): Promise<HTMLElement | null> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (runIdRef.current !== runId) return null;
    const el = document.querySelector(selector) as HTMLElement | null;
    if (el) return el;
    await sleep(100);
  }
  return null;
}

function findByText(value: string): HTMLElement | null {
  const candidates = Array.from(document.querySelectorAll('button, [role="option"], [role="tab"]')) as HTMLElement[];
  return candidates.find((el) => el.textContent?.trim().includes(value)) ?? null;
}

function typeIntoElement(el: HTMLInputElement, text: string, runIdRef: { current: number }, runId: number): Promise<void> {
  return new Promise((resolve) => {
    const proto = Object.getPrototypeOf(el);
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    el.focus();
    let current = '';
    let i = 0;
    const step = () => {
      if (runIdRef.current !== runId || i >= text.length) {
        el.dispatchEvent(new Event('change', { bubbles: true }));
        resolve();
        return;
      }
      current += text[i];
      i += 1;
      setter?.call(el, current);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      setTimeout(step, 28);
    };
    step();
  });
}

// Scroll an element to centre and keep the highlight rect pinned to it for the
// whole (smooth) scroll, updating every animation frame until it settles. This
// replaces snapshotting the rect BEFORE the scroll — which left the ring behind
// whenever a target needed scrolling into view.
function scrollAndTrack(
  el: HTMLElement,
  setCursorRect: (r: DOMRect) => void,
  runIdRef: { current: number },
  runId: number,
  maxMs = 550,
): Promise<void> {
  el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  return new Promise((resolve) => {
    const start = Date.now();
    let lastTop: number | null = null;
    let stableFrames = 0;
    const tick = () => {
      if (runIdRef.current !== runId) return resolve();
      const rect = el.getBoundingClientRect();
      setCursorRect(rect);
      // Settle detection: stop once the element has stopped moving for a few
      // frames, or after maxMs as a safety cap for very long scrolls.
      if (lastTop !== null && Math.abs(rect.top - lastTop) < 0.5) stableFrames += 1;
      else stableFrames = 0;
      lastTop = rect.top;
      if (stableFrames >= 4 || Date.now() - start > maxMs) return resolve();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [, navigate] = useLocation();
  const [active, setActive] = useState(false);
  const [paused, setPaused] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [cursorRect, setCursorRect] = useState<DOMRect | null>(null);

  const pausedRef = useRef(false);
  const runIdRef = useRef(0);

  const waitWhilePaused = useCallback(async (runId: number) => {
    while (pausedRef.current && runIdRef.current === runId) {
      await sleep(150);
    }
  }, []);

  const runAction = useCallback(async (action: DemoAction, runId: number) => {
    await waitWhilePaused(runId);
    if (runIdRef.current !== runId) return;

    if (action.type === 'wait') {
      await sleep(action.ms ?? 400);
      return;
    }

    if (action.type === 'clickText') {
      const el = findByText(action.value!);
      if (!el) return;
      await scrollAndTrack(el, setCursorRect, runIdRef, runId);
      if (runIdRef.current !== runId) return;
      await sleep(150);
      el.click();
      await sleep(300);
      return;
    }

    const el = await waitForElement(action.selector!, runIdRef, runId);
    if (!el || runIdRef.current !== runId) return;
    await scrollAndTrack(el, setCursorRect, runIdRef, runId);
    if (runIdRef.current !== runId) return;

    if (action.type === 'click') {
      el.click();
      await sleep(350);
    } else if (action.type === 'type') {
      await typeIntoElement(el as HTMLInputElement, action.value ?? '', runIdRef, runId);
      await sleep(150);
    } else if (action.type === 'select') {
      el.click();
      await sleep(300);
      const optionEl = await waitForElement('[role="option"]', runIdRef, runId, 2000);
      if (!optionEl) return;
      const opts = Array.from(document.querySelectorAll('[role="option"]')) as HTMLElement[];
      const target = opts.find((o) => o.textContent?.trim() === action.value);
      if (target) {
        // Let the dropdown finish opening, then measure so the ring lands on
        // the option's settled position (not mid open-animation).
        await sleep(150);
        if (runIdRef.current !== runId) return;
        target.scrollIntoView({ block: 'nearest' });
        setCursorRect(target.getBoundingClientRect());
        await sleep(250);
        if (runIdRef.current !== runId) return;
        target.click();
      }
      await sleep(300);
    }
  }, [waitWhilePaused]);

  const playFrom = useCallback(async (startIndex: number, runId: number) => {
    for (let i = startIndex; i < DEMO_STEPS.length; i++) {
      if (runIdRef.current !== runId) return;
      const step = DEMO_STEPS[i];
      setCurrentStepIndex(i);
      if (window.location.pathname !== step.route) {
        navigate(step.route);
        await sleep(600);
      }
      for (const action of step.actions) {
        if (runIdRef.current !== runId) return;
        await runAction(action, runId);
      }
    }
    if (runIdRef.current === runId) {
      // Demo finished: keep the controls bar (with Exit) visible and stay in
      // demo mode — saves remain suppressed — until the presenter clicks Exit,
      // which restores their real state. Prevents synthetic data leaking into a
      // real save after the run.
      setCursorRect(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runAction, navigate]);

  const start = useCallback(() => {
    setDemoMode(true); // suppress all persistence for the duration of the demo
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) sessionStorage.setItem(BACKUP_KEY, existing);
    localStorage.removeItem(STORAGE_KEY);

    runIdRef.current += 1;
    const runId = runIdRef.current;
    pausedRef.current = false;
    setPaused(false);
    setCurrentStepIndex(0);
    setActive(true);
    navigate(DEMO_STEPS[0].route);
    sleep(400).then(() => playFrom(0, runId));
  }, [navigate, playFrom]);

  const togglePause = useCallback(() => {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
  }, []);

  const exit = useCallback(() => {
    runIdRef.current += 1; // stop the play loop before tearing down
    setActive(false);
    setPaused(false);
    pausedRef.current = false;
    setCursorRect(null);
    endDemoCleanup();
  }, []);

  const value: DemoContextValue = {
    active,
    paused,
    currentStepIndex,
    totalSteps: DEMO_STEPS.length,
    currentStepLabel: DEMO_STEPS[currentStepIndex]?.label ?? '',
    investorLabel: DEMO_INVESTOR_LABEL,
    cursorRect,
    start,
    togglePause,
    exit,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}
