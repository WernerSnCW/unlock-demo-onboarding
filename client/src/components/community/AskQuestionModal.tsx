import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface AskQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
}

export function AskQuestionModal({ isOpen, onClose, businessName }: AskQuestionModalProps) {
  const [selectedTarget, setSelectedTarget] = useState<'lead' | 'company' | 'community'>('company');
  const [questionText, setQuestionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (questionText.trim().length < 10) {
      return; // Form validation would show error
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, this would add the question to the list
    console.log('New question submitted:', {
      target: selectedTarget,
      body: questionText.trim(),
      businessName
    });

    // Reset form and close
    setQuestionText('');
    setSelectedTarget('company');
    setIsSubmitting(false);
    onClose();

    // Show success toast (would integrate with toast system)
    // toast.success('Question submitted successfully!');
  };

  const getTargetDescription = (target: string) => {
    switch (target) {
      case 'lead':
        return 'Questions about thesis, terms, diligence rationale';
      case 'company':
        return 'Operational, product, or financial details';
      case 'community':
        return 'Peer opinions and comparisons';
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Ask a Question about {businessName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Target Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Route to:
            </Label>
            
            <div className="space-y-3">
              {[
                { value: 'lead' as const, label: 'Lead Investor' },
                { value: 'company' as const, label: 'Company' },
                { value: 'community' as const, label: 'Community' }
              ].map((option) => (
                <div key={option.value} className="flex items-start gap-3">
                  <input
                    type="radio"
                    id={`target-${option.value}`}
                    name="target"
                    value={option.value}
                    checked={selectedTarget === option.value}
                    onChange={(e) => setSelectedTarget(e.target.value as typeof selectedTarget)}
                    className="mt-1 w-4 h-4 text-[#5193B3] border-gray-300 focus:ring-[#5193B3] dark:border-gray-600 dark:bg-gray-700"
                    aria-describedby={`target-${option.value}-desc`}
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor={`target-${option.value}`}
                      className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer"
                    >
                      {option.label}
                    </Label>
                    <p 
                      id={`target-${option.value}-desc`}
                      className="text-xs text-gray-600 dark:text-gray-400 mt-1"
                    >
                      {getTargetDescription(option.value)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Question Input */}
          <div className="space-y-2">
            <Label htmlFor="question" className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Your question
            </Label>
            <Textarea
              id="question"
              placeholder="What would you like to know?"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={500}
              required
              aria-describedby="question-help"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span id="question-help">
                Minimum 10 characters required
              </span>
              <span>
                {questionText.length}/500
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="space-y-4">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Public Q&A. Keep it professional; no personal data.
            </p>
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={questionText.trim().length < 10 || isSubmitting}
                className="flex-1 bg-[#5193B3] hover:bg-[#4082a2] text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}