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
  { id: 'your-sectors', name: 'Your Sectors', count: newsItemsData.filter(item => 
    newsProfileData.sectors.includes(item.sector)).length }
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

export default function News() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
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

  const [filteredNews, setFilteredNews] = useState(newsItemsData);
  const [visibleCount, setVisibleCount] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  const hasUnreadAlerts = alertsData.some(alert => alert.priority === 'high');

  // Enhanced filtering with deduplication and smart filtering
  const applyAdvancedFiltering = (items: any[]) => {
    let filtered = [...items];

    // Apply preference filters
    if (preferences.sectors.length > 0) {
      filtered = filtered.filter(item => 
        preferences.sectors.includes(item.sector) || item.sector === 'All'
      );
    }

    if (preferences.regions.length > 0) {
      filtered = filtered.filter(item => 
        !item.region || preferences.regions.includes(item.region)
      );
    }

    if (preferences.topics.length > 0) {
      filtered = filtered.filter(item =>
        !item.topics || item.topics.some((topic: string) => preferences.topics.includes(topic))
      );
    }

    if (preferences.tickers.length > 0) {
      filtered = filtered.filter(item =>
        !item.tickers || item.tickers.some((ticker: string) => preferences.tickers.includes(ticker))
      );
    }

    if (preferences.includeSources.length > 0) {
      filtered = filtered.filter(item =>
        preferences.includeSources.includes(item.source)
      );
    }

    if (preferences.excludeSources.length > 0) {
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
        item.relevance >= 0.35 || (item.tickers && item.tickers.some((ticker: string) => preferences.tickers.includes(ticker)))
      );
    }

    // Deduplicate similar stories
    if (preferences.dedupe) {
      const seenTitles = new Set();
      const relatedGroups = new Set();
      
      filtered = filtered.filter(item => {
        // Check for similar titles (80% similarity)
        const titleWords = item.title.toLowerCase().split(' ');
        const isSimilar = Array.from(seenTitles).some((seenTitle: any) => {
          const seenWords = seenTitle.toLowerCase().split(' ');
          const commonWords = titleWords.filter(word => seenWords.includes(word));
          return commonWords.length / Math.max(titleWords.length, seenWords.length) >= 0.8;
        });
        
        // Check for related story groups
        if (item.relatedIds) {
          const relatedKey = item.relatedIds.sort().join(',');
          if (relatedGroups.has(relatedKey)) {
            return false;
          }
          relatedGroups.add(relatedKey);
        }
        
        if (!isSimilar) {
          seenTitles.add(item.title);
          return true;
        }
        return false;
      });
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
    if (selectedCategory === 'your-sectors') {
      filtered = filtered.filter(item => newsProfileData.sectors.includes(item.sector));
    } else if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.type === selectedCategory);
    }

    // Apply advanced filtering
    filtered = applyAdvancedFiltering(filtered);

    setFilteredNews(filtered);
    setVisibleCount(5); // Reset visible count when filters change
  }, [selectedCategory, searchQuery, preferences]);

  const getNewsIcon = (category: string) => {
    switch (category) {
      case 'eis-seis': return 'fa-university';
      case 'global-markets': return 'fa-globe';
      case 'startup-funding': return 'fa-rocket';
      case 'regulatory': return 'fa-gavel';
      case 'ai-innovation': return 'fa-brain';
      case 'your-sectors': return 'fa-star';
      default: return 'fa-newspaper';
    }
  };

  const getImageGradient = (imageType: string) => {
    switch (imageType) {
      case 'government': return 'from-blue-600 to-indigo-700';
      case 'chart': return 'from-green-600 to-emerald-700';
      case 'regulatory': return 'from-purple-600 to-violet-700';
      default: return 'from-gray-600 to-slate-700';
    }
  };

  const handleSaveArticle = (articleId: string) => {
    const newSaved = savedArticles.includes(articleId)
      ? savedArticles.filter(id => id !== articleId)
      : [...savedArticles, articleId];
    setSavedArticles(newSaved);
  };

  const handleAskAboutArticle = (title: string) => {
    // This would integrate with the AI chat component
    console.log(`Ask about: ${title}`);
  };

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
    
    // Simulate loading delay
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
    const currentTopics = preferences.topics;
    const newTopics = currentTopics.includes(topic)
      ? currentTopics.filter(t => t !== topic)
      : [...currentTopics, topic];
    
    updatePreferences({ ...preferences, topics: newTopics });
  };

  const handleResetPreferences = () => {
    setPreferences(defaultPreferences);
    setSelectedCategory('all');
    setSearchQuery('');
  };

  const NewsCard = ({ item }: { item: typeof newsItemsData[0] }) => (
    <article className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex gap-4">
        {/* News Image */}
        <div className="hidden md:block flex-shrink-0 w-16 h-16 rounded-[var(--radius-sm)] overflow-hidden">
          <div className={`w-full h-full bg-gradient-to-br ${getImageGradient(item.image || '')} flex items-center justify-center`}>
            <i className={`fas ${getNewsIcon(item.type)} text-white text-xl`}></i>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-[var(--card-foreground)] leading-tight">
              {item.title}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
              {item.riskTag === 'high' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                  High Impact
                </span>
              )}
              {item.type === 'insight' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  Intelligence
                </span>
              )}
              <span className="text-sm text-[var(--muted-foreground)]">~4 min</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)] mb-3">
            <span>{item.source}</span>
            <span>•</span>
            <span>{new Date(item.dateISO).toLocaleDateString()}</span>
            <span>•</span>
            <span>{Math.round((item.relevance || 0) * 100)}% match</span>
          </div>
          
          <p className="text-[var(--muted-foreground)] mb-4 leading-relaxed">
            {item.summary}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {item.tags.slice(0, 3).map((tag) => (
                <span 
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[var(--muted)] text-[var(--muted-foreground)]"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleSaveArticle(item.id)}
                className={`text-sm transition-colors ${
                  savedArticles.includes(item.id) 
                    ? 'text-[var(--accent)] hover:text-[var(--accent)]/80' 
                    : 'text-[var(--muted-foreground)] hover:text-[var(--accent)]'
                }`}
                aria-label={savedArticles.includes(item.id) ? 'Remove from saved' : 'Save article'}
              >
                <i className={`fas ${savedArticles.includes(item.id) ? 'fa-bookmark' : 'fa-bookmark-o'} mr-1`}></i>
                Save
              </button>
              <button 
                onClick={() => handleAskAboutArticle(item.title)}
                className="text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
                aria-label="Ask AI about this article"
              >
                <i className="fas fa-comments mr-1"></i>Ask about this
              </button>
              <button className="text-sm text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-colors">
                <i className="fas fa-share mr-1"></i>Share
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Insight Disclaimer */}
      {item.type === 'insight' && (
        <div className="mt-4 pt-3 border-t border-[var(--border)] text-xs text-[var(--muted-foreground)] italic">
          <i className="fas fa-info-circle mr-1"></i>
          Not advice.
        </div>
      )}
    </article>
  );

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
                onClick={() => setShowOnboarding(true)}
                className="px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--card-foreground)] hover:bg-[var(--muted)] rounded-[var(--radius-sm)] transition-colors"
              >
                <i className="fas fa-cog mr-2"></i>Preferences
              </button>
              <Link 
                href="/"
                className="px-4 py-2 text-sm font-medium text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-[var(--radius-sm)] transition-colors"
              >
                <i className="fas fa-arrow-left mr-2"></i>Dashboard
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
                    aria-label="Search news articles"
                  />
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--muted-foreground)]" aria-hidden="true"></i>
                </div>
              </div>

              {/* Categories Filter */}
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4">
                <h3 className="font-semibold text-[var(--card-foreground)] mb-4">Categories</h3>
                <div className="space-y-2" role="radiogroup" aria-label="News categories">
                  {newsCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-[var(--radius-sm)] text-left transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${
                        selectedCategory === category.id 
                          ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' 
                          : 'hover:bg-[var(--muted)] text-[var(--card-foreground)]'
                      }`}
                      role="radio"
                      aria-checked={selectedCategory === category.id}
                    >
                      <div className="flex items-center gap-2">
                        <i className={`fas ${getNewsIcon(category.id)} text-sm`} aria-hidden="true"></i>
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                      <span className="text-xs opacity-70">{category.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Enhanced Preferences Panel */}
              <PreferencesPanel 
                preferences={preferences}
                onUpdatePreferences={setPreferences}
                onResetPreferences={handleResetPreferences}
              />
            </div>
          </div>

          {/* Main Content - News Feed */}
          <div className="lg:col-span-6">
            <div className="bg-[var(--neutral-bg-alt)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6">
              
              {/* Call-to-Action Chip */}
              <div className="mb-6">
                <Link
                  href="/#due-diligence"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-accent-bg)] hover:bg-[var(--brand-accent-bg)]/90 text-white rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent-bg)] focus:ring-offset-2"
                >
                  <i className="fas fa-search text-xs" aria-hidden="true"></i>
                  Looking for company due diligence snapshots? → Start here
                </Link>
              </div>
              
              <div className="space-y-6">
              
              {/* Stats Bar */}
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div>
                      <div className="text-lg font-semibold text-[var(--card-foreground)]">
                        {filteredNews.length}
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)]">Articles</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-[var(--card-foreground)]">
                        {Math.round(filteredNews.reduce((acc, item) => acc + (item.relevance || 0), 0) / filteredNews.length * 100)}%
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)]">Avg Match</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-[var(--card-foreground)]">
                        {filteredNews.length * 4} min
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)]">Read Time</div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-[var(--muted-foreground)]">
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* News Articles */}
              <div className="space-y-6">
                {filteredNews.length > 0 ? (
                  filteredNews.map((item) => (
                    <div key={item.id} id={`article-${item.id}`}>
                      <NewsCard item={item} />
                    </div>
                  ))
                ) : (
                  <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--muted)] flex items-center justify-center">
                      <i className="fas fa-filter text-2xl text-[var(--muted-foreground)]" aria-hidden="true"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--card-foreground)] mb-2">
                      No results found
                    </h3>
                    <p className="text-[var(--muted-foreground)] mb-4">
                      Try adjusting your preferences to see more content.
                    </p>
                    <button
                      onClick={handleResetPreferences}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-[var(--radius-sm)] text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
                    >
                      <i className="fas fa-undo text-xs" aria-hidden="true"></i>
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
            </div>
          </div>

          {/* Right Sidebar - Phone Interface */}
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

              {/* Saved Items */}
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4">
                <h3 className="font-semibold text-[var(--card-foreground)] mb-4">
                  Saved Articles
                </h3>
                
                {savedArticles.length > 0 ? (
                  <div className="space-y-3">
                    {savedArticles.slice(0, 5).map((articleId) => {
                      const article = newsItemsData.find(item => item.id === articleId);
                      return article ? (
                        <button
                          key={article.id}
                          onClick={() => {
                            const element = document.getElementById(`article-${article.id}`);
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                          }}
                          className="w-full text-left p-3 rounded-[var(--radius-sm)] hover:bg-[var(--muted)] transition-colors group"
                          aria-label={`Scroll to ${article.title}`}
                        >
                          <h4 className="text-sm font-medium text-[var(--card-foreground)] line-clamp-2 group-hover:text-[var(--primary)]">
                            {article.title}
                          </h4>
                          <p className="text-xs text-[var(--muted-foreground)] mt-1">
                            {new Date(article.dateISO).toLocaleDateString()}
                          </p>
                        </button>
                      ) : null;
                    })}
                    
                    {savedArticles.length > 5 && (
                      <div className="text-center py-2 text-sm text-[var(--muted-foreground)]">
                        +{savedArticles.length - 5} more saved
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[var(--muted)] flex items-center justify-center">
                      <i className="fas fa-star text-[var(--muted-foreground)]" aria-hidden="true"></i>
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      You haven't saved any insights yet. Use the ⭐ Save button on any card.
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}