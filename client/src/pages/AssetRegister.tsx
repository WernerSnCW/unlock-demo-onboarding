import { useState } from 'react';
import { Search, FileText, Upload, Download, Printer, X, Command, HelpCircle, Info, TrendingUp, TrendingDown, Wallet, Bitcoin, Home, Briefcase, Sparkles, FileEdit, Building2, CreditCard, Landmark, Car, Plug, PlugZap, FileStack, ChevronLeft, ChevronRight, AlertCircle, Clock, Settings, AlertTriangle, ChevronDown, Pencil, Check, CheckCircle } from 'lucide-react';
import Header from '../components/Header';
import { AssetRegisterTour, TourBeacon } from '../components/AssetRegisterTour';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';

export default function AssetRegister() {
  const [activeTab, setActiveTab] = useState('holdings');
  const [detailDrawer, setDetailDrawer] = useState<string | null>(null);
  const [docLightbox, setDocLightbox] = useState(false);
  const [addAssetModal, setAddAssetModal] = useState(false);
  const [addLiabilityModal, setAddLiabilityModal] = useState(false);
  const [aiImportModal, setAiImportModal] = useState(false);
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
                  onClick={() => setAiImportModal(true)}
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

            {/* Primary Actions Bar */}
            <div className="mb-6 flex items-center justify-between p-4 bg-[var(--muted)]/30 border border-[var(--border)] rounded-xl">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAddAssetModal(true)}
                  className="px-4 py-2.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors shadow-sm flex items-center gap-2"
                  data-testid="button-add-asset-main"
                >
                  <Sparkles className="h-4 w-4" />
                  Add asset
                </button>
                <button
                  onClick={() => setAddLiabilityModal(true)}
                  className="px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] rounded-xl text-sm font-medium hover:bg-[var(--muted)] transition-colors flex items-center gap-2"
                  data-testid="button-add-liability-main"
                >
                  <CreditCard className="h-4 w-4" />
                  Add liability
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-2 bg-transparent border border-[var(--border)] text-[var(--foreground)] rounded-xl text-sm hover:bg-[var(--muted)] transition-colors flex items-center gap-2"
                  data-testid="button-print-main"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </button>
                <button
                  className="px-3 py-2 bg-transparent border border-[var(--border)] text-[var(--foreground)] rounded-xl text-sm hover:bg-[var(--muted)] transition-colors flex items-center gap-2"
                  data-testid="button-export-main"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
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

      {/* AI Import Modal */}
      {aiImportModal && (
        <AIImportModal onClose={() => setAiImportModal(false)} />
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
  const [viewMode, setViewMode] = useState('list');
  
  const holdings = [
    { asset: 'Vanguard FTSE Global All Cap', type: 'ETF', assetType: 'ETF', identifier: 'IE00B5BMR087', custodian: 'Vanguard Investor UK', account: 'Vanguard ISA', wrapper: 'ISA', units: '1,234.56', cost: '£45,600', price: '£42.18', value: '£52,080', return: '14.2% IRR', bucket: 'Global Equity', tax: 'Accumulating', evidence: 'On file', completeness: 95, source: 'live', reconciled: 'Yes', lastStatement: '31 Oct 2025' },
    { asset: 'Vanguard Global Bond Index', type: 'ETF', assetType: 'Bond ETF', identifier: 'IE00B1S75N64', custodian: 'AJ Bell', account: 'AJ Bell SIPP', wrapper: 'SIPP', units: '845.20', cost: '£18,900', price: '£24.65', value: '£20,834', return: '10.2% TWR', bucket: 'Fixed Income', tax: 'SIPP relief', evidence: 'On file', completeness: 95, source: 'csv', reconciled: 'Yes', lastStatement: '31 Oct 2025' },
    { asset: 'HSBC Savings Account', type: 'Cash', assetType: 'Cash', identifier: 'GB29HSBC12345678', custodian: 'HSBC', account: 'HSBC Instant', wrapper: 'GIA', units: '1', cost: '£12,500', price: '£12,500', value: '£12,500', return: '4.1% APR', bucket: 'Cash', tax: 'Taxable', evidence: 'On file', completeness: 100, source: 'live', reconciled: 'Yes', lastStatement: '31 Oct 2025' },
    { asset: '42 Elm Street, Manchester', type: 'BTL Property', assetType: 'Property', identifier: 'Title: MAN123456', custodian: 'Personal', account: 'Direct ownership', wrapper: 'Personal', units: '1', cost: '£165,000', price: '£195,000', value: '£195,000', return: '5.8% yield', bucket: 'Property', tax: 'CGT', evidence: 'Valuation due', completeness: 82, source: 'manual', reconciled: 'No', lastStatement: '—' },
    { asset: 'Bitcoin', type: 'Cryptocurrency', assetType: 'Crypto', identifier: 'BTC', custodian: 'Ledger - Main', account: 'Ledger hardware wallet', wrapper: 'Personal', units: '0.4520', cost: '£18,200', price: '£54,280', value: '£24,535', return: '+34.8%', bucket: 'Alternatives', tax: 'CGT', evidence: 'On file', completeness: 90, source: 'ocr', reconciled: 'No', lastStatement: '—' },
    { asset: 'Ethereum', type: 'Cryptocurrency', assetType: 'Crypto', identifier: 'ETH (on-chain)', custodian: 'MetaMask Wallet', account: 'MetaMask hot wallet', wrapper: 'Personal', units: '6.82', cost: '£11,400', price: '£2,248', value: '£15,331', return: '+34.5%', bucket: 'Alternatives', tax: 'On-chain verify', evidence: 'On-chain verify', completeness: 88, source: 'ocr', reconciled: 'No', lastStatement: '—' },
    { asset: 'FinTech Ventures Ltd', type: 'EIS shares', assetType: 'Private Equity', identifier: 'Unlisted', custodian: 'Personal', account: 'Direct ownership', wrapper: 'Personal', units: '5,000', cost: '£50,000', price: '£50,000', value: '£50,000', return: 'Holding', bucket: 'Private Equity', tax: 'EIS', evidence: 'On file', completeness: 92, countdown: '~603 days', source: 'manual', reconciled: 'No', lastStatement: '—' },
  ];

  const getSourceIcon = (source: string) => {
    switch(source) {
      case 'live': return '⚡';
      case 'csv': return '⤿';
      case 'ocr': return '📎';
      case 'manual': return '✍';
      default: return '';
    }
  };

  const rowPadding = density === 'compact' ? 'py-2 px-3' : 'py-3 px-4';

  const viewModes = [
    { id: 'list', label: 'List' },
    { id: 'custodian', label: 'Custodian' },
    { id: 'wrapper', label: 'Wrapper' },
    { id: 'asset-class', label: 'Asset Class' },
    { id: 'instrument', label: 'Instrument' },
    { id: 'tax-evidence', label: 'Tax/Evidence' },
    { id: 'currency', label: 'Currency' },
    { id: 'maturity', label: 'Maturity' },
    { id: 'liabilities', label: 'Liabilities' },
    { id: 'net-worth', label: 'Net Worth' }
  ];

  return (
    <div className="space-y-4">
      {/* View by segmented control */}
      <div className="flex items-center gap-3 px-1">
        <span className="text-sm font-medium text-[var(--muted-foreground)]">View by:</span>
        <div className="flex items-center gap-1 p-1 bg-[var(--muted)] rounded-xl">
          {viewModes.map(mode => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all ${
                viewMode === mode.id
                  ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
              data-testid={`view-mode-${mode.id}`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Source legend */}
      <div className="px-4 py-2 bg-[var(--muted)]/50 border border-[var(--border)] rounded-lg text-xs text-[var(--muted-foreground)]">
        <span className="font-medium">Source legend:</span> ⚡ Live (read-only) • ⤿ CSV • 📎 From document • ✍ Manual
      </div>

      {viewMode === 'list' && (
        <div id="tour-holdings-table" className="overflow-auto border border-[var(--border)] rounded-xl bg-[var(--card)] shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[var(--muted)] border-b border-[var(--border)] sticky top-0">
                <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>
                  <div className="flex items-center gap-1">
                    Asset
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                          <Info className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">The name of the investment or asset, such as a fund, property, or cash account.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>
                  <div className="flex items-center gap-1">
                    Type
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                          <Info className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">The asset class or instrument type (e.g., ETF, Bond ETF, Property, Crypto, Cash).</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>
                  <div className="flex items-center gap-1">
                    Source
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                          <Info className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">How this data was added: ⚡ Live (real-time API), ⤿ CSV import, 📎 From document/OCR, or ✍ Manual entry.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>
                  <div className="flex items-center gap-1">
                    Identifier
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                          <Info className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">Unique identifier such as ISIN (listed securities), property title number, or wallet address (crypto).</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>
                  <div className="flex items-center gap-1">
                    Custodian
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                          <Info className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">The institution or platform holding the asset (e.g., Vanguard, AJ Bell, HSBC, or Personal for direct holdings).</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>
                  <div className="flex items-center gap-1">
                    Wrapper
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                          <Info className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">Tax wrapper or account type: ISA (tax-free), SIPP (pension), GIA (general investment account), or Personal (direct ownership).</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className={`${rowPadding} text-right text-xs text-[var(--muted-foreground)] font-medium`}>
                  <div className="flex items-center justify-end gap-1">
                    Units
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                          <Info className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">Number of shares, units, or quantity held. For property or cash, typically shown as 1.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className={`${rowPadding} text-right text-xs text-[var(--muted-foreground)] font-medium`}>
                  <div className="flex items-center justify-end gap-1">
                    Cost
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                          <Info className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">Your original purchase price or cost basis. Used to calculate capital gains and track performance.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className={`${rowPadding} text-right text-xs text-[var(--muted-foreground)] font-medium`}>
                  <div className="flex items-center justify-end gap-1">
                    Price
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                          <Info className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">Current market price per unit or latest valuation for properties and unlisted assets.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className={`${rowPadding} text-right text-xs text-[var(--muted-foreground)] font-medium`}>
                  <div className="flex items-center justify-end gap-1">
                    Value
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                          <Info className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">Total current market value (Price × Units). This is the amount you would receive if liquidated today.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>
                  <div className="flex items-center gap-1">
                    Return
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                          <Info className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">Performance measure: IRR (internal rate of return), TWR (time-weighted return), APR (annual percentage rate), or yield %.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>
                  <div className="flex items-center gap-1">
                    Bucket
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                          <Info className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">Strategic allocation category used for portfolio rebalancing and Targets & Bands (e.g., Equity, Bonds, Cash, Property, Alternatives).</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>
                  <div className="flex items-center gap-1">
                    Tax/Relief
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                          <Info className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">Tax treatment or relief status: EIS/SEIS/VCT (tax-advantaged schemes), SIPP relief (pension tax relief), CGT (capital gains tax), or fund treatment (accumulating/distributing).</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>
                  <div className="flex items-center gap-1">
                    Evidence
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                          <Info className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">Supporting documentation status: "On file" (statement uploaded), "Valuation due" (needs update), or verification method (e.g., on-chain for crypto).</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>
                  <div className="flex items-center gap-1">
                    Complete
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                          <Info className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">Data completeness score (0-100%). Higher scores indicate all required fields are filled and documentation is on file. Aim for 90%+ for audit-ready records.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
                <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>
                  <div className="flex items-center gap-1">
                    Actions
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                          <Info className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">Click "View" to see detailed information, edit fields, upload documents, or manage transactions for this holding.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
              </tr>
            </thead>
        <tbody>
          {holdings.map((holding, idx) => (
            <tr key={idx} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/50 transition-colors">
              <td className={rowPadding}>
                <div className="font-medium text-sm text-[var(--foreground)]" data-testid={`text-asset-${idx}`}>{holding.asset}</div>
              </td>
              <td className={rowPadding}>
                <span className="px-2 py-0.5 rounded text-xs bg-[var(--muted)] text-[var(--muted-foreground)]">
                  {holding.assetType}
                </span>
              </td>
              <td className={rowPadding}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-lg cursor-help" data-testid={`source-${idx}`}>
                      {getSourceIcon(holding.source)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs capitalize">{holding.source === 'csv' ? 'CSV import' : holding.source === 'ocr' ? 'From document' : holding.source === 'live' ? 'Live connection (read-only)' : 'Manual entry'}</p>
                  </TooltipContent>
                </Tooltip>
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
              <td className={`${rowPadding} text-sm ${
                holding.return.includes('-') || holding.return.toLowerCase().includes('loss') 
                  ? 'text-[var(--destructive)]' 
                  : holding.return.includes('+') || holding.return.includes('%') || holding.return.includes('IRR') || holding.return.includes('TWR') || holding.return.includes('APR')
                    ? 'text-[var(--success)]' 
                    : 'text-[var(--muted-foreground)]'
              }`}>{holding.return}</td>
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
      )}

      {/* Custodian View */}
      {viewMode === 'custodian' && (
        <div className="border border-[var(--border)] rounded-xl bg-[var(--card)] shadow-sm overflow-hidden">
          {/* Group by custodian */}
          {['Vanguard Investor UK', 'AJ Bell', 'HSBC', 'Personal'].map((custodian, custIdx) => {
            const custodianHoldings = holdings.filter(h => h.custodian === custodian);
            if (custodianHoldings.length === 0) return null;
            
            const totalValue = custodianHoldings.reduce((sum, h) => {
              const val = parseFloat(h.value.replace(/[£,]/g, ''));
              return sum + val;
            }, 0);
            
            return (
              <div key={custodian} className="border-b border-[var(--border)] last:border-b-0">
                {/* Custodian header */}
                <div className="px-4 py-3 bg-[var(--muted)]/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)]" />
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--foreground)]">{custodian}</h3>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {custodianHoldings.length} holdings • £{totalValue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[var(--muted-foreground)]">Reconciled:</span>
                    <span className={custodianHoldings[0].reconciled === 'Yes' ? 'text-[var(--success)]' : 'text-[var(--warning)]'}>
                      {custodianHoldings[0].reconciled}
                    </span>
                    <span className="text-[var(--muted-foreground)] ml-3">Last statement:</span>
                    <span className="text-[var(--foreground)]">{custodianHoldings[0].lastStatement}</span>
                  </div>
                </div>
                
                {/* Holdings table for this custodian */}
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[var(--muted)]/10 border-b border-[var(--border)]">
                      <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Account</th>
                      <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Asset</th>
                      <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Wrapper</th>
                      <th className={`${rowPadding} text-right text-xs text-[var(--muted-foreground)] font-medium`}>Units</th>
                      <th className={`${rowPadding} text-right text-xs text-[var(--muted-foreground)] font-medium`}>Value</th>
                      <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Return</th>
                      <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {custodianHoldings.map((holding, idx) => (
                      <tr key={idx} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/30 transition-colors last:border-b-0">
                        <td className={`${rowPadding} text-sm text-[var(--foreground)]`}>{holding.account}</td>
                        <td className={rowPadding}>
                          <div className="font-medium text-sm text-[var(--foreground)]">{holding.asset}</div>
                          <div className="text-xs text-[var(--muted-foreground)]">{holding.assetType}</div>
                        </td>
                        <td className={rowPadding}>
                          <WrapperTag wrapper={holding.wrapper} />
                        </td>
                        <td className={`${rowPadding} text-right text-sm text-[var(--foreground)]`}>{holding.units}</td>
                        <td className={`${rowPadding} text-right text-sm text-[var(--foreground)] font-medium`}>{holding.value}</td>
                        <td className={`${rowPadding} text-sm text-[var(--success)]`}>{holding.return}</td>
                        <td className={rowPadding}>
                          <div className="flex gap-2">
                            <button className="px-3 py-1 bg-transparent border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors">
                              Reconcile
                            </button>
                            <button className="px-3 py-1 bg-transparent border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors">
                              Statement
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}

      {/* Wrapper View */}
      {viewMode === 'wrapper' && (
        <div className="space-y-4">
          {['ISA', 'SIPP', 'GIA', 'Personal'].map(wrapper => {
            const wrapperHoldings = holdings.filter(h => h.wrapper === wrapper);
            if (wrapperHoldings.length === 0) return null;
            
            const totalValue = wrapperHoldings.reduce((sum, h) => {
              const val = parseFloat(h.value.replace(/[£,]/g, ''));
              return sum + val;
            }, 0);
            
            const totalCost = wrapperHoldings.reduce((sum, h) => {
              const val = parseFloat(h.cost.replace(/[£,]/g, ''));
              return sum + val;
            }, 0);
            
            const gainLoss = totalValue - totalCost;
            const gainLossPercent = ((gainLoss / totalCost) * 100).toFixed(1);
            
            return (
              <div key={wrapper} className="border border-[var(--border)] rounded-xl bg-[var(--card)] shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-[var(--muted)]/20 border-b border-[var(--border)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <WrapperTag wrapper={wrapper} />
                      <div>
                        <h3 className="text-sm font-semibold text-[var(--foreground)]">{wrapper} Wrapper</h3>
                        <p className="text-xs text-[var(--muted-foreground)]">{wrapperHoldings.length} holdings</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <div className="text-xs text-[var(--muted-foreground)]">Total Value</div>
                        <div className="font-semibold text-[var(--foreground)]">£{totalValue.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-[var(--muted-foreground)]">Unrealised G/L</div>
                        <div className={`font-semibold ${gainLoss >= 0 ? 'text-[var(--success)]' : 'text-[var(--destructive)]'}`}>
                          £{gainLoss.toLocaleString()} ({gainLossPercent}%)
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[var(--muted-foreground)]">% of Portfolio</div>
                        <div className="font-semibold text-[var(--foreground)]">{((totalValue / 370280) * 100).toFixed(1)}%</div>
                      </div>
                      <button className="px-3 py-1.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-xs hover:opacity-90 transition-opacity">
                        Move target
                      </button>
                    </div>
                  </div>
                </div>
                
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[var(--muted)]/5 border-b border-[var(--border)]">
                      <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Asset</th>
                      <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Custodian</th>
                      <th className={`${rowPadding} text-right text-xs text-[var(--muted-foreground)] font-medium`}>Cost</th>
                      <th className={`${rowPadding} text-right text-xs text-[var(--muted-foreground)] font-medium`}>Value</th>
                      <th className={`${rowPadding} text-right text-xs text-[var(--muted-foreground)] font-medium`}>G/L</th>
                      <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Return</th>
                      <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Bucket</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wrapperHoldings.map((holding, idx) => {
                      const cost = parseFloat(holding.cost.replace(/[£,]/g, ''));
                      const value = parseFloat(holding.value.replace(/[£,]/g, ''));
                      const gl = value - cost;
                      const glPercent = ((gl / cost) * 100).toFixed(1);
                      
                      return (
                        <tr key={idx} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/30 transition-colors last:border-b-0">
                          <td className={rowPadding}>
                            <div className="font-medium text-sm text-[var(--foreground)]">{holding.asset}</div>
                            <div className="text-xs text-[var(--muted-foreground)]">{holding.assetType}</div>
                          </td>
                          <td className={`${rowPadding} text-sm text-[var(--foreground)]`}>{holding.custodian}</td>
                          <td className={`${rowPadding} text-right text-sm text-[var(--foreground)]`}>{holding.cost}</td>
                          <td className={`${rowPadding} text-right text-sm text-[var(--foreground)] font-medium`}>{holding.value}</td>
                          <td className={`${rowPadding} text-right text-sm ${gl >= 0 ? 'text-[var(--success)]' : 'text-[var(--destructive)]'}`}>
                            £{gl.toLocaleString()} ({glPercent}%)
                          </td>
                          <td className={`${rowPadding} text-sm text-[var(--success)]`}>{holding.return}</td>
                          <td className={`${rowPadding} text-sm text-[var(--foreground)]`}>{holding.bucket}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}

      {/* Asset Class View */}
      {viewMode === 'asset-class' && (
        <div className="border border-[var(--border)] rounded-xl bg-[var(--card)] shadow-sm overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[var(--muted)] border-b border-[var(--border)]">
                <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Asset Class</th>
                <th className={`${rowPadding} text-right text-xs text-[var(--muted-foreground)] font-medium`}>Current Value</th>
                <th className={`${rowPadding} text-right text-xs text-[var(--muted-foreground)] font-medium`}>Target %</th>
                <th className={`${rowPadding} text-right text-xs text-[var(--muted-foreground)] font-medium`}>Current %</th>
                <th className={`${rowPadding} text-right text-xs text-[var(--muted-foreground)] font-medium`}>Deviation</th>
                <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Suggested Action</th>
                <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Holdings</th>
              </tr>
            </thead>
            <tbody>
              {[
                { bucket: 'Global Equity', target: 40, value: 52080 },
                { bucket: 'Fixed Income', target: 25, value: 20834 },
                { bucket: 'Cash', target: 10, value: 12500 },
                { bucket: 'Property', target: 15, value: 195000 },
                { bucket: 'Alternatives', target: 7, value: 39866 },
                { bucket: 'Private Equity', target: 3, value: 50000 }
              ].map((assetClass, idx) => {
                const currentPercent = ((assetClass.value / 370280) * 100);
                const deviation = currentPercent - assetClass.target;
                const absDeviation = Math.abs(deviation);
                
                const suggestedAction = absDeviation < 2 ? 'On target' : 
                                      deviation > 0 ? `Reduce by £${((deviation / 100) * 370280).toLocaleString(undefined, {maximumFractionDigits: 0})}` : 
                                      `Increase by £${((Math.abs(deviation) / 100) * 370280).toLocaleString(undefined, {maximumFractionDigits: 0})}`;
                
                const classHoldings = holdings.filter(h => h.bucket === assetClass.bucket);
                
                return (
                  <tr key={idx} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/50 transition-colors last:border-b-0">
                    <td className={rowPadding}>
                      <div className="font-medium text-sm text-[var(--foreground)]">{assetClass.bucket}</div>
                    </td>
                    <td className={`${rowPadding} text-right text-sm text-[var(--foreground)] font-medium`}>
                      £{assetClass.value.toLocaleString()}
                    </td>
                    <td className={`${rowPadding} text-right text-sm text-[var(--muted-foreground)]`}>
                      {assetClass.target}%
                    </td>
                    <td className={`${rowPadding} text-right text-sm text-[var(--foreground)]`}>
                      {currentPercent.toFixed(1)}%
                    </td>
                    <td className={`${rowPadding} text-right text-sm font-medium ${
                      absDeviation < 2 ? 'text-[var(--success)]' : 
                      absDeviation < 5 ? 'text-[var(--warning)]' : 
                      'text-[var(--destructive)]'
                    }`}>
                      {deviation > 0 ? '+' : ''}{deviation.toFixed(1)}%
                    </td>
                    <td className={rowPadding}>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        absDeviation < 2 ? 'bg-[var(--success)]/10 text-[var(--success)]' : 
                        deviation > 0 ? 'bg-[var(--destructive)]/10 text-[var(--destructive)]' : 
                        'bg-[var(--warning)]/10 text-[var(--warning)]'
                      }`}>
                        {suggestedAction}
                      </span>
                    </td>
                    <td className={`${rowPadding} text-sm text-[var(--muted-foreground)]`}>
                      {classHoldings.length} {classHoldings.length === 1 ? 'holding' : 'holdings'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Instrument View */}
      {viewMode === 'instrument' && (
        <div className="border border-[var(--border)] rounded-xl bg-[var(--card)] shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-[var(--muted)]/20 border-b border-[var(--border)] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Holdings by Instrument Type</h3>
            <p className="text-xs text-[var(--muted-foreground)]">Type-specific columns adapt to each instrument</p>
          </div>
          
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[var(--muted)] border-b border-[var(--border)]">
                <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Asset</th>
                <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Type</th>
                <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Custodian</th>
                <th className={`${rowPadding} text-right text-xs text-[var(--muted-foreground)] font-medium`}>Units/Nominal</th>
                <th className={`${rowPadding} text-right text-xs text-[var(--muted-foreground)] font-medium`}>Price/Rate</th>
                <th className={`${rowPadding} text-right text-xs text-[var(--muted-foreground)] font-medium`}>Value</th>
                <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Type Details</th>
                <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((holding, idx) => {
                // Type-specific details
                let typeDetails = '';
                if (holding.assetType === 'Cash') {
                  typeDetails = 'Instant access • 4.1% AER';
                } else if (holding.assetType === 'Bond ETF') {
                  typeDetails = 'Coupon: 3.2% • Maturity: 2028';
                } else if (holding.assetType === 'ETF') {
                  typeDetails = 'Accumulation • TER: 0.23%';
                } else if (holding.assetType === 'Property') {
                  typeDetails = 'BTL • Yield: 5.8%';
                } else if (holding.assetType === 'Crypto') {
                  typeDetails = 'On-chain • Self-custody';
                } else if (holding.assetType === 'Private Equity') {
                  typeDetails = 'EIS • Unlisted • 603 days hold';
                }
                
                return (
                  <tr key={idx} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/50 transition-colors last:border-b-0">
                    <td className={rowPadding}>
                      <div className="font-medium text-sm text-[var(--foreground)]">{holding.asset}</div>
                    </td>
                    <td className={rowPadding}>
                      <span className="px-2 py-0.5 rounded text-xs bg-[var(--muted)] text-[var(--muted-foreground)]">
                        {holding.assetType}
                      </span>
                    </td>
                    <td className={`${rowPadding} text-sm text-[var(--foreground)]`}>{holding.custodian}</td>
                    <td className={`${rowPadding} text-right text-sm text-[var(--foreground)]`}>{holding.units}</td>
                    <td className={`${rowPadding} text-right text-sm text-[var(--foreground)]`}>{holding.price}</td>
                    <td className={`${rowPadding} text-right text-sm text-[var(--foreground)] font-medium`}>{holding.value}</td>
                    <td className={`${rowPadding} text-xs text-[var(--muted-foreground)]`}>{typeDetails}</td>
                    <td className={rowPadding}>
                      <button className="px-3 py-1 bg-transparent border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors">
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tax/Evidence View */}
      {viewMode === 'tax-evidence' && (
        <div className="border border-[var(--border)] rounded-xl bg-[var(--card)] shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-[var(--muted)]/20 border-b border-[var(--border)] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Tax Treatment & Evidence Status</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-xs">
                Tax lens
              </button>
              <button className="px-3 py-1.5 bg-transparent border border-[var(--border)] text-[var(--foreground)] rounded-xl text-xs hover:bg-[var(--muted)]">
                Evidence lens
              </button>
            </div>
          </div>
          
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[var(--muted)] border-b border-[var(--border)]">
                <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Asset</th>
                <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Tax Treatment</th>
                <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Relief/Wrapper</th>
                <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Hold Period</th>
                <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Evidence Strength</th>
                <th className={`${rowPadding} text-right text-xs text-[var(--muted-foreground)] font-medium`}>Linked Docs</th>
                <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Status</th>
                <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((holding, idx) => {
                const evidenceStrength = holding.completeness >= 95 ? 'High' : holding.completeness >= 85 ? 'Medium' : 'Low';
                const linkedDocs = holding.completeness >= 95 ? 3 : holding.completeness >= 85 ? 2 : 1;
                const holdPeriod = holding.countdown ? holding.countdown.replace('~', '') : '—';
                
                return (
                  <tr key={idx} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/50 transition-colors last:border-b-0">
                    <td className={rowPadding}>
                      <div className="font-medium text-sm text-[var(--foreground)]">{holding.asset}</div>
                      <div className="text-xs text-[var(--muted-foreground)]">{holding.assetType}</div>
                    </td>
                    <td className={rowPadding}>
                      <span className="text-sm text-[var(--foreground)]">{holding.tax}</span>
                    </td>
                    <td className={rowPadding}>
                      <WrapperTag wrapper={holding.wrapper} />
                    </td>
                    <td className={`${rowPadding} text-sm text-[var(--foreground)]`}>
                      {holdPeriod}
                    </td>
                    <td className={rowPadding}>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        evidenceStrength === 'High' ? 'bg-[var(--success)]/10 text-[var(--success)]' :
                        evidenceStrength === 'Medium' ? 'bg-[var(--warning)]/10 text-[var(--warning)]' :
                        'bg-[var(--destructive)]/10 text-[var(--destructive)]'
                      }`}>
                        {evidenceStrength}
                      </span>
                    </td>
                    <td className={`${rowPadding} text-right text-sm text-[var(--foreground)]`}>
                      {linkedDocs}
                    </td>
                    <td className={rowPadding}>
                      <EvidenceStatus status={holding.evidence} />
                    </td>
                    <td className={rowPadding}>
                      <button className="px-3 py-1 bg-transparent border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors">
                        Add docs
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Liabilities View */}
      {viewMode === 'liabilities' && (
        <div className="space-y-4">
          {/* Info banner */}
          <div className="px-4 py-3 bg-[var(--info)]/10 border border-[var(--info)]/20 rounded-xl">
            <p className="text-sm text-[var(--foreground)]">
              <span className="font-semibold">No liabilities recorded yet.</span> Add mortgages, loans, or credit facilities to track your complete financial position.
            </p>
          </div>

          {/* Sample liabilities table */}
          <div className="border border-[var(--border)] rounded-xl bg-[var(--card)] shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-[var(--muted)]/20 border-b border-[var(--border)]">
              <h3 className="text-sm font-semibold text-[var(--foreground)]">Liabilities Register (Demo)</h3>
            </div>
            
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[var(--muted)] border-b border-[var(--border)]">
                  <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Type</th>
                  <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Lender</th>
                  <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Account</th>
                  <th className={`${rowPadding} text-right text-xs text-[var(--muted-foreground)] font-medium`}>Principal</th>
                  <th className={`${rowPadding} text-right text-xs text-[var(--muted-foreground)] font-medium`}>Outstanding</th>
                  <th className={`${rowPadding} text-right text-xs text-[var(--muted-foreground)] font-medium`}>Rate (APR)</th>
                  <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Term</th>
                  <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Linked Asset</th>
                  <th className={`${rowPadding} text-right text-xs text-[var(--muted-foreground)] font-medium`}>LTV</th>
                  <th className={`${rowPadding} text-left text-xs text-[var(--muted-foreground)] font-medium`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--border)] hover:bg-[var(--muted)]/50 transition-colors">
                  <td className={rowPadding}>
                    <span className="px-2 py-0.5 rounded text-xs bg-[var(--warning)]/10 text-[var(--warning)]">
                      Mortgage
                    </span>
                  </td>
                  <td className={`${rowPadding} text-sm text-[var(--foreground)]`}>Nationwide BS</td>
                  <td className={`${rowPadding} text-sm text-[var(--muted-foreground)]`}>***4567</td>
                  <td className={`${rowPadding} text-right text-sm text-[var(--foreground)]`}>£150,000</td>
                  <td className={`${rowPadding} text-right text-sm text-[var(--foreground)] font-medium`}>£128,450</td>
                  <td className={`${rowPadding} text-right text-sm text-[var(--foreground)]`}>3.89%</td>
                  <td className={`${rowPadding} text-sm text-[var(--foreground)]`}>18y 4m</td>
                  <td className={`${rowPadding} text-sm text-[var(--primary)]`}>42 Elm St, Manchester</td>
                  <td className={`${rowPadding} text-right text-sm ${
                    65.9 <= 75 ? 'text-[var(--success)]' : 'text-[var(--warning)]'
                  }`}>65.9%</td>
                  <td className={rowPadding}>
                    <button className="px-3 py-1 bg-transparent border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors">
                      View
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-[var(--border)] hover:bg-[var(--muted)]/50 transition-colors last:border-b-0">
                  <td colSpan={10} className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
                    No additional liabilities recorded
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Add liability button */}
          <div className="flex justify-end">
            <button className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-sm hover:opacity-90 transition-opacity">
              Add Liability
            </button>
          </div>
        </div>
      )}

      {/* Net Worth View */}
      {viewMode === 'net-worth' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 border border-[var(--border)] rounded-xl bg-[var(--card)]">
              <div className="text-xs text-[var(--muted-foreground)] mb-1">Net Worth</div>
              <div className="text-2xl font-bold text-[var(--foreground)]">£370,280</div>
              <div className="text-xs text-[var(--success)] mt-1">Assets only (demo)</div>
            </div>
            <div className="p-4 border border-[var(--border)] rounded-xl bg-[var(--card)]">
              <div className="text-xs text-[var(--muted-foreground)] mb-1">Total Assets</div>
              <div className="text-2xl font-bold text-[var(--foreground)]">£370,280</div>
              <div className="text-xs text-[var(--muted-foreground)] mt-1">7 holdings</div>
            </div>
            <div className="p-4 border border-[var(--border)] rounded-xl bg-[var(--card)]">
              <div className="text-xs text-[var(--muted-foreground)] mb-1">Total Liabilities</div>
              <div className="text-2xl font-bold text-[var(--muted-foreground)]">£0</div>
              <div className="text-xs text-[var(--muted-foreground)] mt-1">No debts recorded</div>
            </div>
            <div className="p-4 border border-[var(--border)] rounded-xl bg-[var(--card)]">
              <div className="text-xs text-[var(--muted-foreground)] mb-1">Liquid Ratio</div>
              <div className="text-2xl font-bold text-[var(--foreground)]">23.2%</div>
              <div className="text-xs text-[var(--muted-foreground)] mt-1">Cash + liquid securities</div>
            </div>
          </div>

          {/* Assets by Class */}
          <div className="border border-[var(--border)] rounded-xl bg-[var(--card)] shadow-sm p-6">
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Assets by Class</h3>
            <div className="space-y-3">
              {[
                { name: 'Property', value: 195000, color: 'var(--primary)' },
                { name: 'Global Equity', value: 52080, color: 'var(--success)' },
                { name: 'Private Equity', value: 50000, color: 'var(--accent)' },
                { name: 'Alternatives', value: 39866, color: 'var(--warning)' },
                { name: 'Fixed Income', value: 20834, color: 'var(--info)' },
                { name: 'Cash', value: 12500, color: 'var(--secondary)' }
              ].map((asset, idx) => {
                const percentage = ((asset.value / 370280) * 100).toFixed(1);
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-[var(--foreground)]">{asset.name}</span>
                      <span className="text-[var(--muted-foreground)]">£{asset.value.toLocaleString()} ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all"
                        style={{ width: `${percentage}%`, backgroundColor: `var(${asset.color})` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Export button */}
          <div className="flex justify-end">
            <button className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-sm hover:opacity-90 transition-opacity">
              Export Beneficiary/Advisor Snapshot
            </button>
          </div>
        </div>
      )}

      {/* Placeholder for other view modes */}
      {!['list', 'custodian', 'wrapper', 'asset-class', 'instrument', 'tax-evidence', 'liabilities', 'net-worth'].includes(viewMode) && (
        <div className="p-12 border border-[var(--border)] rounded-xl bg-[var(--card)] text-center">
          <p className="text-[var(--muted-foreground)]">
            {viewMode.charAt(0).toUpperCase() + viewMode.slice(1).replace('-', ' ')} view coming soon...
          </p>
        </div>
      )}
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

// Targets & Bands Types and Data
interface TargetBucket {
  id: string;
  name: string;
  current: number;
  target: number;
  bandMin: number;
  bandMax: number;
  valueGbp: number;
  holdings: TargetHoldingContribution[];
  valuationStale?: boolean;
  lastValuation?: string;
}

interface TargetHoldingContribution {
  name: string;
  wrapper: string;
  account: string;
  valueGbp: number;
  percentage: number;
}

interface TradeProposal {
  action: 'Sell' | 'Buy';
  holding: string;
  account: string;
  wrapper: string;
  amountGbp: number;
  units?: number;
  estFees: number;
  estCgt: number;
  resultingPercent: number;
}

const targetsDemoPortfolioValue = 245000;

const targetsDemoBuckets: TargetBucket[] = [
  {
    id: 'equity',
    name: 'Equity',
    current: 46,
    target: 40,
    bandMin: 35,
    bandMax: 45,
    valueGbp: 112700,
    holdings: [
      { name: 'Vanguard Global All-Cap', wrapper: 'ISA', account: 'Vanguard ISA', valueGbp: 78000, percentage: 31.8 },
      { name: 'FTSE 100 Tracker', wrapper: 'SIPP', account: 'AJ Bell SIPP', valueGbp: 24700, percentage: 10.1 },
      { name: 'Tech ETF', wrapper: 'GIA', account: 'AJ Bell GIA', valueGbp: 10000, percentage: 4.1 }
    ]
  },
  {
    id: 'bonds',
    name: 'Bonds',
    current: 18,
    target: 30,
    bandMin: 25,
    bandMax: 35,
    valueGbp: 44100,
    holdings: [
      { name: 'UK Gilt Index', wrapper: 'ISA', account: 'Vanguard ISA', valueGbp: 32000, percentage: 13.1 },
      { name: 'Corporate Bond Fund', wrapper: 'SIPP', account: 'AJ Bell SIPP', valueGbp: 12100, percentage: 4.9 }
    ]
  },
  {
    id: 'cash',
    name: 'Cash',
    current: 14,
    target: 10,
    bandMin: 5,
    bandMax: 15,
    valueGbp: 34300,
    holdings: [
      { name: 'Premium Bonds', wrapper: 'Personal', account: 'NS&I', valueGbp: 20000, percentage: 8.2 },
      { name: 'Cash ISA', wrapper: 'ISA', account: 'Marcus', valueGbp: 14300, percentage: 5.8 }
    ]
  },
  {
    id: 'alternatives',
    name: 'Alternatives',
    current: 12,
    target: 10,
    bandMin: 5,
    bandMax: 15,
    valueGbp: 29400,
    holdings: [
      { name: 'EIS Portfolio', wrapper: 'Personal', account: 'Direct Holdings', valueGbp: 18000, percentage: 7.3 },
      { name: 'Property Fund', wrapper: 'ISA', account: 'Vanguard ISA', valueGbp: 11400, percentage: 4.7 }
    ],
    valuationStale: true,
    lastValuation: '2025-06-15'
  },
  {
    id: 'property',
    name: 'Property',
    current: 10,
    target: 10,
    bandMin: 5,
    bandMax: 15,
    valueGbp: 24500,
    holdings: [
      { name: '42 Elm St, Manchester', wrapper: 'Personal', account: 'Direct Property', valueGbp: 24500, percentage: 10.0 }
    ],
    valuationStale: true,
    lastValuation: '2025-03-20'
  }
];

type TargetsViewMode = 'bucket' | 'wrapper' | 'account' | 'liabilities';

function TargetsTab() {
  const [viewMode, setViewMode] = useState<TargetsViewMode>('bucket');
  const [policyDrawerOpen, setPolicyDrawerOpen] = useState(false);
  const [rebalancePlannerOpen, setRebalancePlannerOpen] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState<TargetBucket | null>(null);
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [breakdownBucket, setBreakdownBucket] = useState<TargetBucket | null>(null);
  const [snoozedBuckets, setSnoozedBuckets] = useState<Set<string>>(new Set());

  const bucketsOutOfBand = targetsDemoBuckets.filter(b => 
    b.current < b.bandMin || b.current > b.bandMax
  );

  const TargetsWrapperTag = ({ wrapper }: { wrapper: string }) => {
    const colors: Record<string, string> = {
      'ISA': 'bg-[var(--success)]/10 text-[var(--success)]',
      'SIPP': 'bg-[var(--info)]/10 text-[var(--info)]',
      'GIA': 'bg-[var(--warning)]/10 text-[var(--warning)]',
      'Personal': 'bg-[var(--muted)] text-[var(--muted-foreground)]'
    };
    
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[wrapper] || colors.Personal}`}>
        {wrapper}
      </span>
    );
  };

  const DriftChip = ({ bucket }: { bucket: TargetBucket }) => {
    const drift = bucket.current - bucket.target;
    const absDrift = Math.abs(drift);
    const isBreached = bucket.current < bucket.bandMin || bucket.current > bucket.bandMax;
    
    const getChipColor = () => {
      if (isBreached) {
        return drift > 0 
          ? 'bg-[var(--destructive)]/10 text-[var(--destructive)] border-[var(--destructive)]/20'
          : 'bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20';
      }
      return 'bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]';
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getChipColor()}`} data-testid={`drift-chip-${bucket.id}`}>
        {drift > 0 ? '+' : ''}{drift.toFixed(1)}% {isBreached ? 'out of band' : 'in band'}
      </span>
    );
  };

  const BucketCard = ({ bucket }: { bucket: TargetBucket }) => {
    const drift = bucket.current - bucket.target;
    const isBreached = bucket.current < bucket.bandMin || bucket.current > bucket.bandMax;
    const isSnoozed = snoozedBuckets.has(bucket.id);

    const handleProposeTrades = (b: TargetBucket) => {
      setSelectedBucket(b);
      setRebalancePlannerOpen(true);
    };

    const handleSnooze = (bucketId: string) => {
      setSnoozedBuckets(prev => {
        const newSet = new Set(prev);
        if (newSet.has(bucketId)) {
          newSet.delete(bucketId);
        } else {
          newSet.add(bucketId);
        }
        return newSet;
      });
    };

    const handleBreakdown = (b: TargetBucket) => {
      setBreakdownBucket(b);
      setBreakdownOpen(true);
    };

    return (
      <div className={`p-6 border-2 rounded-xl bg-[var(--card)] transition-all ${
        isBreached && !isSnoozed ? 'border-[var(--destructive)]' : 'border-[var(--border)]'
      }`} data-testid={`bucket-card-${bucket.id}`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-[var(--foreground)]">{bucket.name}</h3>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              £{bucket.valueGbp.toLocaleString()}
            </p>
          </div>
          <DriftChip bucket={bucket} />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-xs text-[var(--muted-foreground)] mb-1">Current</div>
            <div className="text-2xl font-bold text-[var(--foreground)]">{bucket.current}%</div>
          </div>
          <div>
            <div className="text-xs text-[var(--muted-foreground)] mb-1">Target</div>
            <div className="text-2xl font-bold text-[var(--primary)]">{bucket.target}%</div>
          </div>
          <div>
            <div className="text-xs text-[var(--muted-foreground)] mb-1">Band</div>
            <div className="text-lg font-semibold text-[var(--foreground)]">{bucket.bandMin}–{bucket.bandMax}%</div>
          </div>
        </div>

        <div className="mb-4 h-2 bg-[var(--muted)] rounded-full overflow-hidden">
          <div 
            className={`h-full ${drift > 0 ? 'bg-[var(--destructive)]' : drift < 0 ? 'bg-[var(--warning)]' : 'bg-[var(--success)]'}`}
            style={{ width: `${bucket.current}%` }}
          />
        </div>

        {bucket.valuationStale && (
          <div className="mb-4 px-3 py-2 bg-[var(--warning)]/10 border border-[var(--warning)]/20 rounded-lg flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-[var(--warning)] mt-0.5 flex-shrink-0" />
            <div className="text-xs text-[var(--foreground)]">
              <strong>Actions paused — valuation due</strong>
              <div className="text-[var(--muted-foreground)] mt-0.5">
                Last updated: {bucket.lastValuation}
              </div>
            </div>
          </div>
        )}

        {isSnoozed && (
          <div className="mb-4 px-3 py-2 bg-[var(--info)]/10 border border-[var(--info)]/20 rounded-lg flex items-center gap-2">
            <Clock className="h-4 w-4 text-[var(--info)]" />
            <span className="text-xs text-[var(--foreground)]">Rebalance snoozed for 30 days</span>
          </div>
        )}

        <button
          onClick={() => handleBreakdown(bucket)}
          className="text-sm text-[var(--primary)] hover:underline mb-4 flex items-center gap-1"
          data-testid={`breakdown-link-${bucket.id}`}
        >
          See holdings ({bucket.holdings.length}) <ChevronDown className="h-4 w-4" />
        </button>

        <div className="flex gap-2">
          {bucket.valuationStale ? (
            <button
              className="flex-1 px-4 py-2 bg-[var(--warning)] text-white rounded-xl text-sm font-medium hover:bg-[var(--warning)]/90 transition-colors"
              data-testid={`update-valuation-${bucket.id}`}
            >
              Update valuation
            </button>
          ) : (
            <>
              <button
                onClick={() => handleProposeTrades(bucket)}
                disabled={isSnoozed}
                className="flex-1 px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid={`propose-trades-${bucket.id}`}
              >
                Propose trades
              </button>
              <button
                onClick={() => handleSnooze(bucket.id)}
                className="px-4 py-2 bg-transparent border border-[var(--border)] text-[var(--foreground)] rounded-xl text-sm font-medium hover:bg-[var(--muted)] transition-colors"
                data-testid={`snooze-${bucket.id}`}
              >
                {isSnoozed ? 'Un-snooze' : 'Snooze'}
              </button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="px-4 py-2 bg-transparent border border-[var(--border)] text-[var(--foreground)] rounded-xl text-sm font-medium hover:bg-[var(--muted)] transition-colors"
                    data-testid={`why-this-${bucket.id}`}
                  >
                    Why this?
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    {drift > 0 
                      ? `${bucket.name} is overweight due to price appreciation. Consider rebalancing to avoid concentration risk.`
                      : drift < 0
                      ? `${bucket.name} is underweight. Consider topping up to maintain target allocation.`
                      : 'Your allocation is within target bands. No action needed right now.'
                    }
                  </p>
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div id="tour-targets-table" className="space-y-6">
      {/* Info banner */}
      <div className="px-4 py-3 bg-[var(--info)]/10 border border-[var(--info)]/20 rounded-xl flex items-start gap-3">
        <Info className="h-5 w-5 text-[var(--info)] mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1">ⓘ How it works</h3>
          <p className="text-sm text-[var(--foreground)]">
            Targets set your long-run mix. Bands prevent over-trading. When a bucket drifts outside its band, we suggest the smallest set of trades to get you back inside—preferably inside your ISA/SIPP to avoid CGT.
          </p>
        </div>
      </div>

      {/* Compact header strip */}
      <div className="p-4 border border-[var(--border)] rounded-xl bg-[var(--card)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div>
            <div className="text-xs text-[var(--muted-foreground)] mb-1">Overall drift</div>
            <button
              className="text-sm font-semibold text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
              data-testid="overall-drift"
            >
              {bucketsOutOfBand.length} bucket{bucketsOutOfBand.length !== 1 ? 's' : ''} out of band
            </button>
          </div>

          <div>
            <div className="text-xs text-[var(--muted-foreground)] mb-1">Rebalance rule</div>
            <div className="text-sm text-[var(--foreground)]">Band breach • Trade min £500 • Review quarterly</div>
          </div>
        </div>

        <button
          onClick={() => setPolicyDrawerOpen(true)}
          className="px-4 py-2 bg-transparent border border-[var(--border)] text-[var(--foreground)] rounded-xl text-sm font-medium hover:bg-[var(--muted)] transition-colors flex items-center gap-2"
          data-testid="edit-policy"
        >
          <Settings className="h-4 w-4" />
          Edit policy
        </button>
      </div>

      {/* View controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="text-sm text-[var(--muted-foreground)]">View:</div>
        <div className="inline-flex rounded-xl border border-[var(--border)] bg-[var(--muted)]/20 p-1">
          <button
            onClick={() => setViewMode('bucket')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'bucket'
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
            }`}
            data-testid="view-bucket"
          >
            By Bucket
          </button>
          <button
            onClick={() => setViewMode('wrapper')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'wrapper'
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
            }`}
            data-testid="view-wrapper"
          >
            By Wrapper
          </button>
          <button
            onClick={() => setViewMode('account')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'account'
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
            }`}
            data-testid="view-account"
          >
            By Account
          </button>
          <button
            onClick={() => setViewMode('liabilities')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'liabilities'
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
            }`}
            data-testid="view-liabilities"
          >
            With Liabilities
          </button>
        </div>
      </div>

      {/* Bucket grid (default view) */}
      {viewMode === 'bucket' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {targetsDemoBuckets.map(bucket => (
            <BucketCard key={bucket.id} bucket={bucket} />
          ))}
        </div>
      )}

      {/* By Wrapper view */}
      {viewMode === 'wrapper' && (
        <div className="space-y-6">
          <div className="px-4 py-3 bg-[var(--muted)]/20 border border-[var(--border)] rounded-xl">
            <p className="text-sm text-[var(--foreground)]">
              <strong>Wrapper view</strong> shows Equity/Bonds/Cash within ISA/SIPP/GIA. Prefer ISA/SIPP trades to avoid CGT.
            </p>
          </div>
          
          {['ISA', 'SIPP', 'GIA', 'Personal'].map(wrapper => {
            const wrapperHoldings = targetsDemoBuckets.flatMap(b => 
              b.holdings.filter(h => h.wrapper === wrapper)
            );
            const wrapperTotal = wrapperHoldings.reduce((sum, h) => sum + h.valueGbp, 0);
            
            if (wrapperHoldings.length === 0) return null;
            
            return (
              <div key={wrapper} className="border border-[var(--border)] rounded-xl bg-[var(--card)] overflow-hidden">
                <div className="px-6 py-4 bg-[var(--muted)]/20 border-b border-[var(--border)] flex items-center justify-between">
                  <div>
                    <TargetsWrapperTag wrapper={wrapper} />
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">
                      £{wrapperTotal.toLocaleString()} • {((wrapperTotal / targetsDemoPortfolioValue) * 100).toFixed(1)}% of portfolio
                    </p>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-3">
                    {wrapperHoldings.map((holding, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-b-0">
                        <div>
                          <div className="text-sm font-medium text-[var(--foreground)]">{holding.name}</div>
                          <div className="text-xs text-[var(--muted-foreground)]">{holding.account}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-[var(--foreground)]">£{holding.valueGbp.toLocaleString()}</div>
                          <div className="text-xs text-[var(--muted-foreground)]">{holding.percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* By Account view */}
      {viewMode === 'account' && (
        <div className="space-y-6">
          <div className="px-4 py-3 bg-[var(--muted)]/20 border border-[var(--border)] rounded-xl">
            <p className="text-sm text-[var(--foreground)]">
              <strong>Account view</strong> groups holdings by custodian for reconciliation and account-specific rebalancing.
            </p>
          </div>
          
          {['Vanguard ISA', 'AJ Bell SIPP', 'AJ Bell GIA', 'Marcus', 'NS&I', 'Direct Holdings', 'Direct Property'].map(account => {
            const accountHoldings = targetsDemoBuckets.flatMap(b => 
              b.holdings.filter(h => h.account === account)
            );
            const accountTotal = accountHoldings.reduce((sum, h) => sum + h.valueGbp, 0);
            
            if (accountHoldings.length === 0) return null;
            
            return (
              <div key={account} className="border border-[var(--border)] rounded-xl bg-[var(--card)] overflow-hidden">
                <div className="px-6 py-4 bg-[var(--muted)]/20 border-b border-[var(--border)]">
                  <h3 className="text-sm font-semibold text-[var(--foreground)]">{account}</h3>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    £{accountTotal.toLocaleString()} • {((accountTotal / targetsDemoPortfolioValue) * 100).toFixed(1)}% of portfolio
                  </p>
                </div>
                
                <div className="p-6">
                  <div className="space-y-3">
                    {accountHoldings.map((holding, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-b-0">
                        <div>
                          <div className="text-sm font-medium text-[var(--foreground)]">{holding.name}</div>
                          <div className="text-xs text-[var(--muted-foreground)]">
                            <TargetsWrapperTag wrapper={holding.wrapper} />
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-[var(--foreground)]">£{holding.valueGbp.toLocaleString()}</div>
                          <div className="text-xs text-[var(--muted-foreground)]">{holding.percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* With Liabilities view */}
      {viewMode === 'liabilities' && (
        <div className="space-y-6">
          <div className="px-4 py-3 bg-[var(--muted)]/20 border border-[var(--border)] rounded-xl">
            <p className="text-sm text-[var(--foreground)]">
              <strong>Liabilities overlay</strong> shows net worth impact. Mortgage reduces effective property exposure; margin loan reduces cash bucket.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 border border-[var(--border)] rounded-xl bg-[var(--card)]">
              <div className="text-sm text-[var(--muted-foreground)] mb-2">Gross Assets</div>
              <div className="text-3xl font-bold text-[var(--foreground)]">£{targetsDemoPortfolioValue.toLocaleString()}</div>
            </div>
            
            <div className="p-6 border border-[var(--border)] rounded-xl bg-[var(--card)]">
              <div className="text-sm text-[var(--muted-foreground)] mb-2">Total Liabilities</div>
              <div className="text-3xl font-bold text-[var(--destructive)]">£128,450</div>
              <div className="text-xs text-[var(--muted-foreground)] mt-1">Mortgage: £128,450</div>
            </div>
            
            <div className="p-6 border border-[var(--border)] rounded-xl bg-[var(--success)]/10 border-[var(--success)]/20">
              <div className="text-sm text-[var(--muted-foreground)] mb-2">Net Worth</div>
              <div className="text-3xl font-bold text-[var(--success)]">£{(targetsDemoPortfolioValue - 128450).toLocaleString()}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {targetsDemoBuckets.map(bucket => {
              const adjustedValue = bucket.id === 'property' 
                ? bucket.valueGbp - 128450 
                : bucket.valueGbp;
              const adjustedPercent = bucket.id === 'property'
                ? -42.4
                : bucket.current;

              return (
                <div key={bucket.id} className="p-6 border-2 rounded-xl bg-[var(--card)] border-[var(--border)]">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--foreground)]">{bucket.name}</h3>
                      <p className="text-sm text-[var(--muted-foreground)] mt-1">
                        £{adjustedValue.toLocaleString()}
                        {bucket.id === 'property' && (
                          <span className="ml-2 text-xs text-[var(--destructive)]">(net of mortgage)</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-[var(--muted-foreground)] mb-1">Current</div>
                      <div className={`text-2xl font-bold ${adjustedPercent < 0 ? 'text-[var(--destructive)]' : 'text-[var(--foreground)]'}`}>
                        {adjustedPercent.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--muted-foreground)] mb-1">Target</div>
                      <div className="text-2xl font-bold text-[var(--primary)]">{bucket.target}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--muted-foreground)] mb-1">Band</div>
                      <div className="text-lg font-semibold text-[var(--foreground)]">{bucket.bandMin}–{bucket.bandMax}%</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Breakdown Drawer */}
      {breakdownOpen && breakdownBucket && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--card)] rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="sticky top-0 bg-[var(--card)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                {breakdownBucket.name} Holdings
              </h2>
              <button
                onClick={() => setBreakdownOpen(false)}
                className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors"
                data-testid="close-breakdown"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-3">
                {breakdownBucket.holdings.map((holding, idx) => (
                  <div key={idx} className="p-4 border border-[var(--border)] rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-[var(--foreground)]">{holding.name}</div>
                        <div className="text-xs text-[var(--muted-foreground)] mt-1">{holding.account}</div>
                      </div>
                      <TargetsWrapperTag wrapper={holding.wrapper} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <div className="text-xs text-[var(--muted-foreground)]">Value</div>
                        <div className="text-sm font-semibold text-[var(--foreground)]">£{holding.valueGbp.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-[var(--muted-foreground)]">% of Portfolio</div>
                        <div className="text-sm font-semibold text-[var(--foreground)]">{holding.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rebalance Planner Overlay */}
      {rebalancePlannerOpen && selectedBucket && (
        <TargetsRebalancePlanner
          bucket={selectedBucket}
          onClose={() => setRebalancePlannerOpen(false)}
          portfolioValue={targetsDemoPortfolioValue}
        />
      )}

      {/* Policy Drawer */}
      {policyDrawerOpen && (
        <TargetsPolicyDrawer onClose={() => setPolicyDrawerOpen(false)} />
      )}
    </div>
  );
}

function TargetsRebalancePlanner({ 
  bucket, 
  onClose, 
  portfolioValue 
}: { 
  bucket: TargetBucket; 
  onClose: () => void; 
  portfolioValue: number;
}) {
  const [goalType, setGoalType] = useState<'midpoint' | 'edge'>('midpoint');
  const [savedPlan, setSavedPlan] = useState(false);
  
  const targetPercent = goalType === 'midpoint' 
    ? bucket.target 
    : bucket.current > bucket.target ? bucket.bandMax : bucket.bandMin;
  
  const drift = bucket.current - targetPercent;
  const tradeAmountGbp = Math.abs(drift / 100 * portfolioValue);

  const generateTrades = (): TradeProposal[] => {
    const trades: TradeProposal[] = [];
    
    if (drift > 0) {
      const isaHolding = bucket.holdings.find(h => h.wrapper === 'ISA');
      const sippHolding = bucket.holdings.find(h => h.wrapper === 'SIPP');
      const giaHolding = bucket.holdings.find(h => h.wrapper === 'GIA');
      
      if (isaHolding && isaHolding.valueGbp >= tradeAmountGbp) {
        trades.push({
          action: 'Sell',
          holding: isaHolding.name,
          account: isaHolding.account,
          wrapper: 'ISA',
          amountGbp: tradeAmountGbp,
          units: Math.floor(tradeAmountGbp / 100),
          estFees: 0,
          estCgt: 0,
          resultingPercent: targetPercent
        });
      } else if (sippHolding && sippHolding.valueGbp >= tradeAmountGbp) {
        trades.push({
          action: 'Sell',
          holding: sippHolding.name,
          account: sippHolding.account,
          wrapper: 'SIPP',
          amountGbp: tradeAmountGbp,
          units: Math.floor(tradeAmountGbp / 100),
          estFees: 0,
          estCgt: 0,
          resultingPercent: targetPercent
        });
      } else if (giaHolding) {
        trades.push({
          action: 'Sell',
          holding: giaHolding.name,
          account: giaHolding.account,
          wrapper: 'GIA',
          amountGbp: Math.min(tradeAmountGbp, giaHolding.valueGbp),
          units: Math.floor(Math.min(tradeAmountGbp, giaHolding.valueGbp) / 100),
          estFees: 9.95,
          estCgt: Math.min(tradeAmountGbp, giaHolding.valueGbp) * 0.10,
          resultingPercent: targetPercent
        });
      }
    } else if (drift < 0) {
      trades.push({
        action: 'Buy',
        holding: bucket.holdings[0]?.name || `${bucket.name} Fund`,
        account: bucket.holdings[0]?.account || 'Vanguard ISA',
        wrapper: 'ISA',
        amountGbp: tradeAmountGbp,
        units: Math.floor(tradeAmountGbp / 100),
        estFees: 0,
        estCgt: 0,
        resultingPercent: targetPercent
      });
    }
    
    return trades;
  };

  const trades = generateTrades();

  const handleSavePlan = () => {
    setSavedPlan(true);
    console.log('Plan created:', new Date().toLocaleDateString('en-GB'));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--card)] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-[var(--card)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Rebalance Planner — {bucket.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors"
            data-testid="close-planner"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-3 bg-[var(--info)]/10 border-b border-[var(--info)]/20">
          <p className="text-sm text-[var(--foreground)]">
            <strong>Tax-efficient rebalancing:</strong> We prioritise ISA/SIPP changes first. GIA trades show estimated CGT and fees.
          </p>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="text-sm font-medium text-[var(--foreground)] mb-2 block">Rebalance goal</label>
            <div className="inline-flex rounded-xl border border-[var(--border)] bg-[var(--muted)]/20 p-1">
              <button
                onClick={() => setGoalType('midpoint')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  goalType === 'midpoint'
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                    : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
                }`}
                data-testid="goal-midpoint"
              >
                To mid-point ({bucket.target}%)
              </button>
              <button
                onClick={() => setGoalType('edge')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  goalType === 'edge'
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                    : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
                }`}
                data-testid="goal-edge"
              >
                To band edge ({bucket.current > bucket.target ? bucket.bandMax : bucket.bandMin}%)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border border-[var(--border)] rounded-xl">
              <div className="text-xs text-[var(--muted-foreground)] mb-1">Current</div>
              <div className="text-xl font-bold text-[var(--foreground)]">{bucket.current}%</div>
            </div>
            <div className="p-4 border border-[var(--border)] rounded-xl">
              <div className="text-xs text-[var(--muted-foreground)] mb-1">Target</div>
              <div className="text-xl font-bold text-[var(--primary)]">{targetPercent}%</div>
            </div>
            <div className="p-4 border border-[var(--border)] rounded-xl">
              <div className="text-xs text-[var(--muted-foreground)] mb-1">Trade Amount</div>
              <div className="text-xl font-bold text-[var(--foreground)]">£{tradeAmountGbp.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Proposed Trades</h3>
            
            {trades.length === 0 ? (
              <div className="p-6 border border-[var(--border)] rounded-xl text-center text-sm text-[var(--muted-foreground)]">
                No trades needed — allocation is within band
              </div>
            ) : (
              <div className="border border-[var(--border)] rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[var(--muted)]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)]">Action</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)]">Holding</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)]">Account</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)]">Wrapper</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-[var(--muted-foreground)]">Amount</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-[var(--muted-foreground)]">Est. Fees</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-[var(--muted-foreground)]">Est. CGT</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-[var(--muted-foreground)]">Result %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((trade, idx) => (
                      <tr key={idx} className="border-t border-[var(--border)]">
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            trade.action === 'Sell' 
                              ? 'bg-[var(--destructive)]/10 text-[var(--destructive)]' 
                              : 'bg-[var(--success)]/10 text-[var(--success)]'
                          }`}>
                            {trade.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--foreground)]">{trade.holding}</td>
                        <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{trade.account}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            trade.wrapper === 'ISA' ? 'bg-[var(--success)]/10 text-[var(--success)]' :
                            trade.wrapper === 'SIPP' ? 'bg-[var(--info)]/10 text-[var(--info)]' :
                            'bg-[var(--warning)]/10 text-[var(--warning)]'
                          }`}>
                            {trade.wrapper}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-[var(--foreground)]">
                          £{trade.amountGbp.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-[var(--muted-foreground)]">
                          £{trade.estFees.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-[var(--muted-foreground)]">
                          £{trade.estCgt.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-[var(--primary)]">
                          {trade.resultingPercent.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
            <button
              onClick={handleSavePlan}
              disabled={savedPlan || trades.length === 0}
              className="px-6 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              data-testid="save-plan"
            >
              {savedPlan ? <Check className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
              {savedPlan ? 'Plan saved' : 'Save plan'}
            </button>

            {savedPlan && (
              <p className="text-sm text-[var(--success)]">
                Plain-English summary: {trades[0]?.action === 'Sell' ? 'Sell' : 'Buy'} £{tradeAmountGbp.toLocaleString(undefined, { maximumFractionDigits: 0 })} of {trades[0]?.holding} in {trades[0]?.wrapper}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TargetsPolicyDrawer({ onClose }: { onClose: () => void }) {
  const [rebalanceRule, setRebalanceRule] = useState<'time' | 'threshold' | 'hybrid'>('threshold');
  const [minTradeSize, setMinTradeSize] = useState('500');
  const [cashBuffer, setCashBuffer] = useState('5');
  const [includeProperty, setIncludeProperty] = useState(false);
  const [taxPreference, setTaxPreference] = useState<'prefer' | 'allow' | 'never'>('prefer');

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-[var(--card)] rounded-t-xl sm:rounded-xl w-full sm:max-w-2xl sm:max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-[var(--card)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Rebalance Policy</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors"
            data-testid="close-policy"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="text-sm font-medium text-[var(--foreground)] mb-2 block">Rebalance rule</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-[var(--border)] rounded-xl cursor-pointer hover:bg-[var(--muted)]/50 transition-colors">
                <input
                  type="radio"
                  checked={rebalanceRule === 'time'}
                  onChange={() => setRebalanceRule('time')}
                  className="h-4 w-4"
                  data-testid="rule-time"
                />
                <div>
                  <div className="text-sm font-medium text-[var(--foreground)]">Time-based (quarterly)</div>
                  <div className="text-xs text-[var(--muted-foreground)]">Rebalance every 3 months regardless of drift</div>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 border border-[var(--border)] rounded-xl cursor-pointer hover:bg-[var(--muted)]/50 transition-colors">
                <input
                  type="radio"
                  checked={rebalanceRule === 'threshold'}
                  onChange={() => setRebalanceRule('threshold')}
                  className="h-4 w-4"
                  data-testid="rule-threshold"
                />
                <div>
                  <div className="text-sm font-medium text-[var(--foreground)]">Threshold (band breach)</div>
                  <div className="text-xs text-[var(--muted-foreground)]">Only when allocation drifts outside bands</div>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 border border-[var(--border)] rounded-xl cursor-pointer hover:bg-[var(--muted)]/50 transition-colors">
                <input
                  type="radio"
                  checked={rebalanceRule === 'hybrid'}
                  onChange={() => setRebalanceRule('hybrid')}
                  className="h-4 w-4"
                  data-testid="rule-hybrid"
                />
                <div>
                  <div className="text-sm font-medium text-[var(--foreground)]">Hybrid</div>
                  <div className="text-xs text-[var(--muted-foreground)]">Quarterly review + band breach alerts</div>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[var(--foreground)] mb-2 block">Minimum trade size (£)</label>
            <input
              type="number"
              value={minTradeSize}
              onChange={(e) => setMinTradeSize(e.target.value)}
              className="w-full px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--background)] text-[var(--foreground)]"
              data-testid="min-trade-size"
            />
            <p className="text-xs text-[var(--muted-foreground)] mt-1">Avoid small trades that rack up fees</p>
          </div>

          <div>
            <label className="text-sm font-medium text-[var(--foreground)] mb-2 block">Cash buffer floor (%)</label>
            <input
              type="number"
              value={cashBuffer}
              onChange={(e) => setCashBuffer(e.target.value)}
              className="w-full px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--background)] text-[var(--foreground)]"
              data-testid="cash-buffer"
            />
            <p className="text-xs text-[var(--muted-foreground)] mt-1">Minimum cash % to maintain for liquidity</p>
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeProperty}
                onChange={(e) => setIncludeProperty(e.target.checked)}
                className="h-4 w-4"
                data-testid="include-property"
              />
              <div>
                <div className="text-sm font-medium text-[var(--foreground)]">Include property in rebalance</div>
                <div className="text-xs text-[var(--muted-foreground)]">Consider illiquid assets in allocation (view-only nudges)</div>
              </div>
            </label>
          </div>

          <div>
            <label className="text-sm font-medium text-[var(--foreground)] mb-2 block">Tax preference for trades</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-[var(--border)] rounded-xl cursor-pointer hover:bg-[var(--muted)]/50 transition-colors">
                <input
                  type="radio"
                  checked={taxPreference === 'prefer'}
                  onChange={() => setTaxPreference('prefer')}
                  className="h-4 w-4"
                  data-testid="tax-prefer"
                />
                <div>
                  <div className="text-sm font-medium text-[var(--foreground)]">Prefer ISA/SIPP</div>
                  <div className="text-xs text-[var(--muted-foreground)]">Use tax-advantaged wrappers first, GIA if needed</div>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 border border-[var(--border)] rounded-xl cursor-pointer hover:bg-[var(--muted)]/50 transition-colors">
                <input
                  type="radio"
                  checked={taxPreference === 'allow'}
                  onChange={() => setTaxPreference('allow')}
                  className="h-4 w-4"
                  data-testid="tax-allow"
                />
                <div>
                  <div className="text-sm font-medium text-[var(--foreground)]">Allow GIA if needed</div>
                  <div className="text-xs text-[var(--muted-foreground)]">Will show CGT estimates</div>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 border border-[var(--border)] rounded-xl cursor-pointer hover:bg-[var(--muted)]/50 transition-colors">
                <input
                  type="radio"
                  checked={taxPreference === 'never'}
                  onChange={() => setTaxPreference('never')}
                  className="h-4 w-4"
                  data-testid="tax-never"
                />
                <div>
                  <div className="text-sm font-medium text-[var(--foreground)]">Never GIA</div>
                  <div className="text-xs text-[var(--muted-foreground)]">Show warnings if rebalance requires GIA trades</div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-transparent border border-[var(--border)] text-[var(--foreground)] rounded-xl text-sm font-medium hover:bg-[var(--muted)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors"
              data-testid="save-policy"
            >
              Save policy
            </button>
          </div>
        </div>
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
              <div className="absolute right-0 top-full mt-2 w-64 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg z-10 overflow-hidden">
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
                <button className="px-3 py-1 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-xs hover:opacity-90 transition-opacity">
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
  const [selectedPeriod, setSelectedPeriod] = useState('Oct 2025');
  const [accountFilter, setAccountFilter] = useState('all');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardAccount, setWizardAccount] = useState<string | null>(null);
  const [wizardStep, setWizardStep] = useState(1);
  
  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Reconciled':
        return 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20';
      case 'In progress':
        return 'bg-[var(--info)]/10 text-[var(--info)] border-[var(--info)]/20';
      case 'Pending':
        return 'bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20';
      case 'Exception':
        return 'bg-[var(--destructive)]/10 text-[var(--destructive)] border-[var(--destructive)]/20';
      default:
        return 'bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]';
    }
  };

  const accounts = [
    { 
      name: 'Vanguard ISA', 
      status: 'Reconciled', 
      period: 'Oct 2025', 
      statement: 'On file',
      openingCash: 12450.00,
      netMovement: 1915.55,
      endingCash: 14365.55,
      cashDiff: 0.00,
      holdingsVariance: 'Units match',
      unsettledTrades: 0
    },
    { 
      name: 'AJ Bell SIPP', 
      status: 'Reconciled', 
      period: 'Oct 2025', 
      statement: 'On file',
      openingCash: 45200.00,
      netMovement: -628.50,
      endingCash: 44571.50,
      cashDiff: 0.00,
      holdingsVariance: 'Units match',
      unsettledTrades: 0
    },
    { 
      name: 'Trading 212 GIA', 
      status: 'Pending', 
      period: 'Oct 2025', 
      statement: 'Missing',
      openingCash: 8200.00,
      netMovement: 1005.70,
      endingCash: 9205.70,
      cashDiff: -13.42,
      holdingsVariance: '2 unmatched lines',
      unsettledTrades: 3
    },
  ];

  const differences = [
    { date: '15 Oct 2025', account: 'Trading 212 GIA', category: 'Cash', description: 'Missing custody fee (£12.50 + FX variance)', status: 'Open' },
    { date: '28 Oct 2025', account: 'Trading 212 GIA', category: 'Holdings', description: 'VWRL dividend reinvestment not in register', status: 'Open' },
  ];

  const requiredMissing = [
    { title: 'Trading 212 GIA — Statement missing for Oct 2025', action: 'Upload', type: 'statement' },
  ];

  const dueSoon = [
    { title: '42 Elm Street — Valuation overdue (RICS or agent letter)', action: 'Add valuation', type: 'valuation' },
    { title: 'EIS — 3-year hold check in 30 days', action: 'Set reminder', type: 'reminder' },
  ];

  return (
    <div className="space-y-6">
      {/* Period + Scope Controls */}
      <div className="flex items-center justify-between p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl">
        <div className="flex items-center gap-4">
          {/* Period selector */}
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors" data-testid="button-prev-period">
              <ChevronLeft className="h-4 w-4 text-[var(--foreground)]" />
            </button>
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 bg-[var(--input)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)]"
            >
              <option>Oct 2025</option>
              <option>Sep 2025</option>
              <option>Aug 2025</option>
              <option>Q3 2025</option>
            </select>
            <button className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors" data-testid="button-next-period">
              <ChevronRight className="h-4 w-4 text-[var(--foreground)]" />
            </button>
          </div>

          {/* Account filter */}
          <select 
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="px-3 py-2 bg-[var(--input)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)]"
          >
            <option value="all">All accounts</option>
            <option value="vanguard">Vanguard</option>
            <option value="ajbell">AJ Bell</option>
            <option value="trading212">Trading 212</option>
          </select>
        </div>

        {/* Reconcile all CTA */}
        <button className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-sm hover:opacity-90 transition-opacity">
          Reconcile all
        </button>
      </div>

      {/* Rich Account Cards */}
      <div id="tour-reconcile-cards" className="grid grid-cols-3 gap-4">
        {accounts.map((acc, idx) => (
          <div key={idx} className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm" data-testid={`reconcile-${idx}`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-semibold text-[var(--foreground)]">{acc.name}</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={`px-2 py-1 rounded-full text-xs border cursor-help ${getStatusStyle(acc.status)}`}>
                    {acc.status}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    {acc.status === 'Reconciled' && 'Statement linked; cash & holdings match.'}
                    {acc.status === 'Pending' && 'Missing statement or unmatched items.'}
                    {acc.status === 'In progress' && 'Reconciliation wizard opened but not finalised.'}
                    {acc.status === 'Exception' && 'Cash or holdings difference remains.'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Cash flow diagram */}
            <div className="mb-4 p-3 bg-[var(--muted)] rounded-lg">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-[var(--muted-foreground)]">Opening</span>
                <span className="text-[var(--muted-foreground)]">Movement</span>
                <span className="text-[var(--muted-foreground)]">Closing</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[var(--foreground)]">
                  £{acc.openingCash.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                </span>
                <span className={`text-sm font-semibold ${acc.netMovement >= 0 ? 'text-[var(--success)]' : 'text-[var(--destructive)]'}`}>
                  {acc.netMovement >= 0 ? '+' : ''}£{acc.netMovement.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-sm font-semibold text-[var(--foreground)]">
                  £{acc.endingCash.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="h-1 bg-[var(--border)] rounded-full relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-[var(--foreground)] rounded-full"></div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[var(--foreground)] rounded-full"></div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-[var(--foreground)] rounded-full"></div>
              </div>
            </div>

            {/* Cash difference */}
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="text-[var(--muted-foreground)]">Cash difference:</span>
              <span className={`font-semibold px-2 py-0.5 rounded ${
                acc.cashDiff === 0 
                  ? 'text-[var(--success)] bg-[var(--success)]/10' 
                  : 'text-[var(--destructive)] bg-[var(--destructive)]/10'
              }`}>
                {acc.cashDiff === 0 ? '£0.00' : `£${acc.cashDiff.toFixed(2)}`}
              </span>
            </div>

            {/* Holdings variance */}
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="text-[var(--muted-foreground)]">Holdings variance:</span>
              <span className={`text-xs ${
                acc.holdingsVariance === 'Units match' 
                  ? 'text-[var(--success)]' 
                  : 'text-[var(--warning)]'
              }`}>
                {acc.holdingsVariance}
              </span>
            </div>

            {/* Unsettled trades */}
            <div className="flex justify-between items-center mb-4 text-sm">
              <span className="text-[var(--muted-foreground)]">Unsettled trades:</span>
              <span className="text-xs text-[var(--foreground)]">
                {acc.unsettledTrades === 0 ? '—' : `${acc.unsettledTrades} T+2`}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setWizardAccount(acc.name);
                  setWizardStep(1);
                  setWizardOpen(true);
                }}
                className="flex-1 px-3 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-xs hover:opacity-90 transition-opacity"
                data-testid={`button-reconcile-${idx}`}
              >
                Reconcile now
              </button>
              <button className="px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors">
                View statement
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Differences Log */}
      {differences.length > 0 && (
        <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Differences this period</h3>
          <div className="overflow-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-2 px-3 text-xs text-[var(--muted-foreground)] font-medium">Date</th>
                  <th className="text-left py-2 px-3 text-xs text-[var(--muted-foreground)] font-medium">Account</th>
                  <th className="text-left py-2 px-3 text-xs text-[var(--muted-foreground)] font-medium">Category</th>
                  <th className="text-left py-2 px-3 text-xs text-[var(--muted-foreground)] font-medium">Description</th>
                  <th className="text-center py-2 px-3 text-xs text-[var(--muted-foreground)] font-medium">Status</th>
                  <th className="text-right py-2 px-3 text-xs text-[var(--muted-foreground)] font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {differences.map((diff, idx) => (
                  <tr key={idx} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/50 transition-colors cursor-pointer">
                    <td className="py-3 px-3 text-[var(--foreground)]">{diff.date}</td>
                    <td className="py-3 px-3 text-[var(--foreground)]">{diff.account}</td>
                    <td className="py-3 px-3 text-[var(--muted-foreground)]">{diff.category}</td>
                    <td className="py-3 px-3 text-[var(--foreground)]">{diff.description}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        diff.status === 'Open' 
                          ? 'bg-[var(--warning)]/10 text-[var(--warning)]' 
                          : 'bg-[var(--success)]/10 text-[var(--success)]'
                      }`}>
                        {diff.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button className="px-3 py-1 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-xs hover:opacity-90 transition-opacity">
                        Investigate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enhanced What's Missing */}
      <div id="tour-missing" className="space-y-4">
        {/* Required */}
        {requiredMissing.length > 0 && (
          <div className="p-4 bg-[var(--destructive)]/5 border border-[var(--destructive)]/20 rounded-xl">
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-[var(--destructive)]" />
              Required
            </h3>
            <div className="space-y-2">
              {requiredMissing.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-[var(--foreground)]">{item.title}</span>
                  <button className="px-3 py-1 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-xs hover:opacity-90 transition-opacity">
                    {item.action}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Due Soon */}
        {dueSoon.length > 0 && (
          <div className="p-4 bg-[var(--warning)]/5 border border-[var(--warning)]/20 rounded-xl">
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-[var(--warning)]" />
              Due soon
            </h3>
            <div className="space-y-2">
              {dueSoon.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-[var(--foreground)]">{item.title}</span>
                  <button className="px-3 py-1 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-xs hover:opacity-90 transition-opacity">
                    {item.action}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reconciliation Wizard Modal */}
      {wizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setWizardOpen(false)}></div>
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-auto">
            {/* Header */}
            <div className="sticky top-0 bg-[var(--card)] border-b border-[var(--border)] p-6 z-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[var(--foreground)]">Reconcile {wizardAccount}</h2>
                <button 
                  onClick={() => setWizardOpen(false)}
                  className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-[var(--muted-foreground)]" />
                </button>
              </div>
              {/* Step indicators */}
              <div className="flex items-center gap-2">
                {[
                  { num: 1, label: 'Statement' },
                  { num: 2, label: 'Transactions' },
                  { num: 3, label: 'Holdings match' },
                  { num: 4, label: 'Cash check' },
                  { num: 5, label: 'Finalise' },
                ].map((step) => (
                  <div key={step.num} className="flex items-center gap-2 flex-1">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                      wizardStep === step.num
                        ? 'bg-[var(--primary)] border-[var(--primary)] text-[var(--primary-foreground)]'
                        : wizardStep > step.num
                        ? 'bg-[var(--success)] border-[var(--success)] text-[var(--success-foreground)]'
                        : 'bg-[var(--card)] border-[var(--border)] text-[var(--muted-foreground)]'
                    }`}>
                      {wizardStep > step.num ? '✓' : step.num}
                    </div>
                    <span className={`text-xs ${wizardStep === step.num ? 'text-[var(--foreground)] font-semibold' : 'text-[var(--muted-foreground)]'}`}>
                      {step.label}
                    </span>
                    {step.num < 5 && <div className="flex-1 h-0.5 bg-[var(--border)]"></div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">Link statement</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Upload or link the statement for Oct 2025. We'll detect the opening and closing cash balances.
                  </p>
                  <div className="p-8 border-2 border-dashed border-[var(--border)] rounded-xl text-center hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-colors cursor-pointer">
                    <Upload className="h-12 w-12 text-[var(--muted-foreground)] mx-auto mb-3" />
                    <p className="text-sm font-semibold text-[var(--foreground)]">Drop statement or click to upload</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">PDF, CSV, or link from Documents</p>
                  </div>
                  <div className="p-4 bg-[var(--muted)] rounded-lg">
                    <div className="text-xs text-[var(--muted-foreground)] mb-2">Detected from statement:</div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-[var(--muted-foreground)]">Period:</span>
                        <span className="ml-2 font-semibold text-[var(--foreground)]">01–31 Oct 2025</span>
                      </div>
                      <div>
                        <span className="text-[var(--muted-foreground)]">Opening cash:</span>
                        <span className="ml-2 font-semibold text-[var(--foreground)]">£12,450.00</span>
                      </div>
                      <div>
                        <span className="text-[var(--muted-foreground)]">Closing cash:</span>
                        <span className="ml-2 font-semibold text-[var(--foreground)]">£14,365.55</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">Import transactions</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Import transactions by ⚡ Live / ⤿ CSV / 📎 From document / ✍ Manual. We'll show unsettled trades separately.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors text-left">
                      <div className="font-semibold text-sm mb-1">⚡ Live (from broker)</div>
                      <div className="text-xs text-[var(--muted-foreground)]">Read-only from your connection</div>
                    </button>
                    <button className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors text-left">
                      <div className="font-semibold text-sm mb-1">⤿ CSV file</div>
                      <div className="text-xs text-[var(--muted-foreground)]">Upload exported transactions</div>
                    </button>
                    <button className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors text-left">
                      <div className="font-semibold text-sm mb-1">📎 From document</div>
                      <div className="text-xs text-[var(--muted-foreground)]">Extract from this statement</div>
                    </button>
                    <button className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors text-left">
                      <div className="font-semibold text-sm mb-1">✍ Manual entry</div>
                      <div className="text-xs text-[var(--muted-foreground)]">Type in manually</div>
                    </button>
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    <strong>Note:</strong> Unsettled trades (outside statement window) will be highlighted
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">Match holdings</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Compare statement units to register units. Resolve any differences.
                  </p>
                  <div className="overflow-auto border border-[var(--border)] rounded-lg">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-[var(--muted)] border-b border-[var(--border)]">
                          <th className="text-left py-2 px-3 text-xs text-[var(--muted-foreground)] font-medium">Instrument</th>
                          <th className="text-right py-2 px-3 text-xs text-[var(--muted-foreground)] font-medium">Statement units</th>
                          <th className="text-right py-2 px-3 text-xs text-[var(--muted-foreground)] font-medium">Register units</th>
                          <th className="text-center py-2 px-3 text-xs text-[var(--muted-foreground)] font-medium">Delta</th>
                          <th className="text-right py-2 px-3 text-xs text-[var(--muted-foreground)] font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-[var(--border)]">
                          <td className="py-3 px-3">Vanguard FTSE Global</td>
                          <td className="py-3 px-3 text-right">45.50</td>
                          <td className="py-3 px-3 text-right">45.50</td>
                          <td className="py-3 px-3 text-center"><span className="text-[var(--success)]">✓ Match</span></td>
                          <td className="py-3 px-3 text-right">
                            <button className="px-2 py-1 bg-[var(--success)]/10 text-[var(--success)] rounded-lg text-xs">Accept</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {wizardStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">Cash check</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Opening + settled movements − fees/tax = Closing. Unsettled and out-of-period items are excluded.
                  </p>
                  <div className="p-4 bg-[var(--muted)] rounded-lg">
                    <div className="text-sm font-mono space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[var(--muted-foreground)]">Opening cash:</span>
                        <span className="text-[var(--foreground)]">£12,450.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--muted-foreground)]">+ Net movements:</span>
                        <span className="text-[var(--success)]">+£1,915.55</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--muted-foreground)]">− Fees:</span>
                        <span className="text-[var(--destructive)]">−£0.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--muted-foreground)]">− Tax:</span>
                        <span className="text-[var(--destructive)]">−£0.00</span>
                      </div>
                      <div className="border-t border-[var(--border)] pt-2 mt-2 flex justify-between font-semibold">
                        <span className="text-[var(--foreground)]">= Expected closing:</span>
                        <span className="text-[var(--foreground)]">£14,365.55</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--muted-foreground)]">Actual closing:</span>
                        <span className="text-[var(--foreground)]">£14,365.55</span>
                      </div>
                      <div className="border-t border-[var(--border)] pt-2 mt-2 flex justify-between font-semibold">
                        <span className="text-[var(--foreground)]">Difference:</span>
                        <span className="text-[var(--success)]">£0.00 ✓</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {wizardStep === 5 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">Finalise reconciliation</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    All checks complete. Mark this period as reconciled to lock it.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-[var(--success)]/10 rounded-lg">
                      <span className="text-[var(--success)] text-2xl">✓</span>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-[var(--foreground)]">Statement linked</div>
                        <div className="text-xs text-[var(--muted-foreground)]">Oct 2025 statement on file</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-[var(--success)]/10 rounded-lg">
                      <span className="text-[var(--success)] text-2xl">✓</span>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-[var(--foreground)]">Holdings matched</div>
                        <div className="text-xs text-[var(--muted-foreground)]">All units reconciled</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-[var(--success)]/10 rounded-lg">
                      <span className="text-[var(--success)] text-2xl">✓</span>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-[var(--foreground)]">Cash balanced</div>
                        <div className="text-xs text-[var(--muted-foreground)]">£0.00 difference</div>
                      </div>
                    </div>
                  </div>
                  <button className="w-full px-4 py-3 bg-[var(--success)] text-[var(--success-foreground)] rounded-xl font-semibold hover:opacity-90 transition-opacity">
                    Mark period reconciled
                  </button>
                  <button className="w-full px-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors">
                    Download reconciliation note (PDF)
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-[var(--card)] border-t border-[var(--border)] p-6 flex items-center justify-between">
              <button 
                onClick={() => setWizardStep(Math.max(1, wizardStep - 1))}
                disabled={wizardStep === 1}
                className="px-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>
              <div className="text-sm text-[var(--muted-foreground)]">
                Step {wizardStep} of 5
              </div>
              <button 
                onClick={() => {
                  if (wizardStep === 5) {
                    setWizardOpen(false);
                  } else {
                    setWizardStep(Math.min(5, wizardStep + 1));
                  }
                }}
                className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-sm hover:opacity-90 transition-opacity"
              >
                {wizardStep === 5 ? 'Close' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Household Types
interface HouseholdEntity {
  id: string;
  type: 'individual' | 'ltd' | 'trust' | 'jisa' | 'junior_sipp';
  name: string;
  relationship?: string;
  assets: number;
  liabilities: number;
  netWorth: number;
  liquidPercent: number;
  included: boolean;
  allowances: {
    isaUsed: number;
    isaLimit: number;
    sippUsed: number;
    sippEstLimit: number;
    cgtUsed: number;
    cgtLimit: number;
    dividendIncome: number;
    dividendLimit: number;
    interestIncome: number;
    interestLimit: number;
  };
  email?: string;
  role?: 'owner' | 'viewer' | 'editor';
  taxResidency: string;
  niOrCompanyNo?: string;
}

type HouseholdViewMode = 'combined' | 'by_entity' | 'by_wrapper' | 'by_ownership' | 'with_liabilities';

const householdDemoEntities: HouseholdEntity[] = [
  {
    id: 'self',
    type: 'individual',
    name: 'You',
    relationship: 'Self',
    assets: 370280,
    liabilities: 128450,
    netWorth: 241830,
    liquidPercent: 85,
    included: true,
    allowances: {
      isaUsed: 12400,
      isaLimit: 20000,
      sippUsed: 18000,
      sippEstLimit: 60000,
      cgtUsed: 4200,
      cgtLimit: 3000,
      dividendIncome: 850,
      dividendLimit: 500,
      interestIncome: 620,
      interestLimit: 1000
    },
    email: 'you@example.com',
    role: 'owner',
    taxResidency: 'UK',
    niOrCompanyNo: 'AB123456C'
  },
  {
    id: 'spouse',
    type: 'individual',
    name: 'Sarah Williams',
    relationship: 'Spouse',
    assets: 185000,
    liabilities: 0,
    netWorth: 185000,
    liquidPercent: 92,
    included: true,
    allowances: {
      isaUsed: 8500,
      isaLimit: 20000,
      sippUsed: 0,
      sippEstLimit: 60000,
      cgtUsed: 0,
      cgtLimit: 3000,
      dividendIncome: 0,
      dividendLimit: 500,
      interestIncome: 280,
      interestLimit: 1000
    },
    email: 'sarah@example.com',
    role: 'editor',
    taxResidency: 'UK',
    niOrCompanyNo: 'CD789012E'
  },
  {
    id: 'jisa_child',
    type: 'jisa',
    name: 'Emma Williams (JISA)',
    relationship: 'Child',
    assets: 12500,
    liabilities: 0,
    netWorth: 12500,
    liquidPercent: 100,
    included: true,
    allowances: {
      isaUsed: 2400,
      isaLimit: 9000,
      sippUsed: 0,
      sippEstLimit: 0,
      cgtUsed: 0,
      cgtLimit: 0,
      dividendIncome: 0,
      dividendLimit: 0,
      interestIncome: 0,
      interestLimit: 0
    },
    taxResidency: 'UK',
    niOrCompanyNo: 'EF345678G'
  },
  {
    id: 'ltd',
    type: 'ltd',
    name: 'Williams Consulting Ltd',
    assets: 45000,
    liabilities: 8000,
    netWorth: 37000,
    liquidPercent: 60,
    included: false,
    allowances: {
      isaUsed: 0,
      isaLimit: 0,
      sippUsed: 0,
      sippEstLimit: 0,
      cgtUsed: 0,
      cgtLimit: 0,
      dividendIncome: 0,
      dividendLimit: 0,
      interestIncome: 0,
      interestLimit: 0
    },
    taxResidency: 'UK',
    niOrCompanyNo: '12345678'
  }
];

function HouseholdTab() {
  const [viewMode, setViewMode] = useState<HouseholdViewMode>('combined');
  const [addEntityOpen, setAddEntityOpen] = useState(false);
  const [optimiseOpen, setOptimiseOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<HouseholdEntity | null>(null);
  const [ownershipEditorOpen, setOwnershipEditorOpen] = useState(false);
  const [entities, setEntities] = useState(householdDemoEntities);

  const includedEntities = entities.filter(e => e.included);
  const combinedNetWorth = includedEntities.reduce((sum, e) => sum + e.netWorth, 0);
  const combinedAssets = includedEntities.reduce((sum, e) => sum + e.assets, 0);
  const combinedLiabilities = includedEntities.reduce((sum, e) => sum + e.liabilities, 0);
  const combinedLiquid = includedEntities.reduce((sum, e) => sum + (e.assets * e.liquidPercent / 100), 0);
  const debtRatio = combinedLiabilities / combinedAssets;

  const toggleEntityInclusion = (entityId: string) => {
    setEntities(entities.map(e => 
      e.id === entityId ? { ...e, included: !e.included } : e
    ));
  };

  const AllowanceBar = ({ used, limit, label }: { used: number; limit: number; label: string }) => {
    const percentage = Math.min((used / limit) * 100, 100);
    const isOver = used > limit;
    
    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-[var(--muted-foreground)]">{label}</span>
          <span className={`text-xs font-medium ${isOver ? 'text-[var(--destructive)]' : 'text-[var(--foreground)]'}`}>
            £{used.toLocaleString()} / £{limit.toLocaleString()}
          </span>
        </div>
        <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
          <div 
            className={`h-full ${isOver ? 'bg-[var(--destructive)]' : 'bg-[var(--primary)]'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  const AllowanceChip = ({ label, used, limit, small }: { label: string; used: number; limit: number; small?: boolean }) => {
    const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
    const isOver = used > limit;
    const remaining = limit - used;
    
    if (limit === 0) return null;
    
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`px-2 py-1 rounded-lg border ${
            isOver ? 'bg-[var(--destructive)]/10 border-[var(--destructive)]/20 text-[var(--destructive)]' :
            percentage > 80 ? 'bg-[var(--warning)]/10 border-[var(--warning)]/20 text-[var(--warning)]' :
            'bg-[var(--success)]/10 border-[var(--success)]/20 text-[var(--success)]'
          } ${small ? 'text-xs' : 'text-sm'}`}>
            <div className="font-medium">{label}</div>
            <div className={small ? 'text-xs' : 'text-xs'}>{percentage.toFixed(0)}%</div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            {isOver 
              ? `Over by £${Math.abs(remaining).toLocaleString()}`
              : `£${remaining.toLocaleString()} remaining`
            }
          </p>
        </TooltipContent>
      </Tooltip>
    );
  };

  const EntityTypeIcon = ({ type }: { type: HouseholdEntity['type'] }) => {
    const icons = {
      individual: '👤',
      ltd: '🏢',
      trust: '🏛️',
      jisa: '👶',
      junior_sipp: '🍼'
    };
    return <span className="text-lg">{icons[type]}</span>;
  };

  const EntityCard = ({ entity }: { entity: HouseholdEntity }) => {
    return (
      <div className={`p-6 border-2 rounded-xl bg-[var(--card)] transition-all ${
        !entity.included ? 'opacity-50 border-dashed border-[var(--border)]' : 'border-[var(--border)]'
      }`} data-testid={`entity-card-${entity.id}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <EntityTypeIcon type={entity.type} />
            <div>
              <h3 className="text-lg font-semibold text-[var(--foreground)]">{entity.name}</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                {entity.relationship || entity.type.toUpperCase()}
                {entity.email && ` • ${entity.email}`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-[var(--foreground)]">
              £{entity.netWorth.toLocaleString()}
            </div>
            <div className="text-xs text-[var(--muted-foreground)]">Net worth</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <div className="text-xs text-[var(--muted-foreground)] mb-1">Assets</div>
            <div className="text-sm font-semibold text-[var(--foreground)]">£{entity.assets.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-[var(--muted-foreground)] mb-1">Liabilities</div>
            <div className="text-sm font-semibold text-[var(--destructive)]">£{entity.liabilities.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-[var(--muted-foreground)] mb-1">Liquid</div>
            <div className="text-sm font-semibold text-[var(--foreground)]">{entity.liquidPercent}%</div>
          </div>
          <div>
            <div className="text-xs text-[var(--muted-foreground)] mb-1">Role</div>
            <div className="text-sm font-semibold text-[var(--foreground)] capitalize">{entity.role || '—'}</div>
          </div>
        </div>

        {entity.type !== 'ltd' && entity.type !== 'trust' && (
          <div className="mb-4">
            <div className="text-xs text-[var(--muted-foreground)] mb-2">Allowances (YTD)</div>
            <div className="flex flex-wrap gap-2">
              <AllowanceChip label="ISA" used={entity.allowances.isaUsed} limit={entity.allowances.isaLimit} small />
              <AllowanceChip label="SIPP" used={entity.allowances.sippUsed} limit={entity.allowances.sippEstLimit} small />
              <AllowanceChip label="CGT" used={entity.allowances.cgtUsed} limit={entity.allowances.cgtLimit} small />
              <AllowanceChip label="Div" used={entity.allowances.dividendIncome} limit={entity.allowances.dividendLimit} small />
              <AllowanceChip label="Int" used={entity.allowances.interestIncome} limit={entity.allowances.interestLimit} small />
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => setSelectedEntity(entity)}
            className="flex-1 px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors"
            data-testid={`view-entity-${entity.id}`}
          >
            View
          </button>
          <button
            onClick={() => toggleEntityInclusion(entity.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              entity.included
                ? 'bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--muted)]/80'
                : 'bg-[var(--success)] text-white hover:bg-[var(--success)]/90'
            }`}
            data-testid={`toggle-include-${entity.id}`}
          >
            {entity.included ? 'Exclude' : 'Include'}
          </button>
          {entity.type === 'individual' && !entity.email && (
            <button
              className="px-4 py-2 bg-transparent border border-[var(--border)] text-[var(--foreground)] rounded-xl text-sm font-medium hover:bg-[var(--muted)] transition-colors"
              data-testid={`invite-${entity.id}`}
            >
              Invite
            </button>
          )}
          <button
            onClick={() => setOwnershipEditorOpen(true)}
            className="px-4 py-2 bg-transparent border border-[var(--border)] text-[var(--foreground)] rounded-xl text-sm font-medium hover:bg-[var(--muted)] transition-colors"
            data-testid={`ownership-${entity.id}`}
          >
            Ownership
          </button>
        </div>
      </div>
    );
  };

  return (
    <div id="tour-household" className="space-y-6">
      {/* Info banner */}
      <div className="px-4 py-3 bg-[var(--info)]/10 border border-[var(--info)]/20 rounded-xl flex items-start gap-3">
        <Info className="h-5 w-5 text-[var(--info)] mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1">How Household works</h3>
          <p className="text-sm text-[var(--foreground)]">
            Link people and entities, set who owns what, and we'll show combined net worth, allowance usage, and cross-entity suggestions that minimise tax and fees.
          </p>
        </div>
      </div>

      {/* Header KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 border border-[var(--border)] rounded-xl bg-[var(--card)]">
          <div className="text-xs text-[var(--muted-foreground)] mb-1">Combined Net Worth</div>
          <div className="text-2xl font-bold text-[var(--foreground)]">£{combinedNetWorth.toLocaleString()}</div>
          <div className="text-xs text-[var(--success)] mt-1">
            {includedEntities.length} {includedEntities.length === 1 ? 'entity' : 'entities'}
          </div>
        </div>
        <div className="p-4 border border-[var(--border)] rounded-xl bg-[var(--card)]">
          <div className="text-xs text-[var(--muted-foreground)] mb-1">Liquid Assets</div>
          <div className="text-2xl font-bold text-[var(--foreground)]">£{combinedLiquid.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          <div className="text-xs text-[var(--muted-foreground)] mt-1">
            {((combinedLiquid / combinedAssets) * 100).toFixed(1)}% of assets
          </div>
        </div>
        <div className="p-4 border border-[var(--border)] rounded-xl bg-[var(--card)]">
          <div className="text-xs text-[var(--muted-foreground)] mb-1">Debt Ratio</div>
          <div className="text-2xl font-bold text-[var(--foreground)]">{(debtRatio * 100).toFixed(1)}%</div>
          <div className="text-xs text-[var(--muted-foreground)] mt-1">
            £{combinedLiabilities.toLocaleString()} debt
          </div>
        </div>
        <div className="p-4 border border-[var(--border)] rounded-xl bg-[var(--card)]">
          <div className="text-xs text-[var(--muted-foreground)] mb-1">Total Assets</div>
          <div className="text-2xl font-bold text-[var(--foreground)]">£{combinedAssets.toLocaleString()}</div>
          <div className="text-xs text-[var(--muted-foreground)] mt-1">Across all entities</div>
        </div>
      </div>

      {/* Combined Allowances */}
      <div className="p-6 border border-[var(--border)] rounded-xl bg-[var(--card)]">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Household Allowances (YTD)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AllowanceBar 
            label="ISA contributions" 
            used={includedEntities.reduce((sum, e) => sum + e.allowances.isaUsed, 0)} 
            limit={includedEntities.reduce((sum, e) => sum + e.allowances.isaLimit, 0)} 
          />
          <AllowanceBar 
            label="SIPP contributions" 
            used={includedEntities.reduce((sum, e) => sum + e.allowances.sippUsed, 0)} 
            limit={includedEntities.reduce((sum, e) => sum + e.allowances.sippEstLimit, 0)} 
          />
          <AllowanceBar 
            label="CGT used" 
            used={includedEntities.reduce((sum, e) => sum + e.allowances.cgtUsed, 0)} 
            limit={includedEntities.reduce((sum, e) => sum + e.allowances.cgtLimit, 0)} 
          />
          <AllowanceBar 
            label="Dividend income" 
            used={includedEntities.reduce((sum, e) => sum + e.allowances.dividendIncome, 0)} 
            limit={includedEntities.reduce((sum, e) => sum + e.allowances.dividendLimit, 0)} 
          />
        </div>
      </div>

      {/* View Switcher */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="text-sm text-[var(--muted-foreground)]">View:</div>
        <div className="inline-flex rounded-xl border border-[var(--border)] bg-[var(--muted)]/20 p-1">
          <button
            onClick={() => setViewMode('combined')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'combined'
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
            }`}
            data-testid="view-combined"
          >
            Combined
          </button>
          <button
            onClick={() => setViewMode('by_entity')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'by_entity'
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
            }`}
            data-testid="view-by-entity"
          >
            By Entity
          </button>
          <button
            onClick={() => setViewMode('by_wrapper')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'by_wrapper'
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
            }`}
            data-testid="view-by-wrapper"
          >
            By Wrapper
          </button>
          <button
            onClick={() => setViewMode('by_ownership')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'by_ownership'
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
            }`}
            data-testid="view-by-ownership"
          >
            By Ownership
          </button>
          <button
            onClick={() => setViewMode('with_liabilities')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'with_liabilities'
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
            }`}
            data-testid="view-with-liabilities"
          >
            With Liabilities
          </button>
        </div>
      </div>

      {/* Actions Panel */}
      <div className="p-4 bg-[var(--muted)]/30 border border-[var(--border)] rounded-xl flex flex-wrap items-center gap-3">
        <button
          onClick={() => setOptimiseOpen(true)}
          className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors flex items-center gap-2"
          data-testid="optimise-allowances"
        >
          <Sparkles className="h-4 w-4" />
          Optimise allowances
        </button>
        <button
          className="px-4 py-2 bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] rounded-xl text-sm font-medium hover:bg-[var(--muted)] transition-colors"
          data-testid="rebalance-entities"
        >
          Rebalance across entities
        </button>
        <button
          className="px-4 py-2 bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] rounded-xl text-sm font-medium hover:bg-[var(--muted)] transition-colors"
          data-testid="harvest-gains"
        >
          Harvest gains/losses
        </button>
        <button
          className="px-4 py-2 bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] rounded-xl text-sm font-medium hover:bg-[var(--muted)] transition-colors"
          data-testid="beneficiary-pack"
        >
          Beneficiary pack
        </button>
        <button
          onClick={() => setAddEntityOpen(true)}
          className="px-4 py-2 bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] rounded-xl text-sm font-medium hover:bg-[var(--muted)] transition-colors ml-auto"
          data-testid="add-entity"
        >
          + Add entity
        </button>
      </div>

      {/* Entity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {entities.map(entity => (
          <EntityCard key={entity.id} entity={entity} />
        ))}
      </div>

      {/* Household Notes */}
      <div className="p-6 border border-[var(--border)] rounded-xl bg-[var(--card)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Household Notes & Reminders</h3>
          <button className="text-sm text-[var(--primary)] hover:underline">+ Add note</button>
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-[var(--warning)]/10 border border-[var(--warning)]/20 rounded-lg">
            <Clock className="h-4 w-4 text-[var(--warning)] mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-medium text-[var(--foreground)]">Fund ISAs before 5 April</div>
              <div className="text-xs text-[var(--muted-foreground)] mt-0.5">
                You: £7,600 remaining • Spouse: £11,500 remaining
              </div>
            </div>
            <input type="checkbox" className="mt-1" />
          </div>
          <div className="flex items-start gap-3 p-3 bg-[var(--info)]/10 border border-[var(--info)]/20 rounded-lg">
            <Info className="h-4 w-4 text-[var(--info)] mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-medium text-[var(--foreground)]">JISA top-up for Emma</div>
              <div className="text-xs text-[var(--muted-foreground)] mt-0.5">
                £6,600 remaining in allowance
              </div>
            </div>
            <input type="checkbox" className="mt-1" />
          </div>
        </div>
      </div>

      {/* Add Entity Modal */}
      {addEntityOpen && (
        <HouseholdAddEntityModal onClose={() => setAddEntityOpen(false)} />
      )}

      {/* Optimise Modal */}
      {optimiseOpen && (
        <HouseholdOptimiseModal onClose={() => setOptimiseOpen(false)} entities={includedEntities} />
      )}

      {/* Ownership Editor */}
      {ownershipEditorOpen && (
        <HouseholdOwnershipEditor onClose={() => setOwnershipEditorOpen(false)} />
      )}
    </div>
  );
}

function HouseholdAddEntityModal({ onClose }: { onClose: () => void }) {
  const [entityType, setEntityType] = useState<'spouse' | 'child' | 'ltd' | 'trust'>('spouse');

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--card)] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-[var(--card)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Add Entity</h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="text-sm font-medium text-[var(--foreground)] mb-2 block">Entity type</label>
            <div className="grid grid-cols-2 gap-3">
              {(['spouse', 'child', 'ltd', 'trust'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setEntityType(type)}
                  className={`p-4 border-2 rounded-xl text-left transition-colors ${
                    entityType === type
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                      : 'border-[var(--border)] hover:bg-[var(--muted)]'
                  }`}
                >
                  <div className="text-lg mb-1">
                    {type === 'spouse' && '👥 Spouse/Partner'}
                    {type === 'child' && '👶 Child (JISA)'}
                    {type === 'ltd' && '🏢 Limited Company'}
                    {type === 'trust' && '🏛️ Trust'}
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    {type === 'spouse' && 'Individual with separate allowances'}
                    {type === 'child' && 'Junior ISA or Junior SIPP'}
                    {type === 'ltd' && 'Corporate structure'}
                    {type === 'trust' && 'Trust entity'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[var(--foreground)] mb-2 block">Legal name</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--background)] text-[var(--foreground)]"
              placeholder={entityType === 'ltd' ? 'Company name' : 'Full name'}
            />
          </div>

          {(entityType === 'spouse' || entityType === 'child') && (
            <>
              <div>
                <label className="text-sm font-medium text-[var(--foreground)] mb-2 block">Email (for invite)</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--background)] text-[var(--foreground)]"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--foreground)] mb-2 block">National Insurance number</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--background)] text-[var(--foreground)]"
                  placeholder="AB123456C"
                />
              </div>
            </>
          )}

          {entityType === 'ltd' && (
            <div>
              <label className="text-sm font-medium text-[var(--foreground)] mb-2 block">Company number</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--background)] text-[var(--foreground)]"
                placeholder="12345678"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-[var(--foreground)] mb-2 block">Tax residency</label>
            <select className="w-full px-4 py-2 border border-[var(--border)] rounded-xl bg-[var(--background)] text-[var(--foreground)]">
              <option>UK</option>
              <option>Non-UK</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-transparent border border-[var(--border)] text-[var(--foreground)] rounded-xl text-sm font-medium hover:bg-[var(--muted)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors"
            >
              Add entity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HouseholdOptimiseModal({ onClose, entities }: { onClose: () => void; entities: HouseholdEntity[] }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--card)] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-[var(--card)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Optimise Household Allowances</h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-3 bg-[var(--info)]/10 border-b border-[var(--info)]/20">
          <p className="text-sm text-[var(--foreground)]">
            <strong>Optimise button tooltip:</strong> Prioritises ISA/SIPP across the household before suggesting any GIA trades.
          </p>
        </div>

        <div className="p-6 space-y-6">
          <div className="p-4 bg-[var(--success)]/10 border border-[var(--success)]/20 rounded-xl">
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2">Recommendation Summary</h3>
            <p className="text-sm text-[var(--foreground)]">
              Use £11,500 of spouse ISA allowance before making any GIA sales. This will save approximately £2,300 in CGT.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Suggested Actions</h3>
            <div className="space-y-3">
              <div className="p-4 border border-[var(--border)] rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-sm font-medium text-[var(--foreground)]">Fund Sarah's ISA with £11,500</div>
                    <div className="text-xs text-[var(--muted-foreground)] mt-1">
                      Remaining allowance • Tax-free growth
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-[var(--success)]/10 text-[var(--success)] text-xs font-medium rounded">
                    Save £2,300 CGT
                  </span>
                </div>
              </div>

              <div className="p-4 border border-[var(--border)] rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-sm font-medium text-[var(--foreground)]">Fund your ISA with £7,600</div>
                    <div className="text-xs text-[var(--muted-foreground)] mt-1">
                      Remaining allowance before April 5th
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-[var(--success)]/10 text-[var(--success)] text-xs font-medium rounded">
                    Save £1,520 CGT
                  </span>
                </div>
              </div>

              <div className="p-4 border border-[var(--border)] rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-sm font-medium text-[var(--foreground)]">Consider SIPP contribution for spouse</div>
                    <div className="text-xs text-[var(--muted-foreground)] mt-1">
                      £60,000 available • Pension tax relief
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-[var(--info)]/10 text-[var(--info)] text-xs font-medium rounded">
                    Tax relief available
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-transparent border border-[var(--border)] text-[var(--foreground)] rounded-xl text-sm font-medium hover:bg-[var(--muted)] transition-colors"
            >
              Close
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors"
            >
              Apply suggestions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HouseholdOwnershipEditor({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--card)] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-[var(--card)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Edit Ownership</h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-3 bg-[var(--info)]/10 border-b border-[var(--info)]/20">
          <p className="text-sm text-[var(--foreground)]">
            <strong>Ownership helper:</strong> Set the split for joint assets (e.g., 50/50). Combined view uses these percentages to avoid double-counting.
          </p>
        </div>

        <div className="p-6">
          <div className="border border-[var(--border)] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)]">Asset</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)]">You</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)]">Spouse</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)]">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-[var(--border)]">
                  <td className="px-4 py-3 text-sm text-[var(--foreground)]">42 Elm St, Manchester</td>
                  <td className="px-4 py-3">
                    <input 
                      type="number" 
                      defaultValue="50" 
                      className="w-20 px-2 py-1 border border-[var(--border)] rounded text-sm bg-[var(--background)] text-[var(--foreground)]"
                    />
                    <span className="text-xs text-[var(--muted-foreground)] ml-1">%</span>
                  </td>
                  <td className="px-4 py-3">
                    <input 
                      type="number" 
                      defaultValue="50" 
                      className="w-20 px-2 py-1 border border-[var(--border)] rounded text-sm bg-[var(--background)] text-[var(--foreground)]"
                    />
                    <span className="text-xs text-[var(--muted-foreground)] ml-1">%</span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-[var(--foreground)]">100%</td>
                </tr>
                <tr className="border-t border-[var(--border)]">
                  <td className="px-4 py-3 text-sm text-[var(--foreground)]">Premium Bonds</td>
                  <td className="px-4 py-3">
                    <input 
                      type="number" 
                      defaultValue="100" 
                      className="w-20 px-2 py-1 border border-[var(--border)] rounded text-sm bg-[var(--background)] text-[var(--foreground)]"
                    />
                    <span className="text-xs text-[var(--muted-foreground)] ml-1">%</span>
                  </td>
                  <td className="px-4 py-3">
                    <input 
                      type="number" 
                      defaultValue="0" 
                      className="w-20 px-2 py-1 border border-[var(--border)] rounded text-sm bg-[var(--background)] text-[var(--foreground)]"
                    />
                    <span className="text-xs text-[var(--muted-foreground)] ml-1">%</span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-[var(--foreground)]">100%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-transparent border border-[var(--border)] text-[var(--foreground)] rounded-xl text-sm font-medium hover:bg-[var(--muted)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors"
            >
              Save ownership
            </button>
          </div>
        </div>
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

function AIImportModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);

  const demoFiles = [
    {
      id: 1,
      name: 'Vanguard ISA Statement — Oct 2025',
      type: 'Statement',
      icon: '📄',
      detected: 'Vanguard Investor UK • Period Oct \'25 • Confidence 0.93',
      wrapper: 'ISA',
      action: 'Link & Reconcile'
    },
    {
      id: 2,
      name: 'AJ Bell Contract Note — 28 Oct 2025',
      type: 'Contract note',
      icon: '📄',
      detected: 'Buy • IE00B5BMR087 • 45.50 @ £42.10 • Confidence 0.88',
      wrapper: 'SIPP',
      action: 'Create transaction'
    },
    {
      id: 3,
      name: 'HSBC Savings — Oct 2025',
      type: 'Bank statement',
      icon: '📄',
      detected: 'Cash account • Ending £12,500 • Confidence 0.85',
      wrapper: 'GIA',
      action: 'Update cash & link'
    }
  ];

  const getWrapperColor = (wrapper: string) => {
    const colors: Record<string, string> = {
      ISA: 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20',
      SIPP: 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20',
      GIA: 'bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20'
    };
    return colors[wrapper] || 'bg-[var(--muted)] text-[var(--foreground)] border-[var(--border)]';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[var(--card)] rounded-xl max-w-5xl w-full max-h-[90vh] overflow-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-[var(--card)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">✨ AI Import (beta)</h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors" data-testid="button-close-ai-import">
            <X className="h-5 w-5 text-[var(--foreground)]" />
          </button>
        </div>

        <div className="p-6">
          {/* Stepper */}
          <div className="flex gap-2 mb-6">
            <div className={`flex-1 h-2 rounded-full transition-colors ${
              step >= 1 ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]' : 'bg-[var(--muted)]'
            }`} />
            <div className={`flex-1 h-2 rounded-full transition-colors ${
              step >= 2 ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]' : 'bg-[var(--muted)]'
            }`} />
            <div className={`flex-1 h-2 rounded-full transition-colors ${
              step >= 3 ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]' : 'bg-[var(--muted)]'
            }`} />
          </div>

          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-[var(--foreground)] mb-2">1) Upload files</h3>
                <p className="text-sm text-[var(--muted-foreground)] mb-4">
                  Drop PDF statements, contract notes, CSV exports or screenshots. We'll detect the type, period and covered account.
                </p>

                <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-8 text-center bg-[var(--muted)]/20 hover:bg-[var(--muted)]/30 transition-colors cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto mb-3 text-[var(--muted-foreground)]" />
                  <div className="text-sm text-[var(--foreground)] mb-1">⬆ Drop files here or <span className="underline text-[var(--primary)]">browse…</span></div>
                  <div className="text-xs text-[var(--muted-foreground)]">Supported: PDF, CSV, XLSX, PNG, JPG</div>
                </div>
              </div>

              {/* Demo file list */}
              <div className="space-y-3">
                {demoFiles.map(file => (
                  <div key={file.id} className="flex items-center gap-3 p-4 border border-[var(--border)] rounded-xl bg-[var(--card)]">
                    <div className="text-2xl">{file.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-[var(--foreground)]">{file.name}</span>
                        <span className="px-2 py-0.5 bg-[var(--muted)] border border-[var(--border)] text-xs rounded-full">
                          {file.type}
                        </span>
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)]">{file.detected}</div>
                    </div>
                    <div className={`px-3 py-1 border rounded-lg text-xs font-medium ${getWrapperColor(file.wrapper)}`}>
                      Likely: {file.wrapper}
                    </div>
                    <div className="px-3 py-1 bg-[var(--muted)] border border-[var(--border)] text-xs rounded-lg">
                      Action: {file.action}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                <div className="text-xs text-[var(--muted-foreground)] max-w-md">
                  Nothing leaves your browser in this demo. Real product would process securely in-region.
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors"
                  data-testid="ai-import-continue-1"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Review & Match */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-[var(--foreground)] mb-2">2) Review & match</h3>
                <p className="text-sm text-[var(--muted-foreground)] mb-4">
                  Confirm what each file does. You can change coverage or ignore a file.
                </p>
              </div>

              <div className="border border-[var(--border)] rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[var(--muted)]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)]">File</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)]">Detected</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)]">Coverage</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)]">Creates</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[var(--border)]">
                      <td className="px-4 py-3 text-sm text-[var(--foreground)]">Vanguard ISA Statement — Oct 2025</td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">Statement (period)</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 border rounded-lg text-xs font-medium ${getWrapperColor('ISA')}`}>
                          Vanguard • ISA
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--foreground)]">
                        Link evidence • Mark Oct '25 as <strong>Reconciled</strong> when cash balances
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-[var(--muted)] border border-[var(--border)] text-xs rounded-lg">Keep</span>
                      </td>
                    </tr>
                    <tr className="border-t border-[var(--border)]">
                      <td className="px-4 py-3 text-sm text-[var(--foreground)]">AJ Bell Contract Note — 28 Oct 2025</td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">Buy 45.5 of IE00B5BMR087 @ £42.10</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 border rounded-lg text-xs font-medium ${getWrapperColor('SIPP')}`}>
                          AJ Bell • SIPP
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--foreground)]">
                        Create <strong>1 transaction</strong> (with fees & tax) and link PDF as evidence
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-[var(--muted)] border border-[var(--border)] text-xs rounded-lg">Keep</span>
                      </td>
                    </tr>
                    <tr className="border-t border-[var(--border)]">
                      <td className="px-4 py-3 text-sm text-[var(--foreground)]">HSBC Savings — Oct 2025</td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">Bank statement (cash)</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 border rounded-lg text-xs font-medium ${getWrapperColor('GIA')}`}>
                          HSBC • GIA Cash
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--foreground)]">
                        Update <strong>ending balance</strong> £12,500 • Option to extract <strong>interest</strong> entry
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-[var(--muted)] border border-[var(--border)] text-xs rounded-lg">Keep</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl">
                  <div className="text-sm font-semibold text-[var(--foreground)]">Holdings updates</div>
                  <div className="text-xs text-[var(--muted-foreground)] mt-1">0</div>
                </div>
                <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl">
                  <div className="text-sm font-semibold text-[var(--foreground)]">Transactions</div>
                  <div className="text-xs text-[var(--muted-foreground)] mt-1">1</div>
                </div>
                <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl">
                  <div className="text-sm font-semibold text-[var(--foreground)]">Evidence links</div>
                  <div className="text-xs text-[var(--muted-foreground)] mt-1">3</div>
                </div>
                <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl">
                  <div className="text-sm font-semibold text-[var(--foreground)]">Confidence</div>
                  <div className="text-xs text-[var(--muted-foreground)] mt-1">High</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2 bg-transparent border border-[var(--border)] text-[var(--foreground)] rounded-xl text-sm font-medium hover:bg-[var(--muted)] transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors"
                  data-testid="ai-import-continue-2"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Import Summary */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-[var(--foreground)] mb-2">3) Import</h3>
                <p className="text-sm text-[var(--muted-foreground)] mb-4">
                  Here's what we'll do. You can change actions above before importing.
                </p>
              </div>

              <div className="p-6 bg-[var(--muted)]/20 border border-[var(--border)] rounded-xl">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-[var(--foreground)]">
                        Create <strong>1 transaction</strong> in AJ Bell SIPP (Buy Global All-Cap; links contract note).
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-[var(--foreground)]">
                        Link <strong>Vanguard ISA statement</strong> and mark period <strong>ready to reconcile</strong>.
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-[var(--foreground)]">
                        Update <strong>HSBC cash balance</strong> and link bank statement as evidence.
                      </div>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="px-4 py-3 bg-[var(--success)]/10 border border-[var(--success)]/20 rounded-xl flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-[var(--success)] mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-[var(--foreground)]">Ready to import</div>
                  <div className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    All files processed successfully with high confidence
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2 bg-transparent border border-[var(--border)] text-[var(--foreground)] rounded-xl text-sm font-medium hover:bg-[var(--muted)] transition-colors"
                >
                  ← Back
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-transparent border border-[var(--border)] text-[var(--foreground)] rounded-xl text-sm font-medium hover:bg-[var(--muted)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors shadow-md"
                    data-testid="ai-import-submit"
                  >
                    Import 3 items
                  </button>
                </div>
              </div>
            </div>
          )}
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
