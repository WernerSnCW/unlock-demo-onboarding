import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import OnboardingLayout from '@/components/onboarding-v2/OnboardingLayout';
import { User, Mail, Building, MapPin, Wallet, Target, Clock, UserCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useOnboardingV2Store, IntakeData, PersonaCues, InvestingFocus } from '@/state/onboardingV2Store';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const intakeSchema = z.object({
  full_name: z.string().min(2, 'Please enter your full name'),
  email: z.string().email('Please enter a valid email address'),
  investor_type: z.string().min(1, 'Please select your investor type'),
  region: z.string().min(1, 'Please select your region'),
  annual_income_gbp: z.coerce.number().min(0, 'Income cannot be negative'),
  annual_essential_spend_gbp: z.coerce.number().min(1, 'Please enter your annual essential spending'),
  liquid_cash_gbp: z.coerce.number().min(0, 'Please enter your liquid cash amount'),
  total_investable_assets_gbp: z.coerce.number().min(0, 'Assets cannot be negative'),
  regular_monthly_contribution_gbp: z.coerce.number().min(0, 'Contribution cannot be negative'),
  primary_goal: z.string().min(1, 'Please select your primary goal'),
  time_horizon_years: z.string().min(1, 'Please select your time horizon'),
  risk_comfort: z.string().min(1, 'Please select your risk comfort level'),
});

type IntakeFormData = z.infer<typeof intakeSchema>;

export default function Intake() {
  const { intake, updateIntake, updatePersonaCues, resetAnalysis } = useOnboardingV2Store();
  const [, navigate] = useLocation();
  const [showInvestorProfile, setShowInvestorProfile] = useState(false);

  // Default personaCues if not present (handles old localStorage data)
  const defaultPersonaCues: PersonaCues = {
    age_band: null,
    portfolio_stage: null,
    investing_focus: [],
    has_defined_benefit_pension: null,
    owns_business: null,
    has_employer_stock: null,
    has_meaningful_crypto: null,
    adviser_usage: null,
    is_cross_border: null,
  };
  const personaCues = intake.personaCues ?? defaultPersonaCues;

  const toggleInvestingFocus = (focus: InvestingFocus) => {
    const current = personaCues.investing_focus ?? [];
    const updated = current.includes(focus)
      ? current.filter(f => f !== focus)
      : [...current, focus];
    updatePersonaCues({ investing_focus: updated });
  };

  const form = useForm<IntakeFormData>({
    resolver: zodResolver(intakeSchema),
    defaultValues: {
      full_name: intake.full_name || '',
      email: intake.email || '',
      investor_type: intake.investor_type || '',
      region: intake.region || '',
      annual_income_gbp: intake.annual_income_gbp || 0,
      annual_essential_spend_gbp: intake.annual_essential_spend_gbp || 0,
      liquid_cash_gbp: intake.liquid_cash_gbp || 0,
      total_investable_assets_gbp: intake.total_investable_assets_gbp || 0,
      regular_monthly_contribution_gbp: intake.regular_monthly_contribution_gbp || 0,
      primary_goal: intake.primary_goal || '',
      time_horizon_years: intake.time_horizon_years || '',
      risk_comfort: intake.risk_comfort || '',
    },
  });

  useEffect(() => {
    form.reset({
      full_name: intake.full_name || '',
      email: intake.email || '',
      investor_type: intake.investor_type || '',
      region: intake.region || '',
      annual_income_gbp: intake.annual_income_gbp || 0,
      annual_essential_spend_gbp: intake.annual_essential_spend_gbp || 0,
      liquid_cash_gbp: intake.liquid_cash_gbp || 0,
      total_investable_assets_gbp: intake.total_investable_assets_gbp || 0,
      regular_monthly_contribution_gbp: intake.regular_monthly_contribution_gbp || 0,
      primary_goal: intake.primary_goal || '',
      time_horizon_years: intake.time_horizon_years || '',
      risk_comfort: intake.risk_comfort || '',
    });
  }, [intake.full_name, intake.email, intake.investor_type, intake.region, 
      intake.annual_income_gbp, intake.annual_essential_spend_gbp, intake.liquid_cash_gbp,
      intake.total_investable_assets_gbp, intake.regular_monthly_contribution_gbp,
      intake.primary_goal, intake.time_horizon_years, intake.risk_comfort, form]);

  const onSubmit = (data: IntakeFormData) => {
    updateIntake(data as Partial<IntakeData>);
    resetAnalysis();
    navigate('/onboarding-v2/holdings');
  };

  const inputClass = "w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent";

  return (
    <OnboardingLayout
      stepId="intake"
      title="Tell Us About Yourself"
      description="We need some information to personalize your experience and ensure our recommendations are relevant to your situation."
      hideNav
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto pt-4">
          {/* Basic Details Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-white dark:bg-slate-800/80 rounded-2xl border border-[var(--border)] shadow-lg hover:shadow-xl transition-all duration-300">
              {/* Floating icon */}
              <div className="absolute -top-5 left-6 z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/70 flex items-center justify-center shadow-lg shadow-[var(--primary)]/25 rotate-3 group-hover:rotate-0 transition-transform duration-300">
                  <User className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="p-6 pt-10">
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-6">Basic Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--foreground)]">Full Name *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter your full name"
                        className={inputClass}
                        data-testid="input-full-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--foreground)]">Email Address *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="your@email.com"
                        className={inputClass}
                        data-testid="input-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="investor_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--foreground)]">Investor Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className={inputClass} data-testid="select-investor-type">
                          <SelectValue placeholder="Select your investor type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="joint">Joint</SelectItem>
                        <SelectItem value="company">Company</SelectItem>
                        <SelectItem value="trust">Trust</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--foreground)]">Tax Residency *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className={inputClass} data-testid="select-region">
                          <SelectValue placeholder="Select your region" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="eu">European Union</SelectItem>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
                </div>
              </div>
            </div>
          </div>

          {/* Financial Picture Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--secondary)]/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-white dark:bg-slate-800/80 rounded-2xl border border-[var(--border)] shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-5 left-6 z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary)]/70 flex items-center justify-center shadow-lg shadow-[var(--secondary)]/25 -rotate-3 group-hover:rotate-0 transition-transform duration-300">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="p-6 pt-10">
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-6">Financial Picture</h3>
                <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="annual_income_gbp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--foreground)]">Annual Income (£)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        step="1000"
                        placeholder="e.g. 75000"
                        className={inputClass}
                        data-testid="input-annual-income"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="annual_essential_spend_gbp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--foreground)]">Annual Essential Spending (£) *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        step="1000"
                        placeholder="e.g. 36000"
                        className={inputClass}
                        data-testid="input-annual-spend"
                      />
                    </FormControl>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">
                      Rent/mortgage, bills, food, transport, insurance
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="liquid_cash_gbp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--foreground)]">Liquid Cash / Emergency Fund (£) *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        step="1000"
                        placeholder="e.g. 25000"
                        className={inputClass}
                        data-testid="input-liquid-cash"
                      />
                    </FormControl>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">
                      Cash you can access quickly for emergencies
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="total_investable_assets_gbp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--foreground)]">Total Investable Assets (£)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        step="1000"
                        placeholder="e.g. 500000"
                        className={inputClass}
                        data-testid="input-investable-assets"
                      />
                    </FormControl>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">
                      Approximate portfolio value (we'll confirm in Holdings)
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="regular_monthly_contribution_gbp"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-[var(--foreground)]">Regular Monthly Contribution (£)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        step="100"
                        placeholder="e.g. 500"
                        className={inputClass}
                        data-testid="input-monthly-contribution"
                      />
                    </FormControl>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">
                      Optional: How much you typically invest each month
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
                </div>
              </div>
            </div>
          </div>

          {/* Goals & Risk Profile Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-white dark:bg-slate-800/80 rounded-2xl border border-[var(--border)] shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-5 left-6 z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25 rotate-3 group-hover:rotate-0 transition-transform duration-300">
                  <Target className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="p-6 pt-10">
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-6">Goals & Risk Profile</h3>
                <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="primary_goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--foreground)]">Primary Investment Goal *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className={inputClass} data-testid="select-primary-goal">
                          <SelectValue placeholder="Select your goal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="grow_wealth">Grow wealth over time</SelectItem>
                        <SelectItem value="preserve_capital">Preserve capital</SelectItem>
                        <SelectItem value="income_focus">Generate income</SelectItem>
                        <SelectItem value="specific_goal">Specific goal (e.g. retirement, property)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time_horizon_years"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--foreground)]">Investment Time Horizon *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className={inputClass} data-testid="select-time-horizon">
                          <SelectValue placeholder="Select time horizon" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="short">Less than 3 years</SelectItem>
                        <SelectItem value="medium">3 to 7 years</SelectItem>
                        <SelectItem value="long">7 to 15 years</SelectItem>
                        <SelectItem value="very_long">15+ years</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="risk_comfort"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-[var(--foreground)]">Risk Comfort Level *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className={inputClass} data-testid="select-risk-comfort">
                          <SelectValue placeholder="Select your risk comfort" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="very_low">Very Low - I prefer stability over growth</SelectItem>
                        <SelectItem value="low">Low - Some volatility is acceptable</SelectItem>
                        <SelectItem value="moderate">Moderate - Balanced approach</SelectItem>
                        <SelectItem value="high">High - Comfortable with significant swings</SelectItem>
                        <SelectItem value="very_high">Very High - Maximum growth potential</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
                </div>
              </div>
            </div>
          </div>

          {/* Investor Profile Section (Optional) */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-white dark:bg-slate-800/80 rounded-2xl border border-[var(--border)] shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-5 left-6 z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25 -rotate-3 group-hover:rotate-0 transition-transform duration-300">
                  <UserCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            <button
              type="button"
              onClick={() => setShowInvestorProfile(!showInvestorProfile)}
              className="w-full flex items-center justify-between px-6 py-4 pt-8 hover:bg-[var(--muted)]/30 transition-colors"
              data-testid="toggle-investor-profile"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-[var(--foreground)]">Investor Profile</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">Optional</span>
              </div>
              {showInvestorProfile ? (
                <ChevronUp className="w-5 h-5 text-[var(--muted-foreground)]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[var(--muted-foreground)]" />
              )}
            </button>

            {showInvestorProfile && (
              <div className="p-6 pt-4 border-t border-[var(--border)] space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-sm text-[var(--muted-foreground)] bg-[var(--muted)]/30 p-3 rounded-lg">
                  These questions help us understand what kind of investor you are so we can tailor your plan. They're optional, but answering them improves the recommendations.
                </p>

                {/* Age Band */}
                <div className="space-y-2">
                  <Label className="text-[var(--foreground)] font-medium">Age Band</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: '25_34', label: '25–34' },
                      { value: '35_44', label: '35–44' },
                      { value: '45_54', label: '45–54' },
                      { value: '55_64', label: '55–64' },
                      { value: '65_plus', label: '65+' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updatePersonaCues({ age_band: option.value as PersonaCues['age_band'] })}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                          personaCues.age_band === option.value
                            ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                            : 'bg-[var(--background)] text-[var(--foreground)] border-[var(--border)] hover:border-[var(--primary)]'
                        }`}
                        data-testid={`btn-age-${option.value}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Portfolio Stage */}
                <div className="space-y-2">
                  <Label className="text-[var(--foreground)] font-medium">How are you currently using this portfolio?</Label>
                  <div className="grid gap-2">
                    {[
                      { value: 'ACCUMULATING', label: 'Mostly building up (accumulating)' },
                      { value: 'STARTING_DRAWDOWN', label: 'Starting to draw from it' },
                      { value: 'PRIMARILY_DRAWDOWN', label: 'Primarily drawing from it for ongoing spending' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updatePersonaCues({ portfolio_stage: option.value as PersonaCues['portfolio_stage'] })}
                        className={`px-4 py-3 rounded-lg border text-sm text-left transition-all ${
                          personaCues.portfolio_stage === option.value
                            ? 'bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--foreground)]'
                            : 'bg-[var(--background)] text-[var(--foreground)] border-[var(--border)] hover:border-[var(--primary)]'
                        }`}
                        data-testid={`btn-stage-${option.value}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Investing Focus (Multi-select) */}
                <div className="space-y-2">
                  <Label className="text-[var(--foreground)] font-medium">Where do you actively focus your investing? (select all that apply)</Label>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {[
                      { value: 'FUNDS_ETFS', label: 'Listed funds & ETFs' },
                      { value: 'INDIVIDUAL_SHARES', label: 'Individual shares' },
                      { value: 'PROPERTY_BTL', label: 'Property / buy-to-let' },
                      { value: 'PRIVATE_BUSINESS', label: 'Private business / PE / venture' },
                      { value: 'CRYPTO', label: 'Crypto / digital assets' },
                      { value: 'OTHER', label: 'Other' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all ${
                          personaCues.investing_focus?.includes(option.value as InvestingFocus)
                            ? 'bg-[var(--primary)]/10 border-[var(--primary)]'
                            : 'bg-[var(--background)] border-[var(--border)] hover:border-[var(--primary)]'
                        }`}
                      >
                        <Checkbox
                          checked={personaCues.investing_focus?.includes(option.value as InvestingFocus) || false}
                          onCheckedChange={() => toggleInvestingFocus(option.value as InvestingFocus)}
                          data-testid={`check-focus-${option.value}`}
                        />
                        <span className="text-sm text-[var(--foreground)]">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Structural Cues (Toggles) */}
                <div className="space-y-4">
                  <Label className="text-[var(--foreground)] font-medium">Specific structural cues</Label>
                  <div className="space-y-3">
                    {[
                      { key: 'has_defined_benefit_pension', label: 'Do you have a Defined Benefit / final salary pension that will cover a meaningful part of your retirement income?' },
                      { key: 'owns_business', label: 'Do you own a private business that makes up a significant part of your wealth?' },
                      { key: 'has_employer_stock', label: 'Do you hold a meaningful amount of employer stock or options/RSUs?' },
                      { key: 'has_meaningful_crypto', label: 'Do you hold a meaningful crypto/digital asset allocation?' },
                    ].map((item) => (
                      <div 
                        key={item.key} 
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                          personaCues[item.key as keyof PersonaCues] === true
                            ? 'bg-[var(--primary)]/10 border-[var(--primary)]'
                            : 'bg-[var(--background)] border-[var(--border)] hover:border-[var(--primary)]/50'
                        }`}
                      >
                        <Switch
                          checked={personaCues[item.key as keyof PersonaCues] === true}
                          onCheckedChange={(checked) => updatePersonaCues({ [item.key]: checked })}
                          className="data-[state=unchecked]:bg-slate-300 dark:data-[state=unchecked]:bg-slate-600"
                          data-testid={`switch-${item.key}`}
                        />
                        <span className="text-sm text-[var(--foreground)] leading-tight">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Adviser Usage */}
                <div className="space-y-2">
                  <Label className="text-[var(--foreground)] font-medium">How do you typically manage your investments?</Label>
                  <div className="grid gap-2">
                    {[
                      { value: 'SELF_DIRECTED', label: 'I make my own decisions' },
                      { value: 'SOMETIMES_ADVISED', label: 'I sometimes get advice but mostly decide myself' },
                      { value: 'FULL_SERVICE_ADVISER', label: 'I work with a dedicated adviser/wealth manager' },
                      { value: 'I_AM_AN_ADVISER', label: 'I am a financial adviser or investment professional' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updatePersonaCues({ adviser_usage: option.value as PersonaCues['adviser_usage'] })}
                        className={`px-4 py-3 rounded-lg border text-sm text-left transition-all ${
                          personaCues.adviser_usage === option.value
                            ? 'bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--foreground)]'
                            : 'bg-[var(--background)] text-[var(--foreground)] border-[var(--border)] hover:border-[var(--primary)]'
                        }`}
                        data-testid={`btn-adviser-${option.value}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cross-border */}
                <div className={`flex items-start gap-3 p-4 rounded-lg border transition-all ${
                  personaCues.is_cross_border === true
                    ? 'bg-[var(--primary)]/10 border-[var(--primary)]'
                    : 'bg-[var(--background)] border-[var(--border)] hover:border-[var(--primary)]/50'
                }`}>
                  <Switch
                    checked={personaCues.is_cross_border === true}
                    onCheckedChange={(checked) => updatePersonaCues({ is_cross_border: checked })}
                    className="data-[state=unchecked]:bg-slate-300 dark:data-[state=unchecked]:bg-slate-600"
                    data-testid="switch-cross-border"
                  />
                  <div>
                    <Label className="text-[var(--foreground)] font-medium">Cross-border complexity</Label>
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">
                      Do you have a cross-border or multi-country setup (live, earn, or invest in multiple countries)?
                    </p>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>

          <p className="text-center text-xs text-[var(--muted-foreground)]">
            This information helps us provide personalised guidance. Your data is encrypted and never shared.
          </p>

          <div className="flex justify-between items-center pt-6 border-t border-[var(--border)]">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/onboarding-v2/method')}
              className="text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all duration-200"
              data-testid="button-back"
            >
              Back
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 hover:from-[var(--primary)]/90 hover:to-[var(--primary)]/70 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium"
              data-testid="button-next"
            >
              Continue to Holdings
            </Button>
          </div>
        </form>
      </Form>
    </OnboardingLayout>
  );
}
