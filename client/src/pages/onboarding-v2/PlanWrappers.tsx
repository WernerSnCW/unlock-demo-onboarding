import { useMemo, useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import OnboardingLayout from '@/components/onboarding-v2/OnboardingLayout';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  ArrowRight, 
  Lock, 
  Wallet, 
  Shield, 
  Banknote,
  BadgeCheck,
  Info,
  AlertTriangle,
} from 'lucide-react';
import { useOnboardingV2Store } from '@/state/onboardingV2Store';
import { 
  computeWrapperSummaries, 
  bedAndIsaEligible, 
  hasAnyRedLight,
  type WrapperSummary,
  type PolicyData,
} from '@/lib/step9Helpers';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const WRAPPER_ICONS: Record<string, typeof Wallet> = {
  isa: Wallet,
  sipp: Shield,
  gia: Banknote,
};

const WRAPPER_TOOLTIPS: Record<string, string> = {
  isa: 'Individual Savings Account: Tax-free growth and withdrawals within annual limits.',
  sipp: 'Self-Invested Personal Pension: Tax relief on contributions, accessible from age 55 (rising to 57).',
  gia: 'General Investment Account: Taxable wrapper with no contribution limits.',
  cash: 'Cash holdings: Liquid funds for immediate access.',
  offshore_bond: 'Offshore investment bond: Tax-deferred growth until withdrawal.',
};

export default function PlanWrappers() {
  const [, navigate] = useLocation();
  const { holdings, analysis, beliefs } = useOnboardingV2Store();
  
  const safetyLights = analysis.result?.safety_lights;
  const tiltsAllowed = beliefs.tilts_allowed;
  const hasRedLight = hasAnyRedLight(safetyLights);
  
  const { data: policy, isLoading: policyLoading } = useQuery<PolicyData>({
    queryKey: ['/api/onboarding-v2/policy'],
  });

  const wrapperSummaries = useMemo(() => {
    if (!policy) return [];
    return computeWrapperSummaries(holdings, policy.wrappers.priority_order);
  }, [holdings, policy]);

  const bedIsaResult = useMemo(() => {
    if (!policy) return { eligible: false, reasons: [], candidates: [] };
    return bedAndIsaEligible(holdings, policy.wrappers.bed_and_isa.min_gain_trigger_gbp);
  }, [holdings, policy]);

  const totalValue = useMemo(() => {
    return wrapperSummaries.reduce((sum, w) => sum + w.current_value_gbp, 0);
  }, [wrapperSummaries]);

  const handleBack = () => {
    navigate('/onboarding-v2/plan/transition');
  };

  const handleNext = () => {
    navigate('/onboarding-v2/report');
  };

  const formatCurrency = (value: number): string => {
    if (value === 0) return '—';
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getWrapperIcon = (wrapperCode: string) => {
    const Icon = WRAPPER_ICONS[wrapperCode] ?? Wallet;
    return Icon;
  };

  if (policyLoading) {
    return (
      <OnboardingLayout
        stepId="plan-wrappers"
        title="Wrappers & placement"
        description="Loading policy configuration..."
        hideNav={true}
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" />
        </div>
      </OnboardingLayout>
    );
  }

  const hasWrapperData = wrapperSummaries.length > 0;

  return (
    <OnboardingLayout
      stepId="plan-wrappers"
      title="Wrappers & placement (illustrative)"
      description="This is an illustrative placement view based on the wrappers you told us about. It is not advice."
      hideNav={true}
    >
      <div className="space-y-6 pt-6">
        {/* Guardrail Lock Banner */}
        {hasRedLight && (
          <div 
            className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4"
            data-testid="guardrail-lock-banner"
            role="alert"
            aria-label="Preference signals are locked"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-800/50 flex items-center justify-center flex-shrink-0">
                <Lock className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="font-semibold text-rose-800 dark:text-rose-200 text-sm">
                  Preference signals are locked
                </h3>
                <p className="text-sm text-rose-700 dark:text-rose-300 mt-1">
                  Tilts are locked while a red item exists. Address the red cards in Analysis to enable beliefs.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Missing Data Banner */}
        {!hasWrapperData && (
          <div 
            className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4"
            data-testid="missing-inputs-banner"
            role="alert"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-200 text-sm">
                  Missing wrapper inputs
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  No holdings with wrapper information were captured. Return to Holdings to add this detail.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* What This Shows Explainer */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5">
          <h3 className="font-semibold text-[var(--foreground)] mb-3">What this shows</h3>
          <div className="space-y-3 text-sm text-[var(--muted-foreground)] leading-relaxed">
            <p>
              This view summarises how your current portfolio is held across different account types ('wrappers').
            </p>
            <p>
              Wrappers affect tax treatment, access, and how easily assets can be moved — even when the underlying investments are similar.
            </p>
            <p>
              This section does not suggest changes. It provides context for understanding which parts of your portfolio are more flexible or more constrained.
            </p>
          </div>
        </div>

        {/* Wrapper Placement Table */}
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[var(--border)]">
            <h2 className="font-bold text-[var(--foreground)]">Account / wrapper types captured</h2>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              Based on the holdings you provided, grouped by wrapper type.
            </p>
          </div>

          {hasWrapperData ? (
            <div className="overflow-x-auto">
              <table 
                className="w-full" 
                role="table" 
                aria-label="Wrapper placement summary"
              >
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="text-left text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider px-5 py-3">
                      Wrapper
                    </th>
                    <th className="text-right text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider px-5 py-3">
                      Current Amount
                    </th>
                    <th className="text-center text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider px-5 py-3">
                      Role
                    </th>
                    <th className="text-center text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider px-5 py-3">
                      Priority
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {wrapperSummaries.map((wrapper) => {
                    const Icon = getWrapperIcon(wrapper.wrapper_code);
                    const tooltip = WRAPPER_TOOLTIPS[wrapper.wrapper_code] ?? '';
                    const percentage = totalValue > 0 
                      ? ((wrapper.current_value_gbp / totalValue) * 100).toFixed(1)
                      : '0';

                    return (
                      <tr 
                        key={wrapper.wrapper_code} 
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        data-testid={`wrapper-row-${wrapper.wrapper_code}`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="w-9 h-9 rounded-lg bg-[#00bb77]/10 flex items-center justify-center cursor-help">
                                  <Icon className="w-4 h-4 text-[var(--primary)]" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="text-sm">{tooltip}</p>
                              </TooltipContent>
                            </Tooltip>
                            <div>
                              <span className="font-medium text-[var(--foreground)]">
                                {wrapper.wrapper_label}
                              </span>
                              <span className="text-xs text-[var(--muted-foreground)] ml-2">
                                ({wrapper.holding_count} holding{wrapper.holding_count !== 1 ? 's' : ''})
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="font-semibold text-[var(--foreground)]">
                            {formatCurrency(wrapper.current_value_gbp)}
                          </span>
                          <span className="text-xs text-[var(--muted-foreground)] ml-2">
                            ({percentage}%)
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="text-sm text-[var(--muted-foreground)]">
                            {wrapper.illustrative_role}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          {wrapper.priority_order === 999 ? (
                            <span className="text-xs text-[var(--muted-foreground)]">
                              Other (no default priority)
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#00bb77]/10 text-[var(--primary)] text-xs font-bold">
                              {wrapper.priority_order}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <td className="px-5 py-3 font-semibold text-[var(--foreground)]">
                      Total
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-[var(--foreground)]">
                      {formatCurrency(totalValue)}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-[var(--muted-foreground)]">
              <Wallet className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No wrapper data available</p>
            </div>
          )}
        </div>

        {/* Why This Matters Explainer */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5">
          <h3 className="font-semibold text-[var(--foreground)] mb-3">Why this matters</h3>
          <div className="space-y-3 text-sm text-[var(--muted-foreground)] leading-relaxed">
            <p>
              When considering future changes, different wrappers can introduce practical constraints around timing and access.
            </p>
            <p>
              As a result, portfolio adjustments may occur gradually or unevenly across accounts, even if overall allocation remains similar.
            </p>
          </div>
        </div>

        {/* Bed & ISA Badge (Conditional) */}
        {bedIsaResult.eligible && (
          <div 
            className="bg-[var(--u-green-fill)] rounded-2xl border border-[var(--u-green-line)] p-5"
            data-testid="bed-and-isa-badge"
            role="region"
            aria-label="Bed and ISA consideration"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
                <BadgeCheck className="w-5 h-5 text-[var(--primary-foreground)]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-[var(--foreground)]">
                    Proposed Bed & ISA (illustrative)
                  </h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="p-1 rounded-full hover:bg-[var(--u-green-fill-strong)]">
                        <Info className="w-4 h-4 text-[var(--primary)]" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm">
                        Bed & ISA involves selling holdings in a taxable account and repurchasing within an ISA wrapper. 
                        This is an illustrative consideration only—consult a qualified adviser before proceeding.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-sm text-[var(--muted-foreground)] mb-3">
                  Based on your inputs, a Bed & ISA strategy could be worth considering:
                </p>
                <ul className="space-y-1">
                  {bedIsaResult.reasons.map((reason, index) => (
                    <li 
                      key={index} 
                      className="flex items-start gap-2 text-sm text-[var(--muted-foreground)]"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-1.5 flex-shrink-0" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Priority Order Info */}
        {policy && (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-[var(--primary)] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-[var(--muted-foreground)]">
              <p className="font-medium text-[var(--foreground)] mb-1">Policy wrapper priority</p>
              <p>
                The illustrative placement priority is: {policy.wrappers.priority_order.join(' → ')}.
                Policy default ordering used for this illustrative view. This is not personalised advice.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex flex-col gap-3 pt-6 border-t border-[var(--border)]">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handleBack}
              className="px-6 py-2.5 border-2 border-[var(--border)] bg-white dark:bg-slate-800 text-[var(--foreground)] hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-[var(--primary)] transition-all duration-300"
              data-testid="button-back"
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-[var(--primary)] to-[#00bb77]/80 hover:from-[#00bb77]/90 hover:to-[#00bb77]/70 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium flex items-center gap-2"
              data-testid="button-view-report"
            >
              View Report
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-center text-[var(--muted-foreground)] italic">
            The report consolidates Steps 1–10 into a single shareable snapshot. It is not an extra step.
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
}
