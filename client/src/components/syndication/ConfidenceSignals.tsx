interface ConfidenceSignalsProps {
  interest: {
    overallPct: number;
    likeYouPct: number;
    cohorts: { angels: number; funds: number; familyOffices: number };
    history: number[];
    confidenceScore: number;
  };
}

export function ConfidenceSignals({ interest }: ConfidenceSignalsProps) {
  const getConfidenceLevel = (score: number) => {
    if (score >= 75) return { level: 'High', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/20' };
    if (score >= 50) return { level: 'Moderate', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/20' };
    return { level: 'Low', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/20' };
  };

  const confidence = getConfidenceLevel(interest.confidenceScore);

  // Create sparkline data for enhanced trend visualization
  const createTrendData = (data: number[]) => {
    if (data.length < 2) return { path: '', points: [] };
    
    const width = 300;
    const height = 60;
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - minValue) / range) * height;
      return { x, y, value };
    });
    
    const pathData = points.map((point, index) => 
      index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`
    ).join(' ');
    
    return { path: pathData, points };
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
        Confidence & Signals
      </h2>

      {/* Confidence Meter */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Confidence Score
          </span>
          <span className={`text-sm font-medium px-2 py-1 rounded-full ${confidence.bg} ${confidence.color}`}>
            {interest.confidenceScore}/100 ({confidence.level})
          </span>
        </div>
        <div 
          className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2"
          title="Composite signal of momentum, lead track record, and community interest. Informational only."
        >
          <div 
            className="h-3 rounded-full transition-all bg-gradient-to-r from-gray-400 via-yellow-400 to-green-400"
            style={{ width: `${interest.confidenceScore}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Composite of momentum, lead track record, and community interest. Informational, not advice.
        </p>
      </div>

      {/* Enhanced Investors Like You */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <i className="fas fa-users text-[var(--secondary)]" aria-hidden="true"></i>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Investors Like You
          </span>
        </div>
        
        <div className="bg-gradient-to-r from-[var(--secondary)]/10 to-[var(--primary)]/10 dark:from-[var(--secondary)]/5 dark:to-[var(--primary)]/5 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl font-bold text-[var(--secondary)]">
              {interest.likeYouPct}%
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              of angels with similar profiles shortlisted this
            </span>
          </div>
          
          {/* Breakdown by Investor Type */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <i className="fas fa-user text-blue-500 text-sm" aria-hidden="true"></i>
                <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {interest.cohorts.angels}%
                </span>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Angels</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <i className="fas fa-building text-purple-500 text-sm" aria-hidden="true"></i>
                <span className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                  {interest.cohorts.funds}%
                </span>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Funds</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <i className="fas fa-home text-green-500 text-sm" aria-hidden="true"></i>
                <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {interest.cohorts.familyOffices}%
                </span>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Family Offices</div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof / Testimonials */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Why Others Are Interested
        </h3>
        <div className="space-y-3">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <i className="fas fa-quote-left text-gray-400 text-sm mt-1" aria-hidden="true"></i>
              <div className="flex-1">
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                  "Strong sector growth potential and experienced founding team"
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  — Anonymous Angel Investor
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <i className="fas fa-quote-left text-gray-400 text-sm mt-1" aria-hidden="true"></i>
              <div className="flex-1">
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                  "Lead's track record gives me confidence in execution"
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  — Anonymous Fund Manager
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interest Trend */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Interest Trend
          </h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Last 7 periods
          </span>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Interest Trend
              </div>
              <svg width="300" height="60" className="opacity-90">
                {/* Trend line */}
                <path
                  d={createTrendData(interest.history).path}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="2"
                  className="drop-shadow-sm"
                />
                {/* Data points */}
                {createTrendData(interest.history).points.map((point, index) => (
                  <circle
                    key={index}
                    cx={point.x}
                    cy={point.y}
                    r="3"
                    fill="var(--primary)"
                    className="drop-shadow-sm"
                  />
                ))}
              </svg>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Last 7 periods
              </div>
              <div className="text-lg font-bold text-[var(--primary)]">
                {interest.overallPct}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Current
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}