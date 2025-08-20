import { Link } from 'wouter';
import { Clock, Eye, Building2, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function RequestsMiniPanel() {
  // Sample requests to show in the dashboard
  const sampleRequests = [
    {
      id: 'req-001',
      companyName: 'TechFlow Solutions Ltd',
      type: 'snapshot',
      status: 'completed',
      createdAt: '2 days ago'
    },
    {
      id: 'req-002', 
      companyName: 'InnovateCorp',
      type: 'deep_dive',
      status: 'processing',
      createdAt: '1 day ago'
    },
    {
      id: 'req-003',
      companyName: 'DataStream Analytics',
      type: 'snapshot', 
      status: 'completed',
      createdAt: '4 hours ago'
    }
  ];

  const hasRequests = sampleRequests.length > 0;

  if (!hasRequests) {
    return (
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-900 dark:text-gray-100">My Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full inline-flex mb-3">
              <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              No requests yet. Start with a snapshot above.
            </p>
            <Link href="/due-diligence">
              <Button variant="outline" size="sm" className="w-full text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800">
                View Due Diligence Hub →
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show requests list when we have requests
  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-gray-900 dark:text-gray-100">My Requests</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {sampleRequests.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {sampleRequests.slice(0, 3).map((request) => (
          <Link key={request.id} href={`/due-diligence/${request.id}`}>
            <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {request.companyName}
                </h4>
                {request.status === 'completed' ? (
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <Badge 
                  variant={request.type === 'deep_dive' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {request.type === 'deep_dive' ? 'Deep Dive' : 'Snapshot'}
                </Badge>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {request.createdAt}
                </span>
              </div>
            </div>
          </Link>
        ))}
        
        <Link href="/due-diligence">
          <Button variant="outline" size="sm" className="w-full mt-3 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800">
            View All Requests →
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}