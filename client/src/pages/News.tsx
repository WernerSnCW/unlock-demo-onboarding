import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import AIChat from '../components/AIChat';

// Import mock data
import newsItemsData from '../mocks/newsItems.json';
import newsProfileData from '../mocks/newsOnboardingProfile.json';
import savedNewsData from '../mocks/savedNews.json';

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
  categories: string[];
  sectors: string[];
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
}

export default function News() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    frequency: 'daily',
    channels: { email: true, whatsapp: false, pushNotifications: true },
    categories: ['eis-seis', 'startup-funding'],
    sectors: ['Fintech', 'Healthcare', 'AI'],
    riskProfile: 'moderate'
  });

  const [filteredNews, setFilteredNews] = useState(newsItemsData);

  useEffect(() => {
    let filtered = newsItemsData;
    
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'your-sectors') {
        filtered = filtered.filter(item => newsProfileData.sectors.includes(item.sector));
      } else {
        filtered = filtered.filter(item => item.type === selectedCategory);
      }
    }
    
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    setFilteredNews(filtered);
  }, [selectedCategory, searchQuery]);

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
              <button className="text-sm text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-colors">
                <i className="fas fa-bookmark mr-1"></i>Save
              </button>
              <button className="text-sm text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-colors">
                <i className="fas fa-share mr-1"></i>Share
              </button>
            </div>
          </div>
        </div>
      </div>
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
            <div className="sticky top-6 space-y-6">
              
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

              {/* Categories Filter */}
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
                      <div className="flex items-center gap-2">
                        <i className={`fas ${getNewsIcon(category.id)} text-sm`}></i>
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                      <span className="text-xs opacity-70">{category.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Newsletter Preferences */}
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4">
                <h3 className="font-semibold text-[var(--card-foreground)] mb-4">Newsletter</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-[var(--card-foreground)] mb-2 block">
                      Frequency
                    </label>
                    <select 
                      value={preferences.frequency}
                      onChange={(e) => setPreferences(prev => ({ ...prev, frequency: e.target.value as any }))}
                      className="w-full p-2 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--card-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    >
                      <option value="daily">Daily Digest</option>
                      <option value="weekly">Weekly Summary</option>
                      <option value="monthly">Monthly Report</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-[var(--card-foreground)] mb-2 block">
                      Delivery Channels
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input 
                          type="checkbox"
                          checked={preferences.channels.email}
                          onChange={(e) => setPreferences(prev => ({
                            ...prev,
                            channels: { ...prev.channels, email: e.target.checked }
                          }))}
                          className="mr-2"
                        />
                        <span className="text-sm text-[var(--card-foreground)]">Email</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="checkbox"
                          checked={preferences.channels.whatsapp}
                          onChange={(e) => setPreferences(prev => ({
                            ...prev,
                            channels: { ...prev.channels, whatsapp: e.target.checked }
                          }))}
                          className="mr-2"
                        />
                        <span className="text-sm text-[var(--card-foreground)]">WhatsApp</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="checkbox"
                          checked={preferences.channels.pushNotifications}
                          onChange={(e) => setPreferences(prev => ({
                            ...prev,
                            channels: { ...prev.channels, pushNotifications: e.target.checked }
                          }))}
                          className="mr-2"
                        />
                        <span className="text-sm text-[var(--card-foreground)]">Push Notifications</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - News Feed */}
          <div className="lg:col-span-6">
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
                    <NewsCard key={item.id} item={item} />
                  ))
                ) : (
                  <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--muted)] flex items-center justify-center">
                      <i className="fas fa-search text-2xl text-[var(--muted-foreground)]"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--card-foreground)] mb-2">
                      No articles found
                    </h3>
                    <p className="text-[var(--muted-foreground)]">
                      Try adjusting your filters or search terms
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - AI Chat & Saved Items */}
          <div className="lg:col-span-3">
            <div className="sticky top-6 space-y-6">
              
              {/* AI Chat Assistant */}
              <AIChat seedPrompts={[
                "What are my tax allowances?",
                "Any red flags in fintech this week?",
                "Latest biotech trends?"
              ]} />

              {/* Saved Items */}
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4">
                <h3 className="font-semibold text-[var(--card-foreground)] mb-4">
                  Saved Articles
                </h3>
                
                {savedNewsData.length > 0 ? (
                  <div className="space-y-3">
                    {savedNewsData.map((saved) => (
                      <button
                        key={saved.id}
                        className="w-full text-left p-3 rounded-[var(--radius-sm)] hover:bg-[var(--muted)] transition-colors group"
                      >
                        <h4 className="text-sm font-medium text-[var(--card-foreground)] line-clamp-2 group-hover:text-[var(--primary)]">
                          {saved.title}
                        </h4>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">
                          {new Date(saved.dateISO).toLocaleDateString()}
                        </p>
                      </button>
                    ))}
                    
                    <button className="w-full text-center py-2 text-sm text-[var(--primary)] hover:text-[var(--primary)]/80 transition-colors">
                      View all saved →
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[var(--muted)] flex items-center justify-center">
                      <i className="fas fa-bookmark text-[var(--muted-foreground)]"></i>
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      No saved articles yet
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