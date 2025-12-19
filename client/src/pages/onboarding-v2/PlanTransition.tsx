import { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import OnboardingLayout from '@/components/onboarding-v2/OnboardingLayout';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  ArrowRight, 
  Lock, 
  Download,
  ShieldCheck,
  ShieldAlert,
  XCircle,
  Gauge,
  ToggleRight,
  FileText,
  Circle,
  Info,
} from 'lucide-react';
import { useOnboardingV2Store } from '@/state/onboardingV2Store';
import { 
  buildTransitionTimeline,
  generateTransitionCSV,
  downloadCSV,
  hasAnyRedLight,
  getDominantConstraint,
  type PolicyData,
  type TimelineStep,
} from '@/lib/step9Helpers';

type SafetyStatus = 'GREEN' | 'AMBER' | 'RED';

export default function PlanTransition() {
  const [, navigate] = useLocation();
  const { analysis, beliefs } = useOnboardingV2Store();
  const [csvDownloaded, setCsvDownloaded] = useState(false);
  
  const safetyLights = analysis.result?.safety_lights;
  const tiltsAllowed = beliefs.tilts_allowed;
  const hasRedLight = hasAnyRedLight(safetyLights);
  const overallStatus: SafetyStatus = safetyLights?.overall_status ?? 'GREEN';
  
  const { data: policy, isLoading: policyLoading } = useQuery<PolicyData>({
    queryKey: ['/api/onboarding-v2/policy'],
  });

  const dominantConstraint = useMemo(() => {
    return getDominantConstraint(safetyLights);
  }, [safetyLights]);

  const timeline = useMemo((): TimelineStep[] => {
    if (!policy) return [];
    return buildTransitionTimeline(safetyLights, tiltsAllowed, policy);
  }, [safetyLights, tiltsAllowed, policy]);

  const handleBack = () => {
    navigate('/onboarding-v2/next-steps');
  };

  const handleNext = () => {
    navigate('/onboarding-v2/plan/wrappers');
  };

  const handleDownloadCSV = () => {
    const csv = generateTransitionCSV(timeline, 'v1.0');
    const filename = `unlock-transition-plan-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csv, filename);
    setCsvDownloaded(true);
    
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('plan_download_csv', {
        timeline_steps: timeline.length,
        overall_status: overallStatus,
      });
    }
  };

  const getStatusConfig = (status: SafetyStatus) => {
    switch (status) {
      case 'GREEN':
        return {
          icon: ShieldCheck,
          label: 'All Green',
          color: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-emerald-100 dark:bg-emerald-900/30',
          border: 'border-emerald-200 dark:border-emerald-800',
        };
      case 'AMBER':
        return {
          icon: ShieldAlert,
          label: 'Caution',
          color: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-100 dark:bg-amber-900/30',
          border: 'border-amber-200 dark:border-amber-800',
        };
      case 'RED':
        return {
          icon: XCircle,
          label: 'Action Required',
          color: 'text-rose-600 dark:text-rose-400',
          bg: 'bg-rose-100 dark:bg-rose-900/30',
          border: 'border-rose-200 dark:border-rose-800',
        };
    }
  };

  const statusConfig = getStatusConfig(overallStatus);
  const StatusIcon = statusConfig.icon;

  if (policyLoading) {
    return (
      <OnboardingLayout
        stepId="plan-transition"
        title="Transition considerations"
        description="Loading policy configuration..."
        hideNav={true}
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" />
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout
      stepId="plan-transition"
      title="Transition considerations (illustrative)"
      description="A non-prescriptive sequencing view. Figures elsewhere remain the source of truth."
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

        {/* What Drives Pacing Here - Three Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Safety Status Card */}
          <div 
            className={`rounded-xl border p-4 ${statusConfig.bg} ${statusConfig.border}`}
            data-testid="pacing-card-safety"
            role="region"
            aria-label="Safety status summary"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg ${statusConfig.bg} flex items-center justify-center`}>
                <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)] text-sm">Safety Status</h3>
                <p className={`text-xs font-medium ${statusConfig.color}`}>{statusConfig.label}</p>
              </div>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              {dominantConstraint 
                ? `Dominant driver: ${dominantConstraint.axis} (${dominantConstraint.status})`
                : 'All guardrails within limits'
              }
            </p>
          </div>

          {/* Tilt Status Card */}
          <div 
            className={`rounded-xl border p-4 ${
              tiltsAllowed 
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' 
                : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
            }`}
            data-testid="pacing-card-tilts"
            role="region"
            aria-label="Tilt status"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                tiltsAllowed 
                  ? 'bg-emerald-100 dark:bg-emerald-900/50' 
                  : 'bg-slate-200 dark:bg-slate-700'
              }`}>
                <ToggleRight className={`w-5 h-5 ${
                  tiltsAllowed 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-slate-500 dark:text-slate-400'
                }`} />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)] text-sm">Tilt Status</h3>
                <p className={`text-xs font-medium ${
                  tiltsAllowed 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {tiltsAllowed ? 'Allowed' : 'Locked'}
                </p>
              </div>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              {tiltsAllowed 
                ? 'Preference signals can inform illustrative scenarios.'
                : 'Preferences locked until red constraints are addressed.'
              }
            </p>
          </div>

          {/* Policy Constraints Card */}
          <div 
            className="rounded-xl border p-4 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
            data-testid="pacing-card-policy"
            role="region"
            aria-label="Policy pacing constraints"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                <Gauge className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)] text-sm">Policy Constraints</h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Pacing Limits</p>
              </div>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              {policy?.cgt?.min_reduce_plan_years 
                ? `Transitions paced over min. ${policy.cgt.min_reduce_plan_years} years within policy disposal limits.`
                : 'Pacing limits applied from policy defaults.'
              }
            </p>
          </div>
        </div>

        {/* Illustrative Timeline */}
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-[var(--border)] shadow-sm p-6">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/70 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-[var(--foreground)]">Illustrative timeline</h2>
                <p className="text-sm text-[var(--muted-foreground)]">
                  One possible sequencing based on current inputs (not advice)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {timeline.length === 0 && (
                <span className="text-xs text-[var(--muted-foreground)]">
                  Complete analysis to enable export
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadCSV}
                disabled={timeline.length === 0}
                className="flex items-center gap-2"
                data-testid="button-download-csv"
              >
                <Download className="w-4 h-4" />
                {csvDownloaded ? 'Downloaded' : 'Export CSV'}
              </Button>
            </div>
          </div>

          <ol 
            className="space-y-4" 
            role="list" 
            aria-label="Transition timeline steps"
            data-testid="timeline-list"
          >
            {timeline.map((step, index) => (
              <li 
                key={step.step_number} 
                className="flex items-start gap-4"
                data-testid={`timeline-step-${step.step_number}`}
              >
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {step.step_number}
                  </div>
                  {index < timeline.length - 1 && (
                    <div className="w-0.5 h-8 bg-[var(--border)] mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <h4 className="font-semibold text-[var(--foreground)] mb-1">
                    {step.label}
                  </h4>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {step.notes}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Disclaimer */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-[var(--primary)] flex-shrink-0 mt-0.5" />
          <div className="text-sm text-[var(--muted-foreground)]">
            <p className="font-medium text-[var(--foreground)] mb-1">Important note</p>
            <p>
              This timeline is illustrative only and does not constitute advice. 
              Actual transitions depend on market conditions, personal circumstances, and professional guidance.
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t border-[var(--border)]">
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
            className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 hover:from-[var(--primary)]/90 hover:to-[var(--primary)]/70 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium flex items-center gap-2"
            data-testid="button-next"
          >
            Continue to Wrappers
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
