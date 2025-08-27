import { useState } from 'react';
import { useLocation } from 'wouter';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ToolCard from '../components/ToolCard';
import ToolkitModal from '../components/ToolkitModal';

export default function Toolkit() {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [selectedTitle, setSelectedTitle] = useState<string>('');
  const [, navigate] = useLocation();

  const openTool = (toolType: string, title: string) => {
    // Special handling for pitch deck analyser - navigate to full page
    if (toolType === 'pitch-deck-analyser') {
      navigate('/pitch-deck-analyser');
      return;
    }
    
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
      iconColor: 'text-[#5193B3]',
      title: 'Allowance Calculator',
      description: 'Calculate EIS and SEIS annual limits with carry-back relief optimization.',
      actionText: 'Open Calculator',
      isLocked: false
    },
    {
      id: 'loss-relief-calculator',
      category: 'tax-relief',
      icon: 'fas fa-chart-line',
      iconColor: 'text-[#62C4C3]',
      title: 'Loss Relief Calculator',
      description: 'Model downside scenarios and calculate loss relief after upfront benefits.',
      actionText: 'Open Calculator',
      isLocked: true,
      isPremium: true
    },
    {
      id: 'cgt-deferral-calculator',
      category: 'tax-relief',
      icon: 'fas fa-clock',
      iconColor: 'text-[#F8D49B]',
      title: 'CGT Deferral Calculator',
      description: 'Calculate EIS reinvestment deferral and SEIS 50% exemption benefits.',
      actionText: 'Open Calculator',
      isLocked: true,
      isPremium: true
    },
    
    // Analysis Tools
    {
      id: 'pitch-deck-analyser',
      category: 'analysis',
      icon: 'fas fa-file-powerpoint',
      iconColor: 'text-[#5193B3]',
      title: 'Pitch Deck Analyser',
      description: 'Upload pitch decks for AI-generated clarity and consistency feedback.',
      actionText: 'Upload Pitch Deck',
      isLocked: false,
      isPremium: false
    },
    {
      id: 'business-snapshot',
      category: 'analysis',
      icon: 'fas fa-search-dollar',
      iconColor: 'text-[#62C4C3]',
      title: 'Business Snapshot Request',
      description: 'Quick due diligence report with key business metrics and risk factors.',
      actionText: 'Request Snapshot',
      isLocked: false
    },
    {
      id: 'risk-return-profiler',
      category: 'analysis',
      icon: 'fas fa-chart-pie',
      iconColor: 'text-[#F8D49B]',
      title: 'Risk/Return Profiler',
      description: 'See how EIS/SEIS investments affect your portfolio risk and returns.',
      actionText: 'Analyse Portfolio',
      isLocked: true,
      isPremium: true
    },
    {
      id: 'property-valuation',
      category: 'analysis',
      icon: 'fas fa-home',
      iconColor: 'text-[#5193B3]',
      title: 'Property Valuation',
      description: 'Professional real estate valuation using comparable sales and market data.',
      actionText: 'Value Property',
      isLocked: false,
      isPremium: false
    },
    {
      id: 'art-valuation',
      category: 'analysis',
      icon: 'fas fa-palette',
      iconColor: 'text-[#62C4C3]',
      title: 'Art Valuation',
      description: 'Fine art and collectibles appraisal with auction data and expert insights.',
      actionText: 'Appraise Artwork',
      isLocked: false,
      isPremium: false
    },
    {
      id: 'whisky-valuation',
      category: 'analysis',
      icon: 'fas fa-wine-bottle',
      iconColor: 'text-[#F8D49B]',
      title: 'Whisky Valuation',
      description: 'Rare whisky and cask investment valuation with market trends analysis.',
      actionText: 'Value Cask',
      isLocked: false,
      isPremium: false
    },
    
    // Investor Utilities
    {
      id: 'document-checklist',
      category: 'utilities',
      icon: 'fas fa-tasks',
      iconColor: 'text-[#5193B3]',
      title: 'Document Checklist',
      description: 'Essential documents to request during your due diligence process.',
      actionText: 'View Checklist',
      isLocked: false
    },
    {
      id: 'glossary',
      category: 'utilities',
      icon: 'fas fa-book',
      iconColor: 'text-[#62C4C3]',
      title: 'EIS/SEIS Glossary',
      description: 'Quick definitions and explanations of key investment terminology.',
      actionText: 'Browse Terms',
      isLocked: true,
      isPremium: true
    },
    {
      id: 'saved-calculations',
      category: 'utilities',
      icon: 'fas fa-history',
      iconColor: 'text-[#F8D49B]',
      title: 'Saved Calculations',
      description: 'History of your previous calculations and generated reports.',
      actionText: 'View History',
      isLocked: true,
      isPremium: true
    },
    {
      id: 'website-fact-checker',
      category: 'utilities',
      icon: 'fas fa-shield-alt',
      iconColor: 'text-[#5193B3]',
      title: 'Website Fact Checker',
      description: 'Verify website claims and information accuracy using AI-powered analysis.',
      actionText: 'Check Website',
      isLocked: false,
      isPremium: false
    }
  ];

  const premiumTools = [
    {
      icon: 'fas fa-chart-pie',
      iconColor: 'text-[#5193B3]',
      title: 'Portfolio Diversification Simulator',
      description: 'Model allocation strategies across different EIS/SEIS opportunities.'
    },
    {
      icon: 'fas fa-chart-line',
      iconColor: 'text-[#62C4C3]',
      title: 'Exit/Downside Scenario Analysis',
      description: 'Comprehensive modeling of potential outcomes and risk mitigation.'
    },
    {
      icon: 'fas fa-tachometer-alt',
      iconColor: 'text-[#F8D49B]',
      title: 'Enhanced Tax Planning Dashboard',
      description: 'Multi-year tax planning with advanced optimization strategies.'
    },
    {
      icon: 'fas fa-robot',
      iconColor: 'text-[#5193B3]',
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

        {/* Enhanced Filter Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          {[
            { id: 'all', label: 'All Tools', icon: 'fas fa-th', color: 'from-[#5193B3] to-[#62C4C3]' },
            { id: 'tax-relief', label: 'Tax Relief', icon: 'fas fa-calculator', color: 'from-[#5193B3] to-[#4A85A3]' },
            { id: 'analysis', label: 'Analysis', icon: 'fas fa-chart-line', color: 'from-[#62C4C3] to-[#58B4B3]' },
            { id: 'utilities', label: 'Utilities', icon: 'fas fa-tools', color: 'from-[#F8D49B] to-[#E8C488]' }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`
                px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 relative overflow-hidden
                ${activeFilter === filter.id 
                  ? `bg-gradient-to-r ${filter.color} text-white shadow-lg transform -translate-y-0.5` 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-[#5193B3]/30 dark:hover:border-[#62C4C3]/30'
                }
              `}
            >
              <i className={`${filter.icon} text-sm`} aria-hidden="true"></i>
              <span>{filter.label}</span>
              {activeFilter === filter.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse"></div>
              )}
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

        {/* Enhanced Premium Section */}
        <div className="bg-gradient-to-br from-[#5193B3]/5 via-white to-[#62C4C3]/5 dark:from-[#5193B3]/10 dark:via-gray-800 dark:to-[#62C4C3]/10 rounded-2xl border border-[#5193B3]/20 dark:border-[#62C4C3]/20 p-8 relative overflow-hidden">
          
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-[#5193B3] to-[#62C4C3] rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-10 w-24 h-24 bg-gradient-to-br from-[#F8D49B] to-[#62C4C3] rounded-full blur-2xl"></div>
          </div>

          <div className="text-center mb-8 relative">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#F8D49B] to-[#62C4C3] rounded-2xl mb-4 shadow-lg">
              <i className="fas fa-crown text-2xl text-gray-900" aria-hidden="true"></i>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#5193B3] to-[#62C4C3] bg-clip-text text-transparent mb-3">
              Advanced Tools (Pro)
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Unlock powerful features for comprehensive investment analysis and planning with our professional toolkit
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {premiumTools.map((tool, index) => (
              <div key={index} className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-5 text-center opacity-80 hover:opacity-100 transition-all duration-300 border border-white/50 dark:border-gray-700/50">
                <div className="w-14 h-14 bg-gradient-to-br from-[#5193B3]/10 to-[#62C4C3]/10 border border-[#5193B3]/20 dark:border-[#62C4C3]/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                  <i className={`${tool.icon} text-xl ${tool.iconColor} group-hover:scale-110 transition-transform duration-200`} aria-hidden="true"></i>
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 text-sm">{tool.title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-3">{tool.description}</p>
                <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                  <i className="fas fa-lock text-gray-500 text-xs" aria-hidden="true"></i>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center relative">
            <button 
              className="bg-gradient-to-r from-[#5193B3] to-[#62C4C3] hover:from-[#4A85A3] hover:to-[#58B4B3] text-white font-semibold py-4 px-10 rounded-xl text-sm transition-all duration-300 shadow-lg hover:shadow-xl cursor-not-allowed opacity-75 relative overflow-hidden"
              disabled
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                <i className="fas fa-crown text-lg" aria-hidden="true"></i>
                <span>Upgrade to Pro</span>
                <i className="fas fa-arrow-right text-sm" aria-hidden="true"></i>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 flex items-center justify-center gap-2">
              <i className="fas fa-clock text-xs" aria-hidden="true"></i>
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