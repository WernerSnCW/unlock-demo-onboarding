export default function UpgradeCard() {
  const handleUpgradeClick = () => {
    console.log({ event: "upgrade_cta_clicked" });
    
    // Show non-blocking info message
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 shadow-lg z-50';
    toast.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-sm text-[var(--card-foreground)]">Deep-dive is part of Pro (coming soon)</span>
        <button onclick="this.parentElement.parentElement.remove()" class="text-[var(--muted-foreground)] hover:text-[var(--card-foreground)] ml-2">×</button>
      </div>
    `;
    document.body.appendChild(toast);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 3000);
  };

  return (
    <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white rounded-[var(--radius)] p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-lg font-semibold">
          Deep-dive due diligence
        </h3>
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-white/20">
          🔒 Premium
        </span>
      </div>
      
      <ul className="space-y-2 mb-4 text-sm">
        <li className="flex items-center gap-2">
          <span className="w-1 h-1 bg-white rounded-full"></span>
          Director checks
        </li>
        <li className="flex items-center gap-2">
          <span className="w-1 h-1 bg-white rounded-full"></span>
          Filing timeline
        </li>
        <li className="flex items-center gap-2">
          <span className="w-1 h-1 bg-white rounded-full"></span>
          Web footprint
        </li>
        <li className="flex items-center gap-2">
          <span className="w-1 h-1 bg-white rounded-full"></span>
          Peer questions & answers
        </li>
      </ul>
      
      <button
        onClick={handleUpgradeClick}
        className="w-full bg-white text-[var(--primary)] py-3 px-4 rounded-lg font-semibold hover:bg-white/90 transition-colors mb-2"
      >
        Upgrade to Pro
      </button>
      
      <p className="text-xs opacity-90 text-center">
        Keep free access to Snapshot. No advice; businesses only.
      </p>
    </div>
  );
}