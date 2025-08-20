import { InfoPopover } from '@/components/shared/InfoPopover';
import { TrendingUp, AlertTriangle, Target } from 'lucide-react';

interface WhyThisData {
  reasoning: string;
  keyMetrics: string[];
  riskFactors: string[];
  opportunityFactors: string[];
}

interface WhyThisSyndicateProps {
  whyThis: WhyThisData;
  company: string;
  className?: string;
}

export function WhyThisSyndicate({ whyThis, company, className = '' }: WhyThisSyndicateProps) {
  return (
    <div className={`${className}`}>
      <InfoPopover 
        title={`Why ${company}?`}
        trigger={
          <button className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors">
            <Target className="h-4 w-4" />
            Why This Syndicate?
          </button>
        }
        side="top"
      >
        <div className="space-y-4 max-w-sm">
          {/* Main Reasoning */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {whyThis.reasoning}
            </p>
          </div>

          {/* Key Metrics */}
          {whyThis.keyMetrics.length > 0 && (
            <div>
              <div className="flex items-center gap-1 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Key Metrics
                </h4>
              </div>
              <ul className="space-y-1">
                {whyThis.keyMetrics.map((metric, index) => (
                  <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1">
                    <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                    {metric}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Opportunity Factors */}
          {whyThis.opportunityFactors.length > 0 && (
            <div>
              <div className="flex items-center gap-1 mb-2">
                <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Opportunities
                </h4>
              </div>
              <ul className="space-y-1">
                {whyThis.opportunityFactors.map((factor, index) => (
                  <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risk Factors */}
          {whyThis.riskFactors.length > 0 && (
            <div>
              <div className="flex items-center gap-1 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Risk Factors
                </h4>
              </div>
              <ul className="space-y-1">
                {whyThis.riskFactors.map((risk, index) => (
                  <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1">
                    <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <strong>Note:</strong> This analysis is for informational purposes only and not investment advice. 
              Always conduct your own due diligence before making investment decisions.
            </p>
          </div>
        </div>
      </InfoPopover>
    </div>
  );
}