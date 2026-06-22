import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const app = readFileSync(resolve(__dirname, '../client/src/App.tsx'), 'utf8');

describe('legacy wizard retirement', () => {
  it('App.tsx no longer routes the legacy wizard', () => {
    expect(app).not.toContain('/investor-preferences-v2');
    expect(app).not.toContain('/investor-preferences"');
    expect(app).not.toContain('InvestorPreferencesWizard');
  });
  it('the v2 front door is still routed', () => {
    expect(app).toContain('/onboarding-v2/welcome');
  });
});
