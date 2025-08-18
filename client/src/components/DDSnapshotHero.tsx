import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface DDSnapshotHeroProps {
  onToolOpen?: (toolId: string) => void;
}

export default function DDSnapshotHero({ onToolOpen }: DDSnapshotHeroProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Log telemetry
    console.log({
      event: 'dd_snapshot_requested',
      query: searchQuery,
      source: 'hero_block'
    });

    // Open the DD Snapshot tool with context
    onToolOpen?.('dd_snapshot');
    
    // Show confirmation
    toast({
      title: "Snapshot Request Submitted",
      description: `Generating due diligence snapshot for "${searchQuery}"`,
    });
  };

  return (
    <div className="bg-gradient-to-br from-[var(--secondary)]/10 to-[var(--primary)]/10 border border-[var(--border)] rounded-2xl p-6 mb-6 shadow-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[var(--card-foreground)] mb-2">
          Generate a Due Diligence Snapshot
        </h2>
        <p className="text-[var(--muted-foreground)]">
          Get comprehensive business intelligence and risk analysis in seconds
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Desktop: Horizontal layout */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter a company name, URL, or registration number"
              aria-label="Company search"
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl shadow-sm text-[var(--card-foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
            />
          </div>
          <button
            type="submit"
            aria-label="Generate snapshot"
            className="px-6 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold rounded-xl hover:bg-[var(--primary)]/90 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 transition-all shadow-sm hover:shadow-md flex-shrink-0"
          >
            Generate Snapshot
          </button>
        </div>

        {/* Mobile: Stacked layout */}
        <div className="md:hidden space-y-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter company name, URL, or registration number"
            aria-label="Company search"
            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl shadow-sm text-[var(--card-foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
          />
          <button
            type="submit"
            aria-label="Generate snapshot"
            className="w-full px-6 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold rounded-xl hover:bg-[var(--primary)]/90 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 transition-all shadow-sm hover:shadow-md"
          >
            Generate Snapshot
          </button>
        </div>

        <p className="text-sm text-[var(--muted-foreground)] text-center">
          Snapshots use only publicly available data. This is not financial advice.
        </p>
      </form>

      {/* Quick Stats */}
      <div className="mt-6 pt-4 border-t border-[var(--border)]/50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-[var(--card-foreground)]">2.3M+</div>
            <div className="text-xs text-[var(--muted-foreground)]">Companies</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-[var(--card-foreground)]">45s</div>
            <div className="text-xs text-[var(--muted-foreground)]">Avg. Time</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-[var(--card-foreground)]">99.2%</div>
            <div className="text-xs text-[var(--muted-foreground)]">Accuracy</div>
          </div>
        </div>
      </div>
    </div>
  );
}