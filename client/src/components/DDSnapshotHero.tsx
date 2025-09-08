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
    <div className="rounded-lg p-4 shadow-lg text-white" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, hsl(from var(--primary) h s calc(l - 0.1)) 100%)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">
                Request Due Diligence
              </h1>
              <p className="text-xs text-blue-100">
                Get AI-powered business intelligence in minutes
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="px-4 bg-white hover:bg-blue-50 font-semibold" style={{ color: 'var(--primary)' }}>
                  <Building2 className="h-4 w-4 mr-2" />
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
              size="sm"
              className="px-3 bg-transparent border-white/30 text-white hover:bg-white/10"
              onClick={() => window.open('/due-diligence', '_self')}
            >
              View All
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}