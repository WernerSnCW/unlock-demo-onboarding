import { formatDistanceToNow } from 'date-fns';

interface NewsCardProps {
  id: string;
  title: string;
  summary: string;
  source: string;
  dateISO: string;
  image?: string;
  tags: string[];
  relevanceScore: number;
}

export default function NewsCard({ 
  id, 
  title, 
  summary, 
  source, 
  dateISO, 
  image, 
  tags, 
  relevanceScore 
}: NewsCardProps) {
  const handleAction = (action: string) => {
    console.log(`${action} clicked for news item:`, id);
  };

  const getConfidenceLabel = () => {
    return relevanceScore >= 0.7 ? 'High match' : '';
  };

  return (
    <article className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {image && (
          <div className="flex-shrink-0 w-16 h-16 bg-[var(--muted)] rounded-lg overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] opacity-20"></div>
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-[var(--card-foreground)] font-semibold text-sm leading-tight">
              {title}
            </h3>
            {getConfidenceLabel() && (
              <span className="flex-shrink-0 text-xs text-[var(--primary)] font-medium">
                {getConfidenceLabel()}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] mb-2">
            <span>{source}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(dateISO), { addSuffix: true })}</span>
          </div>
          
          <p className="text-[var(--muted-foreground)] text-sm mb-3" style={{ 
            display: '-webkit-box', 
            WebkitBoxOrient: 'vertical', 
            WebkitLineClamp: 2, 
            overflow: 'hidden' 
          }}>
            {summary}
          </p>
          
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.map((tag) => (
              <span 
                key={tag}
                className="inline-flex px-2 py-1 rounded text-xs bg-[var(--accent)] text-[var(--accent-foreground)]"
              >
                {tag}
              </span>
            ))}
            <button 
              className="text-xs text-[var(--primary)] hover:underline"
              title="Matched your sector/risk profile"
            >
              Why this?
            </button>
          </div>
          
          <div className="flex gap-3 text-xs">
            <button 
              onClick={() => handleAction('Save')}
              className="text-[var(--primary)] hover:underline"
            >
              Save
            </button>
            <button 
              onClick={() => handleAction('Add to Watchlist')}
              className="text-[var(--primary)] hover:underline"
            >
              Add to Watchlist
            </button>
            <button 
              onClick={() => handleAction('Share')}
              className="text-[var(--primary)] hover:underline"
            >
              Share
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}