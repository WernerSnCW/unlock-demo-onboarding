/**
 * Screen-explainer content model.
 *
 * Each onboarding screen has one `ScreenHelp` entry, keyed by the screen's
 * `stepId` (the same id passed to <OnboardingLayout>). The help drawer looks
 * the entry up automatically, so authoring a new screen's explainer is purely
 * a content edit here — no component wiring.
 *
 * AUDIENCE: investors reviewing the flow, non-technical. Plain language, but
 * the rules/logic must be accurate to the code so they can critique it.
 *
 * INLINE HIGHLIGHT LINKS: inside any text string you can write
 *   [[the words the reader sees|anchor-key]]
 * The renderer turns that into a clickable term; clicking it scrolls the screen
 * to the element tagged `data-help-anchor="anchor-key"` and pulses a green ring
 * around it. If the screen has no matching anchor, the term renders as plain
 * emphasised text (safe no-op) — so links can be authored ahead of the anchors.
 */

/** A block of content within a section. */
export type HelpBlock =
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'note'; text: string };

/**
 * Section styling hint:
 * - 'default'    — normal section
 * - 'rules'      — "The rules we apply": monospace-ish, guardrail feel
 * - 'scrutinise' — "Worth scrutinising": amber-tinted, invites challenge
 */
export type HelpSectionKind = 'default' | 'rules' | 'scrutinise';

export interface HelpSection {
  heading: string;
  kind?: HelpSectionKind;
  blocks: HelpBlock[];
}

export interface ScreenHelp {
  /** Matches the screen's OnboardingLayout stepId. */
  stepId: string;
  /** Screen name shown at the top of the drawer. */
  title: string;
  /** One-line plain summary shown under the title. */
  intro: string;
  sections: HelpSection[];
}
