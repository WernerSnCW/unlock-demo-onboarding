import { 
  type User, type InsertUser,
  type Investor, type InsertInvestor,
  type InvestorPreferences, type InsertInvestorPreferences,
  type TaxProfile, type InsertTaxProfile
} from "@shared/schema";
import { randomUUID } from "crypto";

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

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private investors: Map<string, Investor>;
  private investorPreferences: Map<string, InvestorPreferences>;
  private taxProfiles: Map<string, TaxProfile>;

  constructor() {
    this.users = new Map();
    this.investors = new Map();
    this.investorPreferences = new Map();
    this.taxProfiles = new Map();
    
    // Add some demo data
    this.initializeDemoData();
  }

  private initializeDemoData() {
    const demoInvestors: Investor[] = [
      {
        userId: 'demo-1',
        investorType: 'Fund',
        createdAt: new Date()
      },
      {
        userId: 'demo-2',
        investorType: 'Angel',
        createdAt: new Date()
      },
      {
        userId: 'demo-3',
        investorType: 'Family Office',
        createdAt: new Date()
      }
    ];

    const demoPreferences: InvestorPreferences[] = [
      {
        userId: 'demo-1',
        riskBand: 'Low',
        ticketMinGbp: '50000',
        ticketMaxGbp: '1000000',
        regions: ['UK', 'Europe'],
        focusSectors: [1, 2]
      },
      {
        userId: 'demo-2',
        riskBand: 'High',
        ticketMinGbp: '10000',
        ticketMaxGbp: '100000',
        regions: ['UK', 'Global'],
        focusSectors: [3, 4, 5]
      },
      {
        userId: 'demo-3',
        riskBand: 'Moderate',
        ticketMinGbp: '100000',
        ticketMaxGbp: '5000000',
        regions: ['Europe', 'North America'],
        focusSectors: [1, 3]
      }
    ];

    const demoTaxProfiles: TaxProfile[] = [
      {
        userId: 'demo-1',
        country: 'UK',
        interests: ['EIS', 'VCT']
      },
      {
        userId: 'demo-2',
        country: 'UK',
        interests: ['EIS', 'SEIS']
      },
      {
        userId: 'demo-3',
        country: 'UK',
        interests: ['CGT Relief', 'Pension Scheme']
      }
    ];

    demoInvestors.forEach(inv => this.investors.set(inv.userId, inv));
    demoPreferences.forEach(pref => this.investorPreferences.set(pref.userId, pref));
    demoTaxProfiles.forEach(profile => this.taxProfiles.set(profile.userId, profile));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Investor methods
  async getAllInvestors(): Promise<Investor[]> {
    return Array.from(this.investors.values());
  }

  async getInvestor(userId: string): Promise<Investor | undefined> {
    return this.investors.get(userId);
  }

  async createInvestor(investor: InsertInvestor): Promise<Investor> {
    const newInvestor: Investor = {
      userId: investor.userId,
      investorType: investor.investorType ?? null,
      createdAt: new Date()
    };
    this.investors.set(investor.userId, newInvestor);
    return newInvestor;
  }

  async updateInvestor(userId: string, investor: Partial<InsertInvestor>): Promise<Investor | undefined> {
    const existing = this.investors.get(userId);
    if (!existing) return undefined;
    
    const updated: Investor = {
      ...existing,
      ...investor,
      userId // ensure userId doesn't change
    };
    this.investors.set(userId, updated);
    return updated;
  }

  async deleteInvestor(userId: string): Promise<boolean> {
    const deleted = this.investors.delete(userId);
    // Also delete related data
    this.investorPreferences.delete(userId);
    this.taxProfiles.delete(userId);
    return deleted;
  }

  // Investor Preferences methods
  async getInvestorPreferences(userId: string): Promise<InvestorPreferences | undefined> {
    return this.investorPreferences.get(userId);
  }

  async upsertInvestorPreferences(prefs: InsertInvestorPreferences): Promise<InvestorPreferences> {
    const preferences: InvestorPreferences = {
      userId: prefs.userId,
      riskBand: prefs.riskBand ?? null,
      ticketMinGbp: prefs.ticketMinGbp ?? null,
      ticketMaxGbp: prefs.ticketMaxGbp ?? null,
      regions: prefs.regions ?? null,
      focusSectors: prefs.focusSectors ?? null
    };
    this.investorPreferences.set(prefs.userId, preferences);
    return preferences;
  }

  // Tax Profile methods
  async getTaxProfile(userId: string): Promise<TaxProfile | undefined> {
    return this.taxProfiles.get(userId);
  }

  async upsertTaxProfile(profile: InsertTaxProfile): Promise<TaxProfile> {
    const taxProfile: TaxProfile = {
      userId: profile.userId,
      country: profile.country ?? null,
      interests: profile.interests ?? null
    };
    this.taxProfiles.set(profile.userId, taxProfile);
    return taxProfile;
  }
}

export const storage = new MemStorage();
