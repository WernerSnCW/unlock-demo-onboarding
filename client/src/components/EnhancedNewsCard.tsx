import { useState } from 'react';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt?: string;
  dateISO: string;
  tags: string[];
  sector: string;
  region?: string;
  tickers?: string[];
  topics?: string[];
  type: string;
  image: string;
  sentiment?: string;
  relevance: number;
  relatedIds?: string[];
}

interface EnhancedNewsCardProps {
  item: NewsItem;
  allItems: NewsItem[];
  onSave: (id: string) => void;
  onAskAbout: (headline: string, source: string) => void;
  isSaved: boolean;
  matchingPreferences: {
    sectors?: string[];
    topics?: string[];
    regions?: string[];
    tickers?: string[];
  };
}

export default function EnhancedNewsCard({
  item,
  allItems,
  onSave,
  onAskAbout,
  isSaved,
  matchingPreferences
}: EnhancedNewsCardProps) {
  const [showRelated, setShowRelated] = useState(false);

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h`;
    if (diffHours < 48) return '1d';
    return date.toLocaleDateString('en-GB');
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'negative': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const relatedItems = item.relatedIds 
    ? allItems.filter(newsItem => item.relatedIds?.includes(newsItem.id))
    : [];

  const whyThisReasons = [];
  if (matchingPreferences.sectors?.length) {
    whyThisReasons.push(`Sectors: ${matchingPreferences.sectors.join(', ')}`);
  }
  if (matchingPreferences.topics?.length) {
    whyThisReasons.push(`Topics: ${matchingPreferences.topics.join(', ')}`);
  }
  if (matchingPreferences.regions?.length) {
    whyThisReasons.push(`Regions: ${matchingPreferences.regions.join(', ')}`);
  }
  if (matchingPreferences.tickers?.length) {
    whyThisReasons.push(`Tickers: ${matchingPreferences.tickers.join(', ')}`);
  }

  return (
    <article className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden hover:shadow-lg transition-shadow">
      
      {/* Source Row */}
      <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--muted)]/30">
        <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[var(--card-foreground)]">{item.source}</span>
            <span>•</span>
            <span>{formatTimestamp(item.publishedAt || item.dateISO)}</span>
          </div>
          <a 
            href="#" 
            className="text-[var(--primary)] hover:text-[var(--primary)]/80 transition-colors"
            aria-label="View original source"
          >
            View source
          </a>
        </div>
      </div>

      <div className="p-6">
        {/* Main Content */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[var(--card-foreground)] mb-3 line-clamp-2 leading-tight">
            {item.title}
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] line-clamp-3 leading-relaxed">
            {item.summary}
          </p>
        </div>

        {/* AI Badges Row */}
        <div className="flex flex-wrap gap-2 mb-4 text-xs">
          {item.sentiment && (
            <span className={`px-2 py-1 rounded-full font-medium ${getSentimentColor(item.sentiment)}`}>
              {item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)}
            </span>
          )}
          <span className="px-2 py-1 rounded-full bg-[var(--secondary)] text-[var(--secondary-foreground)] font-medium">
            Match: {Math.round(item.relevance * 100)}%
          </span>
          {relatedItems.length > 0 && (
            <button
              onClick={() => setShowRelated(!showRelated)}
              className="px-2 py-1 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] font-medium hover:bg-[var(--accent)]/80 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              aria-expanded={showRelated}
            >
              Related: {relatedItems.length}
            </button>
          )}
        </div>

        {/* Related Stories (Expandable) */}
        {showRelated && relatedItems.length > 0 && (
          <div className="mb-4 p-3 bg-[var(--muted)] rounded-[var(--radius-md)]">
            <h4 className="text-xs font-medium text-[var(--card-foreground)] mb-2 uppercase tracking-wide">
              Related Stories
            </h4>
            <div className="space-y-2">
              {relatedItems.map((related) => (
                <div key={related.id} className="text-sm">
                  <h5 className="text-[var(--card-foreground)] line-clamp-1 hover:text-[var(--primary)] cursor-pointer transition-colors">
                    {related.title}
                  </h5>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {related.source} • {formatTimestamp(related.publishedAt || related.dateISO)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Price Context Stub */}
        {item.tickers && item.tickers.length > 0 && (
          <div className="mb-4 p-3 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-md)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {item.tickers.map((ticker) => (
                  <span key={ticker} className="text-xs font-mono bg-[var(--primary)] text-[var(--primary-foreground)] px-2 py-1 rounded">
                    {ticker}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                <div className="w-16 h-8 bg-[var(--muted)] rounded flex items-center justify-center">
                  ⌘⌘⌘
                </div>
                <button className="px-2 py-1 bg-[var(--muted)] rounded hover:bg-[var(--accent)] transition-colors">
                  1D
                </button>
                <button className="px-2 py-1 hover:bg-[var(--accent)] rounded transition-colors">
                  1W
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Why This? */}
        {whyThisReasons.length > 0 && (
          <div className="mb-4 p-3 bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-[var(--radius-md)]">
            <h4 className="text-xs font-medium text-[var(--primary)] mb-1 uppercase tracking-wide flex items-center gap-1">
              <i className="fas fa-lightbulb" aria-hidden="true"></i>
              Why this?
            </h4>
            <p className="text-xs text-[var(--card-foreground)]">
              {whyThisReasons.join(' • ')}
            </p>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {item.tags.map((tag) => (
            <span key={tag} className="inline-flex items-center px-2 py-1 text-xs font-medium bg-[var(--muted)] text-[var(--muted-foreground)] rounded-full">
              {tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSave(item.id)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-[var(--radius-md)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${
                isSaved
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--card-foreground)] hover:bg-[var(--muted)]'
              }`}
              aria-label={isSaved ? 'Remove from saved' : 'Save article'}
            >
              <i className={`fas ${isSaved ? 'fa-bookmark' : 'fa-bookmark-o'}`} aria-hidden="true"></i>
              {isSaved ? 'Saved' : 'Save'}
            </button>
            
            <button
              onClick={() => onAskAbout(item.title, item.source)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--card-foreground)] hover:bg-[var(--muted)] rounded-[var(--radius-md)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              aria-label="Ask assistant about this article"
            >
              <i className="fas fa-robot" aria-hidden="true"></i>
              Ask about this
            </button>
          </div>
          
          {item.type === 'insight' && (
            <div className="text-xs text-[var(--muted-foreground)] italic">
              Not advice.
            </div>
          )}
        </div>
      </div>
    </article>
  );
}