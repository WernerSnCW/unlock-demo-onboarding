import { TrendingUp, PieChart, AlertTriangle, Target, DollarSign, Hash } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { Donut } from '@/components/shared/Donut';
import { MiniSpark } from '@/components/shared/MiniSpark';
import { usePortfolioStore } from '@/state/portfolioStore';
import { formatGBP, formatPct, CHART_COLORS } from '@/utils/formatters';

interface PortfolioAnalyticsProps {
  className?: string;
}

export function PortfolioAnalytics({ className = '' }: PortfolioAnalyticsProps) {
  const { 
    positions, 
    getTotalValue, 
    getTotalGainLoss, 
    getSectorExposure, 
    getCountryExposure, 
    getRiskFlags 
  } = usePortfolioStore();

  const totalValue = getTotalValue();
  const { gainAbs, gainPct } = getTotalGainLoss();
  const sectorExposure = getSectorExposure();
  const countryExposure = getCountryExposure();
  const riskFlags = getRiskFlags();

  // Calculate top position percentage
  const topPosition = positions.reduce((max, position) => {
    const marketValue = position.quantity * position.price;
    const percentage = totalValue > 0 ? (marketValue / totalValue) * 100 : 0;
    return percentage > max ? percentage : max;
  }, 0);

  // Generate mock sparkline data for demonstration
  const mockSparklineData = [85, 90, 88, 92, 87, 95, 100, 98, 102, 105];

  // Prepare donut chart data
  const sectorData = Object.entries(sectorExposure)
    .map(([sector, percentage]) => ({
      label: sector,
      value: percentage,
      color: CHART_COLORS.sectors[sector as keyof typeof CHART_COLORS.sectors] || CHART_COLORS.primary[0]
    }))
    .sort((a, b) => b.value - a.value);

  const countryData = Object.entries(countryExposure)
    .map(([country, percentage]) => ({
      label: country,
      value: percentage,
      color: CHART_COLORS.countries[country as keyof typeof CHART_COLORS.countries] || CHART_COLORS.primary[1]
    }))
    .sort((a, b) => b.value - a.value);

  // P&L Distribution
  const gainers = positions.filter(pos => {
    const gain = (pos.quantity * pos.price) - (pos.quantity * pos.avgCost);
    return gain > 0;
  }).length;
  
  const losers = positions.filter(pos => {
    const gain = (pos.quantity * pos.price) - (pos.quantity * pos.avgCost);
    return gain < 0;
  }).length;

  const neutral = positions.length - gainers - losers;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Market Value"
          value={formatGBP(totalValue)}
          icon={<DollarSign className="h-4 w-4" />}
          subtitle="Converted at demo rates"
        />
        
        <StatCard
          title="Total P&L"
          value={formatGBP(gainAbs)}
          delta={{
            value: formatPct(gainPct, 1),
            isPositive: gainAbs >= 0,
            percentage: true
          }}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        
        <StatCard
          title="Holdings"
          value={positions.length}
          icon={<Hash className="h-4 w-4" />}
          subtitle="Active positions"
        />
        
        <StatCard
          title="Top Position"
          value={formatPct(topPosition)}
          icon={<Target className="h-4 w-4" />}
          subtitle="Largest single holding"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sector Exposure */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="h-5 w-5 text-[var(--primary)]" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Sector Exposure
            </h3>
          </div>
          
          {sectorData.length > 0 ? (
            <Donut 
              data={sectorData} 
              size={180}
              centerText={`${sectorData.length} Sectors`}
            />
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No sector data available
            </div>
          )}
        </div>

        {/* Country Exposure */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="h-5 w-5 text-[var(--secondary)]" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Country Exposure
            </h3>
          </div>
          
          {countryData.length > 0 ? (
            <Donut 
              data={countryData} 
              size={180}
              centerText={`${countryData.length} Countries`}
            />
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No country data available
            </div>
          )}
        </div>

        {/* P&L Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-[var(--accent)]" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              P&L Distribution
            </h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Gainers</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500"
                    style={{ width: positions.length > 0 ? `${(gainers / positions.length) * 100}%` : '0%' }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-6">
                  {gainers}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Neutral</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gray-400"
                    style={{ width: positions.length > 0 ? `${(neutral / positions.length) * 100}%` : '0%' }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-6">
                  {neutral}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Losers</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500"
                    style={{ width: positions.length > 0 ? `${(losers / positions.length) * 100}%` : '0%' }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-6">
                  {losers}
                </span>
              </div>
            </div>

            {/* Performance Sparkline */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  Portfolio Performance (Demo)
                </span>
                <MiniSpark 
                  data={mockSparklineData} 
                  width={80} 
                  height={20}
                  color="var(--primary)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Alerts */}
      {riskFlags.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2">
                Risk Alerts
              </h3>
              <ul className="space-y-1">
                {riskFlags.map((flag, index) => (
                  <li key={index} className="text-sm text-amber-800 dark:text-amber-200">
                    • {flag}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">
                Consider rebalancing to reduce concentration risk and improve diversification.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {positions.length === 0 && (
        <div className="text-center py-12">
          <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No portfolio data
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Upload your portfolio to see analytics and insights.
          </p>
        </div>
      )}
    </div>
  );
}