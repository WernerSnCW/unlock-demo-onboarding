import { describe, it, expect } from 'vitest';
import { getPersonaEvidenceCitation } from './personaEvidenceCitations';

describe('getPersonaEvidenceCitation', () => {
  it('returns a sourced citation for a corroborated persona', () => {
    const citation = getPersonaEvidenceCitation('FOUNDER_ENTREPRENEUR');
    expect(citation).toBeDefined();
    expect(citation).toMatch(/LongAngle 2026/);
  });

  it('returns undefined for CAPITAL_PRESERVATION (unsupported as distinct per the evidence audit)', () => {
    expect(getPersonaEvidenceCitation('CAPITAL_PRESERVATION')).toBeUndefined();
  });

  it('returns undefined for an unknown persona code', () => {
    expect(getPersonaEvidenceCitation('NOT_A_REAL_CODE')).toBeUndefined();
  });

  it('never includes match-percent or score language in any citation', () => {
    const codes = ['CORE_GROWTH', 'SELF_DIRECTED_GROWTH', 'BALANCED_ALLOCATOR', 'INCOME_STABILITY', 'FOUNDER_ENTREPRENEUR', 'PROPERTY_LED', 'ALTERNATIVES_FOCUSED'];
    for (const code of codes) {
      const citation = getPersonaEvidenceCitation(code);
      expect(citation).toBeDefined();
      expect(citation!.toLowerCase()).not.toMatch(/%\s*match|match score/);
    }
  });
});
