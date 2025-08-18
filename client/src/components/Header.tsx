import { useState } from 'react';
import { Link, useLocation } from 'wouter';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Components', href: '/components' },
    { name: 'Docs', href: '/docs' },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <i className="fas fa-bolt text-[#646cff] text-xl"></i>
              <span className="text-xl font-bold text-slate-900">DevStack</span>
            </Link>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#646cff]/10 text-[#646cff]">
              v1.0.0
            </span>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                location === item.href
                  ? 'text-slate-900 border-b-2 border-[#646cff]'
                  : 'text-slate-600 hover:text-[#646cff]'
              }`}>
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-600 hover:text-slate-900 transition-colors duration-200">
              <i className="fas fa-moon text-lg"></i>
            </button>
            <button 
              className="md:hidden p-2 text-slate-600 hover:text-slate-900"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <i className="fas fa-bars text-lg"></i>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link 
                key={item.name} 
                href={item.href}
                className={`block px-3 py-2 text-base font-medium rounded-md ${
                  location === item.href
                    ? 'text-slate-900 bg-slate-50'
                    : 'text-slate-600 hover:text-slate-900'
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
