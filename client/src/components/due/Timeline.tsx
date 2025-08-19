import { Check, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import type { DueRequest } from '@/state/dueStore';

interface TimelineProps {
  request: DueRequest;
}

interface TimelineStep {
  status: 'completed' | 'current' | 'pending';
  label: string;
  timestamp?: string;
  icon: React.ReactNode;
}

export function Timeline({ request }: TimelineProps) {
  const steps: TimelineStep[] = [
    {
      status: 'completed',
      label: 'Queued',
      timestamp: request.createdAt,
      icon: <Clock className="h-4 w-4" />
    },
    {
      status: request.status === 'processing' ? 'current' : 
              ['completed', 'failed'].includes(request.status) ? 'completed' : 'pending',
      label: 'Processing',
      timestamp: request.status !== 'queued' ? request.createdAt : undefined, // Mock timestamp
      icon: request.status === 'processing' ? 
        <Loader2 className="h-4 w-4 animate-spin" /> : 
        <Clock className="h-4 w-4" />
    },
    {
      status: request.status === 'completed' ? 'completed' :
              request.status === 'failed' ? 'completed' : 'pending',
      label: request.status === 'failed' ? 'Failed' : 'Completed',
      timestamp: ['completed', 'failed'].includes(request.status) ? request.createdAt : undefined, // Mock timestamp
      icon: request.status === 'completed' ? 
        <Check className="h-4 w-4" /> : 
        request.status === 'failed' ? 
        <AlertCircle className="h-4 w-4" /> :
        <Clock className="h-4 w-4" />
    }
  ];

  return (
    <div className="space-y-4" role="list" aria-label="Request timeline">
      {steps.map((step, index) => (
        <div key={index} className="flex items-start gap-4" role="listitem">
          {/* Icon */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            step.status === 'completed' ? 
              request.status === 'failed' && step.label === 'Failed' ?
                'border-red-500 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                'border-green-500 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
            : step.status === 'current' ?
              'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
            : 'border-gray-300 bg-gray-50 text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500'
          }`}>
            {step.icon}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${
                step.status === 'completed' ? 'text-gray-900 dark:text-gray-100' :
                step.status === 'current' ? 'text-blue-600 dark:text-blue-400' :
                'text-gray-500 dark:text-gray-400'
              }`}>
                {step.label}
              </h4>
              {step.timestamp && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {format(new Date(step.timestamp), 'MMM d, h:mm a')}
                </span>
              )}
            </div>
            
            {/* Status description */}
            {step.status === 'current' && request.status === 'processing' && (
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-300" aria-live="polite">
                <div className="flex items-center gap-2">
                  <span>Collecting and analysing data</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ETA: {request.sla === 'fast' ? '~45 seconds' : '~2 minutes'} (prototype)
                  </span>
                </div>
              </div>
            )}
            
            {step.status === 'completed' && step.label === 'Failed' && request.error && (
              <div className="mt-1 text-sm text-red-600 dark:text-red-400">
                {request.error}
              </div>
            )}
            
            {step.status === 'completed' && step.label === 'Completed' && request.result && (
              <div className="mt-1 text-sm text-green-600 dark:text-green-400">
                Report is ready for download
              </div>
            )}
          </div>
          
          {/* Connector line */}
          {index < steps.length - 1 && (
            <div className={`absolute ml-4 mt-8 w-0.5 h-6 ${
              step.status === 'completed' ? 'bg-green-500' :
              step.status === 'current' ? 'bg-blue-500' :
              'bg-gray-300 dark:bg-gray-600'
            }`} style={{ left: '15px' }} />
          )}
        </div>
      ))}
    </div>
  );
}