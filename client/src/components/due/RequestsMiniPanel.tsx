import { Link } from 'wouter';
import { Clock, Eye, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function RequestsMiniPanel() {
  // Using static data to avoid Zustand infinite loop issues
  // This will be shown until user creates actual requests
  const hasRequests = false;

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
              <div className="w-full px-3 py-2 text-sm font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer text-center">
                View Due Diligence Hub →
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}