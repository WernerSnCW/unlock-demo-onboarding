import { useState } from 'react';
import { Link } from 'wouter';

interface ToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
}

function ToolModal({ isOpen, onClose, title, description }: ToolModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--card-foreground)]">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-[var(--muted-foreground)] hover:text-[var(--card-foreground)] text-xl"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <p className="text-[var(--muted-foreground)] mb-6">
          {description}
        </p>
        <div className="flex gap-3">
          <button 
            className="bg-[var(--muted)] text-[var(--muted-foreground)] px-4 py-2 rounded-lg font-medium"
            disabled
          >
            Coming Soon
          </button>
          <button
            onClick={onClose}
            className="text-[var(--primary)] hover:underline px-4 py-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function QuickTools() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const tools = [
    {
      id: 'eis-calculator',
      title: 'EIS/SEIS Calculator',
      description: 'Calculate your EIS and SEIS allowances for tax-efficient investing.',
      icon: '🧮'
    },
    {
      id: 'loss-relief',
      title: 'Loss Relief Calculator',
      description: 'Estimate potential loss relief benefits on your investments.',
      icon: '📉'
    },
    {
      id: 'cgt-deferral',
      title: 'CGT Deferral Calculator',
      description: 'Calculate capital gains tax deferral opportunities.',
      icon: '💰'
    },
    {
      id: 'due-diligence',
      title: 'Request DD Snapshot',
      description: 'Request a due diligence snapshot for any business.',
      icon: '🔍'
    },
    {
      id: 'pitch-analyzer',
      title: 'Pitch Deck Analyser',
      description: 'Upload and analyze pitch decks for key insights.',
      icon: '📊'
    }
  ];

  const handleToolClick = (toolId: string) => {
    setActiveModal(toolId);
  };

  const activeModalData = tools.find(tool => tool.id === activeModal);

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-[var(--card-foreground)] mb-4">
        Quick Tools
      </h3>
      
      <div className="grid grid-cols-1 gap-3 mb-4">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => handleToolClick(tool.id)}
            className="flex items-center gap-3 p-3 text-left bg-[var(--muted)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] rounded-lg transition-colors group"
          >
            <span className="text-2xl">{tool.icon}</span>
            <div>
              <div className="font-medium text-sm text-[var(--card-foreground)] group-hover:text-[var(--accent-foreground)]">
                {tool.title}
              </div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="pt-3 border-t border-[var(--border)]">
        <Link href="/toolkit">
          <a className="text-[var(--primary)] text-sm hover:underline">
            More tools in Toolkit →
          </a>
        </Link>
      </div>

      {activeModal && activeModalData && (
        <ToolModal
          isOpen={!!activeModal}
          onClose={() => setActiveModal(null)}
          title={activeModalData.title}
          description={activeModalData.description}
        />
      )}
    </div>
  );
}