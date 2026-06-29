import { RECOVERY_COUNTER_BEAT } from '@/data/scenarioPlannerCopy';
import type { Circumstance } from '@/lib/episodeSalience';

export default function RecoveryCounterBeat({ circumstance }: { circumstance: Circumstance }) {
  if (!circumstance.decumulating && !circumstance.shortHorizon) return null;
  return (
    <p data-testid="recovery-counter-beat"
       className="text-sm rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-900/20 p-3">
      {RECOVERY_COUNTER_BEAT}
    </p>
  );
}
