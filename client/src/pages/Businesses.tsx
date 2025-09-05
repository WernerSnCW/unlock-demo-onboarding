import { useState, useMemo, useEffect } from 'react';
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
  eligibility: {
    EIS: boolean;
    SEIS: boolean;
  };
  showFavoritesOnly: boolean;
}

export default function Businesses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [filters, setFilters] = useState<FilterState>({
    sectors: [],
    sizes: [],
    eligibility: { EIS: false, SEIS: false },
    showFavoritesOnly: false
  });
  const [likedBusinesses, setLikedBusinesses] = useState<Set<string>>(new Set());
  const [favoritedBusinesses, setFavoritedBusinesses] = useState<Set<string>>(new Set());

  // Load favorites and likes from localStorage on mount
  useEffect(() => {
    const savedLikes = localStorage.getItem('businessLikes');
    const savedFavorites = localStorage.getItem('businessFavorites');
    
    if (savedLikes) {
      setLikedBusinesses(new Set(JSON.parse(savedLikes)));
    }
    if (savedFavorites) {
      setFavoritedBusinesses(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  // Save to localStorage when likes or favorites change
  useEffect(() => {
    localStorage.setItem('businessLikes', JSON.stringify(Array.from(likedBusinesses)));
  }, [likedBusinesses]);

  useEffect(() => {
    localStorage.setItem('businessFavorites', JSON.stringify(Array.from(favoritedBusinesses)));
  }, [favoritedBusinesses]);

  const toggleLike = (businessId: string) => {
    setLikedBusinesses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(businessId)) {
        newSet.delete(businessId);
      } else {
        newSet.add(businessId);
      }
      return newSet;
    });
  };

  const toggleFavorite = (businessId: string) => {
    setFavoritedBusinesses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(businessId)) {
        newSet.delete(businessId);
      } else {
        newSet.add(businessId);
      }
      return newSet;
    });
  };

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


      // Eligibility filter
      if (filters.eligibility.EIS && !business.eligibility.EIS) {
        return false;
      }
      if (filters.eligibility.SEIS && !business.eligibility.SEIS) {
        return false;
      }

      // Favorites filter
      if (filters.showFavoritesOnly && !favoritedBusinesses.has(business.id)) {
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
          return b.community.questions.length - a.community.questions.length;
        case 'liked':
          // Liked first, then by peer interest
          const aLiked = likedBusinesses.has(a.id) ? 1 : 0;
          const bLiked = likedBusinesses.has(b.id) ? 1 : 0;
          if (aLiked !== bLiked) return bLiked - aLiked;
          return b.community.interest.interestPct - a.community.interest.interestPct;
        case 'relevance':
        default:
          // Relevance: verified first, then by peer interest
          if (a.verified !== b.verified) return b.verified ? 1 : -1;
          return b.community.interest.interestPct - a.community.interest.interestPct;
      }
    });

    return filtered;
  }, [businessesData, searchTerm, sortBy, filters, favoritedBusinesses, likedBusinesses]);

  const hasActiveFilters = filters.sectors.length > 0 || 
                          filters.sizes.length > 0 || 
                          filters.eligibility.EIS || 
                          filters.eligibility.SEIS ||
                          filters.showFavoritesOnly;

  const clearAllFilters = () => {
    setFilters({
      sectors: [],
      sizes: [],
      eligibility: { EIS: false, SEIS: false },
      showFavoritesOnly: false
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
                      <SelectValue placeholder="Select sort order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="liked">Liked First</SelectItem>
                      <SelectItem value="most-discussed">Most Discussed</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
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
                favoritesCount={favoritedBusinesses.size}
              />
            </div>

            {/* Results */}
            <div className="flex-1">
              {/* Active Filters Chips */}
              {hasActiveFilters && (
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active filters:</span>
                    {filters.sectors.map((sector) => (
                      <span
                        key={sector}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-[#5193B3] text-white text-xs rounded-md cursor-pointer hover:bg-[#4082a2]"
                        onClick={() => setFilters(prev => ({ ...prev, sectors: prev.sectors.filter(s => s !== sector) }))}
                      >
                        {sector}
                        <i className="fas fa-times" aria-hidden="true"></i>
                      </span>
                    ))}
                    {filters.sizes.map((size) => (
                      <span
                        key={size}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-[#62C4C3] text-white text-xs rounded-md cursor-pointer hover:bg-[#51b3b2]"
                        onClick={() => setFilters(prev => ({ ...prev, sizes: prev.sizes.filter(s => s !== size) }))}
                      >
                        {size}
                        <i className="fas fa-times" aria-hidden="true"></i>
                      </span>
                    ))}
                    {(filters.eligibility.EIS || filters.eligibility.SEIS) && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500 text-white text-xs rounded-md cursor-pointer hover:bg-purple-600"
                        onClick={() => setFilters(prev => ({ ...prev, eligibility: { EIS: false, SEIS: false } }))}
                      >
                        Tax Relief
                        <i className="fas fa-times" aria-hidden="true"></i>
                      </span>
                    )}
                    {filters.showFavoritesOnly && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-xs rounded-md cursor-pointer hover:bg-red-600"
                        onClick={() => setFilters(prev => ({ ...prev, showFavoritesOnly: false }))}
                      >
                        <i className="fas fa-heart" aria-hidden="true"></i>
                        Favorites Only
                        <i className="fas fa-times" aria-hidden="true"></i>
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xs"
                    >
                      Clear all
                    </Button>
                  </div>
                </div>
              )}

              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {filteredAndSortedBusinesses.length} companies found
                  </span>
                </div>
              </div>

              {/* Spotlight Section for High-Interest Companies */}
              {filteredAndSortedBusinesses.some(b => b.community.interest.interestPct >= 70) && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <i className="fas fa-fire text-orange-500" aria-hidden="true"></i>
                    Spotlight Companies
                  </h3>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                    {filteredAndSortedBusinesses
                      .filter(b => b.community.interest.interestPct >= 70)
                      .slice(0, 2)
                      .map((business) => (
                        <div key={`spotlight-${business.id}`} className="transform scale-105">
                          <BusinessCard 
                            business={business as any}
                            isLiked={likedBusinesses.has(business.id)}
                            isFavorited={favoritedBusinesses.has(business.id)}
                            onToggleLike={() => toggleLike(business.id)}
                            onToggleFavorite={() => toggleFavorite(business.id)}
                          />
                        </div>
                      ))}
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      All Companies
                    </h3>
                  </div>
                </div>
              )}

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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {filteredAndSortedBusinesses.map((business) => (
                    <BusinessCard 
                      key={business.id} 
                      business={business as any}
                      isLiked={likedBusinesses.has(business.id)}
                      isFavorited={favoritedBusinesses.has(business.id)}
                      onToggleLike={() => toggleLike(business.id)}
                      onToggleFavorite={() => toggleFavorite(business.id)}
                    />
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