import { Play, Pause, X, Sparkles } from 'lucide-react';
import { useDemo } from '@/contexts/DemoContext';

export default function DemoControls() {
  const { active, paused, currentStepIndex, totalSteps, currentStepLabel, investorLabel, togglePause, exit } = useDemo();

  if (!active) return null;

  const progressPct = Math.round(((currentStepIndex + 1) / totalSteps) * 100);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] bg-slate-900 text-white shadow-lg border-b border-[#00bb77]/40"
      data-testid="demo-controls-bar"
    >
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-4">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00bb77]/20 border border-[#00bb77]/40 text-xs font-semibold text-[#00bb77] flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5" />
          DEMO MODE — synthetic data
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
            <span className="truncate" data-testid="demo-step-label">
              Step {currentStepIndex + 1} of {totalSteps}: {currentStepLabel}
            </span>
            <span className="truncate ml-2 opacity-70">{investorLabel}</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
            <div
              className="h-full bg-[#00bb77] transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <button
          onClick={togglePause}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors flex-shrink-0"
          data-testid="demo-pause-toggle"
        >
          {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          {paused ? 'Resume' : 'Pause'}
        </button>

        <button
          onClick={exit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-sm font-medium transition-colors flex-shrink-0"
          data-testid="demo-exit-button"
        >
          <X className="w-4 h-4" />
          Exit demo
        </button>
      </div>
    </div>
  );
}
