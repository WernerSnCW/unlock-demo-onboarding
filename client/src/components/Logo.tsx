import { useTheme } from './ThemeProvider';
import unlockLogo from '@assets/unlock-logo.svg';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'email';
}

export default function Logo({ className = '', size = 'md', variant = 'default' }: LogoProps) {
  const { theme } = useTheme();
  
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8', 
    lg: 'h-12'
  };

  if (variant === 'email') {
    // Email variant with icon and text for newsletter
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="w-12 h-12 bg-gradient-to-r from-[#5193B3] to-[#62C4C3] rounded-lg flex items-center justify-center">
          <img 
            src={unlockLogo} 
            alt="Unlock" 
            className="h-6 w-auto brightness-0 invert"
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#5193B3] mb-0">Unlock</h1>
          <p className="text-sm text-gray-600 -mt-1">Investment Intelligence</p>
        </div>
      </div>
    );
  }

  // Default variant - just the logo
  return (
    <img 
      src={unlockLogo} 
      alt="Unlock" 
      className={`${sizeClasses[size]} w-auto ${className}`}
      style={{
        filter: theme === 'dark' ? 'brightness(0) invert(1)' : 'none'
      }}
    />
  );
}