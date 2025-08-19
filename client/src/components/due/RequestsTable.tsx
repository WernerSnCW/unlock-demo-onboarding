import { useState } from 'react';
import { Link } from 'wouter';
import { Search, Filter, Download, ExternalLink, Eye, Clock, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { StatusPill } from './StatusPill';
import { useRequests, type DueRequest } from '@/state/dueStore';
import { formatDistanceToNow } from 'date-fns';

interface RequestsTableProps {
  typeFilter?: 'all' | 'snapshot' | 'deep_dive';
  limit?: number;
}

export function RequestsTable({ typeFilter = 'all', limit }: RequestsTableProps) {
  const allRequests = useRequests();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Filter requests
  const filteredRequests = allRequests.filter(request => {
    // Type filter
    if (typeFilter !== 'all' && request.type !== typeFilter) return false;
    
    // Search filter
    if (searchTerm && !request.companyName.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !request.companyNumber?.includes(searchTerm)) return false;
    
    // Status filter
    if (statusFilter !== 'all' && request.status !== statusFilter) return false;
    
    // Time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      const requestDate = new Date(request.createdAt);
      const daysDiff = (now.getTime() - requestDate.getTime()) / (1000 * 3600 * 24);
      
      if (timeFilter === 'today' && daysDiff > 1) return false;
      if (timeFilter === '7d' && daysDiff > 7) return false;
      if (timeFilter === '30d' && daysDiff > 30) return false;
    }
    
    return true;
  });

  // Sort requests
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'company':
        return a.companyName.localeCompare(b.companyName);
      case 'status':
        return a.status.localeCompare(b.status);
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  // Apply limit if specified
  const displayRequests = limit ? sortedRequests.slice(0, limit) : sortedRequests;

  if (displayRequests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400">
          {allRequests.length === 0 ? (
            <div>
              <p className="text-lg mb-2">No requests yet.</p>
              <p>Start with a Snapshot or request a Deep Dive.</p>
            </div>
          ) : (
            <p>No requests match your current filters.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls - hidden when limit is set (preview mode) */}
      {!limit && (
        <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search company name or number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <SelectItem value="all" className="text-gray-900 dark:text-gray-100">All Status</SelectItem>
              <SelectItem value="queued" className="text-gray-900 dark:text-gray-100">Queued</SelectItem>
              <SelectItem value="processing" className="text-gray-900 dark:text-gray-100">Processing</SelectItem>
              <SelectItem value="completed" className="text-gray-900 dark:text-gray-100">Completed</SelectItem>
              <SelectItem value="failed" className="text-gray-900 dark:text-gray-100">Failed</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-24 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <SelectItem value="all" className="text-gray-900 dark:text-gray-100">All Time</SelectItem>
              <SelectItem value="today" className="text-gray-900 dark:text-gray-100">Today</SelectItem>
              <SelectItem value="7d" className="text-gray-900 dark:text-gray-100">7 days</SelectItem>
              <SelectItem value="30d" className="text-gray-900 dark:text-gray-100">30 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <SelectItem value="newest" className="text-gray-900 dark:text-gray-100">Newest</SelectItem>
              <SelectItem value="oldest" className="text-gray-900 dark:text-gray-100">Oldest</SelectItem>
              <SelectItem value="company" className="text-gray-900 dark:text-gray-100">Company A–Z</SelectItem>
              <SelectItem value="status" className="text-gray-900 dark:text-gray-100">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
        </div>
      )}

      {/* Table */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200 dark:border-gray-700">
              <TableHead className="text-gray-900 dark:text-gray-100">Company</TableHead>
              <TableHead className="text-gray-900 dark:text-gray-100">Business Info</TableHead>
              <TableHead className="text-gray-900 dark:text-gray-100">Type</TableHead>
              <TableHead className="text-gray-900 dark:text-gray-100">Status</TableHead>
              <TableHead className="text-gray-900 dark:text-gray-100">Assessment</TableHead>
              <TableHead className="text-gray-900 dark:text-gray-100">Requested</TableHead>
              <TableHead className="text-gray-900 dark:text-gray-100">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayRequests.map((request) => (
              <TableRow 
                key={request.id} 
                className="border-gray-200 dark:border-gray-700 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => window.location.href = `/due-diligence/requests/${request.id}`}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {request.companyName}
                        </span>
                        {request.companyNumber && (
                          <Check className="h-3 w-3 text-green-600" />
                        )}
                      </div>
                      {request.companyNumber && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {request.companyNumber}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {request.businessContext.industry}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {request.businessContext.headquarters} • {request.businessContext.size}
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      request.type === 'snapshot' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                    }`}>
                      {request.type === 'snapshot' ? 'Snapshot' : 'Deep Dive'}
                    </span>
                    {request.type === 'deep_dive' && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
                        Premium
                      </span>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    <StatusPill status={request.status} />
                    {request.status === 'processing' && (
                      <Progress value={request.progress} className="w-16 h-1" />
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  {request.status === 'completed' && request.result ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                          4.3/5.0
                        </span>
                        <div className="flex items-center">
                          {[1, 2, 3, 4].map((star) => (
                            <span key={star} className="text-amber-400 text-xs">★</span>
                          ))}
                          <span className="text-gray-300 text-xs">★</span>
                        </div>
                      </div>
                      <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded font-medium">
                        Recommended
                      </span>
                    </div>
                  ) : request.status === 'processing' ? (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Analyzing...
                    </div>
                  ) : request.status === 'queued' ? (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Queued
                    </div>
                  ) : request.status === 'failed' ? (
                    <div className="text-xs text-red-600 dark:text-red-400">
                      Failed
                    </div>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 text-sm">—</span>
                  )}
                </TableCell>
                
                <TableCell className="text-gray-600 dark:text-gray-400 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {request.requestedBy}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Link href={`/due-diligence/requests/${request.id}`}>
                      <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Explore Report
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}