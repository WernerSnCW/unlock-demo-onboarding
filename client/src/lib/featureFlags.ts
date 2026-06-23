/** Stage-4 mix-comparison delta. DEFAULT ON for the Tony/Will demo feedback round (Tom waived the §13
 *  compliance sign-off gate for the demo). Force OFF with VITE_SCENARIO_DELTA=0. Re-gate to default-OFF
 *  (env opt-in) before any advice-sensitive / production release. */
export const DELTA_ENABLED: boolean =
  typeof import.meta === 'undefined'
    ? true
    : (import.meta as { env?: Record<string, string> }).env?.VITE_SCENARIO_DELTA !== '0';
