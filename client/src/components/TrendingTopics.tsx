interface TrendingTopicsProps {
  newsItems: any[];
  onTopicClick: (topic: string) => void;
}

export default function TrendingTopics({ newsItems, onTopicClick }: TrendingTopicsProps) {
  // Extract and count topics from visible news items
  const topicCounts = newsItems.reduce((acc: Record<string, number>, item) => {
    item.topics?.forEach((topic: string) => {
      acc[topic] = (acc[topic] || 0) + 1;
    });
    return acc;
  }, {});

  // Get top 5 trending topics
  const trendingTopics = Object.entries(topicCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([topic, count]) => ({ topic, count }));

  if (trendingTopics.length === 0) {
    return null;
  }

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4">
      <h3 className="font-semibold text-[var(--card-foreground)] mb-4 flex items-center gap-2">
        <i className="fas fa-fire text-[var(--accent)]" aria-hidden="true"></i>
        Trending Topics
      </h3>
      
      <div className="space-y-2">
        {trendingTopics.map(({ topic, count }) => (
          <button
            key={topic}
            onClick={() => onTopicClick(topic)}
            className="w-full flex items-center justify-between p-2 rounded-[var(--radius-sm)] hover:bg-[var(--muted)] transition-colors text-left focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            aria-label={`Filter by ${topic} topic`}
          >
            <span className="text-sm font-medium text-[var(--card-foreground)]">
              {topic}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--muted-foreground)]">
                {count}
              </span>
              <i className="fas fa-chevron-right text-xs text-[var(--muted-foreground)]" aria-hidden="true"></i>
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-3 pt-3 border-t border-[var(--border)]">
        <p className="text-xs text-[var(--muted-foreground)]">
          Click any topic to filter your feed
        </p>
      </div>
    </div>
  );
}