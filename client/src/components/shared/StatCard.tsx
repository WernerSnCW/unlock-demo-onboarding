import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  delta?: {
    value: string | number;
    isPositive: boolean;
    percentage?: boolean;
  };
  icon?: ReactNode;
  subtitle?: string;
  className?: string;
}

export function StatCard({ title, value, delta, icon, subtitle, className = '' }: StatCardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {icon && (
              <div className="text-[var(--primary)]">
                {icon}
              </div>
            )}
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </h3>
          </div>
          
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            {value}
          </div>
          
          {subtitle && (
            <div className="text-xs text-gray-500 dark:text-gray-500">
              {subtitle}
            </div>
          )}
          
          {delta && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              delta.isPositive 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              <span className={delta.isPositive ? '↗' : '↘'}>
                {delta.isPositive ? '↗' : '↘'}
              </span>
              <span>
                {delta.percentage ? '' : '£'}{Math.abs(Number(delta.value))}
                {delta.percentage ? '%' : ''}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}