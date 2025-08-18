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
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[var(--card-foreground)]">
            Business Watchlist
          </h3>
          <span className="text-xs text-[var(--muted-foreground)] bg-[var(--muted)] px-2 py-1 rounded-full">
            0 companies
          </span>
        </div>
        
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--muted)] flex items-center justify-center">
            <i className="fas fa-building text-2xl text-[var(--muted-foreground)]"></i>
          </div>
          <p className="text-[var(--muted-foreground)] mb-4 text-sm">
            No saved businesses yet. Add from News or the Index.
          </p>
          <Link href="/businesses" className="bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            Browse Businesses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[var(--card-foreground)]">
          Business Watchlist
        </h3>
        <span className="text-xs text-[var(--muted-foreground)] bg-[var(--muted)] px-2 py-1 rounded-full">
          {companies.length} {companies.length === 1 ? 'company' : 'companies'}
        </span>
      </div>
      
      <div className="space-y-4">
        {companies.map((company) => (
          <div 
            key={company.id}
            className="group bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white font-semibold text-sm">
                    {company.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-[var(--card-foreground)] text-sm truncate">
                        {company.name}
                      </h4>
                      {company.verified && (
                        <TrustMarker type="verified" />
                      )}
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] mb-2">
                      {company.sector}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <TrustMarker type="peer" value={company.peerShortlistPct} />
                  <Link 
                    href={`/business/${company.id}`} 
                    className="bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity group-hover:scale-105 transform duration-200"
                  >
                    Open Snapshot
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}