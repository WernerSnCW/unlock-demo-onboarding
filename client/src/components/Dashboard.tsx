import { useState, useEffect } from 'react';
import WelcomePanel from './WelcomePanel';
import NewsFeed from './NewsFeed';
import Watchlist from './Watchlist';
import UpgradeCard from './UpgradeCard';
import AlertsPreferences from './AlertsPreferences';
import NewsletterControls from './NewsletterControls';
import QuickTools from './QuickTools';
import MiniDock from './MiniDock';
import ToolModal from './ToolModal';
import DDSnapshotHero from './DDSnapshotHero';
import { RequestsMiniPanel } from './due/RequestsMiniPanel';
import { useInvestor } from '../contexts/InvestorContext';
import { useQuery } from '@tanstack/react-query';

// Mock data imports
import onboardingProfileData from '../mocks/onboardingProfile.json';
import newsFeedData from '../mocks/newsFeed.json';
import watchlistData from '../mocks/watchlist.json';

interface Profile {
  firstName: string;
  lastName?: string;
  email?: string;
  investorType: "angel" | "syndicate" | "advisor" | "other";
  sectors: string[];
  riskProfile: "low" | "medium" | "high";
  newsletterFrequency: "daily" | "weekly" | "monthly";
  whatsappAlerts: boolean;
  profilePicture?: string | null;
  // Investment Activity
  reportsViewed: number;
  questionsAsked: number;
  syndicatesJoined: number;
  // Portfolio Summary  
  totalHoldingsValue?: string;
  topSector?: { name: string; percentage: number };
  portfolioLastUpdated?: string;
  // Trust & Community
  reputationScore: number;
  badges: string[];
  // Plan
  currentPlan: "free" | "premium";
  // Investor Preferences
  existingInvestments?: string[];
  regions?: string[];
}

export default function Dashboard() {
  const { selectedInvestor } = useInvestor();
  const [profile, setProfile] = useState(onboardingProfileData as Profile);
  const [newsItems] = useState(newsFeedData);
  const [companies] = useState(watchlistData);
  const [loading, setLoading] = useState(true);
  const [dockVisible, setDockVisible] = useState(true);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch investor preferences if investor is selected
  const { data: investorPreferences } = useQuery({
    queryKey: ['/api/investors', selectedInvestor?.userId, 'preferences'],
    enabled: !!selectedInvestor?.userId,
  });

  // Create profile from selected investor or use default
  const currentProfile = selectedInvestor ? {
    ...profile,
    firstName: selectedInvestor.name.split(' ')[0],
    lastName: selectedInvestor.name.split(' ').slice(1).join(' ') || '',
    email: `${selectedInvestor.name.toLowerCase().replace(/\s+/g, '.')}@demo.com`,
    investorType: selectedInvestor.investorType?.toLowerCase() as "angel" | "syndicate" | "advisor" | "other" || 'angel',
    existingInvestments: investorPreferences?.existingInvestments || [],
    regions: investorPreferences?.regions || []
  } : profile;

  const handlePreferencesChange = ({ newsletterFrequency, whatsappAlerts }: { 
    newsletterFrequency: string; 
    whatsappAlerts: boolean 
  }) => {
    setProfile(prev => ({
      ...prev,
      newsletterFrequency: newsletterFrequency as any,
      whatsappAlerts
    }));
    
    // Log telemetry
    console.log({ event: "newsletter_frequency_changed", value: newsletterFrequency });
    console.log({ event: "whatsapp_alerts_toggled", value: whatsappAlerts });
    
    // Show toast
    showToast(`Preferences updated: ${newsletterFrequency} newsletter, WhatsApp ${whatsappAlerts ? 'on' : 'off'}`);
  };

  const handleFrequencyChange = (frequency: string) => {
    handlePreferencesChange({ 
      newsletterFrequency: frequency, 
      whatsappAlerts: profile.whatsappAlerts 
    });
  };

  const handleWhatsappToggle = (enabled: boolean) => {
    handlePreferencesChange({ 
      newsletterFrequency: profile.newsletterFrequency, 
      whatsappAlerts: enabled 
    });
  };

  const handleLoadMore = () => {
    console.log('Loading more news items...');
  };

  const handleToolOpen = (toolId: string) => {
    setSelectedTool(toolId);
    setIsToolModalOpen(true);
  };

  const handleToolModalClose = () => {
    setIsToolModalOpen(false);
    setSelectedTool(null);
  };

  const toggleDock = () => {
    setDockVisible(!dockVisible);
  };

  const showToast = (message: string) => {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 shadow-lg z-50';
    toast.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-sm text-[var(--card-foreground)]">${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="text-[var(--muted-foreground)] hover:text-[var(--card-foreground)] ml-2">×</button>
      </div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column Skeleton */}
            <div className="lg:col-span-3">
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-6 animate-pulse">
                <div className="h-4 bg-[var(--muted)] rounded mb-4"></div>
                <div className="h-3 bg-[var(--muted)] rounded mb-2"></div>
                <div className="h-3 bg-[var(--muted)] rounded w-2/3"></div>
              </div>
            </div>
            
            {/* Center Column Skeleton */}
            <div className="lg:col-span-6">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-4 animate-pulse">
                    <div className="h-4 bg-[var(--muted)] rounded mb-2"></div>
                    <div className="h-3 bg-[var(--muted)] rounded mb-1"></div>
                    <div className="h-3 bg-[var(--muted)] rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right Column Skeleton */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-6 animate-pulse">
                  <div className="h-4 bg-[var(--muted)] rounded mb-4"></div>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-8 bg-[var(--muted)] rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-[1280px] mx-auto px-6 py-6">
        {/* Desktop: Split-screen, Tablet: Split-screen, Mobile: Single column */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-8">
          
          {/* Left Column - "Your World" */}
          <div className="order-1 space-y-6">
            <WelcomePanel 
              profile={currentProfile} 
              onChangePreferences={handlePreferencesChange}
              onEditSectors={() => console.log('Edit sectors clicked')}
              onUpgrade={() => console.log('Upgrade clicked')}
            />

            <div className="md:hidden">
              <DDSnapshotHero onToolOpen={handleToolOpen} />
            </div>
            <div className="md:hidden">
              <NewsFeed
                items={newsItems}
                onLoadMore={handleLoadMore}
                onToolOpen={handleToolOpen}
              />
            </div>
            <AlertsPreferences 
              frequency={profile.newsletterFrequency}
              whatsappEnabled={profile.whatsappAlerts}
              onChangeFrequency={handleFrequencyChange}
              onToggleWhatsapp={handleWhatsappToggle}
            />
            <Watchlist companies={companies} onToolOpen={handleToolOpen} />
            <UpgradeCard />
          </div>

          {/* Right Column - "The Market" (hidden on mobile) */}
          <div className="hidden md:block order-3 md:order-2 space-y-6">
            <DDSnapshotHero onToolOpen={handleToolOpen} />
            <RequestsMiniPanel />
            <QuickTools onToolOpen={handleToolOpen} />

            <NewsFeed
              items={newsItems}
              onLoadMore={handleLoadMore}
              onToolOpen={handleToolOpen}
            />
          </div>
        </div>
      </div>

      {/* Mini Dock FAB */}
      <MiniDock
        isVisible={dockVisible}
        onToggle={toggleDock}
        onToolOpen={handleToolOpen}
      />

      {/* Tool Modal */}
      {selectedTool && (
        <ToolModal
          isOpen={isToolModalOpen}
          onClose={handleToolModalClose}
          toolId={selectedTool}
        />
      )}
    </div>
  );
}