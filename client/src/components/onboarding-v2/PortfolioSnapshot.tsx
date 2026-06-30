import { useMemo } from 'react';
import { PieChart, Lock, TrendingUp, Briefcase, Building2 } from 'lucide-react';
import { useOnboardingV2Store, computePortfolioBreakdowns, AllocationBreakdown, TopHoldingEntry } from '@/state/onboardingV2Store';

const assetClassColors: Record<string, string> = {
  Equity: 'bg-[var(--u-viz-1)]',
  Bond: 'bg-[var(--u-viz-2)]',
  Property: 'bg-[var(--u-viz-3)]',
  Cash: 'bg-[var(--u-viz-5)]',
  Alternatives: 'bg-[var(--u-viz-4)]',
  Commodities: 'bg-[var(--u-viz-6)]',
  Other: 'bg-[var(--u-viz-7)]',
};

const wrapperColors: Record<string, string> = {
  ISA: 'bg-[var(--u-viz-1)]',
  SIPP: 'bg-[var(--u-viz-2)]',
  GIA: 'bg-[var(--u-viz-3)]',
  Cash: 'bg-[var(--u-viz-5)]',
  'EIS/SEIS': 'bg-[var(--u-viz-4)]',
  VCT: 'bg-[var(--u-viz-6)]',
  Other: 'bg-[var(--u-viz-7)]',
};

function getColor(map: Record<string, string>, key: string): string {
  return map[key] || map['Other'] || 'bg-[var(--u-viz-7)]';
}

function formatGBP(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

interface AllocationBarProps {
  items: AllocationBreakdown[];
  colorMap: Record<string, string>;
  title: string;
  icon: typeof PieChart;
}

function AllocationBar({ items, colorMap, title, icon: Icon }: AllocationBarProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-[var(--muted-foreground)]" />
        <span className="text-sm font-medium text-[var(--foreground)]">{title}</span>
      </div>
      <div className="h-4 rounded-full overflow-hidden bg-[var(--muted)] flex">
        {items.map((item, idx) => (
          <div
            key={item.name}
            className={`h-full ${getColor(colorMap, item.name)} transition-all duration-300`}
            style={{ width: `${item.weight_pct}%` }}
            title={`${item.name}: ${item.weight_pct.toFixed(1)}%`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {items.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5 text-xs">
            <div className={`w-2.5 h-2.5 rounded-sm ${getColor(colorMap, item.name)}`} />
            <span className="text-[var(--muted-foreground)]">{item.name}</span>
            <span className="font-medium text-[var(--foreground)]">{item.weight_pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface TopHoldingsListProps {
  holdings: TopHoldingEntry[];
}

function TopHoldingsList({ holdings }: TopHoldingsListProps) {
  if (holdings.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-[var(--muted-foreground)]" />
        <span className="text-sm font-medium text-[var(--foreground)]">Top Holdings</span>
      </div>
      <div className="space-y-2">
        {holdings.map((holding, idx) => (
          <div
            key={`${holding.name}-${idx}`}
            className="flex items-center justify-between p-3 rounded-lg bg-[#2b2b2b]/30 border border-[var(--border)] hover:bg-[#2b2b2b]/50 transition-colors"
            data-testid={`top-holding-${idx}`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-[var(--foreground)] truncate">{holding.name}</span>
                {holding.illiquid && (
                  <span className="flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                    <Lock className="w-3 h-3" />
                    Illiquid
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] mt-0.5">
                <span>{holding.wrapper}</span>
                <span>•</span>
                <span>{holding.asset_class}</span>
                <span>•</span>
                <span>{holding.region}</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <div className="font-semibold text-[var(--foreground)]">{formatGBP(holding.value_gbp)}</div>
              <div className="text-xs text-[var(--muted-foreground)]">{holding.weight_pct.toFixed(1)}% of portfolio</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PortfolioSnapshot() {
  const holdings = useOnboardingV2Store((state) => state.holdings);

  const breakdowns = useMemo(() => computePortfolioBreakdowns(holdings), [holdings]);

  if (breakdowns.total_value <= 0) {
    return (
      <div className="p-5 rounded-xl border border-[var(--border)] bg-[#2b2b2b]/20" data-testid="portfolio-snapshot-empty">
        <div className="flex items-center gap-3 mb-2">
          <PieChart className="w-5 h-5 text-[var(--muted-foreground)]" />
          <h3 className="text-lg font-semibold text-[var(--foreground)]">Current Portfolio Snapshot</h3>
        </div>
        <p className="text-sm text-[var(--muted-foreground)]">
          We'll show your portfolio breakdown here once you've entered holdings.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-xl border border-[var(--border)] bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-gray-900 shadow-sm" data-testid="portfolio-snapshot">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-[#00bb77]/10">
          <PieChart className="w-5 h-5 text-[var(--primary)]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">Current Portfolio Snapshot</h3>
          <p className="text-xs text-[var(--muted-foreground)]">
            Here's how your current portfolio is allocated before we propose any changes.
          </p>
        </div>
      </div>

      <div className="mt-4 mb-6 p-3 rounded-lg bg-[#00bb77]/5 border border-[#00bb77]/20">
        <div className="text-xs text-[var(--muted-foreground)] uppercase tracking-wide mb-1">Total Portfolio Value</div>
        <div className="text-2xl font-bold text-[var(--primary)]">{formatGBP(breakdowns.total_value)}</div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <AllocationBar
          items={breakdowns.by_asset_class}
          colorMap={assetClassColors}
          title="By Asset Class"
          icon={Briefcase}
        />
        <AllocationBar
          items={breakdowns.by_wrapper}
          colorMap={wrapperColors}
          title="By Wrapper"
          icon={Building2}
        />
      </div>

      <TopHoldingsList holdings={breakdowns.top_holdings} />
    </div>
  );
}
