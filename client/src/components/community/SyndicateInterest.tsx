import { useEffect, useState } from 'react';

interface InterestData {
  interestPct: number;
  followers: number;
  leadInvestors: number;
  avgChequeGBP: number;
  history: number[];
}

interface SyndicateInterestProps {
  interest: InterestData;
}

export function SyndicateInterest({ interest }: SyndicateInterestProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar on mount
    const timer = setTimeout(() => {
      setAnimatedProgress(interest.interestPct);
    }, 100);
    return () => clearTimeout(timer);
  }, [interest.interestPct]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `£${(amount / 1000000).toFixed(1)}m`;
    }
    if (amount >= 1000) {
      return `£${(amount / 1000).toFixed(0)}k`;
    }
    return `£${amount.toLocaleString()}`;
  };

  const generateSparkline = (history: number[]) => {
    const max = Math.max(...history);
    const min = Math.min(...history);
    const range = max - min || 1;
    
    const points = history.map((value, index) => {
      const x = (index / (history.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg viewBox="0 0 100 30" className="w-20 h-6">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-[#F8D49B]"
        />
      </svg>
    );
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Main Interest Display */}
      <div className="text-center">
        <div className="text-3xl font-bold text-[#5193B3] mb-1">
          {interest.interestPct}%
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Syndicate Interest
        </div>
        
        {/* Progress Bar */}
        <div className="relative">
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#5193B3] to-[#F8D49B] transition-all duration-1000 ease-out"
              style={{ width: `${animatedProgress}%` }}
            />
          </div>
          
          {/* Tooltip on hover */}
          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200">
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded whitespace-nowrap z-10">
              % of investors short-listing this business for potential group investment
            </div>
          </div>
        </div>
      </div>

      {/* Mini Metrics Row */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {interest.followers}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Followers
          </div>
        </div>
        
        <div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {interest.leadInvestors}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Lead Investors
          </div>
        </div>
        
        <div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {formatCurrency(interest.avgChequeGBP)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Avg Cheque
          </div>
        </div>
      </div>

      {/* Enhanced 7-Day Trend */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400">7-day trend</div>
          <div className="flex items-center gap-1 text-xs">
            {(() => {
              const current = interest.history[interest.history.length - 1];
              const previous = interest.history[interest.history.length - 2];
              const change = current - previous;
              const isUp = change > 0;
              const isFlat = change === 0;
              
              return (
                <div className={`flex items-center gap-0.5 font-medium ${
                  isFlat ? 'text-gray-500 dark:text-gray-400' :
                  isUp ? 'text-green-600 dark:text-green-400' : 
                  'text-red-600 dark:text-red-400'
                }`}>
                  <i className={`fas ${
                    isFlat ? 'fa-minus' :
                    isUp ? 'fa-arrow-up' : 'fa-arrow-down'
                  } text-xs`} aria-hidden="true"></i>
                  <span>
                    {isFlat ? 'No change' : `${isUp ? '+' : ''}${change.toFixed(1)}%`}
                  </span>
                </div>
              );
            })()}
          </div>
        </div>
        
        {/* Mini Bar Chart */}
        <div className="flex items-end justify-between gap-1 h-12 px-1">
          {interest.history.map((value, index) => {
            const maxValue = Math.max(...interest.history);
            const minValue = Math.min(...interest.history);
            const range = maxValue - minValue || 1;
            
            // Calculate height as pixels instead of percentage
            const heightPixels = Math.max(8, Math.round(((value - minValue) / range) * 32 + 8));
            const isLast = index === interest.history.length - 1;
            const isHigh = value >= maxValue * 0.8;
            
            return (
              <div
                key={index}
                className="relative flex-1 group cursor-help"
                title={`${7 - index} days ago: ${value}% interest`}
              >
                <div
                  className={`w-full rounded-t-sm transition-all duration-300 min-h-[8px] ${
                    isLast 
                      ? 'bg-gradient-to-t from-[#5193B3] to-[#62C4C3] shadow-sm' 
                      : isHigh
                      ? 'bg-gradient-to-t from-[#F8D49B] to-[#F8D49B]/80 group-hover:shadow-sm'
                      : 'bg-gray-400 dark:bg-gray-500 group-hover:bg-gradient-to-t group-hover:from-[#5193B3]/60 group-hover:to-[#62C4C3]/60'
                  }`}
                  style={{ height: `${heightPixels}px` }}
                />
                
                {/* Value label on hover */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                  {value}%
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Time Labels */}
        <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
          <span>7d ago</span>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}