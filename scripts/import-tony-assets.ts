/**
 * One-off importer: seed investor "Tony" into the Layer-A asset register.
 *
 * Source is the other demo's `assets.data` JSONB blob (see scripts/seed notes).
 * Only Layer-A recorded facts are imported — planning assumptions (growth,
 * income, reinvest %, disposal-cost estimates) and scenario actions (disposal
 * type / transfer year) are deliberately dropped; they are not register facts.
 *
 * Run in an environment with DATABASE_URL set (e.g. the Replit Shell):
 *   npx tsx scripts/import-tony-assets.ts
 *
 * Idempotent: reuses a fixed Tony session (token `tony-demo`) and replaces its
 * csv_import assets each run. Link to view as that investor: /i/tony-demo
 */
import { eq, and } from 'drizzle-orm';
import { db } from '../server/db';
import { onboardingSessions, assets } from '../shared/schema';

const TONY_TOKEN = 'tony-demo';

// Layer-A facts only, lifted from the source blobs.
const RAW = [
  { assetId: 'tony-property-001', label: 'Main Residence — 6-bed', cls: 'property_residential', wrapper: 'unwrapped', value: 3500000, cost: 1500000, acq: '2005-01-01', mainResidence: true },
  { assetId: 'tony-property-002', label: 'Penthouse', cls: 'property_investment', wrapper: 'unwrapped', value: 950000, cost: 500000, acq: '2012-06-01' },
  { assetId: 'tony-property-003', label: 'Box Hill', cls: 'property_investment', wrapper: 'unwrapped', value: 920000, cost: 450000, acq: '2010-03-01' },
  { assetId: 'tony-property-004', label: 'Villa (EUR €1.75M)', cls: 'property_investment', wrapper: 'unwrapped', value: 1500000, cost: 800000, acq: '2024-01-01' },
  { assetId: 'tony-shares-001', label: 'L&G Shares', cls: 'isa', wrapper: 'unwrapped', value: 300000, cost: 150000 },
  { assetId: 'tony-shares-002', label: 'EasyJet Shares', cls: 'isa', wrapper: 'unwrapped', value: 200000, cost: 120000 },
  { assetId: 'tony-shares-003', label: 'Persimmon Shares', cls: 'isa', wrapper: 'unwrapped', value: 250000, cost: 100000 },
  { assetId: 'tony-shares-004', label: 'Lloyds Shares', cls: 'isa', wrapper: 'unwrapped', value: 300000, cost: 80000 },
  { assetId: 'tony-shares-005', label: 'Barclays Shares', cls: 'isa', wrapper: 'unwrapped', value: 350000, cost: 100000 },
  { assetId: 'tony-shares-006', label: 'M&S Shares', cls: 'isa', wrapper: 'unwrapped', value: 150000, cost: 60000 },
  { assetId: 'tony-shares-007', label: 'Ocado Shares', cls: 'isa', wrapper: 'unwrapped', value: 100000, cost: 80000 },
  { assetId: 'tony-shares-008', label: 'Mitchells & Butlers Shares', cls: 'isa', wrapper: 'unwrapped', value: 150000, cost: 60000 },
  { assetId: 'tony-shares-009', label: 'Santander Shares', cls: 'isa', wrapper: 'unwrapped', value: 200000, cost: 80000 },
  { assetId: 'tony-pension-001', label: 'SIPP', cls: 'pension', wrapper: 'pension', value: 2250000, pensionType: 'sipp' },
  { assetId: 'tony-vct-001', label: 'VCT — Triple Point', cls: 'vct', wrapper: 'unwrapped', value: 200000, cost: 200000, acq: '2020-04-01', origSub: 200000, relief: 'income_tax_relief' },
  { assetId: 'tony-vct-002', label: 'VCT — Unicorn', cls: 'vct', wrapper: 'unwrapped', value: 200000, cost: 200000, acq: '2019-10-01', origSub: 200000, relief: 'income_tax_relief' },
  { assetId: 'tony-vct-003', label: 'VCT — British Smaller Companies', cls: 'vct', wrapper: 'unwrapped', value: 200000, cost: 200000, acq: '2021-01-01', origSub: 200000, relief: 'income_tax_relief' },
  { assetId: 'tony-vct-004', label: 'VCT — Octopus Titan', cls: 'vct', wrapper: 'unwrapped', value: 200000, cost: 200000, acq: '2020-06-01', origSub: 200000, relief: 'income_tax_relief' },
  { assetId: 'tony-vct-005', label: 'Octopus AIM VCT', cls: 'aim_shares', wrapper: 'unwrapped', value: 200000, cost: 200000, acq: '2020-03-01', origSub: 200000, relief: 'income_tax_relief', ihtExempt: true },
  { assetId: 'tony-cash-001', label: 'Cash & Savings', cls: 'cash', wrapper: 'unwrapped', value: 130000 },
  { assetId: 'tony-other-001', label: 'Whiskey / Collectables', cls: 'isa', wrapper: 'unwrapped', value: 50000, cost: 30000 },
] as const;

// --- cleanup pass (the source data mislabels asset_class/wrapper) ---
function cleanAssetClass(cls: string, label: string): string {
  if (cls === 'isa') return /whisk|collect/i.test(label) ? 'collectibles' : 'equity'; // 'isa' is a wrapper, not a class
  if (cls === 'aim_shares') return 'aim';
  return cls; // property_*, vct, pension, cash pass through
}
function cleanWrapper(wrapper: string, cls: string): string {
  if (cls === 'vct') return 'vct';
  if (cls === 'aim_shares') return 'aim';
  if (cls === 'pension') return 'pension';
  if (cls.startsWith('property')) return 'property';
  if (cls === 'cash') return 'cash';
  return wrapper === 'unwrapped' ? 'gia' : wrapper;
}
function cleanRelief(relief?: string): string {
  return relief === 'income_tax_relief' ? 'vct' : 'none'; // CTX enum: none|eis|seis|vct
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set — run this in an environment with a database.');
    process.exit(1);
  }

  // Find or create Tony's session (fixed token so the link is stable).
  let [tony] = await db.select().from(onboardingSessions).where(eq(onboardingSessions.token, TONY_TOKEN));
  if (!tony) {
    [tony] = await db
      .insert(onboardingSessions)
      .values({ token: TONY_TOKEN, investorName: 'Tony (demo import)', state: '{}', currentStep: '/onboarding-v2/welcome', status: 'in_progress' })
      .returning();
  }

  const rows = RAW.map((r) => ({
    investorSessionId: tony.id,
    assetId: r.assetId,
    label: r.label,
    source: 'csv_import',
    wrapperType: cleanWrapper(r.wrapper, r.cls),
    assetClass: cleanAssetClass(r.cls, r.label),
    owner: 'person_1',
    currentValue: String(r.value),
    acquisitionCost: 'cost' in r && r.cost != null ? String(r.cost) : null,
    acquisitionDate: 'acq' in r ? (r as any).acq : null,
    originalSubscriptionAmount: 'origSub' in r ? String((r as any).origSub) : null,
    reliefClaimedType: cleanRelief((r as any).relief),
    isIhtExempt: Boolean((r as any).ihtExempt),
    isMainResidence: Boolean((r as any).mainResidence),
    pensionType: 'pensionType' in r ? (r as any).pensionType : null,
  }));

  // Replace Tony's imported rows.
  await db.delete(assets).where(and(eq(assets.investorSessionId, tony.id), eq(assets.source, 'csv_import')));
  await db.insert(assets).values(rows);

  const total = rows.reduce((s, r) => s + Number(r.currentValue), 0);
  console.log(`Imported ${rows.length} assets for Tony (session ${tony.id}). Total £${total.toLocaleString()}.`);
  console.log(`View as this investor at: /i/${TONY_TOKEN}`);
  process.exit(0);
}

main().catch((e) => {
  console.error('Import failed:', e);
  process.exit(1);
});
