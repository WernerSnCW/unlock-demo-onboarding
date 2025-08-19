import { useState, useEffect } from 'react';
import { Check, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import companiesHouse from '@/mocks/companiesHouse.json';

interface CompanyData {
  number: string;
  name: string;
  status: string;
  incorporationDate: string;
  address: string;
}

interface CHAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onCompanySelect: (company: CompanyData | null) => void;
  verifiedCompany?: CompanyData;
  placeholder?: string;
}

export function CHAutocomplete({ 
  value, 
  onChange, 
  onCompanySelect, 
  verifiedCompany,
  placeholder = "Enter company name or number" 
}: CHAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<CompanyData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string>("");

  useEffect(() => {
    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = companiesHouse.filter(company =>
      company.name.toLowerCase().includes(value.toLowerCase()) ||
      company.number.includes(value)
    ).slice(0, 5);

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [value]);

  const handleVerifyCompany = async () => {
    if (!value.trim()) return;

    setIsVerifying(true);
    setVerificationError("");

    // Check if it's a valid 8-digit company number
    const companyNumberRegex = /^\d{8}$/;
    if (companyNumberRegex.test(value)) {
      const found = companiesHouse.find(c => c.number === value);
      if (found) {
        onCompanySelect(found);
      } else {
        setVerificationError("We couldn't verify that company number.");
        onCompanySelect(null);
      }
    } else {
      // Search by name
      const found = companiesHouse.find(c => 
        c.name.toLowerCase() === value.toLowerCase()
      );
      if (found) {
        onCompanySelect(found);
      } else {
        setVerificationError("Company not found. Try using the 8-digit company number.");
        onCompanySelect(null);
      }
    }

    setIsVerifying(false);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (company: CompanyData) => {
    onChange(company.name);
    onCompanySelect(company);
    setShowSuggestions(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                setVerificationError("");
                onCompanySelect(null);
              }}
              placeholder={placeholder}
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            
            {showSuggestions && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {suggestions.map((company) => (
                  <button
                    key={company.number}
                    onClick={() => handleSuggestionClick(company)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <div className="font-medium">{company.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {company.number} • {company.status}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {value && !verifiedCompany && (
            <Button
              type="button"
              onClick={handleVerifyCompany}
              disabled={isVerifying}
              variant="outline"
              size="default"
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              {isVerifying ? "Verifying..." : <><Search className="h-4 w-4 mr-1" />Verify</>}
            </Button>
          )}
        </div>

        {/* Verified Company Block */}
        {verifiedCompany && (
          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-green-800 dark:text-green-200">
                  ✅ Verified: {verifiedCompany.name} ({verifiedCompany.number})
                </div>
                <div className="text-green-700 dark:text-green-300">
                  {verifiedCompany.status} • Incorporated {formatDate(verifiedCompany.incorporationDate)} • {verifiedCompany.address}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verification Error */}
        {verificationError && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {verificationError}
          </p>
        )}
      </div>
    </div>
  );
}