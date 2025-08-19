interface Answer {
  authorRole: 'company' | 'lead' | 'peer';
  author: string;
  verified: boolean;
  body: string;
  createdAt: string;
}

interface AnswerItemProps {
  answer: Answer;
}

export function AnswerItem({ answer }: AnswerItemProps) {
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  const getAuthorBadge = () => {
    switch (answer.authorRole) {
      case 'company':
        return answer.verified 
          ? 'bg-[#62C4C3] text-gray-900'
          : 'bg-teal-100 dark:bg-teal-900/20 text-teal-800 dark:text-teal-400';
      case 'lead':
        return 'bg-[#F8D49B] text-gray-900';
      case 'peer':
        return 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300';
    }
  };

  const getAuthorLabel = () => {
    switch (answer.authorRole) {
      case 'company':
        return 'Company';
      case 'lead':
        return 'Lead Investor';
      case 'peer':
        return 'Peer';
      default:
        return answer.authorRole;
    }
  };

  const getAuthorInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
        {getAuthorInitials(answer.author)}
      </div>

      <div className="flex-1 space-y-2">
        {/* Author Info */}
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${getAuthorBadge()}`}>
            {getAuthorLabel()}
            {answer.verified && answer.authorRole === 'company' && (
              <span className="ml-1">
                <i className="fas fa-check-circle text-xs" aria-hidden="true"></i>
              </span>
            )}
          </span>
          {answer.verified && answer.authorRole === 'company' && (
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
              Verified Company Response
            </span>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatRelativeTime(answer.createdAt)}
          </span>
        </div>

        {/* Answer Body */}
        <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">
          {answer.body}
        </p>
      </div>
    </div>
  );
}