import { useState } from 'react';
import { Link } from 'wouter';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { BundleCard } from '@/components/syndicate/BundleCard';
import { BundleBreakdown } from '@/components/syndicate/BundleBreakdown';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PieChart, ArrowLeft, X } from 'lucide-react';
import bundlesData from '../mocks/syndicateBundles.json';

export default function SyndicationBundles() {
  const [selectedBundle, setSelectedBundle] = useState<typeof bundlesData[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBundleClick = (bundle: typeof bundlesData[0]) => {
    setSelectedBundle(bundle);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBundle(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
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
              <span className="text-gray-900 dark:text-gray-100">Bundles</span>
            </nav>

            {/* Back to Syndication */}
            <div className="mb-6">
              <Link href="/syndication">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mb-4 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Syndication
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <PieChart className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Themed Bundles
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Diversified investment portfolios across multiple companies
                </p>
              </div>
            </div>

            {/* Explainer */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800 mb-8">
              <div className="flex items-start gap-3">
                <PieChart className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    About Themed Bundles
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    A single commitment spreads across multiple companies for diversified exposure. 
                    Bundles reduce single-company risk while maintaining venture upside potential 
                    through carefully selected portfolios organized by theme, sector, or stage.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {bundlesData.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Available Bundles
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {Math.round(bundlesData.reduce((sum, bundle) => sum + bundle.confidenceScore, 0) / bundlesData.length)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Average Confidence
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  £{((bundlesData.reduce((min, bundle) => Math.min(min, bundle.minChequeGBP), Infinity)) / 1000).toFixed(0)}k
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  From (Min Investment)
                </div>
              </div>
            </div>
          </div>

          {/* Bundle Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bundlesData.map((bundle) => (
              <BundleCard
                key={bundle.id}
                bundle={bundle}
                onClick={() => handleBundleClick(bundle)}
                className="h-fit"
              />
            ))}
          </div>

          {/* Empty State (if no bundles) */}
          {bundlesData.length === 0 && (
            <div className="text-center py-12">
              <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No bundles available
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Bundle offerings will appear here as they become available.
              </p>
              <Link href="/syndication">
                <Button variant="outline">
                  Browse Individual Syndicates
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Bundle Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          {/* Custom Close Button */}
          <button
            onClick={handleCloseModal}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100 data-[state=open]:text-gray-500 dark:ring-offset-gray-950 dark:focus:ring-gray-300 dark:data-[state=open]:bg-gray-800 dark:data-[state=open]:text-gray-400"
          >
            <X className="h-4 w-4 text-gray-900 dark:text-gray-100" />
            <span className="sr-only">Close</span>
          </button>
          
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Bundle Details
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Detailed breakdown of the selected investment bundle including companies, allocation, and performance metrics
            </DialogDescription>
          </DialogHeader>
          {selectedBundle && (
            <BundleBreakdown 
              bundle={selectedBundle} 
              onClose={handleCloseModal}
            />
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}