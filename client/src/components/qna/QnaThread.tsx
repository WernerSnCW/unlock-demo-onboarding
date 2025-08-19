import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import QnaQuestionCard from './QnaQuestionCard';

interface QnaThreadProps {
  questions: Array<{
    id: string;
    target: 'company' | 'lead' | 'community';
    body: string;
    author: {
      id: string;
      role: 'investor' | 'lead' | 'company';
      verified?: boolean;
      name?: string;
    };
    createdAt: string;
    upvotes: number;
    followers: number;
    status: 'open' | 'answered' | 'closed';
    answers: Array<{
      id: string;
      author: {
        id: string;
        role: 'investor' | 'lead' | 'company';
        verified?: boolean;
        name?: string;
      };
      body: string;
      createdAt: string;
    }>;
    upvotedBy?: string[];
    followedBy?: string[];
  }>;
  currentUserId: string;
  currentUserRole: 'investor' | 'lead' | 'company';
  onUpvote: (questionId: string) => void;
  onFollow: (questionId: string) => void;
  onAnswer: (questionId: string, body: string) => void;
  onMarkAnswered?: (questionId: string, answerId: string) => void;
  requestId?: string;
}

type FilterType = 'all' | 'lead' | 'company' | 'community' | 'unanswered';
type SortType = 'top' | 'new' | 'active';

export default function QnaThread({
  questions,
  currentUserId,
  currentUserRole,
  onUpvote,
  onFollow,
  onAnswer,
  onMarkAnswered,
  requestId
}: QnaThreadProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('top');

  const filteredAndSortedQuestions = useMemo(() => {
    let filtered = questions;

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(q => 
        q.body.toLowerCase().includes(search) ||
        q.answers.some(a => a.body.toLowerCase().includes(search))
      );
    }

    // Apply target filter
    if (filter !== 'all') {
      if (filter === 'unanswered') {
        filtered = filtered.filter(q => q.status === 'open' && q.answers.length === 0);
      } else {
        filtered = filtered.filter(q => q.target === filter);
      }
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sort) {
        case 'top':
          return b.upvotes - a.upvotes;
        case 'new':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'active':
          const aLastActivity = a.answers.length > 0 
            ? Math.max(...a.answers.map(ans => new Date(ans.createdAt).getTime()))
            : new Date(a.createdAt).getTime();
          const bLastActivity = b.answers.length > 0
            ? Math.max(...b.answers.map(ans => new Date(ans.createdAt).getTime()))
            : new Date(b.createdAt).getTime();
          return bLastActivity - aLastActivity;
        default:
          return 0;
      }
    });

    return sorted;
  }, [questions, searchTerm, filter, sort]);

  const filterChips: Array<{ key: FilterType; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'lead', label: 'To Lead' },
    { key: 'company', label: 'To Company' },
    { key: 'community', label: 'Community' },
    { key: 'unanswered', label: 'Unanswered' }
  ];

  const sortOptions: Array<{ key: SortType; label: string }> = [
    { key: 'top', label: 'Top' },
    { key: 'new', label: 'New' },
    { key: 'active', label: 'Active' }
  ];

  const getEmptyStateMessage = () => {
    if (filter !== 'all' || searchTerm.trim()) {
      return "No questions match. Try All or ask a new one.";
    }
    return "Be the first to ask the Lead or Company.";
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--muted-foreground)] w-4 h-4" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions and answers..."
            className="pl-10"
          />
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Filter chips */}
          <div className="flex flex-wrap gap-2">
            {filterChips.map((chip) => (
              <button
                key={chip.key}
                onClick={() => setFilter(chip.key)}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                  filter === chip.key
                    ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                    : 'bg-[var(--background)] text-[var(--muted-foreground)] border-[var(--border)] hover:bg-[var(--muted)]'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted-foreground)]">Sort:</span>
            <div className="flex gap-1">
              {sortOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setSort(option.key)}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                    sort === option.key
                      ? 'bg-[var(--muted)] text-[var(--foreground)]'
                      : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {filteredAndSortedQuestions.length > 0 ? (
          filteredAndSortedQuestions.map((question) => (
            <QnaQuestionCard
              key={question.id}
              question={question}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              onUpvote={onUpvote}
              onFollow={onFollow}
              onAnswer={onAnswer}
              onMarkAnswered={onMarkAnswered}
              requestId={requestId}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[var(--muted)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-[var(--muted-foreground)]" />
            </div>
            <p className="text-[var(--muted-foreground)] text-sm">
              {getEmptyStateMessage()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}