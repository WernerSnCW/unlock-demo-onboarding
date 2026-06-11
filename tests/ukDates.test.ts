/**
 * D5 regression: uk_hpi.date is TEXT DD/MM/YYYY. Lexicographic ordering on
 * it sorts by day-of-month, so the "latest" HPI row resolved to the wrong
 * month and ISO-string comparisons against it were meaningless. SQL queries
 * now order/compare via to_date(); these tests pin the JS-side helpers with
 * the cross-year cases that lexicographic ordering gets wrong.
 */
import { describe, it, expect } from 'vitest';
import { parseDdMmYyyy, parseUkOrIsoDate, ddMmYyyyToIso } from '../server/lib/ukDates';

describe('D5: DD/MM/YYYY date handling', () => {
  it('parses DD/MM/YYYY into the correct real date', () => {
    const d = parseDdMmYyyy('13/05/2024');
    expect(d).not.toBeNull();
    expect(d!.getUTCFullYear()).toBe(2024);
    expect(d!.getUTCMonth()).toBe(4); // May — not US-ordered (new Date('13/05/2024') is invalid/US)
    expect(d!.getUTCDate()).toBe(13);
  });

  it('cross-year: parsed order disagrees with lexicographic order and parsed wins', () => {
    const dates = ['30/12/2024', '02/01/2025', '15/06/2024'];

    const lexicographicLatest = [...dates].sort().at(-1);
    expect(lexicographicLatest).toBe('30/12/2024'); // the bug: day-of-month sorts first

    const parsedLatest = [...dates]
      .sort((a, b) => parseDdMmYyyy(a)!.getTime() - parseDdMmYyyy(b)!.getTime())
      .at(-1);
    expect(parsedLatest).toBe('02/01/2025'); // the real latest month
  });

  it('cross-year ISO comparison: DD/MM/YYYY text vs ISO strings was a broken comparison', () => {
    // The old code did: lte(ukHpi.date, '2024-06-01') on DD/MM/YYYY text.
    // '30/12/2023' <= '2024-06-01' is FALSE lexicographically even though
    // Dec 2023 is before Jun 2024. The parsed comparison is correct.
    expect('30/12/2023' <= '2024-06-01').toBe(false); // the bug, pinned
    expect(parseDdMmYyyy('30/12/2023')!.getTime())
      .toBeLessThan(new Date('2024-06-01').getTime()); // the fix
  });

  it('rejects malformed and overflow dates instead of rolling them over', () => {
    expect(parseDdMmYyyy('31/02/2024')).toBeNull();
    expect(parseDdMmYyyy('2024-05-13')).toBeNull();
    expect(parseDdMmYyyy('')).toBeNull();
    expect(parseDdMmYyyy('not a date')).toBeNull();
  });

  it('parseUkOrIsoDate accepts both uk_hpi text dates and ISO PPD dates', () => {
    expect(parseUkOrIsoDate('13/05/2024')!.getUTCMonth()).toBe(4);  // May, DD/MM
    expect(parseUkOrIsoDate('2024-05-13')!.getUTCMonth()).toBe(4);  // May, ISO
    expect(parseUkOrIsoDate('garbage')).toBeNull();
    expect(parseUkOrIsoDate(null)).toBeNull();
  });

  it('converts DD/MM/YYYY to ISO for SQL-side comparisons', () => {
    expect(ddMmYyyyToIso('01/02/2025')).toBe('2025-02-01');
    expect(ddMmYyyyToIso('31/02/2025')).toBeNull();
  });
});
