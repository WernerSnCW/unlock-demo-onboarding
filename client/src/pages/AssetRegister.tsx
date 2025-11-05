import { useState } from 'react';
import { Search, FileText, Upload, Download, Printer, X, Command, HelpCircle, Info, TrendingUp, Wallet, Bitcoin, Home, Briefcase, Sparkles, FileEdit, Building2, CreditCard, Landmark, Car, Plug, PlugZap, FileStack } from 'lucide-react';
import Header from '../components/Header';
import { AssetRegisterTour, TourBeacon } from '../components/AssetRegisterTour';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';

export default function AssetRegister() {
  const [activeTab, setActiveTab] = useState('holdings');
  const [detailDrawer, setDetailDrawer] = useState<string | null>(null);
  const [docLightbox, setDocLightbox] = useState(false);
  const [addAssetModal, setAddAssetModal] = useState(false);
  const [addLiabilityModal, setAddLiabilityModal] = useState(false);
  const [density, setDensity] = useState<'normal' | 'compact'>('normal');
  const [tourOpen, setTourOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      
      <div className={`${density === 'compact' ? 'text-sm' : ''}`}>
        {/* Skip to content for accessibility */}
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white dark:bg-gray-800 focus:text-black dark:text-white focus:rounded-lg">
          Skip to content
        </a>

        <div className="grid grid-cols-[300px_1fr]">
        {/* Sidebar */}
        <aside className="bg-[var(--card)] border-r border-[var(--border)] p-6 sticky top-0 h-screen overflow-auto">
          <div className="mb-6">
            <h1 className="text-lg font-bold text-[var(--foreground)]">Asset Register</h1>
          </div>

          <TooltipProvider>
            <div className="space-y-6">
              <div id="tour-valuation">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">Valuation Snapshot</h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                        <Info className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">Current portfolio valuation as of the latest reconciliation date with pricing details</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              <div className="text-sm text-[var(--foreground)] mb-2">As at: 31 Oct 2025</div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--muted)] border border-[var(--border)] rounded-full text-xs text-[var(--muted-foreground)] mb-2">
                EOD prices • GBP
              </div>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Last reconcile: Oct 2025 (Vanguard, AJ Bell). Pending: Trading 212.
              </p>
            </div>

            <div id="tour-entities">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">Entities</h3>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">Legal entities that own assets: personal, spouse, company structures, etc.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-[var(--muted)] border border-[var(--border)] rounded-full text-xs text-[var(--muted-foreground)]">Personal (100%)</span>
                <span className="px-3 py-1.5 bg-[var(--muted)] border border-[var(--border)] rounded-full text-xs text-[var(--muted-foreground)]">Spouse (—)</span>
                <span className="px-3 py-1.5 bg-[var(--muted)] border border-[var(--border)] rounded-full text-xs text-[var(--muted-foreground)]">Ltd (—)</span>
              </div>
            </div>

            <div id="tour-wrappers">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">Wrappers</h3>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">Tax-advantaged accounts like ISA, SIPP, GIA, or personal holdings</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-[var(--muted)] border border-[var(--border)] rounded-full text-xs text-[var(--muted-foreground)]">ISA</span>
                <span className="px-3 py-1.5 bg-[var(--muted)] border border-[var(--border)] rounded-full text-xs text-[var(--muted-foreground)]">SIPP</span>
                <span className="px-3 py-1.5 bg-[var(--muted)] border border-[var(--border)] rounded-full text-xs text-[var(--muted-foreground)]">GIA</span>
                <span className="px-3 py-1.5 bg-[var(--muted)] border border-[var(--border)] rounded-full text-xs text-[var(--muted-foreground)]">Personal</span>
              </div>
            </div>

            <div id="tour-custodians">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">Custodians / Wallets</h3>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">Financial institutions and wallets holding your assets - the source of truth for reconciliation</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="space-y-2">
                <button className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:border-[var(--primary)] hover:shadow-md transition-all text-left" data-testid="custodian-vanguard">
                  Vanguard Investor UK
                </button>
                <button className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:border-[var(--primary)] hover:shadow-md transition-all text-left" data-testid="custodian-ajbell">
                  AJ Bell
                </button>
                <button className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:border-[var(--primary)] hover:shadow-md transition-all text-left" data-testid="custodian-hsbc">
                  HSBC Savings
                </button>
                <button className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:border-[var(--primary)] hover:shadow-md transition-all text-left" data-testid="custodian-ledger">
                  Ledger – Main
                </button>
              </div>
            </div>

            <div id="tour-beneficiary">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">Beneficiary (Estate)</h3>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">Estate planning settings: life-beat checks and beneficiary access to asset information</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="space-y-2 mb-3">
                <div className="px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-sm">
                  <span className="text-[var(--muted-foreground)]">Life-beat check:</span>{' '}
                  <span className="text-[var(--foreground)] font-medium">Monthly</span>
                </div>
                <div className="px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-sm">
                  <span className="text-[var(--muted-foreground)]">Fallback email:</span>{' '}
                  <span className="text-[var(--foreground)] font-medium">spouse@example.com</span>
                </div>
                <div className="px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-sm">
                  <span className="text-[var(--muted-foreground)]">Package:</span>{' '}
                  <span className="text-[var(--foreground)] font-medium">Holdings + Docs</span>
                </div>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                When inactivity exceeds the life-beat, Unlock can release a read-only pack to your beneficiary (prototype view).
              </p>
            </div>

            <div id="tour-quick-actions">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">Quick Actions</h3>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">Common actions for managing your asset register: add holdings, import data, upload documents</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="space-y-2">
                <button 
                  onClick={() => setAddAssetModal(true)}
                  className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:border-[var(--primary)] hover:shadow-md transition-all flex items-center gap-2"
                  data-testid="button-add-asset"
                  title="Add a new asset to your portfolio"
                >
                  ＋ Add asset
                </button>
                <button 
                  onClick={() => setAddLiabilityModal(true)}
                  className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:border-[var(--primary)] hover:shadow-md transition-all flex items-center gap-2" 
                  data-testid="button-add-liability"
                  title="Record a new liability such as loans or mortgages"
                >
                  − Add liability
                </button>
                <button 
                  className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:border-[var(--primary)] hover:shadow-md transition-all flex items-center gap-2" 
                  data-testid="button-import-csv"
                  title="Import holdings data from a CSV file"
                >
                  ⇪ Import CSV
                </button>
                <button 
                  className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:border-[var(--primary)] hover:shadow-md transition-all flex items-center gap-2" 
                  data-testid="button-ai-import"
                  title="Use AI to automatically extract holdings from documents"
                >
                  ✨ AI Import
                </button>
                <button 
                  onClick={() => setDocLightbox(true)}
                  className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:border-[var(--primary)] hover:shadow-md transition-all flex items-center gap-2"
                  data-testid="button-upload-evidence"
                  title="Upload supporting documents like statements or valuations"
                >
                  <Upload className="h-4 w-4" /> Upload evidence
                </button>
                <button 
                  id="tour-density"
                  onClick={() => setDensity(density === 'normal' ? 'compact' : 'normal')}
                  className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:border-[var(--primary)] hover:shadow-md transition-all flex items-center gap-2"
                  data-testid="button-density"
                  title="Toggle between normal and compact table row spacing"
                >
                  ⇕ Density: {density === 'normal' ? 'Normal' : 'Compact'}
                </button>
              </div>
            </div>
          </div>
          </TooltipProvider>
        </aside>

        {/* Main Content */}
        <main className="min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-20 backdrop-blur-md bg-[var(--background)]/80 border-b border-[var(--border)] px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
            <div id="tour-search" className="relative flex-1 min-w-0 max-w-2xl">
              <input
                type="search"
                placeholder="Search instruments, accounts, documents…"
                className="w-full bg-[var(--input)] border border-[var(--border)] px-4 py-3 pr-10 text-[var(--foreground)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                data-testid="input-search"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" />
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <select id="tour-currency" className="bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" data-testid="select-currency">
                <option>GBP</option>
                <option>EUR</option>
                <option>USD</option>
              </select>

              <button id="tour-reconciled" className="px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-[var(--foreground)] flex items-center gap-2" data-testid="button-status">
                <span className="w-2 h-2 rounded-full bg-[var(--success)]"></span>
                Reconciled
              </button>

              <button id="tour-export" className="px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors" data-testid="button-export">
                <Download className="h-4 w-4" />
              </button>

              <button 
                id="tour-print"
                onClick={handlePrint}
                className="px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                data-testid="button-print"
              >
                <Printer className="h-4 w-4" />
              </button>

              <button 
                onClick={() => setTourOpen(true)}
                className="px-4 py-2.5 bg-[var(--primary)] text-white border border-[var(--primary)] rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shadow-sm"
                data-testid="button-help-tour"
                title="Take a tour"
              >
                <HelpCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Help</span>
              </button>
            </div>
          </header>

          <div className="p-6" id="main">
            {/* KPI Tiles */}
            <TooltipProvider>
              <div id="tour-kpis" className="grid grid-cols-6 gap-4 mb-6">
                <KPITile 
                  label="Total Portfolio" 
                  value="£847,200" 
                  delta="+£12,400 (1.5%)" 
                  positive 
                  tooltip="Combined value of all your assets across holdings, property, and alternatives"
                  data-testid="kpi-total" 
                />
                <KPITile 
                  label="Liquid" 
                  value="£612,300" 
                  sublabel="Cash + listed" 
                  tooltip="Cash and publicly traded securities that can be quickly converted to cash"
                  data-testid="kpi-liquid" 
                />
                <KPITile 
                  label="Property" 
                  value="£195,000" 
                  sublabel="Last updated: Oct 2025" 
                  tooltip="Total value of all property holdings based on latest valuations"
                  data-testid="kpi-property" 
                />
                <KPITile 
                  label="Alternatives" 
                  value="£39,900" 
                  sublabel="Crypto & private" 
                  tooltip="Non-traditional investments including cryptocurrency and private equity"
                  data-testid="kpi-alternatives" 
                />
                <KPITile 
                  label="Unrealised G/L" 
                  value="£94,100" 
                  delta="+18.2% since cost" 
                  positive 
                  tooltip="Unrealised gains or losses - the difference between current value and cost basis"
                  data-testid="kpi-gl" 
                />
                <KPITile 
                  label="Rebalance Status" 
                  value="2 buckets" 
                  delta="out of band" 
                  negative 
                  tooltip="Number of asset allocations that are outside your target bands and need rebalancing"
                  data-testid="kpi-rebalance" 
                />
              </div>
            </TooltipProvider>

            {/* Tabs */}
            <div className="mb-6">
              <div id="tour-tabs" className="flex flex-wrap gap-2">
                {[
                  { id: 'holdings', label: 'Holdings Register' },
                  { id: 'targets', label: 'Targets & Bands' },
                  { id: 'transactions', label: 'Transactions' },
                  { id: 'documents', label: 'Documents' },
                  { id: 'reconciliation', label: 'Reconciliation' },
                  { id: 'household', label: 'Household' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2.5 rounded-full border text-sm transition-all ${
                      activeTab === tab.id
                        ? 'bg-[var(--primary)] border-[var(--primary)] text-[var(--primary-foreground)] shadow-md'
                        : 'bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]'
                    }`}
                    data-testid={`tab-${tab.id}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
              {activeTab === 'holdings' && <HoldingsTab onViewDetail={setDetailDrawer} density={density} />}
              {activeTab === 'targets' && <TargetsTab />}
              {activeTab === 'transactions' && <TransactionsTab density={density} />}
              {activeTab === 'documents' && <DocumentsTab onViewDoc={() => setDocLightbox(true)} />}
              {activeTab === 'reconciliation' && <ReconciliationTab />}
              {activeTab === 'household' && <HouseholdTab />}
            </div>
          </div>
        </main>
      </div>
      </div>

      {/* Detail Drawer */}
      {detailDrawer && (
        <DetailDrawer type={detailDrawer} onClose={() => setDetailDrawer(null)} />
      )}

      {/* Document Lightbox */}
      {docLightbox && (
        <DocumentLightbox onClose={() => setDocLightbox(false)} />
      )}

      {/* Add Asset Modal */}
      {addAssetModal && (
        <AddAssetModal onClose={() => setAddAssetModal(false)} initialMode="asset" />
      )}

      {/* Add Liability Modal */}
      {addLiabilityModal && (
        <AddAssetModal onClose={() => setAddLiabilityModal(false)} initialMode="liability" />
      )}

      {/* Tour */}
      <AssetRegisterTour isOpen={tourOpen} onClose={() => setTourOpen(false)} />
      <TourBeacon onClick={() => setTourOpen(true)} />
    </div>
  );
}

function KPITile({ label, value, delta, sublabel, positive, negative, tooltip, ...props }: any) {
  return (
    <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-sm" {...props}>
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs text-[var(--muted-foreground)]">{label}</div>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                <Info className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-xs">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="text-xl font-bold text-[var(--foreground)] mt-1">{value}</div>
      {delta && (
        <div className={`text-xs mt-2 ${positive ? 'text-[var(--success)]' : negative ? 'text-[var(--destructive)]' : 'text-[var(--muted-foreground)]'}`}>
          {delta}
        </div>
      )}
      {sublabel && <div className="text-xs text-[var(--muted-foreground)] mt-2">{sublabel}</div>}
    </div>
  );
}

function HoldingsTab({ onViewDetail, density }: any) {
  const holdings = [
    { asset: 'Vanguard FTSE Global All Cap', type: 'Accumulation fund', identifier: 'IE00B5BMR087', custodian: 'Vanguard Investor UK', wrapper: 'ISA', units: '1,234.56', cost: '£45,600', price: '£42.18', value: '£52,080', return: '14.2% IRR', bucket: 'Global Equity', tax: 'Accumulating', evidence: 'On file', completeness: 95 },
    { asset: 'Vanguard Global Bond Index', type: 'ETF', identifier: 'IE00B1S75N64', custodian: 'AJ Bell', wrapper: 'SIPP', units: '845.20', cost: '£18,900', price: '£24.65', value: '£20,834', return: '10.2% TWR', bucket: 'Fixed Income', tax: 'SIPP relief', evidence: 'On file', completeness: 95 },
    { asset: 'HSBC Savings Account', type: 'Cash', identifier: 'GB29HSBC12345678', custodian: 'HSBC', wrapper: 'GIA', units: '1', cost: '£12,500', price: '£12,500', value: '£12,500', return: '4.1% APR', bucket: 'Cash', tax: 'Taxable', evidence: 'On file', completeness: 100 },
    { asset: '42 Elm Street, Manchester', type: 'BTL Property', identifier: 'Title: MAN123456', custodian: 'Personal', wrapper: 'Personal', units: '1', cost: '£165,000', price: '£195,000', value: '£195,000', return: '5.8% yield', bucket: 'Property', tax: 'CGT', evidence: 'Valuation due', completeness: 82 },
    { asset: 'Bitcoin', type: 'Cryptocurrency', identifier: 'BTC', custodian: 'Ledger - Main', wrapper: 'Personal', units: '0.4520', cost: '£18,200', price: '£54,280', value: '£24,535', return: '+34.8%', bucket: 'Alternatives', tax: 'CGT', evidence: 'On file', completeness: 90 },
    { asset: 'Ethereum', type: 'Cryptocurrency', identifier: 'ETH (on-chain)', custodian: 'MetaMask Wallet', wrapper: 'Personal', units: '6.82', cost: '£11,400', price: '£2,248', value: '£15,331', return: '+34.5%', bucket: 'Alternatives', tax: 'On-chain verify', evidence: 'On-chain verify', completeness: 88 },
    { asset: 'FinTech Ventures Ltd', type: 'EIS shares', identifier: 'Unlisted', custodian: 'Personal', wrapper: 'Personal', units: '5,000', cost: '£50,000', price: '£50,000', value: '£50,000', return: 'Holding', bucket: 'Private Equity', tax: 'EIS', evidence: 'On file', completeness: 92, countdown: '~603 days' },
  ];

  const rowPadding = density === 'compact' ? 'py-2 px-3' : 'py-3 px-4';

  return (
    <div id="tour-holdings-table" className="overflow-auto border border-[var(--border)] rounded-xl bg-[var(--card)] shadow-sm">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[var(--muted)] border-b border-[var(--border)] sticky top-0">
            <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Asset</th>
            <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Identifier</th>
            <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Custodian</th>
            <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Wrapper</th>
            <th className={`${rowPadding} text-right text-xs text-[var(--muted-foreground)] font-medium`}>Units</th>
            <th className={`${rowPadding} text-right text-xs text-[var(--muted-foreground)] font-medium`}>Cost</th>
            <th className={`${rowPadding} text-right text-xs text-[var(--muted-foreground)] font-medium`}>Price</th>
            <th className={`${rowPadding} text-right text-xs text-[var(--muted-foreground)] font-medium`}>Value</th>
            <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Return</th>
            <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Bucket</th>
            <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Tax/Relief</th>
            <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Evidence</th>
            <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Complete</th>
            <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding, idx) => (
            <tr key={idx} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/50 transition-colors">
              <td className={rowPadding}>
                <div className="font-medium text-sm text-[var(--foreground)]" data-testid={`text-asset-${idx}`}>{holding.asset}</div>
                <div className="text-xs text-[var(--muted-foreground)]">{holding.type}</div>
              </td>
              <td className={`${rowPadding} text-sm text-[var(--foreground)]`} data-testid={`text-identifier-${idx}`}>{holding.identifier}</td>
              <td className={`${rowPadding} text-sm text-[var(--foreground)]`}>{holding.custodian}</td>
              <td className={rowPadding}>
                <WrapperTag wrapper={holding.wrapper} id={idx === 0 ? "tour-wrapper-tag" : undefined} />
              </td>
              <td className={`${rowPadding} text-right text-sm text-[var(--foreground)]`}>{holding.units}</td>
              <td className={`${rowPadding} text-right text-sm text-[var(--foreground)]`}>{holding.cost}</td>
              <td className={`${rowPadding} text-right text-sm text-[var(--foreground)]`}>{holding.price}</td>
              <td className={`${rowPadding} text-right text-sm text-[var(--foreground)] font-medium`}>{holding.value}</td>
              <td className={`${rowPadding} text-sm text-[var(--success)]`}>{holding.return}</td>
              <td className={`${rowPadding} text-sm text-[var(--foreground)]`}>{holding.bucket}</td>
              <td className={rowPadding}>
                {holding.countdown ? (
                  <span id="tour-eis-countdown" className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full border border-[var(--border)] bg-[var(--muted)] text-xs text-[var(--foreground)]">
                    <span className="w-2 h-2 rounded-full bg-[var(--warning)]"></span>
                    {holding.countdown}
                  </span>
                ) : holding.tax === 'On-chain verify' ? (
                  <span className="px-2 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs border border-[var(--primary)]/20">
                    {holding.tax}
                  </span>
                ) : holding.tax === 'EIS' ? (
                  <span className="px-2 py-1 rounded-full bg-[var(--success)]/10 text-[var(--success)] text-xs border border-[var(--success)]/20 font-medium">
                    {holding.tax}
                  </span>
                ) : (
                  <span className="text-sm text-[var(--foreground)]">{holding.tax}</span>
                )}
              </td>
              <td className={rowPadding}>
                <EvidenceStatus status={holding.evidence} id={idx === 0 ? "tour-evidence-pill" : undefined} />
              </td>
              <td className={rowPadding}>
                <CompletenessBar percentage={holding.completeness} id={idx === 0 ? "tour-completeness" : undefined} />
              </td>
              <td className={rowPadding}>
                <button 
                  onClick={() => onViewDetail(holding.type.includes('Property') ? 'property' : 'listed')}
                  className="px-3 py-1 bg-transparent border border-[var(--border)] rounded-lg text-xs text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                  data-testid={`button-view-${idx}`}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-3 bg-[var(--muted)] text-xs text-[var(--muted-foreground)] border-t border-[var(--border)]">
        Total: £370,280 • 7 holdings across 4 wrappers
      </div>
    </div>
  );
}

function WrapperTag({ wrapper, id }: { wrapper: string; id?: string }) {
  const colors: any = {
    ISA: 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20',
    SIPP: 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20',
    GIA: 'bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20',
    Personal: 'bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]',
  };
  return (
    <span id={id} className={`px-2 py-1 rounded-full text-xs border ${colors[wrapper] || colors.Personal}`}>
      {wrapper}
    </span>
  );
}

function EvidenceStatus({ status, id }: { status: string; id?: string }) {
  const statusConfig: any = {
    'On file': { color: 'text-[var(--success)]', dot: 'bg-[var(--success)]' },
    'Valuation due': { color: 'text-[var(--warning)]', dot: 'bg-[var(--warning)]' },
    'On-chain verify': { color: 'text-[var(--primary)]', dot: 'bg-[var(--primary)]' },
  };
  const config = statusConfig[status] || statusConfig['On file'];
  return (
    <span id={id} className={`inline-flex items-center gap-2 text-xs ${config.color}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot}`}></span>
      {status}
    </span>
  );
}

function CompletenessBar({ percentage, id }: { percentage: number; id?: string }) {
  return (
    <div id={id} className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-[var(--muted)] border border-[var(--border)]">
      <span className="text-xs text-[var(--foreground)]">{percentage}%</span>
      <div className="w-24 h-2 bg-[var(--background)] rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[var(--success)] to-[var(--primary)]" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

function TargetsTab() {
  const bands = [
    { bucket: 'Global Equity', target: 40, band: [35, 45], current: 46, status: '+6% over', action: 'Suggest sell £7,200 from ISA fund' },
    { bucket: 'Fixed Income', target: 25, band: [20, 30], current: 24, status: 'In band', action: null },
    { bucket: 'Property', target: 20, band: [15, 25], current: 23, status: '+3% over', action: 'Consider rebalancing' },
    { bucket: 'Cash', target: 10, band: [8, 12], current: 5, status: '-5% under', action: 'Increase cash reserves by £6,000' },
    { bucket: 'Alternatives', target: 5, band: [3, 7], current: 2, status: '-3% under', action: 'Within tolerance' },
  ];

  return (
    <div id="tour-targets-table" className="space-y-4">
      {bands.map((band, idx) => (
        <div key={idx} className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm" data-testid={`band-${idx}`}>
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-base font-semibold text-[var(--foreground)]">{band.bucket}</h3>
              <p className="text-xs text-[var(--muted-foreground)]">Target {band.target}% • Band {band.band[0]}–{band.band[1]}%</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-[var(--foreground)]">{band.current}%</div>
              <div className={`text-xs ${band.status.includes('over') ? 'text-[var(--destructive)]' : band.status.includes('under') ? 'text-[var(--warning)]' : 'text-[var(--success)]'}`}>
                {band.status}
              </div>
            </div>
          </div>
          <div className="h-2.5 bg-[var(--muted)] rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]" 
              style={{ width: `${band.current}%` }}
            ></div>
          </div>
          {band.action && (
            <p className="text-sm text-[var(--muted-foreground)] mt-2">→ {band.action}</p>
          )}
        </div>
      ))}

      <div className="mt-6 p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Suggested Actions</h3>
        <ul className="space-y-2 text-sm text-[var(--foreground)]">
          <li className="flex items-start gap-2">
            <span className="text-[var(--primary)]">•</span>
            <span>Sell £7,200 from Global Equity ISA holdings to rebalance</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--primary)]">•</span>
            <span>Increase cash reserves by £6,000 from sale proceeds</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--primary)]">•</span>
            <span>Monitor property allocation after next valuation</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function TransactionsTab({ density }: any) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  
  const getTypeStyle = (type: string) => {
    switch(type.toUpperCase()) {
      case 'BUY':
        return 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20';
      case 'SELL':
        return 'bg-[var(--destructive)]/10 text-[var(--destructive)] border-[var(--destructive)]/20';
      case 'DIVIDEND':
      case 'INTEREST':
        return 'bg-[var(--info)]/10 text-[var(--info)] border-[var(--info)]/20';
      case 'FEE':
      case 'CHARGE':
        return 'bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]';
      case 'TAX':
        return 'bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20';
      case 'TRANSFER':
      case 'CONTRIBUTION':
      case 'WITHDRAWAL':
        return 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20';
      case 'CORP ACTN':
        return 'bg-[var(--secondary)]/10 text-[var(--secondary)] border-[var(--secondary)]/20';
      default:
        return 'bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]';
    }
  };

  const getSourceIcon = (source: string) => {
    switch(source) {
      case 'live': return '⚡';
      case 'csv': return '⤿';
      case 'ocr': return '📎';
      case 'manual': return '✍';
      default: return '';
    }
  };
  
  const transactions = [
    { tradeDate: '28 Oct 2025', settleDate: '30 Oct 2025', type: 'Buy', identifier: 'IE00B5BMR087', asset: 'Vanguard FTSE Global', account: 'Vanguard ISA', wrapper: 'ISA', quantity: '45.50', price: '£42.10', tradeCcy: 'GBP', fxRate: '—', gross: '£1,915.55', fees: '£0.00', tax: '£0.00', net: '£1,915.55', source: 'live', reconciled: true, evidence: 'Statement' },
    { tradeDate: '22 Oct 2025', settleDate: '24 Oct 2025', type: 'Dividend', identifier: 'IE00B3RBWM25', asset: 'Vanguard All-World ETF', account: 'Vanguard ISA', wrapper: 'ISA', quantity: '—', price: '—', tradeCcy: 'GBP', fxRate: '—', gross: '£124.50', fees: '£0.00', tax: '£0.00', net: '£124.50', source: 'live', reconciled: true, evidence: 'Statement' },
    { tradeDate: '15 Oct 2025', settleDate: '17 Oct 2025', type: 'Buy', identifier: 'IE00B1S75N64', asset: 'Vanguard Bond Index', account: 'AJ Bell SIPP', wrapper: 'SIPP', quantity: '25.00', price: '£24.50', tradeCcy: 'GBP', fxRate: '—', gross: '£612.50', fees: '£3.50', tax: '£0.00', net: '£616.00', source: 'csv', reconciled: true, evidence: 'Contract note' },
    { tradeDate: '10 Oct 2025', settleDate: '12 Oct 2025', type: 'Fee', identifier: '—', asset: 'Platform fee', account: 'AJ Bell SIPP', wrapper: 'SIPP', quantity: '—', price: '—', tradeCcy: 'GBP', fxRate: '—', gross: '£0.00', fees: '£12.50', tax: '£0.00', net: '£12.50', source: 'csv', reconciled: true, evidence: 'Statement' },
    { tradeDate: '01 Oct 2025', settleDate: '03 Oct 2025', type: 'Sell', identifier: 'GB0031348658', asset: 'HSBC Holdings', account: 'Trading 212 GIA', wrapper: 'GIA', quantity: '150', price: '£6.82', tradeCcy: 'GBP', fxRate: '—', gross: '£1,023.00', fees: '£5.00', tax: '£12.30', net: '£1,005.70', source: 'manual', reconciled: false, evidence: 'Missing' },
    { tradeDate: '28 Sep 2025', settleDate: '30 Sep 2025', type: 'Interest', identifier: '—', asset: 'Cash ISA interest', account: 'HSBC Cash ISA', wrapper: 'ISA', quantity: '—', price: '—', tradeCcy: 'GBP', fxRate: '—', gross: '£42.15', fees: '£0.00', tax: '£0.00', net: '£42.15', source: 'ocr', reconciled: true, evidence: 'Statement' },
  ];

  const rowPadding = density === 'compact' ? 'py-2 px-2' : 'py-3 px-3';

  return (
    <div id="tour-transactions-table" className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl">
        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap flex-1">
          <select className="px-3 py-1.5 bg-[var(--input)] border border-[var(--border)] rounded-lg text-xs text-[var(--foreground)]">
            <option>All types</option>
            <option>Buy/Sell</option>
            <option>Dividend/Interest</option>
            <option>Fee/Tax</option>
            <option>Transfer</option>
          </select>
          <select className="px-3 py-1.5 bg-[var(--input)] border border-[var(--border)] rounded-lg text-xs text-[var(--foreground)]">
            <option>All accounts</option>
            <option>Vanguard ISA</option>
            <option>AJ Bell SIPP</option>
            <option>Trading 212 GIA</option>
          </select>
          <select className="px-3 py-1.5 bg-[var(--input)] border border-[var(--border)] rounded-lg text-xs text-[var(--foreground)]">
            <option>All wrappers</option>
            <option>ISA</option>
            <option>SIPP</option>
            <option>GIA</option>
          </select>
          <select className="px-3 py-1.5 bg-[var(--input)] border border-[var(--border)] rounded-lg text-xs text-[var(--foreground)]">
            <option>Oct 2025</option>
            <option>Sep 2025</option>
            <option>Q3 2025</option>
            <option>All time</option>
          </select>
          <select className="px-3 py-1.5 bg-[var(--input)] border border-[var(--border)] rounded-lg text-xs text-[var(--foreground)]">
            <option>All sources</option>
            <option>⚡ Live</option>
            <option>⤿ CSV</option>
            <option>📎 OCR</option>
            <option>✍ Manual</option>
          </select>
          <select className="px-3 py-1.5 bg-[var(--input)] border border-[var(--border)] rounded-lg text-xs text-[var(--foreground)]">
            <option>All reconciled</option>
            <option>Yes</option>
            <option>No</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <span>Add / Import</span>
              <span className="text-xs">▼</span>
            </button>
            {showAddMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg z-10">
                <button className="w-full px-4 py-3 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors border-b border-[var(--border)]">
                  <div className="font-semibold mb-1">⚡ Live (from connected broker)</div>
                  <div className="text-xs text-[var(--muted-foreground)]">Read-only from your broker</div>
                </button>
                <button className="w-full px-4 py-3 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors border-b border-[var(--border)]">
                  <div className="font-semibold mb-1">⤿ CSV file</div>
                  <div className="text-xs text-[var(--muted-foreground)]">Upload exported transactions</div>
                </button>
                <button className="w-full px-4 py-3 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors border-b border-[var(--border)]">
                  <div className="font-semibold mb-1">📎 From a document (OCR)</div>
                  <div className="text-xs text-[var(--muted-foreground)]">Extract from statement</div>
                </button>
                <button className="w-full px-4 py-3 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors">
                  <div className="font-semibold mb-1">✍ Manual entry</div>
                  <div className="text-xs text-[var(--muted-foreground)]">Type in manually</div>
                </button>
              </div>
            )}
          </div>
          <button className="px-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors">
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto border border-[var(--border)] rounded-xl bg-[var(--card)] shadow-sm">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-[var(--muted)] border-b border-[var(--border)]">
              <th className={`${rowPadding} text-left text-[var(--muted-foreground)] font-medium sticky left-0 bg-[var(--muted)] z-10`}>Trade Date</th>
              <th className={`${rowPadding} text-left text-[var(--muted-foreground)] font-medium`}>Settle Date</th>
              <th className={`${rowPadding} text-left text-[var(--muted-foreground)] font-medium`}>Type</th>
              <th className={`${rowPadding} text-left text-[var(--muted-foreground)] font-medium`}>Identifier</th>
              <th className={`${rowPadding} text-left text-[var(--muted-foreground)] font-medium`}>Asset</th>
              <th className={`${rowPadding} text-left text-[var(--muted-foreground)] font-medium`}>Account</th>
              <th className={`${rowPadding} text-left text-[var(--muted-foreground)] font-medium`}>Wrapper</th>
              <th className={`${rowPadding} text-right text-[var(--muted-foreground)] font-medium`}>Quantity</th>
              <th className={`${rowPadding} text-right text-[var(--muted-foreground)] font-medium`}>Price</th>
              <th className={`${rowPadding} text-center text-[var(--muted-foreground)] font-medium`}>Trade Ccy</th>
              <th className={`${rowPadding} text-center text-[var(--muted-foreground)] font-medium`}>FX→GBP</th>
              <th className={`${rowPadding} text-right text-[var(--muted-foreground)] font-medium`}>Gross</th>
              <th className={`${rowPadding} text-right text-[var(--muted-foreground)] font-medium`}>Fees</th>
              <th className={`${rowPadding} text-right text-[var(--muted-foreground)] font-medium`}>Tax</th>
              <th className={`${rowPadding} text-right text-[var(--muted-foreground)] font-medium`}>Net Amount</th>
              <th className={`${rowPadding} text-center text-[var(--muted-foreground)] font-medium`}>Source</th>
              <th className={`${rowPadding} text-center text-[var(--muted-foreground)] font-medium`}>Reconciled</th>
              <th className={`${rowPadding} text-left text-[var(--muted-foreground)] font-medium`}>Evidence</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, idx) => (
              <tr key={idx} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/50 transition-colors cursor-pointer" data-testid={`row-transaction-${idx}`}>
                <td className={`${rowPadding} text-[var(--foreground)] sticky left-0 bg-[var(--card)] z-10`}>{tx.tradeDate}</td>
                <td className={`${rowPadding} text-[var(--muted-foreground)]`}>{tx.settleDate}</td>
                <td className={rowPadding}>
                  <span className={`px-2 py-0.5 rounded-full border ${getTypeStyle(tx.type)}`}>
                    {tx.type.toUpperCase()}
                  </span>
                </td>
                <td className={`${rowPadding} text-[var(--muted-foreground)] font-mono`}>{tx.identifier}</td>
                <td className={`${rowPadding} text-[var(--foreground)]`}>{tx.asset}</td>
                <td className={`${rowPadding} text-[var(--muted-foreground)]`}>{tx.account}</td>
                <td className={rowPadding}><WrapperTag wrapper={tx.wrapper} /></td>
                <td className={`${rowPadding} text-right text-[var(--foreground)]`}>{tx.quantity}</td>
                <td className={`${rowPadding} text-right text-[var(--foreground)]`}>{tx.price}</td>
                <td className={`${rowPadding} text-center text-[var(--muted-foreground)]`}>{tx.tradeCcy}</td>
                <td className={`${rowPadding} text-center text-[var(--muted-foreground)]`}>{tx.fxRate}</td>
                <td className={`${rowPadding} text-right text-[var(--foreground)]`}>{tx.gross}</td>
                <td className={`${rowPadding} text-right text-[var(--muted-foreground)]`}>{tx.fees}</td>
                <td className={`${rowPadding} text-right text-[var(--muted-foreground)]`}>{tx.tax}</td>
                <td className={`${rowPadding} text-right text-[var(--foreground)] font-semibold`}>{tx.net}</td>
                <td className={`${rowPadding} text-center`}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-base cursor-help">{getSourceIcon(tx.source)}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        {tx.source === 'live' && 'From broker connection (read-only)'}
                        {tx.source === 'csv' && 'From CSV'}
                        {tx.source === 'ocr' && 'From uploaded document (OCR)'}
                        {tx.source === 'manual' && 'Typed in manually'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </td>
                <td className={rowPadding}>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    tx.reconciled
                      ? 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20'
                      : 'bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/20'
                  }`}>
                    {tx.reconciled ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className={`${rowPadding} text-[var(--muted-foreground)]`}>{tx.evidence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm">
        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
          <strong className="text-[var(--foreground)]">Audit-ready ledger:</strong> All economic events are recorded for Section 104 pooling, cost basis tracking, and CGT reporting. ISA and SIPP transactions are exempt from capital gains tax. Source indicators: ⚡ Live (read-only from broker) • ⤿ CSV • 📎 OCR • ✍ Manual
        </p>
      </div>
    </div>
  );
}

function DocumentsTab({ onViewDoc }: any) {
  const [selectedBucket, setSelectedBucket] = useState('all');
  
  const buckets = [
    { id: 'all', label: 'All Documents', count: 12 },
    { id: 'statements', label: 'Statements', count: 3 },
    { id: 'contract-notes', label: 'Contract notes', count: 2 },
    { id: 'valuations', label: 'Valuations', count: 2 },
    { id: 'tax-relief', label: 'Tax relief', count: 1 },
    { id: 'corporate-actions', label: 'Corporate actions', count: 0 },
    { id: 'property', label: 'Property', count: 2 },
    { id: 'crypto', label: 'Crypto', count: 2 },
    { id: 'other', label: 'Other', count: 0 },
  ];
  
  const docs = [
    { title: 'Vanguard ISA Statement Oct 2025', type: 'Statement', date: '31 Oct 2025', coverage: 'Vanguard ISA', status: 'Used for reconcile', bucket: 'statements' },
    { title: 'AJ Bell SIPP Statement Oct 2025', type: 'Statement', date: '31 Oct 2025', coverage: 'AJ Bell SIPP', status: 'Used for reconcile', bucket: 'statements' },
    { title: 'Hargreaves Lansdown GIA Sep 2025', type: 'Statement', date: '30 Sep 2025', coverage: 'HL GIA', status: 'Unmatched', bucket: 'statements' },
    { title: 'VWRL Purchase Contract Note', type: 'Contract note', date: '15 Oct 2025', coverage: 'VWRL (ISA)', status: 'Used for reconcile', bucket: 'contract-notes' },
    { title: 'SWDA Purchase Contract Note', type: 'Contract note', date: '22 Oct 2025', coverage: 'SWDA (ISA)', status: 'Used for reconcile', bucket: 'contract-notes' },
    { title: 'AJ Bell SIPP Annual Valuation', type: 'Valuation', date: '31 Oct 2025', coverage: 'Pension portfolio', status: 'Used for reconcile', bucket: 'valuations' },
    { title: '42 Elm Street RICS Valuation', type: 'Valuation', date: '15 Sep 2025', coverage: '42 Elm Street', status: 'Used for reconcile', bucket: 'valuations' },
    { title: 'EIS3 Certificate - FinTech Ventures', type: 'Tax relief', date: '01 Jan 2024', coverage: 'FinTech Ventures Ltd', status: 'Used for reconcile', bucket: 'tax-relief' },
    { title: '42 Elm Street Title Deed', type: 'Property', date: '15 Mar 2023', coverage: '42 Elm Street', status: 'Used for reconcile', bucket: 'property' },
    { title: '42 Elm Street Mortgage Statement', type: 'Property', date: '31 Oct 2025', coverage: '42 Elm Street mortgage', status: 'Used for reconcile', bucket: 'property' },
    { title: 'Ledger Wallet Balance Export', type: 'Crypto', date: '01 Nov 2025', coverage: 'BTC holdings', status: 'Used for reconcile', bucket: 'crypto' },
    { title: 'MetaMask Transaction History', type: 'Crypto', date: '01 Nov 2025', coverage: 'ETH on-chain', status: 'Used for reconcile', bucket: 'crypto' },
  ];

  const missingDocs = [
    { title: 'Trading 212 GIA statement for Oct 2025', action: 'Upload required' },
    { title: 'Property valuation for 42 Elm Street', action: 'Due in 14 days' },
    { title: 'Annual tax certificate (consolidated)', action: 'Expected by 31 Jan 2026' },
  ];
  
  const filteredDocs = selectedBucket === 'all' ? docs : docs.filter(d => d.bucket === selectedBucket);

  return (
    <div className="flex gap-6">
      {/* Left sidebar - Buckets */}
      <div className="w-64 flex-shrink-0">
        <div className="sticky top-4 space-y-1">
          {buckets.map((bucket) => (
            <button
              key={bucket.id}
              onClick={() => setSelectedBucket(bucket.id)}
              className={`w-full px-4 py-2.5 rounded-xl text-sm text-left transition-colors flex items-center justify-between ${
                selectedBucket === bucket.id
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
              }`}
              data-testid={`bucket-${bucket.id}`}
            >
              <span>{bucket.label}</span>
              <span className={`text-xs ${selectedBucket === bucket.id ? 'opacity-80' : 'opacity-50'}`}>
                {bucket.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        {/* Filters bar */}
        <div className="mb-6 p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl flex items-center gap-3 flex-wrap">
          <select className="px-3 py-2 bg-[var(--input)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)]">
            <option>All types</option>
            <option>Statement</option>
            <option>Contract note</option>
            <option>Valuation</option>
            <option>Tax relief</option>
            <option>Property</option>
            <option>Crypto</option>
          </select>
          <select className="px-3 py-2 bg-[var(--input)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)]">
            <option>All coverage</option>
            <option>Portfolio</option>
            <option>Account/Wrapper</option>
            <option>Specific asset</option>
          </select>
          <select className="px-3 py-2 bg-[var(--input)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)]">
            <option>All periods</option>
            <option>Oct 2025</option>
            <option>Sep 2025</option>
            <option>Q3 2025</option>
            <option>2024</option>
          </select>
          <select className="px-3 py-2 bg-[var(--input)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)]">
            <option>All status</option>
            <option>Used for reconcile</option>
            <option>Unmatched</option>
            <option>Needs review</option>
          </select>
          <select className="px-3 py-2 bg-[var(--input)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)]">
            <option>All sources</option>
            <option>Upload</option>
            <option>Email</option>
            <option>CSV</option>
            <option>Live</option>
          </select>
        </div>

        {/* What's missing strip */}
        <div className="mb-6 p-4 bg-[var(--warning)]/10 border border-[var(--warning)]/20 rounded-xl">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
            <Info className="h-4 w-4 text-[var(--warning)]" />
            What's missing
          </h3>
          <div className="space-y-2">
            {missingDocs.map((missing, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-[var(--foreground)]">{missing.title}</span>
                <button className="px-3 py-1 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg text-xs hover:opacity-90 transition-opacity">
                  Upload
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Document grid */}
        <div id="tour-docs-grid" className="grid grid-cols-3 gap-4">
          {/* Add document card */}
          <button
            className="p-6 bg-[var(--card)] border-2 border-dashed border-[var(--border)] rounded-xl hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all text-center group"
            data-testid="button-add-document"
          >
            <Upload className="h-8 w-8 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] mx-auto mb-3 transition-colors" />
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1">Add document</h3>
            <p className="text-xs text-[var(--muted-foreground)]">
              Drop files or click to upload
            </p>
          </button>

          {/* Document cards */}
          {filteredDocs.map((doc, idx) => (
            <button
              key={idx}
              onClick={onViewDoc}
              className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl hover:bg-[var(--muted)] transition-colors text-left shadow-sm"
              data-testid={`doc-${idx}`}
            >
              <div className="flex items-start gap-3 mb-3">
                <FileText className="h-5 w-5 text-[var(--primary)] flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1 line-clamp-2">
                    {doc.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-[var(--muted)] rounded text-xs text-[var(--muted-foreground)]">
                      {doc.type}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      doc.status === 'Used for reconcile'
                        ? 'bg-[var(--success)]/10 text-[var(--success)]'
                        : 'bg-[var(--warning)]/10 text-[var(--warning)]'
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-1 text-xs text-[var(--muted-foreground)]">
                <div className="flex items-center gap-2">
                  <span className="opacity-60">Uploaded:</span>
                  <span className="text-[var(--foreground)]">{doc.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="opacity-60">Coverage:</span>
                  <span className="text-[var(--foreground)] truncate">{doc.coverage}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReconciliationTab() {
  const accounts = [
    { name: 'Vanguard ISA', status: 'Reconciled', period: 'Oct 2025', statement: 'On file', differences: '—' },
    { name: 'AJ Bell SIPP', status: 'Reconciled', period: 'Oct 2025', statement: 'On file', differences: '—' },
    { name: 'Trading 212 GIA', status: 'Pending', period: 'Oct 2025', statement: 'Missing', differences: 'Unknown' },
  ];

  return (
    <div>
      <div id="tour-reconcile-cards" className="grid grid-cols-3 gap-4 mb-6">
        {accounts.map((acc, idx) => (
          <div key={idx} className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm" data-testid={`reconcile-${idx}`}>
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-sm font-semibold text-[var(--foreground)]">{acc.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs border ${acc.status === 'Reconciled' ? 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20' : 'bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20'}`}>
                {acc.status}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Period:</span>
                <span className="text-[var(--foreground)]">{acc.period}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Statement:</span>
                <span className="text-[var(--foreground)]">{acc.statement}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Differences:</span>
                <span className="text-[var(--foreground)]">{acc.differences}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div id="tour-missing" className="p-4 bg-[var(--card)] border border-dashed border-[var(--border)] rounded-xl shadow-sm">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">What's Missing</h3>
        <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
          <li className="flex items-start gap-2">
            <span className="text-[var(--warning)]">⚠</span>
            <span>Trading 212 GIA statement for Oct 2025 – Upload required</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--warning)]">⚠</span>
            <span>Property valuation for 42 Elm Street – Due in 14 days</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--warning)]">⚠</span>
            <span>EIS certificate renewal check – Review in 30 days</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function HouseholdTab() {
  const entities = [
    { name: 'Personal', ownership: 100, value: '£847,200', note: 'Primary holdings across all wrappers' },
    { name: 'Spouse', ownership: 0, value: '—', note: 'Not yet configured' },
    { name: 'Williams Ltd', ownership: 0, value: '—', note: 'Not yet configured' },
  ];

  return (
    <div id="tour-household">
      <div className="space-y-4 mb-6">
        {entities.map((entity, idx) => (
          <div key={idx} className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm" data-testid={`household-${idx}`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-base font-semibold text-[var(--foreground)]">{entity.name}</h3>
                <p className="text-xs text-[var(--muted-foreground)]">{entity.note}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-[var(--foreground)]">{entity.ownership}%</div>
                <div className="text-sm text-[var(--muted-foreground)]">{entity.value}</div>
              </div>
            </div>
            <div className="h-2.5 bg-[var(--muted)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]" 
                style={{ width: `${entity.ownership}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Household Notes</h3>
        <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
          <li className="flex items-start gap-2">
            <span className="text-[var(--primary)]">•</span>
            <span>Enable spouse portfolio to view combined household net worth and optimise allowances</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--primary)]">•</span>
            <span>Configure corporate structure to track business investments and tax efficiency</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function DetailDrawer({ type, onClose }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-3xl h-screen bg-[var(--card)] border-l border-[var(--border)] shadow-2xl overflow-auto animate-slide-in-right">
        <div className="sticky top-0 z-10 flex justify-between items-center p-6 border-b border-[var(--border)] bg-[var(--card)]">
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            {type === 'property' ? 'Property Detail' : 'Holding Detail'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors" data-testid="button-close-drawer">
            <X className="h-5 w-5 text-[var(--foreground)]" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {type === 'property' ? <PropertyDetail /> : <ListedDetail />}
        </div>
      </div>
    </div>
  );
}

function ListedDetail() {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-[var(--muted)] border border-[var(--border)] rounded-xl">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Position</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">Units:</span><span className="text-[var(--foreground)]">1,234.56</span></div>
            <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">Price:</span><span className="text-[var(--foreground)]">£42.18</span></div>
            <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">Market Value:</span><span className="text-[var(--foreground)] font-bold">£52,080</span></div>
            <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">Cost Basis:</span><span className="text-[var(--foreground)]">£45,600</span></div>
            <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">Unrealised G/L:</span><span className="text-[var(--success)] font-medium">+£6,480 (+14.2%)</span></div>
            <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">Bucket:</span><span className="text-[var(--foreground)]">Global Equity</span></div>
          </div>
        </div>
        
        <div className="p-4 bg-[var(--muted)] border border-[var(--border)] rounded-xl">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Compliance</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">Evidence:</span><EvidenceStatus status="On file" /></div>
            <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">Tax Treatment:</span><span className="text-[var(--foreground)]">Accumulating</span></div>
            <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">Valuation Date:</span><span className="text-[var(--foreground)]">31 Oct 2025</span></div>
            <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">Identifier:</span><span className="text-[var(--foreground)]">IE00B5BMR087</span></div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-[var(--muted)] border border-[var(--border)] rounded-xl">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Targets & Bands</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">Target Allocation:</span><span className="text-[var(--foreground)]">40%</span></div>
          <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">Current Allocation:</span><span className="text-[var(--foreground)]">46%</span></div>
          <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">Status:</span><span className="text-[var(--destructive)]">+6% over band</span></div>
        </div>
      </div>

      <div className="p-4 bg-[var(--muted)] border border-[var(--border)] rounded-xl">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Performance</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">IRR since inception:</span><span className="text-[var(--success)]">14.2%</span></div>
          <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">TWR 1 year:</span><span className="text-[var(--success)]">12.8%</span></div>
          <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">Since last top-up:</span><span className="text-[var(--success)]">8.4%</span></div>
        </div>
      </div>
    </>
  );
}

function PropertyDetail() {
  return (
    <>
      <div className="p-4 bg-[var(--muted)] border border-[var(--border)] rounded-xl">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Valuation Trend</h3>
        <div className="h-20 flex items-end gap-1">
          {[165, 172, 178, 185, 192, 195].map((val, idx) => (
            <div key={idx} className="flex-1 bg-gradient-to-t from-[var(--primary)] to-[var(--secondary)] rounded-t" style={{ height: `${(val/195)*100}%` }}></div>
          ))}
        </div>
        <div className="mt-2 text-xs text-[var(--muted-foreground)] flex justify-between">
          <span>2023</span>
          <span>2024</span>
          <span>2025</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-[var(--muted)] border border-[var(--border)] rounded-xl">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Property Metrics</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">Current Value:</span><span className="text-[var(--foreground)] font-bold">£195,000</span></div>
            <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">Purchase Price:</span><span className="text-[var(--foreground)]">£165,000</span></div>
            <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">LTV:</span><span className="text-[var(--foreground)]">0% (unmortgaged)</span></div>
            <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">Rental Yield:</span><span className="text-[var(--success)]">5.8%</span></div>
          </div>
        </div>

        <div className="p-4 bg-[var(--muted)] border border-[var(--border)] rounded-xl">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Compliance</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">EPC Rating:</span><span className="text-[var(--foreground)]">B (84)</span></div>
            <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">Insurance:</span><span className="text-[var(--success)]">Current</span></div>
            <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">Title:</span><span className="text-[var(--success)]">On file</span></div>
            <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">Last Valuation:</span><span className="text-[var(--warning)]">Sep 2025</span></div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-[var(--muted)] border border-[var(--border)] rounded-xl">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Reminders</h3>
        <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
          <li className="flex items-start gap-2">
            <span className="text-[var(--warning)]">⚠</span>
            <span>Annual gas safety check due: 15 Dec 2025</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--primary)]">ℹ</span>
            <span>Property insurance renewal: 31 Jan 2026</span>
          </li>
        </ul>
      </div>
    </>
  );
}

function DocumentLightbox({ onClose }: any) {
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-4xl h-[80vh] bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-[var(--border)]">
          <h3 className="text-lg font-bold text-[var(--foreground)]">Document Viewer</h3>
          <button onClick={onClose} className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors" data-testid="button-close-lightbox">
            <X className="h-5 w-5 text-[var(--foreground)]" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full h-full border border-dashed border-[var(--border)] rounded-xl flex items-center justify-center">
            <div className="text-center text-[var(--muted-foreground)]">
              <FileText className="h-16 w-16 mx-auto mb-4 text-[var(--primary)]" />
              <p className="text-lg text-[var(--foreground)]">PDF Document Preview</p>
              <p className="text-sm text-[var(--muted-foreground)] mt-2">Vanguard ISA Statement - Oct 2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddAssetModal({ onClose, initialMode = 'asset' }: any) {
  const [mode, setMode] = useState<'asset' | 'liability'>(initialMode);
  const [category, setCategory] = useState<string | null>(null);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [amountMode, setAmountMode] = useState<'single' | 'units'>('single');
  const [step, setStep] = useState(1);
  const [sourceType, setSourceType] = useState<'live' | 'semi-auto' | 'manual' | null>(null);
  const [liveStep, setLiveStep] = useState(1); // 1=Broker picker, 2=Consent/Auth, 3=Pick accounts, 4=Review holdings
  const [selectedBroker, setSelectedBroker] = useState<string | null>(null);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [selectedHoldings, setSelectedHoldings] = useState<string[]>([]);
  
  // Demo broker list (for Listed Securities)
  const demoBrokers = [
    { id: 'vanguard', name: 'Vanguard Investor UK', types: 'ISA • SIPP • GIA', status: 'csv', statusLabel: 'CSV / statement import (for now)' },
    { id: 'ajbell', name: 'AJ Bell', types: 'ISA • SIPP • GIA', status: 'live', statusLabel: 'Live via aggregator (read-only)' },
    { id: 'hl', name: 'Hargreaves Lansdown', types: 'ISA • SIPP • GIA', status: 'variable', statusLabel: 'CSV now; aggregator pilot possible' },
    { id: 'ii', name: 'Interactive Investor', types: 'ISA • SIPP • GIA', status: 'variable', statusLabel: 'Aggregator (variable) or CSV' },
    { id: 't212', name: 'Trading 212', types: 'ISA • GIA', status: 'blocked', statusLabel: 'Blocked by provider; CSV' },
    { id: 'fidelity', name: 'Fidelity UK', types: 'ISA • SIPP • GIA', status: 'live', statusLabel: 'Live via aggregator (read-only)' },
    { id: 'freetrade', name: 'Freetrade', types: 'ISA • SIPP • GIA', status: 'csv', statusLabel: 'CSV / statement import (for now)' },
    { id: 'iweb', name: 'Halifax iWeb', types: 'ISA • SIPP • GIA', status: 'csv', statusLabel: 'CSV / statement import' },
    { id: 'barclays', name: 'Barclays Smart Investor', types: 'ISA • SIPP • GIA', status: 'csv', statusLabel: 'CSV / statement import' },
    { id: 'charles', name: 'Charles Stanley Direct', types: 'ISA • SIPP • GIA', status: 'csv', statusLabel: 'CSV / statement import' },
  ];
  
  // Demo bank list (for Cash)
  const demoBanks = [
    { id: 'hsbc', name: 'HSBC', types: 'Personal • Business' },
    { id: 'natwest', name: 'NatWest', types: 'Personal • Business' },
    { id: 'lloyds', name: 'Lloyds', types: 'Personal • Business' },
    { id: 'barclays-bank', name: 'Barclays', types: 'Personal • Business' },
    { id: 'santander', name: 'Santander', types: 'Personal • Business' },
    { id: 'nationwide', name: 'Nationwide', types: 'Personal • Business' },
    { id: 'rbs', name: 'RBS', types: 'Personal • Business' },
    { id: 'chase', name: 'Chase UK', types: 'Personal' },
    { id: 'monzo', name: 'Monzo', types: 'Personal • Business' },
    { id: 'starling', name: 'Starling Bank', types: 'Personal • Business' },
    { id: 'revolut', name: 'Revolut', types: 'Personal • Business' },
    { id: 'nsi', name: 'NS&I', types: 'Savings' },
  ];
  
  // Demo broker accounts (for Listed Securities)
  const demoBrokerAccounts = [
    { id: 'acc1', name: 'Vanguard ISA', type: 'Investment', currency: 'GBP', balance: '£2,050', wrapper: 'ISA', identifier: 'ACC-••12', asAt: 'Today' },
    { id: 'acc2', name: 'Vanguard GIA', type: 'Investment', currency: 'GBP', balance: '£540', wrapper: 'GIA', identifier: 'ACC-••34', asAt: 'Today' },
    { id: 'acc3', name: 'Vanguard SIPP', type: 'Pension', currency: 'GBP', balance: '£0', wrapper: 'SIPP', identifier: 'ACC-••56', asAt: 'Today' },
  ];
  
  // Demo bank accounts (for Cash)
  const demoBankAccounts = [
    { id: 'ba1', name: 'HSBC — Savings', type: 'Easy-access', currency: 'GBP', balance: '£12,400', wrapper: 'GIA', identifier: 'GB-HSBC-••1234', asAt: 'Today' },
    { id: 'ba2', name: 'HSBC — Cash ISA', type: 'Cash ISA', currency: 'GBP', balance: '£8,900', wrapper: 'ISA', identifier: 'GB-HSBC-••9876', asAt: 'Today' },
    { id: 'ba3', name: 'HSBC — Euro', type: 'Current', currency: 'EUR', balance: '€2,150', wrapper: 'GIA', identifier: 'IBAN-••72', asAt: 'Today', fxNote: 'FX via ECB' },
  ];
  
  // Demo Live holdings data
  const demoLiveHoldings = [
    { id: '1', name: 'Vanguard FTSE All-World UCITS ETF (Acc)', isin: 'IE00B3RBWM25', ticker: 'VWRL', account: 'Vanguard ISA', wrapper: 'ISA', units: '1250.5', bookCost: '98750.50', currency: 'GBP', price: '85.42', value: '106,825.21', lastUpdated: '2025-11-05 14:30' },
    { id: '2', name: 'iShares Core MSCI World UCITS ETF', isin: 'IE00B4L5Y983', ticker: 'SWDA', account: 'Vanguard ISA', wrapper: 'ISA', units: '580', bookCost: '38500', currency: 'GBP', price: '72.15', value: '41,847', lastUpdated: '2025-11-05 14:30' },
    { id: '3', name: 'Vanguard FTSE Developed World UCITS ETF', isin: 'IE00BK5BQT80', ticker: 'VEVE', account: 'Vanguard GIA', wrapper: 'GIA', units: '320', bookCost: '20800', currency: 'GBP', price: '68.90', value: '22,048', lastUpdated: '2025-11-05 14:30' },
    { id: '4', name: 'iShares Core UK Gilts UCITS ETF (closed)', isin: 'IE00B1FZS350', ticker: 'IGLT', account: 'Vanguard ISA', wrapper: 'ISA', units: '0', bookCost: '0', currency: 'GBP', price: '0', value: '0', lastUpdated: '2025-10-15 09:00' },
  ];
  
  // Listed security form state
  const [isin, setIsin] = useState('');
  const [ticker, setTicker] = useState('');
  const [securityName, setSecurityName] = useState('');
  const [wrapper, setWrapper] = useState('ISA');
  const [custodian, setCustodian] = useState('');
  const [accountLabel, setAccountLabel] = useState('');
  const [distributionType, setDistributionType] = useState('Accumulating');
  const [bucket, setBucket] = useState('Global Equity');
  const [units, setUnits] = useState('');
  const [price, setPrice] = useState('');
  const [costBasis, setCostBasis] = useState('');
  const [fees, setFees] = useState('');
  const [tradeDate, setTradeDate] = useState('');
  const [valuationDate, setValuationDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [evidenceState, setEvidenceState] = useState('On file');
  const [evidenceType, setEvidenceType] = useState('Broker statement');
  const [evidenceReference, setEvidenceReference] = useState('');
  const [reminder, setReminder] = useState('none');
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Computed value
  const computedValue = units && price ? (parseFloat(units) * parseFloat(price)).toFixed(2) : '—';
  
  // Validation function
  const validateListedSecurity = () => {
    const newErrors: Record<string, string> = {};
    
    // Step 1: Identify
    if (!wrapper) newErrors.wrapper = 'Wrapper is required';
    if (!custodian || custodian.length < 2) newErrors.custodian = 'Custodian is required (at least 2 characters)';
    
    // ISIN/Ticker validation
    if (!isin && !ticker) {
      newErrors.identifier = 'Either ISIN or Ticker must be provided';
    } else if (isin) {
      // ISIN format validation: 12 chars, alphanumeric
      const isinPattern = /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/;
      if (!isinPattern.test(isin.toUpperCase())) {
        newErrors.isin = 'ISIN must be 12 characters (e.g., IE00B3RBWM25)';
      }
    } else if (ticker && (ticker.length < 1 || ticker.length > 12)) {
      newErrors.ticker = 'Ticker must be 1-12 characters';
    }
    
    if (!distributionType) newErrors.distributionType = 'Distribution type is required';
    if (!bucket) newErrors.bucket = 'Bucket is required';
    
    // Step 2: Position
    if (!units || parseFloat(units) <= 0) {
      newErrors.units = 'Enter a positive number greater than 0';
    } else if (parseFloat(units) && units.split('.')[1]?.length > 6) {
      newErrors.units = 'Units can have up to 6 decimal places';
    }
    
    if (price && parseFloat(price) < 0) {
      newErrors.price = 'Price must be 0 or greater';
    }
    
    if (costBasis && parseFloat(costBasis) < 0) {
      newErrors.costBasis = 'Cost basis must be 0 or greater';
    }
    
    if (fees && parseFloat(fees) < 0) {
      newErrors.fees = 'Fees must be 0 or greater';
    }
    
    // Date validation
    if (valuationDate && new Date(valuationDate) > new Date()) {
      newErrors.valuationDate = 'Valuation date cannot be in the future';
    }
    
    // Step 3: Evidence
    if (evidenceState === 'On file' && !evidenceType) {
      newErrors.evidenceType = 'Evidence type is required when evidence is on file';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSaveListedSecurity = () => {
    if (validateListedSecurity()) {
      // In production, this would save to backend
      alert('Listed security added (Semi-auto)');
      onClose();
    }
  };

  const assetCategories = [
    { id: 'listed', label: 'Listed security', subtitle: 'Fund • ETF • Share by ISIN or ticker', Icon: TrendingUp },
    { id: 'cash', label: 'Cash', subtitle: 'Bank or savings balance', Icon: Wallet },
    { id: 'crypto', label: 'Crypto', subtitle: 'Exchange account or on-chain wallet', Icon: Bitcoin },
    { id: 'property', label: 'Property', subtitle: 'Home • BTL • Commercial', Icon: Home },
    { id: 'private', label: 'Private equity', subtitle: 'EIS/SEIS • Unlisted shares', Icon: Briefcase },
    { id: 'alt', label: 'Alternatives', subtitle: 'Metals • Art • Domains • Other', Icon: Sparkles },
    { id: 'manual', label: 'Add manually', subtitle: 'Record a position or one-off value with statement/certificate proof.', Icon: FileEdit },
  ];

  const liabilityCategories = [
    { id: 'mortgage', label: 'Mortgage', subtitle: 'Link to a property', Icon: Building2 },
    { id: 'loan', label: 'Loan', subtitle: 'Personal • Business', Icon: Landmark },
    { id: 'card', label: 'Credit card', subtitle: 'Rolling balance', Icon: CreditCard },
    { id: 'manual', label: 'Add liability manually', subtitle: 'Record a position or one-off value with statement/certificate proof.', Icon: FileEdit },
  ];

  const categories = mode === 'asset' ? assetCategories : liabilityCategories;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-[var(--background)]">
      <div className="max-w-5xl mx-auto py-8 px-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-[var(--foreground)]">{mode === 'asset' ? 'Add Assets' : 'Add Liabilities'}</h2>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowCommandPalette(true)}
              className="px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors flex items-center gap-2"
              data-testid="button-command-palette"
            >
              <Command className="h-4 w-4" /> Command Palette
            </button>
            <button className="px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors" data-testid="button-ai-import-modal">
              ✨ AI Import
            </button>
            <button className="px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors" data-testid="button-csv-modal">
              ⇪ CSV
            </button>
            <button onClick={onClose} className="px-4 py-2.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-sm hover:opacity-90 transition-opacity" data-testid="button-close-modal">
              Close
            </button>
          </div>
        </header>

        {/* Mode Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('asset')}
            className={`px-4 py-2.5 rounded-full border transition-all ${mode === 'asset' ? 'bg-[var(--primary)] border-[var(--primary)] text-[var(--primary-foreground)]' : 'bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]'}`}
            data-testid="tab-add-asset"
          >
            Add Assets
          </button>
          <button
            onClick={() => setMode('liability')}
            className={`px-4 py-2.5 rounded-full border transition-all ${mode === 'liability' ? 'bg-[var(--primary)] border-[var(--primary)] text-[var(--primary-foreground)]' : 'bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]'}`}
            data-testid="tab-add-liability"
          >
            Add Liabilities
          </button>
        </div>

        {/* Category Tiles */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {categories.map((cat) => {
              const IconComponent = cat.Icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategory(cat.id);
                    setSourceType(null); // Reset source type
                    setStep(1); // Reset to step 1
                  }}
                  className={`relative p-5 min-h-[120px] rounded-xl border overflow-hidden transition-all hover:shadow-lg ${category === cat.id ? 'ring-2 ring-[var(--primary)] border-[var(--primary)] bg-[var(--primary)]/5' : 'border-[var(--border)]'} bg-[var(--card)]`}
                  data-testid={`tile-${cat.id}`}
                >
                  <div className="relative z-10">
                    <h3 className="font-bold text-[var(--foreground)] mb-1.5">{cat.label}</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">{cat.subtitle}</p>
                  </div>
                  <div className="absolute bottom-3 right-3 text-[var(--primary)] opacity-20">
                    <IconComponent className="h-12 w-12" />
                  </div>
                </button>
              );
            })}
        </div>

        {/* Source Selection for Listed Securities - shown after category tiles when Listed is selected */}
        {category === 'listed' && !sourceType && (
          <div className="border border-[var(--border)] rounded-xl bg-[var(--card)] overflow-hidden shadow-sm mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1">Select source</h3>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Choose how you want to add this position. This affects automation and data provenance.
                  </p>
                </div>
                <button 
                  onClick={() => { setCategory(null); setSourceType(null); setStep(1); }}
                  className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] underline"
                  data-testid="button-change-category"
                >
                  Change category
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-6">
                <button
                  onClick={() => {
                    setSourceType('live');
                    setLiveStep(1);
                  }}
                  className="relative p-6 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all"
                  data-testid="source-live"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-3">⚡</div>
                    <h4 className="font-semibold text-[var(--foreground)] mb-2">Connect broker</h4>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Batch import from connected account (recommended)
                    </p>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    setSourceType('semi-auto');
                    setUnits('500');
                    setPrice('92.15');
                    setCostBasis('45000');
                  }}
                  className="relative p-6 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all"
                  data-testid="source-semi-auto"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-3">⤿</div>
                    <h4 className="font-semibold text-[var(--foreground)] mb-2">Import CSV</h4>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Prices/FX auto; positions from CSV or manual entry
                    </p>
                  </div>
                </button>
                
                <button
                  onClick={() => setSourceType('manual')}
                  className="relative p-6 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all"
                  data-testid="source-manual"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-3">✍</div>
                    <h4 className="font-semibold text-[var(--foreground)] mb-2">Enter manually</h4>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Entered by you; attach evidence for defensibility
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stepper Panel */}
        {category && (category !== 'listed' || sourceType) && (
        <div className="border border-[var(--border)] rounded-xl bg-[var(--card)] overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]"></span>
                Identify
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--muted)]"></span>
                Amount
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--muted)]"></span>
                Evidence
              </div>
            </div>
            <div className="flex-1 max-w-xs mx-4">
              <div className="h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]" style={{ width: '33%' }}></div>
              </div>
            </div>
            <div className="text-sm text-[var(--foreground)]">Wrapper: ISA • Custodian: Vanguard</div>
          </div>
          
          <div className="p-6">
            {category === 'manual' && (
              <div className="mb-4 px-4 py-3 bg-[var(--muted)] border border-[var(--border)] rounded-xl">
                <p className="text-sm text-[var(--muted-foreground)]">
                  Use this when there's no live feed or integration. You can refine or relabel later.
                </p>
              </div>
            )}
            {category === 'listed' && sourceType === 'live' && (
              <div className="space-y-6">
                {/* Step 1: Broker Picker */}
                {liveStep === 1 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-semibold text-[var(--foreground)]">Connect a broker/platform (read-only)</h3>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">
                          Choose your broker to import holdings
                        </p>
                      </div>
                      <button 
                        onClick={() => { setSourceType(null); setLiveStep(1); }}
                        className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] underline"
                      >
                        Change source
                      </button>
                    </div>

                    <input 
                      type="text" 
                      placeholder="Search brokers..."
                      className="w-full px-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      {demoBrokers.map((broker) => {
                        const getStatusConfig = (status: string) => {
                          switch(status) {
                            case 'live':
                              return { Icon: PlugZap, color: 'text-green-600 dark:text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' };
                            case 'variable':
                              return { Icon: Plug, color: 'text-amber-600 dark:text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' };
                            case 'blocked':
                              return { Icon: Plug, color: 'text-red-600 dark:text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' };
                            case 'csv':
                            default:
                              return { Icon: FileStack, color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800/50' };
                          }
                        };
                        const statusConfig = getStatusConfig(broker.status);
                        const StatusIcon = statusConfig.Icon;
                        
                        return (
                          <Tooltip key={broker.id}>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => {
                                  setSelectedBroker(broker.name);
                                  setLiveStep(2);
                                }}
                                className="p-4 border border-[var(--border)] rounded-xl hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all text-left"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-semibold text-[var(--foreground)] flex-1">{broker.name}</h4>
                                  <span className={`ml-2 p-1.5 rounded-md ${statusConfig.bg}`}>
                                    <StatusIcon className={`h-3.5 w-3.5 ${statusConfig.color}`} />
                                  </span>
                                </div>
                                <p className="text-xs text-[var(--muted-foreground)] mb-1">{broker.types}</p>
                                <p className="text-xs text-[var(--muted-foreground)] font-medium">{broker.statusLabel}</p>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-xs">
                                {broker.status === 'live' && 'Live connection via read-only aggregator'}
                                {broker.status === 'variable' && 'Coverage varies by provider / aggregator'}
                                {broker.status === 'blocked' && 'Connection blocked by provider; use CSV import'}
                                {broker.status === 'csv' && 'No live API available; use CSV or statement import'}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button 
                        onClick={() => setSourceType(null)}
                        className="px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Consent & Authenticate */}
                {liveStep === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-semibold text-[var(--foreground)]">Consent & Authenticate</h3>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">
                          Connecting to {selectedBroker}
                        </p>
                      </div>
                    </div>

                    <div className="px-4 py-3 bg-[var(--muted)] border border-[var(--border)] rounded-xl">
                      <p className="text-sm font-semibold text-[var(--foreground)] mb-2">Read-only access:</p>
                      <ul className="text-xs text-[var(--muted-foreground)] space-y-1.5 ml-4 list-disc">
                        <li>Read positions (holdings, units, book cost)</li>
                        <li>Read account metadata (account name/type)</li>
                        <li>Read cash balances (optional)</li>
                        <li className="font-semibold">No trading. No withdrawals.</li>
                      </ul>
                    </div>

                    <div className="text-xs text-[var(--muted-foreground)] px-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-xl">
                      Access is read-only and expires after 90 days. You can revoke any time.
                    </div>

                    {/* Mock auth form */}
                    <div className="border border-[var(--border)] rounded-xl p-6 space-y-4">
                      <h4 className="text-sm font-semibold text-[var(--foreground)] mb-3">Demo: {selectedBroker} Login</h4>
                      <div>
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">Username</label>
                        <input 
                          type="text" 
                          placeholder="demo@user.com"
                          className="w-full px-3 py-2 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">Password</label>
                        <input 
                          type="password" 
                          placeholder="••••••••"
                          className="w-full px-3 py-2 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">2FA Code</label>
                        <input 
                          type="text" 
                          placeholder="123456"
                          className="w-full px-3 py-2 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)]"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button 
                        onClick={() => setLiveStep(1)}
                        className="px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                      >
                        Back
                      </button>
                      <button 
                        onClick={() => {
                          setLiveStep(3);
                          setSelectedAccounts(['acc1', 'acc2']); // Pre-select ISA and GIA
                        }}
                        className="px-4 py-2.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-sm hover:opacity-90 transition-opacity"
                      >
                        Approve & Continue
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Pick Accounts */}
                {liveStep === 3 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-semibold text-[var(--foreground)]">Pick Accounts</h3>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">
                          Select accounts to import holdings from
                        </p>
                      </div>
                    </div>

                    <div className="border border-[var(--border)] rounded-xl overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-[var(--muted)] border-b border-[var(--border)]">
                          <tr>
                            <th className="px-3 py-2 text-left">
                              <input type="checkbox" checked={selectedAccounts.length === demoBrokerAccounts.length} onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedAccounts(demoBrokerAccounts.map(a => a.id));
                                } else {
                                  setSelectedAccounts([]);
                                }
                              }} />
                            </th>
                            <th className="px-3 py-2 text-left text-[var(--foreground)]">Account name</th>
                            <th className="px-3 py-2 text-left text-[var(--foreground)]">Type</th>
                            <th className="px-3 py-2 text-left text-[var(--foreground)]">Currency</th>
                            <th className="px-3 py-2 text-left text-[var(--foreground)]">Balance</th>
                            <th className="px-3 py-2 text-left text-[var(--foreground)]">Suggested wrapper</th>
                            <th className="px-3 py-2 text-left text-[var(--foreground)]">Identifier</th>
                          </tr>
                        </thead>
                        <tbody>
                          {demoBrokerAccounts.map((account) => (
                            <tr key={account.id} className="border-b border-[var(--border)]">
                              <td className="px-3 py-3">
                                <input 
                                  type="checkbox" 
                                  checked={selectedAccounts.includes(account.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedAccounts([...selectedAccounts, account.id]);
                                    } else {
                                      setSelectedAccounts(selectedAccounts.filter(id => id !== account.id));
                                    }
                                  }}
                                />
                              </td>
                              <td className="px-3 py-3 text-[var(--foreground)]">{account.name}</td>
                              <td className="px-3 py-3 text-[var(--muted-foreground)]">{account.type}</td>
                              <td className="px-3 py-3 text-[var(--muted-foreground)]">{account.currency}</td>
                              <td className="px-3 py-3 text-[var(--foreground)]">{account.balance}</td>
                              <td className="px-3 py-3">
                                <select className="px-2 py-1 bg-[var(--input)] border border-[var(--border)] rounded text-[var(--foreground)] text-xs" defaultValue={account.wrapper}>
                                  <option>ISA</option>
                                  <option>SIPP</option>
                                  <option>GIA</option>
                                  <option>Personal</option>
                                </select>
                              </td>
                              <td className="px-3 py-3 text-[var(--muted-foreground)]">{account.identifier}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {selectedAccounts.length} account{selectedAccounts.length !== 1 ? 's' : ''} selected
                      </p>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => setLiveStep(2)}
                          className="px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                        >
                          Back
                        </button>
                        <button 
                          onClick={() => {
                            setLiveStep(4);
                            setSelectedHoldings(['1', '2', '3']); // Pre-select active holdings
                          }}
                          disabled={selectedAccounts.length === 0}
                          className="px-4 py-2.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          Continue ({selectedAccounts.length} selected)
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Review & Pick Holdings */}
                {liveStep === 4 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-semibold text-[var(--foreground)]">Review & pick holdings</h3>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">
                          Select which positions to import from your connected accounts
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[var(--muted-foreground)]">Broker: {selectedBroker} • Accounts: ISA, GIA</span>
                        <button 
                          onClick={() => { setSourceType(null); setLiveStep(1); setSelectedHoldings([]); }}
                          className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] underline"
                        >
                          Change source
                        </button>
                      </div>
                    </div>

                    {/* Holdings table */}
                    <div className="border border-[var(--border)] rounded-xl overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-[var(--muted)] border-b border-[var(--border)]">
                          <tr>
                            <th className="px-3 py-2 text-left">
                              <input 
                                type="checkbox" 
                                checked={selectedHoldings.length === demoLiveHoldings.filter(h => parseFloat(h.units) > 0).length}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedHoldings(demoLiveHoldings.filter(h => parseFloat(h.units) > 0).map(h => h.id));
                                  } else {
                                    setSelectedHoldings([]);
                                  }
                                }}
                              />
                            </th>
                            <th className="px-3 py-2 text-left text-[var(--foreground)]">Name</th>
                            <th className="px-3 py-2 text-left text-[var(--foreground)]">Identifier</th>
                            <th className="px-3 py-2 text-left text-[var(--foreground)]">Account</th>
                            <th className="px-3 py-2 text-left text-[var(--foreground)]">Wrapper</th>
                            <th className="px-3 py-2 text-right text-[var(--foreground)]">Units</th>
                            <th className="px-3 py-2 text-right text-[var(--foreground)]">Book Cost</th>
                            <th className="px-3 py-2 text-right text-[var(--foreground)]">Price (GBP)</th>
                            <th className="px-3 py-2 text-right text-[var(--foreground)]">Value (GBP)</th>
                            <th className="px-3 py-2 text-left text-[var(--foreground)]">Last Updated</th>
                          </tr>
                        </thead>
                        <tbody>
                          {demoLiveHoldings.map((holding) => (
                            <tr key={holding.id} className={`border-b border-[var(--border)] ${parseFloat(holding.units) === 0 ? 'opacity-50' : ''}`}>
                              <td className="px-3 py-3">
                                <input 
                                  type="checkbox" 
                                  checked={selectedHoldings.includes(holding.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedHoldings([...selectedHoldings, holding.id]);
                                    } else {
                                      setSelectedHoldings(selectedHoldings.filter(id => id !== holding.id));
                                    }
                                  }}
                                  disabled={parseFloat(holding.units) === 0}
                                />
                              </td>
                              <td className="px-3 py-3 text-[var(--foreground)]">
                                {holding.name}
                                {parseFloat(holding.units) === 0 && <span className="ml-2 text-[var(--muted-foreground)]">(closed)</span>}
                              </td>
                              <td className="px-3 py-3 text-[var(--muted-foreground)]">
                                <div>{holding.isin}</div>
                                <div className="text-xs">{holding.ticker}</div>
                              </td>
                              <td className="px-3 py-3 text-[var(--muted-foreground)]">{holding.account}</td>
                              <td className="px-3 py-3">
                                <span className="px-2 py-1 bg-[var(--muted)] rounded text-[var(--foreground)]">{holding.wrapper}</span>
                              </td>
                              <td className="px-3 py-3 text-right text-[var(--foreground)]">{holding.units} 🔒</td>
                              <td className="px-3 py-3 text-right text-[var(--foreground)]">£{holding.bookCost} 🔒</td>
                              <td className="px-3 py-3 text-right text-[var(--muted-foreground)]">{holding.price}</td>
                              <td className="px-3 py-3 text-right font-semibold text-[var(--foreground)]">£{holding.value}</td>
                              <td className="px-3 py-3 text-xs text-[var(--muted-foreground)]">{holding.lastUpdated}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="px-4 py-3 bg-[var(--muted)] border border-[var(--border)] rounded-xl">
                      <p className="text-xs text-[var(--muted-foreground)]">
                        <span className="text-[var(--foreground)] font-semibold">🔒 Locked fields:</span> Units and Book Cost are read-only from broker. Prices/FX update automatically.
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {selectedHoldings.length} of {demoLiveHoldings.filter(h => parseFloat(h.units) > 0).length} selected
                      </p>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => setLiveStep(2)}
                          className="px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                        >
                          Back
                        </button>
                        <button 
                          onClick={() => {
                            alert(`Imported ${selectedHoldings.length} holdings with Source = ⚡ Live`);
                            onClose();
                          }}
                          disabled={selectedHoldings.length === 0}
                          className="px-4 py-2.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          Import {selectedHoldings.length} selected
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {category === 'listed' && (sourceType === 'semi-auto' || sourceType === 'manual') && (
              <div className="space-y-6">
                {/* Source badge */}
                <div className="flex items-center justify-between mb-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--muted)] border border-[var(--border)] rounded-full text-xs text-[var(--foreground)]">
                        <span>{sourceType === 'semi-auto' ? '⤿' : '✍'}</span>
                        {sourceType === 'semi-auto' ? 'Semi-auto' : 'Manual'}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">
                        {sourceType === 'semi-auto' && 'Prices/FX may update automatically in future. Positions are entered by you; reconcile with statements.'}
                        {sourceType === 'manual' && 'Entered by you; attach evidence for defensibility.'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <button
                    onClick={() => { setSourceType(null); setStep(1); }}
                    className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] underline"
                    data-testid="button-change-source"
                  >
                    Change source
                  </button>
                </div>

                {/* Step 1: Identify */}
                {step === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Identify</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">Wrapper <span className="text-red-500">*</span></label>
                        <select 
                          value={wrapper}
                          onChange={(e) => setWrapper(e.target.value)}
                          className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" 
                          data-testid="select-wrapper"
                        >
                          <option value="ISA">ISA</option>
                          <option value="SIPP">SIPP</option>
                          <option value="GIA">GIA</option>
                          <option value="Personal">Personal</option>
                        </select>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1.5">Choose the tax wrapper the position sits in.</p>
                        {errors.wrapper && <p className="text-xs text-red-500 mt-1">{errors.wrapper}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">Custodian / Broker <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          value={custodian}
                          onChange={(e) => setCustodian(e.target.value)}
                          placeholder="e.g., Vanguard, AJ Bell, Trading 212" 
                          className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" 
                          data-testid="input-custodian"
                        />
                        <p className="text-xs text-[var(--muted-foreground)] mt-1.5">Who holds this position.</p>
                        {errors.custodian && <p className="text-xs text-red-500 mt-1">{errors.custodian}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-[var(--muted-foreground)] mb-2">Account / Label</label>
                      <input 
                        type="text" 
                        value={accountLabel}
                        onChange={(e) => setAccountLabel(e.target.value)}
                        placeholder='e.g., "ISA-Core", "SIPP-Growth"' 
                        className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" 
                        data-testid="input-account-label"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">ISIN <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          value={isin}
                          onChange={(e) => setIsin(e.target.value.toUpperCase())}
                          placeholder="e.g., IE00B3RBWM25" 
                          maxLength={12}
                          className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" 
                          data-testid="input-isin"
                        />
                        <p className="text-xs text-[var(--muted-foreground)] mt-1.5">Prefer ISIN if you have it (12 characters, e.g., IE00B3RBWM25).</p>
                        {errors.isin && <p className="text-xs text-red-500 mt-1">{errors.isin}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">Ticker <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          value={ticker}
                          onChange={(e) => setTicker(e.target.value)}
                          placeholder="e.g., VUAG, VWRL, AAPL" 
                          maxLength={12}
                          className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" 
                          data-testid="input-ticker"
                        />
                        <p className="text-xs text-[var(--muted-foreground)] mt-1.5">Exchange tickers vary; use the code you trade.</p>
                        {errors.ticker && <p className="text-xs text-red-500 mt-1">{errors.ticker}</p>}
                      </div>
                    </div>
                    {errors.identifier && <p className="text-xs text-red-500 mt-1">{errors.identifier}</p>}

                    <div>
                      <label className="block text-xs text-[var(--muted-foreground)] mb-2">Name</label>
                      <input 
                        type="text" 
                        value={securityName}
                        onChange={(e) => setSecurityName(e.target.value)}
                        placeholder='e.g., "Vanguard FTSE All-World UCITS ETF (Acc)"' 
                        className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" 
                        data-testid="input-security-name"
                      />
                      <p className="text-xs text-[var(--muted-foreground)] mt-1.5">Auto-filled on match; editable in demo.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">Distribution type <span className="text-red-500">*</span></label>
                        <select 
                          value={distributionType}
                          onChange={(e) => setDistributionType(e.target.value)}
                          className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" 
                          data-testid="select-distribution"
                        >
                          <option value="Accumulating">Accumulating</option>
                          <option value="Distributing">Distributing</option>
                        </select>
                        {errors.distributionType && <p className="text-xs text-red-500 mt-1">{errors.distributionType}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">Bucket <span className="text-red-500">*</span></label>
                        <select 
                          value={bucket}
                          onChange={(e) => setBucket(e.target.value)}
                          className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" 
                          data-testid="select-bucket"
                        >
                          <option value="Global Equity">Global Equity</option>
                          <option value="Global Bonds">Global Bonds</option>
                          <option value="Cash-like">Cash-like</option>
                          <option value="Alternatives">Alternatives</option>
                          <option value="Other">Other</option>
                        </select>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1.5">Used for targets and bands.</p>
                        {errors.bucket && <p className="text-xs text-red-500 mt-1">{errors.bucket}</p>}
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      <button 
                        onClick={onClose}
                        className="px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors" 
                        data-testid="button-cancel-listed"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => setStep(2)}
                        className="px-4 py-2.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-sm hover:opacity-90 transition-opacity" 
                        data-testid="button-next-step1"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Position & Tax */}
                {step === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Position</h3>
                    
                    {/* Live source indicator */}
                    {sourceType === 'live' && (
                      <div className="px-4 py-3 bg-[var(--muted)] border border-[var(--border)] rounded-xl mb-4">
                        <p className="text-xs text-[var(--muted-foreground)]">
                          <span className="font-semibold text-[var(--foreground)]">Connected: Vanguard ISA (read-only)</span><br />
                          Position data is synced automatically from your connected broker.
                        </p>
                      </div>
                    )}
                    
                    {/* CSV source indicator */}
                    {sourceType === 'semi-auto' && (
                      <div className="px-4 py-3 bg-[var(--muted)] border border-[var(--border)] rounded-xl mb-4">
                        <p className="text-xs text-[var(--muted-foreground)]">
                          <span className="font-semibold text-[var(--foreground)]">Positions from CSV uploaded Oct 2025</span><br />
                          Units and cost prefilled from your import; prices update automatically.
                        </p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">
                          Units / Shares <span className="text-red-500">*</span>
                          {sourceType === 'live' && <span className="ml-2 text-[var(--muted-foreground)]">🔒</span>}
                        </label>
                        <input 
                          type="number" 
                          value={units}
                          onChange={(e) => setUnits(e.target.value)}
                          placeholder="0.000000" 
                          step="0.000001"
                          min="0"
                          readOnly={sourceType === 'live'}
                          disabled={sourceType === 'live'}
                          className={`w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] ${sourceType === 'live' ? 'opacity-60 cursor-not-allowed' : ''}`}
                          data-testid="input-units"
                        />
                        {errors.units && <p className="text-xs text-red-500 mt-1">{errors.units}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">Price (GBP)</label>
                        <input 
                          type="number" 
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="0.00" 
                          step="0.01"
                          min="0"
                          readOnly={sourceType === 'live' || sourceType === 'semi-auto'}
                          disabled={sourceType === 'live' || sourceType === 'semi-auto'}
                          className={`w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] ${(sourceType === 'live' || sourceType === 'semi-auto') ? 'opacity-60 cursor-not-allowed' : ''}`}
                          data-testid="input-price"
                        />
                        <p className="text-xs text-[var(--muted-foreground)] mt-1.5">
                          {sourceType === 'manual' ? 'End-of-day in GBP. Leave blank if unknown.' : 'Auto-filled from market data'}
                        </p>
                        {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                      </div>
                    </div>

                    <div className="px-4 py-3 bg-[var(--muted)] border border-[var(--border)] rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[var(--muted-foreground)]">Value (GBP)</span>
                        <span className="text-lg font-semibold text-[var(--foreground)]">{computedValue}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">
                          Cost basis (GBP)
                          {sourceType === 'live' && <span className="ml-2 text-[var(--muted-foreground)]">🔒</span>}
                        </label>
                        <input 
                          type="number" 
                          value={costBasis}
                          onChange={(e) => setCostBasis(e.target.value)}
                          placeholder="0.00" 
                          step="0.01"
                          min="0"
                          readOnly={sourceType === 'live'}
                          disabled={sourceType === 'live'}
                          className={`w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] ${sourceType === 'live' ? 'opacity-60 cursor-not-allowed' : ''}`}
                          data-testid="input-cost-basis"
                        />
                        <p className="text-xs text-[var(--muted-foreground)] mt-1.5">
                          {sourceType === 'live' ? 'Synced from broker' : 'What you paid in total, including fees.'}
                        </p>
                        {errors.costBasis && <p className="text-xs text-red-500 mt-1">{errors.costBasis}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">Fee/Charges (GBP)</label>
                        <input 
                          type="number" 
                          value={fees}
                          onChange={(e) => setFees(e.target.value)}
                          placeholder="0.00" 
                          step="0.01"
                          min="0"
                          className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" 
                          data-testid="input-fees"
                        />
                        {errors.fees && <p className="text-xs text-red-500 mt-1">{errors.fees}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">
                          Trade/Acquisition date
                          {sourceType === 'live' && <span className="ml-2 text-[var(--muted-foreground)]">🔒</span>}
                        </label>
                        <input 
                          type="date" 
                          value={tradeDate}
                          onChange={(e) => setTradeDate(e.target.value)}
                          readOnly={sourceType === 'live'}
                          disabled={sourceType === 'live'}
                          className={`w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] ${sourceType === 'live' ? 'opacity-60 cursor-not-allowed' : ''}`}
                          data-testid="input-trade-date"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">Valuation date</label>
                        <input 
                          type="date" 
                          value={valuationDate}
                          onChange={(e) => setValuationDate(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" 
                          data-testid="input-valuation-date"
                        />
                        {errors.valuationDate && <p className="text-xs text-red-500 mt-1">{errors.valuationDate}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-[var(--muted-foreground)] mb-2">Notes</label>
                      <textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g., initial transfer in, fractional, pooled lot, etc."
                        rows={3}
                        className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" 
                        data-testid="input-notes"
                      />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      <button 
                        onClick={() => setStep(1)}
                        className="px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors" 
                        data-testid="button-back-step2"
                      >
                        Back
                      </button>
                      <button 
                        onClick={() => setStep(3)}
                        className="px-4 py-2.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-sm hover:opacity-90 transition-opacity" 
                        data-testid="button-next-step2"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Evidence */}
                {step === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Evidence & reconciliation</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">Evidence state <span className="text-red-500">*</span></label>
                        <select 
                          value={evidenceState}
                          onChange={(e) => setEvidenceState(e.target.value)}
                          className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" 
                          data-testid="select-evidence-state"
                        >
                          <option value="On file">On file</option>
                          <option value="Missing">Missing</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">Evidence type {evidenceState === 'On file' && <span className="text-red-500">*</span>}</label>
                        <select 
                          value={evidenceType}
                          onChange={(e) => setEvidenceType(e.target.value)}
                          disabled={evidenceState === 'Missing'}
                          className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] disabled:opacity-50" 
                          data-testid="select-evidence-type"
                        >
                          <option value="Contract note">Contract note</option>
                          <option value="Broker statement">Broker statement</option>
                          <option value="Screenshot">Screenshot</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors.evidenceType && <p className="text-xs text-red-500 mt-1">{errors.evidenceType}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-[var(--muted-foreground)] mb-2">Reference</label>
                      <input 
                        type="text" 
                        value={evidenceReference}
                        onChange={(e) => setEvidenceReference(e.target.value)}
                        placeholder="e.g., contract note no. or statement period" 
                        className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" 
                        data-testid="input-evidence-reference"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-[var(--muted-foreground)] mb-2">Reminder</label>
                      <select 
                        value={reminder}
                        onChange={(e) => setReminder(e.target.value)}
                        className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" 
                        data-testid="select-reminder"
                      >
                        <option value="none">None</option>
                        <option value="monthly">Re-check price monthly</option>
                        <option value="quarterly">Re-upload statement quarterly</option>
                      </select>
                    </div>

                    <div className="px-4 py-3 bg-[var(--muted)] border border-[var(--border)] rounded-xl">
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Attach or reference a statement/contract note to keep your register defensible.
                      </p>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      <button 
                        onClick={() => setStep(2)}
                        className="px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors" 
                        data-testid="button-back-step3"
                      >
                        Back
                      </button>
                      <button 
                        onClick={handleSaveListedSecurity}
                        className="px-4 py-2.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-sm hover:opacity-90 transition-opacity" 
                        data-testid="button-save-listed"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Cash Category */}
            {category === 'cash' && !sourceType && (
              <div className="border border-[var(--border)] rounded-xl bg-[var(--card)] overflow-hidden shadow-sm mb-6">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1">Select source</h3>
                      <p className="text-xs text-[var(--muted-foreground)]">How will you add this cash account?</p>
                    </div>
                    <button
                      onClick={() => setCategory(null)}
                      className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] underline"
                    >
                      Change category
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <button
                      onClick={() => {
                        setSourceType('live');
                        setLiveStep(1);
                      }}
                      className="relative p-6 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all"
                      data-testid="source-live-cash"
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-3">⚡</div>
                        <h4 className="font-semibold text-[var(--foreground)] mb-2">Connect bank</h4>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          Batch import via Open Banking (recommended)
                        </p>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => {
                        setSourceType('semi-auto');
                        setStep(1);
                      }}
                      className="relative p-6 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all"
                      data-testid="source-csv-cash"
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-3">⇪</div>
                        <h4 className="font-semibold text-[var(--foreground)] mb-2">Import CSV</h4>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          Upload exported bank statement
                        </p>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => {
                        setSourceType('manual');
                        setStep(1);
                      }}
                      className="relative p-6 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all"
                      data-testid="source-manual-cash"
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-3">✍</div>
                        <h4 className="font-semibold text-[var(--foreground)] mb-2">Enter manually</h4>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          Type account details by hand
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Cash - Live Flow */}
            {category === 'cash' && sourceType === 'live' && (
              <div className="space-y-6">
                {/* Step 1: Bank Picker */}
                {liveStep === 1 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-semibold text-[var(--foreground)]">Connect to your bank securely (read-only)</h3>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">
                          Choose your bank to import accounts
                        </p>
                      </div>
                      <button 
                        onClick={() => { setSourceType(null); setLiveStep(1); }}
                        className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] underline"
                      >
                        Change source
                      </button>
                    </div>

                    <input 
                      type="text" 
                      placeholder="Search banks..."
                      className="w-full px-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      {demoBanks.map((bank) => (
                        <button
                          key={bank.id}
                          onClick={() => {
                            setSelectedBroker(bank.name);
                            setLiveStep(2);
                          }}
                          className="p-4 border border-[var(--border)] rounded-xl hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all text-left"
                        >
                          <h4 className="font-semibold text-[var(--foreground)] mb-1">{bank.name}</h4>
                          <p className="text-xs text-[var(--muted-foreground)]">{bank.types}</p>
                        </button>
                      ))}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button 
                        onClick={() => setSourceType(null)}
                        className="px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Consent & Authenticate */}
                {liveStep === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-semibold text-[var(--foreground)]">Consent & Authenticate</h3>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">
                          Connecting to {selectedBroker}
                        </p>
                      </div>
                    </div>

                    <div className="px-4 py-3 bg-[var(--muted)] border border-[var(--border)] rounded-xl">
                      <p className="text-sm font-semibold text-[var(--foreground)] mb-2">Read-only access:</p>
                      <ul className="text-xs text-[var(--muted-foreground)] space-y-1.5 ml-4 list-disc">
                        <li>Read accounts & balances (and currency)</li>
                        <li>Read account metadata (name/type/identifier)</li>
                        <li className="font-semibold">No payments. No changes.</li>
                      </ul>
                    </div>

                    <div className="text-xs text-[var(--muted-foreground)] px-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-xl">
                      Access is read-only and expires in 90 days. You can revoke any time.
                    </div>

                    {/* Mock auth form */}
                    <div className="border border-[var(--border)] rounded-xl p-6 space-y-4">
                      <h4 className="text-sm font-semibold text-[var(--foreground)] mb-3">Demo: {selectedBroker} Login</h4>
                      <div>
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">Username</label>
                        <input 
                          type="text" 
                          placeholder="demo@user.com"
                          className="w-full px-3 py-2 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">Password</label>
                        <input 
                          type="password" 
                          placeholder="••••••••"
                          className="w-full px-3 py-2 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">2FA Code</label>
                        <input 
                          type="text" 
                          placeholder="123456"
                          className="w-full px-3 py-2 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)]"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button 
                        onClick={() => setLiveStep(1)}
                        className="px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                      >
                        Back
                      </button>
                      <button 
                        onClick={() => {
                          setLiveStep(3);
                          setSelectedAccounts(['ba1', 'ba2']);
                        }}
                        className="px-4 py-2.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-sm hover:opacity-90 transition-opacity"
                      >
                        Approve & Continue
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Pick Accounts */}
                {liveStep === 3 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-semibold text-[var(--foreground)]">Pick Accounts</h3>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">
                          Select accounts to import
                        </p>
                      </div>
                    </div>

                    <div className="border border-[var(--border)] rounded-xl overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-[var(--muted)] border-b border-[var(--border)]">
                          <tr>
                            <th className="px-3 py-2 text-left">
                              <input type="checkbox" checked={selectedAccounts.length === demoBankAccounts.length} onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedAccounts(demoBankAccounts.map(a => a.id));
                                } else {
                                  setSelectedAccounts([]);
                                }
                              }} />
                            </th>
                            <th className="px-3 py-2 text-left text-[var(--foreground)]">Account name</th>
                            <th className="px-3 py-2 text-left text-[var(--foreground)]">Type</th>
                            <th className="px-3 py-2 text-left text-[var(--foreground)]">Currency</th>
                            <th className="px-3 py-2 text-left text-[var(--foreground)]">Balance</th>
                            <th className="px-3 py-2 text-left text-[var(--foreground)]">As-at</th>
                            <th className="px-3 py-2 text-left text-[var(--foreground)]">Suggested wrapper</th>
                            <th className="px-3 py-2 text-left text-[var(--foreground)]">Identifier</th>
                          </tr>
                        </thead>
                        <tbody>
                          {demoBankAccounts.map((account) => (
                            <tr key={account.id} className="border-b border-[var(--border)]">
                              <td className="px-3 py-3">
                                <input 
                                  type="checkbox" 
                                  checked={selectedAccounts.includes(account.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedAccounts([...selectedAccounts, account.id]);
                                    } else {
                                      setSelectedAccounts(selectedAccounts.filter(id => id !== account.id));
                                    }
                                  }}
                                />
                              </td>
                              <td className="px-3 py-3 text-[var(--foreground)]">{account.name}</td>
                              <td className="px-3 py-3 text-[var(--muted-foreground)]">{account.type}</td>
                              <td className="px-3 py-3 text-[var(--muted-foreground)]">
                                {account.currency}
                                {account.fxNote && <div className="text-xs text-[var(--muted-foreground)]">{account.fxNote}</div>}
                              </td>
                              <td className="px-3 py-3 text-[var(--foreground)]">{account.balance}</td>
                              <td className="px-3 py-3 text-[var(--muted-foreground)]">{account.asAt}</td>
                              <td className="px-3 py-3">
                                <select className="px-2 py-1 bg-[var(--input)] border border-[var(--border)] rounded text-[var(--foreground)] text-xs" defaultValue={account.wrapper}>
                                  <option>ISA</option>
                                  <option>SIPP</option>
                                  <option>GIA</option>
                                  <option>Personal</option>
                                </select>
                              </td>
                              <td className="px-3 py-3 text-[var(--muted-foreground)]">{account.identifier}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {selectedAccounts.length} account{selectedAccounts.length !== 1 ? 's' : ''} selected
                      </p>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => setLiveStep(2)}
                          className="px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                        >
                          Back
                        </button>
                        <button 
                          onClick={() => {
                            alert(`Imported ${selectedAccounts.length} cash accounts via ⚡ Live connection (Open Banking)`);
                            onClose();
                          }}
                          disabled={selectedAccounts.length === 0}
                          className="px-4 py-2.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          Import selected ({selectedAccounts.length})
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Cash - CSV/Manual placeholder */}
            {category === 'cash' && (sourceType === 'semi-auto' || sourceType === 'manual') && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--muted)] border border-[var(--border)] rounded-full text-xs text-[var(--foreground)]">
                        <span>{sourceType === 'semi-auto' ? '⇪' : '✍'}</span>
                        {sourceType === 'semi-auto' ? 'CSV' : 'Manual'}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">
                        {sourceType === 'semi-auto' && 'Balance from CSV export.'}
                        {sourceType === 'manual' && 'Balance entered by you; attach a statement.'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <button
                    onClick={() => { setSourceType(null); setStep(1); }}
                    className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] underline"
                  >
                    Change source
                  </button>
                </div>

                <div className="px-6 py-12 text-center border border-[var(--border)] rounded-xl bg-[var(--muted)]">
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {sourceType === 'semi-auto' ? 'CSV import' : 'Manual entry'} form for Cash coming soon
                  </p>
                </div>
              </div>
            )}
            
            {category === 'manual' && mode === 'asset' && (
              <div className="space-y-6">
                {/* Identify Section */}
                <div>
                  <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Identify</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-[var(--muted-foreground)] mb-2">Name</label>
                      <input 
                        type="text" 
                        placeholder='e.g., "Classic Car", "Art — 1970 lithograph", "Foreign bank account"' 
                        className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" 
                        data-testid="input-manual-name" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">Category / Bucket</label>
                        <select className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" data-testid="select-category">
                          <option>Global Equity</option>
                          <option>Global Bonds</option>
                          <option>Cash</option>
                          <option>Property</option>
                          <option>Alternatives</option>
                          <option>Private Equity</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">Wrapper</label>
                        <select className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" data-testid="select-wrapper-manual">
                          <option>ISA</option>
                          <option>SIPP</option>
                          <option>GIA</option>
                          <option>Personal</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--muted-foreground)] mb-2">Custodian / Location (optional)</label>
                      <input 
                        type="text" 
                        placeholder='e.g., "Safe deposit", "Registrar", "Gallery", "Foreign bank"' 
                        className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" 
                        data-testid="input-custodian-manual" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--muted-foreground)] mb-2">Integration tag</label>
                      <div className="inline-flex items-center gap-2 px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-full text-sm">
                        <span>✍ Manual</span>
                        <span className="text-[var(--muted-foreground)] text-xs" title="Value entered by you; attach evidence">ⓘ</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amount Section */}
                <div>
                  <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Amount</h3>
                  <div className="flex gap-3 mb-4">
                    <button
                      onClick={() => setAmountMode('single')}
                      className={`px-4 py-2 rounded-xl border text-sm transition-all ${amountMode === 'single' ? 'bg-[var(--primary)] border-[var(--primary)] text-[var(--primary-foreground)]' : 'bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]'}`}
                    >
                      Single value
                    </button>
                    <button
                      onClick={() => setAmountMode('units')}
                      className={`px-4 py-2 rounded-xl border text-sm transition-all ${amountMode === 'units' ? 'bg-[var(--primary)] border-[var(--primary)] text-[var(--primary-foreground)]' : 'bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]'}`}
                    >
                      Units & price
                    </button>
                  </div>
                  {amountMode === 'single' ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">Value (GBP)</label>
                        <input 
                          type="number" 
                          placeholder="0.00" 
                          className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" 
                          data-testid="input-value" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">As-at date</label>
                        <input 
                          type="date" 
                          className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" 
                          data-testid="input-date" 
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">Units</label>
                        <input 
                          type="number" 
                          placeholder="0.00" 
                          className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" 
                          data-testid="input-units" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">Price (GBP)</label>
                        <input 
                          type="number" 
                          placeholder="0.00" 
                          className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" 
                          data-testid="input-price" 
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Evidence Section */}
                <div>
                  <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Evidence</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">Evidence type</label>
                        <select className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" data-testid="select-evidence">
                          <option>Statement</option>
                          <option>Certificate</option>
                          <option>Invoice</option>
                          <option>Appraisal</option>
                          <option>Screenshot</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">Reference (optional)</label>
                        <input 
                          type="text" 
                          placeholder="Invoice no., cert ref, URL note" 
                          className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" 
                          data-testid="input-reference" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--muted-foreground)] mb-2">Reminder (optional)</label>
                      <input 
                        type="text" 
                        placeholder='e.g., "Ask me to re-value every 12 months"' 
                        className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" 
                        data-testid="input-reminder" 
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button className="px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors" data-testid="button-cancel">
                    Cancel
                  </button>
                  <button className="px-4 py-2.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-sm hover:opacity-90 transition-opacity" data-testid="button-save-manual-asset">
                    Save
                  </button>
                </div>
              </div>
            )}
            {category === 'manual' && mode === 'liability' && (
              <div className="space-y-6">
                {/* Details Section */}
                <div>
                  <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Details</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">Liability type</label>
                        <select className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" data-testid="select-liability-type">
                          <option>Mortgage</option>
                          <option>Personal loan</option>
                          <option>Business loan</option>
                          <option>Credit card</option>
                          <option>Margin loan</option>
                          <option>Car finance</option>
                          <option>Tax owed</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">Name / Lender</label>
                        <input 
                          type="text" 
                          placeholder="e.g., HSBC Mortgage" 
                          className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" 
                          data-testid="input-lender" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--muted-foreground)] mb-2">Linked asset (optional)</label>
                      <select className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" data-testid="select-linked-asset">
                        <option value="">None</option>
                        <option>42 Elm Street — Property</option>
                        <option>Classic Car — Alternative</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Amounts & Terms Section */}
                <div>
                  <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Amounts & Terms</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">Outstanding principal (GBP)</label>
                        <input 
                          type="number" 
                          placeholder="0.00" 
                          className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" 
                          data-testid="input-principal" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">Interest rate (%)</label>
                        <input 
                          type="number" 
                          placeholder="0.00" 
                          step="0.01"
                          className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" 
                          data-testid="input-interest-rate" 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">Monthly repayment (GBP)</label>
                        <input 
                          type="number" 
                          placeholder="0.00" 
                          className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" 
                          data-testid="input-repayment" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">Term end / Due date</label>
                        <input 
                          type="date" 
                          className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" 
                          data-testid="input-term-end" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Evidence Section */}
                <div>
                  <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Evidence</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">Evidence type</label>
                        <select className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" data-testid="select-evidence-liability">
                          <option>Statement</option>
                          <option>Certificate</option>
                          <option>Invoice</option>
                          <option>Appraisal</option>
                          <option>Screenshot</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">Reference (optional)</label>
                        <input 
                          type="text" 
                          placeholder="Invoice no., cert ref, URL note" 
                          className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" 
                          data-testid="input-reference-liability" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button className="px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors" data-testid="button-cancel-liability">
                    Cancel
                  </button>
                  <button className="px-4 py-2.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-sm hover:opacity-90 transition-opacity" data-testid="button-save-manual-liability">
                    Save
                  </button>
                </div>
              </div>
            )}
            {category !== 'listed' && category !== 'manual' && (
              <div className="text-center py-8 text-[var(--muted-foreground)]">
                <p>Form for {categories.find(c => c.id === category)?.label} coming soon (demo)</p>
              </div>
            )}
          </div>
        </div>
        )}
      </div>

      {/* Command Palette */}
      {showCommandPalette && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60" onClick={() => setShowCommandPalette(false)}>
          <div className="w-full max-w-2xl bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 p-3 border-b border-[var(--border)]">
              <Search className="h-5 w-5 text-[var(--muted-foreground)]" />
              <input 
                type="text" 
                placeholder="Search quick actions..." 
                className="flex-1 bg-[var(--input)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                autoFocus
                data-testid="input-command-search"
              />
            </div>
            <div className="max-h-[60vh] overflow-auto p-2.5">
              {['Add listed security', 'Add cash account', 'Add crypto (exchange)', 'Add crypto (on-chain)', 'Add property', 'Add private equity', 'AI import', 'CSV import'].map((action, idx) => (
                <button 
                  key={idx}
                  className="w-full text-left px-3 py-2.5 rounded-xl border border-transparent hover:bg-[var(--muted)] hover:border-[var(--border)] transition-all flex items-center gap-3 text-sm text-[var(--foreground)]"
                  data-testid={`command-${idx}`}
                >
                  <span className="text-[var(--muted-foreground)]">⌘{idx + 1}</span>
                  <span>{action}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
