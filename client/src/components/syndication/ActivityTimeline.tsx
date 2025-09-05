import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

interface QAAnswer {
  id: string;
  author: string;
  authorType: 'founder' | 'lead' | 'investor';
  text: string;
  timestamp: string;
  verified?: boolean;
}

interface QAQuestion {
  id: string;
  question: string;
  author: string;
  timestamp: string;
  answers: QAAnswer[];
  upvotes: number;
  tags?: string[];
}

interface ActivityEvent {
  ts: string;
  type: 'qa' | 'commit' | 'update';
  text: string;
  isNew?: boolean;
  qaData?: QAQuestion; // Enhanced Q&A data
}

interface ActivityTimelineProps {
  events: ActivityEvent[];
  companyName?: string;
}

export function ActivityTimeline({ events, companyName = "the company" }: ActivityTimelineProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [expandedQA, setExpandedQA] = useState<Set<string>>(new Set());
  const [newQuestion, setNewQuestion] = useState('');
  const [showNewQuestionForm, setShowNewQuestionForm] = useState(false);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [showReplyForm, setShowReplyForm] = useState<Set<string>>(new Set());
  
  const filters = [
    { key: 'all', label: 'All Updates', icon: 'fas fa-list' },
    { key: 'commit', label: 'Commitments', icon: 'fas fa-handshake' },
    { key: 'qa', label: 'Founder Q&A', icon: 'fas fa-question-circle' },
    { key: 'update', label: 'Lead Notes', icon: 'fas fa-sticky-note' },
  ];
  
  const filteredEvents = activeFilter === 'all' 
    ? events 
    : events.filter(event => event.type === activeFilter);
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

  const toggleQAExpanded = (qaId: string) => {
    const newExpanded = new Set(expandedQA);
    if (newExpanded.has(qaId)) {
      newExpanded.delete(qaId);
    } else {
      newExpanded.add(qaId);
    }
    setExpandedQA(newExpanded);
  };

  const toggleReplyForm = (qaId: string) => {
    const newShowReply = new Set(showReplyForm);
    if (newShowReply.has(qaId)) {
      newShowReply.delete(qaId);
    } else {
      newShowReply.add(qaId);
    }
    setShowReplyForm(newShowReply);
  };

  const handleSubmitQuestion = () => {
    if (newQuestion.trim()) {
      // In a real implementation, this would make an API call
      console.log('Submitting new question:', newQuestion);
      setNewQuestion('');
      setShowNewQuestionForm(false);
      // TODO: Add to events array and trigger refresh
    }
  };

  const handleSubmitReply = (qaId: string) => {
    const reply = replyText[qaId];
    if (reply?.trim()) {
      // In a real implementation, this would make an API call
      console.log('Submitting reply to', qaId, ':', reply);
      setReplyText({ ...replyText, [qaId]: '' });
      toggleReplyForm(qaId);
      // TODO: Update the QA data and trigger refresh
    }
  };

  const getAuthorBadge = (authorType: string, verified?: boolean) => {
    const badges = {
      founder: { text: 'Founder', color: 'bg-[var(--primary)] text-white' },
      lead: { text: 'Lead', color: 'bg-[var(--secondary)] text-white' },
      investor: { text: 'Investor', color: 'bg-gray-500 text-white' }
    };
    
    const badge = badges[authorType as keyof typeof badges] || badges.investor;
    
    return (
      <div className="flex items-center gap-1">
        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${badge.color}`}>
          {badge.text}
        </span>
        {verified && (
          <i className="fas fa-check-circle text-green-500 text-xs" aria-hidden="true"></i>
        )}
      </div>
    );
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Activity Timeline
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {events.filter(e => e.isNew).length} new since last login
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        {filters.map(filter => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === filter.key
                ? 'bg-[var(--primary)] text-white'
                : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            <i className={`${filter.icon} text-xs`} aria-hidden="true"></i>
            {filter.label}
          </button>
        ))}
      </div>

      {/* New Question Form for Q&A filter */}
      {activeFilter === 'qa' && (
        <div className="mb-6">
          {!showNewQuestionForm ? (
            <Button 
              onClick={() => setShowNewQuestionForm(true)}
              className="w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90"
            >
              <i className="fas fa-plus mr-2" aria-hidden="true"></i>
              Ask a Question
            </Button>
          ) : (
            <Card className="border border-[var(--primary)]/20 bg-[var(--primary)]/5">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-[var(--primary)]">
                    <i className="fas fa-question-circle" aria-hidden="true"></i>
                    Ask {companyName} a Question
                  </div>
                  <Textarea
                    placeholder="What would you like to know about this investment opportunity?"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSubmitQuestion} 
                      disabled={!newQuestion.trim()}
                      size="sm"
                    >
                      Submit Question
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowNewQuestionForm(false);
                        setNewQuestion('');
                      }}
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="space-y-4">
        {filteredEvents.map((event, index) => {
          const eventMeta = getEventIcon(event.type);
          
          // Enhanced Q&A rendering
          if (event.type === 'qa' && event.qaData) {
            const qa = event.qaData;
            const isExpanded = expandedQA.has(qa.id);
            const showReply = showReplyForm.has(qa.id);
            
            return (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  {/* Question Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <i className="fas fa-question-circle text-blue-600 dark:text-blue-400 text-sm" aria-hidden="true"></i>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 leading-tight">
                          {qa.question}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                          {formatDate(qa.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                        <span>Asked by {qa.author}</span>
                        {qa.tags && qa.tags.map((tag, i) => (
                          <span key={i} className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleQAExpanded(qa.id)}
                          className="text-xs text-[var(--primary)] hover:text-[var(--primary)]/80 font-medium"
                        >
                          {isExpanded ? 'Hide' : 'View'} {qa.answers.length} Answer{qa.answers.length !== 1 ? 's' : ''}
                        </button>
                        <button className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                          <i className="fas fa-thumbs-up mr-1" aria-hidden="true"></i>
                          {qa.upvotes}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Answers Section */}
                  {isExpanded && (
                    <div className="ml-11 space-y-3">
                      {qa.answers.map((answer, answerIndex) => (
                        <div key={answer.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                {answer.author}
                              </span>
                              {getAuthorBadge(answer.authorType, answer.verified)}
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(answer.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {answer.text}
                          </p>
                        </div>
                      ))}
                      
                      {/* Reply Form */}
                      {!showReply ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => toggleReplyForm(qa.id)}
                          className="text-xs"
                        >
                          <i className="fas fa-reply mr-1" aria-hidden="true"></i>
                          Reply
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Share your thoughts or follow-up questions..."
                            value={replyText[qa.id] || ''}
                            onChange={(e) => setReplyText({ ...replyText, [qa.id]: e.target.value })}
                            className="min-h-[60px] text-sm"
                          />
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleSubmitReply(qa.id)}
                              disabled={!replyText[qa.id]?.trim()}
                            >
                              Post Reply
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => toggleReplyForm(qa.id)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          }
          
          // Standard event rendering for non-Q&A events
          return (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <i className={`${eventMeta.icon} ${eventMeta.color} text-sm`} aria-hidden="true"></i>
                </div>
              </div>
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