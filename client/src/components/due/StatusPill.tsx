import { Check, Clock, AlertCircle, Loader2 } from 'lucide-react';
import type { DueRequest } from '@/state/dueStore';

interface StatusPillProps {
  status: DueRequest['status'];
  size?: 'sm' | 'md';
}

export function StatusPill({ status, size = 'md' }: StatusPillProps) {
  const baseClasses = "inline-flex items-center gap-1 rounded-full font-medium";
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';
  
  const statusConfig = {
    queued: {
      classes: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      icon: <Clock className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />,
      label: 'Queued'
    },
    processing: {
      classes: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
      icon: <Loader2 className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} animate-spin`} />,
      label: 'Processing'
    },
    completed: {
      classes: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
      icon: <Check className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />,
      label: 'Completed'
    },
    failed: {
      classes: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
      icon: <AlertCircle className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />,
      label: 'Failed'
    }
  };

  const config = statusConfig[status];

  return (
    <span className={`${baseClasses} ${sizeClasses} ${config.classes}`}>
      {config.icon}
      {config.label}
    </span>
  );
}