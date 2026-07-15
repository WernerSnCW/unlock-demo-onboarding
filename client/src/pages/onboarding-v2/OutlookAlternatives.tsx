import { useEffect, useMemo, useState } from 'react';
import OnboardingLayout from '@/components/onboarding-v2/OnboardingLayout';
import { useOnboardingV2Store } from '@/state/onboardingV2Store';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { mixFromHoldings, type MixHolding } from '@/lib/portfolioMix';
import { blendBeliefAllocation, renormaliseOverModelledBuckets } from '@/lib/beliefImpact/computeAlignment';
import { apiRequest } from '@/lib/queryClient';
import { formatCurrency } from '@/utils/calculators';
import { bucketDisplayLabel } from '@/lib/bucketLabels';
import BeforeAfterPanel from '@/components/onboarding-v2/BeforeAfterPanel';
import { computeBeforeAfter } from '@/lib/beliefImpact/computeBeforeAfter';

interface BeliefAction {
  type: 'TRIM' | 'ADD' | 'TRANSFER';
  bucket: string;
  deltaPct: number;
  amountGBP: number;
  rationale: string;
  stage: 1 | 2;
}
interface BeliefActionsResponse {
  summary: {
    totalAbsChangePp: number; estTurnoverPp: number; estCostPct: number;
    liquidityNowPct: number; liquidityTargetPct: number; liquidityFixPp?: number;
  };
  staged: { stage1: BeliefAction[]; stage2: BeliefAction[] };
  playbook: string[];
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="p-3 rounded-xl border border-[var(--border)]">
      <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">{label}</p>
      <p className="text-lg font-semibold mt-0.5 tabular-nums">{value}</p>
      {sub && <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{sub}</p>}
    </div>
  );
}

export default function OutlookAlternatives() {
  const [, navigate] = useLocation();
  const { holdings, outlook, summary, intake } = useOnboardingV2Store();
  const [result, setResult] = useState<BeliefActionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStage, setActiveStage] = useState<1 | 2>(1);

  const mix = useMemo(() => {
    const mixHoldings: MixHolding[] = holdings
      .filter((h) => h.value_gbp > 0)
      .map((h) => ({ asset_class: h.asset_class, region: h.region, value_gbp: h.value_gbp }));
    // renormalise: mixFromHoldings normalises over all of bucketFor()'s buckets, which includes
    // europe-equity/emerging-equity (UNMODELLED tier), but targetMix below always sums to 1 over
    // the 6 modelled buckets only (see Task 5's correction note). The raw /api/belief-actions
    // endpoint does NOT renormalise server-side (computeStagedRebalance just diffs target-current
    // as given) — so without this, "need" deltas would be systematically overstated whenever a
    // holding maps to an unmodelled bucket.
    return renormaliseOverModelledBuckets(mixFromHoldings(mixHoldings).mix);
  }, [holdings]);

  const targetMix = useMemo(() => blendBeliefAllocation(outlook.scenario_weights), [outlook.scenario_weights]);

  const beforeAfter = useMemo(() => {
    if (outlook.insufficient_signal) return null;
    return computeBeforeAfter({
      currentMix: mix,
      targetMix,
      scenarioWeights: outlook.scenario_weights,
      riskComfort: intake.risk_comfort,
      portfolioValueGBP: summary.total_investable_value,
      annualEssentialSpendGbp: intake.annual_essential_spend_gbp,
      liquidCashGbp: intake.liquid_cash_gbp,
    });
  // deps: outlook.scenario_weights is listed alongside targetMix (which derives from it) because
  // computeBeforeAfter reads the raw weights directly — exhaustive-deps, not redundancy.
  }, [
    outlook.insufficient_signal, mix, targetMix, outlook.scenario_weights, intake.risk_comfort,
    summary.total_investable_value, intake.annual_essential_spend_gbp, intake.liquid_cash_gbp,
  ]);

  useEffect(() => {
    if (outlook.insufficient_signal) return;
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const response = await apiRequest('POST', '/api/belief-actions', {
          currentMix: mix, targetMix, portfolioValueGBP: summary.total_investable_value,
        });
        const json = await response.json();
        if (!cancelled) setResult(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to compute alternatives');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [outlook.insufficient_signal, mix, targetMix, summary.total_investable_value]);

  const handleBack = () => navigate('/onboarding-v2/outlook-results');
  const handleContinue = () => navigate('/onboarding-v2/next-steps');

  if (outlook.insufficient_signal) {
    return (
      <OnboardingLayout
        stepId="outlook-alternatives"
        title="Illustrative alternatives"
        description="One illustrative way to reduce the impact modelled on the previous page."
        hideNav={true}
      >
        <div className="space-y-6 pt-6">
          <p className="text-sm text-[var(--muted-foreground)]" data-testid="alternatives-insufficient-signal">
            Your answers didn't give us enough signal to model an outlook-driven impact — mostly neutral responses
            cancel each other out. You can go back and answer more definitively, or continue without this view.
          </p>
          <div className="flex justify-between items-center pt-6 border-t border-[var(--border)]">
            <Button variant="outline" onClick={handleBack} data-testid="alternatives-back-button">Back</Button>
            <Button onClick={handleContinue} data-testid="alternatives-continue-button">Continue</Button>
          </div>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout
      stepId="outlook-alternatives"
      title="Illustrative alternatives"
      description="One illustrative way to reduce the impact modelled on the previous page."
      hideNav={true}
    >
      <div className="space-y-6 pt-6">
        <p className="text-sm text-[var(--muted-foreground)]" data-testid="alternatives-non-advice-label">
          This is a simulation based on your outlook, not a recommendation. It shows one illustrative way to reduce
          the impact modelled on the previous page — not advice on what to do.
        </p>

        {loading && <p className="text-sm text-[var(--muted-foreground)]" data-testid="alternatives-loading">Computing illustrative alternatives...</p>}
        {error && <p className="text-sm text-rose-600" data-testid="alternatives-error">{error}</p>}

        {result && (
          <div className="space-y-4" data-testid="alternatives-result">
            <p className="text-sm text-[var(--muted-foreground)]">
              These four numbers size up the move: how much shifts in total, roughly how much would change hands, a rough
              cost, and how your cash cushion would change. Below, the changes are split into what's sensible to do
              <strong> now</strong> versus slower <strong>later</strong> decisions — and a before/after showing what it
              would buy you.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" data-testid="alternatives-summary-grid">
              <StatCard label="Allocation shift" value={`${result.summary.totalAbsChangePp}pp`} sub="all moves added together" />
              <StatCard label="Est. turnover" value={`~${result.summary.estTurnoverPp}pp`} sub="share that changes hands" />
              <StatCard label="Indicative cost" value={`~${(result.summary.estCostPct * 100).toFixed(2)}%`} sub="of modelled portfolio" />
              <StatCard
                label="Liquidity"
                value={`${result.summary.liquidityNowPct}% → ${result.summary.liquidityTargetPct}%`}
                sub={result.summary.liquidityFixPp !== undefined ? `includes +${result.summary.liquidityFixPp}pp top-up` : undefined}
              />
            </div>
            <p className="text-xs text-[var(--muted-foreground)]" data-testid="alternatives-pp-footnote">
              pp = percentage points of your modelled portfolio.
            </p>
            {result.playbook.length > 0 && (
              <div data-testid="alternatives-playbook">
                <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-2">How this was staged</p>
                <ul className="list-disc pl-5 space-y-1">
                  {result.playbook.map((line, i) => (
                    <li key={i} className="text-sm text-[var(--muted-foreground)]">{line}</li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <div className="flex gap-2 mb-3" role="tablist" aria-label="Staged moves" data-testid="alternatives-stage-tabs">
                <button
                  role="tab"
                  aria-selected={activeStage === 1}
                  onClick={() => setActiveStage(1)}
                  className={`px-3 py-1.5 rounded-full border text-sm ${activeStage === 1
                    ? 'border-[var(--foreground)] font-medium'
                    : 'border-[var(--border)] text-[var(--muted-foreground)]'}`}
                  data-testid="stage-tab-1"
                >
                  Do now ({result.staged.stage1.length})
                </button>
                <button
                  role="tab"
                  aria-selected={activeStage === 2}
                  onClick={() => setActiveStage(2)}
                  className={`px-3 py-1.5 rounded-full border text-sm ${activeStage === 2
                    ? 'border-[var(--foreground)] font-medium'
                    : 'border-[var(--border)] text-[var(--muted-foreground)]'}`}
                  data-testid="stage-tab-2"
                >
                  Later — illiquid ({result.staged.stage2.length})
                </button>
              </div>
              {activeStage === 1 && (
                <div role="tabpanel" data-testid="alternatives-stage1">
                  {result.staged.stage1.length === 0 && (
                    <p className="text-sm text-[var(--muted-foreground)]">No moves at this stage.</p>
                  )}
                  {result.staged.stage1.map((a, i) => (
                    <p key={i} className="text-sm">
                      {bucketDisplayLabel(a.bucket)}: {a.type === 'ADD' ? '+' : '-'}{Math.abs(a.deltaPct * 100).toFixed(1)}pp
                      {' '}({formatCurrency(Math.round(a.amountGBP))}) — {a.rationale}
                    </p>
                  ))}
                </div>
              )}
              {activeStage === 2 && (
                <div role="tabpanel" data-testid="alternatives-stage2">
                  {result.staged.stage2.length === 0 && (
                    <p className="text-sm text-[var(--muted-foreground)]">No moves at this stage.</p>
                  )}
                  {result.staged.stage2.map((a, i) => (
                    <p key={i} className="text-sm">
                      {bucketDisplayLabel(a.bucket)}: {a.type === 'ADD' ? '+' : '-'}{Math.abs(a.deltaPct * 100).toFixed(1)}pp
                      {' '}({formatCurrency(Math.round(a.amountGBP))}) — {a.rationale}
                    </p>
                  ))}
                </div>
              )}
            </div>
            {beforeAfter && <BeforeAfterPanel result={beforeAfter} />}
          </div>
        )}

        <p className="text-xs text-[var(--muted-foreground)] pt-2 border-t border-[var(--border)]" data-testid="alternatives-compliance-caption">
          Illustrative only. Not financial advice. Decisions about your own portfolio, in light of your full
          circumstances, are where regulated financial advice is the right place to turn.
        </p>

        <div className="flex justify-between items-center pt-2">
          <Button variant="outline" onClick={handleBack} data-testid="alternatives-back-button">Back</Button>
          <Button onClick={handleContinue} data-testid="alternatives-continue-button">Continue</Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
