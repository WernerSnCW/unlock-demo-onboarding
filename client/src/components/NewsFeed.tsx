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
  onLoadMore: () => void;
}

export default function NewsFeed({
  items,
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
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-[var(--card-foreground)]">
          News & Insights Feed
        </h2>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-6 text-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--muted)] flex items-center justify-center">
            <i className="fas fa-newspaper text-xl text-[var(--muted-foreground)]"></i>
          </div>
          <h3 className="text-lg font-semibold text-[var(--card-foreground)] mb-2">
            No items match your filters
          </h3>
          <p className="text-[var(--muted-foreground)] text-sm">
            Try Weekly or clear filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--card-foreground)]">
          News & Insights Feed
        </h2>
        
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
              className="inline-flex items-center gap-2 bg-[var(--accent)] text-[var(--accent-foreground)] px-6 py-2.5 rounded-[var(--radius-sm)] font-medium hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              aria-label="Load more news articles"
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
    </div>
  );
}