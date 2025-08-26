import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useInvestor } from '../contexts/InvestorContext';
import SimpleAllowanceCalculator from './SimpleAllowanceCalculator';
import PitchDeckAnalyser from './PitchDeckAnalyser';

function PropertyValuationComponent() {
  const { selectedInvestor } = useInvestor();
  const [searchMode, setSearchMode] = useState<'saved' | 'search'>('saved');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState('');

  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ['/api/properties', selectedInvestor?.userId],
    enabled: !!selectedInvestor?.userId,
  });

  const handlePropertySearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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

  if (propertiesLoading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

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
            <div className="space-y-3">
              {Array.isArray(properties) && properties.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {properties.map((property: any) => (
                    <button
                      key={property.id}
                      type="button"
                      onClick={() => setSelectedProperty(property.id)}
                      className={`p-4 border rounded-lg text-left transition-all hover:shadow-md ${
                        selectedProperty === property.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                            {property.addressLine1}
                            {property.addressLine2 && `, ${property.addressLine2}`}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {property.city} {property.postcode}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <i className="fas fa-home"></i>
                              {property.type || 'Property'}
                            </span>
                            {property.bedrooms && (
                              <span className="flex items-center gap-1">
                                <i className="fas fa-bed"></i>
                                {property.bedrooms} bed
                              </span>
                            )}
                            {property.epcRating && (
                              <span className="flex items-center gap-1">
                                <i className="fas fa-leaf"></i>
                                EPC {property.epcRating}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            selectedProperty === property.id
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {selectedProperty === property.id && (
                              <i className="fas fa-check text-white text-xs leading-none"></i>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <i className="fas fa-home text-2xl text-gray-400"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Properties Found</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {selectedInvestor ? 'No properties are associated with this investor.' : 'Please select an investor first.'}
                  </p>
                  <button 
                    type="button"
                    onClick={() => setSearchMode('search')}
                    className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
                  >
                    Search for a property →
                  </button>
                </div>
              )}
            </div>
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
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Valuation Method
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            <option value="comparable">Comparable sales analysis</option>
            <option value="rental">Rental yield analysis</option>
            <option value="cost">Replacement cost method</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Market Conditions
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            <option value="current">Current market</option>
            <option value="rising">Rising market</option>
            <option value="declining">Declining market</option>
          </select>
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={!selectedProperty}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Generate Valuation Report
          </button>
        </div>
      </form>
      
      {selectedProperty && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3">Live Market Data Preview</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Estimated Value:</span>
              <div className="font-semibold text-lg text-blue-600 dark:text-blue-400">£285,000 - £315,000</div>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Comparable Sales:</span>
              <div className="font-semibold text-green-600 dark:text-green-400">12 properties found</div>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Price per sq ft:</span>
              <div className="font-semibold">£425/sq ft</div>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Market trend:</span>
              <div className="font-semibold text-orange-600 dark:text-orange-400">+2.1% (3 months)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
                  Additional Information
                </label>
                <textarea
                  placeholder="Any specific areas of focus or concerns..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                ></textarea>
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Request Snapshot Report
                </button>
              </div>
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