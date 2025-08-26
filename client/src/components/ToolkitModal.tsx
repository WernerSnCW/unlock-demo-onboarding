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
  const [selectedPropertyData, setSelectedPropertyData] = useState<any>(null);
  const [valuationMethod, setValuationMethod] = useState('comparable');
  const [marketConditions, setMarketConditions] = useState('current');
  const [isGeneratingValuation, setIsGeneratingValuation] = useState(false);
  const [valuationResult, setValuationResult] = useState<any>(null);

  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ['/api/properties', selectedInvestor?.userId],
    enabled: !!selectedInvestor?.userId,
  });

  const handlePropertySearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Search real property data from our UK property database
      const response = await fetch('/api/property-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: searchQuery.trim().toUpperCase(),
          limit: 10
        }),
      });
      
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
      } else {
        console.error('Property search failed');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Property search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleGenerateValuation = async () => {
    // Allow valuation even without a specific property selected if we have a search query (postcode)
    if (!selectedProperty && !searchQuery.trim()) return;

    setIsGeneratingValuation(true);
    try {
      // Find the selected property details
      let propertyDetails = null;
      
      if (selectedProperty) {
        if (searchMode === 'saved') {
          propertyDetails = properties.find((p: any) => p.id === selectedProperty);
        } else {
          propertyDetails = selectedPropertyData;
        }
      }

      // Prepare comprehensive valuation request
      const valuationRequest = {
        postcode: propertyDetails?.postcode || searchQuery.trim().toUpperCase(),
        propertyType: propertyDetails?.type || propertyDetails?.propertyType || 'Flat',
        paon: propertyDetails?.paon,
        saon: propertyDetails?.saon,
        street: propertyDetails?.street,
        purchasePrice: propertyDetails?.purchasePrice,
        purchaseDate: propertyDetails?.purchaseDate,
        bedrooms: propertyDetails?.bedrooms,
        propertyId: propertyDetails?.id
      };

      const response = await fetch('/api/property-valuation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(valuationRequest),
      });
      
      if (response.ok) {
        const result = await response.json();
        setValuationResult(result);
      } else {
        const errorData = await response.json();
        console.error('Valuation failed:', errorData.message);
        setValuationResult(null);
      }
    } catch (error) {
      console.error('Valuation generation failed:', error);
      setValuationResult(null);
    } finally {
      setIsGeneratingValuation(false);
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
              onClick={() => {
                setSearchMode('saved');
                setSearchQuery('');
                setSearchResults([]);
                setSelectedProperty('');
                setSelectedPropertyData(null);
              }}
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
              onClick={() => {
                setSearchMode('search');
                setSelectedProperty('');
                setSelectedPropertyData(null);
              }}
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
                      onClick={() => {
                        setSelectedProperty(property.id);
                        setSelectedPropertyData(property);
                      }}
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
                        setSelectedPropertyData(property);
                        setSearchResults([]);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900 dark:text-gray-100">{property.address}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {property.type} • {property.postcode} • £{property.price?.toLocaleString()} ({property.date})
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedPropertyData && searchMode === 'search' && (
                <div className="p-4 border border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-green-900 dark:text-green-100 mb-1">
                        Selected: {selectedPropertyData.address}
                      </div>
                      <div className="text-sm text-green-700 dark:text-green-300">
                        {selectedPropertyData.type} • {selectedPropertyData.postcode} • £{selectedPropertyData.price?.toLocaleString()} ({selectedPropertyData.date})
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProperty('');
                        setSelectedPropertyData(null);
                      }}
                      className="ml-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              )}

              {searchQuery && searchResults.length === 0 && !isSearching && !selectedPropertyData && (
                <div className="p-4 border border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    <div className="font-medium mb-1">No specific properties found for "{searchQuery}"</div>
                    <div className="text-yellow-700 dark:text-yellow-300">
                      Don't worry! We'll use the postcode area data to provide an accurate valuation based on comparable sales in the {searchQuery.toUpperCase()} area.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Valuation Method
          </label>
          <select 
            value={valuationMethod}
            onChange={(e) => setValuationMethod(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="comparable">Comparable sales analysis</option>
            <option value="rental">Rental yield analysis</option>
            <option value="cost">Replacement cost method</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Market Conditions
          </label>
          <select 
            value={marketConditions}
            onChange={(e) => setMarketConditions(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="current">Current market</option>
            <option value="rising">Rising market</option>
            <option value="declining">Declining market</option>
          </select>
        </div>
        
        <div className="pt-4">
          <button
            type="button"
            onClick={handleGenerateValuation}
            disabled={(!selectedProperty && !searchQuery.trim()) || isGeneratingValuation}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isGeneratingValuation ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Generating Valuation...
              </>
            ) : (
              <>
                <i className="fas fa-calculator"></i>
                Generate Valuation Report
              </>
            )}
          </button>
        </div>
      </form>
      
      {valuationResult && (
        <div className="mt-6 space-y-4">
          {/* Valuation Summary */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
              <i className="fas fa-home"></i>
              Property Valuation Report
              <span className={`ml-auto px-2 py-1 text-xs rounded-full ${
                valuationResult.method === 'HPI_PLUS_COMPS' 
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                  : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
              }`}>
                {valuationResult.method === 'HPI_PLUS_COMPS' ? 'WITH COMPARABLES' : 'HPI BASELINE'}
              </span>
            </h4>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                £{valuationResult.estimate.toLocaleString()}
              </div>
              <div className="text-lg text-gray-600 dark:text-gray-300">
                Range: £{valuationResult.range.min.toLocaleString()} - £{valuationResult.range.max.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Explainability */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h5 className="font-medium text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
              <i className="fas fa-calculator"></i>
              Valuation Methodology
            </h5>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Method:</span>
                <span className="font-medium">{valuationResult.explainability.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">HPI Baseline:</span>
                <span className="font-medium">£{valuationResult.explainability.hpiBaseline.toLocaleString()}</span>
              </div>
              {valuationResult.explainability.purchasePrice && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Original Purchase:</span>
                    <span className="font-medium">£{parseFloat(valuationResult.explainability.purchasePrice).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">HPI Uplift Factor:</span>
                    <span className="font-medium">{valuationResult.explainability.hpiUpliftFactor.toFixed(2)}x</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Comparables Found:</span>
                <span className="font-medium">{valuationResult.explainability.comparablesFound}</span>
              </div>
              {valuationResult.explainability.comparableAverage && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Comparable Average:</span>
                  <span className="font-medium">£{valuationResult.explainability.comparableAverage.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Comparable Sales */}
          {valuationResult.comps && valuationResult.comps.length > 0 && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h5 className="font-medium text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                <i className="fas fa-chart-bar"></i>
                Recent Comparable Sales ({valuationResult.comps.length})
              </h5>
              <div className="space-y-3">
                {valuationResult.comps.map((comp, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded border">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {comp.address || comp.postcode}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {comp.propertyType} • {comp.tenure} • {comp.date}
                        {comp.newBuild && <span className="ml-2 px-1 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">New Build</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">£{comp.price.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HPI Market Data */}
          {valuationResult.hpiData && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h5 className="font-medium text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                <i className="fas fa-chart-line"></i>
                Market Analysis ({valuationResult.hpiData.regionName})
              </h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Regional Average:</span>
                  <div className="font-semibold text-lg">£{valuationResult.hpiData.averagePrice.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Monthly Change:</span>
                  <div className={`font-semibold ${valuationResult.hpiData.monthlyChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {valuationResult.hpiData.monthlyChange >= 0 ? '+' : ''}{valuationResult.hpiData.monthlyChange}%
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Annual Change:</span>
                  <div className={`font-semibold ${valuationResult.hpiData.yearlyChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {valuationResult.hpiData.yearlyChange >= 0 ? '+' : ''}{valuationResult.hpiData.yearlyChange}%
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Data Date:</span>
                  <div className="font-semibold">{new Date(valuationResult.hpiData.date).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                UK House Price Index • Official HM Land Registry Data
              </div>
            </div>
          )}

          {/* Methodology Note */}
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm">
            <p className="text-yellow-800 dark:text-yellow-200">
              <i className="fas fa-info-circle mr-2"></i>
              {valuationResult.method === 'HPI_PLUS_COMPS' 
                ? 'This valuation combines recent comparable sales (70%) with HPI baseline trends (30%) for enhanced accuracy.'
                : 'This valuation uses HPI baseline calculation. Adding recent sale data to your property profile will improve accuracy.'}
            </p>
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