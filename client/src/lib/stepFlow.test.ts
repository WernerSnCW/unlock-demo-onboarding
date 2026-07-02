import { describe, it, expect } from 'vitest';
import { ONBOARDING_STEPS, TOTAL_STEPS } from '../components/onboarding-v2/StepIndicator';

describe('Onboarding Step Flow Validation', () => {
  it('should have exactly 13 steps', () => {
    expect(ONBOARDING_STEPS.length).toBe(13);
    expect(TOTAL_STEPS).toBe(13);
  });

  it('should have TOTAL_STEPS equal to ONBOARDING_STEPS.length', () => {
    expect(TOTAL_STEPS).toBe(ONBOARDING_STEPS.length);
  });

  it('should not include "report" in step IDs', () => {
    const stepIds = ONBOARDING_STEPS.map(s => s.id);
    expect(stepIds).not.toContain('report');
  });

  it('should not include "report" in step paths', () => {
    const paths = ONBOARDING_STEPS.map(s => s.path);
    const hasReportPath = paths.some(p => p.toLowerCase().includes('report'));
    expect(hasReportPath).toBe(false);
  });

  it('should have unique step IDs', () => {
    const stepIds = ONBOARDING_STEPS.map(s => s.id);
    const uniqueIds = new Set(stepIds);
    expect(uniqueIds.size).toBe(stepIds.length);
  });

  it('should have unique step paths', () => {
    const paths = ONBOARDING_STEPS.map(s => s.path);
    const uniquePaths = new Set(paths);
    expect(uniquePaths.size).toBe(paths.length);
  });

  it('should start with welcome step', () => {
    expect(ONBOARDING_STEPS[0].id).toBe('welcome');
  });

  it('should end with plan-wrappers step (Step 13)', () => {
    expect(ONBOARDING_STEPS[12].id).toBe('plan-wrappers');
  });

  it('should have correct step order', () => {
    const expectedOrder = [
      'welcome',
      'method',
      'intake',
      'holdings',
      'analysis',
      'beliefs',
      'target',
      'outlook',
      'outlook-results',
      'outlook-alternatives',
      'next-steps',
      'plan-transition',
      'plan-wrappers',
    ];
    const actualOrder = ONBOARDING_STEPS.map(s => s.id);
    expect(actualOrder).toEqual(expectedOrder);
  });

  it('all steps should have valid paths starting with /onboarding-v2/', () => {
    ONBOARDING_STEPS.forEach(step => {
      expect(step.path).toMatch(/^\/onboarding-v2\//);
    });
  });

  it('all steps should have non-empty labels', () => {
    ONBOARDING_STEPS.forEach(step => {
      expect(step.label.length).toBeGreaterThan(0);
    });
  });
});
