import { describe, it, expect } from 'vitest';
import { DEMO_STEPS } from './demoScript';
import { ONBOARDING_STEPS } from '../../components/onboarding-v2/StepIndicator';

const KNOWN_ROUTES = new Set(ONBOARDING_STEPS.map((s) => s.path));

describe('DEMO_STEPS', () => {
  it('covers every canonical onboarding route exactly once, in order', () => {
    expect(DEMO_STEPS.map((s) => s.route)).toEqual(ONBOARDING_STEPS.map((s) => s.path));
  });

  it('every step route is a known onboarding route', () => {
    for (const step of DEMO_STEPS) {
      expect(KNOWN_ROUTES.has(step.route)).toBe(true);
    }
  });

  it('every step has at least one action', () => {
    for (const step of DEMO_STEPS) {
      expect(step.actions.length).toBeGreaterThan(0);
    }
  });

  it('every action has a type valid for its fields', () => {
    const validTypes = new Set(['type', 'select', 'click', 'clickText', 'wait']);
    for (const step of DEMO_STEPS) {
      for (const action of step.actions) {
        expect(validTypes.has(action.type)).toBe(true);
        if (action.type === 'type' || action.type === 'select' || action.type === 'click') {
          expect(action.selector).toBeTruthy();
        }
        if (action.type === 'type' || action.type === 'select') {
          expect(action.value).toBeTruthy();
        }
        if (action.type === 'clickText') {
          expect(action.value).toBeTruthy();
        }
        if (action.type === 'wait') {
          expect(action.ms).toBeGreaterThan(0);
        }
      }
    }
  });

  it('never types a match-percent or persona-mix value into a text field (honesty guard)', () => {
    for (const step of DEMO_STEPS) {
      for (const action of step.actions) {
        if (action.type === 'type' && action.value) {
          expect(action.value.toLowerCase()).not.toMatch(/match.?score|% match/);
        }
      }
    }
  });
});
