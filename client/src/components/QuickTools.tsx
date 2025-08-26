import { useState, useEffect } from 'react';
import { Link } from 'wouter';

interface Tool {
  id: string;
  name: string;
  caption: string;
  icon: string;
  category: string;
}

interface QuickToolsProps {
  onToolOpen?: (toolId: string) => void;
}

const tools: Tool[] = [
  {
    id: 'company_search',
    name: 'Company Search',
    caption: 'Find businesses',
    icon: 'fas fa-search',
    category: 'research'
  },
  {
    id: 'eis_allowance',
    name: 'EIS Allowance',
    caption: 'Tax calculator',
    icon: 'fas fa-calculator',
    category: 'finance'
  },
  {
    id: 'risk_profiler',
    name: 'Risk Profiler',
    caption: 'Assess portfolio',
    icon: 'fas fa-chart-line',
    category: 'analysis'
  },
  {
    id: 'sector_insights',
    name: 'Sector Insights',
    caption: 'Market trends',
    icon: 'fas fa-industry',
    category: 'research'
  },
  {
    id: 'dd_snapshot',
    name: 'DD Snapshot',
    caption: 'Due diligence',
    icon: 'fas fa-file-alt',
    category: 'analysis'
  },
  {
    id: 'property_valuation',
    name: 'Property Valuation',
    caption: 'Real estate pricing',
    icon: 'fas fa-home',
    category: 'analysis'
  },
  {
    id: 'art_valuation',
    name: 'Art Valuation',
    caption: 'Fine art appraisal',
    icon: 'fas fa-palette',
    category: 'analysis'
  },
  {
    id: 'whisky_valuation',
    name: 'Whisky Valuation',
    caption: 'Cask investments',
    icon: 'fas fa-wine-bottle',
    category: 'analysis'
  }
];

export default function QuickTools({ onToolOpen }: QuickToolsProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate skeleton loading
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const handleToolClick = (toolId: string) => {
    // Telemetry stub
    console.log({ event: 'tool_opened', tool: toolId, source: 'launcher_card' });
    onToolOpen?.(toolId);
  };

  if (isLoading) {
    return (
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--card-foreground)]">
            Quick Tools
          </h3>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 mb-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-[var(--radius-sm)] animate-pulse">
              <div className="w-9 h-9 bg-[var(--muted)] rounded-full flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="h-3.5 bg-[var(--muted)] rounded mb-1"></div>
                <div className="h-3 bg-[var(--muted)] rounded w-3/4"></div>
              </div>
              <div className="w-4 h-4 bg-[var(--muted)] rounded"></div>
            </div>
          ))}
        </div>
        
        <div className="pt-3 border-t border-[var(--border)]">
          <div className="h-4 bg-[var(--muted)] rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--card-foreground)]">
          Quick Tools
        </h3>
      </div>
      
      {/* Desktop/Tablet: 2xN grid */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 mb-4">
        {tools.slice(0, 4).map((tool) => (
          <button
            key={tool.id}
            onClick={() => handleToolClick(tool.id)}
            className="flex items-center gap-3 p-3 rounded-[var(--radius-sm)] hover:bg-[var(--muted)] hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-[var(--ring)] group"
          >
            <div className="w-9 h-9 bg-[var(--muted)] rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--accent)] group-hover:text-[var(--accent-foreground)] transition-colors">
              <i className={`${tool.icon} text-sm text-[var(--card-foreground)] group-hover:text-[var(--accent-foreground)]`}></i>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[var(--card-foreground)] truncate">
                {tool.name}
              </div>
              <div className="text-xs text-[var(--muted-foreground)]">
                {tool.caption}
              </div>
            </div>
            <i className="fas fa-chevron-right text-xs text-[var(--muted-foreground)] group-hover:text-[var(--card-foreground)] transition-colors"></i>
          </button>
        ))}
      </div>

      {/* Mobile: Horizontal scroll */}
      <div className="sm:hidden mb-4 -mx-4 px-4">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              className="flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-[var(--radius-sm)] hover:bg-[var(--muted)] transition-colors text-center min-w-[80px] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            >
              <div className="w-9 h-9 bg-[var(--muted)] rounded-full flex items-center justify-center">
                <i className={`${tool.icon} text-sm text-[var(--card-foreground)]`}></i>
              </div>
              <div className="text-xs font-medium text-[var(--card-foreground)]">
                {tool.name}
              </div>
              <div className="text-xs text-[var(--muted-foreground)]">
                {tool.caption}
              </div>
            </button>
          ))}
        </div>
      </div>
      
      <div className="pt-3 border-t border-[var(--border)] text-center">
        <Link 
          href="/toolkit" 
          className="text-[var(--accent)] text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        >
          More in Toolkit →
        </Link>
      </div>
    </div>
  );
}