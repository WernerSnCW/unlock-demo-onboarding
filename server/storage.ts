import { 
  type User, type InsertUser,
  type Investor, type InsertInvestor,
  type InvestorPreferences, type InsertInvestorPreferences,
  type TaxProfile, type InsertTaxProfile,
  type Property, type InsertProperty,
  type PropertyOwnership, type InsertPropertyOwnership,
  type PropertyLoan, type InsertPropertyLoan,
  type PropertyValuation, type InsertPropertyValuation,
  type PropertyLease, type InsertPropertyLease,
  type PropertyCashflow, type InsertPropertyCashflow,
  users, investors, investorPreferences, taxProfile,
  properties, propertyOwnerships, propertyLoans, 
  propertyValuations, propertyLeases, propertyCashflows
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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
  
  // Property methods
  getAllProperties(userId: string): Promise<Property[]>;
  getProperty(propertyId: string): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(propertyId: string, property: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(propertyId: string): Promise<boolean>;
  
  // Property Ownership methods  
  getPropertyOwnerships(propertyId: string): Promise<PropertyOwnership[]>;
  createPropertyOwnership(ownership: InsertPropertyOwnership): Promise<PropertyOwnership>;
  
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
          riskBand: prefs.riskBand,
          ticketMinGbp: prefs.ticketMinGbp,
          ticketMaxGbp: prefs.ticketMaxGbp,
          regions: prefs.regions,
          focusSectors: prefs.focusSectors
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
          interests: profile.interests
        }
      })
      .returning();
    return upserted;
  }
  
  // Property methods
  async getAllProperties(userId: string): Promise<Property[]> {
    const results = await db.select({ property: properties }).from(properties)
      .leftJoin(propertyOwnerships, eq(properties.id, propertyOwnerships.propertyId))
      .where(eq(propertyOwnerships.userId, userId));
    return results.map(result => result.property);
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
    return await db.select().from(propertyValuations).where(eq(propertyValuations.propertyId, propertyId));
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
