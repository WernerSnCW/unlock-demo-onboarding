import { useState } from 'react';
import { Search, FileText, Upload, Download, Printer, X, Command } from 'lucide-react';

export default function AssetRegister() {
  const [activeTab, setActiveTab] = useState('holdings');
  const [detailDrawer, setDetailDrawer] = useState<string | null>(null);
  const [docLightbox, setDocLightbox] = useState(false);
  const [addAssetModal, setAddAssetModal] = useState(false);
  const [density, setDensity] = useState<'normal' | 'compact'>('normal');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`min-h-screen bg-[#0b0e13] ${density === 'compact' ? 'text-sm' : ''}`}>
      {/* Skip to content for accessibility */}
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded-lg">
        Skip to content
      </a>

      <div className="grid grid-cols-[300px_1fr]">
        {/* Sidebar */}
        <aside className="bg-gradient-to-b from-[#0e1421] to-[#0b0e13] border-r border-white/8 p-6 sticky top-0 h-screen overflow-auto">
          <div className="flex items-center gap-3 mb-6" aria-label="Unlock">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6cc0ff] to-[#a4b5ff] shadow-lg" aria-hidden="true"></div>
            <span className="text-[15px] font-bold text-[#cfe6ff]">Unlock • Asset Register</span>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xs text-[#98a6c7] uppercase tracking-wider mb-3">Valuation Snapshot</h3>
              <div className="text-sm text-[#eaf0ff] mb-2">As at: 31 Oct 2025</div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/6 border border-white/8 rounded-full text-xs text-[#c7d2e4] mb-2">
                EOD prices • GBP
              </div>
              <p className="text-xs text-[#98a6c7] leading-relaxed">
                Last reconcile: Oct 2025 (Vanguard, AJ Bell). Pending: Trading 212.
              </p>
            </div>

            <div>
              <h3 className="text-xs text-[#98a6c7] uppercase tracking-wider mb-3">Entities</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-white/6 border border-white/8 rounded-full text-xs text-[#c7d2e4]">Personal (100%)</span>
                <span className="px-3 py-1.5 bg-white/6 border border-white/8 rounded-full text-xs text-[#c7d2e4]">Spouse (—)</span>
                <span className="px-3 py-1.5 bg-white/6 border border-white/8 rounded-full text-xs text-[#c7d2e4]">Ltd (—)</span>
              </div>
            </div>

            <div>
              <h3 className="text-xs text-[#98a6c7] uppercase tracking-wider mb-3">Wrappers</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-white/6 border border-white/8 rounded-full text-xs text-[#c7d2e4]">ISA</span>
                <span className="px-3 py-1.5 bg-white/6 border border-white/8 rounded-full text-xs text-[#c7d2e4]">SIPP</span>
                <span className="px-3 py-1.5 bg-white/6 border border-white/8 rounded-full text-xs text-[#c7d2e4]">GIA</span>
                <span className="px-3 py-1.5 bg-white/6 border border-white/8 rounded-full text-xs text-[#c7d2e4]">Personal</span>
              </div>
            </div>

            <div>
              <h3 className="text-xs text-[#98a6c7] uppercase tracking-wider mb-3">Custodians</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-white/6 border border-white/8 rounded-full text-xs text-[#c7d2e4]">Vanguard Investor UK</span>
                <span className="px-3 py-1.5 bg-white/6 border border-white/8 rounded-full text-xs text-[#c7d2e4]">AJ Bell</span>
                <span className="px-3 py-1.5 bg-white/6 border border-white/8 rounded-full text-xs text-[#c7d2e4]">HSBC Savings</span>
                <span className="px-3 py-1.5 bg-white/6 border border-white/8 rounded-full text-xs text-[#c7d2e4]">Ledger – Main</span>
              </div>
            </div>

            <div>
              <h3 className="text-xs text-[#98a6c7] uppercase tracking-wider mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => setAddAssetModal(true)}
                  className="w-full px-3 py-2 bg-white/8 border border-white/14 rounded-xl text-sm text-[#eaf0ff] hover:bg-white/12 transition-colors flex items-center gap-2"
                  data-testid="button-add-asset"
                >
                  ＋ Add asset
                </button>
                <button className="w-full px-3 py-2 bg-white/8 border border-white/14 rounded-xl text-sm text-[#eaf0ff] hover:bg-white/12 transition-colors flex items-center gap-2" data-testid="button-add-liability">
                  − Add liability
                </button>
                <button className="w-full px-3 py-2 bg-white/8 border border-white/14 rounded-xl text-sm text-[#eaf0ff] hover:bg-white/12 transition-colors flex items-center gap-2" data-testid="button-import-csv">
                  ⇪ Import CSV
                </button>
                <button className="w-full px-3 py-2 bg-white/8 border border-white/14 rounded-xl text-sm text-[#eaf0ff] hover:bg-white/12 transition-colors flex items-center gap-2" data-testid="button-ai-import">
                  ✨ AI Import
                </button>
                <button 
                  onClick={() => setDocLightbox(true)}
                  className="w-full px-3 py-2 bg-white/8 border border-white/14 rounded-xl text-sm text-[#eaf0ff] hover:bg-white/12 transition-colors flex items-center gap-2"
                  data-testid="button-upload-evidence"
                >
                  <Upload className="h-4 w-4" /> Upload evidence
                </button>
                <button 
                  onClick={() => setDensity(density === 'normal' ? 'compact' : 'normal')}
                  className="w-full px-3 py-2 bg-white/8 border border-white/14 rounded-xl text-sm text-[#eaf0ff] hover:bg-white/12 transition-colors flex items-center gap-2"
                  data-testid="button-density"
                >
                  ⇕ Density: {density === 'normal' ? 'Normal' : 'Compact'}
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-20 backdrop-blur-md bg-[#0b0e13]/65 border-b border-white/8 px-6 py-4 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="search"
                placeholder="Search instruments, accounts, documents…"
                className="w-full bg-[#111623] border border-white/8 px-4 py-3 pr-10 text-[#eaf0ff] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99d6ff]"
                data-testid="input-search"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#98a6c7]" />
            </div>

            <div className="flex items-center gap-3">
              <select className="bg-[#111623] border border-white/8 text-[#eaf0ff] px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99d6ff]" data-testid="select-currency">
                <option>GBP</option>
                <option>EUR</option>
                <option>USD</option>
              </select>

              <button className="px-4 py-2.5 bg-[#151b2a] border border-white/9 rounded-xl text-[#eaf0ff] flex items-center gap-2" data-testid="button-status">
                <span className="w-2 h-2 rounded-full bg-[#4ade80]"></span>
                Reconciled
              </button>

              <button className="px-4 py-2.5 bg-[#151b2a] border border-white/8 rounded-xl text-[#eaf0ff] hover:bg-[#1a2335] transition-colors" data-testid="button-export">
                <Download className="h-4 w-4" />
              </button>

              <button 
                onClick={handlePrint}
                className="px-4 py-2.5 bg-[#151b2a] border border-white/8 rounded-xl text-[#eaf0ff] hover:bg-[#1a2335] transition-colors"
                data-testid="button-print"
              >
                <Printer className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div className="p-6" id="main">
            {/* KPI Tiles */}
            <div className="grid grid-cols-6 gap-4 mb-6">
              <KPITile label="Total Portfolio" value="£847,200" delta="+£12,400 (1.5%)" positive data-testid="kpi-total" />
              <KPITile label="Liquid" value="£612,300" sublabel="Cash + listed" data-testid="kpi-liquid" />
              <KPITile label="Property" value="£195,000" sublabel="Last updated: Oct 2025" data-testid="kpi-property" />
              <KPITile label="Alternatives" value="£39,900" sublabel="Crypto & private" data-testid="kpi-alternatives" />
              <KPITile label="Unrealised G/L" value="£94,100" delta="+18.2% since cost" positive data-testid="kpi-gl" />
              <KPITile label="Rebalance Status" value="2 buckets" delta="out of band" negative data-testid="kpi-rebalance" />
            </div>

            {/* Tabs */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
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
                        ? 'bg-gradient-to-b from-[#1b2438] to-[#151f33] border-white/9 text-[#cfe0ff] shadow-lg'
                        : 'bg-[#111623] border-white/8 text-[#cfe0ff] hover:bg-white/12'
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
        <AddAssetModal onClose={() => setAddAssetModal(false)} />
      )}
    </div>
  );
}

function KPITile({ label, value, delta, sublabel, positive, negative, ...props }: any) {
  return (
    <div className="p-4 rounded-2xl bg-gradient-to-b from-[#121a29] to-[#0f1725] border border-white/8" {...props}>
      <div className="text-xs text-[#98a6c7] mb-1">{label}</div>
      <div className="text-[22px] font-bold text-[#eaf0ff] mt-1">{value}</div>
      {delta && (
        <div className={`text-xs mt-2 ${positive ? 'text-[#4ade80]' : negative ? 'text-[#ff667a]' : 'text-[#98a6c7]'}`}>
          {delta}
        </div>
      )}
      {sublabel && <div className="text-xs text-[#98a6c7] mt-2">{sublabel}</div>}
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
    <div className="overflow-auto border border-white/8 rounded-2xl bg-[#151b2a]">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#12192a] border-b border-white/8 sticky top-0">
            <th className={`${rowPadding} text-left text-xs text-[#b9c6da] font-medium`}>Asset</th>
            <th className={`${rowPadding} text-left text-xs text-[#b9c6da] font-medium`}>Identifier</th>
            <th className={`${rowPadding} text-left text-xs text-[#b9c6da] font-medium`}>Custodian</th>
            <th className={`${rowPadding} text-left text-xs text-[#b9c6da] font-medium`}>Wrapper</th>
            <th className={`${rowPadding} text-right text-xs text-[#b9c6da] font-medium`}>Units</th>
            <th className={`${rowPadding} text-right text-xs text-[#b9c6da] font-medium`}>Cost</th>
            <th className={`${rowPadding} text-right text-xs text-[#b9c6da] font-medium`}>Price</th>
            <th className={`${rowPadding} text-right text-xs text-[#b9c6da] font-medium`}>Value</th>
            <th className={`${rowPadding} text-left text-xs text-[#b9c6da] font-medium`}>Return</th>
            <th className={`${rowPadding} text-left text-xs text-[#b9c6da] font-medium`}>Bucket</th>
            <th className={`${rowPadding} text-left text-xs text-[#b9c6da] font-medium`}>Tax/Relief</th>
            <th className={`${rowPadding} text-left text-xs text-[#b9c6da] font-medium`}>Evidence</th>
            <th className={`${rowPadding} text-left text-xs text-[#b9c6da] font-medium`}>Complete</th>
            <th className={`${rowPadding} text-left text-xs text-[#b9c6da] font-medium`}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding, idx) => (
            <tr key={idx} className="border-b border-white/8 hover:bg-white/4 transition-colors">
              <td className={rowPadding}>
                <div className="font-medium text-sm text-[#eaf0ff]" data-testid={`text-asset-${idx}`}>{holding.asset}</div>
                <div className="text-xs text-[#98a6c7]">{holding.type}</div>
              </td>
              <td className={`${rowPadding} text-sm text-[#eaf0ff]`} data-testid={`text-identifier-${idx}`}>{holding.identifier}</td>
              <td className={`${rowPadding} text-sm text-[#eaf0ff]`}>{holding.custodian}</td>
              <td className={rowPadding}>
                <WrapperTag wrapper={holding.wrapper} />
              </td>
              <td className={`${rowPadding} text-right text-sm text-[#eaf0ff]`}>{holding.units}</td>
              <td className={`${rowPadding} text-right text-sm text-[#eaf0ff]`}>{holding.cost}</td>
              <td className={`${rowPadding} text-right text-sm text-[#eaf0ff]`}>{holding.price}</td>
              <td className={`${rowPadding} text-right text-sm text-[#eaf0ff] font-medium`}>{holding.value}</td>
              <td className={`${rowPadding} text-sm text-[#4ade80]`}>{holding.return}</td>
              <td className={`${rowPadding} text-sm text-[#eaf0ff]`}>{holding.bucket}</td>
              <td className={rowPadding}>
                {holding.countdown ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full border border-white/8 bg-gradient-to-b from-[#1b2438] to-[#151f33] text-xs text-[#cfe6ff]">
                    <span className="w-2 h-2 rounded-full bg-[#ffd166]"></span>
                    {holding.countdown}
                  </span>
                ) : holding.tax === 'On-chain verify' ? (
                  <span className="px-2 py-1 rounded-full bg-blue-500/12 text-blue-300 text-xs border border-blue-500/20">
                    {holding.tax}
                  </span>
                ) : holding.tax === 'EIS' ? (
                  <span className="px-2 py-1 rounded-full bg-green-500/12 text-green-300 text-xs border border-green-500/20 font-medium">
                    {holding.tax}
                  </span>
                ) : (
                  <span className="text-sm text-[#eaf0ff]">{holding.tax}</span>
                )}
              </td>
              <td className={rowPadding}>
                <EvidenceStatus status={holding.evidence} />
              </td>
              <td className={rowPadding}>
                <CompletenessBar percentage={holding.completeness} />
              </td>
              <td className={rowPadding}>
                <button 
                  onClick={() => onViewDetail(holding.type.includes('Property') ? 'property' : 'listed')}
                  className="px-3 py-1 bg-transparent border border-white/8 rounded-lg text-xs text-[#eaf0ff] hover:bg-white/8 transition-colors"
                  data-testid={`button-view-${idx}`}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-3 bg-[#12192a] text-xs text-[#98a6c7] border-t border-white/8">
        Total: £370,280 • 7 holdings across 4 wrappers
      </div>
    </div>
  );
}

function WrapperTag({ wrapper }: { wrapper: string }) {
  const colors: any = {
    ISA: 'bg-[#6cc0ff]/12 text-[#bfe6ff] border-[#6cc0ff]/20',
    SIPP: 'bg-[#9ae6b4]/12 text-[#d3ffe7] border-[#9ae6b4]/20',
    GIA: 'bg-[#ffd166]/12 text-[#ffe7aa] border-[#ffd166]/20',
    Personal: 'bg-white/8 text-[#c7d2e4] border-white/14',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs border ${colors[wrapper] || colors.Personal}`}>
      {wrapper}
    </span>
  );
}

function EvidenceStatus({ status }: { status: string }) {
  const statusConfig: any = {
    'On file': { color: 'text-[#4ade80]', dot: 'bg-[#4ade80]' },
    'Valuation due': { color: 'text-[#ffd166]', dot: 'bg-[#ffd166]' },
    'On-chain verify': { color: 'text-[#6cc0ff]', dot: 'bg-[#6cc0ff]' },
  };
  const config = statusConfig[status] || statusConfig['On file'];
  return (
    <span className={`inline-flex items-center gap-2 text-xs ${config.color}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot}`}></span>
      {status}
    </span>
  );
}

function CompletenessBar({ percentage }: { percentage: number }) {
  return (
    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-white/6 border border-white/8">
      <span className="text-xs text-[#eaf0ff]">{percentage}%</span>
      <div className="w-24 h-2 bg-white/12 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#9ae6b4] to-[#b2f5ea]" 
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
    <div className="space-y-4">
      {bands.map((band, idx) => (
        <div key={idx} className="p-4 bg-[#151b2a] border border-white/8 rounded-xl" data-testid={`band-${idx}`}>
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-base font-semibold text-[#eaf0ff]">{band.bucket}</h3>
              <p className="text-xs text-[#98a6c7]">Target {band.target}% • Band {band.band[0]}–{band.band[1]}%</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-[#eaf0ff]">{band.current}%</div>
              <div className={`text-xs ${band.status.includes('over') ? 'text-[#ff667a]' : band.status.includes('under') ? 'text-[#ffd166]' : 'text-[#4ade80]'}`}>
                {band.status}
              </div>
            </div>
          </div>
          <div className="h-2.5 bg-white/8 rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-gradient-to-r from-[#6cc0ff] to-[#a0e9ff]" 
              style={{ width: `${band.current}%` }}
            ></div>
          </div>
          {band.action && (
            <p className="text-sm text-[#98a6c7] mt-2">→ {band.action}</p>
          )}
        </div>
      ))}

      <div className="mt-6 p-4 bg-[#151b2a] border border-white/8 rounded-xl">
        <h3 className="text-sm font-semibold text-[#eaf0ff] mb-3">Suggested Actions</h3>
        <ul className="space-y-2 text-sm text-[#eaf0ff]">
          <li className="flex items-start gap-2">
            <span className="text-[#6cc0ff]">•</span>
            <span>Sell £7,200 from Global Equity ISA holdings to rebalance</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#6cc0ff]">•</span>
            <span>Increase cash reserves by £6,000 from sale proceeds</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#6cc0ff]">•</span>
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
    <div>
      <div className="overflow-auto border border-white/8 rounded-2xl bg-[#151b2a] mb-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#12192a] border-b border-white/8">
              <th className={`${rowPadding} text-left text-xs text-[#b9c6da] font-medium`}>Trade Date</th>
              <th className={`${rowPadding} text-left text-xs text-[#b9c6da] font-medium`}>Action</th>
              <th className={`${rowPadding} text-left text-xs text-[#b9c6da] font-medium`}>Identifier</th>
              <th className={`${rowPadding} text-left text-xs text-[#b9c6da] font-medium`}>Asset</th>
              <th className={`${rowPadding} text-right text-xs text-[#b9c6da] font-medium`}>Units</th>
              <th className={`${rowPadding} text-right text-xs text-[#b9c6da] font-medium`}>Price</th>
              <th className={`${rowPadding} text-right text-xs text-[#b9c6da] font-medium`}>Fees</th>
              <th className={`${rowPadding} text-right text-xs text-[#b9c6da] font-medium`}>Tax</th>
              <th className={`${rowPadding} text-right text-xs text-[#b9c6da] font-medium`}>Net Amount</th>
              <th className={`${rowPadding} text-left text-xs text-[#b9c6da] font-medium`}>Broker</th>
              <th className={`${rowPadding} text-left text-xs text-[#b9c6da] font-medium`}>Wrapper</th>
              <th className={`${rowPadding} text-left text-xs text-[#b9c6da] font-medium`}>Evidence</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, idx) => (
              <tr key={idx} className="border-b border-white/8 hover:bg-white/4 transition-colors" data-testid={`row-transaction-${idx}`}>
                <td className={`${rowPadding} text-sm text-[#eaf0ff]`}>{tx.date}</td>
                <td className={rowPadding}>
                  <span className={`px-2 py-1 rounded-full text-xs ${tx.action === 'Buy' ? 'bg-green-500/12 text-green-300 border border-green-500/20' : 'bg-red-500/12 text-red-300 border border-red-500/20'}`}>
                    {tx.action}
                  </span>
                </td>
                <td className={`${rowPadding} text-sm text-[#eaf0ff]`}>{tx.identifier}</td>
                <td className={`${rowPadding} text-sm text-[#eaf0ff]`}>{tx.asset}</td>
                <td className={`${rowPadding} text-right text-sm text-[#eaf0ff]`}>{tx.units}</td>
                <td className={`${rowPadding} text-right text-sm text-[#eaf0ff]`}>{tx.price}</td>
                <td className={`${rowPadding} text-right text-sm text-[#98a6c7]`}>{tx.fees}</td>
                <td className={`${rowPadding} text-right text-sm text-[#98a6c7]`}>{tx.tax}</td>
                <td className={`${rowPadding} text-right text-sm text-[#eaf0ff] font-medium`}>{tx.net}</td>
                <td className={`${rowPadding} text-sm text-[#eaf0ff]`}>{tx.broker}</td>
                <td className={rowPadding}><WrapperTag wrapper={tx.wrapper} /></td>
                <td className={`${rowPadding} text-sm text-[#98a6c7]`}>{tx.evidence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-[#151b2a]/50 border border-white/8 rounded-xl">
        <p className="text-sm text-[#98a6c7] leading-relaxed">
          <strong className="text-[#eaf0ff]">Auditability note:</strong> All transactions are recorded for Section 104 pooling calculations and CGT reporting. ISA and SIPP transactions are exempt from capital gains tax.
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
    <div className="grid grid-cols-3 gap-4">
      {docs.map((doc, idx) => (
        <button
          key={idx}
          onClick={onViewDoc}
          className="p-4 bg-[#151b2a] border border-white/8 rounded-xl hover:bg-white/4 transition-colors text-left"
          data-testid={`doc-${idx}`}
        >
          <div className="flex items-start gap-3 mb-2">
            <FileText className="h-5 w-5 text-[#6cc0ff]" />
            <h3 className="text-sm font-semibold text-[#eaf0ff] flex-1">{doc.title}</h3>
          </div>
          <div className="space-y-1 text-xs text-[#98a6c7]">
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
      <div className="grid grid-cols-3 gap-4 mb-6">
        {accounts.map((acc, idx) => (
          <div key={idx} className="p-4 bg-[#151b2a] border border-white/8 rounded-xl" data-testid={`reconcile-${idx}`}>
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-sm font-semibold text-[#eaf0ff]">{acc.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs border ${acc.status === 'Reconciled' ? 'bg-green-500/12 text-green-300 border-green-500/20' : 'bg-amber-500/12 text-amber-300 border-amber-500/20'}`}>
                {acc.status}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#98a6c7]">Period:</span>
                <span className="text-[#eaf0ff]">{acc.period}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#98a6c7]">Statement:</span>
                <span className="text-[#eaf0ff]">{acc.statement}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#98a6c7]">Differences:</span>
                <span className="text-[#eaf0ff]">{acc.differences}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-[#151b2a]/50 border border-dashed border-white/14 rounded-xl">
        <h3 className="text-sm font-semibold text-[#eaf0ff] mb-3">What's Missing</h3>
        <ul className="space-y-2 text-sm text-[#98a6c7]">
          <li className="flex items-start gap-2">
            <span className="text-[#ffd166]">⚠</span>
            <span>Trading 212 GIA statement for Oct 2025 – Upload required</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#ffd166]">⚠</span>
            <span>Property valuation for 42 Elm Street – Due in 14 days</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#ffd166]">⚠</span>
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
    <div>
      <div className="space-y-4 mb-6">
        {entities.map((entity, idx) => (
          <div key={idx} className="p-4 bg-[#151b2a] border border-white/8 rounded-xl" data-testid={`household-${idx}`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-base font-semibold text-[#eaf0ff]">{entity.name}</h3>
                <p className="text-xs text-[#98a6c7]">{entity.note}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-[#eaf0ff]">{entity.ownership}%</div>
                <div className="text-sm text-[#98a6c7]">{entity.value}</div>
              </div>
            </div>
            <div className="h-2.5 bg-white/8 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#6cc0ff] to-[#a0e9ff]" 
                style={{ width: `${entity.ownership}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-[#151b2a]/50 border border-white/8 rounded-xl">
        <h3 className="text-sm font-semibold text-[#eaf0ff] mb-3">Household Notes</h3>
        <ul className="space-y-2 text-sm text-[#98a6c7]">
          <li className="flex items-start gap-2">
            <span className="text-[#6cc0ff]">•</span>
            <span>Enable spouse portfolio to view combined household net worth and optimise allowances</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#6cc0ff]">•</span>
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
      <div className="relative w-full max-w-3xl h-screen bg-[#111623] border-l border-white/8 shadow-2xl overflow-auto animate-slide-in-right">
        <div className="sticky top-0 z-10 flex justify-between items-center p-6 border-b border-white/8 bg-[#111623]">
          <h2 className="text-lg font-bold text-[#eaf0ff]">
            {type === 'property' ? 'Property Detail' : 'Holding Detail'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/8 rounded-lg transition-colors" data-testid="button-close-drawer">
            <X className="h-5 w-5 text-[#eaf0ff]" />
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
        <div className="p-4 bg-[#151b2a] border border-white/8 rounded-xl">
          <h3 className="text-sm font-semibold text-[#eaf0ff] mb-3">Position</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[#98a6c7]">Units:</span><span className="text-[#eaf0ff]">1,234.56</span></div>
            <div className="flex justify-between"><span className="text-[#98a6c7]">Price:</span><span className="text-[#eaf0ff]">£42.18</span></div>
            <div className="flex justify-between"><span className="text-[#98a6c7]">Market Value:</span><span className="text-[#eaf0ff] font-bold">£52,080</span></div>
            <div className="flex justify-between"><span className="text-[#98a6c7]">Cost Basis:</span><span className="text-[#eaf0ff]">£45,600</span></div>
            <div className="flex justify-between"><span className="text-[#98a6c7]">Unrealised G/L:</span><span className="text-[#4ade80] font-medium">+£6,480 (+14.2%)</span></div>
            <div className="flex justify-between"><span className="text-[#98a6c7]">Bucket:</span><span className="text-[#eaf0ff]">Global Equity</span></div>
          </div>
        </div>
        
        <div className="p-4 bg-[#151b2a] border border-white/8 rounded-xl">
          <h3 className="text-sm font-semibold text-[#eaf0ff] mb-3">Compliance</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[#98a6c7]">Evidence:</span><EvidenceStatus status="On file" /></div>
            <div className="flex justify-between"><span className="text-[#98a6c7]">Tax Treatment:</span><span className="text-[#eaf0ff]">Accumulating</span></div>
            <div className="flex justify-between"><span className="text-[#98a6c7]">Valuation Date:</span><span className="text-[#eaf0ff]">31 Oct 2025</span></div>
            <div className="flex justify-between"><span className="text-[#98a6c7]">Identifier:</span><span className="text-[#eaf0ff]">IE00B5BMR087</span></div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-[#151b2a] border border-white/8 rounded-xl">
        <h3 className="text-sm font-semibold text-[#eaf0ff] mb-3">Targets & Bands</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-[#98a6c7]">Target Allocation:</span><span className="text-[#eaf0ff]">40%</span></div>
          <div className="flex justify-between"><span className="text-[#98a6c7]">Current Allocation:</span><span className="text-[#eaf0ff]">46%</span></div>
          <div className="flex justify-between"><span className="text-[#98a6c7]">Status:</span><span className="text-[#ff667a]">+6% over band</span></div>
        </div>
      </div>

      <div className="p-4 bg-[#151b2a] border border-white/8 rounded-xl">
        <h3 className="text-sm font-semibold text-[#eaf0ff] mb-3">Performance</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-[#98a6c7]">IRR since inception:</span><span className="text-[#4ade80]">14.2%</span></div>
          <div className="flex justify-between"><span className="text-[#98a6c7]">TWR 1 year:</span><span className="text-[#4ade80]">12.8%</span></div>
          <div className="flex justify-between"><span className="text-[#98a6c7]">Since last top-up:</span><span className="text-[#4ade80]">8.4%</span></div>
        </div>
      </div>
    </>
  );
}

function PropertyDetail() {
  return (
    <>
      <div className="p-4 bg-[#151b2a] border border-white/8 rounded-xl">
        <h3 className="text-sm font-semibold text-[#eaf0ff] mb-3">Valuation Trend</h3>
        <div className="h-20 flex items-end gap-1">
          {[165, 172, 178, 185, 192, 195].map((val, idx) => (
            <div key={idx} className="flex-1 bg-gradient-to-t from-[#6cc0ff] to-[#a0e9ff] rounded-t" style={{ height: `${(val/195)*100}%` }}></div>
          ))}
        </div>
        <div className="mt-2 text-xs text-[#98a6c7] flex justify-between">
          <span>2023</span>
          <span>2024</span>
          <span>2025</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-[#151b2a] border border-white/8 rounded-xl">
          <h3 className="text-sm font-semibold text-[#eaf0ff] mb-3">Property Metrics</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[#98a6c7]">Current Value:</span><span className="text-[#eaf0ff] font-bold">£195,000</span></div>
            <div className="flex justify-between"><span className="text-[#98a6c7]">Purchase Price:</span><span className="text-[#eaf0ff]">£165,000</span></div>
            <div className="flex justify-between"><span className="text-[#98a6c7]">LTV:</span><span className="text-[#eaf0ff]">0% (unmortgaged)</span></div>
            <div className="flex justify-between"><span className="text-[#98a6c7]">Rental Yield:</span><span className="text-[#4ade80]">5.8%</span></div>
          </div>
        </div>

        <div className="p-4 bg-[#151b2a] border border-white/8 rounded-xl">
          <h3 className="text-sm font-semibold text-[#eaf0ff] mb-3">Compliance</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[#98a6c7]">EPC Rating:</span><span className="text-[#eaf0ff]">B (84)</span></div>
            <div className="flex justify-between"><span className="text-[#98a6c7]">Insurance:</span><span className="text-[#4ade80]">Current</span></div>
            <div className="flex justify-between"><span className="text-[#98a6c7]">Title:</span><span className="text-[#4ade80]">On file</span></div>
            <div className="flex justify-between"><span className="text-[#98a6c7]">Last Valuation:</span><span className="text-[#ffd166]">Sep 2025</span></div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-[#151b2a] border border-white/8 rounded-xl">
        <h3 className="text-sm font-semibold text-[#eaf0ff] mb-3">Reminders</h3>
        <ul className="space-y-2 text-sm text-[#98a6c7]">
          <li className="flex items-start gap-2">
            <span className="text-[#ffd166]">⚠</span>
            <span>Annual gas safety check due: 15 Dec 2025</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#6cc0ff]">ℹ</span>
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
      <div className="w-full max-w-4xl h-[80vh] bg-[#111623] border border-white/8 rounded-2xl shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-white/8 bg-gradient-to-b from-[#1b2438] to-[#151f33]">
          <h3 className="text-lg font-bold text-[#eaf0ff]">Document Viewer</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/8 rounded-lg transition-colors" data-testid="button-close-lightbox">
            <X className="h-5 w-5 text-[#eaf0ff]" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full h-full border border-dashed border-white/14 rounded-xl flex items-center justify-center">
            <div className="text-center text-[#b9c6da]">
              <FileText className="h-16 w-16 mx-auto mb-4 text-[#6cc0ff]" />
              <p className="text-lg">PDF Document Preview</p>
              <p className="text-sm text-[#98a6c7] mt-2">Vanguard ISA Statement - Oct 2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddAssetModal({ onClose }: any) {
  const [mode, setMode] = useState<'asset' | 'liability'>('asset');
  const [category, setCategory] = useState('listed');
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  const assetCategories = [
    { id: 'listed', label: 'Listed security', subtitle: 'Fund • ETF • Share by ISIN or ticker', icon: '📈', color: 'blue' },
    { id: 'cash', label: 'Cash', subtitle: 'Bank or savings balance', icon: '💷', color: 'mint' },
    { id: 'crypto', label: 'Crypto', subtitle: 'Exchange account or on-chain wallet', icon: '🦊', color: 'pink' },
    { id: 'property', label: 'Property', subtitle: 'Home • BTL • Commercial', icon: '🏠', color: 'amber' },
    { id: 'private', label: 'Private equity', subtitle: 'EIS/SEIS • Unlisted shares', icon: '🧩', color: 'blue' },
    { id: 'alt', label: 'Alternatives', subtitle: 'Metals • Art • Domains • Other', icon: '✨', color: 'mint' },
  ];

  const liabilityCategories = [
    { id: 'mortgage', label: 'Mortgage', subtitle: 'Link to a property', icon: '🏦', color: 'amber' },
    { id: 'loan', label: 'Loan', subtitle: 'Personal • Business', icon: '📄', color: 'blue' },
    { id: 'card', label: 'Credit card', subtitle: 'Rolling balance', icon: '💳', color: 'pink' },
  ];

  const categories = mode === 'asset' ? assetCategories : liabilityCategories;

  return (
    <div className="fixed inset-0 z-50 overflow-auto">
      {/* Background with animated gradient ring */}
      <div className="fixed inset-0 bg-[radial-gradient(1100px_900px_at_80%_-10%,#16223a_0%,#0b111e_55%,#0a0d14_100%)]">
        <div className="absolute inset-0 opacity-50 animate-spin-slow" style={{ background: 'conic-gradient(from 0deg, rgba(127,211,255,.10), transparent 20%, rgba(154,230,180,.06) 35%, transparent 60%, rgba(127,211,255,.08) 80%, transparent 100%)', filter: 'blur(50px)', animationDuration: '16s' }}></div>
      </div>

      <div className="relative max-w-5xl mx-auto py-8 px-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7fd3ff] to-[#a7b5ff] shadow-lg"></div>
            <span className="text-lg font-bold text-[#eaf2ff]">Unlock — Add Assets</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowCommandPalette(true)}
              className="px-4 py-2.5 bg-white/8 border border-white/14 rounded-xl text-sm text-[#eaf2ff] hover:bg-white/12 transition-colors flex items-center gap-2"
              data-testid="button-command-palette"
            >
              <Command className="h-4 w-4" /> Command Palette
            </button>
            <button className="px-4 py-2.5 bg-white/8 border border-white/14 rounded-xl text-sm text-[#eaf2ff] hover:bg-white/12 transition-colors" data-testid="button-ai-import-modal">
              ✨ AI Import
            </button>
            <button className="px-4 py-2.5 bg-white/8 border border-white/14 rounded-xl text-sm text-[#eaf2ff] hover:bg-white/12 transition-colors" data-testid="button-csv-modal">
              ⇪ CSV
            </button>
            <button onClick={onClose} className="px-4 py-2.5 bg-gradient-to-b from-[#1a2438] to-[#131c2e] border border-white/18 rounded-xl text-sm text-[#eaf2ff] hover:opacity-90 transition-opacity" data-testid="button-close-modal">
              Close
            </button>
          </div>
        </header>

        {/* Mode Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('asset')}
            className={`px-4 py-2.5 rounded-full border transition-all ${mode === 'asset' ? 'bg-gradient-to-b from-[#1c253a] to-[#151f33] border-white/18 text-[#d7e6ff]' : 'bg-white/6 border-white/14 text-[#d7e6ff] hover:bg-white/8'}`}
            data-testid="tab-add-asset"
          >
            ＋ Add asset
          </button>
          <button
            onClick={() => setMode('liability')}
            className={`px-4 py-2.5 rounded-full border transition-all ${mode === 'liability' ? 'bg-gradient-to-b from-[#1c253a] to-[#151f33] border-white/18 text-[#d7e6ff]' : 'bg-white/6 border-white/14 text-[#d7e6ff] hover:bg-white/8'}`}
            data-testid="tab-add-liability"
          >
            − Add liability
          </button>
        </div>

        {/* Category Tiles */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`relative p-5 min-h-[120px] rounded-2xl border overflow-hidden transition-all hover:translate-y-[-2px] hover:shadow-2xl ${category === cat.id ? 'ring-2 ring-[#7fd3ff] border-white/22' : 'border-white/14'} bg-gradient-to-b from-white/9 to-white/6`}
              data-testid={`tile-${cat.id}`}
            >
              <div className="relative z-10">
                <h3 className="font-bold text-[#eaf2ff] mb-1.5">{cat.label}</h3>
                <p className="text-sm text-[#a2b1cc]">{cat.subtitle}</p>
              </div>
              <div className="absolute bottom-3 right-3 text-3xl opacity-80">{cat.icon}</div>
              <div className={`absolute w-40 h-40 rounded-full -right-10 -top-10 opacity-28 blur-2xl ${cat.color === 'blue' ? 'bg-[#7fd3ff]' : cat.color === 'mint' ? 'bg-[#9ae6b4]' : cat.color === 'amber' ? 'bg-[#ffd166]' : 'bg-[#ff80a6]'}`}></div>
            </button>
          ))}
        </div>

        {/* Stepper Panel */}
        <div className="border border-white/14 rounded-2xl bg-white/6 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/14">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-[#cfe6ff]">
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-b from-[#7fd3ff] to-[#a0e9ff]"></span>
                Identify
              </div>
              <div className="flex items-center gap-2 text-sm text-[#cfe6ff]">
                <span className="w-2.5 h-2.5 rounded-full bg-white/35"></span>
                Amount
              </div>
              <div className="flex items-center gap-2 text-sm text-[#cfe6ff]">
                <span className="w-2.5 h-2.5 rounded-full bg-white/35"></span>
                Evidence
              </div>
            </div>
            <div className="flex-1 max-w-xs mx-4">
              <div className="h-1.5 bg-white/14 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#7fd3ff] to-[#a0e9ff]" style={{ width: '33%' }}></div>
              </div>
            </div>
            <div className="text-sm text-[#cfe6ff]">Wrapper: ISA • Custodian: Vanguard</div>
          </div>
          
          <div className="p-6">
            {category === 'listed' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#a2b1cc] mb-2">ISIN / Ticker</label>
                    <input type="text" placeholder="e.g., IE00B5BMR087 or VWRL" className="w-full px-3 py-3 bg-[#0d1220]/80 border border-white/14 rounded-xl text-[#eaf2ff] focus:outline-none focus:ring-2 focus:ring-[#7fd3ff]" data-testid="input-isin" />
                    <p className="text-xs text-[#a2b1cc] mt-1.5">Paste an ISIN — name and last price are auto-filled on save (in production).</p>
                  </div>
                  <div>
                    <label className="block text-xs text-[#a2b1cc] mb-2">Name (auto)</label>
                    <input type="text" placeholder="Autofilled or type manually" className="w-full px-3 py-3 bg-[#0d1220]/80 border border-white/14 rounded-xl text-[#eaf2ff] focus:outline-none focus:ring-2 focus:ring-[#7fd3ff]" data-testid="input-name" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#a2b1cc] mb-2">Wrapper</label>
                    <select className="w-full px-3 py-3 bg-[#0d1220]/80 border border-white/14 rounded-xl text-[#eaf2ff] focus:outline-none focus:ring-2 focus:ring-[#7fd3ff]" data-testid="select-wrapper">
                      <option>ISA</option>
                      <option>SIPP</option>
                      <option>GIA</option>
                      <option>Personal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[#a2b1cc] mb-2">Custodian / Broker</label>
                    <input type="text" placeholder="e.g., Vanguard Investor UK" className="w-full px-3 py-3 bg-[#0d1220]/80 border border-white/14 rounded-xl text-[#eaf2ff] focus:outline-none focus:ring-2 focus:ring-[#7fd3ff]" data-testid="input-custodian" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button className="px-4 py-2.5 bg-white/8 border border-white/14 rounded-xl text-sm text-[#eaf2ff] hover:bg-white/12 transition-colors" data-testid="button-back">
                    Back
                  </button>
                  <button className="px-4 py-2.5 bg-gradient-to-b from-[#1a2438] to-[#131c2e] border border-white/18 rounded-xl text-sm text-[#eaf2ff] hover:opacity-90 transition-opacity" data-testid="button-continue">
                    Continue
                  </button>
                </div>
              </div>
            )}
            {category !== 'listed' && (
              <div className="text-center py-8 text-[#a2b1cc]">
                <p>Form for {categories.find(c => c.id === category)?.label} coming soon (demo)</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Command Palette */}
      {showCommandPalette && (
        <div className="fixed inset-0 bg-black/35 backdrop-blur-sm flex items-center justify-center z-60" onClick={() => setShowCommandPalette(false)}>
          <div className="w-full max-w-2xl bg-gradient-to-b from-[#1a2336] to-[#141c2d] border border-white/14 rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 p-3 border-b border-white/14">
              <Search className="h-5 w-5 text-[#98a6c7]" />
              <input 
                type="text" 
                placeholder="Search quick actions..." 
                className="flex-1 bg-white/8 border border-white/14 rounded-xl px-3 py-2.5 text-[#eaf2ff] focus:outline-none focus:ring-2 focus:ring-[#7fd3ff]"
                autoFocus
                data-testid="input-command-search"
              />
            </div>
            <div className="max-h-[60vh] overflow-auto p-2.5">
              {['Add listed security', 'Add cash account', 'Add crypto (exchange)', 'Add crypto (on-chain)', 'Add property', 'Add private equity', 'AI import', 'CSV import'].map((action, idx) => (
                <button 
                  key={idx}
                  className="w-full text-left px-3 py-2.5 rounded-xl border border-transparent hover:bg-white/6 hover:border-white/14 transition-all flex items-center gap-3 text-sm text-[#eaf2ff]"
                  data-testid={`command-${idx}`}
                >
                  <span className="opacity-60">⌘{idx + 1}</span>
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
