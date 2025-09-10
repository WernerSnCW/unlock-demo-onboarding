// Asset Class Mapping Service for Economic Scenario Engine v2.1
// Handles mapping between new 9-asset system and 15 canonical buckets

import { CANONICAL_BUCKETS, type Bucket } from "../config/buckets";
import { ASSET_CLASS_MAPPING, IG_CREDIT_SHOCKS, CRYPTO_SPLIT_CONFIG } from "../data/scenarios";

export interface ScenarioImpacts {
  [assetClass: string]: number;
}

export interface CanonicalBucketImpacts {
  [bucket: string]: number;
}

/**
 * Map scenario impacts from 9-asset system to full 15 canonical buckets
 */
export function mapScenarioImpactsToCanonicalBuckets(
  scenarioName: string,
  newSystemImpacts: ScenarioImpacts
): CanonicalBucketImpacts {
  const canonicalImpacts: CanonicalBucketImpacts = {};

  // Initialize all canonical buckets to 0
  CANONICAL_BUCKETS.forEach((bucket: Bucket) => {
    canonicalImpacts[bucket] = 0;
  });

  // Map core 9 asset classes directly
  Object.entries(ASSET_CLASS_MAPPING).forEach(([newAssetClass, canonicalMapping]) => {
    const impact = newSystemImpacts[newAssetClass];
    if (impact === undefined) return;

    if (Array.isArray(canonicalMapping)) {
      // Handle crypto split (BTC and ETH)
      if (newAssetClass === "Crypto") {
        canonicalImpacts["CRYPTO_BTC"] = applyCryptoCap(impact * CRYPTO_SPLIT_CONFIG.CRYPTO_BTC);
        canonicalImpacts["CRYPTO_ETH"] = applyCryptoCap(impact * CRYPTO_SPLIT_CONFIG.CRYPTO_ETH);
      }
    } else {
      // Direct mapping
      canonicalImpacts[canonicalMapping] = impact;
    }
  });

  // Apply IG Credit shocks from specific scenario mapping
  const igCreditShock = IG_CREDIT_SHOCKS[scenarioName];
  if (igCreditShock !== undefined) {
    canonicalImpacts["IG_CREDIT"] = igCreditShock;
  }

  // Apply calculated impacts for other buckets using formulas
  applyOtherBucketFormulas(canonicalImpacts, scenarioName);

  return canonicalImpacts;
}

/**
 * Apply crypto impact cap of ±80%
 */
function applyCryptoCap(impact: number): number {
  const cap = CRYPTO_SPLIT_CONFIG.cap_abs_pct;
  return Math.max(-cap, Math.min(cap, impact));
}

/**
 * Apply formulas for other canonical buckets not directly mapped
 */
function applyOtherBucketFormulas(
  impacts: CanonicalBucketImpacts,
  scenarioName: string
): void {
  // CASH: default 0% (safe haven)
  impacts["CASH"] = 0;

  // BILLS_SHORT_GILTS: 
  // - Recession scenarios: +2% (flight to quality)
  // - Inflation shock scenarios: -1% (real rate erosion)
  const recessionScenarios = ["AI Recession", "Property Crash", "Debt Spiral"];
  const inflationScenarios = ["Stagflation", "Energy Shock"];
  
  if (recessionScenarios.includes(scenarioName)) {
    impacts["BILLS_SHORT_GILTS"] = 0.02;
  } else if (inflationScenarios.includes(scenarioName)) {
    impacts["BILLS_SHORT_GILTS"] = -0.01;
  } else {
    impacts["BILLS_SHORT_GILTS"] = 0;
  }

  // ALTERNATIVES: 0.7 * Global Equity (capped at -15% to +10%)
  const globalEquityImpact = impacts["GLOBAL_EQUITY"] || 0;
  const alternativesImpact = 0.7 * globalEquityImpact;
  impacts["ALTERNATIVES"] = Math.max(-0.15, Math.min(0.10, alternativesImpact));

  // COLLECTIBLES_ART: 0.3 * Global Equity + 0.2 * Commodities (capped at -10% to +8%)
  const commoditiesImpact = impacts["COMMODITIES"] || 0;
  const artImpact = 0.3 * globalEquityImpact + 0.2 * commoditiesImpact;
  impacts["COLLECTIBLES_ART"] = Math.max(-0.10, Math.min(0.08, artImpact));

  // COLLECTIBLES_WINE: 0.2 * Global Equity + 0.3 * Commodities (capped at -8% to +10%)
  const wineImpact = 0.2 * globalEquityImpact + 0.3 * commoditiesImpact;
  impacts["COLLECTIBLES_WINE"] = Math.max(-0.08, Math.min(0.10, wineImpact));

  // COLLECTIBLES_WHISKY: Similar to wine but with scenario-specific adjustments
  let whiskyImpact = 0.2 * globalEquityImpact + 0.3 * commoditiesImpact;
  // Sterling devaluation benefits whisky exports
  if (scenarioName === "Sterling Devaluation") {
    whiskyImpact += 0.03; // Export benefit
  }
  impacts["COLLECTIBLES_WHISKY"] = Math.max(-0.08, Math.min(0.10, whiskyImpact));

  // COLLECTIBLES_CARS: Similar to alternatives but more conservative
  let carsImpact = 0.5 * globalEquityImpact;
  // Energy shock hits transport-related collectibles harder
  if (scenarioName === "Energy Shock") {
    carsImpact -= 0.03; // Transport cost impact
  }
  impacts["COLLECTIBLES_CARS"] = Math.max(-0.08, Math.min(0.05, carsImpact));
}

/**
 * Convert canonical bucket impacts back to new 9-asset system for display
 */
export function mapCanonicalToNewSystem(
  canonicalImpacts: CanonicalBucketImpacts
): ScenarioImpacts {
  const newSystemImpacts: ScenarioImpacts = {};

  // Direct mappings
  newSystemImpacts["Global Equity"] = canonicalImpacts["GLOBAL_EQUITY"] || 0;
  newSystemImpacts["UK Equity"] = canonicalImpacts["UK_EQUITY_VALUE"] || 0;
  newSystemImpacts["Growth Tech"] = canonicalImpacts["GROWTH_TECH"] || 0;
  newSystemImpacts["UK Property"] = canonicalImpacts["PROPERTY_UK_RESI"] || 0;
  newSystemImpacts["Long Gilts"] = canonicalImpacts["GILTS_LONG"] || 0;
  newSystemImpacts["HY Credit"] = canonicalImpacts["HY_CREDIT"] || 0;
  newSystemImpacts["Gold"] = canonicalImpacts["GOLD"] || 0;
  newSystemImpacts["Commodities"] = canonicalImpacts["COMMODITIES"] || 0;

  // Crypto: average of BTC and ETH (reverse the split)
  const btcImpact = canonicalImpacts["CRYPTO_BTC"] || 0;
  const ethImpact = canonicalImpacts["CRYPTO_ETH"] || 0;
  newSystemImpacts["Crypto"] = (btcImpact + ethImpact) / 2;

  return newSystemImpacts;
}

/**
 * Calculate probability-weighted scenario impacts with overlap support
 */
export function calculateWeightedImpacts(
  scenarioProbabilities: Record<string, number>,
  allScenarioImpacts: Record<string, ScenarioImpacts>,
  overlapImpacts?: Record<string, ScenarioImpacts>
): CanonicalBucketImpacts {
  const weightedImpacts: CanonicalBucketImpacts = {};

  // Initialize all buckets to 0
  CANONICAL_BUCKETS.forEach((bucket: Bucket) => {
    weightedImpacts[bucket] = 0;
  });

  // Method 1: Simple probability-weighted singles
  Object.entries(scenarioProbabilities).forEach(([scenario, probability]) => {
    const scenarioImpacts = allScenarioImpacts[scenario];
    if (!scenarioImpacts) return;

    const canonicalImpacts = mapScenarioImpactsToCanonicalBuckets(scenario, scenarioImpacts);
    
    Object.entries(canonicalImpacts).forEach(([bucket, impact]) => {
      weightedImpacts[bucket] += probability * impact;
    });
  });

  // Method 2: Add overlap effects if provided (advanced)
  if (overlapImpacts) {
    const W_pair = Math.min(0.6, 
      Object.values(scenarioProbabilities).reduce((sum, p) => sum + p * p, 0)
    );

    // Add overlap contributions
    Object.entries(overlapImpacts).forEach(([overlapKey, overlapImpact]) => {
      // Extract scenario pairs from keys like "Debt Spiral + Property Crash"
      const scenarios = overlapKey.split(' + ').map(s => s.trim());
      if (scenarios.length === 2) {
        const p1 = scenarioProbabilities[scenarios[0]] || 0;
        const p2 = scenarioProbabilities[scenarios[1]] || 0;
        const w_ij = 2 * p1 * p2;

        const canonicalOverlapImpacts = mapScenarioImpactsToCanonicalBuckets(
          overlapKey, 
          overlapImpact
        );

        Object.entries(canonicalOverlapImpacts).forEach(([bucket, impact]) => {
          weightedImpacts[bucket] = (1 - W_pair) * weightedImpacts[bucket] + w_ij * impact;
        });
      }
    });
  }

  return weightedImpacts;
}

/**
 * Utility function to get all scenario impacts in canonical bucket format
 */
export function getAllScenarioImpactsInCanonicalFormat(
  scenarios: Record<string, any>
): Record<string, CanonicalBucketImpacts> {
  const result: Record<string, CanonicalBucketImpacts> = {};

  Object.entries(scenarios).forEach(([scenarioName, scenarioData]) => {
    if (scenarioData.mu) {
      // Already in canonical format
      result[scenarioName] = scenarioData.mu;
    } else if (scenarioData.impacts_pct) {
      // Convert from new system format
      result[scenarioName] = mapScenarioImpactsToCanonicalBuckets(
        scenarioName,
        scenarioData.impacts_pct
      );
    }
  });

  return result;
}