import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SyndicateCard } from '@/components/syndication/SyndicateCard';
import syndicatesData from '../mocks/syndicates.json';

export default function Syndication() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [selectedEligibility, setSelectedEligibility] = useState<string>('');
  const [minCheque, setMinCheque] = useState<string>('');
  const [closingWindow, setClosingWindow] = useState<string>('');

  const allSectors = useMemo(() => {
    const sectors = new Set<string>();
    syndicatesData.forEach(syndicate => {
      syndicate.sector.forEach(s => sectors.add(s));
    });
    return Array.from(sectors).sort();
  }, []);

  const stages = ['Pre-Seed', 'Seed', 'A', 'B'];
  const eligibilityOptions = ['EIS', 'SEIS', 'Both'];
  const chequeOptions = ['<5k', '5k-10k', '10k-25k', '25k+'];
  const closingOptions = ['≤2 weeks', '≤30 days', '≤90 days'];

  const filteredSyndicates = useMemo(() => {
    return syndicatesData.filter(syndicate => {
      // Search term
      if (searchTerm && !syndicate.company.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !syndicate.lead.alias.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Sectors
      if (selectedSectors.length > 0 && !selectedSectors.some(sector => syndicate.sector.includes(sector))) {
        return false;
      }

      // Stage
      if (selectedStage && syndicate.stage !== selectedStage) {
        return false;
      }

      // Eligibility
      if (selectedEligibility) {
        if (selectedEligibility === 'EIS' && !syndicate.eligibility.EIS) return false;
        if (selectedEligibility === 'SEIS' && !syndicate.eligibility.SEIS) return false;
        if (selectedEligibility === 'Both' && (!syndicate.eligibility.EIS || !syndicate.eligibility.SEIS)) return false;
      }

      // Min Cheque
      if (minCheque) {
        const cheque = syndicate.minChequeGBP;
        if (minCheque === '<5k' && cheque >= 5000) return false;
        if (minCheque === '5k-10k' && (cheque < 5000 || cheque > 10000)) return false;
        if (minCheque === '10k-25k' && (cheque < 10000 || cheque > 25000)) return false;
        if (minCheque === '25k+' && cheque < 25000) return false;
      }

      // Closing Window
      if (closingWindow) {
        const today = new Date();
        const closing = new Date(syndicate.closingDate);
        const diffDays = Math.ceil((closing.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (closingWindow === '≤2 weeks' && diffDays > 14) return false;
        if (closingWindow === '≤30 days' && diffDays > 30) return false;
        if (closingWindow === '≤90 days' && diffDays > 90) return false;
      }

      return true;
    });
  }, [searchTerm, selectedSectors, selectedStage, selectedEligibility, minCheque, closingWindow]);

  const toggleSector = (sector: string) => {
    setSelectedSectors(prev => 
      prev.includes(sector) 
        ? prev.filter(s => s !== sector)
        : [...prev, sector]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedSectors([]);
    setSelectedStage('');
    setSelectedEligibility('');
    setMinCheque('');
    setClosingWindow('');
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
            <span className="text-gray-900 dark:text-gray-100">Syndication</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Syndication
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Explore open syndicates and community confidence signals.
            </p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <Input
              placeholder="Search companies or lead aliases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filters</h2>
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            </div>

            <div className="space-y-4">
              {/* Sectors */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Sectors
                </label>
                <div className="flex flex-wrap gap-2">
                  {allSectors.map(sector => (
                    <button
                      key={sector}
                      onClick={() => toggleSector(sector)}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        selectedSectors.includes(sector)
                          ? 'bg-[var(--primary)] text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {sector}
                    </button>
                  ))}
                </div>
              </div>

              {/* Other Filters Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Stage
                  </label>
                  <select
                    value={selectedStage}
                    onChange={(e) => setSelectedStage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">All Stages</option>
                    {stages.map(stage => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Eligibility
                  </label>
                  <select
                    value={selectedEligibility}
                    onChange={(e) => setSelectedEligibility(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Any</option>
                    {eligibilityOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Min Cheque
                  </label>
                  <select
                    value={minCheque}
                    onChange={(e) => setMinCheque(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Any</option>
                    {chequeOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Closing
                  </label>
                  <select
                    value={closingWindow}
                    onChange={(e) => setClosingWindow(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Any Time</option>
                    {closingOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400">
              {filteredSyndicates.length} syndicate{filteredSyndicates.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Syndicates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSyndicates.map(syndicate => (
              <SyndicateCard key={syndicate.id} syndicate={syndicate} />
            ))}
          </div>

          {filteredSyndicates.length === 0 && (
            <div className="text-center py-12">
              <i className="fas fa-search text-4xl text-gray-400 mb-4" aria-hidden="true"></i>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No syndicates found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Try adjusting your filters or search terms
              </p>
              <Button onClick={clearAllFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}