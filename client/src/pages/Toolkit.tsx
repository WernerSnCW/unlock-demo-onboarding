import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ToolCard from '../components/ToolCard';
import ToolkitModal from '../components/ToolkitModal';

export default function Toolkit() {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [selectedTitle, setSelectedTitle] = useState<string>('');

  const openTool = (toolType: string, title: string) => {
    setSelectedTool(toolType);
    setSelectedTitle(title);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTool('');
    setSelectedTitle('');
  };

  const tools = [
    // Tax Relief Tools
    {
      id: 'allowance-calculator',
      category: 'tax-relief',
      icon: 'fas fa-calculator',
      iconColor: 'text-blue-600',
      title: 'Allowance Calculator',
      description: 'Calculate EIS and SEIS annual limits with carry-back relief optimization.',
      actionText: 'Open Calculator',
      isLocked: false
    },
    {
      id: 'loss-relief-calculator',
      category: 'tax-relief',
      icon: 'fas fa-chart-line-down',
      iconColor: 'text-red-600',
      title: 'Loss Relief Calculator',
      description: 'Model downside scenarios and calculate loss relief after upfront benefits.',
      actionText: 'Open Calculator',
      isLocked: true
    },
    {
      id: 'cgt-deferral-calculator',
      category: 'tax-relief',
      icon: 'fas fa-clock',
      iconColor: 'text-yellow-600',
      title: 'CGT Deferral Calculator',
      description: 'Calculate EIS reinvestment deferral and SEIS 50% exemption benefits.',
      actionText: 'Open Calculator',
      isLocked: true
    },
    
    // Analysis Tools
    {
      id: 'pitch-deck-analyser',
      category: 'analysis',
      icon: 'fas fa-file-powerpoint',
      iconColor: 'text-blue-600',
      title: 'Pitch Deck Analyser',
      description: 'Upload pitch decks for AI-generated clarity and consistency feedback.',
      actionText: 'Upload Pitch Deck',
      isLocked: true
    },
    {
      id: 'business-snapshot',
      category: 'analysis',
      icon: 'fas fa-search-dollar',
      iconColor: 'text-green-600',
      title: 'Business Snapshot Request',
      description: 'Quick due diligence report with key business metrics and risk factors.',
      actionText: 'Request Snapshot',
      isLocked: false
    },
    {
      id: 'risk-return-profiler',
      category: 'analysis',
      icon: 'fas fa-chart-pie',
      iconColor: 'text-purple-600',
      title: 'Risk/Return Profiler',
      description: 'See how EIS/SEIS investments affect your portfolio risk and returns.',
      actionText: 'Analyse Portfolio',
      isLocked: true,
      isPremium: true
    },
    
    // Investor Utilities
    {
      id: 'document-checklist',
      category: 'utilities',
      icon: 'fas fa-tasks',
      iconColor: 'text-purple-600',
      title: 'Document Checklist',
      description: 'Essential documents to request during your due diligence process.',
      actionText: 'View Checklist',
      isLocked: false
    },
    {
      id: 'glossary',
      category: 'utilities',
      icon: 'fas fa-book',
      iconColor: 'text-teal-600',
      title: 'EIS/SEIS Glossary',
      description: 'Quick definitions and explanations of key investment terminology.',
      actionText: 'Browse Terms',
      isLocked: true
    },
    {
      id: 'saved-calculations',
      category: 'utilities',
      icon: 'fas fa-history',
      iconColor: 'text-gray-600',
      title: 'Saved Calculations',
      description: 'History of your previous calculations and generated reports.',
      actionText: 'View History',
      isLocked: true,
      isPremium: true
    }
  ];

  const premiumTools = [
    {
      icon: 'fas fa-chart-pie',
      iconColor: 'text-blue-600',
      title: 'Portfolio Diversification Simulator',
      description: 'Model allocation strategies across different EIS/SEIS opportunities.'
    },
    {
      icon: 'fas fa-chart-line',
      iconColor: 'text-red-600',
      title: 'Exit/Downside Scenario Analysis',
      description: 'Comprehensive modeling of potential outcomes and risk mitigation.'
    },
    {
      icon: 'fas fa-tachometer-alt',
      iconColor: 'text-green-600',
      title: 'Enhanced Tax Planning Dashboard',
      description: 'Multi-year tax planning with advanced optimization strategies.'
    },
    {
      icon: 'fas fa-robot',
      iconColor: 'text-purple-600',
      title: 'AI Investor Assistant',
      description: 'Chat with Unlock Pro for personalized investment guidance.'
    }
  ];

  const filteredTools = tools.filter(tool => 
    activeFilter === 'all' || tool.category === activeFilter
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      {/* Global Disclaimer */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-3">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <i className="fas fa-exclamation-triangle mr-2" aria-hidden="true"></i>
            <strong>Disclaimer:</strong> These tools provide illustrative calculations only and do not constitute financial advice. 
            Always consult a qualified financial advisor for investment decisions.
          </p>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Investor Toolkit</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Your go-to workspace for investment analysis, tax calculators, and due diligence utilities
          </p>
        </div>

        {/* About Info Box - Top Right */}
        <div className="flex justify-end mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4 max-w-sm">
            <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
              <i className="fas fa-lightbulb mr-2" aria-hidden="true"></i>
              Quick Guide
            </h3>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Click any tool card to open it. Use category filters to find specific tool types. 
              Pro tools show advanced features with premium access.
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'all', label: 'All Tools', icon: 'fas fa-th' },
            { id: 'tax-relief', label: 'Tax Relief', icon: 'fas fa-calculator' },
            { id: 'analysis', label: 'Analysis', icon: 'fas fa-chart-line' },
            { id: 'utilities', label: 'Utilities', icon: 'fas fa-tools' }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2
                ${activeFilter === filter.id 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }
              `}
            >
              <i className={`${filter.icon} text-sm`} aria-hidden="true"></i>
              {filter.label}
            </button>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredTools.map(tool => (
            <ToolCard
              key={tool.id}
              icon={tool.icon}
              iconColor={tool.iconColor}
              title={tool.title}
              description={tool.description}
              actionText={tool.actionText}
              isLocked={tool.isLocked}
              isPremium={tool.isPremium}
              onClick={() => openTool(tool.id, tool.title)}
            />
          ))}
        </div>

        {/* Premium Section */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800 p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              <i className="fas fa-crown mr-2 text-yellow-500" aria-hidden="true"></i>
              Advanced Tools (Pro)
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Unlock powerful features for comprehensive investment analysis and planning
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {premiumTools.map((tool, index) => (
              <div key={index} className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 text-center opacity-75">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <i className={`${tool.icon} text-xl ${tool.iconColor}`} aria-hidden="true"></i>
                </div>
                <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-1 text-sm">{tool.title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">{tool.description}</p>
                <i className="fas fa-lock text-gray-400 mt-2" aria-hidden="true"></i>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button 
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium py-3 px-8 rounded-lg text-sm transition-all hover:shadow-lg cursor-not-allowed opacity-75"
              disabled
            >
              <i className="fas fa-crown mr-2" aria-hidden="true"></i>
              Upgrade to Pro
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Coming soon with advanced modeling and AI features
            </p>
          </div>
        </div>

      </div>
      
      <Footer />
      
      {/* Tool Modal */}
      <ToolkitModal 
        isOpen={modalOpen}
        onClose={closeModal}
        toolType={selectedTool}
        title={selectedTitle}
      />
    </div>
  );
}