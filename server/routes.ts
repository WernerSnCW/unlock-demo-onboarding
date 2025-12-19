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
  ukHpi,
  postcodeLadMapping,
  investors,
  investorPreferences
} from "@shared/schema";
import { marketDataService } from "./services/marketData.js";
import { computeGap, type GapRequest } from './lib/gap/computeGap';
import { buildWhy, type WhyContext } from './lib/gap/why';
import { SCENARIO_LABELS } from './config/scenarios';
import { type SimV2Request } from './lib/simulate/engine_v2';
import { buildActions, type ActionsRequest } from './lib/actions/engine';
import { analyzeOnboarding, type Intake } from './services/analysis';
import { getPolicy } from './services/policy';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

let openaiInstance: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable to use AI-powered features.');
    }
    openaiInstance = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiInstance;
}

const openai = { 
  get chat() { return getOpenAI().chat; },
  get images() { return getOpenAI().images; },
  get audio() { return getOpenAI().audio; },
  get completions() { return getOpenAI().completions; },
  get embeddings() { return getOpenAI().embeddings; }
};

// Persona ID to name mapping (matches client/src/data/personas.ts)
const PERSONA_ID_TO_NAME: Record<string, string> = {
  "P001": "The Retirement Planner",
  "P002": "The Property Lover", 
  "P003": "Alternatives Focused",
  "P004": "The Old Fashioned Saver",
  "P005": "Legacy & HNW Planner",
  "P006": "The Tech Worker",
  "P007": "The Dividend Seeker",
  "P008": "The Young Professional",
  "P009": "The Global Nomad",
  "P010": "The Financial Advisor",
  "P011": "The ISA/SIPP Maximiser",
  "P012": "The Defined Benefit Heavy",
  "P013": "The Cautious Accumulator",
  "P014": "The High Net Worth Inheritor",
  "P015": "The Entrepreneur",
  "P016": "The BTL Mogul",
  "P017": "The Pension Drawdown Specialist",
  "P018": "The Concentrated Stock Holder",
  "P019": "The Ultra-Conservative Saver"
};

// Simplified persona data (key traits for interpretation) - mapped by persona name
const PERSONA_TRAITS: Record<string, any> = {
  "The Retirement Planner": { liquidityMonths: 9, concentrationTolerance: "med", notes: "Pension-focused diversified", propertyBias: 0.30, techBias: 0.30, altBias: 0.25 },
  "The Property Lover": { liquidityMonths: 6, concentrationTolerance: "high", notes: "78% property tilt", propertyBias: 0.85, techBias: 0.10, altBias: 0.15 },
  "Alternatives Focused": { liquidityMonths: 2, concentrationTolerance: "high", notes: "51% crypto; tech heavy", propertyBias: 0.05, techBias: 0.70, altBias: 0.45 },
  "The Old Fashioned Saver": { liquidityMonths: 10, concentrationTolerance: "low", notes: "Cash/Bonds/Dividend focus", propertyBias: 0.20, techBias: 0.10, altBias: 0.10 },
  "Legacy & HNW Planner": { liquidityMonths: 9, concentrationTolerance: "med", notes: "Alt investments & estate planning", propertyBias: 0.50, techBias: 0.30, altBias: 0.40 },
  "The Tech Worker": { liquidityMonths: 4, concentrationTolerance: "med", notes: "Company stock concentration", propertyBias: 0.15, techBias: 0.80, altBias: 0.25 },
  "The Dividend Seeker": { liquidityMonths: 6, concentrationTolerance: "med", notes: "UK dividend tilt; REITs", propertyBias: 0.35, techBias: 0.15, altBias: 0.15 },
  "The Young Professional": { liquidityMonths: 3, concentrationTolerance: "med", notes: "Indexing + small spec", propertyBias: 0.15, techBias: 0.55, altBias: 0.10 },
  "The Global Nomad": { liquidityMonths: 6, concentrationTolerance: "med", notes: "Currency mgmt; global funds", propertyBias: 0.25, techBias: 0.35, altBias: 0.20 },
  "The Financial Advisor": { liquidityMonths: 6, concentrationTolerance: "med", notes: "Pro diversification incl alts", propertyBias: 0.35, techBias: 0.35, altBias: 0.35 }
};

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
  // IMPORTANT: Specific routes must come before parameterized routes
  app.get('/api/investors/all-preferences', async (req, res) => {
    try {
      const allPreferences = await storage.getAllInvestorPreferences();
      res.json(allPreferences);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch all preferences' });
    }
  });

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

  // Wizard preferences endpoint - saves complete wizard data
  app.post('/api/investors/wizard-preferences', async (req, res) => {
    try {
      console.log('Received wizard data:', req.body);
      const { investorName, activeInvestmentInterests, learningCuriosityAreas, geographicPreferences, completedAt, completionMethod } = req.body;
      
      if (!investorName) {
        return res.status(400).json({ message: 'Investor name is required' });
      }

      // Check if investor already exists, otherwise create new userId
      const existingRecords = await db.select().from(investorPreferences).where(eq(investorPreferences.investorName, investorName));
      const userId = existingRecords.length > 0 ? existingRecords[0].userId : `demo-${Date.now()}`;
      
      // Map frontend field names to backend field names
      const dataToSave = {
        userId,
        investorName,
        activeInvestmentInterests: activeInvestmentInterests || [],
        learningCuriosityAreas: learningCuriosityAreas || [],
        geographicPreferences: geographicPreferences || [],
        wizardCompletedAt: completedAt ? new Date(completedAt) : new Date(),
        completionMethod: completionMethod || 'manual' // Track auto vs manual completion
      };
      
      console.log('Completion method extracted:', completionMethod);
      
      console.log('Data to save:', dataToSave);
      
      const preferences = await storage.upsertInvestorPreferences(dataToSave);
      res.json({ 
        success: true, 
        userId,
        preferences,
        message: `Wizard preferences saved successfully for ${investorName}` 
      });
    } catch (error) {
      console.error('Wizard preferences save error:', error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: 'Invalid wizard data', errors: error });
      }
      res.status(500).json({ message: 'Failed to save wizard preferences' });
    }
  });

  // Quiz data endpoint - saves persona quiz results
  app.post('/api/investors/quiz-data', async (req, res) => {
    try {
      console.log('Received quiz data:', req.body);
      const { investorName, quizAnswers, matchedPersonaCode, personaMatchScore, completionMethod } = req.body;
      
      if (!investorName) {
        return res.status(400).json({ message: 'Investor name is required' });
      }

      if (!matchedPersonaCode) {
        return res.status(400).json({ message: 'Matched persona code is required' });
      }

      // Find existing record for this investor, otherwise create new userId
      const existingRecords = await db.select().from(investorPreferences).where(eq(investorPreferences.investorName, investorName));
      const userId = existingRecords.length > 0 ? existingRecords[0].userId : `demo-${Date.now()}`;
      
      // Prepare quiz data to save
      const dataToSave = {
        userId,
        investorName,
        quizAnswers: JSON.stringify(quizAnswers || []),
        matchedPersonaCode,
        personaMatchScore: personaMatchScore || 0,
        quizCompletedAt: new Date(),
        completionMethod: completionMethod || 'manual'
      };
      
      console.log('Quiz data to save:', dataToSave);
      
      const preferences = await storage.upsertInvestorPreferences(dataToSave);
      res.json({ 
        success: true, 
        userId,
        preferences,
        message: `Quiz data saved successfully for ${investorName}` 
      });
    } catch (error) {
      console.error('Quiz data save error:', error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: 'Invalid quiz data', errors: error });
      }
      res.status(500).json({ message: 'Failed to save quiz data' });
    }
  });

  // GET belief responses for a specific user
  app.get('/api/investors/:userId/belief-responses', async (req, res) => {
    try {
      const userId = req.params.userId;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      const [preferences] = await db
        .select()
        .from(investorPreferences)
        .where(eq(investorPreferences.userId, userId));

      if (!preferences) {
        return res.status(404).json({ message: 'User preferences not found' });
      }

      // Parse scenario weights from database, but only for selected scenarios
      let scenarioWeights: Record<string, number> = {};
      
      // First get the selected scenarios
      let selectedScenarios: string[] = [];
      if (preferences.selectedScenarios) {
        try {
          selectedScenarios = JSON.parse(preferences.selectedScenarios as string);
        } catch (parseError) {
          console.error('Error parsing selected scenarios:', parseError);
        }
      }
      
      // Now get weights only for the selected scenarios
      if (preferences.scenarioWeights && selectedScenarios.length > 0) {
        try {
          const weights = JSON.parse(preferences.scenarioWeights as string);
          // Convert from array format to object format, but only for selected scenarios
          if (Array.isArray(weights)) {
            const filteredWeights: Record<string, number> = {};
            let totalWeight = 0;
            
            // First pass: collect weights for selected scenarios only
            for (const item of weights) {
              if (item.scenario && typeof item.normalizedWeight === 'number' && 
                  selectedScenarios.includes(item.scenario)) {
                filteredWeights[item.scenario] = item.normalizedWeight;
                totalWeight += item.normalizedWeight;
              }
            }
            
            // Renormalize the weights to sum to 1.0
            if (totalWeight > 0) {
              scenarioWeights = {};
              for (const [scenario, weight] of Object.entries(filteredWeights)) {
                scenarioWeights[scenario] = weight / totalWeight;
              }
            }
          }
        } catch (parseError) {
          console.error('Error parsing scenario weights:', parseError);
        }
      }

      res.json({
        userId: preferences.userId,
        scenarioWeights,
        beliefResponsesCompletedAt: preferences.beliefResponsesCompletedAt
      });

    } catch (error) {
      console.error('Error fetching belief responses:', error);
      res.status(500).json({ message: 'Failed to fetch belief responses' });
    }
  });

  // Belief responses endpoint - saves economic beliefs questionnaire results
  app.post('/api/investors/belief-responses', async (req, res) => {
    try {
      console.log('Received belief responses:', req.body);
      const { userId, investorName, beliefResponses, selectedScenarios, scenarioWeights, completionMethod } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      if (!investorName) {
        return res.status(400).json({ message: 'Investor name is required' });
      }

      // Use the provided userId to update existing record
      const dataToSave = {
        userId,
        investorName,
        beliefResponses: JSON.stringify(beliefResponses || []),
        selectedScenarios: JSON.stringify(selectedScenarios || []),
        scenarioWeights: JSON.stringify(scenarioWeights || []),
        beliefsCompletedAt: new Date(),
        completionMethod: completionMethod || 'manual'
      };
      
      console.log('Belief data to save:', dataToSave);
      
      const preferences = await storage.upsertInvestorPreferences(dataToSave);
      res.json({ 
        success: true, 
        userId,
        preferences,
        message: `Belief responses saved successfully for ${investorName}` 
      });
    } catch (error) {
      console.error('Belief responses save error:', error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: 'Invalid belief data', errors: error });
      }
      res.status(500).json({ message: 'Failed to save belief responses' });
    }
  });

  // Actual portfolio endpoint - saves user's actual portfolio allocation
  app.post('/api/investors/actual-portfolio', async (req, res) => {
    try {
      console.log('Received actual portfolio data:', req.body);
      const { userId, investorName, portfolioValue, allocations } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      if (!investorName) {
        return res.status(400).json({ message: 'Investor name is required' });
      }

      if (!portfolioValue || portfolioValue <= 0) {
        return res.status(400).json({ message: 'Valid portfolio value is required' });
      }

      if (!allocations) {
        return res.status(400).json({ message: 'Portfolio allocations are required' });
      }

      // Use the provided userId to update existing record
      const dataToSave = {
        userId,
        investorName,
        actualPortfolioValue: portfolioValue,
        actualPortfolioAllocations: JSON.stringify(allocations),
        actualPortfolioCompletedAt: new Date(),
        completionMethod: 'manual'
      };
      
      console.log('Actual portfolio data to save:', dataToSave);
      
      const preferences = await storage.upsertInvestorPreferences(dataToSave);
      res.json({ 
        success: true, 
        userId,
        preferences,
        message: `Actual portfolio saved successfully for ${investorName}` 
      });
    } catch (error) {
      console.error('Actual portfolio save error:', error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: 'Invalid portfolio data', errors: error });
      }
      res.status(500).json({ message: 'Failed to save actual portfolio' });
    }
  });

  // Recommended portfolio endpoint - saves user's recommended portfolio allocation from targetMix
  app.post('/api/investors/recommended-portfolio', async (req, res) => {
    try {
      console.log('Received recommended portfolio data:', req.body);
      const { userId, investorName, targetMix } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      if (!investorName) {
        return res.status(400).json({ message: 'Investor name is required' });
      }

      if (!targetMix) {
        return res.status(400).json({ message: 'Target allocation mix is required' });
      }

      // Use the provided userId to update existing record
      const dataToSave = {
        userId,
        investorName,
        recommendedPortfolioAllocations: JSON.stringify(targetMix),
        recommendedPortfolioCompletedAt: new Date(),
        completionMethod: 'manual'
      };
      
      console.log('Recommended portfolio data to save:', dataToSave);
      
      const preferences = await storage.upsertInvestorPreferences(dataToSave);
      res.json({ 
        success: true, 
        userId,
        preferences,
        message: `Recommended portfolio saved successfully for ${investorName}` 
      });
    } catch (error) {
      console.error('Recommended portfolio save error:', error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: 'Invalid recommended portfolio data', errors: error });
      }
      res.status(500).json({ message: 'Failed to save recommended portfolio' });
    }
  });

  // Action Plans endpoint - saves investment playbook and actions
  app.post('/api/action-plans', async (req, res) => {
    try {
      console.log('Received action plan data:', req.body);
      const { userId, investorName, playbook, stage1Actions, stage2Actions, summary, generatedAt } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      // Store action plan data with proper timestamp conversion
      const completedAt = generatedAt ? new Date(generatedAt) : new Date();
      const actionPlanData = {
        userId,
        investorName: investorName || 'Unknown',
        playbook: JSON.stringify(playbook),
        stage1Actions: JSON.stringify(stage1Actions),
        stage2Actions: JSON.stringify(stage2Actions), 
        summary: JSON.stringify(summary),
        actionPlanCompletedAt: completedAt,
        completionMethod: 'manual'
      };

      // Update or create investor record with action plan data
      await storage.updateInvestorActionPlan(actionPlanData);
      
      console.log('Action plan data saved successfully for userId:', userId);
      res.status(200).json({ 
        success: true, 
        userId: userId,
        message: 'Action plan saved successfully'
      });
    } catch (error) {
      console.error('Error saving action plan:', error);
      res.status(500).json({ error: 'Failed to save action plan', details: error.message });
    }
  });

  // Portfolio Target Generation API endpoint
  app.post('/api/target', async (req, res) => {
    try {
      console.log('Target API called with request:', req.body);
      const { buildTarget } = await import('./lib/recommend/targetEngine');
      const { buildNarrative } = await import('./lib/recommend/narrate');
      const targetRequest = req.body;
      
      // Validate required fields
      if (!targetRequest.personaId) {
        return res.status(400).json({ message: 'personaId is required' });
      }
      
      if (!targetRequest.scenarioWeights) {
        return res.status(400).json({ message: 'scenarioWeights is required' });
      }
      
      console.log('Building target with request:', targetRequest);
      const result = buildTarget(targetRequest);
      console.log('Target generation result:', result);
      
      // Generate narrative commentary
      const narrative = buildNarrative(result);
      
      res.json({ ...result, narrative });
      
    } catch (error) {
      console.error('Target generation error:', error);
      res.status(500).json({ 
        message: 'Failed to generate target portfolio',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Enhanced Gap Analysis endpoint - compares current vs target portfolio allocation with belief alignment
  app.post('/api/gap', async (req, res) => {
    try {
      const { 
        currentMix, 
        targetMix, 
        riskProfile, 
        drawdownCap, 
        scenarioWeights,
        personaLabel,
        investorName 
      } = req.body;

      if (!currentMix || !targetMix) {
        return res.status(400).json({ error: "currentMix and targetMix are required" });
      }

      // Build the gap request with enhanced parameters
      const gapRequest: GapRequest = {
        currentMix,
        targetMix,
        riskProfile,
        drawdownCap,
        scenarioWeights
      };

      // Compute the enhanced gap analysis
      const gapResult = computeGap(gapRequest);

      // Generate scenario label for commentary
      let scenarioLabel: string | undefined;
      if (scenarioWeights && Object.keys(scenarioWeights).length > 0) {
        const activeScenarios = Object.entries(scenarioWeights)
          .filter(([_, weight]) => (weight as number) > 0.001)
          .sort(([_, a], [__, b]) => (b as number) - (a as number))
          .slice(0, 3) // Top 3 scenarios
          .map(([id, weight]) => `${Math.round((weight as number) * 100)}% ${SCENARIO_LABELS[id] || id}`);
        
        if (activeScenarios.length > 0) {
          scenarioLabel = activeScenarios.join(' / ');
        }
      }

      // Build why commentary
      const whyContext: WhyContext = {
        personaLabel: personaLabel || investorName || "Investor",
        scenarioLabel
      };

      const whyBullets = buildWhy(gapResult, whyContext);

      // Enhanced response
      const enhancedResult = {
        ...gapResult,
        commentary: {
          whyBullets,
          scenarioLabel,
          personaLabel: whyContext.personaLabel
        }
      };

      return res.json(enhancedResult);
    } catch (e: any) {
      console.error('Gap analysis error:', e);
      return res.status(500).json({ error: "Internal error", details: e.message });
    }
  });

  // Scenario Impact Analysis endpoint - shows portfolio impact if user's scenarios come true
  app.post('/api/scenario-impact', async (req, res) => {
    try {
      const { currentMix, scenarioWeights, portfolioValueGBP } = req.body;
      
      if (!currentMix || !scenarioWeights || !portfolioValueGBP) {
        return res.status(400).json({ 
          error: "currentMix, scenarioWeights, and portfolioValueGBP are required" 
        });
      }

      // Load scenarios data
      const { scenarios, LEGACY_SCENARIO_IDS } = await import('./data/scenarios');
      
      // Calculate cumulative scenario impact - ALL selected scenarios happen together
      let cumulativePortfolioReturn = 0;
      const selectedScenarios: any[] = [];
      const scenarioBreakdown: any[] = [];
      
      // Identify selected scenarios (weight > 0) and get their full impacts
      for (const [scenarioId, weight] of Object.entries(scenarioWeights)) {
        // Map legacy scenario names to display names
        const mappedScenarioName = LEGACY_SCENARIO_IDS[scenarioId] || scenarioId;
        const scenario = scenarios[mappedScenarioName];
        if (!scenario || weight <= 0) continue;
        
        selectedScenarios.push(scenario);
        
        // Calculate portfolio return under this scenario (full strength)
        let scenarioPortfolioReturn = 0;
        for (const [assetClass, allocation] of Object.entries(currentMix)) {
          const scenarioReturn = scenario.mu[assetClass] || 0;
          scenarioPortfolioReturn += (allocation as number) * scenarioReturn;
        }
        
        // Calculate asset-level impacts for this individual scenario
        const scenarioAssetImpacts: any[] = [];
        for (const [assetClass, allocation] of Object.entries(currentMix)) {
          const scenarioReturn = scenario.mu[assetClass] || 0;
          const assetValueChange = portfolioValueGBP * (allocation as number) * scenarioReturn;
          
          scenarioAssetImpacts.push({
            assetClass,
            currentAllocation: allocation as number,
            scenarioReturn,
            valueChange: assetValueChange,
            currentValue: portfolioValueGBP * (allocation as number),
            projectedValue: portfolioValueGBP * (allocation as number) * (1 + scenarioReturn)
          });
        }
        
        // Store individual scenario impact for breakdown
        scenarioBreakdown.push({
          scenarioId,
          scenarioName: scenario.name,
          isSelected: true,
          portfolioReturn: scenarioPortfolioReturn,
          portfolioValueChange: portfolioValueGBP * scenarioPortfolioReturn,
          horizonYears: scenario.horizon_years,
          assetImpacts: scenarioAssetImpacts.sort((a, b) => Math.abs(b.valueChange) - Math.abs(a.valueChange))
        });
        
      }
      
      // Calculate cumulative portfolio return using compounding instead of addition
      let portfolioCompoundedReturn = 1.0;
      for (const [scenarioId, weight] of Object.entries(scenarioWeights)) {
        // Map legacy scenario names to display names
        const mappedScenarioName = LEGACY_SCENARIO_IDS[scenarioId] || scenarioId;
        const scenario = scenarios[mappedScenarioName];
        if (!scenario || weight <= 0) continue;
        
        // Calculate portfolio return under this scenario
        let scenarioPortfolioReturn = 0;
        for (const [assetClass, allocation] of Object.entries(currentMix)) {
          const scenarioReturn = scenario.mu[assetClass] || 0;
          scenarioPortfolioReturn += (allocation as number) * scenarioReturn;
        }
        
        // Compound the portfolio returns
        portfolioCompoundedReturn *= (1 + scenarioPortfolioReturn);
      }
      cumulativePortfolioReturn = portfolioCompoundedReturn - 1;
      
      const totalValueChange = Math.round((portfolioValueGBP * cumulativePortfolioReturn) * 100) / 100;
      const newPortfolioValue = Math.round((portfolioValueGBP * (1 + cumulativePortfolioReturn)) * 100) / 100;
      
      // Calculate asset-level impacts (cumulative from all selected scenarios)
      const assetImpacts: any[] = [];
      for (const [assetClass, allocation] of Object.entries(currentMix)) {
        let cumulativeAssetReturn = 0;
        
        // Compound the impact from ALL selected scenarios
        // Instead of adding returns (which is incorrect), compound them: (1+r1)*(1+r2)*(1+r3)-1
        let compoundedReturn = 1.0;
        for (const [scenarioId, weight] of Object.entries(scenarioWeights)) {
          // Map legacy scenario names to display names
          const mappedScenarioName = LEGACY_SCENARIO_IDS[scenarioId] || scenarioId;
          const scenario = scenarios[mappedScenarioName];
          if (scenario && weight > 0) {
            const scenarioReturn = scenario.mu[assetClass] || 0;
            compoundedReturn *= (1 + scenarioReturn); // Compound the returns
          }
        }
        cumulativeAssetReturn = compoundedReturn - 1; // Convert back to return format
        
        const assetValueChange = portfolioValueGBP * (allocation as number) * cumulativeAssetReturn;
        
        assetImpacts.push({
          assetClass,
          currentAllocation: allocation as number,
          cumulativeReturn: cumulativeAssetReturn,
          valueChange: assetValueChange,
          currentValue: portfolioValueGBP * (allocation as number),
          projectedValue: portfolioValueGBP * (allocation as number) * (1 + cumulativeAssetReturn)
        });
      }
      
      // Sort scenarios by impact magnitude (highest absolute value first)
      scenarioBreakdown.sort((a, b) => Math.abs(b.portfolioValueChange) - Math.abs(a.portfolioValueChange));
      
      // Sort asset impacts by magnitude of impact (absolute value)
      assetImpacts.sort((a, b) => Math.abs(b.valueChange) - Math.abs(a.valueChange));
      
      const result = {
        summary: {
          currentPortfolioValue: Math.round(portfolioValueGBP * 100) / 100,
          projectedPortfolioValue: Math.round(newPortfolioValue * 100) / 100,
          totalValueChange: Math.round(totalValueChange * 100) / 100,
          percentageChange: cumulativePortfolioReturn,
          selectedScenariosCount: selectedScenarios.length,
          analysisType: "cumulative_worst_case"
        },
        scenarioBreakdown,
        assetImpacts,
        metadata: {
          timestamp: new Date().toISOString(),
          calculationMethod: "cumulative_scenario_impact",
          description: "Shows portfolio impact if ALL selected scenarios occur simultaneously"
        }
      };
      
      // Optional debug logging (can be removed in production)
      // console.log('Selected scenarios:', Object.keys(scenarioWeights).filter(k => scenarioWeights[k] > 0));
      // console.log('Cumulative portfolio return:', cumulativePortfolioReturn);
      
      return res.json(result);
      
    } catch (error) {
      console.error('Scenario impact analysis error:', error);
      res.status(500).json({ 
        error: 'Failed to calculate scenario impact',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Portfolio Simulation endpoint
  app.post('/api/simulate', async (req, res) => {
    try {
      const { simulate } = await import('./lib/simulate/engine');
      const body = req.body;
      
      if (!body?.currentMix || !body?.targetMix || !body?.scenarioWeights) {
        return res.status(400).json({ error: "currentMix, targetMix and scenarioWeights are required" });
      }
      
      const result = simulate(body);
      
      return res.json(result);
    } catch (error) {
      console.error('Simulation error:', error);
      res.status(500).json({ 
        error: 'Failed to run simulation',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Portfolio Simulation V2 endpoint (enhanced with Monte Carlo)
  app.post('/api/simulate-v2', async (req, res) => {
    try {
      const { simulateV2 } = await import('./lib/simulate/engine_v2');
      const body = req.body as SimV2Request;
      
      if (!body?.currentMix || !body?.targetMix || !body?.scenarioWeights) {
        return res.status(400).json({ error: "currentMix, targetMix and scenarioWeights are required" });
      }
      
      const result = simulateV2(body);
      
      return res.json(result);
    } catch (error) {
      console.error('Simulation V2 error:', error);
      res.status(500).json({ 
        error: 'Failed to run enhanced simulation',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
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

  // Portfolio Interpretation endpoint
  app.post('/api/portfolio-interpretation', async (req, res) => {
    try {
      const { personaName, personaId, baseAllocation, personaAdjustedAllocation, rulesApplied } = req.body;

      // Convert persona ID to name if needed
      const actualPersonaName = personaId ? PERSONA_ID_TO_NAME[personaId] : personaName;
      
      // Look up persona traits
      const persona = PERSONA_TRAITS[actualPersonaName] || null;

      // Format allocations for the prompt
      const formatAllocation = (allocation: Record<string, number>): string => {
        return Object.entries(allocation)
          .filter(([_, value]) => value > 0.005)
          .sort(([,a], [,b]) => b - a)
          .map(([asset, weight]) => `"${asset}": ${(weight * 100).toFixed(1)}%`)
          .join(', ');
      };

      const prompt = `You are a financial explainer for non-technical UK readers. Produce short, clear, human-sounding explanations of an example portfolio that reflects a specific investor persona and their beliefs. Do not give advice or forecasts.

CRITICAL: Do not mention any economic scenarios (recession, reflation, stagflation, etc.). Focus purely on the persona's characteristics and preferences. The baseline allocation is just a starting point - ignore how it was created.

STYLE GUARDRAILS
UK English. Friendly, plain language.
Use everyday terms: shares, government bonds, high-quality corporate bonds, short-term government bonds, property funds, gold, commodities, crypto, cash.
Max 150 words total. No percentages with more than one decimal. No probabilities.

TASK
Explain this personalized portfolio allocation focusing on:
- why the portfolio choices suit this specific persona's characteristics
- the biggest changes from baseline to personalized (only the top 2–3 absolute % moves, rounded)  
- why those changes fit the persona's investment style and constraints
- what this portfolio approach offers and potential considerations

OUTPUT FORMAT: Return valid JSON with this exact structure:
{
  "overview": "Clear overview sentence explaining the portfolio approach for this persona",
  "suitability": [
    "Bullet point linking persona trait to portfolio choice",
    "Another bullet point linking persona trait to portfolio choice",
    "Optional third bullet point"
  ],
  "expectations": {
    "strengths": "What this approach offers",
    "considerations": "What to watch for"
  },
  "advice": "One optional consideration sentence",
  "disclaimer": "Illustrative example, not advice"
}

DATA:
Persona: ${persona ? `"${actualPersonaName}" - ${persona.notes}. ${persona.liquidityMonths} months liquidity needed, ${persona.concentrationTolerance} concentration tolerance. Property bias: ${persona.propertyBias}, Tech bias: ${persona.techBias}, Alt bias: ${persona.altBias}` : actualPersonaName}
Baseline allocation: [${formatAllocation(baseAllocation)}]
Personalized allocation: [${formatAllocation(personaAdjustedAllocation)}]
Persona adjustments: [${rulesApplied?.map?.((r: string) => `"${r}"`).join(', ') || 'none'}]`;

      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo", // using same model as other successful calls in the codebase
        messages: [
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      const interpretation = response.choices[0]?.message?.content || 'Unable to generate interpretation';

      res.json({ interpretation });
    } catch (error) {
      console.error('Portfolio interpretation error:', error);
      res.status(500).json({ 
        message: 'Failed to generate portfolio interpretation',
        interpretation: 'Technical issue generating interpretation. Please try again.'
      });
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
      
      // Fetch latest valuation and purchase price for each property
      const propertiesWithValuations = await Promise.all(
        properties.map(async (property) => {
          const [latestValuation, latestPurchasePrice] = await Promise.all([
            storage.getLatestPropertyValuation(property.id),
            storage.getLatestPurchasePrice(
              property.postcode, 
              property.primaryAddressableName || undefined, 
              property.street || undefined
            )
          ]);
          
          return {
            ...property,
            latestValuation: latestValuation ? {
              id: latestValuation.id,
              valueGbp: latestValuation.valueGbp,
              valuationDate: latestValuation.valuationDate,
              method: latestValuation.method,
              source: latestValuation.source,
              confidence: latestValuation.confidence,
              valuationRangeMinGbp: latestValuation.valuationRangeMinGbp,
              valuationRangeMaxGbp: latestValuation.valuationRangeMaxGbp,
              comparableCount: latestValuation.comparableCount,
              hpiBaseValueGbp: latestValuation.hpiBaseValueGbp,
              comparableAvgValueGbp: latestValuation.comparableAvgValueGbp,
              regionName: latestValuation.regionName,
              createdAt: latestValuation.createdAt
            } : null,
            latestPurchasePrice: latestPurchasePrice
          };
        })
      );
      
      res.json(propertiesWithValuations);
    } catch (error) {
      console.error('Failed to fetch properties with valuations:', error);
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

  app.post('/api/properties/:propertyId/ownerships', async (req, res) => {
    try {
      const { propertyId } = req.params;
      const validatedData = insertPropertyOwnershipSchema.parse({ ...req.body, propertyId });
      const ownership = await storage.createPropertyOwnership(validatedData);
      res.status(201).json(ownership);
    } catch (error) {
      console.error('Property ownership creation error:', error);
      res.status(500).json({ message: 'Failed to create property ownership' });
    }
  });

  app.put('/api/properties/:propertyId/ownership-price', async (req, res) => {
    try {
      const { propertyId } = req.params;
      const { acquisitionPriceGbp, acquisitionDate } = req.body;
      
      const updated = await storage.updatePropertyOwnershipPrice(propertyId, {
        acquisitionPriceGbp,
        acquisitionDate
      });
      
      if (!updated) {
        return res.status(404).json({ message: 'Property ownership not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Property ownership price update error:', error);
      res.status(500).json({ message: 'Failed to update property ownership price' });
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

      // Step 1: Get HPI baseline for the region using postcode to LAD mapping
      console.log(`Valuation request: postcode=${postcode}`);
      
      // Enhanced postcode matching - try multiple formats with intelligent fallback
      const normalizedPostcode = postcode.toUpperCase().trim();
      const spacedPostcode = normalizedPostcode.includes(' ') ? normalizedPostcode : 
        normalizedPostcode.replace(/^([A-Z]{1,2}\d{1,2}[A-Z]?)(\d[A-Z]{2})$/, '$1 $2');
      const unspacedPostcode = normalizedPostcode.replace(/\s+/g, '');
      
      console.log(`Postcode lookup variants: original="${normalizedPostcode}", spaced="${spacedPostcode}", unspaced="${unspacedPostcode}"`);
      
      // Try multiple postcode formats for exact LAD mapping
      const postcodeVariants = [normalizedPostcode, spacedPostcode, unspacedPostcode].filter((v, i, arr) => arr.indexOf(v) === i);
      let postcodeMapping: any[] = [];
      let matchedPostcode = '';
      
      for (const variant of postcodeVariants) {
        postcodeMapping = await db.select()
          .from(postcodeLadMapping)
          .where(eq(postcodeLadMapping.postcode, variant))
          .limit(1);
          
        if (postcodeMapping.length > 0) {
          matchedPostcode = variant;
          console.log(`Found exact LAD mapping using variant "${variant}": ${variant} → ${postcodeMapping[0].ladCode}`);
          break;
        }
      }
      
      let hpiData: any[] = [];
      let ladCode: string | null = null;
      
      if (postcodeMapping.length > 0) {
        ladCode = postcodeMapping[0].ladCode;
        
        // Look up HPI data using LAD code
        hpiData = await db.select()
          .from(ukHpi)
          .where(eq(ukHpi.areaCode, ladCode))
          .orderBy(desc(ukHpi.date))
          .limit(1);
          
        if (hpiData.length > 0) {
          console.log(`Found HPI data for LAD ${ladCode}: ${hpiData[0].regionName}`);
        } else {
          console.log(`No HPI data found for LAD code: ${ladCode}`);
        }
      } else {
        console.log(`No exact LAD mapping found for any postcode variant: ${postcodeVariants.join(', ')}`);
      }
      
      // Fallback strategy: try with postcode prefix if exact postcode not found
      if (hpiData.length === 0) {
        const postcodePrefix = postcode.split(' ')[0];
        console.log(`Trying fallback with postcode prefix: ${postcodePrefix}`);
        
        const prefixMapping = await db.select()
          .from(postcodeLadMapping)
          .where(like(postcodeLadMapping.postcode, `${postcodePrefix}%`))
          .limit(10);
        
        if (prefixMapping.length > 0) {
          // Try the most common LAD code for this prefix
          const ladCodes = prefixMapping.map(m => m.ladCode);
          const uniqueLadCodes = Array.from(new Set(ladCodes));
          
          for (const tryLadCode of uniqueLadCodes) {
            hpiData = await db.select()
              .from(ukHpi)
              .where(eq(ukHpi.areaCode, tryLadCode))
              .orderBy(desc(ukHpi.date))
              .limit(1);
              
            if (hpiData.length > 0) {
              ladCode = tryLadCode;
              console.log(`Fallback success: ${postcodePrefix} → LAD ${ladCode} → ${hpiData[0].regionName}`);
              break;
            }
          }
        }
      }
      
      // Final fallback: England/UK-wide data
      if (hpiData.length === 0) {
        console.log(`Final fallback: using England/UK-wide data`);
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
      const postcodePrefix = postcode.split(' ')[0]; // Extract postcode prefix for comparables search
      
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
            hpiBaseline: explainability.hpiBaseline,
            hpiUpliftFactor: explainability.hpiUpliftFactor,
            purchasePrice: explainability.purchasePrice,
            comparablesFound: explainability.comparablesFound,
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

      // Save valuation to database if propertyId is provided
      if (propertyId) {
        try {
          const comparableAverage = comparables.length > 0 ? 
            comparables.reduce((sum, c) => sum + parseFloat(c.price || '0'), 0) / comparables.length : null;
          
          const valuationData = {
            propertyId,
            valuationDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
            method: method.toLowerCase(),
            valueGbp: Math.round(finalEstimate).toString(),
            source: method === 'HPI_PLUS_COMPS' ? 'Market_Comparables' : 'UK_HPI',
            confidence: (confidenceScore / 5).toString(), // Convert 0-5 scale to 0-1 as string
            valuationRangeMinGbp: range.min.toString(),
            valuationRangeMaxGbp: range.max.toString(),
            comparableCount: comparables.length,
            hpiBaseValueGbp: hpiBasePrice.toString(),
            comparableAvgValueGbp: comparableAverage ? comparableAverage.toString() : null,
            methodDetails: JSON.stringify({
              hpiRegion: hpi.regionName,
              hpiAreaCode: hpi.areaCode,
              hpiUpliftFactor: hpiUpliftFactor,
              usesPurchaseData: usesPurchaseData,
              autoDetectedPurchase: !!(purchasePrice && !requestPurchasePrice),
              calculationBreakdown: {
                ...explainability,
                blendedResult: finalEstimate
              }
            }),
            regionCode: hpi.areaCode,
            regionName: hpi.regionName
          };

          console.log('Saving valuation to database:', valuationData);
          const savedValuation = await storage.createPropertyValuation(valuationData);
          console.log('Valuation saved successfully:', savedValuation.id);
        } catch (dbError) {
          console.error('Error saving valuation to database:', dbError);
          // Don't fail the request if database save fails - just log the error
        }
      }

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

  // Whisky Valuation Configuration
  app.get('/api/whisky-valuation-config', async (req, res) => {
    try {
      const appUrl = process.env.WHISKY_VALUATION_APP_URL;
      if (appUrl) {
        res.json({ appUrl });
      } else {
        res.status(404).json({ message: 'Whisky valuation app URL not configured' });
      }
    } catch (error) {
      console.error('Failed to get whisky valuation config:', error);
      res.status(500).json({ message: 'Failed to get configuration' });
    }
  });

  // Website Fact Checker endpoint
  app.post('/api/fact-check', async (req, res) => {
    try {
      const { FactChecker } = await import('./services/factChecker');
      const { url, options } = req.body;
      
      if (!url) {
        return res.status(400).json({ message: 'URL is required' });
      }

      // Validate URL format
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ message: 'Invalid URL format' });
      }

      // Start fact checking process
      const result = await FactChecker.checkFacts(url, options);
      res.json(result);
    } catch (error) {
      console.error('Fact checking failed:', error);
      res.status(500).json({ 
        message: 'Fact checking failed', 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Pitch Deck Analyzer endpoint
  app.post('/api/analyse-pitch-deck', async (req, res) => {
    try {
      const { PitchDeckAnalyzer, upload } = await import('./services/pitchDeckAnalyzer');
      
      // Use multer middleware for file upload handling
      upload.single('file')(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ message: err.message });
        }

        if (!req.file) {
          return res.status(400).json({ message: 'No file uploaded' });
        }

        const { sector = 'General', stage = 'Seed', geography = 'United Kingdom' } = req.body;

        const result = await PitchDeckAnalyzer.analyzePitchDeck(
          req.file.buffer,
          req.file.originalname,
          sector,
          stage,
          geography
        );

        res.json(result);
      });
    } catch (error) {
      console.error('Pitch deck analysis failed:', error);
      res.status(500).json({ 
        message: 'Pitch deck analysis failed', 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Portfolio Analysis API endpoint
  app.post('/api/portfolio/analyze', async (req, res) => {
    try {
      const { userId, portfolioData, forceRefresh = false } = req.body;

      if (!userId || !portfolioData) {
        return res.status(400).json({ message: 'User ID and portfolio data are required' });
      }

      // Check if we have cached analysis (unless force refresh is requested)
      if (!forceRefresh) {
        const [existingInvestor] = await db.select()
          .from(investors)
          .where(eq(investors.userId, userId));

        if (existingInvestor?.portfolioAnalysis && existingInvestor?.analysisUpdatedAt) {
          // Check if analysis is less than 24 hours old
          const analysisAge = Date.now() - new Date(existingInvestor.analysisUpdatedAt).getTime();
          const oneDayInMs = 24 * 60 * 60 * 1000;
          
          if (analysisAge < oneDayInMs) {
            console.log('Using cached portfolio analysis');
            const cachedAnalysis = JSON.parse(existingInvestor.portfolioAnalysis);
            return res.json(cachedAnalysis);
          }
        }
      }

      // Import OpenAI for analysis
      const OpenAI = await import('openai').then(mod => mod.default);
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      // Prepare portfolio data for LLM analysis
      const prompt = `
Analyze this investment portfolio and provide detailed insights. Focus on asset allocation, diversification, and potential overexposure risks. Provide guidance but NOT financial advice.

PORTFOLIO DATA:
Total Value: £${portfolioData.totalValue.toLocaleString()}
Asset Allocation:
- Traditional Holdings: ${portfolioData.assetAllocation.traditional.toFixed(1)}%
- Property Portfolio: ${portfolioData.assetAllocation.property.toFixed(1)}%
- Alternative Investments: ${portfolioData.assetAllocation.alternatives.toFixed(1)}%

Holdings Details:
${portfolioData.holdings.traditional.map(h => `- ${h.ticker} (${h.sector}): £${h.value.toLocaleString()} (${h.percentage.toFixed(1)}%)`).join('\n')}

Properties:
${portfolioData.holdings.properties.map(p => `- ${p.type} in ${p.location}: £${p.value.toLocaleString()}`).join('\n')}

Alternative Investments:
${portfolioData.holdings.alternatives.map(a => `- ${a.type} (${a.riskRating} risk): £${a.value.toLocaleString()}`).join('\n')}

ANALYSIS REQUIREMENTS:
1. Identify overexposure areas (>30% in single asset class, >20% in single sector, >15% in single property location, etc.)
2. Calculate diversification score (0-10, considering geographic spread, sector diversity, asset class balance)
3. Provide risk assessment summary
4. Give 3-5 key insights about the portfolio structure
5. Provide 3-5 general guidance points (NOT financial advice, just educational information)

Return as JSON with this exact structure:
{
  "totalPortfolioValue": ${portfolioData.totalValue},
  "assetAllocation": ${JSON.stringify(portfolioData.assetAllocation)},
  "overexposureWarnings": [
    {
      "category": "Asset Class/Sector/Location",
      "percentage": number,
      "recommendation": "Educational guidance only"
    }
  ],
  "diversificationScore": number_0_to_10,
  "keyInsights": ["insight1", "insight2", "insight3"],
  "riskAssessment": "Overall risk assessment summary",
  "generalGuidance": ["guidance1", "guidance2", "guidance3"]
}`;

      console.log('Analyzing portfolio with OpenAI...');
      
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo", // Using the latest available GPT-4 Turbo model for reliable performance
        messages: [
          {
            role: "system",
            content: "You are a financial analysis expert. Analyze investment portfolios and provide educational insights. NEVER give financial advice - only educational information and general guidance. Focus on diversification, risk assessment, and portfolio structure analysis."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      // Save analysis to database
      await db.update(investors)
        .set({
          portfolioAnalysis: JSON.stringify(analysis),
          analysisUpdatedAt: new Date()
        })
        .where(eq(investors.userId, userId));
      
      console.log('Portfolio analysis completed successfully and saved to database');
      res.json(analysis);

    } catch (error) {
      console.error('Portfolio analysis error:', error);
      res.status(500).json({ 
        message: 'Portfolio analysis failed', 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Market Data API endpoints
  app.get('/api/market-data/quotes', async (req, res) => {
    try {
      const { symbols } = req.query;
      
      if (!symbols || typeof symbols !== 'string') {
        return res.status(400).json({ 
          message: 'Symbols parameter is required. Provide comma-separated list of symbols.' 
        });
      }

      const symbolList = symbols.split(',').map(s => s.trim());
      console.log('Fetching market data for symbols:', symbolList);
      
      const quotes = await marketDataService.getMultipleQuotes(symbolList);
      
      res.json({
        quotes,
        lastUpdate: new Date().toISOString(),
        source: 'Yahoo Finance / CoinGecko'
      });
    } catch (error) {
      console.error('Market data API error:', error);
      res.status(500).json({ 
        message: 'Failed to fetch market data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get('/api/market-data/quote/:symbol', async (req, res) => {
    try {
      const { symbol } = req.params;
      console.log('Fetching single quote for:', symbol);
      
      let quote;
      if (symbol.includes('-USD') || symbol === 'BTC-USD') {
        const coinId = symbol === 'BTC-USD' ? 'bitcoin' : symbol.toLowerCase().replace('-usd', '');
        quote = await marketDataService.getCryptoPrice(coinId);
      } else {
        quote = await marketDataService.getStockPrice(symbol);
      }
      
      res.json({
        quote,
        lastUpdate: new Date().toISOString()
      });
    } catch (error) {
      console.error('Single quote API error:', error);
      res.status(500).json({ 
        message: 'Failed to fetch quote',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Actions API Route - Convert portfolio gaps into staged action plans
  app.post("/api/actions", (req, res) => {
    try {
      const body = req.body as ActionsRequest;
      if (!body?.currentMix || !body?.targetMix || !body?.portfolioValueGBP) {
        return res.status(400).json({ 
          error: "currentMix, targetMix, portfolioValueGBP are required" 
        });
      }
      
      console.log('Actions API called with request:', {
        portfolioValueGBP: body.portfolioValueGBP,
        liquidityFloorPct: body.liquidityFloorPct,
        minTradePct: body.minTradePct,
        maxMoves: body.maxMoves,
        stageIlliquids: body.stageIlliquids
      });
      
      const result = buildActions(body);
      
      console.log('Actions API result:', {
        totalChangePp: result.summary.totalAbsChangePp,
        stage1Actions: result.staged.stage1.length,
        stage2Actions: result.staged.stage2.length,
        estCostPct: result.summary.estCostPct
      });
      
      return res.json(result);
    } catch (error) {
      console.error('Actions API error:', error);
      return res.status(500).json({ 
        error: 'Failed to generate action plan',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Chat endpoint for investment questions
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: "Message is required" });
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an investment expert. Provide helpful, educational investment guidance. Keep responses concise and practical. Always end with 'This is not financial advice.' Be friendly but professional."
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      });

      const response = completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response at this time.";
      
      res.json({ response });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  // =============================================================================
  // Onboarding v2 analysis – MVP
  // Computes Safety Lights (liquidity, concentration, illiquids) from intake data
  // Returns analysis results with tilts_allowed flag and placeholder persona
  // Optionally accepts holdings array for future transition planning
  // =============================================================================
  app.post("/api/onboarding-v2/analyse", async (req, res) => {
    try {
      const { intake, policy_overrides, holdings } = req.body;
      
      // Holdings are accepted for future transition planning but not used in Safety Lights
      // Holdings may contain advanced fields: currency, instrument_type, isin, cost_basis_gbp,
      // acquisition_date, notes - these are stored for future use
      if (holdings && Array.isArray(holdings)) {
        console.log(`Received ${holdings.length} holdings for transition planning`);
      }

      if (!intake || typeof intake !== 'object') {
        return res.status(400).json({ 
          error: "Invalid request body", 
          message: "intake object is required with cash, spend, largest_line_pct, illiquid_pct" 
        });
      }

      const { cash, spend, largest_line_pct, illiquid_pct } = intake;

      if (typeof cash !== 'number' || cash < 0) {
        return res.status(400).json({ error: "intake.cash must be a non-negative number" });
      }
      if (typeof spend !== 'number' || spend < 0) {
        return res.status(400).json({ error: "intake.spend must be a non-negative number" });
      }
      if (typeof largest_line_pct !== 'number' || largest_line_pct < 0 || largest_line_pct > 1) {
        return res.status(400).json({ error: "intake.largest_line_pct must be a number between 0 and 1" });
      }
      if (typeof illiquid_pct !== 'number' || illiquid_pct < 0 || illiquid_pct > 1) {
        return res.status(400).json({ error: "intake.illiquid_pct must be a number between 0 and 1" });
      }

      // Build extended intake with persona cues and additional data
      const validatedIntake = {
        cash,
        spend,
        largest_line_pct,
        illiquid_pct,
        // Extended fields for persona computation
        total_portfolio_value_gbp: intake.total_portfolio_value_gbp,
        primary_goal: intake.primary_goal,
        time_horizon: intake.time_horizon,
        risk_comfort: intake.risk_comfort,
        age_band: intake.age_band,
        portfolio_stage: intake.portfolio_stage,
        personaCues: intake.personaCues,
        asset_class_breakdown: intake.asset_class_breakdown,
      };

      const result = analyzeOnboarding(validatedIntake, policy_overrides);

      res.json(result);
    } catch (error) {
      console.error("Onboarding v2 analysis error:", error);
      res.status(500).json({ 
        error: "Failed to analyze onboarding data",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // =============================================================================
  // AI Translation Layer for Next Steps Summary
  // Generates plain-English summary of onboarding status without financial advice
  // Implements strict forbidden word validation for compliance
  // =============================================================================
  
  const FORBIDDEN_WORDS = [
    // Financial advice verbs
    'should', 'recommend', 'buy', 'sell', 'allocate', 'rebalance', 
    'increase', 'decrease', 'switch', 'guarantee', 'expect', 
    'predict', 'outperform', 'alpha',
    // Judgement adjectives
    'positive', 'negative', 'favourable', 'favorable', 'unfavourable', 'unfavorable',
    'strong', 'weak', 'good', 'bad', 'excellent', 'poor', 'great', 'terrible',
    'optimistic', 'pessimistic', 'bullish', 'bearish', 'aggressive', 'conservative',
    // Strength/intensity modifiers that imply judgement
    'significant', 'substantial', 'considerable', 'notable', 'marked', 'pronounced',
    'slight', 'minor', 'marginal', 'modest',
    // Direction judgements
    'inclination', 'tendency', 'leaning'
  ];
  
  const CANONICAL_AXIS_LABELS = [
    'Volatility Comfort', 'Quality Tilt', 'Value Tilt', 'Tech Tilt',
    'UK Bias', 'ESG Tilt', 'Inflation Protection', 'Small Cap Tilt'
  ];
  
  const COMPLIANCE_LINE = 'Illustrative only. Not financial advice.';
  
  function validateAIOutput(text: string): { valid: boolean; reason?: string } {
    const lowerText = text.toLowerCase();
    
    // Check for forbidden words
    for (const word of FORBIDDEN_WORDS) {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(lowerText)) {
        return { valid: false, reason: `Contains forbidden word: "${word}"` };
      }
    }
    
    // Check compliance line appears exactly once and at the end (trimmed)
    const trimmedText = text.trim();
    if (!trimmedText.endsWith(COMPLIANCE_LINE)) {
      return { valid: false, reason: 'Compliance line must appear at the end of the output' };
    }
    
    // Ensure compliance line appears exactly once
    const occurrences = (text.match(new RegExp(COMPLIANCE_LINE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    if (occurrences !== 1) {
      return { valid: false, reason: 'Compliance line must appear exactly once' };
    }
    
    return { valid: true };
  }
  
  app.post("/api/translate/next-steps", async (req, res) => {
    try {
      const { payload } = req.body;
      
      if (!payload || typeof payload !== 'object') {
        return res.status(400).json({ 
          error: "Invalid request", 
          message: "payload object is required" 
        });
      }
      
      // Schema validation
      const { overall_status, top_constraints, preference_signals_state, signals_summary, next_step_text } = payload;
      
      if (typeof overall_status !== 'string' || !['GREEN', 'AMBER', 'RED'].includes(overall_status)) {
        return res.status(400).json({ error: "Invalid overall_status" });
      }
      if (!Array.isArray(top_constraints)) {
        return res.status(400).json({ error: "top_constraints must be an array" });
      }
      if (typeof preference_signals_state !== 'string' || !['enabled', 'locked'].includes(preference_signals_state)) {
        return res.status(400).json({ error: "Invalid preference_signals_state" });
      }
      if (!Array.isArray(signals_summary)) {
        return res.status(400).json({ error: "signals_summary must be an array" });
      }
      if (typeof next_step_text !== 'string') {
        return res.status(400).json({ error: "next_step_text must be a string" });
      }
      
      // Build the guardrailed prompt
      const systemPrompt = `You are a compliance-safe summariser for an investment planning tool. Your role is to paraphrase structured data into plain English.

STRICT RULES - VIOLATION MEANS FAILURE:
1. You may ONLY paraphrase the data provided. Do not add new facts, numbers, or thresholds.
2. NEVER use these words: ${FORBIDDEN_WORDS.join(', ')}
3. Use ONLY neutral verbs: indicates, shows, reflects, highlights, reveals, demonstrates, notes
4. Output must be 90-130 words maximum.
5. You MUST end with this exact compliance line: "${COMPLIANCE_LINE}"
6. Do not mention specific securities, tickers, or asset names.
7. This is strictly informational - describe what the data shows, not what to do about it.
8. When mentioning preference signals, use ONLY these exact canonical labels: ${CANONICAL_AXIS_LABELS.join(', ')}. Do not invent variations.
9. Describe directions as "towards" or "away from" without implying judgement about which is better.`;

      const userPrompt = `Summarise this investment position data in plain English:

OVERALL STATUS: ${overall_status}

TOP CONSTRAINTS:
${top_constraints?.map((c: any) => `- ${c.name}: ${c.status} (${c.metric_label}: ${c.metric_value_text})`).join('\n') || 'None identified'}

PREFERENCE SIGNALS: ${preference_signals_state}
${signals_summary?.map((s: any) => `- ${s.axis}: ${s.direction} (${s.intensity}) - Status: ${s.status}${s.reason_if_any ? ` - ${s.reason_if_any}` : ''}`).join('\n') || 'No signals captured'}

NEXT STEP: ${next_step_text}

Write a 90-130 word summary that paraphrases this information. End with: "${COMPLIANCE_LINE}"`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 250,
        temperature: 0.3
      });

      const aiOutput = completion.choices[0]?.message?.content || "";
      
      // Validate the output server-side
      const validation = validateAIOutput(aiOutput);
      
      if (!validation.valid) {
        console.log(`AI output validation failed: ${validation.reason}`);
        return res.json({ 
          success: false,
          validated: false,
          reason: validation.reason,
          fallback: "We couldn't generate a compliant summary. Please use the summary above."
        });
      }
      
      res.json({ 
        success: true,
        validated: true,
        text: aiOutput
      });
      
    } catch (error) {
      console.error("AI translation error:", error);
      res.status(500).json({ 
        error: "Failed to generate summary",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get current policy configuration (for debugging/testing)
  app.get("/api/onboarding-v2/policy", async (_req, res) => {
    try {
      const policy = getPolicy();
      res.json(policy);
    } catch (error) {
      console.error("Policy fetch error:", error);
      res.status(500).json({ 
        error: "Failed to fetch policy",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
