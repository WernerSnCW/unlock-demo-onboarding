import { Link } from 'wouter';
import { 
  Building, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Download, 
  ExternalLink, 
  Eye, 
  Calendar,
  Crown,
  MapPin,
  Users2,
  Briefcase,
  Star,
  Target,
  ArrowUpRight,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge as BadgeComponent } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatusPill } from './StatusPill';
import { formatDistanceToNow } from 'date-fns';
import type { DueRequest } from '@/state/dueStore';

interface RequestCardProps {
  request: DueRequest;
  showActions?: boolean;
}

export function RequestCard({ request, showActions = true }: RequestCardProps) {
  const getStatusColor = () => {
    switch (request.status) {
      case 'completed':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-700',
          iconStyle: { color: 'var(--accent)' },
          textStyle: { color: 'var(--accent)' }
        };
      case 'processing':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-700',
          iconStyle: { color: 'var(--primary)' },
          textStyle: { color: 'var(--primary)' }
        };
      case 'queued':
        return {
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          border: 'border-orange-200 dark:border-orange-700',
          iconStyle: { color: 'var(--secondary)' },
          textStyle: { color: 'var(--secondary)' }
        };
      case 'failed':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-700',
          iconStyle: { color: '#ef4444' },
          textStyle: { color: '#ef4444' }
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-800/20',
          border: 'border-gray-200 dark:border-gray-700',
          iconStyle: { color: 'var(--muted-foreground)' },
          textStyle: { color: 'var(--muted-foreground)' }
        };
    }
  };

  const getIndustryIcon = () => {
    const iconStyle = { color: 'var(--primary)' };
    switch (request.businessContext.industry) {
      case 'Technology':
        return <Briefcase className="h-4 w-4" style={iconStyle} />;
      case 'Financial Services':
        return <Building className="h-4 w-4" style={iconStyle} />;
      case 'Healthcare':
        return <Star className="h-4 w-4" style={iconStyle} />;
      case 'Retail':
        return <Target className="h-4 w-4" style={iconStyle} />;
      case 'Energy':
        return <Crown className="h-4 w-4" style={iconStyle} />;
      case 'Manufacturing':
        return <Building className="h-4 w-4" style={iconStyle} />;
      default:
        return <Building className="h-4 w-4" style={iconStyle} />;
    }
  };

  const getSizeColor = () => {
    switch (request.businessContext.size) {
      case 'Large':
        return 'bg-[var(--primary)]/10 border border-[var(--primary)]/20';
      case 'Medium':
        return 'bg-[var(--secondary)]/10 border border-[var(--secondary)]/20';
      case 'Small':
        return 'bg-[var(--accent)]/10 border border-[var(--accent)]/20';
      case 'Micro':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-700';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
    }
  };

  const isPremium = request.type === 'deep_dive';
  const statusColors = getStatusColor();

  return (
    <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
      isPremium 
        ? 'bg-gradient-to-br from-[var(--accent)]/10 to-[var(--secondary)]/10 ring-1 ring-[var(--accent)]/30' 
        : 'bg-[var(--card)] hover:bg-[var(--muted)]/30'
    } border-[var(--border)]`}>
      
      {/* Status Indicator Bar */}
      <div 
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          backgroundColor: request.status === 'completed' ? 'var(--accent)' :
                          request.status === 'processing' ? 'var(--primary)' :
                          request.status === 'queued' ? 'var(--secondary)' :
                          '#ef4444'
        }}
      />

      {/* Premium Badge */}
      {isPremium && (
        <div className="absolute top-4 right-4 z-10">
          <div 
            className="flex items-center gap-1 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg"
            style={{ background: `linear-gradient(135deg, var(--accent), var(--secondary))` }}
          >
            <Crown className="h-3 w-3" />
            Deep Dive
          </div>
        </div>
      )}

      <CardContent className="p-6">
        {/* Header Section */}
        <div className="flex items-start gap-4 mb-5">
          <div className="flex-shrink-0">
            <div className={`w-12 h-12 rounded-xl ${statusColors.bg} ${statusColors.border} flex items-center justify-center`}>
              {getIndustryIcon()}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[var(--foreground)] text-lg leading-tight truncate mb-1">
                  {request.companyName}
                </h3>
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors.bg}`}>
                  {request.status === 'completed' ? <CheckCircle className="h-3 w-3" style={statusColors.iconStyle} /> :
                   request.status === 'processing' ? <Clock className="h-3 w-3 animate-pulse" style={statusColors.iconStyle} /> :
                   request.status === 'queued' ? <Clock className="h-3 w-3" style={statusColors.iconStyle} /> :
                   <XCircle className="h-3 w-3" style={statusColors.iconStyle} />}
                  <span className="capitalize" style={statusColors.textStyle}>{request.status}</span>
                </div>
              </div>
            </div>
            
            {/* Business Context */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} />
                  <span className="font-medium">{request.businessContext.industry}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} />
                  <span>{request.businessContext.headquarters}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users2 className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} />
                  <span>{request.businessContext.employeeCount}</span>
                </div>
              </div>
              
              {/* Tags */}
              <div className="flex items-center gap-2 flex-wrap">
                <BadgeComponent className={`text-xs font-medium ${getSizeColor()}`} style={{ color: 'var(--foreground)' }}>
                  {request.businessContext.size} Company
                </BadgeComponent>
                <BadgeComponent variant="outline" className="text-xs border-[var(--border)] text-[var(--muted-foreground)]">
                  {request.businessContext.sector}
                </BadgeComponent>
                {request.companyNumber && (
                  <BadgeComponent variant="outline" className="text-xs font-mono border-[var(--border)] text-[var(--muted-foreground)]">
                    #{request.companyNumber}
                  </BadgeComponent>
                )}
              </div>
            </div>

            {/* Progress Section */}
            {(request.status === 'processing' || request.status === 'queued') && (
              <div className="mb-4 p-3 bg-[var(--muted)]/50 rounded-lg border border-[var(--border)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    {request.status === 'queued' ? 'Queued for Analysis' : 'Processing Analysis'}
                  </span>
                  <span className="text-sm font-semibold text-[var(--muted-foreground)]">
                    {request.progress}%
                  </span>
                </div>
                <Progress 
                  value={request.progress} 
                  className="h-2"
                />
                {request.status === 'processing' && (
                  <div className="text-xs text-[var(--muted-foreground)] mt-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" style={{ color: 'var(--primary)' }} />
                    Est. completion in {request.sla === 'fast' ? '10-15' : '30-45'} minutes
                  </div>
                )}
              </div>
            )}

            {/* Results Summary */}
            {request.status === 'completed' && request.result && (
              <div className="mb-4 p-4 bg-[var(--accent)]/10 rounded-lg border border-[var(--accent)]/20">
                <div className="text-sm text-[var(--foreground)] mb-3 leading-relaxed">
                  {request.result.summary}
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="text-center">
                    <div className="font-semibold text-lg" style={{ color: 'var(--accent)' }}>
                      {request.result.confidenceScore}%
                    </div>
                    <div className="text-[var(--muted-foreground)]">Confidence</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-lg" style={{ color: 'var(--primary)' }}>
                      {request.result.coverageScore}%
                    </div>
                    <div className="text-[var(--muted-foreground)]">Coverage</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-lg" style={{ color: 'var(--secondary)' }}>
                      {request.result.turnaroundTime}m
                    </div>
                    <div className="text-[var(--muted-foreground)]">Duration</div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Information */}
            {request.status === 'failed' && request.errorDetails && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                <div className="text-sm font-medium mb-2" style={{ color: '#ef4444' }}>
                  {request.errorDetails.message}
                </div>
                <div className="text-xs" style={{ color: '#ef4444' }}>
                  {request.errorDetails.suggestions[0]}
                </div>
              </div>
            )}

            {/* Request Meta */}
            <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] pt-2 border-t border-[var(--border)]">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" style={{ color: 'var(--primary)' }} />
                <span>{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</span>
              </div>
              <span className="font-medium">{request.requestedBy}</span>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Actions Footer */}
      {showActions && (
        <CardFooter className="bg-[var(--muted)]/30 border-t border-[var(--border)] p-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {request.status === 'completed' && request.result && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-2 border-[var(--border)] hover:bg-[var(--muted)]"
                  >
                    <Eye className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                    <span>View</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-2 border-[var(--border)] hover:bg-[var(--muted)]"
                  >
                    <Download className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                    <span>Download</span>
                  </Button>
                </>
              )}
              
              {request.status === 'completed' && request.type === 'snapshot' && (
                <Button 
                  size="sm" 
                  className="flex items-center gap-2 text-white border-0 shadow-md"
                  style={{ background: `linear-gradient(135deg, var(--accent), var(--secondary))` }}
                >
                  <Crown className="h-4 w-4" />
                  <span>Upgrade</span>
                </Button>
              )}
            </div>

            <Link href={`/due-diligence/requests/${request.id}`}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
              >
                <span>Details</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}