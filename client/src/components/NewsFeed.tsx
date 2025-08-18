import { useState } from 'react';
import NewsCard from './NewsCard';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  dateISO: string;
  image?: string;
  tags: string[];
  relevanceScore: number;
}

interface NewsFeedProps {
  items: NewsItem[];
  frequency: string;
  whatsappEnabled: boolean;
  onChangeFrequency: (value: string) => void;
  onToggleWhatsapp: (value: boolean) => void;
  onLoadMore: () => void;
}

export default function NewsFeed({
  items,
  frequency,
  whatsappEnabled,
  onChangeFrequency,
  onToggleWhatsapp,
  onLoadMore
}: NewsFeedProps) {
  const [visibleItems, setVisibleItems] = useState(3);
  const [loading, setLoading] = useState(false);

  const handleLoadMore = () => {
    setLoading(true);
    setVisibleItems(prev => Math.min(prev + 3, items.length));
    onLoadMore();
    // Simulate loading delay
    setTimeout(() => setLoading(false), 600);
  };

  if (!items.length) {
    return (
      <div className="space-y-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-6 text-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--muted)] flex items-center justify-center">
            <i className="fas fa-newspaper text-xl text-[var(--muted-foreground)]"></i>
          </div>
          <h3 className="text-lg font-semibold text-[var(--card-foreground)] mb-2">
            No new insights today
          </h3>
          <p className="text-[var(--muted-foreground)] text-sm">
            Try broadening sectors or set Weekly updates.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--card-foreground)]">
              Newsletter Frequency
            </label>
            <div className="flex gap-2">
              {['daily', 'weekly', 'monthly'].map((freq) => (
                <button
                  key={freq}
                  onClick={() => onChangeFrequency(freq)}
                  className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-sm font-medium transition-colors ${
                    frequency === freq
                      ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                      : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]'
                  }`}
                >
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <label htmlFor="whatsapp-toggle" className="text-sm font-medium text-[var(--card-foreground)]">
              WhatsApp Alerts
            </label>
            <button
              id="whatsapp-toggle"
              onClick={() => onToggleWhatsapp(!whatsappEnabled)}
              className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] ${
                whatsappEnabled ? 'bg-[var(--accent)]' : 'bg-[var(--muted)]'
              }`}
              aria-pressed={whatsappEnabled}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  whatsappEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* News Items */}
      <div className="space-y-4">
        {items.slice(0, visibleItems).map((item) => (
          <NewsCard key={item.id} {...item} />
        ))}
      </div>

      {/* Load More */}
      {visibleItems < items.length && (
        <div className="text-center">
          <button
            onClick={handleLoadMore}
            className="inline-flex items-center gap-2 bg-[var(--accent)] text-[var(--accent-foreground)] px-6 py-2.5 rounded-[var(--radius-sm)] font-medium hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ring)] aria-label='Load more news articles'"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span>Load more</span>
                <i className="fas fa-chevron-down text-xs"></i>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}