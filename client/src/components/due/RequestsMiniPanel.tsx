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
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg rounded-2xl overflow-hidden">
      <CardHeader className="pb-3 pt-4 px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950/40 dark:via-blue-950/30 dark:to-indigo-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl shadow-sm">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">My Requests</CardTitle>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Recent due diligence reports</p>
            </div>
          </div>
          <Badge 
            className="text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 dark:from-blue-900/40 dark:to-blue-800/60 dark:text-blue-300 border-0 rounded-full px-2.5 py-1 shadow-sm"
          >
            {sampleRequests.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-3">
        <div className="space-y-2.5">
          {sampleRequests.slice(0, 3).map((request, index) => (
            <Link key={request.id} href={`/due-diligence/${request.id}`}>
              <div className={`group p-4 rounded-2xl border-0 transition-all duration-300 cursor-pointer shadow-sm ${
              request.status === 'completed' 
                ? 'bg-gradient-to-r from-emerald-50/80 via-green-50/60 to-teal-50/80 dark:from-emerald-950/30 dark:via-green-950/20 dark:to-teal-950/30 hover:shadow-lg hover:shadow-green-200/40 dark:hover:shadow-green-900/20' 
                : 'bg-gradient-to-r from-amber-50/80 via-orange-50/60 to-yellow-50/80 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-yellow-950/30 hover:shadow-lg hover:shadow-orange-200/40 dark:hover:shadow-orange-900/20'
            } hover:scale-[1.02] hover:-translate-y-1`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full shadow-sm ${
                    request.status === 'completed' 
                      ? 'bg-gradient-to-br from-emerald-100 to-green-200 dark:from-emerald-900/40 dark:to-green-800/60' 
                      : 'bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-900/40 dark:to-orange-800/60'
                  }`}>
                    {request.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">
                      {request.companyName}
                    </h4>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-1 group-hover:translate-x-0">
                  <Eye className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge 
                  className={`text-xs font-semibold px-3 py-1 rounded-full border-0 shadow-sm ${
                    request.type === 'deep_dive' 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                      : 'bg-gradient-to-r from-slate-100 to-gray-200 text-slate-700 dark:from-slate-800 dark:to-gray-700 dark:text-slate-300'
                  }`}
                >
                  {request.type === 'deep_dive' ? 'Deep Dive' : 'Snapshot'}
                </Badge>
                <div className="flex items-center gap-2 text-xs font-medium">
                  <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${
                    request.status === 'completed' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-pulse'
                  }`}></span>
                  <span className="text-gray-600 dark:text-gray-400">{request.createdAt}</span>
                </div>
              </div>
            </div>
          </Link>
          ))}
        </div>
        
        <div className="pt-3 mt-1 border-t border-gray-100 dark:border-gray-800">
          <Link href="/due-diligence">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-950/30 dark:hover:to-indigo-950/30 transition-all duration-300 rounded-xl font-medium group"
            >
              <Eye className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              View All Requests
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}