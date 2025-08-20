interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  delta?: {
    value: string;
    isPositive: boolean;
    percentage?: boolean;
  };
  subtitle?: string;
  className?: string;
}

export function StatCard({ title, value, icon, delta, subtitle, className = '' }: StatCardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </span>
        {icon && (
          <div className="text-gray-500 dark:text-gray-400">
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </div>
          
          {delta && (
            <div className={`text-sm font-medium ${
              delta.isPositive 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {delta.isPositive ? '↗' : '↘'} {delta.value}
            </div>
          )}
          
          {subtitle && (
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}