interface WhatsAppConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WhatsAppConnectModal({ isOpen, onClose }: WhatsAppConnectModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
        aria-hidden="true"
      >
        {/* Modal */}
        <div 
          className="bg-[var(--card)] rounded-[var(--radius-lg)] w-full max-w-md shadow-xl"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-labelledby="whatsapp-connect-title"
          aria-modal="true"
        >
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
            <h2 id="whatsapp-connect-title" className="text-lg font-semibold text-[var(--card-foreground)] flex items-center gap-2">
              <i className="fab fa-whatsapp text-green-500" aria-hidden="true"></i>
              WhatsApp Connect
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--muted)] rounded-[var(--radius-sm)] transition-colors"
              aria-label="Close WhatsApp connect modal"
            >
              <i className="fas fa-times text-[var(--muted-foreground)]" aria-hidden="true"></i>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fab fa-whatsapp text-3xl text-green-500" aria-hidden="true"></i>
              </div>
              <h3 className="text-xl font-bold text-[var(--card-foreground)] mb-2">
                Get insights on the go
              </h3>
              <p className="text-[var(--muted-foreground)]">
                Receive personalized investment summaries and alerts directly on WhatsApp
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-[var(--card-foreground)]">Verification</h4>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    We'll send a one-time verification code to your WhatsApp number
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-[var(--card-foreground)]">Privacy First</h4>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Only essential market updates based on your preferences. No spam, ever.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-[var(--card-foreground)]">Smart Summaries</h4>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Concise, actionable insights tailored to your investment focus
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--muted)] rounded-[var(--radius-md)] p-4 mb-6">
              <div className="flex items-start gap-2">
                <i className="fas fa-info-circle text-[var(--primary)] mt-0.5" aria-hidden="true"></i>
                <div>
                  <p className="text-sm text-[var(--card-foreground)] font-medium mb-1">
                    Coming Soon
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    WhatsApp integration is currently in development. We'll notify you when it's ready!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--muted-foreground)]">
              Prototype stores settings locally only
            </p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-[var(--muted-foreground)] hover:text-[var(--card-foreground)] transition-colors"
              >
                Maybe Later
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-[var(--radius-md)] text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
                disabled
              >
                <i className="fab fa-whatsapp mr-2" aria-hidden="true"></i>
                Notify Me
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}