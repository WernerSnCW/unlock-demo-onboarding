interface StageNavProps {
  stage: number; maxStage: number;
  onGo: (s: number) => void; onReset: () => void;
}
const LABELS = ['The stress test', 'Across history', 'Tune it', 'Compare mixes'];

export default function StageNav({ stage, maxStage, onGo, onReset }: StageNavProps) {
  return (
    <div className="flex items-center justify-between gap-3" data-testid="stage-nav">
      <ol className="flex gap-2">
        {LABELS.slice(0, maxStage).map((label, i) => {
          const n = i + 1;
          return (
            <li key={n}>
              <button
                type="button"
                onClick={() => onGo(n)}
                aria-current={stage === n ? 'step' : undefined}
                className={`text-xs px-2 py-1 rounded-full border ${
                  stage === n ? 'bg-[var(--foreground)] text-[var(--background)]' : 'text-[var(--muted-foreground)]'
                }`}
              >
                {n}. {label}
              </button>
            </li>
          );
        })}
      </ol>
      <button type="button" onClick={onReset} className="text-xs underline text-[var(--muted-foreground)]">
        Reset to my actual holdings, typical reading
      </button>
    </div>
  );
}
