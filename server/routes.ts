import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { and, like, eq, gte, desc } from "drizzle-orm";
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

  app.get('/api/uk-hpi/valuation-estimate', async (req, res) => {
    try {
      const { regionName, propertyType, postcode } = req.query;
      
      if (!regionName && !postcode) {
        return res.status(400).json({ message: 'Region name or postcode required' });
      }
      
      let whereCondition;
      if (postcode) {
        // Try to match region by postcode prefix - simplified approach
        const postcodePrefix = (postcode as string).split(' ')[0];
        whereCondition = like(ukHpi.regionName, `%${postcodePrefix}%`);
      } else {
        whereCondition = like(ukHpi.regionName, `%${regionName}%`);
      }
      
      const latestData = await db.select()
        .from(ukHpi)
        .where(whereCondition)
        .orderBy(desc(ukHpi.date))
        .limit(1);
      
      if (latestData.length === 0) {
        return res.status(404).json({ message: 'No market data found for location' });
      }
      
      const data = latestData[0];
      let basePrice = parseFloat(data.averagePrice || '0');
      
      // Adjust price based on property type
      if (propertyType) {
        switch (propertyType.toLowerCase()) {
          case 'detached':
            basePrice = parseFloat(data.detachedPrice || data.averagePrice || '0');
            break;
          case 'semi-detached':
            basePrice = parseFloat(data.semiDetachedPrice || data.averagePrice || '0');
            break;
          case 'terraced':
            basePrice = parseFloat(data.terracedPrice || data.averagePrice || '0');
            break;
          case 'flat':
          case 'apartment':
            basePrice = parseFloat(data.flatPrice || data.averagePrice || '0');
            break;
          default:
            basePrice = parseFloat(data.averagePrice || '0');
        }
      }
      
      // Calculate confidence range (±10% for estimation)
      const lowerEstimate = Math.round(basePrice * 0.9);
      const upperEstimate = Math.round(basePrice * 1.1);
      
      const valuation = {
        estimatedValue: {
          lower: lowerEstimate,
          upper: upperEstimate,
          average: Math.round(basePrice)
        },
        marketData: {
          regionName: data.regionName,
          averagePrice: parseFloat(data.averagePrice || '0'),
          monthlyChange: parseFloat(data.monthlyChangePercent || '0'),
          yearlyChange: parseFloat(data.yearlyChangePercent || '0'),
          salesVolume: data.salesVolume,
          date: data.date
        },
        propertyTypeData: propertyType ? {
          type: propertyType,
          averagePrice: basePrice,
          monthlyChange: getPropertyTypeChange(data, propertyType),
          yearlyChange: getPropertyTypeYearlyChange(data, propertyType)
        } : null
      };
      
      res.json(valuation);
    } catch (error) {
      console.error('Valuation estimate error:', error);
      res.status(500).json({ message: 'Failed to generate valuation estimate' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
