import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface JoinSyndicateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nominalFee: number;
  onSuccess?: () => void;
}

export function JoinSyndicateModal({ open, onOpenChange, nominalFee, onSuccess }: JoinSyndicateModalProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [shareProfile, setShareProfile] = useState('yes');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!agreedToTerms) {
      toast({
        title: "Terms required",
        description: "Please agree to the terms and conditions to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call delay
    setTimeout(() => {
      // Store requested state in localStorage
      const currentPath = window.location.pathname;
      const syndicateId = currentPath.split('/').pop();
      if (syndicateId) {
        localStorage.setItem(`syndicate_requested_${syndicateId}`, 'true');
      }

      toast({
        title: "Request sent successfully!",
        description: "A coordinator will follow up with you shortly.",
      });

      onOpenChange(false);
      onSuccess?.();
      setIsSubmitting(false);
      
      // Trigger page refresh to show requested state
      window.location.reload();
    }, 1000);
  };

  const handleClose = () => {
    setAgreedToTerms(false);
    setShareProfile('yes');
    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <i className="fas fa-handshake text-[var(--primary)]" aria-hidden="true"></i>
            Join Syndicate
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Fee Summary */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Reservation Fee</span>
              <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                £{nominalFee}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              * No actual payment in this prototype
            </p>
          </div>

          {/* Profile Sharing */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Share my profile with the lead investor?
            </Label>
            <RadioGroup value={shareProfile} onValueChange={setShareProfile}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="share-yes" />
                <Label htmlFor="share-yes" className="text-sm">
                  Yes, share my investor profile to help with qualification
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="share-no" />
                <Label htmlFor="share-no" className="text-sm">
                  No, keep my profile private for now
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="terms" 
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
              />
              <Label htmlFor="terms" className="text-sm leading-relaxed">
                I agree this is a non-binding reservation; no advice provided. 
                I understand this is a community platform for investment discovery only.
              </Label>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <i className="fas fa-exclamation-triangle text-yellow-600 dark:text-yellow-400 mt-0.5" aria-hidden="true"></i>
              <div className="text-sm">
                <p className="font-medium text-yellow-800 dark:text-yellow-400 mb-1">
                  Important Notice
                </p>
                <p className="text-yellow-700 dark:text-yellow-300">
                  This is not financial advice. Community interest is not a recommendation to invest. 
                  Always conduct your own due diligence before making investment decisions.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1"
              onClick={handleSubmit}
              disabled={!agreedToTerms || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i>
                  Processing...
                </>
              ) : (
                <>
                  <i className="fas fa-ticket-alt mr-2" aria-hidden="true"></i>
                  Request Reservation
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}