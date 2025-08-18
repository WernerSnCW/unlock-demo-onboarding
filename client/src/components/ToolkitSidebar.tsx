export default function ToolkitSidebar() {
  return (
    <div className="space-y-6">
      
      {/* About Section */}
      <div className="bg-[var(--card)] rounded-[var(--radius-lg)] border border-[var(--border)] p-6">
        <h3 className="text-lg font-semibold text-[var(--card-foreground)] mb-3">
          <i className="fas fa-info-circle mr-2 text-[var(--primary)]" aria-hidden="true"></i>
          About These Tools
        </h3>
        <div className="text-sm text-[var(--muted-foreground)] space-y-3">
          <p>
            These calculators help model EIS and SEIS tax relief scenarios based on current HMRC rules and annual limits.
          </p>
          <p>
            Use them to understand potential tax benefits, plan investment timing, and model downside scenarios.
          </p>
          <p className="font-medium text-[var(--card-foreground)]">
            Remember: All calculations are illustrative only and subject to your personal circumstances.
          </p>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="bg-[var(--card)] rounded-[var(--radius-lg)] border border-[var(--border)] p-6">
        <h3 className="text-lg font-semibold text-[var(--card-foreground)] mb-4">
          <i className="fas fa-question-circle mr-2 text-[var(--secondary)]" aria-hidden="true"></i>
          Frequently Asked
        </h3>
        <div className="space-y-4">
          
          <div>
            <h4 className="text-sm font-semibold text-[var(--card-foreground)] mb-1">
              What's the difference between EIS and SEIS?
            </h4>
            <p className="text-xs text-[var(--muted-foreground)]">
              EIS offers 30% relief on up to £1m (£2m for KICs), while SEIS provides 50% relief on up to £200k. 
              SEIS is for early-stage companies.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--card-foreground)] mb-1">
              How does carry-back work?
            </h4>
            <p className="text-xs text-[var(--muted-foreground)]">
              You can carry back current year subscriptions to the previous tax year, subject to that year's 
              limits and income tax liability.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--card-foreground)] mb-1">
              What if my investment fails?
            </h4>
            <p className="text-xs text-[var(--muted-foreground)]">
              Loss relief may be available on your effective loss (after upfront relief) against either 
              income tax or capital gains tax.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--card-foreground)] mb-1">
              EIS vs SEIS for CGT deferral?
            </h4>
            <p className="text-xs text-[var(--muted-foreground)]">
              EIS offers unlimited deferral (within timing window); SEIS provides 50% exemption on up to £200k invested.
            </p>
          </div>

        </div>
      </div>

      {/* Premium Sneak Preview */}
      <div className="bg-gradient-to-br from-[var(--primary)]/5 to-[var(--secondary)]/5 rounded-[var(--radius-lg)] border border-[var(--primary)]/20 p-6 relative overflow-hidden">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 right-4">
            <i className="fas fa-lock text-6xl text-[var(--primary)]" aria-hidden="true"></i>
          </div>
        </div>
        
        <div className="relative">
          <h3 className="text-lg font-semibold text-[var(--card-foreground)] mb-2">
            <i className="fas fa-crown mr-2 text-[var(--accent)]" aria-hidden="true"></i>
            Advanced Tools
            <span className="text-xs bg-[var(--accent)] text-black px-2 py-1 rounded-full ml-2 font-medium">
              Premium
            </span>
          </h3>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Preview only • Unlock Pro adds deeper modelling and exports
          </p>

          {/* Locked Feature Tiles */}
          <div className="space-y-3 mb-4">
            
            <div className="bg-white/50 border border-[var(--border)]/50 rounded-[var(--radius-md)] p-3 flex items-center gap-3 opacity-60">
              <div className="w-8 h-8 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-chart-pie text-[var(--primary)] text-sm" aria-hidden="true"></i>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-[var(--card-foreground)]">Portfolio Diversification</h4>
                <p className="text-xs text-[var(--muted-foreground)]">Simulator</p>
              </div>
              <i className="fas fa-lock text-[var(--muted-foreground)] text-sm" aria-hidden="true"></i>
            </div>

            <div className="bg-white/50 border border-[var(--border)]/50 rounded-[var(--radius-md)] p-3 flex items-center gap-3 opacity-60">
              <div className="w-8 h-8 bg-[var(--secondary)]/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-chart-line text-[var(--secondary)] text-sm" aria-hidden="true"></i>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-[var(--card-foreground)]">Exit/Downside Scenario</h4>
                <p className="text-xs text-[var(--muted-foreground)]">Analysis</p>
              </div>
              <i className="fas fa-lock text-[var(--muted-foreground)] text-sm" aria-hidden="true"></i>
            </div>

            <div className="bg-white/50 border border-[var(--border)]/50 rounded-[var(--radius-md)] p-3 flex items-center gap-3 opacity-60">
              <div className="w-8 h-8 bg-[var(--accent)]/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-tachometer-alt text-[var(--accent)] text-sm" aria-hidden="true"></i>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-[var(--card-foreground)]">Enhanced Tax Planning</h4>
                <p className="text-xs text-[var(--muted-foreground)]">Dashboard</p>
              </div>
              <i className="fas fa-lock text-[var(--muted-foreground)] text-sm" aria-hidden="true"></i>
            </div>

          </div>

          {/* CTA Button */}
          <button 
            className="w-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-medium py-3 px-4 rounded-[var(--radius-md)] text-sm transition-all hover:shadow-lg cursor-not-allowed opacity-75"
            disabled
          >
            <i className="fas fa-crown mr-2" aria-hidden="true"></i>
            Upgrade to Pro
          </button>
          
          <p className="text-xs text-[var(--muted-foreground)] text-center mt-2">
            Coming soon with advanced modeling features
          </p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-[var(--card)] rounded-[var(--radius-lg)] border border-[var(--border)] p-6">
        <h3 className="text-lg font-semibold text-[var(--card-foreground)] mb-3">
          <i className="fas fa-external-link-alt mr-2 text-[var(--muted-foreground)]" aria-hidden="true"></i>
          Resources
        </h3>
        <div className="space-y-2">
          <a 
            href="https://www.gov.uk/guidance/venture-capital-schemes-apply-for-advance-assurance" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block text-sm text-[var(--primary)] hover:underline"
          >
            <i className="fas fa-link mr-1" aria-hidden="true"></i>
            HMRC EIS/SEIS Guidance
          </a>
          <a 
            href="https://www.gov.uk/guidance/venture-capital-schemes-tax-relief" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block text-sm text-[var(--primary)] hover:underline"
          >
            <i className="fas fa-link mr-1" aria-hidden="true"></i>
            Tax Relief Details
          </a>
          <a 
            href="https://www.gov.uk/capital-gains-tax" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block text-sm text-[var(--primary)] hover:underline"
          >
            <i className="fas fa-link mr-1" aria-hidden="true"></i>
            Capital Gains Tax
          </a>
        </div>
      </div>

    </div>
  );
}