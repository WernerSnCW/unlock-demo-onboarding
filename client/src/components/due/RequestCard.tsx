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
          bg: 'bg-emerald-50 dark:bg-emerald-950/20',
          border: 'border-emerald-200 dark:border-emerald-800',
          icon: 'text-emerald-600 dark:text-emerald-400',
          text: 'text-emerald-700 dark:text-emerald-300'
        };
      case 'processing':
        return {
          bg: 'bg-blue-50 dark:bg-blue-950/20',
          border: 'border-blue-200 dark:border-blue-800',
          icon: 'text-blue-600 dark:text-blue-400',
          text: 'text-blue-700 dark:text-blue-300'
        };
      case 'queued':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/20',
          border: 'border-amber-200 dark:border-amber-800',
          icon: 'text-amber-600 dark:text-amber-400',
          text: 'text-amber-700 dark:text-amber-300'
        };
      case 'failed':
        return {
          bg: 'bg-red-50 dark:bg-red-950/20',
          border: 'border-red-200 dark:border-red-800',
          icon: 'text-red-600 dark:text-red-400',
          text: 'text-red-700 dark:text-red-300'
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-950/20',
          border: 'border-gray-200 dark:border-gray-800',
          icon: 'text-gray-600 dark:text-gray-400',
          text: 'text-gray-700 dark:text-gray-300'
        };
    }
  };

  const getIndustryIcon = () => {
    switch (request.businessContext.industry) {
      case 'Technology':
        return <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'Financial Services':
        return <Building className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'Healthcare':
        return <Star className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case 'Retail':
        return <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      case 'Energy':
        return <Crown className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
      case 'Manufacturing':
        return <Building className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
      default:
        return <Building className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getSizeColor = () => {
    switch (request.businessContext.size) {
      case 'Large':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
      case 'Medium':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800';
      case 'Small':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
      case 'Micro':
        return 'bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 border border-orange-200 dark:border-orange-800';
      default:
        return 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
    }
  };

  const isPremium = request.type === 'deep_dive';
  const statusColors = getStatusColor();

  return (
    <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl border-0 ${
      isPremium 
        ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 ring-1 ring-amber-200 dark:ring-amber-800' 
        : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'
    } ${statusColors.border}`}>
      
      {/* Status Indicator Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        request.status === 'completed' ? 'bg-emerald-500' :
        request.status === 'processing' ? 'bg-blue-500' :
        request.status === 'queued' ? 'bg-amber-500' :
        'bg-red-500'
      }`} />

      {/* Premium Badge */}
      {isPremium && (
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
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
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg leading-tight truncate mb-1">
                  {request.companyName}
                </h3>
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                  {request.status === 'completed' ? <CheckCircle className="h-3 w-3" /> :
                   request.status === 'processing' ? <Clock className="h-3 w-3 animate-pulse" /> :
                   request.status === 'queued' ? <Clock className="h-3 w-3" /> :
                   <XCircle className="h-3 w-3" />}
                  <span className="capitalize">{request.status}</span>
                </div>
              </div>
            </div>
            
            {/* Business Context */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span className="font-medium">{request.businessContext.industry}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{request.businessContext.headquarters}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users2 className="h-3.5 w-3.5" />
                  <span>{request.businessContext.employeeCount}</span>
                </div>
              </div>
              
              {/* Tags */}
              <div className="flex items-center gap-2 flex-wrap">
                <BadgeComponent className={`text-xs font-medium ${getSizeColor()}`}>
                  {request.businessContext.size} Company
                </BadgeComponent>
                <BadgeComponent variant="outline" className="text-xs border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                  {request.businessContext.sector}
                </BadgeComponent>
                {request.companyNumber && (
                  <BadgeComponent variant="outline" className="text-xs font-mono border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-500">
                    #{request.companyNumber}
                  </BadgeComponent>
                )}
              </div>
            </div>

            {/* Progress Section */}
            {(request.status === 'processing' || request.status === 'queued') && (
              <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {request.status === 'queued' ? 'Queued for Analysis' : 'Processing Analysis'}
                  </span>
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    {request.progress}%
                  </span>
                </div>
                <Progress 
                  value={request.progress} 
                  className="h-2 bg-slate-200 dark:bg-slate-700"
                />
                {request.status === 'processing' && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Est. completion in {request.sla === 'fast' ? '10-15' : '30-45'} minutes
                  </div>
                )}
              </div>
            )}

            {/* Results Summary */}
            {request.status === 'completed' && request.result && (
              <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <div className="text-sm text-slate-700 dark:text-slate-300 mb-3 leading-relaxed">
                  {request.result.summary}
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="text-center">
                    <div className="font-semibold text-emerald-700 dark:text-emerald-300 text-lg">
                      {request.result.confidenceScore}%
                    </div>
                    <div className="text-slate-600 dark:text-slate-400">Confidence</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-blue-700 dark:text-blue-300 text-lg">
                      {request.result.coverageScore}%
                    </div>
                    <div className="text-slate-600 dark:text-slate-400">Coverage</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-purple-700 dark:text-purple-300 text-lg">
                      {request.result.turnaroundTime}m
                    </div>
                    <div className="text-slate-600 dark:text-slate-400">Duration</div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Information */}
            {request.status === 'failed' && request.errorDetails && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="text-sm text-red-700 dark:text-red-300 font-medium mb-2">
                  {request.errorDetails.message}
                </div>
                <div className="text-xs text-red-600 dark:text-red-400">
                  {request.errorDetails.suggestions[0]}
                </div>
              </div>
            )}

            {/* Request Meta */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</span>
              </div>
              <span className="font-medium">{request.requestedBy}</span>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Actions Footer */}
      {showActions && (
        <CardFooter className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {request.status === 'completed' && request.result && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-2 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-2 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </Button>
                </>
              )}
              
              {request.status === 'completed' && request.type === 'snapshot' && (
                <Button 
                  size="sm" 
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-md"
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
                className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700"
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