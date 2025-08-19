import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import AskQuestionInline from './AskQuestionInline';
import QnaThread from './QnaThread';
import currentUserData from '@/mocks/currentUser.json';

interface ReportQnAProps {
  requestId: string;
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
  isCompleted: boolean;
  onQuestionSubmit: (question: { body: string; target: 'company' | 'lead' | 'community' }) => void;
  onUpvote: (questionId: string) => void;
  onFollow: (questionId: string) => void;
  onAnswer: (questionId: string, body: string) => void;
  onMarkAnswered?: (questionId: string, answerId: string) => void;
}

export default function ReportQnA({
  requestId,
  questions,
  isCompleted,
  onQuestionSubmit,
  onUpvote,
  onFollow,
  onAnswer,
  onMarkAnswered
}: ReportQnAProps) {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState(currentUserData);

  // Handle URL fragment for direct question linking
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const questionId = urlParams.get('q');
    if (questionId) {
      const element = document.getElementById(`question-${questionId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        element.classList.add('highlight-question');
        setTimeout(() => element.classList.remove('highlight-question'), 3000);
      }
    }
  }, [questions]);

  const handleQuestionSubmit = (question: { body: string; target: 'company' | 'lead' | 'community' }) => {
    onQuestionSubmit(question);
    toast({
      title: "Question posted",
      description: "Your question has been submitted successfully."
    });
  };

  const handleUpvote = (questionId: string) => {
    onUpvote(questionId);
    const question = questions.find(q => q.id === questionId);
    const isUpvoted = question?.upvotedBy?.includes(currentUser.id);
    toast({
      title: isUpvoted ? "Upvote removed" : "Question upvoted",
      description: isUpvoted ? "Your upvote has been removed." : "You upvoted this question.",
      duration: 2000
    });
  };

  const handleFollow = (questionId: string) => {
    onFollow(questionId);
    const question = questions.find(q => q.id === questionId);
    const isFollowed = question?.followedBy?.includes(currentUser.id);
    toast({
      title: isFollowed ? "Following" : "Unfollowed",
      description: isFollowed 
        ? "You'll be notified when this is answered (prototype)."
        : "You're no longer following this question.",
      duration: 3000
    });
  };

  const defaultTarget = isCompleted ? 'company' : 'lead';

  // Check if user has premium access (mock check - in real app this would be from user data)
  const hasPremiumAccess = currentUser.subscription === 'pro' || currentUser.role === 'lead';

  return (
    <div className="space-y-6">
      {/* Ask question form or premium prompt */}
      {hasPremiumAccess ? (
        <>
          <AskQuestionInline
            onSubmit={handleQuestionSubmit}
            defaultTarget={defaultTarget}
          />

          {/* Helper text */}
          <div className="text-xs text-gray-600 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p className="mb-2 text-gray-900 dark:text-gray-100">
              <strong>Public Q&A</strong> — keep it professional; no personal data.
            </p>
            <p className="text-gray-900 dark:text-gray-100">
              <strong>Target guidelines:</strong>
            </p>
            <ul className="mt-1 space-y-1 ml-4 text-gray-700 dark:text-gray-300">
              <li>• <strong>Lead:</strong> Directed to the lead investor (thesis, terms, diligence)</li>
              <li>• <strong>Company:</strong> Directed to the company (product, metrics, roadmap)</li>
              <li>• <strong>Community:</strong> Peer discussion among investors</li>
            </ul>
          </div>
        </>
      ) : (
        /* Premium feature prompt */
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
              <span className="text-amber-600 dark:text-amber-400 text-lg font-bold">✨</span>
            </div>
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">Premium Q&A Feature</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">Ask questions directly to leads and companies</p>
            </div>
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
              <span>Direct access to lead investors and company teams</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
              <span>Real-time notifications when questions are answered</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
              <span>Follow-up discussions and detailed responses</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
              Upgrade to Pro
            </Button>
            <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/20">
              Learn More
            </Button>
          </div>
        </div>
      )}

      {/* Questions thread */}
      <QnaThread
        questions={questions}
        currentUserId={currentUser.id}
        currentUserRole={currentUser.role as 'investor' | 'lead' | 'company'}
        onUpvote={handleUpvote}
        onFollow={handleFollow}
        onAnswer={onAnswer}
        onMarkAnswered={onMarkAnswered}
        requestId={requestId}
        canAskQuestions={hasPremiumAccess}
      />
    </div>
  );
}