import type { ScreenHelp } from './types';
import { intakeHelp } from './intake';
import { holdingsHelp } from './holdings';
import { analysisHelp } from './analysis';
import { beliefsHelp } from './beliefs';
import { targetHelp } from './target';
import { nextStepsHelp } from './next-steps';
import { planTransitionHelp } from './plan-transition';
import { planWrappersHelp } from './plan-wrappers';

export type { ScreenHelp, HelpSection, HelpBlock, HelpSectionKind } from './types';

/**
 * Screen-explainer content, keyed by the screen's OnboardingLayout stepId.
 * Add a screen by authoring a `<step>.ts` file and registering it here — the
 * help drawer (and, later, a full guide page) pick it up automatically.
 *
 * Deliberately available from Intake onward: the intro screens (welcome,
 * method) don't have entries, so the help affordance first appears at Intake.
 */
export const SCREEN_HELP: Record<string, ScreenHelp> = {
  [intakeHelp.stepId]: intakeHelp,
  [holdingsHelp.stepId]: holdingsHelp,
  [analysisHelp.stepId]: analysisHelp,
  [beliefsHelp.stepId]: beliefsHelp,
  [targetHelp.stepId]: targetHelp,
  [nextStepsHelp.stepId]: nextStepsHelp,
  [planTransitionHelp.stepId]: planTransitionHelp,
  [planWrappersHelp.stepId]: planWrappersHelp,
};

/** Returns the help content for a screen, or null if none is authored yet. */
export function getScreenHelp(stepId: string | undefined | null): ScreenHelp | null {
  if (!stepId) return null;
  return SCREEN_HELP[stepId] ?? null;
}
