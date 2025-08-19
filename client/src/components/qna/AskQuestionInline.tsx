import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface AskQuestionInlineProps {
  onSubmit: (question: { body: string; target: 'company' | 'lead' | 'community' }) => void;
  defaultTarget?: 'company' | 'lead' | 'community';
  disabled?: boolean;
}

export default function AskQuestionInline({ onSubmit, defaultTarget = 'company', disabled = false }: AskQuestionInlineProps) {
  const [body, setBody] = useState('');
  const [target, setTarget] = useState(defaultTarget);

  const handleSubmit = () => {
    if (body.trim().length >= 8) {
      onSubmit({ body: body.trim(), target });
      setBody('');
    }
  };

  const isValid = body.trim().length >= 8;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="question-input" className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 block">
            Ask a question
          </Label>
          <Textarea
            id="question-input"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Ask about financials, product roadmap, market position..."
            className="min-h-[80px] resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            disabled={disabled}
            aria-label="Ask a question"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 block">
            Route to
          </Label>
          <RadioGroup
            value={target}
            onValueChange={(value) => setTarget(value as 'company' | 'lead' | 'community')}
            className="flex gap-6"
            disabled={disabled}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="lead" id="lead" className="border-gray-400 dark:border-gray-500 text-gray-900 dark:text-gray-100" />
              <Label 
                htmlFor="lead" 
                className="text-sm cursor-pointer text-gray-900 dark:text-gray-100"
                title="Directed to the lead investor (thesis, terms, diligence)"
              >
                Lead
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="company" id="company" className="border-gray-400 dark:border-gray-500 text-gray-900 dark:text-gray-100" />
              <Label 
                htmlFor="company" 
                className="text-sm cursor-pointer text-gray-900 dark:text-gray-100"
                title="Directed to the company (product, metrics, roadmap)"
              >
                Company
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="community" id="community" className="border-gray-400 dark:border-gray-500 text-gray-900 dark:text-gray-100" />
              <Label 
                htmlFor="community" 
                className="text-sm cursor-pointer text-gray-900 dark:text-gray-100"
                title="Peer discussion among investors"
              >
                Community
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Public Q&A. Do not share personal data. This is not advice.
          </p>
          <Button 
            onClick={handleSubmit}
            disabled={!isValid || disabled}
            className="ml-4"
          >
            Post Question
          </Button>
        </div>
      </div>
    </div>
  );
}