import OnboardingLayout from '@/components/onboarding-v2/OnboardingLayout';
import { User, Mail, Building, MapPin } from 'lucide-react';

export default function Intake() {
  return (
    <OnboardingLayout
      stepId="intake"
      title="Tell Us About Yourself"
      description="We need some basic information to personalize your experience and ensure our recommendations are relevant to your situation."
    >
      <div className="space-y-6 max-w-lg mx-auto">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              data-testid="input-name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email Address
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              data-testid="input-email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              <Building className="w-4 h-4 inline mr-2" />
              Investor Type
            </label>
            <select 
              className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              data-testid="select-investor-type"
            >
              <option value="">Select your investor type</option>
              <option value="individual">Individual Investor</option>
              <option value="angel">Angel Investor</option>
              <option value="professional">Professional Investor</option>
              <option value="institutional">Institutional Investor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Region
            </label>
            <select 
              className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              data-testid="select-region"
            >
              <option value="">Select your region</option>
              <option value="uk">United Kingdom</option>
              <option value="eu">European Union</option>
              <option value="us">United States</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <p className="text-center text-xs text-[var(--muted-foreground)]">
          This information helps us provide tax-relevant guidance and localized recommendations.
        </p>
      </div>
    </OnboardingLayout>
  );
}
