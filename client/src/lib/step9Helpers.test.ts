import { describe, it, expect } from 'vitest';
import { buildTransitionTimeline, generateTransitionCSV, type PolicyData, type TimelineStep } from './step9Helpers';

const BANNED_WORDS = [
  'should',
  'must',
  'buy',
  'sell',
  'optimise',
  'optimize',
  'efficiency',
  'save',
  'increase',
  'reduce',
];

const BANNED_WORDS_EXCEPTION = 'reduce pressure';

function containsBannedWord(text: string): string | null {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('reduce pressure')) {
    const withoutException = lowerText.replace(/reduce pressure/g, '');
    for (const word of BANNED_WORDS) {
      if (withoutException.includes(word)) {
        return word;
      }
    }
    return null;
  }
  
  for (const word of BANNED_WORDS) {
    if (lowerText.includes(word)) {
      return word;
    }
  }
  return null;
}

const mockPolicy: PolicyData = {
  wrappers: {
    priority_order: ['isa', 'sipp', 'gia'],
    bed_and_isa: {
      min_gain_trigger_gbp: 1000,
    },
  },
  cgt: {
    cgt_allowance_per_year_gbp: 6000,
    max_annual_disposal_ratio: 0.25,
    min_reduce_plan_years: 3,
  },
};

const mockPolicyNoMinYears: PolicyData = {
  wrappers: {
    priority_order: ['isa', 'sipp', 'gia'],
    bed_and_isa: {
      min_gain_trigger_gbp: 1000,
    },
  },
  cgt: {
    cgt_allowance_per_year_gbp: 6000,
    max_annual_disposal_ratio: 0.25,
    min_reduce_plan_years: 0,
  },
};

const greenSafetyLights = {
  liquidity: 'GREEN' as const,
  concentration: 'GREEN' as const,
  illiquids: 'GREEN' as const,
  overall_status: 'GREEN' as const,
};

const redSafetyLights = {
  liquidity: 'RED' as const,
  concentration: 'GREEN' as const,
  illiquids: 'GREEN' as const,
  overall_status: 'RED' as const,
};

const amberSafetyLights = {
  liquidity: 'AMBER' as const,
  concentration: 'GREEN' as const,
  illiquids: 'GREEN' as const,
  overall_status: 'AMBER' as const,
};

describe('buildTransitionTimeline', () => {
  describe('banned words validation', () => {
    it('should not contain banned recommendation verbs when all green', () => {
      const timeline = buildTransitionTimeline(greenSafetyLights, true, mockPolicy);
      
      for (const step of timeline) {
        const labelBanned = containsBannedWord(step.label);
        const notesBanned = containsBannedWord(step.notes);
        
        expect(labelBanned).toBeNull();
        expect(notesBanned).toBeNull();
      }
    });

    it('should not contain banned recommendation verbs when red (except "reduce pressure")', () => {
      const timeline = buildTransitionTimeline(redSafetyLights, false, mockPolicy);
      
      for (const step of timeline) {
        const labelBanned = containsBannedWord(step.label);
        const notesBanned = containsBannedWord(step.notes);
        
        expect(labelBanned).toBeNull();
        expect(notesBanned).toBeNull();
      }
    });

    it('should not contain banned recommendation verbs when amber', () => {
      const timeline = buildTransitionTimeline(amberSafetyLights, true, mockPolicy);
      
      for (const step of timeline) {
        const labelBanned = containsBannedWord(step.label);
        const notesBanned = containsBannedWord(step.notes);
        
        expect(labelBanned).toBeNull();
        expect(notesBanned).toBeNull();
      }
    });

    it('should not contain banned words when safety lights are null', () => {
      const timeline = buildTransitionTimeline(null, false, mockPolicy);
      
      for (const step of timeline) {
        const labelBanned = containsBannedWord(step.label);
        const notesBanned = containsBannedWord(step.notes);
        
        expect(labelBanned).toBeNull();
        expect(notesBanned).toBeNull();
      }
    });
  });

  describe('policy min_years display', () => {
    it('should display years number when policy has min_reduce_plan_years', () => {
      const timeline = buildTransitionTimeline(greenSafetyLights, true, mockPolicy);
      const pacingStep = timeline.find(s => s.label === 'Pacing limits');
      
      expect(pacingStep).toBeDefined();
      expect(pacingStep!.notes).toContain('3 years');
      expect(pacingStep!.notes).toContain('policy:');
    });

    it('should NOT display years number when policy has no min_reduce_plan_years', () => {
      const timeline = buildTransitionTimeline(greenSafetyLights, true, mockPolicyNoMinYears);
      const pacingStep = timeline.find(s => s.label === 'Pacing limits');
      
      expect(pacingStep).toBeDefined();
      expect(pacingStep!.notes).not.toContain('years');
      expect(pacingStep!.notes).not.toContain('policy:');
    });

    it('should NOT display years number when policy is null', () => {
      const timeline = buildTransitionTimeline(greenSafetyLights, true, null);
      const pacingStep = timeline.find(s => s.label === 'Pacing limits');
      
      expect(pacingStep).toBeDefined();
      expect(pacingStep!.notes).not.toContain('years');
    });
  });

  describe('preference status copy', () => {
    it('should use "active" copy when tilts_allowed is true', () => {
      const timeline = buildTransitionTimeline(greenSafetyLights, true, mockPolicy);
      const prefStep = timeline.find(s => s.label === 'Preference status vs constraints');
      
      expect(prefStep).toBeDefined();
      expect(prefStep!.notes).toContain('active');
      expect(prefStep!.notes).not.toContain('locked');
    });

    it('should use "recorded but locked" copy when tilts_allowed is false', () => {
      const timeline = buildTransitionTimeline(redSafetyLights, false, mockPolicy);
      const prefStep = timeline.find(s => s.label === 'Preference status vs constraints');
      
      expect(prefStep).toBeDefined();
      expect(prefStep!.notes).toContain('locked');
      expect(prefStep!.notes).toContain('recorded');
    });

    it('should use "recorded but locked" copy when any safety light is RED', () => {
      const timeline = buildTransitionTimeline(redSafetyLights, false, mockPolicy);
      const prefStep = timeline.find(s => s.label === 'Preference status vs constraints');
      
      expect(prefStep).toBeDefined();
      expect(prefStep!.notes).toContain('Constraints take priority');
    });
  });

  describe('structural pressure status', () => {
    it('should show "No immediate structural pressure" when all green', () => {
      const timeline = buildTransitionTimeline(greenSafetyLights, true, mockPolicy);
      const structureStep = timeline[0];
      
      expect(structureStep.label).toBe('No immediate structural pressure');
      expect(structureStep.notes).toContain('within limits');
    });

    it('should show "Structural pressure detected" when red or amber', () => {
      const timeline = buildTransitionTimeline(redSafetyLights, false, mockPolicy);
      const structureStep = timeline[0];
      
      expect(structureStep.label).toBe('Structural pressure detected');
      expect(structureStep.notes).toContain('outside limits');
    });
  });

  describe('timeline structure', () => {
    it('should always return exactly 5 items', () => {
      const greenTimeline = buildTransitionTimeline(greenSafetyLights, true, mockPolicy);
      const redTimeline = buildTransitionTimeline(redSafetyLights, false, mockPolicy);
      const nullTimeline = buildTransitionTimeline(null, false, mockPolicy);
      
      expect(greenTimeline).toHaveLength(5);
      expect(redTimeline).toHaveLength(5);
      expect(nullTimeline).toHaveLength(5);
    });

    it('should always end with "Snapshot for discussion"', () => {
      const timeline = buildTransitionTimeline(greenSafetyLights, true, mockPolicy);
      const lastStep = timeline[timeline.length - 1];
      
      expect(lastStep.label).toBe('Snapshot for discussion');
    });
  });
});

describe('generateTransitionCSV', () => {
  it('should contain the same timeline items shown in UI', () => {
    const timeline = buildTransitionTimeline(greenSafetyLights, true, mockPolicy);
    const csv = generateTransitionCSV(timeline, 'v1.0');
    
    for (const step of timeline) {
      expect(csv).toContain(step.label);
      expect(csv).toContain(step.notes.substring(0, 20));
    }
  });

  it('should include timestamp and policy version', () => {
    const timeline = buildTransitionTimeline(greenSafetyLights, true, mockPolicy);
    const csv = generateTransitionCSV(timeline, 'v1.0');
    
    expect(csv).toContain('Generated:');
    expect(csv).toContain('Policy Version: v1.0');
  });

  it('should include not-advice disclaimer', () => {
    const timeline = buildTransitionTimeline(greenSafetyLights, true, mockPolicy);
    const csv = generateTransitionCSV(timeline, 'v1.0');
    
    expect(csv).toContain('not financial advice');
  });
});
