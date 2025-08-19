import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Building2, TrendingUp, ArrowRight } from "lucide-react";
import { RequestForm } from './due/RequestForm';

interface DDSnapshotHeroProps {
  onToolOpen?: (toolId: string) => void;
}

export default function DDSnapshotHero({ onToolOpen }: DDSnapshotHeroProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-8 shadow-sm">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
              <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Due Diligence Snapshot
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Get comprehensive business intelligence reports in minutes. Analyze company filings, 
            assess financial health, and identify potential risks with AI-powered insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-lg inline-flex mb-3">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Financial Analysis</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Revenue trends, profitability metrics, and financial stability
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-amber-100 dark:bg-amber-900/20 p-2 rounded-lg inline-flex mb-3">
              <Building2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Risk Assessment</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Compliance status, legal issues, and operational risks
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-lg inline-flex mb-3">
              <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Market Position</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Industry analysis, competitive landscape, and growth potential
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="px-8">
                <Building2 className="h-5 w-5 mr-2" />
                Request Snapshot
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

          <Button 
            variant="outline" 
            size="lg" 
            className="px-8 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={() => window.open('/due-diligence', '_self')}
          >
            View All Requests
            <ArrowRight className="h-5 w-5 ml-2 text-gray-900 dark:text-gray-100" />
          </Button>
        </div>

        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          <span className="inline-flex items-center gap-1">
            🚀 <strong>Free tier:</strong> 3 snapshots per month
          </span>
          <span className="mx-2">•</span>
          <span className="inline-flex items-center gap-1">
            ⚡ Typical delivery: ~2 minutes
          </span>
        </div>
      </div>
    </div>
  );
}