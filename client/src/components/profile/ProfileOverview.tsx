import React, { useState } from 'react';
import { 
  User, Shield, MapPin, TrendingUp, Upload, Search, 
  Eye, MessageSquare, Bookmark, Target, Users, Calendar,
  PieChart, DollarSign, Award, Bell, FileText, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StatCard } from '@/components/shared/StatCard';
import { Donut } from '@/components/shared/Donut';
import { usePortfolioStoreDB } from '@/state/portfolioStoreDB';
import { formatGBP, formatPct, getGainColor, CHART_COLORS } from '@/utils/formatters';

interface ProfileOverviewProps {
  profile: any;
  className?: string;
}

export function ProfileOverview({ profile, className = '' }: ProfileOverviewProps) {
  const { positions, getTotalValue, getTotalGainLoss } = usePortfolioStoreDB();
  
  const portfolioValue = getTotalValue();
  const { gainAbs, gainPct } = getTotalGainLoss();
  
  // Calculate portfolio completion and engagement stats
  const portfolioCompletion = positions.length > 0 ? 85 : 0;
  const profileCompletion = 70; // Mock completion percentage
  
  // Calculate sector allocation for mini donut
  const sectorData = React.useMemo(() => {
    if (positions.length === 0) return [];
    
    const sectorTotals: Record<string, number> = {};
    let totalValue = 0;
    
    positions.forEach(position => {
      const value = position.quantity * position.price;
      totalValue += value;
      sectorTotals[position.sector] = (sectorTotals[position.sector] || 0) + value;
    });
    
    return Object.entries(sectorTotals)
      .map(([sector, value]) => ({
        label: sector,
        value: (value / totalValue) * 100,
        color: CHART_COLORS.sectors[sector as keyof typeof CHART_COLORS.sectors] || CHART_COLORS.sectors.Other
      }))
      .sort((a, b) => b.value - a.value);
  }, [positions]);

  const topHolding = positions.length > 0 ? positions
    .sort((a, b) => (b.quantity * b.price) - (a.quantity * a.price))[0] : null;

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

  const opportunities = [
    {
      type: 'deal',
      title: 'New AI/ML deal snapshot available',
      description: 'Series A SaaS platform in machine learning',
      badge: 'New Deal',
      badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    },
    {
      type: 'insight',
      title: '3 investors like you backed Climate Tech this week',
      description: 'Clean energy investments trending in your peer group',
      badge: 'Trending',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    },
    {
      type: 'analyst',
      title: 'Analyst Opinions: NVDA consensus overweight, avg target +12%',
      description: 'Strong buy rating from 8 out of 10 analysts',
      badge: 'Consensus',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
    }
  ];

  const engagementStats = [
    { label: 'Syndicates viewed', value: 5, icon: Eye },
    { label: 'Questions asked', value: 2, icon: MessageSquare },
    { label: 'Deals saved', value: 1, icon: Bookmark },
  ];

  const quickActions = [
    { label: 'Upload Portfolio', icon: Upload, primary: true },
    { label: 'Request Due Diligence', icon: FileText, primary: false },
    { label: 'Create Watchlist', icon: Target, primary: false },
    { label: 'Ask Question', icon: MessageSquare, primary: false },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Investor Identity Card */}
      <Card className="bg-gradient-to-r from-[var(--primary)]/5 to-[var(--secondary)]/5 border-[var(--primary)]/20">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-xl font-bold">
                {profile.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {profile.name}
                </h2>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="outline" className="font-medium">
                    {profile.investorType}
                  </Badge>
                  <Badge className={getRiskColor(profile.riskAppetite)}>
                    {profile.riskAppetite} Risk
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400">Ticket Range</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {profile.ticketRange}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {profile.jurisdictions.join(', ')}
                </span>
              </div>
              {(profile.eisInterest || profile.seisInterest) && (
                <div className="flex gap-1 mt-2">
                  {profile.eisInterest && (
                    <Badge variant="outline" className="text-xs">EIS</Badge>
                  )}
                  {profile.seisInterest && (
                    <Badge variant="outline" className="text-xs">SEIS</Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Portfolio At-a-Glance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Portfolio Summary */}
          {positions.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Portfolio At-a-Glance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                  title="Total Value"
                  value={formatGBP(portfolioValue, true)}
                  icon={<DollarSign className="h-5 w-5" />}
                />
                <StatCard
                  title="Total Gain/Loss"
                  value={formatGBP(gainAbs, true)}
                  delta={{
                    value: formatPct(gainPct),
                    isPositive: gainAbs >= 0
                  }}
                  icon={<TrendingUp className="h-5 w-5" />}
                />
                <StatCard
                  title="Top Holding"
                  value={topHolding?.ticker || 'N/A'}
                  subtitle={topHolding ? formatGBP(topHolding.quantity * topHolding.price, true) : undefined}
                  icon={<Award className="h-5 w-5" />}
                />
              </div>
              
              {/* Mini Sector Donut */}
              {sectorData.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Sector Allocation</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-center">
                      <Donut 
                        data={sectorData} 
                        size={150}
                        centerText={`${sectorData.length} sectors`}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No Portfolio Data
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Upload your portfolio to see analytics and insights
                </p>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Portfolio
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Opportunities Feed */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Personalized Opportunities
            </h3>
            <div className="space-y-3">
              {opportunities.map((opportunity, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={opportunity.badgeColor}>
                            {opportunity.badge}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                          {opportunity.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {opportunity.description}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Stats & Actions */}
        <div className="space-y-6">
          {/* Progress & Engagement */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Progress & Engagement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Profile Completion</span>
                  <span>{profileCompletion}%</span>
                </div>
                <Progress value={profileCompletion} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  Add portfolio to unlock insights
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  This Week
                </h4>
                {engagementStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <stat.icon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {stat.label}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.primary ? "default" : "outline"}
                  className="w-full justify-start"
                  size="sm"
                >
                  <action.icon className="h-4 w-4 mr-2" />
                  {action.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Investors Like You */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Investors Like You</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[var(--primary)]" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  70% hold AI/ML positions
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[var(--secondary)]" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Climate tech trending
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-[var(--accent)]" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Avg ticket: £15k-25k
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Notices */}
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                Tax Reminders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-orange-600" />
                <span className="text-xs text-orange-700 dark:text-orange-300">
                  EIS carry-back deadline: 31 Jan
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Bell className="h-3 w-3 text-orange-600" />
                <span className="text-xs text-orange-700 dark:text-orange-300">
                  Tax year end approaching
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}