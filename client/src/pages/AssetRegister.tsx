import { useState } from 'react';
import { Search, FileText, Upload, Download, Printer, X, Command, HelpCircle, Info, TrendingUp, Wallet, Bitcoin, Home, Briefcase, Sparkles, FileEdit, Building2, CreditCard, Landmark, Car } from 'lucide-react';
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
  const transactions = [
    { date: '28 Oct 2025', action: 'Buy', identifier: 'IE00B5BMR087', asset: 'Vanguard FTSE Global', units: '45.50', price: '£42.10', fees: '£0.00', tax: '£0.00', net: '£1,915.55', broker: 'Vanguard', wrapper: 'ISA', evidence: 'Contract note' },
    { date: '15 Oct 2025', action: 'Buy', identifier: 'IE00B1S75N64', asset: 'Vanguard Bond Index', units: '25.00', price: '£24.50', fees: '£3.50', tax: '£0.00', net: '£616.00', broker: 'AJ Bell', wrapper: 'SIPP', evidence: 'Contract note' },
    { date: '01 Oct 2025', action: 'Sell', identifier: 'GB0031348658', asset: 'HSBC Holdings', units: '150', price: '£6.82', fees: '£5.00', tax: '£12.30', net: '£1,005.70', broker: 'Trading 212', wrapper: 'GIA', evidence: 'Contract note' },
  ];

  const rowPadding = density === 'compact' ? 'py-2 px-3' : 'py-3 px-4';

  return (
    <div id="tour-transactions-table">
      <div className="overflow-auto border border-[var(--border)] rounded-xl bg-[var(--card)] shadow-sm mb-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[var(--muted)] border-b border-[var(--border)]">
              <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Trade Date</th>
              <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Action</th>
              <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Identifier</th>
              <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Asset</th>
              <th className={`${rowPadding} text-right text-xs text-[var(--muted-foreground)] font-medium`}>Units</th>
              <th className={`${rowPadding} text-right text-xs text-[var(--muted-foreground)] font-medium`}>Price</th>
              <th className={`${rowPadding} text-right text-xs text-[var(--muted-foreground)] font-medium`}>Fees</th>
              <th className={`${rowPadding} text-right text-xs text-[var(--muted-foreground)] font-medium`}>Tax</th>
              <th className={`${rowPadding} text-right text-xs text-[var(--muted-foreground)] font-medium`}>Net Amount</th>
              <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Broker</th>
              <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Wrapper</th>
              <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Evidence</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, idx) => (
              <tr key={idx} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/50 transition-colors" data-testid={`row-transaction-${idx}`}>
                <td className={`${rowPadding} text-sm text-[var(--foreground)]`}>{tx.date}</td>
                <td className={rowPadding}>
                  <span className={`px-2 py-1 rounded-full text-xs ${tx.action === 'Buy' ? 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20' : 'bg-[var(--destructive)]/10 text-[var(--destructive)] border border-[var(--destructive)]/20'}`}>
                    {tx.action}
                  </span>
                </td>
                <td className={`${rowPadding} text-sm text-[var(--foreground)]`}>{tx.identifier}</td>
                <td className={`${rowPadding} text-sm text-[var(--foreground)]`}>{tx.asset}</td>
                <td className={`${rowPadding} text-right text-sm text-[var(--foreground)]`}>{tx.units}</td>
                <td className={`${rowPadding} text-right text-sm text-[var(--foreground)]`}>{tx.price}</td>
                <td className={`${rowPadding} text-right text-sm text-[var(--muted-foreground)]`}>{tx.fees}</td>
                <td className={`${rowPadding} text-right text-sm text-[var(--muted-foreground)]`}>{tx.tax}</td>
                <td className={`${rowPadding} text-right text-sm text-[var(--foreground)] font-medium`}>{tx.net}</td>
                <td className={`${rowPadding} text-sm text-[var(--foreground)]`}>{tx.broker}</td>
                <td className={rowPadding}><WrapperTag wrapper={tx.wrapper} /></td>
                <td className={`${rowPadding} text-sm text-[var(--muted-foreground)]`}>{tx.evidence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm">
        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
          <strong className="text-[var(--foreground)]">Auditability note:</strong> All transactions are recorded for Section 104 pooling calculations and CGT reporting. ISA and SIPP transactions are exempt from capital gains tax.
        </p>
      </div>
    </div>
  );
}

function DocumentsTab({ onViewDoc }: any) {
  const docs = [
    { title: 'Vanguard ISA Statement Oct 2025', type: 'Statement', date: '31 Oct 2025', coverage: 'ISA holdings reconciliation' },
    { title: 'AJ Bell SIPP Valuation', type: 'Valuation', date: '31 Oct 2025', coverage: 'Pension portfolio snapshot' },
    { title: '42 Elm Street Title Deed', type: 'Property', date: '15 Mar 2023', coverage: 'Property ownership proof' },
    { title: 'EIS Certificate - FinTech Ventures', type: 'Tax Relief', date: '01 Jan 2024', coverage: 'EIS investment certification' },
    { title: 'Ledger Wallet Balance Export', type: 'Crypto', date: '01 Nov 2025', coverage: 'BTC holdings verification' },
    { title: 'MetaMask Transaction History', type: 'Crypto', date: '01 Nov 2025', coverage: 'ETH on-chain activity' },
  ];

  return (
    <div id="tour-docs-grid" className="grid grid-cols-3 gap-4">
      {docs.map((doc, idx) => (
        <button
          key={idx}
          onClick={onViewDoc}
          className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl hover:bg-[var(--muted)] transition-colors text-left shadow-sm"
          data-testid={`doc-${idx}`}
        >
          <div className="flex items-start gap-3 mb-2">
            <FileText className="h-5 w-5 text-[var(--primary)]" />
            <h3 className="text-sm font-semibold text-[var(--foreground)] flex-1">{doc.title}</h3>
          </div>
          <div className="space-y-1 text-xs text-[var(--muted-foreground)]">
            <div>Type: {doc.type}</div>
            <div>Uploaded: {doc.date}</div>
            <div>Coverage: {doc.coverage}</div>
          </div>
        </button>
      ))}
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
  const [category, setCategory] = useState('listed');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [amountMode, setAmountMode] = useState<'single' | 'units'>('single');
  const [step, setStep] = useState(1);
  
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
                onClick={() => setCategory(cat.id)}
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

        {/* Stepper Panel */}
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
            {category === 'listed' && (
              <div className="space-y-6">
                {/* Semi-auto badge */}
                <div className="flex items-center gap-2 mb-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--muted)] border border-[var(--border)] rounded-full text-xs text-[var(--foreground)]">
                        <span>⤿</span> Semi-auto
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">Prices/FX may update automatically in future. Positions are entered by you; reconcile with statements.</p>
                    </TooltipContent>
                  </Tooltip>
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
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">Units / Shares <span className="text-red-500">*</span></label>
                        <input 
                          type="number" 
                          value={units}
                          onChange={(e) => setUnits(e.target.value)}
                          placeholder="0.000000" 
                          step="0.000001"
                          min="0"
                          className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" 
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
                          className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" 
                          data-testid="input-price"
                        />
                        <p className="text-xs text-[var(--muted-foreground)] mt-1.5">End-of-day in GBP. Leave blank if unknown.</p>
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
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">Cost basis (GBP)</label>
                        <input 
                          type="number" 
                          value={costBasis}
                          onChange={(e) => setCostBasis(e.target.value)}
                          placeholder="0.00" 
                          step="0.01"
                          min="0"
                          className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" 
                          data-testid="input-cost-basis"
                        />
                        <p className="text-xs text-[var(--muted-foreground)] mt-1.5">What you paid in total, including fees.</p>
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
                        <label className="block text-xs text-[var(--muted-foreground)] mb-2">Trade/Acquisition date</label>
                        <input 
                          type="date" 
                          value={tradeDate}
                          onChange={(e) => setTradeDate(e.target.value)}
                          className="w-full px-3 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" 
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
