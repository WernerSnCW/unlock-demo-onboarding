import { useState } from 'react';

interface PreferencesPanelProps {
  preferences: {
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
  };
  onUpdatePreferences: (preferences: any) => void;
  onResetPreferences: () => void;
}

const availableSectors = ['Fintech', 'Biotech', 'AI', 'Cleantech', 'PropTech', 'HealthTech'];
const availableRegions = ['UK', 'EU', 'US', 'Asia'];
const availableTopics = ['M&A', 'Rates', 'Filings', 'EIS/SEIS', 'Regulatory', 'Funding'];
const availableTickers = ['VOD.L', 'BARC.L', 'LLOY.L', 'BP.L', 'SHEL.L'];
const availableSources = ['Reuters', 'LSE RNS', 'GOV.UK', 'FT', 'TechCrunch', 'Bloomberg'];

const investmentTypes = [
  'Public Equity', 'Private Equity', 'Venture Capital', 'Angel Investing', 
  'Real Estate', 'Cryptocurrency', 'Bonds', 'REITs', 'Hedge Funds',
  'Commodities', 'Fine Art', 'Collectibles', 'Whisky & Spirits', 'Wine',
  'Classic Cars', 'Watches', 'Peer-to-Peer Lending', 'Infrastructure',
  'Forestry & Timberland', 'Precious Metals'
];

const investmentInterestTypes = [
  'Seed Stage Startups', 'Growth Stage Companies', 'Pre-IPO Opportunities',
  'ESG/Impact Investing', 'Technology Sector', 'Healthcare & Biotech',
  'Green Energy', 'Emerging Markets', 'Property Development',
  'Fintech Innovation', 'AI & Machine Learning', 'Whisky & Spirits Casks',
  'Fine Wine Investment', 'Classic Car Collecting', 'Luxury Watches',
  'Contemporary Art', 'Rare Collectibles', 'Infrastructure Projects',
  'Forestry & Timber', 'Precious Metals Trading', 'Cryptocurrency Trading'
];

const riskLevels = [
  { id: 'low', label: 'Low', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  { id: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  { id: 'high', label: 'High', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' }
];

export default function PreferencesPanel({ 
  preferences, 
  onUpdatePreferences, 
  onResetPreferences 
}: PreferencesPanelProps) {
  
  const [showToast, setShowToast] = useState(false);

  const showUpdateToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
    console.log({ 
      event: 'preferences_updated', 
      frequency: preferences.frequency,
      channels: preferences.channels,
      sectors: preferences.sectors,
      riskAppetite: preferences.riskAppetite,
      eisSeisEnabled: preferences.eisSeisEnabled
    });
  };

  const updateFrequency = (frequency: 'daily' | 'weekly' | 'monthly') => {
    onUpdatePreferences({ ...preferences, frequency });
    showUpdateToast();
    console.log({ event: 'newsletter_frequency_changed', value: frequency });
  };

  const updateChannels = (channel: keyof typeof preferences.channels, enabled: boolean) => {
    const newChannels = { ...preferences.channels, [channel]: enabled };
    onUpdatePreferences({ ...preferences, channels: newChannels });
    showUpdateToast();
    
    if (channel === 'whatsapp') {
      console.log({ event: 'whatsapp_alerts_toggled', value: enabled });
    }
  };

  const toggleSector = (sector: string) => {
    const currentSectors = preferences.sectors || [];
    const newSectors = currentSectors.includes(sector) 
      ? currentSectors.filter(s => s !== sector)
      : [...currentSectors, sector];
    onUpdatePreferences({ ...preferences, sectors: newSectors });
    showUpdateToast();
  };

  const toggleRiskLevel = (risk: 'low' | 'medium' | 'high') => {
    const currentRisk = preferences.riskAppetite || [];
    const newRiskAppetite = currentRisk.includes(risk)
      ? currentRisk.filter(r => r !== risk)
      : [...currentRisk, risk];
    onUpdatePreferences({ ...preferences, riskAppetite: newRiskAppetite });
    showUpdateToast();
  };

  const toggleEISSeisFilter = () => {
    onUpdatePreferences({ ...preferences, eisSeisEnabled: !preferences.eisSeisEnabled });
    showUpdateToast();
  };

  const toggleRegion = (region: string) => {
    const currentRegions = preferences.regions || [];
    const newRegions = currentRegions.includes(region)
      ? currentRegions.filter(r => r !== region)
      : [...currentRegions, region];
    onUpdatePreferences({ ...preferences, regions: newRegions });
    showUpdateToast();
  };

  const toggleTopic = (topic: string) => {
    const currentTopics = preferences.topics || [];
    const newTopics = currentTopics.includes(topic)
      ? currentTopics.filter(t => t !== topic)
      : [...currentTopics, topic];
    onUpdatePreferences({ ...preferences, topics: newTopics });
    showUpdateToast();
  };

  const toggleTicker = (ticker: string) => {
    const currentTickers = preferences.tickers || [];
    const newTickers = currentTickers.includes(ticker)
      ? currentTickers.filter(t => t !== ticker)
      : [...currentTickers, ticker];
    onUpdatePreferences({ ...preferences, tickers: newTickers });
    showUpdateToast();
  };

  const toggleIncludeSource = (source: string) => {
    const currentSources = preferences.includeSources || [];
    const newSources = currentSources.includes(source)
      ? currentSources.filter(s => s !== source)
      : [...currentSources, source];
    onUpdatePreferences({ ...preferences, includeSources: newSources });
    showUpdateToast();
  };

  const toggleExcludeSource = (source: string) => {
    const currentExcludeSources = preferences.excludeSources || [];
    const newSources = currentExcludeSources.includes(source)
      ? currentExcludeSources.filter(s => s !== source)
      : [...currentExcludeSources, source];
    onUpdatePreferences({ ...preferences, excludeSources: newSources });
    showUpdateToast();
  };

  const toggleDedupe = () => {
    onUpdatePreferences({ ...preferences, dedupe: !preferences.dedupe });
    showUpdateToast();
  };

  const toggleHideLowValue = () => {
    onUpdatePreferences({ ...preferences, hideLowValue: !preferences.hideLowValue });
    showUpdateToast();
  };

  const toggleExistingInvestment = (investment: string) => {
    const currentInvestments = preferences.existingInvestments || [];
    const newInvestments = currentInvestments.includes(investment)
      ? currentInvestments.filter(i => i !== investment)
      : [...currentInvestments, investment];
    onUpdatePreferences({ ...preferences, existingInvestments: newInvestments });
    showUpdateToast();
  };

  const toggleInvestmentInterest = (interest: string) => {
    const currentInterests = preferences.investmentInterests || [];
    const newInterests = currentInterests.includes(interest)
      ? currentInterests.filter(i => i !== interest)
      : [...currentInterests, interest];
    onUpdatePreferences({ ...preferences, investmentInterests: newInterests });
    showUpdateToast();
  };

  return (
    <div className="space-y-6" data-preferences-panel>
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-[var(--success)] text-[var(--success-foreground)] px-4 py-2 rounded-[var(--radius-md)] shadow-lg z-50 transition-all">
          <div className="flex items-center gap-2">
            <i className="fas fa-check-circle"></i>
            <span className="text-sm font-medium">Preferences updated</span>
          </div>
        </div>
      )}

      {/* Newsletter Frequency */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4">
        <h3 className="font-semibold text-[var(--card-foreground)] mb-4">Newsletter Frequency</h3>
        <div className="flex rounded-[var(--radius-sm)] bg-[var(--muted)] p-1" role="radiogroup" aria-label="Newsletter frequency">
          {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
            <button
              key={freq}
              onClick={() => updateFrequency(freq)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-[var(--radius-sm)] transition-colors ${
                preferences.frequency === freq
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--card-foreground)]'
              }`}
              role="radio"
              aria-checked={preferences.frequency === freq}
            >
              {freq.charAt(0).toUpperCase() + freq.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Channels */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4">
        <h3 className="font-semibold text-[var(--card-foreground)] mb-4">Alert Channels</h3>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Alert channels">
          {[
            { key: 'email', label: 'Email', icon: 'fa-envelope' },
            { key: 'whatsapp', label: 'WhatsApp', icon: 'fa-whatsapp' },
            { key: 'pushNotifications', label: 'Push', icon: 'fa-bell' }
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => updateChannels(key as keyof typeof preferences.channels, !preferences.channels[key as keyof typeof preferences.channels])}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                preferences.channels[key as keyof typeof preferences.channels]
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]'
              }`}
              aria-pressed={preferences.channels[key as keyof typeof preferences.channels]}
            >
              <i className={`fas ${icon} text-xs`}></i>
              {label}
            </button>
          ))}
        </div>
        {preferences.channels.whatsapp && (
          <p className="text-xs text-[var(--muted-foreground)] mt-3 p-2 bg-[var(--muted)] rounded-[var(--radius-sm)]">
            <i className="fas fa-info-circle mr-1"></i>
            Verification coming soon.
          </p>
        )}
      </div>

      {/* Sector Filters */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4">
        <h3 className="font-semibold text-[var(--card-foreground)] mb-4">Sector Filters</h3>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Sector filters">
          {availableSectors.map((sector) => (
            <button
              key={sector}
              onClick={() => toggleSector(sector)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                (preferences.sectors || []).includes(sector)
                  ? 'bg-[var(--secondary)] text-[var(--secondary-foreground)]'
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]'
              }`}
              aria-pressed={(preferences.sectors || []).includes(sector)}
            >
              <i className={`fas ${(preferences.sectors || []).includes(sector) ? 'fa-check-circle' : 'fa-circle'} text-xs`}></i>
              {sector}
            </button>
          ))}
        </div>
      </div>

      {/* Risk Appetite Filters */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4">
        <h3 className="font-semibold text-[var(--card-foreground)] mb-4">Risk Appetite</h3>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Risk appetite filters">
          {riskLevels.map((risk) => (
            <button
              key={risk.id}
              onClick={() => toggleRiskLevel(risk.id as 'low' | 'medium' | 'high')}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                (preferences.riskAppetite || []).includes(risk.id as 'low' | 'medium' | 'high')
                  ? risk.color
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]'
              }`}
              aria-pressed={(preferences.riskAppetite || []).includes(risk.id as 'low' | 'medium' | 'high')}
            >
              <i className={`fas ${(preferences.riskAppetite || []).includes(risk.id as 'low' | 'medium' | 'high') ? 'fa-check-circle' : 'fa-circle'} text-xs`}></i>
              {risk.label}
            </button>
          ))}
        </div>
      </div>

      {/* Current Investment Holdings */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4">
        <h3 className="font-semibold text-[var(--card-foreground)] mb-4">Current Investment Holdings</h3>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">Select the types of investments you currently hold</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Current investment holdings">
          {investmentTypes.map((investment) => (
            <button
              key={investment}
              onClick={() => toggleExistingInvestment(investment)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                (preferences.existingInvestments || []).includes(investment)
                  ? 'bg-[var(--info)] text-[var(--info-foreground)]'
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--info)] hover:text-[var(--info-foreground)]'
              }`}
              aria-pressed={(preferences.existingInvestments || []).includes(investment)}
            >
              <i className={`fas ${(preferences.existingInvestments || []).includes(investment) ? 'fa-check-circle' : 'fa-circle'} text-xs`}></i>
              {investment}
            </button>
          ))}
        </div>
      </div>

      {/* Investment Interests */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4">
        <h3 className="font-semibold text-[var(--card-foreground)] mb-4">Investment Interests</h3>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">Select the types of investments you're interested in exploring</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Investment interests">
          {investmentInterestTypes.map((interest) => (
            <button
              key={interest}
              onClick={() => toggleInvestmentInterest(interest)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                (preferences.investmentInterests || []).includes(interest)
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)]'
              }`}
              aria-pressed={(preferences.investmentInterests || []).includes(interest)}
            >
              <i className={`fas ${(preferences.investmentInterests || []).includes(interest) ? 'fa-check-circle' : 'fa-circle'} text-xs`}></i>
              {interest}
            </button>
          ))}
        </div>
      </div>

      {/* EIS/SEIS Toggle */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[var(--card-foreground)]">EIS/SEIS Updates</h3>
            <p className="text-sm text-[var(--muted-foreground)]">Show tax-efficient investment updates</p>
          </div>
          <button
            onClick={toggleEISSeisFilter}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 ${
              preferences.eisSeisEnabled ? 'bg-[var(--primary)]' : 'bg-[var(--muted)]'
            }`}
            role="switch"
            aria-checked={preferences.eisSeisEnabled}
            aria-label="Toggle EIS/SEIS updates"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                preferences.eisSeisEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Interests - Tickers */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4">
        <h3 className="font-semibold text-[var(--card-foreground)] mb-4">Tickers</h3>
        <div className="flex flex-wrap gap-2">
          {availableTickers.map((ticker) => (
            <button
              key={ticker}
              onClick={() => toggleTicker(ticker)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                (preferences.tickers || []).includes(ticker)
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]'
              }`}
              aria-pressed={(preferences.tickers || []).includes(ticker)}
            >
              <i className={`fas ${(preferences.tickers || []).includes(ticker) ? 'fa-check-circle' : 'fa-circle'} text-xs`}></i>
              {ticker}
            </button>
          ))}
        </div>
      </div>

      {/* Interests - Regions */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4">
        <h3 className="font-semibold text-[var(--card-foreground)] mb-4">Regions</h3>
        <div className="flex flex-wrap gap-2">
          {availableRegions.map((region) => (
            <button
              key={region}
              onClick={() => toggleRegion(region)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                (preferences.regions || []).includes(region)
                  ? 'bg-[var(--secondary)] text-[var(--secondary-foreground)]'
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]'
              }`}
              aria-pressed={(preferences.regions || []).includes(region)}
            >
              <i className={`fas ${(preferences.regions || []).includes(region) ? 'fa-check-circle' : 'fa-circle'} text-xs`}></i>
              {region}
            </button>
          ))}
        </div>
      </div>

      {/* Interests - Topics */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4">
        <h3 className="font-semibold text-[var(--card-foreground)] mb-4">Topics</h3>
        <div className="flex flex-wrap gap-2">
          {availableTopics.map((topic) => (
            <button
              key={topic}
              onClick={() => toggleTopic(topic)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                (preferences.topics || []).includes(topic)
                  ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]'
              }`}
              aria-pressed={(preferences.topics || []).includes(topic)}
            >
              <i className={`fas ${(preferences.topics || []).includes(topic) ? 'fa-check-circle' : 'fa-circle'} text-xs`}></i>
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Sources - Include */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4">
        <h3 className="font-semibold text-[var(--card-foreground)] mb-4">Include Sources</h3>
        <div className="flex flex-wrap gap-2">
          {availableSources.map((source) => (
            <button
              key={source}
              onClick={() => toggleIncludeSource(source)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                (preferences.includeSources || []).includes(source)
                  ? 'bg-[var(--success)] text-[var(--success-foreground)]'
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--success)] hover:text-[var(--success-foreground)]'
              }`}
              aria-pressed={(preferences.includeSources || []).includes(source)}
            >
              <i className={`fas ${(preferences.includeSources || []).includes(source) ? 'fa-plus-circle' : 'fa-circle'} text-xs`}></i>
              {source}
            </button>
          ))}
        </div>
      </div>

      {/* Sources - Exclude */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4">
        <h3 className="font-semibold text-[var(--card-foreground)] mb-4">Exclude Sources</h3>
        <div className="flex flex-wrap gap-2">
          {availableSources.map((source) => (
            <button
              key={source}
              onClick={() => toggleExcludeSource(source)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                (preferences.excludeSources || []).includes(source)
                  ? 'bg-[var(--destructive)] text-[var(--destructive-foreground)]'
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--destructive)] hover:text-[var(--destructive-foreground)]'
              }`}
              aria-pressed={(preferences.excludeSources || []).includes(source)}
            >
              <i className={`fas ${(preferences.excludeSources || []).includes(source) ? 'fa-minus-circle' : 'fa-circle'} text-xs`}></i>
              {source}
            </button>
          ))}
        </div>
      </div>

      {/* Noise Control */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4">
        <h3 className="font-semibold text-[var(--card-foreground)] mb-4">Noise Control</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-[var(--card-foreground)]">De-duplicate similar stories</h4>
              <p className="text-sm text-[var(--muted-foreground)]">Hide articles with similar content</p>
            </div>
            <button
              onClick={toggleDedupe}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 ${
                preferences.dedupe ? 'bg-[var(--primary)]' : 'bg-[var(--muted)]'
              }`}
              role="switch"
              aria-checked={preferences.dedupe}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                  preferences.dedupe ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-[var(--card-foreground)]">Hide low-value items</h4>
              <p className="text-sm text-[var(--muted-foreground)]">Filter out low-relevance content</p>
            </div>
            <button
              onClick={toggleHideLowValue}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 ${
                preferences.hideLowValue ? 'bg-[var(--primary)]' : 'bg-[var(--muted)]'
              }`}
              role="switch"
              aria-checked={preferences.hideLowValue}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                  preferences.hideLowValue ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4">
        <button
          onClick={onResetPreferences}
          className="w-full px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] border border-[var(--border)] rounded-[var(--radius-sm)] hover:bg-[var(--muted)] hover:text-[var(--card-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 transition-colors"
        >
          <i className="fas fa-undo mr-2"></i>
          Reset to Defaults
        </button>
      </div>

      {/* GDPR Notice */}
      <div className="text-xs text-[var(--muted-foreground)] p-3 bg-[var(--muted)] rounded-[var(--radius-sm)]">
        <i className="fas fa-shield-alt mr-1"></i>
        In this prototype, preferences are stored locally only.
      </div>
      
      {/* Live Region for Accessibility */}
      <div aria-live="polite" aria-label="Preferences status" className="sr-only">
        {showToast && 'Preferences have been updated'}
      </div>
    </div>
  );
}