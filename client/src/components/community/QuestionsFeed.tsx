import { useState, useMemo } from 'react';
import { QuestionCard } from './QuestionCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Question {
  id: string;
  target: 'lead' | 'company' | 'community';
  body: string;
  upvotes: number;
  status: 'answered' | 'open';
  createdAt: string;
  answers: Array<{
    authorRole: 'company' | 'lead' | 'peer';
    author: string;
    verified: boolean;
    body: string;
    createdAt: string;
  }>;
  followers: number;
}

interface QuestionsFeedProps {
  businessId: string;
  questions: Question[];
}

type TargetFilter = 'all' | 'lead' | 'company' | 'community';
type SortOption = 'top' | 'new' | 'unanswered';

export function QuestionsFeed({ businessId, questions }: QuestionsFeedProps) {
  const [targetFilter, setTargetFilter] = useState<TargetFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('top');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [questionStates, setQuestionStates] = useState<Record<string, { upvoted: boolean, following: boolean }>>({});
  
  const QUESTIONS_PER_PAGE = 5;

  const filteredAndSortedQuestions = useMemo(() => {
    let filtered = questions;

    // Filter by target
    if (targetFilter !== 'all') {
      filtered = filtered.filter(q => q.target === targetFilter);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(q => 
        q.body.toLowerCase().includes(query) ||
        q.answers.some(a => a.body.toLowerCase().includes(query))
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'top':
          // Sort by upvotes desc, then by date desc
          if (a.upvotes !== b.upvotes) {
            return b.upvotes - a.upvotes;
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        
        case 'new':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        
        case 'unanswered':
          // Open questions first, then by date desc
          if (a.status !== b.status) {
            return a.status === 'open' ? -1 : 1;
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        
        default:
          return 0;
      }
    });

    return filtered;
  }, [questions, targetFilter, sortOption, searchQuery]);

  const paginatedQuestions = useMemo(() => {
    const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;
    return filteredAndSortedQuestions.slice(startIndex, startIndex + QUESTIONS_PER_PAGE);
  }, [filteredAndSortedQuestions, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedQuestions.length / QUESTIONS_PER_PAGE);
  const hasMore = currentPage < totalPages;

  const handleQuestionAction = (questionId: string, action: 'upvote' | 'follow') => {
    setQuestionStates(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [action === 'upvote' ? 'upvoted' : 'following']: !prev[questionId]?.[action === 'upvote' ? 'upvoted' : 'following']
      }
    }));
  };

  const getTargetBadgeColor = (target: string) => {
    switch (target) {
      case 'lead': return 'bg-[#F8D49B] text-gray-900';
      case 'company': return 'bg-[#62C4C3] text-gray-900';
      case 'community': return 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
      default: return 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  const getTargetLabel = (target: string) => {
    switch (target) {
      case 'lead': return 'To Lead';
      case 'company': return 'To Company';
      case 'community': return 'Community';
      default: return target;
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Row */}
      <div className="space-y-3">
        {/* Target Filter */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400 self-center">Filter:</span>
          {(['all', 'lead', 'company', 'community'] as const).map((target) => (
            <Button
              key={target}
              variant={targetFilter === target ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTargetFilter(target)}
              className={`text-xs ${targetFilter === target 
                ? 'bg-[#5193B3] hover:bg-[#4082a2] text-white' 
                : 'text-gray-700 dark:text-gray-300'
              }`}
              aria-label={`Filter by ${target === 'all' ? 'all targets' : getTargetLabel(target)}`}
            >
              {target === 'all' ? 'All' : getTargetLabel(target)}
            </Button>
          ))}
        </div>

        {/* Sort and Search */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400 self-center">Sort:</span>
            {(['top', 'new', 'unanswered'] as const).map((sort) => (
              <Button
                key={sort}
                variant={sortOption === sort ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortOption(sort)}
                className={`text-xs ${sortOption === sort 
                  ? 'bg-[#5193B3] hover:bg-[#4082a2] text-white' 
                  : 'text-gray-700 dark:text-gray-300'
                }`}
                aria-label={`Sort by ${sort}`}
              >
                {sort.charAt(0).toUpperCase() + sort.slice(1)}
              </Button>
            ))}
          </div>
          
          <Input
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 sm:max-w-xs text-sm"
            aria-label="Search questions and answers"
          />
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {paginatedQuestions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery.trim() || targetFilter !== 'all' 
                ? "No questions match your filters. Try 'All' or ask a new one."
                : "No questions yet. Be the first to ask the lead, company, or community."
              }
            </p>
          </div>
        ) : (
          paginatedQuestions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              questionState={questionStates[question.id]}
              onUpvote={() => handleQuestionAction(question.id, 'upvote')}
              onFollow={() => handleQuestionAction(question.id, 'follow')}
              getTargetBadgeColor={getTargetBadgeColor}
              getTargetLabel={getTargetLabel}
            />
          ))
        )}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="text-gray-700 dark:text-gray-300"
          >
            Load More ({filteredAndSortedQuestions.length - (currentPage * QUESTIONS_PER_PAGE)} remaining)
          </Button>
        </div>
      )}
    </div>
  );
}