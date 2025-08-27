import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useInvestor } from '../contexts/InvestorContext';
import SimpleAllowanceCalculator from './SimpleAllowanceCalculator';
import PitchDeckAnalyser from './PitchDeckAnalyser';
import PropertyCharts from './PropertyCharts';

function PropertyValuationComponent() {
  const { selectedInvestor } = useInvestor();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedPropertyData, setSelectedPropertyData] = useState<any>(null);
  const [isGeneratingValuation, setIsGeneratingValuation] = useState(false);
  const [valuationResult, setValuationResult] = useState<any>(null);

  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ['/api/properties', selectedInvestor?.userId],
    enabled: !!selectedInvestor?.userId,
  });

  // Debounced search effect for incremental search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        handlePropertySearch(searchQuery);
      } else {
        setSearchResults([]);
        setHasSearched(false);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handlePropertySearch = async (query: string = searchQuery) => {
    if (!query.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }
    
    setIsSearching(true);
    setHasSearched(true);
    try {
      // Search real property data from our UK property database
      const response = await fetch('/api/property-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: query.trim().toUpperCase(),
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
        // Use the stored property data, or find it in saved properties
        propertyDetails = selectedPropertyData || properties.find((p: any) => p.id === selectedProperty);
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
        propertyId: propertyDetails?.id,
        valuationMethod: 'comparable',
        marketConditions: 'current'
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
        const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
        console.error('Valuation failed:', errorData.message);
        // Show error to user
        setValuationResult({
          error: true,
          message: errorData.message || 'Valuation failed - no HPI data available for this location',
          postcode: valuationRequest.postcode
        });
      }
    } catch (error) {
      console.error('Valuation generation failed:', error);
      setValuationResult({
        error: true,
        message: 'Unable to connect to valuation service',
        postcode: valuationRequest.postcode
      });
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
        <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-home text-2xl text-[var(--primary)]" aria-hidden="true"></i>
        </div>
        <h3 className="text-xl font-semibold text-[var(--card-foreground)] mb-2">Property Valuation</h3>
        <p className="text-[var(--muted-foreground)]">Professional real estate valuation using comparable sales and market data.</p>
      </div>
      
      <form className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[var(--card-foreground)] mb-3">
            Select Property *
          </label>
          
          {/* Property Search */}
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search by address or postcode (e.g., '123 Main Street' or 'SW1A 1AA')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 border border-[var(--border)] rounded-[var(--radius-sm)] bg-[var(--input)] text-[var(--card-foreground)] focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--primary)]"
              />
              {isSearching && (
                <div className="px-4 py-2 text-[var(--muted-foreground)] flex items-center gap-2">
                  <i className="fas fa-spinner fa-spin"></i>
                  Searching...
                </div>
              )}
            </div>
          </div>

          {/* Property Grid - Combined My Properties and Search Results */}
          <div className="space-y-4">
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-[var(--card-foreground)] mb-2">Search Results</h4>
                <div className="grid grid-cols-2 gap-3">
                  {searchResults.map((property, index) => (
                    <button
                      key={`${property.id}-${index}`}
                      type="button"
                      onClick={() => {
                        setSelectedProperty(property.id);
                        setSelectedPropertyData(property);
                        setSearchResults([]);
                      }}
                      className={`p-3 border rounded-[var(--radius-sm)] text-left transition-all hover:shadow-[var(--shadow-sm)] hover:-translate-y-0.5 ${
                        selectedProperty === property.id
                          ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                          : 'border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)]'
                      }`}
                    >
                      <div className="font-medium text-[var(--card-foreground)] text-sm mb-1 truncate">
                        {property.address}
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {property.type} • {property.postcode}
                      </div>
                      <div className="text-xs text-[var(--success)] mt-1">
                        £{property.price?.toLocaleString()} ({property.date})
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Property Display */}
            {selectedPropertyData && (
              <div className="p-3 border border-[var(--success)] bg-[var(--success)]/10 rounded-[var(--radius-sm)]">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-[var(--card-foreground)] text-sm mb-1">
                      ✓ Selected: {selectedPropertyData.address || selectedPropertyData.addressLine1}
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)]">
                      {selectedPropertyData.type} • {selectedPropertyData.postcode}
                      {selectedPropertyData.price && ` • £${selectedPropertyData.price.toLocaleString()}`}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProperty('');
                      setSelectedPropertyData(null);
                    }}
                    className="ml-2 text-[var(--muted-foreground)] hover:text-[var(--card-foreground)] transition-colors"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            )}

            {/* My Properties */}
            {Array.isArray(properties) && properties.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-[var(--card-foreground)] mb-2">My Properties</h4>
                <div className="grid grid-cols-2 gap-3">
                  {properties.map((property: any) => (
                    <button
                      key={property.id}
                      type="button"
                      onClick={() => {
                        setSelectedProperty(property.id);
                        setSelectedPropertyData(property);
                      }}
                      className={`p-3 border rounded-[var(--radius-sm)] text-left transition-all hover:shadow-[var(--shadow-sm)] hover:-translate-y-0.5 ${
                        selectedProperty === property.id
                          ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                          : 'border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)]'
                      }`}
                    >
                      <div className="font-medium text-[var(--card-foreground)] text-sm mb-1 truncate">
                        {property.addressLine1}
                        {property.addressLine2 && `, ${property.addressLine2}`}
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {property.city} {property.postcode}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] mt-1">
                        <span>{property.type || 'Property'}</span>
                        {property.bedrooms && <span>• {property.bedrooms} bed</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No Properties State */}
            {!Array.isArray(properties) || (properties.length === 0 && searchResults.length === 0 && !selectedPropertyData) && (
              <div className="text-center py-6 text-[var(--muted-foreground)]">
                <i className="fas fa-home text-2xl mb-2"></i>
                <p className="text-sm">
                  {selectedInvestor ? 'No saved properties. Use search above to find properties.' : 'Please select an investor first.'}
                </p>
              </div>
            )}

            {/* Search Fallback Message - only show after search has completed */}
            {hasSearched && searchQuery && searchResults.length === 0 && !isSearching && !selectedPropertyData && (
              <div className="p-3 border border-[var(--warning)] bg-[var(--warning)]/10 rounded-[var(--radius-sm)]">
                <div className="text-sm text-[var(--warning-foreground)]">
                  <div className="font-medium mb-1">No specific properties found for "{searchQuery}"</div>
                  <div className="text-[var(--warning-foreground)]/80">
                    We'll use postcode area data for an accurate valuation based on comparable sales in the {searchQuery.toUpperCase()} area.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="pt-6">
          <button
            type="button"
            onClick={handleGenerateValuation}
            disabled={(!selectedProperty && !searchQuery.trim()) || isGeneratingValuation}
            className="w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed text-[var(--primary-foreground)] font-medium py-2 px-4 rounded-[var(--radius-sm)] transition-colors flex items-center justify-center gap-2"
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
          {/* Error Display */}
          {valuationResult.error && (
            <div className="p-4 bg-[var(--destructive)]/10 rounded-[var(--radius-sm)] border border-[var(--destructive)]/30">
              <h4 className="font-semibold text-[var(--destructive)] mb-2 flex items-center gap-2">
                <i className="fas fa-exclamation-triangle"></i>
                Valuation Not Available
              </h4>
              <p className="text-sm text-[var(--destructive)]/80 mb-2">
                {valuationResult.message}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                Postcode: {valuationResult.postcode} • Try a different location or check back later
              </p>
            </div>
          )}
          
          {/* Enhanced Valuation Report */}
          {!valuationResult.error && (
            <>
          {/* Header Summary */}
          <div className="p-4 bg-[var(--card)] rounded-[var(--radius-sm)] border border-[var(--border)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-[var(--card-foreground)] flex items-center gap-2">
                <i className="fas fa-home"></i>
                Property Valuation Report
              </h4>
              <div className="flex gap-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  valuationResult.valuation?.method === 'HPI_PLUS_COMPS' 
                    ? 'bg-[var(--primary)]/20 text-[var(--primary)]'
                    : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                }`}>
                  {valuationResult.metadata?.methodBadge || (valuationResult.method === 'HPI_PLUS_COMPS' ? 'HPI + Comparables' : 'HPI Only')}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  (valuationResult.valuation?.confidence || 'Low') === 'High' 
                    ? 'bg-[var(--success)]/20 text-[var(--success)]'
                    : (valuationResult.valuation?.confidence || 'Low') === 'Medium'
                    ? 'bg-[var(--warning)]/20 text-[var(--warning)]'
                    : 'bg-[var(--destructive)]/20 text-[var(--destructive)]'
                }`}>
                  {valuationResult.valuation?.confidence || 'Low'} Confidence
                </span>
              </div>
            </div>
            <div className="text-sm text-[var(--muted-foreground)]">
              {valuationResult.metadata?.address || 'Property'} • {valuationResult.metadata?.propertyType || 'Unknown Type'} • {new Date(valuationResult.metadata?.timestamp || Date.now()).toLocaleDateString()}
            </div>
          </div>

          {/* Valuation Hero */}
          <div className="p-6 bg-[var(--primary)]/10 rounded-[var(--radius-sm)] border border-[var(--primary)]/30 text-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="text-3xl font-bold text-[var(--primary)] mb-2">
              £{(valuationResult.valuation?.estimate || valuationResult.estimate)?.toLocaleString()}
            </div>
            <div className="text-lg text-[var(--muted-foreground)] mb-2">
              £{(valuationResult.valuation?.range?.min || valuationResult.range?.min)?.toLocaleString()} - £{(valuationResult.valuation?.range?.max || valuationResult.range?.max)?.toLocaleString()}
            </div>
            <div className="text-sm text-[var(--muted-foreground)]">
              YoY market change: {valuationResult.trend?.yoyChange >= 0 ? '+' : ''}{valuationResult.trend?.yoyChange?.toFixed(1) || 'N/A'}%
            </div>
          </div>

          {/* Purchase Comparison - PROMINENT SECTION */}
          {valuationResult.purchase && (
            <div className="p-6 bg-gradient-to-r from-[var(--primary)]/5 to-[var(--secondary)]/5 rounded-[var(--radius-sm)] border-2 border-[var(--primary)]/40" style={{ boxShadow: 'var(--shadow-md)' }}>
              <div className="text-center mb-4">
                <h5 className="text-xl font-bold text-[var(--primary)] mb-2 flex items-center justify-center gap-2">
                  <i className="fas fa-chart-line"></i>
                  PURCHASE COMPARISON
                </h5>
                <div className="text-sm text-[var(--muted-foreground)]">
                  Compare current value with your original purchase
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-4">
                <div className="text-center p-4 bg-[var(--card)] rounded-[var(--radius-sm)] border border-[var(--border)]">
                  <div className="text-sm text-[var(--muted-foreground)] mb-1">ORIGINAL PURCHASE</div>
                  <div className="text-2xl font-bold text-[var(--card-foreground)]">£{valuationResult.purchase.originalPrice?.toLocaleString()}</div>
                  <div className="text-sm text-[var(--muted-foreground)]">{valuationResult.purchase.purchaseMonth}</div>
                  <div className="text-xs text-[var(--muted-foreground)] mt-1">{valuationResult.purchase.yearsOwned} years ago</div>
                </div>
                <div className="text-center p-4 bg-[var(--card)] rounded-[var(--radius-sm)] border border-[var(--border)]">
                  <div className="text-sm text-[var(--muted-foreground)] mb-1">CURRENT ESTIMATE</div>
                  <div className="text-2xl font-bold text-[var(--primary)]">£{(valuationResult.valuation?.estimate || valuationResult.estimate)?.toLocaleString()}</div>
                  <div className="text-sm text-[var(--muted-foreground)]">Today</div>
                  <div className="text-xs text-[var(--muted-foreground)] mt-1">Latest valuation</div>
                </div>
              </div>
              
              <div className="text-center py-4 bg-[var(--primary)]/10 rounded-[var(--radius-sm)] border border-[var(--primary)]/30">
                <div className="text-2xl font-bold text-[var(--primary)] mb-1">
                  {valuationResult.purchase.changeSincePurchase >= 0 ? '↑' : '↓'} £{Math.abs(valuationResult.purchase.changeSincePurchase)?.toLocaleString()} 
                  ({(valuationResult.purchase.changePercent || ((valuationResult.purchase.changeSincePurchase / valuationResult.purchase.originalPrice) * 100)).toFixed(1)}%)
                </div>
                <div className="text-sm text-[var(--muted-foreground)]">
                  <strong>Total {valuationResult.purchase.changeSincePurchase >= 0 ? 'Gain' : 'Loss'}</strong> • {(((valuationResult.purchase.changePercent || 0) / valuationResult.purchase.yearsOwned).toFixed(1))}% annual return
                </div>
              </div>
            </div>
          )}

          {/* Drivers (Why this value?) */}
          <div className="p-4 bg-[var(--card)] rounded-[var(--radius-sm)] border border-[var(--border)]">
            <h5 className="font-medium text-[var(--card-foreground)] mb-3 flex items-center gap-2">
              <i className="fas fa-lightbulb"></i>
              Why this value?
            </h5>
            <ul className="space-y-2">
              {(valuationResult.drivers || []).map((driver, index) => (
                <li key={index} className="text-sm text-[var(--muted-foreground)] flex items-start">
                  <span className="w-2 h-2 bg-[var(--primary)] rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  {driver}
                </li>
              ))}
              {(!valuationResult.drivers || valuationResult.drivers.length === 0) && (
                <li className="text-sm text-[var(--muted-foreground)] flex items-start">
                  <span className="w-2 h-2 bg-[var(--primary)] rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  Valuation based on regional HPI trends and available market data
                </li>
              )}
            </ul>
          </div>

          {/* Comparable Sales */}
          <div className="p-4 bg-[var(--card)] rounded-[var(--radius-sm)] border border-[var(--border)]">
            <h5 className="font-medium text-[var(--card-foreground)] mb-3 flex items-center gap-2">
              <i className="fas fa-chart-bar"></i>
              Comparable Sales
            </h5>
            {(valuationResult.comparables && valuationResult.comparables.length > 0) || (valuationResult.comps && valuationResult.comps.length > 0) ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left py-2 text-[var(--muted-foreground)]">Address</th>
                      <th className="text-left py-2 text-[var(--muted-foreground)]">Date</th>
                      <th className="text-right py-2 text-[var(--muted-foreground)]">Price</th>
                      <th className="text-left py-2 text-[var(--muted-foreground)]">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(valuationResult.comparables || valuationResult.comps || []).slice(0, 5).map((comp, index) => (
                      <tr key={index} className="border-b border-[var(--border)]/50">
                        <td className="py-2 text-[var(--card-foreground)]">{comp.address || comp.postcode}</td>
                        <td className="py-2 text-[var(--muted-foreground)]">{new Date(comp.date).toLocaleDateString()}</td>
                        <td className="py-2 text-right font-medium text-[var(--card-foreground)]">£{comp.price?.toLocaleString()}</td>
                        <td className="py-2 text-[var(--muted-foreground)]">{comp.note || 'nearby'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-[var(--muted-foreground)]">
                <i className="fas fa-info-circle text-2xl mb-2"></i>
                <p>No recent local sales in the demo subset; estimate uses regional HPI growth.</p>
                <p className="text-xs mt-1">Try widening the time window or area.</p>
              </div>
            )}
          </div>



          {/* Market Analysis Charts */}
          <div className="p-4 bg-[var(--card)] rounded-[var(--radius-sm)] border border-[var(--border)]">
            <h5 className="font-medium text-[var(--card-foreground)] mb-3 flex items-center gap-2">
              <i className="fas fa-chart-line"></i>
              Market Analysis & HPI Data
            </h5>
            
            <div className="space-y-4">
              {/* HPI Region Mapping */}
              <div className="bg-[var(--muted)] rounded-[var(--radius-sm)] p-3">
                <div className="text-sm font-medium text-[var(--card-foreground)] mb-1">HPI Region Mapping</div>
                <div className="text-sm text-[var(--muted-foreground)]">
                  {valuationResult.metadata?.postcodeMapped || `${valuationResult.metadata?.postcodeSector} → ${valuationResult.trend?.geography}`}
                </div>
                <div className="text-xs text-[var(--muted-foreground)] mt-1">
                  Area Code: {valuationResult.metadata?.hpiAreaCode} • Data from {valuationResult.metadata?.hpiDataDate ? new Date(valuationResult.metadata.hpiDataDate).toLocaleDateString() : 'Latest available'}
                </div>
              </div>
              
              {/* Interactive Charts */}
              {valuationResult.trend?.data && (
                <PropertyCharts 
                  trendData={valuationResult.trend.data}
                  propertyType={valuationResult.metadata?.propertyType}
                  geography={valuationResult.trend.geography}
                  yoyChange={valuationResult.trend.yoyChange}
                  chartConfidence={valuationResult.trend.chartConfidence}
                  chartConfidenceScore={valuationResult.trend.chartConfidenceScore}
                  valuation={valuationResult.valuation}
                  purchase={valuationResult.purchase}
                />
              )}
            </div>
          </div>

          {/* Notes & Disclaimers */}
          <div className="p-4 bg-[var(--card)] rounded-[var(--radius-sm)] border border-[var(--border)]">
            <h5 className="font-medium text-[var(--card-foreground)] mb-2 text-sm flex items-center gap-2">
              <i className="fas fa-info-circle"></i>
              Notes
            </h5>
            <ul className="space-y-1">
              {(valuationResult.notes || []).map((note, index) => (
                <li key={index} className="text-xs text-[var(--muted-foreground)]">• {note}</li>
              ))}
              {(!valuationResult.notes || valuationResult.notes.length === 0) && (
                <>
                  <li className="text-xs text-[var(--muted-foreground)]">• Valuation based on regional HPI trends and comparable sales data</li>
                  <li className="text-xs text-[var(--muted-foreground)]">• Based on official UK House Price Index from HM Land Registry</li>
                  <li className="text-xs text-[var(--muted-foreground)]">• Comparable sales sourced from Property Price Data (PPD)</li>
                </>
              )}
            </ul>
            <div className="text-xs text-[var(--muted-foreground)]/70 mt-3 italic">
              Indicative estimate for demo; based on UK HPI trends and nearby sales from a limited demo dataset.
            </div>
          </div>

          {/* Methodology Note */}
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm">
            <p className="text-yellow-800 dark:text-yellow-200">
              <i className="fas fa-info-circle mr-2"></i>
              {valuationResult.method === 'HPI_PLUS_COMPS' 
                ? 'This valuation combines recent comparable sales (70%) with HPI baseline trends (30%) for enhanced accuracy.'
                : 'This valuation uses HPI baseline calculation. Adding recent sale data to your property profile will improve accuracy.'}
            </p>
          </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ArtValuationComponent() {
  const [appUrl, setAppUrl] = useState('');
  const [isAppLoaded, setIsAppLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState(false);
  const [configError, setConfigError] = useState(false);

  // Auto-detect Replit URLs
  const isReplitUrl = (url: string) => {
    return url.includes('replit.com') || url.includes('replit.app');
  };

  const getEmbedUrl = (url: string) => {
    if (isReplitUrl(url)) {
      // Add Replit embed parameters
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}embed=true&theme=light`;
    }
    return url;
  };

  // Fetch configured app URL from server
  useEffect(() => {
    const fetchAppConfig = async () => {
      try {
        const response = await fetch('/api/art-valuation-config');
        if (response.ok) {
          const data = await response.json();
          if (data.appUrl) {
            setAppUrl(data.appUrl);
            setConfigError(false);
          } else {
            setConfigError(true);
          }
        } else {
          setConfigError(true);
        }
      } catch (error) {
        console.error('Failed to fetch art valuation config:', error);
        setConfigError(true);
      }
    };

    fetchAppConfig();
  }, []);

  const handleLoadApp = () => {
    if (appUrl) {
      setIsAppLoaded(true);
      setLoadingError(false);
    }
  };

  const handleNavigateToApp = () => {
    if (appUrl) {
      window.open(appUrl, '_blank');
    }
  };

  const handleIframeError = () => {
    setLoadingError(true);
  };

  if (configError) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-exclamation-triangle text-2xl text-red-600 dark:text-red-400" aria-hidden="true"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Configuration Required</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            The art valuation app URL is not configured. Please set the ART_VALUATION_APP_URL environment variable.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-2">To configure:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-700 dark:text-blue-300">
              <li>Go to the Secrets tab in your Replit workspace</li>
              <li>Add a new secret: ART_VALUATION_APP_URL</li>
              <li>Set the value to your art valuation app URL</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  if (!appUrl) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-spinner fa-spin text-2xl text-gray-600 dark:text-gray-400" aria-hidden="true"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Loading Configuration</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Fetching art valuation app configuration...
          </p>
        </div>
      </div>
    );
  }

  if (!isAppLoaded) {
    return (
      <div className="p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-palette text-2xl text-purple-600 dark:text-purple-400" aria-hidden="true"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Art Valuation Tool</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Ready to connect to your configured art valuation app.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
              <i className="fas fa-globe mr-2"></i>
              <span className="font-medium">Configured App:</span>
            </div>
            <div className="text-gray-800 dark:text-gray-200 break-all">
              {appUrl}
            </div>
            {isReplitUrl(appUrl) && (
              <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                <i className="fas fa-check-circle mr-1"></i>
                Replit app detected - will use optimized embedding with ?embed=true
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={handleNavigateToApp}
              className="py-3 px-4 rounded-lg font-medium transition-colors bg-purple-600 hover:bg-purple-700 text-white"
              data-testid="button-navigate-to-app"
            >
              <i className="fas fa-external-link-alt mr-2"></i>
              Open in New Tab
            </button>
            
            <button
              onClick={handleLoadApp}
              className="py-3 px-4 rounded-lg font-medium transition-colors border-2 border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              data-testid="button-try-embed"
            >
              <i className="fas fa-code mr-2"></i>
              Try Embed
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* App Controls */}
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <i className="fas fa-globe mr-2"></i>
          <span className="truncate max-w-md" title={getEmbedUrl(appUrl)}>
            {isReplitUrl(appUrl) ? getEmbedUrl(appUrl) : appUrl}
          </span>
          {isReplitUrl(appUrl) && (
            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              +embed
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.open(appUrl, '_blank')}
            className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
            title="Open in new tab"
            data-testid="button-open-external"
          >
            <i className="fas fa-external-link-alt"></i>
          </button>
          <button
            onClick={() => setIsAppLoaded(false)}
            className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            title="Change app URL"
            data-testid="button-change-url"
          >
            <i className="fas fa-edit"></i>
          </button>
        </div>
      </div>

      {/* Embedded App */}
      <div className="relative h-[calc(80vh-120px)]">
        {loadingError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800 p-6">
            <div className="text-center max-w-md">
              <i className="fas fa-shield-alt text-4xl text-yellow-500 mb-4"></i>
              <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                App Cannot Be Embedded
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                This app has security settings that prevent iframe embedding (X-Frame-Options). 
                Replit apps typically have this restriction enabled by default.
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4 text-left">
                <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Solutions:</h5>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Deploy your app to a custom domain</li>
                  <li>• Use Replit Deployments with iframe support</li>
                  <li>• Host on platforms like Vercel, Netlify, or Heroku</li>
                  <li>• Configure your app to allow iframe embedding</li>
                </ul>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => window.open(appUrl, '_blank')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex-1"
                  data-testid="button-open-new-tab"
                >
                  <i className="fas fa-external-link-alt mr-2"></i>
                  Open in New Tab
                </button>
                <button
                  onClick={() => setIsAppLoaded(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex-1"
                  data-testid="button-try-different-url"
                >
                  Try Different URL
                </button>
              </div>
            </div>
          </div>
        )}
        
        <iframe
          src={getEmbedUrl(appUrl)}
          className="w-full h-full border-0"
          title="Art Valuation App"
          onError={handleIframeError}
          onLoad={() => setLoadingError(false)}
          sandbox="allow-same-origin allow-scripts allow-forms allow-modals allow-popups"
          data-testid="iframe-art-valuation-app"
        />
      </div>
    </div>
  );
}

function WhiskyValuationComponent() {
  const [appUrl, setAppUrl] = useState('');
  const [isAppLoaded, setIsAppLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState(false);
  const [configError, setConfigError] = useState(false);

  // Auto-detect Replit URLs
  const isReplitUrl = (url: string) => {
    return url.includes('replit.com') || url.includes('replit.app');
  };

  const getEmbedUrl = (url: string) => {
    if (isReplitUrl(url)) {
      // Add Replit embed parameters
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}embed=true&theme=light`;
    }
    return url;
  };

  // Fetch configured app URL from server
  useEffect(() => {
    const fetchAppConfig = async () => {
      try {
        const response = await fetch('/api/whisky-valuation-config');
        if (response.ok) {
          const data = await response.json();
          if (data.appUrl) {
            setAppUrl(data.appUrl);
            setConfigError(false);
          } else {
            setConfigError(true);
          }
        } else {
          setConfigError(true);
        }
      } catch (error) {
        console.error('Failed to fetch whisky valuation config:', error);
        setConfigError(true);
      }
    };

    fetchAppConfig();
  }, []);

  const handleLoadApp = () => {
    if (appUrl) {
      setIsAppLoaded(true);
      setLoadingError(false);
    }
  };

  const handleNavigateToApp = () => {
    if (appUrl) {
      window.open(appUrl, '_blank');
    }
  };

  const handleIframeError = () => {
    setLoadingError(true);
  };

  if (configError) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-exclamation-triangle text-2xl text-red-600 dark:text-red-400" aria-hidden="true"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Configuration Required</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            The whisky valuation app URL is not configured. Please set the WHISKY_VALUATION_APP_URL environment variable.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-2">To configure:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-700 dark:text-blue-300">
              <li>Go to the Secrets tab in your Replit workspace</li>
              <li>Add a new secret: WHISKY_VALUATION_APP_URL</li>
              <li>Set the value to your whisky valuation app URL</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  if (!appUrl) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-spinner fa-spin text-2xl text-gray-600 dark:text-gray-400" aria-hidden="true"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Loading Configuration</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Fetching whisky valuation app configuration...
          </p>
        </div>
      </div>
    );
  }

  if (!isAppLoaded) {
    return (
      <div className="p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-glass-whiskey text-2xl text-amber-600 dark:text-amber-400" aria-hidden="true"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Whisky Valuation Tool</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Ready to connect to your configured whisky valuation app.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
              <i className="fas fa-globe mr-2"></i>
              <span className="font-medium">Configured App:</span>
            </div>
            <div className="text-gray-800 dark:text-gray-200 break-all">
              {appUrl}
            </div>
            {isReplitUrl(appUrl) && (
              <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                <i className="fas fa-check-circle mr-1"></i>
                Replit app detected - will use optimized embedding with ?embed=true
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={handleNavigateToApp}
              className="py-3 px-4 rounded-lg font-medium transition-colors bg-amber-600 hover:bg-amber-700 text-white"
              data-testid="button-navigate-to-app"
            >
              <i className="fas fa-external-link-alt mr-2"></i>
              Open in New Tab
            </button>
            
            <button
              onClick={handleLoadApp}
              className="py-3 px-4 rounded-lg font-medium transition-colors border-2 border-amber-600 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
              data-testid="button-try-embed"
            >
              <i className="fas fa-code mr-2"></i>
              Try Embed
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* App Controls */}
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <i className="fas fa-globe mr-2"></i>
          <span className="truncate max-w-md" title={getEmbedUrl(appUrl)}>
            {isReplitUrl(appUrl) ? getEmbedUrl(appUrl) : appUrl}
          </span>
          {isReplitUrl(appUrl) && (
            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              +embed
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.open(appUrl, '_blank')}
            className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
            title="Open in new tab"
            data-testid="button-open-external"
          >
            <i className="fas fa-external-link-alt"></i>
          </button>
          <button
            onClick={() => setIsAppLoaded(false)}
            className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            title="Change app URL"
            data-testid="button-change-url"
          >
            <i className="fas fa-edit"></i>
          </button>
        </div>
      </div>

      {/* Embedded App */}
      <div className="relative h-[calc(80vh-120px)]">
        {loadingError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800 p-6">
            <div className="text-center max-w-md">
              <i className="fas fa-shield-alt text-4xl text-yellow-500 mb-4"></i>
              <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                App Cannot Be Embedded
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                This app has security settings that prevent iframe embedding (X-Frame-Options). 
                Replit apps typically have this restriction enabled by default.
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4 text-left">
                <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Solutions:</h5>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Deploy your app to a custom domain</li>
                  <li>• Use Replit Deployments with iframe support</li>
                  <li>• Host on platforms like Vercel, Netlify, or Heroku</li>
                  <li>• Configure your app to allow iframe embedding</li>
                </ul>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => window.open(appUrl, '_blank')}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex-1"
                  data-testid="button-open-new-tab"
                >
                  <i className="fas fa-external-link-alt mr-2"></i>
                  Open in New Tab
                </button>
                <button
                  onClick={() => setIsAppLoaded(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex-1"
                  data-testid="button-try-different-url"
                >
                  Try Different URL
                </button>
              </div>
            </div>
          </div>
        )}
        
        <iframe
          src={getEmbedUrl(appUrl)}
          className="w-full h-full border-0"
          title="Whisky Valuation App"
          onError={handleIframeError}
          onLoad={() => setLoadingError(false)}
          sandbox="allow-same-origin allow-scripts allow-forms allow-modals allow-popups"
          data-testid="iframe-whisky-valuation-app"
        />
      </div>
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

      case 'art-valuation':
        return <ArtValuationComponent />;

      case 'whisky-valuation':
        return <WhiskyValuationComponent />;
        
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
      <div className="bg-[var(--card)] rounded-[var(--radius-md)] shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden" style={{ boxShadow: 'var(--shadow-xl)' }}>
        
        {/* Header */}
        <div className="bg-[var(--muted)] px-6 py-4 border-b border-[var(--border)] flex justify-between items-center">
          <h2 className="text-lg font-semibold text-[var(--card-foreground)]">{title}</h2>
          <button
            onClick={onClose}
            className="text-[var(--muted-foreground)] hover:text-[var(--card-foreground)] transition-colors"
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