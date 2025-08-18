import { Link } from 'wouter';
import TrustMarker from './TrustMarker';

interface Company {
  id: string;
  name: string;
  sector: string;
  verified: boolean;
  peerShortlistPct: number;
}

interface WatchlistProps {
  companies: Company[];
  onToolOpen?: (toolId: string) => void;
}

export default function Watchlist({ companies, onToolOpen }: WatchlistProps) {
  if (!companies.length) {
    return (
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--card-foreground)]">
            Business Watchlist
          </h3>
        </div>
        
        <div className="text-center py-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--muted)] flex items-center justify-center">
            <i className="fas fa-building text-lg text-[var(--muted-foreground)]"></i>
          </div>
          <p className="text-[var(--muted-foreground)] mb-4 text-sm">
            No saved businesses yet. Add from News or the Index.
          </p>
          <Link href="/businesses" className="text-[var(--accent)] text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--ring)]">
            Browse Businesses →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--card-foreground)]">
          Business Watchlist
        </h3>
      </div>
      
      <div className="space-y-3">
        {companies.slice(0, 3).map((company) => (
          <div 
            key={company.id}
            className="flex items-center justify-between hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-[var(--card-foreground)] truncate text-sm">
                  {company.name}
                </h4>
                {company.verified && (
                  <span className="inline-flex items-center text-xs">✅</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--muted-foreground)]">
                  {company.sector}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <TrustMarker type="peer" value={company.peerShortlistPct} />
              <button
                onClick={() => onToolOpen?.('dd_snapshot')}
                className="bg-[var(--muted)] text-[var(--muted-foreground)] px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              >
                Request DD
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="pt-4 border-t border-[var(--border)] text-center">
        <Link href="/businesses" className="text-[var(--accent)] text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--ring)]">
          View all businesses →
        </Link>
      </div>
    </div>
  );
}