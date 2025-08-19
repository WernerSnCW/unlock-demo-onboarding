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
    <div className="rounded-lg p-8 shadow-lg text-white" style={{ background: 'linear-gradient(135deg, #5193B3 0%, #4A8AA3 100%)' }}>
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-3 rounded-full">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-3">
            Request Due Diligence
          </h1>
          
          <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
            Get comprehensive business intelligence reports in minutes. Analyze company filings, 
            assess financial health, and identify potential risks with AI-powered insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
            <div className="bg-green-400 p-3 rounded-full inline-flex mb-4">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-white mb-2 text-lg">Financial Analysis</h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              Revenue trends, profitability metrics, and financial stability assessment
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
            <div className="bg-amber-400 p-3 rounded-full inline-flex mb-4">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-white mb-2 text-lg">Risk Assessment</h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              Compliance status, legal issues, and operational risk evaluation
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
            <div className="bg-purple-400 p-3 rounded-full inline-flex mb-4">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-white mb-2 text-lg">Market Position</h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              Industry analysis, competitive landscape, and growth potential
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="px-8 bg-white hover:bg-blue-50 font-semibold" style={{ color: '#5193B3' }}>
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
            className="px-8 bg-transparent border-white/30 text-white hover:bg-white/10 font-semibold"
            onClick={() => window.open('/due-diligence', '_self')}
          >
            View All Requests
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>

        <div className="mt-6 text-sm text-blue-100">
          <span className="inline-flex items-center gap-1">
            🚀 <strong className="text-white">Free tier:</strong> 3 snapshots per month
          </span>
          <span className="mx-2">•</span>
          <span className="inline-flex items-center gap-1">
            ⚡ <strong className="text-white">Typical delivery:</strong> ~2 minutes
          </span>
        </div>
      </div>
    </div>
  );
}