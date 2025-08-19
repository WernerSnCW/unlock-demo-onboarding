import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AnswerItem } from './AnswerItem';

interface Answer {
  authorRole: 'company' | 'lead' | 'peer';
  author: string;
  verified: boolean;
  body: string;
  createdAt: string;
}

interface Question {
  id: string;
  target: 'lead' | 'company' | 'community';
  body: string;
  upvotes: number;
  status: 'answered' | 'open';
  createdAt: string;
  answers: Answer[];
  followers: number;
}

interface QuestionCardProps {
  question: Question;
  questionState?: { upvoted: boolean; following: boolean };
  onUpvote: () => void;
  onFollow: () => void;
  getTargetBadgeColor: (target: string) => string;
  getTargetLabel: (target: string) => string;
}

export function QuestionCard({ 
  question, 
  questionState, 
  onUpvote, 
  onFollow, 
  getTargetBadgeColor, 
  getTargetLabel 
}: QuestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllAnswers, setShowAllAnswers] = useState(false);

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

  const shouldTruncateBody = question.body.length > 150;
  const displayBody = isExpanded ? question.body : 
    shouldTruncateBody ? question.body.substring(0, 150) + '...' : question.body;

  const visibleAnswers = showAllAnswers ? question.answers : question.answers.slice(0, 1);
  const hiddenAnswersCount = question.answers.length - 1;

  const currentUpvotes = question.upvotes + (questionState?.upvoted ? 1 : 0);
  const currentFollowers = question.followers + (questionState?.following ? 1 : 0);

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
      {/* Header with Target Badge */}
      <div className="flex items-start justify-between gap-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTargetBadgeColor(question.target)}`}>
          {getTargetLabel(question.target)}
        </span>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          question.status === 'answered' 
            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
            : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
        }`}>
          {question.status === 'answered' ? 'Answered' : 'Open'}
        </span>
      </div>

      {/* Question Body */}
      <div className="space-y-2">
        <p className="text-gray-900 dark:text-gray-100 leading-relaxed">
          {displayBody}
        </p>
        {shouldTruncateBody && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[#5193B3] hover:text-[#4082a2] p-0 h-auto font-medium text-sm"
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </Button>
        )}
      </div>

      {/* Meta Information */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <i className="fas fa-arrow-up text-xs" aria-hidden="true"></i>
            {currentUpvotes}
          </span>
          <span className="flex items-center gap-1">
            <i className="fas fa-bell text-xs" aria-hidden="true"></i>
            {currentFollowers}
          </span>
          <span>{formatRelativeTime(question.createdAt)}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onUpvote}
            className={`px-2 py-1 h-auto text-xs ${
              questionState?.upvoted 
                ? 'text-[#5193B3] bg-blue-50 dark:bg-blue-900/20' 
                : 'text-gray-600 dark:text-gray-400 hover:text-[#5193B3]'
            }`}
            aria-label={questionState?.upvoted ? 'Remove upvote' : 'Upvote question'}
          >
            <i className="fas fa-arrow-up mr-1" aria-hidden="true"></i>
            Upvote
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onFollow}
            className={`px-2 py-1 h-auto text-xs ${
              questionState?.following 
                ? 'text-[#62C4C3] bg-teal-50 dark:bg-teal-900/20' 
                : 'text-gray-600 dark:text-gray-400 hover:text-[#62C4C3]'
            }`}
            aria-label={questionState?.following ? 'Unfollow question' : 'Follow question'}
          >
            <i className="fas fa-bell mr-1" aria-hidden="true"></i>
            {questionState?.following ? 'Following' : 'Follow'}
          </Button>
        </div>
      </div>

      {/* Answers */}
      {question.answers.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-600">
          {visibleAnswers.map((answer, index) => (
            <AnswerItem key={index} answer={answer} />
          ))}
          
          {hiddenAnswersCount > 0 && !showAllAnswers && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllAnswers(true)}
              className="text-[#5193B3] hover:text-[#4082a2] p-0 h-auto font-medium text-sm"
            >
              Show {hiddenAnswersCount} more answer{hiddenAnswersCount > 1 ? 's' : ''}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}