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
    // Email variant with centered logo for newsletter
    return (
      <div className={`flex justify-center ${className}`}>
        <img 
          src={unlockLogo} 
          alt="Unlock" 
          className="h-10 w-auto"
        />
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