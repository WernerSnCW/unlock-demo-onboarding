import { useState } from 'react';
import AllowanceCalculator from '../components/AllowanceCalculator';
import LossReliefCalculator from '../components/LossReliefCalculator';
import CGTDeferralCalculator from '../components/CGTDeferralCalculator';
import ToolkitSidebar from '../components/ToolkitSidebar';

export default function Toolkit() {
  const [openAccordion, setOpenAccordion] = useState<string>('allowance');

  const toggleAccordion = (accordionId: string) => {
    setOpenAccordion(openAccordion === accordionId ? '' : accordionId);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
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
            <ToolkitSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}