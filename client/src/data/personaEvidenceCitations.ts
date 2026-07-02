// Sourced, descriptive evidence captions for the live 8-persona set — never a target/reference
// mix, never a match-%. Grounded in docs/2026-07-02-persona-validation-report.md §4. Personas
// verdicted "unsupported as distinct" there (CAPITAL_PRESERVATION) intentionally have no entry:
// citing INCOME_STABILITY's evidence for it would misrepresent a shared evidence base as
// persona-specific support.
const PERSONA_EVIDENCE_CITATIONS: Record<string, string> = {
  FOUNDER_ENTREPRENEUR:
    'LongAngle 2026 HNW Benchmark: founders average 61% concentration in their own company.',
  SELF_DIRECTED_GROWTH:
    'FCA/NMG Investment Platforms 2018: the fully self-directed "Controllers" segment averaged £485k in assets.',
  PROPERTY_LED:
    'ONS Wealth and Assets Survey: property is 38% of top-decile UK wealth; LongAngle 2026: 64% of HNW respondents hold real estate.',
  INCOME_STABILITY:
    'ONS Wealth and Assets Survey: pensions are 36% of top-decile UK wealth — the largest single component.',
  CORE_GROWTH:
    'Accumulation-focused growth investing is well-evidenced across HNW surveys generally (LongAngle 2026, BofA Private Bank 2024).',
  BALANCED_ALLOCATOR:
    'FCA/NMG Investment Platforms 2018: the adviser-on-demand "Optimisers" segment averaged £388k in assets.',
  ALTERNATIVES_FOCUSED:
    'LongAngle 2026: 42% of respondents hold crypto; BofA Private Bank 2024: 49% of younger HNW hold crypto.',
};

export function getPersonaEvidenceCitation(code: string): string | undefined {
  return PERSONA_EVIDENCE_CITATIONS[code];
}
