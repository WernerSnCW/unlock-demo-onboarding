import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { useTheme } from './ThemeProvider';
import { User, ChevronDown, Settings, LogOut } from 'lucide-react';
import Logo from './Logo';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Mock user data - in real app this would come from auth context
  const user = {
    name: 'Thomas Williams',
    email: 'thomas@unlock.com',
    profilePicture: null
  };

  // Handle clicking outside profile dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/' },
    { name: 'Businesses', href: '/businesses' },
    { name: 'Toolkit', href: '/toolkit' },
    { name: 'Due Diligence', href: '/due-diligence' },
    { name: 'Syndication', href: '/syndication' },
    { name: 'News', href: '/news' },
  ];

  return (
    <header className="bg-[var(--card)] shadow-sm border-b border-[var(--border)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center">
              <Logo size="md" />
            </Link>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--accent)] text-[var(--accent-foreground)]">
              Free
            </span>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                location === item.href
                  ? 'text-[var(--card-foreground)] border-b-2 border-[var(--primary)]'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--primary)]'
              }`}>
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleTheme}
              className="p-2 text-[var(--muted-foreground)] hover:text-[var(--card-foreground)] transition-colors duration-200"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'} text-lg`}></i>
            </button>

            {/* User Profile Dropdown */}
            <div className="relative hidden md:block" ref={profileDropdownRef}>
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {user.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={`${user.name}'s profile`}
                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
                <span className="hidden lg:block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Thomas
                </span>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      {user.profilePicture ? (
                        <img 
                          src={user.profilePicture} 
                          alt={`${user.name}'s profile`}
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Free Plan</p>
                      </div>
                    </div>
                  </div>
                  <div className="py-2">
                    <Link
                      href="/profile"
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      href="/account-settings"
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Account Settings
                    </Link>
                    <button 
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                      disabled
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Profile (Simple) */}
            <div className="md:hidden">
              {user.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt={`${user.name}'s profile`}
                  className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              )}
            </div>

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
