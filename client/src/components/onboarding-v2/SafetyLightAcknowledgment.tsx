import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { SAFETY_LIGHT_PERSPECTIVES, type SafetyLightType } from '@/data/safetyLightPerspectives';
import { useOnboardingV2Store, type SafetyLightStance } from '@/state/onboardingV2Store';

const LIGHT_LABEL: Record<SafetyLightType, string> = {
  liquidity: 'Liquidity',
  concentration: 'Concentration',
  illiquids: 'Illiquid exposure',
};

const STANCE_LABEL: Record<SafetyLightStance, string> = {
  REDUCE: 'Closer to reduce this',
  HOLD_DELIBERATE: 'Closer to hold this as-is',
  UNSURE: 'Not sure yet',
};

function PerspectiveCard({ title, valuePoints, tradeOff }: { title: string; valuePoints: string[]; tradeOff: string }) {
  return (
    <div className="flex-1 p-4 rounded-xl border border-[var(--border)] bg-white dark:bg-slate-800/60">
      <h5 className="text-sm font-semibold text-[var(--foreground)] mb-2">{title}</h5>
      <ul className="space-y-1.5 mb-3">
        {valuePoints.map((point, i) => (
          <li key={i} className="text-xs text-[var(--foreground)] leading-relaxed">{point}</li>
        ))}
      </ul>
      <p className="text-xs text-[var(--muted-foreground)] italic leading-relaxed">Trade-off: {tradeOff}</p>
    </div>
  );
}

export default function SafetyLightAcknowledgment({ light }: { light: SafetyLightType }) {
  const [expanded, setExpanded] = useState(false);
  const stance = useOnboardingV2Store((s) => s.safetyLightResponse.responses[light]?.stance);
  const setSafetyLightResponse = useOnboardingV2Store((s) => s.setSafetyLightResponse);
  const perspectives = SAFETY_LIGHT_PERSPECTIVES[light];

  return (
    <div className="p-5 rounded-2xl border border-[var(--border)] bg-slate-50 dark:bg-slate-900/40" data-testid={`safety-light-acknowledgment-${light}`}>
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center justify-between w-full text-left"
        data-testid={`safety-light-acknowledgment-toggle-${light}`}
      >
        <span className="text-sm font-semibold text-[var(--foreground)]">
          {LIGHT_LABEL[light]} is flagged — how does this fit your situation?
        </span>
        {expanded ? <ChevronUp className="w-4 h-4 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 flex-shrink-0" />}
      </button>

      {expanded && (
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <PerspectiveCard
            title="Considerations for reducing this"
            valuePoints={perspectives.REDUCE.valuePoints}
            tradeOff={perspectives.REDUCE.tradeOff}
          />
          <PerspectiveCard
            title="Considerations for holding this as-is"
            valuePoints={perspectives.HOLD_DELIBERATE.valuePoints}
            tradeOff={perspectives.HOLD_DELIBERATE.tradeOff}
          />
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {(['REDUCE', 'HOLD_DELIBERATE', 'UNSURE'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSafetyLightResponse(light, s)}
            data-testid={`safety-light-acknowledgment-stance-${light}-${s}`}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              stance === s
                ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                : 'bg-white dark:bg-slate-800 text-[var(--foreground)] border-[var(--border)] hover:border-[var(--primary)]'
            }`}
          >
            {STANCE_LABEL[s]}
          </button>
        ))}
      </div>

      {stance && (
        <p className="mt-3 text-xs text-[var(--muted-foreground)]" data-testid={`safety-light-acknowledgment-recorded-${light}`}>
          Recorded: {STANCE_LABEL[stance]}.{' '}
          {stance === 'HOLD_DELIBERATE'
            ? 'Preference signals for this area are unlocked based on what you told us.'
            : 'Preference signals for this area stay locked until this is addressed or you tell us it’s a deliberate choice.'}
        </p>
      )}
    </div>
  );
}
