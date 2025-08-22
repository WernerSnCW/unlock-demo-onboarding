import { 
  type User, type InsertUser,
  type Investor, type InsertInvestor,
  type InvestorPreferences, type InsertInvestorPreferences,
  type TaxProfile, type InsertTaxProfile,
  users, investors, investorPreferences, taxProfile
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
}

export const storage = new DatabaseStorage();
