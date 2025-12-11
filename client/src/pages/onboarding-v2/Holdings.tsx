import { useEffect } from 'react';
import OnboardingLayout from '@/components/onboarding-v2/OnboardingLayout';
import { Plus, Trash2, AlertCircle, PieChart, TrendingUp, Lock } from 'lucide-react';
import { useOnboardingV2Store, Holding } from '@/state/onboardingV2Store';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

const WRAPPERS = [
  { value: 'isa', label: 'ISA' },
  { value: 'sipp', label: 'SIPP / Pension' },
  { value: 'gia', label: 'GIA (General)' },
  { value: 'cash', label: 'Cash Account' },
  { value: 'offshore_bond', label: 'Offshore Bond' },
  { value: 'other', label: 'Other' },
];

const ASSET_CLASSES = [
  { value: 'equity', label: 'Equity' },
  { value: 'bond', label: 'Bond' },
  { value: 'cash', label: 'Cash' },
  { value: 'property', label: 'Property' },
  { value: 'alternatives', label: 'Alternatives' },
  { value: 'other', label: 'Other' },
];

const REGIONS = [
  { value: 'uk', label: 'UK' },
  { value: 'us', label: 'US' },
  { value: 'europe', label: 'Europe' },
  { value: 'global', label: 'Global' },
  { value: 'emerging', label: 'Emerging Markets' },
  { value: 'other', label: 'Other' },
];

interface HoldingErrors {
  [holdingId: string]: {
    instrument_name?: string;
    wrapper?: string;
    asset_class?: string;
    value_gbp?: string;
  };
}

export default function Holdings() {
  const { holdings, summary, addHolding, updateHolding, removeHolding, recalculateSummary, resetAnalysis } = useOnboardingV2Store();
  const [, navigate] = useLocation();
  const [errors, setErrors] = useState<HoldingErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    recalculateSummary();
  }, []);

  const handleUpdateHolding = (id: string, field: keyof Holding, value: string | number | boolean) => {
    updateHolding(id, { [field]: value });
    if (errors[id]?.[field as keyof HoldingErrors[string]]) {
      setErrors((prev) => ({
        ...prev,
        [id]: { ...prev[id], [field]: undefined },
      }));
    }
    setGlobalError(null);
  };

  const validateHoldings = (): boolean => {
    const newErrors: HoldingErrors = {};
    let isValid = true;

    const validHoldings = holdings.filter(h => 
      h.instrument_name || h.value_gbp > 0 || h.wrapper || h.asset_class
    );

    if (validHoldings.length === 0) {
      setGlobalError('Please add at least one holding with a positive value.');
      return false;
    }

    validHoldings.forEach((holding) => {
      const holdingErrors: HoldingErrors[string] = {};

      if (!holding.instrument_name.trim()) {
        holdingErrors.instrument_name = 'Name required';
        isValid = false;
      }
      if (!holding.wrapper) {
        holdingErrors.wrapper = 'Wrapper required';
        isValid = false;
      }
      if (!holding.asset_class) {
        holdingErrors.asset_class = 'Asset class required';
        isValid = false;
      }
      if (!holding.value_gbp || holding.value_gbp <= 0) {
        holdingErrors.value_gbp = 'Enter a positive value';
        isValid = false;
      }

      if (Object.keys(holdingErrors).length > 0) {
        newErrors[holding.id] = holdingErrors;
      }
    });

    setErrors(newErrors);
    setGlobalError(isValid ? null : 'Please fix the errors below before continuing.');
    return isValid;
  };

  const handleNext = () => {
    if (validateHoldings()) {
      resetAnalysis();
      navigate('/onboarding-v2/analysis');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getConcentrationColor = (pct: number) => {
    if (pct > 20) return 'text-[var(--destructive)]';
    if (pct > 15) return 'text-[var(--warning)]';
    return 'text-[var(--success)]';
  };

  const getIlliquidColor = (pct: number) => {
    if (pct > 10) return 'text-[var(--destructive)]';
    if (pct > 7) return 'text-[var(--warning)]';
    return 'text-[var(--success)]';
  };

  return (
    <OnboardingLayout
      stepId="holdings"
      title="Your Current Holdings"
      description="Enter your investment holdings. We'll use this to analyse your portfolio and provide personalised recommendations."
      hideNav
    >
      <div className="space-y-6">
        <div className="grid lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 border border-[var(--border)] rounded-lg bg-[var(--muted)]/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-[var(--primary)]" />
              <span className="text-sm text-[var(--muted-foreground)]">Total Value</span>
            </div>
            <div className="text-xl font-bold text-[var(--foreground)]" data-testid="summary-total-value">
              {formatCurrency(summary.total_investable_value)}
            </div>
            <div className="text-xs text-[var(--muted-foreground)]">
              {summary.holding_count} holding{summary.holding_count !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="p-4 border border-[var(--border)] rounded-lg bg-[var(--muted)]/20">
            <div className="flex items-center gap-2 mb-2">
              <PieChart className="w-4 h-4 text-[var(--secondary)]" />
              <span className="text-sm text-[var(--muted-foreground)]">Largest Holding</span>
            </div>
            <div className={`text-xl font-bold ${getConcentrationColor(summary.largest_line_pct)}`} data-testid="summary-concentration">
              {formatPercent(summary.largest_line_pct)}
            </div>
            <div className="text-xs text-[var(--muted-foreground)]">
              {summary.largest_line_pct > 20 ? 'High concentration' : summary.largest_line_pct > 15 ? 'Moderate' : 'Diversified'}
            </div>
          </div>

          <div className="p-4 border border-[var(--border)] rounded-lg bg-[var(--muted)]/20">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-[var(--accent)]" />
              <span className="text-sm text-[var(--muted-foreground)]">Illiquid Assets</span>
            </div>
            <div className={`text-xl font-bold ${getIlliquidColor(summary.illiquid_pct)}`} data-testid="summary-illiquid">
              {formatPercent(summary.illiquid_pct)}
            </div>
            <div className="text-xs text-[var(--muted-foreground)]">
              {summary.illiquid_pct > 10 ? 'High illiquidity' : summary.illiquid_pct > 7 ? 'Moderate' : 'Good liquidity'}
            </div>
          </div>

          <div className="p-4 border border-[var(--primary)]/30 rounded-lg bg-[var(--primary)]/5">
            <div className="text-sm text-[var(--muted-foreground)] mb-1">Portfolio Status</div>
            <div className="text-lg font-semibold text-[var(--foreground)]">
              {summary.holding_count === 0
                ? 'Add holdings'
                : summary.largest_line_pct > 20 || summary.illiquid_pct > 10
                ? 'Review needed'
                : 'Looking good'}
            </div>
          </div>
        </div>

        {globalError && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--destructive)]/10 border border-[var(--destructive)]/30">
            <AlertCircle className="w-4 h-4 text-[var(--destructive)]" />
            <span className="text-sm text-[var(--destructive)]">{globalError}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-3 px-2 text-sm font-medium text-[var(--muted-foreground)]">Name</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-[var(--muted-foreground)]">Ticker</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-[var(--muted-foreground)]">Wrapper</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-[var(--muted-foreground)]">Asset Class</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-[var(--muted-foreground)]">Region</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-[var(--muted-foreground)]">Value (£)</th>
                <th className="text-center py-3 px-2 text-sm font-medium text-[var(--muted-foreground)]">Illiquid</th>
                <th className="py-3 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((holding, index) => (
                <tr key={holding.id} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/20">
                  <td className="py-2 px-2">
                    <Input
                      value={holding.instrument_name}
                      onChange={(e) => handleUpdateHolding(holding.id, 'instrument_name', e.target.value)}
                      placeholder="e.g. Vanguard FTSE 100"
                      className={`h-9 ${errors[holding.id]?.instrument_name ? 'border-[var(--destructive)]' : ''}`}
                      data-testid={`input-holding-name-${index}`}
                    />
                    {errors[holding.id]?.instrument_name && (
                      <span className="text-xs text-[var(--destructive)]">{errors[holding.id].instrument_name}</span>
                    )}
                  </td>
                  <td className="py-2 px-2">
                    <Input
                      value={holding.ticker}
                      onChange={(e) => handleUpdateHolding(holding.id, 'ticker', e.target.value.toUpperCase())}
                      placeholder="VUKE"
                      className="h-9 w-20"
                      data-testid={`input-holding-ticker-${index}`}
                    />
                  </td>
                  <td className="py-2 px-2">
                    <Select
                      value={holding.wrapper}
                      onValueChange={(v) => handleUpdateHolding(holding.id, 'wrapper', v)}
                    >
                      <SelectTrigger 
                        className={`h-9 w-28 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 ${errors[holding.id]?.wrapper ? 'border-[var(--destructive)]' : ''}`}
                        data-testid={`select-holding-wrapper-${index}`}
                      >
                        <SelectValue placeholder="Select" className="text-gray-900 dark:text-gray-100" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800">
                        {WRAPPERS.map((w) => (
                          <SelectItem key={w.value} value={w.value} className="text-gray-900 dark:text-gray-100">{w.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-2 px-2">
                    <Select
                      value={holding.asset_class}
                      onValueChange={(v) => handleUpdateHolding(holding.id, 'asset_class', v)}
                    >
                      <SelectTrigger 
                        className={`h-9 w-28 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 ${errors[holding.id]?.asset_class ? 'border-[var(--destructive)]' : ''}`}
                        data-testid={`select-holding-asset-class-${index}`}
                      >
                        <SelectValue placeholder="Select" className="text-gray-900 dark:text-gray-100" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800">
                        {ASSET_CLASSES.map((a) => (
                          <SelectItem key={a.value} value={a.value} className="text-gray-900 dark:text-gray-100">{a.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-2 px-2">
                    <Select
                      value={holding.region}
                      onValueChange={(v) => handleUpdateHolding(holding.id, 'region', v)}
                    >
                      <SelectTrigger className="h-9 w-28 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800" data-testid={`select-holding-region-${index}`}>
                        <SelectValue placeholder="Select" className="text-gray-900 dark:text-gray-100" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800">
                        {REGIONS.map((r) => (
                          <SelectItem key={r.value} value={r.value} className="text-gray-900 dark:text-gray-100">{r.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-2 px-2">
                    <Input
                      type="number"
                      min="0"
                      step="100"
                      value={holding.value_gbp || ''}
                      onChange={(e) => handleUpdateHolding(holding.id, 'value_gbp', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className={`h-9 w-28 ${errors[holding.id]?.value_gbp ? 'border-[var(--destructive)]' : ''}`}
                      data-testid={`input-holding-value-${index}`}
                    />
                  </td>
                  <td className="py-2 px-2 text-center">
                    <Checkbox
                      checked={holding.illiquid}
                      onCheckedChange={(checked) => handleUpdateHolding(holding.id, 'illiquid', checked === true)}
                      data-testid={`checkbox-holding-illiquid-${index}`}
                    />
                  </td>
                  <td className="py-2 px-2">
                    {holdings.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeHolding(holding.id)}
                        className="h-8 w-8 p-0 text-[var(--muted-foreground)] hover:text-[var(--destructive)]"
                        data-testid={`button-remove-holding-${index}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Button
          variant="outline"
          onClick={addHolding}
          className="gap-2 text-[var(--primary)] border-[var(--primary)] hover:bg-[var(--primary)]/10"
          data-testid="button-add-holding"
        >
          <Plus className="w-4 h-4" />
          Add another holding
        </Button>

        <p className="text-center text-xs text-[var(--muted-foreground)]">
          Mark holdings as "Illiquid" if they can't be easily sold (e.g. property, private equity, collectibles).
        </p>

        <div className="flex justify-between items-center pt-6 border-t border-[var(--border)]">
          <Button
            variant="outline"
            onClick={() => navigate('/onboarding-v2/intake')}
            data-testid="button-back"
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white"
            data-testid="button-next"
          >
            Continue to Analysis
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
