import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useInvestor } from '../contexts/InvestorContext';

interface ToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolId: string;
}

const toolDetails: Record<string, {
  name: string;
  description: string;
  icon: string;
  inputs: { label: string; placeholder: string; type?: string }[];
}> = {
  company_search: {
    name: 'Company Search',
    description: 'Find and research UK businesses by name, sector, or location.',
    icon: 'fas fa-search',
    inputs: [
      { label: 'Company Name', placeholder: 'Enter company name...' },
      { label: 'Sector', placeholder: 'Select sector...' },
      { label: 'Location', placeholder: 'Enter location...' }
    ]
  },
  eis_allowance: {
    name: 'EIS Allowance Calculator',
    description: 'Calculate your Enterprise Investment Scheme tax relief allowance.',
    icon: 'fas fa-calculator',
    inputs: [
      { label: 'Annual Income', placeholder: '£0', type: 'number' },
      { label: 'Investment Amount', placeholder: '£0', type: 'number' },
      { label: 'Tax Year', placeholder: '2024-25' }
    ]
  },
  risk_profiler: {
    name: 'Risk Profiler',
    description: 'Assess your investment portfolio risk and get personalized recommendations.',
    icon: 'fas fa-chart-line',
    inputs: [
      { label: 'Portfolio Value', placeholder: '£0', type: 'number' },
      { label: 'Investment Horizon', placeholder: 'Select timeframe...' },
      { label: 'Risk Tolerance', placeholder: 'Select preference...' }
    ]
  },
  sector_insights: {
    name: 'Sector Insights',
    description: 'Get market trends and analysis for specific business sectors.',
    icon: 'fas fa-industry',
    inputs: [
      { label: 'Primary Sector', placeholder: 'Select sector...' },
      { label: 'Geographic Focus', placeholder: 'Select region...' },
      { label: 'Time Period', placeholder: 'Last 12 months' }
    ]
  },
  dd_snapshot: {
    name: 'Due Diligence Snapshot',
    description: 'Generate comprehensive due diligence report for target business.',
    icon: 'fas fa-file-alt',
    inputs: [
      { label: 'Company Name', placeholder: 'Enter target company...' },
      { label: 'Analysis Depth', placeholder: 'Standard report' },
      { label: 'Focus Areas', placeholder: 'Select key areas...' }
    ]
  },
  property_valuation: {
    name: 'Property Valuation',
    description: 'Professional real estate valuation using comparable sales and market data.',
    icon: 'fas fa-home',
    inputs: [
      { label: 'Select Property', placeholder: 'Choose property to value...' },
      { label: 'Valuation Method', placeholder: 'Comparable sales analysis' },
      { label: 'Market Conditions', placeholder: 'Current market' }
    ]
  },
  art_valuation: {
    name: 'Art Valuation',
    description: 'Fine art and collectibles appraisal with auction data and expert insights.',
    icon: 'fas fa-palette',
    inputs: [
      { label: 'Artwork Type', placeholder: 'Select artwork category...' },
      { label: 'Artist/Creator', placeholder: 'Enter artist name...' },
      { label: 'Condition', placeholder: 'Excellent' }
    ]
  },
  whisky_valuation: {
    name: 'Whisky Valuation',
    description: 'Rare whisky and cask investment valuation with market trends analysis.',
    icon: 'fas fa-wine-bottle',
    inputs: [
      { label: 'Whisky Type', placeholder: 'Single malt, blend, cask...' },
      { label: 'Distillery', placeholder: 'Enter distillery name...' },
      { label: 'Age/Vintage', placeholder: 'Enter age or vintage year...' }
    ]
  }
};

function ChartStub() {
  return (
    <div className="bg-[var(--muted)] rounded-[var(--radius-sm)] p-6 text-center">
      <div className="w-16 h-16 mx-auto mb-3 bg-[var(--card)] rounded-full flex items-center justify-center">
        <i className="fas fa-chart-bar text-2xl text-[var(--muted-foreground)]"></i>
      </div>
      <p className="text-sm text-[var(--muted-foreground)]">
        Interactive charts and analysis will appear here
      </p>
    </div>
  );
}

function PropertyValuationDetails({ propertyId, properties }: { propertyId: string; properties: any[] }) {
  const property = properties.find((p: any) => p.id === propertyId);
  const [valuationData, setValuationData] = useState<any>(null);
  const [isLoadingValuation, setIsLoadingValuation] = useState(false);

  useEffect(() => {
    if (property?.postcode) {
      setIsLoadingValuation(true);
      fetch(`/api/property-comparables/${property.postcode}?propertyType=${property.propertyType || ''}`)
        .then(res => res.json())
        .then(data => {
          setValuationData(data);
          setIsLoadingValuation(false);
        })
        .catch(error => {
          console.error('Error fetching valuation:', error);
          setIsLoadingValuation(false);
        });
    }
  }, [property?.postcode, property?.propertyType]);

  if (!property) return null;

  return (
    <div className="space-y-4">
      {/* Property Details */}
      <div className="bg-[var(--muted)] rounded-[var(--radius-sm)] p-4">
        <h4 className="font-medium text-[var(--card-foreground)] mb-3">Property Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-[var(--muted-foreground)]">Type:</span>
            <span className="ml-2 text-[var(--card-foreground)] capitalize">
              {property.propertyType || 'Not specified'}
            </span>
          </div>
          <div>
            <span className="text-[var(--muted-foreground)]">Bedrooms:</span>
            <span className="ml-2 text-[var(--card-foreground)]">
              {property.bedrooms || 'Not specified'}
            </span>
          </div>
          {property.yearBuilt && (
            <div>
              <span className="text-[var(--muted-foreground)]">Year Built:</span>
              <span className="ml-2 text-[var(--card-foreground)]">{property.yearBuilt}</span>
            </div>
          )}
          {property.epcRating && (
            <div>
              <span className="text-[var(--muted-foreground)]">EPC Rating:</span>
              <span className="ml-2 text-[var(--card-foreground)]">{property.epcRating}</span>
            </div>
          )}
        </div>
      </div>

      {/* Valuation Results */}
      {isLoadingValuation ? (
        <div className="bg-[var(--muted)] rounded-[var(--radius-sm)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-[var(--card-foreground)]">Analyzing comparable sales...</span>
          </div>
        </div>
      ) : valuationData ? (
        <div className="bg-[var(--muted)] rounded-[var(--radius-sm)] p-4">
          <h4 className="font-medium text-[var(--card-foreground)] mb-3">Valuation Analysis</h4>
          
          {/* Key Statistics */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-[var(--card)] rounded-[var(--radius-sm)]">
              <div className="text-2xl font-bold text-[var(--primary)]">
                £{valuationData.statistics.estimatedValue.toLocaleString()}
              </div>
              <div className="text-sm text-[var(--muted-foreground)]">Estimated Value</div>
            </div>
            <div className="text-center p-3 bg-[var(--card)] rounded-[var(--radius-sm)]">
              <div className="text-lg font-semibold text-[var(--card-foreground)]">
                {valuationData.statistics.count}
              </div>
              <div className="text-sm text-[var(--muted-foreground)]">Comparable Sales</div>
            </div>
          </div>

          {/* Price Range */}
          <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
            <div className="text-center">
              <div className="font-medium text-[var(--card-foreground)]">
                £{valuationData.statistics.minPrice.toLocaleString()}
              </div>
              <div className="text-[var(--muted-foreground)]">Min</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-[var(--card-foreground)]">
                £{valuationData.statistics.medianPrice.toLocaleString()}
              </div>
              <div className="text-[var(--muted-foreground)]">Median</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-[var(--card-foreground)]">
                £{valuationData.statistics.maxPrice.toLocaleString()}
              </div>
              <div className="text-[var(--muted-foreground)]">Max</div>
            </div>
          </div>

          {/* Recent Comparables */}
          {valuationData.comparables.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-[var(--card-foreground)] mb-2">Recent Sales</h5>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {valuationData.comparables.slice(0, 5).map((comp: any, index: number) => (
                  <div key={index} className="flex justify-between items-center text-xs">
                    <div className="text-[var(--card-foreground)]">
                      {comp.street}, {comp.townCity}
                    </div>
                    <div className="text-[var(--primary)] font-medium">
                      £{Number(comp.price).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[var(--muted)] rounded-[var(--radius-sm)] p-4 text-center">
          <div className="text-sm text-[var(--muted-foreground)]">
            No comparable sales data available for this postcode
          </div>
        </div>
      )}
    </div>
  );
}

function PropertyValuationForm() {
  const { selectedInvestor } = useInvestor();
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  
  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ['/api/properties', selectedInvestor?.userId],
    enabled: !!selectedInvestor?.userId,
  });

  if (propertiesLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--card-foreground)]">
            Select Property
          </label>
          <div className="w-full h-10 bg-[var(--muted)] rounded-[var(--radius-sm)] animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--card-foreground)]">
            Valuation Method
          </label>
          <div className="w-full h-10 bg-[var(--muted)] rounded-[var(--radius-sm)] animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--card-foreground)]">
            Market Conditions
          </label>
          <div className="w-full h-10 bg-[var(--muted)] rounded-[var(--radius-sm)] animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!properties || !Array.isArray(properties) || properties.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-[var(--muted)] rounded-full flex items-center justify-center">
          <i className="fas fa-home text-2xl text-[var(--muted-foreground)]"></i>
        </div>
        <h3 className="text-lg font-medium text-[var(--card-foreground)] mb-2">No Properties Found</h3>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">
          {selectedInvestor ? 'No properties are associated with this investor.' : 'Please select an investor first.'}
        </p>
        <button className="text-[var(--accent)] text-sm font-medium hover:underline">
          Add Property →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Property Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--card-foreground)]">
          Select Property
        </label>
        <select
          value={selectedProperty}
          onChange={(e) => setSelectedProperty(e.target.value)}
          className="w-full px-3 py-2 bg-[var(--input)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--card-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        >
          <option value="">Choose property to value...</option>
          {Array.isArray(properties) && properties.map((property: any) => (
            <option key={property.id} value={property.id}>
              {property.addressLine1}{property.addressLine2 ? `, ${property.addressLine2}` : ''}, {property.city} {property.postcode}
            </option>
          ))}
        </select>
      </div>

      {/* Show property details and valuation if selected */}
      {selectedProperty && Array.isArray(properties) && <PropertyValuationDetails propertyId={selectedProperty} properties={properties} />}

      {/* Valuation Method */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--card-foreground)]">
          Valuation Method
        </label>
        <select
          disabled
          className="w-full px-3 py-2 bg-[var(--input)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--card-foreground)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option>Comparable sales analysis</option>
        </select>
      </div>

      {/* Market Conditions */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--card-foreground)]">
          Market Conditions
        </label>
        <select
          disabled
          className="w-full px-3 py-2 bg-[var(--input)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--card-foreground)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option>Current market</option>
        </select>
      </div>
    </div>
  );
}

export default function ToolModal({ isOpen, onClose, toolId }: ToolModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  const tool = toolDetails[toolId];

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Simulate loading delay
      const timer = setTimeout(() => setIsLoading(false), Math.random() * 300 + 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, toolId]);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeydown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !tool) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--muted)] rounded-full flex items-center justify-center">
                <i className={`${tool.icon} text-lg text-[var(--card-foreground)]`}></i>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[var(--card-foreground)]">
                  {tool.name}
                </h2>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {tool.description}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-[var(--muted)] flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              aria-label="Close modal"
            >
              <i className="fas fa-times text-[var(--muted-foreground)]"></i>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="space-y-4">
              {/* Skeleton inputs */}
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-[var(--muted)] rounded w-24 animate-pulse"></div>
                  <div className="h-10 bg-[var(--muted)] rounded animate-pulse"></div>
                </div>
              ))}
              <div className="h-32 bg-[var(--muted)] rounded animate-pulse"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Special handling for property valuation */}
              {toolId === 'property_valuation' || toolId === 'property-valuation' ? (
                <>
                  <PropertyValuationForm />
                  <ChartStub />
                </>
              ) : (
                <>
                  {/* Input Fields */}
                  <div className="space-y-4">
                    {tool.inputs.map((input, index) => (
                      <div key={index} className="space-y-2">
                        <label className="text-sm font-medium text-[var(--card-foreground)]">
                          {input.label}
                        </label>
                        <input
                          type={input.type || 'text'}
                          placeholder={input.placeholder}
                          disabled
                          className="w-full px-3 py-2 bg-[var(--input)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--card-foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Chart Stub */}
                  <ChartStub />
                </>
              )}

              {/* Premium Teaser */}
              <div className="bg-gradient-to-r from-[var(--primary)]/10 to-[var(--accent)]/10 border border-[var(--primary)]/20 rounded-[var(--radius-sm)] p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[var(--accent)] rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-crown text-sm text-[var(--accent-foreground)]"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--card-foreground)] mb-1">
                      Unlock Full Analysis
                    </h4>
                    <p className="text-sm text-[var(--muted-foreground)] mb-3">
                      Get complete insights, real-time data, and advanced analytics with Pro access.
                    </p>
                    <button 
                      disabled
                      className="text-[var(--accent)] text-sm font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Upgrade to Pro →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--muted)]/30">
          <div className="flex items-center justify-between mb-3">
            <button
              disabled
              className="bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 rounded-[var(--radius-sm)] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Run Analysis
            </button>
            <Link
              href="/toolkit"
              className="text-[var(--accent)] text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              onClick={onClose}
            >
              Open Toolkit →
            </Link>
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">
            This is not advice; businesses only.
          </p>
        </div>
      </div>
    </div>
  );
}