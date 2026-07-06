/** Stage-4 mix-comparison delta. DEFAULT ON for the Tony/Will demo feedback round (Tom waived the §13
 *  compliance sign-off gate for the demo). Force OFF with VITE_SCENARIO_DELTA=0. Re-gate to default-OFF
 *  (env opt-in) before any advice-sensitive / production release. */
export const DELTA_ENABLED: boolean =
  typeof import.meta === 'undefined'
    ? true
    : (import.meta as { env?: Record<string, string> }).env?.VITE_SCENARIO_DELTA !== '0';

/** Safety-light self-placement (RED-gate softening). DEFAULT OFF — this is a Consumer Duty /
 *  advice-boundary judgment call (see Intelligence/decisions/2026-07-04-belief-tilt-red-gate-softening-V1.md
 *  in the vault) and must not be exposed to any investor before Werner/Vine-Lott/Corke sign-off.
 *  Opt in locally with VITE_SAFETY_LIGHT_ACKNOWLEDGMENT=1. */
export const SAFETY_LIGHT_ACKNOWLEDGMENT_ENABLED: boolean =
  typeof import.meta === 'undefined'
    ? false
    : (import.meta as { env?: Record<string, string> }).env?.VITE_SAFETY_LIGHT_ACKNOWLEDGMENT === '1';
