import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import OnboardingLayout from '@/components/onboarding-v2/OnboardingLayout';
import { Loader2, ArrowLeft } from 'lucide-react';
import { getLastStepPath } from '@/lib/onboardingSync';

interface TopicTable {
  headers: string[];
  rows: string[][];
}

interface TopicResponse {
  id: string;
  kind: 'concept' | 'rule' | 'formula' | 'citation';
  title: string;
  prose: string[];
  tables: TopicTable[];
}

const KIND_LABEL: Record<TopicResponse['kind'], string> = {
  concept: 'Concept',
  rule: 'Rule',
  formula: 'Formula',
  citation: 'Citation',
};

export default function Methodology() {
  const [topics, setTopics] = useState<TopicResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/onboarding-v2/methodology')
      .then((r) => {
        if (!r.ok) throw new Error(`Request failed: ${r.status}`);
        return r.json();
      })
      .then((d) => setTopics(d.topics))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, []);

  return (
    <OnboardingLayout
      stepId="methodology"
      title="How this works"
      description="The logic, formulas, and evidence behind your analysis — generated from the same code and configuration that powers it, so it never falls out of date."
      hideNav
      skipSessionTracking
    >
      <div className="space-y-8 pt-6">
        {/* This is a reference side-trip (hideNav + skipSessionTracking), so it
            needs its own way back — return to the step the investor came from
            (getLastStepPath isn't overwritten here), falling back to welcome. */}
        <Link
          href={getLastStepPath() ?? '/onboarding-v2/welcome'}
          className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[#00bb77]/40 bg-[#00bb77]/[0.06] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:border-[#00bb77] hover:bg-[#00bb77]/[0.12] transition-colors"
          data-testid="methodology-back"
        >
          <ArrowLeft className="h-4 w-4 text-[var(--primary)]" /> Back to onboarding
        </Link>
        {error && (
          <p className="text-sm text-rose-600 dark:text-rose-400" data-testid="methodology-error">{error}</p>
        )}
        {!topics && !error && (
          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        )}
        {topics?.map((topic) => (
          <div
            key={topic.id}
            className="p-6 rounded-2xl border border-[var(--border)] bg-white dark:bg-slate-800/80"
            data-testid={`methodology-topic-${topic.id}`}
          >
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
              {KIND_LABEL[topic.kind]}
            </span>
            <h3 className="text-lg font-bold text-[var(--foreground)] mt-1 mb-3">{topic.title}</h3>
            <div className="space-y-2">
              {topic.prose.map((p, i) => (
                <p key={i} className="text-sm text-[var(--foreground)] leading-relaxed">{p}</p>
              ))}
            </div>
            {topic.tables.map((table, ti) => (
              <div key={ti} className="overflow-x-auto rounded-xl border border-[var(--border)] mt-4">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-700/50">
                      {table.headers.map((h) => (
                        <th key={h} className="text-left py-2 px-3 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row, ri) => (
                      <tr key={ri} className={ri % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/50 dark:bg-slate-700/30'}>
                        {row.map((cell, ci) => (
                          <td key={ci} className="py-2 px-3">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ))}
      </div>
    </OnboardingLayout>
  );
}
