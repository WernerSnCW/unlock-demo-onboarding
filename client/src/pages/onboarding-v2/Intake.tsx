import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import OnboardingLayout from '@/components/onboarding-v2/OnboardingLayout';
import { User, Mail, Building, MapPin, Wallet, Target, Clock } from 'lucide-react';
import { useOnboardingV2Store, IntakeData } from '@/state/onboardingV2Store';
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
  const { intake, updateIntake, resetAnalysis } = useOnboardingV2Store();
  const [, navigate] = useLocation();

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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[var(--foreground)] border-b border-[var(--border)] pb-2 flex items-center gap-2">
              <User className="w-5 h-5 text-[var(--primary)]" />
              Basic Details
            </h3>
            
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

          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[var(--foreground)] border-b border-[var(--border)] pb-2 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-[var(--secondary)]" />
              Financial Picture
            </h3>
            
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

          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[var(--foreground)] border-b border-[var(--border)] pb-2 flex items-center gap-2">
              <Target className="w-5 h-5 text-[var(--accent)]" />
              Goals & Risk Profile
            </h3>
            
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
