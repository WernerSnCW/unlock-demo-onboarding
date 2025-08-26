import { useState } from 'react';
import SimpleAllowanceCalculator from './SimpleAllowanceCalculator';
import PitchDeckAnalyser from './PitchDeckAnalyser';

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
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                  <option value="">Choose property to value...</option>
                  <option value="property1">456 Test Avenue, Manchester M1 1AA</option>
                  <option value="property2">199 Galvanis Street, 1953 Lee Towers, London 3029 AD</option>
                </select>
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
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Generate Valuation Report
                </button>
              </div>
            </form>
            
            {/* Results Preview */}
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
          </div>
        );
        
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