import { Button } from '@/components/ui/button';

interface AssistantPreviewProps {
  company: string;
  sector: string[];
  targetRaise: number;
  minCheque: number;
  leadAlias: string;
  leadTrackRecord: string;
  eligibilityEIS: boolean;
  closingDate: string;
}

export function AssistantPreview({ 
  company, 
  sector, 
  targetRaise, 
  minCheque, 
  leadAlias, 
  leadTrackRecord,
  eligibilityEIS,
  closingDate 
}: AssistantPreviewProps) {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `£${(amount / 1000000).toFixed(1)}m`;
    }
    return `£${(amount / 1000).toFixed(0)}k`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Syndicate Builder Assistant
        </h3>
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400 text-xs rounded">
          <i className="fas fa-star" aria-hidden="true"></i>
          Premium
        </span>
      </div>

      {/* Blurred Preview */}
      <div className="relative mb-6">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 filter blur-sm select-none">
          <div className="space-y-3 text-sm">
            <div>
              <strong>Subject:</strong> Intro: {company} syndicate (closes {formatDate(closingDate)})
            </div>
            
            <div>Hi [Name],</div>
            
            <div>
              We're organising a small syndicate for {company} ({sector.join(', ')}). 
              Lead: {leadAlias} ({leadTrackRecord}). Target {formatCurrency(targetRaise)}; 
              min cheque {formatCurrency(minCheque)}; EIS {eligibilityEIS ? 'yes' : 'no'}.
            </div>
            
            <div>
              <strong>Key reasons:</strong>
              <ul className="list-disc list-inside ml-2">
                <li>Strong market positioning in growing sector</li>
                <li>Experienced leadership team with proven track record</li>
                <li>Clear path to profitability and exit opportunities</li>
              </ul>
            </div>
            
            <div>Would you like the detailed investment memo?</div>
            
            <div className="text-xs text-gray-500">
              — Sent via Unlock (preview)
            </div>
          </div>
        </div>

        {/* Lock Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
          <div className="bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg">
            <i className="fas fa-lock text-gray-600 dark:text-gray-400 text-xl" aria-hidden="true"></i>
          </div>
        </div>
      </div>

      {/* Action Buttons (Disabled) */}
      <div className="space-y-3 mb-6">
        <div className="flex gap-2">
          <Button 
            className="flex-1" 
            variant="outline" 
            disabled
          >
            <i className="fas fa-lock mr-2" aria-hidden="true"></i>
            Generate
          </Button>
          <Button 
            className="flex-1" 
            variant="outline" 
            disabled
          >
            <i className="fas fa-lock mr-2" aria-hidden="true"></i>
            Copy
          </Button>
          <Button 
            className="flex-1" 
            variant="outline" 
            disabled
          >
            <i className="fas fa-lock mr-2" aria-hidden="true"></i>
            Share via WhatsApp
          </Button>
        </div>
      </div>

      {/* Upgrade CTA */}
      <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-lg p-4 text-center">
        <h4 className="font-semibold mb-2">Unlock AI-Powered Outreach</h4>
        <p className="text-sm text-white/90 mb-3">
          Generate personalized investment outreach emails and WhatsApp messages with our AI assistant.
        </p>
        <Button variant="secondary" size="sm">
          <i className="fas fa-crown mr-2" aria-hidden="true"></i>
          Upgrade to Pro
        </Button>
      </div>
    </div>
  );
}