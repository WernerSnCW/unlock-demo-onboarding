import { useState } from 'react';
import { useLocation } from 'wouter';
import { User, PieChart, Settings, Bell, Shield } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileHeader, DEFAULT_PROFILE } from '@/components/profile/ProfileHeader';
import { PortfolioAnalytics } from '@/components/profile/PortfolioAnalytics';
import { PortfolioTable } from '@/components/profile/PortfolioTable';
import { PortfolioUploader } from '@/components/profile/PortfolioUploader';
import { AnalystOpinionsPanel } from '@/components/profile/AnalystOpinionsPanel';
import { usePortfolioStore } from '@/state/portfolioStore';

export default function Profile() {
  const [location] = useLocation();
  const { positions } = usePortfolioStore();
  
  // Determine initial tab from URL
  const getInitialTab = () => {
    if (location.includes('portfolio')) return 'portfolio';
    return 'overview';
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab());

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Profile widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Your Sectors
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Technology', 'Healthcare', 'Fintech', 'AI/ML', 'Climate Tech'].map((sector) => (
                <button
                  key={sector}
                  className="px-3 py-1 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-[var(--primary)] hover:text-white transition-colors"
                >
                  {sector}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Edit your preferred sectors to personalize your news feed and deal recommendations.
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Watchlists</h4>
            <div className="text-2xl font-bold text-[var(--primary)] mb-1">3</div>
            <div className="text-xs text-gray-500 dark:text-gray-500">Active lists</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Saved Items</h4>
            <div className="text-2xl font-bold text-[var(--secondary)] mb-1">12</div>
            <div className="text-xs text-gray-500 dark:text-gray-500">Due diligence reports</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Recent Actions</h4>
            <div className="space-y-2">
              <div className="text-xs text-gray-600 dark:text-gray-400">
                • Requested snapshot: TechCorp AI
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                • Asked question: Market size
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                • Saved syndicate: DeepTech Ventures
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const PortfolioTab = () => (
    <div className="space-y-6">
      {positions.length === 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PortfolioUploader onUploadComplete={() => {/* Portfolio updated */}} />
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Why Upload Your Portfolio?
            </h3>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-[var(--primary)] rounded-full mt-2 flex-shrink-0" />
                <span>Get analyst opinions for your holdings</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-[var(--primary)] rounded-full mt-2 flex-shrink-0" />
                <span>See relevant news when browsing stories</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-[var(--primary)] rounded-full mt-2 flex-shrink-0" />
                <span>Risk analysis and concentration alerts</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-[var(--primary)] rounded-full mt-2 flex-shrink-0" />
                <span>Match with relevant syndicates</span>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <PortfolioAnalytics />
            <PortfolioTable />
          </div>
          
          <div>
            <AnalystOpinionsPanel 
              tickers={positions.map(p => p.ticker)}
              compact={true}
            />
          </div>
        </div>
      )}
    </div>
  );

  const PreferencesTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Investment Preferences
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Preferred Investment Stages
            </label>
            <div className="flex flex-wrap gap-2">
              {['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Growth'].map((stage) => (
                <button
                  key={stage}
                  className="px-3 py-1 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-[var(--primary)] hover:text-white transition-colors"
                >
                  {stage}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Geographic Focus
            </label>
            <div className="flex flex-wrap gap-2">
              {['UK', 'US', 'EU', 'Asia'].map((region) => (
                <button
                  key={region}
                  className="px-3 py-1 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-[var(--primary)] hover:text-white transition-colors"
                >
                  {region}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const NotificationsTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Notification Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                New Syndicate Opportunities
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Get notified about syndicates matching your criteria
              </div>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                Portfolio Alerts
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Analyst upgrades/downgrades for your holdings
              </div>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                Due Diligence Updates
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                New reports for companies you're tracking
              </div>
            </div>
            <input type="checkbox" className="rounded" />
          </div>
        </div>
      </div>
    </div>
  );

  const SecurityTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Privacy & Security
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                Private Portfolio
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Keep your portfolio data private
              </div>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                Anonymous Matching
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Allow anonymized matching for "investors like you" features
              </div>
            </div>
            <input type="checkbox" className="rounded" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <ProfileHeader 
            profile={DEFAULT_PROFILE}
            className="mb-8"
          />

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8 bg-gray-200 dark:bg-gray-800 p-1 rounded-xl border border-gray-300 dark:border-gray-600">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white data-[state=active]:shadow-md text-gray-700 dark:text-gray-300 font-medium transition-all duration-200 rounded-xl"
              >
                <User className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="portfolio" 
                className="data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white data-[state=active]:shadow-md text-gray-700 dark:text-gray-300 font-medium transition-all duration-200 rounded-xl"
              >
                <PieChart className="h-4 w-4 mr-2" />
                Portfolio
              </TabsTrigger>
              <TabsTrigger 
                value="preferences" 
                className="data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white data-[state=active]:shadow-md text-gray-700 dark:text-gray-300 font-medium transition-all duration-200 rounded-xl"
              >
                <Settings className="h-4 w-4 mr-2" />
                Preferences
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white data-[state=active]:shadow-md text-gray-700 dark:text-gray-300 font-medium transition-all duration-200 rounded-xl"
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white data-[state=active]:shadow-md text-gray-700 dark:text-gray-300 font-medium transition-all duration-200 rounded-xl"
              >
                <Shield className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <OverviewTab />
            </TabsContent>

            <TabsContent value="portfolio">
              <PortfolioTab />
            </TabsContent>

            <TabsContent value="preferences">
              <PreferencesTab />
            </TabsContent>

            <TabsContent value="notifications">
              <NotificationsTab />
            </TabsContent>

            <TabsContent value="security">
              <SecurityTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}