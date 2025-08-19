import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RequestForm } from '@/components/due/RequestForm';
import { RequestsTable } from '@/components/due/RequestsTable';

export default function DueDiligenceHub() {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Due Diligence</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Request comprehensive business analysis and risk assessment reports
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="all">All Requests</TabsTrigger>
            <TabsTrigger value="snapshot">Snapshots</TabsTrigger>
            <TabsTrigger value="deep_dive">Deep Dives</TabsTrigger>
          </TabsList>

          {/* Request Form */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              New Request
            </h2>
            <RequestForm />
          </div>

          {/* Requests Tables */}
          <TabsContent value="all" className="space-y-6">
            <RequestsTable typeFilter="all" />
          </TabsContent>

          <TabsContent value="snapshot" className="space-y-6">
            <RequestsTable typeFilter="snapshot" />
          </TabsContent>

          <TabsContent value="deep_dive" className="space-y-6">
            <RequestsTable typeFilter="deep_dive" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}