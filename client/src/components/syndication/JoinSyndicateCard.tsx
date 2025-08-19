import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { JoinSyndicateModal } from './JoinSyndicateModal';

interface JoinSyndicateCardProps {
  minCheque: number;
  nominalFee?: number;
  requested?: boolean;
}

export function JoinSyndicateCard({ minCheque, nominalFee = 25, requested = false }: JoinSyndicateCardProps) {
  const [showModal, setShowModal] = useState(false);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `£${(amount / 1000000).toFixed(1)}m`;
    }
    return `£${(amount / 1000).toFixed(0)}k`;
  };

  if (requested) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-check text-blue-600 dark:text-blue-400 text-xl" aria-hidden="true"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Request Submitted
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Your reservation request has been sent. A coordinator will follow up soon.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-sm rounded-lg">
            <i className="fas fa-clock" aria-hidden="true"></i>
            Pending Review
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-handshake text-[var(--primary)] text-xl" aria-hidden="true"></i>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Join Syndicate
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Reserve your seat in this syndicate with a nominal fee
          </p>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600 dark:text-gray-400">Min Investment</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatCurrency(minCheque)}
                </div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-gray-400">Reservation Fee</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  £{nominalFee}
                </div>
              </div>
            </div>
          </div>

          <Button 
            className="w-full mb-3"
            onClick={() => setShowModal(true)}
          >
            <i className="fas fa-ticket-alt mr-2" aria-hidden="true"></i>
            Request to Join (Reserve seat — £{nominalFee})
          </Button>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            * Reservation fee shown for illustration. No transaction occurs in this prototype.
          </p>
        </div>
      </div>

      <JoinSyndicateModal
        open={showModal}
        onOpenChange={setShowModal}
        nominalFee={nominalFee}
      />
    </>
  );
}