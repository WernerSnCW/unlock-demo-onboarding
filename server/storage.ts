import { 
  type User, type InsertUser,
  type Investor, type InsertInvestor,
  type InvestorPreferences, type InsertInvestorPreferences,
  type TaxProfile, type InsertTaxProfile,
  type PortfolioAccount, type InsertPortfolioAccount,
  type PortfolioHolding, type InsertPortfolioHolding,
  type AlternativeInvestment, type InsertAlternativeInvestment,
  type Property, type InsertProperty,
  type PropertyOwnership, type InsertPropertyOwnership,
  type PropertyLoan, type InsertPropertyLoan,
  type PropertyValuation, type InsertPropertyValuation,
  type PropertyLease, type InsertPropertyLease,
  type PropertyCashflow, type InsertPropertyCashflow,
  users, investors, investorPreferences, taxProfile,
  portfolioAccounts, portfolioHoldings, alternativeInvestments,
  properties, propertyOwnerships, propertyLoans, 
  propertyValuations, propertyLeases, propertyCashflows,
  propertyPriceData
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Investor methods
  getAllInvestors(): Promise<Investor[]>;
  getInvestor(userId: string): Promise<Investor | undefined>;
  createInvestor(investor: InsertInvestor): Promise<Investor>;
  updateInvestor(userId: string, investor: Partial<InsertInvestor>): Promise<Investor | undefined>;
  deleteInvestor(userId: string): Promise<boolean>;
  
  // Investor Preferences methods
  getInvestorPreferences(userId: string): Promise<InvestorPreferences | undefined>;
  upsertInvestorPreferences(prefs: InsertInvestorPreferences): Promise<InvestorPreferences>;
  
  // Tax Profile methods
  getTaxProfile(userId: string): Promise<TaxProfile | undefined>;
  upsertTaxProfile(profile: InsertTaxProfile): Promise<TaxProfile>;
  
  // Portfolio Account methods
  getAllPortfolioAccounts(userId: string): Promise<PortfolioAccount[]>;
  getPortfolioAccount(accountId: string): Promise<PortfolioAccount | undefined>;
  createPortfolioAccount(account: InsertPortfolioAccount): Promise<PortfolioAccount>;
  updatePortfolioAccount(accountId: string, account: Partial<InsertPortfolioAccount>): Promise<PortfolioAccount | undefined>;
  deletePortfolioAccount(accountId: string): Promise<boolean>;
  
  // Portfolio Holdings methods
  getAllPortfolioHoldings(userId: string): Promise<PortfolioHolding[]>;
  getPortfolioHolding(holdingId: string): Promise<PortfolioHolding | undefined>;
  createPortfolioHolding(holding: InsertPortfolioHolding): Promise<PortfolioHolding>;
  updatePortfolioHolding(holdingId: string, holding: Partial<InsertPortfolioHolding>): Promise<PortfolioHolding | undefined>;
  deletePortfolioHolding(holdingId: string): Promise<boolean>;
  
  // Alternative Investment methods
  getAllAlternativeInvestments(userId: string): Promise<AlternativeInvestment[]>;
  getAlternativeInvestment(investmentId: string): Promise<AlternativeInvestment | undefined>;
  createAlternativeInvestment(investment: InsertAlternativeInvestment): Promise<AlternativeInvestment>;
  updateAlternativeInvestment(investmentId: string, investment: Partial<InsertAlternativeInvestment>): Promise<AlternativeInvestment | undefined>;
  deleteAlternativeInvestment(investmentId: string): Promise<boolean>;

  // Property methods
  getAllProperties(userId: string): Promise<Property[]>;
  getProperty(propertyId: string): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(propertyId: string, property: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(propertyId: string): Promise<boolean>;
  getLatestPurchasePrice(postcode: string, primaryAddressableName?: string, street?: string): Promise<{price: number, dateOfTransfer: string} | undefined>;
  
  // Property Ownership methods  
  getPropertyOwnerships(propertyId: string): Promise<PropertyOwnership[]>;
  createPropertyOwnership(ownership: InsertPropertyOwnership): Promise<PropertyOwnership>;
  updatePropertyOwnershipPrice(propertyId: string, priceData: { acquisitionPriceGbp?: string; acquisitionDate?: string }): Promise<boolean>;
  
  // Property Loan methods
  getPropertyLoans(propertyId: string): Promise<PropertyLoan[]>;
  createPropertyLoan(loan: InsertPropertyLoan): Promise<PropertyLoan>;
  
  // Property Valuation methods
  getPropertyValuations(propertyId: string): Promise<PropertyValuation[]>;
  createPropertyValuation(valuation: InsertPropertyValuation): Promise<PropertyValuation>;
  
  // Property Lease methods
  getPropertyLeases(propertyId: string): Promise<PropertyLease[]>;
  createPropertyLease(lease: InsertPropertyLease): Promise<PropertyLease>;
  
  // Property Cashflow methods
  getPropertyCashflows(propertyId: string): Promise<PropertyCashflow[]>;
  createPropertyCashflow(cashflow: InsertPropertyCashflow): Promise<PropertyCashflow>;
}


export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Investor methods
  async getAllInvestors(): Promise<Investor[]> {
    return await db.select().from(investors);
  }

  async getInvestor(userId: string): Promise<Investor | undefined> {
    const [investor] = await db.select().from(investors).where(eq(investors.userId, userId));
    return investor || undefined;
  }

  async createInvestor(investor: InsertInvestor): Promise<Investor> {
    const [newInvestor] = await db
      .insert(investors)
      .values({
        userId: investor.userId,
        name: investor.name,
        investorType: investor.investorType
      })
      .returning();
    return newInvestor;
  }

  async updateInvestor(userId: string, investor: Partial<InsertInvestor>): Promise<Investor | undefined> {
    const [updated] = await db
      .update(investors)
      .set(investor)
      .where(eq(investors.userId, userId))
      .returning();
    return updated || undefined;
  }

  async deleteInvestor(userId: string): Promise<boolean> {
    const result = await db.delete(investors).where(eq(investors.userId, userId));
    // Related data will be deleted automatically due to CASCADE
    return (result.rowCount ?? 0) > 0;
  }

  // Investor Preferences methods
  async getInvestorPreferences(userId: string): Promise<InvestorPreferences | undefined> {
    const [prefs] = await db.select().from(investorPreferences).where(eq(investorPreferences.userId, userId));
    return prefs || undefined;
  }

  async upsertInvestorPreferences(prefs: InsertInvestorPreferences): Promise<InvestorPreferences> {
    const [upserted] = await db
      .insert(investorPreferences)
      .values(prefs)
      .onConflictDoUpdate({
        target: investorPreferences.userId,
        set: {
          // Only set fields that are actually provided
          ...(prefs.riskBand !== undefined && { riskBand: prefs.riskBand }),
          ...(prefs.ticketMinGbp !== undefined && { ticketMinGbp: prefs.ticketMinGbp }),
          ...(prefs.ticketMaxGbp !== undefined && { ticketMaxGbp: prefs.ticketMaxGbp }),
          ...(prefs.regions !== undefined && { regions: prefs.regions }),
          ...(prefs.focusSectors !== undefined && { focusSectors: prefs.focusSectors }),
          ...(prefs.existingInvestments !== undefined && { existingInvestments: prefs.existingInvestments }),
          ...(prefs.investmentInterests !== undefined && { investmentInterests: prefs.investmentInterests }),
          // Wizard fields
          ...(prefs.investorName !== undefined && { investorName: prefs.investorName }),
          ...(prefs.activeInvestmentInterests !== undefined && { activeInvestmentInterests: prefs.activeInvestmentInterests }),
          ...(prefs.learningCuriosityAreas !== undefined && { learningCuriosityAreas: prefs.learningCuriosityAreas }),
          ...(prefs.geographicPreferences !== undefined && { geographicPreferences: prefs.geographicPreferences }),
          ...(prefs.wizardCompletedAt !== undefined && { wizardCompletedAt: prefs.wizardCompletedAt }),
          ...(prefs.completionMethod !== undefined && { completionMethod: prefs.completionMethod }),
          // Quiz fields
          ...(prefs.quizAnswers !== undefined && { quizAnswers: prefs.quizAnswers }),
          ...(prefs.matchedPersonaCode !== undefined && { matchedPersonaCode: prefs.matchedPersonaCode }),
          ...(prefs.personaMatchScore !== undefined && { personaMatchScore: prefs.personaMatchScore }),
          ...(prefs.quizCompletedAt !== undefined && { quizCompletedAt: prefs.quizCompletedAt }),
          // Belief fields
          ...(prefs.beliefResponses !== undefined && { beliefResponses: prefs.beliefResponses }),
          ...(prefs.selectedScenarios !== undefined && { selectedScenarios: prefs.selectedScenarios }),
          ...(prefs.scenarioWeights !== undefined && { scenarioWeights: prefs.scenarioWeights }),
          ...(prefs.beliefsCompletedAt !== undefined && { beliefsCompletedAt: prefs.beliefsCompletedAt }),
        }
      })
      .returning();
    return upserted;
  }

  // Tax Profile methods
  async getTaxProfile(userId: string): Promise<TaxProfile | undefined> {
    const [profile] = await db.select().from(taxProfile).where(eq(taxProfile.userId, userId));
    return profile || undefined;
  }

  async upsertTaxProfile(profile: InsertTaxProfile): Promise<TaxProfile> {
    const [upserted] = await db
      .insert(taxProfile)
      .values(profile)
      .onConflictDoUpdate({
        target: taxProfile.userId,
        set: {
          country: profile.country,
          interests: profile.interests,
          annualEarningsGbp: profile.annualEarningsGbp,
          cgtAllowanceGbp: profile.cgtAllowanceGbp
        }
      })
      .returning();
    return upserted;
  }

  // Portfolio Account methods
  async getAllPortfolioAccounts(userId: string): Promise<PortfolioAccount[]> {
    const accounts = await db.select().from(portfolioAccounts).where(eq(portfolioAccounts.userId, userId));
    return accounts;
  }

  async getPortfolioAccount(accountId: string): Promise<PortfolioAccount | undefined> {
    const [account] = await db.select().from(portfolioAccounts).where(eq(portfolioAccounts.id, accountId));
    return account || undefined;
  }

  async createPortfolioAccount(account: InsertPortfolioAccount): Promise<PortfolioAccount> {
    const [newAccount] = await db
      .insert(portfolioAccounts)
      .values(account)
      .returning();
    return newAccount;
  }

  async updatePortfolioAccount(accountId: string, account: Partial<InsertPortfolioAccount>): Promise<PortfolioAccount | undefined> {
    const [updated] = await db
      .update(portfolioAccounts)
      .set(account)
      .where(eq(portfolioAccounts.id, accountId))
      .returning();
    return updated || undefined;
  }

  async deletePortfolioAccount(accountId: string): Promise<boolean> {
    const result = await db.delete(portfolioAccounts).where(eq(portfolioAccounts.id, accountId));
    return (result.rowCount ?? 0) > 0;
  }

  // Portfolio Holdings methods
  async getAllPortfolioHoldings(userId: string): Promise<PortfolioHolding[]> {
    const holdings = await db.select().from(portfolioHoldings).where(eq(portfolioHoldings.userId, userId));
    return holdings;
  }

  async getPortfolioHolding(holdingId: string): Promise<PortfolioHolding | undefined> {
    const [holding] = await db.select().from(portfolioHoldings).where(eq(portfolioHoldings.id, holdingId));
    return holding || undefined;
  }

  async createPortfolioHolding(holding: InsertPortfolioHolding): Promise<PortfolioHolding> {
    const [newHolding] = await db
      .insert(portfolioHoldings)
      .values(holding)
      .returning();
    return newHolding;
  }

  async updatePortfolioHolding(holdingId: string, holding: Partial<InsertPortfolioHolding>): Promise<PortfolioHolding | undefined> {
    const [updated] = await db
      .update(portfolioHoldings)
      .set(holding)
      .where(eq(portfolioHoldings.id, holdingId))
      .returning();
    return updated || undefined;
  }

  async deletePortfolioHolding(holdingId: string): Promise<boolean> {
    const result = await db.delete(portfolioHoldings).where(eq(portfolioHoldings.id, holdingId));
    return (result.rowCount ?? 0) > 0;
  }

  // Alternative Investment methods
  async getAllAlternativeInvestments(userId: string): Promise<AlternativeInvestment[]> {
    const investments = await db.select().from(alternativeInvestments).where(eq(alternativeInvestments.userId, userId));
    return investments;
  }

  async getAlternativeInvestment(investmentId: string): Promise<AlternativeInvestment | undefined> {
    const [investment] = await db.select().from(alternativeInvestments).where(eq(alternativeInvestments.id, investmentId));
    return investment || undefined;
  }

  async createAlternativeInvestment(investment: InsertAlternativeInvestment): Promise<AlternativeInvestment> {
    const [newInvestment] = await db
      .insert(alternativeInvestments)
      .values(investment)
      .returning();
    return newInvestment;
  }

  async updateAlternativeInvestment(investmentId: string, investment: Partial<InsertAlternativeInvestment>): Promise<AlternativeInvestment | undefined> {
    const [updated] = await db
      .update(alternativeInvestments)
      .set(investment)
      .where(eq(alternativeInvestments.id, investmentId))
      .returning();
    return updated || undefined;
  }

  async deleteAlternativeInvestment(investmentId: string): Promise<boolean> {
    const result = await db.delete(alternativeInvestments).where(eq(alternativeInvestments.id, investmentId));
    return (result.rowCount ?? 0) > 0;
  }
  
  // Property methods
  async getAllProperties(userId: string): Promise<Property[]> {
    const results = await db.select({ 
      property: properties, 
      ownership: propertyOwnerships 
    }).from(properties)
      .leftJoin(propertyOwnerships, eq(properties.id, propertyOwnerships.propertyId))
      .where(eq(propertyOwnerships.userId, userId));
    
    return results.map(result => ({
      ...result.property,
      acquisitionPriceGbp: result.ownership?.acquisitionPriceGbp,
      acquisitionDate: result.ownership?.acquisitionDate,
    }));
  }

  async getProperty(propertyId: string): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, propertyId));
    return property || undefined;
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const [newProperty] = await db
      .insert(properties)
      .values(property)
      .returning();
    return newProperty;
  }

  async updateProperty(propertyId: string, property: Partial<InsertProperty>): Promise<Property | undefined> {
    const [updated] = await db
      .update(properties)
      .set(property)
      .where(eq(properties.id, propertyId))
      .returning();
    return updated || undefined;
  }

  async deleteProperty(propertyId: string): Promise<boolean> {
    const result = await db.delete(properties).where(eq(properties.id, propertyId));
    return (result.rowCount ?? 0) > 0;
  }

  async getLatestPurchasePrice(postcode: string, primaryAddressableName?: string, street?: string): Promise<{price: number, dateOfTransfer: string} | undefined> {
    try {
      // Build query conditions
      const conditions = [eq(propertyPriceData.postcode, postcode)];
      
      if (primaryAddressableName) {
        conditions.push(eq(propertyPriceData.primaryAddressableName, primaryAddressableName));
      }
      
      if (street) {
        conditions.push(eq(propertyPriceData.street, street));
      }

      // Get the latest transaction for this property
      const [latestTransaction] = await db
        .select({
          price: propertyPriceData.price,
          dateOfTransfer: propertyPriceData.dateOfTransfer
        })
        .from(propertyPriceData)
        .where(conditions.length > 1 ? and(...conditions) : conditions[0])
        .orderBy(desc(propertyPriceData.dateOfTransfer))
        .limit(1);

      if (latestTransaction) {
        return {
          price: Number(latestTransaction.price),
          dateOfTransfer: latestTransaction.dateOfTransfer
        };
      }

      return undefined;
    } catch (error) {
      console.error('Error fetching latest purchase price:', error);
      return undefined;
    }
  }

  // Property Ownership methods
  async getPropertyOwnerships(propertyId: string): Promise<PropertyOwnership[]> {
    return await db.select().from(propertyOwnerships).where(eq(propertyOwnerships.propertyId, propertyId));
  }

  async createPropertyOwnership(ownership: InsertPropertyOwnership): Promise<PropertyOwnership> {
    const [newOwnership] = await db
      .insert(propertyOwnerships)
      .values(ownership)
      .returning();
    return newOwnership;
  }

  async updatePropertyOwnershipPrice(propertyId: string, priceData: { acquisitionPriceGbp?: string; acquisitionDate?: string }): Promise<boolean> {
    try {
      const result = await db
        .update(propertyOwnerships)
        .set({
          acquisitionPriceGbp: priceData.acquisitionPriceGbp,
          acquisitionDate: priceData.acquisitionDate,
          updatedAt: new Date().toISOString()
        })
        .where(eq(propertyOwnerships.propertyId, propertyId));
      
      console.log('Update result:', result);
      return Array.isArray(result) ? result.length > 0 : result.rowCount > 0;
    } catch (error) {
      console.error('Error updating property ownership price:', error);
      return false;
    }
  }

  // Property Loan methods
  async getPropertyLoans(propertyId: string): Promise<PropertyLoan[]> {
    return await db.select().from(propertyLoans).where(eq(propertyLoans.propertyId, propertyId));
  }

  async createPropertyLoan(loan: InsertPropertyLoan): Promise<PropertyLoan> {
    const [newLoan] = await db
      .insert(propertyLoans)
      .values(loan)
      .returning();
    return newLoan;
  }

  // Property Valuation methods
  async getPropertyValuations(propertyId: string): Promise<PropertyValuation[]> {
    return await db.select().from(propertyValuations).where(eq(propertyValuations.propertyId, propertyId)).orderBy(desc(propertyValuations.createdAt));
  }

  async getLatestPropertyValuation(propertyId: string): Promise<PropertyValuation | undefined> {
    const [valuation] = await db.select().from(propertyValuations)
      .where(eq(propertyValuations.propertyId, propertyId))
      .orderBy(desc(propertyValuations.createdAt))
      .limit(1);
    return valuation || undefined;
  }

  async createPropertyValuation(valuation: InsertPropertyValuation): Promise<PropertyValuation> {
    const [newValuation] = await db
      .insert(propertyValuations)
      .values(valuation)
      .returning();
    return newValuation;
  }

  // Property Lease methods
  async getPropertyLeases(propertyId: string): Promise<PropertyLease[]> {
    return await db.select().from(propertyLeases).where(eq(propertyLeases.propertyId, propertyId));
  }

  async createPropertyLease(lease: InsertPropertyLease): Promise<PropertyLease> {
    const [newLease] = await db
      .insert(propertyLeases)
      .values(lease)
      .returning();
    return newLease;
  }

  // Property Cashflow methods
  async getPropertyCashflows(propertyId: string): Promise<PropertyCashflow[]> {
    return await db.select().from(propertyCashflows).where(eq(propertyCashflows.propertyId, propertyId));
  }

  async createPropertyCashflow(cashflow: InsertPropertyCashflow): Promise<PropertyCashflow> {
    const [newCashflow] = await db
      .insert(propertyCashflows)
      .values(cashflow)
      .returning();
    return newCashflow;
  }
}

export const storage = new DatabaseStorage();
