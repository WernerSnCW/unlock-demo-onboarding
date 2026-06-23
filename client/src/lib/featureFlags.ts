/** Stage-4 mix-comparison delta is human-gated by compliance (§13) — dark until signed off.
 *  Toggle via Vite env VITE_SCENARIO_DELTA=1 once the §13 gate clears; defaults OFF. */
export const DELTA_ENABLED: boolean =
  typeof import.meta !== 'undefined' && (import.meta as { env?: Record<string, string> }).env?.VITE_SCENARIO_DELTA === '1';
