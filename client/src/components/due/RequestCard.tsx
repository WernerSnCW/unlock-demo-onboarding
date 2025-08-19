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
  AlertTriangle,
  ExternalLink
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
    <Card className="group transition-all duration-200 hover:shadow-md border border-[var(--border)] overflow-hidden" 
    style={{ borderRadius: '12px', padding: '16px' }}>
      
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
        <div className="flex items-center flex-wrap gap-2 text-sm text-[var(--muted-foreground)]">
          <span className="font-medium">{request.businessContext.industry}</span>
          <span className="text-xs">•</span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3 opacity-70" />
            {request.businessContext.headquarters}
          </span>
          <span className="text-xs">•</span>
          <span className="flex items-center gap-1">
            <Users2 className="h-3 w-3 opacity-70" />
            {request.businessContext.size} ({request.businessContext.employeeCount})
          </span>
          {request.companyNumber && (
            <>
              <span className="text-xs">•</span>
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
          <div className="space-y-2">
            <div className="text-sm text-[var(--foreground)]">
              {truncateSummary(request.result.summary)}
            </div>
            {/* Overall Assessment Score */}
            <div className="p-2 bg-[var(--muted)]/30 rounded-lg">
              <div className="text-xs text-[var(--muted-foreground)] font-medium mb-1">Overall Assessment</div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-[var(--foreground)]">
                  {request.result.overallScore || '4.3'}/5.0
                </span>
                <div className="flex items-center">
                  {[1, 2, 3, 4].map((star) => (
                    <span key={star} className="text-[var(--accent)] text-sm">★</span>
                  ))}
                  <span className="text-gray-300 text-sm">★</span>
                </div>
                <span className="text-xs px-1.5 py-0.5 bg-[var(--success)] text-white rounded font-medium">
                  Recommended
                </span>
              </div>
            </div>
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
              <div className="flex items-center flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="font-medium">{request.progress}%</span>
                  <span className="text-xs text-[var(--muted-foreground)]">Progress</span>
                </div>
                {request.status === 'processing' && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{request.sla === 'fast' ? '10-15' : '30-45'}min</span>
                    <span className="text-xs text-[var(--muted-foreground)]">Est. time</span>
                  </div>
                )}
              </div>
            )}

            {isCompleted && request.result && (
              <div className="flex items-center flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="font-medium">{request.result.confidenceScore}%</span>
                  <span className="text-xs text-[var(--muted-foreground)]">Confidence</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{request.result.coverageScore}%</span>
                  <span className="text-xs text-[var(--muted-foreground)]">Coverage</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{request.result.turnaroundTime}min</span>
                  <span className="text-xs text-[var(--muted-foreground)]">Turnaround</span>
                </div>
              </div>
            )}
          </>
        )}

        {/* When & Who */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-sm text-[var(--muted-foreground)]">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 opacity-70" />
            <span className="text-xs">{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</span>
          </div>
          <span className="text-xs">{request.requestedBy}</span>
        </div>
      </CardContent>

      {/* Actions Zone */}
      {showActions && (
        <CardFooter className="border-t border-[var(--border)] p-0 pt-3 mt-3">
          <div className="flex items-center flex-wrap gap-2 w-full">
            {isCompleted && request.result && (
              <>
                <Link href={`/snapshot-report/${request.id}`}>
                  <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs">
                    <Eye className="h-3 w-3 opacity-70" />
                    Report
                  </Button>
                </Link>
                <Link href={`/due-diligence/requests/${request.id}`}>
                  <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs">
                    <ExternalLink className="h-3 w-3 opacity-70" />
                    Details
                  </Button>
                </Link>
                <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs">
                  <Download className="h-3 w-3 opacity-70" />
                  Download
                </Button>
                {request.type === 'snapshot' && (
                  <Button 
                    size="sm" 
                    className="flex items-center gap-1 bg-gradient-to-r from-[var(--accent)] to-[var(--secondary)] text-black hover:opacity-90 text-xs"
                  >
                    <Crown className="h-3 w-3" />
                    Upgrade
                  </Button>
                )}
              </>
            )}

            {isFailed && (
              <>
                <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs">
                  <RotateCcw className="h-3 w-3 opacity-70" />
                  Retry
                </Button>
                <Link href={`/due-diligence/requests/${request.id}`}>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1 text-xs">
                    <ExternalLink className="h-3 w-3 opacity-70" />
                    Details
                  </Button>
                </Link>
              </>
            )}

            {(request.status === 'processing' || request.status === 'queued') && (
              <Link href={`/due-diligence/requests/${request.id}`}>
                <Button variant="ghost" size="sm" className="flex items-center gap-1 text-xs">
                  <ExternalLink className="h-3 w-3 opacity-70" />
                  Details
                </Button>
              </Link>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}