import { useState, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BusinessCard from '../components/BusinessCard';
import BusinessFilters from '../components/BusinessFilters';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import businessesData from '../mocks/businesses.json';

interface FilterState {
  sectors: string[];
  sizes: string[];
  risk: string;
  eligibility: {
    EIS: boolean;
    SEIS: boolean;
  };
}

export default function Businesses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [filters, setFilters] = useState<FilterState>({
    sectors: [],
    sizes: [],
    risk: 'Any',
    eligibility: { EIS: false, SEIS: false }
  });

  const filteredAndSortedBusinesses = useMemo(() => {
    let filtered = businessesData.filter(business => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesName = business.name.toLowerCase().includes(searchLower);
        const matchesNumber = business.ch_number.includes(searchTerm);
        if (!matchesName && !matchesNumber) return false;
      }

      // Sector filter
      if (filters.sectors.length > 0 && !filters.sectors.includes(business.sector)) {
        return false;
      }

      // Size filter - convert business size to match filter format
      if (filters.sizes.length > 0) {
        const sizeMapping: Record<string, string> = {
          'Micro': 'Micro (1-9)',
          'Small': 'Small (10-49)',
          'Medium': 'Medium (50-249)',
          'Large': 'Large (250+)'
        };
        const businessSizeFormatted = sizeMapping[business.size] || business.size;
        if (!filters.sizes.includes(businessSizeFormatted)) {
          return false;
        }
      }

      // Risk filter
      if (filters.risk !== 'Any' && business.risk !== filters.risk) {
        return false;
      }

      // Eligibility filter
      if (filters.eligibility.EIS && !business.eligibility.EIS) {
        return false;
      }
      if (filters.eligibility.SEIS && !business.eligibility.SEIS) {
        return false;
      }

      return true;
    });

    // Sort filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        case 'oldest':
          return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
        case 'most-discussed':
          return b.community.questionsCount - a.community.questionsCount;
        case 'lowest-risk':
          const riskOrder: Record<string, number> = { 'Low': 0, 'Medium': 1, 'High': 2 };
          return (riskOrder[a.risk] || 0) - (riskOrder[b.risk] || 0);
        case 'relevance':
        default:
          // Relevance: verified first, then by peer interest
          if (a.verified !== b.verified) return b.verified ? 1 : -1;
          return b.community.syndicateInterestPct - a.community.syndicateInterestPct;
      }
    });

    return filtered;
  }, [businessesData, searchTerm, sortBy, filters]);

  const hasActiveFilters = filters.sectors.length > 0 || 
                          filters.sizes.length > 0 || 
                          filters.risk !== 'Any' || 
                          filters.eligibility.EIS || 
                          filters.eligibility.SEIS;

  const clearAllFilters = () => {
    setFilters({
      sectors: [],
      sizes: [],
      risk: 'Any',
      eligibility: { EIS: false, SEIS: false }
    });
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Business Directory
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Browse verified companies with due diligence snapshots and community insights
            </p>
          </div>

          {/* Search and Sort Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" aria-hidden="true"></i>
                  <Input
                    placeholder="Search by company name or Companies House number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort:</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="most-discussed">Most Discussed</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                      <SelectItem value="lowest-risk">Lowest Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'cards' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('cards')}
                    className="px-3"
                  >
                    <i className="fas fa-th-large" aria-hidden="true"></i>
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="px-3"
                  >
                    <i className="fas fa-list" aria-hidden="true"></i>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filters Panel */}
            <div className="lg:w-80 flex-shrink-0">
              <BusinessFilters 
                filters={filters}
                onFiltersChange={setFilters}
              />
            </div>

            {/* Results */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {filteredAndSortedBusinesses.length} companies found
                  </span>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-[#5193B3] hover:text-[#4082a2] hover:bg-[#5193B3]/10"
                    >
                      Clear all filters
                    </Button>
                  )}
                </div>
              </div>

              {/* Results Grid */}
              {filteredAndSortedBusinesses.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-search text-4xl text-gray-300 dark:text-gray-600 mb-4" aria-hidden="true"></i>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No companies match your filters
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Try adjusting your search terms or filters to find more results
                  </p>
                  {hasActiveFilters && (
                    <Button onClick={clearAllFilters} variant="outline">
                      Clear all filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredAndSortedBusinesses.map((business) => (
                    <BusinessCard key={business.id} business={business as any} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}