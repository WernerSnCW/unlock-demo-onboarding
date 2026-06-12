// uk_hpi.date is TEXT in DD/MM/YYYY format (shared/schema.ts) — lexicographic
// ordering on it sorts by day-of-month, so "latest" resolved to the wrong
// month and cross-year comparisons were meaningless (review finding D5).
// SQL-side queries order/compare via to_date(date, 'DD/MM/YYYY'); these
// helpers cover the JS side and are unit-tested with cross-year dates.

const DD_MM_YYYY = /^(\d{2})\/(\d{2})\/(\d{4})$/;

export function parseDdMmYyyy(value: string): Date | null {
  const m = DD_MM_YYYY.exec((value ?? '').trim());
  if (!m) return null;
  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);
  const d = new Date(Date.UTC(yyyy, mm - 1, dd));
  // Reject overflow dates like 31/02/2024 (Date would roll them over).
  if (d.getUTCFullYear() !== yyyy || d.getUTCMonth() !== mm - 1 || d.getUTCDate() !== dd) {
    return null;
  }
  return d;
}

// Tolerant parser for fields that may hold DD/MM/YYYY (uk_hpi) or an
// ISO/parseable date (PPD date_of_transfer, client input). DD/MM/YYYY is
// tried first because new Date('13/05/2024') is US-ordered or Invalid Date.
export function parseUkOrIsoDate(value: string | Date | null | undefined): Date | null {
  if (value == null) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const uk = parseDdMmYyyy(value);
  if (uk) return uk;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

export function ddMmYyyyToIso(value: string): string | null {
  const d = parseDdMmYyyy(value);
  return d ? d.toISOString().split('T')[0] : null;
}
