import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CatalogueEntry {
  code: string;
  label: string;
  one_liner: string;
  plan_focus_bullets: string[];
  risks_bullets: string[];
  emphases: { trait: string; label: string; weight: number }[];
}

export default function PersonaGallery({ currentCode }: { currentCode: string }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { data } = useQuery<{ personas: CatalogueEntry[] }>({
    queryKey: ['/api/onboarding-v2/personas'],
    enabled: open,
  });

  return (
    <div className="mt-4" data-testid="persona-gallery">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        aria-expanded={open}
        data-testid="persona-gallery-toggle"
      >
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        See all 8 investor profiles
      </button>
      {open && data && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.personas.map((p) => {
            const isCurrent = p.code === currentCode;
            const isExpanded = expanded === p.code;
            return (
              <button
                key={p.code}
                type="button"
                onClick={() => setExpanded(isExpanded ? null : p.code)}
                aria-expanded={isExpanded}
                className={`text-left p-4 rounded-xl border transition-colors ${isCurrent
                  ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                  : 'border-[var(--border)] hover:border-[var(--primary)]/50'}`}
                data-testid={`persona-gallery-card-${p.code}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{p.label}</p>
                  {isCurrent && (
                    <span className="text-[10px] uppercase tracking-wider text-[var(--primary)] border border-[var(--primary)] rounded-full px-2 py-0.5 flex-shrink-0">
                      Your profile
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">{p.one_liner}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  Weighs most: {p.emphases.map((e) => e.label.toLowerCase()).join(', ')}
                </p>
                {isExpanded && (
                  <div className="mt-2 space-y-2" data-testid={`persona-gallery-detail-${p.code}`}>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">Plan focus</p>
                      <ul className="list-disc pl-4 text-xs text-[var(--muted-foreground)]">
                        {p.plan_focus_bullets.map((b, i) => <li key={i}>{b}</li>)}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">Risks to watch</p>
                      <ul className="list-disc pl-4 text-xs text-[var(--muted-foreground)]">
                        {p.risks_bullets.map((b, i) => <li key={i}>{b}</li>)}
                      </ul>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
