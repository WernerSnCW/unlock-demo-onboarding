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

  const handleLoadMore = () => {
    setVisibleItems(prev => Math.min(prev + 3, items.length));
    onLoadMore();
  };

  if (!items.length) {
    return (
      <div className="space-y-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-6 text-center">
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
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-4">
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
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    frequency === freq
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
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
              className={`relative w-11 h-6 rounded-full transition-colors ${
                whatsappEnabled ? 'bg-[var(--primary)]' : 'bg-[var(--muted)]'
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
            className="bg-[var(--primary)] text-[var(--primary-foreground)] px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}