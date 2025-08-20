// Centralized formatting utilities for consistent UI display

export const formatGBP = (amount: number, compact = false): string => {
  if (compact && Math.abs(amount) >= 1000000) {
    return `£${(amount / 1000000).toFixed(1)}m`;
  }
  if (compact && Math.abs(amount) >= 1000) {
    return `£${(amount / 1000).toFixed(0)}k`;
  }
  
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: amount % 1 === 0 && Math.abs(amount) < 100 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPct = (percentage: number, decimals = 1): string => {
  return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(decimals)}%`;
};

export const formatDate = (dateString: string, options?: Intl.DateTimeFormatOptions): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  return new Date(dateString).toLocaleDateString('en-GB', options || defaultOptions);
};

export const formatDateRelative = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays <= 7) return `${diffInDays} days ago`;
  if (diffInDays <= 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  
  return formatDate(dateString);
};

export const formatPrice = (price: number, currency: string): string => {
  const formatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: currency === 'GBP' ? 2 : 3,
  });
  
  return formatter.format(price);
};

export const formatPriceDelta = (current: number, target: number, currency: string): {
  delta: number;
  deltaPct: number;
  deltaFormatted: string;
  deltaPctFormatted: string;
} => {
  const delta = target - current;
  const deltaPct = current > 0 ? (delta / current) * 100 : 0;
  
  const deltaFormatted = `${delta >= 0 ? '+' : ''}${formatPrice(delta, currency)}`;
  const deltaPctFormatted = `${delta >= 0 ? '+' : ''}${deltaPct.toFixed(1)}%`;
  
  return {
    delta,
    deltaPct,
    deltaFormatted,
    deltaPctFormatted,
  };
};

export const formatLargeNumber = (num: number, currency?: string): string => {
  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  const prefix = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '';
  
  if (abs >= 1000000000) {
    return `${sign}${prefix}${(abs / 1000000000).toFixed(1)}B`;
  }
  if (abs >= 1000000) {
    return `${sign}${prefix}${(abs / 1000000).toFixed(1)}M`;
  }
  if (abs >= 1000) {
    return `${sign}${prefix}${(abs / 1000).toFixed(0)}K`;
  }
  
  return `${sign}${prefix}${abs.toFixed(currency ? 2 : 0)}`;
};

// Color utilities for consistent theming
export const getGainColor = (gain: number, isDark = false): string => {
  if (gain > 0) return isDark ? 'text-green-400' : 'text-green-600';
  if (gain < 0) return isDark ? 'text-red-400' : 'text-red-600';
  return isDark ? 'text-gray-400' : 'text-gray-600';
};

export const getRatingColor = (rating: string): string => {
  switch (rating.toLowerCase()) {
    case 'strong buy':
    case 'buy':
    case 'outperform':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'overweight':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    case 'neutral':
    case 'hold':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    case 'underweight':
    case 'underperform':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
    case 'sell':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

// Chart color palettes
export const CHART_COLORS = {
  primary: [
    'var(--primary)',
    'var(--secondary)', 
    'var(--accent)',
    '#10b981', // emerald-500
    '#8b5cf6', // violet-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#6366f1', // indigo-500
    '#ec4899', // pink-500
    '#14b8a6', // teal-500
  ],
  sectors: {
    'Technology': '#3b82f6', // blue-500
    'Semiconductors': '#6366f1', // indigo-500
    'Banks': '#10b981', // emerald-500
    'Telecommunications': '#f59e0b', // amber-500
    'Healthcare': '#ef4444', // red-500
    'Energy': '#f97316', // orange-500
    'Consumer': '#8b5cf6', // violet-500
    'Industrials': '#6b7280', // gray-500
    'Materials': '#84cc16', // lime-500
    'Utilities': '#06b6d4', // cyan-500
  },
  countries: {
    'US': '#3b82f6', // blue-500
    'UK': '#ef4444', // red-500
    'EU': '#10b981', // emerald-500
    'Asia': '#f59e0b', // amber-500
    'Other': '#6b7280', // gray-500
  }
};