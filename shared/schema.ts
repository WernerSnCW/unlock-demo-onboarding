import { sql } from "drizzle-orm";
import { pgTable, text, varchar, numeric, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const investors = pgTable("investors", {
  userId: varchar("user_id").primaryKey(),
  name: text("name").notNull(),
  investorType: text("investor_type"), // 'Angel','Fund','Family Office',...
  portfolioAnalysis: text("portfolio_analysis"), // JSON string of cached portfolio analysis
  analysisUpdatedAt: timestamp("analysis_updated_at"), // Last time analysis was generated
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const investorPreferences = pgTable("investor_preferences", {
  userId: varchar("user_id").primaryKey(),
  riskBand: text("risk_band"), // 'Low','Moderate','High'
  ticketMinGbp: numeric("ticket_min_gbp"),
  ticketMaxGbp: numeric("ticket_max_gbp"),
  regions: text("regions").array(),
  focusSectors: integer("focus_sectors").array(), // FK -> sectors(id)
  existingInvestments: text("existing_investments").array(), // Types of investments they currently have
  investmentInterests: text("investment_interests").array(), // Types of investments they're interested in
  // New wizard fields
  investorName: text("investor_name"), // Name captured in wizard
  activeInvestmentInterests: text("active_investment_interests").array(), // Step 1 wizard data
  learningCuriosityAreas: text("learning_curiosity_areas").array(), // Step 2 wizard data
  geographicPreferences: text("geographic_preferences").array(), // Step 3 wizard data
  wizardCompletedAt: timestamp("wizard_completed_at"), // When wizard was completed
  completionMethod: text("completion_method"), // 'auto' or 'manual' - tracks how wizard was completed
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const taxProfile = pgTable("tax_profile", {
  userId: varchar("user_id").primaryKey(),
  country: text("country"),
  interests: text("interests").array(), // e.g., ['EIS','SEIS']
  annualEarningsGbp: numeric("annual_earnings_gbp"), // Annual earnings in GBP
  cgtAllowanceGbp: numeric("cgt_allowance_gbp"), // Capital Gains Tax allowance in GBP
});

export const portfolioAccounts = pgTable("portfolio_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => investors.userId, { onDelete: "cascade" }),
  provider: text("provider"), // 'Moneyhub','Plaid','Manual','Coinbase','IBKR'...
  providerAccountId: text("provider_account_id"),
  accountType: text("account_type"), // 'brokerage','cash','private'
  currency: text("currency").default("GBP"),
  connected: boolean("connected").default(false),
  connectedAt: timestamp("connected_at"),
  currentBalanceGbp: numeric("current_balance_gbp"), // Current total balance in GBP
  cashBalanceGbp: numeric("cash_balance_gbp"), // Available cash balance in GBP
  lastUpdated: timestamp("last_updated").default(sql`now()`),
});

export const portfolioHoldings = pgTable("portfolio_holdings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => investors.userId, { onDelete: "cascade" }),
  accountId: varchar("account_id").references(() => portfolioAccounts.id, { onDelete: "set null" }),
  assetType: text("asset_type"), // 'equity','fund','crypto','private','other'
  provider: text("provider"),
  sourceRef: text("source_ref"),
  symbol: text("symbol"), // may be NULL for private
  name: text("name"),
  sectorId: integer("sector_id"), // references sectors(id) - would need sectors table
  quantity: numeric("quantity"),
  costBasisGbp: numeric("cost_basis_gbp"),
  currentPriceGbp: numeric("current_price_gbp"),
  currentValueGbp: numeric("current_value_gbp"),
  lastPricedAt: timestamp("last_priced_at"),
  estimatedFx: boolean("estimated_fx").default(false),
});

// Property Portfolio Tables

export const properties = pgTable("properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  uprn: text("uprn"), // UK Unique Property Reference Number
  titleNumber: text("title_number"), // HM Land Registry title no.
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city"),
  postcode: text("postcode"),
  country: text("country").notNull().default("UK"),
  latitude: numeric("latitude"),
  longitude: numeric("longitude"),
  propertyType: text("property_type"), // 'residential','btL','commercial','industrial','land','mixed'
  bedrooms: text("bedrooms"),
  floorAreaSqm: numeric("floor_area_sqm"),
  yearBuilt: text("year_built"),
  epcRating: text("epc_rating"), // 'A'..'G' if known
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Alternative Investments Table
// Property Price Data Table (HM Land Registry)
export const propertyPriceData = pgTable("property_price_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transactionId: text("transaction_id").notNull(), // HM Land Registry transaction unique identifier
  price: numeric("price").notNull(),
  dateOfTransfer: text("date_of_transfer").notNull(), // YYYY-MM-DD format
  postcode: text("postcode").notNull(),
  propertyType: text("property_type"), // D=Detached, S=Semi-detached, T=Terraced, F=Flat
  oldNew: text("old_new"), // N=New build, Y=Old
  duration: text("duration"), // F=Freehold, L=Leasehold
  primaryAddressableName: text("primary_addressable_name"),
  secondaryAddressableName: text("secondary_addressable_name"),
  street: text("street"),
  locality: text("locality"),
  townCity: text("town_city"),
  district: text("district"),
  county: text("county"),
  ppdCategoryType: text("ppd_category_type"), // A=Standard Price Paid, B=Additional Price Paid
  recordStatus: text("record_status"), // A=Addition, C=Change, D=Delete
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const alternativeInvestments = pgTable("alternative_investments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => investors.userId, { onDelete: "cascade" }),
  investmentType: text("investment_type"), // 'private_equity','venture_capital','hedge_fund','real_estate_fund','commodities','collectibles','cryptocurrency','art','wine','other'
  name: text("name").notNull(),
  description: text("description"),
  investmentDateUk: text("investment_date_uk"), // DD/MM/YYYY format
  maturityDateUk: text("maturity_date_uk"), // DD/MM/YYYY format  
  investmentAmountGbp: numeric("investment_amount_gbp"),
  currentValueGbp: numeric("current_value_gbp"),
  targetReturnPct: numeric("target_return_pct"),
  actualReturnPct: numeric("actual_return_pct"),
  riskRating: text("risk_rating"), // 'low','medium','high','very_high'
  liquidityPeriod: text("liquidity_period"), // 'immediate','1_month','3_months','6_months','1_year','2_years','5_years','illiquid'
  minimumInvestment: numeric("minimum_investment"),
  fees: text("fees"), // Description of fee structure
  taxWrapperEligible: boolean("tax_wrapper_eligible").default(false), // EIS/SEIS eligible
  taxWrapperType: text("tax_wrapper_type"), // 'EIS','SEIS','VCT','none'
  documentsUrl: text("documents_url"), // Link to investment documents
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const propertyOwnerships = pgTable("property_ownerships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id"),
  userId: varchar("user_id"),
  ownershipType: text("ownership_type").notNull(), // 'direct','spv'
  sharePct: numeric("share_pct").notNull(),
  acquisitionDate: text("acquisition_date"), // Using text for date input
  acquisitionPriceGbp: numeric("acquisition_price_gbp"),
  acquisitionCostsGbp: numeric("acquisition_costs_gbp"),
  isPrimaryResidence: boolean("is_primary_residence").default(false),
});

export const propertyLoans = pgTable("property_loans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id"),
  lenderName: text("lender_name"),
  provider: text("provider"), // 'OpenBanking','Manual','Moneyhub'...
  providerAccountId: text("provider_account_id"),
  originalAmountGbp: numeric("original_amount_gbp"),
  currentBalanceGbp: numeric("current_balance_gbp"),
  interestRatePct: numeric("interest_rate_pct"),
  rateType: text("rate_type"), // 'fixed','tracker','variable'
  fixEndDate: text("fix_end_date"),
  maturityDate: text("maturity_date"),
  paymentAmountGbp: numeric("payment_amount_gbp"),
  paymentFrequency: text("payment_frequency"), // 'monthly','quarterly'
  ltvAtOriginationPct: numeric("ltv_at_origination_pct"),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const propertyValuations = pgTable("property_valuations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id"),
  valuationDate: text("valuation_date").notNull(),
  method: text("method"), // 'purchase','appraisal','avm','manual','hpi_plus_comps','market_comp','ai_valuation'
  valueGbp: numeric("value_gbp").notNull(),
  source: text("source"), // 'Hometrack','Zoopla','Surveyor Smith','LandRegistry','UK_HPI','Market_Comparables','AI_Engine'
  confidence: numeric("confidence"), // 0..1
  // Enhanced fields for market comparables and AI valuations
  valuationRangeMinGbp: numeric("valuation_range_min_gbp"), // Lower bound of valuation range
  valuationRangeMaxGbp: numeric("valuation_range_max_gbp"), // Upper bound of valuation range
  comparableCount: integer("comparable_count"), // Number of comparable properties used
  hpiBaseValueGbp: numeric("hpi_base_value_gbp"), // HPI baseline value
  comparableAvgValueGbp: numeric("comparable_avg_value_gbp"), // Average of comparable sales
  methodDetails: text("method_details"), // JSON string with calculation breakdown
  regionCode: text("region_code"), // LAD code or area code used
  regionName: text("region_name"), // Human-readable region name
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const propertyLeases = pgTable("property_leases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id"),
  tenantLabel: text("tenant_label"), // avoid PII
  startDate: text("start_date"),
  endDate: text("end_date"),
  breakDate: text("break_date"),
  rentGbp: numeric("rent_gbp"),
  rentFrequency: text("rent_frequency").default("monthly"), // 'monthly','quarterly','annual'
  indexation: text("indexation"), // 'RPI','CPI','fixed','none'
  depositGbp: numeric("deposit_gbp"),
  status: text("status").default("active"), // 'active','notice','void','ended'
});

export const propertyCashflows = pgTable("property_cashflows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id"),
  userId: varchar("user_id"),
  flowDate: text("flow_date").notNull(),
  kind: text("kind"), // 'rent','mortgage','service_charge','insurance','maintenance','tax','other'
  amountGbp: numeric("amount_gbp").notNull(), // positive = inflow, negative = outflow
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertInvestorSchema = createInsertSchema(investors).omit({
  createdAt: true,
});

export const insertInvestorPreferencesSchema = createInsertSchema(investorPreferences).omit({
  updatedAt: true,
  wizardCompletedAt: true,
});

export const insertTaxProfileSchema = createInsertSchema(taxProfile);

export const insertPortfolioAccountSchema = createInsertSchema(portfolioAccounts).omit({
  id: true,
  connectedAt: true,
});

export const insertPortfolioHoldingSchema = createInsertSchema(portfolioHoldings).omit({
  id: true,
  lastPricedAt: true,
});

export const insertAlternativeInvestmentSchema = createInsertSchema(alternativeInvestments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Property schemas
export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPropertyOwnershipSchema = createInsertSchema(propertyOwnerships).omit({
  id: true,
});

export const insertPropertyLoanSchema = createInsertSchema(propertyLoans).omit({
  id: true,
  updatedAt: true,
});

export const insertPropertyValuationSchema = createInsertSchema(propertyValuations).omit({
  id: true,
  createdAt: true,
});

export const insertPropertyLeaseSchema = createInsertSchema(propertyLeases).omit({
  id: true,
});

export const insertPropertyCashflowSchema = createInsertSchema(propertyCashflows).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Investor = typeof investors.$inferSelect;
export type InsertInvestor = z.infer<typeof insertInvestorSchema>;
export type InvestorPreferences = typeof investorPreferences.$inferSelect;
export type InsertInvestorPreferences = z.infer<typeof insertInvestorPreferencesSchema>;
export type TaxProfile = typeof taxProfile.$inferSelect;
export type InsertTaxProfile = z.infer<typeof insertTaxProfileSchema>;
export type PortfolioAccount = typeof portfolioAccounts.$inferSelect;
export type InsertPortfolioAccount = z.infer<typeof insertPortfolioAccountSchema>;
export type PortfolioHolding = typeof portfolioHoldings.$inferSelect;
export type InsertPortfolioHolding = z.infer<typeof insertPortfolioHoldingSchema>;
export type AlternativeInvestment = typeof alternativeInvestments.$inferSelect;
export type InsertAlternativeInvestment = z.infer<typeof insertAlternativeInvestmentSchema>;

// Property types
export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type PropertyOwnership = typeof propertyOwnerships.$inferSelect;
export type InsertPropertyOwnership = z.infer<typeof insertPropertyOwnershipSchema>;
export type PropertyLoan = typeof propertyLoans.$inferSelect;
export type InsertPropertyLoan = z.infer<typeof insertPropertyLoanSchema>;
export type PropertyValuation = typeof propertyValuations.$inferSelect;
export type InsertPropertyValuation = z.infer<typeof insertPropertyValuationSchema>;
export type PropertyLease = typeof propertyLeases.$inferSelect;
export type InsertPropertyLease = z.infer<typeof insertPropertyLeaseSchema>;
export type PropertyCashflow = typeof propertyCashflows.$inferSelect;
export type InsertPropertyCashflow = z.infer<typeof insertPropertyCashflowSchema>;

// Postcode to LAD Code mapping table
export const postcodeLadMapping = pgTable("postcode_lad_mapping", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postcode: text("postcode").notNull(),
  ladCode: text("lad_code").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// UK House Price Index data for property valuations
export const ukHpi = pgTable("uk_hpi", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull(), // Format: DD/MM/YYYY
  regionName: text("region_name").notNull(),
  areaCode: text("area_code").notNull(),
  averagePrice: numeric("average_price"),
  index: numeric("index"),
  indexSa: numeric("index_sa"), // Seasonally adjusted
  monthlyChangePercent: numeric("monthly_change_percent"), // 1m%Change
  yearlyChangePercent: numeric("yearly_change_percent"), // 12m%Change
  averagePriceSa: numeric("average_price_sa"),
  salesVolume: integer("sales_volume"),
  detachedPrice: numeric("detached_price"),
  detachedIndex: numeric("detached_index"),
  detachedMonthlyChange: numeric("detached_monthly_change"),
  detachedYearlyChange: numeric("detached_yearly_change"),
  semiDetachedPrice: numeric("semi_detached_price"),
  semiDetachedIndex: numeric("semi_detached_index"),
  semiDetachedMonthlyChange: numeric("semi_detached_monthly_change"),
  semiDetachedYearlyChange: numeric("semi_detached_yearly_change"),
  terracedPrice: numeric("terraced_price"),
  terracedIndex: numeric("terraced_index"),
  terracedMonthlyChange: numeric("terraced_monthly_change"),
  terracedYearlyChange: numeric("terraced_yearly_change"),
  flatPrice: numeric("flat_price"),
  flatIndex: numeric("flat_index"),
  flatMonthlyChange: numeric("flat_monthly_change"),
  flatYearlyChange: numeric("flat_yearly_change"),
  cashPrice: numeric("cash_price"),
  cashIndex: numeric("cash_index"),
  cashMonthlyChange: numeric("cash_monthly_change"),
  cashYearlyChange: numeric("cash_yearly_change"),
  cashSalesVolume: integer("cash_sales_volume"),
  mortgagePrice: numeric("mortgage_price"),
  mortgageIndex: numeric("mortgage_index"),
  mortgageMonthlyChange: numeric("mortgage_monthly_change"),
  mortgageYearlyChange: numeric("mortgage_yearly_change"),
  mortgageSalesVolume: integer("mortgage_sales_volume"),
  ftbPrice: numeric("ftb_price"), // First Time Buyer
  ftbIndex: numeric("ftb_index"),
  ftbMonthlyChange: numeric("ftb_monthly_change"),
  ftbYearlyChange: numeric("ftb_yearly_change"),
  fooPrice: numeric("foo_price"), // Former Owner Occupier
  fooIndex: numeric("foo_index"),
  fooMonthlyChange: numeric("foo_monthly_change"),
  fooYearlyChange: numeric("foo_yearly_change"),
  newPrice: numeric("new_price"),
  newIndex: numeric("new_index"),
  newMonthlyChange: numeric("new_monthly_change"),
  newYearlyChange: numeric("new_yearly_change"),
  newSalesVolume: integer("new_sales_volume"),
  oldPrice: numeric("old_price"),
  oldIndex: numeric("old_index"),
  oldMonthlyChange: numeric("old_monthly_change"),
  oldYearlyChange: numeric("old_yearly_change"),
  oldSalesVolume: integer("old_sales_volume"),
});

export const insertPostcodeLadMappingSchema = createInsertSchema(postcodeLadMapping).omit({
  id: true,
  createdAt: true,
});

export const insertUkHpiSchema = createInsertSchema(ukHpi).omit({
  id: true,
});

export type PostcodeLadMapping = typeof postcodeLadMapping.$inferSelect;
export type InsertPostcodeLadMapping = z.infer<typeof insertPostcodeLadMappingSchema>;
export type UkHpi = typeof ukHpi.$inferSelect;
export type InsertUkHpi = z.infer<typeof insertUkHpiSchema>;
