import { useEffect } from 'react';
import { useLocation } from 'wouter';
import Profile from './Profile';

// Deep-link page for /profile/portfolio - redirects to Profile with portfolio tab active
export default function ProfilePortfolio() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to main profile page with portfolio hash/state
    setLocation('/profile');
  }, [setLocation]);

  return <Profile />;
}