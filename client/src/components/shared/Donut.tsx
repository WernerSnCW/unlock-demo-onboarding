interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutProps {
  data: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabels?: boolean;
  centerText?: string;
}

export function Donut({ 
  data, 
  size = 120, 
  strokeWidth = 12, 
  className = '',
  showLabels = true,
  centerText
}: DonutProps) {
  if (data.length === 0) return null;

  const total = data.reduce((sum, segment) => sum + segment.value, 0);
  const radius = (size - strokeWidth) / 2;
  const centerX = size / 2;
  const centerY = size / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercentage = 0;

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <div className="relative">
        <svg width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            className="dark:stroke-gray-700"
          />
          
          {/* Segments */}
          {data.map((segment, index) => {
            const percentage = segment.value / total;
            const strokeDasharray = `${percentage * circumference} ${circumference}`;
            const strokeDashoffset = -cumulativePercentage * circumference;
            cumulativePercentage += percentage;

            return (
              <circle
                key={index}
                cx={centerX}
                cy={centerY}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(-90 ${centerX} ${centerY})`}
                className="transition-all duration-300"
              />
            );
          })}
        </svg>
        
        {/* Center text */}
        {centerText && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 text-center">
              {centerText}
            </span>
          </div>
        )}
      </div>

      {/* Legend */}
      {showLabels && (
        <div className="mt-3 space-y-1">
          {data.map((segment, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-gray-700 dark:text-gray-300">
                {segment.label}: {segment.value.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}