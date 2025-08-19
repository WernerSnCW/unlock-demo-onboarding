import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, ChevronUp, ArrowUp, Bell, Link, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import RoleBadge from './RoleBadge';
import QnaAnswerItem from './QnaAnswerItem';

interface QnaQuestionCardProps {
  question: {
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
  };
  currentUserId: string;
  currentUserRole: 'investor' | 'lead' | 'company';
  onUpvote: (questionId: string) => void;
  onFollow: (questionId: string) => void;
  onAnswer: (questionId: string, body: string) => void;
  onMarkAnswered?: (questionId: string, answerId: string) => void;
  requestId?: string;
  canAskQuestions?: boolean;
}

export default function QnaQuestionCard({
  question,
  currentUserId,
  currentUserRole,
  onUpvote,
  onFollow,
  onAnswer,
  onMarkAnswered,
  requestId,
  canAskQuestions = true
}: QnaQuestionCardProps) {
  const { toast } = useToast();
  const [showAllAnswers, setShowAllAnswers] = useState(false);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answerBody, setAnswerBody] = useState('');

  const isUpvoted = question.upvotedBy?.includes(currentUserId);
  const isFollowed = question.followedBy?.includes(currentUserId);
  const canAnswer = currentUserRole === 'lead' || currentUserRole === 'company';
  
  // Sort answers to show verified company answers first
  const sortedAnswers = [...question.answers].sort((a, b) => {
    if (a.author.role === 'company' && a.author.verified) return -1;
    if (b.author.role === 'company' && b.author.verified) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const visibleAnswers = showAllAnswers ? sortedAnswers : sortedAnswers.slice(0, 3);
  const hasMoreAnswers = sortedAnswers.length > 3;

  const getTargetBadge = () => {
    const configs = {
      company: { label: 'To Company', className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' },
      lead: { label: 'To Lead', className: 'bg-[var(--primary)]/20 text-[var(--primary)]' },
      community: { label: 'Community', className: 'bg-[var(--accent)]/20 text-[var(--accent)]' }
    };
    const config = configs[question.target];
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getStatusPill = () => {
    const configs = {
      open: { label: 'Open', className: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' },
      answered: { label: 'Answered', className: 'bg-[var(--success)]/20 text-[var(--success)]' },
      closed: { label: 'Closed', className: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400' }
    };
    const config = configs[question.status];
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const handleSubmitAnswer = () => {
    if (answerBody.trim().length >= 10) {
      onAnswer(question.id, answerBody.trim());
      setAnswerBody('');
      setShowAnswerForm(false);
      toast({
        title: "Answer posted",
        description: "Your answer has been posted successfully."
      });
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/due-diligence/requests/${requestId}?q=${question.id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied",
      description: "Question link copied to clipboard."
    });
  };

  return (
    <section 
      className="bg-[var(--card)] border rounded-xl p-6 space-y-4"
      role="article"
      aria-labelledby={`question-${question.id}`}
    >
      {/* Question header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {getTargetBadge()}
          {getStatusPill()}
        </div>
        <div className="flex items-center gap-2">
          <RoleBadge role={question.author.role} verified={question.author.verified} />
          <span className="text-xs text-[var(--muted-foreground)]">
            {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>

      {/* Question body */}
      <div>
        <h3 id={`question-${question.id}`} className="text-sm font-medium text-[var(--foreground)] leading-relaxed">
          {question.body}
        </h3>
      </div>

      {/* Actions bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onUpvote(question.id)}
            className={`flex items-center gap-1 text-xs hover:text-[var(--primary)] transition-colors ${
              isUpvoted ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'
            }`}
            aria-pressed={isUpvoted}
            aria-label={`${isUpvoted ? 'Remove upvote' : 'Upvote'} (${question.upvotes} upvotes)`}
          >
            <ArrowUp className="w-4 h-4" />
            <span aria-live="polite">{question.upvotes}</span>
          </button>

          <button
            onClick={() => onFollow(question.id)}
            className={`flex items-center gap-1 text-xs hover:text-[var(--primary)] transition-colors ${
              isFollowed ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'
            }`}
            aria-pressed={isFollowed}
            aria-label={`${isFollowed ? 'Unfollow' : 'Follow'} (${question.followers} followers)`}
          >
            <Bell className="w-4 h-4" />
            <span aria-live="polite">{question.followers}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
            aria-label="Copy link to question"
          >
            <Link className="w-4 h-4" />
            Copy link
          </button>
        </div>

        {canAnswer && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAnswerForm(!showAnswerForm)}
            className="flex items-center gap-1"
          >
            <MessageSquare className="w-4 h-4" />
            Answer
          </Button>
        )}
      </div>

      {/* Answer form */}
      {showAnswerForm && (
        <div className="border-t pt-4 space-y-3">
          <Textarea
            value={answerBody}
            onChange={(e) => setAnswerBody(e.target.value)}
            placeholder="Provide a helpful answer..."
            className="min-h-[80px]"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowAnswerForm(false);
                setAnswerBody('');
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmitAnswer}
              disabled={answerBody.trim().length < 10}
            >
              Post Answer
            </Button>
          </div>
        </div>
      )}

      {/* Answers */}
      {sortedAnswers.length > 0 && (
        <div className="border-t pt-4 space-y-3">
          <div className="space-y-3">
            {visibleAnswers.map((answer) => (
              <QnaAnswerItem
                key={answer.id}
                answer={answer}
                isPinned={answer.author.role === 'company' && answer.author.verified}
              />
            ))}
          </div>

          {hasMoreAnswers && (
            <button
              onClick={() => setShowAllAnswers(!showAllAnswers)}
              className="flex items-center gap-1 text-xs text-[var(--primary)] hover:text-[var(--primary)]/80 transition-colors"
            >
              {showAllAnswers ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show fewer
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show {sortedAnswers.length - 3} more answers
                </>
              )}
            </button>
          )}
        </div>
      )}
    </section>
  );
}