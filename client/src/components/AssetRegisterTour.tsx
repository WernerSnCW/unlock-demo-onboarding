import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  content: string;
  target?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: () => void;
  spotlight?: boolean;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome',
    content: 'Welcome to your Asset Register. This tour shows what everything is and how to read it.',
    placement: 'center',
    spotlight: false
  },
  {
    id: 'valuation',
    title: 'Valuation Snapshot',
    content: 'This shows the as-at date and that numbers are end-of-day in GBP. Reconcile notes sit below.',
    target: 'tour-valuation',
    placement: 'right'
  },
  {
    id: 'entities',
    title: 'Entities',
    content: 'Entities indicate who owns the assets (Personal / Spouse / Ltd). Use as global scope filters in the full build.',
    target: 'tour-entities',
    placement: 'right'
  },
  {
    id: 'wrappers',
    title: 'Wrappers',
    content: 'Wrappers are tax buckets: ISA, SIPP, GIA, Personal. In the full app, toggle to filter and see tax context.',
    target: 'tour-wrappers',
    placement: 'right'
  },
  {
    id: 'custodians',
    title: 'Custodians & Wallets',
    content: 'The source of truth for each holding (brokers, banks, wallets). Reconciliation is done per custodian.',
    target: 'tour-custodians',
    placement: 'right'
  },
  {
    id: 'beneficiary',
    title: 'Beneficiary (Estate)',
    content: 'Life-beat & fallback email for a read-only pack to your beneficiary if you go inactive (prototype concept).',
    target: 'tour-beneficiary',
    placement: 'right'
  },
  {
    id: 'quick-actions',
    title: 'Quick Actions',
    content: 'Add assets/liabilities, Import CSV, AI Import, Upload evidence. Density toggles compact spacing.',
    target: 'tour-quick-actions',
    placement: 'right'
  },
  {
    id: 'search',
    title: 'Search',
    content: 'Search instruments, accounts, and documents from anywhere.',
    target: 'tour-search',
    placement: 'bottom'
  },
  {
    id: 'currency',
    title: 'Currency',
    content: 'Base currency (demo only). In production this would drive conversion.',
    target: 'tour-currency',
    placement: 'bottom'
  },
  {
    id: 'reconciled',
    title: 'Reconciled Status',
    content: 'A quick status badge: green when all custodians are reconciled for the selected period.',
    target: 'tour-reconciled',
    placement: 'bottom'
  },
  {
    id: 'export',
    title: 'Export & Print',
    content: 'Export table data (demo only here). Print produces a clean, light report with a print stylesheet.',
    target: 'tour-export',
    placement: 'bottom'
  },
  {
    id: 'kpis',
    title: 'KPIs',
    content: 'At-a-glance: Total, Liquid, Property, Alternatives, Unrealised G/L, and Rebalance status.',
    target: 'tour-kpis',
    placement: 'bottom'
  },
  {
    id: 'tabs',
    title: 'Tabs',
    content: 'Navigate Holdings, Targets & Bands, Transactions, Documents, Reconciliation, and Household.',
    target: 'tour-tabs',
    placement: 'bottom'
  },
  {
    id: 'holdings-table',
    title: 'Holdings Table',
    content: 'One row per asset per wrapper. Sticky header & first column. Scroll to explore.',
    target: 'tour-holdings-table',
    placement: 'top'
  },
  {
    id: 'table-anatomy',
    title: 'Table Anatomy',
    content: 'Key columns: Identifier, Custodian, Wrapper tag, Units/Cost/Price/Value, Evidence, and Completeness.',
    target: 'tour-holdings-table',
    placement: 'top'
  },
  {
    id: 'wrapper-tags',
    title: 'Wrapper & Chain Tags',
    content: 'Wrapper tags (ISA/SIPP/GIA/Personal) reflect tax treatment; chain tags (e.g., Ethereum) mark on-chain assets.',
    target: 'tour-wrapper-tag',
    placement: 'top'
  },
  {
    id: 'evidence',
    title: 'Evidence States',
    content: 'Evidence shows proof on file: On file, Valuation due, or On-chain verify.',
    target: 'tour-evidence-pill',
    placement: 'top'
  },
  {
    id: 'completeness',
    title: 'Completeness',
    content: 'Completeness % = metadata + evidence + valuation freshness. Aim for 100%.',
    target: 'tour-completeness',
    placement: 'top'
  },
  {
    id: 'eis-countdown',
    title: 'EIS/SEIS Countdown',
    content: 'Private equity with EIS/SEIS shows a do-not-dispose countdown to preserve relief.',
    target: 'tour-eis-countdown',
    placement: 'top'
  },
  {
    id: 'targets',
    title: 'Targets & Bands',
    content: 'Buckets have targets and guard-bands. Suggested actions appear when you drift out of band.',
    target: 'tour-targets-table',
    placement: 'top',
    action: () => {
      const tab = document.querySelector('[data-testid="tab-targets"]') as HTMLElement;
      tab?.click();
    }
  },
  {
    id: 'transactions',
    title: 'Transactions',
    content: 'Audit trail for cost basis and proof (e.g., contract notes).',
    target: 'tour-transactions-table',
    placement: 'top',
    action: () => {
      const tab = document.querySelector('[data-testid="tab-transactions"]') as HTMLElement;
      tab?.click();
    }
  },
  {
    id: 'documents',
    title: 'Documents',
    content: 'Vault of proofs: statements, certificates, on-chain exports.',
    target: 'tour-docs-grid',
    placement: 'top',
    action: () => {
      const tab = document.querySelector('[data-testid="tab-documents"]') as HTMLElement;
      tab?.click();
    }
  },
  {
    id: 'reconciliation',
    title: 'Reconciliation',
    content: 'Per-custodian status: period, statement on file, differences.',
    target: 'tour-reconcile-cards',
    placement: 'top',
    action: () => {
      const tab = document.querySelector('[data-testid="tab-reconciliation"]') as HTMLElement;
      tab?.click();
    }
  },
  {
    id: 'missing',
    title: "What's Missing",
    content: "A What's missing list makes the register defensible.",
    target: 'tour-missing',
    placement: 'top'
  },
  {
    id: 'household',
    title: 'Household',
    content: 'Roll-ups by entity. Set ownership to get correct totals across the household.',
    target: 'tour-household',
    placement: 'top',
    action: () => {
      const tab = document.querySelector('[data-testid="tab-household"]') as HTMLElement;
      tab?.click();
    }
  },
  {
    id: 'density',
    title: 'Density',
    content: "Use Density for compact rows. That's the tour — you're set.",
    target: 'tour-density',
    placement: 'right'
  }
];

interface AssetRegisterTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AssetRegisterTour({ isOpen, onClose }: AssetRegisterTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [, setForceUpdate] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  // Update positions on scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    const updatePositions = () => {
      setForceUpdate(prev => prev + 1);
    };

    window.addEventListener('scroll', updatePositions, true);
    window.addEventListener('resize', updatePositions);

    return () => {
      window.removeEventListener('scroll', updatePositions, true);
      window.removeEventListener('resize', updatePositions);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const step = tourSteps[currentStep];
    
    // Execute step action if present
    if (step.action) {
      setTimeout(() => step.action!(), 100);
    }

    // Position the bubble (with delay after scrollIntoView)
    const positionBubble = () => {
      if (step.target) {
        const target = document.getElementById(step.target);
        if (target) {
          const rect = target.getBoundingClientRect();
          const bubbleWidth = 400;
          const bubbleHeight = 200;
          let top = 0;
          let left = 0;

          switch (step.placement) {
            case 'right':
              top = rect.top + rect.height / 2 - bubbleHeight / 2;
              left = rect.right + 20;
              break;
            case 'left':
              top = rect.top + rect.height / 2 - bubbleHeight / 2;
              left = rect.left - bubbleWidth - 20;
              break;
            case 'top':
              top = rect.top - bubbleHeight - 20;
              left = rect.left + rect.width / 2 - bubbleWidth / 2;
              break;
            case 'bottom':
              top = rect.bottom + 20;
              left = rect.left + rect.width / 2 - bubbleWidth / 2;
              break;
            default:
              top = rect.top + rect.height / 2 - bubbleHeight / 2;
              left = rect.right + 20;
          }

          // Keep bubble in viewport
          const maxTop = window.innerHeight - bubbleHeight - 20;
          const maxLeft = window.innerWidth - bubbleWidth - 20;
          top = Math.max(20, Math.min(top, maxTop));
          left = Math.max(20, Math.min(left, maxLeft));

          setPosition({ top, left });
        }
      }
    };

    // Scroll target into view first, then position after scroll completes
    setTimeout(() => {
      if (step.target) {
        const target = document.getElementById(step.target);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Position bubble after scroll animation
          setTimeout(positionBubble, 500);
        }
      } else {
        // Center bubble
        const bubbleWidth = 400;
        const bubbleHeight = 200;
        setPosition({
          top: window.innerHeight / 2 - bubbleHeight / 2,
          left: window.innerWidth / 2 - bubbleWidth / 2
        });
      }
    }, 150);

    // Save progress
    localStorage.setItem('assetRegisterTour_lastStep', String(currentStep));

    // Announce for screen readers
    const announcement = `Step ${currentStep + 1} of ${tourSteps.length}: ${step.title}`;
    const liveRegion = document.getElementById('tour-live-region');
    if (liveRegion) {
      liveRegion.textContent = announcement;
    }
  }, [currentStep, isOpen]);

  const handleClose = () => {
    localStorage.setItem('assetRegisterTour_completed', 'true');
    onClose();
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  if (!isOpen) return null;

  const step = tourSteps[currentStep];
  const targetEl = step.target ? document.getElementById(step.target) : null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[100]" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        {/* Spotlight */}
        {targetEl && step.spotlight !== false && (
          <div
            className="absolute border-4 border-[var(--primary)] rounded-lg shadow-2xl pointer-events-none transition-all duration-300"
            style={{
              top: targetEl.getBoundingClientRect().top - 12,
              left: targetEl.getBoundingClientRect().left - 12,
              width: targetEl.getBoundingClientRect().width + 24,
              height: targetEl.getBoundingClientRect().height + 24,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
            }}
          />
        )}

        {/* Coach Bubble */}
        <div
          ref={bubbleRef}
          className="absolute bg-[var(--card)] border-2 border-[var(--primary)] rounded-xl shadow-2xl p-6 w-[400px] transition-all duration-300"
          style={{
            top: position.top,
            left: position.left
          }}
          role="dialog"
          aria-labelledby="tour-title"
          aria-describedby="tour-content"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 id="tour-title" className="text-lg font-bold text-[var(--foreground)] mb-1">
                {step.title}
              </h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Step {currentStep + 1} of {tourSteps.length}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-[var(--muted)] rounded-lg transition-colors"
              aria-label="Close tour"
              data-testid="button-close-tour"
            >
              <X className="h-5 w-5 text-[var(--muted-foreground)]" />
            </button>
          </div>

          {/* Content */}
          <p id="tour-content" className="text-sm text-[var(--foreground)] mb-6 leading-relaxed">
            {step.content}
          </p>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              data-testid="button-skip-tour"
            >
              Skip tour
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className="px-4 py-2 bg-[var(--muted)] text-[var(--foreground)] rounded-lg hover:bg-[var(--muted)]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                data-testid="button-back-tour"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                data-testid="button-next-tour"
              >
                {currentStep === tourSteps.length - 1 ? 'Done' : 'Next'}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live region for screen readers */}
      <div
        id="tour-live-region"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />
    </>
  );
}

export function TourBeacon({ onClick }: { onClick: () => void }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem('assetRegisterTour_completed');
    if (!completed) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => {
        setShow(false);
        onClick();
      }}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full shadow-2xl flex items-center justify-center animate-pulse hover:scale-110 transition-transform"
      aria-label="Take a tour"
      data-testid="button-tour-beacon"
    >
      <HelpCircle className="h-7 w-7" />
    </button>
  );
}
