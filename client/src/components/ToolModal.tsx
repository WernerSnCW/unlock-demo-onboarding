import { useState, useEffect } from 'react';
import { Link } from 'wouter';

interface ToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolId: string;
}

const toolDetails: Record<string, {
  name: string;
  description: string;
  icon: string;
  inputs: { label: string; placeholder: string; type?: string }[];
}> = {
  company_search: {
    name: 'Company Search',
    description: 'Find and research UK businesses by name, sector, or location.',
    icon: 'fas fa-search',
    inputs: [
      { label: 'Company Name', placeholder: 'Enter company name...' },
      { label: 'Sector', placeholder: 'Select sector...' },
      { label: 'Location', placeholder: 'Enter location...' }
    ]
  },
  eis_allowance: {
    name: 'EIS Allowance Calculator',
    description: 'Calculate your Enterprise Investment Scheme tax relief allowance.',
    icon: 'fas fa-calculator',
    inputs: [
      { label: 'Annual Income', placeholder: '£0', type: 'number' },
      { label: 'Investment Amount', placeholder: '£0', type: 'number' },
      { label: 'Tax Year', placeholder: '2024-25' }
    ]
  },
  risk_profiler: {
    name: 'Risk Profiler',
    description: 'Assess your investment portfolio risk and get personalized recommendations.',
    icon: 'fas fa-chart-line',
    inputs: [
      { label: 'Portfolio Value', placeholder: '£0', type: 'number' },
      { label: 'Investment Horizon', placeholder: 'Select timeframe...' },
      { label: 'Risk Tolerance', placeholder: 'Select preference...' }
    ]
  },
  sector_insights: {
    name: 'Sector Insights',
    description: 'Get market trends and analysis for specific business sectors.',
    icon: 'fas fa-industry',
    inputs: [
      { label: 'Primary Sector', placeholder: 'Select sector...' },
      { label: 'Geographic Focus', placeholder: 'Select region...' },
      { label: 'Time Period', placeholder: 'Last 12 months' }
    ]
  },
  dd_snapshot: {
    name: 'Due Diligence Snapshot',
    description: 'Generate comprehensive due diligence report for target business.',
    icon: 'fas fa-file-alt',
    inputs: [
      { label: 'Company Name', placeholder: 'Enter target company...' },
      { label: 'Analysis Depth', placeholder: 'Standard report' },
      { label: 'Focus Areas', placeholder: 'Select key areas...' }
    ]
  }
};

function ChartStub() {
  return (
    <div className="bg-[var(--muted)] rounded-[var(--radius-sm)] p-6 text-center">
      <div className="w-16 h-16 mx-auto mb-3 bg-[var(--card)] rounded-full flex items-center justify-center">
        <i className="fas fa-chart-bar text-2xl text-[var(--muted-foreground)]"></i>
      </div>
      <p className="text-sm text-[var(--muted-foreground)]">
        Interactive charts and analysis will appear here
      </p>
    </div>
  );
}

export default function ToolModal({ isOpen, onClose, toolId }: ToolModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  const tool = toolDetails[toolId];

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Simulate loading delay
      const timer = setTimeout(() => setIsLoading(false), Math.random() * 300 + 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, toolId]);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeydown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !tool) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--muted)] rounded-full flex items-center justify-center">
                <i className={`${tool.icon} text-lg text-[var(--muted-foreground)]`}></i>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[var(--card-foreground)]">
                  {tool.name}
                </h2>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {tool.description}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-[var(--muted)] flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              aria-label="Close modal"
            >
              <i className="fas fa-times text-[var(--muted-foreground)]"></i>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="space-y-4">
              {/* Skeleton inputs */}
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-[var(--muted)] rounded w-24 animate-pulse"></div>
                  <div className="h-10 bg-[var(--muted)] rounded animate-pulse"></div>
                </div>
              ))}
              <div className="h-32 bg-[var(--muted)] rounded animate-pulse"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Input Fields */}
              <div className="space-y-4">
                {tool.inputs.map((input, index) => (
                  <div key={index} className="space-y-2">
                    <label className="text-sm font-medium text-[var(--card-foreground)]">
                      {input.label}
                    </label>
                    <input
                      type={input.type || 'text'}
                      placeholder={input.placeholder}
                      disabled
                      className="w-full px-3 py-2 bg-[var(--input)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--card-foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                ))}
              </div>

              {/* Chart Stub */}
              <ChartStub />

              {/* Premium Teaser */}
              <div className="bg-gradient-to-r from-[var(--primary)]/10 to-[var(--accent)]/10 border border-[var(--primary)]/20 rounded-[var(--radius-sm)] p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[var(--accent)] rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-crown text-sm text-[var(--accent-foreground)]"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--card-foreground)] mb-1">
                      Unlock Full Analysis
                    </h4>
                    <p className="text-sm text-[var(--muted-foreground)] mb-3">
                      Get complete insights, real-time data, and advanced analytics with Pro access.
                    </p>
                    <button 
                      disabled
                      className="text-[var(--accent)] text-sm font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Upgrade to Pro →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--muted)]/30">
          <div className="flex items-center justify-between mb-3">
            <button
              disabled
              className="bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 rounded-[var(--radius-sm)] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Run Analysis
            </button>
            <Link
              href="/toolkit"
              className="text-[var(--accent)] text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              onClick={onClose}
            >
              Open Toolkit →
            </Link>
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">
            This is not advice; businesses only.
          </p>
        </div>
      </div>
    </div>
  );
}