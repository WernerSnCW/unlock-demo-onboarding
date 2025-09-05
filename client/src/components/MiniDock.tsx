import { useState, useEffect, useRef } from 'react';
import { Calculator, Presentation, FileText, Home, Wrench } from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
}

interface MiniDockProps {
  onToolOpen: (toolId: string) => void;
  isVisible: boolean;
  onToggle: () => void;
}

const tools: Tool[] = [
  { id: 'eis_allowance', name: 'EIS Allowance Calculator', icon: Calculator },
  { id: 'pitch_deck_analyser', name: 'Pitch Deck Analyser', icon: Presentation },
  { id: 'dd_snapshot', name: 'DD Snapshot', icon: FileText },
  { id: 'property_valuation', name: 'Property Valuation', icon: Home }
];

export default function MiniDock({ onToolOpen, isVisible, onToggle }: MiniDockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [recentTools, setRecentTools] = useState<Tool[]>(tools);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dockRef.current && !dockRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
        setFocusedIndex(-1);
      }
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExpanded(false);
        setFocusedIndex(-1);
      }
      
      if (event.key === 't' && !event.ctrlKey && !event.metaKey) {
        const target = event.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          onToggle();
        }
      }

      if (isExpanded) {
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          setFocusedIndex(prev => prev <= 0 ? recentTools.length - 1 : prev - 1);
        }
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setFocusedIndex(prev => prev >= recentTools.length - 1 ? 0 : prev + 1);
        }
        if (event.key === 'Enter' && focusedIndex >= 0) {
          event.preventDefault();
          handleToolClick(recentTools[focusedIndex].id);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeydown);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [isExpanded, focusedIndex, recentTools, onToggle]);

  const handleToolClick = (toolId: string) => {
    // Move clicked tool to top
    setRecentTools(prev => {
      const tool = prev.find(t => t.id === toolId);
      if (tool) {
        return [tool, ...prev.filter(t => t.id !== toolId)];
      }
      return prev;
    });
    
    // Telemetry stub
    console.log({ event: 'tool_opened', tool: toolId, source: 'mini_dock' });
    
    setIsExpanded(false);
    setFocusedIndex(-1);
    onToolOpen(toolId);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    setFocusedIndex(-1);
  };

  if (!isVisible) return null;

  return (
    <div 
      ref={dockRef}
      className="fixed bottom-6 right-6 z-50 hidden md:block"
    >
      {/* Expanded Menu */}
      {isExpanded && (
        <div className="absolute bottom-14 right-0 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] py-2 min-w-[180px]" style={{ boxShadow: 'var(--shadow-md)' }}>
          {recentTools.map((tool, index) => (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-[var(--muted)] transition-colors focus:outline-none focus:bg-[var(--muted)] ${
                focusedIndex === index ? 'bg-[var(--muted)]' : ''
              }`}
            >
              <div className="w-8 h-8 bg-[var(--muted)] rounded-full flex items-center justify-center flex-shrink-0">
                <tool.icon className="w-4 h-4 text-[var(--card-foreground)]" />
              </div>
              <span className="text-sm font-medium text-[var(--card-foreground)]">
                {tool.name}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={toggleExpanded}
        className="bg-[var(--accent)] text-[var(--accent-foreground)] px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] flex items-center gap-2"
        aria-label="Toggle tools menu"
      >
        <Wrench className="w-4 h-4" />
        <span className="text-sm font-medium">Tools</span>
        <svg className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}