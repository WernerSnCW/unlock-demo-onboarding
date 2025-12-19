import type { AllocationBand, AppliedTiltEntry, SafetyLightsResult } from '@/state/onboardingV2Store';

export interface DeltaResult {
  sleeve: string;
  current_pct: number;
  midpoint_pct: number;
  delta_pp: number;
  delta_display: string;
}

export interface TotalMovementResult {
  total_movement_pp: number;
  display: string;
}

export interface GuardrailImpactEntry {
  axis_label: string;
  status: string;
  status_label: string;
  primary_reason: string;
}

export interface SafetyLightStatus {
  axis: string;
  status: 'GREEN' | 'AMBER' | 'RED' | 'UNCHANGED';
  display_label: string;
}

export interface ChangeBullet {
  type: 'changes' | 'stays_same';
  text: string;
}

export function computeDelta(band: AllocationBand): DeltaResult {
  const midpoint = (band.illustrative_low_pct + band.illustrative_high_pct) / 2;
  const delta = midpoint - band.current_pct;
  
  let display: string;
  if (isNaN(band.current_pct) || band.current_pct === undefined) {
    display = '—';
  } else {
    const sign = delta >= 0 ? '+' : '−';
    display = `${sign}${Math.abs(delta).toFixed(1)}pp`;
  }
  
  return {
    sleeve: band.sleeve,
    current_pct: band.current_pct,
    midpoint_pct: midpoint,
    delta_pp: delta,
    delta_display: display,
  };
}

export function computeDeltas(bands: AllocationBand[]): DeltaResult[] {
  return bands.map(computeDelta);
}

export function computeTotalMovement(bands: AllocationBand[]): TotalMovementResult {
  const deltas = computeDeltas(bands);
  const total = deltas.reduce((sum, d) => {
    if (isNaN(d.delta_pp)) return sum;
    return sum + Math.abs(d.delta_pp);
  }, 0);
  
  return {
    total_movement_pp: total,
    display: `${total.toFixed(1)}pp`,
  };
}

export function computeGuardrailImpacts(
  appliedTilts: AppliedTiltEntry[],
  hasAnyRedLight: boolean
): GuardrailImpactEntry[] {
  const nonFullyApplied = appliedTilts.filter(
    t => t.status !== 'APPLIED'
  );
  
  return nonFullyApplied.map(tilt => {
    let primaryReason: string;
    
    if (tilt.status === 'LOCKED' && hasAnyRedLight) {
      primaryReason = 'Tilts locked while a red item exists';
    } else if (tilt.status === 'LOCKED') {
      primaryReason = tilt.constraint_reason || 'Locked by guardrails';
    } else if (tilt.constraint_reason) {
      primaryReason = tilt.constraint_reason;
    } else if (tilt.status === 'CONSTRAINED') {
      primaryReason = 'Guardrail binding';
    } else if (tilt.status === 'PARTIALLY_APPLIED') {
      primaryReason = 'Partially constrained by guardrails';
    } else {
      primaryReason = 'Not reflected in this scenario';
    }
    
    const statusLabels: Record<string, string> = {
      APPLIED: 'Reflected',
      PARTIALLY_APPLIED: 'Partially',
      CONSTRAINED: 'Constrained',
      LOCKED: 'Locked',
      NOT_APPLIED: 'Not reflected',
    };
    
    return {
      axis_label: tilt.axis_label,
      status: tilt.status,
      status_label: statusLabels[tilt.status] || tilt.status,
      primary_reason: primaryReason,
    };
  });
}

export function computeSafetyLightsForScenario(
  safetyLights: SafetyLightsResult | null | undefined
): SafetyLightStatus[] {
  if (!safetyLights) {
    return [
      { axis: 'Liquidity', status: 'UNCHANGED', display_label: 'Unchanged (pending analysis)' },
      { axis: 'Concentration', status: 'UNCHANGED', display_label: 'Unchanged (pending analysis)' },
      { axis: 'Illiquids', status: 'UNCHANGED', display_label: 'Unchanged (pending analysis)' },
    ];
  }
  
  return [
    { 
      axis: 'Liquidity', 
      status: safetyLights.liquidity,
      display_label: safetyLights.liquidity === 'GREEN' ? 'Green' : 
                     safetyLights.liquidity === 'AMBER' ? 'Amber' : 'Red'
    },
    { 
      axis: 'Concentration', 
      status: safetyLights.concentration,
      display_label: safetyLights.concentration === 'GREEN' ? 'Green' : 
                     safetyLights.concentration === 'AMBER' ? 'Amber' : 'Red'
    },
    { 
      axis: 'Illiquids', 
      status: safetyLights.illiquids,
      display_label: safetyLights.illiquids === 'GREEN' ? 'Green' : 
                     safetyLights.illiquids === 'AMBER' ? 'Amber' : 'Red'
    },
  ];
}

export function generateChangeBullets(
  assetBands: AllocationBand[],
  regionBands: AllocationBand[],
  appliedTilts: AppliedTiltEntry[]
): { changes: ChangeBullet[]; staysSame: ChangeBullet[] } {
  const allBands = [...assetBands, ...regionBands];
  const deltas = computeDeltas(allBands);
  
  const sortedByAbsDelta = [...deltas]
    .filter(d => !isNaN(d.delta_pp))
    .sort((a, b) => Math.abs(b.delta_pp) - Math.abs(a.delta_pp));
  
  const changes: ChangeBullet[] = [];
  const topMovers = sortedByAbsDelta.slice(0, 3);
  
  for (const mover of topMovers) {
    if (Math.abs(mover.delta_pp) < 0.5) continue;
    
    const direction = mover.delta_pp > 0 ? 'shifts higher' : 'shifts lower';
    changes.push({
      type: 'changes',
      text: `${mover.sleeve} ${direction} (${mover.delta_display})`,
    });
  }
  
  const staysSame: ChangeBullet[] = [];
  
  const constrainedCount = appliedTilts.filter(
    t => t.status === 'CONSTRAINED' || t.status === 'LOCKED'
  ).length;
  
  if (constrainedCount > 0) {
    staysSame.push({
      type: 'stays_same',
      text: `${constrainedCount} belief ${constrainedCount === 1 ? 'axis' : 'axes'} constrained by guardrails`,
    });
  }
  
  const unchangedBands = deltas.filter(d => Math.abs(d.delta_pp) < 0.5);
  if (unchangedBands.length > 0) {
    const sleeveNames = unchangedBands.slice(0, 2).map(b => b.sleeve);
    if (unchangedBands.length > 2) {
      staysSame.push({
        type: 'stays_same',
        text: `${sleeveNames.join(', ')} and ${unchangedBands.length - 2} others remain near current`,
      });
    } else if (unchangedBands.length > 0) {
      staysSame.push({
        type: 'stays_same',
        text: `${sleeveNames.join(' and ')} remain${sleeveNames.length === 1 ? 's' : ''} near current`,
      });
    }
  }
  
  return { changes, staysSame };
}

export function hasAnyRedLightFromResult(
  safetyLights: SafetyLightsResult | null | undefined
): boolean {
  if (!safetyLights) return false;
  return safetyLights.liquidity === 'RED' || 
         safetyLights.concentration === 'RED' || 
         safetyLights.illiquids === 'RED';
}

export interface MovementLimitedCallout {
  show: boolean;
  title: string;
  body: string;
  dominant_guardrail: string | null;
}

export function computeMovementLimitedCallout(
  totalMovementPp: number,
  hasAnyRedLight: boolean,
  bindingConstraints: { constraint_type: string }[],
  rangesIdentical: boolean
): MovementLimitedCallout {
  const isLowMovement = totalMovementPp < 1.0;
  const showCallout = isLowMovement || rangesIdentical;
  
  if (!showCallout) {
    return {
      show: false,
      title: '',
      body: '',
      dominant_guardrail: null,
    };
  }
  
  const title = 'Why movement is limited (illustrative)';
  let body: string;
  let dominant_guardrail: string | null = null;
  
  if (hasAnyRedLight) {
    dominant_guardrail = 'red guardrails';
    body = 'Preferences are recorded but locked while a red guardrail exists. Under current constraints, the model shows minimal deviation from the current position.';
  } else if (bindingConstraints.length > 0) {
    dominant_guardrail = bindingConstraints[0].constraint_type;
    body = `Your stated preferences are present, but current guardrails — particularly ${dominant_guardrail} — materially restrict how far allocations can move. As a result, the model shows minimal deviation from the current position under this scenario.`;
  } else if (rangesIdentical) {
    dominant_guardrail = 'current constraints';
    body = 'Under current constraints, all three scenarios converge on similar ranges given the inputs provided.';
  } else {
    dominant_guardrail = 'current constraints';
    body = 'Under current constraints, the model shows minimal deviation from the current position.';
  }
  
  return {
    show: true,
    title,
    body,
    dominant_guardrail,
  };
}

export function checkRangesIdenticalAcrossScenarios(
  scenarios: { asset_class_bands: AllocationBand[]; region_bands: AllocationBand[] }[]
): boolean {
  if (scenarios.length < 2) return false;
  
  const buildRangeMap = (bands: AllocationBand[]): Map<string, string> => {
    const map = new Map<string, string>();
    for (const band of bands) {
      map.set(band.sleeve, `${band.illustrative_low_pct.toFixed(2)}:${band.illustrative_high_pct.toFixed(2)}`);
    }
    return map;
  };
  
  const collectAllSleeves = (
    scenarios: { asset_class_bands: AllocationBand[]; region_bands: AllocationBand[] }[],
    type: 'asset' | 'region'
  ): Set<string> => {
    const sleeves = new Set<string>();
    for (const scenario of scenarios) {
      const bands = type === 'asset' ? scenario.asset_class_bands : scenario.region_bands;
      for (const band of bands) {
        sleeves.add(band.sleeve);
      }
    }
    return sleeves;
  };
  
  const allAssetSleeves = collectAllSleeves(scenarios, 'asset');
  const allRegionSleeves = collectAllSleeves(scenarios, 'region');
  
  const scenarioMaps = scenarios.map(s => ({
    asset: buildRangeMap(s.asset_class_bands),
    region: buildRangeMap(s.region_bands),
  }));
  
  const assetSleeveArr = Array.from(allAssetSleeves);
  for (let i = 0; i < assetSleeveArr.length; i++) {
    const sleeve = assetSleeveArr[i];
    const firstRange = scenarioMaps[0].asset.get(sleeve) || 'MISSING';
    for (let j = 1; j < scenarioMaps.length; j++) {
      const currentRange = scenarioMaps[j].asset.get(sleeve) || 'MISSING';
      if (firstRange !== currentRange) return false;
    }
  }
  
  const regionSleeveArr = Array.from(allRegionSleeves);
  for (let i = 0; i < regionSleeveArr.length; i++) {
    const sleeve = regionSleeveArr[i];
    const firstRange = scenarioMaps[0].region.get(sleeve) || 'MISSING';
    for (let j = 1; j < scenarioMaps.length; j++) {
      const currentRange = scenarioMaps[j].region.get(sleeve) || 'MISSING';
      if (firstRange !== currentRange) return false;
    }
  }
  
  return true;
}

export const BANNED_WORDS_STEP7 = [
  'buy',
  'sell',
  'should',
  'must',
  'optimise',
  'optimize',
  'improve',
  'increase',
  'decrease',
  'save',
];

export function containsBannedWordStep7(text: string): string | null {
  const lowerText = text.toLowerCase();
  
  for (const word of BANNED_WORDS_STEP7) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(lowerText)) {
      return word;
    }
  }
  return null;
}
