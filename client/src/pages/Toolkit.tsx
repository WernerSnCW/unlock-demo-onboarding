import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AllowanceCalculator from '../components/AllowanceCalculator';
import LossReliefCalculator from '../components/LossReliefCalculator';
import CGTDeferralCalculator from '../components/CGTDeferralCalculator';

export default function Toolkit() {
  const [openAccordion, setOpenAccordion] = useState<string>('allowance');

  const toggleAccordion = (accordionId: string) => {
    setOpenAccordion(openAccordion === accordionId ? '' : accordionId);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      
      {/* Global Disclaimer */}
      <div className="bg-[var(--warning)]/10 border-b border-[var(--warning)]/20 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm">
            <i className="fas fa-exclamation-triangle text-[var(--warning)]" aria-hidden="true"></i>
            <span className="text-[var(--card-foreground)] font-medium">
              Educational illustration only. Unlock does not provide financial advice.
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--card-foreground)] mb-2">
            Tax Relief Toolkit
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Calculate EIS and SEIS allowances, loss relief, and CGT deferral scenarios
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Calculators */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Allowance Calculator */}
            <div className="bg-[var(--card)] rounded-[var(--radius-lg)] border border-[var(--border)] overflow-hidden">
              <button
                onClick={() => toggleAccordion('allowance')}
                className="w-full flex items-center justify-between p-6 hover:bg-[var(--muted)]/50 transition-colors text-left"
                aria-expanded={openAccordion === 'allowance'}
              >
                <div>
                  <h2 className="text-xl font-semibold text-[var(--card-foreground)] mb-1">
                    Allowance Calculator
                  </h2>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    EIS & SEIS annual limits and carry-back relief
                  </p>
                </div>
                <i 
                  className={`fas fa-chevron-down text-[var(--muted-foreground)] transition-transform ${
                    openAccordion === 'allowance' ? 'rotate-180' : ''
                  }`} 
                  aria-hidden="true"
                ></i>
              </button>
              
              {openAccordion === 'allowance' && (
                <div className="border-t border-[var(--border)]">
                  <AllowanceCalculator />
                </div>
              )}
            </div>

            {/* Loss Relief Calculator */}
            <div className="bg-[var(--card)] rounded-[var(--radius-lg)] border border-[var(--border)] overflow-hidden">
              <button
                onClick={() => toggleAccordion('loss-relief')}
                className="w-full flex items-center justify-between p-6 hover:bg-[var(--muted)]/50 transition-colors text-left"
                aria-expanded={openAccordion === 'loss-relief'}
              >
                <div>
                  <h2 className="text-xl font-semibold text-[var(--card-foreground)] mb-1">
                    Loss Relief Calculator
                  </h2>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Downside modeling after upfront relief
                  </p>
                </div>
                <i 
                  className={`fas fa-chevron-down text-[var(--muted-foreground)] transition-transform ${
                    openAccordion === 'loss-relief' ? 'rotate-180' : ''
                  }`} 
                  aria-hidden="true"
                ></i>
              </button>
              
              {openAccordion === 'loss-relief' && (
                <div className="border-t border-[var(--border)]">
                  <LossReliefCalculator />
                </div>
              )}
            </div>

            {/* CGT Deferral Calculator */}
            <div className="bg-[var(--card)] rounded-[var(--radius-lg)] border border-[var(--border)] overflow-hidden">
              <button
                onClick={() => toggleAccordion('cgt-deferral')}
                className="w-full flex items-center justify-between p-6 hover:bg-[var(--muted)]/50 transition-colors text-left"
                aria-expanded={openAccordion === 'cgt-deferral'}
              >
                <div>
                  <h2 className="text-xl font-semibold text-[var(--card-foreground)] mb-1">
                    CGT Deferral Calculator
                  </h2>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    EIS reinvestment deferral & SEIS 50% exemption
                  </p>
                </div>
                <i 
                  className={`fas fa-chevron-down text-[var(--muted-foreground)] transition-transform ${
                    openAccordion === 'cgt-deferral' ? 'rotate-180' : ''
                  }`} 
                  aria-hidden="true"
                ></i>
              </button>
              
              {openAccordion === 'cgt-deferral' && (
                <div className="border-t border-[var(--border)]">
                  <CGTDeferralCalculator />
                </div>
              )}
            </div>

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
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

              {/* Premium Preview */}
              <div className="bg-gradient-to-br from-[var(--primary)]/5 to-[var(--secondary)]/5 rounded-[var(--radius-lg)] border border-[var(--primary)]/20 p-6 relative overflow-hidden">
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
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}