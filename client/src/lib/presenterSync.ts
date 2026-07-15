// Presenter sync — a same-origin link between the live onboarding flow and the
// advisor's second-screen "Presenter" window.
//
// The main app calls broadcastStep(stepId) whenever a step mounts; the presenter
// window subscribes and follows along. Uses BroadcastChannel (instant, same
// origin, across windows/tabs) with a localStorage mirror so a presenter window
// opened mid-flow can initialise to the current step, and as a fallback via
// 'storage' events on browsers/contexts where BroadcastChannel is unavailable.

const CHANNEL = 'unlock-presenter-step';
const STORAGE_KEY = 'unlock-presenter-step';
const PRESENTER_PATH = '/onboarding-v2/presenter';

function getChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return null;
  try {
    return new BroadcastChannel(CHANNEL);
  } catch {
    return null;
  }
}

// Called by the main flow (OnboardingLayout) on each step.
export function broadcastStep(stepId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, stepId);
  } catch {
    /* storage disabled */
  }
  const ch = getChannel();
  if (ch) {
    ch.postMessage({ stepId });
    ch.close();
  }
}

// The step the flow was last on (for the presenter window's initial render).
export function getInitialStep(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

// Presenter window subscribes to live step changes. Returns an unsubscribe fn.
export function subscribeToStep(onStep: (stepId: string) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const ch = getChannel();
  const onMessage = (e: MessageEvent) => {
    const stepId = e?.data?.stepId;
    if (typeof stepId === 'string') onStep(stepId);
  };
  ch?.addEventListener('message', onMessage);

  // Fallback / cross-window: 'storage' fires in OTHER windows when the key is set.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && typeof e.newValue === 'string') onStep(e.newValue);
  };
  window.addEventListener('storage', onStorage);

  return () => {
    ch?.removeEventListener('message', onMessage);
    ch?.close();
    window.removeEventListener('storage', onStorage);
  };
}

// Open (or re-focus) the presenter window on a second screen. Popup sizing is a
// hint; the advisor drags it to their other display.
export function openPresenterWindow(): void {
  if (typeof window === 'undefined') return;
  const features = 'popup,width=560,height=820,noopener=no';
  const win = window.open(PRESENTER_PATH, 'unlock-presenter', features);
  win?.focus();
}
