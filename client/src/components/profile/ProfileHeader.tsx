import { useState } from 'react';
import { User, Settings, Shield, MapPin, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProfileData {
  name: string;
  investorType: 'Angel' | 'VC' | 'Family Office' | 'Individual';
  riskAppetite: 'Conservative' | 'Moderate' | 'Aggressive';
  ticketRange: string;
  jurisdictions: string[];
  eisInterest: boolean;
  seisInterest: boolean;
  completionScore: number;
}

interface ProfileHeaderProps {
  profile: ProfileData;
  onEdit?: () => void;
  className?: string;
}

export function ProfileHeader({ profile, onEdit, className = '' }: ProfileHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Conservative':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Moderate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Aggressive':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getInvestorTypeColor = (type: string) => {
    switch (type) {
      case 'Angel':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'VC':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Family Office':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 bg-[var(--primary)] rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-lg">
              {getInitials(profile.name)}
            </span>
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {profile.name}
            </h1>
            
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className={getInvestorTypeColor(profile.investorType)}>
                {profile.investorType}
              </Badge>
              <Badge variant="secondary" className={getRiskColor(profile.riskAppetite)}>
                {profile.riskAppetite}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Signal Score */}
          <div className="text-right">
            <div className="text-sm text-gray-600 dark:text-gray-400">Profile Score</div>
            <div className="flex items-center gap-2">
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {profile.completionScore}%
              </div>
              <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--primary)] transition-all duration-300"
                  style={{ width: `${profile.completionScore}%` }}
                />
              </div>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={onEdit}>
            <Settings className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-500">Ticket Range</div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {profile.ticketRange}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <MapPin className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-500">Jurisdictions</div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {profile.jurisdictions.join(', ')}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <Shield className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-500">Tax Relief</div>
            <div className="flex gap-1 mt-1">
              {profile.eisInterest && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  EIS
                </Badge>
              )}
              {profile.seisInterest && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  SEIS
                </Badge>
              )}
              {!profile.eisInterest && !profile.seisInterest && (
                <span className="text-xs text-gray-500 dark:text-gray-500">None</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-500">Member Since</div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Jan 2024
            </div>
          </div>
        </div>
      </div>

      {/* Profile Completion Hints */}
      {profile.completionScore < 100 && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Complete your profile</strong> to get better personalized recommendations. 
              Add your sector preferences and investment history to reach 100%.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Default profile data for demo
export const DEFAULT_PROFILE: ProfileData = {
  name: 'Alex Thompson',
  investorType: 'Angel',
  riskAppetite: 'Moderate',
  ticketRange: '£10k–£50k',
  jurisdictions: ['UK', 'US'],
  eisInterest: true,
  seisInterest: false,
  completionScore: 75,
};