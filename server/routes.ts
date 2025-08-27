import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { and, like, eq, gte, lte, desc, sql, or } from "drizzle-orm";
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
  // In-memory cache for valuations (in production, use Redis or database)
  const valuationCache = new Map();

  // Generate a deterministic cache key
  function getCacheKey(postcode: string, propertyType?: string, purchasePrice?: number, purchaseDate?: string) {
    const key = `${postcode}|${propertyType || 'ANY'}|${purchasePrice || 'NO_PRICE'}|${purchaseDate || 'NO_DATE'}`;
    return key.toUpperCase();
  }

  app.post('/api/property-valuation', async (req, res) => {
    try {
      const { 
        postcode, 
        propertyType, 
        paon, 
        saon, 
        street, 
        purchasePrice: requestPurchasePrice, 
        purchaseDate: requestPurchaseDate,
        bedrooms,
        propertyId 
      } = req.body;
      
      if (!postcode) {
        return res.status(400).json({ message: 'Postcode is required for valuation' });
      }

      // Start with provided purchase data, then try to find it from property price data if missing
      let purchasePrice = requestPurchasePrice;
      let purchaseDate = requestPurchaseDate;
      
      // If no purchase price provided but we have a property selected, try to find it in property price data
      if (!purchasePrice && propertyId) {
        try {
          // Find the most recent transaction for this postcode that could be this property
          const recentTransactions = await db.select()
            .from(propertyPriceData)
            .where(eq(propertyPriceData.postcode, postcode))
            .orderBy(desc(propertyPriceData.dateOfTransfer))
            .limit(10);
          
          if (recentTransactions.length > 0) {
            // Use the most recent transaction as the likely purchase price
            const mostRecentTransaction = recentTransactions[0];
            purchasePrice = parseFloat(mostRecentTransaction.price || '0');
            purchaseDate = mostRecentTransaction.dateOfTransfer;
            
            console.log(`Auto-detected purchase data for ${postcode}: £${purchasePrice.toLocaleString()} on ${purchaseDate}`);
          }
        } catch (error) {
          console.log('Error fetching property transaction data:', error);
        }
      }

      // Check cache first (cache for 1 hour)
      const cacheKey = getCacheKey(postcode, propertyType, purchasePrice, purchaseDate);
      const cached = valuationCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < 60 * 60 * 1000) {
        console.log('Returning cached valuation for:', cacheKey);
        return res.json(cached.data);
      }

      // Step 1: Get HPI baseline for the region
      const postcodePrefix = postcode.split(' ')[0];
      const postcodeArea = postcodePrefix.match(/^[A-Z]+/)?.[0] || postcodePrefix.substring(0, 2);
      
      console.log(`Valuation request: postcode=${postcode}, prefix=${postcodePrefix}, area=${postcodeArea}`);
      
      // Proper postcode to HPI region mapping
      function getHpiRegionForPostcode(postcodePrefix: string): string[] {
        const area = postcodePrefix.substring(0, 2).toUpperCase();
        
        // Define proper UK postcode area to HPI region mappings
        const postcodeMap: Record<string, string[]> = {
          // London postcodes
          'E1': ['London'], 'E2': ['London'], 'E3': ['London'], 'E4': ['London'], 'E5': ['London'],
          'EC': ['London'], 'N1': ['London'], 'N2': ['London'], 'N3': ['London'], 'N4': ['London'],
          'NW': ['London'], 'SE': ['London'], 'SW': ['London'], 'W1': ['London'], 'WC': ['London'],
          
          // Essex postcodes
          'SS': ['Essex', 'Basildon'], 'CM': ['Essex'], 'CO': ['Essex'], 'RM': ['Essex'],
          
          // Kent postcodes  
          'TN': ['Kent'], 'CT': ['Kent'], 'DA': ['Kent'], 'ME': ['Kent'], 'BR': ['Kent'],
          
          // Manchester/Greater Manchester
          'M1': ['Manchester', 'Greater Manchester'], 'M2': ['Manchester', 'Greater Manchester'],
          
          // Other major areas
          'B1': ['Birmingham'], 'B2': ['Birmingham'], 'LS': ['Leeds'], 'S1': ['Sheffield'],
          'OX': ['Oxfordshire'], 'CB': ['Cambridgeshire'], 'RG': ['Reading', 'Berkshire']
        };
        
        return postcodeMap[area] || postcodeMap[postcodePrefix.substring(0, 1)] || [];
      }
      
      const possibleRegions = getHpiRegionForPostcode(postcodePrefix);
      let hpiData: any[] = [];
      
      // Try each possible region
      for (const region of possibleRegions) {
        hpiData = await db.select()
          .from(ukHpi)
          .where(eq(ukHpi.regionName, region))
          .orderBy(desc(ukHpi.date))
          .limit(1);
          
        if (hpiData.length > 0) {
          console.log(`Found HPI data for ${postcodePrefix} → ${region}`);
          break;
        }
      }
      
      console.log(`Postcode mapping: ${postcodePrefix} → [${possibleRegions.join(', ')}], found: ${hpiData.length > 0 ? hpiData[0].regionName : 'none'}`);
      
      // Fallback to broader area search if no exact match
      if (hpiData.length === 0 && possibleRegions.length > 0) {
        console.log(`Trying fuzzy match for regions: ${possibleRegions.join(', ')}`);
        for (const region of possibleRegions) {
          hpiData = await db.select()
            .from(ukHpi)
            .where(like(ukHpi.regionName, `%${region}%`))
            .orderBy(desc(ukHpi.date))
            .limit(1);
            
          if (hpiData.length > 0) {
            console.log(`Fuzzy match found: ${region} → ${hpiData[0].regionName}`);
            break;
          }
        }
      }
      
      // Strategy 4: London fallback for London postcodes
      if (hpiData.length === 0 && (postcodeArea.startsWith('E') || postcodeArea.startsWith('N') || postcodeArea.startsWith('NW') || postcodeArea.startsWith('SE') || postcodeArea.startsWith('SW') || postcodeArea.startsWith('W') || postcodeArea.startsWith('EC') || postcodeArea.startsWith('WC'))) {
        console.log(`London fallback for: ${postcodeArea}`);
        hpiData = await db.select()
          .from(ukHpi)
          .where(eq(ukHpi.regionName, 'London'))
          .orderBy(desc(ukHpi.date))
          .limit(1);
        console.log(`London fallback found ${hpiData.length} results`);
      }
      
      // Strategy 5: England/UK-wide fallback
      if (hpiData.length === 0) {
        console.log(`England/UK fallback`);
        hpiData = await db.select()
          .from(ukHpi)
          .where(
            or(
              eq(ukHpi.regionName, 'England'),
              eq(ukHpi.regionName, 'United Kingdom')
            )
          )
          .orderBy(desc(ukHpi.date))
          .limit(1);
        console.log(`England/UK fallback found ${hpiData.length} results`);
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
      let usesPurchaseData = false;
      
      if (purchasePrice && purchaseDate) {
        try {
          const purchasePriceNum = parseFloat(purchasePrice.toString());
          const purchaseDateTime = new Date(purchaseDate);
          
          // Validate date is reasonable (not more than 1 month in the future to account for processing delays)
          const futureThreshold = new Date();
          futureThreshold.setMonth(futureThreshold.getMonth() + 1);
          
          if (purchaseDateTime > futureThreshold) {
            console.log(`Warning: Purchase date ${purchaseDate} is too far in the future, ignoring HPI uplift calculation`);
          } else {
            // For recent purchases (less than 2 years), use minimal HPI adjustment
            const monthsSincePurchase = (Date.now() - purchaseDateTime.getTime()) / (1000 * 60 * 60 * 24 * 30);
            
            if (monthsSincePurchase < 24) {
              // For recent purchases, apply modest market adjustment (typically 2-5% annually)
              const annualGrowthRate = parseFloat(hpi.yearlyChangePercent || '2') / 100;
              const yearsElapsed = monthsSincePurchase / 12;
              hpiUpliftFactor = 1 + (annualGrowthRate * yearsElapsed);
              hpiAdjustedValue = purchasePriceNum * hpiUpliftFactor;
              usesPurchaseData = true;
              
              console.log(`Recent Purchase Analysis:`);
              console.log(`Purchase Date: ${purchaseDate} (${monthsSincePurchase.toFixed(1)} months ago)`);
              console.log(`Regional YoY Growth: ${(annualGrowthRate * 100).toFixed(1)}%`);
              console.log(`Modest Uplift Applied: ${((hpiUpliftFactor - 1) * 100).toFixed(2)}%`);
              console.log(`Purchase Price: £${purchasePriceNum.toLocaleString()}`);
              console.log(`Adjusted Value: £${hpiAdjustedValue.toLocaleString()}`);
            } else {
              // For older purchases, use full HPI historical comparison
              const historicalHpi = await db.select()
                .from(ukHpi)
                .where(
                  and(
                    eq(ukHpi.regionName, hpi.regionName),
                    lte(ukHpi.date, purchaseDateTime.toISOString().split('T')[0])
                  )
                )
                .orderBy(desc(ukHpi.date))
                .limit(1);

              if (historicalHpi.length > 0) {
                const historicalPrice = parseFloat(historicalHpi[0].averagePrice || '0');
                if (historicalPrice > 0 && hpiBasePrice > 0) {
                  hpiUpliftFactor = hpiBasePrice / historicalPrice;
                  hpiAdjustedValue = purchasePriceNum * hpiUpliftFactor;
                  usesPurchaseData = true;
                  
                  console.log(`Historical HPI (${historicalHpi[0].date}): £${historicalPrice.toLocaleString()}`);
                  console.log(`Current HPI (${hpi.date}): £${hpiBasePrice.toLocaleString()}`);
                  console.log(`HPI Uplift: ${((hpiUpliftFactor - 1) * 100).toFixed(2)}%`);
                }
              }
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
      
      // Enhanced calculation logging for validation
      console.log('=== VALUATION CALCULATION BREAKDOWN ===');
      console.log(`HPI Base Price (${hpi.regionName}): £${hpiBasePrice.toLocaleString()}`);
      console.log(`HPI Adjusted Value: £${hpiAdjustedValue.toLocaleString()}`);
      console.log(`HPI Uplift Factor: ${hpiUpliftFactor.toFixed(3)}`);
      if (purchasePrice && purchaseDate) {
        console.log(`Purchase Price: £${purchasePrice.toLocaleString()} on ${purchaseDate}`);
        const purchaseUplift = hpiAdjustedValue - purchasePrice;
        const purchaseUpliftPct = (purchaseUplift / purchasePrice) * 100;
        console.log(`Purchase Uplift: £${purchaseUplift.toLocaleString()} (${purchaseUpliftPct.toFixed(1)}%)`);
      }
      console.log(`Comparables Found: ${comparables.length}`);
      
      let explainability = {
        hpiBaseline: hpiBasePrice,
        hpiUpliftFactor: hpiUpliftFactor,
        purchasePrice: purchasePrice || null,
        comparablesFound: comparables.length,
        method: 'HPI baseline calculation'
      };

      // If we have comparables, use different logic based on whether we have purchase data
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

          if (usesPurchaseData) {
            // When we have purchase data with HPI uplift, use that as primary estimate
            // Only validate against comparables for reasonableness
            finalEstimate = Math.round(hpiAdjustedValue);
            method = 'PURCHASE_HPI_ADJUSTED';
            
            // Range based on reasonable spread around estimate
            const rangeFactor = 0.10; // ±10% around our estimate
            range = {
              min: Math.round(finalEstimate * (1 - rangeFactor)),
              max: Math.round(finalEstimate * (1 + rangeFactor))
            };
            
            // Ensure range makes logical sense (min < max)
            if (range.min >= range.max) {
              range = {
                min: Math.round(finalEstimate * 0.9),
                max: Math.round(finalEstimate * 1.1)
              };
            }
            
            console.log('--- PURCHASE + HPI CALCULATION ---');
            console.log(`Purchase Price HPI-Adjusted: £${finalEstimate.toLocaleString()}`);
            console.log(`Comparable Range: £${compMin.toLocaleString()} - £${compMax.toLocaleString()}`);
            console.log(`Comparable Average: £${compAverage.toLocaleString()}`);
            console.log(`Final Range: £${range.min.toLocaleString()} - £${range.max.toLocaleString()}`);
            
          } else {
            // No purchase data, blend HPI regional baseline with local comparables
            const compComponent = compAverage * 0.7;
            const hpiComponent = hpiBasePrice * 0.3;
            finalEstimate = Math.round(compComponent + hpiComponent);
            method = 'HPI_PLUS_COMPS';
            
            range = { 
              min: Math.round(Math.min(compMin, finalEstimate * 0.9)),
              max: Math.round(Math.max(compMax, finalEstimate * 1.1))
            };
            
            console.log('--- BLENDED CALCULATION ---');
            console.log(`Raw Comparable Prices: [${compPrices.map(p => '£' + p.toLocaleString()).join(', ')}]`);
            console.log(`Trimmed Prices (${start}-${end}): [${trimmedPrices.map(p => '£' + p.toLocaleString()).join(', ')}]`);
            console.log(`Comparable Average: £${compAverage.toLocaleString()}`);
            console.log(`Comparable Component (70%): £${compComponent.toLocaleString()}`);
            console.log(`HPI Baseline Component (30%): £${hpiComponent.toLocaleString()}`);
            console.log(`Final Blended Estimate: £${finalEstimate.toLocaleString()}`);
          }
          
          console.log(`Valuation Range: £${range.min.toLocaleString()} - £${range.max.toLocaleString()}`);
          
          explainability = {
            ...explainability,
            method: usesPurchaseData ? 'Purchase price adjusted by HPI growth' : 'Blended: 70% comparable sales + 30% HPI baseline',
            blendedResult: finalEstimate,
            comparableAverage: compAverage,
            usesPurchaseData: usesPurchaseData
          };
        }
      }

      // Ensure we have a reasonable range for HPI_ONLY
      if (method === 'HPI_ONLY') {
        const volatility = Math.abs(parseFloat(hpi.yearlyChangePercent || '0'));
        const rangeFactor = volatility > 10 ? 0.10 : 0.075; // ±10% if volatile, ±7.5% otherwise
        range = {
          min: Math.round(finalEstimate * (1 - rangeFactor)),
          max: Math.round(finalEstimate * (1 + rangeFactor))
        };
        
        console.log('--- HPI-ONLY CALCULATION ---');
        console.log(`Market Volatility: ${volatility.toFixed(1)}% YoY`);
        console.log(`Range Factor: ±${(rangeFactor * 100).toFixed(1)}%`);
        console.log(`Final Range: £${range.min.toLocaleString()} - £${range.max.toLocaleString()}`);
      }
      
      console.log('=== CALCULATION COMPLETE ===');

      // Calculate confidence score (0-5, mapped to Low/Med/High)
      let confidenceScore = 0;
      
      // +1 if type-specific index used
      if (propertyType && ['detached', 'semi-detached', 'terraced', 'flat'].includes(propertyType.toLowerCase())) {
        confidenceScore += 1;
      }
      
      // +1 if median comp age ≤ 9 months
      if (comparables.length > 0) {
        const avgCompAge = comparables.reduce((sum, comp) => {
          const monthsAgo = (Date.now() - new Date(comp.dateOfTransfer).getTime()) / (1000 * 60 * 60 * 24 * 30);
          return sum + monthsAgo;
        }, 0) / comparables.length;
        if (avgCompAge <= 9) confidenceScore += 1;
      }
      
      // +1 if ≥3 comps (+1 again if ≥5)
      if (comparables.length >= 3) confidenceScore += 1;
      if (comparables.length >= 5) confidenceScore += 1;
      
      // +1 if sales volume is healthy (simplified)
      if (parseFloat(hpi.salesVolume?.toString() || '0') > 100) confidenceScore += 1;
      
      const confidence = confidenceScore <= 1 ? 'Low' : confidenceScore <= 3 ? 'Medium' : 'High';
      
      // Generate drivers (3-5 bullet points)
      const drivers = [];
      const yoyChange = parseFloat(hpi.yearlyChangePercent || '0');
      drivers.push(`Regional prices ${yoyChange >= 0 ? '+' : ''}${yoyChange.toFixed(1)}% YoY (${hpi.regionName})`);
      
      if (propertyType) {
        drivers.push(`Using ${propertyType.toLowerCase()} HPI series for uplift`);
      }
      
      if (comparables.length > 0) {
        const avgCompPrice = Math.round(comparables.reduce((sum, c) => sum + parseFloat(c.price || '0'), 0) / comparables.length);
        drivers.push(`${comparables.length} recent nearby sales in ${postcodePrefix}** (avg £${(avgCompPrice / 1000).toFixed(0)}k)`);
        
        if (method === 'HPI_PLUS_COMPS') {
          drivers.push(`Blend 70% comps / 30% HPI`);
        }
      }
      
      if (purchasePrice && purchaseDate) {
        const changeSincePurchase = finalEstimate - parseFloat(purchasePrice.toString());
        const changePercent = (changeSincePurchase / parseFloat(purchasePrice.toString())) * 100;
        drivers.push(`${changeSincePurchase >= 0 ? '↑' : '↓'} £${Math.abs(Math.round(changeSincePurchase / 1000))}k (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(1)}%) since purchase`);
      }

      // Format comparables for response (max 5)
      const formattedComparables = comparables.slice(0, 5).map(comp => ({
        address: `${comp.primaryAddressableName || ''} ${comp.secondaryAddressableName || ''} ${comp.street || ''}`.trim(),
        date: comp.dateOfTransfer,
        price: parseFloat(comp.price || '0'),
        distance: '< 0.5 miles', // Simplified for demo
        type: comp.propertyType,
        note: comp.street === comparables[0]?.street ? 'same street' : 'nearby'
      }));

      // Market trend data for 5-year HPI
      const trendQuery = await db.select()
        .from(ukHpi)
        .where(eq(ukHpi.regionName, hpi.regionName))
        .orderBy(desc(ukHpi.date))
        .limit(60); // Last 5 years monthly data
      
      const trendData = trendQuery.map(row => ({
        date: row.date,
        index: parseFloat(row.indexSa || row.index || '100'),
        yoyChange: parseFloat(row.yearlyChangePercent || '0'),
        averagePrice: parseFloat(row.averagePrice || '0'),
        detachedIndex: parseFloat(row.detachedIndex || '0'),
        semiDetachedIndex: parseFloat(row.semiDetachedIndex || '0'),
        terracedIndex: parseFloat(row.terracedIndex || '0'),
        flatIndex: parseFloat(row.flatIndex || '0'),
        monthlyChange: parseFloat(row.monthlyChangePercent || '0'),
        salesVolume: parseFloat(row.salesVolume?.toString() || '0')
      }));

      // Debug: Log the first data point to understand what's available
      if (trendData.length > 0) {
        console.log('HPI trend data sample:', {
          region: hpi.regionName,
          samplePoint: trendData[0],
          totalPoints: trendData.length,
          hasDetachedData: trendData.some(d => d.detachedIndex > 0),
          hasAveragePrice: trendData.some(d => d.averagePrice > 0),
          dateRange: `${trendData[trendData.length - 1]?.date} to ${trendData[0]?.date}`,
          valuationRange: range
        });
      }

      // Calculate confidence score for charts
      let chartConfidenceScore = 0;
      if (propertyType && ['detached', 'semi-detached', 'terraced', 'flat'].includes(propertyType.toLowerCase())) {
        chartConfidenceScore += 1;
      }
      if (trendData.length > 0) {
        const salesVolumes = trendData.map(d => d.salesVolume).filter(v => v > 0);
        if (salesVolumes.length > 0) {
          const medianSales = salesVolumes.sort((a, b) => a - b)[Math.floor(salesVolumes.length / 2)];
          if (trendData[0].salesVolume >= medianSales) chartConfidenceScore += 1;
        }
      }
      if (Math.abs(parseFloat(hpi.yearlyChangePercent || '0')) < 10) chartConfidenceScore += 1;
      if (purchaseDate) chartConfidenceScore += 1;
      chartConfidenceScore += 1; // geography match simplified

      const chartConfidence = chartConfidenceScore <= 1 ? 'Low' : chartConfidenceScore <= 3 ? 'Medium' : 'High';

      const enhancedValuation = {
        valuation: {
          estimate: Math.round(finalEstimate),
          range,
          method,
          confidence
        },
        drivers,
        trend: {
          geography: hpi.regionName,
          yoyChange: yoyChange,
          series: propertyType || 'All Types',
          data: trendData,
          chartConfidence,
          chartConfidenceScore
        },
        comparables: formattedComparables,
        purchase: purchasePrice && purchaseDate ? {
          originalPrice: parseFloat(purchasePrice.toString()),
          purchaseDate,
          purchaseYear: new Date(purchaseDate).getFullYear(),
          purchaseMonth: new Date(purchaseDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
          upliftFactor: hpiUpliftFactor,
          changeSincePurchase: finalEstimate - parseFloat(purchasePrice.toString()),
          changePercent: ((finalEstimate - parseFloat(purchasePrice.toString())) / parseFloat(purchasePrice.toString())) * 100,
          yearsOwned: Math.round((Date.now() - new Date(purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25) * 10) / 10
        } : null,
        notes: [
          method === 'HPI_ONLY' ? 'Valuation based on regional HPI trends only' : 'Valuation blends local comparable sales with regional HPI data',
          `Based on ${hpi.regionName} HPI data from ${hpi.date}`,
          comparables.length === 0 ? 'No recent local sales found in demo dataset' : `Found ${comparables.length} comparable sales in area`
        ],
        metadata: {
          address: `${postcode}`, // Will be enhanced with full address
          propertyType: propertyType || 'Unknown',
          postcodeSector: postcodePrefix,
          timestamp: new Date().toISOString(),
          methodBadge: method === 'HPI_PLUS_COMPS' ? 'HPI + Comparables' : 'HPI Only',
          hpiRegion: hpi.regionName,
          hpiAreaCode: hpi.areaCode,
          hpiDataDate: hpi.date,
          postcodeMapped: `${postcodePrefix} → ${hpi.regionName} (${hpi.areaCode})`
        },
        // Add calculation debugging information
        calculationDetails: {
          hpiBasePrice,
          hpiAdjustedValue,
          hpiUpliftFactor,
          finalEstimate,
          method,
          autoDetectedPurchase: !!(purchasePrice && !requestPurchasePrice),
          inputPurchasePrice: requestPurchasePrice,
          detectedPurchasePrice: purchasePrice,
          comparablesCount: comparables.length,
          explainability
        }
      };

      // Log complete valuation summary for validation
      console.log('=== FINAL VALUATION SUMMARY ===');
      console.log(`Final Estimate: £${Math.round(finalEstimate).toLocaleString()}`);
      console.log(`Method: ${method}`);
      console.log(`Range: £${range.min.toLocaleString()} - £${range.max.toLocaleString()}`);
      console.log(`Purchase Auto-Detected: ${!!(purchasePrice && !requestPurchasePrice)}`);
      console.log(`Confidence: ${confidence}`);
      console.log('================================');

      // Cache the result
      valuationCache.set(cacheKey, {
        data: enhancedValuation,
        timestamp: Date.now()
      });

      res.json(enhancedValuation);
    } catch (error) {
      console.error('Property valuation error:', error);
      res.status(500).json({ message: 'Failed to generate property valuation' });
    }
  });

  // Art Valuation Configuration
  app.get('/api/art-valuation-config', async (req, res) => {
    try {
      const appUrl = process.env.ART_VALUATION_APP_URL;
      if (appUrl) {
        res.json({ appUrl });
      } else {
        res.status(404).json({ message: 'Art valuation app URL not configured' });
      }
    } catch (error) {
      console.error('Failed to get art valuation config:', error);
      res.status(500).json({ message: 'Failed to get configuration' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
