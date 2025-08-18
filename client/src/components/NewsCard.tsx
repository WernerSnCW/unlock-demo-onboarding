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
  onToolOpen?: (toolId: string) => void;
}

export default function NewsCard({ 
  id, 
  title, 
  summary, 
  source, 
  dateISO, 
  image, 
  tags, 
  relevanceScore,
  onToolOpen 
}: NewsCardProps) {
  const handleAction = (action: string) => {
    console.log(`${action} clicked for news item:`, id);
  };

  const getConfidenceLabel = () => {
    return relevanceScore >= 0.7 ? 'High match' : '';
  };

  const getThemeIcon = () => {
    const firstTag = tags[0]?.toLowerCase() || '';
    if (firstTag.includes('eis') || firstTag.includes('policy')) return 'fa-university';
    if (firstTag.includes('fintech') || firstTag.includes('filing')) return 'fa-chart-line';
    if (firstTag.includes('biotech') || firstTag.includes('funding')) return 'fa-flask';
    if (firstTag.includes('tech') || firstTag.includes('ai')) return 'fa-microchip';
    return 'fa-building';
  };

  const getThemeGradient = () => {
    const firstTag = tags[0]?.toLowerCase() || '';
    if (firstTag.includes('eis') || firstTag.includes('policy')) return 'from-blue-500 to-indigo-600';
    if (firstTag.includes('fintech') || firstTag.includes('filing')) return 'from-green-500 to-emerald-600';
    if (firstTag.includes('biotech') || firstTag.includes('funding')) return 'from-purple-500 to-violet-600';
    if (firstTag.includes('tech') || firstTag.includes('ai')) return 'from-orange-500 to-red-600';
    return 'from-gray-500 to-slate-600';
  };

  return (
    <article className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="flex gap-4">
        {/* Desktop: 56x56 image left, Mobile: stacked */}
        <div className="hidden md:block flex-shrink-0 w-14 h-14 bg-[var(--muted)] rounded-[var(--radius-sm)] overflow-hidden">
          <div className={`w-full h-full bg-gradient-to-br ${getThemeGradient()} flex items-center justify-center`}>
            <i className={`fas ${getThemeIcon()} text-white text-lg`}></i>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Mobile: stacked image */}
          <div className="md:hidden mb-3 w-full h-32 bg-[var(--muted)] rounded-[var(--radius-sm)] overflow-hidden">
            <div className={`w-full h-full bg-gradient-to-br ${getThemeGradient()} flex items-center justify-center`}>
              <i className={`fas ${getThemeIcon()} text-white text-3xl`}></i>
            </div>
          </div>
          
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-[var(--card-foreground)] font-semibold leading-tight" style={{ fontSize: '16px' }}>
              {title}
            </h3>
            {getConfidenceLabel() && (
              <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--success)] text-[var(--success-foreground)]">
                {getConfidenceLabel()}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-[var(--muted-foreground)] mb-3" style={{ fontSize: '12px' }}>
            <span>{source}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(dateISO), { addSuffix: true })}</span>
          </div>
          
          <p className="text-[var(--muted-foreground)] text-sm mb-4 leading-relaxed" style={{ 
            display: '-webkit-box', 
            WebkitBoxOrient: 'vertical', 
            WebkitLineClamp: 2, 
            overflow: 'hidden' 
          }}>
            {summary}
          </p>
          
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.slice(0, 3).map((tag) => (
              <span 
                key={tag}
                className="inline-flex px-2 py-1 rounded-[var(--radius-sm)] text-xs font-medium bg-[var(--muted)] text-[var(--muted-foreground)]"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="inline-flex px-2 py-1 rounded-[var(--radius-sm)] text-xs font-medium bg-[var(--muted)] text-[var(--muted-foreground)]">
                +{tags.length - 3}
              </span>
            )}
            <button 
              className="text-xs text-[var(--accent)] hover:underline font-medium"
              title="Matched your sector/risk profile"
            >
              Why this?
            </button>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => handleAction('Save')}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-[var(--radius-sm)] text-xs font-medium bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            >
              <i className="fas fa-bookmark text-xs"></i>
              Save
            </button>
            <button 
              onClick={() => handleAction('Add to Watchlist')}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-[var(--radius-sm)] text-xs font-medium bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            >
              <i className="fas fa-eye text-xs"></i>
              Watchlist
            </button>
            <button 
              onClick={() => handleAction('Share')}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-[var(--radius-sm)] text-xs font-medium bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            >
              <i className="fas fa-share text-xs"></i>
              Share
            </button>
            <button 
              onClick={() => onToolOpen?.('sector_insights')}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-[var(--radius-sm)] text-xs font-medium bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            >
              <i className="fas fa-chart-line text-xs"></i>
              Insights
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}