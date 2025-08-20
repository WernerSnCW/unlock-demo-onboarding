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
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(price);
};

export const formatPriceDelta = (delta: number, currency: string): string => {
  const sign = delta >= 0 ? '+' : '';
  return `${sign}${formatPrice(Math.abs(delta), currency)}`;
};

export const getGainColor = (gain: number): string => {
  if (gain > 0) return 'text-green-600 dark:text-green-400';
  if (gain < 0) return 'text-red-600 dark:text-red-400';
  return 'text-gray-600 dark:text-gray-400';
};

export const getRatingColor = (rating: string): string => {
  const lowerRating = rating.toLowerCase();
  
  if (lowerRating.includes('strong buy') || lowerRating.includes('buy')) {
    return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
  }
  
  if (lowerRating.includes('overweight') || lowerRating.includes('outperform')) {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
  }
  
  if (lowerRating.includes('neutral') || lowerRating.includes('hold')) {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
  }
  
  if (lowerRating.includes('underweight') || lowerRating.includes('underperform') || lowerRating.includes('sell')) {
    return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
  }
  
  return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
};

// Chart color definitions
export const CHART_COLORS = {
  primary: ['#5193B3', '#62C4C3', '#F8D49B', '#E8A87C', '#C27D38'],
  sectors: {
    'Technology': '#5193B3',
    'Healthcare': '#62C4C3',
    'Financial': '#F8D49B',
    'Energy': '#E8A87C',
    'Consumer': '#C27D38',
    'Industrial': '#85C1E9',
    'Materials': '#F8C471',
    'Utilities': '#82E0AA',
    'Telecom': '#D2B4DE',
    'Real Estate': '#F1948A',
    'Other': '#AEB6BF'
  },
  countries: {
    'US': '#5193B3',
    'UK': '#62C4C3',
    'EU': '#F8D49B',
    'Asia': '#E8A87C',
    'Canada': '#C27D38',
    'Australia': '#85C1E9',
    'Other': '#AEB6BF'
  }
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
  
  return `${sign}${prefix}${abs.toFixed(0)}`;
};

export const calculateTargetDelta = (current: number, target: number, currency: string) => {
  const delta = target - current;
  const deltaPct = current > 0 ? (delta / current) * 100 : 0;
  
  return {
    delta,
    deltaPct,
    deltaFormatted: `${delta >= 0 ? '+' : ''}${formatPrice(Math.abs(delta), currency)}`,
    deltaPctFormatted: `${delta >= 0 ? '+' : ''}${deltaPct.toFixed(1)}%`,
  };
};