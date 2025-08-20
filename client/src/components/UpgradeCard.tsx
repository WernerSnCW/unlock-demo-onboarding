import { Link } from 'wouter';

export default function UpgradeCard() {
  return (
    <div className="relative bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-6 overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
      {/* Premium ribbon */}
      <div className="absolute top-3 right-3 bg-[var(--accent)] text-[var(--accent-foreground)] px-2 py-1 text-xs font-semibold rounded-[var(--radius-sm)]">
        Premium
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[var(--card-foreground)]">
          Deep-dive due diligence
        </h3>

        <div className="flex flex-wrap gap-1 text-sm text-[var(--muted-foreground)]">
          <span>Director checks</span>
          <span>•</span>
          <span>Web footprint</span>
          <span>•</span>
          <span>Business Q&A</span>
          <span>•</span>
          <span>Financial Analysis</span>
        </div>

        <button 
          className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] px-6 py-3 rounded-[var(--radius-sm)] font-semibold hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          disabled
        >
          Upgrade to Pro
        </button>

        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
          Keep free access to Snapshot reports.
        </p>
      </div>
    </div>
  );
}