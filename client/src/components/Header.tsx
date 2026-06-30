import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useTheme } from './ThemeProvider';
import { Play } from 'lucide-react';
import Logo from './Logo';
import InvestorSwitcher from './onboarding-v2/InvestorSwitcher';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Businesses', href: '/businesses' },
    { name: 'Assets', href: '/asset-register' },
    { name: 'Toolkit', href: '/toolkit' },
    { name: 'Due Diligence', href: '/due-diligence' },
    { name: 'Syndication', href: '/syndication' },
    { name: 'News', href: '/news' },
  ];

  // During the onboarding flow, hide the top nav + Start Onboarding CTA for a
  // focused, distraction-free experience (routes are unchanged, just not shown).
  const isOnboarding = location.startsWith('/onboarding-v2');

  return (
    <header className="bg-[var(--card)] shadow-sm border-b border-[var(--border)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center">
              <Logo size="md" />
            </Link>
          </div>
          
          {!isOnboarding && (
            <nav className="hidden md:flex space-x-4">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href} className={`px-2 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  location === item.href
                    ? 'text-[var(--card-foreground)] border-b-2 border-[var(--primary)]'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--primary)]'
                }`}>
                  {item.name}
                </Link>
              ))}
            </nav>
          )}

          <div className="flex items-center space-x-4">
            {/* Demo Button (hidden during the onboarding flow) */}
            {!isOnboarding && (
              <Link
                href="/onboarding-v2/welcome"
                className="hidden sm:inline-flex items-center px-4 py-2 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-2xl font-semibold hover:opacity-90 transition-opacity shadow-sm"
                data-testid="button-demo"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Onboarding
              </Link>
            )}

            <button 
              onClick={toggleTheme}
              className="p-2 text-[var(--muted-foreground)] hover:text-[var(--card-foreground)] transition-colors duration-200"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'} text-lg`}></i>
            </button>

            {/* Active investor switcher (replaces the user menu) */}
            <InvestorSwitcher />

            <button 
              className="md:hidden p-2 text-[var(--muted-foreground)] hover:text-[var(--card-foreground)]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <i className="fas fa-bars text-lg"></i>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[var(--card)] border-b border-[var(--border)]">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Mobile Demo Button */}
            <Link 
              href="/onboarding-v2/welcome"
              className="flex items-center px-3 py-2 text-base font-medium rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white mb-2"
              onClick={() => setIsMobileMenuOpen(false)}
              data-testid="button-demo-mobile"
            >
              <Play className="h-5 w-5 mr-2" />
              Start Onboarding
            </Link>
            
            {navigation.map((item) => (
              <Link 
                key={item.name} 
                href={item.href}
                className={`block px-3 py-2 text-base font-medium rounded-md ${
                  location === item.href
                    ? 'text-[var(--card-foreground)] bg-[var(--muted)]'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--card-foreground)]'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
