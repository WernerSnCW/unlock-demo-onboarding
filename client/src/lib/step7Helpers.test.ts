import { describe, it, expect } from 'vitest';
import {
  computeDelta,
  computeDeltas,
  computeTotalMovement,
  computeGuardrailImpacts,
  computeSafetyLightsForScenario,
  generateChangeBullets,
  hasAnyRedLightFromResult,
  containsBannedWordStep7,
  computeMovementLimitedCallout,
  checkRangesIdenticalAcrossScenarios,
  computeExamplePortfolio,
  computeExamplePortfolioSet,
  generateExampleDiffersSummary,
  BANNED_WORDS_STEP7,
} from './step7Helpers';
import type { AllocationBand, AppliedTiltEntry, SafetyLightsResult } from '@/state/onboardingV2Store';

const mockBand: AllocationBand = {
  sleeve: 'Equity',
  current_pct: 50,
  illustrative_low_pct: 45,
  illustrative_high_pct: 55,
  direction: 'NEUTRAL',
  clamped: false,
  midpoint_pct: 50,
  debug: {
    rawPressure: 0,
    centreShift: 0,
    unclampedCentre: 50,
    clampedCentre: 50,
    maxShift: 5,
    halfWidth: 5,
    scenarioStrength: 1,
    bindingConstraints: [],
  },
};

const mockBandWithIncrease: AllocationBand = {
  ...mockBand,
  sleeve: 'Fixed Income',
  current_pct: 30,
  illustrative_low_pct: 33,
  illustrative_high_pct: 37,
  direction: 'INCREASE',
  midpoint_pct: 35,
};

const mockBandWithDecrease: AllocationBand = {
  ...mockBand,
  sleeve: 'Alternatives',
  current_pct: 20,
  illustrative_low_pct: 14,
  illustrative_high_pct: 18,
  direction: 'DECREASE',
  midpoint_pct: 16,
};

describe('computeDelta', () => {
  it('should compute delta correctly from midpoint - current', () => {
    const result = computeDelta(mockBandWithIncrease);
    expect(result.delta_pp).toBeCloseTo(5);
    expect(result.delta_display).toBe('+5.0pp');
  });

  it('should show negative delta with minus sign', () => {
    const result = computeDelta(mockBandWithDecrease);
    expect(result.delta_pp).toBeCloseTo(-4);
    expect(result.delta_display).toBe('−4.0pp');
  });

  it('should handle zero delta', () => {
    const result = computeDelta(mockBand);
    expect(result.delta_pp).toBeCloseTo(0);
    expect(result.delta_display).toBe('+0.0pp');
  });
});

describe('computeDeltas', () => {
  it('should compute deltas for all bands', () => {
    const bands = [mockBand, mockBandWithIncrease, mockBandWithDecrease];
    const results = computeDeltas(bands);
    expect(results).toHaveLength(3);
    expect(results[0].delta_pp).toBeCloseTo(0);
    expect(results[1].delta_pp).toBeCloseTo(5);
    expect(results[2].delta_pp).toBeCloseTo(-4);
  });
});

describe('computeTotalMovement', () => {
  it('should sum absolute deltas correctly', () => {
    const bands = [mockBand, mockBandWithIncrease, mockBandWithDecrease];
    const result = computeTotalMovement(bands);
    expect(result.total_movement_pp).toBeCloseTo(9);
    expect(result.display).toBe('9.0pp');
  });

  it('should return 0 for empty bands', () => {
    const result = computeTotalMovement([]);
    expect(result.total_movement_pp).toBe(0);
    expect(result.display).toBe('0.0pp');
  });
});

describe('containsBannedWordStep7', () => {
  it('should detect banned words', () => {
    expect(containsBannedWordStep7('You should do this')).toBe('should');
    expect(containsBannedWordStep7('You must act now')).toBe('must');
    expect(containsBannedWordStep7('Buy more stocks')).toBe('buy');
    expect(containsBannedWordStep7('Sell your holdings')).toBe('sell');
    expect(containsBannedWordStep7('This will optimise your portfolio')).toBe('optimise');
    expect(containsBannedWordStep7('This will improve returns')).toBe('improve');
  });

  it('should not flag neutral wording', () => {
    expect(containsBannedWordStep7('shifts higher')).toBeNull();
    expect(containsBannedWordStep7('moves lower')).toBeNull();
    expect(containsBannedWordStep7('differs from current')).toBeNull();
    expect(containsBannedWordStep7('remains similar')).toBeNull();
  });

  it('should check all banned words in list', () => {
    for (const word of BANNED_WORDS_STEP7) {
      expect(containsBannedWordStep7(`This is ${word} text`)).toBe(word);
    }
  });
});

describe('computeGuardrailImpacts', () => {
  const mockAppliedTilts: AppliedTiltEntry[] = [
    { axis_code: 'growth', axis_label: 'Growth', status: 'APPLIED', constraint_reason: null },
    { axis_code: 'quality', axis_label: 'Quality', status: 'CONSTRAINED', constraint_reason: 'Concentration guardrail binding' },
    { axis_code: 'value', axis_label: 'Value', status: 'LOCKED', constraint_reason: null },
  ];

  it('should only include non-fully-applied tilts', () => {
    const result = computeGuardrailImpacts(mockAppliedTilts, false);
    expect(result).toHaveLength(2);
    expect(result.map(r => r.axis_label)).toEqual(['Quality', 'Value']);
  });

  it('should show "Tilts locked while a red item exists" only for LOCKED status tilts', () => {
    const result = computeGuardrailImpacts(mockAppliedTilts, true);
    const lockedTilt = result.find(r => r.status === 'LOCKED');
    const constrainedTilt = result.find(r => r.status === 'CONSTRAINED');
    
    expect(lockedTilt?.primary_reason).toBe('Tilts locked while a red item exists');
    expect(constrainedTilt?.primary_reason).toBe('Concentration guardrail binding');
  });

  it('should not apply red-light reason to non-LOCKED tilts even when red light exists', () => {
    const mixedTilts: AppliedTiltEntry[] = [
      { axis_code: 'growth', axis_label: 'Growth', status: 'PARTIALLY_APPLIED', constraint_reason: null },
      { axis_code: 'value', axis_label: 'Value', status: 'LOCKED', constraint_reason: null },
    ];
    const result = computeGuardrailImpacts(mixedTilts, true);
    
    const partialTilt = result.find(r => r.status === 'PARTIALLY_APPLIED');
    const lockedTilt = result.find(r => r.status === 'LOCKED');
    
    expect(partialTilt?.primary_reason).toBe('Partially constrained by guardrails');
    expect(lockedTilt?.primary_reason).toBe('Tilts locked while a red item exists');
  });

  it('should not show red-light reason for LOCKED tilts when no red light exists', () => {
    const lockedTilts: AppliedTiltEntry[] = [
      { axis_code: 'value', axis_label: 'Value', status: 'LOCKED', constraint_reason: 'Custom lock reason' },
    ];
    const result = computeGuardrailImpacts(lockedTilts, false);
    
    expect(result[0].primary_reason).toBe('Custom lock reason');
    expect(result[0].primary_reason).not.toContain('red item');
  });

  it('should use constraint_reason when available', () => {
    const result = computeGuardrailImpacts(mockAppliedTilts, false);
    const qualityImpact = result.find(r => r.axis_label === 'Quality');
    expect(qualityImpact?.primary_reason).toBe('Concentration guardrail binding');
  });
});

describe('hasAnyRedLightFromResult', () => {
  it('should return true when any light is RED', () => {
    const redResult: SafetyLightsResult = {
      liquidity: 'RED',
      concentration: 'GREEN',
      illiquids: 'GREEN',
      overall_status: 'RED',
      overall_status_code: 'ACTION_REQUIRED',
      overall_status_label: 'Action Required',
      overall_status_message: 'Test',
      tilts_allowed: false,
      metrics: { cash_runway_months: 0, largest_line_pct: 10, illiquid_pct: 10 },
      recommendations: [],
    };
    expect(hasAnyRedLightFromResult(redResult)).toBe(true);
  });

  it('should return false when no lights are RED', () => {
    const greenResult: SafetyLightsResult = {
      liquidity: 'GREEN',
      concentration: 'AMBER',
      illiquids: 'GREEN',
      overall_status: 'AMBER',
      overall_status_code: 'CAUTION',
      overall_status_label: 'Caution',
      overall_status_message: 'Test',
      tilts_allowed: true,
      metrics: { cash_runway_months: 6, largest_line_pct: 20, illiquid_pct: 10 },
      recommendations: [],
    };
    expect(hasAnyRedLightFromResult(greenResult)).toBe(false);
  });

  it('should return false for null/undefined', () => {
    expect(hasAnyRedLightFromResult(null)).toBe(false);
    expect(hasAnyRedLightFromResult(undefined)).toBe(false);
  });
});

describe('computeSafetyLightsForScenario', () => {
  it('should return UNCHANGED status when safety lights are null', () => {
    const result = computeSafetyLightsForScenario(null);
    expect(result.every(r => r.status === 'UNCHANGED')).toBe(true);
  });

  it('should return correct statuses from safety lights', () => {
    const safetyLights: SafetyLightsResult = {
      liquidity: 'GREEN',
      concentration: 'AMBER',
      illiquids: 'RED',
      overall_status: 'RED',
      overall_status_code: 'ACTION_REQUIRED',
      overall_status_label: 'Action Required',
      overall_status_message: 'Test',
      tilts_allowed: false,
      metrics: { cash_runway_months: 6, largest_line_pct: 30, illiquid_pct: 40 },
      recommendations: [],
    };
    const result = computeSafetyLightsForScenario(safetyLights);
    expect(result[0].status).toBe('GREEN');
    expect(result[1].status).toBe('AMBER');
    expect(result[2].status).toBe('RED');
  });
});

describe('generateChangeBullets', () => {
  const bands = [mockBand, mockBandWithIncrease, mockBandWithDecrease];
  const appliedTilts: AppliedTiltEntry[] = [
    { axis_code: 'growth', axis_label: 'Growth', status: 'CONSTRAINED', constraint_reason: null },
  ];

  it('should generate change bullets for top movers', () => {
    const { changes, staysSame } = generateChangeBullets(bands, [], appliedTilts);
    expect(changes.length).toBeGreaterThan(0);
    expect(changes.every(c => c.type === 'changes')).toBe(true);
  });

  it('should generate stays_same bullets', () => {
    const { staysSame } = generateChangeBullets(bands, [], appliedTilts);
    expect(staysSame.length).toBeGreaterThan(0);
  });

  it('should not contain banned words in generated bullets', () => {
    const { changes, staysSame } = generateChangeBullets(bands, [], appliedTilts);
    const allBullets = [...changes, ...staysSame];
    
    for (const bullet of allBullets) {
      const banned = containsBannedWordStep7(bullet.text);
      expect(banned).toBeNull();
    }
  });

  it('should use neutral wording like "shifts", "moves", "differs", "remains"', () => {
    const { changes, staysSame } = generateChangeBullets(bands, [], appliedTilts);
    const allText = [...changes, ...staysSame].map(b => b.text).join(' ');
    
    const hasNeutralWording = 
      allText.includes('shifts') || 
      allText.includes('remain') || 
      allText.includes('constrained');
    expect(hasNeutralWording).toBe(true);
  });
});

describe('range bar aria-labels', () => {
  it('should format aria-label with current and min/max range', () => {
    const row = {
      label: 'Equity',
      currentPct: 42.8,
      minPct: 40,
      maxPct: 46,
    };
    const ariaLabel = `${row.label}: current ${row.currentPct.toFixed(1)}%, illustrative range ${row.minPct.toFixed(0)}–${row.maxPct.toFixed(0)}%`;
    expect(ariaLabel).toBe('Equity: current 42.8%, illustrative range 40–46%');
  });

  it('should include all required elements in aria-label', () => {
    const row = {
      label: 'Bonds',
      currentPct: 30.5,
      minPct: 28,
      maxPct: 34,
    };
    const ariaLabel = `${row.label}: current ${row.currentPct.toFixed(1)}%, illustrative range ${row.minPct.toFixed(0)}–${row.maxPct.toFixed(0)}%`;
    
    expect(ariaLabel).toContain('current');
    expect(ariaLabel).toContain(row.currentPct.toFixed(1));
    expect(ariaLabel).toContain('illustrative range');
    expect(ariaLabel).toContain(row.minPct.toFixed(0));
    expect(ariaLabel).toContain(row.maxPct.toFixed(0));
  });
});

describe('delta computation accuracy', () => {
  it('should compute delta as midpoint(range) - current', () => {
    const band: AllocationBand = {
      ...mockBand,
      current_pct: 40,
      illustrative_low_pct: 42,
      illustrative_high_pct: 48,
    };
    const result = computeDelta(band);
    const expectedMidpoint = (42 + 48) / 2;
    const expectedDelta = expectedMidpoint - 40;
    expect(result.delta_pp).toBeCloseTo(expectedDelta);
    expect(result.midpoint_pct).toBeCloseTo(expectedMidpoint);
  });

  it('should format delta with sign and 1 decimal', () => {
    const band: AllocationBand = {
      ...mockBand,
      current_pct: 30,
      illustrative_low_pct: 31,
      illustrative_high_pct: 34,
    };
    const result = computeDelta(band);
    expect(result.delta_display).toMatch(/^[+−]\d+\.\d{1}pp$/);
  });
});

describe('computeMovementLimitedCallout', () => {
  it('should show callout when total_movement_pp < 1.0', () => {
    const result = computeMovementLimitedCallout(0.5, false, [], false);
    expect(result.show).toBe(true);
    expect(result.title).toBe('Why movement is limited (illustrative)');
  });

  it('should show callout when ranges are identical', () => {
    const result = computeMovementLimitedCallout(5.0, false, [], true);
    expect(result.show).toBe(true);
  });

  it('should not show callout when movement is high and ranges differ', () => {
    const result = computeMovementLimitedCallout(5.0, false, [], false);
    expect(result.show).toBe(false);
  });

  it('should use red guardrail copy when hasAnyRedLight is true', () => {
    const result = computeMovementLimitedCallout(0.5, true, [], false);
    expect(result.show).toBe(true);
    expect(result.body).toContain('Preferences are recorded but locked while a red guardrail exists');
    expect(result.dominant_guardrail).toBe('red guardrails');
  });

  it('should use binding constraint name when available', () => {
    const constraints = [{ constraint_type: 'concentration limits' }];
    const result = computeMovementLimitedCallout(0.5, false, constraints, false);
    expect(result.body).toContain('concentration limits');
    expect(result.dominant_guardrail).toBe('concentration limits');
  });

  it('should use low-movement fallback copy when no constraints and ranges differ', () => {
    const result = computeMovementLimitedCallout(0.5, false, [], false);
    expect(result.body).toContain('Under current constraints');
    expect(result.body).toContain('minimal deviation');
    expect(result.body).not.toContain('converge');
  });

  it('should use convergence copy when ranges are identical', () => {
    const result = computeMovementLimitedCallout(5.0, false, [], true);
    expect(result.body).toContain('all three scenarios converge');
  });

  it('should not contain banned words in callout body', () => {
    const scenarios = [
      computeMovementLimitedCallout(0.5, true, [], false),
      computeMovementLimitedCallout(0.5, false, [{ constraint_type: 'test' }], false),
      computeMovementLimitedCallout(0.5, false, [], false),
      computeMovementLimitedCallout(5.0, false, [], true),
    ];
    for (const result of scenarios) {
      const banned = containsBannedWordStep7(result.body);
      expect(banned).toBeNull();
    }
  });
});

describe('checkRangesIdenticalAcrossScenarios', () => {
  it('should return true when all scenarios have identical ranges', () => {
    const scenarios = [
      { asset_class_bands: [{ ...mockBand, illustrative_low_pct: 45, illustrative_high_pct: 55 }], region_bands: [] },
      { asset_class_bands: [{ ...mockBand, illustrative_low_pct: 45, illustrative_high_pct: 55 }], region_bands: [] },
      { asset_class_bands: [{ ...mockBand, illustrative_low_pct: 45, illustrative_high_pct: 55 }], region_bands: [] },
    ];
    expect(checkRangesIdenticalAcrossScenarios(scenarios)).toBe(true);
  });

  it('should return false when scenarios have different ranges', () => {
    const scenarios = [
      { asset_class_bands: [{ ...mockBand, illustrative_low_pct: 45, illustrative_high_pct: 55 }], region_bands: [] },
      { asset_class_bands: [{ ...mockBand, illustrative_low_pct: 40, illustrative_high_pct: 60 }], region_bands: [] },
    ];
    expect(checkRangesIdenticalAcrossScenarios(scenarios)).toBe(false);
  });

  it('should return false for single scenario', () => {
    const scenarios = [
      { asset_class_bands: [mockBand], region_bands: [] },
    ];
    expect(checkRangesIdenticalAcrossScenarios(scenarios)).toBe(false);
  });
});

describe('computeExamplePortfolio', () => {
  const mockBands = [
    { sleeve: 'Equities', current_pct: 60, illustrative_low_pct: 55, illustrative_high_pct: 65 },
    { sleeve: 'Bonds', current_pct: 30, illustrative_low_pct: 25, illustrative_high_pct: 35 },
    { sleeve: 'Cash', current_pct: 10, illustrative_low_pct: 5, illustrative_high_pct: 15 },
  ];

  it('should compute LOW example using min values', () => {
    const result = computeExamplePortfolio(mockBands, 'LOW');
    expect(result.type).toBe('LOW');
    expect(result.allocations[0].example_pct).toBeCloseTo(55 * (100 / 85), 1);
    expect(result.allocations[1].example_pct).toBeCloseTo(25 * (100 / 85), 1);
    expect(result.allocations[2].example_pct).toBeCloseTo(5 * (100 / 85), 1);
  });

  it('should compute MID example using midpoint values', () => {
    const result = computeExamplePortfolio(mockBands, 'MID');
    expect(result.type).toBe('MID');
    expect(result.allocations[0].example_pct).toBe(60);
    expect(result.allocations[1].example_pct).toBe(30);
    expect(result.allocations[2].example_pct).toBe(10);
  });

  it('should compute HIGH example using max values', () => {
    const result = computeExamplePortfolio(mockBands, 'HIGH');
    expect(result.type).toBe('HIGH');
    expect(result.allocations[0].example_pct).toBeCloseTo(65 * (100 / 115), 1);
    expect(result.allocations[1].example_pct).toBeCloseTo(35 * (100 / 115), 1);
    expect(result.allocations[2].example_pct).toBeCloseTo(15 * (100 / 115), 1);
  });

  it('should normalise allocations to sum to 100', () => {
    const result = computeExamplePortfolio(mockBands, 'LOW');
    expect(result.total_pct).toBeCloseTo(100, 1);
    expect(result.normalised).toBe(true);
  });

  it('should not normalise when already summing to 100', () => {
    const result = computeExamplePortfolio(mockBands, 'MID');
    expect(result.total_pct).toBeCloseTo(100, 1);
    expect(result.normalised).toBe(false);
  });

  it('should compute total_movement_pp correctly', () => {
    const result = computeExamplePortfolio(mockBands, 'MID');
    expect(result.total_movement_pp).toBe(0);
  });

  it('should compute top movers with threshold 0.5pp', () => {
    const bandsWithMovement = [
      { sleeve: 'Equities', current_pct: 50, illustrative_low_pct: 55, illustrative_high_pct: 65 },
      { sleeve: 'Bonds', current_pct: 40, illustrative_low_pct: 25, illustrative_high_pct: 35 },
      { sleeve: 'Cash', current_pct: 10, illustrative_low_pct: 5, illustrative_high_pct: 15 },
    ];
    const result = computeExamplePortfolio(bandsWithMovement, 'MID');
    expect(result.top_movers.length).toBeLessThanOrEqual(2);
    result.top_movers.forEach(m => {
      expect(Math.abs(m.delta_pp)).toBeGreaterThanOrEqual(0.5);
    });
  });

  it('should compute example portfolio set with all three types', () => {
    const result = computeExamplePortfolioSet(mockBands);
    expect(result.low.type).toBe('LOW');
    expect(result.mid.type).toBe('MID');
    expect(result.high.type).toBe('HIGH');
  });

  it('should generate differs summary correctly', () => {
    const topMovers = [
      { sleeve: 'Equities', delta_pp: 5, direction: 'higher' },
      { sleeve: 'Bonds', delta_pp: -3, direction: 'lower' },
    ];
    const result = generateExampleDiffersSummary(topMovers);
    expect(result).toContain('Equities higher (+5.0pp)');
    expect(result).toContain('Bonds lower');
  });

  it('should return fallback when no top movers', () => {
    const result = generateExampleDiffersSummary([]);
    expect(result).toBe('No material difference from current allocation.');
  });

  it('should not contain banned words in differs summary', () => {
    const topMovers = [
      { sleeve: 'Equities', delta_pp: 5, direction: 'higher' },
    ];
    const result = generateExampleDiffersSummary(topMovers);
    expect(containsBannedWordStep7(result)).toBeNull();
  });

  it('should produce consistent allocations regardless of band order', () => {
    const bandsOriginal = [
      { sleeve: 'Equities', current_pct: 60, illustrative_low_pct: 55, illustrative_high_pct: 65 },
      { sleeve: 'Bonds', current_pct: 30, illustrative_low_pct: 25, illustrative_high_pct: 35 },
      { sleeve: 'Cash', current_pct: 10, illustrative_low_pct: 5, illustrative_high_pct: 15 },
    ];
    const bandsShuffled = [
      { sleeve: 'Cash', current_pct: 10, illustrative_low_pct: 5, illustrative_high_pct: 15 },
      { sleeve: 'Equities', current_pct: 60, illustrative_low_pct: 55, illustrative_high_pct: 65 },
      { sleeve: 'Bonds', current_pct: 30, illustrative_low_pct: 25, illustrative_high_pct: 35 },
    ];
    
    const resultOriginal = computeExamplePortfolio(bandsOriginal, 'MID');
    const resultShuffled = computeExamplePortfolio(bandsShuffled, 'MID');
    
    const buildMap = (result: any) => {
      const map = new Map();
      result.allocations.forEach((a: any) => map.set(a.sleeve, a.example_pct));
      return map;
    };
    
    const mapOriginal = buildMap(resultOriginal);
    const mapShuffled = buildMap(resultShuffled);
    
    expect(mapOriginal.get('Equities')).toBe(mapShuffled.get('Equities'));
    expect(mapOriginal.get('Bonds')).toBe(mapShuffled.get('Bonds'));
    expect(mapOriginal.get('Cash')).toBe(mapShuffled.get('Cash'));
  });
});

describe('updated fallback copy', () => {
  it('what differs fallback should not contain banned words', () => {
    const fallbackText = 'Preferences are directionally present, but their impact is constrained by current guardrails, resulting in minimal allocation movement.';
    expect(containsBannedWordStep7(fallbackText)).toBeNull();
  });

  it('what remains similar fallback should not contain banned words', () => {
    const fallbackText = 'Most exposures remain near current levels.';
    expect(containsBannedWordStep7(fallbackText)).toBeNull();
  });

  it('convergence microcopy should not contain banned words', () => {
    const microcopy = 'Under current constraints, all three scenarios converge on similar ranges.';
    expect(containsBannedWordStep7(microcopy)).toBeNull();
  });
});
