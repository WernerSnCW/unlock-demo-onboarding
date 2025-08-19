import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Check, Upload, X, Building2, ExternalLink } from "lucide-react";

interface DDSnapshotHeroProps {
  onToolOpen?: (toolId: string) => void;
}

interface CompanyData {
  number: string;
  name: string;
  status: string;
  incorporationDate: string;
  address: string;
}

interface SnapshotRequest {
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

export default function DDSnapshotHero({ onToolOpen }: DDSnapshotHeroProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const { toast } = useToast();

  const [formData, setFormData] = useState<SnapshotRequest>({
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

  const companiesHouseRegex = /^\d{8}$/;

  const handleCompanyInput = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      company: value,
      verifiedCompany: undefined,
    }));
    setVerificationError("");

    // Check if it matches Companies House pattern
    if (companiesHouseRegex.test(value)) {
      setFormData((prev) => ({ ...prev, companyNumber: value }));
    } else {
      setFormData((prev) => ({ ...prev, companyNumber: undefined }));
    }
  };

  const handleVerifyCompany = async () => {
    if (!formData.companyNumber) return;

    setIsVerifying(true);
    setVerificationError("");

    try {
      // Mock API call to Companies House - import the data directly
      const { default: companies }: { default: CompanyData[] } = await import(
        "../mocks/companiesHouse.json"
      );
      const found = companies.find((c) => c.number === formData.companyNumber);

      if (found) {
        setFormData((prev) => ({
          ...prev,
          verifiedCompany: found,
          company: found.name,
        }));
        toast({
          title: "Company Verified",
          description: `Found ${found.name} in Companies House register`,
        });
      } else {
        setVerificationError("We couldn't verify that company number.");
      }
    } catch (error) {
      setVerificationError("Error verifying company number.");
    } finally {
      setIsVerifying(false);
    }
  };

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
        description: "Please select a reason for the snapshot.",
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

    // Log telemetry
    console.log({
      event: "dd_snapshot_requested",
      company: formData.company,
      verified: !!formData.verifiedCompany,
      source: "detailed_form",
    });

    // Open the DD Snapshot tool with context
    onToolOpen?.("dd_snapshot");

    // Show confirmation
    toast({
      title: "Snapshot Request Queued",
      description: `Request queued for ${formData.verifiedCompany?.name || formData.company}`,
    });

    // Reset form and close
    setFormData({
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
    setIsFormOpen(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="bg-[var(--primary)] border border-[var(--primary)] rounded-2xl p-6 mb-6 shadow-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[var(--primary-foreground)] mb-2">
          Request a Due Diligence Snapshot
        </h2>
        <p className="text-[var(--primary-foreground)]/80">
          Get comprehensive business intelligence and risk analysis in seconds
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="flex-1 bg-white text-[var(--primary)] font-semibold hover:bg-gray-50 shadow-sm hover:shadow-md">
              Request Detailed Snapshot
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Building2 className="h-5 w-5" />
                Request Due Diligence Snapshot
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="company"
                  className="text-gray-900 dark:text-gray-100 font-medium"
                >
                  Company *
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleCompanyInput(e.target.value)}
                    placeholder="Company name or 8-digit Companies House number"
                    className="flex-1"
                  />
                  {formData.companyNumber && !formData.verifiedCompany && (
                    <Button
                      type="button"
                      onClick={handleVerifyCompany}
                      disabled={isVerifying}
                      variant="outline"
                    >
                      {isVerifying ? "Verifying..." : "Verify"}
                    </Button>
                  )}
                </div>

                {/* Verified Company Block */}
                {formData.verifiedCompany && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <div className="font-medium text-green-800 dark:text-green-200">
                          Verified: {formData.verifiedCompany.name} (
                          {formData.verifiedCompany.number})
                        </div>
                        <div className="text-green-700 dark:text-green-300">
                          {formData.verifiedCompany.status} • Incorporated{" "}
                          {formatDate(
                            formData.verifiedCompany.incorporationDate,
                          )}{" "}
                          • {formData.verifiedCompany.address}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Verification Error */}
                {verificationError && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {verificationError}
                  </p>
                )}
              </div>

              {/* Website Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="website"
                  className="text-gray-900 dark:text-gray-100 font-medium"
                >
                  Company Website (optional)
                </Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      website: e.target.value,
                    }))
                  }
                  placeholder="https://example.com"
                />
              </div>

              {/* Jurisdiction and Reason */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="jurisdiction"
                    className="text-gray-900 dark:text-gray-100 font-medium"
                  >
                    Jurisdiction
                  </Label>
                  <Select
                    value={formData.jurisdiction}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, jurisdiction: value }))
                    }
                  >
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
                  <Label
                    htmlFor="reason"
                    className="text-gray-900 dark:text-gray-100 font-medium"
                  >
                    Reason for Snapshot *
                  </Label>
                  <Select
                    value={formData.reason}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, reason: value }))
                    }
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <SelectItem value="initial" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">Initial screening</SelectItem>
                      <SelectItem value="followup" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">
                        Follow-up diligence
                      </SelectItem>
                      <SelectItem value="monitoring" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">
                        Portfolio monitoring
                      </SelectItem>
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
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          includeFinancialAnalysis: !!checked,
                        }))
                      }
                    />
                    <Label
                      htmlFor="financial-analysis"
                      className="text-sm font-normal text-gray-700 dark:text-gray-300"
                    >
                      Financial Analysis
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="risk-assessment"
                      checked={formData.includeRiskAssessment}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          includeRiskAssessment: !!checked,
                        }))
                      }
                    />
                    <Label
                      htmlFor="risk-assessment"
                      className="text-sm font-normal text-gray-700 dark:text-gray-300"
                    >
                      Risk Assessment
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="market-position"
                      checked={formData.includeMarketPosition}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          includeMarketPosition: !!checked,
                        }))
                      }
                    />
                    <Label
                      htmlFor="market-position"
                      className="text-sm font-normal text-gray-700 dark:text-gray-300"
                    >
                      Market Position
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="compliance-check"
                      checked={formData.includeComplianceCheck}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          includeComplianceCheck: !!checked,
                        }))
                      }
                    />
                    <Label
                      htmlFor="compliance-check"
                      className="text-sm font-normal text-gray-700 dark:text-gray-300"
                    >
                      Compliance Check
                    </Label>
                  </div>
                </div>
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
                  <Label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Upload pitch deck or brief (PDF, PowerPoint, Word)
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Maximum 3 files
                    </span>
                  </Label>
                </div>

                {/* Attached Files */}
                {formData.attachments.length > 0 && (
                  <div className="space-y-2">
                    {formData.attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                      >
                        <span className="text-sm truncate">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Consent Checkbox */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="consent"
                  checked={formData.consentGiven}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      consentGiven: !!checked,
                    }))
                  }
                />
                <Label
                  htmlFor="consent"
                  className="text-sm font-normal leading-relaxed text-gray-700 dark:text-gray-300"
                >
                  I understand snapshots use only public data and are not
                  financial advice. *
                </Label>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={
                    !formData.consentGiven ||
                    !formData.company ||
                    !formData.reason
                  }
                >
                  Request Snapshot
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Quick Request Button */}
        <Button
          variant="outline"
          className="px-6 bg-white/10 text-[var(--primary-foreground)] border-white/20 hover:bg-white/20"
          onClick={() => {
            // Simple quick request flow
            const company = prompt("Enter company name:");
            if (company) {
              toast({
                title: "Quick Request Queued",
                description: `Snapshot request queued for ${company}`,
              });
              onToolOpen?.("dd_snapshot");
            }
          }}
        >
          Quick Request
        </Button>
      </div>

      <p className="text-sm text-[var(--primary-foreground)]/70 text-center mt-4">
        Snapshots use only publicly available data. This is not financial
        advice.
      </p>

      {/* Quick Stats */}
      <div className="mt-6 pt-4 border-t border-[var(--primary-foreground)]/20">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-[var(--primary-foreground)]">
              1.3M+
            </div>
            <div className="text-xs text-[var(--primary-foreground)]/70">
              Companies
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-[var(--primary-foreground)]">
              3m
            </div>
            <div className="text-xs text-[var(--primary-foreground)]/70">
              Avg. Time
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-[var(--primary-foreground)]">
              99.2%
            </div>
            <div className="text-xs text-[var(--primary-foreground)]/70">
              Accuracy
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
