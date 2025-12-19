import { describe, it, expect } from 'vitest';

const BANNED_VERBS = ['should', 'must', 'buy', 'sell', 'optimise', 'optimize', 'improve', 'save'];

const NARRATIVE_TEXTS = {
  intro: 'This report summarises how your current portfolio behaves when tested against basic safety checks, your stated preferences, and a small set of illustrative scenarios.',
  green: 'In your case, the portfolio does not trigger any immediate structural risks. This means there is no forced need to change your allocation based on liquidity, concentration, or illiquidity concerns.',
  amber: 'There are some emerging structural considerations, which may limit how freely preferences can apply.',
  red: 'One or more structural risks are present, which currently dominate how the portfolio behaves.',
  preferences: 'Your preferences are recognised by the model, but because the portfolio already sits comfortably within the defined constraints, those preferences do not materially change the overall shape of the portfolio in the scenarios shown.',
  notDoing1: 'This report does not tell you to buy or sell anything.',
  notDoing2: 'It does not claim your portfolio is optimal or complete.',
  notDoing3: 'It simply shows how much room there is — or is not — to move within the current constraints.',
  howToUse: 'Investors typically use a snapshot like this to:',
  howToUseBullet1: 'understand whether any structural risks are forcing action',
  howToUseBullet2: 'see whether preferences meaningfully change outcomes',
  howToUseBullet3: 'identify which constraints matter more than specific assets',
  howToUseBullet4: 'support clearer discussions with partners or advisers',
};

describe('Report Narrative Content Validation', () => {
  describe('Banned verbs check (excluding negation contexts)', () => {
    const TEXTS_TO_CHECK = Object.entries(NARRATIVE_TEXTS).filter(
      ([key]) => !key.startsWith('notDoing')
    );
    
    TEXTS_TO_CHECK.forEach(([key, text]) => {
      it(`should not contain banned verbs in "${key}"`, () => {
        const lowerText = text.toLowerCase();
        BANNED_VERBS.forEach(verb => {
          const regex = new RegExp(`\\b${verb}\\b`, 'i');
          expect(regex.test(lowerText)).toBe(false);
        });
      });
    });
  });
  
  describe('"What this is not doing" section uses negation correctly', () => {
    it('should negate buy/sell in context', () => {
      expect(NARRATIVE_TEXTS.notDoing1).toContain('does not tell you to buy or sell');
    });
  });

  describe('Narrative content exists', () => {
    it('should have intro paragraph', () => {
      expect(NARRATIVE_TEXTS.intro.length).toBeGreaterThan(50);
    });

    it('should have green state narrative', () => {
      expect(NARRATIVE_TEXTS.green.length).toBeGreaterThan(50);
    });

    it('should have amber state narrative', () => {
      expect(NARRATIVE_TEXTS.amber.length).toBeGreaterThan(20);
    });

    it('should have red state narrative', () => {
      expect(NARRATIVE_TEXTS.red.length).toBeGreaterThan(20);
    });

    it('should have "not doing" statements', () => {
      expect(NARRATIVE_TEXTS.notDoing1).toContain('does not tell you');
      expect(NARRATIVE_TEXTS.notDoing2).toContain('does not claim');
      expect(NARRATIVE_TEXTS.notDoing3).toContain('room there is');
    });

    it('should have how to use section', () => {
      expect(NARRATIVE_TEXTS.howToUse).toContain('Investors typically use');
    });
  });

  describe('Safety state messages are distinct', () => {
    it('should have different messages for GREEN, AMBER, RED', () => {
      expect(NARRATIVE_TEXTS.green).not.toEqual(NARRATIVE_TEXTS.amber);
      expect(NARRATIVE_TEXTS.amber).not.toEqual(NARRATIVE_TEXTS.red);
      expect(NARRATIVE_TEXTS.green).not.toEqual(NARRATIVE_TEXTS.red);
    });
  });

  describe('Plain English validation', () => {
    it('should use simple vocabulary in intro', () => {
      expect(NARRATIVE_TEXTS.intro).toContain('summarises');
      expect(NARRATIVE_TEXTS.intro).toContain('current portfolio');
    });

    it('should avoid financial jargon in "not doing" section', () => {
      const combined = NARRATIVE_TEXTS.notDoing1 + NARRATIVE_TEXTS.notDoing2 + NARRATIVE_TEXTS.notDoing3;
      expect(combined).not.toContain('rebalance');
      expect(combined).not.toContain('optimize');
      expect(combined).not.toContain('maximize');
    });
  });
});
