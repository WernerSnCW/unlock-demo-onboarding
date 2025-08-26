import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { and, like, eq, gte, desc, sql, or } from "drizzle-orm";
import { 
  insertInvestorSchema, 
  insertInvestorPreferencesSchema, 
  insertTaxProfileSchema,
  insertPortfolioAccountSchema,
  insertPortfolioHoldingSchema,
  insertAlternativeInvestmentSchema,
  insertPropertySchema,
  insertPropertyOwnershipSchema,
  insertPropertyLoanSchema,
  insertPropertyValuationSchema,
  insertPropertyLeaseSchema,
  insertPropertyCashflowSchema,
  propertyPriceData,
  ukHpi
} from "@shared/schema";

// Helper functions for UK HPI data
function getPropertyTypeChange(data: any, propertyType: string): number {
  switch (propertyType.toLowerCase()) {
    case 'detached':
      return parseFloat(data.detachedMonthlyChange || '0');
    case 'semi-detached':
      return parseFloat(data.semiDetachedMonthlyChange || '0');
    case 'terraced':
      return parseFloat(data.terracedMonthlyChange || '0');
    case 'flat':
    case 'apartment':
      return parseFloat(data.flatMonthlyChange || '0');
    default:
      return parseFloat(data.monthlyChangePercent || '0');
  }
}

function getPropertyTypeYearlyChange(data: any, propertyType: string): number {
  switch (propertyType.toLowerCase()) {
    case 'detached':
      return parseFloat(data.detachedYearlyChange || '0');
    case 'semi-detached':
      return parseFloat(data.semiDetachedYearlyChange || '0');
    case 'terraced':
      return parseFloat(data.terracedYearlyChange || '0');
    case 'flat':
    case 'apartment':
      return parseFloat(data.flatYearlyChange || '0');
    default:
      return parseFloat(data.yearlyChangePercent || '0');
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Investor routes
  app.get('/api/investors', async (req, res) => {
    try {
      const investors = await storage.getAllInvestors();
      res.json(investors);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch investors' });
    }
  });

  app.get('/api/investors/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const investor = await storage.getInvestor(userId);
      if (!investor) {
        return res.status(404).json({ message: 'Investor not found' });
      }
      res.json(investor);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch investor' });
    }
  });

  app.post('/api/investors', async (req, res) => {
    try {
      const validatedData = insertInvestorSchema.parse(req.body);
      const investor = await storage.createInvestor(validatedData);
      res.status(201).json(investor);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: 'Invalid data', errors: error });
      }
      res.status(500).json({ message: 'Failed to create investor' });
    }
  });

  app.put('/api/investors/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const partialData = req.body;
      const investor = await storage.updateInvestor(userId, partialData);
      if (!investor) {
        return res.status(404).json({ message: 'Investor not found' });
      }
      res.json(investor);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update investor' });
    }
  });

  app.patch('/api/investors/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const partialData = req.body;
      const investor = await storage.updateInvestor(userId, partialData);
      if (!investor) {
        return res.status(404).json({ message: 'Investor not found' });
      }
      res.json(investor);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update investor' });
    }
  });

  app.delete('/api/investors/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const deleted = await storage.deleteInvestor(userId);
      if (!deleted) {
        return res.status(404).json({ message: 'Investor not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete investor' });
    }
  });

  // Investor Preferences routes
  app.get('/api/investors/:userId/preferences', async (req, res) => {
    try {
      const { userId } = req.params;
      const preferences = await storage.getInvestorPreferences(userId);
      if (!preferences) {
        return res.status(404).json({ message: 'Preferences not found' });
      }
      res.json(preferences);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch preferences' });
    }
  });

  app.put('/api/investors/:userId/preferences', async (req, res) => {
    try {
      const { userId } = req.params;
      const validatedData = insertInvestorPreferencesSchema.parse({
        ...req.body,
        userId
      });
      const preferences = await storage.upsertInvestorPreferences(validatedData);
      res.json(preferences);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: 'Invalid data', errors: error });
      }
      res.status(500).json({ message: 'Failed to update preferences' });
    }
  });

  // Tax Profile routes
  app.get('/api/investors/:userId/tax-profile', async (req, res) => {
    try {
      const { userId } = req.params;
      const taxProfile = await storage.getTaxProfile(userId);
      if (!taxProfile) {
        return res.status(404).json({ message: 'Tax profile not found' });
      }
      res.json(taxProfile);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch tax profile' });
    }
  });

  app.put('/api/investors/:userId/tax-profile', async (req, res) => {
    try {
      const { userId } = req.params;
      const validatedData = insertTaxProfileSchema.parse({
        ...req.body,
        userId
      });
      const taxProfile = await storage.upsertTaxProfile(validatedData);
      res.json(taxProfile);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: 'Invalid data', errors: error });
      }
      res.status(500).json({ message: 'Failed to update tax profile' });
    }
  });

  // Combined investor data endpoint
  app.get('/api/investors/:userId/full', async (req, res) => {
    try {
      const { userId } = req.params;
      const [investor, preferences, taxProfile] = await Promise.all([
        storage.getInvestor(userId),
        storage.getInvestorPreferences(userId),
        storage.getTaxProfile(userId)
      ]);

      if (!investor) {
        return res.status(404).json({ message: 'Investor not found' });
      }

      res.json({
        investor,
        preferences,
        taxProfile
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch investor data' });
    }
  });

  // Portfolio Account routes
  app.get('/api/investors/:userId/portfolio-accounts', async (req, res) => {
    try {
      const { userId } = req.params;
      const accounts = await storage.getAllPortfolioAccounts(userId);
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch portfolio accounts' });
    }
  });

  app.post('/api/investors/:userId/portfolio-accounts', async (req, res) => {
    try {
      const { userId } = req.params;
      const validatedData = insertPortfolioAccountSchema.parse({
        ...req.body,
        userId
      });
      const account = await storage.createPortfolioAccount(validatedData);
      res.status(201).json(account);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: 'Invalid data', errors: error });
      }
      res.status(500).json({ message: 'Failed to create portfolio account' });
    }
  });

  app.put('/api/portfolio-accounts/:accountId', async (req, res) => {
    try {
      const { accountId } = req.params;
      const partialData = req.body;
      const account = await storage.updatePortfolioAccount(accountId, partialData);
      if (!account) {
        return res.status(404).json({ message: 'Portfolio account not found' });
      }
      res.json(account);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update portfolio account' });
    }
  });

  app.delete('/api/portfolio-accounts/:accountId', async (req, res) => {
    try {
      const { accountId } = req.params;
      const deleted = await storage.deletePortfolioAccount(accountId);
      if (!deleted) {
        return res.status(404).json({ message: 'Portfolio account not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete portfolio account' });
    }
  });

  // Portfolio Holdings routes
  app.get('/api/investors/:userId/portfolio-holdings', async (req, res) => {
    try {
      const { userId } = req.params;
      const holdings = await storage.getAllPortfolioHoldings(userId);
      res.json(holdings);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch portfolio holdings' });
    }
  });

  app.post('/api/investors/:userId/portfolio-holdings', async (req, res) => {
    try {
      const { userId } = req.params;
      const validatedData = insertPortfolioHoldingSchema.parse({
        ...req.body,
        userId
      });
      const holding = await storage.createPortfolioHolding(validatedData);
      res.status(201).json(holding);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: 'Invalid data', errors: error });
      }
      res.status(500).json({ message: 'Failed to create portfolio holding' });
    }
  });

  app.put('/api/portfolio-holdings/:holdingId', async (req, res) => {
    try {
      const { holdingId } = req.params;
      const partialData = req.body;
      const holding = await storage.updatePortfolioHolding(holdingId, partialData);
      if (!holding) {
        return res.status(404).json({ message: 'Portfolio holding not found' });
      }
      res.json(holding);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update portfolio holding' });
    }
  });

  app.delete('/api/portfolio-holdings/:holdingId', async (req, res) => {
    try {
      const { holdingId } = req.params;
      const deleted = await storage.deletePortfolioHolding(holdingId);
      if (!deleted) {
        return res.status(404).json({ message: 'Portfolio holding not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete portfolio holding' });
    }
  });

  // Alternative Investment routes
  app.get('/api/alternatives/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const investments = await storage.getAllAlternativeInvestments(userId);
      res.json(investments);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch alternative investments' });
    }
  });

  // Property valuation endpoint - find comparable sales
  app.get('/api/property-comparables/:postcode', async (req, res) => {
    try {
      const { postcode } = req.params;
      const { propertyType, radius = '5' } = req.query;
      
      // Get property comparables from the HM Land Registry data
      const comparables = await db.select()
        .from(propertyPriceData)
        .where(
          and(
            like(propertyPriceData.postcode, `${postcode.split(' ')[0]}%`), // Match postcode area
            propertyType ? eq(propertyPriceData.propertyType, propertyType as string) : undefined,
            gte(propertyPriceData.dateOfTransfer, '2023-01-01') // Recent sales only
          )
        )
        .orderBy(desc(propertyPriceData.dateOfTransfer))
        .limit(50);
      
      // Calculate statistics
      const prices = comparables.map(c => Number(c.price));
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      const medianPrice = prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)];
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      res.json({
        comparables: comparables.slice(0, 10), // Return top 10 for display
        statistics: {
          count: comparables.length,
          averagePrice: Math.round(avgPrice),
          medianPrice: Math.round(medianPrice),
          minPrice,
          maxPrice,
          estimatedValue: Math.round(avgPrice), // Basic estimation
        }
      });
    } catch (error) {
      console.error('Error fetching property comparables:', error);
      res.status(500).json({ error: 'Failed to fetch property comparables' });
    }
  });

  app.get('/api/alternatives/investment/:investmentId', async (req, res) => {
    try {
      const { investmentId } = req.params;
      const investment = await storage.getAlternativeInvestment(investmentId);
      if (!investment) {
        return res.status(404).json({ message: 'Alternative investment not found' });
      }
      res.json(investment);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch alternative investment' });
    }
  });

  app.post('/api/alternatives', async (req, res) => {
    try {
      console.log('Received alternative investment data:', req.body);
      const validatedData = insertAlternativeInvestmentSchema.parse(req.body);
      console.log('Validated data:', validatedData);
      const investment = await storage.createAlternativeInvestment(validatedData);
      console.log('Created investment:', investment);
      res.status(201).json(investment);
    } catch (error) {
      console.error('Alternative investment creation error:', error);
      if (error instanceof Error && error.name === 'ZodError') {
        console.error('Zod validation error details:', error);
        return res.status(400).json({ message: 'Invalid data', errors: error });
      }
      res.status(500).json({ message: 'Failed to create alternative investment', error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.put('/api/alternatives/:investmentId', async (req, res) => {
    try {
      const { investmentId } = req.params;
      const partialData = req.body;
      const investment = await storage.updateAlternativeInvestment(investmentId, partialData);
      if (!investment) {
        return res.status(404).json({ message: 'Alternative investment not found' });
      }
      res.json(investment);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update alternative investment' });
    }
  });

  app.delete('/api/alternatives/:investmentId', async (req, res) => {
    try {
      const { investmentId } = req.params;
      const deleted = await storage.deleteAlternativeInvestment(investmentId);
      if (!deleted) {
        return res.status(404).json({ message: 'Alternative investment not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete alternative investment' });
    }
  });

  // Property routes
  app.get('/api/properties/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const properties = await storage.getAllProperties(userId);
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch properties' });
    }
  });

  app.post('/api/properties', async (req, res) => {
    try {
      console.log('Incoming property data:', req.body);
      
      // Separate property data from ownership data
      const {
        userId, ownershipType, sharePct, acquisitionDate, 
        acquisitionPriceGbp, acquisitionCostsGbp, isPrimaryResidence,
        ...propertyData
      } = req.body;
      
      console.log('Property data only:', propertyData);
      const validatedData = insertPropertySchema.parse(propertyData);
      const property = await storage.createProperty(validatedData);
      
      // Create ownership record if provided
      if (userId && sharePct) {
        await storage.createPropertyOwnership({
          propertyId: property.id,
          userId: userId,
          ownershipType: ownershipType || 'direct',
          sharePct: sharePct,
          acquisitionDate: acquisitionDate,
          acquisitionPriceGbp: acquisitionPriceGbp,
          acquisitionCostsGbp: acquisitionCostsGbp,
          isPrimaryResidence: isPrimaryResidence || false
        });
      }
      
      res.status(201).json(property);
    } catch (error) {
      console.error('Property creation error:', error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: 'Invalid data', errors: error });
      }
      res.status(500).json({ message: 'Failed to create property', error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.put('/api/properties/:propertyId', async (req, res) => {
    try {
      const { propertyId } = req.params;
      const partialData = req.body;
      const property = await storage.updateProperty(propertyId, partialData);
      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }
      res.json(property);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update property' });
    }
  });

  app.delete('/api/properties/:propertyId', async (req, res) => {
    try {
      const { propertyId } = req.params;
      const deleted = await storage.deleteProperty(propertyId);
      if (!deleted) {
        return res.status(404).json({ message: 'Property not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete property' });
    }
  });

  // Property sub-resource routes
  app.get('/api/properties/:propertyId/ownerships', async (req, res) => {
    try {
      const { propertyId } = req.params;
      const ownerships = await storage.getPropertyOwnerships(propertyId);
      res.json(ownerships);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch property ownerships' });
    }
  });

  app.get('/api/properties/:propertyId/loans', async (req, res) => {
    try {
      const { propertyId } = req.params;
      const loans = await storage.getPropertyLoans(propertyId);
      res.json(loans);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch property loans' });
    }
  });

  app.post('/api/properties/:propertyId/loans', async (req, res) => {
    try {
      const { propertyId } = req.params;
      const validatedData = insertPropertyLoanSchema.parse({ ...req.body, propertyId });
      const loan = await storage.createPropertyLoan(validatedData);
      res.status(201).json(loan);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create property loan' });
    }
  });

  app.get('/api/properties/:propertyId/valuations', async (req, res) => {
    try {
      const { propertyId } = req.params;
      const valuations = await storage.getPropertyValuations(propertyId);
      res.json(valuations);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch property valuations' });
    }
  });

  app.post('/api/properties/:propertyId/valuations', async (req, res) => {
    try {
      const { propertyId } = req.params;
      const validatedData = insertPropertyValuationSchema.parse({ ...req.body, propertyId });
      const valuation = await storage.createPropertyValuation(validatedData);
      res.status(201).json(valuation);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create property valuation' });
    }
  });

  app.get('/api/properties/:propertyId/leases', async (req, res) => {
    try {
      const { propertyId } = req.params;
      const leases = await storage.getPropertyLeases(propertyId);
      res.json(leases);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch property leases' });
    }
  });

  app.post('/api/properties/:propertyId/leases', async (req, res) => {
    try {
      const { propertyId } = req.params;
      const validatedData = insertPropertyLeaseSchema.parse({ ...req.body, propertyId });
      const lease = await storage.createPropertyLease(validatedData);
      res.status(201).json(lease);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create property lease' });
    }
  });

  // UK HPI Data Routes for property valuations
  app.get('/api/uk-hpi/regions', async (req, res) => {
    try {
      const regions = await db.selectDistinct({ regionName: ukHpi.regionName, areaCode: ukHpi.areaCode })
        .from(ukHpi)
        .orderBy(ukHpi.regionName);
      res.json(regions);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch UK regions' });
    }
  });

  app.get('/api/uk-hpi/region/:areaCode/latest', async (req, res) => {
    try {
      const { areaCode } = req.params;
      const latestData = await db.select()
        .from(ukHpi)
        .where(eq(ukHpi.areaCode, areaCode))
        .orderBy(desc(ukHpi.date))
        .limit(1);
      
      if (latestData.length === 0) {
        return res.status(404).json({ message: 'No data found for region' });
      }
      
      res.json(latestData[0]);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch latest UK HPI data' });
    }
  });

  app.get('/api/uk-hpi/region/:areaCode/trends', async (req, res) => {
    try {
      const { areaCode } = req.params;
      const { months = '12' } = req.query;
      
      // Get the last X months of data for trend analysis
      const trendsData = await db.select()
        .from(ukHpi)
        .where(eq(ukHpi.areaCode, areaCode))
        .orderBy(desc(ukHpi.date))
        .limit(parseInt(months as string));
      
      res.json(trendsData.reverse()); // Return chronological order
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch UK HPI trends' });
    }
  });

  // Real Property Search using UK Property Database
  app.post('/api/property-search', async (req, res) => {
    try {
      const { query, limit = 10 } = req.body;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: 'Search query is required' });
      }
      
      const searchTerm = query.trim().toUpperCase();
      
      // Search by postcode or address in our real property database
      const properties = await db.select({
        id: propertyPriceData.transactionId,
        postcode: propertyPriceData.postcode,
        address: sql<string>`CONCAT(
          ${propertyPriceData.primaryAddressableName}, 
          CASE WHEN ${propertyPriceData.secondaryAddressableName} IS NOT NULL 
            THEN CONCAT(' ', ${propertyPriceData.secondaryAddressableName}) 
            ELSE '' 
          END,
          CASE WHEN ${propertyPriceData.street} IS NOT NULL 
            THEN CONCAT(', ', ${propertyPriceData.street}) 
            ELSE '' 
          END
        )`,
        propertyType: propertyPriceData.propertyType,
        price: propertyPriceData.price,
        dateOfTransfer: propertyPriceData.dateOfTransfer,
        newBuild: propertyPriceData.oldNew,
        tenure: propertyPriceData.duration
      })
      .from(propertyPriceData)
      .where(
        or(
          like(propertyPriceData.postcode, `%${searchTerm}%`),
          like(propertyPriceData.street, `%${searchTerm}%`),
          like(propertyPriceData.primaryAddressableName, `%${searchTerm}%`)
        )
      )
      .orderBy(desc(propertyPriceData.dateOfTransfer))
      .limit(parseInt(limit.toString()));

      // Transform the results for the frontend
      const searchResults = properties.map((property, index) => ({
        id: `real-${property.id || index}`,
        address: property.address,
        postcode: property.postcode,
        type: property.propertyType === 'F' ? 'Flat' : 
              property.propertyType === 'D' ? 'Detached' :
              property.propertyType === 'S' ? 'Semi-detached' :
              property.propertyType === 'T' ? 'Terraced' : 'Other',
        price: parseFloat(property.price || '0'),
        date: property.dateOfTransfer,
        newBuild: property.newBuild === 'Y',
        tenure: property.tenure === 'F' ? 'Freehold' : 'Leasehold'
      }));
      
      res.json(searchResults);
    } catch (error) {
      console.error('Property search error:', error);
      res.status(500).json({ message: 'Property search failed' });
    }
  });

  // Enhanced Property Valuation with PPD Comparables + HPI Baseline
  app.post('/api/property-valuation', async (req, res) => {
    try {
      const { 
        postcode, 
        propertyType, 
        paon, 
        saon, 
        street, 
        purchasePrice, 
        purchaseDate,
        bedrooms,
        propertyId 
      } = req.body;
      
      if (!postcode) {
        return res.status(400).json({ message: 'Postcode is required for valuation' });
      }

      // Step 1: Get HPI baseline for the region
      const postcodePrefix = postcode.split(' ')[0];
      // Extract just the letter part for better matching (e.g., SW1A -> SW1, M16 -> M16)
      const postcodeArea = postcodePrefix.match(/^[A-Z]+\d*/)?.[0] || postcodePrefix;
      
      console.log(`Valuation request: postcode=${postcode}, prefix=${postcodePrefix}, area=${postcodeArea}`);
      
      // Try multiple matching strategies for HPI data
      let hpiData = await db.select()
        .from(ukHpi)
        .where(like(ukHpi.regionName, `%${postcodePrefix}%`))
        .orderBy(desc(ukHpi.date))
        .limit(1);
        
      console.log(`Direct postcode lookup found ${hpiData.length} results`);
      
      // If no direct postcode match, try broader region matches
      if (hpiData.length === 0) {
        // More precise postcode area to HPI region mapping
        const postcodeToRegion: Record<string, string> = {
          // London postcodes - Central
          'EC1': 'City of London', 'EC2': 'City of London', 'EC3': 'City of London', 'EC4': 'City of London',
          'WC1': 'Inner London', 'WC2': 'Inner London',
          'W1': 'City of Westminster', 'SW1': 'City of Westminster',
          
          // London postcodes - Inner London
          'E1': 'Tower Hamlets', 'E2': 'Tower Hamlets', 'E3': 'Tower Hamlets',
          'N1': 'Inner London', 'N7': 'Inner London', 'N19': 'Inner London',
          'NW1': 'Inner London', 'NW3': 'Inner London', 'NW5': 'Inner London', 'NW6': 'Inner London', 'NW8': 'Inner London',
          'SE1': 'Inner London', 'SE11': 'Inner London', 'SE17': 'Inner London',
          'SW3': 'Inner London', 'SW5': 'Inner London', 'SW6': 'Inner London', 'SW7': 'Inner London', 'SW10': 'Inner London',
          'W2': 'Inner London', 'W8': 'Inner London', 'W9': 'Inner London', 'W10': 'Inner London', 'W11': 'Inner London', 'W14': 'Inner London',
          
          // London postcodes - Outer London  
          'E4': 'Outer London', 'E6': 'Outer London', 'E7': 'Outer London', 'E8': 'Outer London', 'E9': 'Outer London',
          'E10': 'Outer London', 'E11': 'Outer London', 'E12': 'Outer London', 'E13': 'Outer London', 'E14': 'Outer London', 'E15': 'Outer London', 'E16': 'Outer London', 'E17': 'Outer London', 'E18': 'Outer London',
          'N2': 'Outer London', 'N3': 'Outer London', 'N4': 'Outer London', 'N5': 'Outer London', 'N6': 'Outer London', 'N8': 'Outer London', 'N9': 'Outer London', 'N10': 'Outer London', 'N11': 'Outer London', 'N12': 'Outer London', 'N13': 'Outer London', 'N14': 'Outer London', 'N15': 'Outer London', 'N16': 'Outer London', 'N17': 'Outer London', 'N18': 'Outer London', 'N20': 'Outer London', 'N21': 'Outer London', 'N22': 'Outer London',
          'NW2': 'Outer London', 'NW4': 'Outer London', 'NW7': 'Outer London', 'NW9': 'Outer London', 'NW10': 'Outer London', 'NW11': 'Outer London',
          'SE2': 'Outer London', 'SE3': 'Outer London', 'SE4': 'Outer London', 'SE5': 'Outer London', 'SE6': 'Outer London', 'SE7': 'Outer London', 'SE8': 'Outer London', 'SE9': 'Outer London', 'SE10': 'Outer London', 'SE12': 'Outer London', 'SE13': 'Outer London', 'SE14': 'Outer London', 'SE15': 'Outer London', 'SE16': 'Outer London', 'SE18': 'Outer London', 'SE19': 'Outer London', 'SE20': 'Outer London', 'SE21': 'Outer London', 'SE22': 'Outer London', 'SE23': 'Outer London', 'SE24': 'Outer London', 'SE25': 'Outer London', 'SE26': 'Outer London', 'SE27': 'Outer London', 'SE28': 'Outer London',
          'SW2': 'Outer London', 'SW4': 'Outer London', 'SW8': 'Outer London', 'SW9': 'Outer London', 'SW11': 'Outer London', 'SW12': 'Outer London', 'SW13': 'Outer London', 'SW14': 'Outer London', 'SW15': 'Outer London', 'SW16': 'Outer London', 'SW17': 'Outer London', 'SW18': 'Outer London', 'SW19': 'Outer London', 'SW20': 'Outer London',
          'W3': 'Outer London', 'W4': 'Outer London', 'W5': 'Outer London', 'W6': 'Outer London', 'W7': 'Outer London', 'W12': 'Outer London', 'W13': 'Outer London',
          
          // Manchester postcodes
          'M1': 'Manchester', 'M2': 'Manchester', 'M3': 'Manchester', 'M4': 'Manchester', 'M15': 'Manchester', 'M60': 'Manchester',
          
          // Greater Manchester (surrounding areas)
          'M5': 'Greater Manchester', 'M6': 'Greater Manchester', 'M7': 'Greater Manchester', 'M8': 'Greater Manchester', 'M9': 'Greater Manchester', 'M10': 'Greater Manchester',
          'M11': 'Greater Manchester', 'M12': 'Greater Manchester', 'M13': 'Greater Manchester', 'M14': 'Greater Manchester', 'M16': 'Greater Manchester', 'M17': 'Greater Manchester', 'M18': 'Greater Manchester', 'M19': 'Greater Manchester', 'M20': 'Greater Manchester',
          'M21': 'Greater Manchester', 'M22': 'Greater Manchester', 'M23': 'Greater Manchester', 'M24': 'Greater Manchester', 'M25': 'Greater Manchester', 'M26': 'Greater Manchester', 'M27': 'Greater Manchester', 'M28': 'Greater Manchester', 'M29': 'Greater Manchester', 'M30': 'Greater Manchester',
          'M31': 'Greater Manchester', 'M32': 'Greater Manchester', 'M33': 'Greater Manchester', 'M34': 'Greater Manchester', 'M35': 'Greater Manchester', 'M38': 'Greater Manchester', 'M40': 'Greater Manchester', 'M41': 'Greater Manchester', 'M43': 'Greater Manchester', 'M44': 'Greater Manchester', 'M45': 'Greater Manchester', 'M46': 'Greater Manchester', 'M90': 'Greater Manchester',
          
          // Birmingham
          'B1': 'Birmingham', 'B2': 'Birmingham', 'B3': 'Birmingham', 'B4': 'Birmingham', 'B5': 'Birmingham', 'B6': 'Birmingham', 'B7': 'Birmingham', 'B8': 'Birmingham', 'B9': 'Birmingham', 'B10': 'Birmingham',
          'B11': 'Birmingham', 'B12': 'Birmingham', 'B13': 'Birmingham', 'B14': 'Birmingham', 'B15': 'Birmingham', 'B16': 'Birmingham', 'B17': 'Birmingham', 'B18': 'Birmingham', 'B19': 'Birmingham', 'B20': 'Birmingham',
          'B21': 'Birmingham', 'B23': 'Birmingham', 'B24': 'Birmingham', 'B25': 'Birmingham', 'B26': 'Birmingham', 'B27': 'Birmingham', 'B28': 'Birmingham', 'B29': 'Birmingham', 'B30': 'Birmingham', 'B31': 'Birmingham', 'B32': 'Birmingham', 'B33': 'Birmingham', 'B34': 'Birmingham', 'B35': 'Birmingham', 'B36': 'Birmingham', 'B37': 'Birmingham', 'B38': 'Birmingham', 'B40': 'Birmingham', 'B42': 'Birmingham', 'B43': 'Birmingham', 'B44': 'Birmingham', 'B45': 'Birmingham', 'B46': 'Birmingham', 'B47': 'Birmingham', 'B48': 'Birmingham',
          
          // Other major UK areas
          'SY1': 'Shropshire', 'SY2': 'Shropshire', 'SY3': 'Shropshire', 'SY4': 'Shropshire', 'SY5': 'Shropshire', 'SY6': 'Shropshire', 'SY7': 'Shropshire', 'SY8': 'Shropshire', 'SY9': 'Shropshire', 'SY10': 'Shropshire',
          'SY11': 'Shropshire', 'SY12': 'Shropshire', 'SY13': 'Shropshire', 'SY14': 'Shropshire', 'SY15': 'Shropshire', 'SY16': 'Shropshire', 'SY17': 'Shropshire', 'SY18': 'Shropshire', 'SY19': 'Shropshire', 'SY20': 'Shropshire',
          'SY21': 'Shropshire', 'SY22': 'Shropshire', 'SY23': 'Shropshire', 'SY24': 'Shropshire', 'SY25': 'Shropshire'
        };
        
        const regionName = postcodeToRegion[postcodeArea];
        console.log(`Mapped ${postcodeArea} to region: ${regionName}`);
        if (regionName) {
          hpiData = await db.select()
            .from(ukHpi)
            .where(eq(ukHpi.regionName, regionName))
            .orderBy(desc(ukHpi.date))
            .limit(1);
          console.log(`Region lookup for '${regionName}' found ${hpiData.length} results`);
        }
        
        // Fallback to generic London if no specific match
        if (hpiData.length === 0 && (postcodeArea.startsWith('E') || postcodeArea.startsWith('N') || postcodeArea.startsWith('NW') || postcodeArea.startsWith('SE') || postcodeArea.startsWith('SW') || postcodeArea.startsWith('W') || postcodeArea.startsWith('EC') || postcodeArea.startsWith('WC'))) {
          console.log(`Trying London fallback for ${postcodeArea}`);
          hpiData = await db.select()
            .from(ukHpi)
            .where(eq(ukHpi.regionName, 'London'))
            .orderBy(desc(ukHpi.date))
            .limit(1);
          console.log(`London fallback found ${hpiData.length} results`);
        }
        
        // Ultimate fallback: try to find ANY region that contains the postcode prefix
        if (hpiData.length === 0) {
          console.log(`Trying wildcard search for any region with ${postcodePrefix}`);
          hpiData = await db.select()
            .from(ukHpi)
            .where(like(ukHpi.regionName, `%${postcodePrefix.substring(0, 2)}%`))
            .orderBy(desc(ukHpi.date))
            .limit(1);
          console.log(`Wildcard search found ${hpiData.length} results`);
        }
        
        // Final fallback: use England average data
        if (hpiData.length === 0) {
          console.log(`Trying England fallback`);
          hpiData = await db.select()
            .from(ukHpi)
            .where(eq(ukHpi.regionName, 'England'))
            .orderBy(desc(ukHpi.date))
            .limit(1);
          console.log(`England fallback found ${hpiData.length} results`);
        }
      }

      if (hpiData.length === 0) {
        return res.status(404).json({ message: 'No HPI data found for this location' });
      }

      const hpi = hpiData[0];
      let hpiBasePrice = parseFloat(hpi.averagePrice || '0');
      
      // Get property-type-specific HPI price if available
      if (propertyType) {
        switch (propertyType.toLowerCase()) {
          case 'detached':
            hpiBasePrice = parseFloat(hpi.detachedPrice || hpi.averagePrice || '0');
            break;
          case 'semi-detached':
            hpiBasePrice = parseFloat(hpi.semiDetachedPrice || hpi.averagePrice || '0');
            break;
          case 'terraced':
            hpiBasePrice = parseFloat(hpi.terracedPrice || hpi.averagePrice || '0');
            break;
          case 'flat':
          case 'apartment':
            hpiBasePrice = parseFloat(hpi.flatPrice || hpi.averagePrice || '0');
            break;
        }
      }

      // Step 2: Calculate HPI uplift if purchase data is available
      let hpiAdjustedValue = hpiBasePrice;
      let hpiUpliftFactor = 1;
      
      if (purchasePrice && purchaseDate) {
        try {
          const purchasePriceNum = parseFloat(purchasePrice.toString());
          const purchaseDateTime = new Date(purchaseDate);
          
          // Get HPI data for purchase period (closest available)
          const historicalHpi = await db.select()
            .from(ukHpi)
            .where(
              and(
                like(ukHpi.regionName, `%${postcodePrefix}%`),
                gte(ukHpi.date, purchaseDateTime.toISOString().split('T')[0])
              )
            )
            .orderBy(ukHpi.date)
            .limit(1);

          if (historicalHpi.length > 0) {
            const historicalPrice = parseFloat(historicalHpi[0].averagePrice || '0');
            if (historicalPrice > 0) {
              hpiUpliftFactor = hpiBasePrice / historicalPrice;
              hpiAdjustedValue = purchasePriceNum * hpiUpliftFactor;
            }
          }
        } catch (error) {
          console.error('Error calculating HPI uplift:', error);
        }
      }

      // Step 3: Find PPD comparables (last 12-24 months)
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - 18); // 18 months for wider search
      
      const comparables = await db.select()
        .from(propertyPriceData)
        .where(
          and(
            like(propertyPriceData.postcode, `${postcodePrefix}%`),
            gte(propertyPriceData.dateOfTransfer, cutoffDate.toISOString().split('T')[0]),
            propertyType ? eq(propertyPriceData.propertyType, propertyType.charAt(0).toUpperCase()) : sql`1=1`
          )
        )
        .orderBy(desc(propertyPriceData.dateOfTransfer))
        .limit(10);

      console.log(`Found ${comparables.length} comparable sales`);

      // Step 4: Compute valuation based on available data
      let finalEstimate = hpiAdjustedValue;
      let method = 'HPI_ONLY';
      let range = { min: 0, max: 0 };
      let explainability = {
        hpiBaseline: hpiBasePrice,
        hpiUpliftFactor: hpiUpliftFactor,
        purchasePrice: purchasePrice || null,
        comparablesFound: comparables.length,
        method: 'HPI baseline calculation'
      };

      // If we have comparables, blend with HPI
      if (comparables.length >= 2) {
        const compPrices = comparables
          .map(c => parseFloat(c.price || '0'))
          .filter(price => price > 0)
          .sort((a, b) => a - b);

        if (compPrices.length >= 2) {
          // Remove outliers (bottom and top 10%)
          const start = Math.floor(compPrices.length * 0.1);
          const end = Math.ceil(compPrices.length * 0.9);
          const trimmedPrices = compPrices.slice(start, end);
          
          const compAverage = trimmedPrices.reduce((sum, price) => sum + price, 0) / trimmedPrices.length;
          const compMin = Math.min(...trimmedPrices);
          const compMax = Math.max(...trimmedPrices);

          // Blend HPI and comparables (70% comps, 30% HPI)
          finalEstimate = Math.round(compAverage * 0.7 + hpiAdjustedValue * 0.3);
          method = 'HPI_PLUS_COMPS';
          range = { 
            min: Math.round(Math.min(compMin, finalEstimate * 0.9)),
            max: Math.round(Math.max(compMax, finalEstimate * 1.1))
          };
          
          explainability = {
            ...explainability,
            method: 'Blended: 70% comparable sales + 30% HPI baseline',
            comparableAverage: Math.round(compAverage),
            comparableRange: { min: compMin, max: compMax },
            blendedResult: finalEstimate
          };
        }
      }

      // Ensure we have a reasonable range for HPI_ONLY
      if (method === 'HPI_ONLY') {
        range = {
          min: Math.round(finalEstimate * 0.85),
          max: Math.round(finalEstimate * 1.15)
        };
      }

      const valuation = {
        estimate: Math.round(finalEstimate),
        method,
        range,
        comps: comparables.slice(0, 5).map(comp => ({
          price: parseFloat(comp.price || '0'),
          date: comp.dateOfTransfer,
          postcode: comp.postcode,
          propertyType: comp.propertyType,
          newBuild: comp.oldNew === 'Y',
          tenure: comp.duration,
          address: `${comp.primaryAddressableName || ''} ${comp.street || ''}`.trim()
        })),
        explainability,
        hpiData: {
          regionName: hpi.regionName,
          averagePrice: hpiBasePrice,
          monthlyChange: parseFloat(hpi.monthlyChangePercent || '0'),
          yearlyChange: parseFloat(hpi.yearlyChangePercent || '0'),
          date: hpi.date
        }
      };

      res.json(valuation);
    } catch (error) {
      console.error('Property valuation error:', error);
      res.status(500).json({ message: 'Failed to generate property valuation' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
