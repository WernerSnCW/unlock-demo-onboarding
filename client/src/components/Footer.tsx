import { Link } from 'wouter';
import unlockLogo from '@assets/unlock-logo.svg';

export default function Footer() {
  const resourceLinks = [
    { name: 'Due Diligence Hub', href: '/due-diligence' },
    { name: 'Business Index', href: '/business' },
    { name: 'Syndication Discovery', href: '/syndication' },
    { name: 'Investor Toolkit', href: '/toolkit' }
  ];

  const supportLinks = [
    { name: 'Help Centre', href: '#' },
    { name: 'Contact Support', href: '#' },
    { name: 'Report Issues', href: '#' },
    { name: 'Feature Requests', href: '#' }
  ];

  const socialLinks = [
    { icon: 'fab fa-linkedin', href: '#' },
    { icon: 'fab fa-twitter', href: '#' },
    { icon: 'fab fa-youtube', href: '#' }
  ];

  return (
    <footer className="bg-[var(--secondary)] text-[var(--secondary-foreground)] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <Link href="/" className="flex items-center mb-4">
              <img src={unlockLogo} alt="Unlock" className="h-8 w-auto brightness-0 invert" />
            </Link>
            <p className="text-[var(--secondary-foreground)]/80 mb-4 max-w-md">
              Comprehensive business due diligence platform providing investment insights, 
              risk assessment, and financial intelligence for informed decision-making.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a key={index} href={social.href} className="text-[var(--secondary-foreground)]/70 hover:text-[var(--secondary-foreground)] transition-colors duration-200">
                  <i className={`${social.icon} text-xl`}></i>
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-[var(--secondary-foreground)]">Platform</h4>
            <ul className="space-y-2 text-[var(--secondary-foreground)]/80">
              {resourceLinks.map((link) => (
                <li key={link.name}>
                  {link.href.startsWith('#') ? (
                    <a href={link.href} className="hover:text-[var(--secondary-foreground)] transition-colors duration-200">{link.name}</a>
                  ) : (
                    <Link href={link.href} className="hover:text-[var(--secondary-foreground)] transition-colors duration-200">
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-[var(--secondary-foreground)]">Support</h4>
            <ul className="space-y-2 text-[var(--secondary-foreground)]/80">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="hover:text-[var(--secondary-foreground)] transition-colors duration-200">{link.name}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-[var(--secondary-foreground)]/20">
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <h5 className="font-medium text-[var(--secondary-foreground)] mb-2">Legal & Compliance</h5>
              <p className="text-sm text-[var(--secondary-foreground)]/80">
                All due diligence reports are for informational purposes only and do not constitute financial advice. 
                Please consult with qualified professionals before making investment decisions.
              </p>
            </div>
            <div>
              <h5 className="font-medium text-[var(--secondary-foreground)] mb-2">Data Sources</h5>
              <p className="text-sm text-[var(--secondary-foreground)]/80">
                Our platform aggregates data from Companies House, financial databases, and public records 
                to provide comprehensive business intelligence.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-[var(--secondary-foreground)]/80 text-sm">© 2025 Unlock Ltd. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <a href="#" className="text-[var(--secondary-foreground)]/80 hover:text-[var(--secondary-foreground)] text-sm transition-colors duration-200">Privacy Policy</a>
              <a href="#" className="text-[var(--secondary-foreground)]/80 hover:text-[var(--secondary-foreground)] text-sm transition-colors duration-200">Terms of Service</a>
              <a href="#" className="text-[var(--secondary-foreground)]/80 hover:text-[var(--secondary-foreground)] text-sm transition-colors duration-200">Data Policy</a>
              <a href="#" className="text-[var(--secondary-foreground)]/80 hover:text-[var(--secondary-foreground)] text-sm transition-colors duration-200">Security</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
