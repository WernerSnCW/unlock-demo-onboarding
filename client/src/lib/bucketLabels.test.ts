import { describe, it, expect } from 'vitest';
import { bucketDisplayLabel } from './bucketLabels';

describe('bucketDisplayLabel', () => {
  it('maps the 8 taxonomy buckets to proper display names', () => {
    expect(bucketDisplayLabel('uk-equity')).toBe('UK equity');
    expect(bucketDisplayLabel('us-equity')).toBe('US equity');
    expect(bucketDisplayLabel('europe-equity')).toBe('Europe equity');
    expect(bucketDisplayLabel('emerging-equity')).toBe('Emerging-markets equity');
    expect(bucketDisplayLabel('global-equity')).toBe('Global equity');
    expect(bucketDisplayLabel('govt-bonds')).toBe('Government bonds');
    expect(bucketDisplayLabel('property')).toBe('Property');
    expect(bucketDisplayLabel('cash')).toBe('Cash');
  });

  it('falls back to sentence-cased dash-splitting for unknown keys (raw asset classes)', () => {
    expect(bucketDisplayLabel('alternatives')).toBe('Alternatives');
    expect(bucketDisplayLabel('private-equity')).toBe('Private equity');
  });
});
