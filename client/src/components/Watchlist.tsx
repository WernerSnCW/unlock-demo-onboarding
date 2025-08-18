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
}

export default function Watchlist({ companies }: WatchlistProps) {
  if (!companies.length) {
    return (
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[var(--card-foreground)]">
            Business Watchlist
          </h3>
          <span className="text-xs text-[var(--muted-foreground)] bg-[var(--muted)] px-2 py-1 rounded-full">
            0 companies
          </span>
        </div>
        
        <div className="text-center py-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--muted)] flex items-center justify-center">
            <i className="fas fa-building text-xl text-[var(--muted-foreground)]"></i>
          </div>
          <p className="text-[var(--muted-foreground)] mb-4 text-sm">
            No saved businesses yet. Add from News or the Index.
          </p>
          <Link href="/businesses" className="bg-[var(--accent)] text-[var(--accent-foreground)] px-4 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--ring)]">
            Browse Businesses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[var(--card-foreground)]">
          Business Watchlist
        </h3>
        <span className="text-xs text-[var(--muted-foreground)] bg-[var(--muted)] px-2 py-1 rounded-full">
          {Math.min(companies.length, 3)} {companies.length === 1 ? 'company' : 'companies'}
        </span>
      </div>
      
      <div className="space-y-3">
        {companies.slice(0, 3).map((company) => (
          <div 
            key={company.id}
            className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-[var(--radius-sm)] hover:bg-[var(--accent)] hover:shadow-sm transition-all duration-200 group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-[var(--card-foreground)] group-hover:text-[var(--accent-foreground)] truncate" style={{ fontSize: '14px' }}>
                  {company.name}
                </h4>
                {company.verified && (
                  <span className="inline-flex items-center text-xs">✅</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--muted-foreground)] group-hover:text-[var(--accent-foreground)]">
                  {company.sector}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <TrustMarker type="peer" value={company.peerShortlistPct} />
              <Link 
                href={`/business/${company.id}`} 
                className="bg-[var(--primary)] text-[var(--primary-foreground)] px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              >
                Open Snapshot
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      {companies.length > 3 && (
        <div className="pt-4 border-t border-[var(--border)] text-center">
          <button className="text-[var(--accent)] text-sm font-medium hover:underline">
            View all {companies.length} companies →
          </button>
        </div>
      )}
    </div>
  );
}