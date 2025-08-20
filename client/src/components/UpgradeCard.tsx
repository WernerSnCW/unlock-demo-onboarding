import { Link } from 'wouter';

export default function UpgradeCard() {
  return (
    <div className="relative bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-6 overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
      {/* Pro ribbon */}
      <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 via-yellow-500 to-teal-400 text-white px-3 py-1 text-xs font-bold rounded-full shadow-sm flex items-center gap-1">
        <i className="fas fa-crown text-xs" aria-hidden="true"></i>
        PRO
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
          className="w-full bg-gradient-to-r from-[#5193B3] to-[#62C4C3] hover:from-[#4A85A3] hover:to-[#58B4B3] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl cursor-not-allowed opacity-75 relative overflow-hidden"
          disabled
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <i className="fas fa-crown text-sm" aria-hidden="true"></i>
            <span>Upgrade to Pro</span>
            <i className="fas fa-arrow-right text-sm" aria-hidden="true"></i>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        </button>

        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
          Keep free access to Snapshot reports.
        </p>
      </div>
    </div>
  );
}