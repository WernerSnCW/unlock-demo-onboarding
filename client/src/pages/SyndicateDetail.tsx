import { useRoute, Link } from 'wouter';
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { SyndicateDetailHeader } from '@/components/syndication/SyndicateDetailHeader';
import { ConfidenceSignals } from '@/components/syndication/ConfidenceSignals';
import { ActivityTimeline } from '@/components/syndication/ActivityTimeline';
import { JoinSyndicateCard } from '@/components/syndication/JoinSyndicateCard';
import { AssistantPreview } from '@/components/syndication/AssistantPreview';
import syndicatesData from '../mocks/syndicates.json';

export default function SyndicateDetail() {
  const [, params] = useRoute('/syndication/:id');
  const [requested, setRequested] = useState(false);
  
  const syndicate = syndicatesData.find(s => s.id === params?.id);

  useEffect(() => {
    // Check if user has already requested to join this syndicate
    const hasRequested = localStorage.getItem(`syndicate_requested_${params?.id}`) === 'true';
    setRequested(hasRequested);
  }, [params?.id]);

  if (!syndicate) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Syndicate Not Found</h1>
          <Link href="/syndication">
            <a className="text-[var(--primary)] hover:text-[var(--primary)]/80">
              Back to Syndicates
            </a>
          </Link>
        </div>
      </div>
    );
  }

  const handleJoinSyndicate = (syndicateId: string) => {
    localStorage.setItem(`syndicate_requested_${syndicateId}`, 'true');
    setRequested(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumbs */}
          <nav className="mb-6 text-sm">
            <Link href="/" className="text-[var(--primary)] hover:text-[var(--primary)]/80">
              Home
            </Link>
            <span className="text-gray-500 mx-2">→</span>
            <Link href="/syndication" className="text-[var(--primary)] hover:text-[var(--primary)]/80">
              Syndication
            </Link>
            <span className="text-gray-500 mx-2">→</span>
            <span className="text-gray-900 dark:text-gray-100">{syndicate.company}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <SyndicateDetailHeader syndicate={syndicate} requested={requested} />
              <ConfidenceSignals interest={syndicate.interest} />
              <ActivityTimeline events={syndicate.activity as any} />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <JoinSyndicateCard 
                syndicate={{
                  id: syndicate.id,
                  company: syndicate.company,
                  minChequeGBP: syndicate.minChequeGBP,
                  closingDate: syndicate.closingDate,
                  carryPct: syndicate.carryPct,
                  mgmtFeePct: syndicate.mgmtFeePct,
                  verified: syndicate.verified
                }}
                onJoin={handleJoinSyndicate}
              />
              
              <AssistantPreview
                company={syndicate.company}
                sector={syndicate.sector}
                targetRaise={syndicate.targetRaiseGBP}
                minCheque={syndicate.minChequeGBP}
                leadAlias={syndicate.lead.alias}
                leadTrackRecord={syndicate.lead.trackRecord}
                eligibilityEIS={syndicate.eligibility.EIS}
                closingDate={syndicate.closingDate}
              />

              {/* FAQs / Risks */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Important Information
                </h3>
                
                <div className="space-y-4 text-sm">
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <i className="fas fa-exclamation-triangle text-red-600 dark:text-red-400 mt-0.5" aria-hidden="true"></i>
                      <div>
                        <p className="font-medium text-red-800 dark:text-red-400 mb-1">
                          Not Financial Advice
                        </p>
                        <p className="text-red-700 dark:text-red-300">
                          This is not advice. Community interest is not a recommendation. 
                          All investments carry risk of loss.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      Key Risks
                    </h4>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                      <li>Early-stage investments are high risk</li>
                      <li>You may lose all of your investment</li>
                      <li>Investments may be illiquid for several years</li>
                      <li>Tax reliefs are not guaranteed</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      How Syndicates Work
                    </h4>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                      <li>Lead investor coordinates the group</li>
                      <li>Members invest individually, not as a fund</li>
                      <li>Due diligence is shared among participants</li>
                      <li>Each member makes their own investment decision</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}