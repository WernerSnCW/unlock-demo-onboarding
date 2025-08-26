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
});

export const taxProfile = pgTable("tax_profile", {
  userId: varchar("user_id").primaryKey(),
  country: text("country"),
  interests: text("interests").array(), // e.g., ['EIS','SEIS']
});

export const portfolioAccounts = pgTable("portfolio_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider"), // 'Moneyhub','Plaid','Manual','Coinbase','IBKR'...
  providerAccountId: text("provider_account_id"),
  accountType: text("account_type"), // 'brokerage','cash','private'
  currency: text("currency").default("GBP"),
  connected: boolean("connected").default(false),
  connectedAt: timestamp("connected_at"),
});

export const portfolioHoldings = pgTable("portfolio_holdings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
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
  bedrooms: integer("bedrooms"),
  floorAreaSqm: numeric("floor_area_sqm"),
  yearBuilt: integer("year_built"),
  epcRating: text("epc_rating"), // 'A'..'G' if known
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
  method: text("method"), // 'purchase','appraisal','avm','manual'
  valueGbp: numeric("value_gbp").notNull(),
  source: text("source"), // 'Hometrack','Zoopla','Surveyor Smith','LandRegistry'
  confidence: numeric("confidence"), // 0..1
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

export const insertInvestorPreferencesSchema = createInsertSchema(investorPreferences);

export const insertTaxProfileSchema = createInsertSchema(taxProfile);

export const insertPortfolioAccountSchema = createInsertSchema(portfolioAccounts).omit({
  id: true,
  connectedAt: true,
});

export const insertPortfolioHoldingSchema = createInsertSchema(portfolioHoldings).omit({
  id: true,
  lastPricedAt: true,
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
