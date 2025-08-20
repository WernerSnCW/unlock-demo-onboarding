interface DonutData {
  label: string;
  value: number;
  color: string;
}

interface DonutProps {
  data: DonutData[];
  size?: number;
  centerText?: string;
  className?: string;
}

export function Donut({ data, size = 200, centerText, className = '' }: DonutProps) {
  if (data.length === 0) return null;

  const radius = (size - 40) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 12;
  
  let cumulativePercentage = 0;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {data.map((item, index) => {
            const strokeDasharray = `${(item.value / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -cumulativePercentage * circumference / 100;
            cumulativePercentage += item.value;

            return (
              <circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
        
        {centerText && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {centerText}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 grid grid-cols-1 gap-2 w-full max-w-xs">
        {data.slice(0, 5).map((item, index) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-700 dark:text-gray-300 truncate">
                {item.label}
              </span>
            </div>
            <span className="font-medium text-gray-900 dark:text-gray-100 ml-2">
              {item.value.toFixed(1)}%
            </span>
          </div>
        ))}
        
        {data.length > 5 && (
          <div className="text-xs text-gray-500 dark:text-gray-500 text-center mt-1">
            +{data.length - 5} more
          </div>
        )}
      </div>
    </div>
  );
}