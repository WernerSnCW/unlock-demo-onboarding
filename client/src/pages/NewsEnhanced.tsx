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
    hideLowValue: true
  });

  const [savedArticles, setSavedArticles] = useState<string[]>([]);
  const [showAlertsCenter, setShowAlertsCenter] = useState(false);
  const [showNewsletterPreview, setShowNewsletterPreview] = useState(false);
  const [showWhatsAppConnect, setShowWhatsAppConnect] = useState(false);
  const [filteredNews, setFilteredNews] = useState(newsItemsData);
  const [visibleCount, setVisibleCount] = useState(5);
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
    hideLowValue: true
  };

  // Enhanced filtering with deduplication and smart filtering
  const applyAdvancedFiltering = (items: any[]) => {
    let filtered = [...items];

    // Apply preference filters
    if (preferences.sectors.length > 0) {
      filtered = filtered.filter(item => 
        preferences.sectors.includes(item.sector) || item.sector === 'All'
      );
    }

    if (preferences.regions && preferences.regions.length > 0) {
      filtered = filtered.filter(item => 
        !item.region || preferences.regions.includes(item.region)
      );
    }

    if (preferences.topics && preferences.topics.length > 0) {
      filtered = filtered.filter(item =>
        !item.topics || item.topics.some((topic: string) => preferences.topics.includes(topic))
      );
    }

    if (preferences.tickers && preferences.tickers.length > 0) {
      filtered = filtered.filter(item =>
        !item.tickers || item.tickers.some((ticker: string) => preferences.tickers.includes(ticker))
      );
    }

    if (preferences.includeSources && preferences.includeSources.length > 0) {
      filtered = filtered.filter(item =>
        preferences.includeSources.includes(item.source)
      );
    }

    if (preferences.excludeSources && preferences.excludeSources.length > 0) {
      filtered = filtered.filter(item =>
        !preferences.excludeSources.includes(item.source)
      );
    }

    if (!preferences.eisSeisEnabled) {
      filtered = filtered.filter(item =>
        !item.tags.some((tag: string) => tag.toLowerCase().includes('eis') || tag.toLowerCase().includes('seis'))
      );
    }

    // Hide low-value items
    if (preferences.hideLowValue) {
      filtered = filtered.filter(item => 
        item.relevance >= 0.35 || (item.tickers && item.tickers.some((ticker: string) => preferences.tickers?.includes(ticker)))
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
    setVisibleCount(5);
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
      setVisibleCount(prev => prev + 5);
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
              
              {/* WhatsApp Connect Banner */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-[var(--radius-md)] p-4">
                <div className="flex items-center gap-3 mb-3">
                  <i className="fab fa-whatsapp text-2xl"></i>
                  <div>
                    <h3 className="font-semibold">Get updates on WhatsApp</h3>
                    <p className="text-sm opacity-90">On-the-go summaries</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowWhatsAppConnect(true)}
                  className="w-full px-4 py-2 bg-white text-green-600 rounded-[var(--radius-sm)] text-sm font-medium hover:bg-green-50 transition-colors"
                >
                  Connect WhatsApp
                </button>
              </div>

              {/* AI Assistant */}
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)]">
                <div className="p-4 border-b border-[var(--border)]">
                  <h3 className="font-semibold text-[var(--card-foreground)]">
                    <i className="fas fa-robot mr-2 text-[var(--primary)]"></i>
                    AI Assistant
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    Sources shown when available
                  </p>
                </div>
                <div className="h-[400px]">
                  <AIChat />
                </div>
                <div className="p-3 border-t border-[var(--border)] text-xs text-[var(--muted-foreground)] italic text-center">
                  This is not advice.
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