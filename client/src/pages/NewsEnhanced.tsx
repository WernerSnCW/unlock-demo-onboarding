import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import AIChat from '../components/AIChat';
import PreferencesPanel from '../components/PreferencesPanel';
import EnhancedNewsCard from '../components/EnhancedNewsCard';
import AlertsCentre from '../components/AlertsCentre';
import TrendingTopics from '../components/TrendingTopics';
import NewsletterPreviewModal from '../components/NewsletterPreviewModal';
import WhatsAppConnectModal from '../components/WhatsAppConnectModal';

// Import mock data
import newsItemsData from '../mocks/newsItems.json';
import newsProfileData from '../mocks/newsOnboardingProfile.json';
import savedNewsData from '../mocks/savedNews.json';
import alertsData from '../mocks/alerts.json';

// Mock data for personalized news
const newsCategories = [
  { id: 'all', name: 'All News', count: newsItemsData.length },
  { id: 'policy', name: 'EIS/SEIS Updates', count: newsItemsData.filter(item => item.type === 'policy').length },
  { id: 'market', name: 'Market Updates', count: newsItemsData.filter(item => item.type === 'market').length },
  { id: 'company', name: 'Company News', count: newsItemsData.filter(item => item.type === 'company').length },
  { id: 'insight', name: 'Intelligence', count: newsItemsData.filter(item => item.type === 'insight').length },
];

interface UserPreferences {
  frequency: 'daily' | 'weekly' | 'monthly';
  channels: {
    email: boolean;
    whatsapp: boolean;
    pushNotifications: boolean;
  };
  sectors: string[];
  regions: string[];
  topics: string[];
  tickers: string[];
  includeSources: string[];
  excludeSources: string[];
  riskAppetite: ('low' | 'medium' | 'high')[];
  eisSeisEnabled: boolean;
  dedupe: boolean;
  hideLowValue: boolean;
  existingInvestments: string[];
  investmentInterests: string[];
}

export default function NewsEnhanced() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [preferences, setPreferences] = useState<UserPreferences>({
    frequency: 'weekly',
    channels: { email: true, whatsapp: false, pushNotifications: true },
    sectors: ['Fintech', 'Biotech'],
    regions: ['UK'],
    topics: ['EIS/SEIS', 'Regulatory'],
    tickers: ['VOD.L', 'BARC.L'],
    includeSources: ['Reuters', 'LSE RNS', 'GOV.UK'],
    excludeSources: [],
    riskAppetite: ['medium'],
    eisSeisEnabled: true,
    dedupe: true,
    hideLowValue: true,
    existingInvestments: ['Public Equity', 'Angel Investing', 'Whisky & Spirits'],
    investmentInterests: ['Seed Stage Startups', 'Technology Sector', 'Whisky & Spirits Casks']
  });

  const [savedArticles, setSavedArticles] = useState<string[]>([]);
  const [showAlertsCenter, setShowAlertsCenter] = useState(false);
  const [showNewsletterPreview, setShowNewsletterPreview] = useState(false);
  const [showWhatsAppConnect, setShowWhatsAppConnect] = useState(false);
  const [filteredNews, setFilteredNews] = useState(newsItemsData);
  const [visibleCount, setVisibleCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const hasUnreadAlerts = alertsData.some(alert => alert.priority === 'high');

  const defaultPreferences: UserPreferences = {
    frequency: 'weekly',
    channels: { email: true, whatsapp: false, pushNotifications: true },
    sectors: ['Fintech', 'Biotech'],
    regions: ['UK'],
    topics: ['EIS/SEIS', 'Regulatory'],
    tickers: ['VOD.L', 'BARC.L'],
    includeSources: ['Reuters', 'LSE RNS', 'GOV.UK'],
    excludeSources: [],
    riskAppetite: ['medium'],
    eisSeisEnabled: true,
    dedupe: true,
    hideLowValue: true,
    existingInvestments: ['Public Equity', 'Angel Investing', 'Whisky & Spirits'],
    investmentInterests: ['Seed Stage Startups', 'Technology Sector', 'Whisky & Spirits Casks']
  };

  // Enhanced filtering with deduplication and smart filtering
  const applyAdvancedFiltering = (items: any[]) => {
    let filtered = [...items];

    // Only apply sector filtering if user has explicitly selected specific sectors
    // Default behavior: show all sectors unless specifically filtered
    if (preferences.sectors.length > 0 && selectedCategory === 'your-sectors') {
      filtered = filtered.filter(item => 
        preferences.sectors.includes(item.sector) || item.sector === 'All'
      );
    }

    // Apply region filter only if regions are specified and not empty
    if (preferences.regions && preferences.regions.length > 0 && preferences.regions[0] !== '') {
      filtered = filtered.filter(item => 
        !item.region || preferences.regions.includes(item.region) || item.region === 'Global'
      );
    }

    // Apply topic filter more permissively - OR logic
    if (preferences.topics && preferences.topics.length > 0 && preferences.topics[0] !== '') {
      // Don't filter by topics unless explicitly searching for them
      // This allows broader content discovery
    }

    // Apply ticker filter only when specifically relevant
    if (preferences.tickers && preferences.tickers.length > 0 && preferences.tickers[0] !== '') {
      // Only filter by tickers if the article actually has ticker information
      filtered = filtered.filter(item =>
        !item.tickers || item.tickers.length === 0 || item.tickers.some((ticker: string) => preferences.tickers.includes(ticker))
      );
    }

    // Apply source inclusion filter only if sources are specifically selected
    if (preferences.includeSources && preferences.includeSources.length > 0 && preferences.includeSources[0] !== '') {
      // More permissive - include if no sources specified or if source matches
      const hasSourceFilter = preferences.includeSources.some(source => source.trim() !== '');
      if (hasSourceFilter) {
        filtered = filtered.filter(item =>
          preferences.includeSources.includes(item.source)
        );
      }
    }

    // Apply source exclusion
    if (preferences.excludeSources && preferences.excludeSources.length > 0) {
      filtered = filtered.filter(item =>
        !preferences.excludeSources.includes(item.source)
      );
    }

    // EIS/SEIS filter - default to enabled (show EIS content)
    if (!preferences.eisSeisEnabled) {
      filtered = filtered.filter(item =>
        !item.tags.some((tag: string) => tag.toLowerCase().includes('eis') || tag.toLowerCase().includes('seis'))
      );
    }

    // Hide low-value items - more permissive threshold
    if (preferences.hideLowValue) {
      filtered = filtered.filter(item => 
        item.relevance >= 0.25 || (item.tickers && item.tickers.some((ticker: string) => preferences.tickers?.includes(ticker)))
      );
    }

    // Sort by date desc, then relevance desc
    filtered.sort((a, b) => {
      const dateA = new Date(a.publishedAt || a.dateISO).getTime();
      const dateB = new Date(b.publishedAt || b.dateISO).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return b.relevance - a.relevance;
    });

    return filtered;
  };

  useEffect(() => {
    let filtered = newsItemsData;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.type === selectedCategory);
    }

    // Apply advanced filtering
    filtered = applyAdvancedFiltering(filtered);

    setFilteredNews(filtered);
    setVisibleCount(10);
  }, [selectedCategory, searchQuery, preferences]);

  const updatePreferences = (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
  };

  const toggleSaved = (articleId: string) => {
    setSavedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const handleAskAbout = (headline: string, source: string) => {
    const chatInput = document.querySelector('#chat-input') as HTMLInputElement;
    if (chatInput) {
      chatInput.value = `Tell me more about: "${headline}" from ${source}`;
      chatInput.focus();
    }
  };

  const loadMoreNews = () => {
    if (isLoading) return;
    setIsLoading(true);
    
    setTimeout(() => {
      setVisibleCount(prev => prev + 10);
      setIsLoading(false);
    }, 500);
  };

  const getMatchingPreferences = (item: any) => {
    const matching: any = {};
    
    if (item.sector && preferences.sectors.includes(item.sector)) {
      matching.sectors = [item.sector];
    }
    if (item.topics) {
      matching.topics = item.topics.filter((topic: string) => preferences.topics.includes(topic));
    }
    if (item.region && preferences.regions.includes(item.region)) {
      matching.regions = [item.region];
    }
    if (item.tickers) {
      matching.tickers = item.tickers.filter((ticker: string) => preferences.tickers.includes(ticker));
    }
    
    return matching;
  };

  const handleTopicClick = (topic: string) => {
    const currentTopics = preferences.topics || [];
    const newTopics = currentTopics.includes(topic)
      ? currentTopics.filter(t => t !== topic)
      : [...currentTopics, topic];
    
    updatePreferences({ ...preferences, topics: newTopics });
  };

  const visibleNews = filteredNews.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <div className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="max-w-[1280px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[var(--card-foreground)]">
                Personalised Financial News
              </h1>
              <p className="text-[var(--muted-foreground)] mt-1">
                Global insights, EIS updates, and intelligent curation
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAlertsCenter(true)}
                className="relative px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--card-foreground)] hover:bg-[var(--muted)] rounded-[var(--radius-sm)] transition-colors"
              >
                <i className="fas fa-bell mr-2"></i>
                Alerts
                {hasUnreadAlerts && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--destructive)] rounded-full"></span>
                )}
              </button>
              <button
                onClick={() => setShowNewsletterPreview(true)}
                className="px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--card-foreground)] hover:bg-[var(--muted)] rounded-[var(--radius-sm)] transition-colors"
              >
                <i className="fas fa-envelope mr-2"></i>
                Preview Digest
              </button>
              <Link 
                href="/"
                className="px-4 py-2 text-sm font-medium text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-[var(--radius-sm)] transition-colors"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Sidebar - Filters & Preferences */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              
              {/* Search */}
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search news..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--card-foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  />
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--muted-foreground)]"></i>
                </div>
              </div>

              {/* Categories */}
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4">
                <h3 className="font-semibold text-[var(--card-foreground)] mb-4">Categories</h3>
                <div className="space-y-2">
                  {newsCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-[var(--radius-sm)] text-left transition-colors ${
                        selectedCategory === category.id 
                          ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' 
                          : 'hover:bg-[var(--muted)] text-[var(--card-foreground)]'
                      }`}
                    >
                      <span className="text-sm font-medium">{category.name}</span>
                      <span className="text-xs bg-[var(--muted)] text-[var(--muted-foreground)] px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferences Panel */}
              <PreferencesPanel 
                preferences={preferences} 
                onUpdatePreferences={updatePreferences}
                onResetPreferences={resetPreferences}
              />

            </div>
          </div>

          {/* Center Column - News Feed */}
          <div className="lg:col-span-6">
            <div className="space-y-6">
              
              {/* Call-to-action chip */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[var(--success)] rounded-full animate-pulse"></div>
                  <span className="text-sm text-[var(--muted-foreground)]">
                    Live feed • {filteredNews.length} articles
                  </span>
                </div>
                <div className="text-xs text-[var(--muted-foreground)]">
                  Information only • No financial advice • Businesses only
                </div>
              </div>

              {/* News Feed */}
              <div className="space-y-6">
                {visibleNews.map((item) => (
                  <EnhancedNewsCard
                    key={item.id}
                    item={item}
                    allItems={filteredNews}
                    onSave={toggleSaved}
                    onAskAbout={handleAskAbout}
                    isSaved={savedArticles.includes(item.id)}
                    matchingPreferences={getMatchingPreferences(item)}
                  />
                ))}
              </div>

              {/* Load More */}
              {visibleCount < filteredNews.length && (
                <div className="flex justify-center pt-8">
                  <button
                    onClick={loadMoreNews}
                    disabled={isLoading}
                    className="px-6 py-3 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] text-[var(--card-foreground)] hover:bg-[var(--muted)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Loading...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus mr-2"></i>
                        Load More ({filteredNews.length - visibleCount} remaining)
                      </>
                    )}
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* Right Sidebar - Assistant & Trending */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              
              {/* Phone Container */}
              <div className="relative">
                {/* Phone Frame */}
                <div className="bg-gray-900 dark:bg-gray-800 rounded-[2.5rem] p-2 shadow-2xl" style={{ aspectRatio: '9/19.5' }}>
                  {/* Screen */}
                  <div className="bg-white dark:bg-gray-100 rounded-[2rem] h-full p-4 overflow-hidden relative">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center mb-4 text-black text-xs font-medium">
                      <div className="flex items-center gap-1">
                        <span>9:41</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="flex gap-1">
                          <div className="w-1 h-1 bg-black rounded-full"></div>
                          <div className="w-1 h-1 bg-black rounded-full"></div>
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        </div>
                        <i className="fas fa-wifi text-black text-xs ml-1"></i>
                        <div className="w-6 h-3 border border-black rounded-sm relative ml-1">
                          <div className="w-4 h-1.5 bg-green-500 rounded-sm absolute top-0.5 left-0.5"></div>
                        </div>
                      </div>
                    </div>

                    {/* WhatsApp Connect Section */}
                    <div className="mb-4">
                      <button
                        onClick={() => setShowWhatsAppConnect(true)}
                        className="w-full bg-green-500 hover:bg-green-600 text-white p-4 rounded-xl flex items-center gap-3 transition-colors shadow-lg"
                      >
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                          <i className="fab fa-whatsapp text-green-500 text-lg"></i>
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-semibold">Get updates on WhatsApp</div>
                          <div className="text-sm opacity-90">On-the-go summaries</div>
                        </div>
                      </button>
                      
                      {preferences.channels.whatsapp && (
                        <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                          <div className="flex items-center gap-2 text-green-700 dark:text-green-400 text-sm">
                            <i className="fas fa-check-circle"></i>
                            <span>WhatsApp connected</span>
                          </div>
                          <button
                            onClick={() => setShowWhatsAppConnect(true)}
                            className="text-green-600 dark:text-green-400 text-xs underline mt-1"
                          >
                            Connect WhatsApp
                          </button>
                        </div>
                      )}
                    </div>

                    {/* AI Assistant Header */}
                    <div className="text-gray-600 text-xs mb-2">
                      Sources shown when available
                    </div>

                    {/* AI Assistant Chat Container */}
                    <div className="bg-gray-50 dark:bg-gray-100 rounded-xl flex-1 h-[calc(100%-120px)] flex flex-col">
                      {/* AI Chat Header */}
                      <div className="flex items-center p-3 border-b border-gray-200">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                          <i className="fas fa-robot text-white text-sm"></i>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm">AI Assistant</h3>
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Online
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          <i className="fas fa-trash text-sm"></i>
                        </button>
                      </div>

                      {/* Chat Messages Area */}
                      <div className="flex-1 p-3 text-gray-900 bg-white rounded-b-xl">
                        <div className="bg-gray-100 p-3 rounded-lg rounded-bl-sm max-w-[85%] mb-3">
                          <p className="text-sm">Hi! I can help with quick investment intelligence. Try asking about tax allowances, sector trends, or red flags.</p>
                          <div className="text-xs text-gray-500 mt-1">14:27</div>
                        </div>
                        
                        {/* Input Area */}
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center gap-2 bg-gray-100 rounded-full p-2">
                            <input
                              type="text"
                              placeholder="Ask about investment..."
                              className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none px-2"
                            />
                            <button className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                              <i className="fas fa-paper-plane text-white text-xs"></i>
                            </button>
                          </div>
                          <div className="text-center text-xs text-gray-500 mt-2">
                            This is not advice
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Home Indicator */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-700 rounded-full"></div>
                </div>
              </div>

              {/* Trending Topics */}
              <TrendingTopics 
                newsItems={filteredNews}
                onTopicClick={handleTopicClick}
              />

              {/* Saved Articles */}
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4">
                <h3 className="font-semibold text-[var(--card-foreground)] mb-4 flex items-center gap-2">
                  <i className="fas fa-bookmark text-[var(--accent)]"></i>
                  Saved Articles
                </h3>
                {savedArticles.length === 0 ? (
                  <p className="text-sm text-[var(--muted-foreground)] text-center py-4">
                    No saved articles yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {savedArticles.slice(0, 3).map((articleId) => {
                      const article = newsItemsData.find(item => item.id === articleId);
                      return article ? (
                        <div key={articleId} className="p-2 bg-[var(--muted)] rounded-[var(--radius-sm)]">
                          <h4 className="text-sm font-medium text-[var(--card-foreground)] line-clamp-1">
                            {article.title}
                          </h4>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {article.source}
                          </p>
                        </div>
                      ) : null;
                    })}
                    {savedArticles.length > 3 && (
                      <p className="text-xs text-[var(--muted-foreground)] text-center pt-2">
                        +{savedArticles.length - 3} more
                      </p>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AlertsCentre 
        isOpen={showAlertsCenter}
        onClose={() => setShowAlertsCenter(false)}
      />
      
      <NewsletterPreviewModal
        isOpen={showNewsletterPreview}
        onClose={() => setShowNewsletterPreview(false)}
        newsItems={filteredNews}
        frequency={preferences.frequency}
      />
      
      <WhatsAppConnectModal
        isOpen={showWhatsAppConnect}
        onClose={() => setShowWhatsAppConnect(false)}
      />
    </div>
  );
}