import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  ArrowRight, 
  Gauge,
  TrendingUp,
  Shield,
  LayoutGrid,
  List,
  Calendar,
  Target
} from 'lucide-react';
import { RequestForm } from '@/components/due/RequestForm';
import { RequestsTable } from '@/components/due/RequestsTable';
import { RequestCard } from '@/components/due/RequestCard';
import { useDueStore } from '@/state/dueStore';
import { Link } from 'wouter';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function DueDiligenceHub() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const { requests } = useDueStore();

  const totalRequests = requests.length;
  const completedRequests = requests.filter(r => r.status === 'completed').length;
  const processingRequests = requests.filter(r => r.status === 'processing').length;
  const queuedRequests = requests.filter(r => r.status === 'queued').length;
  const failedRequests = requests.filter(r => r.status === 'failed').length;
  
  // Calculate metrics
  const snapshotCount = requests.filter(r => r.type === 'snapshot').length;
  const deepDiveCount = requests.filter(r => r.type === 'deep_dive').length;
  const avgTurnaround = requests
    .filter(r => r.status === 'completed' && r.result?.turnaroundTime)
    .reduce((sum, r) => sum + (r.result?.turnaroundTime || 0), 0) / 
    Math.max(1, requests.filter(r => r.status === 'completed' && r.result?.turnaroundTime).length);
  const failureRate = totalRequests > 0 ? Math.round((failedRequests / totalRequests) * 100) : 0;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Due Diligence Hub
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Comprehensive business intelligence and risk assessment platform
                </p>
              </div>
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button size="lg">
                    <Plus className="h-4 w-4 mr-2" />
                    New Request
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      <Building2 className="h-5 w-5" />
                      Request Due Diligence Snapshot
                    </DialogTitle>
                  </DialogHeader>
                  <RequestForm 
                    onSuccess={() => setIsFormOpen(false)}
                    className="mt-4"
                  />
                </DialogContent>
              </Dialog>
            </div>

            {/* Enhanced Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Total Requests */}
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Requests</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalRequests}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {snapshotCount} Snapshots, {deepDiveCount} Deep Dives
                      </p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-full">
                      <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Completed */}
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">{completedRequests}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Avg. {Math.round(avgTurnaround)}min turnaround
                      </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-full">
                      <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Processing + Queued */}
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{processingRequests + queuedRequests}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {processingRequests} processing, {queuedRequests} queued
                      </p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-full">
                      <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reliability */}
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Reliability</p>
                      <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{100 - failureRate}%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {failedRequests} failed of {totalRequests} total
                      </p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-full">
                      <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Requests Display with View Toggle */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-gray-900 dark:text-gray-100">Recent Requests</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Track and manage your due diligence requests
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {/* View Toggle */}
                  <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'cards' | 'table')} className="w-auto">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="cards" className="flex items-center gap-1">
                        <LayoutGrid className="h-3 w-3" />
                        Cards
                      </TabsTrigger>
                      <TabsTrigger value="table" className="flex items-center gap-1">
                        <List className="h-3 w-3" />
                        Table
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  {totalRequests > 0 && (
                    <Link href="/due-diligence/requests">
                      <Button variant="outline" size="sm">
                        View All <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {totalRequests === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Building2 className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Welcome to Due Diligence Hub
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
                      Get started by requesting your first due diligence snapshot. We'll analyze company data from public records and provide comprehensive insights.
                    </p>
                    <Button onClick={() => setIsFormOpen(true)} size="lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Request
                    </Button>
                  </div>
                ) : viewMode === 'cards' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {requests.slice(0, 6).map((request) => (
                      <RequestCard key={request.id} request={request} />
                    ))}
                  </div>
                ) : (
                  <RequestsTable limit={5} />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}