import { formatDistanceToNow } from 'date-fns';
import RoleBadge from './RoleBadge';

interface QnaAnswerItemProps {
  answer: {
    id: string;
    author: {
      id: string;
      role: 'investor' | 'lead' | 'company';
      verified?: boolean;
      name?: string;
    };
    body: string;
    createdAt: string;
  };
  isPinned?: boolean;
}

export default function QnaAnswerItem({ answer, isPinned }: QnaAnswerItemProps) {
  return (
    <div className={`flex gap-3 p-4 rounded-lg border-l-2 ${
      isPinned 
        ? 'bg-[var(--success)]/5 border-l-[var(--success)]' 
        : 'bg-[var(--muted)]/30 border-l-[var(--border)]'
    }`}>
      {/* Avatar placeholder */}
      <div className="w-8 h-8 bg-[var(--muted)] rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-medium text-[var(--muted-foreground)]">
          {answer.author.name?.[0] || answer.author.role[0].toUpperCase()}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <RoleBadge role={answer.author.role} verified={answer.author.verified} />
          {isPinned && (
            <span className="text-xs px-2 py-1 bg-[var(--success)]/20 text-[var(--success)] rounded-full font-medium">
              Verified Answer
            </span>
          )}
          <span className="text-xs text-[var(--muted-foreground)]">
            {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}
          </span>
        </div>

        <div className="text-sm text-[var(--foreground)] leading-relaxed">
          {answer.body}
        </div>
      </div>
    </div>
  );
}