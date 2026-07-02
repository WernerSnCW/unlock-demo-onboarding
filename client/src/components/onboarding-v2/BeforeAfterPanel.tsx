import { Donut } from '@/components/shared/Donut';
import { fmtSignedPct } from '@/lib/scenarioPlannerView';
import type {
  BeforeAfterResult, MixDiffRow, RunwayComparison,
} from '@/lib/beliefImpact/computeBeforeAfter';
import type { IncomeRunwayResult } from '@/lib/beliefImpact/computeIncomeRunway';

const BUCKET_COLOUR: Record<string, string> = {
  'uk-equity': '#3b82f6', 'us-equity': '#8b5cf6', 'global-equity': '#06b6d4',
  'govt-bonds': '#10b981', 'property': '#f59e0b', 'cash': '#64748b',
};

const bucketLabel = (b: string) => b.replace(/-/g, ' ');

function donutData(rows: MixDiffRow[], key: 'beforePct' | 'afterPct') {
  return rows
    .filter((r) => r[key] > 0)
    .sort((a, b) => b[key] - a[key])
    .map((r) => ({ label: bucketLabel(r.bucket), value: r[key], color: BUCKET_COLOUR[r.bucket] ?? '#94a3b8' }));
}

const fmtPp = (d: number) => `${d > 0 ? '+' : d < 0 ? '−' : ''}${Math.abs(d).toFixed(1)}pp`;

function troughVerdict(r: IncomeRunwayResult, unit: RunwayComparison['unit']): string {
  if (r.survivesWithoutSellingAtTrough) return 'buffer covers essential spending';
  return r.bufferExhaustedAtStep === null
    ? 'buffer would run out'
    : `buffer out after ${r.bufferExhaustedAtStep} ${unit}${r.bufferExhaustedAtStep === 1 ? '' : 's'}`;
}

export default function BeforeAfterPanel({ result }: { result: BeforeAfterResult }) {
  const { alignment, mixDiff, worstEpisode, runway } = result;
  return (
    <div className="space-y-4 pt-4 border-t border-[var(--border)]" data-testid="before-after-panel">
      <div>
        <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
          If you made all the staged changes
        </p>
        <p className="text-sm text-[var(--muted-foreground)]">
          The same models from the previous page, re-run as if both stages were applied in full.
          A simulation of your own outlook — not a forecast, and not a recommendation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" data-testid="before-after-donuts">
        <div className="p-4 rounded-xl border border-[var(--border)]">
          <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-2 text-center">Now</p>
          <Donut data={donutData(mixDiff, 'beforePct')} size={160} />
        </div>
        <div className="p-4 rounded-xl border border-[var(--border)]">
          <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-2 text-center">After all staged moves</p>
          <Donut data={donutData(mixDiff, 'afterPct')} size={160} />
        </div>
      </div>

      <div className="p-4 rounded-xl border border-[var(--border)] space-y-3" data-testid="before-after-stats">
        <div>
          <p className="text-sm">
            Alignment with your outlook:{' '}
            <span className="font-semibold">{alignment.before}</span>
            {' → '}
            <span className="font-semibold">{alignment.after}</span> / 100
          </p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            100 by definition — the illustrative target is built directly from your outlook answers,
            so applying it in full matches them exactly.
          </p>
        </div>
        {worstEpisode && (
          <p className="text-sm" data-testid="before-after-worst-episode">
            Deepest cited episode ({worstEpisode.episodeName}):{' '}
            {fmtSignedPct(worstEpisode.beforeTroughPct)} {'→'} {fmtSignedPct(worstEpisode.afterTroughPct)} at the trough.
            {' '}Recovery: {worstEpisode.beforeRecoveryLabel} {'→'} {worstEpisode.afterRecoveryLabel}.
          </p>
        )}
        {runway && (
          <p className="text-sm" data-testid="before-after-runway">
            Selling into the trough ({runway.episodeName}):{' '}
            {troughVerdict(runway.before, runway.unit)} now {'→'} {troughVerdict(runway.after, runway.unit)} after the staged moves.
          </p>
        )}
      </div>

      <div data-testid="before-after-diff-table">
        <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
          Allocation changes, bucket by bucket
        </p>
        <div className="rounded-xl border border-[var(--border)] divide-y divide-[var(--border)]">
          {mixDiff.map((row) => (
            <div key={row.bucket} className="flex items-center justify-between px-4 py-2 text-sm">
              <span className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: BUCKET_COLOUR[row.bucket] ?? '#94a3b8' }}
                />
                {bucketLabel(row.bucket)}
              </span>
              <span className="flex items-center gap-3 tabular-nums">
                <span className="text-[var(--muted-foreground)]">{row.beforePct.toFixed(1)}%</span>
                <span className="text-[var(--muted-foreground)]">{'→'}</span>
                <span>{row.afterPct.toFixed(1)}%</span>
                <span className={
                  row.deltaPp > 0 ? 'text-emerald-600 dark:text-emerald-400 w-20 text-right'
                    : row.deltaPp < 0 ? 'text-rose-600 dark:text-rose-400 w-20 text-right'
                      : 'text-[var(--muted-foreground)] w-20 text-right'
                }>
                  {row.deltaPp > 0 ? '▲' : row.deltaPp < 0 ? '▼' : ''} {fmtPp(row.deltaPp)}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
