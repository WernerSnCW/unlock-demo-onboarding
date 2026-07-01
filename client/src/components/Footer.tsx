import { Link } from 'wouter';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import unlockLogo from '@assets/unlock-logo.svg';

// Footer feature links. In this investor demo they DON'T navigate into the wider
// platform — clicking one opens a short explainer popover instead, so reviewers
// understand what the feature is without leaving the onboarding flow. The actual
// pages/routes still exist in the app (see App.tsx); they're just not linked here.
const platformFeatures: { name: string; description: string }[] = [
  {
    name: 'Due Diligence Hub',
    description:
      'Where investors commission and track due-diligence checks on a business, follow progress, and view the resulting reports.',
  },
  {
    name: 'Business Index',
    description:
      'A searchable directory of businesses on the platform, with profiles and key metrics for browsing opportunities.',
  },
  {
    name: 'Syndication Discovery',
    description:
      'Discover investment syndicates and bundles to co-invest alongside other investors.',
  },
  {
    name: 'Investor Toolkit',
    description:
      'A set of analysis tools — such as the pitch-deck analyser and portfolio breakdowns — that support investment decisions.',
  },
];

const supportFeatures: { name: string; description: string }[] = [
  { name: 'Help Centre', description: 'Guides and FAQs on how to use the Unlock platform.' },
  { name: 'Contact Support', description: 'Get in touch with the Unlock team for help.' },
  { name: 'Report Issues', description: 'Flag a bug or problem so the team can look into it.' },
  { name: 'Feature Requests', description: 'Suggest features or improvements you’d like to see.' },
];

const socialLinks = [
  { icon: 'fab fa-linkedin', href: '#' },
  { icon: 'fab fa-twitter', href: '#' },
  { icon: 'fab fa-youtube', href: '#' },
];

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// A footer link that explains itself instead of navigating.
function FeatureLink({ name, description }: { name: string; description: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-testid={`footer-feature-${slug(name)}`}
          className="text-left hover:text-[var(--secondary-foreground)] transition-colors duration-200 cursor-pointer"
        >
          {name}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-72 border-[var(--border)] bg-[var(--popover)] text-[var(--popover-foreground)]"
      >
        <p className="mb-1 text-sm font-semibold text-[var(--foreground)]">{name}</p>
        <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">{description}</p>
        <p className="mt-2 text-[11px] leading-relaxed text-[var(--muted-foreground)]">
          Part of the full Unlock platform — not part of this onboarding demo.
        </p>
      </PopoverContent>
    </Popover>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[var(--u-bg-deepest)] text-[var(--secondary-foreground)] border-t border-[var(--border)] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <Link href="/" className="flex items-center mb-4">
              <img src={unlockLogo} alt="Unlock" className="h-8 w-auto brightness-0 invert" />
            </Link>
            <p className="text-[#ffffff]/80 mb-4 max-w-md">
              Comprehensive business due diligence platform providing investment insights,
              risk assessment, and financial intelligence for informed decision-making.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a key={index} href={social.href} className="text-[#ffffff]/70 hover:text-[var(--secondary-foreground)] transition-colors duration-200">
                  <i className={`${social.icon} text-xl`}></i>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[var(--secondary-foreground)]">Platform</h4>
            <ul className="space-y-2 text-[#ffffff]/80">
              {platformFeatures.map((f) => (
                <li key={f.name}>
                  <FeatureLink name={f.name} description={f.description} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[var(--secondary-foreground)]">Support</h4>
            <ul className="space-y-2 text-[#ffffff]/80">
              {supportFeatures.map((f) => (
                <li key={f.name}>
                  <FeatureLink name={f.name} description={f.description} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-[#ffffff]/20">
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <h5 className="font-medium text-[var(--secondary-foreground)] mb-2">Legal & Compliance</h5>
              <p className="text-sm text-[#ffffff]/80">
                All due diligence reports are for informational purposes only and do not constitute financial advice.
                Please consult with qualified professionals before making investment decisions.
              </p>
            </div>
            <div>
              <h5 className="font-medium text-[var(--secondary-foreground)] mb-2">Data Sources</h5>
              <p className="text-sm text-[#ffffff]/80">
                Our platform aggregates data from Companies House, financial databases, and public records
                to provide comprehensive business intelligence.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-[#ffffff]/80 text-sm">© 2025 Unlock Ltd. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <a href="#" className="text-[#ffffff]/80 hover:text-[var(--secondary-foreground)] text-sm transition-colors duration-200">Privacy Policy</a>
              <a href="#" className="text-[#ffffff]/80 hover:text-[var(--secondary-foreground)] text-sm transition-colors duration-200">Terms of Service</a>
              <a href="#" className="text-[#ffffff]/80 hover:text-[var(--secondary-foreground)] text-sm transition-colors duration-200">Data Policy</a>
              <a href="#" className="text-[#ffffff]/80 hover:text-[var(--secondary-foreground)] text-sm transition-colors duration-200">Security</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
