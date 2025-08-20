import { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, MoreVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePortfolioStore, Position, calculateMarketValue, calculateGain, formatCurrency } from '@/state/portfolioStore';
import { useOpinionsStore } from '@/state/opinionsStore';
import { formatGBP, formatPct, formatPrice, getGainColor } from '@/utils/formatters';
import { AnalystOpinionsPanel } from './AnalystOpinionsPanel';

interface PortfolioTableProps {
  className?: string;
}

type SortField = 'ticker' | 'name' | 'marketValue' | 'gainPct' | 'sector' | 'country';
type SortDirection = 'asc' | 'desc';

export function PortfolioTable({ className = '' }: PortfolioTableProps) {
  const { positions, removePosition } = usePortfolioStore();
  const { getByTickers } = useOpinionsStore();
  
  const [sortField, setSortField] = useState<SortField>('marketValue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedPositions = [...positions].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortField) {
      case 'ticker':
        aValue = a.ticker;
        bValue = b.ticker;
        break;
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'marketValue':
        aValue = formatCurrency(calculateMarketValue(a), a.currency);
        bValue = formatCurrency(calculateMarketValue(b), b.currency);
        break;
      case 'gainPct':
        aValue = calculateGain(a).gainPct;
        bValue = calculateGain(b).gainPct;
        break;
      case 'sector':
        aValue = a.sector;
        bValue = b.sector;
        break;
      case 'country':
        aValue = a.country;
        bValue = b.country;
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-left font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
      aria-sort={sortField === field ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      {children}
      {sortField === field && (
        sortDirection === 'asc' ? 
        <ChevronUp className="h-4 w-4" /> : 
        <ChevronDown className="h-4 w-4" />
      )}
    </button>
  );

  const PositionRow = ({ position }: { position: Position }) => {
    const marketValue = calculateMarketValue(position);
    const marketValueGBP = formatCurrency(marketValue, position.currency);
    const { gainAbs, gainPct } = calculateGain(position);
    const gainAbsGBP = formatCurrency(gainAbs, position.currency);
    const opinions = getByTickers([position.ticker]);
    const isExpanded = expandedRow === position.id;
    
    return (
      <>
        <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
          <td className="px-4 py-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setExpandedRow(isExpanded ? null : position.id)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              >
                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {position.ticker}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {position.market}
                </div>
              </div>
            </div>
          </td>
          
          <td className="px-4 py-3">
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {position.name}
            </div>
          </td>
          
          <td className="px-4 py-3 text-right">
            <div className="font-mono text-gray-900 dark:text-gray-100">
              {position.quantity.toLocaleString()}
            </div>
          </td>
          
          <td className="px-4 py-3 text-right">
            <div className="font-mono text-gray-900 dark:text-gray-100">
              {formatPrice(position.avgCost, position.currency)}
            </div>
          </td>
          
          <td className="px-4 py-3 text-right">
            <div className="font-mono text-gray-900 dark:text-gray-100">
              {formatPrice(position.price, position.currency)}
            </div>
          </td>
          
          <td className="px-4 py-3 text-right">
            <div className="font-mono font-medium text-gray-900 dark:text-gray-100">
              {formatGBP(marketValueGBP)}
            </div>
            {position.currency !== 'GBP' && (
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {formatPrice(marketValue, position.currency)}
              </div>
            )}
          </td>
          
          <td className="px-4 py-3 text-right">
            <div className={`font-mono font-medium ${getGainColor(gainAbs)}`}>
              {formatGBP(gainAbsGBP)}
            </div>
            <div className={`text-sm font-mono ${getGainColor(gainAbs)}`}>
              {formatPct(gainPct)}
            </div>
          </td>
          
          <td className="px-4 py-3">
            <Badge variant="secondary" className="text-xs">
              {position.sector}
            </Badge>
          </td>
          
          <td className="px-4 py-3">
            <div className="text-sm text-gray-900 dark:text-gray-100">
              {position.country}
            </div>
          </td>
          
          <td className="px-4 py-3 text-center">
            {opinions.length > 0 ? (
              <Badge variant="outline" className="text-xs">
                {opinions.length}
              </Badge>
            ) : (
              <span className="text-gray-400 text-xs">—</span>
            )}
          </td>
          
          <td className="px-4 py-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => removePosition(position.id)}
                  className="text-red-600 dark:text-red-400"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </td>
        </tr>
        
        {/* Expanded row - Analyst Opinions */}
        {isExpanded && (
          <tr>
            <td colSpan={11} className="px-4 py-4 bg-gray-50 dark:bg-gray-900/50">
              <div className="max-w-2xl">
                <AnalystOpinionsPanel 
                  tickers={[position.ticker]}
                  compact={true}
                  showFilters={false}
                />
              </div>
            </td>
          </tr>
        )}
      </>
    );
  };

  if (positions.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No positions in portfolio
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Upload a CSV file or add positions manually to get started.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <SortButton field="ticker">Ticker</SortButton>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <SortButton field="name">Name</SortButton>
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Avg Cost
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Price
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <SortButton field="marketValue">Market Value</SortButton>
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <SortButton field="gainPct">P&L</SortButton>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <SortButton field="sector">Sector</SortButton>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <SortButton field="country">Country</SortButton>
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Opinions
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPositions.map((position) => (
              <PositionRow key={position.id} position={position} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}