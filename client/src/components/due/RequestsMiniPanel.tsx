import { Link } from 'wouter';
import { Clock, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { StatusPill } from './StatusPill';
import { useRecentRequests } from '@/state/dueStore';
import { formatDistanceToNow } from 'date-fns';

export function RequestsMiniPanel() {
  const recentRequests = useRecentRequests(5);

  if (recentRequests.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-900 dark:text-gray-100">My Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No requests yet. Start with a snapshot above.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-gray-900 dark:text-gray-100">My Requests</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentRequests.map((request) => (
          <div key={request.id} className="border border-gray-100 dark:border-gray-800 rounded-lg p-3 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {request.companyName}
                  </h4>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    request.type === 'snapshot' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                  }`}>
                    {request.type === 'snapshot' ? 'Snapshot' : 'Deep Dive'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <StatusPill status={request.status} />
                  {request.status === 'processing' && (
                    <div className="flex-1 max-w-[100px]">
                      <Progress value={request.progress} className="h-1" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                </div>
              </div>
              <Link href={`/due-diligence/requests/${request.id}`}>
                <Button variant="ghost" size="sm" className="ml-2">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
        
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
          <Link href="/due-diligence/requests">
            <Button variant="outline" size="sm" className="w-full">
              View all requests →
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}