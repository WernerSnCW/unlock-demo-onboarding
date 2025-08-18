interface NewsletterPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  newsItems: any[];
  frequency: string;
}

export default function NewsletterPreviewModal({ 
  isOpen, 
  onClose, 
  newsItems, 
  frequency 
}: NewsletterPreviewModalProps) {
  if (!isOpen) return null;

  const topItems = newsItems.slice(0, 5);
  const today = new Date().toLocaleDateString('en-GB', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

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
          className="bg-white dark:bg-[var(--card)] rounded-[var(--radius-lg)] w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-xl"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-labelledby="newsletter-preview-title"
          aria-modal="true"
        >
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
            <h2 id="newsletter-preview-title" className="text-xl font-bold text-[var(--card-foreground)]">
              Newsletter Preview
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--muted)] rounded-[var(--radius-sm)] transition-colors"
              aria-label="Close newsletter preview"
            >
              <i className="fas fa-times text-[var(--muted-foreground)]" aria-hidden="true"></i>
            </button>
          </div>

          {/* Email-style Content */}
          <div className="p-6 overflow-y-auto bg-[var(--background)]">
            
            {/* Email Header */}
            <div className="mb-6 text-center">
              <div className="inline-block">
                <h1 className="text-2xl font-bold text-[var(--primary)] mb-2">
                  Your Investment Intelligence
                </h1>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {frequency.charAt(0).toUpperCase() + frequency.slice(1)} digest • {today}
                </p>
              </div>
            </div>

            {/* Top Stories */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--card-foreground)] border-b border-[var(--border)] pb-2">
                Today's Top Stories
              </h3>
              
              {topItems.map((item, index) => (
                <div key={item.id} className="border border-[var(--border)] rounded-[var(--radius-md)] p-4 bg-[var(--card)]">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-[var(--card-foreground)] mb-1 leading-tight">
                        {item.title}
                      </h4>
                      <p className="text-sm text-[var(--muted-foreground)] mb-2">
                        {item.summary}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                        <span>{item.source}</span>
                        <span>•</span>
                        <span>{new Date(item.publishedAt || item.dateISO).toLocaleDateString()}</span>
                        {item.sentiment && (
                          <>
                            <span>•</span>
                            <span className={`px-2 py-1 rounded-full ${
                              item.sentiment === 'positive' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                              item.sentiment === 'negative' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}>
                              {item.sentiment}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-[var(--border)] text-center">
              <p className="text-sm text-[var(--muted-foreground)] mb-2">
                This is a preview of your {frequency} newsletter
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-[var(--muted-foreground)]">
                <span>Information only • No financial advice</span>
                <span>•</span>
                <span>Businesses only</span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between p-6 border-t border-[var(--border)] bg-[var(--card)]">
            <p className="text-sm text-[var(--muted-foreground)]">
              Actual newsletters will be sent to your email
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-[var(--radius-md)] text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </>
  );
}