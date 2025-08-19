import { useState } from 'react';
import { Building2, Upload, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CHAutocomplete } from './CHAutocomplete';
import { useDueStore } from '@/state/dueStore';
import { useToast } from '@/hooks/use-toast';

interface CompanyData {
  number: string;
  name: string;
  status: string;
  incorporationDate: string;
  address: string;
}

interface RequestFormData {
  type: 'snapshot' | 'deep_dive';
  company: string;
  companyNumber?: string;
  verifiedCompany?: CompanyData;
  website?: string;
  jurisdiction: string;
  reason: string;
  includeFinancialAnalysis: boolean;
  includeRiskAssessment: boolean;
  includeMarketPosition: boolean;
  includeComplianceCheck: boolean;
  attachments: File[];
  consentGiven: boolean;
}

interface RequestFormProps {
  onSuccess?: (requestId: string) => void;
  className?: string;
}

export function RequestForm({ onSuccess, className }: RequestFormProps) {
  const { toast } = useToast();
  const createRequest = useDueStore(state => state.createRequest);
  
  const [formData, setFormData] = useState<RequestFormData>({
    type: 'snapshot',
    company: "",
    companyNumber: undefined,
    verifiedCompany: undefined,
    website: "",
    jurisdiction: "UK",
    reason: "",
    includeFinancialAnalysis: true,
    includeRiskAssessment: true,
    includeMarketPosition: false,
    includeComplianceCheck: false,
    attachments: [],
    consentGiven: false,
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter((file) =>
      [".pdf", ".pptx", ".docx"].some((ext) =>
        file.name.toLowerCase().endsWith(ext),
      ),
    );

    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid Files",
        description: "Only PDF, PowerPoint, and Word documents are allowed.",
        variant: "destructive",
      });
    }

    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles].slice(0, 3), // Max 3 files
    }));
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.company.trim()) {
      toast({
        title: "Missing Company",
        description: "Please enter a company name or number.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.reason) {
      toast({
        title: "Missing Reason",
        description: "Please select a reason for the request.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.consentGiven) {
      toast({
        title: "Consent Required",
        description: "Please confirm you understand the terms.",
        variant: "destructive",
      });
      return;
    }

    // Create the request
    const requestId = createRequest({
      type: formData.type,
      companyName: formData.verifiedCompany?.name || formData.company,
      companyNumber: formData.verifiedCompany?.number,
      companyUrl: formData.website,
      jurisdiction: formData.jurisdiction,
      requestedBy: "user@unlock", // In real app, get from auth
      sla: formData.type === 'snapshot' ? 'fast' : 'extended',
      inputs: {
        reason: formData.reason,
        includeFinancialAnalysis: formData.includeFinancialAnalysis,
        includeRiskAssessment: formData.includeRiskAssessment,
        includeMarketPosition: formData.includeMarketPosition,
        includeComplianceCheck: formData.includeComplianceCheck,
        attachments: formData.attachments.map(f => f.name),
      }
    });

    // Show success message
    toast({
      title: `${formData.type === 'snapshot' ? 'Snapshot' : 'Deep Dive'} Request Submitted`,
      description: `${formData.type === 'snapshot' ? 'Due diligence snapshot' : 'Deep dive analysis'} request for ${formData.verifiedCompany?.name || formData.company} has been successfully submitted.`,
    });

    // Reset form
    setFormData({
      type: 'snapshot',
      company: "",
      companyNumber: undefined,
      verifiedCompany: undefined,
      website: "",
      jurisdiction: "UK",
      reason: "",
      includeFinancialAnalysis: true,
      includeRiskAssessment: true,
      includeMarketPosition: false,
      includeComplianceCheck: false,
      attachments: [],
      consentGiven: false,
    });

    onSuccess?.(requestId);
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Request Type Tabs */}
        <Tabs value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as 'snapshot' | 'deep_dive' }))}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="snapshot">Snapshot (Free)</TabsTrigger>
            <TabsTrigger value="deep_dive">
              <div className="flex items-center gap-1">
                Deep Dive
                <Lock className="h-3 w-3" />
              </div>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="deep_dive" className="mt-2">
            <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3">
              <strong>Premium feature.</strong> Simulated in prototype; requires subscription in production.
            </div>
          </TabsContent>
        </Tabs>

        {/* Company Field */}
        <div className="space-y-2">
          <Label htmlFor="company" className="text-gray-900 dark:text-gray-100 font-medium">
            Company <span className="text-red-500">*</span>
          </Label>
          <CHAutocomplete
            value={formData.company}
            onChange={(value) => setFormData(prev => ({ ...prev, company: value }))}
            onCompanySelect={(company) => setFormData(prev => ({
              ...prev,
              verifiedCompany: company || undefined,
              companyNumber: company?.number
            }))}
            verifiedCompany={formData.verifiedCompany}
            placeholder="Enter company name or 8-digit number"
          />
        </div>

        {/* Website Field */}
        <div className="space-y-2">
          <Label htmlFor="website" className="text-gray-900 dark:text-gray-100 font-medium">
            Company Website (optional)
          </Label>
          <Input
            id="website"
            type="url"
            value={formData.website}
            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
            placeholder="https://example.com"
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Jurisdiction and Reason */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="jurisdiction" className="text-gray-900 dark:text-gray-100 font-medium">
              Jurisdiction
            </Label>
            <Select value={formData.jurisdiction} onValueChange={(value) => setFormData(prev => ({ ...prev, jurisdiction: value }))}>
              <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="UK" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">United Kingdom</SelectItem>
                <SelectItem value="US" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">United States</SelectItem>
                <SelectItem value="EU" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">European Union</SelectItem>
                <SelectItem value="CA" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">Canada</SelectItem>
                <SelectItem value="AU" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">Australia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-gray-900 dark:text-gray-100 font-medium">
              Reason <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.reason} onValueChange={(value) => setFormData(prev => ({ ...prev, reason: value }))}>
              <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="initial" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">Initial screening</SelectItem>
                <SelectItem value="followup" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">Follow-up diligence</SelectItem>
                <SelectItem value="monitoring" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">Portfolio monitoring</SelectItem>
                <SelectItem value="other" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Include Checks */}
        <div className="space-y-3">
          <Label className="text-gray-900 dark:text-gray-100 font-medium">
            Include Checks
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="financial-analysis"
                checked={formData.includeFinancialAnalysis}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeFinancialAnalysis: !!checked }))}
              />
              <Label htmlFor="financial-analysis" className="text-sm font-normal text-gray-700 dark:text-gray-300">Financial Analysis</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="risk-assessment"
                checked={formData.includeRiskAssessment}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeRiskAssessment: !!checked }))}
              />
              <Label htmlFor="risk-assessment" className="text-sm font-normal text-gray-700 dark:text-gray-300">Risk Assessment</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="market-position"
                checked={formData.includeMarketPosition}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeMarketPosition: !!checked }))}
              />
              <Label htmlFor="market-position" className="text-sm font-normal text-gray-700 dark:text-gray-300">Market Position</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="compliance-check"
                checked={formData.includeComplianceCheck}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeComplianceCheck: !!checked }))}
              />
              <Label htmlFor="compliance-check" className="text-sm font-normal text-gray-700 dark:text-gray-300">Compliance Check</Label>
            </div>
          </div>

          {/* Deep Dive only checks (disabled in prototype) */}
          {formData.type === 'deep_dive' && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-md">
              <Label className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 block">
                Deep Dive Only (Premium)
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center space-x-2 opacity-50">
                  <Checkbox disabled />
                  <Label className="text-sm font-normal text-gray-500 dark:text-gray-400">Adverse media</Label>
                </div>
                <div className="flex items-center space-x-2 opacity-50">
                  <Checkbox disabled />
                  <Label className="text-sm font-normal text-gray-500 dark:text-gray-400">Beneficial ownership</Label>
                </div>
                <div className="flex items-center space-x-2 opacity-50">
                  <Checkbox disabled />
                  <Label className="text-sm font-normal text-gray-500 dark:text-gray-400">Credit events</Label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* File Attachments */}
        <div className="space-y-3">
          <Label className="text-gray-900 dark:text-gray-100 font-medium">
            Attachments (optional)
          </Label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
            <input
              type="file"
              multiple
              accept=".pdf,.pptx,.docx"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <Label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Upload pitch deck or brief (PDF, PowerPoint, Word)
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Maximum 3 files
              </span>
            </Label>
          </div>
          
          {formData.attachments.length > 0 && (
            <div className="space-y-2">
              {formData.attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Consent */}
        <div className="flex items-start space-x-2">
          <Checkbox
            id="consent"
            checked={formData.consentGiven}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, consentGiven: !!checked }))}
            className="mt-1"
          />
          <div className="space-y-1">
            <Label htmlFor="consent" className="text-sm font-normal text-gray-700 dark:text-gray-300">
              Public data only. This is not financial advice. <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Snapshots use only publicly available data. This is not financial advice.
            </p>
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--primary-foreground)]"
        >
          {formData.type === 'snapshot' ? 'Request Snapshot' : 'Request Deep Dive'}
        </Button>
      </form>
    </div>
  );
}