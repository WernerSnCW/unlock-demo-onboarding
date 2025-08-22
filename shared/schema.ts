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
  userId: varchar("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  investorType: text("investor_type"), // 'Angel','Fund','Family Office',...
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const investorPreferences = pgTable("investor_preferences", {
  userId: varchar("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  riskBand: text("risk_band"), // 'Low','Moderate','High'
  ticketMinGbp: numeric("ticket_min_gbp"),
  ticketMaxGbp: numeric("ticket_max_gbp"),
  regions: text("regions").array(),
  focusSectors: integer("focus_sectors").array(), // FK -> sectors(id)
});

export const taxProfile = pgTable("tax_profile", {
  userId: varchar("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
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
