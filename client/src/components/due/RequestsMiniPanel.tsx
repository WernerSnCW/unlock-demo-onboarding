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
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm rounded-xl">
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-lg text-gray-900 dark:text-gray-100">My Requests</CardTitle>
          </div>
          <Badge 
            variant="secondary" 
            className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800"
          >
            {sampleRequests.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {sampleRequests.slice(0, 3).map((request, index) => (
            <Link key={request.id} href={`/due-diligence/${request.id}`}>
              <div className={`group p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
              request.status === 'completed' 
                ? 'border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 hover:shadow-md hover:shadow-green-100 dark:hover:shadow-green-900/20' 
                : 'border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 hover:shadow-md hover:shadow-amber-100 dark:hover:shadow-amber-900/20'
            } hover:scale-[1.01] hover:-translate-y-0.5`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${
                    request.status === 'completed' 
                      ? 'bg-green-100 dark:bg-green-900/30' 
                      : 'bg-amber-100 dark:bg-amber-900/30'
                  }`}>
                    {request.status === 'completed' ? (
                      <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                    ) : (
                      <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                      {request.companyName}
                    </h4>
                  </div>
                </div>
                <Eye className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </div>
              <div className="flex items-center justify-between">
                <Badge 
                  variant={request.type === 'deep_dive' ? 'default' : 'secondary'}
                  className={`text-xs font-medium px-2 py-0.5 ${
                    request.type === 'deep_dive' 
                      ? 'bg-blue-600 text-white dark:bg-blue-500 hover:bg-blue-700' 
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                  style={request.type === 'deep_dive' ? { backgroundColor: '#5193B3' } : {}}
                >
                  {request.type === 'deep_dive' ? 'Deep Dive' : 'Snapshot'}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <span className={`w-2 h-2 rounded-full ${
                    request.status === 'completed' ? 'bg-green-400' : 'bg-amber-400'
                  }`}></span>
                  {request.createdAt}
                </div>
              </div>
            </div>
          </Link>
          ))}
        </div>
        
        <div className="pt-2">
          <Link href="/due-diligence">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-2 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200 rounded-xl"
            >
              <Eye className="h-4 w-4 mr-2" />
              View All Requests
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}