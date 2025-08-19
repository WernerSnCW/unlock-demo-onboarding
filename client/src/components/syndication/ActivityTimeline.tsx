interface ActivityEvent {
  ts: string;
  type: 'qa' | 'commit' | 'update';
  text: string;
}

interface ActivityTimelineProps {
  events: ActivityEvent[];
}

export function ActivityTimeline({ events }: ActivityTimelineProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'qa':
        return { icon: 'fas fa-question-circle', color: 'text-blue-600 dark:text-blue-400' };
      case 'commit':
        return { icon: 'fas fa-handshake', color: 'text-green-600 dark:text-green-400' };
      case 'update':
        return { icon: 'fas fa-file-alt', color: 'text-purple-600 dark:text-purple-400' };
      default:
        return { icon: 'fas fa-circle', color: 'text-gray-600 dark:text-gray-400' };
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (events.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Activity Timeline
        </h2>
        <div className="text-center py-8">
          <i className="fas fa-clock text-3xl text-gray-400 mb-3" aria-hidden="true"></i>
          <p className="text-gray-600 dark:text-gray-400">No recent activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
        Activity Timeline
      </h2>

      <div className="space-y-4">
        {events.map((event, index) => {
          const eventMeta = getEventIcon(event.type);
          
          return (
            <div key={index} className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <i className={`${eventMeta.icon} ${eventMeta.color} text-sm`} aria-hidden="true"></i>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {event.text}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                    {formatDate(event.ts)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Showing last {events.length} activities
        </p>
      </div>
    </div>
  );
}