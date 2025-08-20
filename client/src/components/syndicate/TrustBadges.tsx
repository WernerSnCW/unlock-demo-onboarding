import { Check, FileText, Shield } from 'lucide-react';
import { InfoPopover } from '@/components/shared/InfoPopover';

interface TrustBadgesProps {
  leadVetted: boolean;
  governanceAudited: boolean;
  docPackAvailable: boolean;
  className?: string;
}

export function TrustBadges({ 
  leadVetted, 
  governanceAudited, 
  docPackAvailable, 
  className = '' 
}: TrustBadgesProps) {
  const badges = [
    {
      key: 'leadVetted',
      active: leadVetted,
      icon: Check,
      label: 'Lead Vetted',
      tooltip: 'Lead identity and track record reviewed by Unlock.',
    },
    {
      key: 'docs',
      active: docPackAvailable,
      icon: FileText,
      label: 'Docs Available',
      tooltip: 'Lead memo and term sheet available for review.',
    },
    {
      key: 'governance',
      active: governanceAudited,
      icon: Shield,
      label: 'Governance Audited',
      tooltip: 'Key governance controls independently reviewed.',
    },
  ];

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {badges.map(({ key, active, icon: Icon, label, tooltip }) => {
        const badgeContent = (
          <div 
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              active 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700'
            }`}
            role="button"
            tabIndex={0}
            aria-label={`${label}: ${active ? 'verified' : 'not verified'}`}
          >
            <Icon className="h-3 w-3" />
            <span>{label}</span>
          </div>
        );

        return (
          <InfoPopover key={key} title={label} side="top">
            <div className="text-sm">
              <p className="mb-2">{tooltip}</p>
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                active 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
              }`}>
                {active ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>Verified</span>
                  </>
                ) : (
                  <>
                    <div className="h-3 w-3 rounded-full border border-current opacity-50" />
                    <span>Pending</span>
                  </>
                )}
              </div>
            </div>
          </InfoPopover>
        );
      })}
    </div>
  );
}