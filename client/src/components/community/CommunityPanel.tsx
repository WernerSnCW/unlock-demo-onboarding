import { useState } from 'react';
import { SyndicateInterest } from './SyndicateInterest';
import { QuestionsFeed } from './QuestionsFeed';
import { AskQuestionModal } from './AskQuestionModal';
import { Button } from '@/components/ui/button';

interface Business {
  id: string;
  name: string;
  community: {
    interest: {
      interestPct: number;
      followers: number;
      leadInvestors: number;
      avgChequeGBP: number;
      history: number[];
    };
    questions: Array<{
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
    }>;
  };
}

interface CommunityPanelProps {
  business: Business;
}

export function CommunityPanel({ business }: CommunityPanelProps) {
  const [showAskModal, setShowAskModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // Show toast notification (would integrate with toast system)
  };

  const handleAskQuestion = () => {
    setShowAskModal(true);
  };

  const handleJoinDiscussion = () => {
    // Navigate to syndication page (stub)
    console.log('Navigate to /syndication');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
        <i className="fas fa-users text-[#62C4C3]" aria-hidden="true"></i>
        Community
      </h2>

      {/* Syndicate Interest Section */}
      <SyndicateInterest interest={business.community.interest} />

      {/* Questions Feed Section */}
      <QuestionsFeed 
        businessId={business.id}
        questions={business.community.questions} 
      />

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button 
          onClick={handleFollow}
          className={`w-full ${
            isFollowing 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-[#5193B3] hover:bg-[#4082a2]'
          } text-white`}
          aria-label={isFollowing ? 'Unfollow company' : 'Follow company'}
        >
          <i className={`fas ${isFollowing ? 'fa-check' : 'fa-heart'} mr-2`} aria-hidden="true"></i>
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
        
        <Button 
          onClick={handleAskQuestion}
          variant="outline" 
          className="w-full text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          aria-label="Ask a question"
        >
          <i className="fas fa-question-circle mr-2" aria-hidden="true"></i>
          Ask a Question
        </Button>
        
        <Button 
          onClick={handleJoinDiscussion}
          variant="outline" 
          className="w-full text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          aria-label="Join discussion"
        >
          <i className="fas fa-comments mr-2" aria-hidden="true"></i>
          Join Discussion
        </Button>
      </div>

      {/* Ask Question Modal */}
      <AskQuestionModal 
        isOpen={showAskModal}
        onClose={() => setShowAskModal(false)}
        businessName={business.name}
      />
    </div>
  );
}