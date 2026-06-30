import { scopeContractLine } from '@/lib/scenarioPlannerView';

export default function ScopeContract({ unmodelledShare }: { unmodelledShare: number }) {
  return (
    <p data-testid="scope-contract" className="text-sm text-[var(--muted-foreground)] border-l-2 border-[var(--border)] pl-3">
      {scopeContractLine(unmodelledShare)}
    </p>
  );
}
