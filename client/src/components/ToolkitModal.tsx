import { useState } from 'react';
import SimpleAllowanceCalculator from './SimpleAllowanceCalculator';
import PitchDeckAnalyser from './PitchDeckAnalyser';

function PropertyValuationComponent() {
  const [searchMode, setSearchMode] = useState<'saved' | 'search'>('saved');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState('');

  const handlePropertySearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Simulate property search - in real app this would call your property search API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock search results
      const mockResults = [
        { id: 'search1', address: `${searchQuery}, Manchester`, postcode: 'M1 1AA', type: 'Flat', bedrooms: 2 },
        { id: 'search2', address: `${searchQuery} Apartments, Manchester`, postcode: 'M1 1AB', type: 'Flat', bedrooms: 1 },
        { id: 'search3', address: `${searchQuery} House, Manchester`, postcode: 'M1 1AC', type: 'House', bedrooms: 3 }
      ];
      
      setSearchResults(mockResults);
    } catch (error) {
      console.error('Property search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-home text-2xl text-blue-600 dark:text-blue-400" aria-hidden="true"></i>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Property Valuation</h3>
        <p className="text-gray-600 dark:text-gray-300">Professional real estate valuation using comparable sales and market data.</p>
      </div>
      
      <form className="space-y-4">
        {/* Property Selection Mode Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Select Property *
          </label>
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden mb-3">
            <button
              type="button"
              onClick={() => setSearchMode('saved')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                searchMode === 'saved'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <i className="fas fa-bookmark mr-2"></i>
              My Properties
            </button>
            <button
              type="button"
              onClick={() => setSearchMode('search')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                searchMode === 'search'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <i className="fas fa-search mr-2"></i>
              Search Property
            </button>
          </div>

          {searchMode === 'saved' ? (
            <select 
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="">Choose from your saved properties...</option>
              <option value="property1">456 Test Avenue, Manchester M1 1AA</option>
              <option value="property2">199 Galvanis Street, 1953 Lee Towers, London 3029 AD</option>
            </select>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter address or postcode (e.g., '123 Main Street' or 'SW1A 1AA')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handlePropertySearch())}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <button
                  type="button"
                  onClick={handlePropertySearch}
                  disabled={!searchQuery.trim() || isSearching}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {isSearching ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Searching...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-search"></i>
                      Search
                    </>
                  )}
                </button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg max-h-40 overflow-y-auto">
                  {searchResults.map((property) => (
                    <button
                      key={property.id}
                      type="button"
                      onClick={() => {
                        setSelectedProperty(property.id);
                        setSearchResults([]);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900 dark:text-gray-100">{property.address}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {property.type} • {property.bedrooms} bed • {property.postcode}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchQuery && searchResults.length === 0 && !isSearching && (
                <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                  No properties found. Try a different search term.
                </div>
              )}
            </div>
          )}
        </div>

interface ToolkitModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolType: string;
  title: string;
}

export default function ToolkitModal({ isOpen, onClose, toolType, title }: ToolkitModalProps) {
  if (!isOpen) return null;

  const renderContent = () => {
    switch (toolType) {
      case 'allowance-calculator':
        return <SimpleAllowanceCalculator />;
        
      case 'pitch-deck-analyser':
        return <PitchDeckAnalyser />;
        
      case 'business-snapshot':
        return (
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-search-dollar text-2xl text-green-600 dark:text-green-400" aria-hidden="true"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Business Snapshot Request</h3>
              <p className="text-gray-600 dark:text-gray-300">Request a quick due diligence report on any business opportunity.</p>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., TechStart Ltd"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Industry Sector
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                  <option value="">Select sector...</option>
                  <option value="fintech">FinTech</option>
                  <option value="healthtech">HealthTech</option>
                  <option value="ai">AI/ML</option>
                  <option value="saas">SaaS</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Funding Stage
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                  <option value="">Select stage...</option>
                  <option value="pre-seed">Pre-Seed</option>
                  <option value="seed">Seed</option>
                  <option value="series-a">Series A</option>
                  <option value="series-b">Series B+</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Additional Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Any specific areas of focus or concerns..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                ></textarea>
              </div>
              
              <button 
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                disabled
              >
                <i className="fas fa-paper-plane mr-2" aria-hidden="true"></i>
                Request Snapshot (Coming Soon)
              </button>
            </form>
          </div>
        );
        
      case 'document-checklist':
        return (
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-tasks text-2xl text-purple-600 dark:text-purple-400" aria-hidden="true"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Due Diligence Checklist</h3>
              <p className="text-gray-600 dark:text-gray-300">Essential documents to request during your investment process.</p>
            </div>
            
            <div className="space-y-4">
              {[
                { category: "Financial Documents", items: ["Last 3 years of accounts", "Management accounts (latest)", "Cash flow projections", "Cap table"] },
                { category: "Legal & Compliance", items: ["Certificate of incorporation", "Articles of association", "Share agreements", "IP registrations"] },
                { category: "Business Information", items: ["Business plan", "Market analysis", "Competitor overview", "Team CVs"] },
                { category: "EIS/SEIS Specific", items: ["Advance assurance letter", "Compliance statement", "Risk-to-capital confirmation"] }
              ].map((section, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3">{section.category}</h4>
                  <div className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <label key={itemIndex} className="flex items-center">
                        <input type="checkbox" className="mr-3 text-blue-600" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'property-valuation':
        return <PropertyValuationComponent />;
        
      default:
        return (
          <div className="p-6 text-center">
            <i className="fas fa-cog text-4xl text-gray-400 mb-4" aria-hidden="true"></i>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Tool Not Available</h3>
            <p className="text-gray-600 dark:text-gray-300">This tool is currently under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <i className="fas fa-times text-xl" aria-hidden="true"></i>
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-80px)] overflow-y-auto">
          {renderContent()}
        </div>
        
      </div>
    </div>
  );
}