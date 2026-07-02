/** Display names for the 8-bucket episode taxonomy. The unmodelled-breakdown list can also
 *  carry raw asset_class strings (bucketFor() returns null for e.g. alternatives), so the
 *  fallback sentence-cases any dash-separated key rather than assuming a Bucket. */
const BUCKET_DISPLAY: Record<string, string> = {
  'uk-equity': 'UK equity',
  'us-equity': 'US equity',
  'europe-equity': 'Europe equity',
  'emerging-equity': 'Emerging-markets equity',
  'global-equity': 'Global equity',
  'govt-bonds': 'Government bonds',
  'property': 'Property',
  'cash': 'Cash',
};

export function bucketDisplayLabel(key: string): string {
  const known = BUCKET_DISPLAY[key];
  if (known) return known;
  const spaced = key.replace(/-/g, ' ').trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
