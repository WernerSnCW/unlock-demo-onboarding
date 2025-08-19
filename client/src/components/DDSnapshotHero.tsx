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
    <div className="bg-[var(--primary)] border border-[var(--primary)] rounded-2xl p-6 mb-6 shadow-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[var(--primary-foreground)] mb-2">
          Request a Due Diligence Snapshot
        </h2>
        <p className="text-[var(--primary-foreground)]/80">
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
              className="w-full px-4 py-3 bg-white border border-white/20 rounded-xl shadow-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all"
            />
          </div>
          <button
            type="submit"
            aria-label="Request snapshot"
            className="px-6 py-3 bg-white text-[var(--primary)] font-semibold rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[var(--primary)] transition-all shadow-sm hover:shadow-md flex-shrink-0"
          >
            Request Snapshot
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
            className="w-full px-4 py-3 bg-white border border-white/20 rounded-xl shadow-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all"
          />
          <button
            type="submit"
            aria-label="Request snapshot"
            className="w-full px-6 py-3 bg-white text-[var(--primary)] font-semibold rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[var(--primary)] transition-all shadow-sm hover:shadow-md"
          >
            Request Snapshot
          </button>
        </div>

        <p className="text-sm text-[var(--primary-foreground)]/70 text-center">
          Snapshots use only publicly available data. This is not financial advice.
        </p>
      </form>

      {/* Quick Stats */}
      <div className="mt-6 pt-4 border-t border-[var(--primary-foreground)]/20">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-[var(--primary-foreground)]">2.3M+</div>
            <div className="text-xs text-[var(--primary-foreground)]/70">Companies</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-[var(--primary-foreground)]">45s</div>
            <div className="text-xs text-[var(--primary-foreground)]/70">Avg. Time</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-[var(--primary-foreground)]">99.2%</div>
            <div className="text-xs text-[var(--primary-foreground)]/70">Accuracy</div>
          </div>
        </div>
      </div>
    </div>
  );
}