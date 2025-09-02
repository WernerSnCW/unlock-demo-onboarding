// Persona rules application
// Based on rules.py

import { PersonaDef } from '../data/personas';

export interface Allocation {
  [asset: string]: number;
}

function normalize(allocation: Allocation): Allocation {
  const sum = Object.values(allocation).reduce((s, v) => s + v, 0) || 1.0;
  const result: Allocation = {};
  
  Object.entries(allocation).forEach(([asset, value]) => {
    result[asset] = Math.max(0.0, value / sum);
  });
  
  return result;
}

export function applyPersonaRules(
  baseAllocation: Allocation, 
  persona: PersonaDef, 
  scenarioId: string, 
  techCryptoCorr: number = 0.0
): Allocation {
  const allocation = { ...baseAllocation };
  
  // Minimum liquidity constraint
  const minLiquidity = Math.max(0.10, 0.02 * persona.liquidityMonths);
  const currentLiquidity = (allocation.CASH || 0) + (allocation.GILTS_SHORT || 0);
  
  if (currentLiquidity < minLiquidity) {
    const delta = minLiquidity - currentLiquidity;
    allocation.CASH = (allocation.CASH || 0) + delta * 0.6;
    allocation.GILTS_SHORT = (allocation.GILTS_SHORT || 0) + delta * 0.4;
    
    // Reduce other assets to fund liquidity
    const assetsToReduce = [
      "CRYPTO_ALT", "CRYPTO_ETH", "CRYPTO_BTC", 
      "GROWTH_TECH", "PROPERTY_UK_RESI", "UK_REITs"
    ];
    
    let remainingDelta = delta;
    for (const asset of assetsToReduce) {
      if (remainingDelta <= 0) break;
      const cut = Math.min(allocation[asset] || 0, remainingDelta / 6);
      allocation[asset] = (allocation[asset] || 0) - cut;
      remainingDelta -= cut;
    }
  }
  
  // Concentration limits
  const concentrationCap = persona.concentrationTolerance !== "high" ? 0.30 : 0.40;
  
  Object.entries(allocation).forEach(([asset, value]) => {
    if (value > concentrationCap) {
      const excess = value - concentrationCap;
      allocation[asset] = concentrationCap;
      allocation.CASH = (allocation.CASH || 0) + excess;
    }
  });
  
  // Special case for P016 (BTL Mogul)
  if (persona.name === "P016") {
    const hardPropertyCap = 0.65;
    const propertyAllocation = allocation.PROPERTY_UK_RESI || 0;
    
    if (propertyAllocation > hardPropertyCap) {
      const excess = propertyAllocation - hardPropertyCap;
      allocation.PROPERTY_UK_RESI = hardPropertyCap;
      allocation.GILTS_SHORT = (allocation.GILTS_SHORT || 0) + 0.6 * excess;
      allocation.GOLD = (allocation.GOLD || 0) + 0.4 * excess;
    }
    
    // Additional stress caps for certain scenarios
    if (["gilt_selloff", "stagflation", "property_crash"].includes(scenarioId)) {
      const stressCap = 0.45;
      const currentProperty = allocation.PROPERTY_UK_RESI || 0;
      
      if (currentProperty > stressCap) {
        const excess = currentProperty - stressCap;
        allocation.PROPERTY_UK_RESI = stressCap;
        allocation.CASH = (allocation.CASH || 0) + 0.5 * excess;
        allocation.GILTS_SHORT = (allocation.GILTS_SHORT || 0) + 0.5 * excess;
      }
    }
  }
  
  // Tech burst scenario adjustments for crypto-heavy personas
  if (scenarioId === "tech_burst" && (persona.name === "P003" || persona.techBias > 0.6)) {
    allocation.CRYPTO_BTC = Math.min(allocation.CRYPTO_BTC || 0, 0.15);
    allocation.CRYPTO_ETH = Math.min(allocation.CRYPTO_ETH || 0, 0.10);
    allocation.CRYPTO_ALT = Math.min(allocation.CRYPTO_ALT || 0, 0.05);
    
    // If tech-crypto correlation is high, reduce further
    if (techCryptoCorr >= 0.80) {
      const cryptoAssets = ["CRYPTO_ALT", "CRYPTO_ETH", "CRYPTO_BTC"];
      const shift = 0.05;
      
      cryptoAssets.forEach(asset => {
        const cut = Math.min(allocation[asset] || 0, shift);
        allocation[asset] = (allocation[asset] || 0) - cut;
        allocation.UK_EQUITY_VALUE = (allocation.UK_EQUITY_VALUE || 0) + 0.6 * cut;
        allocation.CASH = (allocation.CASH || 0) + 0.4 * cut;
      });
    }
  }
  
  // Collectibles caps based on wealth level
  const collectiblesAssets = [
    "COLLECTIBLES_CARS", "COLLECTIBLES_WATCHES", "COLLECTIBLES_JEWELLERY",
    "COLLECTIBLES_WHISKY", "COLLECTIBLES_ART", "COLLECTIBLES_WINE"
  ];
  
  const collectiblesTotal = collectiblesAssets.reduce((sum, asset) => 
    sum + (allocation[asset] || 0), 0);
    
  const maxCollectibles = persona.wealthTier.startsWith("Entry") || 
                         persona.wealthTier.startsWith("Mass") ? 0.05 : 0.10;
  
  if (collectiblesTotal > maxCollectibles) {
    const excess = collectiblesTotal - maxCollectibles;
    let remainingExcess = excess;
    
    collectiblesAssets.forEach(asset => {
      if (remainingExcess <= 0) return;
      
      const cut = Math.min(allocation[asset] || 0, remainingExcess);
      allocation[asset] = (allocation[asset] || 0) - cut;
      allocation.CASH = (allocation.CASH || 0) + cut;
      remainingExcess -= cut;
    });
  }
  
  return normalize(allocation);
}

// Scenario selection logic
export interface ScenarioSelection {
  primary: string;
  secondary?: string;
  blendRatio?: [number, number];
  decision: 'clear_winner' | 'close' | 'indecisive';
}

export function selectScenario(
  scenarioWeights: { scenario: string; normalizedWeight: number; isMasked: boolean }[]
): ScenarioSelection {
  // Filter out masked scenarios and sort
  const activeScenarios = scenarioWeights
    .filter(s => !s.isMasked)
    .sort((a, b) => b.normalizedWeight - a.normalizedWeight);
  
  if (activeScenarios.length === 0) {
    return { primary: "S006", decision: 'indecisive' }; // Default to reflation
  }
  
  const top = activeScenarios[0];
  const runnerUp = activeScenarios[1];
  
  if (!runnerUp) {
    return { primary: top.scenario, decision: 'clear_winner' };
  }
  
  const gap = (top.normalizedWeight - runnerUp.normalizedWeight) * 100;
  
  if (gap >= 10) {
    return { primary: top.scenario, decision: 'clear_winner' };
  } else if (gap >= 3) {
    // Blend based on gap: 9-7→65/35; 6-4→60/40; 3→55/45
    let primaryWeight = 0.55;
    if (gap >= 7) primaryWeight = 0.65;
    else if (gap >= 4) primaryWeight = 0.60;
    
    return {
      primary: top.scenario,
      secondary: runnerUp.scenario,
      blendRatio: [primaryWeight, 1 - primaryWeight],
      decision: 'close'
    };
  } else {
    return { primary: "S006", decision: 'indecisive' }; // Default to reflation
  }
}

export function blendAllocations(
  allocation1: Allocation,
  allocation2: Allocation,
  weight1: number,
  weight2: number
): Allocation {
  const result: Allocation = {};
  const allAssets = new Set([...Object.keys(allocation1), ...Object.keys(allocation2)]);
  
  allAssets.forEach(asset => {
    const value1 = allocation1[asset] || 0;
    const value2 = allocation2[asset] || 0;
    result[asset] = value1 * weight1 + value2 * weight2;
  });
  
  return normalize(result);
}