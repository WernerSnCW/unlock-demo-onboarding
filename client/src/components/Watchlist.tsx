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
        <h3 className="text-lg font-semibold text-[var(--card-foreground)] mb-4">
          Business Watchlist
        </h3>
        
        <div className="text-center py-6">
          <p className="text-[var(--muted-foreground)] mb-4">
            No saved businesses yet. Add from News or the Index.
          </p>
          <Link href="/businesses">
            <a className="bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              Browse Businesses
            </a>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-[var(--card-foreground)] mb-4">
        Business Watchlist
      </h3>
      
      <div className="space-y-3">
        {companies.map((company) => (
          <div 
            key={company.id}
            className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-lg"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm text-[var(--card-foreground)] truncate">
                  {company.name}
                </h4>
                {company.verified && (
                  <TrustMarker type="verified" />
                )}
              </div>
              
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[var(--muted-foreground)]">
                  {company.sector}
                </span>
                <TrustMarker type="peer" value={company.peerShortlistPct} />
              </div>
            </div>
            
            <Link href={`/business/${company.id}`}>
              <a className="bg-[var(--primary)] text-[var(--primary-foreground)] px-3 py-1 rounded text-xs font-medium hover:opacity-90 transition-opacity ml-3">
                Open Snapshot
              </a>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}