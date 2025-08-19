import { useState, useMemo, useCallback } from 'react';
import { Link } from 'wouter';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SyndicateCard } from '@/components/syndication/SyndicateCard';
import syndicatesData from '../mocks/syndicates.json';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'confidence', label: 'Confidence' },
  { value: 'committed', label: 'Committed %' },
  { value: 'closing', label: 'Closing Soon' },
];

export default function Syndication() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [selectedEligibility, setSelectedEligibility] = useState<string>('');
  const [minCheque, setMinCheque] = useState<string>('');
  const [closingWindow, setClosingWindow] = useState<string>('');
  const [sortBy, setSortBy] = useState('relevance');
  const [isLoading, setIsLoading] = useState(false);

  const allSectors = useMemo(() => {
    const sectors = new Set<string>();
    syndicatesData.forEach(syndicate => {
      syndicate.sector.forEach(s => sectors.add(s));
    });
    return Array.from(sectors).sort();
  }, []);

  // Debounce search term
  useMemo(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const stages = ['Pre-Seed', 'Seed', 'A', 'B'];
  const eligibilityOptions = ['EIS', 'SEIS', 'Both'];
  const chequeOptions = ['<5k', '5k-10k', '10k-25k', '25k+'];
  const closingOptions = ['≤2 weeks', '≤30 days', '≤90 days'];

  const filteredAndSortedSyndicates = useMemo(() => {
    let filtered = syndicatesData.filter(syndicate => {
      // Search term
      if (debouncedSearchTerm && !syndicate.company.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) && 
          !syndicate.lead.alias.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) {
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

    // Sort results
    switch (sortBy) {
      case 'confidence':
        filtered.sort((a, b) => b.interest.confidenceScore - a.interest.confidenceScore);
        break;
      case 'committed':
        filtered.sort((a, b) => b.committedPct - a.committedPct);
        break;
      case 'closing':
        filtered.sort((a, b) => {
          const aDate = new Date(a.closingDate);
          const bDate = new Date(b.closingDate);
          return aDate.getTime() - bDate.getTime();
        });
        break;
      case 'relevance':
      default:
        // Keep original order for relevance
        break;
    }

    return filtered;
  }, [debouncedSearchTerm, selectedSectors, selectedStage, selectedEligibility, minCheque, closingWindow, sortBy]);

  const toggleSector = (sector: string) => {
    setSelectedSectors(prev => 
      prev.includes(sector) 
        ? prev.filter(s => s !== sector)
        : [...prev, sector]
    );
  };

  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setSelectedSectors([]);
    setSelectedStage('');
    setSelectedEligibility('');
    setMinCheque('');
    setClosingWindow('');
    setSortBy('relevance');
  }, []);

  const removeFilter = useCallback((type: string, value?: string) => {
    switch (type) {
      case 'search':
        setSearchTerm('');
        setDebouncedSearchTerm('');
        break;
      case 'sector':
        if (value) {
          setSelectedSectors(prev => prev.filter(s => s !== value));
        }
        break;
      case 'stage':
        setSelectedStage('');
        break;
      case 'eligibility':
        setSelectedEligibility('');
        break;
      case 'minCheque':
        setMinCheque('');
        break;
      case 'closingWindow':
        setClosingWindow('');
        break;
    }
  }, []);

  const getActiveFiltersCount = () => {
    let count = 0;
    if (debouncedSearchTerm) count++;
    if (selectedSectors.length > 0) count += selectedSectors.length;
    if (selectedStage) count++;
    if (selectedEligibility) count++;
    if (minCheque) count++;
    if (closingWindow) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

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

          {/* Search & Sort */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search companies or lead aliases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Selected Filters Chips */}
          {activeFiltersCount > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
                
                {debouncedSearchTerm && (
                  <button
                    onClick={() => removeFilter('search')}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-sm rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/30"
                  >
                    Search: "{debouncedSearchTerm}"
                    <i className="fas fa-times text-xs" aria-hidden="true"></i>
                  </button>
                )}
                
                {selectedSectors.map(sector => (
                  <button
                    key={sector}
                    onClick={() => removeFilter('sector', sector)}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-sm rounded-full hover:bg-green-200 dark:hover:bg-green-800/30"
                  >
                    {sector}
                    <i className="fas fa-times text-xs" aria-hidden="true"></i>
                  </button>
                ))}
                
                {selectedStage && (
                  <button
                    onClick={() => removeFilter('stage')}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 text-sm rounded-full hover:bg-purple-200 dark:hover:bg-purple-800/30"
                  >
                    Stage: {selectedStage}
                    <i className="fas fa-times text-xs" aria-hidden="true"></i>
                  </button>
                )}
                
                {selectedEligibility && (
                  <button
                    onClick={() => removeFilter('eligibility')}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 text-sm rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800/30"
                  >
                    {selectedEligibility}
                    <i className="fas fa-times text-xs" aria-hidden="true"></i>
                  </button>
                )}
                
                {minCheque && (
                  <button
                    onClick={() => removeFilter('minCheque')}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400 text-sm rounded-full hover:bg-orange-200 dark:hover:bg-orange-800/30"
                  >
                    Min: {minCheque}
                    <i className="fas fa-times text-xs" aria-hidden="true"></i>
                  </button>
                )}
                
                {closingWindow && (
                  <button
                    onClick={() => removeFilter('closingWindow')}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 text-sm rounded-full hover:bg-red-200 dark:hover:bg-red-800/30"
                  >
                    Closing: {closingWindow}
                    <i className="fas fa-times text-xs" aria-hidden="true"></i>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8 lg:sticky lg:top-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-[var(--primary)] text-white text-xs rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </h2>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  Clear All
                </Button>
              )}
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
              {filteredAndSortedSyndicates.length} syndicate{filteredAndSortedSyndicates.length !== 1 ? 's' : ''} found
              {sortBy !== 'relevance' && (
                <span className="ml-2 text-sm">
                  • Sorted by {SORT_OPTIONS.find(opt => opt.value === sortBy)?.label}
                </span>
              )}
            </p>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Syndicates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAndSortedSyndicates.map(syndicate => (
                  <SyndicateCard 
                    key={syndicate.id} 
                    syndicate={syndicate} 
                    searchTerm={debouncedSearchTerm}
                  />
                ))}
              </div>

              {filteredAndSortedSyndicates.length === 0 && (
                <div className="text-center py-12">
                  <i className="fas fa-search text-4xl text-gray-400 mb-4" aria-hidden="true"></i>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No syndicates match
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Try removing filters or widening stage selection
                  </p>
                  <Button onClick={clearAllFilters}>
                    Reset Filters
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}