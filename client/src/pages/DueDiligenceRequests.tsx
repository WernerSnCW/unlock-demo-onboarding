import Header from '../components/Header';
import Footer from '../components/Footer';
import { RequestsTable } from '@/components/due/RequestsTable';

export default function DueDiligenceRequests() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">All Requests</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            View and manage all your due diligence requests
          </p>
        </div>

          <RequestsTable typeFilter="all" />
        </div>
      </main>
      <Footer />
    </div>
  );
}