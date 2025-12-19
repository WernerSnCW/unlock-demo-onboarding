import type { Holding } from '@/state/onboardingV2Store';

export interface WrapperSummary {
  wrapper_code: string;
  wrapper_label: string;
  illustrative_role: string;
  current_value_gbp: number;
  holding_count: number;
  priority_order: number;
}

export interface BedIsaCandidate {
  holding_id: string;
  instrument_name: string;
  value_gbp: number;
  unrealised_gain_gbp: number;
}

export interface TimelineStep {
  step_number: number;
  label: string;
  notes: string;
}

export interface PolicyData {
  wrappers: {
    priority_order: string[];
    bed_and_isa: {
      min_gain_trigger_gbp: number;
    };
  };
  cgt: {
    cgt_allowance_per_year_gbp: number;
    max_annual_disposal_ratio: number;
    min_reduce_plan_years: number;
  };
}

type SafetyStatus = 'GREEN' | 'AMBER' | 'RED';

interface SafetyLights {
  liquidity: SafetyStatus;
  concentration: SafetyStatus;
  illiquids: SafetyStatus;
  overall_status: SafetyStatus;
}

const WRAPPER_LABELS: Record<string, string> = {
  isa: 'ISA',
  sipp: 'SIPP / Pension',
  gia: 'GIA (Taxable)',
  cash: 'Cash Account',
  offshore_bond: 'Offshore Bond',
};

const WRAPPER_ROLES: Record<string, string> = {
  isa: 'Tax-sheltered',
  sipp: 'Pension wrapper',
  gia: 'Taxable',
  cash: 'Liquidity',
  offshore_bond: 'Tax-deferred',
};

export function deriveWrapperPriority(policyPriorityOrder: string[]): string[] {
  return policyPriorityOrder.map(w => w.toLowerCase());
}

export function computeWrapperSummaries(
  holdings: Holding[],
  policyPriorityOrder: string[]
): WrapperSummary[] {
  const priorityOrder = deriveWrapperPriority(policyPriorityOrder);
  const wrapperMap = new Map<string, { value: number; count: number }>();

  for (const holding of holdings) {
    if (!holding.wrapper || holding.value_gbp <= 0) continue;
    const existing = wrapperMap.get(holding.wrapper) ?? { value: 0, count: 0 };
    existing.value += holding.value_gbp;
    existing.count += 1;
    wrapperMap.set(holding.wrapper, existing);
  }

  const presentWrappers = Array.from(wrapperMap.keys());
  
  const summaries: WrapperSummary[] = presentWrappers.map(wrapper => {
    const data = wrapperMap.get(wrapper)!;
    const priorityIndex = priorityOrder.indexOf(wrapper);
    return {
      wrapper_code: wrapper,
      wrapper_label: WRAPPER_LABELS[wrapper] ?? wrapper.toUpperCase(),
      illustrative_role: WRAPPER_ROLES[wrapper] ?? 'Investment wrapper',
      current_value_gbp: data.value,
      holding_count: data.count,
      priority_order: priorityIndex >= 0 ? priorityIndex + 1 : 999,
    };
  });

  return summaries.sort((a, b) => a.priority_order - b.priority_order);
}

export function bedAndIsaEligible(
  holdings: Holding[],
  minGainTriggerGbp: number
): { eligible: boolean; reasons: string[]; candidates: BedIsaCandidate[] } {
  const reasons: string[] = [];
  const candidates: BedIsaCandidate[] = [];

  const giaHoldings = holdings.filter(h => h.wrapper === 'gia' && h.value_gbp > 0);
  const isaHoldings = holdings.filter(h => h.wrapper === 'isa');
  
  if (giaHoldings.length === 0) {
    return { eligible: false, reasons: ['No taxable (GIA) holdings present'], candidates: [] };
  }

  for (const holding of giaHoldings) {
    const gain = holding.cost_basis_gbp !== null 
      ? holding.value_gbp - holding.cost_basis_gbp 
      : 0;
    
    if (gain >= minGainTriggerGbp) {
      candidates.push({
        holding_id: holding.id,
        instrument_name: holding.instrument_name,
        value_gbp: holding.value_gbp,
        unrealised_gain_gbp: gain,
      });
    }
  }

  if (candidates.length > 0) {
    if (isaHoldings.length > 0) {
      reasons.push('ISA holdings present (headroom may exist)');
    } else {
      reasons.push('ISA wrapper could be considered');
    }
    reasons.push(`${candidates.length} GIA holding(s) with unrealised gains above policy threshold`);
    return { eligible: true, reasons, candidates };
  }

  return { eligible: false, reasons: ['No GIA holdings meet the gain threshold for Bed & ISA consideration'], candidates: [] };
}

export function hasAnyRedLight(safetyLights: SafetyLights | null | undefined): boolean {
  if (!safetyLights) return false;
  return (
    safetyLights.liquidity === 'RED' ||
    safetyLights.concentration === 'RED' ||
    safetyLights.illiquids === 'RED'
  );
}

export function getDominantConstraint(
  safetyLights: SafetyLights | null | undefined
): { axis: string; status: SafetyStatus } | null {
  if (!safetyLights) return null;
  
  if (safetyLights.liquidity === 'RED') return { axis: 'Liquidity', status: 'RED' };
  if (safetyLights.concentration === 'RED') return { axis: 'Concentration', status: 'RED' };
  if (safetyLights.illiquids === 'RED') return { axis: 'Illiquids', status: 'RED' };
  if (safetyLights.liquidity === 'AMBER') return { axis: 'Liquidity', status: 'AMBER' };
  if (safetyLights.concentration === 'AMBER') return { axis: 'Concentration', status: 'AMBER' };
  if (safetyLights.illiquids === 'AMBER') return { axis: 'Illiquids', status: 'AMBER' };
  
  return null;
}

export function buildTransitionTimeline(
  safetyLights: SafetyLights | null | undefined,
  tiltsAllowed: boolean,
  policy: PolicyData | null
): TimelineStep[] {
  // Always produce exactly 5 deterministic, constraints-focused items
  // These are diagnostic (why it matters), NOT action-oriented
  
  if (!safetyLights) {
    return [
      { step_number: 1, label: 'Analysis pending', notes: 'Structural considerations require completed guardrail assessment.' },
      { step_number: 2, label: 'Wrapper placement and access', notes: 'How assets are distributed across wrappers affects tax treatment and access, which can influence sequencing and timing.' },
      { step_number: 3, label: 'Pacing limits', notes: 'Policy pacing limits apply. These limits govern how quickly positions could change regardless of preferences.' },
      { step_number: 4, label: 'Preference status vs constraints', notes: 'Preference signals are recorded but pending analysis completion.' },
      { step_number: 5, label: 'Snapshot for discussion', notes: 'The report consolidates guardrails, preferences, scenarios, and these constraints into one shareable summary.' },
    ];
  }

  const hasRed = safetyLights.liquidity === 'RED' || safetyLights.concentration === 'RED' || safetyLights.illiquids === 'RED';
  const hasAmber = safetyLights.liquidity === 'AMBER' || safetyLights.concentration === 'AMBER' || safetyLights.illiquids === 'AMBER';
  const isAllGreen = !hasRed && !hasAmber;

  // Item 1: Structural pressure status (always present; varies by safety status)
  const step1: TimelineStep = isAllGreen
    ? {
        step_number: 1,
        label: 'No immediate structural pressure',
        notes: 'All guardrails are within limits. No structural risks are forcing near-term portfolio change.',
      }
    : {
        step_number: 1,
        label: 'Structural pressure detected',
        notes: 'One or more guardrails are outside limits. Any change would need to reduce pressure on the breached area before preferences can meaningfully apply.',
      };

  // Item 2: Wrapper placement and access (always present)
  const step2: TimelineStep = {
    step_number: 2,
    label: 'Wrapper placement and access',
    notes: 'How assets are distributed across wrappers affects tax treatment and access, which can influence sequencing and timing.',
  };

  // Item 3: Pacing limits (policy dependent; must be traceable)
  const minYears = policy?.cgt?.min_reduce_plan_years;
  const step3: TimelineStep = {
    step_number: 3,
    label: 'Pacing limits',
    notes: minYears
      ? `Policy pacing limits apply (policy: ${minYears} years). These limits govern how quickly positions could change regardless of preferences.`
      : 'Policy pacing limits apply. These limits govern how quickly positions could change regardless of preferences.',
  };

  // Item 4: Preference status vs constraints (always present; varies by tilts_allowed)
  const step4: TimelineStep = {
    step_number: 4,
    label: 'Preference status vs constraints',
    notes: tiltsAllowed
      ? 'Preference signals are active, but only influence changes that remain within structural and policy constraints.'
      : 'Preference signals are recorded but locked while a red item exists. Constraints take priority until the red items are addressed.',
  };

  // Item 5: Snapshot for discussion (always present)
  const step5: TimelineStep = {
    step_number: 5,
    label: 'Snapshot for discussion',
    notes: 'The report consolidates guardrails, preferences, scenarios, and these constraints into one shareable summary.',
  };

  return [step1, step2, step3, step4, step5];
}

export function generateTransitionCSV(
  timeline: TimelineStep[],
  policyVersion: string = 'v1.0'
): string {
  const timestamp = new Date().toISOString();
  
  const headers = ['Step', 'Label', 'Notes'];
  const rows = timeline.map(step => [
    step.step_number.toString(),
    `"${step.label.replace(/"/g, '""')}"`,
    `"${step.notes.replace(/"/g, '""')}"`,
  ]);

  const metaRows = [
    ['# Illustrative Transition Plan'],
    [`# Generated: ${timestamp}`],
    [`# Policy Version: ${policyVersion}`],
    ['# This is not financial advice'],
    [],
    headers,
    ...rows,
  ];

  return metaRows.map(row => row.join(',')).join('\n');
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
