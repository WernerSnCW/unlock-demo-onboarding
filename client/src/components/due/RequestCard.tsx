import { Link } from 'wouter';
import { 
  Building2, 
  Clock, 
  Check, 
  AlertCircle, 
  Download, 
  ExternalLink, 
  Eye, 
  MoreHorizontal, 
  Crown,
  MapPin,
  Users,
  Badge,
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
  const getStatusIcon = () => {
    switch (request.status) {
      case 'completed':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'queued':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getIndustryIcon = () => {
    switch (request.businessContext.industry) {
      case 'Technology':
        return '💻';
      case 'Financial Services':
        return '💰';
      case 'Healthcare':
        return '🏥';
      case 'Retail':
        return '🛍️';
      case 'Energy':
        return '⚡';
      case 'Manufacturing':
        return '🏭';
      default:
        return '🏢';
    }
  };

  const getSizeColor = () => {
    switch (request.businessContext.size) {
      case 'Large':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'Medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Small':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Micro':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const isPremium = request.type === 'deep_dive';

  return (
    <Card className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg ${
      isPremium ? 'ring-2 ring-amber-200 dark:ring-amber-800' : ''
    }`}>
      {/* Premium Badge */}
      {isPremium && (
        <div className="absolute top-3 right-3 z-10">
          <div className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            <Crown className="h-3 w-3" />
            Pro
          </div>
        </div>
      )}

      <CardContent className="p-6 pb-4">
        {/* Header Section */}
        <div className="flex items-start gap-3 mb-4">
          <div className="text-2xl">{getIndustryIcon()}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-[var(--foreground)] text-lg truncate">
                {request.companyName}
              </h3>
              <div className="flex items-center gap-1">
                {getStatusIcon()}
                <StatusPill status={request.status} />
              </div>
            </div>
            
            {/* Business Context */}
            <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)] mb-2">
              <div className="flex items-center gap-1">
                <Badge className="h-3 w-3" />
                <span>{request.businessContext.industry}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{request.businessContext.headquarters}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{request.businessContext.employeeCount} employees</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex items-center gap-2 mb-3">
              <BadgeComponent variant="secondary" className={getSizeColor()}>
                {request.businessContext.size}
              </BadgeComponent>
              <BadgeComponent variant="outline" className="text-xs">
                {request.businessContext.sector}
              </BadgeComponent>
              {request.companyNumber && (
                <BadgeComponent variant="outline" className="text-xs font-mono">
                  {request.companyNumber}
                </BadgeComponent>
              )}
            </div>

            {/* Progress Section */}
            {(request.status === 'processing' || request.status === 'queued') && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-[var(--muted-foreground)]">
                    {request.status === 'queued' ? 'Queued for processing' : 'Processing...'}
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {request.progress}%
                  </span>
                </div>
                <Progress 
                  value={request.progress} 
                  className="h-2"
                />
                {request.status === 'processing' && (
                  <div className="text-xs text-[var(--muted-foreground)] mt-1">
                    Est. completion in {request.sla === 'fast' ? '10-15' : '30-45'} minutes
                  </div>
                )}
              </div>
            )}

            {/* Results Summary */}
            {request.status === 'completed' && request.result && (
              <div className="mb-3">
                <div className="text-sm text-[var(--muted-foreground)] mb-2">
                  {request.result.summary}
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span>{request.result.confidenceScore}% confidence</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Check className="h-3 w-3 text-blue-600" />
                    <span>{request.result.coverageScore}% coverage</span>
                  </div>
                  <div className="text-[var(--muted-foreground)]">
                    {request.result.turnaroundTime}min turnaround
                  </div>
                </div>
              </div>
            )}

            {/* Error Information */}
            {request.status === 'failed' && request.errorDetails && (
              <div className="mb-3">
                <div className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">
                  {request.errorDetails.message}
                </div>
                <div className="text-xs text-[var(--muted-foreground)]">
                  {request.errorDetails.suggestions[0]}
                </div>
              </div>
            )}

            {/* Request Meta */}
            <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
              <span>
                Requested {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
              </span>
              <span>by {request.requestedBy}</span>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Actions Footer */}
      {showActions && (
        <CardFooter className="bg-[var(--muted)]/30 p-4 pt-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {request.status === 'completed' && request.result && (
                <>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>View Report</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    <span>Download</span>
                  </Button>
                </>
              )}
              
              {request.status === 'completed' && request.type === 'snapshot' && (
                <Button variant="default" size="sm" className="flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white">
                  <Crown className="h-3 w-3" />
                  <span>Upgrade to Deep Dive</span>
                </Button>
              )}
            </div>

            <Link href={`/due-diligence/requests/${request.id}`}>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <ExternalLink className="h-3 w-3" />
                <span>Details</span>
              </Button>
            </Link>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}