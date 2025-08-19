import { Link } from 'wouter';
import { 
  Building, 
  Clock, 
  Download, 
  Eye, 
  Calendar,
  Crown,
  MapPin,
  Users2,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge as BadgeComponent } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';
import type { DueRequest } from '@/state/dueStore';

interface RequestCardProps {
  request: DueRequest;
  showActions?: boolean;
  variant?: 'default' | 'compact';
}

export function RequestCard({ request, showActions = true, variant = 'default' }: RequestCardProps) {
  const getStatusPillStyle = () => {
    switch (request.status) {
      case 'completed':
        return 'bg-[var(--success)] text-white';
      case 'processing':
        return 'bg-[var(--accent)] text-black';
      case 'failed':
        return 'bg-[var(--destructive)] text-white';
      case 'queued':
        return 'bg-[var(--muted)] text-[var(--muted-foreground)]';
      default:
        return 'bg-[var(--muted)] text-[var(--muted-foreground)]';
    }
  };

  const isPremium = request.type === 'deep_dive';
  const isLoading = request.status === 'processing' || request.status === 'queued';
  const isCompleted = request.status === 'completed';
  const isFailed = request.status === 'failed';

  const truncateTitle = (title: string, maxLength = 45) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength).trim() + '...';
  };

  const truncateSummary = (summary: string, maxLength = 120) => {
    if (!summary || summary.length <= maxLength) return summary;
    return summary.substring(0, maxLength).trim() + '...';
  };

  return (
    <Card className={`group transition-all duration-200 hover:shadow-md border border-[var(--border)] ${
      variant === 'compact' ? 'p-3' : 'p-4'
    }`} 
    style={{ borderRadius: '12px' }}>
      
      {/* Content Zone */}
      <CardContent className="p-0 space-y-3">
        {/* Who & Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 
              className="font-semibold text-[var(--foreground)] group-hover:underline leading-tight" 
              style={{ fontSize: '17px', lineHeight: '1.3' }}
              title={request.companyName}
            >
              {truncateTitle(request.companyName)}
            </h3>
            {isPremium && (
              <div className="flex items-center gap-1 mt-1">
                <BadgeComponent className="text-xs px-2 py-0.5 bg-gradient-to-r from-[var(--accent)] to-[var(--secondary)] text-black font-medium">
                  Deep Dive
                </BadgeComponent>
              </div>
            )}
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusPillStyle()}`}>
            {request.status === 'completed' ? 'Completed' :
             request.status === 'processing' ? 'Processing' :
             request.status === 'queued' ? 'Queued' :
             'Failed'}
          </div>
        </div>

        {/* Essentials */}
        <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
          <span className="font-medium">{request.businessContext.industry}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3 opacity-70" />
            {request.businessContext.headquarters}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Users2 className="h-3 w-3 opacity-70" />
            {request.businessContext.size} ({request.businessContext.employeeCount})
          </span>
          {request.companyNumber && (
            <>
              <span>•</span>
              <span className="font-mono text-xs">#{request.companyNumber}</span>
            </>
          )}
        </div>

        {/* Result Snapshot / Progress */}
        {isLoading && (
          <div className="space-y-2">
            <div className="text-sm text-[var(--muted-foreground)]">
              {request.status === 'queued' ? 'Queued for analysis...' : 'Analyzing company data...'}
            </div>
            <Progress value={request.progress} className="h-2" />
          </div>
        )}

        {isCompleted && request.result && (
          <div className="text-sm text-[var(--foreground)]">
            {truncateSummary(request.result.summary)}
          </div>
        )}

        {isFailed && request.errorDetails && (
          <div className="flex items-start gap-2 p-3 bg-[var(--destructive)]/10 rounded-lg border border-[var(--destructive)]/20">
            <AlertTriangle className="h-4 w-4 text-[var(--destructive)] mt-0.5 flex-shrink-0" />
            <div className="text-sm text-[var(--destructive)]">
              {request.errorDetails.message}
            </div>
          </div>
        )}

        {/* Key Metrics */}
        {variant !== 'compact' && (
          <>
            {isLoading && (
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="font-medium">{request.progress}%</span>
                  <span className="text-xs text-[var(--muted-foreground)] ml-1">Progress</span>
                </div>
                {request.status === 'processing' && (
                  <div>
                    <span className="font-medium">{request.sla === 'fast' ? '10-15' : '30-45'}min</span>
                    <span className="text-xs text-[var(--muted-foreground)] ml-1">Est. time</span>
                  </div>
                )}
              </div>
            )}

            {isCompleted && request.result && (
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="font-medium">{request.result.confidenceScore}%</span>
                  <span className="text-xs text-[var(--muted-foreground)] ml-1">Confidence</span>
                </div>
                <div>
                  <span className="font-medium">{request.result.coverageScore}%</span>
                  <span className="text-xs text-[var(--muted-foreground)] ml-1">Coverage</span>
                </div>
                <div>
                  <span className="font-medium">{request.result.turnaroundTime}min</span>
                  <span className="text-xs text-[var(--muted-foreground)] ml-1">Turnaround</span>
                </div>
              </div>
            )}
          </>
        )}

        {/* When & Who */}
        <div className="flex items-center justify-between text-sm text-[var(--muted-foreground)]">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 opacity-70" />
            <span>{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</span>
          </div>
          <span>{request.requestedBy}</span>
        </div>
      </CardContent>

      {/* Actions Zone */}
      {showActions && (
        <CardFooter className="border-t border-[var(--border)] p-0 pt-3 mt-4">
          <div className="flex items-center gap-2 w-full">
            {isCompleted && request.result && (
              <>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Eye className="h-3 w-3 opacity-70" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Download className="h-3 w-3 opacity-70" />
                  Download
                </Button>
                {request.type === 'snapshot' && (
                  <Button 
                    size="sm" 
                    className="flex items-center gap-1 bg-gradient-to-r from-[var(--accent)] to-[var(--secondary)] text-black hover:opacity-90"
                  >
                    <Crown className="h-3 w-3" />
                    Upgrade
                  </Button>
                )}
              </>
            )}

            {isFailed && (
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <RotateCcw className="h-3 w-3 opacity-70" />
                Retry
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}